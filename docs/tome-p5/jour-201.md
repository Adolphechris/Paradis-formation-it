# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 201 (6h) : Méthodologies d'Ethical Hacking & Reconnaissance (OSINT, Shodan, Nmap Avancé & Cartographie d'Attaque)

> [!NOTE]
> **Objectif du jour :** Maîtriser la première phase essentielle d'un test d'intrusion (Pentest) et d'une opération Red Team : la **Reconnaissance passive et active (OSINT)**. Apprendre à cartographier la surface d'attaque d'une organisation à l'aide d'outils spécialisés (**Shodan, Censys, Amass, Recon-ng**), utiliser **Nmap** de manière avancée (scans furtifs, scripts NSE), et élaborer une matrice d'attaque basée sur le framework **MITRE ATT&CK**.
>
> **Compétences visées :** `SEC-06` (A) — Reconnaissance OSINT & Scan Nmap Avancé | `SEC-04` (A) — Surface Attack Mapping & MITRE ATT&CK

---

## 1) Module — Reconnaissance Passive & OSINT (Open Source Intelligence) (2h)

### 📖 Narration/Intuition

Avant d'envoyer le moindre paquet réseau vers la cible, un hacker éthique (ou un attaquant réel) récolte des informations publiques disponibles sur Internet sans jamais toucher directement les serveurs de la victime. C'est la **Reconnaissance Passive (OSINT)**.

Pour la Banque Centrale du Congo (BCC), l'OSINT permet d'identifier : les sous-domaines oubliés, les adresses IP publiques exposées, les adresses email des collaborateurs (pour le phishing), les technologies utilisées (via les en-têtes HTTP ou les profils LinkedIn des ingénieurs), et les fuites de identifiants sur le Dark Web.

### 🔍 Anatomie Technique

**Phases de la Reconnaissance OSINT :**

```
 ┌────────────────────────────────────────────────────────┐
 │           1. ENUMÉRATION DES SOUS-DOMAINES             │
 │  - Outils : Amass, Subfinder, Assetfinder              │
 │  - Sources : Certificate Transparency Logs (crt.sh)    │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │           2. RECHERCHE D'ASSETS EXPOSÉS                │
 │  - Shodan.io / Censys.io (Moteurs de recherche IoT)    │
 │  - Dorks Google (filetype:pdf "confidentiel" bcc.cd)  │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │           3. HARVESTING D'EMAILS & IDENTITÉS           │
 │  - TheHarvester, Hunter.io, LinkedIn Scraping          │
 │  - Recherche de fuites de mots de passe (HaveIBeenPwned)│
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │           4. CARTOGRAPHIE DE LA SURFACE D'ATTAQUE      │
 │  - Définition de l'arbre d'attaque (Attack Tree)       │
 └────────────────────────────────────────────────────────┘
```

**Commandes OSINT Clés :**

```bash
# 1. Énumération des sous-domaines via Certificate Transparency (crt.sh)
curl -s "https://crt.sh/?q=%.bcc.cd&output=json" | jq -r '.[].name_value' | sort -u

# 2. Utilisation d'Amass pour une énumération OSINT complète
amass enum -passive -d bcc.cd -o subdomains_bcc.txt

# 3. Recherche Shodan via l'API CLI (Recherche de serveurs exposés BCC)
shodan search --fields ip_str,port,org,hostnames "org:'Banque Centrale du Congo'"

# 4. Collection d'emails et d'IPs avec theHarvester
theHarvester -d bcc.cd -b google,bing,crtsh,dnsdumpster -l 500 -f harvester_results
```

---

## 2) Module — Reconnaissance Active & Nmap Avancé (2h)

### 📖 Narration/Intuition

La **Reconnaissance Active** implique d'interagir directement avec les systèmes cibles en leur envoyant des paquets réseau. **Nmap (Network Mapper)** est l'outil ultime de découverte réseau et de balayage de ports.

Un pentesteur expérimenté n'utilise pas Nmap avec des options par défaut. Il maîtrise la différence entre un scan TCP Connect (`-sT`), un scan SYN Stealth (`-sS`), et sait utiliser le moteur de scripts **NSE (Nmap Scripting Engine)** pour détecter les vulnérabilités sans déclencher immédiatement les alarmes des IDS/IPS cibles.

### 🔍 Anatomie Technique

**Comparaison des Types de Scans Nmap :**

| Type de Scan | Option | Fonctionnement | Discrétion |
|:---|:---:|:---|:---:|
| **TCP SYN (Stealth)** | `-sS` | Envoie SYN ──► Reçoit SYN-ACK ──► Envoie RST (Connexion non établie) | 🟡 Furtif (Pas de log applicatif) |
| **TCP Connect** | `-sT` | Handshake TCP 3-way complet (SYN ──► SYN-ACK ──► ACK) | 🔴 Non furtif (Journalisé dans les OS) |
| **UDP Scan** | `-sU` | Envoie paquet UDP ──► Reçoit ICMP Port Unreachable si fermé | 🔴 Lent et sujet au rate-limiting |
| **FIN / NULL / Xmas** | `-sF/-sN/-sX` | Envoie paquets avec flags inhabituels pour contourner les pare-feu | 🟢 Contourne certains firewalls stateless |

**Commandes Nmap Avancées & Scripts NSE :**

```bash
# 1. Scan Furtif TCP SYN complet sur les 65535 ports avec détection de version et OS
sudo nmap -sS -sV -O -p- --min-rate 1000 -T4 -oA nmap_full_scan 192.168.1.50

# 2. Scan de vulnérabilités ciblé avec les scripts NSE (Category: vuln)
nmap -sV --script vuln -p 80,443,22,3389 192.168.1.50 -oN nmap_vuln_report.txt

# 3. Contournement de Firewall (Fragmentation de paquets + Evitement par IP leurre)
sudo nmap -sS -f --mtu 16 -D RND:10 -g 53 -p 80,443 192.168.1.50

# Explication des options de contournement :
#  -f / --mtu 16 : Fragmente les paquets en petits morceaux de 16 octets (Bypass IDS)
#  -D RND:10     : Génère 10 adresses IP leurres (Decoys) pour masquer la vraie IP
#  -g 53         : Utilise le port source 53 (DNS) souvent autorisé par les pare-feu
```

---

## 3) Module — Matrice MITRE ATT&CK & Cartographie de la Surface d'Attaque (2h)

### 📖 Narration/Intuition

Le framework **MITRE ATT&CK** est la base de connaissances mondiale des tactiques, techniques et procédures (TTPs) utilisées par les cyberattaquants réels. La phase de reconnaissance correspond à la tactique **TA0043 (Reconnaissance)** dans la matrice ATT&CK Enterprise.

### 🛠️ Atelier Pratique

**Cartographie de la Surface d'Attaque d'une Institution Financière (Matrice ATT&CK) :**

```markdown
# SURFACE ATTACK REPORT — BANQUE BCC
## PHASE 1 : RECONNAISSANCE (MITRE ATT&CK TA0043)

### TACTIQUES & TECHNIQUES DÉTECTÉES :

1. **T1596 — Search Open Technical Databases**
   - 12 sous-domaines publics identifiés via crt.sh
   - 2 serveurs VPN Fortinet identifiés sur Shodan (Firmware non patché)

2. **T1589 — Gather Victim Identity Information**
   - 45 adresses email d'employés collectées via LinkedIn/theHarvester
   - Format standard d'email identifié : `p.nom@bcc.cd`

3. **T1595 — Active Scanning**
   - Port 443 (HTTPS) et Port 8443 (Panneau d'administration Admin) ouverts
   - Service SSH (OpenSSH 7.4) exposé directement sur IP publique (Obsolète — CVE-2018-15473)

### RECOMMANDATIONS DE REMÉDIATION IMMÉDIATE (Blue Team)
- 🔒 **R-01** : Masquer le panneau d'admin 8443 derrière un VPN avec MFA.
- 🔒 **R-02** : Mettre à jour OpenSSH vers la dernière version stable et désactiver l'authentification par mot de passe.
- 🔒 **R-03** : Configurer la politique CloudFlare / WAF pour bloquer le scan des scanners publics (Shodan/Censys).
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OSINT** | Open Source Intelligence — Renseignement d'origine source ouverte |
| **NSE** | Nmap Scripting Engine — Moteur de scripts Lua intégré à Nmap |
| **MITRE ATT&CK** | Adversarial Tactics, Techniques, and Common Knowledge — Référentiel mondial des TTPs d'attaque |
| **TTPs** | Tactics, Techniques and Procedures — Méthodes comportementales des attaquants |
| **RST** | Reset — Paquet TCP indiquant la fermeture immédiate d'une connexion |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence majeure entre un scan Nmap **TCP SYN (`-sS`)** et un scan **TCP Connect (`-sT`)**, et pourquoi le scan SYN est-il qualifié de "furtif" (stealth) ?

**Corrigé :** Le scan **TCP Connect (`-sT`)** réalise le Handshake TCP 3-way complet (SYN ──► SYN-ACK ──► ACK). Le système d'exploitation cible établit formellement la connexion et informe l'application qui journalise l'événement dans ses logs d'accès. Le scan **TCP SYN (`-sS`)** envoie un paquet SYN, reçoit le SYN-ACK de la cible (prouvant que le port est ouvert), puis envoie immédiatement un paquet **RST** pour détruire la connexion avant que le Handshake ne soit complété. Comme la connexion TCP n'a jamais été formellement établie, la plupart des applications et des OS ne journalisent pas la tentative dans leurs logs applicatifs, rendant le scan beaucoup plus furtif.

**Exercice 2 :** Dans le framework MITRE ATT&CK, quelle est la distinction entre une **Tactique** et une **Technique** ?

**Corrigé :** Une **Tactique** représente le **"Pourquoi"** ou l'objectif tactique de l'attaquant à un moment donné de l'attaque (ex: *TA0043 — Reconnaissance*, *TA0001 — Initial Access*, *TA0006 — Credential Access*). Une **Technique** représente le **"Comment"**, c'est-à-dire le moyen technique précis utilisé pour atteindre cet objectif (ex: sous la tactique Reconnaissance, la technique *T1595 — Active Scanning* ou *T1596 — Search Open Technical Databases*).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la caractéristique principale d'une recherche **OSINT (Open Source Intelligence)** ?
- A) Elle collecte des informations publiquement accessibles sans interagir directement ni illégalement avec les systèmes cibles
- B) Elle nécessite l'installation d'un malware sur la cible
- C) Elle s'exécute uniquement depuis le terminal Linux
- D) Elle est réservée aux gouvernements

**Réponse : A**

**Q2 :** Quel moteur de recherche spécialisé permet aux pentesteurs d'identifier des serveurs, webcams et équipements IoT exposés sur Internet sans envoyer de requêtes directement à la cible ?
- A) Shodan
- B) Google uniquement
- C) DuckDuckGo
- D) Wikipedia

**Réponse : A**

**Q3 :** Quelle option Nmap permet d'exécuter des scripts automatisés (NSE) pour détecter les vulnérabilités connues sur les services découverts ?
- A) `--script vuln`
- B) `-sS`
- C) `-O`
- D) `-p-`

**Réponse : A**

**Q4 :** Qu'est-ce que le framework **MITRE ATT&CK** ?
- A) Une matrice et base de connaissances mondiale documentant les tactiques, techniques et procédures (TTPs) des cyberattaquants
- B) Un logiciel de pare-feu open-source
- C) Un système d'exploitation spécialisé en pentest
- D) Un antivirus pour serveurs web

**Réponse : A**

**Q5 :** Quel paquet TCP est envoyé par Nmap lors d'un scan Stealth SYN (`-sS`) juste après la réception d'un `SYN-ACK` pour interrompre la connexion avant son établissement ?
- A) RST (Reset)
- B) ACK
- C) FIN
- D) PSH

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
