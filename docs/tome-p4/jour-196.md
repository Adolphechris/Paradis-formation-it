# TOME P4 — Cloud, DevOps & SecOps — Jour 196 (6h) : IA & Machine Learning Ops (MLOps, MLflow, Feature Store, Déploiement de Modèles de Détection de Fraude & Model Monitoring)

> [!NOTE]
> **Objectif du jour :** Maîtriser le cycle de vie du Machine Learning en production (**MLOps**) : suivi des expériences avec **MLflow**, gestion centralisée des caractéristiques avec un **Feature Store** (Feast), déploiement de modèles de détection de fraude bancaire via des APIs REST/gRPC à faible latence, et surveillance continue des performances des modèles (**Model Drift & Concept Drift**).
>
> **Compétences visées :** `BIT-05` (A) — MLOps & Machine Learning Pipelines | `SEC-05` (A) — Modèles d'IA pour la Détection de Fraude

---

## 1) Module — MLOps & Tracking des Expériences avec MLflow (2h)

### 📖 Narration/Intuition

Dans une équipe Data Science bancaire traditionnelle, les chercheurs entraînent des modèles de détection de fraude sur leurs ordinateurs portables, testent des dizaines d'hyperparamètres, puis envoient un fichier `.pkl` par email à l'équipe Ops pour le déploiement. Ce processus est un désastre en matière de gouvernance, de reproductibilité et de sécurité.

Le **MLOps (Machine Learning Operations)** applique les rigueurs du DevOps (CI/CD, versioning, automatisation, observabilité) au cycle de vie des modèles d'IA. **MLflow** est la plateforme open-source standard pour suivre les expériences, empaqueter le code et enregistrer les modèles de manière centralisée.

### 🔍 Anatomie Technique

**Architecture du Cycle de Vie MLOps :**

```
 ┌────────────────────────────────────────────────────────┐
 │           1. PIPELINE DE DONNÉES (Silver Layer)        │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │           2. FEATURE STORE (Feast / Hopsworks)         │
 │  Garantit que les mêmes features sont utilisées        │
 │  pour l'entraînement (Offline) et l'inférence (Online) │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │           3. TRAIN & TRACKING (MLflow Tracking)        │
 │  - Log des métriques (AUC, Precision, Recall)          │
 │  - Log des hyperparamètres & code Git                  │
 │  - Enregistrement de l'artefact dans MLflow Model Reg. │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │           4. DEPLOYMENT (Triton / Seldon Core / K8s)   │
 │  - Déploiement sous forme de microservice REST/gRPC    │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │           5. MONITORING (Evidently AI / Prometheus)    │
 │  - Détection du Data Drift / Concept Drift en Prod     │
 └────────────────────────────────────────────────────────┘
```

**Code Entraînement & Log MLflow avec Scikit-Learn (`train_fraud_model.py`) :**

```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
import pandas as pd

# Configuration du serveur MLflow Tracking centralisé BCC
mlflow.set_tracking_uri("https://mlflow.internal.bcc.cd")
mlflow.set_experiment("bcc-fraud-detection-v2")

# 1. Chargement du dataset depuis la couche Silver Delta Lake
df = pd.read_parquet("s3a://bcc-datalake/silver/ml_fraud_features.parquet")
X = df.drop(columns=["is_fraud", "transaction_id"])
y = df["is_fraud"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 2. Début du Run MLflow (Traçabilité complète)
with mlflow.start_run():
    n_estimators = 100
    max_depth = 12
    
    # Log des hyperparamètres
    mlflow.log_param("n_estimators", n_estimators)
    mlflow.log_param("max_depth", max_depth)
    mlflow.log_param("algorithm", "RandomForest")

    # Entraînement du modèle
    model = RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth, random_state=42)
    model.fit(X_train, y_train)

    # Prédictions et métriques
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    auc = roc_auc_score(y_test, y_proba)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)

    # Log des métriques
    mlflow.log_metric("auc", auc)
    mlflow.log_metric("precision", precision)
    mlflow.log_metric("recall", recall)

    # Enregistrement du modèle dans le Model Registry centralisé
    mlflow.sklearn.log_model(
        sk_model=model,
        artifact_path="fraud_model",
        registered_model_name="BCC_Fraud_Detection_RF"
    )

    print(f"✅ Modèle enregistré avec succès. AUC: {auc:.4f}, Precision: {precision:.4f}, Recall: {recall:.4f}")
```

---

## 2) Module — Feature Store & Inférence Temps Réel (2h)

### 📖 Narration/Intuition

Un défi majeur du Machine Learning en production est le **Train/Serve Skew** (le décalage entre les données d'entraînement et les données d'inférence). Si la caractéristique "Nombre de transactions de l'utilisateur dans la dernière heure" est calculée différemment lors de l'entraînement hors-ligne (SQL Spark) et lors de la prédiction temps réel (Node.js), les performances du modèle s'effondrent.

Un **Feature Store** (comme **Feast**) sert de registre central de caractéristiques. Il garantit la réutilisation rigoureuse des définitions de caractéristiques pour l'entraînement (**Offline Store** — Parquet/S3) et pour l'inférence temps réel (< 5ms) (**Online Store** — Redis).

### 🔍 Anatomie Technique

**Service d'Inférence Temps Réel de Détection de Fraude (`fraud_service.py`) :**

```python
from fastapi import FastAPI, HTTPException
import mlflow.pyfunc
import redis
import json

app = FastAPI(title="BCC Fraud Detection API", version="2.0")

# Connexion au Feature Store Online (Redis — Latence < 2ms)
redis_client = redis.Redis(host='redis-online-store.bcc-production', port=6379, db=0)

# Chargement du modèle de production depuis MLflow Model Registry
MODEL_NAME = "BCC_Fraud_Detection_RF"
model = mlflow.pyfunc.load_model(f"models:/{MODEL_NAME}/Production")

@app.post("/v1/predict-fraud")
async function predict_fraud(transaction: dict):
    account_id = transaction["account_id"]
    amount = transaction["amount"]

    # 1. Récupération des caractéristiques temps réel depuis le Feature Store Redis
    raw_features = redis_client.get(f"features:{account_id}")
    if not raw_features:
        # Fallback par défaut si nouveau client
        tx_count_last_hour = 0
        avg_amount_last_30d = amount
    else:
        features_dict = json.loads(raw_features)
        tx_count_last_hour = features_dict.get("tx_count_last_hour", 0)
        avg_amount_last_30d = features_dict.get("avg_amount_last_30d", amount)

    # 2. Construction du vecteur de caractéristiques pour le modèle
    input_data = [[
        amount,
        tx_count_last_hour,
        avg_amount_last_30d,
        amount / (avg_amount_last_30d + 1.0) # Ratio de déviation du montant
    ]]

    # 3. Calcul du score de probabilité de fraude
    fraud_probability = float(model.predict(input_data)[0])

    # 4. Décision métier (Seuil de blocage à 0.85)
    is_suspicious = fraud_probability >= 0.85

    return {
        "transaction_id": transaction["transaction_id"],
        "fraud_score": round(fraud_probability, 4),
        "decision": "BLOCK" if is_suspicious else "ALLOW",
        "action_required": "MFA_VERIFICATION" if 0.60 <= fraud_probability < 0.85 else "NONE"
    }
```

---

## 3) Module — Model Drift & Surveillance des Modèles d'IA (2h)

### 📖 Narration/Intuition

Un modèle d'IA n'est pas un logiciel classique : ses performances se dégradent naturellement avec le temps en raison des changements de comportement des utilisateurs ou de l'évolution des techniques de fraude. On distingue :
- **Data Drift** : La distribution des données d'entrée en production s'éloigne de celle des données d'entraînement (ex: augmentation générale des montants en raison de l'inflation).
- **Concept Drift** : La relation entre les caractéristiques et la variable cible change (ex: de nouvelles techniques de fraude apparaissent).

### 🛠️ Atelier Pratique

**Détection de Data Drift avec Evidently AI (`drift_detector.py`) :**

```python
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset
import pandas as pd

# Données de référence (Dataset d'entraînement)
df_reference = pd.read_parquet("s3a://bcc-datalake/silver/reference_train_dataset.parquet")

# Données actuelles de production (Logs des requêtes des 7 derniers jours)
df_current = pd.read_parquet("s3a://bcc-datalake/silver/production_logs_7d.parquet")

# Génération du rapport de Data Drift
drift_report = Report(metrics=[DataDriftPreset()])
drift_report.run(reference_data=df_reference, current_data=df_current)

# Sauvegarde du rapport HTML pour le dashboard SRE/Data Science
drift_report.save_html("data_drift_report.html")

# Extraction des alertes automatiques
result = drift_report.as_dict()
dataset_drift = result["metrics"][0]["result"]["dataset_drift"]

if dataset_drift:
    print("🚨 ALERTE MLOps : Data Drift significatif détecté ! Déclenchement du re-entraînement automatique (Pipeline Airflow).")
    # Invoquer le DAG Airflow de ré-entraînement
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MLOps** | Machine Learning Operations — Automatisation du cycle de vie des modèles d'IA |
| **AUC** | Area Under the ROC Curve — Mesure de performance globale d'un classifieur |
| **Data Drift** | Changement dans la distribution statistique des caractéristiques d'entrée |
| **Concept Drift** | Changement dans la relation statistique entre les caractéristiques et la cible |
| **Feature Store** | Composant centralisant la gestion des caractéristiques ML (Offline + Online) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer le rôle d'un **Feature Store** et pourquoi la séparation entre un **Offline Store** et un **Online Store** est indispensable pour un modèle de détection de fraude bancaire.

**Corrigé :** Un **Feature Store** centralise la définition, le calcul et le stockage des caractéristiques (features) de Machine Learning. L'**Offline Store** (basé sur un Data Lake Parquet/S3 ou Snowflake/BigQuery) conserve l'historique massif des caractéristiques sur plusieurs années pour l'entraînement gourmand des modèles en mode Batch. L'**Online Store** (basé sur Redis ou DynamoDB) conserve uniquement les dernières valeurs à jour des caractéristiques et offre une latence de lecture ultra-faible (< 5ms) nécessaire à l'API d'inférence en temps réel lors du traitement d'un virement. Le Feature Store garantit la cohérence absolue des définitions de features entre les deux mondes, éliminant le bug du *Train/Serve Skew*.

**Exercice 2 :** Quelle est la différence entre **Data Drift** et **Concept Drift** et comment l'équipe MLOps doit-elle réagir à chacun de ces phénomènes ?

**Corrigé :** Le **Data Drift** désigne la modification de la distribution statistique des données d'entrée $P(X)$ sans nécessairement changer le comportement de la variable cible (ex: les clients font des virements de montants plus élevés en raison de l'inflation, mais le taux de fraude reste identique). Réponse : Ré-entraîner le modèle sur un jeu de données plus récent pour adapter ses seuils. Le **Concept Drift** désigne le changement de la relation sous-jacente entre les entrées et la cible $P(Y|X)$ (ex: les fraudeurs adoptent une toute nouvelle méthode qui imite parfaitement le comportement des clients légitimes). Réponse : Le simple ré-entraînement sur les anciennes features ne suffit pas ; les Data Scientists doivent concevoir de **nouvelles caractéristiques (Feature Engineering)** pour capturer le nouveau mode opératoire des fraudeurs.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le rôle principal de la plateforme **MLflow** dans un pipeline MLOps ?
- A) Suivre les expériences (log des hyperparamètres et métriques), empaqueter le code et gérer le registre centralisé des versions de modèles
- B) Formater les disques durs des serveurs
- C) Remplacer les frameworks de Deep Learning
- D) Créer les interfaces utilisateurs web

**Réponse : A**

**Q2 :** Pourquoi la latence de l'**Online Store** d'un Feature Store (ex: Redis) doit-elle être inférieure à 5 millisecondes lors du traitement d'une transaction bancaire ?
- A) Car la prédiction de fraude s'insère directement dans le chemin critique de la transaction HTTP du client — toute latence supplémentaire dégrade directement l'expérience utilisateur et risque de provoquer un timeout du paiement
- B) Pour économiser de l'espace disque
- C) Car les modèles de ML ne fonctionnent pas au-delà de 10ms
- D) C'est une obligation légale de la banque centrale

**Réponse : A**

**Q3 :** Comment appelle-t-on le problème d'ingénierie où un modèle de ML se comporte très bien lors des tests d'entraînement mais échoue en production en raison de définitions différentes des caractéristiques entre le code SQL batch et le code API ?
- A) Train/Serve Skew
- B) High Variance
- C) Overfitting
- D) Underfitting

**Réponse : A**

**Q4 :** Qu'est-ce que le **Concept Drift** dans la surveillance d'un modèle d'IA en production ?
- A) La modification avec le temps de la relation statistique entre les caractéristiques d'entrée et la variable cible à prédire
- B) Le vol du modèle par un pirate informatique
- C) La corruption du fichier de poids du modèle
- D) Le ralentissement de l'API d'inférence

**Réponse : A**

**Q5 :** Quel métrique de classification est particulièrement cruciale pour un modèle de détection de fraude afin de s'assurer qu'un maximum de fraudes réelles soient correctement identifiées ?
- A) Le Recall (Rappel / Sensibilité)
- B) L'Accuracy globale (Précision globale)
- C) La taille du fichier binaire
- D) Le temps de compilation

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
