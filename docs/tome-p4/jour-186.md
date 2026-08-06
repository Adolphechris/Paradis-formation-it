# TOME P4 — Cloud, DevOps & SecOps — Jour 186 (6h) : Architecture Microservices & Service Mesh (Decomposition DDD, Istio, mTLS inter-services, Circuit Breaker & Observabilité Distribuée)

> [!NOTE]
> **Objectif du jour :** Maîtriser les patterns de l'architecture **microservices** : décomposition par **DDD (Domain-Driven Design)**, communication inter-services (REST vs gRPC), gestion de la résilience (**Circuit Breaker**, Retry, Timeout), **Service Mesh Istio** pour le chiffrement mTLS automatique, et observabilité distribuée avec **OpenTelemetry & Jaeger**.
>
> **Compétences visées :** `BIT-07` (A) — Architecture Microservices & DDD | `OPS-05` (A) — Service Mesh Istio & Observabilité Distribuée

---

## 1) Module — DDD & Décomposition en Microservices (2h)

### 📖 Narration/Intuition

Le système bancaire monolithique de la BCC est un bloc unique de code : toutes les fonctionnalités (gestion des comptes, virements, rapports réglementaires, notifications, authentification) sont dans une seule application. Lorsqu'une fonctionnalité est modifiée, tout le monolithe doit être re-déployé, testé et validé. La moindre erreur dans le module de rapports peut faire tomber l'ensemble du système de virements.

L'architecture **Microservices** décompose ce monolithe en services autonomes, chacun responsable d'un domaine métier précis, déployable et scalable indépendamment.

### 🔍 Anatomie Technique

**Décomposition DDD du Système BCC en Bounded Contexts :**

```
MONOLITHE BCC (Avant)               MICROSERVICES BCC (Après)
─────────────────────               ──────────────────────────

 ┌──────────────────┐               ┌─────────────────────────┐
 │   Application    │               │  Account Service        │
 │   Monolithique   │               │  (Gestion Comptes)      │ ─── PostgreSQL
 │                  │               ├─────────────────────────┤
 │  - Comptes       │    DDD        │  Transaction Service    │
 │  - Virements     │  Decomp.      │  (Virements & Paiements)│ ─── PostgreSQL
 │  - Auth          │  ────────►    ├─────────────────────────┤
 │  - Notifs        │               │  Auth Service           │
 │  - Reporting     │               │  (JWT, OAuth2, MFA)     │ ─── Redis
 │  - Audit         │               ├─────────────────────────┤
 │                  │               │  Notification Service   │
 └──────────────────┘               │  (SMS, Email, Push)     │ ─── Kafka
                                    ├─────────────────────────┤
                                    │  Reporting Service      │
                                    │  (OLAP, BI, Conformité) │ ─── ClickHouse
                                    ├─────────────────────────┤
                                    │  Audit Service          │
                                    │  (CDC, Piste d'Audit)   │ ─── Kafka+Kafka
                                    └─────────────────────────┘
```

**Règles de Décomposition DDD — Bounded Context :**

```
Règle 1 : Un service = Un domaine métier = Une BDD
(Éviter le partage de BDD entre services — source de couplage fort)

Règle 2 : Communication via API (REST/gRPC) ou Événements (Kafka)
(Jamais d'appel direct à la BDD d'un autre service)

Règle 3 : Chaque service est déployable indépendamment
(Changer le Transaction Service ne requiert pas de redéployer l'Auth Service)

Règle 4 : Un service = Une équipe (Conway's Law)
(L'organisation des équipes reflète l'architecture cible)
```

---

## 2) Module — Communication Inter-Services & Résilience (2h)

### 📖 Narration/Intuition

Lorsque l'**Account Service** de la BCC doit vérifier que le compte source a un solde suffisant avant d'autoriser un virement (Transaction Service), comment cette communication inter-services est-elle gérée ? Et que se passe-t-il si le Transaction Service est temporairement indisponible ?

### 🔍 Anatomie Technique

**Pattern Circuit Breaker — Résilience inter-services (`circuit_breaker.js`) :**

```javascript
const CircuitBreaker = require('opossum');
const axios = require('axios');

// ════════════════════════════════════════════════════════════
// CIRCUIT BREAKER — Communication vers l'Account Service
// ════════════════════════════════════════════════════════════

// Fonction qui appelle l'Account Service
async function checkAccountBalance(accountId, amount) {
    const response = await axios.get(
        `http://account-service.bcc-production.svc.cluster.local/accounts/${accountId}/balance`,
        { timeout: 2000 } // Timeout strict de 2 secondes
    );
    return response.data;
}

// Configuration du Circuit Breaker
const circuitBreakerOptions = {
    timeout: 3000,           // Délai max avant de considérer l'appel comme échoué
    errorThresholdPercentage: 50,  // Ouvrir si > 50% des appels échouent sur la fenêtre
    resetTimeout: 30000,     // Tenter de refermer le circuit après 30 secondes
    volumeThreshold: 10      // Minimum 10 appels sur la fenêtre avant évaluation
};

const breaker = new CircuitBreaker(checkAccountBalance, circuitBreakerOptions);

// Fallback : Comportement quand le circuit est ouvert (Account Service indisponible)
breaker.fallback((accountId, amount) => {
    console.warn(`⚠️ Circuit ouvert : Account Service indisponible. Virement ${accountId} mis en file d'attente Kafka.`);
    return { status: 'QUEUED', message: 'Traitement différé — Service temporairement indisponible' };
});

// Événements du Circuit Breaker (Métriques pour Prometheus)
breaker.on('open', () => {
    console.error('🔴 Circuit Breaker OUVERT — Account Service unreachable');
    circuitBreakerGauge.set(0);  // Prometheus metric
});
breaker.on('halfOpen', () => console.warn('🟡 Circuit Breaker HALF-OPEN — Testing recovery'));
breaker.on('close', () => {
    console.log('🟢 Circuit Breaker FERMÉ — Account Service recovered');
    circuitBreakerGauge.set(1);
});

// Export du breaker pour utilisation dans les routes
module.exports = { breaker };
```

**REST vs gRPC pour les communications inter-services BCC :**

| Critère | REST/JSON | gRPC/Protobuf |
|:---:|:---|:---|
| **Format** | JSON (texte, lisible) | Protobuf (binaire, compact) |
| **Performance** | Baseline | 5-10x plus rapide |
| **Schéma** | Optionnel (OpenAPI) | Obligatoire (.proto) |
| **Streaming** | Non natif | Natif (bidirectionnel) |
| **Cas d'usage BCC** | APIs publiques, Inter-domaines | Inter-services haute fréquence |

---

## 3) Module — Istio Service Mesh & OpenTelemetry (2h)

### 📖 Narration/Intuition

Dans une architecture de 20+ microservices comme la BCC, gérer manuellement le chiffrement mTLS inter-services, le load balancing, les retries, les timeouts et la collecte des traces serait une tâche infinie. **Istio** automatise tout cela via l'injection d'un **sidecar proxy (Envoy)** dans chaque Pod.

### 🛠️ Atelier Pratique

**Configuration Istio — mTLS strict + Traffic Management (`istio-config.yaml`) :**

```yaml
# ── PeerAuthentication : mTLS Strict obligatoire dans le namespace bcc-production
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: bcc-mtls-strict
  namespace: bcc-production
spec:
  mtls:
    mode: STRICT  # Refuser tout trafic non-mTLS entre services

---
# ── VirtualService : Routing avancé avec retries et timeouts
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: bcc-transaction-service-vs
  namespace: bcc-production
spec:
  hosts:
    - transaction-service
  http:
    - timeout: 3s           # Timeout global : 3 secondes max pour une réponse
      retries:
        attempts: 3         # Réessayer jusqu'à 3 fois en cas d'erreur 503/504
        perTryTimeout: 1s
        retryOn: "gateway-error,connect-failure,retriable-4xx"
      route:
        - destination:
            host: transaction-service
            port:
              number: 8080
            subset: stable  # Route vers la version stable
          weight: 90
        - destination:
            host: transaction-service
            port:
              number: 8080
            subset: canary  # 10% du trafic vers la nouvelle version (Canary Release)
          weight: 10
```

**Instrumentation OpenTelemetry pour le Tracing Distribué :**

```javascript
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

// Configuration OpenTelemetry SDK — Export des traces vers Jaeger
const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
        url: 'http://jaeger-collector.bcc-monitoring:4318/v1/traces'
    }),
    instrumentations: [getNodeAutoInstrumentations()],
    serviceName: 'bcc-transaction-service'
});

sdk.start();

// Trace automatique de chaque requête HTTP et de chaque query PostgreSQL
// Les traces sont corrélées entre les services via le header W3C Trace-Context (traceparent)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DDD** | Domain-Driven Design — Approche de conception logicielle centrée sur le domaine métier |
| **gRPC** | Google Remote Procedure Call — Framework de communication inter-services haute performance |
| **Protobuf** | Protocol Buffers — Format de sérialisation binaire compact de Google |
| **Sidecar** | Proxy injecté dans chaque Pod par Istio (Envoy) pour gérer le trafic réseau |
| **Canary Release** | Déploiement progressif d'une nouvelle version vers un petit pourcentage du trafic |
| **OTLP** | OpenTelemetry Protocol — Protocole standard de transmission des signaux d'observabilité |
| **W3C Trace-Context** | Standard W3C pour la propagation de l'identifiant de trace entre services |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer les 3 états d'un **Circuit Breaker** (Fermé, Ouvert, Demi-Ouvert) et décrire le comportement de l'API BCC dans chacun de ces états lors d'une panne de l'Account Service.

**Corrigé :** (1) **FERMÉ (Closed)** : État normal. Toutes les requêtes vers l'Account Service passent. Le Circuit Breaker surveille le taux d'erreur. (2) **OUVERT (Open)** : Le taux d'erreur a dépassé le seuil (ex: 50% d'échecs en 10 secondes). Le Circuit Breaker bloque immédiatement TOUTES les tentatives vers l'Account Service et invoque le **fallback** (ex: mettre le virement en file Kafka). Avantage critique : l'Account Service indisponible n'est plus sollicité, lui laissant le temps de récupérer sans être submergé de nouvelles requêtes. (3) **DEMI-OUVERT (Half-Open)** : Après `resetTimeout` (30s), le Circuit Breaker laisse passer **une seule requête test** vers l'Account Service. Si elle réussit → retour à l'état FERMÉ. Si elle échoue → retour à l'état OUVERT pour une nouvelle période d'attente.

**Exercice 2 :** Qu'est-ce qu'un **Canary Release** dans Istio et quel avantage offre-t-il par rapport à un déploiement Rolling Update standard de Kubernetes ?

**Corrigé :** Un **Canary Release** (ou déploiement Canary) consiste à diriger uniquement un faible pourcentage du trafic réel de production (ex: 10%) vers la nouvelle version d'un service, tout en maintenant 90% du trafic sur la version stable. Istio permet ce split de trafic précis au niveau L7 via les VirtualServices. Avantages vs Rolling Update : (1) **Validation en conditions réelles** : La nouvelle version est testée avec du vrai trafic utilisateur BCC, pas seulement des tests synthétiques. (2) **Impact limité des bugs** : Si la nouvelle version a un bug, seulement 10% des transactions sont affectées avant la détection et le rollback. (3) **Rollback instantané** : Il suffit de modifier le `weight` dans l'Istio VirtualService pour rérouter 100% du trafic vers la version stable. (4) **Métriques comparatives** : Prometheus peut comparer les métriques de latence et d'erreur entre `stable` et `canary` en temps réel.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans une architecture microservices, quel est le principe fondamental du **Bounded Context (DDD)** concernant le partage de base de données ?
- A) Chaque microservice doit avoir sa propre base de données — le partage de BDD entre services crée un couplage fort incompatible avec le déploiement indépendant
- B) Tous les microservices partagent une BDD centrale pour la cohérence des données
- C) Les microservices peuvent lire la BDD des autres mais pas écrire
- D) La BDD est stockée dans les fichiers de configuration

**Réponse : A**

**Q2 :** Un Circuit Breaker en état **OUVERT** dans l'API Transaction Service de la BCC signifie que...
- A) Toutes les requêtes vers l'Account Service sont immédiatement bloquées et le fallback est invoqué, protégeant le système d'une cascade d'erreurs (Cascading Failure)
- B) Le service est totalement arrêté
- C) Seuls les admins peuvent accéder au service
- D) Le service fonctionne normalement mais log toutes les erreurs

**Réponse : A**

**Q3 :** Quel composant d'**Istio** est injecté automatiquement dans chaque Pod Kubernetes pour gérer de manière transparente le mTLS, le load balancing et la collecte des traces, sans modifier le code applicatif ?
- A) Le sidecar proxy Envoy
- B) Le contrôleur Ingress
- C) Le ConfigMap Istio
- D) L'Istio Operator

**Réponse : A**

**Q4 :** Pourquoi le format **gRPC/Protobuf** est-il préféré à REST/JSON pour les communications à haute fréquence entre les microservices internes de la BCC (ex: Account Service → Transaction Service) ?
- A) Protobuf (binaire compact) est 5-10x plus rapide et 3-10x plus léger que JSON (texte), et gRPC supporte nativement le streaming bidirectionnel, crucial pour les flux de transactions en temps réel
- B) gRPC est plus facile à debugger que REST
- C) gRPC ne nécessite pas de schéma de données
- D) gRPC est uniquement utilisé pour les APIs publiques

**Réponse : A**

**Q5 :** Qu'est-ce que le standard **W3C Trace-Context (traceparent)** permet dans une architecture microservices instrumentée avec OpenTelemetry ?
- A) Il propage un identifiant de trace unique (trace ID + span ID) dans les en-têtes HTTP entre tous les services, permettant de reconstituer le chemin complet d'une requête à travers 10+ microservices dans Jaeger/Zipkin
- B) Il chiffre le contenu des requêtes HTTP entre services
- C) Il définit la version du protocole HTTP à utiliser
- D) Il remplace l'authentification JWT entre services

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
