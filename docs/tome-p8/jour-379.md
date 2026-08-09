# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 379 (6h) : Security Metrics & KPIs for CISO Reporting — MTTR/MTTD Dashboards, FAIR Risk Quantification & Board-Level Executive Reporting

> [!NOTE]
> **Objectif du jour :** Maîtriser la conception et la communication des **métriques de cybersécurité** à destination des comités de direction et des conseils d'administration : définir et calculer les KPIs opérationnels SOC (**MTTD, MTTR, Alert Fatigue Rate, Coverage Rate**), quantifier le risque cyber en termes financiers avec le modèle **FAIR (Factor Analysis of Information Risk)** en calculant l'**Annual Loss Expectancy (ALE)**, et construire un **Tableau de Bord CISO** clair, décisionnel et orienté business.
>
> **Compétences visées :** `GRC-METRICS-01` (A) — SOC KPI Engineering (MTTD, MTTR, SLA) & Alert Fatigue Reduction | `GRC-METRICS-02` (A) — FAIR Risk Quantification, ALE Calculation & CISO Executive Dashboard Design

---

## 1) Module — Pyramide des KPIs de Sécurité & Modèle FAIR (2h)

### 📖 Narration/Intuition

Un CISO qui communique uniquement en termes techniques (nombre d'alertes, CVEs) à un Conseil d'Administration est **inaudible**. Le Board raisonne en **risque financier** et en **impact business**. La maîtrise du modèle FAIR (Factor Analysis of Information Risk) est la clé pour traduire le risque cyber en langage décisionnel.

```
   ┌─────────────────────────────────────────────────────────────────┐
   │              PYRAMIDE DES MÉTRIQUES DE SÉCURITÉ                 │
   │                                                                 │
   │   NIVEAU 3 — BOARD       ├──────────────────────────────────┤  │
   │   (Executives / CA)      │ ALE / Cyber Risk Appetite        │  │
   │                          │ ROI Sécurité / Insurance Gap     │  │
   │   NIVEAU 2 — CISO        ├──────────────────────────────────┤  │
   │   (Management)           │ MTTD / MTTR / Coverage Rate      │  │
   │                          │ Posture Score / Compliance %     │  │
   │   NIVEAU 1 — SOC         ├──────────────────────────────────┤  │
   │   (Opérationnel)         │ Nb Alertes / FP Rate / SLA Tiers │  │
   │                          │ Règles Actives / Hunt Coverage   │  │
   └─────────────────────────────────────────────────────────────────┘
```

#### Modèle FAIR — Calcul de l'ALE (Annual Loss Expectancy)

$$ALE = ARO \times ALE_{event} = ARO \times (EF \times AV)$$

Où :
- $ARO$ = **Annual Rate of Occurrence** (Fréquence annuelle estimée de l'incident)
- $EF$ = **Exposure Factor** (Pourcentage de l'actif affecté — entre 0 et 1)
- $AV$ = **Asset Value** (Valeur de l'actif en euros)

*Exemple : Un ransomware qui toucherait un serveur Core Banking (valeur 5M€) avec une probabilité de 0.3 fois/an et un facteur d'exposition de 60% génère un ALE de :*
$$ALE = 0.3 \times (0.6 \times 5\,000\,000) = 0.3 \times 3\,000\,000 = \mathbf{900\,000€/an}$$

---

## 2) Module — Outillage CISO KPI & FAIR Engine (`ciso_metrics_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import math
from datetime import datetime, timezone
from typing import List, Dict

class CISOMetricsEngine:
    """
    Moteur de calcul des KPIs de Sécurité SOC et de Quantification du Risque FAIR.
    Génère le Tableau de Bord CISO destiné au Comité de Direction.
    """

    def __init__(self, organization: str, reporting_period_days: int = 30):
        self.org = organization
        self.period = reporting_period_days
        self.soc_events: List[dict] = []
        self.fair_risks: List[dict] = []

    def record_soc_event(self, alert_id: str, detected_at: float, responded_at: float,
                          resolved_at: float, is_true_positive: bool):
        """Enregistre un événement SOC avec ses timestamps pour le calcul des KPIs."""
        ttd = responded_at - detected_at   # Time to Detect (secondes)
        ttr = resolved_at - responded_at   # Time to Respond (secondes)
        self.soc_events.append({
            "alert_id": alert_id,
            "ttd_seconds": round(ttd),
            "ttr_seconds": round(ttr),
            "is_true_positive": is_true_positive
        })

    def compute_soc_kpis(self) -> dict:
        """Calcule les KPIs opérationnels SOC : MTTD, MTTR, TP Rate, Alert Fatigue Rate."""
        if not self.soc_events:
            return {}

        total = len(self.soc_events)
        true_positives = [e for e in self.soc_events if e["is_true_positive"]]
        false_positives = [e for e in self.soc_events if not e["is_true_positive"]]

        avg_ttd = sum(e["ttd_seconds"] for e in self.soc_events) / total
        avg_ttr = sum(e["ttr_seconds"] for e in true_positives) / max(len(true_positives), 1)

        tp_rate = len(true_positives) / total * 100
        fp_rate = len(false_positives) / total * 100  # Alert Fatigue = FP Rate élevé

        return {
            "reporting_period_days": self.period,
            "total_alerts": total,
            "true_positive_count": len(true_positives),
            "false_positive_count": len(false_positives),
            "mttd_minutes": round(avg_ttd / 60, 1),
            "mttr_minutes": round(avg_ttr / 60, 1),
            "true_positive_rate_pct": round(tp_rate, 1),
            "alert_fatigue_rate_pct": round(fp_rate, 1),
            "sla_status": "✅ CONFORME" if avg_ttr / 60 < 60 else "❌ SLA DÉPASSÉ (> 60 min)"
        }

    def add_fair_risk(self, risk_name: str, asset_name: str,
                       asset_value_eur: float, aro: float, exposure_factor: float) -> dict:
        """
        Calcule l'ALE (Annual Loss Expectancy) selon le modèle FAIR.
        ALE = ARO × (EF × AV)
        """
        single_loss_expectancy = exposure_factor * asset_value_eur
        ale = aro * single_loss_expectancy

        risk = {
            "risk_name": risk_name,
            "asset": asset_name,
            "asset_value_eur": asset_value_eur,
            "aro_per_year": aro,
            "exposure_factor_pct": round(exposure_factor * 100),
            "sle_eur": round(single_loss_expectancy, 2),
            "ale_eur_per_year": round(ale, 2),
            "financial_risk_category": "CRITIQUE" if ale > 1_000_000 else "ÉLEVÉ" if ale > 100_000 else "MODÉRÉ"
        }
        self.fair_risks.append(risk)
        return risk

    def generate_ciso_board_report(self) -> dict:
        soc_kpis = self.compute_soc_kpis()
        total_ale = sum(r["ale_eur_per_year"] for r in self.fair_risks)
        return {
            "organization": self.org,
            "report_date": datetime.now(timezone.utc).isoformat(),
            "executive_summary": {
                "soc_health": soc_kpis,
                "total_cyber_risk_ale_eur": round(total_ale, 2),
                "top_financial_risks": sorted(self.fair_risks, key=lambda x: -x["ale_eur_per_year"])[:3]
            }
        }

# Démonstration
engine = CISOMetricsEngine("PARADIS GLOBAL BANK")

print("=== CISO METRICS & FAIR RISK QUANTIFICATION ENGINE ===")

# Enregistrement d'événements SOC du mois
base = 1723140000.0
engine.record_soc_event("ALT-001", base,          base+180,   base+1800,   True)   # TP : MTTR 27min
engine.record_soc_event("ALT-002", base+3600,     base+3700,  base+3720,   False)  # FP rapide
engine.record_soc_event("ALT-003", base+7200,     base+7400,  base+10600,  True)   # TP : MTTR 54min
engine.record_soc_event("ALT-004", base+14400,    base+14500, base+14520,  False)  # FP

# Calculs FAIR
engine.add_fair_risk("Ransomware Serveur Core Banking", "DB-CORE-BANKING-01", 5_000_000, aro=0.3, exposure_factor=0.6)
engine.add_fair_risk("Exfiltration Données Clients", "CRM-DB-PROD", 2_000_000, aro=0.15, exposure_factor=0.8)
engine.add_fair_risk("Phishing Compte Administrateur", "AD-DOMAIN-CONTROLLER", 3_000_000, aro=0.5, exposure_factor=0.4)

print("\n=== CISO EXECUTIVE BOARD REPORT ===")
print(json.dumps(engine.generate_ciso_board_report(), indent=2, ensure_ascii=False))
```

---

## 3) Module — Template du Tableau de Bord CISO (2h)

```markdown
# CISO EXECUTIVE DASHBOARD — MENSUEL — PARADIS GLOBAL BANK

## 🔴 Cyber Risk Financier (FAIR ALE)
| Scénario de Risque | Actif Concerné | ALE (€/an) | Priorité |
|:---|:---|---:|:---:|
| Ransomware Core Banking | DB-CORE-BANKING-01 | 900 000 € | **CRITIQUE** |
| Exfiltration Données CRM | CRM-DB-PROD | 240 000 € | ÉLEVÉ |
| Phishing Compte Admin | AD Domain Controller | 600 000 € | **CRITIQUE** |
| **TOTAL RISQUE CYBER** | | **1 740 000 €/an** | |

## 🟡 KPIs Opérationnels SOC (Mois en cours)
| KPI | Valeur | SLA | Statut |
|:---|---:|---:|:---:|
| **MTTD** (Mean Time to Detect) | 3.3 min | < 15 min | ✅ |
| **MTTR** (Mean Time to Respond) | 40.5 min | < 60 min | ✅ |
| **Alert Fatigue Rate** (Faux Positifs) | 50% | < 20% | ❌ |
| **True Positive Rate** | 50% | > 80% | ❌ |
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **FAIR** | Factor Analysis of Information Risk — Modèle de quantification financière du risque cyber |
| **ALE** | Annual Loss Expectancy — Perte financière annuelle estimée pour un scénario de risque donné |
| **MTTD** | Mean Time to Detect — Délai moyen entre le début d'un incident et sa détection |
| **MTTR** | Mean Time to Respond — Délai moyen entre la détection d'un incident et sa résolution |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle est la formule du modèle **FAIR** pour calculer l'**ALE (Annual Loss Expectancy)** ?
- A) $ALE = ARO \times (EF \times AV)$ — soit la fréquence annuelle multipliée par la perte unique estimée
- B) $ALE = AV + ARO$
- C) $ALE = AV / EF$
- D) $ALE = EF \times 12$

**Réponse : A**

**Q2 :** Pourquoi un **Alert Fatigue Rate élevé** (taux de Faux Positifs > 50%) est-il dangereux dans un SOC ?
- A) Il épuise cognitivement les analystes, augmentant le risque de manquer un vrai incident critique noyé dans le bruit d'alertes non pertinentes
- B) Il réduit la consommation électrique des serveurs
- C) Il améliore le MTTR
- D) Il signale que l'EDR est mal configuré uniquement

**Réponse : A**

**Q3 :** Quelle est la différence entre le **MTTD** et le **MTTR** dans les KPIs SOC ?
- A) MTTD mesure le délai entre le début de l'incident et sa **détection** par le SOC ; MTTR mesure le délai entre la détection et la **résolution complète** de l'incident
- B) Ce sont des synonymes
- C) MTTR ne s'applique qu'aux serveurs Linux
- D) MTTD s'applique uniquement aux incidents réseau

**Réponse : A**

**Q4 :** Pourquoi est-il stratégiquement important pour un CISO de présenter le risque cyber en termes d'**ALE financier** au Conseil d'Administration plutôt qu'en nombre de CVEs ?
- A) Parce que le Board raisonne en termes de risque financier et d'impact business — l'ALE traduit la menace cyber dans leur langage décisionnel, facilitant l'obtention de budgets sécurité
- B) Parce que les CVEs sont confidentielles
- C) Parce que l'ALE est plus rapide à calculer
- D) Parce que les membres du Board sont des experts en cybersécurité

**Réponse : A**

**Q5 :** Dans le calcul FAIR, que représente le facteur **EF (Exposure Factor)** ?
- A) Le pourcentage de valeur de l'actif qui serait détruit ou perdu lors de la matérialisation d'un scénario de risque spécifique (entre 0 et 1)
- B) Le coût annuel de l'abonnement à un logiciel
- C) Le nombre d'employés impactés
- D) La durée de la panne en heures

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
