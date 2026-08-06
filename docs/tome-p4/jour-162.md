# TOME P4 — Cloud, DevOps & SecOps — Jour 162 (6h) : Architectures Big Data, Distributed Computing & Traitement Batch (Apache Hadoop, HDFS, YARN & MapReduce)

> [!NOTE]
> **Objectif du jour :** Comprendre les fondements de l'écosystème Big Data et du calcul distribué d'entreprise : architecture du système de fichiers distribué HDFS (NameNode, DataNodes, Block Replication), gestionnaire de ressources distribué YARN (ResourceManager, NodeManager), paradigme de programmation MapReduce (Map, Shuffle, Reduce) et gouvernance des données bancaires massives.
>
> **Compétences visées :** `BIT-05` (A) — Distributed Big Data Systems | `BIT-04` (A) — Stockage & Calcul Distribué HDFS/YARN

---

## 1) Module — Fondamentaux du Big Data & Système de Fichiers HDFS (2h)

### 📖 Narration/Intuition

En 2026, la Banque Centrale du Congo (BCC) conserve 10 ans d'historiques complets de logs réseau, d'enregistrements d'audit, de relevés bancaires et de données télémétriques, représentant un volume total de **5 Pétaoctets (5 000 Terabytes)**.

Aucun serveur unique au monde ne possède un disque dur ou une mémoire RAM suffisant pour stocker et traiter 5 Pétaoctets de données. La solution consiste à découper ces fichiers massifs en petits blocs et à les distribuer sur un **cluster de centaines de serveurs standards économiques**.

C'est le rôle de **HDFS (Hadoop Distributed File System)**.

### 🔍 Anatomie Technique

**Architecture Master/Worker de Hadoop HDFS :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HDFS CLUSTER ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                   ┌──────────────────────────────────┐                      │
│                   │  NAMENODE (Serveur de Métadonnées)│                      │
│                   │  - Mapping Fichiers -> Blocs     │                      │
│                   │  - Emplacement des Blocs         │                      │
│                   └────────────────┬─────────────────┘                      │
│                                    │                                        │
│          ┌─────────────────────────┼─────────────────────────┐              │
│          ▼                         ▼                         ▼              │
│ ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐    │
│ │ DATANODE 1       │      │ DATANODE 2       │      │ DATANODE 3       │    │
│ │ [Bloc 1 (128MB)] │      │ [Bloc 1 (Replica)]│     │ [Bloc 2 (128MB)] │    │
│ │ [Bloc 2 (Replica)]│     │ [Bloc 3 (128MB)] │      │ [Bloc 3 (Replica)]│    │
│ └──────────────────┘      └──────────────────┘      └──────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Principales caractéristiques de HDFS :**
- **Taille de bloc par défaut** : 128 MB (permet d'optimiser les accès séquentiels).
- **Facteur de Réplication par défaut** : `3` (Chaque bloc est copié sur 3 DataNodes différents pour garantir la tolérance aux pannes matérielles).

---

## 2) Module — Gestion des Ressources (YARN) & Paradigme MapReduce (2h)

### 📖 Narration/Intuition

Une fois que les 5 Pétaoctets de données sont répartis sur 100 DataNodes, comment exécuter un calcul de synthèse sans devoir tout transférer sur un seul processeur (ce qui saturerait le réseau) ?

La règle d'or du Big Data est d'**Amener le Calcul vers la Donnée (Data Locality)** plutôt que la donnée vers le calcul.
- **YARN (Yet Another Resource Negotiator)** alloue le processeur et la RAM requis sur les serveurs qui possèdent déjà les blocs de données.
- **MapReduce** est le modèle de programmation qui découpe le traitement en deux étapes : la phase **Map** exécute le calcul en parallèle localement sur chaque nœud, puis la phase **Reduce** agrège les résultats partiels.

### 🔍 Anatomie Technique

**Les 3 Étapes du Pipeline MapReduce :**

```
Données d'Entrée (Logs 5 PB)
    │
    ▼
1. MAP (Traitement local parallèle sur 100 DataNodes)
   Input: (Offset, Ligne de Log) ──► Output: (IP_Source, 1)
    │
    ▼
2. SHUFFLE & SORT (Regroupement réseau des clés identiques)
   Toutes les paires avec la même IP_Source sont envoyées au même Reducer.
    │
    ▼
3. REDUCE (Agrégation finale des résultats)
   Input: (IP_Source, [1, 1, 1, 1...]) ──► Output: (IP_Source, Total_Connexions)
```

---

## 3) Module — Laboratoire Pratique : Manipulation HDFS CLI & Job MapReduce (2h)

### 📖 Narration/Intuition

En tant qu'ingénieur Big Data à la BCC, vous devez être capable de manipuler l'espace de stockage HDFS via la ligne de commande et de lancer un job de traitement par lots (Batch Processing).

### 🔍 Anatomie Technique

**Commandes HDFS CLI & Exécution d'un Job MapReduce :**

```bash
# 1. Lister le contenu du système de fichiers distribué HDFS
hdfs dfs -ls /user/bcc/logs/

# 2. Créer un répertoire dans HDFS
hdfs dfs -mkdir -p /user/bcc/data/transactions_2026/

# 3. Transférer un fichier local massif de 50 GB vers HDFS (Découpage auto en blocs 128MB + replication x3)
hdfs dfs -put /var/log/bcc_audit_massive.log /user/bcc/data/transactions_2026/

# 4. Vérifier l'état de santé et la réplication du cluster HDFS
hdfs fsck /user/bcc/data/transactions_2026/ -files -blocks -locations

# Output FSCK :
# Status: HEALTHY
# Total size: 53687091200 B | Total blocks: 400 | Target replication factor: 3

# 5. Soumettre un Job MapReduce au gestionnaire de ressources YARN
yarn jar /usr/lib/hadoop-mapreduce/hadoop-mapreduce-examples.jar wordcount \
     /user/bcc/data/transactions_2026/ \
     /user/bcc/output/wordcount_results/

# 6. Lire le résultat généré dans HDFS par les Reducers
hdfs dfs -cat /user/bcc/output/wordcount_results/part-r-00000 | head -n 20
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **HDFS** | Hadoop Distributed File System — Système de fichiers distribué hautement tolérant aux pannes |
| **YARN** | Yet Another Resource Negotiator — Gestionnaire de ressources et d'ordonnancement Hadoop |
| **PB** | Pétaoctet — Unité de mesure de stockage de données (1 PB = 1 000 Terabytes = 10^15 octets) |
| **Data Locality** | Principe d'exécution du code de calcul directement sur le nœud hébergeant la donnée |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Dans un cluster HDFS avec une taille de bloc configurée à **128 MB** et un facteur de réplication de **3**, quel est l'espace disque physique total réellement consommé par l'envoi d'un fichier de **500 MB** dans HDFS ?

**Corrigé :** 
1. Un fichier de 500 MB est découpé par HDFS en 4 blocs :
   - Bloc 1 : 128 MB
   - Bloc 2 : 128 MB
   - Bloc 3 : 128 MB
   - Bloc 4 : 116 MB (le reste)
   Taille logique totale = 500 MB.
2. Avec un **facteur de réplication de 3**, chaque bloc est dupliqué 3 fois sur des DataNodes différents.
   Espace disque physique total consommé = `500 MB * 3 = 1 500 MB (1.5 GB)`.

**Exercice 2 :** Pourquoi le rôle du **NameNode** dans HDFS est-il critique, et comment la Haute Disponibilité (NameNode HA) prévient-elle le risque de SPOF (Single Point of Failure) ?

**Corrigé :** Le **NameNode** est le serveur maître d'un cluster HDFS qui conserve en mémoire RAM l'arborescence complète des répertoires et la cartographie d'emplacement de chaque bloc de fichier sur les DataNodes. Si le NameNode s'éteint sans solution de secours, les données brutes restent sur les DataNodes mais il est **impossible de savoir quel bloc appartient à quel fichier**, rendant le système totalement inutilisable. Pour éliminer ce SPOF, une architecture **NameNode HA** utilise deux NameNodes (un Active et un Standby synchronisés via **Quorum Journal Manager / ZooKeeper**) : si l'Active plante, le Standby prend le relais immédiatement sans perte de métadonnées.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le composant d'architecture de l'écosystème Hadoop responsable de la gestion du système de fichiers distribué et du découpage des fichiers massifs en blocs ?
- A) HDFS (Hadoop Distributed File System)
- B) MySQL
- C) Apache HTTPD
- D) Docker

**Réponse : A**

**Q2 :** Quelle est la taille de bloc par défaut d'un fichier stocké dans HDFS sur les versions modernes d'Hadoop ?
- A) 128 MB
- B) 4 KB
- C) 1 MB
- D) 1 GB

**Réponse : A**

**Q3 :** Quel est le principe fondamental du Big Data qui consiste à exécuter le code de calcul directement sur la machine physique qui contient le bloc de données au lieu de transférer la donnée par le réseau ?
- A) Data Locality (Localité des données)
- B) Data Migration
- C) Web Scraping
- D) Network Streaming

**Réponse : A**

**Q4 :** Dans l'écosystème Hadoop, quel composant assure la négociation et l'allocation distribuée des ressources CPU et RAM (ResourceManager & NodeManager) ?
- A) YARN (Yet Another Resource Negotiator)
- B) Redis
- C) Nginx
- D) Git

**Réponse : A**

**Q5 :** Dans le modèle de programmation MapReduce, quelle étape intermédiaire s'intercale automatiquement entre la phase Map et la phase Reduce pour regrouper par le réseau les clés identiques ?
- A) Shuffle & Sort
- B) Print & Save
- C) Zip & Unzip
- D) Delete & Format

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
