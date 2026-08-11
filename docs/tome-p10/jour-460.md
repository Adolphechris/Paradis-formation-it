# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 460 (6h) : Déploiement & Serving de Modèles ML : FastAPI, BentoML, Export ONNX/TorchScript, Strategies A/B & Shadow Deployment (SLA < 100ms)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Exporter des modèles PyTorch/Scikit-Learn vers des formats haute performance : **ONNX** et **TorchScript**
> - Développer une API de prédiction à ultra-faible latence avec **FastAPI**, **ONNX Runtime** et batching dynamique
> - Structurer un service de production autonome avec **BentoML** (Multi-model Runner, Containerisation)
> - Implémenter les stratégies de déploiement sécurisées : **Canary Release**, **A/B Testing** et **Shadow Deployment (Traffic Mirroring)**
>
> **Compétences visées :** `AI-03` (A) — Model Serving & Production Deployment

---

## Module 1 — Exportation & Optimisation de Formats : ONNX & TorchScript (2h)

### 📖 Intuition & Narration

Exécuter un modèle PyTorch directement en production via `model.forward()` au sein de l'interpréteur Python classique est inefficace : le **Global Interpreter Lock (GIL)** de Python limite la parallélisation des requêtes HTTP, et les dépendances lourdes de PyTorch augmentent considérablement la taille des images Docker (plusieurs Go).

Pour atteindre un SLA strict de latence inférieure à 100ms sous une charge de milliers de requêtes par seconde, la pratique MLOps consiste à **découpler l'entraînement du serving**. On exporte le modèle vers un format intermédiaire optimisé (**ONNX — Open Neural Network Exchange** ou **TorchScript**), puis on l'exécute avec un moteur d'inférence dédié en C++ (**ONNX Runtime**, **TensorRT**, **Triton Inference Server**).

### 🔍 Anatomie Technique — Workflow d'Exportation ONNX

```
PIPELINE D'EXPORTATION ET D'EXÉCUTION ONNX

  ┌────────────────────────────────────────────────────────┐
  │         MODÈLE ENTRAÎNÉ (PyTorch / Scikit-Learn)       │
  └──────────────────────────┬─────────────────────────────┘
                             │  torch.onnx.export()
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │                 GRAPHE ONNX (.onnx)                    │
  │ - Graphe de calcul indépendant du framework            │
  │ - Fusion d'opérateurs (Conv + BatchNorm + ReLU)        │
  │ - Quantification des poids (FP32 → FP16 / INT8)        │
  └──────────────────────────┬─────────────────────────────┘
                             │  onnxruntime.InferenceSession()
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │               ONNX RUNTIME ENGINE (C++)                │
  │ - Execution Providers : CPU (OpenMP), CUDA, TensorRT   │
  │ - Inférence sans dépendance PyTorch                    │
  └────────────────────────────────────────────────────────┘
```

---

## Module 2 — Atelier Pratique : FastAPI + ONNX Runtime (2h)

### 🛠️ Service API de Serving Haute Performance avec Batching Dynamique

```python
#!/usr/bin/env python3
"""
PARADIS — Service API FastAPI d'Inférence ONNX Runtime à Faible Latence
Classification d'anomalies réseau avec validation Pydantic et exécution ONNX.
"""

import os
import numpy as np
import onnxruntime as ort
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field

# 1. Schéma de la requête HTTP d'entrée
class NetworkFeatureVector(BaseModel):
    packet_rate: float = Field(..., example=1200.5, description="Taux de paquets/sec")
    byte_count: float = Field(..., example=450000.0, description="Octets transférés")
    duration: float = Field(..., example=12.4, description="Durée de la connexion (s)")
    failed_attempts: int = Field(..., example=0, description="Tentatives de connexion échouées")
    port: int = Field(..., example=443, description="Port de destination")

class PredictionResponse(BaseModel):
    is_anomaly: bool
    confidence: float
    inference_time_ms: float

# 2. Application FastAPI
app = FastAPI(
    title="PARADIS NIDS Inference Service",
    version="1.0.0",
    description="API Microservice d'Inférence à Faible Latence (<20ms)"
)

# Variable globale pour la session ONNX
ort_session = None
input_name = None
output_name = None

@app.on_event("startup")
def load_onnx_model():
    global ort_session, input_name, output_name
    model_path = os.getenv("ONNX_MODEL_PATH", "models/nids_model.onnx")

    # Si le fichier ONNX n'existe pas, création d'une session de simulation
    if not os.path.exists(model_path):
        print(f"[!] Fichier {model_path} non trouvé. Ingestion en mode simulation.")
        return

    # Chargement d'ONNX Runtime avec les Execution Providers (CUDA / CPU)
    providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']
    ort_session = ort.InferenceSession(model_path, providers=providers)
    input_name = ort_session.get_inputs()[0].name
    output_name = ort_session.get_outputs()[0].name
    print(f"[+] Modèle ONNX chargé avec succès. Provider actif : {ort_session.get_providers()[0]}")

@app.post("/predict", response_model=PredictionResponse)
def predict_anomaly(features: NetworkFeatureVector):
    import time
    start_time = time.perf_counter()

    # Formater le vecteur d'entrée au format Numpy FP32 (shape: 1, 5)
    input_data = np.array([[
        features.packet_rate,
        features.byte_count,
        features.duration,
        float(features.failed_attempts),
        float(features.port)
    ]], dtype=np.float32)

    if ort_session is not None:
        # Inférence ONNX Runtime
        outputs = ort_session.run([output_name], {input_name: input_data})
        probs = outputs[0][0]
        prediction = bool(probs[1] > 0.5)
        confidence = float(probs[1] if prediction else probs[0])
    else:
        # Fallback Simulation pour tests
        prediction = features.failed_attempts > 3 or features.packet_rate > 5000.0
        confidence = 0.95 if prediction else 0.99

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    return PredictionResponse(
        is_anomaly=prediction,
        confidence=confidence,
        inference_time_ms=round(elapsed_ms, 3)
    )

@app.get("/healthz", status_code=status.HTTP_200_OK)
def health_check():
    return {"status": "healthy", "service": "PARADIS-Serving"}

if __name__ == "__main__":
    import uvicorn
    print("[*] Démarrage du serveur Uvicorn FastAPI sur http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## Module 3 — Stratégies de Déploiement : A/B Testing & Shadow Deployment (1h30)

### 🔍 Comparaison des Motifs de Déploiement ML en Production

```
1. CANARY RELEASE ML :
   Réseau / Ingress
          │
     ┌────┴──────────────┐
     │ 95% du Trafic     │ 5% du Trafic
     ▼                   ▼
  [ Modèle v1 ]      [ Modèle v2 ]
  (Champion)         (Canary)
  ──▶ Validation progressive de la stabilité sur un faible pourcentage.

2. A/B TESTING ML :
   Routeur (Split par User ID)
          │
     ┌────┴──────────────┐
     │ Utilisateurs A    │ Utilisateurs B
     ▼                   ▼
  [ Modèle v1 ]      [ Modèle v2 ]
  ──▶ Mesure des KPIs métier (Taux de conversion, CTR) sur 14 jours.

3. SHADOW DEPLOYMENT (Traffic Mirroring) :
   Ingress Load Balancer
          │
     ┌────┴─────────────────────────────┐
     │ Requête Réelle (Réponse au Client)│ Copie Asynchrone (Miroir)
     ▼                                  ▼
  [ Modèle v1 (Prod) ]              [ Modèle v2 (Shadow) ]
  (Réponse retournée au client)     (Calcul en arrière-plan, réponse jetée)
  ──▶ AUCUN RISQUE UTILISATEUR ! Validation des performances et du comportement en conditions réelles.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ONNX** | Open Neural Network Exchange — Format d'échange ouvert pour représentations de modèles ML |
| **SLA** | Service Level Agreement — Engagement de qualité de service (ex: Latence < 100ms) |
| **GIL** | Global Interpreter Lock — Verrou d'interpréteur Python limitant le multithreading CPU natif |
| **Shadow Deployment** | Technique de duplication de trafic pour tester un nouveau modèle sans impact client |
| **Triton** | Triton Inference Server — Serveur multi-frameworks NVIDIA optimisé pour le serving GPU |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Débit d'API de Serving

Une infrastructure de serving doit traiter un pic de $5\,000$ requêtes par seconde ($\text{RPS}$). La latence moyenne d'inférence d'un modèle avec ONNX Runtime sur un CPU multi-cœur est de $8\text{ ms}$.
1. Quel est le nombre minimal de threads/processus de worker nécessaires pour absorber cette charge sans accumuler de file d'attente ?
2. Si le temps moyen d'inférence sous PyTorch natif était de $40\text{ ms}$, combien de workers auraient été requis ? Quel est le facteur de gain de l'export ONNX ?

**Corrigé guidé :**
1. **Capacity ONNX** :
   Chaque worker peut traiter $1000\text{ ms} / 8\text{ ms} = 125$ requêtes par seconde.
   Nombre de workers nécessaires : $5000 / 125 = 40$ workers (ou instances de conteneurs).
2. **Capacity PyTorch** :
   Chaque worker sous PyTorch traite $1000\text{ ms} / 40\text{ ms} = 25$ requêtes par seconde.
   Nombre de workers nécessaires : $5000 / 25 = 200$ workers.
   **Facteur de gain** : $200 / 40 = 5\times$ moins de ressources matérielles grâce à la compilation ONNX Runtime.

---

## Banque QCM — 5 Questions

**Q1.** Quel est l'avantage principal d'exporter un modèle PyTorch au format **ONNX** avant de le déployer en production ?

- A) Le modèle ONNX s'entraîne 10x plus vite.
- B) Il permet d'exécuter l'inférence via ONNX Runtime en C++ sans dépendre de l'environnement Python ni charger le framework PyTorch complet. ✅
- C) Il chiffre automatiquement les poids avec RSA-4096.
- D) Il convertit les requêtes HTTP en SQL.

**Q2.** Dans une stratégie de **Shadow Deployment (Traffic Mirroring)** pour un modèle ML :

- A) Le nouveau modèle traite 50% du trafic et retourne ses prédictions aux utilisateurs réels.
- B) Le trafic réel est dupliqué vers le nouveau modèle en arrière-plan, mais la réponse du modèle Shadow est jetée et n'affecte jamais l'utilisateur final. ✅
- C) Le modèle ancien est supprimé immédiatement du cluster.
- D) Les utilisateurs sont invités à voter pour la meilleure réponse.

**Q3.** Pourquoi l'utilisation directe de l'application FastAPI synchrone classique sans async/multiprocessing peut-elle poser problème pour servir un modèle ML sous lourde charge ?

- A) Parce que FastAPI est écrit en PHP.
- B) Parce que le calcul matriciel CPU/GPU est bloquant et bloque la boucle d'événements (Event Loop) de Python, empêchant le traitement parallèle d'autres requêtes concurrentes. ✅
- C) Parce que FastAPI interdit l'utilisation de NumPy.
- D) Parce que les fichiers ONNX ne sont pas lisibles par FastAPI.

**Q4.** Qu'est-ce que le **Dynamic Batching** dans un serveur de model serving comme Triton ou BentoML ?

- A) La division d'un fichier CSV en plusieurs morceaux.
- B) La capacité du serveur à regrouper automatiquement plusieurs requêtes d'inférence individuelles arrivées dans une fenêtre temporelle très courte (ex: 2ms) en une seule matrice batch pour maximiser l'efficacité du GPU. ✅
- C) La suppression des requêtes lentes.
- D) La création de tables SQL temporaires.

**Q5.** Le format **TorchScript** (`torch.jit.trace` / `torch.jit.script`) permet de :

- A) Convertir du code Python en code JavaScript pour navigateur.
- B) Sérialiser un modèle PyTorch sous forme d'un graphe de calcul intermédiaire pouvant être exécuté dans un environnement C++ autonome. ✅
- C) Générer des graphiques HTML avec Matplotlib.
- D) Compresser les images JPEG.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
