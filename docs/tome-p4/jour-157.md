# TOME P4 — Cloud, DevOps & SecOps — Jour 157 (6h) : Procédures Stockées, Fonctions PL/pgSQL, Triggers & Audits Automatisés (PostgreSQL PL/pgSQL)

> [!NOTE]
> **Objectif du jour :** Développer des traitements métier côté base de données avec PL/pgSQL : écriture de fonctions complexes et de procédures stockées transactionnelles, déclencheurs (Triggers `BEFORE` / `AFTER` / `INSTEAD OF`), gestion fine des erreurs et exceptions, et mise en place d'un système d'audit automatique des modifications sensibles (CDC / Audit Logs).
>
> **Compétences visées :** `BIT-05` (A) — Programmation SGBD (PL/pgSQL) | `SEC-05` (A) — Traçabilité & Immuabilité des Audits BDD

---

## 1) Module — Programmation PL/pgSQL : Fonctions & Procédures Stockées (2h)

### 📖 Narration/Intuition

Pourquoi exécuter du code directement à l'intérieur du serveur de base de données PostgreSQL plutôt que dans l'application web Python/Node.js ?

Lorsqu'un virement bancaire complexe implique la vérification de 5 règles de conformité, la mise à jour de 3 tables et la génération d'un reçu, effectuer ces aller-retours entre le serveur d'application et la BDD par le réseau génère de la latence (Network Round-Trips). Avec une **Fonction PL/pgSQL** ou une **Procédure Stockée**, l'ensemble du traitement s'exécute localement en mémoire sur le serveur BDD en **sub-milliseconde** dans une transaction atomique.

### 🔍 Anatomie Technique

**Structure d'une Fonction PL/pgSQL avec gestion d’exceptions (`fn_effectuer_virement.sql`) :**

```sql
-- Fonction PL/pgSQL sécurisée d'exécution de virement bancaire RTGS
CREATE OR REPLACE FUNCTION fn_effectuer_virement(
    p_compte_source BIGINT,
    p_compte_dest BIGINT,
    p_montant NUMERIC(15,2)
) RETURNS BOOLEAN AS $$
DECLARE
    v_solde_actuel NUMERIC(15,2);
BEGIN
    -- 1. Verrouiller la ligne du compte source pour éviter les Race Conditions (SELECT FOR UPDATE)
    SELECT solde INTO v_solde_actuel 
    FROM comptes 
    WHERE compte_id = p_compte_source 
    FOR UPDATE;

    -- 2. Vérification de la disponibilité du solde
    IF v_solde_actuel < p_montant THEN
        RAISE EXCEPTION 'Fonds insuffisants. Solde actuel: %, Montant requis: %', v_solde_actuel, p_montant;
    END IF;

    -- 3. Débit du compte source
    UPDATE comptes 
    SET solde = solde - p_montant 
    WHERE compte_id = p_compte_source;

    -- 4. Crédit du compte destination
    UPDATE comptes 
    SET solde = solde + p_montant 
    WHERE compte_id = p_compte_dest;

    -- 5. Enregistrement du reçu de virement
    INSERT INTO transactions (compte_source_id, compte_destination_id, montant, type_operation)
    VALUES (p_compte_source, p_compte_dest, p_montant, 'VIREMENT_RTGS');

    RETURN TRUE;

EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, la transaction est annulée automatiquement
        RAISE NOTICE 'Échec du virement: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 2) Module — Triggers (Déclencheurs) : Automates de Sécurité & Contrôle (2h)

### 📖 Narration/Intuition

Un **Trigger (Déclencheur)** est un bloc de code SQL qui s'exécute automatiquement en réponse à un événement spécifique (`INSERT`, `UPDATE`, `DELETE`) sur une table donnée.

Dans une banque, un trigger est l'agent de sécurité ultime : même si un administrateur malveillant ou une application tente de modifier directement le solde d'un compte en contournant l'application, le trigger intercepte la modification sur le disque et force l'enregistrement dans la table d'audit ou annule l'opération.

### 🔍 Anatomie Technique

**Types de Triggers et Variables Spéciales PostgreSQL :**
- **`BEFORE TRIGGER`** : S'exécute *avant* la modification. Permet de valider ou modifier la donnée entrante (`NEW`).
- **`AFTER TRIGGER`** : S'exécute *après* la modification. Idéal pour l'enregistrement d'audit.
- **Variables spéciales** : `OLD` (ancienne ligne), `NEW` (nouvelle ligne), `TG_OP` ('INSERT', 'UPDATE', 'DELETE').

---

## 3) Module — Laboratoire Pratique : Système d'Audit Automatique Immuable (2h)

### 📖 Narration/Intuition

Construisons un système d'audit automatique immuable qui enregistre l'historique complet de toutes les modifications effectuées sur les comptes bancaires (qui a modifié quoi, à quelle heure, de quelle valeur à quelle valeur).

### 🔍 Anatomie Technique

**Mise en place de la Table d'Audit et du Trigger (`trigger_audit_comptes.sql`) :**

```sql
-- 1. Table d'audit immuable (Historique des modifications de solde)
CREATE TABLE audit_solde_log (
    audit_id BIGSERIAL PRIMARY KEY,
    compte_id BIGINT NOT NULL,
    ancien_solde NUMERIC(15,2),
    nouveau_solde NUMERIC(15,2),
    action_effectuee VARCHAR(10) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    modifie_par VARCHAR(100) NOT NULL DEFAULT CURRENT_USER,
    date_action TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Fonction de déclencheur (Trigger Function)
CREATE OR REPLACE FUNCTION fn_audit_modification_solde()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        -- Enregistrer uniquement si le solde a réellement changé
        IF (OLD.solde <> NEW.solde) THEN
            INSERT INTO audit_solde_log (compte_id, ancien_solde, nouveau_solde, action_effectuee)
            VALUES (OLD.compte_id, OLD.solde, NEW.solde, 'UPDATE');
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_solde_log (compte_id, ancien_solde, nouveau_solde, action_effectuee)
        VALUES (OLD.compte_id, OLD.solde, NULL, 'DELETE');
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Attachement du Trigger à la table comptes
CREATE TRIGGER trg_audit_comptes_solde
AFTER UPDATE OR DELETE ON comptes
FOR EACH ROW
EXECUTE FUNCTION fn_audit_modification_solde();
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PL/pgSQL** | Procedural Language / PostgreSQL Structured Query Language |
| **CDC** | Change Data Capture — Capture et enregistrement automatique des modifications de données |
| **TG_OP** | Trigger Operation — Variable PL/pgSQL indiquant le type d'événement ('INSERT', 'UPDATE', 'DELETE') |
| **SECURITY DEFINER** | Option de fonction exécutant le code avec les privilèges du créateur et non de l'appelant |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre une clause `SECURITY INVOKER` (défaut) et `SECURITY DEFINER` lors de la création d'une fonction PL/pgSQL ? Quel est le risque de sécurité lié à `SECURITY DEFINER` ?

**Corrigé :** Une fonction `SECURITY INVOKER` s'exécute avec les droits et privilèges de l'utilisateur qui l'appelle. Si l'utilisateur n'a pas accès à la table `comptes`, la fonction échoue. Une fonction `SECURITY DEFINER` s'exécute avec les droits de **l'utilisateur qui a créé la fonction** (souvent `db_admin` ou `postgres`). Cela permet d'accorder à un utilisateur bancaire restreint le droit d'exécuter un virement via la fonction sans lui donner d'accès direct en lecture/écriture sur la table des comptes. Le risque de sécurité est l'**élévation de privilèges (Privilege Escalation)** : si la fonction `SECURITY DEFINER` contient une vulnérabilité (ex: SQL dynamique non nettoyé), l'utilisateur restreint peut l'exploiter pour exécuter des commandes arbitraires avec les privilèges d'administrateur.

**Exercice 2 :** Pourquoi la clause `FOR UPDATE` est-elle indispensable lors de l'exécution d'un `SELECT` dans une fonction de virement bancaire concurrentielle ?

**Corrigé :** Dans un environnement multi-utilisateurs à forte concurrence (ex: 100 requêtes/seconde), si deux transactions simultanées lisent le solde d'un même compte (ex: 100 USD) en même temps sans verrouillage, les deux vont voir que le solde est suffisant pour un virement de 80 USD. Les deux vont effectuer le débit, entraînant un solde final négatif de -60 USD (**Race Condition / Double Spending**). La clause `SELECT ... FOR UPDATE` pose un **verrou exclusif sur la ligne (Row-Level Lock)** : la première transaction verrouille la ligne, forçant la seconde transaction à attendre la fin du commit avant de pouvoir lire le nouveau solde à jour.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel langage procédural propre à PostgreSQL permet de développer des fonctions complexes et des procédures stockées directement sur le serveur de base de données ?
- A) PL/pgSQL
- B) PL/SQL (Oracle uniquement)
- C) VBScript
- D) HTML5

**Réponse : A**

**Q2 :** Dans une fonction de trigger PL/pgSQL, quelles variables spéciales représentent respectivement l'état de la ligne AVANT et APRÈS la modification ?
- A) `OLD` et `NEW`
- B) `BEFORE` et `AFTER`
- C) `PREV` et `NEXT`
- D) `SRC` et `DST`

**Réponse : A**

**Q3 :** Quel type de Trigger est le plus approprié pour valider ou nettoyer une donnée saisie avant qu'elle ne soit écrite sur le disque ?
- A) `BEFORE TRIGGER`
- B) `AFTER TRIGGER`
- C) `INSTEAD OF TRIGGER`
- D) `CRON TRIGGER`

**Réponse : A**

**Q4 :** Quelle clause SQL permet de poser un verrou exclusif sur les lignes sélectionnées par une requête `SELECT` pour éviter les Race Conditions lors de transactions financières concurrentes ?
- A) `FOR UPDATE`
- B) `LOCK TABLE`
- C) `WITH NO LOCK`
- D) `FOR READ ONLY`

**Réponse : A**

**Q5 :** Quel est le principal avantage de l'utilisation des Triggers pour la journalisation d'audit (Audit Logging) par rapport à un audit géré au niveau de l'application web ?
- A) Les triggers s'exécutent directement dans le SGBD et ne peuvent pas être contournés, même si une modification est tentée en direct via la console SQL
- B) Les triggers sont plus faciles à imprimer
- C) Les triggers n'utilisent pas de mémoire RAM
- D) Les triggers fonctionnent sans base de données

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
