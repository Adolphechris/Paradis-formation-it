# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 567 (6h) : Green IT & Sustainable Architecture : Carbon-Aware Computing & GreenOps

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser les 8 principes de l'**Ingénierie Logicielle Durable (Sustainable Software Engineering - SSE / Green Software Foundation)**
> - Calculer la métrique de bilan carbone logiciel **SCI (Software Carbon Intensity specification)**
> - Implémenter le **Carbon-Aware Computing** : adapter dynamiquement la charge de travail (Demand Shifting & Demand Shaping) selon l'intensité carbone du réseau électrique en temps réel
> - Réduire l'empreinte environnementale globale des applications web et cloud (GreenOps)
>
> **Compétences visées :** `ARCH-01` (A), `POL-02` (A) — Green IT, Carbon-Aware Computing, Sustainable Architecture

---

## Module 1 — Principes Green IT & Spécification SCI (2h)

### 📖 Intuition & Narration

Le secteur du numérique représente aujourd'hui environ **4% des émissions mondiales de gaz à effet de serre (GES)**, soit plus que le secteur de l'aviation civile commercial. Si le numérique était un pays, il serait le 3ème plus grand consommateur d'électricité au monde.

La **Green Software Foundation (GSF)** définit l'Ingénierie Logicielle Durable comme la discipline qui conçoit des applications émectriquement efficientes, économes en ressources et neutres en carbone par design.

### 🔍 La Métrique SCI (Software Carbon Intensity)

La spécification **SCI** mesure les émissions de CO₂ équivalent par unité de mesure métier (ex: par utilisateur, par transaction, par API call) :

$$SCI = \frac{(E \times I) + M}{R}$$

Où :
- $E$ : Énergie consommée par le logiciel (en kWh).
- $I$ : Intensité carbone du réseau électrique au moment et lieu d'exécution (en gCO₂e / kWh).
- $M$ : Carbone incorporé du matériel (Embodied Carbon - fabrication du serveur amortie sur sa durée de vie).
- $R$ : Unité fonctionnelle métier (ex: 1 000 requêtes API, 1 utilisateur actif).

```
LES 8 PRINCIPES DE L'INGÉNIERIE LOGICIELLE DURABLE (GSF)

  1. CARBON       : Émettre le moins de carbone possible.
  2. ELECTRICITY  : Consommer le moins d'électricité possible.
  3. CARBON INTENSITY : Consommer l'énergie quand et où elle est la plus propre.
  4. EMBODIED CARBON  : Maximiser la durée de vie et le taux d'utilisation du matériel.
  5. ENERGY EFFICIENCY: Optimiser la quantité de travail effectuée par watt.
  6. NETWORK      : Réduire la quantité et la distance des données transmises.
  7. DEMAND SHAPING : Adapter l'expérience utilisateur à la disponibilité en énergie verte.
  8. MEASUREMENT  : Mesurer en continu l'empreinte carbone pour l'optimiser (GreenOps).
```

---

## Module 2 — Carbon-Aware Computing : Demand Shifting & Shaping (2h)

### 🔍 Carbon-Aware Computing

L'intensité carbone de l'électricité varie considérablement selon **l'heure de la journée** (présence de soleil/vent) et **la région géographique** (ex: France nucléaire ~50 gCO₂e/kWh vs Allemagne charbon ~380 gCO₂e/kWh).

```
CARBON-AWARE DEMAND SHIFTING & SHAPING

  1. SPATIAL DEMAND SHIFTING (Déplacement Spatial)
     Exécuter un job de batch ML dans le datacenter de Paris (nucléaire) au lieu d'un datacenter en Allemagne.

  2. TEMPORAL DEMAND SHIFTING (Déplacement Temporel)
     Différer un job lourd de ré-indexation de base de données à 13h00 (pic de production solaire) plutôt qu'à 19h00 (pic de consommation).

  3. DEMAND SHAPING (Ajustement de la Demande)
     Si l'intensité carbone locale est très élevée, dégrader temporairement la qualité (ex: désactiver la vidéo HD, désactiver les prédictions IA secondaires).
```

---

## Module 3 — Calculateur & Scheduler Carbon-Aware (1h30)

### 🛠️ Script Python : Carbon-Aware Job Scheduler (Electricity Maps API Simulator)

```python
#!/usr/bin/env python3
"""
PARADIS — Carbon-Aware Job Scheduler & SCI Calculator
Planifie dynamiquement les batchs lourds dans les régions et créneaux horaires les moins carbonés.
"""
from dataclasses import dataclass
from typing import List, Dict
from datetime import datetime

@dataclass
class GridRegionCarbon:
    region_code: str
    country: str
    carbon_intensity_g_kwh: float  # Intensité carbone actuelle (gCO2e / kWh)
    renewable_percentage: float   # % d'énergies renouvelables/décarbonées

class CarbonAwareScheduler:
    def __init__(self):
        # Simulation d'une API d'intensité carbone temps réel (ex: Electricity Maps / WattTime API)
        self.grid_data: Dict[str, GridRegionCarbon] = {
            "eu-west-3":      GridRegionCarbon("eu-west-3", "France (Paris)", 48.0, 92.0),     # Nucléaire + Éolien
            "eu-central-1":   GridRegionCarbon("eu-central-1", "Allemagne (Francfort)", 340.0, 42.0), # Charbon/Gaz/Solaire
            "eu-north-1":     GridRegionCarbon("eu-north-1", "Suède (Stockholm)", 25.0, 98.0),   # Hydro/Éolien
            "us-east-1":      GridRegionCarbon("us-east-1", "USA (Virginie)", 380.0, 28.0),
        }

    def select_best_region(self) -> GridRegionCarbon:
        """Spatial Demand Shifting : Sélectionne la région avec l'intensité carbone la plus basse"""
        return min(self.grid_data.values(), key=lambda r: r.carbon_intensity_g_kwh)

    def calculate_sci(self, energy_kwh: float, carbon_intensity: float, embodied_co2_g: float, requests_count: int) -> float:
        """Calcule le score SCI (Software Carbon Intensity) en gCO2e par 1000 requêtes"""
        total_co2_g = (energy_kwh * carbon_intensity) + embodied_co2_g
        sci_per_1000 = (total_co2_g / requests_count) * 1000.0
        return sci_per_1000

    def schedule_heavy_job(self, job_name: str, estimated_kwh: float):
        print("=" * 70)
        print(f"  CARBON-AWARE SCHEDULER — PLANIFICATION DU JOB : {job_name}")
        print(f"  Énergie estimée requise : {estimated_kwh:.1f} kWh")
        print("=" * 70)
        print()

        print("  📊 INTENSITÉ CARBONE TEMP EN TEMPS RÉEL PAR RÉGION :")
        for r in self.grid_data.values():
            print(f"    • [{r.region_code}] {r.country:<25} : {r.carbon_intensity_g_kwh:5.1f} gCO2e/kWh ({r.renewable_percentage:.0f}% décarboné)")
        print()

        # Sélection de la meilleure région (Spatial Demand Shifting)
        best_region = self.select_best_region()
        co2_emitted_g = estimated_kwh * best_region.carbon_intensity_g_kwh

        # Comparaison si exécuté dans la pire région
        worst_region = max(self.grid_data.values(), key=lambda r: r.carbon_intensity_g_kwh)
        worst_co2_g = estimated_kwh * worst_region.carbon_intensity_g_kwh
        saved_co2_g = worst_co2_g - co2_emitted_g

        print("─" * 70)
        print(f"  🌱 DÉCISION SPATIAL DEMAND SHIFTING :")
        print(f"     Région Sélectionnée : {best_region.country} ({best_region.region_code})")
        print(f"     Émissions CO2 Estimées : {co2_emitted_g / 1000.0:.3f} kg CO2e")
        print(f"     Économie Carbone Réalisée : -{saved_co2_g / 1000.0:.3f} kg CO2e (-{(saved_co2_g/worst_co2_g)*100:.1f}%) par rapport à {worst_region.country}")
        print("=" * 70)


if __name__ == "__main__":
    scheduler = CarbonAwareScheduler()
    # Planification d'un job de ré-entraînement de modèle IA lourd (consommant 150 kWh)
    scheduler.schedule_heavy_job(job_name="Re-entraînement Modèle LLM PARADIS", estimated_kwh=150.0)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SSE** | Sustainable Software Engineering — Discipline d'ingénierie logicielle axée sur la réduction de l'empreinte carbone |
| **SCI** | Software Carbon Intensity — Spécification standard de mesure du bilan carbone des logiciels |
| **GSF** | Green Software Foundation — Organisation internationale définissant les standards du Green IT |
| **Demand Shifting** | Technique consistant à déplacer l'exécution d'un traitement dans le temps ou l'espace selon la propreté de l'énergie |
| **Demand Shaping** | Adaptation dynamique des fonctionnalités de l'application selon la disponibilité en énergie décarbonée |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Score SCI (Software Carbon Intensity)

Un job batch de traitement de données consomme **10 kWh** d'électricité et traite **100 000 transactions**. Le matériel utilisé a un carbone incorporé amorti de **50 gCO₂e** pour cette session.

1. Calculez le score SCI (gCO₂e / 1 000 transactions) si le job s'exécute en **Allemagne** (intensité carbone = 350 gCO₂e / kWh).
2. Calculez le score SCI si le job est déplacé en **France** (intensité carbone = 50 gCO₂e / kWh).
3. Quel est le pourcentage de réduction d'empreinte carbone obtenu par ce Spatial Demand Shifting ?

**Corrigé guidé :**
1. **En Allemagne** :
   $\text{CO}_2 \text{ Énergie} = 10 \text{ kWh} \times 350 \text{ g} = 3\,500 \text{ gCO}_2\text{e}$.
   $\text{CO}_2 \text{ Total} = 3\,500 + 50 = 3\,550 \text{ gCO}_2\text{e}$.
   $\text{SCI (Allemagne)} = \frac{3\,550}{100\,000} \times 1\,000 = \mathbf{35.5 \text{ gCO}_2\text{e / 1 000 transactions}}$.
2. **En France** :
   $\text{CO}_2 \text{ Énergie} = 10 \text{ kWh} \times 50 \text{ g} = 500 \text{ gCO}_2\text{e}$.
   $\text{CO}_2 \text{ Total} = 500 + 50 = 550 \text{ gCO}_2\text{e}$.
   $\text{SCI (France)} = \frac{550}{100\,000} \times 1\,000 = \mathbf{5.5 \text{ gCO}_2\text{e / 1 000 transactions}}$.
3. **Réduction obtenue** :
   $\text{Gain} = \frac{35.5 - 5.5}{35.5} \times 100 = \mathbf{84.5\% \text{ de réduction carbone}}$.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la part approximative du secteur numérique dans les émissions mondiales de gaz à effet de serre (GES) ?

- A) Moins de 0.1%
- B) Environ 4% (plus que l'aviation civile commerciale) ✅
- C) Plus de 50%
- D) 0% (le numérique est 100% virtuel)

**Q2.** Dans la spécification **SCI (Software Carbon Intensity)**, que représente la variable $I$ ?

- A) Le nombre d'utilisateurs inscrits.
- B) L'intensité carbone du réseau électrique au moment et lieu d'exécution (exprimée en gCO₂e / kWh). ✅
- C) L'adresse IP du serveur.
- D) Le nombre d'instructions CPU par seconde.

**Q3.** Qu'est-ce que le **Spatial Demand Shifting** dans le Carbon-Aware Computing ?

- A) Déplacer les serveurs physiquement avec un camion.
- B) Transférer l'exécution d'un traitement lourd vers une région cloud dont le réseau électrique est actuellement plus propre / moins carboné. ✅
- C) Changer la couleur du site web.
- D) Supprimer les images d'un article.

**Q4.** Que désigne la technique de **Demand Shaping** dans l'Ingénierie Logicielle Durable ?

- A) Forcer tous les utilisateurs à payer par carte bancaire.
- B) Ajuster dynamiquement l'expérience utilisateur et les fonctionnalités secondaires d'une application en fonction de la disponibilité locale d'énergie propre. ✅
- C) Augmenter la taille des vidéos.
- D) Désactiver la base de données.

**Q5.** Quelle organisation internationale est à l'origine des 8 principes de l'Ingénierie Logicielle Durable et de la spécification SCI ?

- A) Green Software Foundation (GSF) ✅
- B) UNESCO
- C) International Telecommunication Union (ITU)
- D) ISO

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
