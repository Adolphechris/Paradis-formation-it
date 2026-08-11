# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 564 (6h) : Distributed Systems Patterns : Théorème CAP/PACELC, Consensus Raft & CRDTs

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre les limites fondamentales des systèmes distribués : **Théorème CAP (Consistency, Availability, Partition Tolerance)** et **Extension PACELC**
> - Maîtriser le fonctionnement interne de l'algorithme de consensus **Raft** (Leader Election, Log Replication, Safety)
> - Concevoir des structures de données distribuées sans verrou avec les **CRDTs (Conflict-free Replicated Data Types)** (Pn-Counters, LWW-Element-Set)
> - Choisir les bons compromis de cohérence (Strong Consistency vs Eventual Consistency) selon les besoins métier
>
> **Compétences visées :** `ARCH-01` (A), `DEV-01` (A) — Distributed Systems, Consensus Algorithms, CRDTs

---

## Module 1 — Théorème CAP & Modèle PACELC (2h)

### 📖 Intuition & Narration

Dans un monde distribué où les serveurs sont reliés par un réseau faillible, les coupures de réseau (Network Partitions) **sont inévitables**. Le théorème **CAP** (Eric Brewer, 2000) a prouvé qu'en présence d'une coupure réseau, un système informatique distribué doit **choisir entre être Cohérent (Consistency) ou Disponible (Availability)**. Il ne peut pas garantir les deux simultanément.

L'extension **PACELC** (Daniel Abadi, 2012) complète CAP en prenant en compte le comportement du système **en temps normal (quand il n'y a pas de coupure réseau)** :

$$\text{If } \mathbf{P} \text{ (Partition) } \rightarrow \text{ Choose } \mathbf{A} \text{ or } \mathbf{C} \quad | \quad \text{Else (Normal) } \rightarrow \text{ Choose } \mathbf{L} \text{ (Latency) or } \mathbf{C} \text{ (Consistency)}$$

### 🔍 Classification PACELC des Systèmes Majeurs

```
CLASSIFICATION PACELC DES BASES DE DONNÉES

  SYSTÈME       │ SI PARTITION (P) │ SINON NORMAL (E) │ PROFIL PACELC
  ──────────────┼──────────────────┼──────────────────┼─────────────────────
  CockroachDB   │ Consistency (C)  │ Consistency (C)  │ PC/EC (Forte cohérence)
  PostgreSQL    │ Consistency (C)  │ Consistency (C)  │ PC/EC (Mono-nœud)
  DynamoDB      │ Availability (A) │ Latency (L)      │ PA/EL (Haute dispo & vitesse)
  Cassandra     │ Availability (A) │ Latency (L)      │ PA/EL (Éventuelle)
  MongoDB       │ Consistency (C)  │ Latency (L)      │ PC/EL (Configurable)
```

---

## Module 2 — Consensus Raft & CRDTs (2h)

### 🔍 Algorithme de Consensus Raft

L'algorithme **Raft** (Ongaro & Ousterhout, 2014) a été conçu pour être plus lisible et plus simple à implémenter que Paxos. Il fonctionne en 3 états :

```
ÉTAPES DE L'ALGORITHME RAFT

  ┌──────────────┐   (Timeout élection dépassé)    ┌──────────────┐
  │  FOLLOWER    │────────────────────────────────→│  CANDIDATE   │
  └──────────────┘                                 └──────┬───────┘
         ▲                                                │
         │ (Découverte d'un Leader avec Term supérieur)   │ (Obtient la majorité des votes)
         │                                                ▼
  ┌──────┴───────┐                                 ┌──────────────┐
  │  FOLLOWER    │←────────────────────────────────│   LEADER     │
  └──────────────┘                                 └──────────────┘
```

Règles de sécurité Raft :
- **Unicité du Leader** : Un seul leader élu par terme (Term).
- **Log Matching** : Si deux journaux contiennent une entrée avec le même index et terme, ils sont identiques jusqu'à cet index.
- **Leader Completeness** : Si une entrée de journal est validée (Committed) dans un terme, elle sera présente dans le journal des leaders de tous les termes futurs.

### 🔍 CRDTs (Conflict-free Replicated Data Types)

Un **CRDT** est une structure de données distribuée qui peut être répliquée sur plusieurs nœuds en parallèle, modifiée sans aucune coordination ni verrou, et dont la convergence finale est **mathématiquement garantie** dès que les répliques reçoivent toutes les mises à jour.

- **PN-Counter (Positive-Negative Counter)** : Compteur distribué autorisant incréments et décréments.
- **LWW-Element-Set (Last-Write-Wins Set)** : Ensemble avec résolution de conflits par horodatage (Timestamp).

---

## Module 3 — Implémentation d'un CRDT PN-Counter (1h30)

### 🛠️ Script Python : CRDT PN-Counter (Distributed Counter without Locks)

```python
#!/usr/bin/env python3
"""
PARADIS — CRDT PN-Counter (Positive-Negative Counter) Simulation
Démontre la convergence mathématique d'un compteur distribué sans aucun verrou réseau.
"""
from dataclasses import dataclass, field
from typing import Dict

@dataclass
class PNCounterNode:
    node_id: str
    p_vector: Dict[str, int] = field(default_factory=dict) # Vecteur d'incréments
    n_vector: Dict[str, int] = field(default_factory=dict) # Vecteur de décréments

    def increment(self, value: int = 1):
        self.p_vector[self.node_id] = self.p_vector.get(self.node_id, 0) + value

    def decrement(self, value: int = 1):
        self.n_vector[self.node_id] = self.n_vector.get(self.node_id, 0) + value

    def value(self) -> int:
        """Valeur locale actuelle du compteur"""
        sum_p = sum(self.p_vector.values())
        sum_n = sum(self.n_vector.values())
        return sum_p - sum_n

    def merge(self, other_node: 'PNCounterNode'):
        """Fonction de fusion commutative, associative et idempotente (Semilattice Join)"""
        # Fusion des incréments (max par nœud)
        all_p_keys = set(self.p_vector.keys()).union(other_node.p_vector.keys())
        for k in all_p_keys:
            self.p_vector[k] = max(self.p_vector.get(k, 0), other_node.p_vector.get(k, 0))

        # Fusion des décréments (max par nœud)
        all_n_keys = set(self.n_vector.keys()).union(other_node.n_vector.keys())
        for k in all_n_keys:
            self.n_vector[k] = max(self.n_vector.get(k, 0), other_node.n_vector.get(k, 0))


if __name__ == "__main__":
    print("=== DÉMONSTRATION CRDT PN-COUNTER (DISTRIBUTED LOCK-FREE COUNTER) ===\n")

    # Création de 3 nœuds géographiquement distants (Paris, New York, Tokyo)
    node_paris = PNCounterNode("node-paris")
    node_ny    = PNCounterNode("node-new-york")
    node_tokyo = PNCounterNode("node-tokyo")

    # Modifications locales simultanées sans aucune communication préalable
    print("[1] Actions locales hors-ligne :")
    node_paris.increment(10)   # Paris : +10
    node_paris.decrement(2)    # Paris : -2  (Valeur locale Paris = 8)

    node_ny.increment(5)       # NY : +5     (Valeur locale NY = 5)

    node_tokyo.increment(20)   # Tokyo : +20
    node_tokyo.decrement(7)    # Tokyo : -7  (Valeur locale Tokyo = 13)

    print(f"  • Valeur Paris    : {node_paris.value()}")
    print(f"  • Valeur New York : {node_ny.value()}")
    print(f"  • Valeur Tokyo    : {node_tokyo.value()}")
    print()

    # Synchronisation des répliques (Gossip Protocol / Resync)
    print("[2] Synchronisation / Fusion asynchrone des répliques (Merge)...")
    node_paris.merge(node_ny)
    node_paris.merge(node_tokyo)

    node_ny.merge(node_paris)
    node_tokyo.merge(node_paris)

    print("\n[3] Résultat après convergence mathématique :")
    print(f"  • Valeur Finale Paris    : {node_paris.value()}")
    print(f"  • Valeur Finale New York : {node_ny.value()}")
    print(f"  • Valeur Finale Tokyo    : {node_tokyo.value()}")

    assert node_paris.value() == node_ny.value() == node_tokyo.value() == 26
    print("\n[✅ CONVERGENCE GARANTIE] Tous les nœuds affichent la valeur exacte : 26")
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CAP** | Consistency, Availability, Partition Tolerance — Théorème d'Eric Brewer sur les limites des systèmes distribués |
| **PACELC** | Extension du théorème CAP formulée par Daniel Abadi prenant en compte la latence en régime normal |
| **CRDT** | Conflict-free Replicated Data Types — Structures de données distribuées garantissant la convergence sans verrou |
| **Raft** | Algorithme de consensus distribué basé sur l'élection d'un leader et la réplication de journaux |
| **LWW** | Last-Write-Wins — Stratégie de résolution de conflit basée sur l'horodatage le plus récent |

---

## Exercices Pratiques

### Exercice 1 — Analyse PACELC

Une application bancaire exige qu'un solde de compte ne puisse jamais devenir négatif à la suite de deux retraits simultanés dans deux pays différents.

1. Selon le théorème PACELC, quel profil de base de données devez-vous choisir (**PC/EC** ou **PA/EL**) ?
2. Quelle sera la conséquence sur les temps de réponse (latence) des transactions en régime normal ?

**Corrigé guidé :**
1. Vous devez choisir un profil **PC/EC (Consistency in Partition / Consistency in Normal)** comme CockroachDB ou PostgreSQL avec réplication synchrone.
2. **Conséquence sur la latence** : En choisissant **EC (Consistency in Normal)** au lieu de **EL (Latency)**, chaque écriture doit attendre la confirmation de la majorité des nœuds (consensus Raft inter-datacenter). La latence des transactions sera plus élevée (ex: 50-100 ms au lieu de 5 ms), mais l'intégrité financière est garantie (aucun surtirage possible).

---

## Banque QCM — 5 Questions

**Q1.** Que démontre le **Théorème CAP** en présence d'une coupure réseau (Network Partition) dans un système distribué ?

- A) Le système peut conserver 100% de la vitesse et de la sécurité.
- B) Le système doit obligatoirement choisir entre maintenir la **Cohérent (Consistency)** ou la **Disponibilité (Availability)**. ✅
- C) Les serveurs doivent être redémarrés.
- D) Le réseau devient 10 fois plus rapide.

**Q2.** Dans l'extension **PACELC**, que signifie la seconde partie **EL** (else Latency) ?

- A) En cas de panne, le système s'éteint.
- B) En régime normal (sans coupure réseau), le système privilégie la latence faible (vitesse) par rapport à la cohérence forte immédiate. ✅
- C) Le système utilise le langage Erlang.
- D) Les logs sont enregistrés sur disque.

**Q3.** Dans l'algorithme de consensus **Raft**, que se passe-t-il si un Follower ne reçoit plus de signaux de vie (Heartbeat) du Leader ?

- A) Il éteint son serveur.
- B) Son temporisateur d'élection expire, il passe à l'état **Candidate**, incrémente le Term et sollicite les votes des autres nœuds pour devenir le nouveau Leader. ✅
- C) Il supprime son journal de logs.
- D) Il envoie un e-mail à l'administrateur.

**Q4.** Quelle est la propriété fondamentale d'un **CRDT (Conflict-free Replicated Data Type)** ?

- A) Il nécessite un serveur coordinateur unique.
- B) Il permet d'effectuer des modifications concurrentes sur plusieurs nœuds sans aucun verrou réseau, avec la garantie mathématique que toutes les répliques convergeront vers le même état final dès la réception de tous les messages. ✅
- C) Il ne fonctionne qu'avec des nombres entiers positifs.
- D) Il est incompatible avec Kubernetes.

**Q5.** Dans un **PN-Counter CRDT**, comment la valeur actuelle du compteur est-elle calculée sur un nœud ?

- A) En lisant une seule valeur globale sur le serveur central.
- B) En faisant la différence entre la somme de tous les incréments du vecteur P et la somme de tous les décréments du vecteur N : $\text{Value} = \sum P - \sum N$. ✅
- C) En tirant un nombre aléatoire.
- D) En multipliant les vecteurs par zéro.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
