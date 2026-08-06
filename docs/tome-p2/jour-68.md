# TOME P2 — Réseaux & Télécoms — Jour 68 (6h) : Infrastructure WAN & SD-WAN

> [!NOTE]
> **Objectif du jour :** Comprendre les technologies WAN traditionnelles (MPLS, IPsec) et les principes du SD-WAN (Software-Defined WAN) — son architecture, ses avantages par rapport au WAN classique, l'orchestration centralisée et le routage dynamique selon la qualité de lien. Contexte : connectivité multi-sites de la BCC.
>
> **Compétences visées :** `BIT-04` (A) — Architecture WAN & SD-WAN

---

## 1) Module — Technologies WAN Traditionnelles (2h)

### 📖 Narration/Intuition

La **Banque Centrale du Congo** dispose de dizaines d'agences réparties à Kinshasa, Lubumbashi, Goma, Matadi, Bukavu. Comment relier ces sites de manière sécurisée et fiable ? Historiquement, les entreprises utilisaient des liaisons MPLS louées à des opérateurs télécom. Aujourd'hui, le SD-WAN révolutionne cette approche en permettant d'utiliser n'importe quelle connexion (MPLS, 4G/5G, ADSL, fibre) avec une intelligence centralisée.

### 🔍 Anatomie Technique

**MPLS (Multiprotocol Label Switching) :**

```
MPLS est une technique de commutation rapide basée sur des étiquettes (labels)
plutôt que sur des adresses IP. Les paquets IP entrants reçoivent un label
MPLS à l'entrée du réseau de l'opérateur, et sont commutés rapidement
de bout en bout sans routing IP à chaque saut.

┌──────────────────────────────────────────────────────────────┐
│                 Réseau MPLS Opérateur (MTN)                  │
│                                                              │
│  PE1 ──── P1 ──── P2 ──── PE2                                │
│  (Provider Edge)   (Provider Core)   (Provider Edge)        │
└──────────────────────────────────────────────────────────────┘
 ┌──────┐   Label 100 →    ← Label 200   ┌──────┐
 │ BCC  │ ← VPN MPLS L3 → Routage sur  │ BCC  │
 │Siège │    tables VRF    l'étiquette   │Agence│
 └──────┘                               └──────┘

Avantages MPLS :
✓ QoS garantie (SLA avec l'opérateur)
✓ Latence prévisible
✓ Isolation des clients (VRF - Virtual Routing and Forwarding)
✓ Pas de gestion de chiffrement (réseau opérateur privé)

Inconvénients MPLS :
✗ Coût très élevé (x5 à x10 vs Internet)
✗ Délais de provisioning longs (semaines à mois)
✗ Capacités limitées (souvent 10-100 Mbps)
✗ Peu flexible pour le cloud (trafic SaaS sort en backhauling)
```

**VPN IPsec Site-to-Site :**

```bash
# IPsec offre une alternative économique à MPLS :
# tunnels chiffrés sur Internet public

# Phases d'établissement IPsec :
# Phase 1 (IKE - Internet Key Exchange) : échange des clés, authentification
# Phase 2 (IPsec SA) : paramètres de chiffrement du trafic

# Installation strongSwan (IPsec Linux)
apt install strongswan strongswan-pki libcharon-extra-plugins

# Configuration site-to-site (fichier /etc/ipsec.conf)
cat > /etc/ipsec.conf << 'EOF'
config setup
    charondebug="all"
    uniqueids=yes

conn BCC-Siege-Lubumbashi
    type=tunnel
    auto=start
    left=196.x.x.x           # IP publique du Siège (Kinshasa)
    leftid=@bcc-siege
    leftsubnet=10.0.1.0/24   # LAN Siège
    right=196.y.y.y           # IP publique Agence Lubumbashi
    rightid=@bcc-lubumbashi
    rightsubnet=10.0.2.0/24  # LAN Lubumbashi
    
    # Paramètres IKEv2 (Phase 1)
    keyexchange=ikev2
    ike=aes256-sha256-modp2048!
    
    # Paramètres ESP (Phase 2 - chiffrement du trafic)
    esp=aes256-sha256!
    
    # Authentification PSK (Pre-Shared Key)
    authby=secret
EOF

# Clé partagée dans /etc/ipsec.secrets
echo "196.x.x.x 196.y.y.y : PSK 'SuperSecretKey_BCC_2024!'" >> /etc/ipsec.secrets

# Démarrer et vérifier
systemctl enable --now strongswan-starter
ipsec status               # État des tunnels
ipsec statusall            # Détail complet
ipsec up BCC-Siege-Lubumbashi   # Monter le tunnel manuellement
ipsec down BCC-Siege-Lubumbashi # Abaisser le tunnel

# Ping à travers le tunnel VPN IPsec
ping 10.0.2.1    # Machine dans le LAN Lubumbashi
```

**Comparaison des technologies WAN :**

| Critère | MPLS | VPN IPsec | SD-WAN |
|:---:|:---:|:---:|:---:|
| **Coût** | ❌ Très élevé | ✅ Faible | ✅ Moyen |
| **Sécurité** | ⚠ Réseau privé | ✅ Chiffré | ✅ Chiffré |
| **QoS garantie** | ✅ SLA opérateur | ❌ Best effort | ✅ Avec transport multiples |
| **Flexibilité** | ❌ Rigide | ⚠ Moyenne | ✅ Très élevée |
| **Temps d'activation** | ❌ Semaines | ✅ Heures | ✅ Heures |
| **Gestion centralisée** | ❌ Par tunnel | ❌ Par tunnel | ✅ Orchestrateur central |
| **Multi-transport** | ❌ Non | ❌ Non | ✅ MPLS+4G+Fibre simultanés |

---

## 2) Module — Principes du SD-WAN (2h)

### 📖 Narration/Intuition

**SD-WAN** (Software-Defined WAN) applique les principes du SDN (Software-Defined Networking) au WAN : séparer le plan de contrôle (décisions de routage) du plan de données (forwarding des paquets). Un **orchestrateur central** connaît la qualité de chaque lien en temps réel (latence, gigue, perte de paquets) et route dynamiquement le trafic critique sur le meilleur lien disponible.

### 🔍 Anatomie Technique

**Architecture SD-WAN :**

```
                    ┌─────────────────────────────┐
                    │   SD-WAN Orchestrator        │
                    │   (Plan de contrôle)         │
                    │                              │
                    │ - Politique centralisée       │
                    │ - Monitoring de qualité lien  │
                    │ - Distribution des routes     │
                    │ - Gestion des certificats     │
                    └─────────────┬───────────────┘
                                  │ HTTPS/TLS (port 443)
           ┌──────────────────────┼──────────────────────┐
           ▼                      ▼                      ▼
    ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
    │ vEdge/CPE   │       │ vEdge/CPE   │       │ vEdge/CPE   │
    │ BCC Siège   │       │ BCC Agence  │       │ BCC Lubumb. │
    │             │       │ Kinshasa    │       │             │
    │ ┌─────────┐ │       │ ┌─────────┐ │       │ ┌─────────┐ │
    │ │MPLS 100M│ │       │ │Fibre 50M│ │       │ │4G LTE   │ │
    │ │Fibre 1G │ │       │ │4G 20M   │ │       │ │VSAT     │ │
    │ └─────────┘ │       │ └─────────┘ │       │ └─────────┘ │
    └─────────────┘       └─────────────┘       └─────────────┘

Flux de trafic SD-WAN :
- RTGS/SWIFT → toujours sur le lien avec la plus basse latence
- Vidéoconf   → sur le lien avec la meilleure gigue (jitter)
- Email/Web   → sur le lien le moins coûteux (Internet direct)
- Backup      → sur le lien résiduel (seulement si disponible)
```

**Simulation SD-WAN avec Linux (solution open-source : VyOS) :**

```bash
# VyOS est un OS réseau open-source basé sur Debian
# Il supporte SD-WAN, BGP, OSPF, IPsec, VRRP, QoS

# Installation de VyOS (image ISO ou VM)
# https://vyos.io/

# Configuration SD-WAN basique sur VyOS (policy-based routing)
# Accès à la CLI VyOS
vyos@vyos:~$ configure

# Définir les interfaces WAN
set interfaces ethernet eth0 description "MPLS 100Mbps"
set interfaces ethernet eth1 description "Fibre Internet 1Gbps"
set interfaces ethernet eth2 description "4G LTE 20Mbps"

# Créer des tables de routage distinctes pour chaque lien
set protocols static table 100 route 0.0.0.0/0 next-hop 196.x.x.1 metric 10  # MPLS
set protocols static table 200 route 0.0.0.0/0 next-hop 196.y.y.1 metric 20  # Fibre
set protocols static table 300 route 0.0.0.0/0 next-hop 196.z.z.1 metric 30  # 4G

# Policy-based routing : RTGS sur MPLS, reste sur Fibre
set policy route RTGS-TRAFFIC rule 10 source address 10.0.0.0/24
set policy route RTGS-TRAFFIC rule 10 destination address 0.0.0.0/0
set policy route RTGS-TRAFFIC rule 10 set table 100   # → Table MPLS

# Appliquer la politique sur l'interface LAN
set interfaces ethernet eth3 policy route RTGS-TRAFFIC

commit; save
```

---

## 3) Module — WAN Quality Monitoring & Failover (2h)

### 📖 Narration/Intuition

Le vrai avantage du SD-WAN est sa capacité à mesurer en continu la qualité de chaque lien WAN et à basculer automatiquement le trafic en cas de dégradation — sans intervention humaine, en quelques centaines de millisecondes.

### 🔍 Anatomie Technique

**Surveillance continue de la qualité des liens WAN (Linux) :**

```bash
#!/bin/bash
# Script de monitoring WAN multi-liens pour la BCC
# Mesure latence, gigue et perte de paquets sur chaque lien

declare -A LIENS=(
    ["MPLS"]="8.8.8.8"          # Sonde via le lien MPLS
    ["FIBRE"]="1.1.1.1"         # Sonde via le lien Fibre
    ["4G"]="208.67.222.222"      # Sonde via le lien 4G
)

# Seuils de qualité (SLA internes BCC)
SEUIL_LATENCE=50       # ms — si > 50ms, lien dégradé
SEUIL_PERTE=2          # %  — si > 2%, lien dégradé
SEUIL_GIGUE=10         # ms — si > 10ms, VoIP compromise

check_lien() {
    local NOM=$1
    local CIBLE=$2
    
    # Mesure latence et perte avec fping
    RESULTAT=$(fping -q -e -p 100 -c 10 "$CIBLE" 2>&1)
    # Ex sortie: "8.8.8.8 : xmt/rcv/%loss = 10/10/0%, min/avg/max = 5.4/5.8/6.2"
    
    PERTE=$(echo "$RESULTAT" | grep -oP '\d+(?=%)' | head -1)
    LATENCE=$(echo "$RESULTAT" | grep -oP 'avg = \K[\d.]+')
    
    # Évaluation
    if [ "${PERTE:-100}" -gt "$SEUIL_PERTE" ] || \
       [ "$(echo "$LATENCE > $SEUIL_LATENCE" | bc -l 2>/dev/null)" = "1" ]; then
        STATUS="DÉGRADÉ"
        # Envoyer une alerte SNMP trap
        snmptrap -v2c -c public 10.0.10.200 "" linkDown
    else
        STATUS="OK"
    fi
    
    echo "[$NOM] $CIBLE → Latence: ${LATENCE:-N/A}ms | Perte: ${PERTE:-100}% | $STATUS"
}

while true; do
    echo "=== Surveillance WAN BCC $(date) ==="
    for NOM in "${!LIENS[@]}"; do
        check_lien "$NOM" "${LIENS[$NOM]}"
    done
    echo ""
    sleep 30  # Vérification toutes les 30 secondes
done
```

**Failover automatique avec ip route et monitoring :**

```bash
# Scénario : le lien MPLS tombe → basculer automatiquement sur la Fibre

# Script de failover automatique
#!/bin/bash
MPLS_GW="196.x.x.1"
FIBRE_GW="196.y.y.1"
TEST_IP="8.8.8.8"

while true; do
    # Tester le lien MPLS
    if ping -c 3 -W 2 -I eth0 $TEST_IP > /dev/null 2>&1; then
        # MPLS OK : route principale via MPLS (metric plus basse)
        if ! ip route show | grep -q "default via $MPLS_GW metric 10"; then
            ip route del default via $FIBRE_GW metric 10 2>/dev/null
            ip route add default via $MPLS_GW metric 10
            ip route add default via $FIBRE_GW metric 20  # Backup
            logger "WAN FAILBACK : MPLS restauré → route principale MPLS"
        fi
    else
        # MPLS KO : basculer sur la Fibre
        if ip route show | grep -q "default via $MPLS_GW metric 10"; then
            ip route del default via $MPLS_GW metric 10
            ip route change default via $FIBRE_GW metric 10
            logger "WAN FAILOVER : MPLS DOWN → basculement sur FIBRE"
        fi
    fi
    sleep 10
done
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MPLS** | Multiprotocol Label Switching — commutation réseau opérateur par étiquettes |
| **SD-WAN** | Software-Defined WAN — WAN piloté par logiciel |
| **SDN** | Software-Defined Networking — réseau défini par logiciel |
| **CPE** | Customer Premises Equipment — équipement côté client (ex: vEdge) |
| **VRF** | Virtual Routing and Forwarding — table de routage virtuelle isolée |
| **IKE** | Internet Key Exchange — protocole d'échange de clés pour IPsec |
| **ESP** | Encapsulating Security Payload — chiffrement du payload IPsec |
| **AH** | Authentication Header — authentification IPsec (sans chiffrement) |
| **PE** | Provider Edge — routeur de l'opérateur côté client |
| **P** | Provider — routeur cœur de réseau de l'opérateur |
| **VSAT** | Very Small Aperture Terminal — connexion Internet par satellite |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la principale limitation du WAN MPLS traditionnel qui explique la migration vers le SD-WAN dans les entreprises avec beaucoup de SaaS ?

**Corrigé :** Le **backhauling** : avec MPLS, tout le trafic SaaS (Microsoft 365, Salesforce) doit remonter au siège social via MPLS avant de sortir sur Internet. Avec des milliers d'utilisateurs en agences, cela crée des goulets d'étranglement au siège et augmente la latence pour les applications cloud. Le SD-WAN permet le **local internet breakout** : le trafic SaaS sort directement sur Internet depuis l'agence, sans passer par le siège.

**Exercice 2 :** Citez 3 métriques utilisées par un SD-WAN pour évaluer la qualité d'un lien WAN.

**Corrigé :** Latence (RTT), gigue (jitter = variation de la latence), et taux de perte de paquets (packet loss). Des métriques additionnelles incluent : disponibilité (uptime), bande passante disponible, MOS (Mean Opinion Score) pour la VoIP.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est l'avantage principal du SD-WAN par rapport à une architecture WAN classique avec des tunnels VPN IPsec statiques ?
- A) SD-WAN est moins sécurisé car il n'utilise pas de chiffrement
- B) SD-WAN gère dynamiquement le routage en fonction de la qualité des liens et peut utiliser plusieurs transports simultanément
- C) SD-WAN ne supporte pas MPLS
- D) SD-WAN remplace complètement le protocole IP

**Réponse : B**

**Q2 :** Dans une configuration IPsec, quelle est la différence entre la Phase 1 (IKE) et la Phase 2 (IPsec SA) ?
- A) La Phase 1 chiffre le trafic, la Phase 2 authentifie les parties
- B) La Phase 1 établit un canal sécurisé pour négocier la Phase 2 (authentification des pairs + échange de clés Diffie-Hellman) ; la Phase 2 définit les paramètres de chiffrement du trafic réel
- C) Les deux phases font exactement la même chose
- D) La Phase 2 est optionnelle en IPsec

**Réponse : B**

**Q3 :** Pourquoi le SD-WAN est-il plus adapté qu'une liaison MPLS pour les entreprises utilisant beaucoup de services SaaS (Microsoft 365, Zoom) ?
- A) MPLS ne supporte pas les services SaaS
- B) Le SD-WAN permet le routage direct vers Internet (local breakout) sans backhauling vers le siège
- C) MPLS est toujours plus rapide que le SD-WAN
- D) Le SD-WAN garantit des SLA réseau supérieurs

**Réponse : B**

**Q4 :** VRF (Virtual Routing and Forwarding) est utilisé dans MPLS pour :
- A) Chiffrer les données client
- B) Isoler les tables de routage de différents clients sur les mêmes équipements opérateurs
- C) Mesurer la qualité des liens WAN
- D) Déployer des politiques QoS sur les interfaces PE

**Réponse : B**

**Q5 :** Un lien WAN SD-WAN affiche : latence 120ms, gigue 25ms, perte 0.5%. Quel type d'application sera le plus impacté ?
- A) Transfert de fichiers FTP (best effort)
- B) Email SMTP
- C) VoIP (voix sur IP) — très sensible à la latence et la gigue
- D) Backup nocturne

**Réponse : C** — La VoIP est très sensible à la latence (>150ms = mauvaise qualité) et à la gigue (>30ms = décrochages). 120ms de latence et 25ms de gigue peuvent dégrader la qualité vocale.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
