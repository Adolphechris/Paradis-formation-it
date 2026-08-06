# SEMESTRE 1 — Jour 14 (6h) : Routage IP & Pare-feu Linux (UFW/IPTables)

> [!NOTE]
> **Objectif de la journée** : Comprendre le cheminement des paquets sur un réseau, configurer les tables de routage sous Linux, et protéger les communications à l'aide d'un pare-feu (UFW/IPTables).
> **Compétences visées** : `BIT-04` (Niveau Cible: A), `POL-02` (Niveau Cible: A), `SEC-04` (Niveau Cible: A) — Routage et Pare-feu réseau.

---

## 1) Routage IP : Le GPS du Réseau (1h30)

### 📖 1.1 Narration & Intuition
Imaginez Internet comme un vaste réseau autoroutier. Votre ordinateur est une voiture, et les paquets de données sont les passagers. Pour aller d'une ville (réseau local) à une autre, il faut des panneaux indicateurs : ce sont les tables de routage. Si une destination est inconnue, on suit le panneau "Toutes directions" : c'est la passerelle par défaut (default gateway).

### 🔍 1.2 Anatomie Technique
Sous Linux, la commande moderne pour gérer le réseau est `ip` (du paquet `iproute2`), qui remplace les anciennes commandes `ifconfig` et `route`. 
La table de routage contient des règles précisant par quelle interface réseau (`eth0`, `wlan0`) envoyer les données pour atteindre une plage d'adresses IP spécifique.
- `ip route show` : Affiche la table de routage actuelle.
- `default via 192.168.1.254` : Définit le routeur qui permet de sortir vers Internet.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Afficher les adresses IP des interfaces
ip a

# Afficher la table de routage actuelle
ip route show

# Ajouter une route statique vers le réseau 10.0.0.0/24 via la passerelle 192.168.1.100
sudo ip route add 10.0.0.0/24 via 192.168.1.100 dev eth0

# Supprimer la route que l'on vient de créer
sudo ip route del 10.0.0.0/24

# Vérifier quelle route sera utilisée pour atteindre l'adresse 8.8.8.8
ip route get 8.8.8.8
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
**Problème** : "Je ne peux pas accéder à Internet, mais je ping les machines locales."
**Diagnostic** : Vérifiez la présence de la passerelle par défaut avec `ip route`. Si la ligne commençant par `default via ...` est absente, votre système ne sait pas comment sortir du réseau local.
**Solution** : `sudo ip route add default via <IP_ROUTEUR>`.

---

## 2) Pare-feu UFW : Le Videur du Système (1h30)

### 📖 2.1 Narration & Intuition
Si un serveur est une boîte de nuit, le pare-feu est le videur à l'entrée. Il applique une liste d'invités stricte (les règles). UFW (Uncomplicated Firewall) est un outil sous Ubuntu/Debian conçu pour rendre la configuration d'IPTables (le moteur interne de Linux) aussi simple que de dire au videur : "Laisse entrer le port 22, refuse le reste."

### 🔍 2.2 Anatomie Technique
Un pare-feu moderne est "Stateful" (à état) : il se souvient des connexions établies. Si vous demandez une page web au port 80 d'un serveur distant, le pare-feu laissera entrer la réponse automatiquement. Les pare-feux "Stateless", plus anciens, regardent chaque paquet indépendamment.
- `ufw allow 22/tcp` : Autorise le trafic entrant sur le port 22 en TCP.
- `ufw deny 80` : Bloque le port 80.
- `ufw status numbered` : Affiche l'ordre des règles. Le pare-feu lit les règles de haut en bas et s'arrête à la première correspondance.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Vérifier l'état d'UFW (souvent inactif par défaut)
sudo ufw status

# Définir les politiques par défaut : bloquer tout ce qui entre, autoriser tout ce qui sort
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Autoriser les connexions SSH (vital pour ne pas se bloquer à l'extérieur !)
sudo ufw allow ssh

# Activer le pare-feu
sudo ufw enable

# Ajouter une règle pour autoriser le trafic HTTP (port 80) depuis une IP spécifique
sudo ufw allow from 192.168.1.50 to any port 80

# Voir les règles avec leurs numéros
sudo ufw status numbered

# Supprimer la règle numéro 2
sudo ufw delete 2
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
**Problème** : "Je viens d'activer UFW sur mon VPS distant et ma connexion a été coupée !"
**Diagnostic** : La politique par défaut d'UFW bloque le trafic entrant. Si le port SSH (22) n'a pas été explicitement autorisé avant l'activation, la connexion est coupée.
**Solution** : Ne *jamais* lancer `ufw enable` sans avoir fait un `ufw allow ssh` avant. (Si c'est trop tard, il faut se connecter via la console d'urgence du fournisseur cloud).

---

## 3) NAT/PAT et introduction à IPTables (2h00)

### 📖 3.1 Narration & Intuition
Le NAT (Network Address Translation) est le traducteur universel d'Internet. Votre box internet à la maison n'a qu'une seule adresse IP publique (visible sur Internet). Pourtant, vous avez 10 appareils chez vous (adresses privées). Le NAT traduit les adresses privées en adresse publique à la volée. Le PAT (Port Address Translation) y ajoute les numéros de port pour savoir à quel appareil précis renvoyer les paquets de retour.

### 🔍 3.2 Anatomie Technique
UFW est une interface simplifiée pour IPTables/nftables. IPTables utilise des "tables" et des "chaines". 
Pour le NAT, on utilise la table `nat` et les chaînes `PREROUTING` (pour rediriger les ports entrants) et `POSTROUTING` (pour masquer l'adresse source, technique appelée Masquerading).
La commande `sysctl` permet d'activer le transfert de paquets dans le noyau, transformant un simple PC Linux en véritable routeur.

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Activer le routage IP à la volée dans le noyau (IPv4 forwarding)
sudo sysctl -w net.ipv4.ip_forward=1

# Rendre cette modification persistante au redémarrage
# sudo nano /etc/sysctl.conf (Décommenter la ligne net.ipv4.ip_forward=1)

# Voir les règles IPTables existantes (générées par UFW)
sudo iptables -L -v -n

# (Exemple didactique) Ajouter une règle IPTables pour le Masquerading sur eth0
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

# Afficher la table NAT
sudo iptables -t nat -L -v -n
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
**Problème** : "J'ai configuré mon serveur Linux pour faire routeur, mais les PC locaux n'ont pas Internet."
**Diagnostic** : Il manque deux choses très souvent : soit `ip_forward` n'est pas activé à 1 dans sysctl, soit la règle IPTables de masquerading n'est pas appliquée sur l'interface de sortie.
**Solution** : Vérifiez `sysctl net.ipv4.ip_forward` et appliquez un tcpdump pour voir où le paquet bloque.

---

## 📚 Nouvelles abréviations rencontrées
- **NAT** : Network Address Translation
- **PAT** : Port Address Translation
- **UFW** : Uncomplicated Firewall
- **TCP** : Transmission Control Protocol

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Sécurisation d'un serveur Web
- **Consigne** : Sur votre VM Linux, configurez UFW pour qu'il soit activé au démarrage. Il doit bloquer tout trafic entrant par défaut, autoriser le trafic sortant, autoriser l'accès SSH depuis n'importe où, et autoriser l'accès HTTPS (port 443) uniquement depuis le réseau local `192.168.1.0/24`.
- **Livrables à produire** : Capture d'écran du résultat de `sudo ufw status verbose`.
- **Corrigé détaillé & Guidé** :
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow from 192.168.1.0/24 to any port 443
sudo ufw enable
sudo ufw status verbose
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Que permet de faire la commande `ip route get 8.8.8.8` ?**
   A) Ajouter une route vers 8.8.8.8
   B) Vérifier quelle route le noyau va utiliser pour atteindre 8.8.8.8
   C) Pinger le serveur DNS de Google
   D) Bloquer l'adresse 8.8.8.8
   *Réponse : B*

2. **Quelle est la politique de sécurité recommandée par défaut pour un pare-feu réseau ?**
   A) Autoriser tout en entrée et en sortie
   B) Bloquer tout ce qui sort et autoriser ce qui entre
   C) Bloquer tout ce qui entre et autoriser ce qui sort
   D) Bloquer tout, même le trafic local
   *Réponse : C*

3. **Quelle différence majeure y a-t-il entre un pare-feu "Stateful" et "Stateless" ?**
   A) Le Stateful conserve l'état des connexions, permettant d'autoriser automatiquement le trafic de retour.
   B) Le Stateless est beaucoup plus lent.
   C) Le Stateful ne gère que le TCP, le Stateless gère l'UDP.
   D) Le Stateful est uniquement logiciel, le Stateless matériel.
   *Réponse : A*

4. **Si l'on exécute `sudo ufw enable` via SSH sans avoir créé de règle au préalable, que risque-t-il de se passer ?**
   A) Rien, UFW détecte le SSH automatiquement.
   B) La connexion SSH va se figer, vous bloquant hors de la machine.
   C) Le serveur redémarre instantanément.
   D) UFW va demander une confirmation spéciale.
   *Réponse : B*

5. **À quoi sert le NAT ?**
   A) À chiffrer les données sur le réseau local.
   B) À empêcher les requêtes de ping.
   C) À traduire des adresses privées en une adresse publique pour accéder à Internet.
   D) À accélérer le routage des paquets en interne.
   *Réponse : C*
