# TOME P7 — Certifications d'Élite & Spécialisations — Jour 343 (6h) : Secrets Management at Scale — HashiCorp Vault Dynamic Secrets, AWS Secrets Manager, KMS Envelope Encryption & Mozilla SOPS

> [!NOTE]
> **Objectif du jour :** Maîtriser la **gestion des secrets à l'échelle d'une infrastructure d'entreprise** : déployer **HashiCorp Vault** en mode Haute Disponibilité, générer des **Dynamic Secrets** (mots de passe de base de données à durée de vie courte et clés AWS éphémères), appliquer le chiffrement par enveloppe (**Envelope Encryption**) avec **AWS KMS**, et intégrer **Mozilla SOPS** (Secrets OPerationS) avec GitOps.
>
> **Compétences visées :** `SEC-VAULT-01` (A) — HashiCorp Vault Architecture & Dynamic Secret Engines | `SEC-KMS-02` (A) — KMS Envelope Encryption & Mozilla SOPS GitOps Workflows

---

## 1) Module — Architecture Vault & Dynamic Secrets (2h)

### 📖 Narration/Intuition

Conserver des identifiants statiques dans des fichiers de configuration ou des variables d'environnement est une défaillance critique. **HashiCorp Vault** résout ce problème via les **Dynamic Secrets** : les identifiants n'existent pas avant d'être demandés, sont générés à la volée pour un temps limité (TTL), et sont automatiquement révoqués après expiration.

```
App / Microservice ──(1. Authentification AppRole / K8s Auth)──► [ HashiCorp Vault ]
                                                                      │
                                                                      ▼ (2. Genère credentials éphémères)
[ Base de Données PostgreSQL ] ◄──(3. Crée User 'v_app_x912' TTL 1h)──┘
```

---

## 2) Module — Outillage Vault API & SOPS Encryption (`vault_secrets_manager.py`) (2h)

### 🛠️ Atelier Pratique

```python
import hvac
import json
import base64

class VaultSecretsManager:
    """
    Gestionnaire de secrets automatisé interagissant avec HashiCorp Vault API
    pour la génération de secrets dynamiques et le chiffrement Transit (EaaS).
    """

    def __init__(self, vault_url: str, token: str):
        self.client = hvac.Client(url=vault_url, token=token)

    def is_vault_operational(self) -> bool:
        """Vérifie le statut d'initialisation et de déverrouillage (Unseal) de Vault."""
        return self.client.sys.is_initialized() and not self.client.sys.is_sealed()

    def generate_dynamic_db_credentials(self, db_role_name: str) -> dict:
        """
        Génère un identifiant et mot de passe éphémères pour PostgreSQL (Dynamic Secrets).
        Les identifiants expirent automatiquement à la fin du TTL.
        """
        print(f"[*] Demande de secret dynamique pour le rôle DB : {db_role_name}")
        response = self.client.secrets.database.generate_credentials(name=db_role_name)
        
        creds = response['data']
        lease_duration = response['lease_duration']
        
        return {
            "username": creds['username'],
            "password": creds['password'],
            "lease_duration_seconds": lease_duration,
            "lease_id": response['lease_id']
        }

    def encrypt_data_transit(self, key_name: str, plaintext: str) -> str:
        """
        Chiffre une donnée via le moteur Vault Transit Engine (Encryption as a Service).
        Le secret ne quitte jamais Vault ; seule la version chiffrée est retournée.
        """
        b64_plaintext = base64.b64encode(plaintext.encode('utf-8')).decode('utf-8')
        response = self.client.secrets.transit.encrypt_data(
            name=key_name,
            plaintext=b64_plaintext
        )
        return response['data']['ciphertext']

# Démonstration (Mock hvac client pour simulation)
print("=== HASHICORP VAULT DYNAMIC SECRETS MANAGER ===")
mock_db_creds = {
    "username": "v_app_user_a9f12b_1691478000",
    "password": "A1#9xK!pL2mQ_temp_token",
    "lease_duration_seconds": 3600,
    "lease_id": "database/creds/readonly/h8f9a2b..."
}

print("[+] Credentials DB Générés (TTL 1h) :")
print(f"    User : {mock_db_creds['username']}")
print(f"    Pass : {mock_db_creds['password']}")
print(f"    Lease ID : {mock_db_creds['lease_id']}")
```

---

## 3) Module — Envelope Encryption & Mozilla SOPS Workflow (2h)

```markdown
# ENVELOPE ENCRYPTION & MOZILLA SOPS GITOPS WORKFLOW

## 1. Principe du Chiffrement par Enveloppe (Envelope Encryption)
- **Data Key (DEK) :** Une clé symétrique (AES-256) générée localement pour chiffrer les données volumineuses.
- **Key Encryption Key (KEK) :** Une clé de maître (Master Key dans AWS KMS ou Vault) qui chiffre la Data Key.
- **Avantage :** Performance maximale et conservation de la KEK dans un HSM inviolable sans exporter les clés maîtres.

```
 [ Donnée en Clair ] ──► (Chiffrée avec DEK AES-256) ──► [ Encrypted Data ]
                                                                │
 [ Master Key (KMS KEK) ] ──► (Chiffre la DEK) ───────► [ Encrypted DEK ]
```

## 2. Intégration GitOps avec Mozilla SOPS (Secrets OPerationS)
Mozilla SOPS permet de chiffrer uniquement les VALEURS des fichiers YAML/JSON tout en conservant les CLÉS en clair, rendant le fichier diffable dans Git.

```yaml
# Fichier secrets.enc.yaml chiffré par SOPS via AWS KMS
db_host: postgres.internal.paradis.com  # Clé en clair
db_password: ENC[AES256_GCM,data:A9xK!mQ2,iv:...,tag:...,type:str] # Valeur chiffrée !
sops:
    kms:
        - arn: arn:aws:kms:eu-west-1:123456789012:key/mrk-abc123456
    version: 3.8.1
```

```bash
# Commande d'édition transparente SOPS
sops secrets.enc.yaml
```
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **KMS** | Key Management Service — Service d'administration et de gestion centralisée des clés cryptographiques |
| **DEK / KEK** | Data Encryption Key / Key Encryption Key — Clé de données vs Clé de chiffrement de clé |
| **SOPS** | Secrets OPerationS — Outil open-source de chiffrement de fichiers de configuration (YAML, JSON, ENV) |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est l'avantage principal des **Dynamic Secrets** générés par HashiCorp Vault par rapport aux secrets statiques ?
- A) Ils n'existent pas en base avant d'être demandés, sont générés à la volée avec une durée de vie limitée (TTL), et sont automatiquement révoqués à expiration, éliminant le risque d'identifiants oubliés
- B) Ils sont plus faciles à retenir pour les humains
- C) Ils ne nécessitent aucun réseau
- D) Ils remplacent les certificats SSL

**Réponse : A**

**Q2 :** Qu'est-ce que le **Envelope Encryption (Chiffrement par Enveloppe)** ?
- A) Une technique où la donnée est chiffrée avec une clé de données symétrique (DEK), qui est elle-même chiffrée par une clé maître (KEK) gérée dans un HSM ou KMS
- B) L'envoi de secrets par la poste
- C) Le chiffrement des enveloppes IP
- D) Une fonctionnalité réservée à Windows

**Réponse : A**

**Q3 :** Pourquoi l'outil **Mozilla SOPS** est-il particulièrement adapté aux architectures GitOps ?
- A) Parce qu'il chiffre uniquement les valeurs des fichiers YAML/JSON tout en laissant les clés en clair, permettant les comparaisons de version (`git diff`) et les révisions de code sans exposer les secrets
- B) Parce qu'il supprime le dossier .git
- C) Parce qu'il compile le code C++
- D) Parce qu'il remplace Kubernetes

**Réponse : A**

**Q4 :** Dans HashiCorp Vault, que permet le moteur **Transit Secrets Engine (Encryption as a Service)** ?
- A) De chiffrer et déchiffrer des données à la volée via l'API Vault sans que la clé de chiffrement ne quitte jamais la mémoire sécurisée de Vault
- B) De gérer les DNS
- C) De créer des VMs AWS
- D) De surveiller l'utilisation du disque

**Réponse : A**

**Q5 :** Que se passe-t-il lorsque le délai de bail (**Lease TTL**) d'un secret dynamique Vault arrive à expiration ?
- A) Vault révoque automatiquement l'identifiant sur le système cible (ex. exécute `DROP USER` sur PostgreSQL)
- B) Le secret devient permanent
- C) Le serveur Vault redémarre
- D) Une alerte SMS est envoyée au CISO

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
