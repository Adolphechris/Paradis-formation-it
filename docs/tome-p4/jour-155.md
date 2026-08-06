# TOME P4 — Cloud, DevOps & SecOps — Jour 155 (6h) : Haute Disponibilité BDD, Réplication & Sauvegardes (PostgreSQL Streaming Replication, Patroni, pgBackRest)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre la Haute Disponibilité (HA) et la stratégie de sauvegarde d'une base de données critique d'institution financière : réplication physique de PostgreSQL (Streaming Replication synchrone/asynchrone), basculement automatique via Patroni et etcd, et sauvegardes physiques à chaud avec restauration PITR (Point-In-Time Recovery) grâce à `pgBackRest`.
>
> **Compétences visées :** `BIT-05` (A) — Haute Disponibilité & Sauvegardes SGBD | `SEC-05` (A) — Data Resilience & PITR Recovery

---

## 1) Module — Réplication Physique PostgreSQL & Stratégies RPO/RTO (2h)

### 📖 Narration/Intuition

En cas de crash matériel du serveur principal de la BCC, la base de données doit basculer automatiquement sur un serveur secondaire en moins de 30 secondes (**RTO < 30s**) sans perdre une seule transaction enregistrée (**RPO = 0**).

PostgreSQL utilise la **Réplication par flux (Streaming Replication)** : le serveur primaire envoie en continu les enregistrements du journal WAL vers un ou plusieurs serveurs secondaires (Standby Nodes).
- **Réplication Synchrone** : Le primaire attend la confirmation d'écriture sur le disque du standby avant de confirmer le commit au client (RPO = 0, zéro perte).
- **Réplication Asynchrone** : Le primaire valide le commit immédiatement et envoie le WAL en arrière-plan (RPO > 0, léger risque de perte mais latence réseau minimale).

### 🔍 Anatomie Technique

**Architecture de Réplication et Failover Patroni :**

```
                     ┌────────────────────────┐
                     │     DCS CLUSTER        │
                     │  (etcd / Consul)       │
                     └───────────▲────────────┘
                                 │ Health Checks & Leader Lock
             ┌───────────────────┴───────────────────┐
             │                                       │
┌────────────▼──────────────┐             ┌──────────▼───────────────┐
│ NŒUD PRIMAIRE KINSHASA    │  Streaming  │ NŒUD STANDBY LUBUMBASHI  │
│ (Patroni + PostgreSQL)    │────────────►│ (Patroni + PostgreSQL)    │
│ [READ / WRITE]            │ WAL Sync    │ [READ ONLY / HOT STANDBY] │
└───────────────────────────┘             └──────────────────────────┘
```

---

## 2) Module — Clustering HA & Failover Automatique avec Patroni (2h)

### 📖 Narration/Intuition

La réplication native de PostgreSQL sait copier les données, mais elle ne sait pas choisir automatiquement un nouveau chef en cas de panne du serveur primaire. Si le serveur principal tombe à 3h du matin, qui promeut le serveur secondaire en nœud primaire ?

**Patroni** est la solution de clustering open-source de référence pour PostgreSQL. Utilisant un magasin de clés-valeurs distribué (**etcd**), Patroni surveille la santé des nœuds et orchestre un basculement automatique (Failover) transparent en cas de défaillance du master.

### 🔍 Anatomie Technique

**Configuration Patroni pour la Haute Disponibilité (`patroni.yml`) :**

```yaml
# Configuration du cluster Patroni BCC
scope: bcc-postgres-ha
namespace: /service
name: pg-node-kinshasa

etcd3:
  hosts:
    - 10.100.1.10:2379
    - 10.100.1.11:2379
    - 10.100.1.12:2379

restapi:
  listen: 0.0.0.0:8008
  connect_address: 10.100.1.20:8008

bootstrap:
  dcs:
    ttl: 30
    loop_wait: 10
    retry_timeout: 10
    maximum_lag_on_failover: 1048576 # 1MB max lag pour autoriser le failover
    synchronous_mode: true           # Forcer le mode synchrone (RPO = 0)
    postgresql:
      use_pg_rewind: true
      parameters:
        wal_level: replica
        max_wal_senders: 10
        synchronous_commit: "on"

postgresql:
  listen: 0.0.0.0:5432
  connect_address: 10.100.1.20:5432
  data_dir: /var/lib/postgresql/16/main
  bin_dir: /usr/lib/postgresql/16/bin
  pgpass: /var/lib/postgresql/.pgpass
  authentication:
    replication:
      username: replicator
      password: SuperSecretRepPassword2024!
```

---

## 3) Module — Sauvegardes Physiques & Restauration PITR avec `pgBackRest` (2h)

### 📖 Narration/Intuition

Une réplication HA protège contre les pannes matérielles, mais **pas contre les erreurs humaines ou les attaques de Ransomware** ! Si un administrateur supprime accidentellement une table financière (`DROP TABLE`), la suppression est immédiatement répliquée sur tous les serveurs secondaires !

Pour réparer cette erreur, il faut une sauvegarde physique complète (Full Backup) combinée à l'archivage continu des journaux WAL pour réaliser une **Restauration à un instant précis (Point-In-Time Recovery - PITR)**, permettant de remonter le temps exactement à 14h29m59s, une seconde avant l'erreur.

### 🔍 Anatomie Technique

**Commandes `pgBackRest` pour Sauvegarde & Restauration PITR :**

```bash
# 1. Configurer le dépôt de sauvegarde pgBackRest (/etc/pgbackrest/pgbackrest.conf)
# 2. Exécuter une sauvegarde physique complète à chaud (Full Backup)
pgbackrest --stanza=bcc_db --type=full backup

# 3. Lancer une sauvegarde différentielle (uniquement les blocs modifiés)
pgbackrest --stanza=bcc_db --type=diff backup

# 4. RESTAURATION PITR : Remonter le temps jusqu'à 14h29:59 (Avant l'incident)
# Étape 1: Arrêter l'instance PostgreSQL
sudo systemctl stop postgresql

# Étape 2: Lancer la restauration ciblée dans le temps avec pgBackRest
pgbackrest --stanza=bcc_db \
           --type=time \
           --target="2026-08-06 14:29:59+02" \
           --target-action=promote restore

# Étape 3: Redémarrer PostgreSQL — La base est restaurée à la seconde près !
sudo systemctl start postgresql
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PITR** | Point-In-Time Recovery — Restauration à un instant précis dans le passé |
| **HA** | High Availability — Architecture informatique à haute disponibilité |
| **Patroni** | Solution d'orchestration et de failover automatique pour clusters PostgreSQL |
| **etcd** | Base de données clé-valeur distribuée utilisée pour le consensus de cluster (Patroni / Kubernetes) |
| **pgBackRest** | Outil officiel et performant de sauvegarde/restauration physique pour PostgreSQL |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence majeure entre une **sauvegarde logique (`pg_dump`)** et une **sauvegarde physique (`pgBackRest`)** dans le contexte d'une base de données bancaire de 2 Terabytes ?

**Corrigé :** Une **sauvegarde logique (`pg_dump`)** extrait le contenu de la base sous forme d'instructions SQL texte (`CREATE TABLE`, `INSERT`). Pour une base de 2 TB, l'extraction prend des heures, la restauration nécessite de réexécuter toutes les requêtes SQL et de recontrstruire tous les index (pouvant prendre plus de 24h), et elle **ne permet pas la restauration PITR**. Une **sauvegarde physique (`pgBackRest`)** copie directement les blocs de fichiers binaires sur le disque ainsi que les journaux WAL. La restauration est extrêmement rapide (simple copie de fichiers à la vitesse du disque) et permet la restauration **PITR** à la seconde près.

**Exercice 2 :** Dans un cluster PostgreSQL avec **Patroni** et **etcd**, que se passe-t-il si le câble réseau entre le datacenter principal (Kinshasa) et le datacenter secondaire (Lubumbashi) est coupé (Partition réseau / Split-Brain) ?

**Corrigé :** Patroni utilise l'algorithme de consensus **Raft via etcd** avec un nombre impair de nœuds (quorums, ex: 3 nœuds). Si le réseau est coupé, le côté qui possède la majorité des nœuds (le Quorum, au moins 2 nœuds sur 3) conserve la maîtrise du cluster. Le côté isolé qui se retrouve en minorité ne peut pas obtenir le "Leader Lock" dans etcd : Patroni passe immédiatement la base de données isolée en mode **Lecture Seule (Read-Only)** ou l'éteint pour éviter que deux serveurs primaires n'écrivent des données divergentes en même temps (prévention absolue du phénomène de **Split-Brain**).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle technologie de réplication native PostgreSQL envoie les enregistrements du journal WAL en continu vers un serveur secondaire ?
- A) Streaming Replication (Réplication par flux)
- B) Copie FTP
- C) Export Excel
- D) E-mail

**Réponse : A**

**Q2 :** Quel outil open-source s'appuie sur etcd pour orchestrer le basculement automatique (Failover) d'un cluster PostgreSQL en cas de panne du maître ?
- A) Patroni
- B) Word
- C) Paint
- D) Solitaire

**Réponse : A**

**Q3 :** Quelle fonctionnalité essentielle des sauvegardes physiques PostgreSQL permet de restaurer une base de données à un instant précis dans le passé (ex: 14h29:59) ?
- A) PITR (Point-In-Time Recovery)
- B) Formatage du disque
- C) Installation d'antivirus
- D) Redémarrage du routeur

**Réponse : A**

**Q4 :** Quel est l'avantage principal de la réplication synchrone par rapport à la réplication asynchrone ?
- A) Elle garantit un RPO de 0 (aucune perte de transaction) en attendant l'écriture sur le disque du secondaire avant de valider le commit
- B) Elle est plus rapide
- C) Elle ne nécessite pas de réseau
- D) Elle utilise moins de RAM

**Réponse : A**

**Q5 :** Quel outil de sauvegarde physique d'entreprise est recommandé pour PostgreSQL pour réaliser des sauvegardes parallèles, compressées et chiffrées avec support PITR ?
- A) pgBackRest
- B) Notepad
- C) WinZip
- D) Paint

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
