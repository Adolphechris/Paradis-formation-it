# TOME P4 — Cloud, DevOps & SecOps — Jour 180 (6h) : Projet Intégrateur Semestre 4 — Partie 3 : Pipeline DevSecOps Complet & Architecture Cloud-Native BCC

> [!NOTE]
> **Objectif du jour :** Synthétiser les acquis des Jours 176 à 179 dans un **projet intégrateur complet** : conception d'une architecture **cloud-native** pour le Système de Core Banking de la BCC, implémentation d'un pipeline **DevSecOps** de bout en bout (Code → CI/CD → Docker → K8s → Cloud), gestion des secrets, observabilité et documentation d'architecture.
>
> **Compétences visées :** `OPS-04` à `OPS-06` (A) — Architecture Cloud-Native & DevSecOps Complet | `SEC-05` (A) — Sécurité by Design

---

## 1) Module — Architecture Cloud-Native BCC : Conception & Décisions Techniques (2h)

### 📖 Narration/Intuition

Nous avons étudié individuellement les briques technologiques : Docker, Kubernetes, CI/CD avec GitHub Actions et GitOps ArgoCD, Terraform IaC, IAM Cloud. Aujourd'hui, nous les assemblons dans une architecture cohérente, sécurisée et opérationnelle pour le **Système de Core Banking de la Banque Centrale du Congo (BCC)**.

### 🔍 Anatomie Technique

**Architecture Cloud-Native BCC — Diagramme Haute Disponibilité Multi-AZ :**

```
                         INTERNET (Clients Web/Mobile)
                                    │
                            ┌───────▼────────┐
                            │  AWS Route 53  │ (DNS Global + Health Checks)
                            │  + CloudFront  │ (CDN + WAF Protection DDoS)
                            └───────┬────────┘
                                    │ HTTPS/443
                  ┌─────────────────▼─────────────────────┐
                  │         AWS VPC — bcc-prod-vpc          │
                  │          CIDR : 10.0.0.0/16             │
                  │                                         │
                  │  ┌─────── PUBLIC SUBNETS ────────────┐ │
                  │  │  ┌─────────────────────────────┐  │ │
                  │  │  │ AWS ALB (Application Load   │  │ │
                  │  │  │  Balancer) — TLS Termination│  │ │
                  │  │  └─────────────┬───────────────┘  │ │
                  │  └───────────────│────────────────────┘ │
                  │                  │                       │
                  │  ┌─────── PRIVATE SUBNETS ───────────┐  │
                  │  │         AZ-a        AZ-b   AZ-c   │  │
                  │  │  ┌──────────┐  ┌──────────┐      │  │
                  │  │  │EKS Node 1│  │EKS Node 2│ ...  │  │
                  │  │  │ Pod(API) │  │ Pod(API) │      │  │
                  │  │  │ Pod(API) │  │ Pod(API) │      │  │
                  │  │  └──────────┘  └──────────┘      │  │
                  │  │                                    │  │
                  │  │  ┌──────────────────────────────┐ │  │
                  │  │  │ AWS RDS PostgreSQL Multi-AZ  │ │  │
                  │  │  │ (Primary AZ-a / Standby AZ-b)│ │  │
                  │  │  └──────────────────────────────┘ │  │
                  │  │                                    │  │
                  │  │  ┌──────────────────────────────┐ │  │
                  │  │  │ ElastiCache Redis (Cluster)  │ │  │
                  │  │  └──────────────────────────────┘ │  │
                  │  └────────────────────────────────────┘  │
                  │                                           │
                  └───────────────────────────────────────────┘

SÉCURITÉ & OBSERVABILITÉ :
  ┌──────────────────────────────────────────────────────────────┐
  │  AWS KMS (Chiffrement Keys) │ AWS Secrets Manager (Secrets)  │
  │  AWS CloudWatch (Logs/Metrics) │ AWS CloudTrail (Audit IAM)  │
  │  Prometheus + Grafana (K8s Monitoring) │ Trivy (Image Scan)  │
  └──────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Pipeline DevSecOps de Bout en Bout (2h)

### 📖 Narration/Intuition

Le **Pipeline DevSecOps** est le flux automatisé qui transforme chaque ligne de code écrite par un développeur BCC en une fonctionnalité opérationnelle en production, avec des contrôles de sécurité à chaque étape.

### 🔍 Anatomie Technique

**Flux complet du Pipeline DevSecOps BCC :**

```
 DÉVELOPPEUR BCC
      │ git push feature/virement-express
      │
      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   GITHUB ACTIONS CI/CD PIPELINE                     │
│                                                                     │
│  PHASE CI (Continuous Integration)                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 1. Checkout Code   2. npm ci    3. ESLint     4. Jest Tests  │  │
│  │ 5. Jest Coverage   6. CodeQL   (SAST Analysis)               │  │
│  │ ▶ Si l'une des étapes échoue → Pipeline stoppé + Notification│  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  PHASE BUILD & SCAN                                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 7. docker build --target production (Multi-Stage)            │  │
│  │ 8. docker push → GHCR (Registry Privé)                       │  │
│  │ 9. Trivy Image Scan (CVE CRITICAL/HIGH → Bloque le pipeline) │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  PHASE CD (Continuous Deployment) — Uniquement sur branche main    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 10. Git commit sur dépôt GitOps (MAJ du tag image K8s)       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ARGOCD (GitOps Sync)                             │
│  11. ArgoCD détecte le changement dans le dépôt GitOps             │
│  12. ArgoCD applique les nouveaux manifestes K8s                    │
│  13. Rolling Update K8s (0 downtime) — maxUnavailable: 0           │
│  14. Health Check des Pods (Liveness + Readiness Probes)            │
│  15. Rollback automatique si les Probes échouent                    │
└─────────────────────────────────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                 KUBERNETES EKS PRODUCTION (AWS)                      │
│  3 Répliques API Node.js | RDS PostgreSQL Multi-AZ | Redis Cluster  │
│  RBAC strict | Secrets AWS | Network Policies | Pod Security         │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3) Module — Observabilité & SRE : Monitoring, Logging & Alerting (2h)

### 📖 Narration/Intuition

Une architecture cloud-native sans observabilité est comme un avion sans instruments de bord. Comment l'équipe SRE (Site Reliability Engineering) de la BCC sait-elle que tout va bien — ou mal — en production ? Via les **3 Piliers de l'Observabilité** : **Métriques**, **Logs** et **Traces**.

### 🔍 Anatomie Technique

**Configuration Prometheus & Alerting pour l'API BCC :**

```yaml
# Règles d'alerting Prometheus pour l'API BCC (alerting_rules.yaml)
groups:
  - name: bcc-api-alerts
    rules:
      # Alerte 1 : Taux d'erreur HTTP 5xx > 1% pendant 5 minutes
      - alert: BCCApiHighErrorRate
        expr: |
          sum(rate(http_requests_total{job="bcc-api", status=~"5.."}[5m]))
          / sum(rate(http_requests_total{job="bcc-api"}[5m])) > 0.01
        for: 5m
        labels:
          severity: critical
          team: ops-bcc
        annotations:
          summary: "🚨 API BCC — Taux d'erreur 5xx élevé : {{ $value | humanizePercentage }}"
          description: "L'API Core Banking signale un taux d'erreurs critique. Intervention immédiate requise."
          runbook_url: "https://wiki.bcc.cd/runbooks/api-5xx-errors"

      # Alerte 2 : Latence P99 > 2 secondes
      - alert: BCCApiHighLatency
        expr: |
          histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{job="bcc-api"}[5m])) > 2
        for: 5m
        labels:
          severity: warning
          team: ops-bcc
        annotations:
          summary: "⚠️ API BCC — Latence P99 élevée : {{ $value | humanizeDuration }}"

      # Alerte 3 : Pod BCC API en CrashLoopBackOff
      - alert: BCCApiPodCrashLooping
        expr: |
          kube_pod_container_status_restarts_total{namespace="bcc-production", container="bcc-api"} > 5
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "🔴 Pod BCC API en CrashLoop — Intervention urgente"
```

**Instrumentation de l'API Node.js avec `prom-client` :**

```javascript
const promClient = require('prom-client');

// Initialisation du registre Prometheus
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Histogramme : Durée des requêtes HTTP
const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Durée des requêtes HTTP en secondes',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5] // Seuils en secondes
});
register.registerMetric(httpRequestDuration);

// Compteur : Total de requêtes par statut HTTP
const httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Nombre total de requêtes HTTP',
    labelNames: ['method', 'route', 'status']
});
register.registerMetric(httpRequestsTotal);

// Middleware Express pour instrumenter toutes les requêtes
app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer();

    res.on('finish', () => {
        const labels = { method: req.method, route: req.route?.path || req.path, status: res.statusCode };
        end(labels);
        httpRequestsTotal.inc(labels);
    });

    next();
});

// Endpoint Prometheus (Scraping des métriques par Prometheus Server)
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SRE** | Site Reliability Engineering — Discipline Google appliquant l'ingénierie logicielle aux opérations système |
| **ALB** | Application Load Balancer — Répartiteur de charge L7 AWS (HTTP/HTTPS) avec routing basé sur les URLs |
| **EKS** | Elastic Kubernetes Service — Service Kubernetes managé par AWS |
| **ElastiCache** | Service de cache managé AWS (Redis ou Memcached) |
| **P99** | Percentile 99 — Mesure de latence que 99% des requêtes respectent (indicateur de performance de queue) |
| **MTTD** | Mean Time To Detect — Temps moyen pour détecter un incident |
| **MTTR** | Mean Time To Recover — Temps moyen pour rétablir le service après un incident |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Décrire les **3 Piliers de l'Observabilité** (Métriques, Logs, Traces) et donner un exemple concret pour chacun dans le contexte de l'API BCC.

**Corrigé :**
- **Métriques** : Données numériques agrégées mesurées dans le temps. Exemple BCC : `bcc_virements_total{status="success"}` (nombre de virements réussis/seconde), latence P95/P99 des endpoints, taux d'erreur HTTP 5xx. Outil : Prometheus + Grafana.
- **Logs** : Événements textuels structurés horodatés (JSON recommandé). Exemple BCC : `{"timestamp":"2026-06-17T09:15:32Z","level":"ERROR","traceId":"a1b2c3d4","userId":"usr_998811","event":"VIREMENT_FAILED","reason":"INSUFFICIENT_FUNDS","amount":500000}`. Outil : ELK Stack, Loki.
- **Traces Distribuées** : Suivi du cheminement d'une requête à travers tous les microservices (API → BDD → Cache → Service de notification). Permet d'identifier quel service précis est responsable d'une latence. Exemple BCC : Trace d'un virement : API (5ms) → Validation (2ms) → PostgreSQL (150ms — ⚠️ goulot d'étranglement !) → Kafka (3ms) → Notification SMS (45ms). Outil : OpenTelemetry, Jaeger, Zipkin.

**Exercice 2 :** Qu'est-ce qu'un **SLO (Service Level Objective)** et un **SLA (Service Level Agreement)** dans le contexte SRE de l'API BCC, et quelle est la relation entre les deux ?

**Corrigé :** Un **SLO (Service Level Objective)** est un objectif technique interne de fiabilité que l'équipe SRE de la BCC s'engage à maintenir (ex: "L'API de virement doit être disponible à 99.95% sur un mois glissant, et la latence P99 ne doit pas dépasser 500ms"). Le **SLA (Service Level Agreement)** est le contrat commercial signé avec les clients de la BCC (autres banques, partenaires FinTech) qui définit les engagements de disponibilité et les pénalités financières en cas de non-respect (ex: "99.9% disponibilité garantie, sinon crédit de service"). La règle d'or SRE : le **SLO doit toujours être plus strict que le SLA** pour que l'équipe dispose d'une marge de manœuvre (Error Budget) avant de violer le contrat commercial.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans l'architecture cloud-native BCC, quel service AWS est responsable d'équilibrer le trafic HTTP/HTTPS entrant vers les Pods du cluster EKS, en terminant les sessions TLS ?
- A) L'ALB (Application Load Balancer)
- B) Le Security Group
- C) Le VPC Peering
- D) Le CloudFront uniquement

**Réponse : A**

**Q2 :** Quels sont les 3 Piliers de l'Observabilité dans une architecture cloud-native ?
- A) Métriques (Prometheus), Logs (structurés JSON) et Traces distribuées (OpenTelemetry)
- B) CPU, RAM et Disque
- C) Docker, Kubernetes et Terraform
- D) CI, CD et GitOps

**Réponse : A**

**Q3 :** Dans le pipeline DevSecOps BCC, à quelle étape l'image Docker est-elle scannée pour des vulnérabilités CVE afin de bloquer le déploiement d'une image non sécurisée ?
- A) Après le build de l'image Docker et avant le push vers le Registry de production (Phase Build & Scan)
- B) Uniquement en production après le déploiement
- C) Uniquement en développement local
- D) Trivy n'est pas utilisé dans le pipeline

**Réponse : A**

**Q4 :** Que signifie **MTTR (Mean Time To Recover)** dans le contexte SRE, et comment l'observabilité (métriques, alerting) contribue-t-elle à le réduire ?
- A) C'est le temps moyen pour rétablir le service après un incident. L'alerting Prometheus/Grafana notifie l'équipe dès la détection de l'anomalie (MTTD réduit), et les traces distribuées identifient rapidement le service défaillant, accélérant la remédiation
- B) C'est le temps moyen entre deux déploiements
- C) C'est le temps moyen pour construire une image Docker
- D) C'est le temps moyen d'un scan Trivy

**Réponse : A**

**Q5 :** Dans ArgoCD, quelle propriété de l'Application garantit que si un opérateur modifie manuellement un Deployment K8s en dehors du pipeline (ex: via `kubectl edit`), ArgoCD restaure automatiquement l'état défini dans le dépôt Git ?
- A) `selfHeal: true` dans la politique de synchronisation
- B) `prune: true`
- C) `CreateNamespace: true`
- D) `automated: false`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
