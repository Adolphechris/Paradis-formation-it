# TOME P4 — Cloud, DevOps & SecOps — Jour 163 (6h) : Moteurs de Calcul In-Memory Distribués (Apache Spark, DataFrames, Spark SQL & Stream Processing)

> [!NOTE]
> **Objectif du jour :** Maîtriser le traitement de données à ultra-haute vitesse avec Apache Spark : architecture In-Memory (Driver, Executors, RDD vs DataFrames), requêtes analytiques avec **Spark SQL**, traitement de flux en temps réel avec **Structured Streaming**, et optimisation des transformations (Lazy Evaluation, Caching/Persist, Partitioning).
>
> **Compétences visées :** `BIT-05` (A) — Fast Data & Distributed Computing (Spark) | `BIT-04` (A) — Real-Time Stream Processing

---

## 1) Module — Pourquoi Apache Spark ? Architecture In-Memory vs MapReduce (2h)

### 📖 Narration/Intuition

Si Hadoop MapReduce a révolutionné le traitement de données massives, il possède un défaut majeur : entre chaque étape Map et Reduce, il doit obligatoirement **écrire et relire les résultats intermédiaires sur le disque HDFS**, ce qui génère de la latence I/O.

**Apache Spark** est le moteur de calcul distribué de 2ème génération. Il effectue l'intégralité des traitements directement en **mémoire RAM**, ce qui le rend **100 fois plus rapide** que MapReduce pour les algorithmes itératifs et le Machine Learning.

### 🔍 Anatomie Technique

**Architecture Master/Worker d'une Application Apache Spark :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APACHE SPARK CLUSTER ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                   ┌──────────────────────────────────┐                      │
│                   │ DRIVER PROCESS                   │                      │
│                   │ - SparkContext / SparkSession    │                      │
│                   │ - Génération du DAG d'exécution  │                      │
│                   └────────────────┬─────────────────┘                      │
│                                    │ Alloue les tâches (Tasks)              │
│          ┌─────────────────────────┼─────────────────────────┐              │
│          ▼                         ▼                         ▼              │
│ ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐    │
│ │ EXECUTOR 1 (RAM) │      │ EXECUTOR 2 (RAM) │      │ EXECUTOR 3 (RAM) │    │
│ │ - Tasks en cours │      │ - Tasks en cours │      │ - Tasks en cours │    │
│ │ - Cache Mémoire  │      │ - Cache Mémoire  │      │ - Cache Mémoire  │    │
│ └──────────────────┘      └──────────────────┘      └──────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Concept clé : Évaluation Fainéante (Lazy Evaluation)**
Dans Spark, les **Transformations** (`map`, `filter`, `select`, `groupBy`) ne sont pas exécutées immédiatement lorsqu'on tape la commande. Spark construit d'abord un plan d'exécution optimal (un DAG). Le calcul physique n'est réellement déclenché que lorsqu'une **Action** (`count`, `collect`, `show`, `write`) est appelée.

---

## 2) Module — Spark SQL & DataFrames PySpark (2h)

### 📖 Narration/Intuition

Au lieu de manipuler de bas niveau les RDD (Resilient Distributed Datasets), les ingénieurs modernes utilisent les **DataFrames Spark**, une abstraction tabulaire distribuée (similaire aux tables SQL ou aux DataFrames Pandas) optimisée automatiquement par le moteur de compilation **Catalyst Optimizer**.

### 🔍 Anatomie Technique

**Exemple de traitement Spark avec PySpark (`spark_banking_analysis.py`) :**

```python
#!/usr/bin/env python3
"""
spark_banking_analysis.py — Analyse distribuée de transactions bancaires BCC avec PySpark
"""
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, sum, count, avg, to_date

# 1. Initialiser la session Spark distribuée
spark = SparkSession.builder \
    .appName("BCC_Banking_Analytics_Spark") \
    .config("spark.executor.memory", "4g") \
    .config("spark.executor.cores", "2") \
    .getOrCreate()

# 2. Charger 100 millions de transactions depuis des fichiers Parquet sur HDFS (Lazy Evaluation)
df_tx = spark.read.parquet("hdfs://namenode:9000/user/bcc/data/transactions_parquet/")

# 3. Filtrer et transformer avec Spark SQL / DataFrames API
df_filtered = df_tx.filter(col("montant") > 1000.00) \
                   .withColumn("date_jour", to_date(col("timestamp")))

# 4. Agrégation des volumes par agence et par jour
df_summary = df_filtered.groupBy("agence_id", "date_jour") \
                        .agg(
                            sum("montant").alias("total_volume"),
                            count("transaction_id").alias("nombre_tx"),
                            avg("montant").alias("moyenne_tx")
                        ) \
                        .sort(col("total_volume").desc())

# 5. ACTION : Déclencher l'exécution effective et afficher les 20 premiers résultats
df_summary.show(20)

# 6. Écriture des résultats optimisés au format Parquet
df_summary.write.mode("overwrite").parquet("hdfs://namenode:9000/user/bcc/reports/summary_agences/")
```

---

## 3) Module — Stream Processing en temps réel : Spark Structured Streaming (2h)

### 📖 Narration/Intuition

En 2026, la BCC ne veut plus attendre le lendemain matin pour analyser les transactions de la veille. Elle veut analyser les flux en temps réel à mesure que les messages arrivent dans le bus Kafka.

**Spark Structured Streaming** permet de traiter des flux de données continus (Streams) en utilisant la même API DataFrame que pour les données statiques (Batch).

### 🔍 Anatomie Technique

**Traitement de flux en temps réel Kafka ↔ Spark Streaming (`spark_stream_fraud.py`) :**

```python
#!/usr/bin/env python3
"""
spark_stream_fraud.py — Détection de fraudes en temps réel sur flux Kafka avec Spark Structured Streaming
"""
from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, TimestampType

spark = SparkSession.builder \
    .appName("BCC_Realtime_Fraud_Detection") \
    .getOrCreate()

# Schéma du message JSON reçu de Kafka
schema_tx = StructType([
    StructField("transaction_id", StringType()),
    StructField("compte_source", StringType()),
    StructField("montant", DoubleType()),
    StructField("timestamp", TimestampType())
])

# 1. Connexion au flux Kafka en streaming (Read Stream)
df_kafka_stream = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka-broker1.bcc.internal:9092") \
    .option("subscribe", "bcc.rtgs.transactions") \
    .load()

# 2. Décodage du JSON et filtrage des alertes de fraudes (> 1,000,000 CDF)
df_transactions = df_kafka_stream.selectExpr("CAST(value AS STRING) as json_payload") \
    .select(from_json(col("json_payload"), schema_tx).alias("data")) \
    .select("data.*")

df_alertes_fraude = df_transactions.filter(col("montant") > 1000000.00)

# 3. ACTION STREAMING : Écriture continue des alertes dans la console / Dashboard
query = df_alertes_fraude.writeStream \
    .outputMode("append") \
    .format("console") \
    .start()

query.awaitTermination()
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **RDD** | Resilient Distributed Dataset — Abstraction fondamentale de bas niveau des collections distribuées Spark |
| **DAG** | Directed Acyclic Graph — Graphe d'exécution généré par le Driver Spark pour optimiser les tâches |
| **PySpark** | API Python officielle pour l'utilisation du moteur Apache Spark |
| **Parquet** | Format de stockage binaire orienté colonnes hautement compressé et optimisé pour Spark |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre une **Transformation** et une **Action** dans Apache Spark, et pourquoi la **Lazy Evaluation (Évaluation Fainéante)** est-elle un avantage majeur de performance ?

**Corrigé :** Une **Transformation** (`filter`, `select`, `join`) crée un nouveau DataFrame à partir d'un DataFrame existant mais **n'exécute aucun calcul immédiat**. Une **Action** (`count`, `collect`, `show`, `save`) déclenche l'exécution réelle du calcul et renvoie un résultat. L'avantage de la **Lazy Evaluation** est qu'elle permet à l'optimiseur interne de Spark (**Catalyst Optimizer**) de regarder l'ensemble du DAG de transformations avant l'exécution, de fusionner des étapes, de réordonner les filtres (Pushdown Predicates) et d'éliminer les colonnes inutiles, produisant un plan d'exécution physique beaucoup plus rapide qu'une exécution ligne par ligne.

**Exercice 2 :** Pourquoi le format de fichier **Parquet** est-il largement préféré au format **CSV** pour le stockage et la lecture de volumétries massives dans Apache Spark ?

**Corrigé :** Le format **CSV** est un format texte orienté lignes, non compressé, sans schéma de typage strict (tout est du texte à ré-analyser). Le format **Parquet** est un format binaire **orienté colonnes**, hautement compressé (Snappy/Gzip), intégrant directement les métadonnées de typage et les statistiques de blocs (Min/Max). Lors d'une requête Spark SQL, le moteur lit uniquement les colonnes demandées sur disque (Column Projection) et saute des blocs entiers si les statistiques indiquent que la valeur recherchée n'y est pas (Predicate Pushdown), réduisant le temps de lecture de 90%.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la raison principale pour laquelle Apache Spark est jusqu'à 100 fois plus rapide qu'Hadoop MapReduce pour les traitements de données complexes ?
- A) Parce que Spark effectue ses calculs et conservations de données intermédiaires directement en mémoire RAM au lieu d'écrire continuellement sur disque
- B) Parce que Spark n'a pas besoin de réseau
- C) Parce que Spark s'exécute sur des clés USB
- D) Parce qu'il est écrit en JavaScript

**Réponse : A**

**Q2 :** Dans l'architecture Apache Spark, quel composant central exécute le programme principal, construit le DAG d'exécution et distribue les tâches aux serveurs de calcul ?
- A) Le Driver Process (SparkContext / SparkSession)
- B) Le DataNode
- C) Le navigateur web
- D) Le routeur Wi-Fi

**Réponse : A**

**Q3 :** Comment s'appelle le principe selon lequel les transformations Spark ne sont pas exécutées immédiatement mais enregistrées dans un plan d'exécution jusqu'à l'appel d'une Action ?
- A) Lazy Evaluation (Évaluation Fainéante)
- B) Fast Forward
- C) Real-time execution
- D) Direct Commit

**Réponse : A**

**Q4 :** Quel module d'Apache Spark permet de traiter des flux de données continus en temps réel (ex: depuis Kafka) en utilisant l'API DataFrame ?
- A) Spark Structured Streaming
- B) Spark GraphX
- C) Spark Batch
- D) Spark Paint

**Réponse : A**

**Q5 :** Quel format de fichier binaire orienté colonnes hautement compressé est le standard recommandé pour le stockage et l'analyse de données avec Spark ?
- A) Parquet
- B) CSV
- C) TXT
- D) DOCX

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
