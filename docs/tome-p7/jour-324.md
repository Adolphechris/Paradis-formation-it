# TOME P7 — Certifications d'Élite & Spécialisations — Jour 324 (6h) : GCTI Intensive — Threat Intelligence Lifecycle (F3EAD Cycle, Intelligence Requirements, Diamond Model & MITRE ATT&CK Navigator)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **cycle de vie du renseignement sur les menaces (Threat Intelligence)** ciblé par la certification **GCTI (GIAC Cyber Threat Intelligence)** : appliquer le cycle **F3EAD** (Find, Fix, Finish, Exploit, Analyze, Disseminate), rédiger des **Priority Intelligence Requirements (PIRs)**, analyser un groupe APT via le **Diamond Model**, et cartographier ses TTPs dans le **MITRE ATT&CK Navigator** pour identifier les lacunes de détection.
>
> **Compétences visées :** `GCTI-01` (A) — F3EAD Intelligence Cycle & PIRs | `GCTI-02` (A) — Diamond Model & MITRE ATT&CK TTP Mapping

---

## 1) Module — Cycle F3EAD & Intelligence Requirements (2h)

### 📖 Narration/Intuition

Le cycle **F3EAD** (Find, Fix, Finish, Exploit, Analyze, Disseminate) est le framework de renseignement militaire adapté au Cyber Threat Intelligence. Il transforme des **données brutes** (logs, IOCs, rapports OSINT) en **intelligence actionnable** pour les équipes défensives.

```
F3EAD Intelligence Cycle
     ┌──────────────────────────────────────┐
     │  FIND → Identifier les cibles/acteurs │
     │  FIX  → Localiser/Confirmer l'acteur  │
     │  FINISH → Neutraliser la menace       │◄─── Action Défensive
     │  EXPLOIT → Collecter les renseignements│
     │  ANALYZE → Traiter et corréler        │
     │  DISSEMINATE → Diffuser l'intelligence │───► CISO/SOC/Partenaires
     └──────────────────────────────────────┘
```

---

## 2) Module — Diamond Model & ATT&CK Mapping (`threat_intel_analysis.py`) (2h)

### 🛠️ Atelier Pratique

```python
# Analyse d'un groupe APT selon le Diamond Model — GCTI
# Cas d'étude : APT28 (Fancy Bear — Unité GRU 26165)

apt28_diamond_model = {
    "actor": {
        "name": "APT28 / Fancy Bear",
        "aliases": ["Sofacy", "Pawn Storm", "Sednit", "GRU Unit 26165"],
        "attribution": "État russe — GRU (Renseignement militaire russe)",
        "motivation": ["Espionnage géopolitique", "Interférence électorale", "Collecte SIGINT"],
        "sophistication": "ADVANCED — Utilise des 0-days, custom malware, infrastructure TTP obfusquée"
    },

    "victim": {
        "targets": ["Gouvernements UE/OTAN", "Partis politiques", "Aérospatial & Défense",
                    "Médias", "Comité olympique"],
        "targeted_countries": ["USA", "France", "Allemagne", "Ukraine", "UK"],
        "victim_personae": "Senior political figures, military officers, journalists"
    },

    "capability": {
        "custom_malware": ["X-Agent (LoJax)", "X-Tunnel", "Komplex (macOS)", "GAMEFISH"],
        "ttps_mitre": {
            "T1566.001": "Phishing avec pièces jointes malveillantes (spear-phishing attachment)",
            "T1203":     "Exploitation de vulnérabilités client (Word macros, CVE-2017-0199)",
            "T1055":     "Process Injection (hollowing)",
            "T1071.001": "C2 via HTTP/HTTPS (Implant X-Agent)",
            "T1003.001": "Credential Dumping (LSASS Memory — Mimikatz)",
            "T1070.004": "File Deletion pour anti-forensic",
            "T1048":     "Exfiltration Over Alternative Protocol (OneDrive, Dropbox abusés)"
        }
    },

    "infrastructure": {
        "c2_type": "Multi-tier — Redirecteurs VPS compromis → Serveurs C2 dédiés",
        "c2_hosting": ["Allemagne", "Pays-Bas", "France (hébergeurs bulletproof)"],
        "obfuscation": ["Tor", "VPN commerciaux", "Domaines look-alike (typosquatting)"],
        "TTL_hours": "Infrastructure éphémère — rotation toutes les 48-72h après détection"
    }
}

def generate_threat_intel_report():
    print("=== RAPPORT THREAT INTELLIGENCE — DIAMOND MODEL ===\n")
    print(f"ACTEUR : {apt28_diamond_model['actor']['name']}")
    print(f"Attribution : {apt28_diamond_model['actor']['attribution']}")
    print(f"Motivation : {', '.join(apt28_diamond_model['actor']['motivation'])}")
    print(f"\nCIBLES : {', '.join(apt28_diamond_model['victim']['targeted_countries'])}")
    print(f"\nTTPs MITRE ATT&CK :")
    for ttp_id, desc in apt28_diamond_model['capability']['ttps_mitre'].items():
        print(f"  [{ttp_id}] {desc}")

generate_threat_intel_report()
```

---

## 3) Module — Priority Intelligence Requirements (PIRs) & MITRE Gap Analysis (2h)

```markdown
# PRIORITY INTELLIGENCE REQUIREMENTS (PIRs) — GCTI

## Définition
Les PIRs sont les questions de renseignement prioritaires que le leadership d'une
organisation souhaite voir répondues pour prendre des décisions stratégiques de sécurité.

## Exemple de PIRs pour PARADIS BANK

### PIR-01 : TTPs des acteurs ciblant le secteur financier européen
**Question** : Quelles techniques (MITRE ATT&CK) les groupes APT ciblant les banques
européennes utilisent-ils actuellement pour l'accès initial et la persistance ?
**Impact** : Priorisation des contrôles défensifs et des règles de détection SOC

### PIR-02 : Indicateurs de compromission actifs (IOCs)
**Question** : Existe-t-il des IOCs actifs (IPs C2, hashes, domaines) associés
aux groupes APT ciblant notre secteur dans les 30 derniers jours ?
**Sources** : MISP, VirusTotal Graph, ISAC FS-ISAC, ANSSI bulletins

### PIR-03 : Vulnérabilités exploitées in-the-wild ciblant notre stack
**Question** : Quelles CVEs sont activement exploitées dans notre stack technologique
(Apache, Kubernetes, PostgreSQL, Windows Server) selon les bulletins CISA KEV ?

## Cycle de Production d'Intelligence

Collection → Traitement → Analyse → Dissémination → Feedback

## MITRE ATT&CK NAVIGATOR — Analyse des Lacunes de Détection

Construire une heat-map ATT&CK :
1. Lister toutes les techniques ATT&CK des acteurs ciblant notre secteur
2. Mapper les règles de détection existantes (SIGMA/YARA) sur chaque technique
3. Les techniques SANS règle de détection = LACUNES PRIORITAIRES à combler

Lacunes identifiées pour PARADIS BANK vs APT28 :
- T1566.001 : Pas de sandbox email (→ Implémenter Proofpoint/Microsoft Defender ATP)
- T1003.001 : Pas d'alerting sur accès LSASS (→ Règle SIGMA lsass_access)
- T1048    : Pas de contrôle exfiltration OneDrive/Dropbox (→ CASB Netskope)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **GCTI** | GIAC Cyber Threat Intelligence — Certification SANS de Threat Intelligence |
| **F3EAD** | Find, Fix, Finish, Exploit, Analyze, Disseminate — Cycle de renseignement militaire adapté CTI |
| **PIR** | Priority Intelligence Requirement — Question de renseignement prioritaire pour le leadership |
| **Diamond Model** | Framework d'analyse de menaces en 4 axes : Actor, Victim, Capability, Infrastructure |
| **APT** | Advanced Persistent Threat — Groupe d'attaquants sophistiqués, souvent étatiques |
| **TTP** | Tactics, Techniques & Procedures — Les méthodes opérationnelles d'un acteur malveillant |
| **KEV** | Known Exploited Vulnerabilities — Catalogue CISA des CVE activement exploitées |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans le cycle **F3EAD**, que représente la phase **"Analyze"** ?
- A) La corrélation et l'enrichissement des données collectées pour en extraire des informations exploitables (patterns, TTPs, attribution), transformant les données brutes en intelligence actionnable
- B) La phase d'exploitation d'une vulnérabilité
- C) La phase de neutralisation physique de l'acteur
- D) La phase de publication du rapport annuel

**Réponse : A**

**Q2 :** Dans le **Diamond Model**, quels sont les 4 axes d'analyse d'une activité malveillante ?
- A) Actor (Adversaire), Victim (Victime), Capability (Capacités/Malware), Infrastructure (Serveurs C2/réseau)
- B) Threat, Vulnerability, Risk, Control
- C) Identify, Protect, Detect, Respond
- D) Confidentiality, Integrity, Availability, Non-repudiation

**Réponse : A**

**Q3 :** Qu'est-ce qu'un **PIR (Priority Intelligence Requirement)** dans le contexte CTI ?
- A) Une question de renseignement prioritaire formulée par le leadership sécurité, définissant les informations critiques dont l'organisation a besoin pour prendre des décisions défensives
- B) Un indicateur de compromission réseau
- C) Un type de rapport de vulnérabilité CVE
- D) Un niveau de classification des données

**Réponse : A**

**Q4 :** Comment le **MITRE ATT&CK Navigator** aide-t-il une équipe SOC à prioriser ses règles de détection ?
- A) En permettant de cartographier visuellement les TTPs des acteurs menaçants sur la matrice ATT&CK, puis d'identifier les "points blancs" (techniques sans règle de détection = lacunes prioritaires à combler)
- B) En générant automatiquement des règles SIEM
- C) En bloquant automatiquement les IPs malveillantes
- D) En chiffrant les communications du SOC

**Réponse : A**

**Q5 :** Quelle est l'utilité du catalogue **CISA KEV (Known Exploited Vulnerabilities)** pour un CTI analyst ?
- A) Il liste les CVE actuellement exploitées activement dans des cyberattaques réelles, permettant aux organisations de prioriser les patchs sur ces vulnérabilités en premier (avant celles théoriquement sévères mais non exploitées)
- B) Il liste toutes les CVE publiées dans l'année
- C) Il fournit les hash de malwares connus
- D) Il contient les règles YARA de détection

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
