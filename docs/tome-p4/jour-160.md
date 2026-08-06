# TOME P4 — Cloud, DevOps & SecOps — Jour 160 (6h) : Projet Intégrateur Semestre 4 (Partie 1) — Architecture Data & BDD Sécurisée d'une Infrastructure Bancaire Multi-Sites (BCC Data Platform)

> [!NOTE]
> **Objectif du jour :** Mobiliser et intégrer l'ensemble des compétences acquises durant les 10 premiers jours du Semestre 4 (J151 à J159) dans un projet de conception et de mise en œuvre pratique : architecture complète de la plateforme de données de la Banque Centrale du Congo (BCC Data Platform), combinant SGBDR PostgreSQL HA (Patroni + `pgBackRest`), Cache In-Memory Redis sécurisé (ACL + TLS), entrepôt OLAP ClickHouse, pipelines Airflow et contrôles de sécurité avancés (chiffrement TDE, prévention SQLi/NoSQLi).
>
> **Compétences visées :** `PRO-01` (A) — Project Capstone & Data Architecture | `BIT-05` (A) — Master Integration Data Platforms | `SEC-05` (A) — Hardening Global des Stockages Bancaires

---

## 1) Module — Cahier des Charges & Architecture Cible BCC Data (2h)

### 📖 Narration/Intuition

En tant qu'**Architecte Data & Sécurité Senior** mandaté par la Banque Centrale du Congo, vous devez concevoir l'infrastructure de données cible capable de gérer 50 000 transactions bancaires/seconde avec un niveau de disponibilité de **99.999%**, une sécurité de niveau bancaire (PCI-DSS / ISO 27001) et une séparation étanche entre le transactionnel (OLTP) et l'analytique (OLAP).

### 🔍 Anatomie Technique

**Master Diagramme d'Architecture Data BCC (Tome P4 - J160) :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   BANQUE CENTRALE DU CONGO — DATA PLATFORM                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ [ CLIENTS / AGENCES ] ──► [ LOAD BALANCER HA ] ──► [ API BANKING (NODE/PY) ]│
│                                                          │                  │
│             ┌────────────────────────────────────────────┼──────────────┐   │
│             ▼                                            ▼              │   │
│  ┌──────────────────────┐                     ┌──────────────────────┐  │   │
│  │ REDIS CACHE (TLS/ACL)│                     │ POSTGRESQL HA CLUSTER│  │   │
│  │ - Session Store      │                     │ - Primary (Kinshasa) │  │   │
│  │ - Rate Limiting      │                     │ - Standby (Lubumbashi│  │   │
│  │ - In-Memory < 1ms    │                     │ - Patroni + etcd     │  │   │
│  └──────────────────────┘                     └──────────┬───────────┘  │   │
│                                                          │              │   │
│                                                          │ CDC / WAL    │   │
│                                                          ▼              │   │
│  ┌──────────────────────┐                     ┌──────────────────────┐  │   │
│  │ CLICKHOUSE OLAP DB   │◄────────────────────│ APACHE AIRFLOW DAGS  │  │   │
│  │ - Columnar Storage   │    ETL Quotidien    │ - Ingest & Anonymize │  │   │
│  │ - Dashboards BI      │                     │ - Orchestration      │  │   │
│  └──────────────────────┘                     └──────────────────────┘  │   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Implémentation du Schéma SQL & Fonctions Sécurisées (2h)

### 📖 Narration/Intuition

Déployons le schéma de base de données relationnelle PostgreSQL en 3NF avec fonctions stockées transactionnelles et audit automatique par déclencheurs (`Triggers`).

### 🔍 Anatomie Technique

**Script d'implémentation BDD Production (`bcc_core_banking_v1.sql`) :**

```sql
-- 1. Base de données bancaire de production BCC
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pgaudit;

-- 2. Table des comptes bancaires sécurisée
CREATE TABLE bcc_accounts (
    account_id BIGSERIAL PRIMARY KEY,
    iban VARCHAR(34) UNIQUE NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    balance NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'CDF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_positive_balance CHECK (balance >= 0.00)
);

-- 3. Table d'audit des modifications de solde (Immuable)
CREATE TABLE bcc_balance_audit (
    audit_id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL,
    old_balance NUMERIC(15,2),
    new_balance NUMERIC(15,2),
    performed_by VARCHAR(100) DEFAULT CURRENT_USER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Trigger d'audit de modification de solde
CREATE OR REPLACE FUNCTION fn_audit_balance() RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.balance <> NEW.balance) THEN
        INSERT INTO bcc_balance_audit(account_id, old_balance, new_balance)
        VALUES (OLD.account_id, OLD.balance, NEW.balance);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bcc_balance_audit
AFTER UPDATE ON bcc_accounts
FOR EACH ROW EXECUTE FUNCTION fn_audit_balance();
```

---

## 3) Module — Validation de l'Architecture & Cahier de Recette (2h)

### 📖 Narration/Intuition

Un projet d'architecture de données bancaire doit obligatoirement être validé par un **Cahier de Recette** démontrant la résistance aux pannes et la conformité sécurité.

### 🔍 Anatomie Technique

**Cahier de Recette & Validation des Tests d'Acceptation :**

| ID Test | Composant | Scénario de Test | Résultat Attendu | Statut |
|:---:|:---|:---|:---|:---:|
| **TC-01** | PostgreSQL HA | Extinction brutale du nœud Primaire Kinshasa | Patroni promeut le Standby Lubumbashi en < 15s (RPO=0) | **PASS** |
| **TC-02** | Redis Security | Tentative d'exécution de la commande `FLUSHALL` | Commande rejetée (`ERR unknown command`) | **PASS** |
| **TC-03** | Injections SQL | Injection payload `admin' OR '1'='1` via l'API | Requête traitée comme littérale via Prepared Statement | **PASS** |
| **TC-04** | Airflow / OLAP | Exécution du DAG quotidien d'ingestion ClickHouse | 1,000,000 de lignes ingérées et agrégées en < 5s | **PASS** |
| **TC-05** | Audit BDD | Modification directe du solde d'un compte en SQL | Entrée d'audit générée automatiquement dans `bcc_balance_audit` | **PASS** |

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **BCC** | Banque Centrale du Congo — Institution bancaire nationale d'émission et de régulation |
| **TC** | Test Case — Cas de test d'un cahier de recette système |
| **HA/DR** | High Availability / Disaster Recovery — Architecture combinant haute disponibilité et reprise |
| **CDC** | Change Data Capture — Mécanisme de propagation des modifications de données |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi la présence d'un **Load Balancer HA (ex: HAProxy)** est-elle indispensable devant les serveurs d'application et les clusters PostgreSQL / Redis de la BCC ?

**Corrigé :** Dans une architecture de Haute Disponibilité avec Patroni, le rôle de nœud Primaire (Master) change dynamiquement d'adresse IP en cas de basculement (Failover). Sans **Load Balancer HA**, l'application devrait reconfigurer ses adresses IP de connexion à chaque panne, ce qui nécessiterait un redémarrage applicatif. Le Load Balancer (HAProxy) surveille la santé des nœuds via l'API REST de Patroni (`http://node:8008/primary`) et draine automatiquement le trafic applicatif vers l'adresse IP du nouveau nœud Primaire en temps réel de manière totalement transparente pour les utilisateurs.

**Exercice 2 :** Dans la solution d'architecture proposée, comment est garantie la **séparation des responsabilités (Segregation of Duties)** entre l'équipe de production (OLTP) et l'équipe d'analyse financière (BI) ?

**Corrigé :** La séparation des responsabilités est garantie sur deux niveaux :
1. **Niveau Infrastructure** : Les analystes BI n'ont aucun accès direct aux serveurs ou à la base de données OLTP de production PostgreSQL. Leurs outils de Business Intelligence (PowerBI, Metabase) sont exclusivement connectés à la base analytique **ClickHouse OLAP**.
2. **Niveau Données** : Le pipeline ETL (Airflow) qui extrait les données de PostgreSQL vers ClickHouse réalise une **anonymisation et un masquage préalable** des données personnelles sensibles (noms de clients, numéros de cartes) avant de les insérer dans le Data Warehouse analytique.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel composant de l'architecture Data BCC s'interpose entre les serveurs applicatifs et le cluster PostgreSQL pour rediriger automatiquement les requêtes vers le bon nœud Master après un failover Patroni ?
- A) Le Load Balancer HA (ex: HAProxy)
- B) Le commutateur réseau physique
- C) Le navigateur web
- D) L'imprimante

**Réponse : A**

**Q2 :** Quel est l'objectif principal du cahier de recette (Test Cases) dans le déploiement d'une plateforme de données bancaire ?
- A) Valider empiriquement par des tests rigoureux que le système respecte les exigences de sécurité, de performance et de résilience aux pannes
- B) Réduire le salaire des développeurs
- C) Supprimer les sauvegardes
- D) Remplacer les câbles RJ45

**Réponse : A**

**Q3 :** Dans l'architecture projet de la BCC, quel outil assure la mise en cache ultra-rapide (< 1ms) des tokens de session et du Rate Limiting pour protéger la base de données principale ?
- A) Redis (avec TLS et ACL)
- B) FileZilla
- C) MS Paint
- D) Apache HTTPD

**Réponse : A**

**Q4 :** Comment s'assure-t-on qu'une modification frauduleuse de solde effectuée par un administrateur directement en SQL est systématiquement tracée ?
- A) Par un Trigger automatique en base de données écrivant l'historique dans une table d'audit immuable
- B) En envoyant un SMS
- C) En regardant l'écran
- D) En fermant la session

**Réponse : A**

**Q5 :** Dans l'architecture globale BCC Data Platform, quel moteur analytique orienté colonnes est alimenté chaque nuit par Airflow pour répondre aux requêtes de Business Intelligence sans impacter la BDD de production ?
- A) ClickHouse OLAP
- B) SQLite
- C) MS Access
- D) Excel

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
