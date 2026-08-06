# TOME P4 — Cloud, DevOps & SecOps — Jour 188 (6h) : Monitoring Avancé & SRE (Golden Signals, SLO/Error Budget, Prometheus/Grafana Alerting & Dashboards de Production)

> [!NOTE]
> **Objectif du jour :** Maîtriser la pratique du **SRE (Site Reliability Engineering)** selon les principes Google : les **4 Golden Signals** de monitoring (Latence, Trafic, Erreurs, Saturation), définition et gestion des **SLO/SLA/Error Budgets**, construction de **dashboards Grafana** de production, configuration d'alerting Prometheus multi-niveaux et techniques d'**On-Call** pour les équipes ops.
>
> **Compétences visées :** `OPS-06` (A) — Monitoring SRE & Observabilité Production | `OPS-05` (A) — Prometheus Grafana Alerting

---

## 1) Module — Les 4 Golden Signals & SLI/SLO/SLA/Error Budget (2h)

### 📖 Narration/Intuition

Combien de métriques faut-il surveiller pour un système bancaire comme la BCC ? Des centaines ? Des milliers ? Google SRE a répondu à cette question : **4 signaux** suffisent pour détecter 95% des problèmes de production. Ces **4 Golden Signals** forment la base de tout monitoring SRE efficace.

### 🔍 Anatomie Technique

**Les 4 Golden Signals SRE :**

```
GOLDEN SIGNAL 1 — LATENCE (Latency)
═════════════════════════════════════
Définition : Temps de réponse des requêtes réussies ET des requêtes en erreur
  - Métrique clé : Percentile P50, P95, P99 de http_request_duration_seconds
  - ⚠️ Distinguer la latence des réussites et des erreurs :
    Une erreur rapide (5ms) ne couvre pas une requête lente (30s)

Requête PromQL :
  histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket{
      job="bcc-api", status!~"5.."}[5m])) by (le))

Target BCC : P99 < 500ms pour les virements | P99 < 200ms pour les soldes

──────────────────────────────────────────────────────────────────────────
GOLDEN SIGNAL 2 — TRAFIC (Traffic)
═════════════════════════════════════
Définition : Volume de demandes que le système traite (débit)
  - API REST : Requêtes par seconde (RPS)
  - BDD : Transactions par seconde (TPS)

Requête PromQL :
  sum(rate(http_requests_total{job="bcc-api"}[5m])) by (endpoint)

Utilité : Identifier les pics de charge, corrélation trafic/latence/erreurs

──────────────────────────────────────────────────────────────────────────
GOLDEN SIGNAL 3 — ERREURS (Errors)
═════════════════════════════════════
Définition : Taux de requêtes échouant (HTTP 5xx, timeouts, erreurs applicatives)
  - Ratio : Erreurs / Total des requêtes

Requête PromQL :
  sum(rate(http_requests_total{job="bcc-api", status=~"5.."}[5m]))
  / sum(rate(http_requests_total{job="bcc-api"}[5m])) * 100

Target BCC : Taux d'erreur < 0.1% sur 5 minutes glissantes

──────────────────────────────────────────────────────────────────────────
GOLDEN SIGNAL 4 — SATURATION (Saturation)
═══════════════════════════════════════════
Définition : Utilisation des ressources critiques (CPU, RAM, connexions BDD)
  - Anticipe les pannes avant qu'elles surviennent
  - La saturation précède souvent la dégradation de latence

Requêtes PromQL :
  # CPU Node K8s
  100 * (1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])))
  
  # Pool de connexions PostgreSQL (Saturation si > 80%)
  pg_stat_activity_count / pg_settings_max_connections * 100

Target BCC : CPU < 70% | Connexions BDD < 80%
```

**Pyramide SLI → SLO → SLA → Error Budget :**

```
SLI (Service Level Indicator) — QUOI mesurer
  └── Métrique quantitative : Taux de succès des virements sur 30j

SLO (Service Level Objective) — OBJECTIF interne
  └── 99.95% des virements doivent réussir par mois (Engineering Target)
  └── Latence P99 < 500ms pour 99% des requêtes de virement

SLA (Service Level Agreement) — CONTRAT commercial
  └── 99.9% de disponibilité garantie avec pénalités financières

ERROR BUDGET — BUDGET de défaillance autorisé
  └── Avec un SLO de 99.95% sur 30 jours :
      Uptime cible = 30j × 24h × 60min = 43,200 min
      Budget d'erreur = 0.05% × 43,200 = 21.6 minutes d'indisponibilité autorisées/mois
  
  ✅ Si budget non consommé → L'équipe peut déployer des changements risqués
  ⚠️ Si budget à 50% consommé → Ralentir les déploiements, renforcer les tests
  🚫 Si budget épuisé → FREEZE des déploiements, focus sur la fiabilité
```

---

## 2) Module — Dashboards Grafana & Alerting Prometheus Multi-Niveaux (2h)

### 📖 Narration/Intuition

Un dashboard Grafana efficace doit permettre à un ingénieur SRE réveillé à 3h du matin par une alerte PagerDuty de **comprendre l'état du système en moins de 30 secondes** et d'identifier immédiatement le composant défaillant.

### 🔍 Anatomie Technique

**Dashboard Grafana — Rows stratégiques pour l'API BCC :**

```
ROW 1 : STATUT GLOBAL — Vue d'ensemble en 5 secondes
  ├── Stat Panel : SLO Actuel (% de succès 30j) — Vert/Orange/Rouge
  ├── Stat Panel : Error Budget Restant (%) — Jauge
  ├── Stat Panel : RPS Actuel
  └── Stat Panel : P99 Latence (ms)

ROW 2 : GOLDEN SIGNALS — Trafic, Latence, Erreurs
  ├── Time Series : RPS par endpoint (/virements, /solde, /login)
  ├── Time Series : P50, P95, P99 Latence (lignes séparées)
  └── Time Series : Taux d'erreurs HTTP (5xx) %

ROW 3 : SATURATION — Ressources K8s
  ├── Gauge : CPU par Node (%)
  ├── Gauge : RAM par Node (%)
  └── Gauge : Connexions PostgreSQL actives / Max

ROW 4 : KUBERNETES — Santé des Pods
  ├── Stat : Pods Running / Requested
  ├── Table : Pods en Crash/Error/Pending avec alerting
  └── Time Series : Restart Count par Pod (Détection CrashLoopBackOff)

ROW 5 : BUSINESS METRICS — KPIs Bancaires
  ├── Stat : Virements validés/heure
  ├── Stat : Volume total viré (CDF/heure)
  └── Time Series : Transactions par type (Virement/Retrait/Dépôt)
```

**Configuration AlertManager — Routing Multi-Niveaux (`alertmanager.yml`) :**

```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'namespace']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 12h
  receiver: 'bcc-sre-team-slack'  # Route par défaut
  
  routes:
    # Alertes CRITIQUES → PagerDuty + Slack (Réveil immédiat On-Call)
    - matchers:
        - severity=critical
      receiver: 'bcc-pagerduty-critical'
      continue: true  # Continuer vers Slack aussi
    
    # Alertes CRITIQUES → Slack également
    - matchers:
        - severity=critical
      receiver: 'bcc-sre-team-slack'
    
    # Alertes WARNING → Slack uniquement (Pas de réveil)
    - matchers:
        - severity=warning
      receiver: 'bcc-sre-team-slack'
      group_wait: 5m  # Grouper pendant 5 minutes avant envoi

receivers:
  - name: 'bcc-pagerduty-critical'
    pagerduty_configs:
      - service_key: ${{ secrets.PAGERDUTY_SERVICE_KEY }}
        description: '🚨 BCC Production Alert: {{ .GroupLabels.alertname }}'
        severity: 'critical'

  - name: 'bcc-sre-team-slack'
    slack_configs:
      - api_url: ${{ secrets.SLACK_WEBHOOK_URL }}
        channel: '#bcc-sre-alerts'
        title: '{{ if eq .Status "firing" }}🚨{{ else }}✅{{ end }} {{ .GroupLabels.alertname }}'
        text: |
          *Alertes :* {{ len .Alerts.Firing }} actives
          *Summary :* {{ (index .Alerts 0).Annotations.summary }}
          *Runbook :* {{ (index .Alerts 0).Annotations.runbook_url }}

inhibit_rules:
  # Inhiber les alertes WARNING si une alerte CRITICAL du même service est déjà active
  - source_matchers:
      - severity=critical
    target_matchers:
      - severity=warning
    equal: ['service', 'namespace']
```

---

## 3) Module — On-Call & Runbooks SRE (2h)

### 📖 Narration/Intuition

La pratique **On-Call** est le mécanisme par lequel les ingénieurs SRE se relaient pour être disponibles 24h/24 afin de répondre aux incidents de production. L'objectif SRE est de rendre l'On-Call le moins pénible possible : via des alertes actionnables, des **Runbooks** complets et une automatisation maximale.

### 🛠️ Atelier Pratique

**Runbook Opérationnel — Alerte BCCApiHighErrorRate (`runbook-high-error-rate.md`) :**

```markdown
# RUNBOOK : BCCApiHighErrorRate
## Alertname: BCCApiHighErrorRate | Severity: CRITICAL

### CONTEXTE
Cette alerte se déclenche quand le taux d'erreurs HTTP 5xx de l'API BCC
dépasse 1% sur une fenêtre de 5 minutes.

### ÉTAPES DE DIAGNOSTIC (< 5 minutes)

**Étape 1 — Vérifier quels endpoints sont affectés :**
```promql
sum(rate(http_requests_total{job="bcc-api", status=~"5.."}[5m])) by (route)
```

**Étape 2 — Vérifier l'état des Pods K8s :**
```bash
kubectl get pods -n bcc-production -l app=bcc-api
kubectl describe pod <POD_EN_ERREUR> -n bcc-production
kubectl logs <POD_EN_ERREUR> -n bcc-production --previous
```

**Étape 3 — Vérifier la connectivité à PostgreSQL :**
```bash
kubectl exec -it <POD_BCC_API> -n bcc-production -- node -e "
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  pool.query('SELECT 1').then(() => console.log('BDD OK')).catch(console.error);
"
```

### ACTIONS DE REMÉDIATION

**Si Pods en CrashLoop → Rollback de la version précédente :**
```bash
kubectl rollout undo deployment/bcc-api -n bcc-production
kubectl rollout status deployment/bcc-api -n bcc-production
```

**Si saturation de la BDD → Scale horizontal de l'API :**
```bash
kubectl scale deployment bcc-api --replicas=6 -n bcc-production
```

### ESCALADE
- > 5% erreurs pendant > 10 min → Appeler le Lead Engineer On-Call
- > 20% erreurs → Incident P0 → Activer le War Room (Teams BCC)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SLI** | Service Level Indicator — Métrique quantitative mesurant la fiabilité d'un service |
| **SLO** | Service Level Objective — Objectif de fiabilité interne de l'équipe SRE |
| **SLA** | Service Level Agreement — Contrat de niveau de service avec pénalités commerciales |
| **Error Budget** | Budget de défaillance autorisé = 100% - SLO cible |
| **On-Call** | Permanence de garde 24h/24 des ingénieries SRE pour répondre aux incidents de production |
| **Runbook** | Guide opérationnel détaillé des étapes de diagnostic et remédiation d'une alerte spécifique |
| **AlertManager** | Composant Prometheus gérant le routage, le groupement et le silencing des alertes |
| **PromQL** | Prometheus Query Language — Langage de requête de la base de données métriques Prometheus |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Calculer l'**Error Budget mensuel** pour un SLO de 99.9% sur l'API de virements BCC, et expliquer ce que l'équipe SRE doit faire si l'Error Budget est épuisé à 75% le 15 du mois.

**Corrigé :** Un mois de 30 jours = 30 × 24 × 60 = **43 200 minutes**. Error Budget = (100% - 99.9%) × 43 200 = **0.1% × 43 200 = 43.2 minutes** d'indisponibilité autorisées par mois. Si le budget est épuisé à 75% le 15 du mois : 75% × 43.2 = 32.4 minutes déjà consommées, avec 16 jours restants. Cela signifie que le rythme de consommation est 2x trop rapide (50% du mois consommé pour 75% du budget). Actions SRE : (1) **Ralentir ou geler les déploiements risqués** pour le reste du mois, (2) Analyser en profondeur les incidents de disponibilité passés pour identifier la root cause, (3) Prioriser les améliorations de fiabilité plutôt que les nouvelles fonctionnalités, (4) Revoir les seuils d'alerting pour détecter plus tôt les prochains incidents.

**Exercice 2 :** Expliquer l'utilité des **inhibit_rules** dans AlertManager et donner un exemple concret dans le contexte de la BCC.

**Corrigé :** Les **inhibit_rules** dans AlertManager permettent de **supprimer des alertes de moindre importance quand une alerte de plus haute criticité est déjà active** sur le même service. Exemple concret BCC : Si l'alerte **CRITICAL** `BCCApiPodCrashLooping` est active (tous les Pods de l'API sont en crash), plusieurs alertes WARNING seront également générées en conséquence : `BCCApiHighLatency`, `BCCApiLowRPS`, `BCCDatabaseConnectionsHigh`. Toutes ces alertes WARNING sont des **symptômes** du crash des Pods, pas des causes indépendantes. Sans inhibit_rules, l'ingénieur On-Call reçoit 10 alertes PagerDuty simultanées pour le même incident, ce qui crée de la confusion et du bruit. Avec `inhibit_rules: source_matchers: [severity=critical]`, AlertManager supprime automatiquement toutes les WARNING liées au même service tant que l'alerte CRITICAL est active, permettant à l'ingénieur de se concentrer sur la cause racine.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quels sont les **4 Golden Signals** SRE que Google recommande de surveiller en priorité pour tout système de production ?
- A) Latence, Trafic (RPS/TPS), Erreurs (taux d'erreurs 5xx) et Saturation (utilisation ressources)
- B) CPU, RAM, Disque et Réseau uniquement
- C) Disponibilité, Sécurité, Coût et Performance
- D) Logs, Métriques, Traces et Alertes

**Réponse : A**

**Q2 :** Qu'est-ce que l'**Error Budget** dans la pratique SRE et à quoi sert-il pour les décisions opérationnelles ?
- A) C'est le budget de défaillance autorisé (100% - SLO). Tant qu'il n'est pas épuisé, l'équipe peut déployer des changements risqués. Quand il est épuisé, les déploiements sont gelés et la priorité devient la fiabilité
- B) C'est le budget annuel alloué à la sécurité informatique
- C) C'est le nombre maximum de bugs autorisés par release
- D) C'est le temps alloué aux post-mortems d'incidents

**Réponse : A**

**Q3 :** Quelle est la différence sémantique entre un **SLI**, un **SLO** et un **SLA** dans le contexte SRE ?
- A) Le SLI est la métrique mesurée, le SLO est l'objectif interne de l'équipe technique, le SLA est le contrat commercial avec pénalités
- B) Ce sont trois synonymes désignant la même chose
- C) Le SLI est le contrat, le SLO est la métrique, le SLA est l'objectif
- D) Seul le SLA est utilisé dans la pratique SRE

**Réponse : A**

**Q4 :** Dans AlertManager, quel est le rôle d'une règle **inhibit_rule** ?
- A) Supprimer des alertes de moindre importance (WARNING) quand une alerte de plus haute criticité (CRITICAL) est déjà active sur le même service, réduisant le bruit pour l'ingénieur On-Call
- B) Bloquer l'envoi de toutes les alertes pendant les heures de maintenance
- C) Router les alertes vers différents canaux selon l'heure de la journée
- D) Grouper plusieurs alertes similaires en une seule notification

**Réponse : A**

**Q5 :** Pourquoi un **Runbook** opérationnel est-il essentiel pour un ingénieur SRE On-Call réveillé à 3h du matin par une alerte PagerDuty ?
- A) Le Runbook fournit un guide pas-à-pas spécifique à l'alerte (diagnostic, commandes à exécuter, critères d'escalade) permettant à l'ingénieur de diagnostiquer et résoudre rapidement sans avoir à retrouver de mémoire les procédures, réduisant le MTTR même avec un niveau de stress élevé
- B) Le Runbook est un document légal de non-responsabilité
- C) Le Runbook remplace la documentation technique du service
- D) Le Runbook est généré automatiquement par Prometheus

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
