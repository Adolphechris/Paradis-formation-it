# TOME P4 — Cloud, DevOps & SecOps — Jour 151 (6h) : Architectures de bases de données relationnelles & SGBD d'entreprise (PostgreSQL / MySQL / Oracle)

> [!NOTE]
> **Objectif du jour :** Comprendre en profondeur l'architecture interne des SGBDR (Systèmes de Gestion de Bases de Données Relationnelles) d'entreprise (PostgreSQL, MySQL/InnoDB, Oracle) : mécanismes de stockage physique, moteur de transactions ACID, MVCC (Multi-Version Concurrency Control), gestion des tablespaces, buffer pools et journaux de transactions (WAL / Redo Logs).
>
> **Compétences visées :** `BIT-05` (A) — Architecture & Administration SGBD | `SEC-05` (A) — Sécurité des Stockages & Données

---

## 1) Module — Fondamentaux des SGBDR & Propriétés ACID (2h)

### 📖 Narration/Intuition

En 2026, la Banque Centrale du Congo (BCC) traite des dizaines de milliers de transactions financières interbancaires par seconde via son système RTGS. Si une coupure d'électricité survient exactement au moment où 10 000 000 USD sont débités du compte de la Banque Commerciale A et doivent être crédités sur le compte de la Banque B, le SGBDR doit garantir qu'aucune donnée ne soit perdue ou corrompue.

C'est le rôle fondamental des propriétés **ACID** (Atomicitée, Cohérence, Isolation, Durabilité) assurées par les moteurs de bases de données relationnelles d'entreprise.

### 🔍 Anatomie Technique

**Les 4 Piliers ACID et leurs Mécanismes Noyau :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MOTEUR SGBD RELATIONNEL                           │
├──────────────┬──────────────────────────────────────────────────────────────┤
│ Atomicitée   │ Tout ou rien (Transaction complète ou Rollback via Undo Logs) │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Cohérence    │ Respect des contraintes d'intégrité (PK, FK, Check, Triggers)│
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Isolation    │ Isolation des transactions concurrentes (MVCC & Niveaux ANSI)│
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Durabilité   │ Écritures sécurisées sur disque permanent (WAL / Redo Log)   │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

**Niveaux d'isolation SQL ANSI (du plus permissif au plus strict) :**
1. `Read Uncommitted` (Anomalie : Dirty Read — lecture de données non validées)
2. `Read Committed` (Défaut PostgreSQL/Oracle — empêche Dirty Read)
3. `Repeatable Read` (Défaut MySQL InnoDB — empêche Non-Repeatable Read)
4. `Serializable` (Isolation totale via verrouillage strict ou SSI — Serializable Snapshot Isolation)

---

## 2) Module — Architecture Interne : PostgreSQL (WAL & MVCC) vs MySQL (InnoDB) (2h)

### 📖 Narration/Intuition

Comment PostgreSQL permet-il à un utilisateur d'exécuter une requête `SELECT` géante qui dure 5 minutes sans bloquer les mises à jour `UPDATE` effectuées par des centaines d'autres utilisateurs au même moment ?

Grâce au **MVCC (Multi-Version Concurrency Control)**. Dans PostgreSQL, lorsqu'une ligne est modifiée (`UPDATE`), le SGBD ne réécrit pas la ligne existante sur disque : il insère une **nouvelle version (tuple)** de la ligne marquée avec un identifiant de transaction `xmin` et `xmax`. Chaque utilisateur voit un snapshot cohérent des données correspondant au début de sa transaction.

### 🔍 Anatomie Technique

**Comparaison Architecturale PostgreSQL vs MySQL InnoDB :**

```
POSTGRESQL ARCHITECTURE :
[ Client ] ──► [ Processus Backend ] ──► [ Shared Buffers (RAM) ]
                                                │
                                                ├──► [ WAL (Write-Ahead Log) Disk ]
                                                └──► [ Heap Files (Table Data) ]
* MVCC : Implémenté directement dans la table Heap (Auto-Vacuum requis pour nettoyer les dead tuples).

MYSQL INNODB ARCHITECTURE :
[ Client ] ──► [ Thread Pool ] ──► [ InnoDB Buffer Pool (RAM) ]
                                          │
                                          ├──► [ Redo Log / Doublewrite Buffer ]
                                          └──► [ Undo Logs (Tablespaceibdata1) ]
* MVCC : Les anciennes versions des lignes sont conservées dans le segment Undo Log.
```

---

## 3) Module — Laboratoire Pratique : Inspection des Fichiers Physiques & WAL (2h)

### 📖 Narration/Intuition

En tant qu'administrateur ou auditeur de sécurité à la BCC, vous devez être capable d'inspecter les paramètres système d'un cluster PostgreSQL, d'analyser la taille des fichiers WAL et d'identifier la consommation mémoire du Buffer Pool.

### 🔍 Anatomie Technique

**Commandes SQL & Administration PostgreSQL d'Entreprise :**

```sql
-- 1. Vérifier la version, la taille du Buffer Pool et la configuration WAL
SHOW shared_buffers;
SHOW wal_level;
SHOW max_connections;

-- 2. Inspecter la taille physique des bases de données et des tables
SELECT 
    datname AS database_name,
    pg_size_pretty(pg_database_size(datname)) AS size_total
FROM pg_database
ORDER BY pg_database_size(datname) DESC;

-- 3. Détecter les "Dead Tuples" nécessitant un VACUUM (Nettoyage MVCC)
SELECT 
    schemaname,
    relname AS table_name,
    n_live_tup AS live_tuples,
    n_dead_tup AS dead_tuples,
    round(100.0 * n_dead_tup / nullif(n_live_tup + n_dead_tup, 0), 2) AS dead_tuple_ratio
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY dead_tuples DESC;
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SGBDR** | Système de Gestion de Base de Données Relationnelle |
| **ACID** | Atomicity, Consistency, Isolation, Durability — Propriétés fondamentales des transactions |
| **MVCC** | Multi-Version Concurrency Control — Gestion de la concurrence par versioning |
| **WAL** | Write-Ahead Logging — Journal d'écriture anticipée garantissant la durabilité |
| **InnoDB** | Moteur de stockage transactionnel par défaut de MySQL |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence fondamentale entre le fonctionnement du **MVCC dans PostgreSQL** et le **MVCC dans MySQL InnoDB** concernant le nettoyage des anciennes versions de données ?

**Corrigé :** Dans **PostgreSQL**, les nouvelles versions de lignes (tuples) sont écrites directement dans la table principale (Heap). Les anciennes versions devenues invisibles ("dead tuples") restent dans la table jusqu'à ce que le processus d'arrière-plan **`VACUUM`** (ou `autovacuum`) vienne libérer l'espace disque. Dans **MySQL InnoDB**, les anciennes versions sont déplacées dans un espace dédié appelé **`Undo Log`** (Undo Tablespace). Lorsque la transaction la plus ancienne n'en a plus besoin, les segments d'Undo Log sont purgés automatiquement par un thread de Purge sans encombrer la table principale.

**Exercice 2 :** Pourquoi le composant **WAL (Write-Ahead Log)** est-il indispensable pour garantir la propriété de **Durabilité** du modèle ACID en cas de crash du serveur ?

**Corrigé :** Écrire des modifications directement sur les fichiers de données (Heap) sur disque est une opération lente et aléatoire (Random I/O). Pour optimiser les performances, le SGBD modifie d'abord les données en RAM (dans le Buffer Pool). Pour ne pas risquer de perdre ces données en RAM en cas de coupure de courant, le SGBD écrit **immédiatement et séquentiellement** (Sequential I/O rapide) la description de la modification dans le fichier **WAL** sur disque *avant* de confirmer la transaction au client. Si le serveur crashe, au redémarrage, le SGBD lit le fichier WAL et rejoue (REDO) toutes les transactions confirmées mais pas encore écrites sur les fichiers de données permanents.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle propriété du modèle ACID garantit qu'une transaction bancaire s'exécute intégralement ou pas du tout (Rollback) ?
- A) Atomicitée
- B) Isolation
- C) Durabilité
- D) Performance

**Réponse : A**

**Q2 :** Quel est le niveau d'isolation transactionnelle par défaut dans PostgreSQL et Oracle ?
- A) Read Committed
- B) Read Uncommitted
- C) Serializable
- D) Repeatable Read

**Réponse : A**

**Q3 :** Dans PostgreSQL, quel processus d'arrière-plan est responsable du nettoyage des "dead tuples" générés par le mécanisme MVCC ?
- A) Autovacuum
- B) Apache
- C) Nginx
- D) Cron

**Réponse : A**

**Q4 :** Quel journal disque garantit la durabilité des transactions en enregistrant les modifications de manière séquentielle avant la validation (Commit) ?
- A) WAL (Write-Ahead Log) / Redo Log
- B) Access Log
- C) Syslog
- D) Error Log

**Réponse : A**

**Q5 :** Dans l'architecture MySQL InnoDB, où sont stockées les anciennes versions de lignes utilisées pour l'isolation MVCC et le rollback ?
- A) Dans les Undo Logs
- B) Dans les fichiers HTML
- C) Sur une clé USB
- D) Dans les cookies du navigateur

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
