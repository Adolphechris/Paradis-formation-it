# TOME P7 — Certifications d'Élite & Spécialisations — Jour 309 (6h) : AWS Security Specialty — CloudTrail, Config & Incident Response (Forensique Cloud, Trail Tampering Detection & Automated Evidence Collection)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **forensique Cloud et la réponse à incident AWS** ciblés par la certification **AWS SCS-C02** : analyser les **CloudTrail Event Logs** pour détecter les compromissions (manipulation de trails, création d'IAM users suspects), utiliser **AWS Config** pour l'audit de conformité continu et la reconstruction de l'historique de configuration, et automatiser la **collection de preuves forensiques** (snapshots EBS, mémoire) via Lambda.
>
> **Compétences visées :** `AWS-SEC-07` (A) — CloudTrail Forensics & Trail Tamper Detection | `AWS-SEC-08` (A) — AWS Config Compliance & Automated Incident Response

---

## 1) Module — Analyse Forensique CloudTrail (`cloudtrail_forensics.py`) (2h)

### 📖 Narration/Intuition

**AWS CloudTrail** enregistre chaque appel d'API effectué dans un compte AWS (qui, quoi, quand, depuis où). En cas d'incident, l'analyste forensique cloud interroge CloudTrail pour reconstituer la **Kill Chain** de l'attaquant : depuis la première API appelée jusqu'à l'exfiltration.

---

## 2) Module — Détection de Manipulation CloudTrail & Config Rules (`aws_ir_forensics.py`) (2h)

### 🛠️ Atelier Pratique

```python
import boto3
from datetime import datetime, timedelta, timezone

# ─────────────────────────────────────────────────────────────────────────
# 1) CLOUDTRAIL FORENSICS — Détecter les manipulations de trail & actions suspectes
# ─────────────────────────────────────────────────────────────────────────
ct = boto3.client('cloudtrail', region_name='eu-west-1')

# Rechercher les événements suspicieux des dernières 24h
SUSPICIOUS_EVENTS = [
    'StopLogging',       # Arrêt du trail -> Tentative de masquage
    'DeleteTrail',       # Suppression du trail
    'CreateUser',        # Création d'utilisateur IAM de backdoor
    'CreateAccessKey',   # Création de clef API
    'AttachUserPolicy',  # Escalade de privilèges IAM
    'PutBucketPolicy',  # Exposition S3
    'RunInstances',      # Lancement d'instances non autorisées
]

end_time = datetime.now(timezone.utc)
start_time = end_time - timedelta(hours=24)

print("=== AUDIT FORENSIQUE CLOUDTRAIL — 24H ===")
for event_name in SUSPICIOUS_EVENTS:
    response = ct.lookup_events(
        LookupAttributes=[{'AttributeKey': 'EventName', 'AttributeValue': event_name}],
        StartTime=start_time,
        EndTime=end_time,
        MaxResults=10
    )
    if response['Events']:
        for evt in response['Events']:
            print(f"[!] ÉVÉNEMENT SUSPECT : {evt['EventName']} | User : {evt.get('Username','N/A')} | Time : {evt['EventTime']} | Source IP : {evt.get('CloudTrailEvent','{}')}")

# ─────────────────────────────────────────────────────────────────────────
# 2) AWS CONFIG RULES — Audit de conformité continu
# ─────────────────────────────────────────────────────────────────────────
config = boto3.client('config', region_name='eu-west-1')

# Lister les règles Config non-conformes
results = config.describe_compliance_by_config_rule(
    ComplianceTypes=['NON_COMPLIANT']
)
print(f"\n[!] Règles Config NON-CONFORMES : {len(results['ComplianceByConfigRules'])}")
for rule in results['ComplianceByConfigRules']:
    print(f"  - Règle : {rule['ConfigRuleName']} | Status : {rule['Compliance']['ComplianceType']}")
```

---

## 3) Module — Automatisation de la Collection Forensique (Snapshot EBS + Memory) (2h)

```python
import boto3, json

# ─────────────────────────────────────────────────────────────────────────
# Lambda de Collection Forensique Automatique (snapshot EBS + isolation)
# Déclenchée par GuardDuty Finding -> EventBridge -> Lambda
# ─────────────────────────────────────────────────────────────────────────
def lambda_handler(event, context):
    """Collecte forensique automatique sur une instance EC2 compromise."""
    ec2 = boto3.client('ec2')
    detail = event.get('detail', {})
    instance_id = detail.get('resource', {}).get('instanceDetails', {}).get('instanceId')

    if not instance_id:
        return {"statusCode": 400, "body": "No instance ID in event"}

    print(f"[*] Démarrage de la collecte forensique sur : {instance_id}")

    # 1) Snapshot de TOUS les volumes EBS attachés (capture de l'état du disque)
    volumes = ec2.describe_volumes(Filters=[{'Name': 'attachment.instance-id', 'Values': [instance_id]}])
    for vol in volumes['Volumes']:
        snap = ec2.create_snapshot(
            VolumeId=vol['VolumeId'],
            Description=f"FORENSIC-SNAPSHOT-{instance_id}-{vol['VolumeId']}",
            TagSpecifications=[{'ResourceType': 'snapshot', 'Tags': [
                {'Key': 'Purpose', 'Value': 'Forensic'},
                {'Key': 'IncidentId', 'Value': detail.get('id', 'unknown')}
            ]}]
        )
        print(f"[+] Snapshot forensique créé : {snap['SnapshotId']} (Volume : {vol['VolumeId']})")

    # 2) Isolation réseau (Security Group vide)
    ec2.modify_instance_attribute(InstanceId=instance_id, Groups=['sg-FORENSIC-ISOLATION'])
    print(f"[+] Instance {instance_id} isolée du réseau (SG Forensic)")

    # 3) Tag de l'instance comme instance forensique
    ec2.create_tags(Resources=[instance_id], Tags=[
        {'Key': 'ForensicStatus', 'Value': 'UNDER_INVESTIGATION'},
        {'Key': 'IsolatedAt', 'Value': str(datetime.now(timezone.utc))}
    ])

    return {"statusCode": 200, "body": f"Forensic collection completed for {instance_id}"}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CloudTrail** | Service AWS d'audit et d'enregistrement de tous les appels d'API (qui/quoi/quand/où) |
| **AWS Config** | Service AWS de surveillance continue de la configuration des ressources et audit de conformité |
| **EBS Snapshot** | Copie immuable point-in-time d'un volume de disque EC2 pour analyse forensique hors ligne |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Lors d'un incident de sécurité AWS, quel service enregistre chaque **appel d'API** effectué dans le compte (incluant la console, CLI, SDK) avec l'identité de l'appelant et l'adresse IP source ?
- A) AWS CloudTrail
- B) Amazon CloudWatch Logs
- C) VPC Flow Logs
- D) AWS Config

**Réponse : A**

**Q2 :** Quel événement CloudTrail constitue un **indicateur de compromission (IoC) critique** signalant qu'un attaquant tente de masquer ses activités ?
- A) `StopLogging` ou `DeleteTrail` — Ces actions désactivent l'enregistrement des événements CloudTrail
- B) `DescribeInstances`
- C) `ListBuckets`
- D) `GetCallerIdentity`

**Réponse : A**

**Q3 :** Pourquoi est-il recommandé d'activer la validation de l'intégrité des fichiers de log (**Log File Validation**) dans CloudTrail ?
- A) Pour détecter toute modification ou suppression des fichiers de log après leur création via une signature SHA-256 + RSA
- B) Pour compresser les logs automatiquement
- C) Pour exporter les logs vers Splunk
- D) Pour chiffrer les logs avec SSE-S3

**Réponse : A**

**Q4 :** Dans un processus de réponse à incident AWS, quelle est la **première action forensique** recommandée avant d'éteindre ou de modifier une instance EC2 compromise ?
- A) Créer un snapshot EBS de tous les volumes attachés pour préserver l'état du disque, puis isoler réseau l'instance
- B) Redémarrer l'instance immédiatement
- C) Supprimer les fichiers de logs de l'instance
- D) Changer le mot de passe root

**Réponse : A**

**Q5 :** Quel service AWS permet de définir des **règles de conformité continues** (ex: `restricted-ssh`, `s3-bucket-public-read-prohibited`) et d'auditer automatiquement toutes les ressources du compte contre ces règles ?
- A) AWS Config (Config Rules)
- B) AWS GuardDuty
- C) AWS Inspector
- D) AWS Macie

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
