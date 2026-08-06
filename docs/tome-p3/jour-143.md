# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 143 (6h) : Threat Intelligence & Gestion des Indicateurs de Compromission (MITRE ATT&CK, STIX/TAXII & OpenCTI)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre une plateforme de renseignement sur les menaces (Cyber Threat Intelligence) orientée production bancaire : modélisation des tactiques d'adversaires (MITRE ATT&CK), formats d'échange de Threat Intelligence (STIX 2.1 / TAXII 2.1), déploiement et alimentation d'une plateforme OpenCTI, et corrélation automatique avec le SIEM.
>
> **Compétences visées :** `SEC-06` (A) — Cyber Threat Intelligence (CTI) & MITRE ATT&CK | `SEC-04` (A) — OpenCTI & STIX/TAXII Automation

---

## 1) Module — MITRE ATT&CK Framework & Cartographie des Adversaires (2h)

### 📖 Narration/Intuition

Comment savoir qu'un attaquant APT (Advanced Persistent Threat) ciblant les banques africaines utilise **exactement les mêmes techniques** que le groupe APT28 (Fancy Bear) ? Comment prioriser les défenses de la BCC en investissant sur les bons contrôles ?

Le **MITRE ATT&CK** est la base de données tactique de référence mondiale sur les comportements d'adversaires cybernétiques. Elle recense pour chaque groupe d'attaquants connus toutes leurs **Tactiques** (ce qu'ils veulent accomplir), **Techniques** (comment ils le font) et **Procédures** (TTPs - Outils et méthodes précises).

### 🔍 Anatomie Technique

**Structure des TTPs MITRE ATT&CK (Exemple : Phishing Initial Access) :**

```
GROUPE : TA0001 — Initial Access
│
└─── TECHNIQUE : T1566 — Phishing
     │
     ├── T1566.001 — Spearphishing Attachment (Pièce jointe malveillante)
     │   Groupes connus : APT28, Lazarus (NK Banking), FIN7 (Finance)
     │   Indicateurs : Macro VBA Excel, .hta, .iso
     │
     └── T1566.002 — Spearphishing Link (Lien URL malveillant)
         Indicateurs : Domaine typosquat, Cloudflare Tunnel, Ngrok
```

---

## 2) Module — Format STIX 2.1 & Plateforme OpenCTI (2h)

### 📖 Narration/Intuition

Pour partager et exploiter automatiquement les **Indicators of Compromise (IOCs)** (adresses IP malveillantes, hashes de malwares, domaines C2), l'industrie s'est standardisée sur le format **STIX 2.1 (Structured Threat Information Expression)** transporté via le protocole **TAXII 2.1**.

**OpenCTI** est la plateforme open-source de Threat Intelligence de référence (développée par l'ANSSI), permettant de centraliser, corréler et enrichir les IOCs provenant de dizaines de feeds (AlienVault OTX, CIRCL, Shodan, VirusTotal).

### 🔍 Anatomie Technique

**Exemple d'objet STIX 2.1 décrivant un Indicator of Compromise (`stix_indicator.json`) :**

```json
{
  "type": "bundle",
  "id": "bundle--bcc-threat-intel-001",
  "objects": [
    {
      "type": "indicator",
      "spec_version": "2.1",
      "id": "indicator--94d0e7e7-0b7b-4a3c-86d2-abc12345",
      "name": "APT-Lazarus-C2-IP-Kinshasa",
      "description": "Adresse IP du serveur de Commande & Contrôle du groupe Lazarus ciblant les banques africaines (2026-07)",
      "pattern": "[ipv4-addr:value = '45.142.212.100']",
      "pattern_type": "stix",
      "valid_from": "2026-07-01T00:00:00Z",
      "indicator_types": ["malicious-activity", "compromised"],
      "labels": ["apt-lazarus", "banking-sector", "africa"],
      "kill_chain_phases": [
        {
          "kill_chain_name": "mitre-attack",
          "phase_name": "command-and-control"
        }
      ]
    }
  ]
}
```

---

## 3) Module — Corrélation IOCs dans le SIEM (Elasticsearch / Sigma) (2h)

### 📖 Narration/Intuition

Les IOCs récupérés dans OpenCTI (hashes, IPs, domaines) doivent être automatiquement injectés dans le SIEM pour déclencher des alertes en temps réel dès qu'une communication vers un IP de C2 connu est détectée sur le réseau BCC.

### 🔍 Anatomie Technique

**Règle de détection SIEM Sigma (Corrélation IOC C2 Lazarus) (`detect_apt_c2.yml`) :**

```yaml
title: "Connexion vers IP C2 APT Lazarus (Banking Sector Africa)"
status: stable
description: "Détecte les connexions réseau vers les serveurs C2 connus du groupe APT Lazarus"
logsource:
  category: network_connection
detection:
  selection:
    DestinationIp:
      - "45.142.212.100"
      - "185.220.101.34"
      - "194.165.16.11"
  condition: selection
level: critical
tags:
  - attack.command-and-control
  - attack.t1071
falsepositives:
  - "Aucun : IPs strictement classées malveillantes"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CTI** | Cyber Threat Intelligence — Renseignement sur les menaces cybernétiques |
| **TTPs** | Tactics, Techniques and Procedures — Méthodes opérationnelles d'un groupe d'attaquants |
| **STIX** | Structured Threat Information Expression — Format standardisé JSON d'échange de CTI |
| **TAXII** | Trusted Automated eXchange of Intelligence Information — Protocole de transport de STIX |
| **IOC** | Indicator of Compromise — Artefact technique révélant une intrusion |
| **OpenCTI** | Plateforme open-source de Threat Intelligence développée par l'ANSSI |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre un **IOC (Indicator of Compromise)** et un **TTP (Tactic, Technique, Procedure)** en matière de Threat Intelligence ?

**Corrigé :** Un **IOC (Indicator of Compromise)** est un artefact technique observable et éphémère révélant qu'une compromission a eu lieu ou est en cours (ex: une adresse IP de C2, un hash de malware, un nom de domaine). Les IOCs deviennent rapidement obsolètes car les attaquants changent d'infrastructure. Un **TTP** décrit le **comportement fondamental et durable** d'un groupe d'attaquants : leurs tactiques stratégiques (ex: Persistence), les techniques précises utilisées (ex: T1053 - Scheduled Task) et les outils préférés. Les TTPs changent rarement et permettent de détecter un attaquant même quand ses IOCs sont renouvelés.

**Exercice 2 :** Comment fonctionne le cycle de partage Threat Intelligence entre institutions financières via **STIX/TAXII** ?

**Corrigé :** Une institution détectant un indicateur de compromission (ex: IP C2 d'un groupe APT bancaire) l'encode dans un objet **STIX 2.1** (JSON structuré). Cet objet est publié sur un serveur **TAXII 2.1** (API REST standardisée). Les autres institutions membres du consortium bancaire s'abonnent au flux TAXII et importent automatiquement les IOCs dans leur SIEM ou leur plateforme OpenCTI. Chaque nouveau IOC ajouté déclenche des règles de détection en temps réel sur tous les réseaux membres simultanément.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel framework de référence mondiale recense et classe les tactiques, techniques et procédures (TTPs) de tous les groupes d'attaquants APT connus ?
- A) MITRE ATT&CK
- B) MS-DOS
- C) Disquette
- D) Paint

**Réponse : A**

**Q2 :** Quel format JSON standardisé est utilisé pour décrire et partager des indicateurs de compromission (IOCs) entre institutions de cybersécurité ?
- A) STIX 2.1 (Structured Threat Information Expression)
- B) Word
- C) Excel
- D) Notepad

**Réponse : A**

**Q3 :** Quelle plateforme de Threat Intelligence open-source développée par l'ANSSI permet de centraliser, enrichir et corréler des IOCs provenant de multiples feeds ?
- A) OpenCTI
- B) Paint
- C) Calculator
- D) Solitaire

**Réponse : A**

**Q4 :** En quoi un TTP (Tactic, Technique, Procedure) est-il plus utile qu'un IOC pour la défense à long terme ?
- A) Car les TTPs décrivent le comportement stable d'un attaquant qui change rarement, alors que les IOCs (IPs, hashes) sont changés après chaque campagne
- B) Car les TTPs coûtent moins cher
- C) Car les IOCs sont trop volumineux
- D) Car les TTPs imprimables

**Réponse : A**

**Q5 :** Quelle syntaxe de règle de détection SIEM permet d'exprimer des corrélations de logs de manière portable entre différents outils (Splunk, Elastic, QRadar) ?
- A) Sigma
- B) MP3
- C) EXE
- D) DOCX

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
