# TOME P7 — Certifications d'Élite & Spécialisations — Jour 317 (6h) : CISM Intensive — Risk Management & Business Impact Analysis (BIA, RTO, RPO, Threat Modeling IS & Risk Treatment)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **domaine 2 du CISM (Information Risk Management)** : conduire une **Business Impact Analysis (BIA)** pour identifier les processus critiques, définir les **RTO (Recovery Time Objective)** et **RPO (Recovery Point Objective)**, appliquer le cycle de gestion des risques IS (Identify → Assess → Treat → Monitor), et choisir les stratégies de **Risk Treatment** (Accept, Avoid, Transfer, Mitigate).
>
> **Compétences visées :** `CISM-03` (A) — Business Impact Analysis (BIA) & RTO/RPO | `CISM-04` (A) — Risk Treatment Strategies & Risk Register

---

## 1) Module — Business Impact Analysis (BIA) & RTO/RPO (2h)

### 📖 Narration/Intuition

La **BIA (Business Impact Analysis)** est la fondation du Plan de Continuité d'Activité (PCA). Elle répond à deux questions critiques pour chaque processus métier :
- **Combien de temps peut-on se passer de ce processus ?** → **RTO (Recovery Time Objective)**
- **Quelle perte de données est acceptable ?** → **RPO (Recovery Point Objective)**

```
Incident
   │
   ├── RTO ──► Temps maximum acceptable avant reprise du service
   │
   └── RPO ──► Perte de données maximale acceptable (exprimée en temps)
               Ex: RPO = 1h → Backup toutes les heures obligatoire
```

---

## 2) Module — Script BIA & Risk Register (`bia_risk_register.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime

# ─────────────────────────────────────────────────────────────────────────
# Business Impact Analysis (BIA) — Processus critiques PARADIS BANK
# ─────────────────────────────────────────────────────────────────────────
business_processes = [
    {
        "process": "Système de Paiements Interbancaires (SWIFT)",
        "rto_hours": 1,         # Reprise en 1h max
        "rpo_hours": 0,         # Zéro perte de transaction tolérable
        "criticality": "CRITICAL",
        "financial_impact_per_hour_usd": 2_500_000,
        "regulatory_impact": "DORA Art. 12 — Notif. BCE < 4h"
    },
    {
        "process": "Portail Client Web Banking",
        "rto_hours": 4,
        "rpo_hours": 1,
        "criticality": "HIGH",
        "financial_impact_per_hour_usd": 150_000,
        "regulatory_impact": "NIS2 — Notif. ANSSI < 24h"
    },
    {
        "process": "Système de Reporting Interne",
        "rto_hours": 48,
        "rpo_hours": 24,
        "criticality": "MEDIUM",
        "financial_impact_per_hour_usd": 5_000,
        "regulatory_impact": "Aucun"
    }
]

# ─────────────────────────────────────────────────────────────────────────
# Risk Register IS — CISM Risk Treatment
# ─────────────────────────────────────────────────────────────────────────
risk_register = [
    {
        "risk_id": "R-001",
        "description": "Ransomware chiffrant les systèmes de paiement",
        "likelihood": 3,        # 1-5 : Possible
        "impact": 5,            # 1-5 : Critique
        "inherent_risk_score": 15,  # Likelihood × Impact
        "treatment": "MITIGATE",
        "controls": ["EDR Crowdstrike", "Backup immuable S3 Glacier", "Segmentation OT/IT"],
        "residual_risk_score": 4,
        "risk_owner": "CISO",
        "review_date": "2026-12-31"
    },
    {
        "risk_id": "R-002",
        "description": "Fuite de données clients via API non authentifiée",
        "likelihood": 2,
        "impact": 5,
        "inherent_risk_score": 10,
        "treatment": "MITIGATE",
        "controls": ["mTLS API Gateway", "Rate Limiting WAF", "Audit Macie"],
        "residual_risk_score": 2,
        "risk_owner": "Responsable Architecture",
        "review_date": "2026-09-30"
    },
    {
        "risk_id": "R-003",
        "description": "Indisponibilité d'un datacenter (sinistre physique)",
        "likelihood": 1,
        "impact": 5,
        "inherent_risk_score": 5,
        "treatment": "TRANSFER",   # Couverture par assurance cyber
        "controls": ["Assurance Cyber Lloyd's", "DR Site secondaire AWS eu-west-3"],
        "residual_risk_score": 2,
        "risk_owner": "CFO",
        "review_date": "2027-01-01"
    }
]

def print_bia_report():
    print("=== BUSINESS IMPACT ANALYSIS — PARADIS BANK ===\n")
    for p in business_processes:
        print(f"Processus : {p['process']}")
        print(f"  Criticité : {p['criticality']} | RTO : {p['rto_hours']}h | RPO : {p['rpo_hours']}h")
        print(f"  Impact financier/h : ${p['financial_impact_per_hour_usd']:,}")
        print()

    print("\n=== RISK REGISTER IS ===\n")
    for r in risk_register:
        status = "🔴" if r['inherent_risk_score'] >= 10 else "🟡" if r['inherent_risk_score'] >= 5 else "🟢"
        print(f"{status} [{r['risk_id']}] {r['description']}")
        print(f"   Score Inhérent : {r['inherent_risk_score']} → Résiduel : {r['residual_risk_score']} | Traitement : {r['treatment']}")

print_bia_report()
```

---

## 3) Module — Les 4 Stratégies de Risk Treatment CISM (2h)

```markdown
# STRATÉGIES DE TRAITEMENT DES RISQUES — CISM Domain 2

## 1. MITIGATE (Atténuer) — Réduire la probabilité ou l'impact
- Déployer des contrôles techniques (MFA, chiffrement, EDR)
- Exemple : Risque Phishing → Sensibilisation + Filtre Email + MFA

## 2. ACCEPT (Accepter) — Risque dans les limites du Risk Appetite
- Documenter la décision d'acceptation formelle (sign-off direction)
- Exemple : Risque faible (score 2/25) sur un système secondaire non critique

## 3. AVOID (Éviter) — Éliminer le risque en cessant l'activité
- Exemple : Abandonner un projet utilisant une technologie obsolète et non-patchable

## 4. TRANSFER (Transférer) — Reporter le risque résiduel sur un tiers
- Assurance cyber (Cyber Insurance — Lloyd's, AXA XL)
- Sous-traitance à un fournisseur SOC certifié ISO 27001
- Exemple : DR Site hébergé chez AWS + assurance perte d'exploitation

## Règle CISM Critique
L'organisation ne peut jamais transférer la **responsabilité** (accountability) du risque —
uniquement sa **gestion opérationnelle** (responsibility).
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **BIA** | Business Impact Analysis — Analyse d'impact sur l'activité métier |
| **RTO** | Recovery Time Objective — Durée maximale acceptable d'interruption d'un service |
| **RPO** | Recovery Point Objective — Perte de données maximale tolérée (exprimée en durée) |
| **Risk Register** | Registre documentant tous les risques identifiés, leur score et leur traitement |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans une BIA, que représente le **RTO (Recovery Time Objective)** ?
- A) La durée maximale acceptable pendant laquelle un processus métier peut être indisponible avant de causer un impact inacceptable pour l'organisation
- B) La quantité de données perdues tolérée
- C) Le budget de reprise après sinistre
- D) Le délai de notification réglementaire

**Réponse : A**

**Q2 :** Quelle stratégie de Risk Treatment CISM consiste à souscrire une **assurance cyber** pour couvrir les pertes financières en cas d'incident ?
- A) Transfer (Transfert du risque résiduel à un tiers — ex: assureur)
- B) Mitigate
- C) Accept
- D) Avoid

**Réponse : A**

**Q3 :** Dans un Risk Register CISM, comment calcule-t-on le **Score de Risque Inhérent** ?
- A) Probabilité (Likelihood) × Impact — avant application de tout contrôle de sécurité
- B) Impact ÷ Probabilité
- C) Impact + Probabilité + Coût de contrôle
- D) Impact × Coût de remédiation

**Réponse : A**

**Q4 :** Selon les bonnes pratiques CISM, quelle est la responsabilité finale (accountability) du **Risk Owner** pour un risque documenté dans le Risk Register ?
- A) Le Risk Owner est l'entité (CISO, Manager Métier) formellement responsable de la décision de traitement et du suivi du risque à long terme — cette responsabilité ne peut pas être transférée
- B) Le Risk Owner rédige uniquement les politiques techniques
- C) Le Risk Owner est le technicien qui corrige la vulnérabilité
- D) Le Risk Owner signe les contrats d'assurance

**Réponse : A**

**Q5 :** Dans quel cas la stratégie **Risk Avoid (Évitement)** est-elle appropriée ?
- A) Quand le coût de la mitigation est supérieur à la valeur de l'actif exposé, ou quand le risque est tellement élevé que l'activité concernée ne peut pas être rendue sûre à un coût raisonnable
- B) Quand le risque est très faible
- C) Quand l'assurance couvre l'intégralité du risque
- D) Quand le CISO valide le risque

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
