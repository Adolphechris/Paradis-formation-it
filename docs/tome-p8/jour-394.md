# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 394 (6h) : SOC Advanced Threat Hunting — Hypothesis-Driven Hunting, MITRE ATT&CK Mapping, Beaconing Detection, Lateral Movement Hunting & BCC Threat Hunting Program

> [!NOTE]
> **Objectif du jour :** Maîtriser la **chasse aux menaces (Threat Hunting)** avancée : formuler des hypothèses de hunting basées sur MITRE ATT&CK, détecter le beaconing et les mouvements latéraux, utiliser des outils avancés (OSQuery, KQL, Sigma), et concevoir un programme de Threat Hunting pour le SOC BCC.
>
> **Compétences visées :** `SOC-HUNT-01` (A) — Hypothesis-Driven Threat Hunting | `SOC-HUNT-02` (A) — Advanced Hunting Techniques & BCC Threat Hunting Program

---

## 1) Module — Hypothesis-Driven Threat Hunting (2h)

### 📖 Narration/Intuition

Le **Threat Hunting** est la recherche proactive de menaces qui ont échappé à la détection automatisée. Contrairement à la réponse à incident (réactive), le hunting est **proactif** : "je suppose que l'attaquant est déjà là, je vais le trouver".

```
[ THREAT HUNTING — PROCESSUS ]

1. HYPOTHÈSE         2. QUESTION       3. RECHERCHE      4. VALIDATION
"APT32 utilise       "Y a-t-il des    "Requête KQL/       "Analyste valide
 PowerShell           connexions       Sigma pour          les résultats,
 encodé pour          PowerShell       trouver             forensique si
 C2"                  encodé ?"        PowerShell          nécessaire"
                                                    encodé ?"

5. DOCUMENTATION    6. AMÉLIORATION
"Enrichir IoCs,      "Ajouter règle
 mettre à jour       SIEM/EDR pour
 CTI, partager        détecter
 avec équipe"         automatiquement"
```

### Framework de Threat Hunting (SANS)

| Étape | Activité | Livrable |
|:---|:---|:---|
| **1. Question** | Formuler une hypothèse de menace | Question de hunting |
| **2. Investigation** | Exécuter des requêtes de recherche | Résultats bruts |
| **3. Validation** | Analyser les résultats, valider TP/FP | Validation analyste |
| **4. Documentation** | Enrichir IoCs, mettre à jour CTI | Rapport de hunting |
| **5. Amélioration** | Ajouter règles de détection, playbooks | Détection améliorée |

---

## 2) Module — Threat Hunting Engine (`threat_hunting_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict, Optional
from enum import Enum

class HuntingStatus(Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FALSE_POSITIVE = "FALSE_POSITIVE"

class ThreatHuntingEngine:
    """
    Moteur de Threat Hunting pour SOC Blue Team.
    Gère les hypothèses, les requêtes de hunting et les résultats.
    """

    def __init__(self, org_name: str = "BCC"):
        self.org_name = org_name
        self.hunts: List[dict] = []
        self.findings: List[dict] = []
        self.iocs: List[dict] = []

    def create_hunt(self, hunt_id: str, title: str, hypothesis: str,
                    mitre_ttps: List[str], data_sources: List[str],
                    queries: List[str], priority: str = "MEDIUM") -> dict:
        """Crée une session de hunting."""
        hunt = {
            "hunt_id": hunt_id,
            "title": title,
            "hypothesis": hypothesis,
            "mitre_ttps": mitre_ttps,
            "data_sources": data_sources,
            "queries": queries,
            "priority": priority,
            "status": HuntingStatus.PLANNED.value,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.hunts.append(hunt)
        return hunt

    def execute_query(self, hunt_id: str, query_index: int, results_count: int,
                      suspicious_count: int) -> dict:
        """Exécute une requête de hunting."""
        hunt = next((h for h in self.hunts if h["hunt_id"] == hunt_id), None)
        if not hunt:
            return {"status": "ERROR"}

        query_result = {
            "hunt_id": hunt_id,
            "query_index": query_index,
            "query": hunt["queries"][query_index],
            "results_count": results_count,
            "suspicious_count": suspicious_count,
            "executed_at": datetime.now(timezone.utc).isoformat()
        }
        return query_result

    def record_finding(self, hunt_id: str, finding_type: str, description: str,
                       severity: str, iocs: List[str] = None) -> dict:
        """Enregistre une finding de hunting."""
        finding = {
            "finding_id": f"FIND-{len(self.findings)+1:03d}",
            "hunt_id": hunt_id,
            "type": finding_type,
            "description": description,
            "severity": severity,
            "iocs": iocs or [],
            "recorded_at": datetime.now(timezone.utc).isoformat()
        }
        self.findings.append(finding)

        # Ajouter les IoCs
        for ioc in iocs or []:
            self.iocs.append({
                "value": ioc,
                "source": f"hunt-{hunt_id}",
                "finding_id": finding["finding_id"]
            })

        return finding

    def get_hunting_dashboard(self) -> dict:
        """Dashboard de Threat Hunting."""
        completed = sum(1 for h in self.hunts if h["status"] == HuntingStatus.COMPLETED.value)
        total = len(self.hunts)

        return {
            "organisation": self.org_name,
            "hunts_total": total,
            "hunts_completed": completed,
            "completion_rate": round(completed / total * 100, 1) if total > 0 else 0,
            "findings": len(self.findings),
            "iocs": len(self.iocs)
        }


# --- Démonstration ---
print("=== THREAT HUNTING ENGINE DEMONSTRATION ===")

hunter = ThreatHuntingEngine(org_name="BCC")

# Création de sessions de hunting
hunts = [
    ("HUNT-001", "APT32 PowerShell C2 Beaconing",
     "APT32 uses encoded PowerShell for C2 communication",
     ["T1059.001", "T1071.001"],
     ["SIEM", "EDR", "Network"],
     ["ProcessName=~'powershell.exe' | where CommandLine has '-enc'",
      "| stats count by DestinationIP, DestPort | where count > 50"],
     "HIGH"),
    ("HUNT-002", "Lateral Movement via SMB",
     "Attackers use SMB for lateral movement after initial access",
     ["T1021.002"],
     ["NDR", "SIEM"],
     ["port=445 | stats dc(src_ip) by src_ip, dst_ip | where dc_count > 10"],
     "HIGH"),
    ("HUNT-003", "Credential Dumping Activity",
     "Detect Mimikatz and similar tools for credential dumping",
     ["T1003.001"],
     ["EDR", "SIEM"],
     ["process_name=~'mimikatz.exe' OR cmdline contains 'sekurlsa'"],
     "CRITICAL"),
]

for hid, title, hyp, ttps, sources, queries, priority in hunts:
    hunter.create_hunt(hid, title, hyp, ttps, sources, queries, priority)

# Exécution de requêtes
query_results = [
    ("HUNT-001", 0, 150, 3),
    ("HUNT-001", 1, 50, 2),
    ("HUNT-002", 0, 200, 5),
    ("HUNT-003", 0, 10, 1),
]

for hid, qidx, total, suspicious in query_results:
    hunter.execute_query(hid, qidx, total, suspicious)

# Findings
findings = [
    ("HUNT-001", "Encoded PowerShell C2", "3 hosts with encoded PowerShell C2 beaconing", "HIGH",
     ["185.234.72.91", "update-bcc-cd.org"]),
    ("HUNT-002", "SMB Lateral Movement", "5 hosts with unusual SMB connections", "HIGH", []),
    ("HUNT-003", "Credential Dumping Tool", "Mimikatz execution detected on DC01", "CRITICAL",
     ["mimikatz.exe", "sekurlsa.log"]),
]

for hid, ftype, desc, sev, iocs in findings:
    hunter.record_finding(hid, ftype, desc, sev, iocs)

# Dashboard
dashboard = hunter.get_hunting_dashboard()
print(f"\n[+] Threat Hunting Dashboard :")
print(f"    Hunts: {dashboard['hunts_completed']}/{dashboard['hunts_total']} ({dashboard['completion_rate']}%)")
print(f"    Findings: {dashboard['findings']}")
print(f"    IoCs: {dashboard['iocs']}")
```

---

## 3) Module — BCC Threat Hunting Program (2h)

### 📖 Programme Threat Hunting BCC

```yaml
# BCC Threat Hunting Program
mission: "Proactively hunt for threats that have evaded automated detection, using hypothesis-driven methodology based on MITRE ATT&CK and threat intelligence"

hunting_schedule:
  frequency: "Weekly"
  duration: "4 hours per session"
  team: "Tier-2 Lead + Tier-3 Threat Hunter + CTI Analyst"
  focus_areas:
    - "Initial Access: Phishing, supply chain, valid accounts"
    - "Execution: PowerShell, WMI, scheduled tasks"
    - "Persistence: Registry, services, scheduled tasks"
    - "Lateral Movement: SMB, RDP, Pass-the-Hash"
    - "Collection: Data staging, screen capture"
    - "Exfiltration: DNS tunneling, C2, encrypted channels"

hypothesis_library:
  - "APT32 uses encoded PowerShell for C2"
  - "Ransomware drops payload via WMI"
  - "Insider copies sensitive files to USB"
  - "Compromised account accesses SWIFT at night"
  - "Lateral movement via SMB from workstation to DC"

data_sources:
  siem: "Splunk/Elastic — logs centralisés"
  edr: "CrowdStrike — processus, fichiers, registre"
  ndr: "Zeek/Suricata — réseau, connexions, DNS"
  identity: "Azure AD — authentifications, accès"
  cloud: "CloudTrail, Office 365 Audit Log"

hunting_tools:
  - "OSQuery: SQL-like queries on endpoints"
  - "KQL/Sigma: SIEM hunting queries"
  - "Velociraptor: Endpoint visibility"
  - "Wireshark/tshark: Network analysis"
  - "Memoryze/Volatility: Memory forensics"

metrics:
  - "Hunting hours per week"
  - "Hypotheses tested per month"
  - "True positives found"
  - "False positives rate"
  - "IOCs produced"
  - "Detection rules added"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MITRE ATT&CK** | Framework de connaissances sur les tactiques et techniques des attaquants |
| **C2** | Command and Control — Canal de commandement et contrôle |
| **EDR** | Endpoint Detection & Response — Détection et réponse sur endpoint |
| **NDR** | Network Detection & Response — Détection et réponse réseau |
| **KQL** | Kusto Query Language — Langage de requête pour Azure Sentinel |
| **Sigma** | Langage de règles de détection agnostique plateforme |
| **OSQuery** | Outil d'interrogation des endpoints avec SQL-like |
| **IoC** | Indicator of Compromise — Indicateur de compromission |
| **TTP** | Tactics, Techniques, and Procedures — Tactiques, techniques et procédures |
| **SIEM** | Security Information & Event Management — Gestion des informations et événements de sécurité |
| **SPL** | Splunk Processing Language — Langage de requête pour Splunk |
| **APT** | Advanced Persistent Threat — Menace persistante avancée |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Qu'est-ce que le **Threat Hunting** et quelle est sa différence avec la détection automatisée ?
- A) Le Threat Hunting est la recherche proactive de menaces qui ont échappé à la détection automatisée — contrairement à la détection passive (SIEM/EDR), le hunter formule des hypothèses basées sur les TTPs MITRE ATT&CK et le CTI, puis investigue activement pour trouver des intrusions invisibles aux outils automatisés
- B) C'est la même chose que la détection automatisée
- C) C'est un outil de sécurité
- D) C'est un type de malware

**Réponse : A**

**Q2 :** Pourquoi le **Threat Hunting** est-il essentiel dans un SOC bancaire face aux APT étatiques ?
- A) Parce que les APT utilisent des techniques furtives (zero-days, living off the land, encryption) qui échappent aux règles statiques — le Threat Hunting basé sur MITRE ATT&CK permet de détecter ces menaces avancées qui n'ont pas encore été patchées ou signaturées
- B) Parce que c'est moins cher que les EDR
- C) Parce que les APT ne sont pas dangereuses
- D) Parce que le hunting remplace le SOC

**Réponse : A**

**Q3 :** Qu'est-ce qu'une **hypothèse de hunting** et comment la formuler efficacement ?
- A) C'est une supposition fondée sur les TTPs MITRE ATT&CK et le CTI concernant la présence d'un attaquant dans l'environnement — elle doit être spécifique (acteur, technique, cible), testable (requête de recherche) et actionnable (si confirmée, déclenche une réponse)
- B) C'est une règle SIEM
- C) C'est un IoC
- D) C'est un playbook SOAR

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
