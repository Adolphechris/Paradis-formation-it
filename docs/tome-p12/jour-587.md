# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 587 (6h) : Interview Prep & Négociation Salariale — Technical Interview & System Design

> [!NOTE]
> **Objectifs pédagogiques :**
> - Déconstruire la boucle d'entretien technique d'une entreprise tech de premier plan (FAANG / Unicorn / Scale-up)
> - Maîtriser le framework **System Design Interview** en 4 étapes (Scope, High-Level Architecture, Deep Dive, Bottlenecks & Trade-offs)
> - Répondre avec brio aux questions comportementales (Behavioral Interviews) grâce au framework **STAR** (Situation, Task, Action, Result)
> - Mener une **négociation salariale efficace** basée sur la valeur, les données de marché (comp.dev, Levels.fyi) et la stratégie des offres multiples
>
> **Compétences visées :** `POL-03` (A), `PRO-01` (A) — Career Advancement, System Design Interview, Négociation Salariale

---

## Module 1 — La Boucle d'Entretien Technique & Behavioral STAR (2h)

### 📖 Anatomie d'une Boucle d’Entretien Tech Senior

La boucle d'embauche pour un poste de **Senior / Staff / Principal Engineer** se compose généralement de 5 à 6 étapes exigeantes :

```
BOUCLE D'ENTRETIEN SR/STAFF ENGINEER (5-6 ÉTAPES)

  ┌─────────────────────────────────────────────────────────────────┐
  │ 1. Recruiter Screen (30 min) — Validation fit, comp & attentes │
  ├─────────────────────────────────────────────────────────────────┤
  │ 2. Technical Screen / Live Coding (60 min) — Data struct/Algo   │
  ├─────────────────────────────────────────────────────────────────┤
  │ 3. System Design Interview 1 (60 min) — Architecture à échelle   │
  ├─────────────────────────────────────────────────────────────────┤
  │ 4. System Design Interview 2 / Coding (60 min) — Deep Dive Infra │
  ├─────────────────────────────────────────────────────────────────┤
  │ 5. Behavioral & Culture Fit (60 min) — Leadership & Collaboration│
  ├─────────────────────────────────────────────────────────────────┤
  │ 6. Executive / VP Engineering Screen (30 min) — Vision & Alignment│
  └─────────────────────────────────────────────────────────────────┘
```

### 🔍 Le Framework STAR pour les Entretiens Comportementaux

Les questions comportementales ("Racontez-moi une fois où vous avez géré un conflit d'architecture", "Parlez-moi d'une panne majeure que vous avez causée") évaluent votre maturité et votre leadership.

```
FRAMEWORK STAR — STRUCTURE DE RÉPONSE PARFAITE

  S — SITUATION (15% du temps) : Posez le contexte concrètement.
      Ex: "En 2025 chez Acme Corp, notre base PostgreSQL subissait des pics de charge à 100% CPU."

  T — TASK (15% du temps) : Expliquez l'objectif et votre rôle précis.
      Ex: "En tant que Lead Platform Engineer, je devais rétablir le SLA < 50ms sans couper le service."

  A — ACTION (50% du temps) : DÉTAILLEZ ce que VOUS avez fait (méthodologie, choix, leadership).
      Ex: "J'ai mis en place un read-replica avec PgBouncer, migré les requêtes analytiques et ajouté un cache Redis."

  R — RESULT (20% du temps) : Donnez des CHIFFRES et les enseignements (Impact).
      Ex: "Charge CPU réduite à 25%, latence P99 tombée de 450ms à 18ms, 0 incident sur les 12 mois suivants."
```

---

## Module 2 — System Design Interview Framework & Négociation Salariale (2h)

### 🔍 Le Framework System Design en 4 Étapes

```
FRAMEWORK SYSTEM DESIGN INTERVIEW (45–60 MIN)

  ÉTAPE 1 : CLARIFICATION DU SCOPE & REQUIREMENTS (5-8 min)
  - Functional Requirements : Que doit faire le système ? (ex: poster un tweet, lire sa timeline)
  - Non-Functional Requirements : Scalabilité (10M DAU), Latence (P99 < 100ms), Disponibilité (99.99%)
  - Back-of-the-envelope estimation : Débit QPS, Stockage sur 5 ans, Bande passante

  ÉTAPE 2 : HIGH-LEVEL DESIGN (10-15 min)
  - Schéma des composants majeurs : Clients → CDN → Load Balancer → API Gateway → Services → DB
  - Définition des APIs (REST / gRPC / GraphQL) et du modèle de données (SQL vs NoSQL)

  ÉTAPE 3 : DEEP DIVE ARCHITECTURAL (15-20 min)
  - Focus sur le composant le plus critique (ex: génération de Timeline, Caching, Consensus)
  - Choix des algorithmes, structures de données, partitioning / sharding keys

  ÉTAPE 4 : BOTTLENECKS, TRADE-OFFS & SCALABILITÉ (10 min)
  - Single Points of Failure (SPOF), stratégie de Failover, Rate Limiting, Observabilité
  - "Qu'est-ce qui casse si le trafic fait x10 ?" → Réponse avec arbitrages explicites
```

### 🔍 Négociation Salariale — Stratégies & Données de Marché

```
STRATÉGIE DE NÉGOCIATION SALARIALE EN 5 RÈGLES D'OR

  1. NE JAMAIS DONNER DE CHIFFRE EN PREMIER
     "Je me fie au barème de marché de votre entreprise pour ce niveau d'expertise Senior."

  2. CONNAÎTRE SA VALEUR (COMPENSATION GLOBALE / TC - Total Compensation)
     TC = Base Salary + Annual Bonus + Equity (RSU / Stock Options avec Vesting 4 ans)

  3. CRÉER DU LEVERAGE (Offres multiples)
     "J'ai deux autres processus en phase finale. Votre projet m'intéresse particulièrement,
      mais la proposition globale doit être alignée sur ces offres."

  4. NÉGOCIER L'ENSEMBLE DU PACKAGE (Pas seulement le fixe)
     Singing Bonus (Prime à la signature), Télétravail/Remote allowance, Formation budget, Equity

  5. RESTER PROFESSIONNEL & POSITIF
     Toujours exprimer son enthousiasme pour l'équipe tout en défendant sa valeur financière.
```

---

## Module 3 — Atelier Pratique : System Design Calculator & Offer Negotiator (1h30)

### 🛠️ Script Python : System Design Estimator & Salary Offer Evaluator

```python
#!/usr/bin/env python3
"""
PARADIS — System Design Back-of-Envelope Calculator & Salary Offer Evaluator
Outil d'estimation rapide pour les entretiens System Design et de calcul de Total Compensation (TC).
"""
import math
from dataclasses import dataclass
from typing import Dict, Any, List

# ─── PARTIE 1 : System Design Back-of-Envelope Estimator ───────────────────

class SystemDesignEstimator:
    """Calculateur d'estimations pour entretiens System Design (Capacity Planning)"""

    @staticmethod
    def estimate_traffic(dau: int, read_writes_per_user_day: int, read_ratio: float = 0.9) -> dict:
        """
        DAU = Daily Active Users
        read_ratio = % de requêtes de lecture (ex: 0.9 = 90% lectures, 10% écritures)
        """
        total_requests_per_day = dau * read_writes_per_user_day
        avg_qps = total_requests_per_day / (24 * 3600)
        peak_qps = avg_qps * 2.0  # Règle empirique : Peak = 2x Average QPS

        read_qps  = peak_qps * read_ratio
        write_qps = peak_qps * (1.0 - read_ratio)

        return {
            "total_req_per_day" : f"{total_requests_per_day:,.0f}",
            "avg_qps"           : f"{avg_qps:,.1f} QPS",
            "peak_qps"          : f"{peak_qps:,.1f} QPS",
            "read_qps_peak"     : f"{read_qps:,.1f} QPS",
            "write_qps_peak"    : f"{write_qps:,.1f} QPS",
        }

    @staticmethod
    def estimate_storage(dau: int, write_req_per_user_day: int, payload_kb: float, years: int = 5) -> dict:
        daily_writes = dau * write_req_per_user_day
        daily_bytes  = daily_writes * payload_kb * 1024
        yearly_bytes = daily_bytes * 365
        total_bytes  = yearly_bytes * years

        tb_5year = total_bytes / (1024 ** 4)
        pb_5year = tb_5year / 1024

        return {
            "daily_storage_gb" : f"{daily_bytes / (1024**3):,.2f} GB/jour",
            "yearly_storage_tb": f"{yearly_bytes / (1024**4):,.2f} TB/an",
            "five_year_total"  : f"{tb_5year:,.2f} TB ({pb_5year:.2f} PB)" if pb_5year >= 1 else f"{tb_5year:,.2f} TB"
        }

# ─── PARTIE 2 : Salary Offer Evaluator (Total Compensation) ────────────────

@dataclass
class JobOffer:
    company        : str
    role           : str
    base_salary_eur: float
    annual_bonus_pct: float     # Target bonus % (ex: 15.0)
    signing_bonus_eur: float
    equity_grant_eur : float    # Total RSU value over 4 years
    vesting_years  : float = 4.0
    remote_allowance: float = 0.0

class SalaryOfferEvaluator:
    """Calcule la Total Compensation (TC) annuelle et sur 4 ans"""

    def evaluate(self, offer: JobOffer) -> dict:
        annual_base   = offer.base_salary_eur
        annual_bonus  = annual_base * (offer.annual_bonus_pct / 100.0)
        annual_equity = offer.equity_grant_eur / offer.vesting_years
        year1_signing = offer.signing_bonus_eur

        tc_year1 = annual_base + annual_bonus + annual_equity + year1_signing + offer.remote_allowance
        tc_year2_plus = annual_base + annual_bonus + annual_equity + offer.remote_allowance
        total_4year = (tc_year2_plus * 4) + year1_signing

        return {
            "company"         : offer.company,
            "role"            : offer.role,
            "annual_base"     : f"{annual_base:,.0f} €",
            "annual_bonus"    : f"{annual_bonus:,.0f} € ({offer.annual_bonus_pct}%)",
            "annual_equity"   : f"{annual_equity:,.0f} €/an (RSU)",
            "tc_year_1"       : round(tc_year1, 0),
            "tc_year_2_plus"  : round(tc_year2_plus, 0),
            "total_4year_val" : round(total_4year, 0)
        }

    def compare(self, offers: List[JobOffer]):
        print("=" * 70)
        print("  💼 COMPARATIF D'OFFRES D'EMBAUCHE — TOTAL COMPENSATION (TC)")
        print("=" * 70)
        evals = [self.evaluate(o) for o in offers]
        evals.sort(key=lambda x: x["tc_year_1"], reverse=True)

        for e in evals:
            print(f"\n  🏢 {e['company']} — {e['role']}")
            print(f"     Salaire Fixe   : {e['annual_base']}")
            print(f"     Bonus Annuel   : {e['annual_bonus']}")
            print(f"     Equity RSU/an  : {e['annual_equity']}")
            print(f"     👉 TC Année 1   : {e['tc_year_1']:>10,.0f} €  🏆")
            print(f"     👉 TC Récurrente: {e['tc_year_2_plus']:>10,.0f} €/an")
            print(f"     💰 Total 4 ans  : {e['total_4year_val']:>10,.0f} €")
        print("=" * 70)


if __name__ == "__main__":
    print("=== PARADIS SYSTEM DESIGN & SALARY EVALUATOR ===\n")

    # 1. System Design Capacity Estimation (ex: Clone de Twitter / X)
    print("📐 SYSTEM DESIGN CAPACITY ESTIMATION — App Sociale (10M DAU)")
    est = SystemDesignEstimator()
    traffic = est.estimate_traffic(dau=10_000_000, read_writes_per_user_day=50, read_ratio=0.95)
    storage = est.estimate_storage(dau=10_000_000, write_req_per_user_day=2, payload_kb=2.5, years=5)

    print(f"  Traffic Total/jour : {traffic['total_req_per_day']}")
    print(f"  QPS Moyen          : {traffic['avg_qps']}")
    print(f"  QPS Crête (Peak)   : {traffic['peak_qps']}  (Read: {traffic['read_qps_peak']} | Write: {traffic['write_qps_peak']})")
    print(f"  Stockage/jour      : {storage['daily_storage_gb']}")
    print(f"  Stockage Total 5ans: {storage['five_year_total']}")

    print("\n" + "─"*70 + "\n")

    # 2. Salary Offer Evaluation
    evaluator = SalaryOfferEvaluator()
    offers = [
        JobOffer("ScaleUp Paris", "Staff Platform Engineer", 110_000, 15.0, 10_000, 80_000, 4.0, 2_400),
        JobOffer("Big Tech US (Remote)", "Senior Infrastructure Engineer", 135_000, 10.0, 15_000, 120_000, 4.0, 3_000),
        JobOffer("Fintech Unicorn", "Lead Security Architect", 125_000, 20.0, 5_000, 60_000, 4.0, 1_800),
    ]
    evaluator.compare(offers)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **STAR** | Situation, Task, Action, Result — Framework de réponse aux questions comportementales |
| **TC** | Total Compensation — Rémunération globale (Fixe + Bonus + Equity RSU + Signing Bonus) |
| **RSU** | Restricted Stock Units — Actions attribuées avec calendrier de vesting (généralement 4 ans) |
| **QPS** | Queries Per Second — Nombre de requêtes par seconde traitées par un système |
| **DAU** | Daily Active Users — Utilisateurs actifs quotidiens |
| **SPOF** | Single Point of Failure — Point d'impaire unique menaçant la disponibilité |

---

## Exercices Pratiques

### Exercice 1 — Estimation System Design pour Service de Messagerie (type WhatsApp)

On vous demande de concevoir le stockage pour un service de messagerie comptant **50 millions de DAU**. Chaque utilisateur envoie en moyenne **40 messages par jour**. Chaque message texte pèse en moyenne **200 octets**.

1. Calculez le volume quotidien de messages reçus/envoyés.
2. Calculez le stockage brut quotidien nécessaire (en GB).
3. Calculez le stockage brut nécessaire sur 3 ans (en TB/PB).

**Corrigé :**
1. Messages/jour = $50 \times 10^6 \times 40 = \mathbf{2 \times 10^9 \text{ messages/jour}} = 2 \text{ milliards}$.
2. Stockage/jour = $2 \times 10^9 \times 200 \text{ octets} = 400 \times 10^9 \text{ octets} = \mathbf{400 \text{ GB/jour}}$.
3. Stockage 3 ans = $400 \text{ GB/jour} \times 365 \times 3 = 438,000 \text{ GB} = \mathbf{438 \text{ TB}} \approx 0.438 \text{ PB}$.

---

## Banque QCM — 5 Questions

**Q1.** Dans le framework **STAR** pour les entretiens comportementaux, quelle section doit occuper la **plus grande partie (environ 50%)** de votre réponse ?

- A) Situation
- B) Task
- C) Action (ce que VOUS avez fait concrètement) ✅
- D) Result

**Q2.** Lors d'un entretien **System Design**, quelle est la **première étape obligatoire** à réaliser avant de dessiner des composants ?

- A) Choisir la base de données (NoSQL vs SQL).
- B) Clarifier les exigences fonctionnelles/non-fonctionnelles et estimer l'échelle (QPS, stockage). ✅
- C) Dessiner le Load Balancer.
- D) Écrire le schéma d'API.

**Q3.** Qu'est-ce que la **Total Compensation (TC)** pour un poste d'ingénieur tech senior ?

- A) Uniquement le salaire fixe brut annuel.
- B) La somme du salaire fixe, du bonus annuel, de la valeur annuelle de l'equity (RSUs/Options) et des avantages. ✅
- C) Le salaire après impôts.
- D) Le budget formation attribué.

**Q4.** Lors d'une négociation salariale, quelle est la règle d'or pour **garder le contrôle** sur les propositions ?

- A) Accepter immédiatement la première offre.
- B) Ne pas donner de prétention chiffrée exacte en premier, mais se référer aux données de marché et attendre la proposition de l'employeur. ✅
- C) Demander toujours 50% de plus que son salaire actuel.
- D) Refuser toute offre ne comportant pas d'equity.

**Q5.** Dans un calcul de capacité System Design, si un système compte **10 millions de DAU** effectuant 100 requêtes/jour, quel est le **Peak QPS estimé** (règle empirique Peak = 2x Average) ?

- A) ~1 150 QPS
- B) ~2 315 QPS (Avg = 10M*100/86400 = 1157 QPS → Peak = 2315 QPS) ✅
- C) ~10 000 QPS
- D) ~500 QPS

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
