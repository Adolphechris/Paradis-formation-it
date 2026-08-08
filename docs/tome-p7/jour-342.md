# TOME P7 — Certifications d'Élite & Spécialisations — Jour 342 (6h) : API Security — OWASP API Security Top 10 2023, GraphQL Introspection, JWT Vulnerabilities & Mass Assignment Exploitation

> [!NOTE]
> **Objectif du jour :** Maîtriser l'évaluation offensive et la sécurisation des architectures **API Web (REST, GraphQL, gRPC)** selon le référentiel **OWASP API Security Top 10 2023** : intercepter et auditer les **BOLA / BFLA (Broken Object/Function Level Authorization)**, exploiter et sécuriser la **GraphQL Introspection** et les **Batching Attacks**, analyser les vulnérabilités de jetons **JWT (Algorithm None, Key Confusion RS256->HS256)**, et interdire le **Mass Assignment / Unrestricted Resource Consumption**.
>
> **Compétences visées :** `API-SEC-01` (A) — OWASP API Top 10 2023 (BOLA, BFLA, Mass Assignment) | `API-SEC-02` (A) — GraphQL Security Auditing & JWT Attack Vector Exploitation

---

## 1) Module — OWASP API Security Top 10 2023 & BOLA/BFLA (2h)

### 📖 Narration/Intuition

Les APIs sont le vecteur d'attaque privilégié des architectures modernes. La vulnérabilité **BOLA (Broken Object Level Authorization / OWASP API1:2023)** est la faille la plus dévastatrice : l'API valide l'authentification de l'utilisateur, mais omet de vérifier s'il est l'ayant droit légitime de la ressource demandée via l'identifiant transmis dans l'URL.

```
       [ Client Authentifié (User ID: 105) ]
                         │
                         ▼
        GET /api/v1/accounts/209/balance  <--- Demande le compte de l'User 209 !
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ API GATEWAY / BACKEND                                       │
  │  - Check JWT AuthToken ? ✅ VALIDE (User 105)                │
  │  - Check Ownership (User 105 == Owner of Account 209) ? ❌ ABSENT !│
  └────────────────────────┬────────────────────────────────────┘
                           │
                           ▼
           [ Fuite des données financières du Compte 209 (BOLA) ]
```

---

## 2) Module — Outillage d'Audit API & JWT Security (`api_security_tester.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import base64
import hmac
import hashlib

class APISecurityTester:
    """
    Suite de test offensive et défensive d'APIs REST/GraphQL.
    1. Validation des contrôles de sécurité JWT (Algorithme None / Weak Secret).
    2. Détection de Mass Assignment / Parameter Pollution.
    """

    @staticmethod
    def forge_jwt_none_algorithm(payload: dict) -> str:
        """
        Forge un jeton JWT avec l'algorithme 'none' (OWASP API2:2023 / Broken Authentication).
        Permet de tester si le serveur accepte les jetons non signés.
        """
        header = {"alg": "none", "typ": "JWT"}
        
        def b64url(data: dict) -> str:
            raw = json.dumps(data, separators=(',', ':')).encode('utf-8')
            return base64.urlsafe_b64encode(raw).decode('utf-8').rstrip('=')

        header_b64 = b64url(header)
        payload_b64 = b64url(payload)
        
        # Jeton forgé sans signature (terminé par un point)
        forged_jwt = f"{header_b64}.{payload_b64}."
        print(f"[!] Jeton JWT 'alg: none' Forgé : {forged_jwt}")
        return forged_jwt

    @staticmethod
    def audit_mass_assignment(incoming_json: dict, allowed_fields: set) -> dict:
        """
        Contrôle de sécurité contre le Mass Assignment (OWASP API6:2023).
        Rejette tout champ non présent dans la whitelist autorisée (ex: is_admin, role, balance).
        """
        received_fields = set(incoming_json.keys())
        unauthorized_fields = received_fields - allowed_fields

        if unauthorized_fields:
            return {
                "status": "BLOCKED_MASS_ASSIGNMENT",
                "risk": "HIGH",
                "unauthorized_fields": list(unauthorized_fields),
                "sanitized_payload": {k: v for k, v in incoming_json.items() if k in allowed_fields}
            }
        return {"status": "ALLOWED", "sanitized_payload": incoming_json}

# Tests pratiques
print("=== SUITE D'AUDIT DE SÉCURITÉ API ===")

# Test 1 : Forge JWT alg=none
test_payload = {"sub": "usr_9981", "role": "admin", "iss": "paradis-bank-auth"}
APISecurityTester.forge_jwt_none_algorithm(test_payload)

# Test 2 : Contrôle Mass Assignment
malicious_user_update = {
    "first_name": "Adolphe",
    "last_name": "Chris",
    "email": "adolphe@paradis-bank.com",
    "is_admin": True,           # Champ injecté par l'attaquant !
    "account_balance": 1000000   # Champ injecté par l'attaquant !
}

allowed_profile_fields = {"first_name", "last_name", "email", "phone"}
audit_result = APISecurityTester.audit_mass_assignment(malicious_user_update, allowed_profile_fields)

print("\n[+] Audit Mass Assignment :")
print(json.dumps(audit_result, indent=2, ensure_ascii=False))
```

---

## 3) Module — Graphql Introspection & Batching Attacks (2h)

```graphql
# 1. Requête d'Introspection GraphQL (OWASP API8:2023 - Security Misconfiguration)
# Permet à un attaquant de cartographier la totalité du schéma de données, requêtes et mutations.

query IntrospectionQuery {
  __schema {
    queryType { name }
    mutationType { name }
    types {
      name
      kind
      fields {
        name
        type { name kind }
      }
    }
  }
}

# 2. GraphQL Batching Attack / Query Depth Abuse (OWASP API4:2023 - Unrestricted Resource Consumption)
# Contourne le Rate Limiting en envoyant 100 mutations en une seule requête HTTP POST !

query BatchingBruteForce {
  req1: login(username: "admin", password: "password1") { token }
  req2: login(username: "admin", password: "password2") { token }
  req3: login(username: "admin", password: "password3") { token }
  # ... jusqu'à req100
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **BOLA** | Broken Object Level Authorization — Faille d'autorisation au niveau objet (anciennement IDOR) |
| **BFLA** | Broken Function Level Authorization — Faille d'autorisation permettant d'exécuter des fonctions administratives |
| **JWT** | JSON Web Token — Standard ouvert (RFC 7519) de jeton sécurisé pour transmettre des assertions |
| **Mass Assignment** | Injection de propriétés non autorisées dans un modèle de données lors d'une mise à jour automatique |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la différence fondamentale entre **BOLA (API1:2023)** et **BFLA (API5:2023)** dans le classement OWASP API Security ?
- A) BOLA concerne l'accès non autorisé aux données d'un autre utilisateur en modifiant l'ID de la ressource dans la requête, tandis que BFLA concerne l'exécution non autorisée de fonctions ou d'endpoints privilégiés (ex: `DELETE /api/admin/users`)
- B) BOLA s'applique uniquement à GraphQL, BFLA uniquement à REST
- C) BFLA est une faille de chiffrement
- D) BOLA est une faille de déni de service

**Réponse : A**

**Q2 :** Pourquoi la désactivation de l'**Introspection GraphQL** en environnement de production est-elle une recommandation de sécurité majeure ?
- A) Parce que l'introspection permet à n'importe quel client d'interroger la métadonnée `__schema` pour reconstruire l'intégralité du schéma GraphQL (modèles, champs privés, mutations), facilitant la préparation d'attaques
- B) Parce que l'introspection ralentit le processeur de 50%
- C) Parce que l'introspection nécessite une licence payante
- D) Parce qu'elle empêche le fonctionnement du HTTPS

**Réponse : A**

**Q3 :** Comment un attaquant peut-il exploiter la vulnérabilité **JWT Algorithm None** ?
- A) En modifiant le header du jeton pour fixer `"alg": "none"`, en supprimant la signature finale, puis en testant si le serveur vulnérable valide le jeton sans vérifier sa signature cryptographique
- B) En devinant la clé publique RSA
- C) En envoyant un ping vers le serveur d'authentification
- D) En modifiant l'adresse MAC du client

**Réponse : A**

**Q4 :** Qu'est-ce que la vulnérabilité **Mass Assignment (OWASP API6:2023)** ?
- A) La possibilité pour un attaquant d'injecter des champs sensibles non prévus (ex: `"is_admin": true` ou `"role": "superuser"`) dans un payload JSON qui sont automatiquement liés aux objets métiers par le framework
- B) L'envoi massif d'emails de spam
- C) Le dépassement de capacité de la pile
- D) La saturation de la bande passante réseau

**Réponse : A**

**Q5 :** Comment contrer les attaques par **GraphQL Batching / Query Depth Abuse** ?
- A) En configurant une limite stricte de profondeur de requêtes (Query Depth Limit), une limite de complexité de requêtes (Query Cost/Complexity Analysis) et du rate-limiting au niveau des opérations
- B) En supprimant les requêtes HTTP POST
- C) En utilisant du CSV à la place du JSON
- D) En bloquant toutes les adresses IP virtuelles

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
