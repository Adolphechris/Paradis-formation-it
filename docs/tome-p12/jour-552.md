# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 552 (6h) : Digital Transformation & IT Strategy : OKR, Product-Led Growth & Métriques DORA

> [!NOTE]
> **Objectifs pédagogiques :**
> - Piloter la **Transformation Numérique** d'une organisation en alignant la stratégie IT sur les objectifs business
> - Structurer la stratégie d'ingénierie à l'aide du framework **OKR (Objectives and Key Results)**
> - Opérer la transition d'une organisation **Project-Centric** (mode projet classique) vers une organisation **Product-Centric** (Product-Led Growth)
> - Évaluer et optimiser l'efficacité de l'ingénierie logicielle grâce aux **4 métriques clés DORA** (Deployment Frequency, Lead Time, CFR, MTTR)
>
> **Compétences visées :** `POL-01` (A), `DEV-03` (A) — IT Strategy, OKRs & Product-Led Transformation

---

## Module 1 — Alignement Stratégique & Cadre OKR (2h)

### 📖 Intuition & Narration

Traditionnellement, l'informatique était considérée comme un centre de coûts ("Cost Center") dont l'objectif était de "livrer des projets à l'heure et dans le budget". Dans l'ère numérique moderne, **l'informatique EST le produit et le moteur de croissance principal** ("Revenue Driver").

Les entreprises qui réussissent ne gèrent pas des projets avec une date de fin arbitraire ; elles gèrent des **produits logiciels durables** animés par des équipes autonomes et pluridisciplinaires centrées sur la valeur client.

Le framework **OKR (Objectives and Key Results)**, popularisé par Intel et Google, est l'outil privilégié pour aligner les objectifs d'ingénierie avec les priorités stratégiques de l'entreprise :

```
CADRE DE DÉCLINAISON DES OKR (STRATÉGIQUE → ÉQUIPE)

  OBJECTIF STRATÉGIQUE ENTREPRISE (O)
  "Devenir le leader européen des services bancaires numériques sécurisés"
  │
  ├── KEY RESULT 1 (KR1) : Atteindre 2 millions d'utilisateurs actifs mensuels (MAU)
  ├── KEY RESULT 2 (KR2) : Réduire le temps d'ouverture de compte à < 3 minutes
  └── KEY RESULT 3 (KR3) : Maintenir zéro fuite de données majeure (Compliance DORA/ISO27001)
         │
         ▼
  OKR D'ÉQUIPE INGÉNIERIE (PLATFORM ENGINEERING)
  (O) "Fournir une plateforme interne permettant aux équipes d'expédier du code en toute sécurité"
  ├── KR1 : Réduire le Lead Time for Changes de 14 jours à < 2 heures
  ├── KR2 : Automatiser la conformité DevSecOps à 100% dans le pipeline CI/CD
  └── KR3 : Maintenir la disponibilité du cluster Kubernetes à 99.99% SLO
```

---

## Module 2 — Transition Project to Product & Métriques DORA (2h)

### 🔍 Project-Led vs Product-Led Organization

```
MODÈLE PROJET vs MODÈLE PRODUIT

  CRITÈRE            │ MODÈLE PROJET (TRADITIONNEL)   │ MODÈLE PRODUIT (MODERNE)
  ───────────────────┼────────────────────────────────┼─────────────────────────────────
  Focus              │ Respect des délais / budgets   │ Valeur délivrée / KPIs business
  Financement        │ Budgets annuels par projet     │ Budgets stables par équipe produit
  Équipes            │ Temporaires (dissoutes après)  │ Permanentes et pluridisciplinaires
  Responsabilité     │ "Livrer et oublier" (Hand-off) │ "You build it, you run it" (SRE)
  Succès mesuré par  │ Output (nombre de fonctionnalités)│ Outcome (impact sur le client)
```

### 🔍 Les 4 Métriques Clés DORA (DevOps Research & Assessment)

Les métriques DORA mesurent la performance d'une organisation d'ingénierie logicielle selon 4 indicateurs scientifiquement validés :

```
LES 4 MÉTRIQUES CLÉS DORA

  MÉTRIQUE                   │ NIVEAU ELITE           │ NIVEAU FAIBLE
  ───────────────────────────┼────────────────────────┼──────────────────────
  1. Deployment Frequency    │ Plusieurs fois par jour│ Une fois par trimestre
     (Fréquence déploiement) │                        │
  2. Lead Time for Changes   │ < 1 heure              │ 1 à 6 mois
     (Temps de traversée)    │                        │
  3. Change Failure Rate     │ 0% - 15%               │ 46% - 60%
     (Taux d'échec des prod) │                        │
  4. Time to Restore (MTTR)  │ < 1 heure              │ > 1 semaine
     (Temps de rétablissement)│                       │
```

---

## Module 3 — Calculateur de Performance Engineering (1h30)

### 🛠️ Script Python : DORA Metrics & Engineering Health Calculator

```python
#!/usr/bin/env python3
"""
PARADIS — DORA Metrics & Engineering Health Calculator
Calcule et catégorise la maturité d'ingénierie d'une organisation selon les normes DORA.
"""
from dataclasses import dataclass
from typing import List

@dataclass
class DORAMetricsInput:
    team_name: str
    deployments_per_month: float
    lead_time_hours: float
    total_deploys: int
    failed_deploys: int
    mean_recovery_hours: float

class DORAEvaluator:
    def __init__(self, data: DORAMetricsInput):
        self.data = data

    def evaluate(self):
        print("=" * 65)
        print(f"  ÉVALUATION DE PERFORMANCE DORA — ÉQUIPE : {self.data.team_name}")
        print("=" * 65)
        print()

        # 1. Deployment Frequency
        df = self.data.deployments_per_month
        if df >= 30:
            df_rating = "ELITE (Plusieurs fois par jour)"
        elif df >= 4:
            df_rating = "HAUT (Une fois par semaine à une fois par jour)"
        elif df >= 1:
            df_rating = "MOYEN (Une fois par mois)"
        else:
            df_rating = "FAIBLE (Moins d'une fois par mois)"

        # 2. Lead Time for Changes
        lt = self.data.lead_time_hours
        if lt < 24:
            lt_rating = "ELITE (< 1 jour)"
        elif lt <= 168:
            lt_rating = "HAUT (1 jour à 1 semaine)"
        elif lt <= 720:
            lt_rating = "MOYEN (1 semaine à 1 mois)"
        else:
            lt_rating = "FAIBLE (> 1 mois)"

        # 3. Change Failure Rate
        cfr = (self.data.failed_deploys / self.data.total_deploys) * 100 if self.data.total_deploys > 0 else 0
        if cfr <= 15:
            cfr_rating = "ELITE (0 - 15%)"
        elif cfr <= 30:
            cfr_rating = "HAUT (16 - 30%)"
        else:
            cfr_rating = "FAIBLE (> 30%)"

        # 4. Time to Restore (MTTR)
        mttr = self.data.mean_recovery_hours
        if mttr < 1:
            mttr_rating = "ELITE (< 1 heure)"
        elif mttr <= 24:
            mttr_rating = "HAUT (< 1 jour)"
        elif mttr <= 168:
            mttr_rating = "MOYEN (< 1 semaine)"
        else:
            mttr_rating = "FAIBLE (> 1 semaine)"

        print(f"  📊 1. Deployment Frequency : {df:.1f} déploiments/mois → Niveau: {df_rating}")
        print(f"  ⏱️ 2. Lead Time for Changes: {lt:.1f} heures → Niveau: {lt_rating}")
        print(f"  💥 3. Change Failure Rate  : {cfr:.1f}% ({self.data.failed_deploys}/{self.data.total_deploys}) → Niveau: {cfr_rating}")
        print(f"  🚑 4. Time to Restore (MTTR): {mttr:.1f} heures → Niveau: {mttr_rating}")
        print()

        # Score global de maturité
        ratings = [df_rating, lt_rating, cfr_rating, mttr_rating]
        elite_count = sum(1 for r in ratings if "ELITE" in r)
        haut_count = sum(1 for r in ratings if "HAUT" in r)

        print("─" * 65)
        if elite_count >= 3:
            global_level = "🏆 ÉQUIPE HIGH-PERFORMER (ELITE DORA LEVEL)"
        elif elite_count + haut_count >= 3:
            global_level = "🟢 ÉQUIPE PERFORMANTE (HIGH DORA LEVEL)"
        else:
            global_level = "⚠️ AXES D'AMÉLIORATION MAJEURS REQUIS"

        print(f"  STATUT GLOBAL : {global_level}")
        print("=" * 65)


if __name__ == "__main__":
    # Test Équipe Platform Engineering PARADIS
    team_data = DORAMetricsInput(
        team_name="Core Platform & Cloud SecOps",
        deployments_per_month=45.0,     # Déploiements multiples par jour
        lead_time_hours=1.5,             # 1h30 du commit au déploiement prod
        total_deploys=120,
        failed_deploys=4,                # 3.3% d'échecs
        mean_recovery_hours=0.4          # MTTR = 24 minutes
    )

    evaluator = DORAEvaluator(team_data)
    evaluator.evaluate()
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OKR** | Objectives and Key Results — Cadre de définition d'objectifs ambitieux et mesurables |
| **DORA** | DevOps Research & Assessment — Organisme et référentiel de mesure de performance en ingénierie logicielle |
| **MTTR** | Mean Time to Restore — Temps moyen de rétablissement d'un service après une panne |
| **CFR** | Change Failure Rate — Pourcentage de déploiements en production ayant entraîné un incident ou une dégradation |
| **PLG** | Product-Led Growth — Stratégie de croissance guidée par la valeur du produit utilisateur |

---

## Exercices Pratiques

### Exercice 1 — Rédaction d'un OKR d'Ingénierie

Rédigez un **OKR d'équipe d'ingénierie** (1 Objectif et 3 Key Results mesurables) pour une équipe souhaitant amener sa métrique **Change Failure Rate (CFR)** du niveau Faible (35%) au niveau Elite (< 10%).

**Corrigé guidé :**
- **Objectif (O)** : *"Bâtir un pipeline de livraison ultra-fiable et éliminer les incidents de mise en production."*
- **Key Result 1 (KR1)** : Réduire le Change Failure Rate (CFR) de 35% à moins de 8% d'ici la fin du trimestre.
- **Key Result 2 (KR2)** : Automatiser les tests de non-régression et le scan SAST/SCA pour couvrir 100% des pull requests.
- **Key Result 3 (KR3)** : Réduire le temps moyen de rollback (MTTR) à moins de 15 minutes grâce au canary deployment automatisé dans Kubernetes.

---

## Banque QCM — 5 Questions

**Q1.** Dans le framework **OKR**, quelle est la caractéristique principale d'un **Key Result (KR)** ?

- A) C'est une liste de tâches à accomplir chaque jour.
- B) C'est un résultat quantifiable, mesurable avec un chiffre précis, qui valide si l'Objectif a été atteint. ✅
- C) C'est une description qualitative vague.
- D) C'est le budget alloué au projet.

**Q2.** Quelle est l'une des différences majeures entre une organisation **Project-Centric** et une organisation **Product-Centric** ?

- A) Le modèle projet utilise Kubernetes, le modèle produit non.
- B) Le modèle projet dissout les équipes une fois la date de livraison atteinte, tandis que le modèle produit maintient des équipes permanentes pluridisciplinaires responsables du produit dans la durée ("You build it, you run it"). ✅
- C) Le modèle produit ne fait aucun test de sécurité.
- D) Le modèle projet n'a pas de budget.

**Q3.** Les **4 métriques DORA** mesurent la performance en ingénierie logicielle. Lesquelles sont les 4 métriques officielles ?

- A) Nombre de lignes de code, Nombre de bugs, Budget consommé, Nombre de réunions
- B) Deployment Frequency, Lead Time for Changes, Change Failure Rate, Time to Restore (MTTR) ✅
- C) CPU usage, RAM usage, Storage capacity, Network latency
- D) Velociy Story Points, Code Coverage, Star GitHub, Tickets Closed

**Q4.** Une organisation ayant un **Lead Time for Changes** inférieur à 1 heure et un **Time to Restore (MTTR)** inférieur à 1 heure se classe dans la catégorie DORA :

- A) Faible (Low Performer)
- B) Moyen (Medium Performer)
- C) Élite (Elite Performer) ✅
- D) Théorique

**Q5.** Que mesure la métrique DORA **Change Failure Rate (CFR)** ?

- A) Le temps nécessaire pour compiler le code source.
- B) Le pourcentage de changements ou déploiements en production nécessitant une intervention d'urgence, un rollback ou entraînant un incident. ✅
- C) Le nombre de développeurs ayant quitté l'entreprise.
- D) Le nombre de commits rejetés lors de la revue de code.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
