# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 147 (6h) : Sécurité des Infrastructures Cloud Native Avancées (FinOps & Cloud Cost Security, Anomaly Detection & Cloud Waste)

> [!NOTE]
> **Objectif du jour :** Concevoir et implémenter une stratégie FinOps (Cloud Financial Operations) sécurisée : détection des ressources cloud mal configurées et coûteuses, alertes budgétaires multi-cloud (AWS Budgets / GCP Budget Alerts), politiques d'arrêt automatique des ressources oisives, analyse des coûts par tag de sécurité et corrélation FinOps ↔ CSPM.
>
> **Compétences visées :** `POL-03` (A) — FinOps & Cloud Cost Management | `BIT-08` (A) — Cost Anomaly Detection & Cloud Governance

---

## 1) Module — FinOps : Alignment Coût, Performance & Sécurité Cloud (2h)

### 📖 Narration/Intuition

En 2026, la BCC a migré 60% de ses workloads vers le cloud AWS et Azure. Le responsable DSI découvre une facture cloud mensuelle de 450 000$ alors que le budget était de 120 000$. L'enquête révèle qu'un développeur a oublié d'éteindre 20 instances de test GPU m6g.16xlarge, qu'un bucket S3 verse des données de log vers une instance EC2 en cross-region, et que plusieurs ENIs (Elastic Network Interfaces) abandonnées génèrent des coûts de transfert de données inutiles.

**FinOps (Cloud Financial Operations)** est la discipline qui aligne les équipes Finance, Opérations et Développement autour de la visibilité et l'optimisation des coûts cloud, tout en maintenant les performances et la sécurité.

### 🔍 Anatomie Technique

**Triangulation FinOps — Coût / Performance / Sécurité :**

```
                    ┌─────────────────────┐
                    │    FINOPS TARGET     │
                    │  Cost + Performance  │
                    │      + Security      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ ÉQUIPE FINANCE  │  │ ÉQUIPE PLATFORM │  │ ÉQUIPE SECURITY │
│ Budget Alerts   │  │ Right-sizing    │  │ CSPM Policies   │
│ Cost allocation │  │ Auto-scaling    │  │ Tag enforcement │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 2) Module — Taggage Sécurisé & Anomaly Detection (2h)

### 📖 Narration/Intuition

Pour attribuer les coûts cloud à chaque équipe et détecter les ressources sans propriétaire (orphelines), toutes les ressources cloud de la BCC doivent être **obligatoirement taguées** avec au minimum : `Environnement`, `Equipe`, `CentreDeCoût`, `Classification-Données` et `NomProjet`.

La politique OPA/SCP (Service Control Policy) bloque la création de toute ressource sans ces tags. La détection d'anomalie de coût AWS (Cost Anomaly Detection) déclenche une alerte SNS si les dépenses d'une catégorie augmentent de plus de 20% par rapport à la baseline.

### 🔍 Anatomie Technique

**AWS SCP bloquant la création de ressources non taguées (`scp_tag_enforcement.json`) :**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RequiredTagsEnforcement",
      "Effect": "Deny",
      "Action": ["ec2:RunInstances", "rds:CreateDBInstance", "s3:CreateBucket"],
      "Resource": "*",
      "Condition": {
        "Null": {
          "aws:RequestTag/Equipe": "true",
          "aws:RequestTag/CentreDeCoût": "true",
          "aws:RequestTag/Environnement": "true"
        }
      }
    }
  ]
}
```

---

## 3) Module — Politiques d'Économie Automatique & Rightsizing (2h)

### 📖 Narration/Intuition

Un des leviers les plus impactants du FinOps est l'**Arrêt Automatique** des environnements de développement et de test en dehors des heures ouvrées. Une instance EC2 `m6i.2xlarge` coûte environ 300$/mois si elle tourne 24/7. En l'éteignant 16 heures par jour et les week-ends, son coût tombe à 70$/mois.

### 🔍 Anatomie Technique

**Lambda Python d'arrêt automatique des instances non-production (`auto_stop_nonprod.py`) :**

```python
#!/usr/bin/env python3
"""
auto_stop_nonprod.py — Lambda AWS d'arrêt automatique des instances Dev/Test hors heures ouvrées
Déclenchée par EventBridge Scheduler à 19h00 (UTC+2) du lundi au vendredi
"""
import boto3
import logging

logger = logging.getLogger()
ec2 = boto3.client('ec2', region_name='eu-west-3')

def lambda_handler(event, context):
    # Identifier les instances DEV/TEST actives (Tag Environnement = dev ou test)
    instances = ec2.describe_instances(
        Filters=[
            {'Name': 'tag:Environnement', 'Values': ['dev', 'test', 'staging']},
            {'Name': 'instance-state-name', 'Values': ['running']}
        ]
    )

    ids_a_arreter = []
    for reservation in instances['Reservations']:
        for instance in reservation['Instances']:
            ids_a_arreter.append(instance['InstanceId'])

    if ids_a_arreter:
        ec2.stop_instances(InstanceIds=ids_a_arreter)
        logger.info(f"✅ {len(ids_a_arreter)} instances non-production arrêtées : {ids_a_arreter}")
        return {"status": "OK", "stopped": ids_a_arreter}
    else:
        logger.info("Aucune instance non-production active à arrêter.")
        return {"status": "OK", "stopped": []}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **FinOps** | Cloud Financial Operations — Discipline d'optimisation des coûts cloud en temps réel |
| **Rightsizing** | Ajustement des types d'instances cloud à leur consommation réelle |
| **SCP** | Service Control Policy — Politique de contrôle de service AWS Organizations |
| **ENI** | Elastic Network Interface — Interface réseau virtuelle AWS |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Comment la mise en œuvre d'une politique de **taggage obligatoire** sur les ressources cloud contribue-t-elle à la fois à la **sécurité** et à l'**optimisation des coûts FinOps** ?

**Corrigé :** Du point de vue **sécurité**, le taggage obligatoire (`Environnement=prod`, `Classification-Données=confidentiel`) permet au CSPM (Cloud Security Posture Management) de détecter automatiquement les ressources hébergeant des données sensibles et d'appliquer les contrôles de sécurité appropriés (chiffrement, restriction d'accès). Du point de vue **FinOps**, les tags d'équipe (`Equipe=FinanceOps`, `CentreDeCoût=CC-001`) permettent d'attribuer les coûts cloud à chaque département avec précision, d'identifier les ressources orphelines sans propriétaire et d'enforcer les politiques d'arrêt automatique.

**Exercice 2 :** Quel est le principe du **Rightsizing** des instances cloud et comment l'automatiser ?

**Corrigé :** Le **Rightsizing** consiste à analyser la consommation CPU, RAM et réseau réelle d'une instance cloud sur 2 à 4 semaines, puis à la redimensionner à un type d'instance adapté à sa charge réelle. Une instance `m6i.8xlarge` avec une utilisation CPU moyenne de 5% peut être réduite à `m6i.xlarge` sans impact sur les performances, réduisant son coût de 75%. Sur AWS, le service **AWS Compute Optimizer** analyse automatiquement les métriques CloudWatch et génère des recommandations de rightsizing.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle discipline cloud aligne les équipes Finance, Opérations et Développement autour de la visibilité et de l'optimisation des coûts d'infrastructure cloud en temps réel ?
- A) FinOps (Cloud Financial Operations)
- B) MS-DOS
- C) Photoshop
- D) Disquette

**Réponse : A**

**Q2 :** Quel mécanisme de gouvernance AWS empêche au niveau organisationnel la création de ressources cloud (EC2, S3, RDS) sans les tags obligatoires requis ?
- A) SCP (Service Control Policy) dans AWS Organizations
- B) Câble HDMI
- C) Port parallèle
- D) Clé USB

**Réponse : A**

**Q3 :** Quel service AWS analyse automatiquement les métriques de consommation des instances EC2 et génère des recommandations de rightsizing pour réduire les coûts ?
- A) AWS Compute Optimizer
- B) Paint
- C) Word
- D) Calculator

**Réponse : A**

**Q4 :** Quelle stratégie FinOps d'économie automatique permet de réduire de 75% le coût d'instances de développement ?
- A) Arrêt automatique hors heures ouvrées (soir et week-end via Lambda EventBridge)
- B) Brancher plus de câbles
- C) Changer la couleur des serveurs
- D) Réduire la bande passante

**Réponse : A**

**Q5 :** À quelle pratique FinOps de gouvernance cloud correspond l'identification et la suppression de ressources sans tag propriétaire, ENIs abandonnées et snapshots orphelins ?
- A) Détection et nettoyage des ressources oisives / Cloud Waste Management
- B) Impression de documents
- C) Agrandissement des bureaux
- D) Achat de nouvelles souris

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
