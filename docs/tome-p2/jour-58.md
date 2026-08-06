# SEMESTRE 2 — Jour 58 (6h) : Filtrage Réseau Avancé & Pare-feu Linux (nftables)

> [!NOTE]
> **Objectif de la journée** : Comprendre le filtrage au niveau kernel sous Linux, migrer d'iptables vers la syntaxe moderne de nftables, et maîtriser le concept de pare-feu stateful et de NAT (SNAT/DNAT).
> **Compétences visées** : `SEC-04` (A) — Implémenter et gérer les systèmes de pare-feu et VPN, `BIT-04` (A) — Administrer les services réseaux de base.

---

## 1) Introduction au filtrage Linux : Migration iptables vers nftables (1h30)

### 📖 1.1 Narration & Intuition
Pendant 20 ans, `iptables` a régné en maître absolu sur les serveurs Linux pour bloquer, autoriser ou rediriger le trafic. Mais son architecture est devenue lente et complexe pour les réseaux modernes. Le noyau Linux utilise désormais `nftables`. Voyez `iptables` comme un vieux poste de douane manuel surchargé, et `nftables` comme un système automatisé de douane électronique hautement optimisé (basé sur la technologie BPF) qui regroupe IPv4, IPv6 et l'ARP sous un seul outil.

### 🔍 1.2 Anatomie Technique
- **Netfilter** : C'est le moteur, situé au cœur du noyau Linux (kernel).
- **nftables** : C'est le nouveau framework d'interfaçage avec Netfilter (remplace iptables, ip6tables, arptables, ebtables).
- L'architecture logique est : **Tables** > **Chaînes** > **Règles**.
- Contrairement à `iptables` qui fournissait des tables/chaînes par défaut (filter/INPUT), `nftables` démarre complètement vide. Vous créez l'architecture que vous voulez.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Vérifier la présence de nftables
sudo apt update && sudo apt install nftables -y

# Afficher l'état actuel (vide par défaut)
sudo nft list ruleset

# Vider complètement le pare-feu
sudo nft flush ruleset

# Activer le service au démarrage pour persister les règles (dans /etc/nftables.conf)
sudo systemctl enable nftables
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Problème** : On s'enferme dehors après avoir appliqué une règle (perte SSH).
- **Réflexe** : Toujours utiliser `nft list ruleset` avant. En phase de test, on peut lancer un script de fallback via un crontab (ex: `*/5 * * * * nft flush ruleset`) qui effacera vos erreurs toutes les 5 minutes si vous êtes déconnecté.

---

## 2) Chaînes, Règles et Filtrage Stateful (1h30)

### 📖 2.1 Narration & Intuition
Un pare-feu "stateless" regarde chaque paquet individuellement, sans mémoire. Il est bête. Un pare-feu "stateful" (à état) a de la mémoire (le module *conntrack*). Si vous (à l'intérieur) ouvrez une porte pour sortir sur Internet, le pare-feu *stateful* se souvient de vous et autorise la réponse à entrer par la même porte, sans que vous ayez à écrire une règle pour le trafic retour.

### 🔍 2.2 Anatomie Technique
Nous allons créer une table `inet filter` (qui gère à la fois IPv4 et IPv6).
Dedans, nous créons 3 chaînes standard (hooks) :
- **input** : Trafic à destination de la machine elle-même.
- **forward** : Trafic qui traverse la machine (si elle agit comme routeur).
- **output** : Trafic généré par la machine elle-même.
Pour le *stateful*, nous utilisons l'instruction `ct state` (Connection Tracking).

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# 1. Créer la table
sudo nft add table inet filter

# 2. Créer la chaîne input (qui par défaut bloque tout - policy drop)
sudo nft add chain inet filter input { type filter hook input priority 0 \; policy drop \; }

# 3. Règle stateful : accepter le trafic lié à des connexions établies
sudo nft add rule inet filter input ct state established,related accept

# 4. Accepter le trafic loopback (localhost)
sudo nft add rule inet filter input iif lo accept

# 5. Autoriser l'accès SSH depuis l'extérieur (Port 22 TCP)
sudo nft add rule inet filter input tcp dport 22 accept

# Afficher le résultat
sudo nft list ruleset
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Message d'erreur** : `Error: syntax error, unexpected string` lors de l'ajout d'une chaîne bash.
- **Cause** : Les caractères spéciaux `{` et `;` dans le shell Bash posent problème. Il faut soit les échapper avec `\`, soit mettre la commande entre apostrophes : `nft 'add chain...'`.

---

## 3) Traduction d'Adresses (NAT) avec nftables (2h00)

### 📖 3.1 Narration & Intuition
L'IP v4 est épuisée. Le NAT (Network Address Translation) permet de cacher tout un réseau d'entreprise (IP privées 192.168.x.x) derrière une seule IP publique sur Internet. C'est le **SNAT (Source NAT / Masquerade)**. À l'inverse, si vous avez un serveur Web interne privé et que vous voulez le rendre accessible depuis Internet, il faut rediriger le port extérieur vers l'IP interne. C'est le **DNAT (Destination NAT / Port Forwarding)**.

### 🔍 3.2 Anatomie Technique
Dans `nftables`, le NAT nécessite une table séparée, souvent appelée `ip nat`.
- **Hook prerouting** : Avant le routage, utilisé pour le **DNAT** (trafic entrant depuis Internet vers l'interne).
- **Hook postrouting** : Après le routage, utilisé pour le **SNAT** (trafic sortant vers Internet).
*N'oubliez pas d'activer le routage (IP forwarding) dans le noyau Linux !*

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# 0. Activer l'IP forwarding au niveau kernel
sudo sysctl -w net.ipv4.ip_forward=1

# 1. Créer la table NAT
sudo nft add table ip nat

# 2. Créer les chaînes prerouting et postrouting
sudo nft add chain ip nat prerouting { type nat hook prerouting priority -100 \; }
sudo nft add chain ip nat postrouting { type nat hook postrouting priority 100 \; }

# 3. Mettre en place le masquerade (SNAT dynamique) sur l'interface publique eth0
sudo nft add rule ip nat postrouting oifname "eth0" masquerade

# 4. Mettre en place un DNAT : Tout ce qui arrive sur le port 80 public est renvoyé vers l'IP privée 192.168.10.50
sudo nft add rule ip nat prerouting iifname "eth0" tcp dport 80 dnat to 192.168.10.50:80
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Problème** : Le DNAT ne fonctionne pas.
- **Cause 1** : `net.ipv4.ip_forward` n'est pas à 1.
- **Cause 2** : Il manque la règle dans la chaîne `forward` de la table `filter` pour autoriser le trafic de traverser ! (Le NAT modifie l'IP, le Filter autorise le passage).

---

## 📚 Nouvelles abréviations rencontrées
- **NAT** : Network Address Translation
- **SNAT** : Source NAT
- **DNAT** : Destination NAT
- **BPF** : Berkeley Packet Filter
- **Conntrack** : Connection Tracking

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Pare-feu Scripté
- **Consigne** : Écrivez un fichier script nftables (ex: `firewall.nft`) qui nettoie les règles, configure une politique par défaut fermée sur INPUT, et autorise uniquement le ping (ICMP) et le HTTP/HTTPS.
- **Livrables à produire** : Fichier `firewall.nft`.
- **Corrigé détaillé & Guidé** :
```bash
#!/usr/sbin/nft -f
flush ruleset
table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;
        ct state established,related accept
        iif lo accept
        ip protocol icmp accept
        tcp dport { 80, 443 } accept
    }
}
# Lancer avec : sudo nft -f firewall.nft
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Quel framework remplace iptables dans les noyaux Linux récents ?**
   A) firewalld
   B) ufw
   C) nftables
   D) netstat
   **Réponse : C**

2. **Que permet la directive `ct state established,related accept` ?**
   A) Autoriser les pings
   B) Autoriser le trafic de retour pour les connexions déjà initiées
   C) Partager la connexion Internet (NAT)
   D) Bloquer les attaques DDoS
   **Réponse : B**

3. **Quelle chaîne est utilisée pour intercepter le trafic destiné au pare-feu lui-même ?**
   A) input
   B) forward
   C) prerouting
   D) output
   **Réponse : A**

4. **Quelle condition système est indispensable pour que le NAT et le routage fonctionnent sous Linux ?**
   A) systemctl enable iptables
   B) net.ipv4.ip_forward=1
   C) apt install router-daemon
   D) chmod 777 /etc/network/interfaces
   **Réponse : B**

5. **L'action `masquerade` dans nftables est principalement associée à quel type de hook ?**
   A) input
   B) prerouting
   C) postrouting
   D) forward
   **Réponse : C**

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
