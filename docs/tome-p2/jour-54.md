# SEMESTRE 2 — Jour 54 (6h) : Commutation L2, VLANs IEEE 802.1Q, Trunking & Spanning Tree (STP/RSTP)

> [!NOTE]
> **Objectif de la journée** : Sécuriser et segmenter le réseau local physique avec des commutateurs Layer 2, déployer l'étiquetage de trames **VLANs IEEE 802.1Q**, configurer des liens Trunk, et neutraliser les boucles réseau catastrophiques via le protocole **Spanning Tree (STP/RSTP)**.
> **Compétences visées** : `BIT-04` (Niveau Cible: A) — Commutation L2, VLANs, Trunking et Sécurité des Commutateurs.

---

## 🎯 Objectifs de la Leçon

- 🧠 Comprendre le fonctionnement interne d'un commutateur Layer 2 (Apprentissage, Commutation, Inondation, Table CAM/MAC).
- 🧱 Séparer les domaines de broadcast grâce aux **VLANs** (*Virtual Local Area Networks*).
- 🏷️ Différencier les ports **Access** (non-taggués) et les ports **Trunk** (taggués avec l'en-tête **IEEE 802.1Q**).
- 🌳 Comprendre l'élection du Root Bridge et la prévention des tempêtes de broadcast via **STP (802.1D)** et **RSTP (802.1w)**.
- 🛡️ Sécuriser les switches contre les attaques par inondation de tables MAC (*MAC Flooding*) et le *VLAN Hopping* (Port Security, BPDU Guard, Native VLAN).
- 🧪 Manipuler des bridges et sous-interfaces VLAN 802.1Q sous Linux.

---

## 🖼️ Commutation L2 & Segmentation par VLANs

![VLANs & Ethernet Switching](https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800)

---

## 📖 1. Le Commutateur (Switch) L2 & La Table CAM/MAC

### 1.1 Narration & Intuition — Le Facteur vs le Mégaphone

Dans les années 1990, le matériel d'interconnexion réseau principal était le **Hub** (concentrateur). Lorsqu'un PC envoyait un message destiné à une seule machine, le Hub répétait aveuglément le signal électrique sur tous les ports. C'était l'équivalent d'un haut-parleur hurlant le courrier de tout le monde au milieu d'un bureau open space : gaspillage de bande passante, collisions et espionnage facile.

Le **Switch** (commutateur L2) est un facteur intelligent. Il lit l'enveloppe Ethernet (l'**Adresse MAC destination**) et ne transmet la trame **que sur le câble du destinataire**.

### 1.2 Le Triplet Opérationnel du Switch : Apprentissage, Commutation, Inondation

Un switch maintient en mémoire RAM ultra-rapide une table appelée **Table CAM** (*Content Addressable Memory*) ou **Table MAC** :

```
                        TABLE CAM / MAC DU SWITCH
                        ┌───────────────────┬─────────┐
                        │ ADRESSE MAC       │ PORT    │
                        ├───────────────────┼─────────┤
                        │ 00:1A:2B:3C:4D:01 │ Port 1  │
                        │ 00:1A:2B:3C:4D:02 │ Port 2  │
                        │ 00:1A:2B:3C:4D:03 │ Port 3  │
                        └───────────────────┴─────────┘
```

Le switch applique 3 règles de traitement pour chaque trame reçue :

1. **Apprentissage (*Learning*)** : Le switch lit l'adresse MAC **Source** de la trame entrante et enregistre dans sa table CAM l'association entre cette MAC et le port physique sur lequel la trame est arrivée.
2. **Commutation (*Forwarding*)** : Si l'adresse MAC **Destination** est déjà connue dans sa table CAM, le switch transmet la trame **uniquement sur le port associé** (Transfert Unicast).
3. **Inondation (*Flooding*)** : Si l'adresse MAC destination est **inconnue** dans la table, ou s'il s'agit d'une trame de Diffusion générale (**Broadcast** `FF:FF:FF:FF:FF:FF`), le switch duplique et envoie la trame sur **TOUS ses ports** (sauf le port d'origine).

---

## 📖 2. Les VLANs (802.1Q) & Le Trunking

### 2.1 Pourquoi Segmenter avec des VLANs ?

Un **VLAN** (*Virtual Local Area Network*) permet de découper un switch physique unique en plusieurs switches virtuels isolés.

```
                   SWITCH PHYSIQUE D'ENTREPRISE (24 Ports)
 ┌───────────────────────────────────┬───────────────────────────────────┐
 │        VLAN 10 : RH & FINANCE     │       VLAN 20 : DÉVELOPPEURS      │
 │  Port 1 à 12 (192.168.10.0/24)    │  Port 13 à 24 (192.168.20.0/24)   │
 └───────────────────────────────────┴───────────────────────────────────┘
   (Les PC du VLAN 10 et du VLAN 20 sont PHYSIQUEMENT sur le même switch, 
    mais ils NE PEUVENT PAS communiquer directement sans passer par un Routeur !)
```

**Bénéfices majeurs :**
- **Sécurité** : Un attaquant compromettant un poste sur le VLAN Développeurs ne peut pas intercepter les trames du VLAN Finance.
- **Réduction du Bruit** : Les requêtes Broadcast ARP du VLAN 10 ne sont transmises qu'aux ports du VLAN 10.

### 2.2 Ports Access vs Ports Trunk (Standard IEEE 802.1Q)

Pour interconnecter deux switches ou relier un switch à un routeur, on utilise deux modes d'interfaces :

- **Port Access (Accès)** : Connecté à un équipement terminal (PC, Imprimante, Serveur). Il appartient à **un seul VLAN**. Les trames qui y circulent ne comportent **aucun tag**. La carte réseau du PC ignore l'existence du VLAN.
- **Port Trunk (Trunking)** : Connecté entre deux switches ou entre un switch et un routeur. Il transporte les trames de **multiples VLANs simultanément** en insérant un tag de 4 octets selon le standard **IEEE 802.1Q**.

```
                L'EN-TÊTE ETHERNET IEEE 802.1Q (4 OCTETS)
┌────────────┬────────────┬─────────────────────────────┬──────────┬─────────┐
│ MAC Dest   │ MAC Source │ TAG 802.1Q (4 octets)       │ Type     │ Données │
│ (6 octets) │ (6 octets) │ - TPID (0x8100)             │ (2 oct.) │ (Payload│
│            │            │ - Priorité PCP (3 bits)     │          │         │
│            │            │ - VLAN ID / VID (12 bits)   │          │         │
└────────────┴────────────┴─────────────────────────────┴──────────┴─────────┘
```

> [!NOTE]
> Le champ **VLAN ID (VID)** fait 12 bits, ce qui permet de créer jusqu'à $2^{12} = 4096$ VLANs distincts sur un réseau (de 1 à 4094).

### 2.3 Le VLAN Natif (Native VLAN)

Sur un lien Trunk 802.1Q, le **VLAN Natif** est le seul VLAN dont les trames circulent **sans tag 802.1Q** (par défaut, le VLAN 1 sur la plupart des switches).

> [!WARNING]
> **Alerte Sécurité — Native VLAN Mismatch & VLAN Hopping :**  
> Si le Switch A utilise le VLAN 1 comme VLAN Natif et le Switch B utilise le VLAN 99, les trames non-tagguées du VLAN 1 envoyées par A seront interprétées à l'arrivée par B comme appartenant au VLAN 99 ! Cette faille de configuration permet une attaque de franchissement de VLAN (*VLAN Hopping*).
> **Bonne Pratique :** Changez toujours le VLAN Natif par défaut (VLAN 1) pour un VLAN inutilisé dédié (ex: VLAN 999) sur tous les liens Trunk.

---

## 📖 3. Le Protocole Spanning Tree (STP 802.1D / RSTP 802.1w)

### 3.1 La Catastrophe des Boucles L2 & Tempêtes de Broadcast

Pour garantir la haute disponibilité, on installe des câbles redondants entre les switches. Malheureusement, l'en-tête Ethernet de Couche 2 ne possède **aucun champ TTL** (*Time To Live*) comme le paquet IP.

Si une boucle physique existe sans protection et qu'une trame Broadcast ARP est émise, les switches vont se transmettre cette trame en boucle infinie à la vitesse de la lumière. En moins de 3 secondes, l'ensemble du réseau s'effondre sous une **Tempête de Broadcast** (*Broadcast Storm*).

```
                      BOUCLE PHYSIQUE & STP
                       ┌────────────────┐
                       │  ROOT BRIDGE   │
                       │   (Switch A)   │
                       └───────┬────────┘
                               │
                      ┌────────┴────────┐
                      │                 │
             ┌────────▼───────┐  BLOCAGE ┌────────▼───────┐
             │    Switch B    │◄───X───►│    Switch C    │
             └────────────────┘ (STP)   └────────────────┘
```

### 3.2 Le Fonctionnement de Spanning Tree (STP)

Le protocole **STP** (*Spanning Tree Protocol* - IEEE 802.1D) résout le problème en calculant l'arbre logique d'interconnexion et en **bloquant stratégiquement les ports redondants** pour éliminer les boucles.

1. **Élection du Root Bridge (Le Switch Maître)** : Les switches s'échangent des messages appelés **BPDU** (*Bridge Protocol Data Units*). Le switch qui possède la **Bridge ID (Priorité + Adresse MAC)** la plus basse est élu Root Bridge.
2. **Détermination des Rôles de Ports** :
   - **Root Port (RP)** : Le port de chaque switch qui offre le chemin le plus court vers le Root Bridge.
   - **Designated Port (DP)** : Le port qui émet le trafic vers le segment réseau.
   - **Alternate / Blocked Port (AP)** : Le port redondant désactivé logiquement (il n'achemine pas de trafic utilisateur, mais écoute les BPDU).

### 3.3 Différences entre STP (802.1D) et RSTP (802.1w)

| Caractéristique | Old STP (802.1D) | RSTP (802.1w - Rapid Spanning Tree) |
| :--- | :--- | :--- |
| **Temps de Convergence** | 30 à 50 secondes (très lent) | Moins d'une seconde (1 à 2s) |
| **États des Ports** | Blocking → Listening → Learning → Forwarding | Discarding → Learning → Forwarding |
| **Bypassing PC** | Nécessite la commande `PortFast` | Automatique sur les ports `Edge` |

### 3.4 Sécurité STP : PortFast & BPDU Guard

- **PortFast / Edge Port** : À activer exclusivement sur les ports reliés à des ordinateurs utilisateurs. Il permet au port de passer directement à l'état *Forwarding* en évitant les 30 secondes d'attente STP lors du branchement.
- **BPDU Guard** : Si un employé branche un petit switch sauvage sur sa prise murale alors que PortFast est actif, le switch d'entreprise reçoit une trame BPDU et la fonction **BPDU Guard désactive immédiatement le port** (`err-disabled`) pour protéger l'infrastructure.

---

## 🧪 Atelier Pratique : VLANs 802.1Q et Bridges sous Linux

Exécutez cette série de commandes réelles sous Linux pour créer des interfaces VLANs et manipuler un pont L2 avec STP :

```bash
# 1. Charger le module noyau 8021q pour la gestion des VLANs
sudo modprobe 8021q

# 2. Créer une sous-interface VLAN 802.1Q (ID: 10) rattachée à l'interface eth0 (Router-on-a-Stick)
sudo ip link add link eth0 name eth0.10 type vlan id 10

# 3. Créer une seconde sous-interface VLAN 802.1Q (ID: 20)
sudo ip link add link eth0 name eth0.20 type vlan id 20

# 4. Attribuer des adresses IP d'administration à chaque sous-interface VLAN
sudo ip addr add 192.168.10.1/24 dev eth0.10
sudo ip addr add 192.168.20.1/24 dev eth0.20

# 5. Activer les interfaces virtuellement créées
sudo ip link set up dev eth0.10
sudo ip link set up dev eth0.20

# 6. Vérifier la création des interfaces VLAN
ip -d link show eth0.10
# Output attendu: eth0.10@eth0: ... vlan protocol 802.1Q id 10 ...

# 7. Créer un Switch Logiciel (Bridge L2) sous Linux avec STP actif
sudo ip link add name br0 type bridge
sudo ip link set dev br0 type bridge stp_state 1

# 8. Ajouter deux interfaces physiques dans le pont L2
sudo ip link set dev eth1 master br0 2>/dev/null || true
sudo ip link set dev eth2 master br0 2>/dev/null || true
sudo ip link set up dev br0

# 9. Inspecter la table FDB (Forwarding Database / Table MAC) du bridge Linux
bridge fdb show dev br0 2>/dev/null || ip neigh show

# 10. Supprimer proprement les interfaces de test
sudo ip link delete eth0.10
sudo ip link delete eth0.20
sudo ip link delete br0
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Attaque par inondation de table MAC (MAC Flooding Attack)
- **Principe** : Un outil malveillant comme `macof` génère des milliers d'adresses MAC aléatoires par seconde. La table CAM du switch se sature. N'ayant plus de mémoire, le switch retombe en mode "Hub" et inonde toutes les trames sur tous les ports, permettant à l'attaquant de sniffer le trafic.
- **Réflexe** : Activez la sécurité de port (**Port Security**) sur tous les switches : `switchport port-security maximum 2` (limite le nombre de MAC autorisées par port) et `switchport port-security violation shutdown`.

### 2. Symptôme "Native VLAN Mismatch"
- **Symptôme** : Messages de logs répétitifs sur la console Cisco/Linux : `%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/1`.
- **Réflexe** : Vérifiez la configuration des deux côtés du lien Trunk. Les deux switches doivent impérativement déclarer le même ID de VLAN natif (`switchport trunk native vlan 99`).

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Quelle table mémoire interne est utilisée par un commutateur Layer 2 pour associer des adresses MAC physiques à des ports réseau ?**
- A) La Table de Routage IP
- B) La Table CAM (Content Addressable Memory) / Table MAC
- C) La Table DNS
- D) La Table ARP du routeur

*Réponse : B — La table CAM associe les adresses MAC enregistrées lors de la réception des trames avec les ports physiques correspondants.*

**Q2 : Que fait un commutateur Layer 2 lorsqu'il reçoit une trame Unicast destinée à une adresse MAC inconnue dans sa table CAM ?**
- A) Il jette la trame immédiatement
- B) Il inonde la trame sur l'intégralité de ses ports actifs à l'exception du port d'origine (*Flooding*)
- C) Il envoie une erreur ICMP au routeur
- D) Il éteint le switch

*Réponse : B — Face à une MAC destination inconnue, le switch inonde la trame sur tous ses ports (*Unknown Unicast Flooding*).*

**Q3 : Combien de bytes (octets) l'en-tête de marquage IEEE 802.1Q insère-t-il dans une trame Ethernet sur un lien Trunk ?**
- A) 2 octets
- B) 4 octets
- C) 8 octets
- D) 64 octets

*Réponse : B — L'en-tête 802.1Q insère 4 octets supplémentaires contenant notamment le VLAN ID (12 bits) et la priorité PCP.*

**Q4 : Quelle est la différence fondamentale entre un port configuré en mode Access et un port en mode Trunk ?**
- A) Le port Access est 10 fois plus rapide que le port Trunk
- B) Le port Access véhicule le trafic d'un seul VLAN non-taggué pour un PC, tandis que le port Trunk véhicule les trames de plusieurs VLANs tagguées en 802.1Q
- C) Le port Access est réservé aux imprimantes
- D) Le port Trunk est obligatoire pour utiliser le Wi-Fi

*Réponse : B — Le mode Access est destiné aux équipements d'extrémité (non-taggués). Le mode Trunk transporte plusieurs VLANs entre switches.*

**Q5 : Quel est l'objectif principal du protocole Spanning Tree (STP / RSTP) ?**
- A) Augmenter la vitesse du processeur du switch
- B) Éliminer les boucles logiques de Couche 2 et prévenir les tempêtes de broadcast en bloquant les ports redondants
- C) Remplacer les adresses IP par des noms de domaine
- D) Chiffrer le trafic Wi-Fi

*Réponse : B — STP calcule un arbre sans boucle et désactive logiquement les liens redondants pour éviter les tempêtes de broadcast.*

**Q6 : Quel composant est élu comme le maître central (chef d'orchestre) dans un réseau de switches exécutant Spanning Tree ?**
- A) Le serveur DNS principal
- B) Le Root Bridge (le switch possédant la plus petite valeur de Bridge ID / Priorité)
- C) Le routeur par défaut
- D) L'ordinateur de l'administrateur

*Réponse : B — Le Root Bridge est le centre de l'arbre Spanning Tree, élu selon la plus basse Bridge ID (Priority + MAC).*

**Q7 : À quoi sert la fonctionnalité "PortFast" (ou Edge Port) sur un commutateur ?**
- A) À autoriser le piratage du switch
- B) À permettre à un port connecté à un PC d'éviter les délais de calcul STP (30s) et de passer immédiatement en mode d'acheminement (*Forwarding*)
- C) À convertir du cuivre en fibre optique
- D) À fermer le port automatiquement à 18h

*Réponse : B — PortFast évite aux postes de travail d'attendre la phase de convergence STP (Listening/Learning) lors de l'allumage.*

**Q8 : Quelle fonctionnalité de sécurité permet de désactiver automatiquement un port configuré en PortFast s'il reçoit une trame BPDU inattendue ?**
- A) Port Security
- B) BPDU Guard
- C) DHCP Snooping
- D) Dynamic ARP Inspection

*Réponse : B — BPDU Guard protège le réseau en coupant l'accès si un switch non autorisé ou malveillant est branché sur un port utilisateur.*

---

## 📚 Ressources & Références

- **IEEE 802.1Q Standard (VLAN Tagging)** : https://standards.ieee.org/ieee/802.1Q/
- **IEEE 802.1w Standard (Rapid Spanning Tree Protocol)** : https://standards.ieee.org/ieee/802.1w/
- **Cisco Campus Network Design Guide (VLANs & STP)** : https://www.cisco.com/c/en/us/td/docs/solutions/Enterprise/Campus/campusdn.html

---

*Semestre 2 — Réseaux & Télécoms Avancés PARADIS IT Masterclass*
