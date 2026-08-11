# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 542 (6h) : Sécurité des Applications Mobiles : OWASP Mobile Top 10, Android & iOS Security

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser l'**OWASP Mobile Application Security Verification Standard (MASVS)** et les **10 vulnérabilités mobiles** les plus critiques
> - Comprendre les architectures de sécurité des plateformes **Android (Binder IPC, SELinux, Keystore)** et **iOS (Secure Enclave, Data Protection API, App Sandbox)**
> - Réaliser un **test de sécurité d'application mobile** (analyse statique avec MobSF, analyse dynamique avec Frida)
> - Implémenter les contre-mesures : **Certificate Pinning**, **Root/Jailbreak Detection**, **Secure Storage** (Keystore Android / Keychain iOS)
>
> **Compétences visées :** `SEC-03` (A), `DEV-01` (A) — Mobile Security, MASVS

---

## Module 1 — OWASP Mobile Top 10 & Architecture de Sécurité (2h)

### 📖 Intuition & Narration

Un smartphone moderne est un ordinateur de poche extrêmement puissant, mais il est également un vecteur d'attaque particulièrement intéressant : il contient des données biométriques, des jetons d'authentification bancaire, des messages privés, des positions GPS précises. Il vit dans la poche de son propriétaire, parfois sans protection physique, et se connecte à des réseaux Wi-Fi inconnus.

La sécurisation des applications mobiles est différente de la sécurisation des applications web : l'attaquant peut avoir **un accès physique au dispositif**, peut **modifier le binaire de l'application**, peut **intercepter le trafic réseau** sur un Wi-Fi public, et peut **rooter ou jailbreaker** le téléphone pour désactiver les protections de la plateforme.

### 🔍 OWASP Mobile Top 10 (2024)

| Rang | Catégorie | Exemple concret |
|:---:|:---|:---|
| **M1** | Mauvaise utilisation des credentials | Token API hardcodé dans le code source |
| **M2** | Insuffisance de la gestion des accès | API backend ne vérifiant pas les droits (IDOR) |
| **M3** | Mauvaise authentification | Absence de Certificate Pinning → MITM possible |
| **M4** | Validation insuffisante des inputs | Injection SQL via champ de formulaire mobile |
| **M5** | Communications non sécurisées | Transmission HTTP sans TLS |
| **M6** | Contrôle d'autorisation inadéquat | Accès aux fichiers d'autres apps via Android Intent |
| **M7** | Failles cryptographiques | AES-ECB, clés hardcodées dans SharedPreferences |
| **M8** | Falsification | Absence de détection de débogueur ou d'émulateur |
| **M9** | Stockage de données non sécurisé | Tokens JWT dans les logs Android (`Log.d()`) |
| **M10** | Insuffisance de la journalisation binaire | Binaire non protégé → reverse engineering trivial |

---

## Module 2 — Tests de Sécurité Mobile : MobSF & Frida (2h)

### 🔍 MobSF — Analyse Statique d'Application Mobile

**MobSF (Mobile Security Framework)** est un outil d'analyse automatisée d'applications Android (APK) et iOS (IPA). Il effectue une analyse statique du code source décompilé et une analyse dynamique en émulateur.

```bash
#!/bin/bash
# ============================================================
# PARADIS — Déploiement de MobSF pour audit d'APK
# ============================================================

# Installer MobSF via Docker
docker pull opensecurity/mobile-security-framework-mobsf:latest
docker run -it --rm \
  -p 8000:8000 \
  -p 1337:1337 \
  --name mobsf \
  opensecurity/mobile-security-framework-mobsf:latest

echo "[*] MobSF disponible sur http://localhost:8000"
echo "[*] Uploader l'APK via l'interface web pour lancer l'analyse."
```

### 🛠️ Frida — Analyse Dynamique & Hooking de Runtime

**Frida** est un framework d'instrumentation dynamique permettant d'injecter des scripts JavaScript dans une application mobile en cours d'exécution. Il permet de contourner le Certificate Pinning, d'intercepter les appels de fonctions de chiffrement, et d'extraire les clés en mémoire.

```python
#!/usr/bin/env python3
"""
PARADIS — Frida Script : Bypass du Certificate Pinning Android
Ce script Frida désactive la validation du certificat SSL d'une application Android.
À des fins éducatives uniquement — dans un contexte de test de sécurité autorisé.
"""

import frida
import sys

SCRIPT_BYPASS_PINNING = """
Java.perform(function () {
    console.log("[*] Démarrage du bypass Certificate Pinning...");

    // Cible 1 : TrustManager personnalisé (OkHttp)
    try {
        var OkHttpClient = Java.use("okhttp3.OkHttpClient");
        var CertificatePinner = Java.use("okhttp3.CertificatePinner");
        CertificatePinner.check.overload("java.lang.String", "java.util.List").implementation = function(hostname, peerCertificates) {
            console.log("[+] CertificatePinner.check() intercepté pour : " + hostname + " — BYPASS !");
            return;  // Ne rien vérifier = accepter tous les certificats
        };
    } catch(e) { console.log("[-] OkHttp CertificatePinner non trouvé."); }

    // Cible 2 : TrustManager Android natif
    try {
        var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
        TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
            console.log("[+] TrustManagerImpl.verifyChain() intercepté — BYPASS SSL complet !");
            return untrustedChain;
        };
    } catch(e) { console.log("[-] TrustManagerImpl non trouvé."); }

    console.log("[✅] Certificate Pinning désactivé. Trafic interceptable via Burp Suite.");
});
"""

def on_message(message, data):
    if message["type"] == "send":
        print(f"[FRIDA] {message['payload']}")
    elif message["type"] == "error":
        print(f"[ERREUR] {message['stack']}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 frida_bypass.py <package_name>")
        print("Exemple: python3 frida_bypass.py com.paradis.banking")
        sys.exit(1)

    package = sys.argv[1]
    print(f"[*] Injection Frida dans : {package}")
    try:
        device = frida.get_usb_device(timeout=5)
        pid = device.spawn([package])
        session = device.attach(pid)
        script = session.create_script(SCRIPT_BYPASS_PINNING)
        script.on("message", on_message)
        script.load()
        device.resume(pid)
        print(f"[✅] Script Frida injecté. Utiliser Burp Suite pour intercepter le trafic.")
        input("[*] Appuyer sur Entrée pour terminer...")
        session.detach()
    except frida.ServerNotStartingError:
        print("[DEMO MODE] Frida server non détecté. Ceci est une démonstration du script.")
        print("[INFO] Pour utiliser en conditions réelles : frida-server sur device Android rooté.")
```

---

## Module 3 — Contre-Mesures : Stockage Sécurisé & Root Detection (1h30)

### 🔍 Implémentation du Stockage Sécurisé — Android Keystore System

```kotlin
// PARADIS — Android Keystore : Génération et utilisation d'une clé AES-256 sécurisée
// La clé est générée dans le Keystore Android (hardware-backed sur les appareils récents)
// Elle ne peut jamais être exportée en dehors du Keystore.

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import java.security.KeyStore
import android.util.Base64

class ParadisSecureStorage {
    companion object {
        private const val KEYSTORE_PROVIDER = "AndroidKeyStore"
        private const val KEY_ALIAS = "paradis_app_key_v1"
        private const val TRANSFORMATION = "AES/GCM/NoPadding"
    }

    init {
        generateKeyIfNeeded()
    }

    private fun generateKeyIfNeeded() {
        val keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER)
        keyStore.load(null)
        if (!keyStore.containsAlias(KEY_ALIAS)) {
            val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE_PROVIDER)
            keyGenerator.init(
                KeyGenParameterSpec.Builder(KEY_ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                    .setKeySize(256)
                    .setUserAuthenticationRequired(true)  // Biométrie obligatoire pour accéder à la clé
                    .build()
            )
            keyGenerator.generateKey()
        }
    }

    fun encryptData(plaintext: String): String {
        val keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER)
        keyStore.load(null)
        val secretKey = keyStore.getKey(KEY_ALIAS, null) as SecretKey
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, secretKey)
        val iv = cipher.iv
        val ciphertext = cipher.doFinal(plaintext.toByteArray(Charsets.UTF_8))
        return Base64.encodeToString(iv + ciphertext, Base64.DEFAULT)
    }
}
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MASVS** | Mobile Application Security Verification Standard — Référentiel OWASP pour la sécurité des applications mobiles |
| **APK** | Android Package Kit — Format de fichier d'installation des applications Android |
| **IPA** | iOS App Archive — Format de fichier d'installation des applications iOS |
| **Frida** | Framework d'instrumentation dynamique open-source permettant d'injecter du JavaScript dans des processus natifs |
| **Certificate Pinning** | Technique consistant à vérifier que le certificat TLS présenté par le serveur correspond à une empreinte hardcodée dans l'application |

---

## Exercices Pratiques

### Exercice 1 — Analyse d'une Configuration de Stockage Vulnérable

Identifiez les vulnérabilités OWASP Mobile dans le code Android suivant et proposez les corrections :

```kotlin
// Code vulnérable à analyser
val prefs = getSharedPreferences("app_config", MODE_WORLD_READABLE)
val editor = prefs.edit()
editor.putString("user_token", "eyJhbGciOiJSUzI1NiJ9...")
editor.putString("api_key", "sk-prod-ABCDEF123456")
editor.apply()
Log.d("AUTH", "Token stored for user: ${userToken}")
```

**Corrigé guidé :**
1. **M9 — Stockage non sécurisé** : `SharedPreferences` avec `MODE_WORLD_READABLE` rend les données lisibles par toutes les apps du device (rooté). → Utiliser `MODE_PRIVATE` ou **Android Keystore**.
2. **M9 — Données sensibles dans les logs** : `Log.d()` enregistre le token dans les logs Android, accessibles via `adb logcat` par toute app avec la permission `READ_LOGS`. → Supprimer tous les logs en production.
3. **M1 — Credential hardcodé** : `api_key = "sk-prod-ABCDEF123456"` hardcodé dans le code source → visible après décompilation APK. → Récupérer dynamiquement depuis un serveur sécurisé au runtime.

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce que le **Certificate Pinning** dans une application mobile ?

- A) L'ajout d'une icône d'épingle sur l'écran d'accueil.
- B) Une technique où l'application mobile vérifie que le certificat TLS présenté par le serveur correspond exactement à un certificat ou une clé publique hardcodé dans l'application, empêchant les attaques MITM même si l'attaquant a installé un certificat de confiance sur le téléphone. ✅
- C) L'épinglage d'une application dans la barre de tâches.
- D) Un mécanisme de blocage d'écran.

**Q2.** Pourquoi stocker un token JWT dans `SharedPreferences` avec `MODE_WORLD_READABLE` est-il une vulnérabilité **OWASP M9** ?

- A) Les SharedPreferences ne peuvent pas stocker des chaînes de caractères longues.
- B) Le fichier SharedPreferences devient lisible par n'importe quelle application installée sur un appareil rooté, exposant le token à d'autres applications malveillantes. ✅
- C) Les tokens JWT expirent trop vite.
- D) SharedPreferences est trop lent pour stocker des tokens.

**Q3.** **Frida** est utilisé dans les tests de sécurité mobile pour :

- A) Scanner les ports ouverts sur le serveur backend de l'application.
- B) Injecter des scripts dans une application mobile en cours d'exécution pour intercepter les appels de fonctions, modifier le comportement de l'application (ex: bypass Certificate Pinning) ou extraire des données en mémoire. ✅
- C) Générer des rapports de conformité RGPD.
- D) Chiffrer les communications réseau de l'application.

**Q4.** Quel est l'avantage principal de l'**Android Keystore System** pour stocker des clés cryptographiques ?

- A) Les clés peuvent être exportées et sauvegardées sur un serveur distant.
- B) Les clés sont générées et stockées dans un enclave matérielle (TEE/Secure Element) et ne peuvent jamais être exportées en dehors du Keystore, même si le dispositif est rooté. ✅
- C) Le Keystore compresse les clés pour économiser de l'espace disque.
- D) Les clés sont automatiquement partagées entre toutes les applications.

**Q5.** Quelle vulnérabilité **OWASP Mobile** correspond au fait de hardcoder une clé API dans le code source d'une application mobile ?

- A) M5 — Communications non sécurisées
- B) M9 — Stockage de données non sécurisé
- C) M1 — Mauvaise utilisation des credentials ✅
- D) M8 — Falsification

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
