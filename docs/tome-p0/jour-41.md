# SEMESTRE 1 — Jour 41 (6h) : Sécurité Réseau & Firewalls

> [!NOTE]
> **Objectif de la journée** : Maîtriser les principes du filtrage de paquets, la segmentation réseau et la mise en place de tunnels sécurisés pour protéger une infrastructure.
> **Compétences visées** : `SEC-04` (Niveau Cible: A) — Architecture Sécurisée et Firewalls.

---

## 1) Filtrage de paquets avec UFW et iptables (1h30)

### 📖 1.1 Narration & Intuition
Imaginez votre réseau comme un château fort. Les firewalls (pare-feu) sont les gardes aux portes. Ils inspectent chaque personne (paquet) voulant entrer ou sortir et décident, selon une liste de règles strictes, de les laisser passer ou de les bloquer.

### 🔍 1.2 Anatomie Technique
Sous Linux, le noyau possède un module appelé Netfilter. `iptables` (et son successeur `nftables`) est l'outil pour configurer Netfilter. `UFW` (Uncomplicated Firewall) est une surcouche simplifiée pour `iptables`, idéale pour des configurations rapides.
Une règle est composée : d'une direction (IN/OUT), d'un protocole (TCP/UDP), d'un port (ex: 22, 80) et d'une action (ACCEPT/DROP).

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Activation et configuration de base de UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
Si un service refuse de répondre, le premier réflexe est de vérifier si le port est ouvert côté firewall. Utilisez `sudo ufw status` ou vérifiez les logs réseau : `tail -f /var/log/syslog | grep UFW`.

---

## 2) Réseaux Privés Virtuels : OpenVPN & WireGuard (1h30)

### 📖 2.1 Narration & Intuition
Vous devez transférer de l'or (données sensibles) entre deux châteaux via des routes dangereuses (Internet). Le VPN construit un tunnel blindé et souterrain de point en point. Personne à la surface ne peut voir ce qui transite.

### 🔍 2.2 Anatomie Technique
WireGuard est un protocole VPN moderne fonctionnant au niveau du noyau, le rendant extrêmement rapide et cryptographiquement sûr par défaut, basé sur des clés publiques/privées. OpenVPN est l'ancien standard, plus complexe mais très flexible.

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# Génération de clés pour WireGuard
wg genkey | tee privatekey | wg pubkey > publickey

# Configuration basique (interface wg0)
# (Fichier de config /etc/wireguard/wg0.conf)
echo "[Interface]
PrivateKey = $(cat privatekey)
ListenPort = 51820
Address = 10.0.0.1/24" | sudo tee /etc/wireguard/wg0.conf

# Démarrage de l'interface
sudo wg-quick up wg0
sudo wg show
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
Une erreur courante en VPN est l'oubli du routage et du NAT. Assurez-vous d'activer l'IP forwarding sur le serveur : `sysctl -w net.ipv4.ip_forward=1`.

---

## 3) Segmentation (VLAN, DMZ) et IDS/IPS (2h00)

### 📖 3.1 Narration & Intuition
Ne mettez pas tous vos œufs dans le même panier. Si un pirate s'infiltre dans votre serveur web, vous ne voulez pas qu'il accède à la base de données RH. La segmentation découpe le réseau en zones (VLAN/DMZ). L'IDS (Intrusion Detection System) est la caméra de surveillance qui hurle si elle voit un comportement suspect.

### 🔍 3.2 Anatomie Technique
Un VLAN (Virtual LAN) sépare logiquement des réseaux sur le même équipement physique (Switch). La DMZ (Zone Démilitarisée) est un sous-réseau exposé hébergeant les services publics. Suricata ou Snort analysent en temps réel les paquets avec des signatures pour détecter les attaques (DDoS, SQLi).

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Installation de Suricata (Ubuntu/Debian)
sudo apt update && sudo apt install suricata -y

# Mise à jour des règles de détection
sudo suricata-update

# Démarrage sur une interface spécifique
sudo systemctl enable suricata
sudo systemctl restart suricata
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
Trop d'alertes tuent l'alerte (Faux positifs). Pensez à ajuster le fichier de configuration de l'IDS (`/etc/suricata/suricata.yaml`) pour ignorer le trafic légitime connu.

---

## Nouvelles abréviations rencontrées
- **UFW** : Uncomplicated Firewall
- **VPN** : Virtual Private Network
- **VLAN** : Virtual Local Area Network
- **DMZ** : Demilitarized Zone
- **IDS/IPS** : Intrusion Detection/Prevention System

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Sécurisation Périmétrique
- **Consigne** : Configurez UFW sur votre machine pour n'autoriser que SSH et le ping, et bloquez tout le reste en entrée.
- **Livrables à produire** : Capture d'écran de `sudo ufw status verbose`.
- **Corrigé détaillé & Guidé** :
  ```bash
  sudo ufw reset
  sudo ufw default deny incoming
  sudo ufw default allow outgoing
  sudo ufw allow ssh
  # UFW autorise le ping (ICMP) par défaut dans before.rules
  sudo ufw enable
  sudo ufw status verbose
  ```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: Quel est le rôle principal d'un pare-feu (firewall) ? A) Accélérer le réseau B) Bloquer ou autoriser les paquets selon des règles C) Stocker des données D) Héberger des sites web. *Réponse: B*
2. QCM: Quelle commande active UFW ? A) `ufw on` B) `ufw start` C) `sudo ufw enable` D) `systemctl ufw run`. *Réponse: C*
3. QCM: Que signifie DMZ en sécurité réseau ? A) Direct Media Zone B) Data Memory Zero C) Demilitarized Zone D) Domain Managed Zone. *Réponse: C*
4. QCM: Sur quoi repose la sécurité de WireGuard ? A) Des mots de passe simples B) Des paires de clés publiques/privées C) Un serveur central Microsoft D) Le protocole HTTP. *Réponse: B*
5. QCM: Quelle est la différence entre un IDS et un IPS ? A) L'IPS ne fait que logger, l'IDS bloque B) L'IDS détecte, l'IPS prévient (bloque) C) L'IDS est matériel, l'IPS est logiciel D) Aucune différence. *Réponse: B*

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
