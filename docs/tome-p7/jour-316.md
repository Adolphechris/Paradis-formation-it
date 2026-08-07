# TOME P7 — Certifications d'Élite & Spécialisations — Jour 316 (6h) : CISM Intensive — Information Security Governance (COBIT 2019, Risk Appetite, IS Strategy & Metrics BSC)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **domaine 1 du CISM (Information Security Governance)** ciblé par la certification **CISM (ISACA)** : comprendre le cadre **COBIT 2019** pour l'alignement IT/Business, définir une **politique de sécurité de l'information**, établir le **Risk Appetite et la Risk Tolerance** de l'organisation, et piloter la performance sécurité avec un **Balanced Scorecard (BSC)** et des indicateurs KPI/KRI pertinents.
>
> **Compétences visées :** `CISM-01` (A) — IS Governance Framework (COBIT 2019) | `CISM-02` (A) — Risk Appetite, KPIs, KRIs & Security Metrics

---

## 1) Module — Gouvernance de la Sécurité de l'Information : Cadres & Rôles (2h)

### 📖 Narration/Intuition

La **Gouvernance de la Sécurité de l'Information (IS Governance)** est l'ensemble des processus, structures et mécanismes assurant que la sécurité de l'information s'aligne sur la stratégie business de l'entreprise. Le CISM définit **6 résultats attendus** d'une gouvernance efficace :

| Résultat | Description |
|:--------:|:-----------|
| **Alignement stratégique** | La sécurité soutient les objectifs business |
| **Gestion des risques** | Les risques IT sont gérés à un niveau acceptable |
| **Livraison de valeur** | Optimisation des investissements sécurité |
| **Gestion des ressources** | Utilisation efficiente des ressources IS |
| **Mesure de performance** | Métriques pertinentes (KPIs, KRIs) |
| **Intégration** | Sécurité intégrée dans tous les processus |

**COBIT 2019** (Control Objectives for Information and Related Technology) est le cadre de référence ISACA structurant la gouvernance et le management IT en **40 objectifs** répartis en 5 domaines.

---

## 2) Module — Risk Appetite & KPIs/KRIs CISM (`security_governance_metrics.py`) (2h)

### 🛠️ Atelier Pratique

```python
# Tableau de Bord de Gouvernance IS — CISM Balanced Scorecard
# Calcul automatique des KPIs et KRIs de sécurité

import json
from datetime import datetime

def cism_governance_dashboard():
    # ─────────────────────────────────────────────────────
    # KPIs (Key Performance Indicators) — Mesure l'efficacité des contrôles
    # ─────────────────────────────────────────────────────
    kpis = {
        "patch_coverage_pct": {
            "value": 94.2,
            "target": 98.0,
            "status": "YELLOW",
            "description": "% des systèmes critiques patchés dans les SLA"
        },
        "mfa_adoption_pct": {
            "value": 99.1,
            "target": 100.0,
            "status": "GREEN",
            "description": "% des comptes privilegiés avec MFA actif"
        },
        "phishing_click_rate_pct": {
            "value": 3.2,
            "target": 2.0,  # Cible : < 2% (plus bas = mieux)
            "status": "YELLOW",
            "description": "% de collaborateurs cliquant sur des simulations de phishing"
        },
        "mean_time_to_detect_hours": {
            "value": 1.8,
            "target": 4.0,  # MTTD : < 4h
            "status": "GREEN",
            "description": "Temps moyen de détection d'un incident (MTTD)"
        },
        "mean_time_to_respond_hours": {
            "value": 5.4,
            "target": 8.0,  # MTTR : < 8h
            "status": "GREEN",
            "description": "Temps moyen de réponse à un incident (MTTR)"
        }
    }

    # ─────────────────────────────────────────────────────
    # KRIs (Key Risk Indicators) — Signaux avancés de risque
    # ─────────────────────────────────────────────────────
    kris = {
        "unpatched_critical_cves": {
            "value": 7,
            "threshold": 5,
            "status": "RED",
            "description": "Nombre de CVE CRITIQUES non patchées depuis > 30 jours"
        },
        "admin_accounts_no_mfa": {
            "value": 0,
            "threshold": 1,
            "status": "GREEN",
            "description": "Comptes Admin sans MFA (seuil: 0)"
        },
        "third_party_vendors_overdue_assessment": {
            "value": 3,
            "threshold": 2,
            "status": "RED",
            "description": "Fournisseurs tiers sans évaluation sécurité à jour"
        }
    }

    # ─────────────────────────────────────────────────────
    # Risk Appetite Statement
    # ─────────────────────────────────────────────────────
    risk_appetite = {
        "financial_impact_tolerance_usd": 500_000,
        "reputational_risk_tolerance": "LOW",
        "regulatory_breach_tolerance": "ZERO",
        "operational_disruption_rto_hours": 4
    }

    print("=" * 60)
    print(f"CISM IS GOVERNANCE DASHBOARD — {datetime.now().strftime('%Y-%m-%d')}")
    print("=" * 60)
    print("\n[KPIs]")
    for k, v in kpis.items():
        print(f"  {v['status']:6} | {k}: {v['value']} (cible: {v['target']})")

    print("\n[KRIs]")
    for k, v in kris.items():
        print(f"  {v['status']:6} | {k}: {v['value']} (seuil: {v['threshold']})")

    print(f"\n[Risk Appetite]")
    print(json.dumps(risk_appetite, indent=2))

cism_governance_dashboard()
```

---

## 3) Module — Politique de Sécurité de l'Information & Structure de Gouvernance (2h)

```markdown
# POLITIQUE DE SÉCURITÉ DE L'INFORMATION — PARADIS BANK SA

## 1. Déclaration d'Intention (Statement of Intent)
La Direction Générale s'engage à protéger la confidentialité, l'intégrité et la disponibilité
des actifs informationnels de PARADIS BANK SA conformément aux exigences légales,
réglementaires (RGPD, NIS2, DORA) et aux attentes des parties prenantes.

## 2. Périmètre
Cette politique s'applique à l'ensemble des collaborateurs, sous-traitants, partenaires
et systèmes d'information de PARADIS BANK SA.

## 3. Structure de Gouvernance
- **Conseil d'Administration :** Approuve l'appétit au risque (Risk Appetite)
- **CISO :** Responsable de la stratégie IS — Rapporte au CEO/Board
- **Risk Committee :** Revue trimestrielle des KRIs et incidents
- **RSSI Opérationnel :** Pilote les contrôles techniques et les plans de remédiation

## 4. Risk Appetite
L'organisation tolère un niveau de risque résiduel FAIBLE sur les actifs critiques
(données clients, systèmes de paiement) et MODÉRÉ sur les systèmes secondaires.
Tout risque résiduel HIGH ou CRITICAL doit être remonté au Risk Committee.

## 5. Revue
Cette politique est revue annuellement ou à chaque changement majeur du périmètre.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CISM** | Certified Information Security Manager — Certification ISACA de management de la sécurité |
| **COBIT** | Control Objectives for Information and Related Technology — Cadre de gouvernance IT (ISACA) |
| **KPI** | Key Performance Indicator — Indicateur de performance clé (mesure l'efficacité) |
| **KRI** | Key Risk Indicator — Indicateur de risque clé (signal d'alerte avancé) |
| **BSC** | Balanced Scorecard — Tableau de bord prospectif alignant performance et stratégie |
| **Risk Appetite** | Niveau de risque que l'organisation accepte de prendre pour atteindre ses objectifs |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans le domaine CISM, quelle est la différence fondamentale entre un **KPI** et un **KRI** ?
- A) Un KPI mesure l'efficacité des contrôles de sécurité en place (performance passée), tandis qu'un KRI est un indicateur avancé signalant une augmentation du risque avant qu'un incident ne survienne
- B) Un KPI est uniquement financier, un KRI uniquement technique
- C) Un KPI est pour la direction, un KRI pour les techniciens
- D) Il n'y a aucune différence

**Réponse : A**

**Q2 :** Quel cadre ISACA est la référence mondiale pour la **gouvernance et le management de l'IT** en 40 objectifs de contrôle ?
- A) COBIT 2019
- B) ISO 27001:2022
- C) NIST CSF 2.0
- D) ITIL v4

**Réponse : A**

**Q3 :** Dans le contexte CISM, que définit le **Risk Appetite** d'une organisation ?
- A) Le niveau de risque maximal que l'organisation accepte de prendre de manière délibérée pour atteindre ses objectifs stratégiques, approuvé par le Conseil d'Administration
- B) Le budget annuel de cybersécurité
- C) Le nombre de pentest autorisés par an
- D) Le seuil de performance des KPIs

**Réponse : A**

**Q4 :** À qui le **CISO (Chief Information Security Officer)** doit-il idéalement rapporter pour une gouvernance IS efficace selon les best practices CISM ?
- A) Directement au CEO ou au Conseil d'Administration (Board), garantissant l'indépendance de la fonction sécurité vis-à-vis des directions métiers
- B) Au Directeur Informatique (CIO) uniquement
- C) Au Directeur Financier (CFO)
- D) Au service des Ressources Humaines

**Réponse : A**

**Q5 :** Selon COBIT 2019, quel est l'objectif principal de la **gouvernance IT** par rapport au **management IT** ?
- A) La gouvernance IT évalue, oriente et surveille l'IT au niveau du Board/Direction pour s'assurer de la création de valeur, tandis que le management planifie, construit et exploite l'IT au niveau opérationnel
- B) La gouvernance IT gère les projets, le management audite
- C) La gouvernance est technique, le management est stratégique
- D) Aucune différence fondamentale

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
