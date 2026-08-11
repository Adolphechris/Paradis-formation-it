# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 553 (6h) : Site Reliability Engineering (SRE) Avancé : SLI/SLO/SLA, Error Budget & Alerting par Burn Rate

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le paradigme **Site Reliability Engineering (SRE)** popularisé par Google ("Class SRE implements interface DevOps")
> - Définir et mesurer rigoureusement le triptyque **SLI (Service Level Indicator)**, **SLO (Service Level Objective)** et **SLA (Service Level Agreement)**
> - Gérer le budget d'erreur (**Error Budget**) pour arbitrer objectivement entre vitesse d'innovation (features) et stabilité
> - Implémenter l'alerting basé sur le **Burn Rate de l'Error Budget** (Google SRE Workbook) pour éliminer le bruit des alertes intempestives
>
> **Compétences visées :** `INFRA-03` (A), `DEV-03` (A) — Site Reliability Engineering, Error Budget Management

---

## Module 1 — Le Triptyque SRE : SLI, SLO, SLA (2h)

### 📖 Intuition & Narration

100% de disponibilité est un **objectif irréaliste, sous-optimal et inutilement coûteux**. Aucun système informatique n'a besoin d'être disponible à 100%, car les utilisateurs accèdent aux applications via des réseaux mobiles ou Wi-Fi qui ont eux-mêmes un taux d'erreur de 0.1% à 1%.

Le **Site Reliability Engineering (SRE)** repose sur un compromis fondamental : la perfection n'est pas le but. L'objectif est d'atteindre le niveau de fiabilité **suffisant pour satisfaire l'utilisateur**, et d'utiliser la marge d'erreur restante (l'**Error Budget**) pour prendre des risques contrôlés et innover rapidement.

### 🔍 Différence entre SLI, SLO et SLA

```
DÉFINITION DU TRIPTYQUE SRE

  SLI (Service Level Indicator) — Ce que l'on MESURE
  ──────────────────────────────────────────────────
  Une métrique précise de la qualité de service en temps réel.
  Formule générique : SLI = (Événements Bons / Total des Événements) × 100
  Exemple : (Requêtes HTTP réussies en < 200ms / Total requêtes HTTP) × 100

  SLO (Service Level Objective) — Ce que l'on CIBLE en interne
  ─────────────────────────────────────────────────────────────
  L'objectif de fiabilité ciblé par l'équipe d'ingénierie.
  Exemple : Le SLI de latence doit être ≥ 99.9% sur une fenêtre glissante de 30 jours.

  SLA (Service Level Agreement) — Ce que l'on ENGAGE au contrat
  ─────────────────────────────────────────────────────────────
  L'engagement contractuel avec les clients, assorti de pénalités financières.
  RÈGLE SRE FONDAMENTALE : SLA < SLO (Marge de sécurité).
  Exemple : SLA = 99.5% (si le service descend en dessous, remboursement client).
```

### 🔍 Error Budget (Budget d'Erreur)

L'**Error Budget** est la quantité d'indisponibilité autorisée par le SLO :

$$\text{Error Budget} = 100\% - \text{SLO}$$

Pour un SLO de 99.9% sur un mois (43 200 minutes) :
- Indisponibilité autorisée : $0.1\% \times 43200 \text{ min} = 43.2 \text{ minutes par mois}$.

```
RÈGLE D'ARBITRAGE DU BUDGET D'ERREUR (ERROR BUDGET POLICY)

  Reste du Budget d'Erreur > 0%  ──→ L'équipe produit PEUT déployer de nouvelles features.
  Reste du Budget d'Erreur = 0%  ──→ Gel des déploiements (Freeze) !
                                    L'équipe se consacre à 100% à la fiabilité (SRE/refactoring).
```

---

## Module 2 — Alerting basé sur le Burn Rate (2h)

### 🔍 Pourquoi l'Alerting Classique Échoue

L'alerting traditionnel basé sur des seuils instantanés ("Alerte si CPU > 90%" ou "Alerte si taux d'erreur HTTP 500 > 5% pendant 5 min") génère soit **trop de fausses alertes** (bruit), soit **des alertes trop tardives**.

L'alerting SRE moderne surveille la vitesse à laquelle le budget d'erreur se consomme : le **Burn Rate**.

- **Burn Rate = 1** : Le budget d'erreur sera consommé exactement à 100% à la fin de la période (ex: 30 jours).
- **Burn Rate = 14.4** : 2% du budget d'erreur est consommé en 1 heure → Urgence critique (PagerDuty réveille l'ingénieur à 2h du matin).
- **Burn Rate = 2** : Le budget sera épuisé en 15 jours → Alerte ticket Jira (pas d'astreinte).

```
TABLEAU D'ALERTING RECOMMANDÉ (GOOGLE SRE WORKBOOK)

  BURN RATE │ CONSUMPTION (30j) │ FENÊTRE COURT │ FENÊTRE LONGUE │ ACTION / CANAL
  ──────────┼───────────────────┼───────────────┼────────────────┼────────────────────
  14.4      │ 2% en 1 heure     │ 5 minutes     │ 1 heure        │ Pager (Astreinte) 🚨
  6.0       │ 5% en 6 heures    │ 30 minutes    │ 6 heures       │ Pager (Astreinte) 🚨
  3.0       │ 10% en 3 jours    │ 2 heures      │ 3 jours        │ Ticket Jira / Slack ✉️
```

---

## Module 3 — Calculateur d'Error Budget & Prometheus Alert Rules (1h30)

### 🛠️ Code YAML : Règles d'Alerting Prometheus SRE (Burn Rate Multi-Window)

```yaml
# rules/sre-burn-rate-alerts.yaml
groups:
- name: SREAlertsBurnRate
  rules:
  # SLI : Taux de requêtes réussies (HTTP status != 5xx) en < 200ms
  # SLO : 99.9% sur 30 jours (Error Budget = 0.1%)

  # ALERTE CRITIQUE 1 : Burn Rate 14.4 (Consomme 2% du budget en 1h) -> PagerDuty
  - alert: APIBackendErrorBudgetBurnRateCritical
    expr: |
      (
        sum(rate(http_requests_total{status=~"5..",job="api-backend"}[1h]))
        /
        sum(rate(http_requests_total{job="api-backend"}[1h]))
      ) > (14.4 * 0.001)
      and
      (
        sum(rate(http_requests_total{status=~"5..",job="api-backend"}[5m]))
        /
        sum(rate(http_requests_total{job="api-backend"}[5m]))
      ) > (14.4 * 0.001)
    for: 2m
    labels:
      severity: critical
      tier: paged
    annotations:
      summary: "High Error Budget Burn Rate (14.4x) on API Backend"
      description: "Le budget d'erreur consacre 2% de sa réserve en 1 heure ! Épuisement total sous 36 heures si non traité."

  # ALERTE WARNING 2 : Burn Rate 6.0 (Consomme 5% du budget en 6h) -> Slack Ticket
  - alert: APIBackendErrorBudgetBurnRateWarning
    expr: |
      (
        sum(rate(http_requests_total{status=~"5..",job="api-backend"}[6h]))
        /
        sum(rate(http_requests_total{job="api-backend"}[6h]))
      ) > (6.0 * 0.001)
    for: 15m
    labels:
      severity: warning
      tier: ticket
    annotations:
      summary: "Moderate Error Budget Burn Rate (6.0x) on API Backend"
      description: "Le budget d'erreur se consomme à un rythme de 6x la normale (5% en 6h). Ticket créé pour investigation."
```

### 🛠️ Script Python : Error Budget Calculator & Burn Rate Simulator

```python
#!/usr/bin/env python3
"""
PARADIS — SRE Error Budget & Burn Rate Calculator
Calcule l'Error Budget et simule le temps restant avant épuisement selon le Burn Rate.
"""
from dataclasses import dataclass

@dataclass
class SLOConfig:
    service_name: str
    target_slo: float       # ex: 99.9 pour 99.9%
    time_window_days: int   # ex: 30 jours
    total_requests_pm: int  # volume estimé de requêtes par mois

class SRECalculator:
    def __init__(self, config: SLOConfig):
        self.config = config
        self.error_budget_percent = 100.0 - config.target_slo
        self.total_minutes = config.time_window_days * 24 * 60
        self.allowed_downtime_minutes = (self.error_budget_percent / 100.0) * self.total_minutes
        self.allowed_failed_requests = int(config.total_requests_pm * (self.error_budget_percent / 100.0))

    def calculate_burn_time(self, current_burn_rate: float):
        if current_burn_rate <= 0:
            return float('inf')
        # Temps avant épuisement total = Fenêtre (en heures) / Burn Rate
        hours_window = self.config.time_window_days * 24
        return hours_window / current_burn_rate

    def print_report(self, current_burn_rate: float):
        hours_remaining = self.calculate_burn_time(current_burn_rate)

        print("=" * 65)
        print(f"  CALCULATEUR SRE ERROR BUDGET — {self.config.service_name}")
        print("=" * 65)
        print(f"  SLO Cible            : {self.config.target_slo}%")
        print(f"  Période d'Évaluation : {self.config.time_window_days} jours")
        print(f"  Error Budget         : {self.error_budget_percent:.3f}%")
        print(f"  Indisponibilité max  : {self.allowed_downtime_minutes:.2f} minutes par mois")
        print(f"  Requêtes 5xx tolérées: {self.allowed_failed_requests:,} / {self.config.total_requests_pm:,}")
        print("─" * 65)

        print(f"  🔥 BURN RATE ACTUEL  : {current_burn_rate:.1f}x")
        if current_burn_rate > 14.4:
            print(f"  🚨 STATUT : URGENCE CRITIQUE (PagerDuty) — Épuisement en {hours_remaining:.1f} heures !")
        elif current_burn_rate > 6.0:
            print(f"  🟠 STATUT : AVERTISSEMENT SÉVÈRE — Épuisement en {hours_remaining:.1f} heures ({hours_remaining/24:.1f} jours)")
        elif current_burn_rate > 1.0:
            print(f"  🟡 STATUT : ATTENTION — Consommation supérieure à la normale. Épuisement en {hours_remaining/24:.1f} jours")
        else:
            print(f"  🟢 STATUT : SAIN — Le budget tiendra l'intégralité des {self.config.time_window_days} jours.")

        print("=" * 65)


if __name__ == "__main__":
    service_slo = SLOConfig(
        service_name="API Payment Gateway",
        target_slo=99.9,             # 99.9%
        time_window_days=30,
        total_requests_pm=10_000_000 # 10 millions de requêtes par mois
    )

    calc = SRECalculator(service_slo)
    # Simulation avec un Burn Rate critique de 14.4x (2% du budget consommé en 1h)
    calc.print_report(current_burn_rate=14.4)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SLI** | Service Level Indicator — Mesure quantitative de la qualité d'un service (ex: latence, taux de succès) |
| **SLO** | Service Level Objective — Cible de fiabilité interne visée par l'équipe SRE |
| **SLA** | Service Level Agreement — Engagement contractuel vis-à-vis des clients avec pénalités financières |
| **Error Budget** | Budget d'erreur toléré ($100\% - \text{SLO}$), arbitrant entre innovation et stabilité |
| **Burn Rate** | Vitesse à laquelle le budget d'erreur est consommé par rapport au rythme normal |

---

## Exercices Pratiques

### Exercice 1 — Calcul d'Error Budget

Un service web critique a un SLO de **99.95%** mesuré sur une fenêtre glissante de **30 jours**.

1. Calculez la durée maximale d'indisponibilité autorisée par mois (en minutes et secondes).
2. Si une panne survient et dure **15 minutes**, quel pourcentage de l'Error Budget mensuel a été consommé par ce seul incident ?
3. L'équipe produit peut-elle continuer à déployer de nouvelles fonctionnalités ?

**Corrigé guidé :**
1. $\text{Error Budget} = 100\% - 99.95\% = 0.05\%$.
   $\text{Durée totale du mois} = 30 \times 24 \times 60 = 43\,200 \text{ minutes}$.
   $\text{Indisponibilité autorisée} = 0.0005 \times 43\,200 = \mathbf{21.6 \text{ minutes}}$ (soit 21 minutes et 36 secondes).
2. $\text{Consommation} = \frac{15 \text{ min}}{21.6 \text{ min}} \times 100 = \mathbf{69.4\%}$ du budget d'erreur mensuel consommé.
3. **Oui**, mais il ne reste plus que $30.6\%$ du budget (6.6 minutes d'indisponibilité tolérée) pour les 30 jours suivants. L'équipe produit doit redoubler de prudence sur les déploiements à venir.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la relation correcte entre **SLA** et **SLO** selon les meilleures pratiques SRE ?

- A) Le SLA doit toujours être supérieur au SLO.
- B) Le SLA et le SLO doivent être exactement égaux.
- C) Le SLO doit être plus strict que le SLA ($SLA < SLO$) pour offrir une marge de sécurité avant de subir des pénalités financières. ✅
- D) Le SLA n'a aucun lien avec le SLO.

**Q2.** Qu'est-ce que l'**Error Budget (Budget d'Erreur)** en SRE ?

- A) Le budget financier alloué à l'achat de serveurs de secours.
- B) La marge d'indisponibilité tolérée ($100\% - SLO$), qui sert de monnaie d'échange pour arbitrer entre la vitesse d'innovation (déploiement de features) et la stabilité. ✅
- C) Le nombre de bugs soumis par les utilisateurs.
- D) Le salaire des ingénieurs SRE.

**Q3.** Que se passe-t-il lorsque l'**Error Budget** d'un service est entièrement consommé (budget = 0%) ?

- A) Le service est définitivement fermé.
- B) Les déploiements de nouvelles fonctionnalités sont gelés (Freeze), et l'équipe d'ingénierie se consacre exclusivement aux travaux de fiabilité et de correction de bugs. ✅
- C) Les ingénieurs SRE sont licenciés.
- D) L'entreprise doit payer une amende à Google.

**Q4.** Dans l'alerting SRE moderne, que mesure le **Burn Rate** ?

- A) La température physique des processeurs dans le datacenter.
- B) La vitesse à laquelle le budget d'erreur se consomme par rapport au rythme normal. Un Burn Rate de 14.4 signifie que 2% du budget mensuel est consommé en 1 heure. ✅
- C) Le nombre de requêtes HTTP par seconde.
- D) La vitesse de téléchargement des images Docker.

**Q5.** Un SLI (Service Level Indicator) de disponibilité est calculé par la formule :

- A) $\text{SLI} = \text{Nombre total de requêtes} / \text{Nombre d'erreurs}$
- B) $\text{SLI} = (\text{Événements bons} / \text{Total des événements}) \times 100$ ✅
- C) $\text{SLI} = \text{Temps de réponse CPU} + \text{Temps de réponse RAM}$
- D) $\text{SLI} = \text{SLO} - \text{SLA}$

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
