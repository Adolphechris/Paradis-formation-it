# TOME P2 — Réseaux & Télécoms — Jour 72 (6h) : APIs REST & Sécurité des Web Services

> [!NOTE]
> **Objectif du jour :** Comprendre la conception et la sécurité des APIs REST : méthodes HTTP, codes de statut, authentification JWT, CORS, rate limiting, et les vulnérabilités spécifiques aux APIs (OWASP API Security Top 10). Contexte BCC : APIs interbancaires et portails d'authentification.
>
> **Compétences visées :** `SEC-05` (A) — Sécurité des APIs | `BIT-06` (A) — Développement Web

---

## 1) Module — Architecture REST & Protocole HTTP (2h)

### 📖 Narration/Intuition

Les **APIs REST** (Representational State Transfer) sont le langage universel des services modernes. La BCC expose des APIs pour les virements interbancaires, l'accès aux données de réserves, et l'authentification des systèmes partenaires. Chaque API est une surface d'attaque potentielle qui doit être sécurisée.

### 🔍 Anatomie Technique

**Méthodes HTTP & Sémantique REST :**

```
Ressource : /api/v1/comptes

GET    /api/v1/comptes           → Lister tous les comptes
GET    /api/v1/comptes/123       → Obtenir le compte #123
POST   /api/v1/comptes           → Créer un nouveau compte
PUT    /api/v1/comptes/123       → Remplacer le compte #123 (complet)
PATCH  /api/v1/comptes/123       → Modifier partiellement le compte #123
DELETE /api/v1/comptes/123       → Supprimer le compte #123

Codes de statut HTTP :
200 OK              → Succès avec corps de réponse
201 Created         → Ressource créée avec succès (après POST)
204 No Content      → Succès sans corps (après DELETE)
400 Bad Request     → Données invalides dans la requête
401 Unauthorized    → Non authentifié (token manquant/expiré)
403 Forbidden       → Authentifié mais non autorisé (droits insuffisants)
404 Not Found       → Ressource introuvable
409 Conflict        → Conflit (ex : email déjà utilisé)
422 Unprocessable   → Validation des données échouée
429 Too Many Req.   → Rate limit dépassé
500 Internal Error  → Erreur serveur interne
503 Unavailable     → Service temporairement indisponible
```

**API REST Flask — Exemple structuré :**

```python
#!/usr/bin/env python3
"""API REST BCC — Gestion des Comptes (exemple pédagogique)"""
from flask import Flask, request, jsonify, g
from functools import wraps
import jwt
import datetime
import sqlite3

app = Flask(__name__)
SECRET_KEY = "bcc-secret-2024-très-long-et-aléatoire"  # En prod : depuis les variables d'environnement

# ─── Middleware d'authentification JWT ─────────────────────────────────────────
def token_requis(f):
    """Décorateur : vérifie le token JWT avant d'exécuter la fonction."""
    @wraps(f)
    def decorateur(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({"erreur": "Token manquant"}), 401
        
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            g.user_id = payload['sub']
            g.role = payload.get('role', 'client')
        except jwt.ExpiredSignatureError:
            return jsonify({"erreur": "Token expiré"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"erreur": "Token invalide"}), 401
        
        return f(*args, **kwargs)
    return decorateur

# ─── Endpoints ─────────────────────────────────────────────────────────────────
@app.route('/api/v1/auth/login', methods=['POST'])
def login():
    """Authentification et émission du JWT."""
    data = request.get_json()
    
    if not data or 'login' not in data or 'mdp' not in data:
        return jsonify({"erreur": "login et mdp requis"}), 400
    
    # Vérification des identifiants (en prod : hash bcrypt comparé)
    utilisateur = verifier_identifiants(data['login'], data['mdp'])
    if not utilisateur:
        return jsonify({"erreur": "Identifiants invalides"}), 401
    
    # Génération du JWT
    token = jwt.encode({
        'sub': str(utilisateur['id']),
        'role': utilisateur['role'],
        'iat': datetime.datetime.utcnow(),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=8)
    }, SECRET_KEY, algorithm='HS256')
    
    return jsonify({"token": token, "expires_in": 28800}), 200

@app.route('/api/v1/comptes/<int:compte_id>', methods=['GET'])
@token_requis
def get_compte(compte_id):
    """Récupérer un compte — vérification de propriété obligatoire."""
    # Contrôle d'accès : seul le propriétaire ou un admin peut voir le compte
    if g.role != 'admin' and str(g.user_id) != str(compte_id):
        return jsonify({"erreur": "Accès interdit"}), 403
    
    compte = db_get_compte(compte_id)
    if not compte:
        return jsonify({"erreur": "Compte introuvable"}), 404
    
    return jsonify(compte), 200
```

---

## 2) Module — JWT, CORS & Rate Limiting (2h)

### 📖 Narration/Intuition

**JWT (JSON Web Token)** est le mécanisme d'authentification sans état (stateless) le plus utilisé pour les APIs. **CORS** (Cross-Origin Resource Sharing) contrôle quels domaines peuvent appeler l'API depuis un navigateur. **Rate Limiting** protège contre les attaques par force brute et les abus d'API.

### 🔍 Anatomie Technique

**Anatomie d'un JWT :**

```
Un JWT est composé de 3 parties encodées en Base64, séparées par des points :
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0IiwicmxlIjoiYWRtaW4ifQ.signature

Header.Payload.Signature

Header (décodé) :
{
  "alg": "HS256",    ← Algorithme de signature (HS256, RS256, ES256)
  "typ": "JWT"
}

Payload (décodé) :
{
  "sub": "1234",           ← Subject (ID utilisateur)
  "name": "Jean Mbeki",
  "role": "admin",
  "iat": 1722960000,       ← Issued At (timestamp émission)
  "exp": 1722988800        ← Expiration (8 heures)
}

Signature :
HMAC-SHA256(Base64(header) + "." + Base64(payload), secret_key)
→ Garantit que le payload n'a pas été modifié

ATTENTION — Vulnérabilités JWT connues :
❌ "alg": "none" → Contournement de signature (toujours valider l'algorithme)
❌ Secret faible → Brute-forceable (utiliser > 256 bits aléatoires)
❌ Pas de vérification exp → Tokens jamais expirés
❌ Infos sensibles dans le payload → Base64 est ENCODAGE, pas CHIFFREMENT
```

**Configuration CORS sécurisée (Flask) :**

```python
from flask_cors import CORS

# ❌ CORS dangereux — accepte TOUS les origines
CORS(app)                           # Équivalent Access-Control-Allow-Origin: *
CORS(app, origins="*")              # Idem — NE PAS FAIRE pour des APIs bancaires

# ✅ CORS strict — whitelist des origines autorisées
CORS(app, 
    origins=["https://portail.bcc.cd", "https://admin.bcc.cd"],
    methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["X-Total-Count"],
    max_age=3600,
    supports_credentials=True   # Nécessaire pour les cookies httpOnly
)
```

**Rate Limiting avec Flask-Limiter :**

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,          # Limite par adresse IP
    default_limits=["200 per day", "50 per hour"],
    storage_uri="redis://localhost:6379"  # Stocker les compteurs en Redis
)

# Limite stricte sur le login (anti brute-force)
@app.route('/api/v1/auth/login', methods=['POST'])
@limiter.limit("5 per minute")           # Max 5 tentatives/minute par IP
@limiter.limit("20 per hour")            # Max 20 tentatives/heure par IP
def login():
    ...

# Limite différente pour les exports de données
@app.route('/api/v1/exports', methods=['GET'])
@limiter.limit("10 per hour")
@token_requis
def export_données():
    ...

# Réponse en cas de dépassement (429 Too Many Requests)
@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        "erreur": "Trop de requêtes — réessayez dans quelques minutes",
        "retry_after": e.description
    }), 429
```

---

## 3) Module — OWASP API Security Top 10 (2h)

### 📖 Narration/Intuition

L'OWASP publie un Top 10 spécifique aux APIs, distinct du Top 10 général. Les APIs exposent des surfaces d'attaque uniques que les WAF classiques ne couvrent pas toujours.

### 🔍 Anatomie Technique

**OWASP API Security Top 10 (2023) :**

```
API1  - Broken Object Level Authorization (BOLA/IDOR)
         → /api/compte/123 sans vérifier que l'utilisateur est propriétaire du compte 123

API2  - Broken Authentication
         → Tokens JWT avec "alg:none", pas d'expiration, secrets faibles

API3  - Broken Object Property Level Authorization
         → Retourner tous les champs d'un objet, y compris les champs sensibles
         Exemple : GET /api/user/123 retourne aussi le hash du mot de passe

API4  - Unrestricted Resource Consumption
         → Pas de rate limiting, requêtes infinies → épuisement des ressources

API5  - Broken Function Level Authorization
         → API admin accessible par un utilisateur normal (manque de vérification de rôle)

API6  - Unrestricted Access to Sensitive Business Flows
         → Contournement du workflow (passer commande sans payer, voter multiple fois)

API7  - Server-Side Request Forgery (SSRF)
         → Cf. Jour 71

API8  - Security Misconfiguration
         → Debug mode actif, CORS trop permissif, headers de sécurité manquants

API9  - Improper Inventory Management
         → Anciennes versions d'API non désactivées (v1 vulnérable accessible en prod)

API10 - Unsafe Consumption of APIs
         → Consommer une API tierce sans validation → injection via la 3ème partie
```

**Audit d'une API avec curl (tests de sécurité basiques) :**

```bash
# 1. Tester l'authentification
curl -X POST https://api.bcc.cd/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"login":"admin","mdp":"test"}' -v

# 2. Tester IDOR — essayer d'accéder à un autre compte
TOKEN="eyJ..."
curl -X GET https://api.bcc.cd/v1/comptes/9999 \
    -H "Authorization: Bearer $TOKEN"
# Réponse attendue : 403 Forbidden (si l'API est correcte)

# 3. Tester le rate limiting
for i in {1..20}; do
    curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST https://api.bcc.cd/v1/auth/login \
    -d '{"login":"test","mdp":"wrong"}'
done
# Les premières requêtes doivent retourner 401, la 6ème doit retourner 429

# 4. Tester les en-têtes de sécurité
curl -I https://api.bcc.cd/v1/health
# Vérifier la présence de :
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=...
# Content-Security-Policy: default-src 'self'

# 5. Tester la divulgation d'informations (verbose errors)
curl -X GET "https://api.bcc.cd/v1/comptes/abc" \
    -H "Authorization: Bearer $TOKEN"
# Réponse sécurisée : {"erreur": "ID invalide"}
# Réponse dangereuse : stack trace avec le chemin du fichier Python, version Flask...
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **REST** | Representational State Transfer — style d'architecture pour les APIs web |
| **JWT** | JSON Web Token — token d'authentification sans état (RFC 7519) |
| **CORS** | Cross-Origin Resource Sharing — politique de partage de ressources cross-domaine |
| **API** | Application Programming Interface — interface de programmation applicative |
| **BOLA** | Broken Object Level Authorization — équivalent IDOR dans les APIs |
| **HMAC** | Hash-based Message Authentication Code — signature cryptographique basée sur le hachage |
| **IAT** | Issued At — timestamp d'émission d'un JWT |
| **EXP** | Expiration — timestamp d'expiration d'un JWT |
| **CRUD** | Create, Read, Update, Delete — opérations de base sur les données |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Un JWT contient dans son payload : `{"role": "admin", "exp": 9999999999}`. Quelle manipulation simple pourrait tenter un attaquant ?

**Corrigé :** L'attaquant peut modifier le payload (changer `"role": "client"` en `"role": "admin"`) puis soumettre le JWT avec l'en-tête `"alg": "none"` pour contourner la vérification de signature. La défense : toujours valider explicitement l'algorithme côté serveur et rejeter `alg: none`.

**Exercice 2 :** Un utilisateur peut appeler indéfiniment `POST /api/v1/virements` sans limite de débit. Quelle vulnérabilité OWASP API est-ce et comment la corriger ?

**Corrigé :** **API4 - Unrestricted Resource Consumption**. Correction : mettre en place un rate limiter (ex: 10 virements/heure par compte via Flask-Limiter + Redis) et ajouter une validation métier (plafond journalier, délai entre virements).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Un JWT est stocké côté client. Quelle affirmation est INCORRECTE ?
- A) Le payload est encodé en Base64 — lisible sans clé secrète
- B) La signature garantit l'intégrité du payload
- C) Le payload JWT est chiffré — personne ne peut lire son contenu
- D) La date d'expiration (exp) doit toujours être vérifiée côté serveur

**Réponse : C** — Base64 est un encodage, pas un chiffrement. Quiconque dispose du token peut lire le payload. Ne jamais stocker de données sensibles dans le payload JWT non chiffré.

**Q2 :** Quelle méthode HTTP est idempotente et sécurisée (ne modifie pas l'état du serveur) ?
- A) POST
- B) PUT
- C) GET
- D) DELETE

**Réponse : C** — GET est idempotente et "safe" (ne doit pas modifier l'état).

**Q3 :** Un code de statut HTTP 403 signifie :
- A) La ressource n'existe pas (404)
- B) Le client n'est pas authentifié (manque de token)
- C) Le client est authentifié mais n'a pas les droits pour accéder à la ressource
- D) Le serveur a rencontré une erreur interne

**Réponse : C** — 401 = non authentifié, 403 = non autorisé (authentifié mais droits insuffisants).

**Q4 :** La vulnérabilité API9 (Improper Inventory Management) concerne :
- A) Les erreurs dans les algorithmes de tri des données
- B) Des anciennes versions d'API non désactivées qui peuvent être exploitées en production
- C) L'absence de pagination dans les réponses API
- D) L'utilisation de HTTP au lieu de HTTPS

**Réponse : B**

**Q5 :** `Access-Control-Allow-Origin: *` dans les headers d'une API bancaire est :
- A) Une bonne pratique pour maximiser la compatibilité
- B) Obligatoire pour les APIs publiques
- C) Dangereux car il autorise n'importe quel site web à appeler l'API depuis un navigateur
- D) Sans impact sur la sécurité car le token JWT protège déjà l'API

**Réponse : C**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
