# TOME P4 — Cloud, DevOps & SecOps — Jour 182 (6h) : Sécurité Réseau Avancée — Firewall Next-Gen, IDS/IPS, Zero Trust & Microsegmentation

> [!NOTE]
> **Objectif du jour :** Maîtriser les concepts avancés de la sécurité réseau en entreprise : **NGFW (Next-Generation Firewall)** avec inspection applicative (DPI), **IDS/IPS (Intrusion Detection/Prevention System)** basé sur les signatures et le comportement, le modèle **Zero Trust Network Access (ZTNA)**, et la **microsegmentation** réseau avec des politiques de sécurité granulaires.
>
> **Compétences visées :** `SEC-04` (A) — Sécurité Réseau Avancée NGFW & IDS/IPS | `SEC-06` (A) — Zero Trust Architecture

---

## 1) Module — NGFW vs Firewall Traditionnel & Inspection Profonde des Paquets (2h)

### 📖 Narration/Intuition

Un **Firewall Traditionnel (Stateful)** de génération précédente ne voit que les adresses IP et les ports. Il autorise `TCP 443` (HTTPS) sans pouvoir distinguer un navigateur légitime d'un tunnel de Command & Control malveillant encapsulé dans HTTPS.

Un **NGFW (Next-Generation Firewall)** opère à la couche 7 (Application) du modèle OSI. Il peut identifier les applications spécifiques (Zoom, Tor Browser, BitTorrent, Netflix), les utilisateurs (intégration Active Directory), et appliquer des politiques de sécurité basées sur le contenu, pas seulement les ports.

### 🔍 Anatomie Technique

**Comparaison Firewall Traditionnel vs NGFW :**

| Capacité | Firewall Stateful | NGFW |
|:---|:---:|:---:|
| Filtrage IP/Port | ✅ | ✅ |
| Suivi de l'état (Stateful) | ✅ | ✅ |
| Identification d'Application (L7) | ❌ | ✅ |
| Identification des Utilisateurs (LDAP/AD) | ❌ | ✅ |
| Inspection SSL/TLS (Déchiffrement) | ❌ | ✅ |
| IDS/IPS intégré | ❌ | ✅ |
| Antivirus/Anti-malware | ❌ | ✅ |
| URL Filtering & Catégorisation Web | ❌ | ✅ |
| Threat Intelligence (IoC) | ❌ | ✅ |

**Règles NGFW avec identification applicative (Palo Alto / Fortinet) :**

```
# Règle 1 : Autoriser le trafic Teams/Zoom pour les collaborateurs BCC
SOURCE:      Réseau-BCC-Users (172.16.0.0/12)
DESTINATION: Internet (Any)
APPLICATION: ms-teams, zoom, webex
USER:        LDAP/BCC-Users
ACTION:      ALLOW | LOG

# Règle 2 : Bloquer Tor et les proxies anonymisants
SOURCE:      Any
DESTINATION: Any
APPLICATION: tor, psiphon, ultrasurf, anonymizer
ACTION:      BLOCK | LOG | ALERT

# Règle 3 : Inspection SSL/TLS du trafic sortant (Déchiffrement MITM contrôlé)
# Le NGFW déchiffre le trafic HTTPS pour inspecter son contenu et re-chiffre avant livraison
SOURCE:      Réseau-BCC-Users
DESTINATION: Internet
SERVICE:     HTTPS (443)
INSPECTION:  SSL-Decrypt | Antivirus | URL-Filtering
ACTION:      ALLOW (si URL Category non bloquée)

# Règle 4 : DENY ALL implicite (Toujours en dernière règle)
SOURCE:      Any
DESTINATION: Any
APPLICATION: Any
ACTION:      BLOCK | LOG
```

---

## 2) Module — IDS/IPS (Suricata) & Détection d'Intrusions (2h)

### 📖 Narration/Intuition

Un **IDS (Intrusion Detection System)** analyse le trafic réseau et génère des alertes lorsqu'il détecte des signatures d'attaques connues (scan Nmap, exploitation de CVEs, communication C2). Un **IPS (Intrusion Prevention System)** va plus loin : il bloque activement le trafic malveillant en temps réel.

**Suricata** est l'IDS/IPS open-source de référence (utilisé par des gouvernements et des banques). Il peut analyser des **dizaines de gigabits par seconde** et détecter les attaques en utilisant des milliers de règles (Emerging Threats, Snort Rules).

### 🔍 Anatomie Technique

**Règles Suricata personnalisées pour la BCC (`bcc_rules.rules`) :**

```
# Règle 1 : Détection de scan Nmap (Port Scan) — Reconnaissance des serveurs BCC
alert tcp any any -> $BCC_SERVERS any (
    msg:"BCC-IDS-001 — Scan de ports détecté (Nmap TCP SYN Scan)";
    flags:S;
    threshold: type threshold, track by_src, count 20, seconds 5;
    classtype:network-scan;
    sid:1000001;
    rev:1;
)

# Règle 2 : Tentative d'exploitation SQLi dans les requêtes HTTP vers l'API BCC
alert http any any -> $BCC_API_SERVERS any (
    msg:"BCC-IDS-002 — Tentative d'Injection SQL dans la requête HTTP";
    flow:established,to_server;
    content:"UNION";
    http_uri;
    nocase;
    content:"SELECT";
    http_uri;
    nocase;
    distance:0;
    pcre:"/UNION.{1,20}SELECT/Ui";
    classtype:web-application-attack;
    sid:1000002;
    rev:1;
)

# Règle 3 : Détection de communication C2 (Command & Control) via DNS
alert dns any any -> any any (
    msg:"BCC-IDS-003 — Communication DNS C2 suspecte (DGA Domain)";
    dns.query;
    content:".onion";
    classtype:trojan-activity;
    sid:1000003;
    rev:1;
)

# Règle 4 : Transfert massif de données sortant (Data Exfiltration potentielle)
alert tcp $BCC_SERVERS any -> !$BCC_NETWORKS any (
    msg:"BCC-IDS-004 — Exfiltration de données potentielle (Volume anormal sortant)";
    flow:established;
    threshold: type both, track by_src, count 1, seconds 60;
    dsize:>50000;
    classtype:data-exfiltration;
    sid:1000004;
    rev:1;
)
```

---

## 3) Module — Zero Trust Architecture & Microsegmentation (2h)

### 📖 Narration/Intuition

Le modèle de sécurité réseau traditionnel est celui du château fort : une muraille infranchissable (Firewall périmétrique) et une zone de confiance absolue à l'intérieur. Le problème : si un attaquant franchit la muraille (ex: via un poste de travail compromis ou un VPN), il a accès libre à toute l'infrastructure interne.

**Zero Trust** est la philosophie inverse : **"Ne jamais faire confiance, toujours vérifier"** (*"Never Trust, Always Verify"*). Même à l'intérieur du réseau BCC, chaque utilisateur, appareil et service doit être authentifié et autorisé pour chaque ressource qu'il tente d'accéder.

### 🔍 Anatomie Technique

**Les 5 Piliers du Zero Trust (NIST SP 800-207) :**

```
PILIER 1 — IDENTITÉS VÉRIFIÉES
  └── MFA obligatoire pour tout accès
  └── Authentification forte (FIDO2/Passkeys, Certificats)
  └── Vérification continue (Session binding, Device Trust)

PILIER 2 — APPAREILS DE CONFIANCE
  └── MDM/EDR sur tous les endpoints (CrowdStrike, SentinelOne)
  └── Compliance Check avant accès (OS patché, AV actif, Disk Encrypted)

PILIER 3 — RÉSEAU SEGMENTÉ (Microsegmentation)
  └── Pas de "flat network" interne
  └── Chaque serveur/application dans son propre segment
  └── Communications inter-segments explicitement autorisées uniquement

PILIER 4 — APPLICATIONS & WORKLOADS
  └── WAF devant chaque API
  └── Service Mesh (Istio) avec mTLS inter-services
  └── Accès VPN-less via ZTNA (Cloudflare Access, Google BeyondCorp)

PILIER 5 — DONNÉES CLASSIFIÉES
  └── DLP (Data Loss Prevention)
  └── Chiffrement bout-en-bout (E2EE)
  └── Tokenisation des données sensibles (PAN, RIB, PIN)
```

**Microsegmentation avec Network Policies Kubernetes :**

```yaml
# NetworkPolicy — Autoriser uniquement le trafic entrant vers l'API BCC depuis le Load Balancer
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: bcc-api-ingress-policy
  namespace: bcc-production
spec:
  podSelector:
    matchLabels:
      app: bcc-api

  policyTypes:
  - Ingress
  - Egress

  ingress:
  # Autoriser uniquement depuis le Nginx Ingress Controller
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000

  egress:
  # Autoriser UNIQUEMENT les connexions vers PostgreSQL et Redis
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432

  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379

  # TOUS LES AUTRES FLUX SONT BLOQUÉS IMPLICITEMENT (Zero Trust Egress)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **NGFW** | Next-Generation Firewall — Pare-feu applicatif L7 avec inspection de contenu |
| **DPI** | Deep Packet Inspection — Inspection approfondie du contenu des paquets réseau |
| **IDS** | Intrusion Detection System — Système de détection d'intrusions (Alertes uniquement) |
| **IPS** | Intrusion Prevention System — Système de prévention d'intrusions (Blocage actif) |
| **ZTNA** | Zero Trust Network Access — Modèle d'accès sans périmètre de confiance implicite |
| **MDM** | Mobile Device Management — Gestion centralisée des appareils mobiles/endpoints |
| **EDR** | Endpoint Detection & Response — Détection et réponse aux menaces sur les postes de travail |
| **DGA** | Domain Generation Algorithm — Algorithme générant des domaines aléatoires pour les C2 malwares |
| **mTLS** | Mutual TLS — Authentification TLS mutuelle (Client ET Serveur présentent un certificat) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer comment un **NGFW** peut bloquer un malware qui utilise HTTPS (port 443) pour ses communications C2, ce qu'un firewall stateful classique ne peut pas faire.

**Corrigé :** Un **NGFW** intègre la capacité d'**inspection SSL/TLS (déchiffrement)** : il agit comme un MITM contrôlé, déchiffrant le trafic HTTPS entrant/sortant avec sa propre PKI interne, inspectant le contenu en clair via ses moteurs d'analyse (IPS, Antivirus, URL Filtering, Application ID), puis re-chiffrant et transmettant le trafic. De plus, même sans déchiffrement, le NGFW peut détecter les communications C2 par des indicateurs : (1) Analyse des domaines DNS via **Threat Intelligence** (IoC — domaines C2 connus), (2) Analyse des patterns TLS (JA3 fingerprint — signature TLS du client malveillant), (3) Identification de **DGA domains** (domaines générés algorithmiquement avec des patterns de caractères aléatoires inhabituels). Un firewall stateful traditionnel voit uniquement `TCP 443` et laisse passer sans distinction.

**Exercice 2 :** Dans le contexte du **Zero Trust**, qu'est-ce que la **microsegmentation** et en quoi est-elle radicalement différente du modèle de sécurité périmétrique traditionnel ?

**Corrigé :** Le modèle **périmétrique traditionnel** divise le réseau en deux zones : un réseau externe non-fiable (Internet) et un réseau interne fiable. Une fois à l'intérieur, un utilisateur ou un malware peut se déplacer librement vers n'importe quel serveur interne (Lateral Movement). La **microsegmentation** applique une isolation granulaire au niveau workload/service : chaque application, serveur ou pod K8s est dans son propre micro-périmètre avec des règles de communication explicites. La politique par défaut est **Deny-All** (aucun flux autorisé sauf ceux explicitement définis). Même si un attaquant compromet un serveur web, il ne peut pas atteindre directement les serveurs de base de données car les flux sont bloqués par la Network Policy. Cette approche s'appelle aussi **East-West Security** (trafic interne) par opposition au **North-South** (trafic périmétrique).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la capacité fondamentale qui distingue un **NGFW** d'un firewall **Stateful** traditionnel ?
- A) L'identification des applications et utilisateurs (Couche 7 OSI) avec inspection du contenu des paquets (DPI)
- B) La capacité à gérer plus de règles de filtrage
- C) La vitesse de traitement des paquets uniquement
- D) La gestion de plusieurs interfaces réseau

**Réponse : A**

**Q2 :** Quelle est la philosophie centrale du modèle **Zero Trust Network Access (ZTNA)** ?
- A) "Never Trust, Always Verify" — Ne jamais accorder de confiance implicite basée sur la localisation réseau, toujours authentifier et autoriser chaque accès
- B) Faire confiance à tous les utilisateurs sur le réseau interne
- C) Utiliser uniquement des VPNs pour sécuriser les accès
- D) Bloquer tout le trafic entrant par défaut uniquement

**Réponse : A**

**Q3 :** Quelle est la différence de comportement entre un **IDS** et un **IPS** lors de la détection d'une attaque réseau ?
- A) L'IDS génère uniquement une alerte (mode passif) ; l'IPS bloque activement le trafic malveillant en temps réel (mode actif)
- B) L'IDS bloque le trafic ; l'IPS génère des alertes
- C) L'IDS et l'IPS sont des synonymes
- D) L'IDS analyse uniquement les logs ; l'IPS analyse uniquement les paquets

**Réponse : A**

**Q4 :** Dans une Network Policy Kubernetes appliquant le Zero Trust, quel est le comportement par défaut pour les flux réseau non explicitement autorisés ?
- A) Tous les flux sont bloqués implicitement (Default Deny-All) — seuls les flux explicitement définis dans la NetworkPolicy sont autorisés
- B) Tous les flux sont autorisés par défaut
- C) Seul le trafic HTTPS est autorisé par défaut
- D) Les flux intra-namespace sont autorisés, seul l'inter-namespace est bloqué

**Réponse : A**

**Q5 :** Qu'est-ce que le **mTLS (Mutual TLS)** et dans quel contexte est-il utilisé dans une architecture microservices ?
- A) Authentification TLS mutuelle où Client ET Serveur présentent chacun un certificat X.509 valide. Utilisé dans les Service Meshes (Istio, Linkerd) pour authentifier les communications inter-services
- B) TLS version 2 amélioré
- C) Un protocole de chiffrement des données au repos
- D) Multi-Tenant Load Balancer System

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
