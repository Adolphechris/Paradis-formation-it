# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 126 (6h) : Sécurité de la Virtualisation de Réseaux & SDN Avancé (Open vSwitch, OVN, VXLAN & Network Virtualization Security)

> [!NOTE]
> **Objectif du jour :** Concevoir et sécuriser des réseaux virtuels logiciels d'entreprise (SDN / Network Virtualization) : Open vSwitch (OVS), OVN (Open Virtual Network), encapsulation Overlay VXLAN/NVGRE, micro-segmentation L2/L3 et isolation des réseaux virtuels de datacenters multi-tenants.
>
> **Compétences visées :** `BIT-04` (A) — Virtualisation Réseau & SDN | `SEC-04` (A) — Sécurité de l'Overlay Network & Open vSwitch

---

## 1) Module — Principes du SDN & Architecture Open vSwitch (OVS) (2h)

### 📖 Narration/Intuition

Dans un Datacenter virtualisé ou un Cloud privé, chaque serveur hyperviseur (KVM) héberge des dizaines de machines virtuelles (VMs) appartenant à des départements ou clients différents. Utiliser des commutateurs réseau physiques (Switches L2) pour gérer le trafic entre ces VMs créerait une dépendance matérielle ingérable et des limites de VLAN (4 096 VLANs max).

**Open vSwitch (OVS)** est un commutateur virtuel multicouche logiciel open-source qui s'exécute à l'intérieur du noyau Linux de l'hyperviseur. Il permet de créer des réseaux virtuels programmables, d'appliquer des règles de filtrage de sécurité et de créer des tunnels **VXLAN (Virtual Extensible LAN)** qui étendent le réseau L2 sur n'importe quelle infrastructure IP L3 sous-jacente.

### 🔍 Anatomie Technique

**Architecture Open vSwitch dans un Hyperviseur KVM :**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ESPACE UTILISATEUR (USERSPACE)                           │
│  - ovs-vswitchd : Démon de gestion principal                │
│  - ovsdb-server : Base de données de configuration OVS      │
└──────────────┬──────────────────────────────┬───────────────┘
               │ OpenFlow / OVSDB             │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ESPACE NOYAU (KERNELSPACE)                               │
│  - Module openvswitch.ko (Fast-Path Datapath)               │
│  - Commutation ultra-rapide des paquets en mémoire RAM      │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
     ┌─────────┴─────────┐          ┌─────────┴─────────┐
     │ Interface VM 1    │          │ Interface VM 2    │
     │ (vnet0 - Tag 10)  │          │ (vnet1 - Tag 20)  │
     └───────────────────┘          └───────────────────┘
```

---

## 2) Module — Encapsulation Overlay VXLAN & OVN (2h)

### 📖 Narration/Intuition

**VXLAN** encapsule les trames Ethernet L2 des machines virtuelles dans des paquets UDP/IP (Port UDP `4789`). Grâce au champ VNI (VXLAN Network Identifier) de 24 bits, on peut créer jusqu'à **16 millions de réseaux virtuels isolés** (contre seulement 4 096 avec les VLANs traditionnels).

**OVN (Open Virtual Network)** est l'orchestrateur SDN qui contrôle Open vSwitch pour créer automatiquement des routeurs virtuels, des pare-feux et des répartiteurs de charge distribués.

### 🔍 Anatomie Technique

**Commandes d'administration et configuration d'un Bridge OVS avec VXLAN (`ovs_setup.sh`) :**

```bash
# 1. Créer un commutateur virtuel OVS (Bridge)
sudo ovs-vsctl add-br br-int

# 2. Attacher des interfaces de machines virtuelles KVM au bridge
sudo ovs-vsctl add-port br-int vnet0
sudo ovs-vsctl add-port br-int vnet1

# 3. Créer un tunnel Overlay VXLAN vers un deuxième Hyperviseur distant (10.0.10.20)
sudo ovs-vsctl add-port br-int vxlan0 -- set interface vxlan0 type=vxlan options:remote_ip=10.0.10.20 options:key=1001

# 4. Configurer la micro-segmentation L2 (VLAN tagging interne)
sudo ovs-vsctl set port vnet0 tag=10
sudo ovs-vsctl set port vnet1 tag=20

# 5. Afficher la topologie et la configuration complète du réseau virtuel
sudo ovs-vsctl show
```

---

## 3) Module — Filtrage de Sécurité OpenFlow & Isolation SDN (2h)

### 📖 Narration/Intuition

Contrairement à un switch physique, Open vSwitch supporte le protocole **OpenFlow** : il permet d'injecter des règles de filtrage de sécurité directement au niveau du Datapath du commutateur virtuel pour bloquer les attaques ARP Spoofing, IP Spoofing ou les communications non autorisées entre VMs.

### 🔍 Anatomie Technique

**Injection de règles de sécurité OpenFlow dans OVS :**

```bash
# 1. Bloquer tout le trafic ARP provenant d'une VM qui n'utilise pas son IP attribuée (Anti-ARP Spoofing)
sudo ovs-ofctl add-flow br-int "table=0, priority=100, dl_type=0x0806, in_port=1, arp_spa=10.0.10.50, actions=NORMAL"
sudo ovs-ofctl add-flow br-int "table=0, priority=90, dl_type=0x0806, in_port=1, actions=DROP"

# 2. Interdire la communication directe entre deux VMs du même bridge (Isolation L2 Port Isolation)
sudo ovs-ofctl add-flow br-int "table=0, priority=200, in_port=1, dl_dst=00:11:22:33:44:55, actions=DROP"

# 3. Inspecter les règles de flux actives et le nombre de paquets filtrés
sudo ovs-ofctl dump-flows br-int
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OVS** | Open vSwitch — Commutateur virtuel multicouche logiciel open-source |
| **OVN** | Open Virtual Network — Système de contrôle SDN d'Open vSwitch pour le cloud |
| **VXLAN** | Virtual Extensible LAN — Protocole d'encapsulation Overlay L2 dans L3 (UDP 4789) |
| **VNI** | VXLAN Network Identifier — Identifiant 24-bits de réseau virtuel (16 millions max) |
| **OpenFlow** | Protocole standard de communication entre le contrôleur SDN et les commutateurs |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi le protocole d'encapsulation **VXLAN** est-il indispensable par rapport aux **VLANs (802.1Q)** traditionnels dans un grand Datacenter cloud ?

**Corrigé :** Les **VLANs (802.1Q)** utilisent un en-tête de 12 bits, ce qui limite le nombre total de réseaux virtuels isolés à **4 096** à l'échelle de tout le Datacenter. De plus, les VLANs exigent de reconfigurer les commutateurs physiques. **VXLAN** utilise un identifiant VNI de 24 bits, permettant de créer jusqu'à **16,7 millions de réseaux virtuels**. De plus, VXLAN encapsule les trames L2 dans des paquets IP/UDP L3 standard, ce qui permet de transporter des réseaux virtuels sur n'importe quelle infrastructure réseau physique d'entreprise sans modifier les switchs physiques.

**Exercice 2 :** Comment la technologie Open vSwitch (OVS) protège-t-elle les machines virtuelles d'un hyperviseur contre l'**ARP Spoofing** ?

**Corrigé :** OVS utilise des règles **OpenFlow** injectées au niveau du commutateur virtuel. Lorsqu'une machine virtuelle tente d'émettre un paquet ARP (requête ou réponse), OVS inspecte l'adresse IP source déclarée dans l'en-tête ARP (`arp_spa`). Si cette adresse IP ne correspond pas à l'adresse IP légitime attribuée à ce port virtuel, la règle OpenFlow rejette immédiatement le paquet (`actions=DROP`), empêchant la VM de pirater la table ARP des autres VMs du serveur.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel commutateur virtuel multicouche logiciel est le standard open-source pour la virtualisation de réseaux dans les hyperviseurs Linux KVM et OpenStack ?
- A) Open vSwitch (OVS)
- B) MS Paint
- C) Disquette
- D) Lecteur CD

**Réponse : A**

**Q2 :** Combien de réseaux virtuels isolés peut-on créer grâce à l'identifiant VNI 24-bits du protocole d’encapsulation VXLAN (par rapport aux 4096 des VLANs) ?
- A) Environ 16,7 millions
- B) 10
- C) 2
- D) 0

**Réponse : A**

**Q3 :** Quel port UDP standard est utilisé par le protocole VXLAN pour encapsuler les trames réseau virtuelles ?
- A) UDP 4789
- B) TCP 80
- C) TCP 443
- D) UDP 53

**Réponse : A**

**Q4 :** Quel protocole standard est utilisé par les contrôleurs SDN pour programmer à distance les règles de flux (Flow Tables) dans un commutateur Open vSwitch ?
- A) OpenFlow
- B) POP3
- C) FTP
- D) HTTP/1.0

**Réponse : A**

**Q5 :** Dans Open vSwitch, quels sont les deux composants principaux qui séparent l'Espace Utilisateur (Control Plane) du noyau Linux (Fast-Path Datapath) ?
- A) `ovs-vswitchd` (Userspace) et le module noyau `openvswitch.ko` (Kernelspace)
- B) Paint et Calculator
- C) Notepad et Word
- D) Chrome et Firefox

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
