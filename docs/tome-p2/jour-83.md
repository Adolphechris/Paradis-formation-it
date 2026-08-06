# TOME P2 — Réseaux & Télécoms — Jour 83 (6h) : Supervision des Performances & Observabilité (Prometheus, Grafana & Jaeger)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre une architecture complète d'observabilité sur l'infrastructure et les applications de la BCC : métriques temps réel avec Prometheus, dashboards de visualisation avec Grafana, et traçage distribué des requêtes (Distributed Tracing) avec OpenTelemetry / Jaeger.
>
> **Compétences visées :** `POL-03` (A) — Supervision & Observabilité | `BIT-04` (A) — Monitoring des Infrastructures Avancées

---

## 1) Module — Les Piliers de l'Observabilité & Architecture Prometheus (2h)

### 📖 Narration/Intuition

La supervision traditionnelle (SNMP, pings) répond à la question : *"Le serveur est-il en vie ?"*. L'**observabilité moderne** répond aux questions complexes : *"Pourquoi le temps de réponse de l'API de virement a-t-il augmenté de 400 ms à 14h30 ?"*, *"Quel microservice ou quelle requête SQL est responsable du goulot d'étranglement ?"*.

L'observabilité repose sur **3 piliers fondamentaux** :
1. **Metrics (Métriques)** : Valeurs numériques agrégées dans le temps (ex: CPU %, débit/s, taux d'erreur).
2. **Logs (Journaux)** : Événements horodatés détaillés (ex: stack traces, erreurs applicatives).
3. **Traces (Traçage distribué)** : Parcours d'une requête individuelle à travers tous les microservices.

### 🔍 Anatomie Technique

**Architecture Prometheus (Modèle Pull) :**

```
┌─────────────────────────────────────────────────────────────┐
│                     TARGETS À SURVEILLER                    │
│                                                             │
│  ┌────────────────┐   ┌────────────────┐   ┌─────────────┐  │
│  │ Node Exporter  │   │ Postgres       │   │ App Flask   │  │
│  │ (Métriques OS) │   │ Exporter       │   │ (/metrics)  │  │
│  │  port 9100     │   │  port 9187     │   │  port 8080  │  │
│  └───────▲────────┘   └───────▲────────┘   └──────▲──────┘  │
└──────────┼────────────────────┼───────────────────┼─────────┘
           │ Scraping HTTP (Pull périodique toutes les 15s)
┌──────────┴────────────────────┴───────────────────┴─────────┐
│                     SERVEUR PROMETHEUS                      │
│                                                             │
│  ┌─────────────────┐   ┌─────────────────┐   ┌───────────┐  │
│  │ Retrieval       │   │ TSDB            │   │ HTTP API  │  │
│  │ Engine          │──→│ (Time Series DB)│──→│ & PromQL  │  │
│  └─────────────────┘   └─────────────────┘   └─────┬─────┘  │
└────────────────────────────────────────────────────┼────────┘
                                                     │ PromQL
                                        ┌────────────▼────────────┐
                                        │ Grafana Dashboards      │
                                        │ & Alertmanager          │
                                        └─────────────────────────┘
```

---

## 2) Module — Instrumentation d'une Application avec Métriques Prometheus (2h)

### 📖 Narration/Intuition

Pour qu'une application puisse être supervisée finement par Prometheus, elle doit exposer un point d'accès HTTP `/metrics` au format Prometheus. Les 4 métriques dorées (Golden Signals de Google) sont : **la latence**, **le trafic**, **les erreurs** et **la saturation**.

### 🔍 Anatomie Technique

**Instrumentation d'une API Python/Flask (`prometheus_app.py`) :**

```python
#!/usr/bin/env python3
"""
prometheus_app.py — API Flask instrumentée avec la bibliothèque officielle prometheus_client
"""
from flask import Flask, request, jsonify
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
import time
import random

app = Flask(__name__)

# ─── Définition des Métriques Prometheus ──────────────────────────────────────
# 1. Compteur : valeur qui ne fait qu me monter (ex: nombre total de requêtes)
REQUEST_COUNT = Counter(
    'bcc_http_requests_total',
    'Nombre total de requêtes HTTP reçues',
    ['method', 'endpoint', 'http_status']
)

# 2. Histogramme : mesure la distribution des durées (latence) et tailles
REQUEST_LATENCY = Histogram(
    'bcc_http_request_duration_seconds',
    'Latence des requêtes HTTP en secondes',
    ['endpoint'],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0]
)

# 3. Gauge : valeur qui peut monter et descendre (ex: connexions actives, solde)
ACTIVE_TRANSACTIONS = Gauge(
    'bcc_active_transactions',
    'Nombre de transactions financières en cours de traitement'
)

# ─── Middleware de mesure ──────────────────────────────────────────────────────
@app.before_request
def before_request():
    request.start_time = time.time()

@app.after_request
def after_request(response):
    if hasattr(request, 'start_time'):
        latency = time.time() - request.start_time
        endpoint = request.endpoint or 'unknown'
        
        # Enregistrer les métriques
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=endpoint,
            http_status=response.status_code
        ).inc()
        
        REQUEST_LATENCY.labels(endpoint=endpoint).observe(latency)
        
    return response

# ─── Endpoint /metrics pour le scraping Prometheus ───────────────────────────
@app.route('/metrics')
def metrics():
    """Expose toutes les métriques au format texte brut Prometheus."""
    return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}

# ─── Endpoints Métier ──────────────────────────────────────────────────────────
@app.route('/api/v1/virement', methods=['POST'])
def effectuer_virement():
    ACTIVE_TRANSACTIONS.inc()
    try:
        # Simulation du traitement bancaire
        délai = random.uniform(0.05, 0.4)
        time.sleep(délai)
        return jsonify({"status": "success", "tx_id": "TX-9988"}), 200
    finally:
        ACTIVE_TRANSACTIONS.dec()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
```

**Exemples de requêtes PromQL (Prometheus Query Language) :**

```promql
# Taux de requêtes par seconde (RPS) sur 5 minutes
sum(rate(bcc_http_requests_total[5m])) by (endpoint)

# Taux d'erreur 5xx en pourcentage
(sum(rate(bcc_http_requests_total{http_status=~"5.."}[5m])) 
 / sum(rate(bcc_http_requests_total[5m]))) * 100

# 95ème centile de latence (95% des utilisateurs répondus en moins de X secondes)
histogram_quantile(0.95, sum(rate(bcc_http_request_duration_seconds_bucket[5m])) by (le))
```

---

## 3) Module — Traçage Distribué avec OpenTelemetry & Jaeger (2h)

### 📖 Narration/Intuition

Lorsqu'un utilisateur clique sur "Valider le virement", la requête traverse 5 microservices : l'API Gateway, le service Auth, le service Solde, le service Fraud Detection, et le service Core Banking. Si la requête prend 3 secondes au lieu de 200 ms, les métriques et les logs seuls ne montrent pas quel microservice est responsable.

**Jaeger** et **OpenTelemetry** génèrent une **trace distribuée** : un identifiant unique (`TraceID`) accompagne la requête à travers tous les microservices. Chaque étape (appel DB, appel API externe, calcul) génère un **Span** qui montre exactement le temps passé à chaque endroit sous forme de chronogramme.

### 🔍 Anatomie Technique

**Concepts clés du Traçage Distribué :**

```
TraceID : Identifiant global unique partagé par tous les microservices pour une même requête.
Span : Unité de travail individuelle avec un nom, un timestamp de début et de fin, et des métadonnées (Tags/Events).

Exemple de Trace :
[Front-API: POST /virement] ─────────────────────────────────────────────── (300ms total)
   ├── [Auth-Service: Validate Token] ────── (20ms)
   ├── [Fraud-Service: Check Risk] ─────────────── (150ms)
   └── [DB-Service: UPDATE solde] ─────────────────────── (80ms)
```

**Instrumentation OpenTelemetry en Python (`tracing_setup.py`) :**

```python
#!/usr/bin/env python3
"""
tracing_setup.py — Configuration d'OpenTelemetry avec exportateur OTLP vers Jaeger
"""
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource

def init_tracer(service_name):
    # Définir l'identité du service
    resource = Resource.create(attributes={"service.name": service_name})
    
    # Créer le provider de traces
    provider = TracerProvider(resource=resource)
    
    # Configurer l'exportateur vers Jaeger (écouteur OTLP gRPC sur port 4317)
    otlp_exporter = OTLPSpanExporter(endpoint="http://jaeger:4317", insecure=True)
    
    # Utiliser BatchSpanProcessor pour regrouper les envois sans impacter les performances
    span_processor = BatchSpanProcessor(otlp_exporter)
    provider.add_span_processor(span_processor)
    
    trace.set_tracer_provider(provider)
    return trace.get_tracer(service_name)

# Utilisation dans le code métier
tracer = init_tracer("bcc-virement-service")

def traiter_virement(compte_src, compte_dest, montant):
    with tracer.start_as_current_span("traiter_virement_main") as span:
        span.set_attribute("bcc.montant", montant)
        span.set_attribute("bcc.devise", "CDF")
        
        # Sous-opération 1 : Vérification de la fraude
        with tracer.start_as_current_span("verification_fraude") as sub_span:
            sub_span.set_attribute("risk_score", 0.02)
            time.sleep(0.05)  # Simulation
            
        # Sous-opération 2 : Mise à jour BDD
        with tracer.start_as_current_span("db_update_solde") as db_span:
            db_span.set_attribute("db.system", "postgresql")
            db_span.set_attribute("db.statement", "UPDATE comptes SET solde = solde - $1")
            time.sleep(0.08)  # Simulation
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PromQL** | Prometheus Query Language — langage de requête temps réel de Prometheus |
| **TSDB** | Time Series Database — base de données orientée séries temporelles |
| **OTEL** | OpenTelemetry — standard unifié d'instrumentation (Traces, Metrics, Logs) |
| **OTLP** | OpenTelemetry Protocol — protocole de transport des données d'observabilité |
| **RPS** | Requests Per Second — nombre de requêtes traitées par seconde |
| **SLO** | Service Level Objective — objectif mesurable de niveau de service (ex: 99.9% < 200ms) |
| **SLI** | Service Level Indicator — métrique réelle servant à vérifier le SLO |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre une métrique de type **Counter** et une métrique de type **Gauge** dans Prometheus ?

**Corrigé :** Un **Counter** est une métrique cumulative qui ne peut que **monter** (ou être réinitialisée à 0 au redémarrage). Il sert à compter des événements (ex: nombre total de requêtes HTTP, nombre d'erreurs). Une **Gauge** est une métrique qui peut **monter et descendre** à tout moment pour représenter l'état instantané d'un système (ex: utilisation CPU %, nombre de connexions actives, espace disque libre).

**Exercice 2 :** Pourquoi utilise-t-on le traçage distribué (Jaeger/OpenTelemetry) au lieu de simples logs applicatifs dans une architecture en microservices ?

**Corrigé :** Dans une architecture microservices, une seule requête utilisateur déclenche une chaîne d'appels à travers plusieurs services distincts. Les logs isolés de chaque service ne permettent pas de corréler facilement ces événements ni de calculer le temps passé spécifiquement dans chaque sous-appel. Le traçage distribué propage un `TraceID` unique tout au long de la chaîne d'appel pour reconstruire le chronogramme complet (waterfall) de la requête.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quels sont les 3 piliers de l'observabilité moderne ?
- A) CPU, RAM, Disque
- B) Metrics, Logs, Traces
- C) Firewall, Router, Switch
- D) Docker, Kubernetes, Ansible

**Réponse : B**

**Q2 :** Par quel mécanisme le serveur Prometheus récupère-t-il par défaut les métriques auprès des applications cibles ?
- A) Modèle Push (les applications poussent leurs métriques vers Prometheus)
- B) Modèle Pull / Scraping (Prometheus interroge périodiquement le point d'accès HTTP `/metrics` des applications)
- C) Envoi par e-mail
- D) Lecture directe du système de fichiers du serveur

**Réponse : B**

**Q3 :** En PromQL, que calcule la fonction `rate(http_requests_total[5m])` ?
- A) La somme totale de toutes les requêtes depuis le démarrage
- B) Le taux moyen d'augmentation par seconde de la métrique sur la fenêtre glissante des 5 dernières minutes
- C) La latence maximale enregistrée au cours des 5 dernières minutes
- D) Le nombre de serveurs actifs

**Réponse : B**

**Q4 :** Quel objet OpenTelemetry représente l'unité de travail individuelle (ex: une requête SQL ou un appel HTTP) au sein d'une trace distribuée ?
- A) Log
- B) Metric
- C) Span
- D) Counter

**Réponse : C**

**Q5 :** Dans le cadre des "Golden Signals" de Google pour la supervision, quelles sont les 4 métriques fondamentales à surveiller ?
- A) Hostname, IP, MAC, DNS
- B) Latence, Trafic, Erreurs, Saturation
- C) CPU, RAM, Disque, Réseau
- D) Login, Password, Token, Key

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
