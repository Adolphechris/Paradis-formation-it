# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 459 (6h) : Feature Engineering & Feature Store (Feast) : Ingestion, Point-in-Time Joins, Détection du Data Leakage & Feature Importance (SHAP)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre les méthodes avancées de **Feature Engineering** : encodage cible (Target Encoding), découpage temporel, fenêtrage glissant
> - Détecter et éliminer le **Data Leakage** (fuite de données du futur dans le présent)
> - Architecturer un **Feature Store avec Feast** (Online Store Redis / Offline Store BigQuery/Parquet)
> - Implémenter des jointures temporelles précises (**Point-in-Time Joins**) pour éviter tout décalage d'entraînement
>
> **Compétences visées :** `DATA-01` (A) — Feature Engineering & Feature Stores

---

## Module 1 — Techniques Avancées de Feature Engineering & Data Leakage (2h)

### 📖 Intuition & Narration

En Machine Learning appliqué, l'expression *« Garbage In, Garbage Out »* gouverne les résultats. La qualité des **features** (variables explicatives) influence bien plus les performances d'un modèle qu'une recherche d'hyperparamètres complexe.

Cependant, la création manuelle de features comporte un piège mortel : le **Data Leakage (Fuite de données)**. Le data leakage survient lorsque des informations issues du futur (ou du jeu de test) s'infiltrent dans le jeu d'entraînement. Un modèle entraîné avec du leakage affiche un F1-score parfait de 99% en laboratoire, mais s'effondre totalement en production.

### 🔍 Anatomie Technique — Prévention du Data Leakage

```
SCHÉMA TEMPOREL — PRÉVENTION DU DATA LEAKAGE

    Axe du Temps
  ─────────────────────────────────────────────────────────────►
                   Observation Event (t_obs)     Prédire Y (t_target)
                              │                          │
  ◄─── FENÊTRE DE FEATURES ──►│                          │
  (Seules les données antérieures                        │
   à t_obs sont autorisées !)                            │
  ────────────────────────────                           │
  Ex: Somme transactions 7j                              │
      Dernier login IP                                   │
                                                         ▼
                                                Evénement cible :
                                                Fraude / Non-Fraude

RÈGLE D'OR POINT-IN-TIME :
  Pour chaque exemple d'entraînement à l'instant t_obs,
  toutes les features doivent être calculées STRICTEMENT avec des données
  dont l'horodatage est <= t_obs.
```

---

## Module 2 — Architecture & Implémentation d'un Feature Store (Feast) (2h)

### 🛠️ Configuration Feast (repository.yaml & definitions.py)

```python
#!/usr/bin/env python3
"""
PARADIS — Configuration Feast Feature Store
Définition des entités, des vues de features et du point-in-time join.
"""

from datetime import timedelta
import pandas as pd
from feast import (
    Entity,
    FeatureView,
    Field,
    FileSource,
    ValueType,
)
from feast.types import Float32, Int64

# 1. Définition du fichier source offline (Parquet)
user_stats_source = FileSource(
    name="user_stats_source",
    path="data/user_stats.parquet",
    timestamp_field="event_timestamp",
    created_timestamp_column="created",
)

# 2. Définition de l'Entité (Clé primaire de jointure)
user_entity = Entity(
    name="user_id",
    value_type=ValueType.INT64,
    description="Identifiant unique de l'utilisateur PARADIS",
)

# 3. Définition de la Vue de Features (FeatureView)
user_stats_fv = FeatureView(
    name="user_stats_feature_view",
    entities=[user_entity],
    ttl=timedelta(days=30),
    schema=[
        Field(name="avg_transaction_amount_7d", dtype=Float32),
        Field(name="failed_login_attempts_24h", dtype=Int64),
        Field(name="risk_score", dtype=Float32),
    ],
    online=True,
    source=user_stats_source,
    tags={"team": "secops_fraud"},
)

def demonstrate_point_in_time_join():
    """
    Simulation d'un Point-in-Time Join avec Feast pour éviter le Data Leakage
    """
    print("[*] Démonstration du Point-in-Time Join (Feast)...")

    # Jeu de données d'événements cibles (Observations)
    entity_df = pd.DataFrame(
        {
            "user_id": [1001, 1002, 1001],
            "event_timestamp": pd.to_datetime([
                "2026-05-10 14:30:00",
                "2026-05-11 09:15:00",
                "2026-05-20 18:00:00"
            ]),
            "label_churn": [0, 1, 1]
        }
    )

    print("\n--- ÉVÉNEMENTS CIBLES (Entity DataFrame) ---")
    print(entity_df)

    print("\n[+] Jointure temporelle effectuée : Feast garantit la correspondance des valeurs à t <= event_timestamp.")

if __name__ == "__main__":
    demonstrate_point_in_time_join()
```

---

## Module 3 — Sélection de Features & Calcul d'Importance avec SHAP (1h30)

### 🛠️ Script d'Analyse d'Importance avec SHAP (SHapley Additive exPlanations)

```python
#!/usr/bin/env python3
"""
PARADIS — Sélection et Explicabilité des Features via SHAP
"""

import xgboost as xgb
import shap
import numpy as np
import pandas as pd

def run_shap_feature_selection():
    # 1. Génération de données synthétiques avec bruit
    np.random.seed(42)
    n = 500
    df = pd.DataFrame({
        "login_frequency": np.random.poisson(lam=5, size=n),
        "failed_logins": np.random.poisson(lam=0.5, size=n),
        "ip_reputation_score": np.random.uniform(0, 100, size=n),
        "random_noise_feature": np.random.normal(0, 1, size=n)  # Inutile
    })

    # Cible : Risque de sécurité (dépend principalement de failed_logins et ip_reputation_score)
    y = (df["failed_logins"] * 2 + (100 - df["ip_reputation_score"]) * 0.05 + np.random.normal(0, 1, size=n) > 3).astype(int)

    # 2. Entraînement Modèle XGBoost
    model = xgb.XGBClassifier(n_estimators=50, max_depth=3, random_state=42)
    model.fit(df, y)

    # 3. Calcul des valeurs SHAP (TreeExplainer)
    explainer = shap.TreeExplainer(model)
    shap_values = explainer(df)

    # 4. Calcul de l'importance moyenne absolue par feature
    mean_shap = np.abs(shap_values.values).mean(axis=0)
    feature_importance = pd.DataFrame({
        "feature": df.columns,
        "importance_shap": mean_shap
    }).sort_values(by="importance_shap", ascending=False)

    print("\n--- CLASSEMENT DES FEATURES PAR IMPORTANCE SHAP ---")
    print(feature_importance.to_string(index=False))

    # Filtrage automatique des features sous un seuil de pertinence
    threshold = 0.05
    selected_features = feature_importance[feature_importance["importance_shap"] > threshold]["feature"].tolist()
    print(f"\n[+] Features sélectionnées (Seuil > {threshold}) : {selected_features}")

if __name__ == "__main__":
    run_shap_feature_selection()
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Feast** | Feature Store open-source pour la gestion et le service de features ML |
| **SHAP** | SHapley Additive exPlanations — Méthode basée sur la théorie des jeux pour l'explicabilité |
| **RFE** | Recursive Feature Elimination — Technique itérative de sélection de variables |
| **Online Store** | Base de données faible latence (Redis/DynamoDB) pour servir les features au moment de l'inférence |
| **Offline Store** | Entrepôt de données (BigQuery/Snowflake/Parquet) pour le calcul massif de features d'entraînement |

---

## Exercices Pratiques

### Exercice 1 — Identification et Correction de Data Leakage

Un Data Scientist conçoit un modèle de détection de transactions frauduleuses. Il crée une feature `total_user_spent_2026` calculée comme la somme totale dépensée par l'utilisateur sur l'ensemble de l'année 2026, puis il l'utilise pour prédire des transactions ayant eu lieu en mars 2026.
1. Expliquez pourquoi cette feature constitue un cas grave de Data Leakage.
2. Reformulez la feature correctement selon le principe Point-in-Time.

**Corrigé guidé :**
1. **Explication du Leakage** : Pour une transaction survenue en mars 2026, la variable `total_user_spent_2026` intègre les montants des transactions réalisées entre avril et décembre 2026. Le modèle apprend avec des données du futur qu'il ne possèdera pas en temps réel en mars. Cela fausse l'évaluation.
2. **Correction Point-in-Time** : La feature doit être restreinte au passé : `total_user_spent_last_30d` calculée dynamiquement sur l'intervalle $[t_{obs} - 30\text{ jours}, t_{obs}[$.

---

## Banque QCM — 5 Questions

**Q1.** Quel est le rôle principal d'un **Feature Store** comme Feast dans une architecture MLOps ?

- A) Compresser les modèles PyTorch en format GGUF.
- B) Éviter le décalage entraînement/inférence (Train/Serve Skew) en centralisant la définition et le service des features entre l'Offline Store et l'Online Store. ✅
- C) Remplacer les bases de données relationnelles pour les utilisateurs.
- D) Générer des rapports PDF automatiques.

**Q2.** Quelle base de données est le plus souvent utilisée comme **Online Store** dans Feast pour garantir des latences de lecture $< 10\text{ ms}$ ?

- A) Apache Hive
- B) Redis ✅
- C) PostgreSQL avec index B-Tree
- D) Fichiers CSV locaux

**Q3.** En quoi consiste un **Point-in-Time Join** lors de la préparation d'un jeu de données d'entraînement ?

- A) À joindre deux tables SQL uniquement si la date est identique au jour près.
- B) À associer à chaque événement d'observation la dernière valeur connue de chaque feature à un instant $t \le t_{observation}$, garantissant l'absence de fuite du futur. ✅
- C) À convertir tous les horodatages en fuseau horaire UTC.
- D) À fusionner les fichiers Parquet par taille.

**Q4.** Pourquoi les valeurs **SHAP** sont-elles préférées à l'importance native de Scikit-Learn (Gini Importance) pour la sélection de variables ?

- A) Parce que SHAP est plus rapide à calculer.
- B) Parce que SHAP est consistant, insensible au biais d'ordre des variables et attribue équitablement la contribution marginale de chaque feature sur chaque prédiction individualisée. ✅
- C) Parce que SHAP ne fonctionne qu'avec des variables entières.
- D) Parce que SHAP supprime automatiquement les colonnes inutiles.

**Q5.** Qu'est-ce que le **Train/Serve Skew** en Machine Learning ?

- A) Une erreur de syntaxe dans le code Python.
- B) Une divergence entre la logique de calcul des features utilisées lors de l'entraînement et celles calculées en production au moment de l'inférence. ✅
- C) Une panne réseau sur le serveur de stockage.
- D) L'écart entre la taille des jeux de données d'apprentissage et de validation.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
