# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 378 (6h) : Cloud Security Architecture — AWS Well-Architected Security Pillar, Azure Landing Zone Hardening & GCP Security Command Center

> [!NOTE]
> **Objectif du jour :** Maîtriser la conception d'une **Architecture de Sécurité Cloud de Classe Entreprise** conforme aux référentiels des trois grands hyperscalers : implémenter les principes du **AWS Well-Architected Framework (Security Pillar)** (IAM, Detective Controls, Data Protection, Incident Response), durcir un **Azure Landing Zone** (Policy-as-Code, Microsoft Defender for Cloud, Entra ID PIM), et opérer le **GCP Security Command Center** pour la gestion centralisée des findings.
>
> **Compétences visées :** `CLOUD-ARCH-01` (A) — AWS Security Pillar Design (IAM Hardening, GuardDuty, Security Hub) | `CLOUD-ARCH-02` (A) — Azure Landing Zone Security, Defender for Cloud & GCP SCC Integration

---

## 1) Module — Matrice de Sécurité Multi-Cloud & Modèle de Responsabilité Partagée (2h)

### 📖 Narration/Intuition

Dans le Cloud, la sécurité est une **responsabilité partagée** entre le fournisseur Cloud (CSP) et le client. La zone de responsabilité du client s'étend du **Code Applicatif jusqu'au niveau identité et données**. Le CISO doit maîtriser cette frontière pour chaque hyperscaler.

```
       ┌─────────────────────────────────────────────────────────────┐
       │             MODÈLE DE RESPONSABILITÉ PARTAGÉE (SaaS/PaaS/IaaS)│
       ├───────────────────┬────────────────┬─────────────────────────┤
       │ COUCHE            │ CSP (AWS/Azure) │ CLIENT (Vous)           │
       ├───────────────────┼────────────────┼─────────────────────────┤
       │ Datacenter Physique│ ✅ CSP seul    │ ❌ Hors périmètre        │
       │ Hyperviseur       │ ✅ CSP seul    │ ❌ Hors périmètre        │
       │ Réseau Cloud      │ ✅ CSP seul    │ ❌ Hors périmètre        │
       │ OS / Middleware    │ Partagé (IaaS) │ ✅ RESPONSABILITÉ CLIENT │
       │ Données & Chiffre.│ ❌ CSP n'accède│ ✅ RESPONSABILITÉ CLIENT │
       │ Identité & Accès  │ ❌ CSP fournit │ ✅ RESPONSABILITÉ CLIENT │
       └───────────────────┴────────────────┴─────────────────────────┘
```

#### Matrice des Services de Sécurité Natifs par Cloud Provider

| Catégorie de Sécurité | AWS | Azure | GCP |
|:---:|:---|:---|:---|
| **CSPM (Cloud Security Posture)** | AWS Security Hub | Microsoft Defender for Cloud | Security Command Center |
| **CIEM (Cloud Identity Entitlement)** | IAM Access Analyzer | Entra ID PIM | IAM Recommender |
| **Threat Detection (CNAPP)** | AWS GuardDuty | Microsoft Sentinel | Chronicle SIEM |
| **Data Protection** | AWS Macie (S3) | Microsoft Purview | Cloud DLP |
| **Policy-as-Code** | AWS Config Rules + SCPs | Azure Policy + Blueprints | OPA (Open Policy Agent) |

---

## 2) Module — Outillage Cloud Security Posture Engine (`cloud_cspm_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict

class CloudCSPMEngine:
    """
    Moteur CSPM (Cloud Security Posture Management) simulant les findings
    des services natifs AWS Security Hub / Microsoft Defender for Cloud / GCP SCC.
    """

    # Règles CIS AWS Foundations Benchmark (sous-ensemble)
    AWS_CIS_RULES = {
        "CIS-AWS-1.1":  ("Root account MFA not enabled",          "CRITICAL"),
        "CIS-AWS-1.13": ("MFA not enabled on IAM users",          "HIGH"),
        "CIS-AWS-2.1":  ("S3 bucket public access not blocked",   "CRITICAL"),
        "CIS-AWS-3.1":  ("CloudTrail not enabled in all regions",  "HIGH"),
        "CIS-AWS-4.1":  ("Security Group allows 0.0.0.0/0 to SSH", "HIGH"),
    }

    def __init__(self, account_id: str, cloud_provider: str):
        self.account_id = account_id
        self.cloud = cloud_provider
        self.findings: List[dict] = []

    def scan_aws_posture(self, account_config: dict) -> List[dict]:
        """Évalue la posture de sécurité d'un compte AWS selon le CIS AWS Foundations Benchmark."""
        print(f"[*] Scan CSPM AWS du compte {self.account_id}...")

        # Règle CIS-AWS-1.1 : Compte Root sans MFA
        if not account_config.get("root_mfa_enabled", True):
            self._add_finding("CIS-AWS-1.1", "AWS IAM", {"account": self.account_id})

        # Règle CIS-AWS-2.1 : Bucket S3 à accès public
        for bucket in account_config.get("s3_buckets", []):
            if bucket.get("public_access", False):
                self._add_finding("CIS-AWS-2.1", f"S3/{bucket['name']}", {"bucket": bucket["name"]})

        # Règle CIS-AWS-4.1 : Security Group ouvrant SSH sur Internet
        for sg in account_config.get("security_groups", []):
            for rule in sg.get("inbound_rules", []):
                if rule.get("port") == 22 and rule.get("cidr") in ["0.0.0.0/0", "::/0"]:
                    self._add_finding("CIS-AWS-4.1", f"EC2/SG/{sg['id']}", {"sg_id": sg["id"]})

        return self.findings

    def _add_finding(self, rule_id: str, resource: str, context: dict):
        rule_title, severity = self.AWS_CIS_RULES.get(rule_id, ("Unknown Rule", "MEDIUM"))
        finding = {
            "finding_id": f"CSPM-{len(self.findings)+1:03d}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "cloud_provider": self.cloud,
            "account_id": self.account_id,
            "rule_id": rule_id,
            "title": rule_title,
            "severity": severity,
            "affected_resource": resource,
            "context": context,
            "remediation": f"Appliquer le contrôle CIS {rule_id} selon le benchmark AWS Foundations"
        }
        self.findings.append(finding)
        print(f"  [!] FINDING [{severity}] {rule_id}: {rule_title} sur {resource}")

    def generate_posture_report(self) -> dict:
        critical = sum(1 for f in self.findings if f["severity"] == "CRITICAL")
        high = sum(1 for f in self.findings if f["severity"] == "HIGH")
        score = max(0, 100 - (critical * 20) - (high * 10))
        return {
            "account_id": self.account_id,
            "scan_timestamp": datetime.now(timezone.utc).isoformat(),
            "total_findings": len(self.findings),
            "critical_count": critical,
            "high_count": high,
            "security_score": score,
            "security_rating": "INSUFFICIENT" if score < 50 else "NEEDS IMPROVEMENT" if score < 75 else "GOOD",
            "findings": self.findings
        }

# Démonstration CSPM
cspm = CloudCSPMEngine("123456789012", "AWS")

account_config = {
    "root_mfa_enabled": False,
    "s3_buckets": [
        {"name": "paradis-finance-reports", "public_access": True},
        {"name": "paradis-internal-docs",   "public_access": False}
    ],
    "security_groups": [
        {"id": "sg-0abc1234", "inbound_rules": [{"port": 22, "cidr": "0.0.0.0/0"}]},
        {"id": "sg-0def5678", "inbound_rules": [{"port": 443, "cidr": "0.0.0.0/0"}]}
    ]
}

print("=== CLOUD CSPM SECURITY POSTURE ENGINE (AWS CIS BENCHMARK) ===")
cspm.scan_aws_posture(account_config)

print("\n=== POSTURE REPORT ===")
print(json.dumps(cspm.generate_posture_report(), indent=2, ensure_ascii=False))
```

---

## 3) Module — Fiche de Hardening AWS / Azure Landing Zone (2h)

```markdown
# AWS SECURITY HARDENING ESSENTIALS (CISO CHECKLIST)

## 1. Identité & Accès (IAM)
- [ ] **Désactiver les Access Keys statiques** sur les comptes humains — utiliser IAM Identity Center (SSO)
- [ ] **MFA obligatoire** sur le compte Root + tous les comptes IAM via SCP (Service Control Policy)
- [ ] **IAM Access Analyzer** activé pour détecter les ressources exposées publiquement

## 2. Détection (GuardDuty & Security Hub)
- [ ] **AWS GuardDuty** activé dans toutes les régions (Threat Intelligence + Machine Learning)
- [ ] **AWS Security Hub** agrégateur central des findings CIS / PCI-DSS / NIST
- [ ] **AWS CloudTrail** activé dans toutes les régions avec livraison vers S3 immuable

## 3. Protection des Données
- [ ] **S3 Block Public Access** activé au niveau organization (SCP bloquante)
- [ ] **AWS Macie** activé pour la découverte et la classification des données sensibles dans S3
- [ ] **KMS Customer Managed Keys (CMK)** pour chiffrer EBS, RDS, S3

## AZURE LANDING ZONE SECURITY CONTROLS
- [ ] **Microsoft Defender for Cloud** (Plan Defender P2) sur toutes les subscriptions
- [ ] **Azure Policy** : Enforcer la conformité via des initiatives (CIS, NIST, ISO 27001)
- [ ] **Entra ID PIM** (Privileged Identity Management) : Zéro Standing Privileges sur les rôles Owner
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CSPM** | Cloud Security Posture Management — Outil automatisé évaluant la conformité des configurations Cloud |
| **SCP** | Service Control Policy — Politique de gouvernance AWS Organizations s'appliquant à tous les comptes enfants |
| **Landing Zone** | Architecture Cloud standardisée et sécurisée servant de base de déploiement pour l'entreprise |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Dans le modèle de **responsabilité partagée Cloud**, quelle couche est **toujours sous la responsabilité exclusive du client** ?
- A) La protection des données, le chiffrement et la gestion des identités (IAM)
- B) La maintenance physique des hyperviseurs
- C) Les sauvegardes des switch réseau du datacenter
- D) La mise à jour du firmware des serveurs

**Réponse : A**

**Q2 :** Quel service AWS détecte les comportements anormaux (ex. reconnaisance EC2, accès C2, exfiltration S3) en analysant les logs VPC Flow, CloudTrail et DNS ?
- A) **AWS GuardDuty** — Service de Threat Detection managé par AWS utilisant le Machine Learning
- B) AWS CloudFormation
- C) AWS Elastic Beanstalk
- D) AWS CodeDeploy

**Réponse : A**

**Q3 :** Qu'est-ce qu'une **SCP (Service Control Policy)** dans AWS Organizations ?
- A) Une politique de gouvernance qui s'applique de manière descendante à l'ensemble des comptes enfants d'une Organization Unit, pouvant bloquer certains services ou actions même pour les administrateurs locaux
- B) Un type de certificat SSL
- C) Un protocole de routage réseau
- D) Un outil de débogage Python

**Réponse : A**

**Q4 :** Quel service AWS est spécialisé dans la **découverte et la classification automatique des données sensibles (PII)** stockées dans les buckets S3 ?
- A) **AWS Macie** — utilise le Machine Learning pour identifier les données personnelles, financières et sensibles
- B) AWS Shield
- C) AWS WAF
- D) AWS Config

**Réponse : A**

**Q5 :** Dans une **Azure Landing Zone**, quel service assure le principe de **Zero Standing Privileges (ZSP)** pour les rôles d'administration Azure ?
- A) **Microsoft Entra ID PIM (Privileged Identity Management)** — les accès admin sont demandés, approuvés et accordés temporairement (JIT)
- B) Azure DevOps
- C) Azure Load Balancer
- D) Azure Traffic Manager

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
