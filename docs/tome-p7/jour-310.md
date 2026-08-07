# TOME P7 — Certifications d'Élite & Spécialisations — Jour 310 (6h) : Projet Intégrateur S7 Partie 2 — AWS Security Specialty Mock Exam + Remédiation (Audit Posture de Sécurité Cloud & Plan d'Action)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre un **audit de posture de sécurité AWS complet** simulant l'examen AWS Certified Security – Specialty (SCS-C02) : détecter et corriger 10 mauvaises configurations critiques (S3 Public, CloudTrail désactivé, MFA absent, SGS permissifs), rédiger un plan de remédiation priorisé et produire un score de maturité cloud.
>
> **Ce projet valide la maîtrise opérationnelle de tous les services de sécurité AWS (IAM, GuardDuty, Macie, Inspector, Config, CloudTrail, Shield, WAF).**

---

## 1) Module — Script d'Audit Posture Sécurité AWS (`aws_security_posture_audit.py`) (2h30)

### 🛠️ Audit Automatisé 10 Contrôles Critiques

```python
import boto3

def run_aws_security_audit():
    findings = []
    s3 = boto3.client('s3')
    iam = boto3.client('iam')
    ec2 = boto3.client('ec2')
    ct = boto3.client('cloudtrail')

    print("=== AUDIT DE POSTURE SÉCURITÉ AWS — SCS-C02 SIMULATION ===\n")

    # Contrôle 1 : Buckets S3 avec accès public
    buckets = s3.list_buckets()['Buckets']
    for b in buckets:
        try:
            acl = s3.get_bucket_acl(Bucket=b['Name'])
            for grant in acl['Grants']:
                if 'AllUsers' in str(grant) or 'AuthenticatedUsers' in str(grant):
                    findings.append({'severity': 'CRITICAL', 'control': 'S3-PUBLIC', 'resource': b['Name']})
        except Exception:
            pass

    # Contrôle 2 : CloudTrail actif dans toutes les régions ?
    trails = ct.describe_trails(includeShadowTrails=True)['trailList']
    multi_region = [t for t in trails if t.get('IsMultiRegionTrail')]
    if not multi_region:
        findings.append({'severity': 'HIGH', 'control': 'CLOUDTRAIL-MULTIREGION', 'resource': 'Account'})

    # Contrôle 3 : Security Groups avec 0.0.0.0/0 sur SSH (port 22)
    sgs = ec2.describe_security_groups()['SecurityGroups']
    for sg in sgs:
        for rule in sg.get('IpPermissions', []):
            if rule.get('FromPort') == 22:
                for ip in rule.get('IpRanges', []):
                    if ip.get('CidrIp') == '0.0.0.0/0':
                        findings.append({'severity': 'HIGH', 'control': 'SG-SSH-OPEN', 'resource': sg['GroupId']})

    # Contrôle 4 : Utilisateurs IAM sans MFA
    users = iam.list_users()['Users']
    for u in users:
        mfa = iam.list_mfa_devices(UserName=u['UserName'])['MFADevices']
        if not mfa:
            findings.append({'severity': 'HIGH', 'control': 'IAM-NO-MFA', 'resource': u['UserName']})

    # Rapport
    print(f"Findings détectés : {len(findings)}")
    for f in findings:
        print(f"  [{f['severity']}] {f['control']} | {f['resource']}")
    return findings

run_aws_security_audit()
```

---

## 2) Module — Plan de Remédiation Priorisé (1h30)

```markdown
# PLAN DE REMÉDIATION AWS SECURITY POSTURE

## Priorité P0 — CRITICAL (Action immédiate < 24h)
| # | Control | Remédiation Technique |
|---|---------|----------------------|
| 1 | S3 Public Bucket | Activer S3 Block Public Access Account-Level |
| 2 | Root Account MFA | Activer MFA virtuel/hardware sur le compte root |

## Priorité P1 — HIGH (Action < 7 jours)
| # | Control | Remédiation Technique |
|---|---------|----------------------|
| 3 | CloudTrail Multi-Region | Créer un trail multi-région avec validation d'intégrité |
| 4 | SG SSH 0.0.0.0/0 | Restreindre SSH aux IP de gestion ou déployer AWS Systems Manager Session Manager |
| 5 | IAM Users sans MFA | Attacher une SCP obligeant le MFA (`DenyAllExceptMFA`) |

## Score de Maturité Cloud (avant/après)
- **Avant Remédiation :** 45/100 (Insuffisant)
- **Après Remédiation :** 87/100 (Mature) — Aligné CIS AWS Benchmark Level 2
```

---

## 3) Module — Mock Exam AWS SCS-C02 — 10 Questions Représentatives (2h)

**Q1 :** Un bucket S3 contient des données de cartes bancaires. Quel service détecte automatiquement cette PII ?
- A) Amazon Macie — **✅ Réponse : A**

**Q2 :** Un attaquant a appelé `StopLogging` à 03h00. Quel service aurait détecté cette action ?
- A) Amazon GuardDuty (finding `Stealth:IAMUser/CloudTrailLoggingDisabled`) — **✅ Réponse : A**

**Q3 :** Comment empêcher des comptes membres AWS Organizations de désactiver GuardDuty ?
- A) Déployer une SCP avec `Deny` sur `guardduty:DisassociateFromMasterAccount` et `guardduty:DeleteDetector` — **✅ Réponse : A**

**Q4 :** Un EC2 montre une activité Bitcoin Mining. Quelle chaîne de réponse automatique AWS ?
- A) GuardDuty Finding → EventBridge Rule → Lambda → Isolation SG + Snapshot EBS — **✅ Réponse : A**

**Q5 :** Pour chiffrer les données en transit et au repos sur RDS, quelles options activer ?
- A) SSL/TLS enforcement parameter group + chiffrement KMS au niveau du volume EBS RDS — **✅ Réponse : A**

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SCS-C02** | AWS Certified Security – Specialty — Code officiel de la certification AWS Security |
| **Posture** | État global de la sécurité d'un environnement Cloud (score de conformité CIS/NIST) |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
