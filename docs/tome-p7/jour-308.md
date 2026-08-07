# TOME P7 — Certifications d'Élite & Spécialisations — Jour 308 (6h) : AWS Security Specialty — Macie, Inspector & Shield (Protection des Données Sensibles, Scan de Vulnérabilités & Anti-DDoS)

> [!NOTE]
> **Objectif du jour :** Maîtriser les services AWS de **protection avancée des données et de résilience anti-DDoS** ciblés par la certification **AWS SCS-C02** : déployer **Amazon Macie** pour la découverte automatique de données PII dans S3, configurer **Amazon Inspector v2** pour le scan de vulnérabilités CVE des instances EC2 et images ECR, et activer **AWS Shield Advanced** contre les attaques DDoS volumétriques.
>
> **Compétences visées :** `AWS-SEC-05` (A) — Amazon Macie PII Discovery & S3 Security | `AWS-SEC-06` (A) — Inspector v2 CVE Scanning & Shield Advanced DDoS

---

## 1) Module — Amazon Macie : Découverte Automatique de Données Sensibles S3 (2h)

### 📖 Narration/Intuition

**Amazon Macie** utilise le Machine Learning et la correspondance de patterns (regex) pour scanner automatiquement les buckets S3 à la recherche de **données sensibles** : numéros de cartes bancaires (PAN), numéros de sécurité sociale, passeports, clés AWS, adresses email, etc. Il génère des **Sensitive Data Findings** et des **Policy Findings** (ex: bucket public avec données PII).

---

## 2) Module — Macie PII Discovery & Inspector v2 CVE Scan (`aws_data_protection.py`) (2h)

### 🛠️ Atelier Pratique

```python
import boto3

# ─────────────────────────────────────────────────────────────────────────
# 1) AMAZON MACIE — Scan de données sensibles dans les buckets S3
# ─────────────────────────────────────────────────────────────────────────
macie = boto3.client('macie2', region_name='eu-west-1')

# Activer Macie
macie.enable_macie(status='ENABLED', findingPublishingFrequency='FIFTEEN_MINUTES')
print("[+] Amazon Macie activé")

# Déclencher un job de classification personnalisé sur un bucket critique
job = macie.create_classification_job(
    jobType='ONE_TIME',
    name='PII-Audit-FinancialData-Bucket',
    s3JobDefinition={
        'bucketDefinitions': [{'accountId': '123456789012', 'buckets': ['paradis-financial-data']}]
    },
    managedDataIdentifierSelector='RECOMMENDED'
)
print(f"[+] Job Macie créé : {job['jobId']}")

# Récupérer les findings de données sensibles (PII, Credentials, Financial)
findings = macie.get_findings(
    findingIds=['finding-id-example']
)

# ─────────────────────────────────────────────────────────────────────────
# 2) AMAZON INSPECTOR V2 — Scan de vulnérabilités CVE (EC2 + ECR + Lambda)
# ─────────────────────────────────────────────────────────────────────────
inspector = boto3.client('inspector2', region_name='eu-west-1')

# Activer Inspector v2 pour EC2, ECR et Lambda
inspector.enable(resourceTypes=['EC2', 'ECR', 'LAMBDA'])
print("[+] Amazon Inspector v2 activé — Scan EC2 + ECR + Lambda")

# Lister les findings CVE critiques (CVSS >= 9.0) sur les instances EC2
critical_findings = inspector.list_findings(
    filterCriteria={
        'severity': [{'comparison': 'EQUALS', 'value': 'CRITICAL'}],
        'findingStatus': [{'comparison': 'EQUALS', 'value': 'ACTIVE'}]
    }
)

print(f"\n[!] Vulnérabilités CVE CRITIQUES détectées par Inspector : {len(critical_findings['findings'])}")
for f in critical_findings['findings'][:3]:
    cve = f.get('packageVulnerabilityDetails', {}).get('vulnerabilityId', 'N/A')
    score = f.get('inspectorScore', 0)
    resource = f['resources'][0]['id']
    print(f"  - CVE : {cve} | Score : {score} | Ressource : {resource}")
```

---

## 3) Module — AWS Shield Advanced & WAF (DDoS Protection) (2h)

```python
import boto3

# ─────────────────────────────────────────────────────────────────────────
# AWS Shield Advanced — Protection DDoS L3/L4/L7 + DDoS Cost Protection
# ─────────────────────────────────────────────────────────────────────────
shield = boto3.client('shield', region_name='us-east-1')  # Shield est global (us-east-1)

# Lister les ressources protégées par Shield Advanced
protections = shield.list_protections()
print("[*] Ressources protégées par AWS Shield Advanced :")
for p in protections.get('Protections', []):
    print(f"  - {p['Name']} | ARN : {p['ResourceArn']}")

# Associer une ressource (ex: CloudFront Distribution) à Shield Advanced
shield.create_protection(
    Name="CloudFront-ParadisSite",
    ResourceArn="arn:aws:cloudfront::123456789012:distribution/E1234EXAMPLE"
)
print("[+] Protection Shield Advanced appliquée sur CloudFront")

# ─────────────────────────────────────────────────────────────────────────
# AWS WAF v2 — Règles gérées pour bloquer OWASP Top 10
# ─────────────────────────────────────────────────────────────────────────
waf = boto3.client('wafv2', region_name='us-east-1')

# Créer une WebACL avec les règles gérées AWS (AWSManagedRulesCommonRuleSet)
waf.create_web_acl(
    Name="PARADIS-WAF-OWASP",
    Scope="CLOUDFRONT",
    DefaultAction={'Allow': {}},
    Rules=[
        {
            'Name': 'AWSManagedRulesCommonRuleSet',
            'Priority': 1,
            'Statement': {
                'ManagedRuleGroupStatement': {
                    'VendorName': 'AWS',
                    'Name': 'AWSManagedRulesCommonRuleSet'
                }
            },
            'OverrideAction': {'None': {}},
            'VisibilityConfig': {'SampledRequestsEnabled': True, 'CloudWatchMetricsEnabled': True, 'MetricName': 'CommonRuleSetMetric'}
        }
    ],
    VisibilityConfig={'SampledRequestsEnabled': True, 'CloudWatchMetricsEnabled': True, 'MetricName': 'ParadisWAF'}
)
print("[+] WebACL WAFv2 créée avec AWSManagedRulesCommonRuleSet (OWASP Top 10)")
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Macie** | Amazon Macie — Service ML de découverte et classification de données sensibles dans S3 |
| **Inspector v2** | Service AWS de scan continu de vulnérabilités CVE sur EC2, ECR et Lambda |
| **Shield Advanced** | Service AWS de protection DDoS managée L3/L4/L7 avec SLA et support DDoS Response Team |
| **WebACL** | Web Access Control List — Configuration du pare-feu applicatif WAFv2 |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel service AWS utilise le Machine Learning pour identifier automatiquement les données PII (numéros de carte, SSN, passeports) dans les buckets Amazon S3 ?
- A) Amazon Macie
- B) Amazon GuardDuty
- C) AWS Config
- D) Amazon Inspector

**Réponse : A**

**Q2 :** Quelles sont les **trois cibles de ressources** scannées par Amazon Inspector v2 pour détecter les CVE ?
- A) Instances EC2 (via SSM Agent), images ECR (containers) et fonctions Lambda
- B) Buckets S3, tables DynamoDB et bases RDS
- C) VPCs, Subnets et Security Groups
- D) Domaines Route 53, ACM certificates et CloudFront

**Réponse : A**

**Q3 :** Quelle différence fondamentale distingue **AWS Shield Standard** d'**AWS Shield Advanced** ?
- A) Shield Advanced offre une protection contre les attaques DDoS L7, un accès au DDoS Response Team (DRT) 24/7, une protection contre les surcoûts liés aux attaques, et une visibilité en temps réel
- B) Shield Standard protège contre les attaques L7, Shield Advanced uniquement L3
- C) Shield Advanced est gratuit pour tous
- D) Aucune différence — les deux offrent les mêmes protections

**Réponse : A**

**Q4 :** Dans AWS WAF v2, qu'est-ce que le **AWSManagedRulesCommonRuleSet** ?
- A) Un ensemble de règles gérées par AWS protégeant contre les attaques OWASP Top 10 communes (SQLi, XSS, CSRF, Path Traversal) sans configuration manuelle
- B) Un ensemble de règles personnalisées pour bloquer des IPs spécifiques
- C) Un filtre de spam email
- D) Une politique SCP Organizations

**Réponse : A**

**Q5 :** Quel type de **finding Macie** est généré lorsqu'un bucket S3 contenant des données sensibles classifiées est configuré avec un accès public ?
- A) Un **Policy Finding** de type `Policy:IAMUser/S3BucketPublic` combiné à un **Sensitive Data Finding`
- B) Un GuardDuty Finding
- C) Un Inspector Finding
- D) Un Config Rule violation

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
