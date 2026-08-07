# TOME P7 — Certifications d'Élite & Spécialisations — Jour 306 (6h) : AWS Security Specialty — IAM Deep-Dive (SCPs, Permission Boundaries, IAM Access Analyzer, Conditions Keys & Attribute-Based Access Control)

> [!NOTE]
> **Objectif du jour :** Maîtriser les mécanismes d'autorisation IAM AWS avancés ciblés par la certification **AWS Certified Security – Specialty (SCS-C02)** : rédiger des **SCPs (Service Control Policies)** pour les Organizations, configurer les **Permission Boundaries**, utiliser **IAM Access Analyzer** pour détecter les expositions involontaires, et implémenter l'**ABAC (Attribute-Based Access Control)** avec des condition keys IAM.
>
> **Compétences visées :** `AWS-SEC-01` (A) — AWS Organizations SCPs & Permission Boundaries | `AWS-SEC-02` (A) — IAM Access Analyzer & ABAC

---

## 1) Module — Hiérarchie d'Autorisation IAM AWS (2h)

### 📖 Narration/Intuition

Dans AWS Organizations, **5 types de policies** s'appliquent successivement. L'accès final n'est accordé que si AUCUNE Deny explicite ne s'applique ET qu'un Allow explicite est présent à chaque couche :

```
1. SCP (Organization Level) ─── Limite absolue de ce qui est autorisable dans l'OU
         │
2. Permission Boundary ──────── Limite maximale des droits d'un rôle/user IAM
         │
3. Identity-Based Policy ────── Droits accordés à l'entité IAM
         │
4. Resource-Based Policy ────── Politique attachée à la ressource (ex: S3 Bucket Policy)
         │
5. Session Policy ───────────── Droits de la session AssumeRole temporaire
```

---

## 2) Module — SCP & Permission Boundary avec Boto3 (`iam_hardening.py`) (2h)

### 🛠️ Atelier Pratique

```python
import boto3, json

# SCP — Bloquer la désactivation de CloudTrail dans toute l'organisation
scp_policy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "DenyDisableCloudTrail",
            "Effect": "Deny",
            "Action": [
                "cloudtrail:StopLogging",
                "cloudtrail:DeleteTrail",
                "cloudtrail:UpdateTrail"
            ],
            "Resource": "*"
        },
        {
            "Sid": "DenyLeaveOrganization",
            "Effect": "Deny",
            "Action": "organizations:LeaveOrganization",
            "Resource": "*"
        }
    ]
}

orgs = boto3.client('organizations')
response = orgs.create_policy(
    Content=json.dumps(scp_policy),
    Description="SCP: Protection des logs CloudTrail et de la structure Organizations",
    Name="DenyCloudTrailDisable",
    Type="SERVICE_CONTROL_POLICY"
)
print(f"[+] SCP créée : {response['Policy']['PolicySummary']['Id']}")

# ─────────────────────────────────────────────────────────────────────────
# Permission Boundary — Limiter un rôle développeur à S3 et DynamoDB
# ─────────────────────────────────────────────────────────────────────────
boundary = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["s3:*", "dynamodb:*", "logs:*"],
            "Resource": "*"
        }
    ]
}

iam = boto3.client('iam')
iam.put_role_permissions_boundary(
    RoleName="DevRole",
    PermissionsBoundary="arn:aws:iam::123456789012:policy/DevBoundary"
)
print("[+] Permission Boundary appliquée sur DevRole")
```

---

## 3) Module — IAM Access Analyzer & ABAC (`access_analyzer_audit.py`) (2h)

```python
import boto3

# ─────────────────────────────────────────────────────────────────────────
# IAM Access Analyzer : Détecter les ressources exposées publiquement
# ─────────────────────────────────────────────────────────────────────────
analyzer = boto3.client('accessanalyzer', region_name='eu-west-1')

# Créer un analyzer sur le scope Organization
analyzer.create_analyzer(
    analyzerName="org-external-access-analyzer",
    type="ORGANIZATION"
)

# Lister les findings (ressources partagées avec des entités externes)
findings = analyzer.list_findings(analyzerArn="arn:aws:access-analyzer:eu-west-1:...:analyzer/org-external-access-analyzer")

for f in findings['findings']:
    if f['status'] == 'ACTIVE':
        print(f"[!] FINDING CRITIQUE : {f['resourceType']} {f['resource']} exposé à {f['principal']}")

# ─────────────────────────────────────────────────────────────────────────
# ABAC — Attribute-Based Access Control avec Condition Keys & Tags
# ─────────────────────────────────────────────────────────────────────────
abac_policy = {
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Action": "s3:*",
        "Resource": "arn:aws:s3:::paradis-data-${aws:PrincipalTag/Department}/*",
        "Condition": {
            "StringEquals": {
                "s3:ExistingObjectTag/Classification": "${aws:PrincipalTag/ClearanceLevel}"
            }
        }
    }]
}
print("[*] Politique ABAC : Accès S3 conditionné aux tags Department & ClearanceLevel du principal")
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SCP** | Service Control Policy — Politique de contrôle de services au niveau d'une AWS Organization |
| **Permission Boundary** | Politique IAM définissant le périmètre maximal d'autorisation d'un rôle ou utilisateur |
| **ABAC** | Attribute-Based Access Control — Contrôle d'accès basé sur des attributs (tags) dynamiques |
| **IAM Access Analyzer** | Service AWS détectant les ressources partagées avec des entités externes à l'organisation |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans la hiérarchie d'évaluation IAM AWS, qu'est-ce qu'un **SCP (Service Control Policy)** ?
- A) Une politique attachée à une OU (Organizational Unit) dans AWS Organizations qui définit la limite absolue des permissions accordables — même un compte root ne peut outrepasser un Deny SCP
- B) Une politique de chiffrement S3
- C) Un groupe IAM standard
- D) Un rôle IAM cross-account

**Réponse : A**

**Q2 :** À quoi sert une **Permission Boundary** dans IAM AWS ?
- A) À définir le plafond maximal des permissions qu'une entité IAM (rôle ou utilisateur) peut se voir attribuer, empêchant l'escalade de privilèges par un opérateur
- B) À bloquer les appels API cross-region
- C) À chiffrer les données S3
- D) À activer MFA sur tous les comptes

**Réponse : A**

**Q3 :** Quel service AWS détecte automatiquement les ressources (S3 buckets, KMS keys, IAM roles) partagées involontairement avec des entités externes à l'organisation ?
- A) IAM Access Analyzer
- B) AWS GuardDuty
- C) AWS Inspector
- D) AWS Macie

**Réponse : A**

**Q4 :** Qu'est-ce que l'**ABAC (Attribute-Based Access Control)** dans le contexte AWS IAM ?
- A) Un modèle de contrôle d'accès utilisant des tags sur les ressources et les principals pour évaluer dynamiquement les permissions via des Condition Keys
- B) Un système d'authentification biométrique
- C) Un service de chiffrement des bases de données
- D) Un protocole de tunneling réseau

**Réponse : A**

**Q5 :** Dans quelle situation un `Deny` dans une politique de ressource (Resource-Based Policy) prend-il le dessus sur un `Allow` dans une politique d'identité (Identity-Based Policy) ?
- A) Toujours — un Deny explicite dans n'importe quelle politique applicable prime sur tous les Allow, conformément au principe du Deny-First evaluation order AWS
- B) Uniquement si la ressource est publique
- C) Jamais, les Allow ont la priorité
- D) Uniquement pour les IAM Roles, pas pour les Users

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
