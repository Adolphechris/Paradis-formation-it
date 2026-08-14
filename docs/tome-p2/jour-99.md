# TOME P2 — Réseaux & Télécoms — Jour 99 (6h) : Bases de Données Graphes & Détection de Fraude (Neo4j & Cypher)

> [!NOTE]
> **Objectif du jour :** Comprendre les bases de données orientées Graphes (Neo4j) et le langage Cypher pour détecter des schémas complexes de fraude financière (comptes mules, mouvements circulaires) et cartographier les relations entre entités.
>
> **Compétences visées :** `BIT-06` (A) — Bases de Données Graphes | `SEC-06` (A) — Analyse de Fraude Financière

---

## 1) Module — Modèle de Graphe & Comparaison avec le Relationnel (2h)

### 📖 Narration/Intuition

Dans une base de données relationnelle, modéliser des relations complexes à plusieurs niveaux (ex: "A a transféré à B, qui a transféré à C...") exige de multiplier les jointures lourdes.

Une **base de données Graphe (Neo4j)** stocke directement les **Nœuds** et les **Relations** sous forme de pointeurs physiques en mémoire. Traverser des millions de connexions pour repérer un réseau de fraudeurs s'effectue en quelques millisecondes.

### 🔍 Anatomie Technique

**Modèle de Graphe Labeled Property Graph (LPG) :**

```
  ┌────────────────────────┐                   ┌────────────────────────┐
  │ Nœud: Client           │─── (POSSEDE) ────→│  Nœud: Compte          │
  │  - id: "CLI-101"       │                   │  - iban: "ENT-0001"   │
  └───────────┬────────────┘                   └───────────┬────────────┘
              │                                            │
         (PARTAGE)                                   (EFFECTUE_TX)
              │                                            │
              ▼                                            ▼
  ┌────────────────────────┐                   ┌────────────────────────┐
  │ Nœud: Téléphone        │                   │ Nœud: Transaction      │
  │  - numero: "+24381..." │                   │  - montant: 450000     │
  └────────────────────────┘                   └────────────────────────┘
```

---

## 2) Module — Requêtage Graph avec le Langage Cypher (2h)

### 🔍 Anatomie Technique

**Exemples de requêtes Cypher de détection de fraude :**

```cypher
// 1. Détecter le partage d'éléments d'identité suspects (Mule Account Detection)
// Trouve les clients distincts qui partagent le même numéro de téléphone
MATCH (c1:Client)-[:UTILISE_TEL]->(t:Téléphone)<-[:UTILISE_TEL]-(c2:Client)
WHERE c1.id <> c2.id
RETURN c1.nom, c2.nom, t.numero AS telephone_partage;

// 2. Détection de boucles de virements suspects (Circular Money Movement)
// Recherche une chaîne de 3 à 6 transactions qui boucle sur le compte de départ
MATCH path = (c1:Compte)-[:VIREMENT*3..6]->(c1:Compte)
WITH path, reduce(total = 0, rel IN relationships(path) | total + rel.montant) AS total
WHERE total > 1000000
RETURN nodes(path) AS comptes_impliques, total;
```

**Intégration Python Neo4j Driver (`graph_fraud.py`) :**

```python
#!/usr/bin/env python3
"""
graph_fraud.py — Analyse des réseaux de fraude avec Neo4j et Python
"""
from neo4j import GraphDatabase

NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "SecurePassword"

class FraudGraphAnalyzer:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def detecter_comptes_mules(self):
        """Identifie les comptes qui reçoivent et redistribuent l'argent immédiatement."""
        query = """
        MATCH (src:Compte)-[t1:VIREMENT]->(mule:Compte)-[t2:VIREMENT]->(dest:Compte)
        WHERE t2.timestamp - t1.timestamp < 300
          AND abs(t1.montant - t2.montant) < 1000
        RETURN mule.iban AS iban_mule, t1.montant AS montant
        """
        with self.driver.session() as session:
            result = session.run(query)
            for record in result:
                print(f"🚨 Compte Mule : {record['iban_mule']} | Montant: {record['montant']}")

    def close(self):
        self.driver.close()

if __name__ == "__main__":
    analyzer = FraudGraphAnalyzer(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)
    try:
        analyzer.detecter_comptes_mules()
    finally:
        analyzer.close()
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **LPG** | Labeled Property Graph — Modèle de graphe orienté étiqueté avec propriétés |
| **Cypher** | Langage de requête graphique utilisé par Neo4j |
| **RDBMS** | Relational Database Management System — Base de données relationnelle classique |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi la détection d'un mouvement d'argent circulaire est-elle plus rapide en base Graphe qu'en SQL ?

**Corrigé :** En SQL, cela demande des jointures successives dont le coût croît exponentiellement avec la profondeur. En base Graphe, la traversée suit des pointeurs en mémoire en temps quasi-constant.

---

**Exercice 2 :** Dans Cypher, à quoi correspond `(c:Client)-[:POSSEDE]->(b:Compte)` ?

**Corrigé :** `(c:Client)` est un nœud de type Client, `-[:POSSEDE]->` est une relation orientée de type POSSEDE, et `(b:Compte)` est le nœud cible de type Compte.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel langage de requête est utilisé par Neo4j ?
- A) SQL
- B) Cypher
- C) HTML
- D) PromQL

**Réponse : B**

---

**Q2 :** Quels sont les deux éléments fondamentaux d'un modèle de données Graphe ?
- A) Tables et clés étrangères
- B) Nœuds et Relations
- C) Colonnes et lignes
- D) Fichiers ZIP et dossiers

**Réponse : B**

---

**Q3 :** Quel critère permet de détecter un compte mule en Cypher ?
- A) La couleur du navigateur
- B) Transactions entrantes et sortantes rapprochées (< 5 min) avec montants similaires
- C) La taille du nom
- D) Le système d'exploitation

**Réponse : B**

---

**Q4 :** Quel est l'avantage principal de l'indexation par adjacence sans index (Index-Free Adjacency) de Neo4j ?
- A) Réduit la consommation d'électricité
- B) Pointeurs directs vers les voisins pour des traversées ultra-rapides
- C) Supprime le besoin de sauvegardes
- D) Empêche l'utilisation de clés privées

**Réponse : B**

---

**Q5 :** Pourquoi la détection de cycles financiers est-elle lente en SQL relationnel ?
- A) Le SQL ne supporte pas les nombres
- B) Les jointures multiples ont un coût exponentiel
- C) Les bases SQL sont toujours plus lentes
- D) Le SQL interdit les cycles

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
