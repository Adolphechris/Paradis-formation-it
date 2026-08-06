# SEMESTRE 2 — Jour 54 (6h) : Commutation L2 & VLANs

> [!NOTE]
> **Objectif de la journée** : Sécuriser et segmenter le réseau local physique avec des commutateurs intelligents, des VLANs 802.1Q et maîtriser la redondance sans boucle via STP.
> **Compétences visées** : `BIT-04` (Niveau Cible: A) — Commutation & VLANs.

---

## 1) Le Commutateur et la Table MAC (1h30)

### 📖 1.1 Narration & Intuition
Si un Hub (concentrateur) était un idiot qui hurle un message dans un haut-parleur (tout le monde entend tout), le Switch (commutateur) est un facteur professionnel. Il lit le nom du destinataire sur l'enveloppe et ne livre le courrier qu'à la bonne porte.

### 🔍 1.2 Anatomie Technique
Le switch maintient en RAM une **Table MAC** (ou CAM Table).
- **Apprentissage** : Quand PC1 envoie une trame, le switch lit l'adresse MAC source et l'associe au port d'entrée (Ex: `MAC-A -> Port 1`).
- **Commutation (Forwarding)** : S'il connaît la MAC de destination, il envoie la trame uniquement sur le bon port.
- **Flooding (Inondation)** : Si la MAC destination est inconnue (ou s'il s'agit d'un broadcast FF:FF:FF:FF:FF:FF), il envoie la trame sur tous les ports (sauf celui d'origine).

### 🛠️ 1.3 Atelier Pratique Hands-on
Observation du comportement ARP / MAC sous Linux :
```bash
# Vider son cache ARP (force l'envoi d'un broadcast sur le LAN)
sudo ip -s -s neigh flush all

# Faire un ping déclenche une requête ARP
ping -c 1 192.168.1.254

# Afficher la table ARP locale
arp -an
# Sur un Switch Cisco, on taperait : show mac address-table
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
**MAC Flooding Attack** : Un attaquant peut saturer la table MAC (qui a une limite en RAM, ex: 8000 entrées) avec des fausses adresses. Le switch, saturé, bascule en mode Hub (inondation continue) permettant le "Sniffing". Parade : Configurer le **Port Security** (limite de MAC par port).

---

## 2) VLAN (802.1Q) & Trunking (1h30)

### 📖 1.1 Narration & Intuition
Imaginez un grand Open Space (le Switch). C'est bruyant. Pour isoler les départements, on construit des murs virtuels. Le VLAN (Virtual LAN) sépare logiquement un seul switch physique en plusieurs switchs virtuels étanches.

### 🔍 1.2 Anatomie Technique
- **Ports Access** : Connectés aux PC/Serveurs. Appartiennent à UN seul VLAN. La machine ne sait pas qu'elle est dans un VLAN.
- **Ports Trunk (802.1Q)** : Connectés entre Switches ou vers un Routeur. Transportent de multiples VLANs simultanément.
- **Tag 802.1Q** : Le switch insère 4 octets dans la trame Ethernet pour marquer son appartenance (Ex: VLAN 10).
- *VTP (VLAN Trunking Protocol)* : Protocole propriétaire Cisco pour propager la création de VLANs à tous les switchs du domaine.

### 🛠️ 1.3 Atelier Pratique Hands-on
Créer une interface sous-interface VLAN (Trunk) sous Linux (ex: Router-on-a-Stick) :
```bash
# S'assurer que le module kernel 8021q est chargé
sudo modprobe 8021q

# Créer l'interface virtuelle liée au VLAN 10
sudo ip link add link eth0 name eth0.10 type vlan id 10
sudo ip addr add 192.168.10.1/24 dev eth0.10
sudo ip link set up dev eth0.10
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
**Native VLAN Mismatch** : Le VLAN "Natif" sur un lien Trunk est le seul VLAN non taggué (souvent le VLAN 1 par défaut). Si le Switch A utilise Native VLAN 1, et le Switch B Native VLAN 99, une fuite de paquets ou le blocage du STP se produira !

---

## 3) STP (Spanning Tree Protocol) (2h00)

### 📖 1.1 Narration & Intuition
Pour assurer la haute disponibilité, les administrateurs mettent deux câbles entre les switchs. Catastrophe ! Une tempête de broadcast (Broadcast Storm) se crée et le réseau s'effondre en 3 secondes. Le **STP (Spanning Tree Protocol)** est le héros qui détecte mathématiquement les boucles et bloque logiquement un port de secours, jusqu'à ce que le câble principal casse.

### 🔍 1.2 Anatomie Technique
- **BPDU (Bridge Protocol Data Units)** : Les messages d'état que s'échangent les switchs.
- **Root Bridge** : Le switch élu chef d'orchestre (celui avec la plus petite Priorité, sinon la plus petite adresse MAC).
- **RSTP (Rapid Spanning Tree - 802.1w)** : Évolution moderne qui converge en moins d'une seconde en cas de panne (contre 50s pour le vieux STP 802.1D).
- **PortFast / Edge Port** : À activer impérativement sur les ports connectés à des PC pour bypasser les états de calcul du STP et s'allumer instantanément.

### 🛠️ 1.3 Atelier Pratique Hands-on
En lab virtuel Linux, pour gérer des bridges L2 :
```bash
sudo apt install bridge-utils
# Créer un pont logiciel (Switch)
sudo brctl addbr br0
# Activer le STP sur le pont
sudo brctl stp br0 on
# Observer l'état STP
brctl showstp br0
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
Ne branchez JAMAIS un switch non manageable grand public sur les prises murales d'une entreprise s'il fait une boucle sur lui-même (un câble entre le port 1 et le port 2). Si le switch d'étage n'est pas protégé par la fonction **BPDU Guard**, tout le réseau d'étage va crasher par une tempête de broadcast.

---

## Nouvelles abréviations rencontrées
- **VLAN** : Virtual Local Area Network
- **STP/RSTP** : (Rapid) Spanning Tree Protocol
- **BPDU** : Bridge Protocol Data Unit
- **MAC** : Media Access Control

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Configurer un Bridge L2 avec VLAN sous Linux
- **Consigne** : Transformez votre machine Linux en un Switch L2 logiciel basique reliant `eth1` et `eth2`, avec STP activé.
- **Livrables à produire** : Script Bash des commandes.
- **Corrigé détaillé & Guidé** :
```bash
#!/bin/bash
# Installation si non présent
apt-get install -y iproute2 bridge-utils

# Création du bridge
ip link add name br_lan type bridge

# Activation STP (important)
ip link set dev br_lan type bridge stp_state 1

# Ajout des interfaces physiques (qui perdent leur IP propre)
ip link set dev eth1 master br_lan
ip link set dev eth2 master br_lan

# Allumage des interfaces
ip link set up dev eth1
ip link set up dev eth2
ip link set up dev br_lan
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: Que fait un switch L2 quand il reçoit une trame pour une adresse MAC qu'il ne connait pas ? A) Il la détruit B) Il l'envoie au routeur C) Il l'inonde sur tous les ports (Flooding) D) Il renvoie une erreur ICMP. **Réponse: C**
2. QCM: Quelle norme définit l'encapsulation (Tagging) des VLANs sur un lien Trunk ? A) 802.1X B) 802.11 C) 802.1Q D) 802.3. **Réponse: C**
3. QCM: Quel est le rôle principal du protocole Spanning Tree (STP) ? A) Accélérer le réseau B) Prévenir les boucles réseau de couche 2 C) Fournir des adresses IP dynamiques D) Filtrer les adresses MAC. **Réponse: B**
4. QCM: Que fait la commande "PortFast" (ou Edge Port) sur un port switch ? A) Augmente le débit à 10Gbps B) Bloque le trafic de test C) Passe le port directement à l'état Forwarding pour un PC D) Force le port en mode Trunk. **Réponse: C**
5. QCM: Qu'est-ce que le VLAN natif ? A) Le VLAN de management par défaut B) Le seul VLAN dont les trames circulent non-tagguées sur un Trunk C) Le VLAN 1 obligatoirement D) Le réseau virtuel pour la Voix sur IP. **Réponse: B**

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
