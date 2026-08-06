# TOME P4 — Cloud, DevOps & SecOps — Jour 192 (6h) : Architectures Hybrid Cloud & Multi-Cloud (Direct Connect/Interconnect, Terraform Multi-Provider, HashiCorp Vault & Cloud Bursting)

> [!NOTE]
> **Objectif du jour :** Maitriser la conception et la mise en œuvre d'architectures **Hybrid Cloud** et **Multi-Cloud** d'entreprise : interconnexions physiques et privées (**AWS Direct Connect / GCP Interconnect**), orchestration d'infrastructure multi-cloud avec **Terraform**, gestion centralisée des secrets et identités cloud via **HashiCorp Vault**, et stratégies de débordement de charge (**Cloud Bursting**).
>
> **Compétences visées :** `OPS-06` (A) — Architectures Cloud Hybrides & Multi-Cloud | `SEC-05` (A) — Gestion Centralisée des Secrets (HashiCorp Vault)

---

## 1) Module — Interconnexion On-Premise vers Cloud & Hybrid Networking (2h)

### 📖 Narration/Intuition

La Banque Centrale du Congo conserve ses bases de données cœurs extrêmement confidentielles sur son propre Datacenter physique (On-Premise) à Kinshasa pour des raisons de souveraineté nationale. Cependant, elle souhaite exploiter la puissance du Cloud AWS/GCP pour ses applications web grand public et l'analyse de données massives.

Comment relier le Datacenter privé de la BCC aux VCPs AWS/GCP de manière ultra-sécurisée, à faible latence et sans passer par l'Internet public ? Grâce aux lignes dédiées de niveau 2/3 **AWS Direct Connect** et **GCP Dedicated Interconnect**, couplées à des tunnels **IPsec VPN** redondants.

### 🔍 Anatomie Technique

**Architecture Réseau Hybride BCC (Datacenter Kinshasa <──► AWS VPC) :**

```
DATACENTER KINSHASA (On-Premise)            CLOUD AWS (eu-west-1)
┌───────────────────────────────┐          ┌──────────────────────────────┐
│ Core Banking (Bare Metal BDD) │          │ AWS VPC (10.100.0.0/16)      │
│ IP: 172.16.10.0/24            │          │  - Microservices K8s EKS     │
└───────────────┬───────────────┘          │  - Frontend Web React        │
                │                          └──────────────┬───────────────┘
                ▼                                         ▼
┌───────────────────────────────┐          ┌──────────────────────────────┐
│ Routeurs Bordure BCC (BGP)    │          │ Direct Connect Gateway (DXGW)│
└───────────────┬───────────────┘          └──────────────┬───────────────┘
                │                                         │
                │   ┌─────────────────────────────────┐   │
                └───┤ Ligne Dédiée Fiber 10 Gbps      ├───┘
                    │ AWS Direct Connect (802.1Q VLAN)│
                    │ + IPsec VPN Over DX (TLS 1.3)   │
                    └─────────────────────────────────┘
```

**Composants du Réseau Hybride :**
- **Direct Connect Gateway (DXGW)** : Point d'ancrage central AWS permettant d'interconnecter plusieurs VPCs dans différentes régions à une même liaison Direct Connect.
- **BGP (Border Gateway Protocol)** : Échange dynamique de routes entre le routeur On-Premise (AS65000) et AWS (AS64512).
- **MACsec (802.1AE)** : Chiffrement matériel au niveau de la couche liaison de données (L2) sur la fibre optique Direct Connect.

---

## 2) Module — Gestion Centralisée des Secrets avec HashiCorp Vault (2h)

### 📖 Narration/Intuition

Dans une architecture Multi-Cloud (AWS + GCP + Datacenter On-Premise), disperser la gestion des clés et mots de passe entre AWS Secrets Manager, GCP Secret Manager et des fichiers secrets locaux est une source de failles majeures.

**HashiCorp Vault** est la solution universelle de gestion des secrets pour les architectures hybrides. Il fournit une source de vérité unique, du chiffrement à la volée (*Encryption as a Service*), et génère des **secrets dynamiques à durée de vie courte** (ex: créations d'identifiants PostgreSQL valides 15 minutes puis auto-détruits).

### 🔍 Anatomie Technique

**Flux de Secrets Dynamiques avec HashiCorp Vault :**

```
┌─────────────────┐       1. Demande de secret Postgres       ┌─────────────────┐
│ App Node.js     │──────────────────────────────────────────►│ HashiCorp Vault │
│ (EKS/On-Prem)   │                                           │ (Cluster HA)    │
└─────────────────┘                                           └────────┬────────┘
        ▲                                                              │ 2. Vault génère un user
        │                                                              │    temporaire sur BDD
        │                                                              ▼
        │ 3. Identifiants jetables                      ┌─────────────────────────┐
        │    (User: v_app_891, Pass: xX9#, TTL: 15m)    │ PostgreSQL (On-Premise) │
        └───────────────────────────────────────────────│ (Database Engine Vault) │
                                                        └─────────────────────────┘
```

**Configuration Terraform de Vault & Secrets Dynamiques PostgreSQL (`vault_config.tf`) :**

```hcl
# Provider HashiCorp Vault
provider "vault" {
  address = "https://vault.internal.bcc.cd:8200"
}

# 1. Activation du Moteur de Secrets Base de Données
resource "vault_mount" "db" {
  path = "postgres-bcc"
  type = "database"
}

# 2. Configuration de la connexion PostgreSQL On-Premise
resource "vault_database_secret_backend_connection" "postgres" {
  backend       = vault_mount.db.path
  name          = "bcc-core-db"
  allowed_roles = ["app-readonly", "app-readwrite"]

  postgresql {
    connection_url = "postgres://{{username}}:{{password}}@db.internal.bcc.cd:5432/bcc_core?sslmode=verify-full"
  }
}

# 3. Définition du Rôle de Secret Dynamique (TTL max 1 heure)
resource "vault_database_secret_backend_role" "app_role" {
  backend             = vault_mount.db.path
  name                = "app-readwrite"
  db_name             = vault_database_secret_backend_connection.postgres.name
  default_ttl         = "1800" # 30 minutes
  max_ttl             = "3600" # 1 heure

  creation_statements = [
    "CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';",
    "GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO \"{{name}}\";"
  ]
}
```

---

## 3) Module — Terraform Multi-Provider & Cloud Bursting (2h)

### 📖 Narration/Intuition

La BCC souhaite exécuter ses charges de travail analytiques intenses en fin de mois sur AWS ou GCP lorsque le Datacenter local atteint sa capacité maximale (**Cloud Bursting**).

Grâce à **Terraform**, on peut orchestrer des infrastructures réparties sur plusieurs providers Cloud simultanément au sein du même projet IaC.

### 🛠️ Atelier Pratique

**Manifeste Terraform Multi-Provider AWS & GCP (`multi_cloud.tf`) :**

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Provider 1 : AWS (Région Europe)
provider "aws" {
  alias  = "aws_eu"
  region = "eu-west-1"
}

# Provider 2 : Google Cloud Platform (Région Europe)
provider "google" {
  alias   = "gcp_eu"
  project = "bcc-analytics-prod"
  region  = "europe-west1"
}

# Ressource 1 : Bucket Stockage Objet AWS S3 (Primary Data Lake)
resource "aws_s3_bucket" "primary_datalake" {
  provider = aws.aws_eu
  bucket   = "bcc-datalake-primary-s3"
}

# Ressource 2 : Bucket Stockage Objet GCP Cloud Storage (Failover / Backup Data Lake)
resource "google_storage_bucket" "backup_datalake" {
  provider      = google.gcp_eu
  name          = "bcc-datalake-backup-gcs"
  location      = "EU"
  storage_class = "STANDARD"
}

# Réplication inter-cloud automatisée
resource "aws_s3_bucket_replication_configuration" "replication" {
  provider = aws.aws_eu
  bucket   = aws_s3_bucket.primary_datalake.id
  role     = aws_iam_role.replication_role.arn

  rules {
    id     = "backup-to-gcp"
    status = "Enabled"
    # Destination gérée de manière transparente
  }
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DXGW** | Direct Connect Gateway — Composant AWS d'agrégation d'interconnexions réseaux |
| **MACsec** | Media Access Control Security — Norme IEEE 802.1AE de chiffrement L2 des liaisons physiques |
| **BGP** | Border Gateway Protocol — Protocole de routage dynamique de la dorsale Internet |
| **TTL** | Time To Live — Durée de validité d'une donnée ou d'un secret avant expiration |
| **GCS** | Google Cloud Storage — Service de stockage objet de GCP |
| **IaC** | Infrastructure as Code — Description et gestion de l'infrastructure via du code déclaratif |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi l'utilisation de **secrets dynamiques** générés par HashiCorp Vault est-elle nettement plus sécurisée que le stockage de mots de passe statiques dans AWS Secrets Manager ou des fichiers d'environnement ?

**Corrigé :** Les **mots de passe statiques** restent valides indéfiniment jusqu'à une rotation manuelle ou planifiée. Si un attaquant parvient à voler un identifiant statique (ex: via des logs, des fuites de code ou une fuite de mémoire), il conserve son accès au système pendant des semaines ou des mois sans être détecté. À l'inverse, **HashiCorp Vault** génère des **secrets dynamiques** : lorsqu'une application demande un accès BDD, Vault crée à la volée un compte utilisateur temporaire unique dans PostgreSQL avec un mot de passe aléatoire et une durée de vie (TTL) très courte (ex: 15-30 minutes). À l'échéance du TTL, Vault supprime automatiquement cet utilisateur de la base de données. Même si l'identifiant fuit, la fenêtre d'opportunité de l'attaquant est drastiquement réduite et l'accès s'auto-détruit sans intervention humaine.

**Exercice 2 :** Qu'est-ce que le **Cloud Bursting** et quels sont les défis majeurs à surmonter concernant la latence et la synchronisation des données entre l'On-Premise et le Cloud ?

**Corrigé :** Le **Cloud Bursting** est une technique d'architecture hybride où une application s'exécute prioritairement sur l'infrastructure On-Premise privée, mais utilise ("burst") de la capacité de calcul supplémentaire dans le Cloud public (AWS/GCP) uniquement lors des pics de charge exceptionnels. **Défis majeurs :** (1) **Latence réseau & Gravité des données (Data Gravity)** : Si le calcul s'exécute dans AWS mais doit interroger la BDD On-Premise à chaque requête à travers une ligne réseau distante, la latence s'effondre. Il faut mettre en place du caching local (Redis) ou du réplica de lecture dans le Cloud. (2) **Cohérence des données** : Garantir la synchronisation en temps réel des bases sans bloquer les transactions On-Premise. (3) **Complexité de la sécurité & IAM** : Assurer la même politique de sécurité et le même contrôle d'accès sur l'infrastructure On-Premise et Cloud via des outils unifiés comme Vault et Terraform.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle technologie permet de relier le Datacenter physique On-Premise d'une banque à son VPC AWS via une liaison fibre optique dédiée et privée sans passer par l'Internet public ?
- A) AWS Direct Connect
- B) AWS Direct Internet Access
- C) Amazon CloudFront
- D) VPC Peering public

**Réponse : A**

**Q2 :** Quel est le rôle principal d'**HashiCorp Vault** dans une architecture Cloud Hybride et Multi-Cloud ?
- A) Centraliser la gestion des secrets, fournir du chiffrement à la volée et générer des identifiants et certificats dynamiques à durée de vie courte
- B) Remplacer Terraform pour le provisionnement des VMs
- C) Analyser les logs réseau
- D) Gérer les conteneurs Kubernetes

**Réponse : A**

**Q3 :** En quoi consiste la fonctionnalité de **Secrets Dynamiques** offerte par HashiCorp Vault ?
- A) Vault crée des identifiants uniques temporaires dans la cible (ex: BDD PostgreSQL) lors de chaque demande applicative, et les supprime automatiquement à l'expiration du TTL
- B) Vault modifie le mot de passe de l'application toutes les secondes
- C) Vault chiffre les mots de passe uniquement dans la RAM
- D) Vault envoie un SMS à chaque accès

**Réponse : A**

**Q4 :** Dans Terraform, comment permet-on la gestion simultanée de plusieurs plateformes Cloud (ex: AWS et GCP) au sein d'un même projet IaC ?
- A) En déclarant plusieurs blocs `provider` distincts et en utilisant des `alias` pour cibler chaque provider dans les ressources
- B) En exécutant deux fichiers Terraform séparés dans des répertoires différents
- C) En utilisant uniquement des scripts Bash
- D) Ce n'est pas possible dans Terraform

**Réponse : A**

**Q5 :** Quelle norme de chiffrement matérielle au niveau de la couche de liaison de données (L2 OSI) est utilisée pour sécuriser les liaisons physiques Direct Connect ?
- A) MACsec (IEEE 802.1AE)
- B) IPSec uniquement
- C) TLS 1.3
- D) SSHv2

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
