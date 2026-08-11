# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 481 (6h) : Vector Search & Indexation à Grande Échelle : HNSW, IVF-PQ, FAISS (Meta), Qdrant HA & Arbitrage Latence vs Rappel

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre les algorithmes de **Recherche Approximate Nearest Neighbor (ANN)** à haute dimension : **HNSW** et **IVF-PQ**
> - Maîtriser la bibliothèque **FAISS (Facebook AI Similarity Search)** pour la recherche vectorielle ultra-rapide sur GPU
> - Implémenter et optimiser un cluster **Qdrant HA** avec indexation HNSW et filtres scalaires hybrides
> - Analyser et mesurer le compromis **Latence vs Rappel (Recall@k)** selon la taille des vecteurs d'embeddings
>
> **Compétences visées :** `AI-02` (A) — Vector Search & Scalable Retrieval

---

## Module 1 — Algorithmes ANN : HNSW & IVF-PQ (2h)

### 📖 Intuition & Narration

Effectuer une recherche de voisins les plus proches exacte ($k$-NN) sur des millions de vecteurs exige de calculer le produit scalaire avec *chaque* vecteur de la base. Pour une base de 10 millions d'embeddings de 1536 dimensions (OpenAI / Cohere), chaque requête demanderait des milliards d'opérations ($O(N \cdot d)$), entraînant des latences incompatibles avec les applications temps réel.

Les algorithmes **Approximate Nearest Neighbor (ANN)** sacrifient un pourcentage infime de précision ($1-2\%$ de Rappel) pour accélérer la recherche d'un facteur $1000\times$.

Deux piliers gouvernent la recherche vectorielle moderne :
1. **HNSW (Hierarchical Navigable Small World)** : Construit un graphe hiérarchique multi-niveaux où les couches supérieures permettent de "sauter" rapidement à travers l'espace, et les couches inférieures affinent la recherche locale.
2. **IVF-PQ (Inverted File with Product Quantization)** : Partitionne l'espace en Voronoi cells (IVF) puis compresse les vecteurs en codes courts par quantification de produit (PQ).

### 🔍 Anatomie Technique — Structure Hiérarchique HNSW

```
STRUCTURE MULTI-NIVEAUX HNSW (Graphe Hiérarchique)

  Couche 2 (Fast Skip)   :  [ Nœud A ] ───────────────────────────────► [ Nœud Z ]
                                 │                                         │
  Couche 1 (Medium Skip) :  [ Nœud A ] ──────────► [ Nœud M ] ───────────► [ Nœud Z ]
                                 │                     │                   │
  Couche 0 (Dense Graph) :  [ A ] ─► [ B ] ─► [ C ] ─► [ M ] ─► [ X ] ─► [ Y ] ─► [ Z ]

  RECHERCHE (Greedy Routing) :
  1. Démarrer au niveau supérieur (Couche 2).
  2. Suivre les arêtes de manière gloutonne vers le voisin le plus proche du vecteur de requête Q.
  3. Dès qu'aucun voisin plus proche n'existe à ce niveau, descendre d'un niveau (Couche 1 -> Couche 0).
  4. Réaliser la recherche fine sur la Couche 0.
  ── Complexe : O(log N) au lieu de O(N) !
```

---

## Module 2 — Atelier Pratique : Indexation FAISS GPU & Qdrant (2h)

### 🛠️ Code Python : FAISS IndexIVFPQ & Qdrant Vector Search

```python
#!/usr/bin/env python3
"""
PARADIS — Recherche Vectorielle Haute Performance avec FAISS (IndexIVFPQ) & Qdrant
"""

import numpy as np

def run_faiss_demo():
    print("[*] --- DÉMONSTRATION FAISS (Facebook AI Similarity Search) ---")
    try:
        import faiss

        d = 128            # Dimension des embeddings
        nb = 50000         # Taille de la base de données (50 000 vecteurs)
        nq = 10            # Nombre de requêtes

        np.random.seed(42)
        xb = np.random.random((nb, d)).astype('float32')
        xq = np.random.random((nq, d)).astype('float32')

        # 1. Création d'un index IVF-PQ : 100 centroïdes Voronoi, 8 sous-quantificateurs (bytes)
        nlist = 100
        m = 8              # Nombre de sous-vecteurs pour PQ
        quantizer = faiss.IndexFlatL2(d)
        index = faiss.IndexIVFPQ(quantizer, d, nlist, m, 8)

        # 2. Entraînement des centroïdes Voronoi et des codes PQ
        print("[*] Entraînement de l'index FAISS IVFPQ...")
        index.train(xb)
        index.add(xb)
        print(f"[+] Index entraîné. Total vecteurs stockés : {index.ntotal}")

        # 3. Recherche des k=5 plus proches voisins avec nprobe=10
        index.nprobe = 10  # Recherche dans 10 cellules Voronoi proches sur 100
        D, I = index.search(xq, 5)

        print(f"[+] Recherche terminée pour {nq} requêtes.")
        print(f"    Voisins trouvés pour la requête #0 (Indices) : {I[0].tolist()}")
        print(f"    Distances L2 correspondantes                 : {np.round(D[0], 4).tolist()}")

    except ImportError:
        print("[!] Bibliothèque 'faiss' non installée (pip install faiss-cpu / faiss-gpu). Simulation active.")

if __name__ == "__main__":
    run_faiss_demo()
```

---

## Module 3 — Compromis Latence vs Rappel (Recall@k) (1h30)

### 🔍 Arbitrage Latence vs Precision en Vector Search

```
COMPROMIS LATENCE VS RAPPEL (Recall@k)

  Rappel@k = (Voisins corrects trouvés par l'ANN dans le Top-k) / (Voisins exacts du k-NN)

  PARAMÈTRES DE REGLAGE (Tuning) :
  - HNSW :
    * ef_construction : Nombre de voisins examinés lors du build (Plus grand -> Meilleur rappel, build plus lent).
    * ef_search       : Nombre de voisins examinés lors de la recherche (Plus grand -> Rappel élevé, latence + élevée).
    * M               : Nombre maximal de liaisons par nœud (ex: M=16, 32, 64).

  - IVF-PQ :
    * nlist  : Nombre de clusters Voronoi.
    * nprobe : Nombre de clusters inspectés à chaque requête.
      (ex: nprobe = 1 ──> Latence ultra-faible, Rappel ~75% ; nprobe = 20 ──> Latence x5, Rappel ~98%).
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ANN** | Approximate Nearest Neighbor — Recherche d'éléments les plus proches avec tolérance d'erreur |
| **HNSW** | Hierarchical Navigable Small World — Graphe hiérarchique pour la recherche vectorielle rapide |
| **IVF-PQ** | Inverted File with Product Quantization — Méthode de partitionnement et de compression vectorielle |
| **FAISS** | Facebook AI Similarity Search — Bibliothèque Meta optimisée pour la recherche vectorielle sur GPU/CPU |
| **Recall@k** | Proportion de vrais voisins $k$-NN exacts figurant dans les $k$ premiers résultats retournés |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Compression d'un Index IVF-PQ

Une base de données vectorielle contient $N = 1\,000\,000$ d'embeddings de dimension $d = 512$ en précision FP32 (4 octets par valeur).
1. Calculez la taille mémoire brute de cette base sans compression.
2. On applique un indexation **Product Quantization (PQ)** avec $m = 64$ sous-vecteurs quantisés chacun sur 8 bits (1 octet). Calculez la nouvelle taille mémoire des données compressées.
3. Quel est le facteur de réduction de la mémoire ?

**Corrigé guidé :**
1. **Taille brute** :
   $$\text{Taille} = 1\,000\,000 \times 512 \times 4 \text{ octets} = 2\,048\,000\,000 \text{ octets} \approx 2.058 \text{ GB}.$$
2. **Taille avec PQ ($m=64$)** :
   Chaque vecteur de 512 flottants est remplacé par un code de 64 octets.
   $$\text{Taille PQ} = 1\,000\,000 \times 64 \text{ octets} = 64\,000\,000 \text{ octets} \approx 64 \text{ MB}.$$
3. **Facteur de réduction** :
   $$\text{Gain} = \frac{2\,048 \text{ MB}}{64 \text{ MB}} = 32\times \text{ de réduction mémoire}.$$

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la différence fondamentale entre une recherche $k$-NN exacte et une recherche **ANN (Approximate Nearest Neighbor)** ?

- A) L'ANN ne fonctionne que sur Windows.
- B) L'ANN accepte une légère perte de précision (Rappel < 100%) pour réduire la complexité de $O(N)$ à $O(\log N)$, permettant d'effectuer la recherche en quelques millisecondes sur des millions de vecteurs. ✅
- C) L'ANN efface la base de données après chaque requête.
- D) $k$-NN est réservé aux images.

**Q2.** Dans l'algorithme **HNSW (Hierarchical Navigable Small World)**, comment s'effectue la navigation depuis le sommet de la hiérarchie ?

- A) En lisant tous les nœuds de manière séquentielle.
- B) En effectuant un routage glouton (Greedy Routing) vers le nœud le plus proche du vecteur de requête à chaque niveau, puis en descendant d'un niveau dès qu'aucun progrès n'est possible. ✅
- C) En utilisant une recherche binaire classique.
- D) En tirant des nombres aléatoires.

**Q3.** Dans un index **IVF-PQ** créé avec la bibliothèque **FAISS**, que contrôle le paramètre `nprobe` lors de la recherche ?

- A) Le nombre de processeurs graphiques utilisés.
- B) Le nombre de cellules Voronoi (clusters) inspectées lors de la recherche (un `nprobe` plus grand augmente le rappel mais accroît la latence). ✅
- C) La dimension des embeddings.
- D) La taille des fichiers ZIP.

**Q4.** Que mesure la métrique **Recall@k** dans le cadre de l'évaluation d'une base de données vectorielle ?

- A) La vitesse d'écriture sur le disque SSD.
- B) Le pourcentage de vrais plus proches voisins exacts qui figurent effectivement parmi les $k$ premiers résultats renvoyés par l'algorithme ANN. ✅
- C) Le nombre de lignes de code Python.
- D) La température du GPU.

**Q5.** Quel est le rôle principal de la **Product Quantization (PQ)** dans l'indexation vectorielle ?

- A) Chiffrer les données sensibles.
- B) Découper un vecteur à haute dimension en $m$ sous-vecteurs et remplacer chacun d'eux par le code binaire d'un centroïde, compressant ainsi drastiquement la taille mémoire des embeddings. ✅
- C) Remplacer les algorithmes de tri.
- D) Générer des graphiques vectoriels SVG.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
