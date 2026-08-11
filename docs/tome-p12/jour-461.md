# TOME P12 — Gouvernance, Compliance & Architecture Finale — Jour 461 (6h) : Gouvernance de la Sécurité d'Entreprise (ISO/IEC 27001:2022, NIST CSF v2.0 & CIS Controls v8)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le déploiement et l'audit d'un **SMSI (Système de Management de la Sécurité de l'Information)** selon la norme **ISO/IEC 27001:2022**
> - Aligner la posture de sécurité d'entreprise sur le framework **NIST CSF v2.0** (Govern, Identify, Protect, Detect, Respond, Recover)
> - Prioriser les contrôles de sécurité fondamentaux avec les **CIS Controls v8** (Implementation Groups IG1, IG2, IG3)
> - Établir la politique de sécurité de l'information (PSSI) et les règles d'arbitrage stratégique
>
> **Compétences visées :** `POL-01` (A) — Security Governance, `POL-02` (A) — Information Security Standards

---

## Module 1 — ISO/IEC 27001:2022 & Déploiement SMSI (2h)

### 📖 Intuition & Narration

Sans gouvernance, la sécurité informatique est une somme d'initiatives techniques dispersées : un pare-feu ici, un outil SAST là, mais aucun pilotage global. **ISO/IEC 27001** est la norme internationale de référence qui transforme la sécurité en un processus de gestion d'entreprise structuré, auditable et soumis à l'amélioration continue (Roue de Deming / PDCA).

La révision **ISO 27001:2022** a réorganisé l'Annexe A en 4 thématiques modernes (Organisational, People, Physical, Technological) regroupant 93 mesures de sécurité.

### 🔍 Anatomie Technique — Structure ISO 27001:2022 & NIST CSF v2.0

```
NIST CSF v2.0 — LES 6 FONCTIONS STRATÉGIQUES

  ┌─────────────────────────────────────────────────────────────┐
  │  1. GOVERN (GV)   : Politiques, rôles, gestion des risques   │
  │  2. IDENTIFY (ID) : Cartographie des actifs, dépendances     │
  │  3. PROTECT (PR)  : IAM, formation, sécurité des données     │
  │  4. DETECT (DE)   : SIEM, SOC, monitoring continu            │
  │  5. RESPOND (RS)  : Plan IR, réhabilitation, communication   │
  │  6. RECOVER (RC)  : Plan de continuité BCP/DRP, leçons      │
  └─────────────────────────────────────────────────────────────┘

ISO 27001:2022 — ANNEXE A (4 CATÉGORIES / 93 CONTRÔLES)

  ├── Organisational Controls (37 mesures) : Politiques, IAM, Threat Intel
  ├── People Controls       (8 mesures)  : Sensibilisation, Onboarding
  ├── Physical Controls     (14 mesures) : Datacenters, Vidéosurveillance
  └── Technological Controls (34 mesures): Chiffrement, Logging, DevSecOps
```

---

## Module 2 — Audit & Matrice de Conformité CIS Controls v8 (2h)

### 🛠️ Atelier Pratique — Script d'Évaluation de Conformité CIS Controls v8

```python
#!/usr/bin/env python3
"""
PARADIS — Evaluateur de Conformité CIS Controls v8
Calculateur du score de maturité par Implementation Group (IG1, IG2, IG3)
"""

import json

class CISControlsEvaluator:
    def __init__(self):
        self.controls = {
            "CIS_01_Inventory_Assets": {"ig1": 2, "ig2": 3, "ig3": 5, "implemented": 5},
            "CIS_02_Inventory_Software": {"ig1": 3, "ig2": 4, "ig3": 7, "implemented": 7},
            "CIS_03_Data_Protection": {"ig1": 4, "ig2": 8, "ig3": 14, "implemented": 12},
            "CIS_04_Secure_Configuration": {"ig1": 4, "ig2": 7, "ig3": 12, "implemented": 10},
            "CIS_05_Account_Management": {"ig1": 3, "ig2": 5, "ig3": 6, "implemented": 6},
            "CIS_06_Access_Control": {"ig1": 3, "ig2": 5, "ig3": 8, "implemented": 7},
            "CIS_07_Vulnerability_Management": {"ig1": 2, "ig2": 5, "ig3": 7, "implemented": 6},
            "CIS_08_Audit_Log_Management": {"ig1": 3, "ig2": 7, "ig3": 12, "implemented": 11}
        }

    def calculate_maturity(self) -> dict:
        total_required_ig3 = sum(c["ig3"] for c in self.controls.values())
        total_implemented = sum(c["implemented"] for c in self.controls.values())
        score = (total_implemented / total_required_ig3) * 100

        return {
            "total_controls_audited": len(self.controls),
            "compliance_score_ig3": round(score, 2),
            "maturity_level": "LEVEL_3_ENTERPRISE_OPTIMIZED" if score >= 90 else "LEVEL_2_ADVANCED"
        }

evaluator = CISControlsEvaluator()
report = evaluator.calculate_maturity()
print(json.dumps(report, indent=2))
```

---

## Module 3 — Rédaction & Validation de la PSSI d'Entreprise (1h30)

### 🛠️ Structure Type d'une Politique de Sécurité (PSSI)

```markdown
# POLITIQUE DE SÉCURITÉ DE L'INFORMATION (PSSI) — PARADIS ENTERPRISE

1. CHAMP D'APPLICATION & OBJECTIFS
   - Protection de tous les actifs numériques, infrastructures Cloud et données clients.

2. RÔLES ET RESPONSABILITÉS
   - CISO / RSSI : Définition des règles, arbitrage et reporting au Board.
   - DevOps / SRE : Application des Security Gates et hardening des clusters.

3. EXIGENCES OBLIGATOIRES
   - Chiffrement obligatoire au repos (AES-256) et en transit (TLS 1.3 Strict).
   - Authentification MFA obligatoire pour tous les accès distants et privilégiés.
   - Zéro secret en clair dans le code ou les dépôts Git.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SMSI** | Système de Management de la Sécurité de l'Information (ISMS en anglais) |
| **PSSI** | Politique de Sécurité du Système d'Information |
| **CIS** | Center for Internet Security — Organisme éditant les CIS Controls et Benchmarks de hardening |
| **NIST CSF** | NIST Cybersecurity Framework — Cadre de gestion des risques cyber |

---

## Exercices Pratiques

### Exercice 1 — Choix d'Implementation Group CIS

Une PME de 50 employés sans données de santé ni exigences bancaires souhaite prioriser ses actions de sécurité. Quel **Implementation Group CIS (IG1, IG2 ou IG3)** doit-elle cibler en priorité ?

**Corrigé guidé :** Elle doit cibler l'**IG1 (Cyber Hygiene de base)**. L'IG1 regroupe 56 mesures fondamentales conçues pour être déployables avec des ressources limitées, protégeant contre les attaques opportunistes les plus courantes. L'IG2 s'adresse aux entreprises gérant des données sensibles, et l'IG3 aux infrastructures critiques ou hautement ciblées.

---

## Banque QCM — 5 Questions

**Q1.** La révision **ISO/IEC 27001:2022** a réorganisé l'Annexe A en combien de catégories de mesures ?

- A) 14 catégories
- B) 4 catégories (Organisational, People, Physical, Technological) ✅
- C) 2 catégories (Interne, Externe)
- D) 100 catégories

**Q2.** La nouvelle fonction introduite dans le **NIST CSF v2.0** par rapport à la version 1.1 est :

- A) PROTECT
- B) GOVERN (GV) ✅
- C) DETECT
- D) RECOVER

**Q3.** La **PSSI** (Politique de Sécurité du Système d'Information) doit être formellement approuvée par :

- A) Les stagiaires du service informatique
- B) La Direction Générale / Le Conseil d'Administration (Board) ✅
- C) Le fournisseur d'accès Internet
- D) Le prestataire de nettoyage des bureaux

**Q4.** Les **CIS Controls v8** sont structurés en :

- A) 18 Contrôles prioritaires divisés en 3 Implementation Groups (IG1, IG2, IG3) ✅
- B) 500 règles de cryptographie uniquement
- C) 5 lois européennes
- D) 12 clauses d'assurance

**Q5.** Dans la méthode PDCA (Plan-Do-Check-Act) d'un SMSI, la phase **Check** correspond à :

- A) L'écriture du code source
- B) L'audit, la mesure des indicateurs de sécurité (KPIs) et les revues de direction ✅
- C) L'achat des serveurs physiques
- D) La suppression des logs de sécurité

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
