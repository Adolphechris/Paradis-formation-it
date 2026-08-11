# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 482 (6h) : Agentic RAG & GraphRAG : Fusion de Graphes de Connaissances (Neo4j), Recherche Hybride & Reciprocal Rank Fusion (RRF)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Dépasser le RAG vectoriel simple en combinant les bases vectorielles et les **Graphes de Connaissances (GraphRAG)**
> - Modéliser et interroger une base de connaissances orientée graphe avec **Neo4j** et le langage **Cypher**
> - Implémenter la recherche hybride (**Dense Retrieval + Sparse BM25**) avec fusion de classement **Reciprocal Rank Fusion (RRF)**
> - Constuire des agents RAG auto-correctifs (**Corrective RAG - CRAG / Self-RAG**) capables de reformuler une requête ou de rejeter des documents hors-sujet
>
> **Compétences visées :** `AI-02` (A) — Advanced Agentic RAG & Knowledge Graphs

---

## Module 1 — Du Vector RAG au GraphRAG & Recherche Hybride (2h)

### 📖 Intuition & Narration

Le RAG classique basé uniquement sur la similarité vectorielle (Dense Retrieval) possède des limites bien connues : il excelle pour retrouver des passages sémantiquement proches ("Qu'est-ce qu'un firewall ?"), mais échoue lamentablement sur les **requêtes globales ou relationnelles à plusieurs sauts** ("Quelles sont toutes les applications impactées par la vulnérabilité CVE-2026-1234 à travers la topologie de l'entreprise ?").

**GraphRAG (Microsoft Research)** résout cette impasse en combinant :
1. **La structure de Graphe (Knowledge Graph)** : Nœuds (Entités) et Arêtes (Relations explicites `IMPACTS`, `DEPENDS_ON`, `RUNS_ON`).
2. **La recherche Vectorielle DENSE** : Capturer le sens sémantique flou.
3. **La recherche Lexicale SPARSE (BM25)** : Capturer les identifiants exacts (adresses IP, codes d'erreurs, hashs).

### 🔍 Anatomie Technique — Reciprocal Rank Fusion (RRF)

```
PIPELINE RECHERCHE HYBRIDE & RECIPROCAL RANK FUSION (RRF)

  Query: "Panne SQL sur le serveur SRV-DB-01"
              │
     ┌────────┴────────────────────────┐
     │                                 │
     ▼                                 ▼
  [ DENSE SEARCH (Vectors) ]       [ SPARSE SEARCH (BM25) ]
  1. Doc_A (Score: 0.92, Rank 1)   1. Doc_C (BM25: 14.2, Rank 1)
  2. Doc_B (Score: 0.85, Rank 2)   2. Doc_A (BM25: 11.8, Rank 2)
  3. Doc_C (Score: 0.78, Rank 3)   3. Doc_D (BM25: 9.5,  Rank 3)
     │                                 │
     └────────────────┬────────────────┘
                      │
                      ▼
   RECIPROCAL RANK FUSION (RRF)
   RRF_Score(d) = ∑_{m ∈ Models} 1 / ( k + Rank_m(d) )     (k = 60 typiquement)

   Calcul pour Doc_A : RRF = 1/(60+1) + 1/(60+2) = 0.01639 + 0.01612 = 0.03251  ──▶ CLASSEMENT #1 !
   Calcul pour Doc_C : RRF = 1/(60+3) + 1/(60+1) = 0.01587 + 0.01639 = 0.03226  ──▶ CLASSEMENT #2 !
```

---

## Module 2 — Atelier Pratique : GraphRAG avec Neo4j & Cypher (2h)

### 🛠️ Code Python : Construction d'un Graphe Neo4j & Requête Hybride

```python
#!/usr/bin/env python3
"""
PARADIS — Pipeline GraphRAG avec Neo4j, Cypher et Reciprocal Rank Fusion (RRF)
"""

import numpy as np

def calculate_rrf(dense_ranks: dict, sparse_ranks: dict, k: int = 60) -> list:
    """
    Combine les classements Dense et Sparse via Reciprocal Rank Fusion (RRF)
    """
    scores = {}
    all_doc_ids = set(dense_ranks.keys()).union(set(sparse_ranks.keys()))

    for doc_id in all_doc_ids:
        score = 0.0
        if doc_id in dense_ranks:
            score += 1.0 / (k + dense_ranks[doc_id])
        if doc_id in sparse_ranks:
            score += 1.0 / (k + sparse_ranks[doc_id])
        scores[doc_id] = score

    # Tri par score RRF décroissant
    sorted_docs = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_docs

def run_graph_rag_demo():
    print("[*] --- DÉMONSTRATION GRAPHRAG & HYBRID SEARCH PARADIS IT ---")

    # 1. Exemple de Requête Cypher pour Neo4j GraphRAG
    cypher_query = """
    // Requête GraphRAG : Dépendances d'une vulnérabilité à 2 sauts
    MATCH (v:Vulnerability {cve_id: 'CVE-2026-9999'})-[:EXPLOITS]->(s:Service)
    MATCH (s)<-[:DEPENDS_ON]-(app:Application)
    RETURN v.cve_id AS CVE, s.name AS AffectedService, app.name AS ImpactedApp
    """
    print("\n[1] Génération de la Requête Cypher Neo4j (Exploration de Graphe) :")
    print(cypher_query.strip())

    # 2. Simulation de Fusion RRF
    print("\n[2] Execution de la Fusion de Classement Hybride RRF (Reciprocal Rank Fusion)...")
    dense_results = {"doc_450_spire": 1, "doc_448_cosign": 2, "doc_445_zkp": 3}
    sparse_results = {"doc_448_cosign": 1, "doc_450_spire": 2, "doc_460_onnx": 3}

    rrf_ranking = calculate_rrf(dense_results, sparse_results, k=60)

    print("\n--- CLASSEMENT HYBRIDE RRF FINAL ---")
    for rank, (doc_id, rrf_score) in enumerate(rrf_ranking, 1):
        print(f"  Rank #{rank} : Document = {doc_id:20s} | Score RRF = {rrf_score:.6f}")

    print("\n  ✅ Le document 'doc_448_cosign' (Rang 2 Dense + Rang 1 Sparse) prend la 1ère place grâce à RRF !")

if __name__ == "__main__":
    run_graph_rag_demo()
```

---

## Module 3 — Self-RAG & Agent RAG Auto-Correctif (CRAG) (1h30)

### 🔍 Architecture Self-RAG & Corrective RAG (CRAG)

```
ARCHITECTURE CRAG (Corrective RAG)

  [ User Query ] ──▶ [ Dense/Sparse/Graph Retrieval ] ──▶ [ Context Documents ]
                                                                 │
                                                                 ▼
                                                    ┌──────────────────────────┐
                                                    │ EVALUATOR AGENT (LLM)    │
                                                    │ "Les documents sont-ils  │
                                                    │  pertinents ?"           │
                                                    └────────────┬─────────────┘
                                                                 │
                  ┌──────────────────────────────────────────────┴──────────────────────────────┐
                  │ (CORRECT)                                                                   │ (INCORRECT / HORS SUJET)
                  ▼                                                                             ▼
  ┌───────────────────────────────┐                                             ┌───────────────────────────────┐
  │ GENERATOR LLM                 │                                             │ QUERY REWRITER AGENT          │
  │ Génération de la réponse avec │                                             │ Reformule la requête +        │
  │ le contexte validé.           │                                             │ Recherche Web Externe (Tavily)│
  └───────────────────────────────┘                                             └──────────────┬────────────────┘
                                                                                               │
                                                                                               ▼
                                                                                [ Nouveau Retrieval & Génération]
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **GraphRAG** | Retrieval-Augmented Generation basé sur des graphes de connaissances et embeddings |
| **RRF** | Reciprocal Rank Fusion — Algorithme de fusion sans paramètres de plusieurs classements |
| **CRAG** | Corrective RAG — Framework RAG évaluant la pertinence du contexte et reformulant au besoin |
| **Cypher** | Langage de requête déclaratif orienté graphe utilisé principalement par Neo4j |
| **BM25** | Best Matching 25 — Algorithme de recherche lexicale sparse basé sur TF-IDF ajusté |

---

## Exercices Pratiques

### Exercice 1 — Calcul du Score Reciprocal Rank Fusion (RRF)

On considère un document $D_1$ ayant obtenu les classements suivants dans 3 moteurs de recherche différents :
- Moteur 1 (Dense Vector) : Rang $1$.
- Moteur 2 (Sparse BM25) : Rang $5$.
- Moteur 3 (Graph Cypher) : Rang $2$.

Avec le paramètre standard $k = 60$, calculez le score $\text{RRF}(D_1)$.

**Corrigé guidé :**
$$\begin{aligned}
\text{RRF}(D_1) &= \frac{1}{60 + 1} + \frac{1}{60 + 5} + \frac{1}{60 + 2} \\
&= \frac{1}{61} + \frac{1}{65} + \frac{1}{62} \\
&\approx 0.016393 + 0.015385 + 0.016129 \\
&= 0.047907.
\end{aligned}$$
Le score RRF combiné du document $D_1$ est de **0.047907**.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la limitation majeure du RAG vectoriel classique que **GraphRAG** permet de surmonter ?

- A) Le RAG vectoriel ne peut pas lire du texte en anglais.
- B) Le RAG vectoriel peine à répondre aux questions globales exigeant de traverser plusieurs relations et dépendances indirectes entre entités à travers l'organisation. ✅
- C) GraphRAG supprime complètement l'utilisation des LLMs.
- D) Le RAG vectoriel ne fonctionne pas sur Linux.

**Q2.** Quel est le rôle de l'algorithme **Reciprocal Rank Fusion (RRF)** dans une recherche hybride ?

- A) Compresser les fichiers PDF en ZIP.
- B) Combiner les classements issus de plusieurs systèmes de recherche distincts (ex: Dense Vector + Sparse BM25) de manière robuste sans nécessiter de normalisation préalable des scores bruts. ✅
- C) Traduire les requêtes SQL en Python.
- D) Calculer la température du GPU.

**Q3.** Quel est le langage de requête déclaratif standard utilisé pour interroger les bases de données orientées graphe comme **Neo4j** ?

- A) SQL
- B) Cypher ✅
- C) HTML
- D) Bash

**Q4.** Dans l'architecture **Corrective RAG (CRAG)**, que fait le module d'évaluation lorsque le contexte récupéré est jugé totalement irrelevant ?

- A) Il génère une réponse basée sur l'imagination pure du LLM.
- B) Il déclenche un agent de reformulation de la requête (Query Rewriter) et bascule vers une source de recherche alternative (ex: Web Search externe). ✅
- C) Il éteint le serveur HTTP.
- D) Il efface le stockage vectoriel.

**Q5.** Pourquoi combine-t-on la recherche **Dense (Embeddings)** et la recherche **Sparse (BM25)** dans une architecture de Retrieval moderne ?

- A) Parce que la recherche Dense capture le sens sémantique flou, tandis que la recherche Sparse garantit la correspondance exacte sur les termes techniques précis (noms de modèles, adresses IP, hashs). ✅
- B) Parce que BM25 est écrit en C++ et Dense en Python.
- C) Parce que la recherche Sparse est obligatoire en RGPD.
- D) Pour diviser par deux la consommation de mémoire RAM.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
