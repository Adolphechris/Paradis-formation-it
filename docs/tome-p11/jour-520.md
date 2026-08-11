# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 520 (6h) : Projet Intégrateur S12 Partie 2 — Governance, Risk, Compliance (GRC) & SOC Operations Capstone

> [!NOTE]
> **Objectifs pédagogiques :**
> - Synthétiser et intégrer l'ensemble des compétences de la seconde moitié du Semestre 12 (J511 à J519)
> - Construire la **Plateforme Unifiée de Gouvernance GRC & Opérations SOC** d'une entreprise internationale
> - Articuler ISO 27001, EBIOS RM, RGPD, DORA, SOAR Automation et Plans de Résilience (PCA/PRA)
> - Valider l'aptitude d'une organisation à faire face à une cyberattaque majeure tout en maintenant sa conformité réglementaire
>
> **Compétences visées :** `POL-01` (A), `POL-02` (A), `SEC-06` (A) — GRC & SOC Enterprise Capstone

---

## Module 1 — Synthèse Architecturale GRC & SOC (2h)

### 📖 Vision Globale du Projet Intégrateur Partie 2

Le Jour 520 marque l'aboutissement de la seconde moitié du Semestre 12. Vous avez étudié la gouvernance (ISO 27001), l'analyse de risque (EBIOS RM/FAIR), la conformité réglementaire (RGPD, NIS2, DORA, PCI-DSS), le fonctionnement d'un SOC/SOAR, la Threat Intelligence et la résilience opérationnelle (PCA/PRA).

Ce projet intégrateur assemble ces piliers dans un **Système d'Information de Sécurité et Gouvernance d'Entreprise**.

```
ARCHITECTURE GLOBALE GRC & OPÉRATIONS SOC (J520 CAPSTONE)

  ┌────────────────────────────────────────────────────────────────────────┐
  │ GOUVERNANCE & RISQUES (ISO 27001 / EBIOS RM / FAIR)                   │
  │ • SMSI & Statement of Applicability (SoA)                              │
  │ • Cartographie des Risques & Calcul ALE Monte Carlo                    │
  └──────────────────────────────────┬─────────────────────────────────────┘
                                     │ (Politiques & Seuils de Tolérance)
  ┌──────────────────────────────────▼─────────────────────────────────────┐
  │ CONFORMITÉ RÉGLEMENTAIRE (RGPD / NIS2 / DORA / PCI-DSS v4.0)           │
  │ • Matrice de Mapping Réglémentaire Multi-Normes                        │
  │ • Automated Evidence Collection (SOC 2 Type II)                        │
  └──────────────────────────────────┬─────────────────────────────────────┘
                                     │ (Contrôles Validés)
  ┌──────────────────────────────────▼─────────────────────────────────────┐
  │ OPÉRATIONS SOC & THREAT INTEL (MISP / SOAR / MITRE D3FEND)             │
  │ • Traitement automatique des alertes SIEM/EDR via SOAR Playbooks      │
  │ • Chasse aux menaces (Threat Hunting YARA/Sigma)                       │
  └──────────────────────────────────┬─────────────────────────────────────┘
                                     │ (En cas d'incident majeur)
  ┌──────────────────────────────────▼─────────────────────────────────────┐
  │ RESILIENCE & GESTION DE CRISE (PCA/PRA & DORA Reporting)               │
  │ • Notification Réglementaire Automatisée à la CNIL / ACPR sous 4h/72h  │
  │ • Orchestration du basculement PRA (RTO < 30m / RPO < 15m)            │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Atelier Pratique : Platform Orchestrator GRC-SOC Unifié (2h)

### 🛠️ Code Python : Enterprise GRC & SOC Integrated Management Engine

```python
#!/usr/bin/env python3
"""
PARADIS — PROJET INTÉGRATEUR J520 : Enterprise GRC & SOC Integrated Engine
Orchestre l'évaluation de la gouvernance, le monitoring du SOC et le déclenchement des procédures d'incident.
"""

import json
import sys
from datetime import datetime

class EnterpriseGRCSOCEngine:
    def __init__(self, enterprise_name: str):
        self.enterprise_name = enterprise_name
        self.iso_status = {}
        self.dora_status = {}
        self.soc_metrics = {}

    def audit_iso27001_compliance((self) -> bool:
        print("[1/4] Audit du SMSI ISO 27001:2022...")
        self.iso_status = {
            "soa_controls_implemented": 88,
            "soa_controls_total": 93,
            "compliance_rate_pct": 94.6,
            "status": "COMPLIANT"
        }
        return True

    def audit_regulatory_dora(self) -> bool:
        print("[2/4] Audit de conformité au Règlement DORA...")
        self.dora_status = {
            "pilar_1_risk_framework": "VALIDATED",
            "pilar_2_incident_reporting": "READY_4H_ALERT",
            "pilar_3_tlpt_testing": "COMPLETED_TIBER_EU",
            "pilar_4_third_party_register": "100_PERCENT_MAPPED",
            "status": "COMPLIANT"
        }
        return True

    def check_soc_operational_health(self) -> bool:
        print("[3/4] Évaluation des métriques opérationnelles du SOC...")
        self.soc_metrics = {
            "mttd_minutes": 12.5,  # Mean Time To Detect (Cible < 15m)
            "mttr_minutes": 22.0,  # Mean Time To Respond (Cible < 30m)
            "soar_automation_rate_pct": 94.2,
            "status": "HEALTHY"
        }
        return True

    def simulate_major_cyber_crisis(self) -> dict:
        print("[4/4] Simulation d'une crise cyber majeure (Ransomware DORA Scénario)...")
        crisis_report = {
            "timestamp": datetime.now().isoformat(),
            "incident_type": "RANSOMWARE_ATTACK_ATTEMPT",
            "soar_playbook_triggered": "PLAYBOOK-CONTAINMENT-09",
            "threat_contained_in_seconds": 4.2,
            "regulatory_notifications_generated": [
                {"authority": "CNIL (RGPD)", "deadline": "72h", "status": "DRAFTED"},
                {"authority": "ACPR / EBA (DORA)", "deadline": "4h", "status": "READY_FOR_SUBMISSION"}
            ],
            "drp_failover_status": "NOT_REQUIRED_CONTAINED_AT_EDGE"
        }
        return crisis_report

    def generate_executive_dashboard(self) -> dict:
        return {
            "enterprise": self.enterprise_name,
            "generated_at": datetime.now().isoformat(),
            "iso27001": self.iso_status,
            "dora": self.dora_status,
            "soc": self.soc_metrics,
            "executive_summary": "L'organisation présente une posture de sécurité et de conformité excellente. Le SOC et les automates SOAR sont opérationnels."
        }

def run_j520_capstone():
    print("=== PROJET INTÉGRATEUR J520 — ENTERPRISE GRC & SOC ENGINE ===")
    engine = EnterpriseGRCSOCEngine("PARADIS FINANCE INTERNATIONAL")

    engine.audit_iso27001_compliance()
    engine.audit_regulatory_dora()
    engine.check_soc_operational_health()
    crisis_res = engine.simulate_major_cyber_crisis()

    dashboard = engine.generate_executive_dashboard()

    print("\n" + "═"*75)
    print("  TABLEAU DE BORD EXÉCUTIF GRC & SOC (CISO BOARD REPORT)")
    print("═"*75)
    print(json.dumps(dashboard, indent=2))
    print("═"*75)

    print("\n--- RAPPORT DE SIMULATION DE CRISE ---")
    print(json.dumps(crisis_res, indent=2))

    print("\n[✅ CAPSTONE COMPLETED] Le Semestre 12 est officiellement validé avec succès.")

if __name__ == "__main__":
    run_j520_capstone()
```

---

## Module 3 — Bilan du Semestre 12 & Carte des Compétences GRC (1h30)

### 🔍 Récapitulatif du Semestre 12 (J501 à J520)

| Jour | Thématique Principale | Domaine |
|:---:|:---|:---:|
| J501 | DevSecOps Fondamentaux & Security Gates | Sécurité CI/CD |
| J502 | Analyse Statique SAST & Règles Semgrep | Analyse Code |
| J503 | Analyse Dynamique DAST & Scanning Nuclei | Security Testing |
| J504 | Supply Chain Security & SBOM CycloneDX | Chaîne Logistique |
| J505 | Container Hardening & Runtime Isolation | Sécurité Conteneurs |
| J506 | Sécurité Kubernetes RBAC & Kyverno | Cloud-Native |
| J507 | Infrastructure-as-Code & Vault GitOps | Sécurité IaC |
| J508 | Sécurité Cloud AWS/GCP & CSPM | Architecture Cloud |
| J509 | Architecture Zero-Trust & SPIFFE mTLS | Zero-Trust |
| **J510** | **Projet Intégrateur Partie 1 — DevSecOps** | **Synthèse CI/CD** |
| J511 | Gouvernance ISO 27001:2022 & SMSI | Gouvernance |
| J512 | Gestion des Risques EBIOS RM & FAIR | Analyse Risques |
| J513 | Réglementations RGPD, NIS2, DORA, PCI-DSS | Conformité |
| J514 | Audits PCI-DSS v4.0 & SOC 2 Type II | Audits Financiers |
| J515 | Règlement DORA & Résilience TIC | Résilience UE |
| J516 | SOC Operations & SOAR Automation | Opérations Cyber |
| J517 | Cyber Threat Intelligence & YARA/Sigma | Threat Hunting |
| J518 | Vulnerability Management & EPSS Scoring | Priorisation Failles |
| J519 | Plans PCA/PRA & Métriques RTO/RPO | Continuité |
| **J520** | **Projet Intégrateur Partie 2 — GRC & SOC** | **Synthèse Globale** |

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **GRC** | Governance, Risk, and Compliance — Gouvernance, Gestion des Risques et Conformité |
| **CISO** | Chief Information Security Officer — Directeur de la Sécurité des Systèmes d'Information (RSSI) |

---

## Exercices Pratiques

### Exercice 1 — Synthèse de Rapport Board CISO

Un CISO doit présenter en 3 puces synthétiques l'état de la sécurité devant le Conseil d'Administration. Rédigez ces 3 puces basées sur les résultats du projet intégrateur.

**Corrigé guidé :**
1. **Conformité & Certification** : Le SMSI est conforme à 94.6% au standard ISO 27001:2022 et le cadre de résilience DORA est opérationnel pour l'échéance de janvier 2025.
2. **Performance Opérationnelle SOC** : Le temps moyen de détection (MTTD = 12.5 min) et de réponse (MTTR = 22 min) respecte les objectifs grâce à un taux d'automatisation SOAR de 94.2%.
3. **Résilience & Gestion de Crise** : Les procédures d'alerte réglementaire (CNIL 72h / DORA 4h) et de confinement automatisé des ransomwares ont été validées par simulation.

---

## Banque QCM — 5 Questions

**Q1.** Que désigne le sigle **GRC** dans le domaine de la sécurité des SI ?

- A) General Response Center.
- B) Governance, Risk, and Compliance (Gouvernance, Risques et Conformité). ✅
- C) Group Realization Concept.
- D) Global Router Control.

**Q2.** Dans le Projet Intégrateur J520, quel composant permet de réagir en moins de 5 secondes à une tentative d'attaque par ransomware ?

- A) L'imprimante du bureau.
- B) L'automate SOAR et ses Playbooks de confinement réseau et de révocation d'accès. ✅
- C) Une réunion d'équipe.
- D) Un appel téléphonique.

**Q3.** Quel est l'objectif du tableau de bord exécutif (**CISO Board Report**) ?

- A) Afficher du code Python complexe.
- B) Présenter à la direction générale une vue claire, synthétique et orientée risque de la posture de sécurité, de la conformité et des performances du SOC. ✅
- C) Vendre des ordinateurs.
- D) Changer les mots de passe.

**Q4.** Si une attaque par ransomware est stoppée et confinée immédiatement au niveau du poste de travail sans impacter les bases de données financières ni interrompre les services, le déclenchement du PRA (Plan de Reprise d'Activité) est-il nécessaire ?

- A) Oui, il faut toujours déclencher le PRA.
- B) Non, l'incident ayant été maîtrisé à l'origine (at edge), le basculement PRA n'est pas requis. ✅
- C) Le PRA doit être jeté.
- D) Le serveur doit être détruit.

**Q5.** À l'issue des Semestres 11 et 12 (J451 à J520), l'ingénieur PARADIS IT est capable de :

- A) Seulement installer des antivirus.
- B) Concevoir, sécuriser, auditer et gouverner des architectures Cloud-Native, des pipelines DevSecOps et des centres d'opérations SOC conformes aux normes internationales les plus exigeantes. ✅
- C) Regarder la télévision.
- D) Démonter des écrans.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
