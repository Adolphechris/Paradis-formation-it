# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 550 (6h) : Projet Intégrateur Semestre 12 — Partie 5 : Security Mastery & Advanced Threat Capstone Final

> [!NOTE]
> **Objectifs pédagogiques :**
> - Réaliser la **synthèse ultime des 50 jours du Semestre 12** (DevSecOps, Cloud Security, Active Directory Security, Threat Intel, Compliance & IR)
> - Simuler un **exercice de Red Team vs Blue Team (Purple Teaming)** sur l'infrastructure hybride d'entreprise PARADIS Global
> - Conduire un **audit de conformité global** (ISO 27001, PCI DSS, DORA) et mesurer le score de maturité sécuritaire
> - Rédiger le **Rapport de Synthèse Exécutive pour le COMEX** formalisant la posture de sécurité, le ROI cyber et la roadmap à 3 ans
>
> **Compétences visées :** `SEC-03` (A), `SEC-05` (A), `SEC-07` (A), `SEC-08` (A), `POL-01` (A), `PRO-01` (A) — Security Mastery & Capstone Final S12

---

## Module 1 — Architecture Hybride Globale & Scénario Capstone (2h)

### 📖 Narration — Le Couronnement du Semestre 12

Au cours des 50 derniers jours (J501 à J550), vous avez maîtrisé toutes les facettes de la cybersécurité d'entreprise moderne :

```
SYNTHÈSE DES MODULES DU SEMESTRE 12 (J501 - J550)

  ARCHITECTURE & ZERO TRUST       : J501, J502, J503, J521, J532
  IDENTITÉ, IAM & ACTIVE DIRECTORY: J506, J526, J541
  CRYPTOGRAPHIE & PQC             : J504, J525, J544
  SIEM, SOC, UEBA & INCIDENT RESP.: J507, J527, J539, J543, J546
  SECURE SDLC, DEVSECOPS & K8S    : J508, J512, J531, J536, J537, J540
  CLOUD SECURITY & GOUVERNANCE    : J509, J522, J538, J548, J549
  GOUVERNANCE, CONFORMITÉ & GRC   : J505, J511, J535, J544
  OFFENSIF, RED TEAM & MOBILE     : J513, J528, J533, J542, J545
```

Ce Grand Capstone Final est l'épreuve de synthèse où vous devez **démontrer votre maîtrise globale** en tant qu'Architecte Sécurité / RSSI de l'organisation **PARADIS Global**.

### 🔍 L'Infrastructure Hybride à Sécuriser

```
PARADIS GLOBAL — INFRASTRUCTURE HYBRIDE EN PRODUCTION

 ┌─────────────────────────────────────────────────────────────────────────┐
 │  ON-PREMISE DATACENTER                                                  │
 │  ┌─────────────────────────────┐  ┌──────────────────────────────────┐  │
 │  │ Active Directory (Forest)   │  │ SIEM Sentinel / Sysmon Collector │  │
 │  │ Tier 0 (DC1, DC2, KRBTGT)   │  │ Logs centralisés 13 mois         │  │
 │  └──────────────┬──────────────┘  └──────────────────────────────────┘  │
 │                 │ IPsec VPN Tunnel                                       │
 ├─────────────────┼───────────────────────────────────────────────────────┤
 │  CLOUD HYBRIDE (AWS & AZURE)                                            │
 │  ┌──────────────┴──────────────┐  ┌──────────────────────────────────┐  │
 │  │ Azure Kubernetes (AKS)      │  │ AWS Multi-Account (Landing Zone) │  │
 │  │ Namespace: app-production   │  │ CSPM Defender for Cloud (87%)    │  │
 │  │ PSA: Restricted + OPA       │  │ S3 Buckets chiffrés KMS          │  │
 │  └─────────────────────────────┘  └──────────────────────────────────┘  │
 ├─────────────────────────────────────────────────────────────────────────┤
 │  PIPELINE CI/CD DEVSECOPS                                               │
 │  GitLab CI → Semgrep (SAST) → Syft (SBOM) → Cosign Sign → Deploy K8s    │
 └─────────────────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Exercice Purple Teaming & Évaluation Globale (2h)

### 🛠️ Script Python : Capstone Master Security Assessor

```python
#!/usr/bin/env python3
"""
PARADIS — Capstone Master Security Assessor
Évalue la maturité globale de l'organisation sur les 6 piliers de la cybersécurité.
"""
from dataclasses import dataclass
from typing import List, Dict
from datetime import datetime

@dataclass
class SecurityPillar:
    name: str
    weight: float           # Poids dans le score global (somme = 1.0)
    score: float            # Score évalué (0.0 à 100.0)
    key_controls: List[str]

class CapstoneMasterAssessor:
    def __init__(self, company_name: str):
        self.company_name = company_name
        self.pillars: List[SecurityPillar] = [
            SecurityPillar(
                "Architecture Zero Trust & Réseau", 0.15, 92.0,
                ["Micro-segmentation K8s NetworkPolicies", "TLS 1.3 mTLS Istio", "VPN avec MFA IPsec"]
            ),
            SecurityPillar(
                "Active Directory & Identity Management", 0.20, 88.0,
                ["Tiering Model 0/1/2 appliqué", "Rotation KRBTGT bi-annuelle", "PAM CyberArk pour admins"]
            ),
            SecurityPillar(
                "DevSecOps & Supply Chain Security", 0.20, 95.0,
                ["SAST Semgrep dans GitLab CI", "SBOM CycloneDX généré", "Cosign/Sigstore signature images"]
            ),
            SecurityPillar(
                "Cloud Security & CSPM", 0.15, 87.0,
                ["Azure Policy effect Deny active", "Defender for Cloud active", "KMS chiffrement EBS/S3"]
            ),
            SecurityPillar(
                "SOC, Threat Intel & Incident Response", 0.15, 90.0,
                ["SIEM Sentinel 13 mois logs", "Playbook IR Ransomware testé", "Corrélateur EPSS/CISA KEV"]
            ),
            SecurityPillar(
                "Gouvernance, Conformité & GRC", 0.15, 85.0,
                ["ISO 27001:2022 certifié", "DORA compliance planifié", "RCA Blameless Post-Mortem"]
            ),
        ]

    def calculate_global_score(self) -> float:
        return sum(p.score * p.weight for p in self.pillars)

    def generate_executive_summary(self):
        global_score = self.calculate_global_score()

        print("=" * 70)
        print(f"  SYNTHÈSE EXÉCUTIVE COMEX — POSTURE DE SÉCURITÉ {self.company_name}")
        print(f"  Date d'Évaluation : {datetime.now().strftime('%Y-%m-%d')}")
        print("=" * 70)
        print()

        print("  📊 MATURITÉ PAR PILIER STRATÉGIQUE :")
        for p in self.pillars:
            bar = "█" * int(p.score / 5) + "░" * (20 - int(p.score / 5))
            print(f"    • {p.name:<40} [{bar}] {p.score:5.1f}% (Poids: {p.weight*100:.0f}%)")
            for ctrl in p.key_controls:
                print(f"       ✓ {ctrl}")
            print()

        print("─" * 70)
        print(f"  🏆 SCORE DE MATURITÉ GLOBALE : {global_score:.1f} / 100.0")

        if global_score >= 90.0:
            status = "EXCELLENT — Niveau de maturité de classe mondiale (NIST CSF Level 4 Adaptive)"
        elif global_score >= 80.0:
            status = "CONFORME — Objectif PARADIS IT atteint (NIST CSF Level 3 Repeatable)"
        else:
            status = "NON CONFORME — Actions correctives prioritaires requises (NIST CSF Level 2)"

        print(f"  NIVEAU : {status}")
        print("=" * 70)


if __name__ == "__main__":
    assessor = CapstoneMasterAssessor("PARADIS GLOBAL S.A.")
    assessor.generate_executive_summary()
```

---

## Module 3 — Recommandations pour le COMEX & Roadmap à 3 Ans (1h30)

### 🔍 Roadmap Cybersécurité 2024–2027

```
ROADMAP STRATÉGIQUE CYBERSÉCURITÉ PARADIS GLOBAL (2024-2027)

  ANNÉE 1 (2024-2025) — RESILIENCE & COMPLIANCE
  ├── Obtention de la conformité DORA (Deadline Janvier 2025)
  ├── Migration vers la cryptographie Post-Quantique (PQC Kyber/Dilithium)
  └── Consolidation du pipeline DevSecOps avec niveau SLSA 3

  ANNÉE 2 (2025-2026) — ADVANCED AUTOMATION & AI
  ├── Déploiement du SOC Automatisé avec SOAR (Security Orchestration)
  ├── Red Teaming continu via Breach and Attack Simulation (BAS)
  └── Extension du DLP Microsoft Purview à 100% des postes de travail

  ANNÉE 3 (2026-2027) — ZERO TRUST CONTINUOUS MASTERY
  ├── Micro-segmentation Zero Trust étendue au réseau industriel OT/ICS
  ├── AI-assisted Threat Hunting avec modèles LLM locaux sécurisés
  └── Renouvellement triennal de la certification ISO 27001:2022
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Purple Teaming** | Collaboration directe et continue entre le Red Team (offensif) et le Blue Team (défensif) pour améliorer les règles de détection |
| **NIST CSF** | National Institute of Standards and Technology Cybersecurity Framework — Référentiel de maturité à 4 niveaux |
| **SOAR** | Security Orchestration, Automation and Response — Plateforme d'automatisation des réponses aux alertes SOC |
| **BAS** | Breach and Attack Simulation — Outils de simulation automatique d'attaques en continu |
| **COMEX** | Comité Exécutif de l'entreprise |

---

## Exercices Pratiques

### Exercice 1 — Synthèse Exécutive pour le Conseil d'Administration

Rédigez un résumé exécutif de 5 lignes destiné au Directeur Général et au COMEX synthétisant les résultats du Capstone S12 et justifiant le budget cybersécurité demandé pour l'année à venir.

**Corrigé guidé :**
> "Au terme de l'évaluation globale de la posture de sécurité de PARADIS Global (Capstone S12), notre organisation atteint un score de maturité de **89.5/100**, validant notre conformité ISO 27001 et notre préparation à la réglementation européenne DORA.
> L'intégration du pipeline DevSecOps a réduit de 85% l'introduction de vulnérabilités en production, tandis que l'architecture Zero Trust et le durcissement Active Directory prémunissent l'entreprise contre les attaques ransomware d'envergure.
> Pour maintenir ce niveau face aux menaces émergentes, le budget demandé pour l'exercice à venir ciblera la mise en conformité DORA TLPT, la transition cryptographique post-quantique et l'automatisation du SOC."

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce que le **Purple Teaming** ?

- A) Un test d'intrusion réalisé uniquement la nuit.
- B) Une approche collaborative où l'équipe offensive (Red Team) et l'équipe défensive (Blue Team) travaillent ensemble en temps réel pour tester les attaques et affiner immédiatement les règles de détection SIEM/EDR. ✅
- C) Une évaluation de la sécurité des câbles réseau violets.
- D) Une certification de management des risques.

**Q2.** Quel est le rôle principal d'une plateforme **SOAR (Security Orchestration, Automation and Response)** dans un SOC moderne ?

- A) Scanner le code source à la recherche de bugs.
- B) Automatiser l'exécution de tâches répétitives d'investigation et de remédiation (ex: isoler un hôte, bloquer une IP, désactiver un compte) lors de la réception d'une alerte SIEM. ✅
- C) Gérer la paie des analystes SOC.
- D) Sauvegarder les bases de données SQL.

**Q3.** Quel niveau de maturité du **NIST Cybersecurity Framework (CSF)** correspond à une organisation disposant de processus de sécurité formalisés, répétables et mesurés de manière continue (Score > 80%) ?

- A) Tier 1 — Partial
- B) Tier 2 — Risk Informed
- C) Tier 3 — Repeatable ✅
- D) Tier 4 — Adaptive

**Q4.** Dans la roadmap stratégique 2024–2027 proposée, quelle est l'échéance réglementaire majeure imposée aux entités financières dans l'Union Européenne ?

- A) RGPD Version 2 (2028)
- B) DORA (Digital Operational Resilience Act) en janvier 2025 ✅
- C) ISO 27001 version 2030
- D) PCI DSS v5.0 en 2029

**Q5.** Au terme de ce Semestre 12 et du Grand Capstone, quelle est la priorité absolue pour maintenir un niveau de sécurité élevé dans la durée ?

- A) Acheter de nouveaux outils matériels chaque mois.
- B) Maintenir une boucle d'amélioration continue (PDCA) combinant gouvernance, automatisation DevSecOps, formation des équipes et réévaluation régulière face aux évolutions de la menace. ✅
- C) Ne plus effectuer aucune mise à jour des applications en production.
- D) Déléguer la totalité de la responsabilité sécuritaire à l'hébergeur cloud.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
