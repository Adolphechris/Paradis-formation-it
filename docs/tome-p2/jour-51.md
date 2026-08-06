# SEMESTRE 2 — Jour 51 (6h) : Architecture Réseau Approfondie & Encapsulation

> [!NOTE]
> **Objectif de la journée** : Comprendre le voyage de la donnée de l'application au câble physique en disséquant l'encapsulation (OSI vs TCP/IP) et en analysant finement les entêtes Ethernet et IP.
> **Compétences visées** : `BIT-04` (Niveau Cible: A) — Réseaux & Commutation.

---

## 1) OSI vs TCP/IP : La Matrice des Communications (1h30)

### 📖 1.1 Narration & Intuition
Imaginez envoyer un colis fragile à l'autre bout du monde. Vous n'allez pas simplement le jeter par la fenêtre. Vous le mettez dans une boîte (Application), vous l'emballez de papier bulle pour garantir la livraison (Transport), vous y collez une étiquette avec l'adresse postale (Réseau), puis vous le remettez au transporteur local (Liaison). C'est exactement le rôle de l'**encapsulation** des données. Le modèle OSI est la théorie (7 couches), le modèle TCP/IP est la réalité pratique du terrain (4 couches).

### 🔍 1.2 Anatomie Technique
Le flux de données subit un processus d'ajout d'en-têtes (Headers) à chaque couche :
- **Couche 4 (Transport TCP/UDP)** : Ajoute le port source/destination (PDU = Segment/Datagramme).
- **Couche 3 (Réseau IP)** : Ajoute l'IP source/destination (PDU = Paquet).
- **Couche 2 (Liaison Ethernet)** : Ajoute la MAC source/destination + FCS (PDU = Trame).
- **Couche 1 (Physique)** : Convertit en bits/signaux électriques ou lumineux sur le câble.

### 🛠️ 1.3 Atelier Pratique Hands-on
Observation de l'encapsulation avec `tcpdump` :
```bash
# Lancer une capture sur l'interface (remplacez eth0 par votre interface)
sudo tcpdump -i eth0 -n -c 5 -e -v
# -e : Affiche l'entête Ethernet (MAC)
# -v : Affiche les détails IP (TTL, ToS, etc.)
# -n : Pas de résolution DNS
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
Si les paquets n'arrivent pas, on remonte les couches (Bottom-Up) : le câble est-il branché (C1) ? Les adresses MAC sont-elles apprises (C2) ? Le ping IP passe-t-il (C3) ? Le port TCP est-il ouvert (C4) ?

---

## 2) Autopsie d'une Trame Ethernet (1h30)

### 📖 1.1 Narration & Intuition
Ethernet est le protocole roi des réseaux locaux (LAN). C'est le wagon qui transporte les marchandises sur le réseau physique immédiat. Une **trame Ethernet** est conçue pour ne voyager que sur un seul segment réseau (jusqu'au routeur).

### 🔍 1.2 Anatomie Technique
L'en-tête Ethernet (14 octets) :
1. **MAC Destination** (6 octets)
2. **MAC Source** (6 octets)
3. **EtherType** (2 octets) : Indique le protocole encapsulé (ex: 0x0800 pour IPv4, 0x86DD pour IPv6, 0x0806 pour ARP).
**Payload** (Données) : Taille classique (MTU) de 1500 octets.
**FCS (Frame Check Sequence)** (4 octets) : Vérifie l'intégrité de la trame.
*(Note : Jumbo Frames = MTU à 9000 octets, très utilisé en stockage SAN/NAS pour réduire l'overhead).*

### 🛠️ 1.3 Atelier Pratique Hands-on
Vérifier la MTU de son interface :
```bash
# Afficher les informations de l'interface réseau
ip link show
# Pour modifier temporairement la MTU (ex: 1400)
sudo ip link set dev eth0 mtu 1400
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
**Problème de MTU asymétrique** : Si un switch est configuré pour des Jumbo Frames et un serveur en MTU 1500, des pertes de paquets silencieuses se produiront sur les gros transferts. Symptôme : Le ping (petits paquets) passe, mais SSH ou HTTPS bloque !

---

## 3) Analyse du Paquet IP (IPv4) (2h00)

### 📖 1.1 Narration & Intuition
L'IP, c'est le GPS du réseau. Contrairement à Ethernet qui reste local, IP est conçu pour traverser le monde en sautant de routeur en routeur.

### 🔍 1.2 Anatomie Technique
L'en-tête IPv4 (20 octets min) comporte des champs critiques :
- **ToS / DSCP** (1 octet) : Pour la QoS (Priorité Voix vs Data).
- **TTL (Time To Live)** (1 octet) : Durée de vie du paquet (décrémenté à chaque routeur) pour éviter les boucles infinies.
- **Protocol** (1 octet) : Ex: 1 (ICMP), 6 (TCP), 17 (UDP).
- **Flags & Fragment Offset** : Gèrent la fragmentation si le paquet IP est plus grand que la MTU Ethernet.
- **MSS (Maximum Segment Size)** : Notion TCP associée, souvent MTU - 40 octets (Entête IP + TCP).

### 🛠️ 1.3 Atelier Pratique Hands-on
Manipulation et observation du TTL :
```bash
# Ping avec un TTL forcé très bas
ping -c 1 -t 1 8.8.8.8
# Résultat : "Time to live exceeded" (provient de notre routeur local !)

# Tracer la route IP en exploitant le TTL
traceroute -n 8.8.8.8
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
**Fragmentation IP** : La fragmentation consomme du CPU sur les routeurs. En sécurité, des attaquants envoient des fragments malformés (attaque Teardrop) pour faire crasher les pare-feux. Toujours surveiller les compteurs de fragmentation (ex: `netstat -s | grep -i fragment`).

---

## Nouvelles abréviations rencontrées
- **OSI** : Open Systems Interconnection
- **MTU** : Maximum Transmission Unit
- **MSS** : Maximum Segment Size
- **TTL** : Time To Live
- **DSCP** : Differentiated Services Code Point
- **PDU** : Protocol Data Unit

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Capture et Analyse Ethernet/IP
- **Consigne** : Avec `tcpdump`, effectuez un ping et analysez l'EtherType et le TTL.
- **Livrables à produire** : Fichier capture `.pcap` et analyse texte.
- **Corrigé détaillé & Guidé** :
```bash
1. Lancer la capture dans un terminal :
sudo tcpdump -i any -c 4 icmp -w analyse_ping.pcap

2. Dans un 2ème terminal : ping -c 4 8.8.8.8

3. Lire la capture avec filtres approfondis :
tcpdump -r analyse_ping.pcap -v -e
# Vous verrez la MAC, l'EtherType IPv4 (0x0800), et le TTL des paquets envoyés vs reçus.
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: Quelle couche du modèle OSI ajoute l'adresse MAC source et destination ? A) Physique B) Liaison C) Réseau D) Transport. **Réponse: B**
2. QCM: Que se passe-t-il si un paquet IPv4 a un TTL de 0 ? A) Il est fragmenté B) Il est renvoyé à l'expéditeur C) Il est détruit D) Il est mis en cache. **Réponse: C**
3. QCM: Quelle est la valeur classique de la MTU Ethernet ? A) 1000 octets B) 1500 octets C) 9000 octets D) 65535 octets. **Réponse: B**
4. QCM: Quel champ Ethernet indique qu'un paquet IP est transporté ? A) FCS B) Preamble C) EtherType D) VLAN Tag. **Réponse: C**
5. QCM: Si le ping passe mais les téléchargements plantent, quel est le suspect principal ? A) Problème DNS B) Problème de MTU asymétrique C) Câble Ethernet sectionné D) Mauvais masque de sous-réseau. **Réponse: B**

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
