# TOME P4 — Cloud, DevOps & SecOps — Jour 195 (6h) : Projet Intégrateur Semestre 4 — Partie 6 : Pipeline Data & Streaming Analytics BCC (Spark, Delta Lake, Flink, Kafka & Data Mesh)

> [!NOTE]
> **Objectif du jour :** Synthetiser les concepts du bloc Data Engineering & Big Data (J151-J170 & J191-J194) dans une **architecture Data Lakehouse & Streaming Analytics d'entreprise** complète pour la BCC : ingestion d'événements bancaires en temps réel, calculs analytiques ACID, détection de fraude et gouvernance par le paradigme **Data Mesh**.
>
> **Compétences visées :** `BIT-02` (A), `BIT-05` (A), `BIT-07` (A) — Architecture Data Lakehouse & Streaming Enterprise BCC

---

## 1) Module — Architecture Data Lakehouse BCC (2h)

### 📖 Narration/Intuition

La BCC doit traiter des millions de transactions bancaires quotidiennes provenant de dizaines de banques commerciales. Elle a besoin d'une plateforme capable de :
1. Ingérer les flux de virements en temps réel (< 100ms) pour la détection de fraude.
2. Garantir la consistance ACID des historiques financiers.
3. Permettre aux analystes et régulateurs de requêter des données fraîches et historiques via du SQL standard.

C'est l'architecture **Data Lakehouse (Medallion Architecture : Bronze, Silver, Gold)**.

### 🔍 Anatomie Technique

**Architecture Medallion Data Lakehouse BCC :**

```
SOURCES DE DONNÉES                                       INGESTION & STREAMING
┌──────────────────┐                                     ┌──────────────────┐
│ APIs Core Bank   │─── (CDC Debezium) ─────────────────►│ Apache Kafka /   │
│ PostgreSQL       │                                     │ Apache Pulsar    │
└──────────────────┘                                     └────────┬─────────┘
                                                                  │
                                                                  ▼
BRONZE LAYER (Données Brutes Ingestées)                  ┌──────────────────┐
┌─────────────────────────────────────────────────────┐  │ Apache Flink     │
│ S3 / Delta Lake : bcc-datalake/bronze/transactions/ │◄─┤ (Streaming Real- │
│ - Stockage JSON/Avro brut immuable                  │  │  Time Analytics) │
│ - Historique complet sans altération                │  └──────────────────┘
└──────────────────────────┬──────────────────────────┘
                           │ (Spark Structured Streaming / Delta Engine)
                           ▼
SILVER LAYER (Données Nettoyées & Enrichies)
┌─────────────────────────────────────────────────────┐
│ S3 / Delta Lake : bcc-datalake/silver/transactions/ │
│ - Déduplication & Validation des schémas            │
│ - Anonymisation RGPD des identifiants               │
│ - Structure relationnelle propre (Parquet + Log)    │
└──────────────────────────┬──────────────────────────┘
                           │ (Spark Batch / Aggregations)
                           ▼
GOLD LAYER (Cubes Analytiques & Data Marts)
┌─────────────────────────────────────────────────────┐
│ S3 / Delta Lake / ClickHouse : gold/bilan_agences/   │
│ - Tables agrégées pour la BI et les régulateurs     │
│ - Optimisées pour les requêtes Trino/Superset < 1s  │
└─────────────────────────────────────────────────────┘
```

---

## 2) Module — Pipeline PySpark & Delta Lake (2h)

### 📖 Narration/Intuition

Implémentons la transformation et la promotion automatique des données de la couche Bronze à la couche Silver dans notre Data Lakehouse bancaire avec **PySpark** et **Delta Lake**.

### 🔍 Anatomie Technique

**Pipeline PySpark Bronze ──► Silver (`bronze_to_silver.py`) :**

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, from_json, current_timestamp, sha2
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, TimestampType

# Initialisation SparkSession avec support Delta Lake
spark = SparkSession.builder \
    .appName("BCC-BronzeToSilver-Pipeline") \
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension") \
    .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog") \
    .getOrCreate()

# Schéma strict des événements de virement
virement_schema = StructType([
    StructField("transaction_id", StringType(), False),
    StructField("account_source", StringType(), False),
    StructField("account_target", StringType(), False),
    StructField("amount", DoubleType(), False),
    StructField("timestamp", StringType(), False)
])

# 1. Lecture en Streaming depuis la couche BRONZE Delta Lake
df_bronze = spark.readStream \
    .format("delta") \
    .load("s3a://bcc-datalake/bronze/transactions")

# 2. Nettoyage, Anonymisation & Validation (Couche SILVER)
df_silver = df_bronze \
    .select(from_json(col("raw_payload"), virement_schema).alias("data")) \
    .select("data.*") \
    .filter(col("amount") > 0) \
    .withColumn("account_source_hash", sha2(col("account_source"), 256)) \
    .withColumn("account_target_hash", sha2(col("account_target"), 256)) \
    .withColumn("ingested_at", current_timestamp()) \
    .drop("account_source", "account_target") # Anonymisation RGPD

# 3. Écriture en Streaming ACID vers la couche SILVER Delta Lake
query = df_silver.writeStream \
    .format("delta") \
    .outputMode("append") \
    .option("checkpointLocation", "s3a://bcc-datalake/checkpoints/silver_tx") \
    .start("s3a://bcc-datalake/silver/transactions")

query.awaitTermination()
```

---

## 3) Module — Data Mesh & Gouvernance (2h)

### 📖 Narration/Intuition

Le modèle de **Data Mesh** remplace le Data Lake centralisé monopolistique par une architecture décentralisée fondée sur 4 principes :
1. **Domaine de données (Domain-Oriented Ownership)** : Chaque équipe métier possède ses données sous forme de produit.
2. **Data as a Product** : Les données sont traitées comme un produit avec des SLAs et une qualité garantie.
3. **Plateforme Data en Self-Service** : L'infrastructure est fournie sous forme de plateforme automatisée.
4. **Gouvernance Fédérée** : Standardisation globale de l'interopérabilité et de la sécurité (OpenLineage, Great Expectations).

### 🛠️ Atelier Pratique

**Validation de Qualité des Données avec Great Expectations (`data_quality.py`) :**

```python
import great_expectations as ge

# Validation du Data Product "Virements Silver" avant publication
df_ge = ge.dataset.SparkDFDataset(df_silver)

# Règles d'attentes (Expectations)
df_ge.expect_column_values_to_not_be_null("transaction_id")
df_ge.expect_column_values_to_be_between("amount", min_value=0.01, max_value=1000000.0)
df_ge.expect_column_values_to_match_regex("account_source_hash", r"^[a-f0-9]{64}$")

validation_result = df_ge.validate()

if not validation_result["success"]:
    raise Exception(f"❌ DATA_QUALITY_FAILURE: Le produit de données ne respecte pas le contrat d'interface ! {validation_result}")
else:
    print("✅ DATA_QUALITY_PASSED: Produit de données validé pour publication Data Mesh.")
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Medallion** | Architecture Data Lakehouse structurée en 3 niveaux : Bronze, Silver, Gold |
| **Data Mesh** | Architecture décentralisée organisant les données par produits de domaines métier |
| **SLA** | Service Level Agreement — Engagement de qualité et disponibilité sur un produit de données |
| **OLTP** | Online Transaction Processing — Traitement des transactions opérationnelles en BDD |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la fonction respective de chacune des 3 couches (Bronze, Silver, Gold) dans l'architecture Medallion d'un Data Lakehouse ?

**Corrigé :** (1) **Bronze Layer (Raw)** : Stocke les données brutes telles qu'elles sont ingérées des systèmes sources (CDC, APIs, logs), conservant l'historique complet sans aucune altération ni nettoyage. (2) **Silver Layer (Cleansed/Enriched)** : Données filtrées, dédupliquées, nettoyées, dont le schéma a été validé et les données personnelles anonymisées (RGPD). C'est la source de vérité d'entreprise pour les ingénieurs de données. (3) **Gold Layer (Curated/Business)** : Agrégations métier et datamarts optimisés pour la consommation finale par la Business Intelligence (PowerBI, Superset) et les décideurs.

**Exercice 2 :** Comment le principe de **Data as a Product** dans le Data Mesh transforme-t-il la relation entre les équipes métier et les consommateurs de données ?

**Corrigé :** Traditionnellement, les équipes métier considéraient la donnée comme un sous-produit technique d'arrière-plan, laissant à une équipe Data centrale le soin de deviner et nettoyer les données. Avec le principe **Data as a Product**, chaque équipe de domaine (ex: Équipe Virements) est responsable de ses données de bout en bout et les publie comme un **produit fini** assorti de : (1) Contrats de schéma d'interface explicites, (2) SLAs de fraîcheur et de qualité garantis, (3) Documentation et identifiants uniques, (4) Support et cycle de vie. Les autres équipes consomment ce produit en self-service sans avoir à retravailler les données brutes.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans l'architecture Medallion d'un Data Lakehouse, quelle couche contient les données brutes non-altérées directement ingérées des sources ?
- A) Bronze Layer
- B) Silver Layer
- C) Gold Layer
- D) Platinum Layer

**Réponse : A**

**Q2 :** Quel est le principe central du **Data Mesh** concernant l'organisation des équipes et de la responsabilité des données ?
- A) La responsabilité de la donnée est décentralisée et confiée aux équipes du domaine métier (Domain Ownership) qui la publient sous forme de "Data Product"
- B) Une seule équipe centrale gère toutes les bases de données de l'entreprise
- C) Les bases de données sont supprimées au profit de fichiers Excel
- D) Les données sont stockées uniquement sur les postes de travail

**Réponse : A**

**Q3 :** Dans un pipeline PySpark Structured Streaming écrivant vers Delta Lake, à quoi sert l'option `checkpointLocation` ?
- A) À enregistrer l'état d'avancement du flux (offsets Kafka/Delta) pour permettre la reprise exacte au point de panne (Fault Tolerance & Exactly-Once)
- B) À accélérer le chiffrement du disque
- C) À supprimer automatiquement les anciens fichiers Parquet
- D) À compresser les logs système

**Réponse : A**

**Q4 :** Quel outil open-source est utilisé dans l'atelier pour valider automatiquement la qualité et les contraintes d'un dataset (Expectations) avant sa publication dans la couche Silver/Gold ?
- A) Great Expectations
- B) Apache Airflow
- C) Docker
- D) Prometheus

**Réponse : A**

**Q5 :** Pourquoi applique-t-on des fonctions de hachage cryptographique (ex: `sha2`) aux colonnes `account_source` lors de la promotion en couche Silver ?
- A) Pour respecter les exigences de minimisation et d'anonymisation du RGPD tout en conservant la capacité de joindre les transactions par hash
- B) Pour compresser la taille des fichiers Parquet
- C) Pour accélérer les requêtes SQL
- D) Pour convertir les textes en nombres entiers

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
