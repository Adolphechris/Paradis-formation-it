# TOME P4 — Cloud, DevOps & SecOps — Jour 164 (6h) : Architectures Data Lakehouse, Stockage Objet & Gouvernance (S3/MinIO, Delta Lake, Apache Iceberg & Trino)

> [!NOTE]
> **Objectif du jour :** Déployer et gouverner une architecture **Data Lakehouse** moderne d'entreprise : comparaison Data Lake vs Data Warehouse vs Data Lakehouse, stockage objet S3/MinIO, formats de tables ACID open-source (**Delta Lake**, **Apache Iceberg**), moteur de requêtes distribué interactif (**Trino / Presto**) et gouvernance/sécurisation des accès aux données (RBAC, Data Lineage).
>
> **Compétences visées :** `BIT-05` (A) — Data Lakehouse Architecture & Object Storage | `SEC-05` (A) — Gouvernance & Sécurisation des Data Lakes

---

## 1) Module — L'Évolution Data : Data Warehouse vs Data Lake vs Data Lakehouse (2h)

### 📖 Narration/Intuition

Historiquement, les entreprises stockaient leurs données de reporting dans des **Data Warehouses** relationnels (coûteux, rigides, uniquement pour données structurées). Avec l'explosion du Big Data, les **Data Lakes** basés sur le stockage objet (AWS S3, MinIO) ont permis de stocker des pétaoctets de données brutes structurées et non-structurées à très bas coût, mais sans garanties d'ACID ni de transactions, créant souvent des "Marécages de Données" (Data Swamps).

Le **Data Lakehouse** est la fusion moderne : il apporte les garanties transactionnelles ACID, la gouvernance et les performances d'un Data Warehouse directement au-dessus du stockage objet économique d'un Data Lake.

### 🔍 Anatomie Technique

**Comparaison des Architectures de Données :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 DATA WAREHOUSE vs DATA LAKE vs DATA LAKEHOUSE               │
├──────────────┬──────────────────────────────────────────────────────────────┤
│ Architecture │ Data Warehouse (Snowflake / Teradata / Oracle Exadata)        │
│              │ - Coût élevé. Schéma à l'écriture (Schema-on-Write).        │
│              │ - Données uniquement structurées SQL.                        │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Architecture │ Data Lake (HDFS / AWS S3 / MinIO)                            │
│              │ - Coût très faible. Schéma à la lecture (Schema-on-Read).   │
│              │ - Pas de transactions ACID, risque de corruption des données. │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Architecture │ DATA LAKEHOUSE (S3/MinIO + Delta Lake / Iceberg + Trino)     │
│              │ - Coût faible du stockage objet + Transactions ACID.         │
│              │ - Time Travel (Historique des versions), Schema Enforcement.  │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Storage Layers ACID : Delta Lake & Apache Iceberg (2h)

### 📖 Narration/Intuition

Comment ajouter des transactions ACID (possibilité d'effectuer des `UPDATE`, `DELETE`, `MERGE` et du Time Travel) au-dessus de simples fichiers Parquet stockés dans un bucket S3 ?

C'est la magie de la couche **Delta Lake** (ou Apache Iceberg). Delta Lake conserve à côté des fichiers Parquet un journal des transactions au format JSON (`_delta_log/`). Chaque modification génère une nouvelle version du fichier sans effacer l'ancienne, permettant de remonter le temps (**Time Travel**) et d'exécuter des opérations `UPSERT` sans verrouiller les lecteurs.

### 🔍 Anatomie Technique

**Opération `MERGE INTO` (Upsert ACID) avec Delta Lake PySpark :**

```python
#!/usr/bin/env python3
"""
delta_lake_upsert.py — Opération ACID Upsert (Merge) sur Data Lakehouse BCC
"""
from pyspark.sql import SparkSession
from delta.tables import DeltaTable

# Initialiser Spark avec le support Delta Lake
spark = SparkSession.builder \
    .appName("BCC_Lakehouse_Delta") \
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension") \
    .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog") \
    .getOrCreate()

# 1. Charger la table Delta existante dans S3/MinIO
delta_table_path = "s3a://bcc-lakehouse-prod/gold/comptes_clients/"
deltaTable = DeltaTable.forPath(spark, delta_table_path)

# 2. Nouvelles données entrantes (Updates & Inserts)
updates_df = spark.read.json("s3a://bcc-lakehouse-prod/incoming_updates.json")

# 3. MERGE ACID (Mettre à jour les comptes existants, insérer les nouveaux)
deltaTable.alias("target").merge(
    updates_df.alias("updates"),
    "target.compte_id = updates.compte_id"
).whenMatchedUpdate(set={
    "solde": "updates.solde",
    "statut": "updates.statut",
    "updated_at": "updates.timestamp"
}).whenNotMatchedInsert(values={
    "compte_id": "updates.compte_id",
    "solde": "updates.solde",
    "statut": "updates.statut",
    "created_at": "updates.timestamp"
}).execute()

print("✅ Fusion ACID (Merge) terminée avec succès dans le Data Lakehouse.")
```

---

## 3) Module — Moteurs de Requêtes SQL Interactifs (Trino) & Gouvernance (2h)

### 📖 Narration/Intuition

Pour interroger en SQL classique à la vitesse de l'éclair des pétaoctets de données répartis entre MinIO (Delta Lake), PostgreSQL et MongoDB en une seule requête unifiée, on utilise le moteur **Trino** (anciennement PrestoSQL).

### 🔍 Anatomie Technique

**Requête SQL Fédérée Trino joignant SGBDR PostgreSQL et Data Lakehouse MinIO :**

```sql
-- Requête Fédérée Trino unifiant deux sources de données distinctes !
SELECT 
    c.client_id,
    c.nom,
    c.email,
    l.total_volume_transactions,
    l.statut_compte
FROM postgresql.public.clients c  -- Base PostgreSQL transactionnelle
JOIN delta_minio.gold.comptes_summary l -- Table Delta Lakehouse sur MinIO
  ON c.client_id = l.client_id
WHERE l.total_volume_transactions > 500000.00;
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Data Lakehouse** | Architecture hybride combinant stockage objet Data Lake et transactions ACID |
| **S3** | Simple Storage Service — Protocole et service de stockage objet distribué par blocs |
| **MinIO** | Serveur de stockage objet open-source haute performance compatible avec l'API AWS S3 |
| **Trino** | Moteur de requêtes SQL distribué hautement performant pour l'analytique et la fédération |
| **Time Travel** | Fonctionnalité permettant d'interroger un Data Lakehouse à une version antérieure dans le temps |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Qu'est-ce que la fonctionnalité de **Time Travel** dans un Data Lakehouse Delta Lake / Apache Iceberg, et quel est son cas d'usage en audit bancaire ?

**Corrigé :** Le **Time Travel** permet d'interroger la table Lakehouse dans l'état exact où elle se trouvait à une date ou une version spécifique dans le passé (ex: `SELECT * FROM comptes VERSION AS OF 42;` ou `TIMESTAMP AS OF '2026-08-01 12:00:00'`). En audit bancaire, cela permet de reconstituer l'état exact de la comptabilité ou des soldes clients à la seconde près lors d'un audit de régulation ou lors de l'investigation d'un incident de sécurité, sans avoir à restaurer une sauvegarde lourde sur un autre serveur.

**Exercice 2 :** Pourquoi l'utilisation de **MinIO** est-elle recommandée pour déployer un Data Lakehouse souverain on-premise dans les datacenters d'une banque centrale ?

**Corrigé :** **MinIO** est une solution open-source de stockage objet 100% compatible avec l'API AWS S3. Elle peut être installée directement sur l'infrastructure matérielle ou Kubernetes privée de la banque (Datacenters de Kinshasa et Lubumbashi), garantissant une **souveraineté absolue des données** (aucune donnée ne quitte le territoire national vers un cloud public étranger) tout en permettant d'utiliser l'ensemble des outils modernes du Big Data (Spark, Trino, Delta Lake) conçus pour l'API S3.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle architecture de stockage moderne combine le faible coût et la capacité du stockage objet Data Lake avec les transactions ACID et la gouvernance d'un Data Warehouse ?
- A) Data Lakehouse
- B) Serveur FTP
- C) Fichier Excel
- D) Base Access

**Réponse : A**

**Q2 :** Quel serveur de stockage objet open-source haute performance s'installe on-premise avec une compatibilité 100% API AWS S3 ?
- A) MinIO
- B) Word
- C) Paint
- D) Skype

**Réponse : A**

**Q3 :** Quelle fonctionnalité des formats de table moderne (Delta Lake / Apache Iceberg) permet d'interroger les données telles qu'elles étaient à une date passée ?
- A) Time Travel (Voyage dans le temps)
- B) Fast Forward
- C) Delete All
- D) Format Disk

**Réponse : A**

**Q4 :** Quel moteur de requêtes SQL distribué open-source (anciennement PrestoSQL) permet d'exécuter des requêtes fédérées joignant simultanément du PostgreSQL, du MongoDB et du S3 Delta Lake ?
- A) Trino
- B) Notepad
- C) Docker
- D) Git

**Réponse : A**

**Q5 :** Quel est le format de fichier sous-jacent utilisé par Delta Lake pour stocker les données réelles de manière hautement compressée sous le journal des transactions JSON ?
- A) Parquet
- B) TXT
- C) HTML
- D) EXE

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
