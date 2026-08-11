# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 568 (6h) : Engineering Leadership & Team Scaling : Staff Engineer Path, Tech Radar & ADR Governance

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre la trajectoire de **Leadership Technique à double échelle (Dual-Ladder Career Path)** : passer de Senior à Staff, Principal et Distinguished Engineer
> - Exercer une influence technique et stratégique majeure **sans autorité hiérarchique directe (Leadership without Authority)**
> - Structurer la gouvernance technologique d'une organisation d'ingénierie en croissance à travers les **ADRs (Architecture Decision Records)** et le **Tech Radar**
> - Animer les **Guildes / Communautés de Pratique (Communities of Practice - CoP)** pour diffuser les standards d'excellence à grande échelle (modèle Spotify)
>
> **Compétences visées :** `POL-01` (A), `DEV-03` (A) — Engineering Leadership, Staff Engineer Path, Tech Governance

---

## Module 1 — Le Parcours Staff Engineer & Dual-Ladder (2h)

### 📖 Intuition & Narration

Traditionnellement, lorsqu'un ingénieur d'excellence atteignait le niveau Senior, la seule possibilité d'avancement de carrière qui lui était offerte était de devenir Manager (Engineering Manager / Director) — abandonnant ainsi la technique au profit de la gestion des hommes et des budgets.

La **trajectoire à double échelle (Dual-Ladder Career Path)** résout ce dilemme en créant une voie d'avancement purement technique parallèle au management : la filière **Staff Plus Engineer**.

Un **Staff Engineer** ne gère pas les carrières individuelles, mais il résout les problèmes complexes à l'échelle de plusieurs équipes, définit la vision architecturale et agit comme un multiplicateur de force ("Force Multiplier") pour l'ensemble des ingénieurs.

### 🔍 Les 4 Archétypes de Staff Engineer (Will Larson)

```
LES 4 ARCHÉTYPES DU ROLE DE STAFF ENGINEER

  1. THE TECH LEAD (Le Leader Technique d'Équipe)
     Partenaire technique privilégié de l'Engineering Manager.
     Guide l'exécution technique, l'architecture et les choix d'une à deux équipes.

  2. THE ARCHITECT (L'Architecte Systèmes)
     Responsable de la vision architecturale globale, des frontières de services,
     du Tech Radar et des arbitrages technologiques majeurs sur tout un domaine.

  3. THE SOLVER (Le Résolveur de Problèmes Complexes)
     Ingénieur d'élite mobilisé sur les problèmes techniques les plus ardues et critiques
     de l'entreprise (ex: performance critique, failles de sécurité majeures).

  4. THE RIGHT HAND (Le Bras Droit Technique)
     Travaille directement avec le VP Engineering ou le CTO pour traduire la vision
     business en stratégie technologique globale et gouvernance.
```

---

## Module 2 — Gouvernance par ADRs & Tech Radar (2h)

### 🔍 Architecture Decision Records (ADR)

Les **ADRs (Architecture Decision Records)** sont de courts documents texte versionnés dans le d'un projet Git qui consignent les décisions d'architecture d'importance, leur contexte et leurs conséquences.

```markdown
# AD-2026-004 : Utilisation de Kafka comme Bus d'Événements Principal

## CONTEXTE
Les communications entre microservices se faisaient via des requêtes HTTP synchrones REST, entraînant des pannes en cascade et une forte latence lors des pics de charge.

## DÉCISION
Adopter Apache Kafka comme bus d'événements central pour toutes les communications inter-services asynchrones.

## CONSÉQUENCES
- **Positives** : Découplage fort, tolérance aux pannes, haute performance (> 100k msg/s).
- **Négatives** : Nécessite une gestion de schéma via Schema Registry et une acculturation aux EDA.
```

---

## Module 3 — Calculateur d'Impact & Technical Leadership Engine (1h30)

### 🛠️ Script Python : Staff Engineer Impact Evaluator (Force Multiplier Calculator)

```python
#!/usr/bin/env python3
"""
PARADIS — Staff Engineer Impact Evaluator
Évalue le rôle et l'impact d'un ingénieur Staff+ selon le modèle de multiplicateur de force.
"""
from dataclasses import dataclass
from typing import List

@dataclass
class StaffImpactMetrics:
    engineer_name: str
    archetype: str                  # TECH_LEAD | ARCHITECT | SOLVER | RIGHT_HAND
    adrs_authored: int              # Nombre d'ADRs majeurs rédigés et validés
    engineers_mentored: int         # Nombre d'ingénieurs accompagnés/mentorés
    cross_team_initiatives: int     # Projets transversaux pilotés sur > 3 équipes
    hours_saved_per_dev_week: float # Heures économisées par dev grâce aux outils/plateforme

class StaffImpactEvaluator:
    def __init__(self, metrics: StaffImpactMetrics):
        self.metrics = metrics

    def evaluate(self):
        print("=" * 65)
        print(f"  ÉVALUATION D'IMPACT STAFF ENGINEER — {self.metrics.engineer_name}")
        print(f"  Archétype Identifié : {self.metrics.archetype}")
        print("=" * 65)
        print()

        # Score Multiplicateur de Force (Force Multiplier Score)
        # L'impact d'un Staff Engineer se mesure par l'efficacité qu'il apporte aux autres
        mentoring_score = self.metrics.engineers_mentored * 15
        governance_score = self.metrics.adrs_authored * 20
        initiative_score = self.metrics.cross_team_initiatives * 25
        leverage_score = self.metrics.hours_saved_per_dev_week * 10

        total_impact_score = sum([mentoring_score, governance_score, initiative_score, leverage_score])

        print(f"  📜 ADRs D'Architecture Validés : {self.metrics.adrs_authored:<3} → Score: {governance_score} pts")
        print(f"  🌱 Ingénieurs Mentorés         : {self.metrics.engineers_mentored:<3} → Score: {mentoring_score} pts")
        print(f"  🌐 Initiatives Transversales   : {self.metrics.cross_team_initiatives:<3} → Score: {initiative_score} pts")
        print(f"  ⚡ Heures Gagnées / Dev / Sem. : {self.metrics.hours_saved_per_dev_week:<3.1f} → Score: {leverage_score:.0f} pts")
        print("─" * 65)

        print(f"  🏆 SCORE DE MULTIPLICATEUR DE FORCE : {total_impact_score:.0f} / 300 pts")
        if total_impact_score >= 200:
            level = "EXPERT STAFF / PRINCIPAL ENGINEER — Impact à l'échelle de toute l'organisation"
        elif total_impact_score >= 100:
            level = "STAFF ENGINEER — Impact avéré sur plusieurs équipes"
        else:
            level = "SENIOR ENGINEER EN TRANSITION STAFF"

        print(f"  ÉVALUATION DE NIVEAU : {level}")
        print("=" * 65)


if __name__ == "__main__":
    staff_eval = StaffImpactMetrics(
        engineer_name="Sophie Laurent",
        archetype="THE ARCHITECT",
        adrs_authored=4,
        engineers_mentored=6,
        cross_team_initiatives=3,
        hours_saved_per_dev_week=3.5
    )

    evaluator = StaffImpactEvaluator(staff_eval)
    evaluator.evaluate()
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Dual-Ladder** | Système de progression de carrière à double filière (Management vs Expertise Technique) |
| **ADR** | Architecture Decision Record — Document texte versionné consignant une décision d'architecture |
| **CoP** | Community of Practice (Guilde) — Regroupement transversal d'ingénieurs partageant la même passion/expertise |
| **CTO / VP Eng** | Chief Technology Officer / Vice-President of Engineering |

---

## Exercices Pratiques

### Exercice 1 — Élaboration d'une Stratégie d'Influence sans Autorité

Vous êtes Staff Engineer et vous constatez que 4 équipes produit différentes réinventent chacune leur propre système d'authentification OAuth2, créant des failles de sécurité et des doublons. Vous n'êtes le manager direct de personne.

Décrivez votre plan d'action en 4 étapes pour fédérer ces équipes autour d'une solution unique.

**Corrigé guidé :**
1. **Établir le diagnostic partagé (Data-driven)** : Rédiger un état des lieux objectif montrant les coûts, le temps perdu et les failles de sécurité potentielles des 4 implémentations.
2. **Créer un espace de dialogue (Guilde Sécurité / CoP)** : Inviter les Tech Leads des 4 équipes à une session de travail pour co-concevoir la solution cible (Shared Ownership).
3. **Rédiger un ADR (Architecture Decision Record)** : Proposer une décision d'architecture claire pour une bibliothèque d'authentification unique (ex: OAuth2 / OIDC SDK).
4. **Construire un prototype / Golden Path (Leading by Example)** : Fournir un SDK pré-configuré et facile à intégrer qui réduit le travail des équipes de 90%.

---

## Banque QCM — 5 Questions

**Q1.** Dans le système de carrière **Dual-Ladder (Double Échelle)**, quelle est la caractéristique d'un rôle de **Staff Engineer** ?

- A) Le Staff Engineer passe 100% de son temps à gérer la paie des employés.
- B) C'est un rôle de leadership technique d'élite qui permet d'avancer en responsabilité et rémunération sans avoir à devenir manager hiérarchique direct. ✅
- C) C'est un poste réservé aux débutants.
- D) Le Staff Engineer n'a plus le droit de lire de code.

**Q2.** Selon Will Larson, l'archétype de Staff Engineer appelé **"The Architect"** se concentre principalement sur :

- A) Le recrutement des stagiaires.
- B) La vision d'architecture globale, la cohérence des systèmes, les limites de domaines et la gouvernance technique à l'échelle de l'entreprise. ✅
- C) La réparation des imprimantes.
- D) L'écriture de scripts HTML simples.

**Q3.** Qu'est-ce qu'une **Guilde / Communauté de Pratique (Community of Practice - CoP)** dans le modèle d'organisation Spotify ?

- A) Un groupe de musique interne.
- B) Un rassemblement transversal d'ingénieurs issus de différentes équipes qui partagent la même passion ou expertise (ex: Guilde Sécurité, Guilde Frontend) pour échanger les meilleures pratiques. ✅
- C) Le syndicat de l'entreprise.
- D) L'équipe de direction financière.

**Q4.** Pourquoi les **ADRs (Architecture Decision Records)** doivent-ils être stockés dans le même dépôt Git que le code source ?

- A) Pour économiser de l'espace disque.
- B) Pour que la documentation d'architecture soit versionnée, revue en Pull Request et lue au même endroit que le code qu'elle documente (Docs-like-Code). ✅
- C) Parce que Git est un outil de dessin.
- D) Pour empêcher les développeurs de les lire.

**Q5.** Que signifie le concept de **"Force Multiplier" (Multiplicateur de Force)** appliqué à un Staff Engineer ?

- A) Le Staff Engineer tape 10 fois plus vite sur son clavier.
- B) La valeur du Staff Engineer ne se mesure pas seulement à son propre code, mais à l'amélioration de l'efficacité et des compétences de dizaines d'autres ingénieurs qu'il inspire, mentore et outille. ✅
- C) Le Staff Engineer utilise 4 écrans simultanément.
- D) C'est un module matériel d'accélération graphique.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
