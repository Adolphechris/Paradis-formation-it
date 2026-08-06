# TOME P2 — Réseaux & Télécoms — Jour 65 (6h) : Réseaux Sans-Fil & Sécurité Wi-Fi Enterprise

> [!NOTE]
> **Objectif du jour :** Maîtriser les normes Wi-Fi modernes (802.11ax/Wi-Fi 6), les architectures d'entreprise (WLC, APs légers, CAPWAP), et la sécurité Wi-Fi niveau enterprise : WPA3-Enterprise, 802.1X/EAP-TLS, serveur RADIUS et segmentation par SSID/VLAN.
>
> **Compétences visées :** `BIT-04` (A) — Réseaux Sans-Fil | `SEC-04` (A) — Sécurité Wi-Fi Enterprise

---

## 1) Module — Architecture Wi-Fi Enterprise & Normes IEEE 802.11 (2h)

### 📖 Narration/Intuition

Un réseau Wi-Fi domestique est géré par un seul routeur/AP. Dans une institution comme la BCC avec des dizaines de bâtiments et centaines d'employés, ce modèle est ingérable. L'**architecture centralisée Wi-Fi Enterprise** déporte toute l'intelligence vers un **WLC (Wireless LAN Controller)** : les APs deviennent "légers" (Lightweight APs), ils délèguent toutes les décisions au WLC via le protocole CAPWAP.

### 🔍 Anatomie Technique

**Normes IEEE 802.11 :**

| Norme | Nom | Bande | Débit Max Théorique | Technologie Clé |
|:---:|:---:|:---:|:---:|:---|
| 802.11g | Wi-Fi 3 | 2.4 GHz | 54 Mbps | OFDM |
| 802.11n | Wi-Fi 4 | 2.4/5 GHz | 600 Mbps | MIMO 4x4 |
| 802.11ac | Wi-Fi 5 | 5 GHz | 6.9 Gbps | MU-MIMO, 160 MHz |
| **802.11ax** | **Wi-Fi 6** | 2.4/5 GHz | **9.6 Gbps** | **OFDMA, BSS Coloring, TWT** |
| 802.11be | Wi-Fi 7 | 2.4/5/6 GHz | 46 Gbps | MLO, 320 MHz |

**Technologies clés Wi-Fi 6 (802.11ax) :**

```
OFDMA (Orthogonal Frequency-Division Multiple Access) :
  - Découpe chaque canal en sous-canaux (RU - Resource Units)
  - Permet de servir plusieurs clients SIMULTANÉMENT dans le même canal
  - Réduit drastiquement la latence en environnement dense (open-space, salle de conf)

BSS Coloring :
  - Identifie les trames d'autres BSS (Basic Service Sets) dans la même zone
  - Permet d'ignorer les trames d'autres réseaux sans attendre
  - Augmente l'efficacité spectrale dans les environnements denses

TWT (Target Wake Time) :
  - Le point d'accès planifie les moments de réveil des clients
  - Économie d'énergie IoT considérable
  - Réduit la consommation des appareils mobiles

MU-MIMO (Multi-User MIMO) :
  - 802.11ac : 4 clients simultanés en downlink
  - 802.11ax : 8 clients simultanés en uplink ET downlink
```

**Architecture Wi-Fi Enterprise : APs légers + WLC :**

```
                    ┌─────────────────┐
                    │   WLC           │
                    │ (Wireless LAN   │
                    │  Controller)    │
                    │ - Politique QoS │
                    │ - Auth 802.1X   │
                    │ - SSID/VLAN mgmt│
                    │ - Roaming inter-│
                    │   AP (seamless) │
                    └────────┬────────┘
                             │ CAPWAP tunnel (UDP 5246/5247)
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │  AP 1    │  │  AP 2    │  │  AP 3    │
        │ (Bâtiment│  │ (Open-   │  │ (Salle   │
        │  A)      │  │  Space)  │  │  Serveur)│
        └──────────┘  └──────────┘  └──────────┘
        SSID: BCC-Staff               SSID: BCC-Mgmt
        VLAN: 100                     VLAN: 200
        SSID: BCC-Guest
        VLAN: 300 (isolé)

CAPWAP (Control And Provisioning of Wireless Access Points) :
  - Plan de contrôle : UDP 5246 (gestion, configuration, statistiques)
  - Plan de données : UDP 5247 (trafic utilisateur encapsulé)
```

---

## 2) Module — Sécurité Wi-Fi : WPA3 & 802.1X/EAP-TLS (2h)

### 📖 Narration/Intuition

**WPA2-PSK** (mot de passe partagé) est adapté au domicile, mais catastrophique en entreprise : si un seul employé divulgue le mot de passe, tout le réseau est compromis. Changer le mot de passe nécessite de reconfigurer TOUS les appareils de l'organisation.

**WPA3-Enterprise avec 802.1X** résout ce problème : chaque employé s'authentifie avec **ses propres identifiants** (certificat, login/mot de passe d'entreprise via Active Directory). Si un employé quitte la BCC, on désactive son compte — sans toucher aux autres.

### 🔍 Anatomie Technique

**Protocoles d'authentification EAP (Extensible Authentication Protocol) :**

| Méthode EAP | Authentification Client | Authentification Serveur | Sécurité |
|:---:|:---:|:---:|:---:|
| EAP-MD5 | Password | Aucune | ❌ Faible |
| LEAP (Cisco) | Password | Aucune | ❌ Obsolète |
| EAP-TLS | Certificat X.509 | Certificat X.509 | ✅ Très forte |
| PEAP-MSCHAPv2 | Password AD | Certificat serveur | ✅ Bonne |
| EAP-TTLS/PAP | Password AD | Certificat serveur | ✅ Bonne |

**Architecture 802.1X — Les 3 acteurs :**

```
Supplicant               Authenticator          Authentication Server
(Client Wi-Fi)           (AP ou Switch)         (Serveur RADIUS)
    │                         │                       │
    │── EAPOL-Start ──────────→│                       │
    │                         │── RADIUS Access-Req ──→│
    │←─ EAP-Identity Req ─────│                       │
    │── EAP-Identity Resp ────→│── RADIUS Access-Req ──→│
    │                         │                       │ [EAP-TLS ou PEAP]
    │←─ EAP-TLS Negotiate ────│←─ RADIUS Challenge ───│
    │── Certificate / Creds ──→│── RADIUS Access-Req ──→│
    │                         │                       │ Vérification
    │                         │←─ RADIUS Access-Accept ─│
    │←─ EAP-Success ──────────│                       │
    │═══════ Trafic autorisé ══│                       │
    (VLAN dynamique attribué par RADIUS)
```

**Implémentation RADIUS avec FreeRADIUS :**

```bash
# Installation de FreeRADIUS
apt install freeradius freeradius-utils

# Structure des fichiers de configuration FreeRADIUS
# /etc/freeradius/3.0/
# ├── clients.conf      → Liste des clients RADIUS (APs, switches)
# ├── users             → Utilisateurs locaux (test)
# ├── mods-enabled/     → Modules activés
# └── sites-enabled/    → Sites (default, inner-tunnel pour PEAP)

# Configuration d'un client RADIUS (AP ou WLC)
cat >> /etc/freeradius/3.0/clients.conf << 'EOF'
client WLC_BCC {
    ipaddr = 10.0.10.50        # IP du WLC
    secret = BCC_RADIUS_SECRET_2024
    shortname = wlc-bcc
    nas_type = cisco
}
EOF

# Ajouter un utilisateur de test
cat >> /etc/freeradius/3.0/users << 'EOF'
jean.mbeki Cleartext-Password := "MotDePasseTest123"
    Reply-Message = "Bienvenue Jean Mbeki - BCC Wi-Fi"
EOF

# Tester la configuration
freeradius -X   # Mode debug (affiche tout)
# ou
systemctl restart freeradius && systemctl status freeradius

# Test d'authentification (depuis la ligne de commande)
radtest jean.mbeki MotDePasseTest123 localhost 0 testing123
# Réponse attendue : Access-Accept
```

**Configuration EAP-TLS (certificats mutuels) :**

```bash
# Génération des certificats avec les outils FreeRADIUS
cd /etc/freeradius/3.0/certs/

# Générer le CA racine RADIUS
make ca

# Générer le certificat serveur RADIUS
make server

# Générer un certificat client pour un employé
make client    # Modifiez /etc/freeradius/3.0/certs/client.cnf avant

# Configurer EAP-TLS dans FreeRADIUS
nano /etc/freeradius/3.0/mods-available/eap
# Dans la section "tls-config tls-common" :
#   private_key_file = ${certdir}/server.pem
#   certificate_file = ${certdir}/server.pem
#   CA_file = ${cadir}/ca.pem

# Intégration Active Directory (LDAP) pour authentification PEAP-MSCHAPv2
apt install freeradius-ldap
nano /etc/freeradius/3.0/mods-available/ldap
# server = 'ad.bcc.cd'
# identity = 'CN=radius,OU=Services,DC=bcc,DC=cd'
# password = 'RadiusServicePwd'
# base_dn = 'DC=bcc,DC=cd'
```

---

## 3) Module — Segmentation Wi-Fi par VLAN & Réseau Invité (2h)

### 📖 Narration/Intuition

Même avec WPA3-Enterprise, un employé compromis pourrait attaquer d'autres appareils sur le même réseau Wi-Fi. La **segmentation par VLAN** isole les différentes populations d'utilisateurs : staff, management, IoT, et invités ont des réseaux séparés avec des politiques de firewall distinctes.

### 🔍 Anatomie Technique

**Configuration d'un AP Linux (hostapd) avec VLAN dynamiques :**

```bash
# hostapd : démon de point d'accès Wi-Fi sous Linux

apt install hostapd

# Configuration WPA2/WPA3 Enterprise (PEAP/EAP-TLS)
cat > /etc/hostapd/hostapd.conf << 'EOF'
interface=wlan0
driver=nl80211
ssid=BCC-Staff
hw_mode=a                      # 5 GHz
channel=36
ieee80211n=1                   # 802.11n
ieee80211ac=1                  # 802.11ac (Wi-Fi 5)
wmm_enabled=1                  # QoS Wi-Fi (WMM)
country_code=CD                # Code pays Congo

# Authentification WPA2/WPA3 Enterprise
wpa=2
wpa_key_mgmt=WPA-EAP SAE-EXT-KEY  # WPA2+WPA3 mixed
ieee8021x=1
auth_algs=1

# Serveur RADIUS pour 802.1X
auth_server_addr=10.0.10.100
auth_server_port=1812
auth_server_shared_secret=BCC_RADIUS_SECRET_2024

acct_server_addr=10.0.10.100
acct_server_port=1813
acct_server_shared_secret=BCC_RADIUS_SECRET_2024

# VLAN dynamique selon l'attribut RADIUS Tunnel-Private-Group-ID
dynamic_vlan=1
vlan_file=/etc/hostapd/vlan
vlan_tagged_interface=eth0

# PMF (Protected Management Frames) - obligatoire WPA3
ieee80211w=2
EOF

# Fichier de mapping VLAN
cat > /etc/hostapd/vlan << 'EOF'
1  eth0.100    # VLAN 100 = Staff
2  eth0.200    # VLAN 200 = Management
3  eth0.300    # VLAN 300 = Guest
EOF

systemctl enable --now hostapd

# Sur le serveur RADIUS, configurer l'attribution de VLAN par utilisateur
# Dans /etc/freeradius/3.0/users :
# jean.mbeki Cleartext-Password := "..."
#     Tunnel-Type = VLAN,
#     Tunnel-Medium-Type = IEEE-802,
#     Tunnel-Private-Group-ID = "100"
```

**Réseau Invité isolé — Captive Portal :**

```bash
# Le réseau invité doit être complètement isolé du réseau interne

# Schéma de segmentation :
# SSID: BCC-Staff   → VLAN 100 → Accès intranet complet
# SSID: BCC-Mgmt    → VLAN 200 → Accès intranet + DC
# SSID: BCC-Guest   → VLAN 300 → Internet uniquement (isolé du LAN)
# SSID: BCC-IoT     → VLAN 400 → IOT isolé, port 443 vers serveur de gestion seulement

# Règles nftables pour isoler le VLAN Guest (300)
nft add rule ip filter FORWARD iifname "vlan300" oifname "eth0.100" drop   # Guest → Staff : BLOQUÉ
nft add rule ip filter FORWARD iifname "vlan300" oifname "eth0.200" drop   # Guest → Mgmt : BLOQUÉ
nft add rule ip filter FORWARD iifname "vlan300" oif "wan0" accept         # Guest → Internet : OK

# Configuration nodogsplash (captive portal léger)
apt install nodogsplash
systemctl enable --now nodogsplash
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **WLC** | Wireless LAN Controller — contrôleur de réseau sans-fil centralisé |
| **AP** | Access Point — point d'accès Wi-Fi |
| **CAPWAP** | Control And Provisioning of Wireless Access Points — protocole de gestion des APs légers |
| **SSID** | Service Set Identifier — nom de réseau Wi-Fi |
| **BSSID** | Basic Service Set Identifier — adresse MAC de l'AP |
| **EAP** | Extensible Authentication Protocol — protocole d'authentification extensible |
| **RADIUS** | Remote Authentication Dial-In User Service — serveur d'authentification centralisé |
| **WPA** | Wi-Fi Protected Access — protocole de sécurité Wi-Fi |
| **PMF** | Protected Management Frames — protection des trames de gestion Wi-Fi (802.11w) |
| **OFDMA** | Orthogonal Frequency-Division Multiple Access — technologie Wi-Fi 6 multi-utilisateurs |
| **MU-MIMO** | Multi-User Multiple Input Multiple Output — antennes multi-utilisateurs simultanés |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle méthode EAP est recommandée pour une entreprise dont les clients n'ont pas de certificat personnel mais ont un compte Active Directory ?

**Corrigé :** **PEAP-MSCHAPv2** (Protected EAP avec MSCHAPv2). Le client utilise son login/mot de passe AD, le serveur s'authentifie avec un certificat. C'est la méthode la plus courante en entreprise Microsoft.

**Exercice 2 :** Expliquez pourquoi il faut activer PMF (Protected Management Frames) sur un réseau Wi-Fi d'entreprise.

**Corrigé :** Sans PMF, un attaquant peut envoyer des trames de gestion falsifiées (Deauthentication) pour déconnecter de force tous les clients du réseau (attaque de déni de service Wi-Fi). PMF chiffre et authentifie les trames de gestion, rendant cette attaque impossible.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans une architecture Wi-Fi Enterprise avec WLC, quel protocole encapsule le trafic entre l'AP léger et le WLC ?
- A) MPLS
- B) CAPWAP (UDP 5246/5247)
- C) GRE
- D) PPTP

**Réponse : B**

**Q2 :** Quelle méthode d'authentification Wi-Fi est recommandée pour une entreprise avec une PKI et des certificats pour chaque employé ?
- A) WPA2-PSK (mot de passe partagé)
- B) WEP (Wired Equivalent Privacy)
- C) EAP-TLS (certificats X.509 mutuels)
- D) MAC Filtering uniquement

**Réponse : C**

**Q3 :** Wi-Fi 6 (802.11ax) introduit OFDMA. Quel avantage principal apporte cette technologie ?
- A) Doublement de la portée du signal Wi-Fi
- B) Permettre à plusieurs clients d'utiliser le canal simultanément en sous-canaux dédiés (RUs)
- C) Chiffrement WPA3 automatique
- D) Élimination des interférences entre bandes 2.4 et 5 GHz

**Réponse : B**

**Q4 :** Le serveur RADIUS dans une architecture 802.1X joue le rôle de :
- A) Point d'accès Wi-Fi maître
- B) Authentificateur (Authenticator) qui bloque/autorise les connexions
- C) Serveur d'authentification qui vérifie les identités et délivre les autorisations
- D) Concentrateur VPN pour les connexions Wi-Fi

**Réponse : C**

**Q5 :** Pourquoi doit-on segmenter le réseau Wi-Fi Invité (Guest) du réseau interne via des VLANs séparés ?
- A) Pour augmenter la vitesse Wi-Fi des invités
- B) Pour réduire les coûts de licence AP
- C) Pour empêcher les invités d'accéder aux ressources internes et isoler leur trafic
- D) Les VLANs n'ont aucune relation avec la sécurité Wi-Fi

**Réponse : C**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
