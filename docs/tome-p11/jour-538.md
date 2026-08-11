# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 538 (6h) : Gouvernance Cloud & FinOps : Cloud Security Posture Management, CSPM, Azure Policy & Optimisation des Coûts

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre le concept de **CSPM (Cloud Security Posture Management)** et son rôle dans la détection des misconfigurationss cloud en continu
> - Maîtriser **Azure Policy / AWS Config** pour enforcer les règles de conformité au niveau de l'infrastructure cloud
> - Appliquer les principes du **FinOps** pour réconcilier les impératifs de sécurité avec l'optimisation des coûts cloud
> - Utiliser **Microsoft Defender for Cloud** et **AWS Security Hub** comme tableaux de bord CSPM centralisés
>
> **Compétences visées :** `SEC-05` (A), `CLD-02` (A), `POL-02` (A) — Cloud Governance, CSPM, FinOps

---

## Module 1 — Cloud Security Posture Management (CSPM) (2h)

### 📖 Intuition & Narration

Le cloud est extrêmement puissant, mais aussi extrêmement facile à mal configurer. Une seule erreur — un bucket S3 laissé public, un port de management SSH ouvert sur l'internet, un groupe de sécurité trop permissif — peut exposer des millions de données.

Le **CSPM (Cloud Security Posture Management)** répond à la question suivante : "Mon infrastructure cloud est-elle conforme à mes propres politiques de sécurité, aux benchmarks CIS, au RGPD et aux standards SOC2 en ce moment précis ?"

Les rapports Gartner estiment que **99% des failles de sécurité cloud jusqu'en 2025 seront dues à des erreurs de configuration**, pas à des vulnérabilités zero-day. Le CSPM automatise la détection de ces dérives.

### 🔍 Anatomie Technique — Les Misconfigurationss Cloud les Plus Fréquentes

```
TOP 10 DES MISCONFIGURATIONSS CLOUD (SOURCE : GARTNER / CIS AWS BENCHMARK)

  1.  Bucket S3 public (données sans authentification accessibles sur internet)
  2.  Groupe de sécurité AWS avec 0.0.0.0/0 sur SSH (port 22 ouvert au monde)
  3.  MFA non activé sur les comptes AWS root et IAM Admin
  4.  CloudTrail désactivé (pas d'audit trail des actions API)
  5.  Clés d'accès IAM non rotées depuis > 90 jours
  6.  Chiffrement KMS non activé sur les volumes EBS ou les bases RDS
  7.  Snapshot RDS publique (données de prod exposées)
  8.  Absence de VPC Flow Logs (pas de visibilité réseau)
  9.  Rôles IAM avec permissions * (administrateur par défaut)
  10. Registre ECR/ACR public sans authentification requise
```

---

## Module 2 — Azure Policy & AWS Config (2h)

### 🔍 Anatomie Technique — Azure Policy

**Azure Policy** est le moteur de gouvernance natif d'Azure. Il évalue en continu les ressources Azure et signale (audit) ou bloque (deny) celles qui ne respectent pas les règles définies.

Une **Initiative (Policy Set)** regroupe plusieurs politiques pour un objectif commun (ex: conformité ISO 27001, PCI DSS, RGPD).

```bash
#!/bin/bash
# ============================================================
# PARADIS — Azure Policy : Enforcer les tags obligatoires
# et bloquer les ressources dans des régions non autorisées
# ============================================================

# Prérequis : az login effectué

SUBSCRIPTION_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
RG_SCOPE="/subscriptions/${SUBSCRIPTION_ID}"

# --- Politique 1 : Tag "Environnement" obligatoire sur toutes les ressources ---
echo "[1/3] Création de la politique de tagging obligatoire..."
az policy definition create \
  --name "exiger-tag-environnement" \
  --display-name "Exiger le tag Environnement" \
  --description "Toutes les ressources Azure doivent avoir le tag Environnement (Production/Staging/Dev)" \
  --mode All \
  --rules '{
    "if": {
      "field": "tags[Environnement]",
      "exists": "false"
    },
    "then": {
      "effect": "deny"
    }
  }'

# --- Politique 2 : Autoriser uniquement les régions France Central et West Europe ---
echo "[2/3] Restriction des régions autorisées..."
az policy definition create \
  --name "restreindre-regions-eu" \
  --display-name "Restreindre les régions à l'Europe" \
  --description "Seules les régions francecentral et westeurope sont autorisées (conformité RGPD)" \
  --mode All \
  --rules '{
    "if": {
      "field": "location",
      "notIn": ["francecentral", "westeurope", "global"]
    },
    "then": {
      "effect": "deny"
    }
  }'

# --- Assigner les politiques à l'abonnement ---
echo "[3/3] Assignation des politiques à l'abonnement..."
az policy assignment create \
  --name "exiger-tag-envt-assignment" \
  --policy "exiger-tag-environnement" \
  --scope "${RG_SCOPE}"

az policy assignment create \
  --name "restreindre-regions-eu-assignment" \
  --policy "restreindre-regions-eu" \
  --scope "${RG_SCOPE}"

echo "[✅] Politiques Azure déployées et actives sur l'abonnement."
```

### 🛠️ Script Python : CSPM Audit Report Generator (AWS via Boto3)

```python
#!/usr/bin/env python3
"""
PARADIS — CSPM Quick Audit Tool (AWS)
Vérifie les misconfigurationss courantes : buckets S3 publics, MFA root, CloudTrail.
"""
import json

class AWSCSPMAuditor:
    """
    Simulateur d'audit CSPM AWS (les appels boto3 réels nécessitent des credentials AWS).
    En production, remplacer les valeurs simulées par des appels boto3 réels.
    """

    def __init__(self):
        # Simulation des résultats d'audit
        self.findings = []

    def _add_finding(self, severity: str, resource: str, check: str, detail: str, remediation: str):
        self.findings.append({
            "severity": severity,
            "resource": resource,
            "check": check,
            "detail": detail,
            "remediation": remediation
        })

    def check_s3_public_buckets(self):
        """Vérifie si des buckets S3 ont une ACL publique."""
        print("  [*] Vérification des buckets S3 publics...")
        # SIMULATION : En prod, utiliser boto3.client('s3').list_buckets()
        # puis get_bucket_acl() et get_bucket_policy_status() pour chaque bucket.
        simulated_public_buckets = ["paradis-logs-backup", "paradis-media-archive"]
        for bucket_name in simulated_public_buckets:
            self._add_finding(
                severity="CRITIQUE",
                resource=f"s3://{bucket_name}",
                check="S3.02 - Bucket S3 public",
                detail=f"Le bucket '{bucket_name}' est accessible publiquement sans authentification.",
                remediation="aws s3api put-public-access-block --bucket " + bucket_name + " --public-access-block-configuration 'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'"
            )

    def check_mfa_root(self):
        """Vérifie si le MFA est activé sur le compte root AWS."""
        print("  [*] Vérification du MFA root...")
        # SIMULATION : En prod, utiliser boto3.client('iam').get_account_summary()
        mfa_active_on_root = False
        if not mfa_active_on_root:
            self._add_finding(
                severity="CRITIQUE",
                resource="aws://iam/root",
                check="IAM.01 - MFA root non activé",
                detail="Le compte root AWS n'a pas de MFA activé. Une compromission du mot de passe root donne un accès total.",
                remediation="Activer un MFA virtuel ou matériel (YubiKey) sur le compte root via la console AWS IAM."
            )

    def check_cloudtrail(self):
        """Vérifie si CloudTrail est actif dans toutes les régions."""
        print("  [*] Vérification de CloudTrail...")
        # SIMULATION
        inactive_regions = ["eu-west-3", "us-east-1"]
        for region in inactive_regions:
            self._add_finding(
                severity="HAUTE",
                resource=f"aws://cloudtrail/{region}",
                check="CloudTrail.01 - Audit trail inactif",
                detail=f"CloudTrail n'est pas actif dans la région '{region}'. Aucune action API n'est tracée.",
                remediation=f"aws cloudtrail create-trail --name paradis-trail --s3-bucket-name paradis-audit-logs --include-global-service-events --is-multi-region-trail --region {region}"
            )

    def generate_report(self):
        print("\n" + "="*60)
        print("  RAPPORT D'AUDIT CSPM — PARADIS CLOUD (AWS)")
        print("="*60)
        print()
        self.check_s3_public_buckets()
        self.check_mfa_root()
        self.check_cloudtrail()

        critiques = [f for f in self.findings if f["severity"] == "CRITIQUE"]
        hautes    = [f for f in self.findings if f["severity"] == "HAUTE"]
        print(f"\n[RÉSUMÉ] Findings CRITIQUE : {len(critiques)} | HAUTE : {len(hautes)}")
        print()

        for i, finding in enumerate(self.findings, 1):
            sev = finding["severity"]
            icon = "🚨" if sev == "CRITIQUE" else "⚠️"
            print(f"  {icon} [{sev}] Finding {i:02d} : {finding['check']}")
            print(f"     Resource     : {finding['resource']}")
            print(f"     Détail       : {finding['detail']}")
            print(f"     Remédiation  : {finding['remediation']}")
            print()

if __name__ == "__main__":
    auditor = AWSCSPMAuditor()
    auditor.generate_report()
```

---

## Module 3 — FinOps : Réconcilier Sécurité et Coûts Cloud (1h30)

### 🔍 Principes FinOps & Optimisation Sécurisée

**FinOps** (Financial Operations) est la pratique qui consiste à réconcilier les responsabilités de cloud engineering, finance et sécurité autour de la maîtrise des coûts cloud. Pour les équipes sécurité, cela signifie :

| Levier FinOps | Impact Sécurité |
|:---|:---|
| **Rightsizing des instances** | Supprimer les machines surdimensionnées réduit aussi la surface d'attaque |
| **Suppression des ressources orphelines** | Buckets S3 inutilisés, EIP non attachées, snapshots oubliés → vecteurs d'attaque et coûts inutiles |
| **Reserved Instances / Savings Plans** | Engagement sur des configurations validées = baseline immuable = moins de dérives de configuration |
| **Tags de coût obligatoires** | La gouvernance de tags (Azure Policy) s'aligne avec la visibilité FinOps |

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CSPM** | Cloud Security Posture Management — Gestion continue de la posture de sécurité cloud |
| **FinOps** | Financial Operations — Pratique de gouvernance des coûts cloud multi-équipe |
| **Azure Policy** | Service natif Azure d'enforcement de politiques de gouvernance sur les ressources |
| **AWS Config** | Service AWS qui enregistre l'état des ressources et évalue leur conformité aux règles |
| **KMS** | Key Management Service — Service de gestion centralisée des clés de chiffrement (AWS/Azure) |

---

## Exercices Pratiques

### Exercice 1 — Score de Posture CSPM

En utilisant la liste des 10 misconfigurationss les plus fréquentes présentées en Module 1, auditez (conceptuellement) une infrastructure cloud fictive comportant :
- 5 buckets S3 (dont 2 publics)
- CloudTrail actif uniquement dans 2 régions sur 5
- MFA non activé sur le compte root
- 3 groupes de sécurité avec port 22 ouvert à 0.0.0.0/0

Calculez le **Secure Score** de cette infrastructure (pourcentage de contrôles réussis / total).

**Corrigé guidé :**
- Total de contrôles évalués : 10 (liste des 10 top misconfigurationss)
- Contrôles échoués : 4 (S3 public × 2 = 1 finding, CloudTrail incomplet = 1, MFA root = 1, SG ouvert = 1)
- Contrôles réussis : 6
- **Secure Score = 6/10 = 60%** (Insuffisant — cible minimale PARADIS : 80%)

---

## Banque QCM — 5 Questions

**Q1.** Selon Gartner, quelle est la principale cause des failles de sécurité cloud ?

- A) Les attaques zero-day exploitant des vulnérabilités inconnues.
- B) Les erreurs de configuration (misconfigurationss) des services cloud (99% des cas estimés). ✅
- C) Les attaques de type déni de service.
- D) L'absence de pare-feux applicatifs.

**Q2.** Qu'est-ce que le **CSPM (Cloud Security Posture Management)** ?

- A) Un outil de surveillance des performances des applications cloud.
- B) Une solution qui évalue en continu la configuration de l'infrastructure cloud par rapport à des benchmarks de sécurité (CIS, NIST, RGPD) et signale les dérives. ✅
- C) Un service de sauvegarde des données cloud.
- D) Un protocole de chiffrement pour les transferts cloud.

**Q3.** Dans Azure Policy, quel effet est utilisé pour **bloquer la création** d'une ressource non conforme (ex: une VM créée dans une région non autorisée) ?

- A) `Audit` — Enregistre une non-conformité sans bloquer.
- B) `DeployIfNotExists` — Déploie une ressource manquante.
- C) `Deny` — Bloque immédiatement la requête de création/modification non conforme. ✅
- D) `Modify` — Modifie automatiquement la ressource pour la rendre conforme.

**Q4.** Dans une démarche **FinOps**, la suppression des ressources cloud "orphelines" (buckets S3 vides, snapshots oubliés) a également un bénéfice pour la sécurité. Lequel ?

- A) Accélère les déploiements CI/CD.
- B) Réduit la surface d'attaque en éliminant des ressources potentiellement mal configurées et oubliées qui pourraient être exploitées. ✅
- C) Améliore les performances réseau.
- D) Permet d'obtenir de meilleures remises sur les contrats cloud.

**Q5.** Qu'est-ce que **AWS Config** ?

- A) Le service AWS permettant de configurer les pare-feux réseau.
- B) Un service qui enregistre en continu la configuration de toutes les ressources AWS, détecte les changements et évalue leur conformité aux règles définies (Config Rules). ✅
- C) Un outil de déploiement d'infrastructure via des templates YAML.
- D) Le service de gestion des certificats TLS d'AWS.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
