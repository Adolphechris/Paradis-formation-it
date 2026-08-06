# TOME P2 — Réseaux & Télécoms — Jour 96 (6h) : Architectures de Données Analytiques & Sécurité Big Data (Hadoop, Spark & Data Governance)

> [!NOTE]
> **Objectif du jour :** Comprendre les architectures Big Data et Data Lakes pour le traitement analytique de volumes massifs de transactions bancaires (terabytes/petabytes) : écosystème Hadoop (HDFS, YARN), calcul distribué avec Apache Spark, chiffrement des données et gouvernance des accès avec Apache Ranger et Apache Atlas.
>
> **Compétences visées :** `BIT-06` (A) — Architectures Big Data & Data Lakes | `SEC-03` (A) — Sécurité & Gouvernance des Données Massives

---

## 1) Module — Fondamentaux du Big Data & Écosystème Hadoop (2h)

### 📖 Narration/Intuition

La Banque Centrale du Congo enregistre chaque jour des dizaines de millions de transactions, de journaux réseau et d'événements d'audit. Une base de données relationnelle classique (PostgreSQL, MySQL) atteint ses limites de stockage et de vitesse de traitement face à ces volumes massifs.

L'**architecture Big Data** s'appuie sur le calcul et le stockage distribués sur des grappes (clusters) de serveurs standards. **HDFS (Hadoop Distributed File System)** découpe les fichiers volumineux en blocs et les répartit sur plusieurs serveurs avec réplication, tandis que **YARN** gère l'allocation des ressources de calcul du cluster.

### 🔍 Anatomie Technique

**Architecture d'un Cluster Hadoop HDFS :**

```
┌─────────────────────────────────────────────────────────────┐
│                    NAME NODE (Master)                       │
│  - Gère la métadonnée (arborescence des fichiers)           │
│  - Cartographie des blocs vers les Data Nodes               │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
    ┌──────────▼──────────┐        ┌──────────▼──────────┐
    │ DATA NODE 1 (Worker)│        │ DATA NODE 2 (Worker)│
    │  - Bloc 1 (BCC_Tx)  │        │  - Bloc 1 (Réplica) │
    │  - Bloc 2 (BCC_Tx)  │        │  - Bloc 3 (BCC_Tx)  │
    └─────────────────────┘        └─────────────────────┘
```

---

## 2) Module — Calcul Distribué avec Apache Spark (2h)

### 📖 Narration/Intuition

Là où l'ancien modèle MapReduce écrivait chaque étape intermédiaire sur disque, **Apache Spark** effectue le traitement distribué en mémoire vive (In-Memory Computing). Il est 100 fois plus rapide que MapReduce pour le traitement des données bancaires massives et les calculs statistiques (ex: détection de blanchiment d'argent sur 10 ans d'historique).

### 🔍 Anatomie Technique

**Script PySpark d'analyse massive de transactions (`spark_banking_analysis.py`) :**

```python
#!/usr/bin/env python3
"""
spark_banking_analysis.py — Calcul distribué avec Apache Spark (PySpark)
"""
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, sum, count, avg

# 1. Initialiser la session Spark distribuée
spark = SparkSession.builder \
    .appName("BCC-Massive-Transaction-Analysis") \
    .config("spark.executor.memory", "4g") \
    .config("spark.driver.memory", "2g") \
    .getOrCreate()

print("[+] Cluster Spark connecté. Chargement du Data Lake HDFS...")

# 2. Charger un fichier de transactions de 50 GB (Format Parquet optimisé)
# En production: path = "hdfs://namenode:9000/data/transactions.parquet"
df_transactions = spark.read.parquet("/tmp/transactions_sample.parquet")

# 3. Traitement distribué des données (DataFrame API)
print("[+] Calcul des agrégations financières par agence...")
df_resultats = df_transactions \
    .filter(col("statut") == "VALIDE") \
    .groupBy("code_agence") \
    .agg(
        count("tx_id").alias("nb_total_transactions"),
        sum("montant").alias("volume_total_cdf"),
        avg("montant").alias("montant_moyen_cdf")
    ) \
    .orderBy(col("volume_total_cdf").desc())

# 4. Afficher le résultat du calcul distribué
df_resultats.show(10)

# 5. Arrêt de la session Spark
spark.stop()
```

---

## 3) Module — Sécurité & Gouvernance du Data Lake (Apache Ranger & Atlas) (2h)

### 📖 Narration/Intuition

Un Data Lake bancaire sans gouvernance devient un "Data Swamp" (marécage de données) extrêmement dangereux sur le plan de la sécurité. Si toutes les données sont centralisées au même endroit, comment empêcher un analyste junior d'accéder au numéro de compte du Gouverneur de la Banque Centrale ?

**Apache Ranger** fournit un contrôle d'accès centralisé et granulaire (RBAC/ABAC au niveau de la ligne et de la colonne) sur l'ensemble de l'écosystème Big Data. **Apache Atlas** gère la gouvernance, le catalogue de données et la traçabilité de l'origine des données (Data Lineage).

### 🔍 Anatomie Technique

**Composants de Sécurité Big Data :**

```
- Authentification Kerberos : Authentification forte mutuelle obligatoire de tous les utilisateurs et serveurs du cluster Big Data.
- Chiffrement HDFS (Transparent Data Encryption - TDE) : Zones de chiffrement (Encryption Zones) sur disque pour protéger les fichiers au repos.
- Apache Ranger : Définition de politiques de sécurité (ex: Masquer la colonne 'numero_carte' pour le groupe 'analystes').
- Anonymisation & Data Masking : Remplacer à la volée les données identifiantes par des valeurs hachées ou masquées (ex: XXXX-XXXX-XXXX-1234).
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **HDFS** | Hadoop Distributed File System — Système de fichiers distribué de Hadoop |
| **YARN** | Yet Another Resource Negotiator — Gestionnaire de ressources des clusters Hadoop |
| **Parquet** | Format de stockage de données columnar hautement optimisé et compressé |
| **RDD** | Resilient Distributed Dataset — Structure de données de base distribuée d'Apache Spark |
| **TDE** | Transparent Data Encryption — Chiffrement transparent des fichiers sur disque |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi le format de fichier **Apache Parquet** (stockage en colonnes) est-il beaucoup plus efficace que le format CSV ou JSON pour les requêtes analytiques Big Data ?

**Corrigé :** Le format **Parquet** stocke les données par **colonnes** plutôt que par lignes. Lorsqu'une requête analytique demande par exemple de calculer la somme de la colonne `montant` sur 100 millions de lignes, le moteur de calcul (Spark/Hive) lit **uniquement** les blocs de disque contenant la colonne `montant` et ignore complètement les 50 autres colonnes (nom, adresse, etc.). Cela réduit les lectures disque d'un facteur 10 à 100 par rapport à un fichier CSV/JSON où chaque ligne entière doit être lue.

**Exercice 2 :** Dans la sécurité Big Data, quel est le rôle d'**Apache Ranger** pour le masquage dynamique des données (Data Masking) ?

**Corrigé :** **Apache Ranger** intercepte les requêtes des utilisateurs (SQL/Spark) et applique des politiques de masquage dynamique en fonction du rôle de l'utilisateur sans modifier les données originales sur disque. Par exemple, si un administrateur exécute `SELECT numero_carte FROM clients`, il voit la valeur réelle ; mais si un utilisateur du groupe "Support Client" exécute la même requête, Apache Ranger masque à la volée les résultats (ex: `XXXX-XXXX-XXXX-5678`), garantissant la confidentialité des données sensibles.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel composant de l'écosystème Hadoop assure le stockage distribué et la réplication des blocs de fichiers sur l'ensemble des Data Nodes ?
- A) HDFS
- B) Spark
- C) Hive
- D) Kafka

**Réponse : A**

**Q2 :** Pourquoi Apache Spark est-il considérablement plus rapide qu'Hadoop MapReduce pour les traitements de données complexes ?
- A) Il utilise des câbles réseau en fibre optique
- B) Il effectue ses calculs et conservations d'états intermédiaires directement en mémoire vive (RAM - In-Memory Computing)
- C) Il supprime le besoin de sécurité
- D) Il ne fonctionne que sur Windows

**Réponse : B**

**Q3 :** Quel protocole d'authentification réseau est le standard obligatoire pour sécuriser les accès et communications dans un cluster Hadoop d'entreprise ?
- A) HTTP basique
- B) Kerberos
- C) FTP
- D) Telnet

**Réponse : B**

**Q4 :** Quel outil open-source de l'écosystème Big Data permet de définir des politiques de sécurité et de contrôle d'accès unifiées (RBAC) sur HDFS, Spark, Hive et Kafka ?
- A) Apache Ranger
- B) Nmap
- C) Gzip
- D) Wireshark

**Réponse : A**

**Q5 :** Quel terme désigne la traçabilité du parcours d'une donnée depuis sa source originale jusqu'à sa transformation finale dans un Data Lake ?
- A) Data Lineage
- B) Data Mining
- C) Data Entry
- D) Data Storage

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
