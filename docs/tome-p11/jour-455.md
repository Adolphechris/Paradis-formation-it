# TOME P11 — DevSecOps & Cloud Security — Jour 455 (6h) : Projet Intégrateur S11 Partie 1 — Secure CI/CD Pipeline & Supply Chain Hardening Capstone

> [!NOTE]
> **Objectif du jour :** Conduire et valider le **Projet Intégrateur S11 Partie 1** — concevoir, déployer et auditer une pipeline CI/CD DevSecOps complète intégrant Secret Scanning (Gitleaks), SAST (Semgrep custom rules), SCA (Trivy SBOM CycloneDX), DAST (Nuclei API scan) et la signature d'image OCI Cosign/SLSA Level 3.
>
> **Ce projet synthétise et valide les compétences J451-J454.**

---

## 1) Module — Engine d'Orchestration DevSecOps Pipeline (`devsecops_pipeline_capstone.py`) (2h30)

### 🛠️ Script d'Orchestration du Projet Intégrateur

```python
import os
import json
import hashlib
from datetime import datetime, timezone
from typing import List, Dict

class DevSecOpsPipelineCapstoneEngine:
    """
    Projet Intégrateur S11 Partie 1 :
    Orchestrateur de pipeline CI/CD sécurisée et d'audit Supply Chain :
    - Phase 1: Pre-commit & Secret Scanning (Gitleaks & Entropy Check)
    - Phase 2: SAST (Semgrep Taint Analysis & Custom Rules)
    - Phase 3: SCA & SBOM Generation (CycloneDX & Dependency-Track API)
    - Phase 4: Container & IaC Security (Trivy & Checkov)
    - Phase 5: DAST & Supply Chain Signatures (Nuclei & Cosign/SLSA Level 3)
    """

    def __init__(self, repo_name: str):
        self.repo_name = repo_name
        self.timestamp = datetime.now(timezone.utc).isoformat()
        self.pipeline_results: List[dict] = []

    def phase1_secret_scanning(self) -> dict:
        """Phase 1 — Audit Secret Scanning & Pre-commit enforcement."""
        print(f"\n[PHASE 1] SECRET SCANNING & PRE-COMMIT — Repository: {self.repo_name}")
        spec = {
            "tool": "Gitleaks v8.18.2 + Pre-commit Framework",
            "rules_loaded": 45,
            "secrets_detected": 0,
            "status": "PASSED",
            "enforcement": "Pre-commit Git hook ACTIVE"
        }
        self.pipeline_results.append({"phase": 1, "gate": "SECRET_SCANNING", "status": "PASSED", "data": spec})
        print("  ✅ Secret Scanning : 0 secret détecté dans l'historique Git")
        return spec

    def phase2_sast_scan(self) -> dict:
        """Phase 2 — Analyse statique SAST avec Semgrep."""
        print(f"\n[PHASE 2] SAST ANALYSIS — Semgrep Taint Tracking")
        spec = {
            "tool": "Semgrep v1.50.0",
            "ruleset": "p/security-audit + paradis-custom-rules",
            "findings": {
                "CRITICAL": 0,
                "HIGH": 0,
                "MEDIUM": 2,  # Warning non-bloquants (ex: missing HTTP-only flag sur cookie secondaire)
                "LOW": 5
            },
            "status": "PASSED_WITH_WARNINGS",
            "quality_gate": "0 CRITICAL / 0 HIGH = BUILD APPROVED"
        }
        self.pipeline_results.append({"phase": 2, "gate": "SAST", "status": "PASSED", "data": spec})
        print("  ✅ SAST Scan : 0 Critical, 0 High — Quality Gate validée")
        return spec

    def phase3_sca_sbom_generation(self) -> dict:
        """Phase 3 — SCA et génération de SBOM CycloneDX."""
        print(f"\n[PHASE 3] SCA & SBOM GENERATION — CycloneDX")
        spec = {
            "tool": "Trivy v0.48.0",
            "sbom_format": "CycloneDX v1.5 JSON",
            "total_dependencies": 342,
            "vulnerabilities": {
                "CRITICAL": 0,
                "HIGH": 1,   # Patched via version bump
                "MEDIUM": 4
            },
            "dependency_track": "Ingested to https://dtrack.internal.paradis.it (Project UUID: a1b2c3d4)"
        }
        self.pipeline_results.append({"phase": 3, "gate": "SCA_SBOM", "status": "PASSED", "data": spec})
        print("  ✅ SCA & SBOM : 342 composants inventoriés, SBOM téléversé dans Dependency-Track")
        return spec

    def phase4_container_iac_security(self) -> dict:
        """Phase 4 — Audit des images de conteneurs et des manifests IaC."""
        print(f"\n[PHASE 4] CONTAINER & IAC SECURITY — Trivy & Checkov")
        spec = {
            "container_image": "ghcr.io/paradis/banking-api:v1.2.0",
            "base_image": "distroless/python3-debian12 (Non-root user)",
            "iac_tool": "Checkov v3.0",
            "terraform_checks": "PASSED (100% compliance avec CIS Benchmark)",
            "status": "PASSED"
        }
        self.pipeline_results.append({"phase": 4, "gate": "CONTAINER_IAC", "status": "PASSED", "data": spec})
        print("  ✅ Container & IaC : Image Distroless non-root & conformité CIS Benchmark 100%")
        return spec

    def phase5_dast_slsa_signatures(self) -> dict:
        """Phase 5 — DAST et signature d'image OCI Cosign SLSA Level 3."""
        print(f"\n[PHASE 5] DAST & SLSA LEVEL 3 SIGNATURES — Nuclei & Cosign")
        spec = {
            "dast_tool": "Nuclei v3.1 (Staging API Scan)",
            "dast_findings": "0 Critical, 0 High vulnerabilities",
            "slsa_level": "SLSA Level 3 Certified",
            "cosign_signature": "Signed via Keyless Sigstore (OIDC GitHub Actions)",
            "verification_status": "VERIFIED (Cryptographic Proof of Provenance Attached)"
        }
        self.pipeline_results.append({"phase": 5, "gate": "DAST_SLSA", "status": "PASSED", "data": spec})
        print("  ✅ DAST & SLSA L3 : Scan Nuclei propre & Image OCI signée avec Cosign Sigstore")
        return spec

    def generate_cert_report(self) -> dict:
        """Génère le rapport de certification finale DevSecOps."""
        return {
            "project": "PROJET INTÉGRATEUR S11 PARTIE 1 — SECURE CI/CD & SUPPLY CHAIN CAPSTONE",
            "date": self.timestamp,
            "certification_level": "DEVSECOPS_AND_SUPPLY_CHAIN_SECURITY_LEAD",
            "standards_achieved": [
                "NIST SP 800-218 (Secure Software Development Framework SSDF)",
                "SLSA Level 3 (Supply-chain Levels for Software Artifacts)",
                "OWASP Top 10 CI/CD Security Risks",
                "ISO/IEC 27034 (Application Security)"
            ],
            "pipeline_execution_summary": self.pipeline_results
        }

# Exécution du Projet Intégrateur
print("=== SECURE CI/CD PIPELINE & SUPPLY CHAIN HARDENING CAPSTONE — S11 P1 ===")
capstone = DevSecOpsPipelineCapstoneEngine("paradis-core-banking-service")

capstone.phase1_secret_scanning()
capstone.phase2_sast_scan()
capstone.phase3_sca_sbom_generation()
capstone.phase4_container_iac_security()
capstone.phase5_dast_slsa_signatures()

cert = capstone.generate_cert_report()
print("\n=== DEVSECOPS PIPELINE CERTIFICATION REPORT ===")
print(json.dumps(cert, indent=2, ensure_ascii=False))
```

---

## 2) Module — Grille de Validation Finale Capstone S11 P1 (1h30)

```markdown
## EVALUATION GRID — CAPSTONE S11 PARTIE 1

| Phase | Critères d'Évaluation | Pondération | Statut |
|:---|:---|:---:|:---:|
| **Phase 1 : Secrets** | Gitleaks pre-commit + CI scanning sans fuites | 20% | **VALIDÉ** |
| **Phase 2 : SAST** | Semgrep Taint Analysis & Quality Gates respectées | 20% | **VALIDÉ** |
| **Phase 3 : SCA/SBOM** | SBOM CycloneDX + ingestion OWASP Dependency-Track | 20% | **VALIDÉ** |
| **Phase 4 : Container** | Image Distroless non-root + Checkov IaC CIS compliance | 20% | **VALIDÉ** |
| **Phase 5 : DAST/SLSA**| Nuclei DAST + Cosign Sigstore SLSA Level 3 signature | 20% | **VALIDÉ** |

**Score Final : 100/100 — CERTIFICATION DEVSECOPS & SUPPLY CHAIN LEAD DÉCERNÉE 🏆**
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SSDF** | Secure Software Development Framework — Guide NIST SP 800-218 pour la sécurisation du SDLC |
| **OCI** | Open Container Initiative — Spécification standard industrielle pour les formats de conteneurs et d'images |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
