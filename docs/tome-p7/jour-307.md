# TOME P7 — Certifications d'Élite & Spécialisations — Jour 307 (6h) : AWS Security Specialty — Detective, GuardDuty & Security Hub (Threat Detection Automatisée, Findings Enrichment & SIEM Cloud)

> [!NOTE]
> **Objectif du jour :** Maîtriser les services de **détection de menaces managés AWS** ciblés par la certification **AWS SCS-C02** : activer et configurer **Amazon GuardDuty** (détection comportementale ML), analyser les findings avec **Amazon Detective** (graphe d'investigation), centraliser les alertes dans **AWS Security Hub** (standards CIS AWS, NIST 800-53), et automatiser la réponse avec EventBridge + Lambda.
>
> **Compétences visées :** `AWS-SEC-03` (A) — GuardDuty Threat Detection & Finding Types | `AWS-SEC-04` (A) — Security Hub Aggregation & EventBridge Auto-Remediation

---

## 1) Module — Amazon GuardDuty : Détection Comportementale ML (2h)

### 📖 Narration/Intuition

**Amazon GuardDuty** analyse en permanence les **CloudTrail logs**, les **VPC Flow Logs** et les **DNS Query Logs** pour détecter des comportements anormaux via du Machine Learning et des renseignements sur les menaces (Threat Intelligence Feeds). Il génère des **Findings** classés par sévérité (1-10) et par type (ex: `CryptoCurrency:EC2/BitcoinTool.B`, `UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B`).

---

## 2) Module — Activation GuardDuty + Auto-Remediation Lambda (`guardduty_auto_response.py`) (2h)

### 🛠️ Atelier Pratique

```python
import boto3, json

# ─────────────────────────────────────────────────────────────────────────
# 1) Activation de GuardDuty dans toute l'organisation AWS
# ─────────────────────────────────────────────────────────────────────────
gd = boto3.client('guardduty', region_name='eu-west-1')
detector = gd.create_detector(
    Enable=True,
    FindingPublishingFrequency='FIFTEEN_MINUTES',
    DataSources={
        'S3Logs':        {'Enable': True},
        'Kubernetes':    {'AuditLogs': {'Enable': True}},
        'MalwareProtection': {'ScanEc2InstanceWithFindings': {'EbsVolumes': True}}
    }
)
print(f"[+] GuardDuty activé — Detector ID : {detector['DetectorId']}")

# ─────────────────────────────────────────────────────────────────────────
# 2) Lambda de réponse automatique aux findings critiques GuardDuty
#    Déclenchée par EventBridge Rule: source="aws.guardduty" type="GuardDuty Finding"
# ─────────────────────────────────────────────────────────────────────────
def lambda_handler(event, context):
    detail = event.get('detail', {})
    finding_type = detail.get('type', '')
    severity = detail.get('severity', 0)
    resource = detail.get('resource', {})

    print(f"[*] GuardDuty Finding reçu : {finding_type} | Sévérité : {severity}")

    # Si détection de Crypto Mining sur une instance EC2 -> Isolation automatique
    if 'CryptoCurrency' in finding_type and severity >= 7.0:
        instance_id = resource.get('instanceDetails', {}).get('instanceId')
        if instance_id:
            ec2 = boto3.client('ec2')
            # Isolation réseau : Attacher un Security Group vide (aucune règle entrante/sortante)
            ec2.modify_instance_attribute(
                InstanceId=instance_id,
                Groups=['sg-ISOLATION-GROUP-ID']
            )
            print(f"[!] INSTANCE ISOLÉE AUTOMATIQUEMENT : {instance_id} (CryptoCurrency Mining détecté)")

    # Si compromission de credentials IAM -> Désactivation immédiate
    if 'UnauthorizedAccess:IAMUser' in finding_type:
        user = detail.get('resource', {}).get('accessKeyDetails', {}).get('userName')
        if user:
            iam = boto3.client('iam')
            iam.update_access_key(UserName=user, AccessKeyId='AKIA...', Status='Inactive')
            print(f"[!] CLEF IAM DÉSACTIVÉE : {user}")

    return {"statusCode": 200, "body": "Remediation executed"}
```

---

## 3) Module — Security Hub & Scores de Conformité AWS (`security_hub_audit.py`) (2h)

```python
import boto3

# ─────────────────────────────────────────────────────────────────────────
# AWS Security Hub : Activation + Scores CIS AWS Foundations Benchmark
# ─────────────────────────────────────────────────────────────────────────
hub = boto3.client('securityhub', region_name='eu-west-1')

# Activer Security Hub
hub.enable_security_hub(EnableDefaultStandards=True)
print("[+] Security Hub activé avec les standards par défaut")

# Lister les findings critiques non résolus
findings_response = hub.get_findings(
    Filters={
        'SeverityLabel': [{'Value': 'CRITICAL', 'Comparison': 'EQUALS'}],
        'RecordState':   [{'Value': 'ACTIVE',   'Comparison': 'EQUALS'}],
        'WorkflowStatus':[{'Value': 'NEW',       'Comparison': 'EQUALS'}]
    }
)

print(f"\n[!] Findings CRITIQUES actifs dans Security Hub : {len(findings_response['Findings'])}")
for f in findings_response['Findings'][:5]:
    print(f"  - [{f['ProductName']}] {f['Title']} | Ressource : {f['Resources'][0]['Id']}")
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **GuardDuty** | Service AWS de détection de menaces basé sur ML analysant CloudTrail, VPC Flow Logs & DNS |
| **Security Hub** | Tableau de bord centralisé AWS agrégeant les findings de tous les services de sécurité AWS |
| **Amazon Detective** | Service AWS de visualisation graphique pour l'investigation forensique des findings |
| **EventBridge** | Bus d'événements AWS permettant de déclencher des Lambdas en réponse aux findings sécurité |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelles sont les **trois sources de données principales** analysées par Amazon GuardDuty pour détecter les menaces ?
- A) CloudTrail Event Logs, VPC Flow Logs et Route 53 DNS Query Logs
- B) CloudWatch Metrics, S3 Access Logs et EC2 System Logs
- C) Config Rules, Macie Findings et Inspector Reports
- D) WAF Logs, Shield Events et Firewall Manager Policies

**Réponse : A**

**Q2 :** Quel service AWS permet de **visualiser graphiquement** les relations entre entités (IP, users, resources) impliquées dans un finding GuardDuty pour faciliter l'investigation forensique ?
- A) Amazon Detective
- B) AWS Config
- C) AWS Trusted Advisor
- D) AWS Inspector

**Réponse : A**

**Q3 :** Comment automatiser une **réponse instantanée** à un finding GuardDuty critique (ex: CryptoCurrency Mining) sans intervention humaine ?
- A) Via une EventBridge Rule qui déclenche une Lambda d'isolement de l'instance (modification du Security Group)
- B) Via une alerte email uniquement
- C) Via un ticket JIRA automatique
- D) Via CloudTrail uniquement

**Réponse : A**

**Q4 :** Quel standard de conformité du **CIS (Center for Internet Security)** est disponible nativement dans AWS Security Hub pour évaluer la posture de sécurité d'un compte AWS ?
- A) CIS AWS Foundations Benchmark (v1.4 / v3.0)
- B) PCI DSS Level 1
- C) SOC 2 Type II
- D) ISO 27001:2022

**Réponse : A**

**Q5 :** Dans un déploiement AWS Organizations multi-compte, quelle configuration GuardDuty est recommandée pour une gestion centralisée des findings ?
- A) Activer GuardDuty dans le compte **Security/Delegated Administrator** et désigner ce compte comme agrégateur de findings pour tous les comptes membres de l'organisation
- B) Activer GuardDuty indépendamment dans chaque compte sans agrégation
- C) Utiliser un seul compte root pour tout
- D) Désactiver GuardDuty et utiliser uniquement CloudTrail

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
