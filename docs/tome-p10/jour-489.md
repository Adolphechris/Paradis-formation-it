# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 489 (6h) : Systèmes de Recommandation Avancés : Two-Tower Models, Neural Collaborative Filtering (NCF) & Architecture Two-Stage (Retrieval + Ranking)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre l'évolution des **Systèmes de Recommandation** : de la Factorisation Matricielle aux réseaux profonds
> - Découvrir l'architecture **Two-Stage** industrielle (Étape 1 : Retrieval / Candidate Generation, Étape 2 : Ranking / Scoring)
> - Implémenter une architecture **Two-Tower Neural Model (User Tower + Item Tower)** en PyTorch
> - Mesurer la qualité des recommandations avec les métriques **Hit@k** et **NDCG@k (Normalized Discounted Cumulative Gain)**
>
> **Compétences visées :** `AI-01` (A), `DATA-01` (A) — Deep Recommender Systems & Personalization

---

## Module 1 — Architecture Two-Stage & Two-Tower Models (2h)

### 📖 Intuition & Narration

Dans une plateforme à grande échelle (ex: catalogue de millions de cours IT ou de vidéos), il est impossible d'évaluer un modèle de classement lourd (Ranking) sur *chaque* élément pour *chaque* utilisateur en temps réel.

L'industrie applique la stratégie **Two-Stage Recommendation** :
1. **Étape 1 : Candidate Generation / Retrieval (Deux Tours)** : Filtrer un catalogue de 1 million d'items pour extraire les **100 à 500 candidats les plus pertinents** en moins de $10\text{ ms}$. Repose sur les architectures **Two-Tower** où le vecteur User $u$ et le vecteur Item $i$ sont projetés dans un même espace et interrogés via Vector Search (HNSW / FAISS).
2. **Étape 2 : Ranking (Scoring)** : Un modèle lourd et précis (Deep & Cross Network, DCNv2) classe ces 100 candidats en intégrant des caractéristiques fines de contexte (heure, connexion, historique récent).

### 🔍 Anatomie Technique — Architecture Two-Tower Model

```
ARCHITECTURE D'UN MODÈLE TWO-TOWER (User Tower + Item Tower)

  [ Caractéristiques Utilisateur ]               [ Caractéristiques d'Item ]
  (ID, Pays, Historique, Rôle)                   (ID, Catégorie, Tags, Vues)
                │                                             │
                ▼                                             ▼
     ┌──────────────────────┐                      ┌──────────────────────┐
     │  USER TOWER (MLP)    │                      │  ITEM TOWER (MLP)    │
     └──────────┬───────────┘                      └──────────┬───────────┘
                │                                             │
                ▼                                             ▼
  Embedding U (Shape: d=128)                     Embedding V (Shape: d=128)
                │                                             │
                └──────────────────────┬──────────────────────┘
                                       │
                                       ▼
                       PRODUIT SCALAIRE / SIMILARITÉ
                              Score(u, v) = u · v
                                       │
                                       ▼
                       Loss: InfoNCE / Sampled Softmax
```

---

## Module 2 — Atelier Pratique : Two-Tower Model en PyTorch (2h)

### 🛠️ Code PyTorch : Modèle de Recommandation Two-Tower avec Inférence Vectorielle

```python
#!/usr/bin/env python3
"""
PARADIS — Modèle de Recommandation Two-Tower (User Tower + Item Tower) en PyTorch
Génération de candidats et scoring pour recommandation de formations IT.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F

# 1. Tour Utilisateur (User Tower)
class UserTower(nn.Module):
    def __init__(self, num_users, embed_dim=32, output_dim=64):
        super().__init__()
        self.user_embed = nn.Embedding(num_users, embed_dim)
        self.mlp = nn.Sequential(
            nn.Linear(embed_dim, 128),
            nn.ReLU(),
            nn.Linear(128, output_dim)
        )

    def forward(self, user_ids):
        x = self.user_embed(user_ids)
        return F.normalize(self.mlp(x), p=2, dim=1)  # Embeddings normalisés L2

# 2. Tour Item / Formation (Item Tower)
class ItemTower(nn.Module):
    def __init__(self, num_items, embed_dim=32, output_dim=64):
        super().__init__()
        self.item_embed = nn.Embedding(num_items, embed_dim)
        self.mlp = nn.Sequential(
            nn.Linear(embed_dim, 128),
            nn.ReLU(),
            nn.Linear(128, output_dim)
        )

    def forward(self, item_ids):
        x = self.item_embed(item_ids)
        return F.normalize(self.mlp(x), p=2, dim=1)  # Embeddings normalisés L2

# 3. Système Global Two-Tower
class TwoTowerRecommender(nn.Module):
    def __init__(self, num_users, num_items, output_dim=64):
        super().__init__()
        self.user_tower = UserTower(num_users, output_dim=output_dim)
        self.item_tower = ItemTower(num_items, output_dim=output_dim)

    def forward(self, user_ids, item_ids):
        u_emb = self.user_tower(user_ids)
        v_emb = self.item_tower(item_ids)
        # Produit scalaire de similarité
        scores = (u_emb * v_emb).sum(dim=1)
        return scores

def run_two_tower_demo():
    num_users, num_items = 1000, 500
    model = TwoTowerRecommender(num_users=num_users, num_items=num_items)

    # Simulation d'interaction : Utilisateur 42 regarde le cours 105
    user_batch = torch.tensor([42, 10, 88])
    item_batch = torch.tensor([105, 3, 200])

    scores = model(user_batch, item_batch)

    print("[*] --- DÉMONSTRATION TWO-TOWER RECOMMENDER PARADIS IT ---")
    print(f"[+] Forme des scores prédits : {scores.shape}")
    print(f"    Similarité préférentielle (User 42 -> Item 105) : {scores[0].item():.4f}")
    print("  ✅ L'indexation offline des embeddings ItemTower dans FAISS permet le Retrieval < 5ms !")

if __name__ == "__main__":
    run_two_tower_demo()
```

---

## Module 3 — Métriques d'Évaluation : Hit@k & NDCG@k (1h30)

### 🔍 Métriques de Ranking (Evaluation de la Qualité des Recommandations)

```
MÉTRIQUES DE CLASSEMENT EN RECOMMANDATION

  1. HIT@K (Hit Ratio at K) :
     - Évalue si au moins UN item pertinent figure dans le Top-k des recommandations.
     - Hit@k = 1 si au moins 1 item aimé est dans le Top-k, sinon 0.

  2. NDCG@K (Normalized Discounted Cumulative Gain) :
     - Récompense les modèles qui placent les items les PLUS pertinents au TOUT DÉBUT de la liste (Pénalité logarithmique de position).
     - DCG@k = ∑_{i=1}^{k} ( 2^{rel_i} - 1 ) / log_2(i + 1)
     - NDCG@k = DCG@k / IDCG@k  (où IDCG est le classement idéal parfait).
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **NCF** | Neural Collaborative Filtering — Filtrage collaboratif basé sur des réseaux de neurones |
| **NDCG** | Normalized Discounted Cumulative Gain — Métrique de classement pondérant la position |
| **DCG** | Discounted Cumulative Gain — Cumul des gains de pertinence réduits par la position |
| **Hit@k** | Pourcentage de requêtes pour lesquelles l'élément recherché est présent dans les $k$ premiers |
| **DCNv2** | Deep & Cross Network v2 — Architecture de ranking capturant les interactions de variables |

---

## Exercices Pratiques

### Exercice 1 — Calcul de DCG@3 et NDCG@3

Un système de recommandation génère une liste ordonnée de 3 formations pour un utilisateur. Les niveaux de pertinence réels ($rel_i \in \{0, 1\}$) des 3 premières recommandations sont :
- Position 1 : $rel_1 = 0$ (Non pertinent).
- Position 2 : $rel_2 = 1$ (Pertinent).
- Position 3 : $rel_3 = 1$ (Pertinent).

1. Calculez le **DCG@3** du modèle avec la formule : $\text{DCG}@3 = \sum_{i=1}^{3} \frac{rel_i}{\log_2(i + 1)}$.
2. Le classement Idéal (IDCG@3) aurait placé les pertinents en tête : $[1, 1, 0]$. Calculez **IDCG@3**.
3. Calculez le score **NDCG@3**.

**Corrigé guidé :**
1. **Calcul du DCG@3** :
   - Position 1 ($i=1$) : $0 / \log_2(2) = 0 / 1 = 0$.
   - Position 2 ($i=2$) : $1 / \log_2(3) = 1 / 1.58496 \approx 0.6309$.
   - Position 3 ($i=3$) : $1 / \log_2(4) = 1 / 2 = 0.5000$.
   - $\text{DCG}@3 = 0 + 0.6309 + 0.5000 = 1.1309$.
2. **Calcul du IDCG@3 (Classement idéal $[1, 1, 0]$)** :
   - Position 1 : $1 / \log_2(2) = 1.0000$.
   - Position 2 : $1 / \log_2(3) \approx 0.6309$.
   - Position 3 : $0 / \log_2(4) = 0$.
   - $\text{IDCG}@3 = 1.0000 + 0.6309 = 1.6309$.
3. **Calcul du NDCG@3** :
   $$\text{NDCG}@3 = \frac{\text{DCG}@3}{\text{IDCG}@3} = \frac{1.1309}{1.6309} \approx 0.6934 \quad (69.34\%).$$

---

## Banque QCM — 5 Questions

**Q1.** Pourquoi les systèmes de recommandation à grande échelle utilisent-ils une architecture **Two-Stage (Retrieval + Ranking)** ?

- A) Parce que les GPUs ne savent pas lire les tables SQL.
- B) Parce qu'il est impossible d'évaluer un modèle de classement lourd sur des millions d'items en temps réel : l'étape de Retrieval filtre d'abord le catalogue en <10ms vers 100 candidats, que l'étape de Ranking classe ensuite avec précision. ✅
- C) Parce que deux modèles coûtent deux fois moins cher.
- D) Pour supprimer les utilisateurs inactifs.

**Q2.** Dans une architecture **Two-Tower Model**, que produit la **Item Tower** ?

- A) Le montant de la facture de l'utilisateur.
- B) Un vecteur d'embedding dense de dimension fixe représentatif des caractéristiques de l'item, pouvant être pré-indexé hors-ligne dans une base vectorielle (FAISS/Qdrant). ✅
- C) Le code HTML de la page d'accueil.
- D) Une alerte e-mail.

**Q3.** Que mesure la métrique **NDCG@k (Normalized Discounted Cumulative Gain)** par rapport au simple **Hit@k** ?

- A) La vitesse d'inférence du GPU.
- B) Elle prend en compte la position exacte des items recommandés, en attribuant un score plus élevé si les éléments les plus pertinents figurent au tout début de la liste (effet de pénalité logarithmique). ✅
- C) La taille du fichier de modèle sur disque.
- D) La quantité de mémoire RAM disponible.

**Q4.** Comment s'effectue la phase d'inférence ultra-rapide ($< 5\text{ ms}$) dans le composant **Retrieval** d'un Two-Tower Model ?

- A) En calculant le produit scalaire $u \cdot v$ du vecteur utilisateur $u$ généré à la volée avec l'ensemble des vecteurs items $v$ pré-indexés dans un index ANN (ex: HNSW/FAISS). ✅
- B) En envoyant un SMS à l'utilisateur.
- C) En lisant un fichier Excel ligne par ligne.
- D) En redémarrant le serveur.

**Q5.** Dans l'évaluation d'un système de recommandation, qu'est-ce qu'un **Hit@10 = 0.85** signifie ?

- A) Que l'utilisateur a cliqué 85 fois sur le même lien.
- B) Que pour 85% des requêtes d'utilisateurs, au moins une recommandation réellement pertinente figurait dans les 10 premiers résultats proposés. ✅
- C) Que 85% de la mémoire RAM est consommée.
- D) Que le modèle contient 10 couches.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
