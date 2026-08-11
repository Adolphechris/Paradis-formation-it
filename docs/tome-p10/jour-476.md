# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 476 (6h) : Entraînement Distribué : PyTorch DDP, Tensor & Pipeline Parallelism, ZeRO (DeepSpeed) & FSDP (Fully Sharded Data Parallel)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le **Distributed Data Parallel (DDP)** natif de PyTorch avec synchronisation Ring-AllReduce
> - Différencier les parallélismes de grands modèles : **Tensor Parallelism** (Megatron-LM) et **Pipeline Parallelism**
> - Comprendre l'optimisation **ZeRO (Zero Redundancy Optimizer)** de DeepSpeed (ZeRO-1, ZeRO-2, ZeRO-3)
> - Configurer et entraîner un grand modèle avec **FSDP (Fully Sharded Data Parallel)** en PyTorch
>
> **Compétences visées :** `AI-03` (A) — Distributed ML Training & Scaling

---

## Module 1 — Du DDP à FSDP : Parallélisme de Données & Sharding (2h)

### 📖 Intuition & Narration

Lorsqu'un modèle ne rentre plus dans la mémoire VRAM d'un seul GPU (ex: LLaMA 70B qui exige 140 Go en BF16 juste pour charger ses poids), l'approche classique du Data Parallelism (dupliquer le modèle entier sur chaque GPU) devient impossible.

Pour entraîner des modèles géants, les chercheurs ont développé le **Sharding (Fractionnement)** :
1. **DDP (Distributed Data Parallel)** : Duplique le modèle complet sur chaque GPU, découpe les données.
2. **ZeRO / FSDP (Fully Sharded Data Parallel)** : Découpe et répartit **les poids**, **les gradients** et **les états de l'optimiseur (Adam)** à travers tous les GPUs du cluster. Les poids ne sont rassemblés via `AllGather` que de façon éphémère au moment précis où la couche correspondante s'exécute, puis libérés immédiatement.

### 🔍 Anatomie Technique — Les 3 Niveaux de ZeRO (DeepSpeed / FSDP)

```
RÉDUCTIONS DE MÉMOIRE ZERO / FSDP (0.5B à 100B+ Paramètres)

  Pour un modèle de N paramètres sous optimiseur AdamW (précision mixte FP16/FP32) :
  - Poids FP16           : 2N octets
  - Gradients FP16       : 2N octets
  - États Adam (FP32)    : 12N octets (4N Poids FP32 + 4N Momentum + 4N Variance)
  ── Total Mémoire d'Entraînement : 16N octets !

  1. ZeRO-Stage 1 (Optimizer State Partitioning) :
     - Découpe les 12N octets d'AdamW sur N_gpu GPUs.
     - Gain Mémoire : 4x (permet d'entraîner des modèles 4x plus grands).

  2. ZeRO-Stage 2 (Gradient + Optimizer Partitioning) :
     - Découpe aussi les 2N octets de Gradients.
     - Gain Mémoire : 8x.

  3. ZeRO-Stage 3 / FSDP FULL_SHARD (Parameter + Gradient + Optimizer) :
     - Découpe ABSOLUMENT TOUT (Poids, Gradients, Optimiseur).
     - Empreinte Mémoire par GPU : (16N) / N_gpu octets !
     - Permet d'entraîner des modèles de 100+ Milliards de paramètres sur des nœuds standards.
```

---

## Module 2 — Atelier Pratique : Code PyTorch FSDP (Fully Sharded Data Parallel) (2h)

### 🛠️ Script Python : Configuration FSDP Multi-GPU

```python
#!/usr/bin/env python3
"""
PARADIS — Script d'Entraînement Distribué avec PyTorch FSDP (Fully Sharded Data Parallel)
"""

import os
import torch
import torch.nn as nn
import torch.distributed as dist
from torch.distributed.fsdp import (
    FullyShardedDataParallel as FSDP,
    ShardingStrategy,
    MixedPrecision,
)

def setup_distributed():
    """Initialise le groupe de processus distribués PyTorch via NCCL"""
    dist.init_process_group(backend="nccl")
    local_rank = int(os.environ["LOCAL_RANK"])
    torch.cuda.set_device(local_rank)
    return local_rank

def cleanup_distributed():
    dist.destroy_process_group()

# Modèle réseau/LLM fictif deep
class LargeTransformerBlock(nn.Module):
    def __init__(self, hidden_dim=4096):
        super().__init__()
        self.fc1 = nn.Linear(hidden_dim, hidden_dim * 4)
        self.act = nn.GELU()
        self.fc2 = nn.Linear(hidden_dim * 4, hidden_dim)

    def forward(self, x):
        return x + self.fc2(self.act(self.fc1(x)))

def run_fsdp_training():
    if not torch.cuda.is_available():
        print("[!] CUDA non disponible. Exécution en mode simulation distribuée.")
        return

    local_rank = setup_distributed()
    world_size = dist.get_world_size()

    if local_rank == 0:
        print(f"[*] Initialisation du cluster FSDP sur {world_size} GPUs (NCCL Backend)...")

    # 1. Configuration de la précision mixte FSDP (BF16 pour les calculs, FP32 pour l'optimiseur)
    bf16_policy = MixedPrecision(
        param_dtype=torch.bfloat16,
        reduce_dtype=torch.bfloat16,
        buffer_dtype=torch.bfloat16,
    )

    # 2. Création du modèle de base
    base_model = LargeTransformerBlock(hidden_dim=2048).to(local_rank)

    # 3. Enveloppement avec FSDP (FULL_SHARD = ZeRO-3)
    fsdp_model = FSDP(
        base_model,
        sharding_strategy=ShardingStrategy.FULL_SHARD,
        mixed_precision=bf16_policy,
        device_id=torch.cuda.current_device()
    )

    optimizer = torch.optim.AdamW(fsdp_model.parameters(), lr=1e-4)

    # 4. Boucle d'entraînement distribuée
    inputs = torch.randn(4, 2048, device=local_rank, dtype=torch.bfloat16)
    targets = torch.randn(4, 2048, device=local_rank, dtype=torch.bfloat16)

    optimizer.zero_grad()
    outputs = fsdp_model(inputs)
    loss = torch.nn.functional.mse_loss(outputs, targets)
    loss.backward()
    optimizer.step()

    if local_rank == 0:
        print(f"[+] Étape d'entraînement FSDP réussie | Perte : {loss.item():.4f}")
        print("  ✅ Les poids, gradients et états AdamW ont été fractionnés dynamiquement sur les GPUs.")

    cleanup_distributed()

if __name__ == "__main__":
    # Pour exécuter réellement : torchrun --nproc_per_node=2 jour-476.py
    if "LOCAL_RANK" in os.environ:
        run_fsdp_training()
    else:
        print("[i] Lancer ce script avec torchrun pour le mode distribué :")
        print("    torchrun --nproc_per_node=2 jour-476.py")
```

---

## Module 3 — Tensor Parallelism & Pipeline Parallelism (1h30)

### 🔍 Comparatif des Techniques de Parallélisme Avancées

```
MATRICE DES TECHNIQUES DE PARALLÉLISME DISTRIBUÉ

  Technique           │ Fracturé quoi ?  │ Bande Passante Réseau │ Framework Principal
  ────────────────────┼──────────────────┼───────────────────────┼────────────────────
  DDP (PyTorch)       │ Données (Data)   │ Faible (AllReduce)    │ PyTorch Native
  FSDP / ZeRO-3       │ Poids+Grad+Opt   │ Moyenne (AllGather)   │ PyTorch FSDP / DeepSpeed
  Tensor Parallel (TP)│ Matrices Intra-L │ Très Élevée (NVLink)  │ Megatron-LM / vLLM
  Pipeline Par. (PP)  │ Couches Inter-L  │ Faible (Point-to-Point)│ Megatron-LM / Deepspeed

TENSOR PARALLELISM (Megatron-LM — Shoeybi et al.) :
  - Découpe la matrice de poids W d'une seule couche Linear/Attention sur plusieurs GPUs.
  - Linear Column Parallelism  : W = [W_1 | W_2] ──▶ Y_1 = X*W_1, Y_2 = X*W_2
  - Linear Row Parallelism     : W = [W_1 / W_2] ──▶ AllReduce(X_1*W_1 + X_2*W_2)
  - EXIGE NVLINK ! Inutilisable sur réseau Ethernet classique en raison de la latence de communication.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DDP** | Distributed Data Parallel — Parallélisme de données standard avec modèle dupliqué |
| **FSDP** | Fully Sharded Data Parallel — Parallélisme distribué fractionnant poids, gradients et optimiseur |
| **ZeRO** | Zero Redundancy Optimizer — Technologie DeepSpeed de suppression des redondances mémoire |
| **TP** | Tensor Parallelism — Parallélisme intra-couche découpant les matrices de poids sur plusieurs GPUs |
| **PP** | Pipeline Parallelism — Parallélisme inter-couches découpant les blocs séquentiels du réseau |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Gain Mémoire ZeRO-3 / FSDP

Considérez un modèle LLM de $10\text{ Milliards}$ de paramètres ($N = 10 \times 10^9$).
1. Calculez l'empreinte mémoire totale minimale requise pour l'entraînement sous AdamW en précision mixte FP16/FP32 ($16N$ octets).
2. Si vous disposez d'un cluster de $8$ GPUs NVIDIA A100 (80GB VRAM chacun), quelle sera l'empreinte mémoire théorique des poids, gradients et états d'optimiseur par GPU en utilisant **FSDP FULL_SHARD (ZeRO-3)** ?
3. Le modèle rentre-t-il sur ce cluster ?

**Corrigé guidé :**
1. **Empreinte mémoire totale** :
   $\text{Mémoire Total} = 16 \times (10 \times 10^9) \text{ octets} = 160 \times 10^9 \text{ octets} = 160 \text{ GB}$.
2. **Empreinte par GPU avec FSDP (ZeRO-3)** :
   $$\text{Mémoire / GPU} = \frac{160 \text{ GB}}{8 \text{ GPUs}} = 20 \text{ GB / GPU}.$$
3. **Faisabilité** :
   Chaque GPU A100 dispose de 80 GB de VRAM. Avec une consommation de **20 GB** pour les composants fractionnés FSDP, il reste 60 GB de VRAM pour les activations et le KV-cache. Le modèle rentre **très largement** sur ce cluster de 8 GPUs.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la limitation majeure du **Distributed Data Parallel (DDP)** classique lors de l'entraînement de modèles géants (LLMs) ?

- A) DDP ne fonctionne pas sur Linux.
- B) DDP exige de dupliquer l'intégralité des poids du modèle et des états de l'optimiseur sur chaque GPU, provoquant une saturation de la mémoire VRAM dès que le modèle dépasse quelques milliards de paramètres. ✅
- C) DDP annule les gradients après chaque batch.
- D) DDP ne supporte que la précision FP32.

**Q2.** Que fractionne la stratégie **ZeRO-3 (FSDP FULL_SHARD)** par rapport à ZeRO-1 et ZeRO-2 ?

- A) Uniquement les images du dataset.
- B) Les états de l'optimiseur, les gradients ET les poids (paramètres) du modèle eux-mêmes. ✅
- C) Uniquement le code Python.
- D) Les requêtes HTTP du client.

**Q3.** Pourquoi le **Tensor Parallelism (Megatron-LM)** exige-t-il des connexions d'interconnexion haute vitesse comme **NVLink** entre les GPUs ?

- A) Parce qu'il télécharge des fichiers vidéo.
- B) Parce qu'il effectue des opérations de communication collectives (AllReduce) ultra-fréquentes au sein même de chaque couche du réseau (à chaque multiplication matricielle). ✅
- C) Parce qu'il efface la mémoire RAM du CPU.
- D) Parce qu'il n'utilise pas de compilateur CUDA.

**Q4.** Dans FSDP, que fait la stratégie de **Précision Mixte (Mixed Precision)** standard ?

- A) Elle convertit le code en langage C.
- B) Elle exécute les passes avant et arrière en précision réduite (BF16 ou FP16) pour accélérer le calcul et réduire la mémoire, tout en conservant la copie maître des poids et des états d'optimiseur en FP32 pour préserver la stabilité numérique. ✅
- C) Elle supprime 50% des neurones du réseau.
- D) Elle force l'utilisation du processeur central.

**Q5.** La commande officielle PyTorch recommandée pour lancer un script d'entraînement distribué FSDP/DDP sur plusieurs GPUs est :

- A) `python main.py`
- B) `torchrun --nproc_per_node=NUM_GPUS script.py` ✅
- C) `npm start`
- D) `gcc -o run main.c`

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
