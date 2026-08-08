# TOME P7 — Certifications d'Élite & Spécialisations — Jour 348 (6h) : Négociation Salariale & Marché de l'Emploi International (CDI, Freelance / Contracting, Advisory & Grilles Tarifaires TJM / Total Compensation)

> [!NOTE]
> **Objectif du jour :** Maîtriser la **négociation salariale et la stratégie de carrière à haute valeur ajoutée** pour les profils Cyber d'Élite (Master 2) sur les marchés internationaux (Londres, Zurich, Paris, Singapour, USA, Remote) : analyser les grilles de rémunération (**Total Compensation - Base + Bonus + Equity/RSUs**), évaluer les modèles d'exercice (**CDI d'Élite, Freelance / TJM High-End, Advisory / Board Member**), et utiliser des techniques de négociation fondées sur les données.
>
> **Compétences visées :** `CAREER-05` (A) — Total Compensation Negotiation & TJM Rate Benchmark | `CAREER-06` (A) — Advisory & International Contracting Engineering

---

## 1) Module — Benchmark des Rémunérations Internationales Cyber (2h)

### 📖 Narration/Intuition

Les compétences validées au Semestre 7 (OSCP+, CKS, AWS Security, CISM, CISSP, GREM, OSED) positionnent le diplômé dans le **top 5% mondial** des experts en sécurité des systèmes d'information.

```
Modèles d'Exercice & Rémunérations Cibles (Marché 2026)
┌────────────────────────────────────────────────────────┐
│ 1. CDI / Salarié d'Élite (VP Cyber / Principal Architect)│
│    - Paris/UE : 90k€ - 150k€ Total Comp / an           │
│    - Londres/Suisse/USA : 160k$ - 350k$ Total Comp / an│
├────────────────────────────────────────────────────────┤
│ 2. Freelance / Expert Indépendant (TJM High-End)       │
│    - TJM France/UE : 750€ - 1 400€ / jour             │
│    - TJM International / US Remote : 1 000$ - 2 000$ /j│
├────────────────────────────────────────────────────────┤
│ 3. Advisory / Strategic Board Consultant               │
│    - Facturation au forfait d'audit / Equity Retainer  │
└────────────────────────────────────────────────────────┘
```

---

## 2) Module — Calculateur de Rémunération & TJM (`compensation_calculator.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json

class CyberCompensationCalculator:
    """
    Calculateur et comparateur de Total Compensation (CDI vs Freelance / TJM).
    """

    @staticmethod
    def calculate_freelance_annual_net(tjm: float, working_days: int = 210, overhead_pct: float = 0.25) -> dict:
        """
        Calcule le chiffre d'affaires et le revenu net estimé pour un Expert Indépendant.
        overhead_pct: Charges sociales, assurances, comptabilité, outils (25%).
        """
        gross_turnover = tjm * working_days
        net_before_tax = gross_turnover * (1 - overhead_pct)
        monthly_equivalent = net_before_tax / 12

        return {
            "model": "FREELANCE_CONTRACTING",
            "tjm": tjm,
            "working_days_per_year": working_days,
            "gross_turnover_annual": gross_turnover,
            "estimated_net_annual": net_before_tax,
            "estimated_net_monthly": round(monthly_equivalent, 2)
        }

    @staticmethod
    def calculate_total_compensation_cdi(base_salary: float, bonus_pct: float, equity_annual_usd: float) -> dict:
        """
        Calcule la Total Compensation (TC) pour un poste de Principal / Lead Cyber.
        """
        bonus_amount = base_salary * (bonus_pct / 100)
        total_comp = base_salary + bonus_amount + equity_annual_usd

        return {
            "model": "CDI_EXECUTIVE_SALARIED",
            "base_salary": base_salary,
            "bonus_amount": bonus_amount,
            "equity_annual": equity_annual_usd,
            "total_compensation_annual": total_comp
        }

# Exécution du benchmark
calculator = CyberCompensationCalculator()

print("=== EVALUATION DES MODÈLES DE RÉMUNÉRATION CYBER ===")
freelance_scenario = calculator.calculate_freelance_annual_net(tjm=1100.0, working_days=215)
print("\n[+] Scénario Freelance High-End (TJM 1 100€) :")
print(json.dumps(freelance_scenario, indent=2, ensure_ascii=False))

cdi_scenario = calculator.calculate_total_compensation_cdi(base_salary=120000.0, bonus_pct=20.0, equity_annual_usd=35000.0)
print("\n[+] Scénario CDI Principal Security Architect (Total Comp) :")
print(json.dumps(cdi_scenario, indent=2, ensure_ascii=False))
```

---

## 3) Module — Techniques de Négociation & Batna Strategy (2h)

```markdown
# STRATÉGIE DE NÉGOCIATION SALARIALE & BATNA

## 1. Principe du BATNA (Best Alternative to a Negotiated Agreement)
Ne jamais entrer en négociation sans avoir établi au préalable son BATNA (une offre concurrente solide ou la possibilité de démarrer une mission Freelance à TJM élevé).

## 2. Règle du Anchoring (Ancrage de la Négociation)
- Ne donnez jamais votre salaire actuel.
- Fournissez une fourchette haute basée sur les données du marché mondial (ex: "Mes prétentions pour un poste de Principal Architect avec responsabilité de gouvernance et Red Team sont entre 140k€ et 165k€ Total Comp").

## 3. Négociation des Éléments Hors-Salaire (Perks & Flexibility)
Si le salaire fixe est plafonné par les grilles internes de l'entreprise, négocier :
- **Budget de Formation & Certifications annuel** (ex. 10 000€/an pour SANS/OffSec).
- **Télétravail Full Remote / Subvention Home Office**.
- **Bonus de Signature (Signing Bonus)** pour compenser la perte de droits ou de variable.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **TJM** | Taux Journalier Moyen — Tarif de facturation par jour pour un consultant ou expert indépendant |
| **BATNA** | Best Alternative to a Negotiated Agreement — Meilleure solution de repli lors d'une négociation |
| **RSU** | Restricted Stock Units — Actions de l'entreprise attribuées aux salariés sur plusieurs années (Vesting) |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Qu'est-ce que le **Total Compensation (TC)** lors de l'évaluation d'une offre d'emploi exécutif en cybersécurité ?
- A) La somme globale comprenant le salaire de base fixe, le bonus variable annuel et la valeur annuelle des actions/RSUs ou stock-options accordées
- B) Le salaire net après impôts uniquement
- C) Le remboursement des frais de transport
- D) Le budget du département informatique

**Réponse : A**

**Q2 :** Pourquoi est-il recommandé d'utiliser le principe du **BATNA** avant d'entamer une négociation salariale ?
- A) Parce qu'avoir une alternative solide (autre offre ou mission freelance) permet de négocier en position de force et de refuser une offre sous-évaluée sans risque
- B) Pour obtenir un visa de travail
- C) Pour réduire les impôts
- D) Pour obtenir plus de congés payés

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
