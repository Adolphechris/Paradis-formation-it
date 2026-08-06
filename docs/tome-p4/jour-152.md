# TOME P4 — Cloud, DevOps & SecOps — Jour 152 (6h) : SQL Avancé, Optimsation de Requêtes & Indexation (B-Tree, Hash, GIN, GiST, EXPLAIN ANALYZE)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'optimisation des requêtes SQL complexes et les structures d'indexation sous PostgreSQL / MySQL : fonctionnement interne des index B-Tree, Hash, GIN (Generalized Inverted Index) et GiST, lecture et interprétation fine des plans d'exécution `EXPLAIN (ANALYZE, BUFFERS)`, détection des balayages séquentiels coûteux (Seq Scan) et techniques d'optimisation de requêtes OLTP/OLAP.
>
> **Compétences visées :** `BIT-05` (A) — SQL Avancé & Performance DB | `SEC-05` (A) — Optimisation & Prévention des DoS sur BDD

---

## 1) Module — Types d'Indexation SGBD : B-Tree, Hash, GIN & GiST (2h)

### 📖 Narration/Intuition

Imaginez chercher la définition du mot "Cyberdéfense" dans un dictionnaire de 2 000 pages. Sans index alphabétique, vous devriez lire chaque page une par une depuis le début (**Sequential Scan**). Avec l'index alphabétique, vous sautez directement à la section "C" et trouvez le mot en 3 étapes (**Index Scan**).

Sur une base de données bancaire contenant 50 millions de transactions, une requête sans index met 45 secondes à s'exécuter et surcharge le processeur. Avec un index bien conçu, la même requête s'exécute en **2 millisecondes**.

### 🔍 Anatomie Technique

**Les 4 Types Principaux d'Index dans PostgreSQL :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STRUCTURES D'INDEXATION SGBD                       │
├──────────────┬──────────────────────────────────────────────────────────────┤
│ B-Tree       │ Par défaut. Arbre équilibré (O(log N)). Idéal pour =, <, >,  │
│ (Balanced)   │ BETWEEN, ORDER BY sur clés primaires, dates et montants.      │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Hash         │ Table de hachage O(1). Uniquement pour les égalités strictes │
│              │ (=). Plus léger mais ne supporte pas les plages de valeurs.  │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ GIN          │ Generalized Inverted Index. Idéal pour la recherche textuelle│
│              │ (Full-Text Search), tableaux (Arrays) et documents JSONB.    │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ GiST         │ Generalized Search Tree. Idéal pour les données géométriques,│
│              │ géospatiales (PostGIS) et les intervalles de dates.          │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Analyse des Plans d'Exécution : `EXPLAIN ANALYZE` (2h)

### 📖 Narration/Intuition

Le **Query Planner / Optimizer** du SGBD choisit la stratégie la plus efficace pour exécuter chaque requête SQL. Pour comprendre pourquoi une requête est lente, l'administrateur utilise la commande `EXPLAIN ANALYZE` qui exécute la requête et affiche l'arbre d'exécution réel avec le coût estimé, le temps passé et les accès mémoire/disque.

### 🔍 Anatomie Technique

**Lecture d'un plan d'exécution `EXPLAIN (ANALYZE, BUFFERS)` :**

```sql
-- Requête non optimisée (Scan complet de la table 10M de lignes)
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM transactions 
WHERE date_transaction >= '2026-08-01' AND montant > 100000;

/*
OUTPUT :
Seq Scan on transactions  (cost=0.00..284500.00 rows=12500 width=64) (actual time=4521.12..4525.80 rows=11200 loops=1)
  Filter: ((date_transaction >= '2026-08-01'::date) AND (montant > 100000))
  Rows Removed by Filter: 9988800
  Buffers: shared read=184500
Planning Time: 0.15 ms
Execution Time: 4526.40 ms  <-- TRÈS LENT (4.5 secondes) !
*/

-- OPTIMISATION : Création d'un index composite B-Tree
CREATE INDEX idx_transac_date_montant ON transactions(date_transaction, montant);

-- Nouvelle exécution :
/*
OUTPUT :
Bitmap Heap Scan on transactions  (cost=245.10..12450.00 rows=12500 width=64) (actual time=1.85..3.40 rows=11200 loops=1)
  Recheck Cond: ((date_transaction >= '2026-08-01'::date) AND (montant > 100000))
  Buffers: shared hit=1250
Planning Time: 0.22 ms
Execution Time: 3.80 ms  <-- 1200x PLUS RAPIDE (3.8 ms) !
*/
```

---

## 3) Module — Laboratoire Pratique : Indexation JSONB & Full-Text Search (2h)

### 📖 Narration/Intuition

Dans les applications modernes, des données semi-structurées sont souvent stockées sous forme de documents **JSONB** dans PostgreSQL. Interroger un champ JSONB sans index GIN force un Sequential Scan de toute la table.

### 🔍 Anatomie Technique

**Indexation GIN sur JSONB et Full-Text Search :**

```sql
-- 1. Table de logs applicatifs au format JSONB
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payload JSONB NOT NULL
);

-- 2. Création d'un index GIN sur le document JSONB complet
CREATE INDEX idx_audit_payload_gin ON audit_logs USING GIN (payload);

-- 3. Requête ultra-rapide cherchant un utilisateur spécifique dans le JSONB (Opérateur @>)
SELECT * FROM audit_logs 
WHERE payload @> '{"user": "admin_bcc", "action": "LOGIN_FAILED"}';

-- 4. Index GIN pour la recherche plein texte (Full-Text Search) sur descriptions
CREATE INDEX idx_tx_description_fts ON transactions USING GIN (to_tsvector('french', description));

-- Requête de recherche textuelle optimisée
SELECT transaction_id, description 
FROM transactions 
WHERE to_tsvector('french', description) @@ to_tsquery('french', 'virement & suspect');
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **B-Tree** | Balanced Tree — Arbre binaire équilibré pour l'indexation générale |
| **GIN** | Generalized Inverted Index — Index inversé pour JSONB, tableaux et mots |
| **GiST** | Generalized Search Tree — Arbre de recherche générique pour données spatiales/temporelles |
| **Seq Scan** | Sequential Scan — Balayage séquentiel de l'intégralité d'une table (indicateur de manque d'index) |
| **JSONB** | Binary JSON — Format binaire indexable de stockage JSON dans PostgreSQL |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre `EXPLAIN` et `EXPLAIN ANALYZE` dans PostgreSQL, et pourquoi faut-il être prudent lors de l'exécution de `EXPLAIN ANALYZE` sur des requêtes `DELETE` ou `UPDATE` en production ?

**Corrigé :** `EXPLAIN` affiche la planification théorique de la requête calculée par l'optimiseur **sans exécuter** la requête. `EXPLAIN ANALYZE` **exécute réellement** la requête sur la base de données pour mesurer les temps réels d'exécution et les accès mémoire/disque. Si vous lancez `EXPLAIN ANALYZE DELETE FROM transactions WHERE status = 'CANCELLED';` en production, la suppression sera réellement effectuée en base de données. Pour tester une requête de modification avec `EXPLAIN ANALYZE` en toute sécurité, il faut l'encadrer dans un bloc transactionnel avec rollback : `BEGIN; EXPLAIN ANALYZE DELETE ...; ROLLBACK;`.

**Exercice 2 :** Pourquoi la création d'un index sur **chaque colonne** d'une table est-elle une mauvaise pratique d'ingénierie ?

**Corrigé :** Bien que les index accélèrent considérablement les requêtes de lecture (`SELECT`), chaque index sur une table engendre deux surcoûts majeurs :
1. **Pénalité en écriture** : À chaque `INSERT`, `UPDATE` ou `DELETE`, le SGBD doit mettre à jour la table principale ET recalculer l'arbre de tous les index associés sur la table. Multiplier les index ralentit fortement les écritures.
2. **Empreinte mémoire et disque** : Les index occupent un espace disque et RAM considérable. Trop d'index inutiles saturent le Buffer Pool, expulsant les données utiles de la mémoire vive.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel type d'index par défaut dans les SGBDR s'appuie sur une structure d'arbre équilibré offrant une complexité de recherche en O(log N) ?
- A) B-Tree
- B) Hash
- C) GIN
- D) Linear

**Réponse : A**

**Q2 :** Dans PostgreSQL, quel type d'index est recommandé pour accélérer les requêtes sur les colonnes au format JSONB et la recherche textuelle plein texte (Full-Text Search) ?
- A) GIN (Generalized Inverted Index)
- B) B-Tree
- C) Hash
- D) Spatial

**Réponse : A**

**Q3 :** Que signifie la présence d'un "Seq Scan" dans le résultat d'une commande `EXPLAIN` sur une table de 10 millions de lignes ?
- A) Le SGBD parcourt la table ligne par ligne depuis le début car aucun index approprié n'a été trouvé
- B) La requête est parfaitement optimisée
- C) Le serveur est éteint
- D) La table est vide

**Réponse : A**

**Q4 :** Quelle commande PostgreSQL permet d'exécuter réellement une requête tout en affichant son plan d'exécution avec les temps réels et la consommation des buffers mémoire ?
- A) `EXPLAIN (ANALYZE, BUFFERS)`
- B) `SELECT *`
- C) `SHOW ALL`
- D) `VACUUM FULL`

**Réponse : A**

**Q5 :** Quel est l'impact principal d'un sur-indexage (ajouter un index sur chaque colonne) sur les opérations de modification de données (`INSERT` / `UPDATE`) ?
- A) Un ralentissement significatif des opérations d'écriture car le SGBD doit mettre à jour tous les index à chaque modification
- B) Une accélération des écritures
- C) Aucun impact
- D) La suppression automatique de la base de données

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
