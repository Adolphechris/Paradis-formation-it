# TOME P7 — Certifications d'Élite & Spécialisations — Jour 345 (6h) : Projet Intégrateur S7 Partie 9 — Threat Modeling + API Security + Secrets Management + Container Escape (Architecture Audit & Hardening Global)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre une évaluation pratique globale de niveau Architecte Sécurité / Lead DevSecOps combinant la **Modélisation des Menaces (PASTA / STRIDE)**, la **Sécurité des APIs (OWASP API Top 10 2023)**, la **Gestion des Secrets (HashiCorp Vault / SOPS)** et le **Hardening de Conteneurs (Anti-Container Escape)** : auditer une architecture bancaire découpée en microservices, exécuter les POCs d'exploitation (BOLA, Docker Socket Abuse, Leak de Secrets), et formaliser le plan d'architecture cible hardened.
>
> **Ce projet valide l'aptitude technique et méthodologique intégrée requise pour les rôles de Senior Security Architect et Lead DevSecOps.**

---

## 1) Module — Plateforme d'Audit & Validation d'Architecture (`architecture_capstone_auditor.py`) (2h30)

### 🛠️ Script d'Audit Technique et de Validation de Sécurité

```python
import json
import re

class ArchitectureCapstoneAuditor:
    """
    Projet Intégrateur S7 Partie 9 :
    1. Verification des vulnérabilités BOLA & Mass Assignment API
    2. Audit de l'exposition du Docker Socket & privilèges conteneur
    3. Controle de la gestion des secrets (Vault / SOPS vs Secrets Statiques)
    """

    def __init__(self, app_config: dict, source_code: str):
        self.config = app_config
        self.code = source_code

    def audit_api_security(self) -> list:
        """Détecte les failles OWASP API Top 10 (BOLA & Mass Assignment)."""
        findings = []

        # 1. Verification BOLA (Absence de check de propriété sur l'ID ressource)
        if "request.args.get('account_id')" in self.code and "check_user_ownership" not in self.code:
            findings.append({
                "component": "API Gateway / Account Controller",
                "vulnerability": "OWASP API1:2023 - BOLA (Broken Object Level Authorization)",
                "severity": "CRITICAL",
                "remediation": "Insérer une validation stricte : `if current_user.id != account.owner_id: abort(403)`"
            })

        # 2. Verification Mass Assignment
        if "user.update(request.json)" in self.code:
            findings.append({
                "component": "API User Profile Controller",
                "vulnerability": "OWASP API6:2023 - Mass Assignment",
                "severity": "HIGH",
                "remediation": "Utiliser DTO/Whitelisting strict des champs autorisés avant mise à jour de l'objet."
            })

        return findings

    def audit_container_and_secrets(self) -> list:
        """Audite la sécurité des conteneurs et la gestion des secrets."""
        findings = []

        # 1. Exposition Docker Socket
        volumes = self.config.get("volumes", [])
        if any("/var/run/docker.sock" in str(v) for v in volumes):
            findings.append({
                "component": "Docker Compose / K8s Manifest",
                "vulnerability": "Container Escape - Exposed Docker Socket",
                "severity": "CRITICAL",
                "remediation": "Supprimer le montage de /var/run/docker.sock. Utiliser l'API K8s avec RBAC."
            })

        # 2. Hardcoded Secrets dans la configuration
        env_vars = str(self.config.get("environment", {}))
        if re.search(r"(password|secret|key)\s*[:=]\s*[\"'][^\"']{5,}", env_vars, re.IGNORECASE):
            findings.append({
                "component": "Deployment Manifest",
                "vulnerability": "Hardcoded Static Secrets in Environment",
                "severity": "HIGH",
                "remediation": "Migrer les secrets vers HashiCorp Vault Dynamic Secrets ou Mozilla SOPS."
            })

        return findings

# Configuration et Code Source de la Plateforme d'Open Banking à Auditer
mock_compose_config = {
    "version": "3.8",
    "services": {
        "banking_api": {
            "image": "paradis/banking-api:v1.0",
            "volumes": ["/var/run/docker.sock:/var/run/docker.sock"], # Vulnérabilité Container Escape !
            "environment": {
                "DB_PASSWORD": "StaticSuperSecretPassword123!" # Vulnérabilité Secrets Statiques !
            }
        }
    }
}

mock_api_code = """
@app.route('/api/v1/account/details')
def get_details():
    account_id = request.args.get('account_id')
    # Vulnerabilité BOLA (Pas de check d'ownership)
    return db.query(f"SELECT * FROM accounts WHERE id = {account_id}")

@app.route('/api/v1/user/update', methods=['POST'])
def update_user():
    # Vulnerabilité Mass Assignment
    user.update(request.json)
    return jsonify(status="ok")
"""

auditor = ArchitectureCapstoneAuditor(mock_compose_config, mock_api_code)
api_findings = auditor.audit_api_security()
infra_findings = auditor.audit_container_and_secrets()

print("=== AUDIT INTEGRÉ D'ARCHITECTURE & SÉCURITÉ (S7 P9) ===")
print("\n[+] Audit Sécurité API :")
print(json.dumps(api_findings, indent=2, ensure_ascii=False))

print("\n[+] Audit Infrastructure & Secrets :")
print(json.dumps(infra_findings, indent=2, ensure_ascii=False))
```

---

## 2) Module — Plan d'Architecture Cible Hardened (1h30)

```markdown
# ARCHITECTURE CIBLE SÉCURISÉE (TARGET HARDENED STATE)

```
[ Client Mobile / Web ]
           │
           ▼ (HTTPS / TLS 1.3 - mTLS Optional)
  [ WAF v2 + AWS Shield Advanced ]
           │
           ▼
  [ API Gateway (Kong / AWS API GW) ]
     - Validation OAuth2 / JWT (RS256 uniquement)
     - Rate Limiting + Check BOLA & Mass Assignment (DTOs)
           │
           ▼ (Réseau Interne Chiffré Istio mTLS)
  [ Cluster Kubernetes (EKS Hardened) ]
     - Pod Security Standards: Restricted (No Root, No Docker Socket)
     - Secrets injectés via HashiCorp Vault Agent (Dynamic Secrets TTL 1h)
     - Runtime Protection via Amazon GuardDuty EKS (eBPF)
```
```

---

## 3) Module — Grille de Validation du Projet S7 P9 (2h)

```markdown
## EVALUATION GRID — CAPSTONE S7 PARTIE 9

| Domaine | Critères d'Évaluation | Pondération | Statut |
|:---|:---|:---:|:---:|
| **Threat Modeling (PASTA)** | Identification des menaces DFD et calcul de risque | 25% | **VALIDÉ** |
| **API Security (OWASP)** | Audit & Correction des failles BOLA & Mass Assignment | 25% | **VALIDÉ** |
| **Secrets Management** | Intégration de Vault Dynamic Secrets & SOPS | 25% | **VALIDÉ** |
| **Container Hardening** | Détection & Correction des failles d'évasion conteneur | 25% | **VALIDÉ** |

**Score Final : 100/100 — CERTIFICATION INTERNE S7 P9 OCTROYÉE**
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DTO** | Data Transfer Object — Objet intermédiaire restreignant les champs acceptés lors d'un appel d'API |
| **BOLA** | Broken Object Level Authorization — Défaut d'autorisation au niveau de l'objet |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
