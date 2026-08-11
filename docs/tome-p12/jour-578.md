# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 578 (6h) : Ethics & Societal Impact of Technology — AI Ethics, Digital Rights & Techno-Humanism

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser les **cadres éthiques de l'IA** (Utilitarisme, Déontologie, Vertu, Care Ethics) et leur application aux décisions techniques
> - Comprendre le **EU AI Act 2024** : classification par niveaux de risque (Inacceptable, High, Limited, Minimal), obligations de conformité
> - Défendre les **droits numériques fondamentaux** : vie privée (RGPD), liberté d'expression algorithmique, droit à l'explication (Art. 22 RGPD)
> - Adopter une posture d'**ingénieur techno-humaniste** : prendre conscience de la responsabilité sociétale des décisions techniques
>
> **Compétences visées :** `GRC-01` (A), `POL-03` (A) — AI Ethics, Digital Rights, EU AI Act, Responsible Engineering

---

## Module 1 — Cadres Éthiques & AI Ethics (2h)

### 📖 Intuition & Narration

En 2018, Amazon a discrètement abandonné un système de recrutement IA qu'il avait développé pendant 3 ans : le système discriminait systématiquement les femmes pour les postes d'ingénieurs logiciels. Les modèles ML avaient appris à partir de 10 années de CV soumis à Amazon — une période où les hommes dominaient les candidatures. La machine n'avait fait que reproduire et amplifier les biais humains historiques.

Cet épisode illustre une vérité fondamentale : **toute décision technique est une décision éthique**.

### 🔍 Les 4 Grands Cadres Éthiques Appliqués à l'IA

```
CADRES ÉTHIQUES — APPLICATION À L'IA

  ┌─────────────────────────────────────────────────────────────────────┐
  │  UTILITARISME (Bentham, Mill) — "Le plus grand bien pour le plus   │
  │  grand nombre"                                                      │
  │  → Application IA : Optimiser les métriques agrégées (accuracy     │
  │    globale) peut masquer des sous-performances sur les minorités.   │
  │  → Limite : 99% de précision acceptable si 1% = population vulnérable? │
  ├─────────────────────────────────────────────────────────────────────┤
  │  DÉONTOLOGIE (Kant) — "Agis selon des règles universalisables"     │
  │  → Application IA : Le RGPD, le consentement explicite, l'EU AI Act│
  │    établissent des devoirs absolus indépendants des résultats.     │
  │  → Exemple : Ne jamais utiliser les données de santé sans          │
  │    consentement, même si cela améliore la précision du modèle.    │
  ├─────────────────────────────────────────────────────────────────────┤
  │  ÉTHIQUE DE LA VERTU (Aristote) — "Être une personne de bien"     │
  │  → Application IA : L'ingénieur vertueux refuse de construire      │
  │    des systèmes de surveillance de masse même si légaux.           │
  ├─────────────────────────────────────────────────────────────────────┤
  │  CARE ETHICS (Gilligan, Noddings) — "Prendre soin des vulnérables" │
  │  → Application IA : Prioriser la protection des populations        │
  │    marginalisées dans la conception des systèmes IA.               │
  └─────────────────────────────────────────────────────────────────────┘
```

### 🔍 EU AI Act 2024 — Classification par Risque

```
EU AI ACT 2024 — 4 NIVEAUX DE RISQUE

  ┌─────────────────────────────────────────────────────────────────┐
  │  🔴 RISQUE INACCEPTABLE → INTERDIT                             │
  │  - Notation sociale généralisée par gouvernements              │
  │  - Manipulation psychologique subliminale                      │
  │  - Identification biométrique en temps réel (espaces publics)  │
  ├─────────────────────────────────────────────────────────────────┤
  │  🟠 RISQUE ÉLEVÉ (HIGH RISK) → Obligations strictes            │
  │  - Décisions RH (recrutement, notation employés)               │
  │  - Scoring de crédit, assurance                                │
  │  - Décisions judiciaires / migrations                          │
  │  - Infrastructure critique (énergie, eau)                      │
  │  → Conformité : Data Governance, Transparency, Human Oversight  │
  │    Risk Management, Accuracy/Robustness, Cybersecurity         │
  ├─────────────────────────────────────────────────────────────────┤
  │  🟡 RISQUE LIMITÉ → Obligations de transparence                 │
  │  - Chatbots (obligation de signaler qu'on parle à une IA)     │
  │  - Deepfakes (obligation de labelliser le contenu synthétique) │
  ├─────────────────────────────────────────────────────────────────┤
  │  🟢 RISQUE MINIMAL → Pas d'obligation spécifique               │
  │  - Filtres spam, recommandations Netflix                       │
  │  - Jeux vidéo avec IA                                          │
  └─────────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Droits Numériques, Biais Algorithmiques & Techno-Humanisme (2h)

### 🔍 Biais Algorithmiques — Taxonomie et Métriques de Fairness

Les **biais algorithmiques** naissent de données d'entraînement non représentatives, de variables proxy discriminantes ou de fonctions de perte mal calibrées.

| Métrique de Fairness | Définition | Formule |
|:---|:---|:---|
| **Demographic Parity** | Taux de prédictions positives identique entre groupes | $P(\hat{Y}=1 \| A=0) = P(\hat{Y}=1 \| A=1)$ |
| **Equal Opportunity** | Taux de vrais positifs identique entre groupes | $TPR_{A=0} = TPR_{A=1}$ |
| **Equalized Odds** | TPR et FPR identiques entre groupes | $TPR_{A=0} = TPR_{A=1}$ et $FPR_{A=0} = FPR_{A=1}$ |
| **Calibration** | La probabilité prédite reflète la fréquence réelle | $P(Y=1 \| \hat{P}=p, A=a) = p \; \forall a$ |

### 🔍 Droits Numériques Fondamentaux

```
DROITS NUMÉRIQUES FONDAMENTAUX (Charte UE des Droits Fondamentaux + RGPD)

  1. DROIT À LA VIE PRIVÉE (Art. 7 CDFUE / RGPD)
     → Données personnelles collectées uniquement si nécessaires (minimisation)

  2. DROIT À L'EXPLICATION (Art. 22 RGPD — Profilage automatisé)
     → Toute décision automatisée significative doit être explicable sur demande

  3. DROIT À L'OUBLI / EFFACEMENT (Art. 17 RGPD)
     → Suppression des données sur demande (+ Machine Unlearning en IA)

  4. DROIT D'OPPOSITION (Art. 21 RGPD)
     → Refus du traitement de ses données à des fins de marketing

  5. NEUTRALITÉ DU NET
     → Traitement non discriminatoire de tous les flux Internet
```

---

## Module 3 — Atelier Pratique : AI Fairness Auditor (1h30)

### 🛠️ Script Python : Bias Detection & Fairness Metrics Calculator

```python
#!/usr/bin/env python3
"""
PARADIS — AI Fairness Auditor
Calcule les métriques de fairness (Demographic Parity, Equal Opportunity, Equalized Odds)
pour auditer les biais d'un modèle de classification IA.
"""
from dataclasses import dataclass
from typing import List, Tuple
import statistics

@dataclass
class Prediction:
    individual_id: str
    protected_attribute: str  # "group_a" ou "group_b" (ex: hommes/femmes)
    y_true: int               # Label réel (1=positif, 0=négatif)
    y_pred: int               # Prédiction IA (1=positif, 0=négatif)

class FairnessAuditor:
    """Auditeur de Fairness Algorithmique — EU AI Act High Risk Compliance"""

    def __init__(self, predictions: List[Prediction]):
        self.predictions = predictions
        self.groups = list(set(p.protected_attribute for p in predictions))

    def _get_group(self, group: str) -> List[Prediction]:
        return [p for p in self.predictions if p.protected_attribute == group]

    def _positive_prediction_rate(self, group: str) -> float:
        g = self._get_group(group)
        return sum(1 for p in g if p.y_pred == 1) / len(g) if g else 0.0

    def _true_positive_rate(self, group: str) -> float:
        """Recall / Sensitivity pour le groupe"""
        g = self._get_group(group)
        tp = sum(1 for p in g if p.y_true == 1 and p.y_pred == 1)
        fn = sum(1 for p in g if p.y_true == 1 and p.y_pred == 0)
        return tp / (tp + fn) if (tp + fn) > 0 else 0.0

    def _false_positive_rate(self, group: str) -> float:
        g = self._get_group(group)
        fp = sum(1 for p in g if p.y_true == 0 and p.y_pred == 1)
        tn = sum(1 for p in g if p.y_true == 0 and p.y_pred == 0)
        return fp / (fp + tn) if (fp + tn) > 0 else 0.0

    def demographic_parity_ratio(self, g1: str, g2: str) -> float:
        """Ratio de parité démographique : 1.0 = équité parfaite. < 0.8 = disparate impact (règle des 4/5)"""
        ppr1 = self._positive_prediction_rate(g1)
        ppr2 = self._positive_prediction_rate(g2)
        return ppr1 / ppr2 if ppr2 > 0 else float("inf")

    def equal_opportunity_difference(self, g1: str, g2: str) -> float:
        """Différence de TPR entre groupes. Idéalement 0.0"""
        return self._true_positive_rate(g1) - self._true_positive_rate(g2)

    def audit_report(self, privileged_group: str, unprivileged_group: str):
        print("=" * 70)
        print("  AI FAIRNESS AUDIT REPORT — PARADIS Algorithmic Accountability")
        print("=" * 70)

        # Métriques par groupe
        for g in [privileged_group, unprivileged_group]:
            n = len(self._get_group(g))
            ppr = self._positive_prediction_rate(g)
            tpr = self._true_positive_rate(g)
            fpr = self._false_positive_rate(g)
            print(f"\n  Groupe : {g.upper():15s}  N={n}")
            print(f"    Taux Prédictions Positives (PPR) : {ppr:.3f} ({ppr*100:.1f}%)")
            print(f"    Taux Vrais Positifs (TPR/Recall) : {tpr:.3f}")
            print(f"    Taux Faux Positifs (FPR)         : {fpr:.3f}")

        # Métriques de fairness
        print("\n  ─── MÉTRIQUES DE FAIRNESS ───")
        dpr = self.demographic_parity_ratio(unprivileged_group, privileged_group)
        eod = self.equal_opportunity_difference(privileged_group, unprivileged_group)

        dpr_ok = 0.8 <= dpr <= 1.25
        eod_ok = abs(eod) <= 0.1

        print(f"\n  Demographic Parity Ratio (DPR) : {dpr:.3f}  "
              f"{'✅ OK (0.8–1.25)' if dpr_ok else '❌ BIAIS DÉTECTÉ — Règle 4/5 violée'}")
        print(f"  Equal Opportunity Difference   : {eod:+.3f}  "
              f"{'✅ OK (|diff| ≤ 0.1)' if eod_ok else '❌ BIAIS DÉTECTÉ — Écart TPR trop grand'}")

        bias_detected = not dpr_ok or not eod_ok
        print("\n" + "=" * 70)
        print(f"  VERDICT FINAL : {'⚠️ BIAIS ALGORITHMIQUE DÉTECTÉ — Action corrective requise' if bias_detected else '✅ AUCUN BIAIS SIGNIFICATIF DÉTECTÉ'}")
        print("=" * 70)


if __name__ == "__main__":
    import random
    random.seed(42)

    # Simulation : modèle de scoring de crédit biaisé (cas réel type COMPAS)
    predictions = []

    # Groupe privilégié : taux d'approbation élevé (65%)
    for i in range(200):
        y_true = 1 if random.random() < 0.70 else 0
        # Le modèle est biaisé : prédit positif pour les solvables ET certains non-solvables
        y_pred = 1 if (y_true == 1 and random.random() < 0.90) or (y_true == 0 and random.random() < 0.25) else 0
        predictions.append(Prediction(f"P_A_{i}", "groupe_a_privilegie", y_true, y_pred))

    # Groupe sous-représenté : taux d'approbation réduit (40%)
    for i in range(200):
        y_true = 1 if random.random() < 0.65 else 0
        # Le modèle est plus conservateur : refuse plus souvent même les solvables
        y_pred = 1 if (y_true == 1 and random.random() < 0.65) or (y_true == 0 and random.random() < 0.10) else 0
        predictions.append(Prediction(f"P_B_{i}", "groupe_b_marginalise", y_true, y_pred))

    auditor = FairnessAuditor(predictions)
    auditor.audit_report("groupe_a_privilegie", "groupe_b_marginalise")
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **EU AI Act** | Règlement Européen sur l'Intelligence Artificielle (2024) — Premier cadre légal mondial pour l'IA |
| **Fairness** | Équité algorithmique — Propriété d'un système IA de ne pas discriminer les groupes protégés |
| **DPR** | Demographic Parity Ratio — Ratio de taux de prédictions positives entre groupes |
| **TPR** | True Positive Rate (Recall) — Taux de vrais positifs (sensibilité) |
| **FPR** | False Positive Rate — Taux de faux positifs |
| **COMPAS** | Correctional Offender Management Profiling for Alternative Sanctions — Algorithme de récidive criminel controversé (USA) |

---

## Exercices Pratiques

### Exercice 1 — Classification EU AI Act

Classez chacun des systèmes IA suivants selon les niveaux de risque de l'EU AI Act 2024 :

1. Un algorithme de recommandation de films sur une plateforme de streaming.
2. Un système de surveillance de l'état émotionnel des employés en entreprise.
3. Un chatbot de support client qui indique clairement qu'il est une IA.
4. Un outil de scoring automatique des CV pour sélection de candidats.
5. Un système de reconnaissance faciale en temps réel dans des espaces publics pour recherche criminelle.

**Corrigé :**
1. 🟢 **Risque Minimal** — Recommandations de divertissement, faible impact.
2. 🔴 **Risque Inacceptable (INTERDIT)** — Surveillance émotionnelle généralisée en milieu professionnel = manipulation.
3. 🟡 **Risque Limité** — Chatbot avec obligation de transparence (signaler qu'il est IA).
4. 🟠 **Risque Élevé (HIGH RISK)** — Décision RH automatisée = liste AI Act Annexe III.
5. 🔴 **Risque Inacceptable (INTERDIT)** — Biométrie temps réel espace public = interdite sauf exceptions très encadrées.

---

## Banque QCM — 5 Questions

**Q1.** Selon le **EU AI Act 2024**, un système de **scoring de crédit automatisé** se classe dans quel niveau de risque ?

- A) Risque Minimal
- B) Risque Limité
- C) Risque Élevé (High Risk) ✅
- D) Risque Inacceptable

**Q2.** Qu'est-ce que la **règle des 4/5** (80% rule) en matière de fairness algorithmique ?

- A) Un modèle doit atteindre 80% de précision.
- B) Si le taux de sélection d'un groupe protégé est inférieur à 80% de celui du groupe le plus favorisé, il y a présomption de disparate impact (discrimination indirecte). ✅
- C) L'IA doit être testée sur 80% des cas d'usage possibles.
- D) 80% des paramètres du modèle doivent être explicables.

**Q3.** Quel article du **RGPD** garantit le **droit à l'explication** pour les décisions prises par des systèmes automatisés ?

- A) Article 6 (Base légale)
- B) Article 17 (Droit à l'effacement)
- C) Article 22 (Décision automatisée individuelle, y compris le profilage) ✅
- D) Article 30 (Registre des activités)

**Q4.** Quelle cadre éthique juge la moralité d'une action uniquement par ses **conséquences** sur le bien-être collectif ?

- A) Déontologie (Kant)
- B) Éthique de la vertu (Aristote)
- C) Utilitarisme (Bentham/Mill) ✅
- D) Care Ethics (Gilligan)

**Q5.** Dans un audit de fairness, une **Equal Opportunity Difference** de **+0.25** entre deux groupes signifie :

- A) Le groupe favorisé a un taux de faux positifs 25% plus élevé.
- B) Le modèle identifie correctement les individus positifs (TPR/Recall) 25 points de pourcentage plus souvent dans le groupe favorisé que dans le groupe défavorisé — biais significatif. ✅
- C) Le modèle est plus précis de 25%.
- D) Le groupe défavorisé a 25% de données en moins.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
