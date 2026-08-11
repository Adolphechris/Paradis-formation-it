# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 562 (6h) : Event-Driven Architecture (EDA) : Apache Kafka Avancé, Schema Registry & Kafka Streams

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser l'architecture interne d'**Apache Kafka** à forte échelle : Partitions, Consumer Groups, Rebalancing, Log Compaction
> - Implémenter la gouvernance de schéma avec **Confluent Schema Registry** (formats Avro / Protobuf) pour garantir la compatibilité des messages
> - Développer des traitements de flux en temps réel avec **Kafka Streams** (KStream vs KTable, Windowing, Joins)
> - Configurer la garantie de livraison **Exactly-Once Semantics (EOS / `processing.guarantee=exactly_once_v2`)**
>
> **Compétences visées :** `ARCH-01` (A), `DEV-02` (A) — Event-Driven Architecture, Apache Kafka Avancé, Schema Registry

---

## Module 1 — Architecture Avancée Apache Kafka & Schema Registry (2h)

### 📖 Intuition & Narration

Apache Kafka n'est pas un simple broker de messages traditionnel (comme RabbitMQ ou ActiveMQ) : c'est un **journal de commits distribué et persistant à très haute performance**, capable de traiter des millions d'événements par seconde.

Dans une **Event-Driven Architecture (EDA)**, les événements sont la source de vérité immuable. Les applications ne s'appellent pas directement : elles publient des faits ("Quelque chose s'est produit") et réagissent de manière asynchrone aux faits publiés par les autres.

### 🔍 Gouvernance de Schéma avec Schema Registry (Avro)

Publier des messages JSON non typés dans Kafka mène rapidement au chaos : si un producteur modifie le nom d'un champ (`user_id` → `userID`), tous les consommateurs plantent en production.

Le **Confluent Schema Registry** stocke et valide les schémas **Apache Avro** ou **Protobuf** :

```
FLUX SCHEMA REGISTRY AVRO

  PRODUCER (Python/Go/Java)                         CONSUMER
  ┌─────────────────────────────┐                  ┌─────────────────────────────┐
  │ 1. Vérifie schéma Avro      │                  │ 3. Télécharge schéma Avro   │
  │    auprès de Schema Registry│                  │    selon SchemaID          │
  └──────────────┬──────────────┘                  └──────────────▲──────────────┘
                 │ (Schéma Valide & ID attribué)                  │
                 ▼                                                │
  ┌─────────────────────────────┐    4. Read Msg   ┌──────────────┴──────────────┐
  │ 2. Publie message binaire   │─────────────────→│ Kafka Topic:                │
  │    [Magic Byte + SchemaID]  │                  │ paradis.orders.v1           │
  └─────────────────────────────┘                  └─────────────────────────────┘
```

---

## Module 2 — Kafka Streams : KStream, KTable & Exactly-Once (2h)

### 🔍 KStream vs KTable

Dans **Kafka Streams**, deux abstractions fondamentales représentent les données :

- **`KStream` (Flux d'Événements)** : Représente une séquence infinie d'événements indépendants (ex: clics utilisateurs, transactions). *Chaque nouvel élément est un ajout*.
- **`KTable` (Vue d'État)** : Représente le dernier état connu pour chaque clé (ex: solde actuel d'un compte). *Chaque nouvel élément est une mise à jour (Upsert)*.

$$\text{Stream} + \text{Aggregation} = \text{Table}$$
$$\text{Table} + \text{Changes} = \text{Stream}$$

### 🔍 Exactly-Once Semantics (EOS v2)

Kafka garantit le traitement **Exactly-Once** (exactement une fois) à travers des transactions atomiques combinant la lecture des consommations, la mise à jour de l'état local (RocksDB) et la publication des résultats.

$$\text{Garanties} : \text{At-Most-Once (Perte possible)} \quad \text{At-Least-Once (Doublons possibles)} \quad \text{Exactly-Once (Parfait)}$$

---

## Module 3 — Kafka Event Producer & Schema Validator (1h30)

### 🛠️ Script Python : Kafka Avro Event Producer & Schema Validator

```python
#!/usr/bin/env python3
"""
PARADIS — Apache Kafka Avro Producer & Schema Registry Simulator
Démontre la sérialisation Avro et la validation de schéma d'événements Kafka.
"""
import struct
import json
from dataclasses import dataclass
from typing import Dict, Any

# Définition du Schéma Avro pour l'événement OrderCreated
AVRO_SCHEMA_ORDER_CREATED = {
    "type": "record",
    "name": "OrderCreatedEvent",
    "namespace": "com.paradis.events",
    "fields": [
        {"name": "order_id", "type": "string"},
        {"name": "customer_id", "type": "string"},
        {"name": "total_amount_cents", "type": "long"},
        {"name": "currency", "type": "string", "default": "EUR"},
        {"name": "timestamp_ms", "type": "long"}
    ]
}

class SchemaRegistrySimulator:
    def __init__(self):
        self.schemas: Dict[int, dict] = {}
        self.next_id = 1

    def register_schema(self, subject: str, schema: dict) -> int:
        schema_json = json.dumps(schema, sort_keys=True)
        # Vérifier si déjà enregistré
        for sid, sdict in self.schemas.items():
            if json.dumps(sdict, sort_keys=True) == schema_json:
                return sid

        assigned_id = self.next_id
        self.schemas[assigned_id] = schema
        self.next_id += 1
        print(f"  [SCHEMA REGISTRY] Schéma enregistré pour '{subject}' → SchemaID: {assigned_id}")
        return assigned_id

    def get_schema(self, schema_id: int) -> dict:
        return self.schemas.get(schema_id, {})


class KafkaAvroProducerSimulator:
    def __init__(self, registry: SchemaRegistrySimulator):
        self.registry = registry

    def serialize_message(self, topic: str, schema: dict, payload: dict) -> bytes:
        schema_id = self.registry.register_schema(f"{topic}-value", schema)

        # Format Confluent Wire Format : Magic Byte (0x00) + 4 bytes SchemaID (BE) + Payload
        header = struct.pack(">bI", 0, schema_id)
        # En production : fastavro / confluent-kafka-python sérialise en binaire Avro
        payload_bytes = json.dumps(payload).encode('utf-8')
        return header + payload_bytes

    def produce(self, topic: str, key: str, payload: dict, schema: dict):
        message_bytes = self.serialize_message(topic, schema, payload)
        print(f"  [KAFKA PRODUCER] Message publié sur Topic '{topic}' | Key: '{key}'")
        print(f"                   Taille binaire : {len(message_bytes)} octets (Wire Format OK)")
        print()


if __name__ == "__main__":
    print("=== DÉMONSTRATION KAFKA AVRO & SCHEMA REGISTRY PARADIS ===\n")

    registry = SchemaRegistrySimulator()
    producer = KafkaAvroProducerSimulator(registry)

    # 1. Publication d'un premier événement conforme
    order_event_1 = {
        "order_id": "ORD-2026-001",
        "customer_id": "CUST-4421",
        "total_amount_cents": 14990,
        "currency": "EUR",
        "timestamp_ms": 1775990400000
    }
    producer.produce("paradis.orders.v1", key="CUST-4421", payload=order_event_1, schema=AVRO_SCHEMA_ORDER_CREATED)

    # 2. Re-publication (réutilisation automatique du SchemaID 1)
    order_event_2 = {
        "order_id": "ORD-2026-002",
        "customer_id": "CUST-8812",
        "total_amount_cents": 2990,
        "currency": "EUR",
        "timestamp_ms": 1775990460000
    }
    producer.produce("paradis.orders.v1", key="CUST-8812", payload=order_event_2, schema=AVRO_SCHEMA_ORDER_CREATED)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **EDA** | Event-Driven Architecture — Architecture orientée événements asynchrones |
| **EOS** | Exactly-Once Semantics — Garantie de traitement exactement une fois dans Kafka |
| **Avro** | Format de sérialisation binaire compact avec schéma JSON créé par Doug Cutting |
| **KStream / KTable** | Abstractions Kafka Streams représentant respectivement un flux d'événements et une vue d'état |
| **Log Compaction** | Mécanisme Kafka ne conservant que la dernière valeur connue pour chaque clé dans un topic |

---

## Exercices Pratiques

### Exercice 1 — Stratégie de Partitionnement Kafka

Un système bancaire traite 100 000 transactions/seconde sur un topic Kafka `bank_transactions`. Il est impératif que **toutes les transactions d'un même compte client soient traitées dans l'ordre chronologique exact de leur arrivée**.

1. Quelle doit être la **clé de message (Message Key)** utilisée lors de la publication ?
2. Comment s'assurer que les événements d'un même client arrivent sur la même partition ?
3. Que se passe-t-il si l'on augmente le nombre de partitions du topic de 10 à 20 ?

**Corrigé guidé :**
1. La clé de message doit être **`account_id`** (ou `customer_id`).
2. Kafka applique un algorithme de hachage sur la clé (`murmur2(key) % total_partitions`). Toutes les clés identiques auront le même hash et atterriront obligatoirement sur la **même partition**, garantissant l'ordre strict par la file FIFO de cette partition.
3. Augmenter le nombre de partitions réorganise le hachage (`murmur2(key) % 20`). Pendant et après le redimensionnement, les nouvelles clés iront vers les nouvelles partitions. Pour maintenir l'ordre sans rupture, l'augmentation doit se faire pendant une fenêtre de maintenance ou en utilisant un rééquilibrage contrôlé.

---

## Banque QCM — 5 Questions

**Q1.** Comment Apache Kafka garantit-il l'ordre d'arrivée des messages ?

- A) Dans l'ensemble du cluster, indépendamment du topic et de la partition.
- B) Strictement à l'intérieur d'une **seule et même partition** d'un topic. ✅
- C) Kafka ne garantit jamais l'ordre.
- D) En utilisant des horloges atomiques GPS.

**Q2.** Quel est le rôle principal du **Confluent Schema Registry** dans une architecture Kafka ?

- A) Stocker les mots de passe des utilisateurs.
- B) Centraliser et valider les schémas de messages (Avro/Protobuf) pour appliquer la gouvernance et empêcher qu'un producteur ne publie un message incompatible qui ferait planter les consommateurs. ✅
- C) Nettoyer automatiquement les fichiers de log.
- D) Compresser les données sur le disque dur.

**Q3.** Quelle est la différence conceptuelle entre un **`KStream`** et une **`KTable`** dans Kafka Streams ?

- A) Un `KStream` est payant, une `KTable` est gratuite.
- B) Un `KStream` est un flux d'événements indépendants (chaque enregistrement est un ajout), tandis qu'une `KTable` est une vue d'état à un instant T (chaque enregistrement est une mise à jour par clé). ✅
- C) Une `KTable` ne fonctionne qu'avec SQL Server.
- D) Il n'y a aucune différence.

**Q4.** Que fait le mécanisme de **Log Compaction** dans Kafka ?

- A) Il supprime tous les messages datant de plus de 24h.
- B) Il conserve au minimum la dernière valeur connue pour chaque clé de message dans une partition, supprimant les anciennes valeurs obsolètes. ✅
- C) Il chiffre les logs avec AES-256.
- D) Il convertit les messages binationaux en format texte.

**Q5.** Dans Kafka, la garantie de livraison **Exactly-Once Semantics (EOS)** empêche :

- A) Les attaques par déni de service.
- B) À la fois la perte de messages et le traitement en double des messages lors des pannes du réseau ou des consommateurs. ✅
- C) L'utilisation de plus de 3 brokers.
- D) La lecture de messages par des consommateurs anonymes.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
