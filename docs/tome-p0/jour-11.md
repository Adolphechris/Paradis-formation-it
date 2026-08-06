# SEMESTRE 1 — Jour 11 (6h) : Réseaux TCP/IP & Modèle OSI (Couches 1 à 4)

> [!NOTE]
> **Objectif de la journée** : Comprendre le voyage d'une donnée depuis une application jusqu'au câble réseau, en maîtrisant les couches OSI 1 à 4, l'encapsulation, les adresses MAC/IP et les ports.
> **Compétences visées** : `BIT-04` (Niveau Cible: A) — Réseaux TCP/IP & Modèle OSI.

---

## 1) Les Fondations : Modèle OSI, Couches 1 & 2 (1h30)

### 📖 1.1 Narration & Intuition
Imaginez envoyer un colis postal. Le colis a besoin d'une boîte, d'une étiquette avec le nom du destinataire, puis doit être mis dans un camion. En informatique, le Modèle OSI (Open Systems Interconnection) est cette usine d'emballage. La couche 1 (Physique) est la route et le camion (câbles, ondes). La couche 2 (Liaison de données) s'assure que le colis passe d'un relais à un autre sur le réseau local en utilisant des adresses matérielles, comme des plaques d'immatriculation.

### 🔍 1.2 Anatomie Technique
- **Couche 1 (Physique)** : Câbles RJ45, signaux électriques, optiques, Wi-Fi. Unité : le **bit**.
- **Couche 2 (Liaison)** : Trames Ethernet. Elle utilise l'**adresse MAC** (Media Access Control), une adresse unique sur 48 bits (ex: `00:1A:2B:3C:4D:5E`) gravée dans la carte réseau (NIC).
- **Encapsulation** : À chaque couche, la donnée reçoit un "en-tête" (header). À la couche 2, la donnée IP est encapsulée dans une **Trame Ethernet**.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Afficher l'adresse MAC de vos interfaces réseau sous Linux
ip link show

# Analyser le trafic de couche 2 (nécessite tcpdump)
sudo tcpdump -e -n -i eth0 -c 5
# "-e" affiche l'en-tête Ethernet (adresses MAC source et destination)
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Panne fréquente** : Câble débranché ou carte réseau désactivée (Couche 1).
- **Réflexe** : Vérifiez l'état de l'interface avec `ip link`. Si l'état (state) est `DOWN`, la couche 1 ou 2 est en panne.
- **Commande** : `sudo ip link set eth0 up`.

---

## 2) La Couche 3 (Réseau) et les Paquets IP (1h30)

### 📖 2.1 Narration & Intuition
L'adresse MAC, c'est comme le numéro de série d'une voiture : ça ne dit pas où elle habite. Pour trouver quelqu'un sur Internet, il faut une adresse logique et hiérarchique, comme un code postal. C'est le rôle de l'adresse IP (Internet Protocol) et de la Couche 3. Elle gère le "Routage", c'est-à-dire le GPS d'Internet.

### 🔍 2.2 Anatomie Technique
- **Couche 3 (Réseau)** : Gère le cheminement des données d'un bout à l'autre d'Internet.
- **Unité** : Le **Paquet**.
- Le protocole IP (IPv4 ou IPv6) ajoute un en-tête contenant l'**IP source** et l'**IP destination**.
- Les **Routeurs** opèrent à cette couche pour transférer les paquets de réseau en réseau.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Afficher ses adresses IP
ip addr show

# Afficher la table de routage (le "GPS" de l'ordinateur)
ip route show

# Tracer la route vers un serveur (montre chaque routeur traversé)
traceroute 8.8.8.8
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Erreur** : "Network is unreachable".
- **Cause** : Votre ordinateur n'a pas de route vers la destination (souvent pas de passerelle par défaut / default gateway).
- **Réflexe** : Vérifier `ip route` pour voir si `default via` est présent.

---

## 3) La Couche 4 (Transport), TCP/UDP, Ports et Sockets (2h00)

### 📖 3.1 Narration & Intuition
Le colis est arrivé à la bonne adresse IP (le bon immeuble). Mais dans cet immeuble, il y a plusieurs appartements (applications). Comment savoir s'il faut livrer le colis au serveur Web ou au serveur Email ? C'est le rôle des **Ports** (les numéros d'appartement) et de la Couche 4.
De plus, la couche 4 choisit le mode d'envoi : TCP (accusé de réception, fiable comme un recommandé) ou UDP (rapide mais sans garantie, comme une carte postale).

### 🔍 3.2 Anatomie Technique
- **TCP (Transmission Control Protocol)** : Orienté connexion (Three-way handshake: SYN, SYN-ACK, ACK). Fiable, utilisé pour le Web (HTTP), SSH, Bases de données.
- **UDP (User Datagram Protocol)** : Sans connexion. Rapide, utilisé pour le DNS, le streaming, les jeux.
- **Unité** : Le **Segment** (TCP) ou **Datagramme** (UDP).
- **Port** : Nombre de 1 à 65535. 
  - Ports connus : 22 (SSH), 53 (DNS), 80 (HTTP), 443 (HTTPS), 5432 (PostgreSQL).
- **Socket** : La combinaison `Adresse IP + Port` (ex: `192.168.1.10:80`).

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Lister les ports en écoute sur votre machine (sockets ouvertes)
sudo ss -tuln
# -t (TCP), -u (UDP), -l (Listening), -n (Numeric, évite la résolution DNS)

# Tester si un port spécifique est ouvert sur un serveur distant (ex: google.com port 443)
nc -vz google.com 443
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Erreur** : "Connection refused".
- **Cause** : La machine répond, mais aucune application n'écoute sur le port demandé (le port est "fermé").
- **Réflexe** : Se connecter à la machine cible et vérifier avec `ss -tuln` si le service tourne bien sur ce port.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Inspection des sockets locales
- **Consigne** : Identifiez quels services écoutent sur les ports de votre machine.
- **Livrables à produire** : Une capture d'écran de la commande affichant les ports TCP en écoute.
- **Corrigé détaillé & Guidé** :
```bash
# 1. Ouvrir le terminal.
# 2. Exécuter la commande pour voir les ports TCP en écoute :
sudo ss -tlnp
# L'option -p affichera en plus le nom du processus (nécessite sudo).
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **À quelle couche du modèle OSI correspond le routage des paquets IP ?**
   A) Couche 1  B) Couche 2  C) Couche 3  D) Couche 4
   *Réponse: C*

2. **Quelle est l'unité de donnée (PDU) de la couche 2 ?**
   A) Le segment  B) Le paquet  C) La trame  D) Le bit
   *Réponse: C*

3. **Quel port par défaut est utilisé pour le service SSH ?**
   A) 21  B) 22  C) 80  D) 443
   *Réponse: B*

4. **Quelle commande Linux permet d'afficher la table de routage ?**
   A) ip link show  B) ss -tuln  C) ip route show  D) nc -vz
   *Réponse: C*

5. **Quelle est la principale différence entre TCP et UDP ?**
   A) TCP est plus rapide qu'UDP  B) UDP vérifie la réception des données  C) TCP nécessite une connexion et garantit la livraison  D) UDP est utilisé pour les pages web sécurisées
   *Réponse: C*
