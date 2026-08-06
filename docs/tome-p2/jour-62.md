# TOME P2 — Réseaux & Télécoms — Jour 62 (6h) : Routage Avancé & OSPF Multi-Zones (Multi-Area OSPF)

> [!NOTE]
> **Objectif du jour :** Comprendre et configurer OSPF en environnement multi-zones (Multi-Area OSPF), maîtriser le rôle des ABR, ASBR, la gestion des LSA et l'agrégation de routes. Ces compétences sont indispensables pour administrer des réseaux d'entreprise complexes comme ceux d'une banque centrale avec plusieurs sites.
>
> **Compétences visées :** `BIT-04` (A) — Routage Dynamique OSPF Multi-Zone

---

## 1) Module — OSPF Single-Area vs Multi-Area : Pourquoi Segmenter ? (2h)

### 📖 Narration/Intuition

Dans un réseau OSPF de grande taille avec 200 routeurs dans une seule zone (Area 0), chaque routeur doit stocker la carte topologique complète (LSDB — Link State Database) et recalculer le meilleur chemin (algorithme Dijkstra/SPF) à chaque changement de lien. 200 routeurs = 200 mises à jour à propager, 200 calculs SPF complets. Le réseau devient lent et la RAM des routeurs surchargée.

**La solution : segmenter en plusieurs zones (Areas)**. Les détails de chaque zone restent internes. Seuls les ABR (Area Border Routers) résument l'information vers le backbone (Area 0).

### 🔍 Anatomie Technique

**Hiérarchie OSPF Multi-Area :**

```
                    ┌────────────────────┐
                    │    Area 0          │
                    │   (Backbone)       │
                    │   R1 --- R2 --- R3 │
                    └──┬──────────────┬──┘
                       │              │
              ┌────────┤              ├────────┐
              │ABR     │              │    ABR │
         ┌────▼────┐   │         ┌───▼────┐   │
         │ Area 1  │   │         │ Area 2 │   │
         │ (Siège) │   │         │(Agences│   │
         │ R4, R5  │   │         │ R6, R7)│   │
         └─────────┘   │         └────────┘   │
                   ┌───▼────┐
                   │ Area 3 │
                   │  (DMZ) │
                   │  R8    │
                   └────────┘
```

**Types de zones OSPF :**

| Zone | Description | LSA Autorisées | Cas d'usage |
|:---:|:---|:---:|:---|
| **Backbone (Area 0)** | Obligatoire, interconnecte toutes les zones | All | Infrastructure centrale |
| **Standard** | Zone normale avec toutes les LSA | 1, 2, 3, 4, 5 | Zones d'entreprise classiques |
| **Stub** | Pas d'info de routage externe (LSA type 5 bloquées) | 1, 2, 3 | Sites avec une seule sortie |
| **Totally Stubby** | Stub + pas de LSA summary (type 3) | 1, 2 | Sites distants simples |
| **NSSA** | Stub qui accepte des routes externes limitées | 1, 2, 3, 7 | Sites avec connexion ISP locale |

**Types de routeurs OSPF :**

```
IR  — Internal Router    : tous ses liens dans une seule zone
BR  — Backbone Router    : au moins un lien dans Area 0
ABR — Area Border Router : liens dans plusieurs zones (incluant Area 0)
ASBR— AS Boundary Router : injecte des routes externes dans OSPF (redistribution)
```

---

## 2) Module — Configuration OSPF Multi-Area sous Linux (FRRouting) (2h)

### 📖 Narration/Intuition

**FRRouting (FRR)** est la suite de routage dynamique libre la plus utilisée sous Linux (fork de Quagga). Elle implémente OSPF, BGP, IS-IS, RIP et d'autres protocoles. C'est l'outil de référence pour simuler et déployer des routeurs OSPF sur des serveurs Linux.

### 🔍 Anatomie Technique

**Installation et configuration de base FRRouting :**

```bash
# Installation de FRRouting
curl -s https://deb.frrouting.org/frr/keys.gpg | gpg --dearmor > /etc/apt/trusted.gpg.d/frr.gpg
echo "deb https://deb.frrouting.org/frr $(lsb_release -s -c) frr-stable" > /etc/apt/sources.list.d/frr.list
apt update && apt install frr frr-pythontools

# Activer les démons OSPF et Zebra
nano /etc/frr/daemons
# Modifier : ospfd=yes, zebra=yes

systemctl enable --now frr

# Activer le forwarding IP (essentiel pour un routeur)
sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf

# Accès à la CLI FRRouting (VTY)
vtysh
```

**Configuration OSPF Multi-Area dans FRRouting (vtysh) :**

```
! ABR entre Area 0 et Area 1
! Interface eth0 vers Area 0, interface eth1 vers Area 1

Router-ABR# configure terminal
Router-ABR(config)# router ospf

! Router-ID OSPF (identifiant unique du routeur dans le domaine OSPF)
Router-ABR(config-router)# ospf router-id 10.0.0.1

! Annonce les réseaux avec leur zone
Router-ABR(config-router)# network 10.0.0.0/30 area 0    ! Lien vers Area 0
Router-ABR(config-router)# network 10.1.0.0/24 area 1    ! Réseau de Area 1
Router-ABR(config-router)# network 192.168.1.0/24 area 1 ! LAN Area 1

! Réduire la fréquence des recalculs SPF
Router-ABR(config-router)# timers throttle spf 50 200 5000

! Authentification OSPF (sécurité)
Router-ABR(config-router)# area 0 authentication message-digest

! Configurer l'interface pour l'auth MD5
Router-ABR(config)# interface eth0
Router-ABR(config-if)# ip ospf authentication message-digest
Router-ABR(config-if)# ip ospf message-digest-key 1 md5 BCC_OSPF_SECRET

! Configurer Area 1 en Stub (pas de routes externes)
Router-ABR(config-router)# area 1 stub

! Agrégation de routes sur l'ABR (résumer les préfixes de Area 1 vers Area 0)
Router-ABR(config-router)# area 1 range 192.168.0.0/22   ! Agrège 192.168.0-3.0/24

Router-ABR(config-router)# end
Router-ABR# write memory    ! Sauvegarder la configuration
```

**Redistribution de routes (ASBR) :**

```
! Sur un ASBR : injecter des routes statiques ou BGP dans OSPF
Router-ASBR(config)# router ospf
Router-ASBR(config-router)# redistribute static metric 20 metric-type 2
Router-ASBR(config-router)# redistribute connected
Router-ASBR(config-router)# default-information originate always metric 10
```

**Vérifications et diagnostics :**

```bash
# Dans vtysh
Router# show ip ospf                        # Statut général OSPF
Router# show ip ospf neighbor              # Adjacences OSPF établies
Router# show ip ospf database              # LSDB complète
Router# show ip ospf database summary      # LSA type 3 (inter-area)
Router# show ip ospf database external     # LSA type 5 (routes externes)
Router# show ip route ospf                 # Routes OSPF dans la table de routage

# Depuis le shell Linux
ip route show proto ospf                   # Routes OSPF apprises
journalctl -u frr -f                       # Logs FRRouting en temps réel
```

---

## 3) Module — Optimisation et Convergence OSPF (2h)

### 📖 Narration/Intuition

La **convergence OSPF** est le temps nécessaire au réseau pour s'adapter à un changement de topologie (panne de lien, nouveau routeur). Dans un environnement bancaire où chaque seconde d'indisponibilité est critique, optimiser la convergence est essentiel.

### 🔍 Anatomie Technique

**Timers OSPF et leur impact :**

```
Hello Timer : Intervalle d'envoi des paquets Hello (défaut: 10s LAN, 30s WAN)
Dead Timer  : Délai sans Hello avant de déclarer voisin mort (défaut: 4x Hello)

Réduction des timers pour convergence rapide :
! ATTENTION : Hello doit être identique sur les deux routeurs pour former une adjacence

Router(config-if)# ip ospf hello-interval 1    ! Hello toutes les secondes
Router(config-if)# ip ospf dead-interval 4     ! Mort si 4s sans Hello

! BFD (Bidirectional Forwarding Detection) : détection de panne en millisecondes
Router(config-if)# ip ospf bfd
Router(config)# bfd
Router(config-bfd)# peer 10.0.0.2 interface eth0

Optimisation SPF :
Router(config-router)# timers throttle spf 50 200 5000
! Délai initial 50ms, incrément 200ms, délai max 5000ms

Priorité DR/BDR (Designated Router sur LAN multiaccess) :
Router(config-if)# ip ospf priority 200   ! Plus haute priorité = devient DR
! Priority 0 = jamais DR/BDR
```

**Métriques OSPF et ajustement du cost :**

```
Cost OSPF = Référence de bande passante / Bande passante de l'interface

Référence par défaut : 100 Mbps
Lien 100 Mbps  → Cost = 100/100 = 1
Lien 1 Gbps    → Cost = 100/1000 = 0 (problème : tout arrondi à 1 !)

Solution : augmenter la référence de bande passante
Router(config-router)# auto-cost reference-bandwidth 10000  ! 10 Gbps référence
Lien 100 Mbps  → Cost = 10000/100  = 100
Lien 1 Gbps    → Cost = 10000/1000 = 10
Lien 10 Gbps   → Cost = 10000/10000 = 1

! Ou forcer le cost manuellement
Router(config-if)# ip ospf cost 50
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ABR** | Area Border Router — routeur à la frontière entre deux zones OSPF |
| **ASBR** | Autonomous System Boundary Router — routeur injectant des routes externes dans OSPF |
| **LSDB** | Link State Database — base de données de l'état des liens OSPF |
| **LSA** | Link State Advertisement — annonce de l'état d'un lien OSPF |
| **SPF** | Shortest Path First — algorithme Dijkstra utilisé par OSPF |
| **DR** | Designated Router — routeur désigné sur les réseaux multiaccess |
| **BDR** | Backup Designated Router — routeur désigné de secours |
| **BFD** | Bidirectional Forwarding Detection — détection rapide de panne de lien |
| **NSSA** | Not-So-Stubby Area — zone OSPF hybride acceptant des routes AS externes (LSA type 7) |
| **FRR** | FRRouting — suite de routage dynamique open-source pour Linux |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Calculez le cost OSPF d'un lien 10 Gbps si la référence de bande passante est configurée à 10000 Mbps.

**Corrigé :** Cost = 10000 / 10000 = **1**. Un lien 1 Gbps aurait un cost de 10000/1000 = **10**, ce qui permet de différencier correctement les liens 1 Gbps et 10 Gbps.

**Exercice 2 :** Un réseau a les zones OSPF suivantes : Area 0 (backbone), Area 1 (siège), Area 2 (agences distantes). Configurez Area 2 en Totally Stubby pour minimiser la taille de la LSDB sur les routeurs distants.

**Corrigé (sur l'ABR qui relie Area 0 et Area 2) :**
```
Router-ABR(config)# router ospf
Router-ABR(config-router)# area 2 stub no-summary
```
`no-summary` rend la zone "Totally Stubby" : plus de LSA type 3 (inter-area), seulement une route par défaut est injectée. Les routeurs de Area 2 ont une LSDB minimale.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle zone OSPF est obligatoire et sert de backbone pour toutes les autres zones ?
- A) Area 1
- B) Area 0
- C) Area 255
- D) Zone Backbone (numéro variable)

**Réponse : B**

**Q2 :** Un ABR (Area Border Router) est un routeur qui :
- A) Connecte uniquement le réseau OSPF à Internet
- B) A des interfaces dans plusieurs zones OSPF, incluant Area 0
- C) Calcule les routes BGP pour le domaine OSPF
- D) N'échange des Hello packets qu'avec les routeurs de Area 0

**Réponse : B**

**Q3 :** Pourquoi configurer une zone OSPF en "Stub" ?
- A) Pour augmenter la bande passante des liens
- B) Pour réduire la taille de la LSDB et les mises à jour OSPF en bloquant les LSA de routes externes (type 5)
- C) Pour activer l'authentification OSPF automatiquement
- D) Pour forcer tous les routeurs à devenir DR

**Réponse : B**

**Q4 :** Avec la référence de bande passante par défaut (100 Mbps), quel est le cost d'un lien 10 Gbps ?
- A) 100
- B) 10
- C) 1 (arrondi car < 1)
- D) 0,01

**Réponse : C** — C'est précisément le problème ! Tous les liens ≥ 100 Mbps ont un cost identique de 1, ce qui empêche OSPF de distinguer un lien 1 Gbps d'un 10 Gbps.

**Q5 :** Dans FRRouting, quelle commande affiche les adjacences OSPF établies ?
- A) `show ip route ospf`
- B) `show ip ospf database`
- C) `show ip ospf neighbor`
- D) `display ospf peer`

**Réponse : C**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
