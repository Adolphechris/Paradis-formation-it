# TOME P4 — Cloud, DevOps & SecOps — Jour 153 (6h) : Sécurité des SGBD, Chiffrement des données (TDE, pgcrypto) & Injections SQL (Prepared Statements)

> [!NOTE]
> **Objectif du jour :** Sécuriser intégralement les bases de données d'une institution financière : chiffrement des données au repos (Transparent Data Encryption - TDE, `pgcrypto`), chiffrement des connexions en transit (TLS/SSL obligatoires), durcissement des accès (Authentication MD5/SCRAM-SHA-256, `pg_hba.conf`), audit des actions privilégiees (`pgAudit`) et prévention absolue des injections SQL via les Prepared Statements et les ORM.
>
> **Compétences visées :** `SEC-05` (A) — Database Hardening & Cryptographie BDD | `SEC-04` (A) — Prévention Injections SQL (OWASP A03)

---

## 1) Module — Sécurisation des Accès & Chiffrement (Transit & Repos) (2h)

### 📖 Narration/Intuition

En 2026, la réglementation bancaire internationale (PCI-DSS v4.0 et exigences COBAC) stipule qu'aucun numéro de carte de paiement ou identifiant bancaire ne doit transiter en clair sur le réseau ni être lisible sur le disque dur des serveurs de la BCC.

Si un individu malveillant s'introduit dans le datacenter et dérobe un disque dur SSD contenant les fichiers de la base de données, les données doivent être totalement illisibles grâce au **chiffrement au repos (Transparent Data Encryption / `pgcrypto`)**. De même, si un attaquant écoute le réseau avec Wireshark, les données en transit doivent être chiffrées par **TLS 1.3**.

### 🔍 Anatomie Technique

**Configuration de la sécurité des connexions dans `pg_hba.conf` :**

```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
# 1. Interdire les connexions non chiffrées depuis l'extérieur (hostssl obligatoire)
hostssl all             all             0.0.0.0/0               scram-sha-256

# 2. Accès application bancaire limité au sous-réseau privé d'application (VPC)
hostssl bcc_rtgs        app_user        10.100.4.0/24           scram-sha-256

# 3. Administrateur limité à l'hôte local via socket Unix
local   all             postgres                                peer
```

---

## 2) Module — Chiffrement Applicatif & Audit avec `pgcrypto` & `pgAudit` (2h)

### 📖 Narration/Intuition

Pour les colonnes ultra-sensibles (mots de passe, numéros de comptes secrets), le chiffrement au niveau de la colonne avec l'extension **`pgcrypto`** garantit que même un administrateur système ayant accès au serveur ne peut pas lire le contenu sans la clé de déchiffrement applicative.

Par ailleurs, **`pgAudit`** enregistre chaque tentative d'accès ou de modification sur les tables financières pour satisfaire aux audits de conformité ISO 27001.

### 3) Anatomie Technique

**Utilisation de `pgcrypto` pour chiffrer les champs sensibles :**

```sql
-- 1. Activer l'extension pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Création de la table avec colonne chiffrée (BYTEA)
CREATE TABLE comptes_secrets (
    compte_id SERIAL PRIMARY KEY,
    titulaire VARCHAR(100) NOT NULL,
    solde_chiffre BYTEA NOT NULL
);

-- 3. Insertion de données chiffrées avec AES (Symmetric Encryption)
INSERT INTO comptes_secrets (titulaire, solde_chiffre)
VALUES ('Banque Commerciale A', pgp_sym_encrypt('15000000.00 USD', 'CléSecreteBCC2026!'));

-- 4. Lecture et déchiffrement des données sensibles
SELECT titulaire, pgp_sym_decrypt(solde_chiffre, 'CléSecreteBCC2026!') AS solde_clair
FROM comptes_secrets;
```

---

## 3) Module — Injections SQL (SQLi) & Prepared Statements (2h)

### 📖 Narration/Intuition

L'**Injection SQL (SQLi)** demeure dans le Top 3 des vulnérabilités OWASP. Elle survient lorsqu'une application concatène directement les saisies de l'utilisateur dans une chaîne de requête SQL.

**Exemple vulnérable :**
```python
# CODE DANGEREUX ! (Concaténation de chaîne)
user_input = "admin' OR '1'='1"
query = "SELECT * FROM users WHERE username = '" + user_input + "' AND password = '" + password + "'"
# La requête exécutée devient : SELECT * FROM users WHERE username = 'admin' OR '1'='1' ...
# L'attaquant se connecte sans mot de passe !
```

### 🔍 Anatomie Technique

**La solution absolue : Requêtes Préparées (Prepared Statements / Parameterized Queries) :**

```python
#!/usr/bin/env python3
"""
Exemple de prévention SQLi avec requêtes préparées dans Python (Psycopg2)
"""
import psycopg2

# Connexion sécurisée avec SSL/TLS
conn = psycopg2.connect(
    dbname="bcc_db",
    user="app_user",
    password="Password123!",
    host="10.100.4.15",
    sslmode="require"
)

cursor = conn.cursor()

# UTILISATION DE REQUÊTES PRÉPARÉES (Séparation stricte du code et des données)
user_input = "admin' OR '1'='1"
safe_query = "SELECT id, username, email FROM users WHERE username = %s"

# Le SGBD traite user_input comme une simple chaîne littérale, PAS comme du code SQL !
cursor.execute(safe_query, (user_input,))
results = cursor.fetchall()

print(f"Nombre de résultats retournés : {len(results)} (Sécurité garantie)")
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SQLi** | SQL Injection — Injection d'instructions SQL malveillantes via les entrées utilisateur |
| **TDE** | Transparent Data Encryption — Chiffrement transparent des fichiers de base de données au repos |
| **SCRAM** | Salted Challenge Response Authentication Mechanism — Algorithme d'authentification robuste |
| **pgAudit** | Extension officielle d'audit de sécurité et traçabilité pour PostgreSQL |
| **pgcrypto** | Extension cryptographique intégrée à PostgreSQL pour le chiffrement symétrique/asymétrique |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi l'utilisation de **Prepared Statements (requêtes paramétrées)** élimine-t-elle 100% des vulnérabilités d'injection SQL ?

**Corrigé :** Dans une requête SQL classique vulnérable, le SGBD reçoit une seule chaîne de caractères contenant à la fois le code SQL et les données utilisateur, et tente de l'analyser (Parsing). Si l'utilisateur insère des caractères spéciaux SQL (`'`, `--`, `UNION`), la structure de l'arbre syntaxique de la requête est modifiée. Avec les **Prepared Statements**, la structure de la requête est envoyée au SGBD et **compilée à l'avance** (pré-analysée). Ensuite, les paramètres utilisateur sont envoyés séparément. Le SGBD traite la saisie utilisateur uniquement comme une **valeur littérale**, sans jamais ré-analyser ni exécuter la saisie comme du code, rendant toute altération de la logique SQL impossible.

**Exercice 2 :** Dans la configuration PostgreSQL `pg_hba.conf`, quelle est la différence entre la méthode d'authentification `md5` et la méthode `scram-sha-256` ?

**Corrigé :** La méthode **`md5`** historique stocke un hash MD5 du mot de passe en base et utilise un challenge simple. Elle est aujourd'hui considérée comme vulnérable aux attaques par dictionnaire et rainbow tables si les hashs sont divulgués. La méthode **`scram-sha-256`** (RFC 7677) est le standard moderne recommandé : elle utilise un salage unique par utilisateur et l'algorithme HMAC-SHA-256, empêchant la réutilisation des hashs et protégeant contre le vol d'identifiants même en cas de capture du trafic réseau.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle vulnérabilité applicative majeure (OWASP Top 10) survient lorsqu'une application concatène directement les saisies utilisateur dans des requêtes SQL ?
- A) SQL Injection (SQLi)
- B) XSS
- C) CSRF
- D) Buffer Overflow

**Réponse : A**

**Q2 :** Quelle est la solution technique fondamentale recommandee par toutes les normes de sécurité pour éradiquer les vulnérabilités d'injection SQL ?
- A) L'utilisation systématique de Prepared Statements (requêtes paramétrées)
- B) L'extinction du serveur
- C) L'utilisation de mots de passe plus longs
- D) Le changement d'adresse IP

**Réponse : A**

**Q3 :** Quelle extension PostgreSQL permet de chiffrer des colonnes spécifiques en base de données avec l'algorithme AES (chiffrement au niveau de la donnée) ?
- A) pgcrypto
- B) pgadmin
- C) psql
- D) pgbench

**Réponse : A**

**Q4 :** Quel fichier de configuration PostgreSQL contrôle les règles d'accès client, l'obligation SSL/TLS et les méthodes d'authentification réseau ?
- A) `pg_hba.conf`
- B) `index.html`
- C) `hosts.txt`
- D) `config.xml`

**Réponse : A**

**Q5 :** Quelle méthode d'authentification recommandée dans PostgreSQL offre le niveau de sécurité le plus élevé pour la vérification des mots de passe sur le réseau ?
- A) scram-sha-256
- B) trust
- C) plain-text
- D) rot13

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
