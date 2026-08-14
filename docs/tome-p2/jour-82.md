# TOME P2 — Réseaux & Télécoms — Jour 82 (6h) : Identity & Access Management (IAM) — Keycloak, OAuth2 & OpenID Connect

> [!NOTE]
> **Objectif du jour :** Déployer et configurer une solution centralisée de gestion des identités et des accès (IAM / IdP) avec Keycloak : protocoles OAuth2 et OpenID Connect (OIDC), Single Sign-On (SSO), authentification multifacteur (MFA/TOTP) et intégration avec des applications bancaires.
>
> **Compétences visées :** `SEC-01` (A) — Gestion des Identités & Accès | `BIT-06` (A) — Architecture Logicielle & Sécurité APIs

---

## 1) Module — Fondamentaux OAuth2 & OpenID Connect (OIDC) (2h)

### 📖 Narration/Intuition

Dans une grande organisation, chaque employé et chaque client utilise plusieurs applications : portail de transactions, messagerie, système RH, console d'audit. Gérer des mots de passe séparés pour chaque application est un cauchemar de sécurité et d'administration.

**OAuth 2.0** est un protocole de **délégation d'autorisation** (il permet à une application d'accéder à des ressources sans connaître le mot de passe de l'utilisateur). **OpenID Connect (OIDC)** est une couche d'**authentification** basée sur OAuth 2.0. Ensemble, ils permettent le **Single Sign-On (SSO)** : s'authentifier une seule fois auprès d'un serveur d'identité centralisé (Identity Provider - IdP) pour accéder à l'ensemble du système d'information.

### 🔍 Anatomie Technique

**Acteurs et Flux OAuth2 / OIDC (Authorization Code Flow avec PKCE) :**

```
Utilisateur (Browser)         Client (App Web/Mobile)      IdP (Keycloak)       Resource Server (API)
        │                              │                        │                         │
        │── 1. Clic "Se connecter"────→│                        │                         │
        │←── 2. Redirection Auth ──────│                        │                         │
        │       (code_challenge)       │                        │                         │
        │                              │                        │                         │
        │── 3. Saisie Login/MFA ───────────────────────────────→│                         │
        │←── 4. Redirection avec code ──────────────────────────│                         │
        │       (authorization_code)   │                        │                         │
        │                              │                        │                         │
        │                              │── 5. Échange code ────→│                         │
        │                              │      + code_verifier   │                         │
        │                              │←── 6. ID Token + ──────│                         │
        │                              │      Access Token (JWT)│                         │
        │                              │                        │                         │
        │                              │── 7. Requête API + Access Token (Bearer)────────→│
        │                              │                                                  │ Valid Token?
        │                              │←── 8. Données sensibles (200 OK)─────────────────│
```

**Différences clés entre Tokens :**

| Token | Format | Rôle | Contenu typique |
|:---:|:---:|:---:|:---|
| **ID Token** | JWT | Authentification (qui est l'utilisateur) | `sub`, `email`, `name`, `iss`, `aud`, `auth_time` |
| **Access Token** | JWT / Opaque | Autorisation (que peut faire l'application) | `scope`, `roles`, `permissions`, `exp` |
| **Refresh Token** | Opaque / Encadré | Renouvellement de l'Access Token expiré | Token longue durée sécurisé |

---

## 2) Module — Déploiement & Configuration de Keycloak (2h)

### 📖 Narration/Intuition

**Keycloak** est la solution Open Source de référence développée par Red Hat pour la gestion des identités et des accès (IAM). Il agit comme Fournisseur d'Identité (IdP) central pour gérer les royaumes (Realms), les utilisateurs, les rôles, les clés d'API et l'authentification forte (MFA/TOTP).

### 🔍 Anatomie Technique

**Déploiement de Keycloak avec Docker Compose (`docker-compose-keycloak.yml`) :**

```yaml
version: '3.8'

services:
  keycloak-db:
    image: postgres:16-alpine
    container_name: keycloak-db
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: ${KC_DB_PASSWORD}
    volumes:
      - keycloak-db-data:/var/lib/postgresql/data
    networks:
      - keycloak-net
    restart: unless-stopped

  keycloak:
    image: quay.io/keycloak/keycloak:24.0.1
    container_name: keycloak
    command: start --optimized
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://keycloak-db:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: ${KC_DB_PASSWORD}
      KC_HOSTNAME: auth.entreprise.cd
      KC_PROXY_HEADERS: xforwarded
      KC_HTTP_ENABLED: "false"
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: ${KC_ADMIN_PASSWORD}
    depends_on:
      - keycloak-db
    networks:
      - keycloak-net
      - frontend-net
    restart: unless-stopped

volumes:
  keycloak-db-data:

networks:
  keycloak-net:
    internal: true
  frontend-net:
    external: true
```

**Notions clés de configuration Keycloak :**

```
- Realm (Royaume) : Espace d'isolement logique contenant ses propres utilisateurs, applications (Clients) et rôles.
  (Exemple : Realm "Interne" pour les employés, Realm "Externe" pour le public).
- Client : Application qui délègue son authentification à Keycloak (ex: Portail Web, API, Mobile App).
- Client Secret : Clé privée de l'application pour les clients confidentiels (backend).
- User Federation : Synchronisation/Connexion avec un annuaire d'entreprise existant (LDAP / Active Directory).
```

---

## 3) Module — Intégration Python/Flask avec Keycloak OIDC (2h)

### 📖 Narration/Intuition

Une fois le serveur Keycloak configuré, nos applications (microservices, portails web) n'ont plus à gérer la base de données des utilisateurs ni le hachage des mots de passe. Elles se contentent de valider les jetons JWT émis et signés par Keycloak.

### 🔍 Anatomie Technique

**Validation des Tokens OIDC dans une API Flask (`keycloak_auth.py`) :**

```python
#!/usr/bin/env python3
"""
keycloak_auth.py — Middleware de validation JWT OIDC émis par Keycloak
"""
from flask import Flask, request, jsonify, g
from functools import wraps
import jwt
from jwt import PyJWKClient

app = Flask(__name__)

KEYCLOAK_URL = "https://auth.entreprise.cd"
REALM_NAME = "Enterprise"
JWKS_URL = f"{KEYCLOAK_URL}/realms/{REALM_NAME}/protocol/openid-connect/certs"

# Initialiser le client JWK pour récupérer dynamiquement les clés publiques de signature Keycloak
jwks_client = PyJWKClient(JWKS_URL)

def require_keycloak_role(required_role):
    """Décorateur pour exiger un rôle spécifique extrait du token Keycloak."""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization", None)
            if not auth_header or not auth_header.startswith("Bearer "):
                return jsonify({"error": "Jeton d'autorisation manquant ou mal formé"}), 401
            
            token = auth_header.split(" ")[1]

            try:
                # 1. Récupérer la clé publique correspondant à la clé de signature du token (kid)
                signing_key = jwks_client.get_signing_key_from_jwt(token)

                # 2. Valider et déchiffrer le JWT
                payload = jwt.decode(
                    token,
                    signing_key.key,
                    algorithms=["RS256"],
                    audience="account",  # Ou l'ID de votre client Keycloak
                    issuer=f"{KEYCLOAK_URL}/realms/{REALM_NAME}"
                )

                # 3. Extraire les rôles du payload Keycloak
                realm_access = payload.get("realm_access", {})
                user_roles = realm_access.get("roles", [])

                if required_role not in user_roles:
                    return jsonify({"error": f"Accès refusé. Rôle requis : {required_role}"}), 403

                # Injecter l'utilisateur dans le contexte de la requête
                g.user_id = payload.get("sub")
                g.username = payload.get("preferred_username")
                g.email = payload.get("email")

            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Le jeton a expiré"}), 401
            except jwt.PyJWTError as e:
                return jsonify({"error": f"Jeton invalide : {str(e)}"}), 401

            return f(*args, **kwargs)
        return wrapper
    return decorator

@app.route('/api/v1/virements/valider', methods=['POST'])
@require_keycloak_role('superviseur-financier')
def valider_virement():
    return jsonify({
        "status": "success",
        "message": f"Virement validé par {g.username} ({g.email})",
        "initiateur_id": g.user_id
    })

if __name__ == "__main__":
    app.run(port=5000)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **IAM** | Identity and Access Management — Gestion des Identités et des Accès |
| **IdP** | Identity Provider — Fournisseur d'Identité centralisé |
| **SSO** | Single Sign-On — Authentification unique centralisée |
| **OIDC** | OpenID Connect — Protocole d'authentification basé sur OAuth 2.0 |
| **PKCE** | Proof Key for Code Exchange — Extension de sécurité OAuth2 anti-interception de code |
| **JWKS** | JSON Web Key Set — Ensemble de clés publiques au format JSON pour valider les JWT |
| **TOTP** | Time-based One-Time Password — Mot de passe à usage unique basé sur le temps (MFA) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi est-il fortement recommandé d'utiliser l'extension PKCE (Proof Key for Code Exchange) avec OAuth 2.0 pour les applications mobiles ou SPA (Single Page Applications) ?

**Corrigé :** Les applications mobiles et SPA sont des "clients publics" : elles ne peuvent pas conserver un `client_secret` de façon sécurisée (le code peut être décompilé ou inspecté dans le navigateur). PKCE remplace le secret statique par un secret dynamique généré à la volée (`code_verifier`) et son hachage (`code_challenge`), ce qui empêche un attaquant d'intercepter le code d'autorisation pour obtenir un jeton.

**Exercice 2 :** Quelle est la différence fondamentale entre OAuth 2.0 et OpenID Connect (OIDC) ?

**Corrigé :** OAuth 2.0 est un protocole **d'autorisation** (délégation d'accès aux ressources via des Access Tokens). Il ne définit pas comment authentifier un utilisateur ni comment obtenir son profil. OpenID Connect est une couche standardisée **d'authentification** construite *au-dessus* d'OAuth 2.0 qui introduit l'**ID Token** (au format JWT) contenant les informations sur l'identité de l'utilisateur.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans un flux OpenID Connect, quel token contient les informations d'identité de l'utilisateur (nom, email, date d'authentification) ?
- A) Access Token
- B) Refresh Token
- C) ID Token
- D) CSRF Token

**Réponse : C**

**Q2 :** Quel composant Keycloak permet de regrouper et d'isoler de manière étanche un ensemble d'utilisateurs, d'applications et de rôles ?
- A) Client
- B) Realm
- C) Identity Provider Link
- D) Authentication Flow

**Réponse : B**

**Q3 :** Comment une API microservice vérifie-t-elle la validité d'un jeton JWT émis par Keycloak sans interroger Keycloak à chaque requête ?
- A) En utilisant le mot de passe de l'utilisateur
- B) En téléchargeant la clé publique du Realm via le point d'accès JWKS et en vérifiant la signature cryptographique RS256 du JWT
- C) En déchiffrant le JWT avec une clé symétrique partagée en clair
- D) En stockant tous les tokens dans un fichier texte local

**Réponse : B**

**Q4 :** Quelle est la fonction principale du Refresh Token ?
- A) Remplacer l'ID Token lors des requêtes HTTP
- B) Obtenir un nouvel Access Token lorsque le précédent a expiré, sans réinviter l'utilisateur à saisir son mot de passe
- C) Chiffrer la base de données des utilisateurs
- D) Activer l'authentification multifacteur (MFA)

**Réponse : B**

**Q5 :** Quel algorithme de signature est le plus couramment utilisé pour signer les jetons JWT OIDC dans Keycloak de manière asymétrique ?
- A) MD5
- B) HS256 (HMAC-SHA256)
- C) RS256 (RSA avec SHA-256)
- D) AES-CBC-128

**Réponse : C**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
