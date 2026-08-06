# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 262 (6h) : Cloud Security Posture Management (CSPM, Wiz/Prowler, Multi-Cloud Misconfigurations & Automated Compliance)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **Cloud Security Posture Management (CSPM)** et l'évaluation continue des architectures multi-cloud (AWS, Azure, GCP) : utiliser l'outil open-source **Prowler v4**, cartographier les mauvaises configurations d'infrastructure, automatiser les audits de conformité CIS Benchmarks, et appliquer les remédiations de sécurité au niveau tenant.
>
> **Compétences visées :** `CLOUD-01` (A) — CSPM & Multi-Cloud Posture Management | `AUDIT-01` (A) — Prowler v4 & CIS Benchmarks Auditing

---

## 1) Module — Concepts du CSPM & Risk Prioritization (1h30)

### 📖 Narration/Intuition

Le **CSPM (Cloud Security Posture Management)** est la discipline qui consiste à analyser en continu les configurations des ressources Cloud (AWS S3, EC2, IAM, Azure KeyVault, GCP Storage) pour détecter les écarts par rapport aux bonnes pratiques et référentiels de sécurité (CIS Benchmarks, NIST SP 800-53, ISO 27001). Des outils du marché comme **Wiz**, **Prisma Cloud** ou **Prowler** identifient les "chemins de toxicité" (Toxic Combinations : S3 public + clés d'API exposées + rôle admin).

---

## 2) Module — Audit Multi-Cloud avec Prowler v4 (2h30)

### 🛠️ Atelier Pratique

**Audit AWS, Azure et GCP avec Prowler v4 (`prowler_audit.sh`) :**

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Installation de Prowler v4 via pip
# ═══════════════════════════════════════════════════════
pip install prowler
prowler --version  # v4.x.x

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Exécution d'un audit complet AWS CIS Benchmark
# ═══════════════════════════════════════════════════════
# Audit d'un compte AWS configuré avec aws configure
prowler aws --compliance cis_3.0_aws -M csv json html

# cibler des contrôles spécifiques critiques (S3 public, Root account MFA)
prowler aws --checks s3_bucket_public_access iam_root_mfa_enabled ec2_instance_public_ip

# ═══════════════════════════════════════════════════════
# ÉTAPE 3 — Exécution d'un audit Azure & GCP
# ═══════════════════════════════════════════════════════
# Audit Azure Tenant
prowler azure --sp-env-auth -M html

# Audit GCP Project
prowler gcp --project-id my-gcp-project-123 -M html
```

---

## 3) Module — Remédiation Automatisée & Incident Policy (2h)

### 🛠️ Script Python de remédiation S3 Public Access (`s3_auto_remediate.py`)

```python
import boto3

# Script de remédiation automatique CSPM : Fermer tous les buckets S3 publics
s3 = boto3.client('s3')

def remediate_public_buckets():
    buckets = s3.list_buckets()['Buckets']
    for b in buckets:
        name = b['Name']
        print(f"[*] Analyse du bucket S3 : {name}")
        try:
            # Appliquer le blocage d'accès public (S3 Block Public Access)
            s3.put_public_access_block(
                Bucket=name,
                PublicAccessBlockConfiguration={
                    'BlockPublicAcls': True,
                    'IgnorePublicAcls': True,
                    'BlockPublicPolicy': True,
                    'RestrictPublicBuckets': True
                }
            )
            print(f"[+] Remédiation appliquée avec succès sur : {name}")
        except Exception as e:
            print(f"[-] Erreur lors de la remédiation de {name} : {e}")

remediate_public_buckets()
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CSPM** | Cloud Security Posture Management — Gestion continue de la posture de sécurité Cloud |
| **Prowler** | Outil d'audit de sécurité multi-cloud open-source de référence |
| **CIS Benchmark** | Center for Internet Security — Référentiels d'évaluation de sécurité des OS et Cloud |
| **Wiz** | Plateforme leader commerciale de CSPM et sécurité Cloud par analyse de graphes |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la fonction principale d'un outil **CSPM** comme Prowler ou Wiz ?
- A) Évaluer en continu les configurations des ressources Cloud par rapport aux normes de sécurité et détecter les mauvaises configurations
- B) Bloquer les attaques DDoS
- C) Compiler du code C++
- D) Sauvegarder des bases de données

**Réponse : A**

**Q2 :** Quelle option de la CLI Prowler v4 permet de lancer un audit spécifique basé sur le référentiel **CIS Benchmark AWS 3.0** ?
- A) `prowler aws --compliance cis_3.0_aws`
- B) `prowler --run cis`
- C) `prowler scan aws`
- D) `prowler --cis-only`

**Réponse : A**

**Q3 :** Qu'est-ce qu'une **"Toxic Combination"** dans le contexte du CSPM ?
- A) La combinaison de plusieurs mauvaises configurations qui créent ensemble un chemin d'attaque critique (ex: S3 public + rôle IAM trop permissif)
- B) Une erreur de syntaxe en Python
- C) Une panne réseau
- D) Une attaque par déni de service

**Réponse : A**

**Q4 :** Quelle API AWS boto3 permet de bloquer globalement tout accès public sur un bucket S3 au niveau compte/bucket ?
- A) `put_public_access_block`
- B) `delete_bucket`
- C) `stop_instances`
- D) `create_user`

**Réponse : A**

**Q5 :** Quel organisme édite les **CIS Benchmarks** utilisés comme référence internationale pour les audits CSPM ?
- A) Center for Internet Security (CIS)
- B) ISO
- C) NIST
- D) ANSSI

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
