# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 462 (6h) : Kubeflow Pipelines (KFP), Katib & KServe : Orchestration MLOps Cloud-Native sur Kubernetes, Tuning AutoML & GPU Scheduling

> [!NOTE]
> **Objectifs pédagogiques :**
> - Déployer et orchestrer des workflows de Machine Learning conteneurisés avec **Kubeflow Pipelines (KFP v2)**
> - Exécuter la recherche automatisée d'hyperparamètres (AutoML) à grande échelle avec **Katib**
> - Déployer des modèles ML serverless scalables avec **KServe** (autoscaling to zero, GPU sharing)
> - Gérer le **scheduling d'accélérateurs GPU NVIDIA** dans Kubernetes (MIG — Multi-Instance GPU, tolerations, node selectors)
>
> **Compétences visées :** `AI-03` (A) — MLOps Pipelines & Cloud Native Infrastructure

---

## Module 1 — Architecture Kubeflow & Kubernetes pour le ML (2h)

### 📖 Intuition & Narration

Exécuter des workflows ML sur un serveur unique ou une VM isolée est limité par les ressources de cette machine. **Kubeflow** transforme un cluster **Kubernetes** en une plateforme de Supercomputing MLOps réutilisable par des centaines de Data Scientists.

 Kubeflow n'est pas un monolithe, mais une suite d'opérateurs natifs Kubernetes (CRDs) :
1. **Kubeflow Pipelines (KFP)** : Orchestration de workflows DAG (Directed Acyclic Graphs) d'ingestion, d'entraînement et d'évaluation.
2. **Katib** : Moteur d'optimisation d'hyperparamètres (HPO) et de Neural Architecture Search (NAS).
3. **KServe** : Plan de contrôle de serving d'inférence (autoscaling basé sur KNative/Istio).
4. **Training Operators** : Opérateurs spécialisés pour l'entraînement distribué (PyTorchJob, TFJob, MPIJob).

### 🔍 Anatomie Technique — Architecture Kubernetes GPU & Multi-Instance GPU (MIG)

```
SCHÉMA D'ALLOCATION GPU DANS KUBERNETES

  ┌────────────────────────────────────────────────────────┐
  │         KUBERNETES CONTROL PLANE (kube-apiserver)      │
  └──────────────────────────┬─────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │        NODE WORKER GPU (Ex: NVIDIA A100 80GB)          │
  │  NVIDIA Container Toolkit + Device Plugin              │
  │                                                        │
  │  [ MIG Profile 1 ]     [ MIG Profile 2 ]  ... [ MIG 7 ]│
  │   1g.10gb (10GB VRAM)   2g.20gb (20GB VRAM)           │
  └──────┬──────────────────────┬──────────────────────────┘
         │                      │
         ▼                      ▼
  ┌──────────────┐       ┌──────────────┐
  │ Pod KServe   │       │ Pod Katib    │
  │ (Inférence)  │       │ (Trial HPO)  │
  │ nvidia.com/  │       │ nvidia.com/  │
  │ gpu: 1       │       │ gpu: 1       │
  └──────────────┘       └──────────────┘
```

---

## Module 2 — Atelier Pratique : Pipeline Kubeflow (KFP v2) (2h)

### 🛠️ Définition d'un Pipeline KFP v2 en Python

```python
#!/usr/bin/env python3
"""
PARADIS — Pipeline MLOps complet avec Kubeflow Pipelines SDK (kfp v2)
Ingestion -> Entraînement -> Évaluation -> Condition de Déploiement KServe
"""

from kfp import dsl
from kfp import compiler
from kfp.dsl import Input, Output, Dataset, Model, Metrics, ComponentSpec

# 1. Composant 1 : Preparation des données
@dsl.component(
    base_image="python:3.11-slim",
    packages_to_install=["pandas", "scikit-learn"]
)
def prep_data_op(
    output_dataset: Output[Dataset]
):
    import pandas as pd
    import numpy as np

    print("[*] Composant 1: Ingestion et découpage des données...")
    np.random.seed(42)
    df = pd.DataFrame({
        "feature1": np.random.randn(1000),
        "feature2": np.random.randn(1000),
        "target": np.random.choice([0, 1], size=1000)
    })

    df.to_csv(output_dataset.path, index=False)
    print(f"[+] Dataset sauvegardé dans : {output_dataset.path}")

# 2. Composant 2 : Entraînement du modèle
@dsl.component(
    base_image="python:3.11-slim",
    packages_to_install=["pandas", "scikit-learn", "joblib"]
)
def train_model_op(
    input_dataset: Input[Dataset],
    output_model: Output[Model],
    max_depth: int = 5
):
    import pandas as pd
    import joblib
    from sklearn.ensemble import RandomForestClassifier

    print(f"[*] Composant 2: Entraînement du modèle (max_depth={max_depth})...")
    df = pd.read_csv(input_dataset.path)
    X = df[["feature1", "feature2"]]
    y = df["target"]

    clf = RandomForestClassifier(max_depth=max_depth, random_state=42)
    clf.fit(X, y)

    joblib.dump(clf, output_model.path + ".joblib")
    print(f"[+] Modèle sauvegardé dans : {output_model.path}")

# 3. Composant 3 : Évaluation des métriques
@dsl.component(
    base_image="python:3.11-slim",
    packages_to_install=["pandas", "scikit-learn", "joblib"]
)
def evaluate_model_op(
    input_dataset: Input[Dataset],
    input_model: Input[Model],
    metrics: Output[Metrics]
):
    import pandas as pd
    import joblib
    from sklearn.metrics import accuracy_score, f1_score

    print("[*] Composant 3: Évaluation...")
    df = pd.read_csv(input_dataset.path)
    X = df[["feature1", "feature2"]]
    y = df["target"]

    clf = joblib.load(input_model.path + ".joblib")
    preds = clf.predict(X)

    acc = float(accuracy_score(y, preds))
    f1 = float(f1_score(y, preds))

    metrics.log_metric("accuracy", acc)
    metrics.log_metric("f1_score", f1)
    print(f"[+] Métriques calculées : Accuracy={acc:.4f}, F1={f1:.4f}")

# 4. Assemblage du Pipeline DAG
@dsl.pipeline(
    name="paradis-nids-pipeline",
    description="Pipeline d'entraînement et d'évaluation automatisé PARADIS MLOps"
)
def paradis_mlops_pipeline(max_depth: int = 5):
    prep_task = prep_data_op()

    train_task = train_model_op(
        input_dataset=prep_task.outputs["output_dataset"],
        max_depth=max_depth
    )

    eval_task = evaluate_model_op(
        input_dataset=prep_task.outputs["output_dataset"],
        input_model=train_task.outputs["output_model"]
    )

# 5. Compilation du Pipeline en YAML pour Kubeflow
if __name__ == "__main__":
    compiler.Compiler().compile(
        pipeline_func=paradis_mlops_pipeline,
        package_path="paradis_pipeline.yaml"
    )
    print("[+] Pipeline Kubeflow compilé avec succès : paradis_pipeline.yaml")
```

---

## Module 3 — Manifestes KServe & Katib (1h30)

### 🔍 Manifeste KServe InferenceService & Manifeste Katib HPO

```yaml
# 1. Manifeste KServe InferenceService pour Serving Serverless
apiVersion: "serving.kserve.io/v1beta1"
kind: "InferenceService"
metadata:
  name: "paradis-classifier"
  namespace: "kubeflow-user-example-com"
spec:
  predictor:
    model:
      modelFormat:
        name: sklearn
      storageUri: "s3://paradis-models/nids_model.joblib"
      resources:
        limits:
          cpu: "2"
          memory: 4Gi
          nvidia.com/gpu: "1"
        requests:
          cpu: "500m"
          memory: 1Gi
---
# 2. Manifeste Katib Experiment pour Recherche Automatique d'Hyperparamètres (AutoML)
apiVersion: kubeflow.org/v1beta1
kind: Experiment
metadata:
  namespace: kubeflow-user-example-com
  name: paradis-katib-hpo
spec:
  objective:
    type: maximize
    goal: 0.95
    objectiveMetricName: accuracy
  algorithm:
    algorithmName: bayesianoptimization # Recherche Bayésienne
  parallelTrialCount: 3
  maxTrialCount: 12
  parameters:
    - name: lr
      parameterType: double
      feasibleSpace:
        min: "0.0001"
        max: "0.01"
    - name: max_depth
      parameterType: int
      feasibleSpace:
        min: "3"
        max: "15"
  trialTemplate:
    primaryContainerName: main
    trialSpec:
      apiVersion: batch/v1
      kind: Job
      spec:
        template:
          spec:
            containers:
              - name: main
                image: ghcr.io/paradis/katib-trial-image:latest
                command:
                  - "python3"
                  - "/opt/train.py"
                  - "--lr=${trialParameters.lr}"
                  - "--max_depth=${trialParameters.max_depth}"
            restartPolicy: Never
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **KFP** | Kubeflow Pipelines — Moteur de workflow Kubernetes pour les pipelines ML |
| **KServe** | Standard d'inférence serverless cloud-native sur Kubernetes (anciennement KFServing) |
| **Katib** | Composant AutoML de Kubeflow pour l'hyperparameter tuning et la recherche d'architectures |
| **MIG** | Multi-Instance GPU — Technologie NVIDIA permettant de partitionner un GPU A100/H100 en instances isolées |
| **DAG** | Directed Acyclic Graph — Graphe orienté acyclique représentant les étapes d'un pipeline |

---

## Exercices Pratiques

### Exercice 1 — Scheduling GPU et Tolérations Kubernetes

Un pod d'entraînement deep learning Kubeflow demande 2 GPUs NVIDIA. Les nœuds GPU du cluster possèdent le label `hardware=nvidia-a100` et la teinte (taint) `nvidia.com/gpu=present:NoSchedule`.
Écrivez l'extrait de spec YAML de conteneur et de Pod Kubernetes permettant de :
1. Demander 2 GPUs via `resources.limits`.
2. Cibler les nœuds A100 via `nodeSelector`.
3. Tolérer la teinte GPU via `tolerations`.

**Corrigé guidé :**
```yaml
spec:
  nodeSelector:
    hardware: nvidia-a100
  tolerations:
    - key: "nvidia.com/gpu"
      operator: "Exists"
      effect: "NoSchedule"
  containers:
    - name: trainer
      image: ghcr.io/paradis/deep-learning-trainer:v1
      resources:
        limits:
          nvidia.com/gpu: "2"
        requests:
          nvidia.com/gpu: "2"
```

---

## Banque QCM — 5 Questions

**Q1.** Quel composant de la suite Kubeflow est spécifiquement responsable de l'optimisation automatique des hyperparamètres (HPO) ?

- A) KServe
- B) Katib ✅
- C) Kubeflow Pipelines (KFP)
- D) Argo Workflows

**Q2.** Dans Kubeflow Pipelines v2 (KFP), sous quel format le fichier de pipeline compilé en Python est-il généré pour être soumis au cluster ?

- A) Un exécutable binaire ELF
- B) Un fichier manifest déclaratif YAML ✅
- C) Une image ISO
- D) Un fichier ZIP de scripts Bash

**Q3.** Quelle est l'utilité de la fonctionnalité **Autoscaling to Zero** proposée par KServe pour le model serving ?

- A) Réduire la latence réseau à 0 ms.
- B) Supprimer complètement les instances de Pods d'inférence lorsqu'aucun trafic n'est reçu pendant une période donnée, libérant ainsi les ressources CPU/GPU. ✅
- C) Effacer les logs de l'application.
- D) Bloquer les requêtes non authentifiées.

**Q4.** Que permet la technologie **NVIDIA Multi-Instance GPU (MIG)** sur les accélérateurs A100/H100 dans un cluster Kubernetes ?

- A) De faire tourner Windows sur un serveur Linux.
- B) De découper physiquement un GPU en plusieurs instances indépendantes équipées de mémoire et de cœurs réservés, permettant d'affecter des fractions de GPU isolées à plusieurs Pods distincts. ✅
- C) D'augmenter la fréquence du processeur central CPU.
- D) De remplacer le stockage SSD par de la mémoire VRAM.

**Q5.** Dans un composant KFP `@dsl.component`, quelle est la fonction des annotations de types `Input[Dataset]` et `Output[Model]` ?

- A) Définir la couleur des nœuds dans l'interface graphique.
- B) Spécifier le transfert automatique d'artefacts (fichiers/dossiers) géré par Kubeflow entre les conteneurs du pipeline via le stockage d'objets (MinIO/S3). ✅
- C) Permettre au code de s'exécuter sans Python.
- D) Chiffrer les données de test.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
