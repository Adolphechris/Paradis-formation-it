# TOME P4 — Cloud, DevOps & SecOps — Jour 156 (6h) : Modélisation Conceptuelle & Logique de Données (MCD/MLD, Normalisation 1NF à 3NF/BCNF & Dictionnaire de Données)

> [!NOTE]
> **Objectif du jour :** Maîtriser la conception et la modélisation de bases de données relationnelles pour les systèmes bancaires complexes : passage du Modèle Conceptuel de Données (MCD / Entité-Association) au Modèle Logique de Données (MLD / Relationnel) et au Modèle Physique (MPD SQL), règles de normalisation rigoureuses (1NF, 2NF, 3NF, BCNF) et rédaction d'un dictionnaire de données d'entreprise.
>
> **Compétences visées :** `BIT-05` (A) — Conception & Modélisation SGBD | `SEC-05` (A) — Intégrité des Données & Contraintes SGBD

---

## 1) Module — Démarche de Modélisation : MCD (Entité-Association) vers MLD (2h)

### 📖 Narration/Intuition

Avant de taper la moindre ligne de code `CREATE TABLE`, un architecte de données doit concevoir le modèle conceptuel du système d'information. Si la structure initiale des tables est mal pensée, corriger une mauvaise modélisation 6 mois plus tard en production exige des migrations complexes, coûteuses et risquées.

Le **Modèle Conceptuel de Données (MCD)** représente la réalité métier sous forme d'**Entités** (ex: *Client*, *Compte*, *Transaction*), d'**Attributs** (ex: *Nom*, *Solde*, *Montant*) et d'**Associations** qualifiées par leurs cardinalités (`1,1`, `0,N`, `1,N`, `N,M`).

### 🔍 Anatomie Technique

**Règles de Passage du MCD au MLD Relationnel :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PASSAGE DU MCD AU MLD RELATIONNEL                     │
├───────────────────┬─────────────────────────────────────────────────────────┤
│ Équivalence MCD   │ Traduction MLD (Table Relationnelle)                    │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ Entité            │ Devient une Table Relationnelle                         │
│ Attribut          │ Devient une Colonne (avec Type et Contraintes)          │
│ Identifiant       │ Devient la Clé Primaire (Primary Key - PK)              │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ Association (1,N) │ La clé primaire du côté (1,1) devient une Clé Étrangère │
│ (One-to-Many)     │ (Foreign Key - FK) dans la table du côté (1,N).         │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ Association (N,M) │ Création d'une Table d'Association intermédiaire        │
│ (Many-to-Many)    │ dont la PK est composée des FKs des deux tables.        │
└───────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 2) Module — Règles de Normalisation : 1NF, 2NF, 3NF & BCNF (2h)

### 📖 Narration/Intuition

La **Normalisation** est un processus mathématique rigoureux visant à éliminer la **redondance des données** et à prévenir les anomalies de modification (`INSERT`, `UPDATE`, `DELETE`).

Imaginons une table unique qui stockerait l'adresse du client sur chaque ligne de virement bancaire. Si le client déménage, il faudrait mettre à jour des milliers de lignes avec le risque d'en oublier certaines (Incohérence des données). La 3NF résout définitivement ce problème.

### 🔍 Anatomie Technique

**Les 3 Premières Formes Normales (1NF, 2NF, 3NF) :**

```
1NF (Première Forme Normale) :
├── Les valeurs de chaque colonne doivent être ATOMIQUES (indivisibles).
└── Pas de groupes répétés ou de listes stockées dans une seule cellule.
    (Ex: Ne pas stocker "Kinshasa, Gombe, Blvd du 30 Juin" dans une seule chaîne sans structure).

2NF (Deuxième Forme Normale) :
├── Doit être en 1NF.
└── Tout attribut non-clé doit dépendre de la TOTALITÉ de la clé primaire (pas d'une partie de PK composée).

3NF (Troisième Forme Normale) :
├── Doit être en 2NF.
└── Tout attribut non-clé doit dépendre DIRECTEMENT de la clé primaire (Pas de dépendance transitive A -> B -> C).
```

---

## 3) Module — Laboratoire Pratique : Script DDL SQL & Dictionnaire de Données (2h)

### 📖 Narration/Intuition

Traduisons le MLD normalisé du système bancaire BCC en script DDL (Data Definition Language) SQL prêt pour la production avec contraintes d'intégrité strictes (`CHECK`, `FOREIGN KEY`, `NOT NULL`).

### 🔍 Anatomie Technique

**Script DDL PostgreSQL normalisé en 3NF (`schema_bcc_banking.sql`) :**

```sql
-- Dictionnaire et Schéma BDD Bancaire BCC (3NF Strict)

-- 1. Table des Agences
CREATE TABLE agences (
    agence_id SERIAL PRIMARY KEY,
    code_agence VARCHAR(10) UNIQUE NOT NULL,
    nom_agence VARCHAR(100) NOT NULL,
    ville VARCHAR(50) NOT NULL DEFAULT 'Kinshasa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des Clients (1NF, 2NF, 3NF respectées)
CREATE TABLE clients (
    client_id BIGSERIAL PRIMARY KEY,
    numero_national VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table des Comptes (FK vers Clients et Agences)
CREATE TABLE comptes (
    compte_id BIGSERIAL PRIMARY KEY,
    numero_iban VARCHAR(34) UNIQUE NOT NULL,
    client_id BIGINT NOT NULL REFERENCES clients(client_id) ON DELETE RESTRICT,
    agence_id INT NOT NULL REFERENCES agences(agence_id) ON DELETE RESTRICT,
    solde NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    devise VARCHAR(3) NOT NULL DEFAULT 'CDF',
    statut VARCHAR(20) NOT NULL DEFAULT 'ACTIF',
    CONSTRAINT chk_solde_minimum CHECK (solde >= 0.00), -- Pas de découvert non autorisé
    CONSTRAINT chk_statut CHECK (statut IN ('ACTIF', 'BLOCQUE', 'CLOTURE'))
);

-- 4. Table des Transactions (Table de Faits 3NF)
CREATE TABLE transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    compte_source_id BIGINT NOT NULL REFERENCES comptes(compte_id),
    compte_destination_id BIGINT NOT NULL REFERENCES comptes(compte_id),
    montant NUMERIC(15, 2) NOT NULL,
    date_heure TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    type_operation VARCHAR(20) NOT NULL,
    CONSTRAINT chk_montant_positif CHECK (montant > 0.00),
    CONSTRAINT chk_comptes_differents CHECK (compte_source_id <> compte_destination_id)
);
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MCD** | Modèle Conceptuel de Données — Représentation abstraite de haut niveau (Entité-Association) |
| **MLD** | Modèle Logique de Données — Traduction du MCD en tables et clés relationnelles |
| **MPD** | Modèle Physique de Données — Implémentation SQL avec types physiques spécifiques au SGBD |
| **1NF / 2NF / 3NF** | Première / Deuxième / Troisième Forme Normale (Règles de normalisation de Codd) |
| **BCNF** | Boyce-Codd Normal Form — Forme normale stricte renforçant la 3NF |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi la table non-normalisée suivante viole-t-elle la **Troisième Forme Normale (3NF)** et comment la corriger ?
Table `Comptes_Non_Normalises` : `(compte_id [PK], client_id, nom_client, adresse_client, solde)`

**Corrigé :** Dans cette table, la clé primaire est `compte_id`. Les attributs `nom_client` et `adresse_client` dépendent du `client_id`, qui dépend lui-même du `compte_id`. C'est une **dépendance transitive** (`compte_id -> client_id -> nom_client`), ce qui viole la **3NF**. Si un client possède 5 comptes, son nom et son adresse seront répétés 5 fois. Pour corriger et passer en 3NF, on décompose la table en deux :
1. Table `Clients` : `(client_id [PK], nom_client, adresse_client)`
2. Table `Comptes` : `(compte_id [PK], client_id [FK], solde)`

**Exercice 2 :** Dans un schéma relationnel bancaire, que signifie la contrainte `ON DELETE RESTRICT` placée sur une Clé Étrangère (`FOREIGN KEY`) reliant les Comptes aux Clients ?

**Corrigé :** La contrainte `ON DELETE RESTRICT` empêche la suppression d'une ligne dans la table parente (`Clients`) tant qu'il existe des lignes enfants associées dans la table fille (`Comptes`). Si un utilisateur tente d'exécuter `DELETE FROM clients WHERE client_id = 45;` alors que ce client possède encore des comptes bancaires enregistrés, le SGBD bloque la requête et lève une erreur de contrainte d'intégrité référancielle. Cela empêche la création d'enregistrements "orphelins" en base de données.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans la démarche de modélisation de données (Merise), quel modèle traduit les entités et associations sous forme de tables relationnelles, clés primaires (PK) et clés étrangères (FK) ?
- A) MLD (Modèle Logique de Données)
- B) MCD (Modèle Conceptuel de Données)
- C) MPD (Modèle Physique de Données)
- D) HTML

**Réponse : A**

**Q2 :** Quelle forme normale exige que toutes les valeurs stockées dans chaque colonne soient atomiques (indivisibles) sans groupes de valeurs répétés dans une cellule ?
- A) 1NF (Première Forme Normale)
- B) 2NF
- C) 3NF
- D) BCNF

**Réponse : A**

**Q3 :** Comment traduit-on une association de type Many-to-Many (`N,M`) entre deux entités (ex: *Utilisateurs* et *Rôles*) lors du passage au MLD relationnel ?
- A) Par la création d'une table d'association (ou table de jonction) intermédiaire contenant les clés étrangères des deux tables
- B) En supprimant l'une des tables
- C) En fusionnant toutes les colonnes dans un fichier texte
- D) En utilisant une clé USB

**Réponse : A**

**Q4 :** Quelle contrainte SQL garantit qu'une colonne ne peut pas contenir de solde négatif (ex: `solde >= 0`) ?
- A) `CHECK` constraint
- B) `FOREIGN KEY`
- C) `UNIQUE`
- D) `PRIMARY KEY`

**Réponse : A**

**Q5 :** Quelle forme normale élimine les dépendances transitives (A -> B -> C) en s'assurant que tout attribut non-clé dépend uniquement et directement de la clé primaire ?
- A) 3NF (Troisième Forme Normale)
- B) 1NF
- C) 0NF
- D) Forme brute

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
