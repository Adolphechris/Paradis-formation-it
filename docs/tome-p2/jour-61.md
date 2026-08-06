# TOME P2 — Réseaux & Télécoms — Jour 61 (6h) : Commutation Avancée & Haute Disponibilité L2

> [!NOTE]
> **Objectif du jour :** Maîtriser les mécanismes de sécurité et de redondance de la couche 2 : Port Security, DAI, IP Source Guard, EtherChannel (agrégation de liens), et les protocoles de redondance de passerelle (HSRP/VRRP). Ces technologies sont indispensables pour concevoir une infrastructure réseau bancaire résiliente.
>
> **Compétences visées :** `BIT-04` (A) — Commutation Avancée & Haute Disponibilité L2

---

## 1) Module — Sécurité de la Commutation L2 (2h)

### 📖 Narration/Intuition

Un switch non sécurisé est une porte ouverte aux attaques de couche 2 : MAC flooding, ARP poisoning, DHCP starvation. Ces attaques peuvent permettre à un attaquant sur le réseau interne de capturer tout le trafic (MITM) sans jamais toucher au pare-feu. Dans une banque centrale, où chaque transaction est critique, ces protections sont obligatoires.

### 🔍 Anatomie Technique

**Port Security — Limitation des adresses MAC par port :**

```bash
# Contexte : Switch Cisco IOS (configuration simulée avec concepts Linux)
# En environnement Linux : équivalent via ebtables ou nftables bridge

# Sur un switch manageable, Port Security :
# - Limite le nombre d'adresses MAC autorisées par port
# - Définit l'action en cas de violation (protect, restrict, shutdown)

# Simulation du concept sous Linux (bridge + ebtables)
apt install ebtables bridge-utils

# Créer un bridge
ip link add br0 type bridge
ip link set eth1 master br0
ip link set br0 up

# Limiter les sources MAC autorisées sur eth1 (équivalent Port Security)
ebtables -A FORWARD -i eth1 ! --source aa:bb:cc:dd:ee:ff -j DROP
ebtables -A FORWARD -i eth1 --source aa:bb:cc:dd:ee:ff -j ACCEPT

# Afficher les règles
ebtables -L FORWARD

# Table MAC du bridge Linux
bridge fdb show       # Équivalent "show mac address-table"
bridge fdb show dev eth1
```

**Dynamic ARP Inspection (DAI) — Protection contre ARP Spoofing :**

```bash
# ARP Spoofing : un attaquant envoie de fausses réponses ARP pour se positionner
# entre deux hôtes (MITM). DAI vérifie que les paquets ARP correspondent
# à la table de liaisons DHCP (DHCP Snooping Binding Table).

# Détection d'ARP Spoofing avec arpwatch (Linux)
apt install arpwatch
systemctl enable --now arpwatch

# Surveiller les changements de couple IP-MAC
tail -f /var/log/syslog | grep arpwatch

# Protection active avec arptables
arptables -A INPUT --source-ip 192.168.1.1 ! --source-mac aa:bb:cc:dd:ee:01 -j DROP

# Inspection manuelle de la table ARP
arp -n
ip neigh show
ip neigh show dev eth0 | grep -v FAILED

# Vider et reconstruire le cache ARP
ip neigh flush dev eth0

# Outil de détection : arpspoof (Kali Linux - usage défensif/test)
# sudo arpspoof -i eth0 -t 192.168.1.1 192.168.1.100  # À ne pas faire sans autorisation !
```

**DHCP Snooping — Protection de l'infrastructure DHCP :**

```bash
# DHCP Snooping : différencie les ports "trusted" (vers le serveur DHCP légit)
# et "untrusted" (ports clients). Bloque les réponses DHCP sur les ports untrusted.

# Simulation Linux : filtrer les réponses DHCP (port 68) venant des clients
# via nftables sur le bridge
nft add table bridge filter
nft add chain bridge filter FORWARD '{ type filter hook forward priority 0; }'

# Bloquer les paquets BOOTP/DHCP Reply (src port 67) sur les ports non-fiables
nft add rule bridge filter FORWARD iif "eth1" udp sport 67 drop
nft add rule bridge filter FORWARD iif "eth0" udp sport 67 accept  # Port trusted

# Vérification
nft list ruleset
```

---

## 2) Module — EtherChannel : Agrégation de Liens (2h)

### 📖 Narration/Intuition

EtherChannel (ou Link Aggregation) permet de regrouper plusieurs liens physiques en un seul lien logique de plus grande capacité. Au lieu d'un seul lien 1 Gbps entre deux switches, on crée un lien logique de 4 Gbps avec 4 liens physiques — et si un lien tombe, les autres prennent le relais sans interruption.

**LACP (Link Aggregation Control Protocol, 802.3ad)** est le standard ouvert. **PAgP (Port Aggregation Protocol)** est propriétaire Cisco.

### 🔍 Anatomie Technique

**Configuration EtherChannel / LACP sous Linux (bonding) :**

```bash
# Méthode 1 : bonding kernel Linux (mode LACP = mode 4)
apt install ifenslave

# Charger le module bonding
modprobe bonding

# Créer l'interface bond0 en mode 802.3ad (LACP)
ip link add bond0 type bond
ip link set bond0 type bond mode 802.3ad

# Attacher les interfaces physiques au bond
ip link set eth1 down && ip link set eth1 master bond0
ip link set eth2 down && ip link set eth2 master bond0

# Activer le bond
ip link set bond0 up

# Vérification
cat /proc/net/bonding/bond0    # État détaillé du bond
ip addr show bond0
```

```bash
# Méthode 2 : NetworkManager (configuration persistante)
nmcli con add type bond con-name bond0 ifname bond0 bond.options "mode=802.3ad,miimon=100"
nmcli con add type ethernet con-name bond0-slave1 ifname eth1 master bond0
nmcli con add type ethernet con-name bond0-slave2 ifname eth2 master bond0
nmcli con up bond0

# Méthode 3 : Netplan (Ubuntu 20.04+)
cat > /etc/netplan/01-bond.yaml << 'EOF'
network:
  version: 2
  bonds:
    bond0:
      interfaces: [eth1, eth2]
      parameters:
        mode: 802.3ad             # LACP
        lacp-rate: fast           # Échange LACP toutes les secondes
        mii-monitor-interval: 100 # Sondage MII toutes les 100ms
      dhcp4: no
      addresses: [192.168.10.1/24]
EOF
netplan apply

# Vérification et diagnostics
cat /proc/net/bonding/bond0
ip -d link show bond0           # Mode, slaves actifs
ethtool bond0                   # Vitesse et duplex du bond
```

**Modes de load balancing (répartition de charge) :**

| Mode | Algorithme | Avantage |
|:---:|:---|:---|
| `balance-rr` (0) | Round-Robin | Simple, mais reséquencement |
| `active-backup` (1) | Failover actif/passif | Très fiable |
| `balance-xor` (2) | XOR des MACs | Stable par flux |
| `broadcast` (3) | Envoi sur tous les liens | Redondance totale |
| **`802.3ad`** (4) | **LACP standard IEEE** | **Recommandé en prod** |
| `balance-tlb` (5) | Adaptive Transmit LB | Sans support switch |
| `balance-alb` (6) | Adaptive Load Balancing | Sans support switch |

---

## 3) Module — HSRP & VRRP : Redondance de Passerelle (2h)

### 📖 Narration/Intuition

Un seul routeur de passerelle par défaut est un **Single Point of Failure (SPOF)**. Si la passerelle tombe, tout le segment réseau perd l'accès à Internet/WAN — inacceptable pour une banque centrale. Les protocoles **FHRP (First Hop Redundancy Protocols)** résolvent ce problème en créant une **IP et MAC virtuelle** partagée par plusieurs routeurs. Si le routeur actif tombe, le routeur de secours prend la relève en quelques secondes.

**HSRP** (Hot Standby Router Protocol) est propriétaire Cisco. **VRRP** (Virtual Router Redundancy Protocol, RFC 5798) est le standard ouvert — utilisé sur Linux.

### 🔍 Anatomie Technique

**VRRP sur Linux avec `keepalived` :**

```bash
# Installation de keepalived (implémentation VRRP sous Linux)
apt install keepalived

# Configuration du MASTER (Routeur 1 - 192.168.1.254)
cat > /etc/keepalived/keepalived.conf << 'EOF'
vrrp_instance VR_GATEWAY {
    state MASTER                  # Ce routeur démarre comme MASTER
    interface eth0                # Interface sur laquelle VRRP tourne
    virtual_router_id 51          # ID VRID (même sur tous les routeurs du groupe)
    priority 150                  # Priorité plus haute = MASTER (150 > 100)
    advert_int 1                  # Intervalle d'annonce VRRP (secondes)
    
    authentication {
        auth_type PASS            # Authentification simple par mot de passe
        auth_pass BCC_VRRP_2024  # Même secret sur tous les routeurs
    }
    
    virtual_ipaddress {
        192.168.1.1/24           # IP virtuelle partagée (passerelle des clients)
    }
    
    # Script de vérification de santé (optionnel)
    track_script {
        check_gateway
    }
}

# Script de vérification (optionnel)
vrrp_script check_gateway {
    script "/usr/bin/curl -sf http://8.8.8.8 -o /dev/null"
    interval 5     # Vérifie toutes les 5 secondes
    fall 3         # 3 échecs → réduction de priorité
    rise 2         # 2 succès → restauration
}
EOF

# Configuration du BACKUP (Routeur 2 - 192.168.1.253)
cat > /etc/keepalived/keepalived.conf << 'EOF'
vrrp_instance VR_GATEWAY {
    state BACKUP                  # Ce routeur démarre comme BACKUP
    interface eth0
    virtual_router_id 51          # Même VRID !
    priority 100                  # Priorité plus basse = BACKUP
    advert_int 1
    
    authentication {
        auth_type PASS
        auth_pass BCC_VRRP_2024  # Même secret !
    }
    
    virtual_ipaddress {
        192.168.1.1/24           # Même IP virtuelle !
    }
}
EOF

# Démarrer keepalived
systemctl enable --now keepalived

# Vérification
ip addr show eth0          # L'IP virtuelle 192.168.1.1 doit apparaître sur le MASTER
journalctl -u keepalived -f  # Logs de transition MASTER/BACKUP

# Tester le failover
systemctl stop keepalived  # Sur le MASTER → le BACKUP prend l'IP virtuelle
```

**Vérification du comportement de basculement :**

```bash
# Sur un hôte client (ping continu vers l'IP virtuelle)
ping -c 1000 192.168.1.1   # Quelques pings perdus lors du basculement max

# Monitoring avec tcpdump (observer les annonces VRRP)
tcpdump -i eth0 vrrp
# Paquet VRRP : src=192.168.1.254, dst=224.0.0.18 (multicast VRRP), proto=VRRP

# Surveiller les transitions dans syslog
grep "keepalived" /var/log/syslog | tail -20
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DAI** | Dynamic ARP Inspection — inspection dynamique des trames ARP |
| **DHCP Snooping** | Mécanisme de filtrage des trames DHCP non autorisées |
| **LACP** | Link Aggregation Control Protocol — protocole d'agrégation de liens IEEE 802.3ad |
| **PAgP** | Port Aggregation Protocol — protocole d'agrégation propriétaire Cisco |
| **HSRP** | Hot Standby Router Protocol — protocole propriétaire Cisco de redondance de passerelle |
| **VRRP** | Virtual Router Redundancy Protocol — standard IEEE de redondance de passerelle |
| **FHRP** | First Hop Redundancy Protocol — famille de protocoles de redondance de passerelle |
| **SPOF** | Single Point of Failure — point unique de défaillance |
| **VRID** | Virtual Router IDentifier — identifiant du groupe VRRP |
| **MII** | Media Independent Interface — interface de supervision du lien physique |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Configurez un bond LACP entre `eth2` et `eth3` avec l'IP statique `10.0.10.1/28` via Netplan.

**Corrigé :**
```yaml
network:
  version: 2
  bonds:
    bond0:
      interfaces: [eth2, eth3]
      parameters:
        mode: 802.3ad
        lacp-rate: fast
        mii-monitor-interval: 100
      addresses: [10.0.10.1/28]
```

**Exercice 2 :** Dans une architecture VRRP à deux routeurs (priorités 150 et 100), que se passe-t-il si le MASTER retrouve la connectivité après un failover ?

**Corrigé :** Si `preempt` est activé (comportement par défaut de keepalived), le MASTER reprend automatiquement l'IP virtuelle dès que sa priorité redevient supérieure. Si `nopreempt` est configuré, le BACKUP conserve le rôle de MASTER jusqu'à la prochaine panne.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est l'objectif principal de Dynamic ARP Inspection (DAI) ?
- A) Accélérer la résolution ARP
- B) Prévenir les attaques ARP Spoofing en validant les trames ARP contre la table DHCP Snooping
- C) Compresser les paquets ARP pour optimiser la bande passante
- D) Remplacer le protocole ARP par IPv6

**Réponse : B**

**Q2 :** Un bond en mode `802.3ad` (LACP) composé de 4 liens 1 Gbps offre une capacité théorique de :
- A) 1 Gbps (seul un lien est actif)
- B) 2 Gbps (un lien pour TX, un pour RX)
- C) 4 Gbps (agrégation des 4 liens actifs)
- D) 10 Gbps (le LACP multiplie la capacité)

**Réponse : C**

**Q3 :** Dans un groupe VRRP, quel routeur détient l'IP virtuelle ?
- A) Le routeur avec la priorité la plus basse
- B) Le routeur avec la priorité la plus haute (MASTER)
- C) Tous les routeurs partagent l'IP virtuelle simultanément
- D) Le routeur désigné aléatoirement à chaque démarrage

**Réponse : B**

**Q4 :** Quelle commande Linux permet de vérifier l'état d'un bond LACP en temps réel ?
- A) `ip link show bond0`
- B) `cat /proc/net/bonding/bond0`
- C) `ethtool --show-bond bond0`
- D) `ifconfig bond0 status`

**Réponse : B**

**Q5 :** Le DHCP Snooping différencie les ports "trusted" et "untrusted". Quelle affirmation est correcte ?
- A) Les ports trusted acceptent toutes les trames, y compris les réponses DHCP frauduleuses
- B) Les ports untrusted ne peuvent pas envoyer de requêtes DHCP
- C) Les ports untrusted ne peuvent pas envoyer de réponses DHCP (OFFER/ACK) — seuls les ports trusted le peuvent
- D) Les ports trusted sont uniquement les ports vers Internet

**Réponse : C**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
