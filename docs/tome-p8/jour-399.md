# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 399 (6h) : SOC Capstone Project Part 2 — SOC Implementation & Testing (Detection Rules, SOAR Playbooks, CTI Integration, Metrics & Compliance Validation for BCC)

> [!NOTE]
> **Objectif du jour :** Poursuivre le **projet intégrateur SOC BCC** en implémentant les composants techniques : développer les règles de détection SIEM/EDR/NDR, configurer les playbooks SOAR, intégrer le CTI, mettre en place les métriques, et valider la conformité réglementaire.
>
> **Compétences visées :** `S8-CAP-03` (A) — Detection Rules Development & SOAR Playbooks | `S8-CAP-04` (A) — CTI Integration, Metrics Implementation & Compliance Validation

---

## 1) Module — Detection Rules & SOAR Playbooks (2h)

### 📖 Règles de Détection BCC

```yaml
# Detection Rules Portfolio — BCC
detection_rules:
  siem_rules:
    total: 50
    mitre_coverage: "85%"
    categories:
      initial_access: 8
      execution: 10
      persistence: 6
      privilege_escalation: 5
      defense_evasion: 7
      credential_access: 6
      discovery: 5
      lateral_movement: 6
      collection: 5
      exfiltration: 4
      impact: 4

  sample_rules:
    - rule_id: "SIEM-001"
      name: "PowerShell Encoded Command Execution"
      mitre_ttp: "T1059.001"
      platform: "Splunk"
      logic: |
        ProcessName=~'powershell.exe'
        | where CommandLine has '-enc' OR CommandLine has '-encodedcommand'
        | eval risk_score=85
        | where risk_score > 70
      false_positive_rate: "5%"
      true_positive_rate: "95%"

    - rule_id: "SIEM-002"
      name: "Suspicious C2 Beaconing"
      mitre_ttp: "T1071.001"
      platform: "Splunk"
      logic: |
        | stats count by DestinationIP, DestPort
        | where count > 100 AND DestPort in (443, 80, 53)
        | eval risk_score=90
      false_positive_rate: "10%"
      true_positive_rate: "90%"

    - rule_id: "SIEM-003"
      name: "Credential Dumping with Mimikatz"
      mitre_ttp: "T1003.001"
      platform: "CrowdStrike"
      logic: |
        process_name=~'mimikatz.exe'
        OR cmdline contains 'sekurlsa'
        OR cmdline contains 'lsadump'
      false_positive_rate: "2%"
      true_positive_rate: "98%"

  edr_rules:
    total: 30
    coverage: "100% endpoints"

  ndr_rules:
    total: 25
    coverage: "All network segments"

soar_playbooks:
  total: 5
  automation_level: "L1: 70%, L2: 40%"
  playbooks:
    - id: "PB-001"
      name: "Ransomware Response L1"
      incident_type: "RANSOMWARE"
      severity: "P1_CRITICAL"
      steps:
        - "ISOLATE_ENDPOINT: Automated via CrowdStrike"
        - "BLOCK_C2_IPS: Automated via NGFW"
        - "COLLECT_MEMORY_DUMP: Manual"
        - "CREATE_TICKET: Automated via ServiceNow"
        - "NOTIFY_CISO: Automated via Teams"
      avg_execution_time: "45 seconds"
      success_rate: "98%"

    - id: "PB-002"
      name: "Phishing Response L1"
      incident_type: "PHISHING"
      severity: "P2_HIGH"
      steps:
        - "QUARANTINE_EMAIL: Automated via O365"
        - "BLOCK_SENDER_DOMAIN: Automated via Proofpoint"
        - "RESET_PASSWORD: Manual"
        - "CREATE_TICKET: Automated via ServiceNow"
      avg_execution_time: "30 seconds"
      success_rate: "95%"

    - id: "PB-003"
      name: "Data Exfiltration Response"
      incident_type: "DATA_EXFILTRATION"
      severity: "P1_CRITICAL"
      steps:
        - "BLOCK_DESTINATION_IP: Automated via NGFW"
        - "COLLECT_PCAP: Manual"
        - "NOTIFY_DPO: Automated via Teams"
        - "CREATE_TICKET: Automated via ServiceNow"
      avg_execution_time: "60 seconds"
      success_rate: "92%"

    - id: "PB-004"
      name: "Account Takeover Response"
      incident_type: "ACCOUNT_TAKEOVER"
      severity: "P2_HIGH"
      steps:
        - "DISABLE_ACCOUNT: Automated via Azure AD"
        - "RESET_PASSWORD: Automated via Azure AD"
        - "ENFORCE_MFA: Automated via Azure AD"
        - "CREATE_TICKET: Automated via ServiceNow"
      avg_execution_time: "20 seconds"
      success_rate: "99%"

    - id: "PB-005"
      name: "DDoS Mitigation"
      incident_type: "DDOS"
      severity: "P2_HIGH"
      steps:
        - "ENABLE_DDOS_PROTECTION: Automated via NGFW"
        - "RATE_LIMIT: Automated via NGFW"
        - "BLOCK_SOURCE_IPS: Automated via NGFW"
        - "NOTIFY_NOC: Automated via Teams"
      avg_execution_time: "15 seconds"
      success_rate: "97%"
```

---

## 2) Module — CTI Integration & Metrics Implementation (`soc_project_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict, Optional
from enum import Enum

class ProjectStatus(Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    VALIDATED = "VALIDATED"

class SOCProjectEngine:
    """
    Moteur de gestion de projet SOC BCC.
    Suit l'avancement, les livrables et la validation.
    """

    def __init__(self, org_name: str = "BCC"):
        self.org_name = org_name
        self.workstreams: List[dict] = []
        self.deliverables: List[dict] = []
        self.validations: List[dict] = []

    def create_workstream(self, workstream_id: str, name: str, description: str,
                          owner: str, timeline_weeks: int) -> dict:
        """Crée un workstream de projet."""
        workstream = {
            "workstream_id": workstream_id,
            "name": name,
            "description": description,
            "owner": owner,
            "timeline_weeks": timeline_weeks,
            "status": ProjectStatus.PLANNED.value,
            "progress": 0.0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.workstreams.append(workstream)
        return workstream

    def add_deliverable(self, deliverable_id: str, workstream_id: str, name: str,
                        description: str, acceptance_criteria: List[str]) -> dict:
        """Ajoute un livrable."""
        deliverable = {
            "deliverable_id": deliverable_id,
            "workstream_id": workstream_id,
            "name": name,
            "description": description,
            "acceptance_criteria": acceptance_criteria,
            "status": ProjectStatus.PLANNED.value,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.deliverables.append(deliverable)
        return deliverable

    def update_progress(self, workstream_id: str, progress: float) -> dict:
        """Met à jour la progression d'un workstream."""
        workstream = next((w for w in self.workstreams if w["workstream_id"] == workstream_id), None)
        if not workstream:
            return {"status": "ERROR"}

        workstream["progress"] = min(max(progress, 0.0), 100.0)
        if workstream["progress"] == 100.0:
            workstream["status"] = ProjectStatus.COMPLETED.value
        elif workstream["progress"] > 0:
            workstream["status"] = ProjectStatus.IN_PROGRESS.value

        return {"workstream_id": workstream_id, "progress": workstream["progress"], "status": workstream["status"]}

    def validate_deliverable(self, deliverable_id: str, validator: str,
                             criteria_met: List[str], criteria_failed: List[str]) -> dict:
        """Valide un livrable."""
        validation = {
            "deliverable_id": deliverable_id,
            "validator": validator,
            "criteria_met": criteria_met,
            "criteria_failed": criteria_failed,
            "status": ProjectStatus.VALIDATED.value if not criteria_failed else "PARTIAL",
            "validated_at": datetime.now(timezone.utc).isoformat()
        }
        self.validations.append(validation)
        return validation

    def get_project_dashboard(self) -> dict:
        """Dashboard de projet SOC."""
        completed = sum(1 for w in self.workstreams if w["status"] == ProjectStatus.COMPLETED.value)
        in_progress = sum(1 for w in self.workstreams if w["status"] == ProjectStatus.IN_PROGRESS.value)
        total = len(self.workstreams)
        avg_progress = sum(w["progress"] for w in self.workstreams) / total if total > 0 else 0

        return {
            "organisation": self.org_name,
            "workstreams_total": total,
            "workstreams_completed": completed,
            "workstreams_in_progress": in_progress,
            "avg_progress": round(avg_progress, 1),
            "deliverables": len(self.deliverables),
            "validations": len(self.validations)
        }


# --- Démonstration ---
print("=== SOC PROJECT ENGINE DEMONSTRATION ===")

project = SOCProjectEngine(org_name="BCC")

# Workstreams
workstreams = [
    ("WS-001", "Detection Engineering", "Develop and deploy detection rules", "Detection Engineer", 12),
    ("WS-002", "SOAR Automation", "Develop and deploy playbooks", "SOAR Engineer", 8),
    ("WS-003", "CTI Integration", "Implement CTI program and F3EAD", "CTI Analyst", 10),
    ("WS-004", "Metrics & Dashboard", "Implement SOC metrics and dashboards", "SOC Manager", 6),
    ("WS-005", "Compliance & Governance", "Implement compliance framework", "Compliance Officer", 8),
]

for wid, name, desc, owner, timeline in workstreams:
    project.create_workstream(wid, name, desc, owner, timeline)

# Livrables
deliverables = [
    ("DEL-001", "WS-001", "50 SIEM Detection Rules", "Develop 50 detection rules across MITRE tactics",
     ["MITRE coverage > 85%", "FP rate < 30%", "All rules tested"]),
    ("DEL-002", "WS-001", "EDR Detection Rules", "Develop 30 EDR behavioral rules",
     ["100% endpoint coverage", "Detection rate > 95%"]),
    ("DEL-003", "WS-002", "5 SOAR Playbooks", "Develop L1/L2 playbooks for top incidents",
     ["5 playbooks deployed", "Automation L1 > 70%", "Success rate > 95%"]),
    ("DEL-004", "WS-003", "CTI Program", "Implement F3EAD cycle and CTI platform",
     ["MISP/OpenCTI deployed", "100+ IoCs", "Weekly reports"]),
    ("DEL-005", "WS-004", "SOC Dashboard", "Real-time metrics dashboard",
     ["15+ KPIs", "Grafana dashboards", "Board reporting"]),
    ("DEL-006", "WS-005", "Compliance Framework", "NIS2/DORA/RGPD compliance",
     ["All controls assessed", "Audit ready", "Automated reporting"]),
]

for did, wsid, name, desc, criteria in deliverables:
    project.add_deliverable(did, wsid, name, desc, criteria)

# Mise à jour progression
progress_updates = [
    ("WS-001", 75.0), ("WS-002", 80.0), ("WS-003", 60.0),
    ("WS-004", 90.0), ("WS-005", 70.0),
]

for wid, progress in progress_updates:
    project.update_progress(wid, progress)

# Validations
validations = [
    ("DEL-001", "SOC Manager", ["MITRE coverage > 85%", "FP rate < 30%", "All rules tested"], []),
    ("DEL-002", "SOC Manager", ["100% endpoint coverage", "Detection rate > 95%"], []),
    ("DEL-003", "SOC Manager", ["5 playbooks deployed", "Automation L1 > 70%"], []),
]

for did, validator, met, failed in validations:
    project.validate_deliverable(did, validator, met, failed)

# Dashboard
dashboard = project.get_project_dashboard()
print(f"\n[+] SOC Project Dashboard :")
print(f"    Workstreams: {dashboard['workstreams_completed']}/{dashboard['workstreams_total']} completed")
print(f"    In progress: {dashboard['workstreams_in_progress']}")
print(f"    Avg progress: {dashboard['avg_progress']}%")
print(f"    Deliverables: {dashboard['deliverables']}")
print(f"    Validations: {dashboard['validations']}")
```

---

## 3) Module — Compliance Validation & Testing (2h)

### 📖 Validation de Conformité BCC

```yaml
# Compliance Validation — BCC
frameworks:
  nis2:
    status: "IN_PROGRESS"
    progress: 75
    requirements:
      - id: "NIS2-001"
        requirement: "Incident notification within 72 hours"
        status: "COMPLIANT"
        evidence: "Procedure documented and tested"
      - id: "NIS2-002"
        requirement: "Risk management measures"
        status: "PARTIALLY_COMPLIANT"
        evidence: "Risk assessment completed, some gaps in patch management"
      - id: "NIS2-003"
        requirement: "Supply chain security"
        status: "IN_PROGRESS"
        evidence: "Vendor assessment program launched"

  dora:
    status: "IN_PROGRESS"
    progress: 60
    requirements:
      - id: "DORA-001"
        requirement: "ICT risk management framework"
        status: "PARTIALLY_COMPLIANT"
        evidence: "Framework documented, implementation ongoing"
      - id: "DORA-002"
        requirement: "Incident reporting"
        status: "COMPLIANT"
        evidence: "72h notification process established"

  rgpd:
    status: "COMPLIANT"
    progress: 90
    requirements:
      - id: "RGPD-001"
        requirement: "Data protection officer appointed"
        status: "COMPLIANT"
      - id: "RGPD-002"
        requirement: "DPIA for high-risk processing"
        status: "COMPLIANT"
      - id: "RGPD-003"
        requirement: "Data subject rights automation"
        status: "PARTIALLY_COMPLIANT"

  cobac:
    status: "IN_PROGRESS"
    progress: 70
    requirements:
      - id: "COBAC-001"
        requirement: "Quarterly security reports"
        status: "COMPLIANT"
        evidence: "Reports submitted Q1-Q2 2026"
      - id: "COBAC-002"
        requirement: "Internal audit"
        status: "PARTIALLY_COMPLIANT"
        evidence: "Audit ongoing, preliminary findings positive"

  iso27001:
    status: "IN_PROGRESS"
    progress: 50
    requirements:
      - id: "ISO-001"
        requirement: "ISMS policy"
        status: "COMPLIANT"
        evidence: "Policy documented and approved"
      - id: "ISO-002"
        requirement: "Risk assessment"
        status: "COMPLIANT"
        evidence: "Risk assessment completed"
      - id: "ISO-003"
        requirement: "Statement of Applicability"
        status: "IN_PROGRESS"
        evidence: "SoA in preparation"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SIEM** | Security Information & Event Management |
| **EDR/XDR** | Endpoint/Extended Detection and Response |
| **NDR** | Network Detection & Response |
| **SOAR** | Security Orchestration, Automation and Response |
| **CTI** | Cyber Threat Intelligence |
| **UEBA** | User and Entity Behavior Analytics |
| **MTTD** | Mean Time to Detect |
| **MTTR** | Mean Time to Respond/Remediate |
| **FP/TP** | False Positive / True Positive |
| **MITRE ATT&CK** | Framework de connaissances sur les tactiques et techniques des attaquants |
| **TTP** | Tactics, Techniques, and Procedures |
| **IoC** | Indicator of Compromise |
| **KQL** | Kusto Query Language |
| **SPL** | Splunk Processing Language |
| **Sigma** | Langage de règles de détection agnostique plateforme |
| **YARA** | Outil de détection de motifs pour fichiers malveillants |
| **STIX/TAXII** | Standards d'échange de renseignement |
| **F3EAD** | Find, Fix, Finish, Exploit, Analyze, Disseminate |
| **NIS2** | Directive européenne sur la sécurité des réseaux et systèmes d'information |
| **DORA** | Digital Operational Resilience Act |
| **RGPD** | Règlement Général sur la Protection des Données |
| **COBAC** | Commission Bancaire de la RDC |
| **ISO 27001** | Norme internationale pour les Systèmes de Management de la Sécurité de l'Information |
| **ROI** | Return on Investment |
| **RTO/RPO** | Recovery Time/Point Objective |
| **SLA** | Service Level Agreement |
| **ICS** | Incident Command System |
| **PIR** | Priority Intelligence Requirement |
| **OSINT** | Open Source Intelligence |
| **ISAC** | Information Sharing and Analysis Center |
| **CERT** | Computer Emergency Response Team |
| **DPO** | Data Protection Officer |
| **DPIA** | Data Protection Impact Assessment |
| **CISO** | Chief Information Security Officer |
| **BCC** | Banque Centrale du Congo |
| **SWIFT** | Society for Worldwide Interbank Financial Telecommunication |
| **RTGS** | Real-Time Gross Settlement |
| **BEC** | Business Email Compromise |
| **APT** | Advanced Persistent Threat |
| **C2** | Command and Control |
| **HAProxy** | Load balancer open source |
| **Kafka** | Plateforme de streaming d'événements |
| **RabbitMQ** | Message broker |
| **Prometheus** | Monitoring et alerting |
| **Grafana** | Visualisation de métriques |
| **PowerBI** | Business intelligence Microsoft |
| **Azure AD** | Azure Active Directory |
| **Office 365** | Suite productivité Microsoft |
| **AWS** | Amazon Web Services |
| **Azure** | Microsoft Azure |
| **MISP** | Malware Information Sharing Platform |
| **OpenCTI** | Open Cyber Threat Intelligence |
| **Recorded Future** | Plateforme de threat intelligence commerciale |
| **Ansible** | Outil d'automatisation |
| **Terraform** | Infrastructure as Code |
| **Docker** | Plateforme de conteneurs |
| **Kubernetes** | Orchestration de conteneurs |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quels sont les critères de sélection des technologies pour un SOC bancaire ?
- A) Critères techniques (maturité, intégrations, performance), critères sécurité (chiffrement, authentification, audit), critères réglementaires (conformité NIS2/DORA/RGPD), critères opérationnels (support 24/7, formation, ROI) — le choix doit equilibrer innovation et stabilité pour un environnement bancaire critique
- B) Le moins cher possible
- C) Le plus récent possible
- D) Ce que les concurrents utilisent

**Réponse : A**

**Q2 :** Pourquoi l'architecture SOC doit-elle être **haute disponibilité (HA)** pour une banque centrale ?
- A) Parce que le SOC est un service critique 24/7 — une indisponibilité du SOC pendant un incident majeur (ransomware, fraude SWIFT) empêcherait la détection et la réponse, causant des pertes financières massives et des risques systémiques
- B) Parce que c'est moins cher
- C) Parce que les outils open source ne sont pas fiables
- D) Parce que c'est obligatoire par la loi

**Réponse : A**

**Q3 :** Qu'est-ce qu'un **diagramme d'architecture SOC** et à qui s'adresse-t-il ?
- A) C'est une représentation visuelle des composants SOC, des flux de données et des intégrations — il s'adresse à plusieurs audiences : technique (ingénieurs SOC), management (SOC Manager, CISO) et direction (COMEX, Board) pour justifier les investissements et coordonner les équipes
- B) C'est un document technique pour les ingénieurs uniquement
- C) C'est un document de conformité
- D) C'est un diagramme réseau classique

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
