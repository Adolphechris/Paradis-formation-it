# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 469 (6h) : Graph Neural Networks (GNN) : GCN, GraphSAGE, Graph Attention Networks (GAT) & Applications Réseau/Sécurité

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre la représentation des données non-euclidiennes sous forme de graphes $\mathcal{G} = (\mathcal{V}, \mathcal{E})$ et matrice d'adjacence $A$
> - Maîtriser le paradigme de passage de messages (**Message Passing Neural Networks — MPNN**) : Agrégation et Mise à jour
> - Implémenter un **GCN (Graph Convolutional Network)** et un **GAT (Graph Attention Network)** avec **PyTorch Geometric (PyG)**
> - Appliquer les GNNs à la détection de nœuds malveillants dans une topologie réseau entreprise
>
> **Compétences visées :** `AI-01` (A) — Graph Neural Networks & Topological Deep Learning

---

## Module 1 — Représentation de Graphes & Message Passing (2h)

### 📖 Intuition & Narration

La plupart des données du monde réel ne s'organisent pas en grilles régulières (comme les images) ou en séquences linéaires (comme le texte). Les topologies réseau (routeurs, commutateurs, serveurs), les structures moléculaires, les transactions financières et les réseaux sociaux sont naturellement modélisés sous forme de **Graphes**.

Un **Graph Neural Network (GNN)** permet d'appliquer le Deep Learning directement sur ces structures non-euclidiennes. Chaque nœud échange des informations avec ses voisins directs (voisinage à 1-hop), puis agrège ces messages pour mettre à jour son propre vecteur de caractéristiques. En empilant $K$ couches GNN, chaque nœud capture l'information de son voisinage à $K$-hops.

### 🔍 Anatomie Technique — Paradigme Message Passing (MPNN)

```
ÉQUATIONS DU MESSAGE PASSING (Kipf & Welling / Gilmer et al.)

  Pour un nœud i avec un ensemble de voisins N(i) :

  1. AGGRÉGATION (Message Generation & Aggregation) :
     m_N(i)^(l) = AGGREGATE^{(l)} ( { MSG^{(l)} ( h_j^{(l-1)}, h_i^{(l-1)}, e_{j,i} ) | j ∈ N(i) } )

  2. MISE À JOUR (State Update) :
     h_i^{(l)} = UPDATE^{(l)} ( h_i^{(l-1)}, m_N(i)^(l) )

ÉQUATION DU GCN (Graph Convolutional Network — Kipf & Welling 2017) :

  H^{(l+1)} = σ( D̃^{-1/2} Ã D̃^{-1/2} H^{(l)} W^{(l)} )

  où :
  - Ã = A + I_N  : Matrice d'adjacence avec boucles sur soi (Self-loops).
  - D̃           : Matrice des degrés diagonale de Ã.
  - D̃^{-1/2} Ã D̃^{-1/2} : Normalisation symétrique empêchant l'explosion/disparition des activations.
  - W^{(l)}      : Matrice de poids entraînables de la couche l.
```

---

## Module 2 — Atelier Pratique : GCN avec PyTorch Geometric (PyG) (2h)

### 🛠️ Code PyTorch Geometric : Classification de Nœuds Réseau (Node Classification)

```python
#!/usr/bin/env python3
"""
PARADIS — Classification de Nœuds Malveillants sur Topologie Réseau avec PyTorch Geometric (PyG)
"""

import torch
import torch.nn as nn
import torch.nn.functional as F

try:
    from torch_geometric.nn import GCNConv, GATConv
    from torch_geometric.data import Data
    PYG_AVAILABLE = True
except ImportError:
    PYG_AVAILABLE = False

# 1. Définition de l'Architecture GCN (Graph Convolutional Network)
class NetworkSecurityGCN(nn.Module):
    def __init__(self, in_features: int, hidden_dim: int, num_classes: int):
        super().__init__()
        # Première couche GCN : Agrégation à 1-hop
        self.conv1 = GCNConv(in_features, hidden_dim)
        # Seconde couche GCN : Agrégation à 2-hops
        self.conv2 = GCNConv(hidden_dim, num_classes)

    def forward(self, x, edge_index):
        # x: Tenseur de features des nœuds (num_nodes, in_features)
        # edge_index: Tenseur d'adjacence au format COO (2, num_edges)

        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.2, training=self.training)
        x = self.conv2(x, edge_index)

        return F.log_softmax(x, dim=1)

def run_gnn_demo():
    if not PYG_AVAILABLE:
        print("[!] PyTorch Geometric (torch_geometric) non installé. Démo exécutée en mode simulation conceptuelle.")
        print("    Pour installer : pip install torch-geometric")
        return

    torch.manual_seed(42)

    # 2. Construction d'un graphe de topologie réseau synthétique
    # 5 Nœuds (Serveurs / Routeurs)
    # Features par nœud : [num_connections, cpu_load, open_ports]
    x = torch.tensor([
        [150.0, 0.85, 22.0],  # Nœud 0 (Sain)
        [200.0, 0.90, 80.0],  # Nœud 1 (Sain)
        [5000.0, 0.99, 443.0], # Nœud 2 (Infecté - Botnet)
        [10.0, 0.10, 2.0],    # Nœud 3 (Sain)
        [4800.0, 0.98, 8080.0] # Nœud 4 (Infecté - C2)
    ], dtype=torch.float)

    # Arêtes (Connexions réseau bidirectionnelles au format COO)
    edge_index = torch.tensor([
        [0, 1, 1, 2, 2, 4, 3, 0, 2, 0],
        [1, 0, 2, 1, 4, 2, 0, 3, 0, 2]
    ], dtype=torch.long)

    # Classes : 0 = Nœud Legitime, 1 = Nœud Compromis
    y = torch.tensor([0, 0, 1, 0, 1], dtype=torch.long)

    data = Data(x=x, edge_index=edge_index, y=y)

    # Instanciation du modèle GCN
    model = NetworkSecurityGCN(in_features=3, hidden_dim=16, num_classes=2)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=5e-4)

    # Entraînement sur le graphe
    model.train()
    for epoch in range(100):
        optimizer.zero_grad()
        out = model(data.x, data.edge_index)
        loss = F.nll_loss(out, data.y)
        loss.backward()
        optimizer.step()

    # Évaluation
    model.eval()
    pred = model(data.x, data.edge_index).argmax(dim=1)
    acc = int((pred == data.y).sum()) / len(data.y)

    print(f"[+] Entraînement GCN Terminé | Loss Finale: {loss.item():.4f} | Précision: {acc*100:.1f}%")
    print(f"    Prédictions des Nœuds : {pred.tolist()} (Réel: {data.y.tolist()})")

if __name__ == "__main__":
    run_gnn_demo()
```

---

## Module 3 — Graph Attention Networks (GAT) & GraphSAGE (1h30)

### 🔍 Variantes GNN : GAT & GraphSAGE

```
COMPARAISON GCN vs GRAPHSAGE vs GAT

  1. GCN (Graph Convolutional Network) :
     - Poids d'agrégation FIXES basés uniquement sur la structure topologique (degré des nœuds).
     - Nécessite le graphe complet en mémoire (Transductif).

  2. GraphSAGE (Sample and Aggregate) :
     - Échantillonne un nombre fixe de voisins (ex: 10 voisins à 1-hop, 25 à 2-hops).
     - Inductif : Peut prédire sur de NOUVEAUX nœuds ajoutés au graphe sans re-entraîner !

  3. GAT (Graph Attention Network — Veličković et al. 2018) :
     - Utilise un mécanisme d'Attention Multi-Têtes pour PONDÉRER DYNAMIOUEMENT l'importance de chaque voisin.
     - α_{i,j} = Softmax_j ( LeakyReLU ( a^T [ W*h_i || W*h_j ] ) )
     - Permet d'ignorer les connexions non pertinentes ou bruyantes.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **GNN** | Graph Neural Network — Réseau de neurones conçu pour traiter des données en structure de graphe |
| **GCN** | Graph Convolutional Network — Convolution de graphe basée sur la normalisation de la matrice d'adjacence |
| **GAT** | Graph Attention Network — GNN utilisant le mécanisme d'attention pour pondérer le voisinage |
| **MPNN** | Message Passing Neural Network — Framework générique de passage et d'agrégation de messages sur graphe |
| **COO Format** | Coordinate Format — Format de stockage de matrice creuse sous forme de paires (ligne, colonne) |

---

## Exercices Pratiques

### Exercice 1 — Calcul de la Matrice d'Adjacence Normalisée GCN

Considérez un graphe non orienté simple à 3 nœuds connecté en ligne : $1 - 2 - 3$.
1. Écrivez la matrice d'adjacence d'origine $A$.
2. Écrivez la matrice d'adjacence avec boucles sur soi $Ã = A + I_3$.
3. Calculez le degré de chaque nœud dans $Ã$ et formez la matrice des degrés $D̃$.

**Corrigé guidé :**
1. Matrice $A$ :
   $$A = \begin{pmatrix} 0 & 1 & 0 \\ 1 & 0 & 1 \\ 0 & 1 & 0 \end{pmatrix}$$
2. Matrice $Ã = A + I_3$ :
   $$\tilde{A} = \begin{pmatrix} 1 & 1 & 0 \\ 1 & 1 & 1 \\ 0 & 1 & 1 \end{pmatrix}$$
3. Degrés des nœuds (somme de chaque ligne de $Ã$) :
   - Nœud 1 : $1 + 1 + 0 = 2$
   - Nœud 2 : $1 + 1 + 1 = 3$
   - Nœud 3 : $0 + 1 + 1 = 2$
   Matrice diagonale des degrés $\tilde{D} = \text{diag}(2, 3, 2)$.

---

## Banque QCM — 5 Questions

**Q1.** Pourquoi les réseaux de neurones classiques (CNN, MLP) sont-ils inadaptés au traitement direct de topologies réseau complexes ?

- A) Parce que les réseaux de neurones ne fonctionnent qu'avec des images PNG.
- B) Parce que les topologies réseau sont des structures non-euclidiennes invariantes aux permutations de nœuds et sans ordre fixe de voisinage. ✅
- C) Parce que Python ne sait pas lire les adresses IP.
- D) Parce qu'ils requièrent obligatoirement un processeur TPU.

**Q2.** Dans le paradigme du **Message Passing (MPNN)**, que fait un nœud à la couche $l$ ?

- A) Il envoie son adresse MAC à tous les routeurs du cluster.
- B) Il collecte et agrège les représentations vectorielles de ses voisins directs à la couche $l-1$, puis met à jour son propre état. ✅
- C) Il supprime les arêtes ayant un poids négatif.
- D) Il réinitialise ses poids d'apprentissage.

**Q3.** Quelle est la différence majeure entre l'approche d'un **GCN** et celle d'un **GAT (Graph Attention Network)** ?

- A) GCN utilise PyTorch, GAT utilise TensorFlow.
- B) GCN utilise des coefficients d'agrégation fixes basés sur les degrés des nœuds, alors que GAT apprend dynamiquement des poids d'attention $\alpha_{i,j}$ différenciés par voisin. ✅
- C) GAT ne fonctionne pas sur GPU.
- D) GCN s'applique uniquement au texte.

**Q4.** Quel est l'avantage clé de **GraphSAGE** par rapport au GCN traditionnel pour des graphes dynamiques à grande échelle ?

- A) GraphSAGE ne nécessite aucune matrice d'adjacence.
- B) GraphSAGE est une méthode inductive qui échantillonne un sous-ensemble fixe de voisins, lui permettant de prédire sur de nouveaux nœuds jamais vus lors de l'entraînement. ✅
- C) GraphSAGE réduit le nombre de classes à 1.
- D) GraphSAGE n'utilise pas de fonctions d'activation.

**Q5.** Dans PyTorch Geometric (PyG), sous quel format le tenseur `edge_index` représente-t-il la structure des arêtes du graphe ?

- A) Sous forme d'une matrice carrée dense $N \times N$.
- B) Sous forme d'un tenseur de forme $(2, E)$ au format COO contenant les indices des nœuds source et destination. ✅
- C) Sous forme d'une liste de chaînes de caractères.
- D) Sous forme d'un dictionnaire JSON compressé.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
