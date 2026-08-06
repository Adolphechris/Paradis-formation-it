# SEMESTRE 2 — Jour 53 (6h) : Adressage IPv6 Fondamentaux & Transition

> [!NOTE]
> **Objectif de la journée** : Comprendre la structure de l'IPv6, maîtriser le Link-Local et configurer l'autoconfiguration (SLAAC) et la coexistence IPv4/IPv6.
> **Compétences visées** : `BIT-04` (Niveau Cible: A) — Protocoles IPv6.

---

## 1) Format d'Adresse et Types IPv6 (1h30)

### 📖 1.1 Narration & Intuition
IPv4 offrait 4,3 milliards d'adresses... totalement insuffisant pour nos milliards de smartphones, frigos connectés et voitures. IPv6 (128 bits) offre $3,4 \times 10^{38}$ adresses. Assez pour donner une IP à chaque grain de sable sur Terre ! L'écriture est en hexadécimal et adieu le Broadcast : place au Multicast intelligent.

### 🔍 1.2 Anatomie Technique
- **Format** : 8 groupes de 4 caractères hexadécimaux séparés par `:`.
- **Règles de simplification** : Omission des `0` de tête. `::` représente une suite continue de zéros (utilisable une seule fois !).
- **Types clés** :
  - *Global Unicast* (`2000::/3`) : L'équivalent de l'IP publique. Routable sur Internet.
  - *Link-Local* (`fe80::/10`) : Automatique sur chaque interface. Non routable.
  - *Unique Local* (`fc00::/7` ou `fd00::/8`) : Équivalent aux IP privées (LAN).
  - *Multicast* (`ff00::/8`) : Remplace le Broadcast.

### 🛠️ 1.3 Atelier Pratique Hands-on
Observation et manipulation IPv6 :
```bash
# Voir ses adresses IPv6
ip -6 addr show

# Ping sur la boucle locale IPv6 (équivalent de 127.0.0.1)
ping6 ::1
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
En IPv6, on ne "ping" pas le réseau au hasard. On ping souvent le routeur de la passerelle via son adresse **Link-Local** (souvent `fe80::1`). Attention sous Linux : pour pinger un Link-Local, il FAUT spécifier l'interface ! Ex : `ping fe80::1%eth0`.

---

## 2) SLAAC vs DHCPv6 : Autoconfiguration (1h30)

### 📖 1.1 Narration & Intuition
En IPv6, les machines n'ont pas forcément besoin d'un serveur DHCP. Grâce à SLAAC (Stateless Address Autoconfiguration), le routeur envoie un message disant "Voici le préfixe du réseau, débrouillez-vous pour la fin !". La machine génère alors son IP finale (souvent via son adresse MAC = procédé EUI-64).

### 🔍 1.2 Anatomie Technique
- **SLAAC** : Repose sur ICMPv6 (Router Solicitation / Router Advertisement). Le routeur donne un préfixe `/64`.
- **DHCPv6** : Utilisé si on veut distribuer les options complexes (DNS, Domaine) ou figer les IPs (Stateful).
- *Note* : Aujourd'hui, on mixe souvent SLAAC pour l'IP, et un DHCPv6 "Stateless" (Option O flag) juste pour récupérer l'IP du serveur DNS.

### 🛠️ 1.3 Atelier Pratique Hands-on
Forcer la découverte IPv6 (Router Solicitation) :
```bash
# Utiliser rdisc6 (du paquet ndisc6) pour solliciter le routeur
sudo apt install ndisc6
rdisc6 eth0
# Vous verrez la réponse du routeur avec les préfixes annoncés.
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
L'erreur "IPv6 No route to host" est souvent liée au protocole **NDP (Neighbor Discovery Protocol)** (le remplaçant de ARP). Vérifiez le cache des voisins : `ip -6 neigh show`. Si l'état est "FAILED", le flux L2 (VLAN) bloque le multicast ICMPv6.

---

## 3) Coexistence & Tunnels (Dual-Stack) (2h00)

### 📖 1.1 Narration & Intuition
On ne va pas éteindre IPv4 et allumer IPv6 le lendemain. C'est une transition sur 20 ans. Comment font-ils pour cohabiter ? Le **Dual-Stack** est la méthode reine : la machine parle couramment les deux langues simultanément.

### 🔍 1.2 Anatomie Technique
- **Dual-Stack** : L'interface réseau possède au moins une IPv4 et une IPv6. Le DNS décide (Champ A = IPv4, Champ AAAA = IPv6). Les OS modernes préfèrent IPv6 par défaut.
- **Tunnels (6to4 / Teredo / GRE)** : Encapsuler le paquet IPv6 dans un paquet IPv4 pour traverser un vieux réseau non compatible.
- **NAT64 / DNS64** : Permet à une machine purement IPv6 de parler à un serveur purement IPv4 via une passerelle de traduction.

### 🛠️ 1.3 Atelier Pratique Hands-on
Vérifier la priorité IPv6 et Dual Stack :
```bash
# Vérifier la résolution DNS (IPv4 = A, IPv6 = AAAA)
host google.com

# Forcer curl en IPv6
curl -6 -I https://google.com
# Forcer curl en IPv4
curl -4 -I https://google.com
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
Un site web met 30 secondes à charger, puis s'affiche brusquement ? C'est le symptôme typique du **Broken IPv6**. La machine essaie d'abord l'IPv6 (car elle a une IP globale attribuée), mais le routeur jette les paquets silencieusement. Au bout du timeout (ex: 30s), le navigateur retombe (Fallback) sur IPv4.

---

## Nouvelles abréviations rencontrées
- **SLAAC** : Stateless Address Autoconfiguration
- **NDP** : Neighbor Discovery Protocol
- **Dual-Stack** : Double pile protocolaire (IPv4 + IPv6)

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Simplification et Configuration
- **Consigne** :
  1. Simplifiez l'adresse : `2001:0db8:0000:0000:0000:8a2e:0370:7334`.
  2. Assigner manuellement une IPv6 à eth0.
- **Livrables à produire** : L'adresse compressée et la commande Linux.
- **Corrigé détaillé & Guidé** :
1. Suppression des `0` de tête et remplacement du grand bloc de zéros par `::` -> `2001:db8::8a2e:370:7334`.
2. Commande :
```bash
sudo ip -6 addr add 2001:db8::1/64 dev eth0
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: Quelle est la taille d'une adresse IPv6 ? A) 32 bits B) 64 bits C) 128 bits D) 256 bits. **Réponse: C**
2. QCM: Lequel de ces types remplace le Broadcast IPv4 en IPv6 ? A) Anycast B) Unicast C) Multicast D) BroadcastV6. **Réponse: C**
3. QCM: Quel protocole IPv6 remplace l'ARP de l'IPv4 ? A) ICMPv6 B) NDP C) DHCPv6 D) SLAAC. **Réponse: B**
4. QCM: Comment reconnaît-on une adresse Link-Local IPv6 ? A) Elle commence par 2001:: B) Elle commence par fe80:: C) Elle commence par ::1 D) Elle finit par ::ff. **Réponse: B**
5. QCM: Qu'est-ce que l'architecture Dual-Stack ? A) Deux câbles réseaux B) IPv4 et IPv6 actifs en même temps sur l'équipement C) Deux DNS qui se synchronisent D) Un tunnel VPN dans IPv6. **Réponse: B**

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
