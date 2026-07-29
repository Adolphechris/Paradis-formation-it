# TOME P2 — Jour 06 (12h) : SQL & Bases de Données Relationnelles — La Mémoire Structurée des Entreprises

> [!NOTE]
> **Objectif de la journée** : Comprendre comment les grandes institutions (banques, hôpitaux, entreprises) stockent, organisent et interrogent des millions de données. À la fin de ce cours, vous saurez créer des bases de données, insérer des données, les interroger avec précision et les mettre à jour — des compétences indispensables pour tout professionnel IT.

---

## 1) C'est quoi une Base de Données Relationnelle ? (1h)

### 📖 1.1 La Bibliothèque Géante et Organisée

Imaginez la Banque Centrale du Congo avec des millions de comptes clients, des milliers de transactions journalières, et des centaines d'agents. Comment conserver et retrouver instantanément une information précise parmi des dizaines de millions d'enregistrements ?

La réponse : **une Base de Données Relationnelle (BDR)**. C'est comme une bibliothèque ultra-organisée avec des catalogues croisés : vous pouvez chercher un livre par auteur, par titre, par année, par thème — ou par n'importe quelle combinaison.

**Pourquoi "Relationnelle" ?** Parce que les données sont organisées en **tables** (comme des feuilles Excel très strictes) qui peuvent être **reliées entre elles** via des identifiants communs (les **clés étrangères**).

### 🔍 1.2 Les Composants Fondamentaux

| Concept | Définition | Exemple BCC |
|---------|-----------|-------------|
| **Base de données** | Conteneur global | `bcc_operations` |
| **Table** | Ensemble de lignes de même nature | `comptes`, `transactions`, `agents` |
| **Colonne (champ)** | Un attribut d'une entité | `nom`, `solde`, `date_ouverture` |
| **Ligne (enregistrement)** | Un élément unique dans la table | Compte de Jean Mukendi |
| **Clé primaire (PK)** | Identifiant unique non nul | `id_compte = 10042` |
| **Clé étrangère (FK)** | Lien entre deux tables | `id_client` dans la table `comptes` |

---

## 2) PostgreSQL : Le SGBD de Référence Professionnelle (1h)

### 🛠️ 2.1 Installation et Connexion

```bash
# Installation sous Ubuntu
sudo apt update && sudo apt install postgresql

# Connexion à l'interface PostgreSQL
sudo -u postgres psql

# Créer une base de données
CREATE DATABASE bcc_support;

# Se connecter à la base
\c bcc_support

# Quitter
\q
```

---

## 3) SQL : Le Langage de Requête Universel (5h)

### 🛠️ 3.1 Créer des Tables — `CREATE TABLE`

```sql
-- Créer la table des agents IT
CREATE TABLE agents (
    id          SERIAL PRIMARY KEY,          -- Identifiant unique auto-incrémenté
    nom         VARCHAR(100) NOT NULL,       -- Nom obligatoire (max 100 caractères)
    email       VARCHAR(150) UNIQUE NOT NULL,-- Email unique et obligatoire
    departement VARCHAR(50),
    date_embauche DATE DEFAULT CURRENT_DATE  -- Date du jour par défaut
);

-- Créer la table des tickets (reliée aux agents)
CREATE TABLE tickets (
    id          SERIAL PRIMARY KEY,
    agent_id    INTEGER REFERENCES agents(id), -- Clé étrangère
    type_incident VARCHAR(50) NOT NULL,
    description TEXT,
    statut      VARCHAR(20) DEFAULT 'Ouvert',
    cree_le     TIMESTAMP DEFAULT NOW()
);
```

### 🛠️ 3.2 Insérer des Données — `INSERT INTO`

```sql
INSERT INTO agents (nom, email, departement)
VALUES
    ('Jean-Baptiste Mukendi', 'jb.mukendi@bcc.cd', 'Réseau'),
    ('Marie Bongo',           'marie.bongo@bcc.cd', 'Support'),
    ('Paul Kimba',            'p.kimba@bcc.cd',     'Sécurité');
```

### 🛠️ 3.3 Interroger des Données — `SELECT`

```sql
-- Sélectionner tous les agents
SELECT * FROM agents;

-- Sélectionner seulement le nom et email
SELECT nom, email FROM agents;

-- Filtrer avec WHERE
SELECT nom, email
FROM agents
WHERE departement = 'Réseau';

-- Trier par nom alphabétiquement
SELECT nom, departement
FROM agents
ORDER BY nom ASC;

-- Compter le nombre d'agents par département
SELECT departement, COUNT(*) AS nombre_agents
FROM agents
GROUP BY departement
ORDER BY nombre_agents DESC;
```

### 🛠️ 3.4 Les Jointures — Relier des Tables — `JOIN`

```sql
-- Afficher les tickets avec le nom de l'agent associé
SELECT
    t.id AS ticket_id,
    a.nom AS agent,
    t.type_incident,
    t.statut,
    t.cree_le
FROM tickets t
INNER JOIN agents a ON t.agent_id = a.id
WHERE t.statut = 'Ouvert'
ORDER BY t.cree_le DESC;
```

> [!TIP]
> `INNER JOIN` retourne uniquement les lignes qui ont une correspondance dans les deux tables. C'est le type de jointure le plus courant.

### 🛠️ 3.5 Mettre à Jour et Supprimer — `UPDATE` & `DELETE`

```sql
-- Fermer un ticket
UPDATE tickets
SET statut = 'Fermé'
WHERE id = 5;

-- Supprimer un ticket annulé
DELETE FROM tickets
WHERE id = 3 AND statut = 'Annulé';
```

> [!WARNING]
> Un `DELETE FROM tickets;` sans clause `WHERE` **supprime TOUTE la table**. Toujours vérifier votre clause `WHERE` avec un `SELECT` avant d'exécuter un `DELETE` ou `UPDATE` massif.

---

## 4) Transactions ACID : La Garantie de Fiabilité (2h)

### 📖 4.1 Pourquoi les Transactions ?

Imaginez un virement bancaire : on débite le compte A et on crédite le compte B. Si le système plante entre les deux opérations, le débit a eu lieu mais pas le crédit. L'argent s'est évaporé !

Les **transactions ACID** garantissent que soit les deux opérations réussissent ensemble, soit aucune des deux n'est appliquée.

```sql
BEGIN;  -- Démarrer la transaction

UPDATE comptes SET solde = solde - 10000 WHERE id = 1001;  -- Débiter compte A
UPDATE comptes SET solde = solde + 10000 WHERE id = 1002;  -- Créditer compte B

COMMIT;  -- Valider définitivement les deux opérations
-- OU
ROLLBACK;  -- Annuler tout en cas d'erreur
```

---

## 🏋️ Exercices Pratiques & Corrigés

### Exercice 1 : Créer et Peupler une Table
Créez une table `incidents_reseau` avec les colonnes `id`, `titre`, `severite` (1-5), `resolu` (boolean) et insérez 3 incidents.
- **Corrigé** :
  ```sql
  CREATE TABLE incidents_reseau (
      id       SERIAL PRIMARY KEY,
      titre    VARCHAR(200) NOT NULL,
      severite INTEGER CHECK (severite BETWEEN 1 AND 5),
      resolu   BOOLEAN DEFAULT FALSE
  );

  INSERT INTO incidents_reseau (titre, severite) VALUES
      ('Perte de connexion salle des marchés', 5),
      ('Lenteur réseau 3ème étage', 3),
      ('Imprimante hors ligne bureau 12', 1);
  ```

---

## ❓ Banque de Questions & Test du Jour 06

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
