# SEMESTRE 2 — Jour 52 (6h) : Adressage IPv4 Avancé & Subnetting CIDR Complexe

> [!NOTE]
> **Objectif de la journée** : Maîtriser le découpage réseau (Subnetting) avec des masques de longueur variable (VLSM) pour optimiser l'espace d'adressage IP.
> **Compétences visées** : `BIT-04` (Niveau Cible: A) — Plan d'adressage IP.

---

## 1) Fondamentaux CIDR & Calculs Manuels (1h30)

### 📖 1.1 Narration & Intuition
Les classes IP (A, B, C) sont mortes dans les années 90 car elles gâchaient trop d'adresses. La solution ? Le CIDR (Classless Inter-Domain Routing). C'est comme découper un immense gâteau en parts asymétriques exactement adaptées à la faim de chaque invité, plutôt que de donner la même énorme part à tout le monde.

### 🔍 1.2 Anatomie Technique
Le masque de sous-réseau détermine la partie **Réseau** et la partie **Hôte** de l'adresse IP.
- `/24` = 255.255.255.0 = 256 IPs (-2 pour réseau et broadcast) = 254 hôtes.
- `/25` = 255.255.255.128 = 126 hôtes.
- `/30` = 255.255.255.252 = 2 hôtes (idéal pour les liens point-à-point entre routeurs).

### 🛠️ 1.3 Atelier Pratique Hands-on
Calculons un `/26` :
```bash
# IP : 192.168.1.10 /26
# Masque /26 = 255.255.255.192
# Pas du réseau = 256 - 192 = 64
# Sous-réseaux possibles : .0, .64, .128, .192
# L'IP .10 appartient au sous-réseau 192.168.1.0/26.
# Broadcast du subnet = 192.168.1.63
```
Vérification sous Linux avec `ipcalc` :
```bash
sudo apt install ipcalc
ipcalc 192.168.1.10/26
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
L'erreur n°1 en production est l'**Overlap** (chevauchement). Affecter un `/23` sans réaliser qu'il englobe deux `/24` adjacents causera des conflits de routage fatals. Toujours faire un tableau IPAM (IP Address Management).

---

## 2) VLSM : Variable Length Subnet Mask (1h30)

### 📖 1.1 Narration & Intuition
Le VLSM permet de faire des "sous-réseaux de sous-réseaux". On part du besoin le plus grand pour aller vers le besoin le plus petit, afin de ne laisser aucun "trou" dans l'espace d'adressage.

### 🔍 1.2 Anatomie Technique
Méthodologie VLSM stricte :
1. Trier les besoins (départements) du plus grand nombre d'hôtes au plus petit.
2. Assigner le plus grand bloc possible au premier.
3. Prendre la prochaine adresse réseau disponible pour le second, etc.
*Exemple : Un réseau `10.0.0.0/24`. On veut un subnet de 100 hôtes, un de 50 hôtes et un lien routeur (2 hôtes).*
- 100 hôtes -> Besoin d'un `/25` (126 hosts) -> `10.0.0.0/25`
- 50 hôtes -> Besoin d'un `/26` (62 hosts) -> `10.0.0.128/26`
- 2 hôtes -> Besoin d'un `/30` (2 hosts) -> `10.0.0.192/30`

### 🛠️ 1.3 Atelier Pratique Hands-on
Configuration d'interfaces avec VLSM en CLI :
```bash
# Ajouter l'IP du sous-réseau 50 hôtes à une interface
sudo ip addr add 10.0.0.129/26 dev eth1

# Ajouter l'IP du lien point-à-point
sudo ip addr add 10.0.0.193/30 dev eth2
ip route show
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
Un ping ne passe pas entre deux machines configurées ? Vérifiez toujours si les masques sont symétriques. Si le PC1 est en `/24` et le PC2 en `/25` sur le même LAN, ils auront des comportements de broadcast divergents (problèmes ARP garantis).

---

## 3) Découpage Réseau d'Architecture Bancaire (2h00)

### 📖 1.1 Narration & Intuition
Dans une banque, la sécurité exige l'isolation pure et simple. Les serveurs de production (Prod), l'environnement de test (Dev), la DMZ (Web public), le siège social et les agences ne doivent pas partager le même domaine de broadcast.

### 🔍 1.2 Anatomie Technique
On alloue un grand bloc (ex: `10.50.0.0/16`) et on structure hiérarchiquement :
- **10.50.1.0/24** : DMZ (Web, Proxy) - Exposé Internet.
- **10.50.2.0/24** : Prod BDD (Aucun accès Internet direct).
- **10.50.10.0/23** : Utilisateurs du Siège (500 hosts).
- **10.50.100.X** : Plages allouées dynamiquement aux agences locales en `/26`.

### 🛠️ 1.3 Atelier Pratique Hands-on
Simulation de règles de routage sous Linux :
```bash
# Bloquer tout trafic de Dev (10.50.3.0/24) vers Prod (10.50.2.0/24)
sudo iptables -A FORWARD -s 10.50.3.0/24 -d 10.50.2.0/24 -j DROP
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
Documentez l'IPAM via un outil comme *NetBox* ou *phpIPAM*. Gérer des sous-réseaux complexes sur Excel finit **toujours** par un désastre d'IP dupliquée en production un vendredi à 17h.

---

## Nouvelles abréviations rencontrées
- **CIDR** : Classless Inter-Domain Routing
- **VLSM** : Variable Length Subnet Mask
- **IPAM** : IP Address Management
- **DMZ** : Demilitarized Zone

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Plan d'adressage VLSM complet
- **Consigne** : À partir de `192.168.100.0/24`, découpez pour : LAN-A (60 hôtes), LAN-B (25 hôtes), LAN-C (10 hôtes) et 2 liens Routeurs (2 hôtes chacun).
- **Livrables à produire** : Un tableau Markdown avec les colonnes : Nom, Réseau, Premier Hôte, Dernier Hôte, Broadcast, Masque (CIDR).
- **Corrigé détaillé & Guidé** :
1. LAN-A (60) : /26 -> Réseau `192.168.100.0/26`. Plage `.1` à `.62`. Broadcast `.63`.
2. LAN-B (25) : /27 -> Réseau `192.168.100.64/27`. Plage `.65` à `.94`. Broadcast `.95`.
3. LAN-C (10) : /28 -> Réseau `192.168.100.96/28`. Plage `.97` à `.110`. Broadcast `.111`.
4. Lien1 (2) : /30 -> Réseau `192.168.100.112/30`. Plage `.113` à `.114`.
5. Lien2 (2) : /30 -> Réseau `192.168.100.116/30`. Plage `.117` à `.118`.

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: Combien d'hôtes valides permet un masque /25 ? A) 64 B) 128 C) 126 D) 254. **Réponse: C**
2. QCM: Quelle est l'adresse de broadcast pour le réseau 172.16.1.0/24 ? A) 172.16.255.255 B) 172.16.1.254 C) 172.16.1.255 D) 172.16.1.0. **Réponse: C**
3. QCM: Quel masque utilise-t-on généralement pour un lien point-à-point ? A) /24 B) /28 C) /30 D) /32. **Réponse: C**
4. QCM: Lequel de ces outils est indispensable pour la gestion moderne des IP en entreprise ? A) NetBox (IPAM) B) MS Excel C) PingSweep D) Wireshark. **Réponse: A**
5. QCM: Que signifie VLSM ? A) Virtual Local Subnet Mask B) Variable Length Subnet Mask C) Virtual LAN Segmentation Mode D) Very Long Subnet Mask. **Réponse: B**

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
