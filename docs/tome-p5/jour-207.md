# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 207 (6h) : Sécurité Mobile Android & iOS (Architecture Sandbox, Analyse APK/IPA avec MobSF, Frida Hooking & Reverse Engineering avec Jadx)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'évaluation de la sécurité des applications mobiles bancaires Android (APK) et iOS (IPA) : architectures de **Sandboxing**, analyse statique et dynamique automatisée avec **MobSF (Mobile Security Framework)**, décompilation et **Reverse Engineering** de code Java/Kotlin avec **Jadx**, et contournement des protections en temps réel (**SSL Pinning Bypass, Root Detection Bypass**) via l'injection de scripts avec **Frida**.
>
> **Compétences visées :** `SEC-06` (A) — Security Audit Mobile Android/iOS | `SEC-04` (A) — Reverse Engineering & Frida Dynamic Hooking

---

## 1) Module — Architecture Sécurité Mobile & MobSF Analysis (2h)

### 📖 Narration/Intuition

L'application mobile bancaire de la BCC permet aux clients d'effectuer des transferts d'argent directement depuis leur smartphone. Un attaquant qui parvient à modifier ou décompiler le binaire de l'application peut tenter d'extraire des clés d'API secrètes codées en dur, bypasser l'authentification biométrique, ou intercepter des tokens de session.

Android et iOS reposent sur le principe du **Sandboxing** : chaque application s'exécute isolée dans son propre espace utilisateur Linux (Android UID unique) ou conteneur iOS sandboxé sans accès direct aux autres applications ni aux ressources système non autorisées.

### 🔍 Anatomie Technique

**Architecture de Sécurité Android (App Sandboxing) :**

```
┌─────────────────────────────────────────────────────────────┐
│                 APPLICATION MOBILE BCC (APK)                │
│  - Nom de package : cd.bcc.mobilebanking                    │
│  - UID Linux dédié : app_10142                              │
│  - Répertoire privé : /data/data/cd.bcc.mobilebanking/       │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Permissions AndroidManifest.xml)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   ANDROID SYSTEM SERVER                     │
│  - Vérification des permissions au runtime                   │
│  - Isolation processus via SELinux / Seccomp Filters        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   NOYAU LINUX ANDROID                       │
└─────────────────────────────────────────────────────────────┘
```

**Analyse Statique Automatisée avec MobSF (Mobile Security Framework) :**

```bash
# 1. Lancer l'instance MobSF via Docker
docker run -it --rm -p 8000:8000 opensecurity/mobile-security-framework-mobsf:latest

# 2. Transmettre le binaire APK de la BCC pour analyse
# MobSF effectue automatiquement :
#   - Analyse du fichier AndroidManifest.xml (Permissions excessives, Exported Components)
#   - Recherche de secrets / clés API en clair (Hardcoded Keys, AWS Keys, Private Keys)
#   - Analyse des vulnérabilités de code (Insecure Network Config, Weak Cryptography)
#   - Vérification des protections (ASLR, Stack Canaries, ProGuard / R8 Obfuscation)
```

---

## 2) Module — Reverse Engineering avec Jadx & Ghidra (2h)

### 📖 Narration/Intuition

Les applications Android sont principalement développées en Java ou Kotlin et compilées au format **DEX (Dalvik Executable)**. Le format DEX peut être décompilé presque à 100% en code source Java lisible par un humain en utilisant des outils de **Reverse Engineering** comme **Jadx** ou **Bytecode Viewer**.

### 🔍 Anatomie Technique

**Décompilation et Recherche de Secrets avec Jadx-GUI :**

```bash
# Lancer l'interface graphique Jadx pour décompiler l'APK BCC
jadx-gui bcc_mobile_banking.apk
```

**Exemple de Vulnérabilité Découverte dans le Code Source Décompilé (`NetworkConfig.java`) :**

```java
// CODE SOURCE ISSU DE LA DÉCOMPILATION JADX
package cd.bcc.mobilebanking.network;

public class NetworkConfig {
    // 🚨 VULNÉRABILITÉ MAJEURE : Clé d'API et Secret HMAC codés en dur dans le code Java !
    public static final String API_ENDPOINT = "https://api.bcc.cd/v1/";
    public static final String AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE"; // ⚠️ FUITE CLÉ AWS !
    public static final String JWT_SECRET_KEY = "BCC_Secret_Key_Super_p@ss2024!"; // ⚠️ FUITE SECRET !

    // 🚨 VULNÉRABILITÉ 2 : Désactivation totale de la vérification des certificats TLS !
    public static void disableTLSVerification() {
        TrustManager[] trustAllCerts = new TrustManager[]{
            new X509TrustManager() {
                public X509Certificate[] getAcceptedIssuers() { return null; }
                public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                public void checkServerTrusted(X509Certificate[] certs, String authType) {} // ⚠️ Pas de check !
            }
        };
        // Permet l'interception MITM par Burp Suite sans aucun avertissement !
    }
}
```

---

## 3) Module — Frida Dynamic Hooking & SSL Pinning Bypass (2h)

### 📖 Narration/Intuition

Pour se protéger contre les attaques Man-In-The-Middle (MITM), les applications bancaires modernes implémentent le **SSL Pinning** (l'application ne fait confiance qu'à la clé publique exacte du serveur bancaire gravée dans l'application) et la **Root Detection** (refus de s'exécuter sur un smartphone rooté).

**Frida** est un framework d'injection dynamique (Dynamic Instrumentation) qui permet d'injecter des scripts JavaScript dans la mémoire de l'application en cours d'exécution pour modifier la logique des fonctions à la volée (**Hooking**).

### 🛠️ Atelier Pratique

**Script Frida de Bypass du SSL Pinning Android (`frida_ssl_bypass.js`) :**

```javascript
// ════════════════════════════════════════════════════════════
// FRIDA SCRIPT : DYNAMIC SSL PINNING BYPASS (Android OkHttp3)
// ════════════════════════════════════════════════════════════

Java.perform(function () {
    console.log("[+] Injection du script Frida SSL Pinning Bypass...");

    // Hooking de la classe OkHttpClient CertificatePinner
    var CertificatePinner = Java.use("okhttp3.CertificatePinner");

    // Surcharger la méthode check() pour ne RIEN faire (Ignorer l'exception SSL)
    CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function (hostname, peerCertificates) {
        console.log("[+] SSL Pinning Bypass intercepté pour le domaine : " + hostname);
        // Ne pas lever CertificateException -> Le SSL Pinning est contourné !
        return;
    };

    // Hooking de la détection de Root (RootBeer Library Bypass)
    var RootBeer = Java.use("com.scottyab.rootbeer.RootBeer");
    RootBeer.isRooted.implementation = function () {
        console.log("[+] Bypass de la Root Detection (Retourne FALSE)");
        return false; // Forcer l'application à croire que le téléphone n'est PAS rooté
    };
});
```

**Commande d'exécution Frida sur un smartphone Android connecté via ADB :**

```bash
# 1. Démarrer frida-server sur le téléphone Android rooté (via ADB)
adb push frida-server-16.1.0-android-arm64 /data/local/tmp/
adb shell "chmod 755 /data/local/tmp/frida-server && /data/local/tmp/frida-server &"

# 2. Injecter le script Frida dans l'application BCC au démarrage
frida -U -f cd.bcc.mobilebanking -l frida_ssl_bypass.js --no-pause

# Résultat : L'application démarre, le SSL Pinning et la Root Detection sont contournés !
# Burp Suite peut désormais intercepter l'ensemble du trafic HTTPS de l'application !
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **APK** | Android Package Kit — Format de fichier d'installation des applications Android |
| **IPA** | iOS App Store Package — Format d'archive des applications iOS |
| **MobSF** | Mobile Security Framework — Outil automatisé d'analyse statique et dynamique d'apps mobiles |
| **DEX** | Dalvik Executable — Format de fichier de bytecode exécuté par Android Runtime (ART) |
| **SSL Pinning** | Technique forçant une application à ne faire confiance qu'à un certificat TLS spécifique |
| **Frida** | Dynamic Instrumentation Toolkit permettant d'injecter des scripts en mémoire au runtime |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Qu'est-ce que le **SSL Pinning** dans une application mobile bancaire et pourquoi une simple interception HTTPS avec Burp Suite échoue-t-elle si le SSL Pinning est actif ?

**Corrigé :** Par défaut, une application mobile fait confiance à tous les certificats HTTPS émis par n'importe quelle Autorité de Certification (CA) figurant dans le magasin de certificats du système d'exploitation. Si un pentesteur installe le certificat CA de Burp Suite sur le smartphone, l'application accepte le proxy MITM. Le **SSL Pinning** est un contrôle supplémentaire codé dans l'application : l'application ignore le magasin de certificats du téléphone et vérifie cryptographiquement que la clé publique du serveur distant correspond **exactement au hash de clé (Pin)** gravé en dur dans le code de l'application. Si l'attaquant intercepte la connexion avec Burp Suite (dont la clé ne correspond pas au Pin), l'application coupe immédiatement la connexion HTTPS et refuse d'envoyer des données.

**Exercice 2 :** Expliquer le fonctionnement du **Dynamic Hooking** avec **Frida** et comment il permet d'annuler les protections de l'application au runtime.

**Corrigé :** Le **Dynamic Hooking** consiste à intercepter l'exécution d'une fonction logicielle spécifique en mémoire au moment où elle est appelée par le processeur, pour remplacer ou modifier son comportement sans altérer le binaire sur le disque. **Frida** s'injecte dans l'espace mémoire (RAM) du processus de l'application mobile en cours d'exécution. Grâce à son moteur JavaScript-V8, Frida permet de réécrire l'implémentation des méthodes Java/Native (ex: la méthode `CertificatePinner.check()` de la bibliothèque OkHttp ou `RootBeer.isRooted()`). Lorsque l'application appelle la fonction de vérification de sécurité, le hook de Frida s'exécute à la place du code d'origine et retourne immédiatement une valeur de succès (ex: `return false;` pour `isRooted()`), annulant ainsi la protection au runtime.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel framework d'analyse de sécurité mobile open-source (disponible en Docker) permet d'effectuer une analyse statique et dynamique automatisée des fichiers APK Android et IPA iOS ?
- A) MobSF (Mobile Security Framework)
- B) Metasploit
- C) Wireshark
- D) Nmap

**Réponse : A**

**Q2 :** Quel outil GUI open-source est la référence pour décompiler le bytecode DEX des fichiers APK Android en code source Java/Kotlin lisible ?
- A) Jadx
- B) Ghidra
- C) IDA Pro
- D) OllyDbg

**Réponse : A**

**Q3 :** Quel framework d'instrumentation dynamique permet d'injecter des scripts JavaScript dans la mémoire d'une application mobile en cours d'exécution pour contourner le SSL Pinning ou la Root Detection ?
- A) Frida
- B) ADB
- C) Android Studio
- D) Docker

**Réponse : A**

**Q4 :** Dans l'architecture de sécurité Android, quel mécanisme isole chaque application installée dans son propre espace utilisateur Linux (UID dédié) empêchant une application d'accéder aux données privées d'une autre ?
- A) Le Sandboxing Android
- B) Le firewall Windows
- C) Le mode avion
- D) Le système de fichiers NTFS

**Réponse : A**

**Q5 :** Quelle bibliothèque Java Android populaire est couramment ciblée par les scripts Frida pour contourner la détection d'appareils rootés (Root Detection) ?
- A) RootBeer
- B) Retrofit
- C) Gson
- D) Glide

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
