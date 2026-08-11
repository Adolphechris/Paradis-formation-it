# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 491 (6h) : Gouvernance de l'IA & Gestion des Risques : Framework NIST AI RMF, Audits d'Algorithmes & Plan de Réponse aux Incidents IA

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le cadre de gouvernance **NIST AI Risk Management Framework (AI RMF 1.0)**
> - Structurer les 4 fonctions fondamentales du NIST : **Govern, Map, Measure, Manage**
> - Développer une cartographie des risques spécifiques aux modèles IA (Biais, Hallucinations, Poisoning, Drift)
> - Établir un **Plan de Réponse aux Incidents IA (AI Incident Response Plan)** pour les défaillances en production
>
> **Compétences visées :** `AI-04` (A), `SEC-06` (A) — AI Governance & Risk Management Frameworks

---

## Module 1 — Le Cadre NIST AI RMF 1.0 (2h)

### 📖 Intuition & Narration

Déployer l'Intelligence Artificielle en entreprise sans cadre de gouvernance formel équivaut à piloter un véhicule sans freins. Au-delà des contraintes juridiques (EU AI Act), les organisations doivent gérer les risques opérationnels, réputationnels et de cybersécurité liés à l'IA.

Le **NIST AI RMF 1.0 (Artificial Intelligence Risk Management Framework)** est le standard mondial de référence publié par l'institut américain NIST. Il fournit un cadre structuré et non-prescriptif pour concevoir des systèmes IA dignes de confiance (**Trustworthy AI**).

### 🔍 Anatomie Technique — Les 4 Fonctions du NIST AI RMF

```
STRUCTURE DU FRAMEWORK NIST AI RMF 1.0

                       ┌───────────────────────────────┐
                       │          GOVERN               │
                       │  Politiques, Culture, Rôles   │
                       └───────────────┬───────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
  ┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
  │        MAP        │ ──►  │      MEASURE      │ ──►  │      MANAGE       │
  │ Contextualiser &  │      │ Évaluer & Analyser│      │ Traiter & Mener   │
  │ Identifier Risques│      │ (PSI, ECE, WER)   │      │ la Réponse        │
  └───────────────────┘      └───────────────────┘      └───────────────────┘

LES 7 CARACTÉRISTIQUES D'UNE IA DIGNE DE CONFIANCE (Trustworthy AI) :
  1. Safe (Sûre).
  2. Secure & Resilient (Sécurisée et Résiliente aux attaques).
  3. Explainable & Interpretable (Explicable).
  4. Transparent (Transparente).
  5. Accountable & Governed (Responsable).
  6. Fair - with Bias Managed (Équitable et Biais Maîtrisés).
  7. Privacy-Preserving (Respectueuse de la Vie Privée).
```

---

## Module 2 — Atelier Pratique : Matrice d'Évaluation des Risques IA (2h)

### 🛠️ Script Python : Matrice d'Évaluation de Risques et Dashboard de Gouvernance

```python
#!/usr/bin/env python3
"""
PARADIS — Système d'Évaluation des Risques IA et Audit de Gouvernance NIST AI RMF
"""

import json

class AIRiskEvaluator:
    def __init__(self):
        self.risk_registry = []

    def register_risk(self, risk_id: str, component: str, category: str, likelihood: int, impact: int, mitigation: str):
        """
        Likelihood (1 à 5), Impact (1 à 5)
        Risk Score = Likelihood * Impact (1 à 25)
        """
        score = likelihood * impact
        risk_level = "LOW" if score < 6 else ("MEDIUM" if score < 12 else ("HIGH" if score < 20 else "CRITICAL"))

        self.risk_registry.append({
            "risk_id": risk_id,
            "component": component,
            "category": category,
            "likelihood": likelihood,
            "impact": impact,
            "risk_score": score,
            "risk_level": risk_level,
            "mitigation_plan": mitigation
        })

    def generate_governance_report(self) -> dict:
        high_risks = [r for r in self.risk_registry if r['risk_level'] in ['HIGH', 'CRITICAL']]
        return {
            "total_risks_mapped": len(self.risk_registry),
            "high_critical_risks_count": len(high_risks),
            "compliance_status": "NON_COMPLIANT" if len(high_risks) > 0 else "COMPLIANT",
            "registry": self.risk_registry
        }

def run_governance_demo():
    print("[*] --- DÉMONSTRATION GOUVERNANCE IA NIST AI RMF PARADIS IT ---")

    evaluator = AIRiskEvaluator()

    # Ingestion des risques identifiés (Fonction MAP du NIST)
    evaluator.register_risk(
        risk_id="R-01",
        component="Système RAG NIDS",
        category="Hallucination / Data Leakage",
        likelihood=4,
        impact=4,
        mitigation="Mise en place de Guardrails NeMo et validation Pydantic stricte."
    )

    evaluator.register_risk(
        risk_id="R-02",
        component="Modèle Scoring Crédit",
        category="Algorithmic Bias (Demographic Parity)",
        likelihood=2,
        impact=5,
        mitigation="Audit hebdomadaire Disparate Impact Ratio et re-weighting."
    )

    report = evaluator.generate_governance_report()

    print("\n--- RAPPORT DE GOUVERNANCE ET DE CONFORMITÉ NIST ---")
    print(json.dumps(report, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    run_governance_demo()
```

---

## Module 3 — AI Incident Response Plan (Plan de Réponse aux Incidents) (1h30)

### 🔍 Procédure d'Urgence en Cas Défaillance Majeure d'un Modèle IA

```
PLAN DE RÉPONSE AUX INCIDENTS IA (AI INCIDENT RESPONSE - AIIRP)

  ┌────────────────────────────────────────────────────────┐
  │ 1. DÉTECTION & ALERTE                                  │
  │    - Déclenchement alerte Prometheus (Data Drift > 0.3)│
  │    - Signalement d'une alerte sécurité / Hallucination.│
  └──────────────────────────┬─────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. CONFINEMENT (Circuit Breaker / Fallback)            │
  │    - Bascule automatique vers le modèle de Fallback    │
  │      ou vers un opérateur humain (Human-in-the-Loop). │
  │    - Isolement de l'endpoint d'inférence défaillant.   │
  └──────────────────────────┬─────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. INVESTIGATION & ROOT CAUSE ANALYSIS                 │
  │    - Inspection des logs MLflow Tracking et inputs.    │
  │    - Vérification du Data Poisoning ou du Leakage.     │
  └──────────────────────────┬─────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 4. CORRECTION, RE-ENTRAÎNEMENT & RETOUR À LA NORMALE   │
  │    - Application du patch / Re-entraînement sur DVC.  │
  │    - Validation Shadow Deployment 24h avant bascule.   │
  └────────────────────────────────────────────────────────┘
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **NIST** | National Institute of Standards and Technology — Organisme américain de normalisation |
| **AI RMF** | AI Risk Management Framework — Cadre de référence de gestion des risques liés à l'IA |
| **AIIRP** | AI Incident Response Plan — Procédure opérationnelle de réponse aux incidents d'IA |
| **Circuit Breaker** | Pattern d'architecture coupant automatiquement l'accès à un service défaillant |
| **Mitigation** | Actions correctives visant à réduire la probabilité ou l'impact d'un risque |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Score de Risque et Action de Gouvernance

Dans la matrice de gouvernance d'une banque, une défaillance potentielle est analysée :
- Risque R-05 : Hallucination de l'agent IA de conseil financier.
- Probabilité d'occurrence (Likelihood) : $4 / 5$.
- Impact financier et réputationnel : $5 / 5$.
1. Calculez le score de risque global ($\text{Score} = \text{Likelihood} \times \text{Impact}$).
2. Déterminez la catégorie de risque (LOW, MEDIUM, HIGH, CRITICAL).
3. Quelle mesure d'urgence la politique de gouvernance NIST impose-t-elle ?

**Corrigé guidé :**
1. **Calcul du Score** :
   $$\text{Score} = 4 \times 5 = 20.$$
2. **Catégorie de Risque** :
   Score $= 20 \ge 20 \implies$ Catégorie **CRITICAL (Critique)**.
3. **Mesure d'urgence** :
   Un risque CRITICAL interdit le déploiement direct en production sans contrôle humain. L'entreprise doit immédiatement implémenter un **Circuit Breaker** (bascule vers validation humaine pour toute recommandation) et intégrer une validation Pydantic stricte avec Guardrails de sécurité avant toute ré-autorisation d'inférence autonome.

---

## Banque QCM — 5 Questions

**Q1.** Quelles sont les 4 fonctions fondamentales qui composent le cadre de gouvernance **NIST AI RMF 1.0** ?

- A) Read, Write, Execute, Delete.
- B) Govern, Map, Measure, Manage. ✅
- C) Input, Output, Storage, Processing.
- D) Fast, Slow, Medium, Ultra.

**Q2.** Dans la fonction **MAP** du NIST AI RMF, l'objectif principal est de :

- A) Dessiner une carte géographique des serveurs.
- B) Contextualiser le système d'IA et identifier l'ensemble des risques potentiels (biais, sécurité, dérive) associés à son cas d'usage spécifique. ✅
- C) Calculer la vitesse des GPUs.
- D) Traduire du code en C++.

**Q3.** Quel est le rôle d'un **Circuit Breaker (Coupe-circuit)** dans un système d'IA en production ?

- A) Éteindre l'électricité du bâtiment.
- B) Interrompre automatiquement les appels au modèle IA et basculer le trafic vers un système de repli (Fallback / Opérateur humain) dès qu'un niveau d'anomalie ou d'erreur critique est franchi. ✅
- C) Réduire la résolution des images.
- D) Sauvegarder les données dans un fichier ZIP.

**Q4.** Parmi les 7 caractéristiques d'une **IA Digne de Confiance (Trustworthy AI)** selon le NIST, la **Résilience (Resilience)** désigne :

- A) La capacité du modèle à fonctionner sans électricité.
- B) La capacité du système à résister aux perturbations, aux pannes et aux attaques adversariales sans s'effondrer. ✅
- C) Le prix d'achat du logiciel.
- D) La taille des fichiers de sauvegarde.

**Q5.** Dans un plan de réponse aux incidents IA (**AIIRP**), quelle est la toute première étape à exécuter dès la confirmation d'une faille critique ?

- A) Rédiger le rapport annuel pour les actionnaires.
- B) Le confinement immédiat de l'incident (activation du Fallback ou arrêt temporaire du service). ✅
- C) Le re-démarrage du serveur DNS.
- D) La suppression des logs.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
