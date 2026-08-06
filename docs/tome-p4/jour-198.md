# TOME P4 — Cloud, DevOps & SecOps — Jour 198 (6h) : FinOps & Optimisation des Coûts Cloud (Cost Allocation, AWS Cost Explorer, Kubernetes Rightsizing avec KubeCost, Reserved Instances & Spot Instances)

> [!NOTE]
> **Objectif du jour :** Maîtriser la démarche **FinOps (Financial Operations)** pour optimiser et maîtriser la facture cloud de l'entreprise : allocation budgétaire par étiquetage (**Tagging Strategy**), analyse des coûts avec **AWS Cost Explorer**, dimensionnement optimal des conteneurs Kubernetes (**Rightsizing**) avec **KubeCost**, stratégie d'achat d'**Instances Réservées / Savings Plans**, et utilisation des **Spot Instances** pour les charges tolérantes aux pannes.
>
> **Compétences visées :** `OPS-06` (A) — FinOps & Cloud Cost Optimization | `OPS-05` (A) — Kubernetes Rightsizing KubeCost

---

## 1) Module — Principes FinOps & Strategie de Tagging (2h)

### 📖 Narration/Intuition

Lorsqu'une entreprise migre vers le Cloud sans gouvernance financière, sa facture mensuelle peut doubler chaque trimestre sans que personne ne sache exactement quelle équipe ou quelle application consomme le plus de ressources.

**FinOps (Financial Operations)** est la discipline d'ingénierie et de gestion qui rassemble la Technique, la Finance et le Business pour optimiser la valeur financière du Cloud. Le premier pilier du FinOps est la **Visibilité** : on ne peut pas optimiser ce qu'on ne peut pas mesurer.

### 🔍 Anatomie Technique

**Les 3 Phases du Cycle de Vie FinOps :**

```
                 ┌──────────────────────────────────────┐
                 │          1. INFORM (Informer)        │
                 │  - Stratégie d'étiquetage (Tags)     │
                 │  - Imputations des coûts par équipe  │
                 │  - Dashboards de visibilité          │
                 └──────────────────┬───────────────────┘
                                    │
                                    ▼
                 ┌──────────────────────────────────────┐
                 │         2. OPTIMIZE (Optimiser)      │
                 │  - Rightsizing (Réduction ressources)│
                 │  - Modèles d'achat (Savings Plans)   │
                 │  - Suppression des ressources orphelines
                 └──────────────────┬───────────────────┘
                                    │
                                    ▼
                 ┌──────────────────────────────────────┐
                 │          3. OPERATE (Opérer)         │
                 │  - Automatisation FinOps             │
                 │  - Gouvernance et alertes budgétaires│
                 │  - Culture de responsabilité financière
                 └──────────────────────────────────────┘
```

**Politique d'Étiquetage Obligatoire BCC (AWS Tagging Policy) dans Terraform (`tags.tf`) :**

```hcl
# Variable locale définissant les tags obligatoires pour TOUTE ressource AWS BCC
locals {
  mandatory_tags = {
    BusinessUnit = "BCC-Core-Banking"
    Environment  = var.environment # production, staging, dev
    CostCenter   = "CC-10492"
    OwnerEmail   = "ops-team@bcc.cd"
    ManagedBy    = "Terraform"
    SecurityTier = "Restricted"
  }
}

# Provider AWS avec tags par défaut (Appliqués automatiquement à TOUTES les ressources)
provider "aws" {
  region = "eu-west-1"

  default_tags {
    tags = local.mandatory_tags
  }
}
```

---

## 2) Module — Kubernetes Rightsizing & KubeCost (2h)

### 📖 Narration/Intuition

Dans Kubernetes, les développeurs ont tendance à sur-dimensionner largement les requêtes de ressources CPU et RAM pour leurs Pods (`requests: memory: 4Gi, cpu: 2`) "au cas où", alors que le Pod consomme réellement 200Mi de RAM et 0.1 CPU en moyenne. Résultat : le cluster K8s doit provisionner 10 Worker Nodes AWS EC2 coûteux alors que 2 suffiraient largement.

**KubeCost** est l'outil standard pour mesurer le coût réel de chaque Pod, Namespace et Service Kubernetes, et fournir des recommandations de **Rightsizing** (réajustement des ressources).

### 🔍 Anatomie Technique

**Analyse de Over-Provisioning dans Kubernetes :**

```
 ┌────────────────────────────────────────────────────────────┐
 │  CAPACITÉ ALLOUÉE (K8s Resource Requests)                  │
 │  Memory: 4096 MB | CPU: 2.0 Cores  ──► Facturé par AWS    │
 └──────────────────────────────┬─────────────────────────────┘
                                │
                                ▼ (Écart de sur-dimensionnement = Gaspillage 85%)
 ┌──────────────────────────────┴─────────────────────────────┐
 │  CONSOMMATION RÉELLE MESURÉE (KubeCost / Prometheus)       │
 │  Memory: 380 MB | CPU: 0.15 Cores                         │
 └────────────────────────────────────────────────────────────┘
```

**Optimisation des Resource Requests/Limits avec Vertical Pod Autoscaler (VPA) (`vpa_config.yaml`) :**

```yaml
# Recommandation automatique de dimensionnement par le VPA Kubernetes
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: bcc-api-vpa
  namespace: bcc-production
spec:
  targetRef:
    apiVersion: "apps/v1"
    kind: Deployment
    name: bcc-api
  updatePolicy:
    updateMode: "Off" # Mode recommandation uniquement (pas de redémarrage automatique)
```

---

## 3) Module — Instances Réservées, Savings Plans & Spot Instances (2h)

### 📖 Narration/Intuition

Payer l'intégralité des serveurs cloud au tarif **On-Demand** (à la seconde sans engagement) est l'option la plus chère. Pour une infrastructure stable qui tourne 24h/24 comme la BCC, combiner des **Savings Plans** (engagement 1 ou 3 ans) et des **Spot Instances** (capacité inutilisée vendue jusqu'à -90% de réduction) permet de réduire la facture globale de 50% à 70%.

### 🛠️ Atelier Pratique

**Stratégie Mixte d'Achat d'Infrastructure AWS BCC :**

```
┌─────────────────────────────────────────────────────────────────┐
│ BASELINE 24/7 (60% des besoins)                                 │
│  - AWS Compute Savings Plans (Engagement 3 ans)                │
│  - Réduction : -66% par rapport au tarif On-Demand             │
│  - Pour : BDD PostgreSQL RDS, Master Nodes EKS                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CHARGES VARIABLES STABLES (20% des besoins)                     │
│  - Tarification On-Demand                                       │
│  - Pour : Ingress Controllers, Services critiques avec spikes   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CHARGES BATCH / WORKERS TOLÉRANTS (20% des besoins)             │
│  - AWS Spot Instances                                           │
│  - Réduction : Jusqu'à -90%                                     │
│  - Pour : Workers Spark, Jobs d'encodage, CI/CD Runner Agents   │
└─────────────────────────────────────────────────────────────────┘
```

**Configuration d'un NodeGroup EKS Mixte (On-Demand + Spot) (`eks_nodegroup.tf`) :**

```hcl
# NodeGroup EKS tolérant utilisant des Spot Instances pour les workers
resource "aws_eks_node_group" "spot_workers" {
  cluster_name    = aws_eks_cluster.bcc.name
  node_group_name = "bcc-spot-workers"
  node_role_arn   = aws_iam_role.node_role.arn
  subnet_ids      = aws_subnet.private_subnets[*].id

  capacity_type  = "SPOT" # Instances Spot AWS (-70% à -90% de coût)
  instance_types = ["t3.xlarge", "t3a.xlarge", "m5.xlarge"] # Diversification obligatoire !

  scaling_config {
    desired_size = 4
    min_size     = 2
    max_size     = 10
  }

  labels = {
    "intent" = "batch-processing"
  }

  taints {
    key    = "spotInstance"
    value  = "true"
    effect = "PREFER_NO_SCHEDULE"
  }
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **FinOps** | Financial Operations — Discipline d'optimisation financière et gestion des coûts cloud |
| **VPA** | Vertical Pod Autoscaler — Ajustement automatique de la mémoire et CPU d'un Pod K8s |
| **RI** | Reserved Instance — Instance réservée sur 1 ou 3 ans en échange d'une réduction financière |
| **SP** | Savings Plan — Engagement financier flexible AWS réduisant les coûts de compute |
| **OOMKill** | Out Of Memory Killer — Processus K8s/Linux supprimant un conteneur dépassant sa RAM limit |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre les `requests` et les `limits` de ressources dans Kubernetes, et quelle erreur commettent souvent les ingénieurs lors de leur configuration ?

**Corrigé :** Les `requests` (requêtes) définissent la quantité minimale de CPU et RAM garantie pour le Pod. Kubernetes utilise cette valeur pour décider sur quel Worker Node placer (scheduler) le Pod. Les `limits` (limites) définissent le plafond maximal de ressources que le Pod n'a pas le droit de dépasser. Si le Pod dépasse sa limite de RAM, il est immédiatement supprimé par l'OOMKiller (`OOMKilled`). Erreur fréquente : Définir des `requests` artificiellement très élevées (ex: 4 GB de RAM) pour éviter l'OOMKill, alors que l'application n'utilise que 300 MB en moyenne. Cela bloque la mémoire du Worker Node et empêche d'autres Pods de s'y installer, forçant le cluster à provisionner des serveurs physiques inutiles.

**Exercice 2 :** Pourquoi la **diversification des types d'instances** (ex: `t3.xlarge`, `t3a.xlarge`, `m5.xlarge`) est-elle une condition obligatoire lors de la configuration d'un NodeGroup Kubernetes basé sur des **Spot Instances** ?

**Corrigé :** Les Spot Instances AWS sont des capacités de calcul inutilisées remises aux enchères. AWS peut interrompre et reprendre une Spot Instance à tout moment avec un **préavis de seulement 2 minutes** si la demande On-Demand augmente pour ce type précis d'instance dans cette Zone de Disponibilité. Si votre NodeGroup Spot ne demande qu'un seul type d'instance (ex: uniquement `c5.xlarge`), et qu'AWS manque de cette instance précise, **tous vos nœuds Spot peuvent être interrompus simultanément**, provoquant une panne de vos batchs. En diversifiant sur plusieurs familles et tailles d'instances, vous vous assurez qu'AWS trouvera toujours de la capacité Spot disponible parmi la liste, garantissant la haute disponibilité de vos workers à bas coût.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le premier des 3 piliers du cycle de vie **FinOps** permettant de mesurer et d'imputer les coûts cloud aux différentes équipes ?
- A) Inform (Informer)
- B) Delete
- C) Ignore
- D) Encrypt

**Réponse : A**

**Q2 :** Quel outil spécialisé pour Kubernetes permet d'analyser le coût réel de chaque Pod et de recommander un **Rightsizing** des `requests` et `limits` ?
- A) KubeCost
- B) Wireshark
- C) Helm
- D) Git

**Réponse : A**

**Q3 :** Que se passe-t-il si un conteneur Kubernetes dépasse la quantité de mémoire (RAM) définie dans son instruction `limits` ?
- A) Le conteneur est immédiatement arrêté et tué par le noyau Linux / K8s (`OOMKilled`)
- B) Le conteneur continue de s'exécuter sans problème
- C) La facture AWS est automatiquement doublée
- D) Le Pod est déplacé sur un autre serveur

**Réponse : A**

**Q4 :** Combien de temps de préavis AWS fournit-il avant d'interrompre une **Spot Instance** pour récupérer la capacité de calcul ?
- A) 2 minutes
- B) 24 heures
- C) 1 heure
- D) Aucun préavis

**Réponse : A**

**Q5 :** Quelle stratégie d'achat AWS offre la plus grande réduction financière (jusqu'à -66%) pour les charges de travail stables qui tournent 24h/24 pendant 3 ans (ex: bases de données cœurs) ?
- A) AWS Compute Savings Plans (Engagement 3 ans)
- B) Tarification On-Demand
- C) Free Tier
- D) Pay-As-You-Go sans engagement

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
