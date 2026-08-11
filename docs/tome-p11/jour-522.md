# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 522 (6h) : CISO Leadership & Alignement Business : Reporting au Conseil d'Administration, Communication Exécutive & ROSI (Return on Security Investment)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le rôle de leadership du **CISO / RSSI** et l'alignement de la stratégie de sécurité sur les objectifs business de l'entreprise
> - Calculer le retour sur investissement en sécurité **ROSI (Return on Security Investment)**
> - Structurer et présenter un rapport de sécurité synthétique devant le Conseil d'Administration (Board Reporting)
> - Gérer le budget de sécurité et justifier les investissements technologiques et humains auprès du CFO et du CEO
>
> **Compétences visées :** `POL-01` (A), `POL-02` (A) — Executive Security Leadership & ROSI

---

## Module 1 — Le Rôle du CISO & la Communication Exécutive (2h)

### 📖 Intuition & Narration

Le rôle du RSSI (CISO — Chief Information Security Officer) a profondément évolué ces dernières années. Auparavant perçu comme un expert technique enfermé dans la salle des serveurs, le CISO moderne est un **dirigeant exécutif** qui siège ou rapporte directement au Conseil d'Administration (Board of Directors).

Un Conseil d'Administration ne comprend pas le jargon technique (ex: "Nous avons corrigé 50 vulnérabilités XSS et mis à jour le CNI Cilium"). Le Board raisonne en termes de :
- **Risques métier** (Continuité des ventes, fuite de secrets industriels, sanctions RGPD).
- **Finances & Coûts** (Budget, impact sur la marge, coût d'une interruption).
- **Réputation & Marque** (Confiance des clients B2B, image publique).

La mission du CISO est de traduire la complexité technique en décisions d'investissement claires.

### 🔍 Anatomie Technique — La Formule du ROSI (Return on Security Investment)

```
FORMULE DU ROSI (RETURN ON SECURITY INVESTMENT)

           ( ALE × Risk Reduction % ) - Annual Cost of Security Solution
  ROSI = ──────────────────────────────────────────────────────────────────
                       Annual Cost of Security Solution

LÉGENDE :
  • ALE (Annual Loss Expectancy) : Perte financière annuelle estimée sans la solution.
  • Risk Reduction % : Pourcentage d'efficacité de la solution de sécurité (ex: 80%).
  • Annual Cost : Coût annuel de la solution (licence + maintenance + ressources).

INTERPRÉTATION DU RÉSULTAT ROSI :
  • ROSI > 0%  (ex: +150%) ──► L'investissement en sécurité est rentabilisé !
  • ROSI < 0%             ──► La solution coûte plus cher que les pertes évitées.
```

---

## Module 2 — Atelier Pratique : Calculateur de ROSI & Board Report Generator (2h)

### 🛠️ Code Python : Executive ROSI Calculator & Board Dashboard Engine

```python
#!/usr/bin/env python3
"""
PARADIS — CISO Executive ROSI Calculator & Board Reporting Engine
Calcule le retour sur investissement des projets de sécurité et génère le rapport synthétique pour le Board.
"""

import json
import sys

def calculate_rosi(ale_eur: float, risk_reduction_pct: float, annual_cost_eur: float) -> dict:
    """Calcule le ROSI (Return on Security Investment)."""
    monetary_risk_reduced = ale_eur * (risk_reduction_pct / 100.0)
    net_benefit = monetary_risk_reduced - annual_cost_eur
    rosi_pct = (net_benefit / annual_cost_eur * 100.0) if annual_cost_eur > 0 else 0.0

    return {
        "ale_without_control_eur": ale_eur,
        "risk_reduced_eur": monetary_risk_reduced,
        "solution_annual_cost_eur": annual_cost_eur,
        "net_benefit_eur": net_benefit,
        "rosi_pct": round(rosi_pct, 1)
    }

class BoardReportGenerator:
    def __init__(self, ciso_name: str, period: str):
        self.ciso_name = ciso_name
        self.period = period

    def build_report(self, rosi_data: dict) -> dict:
        print("=== GÉNÉRATION DU RAPPORT DE SÉCURITÉ POUR LE CONSEIL D'ADMINISTRATION ===")
        return {
            "title": "Rapport Synthétique de Sécurité du SI — Conseil d'Administration",
            "ciso": self.ciso_name,
            "period": self.period,
            "executive_summary": "La posture de sécurité s'est renforcée. L'investissement dans la plateforme DevSecOps et le SOAR présente un retour positif.",
            "key_metrics": {
                "cyber_insurance_compliance": "100%",
                "critical_incidents_count": 0,
                "project_rosi": f"{rosi_data['rosi_pct']:+.1f}%",
                "net_financial_benefit": f"{rosi_data['net_benefit_eur']:,.0f} €"
            },
            "board_recommendations": [
                "Approuver le budget pour le déploiement du Zero-Trust ZTNA en Q3.",
                "Maintenir le programme de sensibilisation anti-phishing pour l'ensemble du personnel."
            ]
        }

if __name__ == "__main__":
    # Projet : Déploiement d'un SOAR + DevSecOps
    # ALE estimé d'une crise cyber majeure = 800 000 € / an
    # Réduction du risque grâce au projet = 75%
    # Coût annuel de la plateforme = 150 000 €
    rosi_res = calculate_rosi(ale_eur=800000.0, risk_reduction_pct=75.0, annual_cost_eur=150000.0)

    print(f"[*] Analyse financière du projet DevSecOps/SOAR :")
    print(f"    - Risque financier initial (ALE) : {rosi_res['ale_without_control_eur']:,.0f} €")
    print(f"    - Risque financier évité        : {rosi_res['risk_reduced_eur']:,.0f} €")
    print(f"    - Coût de la solution            : {rosi_res['solution_annual_cost_eur']:,.0f} €")
    print(f"    - Bénéfice net annuel            : {rosi_res['net_benefit_eur']:,.0f} €")
    print(f"    - ROSI calculé                   : {rosi_res['rosi_pct']:+.1f}%")

    generator = BoardReportGenerator("Adolphe (CISO)", "2024-H1")
    board_report = generator.build_report(rosi_res)

    print("\n" + "═"*70)
    print("  RAPPORT CONSEIL D'ADMINISTRATION (EXECUTIVE BOARD REPORT)")
    print("═"*70)
    print(json.dumps(board_report, indent=2))
    print("═"*70)
```

---

## Module 3 — Alignement Business & Budgétisation Sécurité (1h30)

### 🔍 Stratégie de Budgétisation CISO

Le budget de sécurité informatique représente généralement **5% à 15% du budget informatique global (IT Budget)** d'une entreprise.

Pour justifier une augmentation de budget devant le CFO (Directeur Financier), le CISO doit lier la sécurité aux objectifs de croissance de l'entreprise :
- *"Sans certification ISO 27001 et rapport SOC 2 Type II, nous ne pouvons pas signer les contrats Enterprise avec nos clients américains (Perte de chiffre d'affaires potentiel : 5M€)."*

La sécurité devient un **accélérateur de business** (Business Enabler) et non plus un centre de coûts.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ROSI** | Return on Security Investment — Retour sur investissement en sécurité |
| **CISO** | Chief Information Security Officer — Directeur de la Sécurité des SI |
| **CFO** | Chief Financial Officer — Directeur Financier |
| **CEO** | Chief Executive Officer — Directeur Général |

---

## Exercices Pratiques

### Exercice 1 — Calcul de ROSI

Un projet de déploiement d'un scanner SAST/SCA et d'une solution de gestion des patchs coûte **50 000 €/an**.
L'ALE (Perte annuelle estimée) due aux failles applicatives était de **200 000 €/an**. La solution permet de réduire ce risque de **80%**.

1. Calculez la valeur financière du risque évité.
2. Calculez le **ROSI (%)**.

**Corrigé guidé :**
1. **Risque évité :**
$$\text{Risque Évité} = 200\,000 \text{ €} \times 80\% = \mathbf{160\,000 \text{ € / an}}$$

2. **ROSI (%) :**
$$\text{ROSI} = \frac{160\,000 - 50\,000}{50\,000} \times 100 = \frac{110\,000}{50\,000} \times 100 = \mathbf{+220\%}$$
L'investissement est rentabilisé à hauteur de **220%**.

---

## Banque QCM — 5 Questions

**Q1.** Que mesure l'indicateur **ROSI (Return on Security Investment)** ?

- A) Le nombre de spams reçus par jour.
- B) Le rendement financier d'un investissement de sécurité en comparant les pertes financières évitées au coût de la solution. ✅
- C) La température de la salle des serveurs.
- D) Le salaire des stagiaires.

**Q2.** Comment un RSSI / CISO doit-il présenter ses rapports devant le Conseil d'Administration (Board) ?

- A) En utilisant le jargon technique le plus obscur possible.
- B) En traduisant les risques techniques en impacts métier, financiers, opérationnels et réputationnels synthétiques. ✅
- C) En apportant des pièces de serveurs démontées.
- D) En ne se présentant pas.

**Q3.** Quel pourcentage moyen du budget informatique global (IT Budget) est généralement alloué à la cybersécurité dans une entreprise mature ?

- A) 0.01%.
- B) 5% à 15%. ✅
- C) 99%.
- D) 100%.

**Q4.** Comment le CISO peut-il transformer la sécurité en un **accélérateur de business (Business Enabler)** ?

- A) En bloquant toutes les connexions internet.
- B) En obtenant des certifications (ISO 27001, SOC 2) qui permettent à l'entreprise de remporter de nouveaux contrats commerciaux auprès de grands comptes exigents. ✅
- C) En interdisant l'utilisation des ordinateurs.
- D) En vendant du matériel d'occasion.

**Q5.** Dans la formule du ROSI, que représente la variable **ALE (Annual Loss Expectancy)** ?

- A) L'estimation de la perte financière annuelle subie en l'absence de mesure de sécurité. ✅
- B) L'âge moyen des serveurs.
- C) La vitesse du réseau Wi-Fi.
- D) La durée des réunions.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
