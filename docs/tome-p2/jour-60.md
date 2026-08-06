# SEMESTRE 2 — Jour 60 (6h) : Projet Intégrateur Semestre 2 (Partie 1)

> [!NOTE]
> **Objectif de la journée** : Concevoir et déployer intégralement l'architecture réseau d'une "Banque Centrale", de zéro. Intégration de BIND9, DHCP, Relay, nftables et routage OSPF/WireGuard.
> **Compétences visées** : `BIT-04` (A), `SEC-04` (A), `PRO-01` (A) — Piloter un projet d'infrastructure complet de bout en bout.

---

## 1) Cahier des Charges et Topologie (1h30)

### 📖 1.1 Narration & Intuition
Aujourd'hui, vous n'êtes plus étudiant, vous êtes l'Ingénieur Réseau Lead du projet "PARADIS Bank". Tous les concepts vus durant les 5 derniers jours doivent s'imbriquer. Le DNS ne fonctionne pas sans réseau, le DHCP dépend du Relay, le VPN a besoin de routage, et le pare-feu surveille tout. La phase de design sur papier (ou tableau blanc) est cruciale : une erreur d'adressage IP maintenant, et c'est l'échec de la maquette cet après-midi.

### 🔍 1.2 Anatomie Technique
**Site Principal (HQ - Siège) :**
- Routeur Core (Debian). IP WAN : 203.0.113.1
- VLAN 10 (Serveurs) : `10.1.10.0/24` (Héberge DNS BIND9 et Serveur DHCP).
- VLAN 20 (Employés HQ) : `10.1.20.0/24`

**Site Distant (Branch - Agence) :**
- Routeur Branch (Debian). IP WAN : 198.51.100.1
- VLAN 30 (Employés Agence) : `10.2.30.0/24`

**Interconnexion :** Tunnel WireGuard (`172.16.0.0/30`) entre le Core HQ et le Branch.
**Routage dynamique :** OSPF (Quagga/FRR) pour diffuser les routes à travers le tunnel.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Exercice de design : Dessinez la topologie !
# Préparez un document (plan d'adressage Excel/Markdown) listant :
# - Nom de machine
# - Interface
# - Adresse IP / Masque
# - Gateway
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Erreur classique** : Commencer à taper des commandes sur les VM sans avoir figé le plan d'adressage IP.
- **Réflexe** : Faire valider le schéma logique avant tout déploiement technique.

---

## 2) Déploiement des Services Centraux HQ (1h30)

### 📖 2.1 Narration & Intuition
Le siège doit être autonome. Nous commençons par le cœur du réseau : la résolution de noms (DNS) et la distribution d'IP (DHCP). Ces services seront hébergés dans le VLAN 10 (Zone de confiance).

### 🔍 2.2 Anatomie Technique
- Le serveur DHCP (VLAN 10) doit distribuer des IP au VLAN 20. Le Routeur Core HQ doit donc agir comme DHCP Relay.
- Le DNS "paradis-bank.lan" contiendra les IP des serveurs internes.

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# A. Sur le Routeur Core HQ : Activer le routage
sysctl -w net.ipv4.ip_forward=1
apt install isc-dhcp-relay -y
# Configurer le relay pour écouter sur l'interface du VLAN 20 et relayer vers IP du Serv DHCP.

# B. Sur le Serveur DHCP (VLAN 10) :
apt install isc-dhcp-server -y
# Configurer dhcpd.conf avec DEUX subnets : un pour le VLAN 10 (même vide) et un pour le VLAN 20.
# option domain-name "paradis-bank.lan";
# option domain-name-servers 10.1.10.2; # IP du BIND9

# C. Sur le Serveur DNS (VLAN 10) :
apt install bind9 -y
# Configurer une zone primaire master "paradis-bank.lan"
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Test de validation immédiat** : Un client Windows/Linux branché dans le VLAN 20 (HQ) obtient une IP, ping le routeur, et résout un nom DNS interne. Si ce n'est pas le cas, on ne passe pas à l'étape 3 !

---

## 3) Interconnexion VPN et Routage Dynamique (2h00)

### 📖 3.1 Narration & Intuition
L'agence s'ouvre. Il faut relier physiquement et logiquement l'agence au siège. Le tunnel WireGuard créera le lien. Ensuite, pour éviter d'écrire des routes statiques (complexes à maintenir), nous activerons OSPF. OSPF va automatiquement dire au HQ : "Je connais le VLAN 30, passe par le tunnel !".

### 🔍 3.2 Anatomie Technique
- **WireGuard** : Création du tunnel `wg0` entre les deux routeurs.
- **FRRouting (FRR)** : Suite logicielle de routage.
  - Démon OSPF activé.
  - Annonce du réseau `10.1.0.0/16` sur le Core HQ.
  - Annonce du réseau `10.2.0.0/16` sur le Branch.

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Sur les deux routeurs : WireGuard
# Voir cours Jour 59 pour le wg0.conf
# Attention à AllowedIPs : Vous pouvez mettre 0.0.0.0/0 ou explicitement les sous-réseaux OSPF pour permettre le routage.

# Sur les deux routeurs : Installation FRR (OSPF)
sudo apt update && sudo apt install frr -y
sudo sed -i 's/ospfd=no/ospfd=yes/' /etc/frr/daemons
sudo systemctl restart frr

# Entrer dans le shell de routage vtysh (Syntaxe de type Cisco)
sudo vtysh
# conf t
# router ospf
# network 172.16.0.0/30 area 0 (le lien VPN)
# network 10.1.0.0/16 area 0 (Sur le HQ)
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Problème** : Les voisins OSPF ne se voient pas au travers du tunnel VPN.
- **Cause** : WireGuard n'est pas un tunnel "broadcast" par défaut. OSPF utilise le multicast IP (224.0.0.5). Sur des tunnels point à point WireGuard non natifs, il faut parfois forcer les `neighbor` (voisins) en statique ou utiliser GRE-over-WireGuard.

---

## 📚 Nouvelles abréviations rencontrées
- **OSPF** : Open Shortest Path First
- **FRR** : FRRouting
- **HQ** : Headquarters (Siège)
- **Branch** : Agence distante
- **GRE** : Generic Routing Encapsulation

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Intégration Sécurité (nftables)
- **Consigne** : L'infrastructure est fonctionnelle, mais "ouverte à tous les vents". Sur le Routeur Core HQ, déployez un script nftables qui bloque le trafic Internet entrant (DNAT/INPUT), masque la sortie des VLANs vers le WAN (SNAT), et autorise le trafic VPN (UDP 51820).
- **Livrables à produire** : Script nftables du Core HQ commenté, captures des tests de ping bloqués.
- **Corrigé détaillé & Guidé** :
```bash
# 1. SNAT pour sortir
# add rule ip nat postrouting oifname "eth_wan" masquerade
# 2. Autoriser WireGuard entrant
# add rule inet filter input iifname "eth_wan" udp dport 51820 accept
# 3. Policy drop sur le reste de l'input WAN.
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Dans ce projet intégrateur, pourquoi le Routeur Core HQ nécessite-t-il `isc-dhcp-relay` ?**
   A) Pour doubler la vitesse d'attribution des IP
   B) Car le serveur DHCP est dans un VLAN différent des clients du VLAN 20
   C) Pour relayer les paquets DNS vers Internet
   D) Pour contourner nftables
   **Réponse : B**

2. **Quelle est l'utilité du protocole OSPF dans cette architecture ?**
   A) Chiffrer le trafic entre le HQ et l'agence
   B) Propager automatiquement les routes des sous-réseaux de chaque côté du VPN
   C) Assigner des IP automatiquement
   D) Faire du NAT
   **Réponse : B**

3. **Quelle commande CLI de FRR permet de configurer le routage comme sur un équipement Cisco ?**
   A) frr-cli
   B) cisco-shell
   C) ip route
   D) vtysh
   **Réponse : D**

4. **Si un client du VLAN 30 de l'agence ne peut pas pinguer le DNS du HQ, quelle couche vérifier en PREMIER selon l'approche "Bottom-Up" ?**
   A) Le fichier de zone de BIND9
   B) Le tunnel WireGuard et la table de routage (`ip route`)
   C) L'adresse MAC du serveur
   D) Le serveur Web
   **Réponse : B**

5. **Quel est le risque de configurer `AllowedIPs = 0.0.0.0/0` sur le Pair du HQ dans WireGuard ?**
   A) Aucun risque, c'est la configuration par défaut
   B) Cela va bloquer complètement le tunnel
   C) WireGuard va tenter d'envoyer TOUT le trafic du HQ (y compris internet) vers l'Agence distante
   D) OSPF va crasher
   **Réponse : C**

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
