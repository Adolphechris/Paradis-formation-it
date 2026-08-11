# TOME P10 — Intelligence Artificielle, Machine Learning & MLOps — Jour 451 (6h) : Fondements Mathématiques du Machine Learning : Algèbre Linéaire, Calcul Matriciel, Descente de Gradient & Backpropagation

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser les fondements d'**algèbre linéaire** appliqués au ML : produit matriciel, transformations linéaires, décomposition en valeurs singulières (SVD)
> - Comprendre le **calcul du gradient** (dérivées partielles, règle de la chaîne) et son rôle dans l'optimisation des réseaux de neurones
> - Implémenter la **descente de gradient stochastique (SGD)** et ses variantes modernes (Adam, AdaGrad, RMSProp) en NumPy pur
> - Dériver et coder l'algorithme de **rétropropagation (Backpropagation)** étape par étape sans framework
>
> **Compétences visées :** `DATA-01` (A) — Machine Learning Foundations, `AI-01` (A) — Neural Network Theory

---

## Module 1 — Algèbre Linéaire pour le ML : Du Vecteur au Tenseur (2h)

### 📖 Intuition & Narration

Le Machine Learning est essentiellement de l'**algèbre linéaire computationnelle** accélérée par GPU. Un réseau de neurones dense ne fait qu'une chose : multiplier des matrices et appliquer des non-linéarités (fonctions d'activation). Comprendre le calcul matriciel est donc fondamental avant tout framework.

### 🔍 Anatomie Technique — Opérations Matricielles Fondamentales

```
OPÉRATIONS MATRICIELLES EN ML

  Données d'entrée X : (batch_size=32, features=784)  ←── Minibatch d'images MNIST
  Poids de la couche W : (features=784, hidden=256)
  Biais b : (hidden=256,)

  1. PROPAGATION AVANT (Forward Pass) :
     Z = X @ W + b     ──▶ Shape : (32, 256)    (produit matriciel + broadcast du biais)
     A = relu(Z)       ──▶ Shape : (32, 256)    (activation non-linéaire)

  2. PRODUIT SCALAIRE & SIMILARITÉ COSINUS :
     sim(a, b) = (a · b) / (||a|| * ||b||)     ──▶ Utilisé dans Transformers (Attention)

  3. SVD (Singular Value Decomposition) :
     A = U Σ Vᵀ       ──▶ Compression, PCA, Pseudo-inverse, LORA (fine-tuning LLM)
```

### 🛠️ Atelier Pratique — NumPy : Réseau de Neurones 1 Couche sans Framework

```python
#!/usr/bin/env python3
"""
PARADIS — Réseau de Neurones Dense à 1 Couche (NumPy pur)
Classification binaire avec descente de gradient & backpropagation
"""

import numpy as np

# Seed reproductible
np.random.seed(42)

# ── Fonctions d'activation et de perte ──────────────────────────────────────
def sigmoid(z):
    return 1 / (1 + np.exp(-np.clip(z, -500, 500)))

def sigmoid_derivative(a):
    return a * (1 - a)

def relu(z):
    return np.maximum(0, z)

def relu_derivative(z):
    return (z > 0).astype(float)

def binary_cross_entropy(y_true, y_pred, eps=1e-9):
    return -np.mean(y_true * np.log(y_pred + eps) + (1 - y_true) * np.log(1 - y_pred + eps))

# ── Données synthétiques (classification XOR) ──────────────────────────────
X = np.array([[0,0], [0,1], [1,0], [1,1]], dtype=float)   # (4, 2)
y = np.array([[0], [1], [1], [0]], dtype=float)            # (4, 1) — XOR

# ── Initialisation des paramètres (He initialization pour ReLU) ─────────────
n_input, n_hidden, n_output = 2, 8, 1

W1 = np.random.randn(n_input, n_hidden) * np.sqrt(2.0 / n_input)
b1 = np.zeros((1, n_hidden))
W2 = np.random.randn(n_hidden, n_output) * np.sqrt(2.0 / n_hidden)
b2 = np.zeros((1, n_output))

lr = 0.1
epochs = 5000

# ── Boucle d'entraînement (SGD sur batch complet ici) ───────────────────────
for epoch in range(epochs):
    # FORWARD PASS
    Z1 = X @ W1 + b1          # (4, 8)
    A1 = relu(Z1)              # (4, 8)
    Z2 = A1 @ W2 + b2         # (4, 1)
    A2 = sigmoid(Z2)           # (4, 1) — Prédiction

    loss = binary_cross_entropy(y, A2)

    # BACKWARD PASS (Backpropagation — Règle de la chaîne)
    # Gradient de la perte par rapport à A2
    dL_dA2 = -(y / (A2 + 1e-9) - (1 - y) / (1 - A2 + 1e-9)) / len(y)
    dA2_dZ2 = sigmoid_derivative(A2)
    dL_dZ2 = dL_dA2 * dA2_dZ2                  # (4, 1)

    dL_dW2 = A1.T @ dL_dZ2                      # (8, 1)
    dL_db2 = np.sum(dL_dZ2, axis=0, keepdims=True)
    dL_dA1 = dL_dZ2 @ W2.T                      # (4, 8)
    dL_dZ1 = dL_dA1 * relu_derivative(Z1)       # (4, 8)
    dL_dW1 = X.T @ dL_dZ1                       # (2, 8)
    dL_db1 = np.sum(dL_dZ1, axis=0, keepdims=True)

    # MISE À JOUR DES PARAMÈTRES (SGD)
    W2 -= lr * dL_dW2
    b2 -= lr * dL_db2
    W1 -= lr * dL_dW1
    b1 -= lr * dL_db1

    if epoch % 500 == 0:
        print(f"Époque {epoch:5d} | Perte : {loss:.6f}")

# ── Évaluation finale ─────────────────────────────────────────────────────
Z1_test = X @ W1 + b1
A1_test = relu(Z1_test)
Z2_test = A1_test @ W2 + b2
predictions = (sigmoid(Z2_test) > 0.5).astype(int)
print("\nPrédictions finales XOR :")
for xi, pi, yi in zip(X, predictions, y):
    print(f"  {xi.astype(int)} ──▶ Prédit: {pi[0]} | Réel: {int(yi[0])}")
accuracy = np.mean(predictions == y)
print(f"\nPrécision : {accuracy * 100:.1f}% {'✅' if accuracy == 1.0 else '⚠️'}")
```

---

## Module 2 — Optimiseurs Avancés : Adam, AdaGrad, RMSProp (2h)

### 🔍 Anatomie Technique — Comparaison des Optimiseurs

```
COMPARAISON DES OPTIMISEURS ML

  SGD (Stochastic Gradient Descent) :
  ├── θ_t+1 = θ_t - η * ∇L(θ_t)
  ├── Avantage : Simple, bon biais de généralisation
  └── Inconvénient : Sensible au taux d'apprentissage, oscillations dans les ravines

  MOMENTUM :
  ├── v_t = β * v_{t-1} + η * ∇L(θ_t)     (β=0.9 typiquement)
  └── θ_t+1 = θ_t - v_t

  ADAM (Adaptive Moment Estimation) — Recommandé par défaut :
  ├── m_t = β₁ * m_{t-1} + (1-β₁) * g_t           (1er moment — Moyenne)
  ├── v_t = β₂ * v_{t-1} + (1-β₂) * g_t²          (2ème moment — Variance)
  ├── m̂_t = m_t / (1-β₁ᵗ)     v̂_t = v_t / (1-β₂ᵗ)  (correction biais)
  └── θ_t+1 = θ_t - η * m̂_t / (√v̂_t + ε)          (ε=1e-8)

  HYPERPARAMÈTRES ADAM STANDARDS :
  ├── η (learning rate)  : 1e-3 (par défaut), à réduire selon scheduler
  ├── β₁                : 0.9  (moment du gradient)
  ├── β₂                : 0.999 (moment du gradient au carré)
  └── ε                 : 1e-8 (stabilité numérique)
```

---

## Module 3 — Décomposition SVD & PCA Appliquées (1h30)

### 🔍 Décomposition en Valeurs Singulières (SVD) en ML

```python
import numpy as np

# SVD appliquée à la compression d'image
np.random.seed(0)
image_matrix = np.random.randint(0, 255, (100, 100), dtype=np.float64)

# Décomposition SVD : A = U Σ Vᵀ
U, sigma, Vt = np.linalg.svd(image_matrix, full_matrices=False)

# Reconstruction approchée avec seulement k=10 valeurs singulières
k = 10
A_compressed = U[:, :k] @ np.diag(sigma[:k]) @ Vt[:k, :]

# Ratio de compression
ratio = (k * (100 + 100 + 1)) / (100 * 100)
print(f"Ratio de compression avec k={k} : {ratio:.3f} ({ratio*100:.1f}% de la taille originale)")
print(f"Erreur de reconstruction (Frobenius norm) : {np.linalg.norm(image_matrix - A_compressed):.2f}")
print(f"Valeurs singulières dominantes : {sigma[:k].astype(int).tolist()}")
print("──▶ Même principe utilisé dans LoRA (Low-Rank Adaptation) pour le fine-tuning LLM !")
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SGD** | Stochastic Gradient Descent — Algorithme d'optimisation de base en ML |
| **Adam** | Adaptive Moment Estimation — Optimiseur adaptatif combinant Momentum et RMSProp |
| **SVD** | Singular Value Decomposition — Factorisation matricielle fondamentale en réduction de dimensionnalité |
| **PCA** | Principal Component Analysis — Analyse en Composantes Principales basée sur la SVD |
| **LoRA** | Low-Rank Adaptation — Technique de fine-tuning LLM efficace basée sur la décomposition en rang réduit |

---

## Exercices Pratiques

### Exercice 1 — Calcul Manuel de Backpropagation

Considérez un réseau à 1 neurone avec : entrée $x = 2.0$, poids $w = 0.5$, biais $b = 0.1$, cible $y_{true} = 1.0$.

Forward pass : $z = wx + b = 0.5 \cdot 2.0 + 0.1 = 1.1$, $a = \sigma(z) = \sigma(1.1)$, $L = \frac{1}{2}(a - y_{true})^2$.

Calculez manuellement $\frac{\partial L}{\partial w}$, $\frac{\partial L}{\partial b}$ en appliquant la règle de la chaîne.

**Corrigé guidé :**
$\sigma(1.1) \approx 0.7503$

$\frac{\partial L}{\partial a} = a - y_{true} = 0.7503 - 1.0 = -0.2497$

$\frac{\partial a}{\partial z} = \sigma(z)(1-\sigma(z)) = 0.7503 \cdot 0.2497 \approx 0.1875$

$\frac{\partial z}{\partial w} = x = 2.0$ ; $\frac{\partial z}{\partial b} = 1.0$

$\frac{\partial L}{\partial w} = -0.2497 \cdot 0.1875 \cdot 2.0 \approx -0.0936$ ➜ Mise à jour : $w_{new} = 0.5 - \eta \cdot (-0.0936) = 0.5 + 0.0094 = 0.5094$ (pour $\eta = 0.1$)

---

## Banque QCM — 5 Questions

**Q1.** La **rétropropagation (Backpropagation)** est l'application de :

- A) La transformée de Fourier rapide à la dérivation
- B) La règle de la chaîne du calcul différentiel, calculant les gradients de la perte par rapport à chaque paramètre du réseau en remontant de la sortie vers l'entrée ✅
- C) La décomposition LU de la matrice jacobienne
- D) L'algorithme de tri rapide Quicksort

**Q2.** L'optimiseur **Adam** se distingue du SGD classique car il :

- A) Utilise une seule valeur de gradient (pas de moments)
- B) Maintient des estimations adaptatives du 1er moment (moyenne) et du 2ème moment (variance) du gradient, permettant un taux d'apprentissage adaptatif par paramètre ✅
- C) Requiert de calculer la matrice Hessienne complète
- D) Ne fonctionne qu'avec des données normalisées entre -1 et 1

**Q3.** Dans la propagation avant d'un réseau dense, l'opération `Z = X @ W + b` utilise le **broadcasting** pour le biais car :

- A) NumPy ne supporte pas l'addition de matrices de même taille
- B) Le biais `b` de shape `(hidden,)` est automatiquement étendu sur la dimension batch (batch_size) pour s'additionner à la matrice `Z` de shape `(batch_size, hidden)` ✅
- C) Le produit matriciel @ inclut automatiquement le biais
- D) `b` est toujours une matrice carrée de même dimension que `W`

**Q4.** La **SVD (Décomposition en Valeurs Singulières)** $A = U\Sigma V^T$ est utilisée dans LoRA pour le fine-tuning LLM car :

- A) Elle accélère le calcul de l'attention quadratique dans les Transformers
- B) Elle permet d'approximer une grande matrice de poids par le produit de deux matrices de rang faible (low-rank), réduisant drastiquement le nombre de paramètres entraînables ✅
- C) Elle convertit les embeddings en représentations entières pour la quantification
- D) Elle remplace entièrement l'optimiseur Adam

**Q5.** L'**initialisation de He** des poids d'un réseau utilisant ReLU consiste à initialiser $W \sim \mathcal{N}(0, \sqrt{2/n_{in}})$ car :

- A) Les poids négatifs doivent être évités avec ReLU
- B) Cette variance compense le fait que ReLU met à zéro la moitié des neurones en moyenne, préservant la variance du signal lors de la propagation avant dans des réseaux profonds ✅
- C) C'est la valeur par défaut de la bibliothèque NumPy
- D) L'initialisation ne joue aucun rôle dans la convergence

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
