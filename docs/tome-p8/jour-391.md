# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 391 (6h) : SOC Capstone Defense — Project Presentation, Technical Deep-Dive, Architecture Review, Q&A Defense & BCC SOC Validation

> [!NOTE]
> **Objectif du jour :** Présenter et défendre le **projet intégrateur SOC BCC** devant un jury technique : architecture détaillée, choix technologiques, implémentation, tests, et validation de la conformité aux exigences du Semestre 8.
>
> **Compétences visées :** `S8-DEFENSE-01` (A) — Technical Presentation & Architecture Defense | `S8-DEFENSE-02` (A) — Implementation Review, Testing & Validation

---

## 1) Module — Préparation de la Défense (2h)

### 📖 Structure de la Présentation

```
DÉFENSE PROJET SOC BCC — DURÉE : 45min
┌─────────────────────────────────────────┐
│ 1. CONTEXTE & PROBLÉMATIQUE (5min)     │
│    - Menaces sur BCC                    │
│    - État actuel du SOC                 │
│    - Objectifs du projet                │
├─────────────────────────────────────────┤
│ 2. ARCHITECTURE SOC (15min)            │
│    - Vue d'ensemble                     │
│    - Couches (Collection, Detection,    │
│      Response, Intelligence, Governance)│
│    - Choix technologiques               │
│    - Diagrammes d'architecture          │
├─────────────────────────────────────────┤
│ 3. IMPLÉMENTATION (10min)              │
│    - Règles de détection                │
│    - Playbooks SOAR                     │
│    - Intégrations                       │
│    - Tests et validation                │
├─────────────────────────────────────────┤
│ 4. CONFORMITÉ & GOUVERNANCE (5min)     │
│    - NIS2, DORA, RGPD, COBAC           │
│    - KPIs et metrics                    │
│    - ROI                                │
├─────────────────────────────────────────┤
│ 5. DÉFENSE / Q&A (10min)               │
│    - Questions techniques               │
│    - Justifications des choix           │
│    - Perspectives d'amélioration        │
└─────────────────────────────────────────┘
```

### Template de Présentation

```markdown
# Projet SOC BCC — Présentation

## 1. Contexte
- BCC : banque centrale, 2M transactions/jour
- Menaces : APT étatiques, ransomware, fraude SWIFT
- SOC actuel : niveau 3/5, gaps critiques (EDR DC01, FP rate 90%)

## 2. Architecture
- Collection : Winlogbeat, Filebeat, Zeek, CrowdStrike
- Detection : Splunk ES (50+ rules), EDR (100% coverage), NDR (Zeek)
- Response : XSOAR/Shuffle (5 playbooks), ServiceNow
- Intelligence : MISP/OpenCTI, F3EAD, STIX/TAXII
- Governance : Grafana dashboards, NIST CSF, ISO 27001

## 3. Implémentation
- 50+ règles SIEM (MITRE coverage 85%)
- 5 playbooks SOAR (L1/L2/L3)
- 10 IoCs CTI intégrés
- Tests Purple Team : 80% detection rate

## 4. Conformité
- NIS2 : notification 72h implémentée
- DORA : ICT risk management en place
- RGPD : DPO, DPIA, DSR workflow
- COBAC : reporting trimestriel automatisé

## 5. ROI
- Budget : 750k€ sur 18 mois
- Bénéfices : 600k€/an incidents évités
- ROI 3 ans : 233%
```

---

## 2) Module — Architecture Review & Validation (`soc_validation_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict, Optional
from enum import Enum

class ValidationStatus(Enum):
    PASSED = "PASSED"
    FAILED = "FAILED"
    WARNING = "WARNING"

class SOCValidationEngine:
    """
    Moteur de validation du projet SOC BCC.
    Évalue l'architecture, l'implémentation, la conformité et la présentation.
    """

    def __init__(self, org_name: str = "BCC"):
        self.org_name = org_name
        self.validations: List[dict] = []
        self.scores: Dict[str, float] = {}

    def validate_architecture(self, criteria: List[dict]) -> dict:
        """Valide l'architecture SOC."""
        passed = sum(1 for c in criteria if c["met"])
        total = len(criteria)
        score = (passed / total * 100) if total > 0 else 0

        result = {
            "category": "ARCHITECTURE",
            "criteria": criteria,
            "passed": passed,
            "total": total,
            "score": round(score, 1),
            "status": ValidationStatus.PASSED.value if score >= 75 else ValidationStatus.FAILED.value,
            "validated_at": datetime.now(timezone.utc).isoformat()
        }
        self.validations.append(result)
        return result

    def validate_implementation(self, components: List[dict]) -> dict:
        """Valide l'implémentation."""
        passed = sum(1 for c in components if c["implemented"])
        total = len(components)
        score = (passed / total * 100) if total > 0 else 0

        result = {
            "category": "IMPLEMENTATION",
            "components": components,
            "passed": passed,
            "total": total,
            "score": round(score, 1),
            "status": ValidationStatus.PASSED.value if score >= 75 else ValidationStatus.FAILED.value,
            "validated_at": datetime.now(timezone.utc).isoformat()
        }
        self.validations.append(result)
        return result

    def validate_compliance(self, frameworks: List[dict]) -> dict:
        """Valide la conformité réglementaire."""
        passed = sum(1 for f in frameworks if f["compliant"])
        total = len(frameworks)
        score = (passed / total * 100) if total > 0 else 0

        result = {
            "category": "COMPLIANCE",
            "frameworks": frameworks,
            "passed": passed,
            "total": total,
            "score": round(score, 1),
            "status": ValidationStatus.PASSED.value if score >= 75 else ValidationStatus.FAILED.value,
            "validated_at": datetime.now(timezone.utc).isoformat()
        }
        self.validations.append(result)
        return result

    def calculate_final_score(self) -> dict:
        """Calcule le score final du projet."""
        if not self.validations:
            return {"score": 0, "status": "NO_VALIDATIONS"}

        total_score = sum(v["score"] for v in self.validations)
        avg_score = total_score / len(self.validations)

        return {
            "organisation": self.org_name,
            "validations": len(self.validations),
            "average_score": round(avg_score, 1),
            "status": "PASSED" if avg_score >= 75 else "FAILED",
            "breakdown": {v["category"]: v["score"] for v in self.validations}
        }


# --- Démonstration ---
print("=== SOC VALIDATION ENGINE DEMONSTRATION ===")

validator = SOCValidationEngine(org_name="BCC")

# Validation architecture
arch_criteria = [
    {"criterion": "SIEM deployed", "met": True},
    {"criterion": "EDR on 100% endpoints", "met": True},
    {"criterion": "NDR deployed", "met": True},
    {"criterion": "SOAR platform", "met": True},
    {"criterion": "CTI platform", "met": True},
    {"criterion": "Multi-layer detection", "met": True},
    {"criterion": "Automation L1 > 70%", "met": True},
    {"criterion": "MITRE coverage > 80%", "met": True},
]

arch_result = validator.validate_architecture(arch_criteria)
print(f"    Architecture: {arch_result['score']}% ({arch_result['status']})")

# Validation implémentation
impl_components = [
    {"component": "50+ SIEM rules", "implemented": True},
    {"component": "5 SOAR playbooks", "implemented": True},
    {"component": "EDR on DC01", "implemented": True},
    {"component": "CTI program", "implemented": True},
    {"component": "Compliance framework", "implemented": True},
    {"component": "Metrics dashboard", "implemented": True},
    {"component": "Board reporting", "implemented": True},
    {"component": "Team training program", "implemented": True},
]

impl_result = validator.validate_implementation(impl_components)
print(f"    Implementation: {impl_result['score']}% ({impl_result['status']})")

# Validation conformité
compliance_frameworks = [
    {"framework": "NIS2", "compliant": True},
    {"framework": "DORA", "compliant": True},
    {"framework": "RGPD", "compliant": True},
    {"framework": "COBAC", "compliant": True},
    {"framework": "ISO 27001", "compliant": True},
]

comp_result = validator.validate_compliance(compliance_frameworks)
print(f"    Compliance: {comp_result['score']}% ({comp_result['status']})")

# Score final
final = validator.calculate_final_score()
print(f"\n[+] Final Project Score : {final['average_score']}% ({final['status']})")
print(f"    Breakdown: {final['breakdown']}")
```

---

## 3) Module — Questions de Jury & Grille d'Évaluation (2h)

### 📖 Grille d'Évaluation du Jury

| Critère | Points | Description |
|:---|:---:|:---|
| **Contexte & Problématique** | 5/20 | Compréhension des enjeux BCC, menace landscape, état actuel |
| **Architecture SOC** | 5/20 | Cohérence, choix technologiques, multicouche, évolutivité |
| **Détection** | 5/20 | Règles SIEM/EDR/NDR, MITRE coverage, tuning, FP/TP |
| **Réponse** | 5/20 | Playbooks SOAR, automation, DFIR, incident response |
| **CTI** | 3/20 | F3EAD, collecte, analyse, diffusion, partage |
| **Conformité** | 2/20 | NIS2, DORA, RGPD, COBAC, ISO 27001 |
| **Metrics & ROI** | 2/20 | KPIs, métriques, dashboard, calcul ROI, justification budget |
| **Présentation** | 2/20 | Clarté, supports, communication, gestion du temps |
| **Q&A Defense** | 1/20 | Réponses techniques, justification des choix, profondeur |

**Total : 30 points — Seuil de réussite : 75% (22.5/30)**

### Questions Fréquentes du Jury

**Q1 :** Pourquoi avoir choisi Splunk ES plutôt qu'Elastic SIEM pour le SOC BCC ?
- A) Splunk ES offre une maturité plus élevée (CIM, ES Content, risk-based alerting), une intégration native avec de nombreux outils SOC, et une courbe d'apprentissage maîtrisée par l'équipe BCC — Elastic reste une alternative viable pour les budgets plus limités

**Q2 :** Comment justifiez-vous la couverture MITRE ATT&CK de 85% ?
- A) La couverture est calculée sur les techniques applicables à l'environnement BCC (SWIFT, Core Banking, endpoints) ; 85% couvre les techniques les plus critiques (Initial Access, Execution, Persistence, Lateral Movement, Collection, Exfiltration) avec des règles testées et déployées

**Q3 :** Pourquoi 5 playbooks SOAR et pas plus ?
- A) 5 playbooks couvrent les scénarios les plus critiques (ransomware, phishing, data exfiltration, account takeover, DDoS) avec un niveau d'automatisation L1 > 70% ; d'autres playbooks peuvent être ajoutés itérativement selon les incidents observés

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SOC** | Security Operations Center — Centre des opérations de sécurité |
| **SIEM** | Security Information & Event Management — Gestion des informations et événements de sécurité |
| **EDR** | Endpoint Detection & Response — Détection et réponse sur endpoint |
| **NDR** | Network Detection & Response — Détection et réponse réseau |
| **SOAR** | Security Orchestration, Automation & Response — Orchestration et automatisation de la réponse |
| **CTI** | Cyber Threat Intelligence — Renseignement sur les menaces cyber |
| **F3EAD** | Find, Fix, Finish, Exploit, Analyze, Disseminate — Cycle de renseignement |
| **MITRE ATT&CK** | Framework de connaissances sur les tactiques et techniques des attaquants |
| **NIS2** | Directive européenne sur la sécurité des réseaux et systèmes d'information |
| **DORA** | Digital Operational Resilience Act — Règlement sur la résilience opérationnelle numérique |
| **RGPD** | Règlement Général sur la Protection des Données |
| **COBAC** | Commission Bancaire de la RDC |
| **ISO 27001** | Norme internationale pour les Systèmes de Management de la Sécurité de l'Information |
| **ROI** | Return on Investment — Retour sur investissement |
| **MTTD** | Mean Time to Detect — Temps moyen de détection |
| **MTTR** | Mean Time to Respond/Remediate — Temps moyen de réponse/remédiation |
| **FP/TP** | False Positive / True Positive — Faux positif / Vrai positif |
| **KPI** | Key Performance Indicator — Indicateur clé de performance |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quels sont les critères d'évaluation du jury pour le projet intégrateur SOC BCC ?
- A) Contexte et problématique (5pts), Architecture SOC (5pts), Détection (5pts), Réponse (5pts), CTI (3pts), Conformité (2pts), Metrics & ROI (2pts), Présentation (2pts), Q&A Defense (1pt) — total 30pts, seuil 75%
- B) Seulement la présentation
- C) Seulement le code
- D) Seulement les tests

**Réponse : A**

**Q2 :** Pourquoi le **ROI** est-il un critère d'évaluation important pour un projet SOC bancaire ?
- A) Parce qu'il démontre la valeur business du SOC : incidents évités, amendes réglementaires évitées, protection de la réputation — il justifie l'investissement auprès de la direction et mesure l'efficacité du SOC en termes business
- B) Parce que c'est obligatoire pour l'obtention du diplôme
- C) Parce que le ROI améliore la sécurité technique
- D) Parce que c'est un critère esthétique

**Réponse : A**

**Q3 :** Comment défendez-vous le choix d'une architecture **multi-couches** (SIEM + EDR + NDR) pour le SOC BCC ?
- A) Parce que chaque couche détecte des menaces spécifiques à une étape différente du kill chain : SIEM pour la corrélation logs, EDR pour le comportement endpoint, NDR pour le trafic réseau — combinées, elles offrent une détection en profondeur supérieure à tout outil unique
- B) Parce que c'est moins cher
- C) Parce que c'est obligatoire par la loi
- D) Parce que les vendeurs l'imposent

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
