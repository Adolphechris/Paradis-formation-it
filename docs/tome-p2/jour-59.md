# SEMESTRE 2 — Jour 59 (6h) : VPN & Chiffrement de flux (OpenVPN & WireGuard)

> [!NOTE]
> **Objectif de la journée** : Créer des tunnels sécurisés à travers des réseaux non sûrs (Internet), comprendre les architectures VPN, et déployer le protocole moderne WireGuard.
> **Compétences visées** : `SEC-04` (A) — Implémenter et gérer les systèmes de pare-feu et VPN.

---

## 1) Les Concepts Fondamentaux du VPN et Tunneling (1h30)

### 📖 1.1 Narration & Intuition
Imaginez votre réseau d'entreprise à Paris et votre filiale à Lyon. Les données doivent transiter par Internet, qui est public. Un VPN (Virtual Private Network) crée un "tuyau opaque et blindé" dans Internet. Ce qui rentre à Paris ressort à Lyon en toute sécurité. À l'intérieur, les machines croient qu'elles sont sur le même câble réseau local.

### 🔍 1.2 Anatomie Technique
- **Site-to-Site VPN** : Relie deux réseaux entiers (ex: Paris et Lyon). Pas d'installation sur les PC, ce sont les routeurs qui gèrent le tunnel.
- **Client-to-Site (Remote Access)** : Un travailleur nomade avec son PC se connecte au réseau central (télétravail).
- **Interface TUN (Tunnel)** : Travaille au niveau de la couche 3 (IP). Transporte des paquets routés. C'est le plus courant et performant.
- **Interface TAP** : Travaille au niveau de la couche 2 (Ethernet). Transporte des trames MAC (permet de faire passer du broadcast, STP, etc.). Moins utilisé.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Les interfaces virtuelles peuvent être créées manuellement sous Linux pour comprendre
sudo ip tuntap add mode tun dev tun0
sudo ip addr add 10.8.0.1/24 dev tun0
sudo ip link set dev tun0 up
ip a show dev tun0
# Note: Sans programme pour chiffrer et router les données de tun0 vers l'extérieur, c'est une interface "morte".
sudo ip link delete tun0
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Problème** : Lenteur extrême dans le VPN (fragmentation).
- **Réflexe** : Le "tunnel" ajoute des headers (des enveloppes) au paquet réseau. Si le paquet IP est déjà au maximum (MTU 1500), l'ajout des headers VPN force le système à couper le paquet en deux (fragmentation), ce qui tue les performances. On baisse souvent le MTU des interfaces VPN à 1420.

---

## 2) L'Architecture WireGuard : Le VPN du futur (1h30)

### 📖 2.1 Narration & Intuition
OpenVPN et IPsec règnent depuis des décennies. Ils sont robustes mais contiennent des millions de lignes de code, sont complexes à configurer et parfois lents. WireGuard est une révolution : intégré directement dans le noyau Linux, ultra-rapide, moderne cryptographiquement (ChaCha20, Poly1305), et tient en quelques milliers de lignes de code. Sa configuration ressemble à celle de clés SSH (Clé publique / Clé privée).

### 🔍 2.2 Anatomie Technique
WireGuard n'utilise pas le concept classique de client/serveur. Ce sont tous des "Pairs" (Peers).
Chaque Pair possède :
- Une **PrivateKey** (secrète, sur sa machine).
- Une **PublicKey** (partagée avec les autres).
- Une **Endpoint** IP publique (si l'un des pairs a une IP fixe sur Internet).
- Une notion d'**AllowedIPs** : WireGuard agit comme un pare-feu réseau intégré (Cryptokey Routing) : il n'accepte de déchiffrer un paquet source que si l'IP interne correspond à ce qui est défini dans *AllowedIPs* pour cette clé publique.

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# Installation sur les machines
sudo apt update && sudo apt install wireguard -y

# Génération des clés (sur chaque machine)
wg genkey | tee privatekey | wg pubkey > publickey
cat privatekey
cat publickey
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Avertissement de Sécurité** : Les permissions de la clé privée doivent être `600` (lecture/écriture uniquement par root). Si un attaquant vole cette clé, le tunnel est compromis !

---

## 3) Configuration d'un VPN Site-to-Site avec WireGuard (2h00)

### 📖 3.1 Narration & Intuition
Nous allons relier notre Serveur A (Paris) au Serveur B (Lyon). Le Serveur A a une IP publique connue. Le Serveur B est dynamique mais se connectera au Serveur A.
Nous allons créer un réseau de tunnel virtuel : `10.100.0.0/24`. A aura `.1`, B aura `.2`.

### 🔍 3.2 Anatomie Technique
Le fichier de configuration type : `/etc/wireguard/wg0.conf`.
Structure :
- `[Interface]` : La configuration de la machine locale (sa clé privée, son IP de tunnel, son port d'écoute).
- `[Peer]` : La configuration de l'autre machine (sa clé publique, et quelles IPs sont autorisées à passer dans ce tunnel).

### 🛠️ 3.3 Atelier Pratique Hands-on
*(Sur le Serveur A - IP Publique : 203.0.113.1)*
```bash
sudo bash -c 'cat <<EOF > /etc/wireguard/wg0.conf
[Interface]
Address = 10.100.0.1/24
SaveConfig = false
ListenPort = 51820
PrivateKey = <Private_Key_Serveur_A>

[Peer]
# Info du Serveur B
PublicKey = <Public_Key_Serveur_B>
AllowedIPs = 10.100.0.2/32
EOF'

# Lancer et activer le tunnel A
sudo systemctl enable --now wg-quick@wg0
```

*(Sur le Serveur B - Client de connexion)*
```bash
sudo bash -c 'cat <<EOF > /etc/wireguard/wg0.conf
[Interface]
Address = 10.100.0.2/24
PrivateKey = <Private_Key_Serveur_B>

[Peer]
# Info du Serveur A
PublicKey = <Public_Key_Serveur_A>
Endpoint = 203.0.113.1:51820
AllowedIPs = 10.100.0.1/32
PersistentKeepalive = 25
EOF'

# Lancer le tunnel B
sudo systemctl enable --now wg-quick@wg0

# Test
ping 10.100.0.1
sudo wg show
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Problème** : Le ping ne passe pas.
- **Cause 1** : Pare-feu ! N'oubliez pas d'autoriser le port UDP 51820 sur le Serveur A. (`sudo nft add rule inet filter input udp dport 51820 accept`).
- **Cause 2** : Clés inversées ou `AllowedIPs` trop strict.

---

## 📚 Nouvelles abréviations rencontrées
- **VPN** : Virtual Private Network
- **TUN** : Tunnel (Couche 3 IP)
- **TAP** : Network Tap (Couche 2 Ethernet)
- **MTU** : Maximum Transmission Unit
- **Endpoint** : Point de terminaison public (IP/Port) dans WireGuard.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Accès Télétravail (Client-to-Site) avec Routage
- **Consigne** : Modifier la configuration du Serveur B pour qu'il route tout son trafic Internet à travers le tunnel (Serveur A devient la passerelle).
- **Livrables à produire** : Fichier `wg0.conf` de B modifié.
- **Corrigé détaillé & Guidé** :
```bash
# Dans le wg0.conf de Serveur B, modifier la section Peer :
# AllowedIPs = 0.0.0.0/0
# Note : Pour que Serveur B ait Internet via A, il faudra configurer le NAT (SNAT/Masquerade) et l'IP Forwarding sur le Serveur A !
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Quelle couche réseau une interface "TUN" gère-t-elle principalement ?**
   A) Couche 2 (Ethernet)
   B) Couche 3 (IP)
   C) Couche 4 (TCP/UDP)
   D) Couche 7 (Application)
   **Réponse : B**

2. **WireGuard s'appuie principalement sur quel protocole de transport réseau ?**
   A) TCP
   B) ICMP
   C) UDP
   D) GRE
   **Réponse : C**

3. **Dans WireGuard, quel est le rôle de la directive `AllowedIPs` ?**
   A) Définir quelles IPs publiques peuvent se connecter au serveur
   B) Agir comme table de routage cryptographique et filtrer le trafic entrant/sortant du Pair
   C) Réserver des IP statiques sur le serveur DHCP interne
   D) Augmenter la taille du MTU pour ces IP spécifiques
   **Réponse : B**

4. **Quelle option dans WireGuard permet de maintenir une connexion active à travers un pare-feu NAT strict ?**
   A) KeepConnectionAlive = true
   B) NATTraversal = auto
   C) PersistentKeepalive = 25
   D) BypassFirewall = yes
   **Réponse : C**

5. **Pourquoi la valeur du MTU dans un tunnel VPN est-elle généralement inférieure à 1500 (ex: 1420) ?**
   A) Pour limiter la bande passante des utilisateurs
   B) Pour tenir compte des en-têtes (headers) cryptographiques supplémentaires ajoutés au paquet
   C) Pour éviter les conflits d'adresses IP
   D) C'est une limite imposée par le noyau Linux
   **Réponse : B**

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
