# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 397 (6h) : SOC Final Project Documentation & Portfolio — Architecture Documentation, Implementation Guides, Runbooks, Lessons Learned & BCC SOC Professional Portfolio

> [!NOTE]
> **Objectif du jour :** Documenter le projet intégrateur SOC BCC de manière professionnelle : rédiger la documentation d'architecture, les guides d'implémentation, les runbooks opérationnels, les leçons apprises, et constituer un portfolio professionnel complet pour l'employabilité.
>
> **Compétences visées :** `S8-PORTFOLIO-01` (A) — Professional Documentation & Architecture Documentation | `S8-PORTFOLIO-02` (A) — Runbooks, Lessons Learned & Employment Portfolio

---

## 1) Module — Architecture Documentation (2h)

### 📖 Template de Documentation d'Architecture SOC

```markdown
# Architecture SOC BCC — Document d'Architecture

## 1. Vue d'ensemble

### 1.1 Contexte
La Banque Centrale du Congo (BCC) a engagé la modernisation de son SOC pour répondre aux menaces croissantes sur ses infrastructures financières critiques.

### 1.2 Objectifs
- Détecter les menaces avancées (APT, ransomware, fraude)
- Répondre aux incidents en temps réel
- Anticiper les campagnes d'attaquants
- Respecter les cadres réglementaires (NIS2, DORA, COBAC)
- Mesurer et démontrer la valeur business

### 1.3 Périmètre
- Infrastructure on-premise : DC01, DC02, SWIFT, Core Banking
- Cloud : Azure AD, Office 365, AWS workloads
- Endpoints : 500+ workstations, 50+ serveurs

## 2. Architecture détaillée

### 2.1 Couche Collecte
| Source | Outil | Format | Destination |
|:---|:---|:---|:---|
| Windows Events | Winlogbeat | JSON | Splunk/Elastic |
| Linux Syslog | Filebeat | JSON | Splunk/Elastic |
| Network Traffic | Zeek | JSON | Splunk/Elastic |
| EDR Alerts | CrowdStrike | JSON | Splunk/Elastic |
| Cloud Logs | CloudTrail/Graph API | JSON | Splunk/Elastic |

### 2.2 Couche Détection
| Couche | Outil | Règles | Coverage |
|:---|:---|:---|:---:|
| SIEM | Splunk ES | 50+ | 85% MITRE |
| EDR | CrowdStrike | Behavioral + ML | 100% endpoints |
| NDR | Zeek/Suricata | 30+ | Network segments |
| UEBA | Splunk UBA | 15+ | Users + Entities |

### 2.3 Couche Réponse
| Composant | Outil | Rôle |
|:---|:---|:---|
| SOAR | Cortex XSOAR | Orchestration playbooks |
| Ticketing | ServiceNow | Case management |
| Forensics | Autopsy/Volatility | Investigation |
| Communication | Teams/Signal | War room |

### 2.4 Couche Intelligence
| Composant | Outil | Rôle |
|:---|:---|:---|
| CTI Platform | MISP/OpenCTI | IoC management |
| Threat Feeds | STIX/TAXII | Automated intel |
| Threat Hunting | KQL/Sigma | Proactive hunting |

### 2.5 Couche Gouvernance
| Composant | Outil | Rôle |
|:---|:---|:---|
| Metrics | Grafana | Dashboards |
| Compliance | OpenCTI | NIS2/DORA/RGPD |
| Reporting | PowerBI | Board reports |

## 3. Choix technologiques

### 3.1 Justification SIEM (Splunk ES)
- Maturité : 15+ ans d'expérience enterprise
- Intégrations : 1000+ apps et connecteurs
- Language : SPL puissant et expressif
- CIM : Common Information Model pour normalisation
- Alternatives : Elastic SIEM (budget limité), Microsoft Sentinel (Azure-centric)

### 3.2 Justification EDR (CrowdStrike)
- Détection comportementale ML
- Couverture endpoint 100%
- Intégration Threat Graph
- Automatisation Falcon OverWatch
- Alternatives : Microsoft Defender EDR (cost-effective), SentinelOne (autonomous)

## 4. Sécurité de l'architecture

### 4.1 Sécurité réseau
- Segmentation : VLAN SOC isolé
- Accès : VPN + MFA obligatoire
- Monitoring : NDR sur le réseau SOC
- Chiffrement : TLS 1.3 pour tous les flux

### 4.2 Sécurité des accès
- Zero Trust : Never trust, always verify
- PAM : CyberArk pour comptes privilégiés SOC
- MFA : FIDO2 passwordless
- Audit : Toutes les actions SOC tracées

### 4.3 Disponibilité
- Haute disponibilité : Cluster Splunk 3 nodes
- Backup : Sauvegardes quotidiennes, rétention 1 an
- PRA : Site de secours à Lubumbashi
- Tests : Tests de basculement trimestriels
```

---

## 2) Module — Runbooks & Implementation Guides (`runbooks_generator.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict, Optional
from enum import Enum

class RunbookType(Enum):
    DETECTION = "DETECTION"
    RESPONSE = "RESPONSE"
    HUNTING = "HUNTING"
    COMPLIANCE = "COMPLIANCE"
    ONBOARDING = "ONBOARDING"

class RunbookGenerator:
    """
    Générateur de runbooks SOC pour documentation opérationnelle.
    """

    def __init__(self, org_name: str = "BCC"):
        self.org_name = org_name
        self.runbooks: List[dict] = []

    def create_runbook(self, runbook_id: str, name: str, runbook_type: RunbookType,
                       description: str, steps: List[dict], owner: str,
                       last_updated: str = None) -> dict:
        """Crée un runbook opérationnel."""
        runbook = {
            "runbook_id": runbook_id,
            "name": name,
            "type": runbook_type.value,
            "description": description,
            "steps": steps,
            "owner": owner,
            "last_updated": last_updated or datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.runbooks.append(runbook)
        return runbook

    def get_runbook_dashboard(self) -> dict:
        """Dashboard des runbooks."""
        by_type = {}
        for rb in self.runbooks:
            rtype = rb["type"]
            by_type[rtype] = by_type.get(rtype, 0) + 1

        return {
            "organisation": self.org_name,
            "total_runbooks": len(self.runbooks),
            "by_type": by_type
        }


# --- Démonstration ---
print("=== RUNBOOK GENERATOR DEMONSTRATION ===")

generator = RunbookGenerator(org_name="BCC")

# Création de runbooks
runbooks = [
    ("RB-001", "Ransomware Response L1", RunbookType.RESPONSE,
     "Automated response to ransomware detection",
     [{"step": 1, "action": "Isolate endpoint", "tool": "CrowdStrike"},
      {"step": 2, "action": "Block C2 IP", "tool": "Palo Alto NGFW"},
      {"step": 3, "action": "Create incident ticket", "tool": "ServiceNow"},
      {"step": 4, "action": "Notify SOC team", "tool": "Teams"}],
     "SOC Tier-1"),

    ("RB-002", "Phishing Investigation", RunbookType.RESPONSE,
     "Investigate and remediate phishing incidents",
     [{"step": 1, "action": "Quarantine email", "tool": "Office 365"},
      {"step": 2, "action": "Check user account", "tool": "Azure AD"},
      {"step": 3, "action": "Reset password", "tool": "Azure AD"},
      {"step": 4, "action": "Block sender domain", "tool": "Proofpoint"}],
     "SOC Tier-1"),

    ("RB-003", "MITRE ATT&CK T1059 Hunting", RunbookType.HUNTING,
     "Hunt for PowerShell execution anomalies",
     [{"step": 1, "action": "Run KQL query", "tool": "Splunk"},
      {"step": 2, "action": "Analyze results", "tool": "Manual"},
      {"step": 3, "action": "Validate TP/FP", "tool": "Manual"},
      {"step": 4, "action": "Update detection rules", "tool": "Sigma"}],
     "SOC Tier-3"),

    ("RB-004", "NIS2 Incident Notification", RunbookType.COMPLIANCE,
     "NIS2 72h incident notification procedure",
     [{"step": 1, "action": "Assess incident severity", "tool": "Manual"},
      {"step": 2, "action": "Fill notification form", "tool": "COBAC Portal"},
      {"step": 3, "action": "Get CISO approval", "tool": "Manual"},
      {"step": 4, "action": "Submit notification", "tool": "COBAC Portal"}],
     "CISO Office"),

    ("RB-005", "New Analyst Onboarding", RunbookType.ONBOARDING,
     "Onboarding process for new SOC analysts",
     [{"step": 1, "action": "Create accounts", "tool": "Azure AD"},
      {"step": 2, "action": "Assign tools access", "tool": "Manual"},
      {"step": 3, "action": "Schedule training", "tool": "LMS"},
      {"step": 4, "action": "Assign mentor", "tool": "Manual"}],
     "SOC Manager"),
]

for rid, name, rtype, desc, steps, owner in runbooks:
    generator.create_runbook(rid, name, rtype, desc, steps, owner)

# Dashboard
dashboard = generator.get_runbook_dashboard()
print(f"\n[+] Runbook Dashboard :")
print(f"    Total runbooks: {dashboard['total_runbooks']}")
for rtype, count in dashboard["by_type"].items():
    print(f"    {rtype}: {count}")
```

---

## 3) Module — BCC SOC Employment Portfolio (2h)

### 📖 Portfolio d'Employabilité

```markdown
# Portfolio SOC Blue Team — [Nom du Candidat]

## Profil
**Poste cible :** SOC Analyst / Detection Engineer / Threat Hunter
**Secteur :** Bancaire / Financial Services
**Localisation :** Kinshasa, RDC / International

## Compétences Techniques

### Détection & SIEM
- **Splunk ES** : 50+ règles SPL, CIM, Risk-Based Alerting
- **Elastic SIEM** : ECS, detection rules, KQL
- **Sigma** : 30+ règles cross-platform
- **MITRE ATT&CK** : Cartographie 85% coverage

### EDR/XDR
- **CrowdStrike Falcon** : Détection comportementale, isolation, forensique
- **Microsoft Defender** : Advanced Threat Protection
- **SentinelOne** : Autonomous Response

### Réponse & Automatisation
- **Cortex XSOAR** : 5+ playbooks, intégrations API
- **Shuffle** : Workflows low-code
- **Ansible** : Automatisation infrastructure

### Threat Intelligence
- **MISP/OpenCTI** : Gestion IoCs, F3EAD, STIX/TAXII
- **Recorded Future** : Threat feeds commerciales
- **OSINT** : Collection sources ouvertes

### DFIR
- **Volatility 3** : Forensique mémoire
- **Autopsy** : Forensique disque
- **Zeek/Suricata** : Analyse réseau

### Cloud Security
- **Azure Security Center** : Cloud workload protection
- **AWS Security Hub** : Cloud security posture
- **Microsoft Cloud App Security** : CASB/SSPM

### Conformité
- **NIS2** : Notification 72h, mesures de sécurité
- **DORA** : Résilience ICT, tests
- **RGPD** : Protection données, DPO
- **ISO 27001** : SMSI, audit interne

### Développement
- **Python** : Scripts SOC, automatisation, DFIR
- **KQL/SPL** : Requêtes SIEM
- **Sigma** : Règles de détection
- **YARA** : Détection malware
- **JSON/YAML** : Configuration, APIs

## Projets

### 1. SOC Architecture BCC (2026)
- Conception architecture SOC complète pour banque centrale
- 50+ règles SIEM, 5 playbooks SOAR
- MITRE coverage 85%, MTTD < 15min
- ROI 3 ans : 233%

### 2. Detection Engineering CI/CD (2026)
- Pipeline Detection as Code avec GitHub Actions
- 30+ règles Sigma/KQL versionnées
- Tests automatiques avant déploiement
- Coverage MITRE automatisée

### 3. Threat Intelligence Program (2026)
- Programme CTI opérationnel BCC
- F3EAD cycle implémenté
- 100+ IoCs collectés et diffusés
- Intégration SIEM/EDR/SOAR

## Certifications
- [ ] GSEC — GIAC Security Essentials
- [ ] CySA+ — CompTIA Cybersecurity Analyst
- [ ] GCIH — GIAC Certified Incident Handler
- [ ] CISSP — Certified Information Systems Security Professional (en cours)

## Références
- Projets GitHub : [lien]
- LinkedIn : [lien]
- Certifications : [liens]
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SOC** | Security Operations Center — Centre des opérations de sécurité |
| **SIEM** | Security Information & Event Management — Gestion des informations et événements de sécurité |
| **EDR/XDR** | Endpoint/Extended Detection and Response |
| **NDR** | Network Detection & Response |
| **SOAR** | Security Orchestration, Automation and Response |
| **CTI** | Cyber Threat Intelligence |
| **MITRE ATT&CK** | Framework de connaissances sur les tactiques et techniques des attaquants |
| **TTP** | Tactics, Techniques, and Procedures — Tactiques, techniques et procédures |
| **IoC** | Indicator of Compromise — Indicateur de compromission |
| **KQL** | Kusto Query Language — Langage de requête pour Azure Sentinel |
| **SPL** | Splunk Processing Language — Langage de requête pour Splunk |
| **Sigma** | Langage de règles de détection agnostique plateforme |
| **YARA** | Outil de détection de motifs pour fichiers malveillants |
| **NIS2** | Directive européenne sur la sécurité des réseaux et systèmes d'information |
| **DORA** | Digital Operational Resilience Act |
| **RGPD** | Règlement Général sur la Protection des Données |
| **COBAC** | Commission Bancaire de la RDC |
| **ISO 27001** | Norme internationale pour les Systèmes de Management de la Sécurité de l'Information |
| **ROI** | Return on Investment — Retour sur investissement |
| **MTTD** | Mean Time to Detect — Temps moyen de détection |
| **MTTR** | Mean Time to Respond/Remediate — Temps moyen de réponse/remédiation |
| **FP/TP** | False Positive / True Positive — Faux positif / Vrai positif |
| **C2** | Command and Control — Canal de commandement et contrôle |
| **APT** | Advanced Persistent Threat — Menace persistante avancée |
| **ML/AI** | Machine Learning / Artificial Intelligence |
| **SSPM** | SaaS Security Posture Management |
| **CASB** | Cloud Access Security Broker |
| **CWPP** | Cloud Workload Protection Platform |
| **CSPM** | Cloud Security Posture Management |
| **DLP** | Data Loss Prevention |
| **SaaS** | Software as a Service |
| **IAM** | Identity and Access Management |
| **ZTA** | Zero Trust Architecture |
| **ICS** | Incident Command System |
| **F3EAD** | Find, Fix, Finish, Exploit, Analyze, Disseminate |
| **PIR** | Priority Intelligence Requirement |
| **OSINT** | Open Source Intelligence |
| **ISAC** | Information Sharing and Analysis Center |
| **CERT** | Computer Emergency Response Team |
| **DPO** | Data Protection Officer |
| **DPIA** | Data Protection Impact Assessment |
| **UEBA** | User and Entity Behavior Analytics |
| **RTO/RPO** | Recovery Time/Point Objective |
| **GSEC** | GIAC Security Essentials Certification |
| **CISSP** | Certified Information Systems Security Professional |
| **CCSP** | Certified Cloud Security Professional |
| **GCIH** | GIAC Certified Incident Handler |
| **OSCP** | Offensive Security Certified Professional |
| **CRTO** | Certified Red Team Operator |
| **CISM** | Certified Information Security Manager |
| **DFIR** | Digital Forensics & Incident Response |
| **REST** | Representational State Transfer |
| **JSON** | JavaScript Object Notation |
| **YAML** | YAML Ain't Markup Language |
| **OpenAPI** | Spécification d'API REST |
| **OAuth** | Protocole d'autorisation |
| **OIDC** | OpenID Connect |
| **mTLS** | Mutual TLS |
| **RBAC** | Role-Based Access Control |
| **Kafka** | Plateforme de streaming d'événements |
| **ITSM** | IT Service Management |
| **API** | Application Programming Interface |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Pourquoi la **documentation professionnelle** est-elle essentielle dans un projet SOC ?
- A) Parce qu'elle permet la transmission des connaissances, l'audit réglementaire, la formation des nouveaux analystes, et la reproductibilité des procédures — sans documentation, le SOC dépend de connaissances tacites qui partent avec les employés
- B) Parce que c'est obligatoire pour l'obtention du diplôme
- C) Parce que la documentation améliore la sécurité technique
- D) Parce que les recruteurs ne regardent que les certifications

**Réponse : A**

**Q2 :** Qu'est-ce qu'un **runbook opérationnel** et quels éléments doit-il contenir ?
- A) C'est un guide pas-à-pas pour une procédure SOC spécifique (ex: réponse ransomware, investigation phishing) — il contient les étapes détaillées, les outils à utiliser, les critères de décision, les escalades et les contacts d'urgence
- B) C'est un rapport d'incident
- C) C'est un document de conformité
- D) C'est un guide de formation

**Réponse : A**

**Q3 :** Comment un **portfolio SOC** différencie-t-il un candidat sur le marché de l'emploi bancaire ?
- A) Il démontre des compétences pratiques vérifiables (architecture, règles, playbooks, CTI, forensique) dans un contexte bancaire réaliste — il prouve que le candidat peut opérer un SOC, pas seulement théoriser
- B) Parce que c'est obligatoire pour les entretiens
- C) Parce que les recruteurs ne regardent que les certifications
- D) Parce que le portfolio remplace l'expérience professionnelle

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
