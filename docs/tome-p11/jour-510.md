# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 510 (6h) : Projet Intégrateur S12 Partie 1 — Enterprise DevSecOps & Cloud-Native Security Architecture

> [!NOTE]
> **Objectifs pédagogiques :**
> - Syntétiser et intégrer l'ensemble des compétences de la première moitié du Semestre 12 (J501 à J509)
> - Concevoir et implémenter une **Chaîne de Livraison DevSecOps Enterprise Sécurisée de Bout en Bout**
> - Orchestrer les contrôles SAST, DAST, SCA, SBOM, Security Gates, Container Hardening et Zero-Trust
> - Démontrer la conformité et l'auditabilité globale du pipeline d'intégration et de déploiement continu
>
> **Compétences visées :** `SEC-04` (A), `SEC-05` (A), `INF-02` (A) — Enterprise DevSecOps Capstone

---

## Module 1 — Architecture de la Plateforme DevSecOps Unifiée (2h)

### 📖 Vision Globale du Projet Intégrateur

La première moitié du Semestre 12 vous a permis de maîtriser chaque maillon de la chaîne de sécurité applicative et cloud. Le Jour 510 réunit ces éléments dans une architecture industrielle unifiée :

```
ARCHITECTURE DEVSECOPS ENTERPRISE UNIFIÉE (J510 CAPSTONE)

  ┌────────────────────────────────────────────────────────────────────────┐
  │ 1. CODE & PRE-COMMIT                                                   │
  │    Developer IDE ──► Gitleaks (Secrets) ──► Semgrep (SAST Local)       │
  └──────────────────────────────────┬─────────────────────────────────────┘
                                     │ (Git Push)
  ┌──────────────────────────────────▼─────────────────────────────────────┐
  │ 2. CI/CD BUILD PIPELINE                                                │
  │    SAST (SonarQube) ■ SCA & SBOM (CycloneDX) ■ Checkov (IaC Scan)      │
  │    ──► SECURITY GATE EVALUATOR (Build Break si Critical > 0)           │
  └──────────────────────────────────┬─────────────────────────────────────┘
                                     │ (Si conforme)
  ┌──────────────────────────────────▼─────────────────────────────────────┐
  │ 3. PACKAGING & SIGNATURE                                               │
  │    Multi-stage Hardened Dockerfile (Non-root) ──► Cosign Image Sign    │
  └──────────────────────────────────┬─────────────────────────────────────┘
                                     │ (Deploy Staging)
  ┌──────────────────────────────────▼─────────────────────────────────────┐
  │ 4. DYNAMICS & RUNTIME                                                  │
  │    DAST Scan (Nuclei) ──► Kyverno Admission Policy ──► mTLS SPIFFE    │
  │    Sysdig Falco Runtime Security Monitoring                            │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Atelier Pratique : Orchestrateur DevSecOps Unifié (2h)

### 🛠️ Script Python : DevSecOps End-to-End Compliance Master Orchestrator

```python
#!/usr/bin/env python3
"""
PARADIS — PROJET INTÉGRATEUR J510 : DevSecOps End-to-End Compliance Orchestrator
Orchestre l'ensemble des Security Gates (SAST, SCA, SBOM, IaC, Container, DAST) et produit le passeport de mise en prod.
"""

import json
import sys
from datetime import datetime

class DevSecOpsMasterOrchestrator:
    def __init__(self, application_name: str, build_id: str):
        self.app_name = application_name
        self.build_id = build_id
        self.gate_results = {}

    def run_sast_gate(self) -> bool:
        print("[1/6] Exécution de la Security Gate SAST (Semgrep / SonarQube)...")
        # Simulé : 0 Critical, 0 High
        self.gate_results["SAST"] = {"status": "PASSED", "critical_count": 0}
        return True

    def run_sca_sbom_gate(self) -> bool:
        print("[2/6] Exécution de la Security Gate SCA & SBOM (CycloneDX / Trivy)...")
        self.gate_results["SCA_SBOM"] = {"status": "PASSED", "vulnerabilities": 0}
        return True

    def run_iac_gate(self) -> bool:
        print("[3/6] Exécution de la Security Gate IaC (Checkov / Terraform)...")
        self.gate_results["IaC"] = {"status": "PASSED", "misconfigurations": 0}
        return True

    def run_container_hardening_gate(self) -> bool:
        print("[4/6] Exécution de la Security Gate Conteneur (Non-root / Read-only)...")
        self.gate_results["Container"] = {"status": "PASSED", "non_root": True}
        return True

    def run_dast_gate(self) -> bool:
        print("[5/6] Exécution de la Security Gate DAST (Nuclei / OWASP ZAP)...")
        self.gate_results["DAST"] = {"status": "PASSED", "critical_high": 0}
        return True

    def run_zerotrust_gate(self) -> bool:
        print("[6/6] Exécution de la Security Gate Zero-Trust (Kyverno / SPIFFE mTLS)...")
        self.gate_results["ZeroTrust"] = {"status": "PASSED", "policy_enforced": True}
        return True

    def generate_compliance_passport((self) -> dict:
        all_passed = all(r["status"] == "PASSED" for r in self.gate_results.values())
        passport = {
            "passport_id": f"PASSPORT-{self.app_name}-{self.build_id}",
            "application": self.app_name,
            "build_id": self.build_id,
            "timestamp": datetime.now().isoformat(),
            "overall_status": "APPROVED" if all_passed else "REJECTED",
            "gates_evaluated": self.gate_results
        }
        return passport

def run_capstone_demo():
    print("=== PROJET INTÉGRATEUR J510 — DEVSECOPS MASTER ORCHESTRATOR ===")
    orchestrator = DevSecOpsMasterOrchestrator("paradis-payment-gateway", "build-8942")

    orchestrator.run_sast_gate()
    orchestrator.run_sca_sbom_gate()
    orchestrator.run_iac_gate()
    orchestrator.run_container_hardening_gate()
    orchestrator.run_dast_gate()
    orchestrator.run_zerotrust_gate()

    passport = orchestrator.generate_compliance_passport()

    print("\n" + "═"*70)
    print("  PASSEPORT DE CONFORMITÉ DEVSECOPS PRODUIT (AUDIT TRAIL)")
    print("═"*70)
    print(json.dumps(passport, indent=2))
    print("═"*70)

    if passport["overall_status"] == "APPROVED":
        print("\n[✅ GO-LIVE APPROVED] L'artefact est certifié conforme et autorisé pour la production.")
    else:
        print("\n[⛔ GO-LIVE REJECTED] Déploiement interdit.")
        sys.exit(1)

if __name__ == "__main__":
    run_capstone_demo()
```

---

## Module 3 — Bilans & Matrice de Maturité DevSecOps (1h30)

### 🔍 Matrice de Maturité DevSecOps (Niveaux 1 à 4)

```
MATRICE DE MATURITÉ DEVSECOPS ENTERPRISE

  ┌────────────────────────────────────────────────────────────────────────┐
  │ NIVEAU       │ CARACTÉRISTIQUES CLÉS                                   │
  ├──────────────┼─────────────────────────────────────────────────────────┤
  │ Niveau 1     │ Scans manuels occasionnels, sécurité en fin de projet. │
  │ Niveau 2     │ SAST et SCA intégrés en CI/CD, alertes non bloquantes.  │
  │ Niveau 3     │ Security Gates automatisées et bloquantes, SBOM généré. │
  │ Niveau 4     │ Zero-Trust mTLS, DAST Nightly, Runtime Falco & SLSA 3.  │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Capstone** | Projet synthétique de fin de module/semestre validant les compétences |
| **Go-Live** | Mise en production effective d'un système logiciel |

---

## Exercices Pratiques

### Exercice 1 — Audit d'un Passeport de Conformité

Si l'une des 6 Security Gates renvoie l'état `FAILED` (ex: DAST a trouvé une faille High), quel doit être le statut `overall_status` du Passeport de Conformité ?

**Corrigé guidé :**
Le statut global doit impérativement basculer à `REJECTED`. Aucune exception globale automatique n'est tolérée ; le déploiement en production doit être bloqué immédiatement.

---

## Banque QCM — 5 Questions

**Q1.** Quel est le rôle du **Passeport de Conformité DevSecOps** généré à la fin du pipeline ?

- A) Servir de pièce d'identité aux employés.
- B) Fournir une preuve immuable et auditable que l'artefact a passé avec succès l'ensemble des Security Gates (SAST, SCA, IaC, DAST, Conteneur, Zero-Trust) avant sa mise en production. ✅
- C) Imprimer des tickets de caisse.
- D) Accélérer le processeur.

**Q2.** Quel niveau de la Matrice de Maturité DevSecOps correspond à une entreprise appliquant des Security Gates bloquantes, la génération de SBOM et le Zero-Trust ?

- A) Niveau 1.
- B) Niveau 4 (Maturité avancée). ✅
- C) Niveau 0.
- D) Niveau -1.

**Q3.** Pourquoi associe-t-on la signature d'image (ex: avec Cosign) après le build du conteneur ?

- A) Pour changer la couleur de l'image.
- B) Pour garantir l'authenticité et l'intégrité de l'image Docker afin que le cluster Kubernetes refuse tout conteneur n'ayant pas été signé par le pipeline officiel CI/CD. ✅
- C) Pour réduire la taille du fichier ZIP.
- D) Pour effacer les logs.

**Q4.** Que se passe-t-il si une vulnérabilité de sévérité **CRITICAL** est détectée lors de l'étape SCA dans un pipeline DevSecOps mature ?

- A) Le pipeline s'arrête immédiatement (Build Break) et le déploiement est rejeté. ✅
- B) Le code est déployé quand même.
- C) Le serveur s'éteint.
- D) Un e-mail d'encouragement est envoyé.

**Q5.** Dans un pipeline DevSecOps complet, à quel moment s'exécute le scanner de secrets **Gitleaks** ?

- A) Après 3 ans de production.
- B) Dès la phase de Pre-commit / Commit local chez le développeur et au début du pipeline CI. ✅
- C) Pendant l'impression du document.
- D) Uniquement le dimanche.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
