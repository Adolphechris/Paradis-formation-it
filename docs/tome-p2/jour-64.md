# TOME P2 — Réseaux & Télécoms — Jour 64 (6h) : Qualité de Service (QoS) Réseau

> [!NOTE]
> **Objectif du jour :** Maîtriser les concepts et la mise en œuvre de la Qualité de Service (QoS) réseau : classification, marquage (DSCP/CoS), gestion de la congestion (CBWFQ, LLQ) et mise en forme du trafic (Shaping/Policing). Dans une banque centrale, la QoS garantit que les transactions financières critiques ne sont jamais dégradées par le trafic bureautique.
>
> **Compétences visées :** `BIT-04` (A) — Qualité de Service Réseau

---

## 1) Module — Fondamentaux QoS & Modèles (2h)

### 📖 Narration/Intuition

Sans QoS, un réseau traite tous les paquets de manière identique — un email et une transaction SWIFT ont la même priorité. En période de congestion, les deux sont retardés aléatoirement. Pour une banque centrale comme la BCC, cela est inacceptable : la voix sur IP (conférence du Gouverneur), les transactions interbancaires RTGS et les transferts de fichiers bureautiques doivent être servis selon leurs priorités respectives.

**La QoS permet de garantir des SLA (Service Level Agreements) réseau pour les services critiques.**

### 🔍 Anatomie Technique

**Modèles QoS :**

```
1. Best Effort (Aucune QoS)
   → Tous les paquets traités à égalité
   → Pas de garantie de débit, latence ou gigue
   → Défaut sur la plupart des réseaux non configurés

2. IntServ (Integrated Services - RFC 1633)
   → Réservation de ressources fin-à-fin (RSVP)
   → Garanties strictes par flux
   → Ne scale pas : chaque routeur doit maintenir l'état de chaque flux
   → Utilisé uniquement sur de petits réseaux ou liens critiques

3. DiffServ (Differentiated Services - RFC 2474) ← STANDARD MODERNE
   → Classification par classe de trafic (PHB - Per-Hop Behavior)
   → Marquage des paquets (DSCP dans l'en-tête IP)
   → Chaque routeur applique sa politique locale selon le marquage
   → Scale très bien : stateless, pas de réservation par flux
```

**DSCP — Differentiated Services Code Point :**

```
Le champ DSCP occupe les 6 premiers bits du champ ToS (Type of Service) IPv4
(ou Traffic Class IPv6). 6 bits = 64 valeurs possibles.

Classes DiffServ standardisées :
┌──────────────────────────────────────────────────────────────┐
│ PHB        │ DSCP  │ Valeur │ Usage typique                  │
├──────────────────────────────────────────────────────────────┤
│ Default(BE)│ CS0   │   0    │ Best Effort (trafic par défaut)│
│ EF         │ EF    │  46    │ Voix IP (VoIP), latence < 10ms │
│ CS5        │ CS5   │  40    │ Signalisation voix             │
│ AF41       │ AF41  │  34    │ Vidéoconférence haute qualité  │
│ AF21       │ AF21  │  18    │ Données critiques (RTGS/SWIFT) │
│ AF11       │ AF11  │  10    │ Streaming vidéo                │
│ CS1        │ CS1   │   8    │ Scavenger (P2P, updates auto)  │
└──────────────────────────────────────────────────────────────┘

AF (Assured Forwarding) : AFxy
  x = classe (1-4), y = probabilité de drop (1=faible, 2=moyen, 3=élevé)
  Ex : AF41 = classe 4, faible probabilité de drop
```

**CoS (Class of Service) — Marquage Couche 2 (Ethernet 802.1p) :**

```
Le champ PCP (Priority Code Point) dans l'en-tête 802.1Q (VLAN)
3 bits = valeurs 0-7 (CoS 0 à CoS 7)

CoS 7 : Contrôle réseau (OSPF, BGP, spanning tree)
CoS 6 : Contrôle réseau
CoS 5 : VoIP (voix)
CoS 4 : Vidéo
CoS 3 : Données critiques
CoS 2 : Données importantes
CoS 1 : Données normales
CoS 0 : Best Effort (défaut)

Correspondance CoS ↔ DSCP (mapping) :
CoS 5 (VoIP) ↔ DSCP EF (46)
CoS 4 (Vidéo) ↔ DSCP AF41 (34)
CoS 3 (Données critiques) ↔ DSCP AF21 (18)
```

---

## 2) Module — Classification, Marquage & Files d'Attente (2h)

### 📖 Narration/Intuition

La QoS fonctionne en 3 étapes : **classifier** le trafic (identifier sa catégorie), **marquer** les paquets (DSCP/CoS), puis **appliquer des politiques** de files d'attente. La classification se fait le plus tôt possible dans le réseau (au niveau de l'accès), le marquage est alors respecté par tous les équipements du réseau.

### 🔍 Anatomie Technique

**Classification et marquage sous Linux avec tc (Traffic Control) :**

```bash
# tc (Traffic Control) est l'outil Linux de QoS
# Il agit via des qdisc (queuing disciplines), classes et filtres

# Vérifier les paramètres QoS actuels d'une interface
tc qdisc show dev eth0
tc class show dev eth0
tc filter show dev eth0

# ─── Exemple 1 : Prioriser la VoIP (UDP 5060/5061 SIP + RTP 10000-20000) ───

# 1. Attacher un qdisc HTB (Hierarchical Token Bucket) à eth0
tc qdisc add dev eth0 root handle 1: htb default 30

# 2. Créer la classe parente (capacité totale : 1 Gbps)
tc class add dev eth0 parent 1: classid 1:1 htb rate 1000mbit

# 3. Créer les sous-classes QoS
# Classe priorité haute : VoIP (EF) - 100 Mbps garantis, 200 Mbps max
tc class add dev eth0 parent 1:1 classid 1:10 htb rate 100mbit ceil 200mbit prio 1

# Classe priorité moyenne : données critiques RTGS - 400 Mbps garantis
tc class add dev eth0 parent 1:1 classid 1:20 htb rate 400mbit ceil 800mbit prio 2

# Classe best effort : trafic ordinaire - 100 Mbps garantis
tc class add dev eth0 parent 1:1 classid 1:30 htb rate 100mbit ceil 1000mbit prio 3

# 4. Ajouter des qdisc feuilles (SFQ pour le fair queueing)
tc qdisc add dev eth0 parent 1:10 handle 10: sfq perturb 10
tc qdisc add dev eth0 parent 1:20 handle 20: sfq perturb 10
tc qdisc add dev eth0 parent 1:30 handle 30: sfq perturb 10

# 5. Classification par marquage DSCP
# DSCP EF (46 = 0x2E, champ DSCP = 0xB8 dans ToS) → classe VoIP
tc filter add dev eth0 parent 1: protocol ip handle 0xb8 fw classid 1:10

# Classification par port SIP (UDP 5060)
tc filter add dev eth0 parent 1: protocol ip prio 1 u32 \
    match ip protocol 17 0xff \
    match ip dport 5060 0xffff \
    classid 1:10

# Classification trafic RTGS (port TCP 3389 dans notre exemple)
tc filter add dev eth0 parent 1: protocol ip prio 2 u32 \
    match ip protocol 6 0xff \
    match ip dport 443 0xffff \
    match ip dst 10.0.50.0/24 \
    classid 1:20
```

**Marquage DSCP avec iptables/nftables :**

```bash
# Marquer les paquets VoIP avec DSCP EF (46)
iptables -t mangle -A POSTROUTING -p udp --dport 5060 -j DSCP --set-dscp 46
iptables -t mangle -A POSTROUTING -p udp --dport 5061 -j DSCP --set-dscp 46

# Marquer le trafic RTGS/SWIFT avec DSCP AF21 (18)
iptables -t mangle -A POSTROUTING -d 10.0.50.0/24 -p tcp --dport 443 -j DSCP --set-dscp 18

# Avec nftables (moderne)
nft add table ip mangle
nft add chain ip mangle POSTROUTING '{ type filter hook postrouting priority mangle; }'
nft add rule ip mangle POSTROUTING udp dport 5060 ip dscp set ef
nft add rule ip mangle POSTROUTING tcp dport 443 ip dscp set af21

# Vérifier le marquage DSCP avec tcpdump
tcpdump -i eth0 -v udp port 5060 | grep "tos"
```

---

## 3) Module — Shaping, Policing & CAKE (2h)

### 📖 Narration/Intuition

**Traffic Shaping** (mise en forme) ralentit le trafic qui dépasse un seuil en le mettant en file d'attente. Le trafic n'est pas perdu, juste retardé. **Traffic Policing** (contrôle) supprime les paquets qui dépassent un seuil — pas de mise en file, juste du drop. CAKE (Common Applications Kept Enhanced) est l'algorithme moderne recommandé sous Linux.

### 🔍 Anatomie Technique

**Limitation de bande passante (Shaping) avec tc CAKE :**

```bash
# CAKE est l'algorithme QoS moderne recommandé (Linux kernel 4.19+)
# Il combine shaping, fair queueing et AQM (Active Queue Management) en un seul qdisc

# Limiter un lien à 100 Mbps avec CAKE
tc qdisc add dev eth1 root cake bandwidth 100mbit

# Configuration CAKE complète pour un lien WAN asymétrique
tc qdisc add dev eth1 root cake \
    bandwidth 100mbit \
    besteffort \           # Mode sans classes différenciées (simple)
    nat \                  # Aware du NAT pour un meilleur flow isolation
    wash                   # Efface les marquages DSCP entrants non fiables

# CAKE avec priorités DiffServ (mode diffserv4 = 4 classes)
tc qdisc add dev eth1 root cake \
    bandwidth 100mbit \
    diffserv4              # 4 classes : bulk, best-effort, video, voice

# Vérification CAKE
tc -s qdisc show dev eth1    # Statistiques détaillées (paquets, bytes, drops)

# Policing : limiter et dropper les paquets qui dépassent le seuil
tc qdisc add dev eth0 root handle 1: prio
tc filter add dev eth0 parent 1: protocol ip prio 1 u32 \
    match ip dst 0.0.0.0/0 \
    police rate 50mbit burst 100k drop \    # Drop si > 50 Mbps
    flowid 1:1
```

**Configuration QoS complète pour un site bancaire :**

```bash
#!/bin/bash
# Script QoS pour interface WAN (eth0) - BCC Agence
# Liens : 100 Mbps upload, asymétrique

WAN_IF="eth0"
WAN_BW="100mbit"

# Nettoyage de la config précédente
tc qdisc del dev $WAN_IF root 2>/dev/null

# Attacher HTB root
tc qdisc add dev $WAN_IF root handle 1: htb default 40

# Classe racine = capacité totale
tc class add dev $WAN_IF parent 1: classid 1:1 htb rate $WAN_BW

# Classes par priorité
tc class add dev $WAN_IF parent 1:1 classid 1:10 htb rate 10mbit  ceil 100mbit prio 1  # VoIP
tc class add dev $WAN_IF parent 1:1 classid 1:20 htb rate 50mbit  ceil 100mbit prio 2  # RTGS/SWIFT
tc class add dev $WAN_IF parent 1:1 classid 1:30 htb rate 30mbit  ceil 100mbit prio 3  # Applicatif
tc class add dev $WAN_IF parent 1:1 classid 1:40 htb rate 10mbit  ceil 100mbit prio 4  # Best Effort

# Filtres basés sur DSCP
tc filter add dev $WAN_IF parent 1: handle 46 fw classid 1:10   # DSCP EF → VoIP
tc filter add dev $WAN_IF parent 1: handle 18 fw classid 1:20   # DSCP AF21 → RTGS

echo "QoS configurée sur $WAN_IF"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **QoS** | Quality of Service — Qualité de Service réseau |
| **DSCP** | Differentiated Services Code Point — marquage QoS dans l'en-tête IP |
| **CoS** | Class of Service — marquage QoS dans l'en-tête Ethernet 802.1Q |
| **ToS** | Type of Service — ancien champ IPv4 (remplacé par DSCP/ECN) |
| **EF** | Expedited Forwarding — classe DSCP pour la VoIP (latence stricte) |
| **AF** | Assured Forwarding — famille de classes DSCP (AF11 à AF43) |
| **PHB** | Per-Hop Behavior — comportement QoS appliqué à chaque nœud |
| **HTB** | Hierarchical Token Bucket — algorithme de classification/shaping Linux |
| **CAKE** | Common Applications Kept Enhanced — algorithme QoS moderne Linux |
| **SLA** | Service Level Agreement — accord de niveau de service |
| **RTGS** | Real-Time Gross Settlement — système de paiement interbancaire en temps réel |
| **SWIFT** | Society for Worldwide Interbank Financial Telecommunication — réseau bancaire international |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle valeur DSCP faut-il utiliser pour marquer le trafic VoIP ? Quel est l'équivalent CoS ?

**Corrigé :** DSCP EF (valeur décimale 46, hexadécimal 0x2E). CoS 5 est l'équivalent en couche 2 (802.1p).

**Exercice 2 :** Expliquez la différence entre Traffic Shaping et Traffic Policing pour une liaison WAN de 100 Mbps limitée à 50 Mbps.

**Corrigé :** Avec le **Shaping**, si le trafic dépasse 50 Mbps, les paquets excédentaires sont mis en file d'attente et envoyés dès que la capacité est disponible — le trafic est retardé mais non perdu. Avec le **Policing**, les paquets excédant 50 Mbps sont immédiatement **supprimés (dropped)** — plus de latence ajoutée, mais des paquets perdus, ce qui peut provoquer des retransmissions TCP.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Un paquet UDP avec DSCP EF a quelle priorité par rapport à un paquet TCP avec DSCP BE (Best Effort) ?
- A) Identique — DSCP n'a pas d'effet sur la priorité
- B) Plus basse — UDP est moins fiable que TCP
- C) Plus élevée — DSCP EF est la classe de plus haute priorité (VoIP)
- D) Cela dépend de la configuration du routeur

**Réponse : C** (sur un équipement QoS configuré)

**Q2 :** Quel modèle QoS utilise RSVP pour réserver des ressources fin-à-fin ?
- A) DiffServ
- B) Best Effort
- C) IntServ
- D) DSCP

**Réponse : C**

**Q3 :** Combien de classes de trafic sont possibles avec DSCP ?
- A) 8 (3 bits)
- B) 16 (4 bits)
- C) 64 (6 bits)
- D) 256 (8 bits)

**Réponse : C** — DSCP = 6 bits = 64 valeurs possibles (0 à 63).

**Q4 :** La technique HTB (Hierarchical Token Bucket) permet de :
- A) Créer un VPN chiffré entre deux sites
- B) Organiser le trafic en classes hiérarchiques avec des débits garantis et des plafonds
- C) Filtrer les paquets selon leur adresse MAC
- D) Annoter les paquets BGP avec des attributs de préférence

**Réponse : B**

**Q5 :** Dans un réseau bancaire, quel type de trafic doit avoir la PLUS HAUTE priorité QoS ?
- A) Navigation web des employés
- B) Mises à jour Windows automatiques
- C) Transactions RTGS et VoIP du conseil d'administration
- D) Streaming YouTube depuis les bureaux

**Réponse : C**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
