# TOME P4 — Cloud, DevOps & SecOps — Jour 161 (6h) : Architectures de Messagerie & Distributed Event Streaming (RabbitMQ, Apache Kafka & Event-Driven Banking)

> [!NOTE]
> **Objectif du jour :** Architecturer et déployer des infrastructures d'échange de messages et de streaming d'événements à haute performance : comparaison Message Brokers (RabbitMQ, AMQP) vs Distributed Log Event Streaming (Apache Kafka), conception de microservices financiers évènementiels (Event-Driven Architecture), garantie de livraison des messages (At-least-once, Exactly-once processing), et sécurisation du bus de données bancaire (TLS, SASL/SCRAM, ACLs Kafka).
>
> **Compétences visées :** `BIT-04` (A) — Distributed Event Streaming & Messaging | `SEC-05` (A) — Sécurité des Bus de Données & SASL/TLS

---

## 1) Module — Message Brokers vs Distributed Event Streaming (2h)

### 📖 Narration/Intuition

Dans une architecture monolithique bancaire classique, lorsqu'un virement interbancaire se produit, le composant central appelle directement par HTTP les services de notification, de comptabilité, de détection de fraudes et d'archivage (Couplage Fort - Synchronous). Si le service de notification est en panne, tout le virement échoue.

Dans une **Architecture Orientée Événements (Event-Driven Architecture - EDA)**, le composant de virement publie un événement `VirementEffectue` dans un bus de messages central. Les microservices abonnés (Comptabilité, Notification, Fraud Detection) consomment cet événement à leur propre rythme de manière totalement asynchrone (Couplage Faible - Asynchronous).

### 🔍 Anatomie Technique

**Comparaison RabbitMQ (Message Broker) vs Apache Kafka (Distributed Log) :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       RABBITMQ vs APACHE KAFKA                              │
├──────────────┬──────────────────────────────────────────────────────────────┤
│ Caractéristique│ RabbitMQ (Message Broker AMQP)                              │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Modèle       │ File d'attente (Queue) de messages. Le message est SUPPRIMÉ  │
│              │ de la file dès qu'il est acquitté (ACK) par le consommateur.  │
│ Usage Cible  │ Tâches d'arrière-plan, routage complexe, workflows unitaires.│
├──────────────┼──────────────────────────────────────────────────────────────┤
│              │ Apache Kafka (Distributed Commit Log)                        │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Modèle       │ Journal d'événements immuable distribué. Les messages sont  │
│              │ CONSERVÉS sur disque pendant X jours et rejouables (Replay). │
│ Usage Cible  │ Event Streaming haute vélocité, Event Sourcing, Analytics.   │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Architecture Apache Kafka : Topics, Partitions & Consumer Groups (2h)

### 📖 Narration/Intuition

Comment Kafka parvient-il à traiter plus de **1 million d'événements par seconde** sur un cluster de banques centrales ?

La réponse réside dans le **Partitionnement**. Un **Topic** Kafka (ex: `bcc.rtgs.transactions`) est découpé en plusieurs **Partitions** réparties sur différents serveurs (Brokers). Plusieurs instances d'un même microservice regroupées au sein d'un **Consumer Group** consomment les partitions en parallèle.

### 🔍 Anatomie Technique

**Architecture d'un Topic Kafka Partitionné avec Consumer Group :**

```
TOPIC: bcc.rtgs.transactions
┌─────────────────────────────────────────────────────────────────────────────┐
│ Partition 0 : [Msg 0] [Msg 1] [Msg 2] [Msg 3] ... ──► Consommateur A        │
│ Partition 1 : [Msg 0] [Msg 1] [Msg 2] [Msg 3] ... ──► Consommateur B        │ (Consumer Group:
│ Partition 2 : [Msg 0] [Msg 1] [Msg 2] [Msg 3] ... ──► Consommateur C        │  fraud-detection)
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3) Module — Laboratoire Pratique : Production, Consommation & Sécurité SASL/TLS (2h)

### 📖 Narration/Intuition

En production bancaire, aucun message contenant des informations financières ne doit circuler en clair sur le bus Kafka. Le cluster Kafka doit exiger l'authentification **SASL/SCRAM-SHA-512** et le chiffrement **TLS 1.3**.

### 🔍 Anatomie Technique

**Script Python de Production d'Événements Kafka Sécurisé (`kafka_producer_bcc.py`) :**

```python
#!/usr/bin/env python3
"""
kafka_producer_bcc.py — Producteur Kafka sécurisé TLS/SASL pour transactions BCC
"""
import json
import logging
from kafka import KafkaProducer

logging.basicConfig(level=logging.INFO)

# Configuration du producteur Kafka sécurisé avec SASL/SCRAM-SHA-512 & TLS
producer = KafkaProducer(
    bootstrap_servers=['kafka-broker1.bcc.internal:9093', 'kafka-broker2.bcc.internal:9093'],
    security_protocol='SASL_SSL',
    sasl_mechanism='SCRAM-SHA-512',
    sasl_plain_username='app_virement_user',
    sasl_plain_password='SuperSecretKafkaPassword2026!',
    ssl_cafile='/etc/kafka/certs/ca-bcc.crt',
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    acks='all',  # Garantie de livraison forte (Wait for all replicas ACK)
    retries=5
)

def emettre_evenement_virement(tx_id, source, destination, montant):
    payload = {
        "transaction_id": tx_id,
        "compte_source": source,
        "compte_destination": destination,
        "montant": montant,
        "devise": "CDF",
        "timestamp": "2026-08-06T22:16:00Z"
    }
    
    # Envoi asynchrone sur le topic Kafka bancaire avec clé de partitionnement (compte_source)
    future = producer.send(
        'bcc.rtgs.transactions',
        key=source.encode('utf-8'),
        value=payload
    )
    result = future.get(timeout=10)
    logging.info(f"✅ Événement virement publié sur partition {result.partition} à offset {result.offset}")

if __name__ == '__main__':
    emettre_evenement_virement("TX-998811", "CDF-001-998", "CDF-002-445", 500000.00)
    producer.flush()
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **AMQP** | Advanced Message Queuing Protocol — Protocole ouvert de messagerie d'entreprise (RabbitMQ) |
| **EDA** | Event-Driven Architecture — Architecture logicielle orientée événements |
| **SASL** | Simple Authentication and Security Layer — Cadre d'authentification réseau (SCRAM) |
| **ACK** | Acknowledgment — Signal d'acquittement de réception d'un message |
| **Offsets** | Identifiant séquentiel unique attribué à chaque message au sein d'une partition Kafka |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence essentielle entre la sémantique de livraison **At-least-once** et **Exactly-once** dans Apache Kafka ?

**Corrigé :** La sémantique **At-least-once (Au moins une fois)** garantit qu'aucun message ne sera perdu, mais en cas de panne réseau ou de ré-essai (Retry), un même message peut être délivré plusieurs fois au consommateur (risque de doublon). La sémantique **Exactly-once (Exactement une fois)** combine l'écriture idempotente du producteur (`enable.idempotence=true`) et le traitement transactionnel Kafka pour garantir que chaque événement est produit, transmis et consommé **exactement une seule fois**, éliminant tout risque de double crédit bancaire.

**Exercice 2 :** Pourquoi est-il recommandé d'utiliser une **clé de message (Message Key)** pertinente (ex: `compte_source`) lors de la publication d'un événement sur un Topic Kafka partitionné ?

**Corrigé :** Kafka garantit l'ordre strict d'arrivée des messages uniquement **au sein d'une même partition**, et non à travers tout le topic. En utilisant le `compte_source` comme clé de message, Kafka applique un hachage sur cette clé et garantit que **tous les événements concernant un même compte bancaire seront toujours envoyés dans la même partition**. Le microservice consommateur traitera ainsi l'historique des transactions de ce compte dans l'ordre chronologique exact de leur émission.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la différence fondamentale de comportement concernant la rétention des messages entre RabbitMQ et Apache Kafka ?
- A) RabbitMQ supprime le message de la file dès son acquittement (ACK), tandis que Kafka conserve les messages sur disque dans un journal immuable pendant une durée configurable
- B) Kafka ne stocke aucun message sur disque
- C) RabbitMQ ne fonctionne que sur Mac
- D) Kafka est écrit en HTML

**Réponse : A**

**Q2 :** Dans Apache Kafka, quel composant permet de distribuer la charge de lecture d'un Topic entre plusieurs instances parallèles d'un même microservice ?
- A) Consumer Group (Groupe de consommateurs)
- B) Disquette
- C) Câble Ethernet
- D) Navigateur web

**Réponse : A**

**Q3 :** Quel paramètre du producteur Kafka (`acks`) garantit le niveau de durabilité le plus élevé en attendant la confirmation d'écriture du message sur l'ensemble des répliques du cluster ?
- A) `acks='all'` (ou `acks=-1`)
- B) `acks=0`
- C) `acks=1`
- D) `acks=none`

**Réponse : A**

**Q4 :** Quel mécanisme d'authentification réseau associé à TLS 1.3 est recommandé pour sécuriser l'accès des clients au cluster Kafka d'une banque ?
- A) SASL/SCRAM-SHA-512
- B) Pas de mot de passe
- C) Plaintext anonyme
- D) HTTP Basic Auth non chiffré

**Réponse : A**

**Q5 :** Dans une architecture Event-Driven, comment s'appelle le mécanisme qui permet à un service consommateur d'un topic Kafka de rejouer l'ensemble de l'historique des événements depuis le début du journal ?
- A) Event Replay (Rejeu d'événements via décalage d'Offset à zéro)
- B) Suppression de base
- C) Redémarrage du routeur
- D) Impression papier

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
