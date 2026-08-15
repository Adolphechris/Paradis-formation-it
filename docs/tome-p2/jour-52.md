# SEMESTRE 2 — Jour 52 (6h) : Adressage IPv4 Avancé & Subnetting CIDR / VLSM Complexe

> [!NOTE]
> **Objectif de la journée** : Maîtriser le calcul binaire d'adressage IPv4, le découpage réseau à longueur variable (**VLSM**), le calcul de masques CIDR complexe, et élaborer un plan d'adressage hiérarchique d'entreprise avec agrégation de routes (*Route Summarization*).
> **Compétences visées** : `BIT-04` (Niveau Cible: A) — Plan d'adressage IP et Routage CIDR.

---

## 🎯 Objectifs de la Leçon

- 🔢 Comprendre la logique binaire sous-jacente au masque de sous-réseau (Opération ET binaire / AND Gate).
- 🧮 Maîtriser la **Méthode du Pas (Block Size)** pour calculer mentalement n'importe quel sous-réseau en quelques secondes.
- 📐 Appliquer la méthodologie **VLSM** (*Variable Length Subnet Mask*) sans aucun gâchis d'adresses IP.
- 🌐 Concevoir un plan d'adressage d'entreprise complet (Siège, Agences, DMZ, Liens point-à-point `/30` et `/31`).
- 🗜️ Réduire la taille des tables de routage par l'**Agrégation de routes** (*Route Summarization / Supernetting*).
- 🧪 Pratiquer avec `ipcalc`, `sipcalc` et configurer des interfaces multi-subnets sous Linux.

---

## 🖼️ Architecture & Plan d'Adressage IP

![Subnetting CIDR VLSM](https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800)

---

## 📖 1. La Logique Binaire du Subnetting & La Notation CIDR

### 1.1 Narration & Intuition — Découper le Terrain de la Ville

Imaginez un grand terrain vierge de $1\,000 \text{ m}^2$ réservé à une entreprise. Si l'entreprise découpe ce terrain en parcelles de taille égale ($100 \text{ m}^2$ chacune) pour tous les services, le service Informatique (100 personnes) sera entassé, tandis que le service Juridique (2 personnes) aura un espace désertique gigantesque.

C'est exactement le problème des anciennes classes d'adresses IP (Classe A, B, C des années 1980) : elles découpaient Internet en blocs rigides de 16 millions, 65 000 ou 254 adresses.

En 1993, le **CIDR** (*Classless Inter-Domain Routing*) et le **VLSM** ont aboli ces classes. Désormais, on taille les sous-réseaux **sur mesure** en fonction du nombre exact d'hôtes requis.

### 1.2 Le Masque de Sous-réseau : L'Opération ET Binaire (AND)

Une adresse IPv4 est un nombre binaire de 32 bits. Le masque de sous-réseau comporte des `1` consécutifs pour la partie **Réseau** et des `0` pour la partie **Hôte**.

Lorsque votre carte réseau veut savoir si une IP destination est sur le **même LAN** ou si elle doit envoyer le paquet au **Routeur**, elle effectue une opération logique **ET (AND)** :

```
Adresse IP   (192.168.1.130) ──► 11000000.1681000.00000001.10000010
Masque /26   (255.255.255.192)─► 11111111.11111111.11111111.11000000 (ET Binaire)
───────────────────────────────────────────────────────────────────
Adresse Réseau (192.168.1.128)─► 11000000.1681000.00000001.10000000
```

### 1.3 Formules Mathématiques Fondamentales du Subnetting

Pour un masque CIDR de préfixe `/N` (où $N$ est entre 8 et 32) :

1. **Nombre de bits d'hôtes ($H$)** : 
   $$H = 32 - N$$
2. **Nombre d'adresses IP totales ($T$)** : 
   $$T = 2^H$$
3. **Nombre d'hôtes utilisables ($U$)** : 
   $$U = 2^H - 2$$
   *(On soustrait 2 adresses : l'Adresse Réseau et l'Adresse de Diffusion/Broadcast).*
4. **Le Pas Réseau (*Block Size* $B$) dans le dernier octet variable** :
   $$B = 256 - \text{Valeur du Masque}$$

---

## 📖 2. Tableau de Référence Rapide des Masques CIDR

```
┌─────────┬───────────────────┬───────────────┬──────────────────┬────────────────────────┐
│ Préfixe │ Masque Décimal    │ Bits Hôtes (H)│ Nb d'IP Totales  │ Nb d'Hôtes Utilisables │
├─────────┼───────────────────┼───────────────┼──────────────────┼────────────────────────┤
│  /24    │ 255.255.255.0     │      8        │       256        │          254           │
│  /25    │ 255.255.255.128   │      7        │       128        │          126           │
│  /26    │ 255.255.255.192   │      6        │        64        │           62           │
│  /27    │ 255.255.255.224   │      5        │        32        │           30           │
│  /28    │ 255.255.255.240   │      4        │        16        │           14           │
│  /29    │ 255.255.255.248   │      3        │         8        │            6           │
│  /30    │ 255.255.255.252   │      2        │         4        │            2 (Point-to-Point)
│  /31    │ 255.255.255.254   │      1        │         2        │            2 (RFC 3021)│
│  /32    │ 255.255.255.255   │      0        │         1        │            1 (Hôte Seul)│
└─────────┴───────────────────┴───────────────┴──────────────────┴────────────────────────┘
```

---

## 📖 3. La Méthodologie VLSM (Variable Length Subnet Mask)

Le VLSM consiste à attribuer des sous-réseaux de longueurs de masques différentes à partir d'un même bloc de départ, sans créer de chevauchement.

### La Règle d'Or du VLSM :
> **Triez TOUJOURS vos besoins par nombre d'hôtes décroissant (du plus grand besoin au plus petit) avant d'attribuer les sous-réseaux.**

### Cas Concret d'Étude — Plan d'Adressage pour l'Entreprise "Paradis-Bank"

**Énoncé :** On dispose du bloc IP `192.168.10.0/24`. On doit alimenter :
1. **LAN-Siège** : 100 hôtes nécessaires
2. **LAN-DMZ Web** : 50 hôtes nécessaires
3. **LAN-Agence** : 20 hôtes nécessaires
4. **Lien WAN Routeur A ── Routeur B** : 2 hôtes nécessaires

```
Étape 1 : Tri par ordre décroissant
  1. LAN-Siège  (100 hôtes) ──► Besoin /25 (126 utiles)
  2. LAN-DMZ    (50 hôtes)  ──► Besoin /26 (62 utiles)
  3. LAN-Agence (20 hôtes)  ──► Besoin /27 (30 utiles)
  4. Lien WAN   (2 hôtes)   ──► Besoin /30 (2 utiles)

Étape 2 : Attribution séquentielle à partir de 192.168.10.0

- Sous-réseau 1 : LAN-Siège (100 hôtes → /25)
  • Adresse Réseau   : 192.168.10.0/25
  • Plage d'IP utiles: 192.168.10.1   à  192.168.10.126
  • Adresse Broadcast: 192.168.10.127
  • Masque Décimal   : 255.255.255.128

- Sous-réseau 2 : LAN-DMZ (50 hôtes → /26)
  • Prochaine IP dispo: 192.168.10.128/26
  • Plage d'IP utiles: 192.168.10.129 à  192.168.10.190
  • Adresse Broadcast: 192.168.10.191
  • Masque Décimal   : 255.255.255.192

- Sous-réseau 3 : LAN-Agence (20 hôtes → /27)
  • Prochaine IP dispo: 192.168.10.192/27
  • Plage d'IP utiles: 192.168.10.193 à  192.168.10.222
  • Adresse Broadcast: 192.168.10.223
  • Masque Décimal   : 255.255.255.224

- Sous-réseau 4 : Lien WAN Point-à-Point (2 hôtes → /30)
  • Prochaine IP dispo: 192.168.10.224/30
  • Plage d'IP utiles: 192.168.10.225 et 192.168.10.226
  • Adresse Broadcast: 192.168.10.227
  • Masque Décimal   : 255.255.255.252
```

---

## 📖 4. Agrégation de Routes (Route Summarization / Supernetting)

L'**agrégation de routes** consiste à remplacer plusieurs entrées de réseau spécifiques dans la table de routage d'un routeur par une seule route condensée (*Supernet*), afin d'économiser la mémoire RAM et les cycles CPU du routeur.

```
4 Sous-réseaux distincts :             Route Résumée (Supernet) :
  10.1.0.0/24                          
  10.1.1.0/24                   ───►   10.1.0.0/22
  10.1.2.0/24                          (Regroupe les 4 sous-réseaux en 1 seule ligne !)
  10.1.3.0/24                          
```

**Démonstration Binaire :**
- `10.1.0.0` = `00001010.00000001.00000000.00000000`
- `10.1.1.0` = `00001010.00000001.00000001.00000000`
- `10.1.2.0` = `00001010.00000001.00000010.00000000`
- `10.1.3.0` = `00001010.00000001.00000011.00000000`

Les 22 premiers bits sont rigoureusement identiques (`00001010.00000001.000000xx`). La route agrégée minimale est donc **`10.1.0.0/22`**.

---

## 🧪 Atelier Pratique : Outillage & Calculs sous Linux

Exécutez cette série de commandes réelles pour installer et valider vos calculs sous Linux :

```bash
# 1. Installer les outils de calcul réseau ipcalc et sipcalc
sudo apt update && sudo apt install -y ipcalc sipcalc

# 2. Inspecter les détails du sous-réseau 192.168.10.128/26 avec ipcalc
ipcalc 192.168.10.128/26
# Output attendu:
# Address:   192.168.10.128       11000000.1681000.00001010.10 000000
# Netmask:   255.255.255.192 = 26 11111111.11111111.11111111.11 000000
# Wildcard:  0.0.0.63             00000000.00000000.00000000.00 111111
# =>
# Network:   192.168.10.128/26    11000000.1681000.00001010.10 000000
# HostMin:   192.168.10.129
# HostMax:   192.168.10.190
# Broadcast: 192.168.10.191
# Hosts/Net: 62                   Class C, Private Internet

# 3. Calculer la route résumée de 4 réseaux avec sipcalc
sipcalc 10.1.0.0/24 10.1.1.0/24 10.1.2.0/24 10.1.3.0/24

# 4. Configurer une adresse avec masque VLSM /27 sur une interface Linux
sudo ip addr add 192.168.10.193/27 dev eth0 2>/dev/null || true

# 5. Vérifier la configuration de l'interface
ip -4 addr show dev eth0 2>/dev/null || ip addr show | grep inet

# 6. Écrire un script de validation VLSM automatique en Bash
cat > ~/vlsm_check.sh << 'EOF'
#!/bin/bash
IP_CIDR=$1
if [ -z "$IP_CIDR" ]; then
    echo "Usage: ./vlsm_check.sh <IP/CIDR>"
    exit 1
fi
ipcalc "$IP_CIDR" | grep -E "(Network|HostMin|HostMax|Broadcast|Hosts/Net)"
EOF
chmod +x ~/vlsm_check.sh
~/vlsm_check.sh 172.16.5.0/27
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Erreur d'Overlap (Chevauchement de sous-réseaux)
- **Cause** : Deux sous-réseaux ont été créés avec des plages d'IP qui se superposent (ex: attribuer `10.0.0.0/24` et `10.0.0.128/25`). Le routeur ne saura pas vers quelle interface acheminer les paquets destinés à `10.0.0.130`.
- **Réflexe** : Utilisez toujours un outil **IPAM** (*IP Address Management* comme NetBox) et vérifiez l'absence de chevauchement avant tout déploiement en production.

### 2. Machine incapable de joindre sa Passerelle (Gateway)
- **Cause** : L'adresse de la passerelle a été configurée hors du masque de sous-réseau du PC (ex: PC configuré en `192.168.1.50/26` [plage 1-62] et Passerelle en `192.168.1.254`).
- **Réflexe** : Vérifiez que l'IP du PC et l'IP du routeur appartiennent **strictement à la même plage d'hôtes du même sous-réseau**.

### 3. Masque `/31` pour les liaisons point-à-point (RFC 3021)
- **Conseil Senior** : Sur les routeurs modernes (Cisco, Linux, Juniper), on utilise la norme **RFC 3021** avec un masque **/31** pour les liaisons point-à-point (2 adresses totales, 0 perte pour réseau/broadcast), économisant 50% d'adresses par rapport au classique `/30`.

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Combien d'hôtes IP utilisables offre un sous-réseau configuré avec un masque CIDR `/26` ?**
- A) 32
- B) 62
- C) 64
- D) 126

*Réponse : B — Un préfixe /26 laisse $32 - 26 = 6$ bits d'hôtes. $2^6 = 64$ IP totales, moins 2 (réseau et broadcast) = 62 hôtes utilisables.*

**Q2 : Quelle est la règle d'or préalable indispensable avant d'attribuer des sous-réseaux en VLSM ?**
- A) Attribuer les adresses au hasard
- B) Trier impérativement les besoins en sous-réseaux par nombre d'hôtes décroissant (du plus grand au plus petit)
- C) Commencer par les liens point-à-point /30
- D) Convertir toutes les IP en IPv6

*Réponse : B — Pour éviter les trous et le chevauchement d'adresses, le VLSM exige de traiter le plus grand sous-réseau en premier.*

**Q3 : Quelle est l'adresse de diffusion (Broadcast) du sous-réseau `192.168.1.64/27` ?**
- A) 192.168.1.95
- B) 192.168.1.127
- C) 192.168.1.65
- D) 192.168.1.255

*Réponse : A — Un /27 a un pas de 32 ($256-224=32$). Le sous-réseau va de .64 à .95. La dernière adresse .95 est l'adresse de Broadcast.*

**Q4 : Quel est le masque décimal équivalent au préfixe CIDR `/28` ?**
- A) 255.255.255.0
- B) 255.255.255.192
- C) 255.255.255.240
- D) 255.255.255.252

*Réponse : C — /28 correspond à 4 bits d'hôtes ($2^4=16$). Le masque est $256 - 16 = 240$, soit 255.255.255.240.*

**Q5 : Quelle est l'utilité principale de l'agrégation de routes (*Route Summarization / Supernetting*) ?**
- A) Augmenter la vitesse du processeur du PC
- B) Combiner plusieurs routes spécifiques en une seule route globale pour réduire la taille des tables de routage des routeurs
- C) Chiffrer les requêtes DNS
- D) Supprimer les adresses MAC

*Réponse : B — L'agrégation de routes résume plusieurs sous-réseaux contigus en un seul préfixe plus court, économisant la mémoire des routeurs.*

**Q6 : Quelle route agrégée minimale résume exactement les 4 sous-réseaux suivants : `10.0.0.0/24`, `10.0.1.0/24`, `10.0.2.0/24` et `10.0.3.0/24` ?**
- A) `10.0.0.0/16`
- B) `10.0.0.0/22`
- C) `10.0.0.0/23`
- D) `10.0.0.0/25`

*Réponse : B — Les 22 premiers bits sont communs aux 4 sous-réseaux ($10.0.0.0$ à $10.0.3.255$). Le supernet est `10.0.0.0/22`.*

**Q7 : Quelle commande Linux permet d'obtenir un découpage détaillé d'un réseau IP avec son masque, sa wildcard, sa plage et son broadcast ?**
- A) `ipcalc 192.168.1.0/24`
- B) `ping 192.168.1.0`
- C) `cat /etc/hosts`
- D) `traceroute 192.168.1.0`

*Réponse : A — `ipcalc` calcule instantanément toutes les propriétés d'un sous-réseau IPv4/IPv6.*

**Q8 : Pourquoi la norme RFC 3021 autorise-t-elle l'utilisation des masques `/31` pour les liaisons point-à-point entre deux routeurs ?**
- A) Parce que les routeurs n'ont pas besoin de cartes réseau
- B) Parce que sur un lien strictement point-à-point, les adresses de réseau et de broadcast ne sont pas requises, économisant 50% d'IP par rapport à un `/30`
- C) Parce que cela accélère la vitesse de la lumière dans la fibre
- D) Pour remplacer le protocole ARP

*Réponse : B — La RFC 3021 permet d'utiliser 2 adresses sur un /31 pour relier 2 routeurs sans gaspiller 2 adresses annexes.*

---

## 📚 Ressources & Références

- **RFC 1519** — Classless Inter-Domain Routing (CIDR) : https://datatracker.ietf.org/doc/html/rfc1519
- **RFC 3021** — Using 31-Bit Prefixes on IPv4 Point-to-Point Links : https://datatracker.ietf.org/doc/html/rfc3021
- **NetBox IPAM Official Documentation** : https://netbox.dev/
- **ipcalc Documentation** : `man ipcalc`

---

*Semestre 2 — Réseaux & Télécoms Avancés PARADIS IT Masterclass*
