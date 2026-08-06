# TOME P0 — Socle Universel — Jour 34 (6h) : SQL & Bases de Données Relationnelles

> [!NOTE]
> **Objectif du jour :** Maîtriser les fondamentaux du langage SQL pour interroger, manipuler et comprendre les bases de données relationnelles. À la fin de cette journée, vous serez capable d'écrire des requêtes SELECT complexes, d'utiliser les JOINs, et de comprendre l'architecture d'un SGBD.
>
> **Compétences visées :** `BIT-06` (A) — SQL et bases de données relationnelles

---

## 1) Module — Architecture d'un SGBD & Modèle Relationnel (2h)

### 📖 Narration/Intuition

Imaginez un tableur Excel géant, mais avec des règles strictes, des relations entre les feuilles, et la capacité de répondre à des millions de requêtes par seconde. C'est un **SGBD** (Système de Gestion de Base de Données). SQL est le langage universel pour communiquer avec ce système.

Toutes les organisations — banques, hôpitaux, universités — stockent leurs données critiques dans des bases relationnelles. Comprendre SQL est aussi fondamental que comprendre les réseaux.

### 🔍 Anatomie Technique

**Architecture d'un SGBD relationnel :**

```
Application (Python, PHP, Java...)
         ↓
Pilote (driver) de connexion
         ↓
SGBD (PostgreSQL / MySQL / SQLite / Oracle)
         ↓
Moteur SQL → Parseur → Optimiseur → Exécuteur
         ↓
Fichiers de données sur disque
```

**Concepts fondamentaux :**

| Concept | Définition | Analogie |
|:---:|:---|:---|
| **Base de données** | Conteneur de tables liées | Classeur Excel |
| **Table (relation)** | Ensemble de lignes/colonnes structuré | Feuille Excel |
| **Ligne (tuple)** | Un enregistrement dans la table | Ligne du tableau |
| **Colonne (attribut)** | Un champ de données typé | Colonne Excel |
| **Clé primaire (PK)** | Identifiant unique de chaque ligne | Numéro de matricule |
| **Clé étrangère (FK)** | Référence vers une PK d'une autre table | Numéro de département |
| **Index** | Structure accélérant les recherches | Index d'un livre |

**Pratique avec SQLite3 :**

```sql
-- SQLite3 est intégré à Python, parfait pour l'apprentissage
-- Lance sqlite3 en ligne de commande :
-- $ sqlite3 formation.db

-- Créer une base de données et une table
CREATE TABLE employes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,  -- PK auto-incrémentée
    nom         TEXT    NOT NULL,
    prenom      TEXT    NOT NULL,
    service     TEXT    NOT NULL,
    salaire     REAL    DEFAULT 0.0,
    date_entree TEXT    NOT NULL
);

CREATE TABLE services (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nom         TEXT    NOT NULL UNIQUE,
    budget      REAL    NOT NULL,
    directeur   INTEGER REFERENCES employes(id)  -- FK vers employes
);

-- Insérer des données
INSERT INTO employes (nom, prenom, service, salaire, date_entree) VALUES
    ('Mbeki', 'Jean', 'IT', 850000, '2022-01-15'),
    ('Kazadi', 'Marie', 'RH', 720000, '2021-06-01'),
    ('Tshiamala', 'Paul', 'IT', 920000, '2020-03-10'),
    ('Muamba', 'Sophie', 'Finance', 880000, '2023-01-08'),
    ('Lunda', 'Charles', 'IT', 780000, '2022-09-20');
```

### 🛠️ Atelier Pratique — SQLite3 en Python

```python
import sqlite3

# Connexion (crée le fichier si inexistant)
conn = sqlite3.connect("formation.db")
conn.row_factory = sqlite3.Row  # Permet d'accéder aux colonnes par nom

cursor = conn.cursor()

# Créer la table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS employes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        prenom TEXT NOT NULL,
        service TEXT NOT NULL,
        salaire REAL DEFAULT 0.0
    )
""")

# Insérer avec des paramètres (protection contre SQLi)
donnees = [
    ("Mbeki", "Jean", "IT", 850000),
    ("Kazadi", "Marie", "RH", 720000),
    ("Tshiamala", "Paul", "IT", 920000),
]
cursor.executemany(
    "INSERT INTO employes (nom, prenom, service, salaire) VALUES (?, ?, ?, ?)",
    donnees
)

conn.commit()  # Valider les insertions

# Requête et affichage
for row in cursor.execute("SELECT * FROM employes ORDER BY salaire DESC"):
    print(f"{row['nom']:15} {row['service']:10} {row['salaire']:>10,.0f} CDF")

conn.close()
```

---

## 2) Module — Requêtes SELECT & Filtrage (2h)

### 📖 Narration/Intuition

La requête SELECT est le cœur de SQL. Elle permet d'extraire exactement les données dont vous avez besoin. Un DBA (Database Administrator) expérimenté passe 70% de son temps à optimiser des SELECT.

### 🔍 Anatomie Technique

**Anatomie complète d'un SELECT :**

```sql
-- Ordre des clauses (obligatoire) :
SELECT   colonnes              -- Quoi récupérer
FROM     table                 -- D'où
WHERE    condition             -- Filtre sur les lignes
GROUP BY colonne_regroupement  -- Regroupement
HAVING   condition_groupe      -- Filtre sur les groupes
ORDER BY colonne [ASC|DESC]   -- Tri
LIMIT    n                     -- Limitation du nombre de résultats
OFFSET   m;                   -- Saut de m lignes (pagination)

-- Exemple complet
SELECT 
    service,
    COUNT(*) AS nombre_employes,
    AVG(salaire) AS salaire_moyen,
    MAX(salaire) AS salaire_max,
    MIN(salaire) AS salaire_min
FROM employes
WHERE salaire > 500000            -- Filtre avant regroupement
GROUP BY service                  -- Un groupe par service
HAVING COUNT(*) >= 2              -- Uniquement si au moins 2 employés
ORDER BY salaire_moyen DESC       -- Les plus payés en premier
LIMIT 5;                          -- Maximum 5 résultats
```

**Fonctions d'agrégation :**

```sql
SELECT
    COUNT(*)        AS total_lignes,
    COUNT(salaire)  AS lignes_non_nulles,  -- Ignore les NULL
    SUM(salaire)    AS masse_salariale,
    AVG(salaire)    AS salaire_moyen,
    MAX(salaire)    AS plus_eleve,
    MIN(salaire)    AS plus_bas,
    ROUND(AVG(salaire), 2) AS moyenne_arrondie
FROM employes;
```

**Filtres avec WHERE :**

```sql
-- Comparaisons
WHERE salaire > 800000
WHERE salaire BETWEEN 700000 AND 900000
WHERE service IN ('IT', 'Finance')
WHERE nom LIKE 'M%'          -- Commence par M
WHERE prenom LIKE '%ie'      -- Finit par "ie"
WHERE prenom LIKE '%an%'     -- Contient "an"

-- NULL
WHERE salaire IS NULL
WHERE salaire IS NOT NULL

-- Combinaisons logiques
WHERE service = 'IT' AND salaire > 800000
WHERE service = 'RH' OR service = 'Finance'
WHERE NOT (service = 'IT')
```

**JOINs — Jointures entre tables :**

```sql
-- Tables de test
CREATE TABLE departements (
    id   INTEGER PRIMARY KEY,
    nom  TEXT NOT NULL,
    chef TEXT
);

INSERT INTO departements VALUES
    (1, 'IT', 'Tshiamala Paul'),
    (2, 'RH', 'Kazadi Marie'),
    (3, 'Finance', 'Muamba Sophie');

-- INNER JOIN : seulement les lignes avec correspondance des deux côtés
SELECT e.nom, e.prenom, e.salaire, d.nom AS departement
FROM employes e
INNER JOIN departements d ON e.service = d.nom;

-- LEFT JOIN : toutes les lignes de gauche, NULL si pas de correspondance à droite
SELECT e.nom, d.nom AS departement
FROM employes e
LEFT JOIN departements d ON e.service = d.nom;

-- Sous-requête : SELECT dans un SELECT
SELECT nom, prenom, salaire
FROM employes
WHERE salaire > (SELECT AVG(salaire) FROM employes);  -- Salaire > moyenne
```

### 🛠️ Atelier Pratique — Requêtes d'Audit

```sql
-- Contexte : base de données d'audit de connexions SSH

CREATE TABLE connexions_ssh (
    id          INTEGER PRIMARY KEY,
    ip_source   TEXT NOT NULL,
    utilisateur TEXT NOT NULL,
    statut      TEXT CHECK(statut IN ('SUCCES', 'ECHEC')),
    horodatage  TEXT NOT NULL
);

-- Q1 : Nombre de tentatives par IP
SELECT ip_source, COUNT(*) AS tentatives
FROM connexions_ssh
WHERE statut = 'ECHEC'
GROUP BY ip_source
ORDER BY tentatives DESC
LIMIT 10;

-- Q2 : IPs avec > 10 échecs (potentiel brute force)
SELECT ip_source, COUNT(*) AS echecs
FROM connexions_ssh
WHERE statut = 'ECHEC'
GROUP BY ip_source
HAVING COUNT(*) > 10
ORDER BY echecs DESC;

-- Q3 : Taux de succès par utilisateur
SELECT
    utilisateur,
    COUNT(*) AS total,
    SUM(CASE WHEN statut = 'SUCCES' THEN 1 ELSE 0 END) AS succes,
    ROUND(100.0 * SUM(CASE WHEN statut = 'SUCCES' THEN 1 ELSE 0 END) / COUNT(*), 1) AS taux_succes
FROM connexions_ssh
GROUP BY utilisateur
ORDER BY taux_succes ASC;
```

---

## 3) Module — Optimisation & Bonnes Pratiques (2h)

### 📖 Narration/Intuition

Une mauvaise requête SQL peut paralyser un serveur en production. L'optimisation SQL est une compétence critique pour tout administrateur de base de données.

### 🔍 Anatomie Technique

**Les index — accélérer les recherches :**

```sql
-- Sans index : scan complet de la table (table scan) → LENT sur gros volumes
SELECT * FROM connexions_ssh WHERE ip_source = '192.168.1.105';

-- Créer un index sur la colonne fréquemment filtrée
CREATE INDEX idx_ip_source ON connexions_ssh(ip_source);
CREATE INDEX idx_statut ON connexions_ssh(statut);
CREATE INDEX idx_horodatage ON connexions_ssh(horodatage);

-- Index composite (plusieurs colonnes)
CREATE INDEX idx_ip_statut ON connexions_ssh(ip_source, statut);

-- Analyser une requête (EXPLAIN QUERY PLAN dans SQLite)
EXPLAIN QUERY PLAN
SELECT * FROM connexions_ssh WHERE ip_source = '192.168.1.105';
-- Résultat : montre si l'index est utilisé ou non
```

**Vues — simplifier les requêtes complexes :**

```sql
-- Créer une vue (requête nommée réutilisable)
CREATE VIEW vue_brute_force AS
SELECT 
    ip_source,
    COUNT(*) AS nb_echecs,
    MAX(horodatage) AS dernier_echec
FROM connexions_ssh
WHERE statut = 'ECHEC'
GROUP BY ip_source
HAVING COUNT(*) > 10;

-- Utiliser la vue comme une table normale
SELECT * FROM vue_brute_force ORDER BY nb_echecs DESC;
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SGBD** | Système de Gestion de Base de Données (DBMS en anglais) |
| **DBMS** | Database Management System |
| **SQL** | Structured Query Language — langage de requête structuré |
| **PK** | Primary Key — clé primaire |
| **FK** | Foreign Key — clé étrangère |
| **DBA** | Database Administrator — administrateur de base de données |
| **DDL** | Data Definition Language — CREATE, ALTER, DROP |
| **DML** | Data Manipulation Language — SELECT, INSERT, UPDATE, DELETE |
| **OLTP** | Online Transaction Processing — traitement transactionnel en ligne |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Écrivez une requête qui liste les 3 services avec la masse salariale totale la plus élevée.

**Corrigé :**
```sql
SELECT service, SUM(salaire) AS masse_salariale
FROM employes
GROUP BY service
ORDER BY masse_salariale DESC
LIMIT 3;
```

**Exercice 2 :** Trouvez tous les employés dont le salaire est supérieur à la moyenne de leur propre service.

**Corrigé :**
```sql
SELECT e1.nom, e1.prenom, e1.service, e1.salaire
FROM employes e1
WHERE e1.salaire > (
    SELECT AVG(e2.salaire)
    FROM employes e2
    WHERE e2.service = e1.service
);
```

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la différence entre WHERE et HAVING ?
- A) Aucune différence
- B) WHERE filtre avant agrégation, HAVING filtre après agrégation
- C) HAVING est plus rapide que WHERE
- D) WHERE ne fonctionne qu'avec les chiffres

**Réponse : B**

**Q2 :** `SELECT COUNT(*) FROM employes WHERE service = 'IT'` — que retourne cette requête ?
- A) La liste des employés IT
- B) Le nombre d'employés dans le service IT
- C) La somme des salaires IT
- D) Une erreur car COUNT n'accepte pas *

**Réponse : B**

**Q3 :** Quelle clause SQL permet de supprimer les doublons dans le résultat ?
- A) UNIQUE
- B) DISTINCT
- C) NODUPLICATE
- D) FILTER

**Réponse : B** — `SELECT DISTINCT service FROM employes;`

**Q4 :** Un INNER JOIN entre tables A et B retourne :
- A) Toutes les lignes de A
- B) Toutes les lignes de B
- C) Seulement les lignes ayant une correspondance dans les deux tables
- D) L'union de toutes les lignes des deux tables

**Réponse : C**

**Q5 :** À quoi sert un index en SQL ?
- A) À chiffrer les données sensibles
- B) À accélérer les recherches en créant une structure de données optimisée sur une colonne
- C) À empêcher les doublons automatiquement
- D) À sauvegarder la base de données

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
