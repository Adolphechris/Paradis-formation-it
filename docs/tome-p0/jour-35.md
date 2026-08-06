# TOME P0 — Socle Universel — Jour 35 (6h) : SQL Avancé & Sécurité des Données — Injection SQL & Protection

> [!NOTE]
> **Objectif du jour :** Maîtriser les commandes SQL avancées (INSERT, UPDATE, DELETE, transactions, vues, contraintes) et comprendre l'une des vulnérabilités les plus critiques du web : l'injection SQL (SQLi). Apprendre à reconnaître du code vulnérable et à le sécuriser.
>
> **Compétences visées :** `BIT-06` (A) — SQL avancé | `SEC-05` (A) — Sécurité des applications et des données

---

## 1) Module — Manipulation des Données : INSERT, UPDATE, DELETE & Transactions (2h)

### 📖 Narration/Intuition

Si SELECT permet de **lire** les données, les commandes DML (Data Manipulation Language) permettent de les **modifier**. Ces opérations doivent être exécutées avec précision et dans le cadre de **transactions** — des mécanismes qui garantissent qu'une série d'opérations est soit entièrement réalisée, soit entièrement annulée.

Imaginez un virement bancaire : débiter un compte ET créditer l'autre doivent se faire ensemble. Si l'un échoue, l'autre ne doit pas se valider. C'est le rôle des transactions.

### 🔍 Anatomie Technique

**INSERT — Insérer des données :**

```sql
-- Insertion simple (colonnes explicites — TOUJOURS recommandé)
INSERT INTO employes (nom, prenom, service, salaire, date_entree)
VALUES ('Nkosi', 'David', 'IT', 960000, '2024-02-01');

-- Insertion multiple (plus efficace qu'un INSERT par ligne)
INSERT INTO employes (nom, prenom, service, salaire, date_entree)
VALUES
    ('Kamba', 'Esther', 'RH', 730000, '2024-02-05'),
    ('Mwale', 'Pierre', 'Finance', 850000, '2024-02-10'),
    ('Diko', 'Rose', 'IT', 890000, '2024-03-01');

-- Insertion depuis une requête SELECT
INSERT INTO employes_archive (nom, prenom, service, salaire)
SELECT nom, prenom, service, salaire
FROM employes
WHERE date_entree < '2021-01-01';  -- Archiver les anciens employés
```

**UPDATE — Modifier des données :**

```sql
-- TOUJOURS vérifier le WHERE avant d'exécuter un UPDATE !
-- Sans WHERE → modification de TOUTES les lignes !

-- Mise à jour d'un employé spécifique (par PK)
UPDATE employes
SET salaire = salaire * 1.10  -- Augmentation de 10%
WHERE id = 3;

-- Mise à jour conditionnelle
UPDATE employes
SET service = 'IT-Senior'
WHERE service = 'IT' AND salaire > 900000;

-- Mise à jour avec sous-requête
UPDATE employes
SET salaire = (SELECT AVG(salaire) * 1.05 FROM employes)
WHERE service = 'RH' AND salaire < (SELECT AVG(salaire) FROM employes);

-- ❌ DANGEREUX : UPDATE sans WHERE
-- UPDATE employes SET salaire = 0;  -- Remet tous les salaires à 0 !
```

**DELETE — Supprimer des données :**

```sql
-- Suppression ciblée (TOUJOURS avec WHERE sauf intention délibérée)
DELETE FROM employes WHERE id = 5;

-- Suppression conditionnelle
DELETE FROM connexions_ssh
WHERE horodatage < '2024-01-01' AND statut = 'ECHEC';

-- TRUNCATE (vide entièrement la table, plus rapide que DELETE sans WHERE)
-- DELETE FROM table;   → supprime ligne par ligne, loggue chaque suppression
-- TRUNCATE TABLE table; → réinitialise la table d'un coup (MySQL/PostgreSQL)
```

**Transactions ACID :**

```sql
-- ACID : Atomicité, Cohérence, Isolation, Durabilité

-- Exemple : virement entre deux comptes
BEGIN TRANSACTION;  -- Début de la transaction

    -- Étape 1 : Débiter le compte source
    UPDATE comptes SET solde = solde - 500000
    WHERE numero = 'BCC-001';
    
    -- Vérification : le solde ne doit pas être négatif
    -- (dans une vraie app, cette vérification serait dans le code applicatif)
    
    -- Étape 2 : Créditer le compte destination
    UPDATE comptes SET solde = solde + 500000
    WHERE numero = 'BCC-002';

COMMIT;  -- Valider toutes les opérations → rendu permanent

-- En cas d'erreur, on annule tout :
-- ROLLBACK;  -- Annule toutes les opérations depuis le dernier BEGIN

-- Exemple avec ROLLBACK
BEGIN TRANSACTION;
    DELETE FROM employes WHERE service = 'IT';  -- Erreur ! Trop de suppressions
ROLLBACK;  -- Annulation : les employés IT sont restaurés
```

**Contraintes d'intégrité :**

```sql
CREATE TABLE comptes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    numero      TEXT    UNIQUE NOT NULL,          -- Valeur unique obligatoire
    proprietaire TEXT   NOT NULL,
    solde       REAL    NOT NULL DEFAULT 0.0
                        CHECK (solde >= 0),        -- Solde jamais négatif
    statut      TEXT    NOT NULL DEFAULT 'actif'
                        CHECK (statut IN ('actif', 'bloque', 'ferme')),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

---

## 2) Module — Injection SQL : Reconnaître & Protéger (2h)

### 📖 Narration/Intuition

L'**injection SQL** (SQLi) est la vulnérabilité #1 des applications web selon l'OWASP Top 10 depuis des années. Elle survient quand une application web construit une requête SQL en **concatenant directement** des données fournies par l'utilisateur, sans les valider ni les nettoyer.

Le résultat : un attaquant peut modifier la structure de la requête pour contourner l'authentification, extraire des données sensibles, ou même effacer toute la base de données.

**L'analogie du cuisinier :** Imaginez que vous dites au cuisinier "Prépare-moi un plat avec [ingrédient du client]". Un client malveillant écrit "rien. Et apporte-moi aussi tous les plats de la cuisine et les clés du restaurant". Le cuisinier exécute littéralement l'instruction sans analyser son sens.

### 🔍 Anatomie Technique

**Code VULNÉRABLE — Concaténation directe :**

```python
import sqlite3

def connexion_vulnerable(username, password):
    """
    ❌ CODE DANGEREUX — NE JAMAIS FAIRE EN PRODUCTION
    Concaténation directe de l'entrée utilisateur dans la requête SQL.
    """
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    
    # Construction dangereuse de la requête par concaténation
    query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'"
    
    print(f"Requête exécutée : {query}")
    cursor.execute(query)
    result = cursor.fetchone()
    conn.close()
    return result is not None  # True si authentification réussie

# Usage normal
connexion_vulnerable("alice", "monmotdepasse")
# → SELECT * FROM users WHERE username = 'alice' AND password = 'monmotdepasse'

# ─── ATTAQUE : Bypass d'authentification ─────────────────────────
# Nom d'utilisateur fourni par l'attaquant :
username_malveillant = "admin' --"
# Le -- est un commentaire SQL qui annule le reste de la requête

connexion_vulnerable(username_malveillant, "n_importe_quoi")
# → SELECT * FROM users WHERE username = 'admin' --' AND password = '...'
# Traduit : sélectionner admin SANS vérifier le mot de passe !
# Résultat : accès admin sans connaître le mot de passe

# ─── ATTAQUE : Extraction de données via UNION ────────────────────
username_union = "' UNION SELECT id, username, password, 4 FROM users --"
connexion_vulnerable(username_union, "")
# → SELECT * FROM users WHERE username = '' UNION SELECT id,username,password,4 FROM users --'
# Retourne TOUS les utilisateurs avec leurs mots de passe !

# ─── ATTAQUE : Destruction de données ─────────────────────────────
username_drop = "'; DROP TABLE users; --"
connexion_vulnerable(username_drop, "")
# → SELECT * FROM users WHERE username = ''; DROP TABLE users; --'
# Supprime toute la table users !
```

**Code SÉCURISÉ — Requêtes préparées (paramètres liés) :**

```python
def connexion_securisee(username, password):
    """
    ✅ CODE SÉCURISÉ — Requêtes préparées avec paramètres liés.
    
    Le ? est un placeholder : SQLite échappe automatiquement les caractères
    spéciaux (apostrophes, guillemets, etc.) dans les valeurs passées.
    Les paramètres ne peuvent PAS modifier la structure de la requête.
    """
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    
    # ✅ Les ? sont des placeholders — les valeurs sont passées séparément
    query = "SELECT * FROM users WHERE username = ? AND password = ?"
    
    # La valeur est toujours traitée comme une DONNÉE, jamais comme du code SQL
    cursor.execute(query, (username, password))
    result = cursor.fetchone()
    conn.close()
    return result is not None

# Même avec une entrée malveillante, la requête préparée est sécurisée :
connexion_securisee("admin' --", "n_importe_quoi")
# Requête exécutée : SELECT * FROM users WHERE username = ? AND password = ?
# Valeurs : ("admin' --", "n_importe_quoi")
# SQLite cherche littéralement un user nommé "admin' --" → Aucun résultat
```

**ORM — Couche d'abstraction supplémentaire :**

```python
# SQLAlchemy : ORM (Object-Relational Mapper) pour Python
# Un ORM génère automatiquement des requêtes préparées

from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class Utilisateur(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)

# Connexion sécurisée via ORM
engine = create_engine("sqlite:///users.db")
Session = sessionmaker(bind=engine)

def authentifier_orm(username, password_hash):
    """Authentification via ORM — toujours sécurisé contre SQLi."""
    with Session() as session:
        # L'ORM génère une requête préparée automatiquement
        user = session.query(Utilisateur).filter_by(
            username=username,
            password_hash=password_hash
        ).first()
        return user is not None
```

**Identification d'un code vulnérable — checklist de lecture :**

```python
# ❌ Signes de vulnérabilité SQLi à repérer dans le code :

# 1. Concaténation directe avec +
query = "SELECT * FROM users WHERE id = " + user_id

# 2. Formatage de chaîne avec %s ou .format()
query = "SELECT * FROM users WHERE name = '%s'" % username
query = "SELECT * FROM users WHERE name = '{}'".format(username)

# 3. f-strings avec des entrées non validées
query = f"DELETE FROM sessions WHERE token = '{token}'"

# ✅ Signes de code sécurisé à reconnaître :
# 1. Paramètres ? ou %s avec tuple séparé (SQLite / psycopg2)
cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))

# 2. Utilisation d'un ORM
session.query(User).filter_by(id=user_id).first()

# 3. Validation et cast du type d'entrée
user_id = int(user_id)  # Lève ValueError si pas un entier → protection partielle
```

---

## 3) Module — Vues, Triggers & Fonctions Avancées (2h)

### 📖 Narration/Intuition

Les **vues** simplifient l'accès aux données complexes. Les **triggers** automatisent des actions en réponse à des événements de base de données. Ces mécanismes sont utilisés pour implémenter la logique métier directement dans la base de données.

### 🔍 Anatomie Technique

**Vues (VIEW) :**

```sql
-- Créer une vue pour simplifier une requête complexe
CREATE VIEW employes_it_senior AS
SELECT 
    e.id,
    e.nom,
    e.prenom,
    e.salaire,
    ROUND(e.salaire / 12, 0) AS salaire_mensuel
FROM employes e
WHERE e.service = 'IT' AND e.salaire > 850000;

-- Utiliser la vue comme une table
SELECT * FROM employes_it_senior ORDER BY salaire DESC;

-- Vue pour l'audit de sécurité
CREATE VIEW v_echecs_recents AS
SELECT ip_source, utilisateur, COUNT(*) AS tentatives
FROM connexions_ssh
WHERE statut = 'ECHEC'
  AND horodatage > datetime('now', '-24 hours')
GROUP BY ip_source, utilisateur
HAVING COUNT(*) > 5;
```

**Triggers (déclencheurs) :**

```sql
-- Trigger : enregistrer les modifications de salaire dans un log
CREATE TABLE log_salaires (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    employe_id  INTEGER NOT NULL,
    ancien_salaire REAL,
    nouveau_salaire REAL,
    modifie_le  TEXT DEFAULT (datetime('now')),
    modifie_par TEXT DEFAULT (CURRENT_USER)
);

CREATE TRIGGER log_modification_salaire
AFTER UPDATE OF salaire ON employes
FOR EACH ROW
WHEN OLD.salaire != NEW.salaire  -- Seulement si le salaire change vraiment
BEGIN
    INSERT INTO log_salaires (employe_id, ancien_salaire, nouveau_salaire)
    VALUES (NEW.id, OLD.salaire, NEW.salaire);
END;

-- Désormais, chaque UPDATE de salaire est automatiquement journalisé
UPDATE employes SET salaire = 1000000 WHERE id = 1;
SELECT * FROM log_salaires;  -- Affiche le log de la modification
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SQLi** | SQL Injection — injection SQL |
| **ACID** | Atomicité, Cohérence, Isolation, Durabilité — propriétés des transactions |
| **ORM** | Object-Relational Mapper — outil de mapping objet-relationnel |
| **DDL** | Data Definition Language — CREATE, ALTER, DROP |
| **DML** | Data Manipulation Language — INSERT, UPDATE, DELETE, SELECT |
| **OWASP** | Open Web Application Security Project — référentiel des vulnérabilités web |
| **CVE** | Common Vulnerabilities and Exposures — base de données des vulnérabilités connues |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Ce code Python est-il vulnérable à l'injection SQL ? Expliquez et corrigez :

```python
def chercher_employe(service):
    cursor.execute(f"SELECT * FROM employes WHERE service = '{service}'")
    return cursor.fetchall()
```

**Corrigé :** Oui, vulnérable — utilise une f-string avec une valeur non validée. Correction :
```python
cursor.execute("SELECT * FROM employes WHERE service = ?", (service,))
```

**Exercice 2 :** Écrivez une transaction qui transfère un employé d'un service à un autre ET journalise ce changement dans une table `log_transferts`.

**Corrigé :**
```sql
BEGIN TRANSACTION;
    UPDATE employes SET service = 'Finance' WHERE id = 3;
    INSERT INTO log_transferts (employe_id, ancien_service, nouveau_service, date_transfert)
    VALUES (3, 'IT', 'Finance', datetime('now'));
COMMIT;
```

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Qu'est-ce qu'une injection SQL ?
- A) Un bug qui ralentit les requêtes SQL
- B) Une attaque qui injecte du code SQL malveillant via les entrées utilisateur pour manipuler la base de données
- C) Une méthode d'optimisation des requêtes
- D) Un outil de sauvegarde de base de données

**Réponse : B**

**Q2 :** Quelle solution protège contre l'injection SQL ?
- A) Chiffrer la base de données
- B) Utiliser des requêtes préparées avec des paramètres liés
- C) Désactiver les logs SQL
- D) Utiliser des connexions SSL/TLS

**Réponse : B**

**Q3 :** Que fait ROLLBACK dans une transaction SQL ?
- A) Valide et rend permanentes toutes les modifications
- B) Annule toutes les modifications depuis le dernier BEGIN
- C) Supprime la table courante
- D) Recrée la base de données depuis zéro

**Réponse : B**

**Q4 :** Quelle contrainte SQL garantit qu'une colonne ne peut pas contenir deux fois la même valeur ?
- A) PRIMARY KEY uniquement
- B) NOT NULL
- C) UNIQUE
- D) DEFAULT

**Réponse : C** — `UNIQUE` interdit les doublons. PRIMARY KEY implique aussi UNIQUE mais ne peut être qu'une par table.

**Q5 :** Un attaquant entre `' OR '1'='1` comme mot de passe dans un formulaire de connexion vulnérable. Que se passe-t-il ?
- A) La connexion échoue car le mot de passe est invalide
- B) Une erreur SQL est générée et le système plante
- C) La requête retourne tous les utilisateurs car `'1'='1'` est toujours vrai — l'attaquant se connecte
- D) L'injection est détectée et bloquée automatiquement par SQLite

**Réponse : C** — La requête devient `WHERE password = '' OR '1'='1'` → toujours vrai → authentification bypass.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
