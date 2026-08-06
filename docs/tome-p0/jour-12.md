# SEMESTRE 1 — Jour 12 (6h) : Adressage IPv4 & Subnetting CIDR

> [!NOTE]
> **Objectif de la journée** : Maîtriser l'adressage IPv4, différencier les adresses publiques des privées, et savoir découper un réseau en sous-réseaux grâce aux masques et à la notation CIDR.
> **Compétences visées** : `BIT-04` (Niveau Cible: A) — Subnetting et Adressage IP.

---

## 1) Structure IPv4 et IP Publiques vs Privées (1h30)

### 📖 1.1 Narration & Intuition
Une adresse IPv4, c'est comme un numéro de téléphone à l'ancienne. Il y a un indicatif de pays/région (le réseau) et un numéro unique pour l'abonné (l'hôte). Mais avec seulement 4 milliards d'adresses disponibles pour toute la planète, il y a eu pénurie. La solution ? Les adresses "privées" (comme les numéros de poste internes d'une entreprise) que l'on peut réutiliser partout, et qui sont traduites en adresses "publiques" pour aller sur Internet.

### 🔍 1.2 Anatomie Technique
- **Structure** : 32 bits, notée en 4 octets décimaux (ex: `192.168.1.10`).
- **IP Publiques** : Routables sur Internet.
- **IP Privées (RFC 1918)** : Non routables sur Internet. Réservées aux réseaux locaux (LAN).
  - Plage 1 : `10.0.0.0` à `10.255.255.255`
  - Plage 2 : `172.16.0.0` à `172.31.255.255`
  - Plage 3 : `192.168.0.0` à `192.168.255.255`

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Voir son IP privée locale
ip -4 addr show

# Découvrir son IP publique (comment Internet vous voit via le NAT)
curl ifconfig.me
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Impossible d'accéder à un serveur d'entreprise depuis l'extérieur.
- **Explication** : Le serveur a une IP privée (ex: `192.168.1.50`). Elle n'existe pas sur Internet. Il faut utiliser une IP publique et mettre en place du NAT/Port Forwarding, ou utiliser un VPN.

---

## 2) Masques de Sous-réseau et Notation CIDR (1h30)

### 📖 2.1 Narration & Intuition
Dans une adresse IP, comment séparer l'indicatif de région (réseau) du numéro d'abonné (hôte) ? Le **masque de sous-réseau** (subnet mask) sert de calque. Partout où le masque a des `1` binaires, cela désigne le réseau. Partout où il a des `0`, cela désigne l'hôte.
La **notation CIDR** (Classless Inter-Domain Routing) est un raccourci d'écriture pour éviter d'écrire de longs masques complexes.

### 🔍 2.2 Anatomie Technique
- **Masque classique** : `255.255.255.0` (En binaire : 24 `1` suivis de 8 `0`).
- **Notation CIDR** : `192.168.1.10/24`. Le `/24` indique que les 24 premiers bits constituent l'adresse réseau.
- Autres masques fréquents :
  - `/8` = `255.0.0.0` (16 millions d'hôtes)
  - `/16` = `255.255.0.0` (65534 hôtes)
  - `/24` = `255.255.255.0` (254 hôtes)
  - `/28` = `255.255.255.240` (14 hôtes)

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# Utiliser l'outil ipcalc (à installer via sudo apt install ipcalc)
# pour visualiser instantanément la division réseau/hôte.
ipcalc 192.168.1.10/24
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Deux machines connectées au même switch ne se ping pas.
- **Cause** : Machine A a `192.168.1.10/24` (réseau 192.168.1.0) et Machine B a `192.168.2.10/24` (réseau 192.168.2.0). Elles pensent être dans deux réseaux différents.
- **Réflexe** : Vérifier que les deux machines ont le même réseau défini par leur IP et leur masque.

---

## 3) Calcul de Plages IP, Adresse Réseau et Broadcast (2h00)

### 📖 3.1 Narration & Intuition
Quand vous configurez un réseau, deux adresses sont toujours réservées et inutilisables par les ordinateurs. La première adresse (tout à zéro côté hôte) est le **nom de la rue** (adresse Réseau). La dernière adresse (tout à un côté hôte) est le **mégaphone** (adresse de Broadcast) permettant de crier un message à tous les habitants de la rue.

### 🔍 3.2 Anatomie Technique
Pour le réseau `192.168.1.0/24` (les 3 premiers octets = réseau, le dernier = hôte) :
- **Adresse Réseau** : `192.168.1.0` (Hôte = 0). Interdit d'attribuer.
- **Première IP utilisable** : `192.168.1.1`
- **Dernière IP utilisable** : `192.168.1.254`
- **Adresse Broadcast** : `192.168.1.255` (Hôte = 255). Interdit d'attribuer.
- **Nombre d'hôtes** : $2^8 - 2 = 254$ machines.

Pour un réseau `/28` (4 bits d'hôte, $2^4 = 16$ adresses, 14 utilisables) :
Exemple : `10.0.0.0/28` => Réseau `10.0.0.0`, Broadcast `10.0.0.15`, IPs : `.1` à `.14`.

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Vérifier si l'adresse est valide pour un hôte
ipcalc 10.0.0.15/28
# Observez le résultat : ipcalc indique que c'est une adresse de Broadcast !
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Erreur courante** : Essayer d'assigner l'IP `.0` ou `.255` sur un `/24`.
- **Réflexe** : Toujours utiliser un calculateur ou vérifier que l'adresse n'est pas le network id ou le broadcast id avant de l'assigner à une interface.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Calcul CIDR manuel
- **Consigne** : Donnez l'adresse réseau, l'adresse de broadcast et la plage d'IP utilisables pour `172.16.50.68/26`.
- **Livrables à produire** : Fichier texte avec les calculs et vérification via `ipcalc`.
- **Corrigé détaillé & Guidé** :
```bash
# Un masque /26 laisse 6 bits pour les hôtes (32-26 = 6).
# 2^6 = 64 adresses totales par sous-réseau.
# Les sous-réseaux progressent de 64 en 64 : .0, .64, .128, .192.
# 68 se trouve dans le sous-réseau qui commence à .64.
# Adresse réseau : 172.16.50.64
# Adresse de broadcast : 172.16.50.127 (juste avant 128)
# IPs utilisables : 172.16.50.65 à 172.16.50.126
# Vérification :
ipcalc 172.16.50.68/26
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Laquelle de ces adresses est une adresse IP privée selon la RFC 1918 ?**
   A) 8.8.8.8  B) 172.16.5.10  C) 192.169.1.1  D) 11.0.0.1
   *Réponse: B*

2. **À quoi correspond la notation /24 en masque décimal ?**
   A) 255.0.0.0  B) 255.255.0.0  C) 255.255.255.0  D) 255.255.255.240
   *Réponse: C*

3. **Combien d'adresses IP hôtes utilisables possède un réseau en /24 ?**
   A) 256  B) 255  C) 254  D) 128
   *Réponse: C*

4. **Quelle est l'adresse de broadcast pour le réseau 192.168.10.0/24 ?**
   A) 192.168.10.1  B) 192.168.10.0  C) 192.168.10.254  D) 192.168.10.255
   *Réponse: D*

5. **Pourquoi ne peut-on pas assigner l'adresse réseau à un ordinateur ?**
   A) Parce qu'elle identifie le segment de réseau en lui-même.  B) Parce qu'elle est réservée aux routeurs.  C) Parce qu'elle est utilisée pour le ping.  D) Parce qu'elle est traduite en adresse MAC.
   *Réponse: A*
