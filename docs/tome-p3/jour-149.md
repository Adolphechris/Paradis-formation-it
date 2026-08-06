# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 149 (6h) : Intelligence Artificielle Appliquée à la Détection de Fraudes Bancaires (ML Fraud Detection, Feature Engineering & MLOps Banking)

> [!NOTE]
> **Objectif du jour :** Concevoir et déployer un pipeline de détection de fraudes bancaires en temps réel basé sur le machine learning : Feature Engineering des transactions RTGS/Mobile Money, entraînement d'un modèle XGBoost/Isolation Forest, déploiement sur Kubernetes (MLflow + Seldon Core), monitoring des dérives du modèle (Data Drift / Concept Drift) et explainability SHAP.
>
> **Compétences visées :** `BIT-09` (A) — MLOps & IA Appliquée au Banking | `SEC-05` (A) — Fraud Detection Pipeline Sécurisé

---

## 1) Module — Feature Engineering pour la Détection de Fraudes Bancaires (2h)

### 📖 Narration/Intuition

Entre janvier et juin 2026, la BCC a enregistré 1 247 transactions frauduleuses pour un montant total de 4,3 millions USD. L'enquête révèle que les fraudeurs exploitent systématiquement le même pattern : transactions de montants inhabituellement élevés, émises depuis un appareil mobile inconnu, à 2h du matin, vers des comptes ouverts moins de 48h avant.

Ces **features (caractéristiques)** comportementales récurrentes sont exactement ce qu'un modèle de Machine Learning peut apprendre à identifier en analysant des millions de transactions historiques.

### 🔍 Anatomie Technique

**Feature Engineering pour la détection de fraudes (Python/Pandas) :**

```python
#!/usr/bin/env python3
"""
fraud_feature_engineering.py — Création des features de détection de fraudes BCC
"""
import pandas as pd
import numpy as np
from datetime import datetime

def engineer_fraud_features(df: pd.DataFrame) -> pd.DataFrame:
    """Génère les features comportementales pour la détection de fraudes."""
    
    # 1. Features temporelles (les fraudes se produisent souvent la nuit)
    df['hour_of_day'] = pd.to_datetime(df['transaction_time']).dt.hour
    df['is_night_transaction'] = df['hour_of_day'].apply(lambda h: 1 if h < 6 or h > 22 else 0)
    df['day_of_week'] = pd.to_datetime(df['transaction_time']).dt.dayofweek

    # 2. Features comportementales (rapport montant vs historique du compte)
    df['amount_vs_avg_ratio'] = df['amount'] / df.groupby('account_id')['amount'].transform('mean')
    df['is_amount_outlier'] = (df['amount_vs_avg_ratio'] > 5).astype(int)

    # 3. Fréquence des transactions (burst de transactions = signal fraude)
    df['tx_count_last_1h'] = df.groupby('account_id')['transaction_id'].transform(
        lambda x: x.rolling('1H', on=df.loc[x.index, 'transaction_time']).count()
    )

    # 4. Nouveauté du bénéficiaire (compte destinataire récemment ouvert)
    df['beneficiary_age_days'] = (
        pd.to_datetime('2026-07-01') - pd.to_datetime(df['beneficiary_creation_date'])
    ).dt.days
    df['is_new_beneficiary'] = (df['beneficiary_age_days'] < 7).astype(int)

    return df[['hour_of_day', 'is_night_transaction', 'day_of_week',
               'amount_vs_avg_ratio', 'is_amount_outlier',
               'tx_count_last_1h', 'beneficiary_age_days', 'is_new_beneficiary']]
```

---

## 2) Module — Entraînement XGBoost & Déploiement MLflow/Seldon (2h)

### 📖 Narration/Intuition

Le modèle de détection de fraudes est entraîné sur 2 ans de données historiques de transactions de la BCC (~50 millions de lignes) avec un **XGBoost** (eXtreme Gradient Boosting), algorithme performant sur des données tabulaires déséquilibrées (99% de transactions légitimes, 1% frauduleuses).

### 🔍 Anatomie Technique

**Entraînement et tracking avec MLflow :**

```python
#!/usr/bin/env python3
"""Entraînement XGBoost pour la détection de fraudes avec MLflow tracking."""
import mlflow
import mlflow.xgboost
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score

mlflow.set_experiment("bcc_fraud_detection")

with mlflow.start_run(run_name="xgboost_fraud_v3"):
    # Hyperparamètres XGBoost
    params = {
        "n_estimators": 500,
        "max_depth": 6,
        "learning_rate": 0.05,
        "scale_pos_weight": 99,  # Gestion du déséquilibre : 99 légitimes pour 1 fraude
        "use_label_encoder": False,
        "eval_metric": "auc",
        "random_state": 42
    }
    mlflow.log_params(params)

    model = xgb.XGBClassifier(**params)
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    y_pred = model.predict(X_test)
    metrics = {
        "precision": precision_score(y_test, y_pred),
        "recall": recall_score(y_test, y_pred),
        "f1_score": f1_score(y_test, y_pred),
        "roc_auc": roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])
    }
    mlflow.log_metrics(metrics)
    mlflow.xgboost.log_model(model, "fraud_detection_model")
    print(f"✅ Modèle enregistré — F1: {metrics['f1_score']:.3f} | AUC: {metrics['roc_auc']:.3f}")
```

---

## 3) Module — Monitoring Drift & Explainability SHAP (2h)

### 📖 Narration/Intuition

Un modèle de fraude déployé en production se dégrade inévitablement avec le temps : les fraudeurs changent de méthodes (Concept Drift) et les patterns de transactions évoluent (Data Drift). Le monitoring continu des performances du modèle en production est non-négociable.

**SHAP (SHapley Additive exPlanations)** permet d'expliquer en langage humain pourquoi un modèle a classifié une transaction spécifique comme frauduleuse, une exigence légale pour les institutions financières réglementées.

### 🔍 Anatomie Technique

**Explication SHAP d'une prédiction de fraude :**

```python
import shap

explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test.iloc[[0]])

# Explication pour la transaction #1 de test :
# is_night_transaction : +0.45 (forte contribution → fraude)
# is_amount_outlier    : +0.38 (montant 7x supérieur à la moyenne → fraude)
# is_new_beneficiary   : +0.29 (bénéficiaire ouvert il y a 2 jours → fraude)
# day_of_week          : -0.12 (lundi → légèrement moins suspect)
# SCORE FINAL          : 0.87 → Fraude probable (seuil = 0.70)

shap.initjs()
shap.force_plot(explainer.expected_value, shap_values[0], X_test.iloc[0])
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MLOps** | Machine Learning Operations — Pratiques DevOps appliquées aux modèles de ML en production |
| **SHAP** | SHapley Additive exPlanations — Méthode d'interprétabilité des modèles ML |
| **XGBoost** | eXtreme Gradient Boosting — Algorithme de ML performant sur données tabulaires |
| **Data Drift** | Dérive statistique des données d'entrée du modèle en production |
| **Concept Drift** | Changement dans la relation entre les features et la variable cible (fraude) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi le paramètre **`scale_pos_weight`** est-il critique lors de l'entraînement d'un modèle XGBoost de détection de fraudes bancaires ?

**Corrigé :** Dans un jeu de données de détection de fraudes, les classes sont extrêmement déséquilibrées : typiquement 99% de transactions légitimes pour 1% de transactions frauduleuses. Sans correction, l'algorithme XGBoost optimise son accuracy globale en prédisant "légitime" pour tout, atteignant 99% d'accuracy mais 0% de recall sur les fraudes (le vrai problème). Le paramètre **`scale_pos_weight = 99`** dit au modèle de pondérer chaque exemple frauduleux 99 fois plus que chaque exemple légitime, forçant le modèle à apprendre les patterns de fraude malgré leur rareté.

**Exercice 2 :** Quelle est la différence entre **Data Drift** et **Concept Drift** en MLOps de détection de fraudes ?

**Corrigé :** Le **Data Drift** est un changement dans la distribution statistique des données d'entrée du modèle : par exemple, si la BCC lance Mobile Money et que 60% des nouvelles transactions viennent de smartphones (vs 10% lors de l'entraînement), la distribution de la feature "canal" a changé. Le modèle reçoit des données significativement différentes de ce sur quoi il a été entraîné, dégradant ses performances. Le **Concept Drift** est un changement dans la **relation** entre les features et la variable cible : les fraudeurs changent de méthodes (ex: ils n'opèrent plus la nuit mais le matin). La feature `is_night_transaction` qui était très prédictive du fraud perd sa valeur discriminante.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel algorithme de Machine Learning basé sur des arbres de décision en gradient boosting est particulièrement performant pour la détection de fraudes sur des données tabulaires déséquilibrées ?
- A) XGBoost (eXtreme Gradient Boosting)
- B) Paint
- C) Word
- D) Excel

**Réponse : A**

**Q2 :** Quel outil permet aux équipes ML bancaires d'expliquer en langage humain pourquoi un modèle de fraud detection a classifié une transaction spécifique comme frauduleuse ?
- A) SHAP (SHapley Additive exPlanations)
- B) USB
- C) Disquette
- D) VGA

**Réponse : A**

**Q3 :** Quel est l'objectif principal de la plateforme MLflow dans un pipeline MLOps de production ?
- A) Tracer, versionner et comparer les expériences d'entraînement ML (hyperparamètres, métriques, artefacts)
- B) Regarder des vidéos
- C) Imprimer des documents
- D) Configurer Wi-Fi

**Réponse : A**

**Q4 :** Qu'est-ce que le Concept Drift dans le contexte d'un modèle de détection de fraudes bancaires déployé en production ?
- A) Un changement dans la relation entre les features et la variable cible car les fraudeurs changent leurs méthodes d'attaque
- B) Un changement de la couleur de l'interface
- C) Une mise à jour du système d'exploitation
- D) Un remplacement du câble réseau

**Réponse : A**

**Q5 :** Pourquoi les institutions financières réglementées ont-elles l'obligation légale d'utiliser des modèles ML explicables (SHAP, LIME) pour refuser un crédit ou bloquer une transaction ?
- A) Car le Règlement Général sur la Protection des Données (RGPD Art. 22) oblige à fournir une explication humainement compréhensible des décisions automatisées affectant des personnes
- B) Car les modèles explicables sont plus rapides
- C) Car cela réduit les coûts serveurs
- D) Car cela améliore la vitesse du Wi-Fi

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
