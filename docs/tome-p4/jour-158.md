# TOME P4 — Cloud, DevOps & SecOps — Jour 158 (6h) : Bases de Données NoSQL, Clé-Valeur & Cache In-Memory (Redis, Memcached & Sécurisation des Caches)

> [!NOTE]
> **Objectif du jour :** Comprendre l'architecture des bases de données NoSQL clé-valeur et des systèmes de cache In-Memory : structures de données avancées dans Redis (Strings, Hashes, Lists, Sets, Sorted Sets, Pub/Sub), patterns de mise en cache (Cache-Aside, Write-Through), persistance disque (RDB vs AOF), et sécurisation d'un cluster Redis en production bancaire (Authentification ACL, TLS/SSL, restriction des commandes dangereuses).
>
> **Compétences visées :** `BIT-05` (A) — Architectures NoSQL & Caches In-Memory | `SEC-05` (A) — Sécurisation des Caches & Sessions Redis

---

## 1) Module — Fondamentaux du NoSQL & Architecture Redis In-Memory (2h)

### 📖 Narration/Intuition

En 2026, l'application mobile de la Banque Centrale du Congo (BCC) compte 2 millions d'utilisateurs actifs. Si chaque utilisateur qui ouvre l'application interroge la base de données PostgreSQL pour vérifier la validité de sa session ou lire le cours du Franc Congolais en temps réel, le SGBDR relationnel va s'effondrer sous la charge.

**Redis (Remote Dictionary Server)** est un magasin de structure de données In-Memory ultra-rapide fonctionnant entièrement en mémoire RAM. Il est capable d'exécuter plus de **100 000 opérations par seconde avec des temps de réponse inférieurs à 1 milliseconde**.

### 🔍 Anatomie Technique

**Structures de Données Principales dans Redis :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STRUCTURES DE DONNÉES REDIS                           │
├──────────────┬──────────────────────────────────────────────────────────────┤
│ Strings      │ Valeurs texte/binaire simples. Max 512MB (ex: Tokens JWT).   │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Hashes       │ Cartes clé-valeur (Objets JSON plat). Idéal pour les profils.│
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Lists        │ Listes ordonnées de chaînes. Idéal pour les files de messages│
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Sets         │ Collections d'éléments uniques non ordonnés. (Anti-doublons) │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Sorted Sets  │ Sets triés par un score numérique (Leaderboards, Rate Limit).│
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Pub/Sub      │ Système de messagerie Publish/Subscribe en temps réel.       │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Patterns de Caching & Persistance Disque (RDB vs AOF) (2h)

### 📖 Narration/Intuition

Redis est en mémoire RAM, mais que se passe-t-il si le serveur s'éteint ? Tout est-il perdu ?

Redis propose deux mécanismes complémentaires de persistance sur disque :
1. **RDB (Redis Database Snapshotting)** : Prends des photos numériques (Snapshots) de l'ensemble de la mémoire à intervalles réguliers (ex: toutes les 15 minutes). Ultra-rapide au redémarrage, mais risque de perte des dernières minutes en cas de crash.
2. **AOF (Append-Only File)** : Enregistre chaque commande d'écriture dans un journal séquentiel sur disque (similaire au WAL de PostgreSQL). RPO proche de zéro.

### 🔍 Anatomie Technique

**Pattern d'architecture de cache "Cache-Aside" (Read-Through) :**

```
 [ Client Web / Mobile ]
            │
            ├──► 1. Vérifier si la donnée est dans le Cache (Redis)
            │       │
            │       ├── (Cache HIT) ──► Retourner la donnée immédiatement (< 1ms)
            │       │
            │       └── (Cache MISS) ─► 2. Lire la donnée dans PostgreSQL
            │                               │
            │                               └──► 3. Stocker dans Redis (avec TTL)
            │                                       │
            └───────────────────────────────────────┴──► Retourner au client
```

---

## 3) Module — Laboratoire Pratique : CLI Redis & Durcissement Sécurité (2h)

### 📖 Narration/Intuition

En 2023, des milliers d'instances Redis non sécurisées exposées sur Internet sans mot de passe ont été compromises par des Crypto-miners. En production bancaire, Redis doit être rigoureusement durci.

### 🔍 Anatomie Technique

**Durcissement Sécurité d'un serveur Redis (`redis.conf`) :**

```ini
# Configuration de sécurité Redis d'Entreprise (BCC Production)

# 1. Écouter uniquement sur l'interface réseau privée du VPC
bind 10.100.2.15 127.0.0.1
protected-mode yes
port 6379

# 2. Exiger le chiffrement TLS 1.3 obligatoire
tls-port 6380
tls-cert-file /etc/redis/tls/redis.crt
tls-key-file /etc/redis/tls/redis.key
tls-ca-cert-file /etc/redis/tls/ca.crt

# 3. Contrôle d'accès strict via Redis ACL (Access Control Lists)
# Ne plus utiliser 'requirepass' global, préférer des utilisateurs ACL
user default off
user app_bancaire on >PasswordUltraSecurise2026! ~session:* ~cache:* +@read +@write +@string -FLUSHALL -KEYS

# 4. Désactiver ou renomer les commandes dangereuses d'administration
rename-command FLUSHALL "BCC_DISABLED_FLUSHALL"
rename-command FLUSHDB  "BCC_DISABLED_FLUSHDB"
rename-command CONFIG   "BCC_DISABLED_CONFIG"
rename-command KEYS     "BCC_DISABLED_KEYS"
```

**Exemple de commandes Redis CLI (`redis-cli`) :**

```bash
# Connexion sécurisée avec TLS et authentification ACL
redis-cli -h 10.100.2.15 -p 6380 --tls --cacert /etc/redis/tls/ca.crt -u app_bancaire

# 1. Stocker une session utilisateur avec expiration automatique (TTL = 3600s)
10.100.2.15:6380> SETEX session:usr_9988 3600 "{"user_id": 9988, "role": "ADMIN"}"
OK

# 2. Lire la session
10.100.2.15:6380> GET session:usr_9988
"{"user_id": 9988, "role": "ADMIN"}"

# 3. Vérifier le temps restant (Time To Live)
10.100.2.15:6380> TTL session:usr_9988
(integer) 3542

# 4. Compteur atomique pour le Rate-Limiting (Limitation de débit d'API)
10.100.2.15:6380> INCR ratelimit:ip_196.200.4.1
(integer) 1
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Redis** | Remote Dictionary Server — SGBD NoSQL In-Memory clé-valeur ultrarapide |
| **TTL** | Time To Live — Durée de vie automatique d'une clé en mémoire avant suppression |
| **RDB** | Redis Database — Mode de persistance disque par snapshots ponctuels |
| **AOF** | Append-Only File — Mode de persistance disque par journalisation d'écriture continue |
| **ACL** | Access Control List — Système de gestion granulaire des utilisateurs et commandes Redis |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi l'utilisation de la commande **`KEYS *`** est-elle strictement interdite sur un serveur Redis en production, et quelle alternative faut-il utiliser ?

**Corrigé :** Redis est un système **monothreadé** (Single-threaded event loop). Lorsqu'il exécute une commande, aucune autre commande ne peut être traitée en même temps. La commande `KEYS *` parcourt l'intégralité de la base de données mémoire pour trouver toutes les clés. Sur un serveur contenant des millions de clés, `KEYS *` bloque le thread unique de Redis pendant plusieurs secondes (voire minutes), entraînant une indisponibilité totale du cache et le plantage des applications clientes (Timeout). L'alternative obligatoire en production est la commande **`SCAN`** qui parcourt les clés de manière incrémentale par curseur sans jamais bloquer le serveur.

**Exercice 2 :** Quelle est la différence entre le pattern de mise en cache **Cache-Aside** et le pattern **Write-Through** ?

**Corrigé :** Dans le pattern **Cache-Aside**, l'application interroge d'abord le cache. En cas d'échec (Cache Miss), l'application lit elle-même la BDD et met à jour le cache manuellement. Le cache est passif. Dans le pattern **Write-Through**, lorsque l'application écrit une donnée, elle l'écrit **directement dans le composant de cache**, qui se charge d'écrire immédiatement et de manière transparente la donnée dans la base de données sous-jacente. La donnée en cache est toujours garantie à jour.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la caractéristique principale d'architecture de Redis qui lui permet de traiter plus de 100 000 opérations par seconde avec une latence sub-milliseconde ?
- A) Le stockage des données entièrement en mémoire RAM (In-Memory)
- B) L'utilisation de disques disquettes
- C) L'absence d'électricité
- D) La compilation HTML

**Réponse : A**

**Q2 :** Quel mécanisme de persistance disque Redis enregistre chaque commande d'écriture dans un journal séquentiel pour garantir un RPO proche de zéro en cas de panne ?
- A) AOF (Append-Only File)
- B) RDB
- C) ZIP
- D) TAR

**Réponse : A**

**Q3 :** Quelle commande Redis permet de définir une clé tout en lui attribuant un temps de vie automatique (TTL en secondes) après lequel elle sera automatiquement supprimée de la mémoire ?
- A) `SETEX`
- B) `DELETE`
- C) `FORMAT`
- D) `CREATE`

**Réponse : A**

**Q4 :** Pourquoi la commande `KEYS *` doit-elle être désactivée (`rename-command KEYS ""`) sur un serveur Redis en production bancaire ?
- A) Parce qu'elle est monothreadée et bloque l'ensemble du serveur Redis pendant le parcours de toutes les clés, causant un déni de service (DoS)
- B) Parce qu'elle efface toutes les données
- C) Parce qu'elle augmente la facture d'électricité
- D) Parce qu'elle redémarre le routeur

**Réponse : A**

**Q5 :** Dans Redis, quelle structure de données associe chaque élément à un score numérique pour maintenir automatiquement une liste ordonnée (idéale pour le Rate Limiting) ?
- A) Sorted Sets (ZSET)
- B) Strings
- C) Blobs
- D) MP3

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
