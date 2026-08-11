# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 511 (6h) : Gouvernance de la Sécurité ISO/IEC 27001:2022 : SMSI, Mesures de l'Annexe A, Audit Interne & Certification

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre la structure du standard **ISO/IEC 27001:2022** et l'implémentation d'un **Système de Management de la Sécurité de l'Information (SMSI)**
> - Maîtriser la roue de Deming (**PDCA — Plan, Do, Check, Act**) appliquée à la gouvernance de la sécurité
> - Décliner et auditer les **93 contrôles de l'Annexe A** répartis en 4 thèmes (Organisationnel, Personnes, Physique, Technique)
> - Établir la **Déclaration d'Applicabilité (SoA — Statement of Applicability)** et préparer les audits de certification
>
> **Compétences visées :** `POL-01` (A), `SEC-06` (A) — ISO 27001 ISMS & Security Governance

---

## Module 1 — Le SMSI & la Norme ISO/IEC 27001:2022 (2h)

### 📖 Intuition & Narration

La sécurité informatique ne se limite pas à configurer des pare-feux et écrire du code sécurisé. Sans cadre de gouvernance, une entreprise peut avoir d'excellents outils techniques mais subir un sinistre majeur parce qu'un employé a laissé ses accès écrits sur un post-it, ou parce qu'aucun plan de continuité d'activité n'avait été formalisé.

La norme internationale **ISO/IEC 27001:2022** fournit le cadre organisationnel de référence pour créer, maintenir et améliorer un **Système de Management de la Sécurité de l'Information (SMSI)**.

Un SMSI n'est pas un projet ponctuel qui s'arrête une fois le certificat obtenu : c'est un **processus d'amélioration continue** guidé par le cycle PDCA.

### 🔍 Anatomie Technique — Le Cycle PDCA & l'Annexe A (93 Contrôles)

```
LE CYCLE PDCA DU SMSI ISO 27001:2022

            ┌───────────────────────────────────────────┐
            │ PLAN (Planifier)                          │
            │ Context, Leadership, EBIOS Risk Analysis  │
            └─────────────────────┬─────────────────────┘
                                  │
                                  ▼
  ┌──────────────────────────────────────────────────────────┐
  │ ACT (Agir / Améliorer)                                   │
  │ Corrective actions, Management Review, SoA Update        │
  ├──────────────────────────────────────────────────────────┤
  │ DO (Mettre en œuvre)                                     │
  │ Deploy Annex A Controls (93 controls across 4 themes)    │
  └─────────────────────┬────────────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────────────────────────┐
            │ CHECK (Vérifier / Auditer)                │
            │ Internal Audits, Key Risk Indicators (KRI)│
            └───────────────────────────────────────────┘

LES 4 THÈMES DE L'ANNEXE A (VERSION 2022) :
  1. A.5 — Contrôles Organisationnels (37 mesures)
  2. A.6 — Contrôles Relatifs aux Personnes (8 mesures)
  3. A.7 — Contrôles Physiques (14 mesures)
  4. A.8 — Contrôles Techniques (34 mesures)
```

---

## Module 2 — Atelier Pratique : Statement of Applicability (SoA) Engine (2h)

### 🛠️ Code Python : ISO 27001 Statement of Applicability (SoA) Manager

```python
#!/usr/bin/env python3
"""
PARADIS — ISO 27001:2022 Statement of Applicability (SoA) Compliance Engine
Gère et évalue l'état de mise en œuvre des contrôles de l'Annexe A.
"""

import json
import sys
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class ISOControl:
    control_id: str      # ex: "A.8.28"
    theme: str           # "Technique", "Organisationnel", "Personnes", "Physique"
    title: str
    applicable: bool
    justification: str
    implemented: bool
    evidence: str

class ISO27001SoAManager:
    def __init__(self):
        self.controls: List[ISOControl] = []

    def load_sample_soa(self):
        self.controls = [
            ISOControl("A.5.15", "Organisationnel", "Contrôle d'accès", True, "Nécessaire pour protéger les données clients", True, "Politique IAM & RBAC en place"),
            ISOControl("A.8.9",  "Technique", "Gestion des configurations", True, "Nécessaire pour l'IaC et Kubernetes", True, "Scripts Checkov & Kyverno"),
            ISOControl("A.8.28", "Technique", "Codage sécurisé", True, "Essentiel pour le développement DevSecOps", True, "Security Gates SAST Semgrep & SonarQube"),
            ISOControl("A.7.4",  "Physique", "Surveillance physique des locaux", False, "Entreprise 100% Cloud sans Data Center propre", False, "N/A — Cloud Provider Shared Responsibility"),
            ISOControl("A.8.12", "Technique", "Prévention des fuites de données (DLP)", True, "Exigence RGPD et secret des affaires", False, "En cours de déploiement (Action requise)")
        ]

    def evaluate_readiness(self) -> dict:
        print("=== EVALUATION DU SMSI ISO 27001:2022 — STATEMENT OF APPLICABILITY ===")
        total_controls = len(self.controls)
        applicable_controls = [c for c in self.controls if c.applicable]
        implemented_controls = [c for c in applicable_controls if c.implemented]

        compliance_rate = (len(implemented_controls) / len(applicable_controls) * 100) if applicable_controls else 0.0

        print(f"[*] Total contrôles évalués         : {total_controls}")
        print(f"[*] Contrôles applicables (SoA)      : {len(applicable_controls)}")
        print(f"[*] Contrôles mis en œuvre (OK)     : {len(implemented_controls)}")
        print(f"[*] Taux de conformité SoA           : {compliance_rate:.1f}%")

        non_compliant = [c for c in applicable_controls if not c.implemented]

        if non_compliant:
            print("\n[⚠️ ÉCARTS D'AUDIT DÉTECTÉS] Mesures applicables non encore finalisées :")
            for c in non_compliant:
                print(f"  ❌ [{c.control_id}] ({c.theme}) {c.title} — Justification : {c.justification}")

        return {
            "compliance_rate": compliance_rate,
            "ready_for_audit": compliance_rate >= 90.0
        }

if __name__ == "__main__":
    manager = ISO27001SoAManager()
    manager.load_sample_soa()
    result = manager.evaluate_readiness()
    if not result["ready_for_audit"]:
        print("\n[⛔ AUDIT READINESS] Non prêt pour l'audit de certification externe.")
        sys.exit(1)
    else:
        print("\n[✅ AUDIT READINESS] Prêt pour l'audit de certification Stage 2.")
```

---

## Module 3 — Audit Interne & Déroulement de la Certification (1h30)

### 🔍 Processus de Certification ISO 27001

La certification ISO 27001 est délivrée par un organisme auditeur indépendant (ex: AFNOR, BSI, Bureau Veritas) pour une durée de 3 ans. Elle se déroule en deux étapes :

1. **Audit Étape 1 (Stage 1 Audit)** : Revue documentaire de la conformité du SMSI (Politique de sécurité, SoA, Analyse de risques).
2. **Audit Étape 2 (Stage 2 Audit)** : Audit de terrain vérifiant la réalité de l'application des contrôles de l'Annexe A.
3. **Audits de Surveillance (Années 2 et 3)** : Audits annuels pour vérifier le maintien du SMSI et l'amélioration continue.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SMSI** | Système de Management de la Sécurité de l'Information (ISMS en anglais) |
| **SoA** | Statement of Applicability — Déclaration d'applicabilité des mesures de l'Annexe A |
| **PDCA** | Plan-Do-Check-Act — Cycle d'amélioration continue de Deming |
| **ISMS** | Information Security Management System |

---

## Exercices Pratiques

### Exercice 1 — Rédaction d'une Ligne de SoA

Rédigez la justification d'exclusion du contrôle physique A.7.11 (Equipements utilisateurs hors locaux) pour une entreprise fournissant uniquement des postes de travail virtuels (VDI Cloud) sans ordinateurs portables physiques distribués.

**Corrigé guidé :**
- **Contrôle ID** : A.7.11
- **Statut** : Non Applicable (Exclu)
- **Justification** : "L'entreprise ne distribue aucun équipement informatique physique aux collaborateurs. Tous les accès s'effectuent via des sessions de postes de travail virtuels (VDI Cloud) chiffrées sans stockage local de données."

---

## Banque QCM — 5 Questions

**Q1.** Quel est l'objectif principal d'un **SMSI (Système de Management de la Sécurité de l'Information)** selon ISO 27001 ?

- A) Acheter de nouveaux ordinateurs.
- B) Établir un cadre organisationnel et méthodologique permanent de gestion des risques pour protéger la confidentialité, l'intégrité et la disponibilité de l'information. ✅
- C) Remplacer l'équipe juridique.
- D) Imprimer des diplômes.

**Q2.** Dans la version **ISO/IEC 27001:2022**, combien de contrôles sont listés dans l'**Annexe A**, et en combien de thèmes sont-ils regroupés ?

- A) 93 contrôles regroupés en 4 thèmes (Organisationnel, Personnes, Physique, Technique). ✅
- B) 500 contrôles en 10 thèmes.
- C) 10 contrôles en 2 thèmes.
- D) 1 seul contrôle.

**Q3.** Qu'est-ce que la **Déclaration d'Applicabilité (SoA — Statement of Applicability)** ?

- A) La liste des salaires des employés.
- B) Le document officiel du SMSI répertoriant les 93 contrôles de l'Annexe A, précisant pour chacun s'il est applicable ou non, avec la justification et son état de mise en œuvre. ✅
- C) Une facture de serveur.
- D) Un contrat d'assurance.

**Q4.** Que signifie la phase **CHECK (Vérifier)** dans le cycle PDCA appliqué à ISO 27001 ?

- A) Écrire du code Python.
- B) Mesurer l'efficacité des contrôles déployés à travers des audits internes, des indicateurs (KPI/KRI) et des revues de direction. ✅
- C) Réparer les câbles réseau.
- D) Publier des messages sur les réseaux sociaux.

**Q5.** Quelle est la durée de validité d'un certificat de conformité ISO/IEC 27001 délivré par un organisme accrédité ?

- A) 1 mois.
- B) 3 ans (avec des audits de surveillance annuels). ✅
- C) À vie.
- D) 100 ans.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
