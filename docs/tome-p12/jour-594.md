# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 594 (6h) : Bilan de Compétences & Axes d'Amélioration — Skill Gap Analysis & Personal Roadmap

> [!NOTE]
> **Objectifs pédagogiques :**
> - Réaliser un **bilan de compétences à 360°** couvrant l'intégralité des 12 Semestres de la Masterclass PARADIS IT (600 jours)
> - Conduire une **Skill Gap Analysis (Analyse des Écarts)** rigoureuse entre son niveau actuel et les exigences du marché (Staff Engineer / Principal Architect)
> - Établir son **Plan de Développement Personnel (PDP)** et sa **Roadmap d'apprentissage continu (Life-Long Learning)** post-Masterclass
> - Maîtriser le concept d'**Ingénieur en T (T-Shaped Engineer)** : culture générale IT très large + expertise ultra-profonde sur 2 domaines
>
> **Compétences visées :** `POL-03` (A), `PRO-01` (A) — Skill Gap Analysis, Career Planning, Continuous Learning

---

## Module 1 — Le Profil d'Ingénieur en T (T-Shaped Engineer) (2h)

### 📖 Concept du T-Shaped / Pi-Shaped Professional

Dans l'industrie informatique moderne, les profils purement spécialistes (I-shaped : connaissent uniquement un outil) et les profils purement généralistes (survolent tout sans rien maîtriser) sont vulnérables. L'objectif ultime de la Masterclass PARADIS IT est de former un profil **T-Shaped** (voire **Pi-Shaped** avec 2 piliers d'expertise).

```
MODÈLE DE COMPÉTENCES T-SHAPED & PI-SHAPED

  BARRE HORIZONTALE DU T — CULTURE GÉNÉRALE LARGE (Breadth)
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ Linux | Réseaux | Cloud | Kubernetes | Sécurité | Python | MLOps | GRC  │
  └───────────────────────────────────┬─────────────────────────────────────┘
                                      │
                 BARRE VERTICALE DU T │ (Depth — Expertise Profonde)
                                      ▼
                       ┌─────────────────────────────┐
                       │ CYBERSÉCURITÉ & ZERO-TRUST  │ (Pilier 1)
                       │ (CKS, CISSP, DevSecOps)     │
                       ├─────────────────────────────┤
                       │ SYSTEM DESIGN & CLOUD K8S   │ (Pilier 2 - Pi-Shaped)
                       │ (AWS SAP, Distributed Sys)  │
                       └─────────────────────────────┘
```

---

## Module 2 — Méthodologie d'Auto-Évaluation & PDP (2h)

### 🔍 Échelle de Maîtrise Dreyfus (Dreyfus Model of Skill Acquisition)

```
ÉCHELE DE MAÎTRISE DREYFUS — 5 NIVEAUX

  1. DÉBUTANT (Novice)       : Suis des règles rigides sans comprendre le contexte.
  2. DEBUTANT AVANCÉ        : Commence à reconnaître des patterns dans des situations réelles.
  3. COMPÉTENT               : Résout les problèmes de manière autonome avec plan d'action.
  4. PERTURBATEUR / EXPERT  : Voit la situation globalement (holistique), s'adapte sans effort.
  5. MAÎTRE / ÉLITE (Master) : Intuition fluide, innove, remet en question les dogmes de l'industrie.
```

---

## Module 3 — Atelier Pratique : Skill Gap Analyzer & Roadmap Generator (1h30)

### 🛠️ Script Python : Radar Chart Skill Gap Analyzer & Personal Learning Plan

```python
#!/usr/bin/env python3
"""
PARADIS — Skill Gap Analyzer & Personal Learning Roadmap Generator
Calcule les écarts de compétences entre le profil actuel et le profil cible (Staff Engineer).
"""
from dataclasses import dataclass
from typing import Dict, List, Tuple

@dataclass
class SkillDomain:
    name         : str
    current_level: int  # 1 (Novice) à 5 (Master)
    target_level : int  # 1 à 5

class SkillGapAnalyzer:
    """Analyse les écarts de compétences et recommande un plan de formation"""

    def analyze(self, domains: List[SkillDomain]) -> dict:
        gaps = []
        total_current = sum(d.current_level for d in domains)
        total_target  = sum(d.target_level for d in domains)
        max_possible  = len(domains) * 5

        for d in domains:
            gap = d.target_level - d.current_level
            gaps.append({
                "domain" : d.name,
                "current": d.current_level,
                "target" : d.target_level,
                "gap"    : gap,
                "status" : "🟢 ATTEINT" if gap <= 0 else f"🟡 ÉCART (-{gap})" if gap == 1 else f"🔴 ÉCART CRITIQUE (-{gap})"
            })

        overall_readiness = (total_current / total_target) * 100.0

        return {
            "overall_readiness_pct": round(overall_readiness, 1),
            "total_current_score"  : total_current,
            "total_target_score"   : total_target,
            "domain_analysis"      : gaps
        }

    def print_roadmap(self, result: dict):
        print("=" * 70)
        print("  🎯 PARADIS IT — BILAN DE COMPÉTENCES & SKILL GAP ANALYSIS")
        print("=" * 70)
        print(f"  Taux de Prépareté (Readiness) : {result['overall_readiness_pct']}%")
        print(f"  Score Actuel                  : {result['total_current_score']} / {result['total_target_score']}")
        print("\n  DÉTAIL PAR DOMAINE :")
        print(f"  {'Domaine':<30} {'Actuel':>7} {'Cible':>6} {'Statut'}")
        print(f"  {'─'*30} {'─'*7} {'─'*6} {'─'*20}")

        for item in result["domain_analysis"]:
            print(f"  {item['domain']:<30} {item['current']:>7}/5 {item['target']:>6}/5 {item['status']}")

        print("=" * 70)
        critical_gaps = [i for i in result["domain_analysis"] if i["gap"] >= 2]
        if critical_gaps:
            print("\n  🚀 PLAN D'ACTION PRIORITAIRE (Écarts ≥ 2) :")
            for cg in critical_gaps:
                print(f"     👉 {cg['domain']} : Passer du niveau {cg['current']} au niveau {cg['target']}")
                print(f"        Action : Réviser le Tome correspondant et réaliser 2 projets pratiques supplémentaires.")
        else:
            print("\n  🌟 Félicitations ! Votre profil est parfaitement aligné avec les exigences Staff Engineer.")
        print("=" * 70)


if __name__ == "__main__":
    domains = [
        SkillDomain("Linux & Système",            4, 5),
        SkillDomain("Réseaux & Security L3/L4",  4, 4),
        SkillDomain("Cloud AWS/GCP (SAP)",        4, 5),
        SkillDomain("Kubernetes & CKS",          4, 5),
        SkillDomain("DevSecOps & Supply Chain",   5, 5),
        SkillDomain("IA / MLOps / LLMs",          3, 4),
        SkillDomain("System Design Massive Scale",4, 5),
        SkillDomain("Executive Communication",   3, 4),
    ]

    analyzer = SkillGapAnalyzer()
    res      = analyzer.analyze(domains)
    analyzer.print_roadmap(res)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **T-Shaped** | Profil possédant une large culture générale (barre horizontale) et une expertise profonde (barre verticale) |
| **Pi-Shaped** | Profil possédant une culture générale large et deux piliers d'expertise profonde |
| **PDP** | Plan de Développement Personnel — Feuille de route d'acquisition de compétences sur 1 à 3 ans |

---

## Exercices Pratiques

### Exercice 1 — Évaluation T-Shaped Profile

Un ingénieur possède un niveau 5 en Python et Django, mais un niveau 1 en Linux, Réseaux, Cloud et Kubernetes.

1. Quel est le type de profil de cet ingénieur (I-Shaped vs T-Shaped) ?
2. Quels sont les risques professionnels associés à ce profil ?
3. Que doit-il faire pour devenir T-Shaped ?

**Corrigé :**
1. Profil **I-Shaped** (spécialiste étroit monolangage/framework).
2. **Risques :** Dépendance totale à la popularité d'un seul langage/framework (obsolescence), incapacité à résoudre des pannes d'infrastructure ou de sécurité complexes en production, opportunités de carrière limitées aux rôles d'exécution.
3. **Plan d'action :** Élargir sa barre horizontale (Breadth) en se formant aux fondamentaux Linux (J1-J50), aux Réseaux (J51-J100), au Cloud et aux Conteneurs (J200-J350) pour comprendre l'environnement d'exécution complet de son code. ✅

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce qu'un ingénieur au profil **T-Shaped** ?

- A) Un ingénieur travaillant uniquement sur des projets de type T.
- B) Un professionnel combinant une large culture générale IT (barre horizontale du T) et une expertise très profonde dans au moins un domaine spécifique (barre verticale). ✅
- C) Un développeur spécialisé dans un seul langage de programmation.
- D) Un manager sans compétences techniques.

**Q2.** Selon le **Modèle d'Acquisition de Compétences de Dreyfus**, quel niveau se caractérise par une intuition fluide et la capacité à innover en remettant en question les normes établies ?

- A) Débutant (Novice)
- B) Compétent
- C) Maître / Élite (Expert/Master) ✅
- D) Stagiaire

**Q3.** Quelle est la première étape d'une **Skill Gap Analysis (Analyse des Écarts de Compétences)** ?

- A) Demander une augmentation.
- B) Évaluer objectivement son niveau actuel par rapport aux compétences cibles d'un poste (ex: Staff Engineer). ✅
- C) Postuler à 100 offres d'emploi.
- D) Supprimer son CV.

**Q4.** Pourquoi le profil **I-Shaped** (hyper-spécialiste d'un seul outil) est-il plus risqué sur le marché du travail qu'un profil T-Shaped ?

- A) Parce qu'il gagne trop d'argent.
- B) En cas d'obsolescence ou de déclin de son outil unique, il manque de flexibilité pour pivoter vers d'autres technologies. ✅
- C) Parce qu'il ne sait pas utiliser un clavier.
- D) Ce n'est pas risqué.

**Q5.** Dans un **Plan de Développement Personnel (PDP)**, que représente la notion de *"Life-Long Learning"* (apprentissage continu) ?

- A) Étudier uniquement pendant ses études initiales.
- B) La nécessité pour un ingénieur IT de se former en permanence tout au long de sa carrière pour s'adapter à l'évolution rapide des technologies. ✅
- C) Passer le même examen de certification chaque année.
- D) Lire un seul livre par an.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
