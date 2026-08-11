# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 500 (6h) : Projet Intégrateur Semestre 10 — Architecture MLOps & LLM Enterprise End-to-End

> [!NOTE]
> **Objectifs pédagogiques :**
> - Consolider et synthétiser **l'ensemble des 50 compétences du Semestre 10** (J451 à J500) dans une architecture unifiée
> - Concevoir une **Architecture MLOps LLM Enterprise de bout en bout** intégrant : Feature Store, AI Gateway, Guardrails, Fine-Tuning Continu, Monitoring, FinOps et Red Team
> - Implémenter le **Projet Final Intégrateur** : un système de détection de fraude financière augmenté par LLM, depuis la donnée brute jusqu'au déploiement sécurisé en production
> - Démontrer la maîtrise des **décisions architecturales** justifiées par les contraintes business (latence, coût, conformité)
>
> **Compétences visées :** `AI-01` à `AI-04` (A), `SEC-06` (A), `DATA-01` (A), `INF-02` (A) — Architecture MLOps Enterprise Complète

---

## Module 1 — Synthèse Architecturale : Les 9 Piliers du MLOps LLM Enterprise (2h)

### 📖 Narration & Vision d'Ensemble

Au fil des 50 journées du Semestre 10, vous avez exploré les profondeurs de l'Intelligence Artificielle, depuis les fondements mathématiques de l'algèbre linéaire (J451) jusqu'aux techniques de Red Teaming automatisé (J499). Ces connaissances, prises individuellement, sont des outils puissants. Assemblées cohéremment, elles forment une **Architecture MLOps LLM Enterprise** capable de résister aux défis du monde réel.

Le Jour 500 est le moment de synthèse : vous ne construisez plus une brique, vous concevez **la cathédrale entière**.

### 🔍 Les 9 Piliers de l'Architecture MLOps LLM Enterprise

```
ARCHITECTURE MLOPS LLM ENTERPRISE — VUE D'ENSEMBLE (J500)

┌─────────────────────────────────────────────────────────────────────────────────┐
│                     PILIER 1 : DONNÉES & FEATURE ENGINEERING                    │
│  Raw Data (Kafka) ──► Feature Store (Feast+Redis) ──► Training Dataset (DVC)    │
│  Point-in-Time Correctness ■ Data Versioning ■ Great Expectations Validation    │
└─────────────────────────────────────┬───────────────────────────────────────────┘
                                      │ (Features Validées)
┌─────────────────────────────────────▼───────────────────────────────────────────┐
│                      PILIER 2 : ENTRAÎNEMENT & EXPÉRIMENTATION                  │
│  MLflow Tracking ■ Kubeflow Pipelines ■ Katib HPO ■ Distributed Training FSDP  │
│  LoRA/QLoRA Fine-Tuning ■ DPO/KTO Alignment ■ Continuous Pre-Training           │
└─────────────────────────────────────┬───────────────────────────────────────────┘
                                      │ (Modèle Candidat)
┌─────────────────────────────────────▼───────────────────────────────────────────┐
│                      PILIER 3 : ÉVALUATION & RED TEAMING                        │
│  Benchmarks (MMLU, HumanEval) ■ GARAK/PyRIT Red Team ■ ECE Calibration         │
│  CI/CD Security Gate ■ Non-Regression Gate ■ BERTScore NLG Eval                 │
└─────────────────────────────────────┬───────────────────────────────────────────┘
                                      │ (Modèle Validé)
┌─────────────────────────────────────▼───────────────────────────────────────────┐
│                        PILIER 4 : DÉPLOIEMENT & SERVING                         │
│  FastAPI+ONNX Runtime ■ KServe (Kubernetes) ■ Canary/Shadow Deployment          │
│  Edge MLOps (TFLite) ■ OTA Updates ■ ONNX Quantisation INT8                     │
└─────────────────────────────────────┬───────────────────────────────────────────┘
                                      │ (Modèle en Production)
┌─────────────────────────────────────▼───────────────────────────────────────────┐
│                        PILIER 5 : AI GATEWAY & ROUTAGE                          │
│  LiteLLM Proxy ■ Fallback Multi-LLM ■ Cost/Quality/Latency Routing              │
│  Virtual Keys ■ Budget Manager par Équipe ■ Semantic Cache Redis                 │
└─────────────────────────────────────┬───────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────────────────────────┐
│                         PILIER 6 : SÉCURITÉ & GUARDRAILS                        │
│  NeMo Guardrails ■ Llama Guard ■ PII Masking (Presidio) ■ Input/Output Rails    │
│  MLSecOps (Pickle RCE) ■ Safetensors ■ Watermarking ■ Sandbox gVisor            │
└─────────────────────────────────────┬───────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────────────────────────┐
│                         PILIER 7 : MONITORING & ALERTES                         │
│  Evidently AI (Data/Concept Drift) ■ PSI ■ Prometheus ■ Langfuse LLM Tracing   │
│  Retraining Triggers ■ Alerting PagerDuty ■ SLA Latence <100ms                 │
└─────────────────────────────────────┬───────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────────────────────────┐
│                          PILIER 8 : FINOPS & GOUVERNANCE                        │
│  Token Budgeting ■ Semantic Cache ■ Prompt Compression ■ Graceful Degradation   │
│  EU AI Act Compliance ■ NIST AI RMF ■ Responsible AI (SHAP, Fairness)           │
└─────────────────────────────────────┬───────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────────────────────────┐
│                         PILIER 9 : ALIGNEMENT CONTINU                           │
│  Feedback Loop (A/B Préférences) ■ DPO Dataset Auto-Génération                  │
│  Evaluation Gate Non-Régression ■ Continuous Pre-Training (Domain-Adaptive)     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Projet Intégrateur : Système de Détection de Fraude Augmenté par LLM (2h)

### 📖 Énoncé du Projet Final

**Contexte métier :** La banque PARADIS Finance traite **2 millions de transactions** par jour. Le taux de fraude est de **0,02%** (400 fraudes/jour). Chaque fraude non détectée coûte en moyenne **1 200€**. L'équipe de détection actuelle utilise un modèle XGBoost entraîné il y a 8 mois. Les fraudeurs ont adapté leurs techniques, le taux de détection est tombé de 87% à 71%.

**Mission :** Concevoir et implémenter le pipeline complet d'un **Système de Détection de Fraude de Nouvelle Génération** combinant :
1. Un **modèle ML supervisé** (XGBoost/LightGBM) pour le scoring en temps réel (<50ms).
2. Un **LLM d'analyse contextuelle** (via AI Gateway) pour les cas ambigus (score entre 0.4 et 0.7).
3. Un **pipeline MLOps complet** pour le réentraînement continu sur les nouveaux patterns de fraude.

### 🛠️ Code Python : Architecture Complète du Système Intégrateur

```python
#!/usr/bin/env python3
"""
PARADIS — PROJET INTÉGRATEUR J500 : Détection de Fraude Augmentée par LLM
Implémente : Feature Store + Scoring ML + LLM Contextuel + Monitoring + Audit
"""

import math
import random
import json
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime, timedelta
from collections import defaultdict

# ──────────────────────────────────────────────────────────────────
# PILIER 1 : FEATURE STORE (Simplifié — Ref : J496)
# ──────────────────────────────────────────────────────────────────

class FraudFeatureStore:
    """Feature Store pour la détection de fraude — Online Store (Redis-like)."""

    def __init__(self):
        self._store = {}
        self._transaction_history = defaultdict(list)

    def record_transaction(self, client_id: str, amount: float, merchant_country: str, ts: datetime):
        self._transaction_history[client_id].append(
            {"amount": amount, "country": merchant_country, "ts": ts}
        )

    def compute_fraud_features(self, client_id: str, current_tx: dict) -> dict:
        """
        Calcule les features temps réel pour la détection de fraude.
        Implémente le Point-in-Time Correctness : fenêtre des 10 dernières minutes.
        """
        now         = current_tx.get("ts", datetime.now())
        cutoff_10m  = now - timedelta(minutes=10)
        cutoff_1h   = now - timedelta(hours=1)

        history     = self._transaction_history.get(client_id, [])
        recent_10m  = [t for t in history if t["ts"] >= cutoff_10m and t["ts"] < now]
        recent_1h   = [t for t in history if t["ts"] >= cutoff_1h  and t["ts"] < now]

        amounts_10m = [t["amount"] for t in recent_10m]
        amounts_1h  = [t["amount"] for t in recent_1h]
        countries_1h= set(t["country"] for t in recent_1h)

        # Feature : Ratio du montant actuel vs montant moyen habituel (anomalie de montant)
        avg_amount_1h     = sum(amounts_1h) / len(amounts_1h) if amounts_1h else 0.0
        amount_ratio      = (current_tx["amount"] / avg_amount_1h) if avg_amount_1h > 0 else 10.0
        # Feature : Nombre de pays différents dans l'heure (voyage impossible)
        n_countries_1h    = len(countries_1h | {current_tx["merchant_country"]})

        return {
            "client_id":           client_id,
            "tx_count_10min":      len(recent_10m),
            "tx_sum_10min":        round(sum(amounts_10m), 2),
            "tx_count_1h":         len(recent_1h),
            "amount_ratio":        round(amount_ratio, 3),
            "n_countries_1h":      n_countries_1h,
            "is_foreign_tx":       1 if current_tx.get("merchant_country") not in ("FR",) else 0,
            "hour_of_day":         now.hour,
            "is_nighttime":        1 if (now.hour < 6 or now.hour >= 23) else 0,
        }

# ──────────────────────────────────────────────────────────────────
# PILIER 2 : MODÈLE ML SUPERVISÉ (XGBoost Simplifié — Scoring Heuristique)
# ──────────────────────────────────────────────────────────────────

class FraudMLModel:
    """
    Modèle de scoring de fraude ML.
    Simulation d'un XGBoost entraîné sur features transactionnelles.
    En production : mlflow.xgboost.load_model("models:/fraud_detector@champion")
    """
    VERSION = "v2.3.1"

    def predict_proba(self, features: dict) -> float:
        """
        Retourne la probabilité de fraude [0.0, 1.0].
        Logique heuristique simulant un modèle gradient boosting calibré.
        """
        score = 0.0

        # Facteur 1 : Vélocité de transactions (feature la plus discriminante)
        tx_count = features.get("tx_count_10min", 0)
        if tx_count >= 5:   score += 0.35
        elif tx_count >= 3: score += 0.20

        # Facteur 2 : Montant anormalement élevé vs historique
        amount_ratio = features.get("amount_ratio", 1.0)
        if amount_ratio >= 10: score += 0.30
        elif amount_ratio >= 5: score += 0.15

        # Facteur 3 : Géographie suspecte (voyage impossible)
        n_countries = features.get("n_countries_1h", 1)
        if n_countries >= 3: score += 0.25
        elif n_countries >= 2: score += 0.10

        # Facteur 4 : Transaction nocturne internationale
        if features.get("is_nighttime") == 1 and features.get("is_foreign_tx") == 1:
            score += 0.15

        # Normalisation et ajout de bruit réaliste
        score = min(1.0, score + random.gauss(0, 0.02))
        return max(0.0, round(score, 4))

# ──────────────────────────────────────────────────────────────────
# PILIER 5 : AI GATEWAY SIMPLIFIÉ (Ref : J497)
# ──────────────────────────────────────────────────────────────────

class FraudLLMAnalyzer:
    """
    Analyseur contextuel LLM pour les cas ambigus (score entre 0.4 et 0.7).
    En production : appel via LiteLLM Proxy avec quality-based routing vers GPT-4o.
    """

    ANALYSIS_PROMPTS = {
        "normal": "[LLM GPT-4o via AI Gateway] Analyse contextuelle : La transaction présente {n_factors} facteur(s) de risque modéré. Contexte géographique cohérent. Recommandation : AUTORISER avec surveillance renforcée.",
        "suspect": "[LLM GPT-4o via AI Gateway] Analyse contextuelle : Combinaison atypique détectée — vélocité élevée ({tx_count} tx/10min) ET montant x{ratio:.1f} vs habitude. Pattern cohérent avec fraude de type 'Account Takeover'. Recommandation : BLOQUER et contacter le client.",
        "ambiguous": "[LLM GPT-4o via AI Gateway] Analyse contextuelle : Données insuffisantes pour conclusion définitive. Transaction internationale nocturne, premier achat dans ce pays. Recommandation : DEMANDER UNE AUTHENTIFICATION FORTE (3DS2).",
    }

    def analyze(self, features: dict, ml_score: float, tx: dict) -> dict:
        """Analyse contextuelle LLM des cas ambigus."""
        tx_count    = features.get("tx_count_10min", 0)
        amount_ratio= features.get("amount_ratio", 1.0)
        n_countries = features.get("n_countries_1h", 1)

        # Sélection du template d'analyse selon les features
        n_risk_factors = sum([
            tx_count >= 3,
            amount_ratio >= 5,
            n_countries >= 2,
            features.get("is_nighttime") == 1
        ])

        if tx_count >= 4 and amount_ratio >= 5:
            template = "suspect"
        elif n_risk_factors <= 1:
            template = "normal"
        else:
            template = "ambiguous"

        analysis_text = self.ANALYSIS_PROMPTS[template].format(
            n_factors=n_risk_factors,
            tx_count=tx_count,
            ratio=amount_ratio
        )

        # Calcul du score LLM ajusté
        llm_adjustment = {"suspect": +0.25, "ambiguous": +0.05, "normal": -0.10}[template]
        adjusted_score  = min(1.0, max(0.0, ml_score + llm_adjustment))

        return {
            "llm_analysis":      analysis_text,
            "llm_score_delta":   llm_adjustment,
            "final_score":       adjusted_score,
            "recommendation":    template
        }

# ──────────────────────────────────────────────────────────────────
# PILIER 7 : MONITORING (Ref : J461)
# ──────────────────────────────────────────────────────────────────

class FraudDetectionMonitor:
    """Moniteur de performance et de drift pour le système de détection de fraude."""

    def __init__(self):
        self.predictions      = []
        self.total_decisions  = defaultdict(int)
        self.total_cost_llm   = 0.0

    def log_decision(self, tx_id: str, ml_score: float, final_score: float,
                     decision: str, llm_used: bool, amount: float):
        self.predictions.append({
            "tx_id": tx_id, "ml_score": ml_score, "final_score": final_score,
            "decision": decision, "llm_used": llm_used, "amount": amount,
            "ts": datetime.now().isoformat()
        })
        self.total_decisions[decision] += 1
        if llm_used:
            # Coût estimé d'un appel LLM (input 1500 tokens + output 300 tokens @ gpt-4o)
            self.total_cost_llm += (1500 / 1000 * 0.005) + (300 / 1000 * 0.015)

    def get_metrics(self) -> dict:
        n = len(self.predictions)
        if n == 0:
            return {}
        avg_ml_score    = sum(p["ml_score"] for p in self.predictions) / n
        avg_final_score = sum(p["final_score"] for p in self.predictions) / n
        llm_call_rate   = sum(1 for p in self.predictions if p["llm_used"]) / n
        return {
            "total_transactions":  n,
            "avg_ml_score":        round(avg_ml_score, 4),
            "avg_final_score":     round(avg_final_score, 4),
            "decisions":           dict(self.total_decisions),
            "llm_call_rate_pct":   round(llm_call_rate * 100, 1),
            "total_llm_cost_usd":  round(self.total_cost_llm, 4),
        }

# ──────────────────────────────────────────────────────────────────
# ORCHESTRATEUR PRINCIPAL : FraudDetectionSystem
# ──────────────────────────────────────────────────────────────────

class FraudDetectionSystem:
    """
    Orchestrateur du système de détection de fraude intégrant les 9 piliers MLOps.
    """
    # Seuils de décision (calibrés via ROC-AUC — Ref : J478)
    THRESHOLD_BLOCK   = 0.70   # Score > 0.70 → Blocage automatique
    THRESHOLD_LLM     = 0.40   # Score entre 0.40 et 0.70 → Analyse LLM contextuelle
    THRESHOLD_ALLOW   = 0.40   # Score < 0.40 → Autorisation automatique

    def __init__(self):
        self.feature_store = FraudFeatureStore()
        self.ml_model      = FraudMLModel()
        self.llm_analyzer  = FraudLLMAnalyzer()
        self.monitor       = FraudDetectionMonitor()

    def process_transaction(self, tx: dict) -> dict:
        """
        Pipeline complet de traitement d'une transaction.
        Retourne la décision finale avec l'audit trail complet.
        """
        client_id = tx["client_id"]
        tx_id     = f"TX-{random.randint(100000, 999999)}"

        # [PILIER 1] Feature Engineering (Point-in-Time correct)
        features = self.feature_store.compute_fraud_features(client_id, tx)

        # [PILIER 2] Scoring ML (latence cible < 5ms)
        ml_score = self.ml_model.predict_proba(features)

        # Logique de routage des décisions
        llm_used = False
        llm_result = {}

        if ml_score >= self.THRESHOLD_BLOCK:
            # [PILIER 4] Blocage automatique (haute confiance)
            decision    = "BLOQUER"
            final_score = ml_score
        elif ml_score >= self.THRESHOLD_LLM:
            # [PILIER 5] Cas ambigu → Analyse LLM via AI Gateway
            llm_used   = True
            llm_result = self.llm_analyzer.analyze(features, ml_score, tx)
            final_score= llm_result["final_score"]
            recommendation = llm_result["recommendation"]
            if recommendation == "suspect" or final_score >= 0.70:
                decision = "BLOQUER"
            elif recommendation == "ambiguous":
                decision = "AUTHENTIFICATION_FORTE"
            else:
                decision = "AUTORISER"
        else:
            # [PILIER 4] Autorisation automatique (basse confiance)
            decision    = "AUTORISER"
            final_score = ml_score

        # [PILIER 7] Monitoring
        self.monitor.log_decision(tx_id, ml_score, final_score, decision, llm_used, tx["amount"])

        return {
            "tx_id":        tx_id,
            "client_id":    client_id,
            "amount_eur":   tx["amount"],
            "ml_score":     ml_score,
            "final_score":  final_score,
            "llm_used":     llm_used,
            "llm_analysis": llm_result.get("llm_analysis", "N/A — Décision ML directe"),
            "decision":     decision,
            "features":     features,
        }

# ──────────────────────────────────────────────────────────────────
# DÉMONSTRATION DU PROJET INTÉGRATEUR
# ──────────────────────────────────────────────────────────────────

def run_fraud_detection_integrator():
    print("[*] ═══════════════════════════════════════════════════════════")
    print("[*]   PROJET INTÉGRATEUR J500 — DÉTECTION DE FRAUDE LLM-AUGMENTÉE")
    print("[*]          PARADIS FINANCE — MLOps Enterprise System        ")
    print("[*] ═══════════════════════════════════════════════════════════")

    system = FraudDetectionSystem()
    base_ts = datetime.now()

    # Seed du Feature Store avec historique client
    system.feature_store.record_transaction("CLIENT-007", 85.00, "FR", base_ts - timedelta(hours=2))
    system.feature_store.record_transaction("CLIENT-007", 120.00, "FR", base_ts - timedelta(hours=1))
    system.feature_store.record_transaction("CLIENT-007", 95.00, "FR", base_ts - timedelta(minutes=30))
    # Pattern de fraude Client-007 : 4 transactions rapides + montant anormal + pays différent
    for i in range(4):
        system.feature_store.record_transaction("CLIENT-007", 1500.00, "NG",
                                                 base_ts - timedelta(minutes=9-i))
    system.feature_store.record_transaction("CLIENT-042", 45.00, "FR", base_ts - timedelta(hours=1))

    # Transactions à analyser
    transactions = [
        # Tx 1 : Transaction normale
        {"client_id": "CLIENT-042", "amount": 52.0,    "merchant_country": "FR",  "ts": base_ts},
        # Tx 2 : Transaction ambiguë (premier achat à l'étranger, nuit)
        {"client_id": "CLIENT-042", "amount": 340.0,   "merchant_country": "DE",  "ts": base_ts.replace(hour=2)},
        # Tx 3 : Fraude probable (vélocité + pays + montant × 15)
        {"client_id": "CLIENT-007", "amount": 14500.0, "merchant_country": "US",  "ts": base_ts},
    ]

    print(f"\n{'─' * 70}")
    print(f"  {'TX_ID':<15} {'CLIENT':<15} {'MONTANT':>10} {'SCORE ML':>9} {'SCORE FINAL':>12} {'LLM':>5} {'DÉCISION'}")
    print(f"{'─' * 70}")

    results = []
    for tx in transactions:
        result = system.process_transaction(tx)
        results.append(result)
        llm_icon = "✅" if result["llm_used"] else "  "
        decision_icon = {"AUTORISER": "✅", "BLOQUER": "🚨", "AUTHENTIFICATION_FORTE": "⚠️"}.get(result["decision"], "?")
        print(f"  {result['tx_id']:<15} {result['client_id']:<15} {result['amount_eur']:>9.2f}€ {result['ml_score']:>9.4f} {result['final_score']:>12.4f} {llm_icon:>5} {decision_icon} {result['decision']}")

    # Détail des analyses LLM
    print(f"\n{'─' * 70}")
    print(f"  ANALYSES CONTEXTUELLES LLM :")
    for r in results:
        if r["llm_used"]:
            print(f"\n  [{r['tx_id']}] {r['client_id']} — {r['amount_eur']:.2f}€")
            print(f"    {r['llm_analysis']}")

    # Rapport de monitoring
    print(f"\n{'─' * 70}")
    print(f"  MÉTRIQUES DE MONITORING (Pilier 7)")
    print(f"{'─' * 70}")
    metrics = system.monitor.get_metrics()
    for k, v in metrics.items():
        print(f"    {k:<30s} : {v}")

    print(f"\n[✅] Projet Intégrateur J500 — Semestre 10 complété avec succès.")
    print(f"[🎓] BILAN : Architecture MLOps LLM Enterprise maîtrisée sur 9 piliers.")

if __name__ == "__main__":
    run_fraud_detection_integrator()
```

---

## Module 3 — Bilan du Semestre 10 & Carte des Compétences Acquises (1h30)

### 🔍 Cartographie des 50 Jours du Semestre 10

| Jour | Thème | Pilier Architectural |
|:---:|:---|:---:|
| J451 | Fondements Mathématiques ML (Algèbre, Backprop) | Bases Théoriques |
| J452–J455 | CNN, RNN/LSTM, Transformers, LLMs | Architecture Modèles |
| J456–J457 | Fine-Tuning LoRA/QLoRA, Agents IA | Entraînement & Agents |
| J458–J462 | MLflow, Feature Store, Déploiement, Monitoring, Kubeflow | MLOps Pipeline (Piliers 1-4) |
| J463–J465 | Sécurité ML, Optimisation, XAI | Sécurité & Responsabilité |
| J466–J472 | GANs, Diffusion, RL, GNN, NLP Avancé, Vision, Multimodal | Architectures Avancées |
| J473–J480 | AutoML, Data Engineering, GPU, Distributed, Inférence LLM, Évaluation, MLSecOps, Multi-Cloud | Infrastructure & Ops |
| J481–J486 | Vector Search, Agentic RAG, Alignement, Prompt Eng., Multi-Agents, Synthetic Data | LLM Avancé |
| J487–J491 | Edge AI, Time Series, Reco, Audio, Gouvernance IA | Domaines Spécialisés |
| J492–J494 | Code Generation, Guardrails, Fine-Tuning Continu | LLM Engineering |
| J495–J499 | Edge MLOps, Feature Store Streaming, AI Gateway, AI FinOps, Red Teaming | Enterprise MLOps |
| **J500** | **Projet Intégrateur — Architecture End-to-End** | **Synthèse** |

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Account Takeover** | Type de fraude bancaire où un attaquant prend le contrôle du compte d'un client légitime |
| **3DS2** | 3-D Secure 2 — Protocole d'authentification forte des paiements en ligne (SCA — Strong Customer Authentication) |
| **SCA** | Strong Customer Authentication — Exigence réglementaire européenne (DSP2) imposant une authentification forte pour les paiements |
| **End-to-End** | De bout en bout — Architecture couvrant l'ensemble du pipeline depuis la donnée brute jusqu'au déploiement |
| **Audit Trail** | Trace horodatée et immuable de toutes les décisions et actions du système pour la conformité réglementaire |

---

## Exercices Pratiques

### Exercice 1 — Analyse de Décision Architecturale

Dans l'architecture de détection de fraude du Projet Intégrateur, le modèle ML (XGBoost) est utilisé en **première ligne** pour toutes les transactions, tandis que le LLM (via AI Gateway) n'est sollicité que pour les **cas ambigus** (score entre 0.40 et 0.70).

Justifiez cette décision architecturale en répondant à trois questions :
1. Pourquoi ne pas utiliser uniquement le LLM pour toutes les transactions ?
2. Pourquoi ne pas utiliser uniquement le modèle XGBoost ?
3. Quel est l'impact financier de ce design hybride sur les coûts d'inférence ?

**Corrigé guidé :**
1. **Limitation du LLM seul** : Un LLM traite une requête en **800ms à 2 secondes**, avec un coût de ~0.030$ par analyse. Pour 2 millions de transactions par jour, cela représente une latence incompatible avec le temps réel bancaire (SLA < 100ms) et un coût mensuel astronomique de **1.8 million de dollars** (2 000 000 × 0.030$).
2. **Limitation du XGBoost seul** : Le modèle ML n'a pas accès à la sémantique contextuelle (ex: un achat inhabituel mais dans un contexte de voyage professionnel documenté). Il produit un score numérique sans justification humainement intelligible, générant trop de faux positifs pour les cas frontières — bloquant des clients légitimes et dégradant l'expérience.
3. **Impact financier du design hybride** : Si 20% des transactions ont un score ambigu (entre 0.40 et 0.70), seules 400 000 transactions/jour sollicitent le LLM. Le coût LLM quotidien est de **12 000$** (vs 60 000$ si toutes les transactions passaient par le LLM), soit une économie de 80% sur les coûts d'inférence LLM.

---

## Banque QCM — 5 Questions

**Q1.** Dans l'architecture intégratrice du Projet J500, pourquoi les **features transactionnelles** sont-elles calculées par le Feature Store (Feast + Redis) plutôt que directement dans le code de l'API de scoring ?

- A) Pour rendre le code plus compliqué.
- B) Pour garantir le Point-in-Time Correctness (pas de data leakage), centraliser les définitions de features, éliminer le Training-Serving Skew et servir les features en <5ms via Redis sans recalcul. ✅
- C) Parce que Feast est plus rapide que Python.
- D) Pour satisfaire les exigences du DSI.

**Q2.** Dans le pipeline de décision hybride ML + LLM, quel est le seuil qui déclenche l'appel au LLM d'analyse contextuelle ?

- A) Score = 0.0 (toutes les transactions).
- B) Score entre 0.40 et 0.70 (zone d'ambiguité) — ni assez bas pour un refus automatique, ni assez élevé pour un blocage automatique. ✅
- C) Score > 0.90 uniquement.
- D) Le LLM est toujours appelé après le modèle ML.

**Q3.** Quel pilier de l'architecture MLOps Enterprise génère le **Rapport de Monitoring** qui surveille le drift et le taux d'appels LLM ?

- A) Pilier 2 : Entraînement.
- B) Pilier 7 : Monitoring & Alertes — implémenté via Evidently AI, Prometheus et le FraudDetectionMonitor. ✅
- C) Pilier 9 : Alignement Continu.
- D) Pilier 1 : Données.

**Q4.** L'**Audit Trail** produit par le système de détection de fraude (tx_id, scores, décision, llm_analysis) est-il utile uniquement pour le débogage technique ?

- A) Oui, il ne sert qu'aux développeurs.
- B) Non — l'Audit Trail est obligatoire pour la conformité réglementaire (RGPD — droit à l'explication des décisions automatisées, DSP2 — journalisation des transactions, EU AI Act — documentation des systèmes IA à haut risque dans la finance). ✅
- C) L'Audit Trail ralentit le système et doit être désactivé en production.
- D) L'Audit Trail n'est utile que pendant la phase de développement.

**Q5.** À l'issue du Semestre 10 (J451 à J500), laquelle des affirmations suivantes résume le mieux la philosophie du MLOps LLM Enterprise ?

- A) L'IA doit remplacer intégralement les développeurs et les équipes opérationnelles.
- B) Un système IA en production n'est pas seulement un modèle : c'est un pipeline vivant intégrant des données fiables, un entraînement rigoureux, une évaluation continue, un déploiement sécurisé, une observabilité complète, une gouvernance responsable et des mécanismes d'alignement continu — le tout orchestré avec discipline. ✅
- C) Le plus grand modèle LLM est toujours le meilleur choix pour toute application.
- D) La sécurité et la conformité réglementaire peuvent être ajoutées après la mise en production.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
