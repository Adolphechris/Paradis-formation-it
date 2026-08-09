# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 387 (6h) : DevSecOps Pipeline & Software Supply Chain Security (SLSA Level 4, Software Bill of Materials — SBOM, Dependency Track & Sigstore/Cosign)

> [!NOTE]
> **Objectif du jour :** Maîtriser la sécurisation de la **Chaîne d’Approvisionnement Logicielle (Software Supply Chain Security)** et l'intégration **DevSecOps** : appliquer le framework **SLSA (Supply-chain Levels for Software Artifacts)** jusqu'au niveau 4, générer et auditer des **Software Bill of Materials (SBOM)** aux formats SPDX et CycloneDX, surveiller les vulnérabilités de dépendances via **Dependency-Track**, et signer/vérifier les artefacts conteneurisés avec **Sigstore / Cosign**.
>
> **Compétences visées :** `DEVSECOPS-01` (A) — SLSA Framework & Software Supply Chain Hardening | `DEVSECOPS-02` (A) — SBOM Engineering (CycloneDX/SPDX), Dependency-Track & Sigstore/Cosign Image Signing

---

## 1) Module — Framework SLSA & Anatomie des Attaques Supply Chain (2h)

### 📖 Narration/Intuition

Les attaques sur la Supply Chain logicielle (ex: SolarWinds, XZ Utils, Codecov) ciblent la plateforme d’intégration continue (CI/CD) plutôt que l’application finale. L’objectif du framework **SLSA** est de garantir cryptographiquement l’intégrité du code de la source au déploiement.

```
   [ CODE SOURCE (Git) ] ──► [ BUILD ENGINE (GitHub Actions / GitLab CI) ] ──► [ ARTEFACT (Container / Binary) ]
            │                                     │                                      │
            ▼                                     ▼                                      ▼
     Signé par Dev                   Environnement Hermétique                 Provenance Attestation SLSA
   (GPG / Commit Sign)               (Build isolé & éphémère)                 (Signature Cosign / Sigstore)
```

#### Les Niveaux du Framework SLSA (Supply-chain Levels for Software Artifacts)

| Niveau SLSA | Exigence Majeure | Protection Offerte |
|:---:|:---|:---|
| **SLSA 1** | Build automatisé + Génération de provenance | Documentation basique du processus de build |
| **SLSA 2** | Service de build dédié + Provenance signée | Protection contre la falsification post-build |
| **SLSA 3** | Environnement de build isolé & éphémère | Protection contre les compromissions croisées |
| **SLSA 4** | Revue par deux pairs + Build hermétique | Intégrité cryptographique absolue de bout en bout |

---

## 2) Module — Outillage Supply Chain Engine (`supply_chain_security_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import hashlib
from datetime import datetime, timezone
from typing import List, Dict

class SupplyChainSecurityEngine:
    """
    Moteur d'audit SBOM (CycloneDX), de vérification de provenance SLSA
    et de validation de signature d'artefacts via Sigstore/Cosign.
    """

    def __init__(self, artifact_name: str, version: str):
        self.artifact = artifact_name
        self.version = version
        self.sbom_components: List[dict] = []
        self.provenance_attestation: dict = {}
        self.security_findings: List[dict] = []

    def parse_cyclonedx_sbom(self, components: List[dict]) -> dict:
        """Parse et valide un fichier SBOM au format CycloneDX v1.4."""
        for comp in components:
            name = comp.get("name")
            ver = comp.get("version")
            purl = comp.get("purl")
            licenses = comp.get("licenses", [])

            # Simulation de recherche CVE sur les composants
            has_cve = "log4j" in name.lower() or "struts" in name.lower()

            entry = {
                "name": name,
                "version": ver,
                "purl": purl,
                "licenses": licenses,
                "vulnerability_status": "VULNERABLE (CVE DETECTED)" if has_cve else "SECURE"
            }
            self.sbom_components.append(entry)

            if has_cve:
                self.security_findings.append({
                    "component": name,
                    "version": ver,
                    "severity": "CRITICAL",
                    "issue": "Composant vulnérable identifié dans le SBOM (Supply Chain Risk)"
                })
                print(f"  [!] ALERTE SBOM: Composant vulnérable détecté -> {name} v{ver}")

        return {"total_components": len(self.sbom_components), "vulnerable_count": len(self.security_findings)}

    def verify_cosign_signature(self, image_digest: str, public_key_pem: str, signature_base64: str) -> bool:
        """
        Simule la vérification de signature Cosign / Sigstore sur une image de conteneur.
        Garantit que l'image provient d'un pipeline CI/CD approuvé.
        """
        is_valid = len(signature_base64) > 32 and image_digest.startswith("sha256:")
        
        self.provenance_attestation = {
            "image_digest": image_digest,
            "signature_valid": is_valid,
            "signed_by": "cosign-ci-pipeline@paradis-bank.com",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        status_str = "VALIDE ✅" if is_valid else "INVALID ❌"
        print(f"  [*] Vérification Signature Cosign pour {image_digest[:20]}... -> {status_str}")
        return is_valid

    def generate_supply_chain_report(self) -> dict:
        return {
            "artifact": self.artifact,
            "version": self.version,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "slsa_compliance_level": "SLSA LEVEL 3",
            "sbom_summary": {
                "total_components": len(self.sbom_components),
                "findings": self.security_findings
            },
            "provenance": self.provenance_attestation
        }

# Démonstration Supply Chain Engine
engine = SupplyChainSecurityEngine("core-banking-api", "v2.4.1")

print("=== SUPPLY CHAIN SECURITY & SBOM ENGINE ===")

# 1. Parsing d'un SBOM CycloneDX
engine.parse_cyclonedx_sbom([
    {"name": "express", "version": "4.18.2", "purl": "pkg:npm/express@4.18.2", "licenses": ["MIT"]},
    {"name": "log4j-core", "version": "2.14.1", "purl": "pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1", "licenses": ["Apache-2.0"]},
    {"name": "openssl", "version": "3.0.8", "purl": "pkg:generic/openssl@3.0.8", "licenses": ["Apache-2.0"]}
])

# 2. Vérification de la Signature Cosign
engine.verify_cosign_signature(
    image_digest="sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    public_key_pem="-----BEGIN PUBLIC KEY-----...",
    signature_base64="MEUCIQD3a8f912b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1"
)

print("\n=== SUPPLY CHAIN SECURITY REPORT ===")
print(json.dumps(engine.generate_supply_chain_report(), indent=2, ensure_ascii=False))
```

---

## 3) Module — Fiche Technique Cosign / Sigstore (2h)

```bash
# CHEATSHEET COSIGN / SIGSTORE POUR LA SÉCURISATION CI/CD

# 1. Générer une paire de clés de signature Cosign
cosign generate-key-pair

# 2. Signer une image de conteneur après le build CI/CD
cosign sign --key cosign.key paradis-registry.internal/api/core-banking:v2.4.1

# 3. Vérifier la signature de l'image avant déploiement sur Kubernetes
cosign verify --key cosign.pub paradis-registry.internal/api/core-banking:v2.4.1

# 4. Attacher le fichier SBOM (CycloneDX) à l'image OCI dans le registre
cosign attach sbom --sbom sbom.cyclonedx.json paradis-registry.internal/api/core-banking:v2.4.1
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SLSA** | Supply-chain Levels for Software Artifacts — Framework de sécurité de la chaîne d'approvisionnement logicielle |
| **SBOM** | Software Bill of Materials — Inventaire détaillé des composants et dépendances d'un logiciel |
| **Cosign / Sigstore** | Outil open-source de signature et de vérification d'artefacts OCI et de conteneurs |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Qu'est-ce qu'un **SBOM (Software Bill of Materials)** et pourquoi est-il indispensable pour la sécurité Supply Chain ?
- A) Un inventaire structuré et lisible par machine de l'ensemble des composants, bibliothèques tiers et dépendances d'un logiciel, permettant d'identifier immédiatement les vulnérabilités affectant la chaîne d'approvisionnement
- B) Un fichier de facturation pour les licences logicielles
- C) Le manuel d'utilisation de l'application
- D) La clé de licence Windows

**Réponse : A**

**Q2 :** Quels sont les deux formats standardisés majeurs de SBOM reconnus internationalement ?
- A) CycloneDX et SPDX
- B) JSON et XML génériques
- C) HTML5 et CSS3
- D) PDF et DOCX

**Réponse : A**

**Q3 :** Quel est l'objectif du niveau **SLSA 4** dans le framework de sécurisation des builds ?
- A) Garantir que le code source a fait l'objet d'une revue par deux pairs distincts et que le build est exécuté dans un environnement hermétique, isolé et éphémère sans accès réseau non autorisé
- B) Permettre le déploiement sans tests
- C) Rendre le code source public
- D) Supprimer les pipelines CI/CD

**Réponse : A**

**Q4 :** À quoi sert l'outil **Cosign** (du projet Sigstore) dans un pipeline DevSecOps ?
- A) À signer cryptographiquement les images de conteneurs OCI après le build et à vérifier leur signature avant leur exécution sur le cluster Kubernetes
- B) À scanner les ports réseau
- C) À compresser les fichiers ZIP
- D) À gérer la base de données SQL

**Réponse : A**

**Q5 :** Quel outil open-source spécialisé permet de centraliser et de surveiller en continu les SBOMs d'une organisation pour alerter dès qu'une nouvelle CVE (ex: Log4Shell) affecte un composant utilisé ?
- A) **OWASP Dependency-Track**
- B) Notepad++
- C) Wireshark
- D) Putty

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
