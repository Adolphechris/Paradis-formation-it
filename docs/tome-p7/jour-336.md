# TOME P7 — Certifications d'Élite & Spécialisations — Jour 336 (6h) : Cloud Native Security — AWS EKS Security, ECR Vulnerability Scanning & GuardDuty EKS Protection (Container Security in AWS)

> [!NOTE]
> **Objectif du jour :** Maîtriser la **sécurité des architectures Cloud Native sous AWS (EKS / ECR)** : sécuriser l'accès au cluster EKS via **IAM Roles for Service Accounts (IRSA)** et **EKS Pod Identities**, automatiser l'analyse des images dans **Amazon ECR** (Enhanced Scanning avec Inspector), et instrumenter la détection d'intrusions à l'exécution avec **Amazon GuardDuty EKS Protection** (Audit Logs & Runtime Monitoring).
>
> **Compétences visées :** `AWS-SEC-09` (A) — AWS EKS Hardening & IRSA / Pod Identities | `AWS-SEC-10` (A) — GuardDuty EKS Audit & Runtime Protection

---

## 1) Module — EKS Identity & Access Management (IRSA vs Pod Identity) (2h)

### 📖 Narration/Intuition

Dans Amazon EKS, accorder des autorisations IAM directement aux nœuds worker (EC2 Node Role) est une mauvaise pratique majeure : n'importe quel pod du nœud peut hériter de ces droits. **IRSA (IAM Roles for Service Accounts)** et le nouveau modèle **EKS Pod Identities** permettent d'associer un rôle IAM spécifique à un ServiceAccount Kubernetes donné, selon le principe du moindre privilège.

```
[ Pod Kubernetes (ServiceAccount: s3-reader) ]
                       │
                       ▼ (OIDC Identity Provider / EKS Pod Identity Agent)
    [ EKS Pod Identity Agent (DaemonSet local) ]
                       │
                       ▼ (AssumeRoleForPod)
    [ AWS IAM Role: EKS-S3-ReadOnly-Role ] ──► [ Accès exclusif au Bucket S3 ]
```

---

## 2) Module — Outillage AWS EKS Security & Script Audit (`eks_security_hardening.py`) (2h)

### 🛠️ Atelier Pratique

```python
import boto3

class EKSSecurityAuditor:
    """
    Script d'audit de conformité sécurité pour clusters AWS EKS & ECR.
    """

    def __init__(self, cluster_name: str, region: str = "eu-west-1"):
        self.cluster_name = cluster_name
        self.eks = boto3.client('eks', region_name=region)
        self.ecr = boto3.client('ecr', region_name=region)
        self.gd = boto3.client('guardduty', region_name=region)

    def audit_eks_control_plane_logging(self) -> dict:
        """Vérifie l'activation des Control Plane Audit Logs (api, audit, authenticator)."""
        res = self.eks.describe_cluster(name=self.cluster_name)
        logging_config = res['cluster']['logging']['clusterLogging']
        
        active_types = []
        for cfg in logging_config:
            if cfg['enabled']:
                active_types.extend(cfg['types'])
                
        required = {'api', 'audit', 'authenticator', 'controllerManager', 'scheduler'}
        missing = required - set(active_types)
        
        return {
            "status": "PASS" if not missing else "FAIL",
            "active_logs": active_types,
            "missing_logs": list(missing)
        }

    def audit_ecr_repository_scanning(self, repo_name: str) -> dict:
        """Vérifie l'activation du Scan on Push sur Amazon ECR."""
        res = self.ecr.describe_repositories(repositoryNames=[repo_name])
        repo = res['repositories'][0]
        scan_on_push = repo.get('imageScanningConfiguration', {}).get('scanOnPush', False)
        
        return {
            "repository": repo_name,
            "scan_on_push": scan_on_push,
            "status": "PASS" if scan_on_push else "FAIL"
        }

# Execution Audit Test
auditor = EKSSecurityAuditor("paradis-prod-eks")
print("=== AUDIT SÉCURITÉ AWS EKS / ECR ===")
print("[1] Control Plane Audit Logs :", auditor.audit_eks_control_plane_logging())
```

---

## 3) Module — Amazon GuardDuty EKS Protection (2h)

```markdown
# CONFIGURATION GUARDDUTY EKS PROTECTION

## 1. GuardDuty EKS Audit Log Monitoring
GuardDuty analyse en continu les journaux d'audit de l'API Server EKS pour détecter les menaces :
- `CredentialAccess:Kubernetes/MaliciousIPCaller` : Accès à l'API K8s depuis une IP malveillante.
- `PrivilegeEscalation:Kubernetes/SystemClusterAdminBinding` : Bind d'un utilisateur au rôle cluster-admin.

## 2. GuardDuty EKS Runtime Monitoring
Déploie automatiquement un agent léger (eBPF DaemonSet) sur les nœuds EKS pour détecter les menaces système au niveau du container :
- Execution de shells interactifs non autorisés.
- Tentatives de container escape / modification de `/proc` ou `/sys`.
- Connexions réseau sortantes vers des pools de minage de crypto-monnaies.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **EKS** | Amazon Elastic Kubernetes Service — Service Kubernetes managé par AWS |
| **ECR** | Amazon Elastic Container Registry — Registre d'images de conteneurs AWS |
| **IRSA** | IAM Roles for Service Accounts — Association de rôles IAM à des ServiceAccounts K8s via OIDC |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est l'avantage principal d'**EKS Pod Identities** (ou IRSA) par rapport à l'attribution de permissions IAM au rôle du nœud EC2 ?
- A) Associer des rôles IAM spécifiques et restreints à chaque Pod individuel selon le principe du moindre privilège, plutôt que de donner toutes les permissions à tous les pods du même nœud
- B) Réduire la facture AWS
- C) Supprimer les certificats TLS
- D) Accélérer le réseau VPC

**Réponse : A**

**Q2 :** Comment Amazon GuardDuty EKS Runtime Monitoring surveille-t-il les activités suspectes au sein des conteneurs EKS ?
- A) À l'aide d'un agent léger basé sur eBPF déployé sur les nœuds pour capturer les appels système (syscalls) du noyau en temps réel
- B) En scannant le code source sur GitHub
- C) En analysant les emails des administrateurs
- D) Via un plugin navigateur

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
