# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 112 (6h) : Sécurité des Bases de Données Cloud-Native & Chiffrement Transparent (PostgreSQL TDE, AWS Aurora & Spanner)

> [!NOTE]
> **Objectif du jour :** Sécuriser les bases de données Cloud-Native à haute échelle (AWS Aurora, Google Cloud Spanner, PostgreSQL Enterprise) : Chiffrement Transparent des données au repos (TDE), gestion des clés dans un KMS / HSM matériel, masquage dynamique des données (Dynamic Data Masking), audit de requêtes SQL en temps réel et isolation réseau.
>
> **Compétences visées :** `SEC-03` (A) — Sécurité des Bases de Données Cloud-Native | `BIT-06` (A) — Architectures BDD Avancées & TDE

---

## 1) Module — Transparent Data Encryption (TDE) & Gestion des Clés KMS (2h)

### 📖 Narration/Intuition

En matière de données bancaires, le chiffrement au niveau de l'application (ex: hacher des mots de passe) ne suffit pas. Si un attaquant parvient à voler un snapshot de base de données, un fichier de sauvegarde ou un disque SSD du datacenter, il ne doit sous aucun prétexte pouvoir lire les tables.

Le **Chiffrement Transparent des Données (TDE - Transparent Data Encryption)** chiffre automatiquement les blocs de données de la base de données au niveau du moteur de stockage *avant* leur écriture sur disque, et les déchiffre de façon transparente lors de la lecture par une session authentifiée. Les clés de chiffrement (DEK - Data Encryption Keys) sont elles-mêmes chiffrées par une clé maître (KEK - Key Encryption Key) conservée dans un **KMS / HSM (Hardware Security Module)** matériel certifié FIPS 140-2.

### 🔍 Anatomie Technique

**Architecture de Chiffrement d'Enveloppe (Envelope Encryption) avec KMS :**

```
┌─────────────────────────────────────────────────────────────┐
│               HARDWARE SECURITY MODULE (HSM / KMS)          │
│  - Clé Maître (Master Key / KEK) en zone matérielle isolée  │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │ Generate/Decrypt DEK         │ Encrypted DEK
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│             MOTEUR DE BASE DE DONNÉES (AWS AURORA / POSTGRES)│
│                                                             │
│  Clé de Données (DEK) en mémoire RAM                        │
│                                                             │
│  ┌────────────────────────┐   ┌──────────────────────────┐  │
│  │ Table Données (Clair)  │──→│ Algorithme AES-256-XTS   │  │
│  └────────────────────────┘   └────────────┬─────────────┘  │
└────────────────────────────────────────────┼────────────────┘
                                             │ Écriture sur disque
                                             ▼
                               ┌──────────────────────────┐
                               │ Données Chiffrées (.db)  │
                               └──────────────────────────┘
```

---

## 2) Module — Masquage Dynamique & Anonymisation des Données SQL (2h)

### 📖 Narration/Intuition

Les développeurs et les équipes de support ont parfois besoin de reproduire des bugs sur des bases de données de staging. Leur donner une copie conforme de la base de production exposerait des millions de numéros de comptes et de téléphones.

Le **Masquage Dynamique de Données (Dynamic Data Masking)** modifie à la volée les résultats des requêtes SQL pour les utilisateurs non privilégiés sans altérer la donnée réelle sur le disque.

### 🔍 Anatomie Technique

**Configuration du Masquage Dynamique dans PostgreSQL (`postgresql_masking.sql`) :**

```sql
-- 1. Activer l'extension PostgreSQL de masquage (Anon / pg_mart)
CREATE EXTENSION IF NOT EXISTS anon CASCADE;
SELECT anon.init();

-- 2. Définir la politique de masquage sur la table des clients
SECURITY LABEL FOR anon ON COLUMN clients.nom IS 'MASKED WITH FUNCTION anon.dummy_last_name()';
SECURITY LABEL FOR anon ON COLUMN clients.email IS 'MASKED WITH FUNCTION anon.partial(email,1,$$***@$$',2)';
SECURITY LABEL FOR anon ON COLUMN clients.telephone IS 'MASKED WITH FUNCTION anon.partial(telephone,4,$$XXXXX$$,2)';

-- 3. Déclarer les utilisateurs soumis au masquage (ex: groupe support_technique)
SECURITY LABEL FOR anon ON ROLE support_technique IS 'MASKED';

-- 4. Résultat de la requête exécutée par l'utilisateur 'support_technique' :
-- SELECT nom, email, telephone FROM clients;
-- Résultat : "Dupont", "d***@bcc.cd", "+243XXXXX12"
```

---

## 3) Module — Audit SQL en Temps Réel & Prévention des Fuites (2h)

### 📖 Narration/Intuition

Pour être conforme à la norme PCI-DSS (Exigence 10), chaque requête exécutée sur la base de données bancaire (qu'elle émane d'une application ou d'un administrateur `postgres`) doit être enregistrée dans un journal d'audit infalsifiable avec l'horodatage, l'utilisateur, l'IP source et la requête SQL exacte.

### 🔍 Anatomie Technique

**Configuration du plugin d'audit natif `pgAudit` (`postgresql.conf`) :**

```ini
# Configuration pgAudit dans /etc/postgresql/16/main/postgresql.conf
shared_preload_libraries = 'pgaudit'

# Activer l'audit sur toutes les opérations DDL et DML sensibles (READ, WRITE, ROLE)
pgaudit.log = 'read, write, function, role, ddl'
pgaudit.log_catalog = off
pgaudit.log_parameter = on
pgaudit.log_statement_once = off

# Redirection vers rsyslog / Filebeat vers le SIEM central
log_destination = 'syslog'
syslog_facility = 'LOCAL0'
syslog_ident = 'postgres-audit'
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **TDE** | Transparent Data Encryption — Chiffrement transparent des bases de données au repos |
| **KMS** | Key Management Service — Service de gestion centralisée des clés cryptographiques |
| **HSM** | Hardware Security Module — Équipement matériel cryptographique dédié certifié FIPS |
| **DEK** | Data Encryption Key — Clé symétrique servant à chiffrer directement les blocs de données |
| **KEK** | Key Encryption Key — Clé maîtresse servant à chiffrer la clé de données (Envelope Encryption) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Qu'est-ce que le **Chiffrement d'Enveloppe (Envelope Encryption)** et pourquoi est-il utilisé dans les services KMS pour sécuriser les bases de données Cloud ?

**Corrigé :** Le **Chiffrement d'Enveloppe** utilise deux niveaux de clés : 1) La donnée volumineuse est chiffrée localement par une clé de données rapide (**DEK** - Data Encryption Key). 2) La DEK est elle-même chiffrée par une clé maîtresse (**KEK** - Key Encryption Key) conservée en sécurité dans un KMS/HSM matériel. Cette approche est ultra-performante car elle évite d'envoyer de gros volumes de données réseau vers le KMS : seul le petit fichier de clé DEK chiffré est échangé avec le KMS lors de l'initialisation du moteur de base de données.

**Exercice 2 :** Quelle est la différence entre le **Masquage Statique** (Static Data Masking) et le **Masquage Dynamique** (Dynamic Data Masking) d'une base de données ?

**Corrigé :** Le **Masquage Statique** crée une **copie physique anonymisée** de la base de données où les données réelles sont définitivement remplacées par des données de fiction sur le disque (utilisé pour fournir des bases de test aux développeurs). Le **Masquage Dynamique** conserve la donnée réelle intacte sur disque, mais **intercepte à la volée les requêtes SQL** et masque les résultats retournés uniquement pour certaines fonctions ou utilisateurs non autorisés (ex: le support technique).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle technologie permet de chiffrer automatiquement les fichiers de base de données sur disque de manière totalement transparente pour les applications utilisatrices ?
- A) TDE (Transparent Data Encryption)
- B) FTP
- C) HTML5
- D) Telnet

**Réponse : A**

**Q2 :** Quel équipement matériel dédié et certifié FIPS 140-2 garantit le stockage inviolable et la gestion physique des clés maîtresses de chiffrement (KEK) ?
- A) HSM (Hardware Security Module)
- B) Clé USB grand public
- C) Disquette 3.5 pouces
- D) Écran LCD

**Réponse : A**

**Q3 :** Quel module PostgreSQL permet d'enregistrer de manière détaillée et conforme PCI-DSS toutes les requêtes SQL (READ, WRITE, DDL) exécutées sur la base de données ?
- A) pgAudit
- B) Nmap
- C) Gzip
- D) Systemd

**Réponse : A**

**Q4 :** Dans une architecture de Chiffrement d'Enveloppe (Envelope Encryption), quelle clé est utilisée pour chiffrer directement les blocs de données de la base de données ?
- A) DEK (Data Encryption Key)
- B) Mot de passe "123456"
- C) Adresse MAC
- D) Code PIN

**Réponse : A**

**Q5 :** Quel est l'objectif du masquage dynamique des données (Dynamic Data Masking) ?
- A) Masquer les résultats sensibles renvoyés par les requêtes SQL pour les utilisateurs non autorisés sans altérer les données réelles sur disque
- B) Supprimer la base de données
- C) Augmenter la vitesse d'impression
- D) Fermer le port SSH

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
