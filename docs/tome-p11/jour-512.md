# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 512 (6h) : Gestion & Analyse des Risques de Sécurité : ISO/IEC 27005, Méthode EBIOS RM & Quantification FAIR

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser la norme **ISO/IEC 27005:2022** pour la gestion des risques de sécurité de l'information
> - Déployer la méthode française **EBIOS RM (Risk Manager - ANSSI)** en 5 ateliers stratégiques et opérationnels
> - Modéliser les scénarios stratégiques (Socle de sécurité, Origines de risque) et opérationnels (Scénarios d'attaque MITRE ATT&CK)
> - Calculer la perte financière probable avec le modèle de quantification de risque **FAIR (Factor Analysis of Information Risk)**
>
> **Compétences visées :** `POL-01` (A), `SEC-06` (A) — Risk Management & FAIR Quantification

---

## Module 1 — ISO 27005 & la Méthode EBIOS RM de l'ANSSI (2h)

### 📖 Intuition & Narration

La sécurité absolue n'existe pas. Chaque entreprise évolue dans un environnement contraint par un budget et du temps. La question d'un dirigeant n'est pas *"Sommes-nous 100% sécurisés ?"*, mais *"Quels sont nos risques majeurs, combien peuvent-ils nous coûter, et où devons-nous investir nos euros pour réduire le risque au niveau le plus bas raisonnablement réalisable ?"*

La gestion des risques apporte la réponse scientifique et structurée à cette question. La méthode **EBIOS RM (ANSSI)** fournit une approche visuelle et structurée en 5 ateliers pour identifier les cyberattaques plausibles et concevoir les mesures de sécurité adaptées.

### 🔍 Anatomie Technique — Les 5 Ateliers EBIOS RM & Modèle FAIR

```
LES 5 ATELIERS DE LA MÉTHODE EBIOS RM (ANSSI)

  ┌────────────────────────────────────────────────────────────────────────┐
  │ ATELIER 1 : CADRE & SOCLE DE SÉCURITÉ                                  │
  │ Identification des biens essentiels (valeurs métier) et du socle CIS   │
  ├────────────────────────────────────────────────────────────────────────┤
  │ ATELIER 2 : SOURCES DE RISQUE (Origines de Risque & Objectifs Visés)   │
  │ Cybercriminels, États, Concurrents, Hacktivistes, Menace interne      │
  ├────────────────────────────────────────────────────────────────────────┤
  │ ATELIER 3 : SCÉNARIOS STRATÉGIQUES (Cartographie des Menaces)         │
  │ Chemins d'attaque de haut niveau à travers l'écosystème               │
  ├────────────────────────────────────────────────────────────────────────┤
  │ ATELIER 4 : SCÉNARIOS OPÉRATIONNELS (Techniques d'Attaque)            │
  │ Modélisation technique détaillée des kill-chains (MITRE ATT&CK)        │
  ├────────────────────────────────────────────────────────────────────────┤
  │ ATELIER 5 : TRAITEMENT DU RISQUE (Plan de Sécurité)                    │
  │ Décisions : Accepter, Éviter, Transférer (Assurance), Réduire          │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Atelier Pratique : Calculateur de Risque FAIR (FAIR Risk Calculator) (2h)

### 🛠️ Code Python : Calculateur FAIR Monte Carlo (Factor Analysis of Information Risk)

Le modèle FAIR remplace les estimations vagues ("Risque Élevé", "Risque Moyen") par des probabilités financières rigoureuses exprimées en Euros via des simulations de Monte Carlo.

```python
#!/usr/bin/env python3
"""
PARADIS — FAIR (Factor Analysis of Information Risk) Monte Carlo Engine
Calcule l'Exposition Financière Annuelle au Risque (ALE — Annual Loss Expectancy) par simulation statistique.
"""

import random
import sys

def fair_monte_carlo_simulation(
    threat_event_frequency_min: float,  # Nb d'attaques min par an (ex: 0.1 = 1 tous les 10 ans)
    threat_event_frequency_max: float,  # Nb d'attaques max par an (ex: 2.0 = 2 par an)
    vulnerability_pct: float,            # Probabilité de succès de l'attaque (ex: 0.3 = 30%)
    primary_loss_min_eur: float,         # Pertes directes min (ex: 50 000 €)
    primary_loss_max_eur: float,         # Pertes directes max (ex: 500 000 €)
    secondary_loss_min_eur: float,       # Pertes indirectes (amendes, réputation) min
    secondary_loss_max_eur: float,       # Pertes indirectes max
    iterations: int = 10000
) -> dict:
    print("=== DÉMARRAGE DE LA SIMULATION DU RISQUE FINANCIER FAIR (MONTE CARLO) ===")
    annual_losses = []

    for _ in range(iterations):
        # 1. Tirage de la fréquence des événements d'attaque (Threat Event Frequency)
        tef = random.uniform(threat_event_frequency_min, threat_event_frequency_max)

        # 2. Détermination de la fréquence des pertes (Loss Event Frequency)
        # LEF = TEF * Vulnerability
        lef = tef * vulnerability_pct

        # 3. Calcul des pertes directes et indirectes tirées au sort
        p_loss = random.uniform(primary_loss_min_eur, primary_loss_max_eur)
        s_loss = random.uniform(secondary_loss_min_eur, secondary_loss_max_eur)
        single_loss_magnitude = p_loss + s_loss

        # 4. Perte annuelle pour cette itération (Annual Loss Expectancy - ALE)
        annual_loss = lef * single_loss_magnitude
        annual_losses.append(annual_loss)

    annual_losses.sort()
    avg_ale = sum(annual_losses) / iterations
    p50_ale = annual_losses[int(iterations * 0.50)]
    p90_ale = annual_losses[int(iterations * 0.90)] # Pire cas dans 90% des scénarios

    print(f"[*] Nombre d'itérations Monte Carlo : {iterations:,}")
    print(f"[*] Perte Annuelle Moyenne Estimée (ALE) : {avg_ale:,.2f} €")
    print(f"[*] Médiane de Perte Annuelle (P50)       : {p50_ale:,.2f} €")
    print(f"[*] Pire Cas Raisonnable (P90 Risk)        : {p90_ale:,.2f} €")

    return {
        "avg_ale_eur": avg_ale,
        "p50_ale_eur": p50_ale,
        "p90_ale_eur": p90_ale
    }

if __name__ == "__main__":
    # Simulation pour un scénario de Ransomware en entreprise
    result = fair_monte_carlo_simulation(
        threat_event_frequency_min=0.2,   # 1 attaque tous les 5 ans
        threat_event_frequency_max=1.5,   # 1.5 attaque par an
        vulnerability_pct=0.25,           # 25% de chances que l'attaque réussisse
        primary_loss_min_eur=100000,      # 100k€ minimum de reconstruction
        primary_loss_max_eur=2000000,     # 2M€ maximum
        secondary_loss_min_eur=50000,     # Amendes / frais juridiques min
        secondary_loss_max_eur=1000000,    # Amendes max
        iterations=100000
    )
    print("\n[✅ FAIR ANALYSIS] Évaluation terminée — Rapport disponible pour le Comité de Direction.")
```

---

## Module 3 — Traitement du Risque & Plan d'Action de Sécurité (1h30)

### 🔍 Les 4 Options de Traitement du Risque (ISO 27005)

Une fois les risques quantifiés, la direction doit choisir l'une des 4 stratégies de traitement :

1. **Réduire (Mitigate)** : Déployer des contrôles de sécurité (ex: MFA, DevSecOps, EDR) pour faire baisser la vulnérabilité ou l'impact.
2. **Transférer (Transfer)** : Souscrire une assurance cyber ou sous-traiter la responsabilité.
3. **Éviter (Avoid)** : Abandonner l'activité ou le projet jugé trop risqué.
4. **Accepter (Retain)** : Accepter le risque résiduel s'il est inférieur au coût de sa protection.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **EBIOS RM** | Expression des Besoins et Identification des Objectifs de Sécurité - Risk Manager |
| **FAIR** | Factor Analysis of Information Risk — Modèle quantitatif d'analyse du risque financier |
| **ALE** | Annual Loss Expectancy — Perte financière annuelle estimée due à un risque |
| **ANSSI** | Agence Nationale de la Sécurité des Systèmes d'Information (France) |

---

## Exercices Pratiques

### Exercice 1 — Calcul de l'ALE (Annual Loss Expectancy)

Un serveur héberge des données critiques.
- Fréquence de survenance de l'attaque (**Single Loss Frequency**) = 0.5 par an (une fois tous les 2 ans).
- Impact financier d'une seule attaque réussie (**Single Loss Expectancy - SLE**) = 200 000 €.

Calculez l'**ALE (Annual Loss Expectancy)** de ce risque.

**Corrigé guidé :**
$$\text{ALE} = \text{SLE} \times \text{ARO (Annual Rate of Occurrence)}$$
$$\text{ALE} = 200\,000 \text{ €} \times 0.5 = \mathbf{100\,000 \text{ € / an}}$$
Le budget annuel de protection ne doit idéalement pas dépasser 100 000 € par an pour rester économiquement rationnel.

---

## Banque QCM — 5 Questions

**Q1.** Combien d'ateliers de travail comporte la méthode d'analyse des risques **EBIOS RM** développée par l'ANSSI ?

- A) 2 ateliers.
- B) 5 ateliers (Socle, Sources de risque, Scénarios stratégiques, Scénarios opérationnels, Traitement). ✅
- C) 50 ateliers.
- D) Aucun atelier.

**Q2.** Quelle est la particularité du modèle de risque **FAIR (Factor Analysis of Information Risk)** par rapport aux approches qualitatives classiques ?

- A) Il utilise des couleurs (rouge, orange, vert) uniquement.
- B) Il quantifie les risques en valeurs financières réelles (€ ou $) en utilisant des probabilités et des simulations statistiques de Monte Carlo. ✅
- C) Il ne fonctionne que sur les ordinateurs Apple.
- D) Il interdit l'utilisation de Python.

**Q3.** Que représente l'indicateur **ALE (Annual Loss Expectancy)** en gestion des risques ?

- A) La somme des salaires de l'équipe informatique.
- B) La perte financière annuelle moyenne attendue liée à la réalisation d'un risque spécifique. ✅
- C) Le coût d'un abonnement logiciel.
- D) Le temps de pause déjeuner.

**Q4.** Si le coût de la mesure de protection contre un risque est de 500 000 €/an alors que la perte annuelle estimée (ALE) est de 10 000 €/an, quelle option de traitement du risque est la plus rationnelle ?

- A) Réduire le risque à n'importe quel prix.
- B) Accepter le risque (Retain) ou trouver une alternative moins coûteuse, car la mesure coûte 50 fois plus cher que la perte potentielle. ✅
- C) Démissionner immédiatement.
- D) Acheter 100 serveurs supplémentaires.

**Q5.** Dans l'Atelier 4 d'EBIOS RM, avec quel référentiel technique international aligne-t-on la modélisation des scénarios opérationnels d'attaque ?

- A) Le dictionnaire Larousse.
- B) La matrice MITRE ATT&CK. ✅
- C) Le code de la route.
- D) La liste des chaînes de télévision.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
