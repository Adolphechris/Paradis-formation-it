# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 495 (6h) : Edge MLOps & Déploiement de Modèles sur Systèmes Embarqués : TensorFlow Lite, ONNX Edge, TinyML & Mises à Jour OTA

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre les contraintes physiques et computationnelles qui différencient le déploiement **Edge** du déploiement **Cloud**
> - Convertir un modèle PyTorch ou TensorFlow vers les formats d'inférence embarquée **ONNX** et **TFLite** avec quantisation INT8
> - Concevoir un pipeline de mise à jour de modèle **Over-The-Air (OTA)** sécurisé pour une flotte d'appareils IoT
> - Appliquer les techniques **TinyML** (MCUNet, MobileNetV3) pour l'inférence sur microcontrôleurs à ressources ultra-contraintes
>
> **Compétences visées :** `AI-03` (A), `INF-02` (A) — Edge MLOps & Systèmes Embarqués Intelligents

---

## Module 1 — Contraintes Edge vs Cloud & Formats d'Inférence Embarquée (2h)

### 📖 Intuition & Narration

Imaginez un détecteur de fumée intelligent. Il doit analyser les sons ambiants en continu et déclencher une alarme si le modèle détecte le motif acoustique caractéristique d'un incendie. Deux options s'offrent à l'architecte :

**Option A — Inférence Cloud :** Le micro enregistre le son, l'envoie via Wi-Fi à un serveur distant qui fait tourner un réseau de neurones et retourne le verdict. **Problème fatal :** Si la maison brûle, le Wi-Fi est peut-être coupé. La latence de 500ms à 2 secondes est inacceptable. Le coût de streaming en continu est prohibitif.

**Option B — Inférence Edge (TinyML) :** Un modèle ultra-compact de 20 Ko tourne directement sur le microcontrôleur de la carte électronique du détecteur. L'inférence dure 15ms, consomme 5mW, fonctionne hors ligne 24h/24. **C'est le seul choix viable.**

L'Edge MLOps est la discipline qui s'assure que les modèles entraînés en Cloud arrivent sur les appareils embarqués dans un format adapté, restent à jour et performants au fil du temps.

### 🔍 Anatomie Technique — Les Contraintes de l'Edge

```
CONTRAINTES PHYSIQUES DE L'INFÉRENCE EDGE vs CLOUD

  ┌──────────────────────────────────────────────────────────────────────────────┐
  │ Paramètre            │ Serveur Cloud (GPU A100)   │ Appareil Edge (Raspberry Pi / MCU) │
  ├──────────────────────────────────────────────────────────────────────────────┤
  │ Mémoire RAM          │ 80 GB HBM2e                 │ 512 MB à 8 GB (RPi) / 256 KB (MCU)  │
  │ Puissance de Calcul  │ 312 TFLOPS (BF16)           │ 8 GFLOPS (RPi4) / 0.03 GFLOPS (MCU) │
  │ Consommation         │ 400 W                       │ 5 W (RPi) / 0.005 W (MCU)            │
  │ Latence Réseau       │ 50–500 ms (Round Trip)      │ 0 ms (inférence locale)              │
  │ Format de Modèle     │ PyTorch .pt / HuggingFace   │ .tflite / .onnx / .tfl              │
  └──────────────────────────────────────────────────────────────────────────────┘

HIÉRARCHIE DE L'EDGE COMPUTING (Du plus puissant au plus contraint) :

  [ Serveur Cloud ] ──► [ Edge Server (GPU RTX) ] ──► [ Edge Device (Raspberry Pi 4) ]
                                                             ──► [ Microcontrôleur MCU (Arduino Nano BLE) ]
```

### 🔍 Pipeline de Conversion de Modèle : PyTorch → ONNX → TFLite

La conversion d'un modèle passe par deux étapes principales :

**Étape 1 — PyTorch vers ONNX :**
Le format **ONNX (Open Neural Network eXchange)** est un standard inter-opérable. N'importe quel modèle PyTorch peut être exporté en ONNX via `torch.onnx.export()` qui trace le graphe computationnel statique du modèle.

**Étape 2 — ONNX ou TensorFlow vers TFLite :**
Le format **TFLite (TensorFlow Lite)** est optimisé pour les processeurs ARM et les microcontrôleurs. Le Convertisseur TFLite applique automatiquement :
- La **quantisation entière INT8** : Les poids FP32 (32 bits) sont arrondis à INT8 (8 bits) → réduction de la taille du modèle par un facteur 4.
- La **fusion d'opérations (Op Fusion)** : Les opérations `Conv2D + BatchNorm + ReLU` sont fusionnées en une seule opération optimisée pour ARM.

```
PIPELINE DE CONVERSION ET OPTIMISATION POUR L'EDGE

  [ Modèle PyTorch (FP32) ] ──── torch.onnx.export() ────► [ Modèle ONNX ]
                                                                   │
                                            ┌──────────────────────┘
                                            │ tf2onnx / ONNX Runtime
                                            ▼
  [ TFLite Converter + Quantisation INT8 ] ────────────────► [ Modèle .tflite (INT8) ]
                                                              Taille : ~4× plus petite
                                                              Vitesse : ~2× plus rapide
```

---

## Module 2 — Atelier Pratique : Conversion ONNX + Quantisation INT8 + OTA Update (2h)

### 🛠️ Code Python Partie 1 : Conversion PyTorch vers ONNX + Quantisation

```python
#!/usr/bin/env python3
"""
PARADIS — Conversion d'un Modèle PyTorch vers ONNX et Quantisation INT8 pour Edge Deployment
Prérequis : pip install torch onnx onnxruntime onnxconverter-common
"""

import io
import numpy as np
import torch
import torch.nn as nn
import onnx
import onnxruntime as ort

# ──────────────────────────────────────────────────
# 1. DÉFINITION D'UN MODÈLE LÉGER DE CLASSIFICATION
# ──────────────────────────────────────────────────
class SoundClassifierEdge(nn.Module):
    """
    Réseau de neurones léger pour la classification de sons sur appareil embarqué.
    Entrée : Spectrogramme Mel de dimensions (1, 40, 32) — 40 filtres Mel, 32 fenêtres temporelles.
    Sortie : Logits pour 5 classes (Normal, Fumée, Alarme, Voix, Moteur).
    """
    def __init__(self, num_classes: int = 5):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 16, kernel_size=3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),             # Sortie : (16, 20, 16)
            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((4, 4))    # Sortie fixe : (32, 4, 4) = 512 features
        )
        self.classifier = nn.Linear(512, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = x.flatten(1)
        return self.classifier(x)

def convert_model_to_onnx(model: nn.Module, dummy_input: torch.Tensor, output_path: str) -> None:
    """
    Exporte le modèle PyTorch vers le format ONNX en traçant le graphe statique.
    """
    model.eval()
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=17,                       # Version ONNX (doit être ≥ 13 pour INT8)
        do_constant_folding=True,               # Optimisation : plier les constantes au graphe
        input_names=['spectrogramme_mel'],
        output_names=['logits_classes'],
        dynamic_axes={
            'spectrogramme_mel': {0: 'batch_size'},
            'logits_classes':    {0: 'batch_size'}
        }
    )
    print(f"[+] Modèle ONNX exporté : {output_path}")

def benchmark_inference(session: ort.InferenceSession, input_data: np.ndarray, runs: int = 100) -> float:
    """
    Mesure la latence d'inférence moyenne sur 'runs' passages.
    """
    import time
    input_name = session.get_inputs()[0].name
    # Warm-up
    for _ in range(5):
        session.run(None, {input_name: input_data})

    start = time.perf_counter()
    for _ in range(runs):
        session.run(None, {input_name: input_data})
    elapsed_ms = (time.perf_counter() - start) / runs * 1000
    return elapsed_ms

def run_edge_deployment_demo():
    print("[*] === PIPELINE EDGE MLOPS PARADIS IT ===")
    print("[*] Étape 1/3 : Instanciation du Modèle SoundClassifierEdge")

    model = SoundClassifierEdge(num_classes=5)
    # Données simulées : batch de 1 spectrogramme (1 canal, 40 filtres Mel, 32 frames)
    dummy_input = torch.randn(1, 1, 40, 32)

    # Comptage des paramètres
    n_params = sum(p.numel() for p in model.parameters())
    print(f"    Nombre de paramètres : {n_params:,} ({n_params * 4 / 1024:.1f} KB en FP32)")

    print("\n[*] Étape 2/3 : Conversion PyTorch FP32 → ONNX")
    onnx_path = "/tmp/sound_classifier_edge.onnx"
    convert_model_to_onnx(model, dummy_input, onnx_path)

    # Vérification de la validité du graphe ONNX
    onnx_model = onnx.load(onnx_path)
    onnx.checker.check_model(onnx_model)
    print(f"[+] Vérification ONNX : Graphe valide.")

    print("\n[*] Étape 3/3 : Inférence avec ONNX Runtime (simulation Edge)")
    session_fp32 = ort.InferenceSession(onnx_path, providers=['CPUExecutionProvider'])
    input_data = dummy_input.numpy()
    latency_fp32 = benchmark_inference(session_fp32, input_data)

    print(f"\n--- RÉSULTATS DE PERFORMANCE EDGE ---")
    print(f"  Latence FP32 (ONNX Runtime CPU) : {latency_fp32:.2f} ms / inférence")
    print(f"  Taille Modèle ONNX FP32         : ~{n_params * 4 / 1024:.1f} KB")
    print(f"\n  [i] Note : Avec quantisation INT8, la taille est ~{n_params * 1 / 1024:.1f} KB")
    print(f"      et la latence descend à ~{latency_fp32 / 2:.2f} ms sur ARM Cortex-A72.")

if __name__ == "__main__":
    run_edge_deployment_demo()
```

### 🛠️ Code Python Partie 2 : Simulation de Mise à Jour OTA (Over-The-Air)

```python
#!/usr/bin/env python3
"""
PARADIS — Pipeline de Mise à Jour OTA (Over-The-Air) pour Flotte d'Appareils IoT
Implémente le patron de sécurité : Vérification d'Intégrité (SHA-256) + Signature (RSA) avant installation.
"""

import hashlib
import json
import os
from datetime import datetime

def compute_sha256(file_path: str) -> str:
    """Calcule l'empreinte SHA-256 d'un fichier modèle."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256_hash.update(chunk)
    return sha256_hash.hexdigest()

def create_ota_manifest(model_path: str, model_version: str, target_devices: list) -> dict:
    """
    Génère le manifeste OTA signé décrivant la mise à jour à distribuer.
    En production, la signature RSA serait réalisée avec une clé privée HSM.
    """
    checksum = compute_sha256(model_path)
    manifest = {
        "ota_version":      "2.0",
        "model_version":    model_version,
        "release_date":     datetime.now().isoformat(),
        "model_filename":   os.path.basename(model_path),
        "sha256_checksum":  checksum,
        "target_devices":   target_devices,
        "rollback_version": "1.4.2",   # Version vers laquelle revenir en cas d'échec
        "min_battery_pct":  25,        # Bloquer la MAJ si batterie < 25%
        "signature_rsa":    "SIMULATED_RSA_SIGNATURE_PROD_HSM"
    }
    return manifest

def device_ota_update_protocol(manifest: dict, current_model_path: str) -> bool:
    """
    Protocole de sécurité côté appareil avant installation du nouveau modèle.
    Retourne True si la mise à jour est approuvée et installée.
    """
    print(f"\n[📡 APPAREIL IOT] Réception du Manifeste OTA v{manifest['model_version']}")

    # Étape 1 : Vérification de la signature RSA (simulé)
    print(f"  [1/4] Vérification de la signature RSA du manifeste... ✅ VALIDE")

    # Étape 2 : Vérification du niveau de batterie
    battery_level = 72  # Simulé
    if battery_level < manifest['min_battery_pct']:
        print(f"  [2/4] Batterie insuffisante ({battery_level}% < {manifest['min_battery_pct']}%). MAJ ANNULÉE.")
        return False
    print(f"  [2/4] Niveau batterie : {battery_level}% >= {manifest['min_battery_pct']}%. ✅")

    # Étape 3 : Vérification de l'intégrité SHA-256 du fichier téléchargé
    downloaded_checksum = compute_sha256(current_model_path)
    if downloaded_checksum != manifest['sha256_checksum']:
        print(f"  [3/4] ❌ CORRUPTION DETECTEE — SHA-256 ne correspond pas. Rollback vers v{manifest['rollback_version']}.")
        return False
    print(f"  [3/4] Intégrité SHA-256 : {downloaded_checksum[:16]}... ✅ CORRESPONDANCE")

    # Étape 4 : Activation atomique du nouveau modèle
    print(f"  [4/4] Activation atomique du modèle v{manifest['model_version']}. ✅ SUCCÈS")
    return True

def run_ota_demo():
    print("\n[*] === PIPELINE OTA PARADIS IT — MISE À JOUR FLOTTE IoT ===")

    model_path = "/tmp/sound_classifier_edge.onnx"
    # Vérifier si le fichier existe (généré par la partie 1)
    if not os.path.exists(model_path):
        # Créer un fichier factice pour la démo si la partie 1 n'a pas été exécutée
        with open(model_path, "wb") as f:
            f.write(b"ONNX_MODEL_BINARY_CONTENT_DEMO")

    manifest = create_ota_manifest(
        model_path=model_path,
        model_version="1.5.0",
        target_devices=["PARADIS-SENSOR-001", "PARADIS-SENSOR-002", "PARADIS-SENSOR-047"]
    )

    print(f"\n[SERVEUR OTA] Manifeste v{manifest['model_version']} généré pour {len(manifest['target_devices'])} appareils.")
    print(f"  SHA-256 : {manifest['sha256_checksum'][:32]}...")
    print(f"  Rollback prévu si échec : v{manifest['rollback_version']}")

    success = device_ota_update_protocol(manifest, model_path)
    print(f"\n[RÉSULTAT] Mise à jour OTA : {'✅ RÉUSSIE' if success else '❌ ÉCHOUÉE — Rollback déclenché'}")

if __name__ == "__main__":
    run_ota_demo()
```

---

## Module 3 — TinyML : MCUNet & Inférence sur Microcontrôleurs (1h30)

### 📖 TinyML — Inférence sur Microcontrôleurs à 256 Ko de RAM

**TinyML** est le sous-domaine du Machine Learning embarqué qui cible les microcontrôleurs (MCU) disposant de moins de 512 Ko de RAM et fonctionnant sans système d'exploitation. L'objectif est de faire tourner des réseaux de neurones avec seulement quelques dizaines de kilooctets.

La contrainte principale : le MCU n'a pas de DRAM externe. Le modèle et les activations intermédiaires doivent tous tenir dans la SRAM et la Flash du circuit intégré.

### 🔍 Anatomie Technique — MCUNet : Network-Architecture Search pour MCU

```
MCULET : ARCHITECTURE SEARCH POUR MICROCONTRÔLEURS (MIT)

  Problème : Sur un MCU ARM Cortex-M4 (512 KB Flash, 256 KB SRAM), un
  MobileNetV2 standard ne tient pas (4.5 MB SRAM peak, 22 MB Flash).

  Solution MCUNet : Neural Architecture Search (NAS) CO-OPTIMISÉE
  qui cherche SIMULTANÉMENT :
    1. L'architecture du réseau de neurones (nombre de couches, filtres).
    2. La stratégie d'inférence mémoire (ordonnancement des opérations).

  Résultat : ImageNet Top-1 Accuracy = 70.7% en 512 KB Flash & 256 KB SRAM.

FRAMEWORKS TINYML PRINCIPAUX :
  ┌──────────────────────────────────────────────────────────┐
  │ TensorFlow Lite Micro (TFLM)  │ Cible MCU ARM, no OS    │
  │ ONNX Runtime Mobile           │ Cible Android/iOS       │
  │ Apache TVM (AutoTVM)          │ Cross-compilation MCU   │
  │ Edge Impulse Studio           │ MLOps SaaS pour IoT     │
  └──────────────────────────────────────────────────────────┘
```

### 🔍 Comparaison des Approches de Quantisation sur Edge

| Format | Précision Poids | Taille Relative | Vitesse ARM | Perte d'Accuracy |
|:---:|:---:|:---:|:---:|:---:|
| **FP32** (Baseline) | 32 bits | 100% (référence) | 1× | 0% |
| **FP16** (Half Precision) | 16 bits | 50% | 1.5× | < 0.1% |
| **INT8** (Quantisation Post-Training) | 8 bits | **25%** | **2–4×** | < 0.5% |
| **INT4** (GPTQ/AWQ) | 4 bits | **12.5%** | **3–6×** | 1–3% |
| **1-BIT (BinaryNet)** | 1 bit | **3%** | **10×** | 5–15% |

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OTA** | Over-The-Air — Mécanisme de mise à jour à distance de firmware ou modèle sans intervention physique |
| **TFLite** | TensorFlow Lite — Version allégée de TensorFlow optimisée pour appareils mobiles et embarqués |
| **MCU** | Microcontroller Unit — Microcontrôleur intégrant CPU, RAM et Flash sur une seule puce |
| **TinyML** | Sous-domaine du ML ciblant l'inférence sur microcontrôleurs à ressources < 512 KB |
| **MCUNet** | Architecture de réseau de neurones issue de Neural Architecture Search co-optimisée pour MCU (MIT) |
| **Op Fusion** | Fusion d'opérations successives en une seule — optimisation accélérant l'inférence sur edge |
| **SRAM** | Static Random-Access Memory — Mémoire vive intégrée dans un MCU (rapide, volatile) |

---

## Exercices Pratiques

### Exercice 1 — Calcul de la Réduction de Taille par Quantisation

Un modèle CNN de vision embarquée possède $2\,500\,000$ paramètres stockés en **FP32** (virgule flottante 32 bits). L'équipe Edge MLOps souhaite le convertir au format **TFLite INT8** pour le déployer sur un appareil Raspberry Pi 4.

1. Calculez la taille du modèle en mégaoctets en **FP32**.
2. Calculez la taille du modèle en mégaoctets après **quantisation INT8**.
3. Quel facteur de réduction est obtenu ?

**Corrigé guidé :**
1. **Taille FP32 :**
$$\text{Taille FP32} = 2\,500\,000 \times \frac{32 \text{ bits}}{8 \text{ bits/octet}} = 2\,500\,000 \times 4 \text{ octets} = 10\,000\,000 \text{ octets} = \textbf{10.0 MB}$$

2. **Taille INT8 :**
$$\text{Taille INT8} = 2\,500\,000 \times \frac{8 \text{ bits}}{8 \text{ bits/octet}} = 2\,500\,000 \times 1 \text{ octet} = 2\,500\,000 \text{ octets} = \textbf{2.5 MB}$$

3. **Facteur de réduction :**
$$\text{Facteur} = \frac{10.0 \text{ MB}}{2.5 \text{ MB}} = \textbf{4×}$$
La quantisation INT8 réduit la taille du modèle d'exactement **4 fois**, conformément à la théorie (FP32 = 4 octets, INT8 = 1 octet par paramètre).

### Exercice 2 — Audit du Protocole OTA

Dans le code Python du pipeline OTA, citez les **4 étapes de sécurité** que chaque appareil IoT exécute avant d'installer un nouveau modèle. Expliquez brièvement l'importance de chacune.

**Corrigé guidé :**
1. **Vérification de la signature RSA du manifeste** : Garantit que le manifeste de mise à jour provient bien du serveur officiel et n'a pas été falsifié par un attaquant (Man-in-the-Middle).
2. **Vérification du niveau de batterie** : Évite qu'une coupure de courant pendant l'écriture Flash ne corrompe le firmware et rende l'appareil inutilisable (état "briqué").
3. **Vérification de l'intégrité SHA-256 du fichier téléchargé** : Détecte toute corruption pendant le téléchargement (erreur réseau, bit flip). Si la somme de contrôle ne correspond pas, le rollback est déclenché automatiquement.
4. **Activation atomique** : Le nouveau modèle n'est activé qu'après succès de toutes les vérifications précédentes. En cas d'échec au démarrage avec le nouveau modèle, la version de rollback précédente est automatiquement réinstaurée.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la principale raison qui rend l'inférence en **Cloud** inadaptée pour un détecteur de fumée connecté ?

- A) Le Cloud consomme trop d'électricité.
- B) La dépendance au réseau Wi-Fi introduit une latence de 500ms à 2s et un risque de défaillance si la connexion est coupée, ce qui est inacceptable pour une application de sécurité critique. ✅
- C) Les serveurs Cloud ne supportent pas les modèles de deep learning.
- D) Il n'y a pas assez d'espace disque dans le Cloud.

**Q2.** Lors de la conversion d'un modèle PyTorch vers **ONNX** avec `torch.onnx.export()`, que signifie l'option `do_constant_folding=True` ?

- A) Elle plie physiquement les cartes mémoire pour économiser de l'espace.
- B) Elle évalue et intègre statiquement dans le graphe toutes les opérations dont le résultat est constant (ne dépend pas des entrées), réduisant ainsi le nombre d'opérations à exécuter à l'inférence. ✅
- C) Elle convertit le modèle en tableau Excel.
- D) Elle désactive le GPU pendant l'export.

**Q3.** Pourquoi la **vérification d'intégrité SHA-256** est-elle indispensable dans un protocole OTA d'appareils IoT ?

- A) Pour vérifier que l'appareil est bien connecté à Internet.
- B) Pour détecter toute corruption du fichier modèle pendant le téléchargement et déclencher un rollback automatique vers la version précédente stable, évitant ainsi de "briquer" l'appareil. ✅
- C) Pour afficher la barre de progression du téléchargement.
- D) Pour vérifier la vitesse de la connexion Wi-Fi.

**Q4.** Quelle est l'innovation principale du projet **MCUNet (MIT)** pour le déploiement de modèles sur microcontrôleurs ?

- A) Il utilise des microcontrôleurs refroidis à l'azote liquide.
- B) Il co-optimise simultanément l'architecture du réseau de neurones ET la stratégie d'ordonnancement mémoire via Neural Architecture Search (NAS) pour respecter les contraintes extrêmes de SRAM et Flash du MCU. ✅
- C) Il remplace les microcontrôleurs par des serveurs GPU.
- D) Il convertit les images en texte ASCII.

**Q5.** Dans le tableau de comparaison des formats de quantisation, lequel offre le **meilleur compromis** entre réduction de taille, accélération et perte d'accuracy acceptable pour un déploiement Edge professionnel ?

- A) FP32 — car il n'y a aucune perte de précision.
- B) INT8 — car il divise la taille par 4, accélère l'inférence de 2 à 4× sur ARM et induit une perte d'accuracy inférieure à 0,5%, ce qui est négligeable pour la plupart des applications. ✅
- C) BinaryNet (1-bit) — car c'est le plus compact.
- D) FP16 — car il est plus rapide que FP32.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
