# TOME P12 — Gouvernance, Compliance & Architecture Finale — Jour 462 (6h) : Gestion & Analyse des Risques de Sécurité (ISO/IEC 27005, EBIOS RM & Quantification FAIR)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser les méthodes d'analyse des risques cyber : **ISO/IEC 27005**, **EBIOS Risk Manager** (ANSSI) et **FAIR** (Factor Analysis of Information Risk)
> - Construire les 5 ateliers EBIOS RM : Socle de sécurité, Sources de risque, Scénarios stratégiques, Scénarios opérationnels, Traitement du risque
> - Quantifier l'impact financier des risques en valeur monétaire (Loss Event Frequency & Loss Magnitude) avec FAIR
> - Établir la Cartographie des Risques et le Plan de Traitement des Risques (PTR)
>
> **Compétences visées :** `POL-01` (A) — Risk Assessment & Management, `POL-02` (A) — EBIOS RM & FAIR Analysis

---

## Module 1 — Méthodologie EBIOS Risk Manager (ANSSI) (2h)

### 📖 Intuition & Narration

L'approche traditionnelle des risques consiste souvent à cocher des cases sur un tableau Excel répertoriant des menaces génériques. **EBIOS Risk Manager**, élaboré par l'ANSSI, est une méthode moderne centrée sur les **acteurs de menace réels** (cybercriminels, états, hacktivistes, internes malveillants) et leurs objectifs stratégiques. Elle permet de construire une vision réaliste et priorisée des scénarios d'attaque les plus dangereux pour l'organisation.

### 🔍 Anatomie Technique — Les 5 Ateliers EBIOS RM

```
EBIOS RISK MANAGER (ANSSI) — LES 5 ATELIERS

  ┌─────────────────────────────────────────────────────────────┐
  │  ATELIER 1 : Cadre & Valeurs Métiers (Biens essentiels)     │
  │  ATELIER 2 : Sources de Risque (SR) & Objectifs Visés (OV)  │
  │  ATELIER 3 : Scénarios Stratégiques (Cartographie d'attaque)│
  │  ATELIER 4 : Scénarios Opérationnels (Kill chain / ATT&CK)  │
  │  ATELIER 5 : Traitement du Risque & Plan d'Action (PTR)     │
  └─────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Quantification Financière des Risques avec FAIR (2h)

### 🛠️ Atelier Pratique — Calculateur de Risque FAIR en Python

```python
#!/usr/bin/env python3
"""
PARADIS — Modèle de Quantification FAIR (Factor Analysis of Information Risk)
Calcul du Risk Exposure Annuel (ALE = LEF x LM) avec simulation Monte-Carlo
"""

import numpy as np

def fair_monte_carlo_simulation(iterations: int = 10000) -> dict:
    """
    Scénario FAIR : Exfiltration de données clients via Ransomware
    - Threat Event Frequency (TEF) : 0.1 à 0.5 fois par an
    - Vulnerability (Vulnerability proba) : 30%
    - Primary Loss : 100,000€ à 500,000€ (restauration + arrêt prod)
    - Secondary Loss : 200,000€ à 2,000,000€ (amendes RGPD + perte réputation)
    """
    # Distribution PERT/Monte-Carlo pour la fréquence (LEF)
    tef = np.random.uniform(0.1, 0.5, iterations)
    vuln = np.random.uniform(0.2, 0.4, iterations)
    lef = tef * vuln  # Loss Event Frequency

    # Distribution de l'impact financier (LM)
    primary_loss = np.random.triangular(100000, 250000, 500000, iterations)
    secondary_loss = np.random.triangular(200000, 500000, 2000000, iterations)
    lm = primary_loss + secondary_loss  # Loss Magnitude

    ale = lef * lm  # Annualized Loss Expectancy

    return {
        "ale_mean_eur": round(float(np.mean(ale)), 2),
        "ale_p95_eur": round(float(np.percentile(ale, 95)), 2), # Scénario du pire (95e percentile)
        "ale_min_eur": round(float(np.min(ale)), 2)
    }

results = fair_monte_carlo_simulation()
print("[FAIR RISK QUANTIFICATION REPORT]")
print(f"  Perte Annuelle Moyenne Attendue (ALE Mean) : {results['ale_mean_eur']} €")
print(f"  Pire Scénario 95% (ALE P95)                 : {results['ale_p95_eur']} €")
```

---

## Module 3 — Cartographie & Plan de Traitement des Risques (PTR) (1h30)

### 🛠️ Matrice des Options de Traitement du Risque

```markdown
OPTIONS DE TRAITEMENT DU RISQUE (ISO 27005 / EBIOS RM)

1. RÉDUIRE (Mitigate)  : Déployer des mesures de sécurité (ex: MFA, EDR, Backup).
2. ACCEPTER (Accept)   : Le risque résiduel est inférieur au seuil d'appétence du Board.
3. TRASFERER (Transfer): Souscrire une cyber-assurance ou externaliser avec SLA.
4. ÉVITER (Avoid)     : Renoncer à l'activité ou au composant trop risqué.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **EBIOS RM** | Expression des Besoins et Identification des Objectifs de Sécurité - Risk Manager (Méthode ANSSI) |
| **FAIR** | Factor Analysis of Information Risk — Cadre international de quantification financière des risques cyber |
| **ALE** | Annualized Loss Expectancy — Estimation financière annuelle des pertes liées à un risque |

---

## Exercices Pratiques

### Exercice 1 — Calcul d'Appétence au Risque

Le Board fixe son seuil d'appétence au risque à **200 000 € / an**. La simulation FAIR montre un ALE moyen de **350 000 € / an** pour le risque de fuite de données Cloud. Quelles sont les options stratégiques du RSSI ?

**Corrigé guidé :** L'ALE (350 k€) dépassant le seuil d'appétence (200 k€), le risque ne peut pas être simplement accepté. Le RSSI doit proposer un **Plan de Traitement des Risques (PTR)** pour **réduire** le risque (ex: investir 50 k€ dans la sécurité des conteneurs pour faire passer l'ALE sous 150 k€) ou **transférer** une partie de l'impact via une cyber-assurance.

---

## Banque QCM — 5 Questions

**Q1.** Combien d'ateliers compose la méthode **EBIOS Risk Manager** de l'ANSSI ?

- A) 2 ateliers
- B) 5 ateliers (Socle, Sources, Stratégique, Opérationnel, Traitement) ✅
- C) 10 ateliers
- D) 12 ateliers

**Q2.** La méthode **FAIR** se distingue des approches traditionnelles de risques car :

- A) Elle n'utilise que des couleurs (Rouge, Jaune, Vert) sans chiffres
- B) Elle quantifie le risque en valeur monétaire (€/$) avec des simulations probabilistes ✅
- C) Elle ne s'applique qu'au matériel physique
- D) Elle est réservée aux petites entreprises

**Q3.** Dans la formule FAIR `ALE = LEF x LM`, le terme **LEF** signifie :

- A) Loss Event Frequency (Fréquence d'occurrence de la perte) ✅
- B) Local Encryption Function
- C) Legal Executive Framework
- D) Low Entry Fee

**Q4.** Le **Plan de Traitement des Risques (PTR)** a pour objectif de :

- A) Licencier les développeurs ayant créé des bugs
- B) Définir les actions, responsabilités et budgets pour amener le risque résiduel sous le seuil d'appétence ✅
- C) Remplacer tous les serveurs Linux par Windows
- D) Annuler les audits de conformité

**Q5.** Choisir de souscrire une **cyber-assurance** correspond à quelle option de traitement du risque ?

- A) Éviter le risque
- B) Transférer le risque (Transfer) ✅
- C) Ignorer le risque
- D) Réduire le risque à la source

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
