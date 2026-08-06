# SEMESTRE 2 — Jour 57 (6h) : Service DHCP & Relay Agent

> [!NOTE]
> **Objectif de la journée** : Comprendre le mécanisme d'attribution IP dynamique (DORA) et configurer un serveur DHCP centralisé capable de servir plusieurs réseaux locaux isolés (VLANs) grâce aux agents relais.
> **Compétences visées** : `BIT-04` (A) — Administrer les services réseaux de base.

---

## 1) Le Processus DHCP (DORA) (1h30)

### 📖 1.1 Narration & Intuition
Imaginons un nouvel employé arrivant dans une entreprise de 1000 personnes. S'il fallait que l'administrateur aille taper manuellement une adresse IP, un masque et une passerelle sur chaque PC, ce serait l'enfer. Le DHCP (Dynamic Host Configuration Protocol) est le bureau d'accueil automatique : la machine crie "Je suis nouveau, j'ai besoin d'une IP !", et le serveur lui attribue un "bail" réseau pour un temps donné, avec toutes les informations nécessaires.

### 🔍 1.2 Anatomie Technique
L'échange DHCP se fait en 4 étapes clés, mnémotechnique **DORA** :
- **D - Discover** : Le client envoie un broadcast (255.255.255.255, port UDP 67) pour trouver un serveur.
- **O - Offer** : Le serveur répond (unicast ou broadcast) en proposant une adresse IP.
- **R - Request** : Le client valide cette IP et la demande formellement.
- **A - Acknowledge** : Le serveur confirme que l'IP est à lui et valide le bail (lease).

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Lancer une capture de paquets pour observer le DORA process (depuis le serveur ou client Linux)
sudo tcpdump -i eth0 port 67 or port 68 -n -v

# Relâcher son IP (Client)
sudo dhclient -r eth0

# Demander une nouvelle IP (Client)
sudo dhclient -v eth0
# Observez dans tcpdump les paquets DHCP Discover, Offer, Request, ACK !
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Problème** : Le client n'obtient pas d'adresse IP (APIPA - `169.254.x.x` sous Windows).
- **Cause** : Le broadcast `Discover` n'atteint pas le serveur. Soit le serveur est down, soit ils ne sont pas dans le même domaine de diffusion (VLAN) et il manque un relais DHCP.

---

## 2) Configuration du Serveur isc-dhcp-server (1h30)

### 📖 2.1 Narration & Intuition
Le serveur DHCP est le maître de l'allocation des IP. Il gère des "plages" (pools/scopes) et évite les conflits d'IP. Outre l'IP, il distribue des "Options", très importantes pour l'infrastructure (routeur par défaut, serveurs DNS, serveur de temps NTP).

### 🔍 2.2 Anatomie Technique
Nous utilisons `isc-dhcp-server` (qui est peu à peu remplacé par Kea, mais reste un standard de l'industrie).
- Fichier global : `/etc/dhcp/dhcpd.conf`
- Déclaration d'un sous-réseau (subnet)
- Déclaration des Options : 
  - `option routers` (Option 3)
  - `option domain-name-servers` (Option 6)
  - `option ntp-servers` (Option 42)

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# Installation du serveur
sudo apt update && sudo apt install isc-dhcp-server -y

# Éditer le fichier /etc/default/isc-dhcp-server pour spécifier l'interface (ex: INTERFACESv4="eth1")
sudo sed -i 's/INTERFACESv4=""/INTERFACESv4="eth1"/' /etc/default/isc-dhcp-server

# Configuration basique de dhcpd.conf
sudo bash -c 'cat <<EOF > /etc/dhcp/dhcpd.conf
default-lease-time 600;
max-lease-time 7200;
authoritative;

subnet 192.168.10.0 netmask 255.255.255.0 {
  range 192.168.10.100 192.168.10.200;
  option routers 192.168.10.254;
  option domain-name-servers 8.8.8.8, 8.8.4.4;
  option domain-name "paradis.lan";
}
EOF'

# Redémarrer le service
sudo systemctl restart isc-dhcp-server
sudo systemctl status isc-dhcp-server
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Message d'erreur** : `dhcpd: not configured to listen on any interfaces!`
- **Solution** : Le serveur DHCP doit obligatoirement avoir une adresse IP statique configurée sur son interface locale qui correspond au `subnet` déclaré dans son fichier de configuration.

---

## 3) DHCP Relay (Agent Relais) à travers les VLANs (2h00)

### 📖 3.1 Narration & Intuition
Pour des raisons de sécurité et de performances, un réseau d'entreprise est découpé en plusieurs VLANs (ex: VLAN 10 Compta, VLAN 20 Direction). Or, les broadcasts DHCP (`Discover`) ne traversent pas les routeurs/pare-feux séparant les VLANs. Faut-il installer un serveur DHCP par VLAN ? Non. On installe un **DHCP Relay**. Il écoute les cris (broadcasts) des clients sur un VLAN, et les transfère gentiment au serveur DHCP central en mode unicast (direct).

### 🔍 3.2 Anatomie Technique
Le relais DHCP se place souvent sur le routeur central (ou un firewall pfSense/Cisco). Sous Linux, c'est le paquet `isc-dhcp-relay` (commande `dhcrelay`).
- Il écoute sur l'interface du VLAN client (ex: eth1).
- Il renvoie la demande au serveur DHCP (ex: 10.0.0.5).
Le serveur DHCP central recevant cette demande *relaiée*, lit l'adresse IP de l'agent relais (giaddr : Gateway IP address) et comprend immédiatement dans quel `subnet` il doit piocher l'IP à donner au client !

### 🛠️ 3.3 Atelier Pratique Hands-on
*(Sur une machine faisant office de routeur/relais entre le réseau Client et le réseau Serveur)*
```bash
# Installer le relais DHCP
sudo apt update && sudo apt install isc-dhcp-relay -y

# Configurer /etc/default/isc-dhcp-relay
# SERVERS="10.0.0.5" # IP du serveur DHCP
# INTERFACES="eth1 eth2" # Interfaces écoutées (côté client)
# OPTIONS=""

# Lancer manuellement pour observer (mode debug)
sudo dhcrelay -d -i eth1 10.0.0.5
```
*Côté Serveur DHCP, vous devez avoir un bloc `subnet` correspondant au réseau du client, même si le serveur DHCP n'a pas d'interface directe dans ce réseau.*

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Problème** : Le serveur DHCP central rejette la demande avec `unknown subnet`.
- **Cause** : Le serveur DHCP n'a pas de bloc `subnet` configuré pour le réseau correspondant à l'IP du relais.

---

## 📚 Nouvelles abréviations rencontrées
- **DHCP** : Dynamic Host Configuration Protocol
- **DORA** : Discover, Offer, Request, Acknowledge
- **NTP** : Network Time Protocol
- **VLAN** : Virtual Local Area Network
- **APIPA** : Automatic Private IP Addressing

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Réservation DHCP (Static Lease)
- **Consigne** : Un directeur exige que son imprimante réseau (MAC: `00:11:22:33:44:55`) reçoive toujours l'IP fixe `192.168.10.50` depuis le serveur DHCP.
- **Livrables à produire** : Fichier `dhcpd.conf` mis à jour et log de l'attribution.
- **Corrigé détaillé & Guidé** :
```bash
# Ajouter ce bloc dans dhcpd.conf, sous la déclaration subnet :
# host imprimante-boss {
#   hardware ethernet 00:11:22:33:44:55;
#   fixed-address 192.168.10.50;
# }
# Puis redémarrer : systemctl restart isc-dhcp-server
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Que signifie l'acronyme DORA dans le contexte DHCP ?**
   A) Discover, Offer, Request, Acknowledge
   B) Domain, Object, Route, Access
   C) DHCP, Offer, Reply, Accept
   D) Discover, Options, Routing, Acknowledge
   **Réponse : A**

2. **Quelle est l'Option DHCP numéro 3 ?**
   A) Serveur DNS
   B) Serveur NTP
   C) Nom de domaine
   D) Routeur par défaut (Gateway)
   **Réponse : D**

3. **Quelle commande Linux permet à un client de libérer son bail DHCP actuel ?**
   A) dhcp-release
   B) ipconfig /release
   C) dhclient -r
   D) dhcp-client -stop
   **Réponse : C**

4. **Quel est le rôle principal d'un agent relais DHCP (DHCP Relay) ?**
   A) Filtrer les adresses MAC indésirables
   B) Faire passer les requêtes DHCP broadcast d'un VLAN à un autre en unicast
   C) Chiffrer les communications DHCP
   D) Attribuer des adresses IPv6 automatiquement
   **Réponse : B**

5. **Quelle adresse IP un PC sous Windows ou Linux (sans systemd-networkd strict) s'attribue-t-il s'il ne trouve aucun serveur DHCP (APIPA) ?**
   A) 192.168.1.1
   B) 10.0.0.1
   C) 169.254.x.x
   D) 127.0.0.1
   **Réponse : C**

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
