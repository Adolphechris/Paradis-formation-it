# TOME P4 — Cloud, DevOps & SecOps — Jour 179 (6h) : Cloud Computing & Infrastructure as Code (AWS/GCP, Terraform, IAM & Architecture Multi-Régions)

> [!NOTE]
> **Objectif du jour :** Comprendre les fondamentaux du **Cloud Computing** (IaaS, PaaS, SaaS, modèle de responsabilité partagée) avec les plateformes AWS et GCP, maîtriser le provisionnement d'infrastructure avec **Terraform (IaC)**, la gestion des identités et accès cloud (**IAM**), et concevoir des architectures cloud **multi-régions haute disponibilité**.
>
> **Compétences visées :** `OPS-06` (A) — Cloud Infrastructure & Terraform IaC | `SEC-05` (A) — Cloud Security IAM & Principe Moindre Privilège

---

## 1) Module — Cloud Computing : Modèles de Services & Responsabilité Partagée (2h)

### 📖 Narration/Intuition

La BCC envisage de migrer son datacenter physique vers le cloud pour réduire les coûts d'infrastructure et améliorer la résilience. Mais le cloud n'est pas simplement "louer des serveurs en ligne" : c'est un écosystème de modèles de services et de responsabilités partagées.

### 🔍 Anatomie Technique

**Les 3 Modèles de Service Cloud :**

| Modèle | Fournisseur Gère | Client Gère | Exemple |
|:---:|:---|:---|:---:|
| **IaaS** (Infrastructure) | Hardware, Réseau, Virtualisation | OS, Runtime, Applications, Données | AWS EC2, GCP Compute Engine |
| **PaaS** (Plateforme) | IaaS + OS + Runtime | Applications, Données | AWS Elastic Beanstalk, GCP App Engine |
| **SaaS** (Logiciel) | Tout le stack technique | Configuration & Données uniquement | Gmail, Microsoft 365, Salesforce |

**Modèle de Responsabilité Partagée AWS :**
```
┌─────────────────────────────────────────────────────────────┐
│              RESPONSABILITÉ DU CLIENT (BCC)                 │
│  Données clients • Chiffrement • Gestion des accès IAM      │
│  Configuration OS • Applications • Firewall réseau (SG)     │
├─────────────────────────────────────────────────────────────┤
│              RESPONSABILITÉ D'AWS                           │
│  Sécurité Physique Datacenters • Hyperviseur • Réseau global│
│  Matériel Compute/Storage/Database • Réseau global AWS      │
└─────────────────────────────────────────────────────────────┘
```

**Services AWS/GCP essentiels pour la BCC :**

```
Compute :      AWS EC2 / GCP Compute Engine (VMs)
               AWS Lambda / GCP Cloud Functions (Serverless FaaS)
               AWS EKS / GCP GKE (Kubernetes Managé)

Stockage :     AWS S3 / GCP Cloud Storage (Objet)
               AWS EBS / GCP Persistent Disk (Blocs)
               AWS EFS / GCP Filestore (Fichiers NFS)

Base Données : AWS RDS (PostgreSQL Managé) / GCP Cloud SQL
               AWS DynamoDB / GCP Firestore (NoSQL)

Réseau :       AWS VPC / GCP VPC (Réseaux Privés Virtuels)
               AWS CloudFront / GCP Cloud CDN (CDN)
               AWS Route 53 / GCP Cloud DNS (DNS Global)

Sécurité :     AWS IAM / GCP IAM (Identités & Accès)
               AWS KMS / GCP Cloud KMS (Gestion des Clés)
               AWS WAF / GCP Cloud Armor (Web Application Firewall)
```

---

## 2) Module — Infrastructure as Code avec Terraform (2h)

### 📖 Narration/Intuition

Comment la BCC peut-elle déployer une infrastructure cloud identique dans 3 régions différentes (Kinshasa, Europe, Amérique) en 10 minutes et sans erreur humaine ? Grâce à **Terraform**, l'outil **IaC (Infrastructure as Code)** standard de l'industrie.

Terraform décrit l'infrastructure souhaitée dans des fichiers `.tf` (HCL — HashiCorp Configuration Language) et applique les changements via un plan d'exécution vérifiable avant tout déploiement.

### 🔍 Anatomie Technique

**Infrastructure Terraform BCC sur AWS (`main.tf`) :**

```hcl
# ── Configuration du Provider AWS
terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # Backend S3 pour stocker l'état Terraform (State) de manière centralisée et verrouillée
  backend "s3" {
    bucket         = "bcc-terraform-state-prod"
    key            = "bcc-api/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "bcc-terraform-locks"  # Verrou DynamoDB pour éviter les conflits
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "BCC-Core-Banking"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Team        = "Ops-BCC"
    }
  }
}

# ── Variable : Région AWS
variable "aws_region" {
  description = "Région AWS pour le déploiement"
  type        = string
  default     = "eu-west-1"
}

variable "environment" {
  description = "Environnement (dev / staging / production)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "L'environnement doit être dev, staging ou production."
  }
}

# ── VPC (Virtual Private Cloud) — Réseau privé isolé de la BCC
resource "aws_vpc" "bcc_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
}

# ── Sous-réseaux Publics (Pour les Load Balancers exposés à Internet)
resource "aws_subnet" "public_subnets" {
  count             = 3
  vpc_id            = aws_vpc.bcc_vpc.id
  cidr_block        = cidrsubnet("10.0.0.0/16", 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "bcc-public-subnet-${count.index + 1}"
    Tier = "Public"
  }
}

# ── Sous-réseaux Privés (Pour l'API et la BDD — pas d'accès direct Internet)
resource "aws_subnet" "private_subnets" {
  count             = 3
  vpc_id            = aws_vpc.bcc_vpc.id
  cidr_block        = cidrsubnet("10.0.0.0/16", 8, count.index + 10)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "bcc-private-subnet-${count.index + 1}"
    Tier = "Private"
  }
}

# ── RDS PostgreSQL Managé (Haute Disponibilité Multi-AZ)
resource "aws_db_instance" "bcc_postgres" {
  identifier             = "bcc-core-banking-postgres"
  engine                 = "postgres"
  engine_version         = "16.1"
  instance_class         = "db.t3.medium"
  allocated_storage      = 100
  storage_encrypted      = true              # Chiffrement EBS au repos
  kms_key_id             = aws_kms_key.bcc_rds.arn

  db_name  = "bcc_core"
  username = "bcc_admin"
  password = var.db_password               # Via variable sécurisée (jamais en clair !)

  multi_az               = true             # Réplication synchrone sur une 2ème AZ
  backup_retention_period = 30              # 30 jours de rétention des backups
  deletion_protection     = true            # Protection contre la suppression accidentelle
  skip_final_snapshot     = false

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.bcc_db_subnet.name
}

# ── Outputs utiles
output "vpc_id" {
  value       = aws_vpc.bcc_vpc.id
  description = "ID du VPC BCC"
}

output "rds_endpoint" {
  value       = aws_db_instance.bcc_postgres.endpoint
  sensitive   = true
  description = "Endpoint de connexion PostgreSQL RDS"
}
```

**Workflow Terraform :**
```bash
# 1. Initialiser le provider et le backend
terraform init

# 2. Prévisualiser les changements (SANS appliquer)
terraform plan -var-file="production.tfvars" -out=tfplan

# 3. Appliquer les changements après validation humaine
terraform apply tfplan

# 4. Vérifier l'état actuel
terraform state list

# 5. Détruire l'infrastructure (DANGER — Uniquement pour dev/staging)
terraform destroy -var-file="dev.tfvars"
```

---

## 3) Module — IAM Cloud : Principe du Moindre Privilège (2h)

### 📖 Narration/Intuition

**IAM (Identity and Access Management)** est le système de contrôle d'accès de toute plateforme cloud. Une mauvaise configuration IAM est la cause #1 des incidents de sécurité cloud : des clés d'accès AWS avec des permissions `AdministratorAccess` qui fuient dans du code public sur GitHub, permettant à un attaquant de détruire ou voler toute l'infrastructure cloud de la BCC.

### 🛠️ Atelier Pratique

**Politique IAM AWS — Moindre Privilège pour l'API BCC (`iam_policy.tf`) :**

```hcl
# Rôle IAM attaché aux instances EC2 exécutant l'API BCC
resource "aws_iam_role" "bcc_api_role" {
  name = "bcc-api-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "ec2.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

# Politique IAM stricte (Principe du Moindre Privilège)
resource "aws_iam_role_policy" "bcc_api_policy" {
  name = "bcc-api-minimal-policy"
  role = aws_iam_role.bcc_api_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # ✅ Autoriser : Lire les secrets depuis AWS Secrets Manager (uniquement les secrets BCC)
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = "arn:aws:secretsmanager:eu-west-1:*:secret:bcc/production/*"
      },
      # ✅ Autoriser : Écrire des logs CloudWatch
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:eu-west-1:*:log-group:/bcc/api/*"
      },
      # 🚫 TOUT LE RESTE EST REFUSÉ IMPLICITEMENT (Deny by default)
    ]
  })
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **IaaS** | Infrastructure as a Service — Modèle cloud de location d'infrastructure virtuelle |
| **PaaS** | Platform as a Service — Modèle cloud fournissant une plateforme de développement complète |
| **SaaS** | Software as a Service — Logiciel hébergé et utilisé via un navigateur web |
| **IaC** | Infrastructure as Code — Gestion de l'infrastructure via des fichiers de configuration versionés |
| **HCL** | HashiCorp Configuration Language — Langage déclaratif de Terraform |
| **VPC** | Virtual Private Cloud — Réseau privé virtuel isolé dans le cloud |
| **AZ** | Availability Zone — Zone de disponibilité physique indépendante dans une région cloud |
| **FaaS** | Function as a Service — Serverless Computing (ex: AWS Lambda) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Dans le modèle de responsabilité partagée AWS, de qui relève la sécurisation du **Système d'Exploitation (OS)** d'une instance **EC2 (IaaS)** — d'AWS ou du client BCC ?

**Corrigé :** Dans le modèle IaaS (EC2), la sécurisation du **Système d'Exploitation** relève de la **responsabilité du CLIENT (BCC)**. AWS gère la sécurité physique du datacenter, la sécurité du réseau global et de l'hyperviseur. Mais à partir du système d'exploitation de la VM (patching OS, configuration du firewall, hardening SSH, mises à jour des packages), la responsabilité incombe entièrement à l'équipe de la BCC. C'est fondamentalement différent du modèle PaaS (ex: AWS RDS) où AWS gère les patches OS et du moteur de BDD.

**Exercice 2 :** Pourquoi est-il impératif de stocker le **State Terraform** dans un backend distant (ex: S3 + DynamoDB) plutôt que localement sur l'ordinateur du développeur en environnement d'équipe ?

**Corrigé :** Le fichier `terraform.tfstate` est la **source de vérité** de Terraform sur l'état réel de toute l'infrastructure cloud. Si ce fichier est stocké localement : (1) **Problème de collaboration** : deux développeurs qui appliquent Terraform simultanément peuvent créer des conflits et corrompre l'état, (2) **Risque de perte** : si le disque dur local tombe en panne, Terraform ne sait plus quelles ressources il a créées, (3) **Sécurité** : le `tfstate` contient des données sensibles (mots de passe, clés). Le backend S3 + verrou DynamoDB garantit le stockage centralisé, le chiffrement, les versions historiques du state, et le verrouillage concurrent (un seul `terraform apply` à la fois).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans quel modèle de service cloud le fournisseur (AWS/GCP) gère-t-il l'infrastructure, l'OS ET le runtime, laissant au client uniquement la gestion de l'application et des données ?
- A) PaaS (Platform as a Service)
- B) IaaS
- C) SaaS
- D) FaaS

**Réponse : A**

**Q2 :** Quel outil **IaC (Infrastructure as Code)** open-source de HashiCorp utilise le langage HCL pour décrire et provisionner l'infrastructure cloud de manière déclarative et reproductible ?
- A) Terraform
- B) Ansible
- C) Chef
- D) Puppet

**Réponse : A**

**Q3 :** Qu'est-ce que l'option `multi_az = true` dans une instance AWS RDS PostgreSQL garantit-elle ?
- A) Une réplication synchrone automatique vers une 2ème Availability Zone, permettant un basculement automatique (failover) en cas de panne de l'AZ principale
- B) Un déploiement dans plusieurs régions AWS simultanément
- C) Une division du stockage en deux partitions
- D) Un double chiffrement de la base de données

**Réponse : A**

**Q4 :** Dans AWS IAM, quel est le comportement par défaut d'une identité (utilisateur, rôle) sans aucune politique IAM explicitement attachée ?
- A) Accès refusé à toutes les actions (Deny by default — Liste blanche)
- B) Accès total accordé à tous les services
- C) Accès accordé en lecture seule uniquement
- D) Accès accordé aux services régionaux uniquement

**Réponse : A**

**Q5 :** Quelle commande Terraform permet de prévisualiser les changements d'infrastructure qui vont être appliqués, sans effectuer aucune modification réelle sur le cloud ?
- A) `terraform plan`
- B) `terraform apply`
- C) `terraform show`
- D) `terraform validate`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
