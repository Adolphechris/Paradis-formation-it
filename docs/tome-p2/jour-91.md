# TOME P2 — Réseaux & Télécoms — Jour 91 (6h) : Ingestion de Données Temps Réel — Apache Kafka & Event-Driven Architecture

> [!NOTE]
> **Objectif du jour :** Comprendre les concepts fondamentaux d'une architecture orientée événements (Event-Driven) avec Apache Kafka : Topics, Producers, Consumers, Partitions et Consumer Groups, pour l'ingestion de flux de données en temps réel.
>
> **Compétences visées :** `BIT-04` (A) — Architectures Données & Streaming | `BIT-06` (A) — Ingestion Temps Réel

---

## 1) Module — Concepts Fondamentaux Kafka & Event Streaming (2h)

### 📖 Narration/Intuition

Dans les infrastructures modernes, les événements se produisent en continu : chaque transaction, connexion ou action génère une donnée instantanée. L'architecture traditionnelle où les applications interrogent une base de données centrale ne passe pas à l'échelle.

**Apache Kafka** est une plateforme de **streaming d'événements distribuée**. Il agit comme un journal immuable et hautement disponible, capable d'absorber des millions d'événements par seconde.

### 🔍 Anatomie Technique

**Architecture d'un Cluster Kafka :**

```
┌─────────────────────────────────────────────────────────────┐
│                       PRODUCERS                             │
│  Applications qui publient des messages                     │
└───────────────────────────┬─────────────────────────────────┘
                            │ Produce Events
┌───────────────────────────▼─────────────────────────────────┐
│                    KAFKA CLUSTER (BROKERS)                  │
│                                                             │
│  Topic: "evenements" (Partitions: 3, Replication: 2)        │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │ Broker 1 (Leader)   │  │ Broker 2 (Follower)         │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ Consume Events
┌───────────────────────────▼─────────────────────────────────┐
│                       CONSUMERS                             │
│  Services qui traitent les événements                       │
└─────────────────────────────────────────────────────────────┘
```

**Concepts clés :**
- **Topic** : Catégorie de flux d'événements.
- **Partition** : Division physique permettant le parallélisme.
- **Offset** : Position de lecture dans une partition.
- **Consumer Group** : Ensemble de consommateurs coopérant pour lire un topic.

---

## 2) Module — Production & Consommation d'Événements avec Python (2h)

### 🔍 Anatomie Technique

**Code du Producer Python (`kafka_producer.py`) :**

```python
#!/usr/bin/env python3
"""
kafka_producer.py — Générateur d'événements pour Kafka
"""
from kafka import KafkaProducer
import json
import time
import uuid

producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    acks='all',
    retries=5
)

print("[+] Producteur Kafka connecté.")

for i in range(50):
    evenement = {
        "id": str(uuid.uuid4()),
        "type": "transaction",
        "montant": round(time.time() % 1000, 2),
        "timestamp": int(time.time())
    }
    producer.send("evenements", value=evenement)
    print(f"[{i+1}] Événement envoyé : {evenement['id']}")
    time.sleep(0.2)

producer.flush()
producer.close()
```

**Code du Consumer Python (`kafka_consumer.py`) :**

```python
#!/usr/bin/env python3
"""
kafka_consumer.py — Consommateur d'événements Kafka
"""
from kafka import KafkaConsumer
import json

consumer = KafkaConsumer(
    "evenements",
    bootstrap_servers=['localhost:9092'],
    group_id="service-traitement",
    auto_offset_reset='earliest',
    value_deserializer=lambda v: json.loads(v.decode('utf-8'))
)

print("[+] Consumer en écoute sur le topic 'evenements'...")

for message in consumer:
    evenement = message.value
    print(f"Reçu : {evenement['type']} | ID: {evenement['id']} | Montant: {evenement.get('montant', 'N/A')}")
```

---

## 3) Module — Supervision & Haute Disponibilité de Kafka (2h)

### 🔍 Anatomie Technique

**Commandes de gestion d'un Topic Kafka :**

```bash
# Créer un Topic avec 3 partitions et facteur de réplication 2
kafka-topics.sh --bootstrap-server localhost:9092 \
  --create --topic evenements \
  --partitions 3 \
  --replication-factor 2

# Décrire l'état d'un Topic
kafka-topics.sh --bootstrap-server localhost:9092 \
  --describe --topic evenements

# Monitorer le retard des Consumers
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --describe --group service-traitement
```

**Règle d'or :** Un facteur de réplication >= 3 et `acks=all` garantissent qu'aucun message n'est perdu en cas de panne d'un broker.

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Topic** | Catégorie de flux d'événements dans Kafka |
| **Partition** | Division physique d'un topic pour le parallélisme |
| **Offset** | Position séquentielle de lecture dans une partition |
| **Consumer Group** | Ensemble de consommateurs partageant la lecture d'un topic |
| **ISR** | In-Sync Replicas — réplicas synchronisés avec le leader |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est l'utilité de la clé (Key) lors de la publication d'un message dans Kafka ?

**Corrigé :** La clé détermine dans quelle **partition** le message est stocké (par hachage). Tous les messages partageant la même clé vont dans la même partition, garantissant leur ordre chronologique de lecture.

---

**Exercice 2 :** Si un topic possède 4 partitions et qu'un Consumer Group contient 6 consommateurs, combien de consommateurs sont actifs ?

**Corrigé :** Seuls **4 consommateurs** sont actifs (un par partition). Les 2 autres restent en attente (inactifs). Si un consommateur tombe, un consommateur inactif prend sa place.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans Apache Kafka, quelle structure garantit le stockage des messages dans un ordre chronologique strict ?
- A) Le cluster global
- B) La partition individuelle d'un topic
- C) Le fichier de configuration
- D) Zookeeper

**Réponse : B**

---

**Q2 :** Comment appelle-t-on le pointeur numérique qui marque la position de lecture exacte d'un consommateur dans une partition Kafka ?
- A) Index
- B) Offset
- C) Pointer
- D) Hash

**Réponse : B**

---

**Q3 :** Si un topic possède 4 partitions et qu'un Consumer Group contient 6 consommateurs, combien de consommateurs lisent des données simultanément ?
- A) 6
- B) 4 (2 inactifs)
- C) 24
- D) Aucun

**Réponse : B**

---

**Q4 :** Quel paramètre du Producer garantit que le message n'est considéré comme envoyé qu'après confirmation de tous les réplicas ?
- A) acks=0
- B) acks=1
- C) acks=all
- D) retries=0

**Réponse : C**

---

**Q5 :** Quel est le principal avantage de l'architecture événementielle par rapport aux architectures synchrones ?
- A) Les consommateurs sont découplés des producteurs et traitent les événements de manière asynchrone
- B) Elle n'utilise pas de réseau
- C) Elle supprime le besoin de bases de données
- D) Elle ne fonctionne qu'avec des fichiers texte

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
