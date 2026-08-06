# TOME P4 — Cloud, DevOps & SecOps — Jour 168 (6h) : Architectures de Données Géo-Distribuées & Réplication Multi-Régions (PostgreSQL BDR, CockroachDB & Geo-Partitioning)

> [!NOTE]
> **Objectif du jour :** Concevoir des architectures de bases de données distribuées à l'échelle multi-régionale (Multi-Region Active-Active) : bases de données SQL distribuées (CockroachDB, YugabyteDB), réplication logique et birectionnelle (BDR - Bi-Directional Replication), gestion du géo-partitionnement (Geo-Partitioning) et conformité à la souveraineté des données.
>
> **Compétences visées :** `BIT-05` (A) — Distributed SQL & Multi-Region DB | `SEC-05` (A) — Souveraineté & Géo-Partitionnement des Données

---

## 1) Module — Enjeux du Multi-Régions & Bases SQL Distribuées (2h)

### 📖 Narration/Intuition

La Banque Centrale du Congo (BCC) dispose de 3 sièges régionaux majeurs : Kinshasa (Ouest), Lubumbashi (Sud) et Goma (Est). Séparés par des milliers de kilomètres, la latence réseau entre Kinshasa et Lubumbashi est de 40 millisecondes.

Si toutes les écritures doivent obligatoirement être envoyées au serveur primaire de Kinshasa, un guichetier à Lubumbashi subit une latence inacceptable à chaque transaction. Pour résoudre ce problème, on déploie une **base de données SQL distribuée Active-Active (CockroachDB / YugabyteDB)** où chaque région possède son nœud actif local tout en maintenant un consensus distribué global (**Raft**).

### 🔍 Anatomie Technique

**Comparaison Base Monolithique vs Base SQL Distribuée :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     MONOLITHIQUE vs DISTRIBUÉE (COCKROACHDB)                │
├──────────────┬──────────────────────────────────────────────────────────────┤
│ Caractéristique│ SGBDR Traditionnel (PostgreSQL Mono-Master)                │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Écritures    │ Uniquement sur le nœud Primaire (Single point write).         │
│ Latence Multi│ Élevée pour les régions éloignées du nœud Primaire.         │
│ Résilience   │ Basculement manuel ou via orchestreur (Patroni - RTO > 0).   │
├──────────────┼──────────────────────────────────────────────────────────────┤
│              │ SQL Distribué (CockroachDB / YugabyteDB)                     │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Écritures    │ Active-Active sur N'IMPORTE QUEL nœud du cluster global.    │
│ Latence Multi│ Faible grâce au Géo-Partitionnement (Local Read/Write).      │
│ Résilience   │ Tolérance aux pannes de datacenters entiers (RPO=0, RTO=0).  │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Géo-Partitionnement & Souveraineté des Données (2h)

### 📖 Narration/Intuition

En vertu des lois de souveraineté numérique bancaire en RDC, les données financières des citoyens de la province du Katanga doivent obligatoirement résider physiquement sur les serveurs du datacenter de Lubumbashi, tandis que celles du Kivu doivent résider à Goma.

Le **Géo-Partitionnement (Geo-Partitioning)** de CockroachDB permet de placer des lignes spécifiques d'une même table SQL sur des nœuds physiques situés dans des régions géographiques différentes grâce à des contraintes de localisation.

### 🔍 Anatomie Technique

**Configuration du Géo-Partitionnement dans CockroachDB SQL (`geo_partitioning.sql`) :**

```sql
-- 1. Définition de la table des comptes avec colonne de localisation régionale
CREATE TABLE comptes_nationaux (
    compte_id UUID NOT NULL DEFAULT gen_random_uuid(),
    region_code VARCHAR(20) NOT NULL, -- 'kinshasa', 'katanga', 'kivu'
    client_id UUID NOT NULL,
    solde DECIMAL(15,2) NOT NULL,
    PRIMARY KEY (region_code, compte_id)
);

-- 2. Configuration des règles de Géo-Partitionnement CockroachDB
ALTER TABLE comptes_nationaux PARTITION BY LIST (region_code) (
    PARTITION p_kinshasa VALUES IN ('kinshasa'),
    PARTITION p_katanga VALUES IN ('katanga'),
    PARTITION p_kivu VALUES IN ('kivu')
);

-- 3. Attachement des partitions aux nœuds physiques de chaque datacenter
ALTER PARTITION p_kinshasa OF TABLE comptes_nationaux CONFIGURE ZONE USING constraints = '[+region=kinshasa]';
ALTER PARTITION p_katanga OF TABLE comptes_nationaux CONFIGURE ZONE USING constraints = '[+region=katanga]';
ALTER PARTITION p_kivu OF TABLE comptes_nationaux CONFIGURE ZONE USING constraints = '[+region=kivu]';
```

---

## 3) Module — Laboratoire Pratique : Déploiement d'un Cluster CockroachDB (2h)

### 📖 Narration/Intuition

Déployons un cluster CockroachDB multi-nœuds sécurisé avec certificats TLS et vérifions sa capacité à survivre à la destruction simulée d'un nœud complet (Tolérance aux pannes matérielles).

### 🔍 Anatomie Technique

**Démarrage d'un nœud CockroachDB distribué (`cockroach_start.sh`) :**

```bash
# 1. Démarrage d'un nœud CockroachDB sécurisé dans la région Katanga (Lubumbashi)
cockroach start \
  --certs-dir=/etc/cockroach/certs \
  --advertise-addr=10.200.1.15 \
  --join=10.100.1.10:26257,10.200.1.15:26257,10.300.1.20:26257 \
  --locality=region=katanga,datacenter=lubumbashi-dc1 \
  --store=/var/lib/cockroach/data \
  --cache=25% \
  --max-sql-memory=25% \
  --background

# 2. Vérification de l'état du cluster distribué multi-régions via la CLI SQL
cockroach sql --certs-dir=/etc/cockroach/certs --host=10.200.1.15

# Requête de vérification de l'état des nœuds :
SHOW NODES;
/*
id | address         | active | locality
---+-----------------+--------+---------------------------------------
1  | 10.100.1.10:26257| true   | region=kinshasa,datacenter=kin-dc1
2  | 10.200.1.15:26257| true   | region=katanga,datacenter=lub-dc1
3  | 10.300.1.20:26257| true   | region=kivu,datacenter=goma-dc1
*/
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CockroachDB** | SGBDR SQL distribué cloud-native hautement résilient (Inspiré de Google Spanner) |
| **BDR** | Bi-Directional Replication — Réplication birectionnelle Active-Active pour PostgreSQL |
| **Raft** | Algorithme de consensus distribué assurant la cohérence des données entre les nœuds |
| **UUID** | Universally Unique Identifier — Identifiant unique de 128 bits idéal pour les clés primaires distribuées |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi l'utilisation de séquences entières classiques (`SERIAL` / `AUTO_INCREMENT`) est-elle fortement déconseillée pour les clés primaires dans une base de données SQL distribuée multi-régions (CockroachDB / YugabyteDB), et par quoi faut-il les remplacer ?

**Corrigé :** Les séquences entières classiques (`SERIAL` / `1, 2, 3...`) nécessitent un générateur centralisé unique pour garantir l'unicité des numéros. Dans une architecture distribuée multi-régions, chaque création de ligne sur un nœud distant (ex: Lubumbashi) devrait interroger le générateur centralisé (ex: Kinshasa) par le réseau, créant un goulot d'étranglement majeur et une latence réseau inacceptable. Pour résoudre ce problème, il faut obligatoirement remplacer les entiers séquentiels par des **UUID (Universally Unique Identifier - v4 ou v7)** de 128 bits générés localement en mémoire sur chaque nœud sans aucune communication réseau tout en garantissant l'unicité globale.

**Exercice 2 :** Comment l'algorithme de consensus **Raft** dans CockroachDB parvient-il à maintenir un **RPO de 0 et un RTO de 0** en cas de destruction totale du datacenter d'une région ?

**Corrigé :** CockroachDB découpe les données en plages de clés (Ranges) et réplique chaque plage sur un nombre impair de nœuds (typiquement **3 ou 5 répliques** réparties sur 3 datacenters régionaux). Pour valider une transaction d'écriture, l'algorithme Raft exige la confirmation de la **majorité stricte** des répliques (Quorum : 2 sur 3, ou 3 sur 5). Si un datacenter entier est détruit (ex: Goma), les 2 datacenters restants (Kinshasa et Lubumbashi) possèdent toujours la majorité (2/3). Le cluster continue de lire et d'écrire sans aucune interruption de service (**RTO = 0**) et sans aucune perte de données (**RPO = 0**).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle technologie de base de données SQL distribuée cloud-native s'inspire de Google Spanner pour offrir des transactions ACID multi-régions en mode Active-Active ?
- A) CockroachDB (ou YugabyteDB)
- B) SQLite
- C) MS Access
- D) FoxPro

**Réponse : A**

**Q2 :** Quelle fonctionnalité avancée de CockroachDB permet de contraindre le stockage physique de certaines lignes d'une table SQL sur les nœuds d'un datacenter régional spécifique pour respecter les lois de souveraineté ?
- A) Geo-Partitioning (Géo-partitionnement)
- B) Export CSV
- C) Compress ZIP
- D) Format Disk

**Réponse : A**

**Q3 :** Quel type de clé primaire de 128 bits généré localement en mémoire sans communication réseau est recommandé pour les tables distribuées multi-régions ?
- A) UUID (Universally Unique Identifier)
- B) SERIAL (1, 2, 3...)
- C) Code postal
- D) Numéro de page

**Réponse : A**

**Q4 :** Dans CockroachDB, quel algorithme de consensus distribué garantit la cohérence des données entre les nœuds répliqués en exigeant le vote de la majorité (Quorum) ?
- A) Raft
- B) MD5
- C) SHA-1
- D) Ping

**Réponse : A**

**Q5 :** Quel est l'avantage principal d'une architecture de base de données Active-Active par rapport à une architecture Active-Passive traditionnelle ?
- A) Tous les nœuds de toutes les régions peuvent exécuter simultanément des transactions en lecture et en écriture sans attendre un failover
- B) Elle coûte moins cher
- C) Elle ne nécessite pas d'électricité
- D) Elle fonctionne sur disquette

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
