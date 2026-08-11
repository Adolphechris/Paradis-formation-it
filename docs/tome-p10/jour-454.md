# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 454 (6h) : Transformers & Self-Attention : Architecture Originale, Multi-Head Attention, Positional Encoding, BERT vs GPT

> [!NOTE]
> **Objectifs pédagogiques :**
> - Dériver et implémenter l'opération de **Self-Attention** (Scaled Dot-Product Attention) en NumPy et PyTorch
> - Maîtriser l'architecture complète du **Transformer** (Vaswani et al. 2017) : Encoder, Decoder, Multi-Head Attention, FFN, Layer Norm
> - Comprendre le **Positional Encoding** et pourquoi il est indispensable (le Transformer est invariant à l'ordre sans lui)
> - Analyser les différences architecturales et d'usage entre **BERT** (Encoder-only, compréhension) et **GPT** (Decoder-only, génération)
>
> **Compétences visées :** `AI-01` (A) — Transformer Architecture, `AI-02` (A) — Pré-entraînement LLM

---

## Module 1 — Self-Attention : Dérivation Mathématique & Implémentation (2h)

### 📖 Intuition & Narration

L'**Attention** permet à chaque token d'une séquence de "regarder" tous les autres tokens pour construire sa représentation contextuelle. La phrase "La banque a débordé" est ambiguë : le mot "banque" a-t-il pour contexte "argent" ou "fleuve" ? L'attention résout cela en pondérant l'importance de chaque autre token.

### 🔍 Anatomie — Scaled Dot-Product Attention

```
SCALED DOT-PRODUCT ATTENTION

  Entrée : Séquence X de shape (seq_len, d_model)

  1. Projections linéaires :
     Q = X @ W_Q    (Queries  — Ce que je cherche)
     K = X @ W_K    (Keys     — Ce que je peux offrir)
     V = X @ W_V    (Values   — Ce que je fournis)

  2. Calcul des scores d'attention :
     scores = Q @ K^T / sqrt(d_k)   ← Division pour stabiliser les gradients (grand d_k)

  3. Masquage (optionnel pour Decoder) :
     scores = scores.masked_fill(mask, -inf)  ← Empêche de voir le futur

  4. Softmax → Poids d'attention :
     weights = softmax(scores)   ← Shape : (seq_len, seq_len)

  5. Sortie pondérée :
     output = weights @ V        ← Shape : (seq_len, d_v)

  COMPLEXITÉ : O(n²·d) ── Quadratique en longueur de séquence !
  ──▶ Problème pour les très longues séquences (>4096 tokens)
  ──▶ Solutions modernes : FlashAttention, Sparse Attention, Mamba (SSM)
```

### 🛠️ Atelier Pratique — Multi-Head Self-Attention en PyTorch

```python
#!/usr/bin/env python3
"""
PARADIS — Implémentation Multi-Head Self-Attention en PyTorch (from scratch)
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class MultiHeadSelfAttention(nn.Module):
    def __init__(self, d_model: int, n_heads: int, dropout: float = 0.1):
        super().__init__()
        assert d_model % n_heads == 0
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k     = d_model // n_heads  # Dimension par tête

        # Projections Q, K, V et Out (combinées pour efficacité)
        self.W_qkv = nn.Linear(d_model, 3 * d_model, bias=False)
        self.W_out = nn.Linear(d_model, d_model, bias=False)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x: torch.Tensor, mask: torch.Tensor = None) -> torch.Tensor:
        B, T, C = x.shape  # (Batch, SeqLen, d_model)

        # Projection Q, K, V en une seule multiplication matricielle
        qkv = self.W_qkv(x)              # (B, T, 3*d_model)
        Q, K, V = qkv.split(self.d_model, dim=-1)  # Chacun : (B, T, d_model)

        # Reshape pour Multi-Head : (B, T, d_model) → (B, n_heads, T, d_k)
        def split_heads(tensor):
            return tensor.view(B, T, self.n_heads, self.d_k).transpose(1, 2)

        Q, K, V = split_heads(Q), split_heads(K), split_heads(V)

        # Scaled Dot-Product Attention
        scores = (Q @ K.transpose(-2, -1)) / math.sqrt(self.d_k)  # (B, heads, T, T)

        if mask is not None:
            scores = scores.masked_fill(mask == 0, float('-inf'))

        weights = F.softmax(scores, dim=-1)
        weights = self.dropout(weights)
        context = weights @ V  # (B, heads, T, d_k)

        # Recombinaison des têtes
        context = context.transpose(1, 2).contiguous().view(B, T, self.d_model)
        return self.W_out(context)

# Test
d_model, n_heads, seq_len, batch = 512, 8, 32, 4
mhsa = MultiHeadSelfAttention(d_model=d_model, n_heads=n_heads)
x = torch.randn(batch, seq_len, d_model)
out = mhsa(x)
print(f"Input  : {x.shape}    →    Output : {out.shape}")
print(f"d_k par tête : {d_model // n_heads}")
params = sum(p.numel() for p in mhsa.parameters())
print(f"Paramètres MHSA : {params:,}")
```

---

## Module 2 — Transformer Complet : Encoder-Decoder & Positional Encoding (2h)

### 🛠️ Atelier — Encoder Transformer Complet

```python
#!/usr/bin/env python3
"""PARADIS — Bloc Encoder Transformer complet (Pre-LN moderne)"""
import torch
import torch.nn as nn
import math

class PositionalEncoding(nn.Module):
    def __init__(self, d_model: int, max_len: int = 5000, dropout: float = 0.1):
        super().__init__()
        self.dropout = nn.Dropout(dropout)

        # Encodage sinusoïdal : PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
        pe = torch.zeros(max_len, d_model)
        pos = torch.arange(0, max_len).unsqueeze(1).float()
        div = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(pos * div)
        pe[:, 1::2] = torch.cos(pos * div)
        self.register_buffer('pe', pe.unsqueeze(0))  # (1, max_len, d_model)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.dropout(x + self.pe[:, :x.size(1)])

class TransformerEncoderBlock(nn.Module):
    def __init__(self, d_model=512, n_heads=8, d_ff=2048, dropout=0.1):
        super().__init__()
        self.attn  = nn.MultiheadAttention(d_model, n_heads, dropout=dropout, batch_first=True)
        self.ff    = nn.Sequential(
            nn.Linear(d_model, d_ff), nn.GELU(), nn.Dropout(dropout),
            nn.Linear(d_ff, d_model), nn.Dropout(dropout)
        )
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Pre-LN (moderne) : LayerNorm avant attention et FFN
        attn_out, _ = self.attn(self.norm1(x), self.norm1(x), self.norm1(x))
        x = x + attn_out                           # Residual
        x = x + self.ff(self.norm2(x))             # Residual + FFN
        return x

# Encoder complet à 6 couches (comme le Transformer original)
pe = PositionalEncoding(d_model=512)
encoder = nn.Sequential(*[TransformerEncoderBlock() for _ in range(6)])

dummy = torch.randn(2, 64, 512)   # (batch=2, seq_len=64, d_model=512)
encoded = encoder(pe(dummy))
print(f"Encoder output : {encoded.shape}")
```

---

## Module 3 — BERT vs GPT : Différences Architecturales & Usages (1h30)

### 🔍 Tableau Comparatif BERT vs GPT

```
BERT (Bidirectional Encoder Representations from Transformers — Google 2018)
  ├── Architecture : Encoder-Only (accès à tout le contexte)
  ├── Pré-entraînement : MLM (Masked Language Model) — prédit les tokens masqués
  │   Ex: "Le [MASK] est bleu" ──▶ "ciel"
  ├── Attention : Bidirectionnelle (voit passé ET futur)
  ├── Usage : Classification, NER, Question Answering, embeddings
  └── Limitations : Ne génère PAS de texte naturellement

GPT (Generative Pre-trained Transformer — OpenAI 2018)
  ├── Architecture : Decoder-Only (attention causale — voit uniquement le passé)
  ├── Pré-entraînement : CLM (Causal Language Model) — prédit le prochain token
  │   Ex: "Le ciel est" ──▶ "bleu"
  ├── Attention : Causale (masque le futur) ──▶ Autorégressif
  ├── Usage : Génération de texte, complétion, chatbot, code
  └── Limitations : Compréhension contextuelle bidirectionnelle plus faible

T5, BART : Encoder-Decoder ──▶ Traduction, Résumé, Reformulation
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MHSA** | Multi-Head Self-Attention — Attention parallèle avec plusieurs "têtes" capturant différents aspects |
| **PE** | Positional Encoding — Injection de l'information de position dans les embeddings |
| **MLM** | Masked Language Model — Objectif pré-entraînement BERT : prédire les tokens masqués |
| **CLM** | Causal Language Model — Objectif pré-entraînement GPT : prédire le token suivant |
| **d_ff** | Dimension de la couche Feed-Forward intermédiaire (typiquement 4×d_model) |

---

## Exercices Pratiques

### Exercice 1 — Calcul des Poids d'Attention

Avec $d_k = 4$ et une séquence de 3 tokens, les scores de query-key sont : $[8.0, 2.0, -1.0]$.

Calculez les poids d'attention après la division par $\sqrt{d_k}$ et l'application du softmax.

**Corrigé guidé :**
Scores scalés : $[8.0/2, 2.0/2, -1.0/2] = [4.0, 1.0, -0.5]$

$e^{4.0} = 54.60$, $e^{1.0} = 2.72$, $e^{-0.5} = 0.607$

Somme = $57.93$

Poids d'attention : $[54.60/57.93, 2.72/57.93, 0.607/57.93] \approx [0.942, 0.047, 0.010]$

Le premier token reçoit **94.2%** de l'attention — le mécanisme sélectionne fortement le token le plus pertinent.

---

## Banque QCM — 5 Questions

**Q1.** La division par $\sqrt{d_k}$ dans l'attention sert à :

- A) Normaliser les embeddings entre 0 et 1
- B) Éviter que les scores de dot-product deviennent trop grands dans des espaces de haute dimension, ce qui ferait saturer le softmax et annulerait le gradient ✅
- C) Convertir les Q, K, V en probabilités
- D) Réduire la complexité computationnelle de O(n²) à O(n log n)

**Q2.** Le **Positional Encoding sinusoïdal** est nécessaire car :

- A) Le Transformer est un RNN qui nécessite des positions temporelles
- B) L'attention Self-Attention est invariante à la permutation des tokens (elle ne voit pas l'ordre), donc le PE injecte l'information de position dans les embeddings ✅
- C) NumPy ne supporte pas les indices entiers
- D) Le GPU ne peut pas traiter des séquences sans identifiants de position

**Q3.** L'attention **causale (masquée)** dans GPT empêche chaque token de :

- A) Être traité en parallèle sur GPU
- B) Voir les tokens qui le suivent dans la séquence, assurant que la génération est autoregressive (le token $t$ dépend uniquement de $t-1, t-2, ..., t_0$) ✅
- C) Utiliser un embedding de haute dimension
- D) Interagir avec la couche Feed-Forward

**Q4.** Dans l'architecture Transformer originale, la couche Feed-Forward est composée de :

- A) Une convolution 1D suivie d'un Max Pooling
- B) Deux couches linéaires avec une activation non-linéaire (ReLU original, GELU moderne) : $FFN(x) = \max(0, xW_1+b_1)W_2+b_2$ ✅
- C) Une attention multi-tête avec 16 têtes
- D) Une couche de Batch Normalization seule

**Q5.** BERT utilise la **Masked Language Modeling (MLM)** comme objectif de pré-entraînement car :

- A) GPT n'existe pas encore en 2018
- B) Masquer 15% des tokens et les prédire force le modèle à utiliser le contexte bidirectionnel (gauche et droite) pour comprendre la langue, contrairement au CLM unidirectionnel ✅
- C) MLM est plus rapide que CLM sur GPU
- D) Le masquage remplace la nécessité d'un Positional Encoding

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
