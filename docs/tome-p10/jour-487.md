# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 487 (6h) : Compression de Modèles & Edge AI : TensorRT-LLM, Apple MLX, NPU/TPU Acceleration & Déploiement embarqué (Jetson/Raspberry Pi)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser l'accélération d'inférence LLM sur GPU avec **TensorRT-LLM** (In-flight Batching, Paged Attention)
> - Exécuter et optimiser des modèles IA sur puces Apple Silicon avec le framework **Apple MLX**
> - Déployer des modèles de vision et de langage sur équipements **Edge AI** (NVIDIA Jetson, Raspberry Pi 5 avec NPU)
> - Quantiser et compiler des modèles pour NPUs embarqués (**Neural Processing Units**)
>
> **Compétences visées :** `AI-03` (A) — Model Compression & Edge AI Acceleration

---

## Module 1 — Architectures NPU & Frameworks Edge AI (2h)

### 📖 Intuition & Narration

Déployer des modèles de Deep Learning dans le Cloud est pratique, mais soulève des défis majeurs dans de nombreux scénarios réels : **latence réseau imprévisible**, **absence de connexion Internet (offline)**, **coûts de bande passante élevés** et **confidentialité des données**.

L'**Edge AI** consiste à exécuter le traitement IA directement sur l'équipement terminal (Caméra IP, Véhicule, Raspberry Pi, NVIDIA Jetson, Smartphone). Pour y parvenir sans vider la batterie ni surchauffer, les puces modernes intègrent des processeurs matériels dédiés : les **NPU (Neural Processing Units)** et les **TPU Edge**.

### 🔍 Anatomie Technique — Hardware Accelerator Hierarchy

```
HIÉRARCHIE DES ARCHITECTURES D'ACCÉLÉRATION IA

  1. CLOUD GPU (NVIDIA H100 / A100) :
     - Conçu pour le débit maximal et le parallélisme massif (700W TDP).

  2. EDGE GPU (NVIDIA Jetson Orin Nano / AGX Orin) :
     - GPU embarqué SoC (System-on-Chip) avec mémoire unifiée LPDDR5 (7W à 60W TDP).
     - Accélération via TensorRT et CUDA.

  3. APPLE SILICON NPU / MLX (M1/M2/M3/M4) :
     - Architecture Mémoire Unifiée (UMA — CPU, GPU et Neural Engine partagent la MÊME RAM !).
     - Apple MLX Framework : Permet de faire tourner LLaMA 3 70B en local sur un Mac Studio !

  4. NPU EMBARQUÉ (Raspberry Pi AI Hat / Coral Edge TPU) :
     - Accélérateur matriciel INT8 dédié à très faible consommation (<2W).
     - Obligation de quantiser et compiler le modèle en format TFLite / ONNX INT8.
```

---

## Module 2 — Atelier Pratique : Inférence Local avec Apple MLX / TensorRT-LLM (2h)

### 🛠️ Script Python : Exécution d'un LLM sur Apple Silicon avec MLX

```python
#!/usr/bin/env python3
"""
PARADIS — Inférence LLM Locale Ultra-Rapide avec Apple MLX (Apple Silicon M1/M2/M3/M4)
"""

import time

def run_mlx_inference_demo():
    print("[*] --- DÉMONSTRATION INFERENCE EDGE/LOCAL APPLE MLX PARADIS IT ---")

    try:
        import mlx.core as mx
        import mlx.nn as nn
        from mlx_lm import load, generate

        print("[+] Framework Apple MLX détecté (Unified Memory Architecture).")

        # 1. Chargement d'un LLM quantisé en 4-bit optimisé MLX
        model_path = "mlx-community/Meta-Llama-3-8B-Instruct-4bit"
        print(f"[*] Chargement du modèle {model_path} en mémoire unifiée RAM/VRAM...")

        model, tokenizer = load(model_path)

        prompt = "Rédige une fonction Python sécurisée pour vérifier la validité d'une adresse IPv4 :"
        formatted_prompt = f"<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"

        # 2. Inférence native MLX
        start_time = time.perf_counter()
        response = generate(
            model,
            tokenizer,
            prompt=formatted_prompt,
            max_tokens=150,
            verbose=False
        )
        elapsed = time.perf_counter() - start_time

        print("\n--- RÉPONSE GÉNÉRÉE AVEC APPLE MLX ---")
        print(response)
        print(f"\n[+] Métriques MLX : Temps = {elapsed:.2f}s | TPS = {150/elapsed:.1f} tokens/sec")

    except ImportError:
        print("[!] MLX non disponible (Nécessite macOS avec puces Apple Silicon). Mode simulation actif.")
        print("\n--- SIMULATION PERFORMANCES APPLE MLX (Apple Silicon M3 Max) ---")
        print("  • Débit de génération (Throughput LLaMA-3 8B 4-bit) : 68.5 tokens/sec.")
        print("  • Empreinte Mémoire Unifiée RAM/VRAM             : 4.8 GB.")
        print("  • Consommation Électrique                         : 18 Watts.")

if __name__ == "__main__":
    run_mlx_inference_demo()
```

---

## Module 3 — Compilation TensorRT-LLM & Edge Deployment (1h30)

### 🔍 Processus de Compilation TensorRT-LLM pour NVIDIA Jetson

```
PIPELINE DE COMPILATION TENSORRT-LLM (NVIDIA Edge / Server)

  [ Modèle Hugging Face (PyTorch BF16) ]
                    │
                    ▼
  [ TensorRT-LLM Converter (Quantization AWQ / SmoothQuant INT8) ]
                    │
                    ▼
  [ TensorRT-LLM Builder (Target Architecture: SM_87 Orin / SM_90 H100) ]
  - In-Flight Batching (Continuous Batching)
  - Paged KV-Cache Memory Allocation
  - Kernel Fusion (GeLU + Add + LayerNorm)
                    │
                    ▼
  [ Compiled TensorRT Engine (.engine) ] ──► [ C++ Execution Runtime ]
                                              (Latence ultra-faible < 15ms)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **NPU** | Neural Processing Unit — Processeur matériel spécialisé dans l'accélération des réseaux de neurones |
| **MLX** | Framework open-source d'apprentissage automatique développé par Apple pour les puces Apple Silicon |
| **UMA** | Unified Memory Architecture — Architecture où CPU, GPU et NPU partagent un même pool de mémoire RAM |
| **SoC** | System-on-Chip — Circuit intégré regroupant CPU, GPU, NPU et contrôleurs sur une même puce |
| **TDP** | Thermal Design Power — Enveloppe thermique et puissance électrique maximale consommée (Watts) |

---

## Exercices Pratiques

### Exercice 1 — Calcul d'Autonomie Électrique Edge AI

Un drone d'inspection industrielle embarque une batterie de $50\text{ Wh}$ (Watt-heures).
- Option A : Calcul déporté sur serveur Cloud via modem 5G (Consommation de la carte 5G = $15\text{ W}$).
- Option B : Traitement Edge AI local sur carte NVIDIA Jetson Orin Nano (Consommation totale = $10\text{ W}$).
1. Calculez l'autonomie théorique du drone pour chaque option.
2. Si le réseau 5G est coupé dans un hangar métallique, quelle option reste opérationnelle ?

**Corrigé guidé :**
1. **Calcul de l'autonomie** :
   - Option A (Cloud 5G) :
     $$\text{Temps}_A = \frac{50 \text{ Wh}}{15 \text{ W}} = 3.33 \text{ heures} \approx 3 \text{h } 20 \text{ min}.$$
   - Option B (Edge AI Jetson) :
     $$\text{Temps}_B = \frac{50 \text{ Wh}}{10 \text{ W}} = 5.0 \text{ heures} \approx 5 \text{h } 00 \text{ min}.$$
2. **Résilience** :
   L'**Option B (Edge AI)** est la seule à rester $100\%$ opérationnelle hors-ligne en environnement privé ou blindé, tout en offrant une autonomie **$50\%$ plus élevée** ($5\text{h}$ vs $3\text{h}20$).

---

## Banque QCM — 5 Questions

**Q1.** Quel est l'avantage clé de l'architecture de mémoire unifiée **(UMA)** présente sur les puces Apple Silicon (M1 à M4) lors de l'exécution de LLMs avec le framework **MLX** ?

- A) Elle rend les ordinateurs gratuits.
- B) Le CPU, le GPU et le Neural Engine partagent la MÊME mémoire RAM physique, éliminant les transferts lents via PCIe et permettant de charger de très grands modèles (ex: 70B) directement dans la VRAM/RAM unifiée du Mac. ✅
- C) Elle supprime l'utilisation des ventilateurs.
- D) Elle ne fonctionne qu'avec des fichiers MP3.

**Q2.** À quoi sert un **NPU (Neural Processing Unit)** dans un appareil mobile ou embarqué (Raspberry Pi AI Hat, Smartphone) ?

- A) À afficher des fenêtres Windows.
- B) À exécuter les multiplications matricielles des réseaux de neurones avec une consommation électrique extrêmement faible (quelques Watts) et une efficacité énergétique maximale. ✅
- C) À remplacer la carte son.
- D) À formater les disques durs.

**Q3.** Quel est le rôle principal du SDK **TensorRT-LLM** de NVIDIA ?

- A) Rédiger des e-mails automatiquement.
- B) Compiler, quantiser et optimiser les graphes d'inférence des LLMs pour maximiser le débit (Tokens/sec) et minimiser la latence sur GPU NVIDIA. ✅
- C) Créer des sites web en HTML5.
- D) Sauvegarder les données dans MySQL.

**Q4.** Pourquoi le déploiement **Edge AI** (traitement local sur l'équipement terminal) est-il préféré au Cloud dans les environnements industriels sensibles ?

- A) Parce que le Cloud est interdit par la loi partout dans le monde.
- B) Parce qu'il garantit une latence constante déterministe, le fonctionnement hors-ligne (Offline) et la confidentialité totale des données qui ne quittent jamais l'appareil. ✅
- C) Parce que les processeurs Edge sont 100x plus puissants que les GPUs H100 du Cloud.
- D) Parce qu'il n'y a pas besoin de code.

**Q5.** Que signifie l'acronyme **TDP (Thermal Design Power)** dans le choix d'un composant d'infrastructure Edge AI ?

- A) Total Data Processing.
- B) L'enveloppe thermique et la consommation électrique maximale en Watts du composant, déterminant la taille du système de refroidissement et de la batterie. ✅
- C) Temporal Dynamic Protocol.
- D) Tensor Data Parallelism.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
