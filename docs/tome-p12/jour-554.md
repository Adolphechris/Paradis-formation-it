# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 554 (6h) : Platform Engineering & Internal Developer Platform (IDP) : Backstage, Golden Paths & DevEx

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre le paradigme du **Platform Engineering** comme réponse à la charge cognitive excessive du DevOps traditionnel ("DevOps Cognitive Load Paradox")
> - Concevoir une **Internal Developer Platform (IDP)** proposant des **Golden Paths** (trajectoires d'auto-service sécurisées)
> - Déployer et configurer **Spotify Backstage** (Catalogue de services, Software Templates, TechDocs)
> - Évaluer la **Developer Experience (DevEx)** selon les piliers Feedback Loops, Cognitive Load et Flow State (framework SPACE)
>
> **Compétences visées :** `DEV-03` (A), `INFRA-02` (A) — Platform Engineering, IDP, Developer Experience (DevEx)

---

## Module 1 — Du DevOps au Platform Engineering (2h)

### 📖 Intuition & Narration

Le slogan DevOps "You build it, you run it" est parti d'une excellente intention : responsabiliser les développeurs. Mais en pratique, il a débouché sur le **Paradoxe de la Charge Cognitive** : un développeur moderne doit maîtriser Docker, Kubernetes, Terraform, Helm, Prometheus, Istio, IAM, les politiques OPA, le chiffrement KMS et les pipelines CI/CD — en plus du code métier de son application !

Le résultat : des développeurs frustrés, ralentis et anxieux, passant plus de temps à déboguer des fichiers YAML qu'à créer de la valeur métier.

Le **Platform Engineering** ne remplace pas le DevOps : il crée une équipe **Platform Team** dont les développeurs internes sont les clients. Cette équipe construit un produit : l'**Internal Developer Platform (IDP)**.

### 🔍 Le Concept de Golden Path (Voie Dorée)

Un **Golden Path** est un chemin d'auto-service prédéfini, sécurisé, conforme et optimisé qui permet à un développeur de créer, déployer et surveiller un microservice en production **sans avoir besoin de demander de ticket à l'équipe Infra/Ops**.

```
DIFFÉRENCE ENTRE DEVOPS CLASSIQUE ET PLATFORM ENGINEERING

  DEVOPS TRADITIONNEL (Cognitive Overload)
  ┌──────────────┐
  │ Développeur  │──→ Doit tout gérer : K8s, Terraform, Helm, CI/CD, Monitoring, IAM...
  └──────────────┘    (Fort risque d'erreurs et de frustration)

  PLATFORM ENGINEERING (Golden Path IDP)
  ┌──────────────┐      ┌────────────────────────────────────────────────────────┐
  │ Développeur  │─────→│ INTERNAL DEVELOPER PLATFORM (IDP - Backstage / Port)   │
  └──────────────┘      │  • Auto-Service : 1 Clic pour créer un Microservice    │
                        │  • Golden Paths : K8s, CI/CD, Monitoring pré-configurés│
                        └───────────────────────────┬────────────────────────────┘
                                                    │
                                                    ▼
                        ┌────────────────────────────────────────────────────────┐
                        │ PLATFORM TEAM (Product Manager + Platform Engineers)   │
                        │ Maintient la plateforme comme un Produit Interne.      │
                        └────────────────────────────────────────────────────────┘
```

---

## Module 2 — Architecture d'une IDP & Spotify Backstage (2h)

### 🔍 Les 5 Piliers d'une Internal Developer Platform (IDP)

```
ARCHITECTURE D'UNE INTERNAL DEVELOPER PLATFORM (IDP)

  ┌─────────────────────────────────────────────────────────────────────────┐
  │  1. DEVELOPER PORTAL (Interface d'auto-service)                         │
  │     Spotify Backstage / Port / Mia-Platform                             │
  │     Catalog de services, Software Templates, Documentation TechDocs     │
  ├─────────────────────────────────────────────────────────────────────────┤
  │  2. INFRASTRUCTURE ORCHESTRATOR (Orchestrateur de ressources)            │
  │     Humanitec / Kratix / Crossplane / Terraform Cloud                   │
  │     Traduit les intentions de l'IDP en ressources cloud réelles        │
  ├─────────────────────────────────────────────────────────────────────────┤
  │  3. APPLICATION CONFIGURATION ENGINE                                    │
  │     Helm / Kustomize / ArgoCD / FluxCD                                  │
  │     Génération et synchronisation des manifestes Kubernetes             │
  ├─────────────────────────────────────────────────────────────────────────┤
  │  4. CI/CD & AUTOMATION                                                  │
  │     GitLab CI / GitHub Actions / Tekton                                 │
  ├─────────────────────────────────────────────────────────────────────────┤
  │  5. OBSERVABILITY & GOVERNANCE                                          │
  │     Prometheus / Grafana / OPA Gatekeeper / Datadog                     │
  └─────────────────────────────────────────────────────────────────────────┘
```

### 🛠️ Configuration Backstage : Software Template (Golden Path)

```yaml
# backstage/templates/python-microservice-template.yaml
# Template Backstage d'auto-service : crée un d'un microservice Python sécurisé avec CI/CD et K8s
apiVersion: skiprows.backstage.io/v1alpha1
kind: Template
metadata:
  name: python-microservice-golden-path
  title: "Python Microservice (Golden Path PARADIS)"
  description: "Crée un microservice FastAPI pré-configuré avec Docker, GitLab CI DevSecOps, Helm chart et règles Prometheus."
  tags:
    - python
    - fastapi
    - golden-path
    - recommended
spec:
  owner: platform-team
  type: service

  parameters:
    - title: Informations du Service
      required:
        - component_id
        - description
        - owner
      properties:
        component_id:
          title: Nom du Service (Slug)
          type: string
          description: Ex: payment-gateway, user-service
        description:
          title: Description
          type: string
        owner:
          title: Équipe Propriétaire
          type: string
          description: Ex: team-finance, team-core

  steps:
    - id: fetch-base
      name: Récupération du Skeleton Golden Path
      action: fetch:template
      input:
        url: ./skeleton
        values:
          component_id: ${{ parameters.component_id }}
          description: ${{ parameters.description }}
          owner: ${{ parameters.owner }}

    - id: publish
      name: Création du Dépôt Git
      action: publish:gitlab
      input:
        allowedOwners: ['paradis-org']
        repoUrl: gitlab.paradis.internal?repo=${{ parameters.component_id }}&owner=${{ parameters.owner }}

    - id: register
      name: Enregistrement dans le Catalogue Backstage
      action: catalog:register
      input:
        repoContentsUrl: ${{ steps['publish'].output.repoContentsUrl }}
        catalogInfoPath: '/catalog-info.yaml'

  output:
    links:
      - title: Dépôt Git
        url: ${{ steps['publish'].output.remoteUrl }}
      - title: Fiche du Composant dans le Catalogue
        icon: catalog
        entityRef: ${{ steps['register'].output.entityRef }}
```

---

## Module 3 — Calculateur DevEx (Developer Experience) (1h30)

### 🛠️ Script Python : DevEx & Cognitive Load Assessor (Framework SPACE)

```python
#!/usr/bin/env python3
"""
PARADIS — Developer Experience (DevEx) & Cognitive Load Assessor
Évalue l'expérience développeur selon le framework SPACE (Satisfaction, Performance, Activity, Communication, Efficiency).
"""
from dataclasses import dataclass

@dataclass
class DevExSurveyData:
    team_name: str
    onboarding_days: float          # Temps moyen pour effectuer le 1er commit prod d'un nouveau dev
    time_spent_waiting_infra_h: float # Heures/semaine passées à attendre des tickets Infra/Ops
    yaml_config_time_percent: float # % du temps passé à configurer K8s/CI/CD (vs code métier)
    csat_score: float               # Client Satisfaction interne de 1 à 10

class DevExEvaluator:
    def __init__(self, data: DevExSurveyData):
        self.data = data

    def evaluate(self):
        print("=" * 65)
        print(f"  ÉVALUATION DEVEX & CHARGE COGNITIVE — {self.data.team_name}")
        print("=" * 65)
        print()

        # Score Charge Cognitive (0 = Faible/Parfait, 100 = Surcharge critique)
        cognitive_load_score = min(100.0, (
            (self.data.time_spent_waiting_infra_h * 5.0) +
            (self.data.yaml_config_time_percent * 1.2) +
            (self.data.onboarding_days * 3.0)
        ) / 2.5)

        print(f"  ⏱️ Temps d'Onboarding Nouveau Dev : {self.data.onboarding_days:.1f} jours")
        print(f"  ⏳ Attente Tickets Infra/Ops      : {self.data.time_spent_waiting_infra_h:.1f} heures/semaine")
        print(f"  ⚙️ Temps passé sur Config/YAML   : {self.data.yaml_config_time_percent:.1f}% du temps de dev")
        print(f"  😊 Satisfaction Développeur (CSAT): {self.data.csat_score:.1f} / 10.0")
        print("─" * 65)

        print(f"  🧠 SCORE DE CHARGE COGNITIVE     : {cognitive_load_score:.1f} / 100.0")
        if cognitive_load_score > 60.0:
            print("  🚨 DIAGNOSTIC : PARADOXE DE SURCHARGE DEVOPS CRITIQUE !")
            print("  [RECOMMANDATION] Urgence d'investir dans une Internal Developer Platform (IDP) et des Golden Paths.")
        elif cognitive_load_score > 30.0:
            print("  🟡 DIAGNOSTIC : CHARGE COGNITIVE MODÉRÉE.")
            print("  [RECOMMANDATION] Poursuivre l'automatisation des Golden Paths d'auto-service.")
        else:
            print("  🟢 DIAGNOSTIC : DEVEX EXCELLENT (Low Cognitive Load). IDP EFFICACE.")

        print("=" * 65)


if __name__ == "__main__":
    # Évaluation avant déploiement IDP
    before_idp = DevExSurveyData(
        team_name="Équipes Produit (Avant IDP)",
        onboarding_days=14.0,              # 2 semaines pour onboarding
        time_spent_waiting_infra_h=8.5,     # 8h30 d'attente tickets infra
        yaml_config_time_percent=35.0,      # 35% du temps sur YAML
        csat_score=4.5                      # CSAT faible
    )
    evaluator_before = DevExEvaluator(before_idp)
    evaluator_before.evaluate()
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **IDP** | Internal Developer Platform — Plateforme d'auto-service interne pour les développeurs |
| **DevEx** | Developer Experience — Qualité de l'expérience de travail des développeurs dans une organisation |
| **Golden Path** | Voie dorée — Trajectoire d'auto-service standardisée, sécurisée et pré-configurée |
| **SPACE** | Framework de mesure de productivité Dev (Satisfaction, Performance, Activity, Communication, Efficiency) |
| **TechDocs** | Outil Spotify Backstage générant la documentation technique à partir du code (Docs-like-Code) |

---

## Exercices Pratiques

### Exercice 1 — Conception d'un Golden Path

Concevez la liste des étapes d'auto-service d'un **Golden Path** pour la création d'un nouveau microservice Java Spring Boot dans une entreprise financière. L'objectif est de réduire le temps de création de 3 semaines à 5 minutes.

**Corrigé guidé :**
1. **Sélection Template dans l'IDP (Backstage)** : Le dev choisit "Spring Boot Banking Microservice" et saisit le nom du service et l'équipe.
2. **Génération Git & Code** : L'IDP crée le dépôt GitLab avec la structure de code, Dockerfile, et gouvernance de tags.
3. **Pipeline CI/CD Sécurisé** : `.gitlab-ci.yml` pré-inclus avec SAST (Semgrep), SCA (Trivy) et signature Cosign.
4. **Manifestes Kubernetes & Helm** : Helm chart pré-configuré avec `SecurityContext` non-root et `NetworkPolicy` d'isolement.
5. **Observabilité & Alerting** : Dashboard Grafana et métriques Prometheus pré-câblés automatiquement dans l'IDP.

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce que le **Paradoxe de la Charge Cognitive (Cognitive Load Paradox)** en DevOps ?

- A) Le fait que les ordinateurs consomment trop d'électricité.
- B) Le phénomène où le principe "You build it, you run it" surcharge mentalement les développeurs qui doivent maîtriser trop d'outils d'infrastructure (K8s, Terraform, IAM, CI/CD) au détriment de l'écriture du code métier. ✅
- C) Une théorie sur le fonctionnement des réseaux de neurones.
- D) L'absence de documentation technique.

**Q2.** Quel est le rôle principal d'un **Golden Path (Voie Dorée)** dans une Internal Developer Platform (IDP) ?

- A) Offrir un chemin d'auto-service sécurisé et pré-configuré permettant aux développeurs de créer et déployer des services de manière autonome et conforme sans ouvrir de tickets. ✅
- B) Imposer un seul langage de programmation à toute l'entreprise.
- C) Remplacer tous les ingénieurs d'infrastructure par des robots.
- D) Accélérer la vitesse des cartes graphiques.

**Q3.** Quel outil open-source créé par Spotify est la référence mondiale pour bâtir un **Developer Portal** (Catalogue de services et Templates) ?

- A) Jenkins
- B) Spotify Backstage ✅
- C) Prometheus
- D) Ansible

**Q4.** Le framework **SPACE** est utilisé pour :

- A) Calculer la trajectoire des satellites dans le cloud.
- B) Évaluer de manière holistique la productivité et la Developer Experience (DevEx) des développeurs. ✅
- C) Gérer les espaces disque sur Kubernetes.
- D) Chiffrer les requêtes HTTP.

**Q5.** Dans l'organisation du Platform Engineering, comment l'équipe **Platform Team** considère-t-elle les développeurs internes ?

- A) Comme des subordonnés.
- B) Comme ses **clients internes**, et l'IDP comme un **produit interne** à faire évoluer selon leurs besoins. ✅
- C) Comme des concurrents.
- D) Comme des auditeurs de sécurité.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
