# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 557 (6h) : Microservices Patterns Avancés : Saga, CQRS, Event Sourcing & Transactional Outbox

> [!NOTE]
> **Objectifs pédagogiques :**
> - Résoudre le défi des **transactions distribuées** dans une architecture microservices sans utiliser le protocole bloquant 2PC (Two-Phase Commit)
> - Implémenter le **Pattern Saga** (Choreography vs Orchestration) avec transactions compensatoires en cas d'échec
> - Concevoir des architectures **CQRS (Command Query Responsibility Segregation)** pour séparer les modèles d'écriture et de lecture
> - Appliquer le **Transactional Outbox Pattern** avec Change Data Capture (CDC / Debezium) pour garantir l'atomicité entre la base de données et le bus de messages (Kafka)
>
> **Compétences visées :** `ARCH-01` (A), `DEV-01` (A) — Advanced Microservices Patterns, Distributed Systems

---

## Module 1 — Transactions Distribuées & Pattern Saga (2h)

### 📖 Intuition & Narration

Dans une architecture monolithique, réserver une commande implique de mettre à jour la table `Orders`, déduire le stock dans `Inventory`, et débiter le solde dans `Payment` au sein d'une seule et même transaction ACID de base de données (`BEGIN TRANSACTION ... COMMIT`). Si une étape échoue, la base annule tout (`ROLLBACK`).

Dans une architecture microservices, `Order Service`, `Inventory Service` et `Payment Service` ont **chacun leur propre base de données isolée**. Il est impossible d'utiliser une transaction ACID classique sur 3 bases distinctes sans bloquer le système (le protocole 2PC - Two-Phase Commit ne scale pas et crée un couplage fort).

Le **Pattern Saga** résout ce problème en découpant la transaction globale en une suite de **transactions locales autonomes**. Si une étape échoue (ex: paiement refusé), la Saga déclenche une série de **transactions compensatoires** (en sens inverse) pour annuler les effets des étapes précédentes.

### 🔍 Pattern Saga : Chorégraphie vs Orchestration

```
SAGA ORCHESTRATION (RECOMMANDÉ POUR LES FLUX COMPLEXES)

  ┌────────────────────────────────────────────────────────────────────────┐
  │  SAGA ORCHESTRATOR (OrderSagaOrchestrator)                             │
  │  Maintient la machine à états de la transaction distribuée            │
  └───────┬────────────────────────┬───────────────────────┬───────────────┘
          │ 1. CreateOrder         │ 2. ReserveStock       │ 3. ProcessPayment
          ▼                        ▼                       ▼
  ┌──────────────┐         ┌──────────────┐        ┌──────────────┐
  │ Order        │         │ Inventory    │        │ Payment      │
  │ Service      │         │ Service      │        │ Service      │
  └──────────────┘         └──────────────┘        └──────┬───────┘
                                                          │ ❌ PAIEMENT REFUSÉ !
                                                          ▼
  SAGA ORCHESTRATOR ─── 4. Compensate: CancelStock ────→ Inventory Service
  SAGA ORCHESTRATOR ─── 5. Compensate: CancelOrder ───→ Order Service
```

---

## Module 2 — CQRS, Event Sourcing & Transactional Outbox (2h)

### 🔍 CQRS (Command Query Responsibility Segregation)

CQRS sépare strictement les opérations qui modifient l'état (Commands) des opérations qui lisent l'état (Queries) :

```
ARCHITECTURE CQRS + EVENT SOURCING

                     COMMAND (Écriture)             QUERY (Lecture)
                     ┌──────────────────┐           ┌──────────────────┐
  Client API ───────→│ Command Handler  │           │ Query Handler    │←───── Client API
                     └────────┬─────────┘           └────────▲─────────┘
                              │                              │
                              ▼                              │
                     ┌──────────────────┐           ┌────────┴─────────┐
                     │ Event Store      │──────────→│ Read Database    │
                     │ (Append-Only)    │ (Sync)    │ (Elastic/Redis)  │
                     └──────────────────┘           └──────────────────┘
```

### 🔍 Transactional Outbox Pattern (CDC + Debezium)

Comment garantir qu'un événement Kafka est **toujours envoyé** si et seulement si la transaction SQL locale a réussi ?

Sans Outbox Pattern, si le serveur plante juste après le `db.commit()` mais avant `kafka.send()`, la base est à jour mais le reste du système n'est pas informé (incohérence).

```
TRANSACTIONAL OUTBOX PATTERN

  APPLICATION WORKLOAD                           CHANGE DATA CAPTURE (CDC)
  ┌──────────────────────────────────────────┐   ┌────────────────────────┐
  │ BEGIN TRANSACTION                        │   │ Debezium / Kafka Conn. │
  │   1. UPDATE orders SET status='PAID'     │   │ Reads DB Transaction   │
  │   2. INSERT INTO outbox_table (event...) │   │ Log (WAL) in real-time │
  │ COMMIT TRANSACTION                       │   └───────────┬────────────┘
  └──────────────────────────────────────────┘               │
                                                             ▼
                                                 ┌────────────────────────┐
                                                 │ Kafka Topic: outbox    │
                                                 └────────────────────────┘
```

---

## Module 3 — Implémentation d'un Saga Orchestrator (1h30)

### 🛠️ Script Python : Saga Orchestrator Simulation with Compensation

```python
#!/usr/bin/env python3
"""
PARADIS — Saga Orchestrator Simulation
Simule l'exécution d'une Saga distribuée avec gestion des compensations en cas d'échec.
"""
from dataclasses import dataclass
from typing import List, Callable
import time

@dataclass
class SagaStep:
    name: str
    execute: Callable[[], bool]       # Transaction locale
    compensate: Callable[[], bool]    # Transaction compensatoire (annulations)

class OrderSagaOrchestrator:
    def __init__(self, order_id: str):
        self.order_id = order_id
        self.steps: List[SagaStep] = []
        self.executed_steps: List[SagaStep] = []

    def add_step(self, step: SagaStep):
        self.steps.append(step)

    def run_saga(self) -> bool:
        print("=" * 65)
        print(f"  SAGA ORCHESTRATOR — EXÉCUTION COMMANDE : {self.order_id}")
        print("=" * 65)
        print()

        for i, step in enumerate(self.steps, 1):
            print(f"  [Étape {i}/{len(self.steps)}] Exécution : {step.name}...")
            time.sleep(0.1)

            success = step.execute()
            if success:
                print(f"    ✓ {step.name} : RÉUSSI")
                self.executed_steps.append(step)
            else:
                print(f"    ❌ {step.name} : ÉCHEC ! DÉCLENCHEMENT DE LA SAGA COMPENSATOIRE...")
                self._rollback()
                return False

        print("\n" + "─" * 65)
        print(f"  [✅ SAGA SUCCÈS] Commande '{self.order_id}' validée avec succès.")
        print("=" * 65)
        return True

    def _rollback(self):
        print("\n  🔄 DÉBUT DES TRANSACTIONS COMPENSATOIRES (ROLLBACK DISTRIBUÉ) :")
        # Annuler les étapes en ordre inverse (LIFO)
        for step in reversed(self.executed_steps):
            print(f"    ↩️ Compensation : {step.name}...")
            time.sleep(0.1)
            comp_success = step.compensate()
            if comp_success:
                print(f"       ✓ Compensé : {step.name}")
            else:
                print(f"       🚨 CRITIQUE : Échec de la compensation pour {step.name} ! Intervention manuelle requise.")

        print("\n" + "─" * 65)
        print(f"  [❌ SAGA ANNULÉE] État du système remis en cohérence éventuelle.")
        print("=" * 65)


# === SIMULATION DES SERVICES INDÉPENDANTS ===
def step_create_order(): return True
def compensate_create_order(): return True

def step_reserve_stock(): return True
def compensate_reserve_stock(): return True

def step_process_payment_fail(): return False  # Simulation échec du paiement !
def compensate_process_payment(): return True

if __name__ == "__main__":
    orchestrator = OrderSagaOrchestrator("ORD-2024-9948")

    orchestrator.add_step(SagaStep("1. Créer Commande (Order Service)", step_create_order, compensate_create_order))
    orchestrator.add_step(SagaStep("2. Réserver Stock (Inventory Service)", step_reserve_stock, compensate_reserve_stock))
    orchestrator.add_step(SagaStep("3. Traiter Paiement (Payment Service)", step_process_payment_fail, compensate_process_payment))

    # Exécution de la Saga (qui va échouer à l'étape 3 et compenser les étapes 2 et 1)
    orchestrator.run_saga()
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Saga** | Pattern de gestion de transactions distribuées par chaîne de transactions locales et compensations |
| **CQRS** | Command Query Responsibility Segregation — Séparation des modèles d'écriture (Command) et de lecture (Query) |
| **CDC** | Change Data Capture — Capture des modifications de base de données en temps réel depuis le journal de transactions (WAL) |
| **2PC** | Two-Phase Commit — Protocole traditionnel de validation distribuée bloquant (non recommandé en microservices) |
| **WAL** | Write-Ahead Logging — Journal d'écriture préalable des bases de données utilisé par Debezium pour le CDC |

---

## Exercices Pratiques

### Exercice 1 — Choix d'Architecture : Saga vs 2PC vs Monolithe

Un architecte propose d'utiliser le protocole **2PC (Two-Phase Commit)** pour gérer les transactions entre 8 microservices indépendants traitant 5 000 requêtes/seconde. Analysez les limites de cette proposition et expliquez pourquoi le **Pattern Saga avec Orchestration** est plus approprié.

**Corrigé guidé :**
1. **Limites du 2PC à forte échelle** :
   - **Verrouillage bloquant** : 2PC maintient des verrous sur les ressources de toutes les bases pendant toute la durée de la transaction.
   - **Point d'échec unique (SPOF)** : Si le coordinateur 2PC ou un seul des 8 microservices ne répond pas, toutes les bases restent verrouillées.
   - **Latence explosive** : Le temps de réponse est au minimum la somme des latences des 8 bases. À 5 000 req/sec, les bases seront saturées en quelques secondes.
2. **Pourquoi la Saga avec Orchestration est supérieure** :
   - **Non-bloquant** : Chaque service valide sa transaction locale immédiatement sans verrouiller les autres.
   - **Résilience** : En cas d'échec, l'Orchestrateur exécute les transactions compensatoires de manière asynchrone sans bloquer l'ensemble du système.

---

## Banque QCM — 5 Questions

**Q1.** Pourquoi l'utilisation des transactions ACID classiques avec le protocole **2PC (Two-Phase Commit)** n'est-elle pas recommandée dans les architectures microservices à forte échelle ?

- A) 2PC ne fonctionne pas avec SQL.
- B) 2PC crée des verrous bloquants sur toutes les bases de données concernées, augmentant fortement la latence et risquant de paralyser le système en cas d'indisponibilité d'un seul service. ✅
- C) 2PC est réservé au langage C++.
- D) 2PC ne prend pas en charge le chiffrement.

**Q2.** Dans le **Pattern Saga**, qu'est-ce qu'une **transaction compensatoire** ?

- A) Une transaction bancaire avec des frais réduits.
- B) Une action d'annulation exécutée en sens inverse (ex: annuler la réservation de stock) lorsqu'une étape ultérieure de la Saga distribuée échoue, pour rétablir la cohérence du système. ✅
- C) Une sauvegarde de la base de données.
- D) Une requête de lecture accélérée par du cache.

**Q3.** Quel est le rôle principal du **Transactional Outbox Pattern** ?

- A) Vider automatiquement la corbeille de la base de données.
- B) Garantir qu'un événement est publié dans un bus de messages (ex: Kafka) **si et seulement si** la transaction SQL locale a réussi, en écrivant l'événement dans une table `outbox` au sein de la même transaction SQL. ✅
- C) Envoyer des e-mails aux clients en masse.
- D) Chiffrer les disques durs.

**Q4.** Que signifie l'acronyme **CQRS** ?

- A) Continuous Quality Release System
- B) Command Query Responsibility Segregation ✅
- C) Centralized Queue Resilience Service
- D) Cloud Quota Resource Sharing

**Q5.** Dans l'architecture **Event Sourcing**, comment l'état actuel d'une entité (ex: un compte bancaire) est-il déterminé ?

- A) En lisant directement une seule valeur enregistrée en base SQL.
- B) En rejouant la séquence ordonnée de tous les événements immuables qui sont arrivés à cette entité depuis sa création. ✅
- C) En demandant à l'utilisateur de saisir son solde.
- D) En effectuant une moyenne des requêtes HTTP.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
