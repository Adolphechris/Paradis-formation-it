# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 254 (6h) : Reverse Engineering Mobile (Android APK Frida Dynamic Instrumentation, Decompilation jadx, iOS Jailbreak & SSL Pinning Bypass)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **pentesting et reverse engineering d'applications mobiles** — une compétence fortement demandée sur le marché global (applis bancaires, e-commerce, santé) : analyser les APK Android avec **jadx** et **apktool**, instrumenter dynamiquement les applications avec **Frida**, contourner le **certificate pinning** et la **root detection**, et effectuer un pentest iOS basique via un device jailbreaké.
>
> **Compétences visées :** `MOB-01` (A) — Android APK Reverse Engineering | `MOB-02` (A) — Frida Dynamic Instrumentation & SSL Pinning Bypass

---

## 1) Module — Analyse Statique des APK Android (jadx & apktool) (1h30)

### 📖 Narration/Intuition

Une application Android est un fichier `.apk` (archive ZIP) contenant du bytecode Dalvik (`.dex`), des ressources et le manifeste. L'analyse statique consiste à **décompiler** ce bytecode pour retrouver le code Java/Kotlin original et identifier les vulnérabilités sans exécuter l'application.

### 🛠️ Atelier Pratique

**Décompilation et analyse statique APK (`apk_static_analysis.sh`) :**

```bash
# ═══════════════════════════════════════════════════════
# Pré-requis : jadx, apktool, aapt
# ═══════════════════════════════════════════════════════
sudo apt install -y apktool aapt
# jadx : https://github.com/skylot/jadx/releases (jar exécutable)

# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Extraction et analyse du manifeste
# ═══════════════════════════════════════════════════════
apktool d target-app.apk -o target-app-decompiled/
cat target-app-decompiled/AndroidManifest.xml | grep -E "android:debuggable|android:allowBackup|android:exported|android:permission|http://"

# Red flags dans le manifeste :
# android:debuggable="true"     → L'app peut être débuggée via ADB
# android:allowBackup="true"    → Les données peuvent être sauvegardées/restaurées via ADB
# android:exported="true"       → Activities/Services accessibles depuis d'autres apps
# URLs http:// en dur           → Communication non chiffrée

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Décompilation Java avec jadx
# ═══════════════════════════════════════════════════════
jadx -d target-app-java/ target-app.apk 2>/dev/null

# Rechercher des secrets codés en dur (hardcoded secrets)
grep -rn "password\|secret\|api_key\|apikey\|token\|AWS_ACCESS\|private_key" \
     target-app-java/ --include="*.java" -i

# Rechercher des URLs hardcodées
grep -rn "http://\|https://" target-app-java/ --include="*.java" | grep -v "schemas.android\|xml"

# Rechercher des usages de stockage non sécurisé
grep -rn "SharedPreferences\|getExternalStorage\|openFileOutput\|SQLiteOpenHelper" \
     target-app-java/ --include="*.java"

# ═══════════════════════════════════════════════════════
# ÉTAPE 3 — Analyse des composants exposés
# ═══════════════════════════════════════════════════════
# Lister les activités exportées
aapt dump xmltree target-app.apk AndroidManifest.xml | grep -A 5 "activity"

# Tester un Intent vers une activité exportée depuis un autre contexte
adb shell am start -n com.target.app/.AdminActivity
```

---

## 2) Module — Frida Dynamic Instrumentation & Root Detection Bypass (2h)

### 📖 Narration/Intuition

**Frida** est le couteau suisse du pentesting mobile : c'est un framework d'instrumentation dynamique qui injecte des scripts JavaScript dans des processus Android/iOS en cours d'exécution. Il permet de hooker des méthodes Java, de modifier des variables en mémoire, de contourner les mécanismes de sécurité (root detection, SSL pinning, biométrie) sans modifier le binaire.

### 🛠️ Atelier Pratique

**Installation Frida et bypass de la root detection (`frida_root_bypass.sh`) :**

```bash
# ═══════════════════════════════════════════════════════
# Installation Frida (Host Machine)
# ═══════════════════════════════════════════════════════
pip install frida-tools frida
frida --version  # Ex: 16.2.1

# ═══════════════════════════════════════════════════════
# Déploiement frida-server sur le device Android (root)
# ═══════════════════════════════════════════════════════
# Télécharger la version correspondante sur https://github.com/frida/frida/releases
adb push frida-server-16.2.1-android-arm64 /data/local/tmp/frida-server
adb shell "chmod 755 /data/local/tmp/frida-server && /data/local/tmp/frida-server &"

# Vérifier la connexion
frida-ps -U | grep target

# ═══════════════════════════════════════════════════════
# Script Frida — Bypass Root Detection Android (Java)
# ═══════════════════════════════════════════════════════
```

```javascript
// frida_root_bypass.js
// Hook des méthodes communes de détection root
Java.perform(function() {

    // 1) Bypass RootBeer / Custom root check via RootManager
    var RootBeer = Java.use('com.scottyab.rootbeer.RootBeer');
    RootBeer.isRooted.overload().implementation = function() {
        console.log("[*] RootBeer.isRooted() hookée → retourne false");
        return false;
    };

    // 2) Bypass via System Properties (su binary detection)
    var Build = Java.use('android.os.Build');
    Build.TAGS.value = "release-keys";

    // 3) Bypass via File.exists() pour les chemins /su, /system/xbin/su
    var File = Java.use('java.io.File');
    File.exists.implementation = function() {
        var path = this.getAbsolutePath();
        if (path.indexOf("su") !== -1 || path.indexOf("Superuser") !== -1 ||
            path.indexOf("Magisk") !== -1) {
            console.log("[*] File.exists() bypass pour : " + path);
            return false;
        }
        return this.exists();
    };

    console.log("[+] Root Detection Bypass activé via Frida");
});
```

```bash
# Lancer le bypass
frida -U -f com.target.app -l frida_root_bypass.js --no-pause
```

---

## 3) Module — SSL Pinning Bypass & Interception Traffic Mobile (2h30)

### 📖 Narration/Intuition

Le **certificate pinning** (épinglage de certificat) est un mécanisme défensif qui empêche les applications mobiles d'accepter n'importe quel certificat TLS — même de confiance — pour ses communications. L'application ne fait confiance qu'à un certificat ou une clé publique spécifique. Cela bloque Burp Suite et les proxies MitM classiques.

### 🛠️ Atelier Pratique

**SSL Pinning Bypass universel avec Frida (`ssl_pinning_bypass.js`) :**

```javascript
// ssl_pinning_bypass.js — Bypass SSL Pinning Android (OkHttp3, TrustManager)
// Source : https://github.com/WoWoX/frida-android-unpinning (adapté)

Java.perform(function() {

    // ═══════════════════════════════════════════════════════
    // MÉTHODE 1 — Bypass via TrustManager personnalisé
    // ═══════════════════════════════════════════════════════
    var TrustManager = Java.registerClass({
        name: 'com.paradis.bypass.TrustAllManager',
        implements: [Java.use('javax.net.ssl.X509TrustManager')],
        methods: {
            checkClientTrusted: function(chain, authType) {},
            checkServerTrusted: function(chain, authType) {},
            getAcceptedIssuers: function() { return []; }
        }
    });

    var SSLContext = Java.use('javax.net.ssl.SSLContext');
    SSLContext.init.overload('[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom').implementation = function(km, tm, sr) {
        console.log('[*] SSLContext.init() — Injection TrustManager bypass');
        var bypassTm = [TrustManager.$new()];
        this.init(km, bypassTm, sr);
    };

    // ═══════════════════════════════════════════════════════
    // MÉTHODE 2 — Bypass OkHttp3 CertificatePinner
    // ═══════════════════════════════════════════════════════
    try {
        var CertificatePinner = Java.use('okhttp3.CertificatePinner');
        CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function(hostname, peerCertificates) {
            console.log('[*] OkHttp3 CertificatePinner.check() bypassée pour : ' + hostname);
            return;  // Ne pas lever d'exception → bypass complet
        };
        console.log('[+] OkHttp3 SSL Pinning bypass activé');
    } catch(e) {
        console.log('[-] OkHttp3 non trouvé : ' + e);
    }

    // ═══════════════════════════════════════════════════════
    // MÉTHODE 3 — Bypass via Conscrypt (Android Network Security Config)
    // ═══════════════════════════════════════════════════════
    try {
        var NetworkSecurityPolicy = Java.use('android.security.NetworkSecurityPolicy');
        NetworkSecurityPolicy.getInstance.implementation = function() {
            var policy = this.getInstance();
            policy.isCleartextTrafficPermitted.overload('java.lang.String').implementation = function(hostname) {
                console.log('[*] CleartextTrafficPermitted = true pour : ' + hostname);
                return true;
            };
            return policy;
        };
    } catch(e) {}

    console.log('[+] SSL Pinning Bypass complet activé — Configurez Burp comme proxy (127.0.0.1:8080)');
});
```

```bash
# Lancer le bypass SSL et intercepter avec Burp Suite
frida -U -f com.target.app -l ssl_pinning_bypass.js --no-pause

# Configurer le proxy Burp sur le device Android
# Settings → WiFi → Advanced → Proxy → Host: 127.0.0.1, Port: 8080
# Importer le certificat Burp CA dans les certificats système du device rooté
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **APK** | Android Package Kit — Format d'installation des applications Android |
| **jadx** | Java Decompiler for Android — Décompilateur APK/Dex vers Java open-source |
| **Frida** | Dynamic instrumentation toolkit — Framework d'injection de scripts JS dans les processus |
| **ADB** | Android Debug Bridge — Interface de communication host↔device Android |
| **SSL Pinning** | Certificate Pinning — Mécanisme d'épinglage de certificat TLS anti-MitM |
| **OkHttp3** | Bibliothèque HTTP Android/Java de Square — Implémente son propre CertificatePinner |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle propriété du fichier `AndroidManifest.xml` signale qu'une application Android peut être débuggée par ADB depuis un device non-root, représentant un risque de sécurité critique en production ?
- A) `android:debuggable="true"` — Permet de s'attacher au process avec jdb/Frida sans root
- B) `android:exported="true"`
- C) `android:allowBackup="true"`
- D) `android:testOnly="true"`

**Réponse : A**

**Q2 :** Comment Frida injecte-t-il des scripts JavaScript dans un processus Android cible ?
- A) Via un serveur `frida-server` exécuté avec les droits root sur le device, qui expose une API ptrace permettant l'injection dans n'importe quel processus
- B) En recompilant l'APK avec du code modifié
- C) Via un hook au niveau du kernel Linux
- D) En exploitant une vulnérabilité Stagefright

**Réponse : A**

**Q3 :** Quel outil (combinaison de jadx + Frida) constitue la stack standard pour le pentesting d'applications mobiles Android selon l'OWASP Mobile Security Testing Guide (MSTG) ?
- A) **jadx** pour l'analyse statique (décompilation APK → Java) + **Frida** pour l'analyse dynamique (runtime hooking, bypass SSL pinning/root detection) + **Burp Suite** pour l'interception HTTP
- B) Nmap + Metasploit + Wireshark
- C) Ghidra + GDB + LLDB
- D) Radare2 + pwntools + angr

**Réponse : A**

**Q4 :** Dans un script Frida de bypass SSL Pinning pour OkHttp3, quelle méthode est hookée pour neutraliser la vérification du certificat épinglé ?
- A) `CertificatePinner.check()` — En remplaçant son implementation pour ne rien faire (return sans lever d'exception)
- B) `SSLSocket.connect()`
- C) `HttpsURLConnection.setSSLSocketFactory()`
- D) `TrustManager.getAcceptedIssuers()`

**Réponse : A**

**Q5 :** Quel outil OWASP fournit un guide de test de sécurité mobile exhaustif couvrant Android et iOS, utilisé comme référence par les Bug Bounty Programs et les entreprises pour leurs audits mobiles ?
- A) OWASP MASTG (Mobile Application Security Testing Guide) — anciennement MSTG, complété par le MASVS
- B) OWASP ASVS
- C) OWASP SAMM
- D) OWASP WSTG

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
