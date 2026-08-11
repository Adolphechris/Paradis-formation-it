# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 524 (6h) : Sécurité des APIs & Hardening Applicatif Web : OWASP API Top 10, Sécurisation JWT, Protocoles OAuth 2.1 & WAF

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le classement **OWASP API Security Top 10 (2023)** et ses vulnérabilités majeures (BOLA, BFLA, Broken Auth)
> - Sécuriser la gestion des jetons **JWT (JSON Web Tokens)** : algorithmes asymétriques (RS256/ES256), vérification d'émetteur (`iss`) et de destinataire (`aud`)
> - Déployer le protocole d’autorisation moderne **OAuth 2.1** avec **PKCE (Proof Key for Code Exchange)**
> - Hardener un pare-feu applicatif Web (**WAF**) et configurer les en-têtes HTTP de sécurité (CSP, HSTS, CORS)
>
> **Compétences visées :** `SEC-05` (A), `INF-02` (A) — API Security & Web Application Hardening

---

## Module 1 — OWASP API Top 10 & Sécurisation des Jetons JWT (2h)

### 📖 Intuition & Narration

Les APIs REST et GraphQL constituent la colonne vertébrale des architectures modernes. Elles connectent les applications mobiles, les front-ends Single Page Applications (SPA) et les microservices.

Cependant, les APIs souffrent de failles spécifiques que les pare-feux réseau classiques ne détectent pas. La faille n°1 du classement OWASP API Security est **BOLA (Broken Object Level Authorization)** : un utilisateur authentifié modifie l'identifiant dans l'URL (`/api/users/101` vers `/api/users/102`) et accède aux données d'un autre utilisateur parce que l'API vérifie que l'utilisateur est connecté, mais oublie de vérifier qu'il est *propriétaire* de la ressource demandée.

### 🔍 Anatomie Technique — Faille BOLA vs Contrôle BOLA & Anatomie JWT

```
ANATOMIE D'UNE FAILLE BOLA (BROKEN OBJECT LEVEL AUTHORIZATION)

  [ REQUÊTE CLIENT AUTHENTIFIÉE ]
  GET /api/v1/invoices/9942
  Authorization: Bearer <Token_Utilisateur_Bob_ID_55>
                     │
                     ▼
  ┌────────────────────────────────────────────────────────┐
  │ SERVEUR API VULNÉRABLE (Sans vérification d'ownership) │
  │ - Token valide ? OUI (Bob est connecté)               │
  │ - Bob est-il propriétaire de la facture 9942 ? NON !   │
  │ - Résultat : Facture d'Alice envoyée à Bob ! (FAILLE)  │
  └────────────────────────────────────────────────────────┘

SÉCURISATION JWT (RS256 ASYMÉTRIQUE) :
  • Header    : {"alg": "RS256", "typ": "JWT"} (Interdire "alg": "none")
  • Payload   : {"sub": "user_55", "iss": "https://auth.paradis.fr", "aud": "api-service", "exp": 1718000000}
  • Signature : Signé avec Clé Privée RSA, Vérifié avec Clé Publique RSA
```

---

## Module 2 — Atelier Pratique : Sécurisation & Audit JWT Validator (2h)

### 🛠️ Code Python : Robust JWT Security & BOLA Checker

```python
#!/usr/bin/env python3
"""
PARADIS — Secure JWT Validator & BOLA Authorization Inspector
Vérifie la validité des jetons JWT (signature, alg, exp, iss, aud) et prévient les attaques BOLA.
"""

import json
import base64
import hmac
import hashlib
import sys
from datetime import datetime

class SecureJWTValidator:
    def __init__(self, secret_key: str, expected_issuer: str, expected_audience: str):
        self.secret_key = secret_key
        self.expected_issuer = expected_issuer
        self.expected_audience = expected_audience

    def _base64_url_decode(self, payload_str: str) -> bytes:
        rem = len(payload_str) % 4
        if rem > 0:
            payload_str += '=' * (4 - rem)
        return base64.urlsafe_b64decode(payload_str)

    def validate_and_decode(self, token: str) -> tuple[bool, dict, str]:
        parts = token.split(".")
        if len(parts) != 3:
            return False, {}, "[🚨 ERREUR] Format JWT invalide (doit contenir 3 parties séparées par des points)."

        header_b64, payload_b64, signature_b64 = parts

        # 1. Parsing du Header & Vérification de l'algorithme "none"
        header = json.loads(self._base64_url_decode(header_b64))
        if header.get("alg") == "none":
            return False, {}, "[🚨 ATTAQUE DÉTECTÉE] Algorithme 'none' interdit ! Tentative de contournement de signature."

        if header.get("alg") != "HS256":
            return False, {}, f"[🚨 ERREUR] Algorithme non supporté : {header.get('alg')}"

        # 2. Vérification de la signature HMAC-SHA256
        expected_sig = base64.urlsafe_b64encode(
            hmac.new(self.secret_key.encode(), f"{header_b64}.{payload_b64}".encode(), hashlib.sha256).digest()
        ).decode().rstrip("=")

        if signature_b64 != expected_sig:
            return False, {}, "[🚨 FAUX JETON] Signature JWT invalide ou jeton altéré !"

        # 3. Parsing et vérification des Claims du Payload
        payload = json.loads(self._base64_url_decode(payload_b64))

        # Verification Issuer (iss)
        if payload.get("iss") != self.expected_issuer:
            return False, {}, f"[🚨 CLAIMS INVALIDES] Émetteur 'iss' incorrect ({payload.get('iss')} != {self.expected_issuer})"

        # Verification Audience (aud)
        if payload.get("aud") != self.expected_audience:
            return False, {}, f"[🚨 CLAIMS INVALIDES] Destinataire 'aud' incorrect."

        # Verification Expiration (exp)
        if payload.get("exp", 0) < datetime.now().timestamp():
            return False, {}, "[🚨 JETON EXPIRÉ] Le jeton JWT a expiré."

        return True, payload, "[✅ SUCCESS] Jeton JWT valide et authentique."

    def check_bola_ownership(self, payload: dict, requested_resource_owner_id: str) -> bool:
        """Vérifie l'autorisation au niveau objet (Anti-BOLA)."""
        authenticated_user_id = payload.get("sub")
        print(f"[*] Contrôle Anti-BOLA : Utilisateur authentifié '{authenticated_user_id}' vs Propriétaire ressource '{requested_resource_owner_id}'")

        if authenticated_user_id != requested_resource_owner_id:
            print("[🚨 BOLA DETECTED] Accès refusé : L'utilisateur n'est pas le propriétaire de cette ressource !")
            return False

        print("[✅ BOLA CHECK PASSED] L'utilisateur est autorisé à consulter sa ressource.")
        return True

if __name__ == "__main__":
    secret = "paradis_super_secret_key_2024"
    validator = SecureJWTValidator(secret_key=secret, expected_issuer="https://auth.paradis.fr", expected_audience="api-gateway")

    # Simulation d'un JWT valide généré
    header_json = json.dumps({"alg": "HS256", "typ": "JWT"})
    payload_json = json.dumps({
        "sub": "user_101",
        "iss": "https://auth.paradis.fr",
        "aud": "api-gateway",
        "exp": int(datetime.now().timestamp()) + 3600
    })

    h_b64 = base64.urlsafe_b64encode(header_json.encode()).decode().rstrip("=")
    p_b64 = base64.urlsafe_b64encode(payload_json.encode()).decode().rstrip("=")
    sig = base64.urlsafe_b64encode(hmac.new(secret.encode(), f"{h_b64}.{p_b64}".encode(), hashlib.sha256).digest()).decode().rstrip("=")

    valid_jwt = f"{h_b64}.{p_b64}.{sig}"

    is_valid, claims, msg = validator.validate_and_decode(valid_jwt)
    print(f"Resultat validation : {msg}")

    if is_valid:
        # Test BOLA : User_101 essaie d'accéder aux données de User_102
        validator.check_bola_ownership(claims, requested_resource_owner_id="user_102")
```

---

## Module 3 — OAuth 2.1 avec PKCE & En-têtes HTTP WAF (1h30)

### 🔍 OAuth 2.1 PKCE & En-têtes HTTP de Sécurité

1. **OAuth 2.1 + PKCE (Proof Key for Code Exchange)** : Le standard d'autorisation moderne qui élimine les flux obsolètes et peu sécurisés (Implicit Grant). PKCE empêche l'interception du code d'autorisation par des applications malveillantes locales.
2. **En-têtes HTTP de Hardening Web** :
   - `Content-Security-Policy` (CSP) : Bloque l'exécution de scripts XSS non autorisés.
   - `Strict-Transport-Security` (HSTS) : Force l'utilisation exclusive de HTTPS.
   - `X-Content-Type-Options: nosniff` : Empêche le MIME sniffing par le navigateur.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **BOLA** | Broken Object Level Authorization — Faille d'autorisation au niveau objet |
| **BFLA** | Broken Function Level Authorization — Faille d'autorisation au niveau fonction |
| **JWT** | JSON Web Token — Format standard de jeton d'authentification autonome |
| **PKCE** | Proof Key for Code Exchange — Extension de sécurité pour OAuth 2.0/2.1 |
| **WAF** | Web Application Firewall — Pare-feu applicatif web |

---

## Exercices Pratiques

### Exercice 1 — Audit d'une Faille BOLA

Une API de gestion des profils utilisateurs possède l'endpoint suivant : `GET /api/v1/profile?id=50`.
Le code de l'API est le suivant :
```python
@app.route('/api/v1/profile')
@login_required
def get_profile():
    user_id = request.args.get('id')
    return db.query(f"SELECT * FROM users WHERE id = {user_id}")
```
1. Identifiez les deux failles majeures présentes dans ce code.
2. Proposez le code Python corrigé et sécurisé.

**Corrigé guidé :**
1. **Failles identifiées :**
   - **Injection SQL** : Le paramètre `user_id` est concaténé directement dans la requête SQL sans requête préparée.
   - **BOLA (Broken Object Level Authorization)** : L'API vérifie que l'utilisateur est connecté (`@login_required`), mais ne vérifie pas que le `user_id` demandé correspond à l'identifiant de l'utilisateur connecté (`current_user.id`).
2. **Code corrigé :**
```python
@app.route('/api/v1/profile')
@login_required
def get_profile():
    requested_id = request.args.get('id')
    # Correction BOLA : Vérification de la propriété
    if str(current_user.id) != str(requested_id):
        abort(403, "Accès refusé à ce profil")
    # Correction SQLi : Requête paramétrée
    return db.query("SELECT * FROM users WHERE id = %s", (requested_id,))
```

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la vulnérabilité n°1 du classement **OWASP API Security Top 10** ?

- A) Le manque d'espace disque.
- B) BOLA (Broken Object Level Authorization) — l'absence de vérification du fait que l'utilisateur connecté est bien le propriétaire de l'objet demandé. ✅
- C) La lenteur de la connexion réseau.
- D) L'absence d'images sur le site web.

**Q2.** Lors de la validation d'un jeton **JWT (JSON Web Token)**, quelle attaque classique doit être impérativement bloquée au niveau du Header ?

- A) Le changement de couleur du jeton.
- B) L'acceptation du champ `"alg": "none"`, qui désactive la vérification de la signature. ✅
- C) La présence de lettres majuscules.
- D) L'utilisation de caractères accentués.

**Q3.** Pourquoi l'extension **PKCE (Proof Key for Code Exchange)** est-elle désormais obligatoire dans le standard **OAuth 2.1** ?

- A) Pour accélérer le téléchargement des images.
- B) Pour empêcher l'interception et le vol du code d'autorisation par des applications malveillantes lors des flux d'authentification. ✅
- C) Pour supprimer le besoin de serveur Web.
- D) Pour chiffrer la base de données.

**Q4.** Quel en-tête HTTP de sécurité permet d'empêcher les attaques par **Injection de Scripts (XSS)** en définissant une liste blanche de sources de scripts autorisées ?

- A) `Content-Security-Policy` (CSP). ✅
- B) `Server: Apache`.
- C) `Set-Cookie`.
- D) `User-Agent`.

**Q5.** Que contient la troisième partie d'un jeton **JWT (JSON Web Token)** (après les deux points `header.payload.signature`) ?

- A) Le mot de passe en clair de l'utilisateur.
- B) La signature cryptographique garantissant l'intégrité et l'authenticité du jeton. ✅
- C) Une copie du code source de l'application.
- D) La date de naissance du développeur.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
