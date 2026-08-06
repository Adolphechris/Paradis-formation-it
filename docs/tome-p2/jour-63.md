# TOME P2 — Réseaux & Télécoms — Jour 63 (6h) : BGP — Border Gateway Protocol

> [!NOTE]
> **Objectif du jour :** Comprendre BGP (le protocole de routage d'Internet), ses concepts fondamentaux (eBGP/iBGP, AS, attributs), et savoir configurer des sessions BGP basiques avec FRRouting. BGP est le protocole qui route tout le trafic d'Internet — sa maîtrise est indispensable pour les architectes réseau et les équipes NOC/SOC.
>
> **Compétences visées :** `BIT-04` (A) — Routage Opérateur & BGP

---

## 1) Module — Concepts Fondamentaux BGP (2h)

### 📖 Narration/Intuition

OSPF route les paquets au sein d'un réseau d'entreprise. BGP route les paquets entre les réseaux d'entreprises, d'opérateurs, et d'États à l'échelle mondiale. Si OSPF est le GPS d'un bâtiment, BGP est le système de navigation international qui relie tous les pays.

**BGP est le protocole qui fait fonctionner Internet.** Chaque réseau connecté à Internet (université, banque, opérateur télécom) possède un **Autonomous System (AS)** — un numéro d'identification unique qui représente un bloc d'adresses IP sous une même administration. BGP permet à ces AS d'échanger leurs tables de routage.

### 🔍 Anatomie Technique

**Vocabulaire fondamental BGP :**

```
AS (Autonomous System) :
  Ensemble de réseaux IP sous une même administration technique
  Identifié par un ASN (AS Number) :
  - ASN 16 bits : 1 à 65535 (ASN publics : 1-64511, privés : 64512-65535)
  - ASN 32 bits : 0.0 à 65535.65535 (notation asdot)

  Exemples réels :
  - AS36896 : AFRINIC (Africa)
  - AS37153 : MTN Congo
  - AS37594 : Vodacom Congo
  - AS15169 : Google
  - AS32934 : Facebook/Meta

eBGP (external BGP) :
  Session BGP entre deux routeurs de différents AS
  Utilisé pour les connexions inter-opérateurs (peering)

iBGP (internal BGP) :
  Session BGP entre deux routeurs du MÊME AS
  Nécessaire pour propager les routes BGP au sein d'un AS

Peering :
  Accord d'échange de routes BGP entre deux AS
  - Public peering : via un IXP (Internet Exchange Point)
  - Private peering : connexion directe entre deux opérateurs

Préfixe BGP :
  Un bloc d'adresses IP annoncé via BGP (ex: 196.1.2.0/24)

NLRI (Network Layer Reachability Information) :
  Ensemble des préfixes annoncés dans un message BGP UPDATE
```

**Types de messages BGP :**

| Message | Rôle |
|:---:|:---|
| **OPEN** | Établissement de session, échange des paramètres (ASN, Hold Time, BGP-ID) |
| **UPDATE** | Annonce de nouveaux préfixes (NLRI) ou retrait de préfixes |
| **KEEPALIVE** | Maintien de la session (réponse à OPEN + heartbeat) |
| **NOTIFICATION** | Signalement d'erreur + fermeture de session |
| **ROUTE-REFRESH** | Demande de re-envoi de toutes les routes (RFC 2918) |

**Attributs BGP — facteurs de sélection du meilleur chemin :**

```
BGP utilise des attributs pour sélectionner le meilleur chemin vers un préfixe.
Ordre de préférence (du plus au moins prioritaire) :

1. Weight (Cisco propriétaire) — Plus élevé = préféré
2. LOCAL_PREF — Plus élevé = préféré (décision locale à l'AS)
3. Origination (réseau local > redistribute > agrégé)
4. AS_PATH — Plus court = préféré
5. ORIGIN (IGP < EGP < INCOMPLETE)
6. MED (Multi-Exit Discriminator) — Plus bas = préféré
7. eBGP > iBGP
8. IGP metric to Next-Hop — Plus basse = préférée
9. Router-ID — Plus bas = préféré (départage final)

Moyen mnémotechnique : "We Love Oranges AS Oranges Mean Pure Refreshment"
W - Weight
L - Local_Pref
O - Originate (locally originated)
A - AS_Path
O - Origin
M - MED
P - Prefer eBGP over iBGP
R - IGP metric (Routing table)
R - Router-ID
```

---

## 2) Module — Configuration BGP avec FRRouting (2h)

### 📖 Narration/Intuition

La configuration BGP demande de la précision : chaque session est établie manuellement, chaque voisin (neighbor) est configuré explicitement avec son adresse IP et son ASN. BGP ne découvre pas automatiquement ses voisins — c'est délibéré pour garantir la sécurité du routage Internet.

### 🔍 Anatomie Technique

**Topologie de démonstration :**

```
AS 64512 (BCC Siège)          AS 64513 (BCC Agences)
   R1 (10.0.0.1)  ←── eBGP ───→ R2 (10.0.0.2)
   |                                    |
   LAN: 192.168.1.0/24           LAN: 192.168.2.0/24
   Lo0: 1.1.1.1/32               Lo0: 2.2.2.2/32
```

**Configuration BGP sur R1 (FRRouting) :**

```bash
# Accès à la CLI FRRouting
vtysh

# Configuration BGP sur R1 (AS 64512)
R1# configure terminal

R1(config)# router bgp 64512

! Identifiant BGP (IP stable, généralement loopback)
R1(config-router)# bgp router-id 1.1.1.1

! Désactiver la synchronisation (recommandé avec iBGP moderne)
R1(config-router)# no bgp synchronization

! Configurer le voisin eBGP (R2, AS 64513)
R1(config-router)# neighbor 10.0.0.2 remote-as 64513
R1(config-router)# neighbor 10.0.0.2 description "Routeur BCC Agences"

! Authentification MD5 de la session BGP (sécurité obligatoire en prod)
R1(config-router)# neighbor 10.0.0.2 password BCC_BGP_SECRET_2024

! Timer BGP (60s keepalive, 180s hold time)
R1(config-router)# neighbor 10.0.0.2 timers 60 180

! Annoncer les préfixes de cet AS dans BGP
R1(config-router)# address-family ipv4 unicast
R1(config-router-af)#   network 192.168.1.0/24    ! Annonce le LAN local
R1(config-router-af)#   network 1.1.1.1/32        ! Annonce la loopback
R1(config-router-af)#   neighbor 10.0.0.2 activate
R1(config-router-af)# exit-address-family

R1(config-router)# end
R1# write memory
```

**Configuration BGP sur R2 (AS 64513) :**

```bash
R2(config)# router bgp 64513
R2(config-router)# bgp router-id 2.2.2.2
R2(config-router)# neighbor 10.0.0.1 remote-as 64512
R2(config-router)# neighbor 10.0.0.1 password BCC_BGP_SECRET_2024
R2(config-router)# address-family ipv4 unicast
R2(config-router-af)#   network 192.168.2.0/24
R2(config-router-af)#   network 2.2.2.2/32
R2(config-router-af)#   neighbor 10.0.0.1 activate
R2(config-router-af)# exit-address-family
```

**Vérifications et diagnostics BGP :**

```bash
# Dans vtysh
R1# show bgp summary                         # État de toutes les sessions BGP
R1# show bgp neighbors                       # Détail complet d'un voisin
R1# show bgp neighbors 10.0.0.2 routes       # Routes reçues de ce voisin
R1# show bgp neighbors 10.0.0.2 advertised-routes  # Routes annoncées vers ce voisin
R1# show ip route bgp                        # Routes BGP dans la table de routage
R1# show bgp ipv4 unicast                    # Table BGP complète
R1# show bgp ipv4 unicast 192.168.2.0/24     # Détail d'un préfixe précis

# Debug BGP (attention : très verbeux en prod)
R1# debug bgp neighbor-events
R1# debug bgp updates
R1# undebug all    ! Désactiver TOUS les debugs après utilisation
```

---

## 3) Module — Manipulation des Attributs & Politiques BGP (2h)

### 📖 Narration/Intuition

BGP est un protocole de politique (Policy-Based Routing). La sélection du chemin ne se fait pas uniquement sur des métriques techniques — elle reflète des accords commerciaux entre opérateurs. Les route-maps permettent d'appliquer des politiques complexes sur les routes reçues et annoncées.

### 🔍 Anatomie Technique

**Manipulation de LOCAL_PREF (préférence interne à l'AS) :**

```bash
# Scénario : deux liens vers Internet (opérateur A et B)
# On préfère le lien vers l'opérateur A pour tout le trafic sortant

# Route-map : augmenter LOCAL_PREF pour les routes de l'opérateur A
R1(config)# route-map PREFER_ISP_A permit 10
R1(config-route-map)#  set local-preference 200

! Appliquer la route-map sur les routes reçues de l'opérateur A
R1(config)# router bgp 64512
R1(config-router)# neighbor 203.0.113.1 route-map PREFER_ISP_A in

! L'opérateur B garde LOCAL_PREF par défaut (100) → utilisé uniquement si A tombe
```

**Manipulation de AS_PATH (pour le trafic entrant) :**

```bash
# AS_PATH Prepending : allonger artificiellement le chemin AS pour déprioriser un lien
# Utile pour influencer le trafic ENTRANT dans notre AS

R1(config)# route-map SLOW_ISP_B permit 10
R1(config-route-map)#  set as-path prepend 64512 64512 64512
! Ajoute 3 fois notre ASN → les autres AS voient un chemin plus long → préfèrent ISP A

! Appliquer sur les annonces sortantes vers l'opérateur B
R1(config-router)# neighbor 203.0.113.5 route-map SLOW_ISP_B out
```

**Filtrage de préfixes (sécurité BGP) :**

```bash
# Prefix-list : autoriser/refuser des préfixes spécifiques
R1(config)# ip prefix-list ONLY_OUR_PREFIXES seq 10 permit 192.168.1.0/24
R1(config)# ip prefix-list ONLY_OUR_PREFIXES seq 20 permit 192.168.2.0/24
R1(config)# ip prefix-list ONLY_OUR_PREFIXES seq 99 deny 0.0.0.0/0 le 32

! Appliquer : n'annoncer QUE nos propres préfixes (éviter le route leak)
R1(config-router)# neighbor 203.0.113.1 prefix-list ONLY_OUR_PREFIXES out

# Filtrage des réseaux bogon (RFC 1918, 127.x, etc.) entrants
R1(config)# ip prefix-list BLOCK_BOGON seq 10 deny 10.0.0.0/8 le 32
R1(config)# ip prefix-list BLOCK_BOGON seq 20 deny 172.16.0.0/12 le 32
R1(config)# ip prefix-list BLOCK_BOGON seq 30 deny 192.168.0.0/16 le 32
R1(config)# ip prefix-list BLOCK_BOGON seq 99 permit 0.0.0.0/0 le 32
R1(config-router)# neighbor 203.0.113.1 prefix-list BLOCK_BOGON in
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **BGP** | Border Gateway Protocol — protocole de routage inter-AS d'Internet |
| **AS** | Autonomous System — système autonome, réseau sous une même administration |
| **ASN** | Autonomous System Number — numéro d'identification d'un AS |
| **eBGP** | External BGP — session BGP entre deux AS différents |
| **iBGP** | Internal BGP — session BGP au sein du même AS |
| **IXP** | Internet Exchange Point — point d'échange Internet (ex: RINEX en Afrique) |
| **NLRI** | Network Layer Reachability Information — préfixes annoncés dans BGP |
| **MED** | Multi-Exit Discriminator — attribut BGP influençant le trafic entrant |
| **NOC** | Network Operations Center — centre opérationnel réseau |
| **Route Leak** | Annonce BGP accidentelle de préfixes qui ne devraient pas être propagés |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** La BCC (AS 64512) est connectée à deux FAI : MTN (AS 37153, lien principal 1 Gbps) et Vodacom (AS 37594, lien de secours 100 Mbps). Comment configurer BGP pour préférer MTN pour le trafic sortant ?

**Corrigé :** Utiliser LOCAL_PREF. Sur le routeur de bord, appliquer une route-map `in` sur le voisin MTN qui set LOCAL_PREF à 200 (vs 100 par défaut pour Vodacom). Les routes avec LOCAL_PREF 200 seront préférées.

**Exercice 2 :** Expliquez pourquoi un opérateur doit filtrer les préfixes RFC 1918 (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) reçus de ses pairs BGP.

**Corrigé :** Ces espaces d'adressage sont réservés aux réseaux privés et ne doivent jamais être routés sur Internet public. Si un AS annonce accidentellement un préfixe RFC 1918 (route leak), et qu'un autre AS l'accepte, cela peut détourner du trafic interne vers Internet — une faille de sécurité et une source de dysfonctionnement grave.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** BGP est classifié comme un protocole de routage de type :
- A) Link-State (comme OSPF)
- B) Distance-Vector (comme RIP)
- C) Path-Vector (il transporte le chemin AS complet)
- D) Hybrid (comme EIGRP)

**Réponse : C** — BGP est un protocole Path-Vector : il transporte le chemin AS_PATH complet vers chaque préfixe.

**Q2 :** Quel attribut BGP est utilisé pour influencer le trafic SORTANT d'un AS ?
- A) MED (Multi-Exit Discriminator)
- B) AS_PATH Prepending
- C) LOCAL_PREF (Local Preference)
- D) ORIGIN

**Réponse : C** — LOCAL_PREF influence les décisions de routage internes à l'AS (trafic sortant). MED influence le trafic entrant.

**Q3 :** Pourquoi BGP n'utilise-t-il pas de découverte automatique des voisins (contrairement à OSPF) ?
- A) Pour économiser de la bande passante
- B) Pour des raisons de sécurité : seuls les voisins explicitement configurés et authentifiés peuvent établir une session BGP
- C) BGP ne supporte pas le multicast
- D) La RFC BGP impose cette limitation technique

**Réponse : B**

**Q4 :** Un routeur reçoit le préfixe 192.168.10.0/24 via deux chemins BGP : un avec AS_PATH "64513 64514" et un autre avec "64513 64515 64516". Lequel est préféré ?
- A) "64513 64515 64516" car plus de sauts = plus fiable
- B) "64513 64514" car AS_PATH plus court (2 AS vs 3 AS)
- C) Les deux chemins sont équivalents
- D) BGP choisit aléatoirement

**Réponse : B** — AS_PATH plus court = chemin préféré (moins de systèmes autonomes traversés).

**Q5 :** Le numéro d'AS 64512 est un AS de type :
- A) AS public (utilisable sur Internet)
- B) AS privé (réservé pour usage interne, non routable sur Internet)
- C) AS réservé IANA (non attribuable)
- D) AS AFRINIC exclusif

**Réponse : B** — La plage 64512-65535 (16 bits) est réservée aux AS privés, comme 192.168.x.x pour les IP.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
