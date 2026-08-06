# TOME P4 — Cloud, DevOps & SecOps — Jour 170 (6h) : Projet Intégrateur Semestre 4 (Partie 2) — Déploiement d'une Architecture Big Data, Streaming & Analytics Complète (BCC Real-Time Analytics Platform)

> [!NOTE]
> **Objectif du jour :** Intégrer l'ensemble des technologies de Big Data, Stream Processing et Business Intelligence abordées du Jour 161 au Jour 169 dans un grand projet d'architecture : déploiement et validation de la plateforme analytique temps réel de la Banque Centrale du Congo (BCC Real-Time Analytics Platform), interconnectant Apache Kafka, Apache Spark / Flink, Delta Lake sur MinIO, Trino et Metabase BI avec sécurité avancée et tests de tolérance aux pannes.
>
> **Compétences visées :** `PRO-01` (A) — Real-Time Data Architecture Capstone | `BIT-05` (A) — Master Integration Big Data & Streaming | `SEC-05` (A) — Sécurisation des Bus & Pipelines d'Entreprise

---

## 1) Module — Master Architecture BCC Real-Time Analytics (2h)

### 📖 Narration/Intuition

Vous êtes chargé de présenter au Comité de Direction de la Banque Centrale du Congo l'architecture unifiée d'analyse des risques et de détection des fraudes en temps réel à l'échelle nationale.

Cette plateforme traite les flux de paiements en temps réel via **Kafka**, détecte les fraudes sous les 10ms avec **Kafka Streams**, consolide les données historiques dans un **Data Lakehouse MinIO / Delta Lake** via **Spark**, et restitue les tableaux de bord décisionnels aux exécutifs via **Metabase** et **Trino**.

### 🔍 Anatomie Technique

**Master Diagramme d'Architecture BCC Real-Time Analytics Platform :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│             BCC REAL-TIME ANALYTICS PLATFORM — FULL PIPELINE                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ [ CORE BANKING SYSTEMS ]                                                    │
│         │                                                                   │
│         ▼ Événements JSON (Virements / RTGS)                                │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ APACHE KAFKA CLUSTER (TLS 1.3 / SASL SCRAM-512)                         │ │
│ │ - Topic: bcc.rtgs.transactions (3 Partitions)                           │ │
│ └───────┬─────────────────────────────────┬───────────────────────────────┘ │
│         │                                 │                                 │
│         ▼ Real-Time Alert (< 10ms)        ▼ Ingestion Continu             │
│ ┌──────────────────────┐       ┌──────────────────────────────────┐         │
│ │ KAFKA STREAMS (JAVA) │       │ APACHE SPARK STRUCTURED STREAMING│         │
│ │ - Sliding Window 60s │       │ - Batch Ingestion & Clean        │         │
│ │ - Alertes Fraudes    │       └──────────────────┬───────────────┘         │
│ └──────────┬───────────┘                          │                         │
│            │                                      ▼ Écriture Delta ACID     │
│            │                           ┌──────────────────────────────────┐ │
│            │                           │ MINIO S3 LAKEHOUSE (DELTA LAKE)  │ │
│            │                           │ - Raw / Silver / Gold Layers     │ │
│            │                           └──────────────────┬───────────────┘ │
│            │                                              │                 │
│            ▼                                              ▼                 │
│ ┌──────────────────────┐                       ┌──────────────────┐         │
│ │ TOPIC ALERTES FRAUDE │                       │ TRINO SQL ENGINE │         │
│ └──────────────────────┘                       └──────────┬───────┘         │
│                                                           │                 │
│                                                           ▼                 │
│                                                ┌──────────────────┐         │
│                                                │ METABASE BI      │         │
│                                                │ - Executive Dash │         │
│                                                └──────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Implémentation du Pipeline & Script d'Ingestion (2h)

### 📖 Narration/Intuition

Déployons le script d'ingestion et de transformation Spark Structured Streaming qui consomme les données Kafka et les écrit dans le Data Lakehouse MinIO au format Delta Lake avec garanties transactionnelles ACID.

### 🔍 Anatomie Technique

**Script d'ingestion Spark Streaming vers MinIO Delta Lake (`spark_kafka_to_delta.py`) :**

```python
#!/usr/bin/env python3
"""
spark_kafka_to_delta.py — Pipeline d'ingestion streaming Kafka -> MinIO Delta Lake
"""
from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, current_timestamp
from pyspark.sql.types import StructType, StructField, StringType, DoubleType

# Initialiser Spark avec le connecteur Kafka et Delta Lake MinIO
spark = SparkSession.builder \
    .appName("BCC_Kafka_To_Delta_Ingestion") \
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension") \
    .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog") \
    .config("spark.hadoop.fs.s3a.endpoint", "http://minio-server.bcc.internal:9000") \
    .config("spark.hadoop.fs.s3a.access.key", "bcc_minio_admin") \
    .config("spark.hadoop.fs.s3a.secret.key", "SuperSecretMinioPass2026!") \
    .config("spark.hadoop.fs.s3a.path.style.access", "true") \
    .getOrCreate()

schema = StructType([
    StructField("transaction_id", StringType()),
    StructField("compte_source", StringType()),
    StructField("compte_destination", StringType()),
    StructField("montant", DoubleType()),
    StructField("devise", StringType())
])

# 1. Lecture du flux Kafka
kafka_df = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka-broker1.bcc.internal:9092") \
    .option("subscribe", "bcc.rtgs.transactions") \
    .load()

# 2. Parsing du JSON
parsed_df = kafka_df.selectExpr("CAST(value AS STRING) as json_val") \
    .select(from_json(col("json_val"), schema).alias("data")) \
    .select("data.*") \
    .withColumn("ingested_at", current_timestamp())

# 3. Écriture continue dans MinIO S3 au format Delta Lake avec Checkpoint
query = parsed_df.writeStream \
    .format("delta") \
    .outputMode("append") \
    .option("checkpointLocation", "s3a://bcc-lakehouse/checkpoints/rtgs_tx/") \
    .start("s3a://bcc-lakehouse/gold/rtgs_transactions_delta/")

query.awaitTermination()
```

---

## 3) Module — Validation de l'Architecture & Cahier de Recette Partie 2 (2h)

### 📖 Narration/Intuition

Validons par un cahier de recette rigoureux la performance, la tolérance aux pannes et le respect des SLAs de la plateforme analytique temps réel.

### 🔍 Anatomie Technique

**Cahier de Recette & Validation des Tests d'Acceptation (Partie 2) :**

| ID Test | Composant | Scénario de Test | Résultat Attendu | Statut |
|:---:|:---|:---|:---|:---:|
| **TC-06** | Kafka / Security | Connexion d'un client anonyme sans certificat TLS | Connexion immédiatement rejetée par le Broker Kafka | **PASS** |
| **TC-07** | Kafka Streams | Émission de 4 retraits > 500k CDF en 30 secondes | Alerte de fraude émise sur `bcc.security.alerts` en < 10ms | **PASS** |
| **TC-08** | Spark / Delta | Coupure de courant pendant l'écriture dans MinIO | Aucune donnée corrompue grâce au Rollback ACID Delta | **PASS** |
| **TC-09** | Trino SQL | Exécution d'une requête analytique sur 50M de lignes | Résultats retournés sur Metabase en < 1.2 seconde | **PASS** |
| **TC-10** | Time Travel | Interrogation de la table Delta à sa version d'hier | Les données d'hier sont restituées sans altérer aujourd'hui | **PASS** |

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Checkpoint** | Mécanisme de tolérance aux pannes enregistrant l'état exact de lecture dans Spark Streaming |
| **SLA** | Service Level Agreement — Engagement contractuel de niveau de service et de disponibilité |
| **Delta Table** | Table de stockage objet au format Parquet dotée d'un journal de transactions ACID |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Dans un pipeline Spark Structured Streaming écrivant dans MinIO Delta Lake, quel est le rôle fondamental du **Checkpoint Location (`checkpointLocation`)** en cas d'extinction accidentelle du serveur Spark ?

**Corrigé :** Le **Checkpoint Location** enregistre de manière permanente dans un dossier de stockage fiable (S3/MinIO) l'identifiant exact de l'offset Kafka qui a été traité et écrit avec succès dans la table Delta Lake. Si le serveur Spark s'éteint ou crashe, au redémarrage, le job Spark lit le fichier de checkpoint, découvre exactement où il s'était arrêté, et reprend la lecture du flux Kafka à partir du dernier offset validé. Cela garantit qu'**aucun message n'est perdu et aucun doublon n'est généré** (Traitement Exactly-Once).

**Exercice 2 :** Pourquoi la combinaison de **Kafka Streams** (pour les alertes < 10ms) et de **Spark / Delta Lake / Trino** (pour le stockage et le reporting BI) répond-elle parfaitement aux exigences d'une banque centrale ?

**Corrigé :** Une banque centrale a deux besoins complémentaires aux exigences temporelles différentes :
1. **Un besoin d'action immédiate (Temps Réel Critique)** : Bloquer une fraude ou lever une alerte sur le réseau de paiements nécessite un traitement en millisecondes. **Kafka Streams** s'exécute en mémoire au plus près du flux et répond à cette exigence (< 10ms).
2. **Un besoin de stockage et d'analyse massive (Temps Différé / BI)** : Analyser les tendances financières sur 5 ans ou fournir des tableaux de bord financiers ne nécessite pas une latence de 10ms mais exige la capacité de traiter des pétaoctets sans crash. **Spark + Delta Lake + Trino** répond à ce besoin en offrant du stockage objet économique et des requêtes SQL distribuées sur des milliards de lignes.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans l'architecture BCC Real-Time Analytics, quel composant est responsable de l'émission d'une alerte de fraude en moins de 10 millisecondes sur le flux de paiements ?
- A) Kafka Streams (Java)
- B) Excel
- C) Une impression papier
- D) Un envoi de courrier

**Réponse : A**

**Q2 :** Quel est le rôle de l'option `checkpointLocation` lors de l'écriture en streaming avec Spark Structured Streaming ?
- A) Conserver l'état de progression des offsets Kafka pour reprendre le traitement exactement là où il s'était arrêté en cas de crash (Tolérance aux pannes)
- B) Supprimer les fichiers
- C) Formater le serveur
- D) Fermer le port réseau

**Réponse : A**

**Q3 :** Dans la plateforme BCC, quel moteur SQL interactif permet d'interroger directement les données Delta Lake stockées dans MinIO pour alimenter les tableaux de bord Metabase ?
- A) Trino
- B) Notepad
- C) Calculator
- D) MS Paint

**Réponse : A**

**Q4 :** Quel protocole de sécurité est utilisé pour garantir que le trafic de messages circulant sur le cluster Kafka est totalement chiffré en transit ?
- A) TLS 1.3
- B) HTTP non chiffré
- C) Telnet
- D) FTP anonyme

**Réponse : A**

**Q5 :** Quel est l'avantage clé de l'utilisation du format Delta Lake au-dessus du stockage objet MinIO S3 par rapport à des fichiers Parquet bruts ?
- A) Il apporte les garanties transactionnelles ACID, le support des opérations UPSERT (`MERGE`) et le Time Travel
- B) Il rend les fichiers invisibles
- C) Il réduit la vitesse du réseau
- D) Il supprime les colonnes

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
