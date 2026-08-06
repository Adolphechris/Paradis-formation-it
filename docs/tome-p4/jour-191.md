# TOME P4 — Cloud, DevOps & SecOps — Jour 191 (6h) : Architectures Événementielles Avancées & Event Sourcing (Event Sourcing vs CQRS, Apache Pulsar vs Kafka, Outbox Pattern & Eventual Consistency)

> [!NOTE]
> **Objectif du jour :** Maitriser les modèles avancés d'architectures orientées événements (**Event-Driven Architectures**) pour les systèmes bancaires critiques : principes de l'**Event Sourcing**, séparation de la lecture et de l'écriture avec **CQRS (Command Query Responsibility Segregation)**, comparaison **Apache Pulsar** vs **Kafka**, le motif **Transactional Outbox Pattern**, et la gestion de la consistance éventuelle (**Eventual Consistency**).
>
> **Compétences visées :** `BIT-07` (A) — Event Sourcing & CQRS Pattern | `BIT-04` (A) — Transactional Outbox & Eventual Consistency

---

## 1) Module — Event Sourcing & CQRS Pattern (2h)

### 📖 Narration/Intuition

Dans une base de données relationnelle traditionnelle (CRUD), quand un client effectue un dépôt de 100$, le serveur met à jour la ligne du compte : `UPDATE accounts SET balance = balance + 100 WHERE id = 42`. L'état précédent est détruit à jamais. Si l'on souhaite savoir comment le compte est arrivé à son solde actuel, il faut scruter des logs ou des tables d'audit séparées.

L'**Event Sourcing** renverse cette approche : au lieu de stocker l'état courant d'une entité, on stocke la **séquence immuable d'événements** qui se sont produits sur cette entité (`AccountCreated`, `MoneyDeposited`, `MoneyWithdrawn`). L'état courant est simplement la **projection (reconstitution)** de la somme de tous ses événements passés.

Associé à **CQRS (Command Query Responsibility Segregation)**, on sépare le modèle d'écriture (Command = Mutation + Validation) du modèle de lecture (Query = Vues matérialisées ultra-rapides pour l'UI).

### 🔍 Anatomie Technique

**Principe du Couplage Event Sourcing + CQRS :**

```
                     ┌────────────────────────────────────────┐
                     │          COMMAND SIDE (Écriture)       │
                     │  1. Recevoir Commande (Ex: Deposer(100))│
                     │  2. Valider Règles Métier (Aggregat)   │
                     │  3. Émettre Événement (ArgentDepose)   │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │   EVENT STORE (Journal d'Événements)   │
                     │   (Séquence immuable append-only)      │
                     │   - AccountCreated(id=42, solde=0)     │
                     │   - MoneyDeposited(id=42, montant=100) │
                     │   - MoneyWithdrawn(id=42, montant=30)  │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼ (Publication Asynchrone / Bus)
                     ┌────────────────────────────────────────┐
                     │   PROJECTION / VUE MATÉRIALISÉE        │
                     │   (Calcul en arrière-plan)             │
                     │   Compte #42 -> Solde Actuel : 70$     │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │           QUERY SIDE (Lecture)         │
                     │  GET /accounts/42 -> Lecture < 1ms     │
                     └────────────────────────────────────────┘
```

**Implémentation d'un Agrégat Event Sourced en Node.js (`AccountAggregate.js`) :**

```javascript
// Agrégat Compte Bancaire basé sur l'Event Sourcing
class AccountAggregate {
    constructor(id) {
        this.id = id;
        this.balance = 0;
        this.status = 'DRAFT';
        this.version = 0;
        this.changes = []; // Nouveaux événements non encore commités
    }

    // Restaurer l'état de l'agrégat depuis l'historique complet des événements
    static rehydrate(id, events) {
        const aggregate = new AccountAggregate(id);
        for (const event of events) {
            aggregate.apply(event, false);
        }
        return aggregate;
    }

    // Validation métier & Émission de la commande : Déposer Argent
    deposit(amount, currency) {
        if (this.status !== 'ACTIVE') {
            throw new Error('OPERATION_REFUSEE: Compte inactif ou clôturé.');
        }
        if (amount <= 0) {
            throw new Error('OPERATION_REFUSEE: Le montant doit être positif.');
        }

        const event = {
            type: 'MONEY_DEPOSITED',
            aggregateId: this.id,
            data: { amount, currency, timestamp: new Date().toISOString() },
            version: this.version + 1
        };

        this.apply(event, true);
    }

    // Application interne de l'événement pour muter l'état local
    apply(event, isNew = true) {
        switch (event.type) {
            case 'ACCOUNT_OPENED':
                this.status = 'ACTIVE';
                this.balance = event.data.initialBalance || 0;
                break;
            case 'MONEY_DEPOSITED':
                this.balance += event.data.amount;
                break;
            case 'MONEY_WITHDRAWN':
                this.balance -= event.data.amount;
                break;
        }
        this.version = event.version;
        if (isNew) {
            this.changes.push(event);
        }
    }
}

module.exports = AccountAggregate;
```

---

## 2) Module — Transactional Outbox Pattern & Consistance Éventuelle (2h)

### 📖 Narration/Intuition

Comment garantir de manière absolue qu'une transaction bancaire enregistrée en BDD sera **toujours** publiée dans le bus d'événements Kafka/Pulsar, même en cas de crash du serveur ou de coupure réseau juste après le commit BDD ?

Si l'on fait d'abord le commit BDD puis la publication Kafka dans le code applicatif, un crash entre les deux lignes fait perdre l'événement à jamais. C'est le problème du **Dual Write Failure**.

Le **Transactional Outbox Pattern** résout ce problème : l'application écrit la donnée métier ET l'événement à publier dans une table spéciale `outbox` au sein de la **même transaction ACID locale**. Un processus d'arrière-plan (Debezium CDC ou Polling Publisher) lit la table `outbox` et garantit la livraison au message broker.

### 🔍 Anatomie Technique

**Schéma du Transactional Outbox Pattern :**

```
 ┌────────────────────────────────────────────────────────┐
 │                   APPLICATION NODE.JS                  │
 │                                                        │
 │  BEGIN TRANSACTION;                                    │
 │    UPDATE accounts SET balance = balance - 100 ...;   │
 │    INSERT INTO outbox (id, aggregate_type, payload)...│
 │  COMMIT; (Garantie ACID 100% locale)                   │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │             POSTGRESQL (Base Principale BCC)           │
 │  ┌──────────────────────┐    ┌──────────────────────┐  │
 │  │ Table `accounts`     │    │ Table `outbox`       │  │
 │  └──────────────────────┘    └──────────────────────┘  │
 └──────────────────────────┬─────────────────────────────┘
                            │ (PostgreSQL Write-Ahead Log — WAL)
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │           DEBEZIUM CDC / OUTBOX PUBLISHER              │
 │  - Lit le WAL PostgreSQL en streaming sans impact BDD  │
 │  - Publie le payload vers le broker                    │
 │  - Marque les messages comme envoyés (ou supprime)     │
 └──────────────────────────┬─────────────────────────────┘
                            │ (Livraison "At Least Once")
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │                 APACHE KAFKA / PULSAR                  │
 └────────────────────────────────────────────────────────┘
```

**Table Outbox PostgreSQL & CDC Query (`outbox_schema.sql`) :**

```sql
-- Création de la table Outbox au sein du schéma de base de données BCC
CREATE TABLE IF NOT EXISTS transactional_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE
);

-- Index pour optimiser la lecture par les polleurs si CDC passif
CREATE INDEX idx_outbox_unprocessed ON transactional_outbox(created_at) WHERE processed = FALSE;
```

---

## 3) Module — Apache Pulsar vs Apache Kafka (2h)

### 📖 Narration/Intuition

Si **Apache Kafka** est le champion historique du streaming d'événements, **Apache Pulsar** s'impose comme une alternative cloud-native de nouvelle génération particulièrement adaptée aux institutions financières exigeantes grâce à son architecture découplée (Calcul vs Stockage), son support natif du multi-tenancy et ses garanties de réplication géo-distribuée.

### 🔍 Anatomie Technique

**Comparatif Architectural Kafka vs Pulsar :**

| Critère | Apache Kafka | Apache Pulsar |
|:---|:---:|:---:|
| **Architecture** | Monolithique (Storage & Compute couplés sur les Brokers) | Découplée (Brokers Stateless + Apache BookKeeper pour le stockage) |
| **Scaling** | Rebalancement coûteux des partitions lors de l'ajout de brokers | Instantané (Les brokers sont stateless, ajout sans déplacement de données) |
| **Multi-Tenancy** | Basique (Noms de topics séparés par namespaces) | Natif (Tenants > Namespaces > Topics avec quotas et isolation stricts) |
| **Géo-Réplication** | Via outils externes (MirrorMaker 2, Confluent Replicator) | NATIVE et transparente (Active-Active / Active-Passive inter-datacenters) |
| **Queuing vs Streaming** | Strictement orienté Log Streaming | Unifié : Supporte le Streaming (Publish/Subscribe) ET la File d'attente (Work Queue) |

**Exemple de Configuration d'un Topic Multi-Tenant Pulsar pour la BCC :**

```bash
# 1. Création d'un Tenant dédié pour le Core Banking BCC
pulsar-admin tenants create bcc-banking \
  --admin-roles admin-bcc \
  --allowed-clusters cluster-kinshasa,cluster-lubumbashi

# 2. Création d'un Namespace avec rétention et politique de sécurité
pulsar-admin namespaces create bcc-banking/virements

# Configurer la géo-réplication automatique entre Kinshasa et Lubumbashi
pulsar-admin namespaces set-clusters bcc-banking/virements \
  --clusters cluster-kinshasa,cluster-lubumbashi

# Configurer la rétention des données : 30 jours (Conformité bancaire)
pulsar-admin namespaces set-retention bcc-banking/virements \
  --size 500G --time 30d
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CQRS** | Command Query Responsibility Segregation — Séparation des responsabilités d'écriture et de lecture |
| **CDC** | Change Data Capture — Capture des modifications de bases de données en temps réel via les logs système |
| **WAL** | Write-Ahead Log — Journal de transactions en écriture anticipée dans les SGBD (PostgreSQL) |
| **DML** | Data Manipulation Language — Commandes SQL de manipulation des données (INSERT, UPDATE, DELETE) |
| **WORM** | Write Once, Read Many — Modèle de stockage immuable non-modifiable |
| **Saga** | Séquence de transactions locales compensatoires pour les transactions distribuées inter-services |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi l'**Event Sourcing** est-il particulièrement adapté aux systèmes d'audit bancaires comparé à une base de données relationnelle CRUD classique ?

**Corrigé :** Dans une BDD CRUD classique, l'état précédent est écrasé lors des mises à jour (`UPDATE`), ce qui nécessite la mise en place complexe de déclencheurs (triggers) ou de tables d'audit séparées souvent incomplètes. Avec l'**Event Sourcing**, l'historique complet et immuable de chaque action est conservé par définition sous forme d'événements (`MoneyDeposited`, `TransferInitiated`). Cela offre : (1) Une **piste d'audit parfaite et infalsifiable** (Audit Trail natif), (2) La capacité de voyager dans le temps (**Time Travel / Temporal Queries**) en rejouant les événements jusqu'à une date précise pour reconstruire l'état exact du système à cet instant, (3) Une **résilience aux bugs métier** : si une règle de calcul du solde était erronée, il suffit de corriger le code et de re-projeter tous les événements passés pour corriger l'état sans perte de données.

**Exercice 2 :** Comment le **Transactional Outbox Pattern** résout-il le problème du "Dual Write Failure" lors de la publication d'un événement vers Kafka/Pulsar ?

**Corrigé :** Le problème du "Dual Write" survient quand une application doit modifier sa BDD locale ET publier un message sur un bus distant. Si l'application ou le réseau crashe entre les deux opérations, les deux systèmes deviennent incohérents. Le **Transactional Outbox Pattern** résout cela en écrivant l'événement directement dans une table `transactional_outbox` située au sein de la **même base de données que les tables métier**, au cours de la **même transaction SQL ACID**. L'écriture de la donnée métier et de l'événement est atomique (tout réussit ou tout échoue). Un composant tiers (Debezium CDC ou polleur d'outbox) lit ensuite cette table de manière asynchrone et garantit la livraison au message broker avec une sémantique *At Least Once*.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans l'architecture **CQRS**, quel est le rôle principal du côté **Command** par rapport au côté **Query** ?
- A) Le côté Command gère l'écriture, valide les règles métier et émet des événements ; le côté Query gère la lecture optimisée via des vues matérialisées
- B) Le côté Command lit les données et le côté Query les écrit
- C) Les deux côtés font exactement la même chose pour assurer la redondance
- D) Le côté Command interroge la base de données et Query envoie des emails

**Réponse : A**

**Q2 :** Quel problème majeur résout le **Transactional Outbox Pattern** dans une architecture orientée événements ?
- A) Le Dual Write Failure (l'incohérence causée par un crash entre l'écriture en BDD et l'envoi du message au broker)
- B) La lenteur des requêtes SQL de lecture
- C) Le chiffrement des clés d'API
- D) La gestion des conteneurs Kubernetes

**Réponse : A**

**Q3 :** Quelle caractéristique architecturale distingue **Apache Pulsar** d'**Apache Kafka** concernant le stockage des données ?
- A) Pulsar sépare les brokers (stateless) du stockage (Apache BookKeeper), permettant un scaling indépendant du compute et du storage
- B) Kafka utilise des SSDs et Pulsar uniquement de la RAM
- C) Kafka ne supporte pas la réplication
- D) Pulsar stocke toutes ses données dans PostgreSQL

**Réponse : A**

**Q4 :** Qu'est-ce que la **consistance éventuelle (Eventual Consistency)** dans une architecture répartie basée sur l'Event Sourcing/CQRS ?
- A) Le fait que le modèle de lecture sera mis à jour avec un léger décalage temporel (asynchrone) après l'écriture, devenant cohérent à terme
- B) Une erreur permanente dans la base de données
- C) La garantie que toutes les écritures sont immédiatement visibles sur tous les nœuds sans aucun délai
- D) Une méthode de compression des événements

**Réponse : A**

**Q5 :** Comment appelle-t-on le processus de reconstruction de l'état d'un agrégat dans l'Event Sourcing à partir de la réapplication de la séquence de ses événements passés ?
- A) La Réhydratation (Rehydration)
- B) La Normalisation
- C) La Compaction
- D) La Dépréciation

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
