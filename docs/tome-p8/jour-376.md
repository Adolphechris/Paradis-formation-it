# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 376 (6h) : ISO 27001:2022 & NIST CSF 2.0 — ISMS Design, Gap Analysis, Risk Register Engineering & Annex A Control Mapping

> [!NOTE]
> **Objectif du jour :** Maîtriser la conception et l'implémentation d'un **Système de Management de la Sécurité de l'Information (SMSI / ISMS)** conforme à l'**ISO 27001:2022** et aligné sur le **NIST Cybersecurity Framework 2.0 (CSF 2.0)** : conduire une analyse des écarts (**Gap Analysis**), construire un **Registre des Risques (Risk Register)** avec scoring quantitatif (Likelihood × Impact), mapper les 93 contrôles de l'**Annexe A** révisée, et piloter l'amélioration continue via le cycle **PDCA (Plan-Do-Check-Act)**.
>
> **Compétences visées :** `GRC-01` (A) — ISO 27001:2022 ISMS Gap Analysis & Annex A Control Mapping | `GRC-02` (A) — Risk Register Engineering & NIST CSF 2.0 Function Alignment

---

## 1) Module — Architecture ISMS & Structure ISO 27001:2022 (2h)

### 📖 Narration/Intuition

L'ISO 27001 n'est pas un catalogue de contrôles à cocher : c'est un **système de management vivant** piloté par le risque. Sa force réside dans le cycle **PDCA** et l'obligation de démontrer l'amélioration continue de la posture de sécurité.

```
   ┌──────────────────────────────────────────────────────────────────┐
   │          ISO 27001:2022 ISMS — CYCLE PDCA                        │
   │                                                                  │
   │   PLAN ──────────────────────────────────────────────────────►   │
   │   (Périmètre, Politique, Risques, Objectifs, Contrôles)          │
   │          │                                                   │   │
   │          ▼                                                   │   │
   │         DO ──────────────────────────────────────────────►   │   │
   │         (Implémenter les contrôles, Former, Sensibiliser)   │   │
   │                │                                            │   │
   │                ▼                                            │   │
   │              CHECK ──────────────────────────────────────►  │   │
   │              (Audits internes, KPIs, Non-Conformités)      │   │
   │                     │                                       │   │
   │                     ▼                                       │   │
   │                    ACT ─────────────────────────────────────┘   │
   │                    (Revue de Direction, Actions Correctives)     │
   └──────────────────────────────────────────────────────────────────┘
```

#### ISO 27001:2022 vs NIST CSF 2.0 — Correspondances Stratégiques

| NIST CSF 2.0 Function | Clauses ISO 27001:2022 | Contrôles Annex A (Exemples) |
|:---:|:---|:---|
| **Govern** | Clauses 4, 5, 6 | A.5 — Politiques de Sécurité |
| **Identify** | Clauses 6, 8 | A.8 — Gestion des Actifs |
| **Protect** | Clause 8, Annex A | A.8.24 — Cryptographie / A.5.23 — Cloud |
| **Detect** | Clauses 8, 9 | A.8.16 — Monitoring des Activités |
| **Respond** | Clause 8 | A.5.26 — Réponse aux Incidents |
| **Recover** | Clauses 8, 10 | A.5.29 — Business Continuity |

---

## 2) Module — Outillage ISMS Risk Register Engine (`isms_risk_register.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict

class ISMSRiskRegister:
    """
    Moteur de construction du Registre des Risques ISO 27001:2022.
    Calcule le score de risque brut et résiduel, et mappe les contrôles de l'Annexe A.
    """

    RISK_APPETITE_THRESHOLD = 12  # Seuil d'acceptabilité du risque (score max toléré)

    def __init__(self, organization: str, scope: str):
        self.org = organization
        self.scope = scope
        self.risks: List[dict] = []

    def add_risk(self, risk_id: str, asset: str, threat: str, vulnerability: str,
                 likelihood: int, impact: int, controls: List[str],
                 residual_likelihood: int, residual_impact: int) -> dict:
        """
        Ajoute un risque au registre avec scoring brut et résiduel.
        Likelihood (1-5) : Probabilité d'occurrence | Impact (1-5) : Gravité de l'impact.
        Score Brut = Likelihood × Impact | Score Résiduel = après application des contrôles.
        """
        raw_score = likelihood * impact
        residual_score = residual_likelihood * residual_impact
        is_acceptable = residual_score <= self.RISK_APPETITE_THRESHOLD

        risk = {
            "risk_id": risk_id,
            "asset": asset,
            "threat": threat,
            "vulnerability": vulnerability,
            "raw_score": raw_score,
            "raw_rating": self._rate(raw_score),
            "iso_annex_controls": controls,
            "residual_score": residual_score,
            "residual_rating": self._rate(residual_score),
            "is_acceptable": is_acceptable,
            "risk_treatment": "ACCEPT" if is_acceptable else "MITIGATE / TRANSFER"
        }
        self.risks.append(risk)
        status = "✅ ACCEPTABLE" if is_acceptable else "❌ ACTION REQUISE"
        print(f"  [{risk_id}] {threat} sur {asset} | Score Brut: {raw_score} → Résiduel: {residual_score} | {status}")
        return risk

    def _rate(self, score: int) -> str:
        if score >= 20: return "CRITIQUE"
        if score >= 12: return "ÉLEVÉ"
        if score >= 6:  return "MOYEN"
        return "FAIBLE"

    def generate_risk_register_report(self) -> dict:
        unacceptable = [r for r in self.risks if not r["is_acceptable"]]
        return {
            "organization": self.org,
            "isms_scope": self.scope,
            "report_date": datetime.now(timezone.utc).isoformat(),
            "total_risks": len(self.risks),
            "unacceptable_risks_count": len(unacceptable),
            "risks_requiring_action": unacceptable,
            "risk_register": self.risks
        }

# Démonstration ISMS Risk Register ISO 27001:2022
isms = ISMSRiskRegister("PARADIS GLOBAL BANK", "Systèmes d'Information IT / Périmètre Bancaire")

print("=== ISO 27001:2022 ISMS RISK REGISTER ENGINE ===")

isms.add_risk(
    risk_id="RSK-001",
    asset="Base de Données Core Banking",
    threat="Accès non autorisé par vol d'identifiants IAM",
    vulnerability="Absence de MFA sur les comptes DBA",
    likelihood=4, impact=5,
    controls=["A.8.5 - Authentification Sécurisée", "A.5.17 - Gestion des Accès à Privilèges"],
    residual_likelihood=2, residual_impact=5
)

isms.add_risk(
    risk_id="RSK-002",
    asset="Sauvegardes S3 AWS",
    threat="Ransomware chiffrant les sauvegardes cloud",
    vulnerability="Sauvegardes sans politique d'immutabilité (WORM)",
    likelihood=3, impact=5,
    controls=["A.8.13 - Backup", "A.5.30 - ICT Readiness for Business Continuity"],
    residual_likelihood=1, residual_impact=5
)

isms.add_risk(
    risk_id="RSK-003",
    asset="Postes de Travail Employés",
    threat="Infection par Malware via Phishing",
    vulnerability="Absence de formation anti-phishing",
    likelihood=4, impact=3,
    controls=["A.6.3 - Sensibilisation et Formation", "A.8.7 - Protection Malware"],
    residual_likelihood=2, residual_impact=2
)

print("\n=== RISK REGISTER REPORT ===")
report = isms.generate_risk_register_report()
print(json.dumps(report, indent=2, ensure_ascii=False))
```

---

## 3) Module — Tableau de Correspondance Gap Analysis (2h)

```markdown
# ISO 27001:2022 ANNEX A — GAP ANALYSIS TEMPLATE

| Contrôle Annex A | Domaine | Statut Actuel | Gap Identifié | Plan d'Action |
|:---|:---|:---:|:---|:---|
| **A.5.1 — Politiques de Sécurité** | Gouvernance | ✅ Implémenté | Aucun | Revue annuelle |
| **A.5.23 — Cloud Security** | Cloud | ❌ Non Implémenté | Absence de CASB et de politique d'accès cloud | Déployer MS Defender for Cloud Apps + Policy |
| **A.8.5 — Authentification Sécurisée** | Contrôle d'Accès | 🟡 Partiel | MFA non obligatoire sur comptes DBA | Forcer FIDO2 sur tous les accès PAM |
| **A.8.16 — Monitoring des Activités** | Détection | ✅ Implémenté | KPIs SIEM insuffisants | Enrichir les dashboards SOC |
| **A.5.26 — Réponse aux Incidents** | Réponse | 🟡 Partiel | Pas de RACI Incident clair au-delà de 24h | Formaliser le RACI & Runbooks Tier-3 |
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ISMS** | Information Security Management System — Système de Management de la Sécurité de l'Information |
| **PDCA** | Plan-Do-Check-Act — Cycle d'amélioration continue central à l'ISO 27001 |
| **NIST CSF** | NIST Cybersecurity Framework — Cadre américain de gouvernance cybersécurité organisé en fonctions |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle est la principale innovation de la **version ISO 27001:2022** par rapport à la version 2013 ?
- A) Une restructuration et réduction de l'Annexe A (de 114 à 93 contrôles regroupés en 4 thèmes), l'introduction de nouveaux contrôles Cloud, Threat Intelligence et Sécurité des Services Web
- B) L'obligation de payer une certification annuelle
- C) L'abandon du cycle PDCA
- D) La restriction aux entreprises européennes

**Réponse : A**

**Q2 :** Dans la méthode de scoring du **Registre des Risques** ISO 27001, comment est calculé le score de risque brut ?
- A) Score Brut = Vraisemblance (Likelihood) × Impact — une matrice multiplicative donnant une valeur numérique comparable entre différents risques
- B) Score Brut = Likelihood + Impact
- C) Score Brut = Impact / Likelihood
- D) Score Brut est toujours égal à 10

**Réponse : A**

**Q3 :** Que représente le **NIST CSF 2.0** et pourquoi la nouvelle fonction "Govern" est-elle significative ?
- A) Le NIST CSF 2.0 est un cadre américain de gouvernance cybersécurité. La nouvelle fonction "Govern" (6ème fonction) signale que la cybersécurité doit être pilotée au niveau stratégique (CISO/Board) et non uniquement opérationnel
- B) C'est un langage de programmation de sécurité
- C) NIST CSF 2.0 remplace complètement l'ISO 27001
- D) Il s'applique uniquement aux agences gouvernementales US

**Réponse : A**

**Q4 :** Dans le Registre des Risques, quelle option de **traitement du risque** est appropriée pour un risque dont le score résiduel dépasse l'appétit au risque de l'organisation malgré les contrôles déployés ?
- A) Transférer le risque (ex: Cyber Assurance) ou mettre en œuvre des contrôles compensatoires additionnels
- B) Ignorer le risque
- C) Clôturer la ligne du registre
- D) Attendre la prochaine révision annuelle sans action

**Réponse : A**

**Q5 :** Quel contrôle de l'Annexe A ISO 27001:2022 (section A.8) couvre spécifiquement la sécurité des **services Cloud** ?
- A) A.5.23 — Security for Use of Cloud Services
- B) A.8.1 — User End Point Devices
- C) A.6.4 — Disciplinary Process
- D) A.5.1 — Policies for Information Security

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
