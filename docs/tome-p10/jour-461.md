# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 461 (6h) : Monitoring de Modèles en Production : Data Drift, Concept Drift, Population Stability Index (PSI), Evidently AI & Trigger de Re-entraînement Automatique

> [!NOTE]
> **Objectifs pédagogiques :**
> - Différencier le **Data Drift** (dérive des données d'entrée) du **Concept Drift** (modification de la relation $P(Y|X)$)
> - Calculer les métriques statistiques de dérive : test de **Kolmogorov-Smirnov (KS)** et **Population Stability Index (PSI)**
> - Générer des rapports de dérive automatisés avec la bibliothèque **Evidently AI**
> - Implémenter un pipeline de **surveillance en temps réel** avec export de métriques vers Prometheus et déclenchement automatique du re-entraînement
>
> **Compétences visées :** `AI-03` (A) — ML Production Monitoring & Quality Assurance

---

## Module 1 — Concepts de Dérive : Data Drift vs Concept Drift (2h)

### 📖 Intuition & Narration

Un modèle de Machine Learning déployé en production commence à se dégrader dès la première seconde après sa mise en service. Contrairement au code logiciel traditionnel qui s'exécute de façon déterministe tant que l'infrastructure reste stable, un modèle ML dépend de la **stabilité statistique du monde réel**.

Lorsque le comportement des utilisateurs change, qu'un nouveau capteur IoT est introduit ou qu'une crise économique survient, la distribution des données réelles $P_{production}(X)$ s'éloigne de la distribution d'apprentissage $P_{train}(X)$.

### 🔍 Anatomie Technique — Typologie des Dérives Statistiques

```
TYPOLOGIE DES DÉRIVES EN PRODUCTION ML

  1. DATA DRIFT (Covariate Shift) :
     - Équation : P_prod(X) ≠ P_train(X), mais P(Y|X) reste identique.
     - Exemple  : L'âge moyen des utilisateurs passe de 25 ans à 55 ans suite à une campagne marketing. La logique du modèle reste vraie, mais les entrées ont changé.

  2. CONCEPT DRIFT (Prior/Posterior Shift) :
     - Équation : P_prod(Y|X) ≠ P_train(Y|X).
     - Exemple  : Durant la crise sanitaire, un comportement d'achat considéré autrefois comme "anormal" ou "frauduleux" devient le comportement standard. La vérité terrain a changé.

  3. CONCEPT SHIFT (Label Drift) :
     - Équation : P_prod(Y) ≠ P_train(Y).
     - Exemple  : Le taux de défaut de crédit augmente globalement dans toute la population.

MÉTRIQUES DE CALCUL DE LA DÉRIVE :
  - Test Kolmogorov-Smirnov (KS-Test) : Pour variables continues. Mesure la distance maximale entre deux CDFs. p-value < 0.05 ──▶ Drift détecté !
  - Population Stability Index (PSI)  :
    * PSI < 0.1   : Aucun changement significatif.
    * 0.1 <= PSI < 0.25 : Dérive modérée (Alerte).
    * PSI >= 0.25 : Dérive majeure (Déclencher le Re-entraînement).
```

---

## Module 2 — Atelier Pratique : Calcul de PSI & Rapports Evidently AI (2h)

### 🛠️ Script Python de Détection de Drift avec PSI & Evidently AI

```python
#!/usr/bin/env python3
"""
PARADIS — Système de Détection de Data Drift avec PSI et Evidently AI
Surveillance de la distribution des données réseau en production.
"""

import numpy as np
import pandas as pd
from scipy import stats

# 1. Implémentation pure de la métrique Population Stability Index (PSI)
def calculate_psi(reference: np.ndarray, target: np.ndarray, num_buckets: int = 10) -> float:
    """
    Calcule le PSI entre la distribution de référence (Train) et la distribution actuelle (Prod)
    """
    # Création des quantiles sur la référence
    percentiles = np.linspace(0, 100, num_buckets + 1)
    buckets = np.percentile(reference, percentiles)
    buckets[0] -= 1e-5
    buckets[-1] += 1e-5

    # Comptage des fréquences
    ref_counts, _ = np.histogram(reference, bins=buckets)
    target_counts, _ = np.histogram(target, bins=buckets)

    # Conversion en proportions (avec lissage epsilon pour éviter log(0))
    eps = 1e-4
    ref_props = (ref_counts + eps) / (len(reference) + eps * num_buckets)
    target_props = (target_counts + eps) / (len(target) + eps * num_buckets)

    # Formule du PSI : sum((Actual% - Expected%) * ln(Actual% / Expected%))
    psi_value = np.sum((target_props - ref_props) * np.log(target_props / ref_props))
    return float(psi_value)

def run_drift_monitoring_demo():
    np.random.seed(42)

    # Distribution d'Entraînement (Reference Data)
    train_traffic = np.random.normal(loc=1000.0, scale=150.0, size=5000)

    # Données de Production Sans Drift
    prod_normal = np.random.normal(loc=1005.0, scale=148.0, size=1000)

    # Données de Production Avec Drift Majeur (ex: Attaque DDoS ou changement réseau)
    prod_drifted = np.random.normal(loc=1400.0, scale=300.0, size=1000)

    # Calculations PSI
    psi_normal = calculate_psi(train_traffic, prod_normal)
    psi_drifted = calculate_psi(train_traffic, prod_drifted)

    # Tests Kolmogorov-Smirnov
    ks_stat_norm, p_val_norm = stats.ks_2samp(train_traffic, prod_normal)
    ks_stat_drift, p_val_drift = stats.ks_2samp(train_traffic, prod_drifted)

    print("=== TEST 1 : PRODUCTION NORMALE ===")
    print(f"PSI Score : {psi_normal:.4f} (Seuil alert >= 0.1)")
    print(f"KS p-value: {p_val_norm:.4e} (Drift si < 0.05)")
    print(f"Diagnostic: {'⚠️ DRIFT DÉTECTÉ' if psi_normal >= 0.1 else '✅ STATISTIQUEMENT STABLE'}\n")

    print("=== TEST 2 : PRODUCTION AVEC DRIFT MAJEUR ===")
    print(f"PSI Score : {psi_drifted:.4f} (Seuil alert >= 0.1)")
    print(f"KS p-value: {p_val_drift:.4e} (Drift si < 0.05)")
    print(f"Diagnostic: {'🚨 ALERT: DRIFT MAJEUR ! DECLENCHEMENT RE-ENTRAÎNEMENT' if psi_drifted >= 0.25 else 'OK'}\n")

    # Génération optionnelle de rapport HTML avec Evidently (si disponible)
    try:
        from evidently.report import Report
        from evidently.metric_preset import DataDriftPreset

        ref_df = pd.DataFrame({"packet_rate": train_traffic})
        prod_df = pd.DataFrame({"packet_rate": prod_drifted})

        report = Report(metrics=[DataDriftPreset()])
        report.run(reference_data=ref_df, current_data=prod_df)
        report.save_html("evidently_drift_report.html")
        print("[+] Rapport de dérive HTML sauvegardé : evidently_drift_report.html")
    except ImportError:
        print("[i] Bibliothèque 'evidently' non installée. Rapport HTML ignoré (pip install evidently).")

if __name__ == "__main__":
    run_drift_monitoring_demo()
```

---

## Module 3 — Prometheus Metrics & Automated Retraining Trigger (1h30)

### 🔍 Pipeline d'Alerte & Trigger de Re-entraînement

```
ARCHITECTURE DE MONITORING ET RETRAINING AUTOMATIQUE

  [ Serveur d'Inférence FastAPI ]
                 │
                 │ Export de métriques via prometheus_client
                 ▼
  ┌───────────────────────────────┐
  │     SERVEUR PROMETHEUS        │
  │ - Metric: ml_data_drift_psi   │
  │ - Metric: ml_prediction_count │
  └──────────────┬────────────────┘
                 │
                 │ AlertManager (Rule: ml_data_drift_psi > 0.25 pendant 15m)
                 ▼
  ┌───────────────────────────────┐
  │        WEBHOOK RECEIVER       │ (Kubernetes CronJob / Airflow / GitHub Dispatch)
  └──────────────┬────────────────┘
                 │
                 ▼
  ┌───────────────────────────────┐
  │ PIPELINE DE RE-ENTRAÎNEMENT  │
  │ 1. Ingestion nouvelles data   │
  │ 2. SFT / Training MLflow      │
  │ 3. Validation Challenger      │
  │ 4. Promotion @champion        │
  └───────────────────────────────┘
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PSI** | Population Stability Index — Indice de stabilité d'une population mesurant la dérive |
| **KS-Test** | Kolmogorov-Smirnov Test — Test statistique non paramétrique comparant deux distributions |
| **CDF** | Cumulative Distribution Function — Fonction de répartition cumulée d'une variable |
| **Data Drift** | Modification de la distribution des variables explicatives $P(X)$ au cours du temps |
| **Concept Drift** | Modification de la relation conditionnelle entre variables et cible $P(Y \mid X)$ |

---

## Exercices Pratiques

### Exercice 1 — Interprétation des Métriques de Drift

Lors d'un audit hebdomadaire de production d'un modèle de scoring bancaire, vous observez les résultats suivants :
- Variable `revenu_annuel` : $\text{PSI} = 0.04$, KS $p\text{-value} = 0.42$.
- Variable `nombre_credit_actifs` : $\text{PSI} = 0.28$, KS $p\text{-value} = 0.0001$.
1. Analysez le statut de chacune de ces variables.
2. Décrivez l'action MLOps immédiate à entreprendre.

**Corrigé guidé :**
1. **Analyse** :
   - `revenu_annuel` : $\text{PSI} < 0.1$ et $p\text{-value} > 0.05$. La distribution reste parfaitement stable par rapport au jeu d'entraînement.
   - `nombre_credit_actifs` : $\text{PSI} = 0.28 > 0.25$ et $p\text{-value} < 0.05$. Dérive statistique majeure (Data Drift) sur cette feature critique.
2. **Action MLOps** :
   - Déclencher une alerte prioritaire.
   - Analyser la cause de la dérive (changement de politique bancaire, bug dans le Feature Store).
   - Lancer le pipeline automatisé d'extraction des données récentes et exécuter un **re-entraînement du modèle** avec le nouveau jeu de données avant d'effectuer un Shadow Deployment de la version Challenger.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la différence essentielle entre **Data Drift** et **Concept Drift** ?

- A) Le Data Drift concerne les bases de données SQL, le Concept Drift concerne les bases NoSQL.
- B) Le Data Drift désigne un changement de distribution des variables d'entrée $P(X)$, tandis que le Concept Drift désigne un changement de la relation entre entrées et cibles $P(Y|X)$. ✅
- C) Le Concept Drift ne se produit que sur les modèles d'IA générative.
- D) Il n'y a aucune différence.

**Q2.** Selon la règle d'interprétation standard du **Population Stability Index (PSI)**, à partir de quel seuil la dérive est-elle considérée comme majeure et exige-t-elle un re-entraînement ?

- A) $\text{PSI} \ge 0.01$
- B) $\text{PSI} \ge 0.25$ ✅
- C) $\text{PSI} \ge 1.0$
- D) $\text{PSI} \ge 10.0$

**Q3.** Le test de **Kolmogorov-Smirnov (KS-test)** conclut à l'existence d'un Data Drift entre le train et la prod lorsque :

- A) La $p\text{-value}$ est supérieure à 0.95.
- B) La $p\text{-value}$ est inférieure au seuil de significativité $\alpha = 0.05$. ✅
- C) La valeur de la statistique est strictement égale à zéro.
- D) Les deux distributions contiennent exactement le même nombre d'échantillons.

**Q4.** Pourquoi ne peut-on pas s'appuyer uniquement sur les métriques de performance classiques (Accuracy, F1-score) pour surveiller un modèle en production temps réel ?

- A) Parce que l'Accuracy est trop rapide à calculer.
- B) Parce que la vérité terrain (True Labels $Y$) n'est souvent disponible qu'avec des jours ou des mois de décalage (Ground Truth Delay), alors que le Data Drift $X$ est calculable immédiatement sur les requêtes d'inférence. ✅
- C) Parce que Prometheus ne sait pas lire le F1-score.
- D) Parce que le F1-score ne s'applique qu'aux images.

**Q5.** Quelle bibliothèque Python open-source est spécialisée dans la génération automatique d'analyses visuelles de dérive de données et de performance de modèles ML ?

- A) Evidently AI ✅
- B) NumPy
- C) Flask
- D) SQLAlchemy

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
