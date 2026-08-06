# SEMESTRE 1 — Jour 15 (6h) : Diagnostic Réseau & Capture de Trafic (Wireshark/Tshark)

> [!NOTE]
> **Objectif de la journée** : Être capable de diagnostiquer les pannes réseau locales ou distantes, vérifier les ports ouverts, et analyser le trafic réseau au niveau des paquets avec des outils de capture.
> **Compétences visées** : `BIT-04` (Niveau Cible: A), `SEC-04` (Niveau Cible: A) — Diagnostic et capture de paquets.

---

## 1) Tests de connectivité : Ping, Traceroute & MTR (1h30)

### 📖 1.1 Narration & Intuition
Lorsque le réseau ne fonctionne pas, il ne faut pas agir à l'aveugle. Il faut procéder de manière méthodique, comme un électricien teste un circuit point par point. Le `ping` est le testeur de tension basique : "Est-ce qu'il y a du courant au bout du fil ?". Le `traceroute` cartographie tous les nœuds de croisement entre vous et la cible pour identifier exactement *où* le fil est coupé.

### 🔍 1.2 Anatomie Technique
- **`ping`** : Utilise le protocole ICMP (Internet Control Message Protocol) en envoyant des requêtes "Echo Request" et en attendant des "Echo Reply". Il mesure le délai d'aller-retour (RTT).
- **`traceroute`** : Envoie des paquets avec un champ TTL (Time To Live) incrémenté. Au niveau 1, le premier routeur renvoie une erreur (Time Exceeded). Au niveau 2, le second routeur, etc.
- **`mtr`** (My Traceroute) : Combine la fonction du ping en temps réel avec traceroute pour afficher des statistiques de perte de paquets sur chaque saut.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Vérifier si l'on a accès à Internet, avec 4 paquets envoyés seulement
ping -c 4 8.8.8.8

# Découvrir le chemin emprunté pour atteindre le serveur de Google
traceroute google.com

# Outil MTR : dynamique et très puissant pour détecter un routeur instable
# (appuyez sur 'q' pour quitter)
mtr 8.8.8.8
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
**Problème** : "Je ne peux pas pinger le serveur, donc il est éteint !"
**Diagnostic** : Faux. Beaucoup d'entreprises et de serveurs modernes bloquent le protocole ICMP (les paquets de ping) pour des raisons de sécurité, mais laissent le port HTTPS ouvert.
**Solution** : Si le ping échoue, testez toujours l'accès aux ports applicatifs avec des outils comme `nc` ou `telnet`.

---

## 2) Analyse de ports et Sockets (1h30)

### 📖 2.1 Narration & Intuition
Si l'adresse IP est l'adresse de l'immeuble, les ports (1 à 65535) sont les numéros des appartements. Un service (comme un serveur Web) "écoute" derrière la porte d'un appartement spécifique (le port 80 ou 443). L'administrateur doit vérifier de l'extérieur si la porte est ouverte (`nmap`, `nc`), ou de l'intérieur de l'immeuble qui écoute exactement à quelle porte (`ss`).

### 🔍 2.2 Anatomie Technique
- **`ss` (Socket Statistics)** : Remplace l'ancien `netstat`. Affiche les ports ouverts sur la machine locale et les processus qui les utilisent.
- **`nc` (Netcat)** : Surnommé le couteau suisse du réseau. Permet de lire et écrire des données sur le réseau, vérifier si un port distant est ouvert.
- **`nmap`** : Scanner de réseau professionnel pour balayer des plages d'IP et découvrir quels ports sont ouverts.

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# Lister les ports en écoute sur la machine locale (-t TCP, -u UDP, -l écoute, -n numérique, -p processus)
sudo ss -tulnp

# Tester si le port 443 (HTTPS) est ouvert sur google.com avec netcat (-z sans envoyer de données, -v verbeux)
nc -zv google.com 443

# Scanner rapidement les ports les plus courants sur son réseau local
nmap -F 192.168.1.0/24
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
**Problème** : "Mon serveur Web ne démarre pas, il affiche 'Address already in use'."
**Diagnostic** : Un processus utilise déjà le port 80.
**Solution** : Utilisez `sudo ss -tulnp | grep :80`. Cela affichera le PID du programme coupable (peut-être un ancien serveur Apache resté actif en arrière-plan). Vous pouvez ensuite le tuer avec `sudo kill <PID>`.

---

## 3) Capture de trafic : Tcpdump et Tshark (2h00)

### 📖 3.1 Narration & Intuition
Pour un administrateur réseau, regarder les clignotements des lumières sur un switch ne suffit pas. Parfois, il faut ouvrir l'enveloppe des messages circulant sur le réseau et lire le contenu. C'est ce que font les "sniffers" de paquets. Imaginez pouvoir lire chaque lettre transitant par un bureau de poste pour savoir exactement ce qui est échangé.

### 🔍 3.2 Anatomie Technique
L'interface réseau est normalement configurée pour ignorer les paquets qui ne lui sont pas destinés. Les outils de capture placent l'interface en mode "Promiscuous" (promiscuité) pour écouter tout le trafic environnant.
- **`tcpdump`** : L'outil classique en ligne de commande, très léger, présent sur quasiment tous les serveurs Linux.
- **`tshark`** : La version ligne de commande de Wireshark. Il comprend la syntaxe complexe de Wireshark pour filtrer les protocoles de haut niveau (HTTP, DNS).

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Écouter sur l'interface eth0 et n'afficher que les paquets ICMP (ping)
sudo tcpdump -i eth0 icmp -n

# Capturer le trafic réseau HTTP vers un fichier pour analyse ultérieure
sudo tcpdump -i eth0 port 80 -w capture_web.pcap

# Utiliser tshark pour lire le fichier pcap et extraire des infos précises (exemple: requêtes DNS)
tshark -r capture_web.pcap -Y "dns"
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
**Problème** : "Les captures de paquets génèrent des fichiers de plusieurs Go en quelques minutes."
**Diagnostic** : Capturer tout le trafic d'une interface de production est extrêmement gourmand en ressources et en disque.
**Solution** : Utilisez toujours des filtres stricts lors de la capture. Par exemple, capturez uniquement le trafic entre votre serveur et l'IP du client problématique : `sudo tcpdump -i eth0 host 10.0.0.5`.

---

## 📚 Nouvelles abréviations rencontrées
- **ICMP** : Internet Control Message Protocol
- **TTL** : Time To Live
- **RTT** : Round Trip Time
- **PCAP** : Packet Capture

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Diagnostic croisé
- **Consigne** : Vérifiez si votre passerelle locale répond aux pings. Ensuite, utilisez `ss` pour identifier quel processus écoute sur le port 22 (SSH). Enfin, lancez une capture avec tcpdump pour capturer 10 requêtes DNS (port 53) sur l'interface active.
- **Livrables à produire** : Le fichier `.pcap` généré, et la commande ss utilisée.
- **Corrigé détaillé & Guidé** :
```bash
# Ping de la passerelle
ip route | grep default # (pour trouver l'IP)
ping -c 4 <IP_TROUVEE>

# Identification du processus SSH
sudo ss -tulnp | grep :22

# Capture de 10 paquets DNS (port 53)
sudo tcpdump -i eth0 port 53 -c 10 -w dns_capture.pcap
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Que fait un ping lorsqu'il atteint son objectif ?**
   A) Il installe un agent de diagnostic
   B) Il attend un message ICMP "Echo Reply"
   C) Il lance un traceroute automatiquement
   D) Il ouvre le port 80
   *Réponse : B*

2. **Quelle est la commande la plus précise et moderne pour lister les ports en écoute sur Linux ?**
   A) ifconfig
   B) route
   C) netcat
   D) ss -tulnp
   *Réponse : D*

3. **Quelle option de netcat (nc) permet de tester un port sans envoyer de données et de quitter immédiatement ?**
   A) -p
   B) -l
   C) -z
   D) -k
   *Réponse : C*

4. **Pourquoi un ping peut-il échouer alors qu'un site web (HTTP) sur le même serveur fonctionne très bien ?**
   A) Parce que le ping utilise TCP
   B) Parce que l'administrateur a bloqué le protocole ICMP dans son pare-feu
   C) Parce que le câble Ethernet est mal branché
   D) Parce que le serveur web remplace le protocole réseau
   *Réponse : B*

5. **À quoi sert le paramètre `-w fichier.pcap` dans tcpdump ?**
   A) À filtrer la capture par adresse web
   B) À écrire les paquets bruts capturés dans un fichier pour une analyse ultérieure
   C) À réduire le délai de timeout à quelques secondes
   D) À lancer Wireshark graphiquement
   *Réponse : B*
