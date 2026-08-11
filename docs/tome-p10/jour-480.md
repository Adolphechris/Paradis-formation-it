# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 480 (6h) : Architectures ML Cloud Multi-Cloud : AWS SageMaker, GCP Vertex AI, Azure ML, IaC (Terraform) & Optimisation des Coûts GPU (FinOps)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comparer les plateformes MLOps managées du Cloud : **AWS SageMaker**, **Google Cloud Vertex AI** et **Azure Machine Learning**
> - Provisionner une infrastructure MLOps répétable via l'**Infrastructure-as-Code (Terraform)**
> - Optimiser les coûts d'entraînement GPU en combinant **Spot Instances**, interruption résiliente et stockage d'objets haute performance (S3 / GCS)
> - Concevoir des architectures multi-cloud résilientes et agnostiques pour éviter l'enfermement propriétaire (Vendor Lock-in)
>
> **Compétences visées :** `AI-03` (A), `CLD-01` (A) — Cloud ML Architecture & FinOps Optimization

---

## Module 1 — Comparatif des Plateformes MLOps Managées (2h)

### 📖 Intuition & Narration

Construire sa propre plateforme MLOps sur des serveurs On-Premise offre un contrôle total, mais exige une équipe d'ingénieurs dédiée à la maintenance des nœuds Kubernetes, des drivers GPU et des baies de stockage. Les hyperscalers (AWS, GCP, Azure) proposent des plateformes managées de bout en bout qui abstraient cette complexité.

Toutefois, chaque cloud possède sa philosophie :
- **AWS SageMaker** : L'écosystème le plus riche et granulaire, mais à la complexité de configuration élevée.
- **Google Cloud Vertex AI** : Intégration poussée avec BigQuery, AutoML natif et écosystème TensorFlow/JAX/Gemini.
- **Azure Machine Learning** : Intégration transparente avec l'annuaire Active Directory, les services OpenAI et les environnements entreprise Microsoft.

### 🔍 Anatomie Technique — Matrice Comparative Multi-Cloud MLOps

```
MATRICE COMPARATIVE DES SERVICES MLOPS CLOUD

  Fonctionnalité        │ AWS SageMaker          │ GCP Vertex AI          │ Azure Machine Learning
  ──────────────────────┼────────────────────────┼────────────────────────┼───────────────────────
  Notebooks / Studio    │ SageMaker Studio       │ Vertex Workbench       │ Azure ML Studio
  Data / Feature Store  │ Feature Store (Glue)   │ Vertex Feature Store   │ Azure ML Feature Store
  Training Managed      │ SageMaker Training Jobs│ Vertex Custom Training │ Azure ML Training Jobs
  Spot Instances        │ Managed Spot Training  │ Preemptible VMs        │ Low-Priority VMs
  Model Serving         │ Real-time Endpoints    │ Vertex Endpoints       │ Managed Endpoints
  IA Générative / LLM   │ Amazon Bedrock         │ Vertex AI Model Garden │ Azure OpenAI Service
```

---

## Module 2 — Atelier Pratique : Infrastructure-as-Code MLOps avec Terraform (2h)

### 🛠️ Script Terraform : Provisionnement d'un Endpoint SageMaker & Bucket S3

```hcl
# PARADIS — Provisionnement Infrastructure MLOps AWS SageMaker avec Terraform
# Fichier : main.tf

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-west-3" # Paris
}

# 1. Bucket S3 pour l'Artifact Store MLOps PARADIS
resource "aws_s3_bucket" "ml_artifacts" {
  bucket        = "paradis-mlops-artifacts-prod-eu-west-3"
  force_destroy = false

  tags = {
    Environment = "Production"
    Team        = "PARADIS-MLOps"
  }
}

# Blocage de tout accès public au bucket d'artefacts
resource "aws_s3_bucket_public_access_block" "ml_artifacts_block" {
  bucket = aws_s3_bucket.ml_artifacts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 2. Rôle IAM pour les exécutions SageMaker
resource "aws_iam_role" "sagemaker_execution_role" {
  name = "paradis_sagemaker_execution_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "sagemaker.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "sagemaker_full_access" {
  role       = aws_iam_role.sagemaker_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess"
}

# 3. Modèle SageMaker (Pointeurs vers le conteneur ECR et les poids S3)
resource "aws_sagemaker_model" "paradis_nids_model" {
  name               = "paradis-nids-model-v1"
  execution_role_arn = aws_iam_role.sagemaker_execution_role.arn

  primary_container {
    image          = "763104351884.dkr.ecr.eu-west-3.amazonaws.com/huggingface-pytorch-inference:2.1.0-transformers4.37.0-gpu-py310-cu121-ubuntu22.04"
    model_data_url = "s3://${aws_s3_bucket.ml_artifacts.bucket}/models/model.tar.gz"
  }
}

# 4. Configuration de l'Endpoint SageMaker (Instance GPU ml.g5.xlarge - NVIDIA A10G)
resource "aws_sagemaker_endpoint_configuration" "paradis_endpoint_config" {
  name = "paradis-nids-endpoint-config"

  production_variants {
    variant_name           = "AllTraffic"
    model_name             = aws_sagemaker_model.paradis_nids_model.name
    initial_instance_count = 1
    instance_type          = "ml.g5.xlarge"
    initial_variant_weight = 1.0
  }
}

# 5. Endpoint SageMaker Réel
resource "aws_sagemaker_endpoint" "paradis_endpoint" {
  name                 = "paradis-nids-live-endpoint"
  endpoint_config_name = aws_sagemaker_endpoint_configuration.paradis_endpoint_config.name
}

output "endpoint_name" {
  value       = aws_sagemaker_endpoint.paradis_endpoint.name
  description = "Nom de l'Endpoint SageMaker actif pour les appels d'inférence"
}
```

---

## Module 3 — Optimisation des Coûts GPU (FinOps ML) (1h30)

### 🔍 Stratégies de Réduction des Coûts GPU (FinOps)

```
STRATÉGIES DE RÉDUCTION DES COÛTS MATÉRIELS EN CLOUD ML

  1. DÉPOUILLEMENT PAR INSTANCES SPOT / PREEMPTIBLE (Réduction -60% à -80%) :
     - Utiliser les instances GPU de surplus inutilisées des hyperscalers.
     - Condition : Le script d'entraînement DOIT sauvegarder des Checkpoints réguliers sur S3/GCS
       pour reprendre sans perte lors d'une interruption d'instance (préavis de 30 à 120 secondes).

  2. AUTO-STOPPING DES NOTEBOOKS ET ENDPOINTS INACTIFS :
     - Les instances de dev (Jupyter) inactives pendant 1 heure sont coupées automatiquement.

  3. INFÉRENCE SEVERLESS ML (SageMaker Serverless / Vertex Auto-scale to 0) :
     - Facturation uniquement à la milliseconde de calcul lors des requêtes HTTP.
     - Élimine les coûts d'instances GPU tournant à vide la nuit.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **IaC** | Infrastructure as Code — Gestion déclarative de l'infrastructure via code (Terraform) |
| **FinOps** | Financial Operations — Pratique de gestion et d'optimisation financière des coûts Cloud |
| **ECR** | Elastic Container Registry — Registre de conteneurs Docker managé par AWS |
| **Spot Instances** | Capacités de calcul sous-utilisées du Cloud vendues jusqu'à 80% moins cher mais interruptibles |
| **SXM** | Socket-based GPU architecture — Format physique haute interconnexion des GPUs NVIDIA A100/H100 |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Rentabilité Spot vs Instances Demand (FinOps)

Un entraînement de LLM nécessite $100\text{ heures}$ de calcul continu sur un nœud 8x GPU NVIDIA A100.
- Tarif On-Demand AWS (ml.p4d.24xlarge) : $32.77\ \$/\text{heure}$.
- Tarif Spot Instance (Réduction de 70%) : $9.83\ \$/\text{heure}$.
1. Calculez le coût total de l'entraînement avec des instances On-Demand.
2. Calculez le coût total avec des instances Spot.
3. Calculez l'économie réalisée en dollars et en pourcentage.

**Corrigé guidé :**
1. **Coût On-Demand** :
   $$\text{Coût}_{On-Demand} = 100 \text{ heures} \times 32.77\ \$/\text{h} = 3\,277.00\ \$.$$
2. **Coût Spot** :
   $$\text{Coût}_{Spot} = 100 \text{ heures} \times 9.83\ \$/\text{h} = 983.00\ \$.$$
3. **Économie réalisée** :
   - Économie brute : $3\,277.00 - 983.00 = 2\,294.00\ \$$ économisés.
   - Économie en pourcentage : $(2\,294 / 3\,277) \times 100 = 70.0\%$.
   L'utilisation d'instances Spot avec sauvegarde régulière de checkpoints réduit la facture de plus de **2 290 $** pour un unique entraînement.

---

## Banque QCM — 5 Questions

**Q1.** Quel est l'avantage principal d'utiliser **Terraform (IaC)** pour déployer des infrastructures MLOps (Buckets S3, Endpoints SageMaker) plutôt que de les créer manuellement via la console Cloud ?

- A) Terraform rend les GPUs 2x plus rapides.
- B) Terraform garantit une infrastructure reproductible, versionnée dans Git, auditable et déployable de façon identique sur plusieurs environnements (Dev, Staging, Prod). ✅
- C) Terraform annule le coût des instances Cloud.
- D) Terraform supprime le besoin de clés SSH.

**Q2.** Quelle condition architecturale est **strictement obligatoire** lors de l'utilisation d'instances GPU **Spot / Preemptible** pour des entraînements longs ?

- A) Le script doit être écrit en langage C.
- B) Le code doit sauvegarder très fréquemment des Checkpoints (états du modèle et de l'optimiseur) sur un stockage d'objets persistant (S3/GCS) pour pouvoir reprendre l'entraînement en cas d'interruption brutale de la VM. ✅
- C) L'entraînement doit s'exécuter en moins de 5 secondes.
- D) Le modèle ne doit pas utiliser de couches de convolution.

**Q3.** Dans l'écosystème GCP, quel service managé regroupe les fonctionnalités de Feature Store, d'entraînement sur-mesure et de serving d'inférence ?

- A) AWS SageMaker
- B) Google Cloud Vertex AI ✅
- C) Azure Synapse
- D) Google Drive

**Q4.** Que permet le mode **SageMaker Serverless Inference** par rapport aux endpoints dédiés classiques ?

- A) D'exécuter le modèle directement dans le navigateur du client.
- B) De ne payer que pour la durée exacte de traitement de chaque requête d'inférence (facturation à la milliseconde), avec un passage automatique à 0 instance en l'absence de trafic. ✅
- C) De supprimer l'utilisation d'images Docker.
- D) De ne pas utiliser de mémoire RAM.

**Q5.** Dans une approche FinOps ML, qu'est-ce que l'**Auto-Stopping** des instances de dev ?

- A) Un script qui éteint les serveurs de production à 18h.
- B) Un mécanisme automatique coupant les instances d'entraînement et les serveurs de Notebooks inactifs après un temps d'inactivité défini pour éviter la facturation inutile de ressources non utilisées. ✅
- C) L'arrêt des sauvegardes de bases de données.
- D) Une panne matérielle sur le GPU.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
