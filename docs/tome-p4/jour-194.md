# TOME P4 — Cloud, DevOps & SecOps — Jour 194 (6h) : Architectures Big Data Distribuées & Traitement Stream/Batch Avancé (Apache Spark Tuning, Delta Lake ACID, Apache Flink Windowing & Data Lakehouse Architecture)

> [!NOTE]
> **Objectif du jour :** Maîtriser le traitement de données massives (**Big Data**) dans une architecture **Data Lakehouse** : optimisation avancée de **Apache Spark** (Memory Management, Partitioning, Shuffle Service), transactions ACID et Time Travel avec **Delta Lake / Apache Iceberg**, et traitement de flux en temps réel à faible latence avec **Apache Flink** (Windowing, Watermarks, Exactly-Once Processing).
>
> **Compétences visées :** `BIT-05` (A) — Big Data Processing Spark & Flink | `BIT-02` (A) — Data Lakehouse Delta Lake / Iceberg

---

## 1) Module — Apache Spark Tuning & Optimisation des Shuffles (2h)

### 📖 Narration/Intuition

La BCC traite chaque soir l'ensemble des historiques de transactions de tout le pays (des dizaines de terabytes) pour générer les bilans interbancaires. Un job Apache Spark mal configuré peut prendre 12 heures et échouer par un crash d'Out-Of-Memory (OOM). Optimisé correctement, ce même job s'exécute en **20 minutes**.

Le secret de la performance Spark réside dans la maîtrise de l'allocation mémoire et la **minimisation des Shuffles** (la redistribution coûteuse des données entre les nœuds du cluster à travers le réseau).

### 🔍 Anatomie Technique

**Modèle Mémoire d'un Executor Spark :**

```
┌──────────────────────────────────────────────────────────────┐
│                  SPARK EXECUTOR MEMORY (JVM)                 │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 1. RESERVED MEMORY (300 MB fixe pour le système Spark) │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 2. SPARK MEMORY (spark.memory.fraction = 0.6 par défaut)│  │
│  │  ┌──────────────────────────┬───────────────────────┐  │  │
│  │  │ Execution Memory         │ Storage Memory        │  │  │
│  │  │ (Shuffles, Joins, Aggs)  │ (Cached DataFrames,   │  │  │
│  │  │                          │  Broadcast Variables) │  │  │
│  │  └──────────────────────────┴───────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 3. USER MEMORY (0.4) — Objets Java utilisateur, UDFs   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Optimisations Clés pour les Jobs PySpark BCC (`spark_optimization.py`) :**

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import broadcast, col

# Initialisation d'une SparkSession Optimisée
spark = SparkSession.builder \
    .appName("BCC-BigData-Bilan-Journalier") \
    .config("spark.executor.memory", "8g") \
    .config("spark.executor.cores", "4") \
    .config("spark.driver.memory", "4g") \
    .config("spark.sql.shuffle.partitions", "200") \
    .config("spark.sql.adaptive.enabled", "true") \  # Adaptive Query Execution (AQE)
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
    .getOrCreate()

# 1. OPTIMISATION : Broadcast Join
# Évite le Shuffle massif lors de la jointure entre une grande table (Transactions - 50 Go)
# et une petite table de référence (Agences - 10 Mo)
df_transactions = spark.read.parquet("s3a://bcc-datalake/transactions/")
df_agences = spark.read.parquet("s3a://bcc-datalake/agences/")

# Broadcast copie la petite table sur chaque executor -> Zero Shuffle !
df_resultat = df_transactions.join(
    broadcast(df_agences),
    df_transactions.code_agence == df_agences.id
)

# 2. OPTIMISATION : Repartition vs Coalesce
# Utiliser coalesce() pour RÉDUIRE le nombre de partitions sans ré-échanger les données (Zero Shuffle)
df_resultat.coalesce(10).write.mode("overwrite").parquet("s3a://bcc-datalake/bilans/")
```

---

## 2) Module — Delta Lake : Transactions ACID & Time Travel (2h)

### 📖 Narration/Intuition

Un Data Lake classique (fichiers Parquet bruts sur S3) souffre d'inconvénients majeurs : manque de transactions ACID (un job qui crashe laisse des fichiers partiels corrompus), impossibilité d'exécuter des `UPDATE` ou `DELETE` ciblés, et risque de lectures incohérentes si une écriture a lieu simultanément.

**Delta Lake** (ou Apache Iceberg) ajoute une couche de stockage open-source qui apporte les **garanties ACID** au-dessus des fichiers Parquet grâce au **Delta Transaction Log (`_delta_log/`)**.

### 🔍 Anatomie Technique

**Fonctionnement du Delta Transaction Log :**

```
s3://bcc-datalake/transactions/
  ├── _delta_log/
  │    ├── 00000000000000000000.json (Commit 0 : Creation table)
  │    ├── 00000000000000000001.json (Commit 1 : Insert 10,000 rows)
  │    ├── 00000000000000000002.json (Commit 2 : Delete 5 rows - CDC)
  │    └── 00000000000000000002.checkpoint.parquet (Agrégation rapide)
  ├── part-00000-v1.parquet
  ├── part-00001-v1.parquet
  └── part-00002-v2.parquet
```

**Opérations Delta Lake & Time Travel en PySpark (`delta_operations.py`) :**

```python
from delta.tables import DeltaTable

# 1. Écriture ACID au format Delta
df_transactions.write.format("delta").mode("append").save("s3a://bcc-datalake/delta/transactions")

# 2. Opération MERGE (UPSERT) : Mise à jour ou insertion atomique
deltaTable = DeltaTable.forPath(spark, "s3a://bcc-datalake/delta/transactions")

# Données entrantes de correction de solde
deltaTable.alias("target").merge(
    df_corrections.alias("source"),
    "target.transaction_id = source.transaction_id"
).whenMatchedUpdate(set={
    "amount": "source.amount",
    "status": "'CORRIGE'"
}).whenNotMatchedInsert(values={
    "transaction_id": "source.transaction_id",
    "amount": "source.amount",
    "status": "'NOUVEAU'"
}).execute()

# 3. TIME TRAVEL : Interroger les données telles qu'elles étaient hier à 14h00
df_yesterday = spark.read.format("delta") \
    .option("timestampAsOf", "2026-06-16 14:00:00") \
    .load("s3a://bcc-datalake/delta/transactions")
```

---

## 3) Module — Stream Processing avec Apache Flink (2h)

### 📖 Narration/Intuition

Tandis que Spark excelle dans le traitement par lots (Batch) et le Micro-Batching (Structured Streaming), **Apache Flink** est un moteur de traitement d'événements **Event-Driven en temps réel continu** (chaque événement est traité individuellement dès son arrivée avec une latence < 10ms).

### 🛠️ Atelier Pratique

**Calcul de Fenêtre Glissante (Sliding Window) & Watermarks dans Apache Flink (`FlinkFraudDetection.java`) :**

```java
// Application Flink : Détection de Fraude en Temps Réel (> 3 transactions en 1 min)
DataStream<TransactionEvent> stream = env.addSource(new FlinkKafkaConsumer<>("virements", ...));

DataStream<AlertEvent> alerts = stream
    .assignTimestampsAndWatermarks(
        WatermarkStrategy.<TransactionEvent>forBoundedOutOfOrderness(Duration.ofSeconds(5))
            .withTimestampAssigner((event, timestamp) -> event.getTimestamp())
    )
    .keyBy(TransactionEvent::getAccountId)
    .window(TumblingEventTimeWindows.of(Time.minutes(1))) // Fenêtre d'événement de 1 min
    .aggregate(new TransactionCountAggregator());

alerts.addSink(new FlinkKafkaProducer<>("alertes-fraude", ...));
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **AQE** | Adaptive Query Execution — Optimisation dynamique du plan de requête dans Spark |
| **OOM** | Out Of Memory — Erreur d'épuisement de la mémoire JVM |
| **UDF** | User Defined Function — Fonction personnalisée écrite en Python/Java dans Spark |
| **UPSERT** | Update or Insert — Opération de mise à jour si existant, insertion sinon |
| **WORM** | Write Once, Read Many — Modèle de stockage immuable non-modifiable |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre un **Broadcast Join** et un **Shuffle Hash Join** dans Apache Spark, et quand faut-il utiliser le Broadcast Join ?

**Corrigé :** Dans un **Shuffle Hash Join**, Spark redistribue les données des deux tables sur l'ensemble des nœuds du cluster via le réseau afin que les lignes ayant la même clé de jointure se retrouvent sur le même executor. Cette étape de Shuffle est très lente et gourmande en I/O. Dans un **Broadcast Join**, Spark copie l'intégralité d'une des deux tables (la plus petite) sur chaque executor. Chaque nœud peut alors effectuer la jointure localement en mémoire sans aucun échange réseau. Le Broadcast Join doit être privilégié dès qu'une des deux tables est suffisamment petite pour tenir en mémoire (ex: < 100 Mo par défaut dans Spark, configurable via `spark.sql.autoBroadcastJoinThreshold`).

**Exercice 2 :** Comment la fonctionnalité de **Time Travel** de Delta Lake garantit-elle la possibilité de lire les données historiques sans dupliquer inutilement le stockage ?

**Corrigé :** Delta Lake utilise un système de stockage basé sur l'immutabilité des fichiers Parquet et le journal d'opérations **`_delta_log/`**. Lorsqu'une mise à jour (`UPDATE`) ou une suppression (`DELETE`) est effectuée, les anciens fichiers Parquet ne sont pas physiquement supprimés : de nouveaux fichiers contenant les nouvelles données sont créés, et le log de commit indique quels fichiers sont valides à partir de cette version. Pour effectuer une lecture **Time Travel** à une date passée $T$, Delta Lake consulte le journal de commits à cet instant $T$ pour identifier la liste exacte des fichiers Parquet qui composaient la table à ce moment précis, ignorant les fichiers créés ultérieurement. La purge physique des anciens fichiers n'intervient que lors de l'exécution manuelle de la commande `VACUUM`.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle optimisation Spark élimine le besoin de redistribuer les données via le réseau (Shuffle) lors de la jointure entre une grande table et une petite table de référence ?
- A) Broadcast Join
- B) Shuffle Hash Join
- C) Sort Merge Join
- D) Coalesce Join

**Réponse : A**

**Q2 :** Quel composant de Delta Lake garantit la sémantique des transactions ACID et permet la fonctionnalité de Time Travel ?
- A) Le journal de transactions `_delta_log/`
- B) Le moteur HDFS
- C) L'index Hive Metastore
- D) Le fichier Parquet unique

**Réponse : A**

**Q3 :** En quoi le modèle de traitement d'**Apache Flink** diffère-t-il fondamentalement de celui de **Spark Structured Streaming** pour le traitement de flux ?
- A) Flink traite les événements un par un en continu dès leur arrivée (latence < 10ms), tandis que Spark utilise historiquement le Micro-Batching (latence ~100ms-1s)
- B) Flink ne supporte pas Kafka
- C) Spark est uniquement destiné au stockage
- D) Flink s'exécute uniquement sur un seul serveur

**Réponse : A**

**Q4 :** Dans Spark, quelle est la méthode recommandée pour **réduire** le nombre de partitions d'un DataFrame à la fin d'un traitement sans déclencher de Shuffle coûteux ?
- A) `coalesce()`
- B) `repartition()`
- C) `distinct()`
- D) `groupBy()`

**Réponse : A**

**Q5 :** Dans Apache Flink, comment appelle-t-on le mécanisme servant de référence temporelle pour gérer les données qui arrivent en retard (Out-of-order data) ?
- A) Watermarks
- B) Checkpoints
- C) Savepoints
- D) Sliding Windows

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
