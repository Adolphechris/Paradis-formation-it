# SEMESTRE 2 — Jour 55 (6h) : Routage Inter-VLAN & Protocoles de Routage Dynamique (OSPF Single Area)

> [!NOTE]
> **Objectif de la journée** : Interconnecter des VLANs isolés (Routage Inter-VLAN via Router-on-a-Stick et SVI), comprendre la théorie du routage dynamique par État de Liens, et déployer un réseau autonome avec le protocole **OSPF Single Area (Area 0)**.
> **Compétences visées** : `BIT-04` (Niveau Cible: A) — Routage Inter-VLAN, Protocoles à État de Liens et OSPFv2.

---

## 🎯 Objectifs de la Leçon

- 🧱 Interconnecter des VLANs isolés grâce à l'architecture **Router-on-a-Stick (ROAS)** et aux **SVI** (*Switch Virtual Interfaces*) sur Switch L3.
- 🚦 Distinguer le routage statique du routage dynamique (**IGP** vs **EGP**).
- 🧮 Comprendre le fonctionnement des protocoles à **État de Liens** et l'algorithme du plus court chemin de **Dijkstra (SPF)**.
- 📡 Configurer le protocole **OSPFv2** (Open Shortest Path First) dans la **Zone Backbone (Area 0)**.
- ⏱️ Découvrir le cycle d'adjacence OSPF (Hello, DR/BDR, LSA, LSDB) et ajuster le coût de bande passante (*Reference Bandwidth*).
- 🧪 Implémenter le routage IP sous Linux et déployer la suite de routage **FRRouting (FRR / vtysh)**.

---

## 🖼️ Routage Inter-VLAN & Protocole OSPF

![Inter-VLAN Routing & OSPF](https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800)

---

## 📖 1. Le Routage Inter-VLAN : Faire Communiquer les Réseaux Isolés

### 1.1 Narration & Intuition — L'Ambassadeur entre Deux Villes

Dans la leçon précédente, nous avons créé des VLANs pour isoler hermétiquement les départements (ex: VLAN 10 Finance et VLAN 20 Développeurs). Cette isolation de Couche 2 empêche tout trafic direct d'un VLAN à l'autre.

Cependant, les développeurs ont besoin de déposer des rapports sur le serveur de la Finance. Pour traverser la frontière entre ces deux domaines de broadcast, il faut obligatoirement un **équipement de Couche 3 (un Routeur)** qui agit comme un ambassadeur diplomatique en vérifiant les adresses IP source et destination.

### 1.2 Les 2 Architectures de Routage Inter-VLAN

```
ARCHITECTURE 1 : ROUTER-ON-A-STICK (ROAS)
┌───────────────┐       Trunk 802.1Q (eth0)       ┌────────────────────────┐
│  SWITCH L2    │ ───────────────────────────────►│      ROUTEUR L3        │
│ (VLAN 10, 20) │ ◄───────────────────────────────│ Sub-if eth0.10 (GW 10) │
└───────────────┘  Le trafic fait un aller-retour │ Sub-if eth0.20 (GW 20) │
                   sur le même câble physique     └────────────────────────┘

ARCHITECTURE 2 : SWITCH L3 / SVI (SWITCH VIRTUAL INTERFACE)
┌──────────────────────────────────────────────────────────────────────────┐
│ SWITCH L3 / CORE SWITCH DE DATACENTER                                    │
│ - Interface Virtuelle SVI VLAN 10 (IP 192.168.10.1 / Passerelle)         │
│ - Interface Virtuelle SVI VLAN 20 (IP 192.168.20.1 / Passerelle)         │
│ - Routage matériel Wire-Speed direct dans l'ASIC à 100 Gbps !            │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Router-on-a-Stick (ROAS)** : Un unique câble Trunk physique relie le switch au routeur. Le routeur crée des **sous-interfaces virtuelles** (ex: `eth0.10`, `eth0.20`) avec le tag 802.1Q correspondant. Chaque sous-interface sert de **Passerelle par Défaut** (*Default Gateway*) pour son VLAN respectif.
- **Switch L3 / SVI** : Dans les centres de données modernes, on utilise un commutateur de niveau 3. Le routage s'effectue directement dans des puces matérielles spécialisées (**ASIC**) à la vitesse maximale du bus de commutation (*Wire-speed*).

---

## 📖 2. Routage Statique vs Routage Dynamique (IGP vs EGP)

Lorsque le réseau grandit et comporte des dizaines de routeurs, saisir les routes à la main (`ip route add`) devient impossible. On fait appel au **Routage Dynamique**.

```
                           RÉPARTITION DES PROTOCOLES DE ROUTAGE
                                              │
                 ┌────────────────────────────┴────────────────────────────┐
                 ▼                                                         ▼
    IGP (Interior Gateway Protocols)                          EGP (Exterior Gateway Protocols)
    Utilisés AU SEIN de l'entreprise                          Utilisés ENTRE les opérateurs Internet
    (ex: OSPF, EIGRP, IS-IS, RIPv2)                           (ex: BGP4 — Border Gateway Protocol)
                 │
        ┌────────┴────────────────────────┐
        ▼                                 ▼
   Vecteur de Distance               État de Liens (Link-State)
   (RIPv2, EIGRP)                    (OSPF, IS-IS)
   "Je sais que X est à 3 sauts"     "Je possède la carte complète de tout le réseau"
```

### Protocoles à État de Liens (Link-State) vs Vecteur de Distance

- **Vecteur de Distance (ex: RIPv2)** : Le routeur ne connaît que ses voisins directs. Il leur demande leur table de routage toutes les 30 secondes ("Rumeur réseau"). Convergence très lente.
- **État de Liens (ex: OSPF)** : Chaque routeur émet des annonces d'état de lien (**LSA** - *Link State Advertisements*). Chaque routeur reconstruit en mémoire une **base de données topologique complète (LSDB)** de l'ensemble du réseau, puis calcule localement l'arbre des chemins les plus courts via l'**Algorithme de Dijkstra (SPF - Shortest Path First)**.

---

## 📖 3. Le Protocole OSPFv2 (Open Shortest Path First)

OSPF (RFC 2328) est le protocole de routage dynamique interne le plus utilisé au monde dans les réseaux d'entreprise.

### 3.1 La Métrique OSPF : Le Coût basé sur la Bande Passante

OSPF calcule la meilleure route en fonction d'une métrique appelée le **Coût** (*Cost*). Le coût d'un lien est inversement proportionnel à sa vitesse :

$$\text{Cost} = \frac{\text{Reference Bandwidth}}{\text{Interface Bandwidth}}$$

Par défaut, la *Reference Bandwidth* historique d'OSPF est de $100 \text{ Mbps}$ ($10^8 \text{ bps}$) :

```
- Lien FastEthernet (100 Mbps)  ──► Cost = 100M / 100M  = 1
- Lien Ethernet (10 Mbps)      ──► Cost = 100M / 10M   = 10
- Lien Gigabit (1 Gbps = 1000M) ──► Cost = 100M / 1000M = 0.1  ──► Arrondi à 1 !
```

> [!WARNING]
> **Ajustement Obligatoire sur les Réseaux Modernes :**  
> Avec la formule par défaut, OSPF attribue le même coût (1) à un lien 100 Mbps, 1 Gbps et 10 Gbps ! Sur tout réseau moderne, il faut impérativement exécuter la commande `auto-cost reference-bandwidth 100000` sur tous les routeurs pour fixer la référence à 100 Gbps.

### 3.2 Le Cycle d'Adjacence OSPF et les Paquets Hello

Pour devenir "amis" (*Adjacency*) et échanger leurs cartes topologiques, deux routeurs OSPF voisins passent par 7 états :

```
[ Down ] ──► [ Init ] ──► [ 2-Way ] ──► [ ExStart ] ──► [ Exchange ] ──► [ Loading ] ──► [ Full ]
```

1. **Paquets Hello** : Envoyés toutes les 10 secondes sur l'adresse Multicast **`224.0.0.5`** (tous les routeurs OSPF). Ils permettent de vérifier la présence des voisins et de maintenir le lien en vie (*Dead Interval* = 40s).
2. **Élection du DR et BDR** : Sur un réseau Ethernet multi-accès (avec un switch), les routeurs élisent un **DR** (*Designated Router*) et un **BDR** (*Backup Designated Router*) pour éviter que chaque routeur ne dialogue individuellement avec tous les autres. Les échanges avec le DR s'effectuent sur **`224.0.0.6`**.
3. **État FULL** : Les bases de données LSDB des deux routeurs sont parfaitement synchronisées. Le routage est opérationnel.

### 3.3 La Zone Zéro (Area 0 - Backbone Area)

OSPF s'organise en zones hiérarchiques. Dans une architecture OSPF simple (*Single Area*), **tous les routeurs doivent être configurés dans la Zone 0 (Area 0 / Backbone Area)**.

---

## 🧪 Atelier Pratique : Déploiement de Routage IP et OSPF sous Linux (FRR)

### 1. Activer le Routage IPv4 dans le Noyau Linux

```bash
# Vérifier si l'IP Forwarding est actif (0 = non, 1 = oui)
sysctl net.ipv4.ip_forward

# Activer immédiatement le routage entre les interfaces Linux
sudo sysctl -w net.ipv4.ip_forward=1

# Rendre la modification permanente au reboot
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.d/99-ipforward.conf
```

### 2. Configuration d'un Routeur OSPF avec la Suite FRRouting (FRR)

Si la suite de routage **FRR** (FRRouting) est installée sur votre machine Linux :

```bash
# 1. Démarrer le démon OSPFv2 de FRR
sudo systemctl start frr

# 2. Entrer dans le shell de configuration de routage vtysh (Syntaxe proche de Cisco IOS)
sudo vtysh
```

Exécutez la configuration OSPF dans le shell `vtysh` :

```cisco
! Passer en mode configuration globale
configure terminal

! Activer le processus OSPFv2 et attribuer un Router ID unique sous format IP
router ospf
 ospf router-id 1.1.1.1
 auto-cost reference-bandwidth 100000

 ! Annoncer le réseau local 192.168.10.0/24 dans l'Area 0
 network 192.168.10.0/24 area 0

 ! Annoncer le réseau d'interconnexion routeur 10.0.0.0/30 dans l'Area 0
 network 10.0.0.0/30 area 0
 exit

! Revenir au mode privilège et enregistrer la configuration
exit
write memory
```

### 3. Commandes d'Inspection OSPF sous Linux

```bash
# Dans le shell vtysh :

# 1. Vérifier la liste des routeurs voisins OSPF et leur état (État FULL recherché)
show ip ospf neighbor

# 2. Afficher la base de données topologique globale (LSDB)
show ip ospf database

# 3. Afficher la table de routage OSPF apprise dynamiquement
show ip route ospf

# Dans le terminal Bash Linux classique :
ip route show | grep ospf 2>/dev/null || ip route show
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Adjacence OSPF bloquée dans l'état `EXSTART` ou `EXCHANGE`
- **Cause n°1 en production** : Incompatibilité de **MTU** (*Maximum Transmission Unit*) entre les deux interfaces reliées. Si le Routeur A est en MTU 1500 et le Routeur B en MTU 9000 (Jumbo Frames), l'échange des paquets d'inventaire LSDB échoue.
- **Réflexe** : Vérifiez `ip link show dev eth0` sur les deux routeurs et harmonisez les MTU.

### 2. Adjacence OSPF bloquée dans l'état `INIT`
- **Cause** : Les paquets Hello du Routeur A arrivent au Routeur B, mais les paquets retour de B sont bloqués par un pare-feu (ex: pare-feu Linux UFW/iptables bloquant le protocole IP n°89 ou l'adresse Multicast `224.0.0.5`).
- **Réflexe** : Autorisez le protocole OSPF (IP Protocol 89) et le trafic Multicast sur vos pare-feu inter-routeurs.

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Dans l'architecture Router-on-a-Stick (ROAS), comment nomme-t-on les interfaces virtuelles créées sur le routeur pour associer une IP à chaque VLAN 802.1Q ?**
- A) Des interfaces Loopback
- B) Des sous-interfaces (*Sub-interfaces*, ex: `eth0.10`)
- C) Des interfaces SVI
- D) Des ports Trunk physiques

*Réponse : B — Les sous-interfaces virtuelles (ex: eth0.10) associent un tag VLAN 802.1Q à une adresse IP de passerelle.*

**Q2 : Quelle est la différence majeure entre un protocole de routage à Vecteur de Distance (ex: RIP) et à État de Liens (ex: OSPF) ?**
- A) Le protocole à vecteur de distance est plus rapide sur la fibre optique
- B) Le protocole à état de liens dresse une carte topologique complète du réseau (LSDB) et calcule le plus court chemin localement via l'algorithme de Dijkstra
- C) OSPF ne fonctionne pas avec IPv4
- D) RIP est réservé aux connexions satellite

*Réponse : B — Les protocoles à état de liens (OSPF, IS-IS) construisent la carte globale du réseau pour une convergence ultra-rapide.*

**Q3 : Comment OSPF calcule-t-il la métrique (le Coût) d'un lien par défaut ?**
- A) En mesurant le nombre d'ordinateurs connectés
- B) En divisant la bande passante de référence par la bande passante réelle de l'interface ($\text{Cost} = \frac{\text{Ref BW}}{\text{BW}}$)
- C) En utilisant le nombre de sauts de routeurs
- D) En mesurant la température du processeur

*Réponse : B — Le coût OSPF est inversement proportionnel à la vitesse du lien (plus le lien est rapide, plus le coût est bas).*

**Q4 : Quelle commande de configuration OSPF est indispensable pour éviter que des liens 1 Gbps et 10 Gbps n'obtiennent tous le même coût par défaut de 1 ?**
- A) `router-id 1.1.1.1`
- B) `auto-cost reference-bandwidth 100000`
- C) `passive-interface default`
- D) `ip routing`

*Réponse : B — `auto-cost reference-bandwidth 100000` élève la référence à 100 Gbps, permettant une différenciation exacte des coûts Gigabit.*

**Q5 : Quelle est l'adresse IP Multicast utilisée par OSPFv2 pour envoyer les paquets Hello à l'ensemble des routeurs OSPF d'un segment ?**
- A) `224.0.0.1`
- B) `224.0.0.5`
- C) `255.255.255.255`
- D) `224.0.0.9`

*Réponse : B — `224.0.0.5` est l'adresse réservée pour atteindre tous les routeurs OSPF (*AllSPFRouters*).*

**Q6 : Quel état d'adjacence OSPF indique que la synchronisation des bases de données LSDB entre deux routeurs est parfaitement terminée ?**
- A) Init
- B) 2-Way
- C) ExStart
- D) Full

*Réponse : D — L'état FULL confirme que la relation d'adjacence est établie et les bases de données synchronisées.*

**Q7 : Dans une architecture OSPF Single Area, quelle zone (Area) doit obligatoirement être configurée sur l'ensemble des routeurs ?**
- A) Area 1
- B) Area 0 (ou Area 0.0.0.0 — Backbone Area)
- C) Area 100
- D) Area DMZ

*Réponse : B — L'Area 0 est la zone dorsale (*Backbone*) obligatoire de toute architecture OSPF.*

**Q8 : Quelle commande sysctl sous Linux permet d'activer le routage des paquets IP entre les cartes réseau du noyau ?**
- A) `sysctl -w net.ipv4.ip_forward=1`
- B) `sysctl -w net.ipv4.ping=1`
- C) `sysctl -w net.bridge.stp=1`
- D) `sysctl -w net.routing.active=1`

*Réponse : A — `net.ipv4.ip_forward=1` autorise le noyau Linux à faire suivre (*forward*) les paquets IP entre ses interfaces.*

---

## 📚 Ressources & Références

- **RFC 2328** — OSPF Version 2 Specification : https://datatracker.ietf.org/doc/html/rfc2328
- **FRRouting (FRR) Official Documentation** : https://docs.frrouting.org/
- **Cisco Inter-VLAN Routing Configuration Guide** : https://www.cisco.com/c/en/us/support/docs/lan-switching/inter-vlan-routing/41160-25.html

---

*Semestre 2 — Réseaux & Télécoms Avancés PARADIS IT Masterclass*
