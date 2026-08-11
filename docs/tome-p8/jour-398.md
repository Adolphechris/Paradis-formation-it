# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 398 (6h) : SOC Capstone Project Part 1 — SOC Architecture Design for BCC (Detailed Design, Technology Stack, Network Diagrams & Security Zones)

> [!NOTE]
> **Objectif du jour :** Détailler la conception architecturale du SOC BCC : définir le stack technologique complet, concevoir les zones réseau (DMZ, VLAN SOC, segments critiques), documenter les flux de données, et produire les schémas d'architecture détaillés pour l'infrastructure Blue Team.
>
> **Compétences visées :** `S8-CAP-01A` (A) — SOC Technology Stack & Network Architecture | `S8-CAP-01B` (A) — Security Zones, Data Flows & Detailed Diagrams

---

## 1) Module — SOC Technology Stack & Selection (2h)

### 📖 Narration/Intuition

Le choix des technologies SOC pour une banque centrale repose sur 4 piliers :
- **Maturité** : solutions éprouvées en environnement critique
- **Intégration** : capacité à interopérer avec l'existant bancaire
- **Performance** : support du volume de transactions BCC (2M/jour)
- **Souveraineté** : respect des réglementations locales et internationales

```
[ SOC TECHNOLOGY STACK — BCC ]

COUCHE            SOLUTION PRINCIPALE     SOLUTION ALTERNATIVE
────────────────  ──────────────────────  ─────────────────────
COLLECTE          Winlogbeat/Filebeat     NXLog / Syslog-ng
                  + Zeek/Suricata         + Bro

SIEM              Splunk ES 9.x           Elastic SIEM / Sentinel
                  (CIM, SPL, Risk-Based)  (ECS, KQL)

EDR               CrowdStrike Falcon      Microsoft Defender
                  (Behavioral AI)         (Cost-effective)

SOAR              Cortex XSOAR            Shuffle / n8n
                  (Enterprise)            (Open source)

CTI               MISP + OpenCTI          Anomali + Recorded Future
                  (STIX/TAXII)            (Commercial feeds)

METRICS           Grafana + Prometheus    PowerBI + Azure Monitor
                  (Open source)           (Microsoft ecosystem)

FORENSICS         Volatility 3 + Autopsy  Rekall + FTK Imager
                  (Memory + Disk)         (Proprietary)

STORAGE           MinIO / S3              SAN / NAS on-prem
                  (Immutable backups)     (Traditional)
```

### Matrice de Sélection Technologique

| Critère | Poids | Splunk ES | Elastic SIEM | Sentinel | Score BCC |
|:---|:---:|:---:|:---:|:---:|:---:|
| Maturité | 20% | 5 | 4 | 3 | **Splunk ES** |
| Intégrations | 20% | 5 | 4 | 4 | **Splunk ES** |
| Performance | 15% | 5 | 4 | 4 | **Splunk ES** |
| Coût | 15% | 2 | 5 | 4 | **Elastic SIEM** |
| Réglementaire | 15% | 4 | 4 | 5 | **Sentinel** |
| Support local | 15% | 3 | 4 | 5 | **Sentinel** |
| **SCORE TOTAL** | | **3.9** | **4.1** | **4.3** | **Sentinel** |

> **Recommandation BCC** : Sentinel (Microsoft) pour l'écosystème Azure AD/Office 365 existant, avec Splunk ES comme SIEM secondaire pour la maturité enterprise.

---

## 2) Module — Network Architecture & Security Zones (`soc_network_architecture.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict, Optional
from enum import Enum

class ZoneType(Enum):
    CRITICAL = "CRITICAL"
    SENSITIVE = "SENSITIVE"
    GENERAL = "GENERAL"
    GUEST = "GUEST"
    SOC = "SOC"

class SOCNetworkArchitecture:
    """
    Conception de l'architecture réseau SOC BCC.
    Zones de sécurité, VLANs, flux de données, pare-feu.
    """

    def __init__(self, org_name: str = "BCC"):
        self.org_name = org_name
        self.zones: Dict[str, dict] = {}
        self.data_flows: List[dict] = []
        self.firewall_rules: List[dict] = []

    def define_zone(self, zone_id: str, name: str, zone_type: ZoneType,
                    description: str, allowed_services: List[str]) -> dict:
        """Définit une zone de sécurité réseau."""
        zone = {
            "zone_id": zone_id,
            "name": name,
            "type": zone_type.value,
            "description": description,
            "allowed_services": allowed_services,
            "vlan_id": 10 + len(self.zones),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.zones[zone_id] = zone
        return zone

    def define_data_flow(self, flow_id: str, source_zone: str, dest_zone: str,
                         protocol: str, port: int, frequency: str) -> dict:
        """Définit un flux de données entre zones."""
        flow = {
            "flow_id": flow_id,
            "source_zone": source_zone,
            "dest_zone": dest_zone,
            "protocol": protocol,
            "port": port,
            "frequency": frequency,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.data_flows.append(flow)
        return flow

    def add_firewall_rule(self, rule_id: str, source: str, destination: str,
                          action: str, protocol: str, port: int, description: str) -> dict:
        """Ajoute une règle de pare-feu."""
        rule = {
            "rule_id": rule_id,
            "source": source,
            "destination": destination,
            "action": action,
            "protocol": protocol,
            "port": port,
            "description": description,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.firewall_rules.append(rule)
        return rule

    def get_network_architecture(self) -> dict:
        """Résumé de l'architecture réseau SOC."""
        return {
            "organisation": self.org_name,
            "zones": len(self.zones),
            "data_flows": len(self.data_flows),
            "firewall_rules": len(self.firewall_rules)
        }


# --- Démonstration ---
print("=== SOC NETWORK ARCHITECTURE DEMONSTRATION ===")

net = SOCNetworkArchitecture(org_name="BCC")

# Définition des zones
zones = [
    ("ZONE-01", "SWIFT Critical", ZoneType.CRITICAL, "SWIFT production servers", ["SWIFT", "Database", "HSM"]),
    ("ZONE-02", "Core Banking", ZoneType.CRITICAL, "Core banking system", ["Database", "Application", "Backup"]),
    ("ZONE-03", "Corporate LAN", ZoneType.GENERAL, "Corporate users and workstations", ["Internet", "Email", "File"]),
    ("ZONE-04", "SOC Operations", ZoneType.SOC, "SOC analysts and tools", ["SIEM", "SOAR", "CTI"]),
    ("ZONE-05", "DMZ", ZoneType.GUEST, "Public-facing services", ["Web", "Mail", "VPN"]),
]

for zid, name, ztype, desc, services in zones:
    net.define_zone(zid, name, ztype, desc, services)

# Flux de données
flows = [
    ("FLOW-001", "ZONE-01", "ZONE-04", "TCP", 5044, "Real-time"),
    ("FLOW-002", "ZONE-02", "ZONE-04", "TCP", 5044, "Real-time"),
    ("FLOW-003", "ZONE-03", "ZONE-04", "TCP", 5044, "Real-time"),
    ("FLOW-004", "ZONE-05", "ZONE-04", "TCP", 514, "Real-time"),
    ("FLOW-005", "ZONE-04", "INTERNET", "TCP", 443, "Real-time"),
]

for fid, src, dst, proto, port, freq in flows:
    net.define_data_flow(fid, src, dst, proto, port, freq)

# Règles de pare-feu
rules = [
    ("FW-001", "ZONE-03", "ZONE-01", "DENY", "TCP", 445, "Block SMB from corporate to SWIFT"),
    ("FW-002", "ZONE-03", "ZONE-02", "DENY", "TCP", 1433, "Block SQL from corporate to Core Banking"),
    ("FW-003", "ZONE-01", "ZONE-04", "ALLOW", "TCP", 5044, "Allow SWIFT logs to SIEM"),
    ("FW-004", "ZONE-04", "INTERNET", "ALLOW", "TCP", 443, "Allow SOC to internet for CTI"),
    ("FW-005", "ZONE-05", "ZONE-03", "DENY", "ALL", 0, "Block DMZ from internal access"),
]

for rid, src, dst, action, proto, port, desc in rules:
    net.add_firewall_rule(rid, src, dst, action, proto, port, desc)

# Résumé
summary = net.get_network_architecture()
print(f"\n[+] SOC Network Architecture :")
print(f"    Zones: {summary['zones']}")
print(f"    Data flows: {summary['data_flows']}")
print(f"    Firewall rules: {summary['firewall_rules']}")

print(f"\n[+] Zones defined :")
for zid, zone in net.zones.items():
    print(f"    {zid}: {zone['name']} ({zone['type']}) - VLAN {zone['vlan_id']}")
```

---

## 3) Module — Detailed Architecture Diagrams (2h)

### 📖 Diagrammes d'Architecture Détaillés

```markdown
# Architecture Réseau SOC BCC — Détails

## 1. Zones de Sécurité

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                  NGFW Palo Alto                         │
                    │           (Internet <-> Internal Network)              │
                    └───────────────────────┬───────────────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────────────┐
                    │                                                       │
                    ▼                                                       ▼
            ┌───────────────┐                                   ┌───────────────┐
            │  DMZ (VLAN 50)│                                   │  VPN (VLAN 40)│
            │  - WebServers │                                   │  - Remote SOC │
            │  - Mail       │                                   │  - Admin      │
            │  - Reverse    │                                   │  - Vendors    │
            │    Proxy      │                                   └───────────────┘
            └───────────────┘                                             │
                                                                          │
                    ┌───────────────────────────────────────────────────────┘
                    │
            ┌───────┴────────┐
            │  Core Switch   │
            │  (VLAN Routing)│
            └───────┬────────┘
                    │
      ┌─────────────┼─────────────┐
      │             │             │
      ▼             ▼             ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ VLAN 10  │ │ VLAN 20  │ │ VLAN 30  │
│ CRITICAL │ │SENSITIVE │ │ GENERAL  │
│ SWIFT    │ │Finance   │ │Corporate │
│ Core Bank│ │HR/Legal  │ │Workstations│
└────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │
     │            │            │
     ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ VLAN 70  │ │ VLAN 80  │ │ VLAN 90  │
│ SOC OPS  │ │CTI/Intel │ │Guest/IoT │
│SIEM/SOAR │ │Threat    │ │Isolated  │
│Analysts  │ │Hunting   │ │No lateral│
└──────────┘ └──────────┘ └──────────┘
```

## 2. Data Flow Diagram

```
                    ┌─────────────────────────────────────────────────────┐
                    │              BCC SOC DATA FLOW                       │
                    └─────────────────────────────────────────────────────┘

 ┌──────────┐      TCP/5044     ┌──────────┐      TCP/5044     ┌──────────┐
 │ Winlogbeat│ ───────────────▶│          │ ───────────────▶│          │
 │ (DC01)   │                 │          │                 │          │
 └──────────┘                 │          │                 │          │
                              │  Splunk  │                 │  Grafana │
 ┌──────────┐      TCP/5044     │  ES      │     HTTP/API    │          │
 │ Zeek     │ ───────────────▶│ (SIEM)   │ ───────────────▶│(Dashboard│
 │ (Network)│                 │          │                 │          │
 └──────────┘                 │          │                 └──────────┘
                              │          │
 ┌──────────┐      HTTPS      │          │      HTTPS      ┌──────────┐
 │CrowdStrike│ ──────────────▶│          │ ──────────────▶│ Cortex   │
 │  (EDR)   │                 │          │                 │ XSOAR    │
 └──────────┘                 │          │                 │ (SOAR)   │
                              │          │                 └──────────┘
 ┌──────────┐      HTTPS      │          │      HTTPS      ┌──────────┐
 │ MISP     │ ──────────────▶│          │ ──────────────▶│ ServiceNow│
 │  (CTI)   │                 │          │                 │  (ITSM)   │
 └──────────┘                 └──────────┘                 └──────────┘
```

## 3. High Availability Architecture

```
                    ┌─────────────────────────────────────────────────────┐
                    │              Load Balancer (HAProxy)                │
                    └───────────────────────┬─────────────────────────────┘
                                            │
                    ┌───────────────────────┴─────────────────────────────┐
                    │                                                       │
                    ▼                                                       ▼
            ┌───────────────┐                                   ┌───────────────┐
            │  SIEM Node 1   │                                   │  SIEM Node 2  │
            │  (Active)      │◀─────────────────────────────────▶│  (Passive)    │
            │  Indexer/Search│         Replication                │  Indexer/Search│
            └───────────────┘                                   └───────────────┘
                    │
                    ▼
            ┌───────────────┐
            │  Cluster       │
            │  Master        │
            │  (Coordination)│
            └───────────────┘
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **NGFW** | Next-Generation Firewall — Pare-feu nouvelle génération |
| **DMZ** | Demilitarized Zone — Zone démilitarisée |
| **VLAN** | Virtual Local Area Network — Réseau local virtuel |
| **VPN** | Virtual Private Network — Réseau privé virtuel |
| **SOC** | Security Operations Center — Centre des opérations de sécurité |
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

**Q2 :** Pourquoi l'architecture réseau SOC doit-elle être segmentée en **zones de sécurité** pour une banque centrale ?
- A) Parce que chaque zone (DMZ, VLAN Critique, SOC, Corporate) a des niveaux de confiance et des exigences de sécurité différents — la segmentation limite les mouvements latéraux d'un attaquant et applique le principe du moindre privilège à chaque segment réseau
- B) Parce que c'est moins cher qu'un seul VLAN
- C) Parce que c'est obligatoire par la loi
- D) Parce que les switchs ne supportent pas plus de 10 VLANs

**Réponse : A**

**Q3 :** Qu'est-ce qu'un **diagramme d'architecture détaillé** et quels éléments doit-il contenir pour un SOC BCC ?
- A) Il doit contenir les zones réseau, les VLANs, les flux de données entre composants, les règles de pare-feu, les schémas de haute disponibilité, et les spécifications techniques de chaque composant — il sert de blueprint technique pour l'implémentation et la documentation de conformité
- B) C'est un simple schéma réseau
- C) C'est un diagramme de flux de données uniquement
- D) C'est un document de conformité

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*