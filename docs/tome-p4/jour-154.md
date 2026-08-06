# TOME P4 — Cloud, DevOps & SecOps — Jour 154 (6h) : Entrepôts de Données (Data Warehousing), Architectures ETL/ELT & Data Pipelines (PostgreSQL, ClickHouse, Apache Airflow)

> [!NOTE]
> **Objectif du jour :** Concevoir et construire des architectures Data & Analytics d'entreprise : distinction fondamentale OLTP (On-Line Transaction Processing) vs OLAP (On-Line Analytical Processing), modélisation décisionnelle en étoile et en flocon (Star Schema / Snowflake Schema), pipelines ETL/ELT avec Apache Airflow et bases de données analytiques orientées colonnes (ClickHouse).
>
> **Compétences visées :** `BIT-05` (A) — Data Engineering & Warehousing | `BIT-04` (A) — Data Pipelines & ETL Orchestration

---

## 1) Module — OLTP vs OLAP & Modélisation Décisionnelle (2h)

### 📖 Narration/Intuition

La base de données de production RTGS de la Banque Centrale (SGBD **OLTP**) est conçue pour exécuter très rapidement des milliers de petites transactions unitaires (`INSERT`, `UPDATE` de 1 ligne). Si le Directeur Financier exécute sur cette même base de production une requête analytique géante du type *"Calculez la moyenne des transactions par région et par mois sur les 5 dernières années"*, la base de production va être complètement ralentie et risquer le crash.

C'est pourquoi on sépare l'opérationnel de l'analytique : les données de production sont extraites vers un **Data Warehouse (SGBD OLAP)** optimisé pour la lecture et le calcul de masses de données historiques.

### 🔍 Anatomie Technique

**Comparaison OLTP vs OLAP :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            OLTP vs OLAP DATA ARCHITECTURE                   │
├──────────────┬──────────────────────────────────────────────────────────────┤
│ Caractéristique│ OLTP (Transactionnel - PostgreSQL/MySQL)                   │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Objectif     │ Opérations quotidiennes en temps réel (Virements, Achats)     │
│ Stockage     │ Orienté lignes (Row-oriented). Normalisé (3NF).             │
│ Requêtes     │ Nombreuses, rapides, affectant 1 à quelques lignes.          │
├──────────────┼──────────────────────────────────────────────────────────────┤
│              │ OLAP (Analytique - ClickHouse / Snowflake / BigQuery)        │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Objectif     │ Rapports de synthèse, Business Intelligence (BI), Data Science│
│ Stockage     │ Orienté colonnes (Columnar-oriented). Modèle en Étoile.      │
│ Requêtes     │ Peu nombreuses, complexes, analysant des millions de lignes. │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

**Modèle en Étoile (Star Schema) :**
- **Table de Faits (Fact Table)** au centre : Contient les métriques chiffrées (ex: `montant_transaction`, `frais`).
- **Tables de Dimensions** autour : Contiennent les axes d'analyse (ex: `Dim_Temps`, `Dim_Agence`, `Dim_Client`).

---

## 2) Module — Bases Colonnes (ClickHouse) & Pipelines ETL vs ELT (2h)

### 📖 Narration/Intuition

Pourquoi les bases de données orientées colonnes comme **ClickHouse** sont-elles 100 fois plus rapides que PostgreSQL pour l'analytique ?

Dans une base orientée lignes (PostgreSQL), si vous demandez la somme des montants sur 100 millions de lignes, le disque doit lire l'intégralité de chaque ligne (nom, adresse, date, IBAN, montant). Dans une base orientée colonnes (ClickHouse), le disque ne lit **que la colonne `montant`**, réduisant les I/O disque de 95% !

### 🔍 Anatomie Technique

**Comparaison ETL vs ELT :**
- **ETL (Extract, Transform, Load)** : Les données sont extraites des sources, transformées sur un serveur intermédiaire, puis chargées dans le Data Warehouse.
- **ELT (Extract, Load, Transform)** : Les données brutes sont chargées directement dans le Data Warehouse moderne, puis transformées sur place via SQL (ex: dbt - data build tool).

```sql
-- Exemple de création de table analytique dans ClickHouse (Moteur MergeTree)
CREATE TABLE bcc_analytics.fact_transactions (
    transaction_id UInt64,
    date_transaction Date,
    agence_id UInt16,
    montant Float64,
    statut Enum8('PENDING' = 1, 'SUCCESS' = 2, 'FAILED' = 3)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date_transaction)
ORDER BY (date_transaction, agence_id);

-- Requête analytique exécutée en quelques millisecondes sur 100M de lignes
SELECT 
    toStartOfMonth(date_transaction) AS mois,
    agence_id,
    sum(montant) AS total_volume,
    count() AS nombre_transactions
FROM bcc_analytics.fact_transactions
WHERE date_transaction >= '2026-01-01'
GROUP BY mois, agence_id
ORDER BY mois, total_volume DESC;
```

---

## 3) Module — Orchestration de Pipelines Data avec Apache Airflow (2h)

### 📖 Narration/Intuition

Un Data Pipeline bancaire ne doit pas être géré par des scripts cron sauvages éparpillés sur 10 serveurs. **Apache Airflow** est la plateforme d'orchestration open-source standard permettant de programmer, surveiller et automatiser des workflows de données complexes représentés sous forme de **DAG (Directed Acyclic Graph)**.

### 🔍 Anatomie Technique

**Définition d'un DAG Airflow de synchronisation bancaire (`etl_bcc_dag.py`) :**

```python
#!/usr/bin/env python3
"""
etl_bcc_dag.py — DAG Apache Airflow d'extraction et chargement OLTP -> OLAP ClickHouse
"""
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator

default_args = {
    'owner': 'data_team_bcc',
    'depends_on_past': False,
    'start_date': datetime(2026, 8, 1),
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

def extract_oltp_data():
    print("✅ Extraction des données de production PostgreSQL réussie.")

def transform_data():
    print("✅ Nettoyage et anonymisation des données de transactions réussis.")

with DAG(
    'bcc_daily_etl_pipeline',
    default_args=default_args,
    description='Pipeline ETL quotidien OLTP PostgreSQL vers ClickHouse',
    schedule_interval='0 2 * * *',  # Exécution chaque nuit à 02h00 du matin
    catchup=False
) as dag:

    task_extract = PythonOperator(
        task_id='extract_from_postgresql',
        python_callable=extract_oltp_data
    )

    task_transform = PythonOperator(
        task_id='transform_and_clean',
        python_callable=transform_data
    )

    task_load_clickhouse = BashOperator(
        task_id='load_to_clickhouse',
        bash_command='echo "✅ Insertion dans ClickHouse terminée."'
    )

    # Définition de l'ordre d'exécution du DAG (Dépendances)
    task_extract >> task_transform >> task_load_clickhouse
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OLTP** | On-Line Transaction Processing — Systèmes de bases de données transactionnelles |
| **OLAP** | On-Line Analytical Processing — Systèmes de bases de données décisionnelles |
| **ETL** | Extract, Transform, Load — Processus d'extraction, transformation et chargement de données |
| **ELT** | Extract, Load, Transform — Chargement des données brutes puis transformation locale |
| **DAG** | Directed Acyclic Graph — Graphe orienté acyclique représentant les dépendances d'un pipeline |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi est-il fortement déconseillé d'exécuter des requêtes de **Business Intelligence (BI)** et de reporting lourd directement sur la base de données de production **OLTP** d'une banque ?

**Corrigé :** Les bases de données **OLTP** sont conçues et indexées pour exécuter rapidement de très nombreuses petites requêtes d'écriture et de lecture ciblées. Une requête analytique lourdement agrégative (ex: calcul du chiffre d'affaires sur 5 ans) va forcer le SGBD à lire des millions de lignes, saturer le Buffer Pool avec des données historiques au détriment des données courantes, poser des verrous (Locks) sur les tables, et faire monter l'utilisation CPU à 100%. Cela risque d'entraîner des timeouts sur les transactions financières des clients en temps réel. L'export vers un Data Warehouse **OLAP** dédié isole les requêtes lourdes de la production.

**Exercice 2 :** Quelle est la différence entre un stockage **orienté lignes (Row-oriented)** et un stockage **orienté colonnes (Columnar-oriented)** ?

**Corrigé :** Dans un stockage **orienté lignes** (PostgreSQL/MySQL), les données de chaque ligne de la table sont enregistrées de manière contiguë sur le disque (Ligne 1 : ID, Nom, Date, Montant ; Ligne 2 : ID, Nom, Date, Montant...). Pour lire la colonne `Montant`, le disque doit lire l'intégralité de toutes les lignes. Dans un stockage **orienté colonnes** (ClickHouse/Snowflake), toutes les valeurs d'une même colonne sont stockées de manière contiguë (Colonne Montant : M1, M2, M3, M4...). Pour faire un calcul sur la colonne `Montant`, le moteur ne lit que les blocs disques contenant cette colonne, ce qui réduit considérablement les I/O disque et permet une compression de données optimale (les données du même type se compressent très bien).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel type de système de base de données est spécialement optimisé pour l'exécution rapide de transactions unitaires en temps réel (OLTP) ?
- A) PostgreSQL / MySQL (SGBDR classique)
- B) ClickHouse
- C) Snowflake
- D) Hadoop

**Réponse : A**

**Q2 :** Dans la modélisation décisionnelle en étoile (Star Schema), quel type de table se situe au centre et contient les métriques chiffrées mesurables ?
- A) La Table de Faits (Fact Table)
- B) La Table de Dimension
- C) La Table Temporaire
- D) La Vue Matérialisée

**Réponse : A**

**Q3 :** Quel outil open-source créé par Airbnb est le standard de l'industrie pour orchestrer et planifier des Data Pipelines sous forme de DAGs (Directed Acyclic Graphs) ?
- A) Apache Airflow
- B) MS Paint
- C) Excel
- D) Notepad

**Réponse : A**

**Q4 :** Pourquoi les bases de données analytiques orientées colonnes (ClickHouse) sont-elles nettement plus rapides que les SGBD orientés lignes pour les calculs d'agrégation ?
- A) Parce qu'elles ne lisent sur disque que les colonnes nécessaires au calcul sans charger les autres champs
- B) Parce qu'elles n'utilisent pas de disque dur
- C) Parce qu'elles sont écrites en HTML
- D) Parce qu'elles suppriment les données

**Réponse : A**

**Q5 :** Dans un pipeline moderne **ELT**, à quel moment la transformation des données a-t-elle lieu ?
- A) Après le chargement des données brutes directement dans le Data Warehouse
- B) Avant l'extraction
- C) Pendant la transmission réseau
- D) Jamais

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
