# Jour J0D — Le Monde du Réseau & d'Internet

> [!NOTE]
> **SEMESTRE 0 — PARCOURS D'INITIATION ET SOCLE DE PRÉ-REQUIS ABSOLUS (J0a–J0o)**  
> Cette leçon explique comment les ordinateurs s'interconnectent pour former le réseau mondial Internet.

---

## 🎯 Objectifs de la Leçon
- 🌐 Définir la notion de réseau informatique (LAN, WAN, Internet).
- 📬 Comprendre le rôle d'une **adresse IP** et d'une **adresse MAC**.
- 🤝 Maitriser le modèle **Client-Serveur**.
- 🚀 Découvrir le rôle des routeurs, des switchs et de la fibre optique.

---

## 🖼️ Le Réseau Mondial
![Réseau & Internet](https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800)

---

## 📖 1. Qu'est-ce qu'un Réseau Informatique ?

Un **réseau informatique** est un ensemble d'équipements (ordinateurs, serveurs, smartphones, imprimantes, routeurs) reliés entre eux par des câbles (cuivre, fibre optique) ou des ondes radio (Wi-Fi, 5G) afin d'échanger des informations et des ressources.

- **LAN (Local Area Network)** : Réseau local restreint à un domicile, un bureau ou un bâtiment.
- **WAN (Wide Area Network)** : Réseau étendu couvrant de grandes distances (villes, pays).
- **Internet** : Le "Réseau des Réseaux", interconnectant des milliards d'équipements à l'échelle de la planète entière.

---

## 📖 2. Comment un Ordinateur est-il Identifié ? (IP & MAC)

### 2.1 L'Adresse MAC (Adresse Physique)
L'**adresse MAC** (*Media Access Control*) est un identifiant unique gravé en usine sur la carte réseau de chaque appareil (ex: `00:1A:2B:3C:4D:5E`). C'est l'équivalent du **numéro de châssis** d'une voiture ou de votre empreinte digitale.

### 2.2 L'Adresse IP (Adresse Logique)
L'**adresse IP** (*Internet Protocol*) est le numéro d'adresse attribué temporairement ou définitivement à un équipement sur le réseau (ex: `192.168.1.15` ou `8.8.8.8`). C'est l'équivalent de votre **adresse postale** (Rue, Numéro, Ville), qui indique où vous trouver sur le réseau.

---

## 📖 3. Le Modèle Client-Serveur

Toute l'architecture du Web repose sur le modèle **Client-Serveur** :
- **Le Client** : C'est votre appareil (votre navigateur Chrome/Firefox sur votre PC). Il formule une **requête** (ex: *"Affiche-moi la page d'accueil de PARADIS IT"*).
- **Le Serveur** : C'est un ordinateur puissant hébergé dans un Data Center, fonctionnant 24h/24. Il reçoit la requête, la traite et renvoie une **réponse** contenant la page web.

---

## 🧪 2. Atelier Pratique : Tester sa Connexion avec `ping`

Ouvrez votre terminal Linux et tapez cette commande pour envoyer des paquets de test vers le serveur DNS de Google :

```bash
# Vérifier la connectivité réseau vers Google (8.8.8.8)
ping -c 4 8.8.8.8
```

---

## ❓ Banque de QCM & Test du Jour (5 Questions)

**Q1 : Quelle est la différence fondamentale entre une adresse MAC et une adresse IP ?**
- A) L'adresse MAC change tous les jours, l'adresse IP ne change jamais
- B) L'adresse MAC est l'identifiant physique gravé sur la carte réseau, alors que l'adresse IP est l'adresse logique attribuée sur le réseau
- C) L'adresse MAC ne sert que pour le Wi-Fi
- D) L'adresse IP est réservée aux imprimantes

*Réponse : B — La MAC est l'empreinte physique unique de la carte réseau, l'IP est l'adresse réseau évolutive.*

**Q2 : Dans le modèle Client-Serveur, quel est le rôle de l'équipement "Client" ?**
- A) Stocker toutes les données du site web pour les autres utilisateurs
- B) Formuler une requête vers un serveur pour obtenir une ressource ou une page web
- C) Fournir de l'électricité aux câbles sous-marins
- D) Fabriquer des composants électroniques

*Réponse : B — Le client est l'émetteur de la demande (ex: votre navigateur web).*

**Q3 : Que signifie le terme LAN en réseau informatique ?**
- A) Large Access Network
- B) Local Area Network (Réseau Local)
- C) Linux Admin Node
- D) Link Automatic Number

*Réponse : B — LAN désigne le réseau local restreint à un bâtiment ou une habitation.*

**Q4 : À quoi sert la commande réseau `ping` dans un terminal ?**
- A) À éteindre l'ordinateur distant
- B) À tester la connectivité et mesurer le temps d'aller-retour des paquets vers un serveur distant
- C) À effacer le disque dur
- D) À installer des jeux

*Réponse : B — Ping envoie des paquets ICMP pour vérifier si une machine distante répond et mesurer la latence.*

**Q5 : Quel équipement réseau est responsable d'orienter et d'acheminer les paquets de données entre deux réseaux différents (ex: votre maison et Internet) ?**
- A) L'imprimante
- B) Le Routeur
- C) L'écran
- D) Le clavier

*Réponse : B — Le routeur est le carrefour intelligent qui interfacera votre réseau local avec le réseau mondial Internet.*

---

*Semestre 0 — Module d'Initiation & Pré-requis Absolus PARADIS IT Masterclass*
