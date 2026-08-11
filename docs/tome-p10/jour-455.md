# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 455 (6h) : Large Language Models (LLMs) : Architecture GPT/LLaMA, Tokenisation BPE, Inférence (Sampling Strategies) & Quantisation (GPTQ, AWQ, GGUF)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre l'architecture interne d'un LLM moderne (LLaMA 3, Mistral) : RoPE, GQA, SwiGLU, RMSNorm
> - Maîtriser la **tokenisation BPE (Byte Pair Encoding)** et son rôle dans la représentation du vocabulaire
> - Implémenter et comparer les stratégies d'**inférence** : Greedy, Beam Search, Température, Top-k, Top-p (Nucleus Sampling)
> - Déployer un LLM quantisé (GGUF/AWQ) avec **llama.cpp** et **vLLM** pour une production à coût réduit
>
> **Compétences visées :** `AI-02` (A) — LLM Architecture & Inference

---

## Module 1 — Architecture LLM Moderne (LLaMA 3) (2h)

### 📖 Intuition & Narration

Les LLMs modernes (LLaMA 3, Mistral 7B, Gemma 2) améliorent l'architecture Transformer originale de 2017 avec plusieurs innovations clés qui améliorent l'efficacité et la performance.

### 🔍 Anatomie Technique — Innovations LLaMA 3 vs Transformer Original

```
ÉVOLUTION TRANSFORMER (2017) → LLAMA 3 (2024)

  TRANSFORMER ORIGINAL      │  LLAMA 3
  ──────────────────────────│──────────────────────────────────
  Post-LN (LayerNorm après) │  Pre-RMSNorm (avant, RMSNorm)
  Attention MHA standard    │  GQA (Grouped Query Attention)
  Activation ReLU           │  SwiGLU (Swish-Gated Linear Unit)
  Positional Encoding sinus.│  RoPE (Rotary Position Embedding)
  Softmax Attention O(n²)   │  FlashAttention-2 (mémoire O(n))
  Vocabulaire ~32K tokens   │  128K tokens (meilleur couvrage multilingue)
  4096 tokens context       │  128K tokens context (LLaMA 3.1)

RoPE (Rotary Position Embedding) :
  ──▶ Encode la POSITION RELATIVE entre tokens via une rotation dans l'espace complexe
  ──▶ Extrapolation meilleure à de longues séquences vs PE sinusoïdal absolu

GQA (Grouped Query Attention) :
  ──▶ Plusieurs Query Heads partagent les mêmes Key/Value Heads
  ──▶ Réduit la mémoire KV-Cache de ~8x sans perte de qualité significative
  ──▶ Crucial pour l'inférence haute performance

SwiGLU :
  ──▶ FFN(x) = (xW₁ ⊙ SiLU(xW₃)) @ W₂  (3 matrices au lieu de 2)
  ──▶ +1% de perplexité en moins vs ReLU
```

---

## Module 2 — Tokenisation BPE & Stratégies d'Inférence (2h)

### 🛠️ Atelier — Implémentation BPE Simplifiée

```python
#!/usr/bin/env python3
"""PARADIS — Implémentation pédagogique de Byte Pair Encoding (BPE)"""
from collections import Counter, defaultdict

def get_vocab(corpus: list[str]) -> dict:
    """Construire le vocabulaire initial au niveau caractères"""
    vocab = Counter()
    for word in corpus:
        word_chars = ' '.join(list(word)) + ' </w>'
        vocab[word_chars] += 1
    return dict(vocab)

def get_pair_freqs(vocab: dict) -> dict:
    """Compter la fréquence de toutes les paires de symboles consécutifs"""
    pairs = defaultdict(int)
    for word, freq in vocab.items():
        symbols = word.split()
        for i in range(len(symbols) - 1):
            pairs[(symbols[i], symbols[i+1])] += freq
    return dict(pairs)

def merge_vocab(pair: tuple, vocab: dict) -> dict:
    """Fusionner la paire la plus fréquente"""
    new_vocab = {}
    bigram = ' '.join(pair)
    replacement = ''.join(pair)
    for word, freq in vocab.items():
        new_word = word.replace(bigram, replacement)
        new_vocab[new_word] = freq
    return new_vocab

# Corpus de démonstration
corpus = ['bonjour', 'bonsoir', 'bonheur', 'bond', 'bon', 'jour', 'soir']
vocab = get_vocab(corpus)
print("Vocabulaire initial :", list(vocab.keys())[:3], "...")

# 10 étapes BPE
merges = []
for step in range(10):
    pairs = get_pair_freqs(vocab)
    if not pairs:
        break
    best_pair = max(pairs, key=pairs.get)
    vocab = merge_vocab(best_pair, vocab)
    merges.append(best_pair)
    print(f"  Étape {step+1:2d} : Fusion {best_pair} (freq={pairs[best_pair]})")

print("\nVocabulaire final :", list(vocab.keys())[:4])
```

### 🔍 Anatomie — Stratégies d'Inférence

```python
import torch
import torch.nn.functional as F

def greedy_decode(logits: torch.Tensor) -> int:
    """Sélection déterministe du token le plus probable"""
    return logits.argmax().item()

def temperature_sampling(logits: torch.Tensor, temperature: float = 0.7) -> int:
    """
    T→0 : Déterministe (greedy), T→∞ : Uniforme (aléatoire)
    T=0.7 : Créativité modérée, T=1.5 : Très créatif/aléatoire
    """
    scaled = logits / temperature
    probs  = F.softmax(scaled, dim=-1)
    return torch.multinomial(probs, num_samples=1).item()

def nucleus_sampling(logits: torch.Tensor, p: float = 0.9, temperature: float = 0.8) -> int:
    """
    Top-p (Nucleus) : Ne garde que les tokens formant les p% de probabilité cumulée
    Dynamiquement adaptatif : plus tokens si distribution plate, moins si piquée
    """
    scaled = F.softmax(logits / temperature, dim=-1)
    sorted_probs, sorted_indices = torch.sort(scaled, descending=True)
    cumsum = torch.cumsum(sorted_probs, dim=0)
    # Masquer les tokens au-delà du noyau p
    mask = cumsum - sorted_probs > p
    sorted_probs[mask] = 0.0
    sorted_probs /= sorted_probs.sum()
    selected = sorted_indices[torch.multinomial(sorted_probs, 1)]
    return selected.item()

# Démonstration avec logits fictifs
demo_logits = torch.tensor([3.0, 1.5, 0.8, 0.5, 0.2, -0.5, -1.0, -2.0])
vocab_demo  = ["Paris", "Lyon", "Nice", "Bordeaux", "Marseille", "Nantes", "Rennes", "Strasbourg"]

torch.manual_seed(42)
print("Greedy      :", vocab_demo[greedy_decode(demo_logits)])
print("Temperature :", vocab_demo[temperature_sampling(demo_logits, T := 0.7)])
print("Nucleus p=0.9:", vocab_demo[nucleus_sampling(demo_logits, p=0.9)])
```

---

## Module 3 — Quantisation LLM & Déploiement avec llama.cpp (1h30)

### 🔍 Anatomie — Types de Quantisation

```
QUANTISATION LLM : RÉDUCTION TAILLE ET MÉMOIRE

  PRÉCISION ORIGINALE :
  FP32 : 4 bytes/poids → Llama-3-8B = 32 GB (impraticable sur GPU grand public)
  BF16 : 2 bytes/poids → 16 GB (minibatch A100/H100)
  FP16 : 2 bytes/poids → 16 GB

  QUANTISATION POST-TRAINING (PTQ) :
  INT8 (Q8_0) : 1 byte/poids  → 8 GB  (légère perte)
  INT4 (Q4_K_M): 0.5 byte    → 4.5 GB (perte acceptable ~1-2% sur benchmarks)
  INT3 (Q3_K_S): 0.375 byte  → 3.5 GB (perte notable)

  FORMATS DE FICHIERS :
  GGUF (llama.cpp) : Format multi-plateforme, CPU/GPU hybride
  GPTQ             : Quantisation basée sur le Hessian, GPU-only
  AWQ              : Activation-Aware Weight Quantization, meilleur rapport qualité/taille

  DÉPLOIEMENT GGUF avec llama.cpp :
  ./llama-cli -m Meta-Llama-3-8B-Instruct.Q4_K_M.gguf \
    -n 512 \          # max new tokens
    --ctx-size 8192 \ # taille du contexte
    --n-gpu-layers 33 # 33 couches sur GPU, reste sur CPU
    -p "Tu es un assistant PARADIS IT expert. Explique le chiffrement AES-256 :"
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **BPE** | Byte Pair Encoding — Algorithme de tokenisation sous-mot utilisé dans GPT-2/3/4 et LLaMA |
| **RoPE** | Rotary Position Embedding — Encodage de position rotatif pour les LLMs modernes |
| **GQA** | Grouped Query Attention — Variante de MHA partageant les K/V entre plusieurs Query heads |
| **SwiGLU** | Swish-Gated Linear Unit — Activation non-linéaire de la FFN dans les LLMs modernes |
| **GGUF** | GGML Unified Format — Format de fichier pour les LLMs quantisés déployés avec llama.cpp |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Mémoire LLM

Calculez la mémoire GPU requise pour un modèle LLaMA-3-70B en :
1. BF16 (2 bytes/paramètre)
2. Q4_K_M GGUF (~4.5 bits/paramètre)
3. Combien de A100 80GB faut-il pour chaque cas ?

**Corrigé guidé :**
1. BF16 : $70 \times 10^9 \times 2 \text{ bytes} = 140 \text{ GB}$ → **2 A100 80GB** minimum.
2. Q4_K_M : $70 \times 10^9 \times 0.5625 \text{ bytes} = 39.4 \text{ GB}$ → **1 A100 80GB** suffit (avec 40 GB disponible pour le KV-cache et les activations).

---

## Banque QCM — 5 Questions

**Q1.** Le **Nucleus Sampling (Top-p)** se distingue du **Top-k** car :

- A) Il sélectionne toujours les k=10 tokens les plus probables
- B) Il sélectionne dynamiquement un ensemble variable de tokens dont les probabilités cumulées atteignent p, s'adaptant à la diversité de la distribution ✅
- C) Il utilise une température fixée à 1.0
- D) Il requiert un Beam Search pour fonctionner

**Q2.** Dans **RoPE (Rotary Position Embedding)**, la position est encodée par :

- A) L'addition d'un vecteur de position absolu aux embeddings d'entrée
- B) Une rotation des vecteurs Q et K dans l'espace complexe, encodant la position relative entre tokens sans dépendre de la longueur maximale de contexte ✅
- C) Un index entier ajouté au score d'attention
- D) Un masque binaire appliqué sur les tokens futurs

**Q3.** La **Grouped Query Attention (GQA)** réduit principalement :

- A) Le nombre de paramètres de la couche FFN
- B) La taille du KV-Cache (Key-Value Cache) lors de l'inférence en partageant les projections K et V entre plusieurs Query heads ✅
- C) Le temps de compilation CUDA du modèle
- D) La taille des embeddings d'entrée

**Q4.** Une température d'inférence $T \to 0$ produit :

- A) Un échantillonnage totalement aléatoire et créatif
- B) Une sélection déterministe du token le plus probable à chaque étape (équivalent au Greedy Decoding) ✅
- C) Une distribution uniforme sur tous les tokens du vocabulaire
- D) Une augmentation du perplexité du modèle

**Q5.** Le format **GGUF** est préféré au format PyTorch natif (.pt) pour l'inférence LLM locale car :

- A) GGUF compresse davantage les poids grâce à l'encodage Huffman
- B) GGUF supporte la quantisation multi-précision, le déploiement CPU/GPU hybride, et est consommable par llama.cpp sans installation de PyTorch/CUDA ✅
- C) GGUF chiffre les poids du modèle par AES-256
- D) GGUF permet d'entraîner des modèles sans GPU

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
