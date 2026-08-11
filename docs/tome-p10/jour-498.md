# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 498 (6h) : AI FinOps & Optimisation des Coûts Token : Cache Sémantique Redis, Compression de Prompt & Token Budgeting

> [!NOTE]
> **Objectifs pédagogiques :**
> - Quantifier et analyser la structure des coûts d'une infrastructure LLM d'entreprise (tokens input vs output, modèles, fréquence)
> - Implémenter un **Cache Sémantique** avec Redis et des embeddings de similarité pour éviter les appels LLM redondants
> - Appliquer des techniques de **Compression de Prompt** (LLMLingua, résumé de contexte) réduisant les tokens d'entrée de 20 à 50%
> - Concevoir un système de **Token Budgeting** avec alertes et dégradation gracieuse pour les équipes dépassant leur quota
>
> **Compétences visées :** `AI-03` (A), `INF-02` (A) — AI FinOps & Token Cost Optimization

---

## Module 1 — Anatomie des Coûts LLM & Leviers d'Optimisation (2h)

### 📖 Intuition & Narration

L'adoption de LLMs en entreprise génère des factures qui surprennent les équipes financières. Une start-up constate avec stupeur que son assistant de support client coûte 15 000€ par mois en tokens GPT-4o — presque autant que le salaire d'un développeur senior. Le DSI exige une réduction de 60% en 3 mois.

L'équipe MLOps analyse la facture en détail et découvre une réalité structurante : **80% des appels LLM sont des questions répétitives**. Les 500 questions les plus fréquentes représentent à elles seules 40% du volume de tokens. Par ailleurs, chaque prompt inclut un contexte système de 2 000 tokens (documentation produit) qui est retransmis intégralement à chaque question, même les plus triviales.

Deux leviers d'optimisation majeurs émergent immédiatement :
1. **Cache Sémantique** : Stocker les réponses aux questions déjà posées et les servir directement sans appeler le LLM lorsqu'une question similaire est détectée.
2. **Compression de Prompt** : Réduire le nombre de tokens d'entrée en supprimant les parties redondantes du contexte.

### 🔍 Anatomie Technique — Structure des Coûts LLM

```
DÉCOMPOSITION DES COÛTS D'UNE INFRASTRUCTURE LLM ENTERPRISE

  Facture mensuelle totale : 15 000$

  ┌──────────────────────────────────────────────────────────────────┐
  │ Type de Coût              │ % Facture │ Montant   │ Levier       │
  ├──────────────────────────────────────────────────────────────────┤
  │ Input tokens (prompt sys) │    35%    │ 5 250$    │ Compression  │
  │ Input tokens (question)   │    15%    │ 2 250$    │ Cache        │
  │ Output tokens (réponse)   │    40%    │ 6 000$    │ Cache + Max  │
  │ Embedding (recherche RAG) │    10%    │ 1 500$    │ Cache        │
  └──────────────────────────────────────────────────────────────────┘

  POTENTIEL D'ÉCONOMIE AVEC LES 3 LEVIERS :
  ─────────────────────────────────────────────────────────────────
  Cache Sémantique  → Évite 40% des appels → -6 000$/mois
  Compression       → Réduit tokens de 30% → -2 250$/mois
  Routage Economique→ Switch vers mini      → -2 000$/mois
  ─────────────────────────────────────────────────────────────────
  ÉCONOMIE TOTALE ESTIMÉE   → -10 250$/mois soit -68.3% de réduction
```

### 🔍 Principe du Cache Sémantique

Un cache classique (Redis avec clé = hash du prompt) ne fonctionne que pour des requêtes **textuellement identiques**. *"Comment réinitialiser mon mot de passe ?"* et *"Comment je reset mon password ?"* généreraient deux hash différents → deux appels LLM.

Le **Cache Sémantique** utilise les **embeddings vectoriels** (représentation numérique de la signification d'un texte) pour comparer la *similarité sémantique* de deux questions, pas leur ressemblance textuelle. Si la similarité cosinus entre les deux embeddings dépasse un seuil (ex: 0.92), la réponse en cache est servie directement.

```
FONCTIONNEMENT DU CACHE SÉMANTIQUE

  Nouvelle Question Q : "Comment je réinitialise mon password ?"
          │
          ▼
  [Embedding Model] ──► Vecteur Q : [0.23, -0.87, 0.15, ..., 0.64] (1536 dimensions)
          │
          ▼
  [Recherche Redis Vector] ──► Similarité Cosinus avec les clés en cache
          │
          ├── Cache Miss (sim < 0.92) ──► Appel LLM + Stockage en cache
          │
          └── Cache HIT (sim = 0.96)  ──► Réponse cache renvoyée (0 token facturé)
                                          Question en cache : "Comment réinitialiser mon mot de passe ?"
```

---

## Module 2 — Atelier Pratique : Cache Sémantique + Compression de Prompt (2h)

### 🛠️ Code Python : Cache Sémantique sans Dépendances Externes (Simulation Autonome)

```python
#!/usr/bin/env python3
"""
PARADIS — AI FinOps : Cache Sémantique + Compression de Prompt + Token Budgeting
Simulation autonome sans dépendances LLM externes.
"""

import math
import json
import time
import hashlib
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime

# ──────────────────────────────────────────────────────────────────
# 1. EMBEDDING SIMULÉ (En production : text-embedding-3-small d'OpenAI)
# ──────────────────────────────────────────────────────────────────

def compute_simulated_embedding(text: str, dimensions: int = 64) -> list[float]:
    """
    Produit un vecteur d'embedding simulé déterministe basé sur le contenu textuel.
    En production, remplacer par : openai.embeddings.create(input=text, model='text-embedding-3-small')
    Les textes sémantiquement similaires auront des vecteurs plus proches car le hachage
    capture des patterns de caractères similaires.
    """
    # Normalisation du texte : minuscules, suppression de la ponctuation
    normalized = ''.join(c.lower() if c.isalnum() or c.isspace() else '' for c in text)
    words = normalized.split()

    vector = [0.0] * dimensions
    for i, word in enumerate(words):
        word_hash = hashlib.sha256(word.encode()).digest()
        for j in range(min(dimensions, len(word_hash))):
            vector[j % dimensions] += (word_hash[j] - 128) / 128.0

    # Normalisation L2 du vecteur (norme unitaire)
    norm = math.sqrt(sum(v**2 for v in vector))
    if norm > 0:
        vector = [v / norm for v in vector]
    return vector

def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """Calcule la similarité cosinus entre deux vecteurs d'embeddings."""
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(v**2 for v in vec_a))
    norm_b = math.sqrt(sum(v**2 for v in vec_b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)

# ──────────────────────────────────────────────────────────────────
# 2. CACHE SÉMANTIQUE
# ──────────────────────────────────────────────────────────────────

@dataclass
class CacheEntry:
    question_original:  str
    embedding:          list[float]
    response:           str
    tokens_saved:       int
    cached_at:          str = field(default_factory=lambda: datetime.now().isoformat())
    hit_count:          int = 0

class SemanticCache:
    """
    Cache sémantique basé sur la similarité cosinus des embeddings.
    En production : utiliser Redis avec l'extension RedisVL pour la recherche vectorielle.
    """

    def __init__(self, similarity_threshold: float = 0.88, max_entries: int = 10000):
        self.cache:                list[CacheEntry] = []
        self.similarity_threshold: float = similarity_threshold
        self.max_entries:          int   = max_entries
        # Statistiques FinOps
        self.total_requests:  int   = 0
        self.cache_hits:      int   = 0
        self.tokens_saved:    int   = 0
        self.cost_saved_usd:  float = 0.0

    def lookup(self, question: str, cost_per_1k_tokens: float = 0.005) -> Optional[str]:
        """
        Recherche une réponse en cache sémantiquement similaire.
        Retourne la réponse si trouvée, None sinon (cache miss).
        """
        self.total_requests += 1
        query_embedding = compute_simulated_embedding(question)

        best_similarity = 0.0
        best_entry: Optional[CacheEntry] = None

        for entry in self.cache:
            sim = cosine_similarity(query_embedding, entry.embedding)
            if sim > best_similarity:
                best_similarity = sim
                best_entry = entry

        if best_entry and best_similarity >= self.similarity_threshold:
            best_entry.hit_count += 1
            self.cache_hits      += 1
            self.tokens_saved    += best_entry.tokens_saved
            self.cost_saved_usd  += (best_entry.tokens_saved / 1000) * cost_per_1k_tokens
            print(f"  ✅ CACHE HIT (sim={best_similarity:.4f}) ← '{best_entry.question_original}'")
            return best_entry.response

        print(f"  ❌ CACHE MISS (best_sim={best_similarity:.4f} < {self.similarity_threshold})")
        return None

    def store(self, question: str, response: str, tokens_used: int) -> None:
        """Stocke une nouvelle réponse LLM dans le cache."""
        if len(self.cache) >= self.max_entries:
            # Politique d'éviction LFU : supprimer l'entrée la moins utilisée
            self.cache.sort(key=lambda e: e.hit_count)
            self.cache.pop(0)

        embedding = compute_simulated_embedding(question)
        self.cache.append(CacheEntry(
            question_original=question,
            embedding=embedding,
            response=response,
            tokens_saved=tokens_used
        ))

    @property
    def hit_rate(self) -> float:
        return (self.cache_hits / self.total_requests * 100) if self.total_requests > 0 else 0.0

# ──────────────────────────────────────────────────────────────────
# 3. COMPRESSION DE PROMPT
# ──────────────────────────────────────────────────────────────────

class PromptCompressor:
    """
    Compresse les prompts système en supprimant les informations redondantes,
    les répétitions et les formulations verbeuses.
    En production : utiliser LLMLingua (Microsoft) ou PromptCrunch.
    """

    # Mots vides (stop words) spécifiques aux prompts système
    VERBOSE_PATTERNS = [
        ("S'il vous plaît", "SVP"),
        ("Veuillez noter que ", "Note: "),
        ("Il est important de souligner que ", ""),
        ("Comme mentionné précédemment, ", ""),
        ("Dans le cas où ", "Si "),
        ("En ce qui concerne ", "Pour "),
        ("Il convient de mentionner que ", ""),
    ]

    def compress(self, system_prompt: str) -> tuple[str, float]:
        """
        Compresse un prompt système en réduisant la verbosité.
        Retourne (prompt_compressé, taux_de_compression).
        """
        original_tokens = max(1, len(system_prompt.split()))
        compressed = system_prompt

        for verbose_form, compact_form in self.VERBOSE_PATTERNS:
            compressed = compressed.replace(verbose_form, compact_form)

        # Suppression des espaces multiples et lignes vides consécutives
        import re
        compressed = re.sub(r'\n{3,}', '\n\n', compressed)
        compressed = re.sub(r' {2,}', ' ', compressed)
        compressed = compressed.strip()

        compressed_tokens = max(1, len(compressed.split()))
        compression_ratio = 1.0 - (compressed_tokens / original_tokens)
        return compressed, compression_ratio

# ──────────────────────────────────────────────────────────────────
# 4. DÉMONSTRATION COMPLÈTE AI FINOPS
# ──────────────────────────────────────────────────────────────────

def run_ai_finops_demo():
    print("[*] ═══════════════════════════════════════════════════════")
    print("[*]   AI FINOPS — CACHE SÉMANTIQUE & COMPRESSION PROMPT   ")
    print("[*] ═══════════════════════════════════════════════════════")

    cache      = SemanticCache(similarity_threshold=0.80)  # Seuil abaissé pour la simulation
    compressor = PromptCompressor()

    # ── Test de compression de prompt système ──
    verbose_system_prompt = """
    S'il vous plaît, veuillez noter que vous êtes un assistant de support technique.
    Il est important de souligner que vous devez répondre en français.
    En ce qui concerne le ton, il convient de mentionner que vous devez être professionnel.
    Dans le cas où vous ne connaissez pas la réponse, dites-le clairement.
    Comme mentionné précédemment, vous traitez des questions de support IT niveau 1.
    """
    compressed_prompt, compression_rate = compressor.compress(verbose_system_prompt)
    original_tokens   = len(verbose_system_prompt.split())
    compressed_tokens = len(compressed_prompt.split())

    print(f"\n[1] COMPRESSION DU PROMPT SYSTÈME :")
    print(f"    Tokens originaux  : {original_tokens:4d}")
    print(f"    Tokens compressés : {compressed_tokens:4d}")
    print(f"    Taux de compression : {compression_rate * 100:.1f}%")
    print(f"    Économie par appel  : {original_tokens - compressed_tokens} tokens")

    # ── Test du cache sémantique ──
    print(f"\n[2] DÉMONSTRATION DU CACHE SÉMANTIQUE (seuil sim={cache.similarity_threshold}) :")
    simulated_llm_response = "Pour réinitialiser votre mot de passe, rendez-vous sur la page de connexion et cliquez sur 'Mot de passe oublié'."
    TOKENS_PER_CALL = 450

    questions = [
        # Premier appel : stockage en cache
        "Comment réinitialiser mon mot de passe ?",
        # Questions sémantiquement équivalentes (doivent être des cache HIT)
        "Comment je réinitialise mon password ?",
        "Procédure pour changer son mot de passe",
        "Je veux reset mon pwd, comment faire ?",
        # Question différente (doit être un cache MISS)
        "Comment contacter le support téléphonique ?",
    ]

    for i, question in enumerate(questions):
        print(f"\n  Question {i+1}: \"{question}\"")
        cached_response = cache.lookup(question)
        if cached_response:
            print(f"    → Réponse servie depuis le cache (0 token facturé)")
        else:
            # Simulation d'appel LLM
            print(f"    → Appel LLM simulé ({TOKENS_PER_CALL} tokens)")
            cache.store(question, simulated_llm_response, TOKENS_PER_CALL)

    # ── Rapport FinOps ──
    print(f"\n{'═' * 60}")
    print(f"  RAPPORT AI FINOPS — CACHE SÉMANTIQUE")
    print(f"{'═' * 60}")
    print(f"  Requêtes totales   : {cache.total_requests}")
    print(f"  Cache Hits         : {cache.cache_hits}")
    print(f"  Taux de Cache Hit  : {cache.hit_rate:.1f}%")
    print(f"  Tokens économisés  : {cache.tokens_saved:,}")
    print(f"  Économie estimée   : {cache.cost_saved_usd:.4f}$ (base gpt-4o-mini)")
    print(f"{'═' * 60}")

if __name__ == "__main__":
    run_ai_finops_demo()
```

---

## Module 3 — Token Budgeting & Alertes Seuil (1h30)

### 🔍 Dégradation Gracieuse selon le Budget Restant

```
STRATÉGIE DE DÉGRADATION GRACIEUSE PAR BUDGET TOKEN

  Budget Mensuel Alloué : 500$

  Phase VERTE (> 50% restant) :
  ──► Routage vers gpt-4o / claude-3-5-sonnet.
  ──► Aucune restriction de fonctionnalités.

  Phase ORANGE (20% à 50% restant) :
  ──► Routage automatique vers gpt-4o-mini / mixtral-8x7b.
  ──► Alerte Slack envoyée au responsable d'équipe.
  ──► max_tokens limité à 512 (vs 2048 en phase verte).

  Phase ROUGE (< 20% restant) :
  ──► Routage vers modèle local Ollama (coût = 0$).
  ──► Alerte mail prioritaire au DSI.
  ──► Cache sémantique forcé à seuil 0.75 (plus agressif).

  Phase BLOQUÉE (0$ restant) :
  ──► Requêtes rejetées avec HTTP 402 Payment Required.
  ──► Message utilisateur : "Quota mensuel atteint. Contact : dsi@paradis.fr"
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Semantic Cache** | Cache utilisant la similarité sémantique (embeddings + cosinus) pour retrouver des réponses similaires |
| **LLMLingua** | Bibliothèque Microsoft de compression de prompts par suppression des tokens non-essentiels |
| **Cosine Similarity** | Mesure de similarité entre deux vecteurs — produit scalaire divisé par le produit des normes |
| **Token Budgeting** | Système d'allocation et de surveillance des quotas de consommation de tokens par équipe |
| **Graceful Degradation** | Réduction progressive des capacités d'un système en cas de contrainte ressource, sans interruption totale |
| **LFU** | Least Frequently Used — Politique d'éviction de cache supprimant les entrées les moins accédées |

---

## Exercices Pratiques

### Exercice 1 — Calcul du ROI du Cache Sémantique

Un système de support IA traite **50 000 requêtes par mois**. Après analyse, 60% des requêtes sont sémantiquement similaires à des questions déjà posées et pourraient être servies par le cache. Chaque appel LLM coûte en moyenne **0,008$** (input + output combinés avec `gpt-4o`). La mise en place du cache sémantique avec Redis coûte **150$/mois** (infrastructure + licence).

1. Calculez l'économie brute mensuelle apportée par le cache sémantique.
2. Calculez le retour sur investissement (ROI) net mensuel.
3. Calculez le nombre de mois nécessaires pour amortir un coût de setup initial de **600$**.

**Corrigé guidé :**
1. **Économie brute :**
$$\text{Requêtes économisées} = 50\,000 \times 60\% = 30\,000 \text{ requêtes}$$
$$\text{Économie brute} = 30\,000 \times 0.008\$ = \textbf{240\$ / mois}$$

2. **ROI net mensuel :**
$$\text{ROI net} = 240\$ - 150\$ = \textbf{90\$ / mois}$$

3. **Amortissement du setup (600$) :**
$$\text{Amortissement} = \left\lceil \frac{600\$}{90\$ / \text{mois}} \right\rceil = \left\lceil 6.67 \right\rceil = \textbf{7 mois}$$

---

## Banque QCM — 5 Questions

**Q1.** Pourquoi un cache classique basé sur le **hash exact du texte** est-il insuffisant pour un système LLM de support client ?

- A) Parce que le hash est trop lent à calculer.
- B) Parce que des questions sémantiquement identiques mais formulées différemment (*"reset password"* vs *"réinitialiser mot de passe"*) produisent des hashs totalement différents, manquant ainsi toutes les opportunités de cache. ✅
- C) Parce que Redis ne supporte pas les hashs textuels.
- D) Parce que le cache classique ne fonctionne qu'en JavaScript.

**Q2.** La **similarité cosinus** entre deux vecteurs d'embeddings vaut exactement **1.0**. Que cela signifie-t-il ?

- A) Les deux textes sont totalement opposés sémantiquement.
- B) Les deux vecteurs pointent exactement dans la même direction — les deux textes ont une signification sémantique identique. ✅
- C) Les vecteurs ont la même longueur en octets.
- D) La requête doit être bloquée par les guardrails.

**Q3.** Quel outil Microsoft permet de **compresser les tokens d'un prompt** de 20 à 50% en supprimant les tokens non-essentiels tout en préservant les informations importantes ?

- A) Microsoft Teams.
- B) LLMLingua, un framework de compression de prompts basé sur un modèle de perplexité. ✅
- C) Microsoft Paint.
- D) BitLocker.

**Q4.** Dans la stratégie de **dégradation gracieuse** par budget token, quelle action est déclenchée quand le budget restant descend sous les **20%** ?

- A) Le système se redémarre automatiquement.
- B) Le routage bascule vers le modèle local Ollama (coût zéro), une alerte mail prioritaire est envoyée au DSI, et le seuil de similarité du cache sémantique est rendu plus agressif. ✅
- C) Toutes les requêtes sont bloquées immédiatement.
- D) Les logs sont supprimés pour libérer de l'espace disque.

**Q5.** La **politique d'éviction LFU (Least Frequently Used)** dans le cache sémantique consiste à :

- A) Supprimer les entrées les plus récentes du cache.
- B) Supprimer les entrées les plus volumineuses en octets.
- C) Supprimer les entrées qui ont été accédées le moins de fois, libérant de la place pour les nouvelles entrées populaires. ✅
- D) Vider intégralement le cache toutes les heures.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
