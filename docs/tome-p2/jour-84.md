# TOME P2 — Réseaux & Télécoms — Jour 84 (6h) : Haute Disponibilité & Clustering (HAProxy, Keepalived & Pacemaker)

> [!NOTE]
> **Objectif du jour :** Concevoir, déployer et administrer des architectures système et réseau à haute disponibilité (HA) : répartition de charge (Load Balancing) de niveau 4 et 7 avec HAProxy, basculement d'IP virtuelle (VIP) avec Keepalived (VRRP), et gestion de clusters de serveurs critiques avec Pacemaker / Corosync.
>
> **Compétences visées :** `BIT-04` (A) — Architectures Haute Disponibilité | `SEC-03` (A) — Résilience des Infrastructures Critiques

---

## 1) Module — Load Balancing Niveau 4 et 7 avec HAProxy (2h)

### 📖 Narration/Intuition

Un seul serveur Web ou API représente un point de défaillance unique (SPOF - Single Point of Failure). Si le serveur tombe ou nécessite une maintenance, l'ensemble des services de l'application s'arrête. 

**HAProxy** est le répartiteur de charge (Load Balancer) le plus rapide et le plus fiable du monde Open Source. Il agit comme un chef d'orchestre devant un pool de serveurs d'arrière-plan (Backend Servers) : il distribue les requêtes entrantes, surveille l'état de santé des serveurs (Health Checks) et retire automatiquement du pool tout serveur défaillant en moins d'une seconde.

### 🔍 Anatomie Technique

**Différence entre Load Balancing Couche 4 (L4) et Couche 7 (L7) :**

```
- Couche 4 (Transport - TCP/UDP) : HAProxy prend ses décisions uniquement sur l'adresse IP et le Port.
  Le trafic n'est pas déchiffré (Pass-through SSL). C'est ultra rapide et stateless.
- Couche 7 (Application - HTTP/HTTPS/gRPC) : HAProxy inspecte l'en-tête HTTP, l'URL, les cookies ou le SNI TLS.
  Permet le routage intelligent (ex: /api → pool-api, /static → pool-cdn, d'après les cookies de session).
```

**Architecture HAProxy Multi-Backend (`/etc/haproxy/haproxy.cfg`) :**

```haproxy
global
    log /dev/log local0
    log /dev/log local1 notice
    chroot /var/lib/haproxy
    user haproxy
    group haproxy
    daemon
    stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    maxconn 50000

defaults
    log     global
    mode    http
    option  httplog
    option  dontlognull
    timeout connect 5000ms
    timeout client  50000ms
    timeout server  50000ms
    retries 3

# ─── Interface d'administration & Statistiques ────────────────────────────────
listen stats
    bind 10.0.10.100:9000
    mode http
    stats enable
    stats uri /
    stats refresh 5s
    stats auth admin:HAProxy_Stats_2024!

# ─── Frontend HTTPS (Port 443) ────────────────────────────────────────────────
frontend ft_bcc_https
    bind 10.0.10.100:443 ssl crt /etc/haproxy/certs/app-bundle.pem alpn h2,http/1.1
    mode http

    # En-têtes de sécurité et IP réelle transmise aux backends
    option forwardfor
    http-request set-header X-Forwarded-Proto https

    # Inspection L7 : Routage basé sur le chemin d'URL
    acl is_api path_beg /api/
    acl is_auth path_beg /auth/

    use_backend bk_bcc_api if is_api
    use_backend bk_bcc_auth if is_auth
    default_backend bk_bcc_web

# ─── Backends (Serveurs d'arrière-plan) ───────────────────────────────────────
backend bk_bcc_api
    mode http
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    # Serveurs d'arrière-plan avec vérification de santé toutes les 2s
    server api-node-01 10.0.20.11:8080 check inter 2000ms rise 2 fall 3
    server api-node-02 10.0.20.12:8080 check inter 2000ms rise 2 fall 3
    server api-node-03 10.0.20.13:8080 check backup inter 2000ms  # Serveur de secours

backend bk_bcc_web
    mode http
    balance leastconn    # Redirige vers le serveur avec le moins de connexions actives
    cookie SRVNAME insert indirect nocache
    server web-node-01 10.0.20.21:80 cookie s1 check
    server web-node-02 10.0.20.22:80 cookie s2 check
```

---

## 2) Module — Redondance de Load Balancer avec Keepalived (VRRP) (2h)

### 📖 Narration/Intuition

Avoir un HAProxy devant 10 serveurs protège contre la panne des serveurs... mais que se passe-t-il si l'instance HAProxy elle-même tombe ? On retombe sur un Single Point of Failure.

La solution consiste à déployer **deux instances HAProxy identiques** (Master et Backup) partageant une **adresse IP Virtuelle (VIP)** grâce au protocole **VRRP (Virtual Router Redundancy Protocol)** implémenté par **Keepalived**. Les clients se connectent toujours à la VIP. Si le HAProxy Master ne répond plus, Keepalived bascule la VIP sur le HAProxy Backup en quelques millisecondes sans coupure visible.

### 3) Module — Clustering de Services avec Pacemaker & Corosync (2h)

Pour des services d'état (Stateful) comme les bases de données (PostgreSQL, MariaDB) ou les stockages partagés qui ne peuvent pas faire du simple Round-Robin, on utilise **Pacemaker** (le gestionnaire de ressources du cluster) associé à **Corosync** (la couche de communication et de quorum entre les nœuds). Pacemaker s'assure qu'une ressource critique tourne sur un et un seul nœud à la fois, et gère le basculement automatique avec escrime (STONITH / Fencing) pour éviter toute corruption de données.

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SPOF** | Single Point of Failure — Point de défaillance unique |
| **VIP** | Virtual IP Address — Adresse IP virtuelle partagée basculant dynamiquement |
| **VRRP** | Virtual Router Redundancy Protocol — Protocole de redondance de passerelle/IP (RFC 5798) |
| **HA** | High Availability — Haute Disponibilité |
| **STONITH** | Shoot The Other Node In The Head — Mécanisme de fencing pour isoler/éteindre un nœud défaillant |
| **ALPN** | Application-Layer Protocol Negotiation — Négociation du protocole (ex: HTTP/2) lors du handshake TLS |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre l'algorithme de répartition `roundrobin` et `leastconn` dans HAProxy ?

**Corrigé :** `roundrobin` distribue les requêtes aux serveurs du pool de manière séquentielle et équitable, l'une après l'autre (tour de rôle). `leastconn` redirige chaque nouvelle requête vers le serveur qui possède le **moins de connexions actives** à cet instant. `leastconn` est fortement recommandé pour les sessions longues (ex: connexions WebSocket, requêtes SQL/DB, téléchargements volumineux).

**Exercice 2 :** Dans un cluster Pacemaker / Corosync, qu'est-ce que le phénomène de **Split-Brain** et comment le mécanisme **STONITH** permet-il d'y remédier ?

**Corrigé :** Le **Split-Brain** se produit lorsque le lien de communication entre les nœuds d'un cluster est coupé. Chaque nœud croit que les autres sont morts et tente de prendre le contrôle des ressources partagées (ex: monter le disque en écriture). Cela entraîne une **corruption irréversible des données**. **STONITH** (Fencing) permet à un nœud de couper physiquement l'alimentation (via PDU/IPMI) ou de redémarrer de force le nœud suspecté défaillant *avant* de prendre la main sur les ressources, garantissant qu'un seul nœud accède aux données à un instant donné.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle option de configuration HAProxy permet d'insérer l'adresse IP réelle du client final dans un en-tête HTTP lorsque HAProxy fonctionne en mode HTTP (L7) ?
- A) option forwardfor
- B) option httpchk
- C) option dontlognull
- D) balance leastconn

**Réponse : A**

**Q2 :** Quel protocole Keepalived utilise-t-il pour faire communiquer les nœuds Master et Backup et gérer la bascule de l'IP Virtuelle (VIP) ?
- A) BGP
- B) VRRP
- C) OSPF
- D) SNMP

**Réponse : B**

**Q3 :** Que signifie l'acronyme STONITH dans le contexte des clusters de haute disponibilité Pacemaker ?
- A) System Tools On Network Interfaces To Host
- B) Shoot The Other Node In The Head
- C) Secure Terminal Operation Network In High-availability
- D) Standard Type Of Network Interface To Hardware

**Réponse : B**

**Q4 :** Si un serveur backend dans HAProxy est configuré avec l'attribut `backup` (ex: `server s2 10.0.0.2:80 check backup`), quand recevra-t-il du trafic ?
- A) Tout le temps, en partage de charge 50/50 avec les serveurs principaux
- B) Uniquement lorsque tous les serveurs principaux (non-backup) du pool sont hors service (DOWN)
- C) Une fois par heure pour tester son fonctionnement
- D) Uniquement pour les requêtes provenant de l'utilisateur root

**Réponse : B**

**Q5 :** Quel est le rôle principal de Corosync dans une pile de clustering Pacemaker / Corosync ?
- A) Offrir une interface Web de configuration
- B) Assurer la communication réseau sécurisée, la présence (heartbeat) et la gestion du Quorum entre les membres du cluster
- C) Compiler le code source de Pacemaker
- D) Redémarrer les serveurs Nginx

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
