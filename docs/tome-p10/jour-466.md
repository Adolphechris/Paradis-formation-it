# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 466 (6h) : Réseaux Génératifs Adversariaux (GAN) : Architecture Minimax, DCGAN, Mode Collapse, Wasserstein GAN (WGAN-GP) & Synthèse de Données

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre l'architecture de jeu à somme nulle des **GANs** (Générateur vs Discriminateur)
> - Analyser et résoudre le problème d'instabilité majeur : **Mode Collapse** et **Vanishing Gradient**
> - Implémenter un **DCGAN (Deep Convolutional GAN)** complet en PyTorch pour la génération d'images/matrices
> - Maîtriser le **Wasserstein GAN avec Gradient Penalty (WGAN-GP)** pour stabiliser l'apprentissage génératif
>
> **Compétences visées :** `AI-01` (A) — Generative Adversarial Architectures & Synthetic Data Generation

---

## Module 1 — Architecture Minimax des GANs & Instabilités (2h)

### 📖 Intuition & Narration

Les **Réseaux Génératifs Adversariaux (GANs — Goodfellow et al. 2014)** reposent sur un duel entre deux réseaux de neurones s'affrontant dans un jeu à somme nulle :
1. **Le Générateur ($G$)** joue le rôle d'un faussaire : il prend en entrée un vecteur de bruit aléatoire $z \sim p_z$ et cherche à créer des données synthétiques $G(z)$ impossibles à distinguer des données réelles.
2. **Le Discriminateur ($D$)** joue le rôle d'un expert de la police : il reçoit en entrée une donnée (réelle $x$ ou créée $G(z)$) et doit prédire la probabilité qu'il s'agisse d'une donnée réelle $D(x) \in [0, 1]$.

Au cours de l'apprentissage, $G$ devient de plus en plus habile à tromper $D$, tandis que $D$ devient de plus en plus fin pour démasquer les faux.

### 🔍 Anatomie Technique — Équation Minimax du GAN

```
JEU MINIMAX ZÉRO-SUM : FORMULE DE GOODFELLOW

  min_G max_D V(D, G) = E_{x ~ p_data(x)} [ log D(x) ] + E_{z ~ p_z(z)} [ log (1 - D(G(z))) ]

  1. Objectif du Discriminateur D (Maximiser V) :
     - Maximer log D(x)    --> D(x) proche de 1 pour les vraies données x.
     - Maximiser log(1-D(G(z))) --> D(G(z)) proche de 0 pour les données générées.

  2. Objectif du Générateur G (Minimiser V) :
     - Minimiser log(1-D(G(z))) --> Forcer D(G(z)) vers 1 (tromper le discriminateur).

PATHOLOGIES TRADITIONNELLES DES GANS :
  - Mode Collapse  : Le Générateur découvre une seule sortie plausible qui trompe D et produit toujours la MÊME donnée en boucle.
  - Vanishing Grad : Si D devient trop parfait prématurément, D(G(z)) -> 0 et ∇_G V s'annule complètement.
  - WGAN-GP Solution : Remplacer la divergence JS par la distance de Earth Mover (Wasserstein-1) et ajouter une pénalité de gradient (Gradient Penalty) pour imposer la contrainte 1-Lipschitz.
```

---

## Module 2 — Atelier Pratique : Implémentation DCGAN en PyTorch (2h)

### 🛠️ Code PyTorch : DCGAN (Deep Convolutional GAN)

```python
#!/usr/bin/env python3
"""
PARADIS — Implémentation complète d'un DCGAN (Deep Convolutional GAN) en PyTorch
Génération d'images/heatmaps 64x64 à partir d'un espace latent gaussien (z_dim=100)
"""

import torch
import torch.nn as nn

# 1. Générateur DCGAN (Deconvolution / ConvTranspose2d)
class Generator(nn.Module):
    def __init__(self, z_dim=100, feature_g=64, channels=3):
        super().__init__()
        self.net = nn.Sequential(
            # Input: z (batch, z_dim, 1, 1) -> Output: (batch, feature_g*8, 4, 4)
            nn.ConvTranspose2d(z_dim, feature_g * 8, kernel_size=4, stride=1, padding=0, bias=False),
            nn.BatchNorm2d(feature_g * 8),
            nn.ReLU(True),
            # State: (batch, feature_g*8, 4, 4) -> (batch, feature_g*4, 8, 8)
            nn.ConvTranspose2d(feature_g * 8, feature_g * 4, 4, 2, 1, bias=False),
            nn.BatchNorm2d(feature_g * 4),
            nn.ReLU(True),
            # State: (batch, feature_g*4, 8, 8) -> (batch, feature_g*2, 16, 16)
            nn.ConvTranspose2d(feature_g * 4, feature_g * 2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(feature_g * 2),
            nn.ReLU(True),
            # State: (batch, feature_g*2, 16, 16) -> (batch, feature_g, 32, 32)
            nn.ConvTranspose2d(feature_g * 2, feature_g, 4, 2, 1, bias=False),
            nn.BatchNorm2d(feature_g),
            nn.ReLU(True),
            # Output: (batch, channels, 64, 64)
            nn.ConvTranspose2d(feature_g, channels, 4, 2, 1, bias=False),
            nn.Tanh()  # Sortie normalisée entre [-1, 1]
        )

    def forward(self, x):
        return self.net(x)

# 2. Discriminateur DCGAN (Strided Convolution)
class Discriminator(nn.Module):
    def __init__(self, channels=3, feature_d=64):
        super().__init__()
        self.net = nn.Sequential(
            # Input: (batch, channels, 64, 64) -> (batch, feature_d, 32, 32)
            nn.Conv2d(channels, feature_d, 4, 2, 1, bias=False),
            nn.LeakyReLU(0.2, inplace=True),
            # State: (batch, feature_d, 32, 32) -> (batch, feature_d*2, 16, 16)
            nn.Conv2d(feature_d, feature_d * 2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(feature_d * 2),
            nn.LeakyReLU(0.2, inplace=True),
            # State: (batch, feature_d*2, 16, 16) -> (batch, feature_d*4, 8, 8)
            nn.Conv2d(feature_d * 2, feature_d * 4, 4, 2, 1, bias=False),
            nn.BatchNorm2d(feature_d * 4),
            nn.LeakyReLU(0.2, inplace=True),
            # State: (batch, feature_d*4, 8, 8) -> (batch, feature_d*8, 4, 4)
            nn.Conv2d(feature_d * 4, feature_d * 8, 4, 2, 1, bias=False),
            nn.BatchNorm2d(feature_d * 8),
            nn.LeakyReLU(0.2, inplace=True),
            # Output: (batch, 1, 1, 1) -> Sigmoid pour probabilité
            nn.Conv2d(feature_d * 8, 1, 4, 1, 0, bias=False),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.net(x).view(-1, 1).squeeze(1)

def run_dcgan_demo():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    z_dim = 100
    gen = Generator(z_dim=z_dim).to(device)
    disc = Discriminator().to(device)

    # Optimiseurs Adam avec hyperparamètres spécifiques DCGAN (Radford et al. : lr=0.0002, beta1=0.5)
    opt_gen = torch.optim.Adam(gen.parameters(), lr=2e-4, betas=(0.5, 0.999))
    opt_disc = torch.optim.Adam(disc.parameters(), lr=2e-4, betas=(0.5, 0.999))
    criterion = nn.BCELoss()

    print("[*] DCGAN Initialisé avec succès.")
    print(f"    Générateur Params    : {sum(p.numel() for p in gen.parameters()):,}")
    print(f"    Discriminateur Params: {sum(p.numel() for p in disc.parameters()):,}")

    # Simulation d'une étape d'entraînement
    batch_size = 16
    real_images = torch.randn(batch_size, 3, 64, 64).to(device)
    noise = torch.randn(batch_size, z_dim, 1, 1).to(device)

    # Train Discriminator
    fake_images = gen(noise)
    disc_real = disc(real_images)
    disc_fake = disc(fake_images.detach())
    loss_disc = criterion(disc_real, torch.ones_like(disc_real)) + criterion(disc_fake, torch.zeros_like(disc_fake))

    opt_disc.zero_grad()
    loss_disc.backward()
    opt_disc.step()

    # Train Generator
    output = disc(fake_images)
    loss_gen = criterion(output, torch.ones_like(output))

    opt_gen.zero_grad()
    loss_gen.backward()
    opt_gen.step()

    print(f"[+] Étape 1 exécutée | Loss Disc: {loss_disc.item():.4f} | Loss Gen: {loss_gen.item():.4f}")

if __name__ == "__main__":
    run_dcgan_demo()
```

---

## Module 3 — Variantes GANs Industrielles : StyleGAN & WGAN-GP (1h30)

### 🔍 Comparatif des Architectures GANs Industrielles

```
ÉVOLUTION DES ARCHITECTURES GANS

  DCGAN (2015)      : Introduit les convolutions et Batch Normalization. Entraînement instable.
  CycleGAN (2017)   : Traduction d'image à image sans paires de données (ex: Cheval <-> Zèbre).
  WGAN-GP (2017)    : Remplace la perte Minimax par la distance de Wasserstein + Pénalité de gradient.
  StyleGAN 1-3(2019): Contrôle du style par couches (Style-based Architecture + AdaIN), haute résolution.

PERTE WASSERSTEIN AVEC GRADIENT PENALTY (WGAN-GP) :
  L_D = E[D(fake)] - E[D(real)] + λ * E[ (||∇_{x_hat} D(x_hat)||_2 - 1)² ]
  - Supprime le Sigmoid final du Discriminateur (devenu un "Critic").
  - Stabilise l'entraînement de manière spectaculaire (élimine le mode collapse).
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **GAN** | Generative Adversarial Network — Réseau génératif basé sur un jeu à somme nulle entre G et D |
| **DCGAN** | Deep Convolutional GAN — Architecture GAN utilisant des couches de convolution et déconvolution |
| **WGAN-GP** | Wasserstein GAN with Gradient Penalty — Variante stabilisée reposant sur la distance de Wasserstein |
| **Mode Collapse** | Défaillance où le génératrice produit une variété très restreinte d'échantillons identiques |
| **AdaIN** | Adaptive Instance Normalization — Module d'injection de style utilisé dans StyleGAN |

---

## Exercices Pratiques

### Exercice 1 — Diagnostic de Mode Collapse

Lors de l'entraînement d'un GAN pour la synthèse de données de trafic réseau, la perte du discriminateur baisse brutalement vers 0.01 et y reste bloquée, tandis que la perte du générateur s'envole à 8.5. Les données générées sont toutes identiques (toujours le même paquet SYN de 64 octets).
1. Quel phénomène s'est produit ?
2. Proposez deux solutions architecturales et algorithmiques pour résoudre ce problème.

**Corrigé guidé :**
1. **Diagnostic** : Le modèle souffre de **Mode Collapse** combiné à un **Vanishing Gradient** du générateur. Le discriminateur est devenu trop parfait prématurément ($D(G(z)) \approx 0$), annulant les gradients transmis au générateur qui s'est réfugié dans la production d'un mode unique ("effondrement de mode").
2. **Solutions** :
   - Passet au schéma **WGAN-GP (Wasserstein GAN avec Gradient Penalty)** en retirant le Sigmoid du Discriminateur (Critic) et en utilisant une perte Wasserstein.
   - Utiliser la **Unrolled GANs** ou ajouter du bruit gaussien aux images d'entrée du Discriminateur (Instance Noise) pour affaiblir temporairement D et lui ré-apprendre la nuance.

---

## Banque QCM — 5 Questions

**Q1.** Dans un **GAN (Generative Adversarial Network)** classique, quel est le rôle du **Générateur ($G$)** ?

- A) Classifier les images en 1000 catégories.
- B) Transformer un vecteur de bruit aléatoire $z$ en une donnée synthétique $G(z)$ réaliste capable de tromper le Discriminateur. ✅
- C) Calculer la perte Cross-Entropy des cibles réelles.
- D) Compresser les données sur disque.

**Q2.** Le phénomène de **Mode Collapse** désigne la situation où :

- A) Le GPU tombe en panne de mémoire.
- B) Le Générateur produit une variété extrêmement pauvre et répétitive de données générées identiques qui satisfont le Discriminateur, au lieu d'apprendre la diversité complète de la distribution. ✅
- C) Le Discriminateur est supprimé du réseau.
- D) L'image générée est totalement noire.

**Q3.** Pourquoi l'architecture **DCGAN** utilise-t-elle des couches `ConvTranspose2d` dans le Générateur ?

- A) Pour réduire la taille de l'image.
- B) Pour effectuer un sur-échantillonnage spatial (Up-sampling) progressif depuis un petit vecteur latent $1 \times 1$ vers une image haute résolution $64 \times 64$. ✅
- C) Pour chiffrer les données.
- D) Pour remplacer la fonction d'activation ReLU.

**Q4.** Qu'apporte la variante **WGAN-GP (Wasserstein GAN-GP)** par rapport au GAN original de Goodfellow ?

- A) Elle accélère la vitesse de téléchargement des images.
- B) Elle utilise la distance de Wasserstein et une pénalité de gradient pour stabiliser l'apprentissage et éliminer le problème du vanishing gradient du Générateur. ✅
- C) Elle supprime l'utilisation de PyTorch.
- D) Elle ne fonctionne qu'avec du texte.

**Q5.** Dans l'équation Minimax d'un GAN, quelle valeur optimale de probabilité $D(x)$ le Discriminateur parfait cherche-t-il à prédire pour une donnée RÉELLE $x$ ?

- A) $0.0$
- B) $1.0$ ✅
- C) $-1.0$
- D) $0.5$

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
