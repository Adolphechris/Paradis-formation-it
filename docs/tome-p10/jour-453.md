# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 453 (6h) : RNN, LSTM & GRU : Modélisation des Séquences — Vanishing Gradient, Portes LSTM, Applications NLP & Time Series

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre le problème du **vanishing gradient** dans les RNN classiques et pourquoi il rend l'apprentissage de longues dépendances impossible
> - Maîtriser l'architecture des **LSTM (Long Short-Term Memory)** : les 4 portes (Input, Forget, Output, Cell State)
> - Implémenter un LSTM pour la **classification de séquences de logs** (détection d'anomalies) en PyTorch
> - Appliquer les **GRU (Gated Recurrent Units)** comme alternative allégée aux LSTM pour les séries temporelles
>
> **Compétences visées :** `AI-01` (A) — Sequence Modeling & Recurrent Networks

---

## Module 1 — RNN Classique & Le Problème du Vanishing Gradient (2h)

### 📖 Intuition & Narration

Un Réseau de Neurones Récurrent (RNN) traite les séquences en maintenant un **état caché** $h_t$ qui résume l'historique des tokens passés. À chaque pas de temps $t$, il combine l'entrée courante $x_t$ et l'état passé $h_{t-1}$ pour produire le nouvel état $h_t$.

Mais les RNN classiques souffrent d'un défaut fondamental : lors de la rétropropagation à travers le temps (BPTT), les gradients sont multipliés par la matrice de poids $W_{hh}$ à chaque pas de temps. Si les valeurs propres de $W_{hh}$ sont inférieures à 1, le gradient **disparaît exponentiellement** avec la longueur de la séquence. Si elles sont supérieures à 1, il **explose**.

### 🔍 Anatomie Technique — Équations RNN vs LSTM

```
RNN CLASSIQUE :
  h_t = tanh(W_xh * x_t + W_hh * h_{t-1} + b_h)
  y_t = W_hy * h_t + b_y

  PROBLÈME : ∂L/∂h_0 = ∏_{t=1}^{T} ∂h_t/∂h_{t-1}
  = ∏_{t=1}^{T} (diag(1 - tanh²(z_t)) * W_hh)
  ──▶ Si ||W_hh|| < 1 : gradient → 0 pour T grand (vanishing)
  ──▶ Si ||W_hh|| > 1 : gradient → ∞ (exploding)

LSTM (Long Short-Term Memory) :
  f_t = σ(W_f * [h_{t-1}, x_t] + b_f)  ← Forget Gate : quoi oublier ?
  i_t = σ(W_i * [h_{t-1}, x_t] + b_i)  ← Input Gate  : quoi stocker ?
  g_t = tanh(W_g * [h_{t-1}, x_t] + b_g) ← Candidate cell
  o_t = σ(W_o * [h_{t-1}, x_t] + b_o)  ← Output Gate : quoi lire ?
  C_t = f_t ⊙ C_{t-1} + i_t ⊙ g_t     ← Cell State  : mémoire long-terme
  h_t = o_t ⊙ tanh(C_t)               ← Hidden State : mémoire court-terme

  CLÉ : C_t = f_t ⊙ C_{t-1} + i_t ⊙ g_t
  ──▶ Le Cell State C_t est une somme, pas un produit !
  ──▶ Les gradients peuvent traverser de longues séquences sans disparaître.
```

### 🛠️ Atelier Pratique — LSTM pour Détection d'Anomalies Réseau

```python
#!/usr/bin/env python3
"""
PARADIS — LSTM pour Classification de Séquences de Logs Réseau
Détection d'anomalies dans des séquences de codes de statut HTTP
"""

import torch
import torch.nn as nn
import numpy as np

# Vocabulaire des codes HTTP
STATUS_CODES = {200: 0, 301: 1, 302: 2, 400: 3, 401: 4,
                403: 5, 404: 6, 429: 7, 500: 8, 503: 9}
NORMAL, ANOMALY = 0, 1

class AnomalyLSTM(nn.Module):
    def __init__(self, vocab_size: int, embed_dim: int, hidden_dim: int, num_layers: int = 2):
        super().__init__()
        self.embedding  = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm       = nn.LSTM(embed_dim, hidden_dim, num_layers=num_layers,
                                   batch_first=True, dropout=0.3, bidirectional=True)
        self.attention  = nn.Linear(hidden_dim * 2, 1)
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim * 2, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 2)  # NORMAL ou ANOMALY
        )

    def forward(self, x):
        # x : (batch, seq_len)
        embedded = self.embedding(x)                    # (batch, seq, embed_dim)
        lstm_out, _ = self.lstm(embedded)               # (batch, seq, hidden*2)

        # Attention mechanism : pondérer les tokens importants
        attn_weights = torch.softmax(self.attention(lstm_out), dim=1)  # (batch, seq, 1)
        context = (attn_weights * lstm_out).sum(dim=1)                 # (batch, hidden*2)

        return self.classifier(context)

# Données synthétiques
def generate_sequences(n_samples: int = 500, seq_len: int = 20):
    seqs, labels = [], []
    for _ in range(n_samples):
        is_anomaly = np.random.random() < 0.3
        if is_anomaly:
            # Séquence d'attaque brute-force : beaucoup de 401/403
            codes = np.random.choice([4, 5, 3], size=seq_len, p=[0.6, 0.3, 0.1])
        else:
            # Trafic normal : 200 dominant, quelques 301/404
            codes = np.random.choice([0, 1, 6, 3], size=seq_len, p=[0.8, 0.1, 0.08, 0.02])
        seqs.append(codes)
        labels.append(1 if is_anomaly else 0)
    return torch.tensor(seqs, dtype=torch.long), torch.tensor(labels)

X, y = generate_sequences()
model = AnomalyLSTM(vocab_size=len(STATUS_CODES), embed_dim=16, hidden_dim=64)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
criterion = nn.CrossEntropyLoss()

# Entraînement rapide
model.train()
for epoch in range(50):
    logits = model(X)
    loss = criterion(logits, y)
    optimizer.zero_grad()
    loss.backward()
    nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)  # Gradient clipping
    optimizer.step()
    if epoch % 10 == 0:
        acc = (logits.argmax(1) == y).float().mean()
        print(f"Époque {epoch:3d} | Perte : {loss.item():.4f} | Précision : {acc.item()*100:.1f}%")

print("✅ LSTM Anomaly Detection entraîné")
```

---

## Module 2 — GRU : Alternative Allégée au LSTM (2h)

### 🔍 Anatomie Technique — Équations GRU

```
GRU (Gated Recurrent Unit — Cho et al. 2014)

  z_t = σ(W_z * [h_{t-1}, x_t])   ← Update Gate  (combinaison de Forget + Input)
  r_t = σ(W_r * [h_{t-1}, x_t])   ← Reset Gate   (contrôle du passé utilisé)
  h̃_t = tanh(W_h * [r_t ⊙ h_{t-1}, x_t])  ← Candidate hidden state
  h_t = (1 - z_t) ⊙ h_{t-1} + z_t ⊙ h̃_t  ← Hidden state final

  GRU vs LSTM :
  ├── GRU : 3 matrices de poids (vs 4 pour LSTM) ──▶ ~25% moins de paramètres
  ├── GRU : Pas de Cell State séparé ──▶ Plus simple à implémenter
  ├── GRU : Converge souvent plus vite sur petits datasets
  └── LSTM : Meilleur sur très longues séquences (>500 tokens)
```

### 🛠️ Atelier — GRU pour Prédiction de Séries Temporelles (CPU Load)

```python
#!/usr/bin/env python3
"""PARADIS — GRU pour prédiction de charge CPU (régression de séries temporelles)"""
import torch
import torch.nn as nn
import numpy as np

class CPULoadGRU(nn.Module):
    def __init__(self, input_size=1, hidden_size=64, num_layers=2, output_size=1):
        super().__init__()
        self.gru = nn.GRU(input_size, hidden_size, num_layers=num_layers,
                           batch_first=True, dropout=0.2)
        self.fc  = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, _ = self.gru(x)
        return self.fc(out[:, -1, :])  # Prédiction depuis le dernier état caché

# Génération d'une série temporelle synthétique (CPU load avec tendance)
np.random.seed(42)
t = np.linspace(0, 4*np.pi, 500)
cpu_load = 50 + 20*np.sin(t) + 15*np.sin(3*t) + np.random.normal(0, 5, 500)

SEQ_LEN = 20
X_ts = torch.tensor([[cpu_load[i:i+SEQ_LEN]] for i in range(len(cpu_load)-SEQ_LEN-1)],
                      dtype=torch.float32).permute(0, 2, 1)  # (N, SEQ_LEN, 1)
y_ts = torch.tensor([[cpu_load[i+SEQ_LEN]] for i in range(len(cpu_load)-SEQ_LEN-1)],
                      dtype=torch.float32)  # (N, 1)

model_gru = CPULoadGRU()
optim_gru  = torch.optim.Adam(model_gru.parameters(), lr=1e-3)
mse = nn.MSELoss()

for epoch in range(100):
    model_gru.train()
    pred = model_gru(X_ts)
    loss = mse(pred, y_ts)
    optim_gru.zero_grad(); loss.backward(); optim_gru.step()
    if epoch % 25 == 0:
        print(f"Époque {epoch:3d} | MSE : {loss.item():.4f}")

print("✅ GRU CPU Load Predictor entraîné")
```

---

## Module 3 — Comparaison RNN/LSTM/GRU & Best Practices (1h30)

### 🔍 Guide de Sélection du Modèle Séquentiel

```
QUAND UTILISER QUOI ?

  RNN Classique   → JAMAIS en production (vanishing gradient)
  LSTM            → Séquences longues (>100 steps), traduction, parole
  GRU             → Séquences courtes/moyennes, time series, plus rapide
  Transformer     → Tâches NLP modernes (>LSTM si data suffisante)
  SSM (Mamba)     → Alternative 2024 aux Transformers pour longues séquences

  GRADIENT CLIPPING : TOUJOURS utiliser pour LSTM/GRU
  nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

  BIDIRECTIONNEL : LSTM(bidirectional=True) ──▶ Contexte passé ET futur
  ──▶ Utile pour NLP (classification), PAS pour prédiction temps réel
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **RNN** | Recurrent Neural Network — Réseau récurrent maintenant un état caché pour les séquences |
| **LSTM** | Long Short-Term Memory — RNN avec portes contrôlant la mémoire à long terme |
| **GRU** | Gated Recurrent Unit — RNN allégé combinant les portes Forget et Input de LSTM |
| **BPTT** | Backpropagation Through Time — Rétropropagation déroulée dans le temps pour les RNN |
| **Cell State** | $C_t$ dans LSTM — État interne long terme traversant les cellules via des connexions additives |

---

## Exercices Pratiques

### Exercice 1 — Analyse d'une Forget Gate

Dans un LSTM, la Forget Gate $f_t = \sigma(W_f \cdot [h_{t-1}, x_t] + b_f)$.

Si $f_t = 0$ pour tous les timesteps, qu'advient-il du Cell State $C_t$ ? Quelle en est la conséquence pratique sur la mémoire du réseau ?

**Corrigé guidé :** Si $f_t = 0$, alors $C_t = f_t \odot C_{t-1} + i_t \odot g_t = 0 \cdot C_{t-1} + i_t \odot g_t = i_t \odot g_t$. Le Cell State **oublie complètement** l'historique à chaque pas de temps — seule la nouvelle entrée est stockée. Conséquence : le LSTM se comporte comme un RNN classique sans mémoire long terme, perdant toute dépendance à longue portée. En pratique, le biais $b_f$ est initialisé à +1 pour que la Forget Gate commence proche de 1 (tout mémoriser), laissant le réseau apprendre progressivement quoi oublier.

---

## Banque QCM — 5 Questions

**Q1.** Le **vanishing gradient** dans les RNN classiques est causé principalement par :

- A) Un batch size trop grand
- B) La multiplication répétée du gradient par la matrice de poids récurrente $W_{hh}$ sur T timesteps, faisant converger le gradient vers 0 si $\|W_{hh}\| < 1$ ✅
- C) L'utilisation de la fonction d'activation ReLU
- D) L'absence de normalisation des entrées

**Q2.** La **Forget Gate** du LSTM contrôle :

- A) La vitesse d'apprentissage de l'optimiseur Adam
- B) Quelle fraction de l'état de cellule précédent $C_{t-1}$ est conservée pour le pas suivant ✅
- C) La dimension de l'espace des embeddings
- D) Le gradient clipping

**Q3.** Un LSTM **bidirectionnel** se distingue d'un LSTM unidirectionnel car :

- A) Il traite deux langues simultanément
- B) Il traite la séquence dans les deux sens (gauche→droite et droite→gauche) et concatène les états cachés, capturant le contexte passé ET futur ✅
- C) Il utilise deux fois moins de paramètres
- D) Il ne nécessite pas de padding pour les séquences de longueur variable

**Q4.** Le **Gradient Clipping** (`clip_grad_norm_`) est utilisé pour :

- A) Accélérer la convergence en augmentant le gradient
- B) Limiter la norme du gradient à un seuil maximal pour éviter les mises à jour catastrophiques dues aux gradients explosifs ✅
- C) Réduire le nombre de paramètres du modèle
- D) Initialiser les poids de la couche récurrente

**Q5.** Un GRU a généralement **moins de paramètres** qu'un LSTM de même taille car :

- A) Le GRU utilise des poids partagés entre les couches
- B) Le GRU fusionne les Forget et Input Gates en une seule Update Gate et n'a pas de Cell State séparé, réduisant de 3 à 2 matrices le nombre de portes ✅
- C) Le GRU quantifie ses poids en INT8 par défaut
- D) Le GRU n'a pas de biais

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
