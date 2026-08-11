# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 486 (6h) : Génération de Données Synthétiques pour LLMs & Vision : Self-Instruct, Evol-Instruct, SDV & Validation de Fidélité

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre le paradigme du **Data Bootstrapping** et de la génération de données synthétiques par LLM
> - Maîtriser les méthodologies **Self-Instruct** et **Evol-Instruct (WizardLM)** pour amplifier la complexité des prompts
> - Générer des tables relationnelles synthétiques et confidentielles avec **SDV (Synthetic Data Vault)**
> - Évaluer la **fidélité**, la **diversité** et le **risque de fuite de confidentialité** des jeux de données synthétiques
>
> **Compétences visées :** `DATA-01` (A), `AI-02` (A) — Synthetic Data Engineering & Bootstrapping

---

## Module 1 — Méthodologies de Bootstrapping : Self-Instruct & Evol-Instruct (2h)

### 📖 Intuition & Narration

La pénurie de données d'apprentissage annotées de haute qualité est le goulot d'étranglement majeur du Machine Learning. Les données réelles sont souvent rares, coûteuses à étiqueter à la main, ou soumises à de fortes contraintes de confidentialité (RGPD, données médicales ou bancaires).

La **Génération de Données Synthétiques (Synthetic Data Generation)** utilise des modèles de fondation puissants (ex: GPT-4o, LLaMA-3-70B) comme "usines à données" pour auto-générer des millions d'exemples d'apprentissage qui serviront ensuite à entraîner des modèles plus petits et spécialisés.

### 🔍 Anatomie Technique — Pipeline Evol-Instruct (WizardLM)

```
PIPELINE EVOL-INSTRUCT (Augmentation de la Complexité des Prompts)

  [ Seed Prompt Simple ] : "Écris un script bash pour lister les fichiers."
                                   │
                                   ▼
             ┌──────────────────────────────────────────┐
             │ LLM EVOLVER (MUTATION DE COMPLEXITÉ)     │
             │ Applique une stratégie de mutation :      │
             │ 1. In-Breadth Evolution (Diversifier)    │
             │ 2. In-Depth Evolution (Complexifier)     │
             │    - Ajouter des contraintes             │
             │    - Augmenter les étapes de raisonnement│
             │    - Remplacer par des cas limites      │
             └─────────────────────┬────────────────────┘
                                   │
                                   ▼
  [ Prompt Évolué ] : "Écris un script bash robuste avec gestion d'erreurs, trap SIGINT,
                       et logs JSON pour lister les fichiers modifiés il y a < 24h."
                                   │
                                   ▼
             ┌──────────────────────────────────────────┐
             │ LLM RESPONDER                            │ ──► [ Exemple Synthétique ]
             │ Génère la réponse expert correspondante. │     (Prompt + Output)
             └──────────────────────────────────────────┘
```

---

## Module 2 — Atelier Pratique : Génération de Tables Synthétiques avec SDV (2h)

### 🛠️ Code Python : Génération de Logs Synthétiques avec SDV & GaussianCopula

```python
#!/usr/bin/env python3
"""
PARADIS — Génération de Données Synthétiques Tabulaires avec Synthetic Data Vault (SDV)
"""

import pandas as pd
import numpy as np

def run_synthetic_data_demo():
    print("[*] --- DÉMONSTRATION SYNTHETIC DATA VAULT (SDV) PARADIS IT ---")

    # 1. Création d'un jeu de données réel original (Contenant des PII sensibles)
    np.random.seed(42)
    n = 500
    real_data = pd.DataFrame({
        "user_id": range(1000, 1000 + n),
        "age": np.random.normal(38, 10, n).astype(int),
        "account_balance": np.random.exponential(5000, n),
        "fraud_flag": np.random.choice([0, 1], size=n, p=[0.95, 0.05])
    })

    print("\n[1] Aperçu des Données Réelles Originales (Sensibles) :")
    print(real_data.head(3))

    # 2. Modélisation et Génération Synthétique avec SDV
    try:
        from sdv.single_table import GaussianCopulaSynthesizer
        from sdv.metadata import SingleTableMetadata

        print("\n[*] Extraction des métadonnées et apprentissage du synthétiseur Copula...")
        metadata = SingleTableMetadata()
        metadata.detect_from_dataframe(real_data)

        # Spécifier que user_id est une clé primaire
        metadata.update_column(column_name='user_id', sdv_type='id')

        synthesizer = GaussianCopulaSynthesizer(metadata)
        synthesizer.fit(real_data)

        # Génération de 100 nouvelles lignes 100% synthétiques (Sans fuite PII !)
        synthetic_data = synthesizer.sample(num_rows=100)

        print("\n[+] DONNÉES SYNTHÉTIQUES GÉNÉRÉES (Aucune correspondance PII directe) :")
        print(synthetic_data.head(3))

        # Évaluation de la Fidélité Statistique
        from sdv.evaluation.single_table import evaluate_quality
        quality_report = evaluate_quality(real_data, synthetic_data, metadata)
        print(f"\n[+] Score de Fidélité Statistique SDV : {quality_report.get_score() * 100:.1f}%")

    except ImportError:
        print("\n[!] Bibliothèque 'sdv' non installée (pip install sdv). Mode démo actif.")
        print("    [+] Score de Fidélité Statistique SDV simulé : 92.4% (Structure des distributions préservée).")

if __name__ == "__main__":
    run_synthetic_data_demo()
```

---

## Module 3 — Validation de Fidélité & Détection de Memorisation (1h30)

### 🔍 Métriques d'Évaluation des Données Synthétiques

```
TROIS AXES D'ÉVALUATION DE DONNÉES SYNTHÉTIQUES

  1. FIDÉLITÉ STATISTIQUE (Shape & Trend Quality) :
     - Les distributions univariées (histogrammes) et bivariées (corrélation de Pearson) sont-elles identiques aux originales ?
     - Test KS (Kolmogorov-Smirnov) par colonne.

  2. UTILITÉ EN MACHINE LEARNING (TRTR vs TSTR) :
     - TSTR (Train on Synthetic, Test on Real) : Entraîner le modèle sur les données synthétiques et tester sur de VRAIES données.
     - Si la précision TSTR ≈ TRTR (Train on Real, Test on Real) ──► La donnée synthétique est 100% utile !

  3. PRÉSERVATION DE LA CONFIDENTIALITÉ (Privacy & Membership Inference) :
     - Distance au voisin réel le plus proche (DCR - Distance to Closest Record).
     - Si DCR ≈ 0 ──► Le générateur a simplement mémorisé/copié les données réelles (Risque d'exfiltration RGPD !).
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SDV** | Synthetic Data Vault — Écosystème open-source de génération de données synthétiques |
| **TSTR** | Train on Synthetic, Test on Real — Méthodologie de validation de l'utilité des données synthétiques |
| **DCR** | Distance to Closest Record — Métrique de confidentialité mesurant le risque de mémorisation |
| **Self-Instruct** | Pipeline de génération automatique de données d'instructions par un LLM |
| **PII** | Personally Identifiable Information — Données personnelles identifiables protégées par la loi |

---

## Exercices Pratiques

### Exercice 1 — Évaluation TSTR (Train on Synthetic, Test on Real)

Un ingénieur MLOps souhaite remplacer un jeu de données bancaires confidentielles par des données synthétiques.
- Modèle entraîné sur données Réelles, testé sur données Réelles (TRTR) : $\text{F1-score} = 0.88$.
- Modèle entraîné sur données Synthétiques A, testé sur données Réelles (TSTR_A) : $\text{F1-score} = 0.86$.
- Modèle entraîné sur données Synthétiques B, testé sur données Réelles (TSTR_B) : $\text{F1-score} = 0.45$.

1. Calculez l'écart de performance de TSTR_A et TSTR_B par rapport à la baseline TRTR.
2. Quel jeu de données synthétiques est validé pour l'entraînement en production ?

**Corrigé guidé :**
1. **Écart de performance** :
   - Jeu A : $\Delta_{F1} = 0.88 - 0.86 = 0.02$ (Baisse de seulement $2.2\%$).
   - Jeu B : $\Delta_{F1} = 0.88 - 0.45 = 0.43$ (Chute massive de $48.8\%$).
2. **Recommandation** :
   Le **Jeu Synthétique A** est validé. Il conserve $97.8\%$ de l'utilité prédictive du dataset réel original (TSTR très proche de TRTR), prouvant que le synthétiseur a capturé la vraie frontière de décision sans copier les données brutes. Le Jeu B est rejeté.

---

## Banque QCM — 5 Questions

**Q1.** Quel est le principal avantage de l'utilisation de **Données Synthétiques** en entreprise ?

- A) Elles éliminent le besoin d'acheter des cartes graphiques.
- B) Elles permettent de créer des jeux de données volumineux et annotés sans violer la confidentialité des personnes (RGPD/PII) ni dépendre de la collecte manuelle coûteuse. ✅
- C) Elles suppriment le besoin d'entraîner le modèle.
- D) Elles sont lisibles sans ordinateur.

**Q2.** Dans la méthodologie **Evol-Instruct (WizardLM)**, que fait le module "Evolver" ?

- A) Il efface le prompt d'entrée.
- B) Il applique des mutations contrôlées pour complexifier artificiellement un prompt simple (ajout de contraintes, cas limites, raisonnement multi-étapes) afin d'obtenir des données d'entraînement de plus haut niveau. ✅
- C) Il traduit le texte en binaire.
- D) Il réduit la taille du fichier.

**Q3.** Que mesure la méthodologie de validation **TSTR (Train on Synthetic, Test on Real)** ?

- A) La vitesse d'impression des données sur papier.
- B) L'utilité réelle des données synthétiques en vérifiant si un modèle entraîné UNIQUEMENT sur ces données synthétiques conserve une excellente précision sur de vraies données de test. ✅
- C) Le nombre de lignes d'un fichier CSV.
- D) La température du processeur.

**Q4.** Si la métrique **DCR (Distance to Closest Record)** entre un jeu de données synthétique et le jeu réel est égale à zéro ($\text{DCR} = 0$), cela signifie que :

- A) Les données synthétiques sont d'une qualité parfaite.
- B) Le générateur synthétique a simplement mémorisé et copié à l'identique une ligne du jeu de données réel, créant un risque de fuite de confidentialité PII. ✅
- C) Le fichier est corrompu.
- D) L'entraînement s'est déroulé en 0 seconde.

**Q5.** Dans la bibliothèque SDV (Synthetic Data Vault), quel synthétiseur repose sur la modélisation des dépendances entre colonnes via des copules gaussiennes ?

- A) GaussianCopulaSynthesizer ✅
- B) RandomNumberGenerator
- C) SimpleTextFilter
- D) SQLiteEngine

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
