# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 478 (6h) : Évaluation & Calibration de Modèles ML : Métriques Avancées (ROC-AUC, PR-AUC, ROUGE, BERTScore), Calibration & Benchmarks LLM (MMLU, HumanEval)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maitriser les métriques avancées de classification (AUC-ROC vs Precision-Recall Curve sur datasets imbalancés)
> - Évaluer la qualité du texte généré avec les métriques NLP : **BLEU**, **ROUGE-L** et **BERTScore**
> - Diagnostiquer la **calibration des probabilités** d'un modèle (Expected Calibration Error - ECE) et appliquer le **Platt Scaling / Temperature Scaling**
> - Analyser la méthodologie des benchmarks standards pour LLMs : **MMLU**, **HumanEval (pass@k)**, **GSM8K** et **HellaSwag**
>
> **Compétences visées :** `AI-03` (A) — Model Evaluation, Calibration & Benchmarking

---

## Module 1 — Métriques Avancées & Courbes ROC vs Precision-Recall (2h)

### 📖 Intuition & Narration

L'évaluation d'un modèle ML ne se résume pas à l'Accuracy. Sur un dataset où $99\%$ des exemples sont négatifs (ex: détection de fraudes ou d'intrusions), un modèle trivial qui prédit toujours 0 obtient $99\%$ d'Accuracy tout en étant totalement inutile.

Pour les problèmes déséquilibrés, deux courbes sont reines :
1. **La Courbe ROC (Receiver Operating Characteristic)** : Trace le taux de vrais positifs ($\text{TPR} = \text{Recall}$) en fonction du taux de faux positifs ($\text{FPR}$). L'aire sous la courbe (**AUC-ROC**) mesure la capacité globale d'ordonnancement du modèle.
2. **La Courbe Precision-Recall (PR Curve)** : Trace la Précision en fonction du Rappel. **Indispensable sur datasets très imbalancés**, car elle n'est pas polluée par le grand nombre de vrais négatifs (True Negatives).

### 🔍 Anatomie Technique — Matrice de Confusion et Métriques NLP

```
MATRICE DE CONFUSION ET MÉTRIQUES CLES

                Prédiction = 1       Prédiction = 0
  Réel = 1      True Positive (TP)   False Negative (FN)
  Réel = 0      False Positive (FP)  True Negative (TN)

  - Precision = TP / (TP + FP)   --> "Quand le modèle prédit 1, a-t-il raison ?"
  - Recall    = TP / (TP + FN)   --> "Le modèle a-t-il capturé toutes les vraies menaces ?"
  - F1-Score  = 2 * (Precision * Recall) / (Precision + Recall)

MÉTRIQUES NLP DE GÉNÉRATION :
  - BLEU (N-gram overlap) : Compare la superposition exacte des n-grammes avec le texte de référence (Très strict).
  - ROUGE-L (Longest Common Subsequence) : Mesure la plus longue sous-séquence commune (Idéal pour le résumé).
  - BERTScore (Semantic Similarity) : Utilise les embeddings BERT pour mesurer la similarité sémantique (Insensible aux synonymes !).
```

---

## Module 2 — Atelier Pratique : Calibration de Modèle & ECE (Expected Calibration Error) (2h)

### 🛠️ Script Python : Diagnostic de Calibration et Temperature Scaling

```python
#!/usr/bin/env python3
"""
PARADIS — Calibration des Probabilités et Calcul de l'Expected Calibration Error (ECE)
Un modèle calibré produit des probabilités qui reflètent la vraie confiance de succès (P=0.8 -> 80% de succès réels).
"""

import numpy as np

def calculate_ece(probs: np.ndarray, labels: np.ndarray, n_bins: int = 10) -> float:
    """
    Calcule l'Expected Calibration Error (ECE)
    """
    bin_boundaries = np.linspace(0, 1, n_bins + 1)
    ece = 0.0
    total_samples = len(probs)

    for i in range(n_bins):
        bin_lower = bin_boundaries[i]
        bin_upper = bin_boundaries[i + 1]

        # Échantillons tombant dans l'intervalle [bin_lower, bin_upper]
        in_bin = (probs > bin_lower) & (probs <= bin_upper)
        prop_in_bin = np.mean(in_bin)

        if prop_in_bin > 0:
            accuracy_in_bin = np.mean(labels[in_bin])
            avg_confidence_in_bin = np.mean(probs[in_bin])
            # Différence entre la confiance moyenne et la précision réelle du bin
            ece += np.abs(accuracy_in_bin - avg_confidence_in_bin) * (sum(in_bin) / total_samples)

    return float(ece)

def run_calibration_demo():
    np.random.seed(42)
    n = 1000

    # Simulation d'un réseau de neurones profond SUR-CONFIANT (Uncalibrated)
    raw_probs = np.random.beta(a=5, b=1, size=n)  # Très concentré vers 0.9 - 1.0
    true_labels = (np.random.random(n) < (raw_probs * 0.7)).astype(int)  # Précision réelle plus faible

    ece_uncalibrated = calculate_ece(raw_probs, true_labels)
    print(f"[*] ECE Modèle Non-Calibré (Sur-Confiant) : {ece_uncalibrated:.4f} (Souhaité < 0.02)")

    # Temperature Scaling (Post-hoc Calibration)
    # Formule: P_calibrated = Softmax(Logits / T) avec T > 1 pour réduire la sur-confiance
    temperature = 2.2
    logits = np.log(raw_probs / (1 - raw_probs + 1e-9))
    calibrated_probs = 1 / (1 + np.exp(-logits / temperature))

    ece_calibrated = calculate_ece(calibrated_probs, true_labels)
    print(f"[+] ECE Modèle Calibré (Temperature T={temperature}) : {ece_calibrated:.4f}")
    print("  ✅ Le Temperature Scaling a réduit le biais de sur-confiance du modèle.")

if __name__ == "__main__":
    run_calibration_demo()
```

---

## Module 3 — Benchmarks Évaluation LLMs (MMLU, HumanEval) (1h30)

### 🔍 Méthodologie des Benchmarks LLM Standards

```
BENCHMARKS LLM STANDARDS DE L'INDUSTRIE

  1. MMLU (Massive Multitask Language Understanding) :
     - 57 sujets (Histoire, Droit, Informatique, Éthique, Chimie, Économie).
     - Format QCM à 4 choix. Évalue la culture générale et le raisonnement académique du LLM.

  2. HumanEval (Pass@k) :
     - 164 problèmes de programmation Python écrits par OpenAI.
     - Métrique Pass@1 : Le modèle génère 1 solution Python, validée par des tests unitaires automatiques.

  3. GSM8K (Grade School Math) :
     - 8 500 problèmes de mathématiques de niveau collège exigeant un raisonnement par étapes (Chain-of-Thought).

  4. HellaSwag :
     - Évalue le sens commun (Commonsense Reasoning) en prédisant la fin la plus logique d'une scène vidéo décrite.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **AUC-ROC** | Area Under Curve - Receiver Operating Characteristic — Aire sous la courbe ROC |
| **ECE** | Expected Calibration Error — Écart moyen pondéré entre la confiance prédite et l'accuracy |
| **MMLU** | Massive Multitask Language Understanding — Benchmark LLM généraliste sur 57 matières |
| **Pass@k** | Taux de réussite de génération de code où au moins 1 des k échantillons passe les tests |
| **BERTScore** | Métrique NLP d'évaluation sémantique basée sur la similarité des contextual embeddings |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Pass@1 pour HumanEval

Lors d'un test de génération de code Python sur le benchmark HumanEval (164 problèmes) :
- Le modèle A réussit les tests unitaires pour $131.2$ problèmes du premier coup ($k=1$).
- Le modèle B réussit les tests unitaires pour $147.6$ problèmes du premier coup.
1. Calculez le score **Pass@1** (en pourcentage) pour le Modèle A et le Modèle B.
2. Quel modèle est recommandé pour une intégration dans un assistant d'écriture de code IDE ?

**Corrigé guidé :**
1. **Calcul des Pass@1** :
   - Modèle A : $\text{Pass@1} = (131.2 / 164) \times 100 = 80.0\%$.
   - Modèle B : $\text{Pass@1} = (147.6 / 164) \times 100 = 90.0\%$.
2. **Recommandation** :
   Le **Modèle B** surpasse le Modèle A de 10 points de pourcentage sur HumanEval. Il génère du code syntaxiquement et logiquement exact 9 fois sur 10 du premier coup, ce qui en fait le choix idéal pour l'intégration IDE.

---

## Banque QCM — 5 Questions

**Q1.** Pourquoi la courbe **Precision-Recall (PR-Curve)** est-elle recommandée par rapport à la courbe **ROC** sur des jeux de données fortement déséquilibrés ?

- A) Parce que la courbe ROC est plus lente à dessiner.
- B) Parce que la courbe ROC utilise le taux de faux positifs (FPR = FP/TN), qui reste artificiellement très bas lorsque le nombre de vrais négatifs (TN) est immense, masquant la mauvaise précision réelle. ✅
- C) Parce que la PR-Curve ne fonctionne que sur GPU.
- D) Parce que la courbe ROC est interdite par la norme ISO.

**Q2.** À quoi sert la métrique **BERTScore** par rapport aux métriques NLP traditionnelles comme **BLEU** ?

- A) À mesurer la vitesse de frappe au clavier.
- B) À évaluer la similarité sémantique profonde entre le texte généré et la référence grâce aux embeddings contextuels, évitant d'exiger une correspondance exacte mot à mot. ✅
- C) À compter le nombre de fautes d'orthographe.
- D) À traduire le texte en braille.

**Q3.** Qu'indique un score **ECE (Expected Calibration Error)** élevé (ex: ECE = 0.25) sur un modèle de classification ?

- A) Que le modèle est très rapide.
- B) Que les probabilités produites par le modèle sont mal calibrées (souvent sur-confiantes, annonçant 99% de certitude pour des prédictions qui se révèlent fausses). ✅
- C) Que la mémoire RAM est saturée.
- D) Que le modèle contient un virus.

**Q4.** Dans le benchmark de code **HumanEval**, que mesure la métrique **Pass@1** ?

- A) La vitesse de compilation du code en C.
- B) Le pourcentage de problèmes de programmation pour lesquels l'unique solution générée du premier coup par le LLM passe tous les tests unitaires automatiques. ✅
- C) Le nombre de lignes de code écrites par minute.
- D) Le prix du modèle sur AWS.

**Q5.** Quelle technique d'ajustement post-hoc simple permet de recalibrer les probabilités d'un réseau de neurones sur-confiant sans modifier ses poids ?

- A) Le re-démarrage du serveur.
- B) Le Temperature Scaling (division des logits par un facteur $T > 1$ avant l'application du Softmax). ✅
- C) L'augmentation de la taille des images.
- D) La suppression des logs.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
