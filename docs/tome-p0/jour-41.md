# SEMESTRE 1 — Jour 41 (6h) : Sécurité Réseau, Firewalls (Netfilter/UFW/iptables), VPN WireGuard & IDS/IPS Suricata

> [!NOTE]
> **Objectif de la journée** : Maîtriser le filtrage d'état de paquets sous Linux (Netfilter, iptables, nftables, UFW), déployer un tunnel VPN chiffré ultra-rapide avec WireGuard, segmenter le réseau en zones de confiance (DMZ/VLANs) et configurer un système de détection/prévention d'intrusion (IDS/IPS) avec Suricata.
> **Compétences visées** : `SEC-04` (Niveau Cible: A) — Architecture Sécurisée, Filtrage Périmétrique, VPN et IDS/IPS.

---

## 🎯 Objectifs de la Leçon

- 🧱 Comprendre l'architecture **Netfilter** du noyau Linux (Chaines `INPUT`, `FORWARD`, `OUTPUT` et suivi d'état `conntrack`).
- 🛡️ Configurer le pare-feu **UFW** (*Uncomplicated Firewall*) et manipuler les règles **iptables / nftables**.
- 🔐 Générer des paires de clés cryptographiques et déployer un tunnel **VPN WireGuard** (ChaCha20-Poly1305 / Curve25519).
- 🏰 Segmenter un réseau d'entreprise en **DMZ** (*Zone Démilitarisée*) et sous-réseaux isolés.
- 👁️ Déployer et analyser les alertes d'un **IDS/IPS Suricata** (Inspection des paquets et fichier `eve.json`).
- 🧪 Pratiquer l'ensemble des configurations réseau sécurisées sous Linux dans le terminal.

---

## 🖼️ Sécurité Périmétrique & Filtrage Réseau

![Firewall & Network Security](https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800)

---

## 📖 1. Le Filtrage de Paquets sous Linux : Netfilter, iptables & UFW

### 1.1 Narration & Intuition — Les Gardes à la Porte du Château

Imaginez un château fort. Les pare-feu (*firewalls*) sont les gardes postés aux portes du château.
1. Un garde vérifie d'où vient le voyageur (**Adresse IP source**).
2. Il demande quelle porte il veut franchir (**Port TCP/UDP destination**, ex: Port 22 pour SSH, Port 80/443 pour le Web).
3. Il vérifie si le voyageur fait partie d'une conversation déjà commencée et légitime (**Stateful Packet Inspection - SPI**).
4. Enfin, le garde décide d'autoriser (**ACCEPT**), de rejeter silencieusement (**DROP**) ou de refuser explicitement (**REJECT**).

### 1.2 L'Architecture du Noyau Linux : Netfilter & conntrack

Sous Linux, le filtrage s'effectue directement au cœur du noyau via le framework **Netfilter**. Les paquets IP traversent 5 chaînes fondamentales :

```
                               LE PARCOURS D'UN PAQUET DANS NETFILTER
                                  ┌──────────────────────────┐
                                  │   Entrée Carte Réseau    │
                                  └─────────────┬────────────┘
                                                │
                                                ▼
                                  ┌──────────────────────────┐
                                  │   Chaîne PREROUTING      │
                                  └─────────────┬────────────┘
                                                │
                                Decision de Routage ?
                                 ┌──────────────┴──────────────┐
                   Destiné au PC │                             │ Destiné à un autre PC
                                 ▼                             ▼
                  ┌──────────────────────────┐   ┌──────────────────────────┐
                  │   Chaîne INPUT           │   │   Chaîne FORWARD         │
                  └─────────────┬────────────┘   └─────────────┬────────────┘
                                │                              │
                        [ Processus Local ]                    │
                                │                              │
                                ▼                              │
                  ┌──────────────────────────┐                 │
                  │   Chaîne OUTPUT          │                 │
                  └─────────────┬────────────┘                 │
                                │                              │
                                └──────────────┬───────────────┘
                                               │
                                               ▼
                                  ┌──────────────────────────┐
                                  │   Chaîne POSTROUTING     │
                                  └─────────────┬────────────┘
                                                │
                                                ▼
                                  ┌──────────────────────────┐
                                  │   Sortie Carte Réseau    │
                                  └──────────────────────────┘
```

- **Stateful Inspection (`conntrack`)** : Netfilter garde en mémoire le statut de chaque connexion :
  - **`NEW`** : Le paquet tente d'ouvrir une nouvelle connexion.
  - **`ESTABLISHED`** : Le paquet appartient à une connexion déjà ouverte et validée.
  - **`RELATED`** : Le paquet initie une connexion secondaire liée (ex: transfert de fichier FTP).
  - **`INVALID`** : Le paquet est corrompu ou ne correspond à aucun état connu (bloqué immédiatement).

### 1.3 Outils de Gestion : iptables vs UFW

- **`iptables` / `nftables`** : Les outils d'administration bas-niveau pour écrire des règles précises dans Netfilter.
- **`UFW` (Uncomplicated Firewall)** : La surcouche d'administration simplifiée sous Ubuntu/Debian idéale pour déployer un pare-feu d'entreprise en quelques secondes.

---

## 📖 2. Réseaux Privés Virtuels : Tunnels VPN WireGuard

### 2.1 Pourquoi Utiliser un VPN ?

Lorsque des collaborateurs travaillent à distance ou connectent deux datacenters via Internet, leurs paquets circulent sur un réseau public non sécurisé. Un **VPN** (*Virtual Private Network*) crée un **tunnel chiffré et authentifié** de bout en bout.

### 2.2 WireGuard vs OpenVPN

```
┌──────────────────────────────────────────────────────────────────────────┐
│ WIREGUARD (Le Standard Moderne)                                         │
│ - Intégré directement dans le Noyau Linux (depuis Linux 5.6).            │
│ - Ultra-léger (~4 000 lignes de code vs 100 000+ pour OpenVPN).         │
│ - Vitesse maximale et latence minimale.                                  │
│ - Cryptographie moderne : Curve25519 (ECDH), ChaCha20-Poly1305, BLAKE2s.  │
├──────────────────────────────────────────────────────────────────────────┤
│ OPENVPN (L'Ancien Standard)                                              │
│ - S'exécute en User Space (commutations de contexte plus lentes).        │
│ - Très grande flexibilité de configuration mais complexe à auditer.      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 📖 3. Segmentation Réseau (DMZ) et Systèmes IDS/IPS (Suricata)

### 3.1 La Zone Démilitarisée (DMZ)

La **DMZ** est un sous-réseau isolé placé entre Internet et le réseau local interne (LAN). On y héberge les serveurs publics (Nginx, Mail, DNS). Si un attaquant régalement compromettait le serveur Web en DMZ, les règles du pare-feu l'empêchent de rebondir vers le réseau interne de l'entreprise.

### 3.2 IDS vs IPS : Suricata

```
                       ┌──────────────────────────────────────────┐
                       │  IDS (Intrusion Detection System)        │
                       │  - Écoute une copie du trafic (Mode Pas).│
                       │  - Envoie une Alerte sans bloquer.       │
                       └──────────────────────────────────────────┘
                       ┌──────────────────────────────────────────┐
                       │  IPS (Intrusion Prevention System)       │
                       │  - Placé en ligne (Inline sur le flux).  │
                       │  - BLOQUE et jette le paquet malveillant.│
                       └──────────────────────────────────────────┘
```

**Suricata** est un moteur IDS/IPS open-source multithreadé ultra-rapide capable d'analyser le trafic réseau en temps réel à l'aide de signatures de menaces et de produire des journaux au format JSON (`eve.json`).

---

## 🧪 Atelier Pratique : Configuration du Pare-feu, VPN & Suricata

Exécutez cette série de 10 commandes réelles sous Linux pour sécuriser votre machine :

```bash
# 1. Réinitialiser et configurer UFW avec une politique de sécurité stricte
sudo ufw reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 2. Autoriser uniquement le SSH (22), le Web (80, 443) et appliquer une règle anti-bruteforce
sudo ufw allow 80/tcp comment "HTTP Web"
sudo ufw allow 443/tcp comment "HTTPS Web"
sudo ufw limit ssh comment "SSH Anti-Bruteforce"

# 3. Activer le pare-feu UFW et vérifier son statut détaillé
echo "y" | sudo ufw enable
sudo ufw status verbose

# 4. Générer une paire de clés cryptographiques WireGuard
sudo apt update && sudo apt install -y wireguard wireguard-tools
wg genkey | tee privatekey | wg pubkey > publickey
echo "Clé privée WireGuard : $(cat privatekey)"
echo "Clé publique WireGuard: $(cat publickey)"

# 5. Créer un fichier de configuration d'interface WireGuard (wg0.conf)
sudo mkdir -p /etc/wireguard
cat << EOF | sudo tee /etc/wireguard/wg0.conf
[Interface]
PrivateKey = $(cat privatekey)
Address = 10.200.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
EOF

# 6. Démarrer le tunnel WireGuard et vérifier son état
sudo wg-quick up wg0 2>/dev/null || true
sudo wg show 2>/dev/null || echo "Interface WireGuard créée"

# 7. Installer l'IDS Suricata sous Ubuntu/Debian
sudo apt install -y suricata suricata-update

# 8. Mettre à jour les règles de signatures de menaces Suricata
sudo suricata-update

# 9. Lancer Suricata en mode inspection
sudo systemctl restart suricata

# 10. Inspecter les alertes du journal EVE JSON de Suricata
sudo tail -f /var/log/suricata/eve.json 2>/dev/null || echo "Suricata actif"
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Danger d'Abonnement : Se bloquer soi-même en SSH (*SSH Lockout*)
- **Mise en garde** : Exécuter `sudo ufw default deny incoming` puis `sudo ufw enable` sur un serveur distant AWS ou VPS sans avoir préalablement exécuté `sudo ufw allow ssh` vous coupera immédiatement et définitivement l'accès SSH !
- **Réflexe** : Toujours exécuter `sudo ufw allow 22/tcp` AVANT d'activer UFW.

### 2. Le tunnel VPN est actif mais les clients n'ont pas accès à Internet
- **Cause** : L'IP Forwarding du noyau Linux n'a pas été activé (`net.ipv4.ip_forward=0`), ou la règle de traduction d'adresses NAT Masquerade (`iptables -t nat -A POSTROUTING`) est manquante sur le serveur VPN.
- **Réflexe** : Activez l'IP forwarding avec `sudo sysctl -w net.ipv4.ip_forward=1`.

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Quelle chaîne du framework Netfilter traite les paquets destinés à des processus locaux s'exécutant sur la machine elle-même ?**
- A) Chaîne `FORWARD`
- B) Chaîne `INPUT`
- C) Chaîne `PREROUTING`
- D) Chaîne `OUTPUT`

*Réponse : B — La chaîne `INPUT` filtre les paquets dont la destination finale est la machine locale.*

**Q2 : Que fait l'option `sudo ufw limit ssh` par rapport à un simple `sudo ufw allow ssh` ?**
- A) Elle ferme le port 22
- B) Elle autorise le SSH mais bloque temporairement les adresses IP qui tentent plus de 6 connexions en 30 secondes (anti brute-force)
- C) Elle chiffre le mot de passe SSH
- D) Elle limite la vitesse de frappe au clavier

*Réponse : B — `ufw limit` intègre une protection contre les attaques de force brute sur SSH.*

**Q3 : Quel algorithme de chiffrement symétrique moderne est utilisé par WireGuard pour garantir la confidentialité du tunnel ?**
- A) DES
- B) ChaCha20-Poly1305
- C) RSA-1024
- D) MD5

*Réponse : B — WireGuard utilise l'algorithme ChaCha20-Poly1305 pour un chiffrement symétrique ultra-rapide.*

**Q4 : Quelle est la différence majeure entre un IDS (Intrusion Detection System) et un IPS (Intrusion Prevention System) ?**
- A) L'IDS est payant, l'IPS est gratuit
- B) L'IDS écoute le trafic et émet une alerte, tandis que l'IPS est placé sur le flux et bloque activement les paquets malveillants
- C) L'IDS ne fonctionne que sur Windows
- D) L'IPS est un câble réseau

*Réponse : B — L'IDS alerte en mode passif ; l'IPS bloque et jette les paquets malveillants en mode actif inline.*

**Q5 : Quel est l'objectif de la création d'une zone DMZ (Zone Démilitarisée) dans une architecture réseau ?**
- A) Augmenter la vitesse du Wi-Fi
- B) Isoler les serveurs publics exposés à Internet (Web, Mail) pour empêcher un attaquant de rebondir directement sur le LAN interne
- C) Remplacer les commutateurs réseau
- D) Effacer les logs d'erreurs

*Réponse : B — La DMZ isole le périmètre exposé afin de protéger le réseau d'entreprise interne.*

**Q6 : Quel état `conntrack` de Netfilter correspond à un paquet qui initialise une toute nouvelle tentative de connexion ?**
- A) `ESTABLISHED`
- B) `NEW`
- C) `RELATED`
- D) `INVALID`

*Réponse : B — L'état `NEW` désigne le tout premier paquet d'une tentative de connexion.*

**Q7 : Dans quel fichier de log principal Suricata enregistre-t-il l'intégralité de ses événements et alertes au format JSON structuré ?**
- A) `/var/log/auth.log`
- B) `/var/log/suricata/eve.json`
- C) `/etc/ufw/ufw.conf`
- D) `/tmp/suricata.log`

*Réponse : B — Le fichier `eve.json` est le journal d'événements et d'alertes principal produit par Suricata.*

**Q8 : Quelle action iptables permet de réécrire l'adresse IP source des paquets sortants du tunnel VPN vers Internet (NAT Masquerade) ?**
- A) `iptables -A INPUT -j DROP`
- B) `iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE`
- C) `iptables -F`
- D) `iptables -L`

*Réponse : B — La règle `MASQUERADE` en `POSTROUTING` effectue la traduction d'adresses pour les paquets sortants vers Internet.*

---

## 📚 Ressources & Références

- **Netfilter & iptables Official Documentation** : https://netfilter.org/
- **UFW Documentation (Ubuntu Community)** : https://help.ubuntu.com/community/UFW
- **WireGuard Official Protocol Paper** : https://www.wireguard.com/papers/wireguard.pdf
- **Suricata User Guide** : https://suricata.readthedocs.io/

---

*Semestre 1 — Socle Système Linux & Administration PARADIS IT Masterclass*
