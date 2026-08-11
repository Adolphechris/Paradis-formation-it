# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 457 (6h) : Agents IA, Loop ReAct, LangChain & LangGraph : Architectures d'Agents Autonomes, Memory, Multi-Tool Execution & Vector DBs (Qdrant/Chroma)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre le paradigme des **Agents IA autonomes** basé sur le cycle **ReAct (Reason + Act)**
> - Structurer des pipelines **RAG (Retrieval-Augmented Generation)** avancés avec découpage (chunking), hybride search et ré-ordonnancement (reranking)
> - Implémenter une base de données vectorielle avec **Qdrant / ChromaDB** et embeddings de dense retrieval
> - Construire des graphes d'agents cycliques et contrôlés avec **LangGraph** (State Graphs, Checkpointing, Human-in-the-loop)
>
> **Compétences visées :** `AI-02` (A) — IA Agentique & RAG Avancé

---

## Module 1 — Architecture d'un Agent IA & le Pattern ReAct (2h)

### 📖 Intuition & Narration

Un simple LLM est un système statique : il reçoit un texte et génère une suite de mots sur la seule base des connaissances figées dans ses poids. Un **Agent IA** transforme ce modèle de langage en un processeur actif muni de bras et d'yeux :
1. **Raisonnement (Thought)** : Réfléchir à la stratégie étape par étape.
2. **Action (Act)** : Décider d'exécuter un outil externe (Recherche Web, Exécution de script Bash, Requête SQL, API REST).
3. **Observation (Obs)** : Lire le retour de l'outil et ajuster le plan.

Ce cycle itératif est formalisé par le papier **ReAct (Reasoning and Acting — Yao et al. 2022)**.

### 🔍 Anatomie Technique — Boucle de Contrôle ReAct

```
SCHÉMA DE LA BOUCLE D'EXÉCUTION REACT (Reason + Act)

    User Prompt : "Vérifie l'état du service Nginx sur le serveur 192.168.1.50 et redémarre-le s'il est arrêté."
         │
         ▼
    ┌────────────────────────────────────────────────────────┐
    │  LLM System Prompt + Outils (Tools Schemas JSON)       │
    └──────────────────────────┬─────────────────────────────┘
                               │
       ┌───────────────────────┴────────────────────────┐
       ▼                                                │
 ┌──────────┐                                           │
 │ Thought  │ ── "Je dois d'abord vérifier le statut...│
 └────┬─────┘                                           │
      │                                                 │
      ▼                                                 │ (Boucle jusqu'à
 ┌──────────┐                                           │  Final Answer)
 │  Action  │ ── SSH_Execute(host="192.168.1.50",       │
 └────┬─────┘                cmd="systemctl status nginx")
      │                                                 │
      ▼                                                 │
 ┌──────────┐                                           │
 │Observation│── "nginx.service - Active: inactive (dead)"
 └────┬─────┘                                           │
      │                                                 │
      ▼                                                 │
 ┌──────────┐                                           │
 │ Thought  │ ── "Le service est inactif, je dois..."  │
 └────┬─────┘                                           │
      │                                                 │
      ▼                                                 │
 ┌──────────┐                                           │
 │  Action  │ ── SSH_Execute(host="192.168.1.50",       │
 └────┬─────┘                cmd="systemctl start nginx")
      │                                                 │
      ▼                                                 │
 ┌──────────┐                                           │
 │Observation│── "nginx.service - Active: active (running)"
 └────┬─────┘                                           │
      │                                                 │
      ▼                                                 │
 ┌──────────────┐                                       │
 │ Final Answer │ <─────────────────────────────────────┘
 └──────────────┘
```

---

## Module 2 — RAG Avancé & Vector Databases (Qdrant / Chroma) (2h)

### 🛠️ Pipeline RAG Hybride avec Vector Search & ChromaDB

```python
#!/usr/bin/env python3
"""
PARADIS — Pipeline RAG Avancé avec ChromaDB et Embedding Dense
Indexation de la documentation technique PARADIS IT et recherche contextuelle.
"""

import chromadb
from chromadb.utils import embedding_functions

def run_paradis_rag():
    # 1. Initialisation de la Vector DB locale Chroma
    chroma_client = chromadb.Client()

    # Utilisation d'un modèle d'embedding Sentence-Transformers léger
    emb_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )

    collection = chroma_client.create_collection(
        name="paradis_docs",
        embedding_function=emb_fn,
        metadata={"hnsw:space": "cosine"}
    )

    # 2. Ingestion des documents techniques (Chunking préalable)
    documents = [
        "J445: Les Zero-Knowledge Proofs (ZKP) permettent de prouver la possession d'un secret via Groth16 ou PLONK sans rien divulguer.",
        "J446: Le chiffrement homomorphe FHE (CKKS) permet de calculer la moyenne de salaires chiffrés avec TenSEAL sans déchiffrer.",
        "J448: Sigstore et Cosign permettent la signature keyless d'images OCI en ancrant l'identité OIDC dans le log Rekor.",
        "J450: SPIFFE/SPIRE attribue des identités SVID X.509/JWT automatiques aux microservices en architecture Zero-Trust."
    ]

    metadatas = [
        {"tome": "P9", "jour": 445, "topic": "ZKP"},
        {"tome": "P9", "jour": 446, "topic": "FHE"},
        {"tome": "P9", "jour": 448, "topic": "Cosign"},
        {"tome": "P9", "jour": 450, "topic": "Zero-Trust"}
    ]

    ids = ["doc_445", "doc_446", "doc_448", "doc_450"]

    print("[*] Ingestion des vecteurs dans ChromaDB...")
    collection.add(documents=documents, metadatas=metadatas, ids=ids)
    print(f"[+] {collection.count()} documents indexés.")

    # 3. Requête utilisateur (Dense Semantic Search)
    query = "Comment signer une image Docker dans un pipeline CI/CD sans stocker de clé privée ?"

    results = collection.query(
        query_texts=[query],
        n_results=2
    )

    print(f"\n[QUERY] : '{query}'\n")
    print("─── RÉSULTATS DU RETRIEVAL ───")
    for i, (doc, meta, dist) in enumerate(zip(results['documents'][0], results['metadatas'][0], results['distances'][0])):
        print(f"[{i+1}] Distance Cosinus : {dist:.4f}")
        print(f"    Métadonnées : {meta}")
        print(f"    Contenu     : {doc}\n")

if __name__ == "__main__":
    run_paradis_rag()
```

---

## Module 3 — Orchestration d'Agents Cycliques avec LangGraph (1h30)

### 🔍 LangGraph : Contrôle d'État & Graphes Dirigés pour Agents

```python
#!/usr/bin/env python3
"""
PARADIS — Structure d'Agent LangGraph (StateGraph)
Illustration d'un graphe d'agent avec validation et boucle de correction.
"""

from typing import TypedDict, Annotated, Sequence
import json

# Define Agent State
class AgentState(TypedDict):
    messages: list[str]
    current_step: str
    is_valid: bool
    retry_count: int

def node_planner(state: AgentState) -> AgentState:
    print(" -> [Node: Planner] Analyse de la demande utilisateur...")
    state['messages'].append("Plan : 1. Analyser les vulnérabilités 2. Appliquer les correctifs")
    state['current_step'] = "execution"
    return state

def node_executor(state: AgentState) -> AgentState:
    print(" -> [Node: Executor] Exécution du script de patch...")
    state['messages'].append("Patch appliqué : Nginx mis à jour vers v1.26.1")
    state['current_step'] = "validator"
    return state

def node_validator(state: AgentState) -> AgentState:
    print(" -> [Node: Validator] Contrôle de conformité...")
    # Simulation de validation
    if state['retry_count'] < 1:
        print("  ⚠️ Validation échouée : Port 443 non répondant. Relance...")
        state['is_valid'] = False
        state['retry_count'] += 1
    else:
        print("  ✅ Validation réussie : Service HTTP/2 opérationnel.")
        state['is_valid'] = True
    return state

def router(state: AgentState) -> str:
    if state['is_valid']:
        return "END"
    else:
        return "executor"

def run_langgraph_simulation():
    state: AgentState = {
        "messages": ["User: Mettre à jour et sécuriser le serveur Web"],
        "current_step": "planner",
        "is_valid": False,
        "retry_count": 0
    }

    # Simulation d'exécution du graphe
    state = node_planner(state)
    state = node_executor(state)

    while True:
        state = node_validator(state)
        next_node = router(state)
        if next_node == "END":
            break
        elif next_node == "executor":
            state = node_executor(state)

    print("\n[+] Graphe d'Agent LangGraph exécuté avec succès.")
    print("Historique de l'état :", json.dumps(state['messages'], indent=2, ensure_ascii=False))

if __name__ == "__main__":
    run_langgraph_simulation()
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ReAct** | Reason and Act — Framework d'intercalation de raisonnements et d'appels d'outils pour LLMs |
| **RAG** | Retrieval-Augmented Generation — Injection de documents externes récupérés dans le prompt du LLM |
| **Vector DB** | Base de données optimisée pour la recherche de voisins plus proches (k-NN) sur des embeddings |
| **HNSW** | Hierarchical Navigable Small World — Algorithme d'indexation vectorielle très rapide |
| **LangGraph** | Extension de LangChain permettant la création de graphes d'état avec boucles et persistance |

---

## Exercices Pratiques

### Exercice 1 — Analyse du Phénomène de Hallucination & Solution RAG

Un agent commercial IA répond à un client en inventant une clause de garantie inexistante dans l'entreprise (hallucination).
1. Expliquez la cause technique de cette hallucination au niveau de l'architecture du LLM.
2. Décrivez précisément la chaîne RAG à mettre en place pour corriger ce problème, en spécifiant le rôle du Vector Store et du Prompt System.

**Corrigé guidé :**
1. **Cause** : Le LLM est un modèle probabiliste autoregressif. En l'absence d'information exacte dans son contexte d'entrée, il génère le mot le plus vraisemblable selon ses poids d'entraînement, ce qui produit du texte fluide mais factuellement faux.
2. **Solution RAG** :
   - **Ingestion** : Découper les contrats officiels en chunks de 500 tokens avec chevauchement de 50 tokens, calculer leurs embeddings et les stocker dans une Vector DB (Qdrant/Chroma).
   - **Retrieval** : Lors de la question client, vectoriser la question, effectuer une recherche par similarité cosinus pour extraire les 3 chunks contractuels les plus pertinents.
   - **Generation** : Injecter ces 3 chunks dans le System Prompt avec la consigne : *"Réponds STRICTEMENT en te basant sur les documents ci-dessous. Si l'information n'y figure pas, réponds 'Information non disponible'."*

---

## Banque QCM — 5 Questions

**Q1.** Dans le pattern **ReAct (Reasoning + Acting)**, que fait l'agent après avoir produit un token d'Action ?

- A) Il réinitialise complètement ses poids d'entraînement.
- B) Il suspend la génération textuelle, exécute l'outil externe demandé, puis réinjecte le résultat sous forme d'**Observation** dans le prompt. ✅
- C) Il envoie immédiatement une alerte à l'administrateur.
- D) Il efface l'historique de la conversation.

**Q2.** Quelle métrique de distance est la plus couramment utilisée pour mesurer la similarité sémantique entre deux embeddings normalisés ?

- A) La distance de Hamming.
- B) La similarité Cosinus (Cosine Similarity). ✅
- C) La métrique de Levenshtein.
- D) L'écart-type d'un échantillon.

**Q3.** Pourquoi les frameworks d'agents modernes préfèrent-ils **LangGraph** à une simple chaîne séquentielle (LangChain Chain) pour les cas d'usage industriels ?

- A) Parce que LangGraph est écrit en C++ pur.
- B) Parce qu'il permet de construire des graphes d'état cycliques avec condition de boucle, retour en arrière, gestion des échecs d'outils et pause pour validation humaine (Human-in-the-loop). ✅
- C) Parce qu'il ne nécessite aucun modèle de langage.
- D) Parce qu'il fonctionne uniquement sans connexion internet.

**Q4.** Qu'est-ce que le **Chunking with Overlap** dans la préparation d'un jeu de données RAG ?

- A) La compression ZIP des fichiers texte.
- B) Le découpage d'un long document en segments de taille fixe qui se chevauchent de quelques phrases pour ne pas perdre le contexte aux frontières des blocs. ✅
- C) La suppression des doublons dans la base de données relationnelle.
- D) La traduction automatique du texte en anglais.

**Q5.** Dans une base de données vectorielle comme Qdrant ou Chroma, qu'apporte l'index **HNSW (Hierarchical Navigable Small World)** ?

- A) Il permet de chiffrer les données vectorielles en AES-GCM.
- B) Il accélère la recherche approximative des k plus proches voisins (ANN) dans des espaces à haute dimension avec une complexité logarithmique $O(\log N)$. ✅
- C) Il formate les réponses au format JSON-LD.
- D) Il réduit la taille du texte original à 0 octet.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
