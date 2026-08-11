# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 452 (6h) : Réseaux de Neurones Convolutifs (CNN) : Architecture LeNet/VGG/ResNet, Convolution 2D, Pooling, BatchNorm & Transfer Learning avec PyTorch

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre l'architecture interne d'un CNN : couches de convolution 2D, pooling, feature maps et receptive field
> - Implémenter un réseau ResNet complet avec connexions résiduelles (skip connections) en PyTorch
> - Appliquer le **Transfer Learning** depuis un backbone ImageNet pré-entraîné (ResNet-50) pour la classification domaine-spécifique
> - Optimiser l'entraînement CNN avec BatchNormalization, Dropout et Data Augmentation
>
> **Compétences visées :** `AI-01` (A) — Computer Vision & CNN Architectures

---

## Module 1 — Architecture CNN : Convolution, Pooling & Feature Maps (2h)

### 📖 Intuition & Narration

Un CNN n'est pas un réseau dense ordinaire — il exploite la **localité spatiale** des images. Plutôt que de connecter chaque pixel à chaque neurone (coûteux et ignorant la structure spatiale), les couches de convolution appliquent des **filtres locaux** (kernels) qui détectent des patterns : bords, textures, formes, puis des objets complexes dans les couches profondes.

### 🔍 Anatomie Technique — Opération de Convolution 2D

```
CONVOLUTION 2D — DIMENSIONS ET CALCUL

  Entrée : H x W x C_in   (ex: 224 x 224 x 3 pour une image RGB)
  Kernel : K x K x C_in x C_out  (ex: 3x3x3x64 pour la première couche VGG)
  Sortie : H' x W' x C_out

  H' = (H + 2*padding - K) / stride + 1
  Ex : (224 + 2*1 - 3) / 1 + 1 = 224  ──▶ Same padding préserve les dimensions

  PARAMÈTRES vs FULLY CONNECTED :
  Conv 3x3x3x64  = 3*3*3*64 + 64 = 1792 paramètres
  FC équivalent  = (224*224*3) * (224*224*64) ≈ 2.8 milliards de paramètres !!

  FEATURE MAPS : Chaque filtre apprend à détecter un pattern différent.
  Couche 1 : bords horizontaux, verticaux, coins
  Couche 3 : textures, patterns répétitifs
  Couche 7 : nez, oreilles, roues, logos
  Couche 12 : objets complets (chats, voitures, logos)
```

### 🛠️ Atelier Pratique — ResNet-18 Complet en PyTorch

```python
#!/usr/bin/env python3
"""
PARADIS — Implémentation ResNet avec Skip Connections en PyTorch
Classification d'images avec connexions résiduelles
"""

import torch
import torch.nn as nn
import torch.nn.functional as F

class ResidualBlock(nn.Module):
    """Bloc résiduel de base (ResNet-18/34)"""
    expansion = 1

    def __init__(self, in_channels, out_channels, stride=1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, 3, stride=stride, padding=1, bias=False)
        self.bn1   = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3, stride=1, padding=1, bias=False)
        self.bn2   = nn.BatchNorm2d(out_channels)

        # Skip connection si dimensions différentes
        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 1, stride=stride, bias=False),
                nn.BatchNorm2d(out_channels)
            )

    def forward(self, x):
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += self.shortcut(x)   # ← Skip Connection : résout le vanishing gradient !
        return F.relu(out)

class ResNet18(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.stem = nn.Sequential(
            nn.Conv2d(3, 64, 7, stride=2, padding=3, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(3, stride=2, padding=1)
        )
        self.layer1 = self._make_layer(64,  64,  2, stride=1)
        self.layer2 = self._make_layer(64,  128, 2, stride=2)
        self.layer3 = self._make_layer(128, 256, 2, stride=2)
        self.layer4 = self._make_layer(256, 512, 2, stride=2)
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        self.fc      = nn.Linear(512, num_classes)

    def _make_layer(self, in_c, out_c, blocks, stride):
        layers = [ResidualBlock(in_c, out_c, stride)]
        for _ in range(1, blocks):
            layers.append(ResidualBlock(out_c, out_c, stride=1))
        return nn.Sequential(*layers)

    def forward(self, x):
        x = self.stem(x)
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        return self.fc(x)

# Test
model = ResNet18(num_classes=10)
dummy_input = torch.randn(4, 3, 224, 224)  # Batch de 4 images RGB 224x224
output = model(dummy_input)
print(f"Input shape  : {dummy_input.shape}")
print(f"Output shape : {output.shape}")
total_params = sum(p.numel() for p in model.parameters())
print(f"Paramètres   : {total_params:,}")
```

---

## Module 2 — Transfer Learning : ResNet-50 ImageNet → Domaine Spécifique (2h)

### 📖 Intuition & Narration

Entraîner un CNN depuis zéro nécessite des millions d'images et plusieurs jours de GPU. Le **Transfer Learning** résout ce problème : on part d'un modèle pré-entraîné sur ImageNet (1.2M images, 1000 classes) et on adapte uniquement les dernières couches à notre tâche spécifique. Les features visuelles bas niveau (bords, textures) sont universelles et peuvent être réutilisées directement.

### 🛠️ Atelier Pratique — Fine-Tuning ResNet-50

```python
#!/usr/bin/env python3
"""
PARADIS — Transfer Learning avec ResNet-50 pré-entraîné ImageNet
Adapté à la classification de logs d'anomalies réseau (images de heatmaps)
"""
import torch
import torch.nn as nn
from torchvision import models, transforms, datasets
from torch.utils.data import DataLoader

def build_model(num_classes: int, freeze_backbone: bool = True) -> nn.Module:
    """Charge ResNet-50 pré-entraîné et remplace le classificateur final"""
    model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)

    if freeze_backbone:
        # Gel de tous les paramètres (feature extraction uniquement)
        for param in model.parameters():
            param.requires_grad = False
        # Dégel du dernier bloc résiduel pour un fine-tuning partiel
        for param in model.layer4.parameters():
            param.requires_grad = True

    # Remplacement du classificateur final
    in_features = model.fc.in_features  # 2048 pour ResNet-50
    model.fc = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(),
        nn.BatchNorm1d(256),
        nn.Dropout(0.2),
        nn.Linear(256, num_classes)
    )
    return model

# Configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = build_model(num_classes=5, freeze_backbone=True).to(device)

# Augmentation des données d'entraînement
train_transforms = transforms.Compose([
    transforms.RandomResizedCrop(224, scale=(0.7, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])  # Stats ImageNet
])

# Optimiseur différentié : LR plus élevé pour la tête, plus bas pour le backbone
optimizer = torch.optim.AdamW([
    {'params': model.layer4.parameters(), 'lr': 1e-4},
    {'params': model.fc.parameters(), 'lr': 1e-3}
], weight_decay=1e-4)

scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=30)
criterion = nn.CrossEntropyLoss(label_smoothing=0.1)

trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
total = sum(p.numel() for p in model.parameters())
print(f"Paramètres entraînables : {trainable:,} / {total:,} ({trainable/total*100:.1f}%)")
print(f"Device : {device}")
print("✅ Modèle ResNet-50 + Transfer Learning configuré")
```

---

## Module 3 — Architectures CNN Historiques & Benchmarks (1h30)

### 🔍 Tableau Comparatif des Architectures CNN

```
ÉVOLUTION DES ARCHITECTURES CNN (ImageNet Top-1 Accuracy)

  LeNet-5  (1998) : 7 couches,    60K params,   0.4%  Top-1 (MNIST ~99%)
  AlexNet  (2012) : 8 couches,    60M params,   56.5% Top-1 — ─▶ Début de l'ère DL
  VGGNet   (2014) : 19 couches,  138M params,   74.5% Top-1 — Très régulier (3x3 uniquement)
  GoogLeNet(2014) : 22 couches,   6.8M params,  74.8% Top-1 — Inception modules
  ResNet-50(2015) : 50 couches,   25M params,   76.1% Top-1 — Skip connections ─▶ >100 couches!
  EfficientNetB7(2019) : 813 couches (compound scaling), 85.5% Top-1
  Vision Transformer (ViT, 2020)  : Self-attention pour les images,  88.5% Top-1
  ConvNeXt (2022) : CNN modernisé inspiré des ViT,                   87.8% Top-1
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CNN** | Convolutional Neural Network — Réseau de neurones exploitant la structure spatiale locale des données |
| **BatchNorm** | Batch Normalization — Normalisation intermédiaire accélérant l'entraînement et stabilisant les gradients |
| **Transfer Learning** | Réutilisation d'un modèle pré-entraîné comme point de départ pour une nouvelle tâche |
| **ResNet** | Residual Network — Architecture CNN avec skip connections résolvent le vanishing gradient |
| **Feature Map** | Carte d'activation produite par un filtre de convolution appliqué à l'entrée |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Dimensionnalité CNN

Un CNN reçoit en entrée une image de 128×128×3. Il applique successivement : Conv 5×5 (stride=2, padding=0, 32 filtres), puis MaxPool 2×2 (stride=2), puis Conv 3×3 (stride=1, padding=1, 64 filtres). Calculez les dimensions de la feature map après chaque couche et le nombre de paramètres de chaque couche Conv.

**Corrigé guidé :**
1. Conv 5×5 (stride=2, pad=0, 32 filtres) : H' = (128-5)/2 + 1 = 62, shape = **62×62×32**. Params = 5×5×3×32 + 32 = **2432**.
2. MaxPool 2×2 (stride=2) : 62/2 = 31, shape = **31×31×32**. Params = 0.
3. Conv 3×3 (stride=1, pad=1, 64 filtres) : (31+2-3)/1+1 = 31, shape = **31×31×64**. Params = 3×3×32×64 + 64 = **18496**.

---

## Banque QCM — 5 Questions

**Q1.** La principale innovation des **Skip Connections (ResNet)** est :

- A) L'augmentation du batch size
- B) La création d'un chemin direct permettant au gradient de traverser les couches profondes sans disparaître (résolution du vanishing gradient) ✅
- C) La réduction du nombre de paramètres à 0
- D) Le remplacement de ReLU par Sigmoid

**Q2.** La **Batch Normalization** est typiquement placée :

- A) Avant la couche d'entrée uniquement
- B) Après la convolution et avant la fonction d'activation, normalisant les activations par batch pour stabiliser et accélérer l'entraînement ✅
- C) Uniquement dans la couche entièrement connectée finale
- D) Après le softmax de sortie

**Q3.** Dans le Transfer Learning, "geler" (freeze) les couches du backbone signifie :

- A) Réduire la température du serveur GPU
- B) Fixer les poids de ces couches (`requires_grad=False`) afin qu'ils ne soient pas mis à jour par l'optimiseur, préservant les features ImageNet apprises ✅
- C) Sauvegarder le modèle en format HDF5
- D) Réduire la taille des images à 32×32

**Q4.** Le receptive field d'une couche Conv 3×3 empilée 5 fois (sans pooling, stride=1) est :

- A) 3×3
- B) $(2 \times 5 - 1) \times 3 = 33$ pixels — Incorrect. Réponse exacte : $3 + (3-1) \times (5-1) = 3 + 8 = 11$ pixels de côté ✅
- C) 5×5
- D) 15×15

**Q5.** La **Data Augmentation** (RandomCrop, RandomFlip, ColorJitter) améliore la généralisation car :

- A) Elle augmente la taille du modèle
- B) Elle expose le modèle à des variations artificielles lors de l'entraînement, le rendant invariant à ces transformations et réduisant l'overfitting ✅
- C) Elle réduit le temps d'inférence
- D) Elle compresse les images PNG en JPEG

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
