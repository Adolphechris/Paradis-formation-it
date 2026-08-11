# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 507 (6h) : Infrastructure-as-Code & GitOps Security : Hardening Terraform, Checkov, Sécurité ArgoCD & Gestion des Secrets Vault

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre les risques de sécurité propres à l'Infrastructure-as-Code (IaC Misconfigurations, Secrets dans le code)
> - Analyser statiquement du code Terraform / CloudFormation avec **Checkov** et **tfsec**
> - Sécuriser les pipelines GitOps (ArgoCD / FluxCD) contre les attaques par empoisonnement du dépôt Git
> - Centraliser la gestion dynamique des secrets avec **HashiCorp Vault** et l'opérateur **External Secrets Operator (ESO)**
>
> **Compétences visées :** `SEC-05` (A), `INF-02` (A) — IaC Security & GitOps Security

---

## Module 1 — Risques de l'Infrastructure-as-Code & Scanning Statique (2h)

### 📖 Intuition & Narration

L'Infrastructure-as-Code (IaC) permet aux équipes d'instancier des milliers de serveurs, bases de données et sous-réseaux cloud en quelques secondes grâce à des fichiers Terraform ou Bicep.

Cependant, une unique erreur de configuration dans un fichier Terraform (ex: un bucket AWS S3 configuré avec `acl = "public-read"` ou un groupe de sécurité autorisant `0.0.0.0/0` sur le port SSH 22) est immédiatement répliquée à l'échelle de l'entreprise.

Sécuriser l'IaC consiste à scanner le code d'infrastructure **avant son exécution (`terraform apply`)** dans le pipeline CI/CD.

### 🔍 Anatomie Technique — Pipeline IaC Security & External Secrets Operator (ESO)

```
PIPELINE DE SÉCURITÉ IAC & GITOPS

  [ COMMIT TERRAFORM / MANIFEST ] ──► [ SCANCHECKOV / TFSEC ] ──► [ ARGO CD GITOPS ]
                                              │                         │
                                              ▼                         ▼
                                    [ SECURITY GATE passed ]   [ EXTERNAL SECRETS ]
                                                               Fetch Secrets depuis
                                                               HashiCorp Vault
```

---

## Module 2 — Atelier Pratique : Code Checker IaC & HashiCorp Vault Integration (2h)

### 🛠️ Code HCL Terraform & Script Python d'Audit de Sécurité IaC

```hcl
# /terraform/storage.tf — Exemple Terraform Hardened
resource "aws_s3_bucket" "secure_storage" {
  bucket = "paradis-enterprise-audit-logs"
}

resource "aws_s3_bucket_public_access_block" "public_block" {
  bucket                  = aws_s3_bucket.secure_storage.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "encryption" {
  bucket = aws_s3_bucket.secure_storage.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}
```

```python
#!/usr/bin/env python3
"""
PARADIS — Terraform Security Misconfiguration Inspector
Inspecte les configurations Terraform (format simulé JSON/HCL) pour détecter les erreurs courantes.
"""

import json
import sys

def audit_terraform_resources(resources: list) -> bool:
    print("=== AUDIT DE SÉCURITÉ INFRASTRUCTURE-AS-CODE (CHECKOV ENGINE) ===")
    violations = []

    for r in resources:
        r_type = r.get("type", "")
        r_name = r.get("name", "")
        config = r.get("config", {})

        # Règle CKV_AWS_20 : S3 Bucket Public Access
        if r_type == "aws_s3_bucket" and config.get("acl") == "public-read":
            violations.append(f"[🚨 CKV_AWS_20] Bucket S3 '{r_name}' configuré en accès PUBLIC !")

        # Règle CKV_AWS_19 : S3 Encryption
        if r_type == "aws_s3_bucket" and not config.get("encrypted", False):
            violations.append(f"[⚠️ CKV_AWS_19] Bucket S3 '{r_name}' n'a pas le chiffrement KMS activé !")

        # Règle CKV_AWS_24 : Security Group SSH Open to World
        if r_type == "aws_security_group_rule":
            cidr = config.get("cidr_blocks", [])
            port = config.get("from_port", 0)
            if "0.0.0.0/0" in cidr and port == 22:
                violations.append(f"[🚨 CKV_AWS_24] Groupe de sécurité '{r_name}' : Port SSH 22 ouvert sur 0.0.0.0/0 !")

    print(f"[*] Analyse de {len(resources)} ressource(s) Terraform...")

    if violations:
        print(f"\n[!] Erreurs de configuration d'infrastructure détectées ({len(violations)}) :")
        for v in violations:
            print(f"  {v}")
        print("\n[⛔ RESULTAT] PIPELINE BLOQUÉ — Terraform Apply Interdit.")
        return False
    else:
        print("\n[✅ RESULTAT] IAC INFRASTRUCTURE HARDENED — Prêt pour Terraform Apply.")
        return True

if __name__ == "__main__":
    mock_tf_resources = [
        {
            "type": "aws_s3_bucket",
            "name": "logs_bucket",
            "config": {"acl": "private", "encrypted": True}
        },
        {
            "type": "aws_security_group_rule",
            "name": "ssh_rule",
            "config": {"from_port": 22, "to_port": 22, "cidr_blocks": ["0.0.0.0/0"]}
        }
    ]
    success = audit_terraform_resources(mock_tf_resources)
    if not success:
        sys.exit(1)
```

---

## Module 3 — Vault & Gestion des Secrets en GitOps (1h30)

### 🔍 Règle d'Or GitOps : Zéro Secret dans Git !

Dans un modèle GitOps (ArgoCD / FluxCD), le dépôt Git est la source unique de vérité. Cependant, **les secrets ne doivent JAMAIS être stockés dans Git**, même chiffrés avec des solutions simples, si la gestion des clés n'est pas garantie.

La solution recommandée est d'utiliser **HashiCorp Vault** combiné avec l'**External Secrets Operator (ESO)** sur Kubernetes. Git contient un objet `ExternalSecret` non sensible qui pointe vers le secret stocké dans Vault. ESO récupère le secret en mémoire lors du déploiement.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **IaC** | Infrastructure-as-Code — Gestion de l'infrastructure par des fichiers de configuration |
| **ESO** | External Secrets Operator — Opérateur Kubernetes synchronisant des secrets depuis des coffres forts |
| **HCL** | HashiCorp Configuration Language — Langage de configuration utilisé par Terraform |
| **KMS** | Key Management Service — Service cloud de gestion des clés de chiffrement |

---

## Exercices Pratiques

### Exercice 1 — Audit d'une Règle Security Group

Expliquez le danger de cette règle Terraform Security Group :
```hcl
ingress {
  from_port   = 3306
  to_port     = 3306
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
}
```

**Corrigé guidé :**
Cette règle expose la base de données MySQL/MariaDB (port 3306) directement à l'ensemble d'Internet (`0.0.0.0/0`). Cela permet à n'importe quel attaquant distant de tenter des attaques par force brute ou d'exploiter des failles de la base de données. Le `cidr_blocks` doit être restreint exclusivement aux sous-réseaux applicatifs internes de l'entreprise.

---

## Banque QCM — 5 Questions

**Q1.** Quel est l'objectif d'un outil comme **Checkov** ou **tfsec** dans un pipeline DevSecOps ?

- A) Compiler du code Java.
- B) Analyser statiquement les fichiers Infrastructure-as-Code (Terraform, CloudFormation) pour détecter les mauvaises configurations de sécurité avant tout déploiement. ✅
- C) Nettoyer les fichiers temporaires.
- D) Générer des mots de passe.

**Q2.** Quelle est la règle d'or concernant la gestion des secrets (clés API, mots de passe de BDD) dans un modèle GitOps ?

- A) Il faut écrire tous les secrets en clair dans les manifests Git.
- B) Aucun secret ne doit être stocké en clair dans le dépôt Git ; les secrets doivent être centralisés dans un coffre-fort (Vault) et injectés dynamiquement via un opérateur (ESO). ✅
- C) Les secrets doivent être envoyés par e-mail.
- D) Les secrets ne sont pas nécessaires.

**Q3.** Quel composant Kubernetes permet de récupérer de manière sécurisée des secrets stockés dans HashiCorp Vault et de les transformer en `Secret` native Kubernetes ?

- A) External Secrets Operator (ESO). ✅
- B) NGINX Ingress.
- C) CoreDNS.
- D) kube-proxy.

**Q4.** Dans une configuration S3 AWS Terraform, que signifie l'option `block_public_acls = true` ?

- A) Bloquer l'accès aux développeurs.
- B) Interdire strictement l'attribution d'autorisations d'accès public sur le bucket S3 concerné. ✅
- C) Supprimer le bucket S3 après 24 heures.
- D) Activer le Wi-Fi.

**Q5.** Qu'est-ce que le langage **HCL** ?

- A) HyperText Control Language.
- B) HashiCorp Configuration Language, le langage déclaratif utilisé pour écrire des scripts Terraform. ✅
- C) Un format d'image compressé.
- D) Un protocole réseau.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
