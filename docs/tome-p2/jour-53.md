# SEMESTRE 2 — Jour 53 (6h) : Adressage IPv6 Fondamentaux, SLAAC & Coexistence Dual-Stack

> [!NOTE]
> **Objectif de la journée** : Comprendre l'architecture et la notation des adresses IPv6 (128 bits), maîtriser l'autoconfiguration sans état (**SLAAC**), le protocole de découverte de voisins (**NDP**), et déployer la coexistence IPv4/IPv6 en **Dual-Stack**.
> **Compétences visées** : `BIT-04` (Niveau Cible: A) — Protocoles IPv6, Autoconfiguration et Transition.

---

## 🎯 Objectifs de la Leçon

- 🔢 Maîtriser le format hexadécimal à 128 bits de l'IPv6 et appliquer les 2 règles d'or de compression.
- 🗺️ Identifier les 4 grands types d'adresses IPv6 (**Global Unicast**, **Link-Local**, **Unique Local**, **Multicast**).
- 🔄 Expliquer le fonctionnement de **SLAAC** (*Stateless Address Autoconfiguration*) et du procédé **EUI-64**.
- 🤝 Comprendre comment **NDP** (*Neighbor Discovery Protocol*) remplace ARP grâce au Multicast ICMPv6.
- 🔀 Gérer la coexistence IPv4/IPv6 en **Dual-Stack** et comprendre l'algorithme *Happy Eyeballs*.
- 🧪 Manipuler les commandes d'inspection et de diagnostic IPv6 sous Linux (`ip -6`, `ping6`, `rdisc6`, `dig`).

---

## 🖼️ Le Protocole IPv6 et la Transition Mondiale

![IPv6 Networking](https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800)

---

## 📖 1. Pourquoi IPv6 ? L'Échelle des 128 Bits

### 1.1 Narration & Intuition — L'Extension Universelle des Numéros de Téléphone

Dans les années 1970, lorsque l'IPv4 a été conçu avec des adresses de 32 bits (~4,3 milliards d'adresses), l'idée que chaque être humain possède plusieurs ordinateurs, smartphones, montres et frigos connectés semblait relever de la science-fiction.

Avec **IPv6** et ses **128 bits**, le nombre d'adresses uniques disponibles est de :

$$2^{128} = 340\,282\,366\,920\,938\,463\,463\,374\,607\,431\,768\,211\,456 \quad (\approx 3{,}4 \times 10^{38} \text{ adresses})$$

Cela représente plus de **667 millions de milliards d'adresses IP pour chaque millimètre carré de la surface de la Terre** !

### 1.2 La Structure & Les 2 Règles de Simplification de l'Adresse IPv6

Une adresse IPv6 est composée de **8 groupes de 4 chiffres hexadécimaux** (appelés *hextets*) séparés par deux-points (`:`).

Exemple brut : `2001:0db8:0000:0000:0000:8a2e:0370:7334`

Pour rendre ces adresses lisibles, la norme RFC 5952 définit **2 règles d'or de compression obligatoire** :

```
RÈGLE 1 : Omission des Zéros en Tête dans chaque hextet
  `0db8`  ──► `db8`
  `0000`  ──► `0`
  `0370`  ──► `370`

RÈGLE 2 : Remplacement de la plus longue suite continue d'hextets de Zéros par `::`
  `2001:0db8:0000:0000:0000:8a2e:0370:7334`
              └────────────────┐
                               ▼
  Adresse finale compressée : `2001:db8::8a2e:370:7334`
```

> [!IMPORTANT]
> **Le double deux-points (`::`) ne peut être utilisé QU'UNE SEULE FOIS par adresse !**  
> Si vous écriviez `2001::8a2e::7334`, il serait rigoureusement impossible de savoir combien de d'hextets de zéros se trouvent dans chaque trou.

---

## 📖 2. Les 4 Grandes Catégories d'Adresses IPv6

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 1. GLOBAL UNICAST ADDRESS (GUA) — Préfixe `2000::/3`                    │
│    - Équivalent des IP Publiques IPv4. Routable sur Internet.           │
│    - Structure : Préfixe FAI (48 bits) + Subnet (16 bits) + Interface ID (64 bits)
├──────────────────────────────────────────────────────────────────────────┤
│ 2. LINK-LOCAL ADDRESS (LLA) — Préfixe `fe80::/10`                       │
│    - Générée automatiquement sur CHAQUE interface IPv6 active.          │
│    - Utilisée pour le protocole NDP et le routage local. Non-routable.  │
│    - Nécessite l'ID de zone (ex: `fe80::1%eth0`) pour le ciblage.        │
├──────────────────────────────────────────────────────────────────────────┤
│ 3. UNIQUE LOCAL ADDRESS (ULA) — Préfixe `fc00::/7` ou `fd00::/8`        │
│    - Équivalent des IP Privées RFC 1918 (Réseaux locaux d'entreprise).   │
├──────────────────────────────────────────────────────────────────────────┤
│ 4. MULTICAST ADDRESS — Préfixe `ff00::/8`                               │
│    - Remplace intégralement le Broadcast IPv4 (gain d'efficacité).     │
│    - Ex: `ff02::1` (Tous les hôtes du LAN) / `ff02::2` (Tous les routeurs)│
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 📖 3. Autoconfiguration SLAAC & Protocole NDP (ICMPv6)

### 3.1 SLAAC (Stateless Address Autoconfiguration)

En IPv6, une machine peut obtenir une adresse IP routable **sans aucun serveur DHCP** ! C'est le principe de **SLAAC** :

```
             PC CLIENT                                         ROUTEUR IPv6
        ┌──────────────────┐                               ┌──────────────────┐
        │                  │ ── 1. Router Solicitation ──► │                  │
        │                  │    (RS - "Y a-t-il un routeur?")│                  │
        │                  │                               │                  │
        │                  │ ◄─ 2. Router Advertisement ── │                  │
        │                  │    (RA - "Oui, préfixe /64")  │                  │
        └────────┬─────────┘                               └──────────────────┘
                 │
                 ▼
     Génération de l'Interface ID (64 bits)
     (Préfixe du routeur + Identifiant d'hôte)
```

1. **Router Solicitation (RS)** : Le PC envoie un message ICMPv6 Multicast vers `ff02::2` (tous les routeurs).
2. **Router Advertisement (RA)** : Le routeur répond avec son préfixe de sous-réseau (ex: `2001:db8:1:100::/64`).
3. **Génération d'Hôte** : Le PC combine ce préfixe `/64` avec ses 64 bits d'hôte (via EUI-64 ou RFC 4941 Privacy Extensions).

### 3.2 Le Procédé EUI-64 & Les Privacy Extensions

- **EUI-64** : Génère l'Interface ID de 64 bits à partir de l'adresse MAC (48 bits) en insérant la valeur `FF:FE` au milieu et en inversant le 7ème bit (*Universal/Local bit*).
  - Exemple : MAC `00:1A:2B:3C:4D:5E` ──► Interface ID `021a:2bff:fe3c:4d5e`.
- **Privacy Extensions (RFC 4941)** : Puisque l'EUI-64 basé sur la MAC permet de tracer un ordinateur d'un réseau à l'autre, les OS modernes génèrent des adresses IPv6 temporaires aléatoires pour la navigation web.

### 3.3 NDP (Neighbor Discovery Protocol) : Le Remplaçant d'ARP

En IPv6, le protocole ARP n'existe plus. Il est remplacé par **NDP** basé sur des messages ICMPv6 :
- **Neighbor Solicitation (NS)** : *"Qui possède l'adresse IP 2001:db8::50 ?"* (envoyé en Multicast Solicited-Node).
- **Neighbor Advertisement (NA)** : *"C'est moi, voici mon adresse MAC !"* (réponse Unicast).

---

## 📖 4. Coexistence Dual-Stack & Algorithme Happy Eyeballs

Le passage de l'IPv4 à l'IPv6 s'effectue en douceur grâce au modèle **Dual-Stack** :

```
                       ARCHITECTURE DUAL-STACK
                  ┌─────────────────────────────────┐
                  │      APPLICATION (Navigateur)   │
                  └────────────────┬────────────────┘
                                   │
                  ┌────────────────┴────────────────┐
                  │    ALGORITHME HAPPY EYEBALLS    │
                  │    (Tente IPv6 et IPv4 en 20ms) │
                  └────────┬───────────────┬────────┘
                           │               │
            ┌──────────────┴───┐       ┌───┴──────────────┐
            │   Pile IPv6      │       │   Pile IPv4      │
            └──────────────────┘       └──────────────────┘
```

- **Dual-Stack** : La carte réseau possède simultanément une adresse IPv4 et une (ou plusieurs) adresses IPv6.
- **Happy Eyeballs (RFC 8305)** : Lors de la frappe d'une URL, le navigateur tente de se connecter en IPv6 (champ DNS `AAAA`) et en IPv4 (champ DNS `A`) presque simultanément. La connexion la plus rapide est retenue, évitant ainsi les ralentissements si l'IPv6 est mal configurée sur le réseau.

---

## 🧪 Atelier Pratique : Outillage et Manipulations IPv6 sous Linux

Exécutez cette série de commandes réelles dans votre terminal Linux pour explorer l'IPv6 :

```bash
# 1. Afficher vos adresses IPv6 et repérer l'adresse Link-Local (fe80::)
ip -6 addr show

# 2. Pinger la boucle locale IPv6 (équivalent de 127.0.0.1)
ping6 -c 3 ::1

# 3. Pinger l'adresse Link-Local en spécifiant obligatoirement l'interface (zone scope)
# Remplacer eth0 par le nom de votre interface (ex: wlan0, enp3s0)
ping6 -c 3 fe80::1%eth0 2>/dev/null || echo "Spécifier votre interface avec %interface"

# 4. Afficher la table des voisins IPv6 (l'équivalent de arp -a sous IPv6)
ip -6 neigh show
# Output attendu: fe80::... dev eth0 lladdr 00:11:22:33:44:55 REACHABLE

# 5. Tester la résolution DNS IPv6 (Enregistrement AAAA) avec dig
dig google.com AAAA +short
# Output attendu: 2607:f8b0:4004:835::200e (ou adresse IPv6 similaire)

# 6. Tester la connectivité HTTP en forçant l'IPv6 avec curl
curl -6 -I https://google.com | head -5
# Output attendu: HTTP/2 200 ...

# 7. Écouter les annonces de routeurs SLAAC (Router Advertisements) avec rdisc6
sudo apt update && sudo apt install -y ndisc6
sudo rdisc6 eth0 2>/dev/null || echo "Exécuter rdisc6 sur votre interface active"

# 8. Désactiver/Réactiver temporairement l'IPv6 via sysctl
sudo sysctl -w net.ipv6.conf.all.disable_ipv6=0
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Symptôme "Broken IPv6" : Les sites web mettent 30 secondes à charger
- **Cause** : La machine a obtenu une adresse IPv6 GUA globale (via SLAAC), mais le routeur n'a pas de connectivité IPv6 vers Internet. Le navigateur tente la connexion IPv6, attend le timeout de 30 secondes, puis retombe en IPv4.
- **Réflexe** : Vérifiez la connectivité réelle avec `ping6 2001:4860:4860::8888` (DNS Google IPv6). Si le ping échoue, désactivez temporairement l'IPv6 ou corrigez la route du routeur.

### 2. Message d'Erreur : `ping6: connect: Invalid argument` lors du ping d'une Link-Local
- **Cause** : Vous avez oublié de préciser l'identifiant de zone/interface (`%eth0`). Une adresse `fe80::` existe sur toutes les cartes réseau de la machine ; Linux ne peut pas deviner par quelle carte envoyer le paquet.
- **Réflexe** : Ajoutez toujours `%nom_interface` à la fin de l'adresse Link-Local : `ping6 fe80::1234%eth0`.

### 3. Pare-feu qui bloque ICMPv6
- **Mise en garde critique** : En IPv4, bloquer le ping ICMP est courant. En IPv6, **bloquer ICMPv6 détruit SLAAC et NDP** ! N'interdisez jamais les types ICMPv6 133 (RS), 134 (RA), 135 (NS) et 136 (NA) sur vos pare-feu.

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Quelle est la longueur exacte d'une adresse IPv6 en bits ?**
- A) 32 bits
- B) 64 bits
- C) 128 bits
- D) 256 bits

*Réponse : C — Une adresse IPv6 est codée sur 128 bits, rédigée en 8 hextets hexadécimaux.*

**Q2 : Quelle est la simplification correcte et conforme à la RFC 5952 de l'adresse IPv6 `2001:0db8:0000:0000:0000:0000:0000:0001` ?**
- A) `2001:db8::1`
- B) `2001:db8:0:0:0:0:0:1`
- C) `2001::db8::1`
- D) `2001:db8:0000::1`

*Réponse : A — On supprime les zéros de tête (`0db8`→`db8`) et on remplace la plus longue suite de zéros par `::` une seule fois.*

**Q3 : Quel préfixe d'adresse identifie de manière absolue une adresse IPv6 Link-Local générée automatiquement sur chaque interface ?**
- A) `2000::/3`
- B) `fe80::/10`
- C) `fc00::/7`
- D) `ff00::/8`

*Réponse : B — Les adresses Link-Local commencent par le préfixe `fe80::/10`.*

**Q4 : Quel protocole basé sur ICMPv6 remplace intégralement le protocole ARP en IPv6 pour la résolution des adresses MAC locales ?**
- A) DHCPv6
- B) NDP (Neighbor Discovery Protocol)
- C) DNS64
- D) BGP4+

*Réponse : B — NDP (Neighbor Discovery Protocol) gère la résolution d'adresses physiques via les messages Neighbor Solicitation / Advertisement.*

**Q5 : Comment fonctionne le mécanisme d'autoconfiguration d'adresses sans état SLAAC ?**
- A) La machine contacte un serveur de base de données centralisé
- B) La machine écoute les annonces de routeur (Router Advertisement) pour obtenir son préfixe /64 et génère son identifiant d'hôte
- C) L'utilisateur doit saisir son adresse à la main
- D) La carte réseau télécharge une adresse depuis un satellite

*Réponse : B — SLAAC permet à un hôte de composer sa propre IP globale à partir du préfixe /64 annoncé par le routeur en ICMPv6.*

**Q6 : Pourquoi est-il obligatoire de rajouter `%interface` (ex: `%eth0`) lorsque l'on ping une adresse Link-Local `fe80::` sous Linux ?**
- A) Pour augmenter la vitesse du ping
- B) Parce que les adresses Link-Local sont identiques sur chaque interface et Linux a besoin de savoir par quel port physique émettre le paquet
- C) Parce que la touche Entrée ne fonctionne pas sans cela
- D) C'est une obligation du navigateur web

*Réponse : B — L'identifiant de zone (%eth0) indique la sortie physique car fe80:: n'est pas univoque dans la table de routage globale.*

**Q7 : Quel type d'enregistrement DNS est utilisé pour mapper un nom de domaine vers une adresse IPv6 (équivalent du A en IPv4) ?**
- A) Enregistrement A
- B) Enregistrement AAAA (Quad-A)
- C) Enregistrement MX
- D) Enregistrement CNAME

*Réponse : B — L'enregistrement AAAA stocke les adresses IPv6 128 bits dans le système DNS.*

**Q8 : Quel est le rôle de l'algorithme "Happy Eyeballs" (RFC 8305) dans les navigateurs web modernes ?**
- A) Corriger la luminosité de l'écran
- B) Initier simultanément des connexions IPv6 et IPv4 pour retenir la plus rapide et éviter les blocages liés à une mauvaise configuration IPv6
- C) Chiffrer l'historique de navigation
- D) Bloquer les publicités

*Réponse : B — Happy Eyeballs garantit une expérience utilisateur fluide en cas d'IPv6 défaillante en retombant de manière transparente sur l'IPv4.*

---

## 📚 Ressources & Références

- **RFC 4291** — IPv6 Addressing Architecture : https://datatracker.ietf.org/doc/html/rfc4291
- **RFC 4861** — Neighbor Discovery for IP version 6 (NDP) : https://datatracker.ietf.org/doc/html/rfc4861
- **RFC 4862** — IPv6 Stateless Address Autoconfiguration (SLAAC) : https://datatracker.ietf.org/doc/html/rfc4862
- **RFC 8305** — Happy Eyeballs Version 2 : https://datatracker.ietf.org/doc/html/rfc8305

---

*Semestre 2 — Réseaux & Télécoms Avancés PARADIS IT Masterclass*
