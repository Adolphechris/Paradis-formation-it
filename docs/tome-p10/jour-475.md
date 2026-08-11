# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 475 (6h) : Infrastructure GPU pour le ML : Architecture CUDA, Tensor Cores, NVLink/NVSwitch, NCCL AllReduce & Gradient Accumulation

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre l'architecture matérielle des GPUs NVIDIA (Streaming Multiprocessors - SM, CUDA Cores, Tensor Cores, Warps)
> - Analyser les interconnexions haute vitesse multi-GPUs : **NVLink**, **NVSwitch** et réseau InfiniBand
> - Maîtriser les opérations collectives de communication **NCCL (AllReduce, AllGather, Broadcast)**
> - Implémenter la technique du **Gradient Accumulation** pour simuler de très grands batch sizes sur des VRAMs contraintes
>
> **Compétences visées :** `AI-03` (A), `INFRA-01` (A) — GPU Infrastructure & High-Performance Hardware

---

## Module 1 — Architecture Matérielle GPU & CUDA Programming Model (2h)

### 📖 Intuition & Narration

Alors qu'un processeur central (CPU) possède de 8 à 64 cœurs très puissants et optimisés pour le calcul séquentiel complexe à faible latence, un processeur graphique (GPU) est un **monstre de parallélisme massif** regroupant des milliers de petits cœurs optimisés pour l'exécution simultanée d'opérations identiques sur des flots de données (**SIMT — Single Instruction, Multiple Threads**).

En Deep Learning, où chaque couche d'un réseau effectue des multiplications matricielles massives, le GPU offre un facteur d'accélération de $10\times$ à $100\times$ par rapport au CPU.

### 🔍 Anatomie Technique — Modèle d'Exécution CUDA & Tensor Cores

```
HIÉRARCHIE D'EXÉCUTION MATÉRIELLE ET LOGICIELLE CUDA

  LOGICIEL (CUDA Thread Hierarchy)   │  MATÉRIEL (NVIDIA GPU Architecture)
  ───────────────────────────────────┼────────────────────────────────────
  Grid                               │  GPU Complet (ex: H100 SXM5)
    └── Block                        │    └── Streaming Multiprocessor (SM)
          └── Warp (32 Threads)      │          ├── Warp Scheduler
                └── Thread           │          ├── CUDA Cores (FP32 / INT8)
                                     │          └── Tensor Cores (FP16 / BF16 / FP8)

ROUTINE TENSOR CORES (HMMA / MMA) :
  Les Tensor Cores sont des unités matérielles spécialisées qui exécutent l'opération
  matricielle D = A * B + C sur des sous-matrices 4x4 ou 16x16 en UN SEUL CYCLE D'HORLOGE !
```

---

## Module 2 — Atelier Pratique : Gradient Accumulation & Diagnostic GPU en PyTorch (2h)

### 🛠️ Code PyTorch : Gradient Accumulation & Monitoring NVML / PyTorch CUDA

```python
#!/usr/bin/env python3
"""
PARADIS — Implémentation du Gradient Accumulation et Diagnostic d'Infrastructure GPU
Simulation d'un grand batch size (ex: 128) avec une VRAM limitée en accumulant les gradients.
"""

import torch
import torch.nn as nn

def run_gradient_accumulation_demo():
    print("[*] --- DÉMONSTRATION GRADIENT ACCUMULATION PARADIS IT ---")

    # 1. Vérification des capacités matérielles CUDA
    cuda_available = torch.cuda.is_available()
    device = torch.device("cuda" if cuda_available else "cpu")

    print(f"[+] CUDA Disponible : {cuda_available}")
    if cuda_available:
        print(f"    GPU Actif       : {torch.cuda.get_device_name(0)}")
        print(f"    Nombre de GPUs  : {torch.cuda.device_count()}")
        print(f"    Capacité Mémoire: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")

    # 2. Simulation de Gradient Accumulation
    # Objectif : Batch Size Effectif = 64, mais la VRAM ne supporte qu'un Micro-Batch Size = 16
    effective_batch_size = 64
    micro_batch_size = 16
    accumulation_steps = effective_batch_size // micro_batch_size  # 4 étapes

    print(f"\n[*] Configuration Gradient Accumulation :")
    print(f"    • Effective Batch Size : {effective_batch_size}")
    print(f"    • Micro-Batch Size     : {micro_batch_size}")
    print(f"    • Accumulation Steps   : {accumulation_steps}")

    # Modèle et Données Fictifs
    model = nn.Linear(512, 10).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)
    criterion = nn.CrossEntropyLoss()

    optimizer.zero_grad()  # Réinitialiser les gradients avant la boucle d'accumulation

    for step in range(accumulation_steps):
        # Données du micro-batch
        inputs = torch.randn(micro_batch_size, 512).to(device)
        targets = torch.randint(0, 10, (micro_batch_size,)).to(device)

        # Forward Pass
        outputs = model(inputs)
        # DIVISER LA PERTE PAR ACCUMULATION_STEPS ! (indispensable pour l'équivalence exacte des gradients)
        loss = criterion(outputs, targets) / accumulation_steps

        # Backward Pass (Les gradients s'accumulent dans param.grad avec '+=' !)
        loss.backward()

        print(f"    • Step {step+1}/{accumulation_steps} : Micro-Loss = {loss.item() * accumulation_steps:.4f} (Gradients accumulés)")

    # Mise à jour effective des poids UNE SEULE FOIS après N accumulation steps
    optimizer.step()
    optimizer.zero_grad()

    print("[+] Optimizer Step exécuté avec succès après 4 micro-batches !")
    print("  ✅ Le comportement est STRICTEMENT ÉQUIVALENT à un unique batch de 64 sans OOM !")

if __name__ == "__main__":
    run_gradient_accumulation_demo()
```

---

## Module 3 — Communications Multi-GPUs : NVLink & NCCL AllReduce (1h30)

### 🔍 Architecture d'Interconnexion Multi-GPUs (NVLink, NVSwitch & NCCL)

```
SCHÉMA DE COMMUNICATEUR MULTI-GPU (NCCL ALLREDUCE)

  [ GPU 0 ] ─── NVLink (900 GB/s) ─── [ GPU 1 ]
     │                                   │
  NVSwitch (Réseau d'interconnexion bidirectionnel non-bloquant)
     │                                   │
  [ GPU 2 ] ─── NVLink (900 GB/s) ─── [ GPU 3 ]

OPÉRATION COLLECTIVE NCCL ALLREDUCE (Ring-AllReduce) :
  Chaque GPU possède son gradient local G_i.
  AllReduce combine tous les gradients par somme et distribue le résultat final G_total à tous les GPUs :

  G_total = ∑_{i=0}^{N-1} G_i  (Disponible sur tous les GPUs à la fin de l'opération)

  - Ring-AllReduce effectue cette synchronisation en 2*(N-1) étapes de communication.
  - Bande passante maximale atteinte grâce au protocole NCCL (NVIDIA Collective Communications Library).
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SM** | Streaming Multiprocessor — Unité de calcul principale d'un GPU NVIDIA regroupant cœurs et mémoires |
| **NCCL** | NVIDIA Collective Communications Library — Bibliothèque d'opérations de communication multi-GPUs |
| **NVLink** | Interconnexion filaire propriétaire haute vitesse entre GPUs NVIDIA (jusqu'à 900 GB/s) |
| **SIMT** | Single Instruction, Multiple Threads — Modèle d'exécution parallèle des processeurs graphiques |
| **Warp** | Groupe indivisible de 32 threads CUDA exécutés simultanément par un SM |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Facteur d'Accumulation de Gradient

Un modèle LLM de 7B paramètres exige une VRAM de $16\text{ GB}$ par micro-batch de 2 séquences. La taille de batch globale cible recommandée pour assurer la convergence de l'apprentissage est de $128$ séquences. L'infrastructure dispose de $4$ GPUs NVIDIA RTX 4090 (24GB VRAM).
1. Quelle est la taille de micro-batch globale maximale traitée en parallèle par les 4 GPUs simultanément si chaque GPU prend 2 séquences ?
2. Combien d'étapes de **Gradient Accumulation** (`accumulation_steps`) devez-vous configurer dans votre script de formation pour atteindre la taille de batch globale de 128 ?

**Corrigé guidé :**
1. **Micro-batch global parallèle** :
   $4 \text{ GPUs} \times 2 \text{ séquences/GPU} = 8 \text{ séquences/pas}$.
2. **Nombre d'étapes d'accumulation** :
   $$\text{accumulation\_steps} = \frac{\text{Batch Size Cible}}{\text{Micro-batch Global}} = \frac{128}{8} = 16 \text{ étapes}.$$
   Il faut accumuler les gradients pendant **16 micro-pas** avant d'exécuter `optimizer.step()`.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la différence d'architecture principale entre un **CPU** et un **GPU** ?

- A) Le CPU n'a pas de mémoire cache.
- B) Le CPU possède peu de cœurs puissants optimisés pour l'exécution séquentielle, tandis que le GPU possède des milliers de petits cœurs (SIMT) optimisés pour le traitement parallèle massif. ✅
- C) Le GPU ne sait pas faire d'additions.
- D) Le CPU est plus rapide pour multiplier des matrices géantes.

**Q2.** Dans l'architecture matérielle NVIDIA CUDA, qu'est-ce qu'un **Warp** ?

- A) Un câble de connexion réseau.
- B) Le groupe minimal et indivisible de 32 threads CUDA exécutés de manière strictement synchrone par un Streaming Multiprocessor (SM). ✅
- C) Une erreur d'overflow mémoire.
- D) Un format d'image compressé.

**Q3.** À quoi sert la technique du **Gradient Accumulation** en Deep Learning ?

- A) À réduire le temps d'entraînement par 10.
- B) À simuler une taille de batch globale importante sans provoquer d'erreur Out-Of-Memory (OOM) en accumulant les gradients de plusieurs petits micro-batches avant de mettre à jour les poids. ✅
- C) À effacer la mémoire VRAM après chaque couche.
- D) À convertir les poids en INT4.

**Q4.** Pourquoi la division de la perte par le nombre d'étapes d'accumulation (`loss = loss / accumulation_steps`) est-elle obligatoire lors du Gradient Accumulation ?

- A) Pour éviter d'afficher des nombres trop grands dans la console.
- B) Parce que les gradients s'additionnent (`+=`) à chaque pas rétrograde ; diviser la perte garantit que la somme des gradients accumulés est exactement égale à la moyenne du grand batch. ✅
- C) Pour réduire l'utilisation du processeur.
- D) C'est une convention optionnelle sans impact mathématique.

**Q5.** Quelle bibliothèque NVIDIA est utilisée par PyTorch (via DDP) pour exécuter des opérations de communication collectives ultra-rapides (**AllReduce, AllGather**) entre plusieurs GPUs via NVLink ?

- A) OpenCV
- B) NCCL (NVIDIA Collective Communications Library) ✅
- C) CuDNN
- D) SQLite

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
