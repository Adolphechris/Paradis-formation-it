# Jour J0D — Le Monde du Réseau & d'Internet : Anatomie des Communications Numériques

> [!NOTE]
> **SEMESTRE 0 — PARCOURS D'INITIATION ET SOCLE DE PRÉ-REQUIS ABSOLUS (J0a–J0o)**  
> Cette leçon explique l'architecture globale des réseaux informatiques : des cartes réseau locales jusqu'aux câbles sous-marins intercontinentaux, en passant par le modèle OSI, l'adressage IP/MAC et les protocoles TCP/UDP.

---

## 🎯 Objectifs de la Leçon

- 🌐 Comprendre la typologie des réseaux (LAN, MAN, WAN, Internet).
- 📇 Différencier l'adresse physique (**MAC**) et l'adresse logique (**IP**).
- 🧱 Explorer les 7 couches du **Modèle OSI** et du modèle **TCP/IP**.
- 🚦 Distinguer le fonctionnement des **Switchs** (Commutateurs) et des **Routeurs**.
- 🤝 Maîtriser le modèle **Client-Serveur** et le voyage complet d'un paquet de données.
- ⚡ Analyser les protocoles de transport **TCP** (fiable) vs **UDP** (rapide).
- 🧪 Manipuler les outils de diagnostic réseau fondamentaux sous Linux (`ip`, `ping`, `traceroute`, `dig`, `curl`).

---

## 🖼️ Le Réseau Mondial Interconnecté

![Réseau & Internet](https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800)

---

## 📖 1. Qu'est-ce qu'un Réseau Informatique ?

### 1.1 Narration & Intuition — Le Système Postal Mondial

Imaginez le système postal international. 
- Chaque maison possède un **numéro de série unique** gravé sur sa boîte aux lettres (l'**Adresse MAC**).
- Chaque quartier et ville possède un **code postal hiérarchique** qui indique la région du monde (l'**Adresse IP**).
- Les **facteurs locaux** livrent le courrier dans le même quartier (les **Switchs** de Couche 2).
- Les **centres de tri régionaux** et les avions de fret acheminent les colis entre les continents (les **Routeurs** et câbles sous-marins de Couche 3).

Un **réseau informatique** est l'infrastructure d'équipements (serveurs, PC, routeurs, switchs) reliés par des supports physiques (câbles cuivre RJ45, fibre optique) ou hertzien (Wi-Fi, 5G, Liaisons Satellite) échangeant des trames et paquets de données binaire.

### 1.2 La Typologie des Réseaux par Échelle

```
┌──────────────────────────────────────────────────────────────────────────┐
│ PAN (Personal Area Network)  │ Bluetooth, Zigbee (1 à 10 mètres)         │
├──────────────────────────────┼───────────────────────────────────────────┤
│ LAN (Local Area Network)     │ Réseau de maison, bureau, école (LAN)     │
├──────────────────────────────┼───────────────────────────────────────────┤
│ MAN (Metropolitan Area Net.) │ Réseau d'une ville entière (Fibre noire)  │
├──────────────────────────────┼───────────────────────────────────────────┤
│ WAN (Wide Area Network)      │ Réseau étendu national ou mondial        │
├──────────────────────────────┼───────────────────────────────────────────┤
│ INTERNET                     │ Le "Réseau des Réseaux" mondial libre     │
└──────────────────────────────┴───────────────────────────────────────────┘
```

---

## 📖 2. Comment un Équipement est-il Identifié ? (MAC vs IP)

### 2.1 L'Adresse MAC (Adresse Physique de Couche 2)

L'**Adresse MAC** (*Media Access Control*) est un identifiant hexadécimal de 48 bits (6 octets) gravé en usine sur le composant physique de la carte réseau (NIC).

Exemple d'adresse MAC : `00:1A:2B:3C:4D:5E`
- **3 premiers octets (`00:1A:2B`)** : Identifiant Unique du Constructeur (OUI - *Organizationally Unique Identifier*), attribué par l'IEEE (ex: Intel, Cisco, Apple).
- **3 derniers octets (`3C:4D:5E`)** : Numéro de série unique attribué par le fabricant.

> [!NOTE]
> L'adresse MAC sert **uniquement aux communications locales** sur le même brin réseau (LAN / Switch). Elle ne traverse JAMAIS un routeur.

### 2.2 L'Adresse IP (Adresse Logique de Couche 3)

L'**Adresse IP** (*Internet Protocol*) est une adresse logique attribuée dynamiquement (via DHCP) ou statiquement à un équipement.

- **IPv4 (32 bits)** : Format décimal à 4 octets séparés par des points (ex: `192.168.1.50` ou `8.8.8.8`). Offre ~4,3 milliards d'adresses uniques (saturées aujourd'hui).
- **IPv6 (128 bits)** : Format hexadécimal à 8 groupes de 4 chiffres (ex: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`). Offre $3.4 \times 10^{38}$ adresses (quasiment infini).

### 2.3 IP Privées vs IP Publiques (Norme RFC 1918)

Pour lutter contre la pénurie d'adresses IPv4, les adresses ont été divisées en deux catégories :

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ADRESSES IP PRIVÉES (Réseau Local / Inaccessibles depuis Internet)       │
├──────────────────────────────────────────────────────────────────────────┤
│ Plage Classe A : 10.0.0.0      à  10.255.255.255   (Masque /8)            │
│ Plage Classe B : 172.16.0.0    à  172.31.255.255   (Masque /12)           │
│ Plage Classe C : 192.168.0.0   à  192.168.255.255 (Masque /16)           │
└──────────────────────────────────────────────────────────────────────────┘
```

- **IP Privée** : Utilisée à l'intérieur de votre entreprise ou maison. Les routeurs d'Internet refusent de transmettre des paquets vers une IP privée.
- **IP Publique** : Adresse unique au monde fournie par votre Fournisseur d'Accès Internet (FAI / ISP). C'est l'adresse de votre Box/Routeur visible depuis l'extérieur.
- **NAT (Network Address Translation)** : Le mécanisme de votre routeur qui traduit toutes les adresses IP privées de vos PC/smartphones en une seule adresse IP publique pour communiquer avec Internet.

---

## 📖 3. Le Modèle OSI et la Pile TCP/IP

Le **Modèle OSI** (*Open Systems Interconnection*) est le cadre théorique en 7 couches créé par l'ISO pour standardiser les télécommunications.

```
Modèle OSI (7 Couches)            Modèle TCP/IP (4 Couches)       Unités de Données (PDU)
┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────┐
│ 7. APPLICATION          │      │                         │      │ Data (Données)      │
│ 6. PRÉSENTATION         │ ───► │ 4. APPLICATION          │ ───► │ (Messages HTTP,     │
│ 5. SESSION              │      │    (HTTP, SSH, DNS)    │      │  DNS, SSH)          │
├─────────────────────────┤      ├─────────────────────────┤      ├─────────────────────┤
│ 4. TRANSPORT            │ ───► │ 3. TRANSPORT (TCP, UDP) │ ───► │ Segment / Datagramme│
├─────────────────────────┤      ├─────────────────────────┤      ├─────────────────────┤
│ 3. RÉSEAU               │ ───► │ 2. INTERNET (IP, ICMP)  │ ───► │ Paquet IP           │
├─────────────────────────┤      ├─────────────────────────┤      ├─────────────────────┤
│ 2. LIAISON DE DONNÉES   │ ────┐│ 1. ACCÈS RÉSEAU        │ ───► │ Trame Ethernet      │
│ 1. PHYSIQUE             │ ────┘│    (Ethernet, Wi-Fi)    │      │ Bits (0 et 1)       │
└─────────────────────────┘      └─────────────────────────┘      └─────────────────────┘
```

### 3.1 Couche 4 — Transport : TCP vs UDP

Au niveau de la couche 4, les données sont remises au bon programme grâce aux **Numéros de Ports** (de 0 à 65535).

```
          ┌─────────────────────────────────────────────────────────┐
          │  TCP (Transmission Control Protocol)                    │
          │  - Orienté connexion (Three-Way Handshake : SYN, SYN-ACK, ACK)
          │  - Garantit la livraison exacte et l'ordre des données │
          │  - Utilisé par : Web (HTTP/443), SSH (22), Mail, DB     │
          └─────────────────────────────────────────────────────────┘
          ┌─────────────────────────────────────────────────────────┐
          │  UDP (User Datagram Protocol)                           │
          │  - Sans connexion, sans accusé de réception            │
          │  - Ultra-rapide, latence minimale                       │
          │  - Utilisé par : DNS (53), Streaming vidéo, Jeux, VoIP │
          └─────────────────────────────────────────────────────────┘
```

---

## 📖 4. Le Voyage Complet d'une Requête Web : De la Saisie à l'Écran

Que se passe-t-il exactement quand vous tapez `https://google.com` dans votre navigateur ?

```
Step 1: Résolution DNS
        Votre PC demande au serveur DNS (ex: 8.8.8.8) : "Quelle est l'IP de google.com ?"
        Le DNS répond : "142.250.190.46".

Step 2: Résolution ARP (Address Resolution Protocol)
        Votre PC demande sur le réseau local : "Qui possède l'IP de la passerelle 192.168.1.1 ?"
        Le routeur répond : "C'est ma MAC 00:11:22:33:44:55".

Step 3: Handshake TCP 3-Voies (Three-Way Handshake)
        - PC ─── SYN ──────────────► Serveur Google
        - PC ◄── SYN-ACK ─────────── Serveur Google
        - PC ─── ACK ──────────────► Serveur Google
        (La connexion TCP sécurisée est établie !)

Step 4: Négociation TLS / HTTPS
        Le navigateur et le serveur échangent leurs certificats de chiffrement pour sécuriser la ligne.

Step 5: Requête HTTP GET & Réponse HTML
        Le navigateur envoie `GET / HTTP/1.1`. Le serveur renvoie le code HTML `200 OK`. Le navigateur dessine la page.
```

---

## 🧪 Atelier Pratique : Diagnostiquer le Réseau sous Linux

Exécutez ces commandes réelles dans votre terminal Linux pour explorer votre réseau :

```bash
# 1. Afficher vos interfaces réseau et vos adresses IP (v4 et v6)
ip addr show
# Output attendu: eth0 / wlan0 avec inet 192.168.x.x/24

# 2. Inspecter la table de routage (par quel routeur sortent vos paquets)
ip route show
# Output attendu: default via 192.168.1.1 dev eth0 (192.168.1.1 est votre Passerelle/Gateway)

# 3. Interroger la table ARP (les adresses MAC associées aux IP du réseau local)
ip neighbor show
# Output attendu: 192.168.1.1 dev eth0 lladdr 00:11:22:33:44:55 REACHABLE

# 4. Tester la connectivité et mesurer la latence réseau vers Google
ping -c 4 8.8.8.8
# Output attendu: 4 packets transmitted, 4 received, 0% packet loss, time 20ms

# 5. Tracer la route paquet par paquet (chaque routeur / "hop" traversé)
traceroute 8.8.8.8
# Output attendu: Liste numérotée de 1 à N des routeurs traversés avec leurs temps de réponse

# 6. Interroger les serveurs DNS pour obtenir l'IP d'un domaine avec dig
dig +short google.com
# Output attendu: 142.250.190.46

# 7. Tester l'accès HTTP d'un site web et lire les en-têtes HTTP de réponse
curl -I https://google.com
# Output attendu: HTTP/2 200 ... server: gws ...

# 8. Lister tous les ports TCP et UDP actuellement ouverts en écoute sur votre machine
sudo ss -tuln
# Output attendu: Netid State Recv-Q Send-Q Local Address:Port
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Diagnostic de Panne Réseau par Couche (Méthode Bottom-Up)

```
Étape 1 (Couche 1/2) ──► `ip link`          : L'interface est-elle UP ? Le câble est-il branché ?
Étape 2 (Couche 3)   ──► `ping 192.168.1.1` : Le routeur local répond-il ?
Étape 3 (Couche 3)   ──► `ping 8.8.8.8`     : L'accès à Internet est-il fonctionnel ?
Étape 4 (Couche 7)   ──► `dig google.com`   : La résolution DNS fonctionne-t-elle ?
Étape 5 (Couche 4/7) ──► `nc -vz host 443`  : Le port de l'application est-il ouvert ?
```

### 2. Message d'Erreur : "Network is unreachable"
- **Cause** : La machine n'a pas de route par défaut configurée ou la carte réseau est désactivée.
- **Réflexe** : Vérifiez `ip route`. Si la ligne `default via X.X.X.X` manque, la passerelle n'est pas configurée.

### 3. Message d'Erreur : "Could not resolve hostname"
- **Cause** : Le réseau fonctionne (ping 8.8.8.8 marche), mais les serveurs DNS ne répondent pas.
- **Réflexe** : Vérifiez le fichier `/etc/resolv.conf` ou testez avec `dig @8.8.8.8 google.com`.

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Quelle est la caractéristique fondamentale d'une adresse MAC par rapport à une adresse IP ?**
- A) L'adresse MAC est une adresse logique attribuée par le serveur DHCP
- B) L'adresse MAC est un identifiant physique de 48 bits gravé en usine sur la carte réseau
- C) L'adresse MAC ne sert qu'à naviguer sur les sites sécurisés HTTPS
- D) L'adresse MAC change chaque fois que l'on redémarre l'ordinateur

*Réponse : B — L'adresse MAC est l'empreinte physique unique gravée sur la carte réseau et utilisée sur le LAN.*

**Q2 : À quelle couche du modèle OSI se situent les adresses IP et le routage des paquets ?**
- A) Couche 1 (Physique)
- B) Couche 2 (Liaison de données)
- C) Couche 3 (Réseau)
- D) Couche 7 (Application)

*Réponse : C — La couche 3 (Réseau) gère l'adressage logique IP et l'acheminement des paquets à travers les routeurs.*

**Q3 : Quelle est la différence majeure entre le protocole de transport TCP et UDP ?**
- A) TCP est plus rapide qu'UDP
- B) TCP est un protocole orienté connexion qui garantit la livraison des données, tandis qu'UDP est non connecté et ultra-rapide sans garantie
- C) UDP est réservé aux connexions chiffrées par mot de passe
- D) TCP fonctionne uniquement sur les liaisons satellite

*Réponse : B — TCP assure la fiabilité via accusés de réception (SYN/ACK), alors qu'UDP privilégie la vitesse maximale sans contrôle d'erreur.*

**Q4 : Quelle plage d'adresses IP IPv4 fait partie des adresses privées (RFC 1918) utilisables librement sur un réseau local ?**
- A) `8.8.8.0` à `8.8.8.255`
- B) `192.168.0.0` à `192.168.255.255`
- C) `1.1.1.0` à `1.1.1.255`
- D) `200.100.50.0` à `200.100.50.255`

*Réponse : B — `192.168.0.0/16` (ainsi que `10.0.0.0/8` et `172.16.0.0/12`) sont les plages réservées RFC 1918 pour les réseaux locaux.*

**Q5 : Quel protocole est utilisé par un ordinateur pour convertir un nom de domaine lisible (ex: `google.com`) en une adresse IP numérique (ex: `142.250.190.46`) ?**
- A) ARP
- B) DHCP
- C) DNS (Domain Name System)
- D) FTP

*Réponse : C — Le DNS est l'annuaire d'Internet qui traduit les noms de domaine en adresses IP.*

**Q6 : Quel est le rôle du protocole ARP (Address Resolution Protocol) sur un réseau local ?**
- A) Traduire une adresse IP en adresse MAC physique sur le LAN
- B) Télécharger des fichiers multimédias
- C) Chiffrer les mots de passe des utilisateurs
- D) Définir l'heure du système

*Réponse : A — ARP permet à un ordinateur connaissant l'IP destination locale de trouver l'adresse MAC physique correspondante sur le switch.*

**Q7 : Quelle commande Linux permet de visualiser tous les routeurs d'Internet traversés successivement par un paquet jusqu'à sa destination ?**
- A) `lsblk`
- B) `traceroute` (ou `mtr`)
- C) `chmod`
- D) `uname`

*Réponse : B — `traceroute` envoie des paquets à TTL croissant pour identifier chaque routeur intermédiaire (hop) sur le chemin.*

**Q8 : Quel mécanisme réseau intégré au routeur permet à plusieurs ordinateurs d'un réseau local ayant des IP privées de partager une seule adresse IP publique sur Internet ?**
- A) DNS
- B) NAT (Network Address Translation)
- C) SSH
- D) BGP

*Réponse : B — Le NAT traduit les adresses IP privées du réseau local en une adresse IP publique unique lors des sorties vers Internet.*

---

## 📚 Ressources & Références

- **RFC 791** — Internet Protocol Specification (IPv4) : https://datatracker.ietf.org/doc/html/rfc791
- **RFC 793** — Transmission Control Protocol (TCP) : https://datatracker.ietf.org/doc/html/rfc793
- **RFC 1918** — Address Allocation for Private Internets : https://datatracker.ietf.org/doc/html/rfc1918
- **Wireshark User Guide** : https://www.wireshark.org/docs/wsug_html_chunked/

---

*Semestre 0 — Module d'Initiation & Pré-requis Absolus PARADIS IT Masterclass*
