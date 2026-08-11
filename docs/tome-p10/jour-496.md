# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 496 (6h) : Feature Stores Haute Performance & Features en Streaming : Kafka, Feast & Flink pour la Donnée Temps Réel à < 5ms de Latence

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre la dualité **Feature Store** — distinction entre features *batch* (hors-ligne) et features *streaming* (temps réel) et les problèmes qu'elle résout
> - Orchestrer un pipeline de **features en streaming** avec **Apache Kafka** (ingestion) + **Apache Flink** (traitement fenêtré) + **Feast** (service)
> - Maîtriser le concept de **Point-in-Time Correctness** pour éviter le **Training-Serving Skew** dans les données de features
> - Implémenter et benchmarker un Feature Store à faible latence (< 5ms) s'appuyant sur **Redis** comme Online Store
>
> **Compétences visées :** `DATA-01` (A), `AI-03` (A) — Feature Engineering Streaming & Feature Store Architecture

---

## Module 1 — Architecture Feature Store & Problèmes Résolus (2h)

### 📖 Intuition & Narration

Imaginez une équipe de data scientists qui développe un modèle de détection de fraude bancaire. Le modèle utilise comme variable d'entrée : *"nombre de transactions effectuées par ce client dans les 10 dernières minutes"*. Ce calcul semble simple. Mais il cache deux problèmes fondamentaux qui font échouer la plupart des projets ML en production.

**Problème 1 — Le Training-Serving Skew (Décalage Entraînement-Production) :**
En phase d'entraînement, l'ingénieur calcule cette feature à partir de l'historique en base de données SQL. En production, le système doit calculer la même feature en quelques millisecondes sur un flux Kafka en direct. Si les deux calculs ne sont pas **rigoureusement identiques** (même logique de fenêtrage temporel, même gestion des fuseaux horaires, même traitement des valeurs nulles), le modèle reçoit des données différentes de celles sur lesquelles il a été entraîné. Sa performance s'effondre.

**Problème 2 — La Data Leakage (Fuite de Données) :**
L'ingénieur qui prépare les données d'entraînement doit impérativement ne calculer les features qu'à partir de données qui **existaient avant** l'événement à prédire. Si par mégarde, il calcule la feature "transactions dans les 10 minutes" en incluant des transactions *postérieures* à la fraude, le modèle apprend à prédire des fraudes déjà passées — il sera inutile en production.

**La solution — Le Feature Store :**
Le Feature Store est une plateforme centralisée qui :
1. Stocke les définitions de features (Feature Views) comme un référentiel unique de vérité.
2. Garantit l'identité des calculs entre entraînement (Offline Store) et production (Online Store).
3. Gère le Point-in-Time Correctness pour les données historiques d'entraînement.

### 🔍 Anatomie Technique — Architecture Duale Offline/Online Store

```
ARCHITECTURE D'UN FEATURE STORE HAUTE PERFORMANCE

                         ┌─────────────────────────────────────────────┐
                         │          FEATURE STORE (FEAST)              │
                         │                                             │
  ╔══════════════╗       │  ┌─────────────────┐  ┌──────────────────┐ │
  ║ Sources Batch ║──────┼─►│  OFFLINE STORE  │  │  ONLINE STORE   │ │
  ║ (S3, BigQuery)║       │  │  (Parquet/S3)   │  │  (Redis/DynamoDB│ │
  ╚══════════════╝       │  │  Latence : ~1min │  │  Latence < 5ms) │ │
                         │  └────────┬────────┘  └────────▲─────────┘ │
  ╔══════════════╗       │           │ Feast Materialize   │           │
  ║Kafka+Flink   ║───────┼───────────┴─────────────────────┘           │
  ║(Streaming)   ║       │           Feature Registry                  │
  ╚══════════════╝       │     (Définitions, Schémas, Entités)         │
                         └─────────────────────────────────────────────┘
          │                           │                  │
          ▼                           ▼                  ▼
  [Entraînement ML]         [Exploration DS]      [Production API]
  (Point-in-Time Join)      (Jupyter Notebook)    (<5ms latency)
```

### 🔍 Le Concept de Point-in-Time Correctness

Pour construire un jeu de données d'entraînement sans data leakage, l'Offline Store de Feast réalise un **Point-in-Time Join** : pour chaque événement d'entraînement horodaté $t_i$ (ex: une transaction suspecte à 14h32), il ne récupère que la valeur de la feature qui était valide **au moment $t_i$**, jamais après.

```
POINT-IN-TIME JOIN : ILLUSTRATION

  Timestamp   │  Événement              │ Feature: tx_count_10min (valeur CORRECTE)
  ────────────────────────────────────────────────────────────────────────────
  14h25       │  Tx #1 (normale)        │ —
  14h28       │  Tx #2 (normale)        │ —
  14h32 ►◄    │  FRAUDE DÉTECTÉE ★      │ = 2 (tx #1 et #2 dans les 10min avant 14h32)
  14h35       │  Tx #3 (normale)        │ —   ← Cette valeur ne doit PAS être vue lors de
                                              │     l'entraînement du label "Fraude à 14h32" !
```

---

## Module 2 — Atelier Pratique : Pipeline Kafka → Flink → Redis (Simulation Python) (2h)

### 🛠️ Code Python : Feature Store Streaming Simulé avec Fenêtrage Temporel

```python
#!/usr/bin/env python3
"""
PARADIS — Simulation d'un Pipeline Feature Store Streaming
Simule : Kafka (producteur d'événements) + Flink (agrégation fenêtrée) + Redis Online Store
Prérequis production : pip install kafka-python redis apache-flink feast
En simulation standalone : aucune dépendance externe.
"""

import time
import json
import hashlib
from collections import defaultdict, deque
from datetime import datetime, timedelta
from typing import Optional

# ──────────────────────────────────────────────────────────────────
# 1. SIMULATEUR KAFKA : PRODUCTEUR D'ÉVÉNEMENTS DE TRANSACTIONS
# ──────────────────────────────────────────────────────────────────

class KafkaTransactionProducer:
    """
    Simule un producteur Kafka envoyant des événements de transactions bancaires.
    En production, utiliser: KafkaProducer(bootstrap_servers=['kafka-broker:9092'])
    """
    def __init__(self):
        self._events_buffer = deque()

    def produce(self, event: dict) -> None:
        """Publie un événement sur le topic Kafka 'transactions'."""
        event['kafka_timestamp'] = datetime.now().isoformat()
        event['kafka_offset'] = len(self._events_buffer)
        self._events_buffer.append(event)

    def consume_all(self) -> list:
        """Consomme tous les messages disponibles (simulation d'un consumer group)."""
        events = list(self._events_buffer)
        self._events_buffer.clear()
        return events

# ──────────────────────────────────────────────────────────────────
# 2. SIMULATEUR FLINK : AGRÉGATION PAR FENÊTRE GLISSANTE (SLIDING WINDOW)
# ──────────────────────────────────────────────────────────────────

class FlinkSlidingWindowAggregator:
    """
    Simule un opérateur Flink de fenêtrage glissant (Sliding Window).

    Paramètres de la fenêtre :
    - window_size_sec  : Durée de la fenêtre (ex: 600s = 10 minutes)
    - slide_interval_s : Intervalle de glissement (ex: 60s = calcul chaque minute)

    Calcule pour chaque client (entity_id) :
    - tx_count_10min  : Nombre de transactions dans la fenêtre
    - tx_sum_10min    : Somme des montants dans la fenêtre
    - tx_avg_10min    : Montant moyen dans la fenêtre
    """
    def __init__(self, window_size_sec: int = 600):
        self.window_size_sec = window_size_sec
        # Dictionnaire : client_id → deque de (timestamp, amount)
        self._event_windows: dict = defaultdict(deque)

    def _evict_expired_events(self, client_id: str, current_ts: datetime) -> None:
        """Expulse les événements hors de la fenêtre glissante."""
        cutoff = current_ts - timedelta(seconds=self.window_size_sec)
        window = self._event_windows[client_id]
        while window and window[0][0] < cutoff:
            window.popleft()

    def ingest_event(self, client_id: str, amount: float, event_ts: Optional[datetime] = None) -> None:
        """Ingère un nouvel événement et met à jour la fenêtre glissante."""
        ts = event_ts or datetime.now()
        self._event_windows[client_id].append((ts, amount))
        self._evict_expired_events(client_id, ts)

    def compute_features(self, client_id: str, at_time: Optional[datetime] = None) -> dict:
        """
        Calcule les features agrégées pour un client donné à un instant t.
        Implémente le Point-in-Time Correctness : n'inclut que les données <= at_time.
        """
        current_ts = at_time or datetime.now()
        self._evict_expired_events(client_id, current_ts)

        window = self._event_windows[client_id]
        amounts = [amt for ts, amt in window if ts <= current_ts]

        return {
            "client_id":        client_id,
            "computed_at":      current_ts.isoformat(),
            "tx_count_10min":   len(amounts),
            "tx_sum_10min":     round(sum(amounts), 2),
            "tx_avg_10min":     round(sum(amounts) / len(amounts), 2) if amounts else 0.0,
            "tx_max_10min":     round(max(amounts), 2) if amounts else 0.0
        }

# ──────────────────────────────────────────────────────────────────
# 3. SIMULATEUR REDIS : ONLINE STORE BASSE LATENCE
# ──────────────────────────────────────────────────────────────────

class RedisOnlineStoreSimulator:
    """
    Simule un Redis Online Store avec mesure de latence sub-milliseconde.
    En production : redis.Redis(host='redis-cluster', port=6379, decode_responses=True)
    """
    def __init__(self):
        self._store = {}

    def set_features(self, key: str, features: dict, ttl_sec: int = 3600) -> None:
        """Stocke des features dans Redis avec TTL (expire automatiquement)."""
        self._store[key] = {
            "features": features,
            "expires_at": (datetime.now() + timedelta(seconds=ttl_sec)).isoformat()
        }

    def get_features(self, key: str) -> Optional[dict]:
        """Récupère des features depuis Redis (simulation latence < 1ms)."""
        record = self._store.get(key)
        if not record:
            return None
        return record["features"]

    def benchmark_latency(self, key: str, runs: int = 1000) -> float:
        """Mesure la latence moyenne de lecture Redis en microsecondes."""
        start = time.perf_counter_ns()
        for _ in range(runs):
            self.get_features(key)
        elapsed_us = (time.perf_counter_ns() - start) / runs / 1000
        return elapsed_us

# ──────────────────────────────────────────────────────────────────
# 4. DÉMONSTRATION DU PIPELINE COMPLET
# ──────────────────────────────────────────────────────────────────

def run_streaming_feature_store_demo():
    print("[*] ═══════════════════════════════════════════════════════════")
    print("[*]      PIPELINE FEATURE STORE STREAMING — PARADIS IT        ")
    print("[*] ═══════════════════════════════════════════════════════════")

    # Instanciation des composants
    kafka_producer  = KafkaTransactionProducer()
    flink_aggregator = FlinkSlidingWindowAggregator(window_size_sec=600)  # Fenêtre 10 minutes
    redis_store      = RedisOnlineStoreSimulator()

    # Simulation de transactions bancaires pour deux clients
    transactions = [
        {"client_id": "CLIENT-0042", "amount": 125.00,  "delta_s": -580},  # 9min40 avant maintenant
        {"client_id": "CLIENT-0042", "amount": 52.50,   "delta_s": -320},  # 5min20 avant
        {"client_id": "CLIENT-0042", "amount": 890.00,  "delta_s": -60},   # 1min avant
        {"client_id": "CLIENT-0042", "amount": 4500.00, "delta_s": 0},     # Maintenant (transaction suspecte)
        {"client_id": "CLIENT-0099", "amount": 15.00,   "delta_s": -200},
        {"client_id": "CLIENT-0099", "amount": 30.00,   "delta_s": -100},
    ]

    print("\n[ÉTAPE 1/3] Ingestion des transactions dans Kafka...")
    base_time = datetime.now()
    for tx in transactions:
        event_ts = base_time + timedelta(seconds=tx["delta_s"])
        event = {"client_id": tx["client_id"], "amount": tx["amount"], "event_ts": event_ts.isoformat()}
        kafka_producer.produce(event)
        flink_aggregator.ingest_event(tx["client_id"], tx["amount"], event_ts)
        print(f"   → Tx publiée : Client {tx['client_id']} | Montant {tx['amount']:>8.2f}€ | Δt={tx['delta_s']:+d}s")

    print("\n[ÉTAPE 2/3] Agrégation Flink (Fenêtre Glissante 10min) → Matérialisation Redis...")
    for client_id in ["CLIENT-0042", "CLIENT-0099"]:
        features = flink_aggregator.compute_features(client_id)
        redis_key = f"feast:transaction_features:{client_id}"
        redis_store.set_features(redis_key, features, ttl_sec=3600)
        print(f"\n   ─── Features Matérialisées pour {client_id} ───")
        for k, v in features.items():
            if k not in ("client_id", "computed_at"):
                print(f"       {k:25s} : {v}")

    print("\n[ÉTAPE 3/3] Benchmark Lecture Online Store (Redis) pour scoring temps réel...")
    redis_key = "feast:transaction_features:CLIENT-0042"
    latency_us = redis_store.benchmark_latency(redis_key, runs=10000)
    latency_ms = latency_us / 1000

    print(f"\n   ─── Résultats de Performance Online Store ───")
    print(f"       Latence moyenne Redis GET : {latency_us:.3f} µs = {latency_ms:.4f} ms")
    print(f"       SLA cible < 5ms           : {'✅ RESPECTÉ' if latency_ms < 5 else '❌ DÉGRADÉ'}")

    # Simulation de décision du modèle de fraude
    client_features = redis_store.get_features(redis_key)
    tx_count = client_features.get("tx_count_10min", 0)
    tx_max   = client_features.get("tx_max_10min", 0)
    fraud_score = min(1.0, (tx_count / 3) * 0.4 + (tx_max / 1000) * 0.6)

    print(f"\n   ─── Décision Modèle de Détection de Fraude ───")
    print(f"       tx_count_10min = {tx_count} | tx_max_10min = {tx_max}€")
    print(f"       Score de Fraude (heuristique) = {fraud_score:.3f}")
    print(f"       Décision : {'🚨 TRANSACTION SUSPECTE — Blocage & Alerte' if fraud_score > 0.7 else '✅ TRANSACTION NORMALE'}")

if __name__ == "__main__":
    run_streaming_feature_store_demo()
```

---

## Module 3 — Feature Registry, Gouvernance & Anti-Patterns (1h30)

### 🔍 Feature Registry : Référentiel Central de Définitions

Le **Feature Registry** de Feast est le composant qui stocke les **définitions** des features, pas leurs valeurs. Il répond à la question : *"Qu'est-ce que la feature `tx_count_10min` ?"*

```yaml
# feast_feature_store/features.py — Définition Feast (Python DSL)

from feast import Entity, FeatureView, Field, FileSource
from feast.types import Int64, Float64, String

# Entité : L'identifiant principal de regroupement
client = Entity(name="client_id", value_type=String, join_keys=["client_id"])

# Source des données de features (Parquet sur S3 pour Offline / Kafka pour Streaming)
transaction_source = FileSource(
    path="s3://paradis-feature-store/transaction_features/*.parquet",
    timestamp_field="event_timestamp"
)

# Vue de Features : Définition déclarative des features et de leur fraîcheur
transaction_features_view = FeatureView(
    name="transaction_features",
    entities=[client],
    ttl=timedelta(hours=24),    # Durée de vie dans l'Online Store
    schema=[
        Field(name="tx_count_10min", dtype=Int64),
        Field(name="tx_sum_10min",   dtype=Float64),
        Field(name="tx_avg_10min",   dtype=Float64),
        Field(name="tx_max_10min",   dtype=Float64),
    ],
    source=transaction_source,
    tags={"team": "fraud-detection", "sla": "5ms"}
)
```

### 🔍 Anti-Patterns à Éviter dans un Feature Store

| Anti-Pattern | Conséquence | Solution |
|:---|:---|:---|
| **Calcul de features différent** entre entraînement et production | Training-Serving Skew → dégradation du modèle en prod | Utiliser le même code Python de transformation dans Offline et Online |
| **Pas de TTL sur l'Online Store** | Features obsolètes (stale features) consommées sans alerte | Configurer `ttl=timedelta(hours=X)` dans Feast FeatureView |
| **Features calculées après l'événement** dans les données d'entraînement | Data Leakage → modèle inutilisable en production | Utiliser `get_historical_features()` de Feast avec Point-in-Time Join |
| **Feature Store utilisé uniquement par une équipe** | Silos de données, duplications, incohérences | Imposer le Feature Registry comme référentiel centralisé d'entreprise |

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Feature Store** | Plateforme centralisée gérant le calcul, le stockage et le service des features ML |
| **Training-Serving Skew** | Décalage entre les features calculées à l'entraînement et celles calculées en production |
| **Point-in-Time Join** | Jointure temporelle garantissant que les features d'entraînement ne voient que le passé |
| **Materialization** | Processus de calcul et de chargement des features dans l'Online Store depuis l'Offline Store |
| **Sliding Window** | Fenêtre d'agrégation temporelle se déplaçant avec le temps (ex: somme des 10 dernières minutes) |
| **Stale Features** | Features périmées dont la valeur dans l'Online Store est trop ancienne pour être fiable |
| **TTL** | Time-To-Live — Durée de validité d'une feature avant expiration automatique dans le cache |

---

## Exercices Pratiques

### Exercice 1 — Analyse du Training-Serving Skew

Une équipe construit un modèle de scoring de risque de crédit. Lors de l'entraînement, la feature `revenu_mensuel_moyen_6mois` est calculée ainsi : *"Somme des salaires versés sur les 6 derniers mois de la base SQL divisée par 6."* En production, la même feature est calculée comme : *"Dernier salaire mensuel connu."*

1. Identifiez le type de problème et ses conséquences.
2. Proposez la correction en utilisant le concept de Feature Store.

**Corrigé guidé :**
1. **Type de problème :** Il s'agit d'un **Training-Serving Skew**. Le calcul de la feature n'est pas identique en entraînement et en production. La valeur du `revenu_mensuel_moyen_6mois` peut varier significativement par rapport au `dernier_salaire_mensuel` (ex: un client récemment promu aura un salaire actuel bien supérieur à sa moyenne 6 mois). Le modèle a donc été entraîné sur des données structurellement différentes de celles qu'il reçoit en production → **ses prédictions sont biaisées et non-fiables**.
2. **Correction :** Définir dans le Feature Registry Feast une unique `FeatureView` nommée `credit_features` contenant le champ `revenu_mensuel_moyen_6mois` avec une logique de calcul unique (moyenne glissante sur une fenêtre de 180 jours). L'Offline Store utilisera cette même définition pour générer les données d'entraînement (`get_historical_features()`), et l'Online Store servira la même valeur calculée identiquement en production (`get_online_features()`). **Une seule définition = zéro skew.**

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce que le **Training-Serving Skew** dans le contexte d'un Feature Store ?

- A) Un biais introduit par l'utilisation d'un GPU trop puissant.
- B) La différence de valeur entre une feature calculée pendant l'entraînement du modèle et la même feature calculée lors de la mise en production, causée par des logiques de calcul ou des sources de données différentes. ✅
- C) Une erreur de compilation du modèle.
- D) Un problème de connexion réseau entre le Feature Store et le modèle.

**Q2.** Le **Point-in-Time Join** dans Feast sert à :

- A) Joindre deux tables SQL selon le fuseau horaire UTC.
- B) Garantir que lors de la génération des données d'entraînement, chaque observation n'utilise que les valeurs de features qui étaient disponibles *avant* ou *au moment exact* de l'événement cible, pour éviter la Data Leakage. ✅
- C) Synchroniser les horloges de tous les serveurs du cluster.
- D) Compresser les données temporelles au format gzip.

**Q3.** Dans l'architecture d'un Feature Store, quelle est la différence entre l'**Offline Store** et l'**Online Store** ?

- A) L'Offline Store stocke les données chiffrées, l'Online Store les données en clair.
- B) L'Offline Store (Parquet/S3) stocke l'historique complet des features pour l'entraînement (~minutes de latence), tandis que l'Online Store (Redis) ne stocke que les valeurs les plus récentes pour la production (<5ms de latence). ✅
- C) L'Offline Store est accessible depuis Internet, l'Online Store est isolé.
- D) Il n'y a aucune différence fonctionnelle.

**Q4.** Pourquoi configure-t-on un **TTL (Time-To-Live)** sur les features de l'Online Store Redis ?

- A) Pour limiter le nombre d'utilisateurs connectés simultanément.
- B) Pour empêcher automatiquement l'utilisation de features dont la valeur est devenue périmée (stale), garantissant ainsi que les scores produits par le modèle en production sont basés sur des données fraîches. ✅
- C) Pour chiffrer les données après un certain délai.
- D) Pour sauvegarder les features sur un disque externe.

**Q5.** Dans une fenêtre glissante (**Sliding Window**) Apache Flink de 10 minutes avec un intervalle de glissement de 1 minute, combien de fenêtres différentes contiennent une transaction effectuée à exactement 14h05 ?

- A) 1 fenêtre (celle de 14h00 à 14h10).
- B) Jusqu'à 10 fenêtres différentes (la transaction à 14h05 est incluse dans toutes les fenêtres démarrant entre 13h56 et 14h05, soit 10 fenêtres de 10 minutes avec un glissement d'1 minute). ✅
- C) 0 fenêtre.
- D) Une infinité de fenêtres.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
