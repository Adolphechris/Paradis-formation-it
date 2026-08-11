# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 555 (6h) : FinOps Cloud Avancé : Cost Allocation, Commitment Discounts & GreenOps Carbon Footprint

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le cadre de maturité **FinOps Foundation** (Inform, Optimize, Operate) dans des environnements Multi-Cloud (AWS, Azure, GCP)
> - Concevoir une stratégie d'**allocation précise des coûts (Cost Allocation & Tagging)** avec répartition des coûts partagés (Shared Costs)
> - Maximiser l'effet des **Commitment Discounts** (Reserved Instances, Savings Plans) pour réduire la facture cloud de 30% à 60%
> - Intégrer les métriques **GreenOps (Carbon Footprint)** pour mesurer et minimiser l'empreinte carbone des workloads cloud
>
> **Compétences visées :** `CLD-02` (A), `POL-02` (A) — FinOps, Cloud Governance, GreenOps

---

## Module 1 — Le Cadre FinOps & Allocation des Coûts (2h)

### 📖 Intuition & Narration

Le cloud a transformé l'informatique d'une dépense d'investissement (CapEx — Capital Expenditure : achat de serveurs amortis sur 5 ans) en une dépense d'exploitation (OpEx — Operational Expenditure : facturation à la seconde).

Cette flexibilité est extraordinaire, mais sans gouvernance, elle mène au **drame de la facture cloud incontrôlée** : une équipe oublie de couper un cluster Kubernetes de test avec GPU et génère 20 000€ de surcoût pendant le week-end.

Le **FinOps (Financial Operations)** n'est pas "dépenser le moins possible", mais **maximiser la valeur business de chaque euro dépensé dans le cloud**.

### 🔍 Les 3 Phases du Cycle FinOps

```
LE CYCLE FINOPS (FINOPS FOUNDATION)

  1. INFORM (Informer & Visualiser)
     ├── Allocation 100% des coûts via tagging (Owner, Environment, CostCenter)
     ├── Dashboards de coûts en temps réel (CloudHealth, Kubecost)
     └── Détection des anomalies de consommation (< 2h)

  2. OPTIMIZE (Optimiser)
     ├── Rightsizing : Réduire la taille des VMs/Pods surdimensionnés
     ├── Cleaning : Supprimer les ressources orphelines (EIP, EBS non attachés)
     └── Commitments : Réservations 1 ou 3 ans (Savings Plans / RIs)

  3. OPERATE (Opérer & Gérer)
     ├── Intégration dans le CI/CD (Infracost : estimation du coût par PR)
     ├── Auto-stopping des environnements non-prod le week-end
     └── KPIs FinOps intégrés aux OKRs d'ingénierie
```

---

## Module 2 — Commitment Discounts & GreenOps (2h)

### 🔍 Commitment Discounts — Réductions par Engagement

Les fournisseurs cloud accordent d'importantes réductions en échange d'un engagement d'utilisation sur 1 ou 3 ans :

```
TYPES D'ENGAGEMENTS ET REMISES

  MÉCANISME             │ FLEXIBILITÉ        │ REMISE MOYENNE │ CAS D'USAGE
  ──────────────────────┼────────────────────┼────────────────┼──────────────────────────────
  AWS Savings Plans     │ Élevée (Changement │ ~30% à 50%     │ Workloads stables et
  (Compute)             │ de région/instance)│                │ prévisibles
  ──────────────────────┼────────────────────┼────────────────┼──────────────────────────────
  Reserved Instances    │ Faible (Instance & │ ~40% à 65%     │ Bases de données RDS/SQL
  (Standard)            │ Région spécifiques)│                │ qui ne bougent jamais
  ──────────────────────┼────────────────────┼────────────────┼──────────────────────────────
  Spot Instances /      │ Nulle (Interruption│ ~70% à 90%     │ Batch processing, CI/CD,
  Preemptible           │ possible avec 2min)│                │ workloads stateless résilients
```

### 🔍 GreenOps — Empreinte Carbone du Cloud

Le **GreenOps** (ou Cloud Sustainability) applique la démarche FinOps à la réduction des émissions de gaz à effet de serre (CO₂e). Moins de serveurs inutiles = moins d'électricité consommée = moins de CO₂.

$$\text{PUE (Power Usage Effectiveness)} = \frac{\text{Énergie Totale Datacenter}}{\text{Énergie Équipements IT}}$$

Les grands clouds affichent un PUE de 1.1 à 1.2 (contre 1.6 à 2.0 pour un datacenter on-premise traditionnel).

---

## Module 3 — Calculateur FinOps & Infracost Automation (1h30)

### 🛠️ Script Python : Multi-Cloud FinOps & Carbon Footprint Calculator

```python
#!/usr/bin/env python3
"""
PARADIS — Multi-Cloud FinOps & Carbon Footprint Calculator
Calcule l'optimisation financière (Rightsizing + Savings Plans) et l'empreinte carbone d'une infrastructure.
"""
from dataclasses import dataclass

@dataclass
class CloudResource:
    name: str
    provider: str         # AWS | AZURE | GCP
    monthly_cost_usd: float
    cpu_utilization_avg_pct: float  # % moyen d'utilisation CPU
    is_reserved: bool
    region: str           # ex: eu-west-3 (France), us-east-1

class FinOpsEngine:
    # Facteur d'émission CO2 gCO2e / kWh selon la région (mix énergétique)
    CARBON_INTENSITY_G_KWH = {
        "eu-west-3": 55,   # France (Nucléaire = très bas CO2)
        "eu-central-1": 380, # Allemagne (Charbon/Gaz)
        "us-east-1": 350,   # USA (Virginnie)
    }

    def __init__(self, resources: list[CloudResource]):
        self.resources = resources

    def analyze(self):
        total_cost = sum(r.monthly_cost_usd for r in self.resources)
        potential_savings = 0.0
        total_co2_kg = 0.0

        print("=" * 70)
        print("  PARADIS FINOPS & GREENOPS ENGINE — AUDIT MULTI-CLOUD")
        print("=" * 70)
        print()

        for r in self.resources:
            recommendation = "OK"
            item_savings = 0.0

            # 1. Détection Surdimensionnement (Rightsizing)
            if r.cpu_utilization_avg_pct < 15.0:
                item_savings += r.monthly_cost_usd * 0.50  # 50% de gain en réduisant de taille
                recommendation = f"RIGHTSIZING — CPU < 15% ({r.cpu_utilization_avg_pct}%). Réduire de moitié."

            # 2. Détection absence de réservation
            elif not r.is_reserved and r.monthly_cost_usd > 200:
                item_savings += r.monthly_cost_usd * 0.35  # 35% de remise Savings Plan
                recommendation = f"SAVINGS PLAN — Activer engagement 1 ou 3 ans."

            potential_savings += item_savings

            # 3. Calcul Carbone Estimé (Base 1 VM moyenne = ~100W = 0.1 kWh * 720h = 72 kWh/mois)
            carbon_intensity = self.CARBON_INTENSITY_G_KWH.get(r.region, 300)
            vm_co2_kg = (72.0 * carbon_intensity) / 1000.0
            total_co2_kg += vm_co2_kg

            icon = "⚠️" if item_savings > 0 else "✅"
            print(f"  {icon} [{r.provider}] {r.name:<25} | Coût: ${r.monthly_cost_usd:7.2f}/m | Region: {r.region}")
            print(f"     CPU Moyen : {r.cpu_utilization_avg_pct:4.1f}% | Réservé: {r.is_reserved}")
            print(f"     Recommandation : {recommendation}")
            if item_savings > 0:
                print(f"     Economie Estimée : ${item_savings:.2f} / mois")
            print()

        new_cost = total_cost - potential_savings
        savings_percent = (potential_savings / total_cost) * 100 if total_cost > 0 else 0

        print("─" * 70)
        print(f"  💰 COÛT ACTUEL MENSUEL   : ${total_cost:,.2f}")
        print(f"  🎯 ÉCONOMIES POTENTIELLES : ${potential_savings:,.2f} / mois ({savings_percent:.1f}%)")
        print(f"  📉 NOUVEAU COÛT CIBLE    : ${new_cost:,.2f} / mois")
        print(f"  🌱 EMPREINTE CARBONE TOTAL : {total_co2_kg:.1f} kg CO2e / mois")
        print("=" * 70)


if __name__ == "__main__":
    test_resources = [
        CloudResource("srv-db-prod-01", "AWS", 1200.0, 65.0, True, "eu-west-3"),
        CloudResource("srv-k8s-worker-01", "AWS", 800.0, 8.0, False, "eu-central-1"), # CPU très bas -> Rightsizing
        CloudResource("srv-api-backend", "AZURE", 450.0, 45.0, False, "eu-west-3"),   # Non réservé -> Savings Plan
        CloudResource("srv-test-dev", "GCP", 350.0, 5.0, False, "us-east-1"),          # Dev inutilisé -> Auto-stop/Rightsizing
    ]

    engine = FinOpsEngine(test_resources)
    engine.analyze()
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **FinOps** | Financial Operations — Pratique de gouvernance de la valeur et des coûts cloud |
| **GreenOps** | Démarche d'optimisation de l'empreinte carbone et de la durabilité environnementale du SI |
| **CapEx / OpEx** | Capital Expenditure (Investissement matériel) / Operational Expenditure (Dépense d'usage à la demande) |
| **PUE** | Power Usage Effectiveness — Ratio d'efficacité énergétique des datacenters (cible ideal = 1.0) |
| **Infracost** | Outil open-source estimant le coût cloud d'un changement Terraform directement dans la Pull Request |

---

## Exercices Pratiques

### Exercice 1 — Optimisation d'un Budget Cloud

Une entreprise dépense **50 000 € / mois** sur AWS sans aucune réservation ni tagging. Son infrastructure comporte :
- 60% de serveurs de production stables actifs 24h/24.
- 40% d'environnements de développement/staging actifs seulement pendant les heures de bureau (50h par semaine sur 168h).

Proposez un plan d'action FinOps en 2 étapes et calculez les économies mensuelles estimées.

**Corrigé guidé :**
1. **Étape 1 : Auto-stopping des dev/staging hors heures de bureau** :
   - Les dev/staging représentent 40% de 50 000€ = 20 000€/mois.
   - En les coupant la nuit et le week-end (50h/168h ≈ 30% du temps d'utilisation), le coût passe de 20 000€ à 6 000€.
   - **Économie Étape 1 = 14 000€ / mois**.
2. **Étape 2 : Savings Plans ( Compute 3 ans) sur la production stable** :
   - La prod représente 30 000€/mois.
   - En souscrivant un Savings Plan 3 ans, on obtient environ 40% de remise.
   - Le coût prod passe de 30 000€ à 18 000€.
   - **Économie Étape 2 = 12 000€ / mois**.
3. **Résultat global** :
   - Ancien budget : 50 000€/mois.
   - Nouveau budget : 6 000€ + 18 000€ = 24 000€/mois.
   - **Économie totale = 26 000€ / mois (52% de réduction)**.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la définition correcte du terme **FinOps** ?

- A) Licencier les ingénieurs pour réduire la masse salariale.
- B) La pratique de gouvernance culturelle et technique qui apporte de la responsabilité financière au modèle de consommation cloud à la demande, maximisant la valeur business. ✅
- C) Acheter des serveurs physiques d'occasion.
- D) Déplacer tous les serveurs vers un datacenter privé.

**Q2.** Dans les 3 phases du cycle FinOps de la FinOps Foundation, la phase **INFORM** consiste à :

- A) Négocier les contrats avec les fournisseurs.
- B) Donner de la visibilité sur les coûts via un tagging à 100%, des dashboards et la détection d'anomalies. ✅
- C) Éteindre automatiquement les machines virtuelles.
- D) Réduire la taille des volumes disques.

**Q3.** Quel mécanisme d'engagement offre la **remise la plus élevée (jusqu'à 90%)** en contrepartie du risque d'interruption avec un préavis de 2 minutes ?

- A) Reserved Instances Standard
- B) Savings Plans 1 an
- C) Spot Instances / Preemptible VMs ✅
- D) On-Demand Instances

**Q4.** Que mesure l'indicateur **PUE (Power Usage Effectiveness)** dans un datacenter ?

- A) Le nombre de processeurs par mètre carré.
- B) Le ratio entre l'énergie totale consommée par le datacenter et l'énergie consommée par les seuls équipements IT (un PUE proche de 1.0 indique une excellente efficacité énergétique). ✅
- C) La vitesse du réseau en Gigabits par seconde.
- D) Le prix du kWh d'électricité.

**Q5.** Quel est le rôle de l'outil open-source **Infracost** dans un pipeline CI/CD ?

- A) Scanner le code source à la recherche de vulnérabilités.
- B) Analyser les fichiers Terraform lors d'une Pull Request et afficher l'impact financier estimé (ex: "+ $140/mois") avant l'application du code. ✅
- C) Supprimer les buckets S3 publics.
- D) Générer des rapports de conformité RGPD.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
