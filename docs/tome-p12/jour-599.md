# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 599 (6h) : Dernière Masterclass — L'Ingénieur IT de Demain — Vision, Mission & Legacy

> [!NOTE]
> **Objectifs pédagogiques :**
> - Définir le rôle et la responsabilité de l'**Ingénieur IT de Demain** dans une société hautement numérisée
> - Articuler la triple mission de l'ingénieur moderne : **Excellence Technique, Résilience Éthique & Impact Sociétal**
> - Comprendre les enjeux du **Numérique Éco-Responsable (Green IT)** et de la sobriété numérique face aux défis énergétiques
> - Poser les jalons de son **Héritage Technique (Legacy)** : bâtir des systèmes durables qui survivront à leurs créateurs
>
> **Compétences visées :** `POL-03` (A), `PRO-01` (A) — Engineering Ethics, Green IT, Professional Legacy, Visionary Leadership

---

## Module 1 — Le Rôle et la Mission de l'Ingénieur IT de Demain (2h)

### 📖 L'Ingénieur comme Bâtisseur du Monde Numérique

Au XXIe siècle, l'infrastructure informatique est le **système nerveux central de l'humanité**. Des réseaux électriques aux systèmes de santé, des marchés financiers aux communications spatiales, tout repose sur du code et des serveurs conçus par des ingénieurs.

```
LA TRIPLE MISSION DE L'INGÉNIEUR IT DE DEMAIN

  1. EXCELLENCE TECHNIQUE & RÉSILIENCE (Technical Mastery)
     Concevoir des systèmes hautement disponibles, sécurisés par design (Zero-Trust)
     et capables de résister aux pannes extrêmes et aux cyberattaques.

  2. RESPONSABILITÉ ÉTHIQUE & SOUVERAINETÉ (Ethical Responsibility)
     Protéger les libertés individuelles, la vie privée des citoyens et la souveraineté
     des données face aux monopoles technologiques et à l'utilisation abusive de l'IA.

  3. SOBRIÉTÉ ÉNERGÉTIQUE & GREEN IT (Sustainability)
     Optimiser l'efficience énergétique des Datacenters, réduire l'empreinte carbone
     des algorithmes IA et lutter contre l'obsolescence matérielle.
```

---

## Module 2 — Sobriété Numérique & Green IT (2h)

### 🔍 Les Principes du Green IT & Sustainable Engineering

L'IA et le Cloud Computing consomment une fraction croissante de l'électricité mondiale. L'ingénieur de demain doit savoir concevoir des logiciels et architectures sobres.

```
LES 4 RÈGLES DE L'INGÉNIERIE MATÉRIELLE & LOGICIELLE DURABLE

  1. ARCHITECTURE ÉCONOME EN CARBONE (Carbon-Aware Computing)
     - Planifier les batchs d'entraînement ML ou les traitements lourds dans les régions
       et aux heures où l'électricité est la plus décarbonée (énergie solaire/éolienne disponible).

  2. EFFICIENCE ALGORITHMIQUE & CODE PROPRE
     - Préférer des langages performants (Rust, Go, C++) pour les microservices à fort trafic.
     - Un code optimisé consomme moins de cycles CPU → moins de Watts → moins de CO₂.

  3. VIRTUALISATION & RIGHTSIZING (Tuning Ressources)
     - Éliminer les ressources zombie (instances EC2 inutilisées, volumes EBS orphelins).
     - Dimensionner exactement les conteneurs K8s (Memory/CPU requests).

  4. ALLONGEMENT DE LA DURÉE DE VIE DES ÉQUIPEMENTS
     - Le renouvellement du matériel réseau et serveur constitue 70% de l'empreinte carbone IT.
```

---

## Module 3 — Atelier Pratique : Green IT Calculator & Legacy Checklist (1h30)

### 🛠️ Script Python : Green IT Carbon Intensity Estimator & System Sustainability Audit

```python
#!/usr/bin/env python3
"""
PARADIS — Green IT Carbon Intensity Estimator & Sustainable Engineering Audit
Calcule l'empreinte carbone d'une infrastructure Cloud et recommande des optimisations Green IT.
"""
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class CloudInfrastructure:
    region_name            : str
    grid_carbon_g_per_kwh  : float  # Intensity CO₂ (ex: France = 52g, Allemagne = 380g, USA = 400g)
    total_power_kw         : float  # Puissance continue consommée par les serveurs
    pue                    : float  # Power Usage Effectiveness du Datacenter (ex: 1.2)
    server_lifecycle_years : int = 5

class SustainableITCalculator:
    """Calculateur d'impact environnemental des infrastructures informatiques"""

    def calculate_carbon_footprint(self, infra: CloudInfrastructure) -> dict:
        # Puissance totale avec PUE (refroidissement + énergie)
        total_effective_kw = infra.total_power_kw * infra.pue

        # Consommation annuelle (kWh)
        annual_kwh = total_effective_kw * 24 * 365

        # Émissions CO₂ annuelles (kg CO₂eq)
        annual_co2_kg = (annual_kwh * infra.grid_carbon_g_per_kwh) / 1000.0
        annual_co2_tons = annual_co2_kg / 1000.0

        # Équivalent aller-retour Paris-New York en avion (~1 tonne CO₂ par passager)
        flight_equivalents = annual_co2_tons / 1.0

        return {
            "region"               : infra.region_name,
            "annual_kwh"           : round(annual_kwh, 0),
            "annual_co2_tons"      : round(annual_co2_tons, 2),
            "flight_equivalents"   : round(flight_equivalents, 1),
            "carbon_intensity_grid": f"{infra.grid_carbon_g_per_kwh} gCO₂/kWh",
            "pue"                  : infra.pue
        }

    def print_sustainability_report(self, res: dict):
        print("=" * 70)
        print("  🌱 PARADIS GREEN IT — BILAN CARBONE INFRASTRUCTURE")
        print("=" * 70)
        print(f"  Région Cloud           : {res['region']}")
        print(f"  Intensité Électrique   : {res['carbon_intensity_grid']}")
        print(f"  Datacenter PUE         : {res['pue']}")
        print(f"  Consommation Annuelle  : {res['annual_kwh']:,.0f} kWh")
        print(f"  Empreinte CO₂ Annuelle : {res['annual_co2_tons']} tonnes CO₂eq  🌍")
        print(f"  Équivalent Vols Avion  : {res['flight_equivalents']} vols Paris-New York")
        print("=" * 70)


if __name__ == "__main__":
    print("=== PARADIS — SUSTAINABLE ENGINEERING CALCULATOR ===\n")

    # Comparaison Datacenter France (europe-west9) vs Allemagne (europe-west3)
    calc = SustainableITCalculator()

    infra_france = CloudInfrastructure("europe-west9 (Paris - Électricité Nucléaire/Renouvelable)", 52.0, 50.0, 1.15)
    infra_germany = CloudInfrastructure("europe-west3 (Francfort - Mix Charbon/Gaz)", 350.0, 50.0, 1.20)

    print("📊 COMPARATIF CARBONE INTER-RÉGIONS CLOUD (50 kW continu) :")
    res_fr = calc.calculate_carbon_footprint(infra_france)
    calc.print_sustainability_report(res_fr)

    print()
    res_de = calc.calculate_carbon_footprint(infra_germany)
    calc.print_sustainability_report(res_de)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PUE** | Power Usage Effectiveness — Ratio mesurant l'efficacité énergétique d'un Datacenter (Idéal = 1.0) |
| **Green IT** | Ensemble des démarches visant à réduire l'empreinte écologique du numérique |
| **Carbon-Aware** | Application logicielle adaptant son exécution en fonction de l'intensité carbone temps réel du réseau électrique |

---

## Exercices Pratiques

### Exercice 1 — Optimisation d'Économie Carbone Cloud

Une entreprise fait tourner ses entraînements de modèles IA pendant 100 heures sur une grappe de 10 GPUs (consommation totale 10 kW).

- Dans la région A (intensité 400 gCO₂/kWh), quel est le bilan carbone ?
- Dans la région B (intensité 50 gCO₂/kWh), quel est le bilan carbone ?
- Quelle est la réduction d'émissions réalisée en déplaçant le job de calcul vers la région B ?

**Corrigé :**
1. Consommation = $10 \text{ kW} \times 100 \text{h} = 1000 \text{ kWh}$.
2. Région A : $1000 \text{ kWh} \times 0.400 \text{ kg} = \mathbf{400 \text{ kg CO₂eq}}$.
3. Région B : $1000 \text{ kWh} \times 0.050 \text{ kg} = \mathbf{50 \text{ kg CO₂eq}}$.
4. Réduction : $400 - 50 = \mathbf{350 \text{ kg CO₂eq}}$ économisés (**87.5% de réduction CO₂**) simplement par le choix de région Carbon-Aware ! ✅

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce que le **Power Usage Effectiveness (PUE)** d'un Datacenter ?

- A) Le prix du kilowatt-heure.
- B) Le ratio entre l'énergie totale consommée par l'ensemble du Datacenter (refroidissement + éclairage + serveurs) et l'énergie effectivement consommée par les équipements informatiques. ✅
- C) La vitesse des processeurs.
- D) Le nombre de serveurs par rack.

**Q2.** Que signifie la notion de **Carbon-Aware Computing** ?

- A) Ne plus utiliser d'ordinateurs.
- B) Concevoir des applications capables de déplacer ou planifier leurs traitements informatiques lourds vers des régions ou des plages horaires où l'électricité produite est la plus décarbonée. ✅
- C) Éteindre l'écran la nuit.
- D) Utiliser uniquement du papier.

**Q3.** Quel est la triple mission fondamentale de l'**Ingénieur IT de Demain** selon la vision PARADIS IT ?

- A) Coder vite, gagner de l'argent, prendre sa retraite.
- B) Excellence Technique, Résilience Éthique & Sobriété Énergétique / Impact Sociétal. ✅
- C) Acheter des serveurs, installer Linux, utiliser Windows.
- D) Remplacer les humains par des robots.

**Q4.** Quelle étape du cycle de vie des équipements informatiques génère la plus grande part (jusqu'à 70%) de leur empreinte carbone totale ?

- A) L'emballage en carton.
- B) La fabrication et l'extraction des terres rares (d'où l'importance d'allonger la durée de vie du matériel). ✅
- C) L'envoi des e-mails.
- D) La mise à jour des logiciels.

**Q5.** Pourquoi l'utilisation de langages compilés et performants (Rust, Go) contribue-t-elle au **Green IT** dans les microservices à très fort trafic ?

- A) Parce que les fichiers source sont plus petits.
- B) Parce qu'ils exécutent les requêtes avec moins de cycles CPU et de mémoire RAM, réduisant directement la consommation électrique des serveurs à charge égale. ✅
- C) Parce qu'ils sont verts dans l'éditeur.
- D) Ils ne contribuent pas au Green IT.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
