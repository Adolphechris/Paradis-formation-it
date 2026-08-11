# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 589 (6h) : Retour d'Expérience Alumni & Mentorat — Success Stories & Career Tracks

> [!NOTE]
> **Objectifs pédagogiques :**
> - Analyser les trajectoires de carrière réelles des **Alumni PARADIS IT** (Staff Engineer, CISO, Principal Cloud Architect, Founder)
> - Comprendre la différence d'impact entre la **Filière Individuelle (IC - Individual Contributor)** et la **Filière Management**
> - Développer la posture du **Mentor Technique** : transmission des savoirs, code reviews bienveillantes, accompagnement des juniors
> - Établir une **feuille de route de carrière à 5 ans** adaptée à ses aspirations professionnelles et sa vision personnelle
>
> **Compétences visées :** `POL-03` (A), `PRO-01` (A) — Leadership Technique, Mentoring, Career Development

---

## Module 1 — Trajectoires de Carrière : IC vs. Management (2h)

### 📖 La Double Échelle de Carrière Tech (Dual Career Ladder)

L'une des plus grandes victoires de l'industrie tech moderne est l'existence de la **Double Échelle de Carrière** : il n'est plus obligatoire d'abandonner la technique pour devenir manager afin de progresser en responsabilité et en rémunération.

```
DOUBLE ÉCHELLE DE CARRIÈRE TECH (DUAL LADDER)

  FILIÈRE TECHNIQUE (IC - Individual Contributor)    FILIÈRE MANAGEMENT
  ┌──────────────────────────────────────────────┐    ┌──────────────────────────────┐
  │ Principal / Distinguished Engineer           │    │ VP of Engineering / CTO      │
  │ (Impact entreprise / Stratégie Tech 5-10 ans) │    │ (Vision org / Budget / P&L)  │
  ├──────────────────────────────────────────────┤    ├──────────────────────────────┤
  │ Staff / Lead Engineer                        │    │ Engineering Manager (EM)     │
  │ (Impact multi-équipes / Architecture)        │    │ (People management / Teams) │
  ├──────────────────────────────────────────────┤    ├──────────────────────────────┤
  │ Senior Engineer                              │    │ Tech Lead / Team Lead        │
  │ (Autonomie complète / Projets complexes)    │    │ (Gestion projet / Encadrement)│
  ├──────────────────────────────────────────────┤    └──────────────────────────────┘
  │ Mid-Level Engineer                           │
  │ (Exécution sous guidage / Bonnes pratiques) │
  ├──────────────────────────────────────────────┤
  │ Junior Engineer                              │
  │ (Apprentissage / Tâches cadrées)             │
  └──────────────────────────────────────────────┘

  COMPARAISON DES FOCUS :
  Staff IC   : "COMMENT résoudre ce problème technique complexe et dimensionner l'infra ?"
  Manager EM : "QUI doit résoudre ce problème et COMMENT faire grandir l'équipe ?"
```

---

## Module 2 — La Posture du Mentor & Transmission du Savoir (2h)

### 🔍 Les Principes de Mentorat Technique Réussi

Le mentorat n'est pas de la formation descendante — c'est un partenariat de développement mutuel qui renforce le leadership du mentor autant qu'il accélère la croissance du mentoré.

```
LES 4 PILIERS DU MENTORAT TECHNIQUE EXCELLENT

  1. CODE REVIEWS BIENVEILLANTES & PÉDAGOGIQUES
     - Ne jamais dire "C'est mal fait".
     - Préférer : "Avez-vous envisagé X ? Cela permettrait d'éviter Y dans ce cas de charge."
     - Féliciter les bonnes initiatives et les choix élégants.

  2. SOCRATIC QUESTIONING (Questionnement Socratique)
     Au lieu de donner la réponse directement, poser des questions qui guident
     le mentoré vers la découverte par lui-même.

  3. PAIR PROGRAMMING / SHADOWING
     Travailler côte à côte sur des incidents réels ou de l'architecture complexe.
     Expliciter à voix haute ses réflexions et doutes ("Rubber Duck Debugging").

  4. CRÉER UN ENVIRONNEMENT DE SÉCURITÉ PSYCHOLOGIQUE
     Normaliser l'erreur : "J'ai moi-même causé une panne de 2h en 2024.
     L'important est la post-mortem sans blâme (blameless post-mortem)."
```

---

## Module 3 — Atelier Pratique : Career Matrix & Mentoring Framework (1h30)

### 🛠️ Script Python : Career Track Assessor & Mentoring Feedback Tool

```python
#!/usr/bin/env python3
"""
PARADIS — Career Track Assessor & Mentoring Feedback System
Évalue le niveau d'impact (Senior vs Staff vs Manager) et fournit une grille de feedback.
"""
from dataclasses import dataclass, field
from typing import List, Dict

@dataclass
class CareerSkillAssessment:
    technical_depth   : int  # 1–5
    system_architecture: int  # 1–5
    cross_team_impact  : int  # 1–5
    people_mentoring   : int  # 1–5
    business_strategy  : int  # 1–5

class CareerPathAnalyzer:
    """Analyse le profil d'un ingénieur et recommande sa trajectoire de carrière optimal"""

    def analyze(self, assessment: CareerSkillAssessment) -> dict:
        total = (assessment.technical_depth + assessment.system_architecture +
                 assessment.cross_team_impact + assessment.people_mentoring +
                 assessment.business_strategy)
        avg = total / 5.0

        # Identification de la voie dominante (IC vs Management)
        ic_score  = (assessment.technical_depth * 2) + (assessment.system_architecture * 2) + assessment.cross_team_impact
        mg_score  = (assessment.people_mentoring * 2) + (assessment.business_strategy * 2) + assessment.cross_team_impact

        if ic_score >= mg_score + 3:
            track = "🛠️ Staff / Principal Individual Contributor (IC)"
            recommendation = "Concentrez-vous sur l'architecture long-terme, la R&D et l'influence technique transverse."
        elif mg_score >= ic_score + 3:
            track = "👔 Engineering Manager (EM) / Director"
            recommendation = "Développez vos compétences en gestion des personnes, recrutement et stratégie d'organisation."
        else:
            track = "⚖️ Tech Lead / Dual Track Hybrid"
            recommendation = "Vous combinez forte légitimité technique et excellentes compétences relationnelles. Rôle hybride idéal."

        # Niveau estimé
        if avg >= 4.2:
            level = "Staff / Principal / Director"
        elif avg >= 3.4:
            level = "Senior Engineer / Tech Lead"
        elif avg >= 2.5:
            level = "Mid-Level Engineer"
        else:
            level = "Junior / Associate Engineer"

        return {
            "avg_score"      : round(avg, 2),
            "level_estimated": level,
            "track_recommended": track,
            "recommendation" : recommendation,
            "ic_score"       : ic_score,
            "mg_score"       : mg_score
        }

class CodeReviewFeedbackFormatter:
    """Génère un retour de Code Review constructif et bienveillant"""

    @staticmethod
    def format_review_comment(category: str, observation: str, suggestion: str, rationale: str) -> str:
        icons = {"SECURITY": "🔒", "PERFORMANCE": "⚡", "READABILITY": "🧹", "ARCHITECTURE": "🏗️"}
        icon  = icons.get(category.upper(), "💡")
        return f"""{icon} **[{category.upper()}]** {observation}
👉 **Suggestion** : {suggestion}
📖 **Pourquoi ?** {rationale}"""


if __name__ == "__main__":
    print("=== PARADIS — CAREER PATH & MENTORING FRAMEWORK ===\n")

    # 1. Career Assessment Simulation
    profile_eval = CareerSkillAssessment(
        technical_depth    = 5,
        system_architecture = 4,
        cross_team_impact  = 4,
        people_mentoring   = 4,
        business_strategy  = 3
    )

    analyzer = CareerPathAnalyzer()
    res      = analyzer.analyze(profile_eval)

    print("📊 ÉVALUATION DE CARRIÈRE :")
    print(f"  Score Moyen      : {res['avg_score']}/5.0")
    print(f"  Niveau Estimé    : {res['level_estimated']}")
    print(f"  Filière Suggérée : {res['track_recommended']}")
    print(f"  Conseil          : {res['recommendation']}")

    print("\n" + "─"*70 + "\n")

    # 2. Code Review Bienveillante (Exemple de Feedback)
    print("💬 EXEMPLE DE CODE REVIEW BIENVEILLANTE (Posture de Mentor) :")
    comment = CodeReviewFeedbackFormatter.format_review_comment(
        category    = "SECURITY",
        observation = "Cette fonction d'authentification passe le token en query parameter dans l'URL.",
        suggestion  = "Transmettre le token dans le header HTTP `Authorization: Bearer <token>`.",
        rationale   = "Les query parameters sont enregistrés dans les logs d'accès du serveur web et l'historique du navigateur, ce qui risque de fuiter le token."
    )
    print(comment)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **IC** | Individual Contributor — Filière d'ingénieur senior sans management direct de personnes |
| **EM** | Engineering Manager — Manager d'équipe d'ingénieurs (people management) |
| **Rubber Ducking** | Technique d'explication d'un problème à voix haute (à un canard en plastique) pour trouver la solution |
| **Blameless Post-Mortem** | Analyse d'incident axée sur l'amélioration du système sans blâmer les individus |

---

## Exercices Pratiques

### Exercice 1 — Choix de Filière de Carrière

Un ingénieur Senior avec 6 ans d'expérience adore concevoir des systèmes complexes et coder, mais déteste organiser des entretiens individuels (1-on-1s), gérer les augmentations budgétaires et traiter les conflits personnels.

Quelle filière devez-vous lui recommander ? Quels sont les titres de postes cibles sur 5 ans ?

**Corrigé :**
- **Filière recommandée :** Filière **IC (Individual Contributor)**.
- **Titres de postes cibles :** **Staff Software Engineer** → **Principal Architect** → **Distinguished Engineer**.
- **Pourquoi :** Cette filière lui permet de maximiser son impact via l'architecture et la technique sans assumer la charge de gestion RH/People Management qu'il n'apprécie pas.

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce que la **Double Échelle de Carrière (Dual Career Ladder)** dans les entreprises tech ?

- A) L'obligation de devenir manager pour progresser.
- B) L'existence de deux voies de progression parallèles (Technique/IC vs Management) permettant aux ingénieurs d'évoluer en salaire et responsabilité sans devenir managers. ✅
- C) Une échelle de salaire basée uniquement sur l'ancienneté.
- D) Le cumul de deux emplois à temps plein.

**Q2.** Quelle est la caractéristique essentielle d'un **Blameless Post-Mortem** après une panne majeure ?

- A) Trouver le responsable pour lui infliger une sanction.
- B) Se concentrer sur les défaillances du système et des processus afin d'empêcher la récidive, sans pointer du doigt ou blâmer les personnes impliquées. ✅
- C) Supprimer les logs de l'incident.
- D) Ne pas documenter l'incident.

**Q3.** Quel est le rôle principal d'un **Staff Engineer** par rapport à un Senior Engineer ?

- A) Gérer les congés et salaires de l'équipe.
- B) Avoir un impact technique transverse multi-équipes, guider l'architecture globale et résoudre les problèmes complexes d'organisation technique. ✅
- C) Coder 100% du temps sans participer aux réunions.
- D) Remplacer le Product Manager.

**Q4.** Lors d'une **code review**, quelle formulation est la plus conforme aux principes de mentorat bienveillant ?

- A) "Code très mauvais, à refaire."
- B) "Pourquoi n'as-tu pas utilisé la bonne méthode ?"
- C) "Intéressant ! Avez-vous évalué l'impact de cette boucle sur les performances ? Voici une alternative possible avec Map..." ✅
- D) "Approuvé sans regarder."

**Q5.** Qu'est-ce que le **questionnement socratique** en mentorat technique ?

- A) Donner la solution immédiatement sans explication.
- B) Poser des questions guidées qui amènent le mentoré à découvrir et comprendre la solution par lui-même. ✅
- C) Faire passer des examens d'histoire grecque.
- D) Corriger le code à la place du mentoré.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
