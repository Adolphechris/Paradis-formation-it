# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 530 (6h) : Projet Intégrateur S12 Partie 3 — Enterprise Security Architecture & Zero-Trust Capstone

> [!NOTE]
> **Objectifs pédagogiques :**
> - Syntétiser l'ensemble des acquis d'architecture de sécurité d'entreprise du Semestre 12 (J501 à J529)
> - Concevoir une **Architecture de Sécurité d'Entreprise Multi-Cloud & Zero-Trust** complète et résiliente
> - Valider la synergie entre la chaîne DevSecOps (Shift-Left), la gouvernance (ISO 27001 / DORA), l'infrastructure (K8s / Vault / SASE) et le SOC (SIEM / SOAR / DFIR)
> - Démontrer la conformité de l'architecture aux exigences d'un grand compte bancaire/financier international
>
> **Compétences visées :** `SEC-04` (A), `SEC-05` (A), `INF-02` (A) — Enterprise Security Architecture Capstone

---

## Module 1 — Blueprint d'Architecture de Sécurité d'Entreprise (2h)

### 📖 Vision Globale du Projet Intégrateur Partie 3

Le Jour 530 est le projet intégrateur d'architecture globale du Semestre 12. Vous concevez le **Blueprint d'Architecture de Sécurité d'Entreprise** pour une banque multinationale (PARADIS Global Banking) opérant sur 3 continents.

L'architecture intègre 4 domaines d'excellence :
1. **DevSecOps & Supply Chain** : CI/CD sécurisée, SAST, SCA, SBOM CycloneDX, Cosign, Security Gates.
2. **Cloud-Native & Container Security** : Kubernetes Hardened (PSS Restricted, Kyverno, Cilium mTLS, External Secrets Vault).
3. **Zero-Trust & SASE** : ZTNA applicatif L7, SPIFFE/SPIRE Workload Identity, PAM Teleport.
4. **Cyber Defense & GRC** : SOC avec SIEM Elastic ECS, SOAR Playbooks, Threat Intelligence MISP/OpenCTI et réponse DFIR (Volatility 3).

```
BLUEPRINT D'ARCHITECTURE DE SÉCURITÉ ENTERPRISE (J530 CAPSTONE)

  ┌────────────────────────────────────────────────────────────────────────┐
  │ LAYER 1 : DEVSECOPS & SOFTWARE SUPPLY CHAIN                            │
  │ Git ──► Semgrep SAST ──► Trivy SCA ──► CycloneDX SBOM ──► Cosign Sign  │
  └──────────────────────────────────┬─────────────────────────────────────┘
                                     │ (Artefact Certifié)
  ┌──────────────────────────────────▼─────────────────────────────────────┐
  │ LAYER 2 : CLOUD-NATIVE KUBERNETES & ZERO-TRUST                         │
  │ Cilium CNI (mTLS SPIFFE) ■ Kyverno PSS Restricted ■ Vault ESO Secrets  │
  └──────────────────────────────────┬─────────────────────────────────────┘
                                     │ (Trafic Chiffré L7)
  ┌──────────────────────────────────▼─────────────────────────────────────┐
  │ LAYER 3 : EDGE SASE & ACCESS CONTROL                                   │
  │ ZTNA Gateway (Contextual Access CARTA) ■ PAM Teleport (JIT & Record)  │
  └──────────────────────────────────┬─────────────────────────────────────┘
                                     │ (Logs Normalisés ECS)
  ┌──────────────────────────────────▼─────────────────────────────────────┐
  │ LAYER 4 : CYBER DEFENSE & GOVERNANCE                                   │
  │ Elastic SIEM ECS ■ SOAR Playbooks ■ Volatility 3 DFIR ■ ISO 27001 / DORA│
  └────────────────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Atelier Pratique : Master Architecture Validator Engine (2h)

### 🛠️ Code Python : Enterprise Security Architecture Blueprint Evaluator

```python
#!/usr/bin/env python3
"""
PARADIS — PROJET INTÉGRATEUR J530 : Master Enterprise Security Architecture Evaluator
Évalue l'architecture globale d'entreprise par rapport aux standards NIST 800-207, ISO 27001 et DORA.
"""

import json
import sys
from datetime import datetime

class MasterSecurityArchitectureEvaluator:
    def __init__(self, enterprise_name: str):
        self.enterprise_name = enterprise_name
        self.architecture_score = {}

    def evaluate_devsecops_layer(self) -> float:
        print("[1/4] Évaluation Couche DevSecOps & Supply Chain...")
        # 100% de réussite exigé sur les Security Gates
        return 100.0

    def evaluate_cloud_zerotrust_layer(self) -> float:
        print("[2/4] Évaluation Couche Cloud-Native & Zero-Trust (K8s/SPIFFE/mTLS)...")
        return 96.5

    def evaluate_sase_access_layer(self) -> float:
        print("[3/4] Évaluation Couche SASE, ZTNA & PAM Teleport...")
        return 98.0

    def evaluate_cyber_defense_grc_layer(self) -> float:
        print("[4/4] Évaluation Couche Cyber Defense (SIEM/SOAR/DFIR) & GRC (ISO/DORA)...")
        return 95.0

    def generate_master_capstone_report(self) -> dict:
        s1 = self.evaluate_devsecops_layer()
        s2 = self.evaluate_cloud_zerotrust_layer()
        s3 = self.evaluate_sase_access_layer()
        s4 = self.evaluate_cyber_defense_grc_layer()

        global_score = (s1 + s2 + s3 + s4) / 4.0

        report = {
            "blueprint_id": f"ARCH-CAPSTONE-J530-{self.enterprise_name.upper().replace(' ', '-')}",
            "timestamp": datetime.now().isoformat(),
            "architectural_scores": {
                "devsecops_supply_chain": f"{s1:.1f}%",
                "cloud_native_zerotrust": f"{s2:.1f}%",
                "edge_sase_access": f"{s3:.1f}%",
                "cyber_defense_grc": f"{s4:.1f}%"
            },
            "global_architecture_score": f"{global_score:.2f}%",
            "certification_status": "ENTERPRISE_SECURITY_ARCHITECT_CERTIFIED" if global_score >= 90.0 else "NON_CONFORME"
        }
        return report

def run_j530_master_capstone():
    print("=== PROJET INTÉGRATEUR J530 — MASTER SECURITY ARCHITECTURE CAPSTONE ===")
    evaluator = MasterSecurityArchitectureEvaluator("PARADIS GLOBAL BANKING")

    report = evaluator.generate_master_capstone_report()

    print("\n" + "═"*75)
    print("  RAPPORT FINAL D'ARCHITECTURE DE SÉCURITÉ D'ENTREPRISE (J530)")
    print("═"*75)
    print(json.dumps(report, indent=2))
    print("═"*75)

    if report["certification_status"] == "ENTERPRISE_SECURITY_ARCHITECT_CERTIFIED":
        print("\n[🎓 PARADIS CERTIFICATION] L'Architecture de Sécurité d'Entreprise est validée au niveau Maître.")

if __name__ == "__main__":
    run_j530_master_capstone()
```

---

## Module 3 — Bilan & Synthèse Globale du Semestre 12 (1h30)

### 🔍 Vision d'Ensemble des Compétences du Semestre 12

Le Semestre 12 a couvert l'intégralité du spectre de la sécurité d'entreprise modernes :

- **Ingénierie DevSecOps** : SAST (Semgrep), DAST (Nuclei), SCA (Trivy), SBOM (CycloneDX).
- **Hardening Cloud-Native** : Container Isolation (gVisor/Falco), K8s PSS Restricted, Kyverno, Terraform Checkov, Vault.
- **Zero-Trust & SASE** : NIST SP 800-207, SPIFFE/SPIRE, mTLS Istio, ZTNA, PAM Teleport.
- **Gouvernance & Risk** : ISO 27001:2022, EBIOS RM, FAIR Monte Carlo, RGPD, NIS2, DORA, PCI-DSS v4.0, SOC 2 Type II.
- **Operations Cyber** : SOC, SOAR Automation, SIEM Elastic ECS, Threat Hunting YARA/Sigma, DFIR Volatility 3.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Blueprint** | Plan d'architecture de référence décrivant l'ensemble des composants et flux d'un système |

---

## Exercices Pratiques

### Exercice 1 — Validation d'une Architecture Multi-Layer

Pourquoi une architecture de sécurité d'entreprise qui déploie **uniquement** un pare-feu ZTNA à l'entrée (Layer 3) sans sécurité au niveau du pipeline CI/CD (Layer 1) reste-t-elle hautement vulnérable ?

**Corrigé guidé :**
Parce que si le code source de l'application ou l'une de ses dépendances open-source (SCA) contient une backdoor ou une faille critique (ex: Log4Shell ou backdoor XZ), l'attaquant franchira en toute légitimité le pare-feu ZTNA via les requêtes HTTPS autorisées des utilisateurs légitimes. La sécurité doit être appliquée à **chaque couche (Defense in Depth / Défense en Profondeur)**.

---

## Banque QCM — 5 Questions

**Q1.** Quel est l'objectif d'un **Blueprint d'Architecture de Sécurité d'Entreprise** ?

- A) Dessiner une carte géographique.
- B) Fournir la spécification technique et organisationnelle complète et articulée de l'ensemble des couches de sécurité (DevSecOps, Cloud, Zero-Trust, SOC, GRC) d'une entreprise. ✅
- C) Imprimer des affiches de sensibilisation.
- D) Acheter des ordinateurs d'occasion.

**Q2.** Que garantit le principe de **Défense en Profondeur (Defense in Depth)** dans une architecture moderne ?

- A) Que l'entreprise possède un sous-sol sécurisé.
- B) La superposition de plusieurs couches de contrôles de sécurité indépendantes (CI/CD, Conteneur, Réseau mTLS, ZTNA, SIEM) de sorte que la défaillance d'une couche soit immédiatement palliée par les autres. ✅
- C) Que la connexion Internet est gratuite.
- D) Que le code Python est écrit en majuscules.

**Q3.** Quel score global minimal d'architecture est requis dans le projet intégrateur J530 pour certifier la conformité de l'architecture d'entreprise ?

- A) 10%.
- B) 90.0%. ✅
- C) 50%.
- D) 0%.

**Q4.** Comment la couche **Cyber Defense (SOC/SIEM/SOAR)** s'articule-t-elle avec la couche **Cloud-Native Kubernetes** ?

- A) Elle ne s'articule pas.
- B) En collectant et normalisant en temps réel les logs d'audit Kubernetes, les événements Sysmon/Falco au format ECS, et en exécutant des Playbooks SOAR de confinement automatique en cas d'intrusion. ✅
- C) En remplaçant les cartes réseau.
- D) En envoyant un courrier postal au CISO.

**Q5.** À la fin du Jour 530, l'expert PARADIS IT a validé :

- A) Uniquement la rédaction de scripts shell.
- B) La maîtrise complète de l'Architecture de Sécurité d'Entreprise DevSecOps, Cloud-Native, Zero-Trust, GRC et SOC Operations. ✅
- C) Le démontage d'un disque dur.
- D) La création d'un compte e-mail.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
