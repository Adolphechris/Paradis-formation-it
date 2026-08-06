# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 263 (6h) : Infrastructure-as-Code Security (IaC Scanning avec Checkov, TFSec, Terrascan, Policy-as-Code & Drift Detection)

> [!NOTE]
> **Objectif du jour :** Maîtriser la **sécurisation des templates d'Infrastructure-as-Code (IaC)** dans les pipelines CI/CD : auditer les fichiers Terraform, CloudFormation, Ansible et Helm avec **Checkov** et **tfsec**, intégrer des contrôles de sécurité Shift-Left, écrire des politiques personnalisées en **Python/Rego**, et détecter le **Drift d'Infrastructure** (écarts entre le code IaC et la réalité de la production).
>
> **Compétences visées :** `DEVSEC-01` (A) — IaC Security Scanning (Checkov/TFSec) | `DEVSEC-02` (A) — Policy-as-Code & Drift Detection

---

## 1) Module — Concepts IaC Security & Shift-Left (1h30)

### 📖 Narration/Intuition

L'**Infrastructure-as-Code (IaC)** permet de provisionner des infrastructures Cloud entières (VMs, buckets, VPCs, clusters K8s) à l'aide de fichiers de configuration déclaratifs (Terraform `.tf`, CloudFormation `.yaml`, Helm charts). Sécuriser l'IaC consiste à **détecter les vulnérabilités et mauvaises configurations directement dans le code source** — avant qu'elles ne soient déployées en production.

---

## 2) Module — Audit IaC avec Checkov & TFSec (2h30)

### 🛠️ Atelier Pratique

**Audit d'un projet Terraform avec Checkov et TFSec (`iac_scan_workflow.sh`) :**

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Installation des scanners IaC
# ═══════════════════════════════════════════════════════
pip install checkov
curl -s https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install.sh | bash

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Création d'un fichier Terraform vulnérable (main.tf)
# ═══════════════════════════════════════════════════════
cat <<EOF > main.tf
resource "aws_s3_bucket" "vulnerable_bucket" {
  bucket = "my-company-sensitive-data"
  acl    = "public-read" # ERREUR CRITIQUE : Bucket public !
}

resource "aws_security_group" "vulnerable_sg" {
  name = "allow_all"
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # ERREUR CRITIQUE : SSH ouvert sur Internet !
  }
}
EOF

# ═══════════════════════════════════════════════════════
# ÉTAPE 3 — Exécution des scanners IaC
# ═══════════════════════════════════════════════════════

# Audit Checkov
checkov -f main.tf --framework terraform

# Audit TFSec avec génération de rapport SARIF pour GitHub Security Tab
tfsec . --format sarif -out tfsec-results.sarif
```

---

## 3) Module — Custom Checkov Policy en Python (`custom_checkov_policy.py`) (2h)

```python
from checkov.common.models.enums import CheckResult, CheckCategories
from checkov.terraform.checks.resource.base_resource_check import BaseResourceCheck

class S3EncryptionCheck(BaseResourceCheck):
    def __init__(self):
        name = "S'assurer que tous les buckets S3 ont le chiffrement KMS activé"
        id = "CKV_PARADIS_001"
        supported_resources = ['aws_s3_bucket']
        categories = [CheckCategories.ENCRYPTION]
        super().__init__(name=name, id=id, categories=categories, supported_resources=supported_resources)

    def scan_resource_conf(self, conf):
        if 'server_side_encryption_configuration' in conf:
            return CheckResult.PASSED
        return CheckResult.FAILED

check = S3EncryptionCheck()
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **IaC** | Infrastructure-as-Code — Gestion de l'infrastructure sous forme de code source |
| **Checkov** | Scanner IaC open-source multi-framework (Terraform, CloudFormation, K8s, Helm) de Bridgecrew |
| **tfsec** | Scanner de sécurité dédié à Terraform de Trivy / Aqua Security |
| **Drift Detection** | Identification des modifications manuelles apportées en production en dehors du code IaC |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le principal avantage de la sécurité IaC (Shift-Left) par rapport au CSPM traditionnel ?
- A) Détecter et corriger les mauvaises configurations directement dans le code source avant le déploiement en production
- B) Éviter d'utiliser des mots de passe
- C) Accélérer le réseau
- D) Supprimer le besoin de sauvegardes

**Réponse : A**

**Q2 :** Quel outil open-source développé par Bridgecrew / Palo Alto Networks permet d'auditer les fichiers Terraform, Helm, CloudFormation et K8s ?
- A) Checkov
- B) Wireshark
- C) Metasploit
- D) Volatility

**Réponse : A**

**Q3 :** Qu'est-ce que le **Drift d'Infrastructure** (Infrastructure Drift) ?
- A) La différence entre l'état défini dans les fichiers de code IaC et l'état réel des ressources déployées en production (ex: modification manuelle de la console AWS)
- B) Une baisse de performance réseau
- C) La migration de données vers un autre datacenter
- D) La mise à jour d'un système d'exploitation

**Réponse : A**

**Q4 :** Quel format de fichier d'export standardisé est généré par `tfsec` pour l'intégration dans l'onglet Security/Code Scanning de GitHub ?
- A) SARIF (Static Analysis Results Interchange Format)
- B) PDF
- C) MP4
- D) CSV

**Réponse : A**

**Q5 :** Dans Checkov, dans quel langage est-il possible d'écrire des règles de contrôle de sécurité personnalisées ?
- A) Python ou YAML
- B) C++ uniquement
- C) Java
- D) PHP

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
