# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 361 (6h) : Threat Hunting Hypothesis-Driven — Methodology (PEAK Framework, MITRE ATT&CK Mapping & Automated Hunt Playbooks)

> [!NOTE]
> **Objectif du jour :** Maîtriser la traque proactive de menaces **(Threat Hunting Hypothesis-Driven)** de niveau Tier-3 SOC : appliquer la méthodologie **PEAK (Hypothesis-Driven, Data-Driven & Analytics-Driven Hunting)**, formuler des hypothèses de chasse basées sur la CTI et les TTPs du framework **MITRE ATT&CK**, concevoir des requêtes d'investigation croisées (SIEM/EDR) et mesurer l'efficacité de la chasse par la création de nouvelles règles de détection permanentes (Detection Engineering Pipeline).
>
> **Compétences visées :** `HUNT-01` (A) — PEAK Threat Hunting Methodology & Hypothesis Generation | `HUNT-02` (A) — Multi-Source Log Investigation & Detection Engineering Pipeline Integration

---

## 1) Module — Méthodologie PEAK & Hypothesis Formulation (2h)

### 📖 Narration/Intuition

Le Threat Hunting ne consiste pas à attendre qu'une alerte SIEM se déclenche : c'est la recherche **proactive et manuelle/semi-automatisée** d'adversaires qui ont déjà réussi à déjouer les contrôles de sécurité existants (Zero-Days, Living Off the Land).

```
   [ CTI Feeds / Threat Intelligence / MITRE ATT&CK ]
                         │
                         ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ 1. FORMULATION D'HYPOTHÈSE                                  │
   │    "L'attaquant utilise PowerShell obfusqué (T1059.001)    │
   │     pour contourner l'AMSI et télécharger un dropper."      │
   └────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ 2. COLLECTE & INVESTIGATION DES DATASETS (SIEM / EDR)        │
   │    - Requêtes KQL/SPL sur les lignes de commande PowerShell │
   │    - Analyse d'entropie des arguments                       │
   └────────────────────────┬────────────────────────────────────┘
                            │
                            ├──────────────────────────┐
                            ▼                          ▼
                 [ Menace Confirmée ]         [ Pas de Menace ]
                 - Confinement SOAR L1        - Amélioration de la Baseline
                 - Création Règle SIGMA       - Clôture de l'Hypothèse
```

#### Le Framework PEAK (Preparation, Execution, Knowledge Elaboration)

| Phase PEAK | Objectif | Activité Chasseur SOC |
|:---:|:---|:---|
| **Preparation** | Définir le scope & l'hypothèse | Sélectionner une technique MITRE ATT&CK (ex: `T1003.001 LSASS Dumping`) et vérifier la disponibilité des logs (Sysmon Event ID 10). |
| **Execution** | Analyser la télémétrie | Exécuter des requêtes de chasse (SPL/KQL), isoler les valeurs aberrantes (outliers) et les anomalies statistiques. |
| **Knowledge Elaboration** | Convertir les trouvailles | Convertir une chasse réussie en règle de détection permanente (SIGMA) et enrichir la base de connaissances CTI. |

---

## 2) Module — Outillage Threat Hunting Engine (`threat_hunting_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import math
import re
from datetime import datetime, timezone
from typing import List, Dict

class ThreatHuntingEngine:
    """
    Moteur de Threat Hunting axé sur la détection d'anomalies de lignes de commande (PowerShell Obfuscation & Outliers).
    """

    def __init__(self, hunt_name: str, target_mitre_technique: str):
        self.hunt_name = hunt_name
        self.mitre_id = target_mitre_technique
        self.telemetry_events: List[dict] = []
        self.findings: List[dict] = []

    def ingest_process_telemetry(self, events: List[dict]):
        """Ingère les événements de création de processus (Sysmon Event ID 1)."""
        self.telemetry_events.extend(events)

    def _calculate_shannon_entropy(self, text: str) -> float:
        """Calcule l'entropie de Shannon d'une chaîne (entropie élevée = obfuscation / Base64)."""
        if not text:
            return 0.0
        entropy = 0.0
        for x in set(text):
            p_x = float(text.count(x)) / len(text)
            entropy -= p_x * math.log2(p_x)
        return entropy

    def execute_powershell_obfuscation_hunt(self, entropy_threshold: float = 4.5) -> List[dict]:
        """
        Hypothèse de Chasse : "Des attaquants exécutent du code PowerShell avec obfuscation Base64 
        ou entropie élevée pour masquer leur payload."
        """
        print(f"\n=== [HUNT EXECUTION] {self.hunt_name} [{self.mitre_id}] ===")
        
        for evt in self.telemetry_events:
            proc_name = evt.get("process_name", "").lower()
            cmdline = evt.get("command_line", "")
            user = evt.get("user", "")
            host = evt.get("host", "")

            if proc_name == "powershell.exe" or proc_name == "pwsh.exe":
                # Check 1 : Entropie de la ligne de commande
                entropy = self._calculate_shannon_entropy(cmdline)
                
                # Check 2 : Présence de mots-clés d'obfuscation / Bypass AMSI
                has_encoded_flag = bool(re.search(r"(-e|-enc|-encodedcommand)\s+[a-za-z0-9+/=]{20,}", cmdline, re.IGNORECASE))
                has_amsi_bypass = "amsiutils" in cmdline.lower() or "amsiinitfailed" in cmdline.lower()

                if entropy >= entropy_threshold or has_encoded_flag or has_amsi_bypass:
                    finding = {
                        "hunt_id": f"FIND-{len(self.findings)+1:03d}",
                        "host": host,
                        "user": user,
                        "process": proc_name,
                        "command_line": cmdline[:100] + "..." if len(cmdline) > 100 else cmdline,
                        "shannon_entropy": round(entropy, 2),
                        "suspicious_indicators": {
                            "high_entropy": entropy >= entropy_threshold,
                            "encoded_cmd": has_encoded_flag,
                            "amsi_bypass_attempt": has_amsi_bypass
                        },
                        "verdict": "SUSPICIOUS_OBFUSCATED_POWERSHELL"
                    }
                    self.findings.append(finding)
                    print(f"[!] ANOMALIE DÉCOUVERTE sur {host} ({user}) -> Entropie: {entropy:.2f} | AMSI Bypass: {has_amsi_bypass}")

        return self.findings

# Simulation d'une Session de Threat Hunting
hunter = ThreatHuntingEngine("Hunt-Obfuscated-PowerShell", "T1059.001")

# Dataset de télémétrie récolté dans le SIEM (Sysmon Event ID 1)
telemetry = [
    {
        "host": "WKSTN-FINANCE-01",
        "user": "j.dupont",
        "process_name": "powershell.exe",
        "command_line": "Get-Process | Where-Object {$_.CPU -gt 10}" # Légitime
    },
    {
        "host": "WKSTN-TRADING-09",
        "user": "a.smith",
        "process_name": "powershell.exe",
        "command_line": "powershell.exe -NoP -NonI -W Hidden -Enc aQBmAACAZQB4AGMAZQBsAC4AZQB4AGUA..." # Obfusqué
    },
    {
        "host": "SRV-FILE-02",
        "user": "svc_backup",
        "process_name": "powershell.exe",
        "command_line": "powershell.exe [Ref].Assembly.GetType('System.Management.Automation.AmsiUtils').GetField('amsiInitFailed','NonPublic,Static').SetValue($null,$true)" # AMSI Bypass
    }
]

hunter.ingest_process_telemetry(telemetry)
hunt_results = hunter.execute_powershell_obfuscation_hunt()

print("\n=== THREAT HUNTING FINDINGS REPORT ===")
print(json.dumps(hunt_results, indent=2, ensure_ascii=False))
```

---

## 3) Module — Fiche de Conversion Detection Engineering (2h)

```markdown
# DETECTION ENGINEERING PIPELINE (FROM HUNT TO PERMANENT RULE)

Une fois qu'une hypothèse de chasse a identifié un comportement malveillant avéré, le chasseur doit la convertir en une **règle de détection automatique permanente (SIGMA)** pour alimenter le SIEM.

```yaml
# Règle SIGMA générée à l'issue de la session de chasse J361
title: Suspicious Obfuscated PowerShell with AMSI Bypass
id: 9a812c3d-4567-4a11-paradis361
status: production
description: Détecte les tentatives d'exécution PowerShell avec entropie élevée et contournement d'AMSI identifiées lors de la session Threat Hunting J361.
references:
    - https://attack.mitre.org/techniques/T1059/001/
author: PARADIS IT Threat Hunting Team
tags:
    - attack.execution
    - attack.t1059.001
    - attack.t1562.001
logsource:
    category: process_creation
    product: windows
detection:
    selection_img:
        Image|endswith:
            - '\powershell.exe'
            - '\pwsh.exe'
    selection_cmd:
        CommandLine|contains:
            - 'AmsiUtils'
            - 'amsiInitFailed'
            - '-enc'
            - '-encodedcommand'
    condition: selection_img and selection_cmd
falsepositives:
    - Administrative scripts executing obfuscated deployment tools (to be tuned)
level: high
```
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Threat Hunting** | Recherche proactive et guidée par hypothèses de menaces dissimulées dans les systèmes |
| **PEAK** | Preparation, Execution, Knowledge Elaboration — Framework méthodologique de Threat Hunting |
| **AMSI** | Antimalware Scan Interface — Interface Windows permettant aux applications d'envoyer du contenu (scripts) à l'antivirus pour analyse |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle est la différence essentielle entre la détection d'incidents classique (SOC Monitoring) et le **Threat Hunting** ?
- A) Le SOC Monitoring réagit aux alertes générées automatiquement par des règles existantes, tandis que le Threat Hunting est une démarche proactive cherchant les menaces non détectées
- B) Le Threat Hunting n'utilise pas d'ordinateurs
- C) Le SOC Monitoring est uniquement destiné aux serveurs Linux
- D) Il n'y a aucune différence

**Réponse : A**

**Q2 :** Dans la méthode de Threat Hunting **Hypothesis-Driven**, d'où provient l'hypothèse de départ ?
- A) Des rapports de Threat Intelligence (CTI), des nouvelles techniques publiées sur MITRE ATT&CK ou de l'analyse des lacunes de détection de l'entreprise
- B) D'un tirage au sort aléatoire
- C) Des journaux de presse grand public
- D) D'un scan de ports Nmap

**Réponse : A**

**Q3 :** Pourquoi l'analyse de l'**Entropie de Shannon** sur les lignes de commande est-elle utile lors d'une chasse sur PowerShell ?
- A) Parce que les commandes PowerShell obfusquées ou encodées en Base64 présentent un degré d'aléatoire (entropie) nettement plus élevé que les commandes textuelles ordinaires
- B) Parce qu'elle mesure la température du processeur
- C) Parce qu'elle supprime les fichiers temporaires
- D) Parce qu'elle valide les certificats SSL

**Réponse : A**

**Q4 :** Quelle est la dernière phase du framework **PEAK (Knowledge Elaboration)** ?
- A) Périodiser et pérenniser les résultats d'une chasse réussie en créant de nouvelles règles de détection automatiques (SIGMA) pour le SIEM
- B) Effacer la base de données
- C) Redémarrer tous les routeurs
- D) Formater le poste du chasseur

**Réponse : A**

**Q5 :** Qu'est-ce que l'**AMSI (Antimalware Scan Interface)** sous Windows ?
- A) Un composant système permettant aux interpréteurs de scripts (PowerShell, VBScript) d'envoyer le code désobfusqué en mémoire à l'antivirus/EDR avant son exécution
- B) Un type de câble de moniteur
- C) Un protocole de routage
- D) Une base de données SQL

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
