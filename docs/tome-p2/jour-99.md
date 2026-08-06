# TOME P2 — Réseaux & Télécoms — Jour 99 (6h) : Architectures de Données Graph & Détection de Fraude (Neo4j, Cypher & Graph Analytics)

> [!NOTE]
> **Objectif du jour :** Comprendre les bases de données orientées Graphes (Neo4j) et le langage de requête Cypher pour la détection de schémas complexes de fraude financière (réseaux de mule accounts, circular money movement) et la cartographie des dépendances d'infrastructures informatiques.
>
> **Compétences visées :** `BIT-06` (A) — Bases de Données Graphes | `SEC-06` (A) — Analyse des Réseaux de Fraude Financière

---

## 1) Module — Modèle de Graphe & Comparaison avec le Relationnel (2h)

### 📖 Narration/Intuition

Dans une base de données relationnelle (RDBMS), modéliser des relations complexes à plusieurs niveaux de profondeur (ex: *"Le compte A a transféré à B, qui a transféré à C, qui a le même numéro de téléphone que D..."*) exige de multiplier les jointures lourdes (`JOIN`).

Une **base de données Graphe (Neo4j)** stocke directement les **Nœuds** (Entities) et les **Relations** (Edges) sous forme de pointeurs physiques en mémoire. Traverser des millions de connexions pour repérer un réseau de fraudeurs s'effectue en quelques millisecondes, indépendamment de la taille totale de la base.

### 🔍 Anatomie Technique

**Modèle de Graphe Labeled Property Graph (LPG) :**

```
 ┌────────────────────────┐                   ┌────────────────────────┐
 │ Nœud: Client           │                   │ Nœud: Compte           │
 │  - id: "CLI-101"       │─── (POSSEDE) ────→│  - iban: "BCC-0001"    │
 │  - nom: "Jean Mbeki"   │                   │  - solde: 50000        │
 └───────────┬────────────┘                   └───────────┬────────────┘
             │                                            │
        (PARTAGE)                                   (EFFECTUE_TX)
             │                                            │
             ▼                                            ▼
 ┌────────────────────────┐                   ┌────────────────────────┐
 │ Nœud: Telephone        │                   │ Nœud: Transaction      │
 │  - numero: "+24381..." │                   │  - montant: 450000     │
 └────────────────────────┘                   │  - timestamp: 17229... │
                                              └────────────────────────┘
```

---

## 2) Module — Requêtage Graph avec le Langage Cypher (2h)

### 📖 Narration/Intuition

**Cypher** est le langage de requête déclaratif visuel utilisé par Neo4j. Il utilise des formes ASCII artistiques pour représenter les nœuds `(n:Label)` et les relations `-[r:RELATION]->`.

### 🔍 Anatomie Technique

**Exemples de requêtes Cypher de détection de fraude :**

```cypher
// 1. Détecter le partage d'éléments d'identité suspects (Mule Account Detection)
// Trouve les clients distincts qui partagent le même numéro de téléphone ou la même adresse IP
MATCH (c1:Client)-[:UTILISE_TEL]->(t:Telephone)<-[:UTILISE_TEL]-(c2:Client)
WHERE c1.id <> c2.id
RETURN c1.nom, c2.nom, t.numero AS telephone_partage;

// 2. Détection de boucles de virements suspects (Circular Money Movement / Schéma de Ponzi)
// Recherche une chaîne de 3 à 6 transactions qui boucle sur le compte de départ
MATCH path = (c1:Compte)-[:VIREMENT*3..6]->(c1:Compte)
WITH path, reduce(total = 0, rel IN relationships(path) | total + rel.montant) AS total_circule
WHERE total_circule > 1000000
RETURN nodes(path) AS compte_impliques, total_circule;
```

**Intégration Python Neo4j Driver (`graph_fraud_detector.py`) :**

```python
#!/usr/bin/env python3
"""
graph_fraud_detector.py — Analyse des réseaux de fraude avec Neo4j et Python
"""
from neo4j import GraphDatabase

NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "BCC_Neo4j_Password_2024!"

class FraudGraphAnalyzer:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def mechercher_comptes_rebonds(self):
        """Identifie les comptes qui reçoivent et redistribuent l'argent immédiatement (Mules)"""
        query = """
        MATCH (src:Compte)-[t1:VIREMENT]->(mule:Compte)-[t2:VIREMENT]->(dest:Compte)
        WHERE t2.timestamp - t1.timestamp < 300  // Moins de 5 minutes d'écart
          AND abs(t1.montant - t2.montant) < 1000 // Montants similaires
        RETURN mule.iban AS iban_mule, t1.montant AS montant, (t2.timestamp - t1.timestamp) AS delai_sec
        """
        with self.driver.session() as session:
            result = session.run(query)
            print("=== DÉTECTION GRAPH : COMPTES MULES RAPIDES ===")
            for record in result:
                print(f"🚨 Compte Mule Suspect : {record['iban_mule']}")
                print(f"   Montant transféré : {record['montant']} CDF en {record['delai_sec']} secondes")

if __name__ == "__main__":
    analyzer = FraudGraphAnalyzer(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)
    try:
        analyzer.mechercher_comptes_rebonds()
    finally:
        analyzer.close()
```

---

## 3) Module — Graph Data Science & Algorithmes de Communauté (2h)

### 📖 Narration/Intuition

En complément du requêtage direct, la **Graph Data Science (GDS)** applique des algorithmes mathématiques de théorie des graphes sur l'ensemble du réseau bancaire pour révéler la structure cachée des réseaux criminels.

### 🔍 Anatomie Technique

**Algorithmes Graph majeurs pour la sécurité financière :**

```
- PageRank : Mesure l'importance/influence d'un nœud dans le réseau. (Un compte recevant des virements de nombreux autres comptes suspects obtient un score élevé).
- Louvain / Modularity : Identifie les communautés ou clusters d'utilisateurs fortement interconnectés (Réseaux de blanchiment d'argent).
- Degree Centrality : Compte le nombre de connexions directes d'un nœud.
- Shortest Path (Dijkstra) : Trouve la chaîne de connexion la plus courte entre deux entités (ex: lier un attaquant connu à un nouveau client).
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **LPG** | Labeled Property Graph — Modèle de graphe orienté étiqueté avec propriétés |
| **GDS** | Graph Data Science — Algorithmes d'analyse et de théorie des graphes |
| **Cypher** | Langage de requête graphique utilisé par Neo4j |
| **RDBMS** | Relational Database Management System — Base de données relationnelle classique |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi la détection d'un schéma de mouvement d'argent circulaire (Circular Money Movement) est-elle extrêmement lente à exécuter dans une base de données relationnelle classique (SQL) ?

**Corrigé :** Dans une base SQL relationnelle, rechercher un cycle de $N$ virements successifs exige d'effectuer $N$ opérations de `JOIN` (jointures) successives sur une table de transactions contenant potentiellement des dizaines de millions de lignes. Le coût d'exécution d'une jointure multiple croît de manière exponentielle avec la profondeur de la chaîne ($O(V^N)$). Dans une base de données Graphe (Neo4j), la traversée des relations suit directement des pointeurs en mémoire en temps quasi-constant ($O(1)$ par saut), permettant d'exécuter la recherche en quelques millisecondes.

**Exercice 2 :** Dans le langage Cypher, à quoi correspond la syntaxe `(c:Client)-[:POSSEDE]->(b:Compte)` ?

**Corrigé :** Cette syntaxe décrit un motif de graphe (Pattern Matching) :
- `(c:Client)` représente un **nœud** variable `c` portant l'étiquette (Label) `Client`.
- `-[:POSSEDE]->` représente une **relation** orientée de type `POSSEDE` allant du client vers le compte.
- `(b:Compte)` représente le **nœud** cible variable `b` portant l'étiquette `Compte`.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel langage de requête déclaratif visuel est utilisé par la base de données Neo4j ?
- A) SQL
- B) Cypher
- C) HTML
- D) PromQL

**Réponse : B**

**Q2 :** Quels sont les deux éléments fondamentaux qui constituent la structure d'un modèle de données Graphe (LPG) ?
- A) Des tables et des clés étrangères
- B) Des Nœuds (Entities) et des Relations (Edges)
- C) Des colonnes et des lignes
- D) Des fichiers ZIP et des dossiers

**Réponse : B**

**Q3 :** Quel algorithme de Graph Data Science mesure l'importance relative d'un nœud en fonction du nombre et de la qualité des connexions qui pointent vers lui ?
- A) PageRank
- B) QuickSort
- C) Binary Search
- D) AES

**Réponse : A**

**Q4 :** Pour repérer une détection de compte mule (Mule Account) qui reçoit et transfère l'argent immédiatement, quel critère combiné Cypher est le plus pertinent ?
- A) La couleur du logo du navigateur
- B) La détection de transactions entrantes et sortantes rapprochées dans le temps (ex: < 5 minutes) avec des montants similaires
- C) La taille du nom de l'utilisateur
- D) Le système d'exploitation du serveur

**Réponse : B**

**Q5 :** Quel est le principal avantage de l'indexation par adjacence sans index (Index-Free Adjacency) de Neo4j ?
- A) Elle réduit la consommation d'électricité
- B) Chaque nœud conserve des pointeurs directs vers ses nœuds voisins, ce qui permet des traversées de relations ultra-rapides sans requérir d'index globaux
- C) Elle supprime le besoin de sauvegardes
- D) Elle empêche l'utilisation de clés privées

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
