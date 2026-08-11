# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 563 (6h) : Database Engineering Avancé : PostgreSQL Internals, CockroachDB & Vector Databases (pgvector)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre l'architecture interne de **PostgreSQL** : MVCC (Multi-Version Concurrency Control), WAL (Write-Ahead Logging), Autovacuum, et indexation (B-Tree, GIN, GiST, BRIN)
> - Concevoir des bases de données distribuées NewSQL avec **CockroachDB** (consensus Raft, transactions ACID distribuées, partitionnement géographique)
> - Exploiter les **Bases de Données Vectorielles (Vector DBs)** pour les applications IA/RAG : embeddings, distances (Cosine, L2, Inner Product) et index HNSW / IVFFlat avec `pgvector`
> - Optimiser les requêtes complexes et diagnostiquer la fragmentation avec `EXPLAIN ANALYZE`
>
> **Compétences visées :** `DATA-01` (A), `ARCH-01` (A) — Database Engineering, PostgreSQL Internals, Distributed SQL & Vector DBs

---

## Module 1 — Rouages Internes PostgreSQL & MVCC (2h)

### 📖 Intuition & Narration

PostgreSQL est surnommé "la base de données relationnelle la plus avancée au monde". Mais pour tirer pleinement parti de sa puissance et éviter les ralentissements mystérieux en production, un ingénieur doit comprendre ce qui se passe sous le capot.

Quand une requête `UPDATE` ou `DELETE` est exécutée dans PostgreSQL, la ligne originale n'est **jamais modifiée sur le disque en place**. Grâce au système **MVCC (Multi-Version Concurrency Control)**, PostgreSQL crée une nouvelle version de la ligne (tuple) et marque l'ancienne comme périmée (définie par `xmin` et `xmax`). Cela permet à des requêtes de lecture de lire l'ancienne version sans être bloquées par les requêtes d'écriture (Lecteurs et Écrivains ne se bloquent pas).

Cependant, ces lignes mortes s'accumulent (bloat) et doivent être nettoyées par le processus d'arrière-plan **Autovacuum**.

```
MÉCANISME MVCC POSTGRESQL & AUTOVACUUM

  LIGNE ORIGINALE : [xmin=100, xmax=105] (Morte pour les transactions > 105)
  NOUVELLE LIGNE  : [xmin=105, xmax=0  ] (Vivante)
       │
       ▼ (Accumulation de lignes mortes = Bloat)
  PROCESSUS AUTOVACUUM ──→ Libère l'espace mort et met à jour la Visibility Map
```

---

## Module 2 — Distributed SQL (CockroachDB) & Vector DBs (pgvector) (2h)

### 🔍 Distributed NewSQL : CockroachDB

**CockroachDB** combine les garanties ACID strictes du SQL traditionnel avec la scalabilité horizontale et la résilience d'un système NoSQL distribué (inspiré de Google Spanner).

- **Protocol Consensus Raft** : Les données sont découpées en "Ranges" (64 MB) et répliquées sur 3 ou 5 nœuds via le protocole Raft.
- **Geo-Partitioning** : Possibilité d'ancrer les données d'un utilisateur européen sur des nœuds situés en France (conformité RGPD) tout en conservant une table globale.

### 🔍 Vector Databases (pgvector) & Recherche de Similarité IA

Avec l'émergence des LLMs et du RAG (Retrieval-Augmented Generation), la recherche de données ne se fait plus par égalité stricte (`WHERE id = 42`), mais par **similarité sémantique dans un espace vectoriel à N dimensions** (ex: 1536 dimensions pour OpenAI `text-embedding-3-small`).

L'extension **`pgvector`** transforme PostgreSQL en une base de données vectorielle haute performance.

```
DISTANCE VECTORIELLE & INDEX HNSW

  1. Distance Cosinus (Cosine Distance)   : Mesure l'angle entre deux vecteurs (recommandée pour NLP/Text)
  2. Distance Euclidienne (L2 Distance)   : Mesure la distance géométrique directe
  3. Produit Scalaire (Inner Product / IP): Utile pour les vecteurs normalisés

  INDEX HNSW (Hierarchical Navigable Small World) :
  Crée un graphe multicouche permettant de trouver les K-plus proches voisins (k-NN)
  en O(log N) au lieu d'un scan séquentiel O(N).
```

---

## Module 3 — Atelier Pratique : PostgreSQL Vector & Performance Engine (1h30)

### 🛠️ Script SQL & Python : Vector Search Engine avec pgvector

```python
#!/usr/bin/env python3
"""
PARADIS — Vector Search Engine with pgvector & HNSW Indexing Simulator
Simule la recherche de similarité sémantique vectorielle (k-NN) sur des embeddings textuels.
"""
import math
from dataclasses import dataclass
from typing import List, Tuple

@dataclass
class DocumentVector:
    doc_id: str
    content: str
    embedding: List[float]  # Vecteur à N dimensions (ici N=5 pour la démo)

class VectorSearchEngine:
    def __init__(self):
        self.documents: List[DocumentVector] = []

    def add_document(self, doc_id: str, content: str, embedding: List[float]):
        self.documents.append(DocumentVector(doc_id, content, embedding))

    @staticmethod
    def _cosine_similarity(v1: List[float], v2: List[float]) -> float:
        """Calcule la similarité cosinus entre deux vecteurs (résultat entre -1.0 et 1.0)"""
        dot_product = sum(a * b for a, b in zip(v1, v2))
        norm_v1 = math.sqrt(sum(a * a for a in v1))
        norm_v2 = math.sqrt(sum(b * b for b in v2))
        if norm_v1 == 0 or norm_v2 == 0:
            return 0.0
        return dot_product / (norm_v1 * norm_v2)

    def search_similar(self, query_vector: List[float], top_k: int = 3) -> List[Tuple[DocumentVector, float]]:
        results = []
        for doc in self.documents:
            sim = self._cosine_similarity(query_vector, doc.embedding)
            results.append((doc, sim))

        # Trier par similarité décroissante
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]

    def print_search_results(self, query_text: str, query_vector: List[float], top_k: int = 3):
        matches = self.search_similar(query_vector, top_k)

        print("=" * 70)
        print("  PARADIS VECTOR SEARCH ENGINE (SIMULATION PGVECTOR + HNSW)")
        print(f"  Recherche Sémantique : '{query_text}'")
        print("=" * 70)
        print()

        for i, (doc, score) in enumerate(matches, 1):
            distance_cosine = 1.0 - score  # pgvector <=> operator (cosine distance)
            print(f"  [{i}] Doc ID : {doc.doc_id:<12} | Score Similarité: {score*100:5.1f}% | Distance: {distance_cosine:.4f}")
            print(f"      Contenu : {doc.content}")
            print()

        print("=" * 70)


if __name__ == "__main__":
    engine = VectorSearchEngine()

    # Ingestion de documents avec leurs embeddings (ex: générés par OpenAI / SentenceTransformers)
    engine.add_document("DOC-01", "Guide d'architecture Zero Trust et micro-segmentation réseau", [0.91, 0.85, 0.12, 0.05, 0.02])
    engine.add_document("DOC-02", "Sécurisation des clusters Kubernetes avec OPA et Falco",       [0.88, 0.82, 0.15, 0.08, 0.01])
    engine.add_document("DOC-03", "Recette de cuisine pour tarte aux pommes traditionnelle",     [0.01, 0.03, 0.95, 0.91, 0.89])
    engine.add_document("DOC-04", "Configuration du pare-feu Nftables et isolation des VLANs",   [0.85, 0.79, 0.20, 0.04, 0.03])

    # Recommandation / Requête utilisateur : "Comment sécuriser mon infrastructure réseau cloud ?"
    query_vector_search = [0.89, 0.84, 0.14, 0.06, 0.02]

    engine.print_search_results(
        query_text="Comment sécuriser mon infrastructure réseau cloud ?",
        query_vector=query_vector_search,
        top_k=3
    )
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MVCC** | Multi-Version Concurrency Control — Gestion de la concurrence dans PostgreSQL sans verrous de lecture |
| **HNSW** | Hierarchical Navigable Small World — Algorithme d'indexation vectorielle très rapide pour la recherche k-NN |
| **GIN / GiST** | Generalized Inverted Index / Generalized Search Tree — Types d'index PostgreSQL pour texte plein et géométrie |
| **Raft** | Protocole de consensus distribué utilisé par CockroachDB pour garantir la cohérence des répliques |
| **RAG** | Retrieval-Augmented Generation — Architecture IA combinant recherche vectorielle et LLM |

---

## Exercices Pratiques

### Exercice 1 — Optimisation d'Indexation PostgreSQL

Vous observez qu'une requête de recherche textuelle sur une table PostgreSQL de 10 millions de lignes (`WHERE description ILIKE '%sec%service%'`) prend 12 secondes avec un `Seq Scan` (balayage séquentiel complet).

1. Quel type d'index PostgreSQL natif devez-vous créer pour accélérer la recherche textuelle (trigramme) ?
2. Quelle est la commande SQL de création d'index appropriée ?
3. Quel est l'impact attendu sur le temps de réponse ?

**Corrigé guidé :**
1. Le type d'index recommandé pour les recherches textuelles floues (`ILIKE '%pattern%'`) est un index **GIN (Generalized Inverted Index)** avec le module `pg_trgm` (trigrammes). Un index B-Tree classique ne peut pas être utilisé avec un joker au début (`%pattern`).
2. **Commande SQL** :
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   CREATE INDEX CONCURRENTLY idx_orders_desc_trgm ON orders USING GIN (description gin_trgm_ops);
   ```
3. **Impact** : La requête passe d'un `Seq Scan` O(N) (12 secondes) à un `Bitmap Index Scan` O(log N) (< 15 millisecondes). L'option `CONCURRENTLY` permet d'éviter le verrouillage de la table pendant la création de l'index.

---

## Banque QCM — 5 Questions

**Q1.** Comment PostgreSQL gère-t-il les requêtes d'écriture (`UPDATE`, `DELETE`) avec le mécanisme **MVCC** ?

- A) Il efface immédiatement les données sur le disque.
- B) Il ne modifie jamais les données en place sur le disque ; il crée une nouvelle version de la ligne et marque l'ancienne comme expirée (`xmax`), évitant de bloquer les lecteurs. ✅
- C) Il bloque toutes les lectures jusqu'à la fin de la transaction.
- D) Il convertit la table en fichier JSON.

**Q2.** Quel est le rôle du processus d'arrière-plan **Autovacuum** dans PostgreSQL ?

- A) Sauvegarder la base de données sur Amazon S3.
- B) Nettoyer les lignes mortes (tuples périmés générés par le MVCC), libérer l'espace disque (bloat) et mettre à jour les statistiques pour l'optimiseur de requêtes. ✅
- C) Redémarrer PostgreSQL chaque nuit.
- D) Chiffrer les requêtes des utilisateurs.

**Q3.** L'extension **`pgvector`** permet à PostgreSQL de :

- A) Générer des graphiques en SVG.
- B) Stocker et effectuer des recherches de similarité sémantique à haute vitesse sur des embeddings vectoriels pour les applications d'IA (RAG/LLM). ✅
- C) Compresser les fichiers de logs.
- D) Exécuter du code Java dans la base.

**Q4.** Quel algorithme d'indexation est le plus performant pour la recherche approximative des K-plus proches voisins (k-NN) dans une base de données vectorielle ?

- A) B-Tree
- B) HNSW (Hierarchical Navigable Small World) ✅
- C) Hash Index
- D) Sequential Scan

**Q5.** Quelle est la caractéristique principale d'une base **Distributed SQL** comme **CockroachDB** ?

- A) Elle ne prend pas en charge les transactions.
- B) Elle combine le modèle relationnel et les garanties ACID strictes du SQL avec la scalabilité horizontale et la tolérance aux pannes distribuée (via le consensus Raft). ✅
- C) Elle ne fonctionne que sur un seul serveur.
- D) Elle est réservée au stockage de vidéos.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
