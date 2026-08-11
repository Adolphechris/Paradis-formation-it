# TOME P11 — DevSecOps & Cloud Security — Jour 456 (6h) : Cloud Security Architecture & Governance (AWS/GCP/Azure Hardening, IAM Least Privilege, CSPM & Cloud Audit)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le **Modèle de Responsabilité Partagée** (Shared Responsibility Model) en environnement IaaS, PaaS et SaaS
> - Concevoir une architecture **IAM Least Privilege** avec condition-based access (ABAC, RBAC, AWS SCP, GCP Org Policies)
> - Déployer des outils de **CSPM (Cloud Security Posture Management)** pour l'audit continu des configurations Cloud (Prowler, ScoutSuite, AWS Security Hub)
> - Centraliser les logs d'audit et la détection de menaces Cloud (CloudTrail, VPC Flow Logs, GCP Audit Logs, GuardDuty)
>
> **Compétences visées :** `SEC-07` (A) — Cloud Architecture Security, `SEC-04` (A) — Cloud Posture Management

---

## Module 1 — Modèle de Responsabilité Partagée & Architecture IAM (2h)

### 📖 Intuition & Narration

Dans le Cloud, la majorité des failles majeures (ex: la fuite de 100 millions de dossiers Capital One en 2019) ne sont pas dues à des failles de l'hyperviseur AWS ou GCP, mais à de **mauvaises configurations clients** : des buckets S3 publics par erreur, des rôles IAM trop permissifs (`"Action": "*", "Resource": "*"`), ou des clés d'accès administrateur fuguées.

La sécurité Cloud commence par la maîtrise de la ligne de démarcation du **Modèle de Responsabilité Partagée** et le strict respect du principe de moindre privilège dans IAM.

### 🔍 Anatomie Technique — Shared Responsibility Model

```
MODÈLE DE RESPONSABILITÉ PARTAGÉE (AWS / GCP / AZURE)

  ┌─────────────────────────────────────────────────────────────┐
  │  CLIENT (Votre Responsabilité)                              │
  │  ├── Données & Chiffrement (KMS/Customer-Managed Keys)       │
  │  ├── Gestion des Identités & Accès (IAM, MFA, RBAC/ABAC)    │
  │  ├── Configuration des Applications & Code                 │
  │  ├── Sécurité Réseau Virtuel (VPC, Security Groups, WAF)     │
  │  └── OS des VMs (IaaS uniquement — Patches & EDR)           │
  ├─────────────────────────────────────────────────────────────┤
  │  FOURNISSEUR CLOUD (AWS / GCP / Azure)                      │
  │  ├── Sécurité Physique des Datacenters                      │
  │  ├── Hyperviseurs & Matériel Serveur/Stockage/Réseau         │
  │  └── Infrastructure des Services Managés (S3, RDS, DynamoDB) │
  └─────────────────────────────────────────────────────────────┘
```

---

## Module 2 — CSPM (Cloud Security Posture Management) avec Prowler (2h)

### 🛠️ Atelier Pratique — Audit Cloud avec Prowler

```bash
# ══════════════════════════════════════════════════════
# PROWLER — Outil d'Audit CSPM Multi-Cloud (AWS, GCP, Azure)
# Conforme CIS Benchmarks, NIST 800-53, PCI-DSS, SOC2
# ══════════════════════════════════════════════════════

# Installation Prowler
pip3 install prowler

# 1. Audit AWS CIS Benchmark v3.0
prowler aws --framework cis_3.0_aws

# 2. Audit ciblé sur les Buckets S3 & IAM
prowler aws --services s3 iam

# 3. Export des résultats au format JSON-OCSF (Open Cybersecurity Schema Framework)
prowler aws --output-formats json-ocsf -M /tmp/prowler_results/

# Exemple de détection Prowler critique :
# [FAIL] 1.22 Ensure no IAM policies allow full "*:*" administrative privileges
# [FAIL] 2.1.1 Ensure S3 Bucket Policy is not publicly accessible
```

---

## Module 3 — Logging & Threat Detection (CloudTrail & GuardDuty) (1h30)

### 🛠️ Atelier Pratique — Centralisation des Logs d'Audit Cloud

```bash
# ══════════════════════════════════════════════════════
# AWS CLI — Validation du Logging CloudTrail & GuardDuty
# ══════════════════════════════════════════════════════

# 1. Vérifier que CloudTrail est activé sur toutes les régions avec KMS
aws cloudtrail describe-trails --query "trailList[*].[Name, IsMultiRegionTrail, LogFileValidationEnabled, KmsKeyId]"

# 2. Activer la validation d'intégrité des logs CloudTrail
aws cloudtrail update-trail --name "paradis-global-audit-trail" --enable-log-file-validation

# 3. Activer AWS GuardDuty (Threat Detection basé sur ML & Threat Intel)
aws guardduty create-detector --enable
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CSPM** | Cloud Security Posture Management — Outils d'audit continu des configurations et de la conformité Cloud |
| **SCP** | Service Control Policy — Politiques d'organisation AWS restreignant les actions maximales possibles par compte |
| **OCSF** | Open Cybersecurity Schema Framework — Spécification standard pour la normalisation des événements de sécurité |

---

## Exercices Pratiques

### Exercice 1 — Politique IAM Minimale

Identifiez le problème de sécurité dans cette politique IAM AWS :
```json
{
  "Effect": "Allow",
  "Action": "s3:*",
  "Resource": "*"
}
```
Comment la réécrire selon le principe du Moindre Privilège ?

**Corrigé guidé :** Cette politique donne tous les privilèges S3 sur TOUS les buckets du compte (y compris la suppression de buckets et la modification des politiques d'accès). Réécriture au moindre privilège (ex: lecture seule sur un bucket spécifique) :
```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject", "s3:ListBucket"],
  "Resource": [
    "arn:aws:s3:::paradis-app-data-prod",
    "arn:aws:s3:::paradis-app-data-prod/*"
  ]
}
```

---

## Banque QCM — 5 Questions

**Q1.** Dans le modèle IaaS (Infrastructure as a Service), quelle tâche relève de la responsabilité du CLIENT ?

- A) La maintenance physique des disques durs du datacenter
- B) Le patching et la mise à jour de l'OS de la Machine Virtuelle ✅
- C) La réparation de l'hyperviseur physique KVM/Xen
- D) La protection contre les coupures d'électricité du bâtiment

**Q2.** Les outils **CSPM** (comme Prowler ou ScoutSuite) servent à :

- A) Générer des mots de passe aléatoires pour les utilisateurs
- B) Auditer continuellement la configuration des services Cloud par rapport à des standards de conformité (CIS, NIST) ✅
- C) Remplacer les pare-feu applicatifs WAF
- D) Décoder les flux vidéo en temps réel

**Q3.** La fonctionnalité **Log File Validation** dans AWS CloudTrail permet de :

- A) Réduire le coût de stockage des logs
- B) Garantir cryptographiquement qu'aucun journal d'audit n'a été altéré ou supprimé depuis son écriture (Non-répudiation) ✅
- C) Traduire les logs en français
- D) Supprimer automatiquement les logs après 7 jours

**Q4.** Les **Service Control Policies (SCP)** AWS permettent de :

- A) Fixer les limites maximales de privilèges sur l'ensemble des comptes d'une organisation Cloud ✅
- B) Chiffrer les disques durs virtuels EBS
- C) Gérer les abonnements bancaires des utilisateurs
- D) Créer des règles de routage BGP

**Q5.** AWS **GuardDuty** utilise principalement quelles sources de données pour détecter les menaces ?

- A) Les emails des employés
- B) Les logs CloudTrail, VPC Flow Logs et DNS Logs analysés par apprentissage automatique et Threat Intel ✅
- C) Les fichiers PDF stockés sur le bureau des utilisateurs
- D) Les enregistrements vocaux du service client

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
