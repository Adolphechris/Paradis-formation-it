# TOME P2 — Réseaux & Télécoms — Jour 75 (6h) : Bases de Données & Sécurité SQL

> [!NOTE]
> **Objectif du jour :** Maîtriser PostgreSQL en production : conception de schémas, indexation avancée, transactions, contrôle d'accès (rôles et privilèges), chiffrement des données au repos (TDE) et sauvegardes sécurisées. Contexte BCC : bases de données bancaires haute disponibilité et conformité DPDP.
>
> **Compétences visées :** `BIT-06` (A) — Bases de Données | `SEC-03` (A) — Sécurité des Données

---

## 1) Module — PostgreSQL Avancé : Schémas, Rôles & Privilèges (2h)

### 📖 Narration/Intuition

La base de données est le coffre-fort de l'institution bancaire. Dans une BDD PostgreSQL bien configurée, l'application web n'a pas accès à toutes les tables — elle n'a que les droits stricts dont elle a besoin (principe du moindre privilège). Un compte de rapport ne peut que lire, pas écrire. Un compte de backup peut tout exporter mais pas modifier les données.

### 🔍 Anatomie Technique

**Architecture des rôles PostgreSQL pour une banque :**

```sql
-- ─── Connexion en tant que superadmin ───────────────────────────────────────
-- psql -U postgres -d bcc_db

-- 1. Créer la base de données
CREATE DATABASE bcc_db
    ENCODING 'UTF8'
    LC_COLLATE 'fr_CD.UTF-8'
    LC_CTYPE 'fr_CD.UTF-8'
    TEMPLATE template0;

-- 2. Créer les rôles (sans mot de passe = rôles de groupe)
CREATE ROLE bcc_readonly;          -- Lecture seule (rapports, audit)
CREATE ROLE bcc_app;               -- Application web (CRUD limité)
CREATE ROLE bcc_dba;               -- Administration DB (DBA)
CREATE ROLE bcc_backup;            -- Backup uniquement

-- 3. Créer les utilisateurs applicatifs (avec connexion)
CREATE USER api_user PASSWORD 'Mdp_Api_Très_Sécurisé_2024!';
CREATE USER report_user PASSWORD 'Mdp_Report_Sécurisé_2024!';
CREATE USER backup_user PASSWORD 'Mdp_Backup_Sécurisé_2024!';

-- Assigner les rôles
GRANT bcc_app TO api_user;
GRANT bcc_readonly TO report_user;
GRANT bcc_backup TO backup_user;

-- 4. Privileges sur le schéma
GRANT USAGE ON SCHEMA public TO bcc_readonly, bcc_app, bcc_backup;

-- Rôle lecture seule : SELECT uniquement
GRANT SELECT ON ALL TABLES IN SCHEMA public TO bcc_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO bcc_readonly;

-- Rôle application : CRUD sur les tables applicatives (pas les tables système)
GRANT SELECT, INSERT, UPDATE ON TABLE comptes, transactions, clients TO bcc_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO bcc_app;

-- Rôle backup : peut lire toutes les tables pour l'export
GRANT SELECT ON ALL TABLES IN SCHEMA public TO bcc_backup;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO bcc_backup;

-- Révoquer les droits public par défaut (sécurité renforcée)
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
```

**Conception de schéma bancaire optimisé :**

```sql
-- Schéma de base pour une table de transactions bancaires

-- Extension pour les UUID (meilleur que les SERIAL pour les IDs distribués)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table comptes
CREATE TABLE comptes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_compte   VARCHAR(20) UNIQUE NOT NULL,
    proprietaire_id UUID NOT NULL REFERENCES clients(id),
    type_compte     VARCHAR(20) NOT NULL CHECK (type_compte IN ('courant', 'epargne', 'depot')),
    solde           NUMERIC(15, 2) NOT NULL DEFAULT 0.00
                        CHECK (solde >= 0),             -- Pas de découvert sans autorisation
    devise          CHAR(3) NOT NULL DEFAULT 'CDF',     -- Code ISO 4217
    statut          VARCHAR(10) NOT NULL DEFAULT 'actif'
                        CHECK (statut IN ('actif', 'bloqué', 'clôturé')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table transactions avec audit complet
CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compte_debit    UUID REFERENCES comptes(id),        -- NULL si dépôt externe
    compte_credit   UUID REFERENCES comptes(id),        -- NULL si retrait externe
    montant         NUMERIC(15, 2) NOT NULL CHECK (montant > 0),
    type_tx         VARCHAR(20) NOT NULL
                        CHECK (type_tx IN ('virement', 'depot', 'retrait', 'frais')),
    reference       VARCHAR(50) UNIQUE NOT NULL,        -- Référence unique (idempotence)
    statut          VARCHAR(15) NOT NULL DEFAULT 'en_attente'
                        CHECK (statut IN ('en_attente', 'validé', 'rejeté', 'annulé')),
    initiateur_id   UUID NOT NULL,                      -- Qui a initié la transaction
    validateur_id   UUID,                               -- Qui a validé (4-eyes principle)
    raison          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    validated_at    TIMESTAMPTZ
);

-- Index optimisés pour les requêtes fréquentes
CREATE INDEX CONCURRENTLY idx_comptes_proprietaire ON comptes(proprietaire_id);
CREATE INDEX CONCURRENTLY idx_transactions_compte_debit ON transactions(compte_debit);
CREATE INDEX CONCURRENTLY idx_transactions_compte_credit ON transactions(compte_credit);
CREATE INDEX CONCURRENTLY idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX CONCURRENTLY idx_transactions_statut ON transactions(statut) WHERE statut = 'en_attente';

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_comptes
    BEFORE UPDATE ON comptes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 2) Module — Transactions ACID & Intégrité des Données (2h)

### 📖 Narration/Intuition

Une transaction bancaire doit être **atomique** : soit les deux opérations (débit + crédit) réussissent ensemble, soit aucune des deux ne s'exécute. Sans transaction ACID, un crash serveur en plein virement pourrait débiter le compte source sans créditer le compte destination — une perte d'argent catastrophique.

### 🔍 Anatomie Technique

**Transactions ACID en PostgreSQL :**

```sql
-- ACID = Atomicité, Cohérence, Isolation, Durabilité

-- Exemple : Virement sécurisé entre deux comptes
BEGIN;  -- Début de la transaction

-- Vérifications pré-virement
DO $$
DECLARE
    v_solde_source NUMERIC;
    v_montant NUMERIC := 500000;  -- 500 000 CDF
    v_ref VARCHAR := 'TRX-2024-001234';
BEGIN
    -- Verrou pessimiste sur le compte source (évite les double-dépenses)
    SELECT solde INTO v_solde_source
    FROM comptes
    WHERE numero_compte = 'BCC-00001234'
    FOR UPDATE;  -- Pose un verrou d'écriture

    IF v_solde_source < v_montant THEN
        RAISE EXCEPTION 'Solde insuffisant : % CDF disponibles, % CDF requis',
            v_solde_source, v_montant;
    END IF;
    
    -- Vérifier l'idempotence (doublon de transaction ?)
    IF EXISTS (SELECT 1 FROM transactions WHERE reference = v_ref) THEN
        RAISE EXCEPTION 'Transaction % déjà traitée', v_ref;
    END IF;
    
    -- Débit du compte source
    UPDATE comptes
    SET solde = solde - v_montant
    WHERE numero_compte = 'BCC-00001234';
    
    -- Crédit du compte destination
    UPDATE comptes
    SET solde = solde + v_montant
    WHERE numero_compte = 'BCC-00009876';
    
    -- Enregistrement de la transaction
    INSERT INTO transactions (compte_debit, compte_credit, montant, type_tx, reference, statut, initiateur_id)
    VALUES (
        (SELECT id FROM comptes WHERE numero_compte = 'BCC-00001234'),
        (SELECT id FROM comptes WHERE numero_compte = 'BCC-00009876'),
        v_montant,
        'virement',
        v_ref,
        'validé',
        '00000000-0000-0000-0000-000000000001'
    );
END $$;

COMMIT;  -- Valider toutes les opérations (ou ROLLBACK en cas d'erreur)
```

**Indexation avancée et performance :**

```sql
-- Index partiel (sur un sous-ensemble de lignes) — très efficace
CREATE INDEX idx_tx_en_attente ON transactions(created_at)
    WHERE statut = 'en_attente';
-- Ne indexe que les transactions en attente, pas les 10 millions déjà validées

-- Index de couverture (covering index) — évite les lectures de table
CREATE INDEX idx_comptes_lookup ON comptes(numero_compte)
    INCLUDE (solde, statut, devise);
-- Une requête sur numero_compte récupère solde/statut/devise sans lire la table

-- Analyser les requêtes lentes
EXPLAIN ANALYZE
    SELECT c.numero_compte, c.solde, count(t.id) as nb_tx
    FROM comptes c
    LEFT JOIN transactions t ON t.compte_debit = c.id
    WHERE c.statut = 'actif'
    GROUP BY c.id
    ORDER BY nb_tx DESC
    LIMIT 20;
-- Regarder le coût estimé et réel — identifier les Seq Scan → ajouter des index
```

---

## 3) Module — Sécurité PostgreSQL : Chiffrement & Sauvegardes (2h)

### 📖 Narration/Intuition

La **conformité DPDP** (Data Protection and Data Privacy) et **PCI-DSS** exigent que les données sensibles soient chiffrées au repos et en transit. PostgreSQL offre des mécanismes natifs pour le chiffrement au niveau des colonnes (pgcrypto) et le chiffrement au niveau du système de fichiers (dm-crypt, LUKS).

### 🔍 Anatomie Technique

**Chiffrement des données sensibles (pgcrypto) :**

```sql
-- Activer l'extension pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Chiffrement symétrique des données sensibles (AES)
-- ❌ JAMAIS stocker les données bancaires en clair

-- Table clients avec données chiffrées
CREATE TABLE clients (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Données personnelles chiffrées (format bytea)
    nom_chiffré     BYTEA,     -- Chiffré avec pgcrypto
    prenom_chiffré  BYTEA,
    nni_chiffré     BYTEA,     -- Numéro National d'Identification
    -- Données non sensibles en clair
    date_naissance  DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insérer avec chiffrement
INSERT INTO clients (nom_chiffré, prenom_chiffré, nni_chiffré, date_naissance)
VALUES (
    pgp_sym_encrypt('MBEKI', 'clé-de-chiffrement-256-bits-sécurisée'),
    pgp_sym_encrypt('Jean', 'clé-de-chiffrement-256-bits-sécurisée'),
    pgp_sym_encrypt('CD1234567', 'clé-de-chiffrement-256-bits-sécurisée'),
    '1985-03-15'
);

-- Lire avec déchiffrement (seulement les rôles autorisés)
SELECT
    pgp_sym_decrypt(nom_chiffré, 'clé-de-chiffrement-256-bits-sécurisée')::TEXT AS nom,
    pgp_sym_decrypt(prenom_chiffré, 'clé-de-chiffrement-256-bits-sécurisée')::TEXT AS prenom,
    date_naissance
FROM clients;
```

**Sauvegardes PostgreSQL sécurisées :**

```bash
#!/bin/bash
# backup-postgres.sh — Script de sauvegarde chiffrée BCC
set -euo pipefail

DB_HOST="localhost"
DB_NAME="bcc_db"
DB_USER="backup_user"
BACKUP_DIR="/var/backups/bcc-postgres"
RETENTION_DAYS=30
GPG_KEY_ID="backup@bcc.cd"   # Clé GPG du responsable backup

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/bcc_db_${TIMESTAMP}.sql.gz.gpg"
LOG_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.log"

echo "[$(date)] Début sauvegarde PostgreSQL..." | tee "$LOG_FILE"

# 1. Dump complet + compression + chiffrement GPG en pipeline
pg_dump \
    -h "$DB_HOST" \
    -U "$DB_USER" \
    -Fp \                              # Format texte (portable)
    --no-owner \                       # Pas de SET OWNER (portabilité)
    --no-acl \                         # Pas de GRANT/REVOKE
    "$DB_NAME" | \
    gzip -9 | \
    gpg --batch --yes \
        --recipient "$GPG_KEY_ID" \
        --encrypt \
        --output "$BACKUP_FILE"

echo "[$(date)] Backup créé : $BACKUP_FILE ($(du -sh $BACKUP_FILE | cut -f1))" | tee -a "$LOG_FILE"

# 2. Vérification de l'intégrité du backup
sha256sum "$BACKUP_FILE" >> "$BACKUP_DIR/checksums.txt"
echo "[$(date)] Checksum calculé et enregistré." | tee -a "$LOG_FILE"

# 3. Test de restauration (sur DB de test)
gpg --batch --decrypt "$BACKUP_FILE" | \
    gunzip | \
    psql -h localhost -U backup_user bcc_test_restore \
    > /dev/null 2>&1 && \
    echo "[$(date)] Test de restauration : SUCCÈS" | tee -a "$LOG_FILE" || \
    echo "[$(date)] Test de restauration : ÉCHEC !" | tee -a "$LOG_FILE"

# 4. Nettoyage des anciens backups
find "$BACKUP_DIR" -name "*.gpg" -mtime +$RETENTION_DAYS -delete
echo "[$(date)] Backups > $RETENTION_DAYS jours supprimés." | tee -a "$LOG_FILE"

echo "[$(date)] Sauvegarde terminée avec succès." | tee -a "$LOG_FILE"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ACID** | Atomicity, Consistency, Isolation, Durability — propriétés fondamentales des transactions |
| **ORM** | Object-Relational Mapping — couche d'abstraction entre code et base de données |
| **DDL** | Data Definition Language — SQL de création/modification de structure (CREATE, ALTER) |
| **DML** | Data Manipulation Language — SQL de manipulation de données (SELECT, INSERT, UPDATE) |
| **DCL** | Data Control Language — SQL de contrôle d'accès (GRANT, REVOKE) |
| **pgcrypto** | Extension PostgreSQL de fonctions cryptographiques |
| **VACUUM** | Opération PostgreSQL de récupération d'espace et mise à jour des statistiques |
| **TDE** | Transparent Data Encryption — chiffrement transparent au niveau du moteur de base de données |
| **PITR** | Point-In-Time Recovery — restauration PostgreSQL à un instant précis |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquez pourquoi `SELECT solde FROM comptes WHERE id=? FOR UPDATE` est nécessaire avant un débit bancaire.

**Corrigé :** `FOR UPDATE` pose un verrou d'écriture sur la ligne lue. Sans ce verrou, deux transactions concurrentes pourraient lire le même solde (ex: 100 000 CDF), chacune décider qu'il y a assez d'argent pour un débit de 80 000 CDF, et toutes les deux débiter — résultant en un solde de -60 000 CDF (problème de double-dépense). Le verrou garantit que la deuxième transaction attend la fin de la première avant de lire le solde.

**Exercice 2 :** Pourquoi créer un utilisateur `backup_user` avec seulement le rôle `bcc_backup` (SELECT) plutôt qu'utiliser `postgres` pour les sauvegardes ?

**Corrigé :** Principe du moindre privilège. Si les credentials du `backup_user` sont compromis (ex: script de backup accessible), l'attaquant ne peut que **lire** les données — pas les modifier ou supprimer. Utiliser le superuser `postgres` pour les backups donnerait un accès complet en cas de compromission.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans ACID, que signifie l'Atomicité d'une transaction ?
- A) La transaction est immuable une fois validée
- B) La transaction est visible par tous les utilisateurs simultanément
- C) Toutes les opérations de la transaction réussissent ensemble, ou aucune ne s'applique
- D) La transaction s'exécute en moins d'une milliseconde

**Réponse : C**

**Q2 :** Un `CREATE INDEX CONCURRENTLY` est préférable à `CREATE INDEX` en production parce que :
- A) Il est plus rapide à créer
- B) Il ne pose pas de verrou exclusif sur la table pendant la création — les lectures/écritures continuent
- C) Il supporte plus de types de données
- D) Il consomme moins d'espace disque

**Réponse : B**

**Q3 :** `GRANT SELECT ON ALL TABLES TO bcc_readonly` avec `ALTER DEFAULT PRIVILEGES` est important pour :
- A) Appliquer les droits rétroactivement sur les tables futures créées
- B) Supprimer les droits de toutes les tables existantes
- C) Créer automatiquement des index sur les nouvelles tables
- D) Restreindre les connexions au réseau local uniquement

**Réponse : A**

**Q4 :** Pourquoi utiliser une colonne `reference VARCHAR UNIQUE NOT NULL` dans la table des transactions ?
- A) Pour accélérer les requêtes SQL
- B) Pour garantir l'idempotence — empêcher l'insertion de la même transaction deux fois en cas de retry réseau
- C) Pour respecter la norme ISO 4217
- D) Pour permettre la pagination des résultats

**Réponse : B**

**Q5 :** Le backup PostgreSQL est chiffré avec GPG. Quel est l'avantage par rapport à un backup non chiffré ?
- A) Le fichier chiffré est plus petit
- B) La restauration est plus rapide
- C) Si le support de sauvegarde est volé, les données restent confidentielles sans la clé privée GPG
- D) GPG est requis par PostgreSQL pour les sauvegardes complètes

**Réponse : C**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
