# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 123 (6h) : Ingénierie des Données Streaming & Sécurité (Apache Flink, Spark Streaming & Kafka Security)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre des pipelines de traitement analytique de données en flux continu (Stream Processing) hautement disponibles et sécurisés : Apache Flink, Spark Structured Streaming, mécanismes de chiffrement et d'authentification TLS/SASL pour Kafka, et calcul de fenêtres glissantes (Sliding Windows).
>
> **Compétences visées :** `BIT-06` (A) — Architectures Stream Processing | `SEC-03` (A) — Sécurité des Flux de Données Critiques

---

## 1) Module — Stream Processing vs Batch Processing & Apache Flink (2h)

### 📖 Narration/Intuition

En matière de détection de fraude bancaire, le traitement par lots (Batch Processing - ex: exécuter un script PySpark chaque nuit à 2h du matin) est insuffisant. Si un voleur effectue 5 paiements suspects à 14h00, la fraude doit être détectée et le compte bloqué **en moins d'une seconde**, pendant que la transaction est en cours de traitement.

**Apache Flink** est le moteur de **Stream Processing** étatiste (Stateful) de référence. Il traite les événements un par un au fil de l'eau (Event-at-a-time) avec une latence inférieure à la milliseconde et garantit le traitement exact une fois (**Exactly-Once Processing**).

### 🔍 Anatomie Technique

**Architecture d'un Pipeline Stream Processing Apache Flink :**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SOURCE D'ÉVÉNEMENTS EN FLUX (KAFKA / EVENT HUB)          │
│    Transactions bancaires publiées en continu (JSON/Avro)   │
└──────────────┬──────────────────────────────────────────────┘
               │ Flux d'événements temps réel
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. APACHE FLINK STREAM PROCESSING ENGINE                    │
│                                                             │
│  ┌────────────────────────┐   ┌──────────────────────────┐  │
│  │ State Backend (RocksDB)│   │ Fenêtrage Temporel       │  │
│  │ (Mémoire d'état HA)    │   │ (Tumbling/Sliding Window)│  │
│  └───────────┬────────────┘   └────────────▲─────────────┘  │
│              │                             │                │
│              └─────────────────────────────┘                │
│  Calcul : Détecter 3 achats > 1000$ en < 60s sur un même ID │
└──────────────┬──────────────────────────────────────────────┘
               │ Alerte immédiate (< 10ms)
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. ACTION & SINK (BLOCAGE CARTE / NOTIFICATION SIEM)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Sécurisation d'Apache Kafka (TLS, SASL/SCRAM & ACLs) (2h)

### 📖 Narration/Intuition

Par défaut, les échanges entre les applications et un cluster Apache Kafka s'effectuent en clair sans authentification. Sur un réseau bancaire, il est obligatoire de sécuriser le bus de messages :
1. **Chiffrement du trafic (TLS 1.3)** entre producteurs, brokers et consommateurs.
2. **Authentification forte (SASL/SCRAM-SHA-512 ou TLS Client Certs)**.
3. **Contrôle d'accès granulaire (ACLs)** : autoriser uniquement le service "virement" à écrire sur le topic `bcc-virements`.

### 🔍 Anatomie Technique

**Configuration de Sécurité d'un Broker Kafka (`server.properties`) :**

```ini
# Configuration des listeners sécurisés du Broker Kafka
listeners=SASL_SSL://10.0.30.10:9093
advertised.listeners=SASL_SSL://10.0.30.10:9093
security.inter.broker.protocol=SASL_SSL

# Chiffrement TLS
ssl.keystore.location=/var/private/ssl/kafka.server.keystore.jks
ssl.keystore.password=BCC_Keystore_Pass_2024!
ssl.truststore.location=/var/private/ssl/kafka.server.truststore.jks
ssl.truststore.password=BCC_Truststore_Pass_2024!
ssl.enabled.protocols=TLSv1.3

# Authentification SASL/SCRAM-SHA-512
sasl.enabled.mechanisms=SCRAM-SHA-512
sasl.mechanism.inter.broker.protocol=SCRAM-SHA-512
```

**Définition d'ACLs Kafka via CLI :**

```bash
# Autoriser le ServiceAccount 'app-virement' à écrire (WRITE) sur le topic 'bcc-virements'
kafka-acls.sh --bootstrap-server 10.0.30.10:9093 --command-config admin-ssl.properties \
  --add --allow-principal User:app-virement \
  --operation Write --topic bcc-virements

# Bloquer tout accès non autorisé (Deny All par défaut)
```

---

## 3) Module — Traitement par Fenêtres Temporelles avec PySpark (2h)

### 📖 Narration/Intuition

Dans le traitement de flux, on utilise des **Fenêtres Glissantes (Sliding Windows)** pour grouper et analyser les événements arrivés dans un intervalle de temps (ex: calculer le volume total transféré par un compte au cours des 10 dernières minutes, remis à jour toutes les 10 secondes).

### 🔍 Anatomie Technique

**Script PySpark Structured Streaming avec Fenêtre Glissante (`spark_streaming_fraud.py`) :**

```python
#!/usr/bin/env python3
"""
spark_streaming_fraud.py — Détection de vélocité de transaction suspecte avec PySpark Streaming
"""
from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, window, sum, count
from pyspark.sql.types import StructType, StringType, DoubleType, TimestampType

# 1. Initialiser la session Spark Streaming
spark = SparkSession.builder \
    .appName("BCC-Fraud-Stream-Detector") \
    .config("spark.sql.shuffle.partitions", "4") \
    .getOrCreate()

# Schema de la transaction
schema_tx = StructType() \
    .add("tx_id", StringType()) \
    .add("compte_id", StringType()) \
    .add("montant", DoubleType()) \
    .add("timestamp", TimestampType())

# 2. Lecture du flux Kafka sécurisé
df_kafka = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "10.0.30.10:9093") \
    .option("kafka.security.protocol", "SASL_SSL") \
    .option("subscribe", "bcc-virements") \
    .load()

# 3. Extraction et parsing du JSON
df_tx = df_kafka.select(from_json(col("value").cast("string"), schema_tx).alias("data")).select("data.*")

# 4. Calcul de vélocité sur une Fenêtre Glissante de 10 min (mise à jour toutes les 1 min)
df_velocity = df_tx \
    .groupBy(
        window(col("timestamp"), "10 minutes", "1 minute"),
        col("compte_id")
    ) \
    .agg(
        count("tx_id").alias("nb_tx"),
        sum("montant").alias("total_montant")
    ) \
    .filter(col("nb_tx") >= 5) # Alerte si >= 5 transactions en 10 minutes !

# 5. Affichage des alertes dans la console en temps réel
query = df_velocity.writeStream \
    .outputMode("complete") \
    .format("console") \
    .start()

query.awaitTermination()
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Stream Processing** | Traitement informatique continu des événements au fil de l'eau en temps réel |
| **SASL** | Simple Authentication and Security Layer — Framework d'authentification réseau (SCRAM-SHA-512) |
| **Exactly-Once** | Garantie sémantique qu'un événement sera traité exactement une seule fois sans doublon |
| **RocksDB** | Moteur de stockage clé-valeur haute performance utilisé par Flink pour conserver son état en mémoire |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence fondamentale entre une **Tumbling Window (Fenêtre Fixe)** et une **Sliding Window (Fenêtre Glissante)** dans le traitement de flux d'événements ?

**Corrigé :** Une **Tumbling Window (Fenêtre Fixe)** découpe le temps en intervalles contigus et non chevauchants (ex: 00:00-00:05, 00:05-00:10). Chaque événement appartient à une et une seule fenêtre. Une **Sliding Window (Fenêtre Glissante)** possède une durée (ex: 10 minutes) et un pas de glissement plus court (ex: remis à jour toutes les 1 minute). Les fenêtres se chevauchent, ce qui permet de détecter des comportements suspects en continu (ex: 5 transactions au cours des 10 dernières minutes, réévalué à chaque minute).

**Exercice 2 :** Pourquoi la garantie sémantique **Exactly-Once Processing** est-elle indispensable pour un pipeline de traitement de transactions financières ?

**Corrigé :** Dans un système distribué sujet aux pannes réseau, les événements peuvent être réémis par les producteurs ou les brokers. Si la sémantique est *At-Least-Once* (Au moins une fois), un événement de virement de 1 000 $ réémis suite à un clignotement réseau pourrait être comptabilisé deux fois dans le solde du client (double débit). La garantie **Exactly-Once** s'appuie sur des mécanismes d'instantanés (Checkpoints/Chandy-Lamport) et d'idempotence pour s'assurer que chaque transaction financière impacte l'état du système **exactement une seule fois**.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel moteur de Stream Processing étatiste (Stateful) de référence permet de traiter les événements un par un au fil de l'eau avec une latence inférieure à la milliseconde et une garantie Exactly-Once ?
- A) Apache Flink
- B) MS Paint
- C) Disquette
- D) Lecteur DVD

**Réponse : A**

**Q2 :** Quel protocole et mécanisme d'authentification réseau permet de sécuriser l'accès des applications à un cluster Apache Kafka avec des identifiants hachés en SHA-512 ?
- A) SASL / SCRAM-SHA-512
- B) Telnet
- C) HTTP non sécurisé
- D) POP3

**Réponse : A**

**Q3 :** Quelle fenêtre temporelle de Stream Processing se chevauche et se met à jour à intervalles réguliers (ex: fenêtre de 10 minutes glissant toutes les 1 minute) pour analyser la vélocité des transactions ?
- A) Sliding Window (Fenêtre Glissante)
- B) File de démarrage
- C) Terminal fixe
- D) Dossier ZIP

**Réponse : A**

**Q4 :** Quel composant de stockage clé-valeur embarqué ultra-rapide est utilisé par Apache Flink pour conserver son état (State) en mémoire et sur disque avec tolérance aux pannes ?
- A) RocksDB
- B) Notepad
- C) FAT32
- D) Floppy

**Réponse : A**

**Q5 :** Quel est l'avantage de la sémantique de traitement "Exactly-Once" pour les pipelines de données bancaires ?
- A) Elle garantit que chaque transaction financière est comptabilisée exactement une seule fois, sans omission ni doublon, même en cas de panne réseau
- B) Elle supprime l'électricité
- C) Elle efface les données
- D) Elle accélère la vitesse de frappe au clavier

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
