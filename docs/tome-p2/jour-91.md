# TOME P2 — Réseaux & Télécoms — Jour 91 (6h) : Ingestion de Données Temps Réel — Apache Kafka & Event-Driven Architecture

> [!NOTE]
> **Objectif du jour :** Comprendre et mettre en œuvre une architecture orientée événements (Event-Driven Architecture) avec Apache Kafka : Producers, Consumers, Topics, Partitionnement, Consumer Groups et intégration Python pour l'ingestion de flux de transactions bancaires en temps réel.
>
> **Compétences visées :** `BIT-06` (A) — Architectures Données & Streaming | `BIT-04` (A) — Ingestion Haute Performance

---

## 1) Module — Concepts Fondamentaux Kafka & Event Streaming (2h)

### 📖 Narration/Intuition

Dans une infrastructure bancaire moderne, les événements se produisent en continu : chaque paiement par carte, virement interbancaire ou tentative de connexion génère une donnée instantanée. L'architecture traditionnelle où les applications interrogent une base de données centrale toutes les 5 secondes ne passe pas à l'échelle.

**Apache Kafka** est une plateforme de **streaming d'événements distribuée**. Il agit comme un journal d'audit immuable et hautement disponible, capable d'absorber des millions d'événements par seconde avec une latence inférieure à 10 millisecondes.

### 🔍 Anatomie Technique

**Architecture d'un Cluster Kafka :**

```
┌─────────────────────────────────────────────────────────────┐
│                       PRODUCERS                             │
│  ┌─────────────────┐   ┌────────────────┐   ┌────────────┐  │
│  │ Appli Virement  │   │ Terminal TPE   │   │ Web Banking│  │
│  └────────┬────────┘   └───────┬────────┘   └─────┬──────┘  │
└───────────┼────────────────────┼──────────────────┼─────────┘
            │ Produce Events (Publish)
┌───────────▼────────────────────▼──────────────────▼─────────┐
│                    KAFKA CLUSTER (BROKERS)                  │
│                                                             │
│  Topic: "bcc-transactions" (Partitions: 3, Replication: 2)  │
│  ┌────────────────────────┐  ┌───────────────────────────┐  │
│  │ Broker 1 (Leader P0)   │  │ Broker 2 (Leader P1)      │  │
│  │ Follower P1            │  │ Follower P0               │  │
│  └────────────────────────┘  └───────────────────────────┘  │
└───────────┬──────────────────────────────────────┬──────────┘
            │ Consume Events (Subscribe / Consumer Groups)
┌───────────▼──────────────────────────────────────▼──────────┐
│                       CONSUMERS                             │
│  ┌─────────────────────────┐   ┌─────────────────────────┐  │
│  │ Service Anti-Fraude     │   │ Core Banking Storage    │  │
│  │ (Consumer Group: fraud) │   │ (Consumer Group: db-sync)│ │
│  └─────────────────────────┘   └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Production & Consommation d'Événements avec Python (2h)

### 📖 Narration/Intuition

Un **Producer** publie des messages dans un **Topic**. Chaque message possède une clé (Key) et une valeur (Value). La clé détermine dans quelle partition le message est stocké (garantissant l'ordre strict des événements pour un même compte bancaire).

Les **Consumers** lisent les messages de manière asynchrone sans bloquer les producteurs.

### 🔍 Anatomie Technique

**Code du Producer Python (`kafka_producer_tx.py`) :**

```python
#!/usr/bin/env python3
"""
kafka_producer_tx.py — Générateur de flux de transactions bancaires pour Kafka
"""
from kafka import KafkaProducer
import json
import time
import uuid
import random

KAFKA_SERVER = "10.0.30.10:9092"
TOPIC_NAME = "bcc-transactions"

# Initialiser le producteur Kafka avec sérallisation JSON
producer = KafkaProducer(
    bootstrap_servers=[KAFKA_SERVER],
    key_serializer=lambda k: k.encode('utf-8'),
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    acks='all',  # Attendre confirmation de tous les réplicas (sécurité max)
    retries=5
)

print(f"[+] Producteur Kafka connecté à {KAFKA_SERVER}. Diffusion sur '{TOPIC_NAME}'...")

def generer_transaction():
    compte_id = f"BCC-{random.randint(1000, 1050)}"
    return compte_id, {
        "tx_id": str(uuid.uuid4()),
        "compte_id": compte_id,
        "montant": round(random.uniform(10.0, 5000.0), 2),
        "devise": "CDF",
        "timestamp": int(time.time()),
        "canal": random.choice(["MOBILE", "TPE", "WEB", "ATM"])
    }

try:
    for i in range(100):
        compte_key, tx_data = generer_transaction()
        
        # La clé 'compte_key' garantit que toutes les transactions du même compte
        # vont dans la MÊME partition (ordre chronologique préservé)
        future = producer.send(TOPIC_NAME, key=compte_key, value=tx_data)
        record_metadata = future.get(timeout=10)
        
        print(f"[{i+1}/100] Tx transmise -> Partition: {record_metadata.partition}, Offset: {record_metadata.offset}")
        time.sleep(0.1)

except Exception as e:
    print(f"❌ Erreur d'envoi Kafka : {e}")

finally:
    producer.flush()
    producer.close()
```

**Code du Consumer Python (`kafka_consumer_fraud.py`) :**

```python
#!/usr/bin/env python3
"""
kafka_consumer_fraud.py — Service de détection de fraude en temps réel consommant les événements Kafka
"""
from kafka import KafkaConsumer
import json

KAFKA_SERVER = "10.0.30.10:9092"
TOPIC_NAME = "bcc-transactions"
GROUP_ID = "service-anti-fraude"

consumer = KafkaConsumer(
    TOPIC_NAME,
    bootstrap_servers=[KAFKA_SERVER],
    group_id=GROUP_ID,
    auto_offset_reset='earliest',
    enable_auto_commit=True,
    key_deserializer=lambda k: k.decode('utf-8') if k else None,
    value_deserializer=lambda v: json.loads(v.decode('utf-8'))
)

print(f"[+] Service Anti-Fraude en écoute sur '{TOPIC_NAME}' (Group: {GROUP_ID})...")

for message in consumer:
    tx = message.value
    compte_id = message.key
    
    # Règle de détection de fraude simple (Alerte si montant > 4000 CDF)
    if tx['montant'] > 4000.0:
        print(f"🚨 ALERTE FRAUDE : Tx Suspecte {tx['tx_id']} sur compte {compte_id} !")
        print(f"   Montant : {tx['montant']} {tx['devise']} via {tx['canal']}")
    else:
        print(f"✅ Tx Conforme {tx['tx_id']} ({tx['montant']} CDF)")
```

---

## 3) Module — Supervision & Haute Disponibilité de Kafka (2h)

### 📖 Narration/Intuition

En production bancaire, la perte d'un message Kafka est inacceptable. Pour garantir la tolérance aux pannes, Kafka s'appuie sur le réplication intra-cluster (Factor de réplication >= 3) et un quorum d'acquittement (`acks=all`).

### 🔍 Anatomie Technique

**Gestion des Topics via la CLI Kafka :**

```bash
# 1. Créer un Topic hautement disponible (3 partitions, réplication 3)
kafka-topics.sh --bootstrap-server 10.0.30.10:9092 \
  --create --topic bcc-transactions-prod \
  --partitions 3 \
  --replication-factor 3

# 2. Inspecter l'état du Topic et les Leaders de partitions
kafka-topics.sh --bootstrap-server 10.0.30.10:9092 \
  --describe --topic bcc-transactions-prod

# 3. Monitorer le retard des consommateurs (Consumer Group Lag)
kafka-consumer-groups.sh --bootstrap-server 10.0.30.10:9092 \
  --describe --group service-anti-fraude
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Topic** | Catégorie ou nom de flux auquel les messages sont publiés dans Kafka |
| **Partition** | Division physique d'un topic permettant le parallélisme et le scaling |
| **Offset** | Identifiant séquentiel unique attribué à chaque message au sein d'une partition |
| **Consumer Group** | Ensemble de consommateurs coopérant pour lire les données d'un topic |
| **ISR** | In-Sync Replicas — Liste des nœuds réplicas synchronisés avec le leader |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est l'utilité de définir une clé (`Key`) lors de la publication d'un message dans Kafka ?

**Corrigé :** La clé (`Key`) est utilisée par l'algorithme d'assignation de Kafka (hachage de la clé) pour déterminer dans quelle **partition** du topic le message sera stocké. Tous les messages partageant la même clé (ex: le même `compte_id`) sont obligatoirement envoyés dans la **même partition**, ce qui garantit qu'ils seront lus dans leur **ordre chronologique exact** par le consommateur.

**Exercice 2 :** Que signifie le paramètre `acks='all'` (ou `acks=-1`) du producteur Kafka ?

**Corrigé :** Ce paramètre indique que le producteur ne considérera le message comme transmis qu'une fois que le leader de la partition ET tous les réplicas synchronisés (ISR - In-Sync Replicas) auront confirmé l'écriture du message sur leur disque. C'est le niveau de garantie de durabilité maximal, empêchant la perte de messages même en cas de crash du broker leader.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans Apache Kafka, quelle structure garantit le stockage des messages dans un ordre chronologique strict ?
- A) Le cluster global
- B) La partition individuelle d'un topic
- C) Le fichier de configuration du client
- D) Le composant Zookeeper

**Réponse : B**

**Q2 :** Comment appelle-t-on le pointeur numérique qui marque la position de lecture exacte d'un consommateur dans une partition Kafka ?
- A) Index
- B) Offset
- C) Pointer
- D) Hash

**Réponse : B**

**Q3 :** Si un topic Kafka possède 4 partitions et qu'un Consumer Group contient 6 consommateurs, combien de consommateurs liront des données simultanément ?
- A) 6
- B) 4 (2 consommateurs resteront inactifs en attente)
- C) 24
- D) Aucun

**Réponse : B**

**Q4 :** Quel composant d'une architecture Event-Driven avec Kafka est chargé de s'abonner aux topics pour traiter les événements ?
- A) Broker
- B) Producer
- C) Consumer
- D) Schema Registry

**Réponse : C**

**Q5 :** Quel est le principal avantage de l'architecture événementielle (Event-Driven) par rapport aux architectures monolithiques basées sur des requêtes synchrones ?
- A) Les consommateurs sont complètement découplés des producteurs et peuvent traiter les événements de manière asynchrone à leur propre rythme
- B) Elle n'utilise pas de réseau informatique
- C) Elle supprime le besoin de bases de données
- D) Elle ne fonctionne qu'avec des fichiers texte

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
