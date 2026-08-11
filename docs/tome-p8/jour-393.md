# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 393 (6h) : SOC Cloud Security & Hybrid Operations — Cloud SIEM, SaaS Security Posture Management (SSPM), CASB, Cloud Workload Protection & BCC Hybrid SOC Strategy

> [!NOTE]
> **Objectif du jour :** Maîtriser la sécurité SOC dans un environnement cloud hybride : comprendre les architectures Cloud SIEM, mettre en œuvre le SSPM (SaaS Security Posture Management), configurer un CASB (Cloud Access Security Broker), et protéger les workloads cloud (CWPP) dans un contexte BCC hybride (on-premise + cloud).
>
> **Compétences visées :** `SOC-CLD-01` (A) — Cloud SIEM & Hybrid SOC Architecture | `SOC-CLD-02` (A) — SSPM, CASB & Cloud Workload Protection

---

## 1) Module — Cloud SIEM & Hybrid SOC Architecture (2h)

### 📖 Narration/Intuition

Un SOC moderne est hybride : il doit surveiller à la fois l'infrastructure on-premise (DC, réseau, endpoints) et les services cloud (Office 365, Azure AD, AWS, SaaS). Le **Cloud SIEM** unifie ces sources de logs dans une plateforme centrale, permettant une détection et une réponse cohérentes sur l'ensemble de l'environnement.

```
[ SOC HYBRIDE BCC ]

ON-PREMISE                     CLOUD                     UNIFIÉ
──────────                     ──────                     ──────
DC01, DC02                Azure AD                    │
Active Directory           Office 365                  │
Firewall Palo Alto         AWS EC2/S3                 │
Switches Cisco             SaaS (Salesforce)          │
Servers Linux/Windows      Container K8s              │
         │                      │                      │
         └──────────┬───────────┘                      │
                    ▼                                  ▼
              [ COLLECTE LOGS ]              [ CLOUD SIEM ]
              - Winlogbeat/Filebeat          - Unified schema
              - Syslog/NXLog                 - Cross-correlation
              - API Cloud (Graph/CloudTrail) - Normalisation
                    │                                  │
                    └──────────┬───────────────────────┘
                               ▼
                    [ DÉTECTION & RÉPONSE ]
                    - Règles on-prem + cloud
                    - Alertes unifiées
                    - Playbooks hybrides
```

### Architecture Cloud SIEM

| Composant | Rôle | Technologies |
|:---|:---|:---|
| **Log Collection** | Collecte logs on-prem et cloud | Winlogbeat, Filebeat, Syslog, CloudTrail, Graph API |
| **Normalization** | Normalisation des formats hétérogènes | CIM (Splunk), ECS (Elastic), ASIM (Microsoft) |
| **Correlation** | Corrélation cross-source | SIEM rules, detection as code |
| **Enrichment** | Enrichissement CTI, géolocalisation | VirusTotal, AbuseIPDB, MaxMind |
| **Response** | Réponse automatisée hybride | SOAR, Azure Logic Apps, AWS Step Functions |

---

## 2) Module — SSPM & CASB Engine (`cloud_security_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict, Optional
from enum import Enum

class SaaSApp(Enum):
    OFFICE365 = "OFFICE365"
    SALESFORCE = "SALESFORCE"
    ZENDESK = "ZENDESK"
    SLACK = "SLACK"

class CloudSecurityEngine:
    """
    Moteur de sécurité cloud pour SOC hybride.
    SSPM, CASB, CWPP et posture de sécurité SaaS.
    """

    def __init__(self, org_name: str = "BCC"):
        self.org_name = org_name
        self.saas_apps: Dict[str, dict] = {}
        self.security_posture_checks: List[dict] = []
        self.casb_policies: List[dict] = []

    def register_saas_app(self, app_id: str, name: str, app_type: SaaSApp,
                          vendor: str, users_count: int, data_classification: str = "INTERNAL") -> dict:
        """Enregistre une application SaaS pour SSPM."""
        app = {
            "app_id": app_id,
            "name": name,
            "type": app_type.value,
            "vendor": vendor,
            "users_count": users_count,
            "data_classification": data_classification,
            "security_score": 0.0,
            "registered_at": datetime.now(timezone.utc).isoformat()
        }
        self.saas_apps[app_id] = app
        return app

    def assess_security_posture(self, app_id: str, mfa_enforced: bool,
                                sso_enabled: bool, session_timeout: int,
                                data_at_rest_encrypted: bool, audit_logging: bool) -> dict:
        """Évalue la posture de sécurité d'une app SaaS."""
        app = self.saas_apps.get(app_id)
        if not app:
            return {"status": "ERROR"}

        score = 0.0
        checks = []

        if mfa_enforced:
            score += 25
            checks.append("MFA enforced (+25)")
        else:
            checks.append("MFA NOT enforced (+0) — CRITICAL")

        if sso_enabled:
            score += 25
            checks.append("SSO enabled (+25)")
        else:
            checks.append("SSO NOT enabled (+0) — HIGH")

        if session_timeout <= 60:
            score += 15
            checks.append(f"Session timeout {session_timeout}min (+15)")
        else:
            checks.append(f"Session timeout {session_timeout}min (+0) — HIGH")

        if data_at_rest_encrypted:
            score += 20
            checks.append("Encryption at rest (+20)")
        else:
            checks.append("No encryption at rest (+0) — CRITICAL")

        if audit_logging:
            score += 15
            checks.append("Audit logging enabled (+15)")
        else:
            checks.append("No audit logging (+0) — HIGH")

        app["security_score"] = round(score, 1)

        assessment = {
            "app_id": app_id,
            "security_score": app["security_score"],
            "checks": checks,
            "recommendations": []
        }

        if not mfa_enforced:
            assessment["recommendations"].append("Enforce MFA for all users")
        if not sso_enabled:
            assessment["recommendations"].append("Enable SSO with Azure AD")
        if session_timeout > 60:
            assessment["recommendations"].append("Reduce session timeout to 15-30 minutes")
        if not data_at_rest_encrypted:
            assessment["recommendations"].append("Enable encryption at rest")

        self.security_posture_checks.append(assessment)
        return assessment

    def create_casb_policy(self, policy_id: str, name: str, app: str,
                           action: str, conditions: List[str]) -> dict:
        """Crée une politique CASB."""
        policy = {
            "policy_id": policy_id,
            "name": name,
            "app": app,
            "action": action,
            "conditions": conditions,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.casb_policies.append(policy)
        return policy

    def get_cloud_security_dashboard(self) -> dict:
        """Dashboard sécurité cloud."""
        avg_score = sum(a["security_score"] for a in self.saas_apps.values()) / len(self.saas_apps) if self.saas_apps else 0
        return {
            "organisation": self.org_name,
            "saas_apps": len(self.saas_apps),
            "posture_assessments": len(self.security_posture_checks),
            "casb_policies": len(self.casb_policies),
            "avg_security_score": round(avg_score, 1)
        }


# --- Démonstration ---
print("=== CLOUD SECURITY ENGINE DEMONSTRATION ===")

cloud = CloudSecurityEngine(org_name="BCC")

# Enregistrement d'apps SaaS
saas_apps = [
    ("SAAS-001", "Office 365", SaaSApp.OFFICE365, "Microsoft", 500, "CONFIDENTIAL"),
    ("SAAS-002", "Salesforce CRM", SaaSApp.SALESFORCE, "Salesforce", 100, "SENSITIVE"),
    ("SAAS-003", "Zendesk Support", SaaSApp.ZENDESK, "Zendesk", 50, "INTERNAL"),
    ("SAAS-004", "Slack", SaaSApp.SLACK, "Slack/Salesforce", 300, "INTERNAL"),
]

for aid, name, app_type, vendor, users, classification in saas_apps:
    cloud.register_saas_app(aid, name, app_type, vendor, users, classification)

# Évaluation de posture
assessments = [
    ("SAAS-001", True, True, 30, True, True),
    ("SAAS-002", True, True, 60, True, True),
    ("SAAS-003", False, False, 480, True, False),
    ("SAAS-004", True, True, 15, True, True),
]

for aid, mfa, sso, timeout, encrypt, audit in assessments:
    result = cloud.assess_security_posture(aid, mfa, sso, timeout, encrypt, audit)
    print(f"    {aid}: score={result['security_score']}, recommendations={len(result['recommendations'])}")

# Politiques CASB
casb_policies = [
    ("CASB-001", "Block unauthorized file sharing", "OFFICE365", "BLOCK", ["external_sharing=true", "classification=CONFIDENTIAL"]),
    ("CASB-002", "Alert on mass download", "SALESFORCE", "ALERT", ["download_count>1000", "time_window=1h"]),
    ("CASB-003", "Require MFA for admin access", "ZENDESK", "ENFORCE", ["role=admin", "mfa=false"]),
]

for pid, name, app, action, conditions in casb_policies:
    cloud.create_casb_policy(pid, name, app, action, conditions)

# Dashboard
dashboard = cloud.get_cloud_security_dashboard()
print(f"\n[+] Cloud Security Dashboard :")
print(f"    SaaS apps: {dashboard['saas_apps']}")
print(f"    Posture assessments: {dashboard['posture_assessments']}")
print(f"    CASB policies: {dashboard['casb_policies']}")
print(f"    Avg security score: {dashboard['avg_security_score']}")
```

---

## 3) Module — Cloud Workload Protection & BCC Strategy (2h)

### 📖 CWPP pour BCC

```yaml
# Cloud Workload Protection Platform — BCC
cwpp_stack:
  cspm:
    tool: "Prowler / AWS Security Hub / Azure Policy"
    coverage: "Multi-cloud (AWS, Azure, GCP)"
    checks:
      - "S3 buckets public access blocked"
      - "Encryption at rest enabled"
      - "MFA enabled for root accounts"
      - "Security groups restrictive"
      - "CloudTrail enabled in all regions"

  cwpp:
    tool: "CrowdStrike Falcon / Prisma Cloud Compute"
    coverage: "EC2, EKS, Lambda, containers"
    capabilities:
      - runtime protection
      - vulnerability scanning
      - compliance monitoring
      - network micro-segmentation
      - incident response automation

  casb:
    tool: "Microsoft Cloud App Security / Netskope"
    coverage: "SaaS applications (O365, Salesforce, Slack)"
    capabilities:
      - shadow IT discovery
      - data loss prevention (DLP)
      - threat protection
      - access control
      - compliance reporting

  hybrid_soc:
    strategy:
      - "Unified SIEM: Splunk/Elastic with cloud add-ons"
      - "Unified playbooks: SOAR for hybrid incidents"
      - "Unified metrics: MTTD/MTTR across on-prem and cloud"
      - "Unified team: SOC analysts trained on both environments"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SSPM** | SaaS Security Posture Management — Gestion de la posture de sécurité SaaS |
| **CASB** | Cloud Access Security Broker — Courtier de sécurité d'accès cloud |
| **CWPP** | Cloud Workload Protection Platform — Plateforme de protection des workloads cloud |
| **CSPM** | Cloud Security Posture Management — Gestion de la posture de sécurité cloud |
| **DLP** | Data Loss Prevention — Prévention de la perte de données |
| **SaaS** | Software as a Service — Logiciel en tant que service |
| **IAM** | Identity and Access Management — Gestion des identités et des accès |
| **MTTD** | Mean Time to Detect — Temps moyen de détection |
| **MTTR** | Mean Time to Respond/Remediate — Temps moyen de réponse/remédiation |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Qu'est-ce que le **SSPM** (SaaS Security Posture Management) et pourquoi est-il critique pour un SOC bancaire ?
- A) C'est un outil qui évalue en continu la posture de sécurité des applications SaaS (MFA, SSO, chiffrement, audit) et détecte les mauvaises configurations ou les dérives — il est critique car les banques utilisent de plus en plus de SaaS qui échappent au périmètre de sécurité traditionnel
- B) C'est un antivirus pour SaaS
- C) C'est un outil de sauvegarde cloud
- D) C'est un VPN pour accéder au cloud

**Réponse : A**

**Q2 :** Qu'est-ce qu'un **CASB** (Cloud Access Security Broker) et quelles sont ses fonctions principales ?
- A) C'est un point de contrôle entre les utilisateurs et les services cloud qui assure la visibilité, la conformité, la prévention des fuites de données (DLP) et la protection contre les menaces sur les applications SaaS
- B) C'est un fournisseur de cloud
- C) C'est un type de ransomware
- D) C'est un pare-feu matériel

**Réponse : A**

**Q3 :** Pourquoi un **SOC hybride** est-il indispensable pour une banque comme la BCC ?
- A) Parce que la BCC opère à la fois sur infrastructure on-premise (DC, réseau, endpoints) et sur cloud (Azure AD, Office 365, SaaS) — un SOC hybride unifie la collecte de logs, la détection et la réponse sur l'ensemble de l'environnement pour éviter les angles morts
- B) Parce que le cloud est moins cher
- C) Parce que on-premise est obsolète
- D) Parce que les banques doivent migrer tout dans le cloud

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
