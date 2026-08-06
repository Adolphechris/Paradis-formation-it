# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 266 (6h) : SOC Architecture & SIEM Correlation (Elastic Security, Splunk, Detection Engineering, Règles Sigma & Custom Correlation Rules)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'architecture d'un **Security Operations Center (SOC)** de niveau entreprise et le **Detection Engineering** sur SIEM (Elastic SIEM, Splunk) : concevoir des règles de corrélation multi-sources (Sysmon, Active Directory, AWS CloudTrail, EDR), traduire des règles **Sigma** universelles vers Elastic EQL et Splunk SPL, et optimiser le taux de faux-positifs.
>
> **Compétences visées :** `SOC-01` (A) — SOC Architecture & SIEM Correlation | `DET-01` (A) — Detection Engineering & Sigma Rules Translation

---

## 1) Module — Architecture SOC & Detection Engineering (1h30)

### 📖 Narration/Intuition

Le **Detection Engineering** est la discipline moderne du SOC qui traite les règles de détection comme du code (Detection-as-Code). L'objectif d'un Detection Engineer est d'écrire des règles de corrélation robustes associées aux techniques **MITRE ATT&CK** (ex: détection d'exécution PowerShell obfusquée, détection de DCSync, détection de Beaconing HTTP) tout en maintenant un taux de faux-positifs inférieur à 5%.

---

## 2) Module — Traduction de Règles Sigma vers Elastic EQL & Splunk SPL (2h30)

### 🛠️ Atelier Pratique

**Règle Sigma pour la détection de Process Hollowing et sa conversion (`sigma_conversion.py`) :**

```yaml
# Règle Sigma universelle (process_creation_hollowing.yml)
title: Détection de Process Hollowing (Suspicious Child Process)
id: f4a12345-6789-abcd-ef01-23456789abcd
status: experimental
description: Détecte la création d'un processus système légitime (svchost.exe, lsass.exe) spawné depuis un emplacement non standard
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    ParentImage|endswith:
      - '\cmd.exe'
      - '\powershell.exe'
      - '\wscript.exe'
    Image|endswith:
      - '\svchost.exe'
      - '\lsass.exe'
  condition: selection
falsepositives:
  - Scripts d'administration légitimes très rares
level: high
tags:
  - attack.defense_evasion
  - attack.t1055.012
```

```python
# Script Python de traduction Sigma -> Elastic EQL
eql_query = """
process where event.type == "start" and
  process.parent.name in ("cmd.exe", "powershell.exe", "wscript.exe") and
  process.name in ("svchost.exe", "lsass.exe")
"""

# Script Python de traduction Sigma -> Splunk SPL
splunk_spl = """
index=winlogbeat EventCode=4688 OR EventCode=1
| where match(ParentProcessName, "(?i)(cmd|powershell|wscript)\.exe$")
  AND match(NewProcessName, "(?i)(svchost|lsass)\.exe$")
| table _time, Computer, User, ParentProcessName, NewProcessName
"""

print("[+] EQL Elastic Query :\n", eql_query)
print("[+] Splunk SPL Query :\n", splunk_spl)
```

---

## 3) Module — Règle de Corrélation Multi-Sources Elastic EQL (`dcsync_detection.eql`) (2h)

```sql
/* Règle de Corrélation EQL : Détection de DCSync (Event 4662 + RPC AD) */
sequence by winlog.computer_name with maxspan=1m
  [iam where event.code == "4662" and
   winlog.event_data.Properties : ("*1131f6aa-9cfe-11d1-96c3-00c04fc2dcd2*", "*1131f6ad-9cfe-11d1-96c3-00c04fc2dcd2*")]
  [process where event.code == "4688" and process.name : ("mimikatz.exe", "secretsdump.py", "python.exe")]
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SIEM** | Security Information and Event Management — Centralisateur et corrélateur de logs de sécurité |
| **SOC** | Security Operations Center — Centre d'opérations de sécurité et de surveillance |
| **EQL** | Event Query Language — Langage de requête orienté événements d'Elastic Security |
| **SPL** | Search Processing Language — Langage de recherche et d'analyse de Splunk |
| **Sigma** | Format open-source universel de rédaction de règles de détection SIEM |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est l'avantage principal d'utiliser le format universel **Sigma** pour rédiger des règles de détection ?
- A) Il permet d'écrire une règle une seule fois et de la traduire automatiquement vers Splunk SPL, Elastic EQL, QRadar ou Sentinel
- B) Il remplace l'antivirus
- C) Il chiffre les logs sur disque
- D) Il accélère la vitesse de recherche SQL

**Réponse : A**

**Q2 :** Dans Elastic Security, quel langage de requête est spécifiquement conçu pour exprimer des **sequences d'événements temporelles** (corrélation d'événements) ?
- A) EQL (Event Query Language)
- B) KQL
- C) SQL
- D) Bash

**Réponse : A**

**Q3 :** Quel événement Windows Event Log (Security Log) enregistre l'accès à un objet AD avec les GUID de réplication lors d'une attaque **DCSync** ?
- A) Event ID 4662
- B) Event ID 4624
- C) Event ID 7045
- D) Event ID 1102

**Réponse : A**

**Q4 :** Que signifie l'approche **Detection-as-Code** en Detection Engineering ?
- A) Gérer les règles de détection SIEM avec la même rigueur que le code logiciel (versionning Git, tests unitaires CI/CD, révision par les pairs)
- B) Réduire le nombre de développeurs dans l'entreprise
- C) Supprimer les pare-feux
- D) Remplacer les analystes SOC par des scripts Bash

**Réponse : A**

**Q5 :** Quel indicateur clé de performance d'un SOC doit être minimisé pour éviter la fatigue des analystes (Alert Fatigue) ?
- A) Le taux de faux-positifs (False Positive Rate)
- B) Le nombre de règles de détection
- C) Le nombre de serveurs surveillés
- D) La taille des disques SIEM

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
