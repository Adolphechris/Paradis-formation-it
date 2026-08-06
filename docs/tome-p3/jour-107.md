# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 107 (6h) : Gestion Centralisée des Secrets d'Entreprise (HashiCorp Vault & Kubernetes External Secrets)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre une architecture centralisée de gestion des secrets de niveau bancaire avec HashiCorp Vault : moteurs de secrets dynamiques (Dynamic Database Credentials, PKI on-demand), chiffrement à la volée (Transit Engine), politiques d'accès (Policies HCL) et intégration automatisée dans Kubernetes avec External Secrets Operator (ESO).
>
> **Compétences visées :** `SEC-03` (A) — Gestion Centralisée des Secrets | `BIT-08` (A) — Intégration Vault & Kubernetes

---

## 1) Module — Architecture HashiCorp Vault & Secrets Dynamiques (2h)

### 📖 Narration/Intuition

Dans beaucoup d'entreprises, les mots de passe de bases de données et les clés d'API sont statiques, partagés entre développeurs et valides pendant des mois. Si un identifiant fuité est utilisé par un attaquant, celui-ci conserve un accès permanent.

**HashiCorp Vault** élimine les secrets statiques grâce aux **Secrets Dynamiques** : lorsque l'application bancaire a besoin d'accéder à la base de données PostgreSQL, elle s'authentifie auprès de Vault. Vault génère instantanément un compte utilisateur PostgreSQL temporaire avec un mot de passe aléatoire unique et une durée de vie (TTL) de 1 heure. À l'expiration du TTL, Vault supprime automatiquement l'utilisateur de la base de données.

### 🔍 Anatomie Technique

**Architecture de Fonctionnement d'HashiCorp Vault :**

```
┌─────────────────────────────────────────────────────────────┐
│                    HASHICORP VAULT CLUSTER                  │
│                                                             │
│  ┌────────────────────────┐   ┌──────────────────────────┐  │
│  │ Barrier / Unseal       │   │ Auth Methods             │  │
│  │ (Shamir's Secret       │   │ (AppRole, Kubernetes,    │  │
│  │  Sharing - 3/5 keys)  │   │  OIDC, TLS Certificates) │  │
│  └───────────┬────────────┘   └────────────▲─────────────┘  │
│              │                             │ Authentification
│  ┌───────────▼─────────────────────────────┴───────────┐    │
│  │ Secrets Engines :                                   │    │
│  │ - kv-v2   : Key-Value avec versionnement            │    │
│  │ - database: Génération d'utilisateurs BDD à la volée│    │
│  │ - pki     : Émission de certificats X.509 à la volée│    │
│  │ - transit : Chiffrement/Déchiffrement as-a-Service  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Dynamic Secrets & Transit Engine en Python (2h)

### 📖 Narration/Intuition

Le moteur **Transit** de Vault fournit le **Encryption-as-a-Service** : l'application envoie une donnée sensible en clair à Vault, qui la chiffre et renvoie la donnée chiffrée (`vault:v1:8f9a...`). L'application n'a jamais accès à la clé maîtresse de chiffrement, qui reste confinée en mémoire dans Vault.

### 🔍 Anatomie Technique

**Utilisation du SDK Python HVAC pour interagir avec Vault (`vault_integration.py`) :**

```python
#!/usr/bin/env python3
"""
vault_integration.py — Utilisation d'HashiCorp Vault pour la génération de credentials BDD dynamiques
et le chiffrement via le Transit Engine.
"""
import hvac
import os

VAULT_ADDR = "https://vault.bcc.cd:8200"
ROLE_ID = os.getenv("VAULT_ROLE_ID")
SECRET_ID = os.getenv("VAULT_SECRET_ID")

# 1. Connexion et authentification AppRole auprès de Vault
client = hvac.Client(url=VAULT_ADDR, verify="/etc/ssl/certs/bcc-ca.crt")

login_response = client.auth.approle.login(
    role_id=ROLE_ID,
    secret_id=SECRET_ID
)
print("✅ Authentifié avec succès auprès d'HashiCorp Vault via AppRole.")

# 2. Récupérer un identifiant PostgreSQL DYNAMIQUE (TTL 1 heure)
db_credentials = client.secrets.database.generate_credentials(
    name="bcc-postgres-role",
    mount_point="database"
)

db_user = db_credentials['data']['username']
db_pass = db_credentials['data']['password']
ttl = db_credentials['lease_duration']

print(f"[+] Credential BDD Généré -> User: {db_user} | TTL: {ttl}s")
print(f"    Password: {db_pass[:4]}********")

# 3. Chiffrement à la volée avec le Transit Engine (Encryption-as-a-Service)
donnee_sensible = "Numéro de Carte: 4532-1234-5678-9012"
encrypt_response = client.secrets.transit.encrypt_data(
    name="bcc-card-key",
    plaintext=donnee_sensible.encode('utf-8').hex()
)

ciphertext = encrypt_response['data']['ciphertext']
print(f"[+] Donnée chiffrée par Vault Transit : {ciphertext}")

# Déchiffrement
decrypt_response = client.secrets.transit.decrypt_data(
    name="bcc-card-key",
    ciphertext=ciphertext
)
donnee_restauree = bytes.fromhex(decrypt_response['data']['plaintext']).decode('utf-8')
print(f"[+] Donnée déchiffrée par Vault : {donnee_restauree}")
```

---

## 3) Module — Kubernetes External Secrets Operator (ESO) (2h)

### 📖 Narration/Intuition

Stocker des Secrets Kubernetes au format Base64 simple dans les manifestes GitOps est une mauvaise pratique. **External Secrets Operator (ESO)** permet d'interconnecter directement Kubernetes avec HashiCorp Vault : ESO lit les secrets depuis Vault et crée dynamiquement les objets Secret Kubernetes natifs en mémoire.

### 🔍 Anatomie Technique

**Manifestes Kubernetes External Secrets (`external-secret-vault.yaml`) :**

```yaml
# 1. Configuration de l'accès au serveur Vault (SecretStore)
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: vault-backend
  namespace: bcc-production
spec:
  provider:
    vault:
      server: "https://vault.bcc.cd:8200"
      path: "secret"
      version: "v2"
      auth:
        kubernetes:
          mountPath: "kubernetes"
          role: "bcc-api-role"
          serviceAccountRef:
            name: bcc-api-sa

---
# 2. Déclaration du Secret externe à synchroniser
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: bcc-api-secrets-es
  namespace: bcc-production
spec:
  refreshInterval: "1h"       # Synchronise et renouvelle le secret toutes les heures
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: bcc-api-db-secret   # Nom du Secret K8s natif qui sera généré automatiquement
    creationPolicy: Owner
  data:
    - secretKey: DB_PASSWORD  # Clé dans le Secret K8s
      remoteRef:
        key: secret/data/bcc/database  # Clé dans Vault
        property: password
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **AppRole** | Méthode d'authentification HashiCorp Vault dédiée aux machines et services |
| **ESO** | External Secrets Operator — Opérateur K8s synchronisant les secrets externes (Vault, AWS Secrets Manager) |
| **TTL** | Time To Live — Durée de vie maximale accordée à un secret dynamique |
| **Unseal** | Procédure de déverrouillage de la clé maîtresse d'un cluster Vault (Shamir's Secret Sharing) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quel est l'avantage majeur de l'utilisation des **Secrets Dynamiques** de Vault par rapport au stockage de mots de passe statiques dans des fichiers de configuration ?

**Corrigé :** Les secrets dynamiques sont générés **à la volée** lors de la demande d'une application et associés à une durée de vie (TTL) limitée. Ils n'existent pas avant la demande et sont **automatiquement révoqués et supprimés** par Vault à l'expiration du bail. Si un secret dynamique est intercepté ou fuité, sa fenêtre d'utilisation par un attaquant est extrêmement réduite (ex: 1 heure), et l'accès est automatiquement coupé sans intervention humaine.

**Exercice 2 :** Comment fonctionne la procédure de déverrouillage (**Unseal**) d'un cluster HashiCorp Vault basé sur le partage de secret de Shamir (Shamir's Secret Sharing) ?

**Corrigé :** Au démarrage de Vault, la mémoire du serveur est entièrement verrouillée et chiffrée. La clé maîtresse est divisée cryptographiquement en plusieurs clés partielles (Unseal Keys) réparties entre plusieurs administrateurs distincts (ex: 5 clés générées, seuil de 3 clés requis). Pour déverrouiller le cluster Vault (Unseal), au moins 3 administrateurs doivent saisir leur clé partielle respective. Aucune personne seule ne possède la clé maîtresse complète.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel moteur de secrets HashiCorp Vault permet de chiffrer et déchiffrer des données sensibles à la volée (Encryption-as-a-Service) sans transmettre la clé maîtresse à l'application ?
- A) Transit Engine
- B) KV-v1
- C) PKI Engine
- D) SSH Engine

**Réponse : A**

**Q2 :** Quel opérateur Kubernetes permet de synchroniser automatiquement des secrets stockés dans HashiCorp Vault ou AWS Secrets Manager vers des objets Secret natifs Kubernetes ?
- A) External Secrets Operator (ESO)
- B) Nginx Ingress
- C) Prometheus Operator
- D) Docker Daemon

**Réponse : A**

**Q3 :** Quelle méthode d'authentification Vault est spécialement conçue pour permettre à des microservices ou scripts automatisés de s'authentifier de manière sécurisée à l'aide d'un `role_id` et d'un `secret_id` ?
- A) AppRole
- B) Mot de passe "admin/admin"
- C) SMS
- D) Formulaire papier

**Réponse : A**

**Q4 :** Que se passe-t-il lorsque le bail (Lease / TTL) d'un secret dynamique de base de données généré par Vault arrive à expiration ?
- A) Vault envoie un e-mail à l'administrateur
- B) Vault détruit et supprime automatiquement l'utilisateur et ses privilèges dans la base de données cible
- C) Le serveur s'éteint
- D) Le secret devient public

**Réponse : B**

**Q5 :** Quel algorithme mathématique de partage de secret est utilisé par défaut pour diviser la clé de déverrouillage (Master Key) d'HashiCorp Vault en plusieurs clés partielles (Unseal Keys) ?
- A) Shamir's Secret Sharing
- B) RSA-1024
- C) MD5
- D) AES-ECB

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
