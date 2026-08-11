# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 488 (6h) : Prédiction de Séries Temporelles avec le Deep Learning : PatchTST, Temporal Fusion Transformer (TFT) & Foundation Models (Chronos)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Dépasser les modèles statistiques classiques (ARIMA/Prophet) grâce aux architectures Deep Learning pour séries temporelles
> - Maîtriser le fonctionnement des **Transformers pour séries temporelles** : **PatchTST** (Patching + Channel Independence)
> - Analyser l'architecture **Temporal Fusion Transformer (TFT)** pour la prédiction multi-horizon avec variables exogènes
> - Déployer les modèles de fondation temporels **Chronos (Amazon)** et **TimesFM (Google)** pour le Zero-Shot Forecasting
>
> **Compétences visées :** `DATA-01` (A), `AI-01` (A) — Time Series Deep Learning & Foundation Forecasting Models

---

## Module 1 — Du Modèle Statistique aux Time Series Transformers (2h)

### 📖 Intuition & Narration

La prédiction de séries temporelles (charge serveur, trafic réseau, consommation d'énergie) a longtemps été dominée par des modèles statistiques linéaires comme ARIMA ou Prophet. Mais ces méthodes peinent face à trois réalités modernes : les **dépendances complexes non-linéaires à long terme**, les **interactions multi-variées** (des dizaines de métriques interconnectées) et les **variables exogènes** (calendrier, météo, promotions).

Les **Time Series Transformers** adaptent le mécanisme de Self-Attention aux données temporelles. L'innovation majeure de **PatchTST (Nie et al. 2023)** réside dans le **Patching** : au lieu de traiter chaque timestep individuellement (ce qui crée des séquences trop longues et bruyantes), on découpe la série en petits sous-segments consécutifs (patches) qui deviennent les tokens consommés par le Transformer.

### 🔍 Anatomie Technique — Architecture PatchTST

```
ARCHITECTURE PATCHTST (Patching + Channel Independence)

  Série Temporelle d'Entrée X (ex: Charge CPU sur 96h)
                      │
                      ▼
  ┌────────────────────────────────────────────────────────┐
  │ 1. PATCHING (Découpage en sous-segments de taille P)   │
  │    [ t1 ... t16 ]  [ t9 ... t24 ]  [ t17 ... t32 ] ... │
  └───────────────────┬────────────────────────────────────┘
                      │  Linear Projection + Positional Encoding
                      ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. TRANSFORMER ENCODER                                 │
  │    Self-Attention sur la séquence de patches.          │
  └───────────────────┬────────────────────────────────────┘
                      │
                      ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. HEAD DE PRÉDICTION (Linear Projection)              │
  │    Génère la prédiction future sur H timesteps (ex: 24h).│
  └────────────────────────────────────────────────────────┘

PRINCIPE DE CHANNEL INDEPENDENCE :
  Chaque variable (canal) d'une série multivariée est traitée indépendamment par le même backbone,
  ce qui prévient le sur-apprentissage et améliore la généralisation.
```

---

## Module 2 — Atelier Pratique : Zero-Shot Forecasting avec Amazon Chronos (2h)

### 🛠️ Code Python : Prédiction de Charge Réseau avec le Modèle Foundation Chronos

```python
#!/usr/bin/env python3
"""
PARADIS — Prédiction de Séries Temporelles Zero-Shot avec Amazon Chronos (T5-based Time Series LLM)
"""

import torch
import numpy as np

def run_chronos_forecast_demo():
    print("[*] --- DÉMONSTRATION ZERO-SHOT FORECASTING AMAZON CHRONOS PARADIS IT ---")

    # 1. Données synthétiques d'historique de trafic réseau (96 heures)
    np.random.seed(42)
    t = np.linspace(0, 4 * np.pi, 96)
    history_traffic = 500.0 + 200.0 * np.sin(t) + np.random.normal(0, 30.0, 96)
    context_tensor = torch.tensor(history_traffic, dtype=torch.float32)

    print(f"[*] Historique de charge capturé : 96 timesteps (Min: {history_traffic.min():.1f}, Max: {history_traffic.max():.1f})")

    # 2. Utilisation de Chronos Pipeline
    try:
        from chronos import ChronosPipeline

        model_name = "amazon/chronos-bolt-small"
        print(f"[*] Chargement du modèle de fondation temporel {model_name}...")

        pipeline = ChronosPipeline.from_pretrained(
            model_name,
            device_map="auto",
            torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
        )

        # Prédiction des 24 prochains timesteps (Horizons futurs)
        prediction_length = 24
        forecast = pipeline.predict(
            context=context_tensor,
            prediction_length=prediction_length,
            num_samples=100  # 100 échantillons pour l'intervalle de confiance quantilique
        )

        # Calcul de la médiane et des quantiles (80% d'intervalle de confiance)
        low, median, high = np.quantile(forecast[0].numpy(), [0.1, 0.5, 0.9], axis=0)

        print("\n--- PRÉDICTIONS DE CHARGE RÉSEAU (Zero-Shot 24h Futures) ---")
        for h in range(0, prediction_length, 6):
            print(f"  • H+{h+1:02d}h : Médiane = {median[h]:6.1f} Mbps | IC 80% = [{low[h]:6.1f} - {high[h]:6.1f}] Mbps")

    except ImportError:
        print("[!] Bibliothèque 'chronos' non installée (pip install chronos-forecasting). Mode démo actif.")
        print("\n--- SIMULATION ZERO-SHOT CHRONOS (24h Futures) ---")
        print("  • H+06h : Médiane =  512.4 Mbps | IC 80% = [ 465.1 -  558.2] Mbps")
        print("  • H+12h : Médiane =  308.1 Mbps | IC 80% = [ 260.0 -  351.4] Mbps")
        print("  • H+18h : Médiane =  495.6 Mbps | IC 80% = [ 440.2 -  542.1] Mbps")
        print("  • H+24h : Médiane =  688.2 Mbps | IC 80% = [ 632.0 -  740.5] Mbps")

if __name__ == "__main__":
    run_chronos_forecast_demo()
```

---

## Module 3 — Temporal Fusion Transformer (TFT) & Variables Exogènes (1h30)

### 🔍 Architecture Temporal Fusion Transformer (TFT)

```
ARCHITECTURE TEMPORAL FUSION TRANSFORMER (Lim et al. 2021)

  [ Inputs Passées ]         [ Inputs Connues du Futur ]     [ Variables Statiques ]
  (Charge CPU, Latence)      (Jour de la semaine, Heure)     (Capacité Max Serveur)
           │                             │                              │
           ▼                             ▼                              ▼
  ┌───────────────────────────────────────────────────────────────────────────┐
  │ VARIABLE SELECTION NETWORKS (Gated Residual Networks - GRN)               │
  │ Sélectionne dynamiquement les variables les plus pertinentes à chaque pas.│
  └─────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                                        ▼
  ┌───────────────────────────────────────────────────────────────────────────┐
  │ MULTI-HEAD ATTENTION & TEMPORAL PROCESSING                                │
  │ Capture la saisonnalité longue et les événements exceptionnels.          │
  └─────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                                        ▼
  [ Prédiction Quantilique (P10, P50, P90) sur l'horizon de prévision H ]
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PatchTST** | Patch Time Series Transformer — Architecture découpant les séries en patches pour l'attention |
| **TFT** | Temporal Fusion Transformer — Modèle multi-horizon combinant attention et sélecteurs de variables |
| **Chronos** | Modèle de fondation temporel développé par Amazon basé sur la tokenisation des valeurs |
| **MASE** | Mean Absolute Scaled Error — Métrique d’évaluation des séries temporelles indépendante de l'échelle |
| **WAPE** | Weighted Absolute Percentage Error — Pourcentage d'erreur pondéré sur l'ensemble de la série |

---

## Exercices Pratiques

### Exercice 1 — Calcul d'Erreur MAE et RMSE de Prédiction

Une équipe MLOps évalue un modèle Deep Learning de prédiction de trafic sur 5 timesteps futurs ($H=5$).
- Valeurs Réelles (Ground Truth $y$) : $[100, 120, 150, 130, 110]$.
- Prédictions du Modèle ($\hat{y}$) : $[105, 115, 160, 125, 115]$.
1. Calculez les erreurs absolues $|y_i - \hat{y}_i|$ et l'erreur moyenne absolue (**MAE**).
2. Calculez l'erreur quadratique moyenne (**MSE**) et la racine de l'erreur quadratique moyenne (**RMSE**).

**Corrigé guidé :**
1. **Erreurs absolues et MAE** :
   - Écarts : $|100-105|=5, |120-115|=5, |150-160|=10, |130-125|=5, |110-115|=5$.
   - $\text{MAE} = (5 + 5 + 10 + 5 + 5) / 5 = 30 / 5 = 6.0$.
2. **MSE et RMSE** :
   - Carrés des écarts : $5^2=25, 5^2=25, 10^2=100, 5^2=25, 5^2=25$.
   - $\text{MSE} = (25 + 25 + 100 + 25 + 25) / 5 = 200 / 5 = 40.0$.
   - $\text{RMSE} = \sqrt{40.0} \approx 6.32$.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est l'innovation majeure de l'architecture **PatchTST** par rapport à un Transformer standard appliqué aux séries temporelles ?

- A) Elle utilise des cartes graphiques TPU uniquement.
- B) Elle découpe la série temporelle en sous-segments (patches) consécutifs traités comme des tokens, réduisant la complexité mémoire et capturant l'information locale. ✅
- C) Elle supprime les fonctions d'activation.
- D) Elle ne fonctionne qu'avec des nombres entiers.

**Q2.** Comment le modèle de fondation **Amazon Chronos** parvient-il à réutiliser des architectures de modèles de langage (ex: T5) pour des séries temporelles ?

- A) En traduisant les chiffres en anglais.
- B) En quantisant et tokenisant les valeurs numériques de la série temporelle en un vocabulaire de tokens discrets consommable par l'architecture Transformer. ✅
- C) En utilisant un microphone.
- D) En convertissant les graphiques en images JPEG.

**Q3.** Quel est l'avantage principal du **Temporal Fusion Transformer (TFT)** par rapport aux modèles récurrents classiques ?

- A) Il ne nécessite aucune donnée d'entraînement.
- B) Il intègre nativement des réseaux de sélection de variables (Variable Selection Networks) et fournit des intervalles de confiance quantiliques (P10, P50, P90) avec prise en compte des variables exogènes futures connues. ✅
- C) Il annule les coûts Cloud.
- D) Il est écrit en HTML.

**Q4.** Que signifie la propriété de **Channel Independence** dans l'entraînement de modèles de séries temporelles multivariées ?

- A) Que le réseau Wi-Fi est déconnecté.
- B) Que chaque variate (canal) d'une série multivariée est injecté de manière indépendante dans le même backbone modèle, ce qui prévient le sur-apprentissage et améliore la généralisation. ✅
- C) Que la télévision ne fonctionne plus.
- D) Que les données sont supprimées après 24h.

**Q5.** Quelle métrique d'évaluation est particulièrement recommandée pour comparer des modèles de prédiction de séries temporelles ayant des échelles de valeurs très différentes ?

- A) Accuracy
- B) MASE (Mean Absolute Scaled Error) ✅
- C) F1-Score
- D) ROC-AUC

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
