# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 243 (6h) : Cyber Threat Intelligence Avancée & Threat Hunting (STIX 2.1/TAXII 2.1, MITRE CAR, Règles YARA/Sigma Avancées & Threat Hunting Hypotheses)

> [!NOTE]
> **Objectif du jour :** Maîtriser la traque proactive des menaces (**Threat Hunting**) et l'échange standardisé d'indicateurs de menace (**Cyber Threat Intelligence — CTI**) : formalisation des IOCs et TTPs avec le standard **STIX 2.1 / TAXII 2.1**, rédaction de règles de détection avancées avec **YARA** et **Sigma**, utilisation des répertoires d’analytics **MITRE CAR (Cyber Analytics Repository)**, et conduite de campagnes de chasse basées sur des hypothèses (**Hypothesis-Driven Threat Hunting**).
>
> **Compétences visées :** `SEC-04` (A) — Advanced CTI STIX/TAXII & Threat Hunting Hypotheses | `SEC-05` (A) — YARA/Sigma Rule Engineering & MITRE CAR Integration

---

## 1) Module — Standards CTI : STIX 2.1 & TAXII 2.1 (2h)

### 📖 Narration/Intuition

Pour protéger le secteur financier congolais, la BCC doit échanger automatiquement des renseignements sur les menaces (**CTI**) avec les banques centrales régionales, l'ENISA et les CERTs internationaux.

Le format **STIX 2.1 (Structured Threat Information Expression)** permet de modéliser les menaces sous forme de graphes d'objets JSON structurés, tandis que le protocole **TAXII 2.1 (Trusted Automated Exchange of Intelligence Information)** gère le transport sécurisé de ces informations d'intelligence par API REST/HTTPS.

### 🔍 Anatomie Technique

**Graphe d'Objets STIX 2.1 (JSON-STIX) :**

```json
{
  "type": "bundle",
  "id": "bundle--3703c15d-8524-5264-b0c4-95b2c7e0c4b2",
  "objects": [
    {
      "type": "threat-actor",
      "id": "threat-actor--b401217f-135e-473d-82d2-c2d1b61c94b3",
      "name": "APT-BCC-ADVANCED",
      "threat_actor_types": ["state-sponsored", "financial-crime"]
    },
    {
      "type": "indicator",
      "id": "indicator--8e2e2d2b-17d4-4cbf-938f-98ee46b3cd3f",
      "name": "IP C2 Malveillante Tor",
      "pattern": "[ipv4-addr:value = '185.220.101.47']",
      "pattern_type": "stix",
      "valid_from": "2026-08-01T00:00:00Z"
    },
    {
      "type": "relationship",
      "id": "relationship--a12b3c4d-5678-90ef-ab12-34567890abcd",
      "relationship_type": "indicates",
      "source_ref": "indicator--8e2e2d2b-17d4-4cbf-938f-98ee46b3cd3f",
      "target_ref": "threat-actor--b401217f-135e-473d-82d2-c2d1b61c94b3"
    }
  ]
}
```

---

## 2) Module — Threat Hunting Basé sur des Hypothèses & MITRE CAR (2h)

### 📖 Narration/Intuition

Le **Threat Hunting** ne consiste pas à attendre passivement qu'un SIEM génère une alerte, mais à chercher **proactivement** dans les logs et la mémoire la présence d'attaquants silencieux qui auraient contourné les défenses existantes.

La démarche s'appuie sur le répertoire **MITRE CAR (Cyber Analytics Repository)** pour formuler des hypothèses de chasse précises basées sur le comportement des attaquants.

### 🛠️ Atelier Pratique

**Campagne de Threat Hunting BCC — Hypothèse T1059 (Execution PowerShell Masquée) (`hunt_powershell.kql`) :**

```kql
// Hypothèse de Chasse : Un attaquant utilise PowerShell avec encodage Base64 et bypass d'ExecutionPolicy
// Logs Sysmon (Event ID 1 - Process Creation) dans Microsoft Sentinel / ELK
Sysmon_EventID_1
| where ProcessCommandLine contains "powershell" or ProcessCommandLine contains "pwsh"
| where ProcessCommandLine matches regex "(?i)-e(nc(odedcommand)?)?\\s+[A-Za-z0-9+/=]{20,}"
     or ProcessCommandLine contains "-bypass"
     or ProcessCommandLine contains "-nop"
| project TimeGenerated, Computer, Account, ParentProcessName, ProcessCommandLine
| sort by TimeGenerated desc
```

---

## 3) Module — Rule Engineering Avancé : YARA & Sigma (2h)

### 🛠️ Atelier Pratique

**Règle YARA Avancée pour Détecter les Implants Mémoire BCC (`detect_bcc_malware.yar`) :**

```yara
rule APT_BCC_Memory_Implant {
    meta:
        description = "Détecte l'implant mémoire utilisé dans l'attaque BCC"
        author = "CSIRT BCC Threat Hunter"
        date = "2026-08-06"
        reference = "J243-ThreatHunting"
        severity = "CRITICAL"

    strings:
        // Signature d'injection mémoire (VirtualAllocEx + CreateRemoteThread)
        $pattern_inj = { 48 89 5C 24 ?? 48 89 74 24 ?? 57 48 83 EC 20 49 8B F8 }
        // Chaînes d'exfiltration spécifiques
        $str1 = "bcc_exfil_key" ascii wide
        $str2 = "unlockVault" ascii wide
        $str3 = "185.220.101.47" ascii wide

    condition:
        uint16(0) == 0x5A4D and // En-tête PE (MZ)
        ($pattern_inj and 2 of ($str*))
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **STIX** | Structured Threat Information Expression — Standard de modélisation des données CTI |
| **TAXII** | Trusted Automated Exchange of Intelligence Information — Protocole de transport CTI |
| **CAR** | Cyber Analytics Repository — Répertoire d'analyses et de requêtes de détection MITRE |
| **CTI** | Cyber Threat Intelligence — Renseignement sur les cybermenaces |
| **KQL** | Kusto Query Language — Langage de requête utilisé dans Azure Sentinel et Azure Data Explorer |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre la **Cyber Threat Intelligence (CTI)** réactive et le **Threat Hunting** proactif ?

**Corrigé :**
- **CTI (Cyber Threat Intelligence)** : Consiste à collecter, analyser et consommer des données d'indicateurs de compromission (IOCs, IPs, hashes, domaines) fournies par des sources externes ou des incidents passés, pour alimenter les règles de blocage automatiques du SIEM/Firewall.
- **Threat Hunting** : Est une démarche **proactive et manuelle/semi-automatisée** menée par des analystes experts qui partent de l'hypothèse qu'un attaquant **est déjà présent** dans le réseau sans avoir déclenché d'alerte. Le chasseur formule une hypothèse (ex: "Un attaquant utilise le protocole DNS pour exfiltrer des données"), crée des requêtes d'analyse poussées (KQL/YARA/Sigma) et explore les données brutes de télémétrie pour débusquer l'intrus.

**Exercice 2 :** Dans la structure d'un objet STIX 2.1, quelle est la fonction de l'objet `relationship` ?

**Corrigé :** L'objet `relationship` dans STIX 2.1 permet de lier deux objets STIX distincts (ex: un `indicator` et un `threat-actor`, ou un `malware` et une `vulnerability`) pour construire un **graphe de connaissances de la menace**. Il définit le type de relation (ex: `indicates`, `uses`, `targets`, `mitigates`) permettant aux analystes et aux plateformes CTI (comme OpenCTI ou MISP) de comprendre le contexte complet de l'attaque.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel standard international basé sur le format JSON permet d'exprimer et de modéliser sous forme de graphe d'objets des données de Cyber Threat Intelligence (CTI) ?
- A) STIX 2.1
- B) TAXII 2.1
- C) OpenIOC
- D) CSV

**Réponse : A**

**Q2 :** Quel protocole HTTPS/REST assure le transport et l'échange automatique des bundles d'intelligence STIX entre différentes organisations ?
- A) TAXII 2.1
- B) STIX 2.1
- C) SFTP
- D) MQTT

**Réponse : A**

**Q3 :** Quel outil/format de règles est utilisé spécifiquement pour rechercher des motifs binaires ou des chaînes de caractères dans la mémoire RAM ou les fichiers pour identifier des malwares ?
- A) Règles YARA
- B) Règles Sigma
- C) Profils Seccomp
- D) Fichiers JSON

**Réponse : A**

**Q4 :** Dans la méthodologie de Threat Hunting, quelle est la première étape d'une campagne de chasse proactive ?
- A) La formulation d'une hypothèse de chasse basée sur une TTP ou un comportement suspect
- B) Le redémarrage du SIEM
- C) L'effacement des logs système
- D) Le blocage d'une adresse IP

**Réponse : A**

**Q5 :** Quel répertoire développé par MITRE fournit des requêtes analytiques et des exemples de détection basés sur le framework ATT&CK ?
- A) MITRE CAR (Cyber Analytics Repository)
- B) MITRE CVE
- C) MITRE CWE
- D) MITRE CAPEC

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
