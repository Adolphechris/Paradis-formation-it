# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 497 (6h) : Routage Multi-LLM Enterprise & AI Gateway : LiteLLM, Fallback Stratégique, Routage par Coût/Qualité & Gestion de Budget Token

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre pourquoi les architectures LLM d'entreprise nécessitent un **AI Gateway** plutôt qu'une connexion directe à un seul fournisseur
> - Déployer **LiteLLM Proxy** comme passerelle unifiée pour orchestrer plusieurs fournisseurs LLM (OpenAI, Anthropic, Mistral, modèles locaux)
> - Implémenter des stratégies de **routage intelligent** : fallback sur panne, routage par coût optimal, routage par qualité pour tâches critiques
> - Surveiller la consommation de tokens en temps réel et appliquer des budgets de dépenses par équipe ou par projet (**AI FinOps**)
>
> **Compétences visées :** `AI-03` (A), `INF-02` (A) — Enterprise LLM Gateway & AI FinOps

---

## Module 1 — Problématiques Enterprise & Architecture AI Gateway (2h)

### 📖 Intuition & Narration

Une entreprise de 5 000 collaborateurs déploie des assistants IA internes. Trois équipes différentes (Juridique, Support Client, R&D) utilisent des LLMs. Chacune a des besoins différents et un budget différent.

Sans AI Gateway, chaque équipe se connecte directement à un fournisseur LLM via sa propre clé API. Les problèmes se multiplient :
- Si OpenAI est en panne, l'assistante juridique est bloquée et les contrats ne sont plus rédigés.
- L'équipe de Support Client utilise par inadvertance GPT-4o pour des questions triviales à 0,015$/1K tokens au lieu de `gpt-4o-mini` à 0,00015$/1K tokens — la facture mensuelle explose.
- Le RSSI ne peut pas auditer qui envoie quoi aux LLMs externes car il n'y a pas de point de collecte centralisé.
- La R&D a dépassé son budget mensuel de 5 000€ en tokens mais personne ne l'a su avant la facturation.

L'**AI Gateway** est la solution architecturale qui résout toutes ces problématiques en un seul composant central.

### 🔍 Anatomie Technique — Architecture AI Gateway Enterprise

```
ARCHITECTURE AI GATEWAY ENTERPRISE AVEC LITELLM PROXY

  ┌─────────────────────────────────────────────────────────────────────┐
  │                    CLIENTS INTERNES ENTERPRISE                      │
  │  [App Juridique]   [Support Client]   [IDE Copilot]   [R&D Agent]  │
  └─────────────────────────────┬───────────────────────────────────────┘
                                │ HTTP POST /v1/chat/completions
                                │ (API compatible OpenAI — interface unique)
                                ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                  AI GATEWAY (LiteLLM Proxy)                        │
  │                                                                     │
  │  ┌──────────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
  │  │  AUTHENTIFICATION │  │  ROUTAGE SMART  │  │  BUDGET MANAGER  │  │
  │  │  (Clé API interne│  │ - Par coût       │  │ - Par équipe     │  │
  │  │   par équipe)     │  │ - Par qualité    │  │ - Par projet     │  │
  │  └──────────────────┘  │ - Fallback auto  │  │ - Alertes seuil  │  │
  │                         └─────────────────┘  └──────────────────┘   │
  │  ┌──────────────────────────────────────────────────────────────┐   │
  │  │  LOGGING & OBSERVABILITE (Prometheus / Langfuse / Datadog)   │  │
  │  └──────────────────────────────────────────────────────────────┘   │
  └───────────────────┬───────────────────────────────────────────────┘
                      │ Forwarding selon la stratégie de routage
          ┌───────────┼──────────────┬─────────────────┐
          ▼           ▼              ▼                  ▼
  [OpenAI GPT-4o] [Anthropic    [Mistral Mixtral]  [Ollama Local
                   Claude 3.5]                      LLaMA-3 70B]
```

### 🔍 Les 4 Stratégies de Routage LiteLLM

| Stratégie | Description | Cas d'Usage |
|:---|:---|:---|
| **`simple-shuffle`** | Distribution aléatoire entre modèles équivalents | Load balancing entre instances d'un même modèle |
| **`least-busy`** | Routage vers le modèle avec la queue la moins chargée | Optimisation de latence en pic de charge |
| **`cost-based`** | Routage vers le modèle le moins cher capable de la tâche | Optimisation des coûts (FinOps) |
| **`latency-based`** | Routage vers le modèle avec la latence P95 la plus basse | Applications temps réel (chatbots, autocomplétion) |

---

## Module 2 — Atelier Pratique : AI Gateway avec Fallback & Budget Manager (2h)

### 🛠️ Code Python : Simulation Complète d'un AI Gateway avec Fallback & Comptage de Tokens

```python
#!/usr/bin/env python3
"""
PARADIS — Simulation d'un AI Gateway Enterprise
Implémente : Routage Multi-LLM, Fallback sur Panne, Budget Manager, Audit Log
"""

import time
import json
import random
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime
from collections import defaultdict

# ──────────────────────────────────────────────────────────────────
# 1. MODÈLES DE DONNÉES
# ──────────────────────────────────────────────────────────────────

@dataclass
class LLMProvider:
    """Représente un fournisseur LLM avec ses caractéristiques de performance et coût."""
    name:               str
    model_id:           str
    cost_per_1k_tokens: float    # En USD
    avg_latency_ms:     float
    quality_score:      float    # Score 0.0 à 1.0 (évaluation interne)
    is_local:           bool = False
    _failure_rate:      float = 0.0   # Taux de panne simulé (0.0 = toujours disponible)

    def is_available(self) -> bool:
        """Simule la disponibilité du fournisseur."""
        return random.random() > self._failure_rate

    def estimate_cost(self, prompt_tokens: int, completion_tokens: int) -> float:
        """Calcule le coût d'un appel en USD."""
        total_tokens = prompt_tokens + completion_tokens
        return (total_tokens / 1000) * self.cost_per_1k_tokens

@dataclass
class BudgetTracker:
    """Gestionnaire de budget de dépenses par équipe."""
    monthly_budget_usd: float
    spent_usd:          float = 0.0
    total_tokens:       int   = 0
    request_count:      int   = 0

    @property
    def budget_utilization_pct(self) -> float:
        return (self.spent_usd / self.monthly_budget_usd * 100) if self.monthly_budget_usd > 0 else 0.0

    @property
    def is_budget_exceeded(self) -> bool:
        return self.spent_usd >= self.monthly_budget_usd

@dataclass
class GatewayRequest:
    """Requête envoyée au Gateway."""
    team_id:         str
    prompt:          str
    routing_policy:  str = "cost-based"   # "cost-based" | "quality-based" | "latency-based"
    max_tokens:      int = 512
    request_id:      str = field(default_factory=lambda: f"req-{random.randint(10000, 99999)}")

@dataclass
class GatewayResponse:
    """Réponse renvoyée par le Gateway."""
    request_id:       str
    provider_used:    str
    response_text:    str
    prompt_tokens:    int
    completion_tokens: int
    cost_usd:         float
    latency_ms:       float
    fallback_used:    bool = False

# ──────────────────────────────────────────────────────────────────
# 2. AI GATEWAY ENGINE
# ──────────────────────────────────────────────────────────────────

class AIGateway:
    """
    Passerelle AI d'entreprise implémentant le routage multi-LLM, les fallbacks
    et la gestion de budget par équipe.
    """

    def __init__(self):
        # Catalogue des fournisseurs LLM disponibles
        self.providers: list[LLMProvider] = [
            LLMProvider("OpenAI",    "gpt-4o",           cost_per_1k_tokens=0.0150, avg_latency_ms=800,  quality_score=0.97),
            LLMProvider("OpenAI",    "gpt-4o-mini",      cost_per_1k_tokens=0.0002, avg_latency_ms=400,  quality_score=0.88),
            LLMProvider("Anthropic", "claude-3-5-sonnet", cost_per_1k_tokens=0.0180, avg_latency_ms=900,  quality_score=0.96),
            LLMProvider("Mistral",   "mixtral-8x7b",      cost_per_1k_tokens=0.0007, avg_latency_ms=600,  quality_score=0.85),
            LLMProvider("Local",     "llama-3-70b-ollama",cost_per_1k_tokens=0.0000, avg_latency_ms=1200, quality_score=0.82, is_local=True),
        ]
        # Budget par équipe {team_id: BudgetTracker}
        self.budgets: dict[str, BudgetTracker] = {
            "equipe-juridique":     BudgetTracker(monthly_budget_usd=500.0),
            "equipe-support":       BudgetTracker(monthly_budget_usd=200.0),
            "equipe-rd":            BudgetTracker(monthly_budget_usd=2000.0),
        }
        # Audit log
        self.audit_log: list[dict] = []

    def _select_provider(self, policy: str, quality_threshold: float = 0.85) -> Optional[LLMProvider]:
        """
        Sélectionne le meilleur fournisseur disponible selon la politique de routage.
        """
        available = [p for p in self.providers if p.is_available()]
        if not available:
            return None

        if policy == "cost-based":
            return min(available, key=lambda p: p.cost_per_1k_tokens)
        elif policy == "quality-based":
            candidates = [p for p in available if p.quality_score >= quality_threshold]
            if not candidates:
                candidates = available
            return max(candidates, key=lambda p: p.quality_score)
        elif policy == "latency-based":
            return min(available, key=lambda p: p.avg_latency_ms)
        else:
            return random.choice(available)

    def _simulate_llm_call(self, provider: LLMProvider, prompt: str, max_tokens: int) -> tuple[str, int, int]:
        """Simule un appel LLM et retourne (réponse, prompt_tokens, completion_tokens)."""
        # Approximation : 1 token ≈ 4 caractères (tokenisation BPE)
        prompt_tokens      = max(1, len(prompt) // 4)
        completion_tokens  = max(1, min(max_tokens, len(prompt) // 8 + 50))
        simulated_response = f"[Réponse de {provider.model_id}] Voici une analyse complète de votre demande..."
        return simulated_response, prompt_tokens, completion_tokens

    def handle_request(self, request: GatewayRequest) -> Optional[GatewayResponse]:
        """
        Traite une requête entrante : vérification du budget, routage, fallback et audit.
        """
        print(f"\n[GATEWAY] Traitement de {request.request_id} | Équipe: {request.team_id} | Politique: {request.routing_policy}")

        # Étape 1 : Vérification du budget
        budget = self.budgets.get(request.team_id)
        if budget and budget.is_budget_exceeded:
            print(f"  [🚫 BUDGET] Équipe '{request.team_id}' a dépassé son budget mensuel de {budget.monthly_budget_usd}$. Requête bloquée.")
            return None

        # Étape 2 : Sélection du fournisseur principal
        start_time = time.perf_counter()
        provider = self._select_provider(request.routing_policy)
        fallback_used = False

        if not provider:
            print(f"  [⚠️  FALLBACK] Tous les fournisseurs sont indisponibles. Passage au fournisseur local Ollama.")
            provider = self.providers[-1]   # Dernier recours : modèle local
            fallback_used = True

        print(f"  [→ ROUTAGE] Fournisseur sélectionné : {provider.name}/{provider.model_id} (Coût: {provider.cost_per_1k_tokens:.4f}$/1K tokens)")

        # Étape 3 : Appel LLM (simulé)
        response_text, prompt_tokens, completion_tokens = self._simulate_llm_call(
            provider, request.prompt, request.max_tokens
        )
        latency_ms = (time.perf_counter() - start_time) * 1000 + provider.avg_latency_ms

        # Étape 4 : Calcul du coût et mise à jour du budget
        cost_usd = provider.estimate_cost(prompt_tokens, completion_tokens)
        if budget:
            budget.spent_usd    += cost_usd
            budget.total_tokens += prompt_tokens + completion_tokens
            budget.request_count += 1

        # Étape 5 : Audit Log
        log_entry = {
            "timestamp":      datetime.now().isoformat(),
            "request_id":     request.request_id,
            "team_id":        request.team_id,
            "provider":       f"{provider.name}/{provider.model_id}",
            "prompt_tokens":  prompt_tokens,
            "completion_tokens": completion_tokens,
            "cost_usd":       round(cost_usd, 6),
            "fallback":       fallback_used
        }
        self.audit_log.append(log_entry)

        return GatewayResponse(
            request_id=request.request_id,
            provider_used=f"{provider.name}/{provider.model_id}",
            response_text=response_text,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            cost_usd=cost_usd,
            latency_ms=latency_ms,
            fallback_used=fallback_used
        )

    def print_budget_report(self):
        """Affiche le rapport de consommation budgétaire par équipe."""
        print("\n" + "═" * 70)
        print("  RAPPORT DE CONSOMMATION AI — PARADIS IT ENTERPRISE GATEWAY")
        print("═" * 70)
        for team, budget in self.budgets.items():
            bar = "█" * int(budget.budget_utilization_pct / 5) + "░" * (20 - int(budget.budget_utilization_pct / 5))
            status = "🚨 DÉPASSÉ" if budget.is_budget_exceeded else ("⚠️ ALERTE" if budget.budget_utilization_pct > 80 else "✅ OK")
            print(f"  {team:<25s} │ {bar} │ {budget.spent_usd:>7.3f}$ / {budget.monthly_budget_usd:.0f}$ ({budget.budget_utilization_pct:.1f}%) {status}")
            print(f"  {'':25s} │ Requêtes: {budget.request_count:4d} │ Tokens: {budget.total_tokens:>8,}")
        print("═" * 70)

# ──────────────────────────────────────────────────────────────────
# 3. DÉMONSTRATION
# ──────────────────────────────────────────────────────────────────

def run_ai_gateway_demo():
    print("[*] ═══════════════════════════════════════════════════════")
    print("[*]   AI GATEWAY ENTERPRISE PARADIS IT — DÉMONSTRATION    ")
    print("[*] ═══════════════════════════════════════════════════════")

    gateway = AIGateway()

    # Scénario 1 : Requête cost-based (Support Client — budget limité)
    req1 = GatewayRequest(
        team_id="equipe-support",
        prompt="Comment réinitialiser le mot de passe de mon compte ?",
        routing_policy="cost-based",
        max_tokens=256
    )
    resp1 = gateway.handle_request(req1)
    if resp1:
        print(f"  ✅ Réponse reçue de {resp1.provider_used} | Coût: {resp1.cost_usd:.6f}$ | Latence: {resp1.latency_ms:.0f}ms")

    # Scénario 2 : Requête quality-based (Juridique — rédaction de contrat critique)
    req2 = GatewayRequest(
        team_id="equipe-juridique",
        prompt="Rédigez la clause de limitation de responsabilité pour notre contrat SaaS Enterprise conforme au RGPD et au droit français.",
        routing_policy="quality-based",
        max_tokens=2048
    )
    resp2 = gateway.handle_request(req2)
    if resp2:
        print(f"  ✅ Réponse reçue de {resp2.provider_used} | Coût: {resp2.cost_usd:.6f}$ | Latence: {resp2.latency_ms:.0f}ms")

    # Scénario 3 : Simulation d'un budget dépassé (injection manuelle)
    gateway.budgets["equipe-support"].spent_usd = 210.0  # Dépasse le budget de 200$
    req3 = GatewayRequest(team_id="equipe-support", prompt="Quel est le statut de ma commande ?", routing_policy="cost-based")
    resp3 = gateway.handle_request(req3)

    # Rapport final
    gateway.print_budget_report()

if __name__ == "__main__":
    run_ai_gateway_demo()
```

---

## Module 3 — Configuration LiteLLM Proxy YAML & Observabilité (1h30)

### 🔍 Configuration LiteLLM Proxy : `config.yaml` de Production

```yaml
# litellm_config.yaml — Configuration AI Gateway Production PARADIS IT

model_list:
  # Groupe "qualite-maximale" : Routage vers les meilleurs modèles disponibles
  - model_name: "llm-qualite"
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      mode: "chat"

  - model_name: "llm-qualite"     # Même alias → LiteLLM fait du round-robin avec fallback
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY

  # Groupe "llm-economique" : Modèles bon marché pour les tâches simples
  - model_name: "llm-economique"
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY

  - model_name: "llm-economique"
    litellm_params:
      model: mistral/mistral-medium
      api_key: os.environ/MISTRAL_API_KEY

  # Fallback local : Modèle Ollama en cas de panne de tous les providers cloud
  - model_name: "llm-local-fallback"
    litellm_params:
      model: ollama/llama3:70b
      api_base: http://ollama-server:11434

router_settings:
  routing_strategy: "latency-based"        # least-busy | cost-based | latency-based
  num_retries: 3
  retry_after: 5                           # Secondes avant retry
  fallbacks:                               # Cascade de fallback automatique
    - {"llm-qualite": ["llm-economique"]}
    - {"llm-economique": ["llm-local-fallback"]}

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY

litellm_settings:
  success_callback: ["langfuse", "prometheus"]   # Observabilité
  failure_callback: ["slack"]                     # Alerte Slack en cas d'erreur
  set_verbose: false

# Budget Manager par équipe (Virtual Keys)
environment_variables:
  TEAM_JURIDIQUE_MONTHLY_BUDGET_USD: "500"
  TEAM_SUPPORT_MONTHLY_BUDGET_USD:   "200"
  TEAM_RD_MONTHLY_BUDGET_USD:        "2000"
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **AI Gateway** | Passerelle centralisée orchestrant le trafic entre les applications internes et les fournisseurs LLM |
| **LiteLLM** | Bibliothèque Python open-source offrant une interface API unifiée compatible OpenAI pour 100+ LLMs |
| **Fallback** | Basculement automatique vers un fournisseur alternatif en cas de panne du fournisseur principal |
| **Virtual Key** | Clé API interne générée par le Gateway pour isoler et budgéter l'usage par équipe |
| **AI FinOps** | Discipline appliquant les principes du FinOps Cloud à la maîtrise des coûts de consommation LLM |
| **Langfuse** | Plateforme open-source d'observabilité et de traçabilité LLM (logs de prompts, tokens, coûts) |

---

## Exercices Pratiques

### Exercice 1 — Calcul du Coût d'une Requête LLM

Un développeur envoie au gateway une requête à `gpt-4o` dont le prompt contient **1 200 tokens** et qui génère une complétion de **800 tokens**. Le tarif `gpt-4o` est de **0,005$ pour 1 000 tokens d'input** et **0,015$ pour 1 000 tokens d'output**.

1. Calculez le coût total de cette unique requête.
2. Combien de requêtes identiques peuvent être effectuées dans un budget mensuel de **200$** ?

**Corrigé guidé :**
1. **Coût d'une requête :**
$$\text{Coût Input} = \frac{1200}{1000} \times 0.005\$ = 0.006\$$$
$$\text{Coût Output} = \frac{800}{1000} \times 0.015\$ = 0.012\$$$
$$\text{Coût Total} = 0.006 + 0.012 = \textbf{0.018\$}$$

2. **Nombre de requêtes dans 200$ :**
$$\text{Requêtes} = \left\lfloor \frac{200\$}{0.018\$} \right\rfloor = \left\lfloor 11\,111.1 \right\rfloor = \textbf{11\,111 requêtes}$$

---

## Banque QCM — 5 Questions

**Q1.** Quel est le principal avantage d'un **AI Gateway (LiteLLM Proxy)** par rapport à l'intégration directe d'un LLM dans chaque application ?

- A) Il rend les modèles LLM 100× plus rapides.
- B) Il centralise l'authentification, le routage multi-fournisseur, les fallbacks automatiques, la gestion des budgets et l'observabilité en un seul point de contrôle. ✅
- C) Il remplace le besoin de GPU.
- D) Il supprime la nécessité de rédiger des prompts.

**Q2.** La stratégie de routage **`cost-based`** dans LiteLLM sélectionne le fournisseur selon :

- A) L'alphabétique du nom du fournisseur.
- B) Le modèle disponible avec le coût par token le plus bas capable de traiter la requête, maximisant ainsi l'économie de dépenses en tokens. ✅
- C) La couleur du logo du fournisseur.
- D) La taille du fichier de configuration YAML.

**Q3.** Pourquoi est-il recommandé de configurer un **modèle local Ollama comme dernier fallback** dans la cascade LiteLLM ?

- A) Parce que les modèles locaux sont plus intelligents que les modèles cloud.
- B) Parce que les modèles locaux fonctionnent hors connexion Internet, garantissant la continuité de service même lors de pannes simultanées de tous les fournisseurs cloud (OpenAI, Anthropic, Mistral). ✅
- C) Parce que le modèle local est gratuit et remplace avantageusement tous les autres.
- D) Parce que le modèle local est compatible uniquement avec Windows.

**Q4.** Qu'est-ce qu'une **Virtual Key** dans le contexte d'un AI Gateway d'entreprise ?

- A) Un mot de passe chiffré stocké dans un fichier texte.
- B) Une clé API générée par le Gateway, assignée à une équipe ou un projet, permettant d'isoler les quotas de consommation, d'appliquer des budgets et d'auditer l'usage sans exposer les clés API réelles des fournisseurs. ✅
- C) Un algorithme de chiffrement RSA.
- D) Une licence logicielle payante.

**Q5.** Dans l'architecture proposée, quel outil d'observabilité est utilisé pour tracer les appels LLM (prompts, tokens, coûts, durée) afin de débogguer les problèmes de qualité en production ?

- A) Microsoft Paint.
- B) Langfuse, une plateforme open-source de traçabilité LLM qui capture chaque appel avec ses paramètres, sa réponse, son coût et sa latence. ✅
- C) Microsoft Excel.
- D) FileZilla.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
