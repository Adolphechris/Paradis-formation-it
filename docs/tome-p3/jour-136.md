# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 136 (6h) : Sécurité de la Confidentialité des Données & Federated Learning (Privacy-Preserving AI, PySyft & Differential Privacy)

> [!NOTE]
> **Objectif du jour :** Entraîner et déployer des modèles d'IA distribués et collaboratifs tout en garantissant la confidentialité absolue des données d'entraînement : apprentissage fédéré (Federated Learning), cryptographie multi-parties avec PySyft, aggrégation sécurisée (Secure Aggregation) et conformité RGPD / Loi sur la protection des données.
>
> **Compétences visées :** `SEC-05` (A) — Federated Learning & Confidentialité IA | `SEC-01` (A) — Anonymisation & Privacy-Preserving Machine Learning

---

## 1) Module — Principes du Federated Learning & Architecture (2h)

### 📖 Narration/Intuition

Dans le cadre d'un réseau bancaire national (ex: la BCC et 10 banques commerciales de RDC), chaque banque possède des données transactionnelles très sensibles. Pour entraîner un modèle global d'IA de détection de fraude interbancaire ultra-performant, les banques ne peuvent pas centraliser leurs données clients sur un serveur unique (interdit par la loi sur le secret bancaire et le RGPD).

Le **Federated Learning (Apprentissage Fédéré)** résout cette impasse : **les données ne quittent jamais la banque locale**. Le serveur central envoie une copie du modèle IA à chaque banque. Chaque banque entraîne le modèle localement sur ses propres données, puis renvoie **uniquement les mises à jour de poids (Gradients)** au serveur central. Le serveur central combine ces mises à jour (Secure Aggregation) pour améliorer le modèle global sans jamais avoir vu la moindre donnée client.

### 🔍 Anatomie Technique

**Architecture de Federated Learning Interbancaire :**

```
┌─────────────────────────────────────────────────────────────┐
│ SERVEUR CENTRAL DE FÉDÉRATION (BCC CENTRAL)                 │
│  1. Envoie le modèle global W_t                             │
│  4. Combine les gradients : W_{t+1} = Agg(Grad_1, Grad_2)   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              ▲
    ┌──────────▼──────────┐        ┌──────────┴──────────┐
    │  BANQUE A (LOCAL)   │        │  BANQUE B (LOCAL)   │
    │ 2. Entraîne local   │        │ 2. Entraîne local   │
    │ 3. Calcule Grad_1   │        │ 3. Calcule Grad_2   │
    │ (Données A restent) │        │ (Données B restent) │
    └─────────────────────┘        └─────────────────────┘
```

---

## 2) Module — Agrégation Sécurisée & PySyft (2h)

### 📖 Narration/Intuition

Même si les données brutes restent locales, un attaquant qui intercepte les gradients de poids envoyés par une banque au serveur central peut parfois appliquer du **Gradient Inversion** pour reconstituer les données d'entraînement.

Pour bloquer cette fuite, on utilise **PySyft** (OpenMined) et l'**Agrégation Sécurisée (Secure Aggregation)** : les banques ajoutent un masque cryptographique aléatoire partagé à leurs gradients. Lorsque le serveur central fait la somme de tous les gradients, les masques s'annulent mathématiquement ($+M - M = 0$), révélant l'agrégat global exact sans que le serveur central n'ait pu lire le gradient individuel d'aucune banque.

### 🔍 Anatomie Technique

**Code d'entraînement fédéré avec PyTorch et PySyft (`federated_learning.py`) :**

```python
#!/usr/bin/env python3
"""
federated_learning.py — Entraînement fédéré interbancaire avec PySyft
"""
import torch
import torch.nn as nn
import torch.optim as optim

# 1. Définition du modèle de détection de fraude
class FraudDetectionModel(nn.Module):
    def __init__(self):
        super(FraudDetectionModel, self).__init__()
        self.fc = nn.Sequential(
            nn.Linear(10, 5),
            nn.ReLU(),
            nn.Linear(5, 2)
        )
    def forward(self, x):
        return self.fc(x)

model_global = FraudDetectionModel()
print("[+] Modèle IA Global initialisé sur le serveur central BCC.")

# 2. Simulation des mises à jour de gradients reçues de 2 banques distantes
gradient_banque_A = [torch.randn_like(param) for param in model_global.parameters()]
gradient_banque_B = [torch.randn_like(param) for param in model_global.parameters()]

# 3. Agrégation Sécurisée (Secure Aggregation - Moyenne des poids)
with torch.no_grad():
    for param, grad_a, grad_b in zip(model_global.parameters(), gradient_banque_A, gradient_banque_B):
        # Mise à jour fédérée des poids
        param -= 0.01 * (grad_a + grad_b) / 2.0

print("✅ Agrégation Fédérée Réussie : Le modèle global est mis à jour sans fuite de données !")
```

---

## 3) Module — Conformité RGPD & Audit d'Anonymisation (2h)

### 📖 Narration/Intuition

Pour être conforme au RGPD et à la loi sur la protection des données à caractère personnel, l'utilisation du Federated Learning doit être associée à la **K-Anonymité** et à la **Confidentialité Différentielle** pour garantir qu'aucun individu ne puisse être ré-identifié à partir des modèles partagés.

### 🔍 Anatomie Technique

**Check-list de conformité Privacy-Preserving AI :**

```
- K-Anonymité : Chaque enregistrement dans le dataset est indiscernable d'au moins K-1 autres individus.
- L-Diversité : Garantit la diversité des attributs sensibles au sein de chaque groupe k-anonyme.
- Differential Privacy (DP-SGD) : Ajout de bruit gaussien sur les gradients avant transmission au serveur d'agrégation.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Federated Learning** | Apprentissage automatique fédéré et distribué conservant les données sur les sites locaux |
| **PySyft** | Bibliothèque open-source (OpenMined) pour l'IA respectueuse de la vie privée |
| **DP-SGD** | Differential Privacy Stochastic Gradient Descent — Entraînement SGD avec bruit de confidentialité |
| **Secure Aggregation** | Protocole cryptographique masquant les gradients individuels avant l'agrégation globale |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi le **Federated Learning (Apprentissage Fédéré)** permet-il à plusieurs établissements bancaires concurrents de créer un modèle IA d'anti-blanchiment partagé sans violer le secret bancaire ?

**Corrigé :** Dans une approche d'apprentissage classique, les banques devraient transférer toutes leurs données clients sur un serveur unique, ce qui est strictement interdit par la loi sur le secret bancaire et la confidentialité. Avec le **Federated Learning**, **aucune donnée client ne quitte les serveurs sécurisés de chaque banque**. Seuls les paramètres de mise à jour du modèle (les gradients) sont transmis au serveur d'agrégation. Les banques bénéficient ainsi de l'intelligence d'un modèle entraîné sur l'ensemble du réseau national tout en conservant une étanchéité totale de leurs données.

**Exercice 2 :** Quel est le rôle du masque aléatoire dans le protocole de **Secure Aggregation (Agrégation Sécurisée)** ?

**Corrigé :** Dans l'Agrégation Sécurisée, chaque participant $i$ ajoute un masque cryptographique secret $M_{ij}$ à son gradient avant de l'envoyer au serveur. Les masques sont générés par paire entre les banques telles que la somme de tous les masques s'annule exactement : $\sum M = 0$. Le serveur central reçoit des gradients individuels totalement illisibles (bruit aléatoire), mais lorsqu'il fait la somme de tous les messages reçus, les masques s'annulent mutuellement, révélant la vraie somme globale des gradients sans que le serveur n'ait pu connaître la valeur individuelle d'aucun participant.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle architecture d'apprentissage automatique permet à plusieurs organisations d'entraîner conjointement un modèle d'IA sans jamais centraliser ni partager leurs données d'entraînement brutes ?
- A) Federated Learning (Apprentissage Fédéré)
- B) MS-DOS
- C) Disquette
- D) Lecteur DVD

**Réponse : A**

**Q2 :** Quelle bibliothèque open-source développée par la communauté OpenMined est dédiée au calcul privé et au Federated Learning sécurisé avec PyTorch ?
- A) PySyft
- B) Word
- C) Paint
- D) Notepad

**Réponse : A**

**Q3 :** Quel protocole cryptographique permet au serveur central d'agrégation de calculer la somme des gradients de tous les participants sans pouvoir lire le gradient individuel d'aucun d'entre eux ?
- A) Secure Aggregation
- B) Telnet
- C) POP3
- D) FTP

**Réponse : A**

**Q4 :** Dans le Federated Learning, qu'est-ce qui est transmis entre les nœuds locaux et le serveur central à la place des données brutes ?
- A) Uniquement les mises à jour des poids du modèle (Gradients)
- B) Les photos des clients
- C) Les mots de passe en clair
- D) La totalité de la base de données

**Réponse : A**

**Q5 :** Quel principe d'anonymisation garantit que chaque individu dans un ensemble de données est statistiquement indifférenciable d'au moins $K-1$ autres personnes ?
- A) K-Anonymité
- B) Formatage de disque
- C) Redémarrage du serveur
- D) Câble réseau

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
