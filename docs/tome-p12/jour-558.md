# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 558 (6h) : Observability Engineering : OpenTelemetry, Distributed Tracing, Jaeger & OTLP

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre la différence entre **Monitoring traditionnel** (détecter qu'un système est en panne) et **Observabilité** (comprendre pourquoi un système complexe a un comportement inconnu)
> - Maîtriser le standard open-source unifié **OpenTelemetry (OTel)** : Collector, SDKs, protocole OTLP (gRPC/HTTP)
> - Implémenter le **Traçage Distribué (Distributed Tracing)** avec propagation de contexte réseau selon la norme W3C Trace Context (`traceparent`)
> - Déployer et utiliser **Jaeger / Grafana Tempo** pour visualiser les traces de requêtes traversant des dizaines de microservices
>
> **Compétences visées :** `INFRA-03` (A), `DEV-03` (A) — Observability Engineering, OpenTelemetry, Jaeger

---

## Module 1 — Les Fondements de l'Observabilité & OpenTelemetry (2h)

### 📖 Intuition & Narration

Dans un monolithe, déboguer une lenteur consiste à regarder les logs d'une seule machine. Dans une architecture microservices distribuée comprenant 100 services communiquant de manière asynchrone, un utilisateur signale une latence de 5 secondes. Où se trouve le goulot d'étranglement ? Est-ce la base de données du service A, le bus Kafka, le réseau inter-zone, ou un retry loop dans le service B ?

Le **Monitoring** répond aux questions connues ("Est-ce que le CPU est > 90% ?"). L'**Observabilité** vous permet d'interroger le système sur des comportements imprévus et inconnus ("Pourquoi la requête de l'utilisateur X à 14h02 a-t-elle pris 5 secondes ?").

### 🔍 Les 3 Piliers M.E.L.T. et le Standard OpenTelemetry

```
LES 3 PILIERS UNIFIÉS DE L'OBSERVABILITÉ (M.E.L.T.)

  METRICS (Métriques)     → Vue aggregée de la santé système (Prometheus, OpenTelemetry)
  EVENTS / LOGS (Logs)    → Contexte textuel détaillé (Loki, Elasticsearch)
  TRACES (Traces)         → Trajectoire d'une requête à travers tous les microservices

ARCHITECTURE OPENTELEMETRY (OTel)

  APPLICATION A             APPLICATION B             APPLICATION C
  ┌────────────────┐        ┌────────────────┐        ┌────────────────┐
  │ OTel SDK (Go)  │        │ OTel SDK (Py)  │        │ OTel SDK (Java)│
  └───────┬────────┘        └───────┬────────┘        └───────┬────────┘
          │ (OTLP/gRPC)             │ (OTLP/gRPC)             │ (OTLP/gRPC)
          └─────────────────────────┼─────────────────────────┘
                                    ▼
                     ┌──────────────────────────────┐
                     │ OPENTELEMETRY COLLECTOR      │
                     │ • Receiver  : OTLP / Zipkin  │
                     │ • Processor : Batch / Filter │
                     │ • Exporter  : Jaeger/Prometheus
                     └──────────────┬───────────────┘
                                    ▼
                     ┌──────────────────────────────┐
                     │ VISUALISATION                │
                     │ Grafana / Jaeger / Tempo     │
                     └──────────────────────────────┘
```

---

## Module 2 — Distributed Tracing & W3C Trace Context (2h)

### 🔍 Trajectoire d'une Trace : TraceID, SpanID et Propagation

Une **Trace** représente le cheminement complet d'une requête à travers le système. Elle est composée d'un ensemble d'unités de travail appelées **Spans** disposées sous forme d'arbre d'exécution (DAG).

```
ANATOMIE D'UNE TRACE DISTRIBUÉE

  TraceID: 4bf92f3577b34da6a3ce929d0e0e4736 (Unique pour toute la requête)

  [Span Client HTTP] (Durée totale: 450ms)
    ├── [Span Auth Service: Check Token] (Durée: 20ms)
    └── [Span Order Service: Create Order] (Durée: 410ms)
          ├── [Span DB Query: INSERT INTO orders] (Durée: 35ms)
          └── [Span Kafka Producer: Publish OrderCreated] (Durée: 15ms)
```

### 🔍 En-tête W3C Trace Context (`traceparent`)

Pour transmettre le contexte de traçage entre deux microservices via HTTP, OpenTelemetry utilise l'en-tête standard W3C `traceparent` :

$$\text{traceparent} = \texttt{version}-\text{TraceID}-\text{ParentSpanID}-\text{TraceFlags}$$

Exemple : `traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`
- `version` : `00`
- `TraceID` : 32 caractères hexadécimaux
- `ParentSpanID` : 16 caractères hexadécimaux
- `TraceFlags` : `01` (Sampled = enregistré)

---

## Module 3 — OpenTelemetry Collector & Python Instrumenté (1h30)

### 🛠️ Configuration YAML : OpenTelemetry Collector (otel-collector.yaml)

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 1s
    send_batch_size: 256

  memory_limiter:
    check_interval: 1s
    limit_percentage: 75
    spike_limit_percentage: 20

exporters:
  otlp/jaeger:
    endpoint: jaeger-all-in-one:4317
    tls:
      insecure: true
  prometheus:
    endpoint: 0.0.0.0:8889

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp/jaeger]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]
```

### 🛠️ Script Python : Microservice FastAPI Instrumenté OpenTelemetry

```python
#!/usr/bin/env python3
"""
PARADIS — OpenTelemetry Instrumented Microservice
Démontre la création de Traces et Spans avec propagation du contexte W3C via OTLP.
"""
import time
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.trace import Status, StatusCode
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator

# Initialisation du Tracer Provider OpenTelemetry
provider = TracerProvider()
processor = BatchSpanProcessor(ConsoleSpanExporter())  # En prod : OTLPSpanExporter
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

tracer = trace.get_tracer("paradis.payment.service", "1.0.0")

class PaymentService:
    def process_payment(self, user_id: str, amount_eur: float):
        # 1. Démarrage de la Span racine (Root Span)
        with tracer.start_as_current_span("process_payment_request") as root_span:
            root_span.set_attribute("user.id", user_id)
            root_span.set_attribute("payment.amount", amount_eur)
            root_span.set_attribute("payment.currency", "EUR")

            print(f"[*] Traitement du paiement de {amount_eur}€ pour l'utilisateur {user_id}")
            print(f"    TraceID : {format(root_span.get_span_context().trace_id, '032x')}")

            # 2. Appel sous-système (Sub-span) : Fraud Check
            fraud_ok = self._check_fraud(user_id, amount_eur)
            if not fraud_ok:
                root_span.set_status(Status(StatusCode.ERROR, "Paiement rejeté par le service Anti-Fraude"))
                return False

            # 3. Appel sous-système (Sub-span) : Gateway DB
            self._record_db_transaction(user_id, amount_eur)
            root_span.set_status(Status(StatusCode.OK))
            return True

    def _check_fraud(self, user_id: str, amount: float) -> bool:
        with tracer.start_as_current_span("anti_fraud_check") as span:
            span.set_attribute("fraud.score_algorithm", "v2-ml")
            time.sleep(0.05)  # Simulation latence 50ms
            is_valid = amount < 10000.0  # Fraude si > 10 000€
            span.set_attribute("fraud.is_valid", is_valid)
            return is_valid

    def _record_db_transaction(self, user_id: str, amount: float):
        with tracer.start_as_current_span("db_insert_transaction") as span:
            span.set_attribute("db.system", "postgresql")
            span.set_attribute("db.statement", "INSERT INTO payments VALUES (...)")
            time.sleep(0.02)  # Simulation latence SQL 20ms

if __name__ == "__main__":
    service = PaymentService()

    print("=== DÉMONSTRATION TRACING OPENTELEMETRY PARADIS ===\n")
    service.process_payment(user_id="USR-4421", amount_eur=149.99)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OTel** | OpenTelemetry — Projet unifié de la CNCF définissant le standard mondial d'observabilité |
| **OTLP** | OpenTelemetry Protocol — Protocole binaire haute performance (gRPC/HTTP) pour le transport des métriques, logs et traces |
| **DAG** | Directed Acyclic Graph — Structure en arbre d'exécution utilisée pour représenter une trace distribuée |
| **Span** | Unité élémentaire de travail dans une trace (nom, début, fin, attributs, logs) |
| **W3C Trace Context** | Standard W3C définissant les en-têtes HTTP de propagation du contexte de traçage (`traceparent`) |

---

## Exercices Pratiques

### Exercice 1 — Analyse d'une Trace Distribuée

Vous observez la trace suivante dans Jaeger pour une requête d'achat qui a pris 2 500 ms au total :
- `HTTP POST /checkout` (2 500 ms)
  - `AuthService.verify` (30 ms)
  - `PaymentService.charge` (2 400 ms)
    - `DB.query_user_balance` (20 ms)
    - `ExternalBankAPI.charge` (2 350 ms)

Où se situe le goulot d'étranglement de performance ? Quelles actions devez-vous entreprendre ?

**Corrigé guidé :**
1. **Goulot d'étranglement identifié** : L'appel au service externe `ExternalBankAPI.charge` consomme **2 350 ms sur les 2 500 ms totales (94% du temps de réponse)**.
2. **Actions à entreprendre** :
   - Le problème n'est ni dans la base de données locale ni dans l'authentification.
   - Implémenter un **timeout strict** sur l'appel `ExternalBankAPI` (ex: 1 500 ms).
   - Configurer un **Circuit Breaker** pour basculer vers une banque de secours si le partenaire bancaire principal ralentit.
   - Passer l'appel bancaire en **asynchrone** (Fast-return avec statut PENDING et notification Webhook/WebSocket à la confirmation).

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la différence fondamentale entre le **Monitoring** et l'**Observabilité** ?

- A) Le monitoring est payant, l'observabilité est gratuite.
- B) Le monitoring surveille les indicateurs connus (Known-Knowns), tandis que l'observabilité permet d'explorer et d'expliquer les comportements système imprévus (Unknown-Unknowns) grâce aux traces, métriques et logs. ✅
- C) L'observabilité ne fonctionne qu'avec Python.
- D) Il n'y a aucune différence.

**Q2.** Le projet **OpenTelemetry (OTel)** sous l'égide de la CNCF est né de la fusion de quels deux projets majeurs ?

- A) Docker et Kubernetes
- B) OpenTracing et OpenCensus ✅
- C) Prometheus et Grafana
- D) Jaeger et Zipkin

**Q3.** Dans le standard W3C Trace Context, à quoi sert l'en-tête HTTP `traceparent` ?

- A) À chiffrer le corps de la requête HTTP.
- B) À transmettre le `TraceID` et le `SpanID` parent d'un microservice à l'autre pour lier leurs traces dans le même arbre d'exécution distribué. ✅
- C) À compresser les images du site web.
- D) À vérifier le token JWT de l'utilisateur.

**Q4.** Dans une trace distribuée, qu'est-ce qu'une **Span** ?

- A) Un serveur physique dans le datacenter.
- B) Une unité de travail élémentaire représentée par un nom, une heure de début, une heure de fin et des attributs (ex: une requête SQL ou un appel HTTP). ✅
- C) Une erreur de syntaxe dans le code source.
- D) Une ligne de journal de log.

**Q5.** Quel protocole de communication standardisé est utilisé nativement par les SDK et le Collector OpenTelemetry pour exporter la télémétrie ?

- A) FTP
- B) OTLP (OpenTelemetry Protocol, généralement via gRPC sur le port 4317) ✅
- C) SMTP
- D) SNMPv2

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
