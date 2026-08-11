# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 458 (6h) : MLflow & Experiment Tracking : Traçabilité, Registre de Modèles, Versioning d'Artefacts & Intégration CI/CD MLOps

> [!NOTE]
> **Objectifs pédagogiques :**
> - Structurer la traçabilité complète des expériences ML avec **MLflow Tracking** (params, metrics, tags, artifacts)
> - Gérer le cycle de vie des modèles via le **MLflow Model Registry** (Staging, Production, Archived, Alias)
> - Versionner le code, les hyperparamètres et les artefacts pour garantir une **reproductibilité à 100%**
> - Automatiser le packaging de modèles sous format standardisé **MLflow Model Specification** (pyfunc)
>
> **Compétences visées :** `AI-03` (A) — MLOps & Experiment Tracking

---

## Module 1 — Architecture de Traçabilité MLflow (2h)

### 📖 Intuition & Narration

En ingénierie logicielle classique, Git suffit pour versionner le code. En Machine Learning, un modèle dépend de trois piliers mouvants : **le code**, **les données**, et **les hyperparamètres**. Sans traçabilité rigoureuse, retrouver quel entraînement a généré le fichier de poids `model_final_v2_best.pkl` en production relève de l'impossible.

**MLflow** apporte la rigueur logicielle au Machine Learning à travers quatre composants modulaires :
1. **MLflow Tracking** : Enregistrement automatique et manuel des entrées/sorties d'expériences.
2. **MLflow Models** : Format de packaging unifié pour déployer sur n'importe quel runtime (Docker, KServe, REST API).
3. **MLflow Model Registry** : Magasin centralisé de modèles versionnés avec gouvernance et transitions d'état.
4. **MLflow Recipes** : Pipelines réutilisables d'entraînement et d'évaluation.

### 🔍 Anatomie Technique — Architecture MLflow Tracking

```
ARCHITECTURE TECHNIQUE MLFLOW

  ┌────────────────────────────────────────────────────────┐
  │                    ENTRAÎNEMENT ML                     │
  │   (Python Script, Jupyter Notebook, Pipeline CI/CD)    │
  └──────────────────────────┬─────────────────────────────┘
                             │  mlflow.log_params() / log_metrics()
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │                 SERVEUR MLFLOW TRACKING                │
  │                  (http://mlflow:5000)                  │
  └──────────────┬──────────────────────────┬──────────────┘
                 │                          │
                 ▼                          ▼
  ┌───────────────────────────┐  ┌───────────────────────────┐
  │     BACKEND STORE         │  │     ARTIFACT STORE        │
  │ (PostgreSQL / MySQL / SQ) │  │  (MinIO / AWS S3 / GCS)   │
  │ - Metadonnées des Runs    │  │ - Poids de modèles (.pt)  │
  │ - Paramètres, Métriques   │  │ - Matrice de confusion    │
  │ - Tags, Durées, Statuts   │  │ - Graphiques TensorBoard  │
  └───────────────────────────┘  └───────────────────────────┘
```

---

## Module 2 — Atelier Pratique : Pipeline d'Expérimentation & Model Registry (2h)

### 🛠️ Script d'Entraînement Scikit-Learn / PyTorch avec MLflow Tracking & Registry

```python
#!/usr/bin/env python3
"""
PARADIS — Script MLOps d'Entraînement & Enregistrement Automatique avec MLflow
Classification de sécurité réseau avec traçabilité complète et enregistrement au Registry.
"""

import os
import mlflow
import mlflow.sklearn
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split

def run_mlflow_experiment():
    # 1. Configuration du Serveur MLflow Tracking
    mlflow_uri = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
    mlflow.set_tracking_uri(mlflow_uri)
    mlflow.set_experiment("PARADIS_Network_Intrusion_Detection")

    # 2. Données synthétiques d'intrusion réseau
    np.random.seed(42)
    X = np.random.randn(1000, 20)  # 20 caractéristiques réseau
    y = np.random.choice([0, 1], size=1000, p=[0.85, 0.15])  # 15% d'anomalies

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Hyperparamètres à tester
    params = {
        "n_estimators": 150,
        "max_depth": 10,
        "min_samples_split": 4,
        "random_state": 42
    }

    # 3. Démarrage du Run MLflow Tracking
    with mlflow.start_run(run_name="RandomForest_v1_Baseline") as run:
        run_id = run.info.run_id
        print(f"[*] MLflow Run démarré (ID: {run_id})")

        # Log des paramètres
        mlflow.log_params(params)
        mlflow.log_tag("author", "Adolphe - PARADIS MLOps Team")
        mlflow.log_tag("model_type", "RandomForest")

        # Entraînement
        clf = RandomForestClassifier(**params)
        clf.fit(X_train, y_train)

        # Prédiction & Évaluation
        y_pred = clf.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)

        # Log des métriques
        mlflow.log_metric("accuracy", acc)
        mlflow.log_metric("precision", prec)
        mlflow.log_metric("recall", rec)
        mlflow.log_metric("f1_score", f1)

        print(f"[+] Métriques : Acc={acc:.4f} | F1={f1:.4f} | Prec={prec:.4f}")

        # Enregistrement du modèle dans MLflow Models
        input_example = X_train[:5]
        signature = mlflow.models.infer_signature(X_train, clf.predict(X_train))

        model_info = mlflow.sklearn.log_model(
            sk_model=clf,
            artifact_path="model",
            signature=signature,
            input_example=input_example,
            registered_model_name="PARADIS_NIDS_Model"  # Enregistrement direct au Model Registry
        )

        print(f"[+] Modèle enregistré dans l'Artifact Store : {model_info.model_uri}")

    # 4. Attribution de l'alias 'challenger' dans le Model Registry via le client MLflow
    client = mlflow.tracking.MlflowClient()
    model_version = client.get_latest_versions("PARADIS_NIDS_Model")[0].version
    client.set_registered_model_alias(
        name="PARADIS_NIDS_Model",
        alias="challenger",
        version=model_version
    )
    print(f"[+] Version {model_version} du modèle définie avec l'alias '@challenger'")

if __name__ == "__main__":
    run_mlflow_experiment()
```

---

## Module 3 — Integration CI/CD MLOps & Promotion Automatique (1h30)

### 🔍 Pipeline GitHub Actions pour la Promotion d'un Modèle MLflow

```yaml
# .github/workflows/mlops-model-promotion.yml
name: MLOps Model Quality Gate & Promotion

on:
  push:
    branches: [main]

jobs:
  evaluate-and-promote:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/python-selection@v5
        with:
          python-version: "3.11"

      - name: Install Dependencies
        run: |
          pip install mlflow scikit-learn requests

      - name: Compare Challenger vs Champion in MLflow Registry
        env:
          MLFLOW_TRACKING_URI: ${{ secrets.MLFLOW_TRACKING_URI }}
        run: |
          python -c "
          import mlflow
          from mlflow.tracking import MlflowClient

          client = MlflowClient()
          model_name = 'PARADIS_NIDS_Model'

          try:
              champion = client.get_model_version_by_alias(model_name, 'champion')
              champ_f1 = float(client.get_run(champion.run_id).data.metrics['f1_score'])
          except Exception:
              champ_f1 = 0.0  # Pas encore de champion

          challenger = client.get_model_version_by_alias(model_name, 'challenger')
          challenger_f1 = float(client.get_run(challenger.run_id).data.metrics['f1_score'])

          print(f'Champion F1: {champ_f1:.4f} | Challenger F1: {challenger_f1:.4f}')

          if challenger_f1 > champ_f1 + 0.01:
              print('[+] Le Challenger surpasse le Champion ! Promotion au grade @champion...')
              client.set_registered_model_alias(model_name, 'champion', challenger.version)
          else:
              print('[!] Le Challenger ne dépasse pas le seuil d improvement. Pas de promotion.')
          "
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MLflow** | Plateforme open-source de gestion du cycle de vie du Machine Learning |
| **Run** | Exécution unique d'un code ML enregistrant ses paramètres, métriques et artefacts |
| **Artifact Store** | Emplacement de stockage des fichiers lourds d'une expérience (S3, GCS, MinIO) |
| **Backend Store** | Base de données relationnelle stockant la métadonnée des runs MLflow |
| **Model Registry** | Registre centralisé de versioning et de gouvernance des modèles ML prêts au déploiement |

---

## Exercices Pratiques

### Exercice 1 — Architecture de Stockage MLflow

Une entreprise déploie MLflow sur Kubernetes. Elle anticipe 10 000 runs par mois, générant chacun 50 Mo d'artefacts (poids de modèles et graphiques).
1. Proposez une architecture de stockage séparée (Backend Store vs Artifact Store) conforme aux meilleures pratiques de production.
2. Calculez le volume de stockage consommé par l'Artifact Store au bout d'un an.

**Corrigé guidé :**
1. **Architecture recommandée** :
   - **Backend Store** : Une instance managée PostgreSQL (AWS RDS / Cloud SQL) pour garantir l'ACID, les transactions rapides et la sécurité des métadonnées (paramètres, métriques).
   - **Artifact Store** : Un bucket de stockage d'objets compatible S3 / MinIO / GCS pour la scalabilité horizontale illimitée et le moindre coût de stockage.
2. **Calcul de stockage** :
   - Volume mensuel : $10\,000 \text{ runs} \times 50 \text{ MB} = 500\,000 \text{ MB} = 500 \text{ GB / mois}$.
   - Volume annuel : $500 \text{ GB/mois} \times 12 \text{ mois} = 6\,000 \text{ GB} = 6 \text{ TB / an}$.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la différence fondamentale entre le **Backend Store** et l'**Artifact Store** dans MLflow ?

- A) Le Backend Store stocke les images Docker, l'Artifact Store stocke les logs texte.
- B) Le Backend Store (SQL) conserve les métadonnées légères (params, métriques, tags), tandis que l'Artifact Store (S3/MinIO) conserve les fichiers lourds (poids de modèles, graphiques). ✅
- C) L'Artifact Store n'est utilisé qu'en environnement Windows.
- D) Il n'y a aucune différence, ce sont deux termes synonymes.

**Q2.** Dans MLflow Model Registry, à quoi sert l'utilisation des **Aliases** (ex: `@champion`, `@challenger`) par rapport aux numéros de version fixes ?

- A) À accélérer le temps de calcul des GPUs.
- B) À permettre aux applications clientes de pointer vers une étiquette dynamique sans changer le code de l'API lors d'une mise à jour de modèle. ✅
- C) À masquer le nom de l'auteur du modèle.
- D) À compresser les fichiers au format ZIP.

**Q3.** La fonction `mlflow.models.infer_signature(X_train, y_pred)` permet de :

- A) Signer électroniquement le modèle avec une clé PGP.
- B) Capturer le schéma de données des entrées et des sorties (types de colonnes, formes) pour valider automatiquement la conformité des requêtes lors de l'inférence. ✅
- C) Calculer la matrice de confusion.
- D) Chiffrer la base de données.

**Q4.** Que se passe-t-il si deux runs enregistrent des métriques portant le même nom à des étapes (steps) différentes ?

- A) MLflow lève une exception et arrête le script.
- B) MLflow écrase la valeur précédente.
- C) MLflow enregistre une série temporelle (time series) permettant de tracer l'évolution de la métrique au cours des époques dans l'interface UI. ✅
- D) MLflow supprime le run.

**Q5.** Dans un pipeline CI/CD MLOps, quelle condition doit être vérifiée avant de promouvoir une nouvelle version de modèle au statut `@champion` ?

- A) Le modèle doit avoir été entraîné un vendredi.
- B) La version Challenger doit surpasser la version Champion actuelle sur un jeu de test de validation indépendant selon une métrique métier clé (ex: F1-score). ✅
- C) Le fichier de modèle doit faire moins de 1 Mo.
- D) L'entraînement doit être effectué en moins de 10 secondes.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
