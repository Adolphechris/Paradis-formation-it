# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 546 (6h) : Architecture de Haute Disponibilité & PCA/PRA : RTO, RPO, Clustering & Stratégies de Reprise

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser les concepts fondamentaux de la **continuité d'activité** : RTO, RPO, MTD, MTPD et leur traduction en architecture technique
> - Distinguer et dimensionner les stratégies de reprise cloud : **Backup & Restore, Pilot Light, Warm Standby, Active-Active (Multi-Region)**
> - Implémenter la **haute disponibilité au niveau applicatif** : clustering Kubernetes (multi-zone), load balancing, circuit breakers
> - Construire un **plan de reprise d'activité (PRA)** documenté et le valider par des simulations (Chaos Engineering avec Chaos Monkey / Gremlin)
>
> **Compétences visées :** `INFRA-03` (A), `POL-03` (A) — Business Continuity, High Availability, Disaster Recovery

---

## Module 1 — Continuité d'Activité : RTO, RPO & Stratégies DR (2h)

### 📖 Intuition & Narration

Un incendie dans un datacenter, une cyberattaque ransomware, une panne matérielle majeure — toutes ces catastrophes ont un point commun : **elles sont inévitables**. La question n'est pas "si" cela arrivera, mais "quand". Un professionnel IT mature ne cherche pas uniquement à prévenir les incidents, il s'assure que **son organisation peut continuer à fonctionner** même quand ils surviennent.

C'est l'objet du **Plan de Continuité d'Activité (PCA)** et du **Plan de Reprise d'Activité (PRA)**.

### 🔍 Anatomie des Métriques de Continuité

```
MÉTRIQUES CLÉS DE LA CONTINUITÉ D'ACTIVITÉ

  RPO (Recovery Point Objective)
  ─────────────────────────────
  Perte de données MAXIMUM acceptable.
  "Jusqu'à quand dans le passé pouvons-nous récupérer les données ?"
  Exemple : RPO = 1h → sauvegarde toutes les heures.
  Impacte : Fréquence des sauvegardes, coût du stockage.

  RTO (Recovery Time Objective)
  ─────────────────────────────
  Durée MAXIMUM acceptable d'interruption de service.
  "Dans combien de temps devons-nous être de retour en production ?"
  Exemple : RTO = 4h → le système doit être restauré en moins de 4h.
  Impacte : Stratégie DR, infrastructure de reprise.

  MTD (Maximum Tolerable Downtime)
  ─────────────────────────────────
  Durée ABSOLUE maximale avant impact irréversible (faillite, sanction légale).
  MTD > RTO (sinon impossible à tenir).

  MTPD (Maximum Tolerable Period of Disruption)
  Équivalent ISO 22301 du MTD.

  RELATION :  │◄──── RPO ────►│T0│◄──────── RTO ─────────►│
              │   (perte data) │  │    (durée reprise)      │
              ──────────────────────────────────────────────▶ Temps
```

### 🔍 4 Stratégies de Disaster Recovery (Cloud)

```
STRATÉGIES DR CLOUD — TRADE-OFF COÛT vs RTO/RPO

  COÛT ↑                                              COÛT ↓
  RTO ↓                                               RTO ↑
  RPO ↓                                               RPO ↑
    │                                                    │
    ▼                                                    ▼
  ACTIVE-ACTIVE ←─── WARM STANDBY ←── PILOT LIGHT ←── BACKUP & RESTORE

  BACKUP & RESTORE  : RPO=24h, RTO=72h — Sauvegarde simple, coût minimal
  PILOT LIGHT       : RPO=1h, RTO=4-8h  — Core infra prête, scale-out au besoin
  WARM STANDBY      : RPO=15min, RTO=1h  — Version réduite en production parallèle
  ACTIVE-ACTIVE     : RPO≈0, RTO≈0      — Multi-region, trafic distribué en continu
```

---

## Module 2 — Chaos Engineering & Validation du PRA (2h)

### 🔍 Chaos Engineering — Principes

Le **Chaos Engineering** est la pratique qui consiste à **provoquer délibérément des pannes en production** (ou en staging) pour tester la résilience réelle d'un système. Netflix a popularisé l'approche avec **Chaos Monkey** qui tue aléatoirement des instances en production.

> "L'espoir n'est pas une stratégie. Testez votre reprise AVANT la vraie catastrophe."

### 🛠️ Atelier Pratique — Chaos Engineering avec Chaos Mesh (Kubernetes)

```yaml
# ============================================================
# PARADIS — Chaos Mesh : Expériences de Chaos sur Kubernetes
# ============================================================

# Expérience 1 : Tuer aléatoirement 50% des Pods de l'API Backend
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: paradis-pod-kill-experiment
  namespace: chaos-testing
spec:
  action: pod-kill
  mode: fixed-percent
  value: "50"
  duration: "5m"
  selector:
    namespaces:
      - app-production
    labelSelectors:
      app: api-backend
---
# Expérience 2 : Simuler une latence réseau de 500ms sur le service DB
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: paradis-db-latency-experiment
  namespace: chaos-testing
spec:
  action: delay
  mode: all
  selector:
    namespaces:
      - app-production
    labelSelectors:
      app: postgres
  delay:
    latency: "500ms"
    jitter: "50ms"
    correlation: "80"
  duration: "10m"
  direction: to
```

### 🛠️ Script Python : PRA Runbook Automatisé

```python
#!/usr/bin/env python3
"""
PARADIS — Automated PRA Runbook
Exécute les étapes de reprise d'activité de manière orchestrée et documentée.
"""
import time
from datetime import datetime
from dataclasses import dataclass
from typing import List, Callable

@dataclass
class RunbookStep:
    step_id: str
    description: str
    expected_duration_minutes: int
    execute: Callable[[], bool]  # Retourne True si succès

class PRARunbook:
    def __init__(self, incident_id: str, scenario: str):
        self.incident_id = incident_id
        self.scenario = scenario
        self.steps: List[RunbookStep] = []
        self.start_time = datetime.now()
        self.results = []

    def add_step(self, step: RunbookStep):
        self.steps.append(step)

    def execute(self):
        print(f"\n{'='*60}")
        print(f"  PRA RUNBOOK — {self.scenario}")
        print(f"  Incident : {self.incident_id}")
        print(f"  Démarrage : {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}\n")

        total_steps = len(self.steps)
        failed_steps = []

        for i, step in enumerate(self.steps, 1):
            print(f"  [{i:02d}/{total_steps}] {step.step_id} : {step.description}")
            print(f"         Durée estimée : {step.expected_duration_minutes} min")
            step_start = datetime.now()

            success = step.execute()
            elapsed = (datetime.now() - step_start).seconds

            if success:
                print(f"         [✅ OK] Exécuté en {elapsed}s")
            else:
                print(f"         [❌ ÉCHEC] ALERTE : Intervention manuelle requise !")
                failed_steps.append(step.step_id)

            self.results.append({"step": step.step_id, "success": success, "elapsed_s": elapsed})
            print()

        total_elapsed = (datetime.now() - self.start_time).seconds // 60
        print(f"{'='*60}")
        print(f"  PRA TERMINÉ — Durée totale : {total_elapsed} minutes")
        print(f"  Étapes réussies : {total_steps - len(failed_steps)}/{total_steps}")
        if failed_steps:
            print(f"  [⚠️ ATTENTION] Étapes en échec : {', '.join(failed_steps)}")
        else:
            print(f"  [✅ SUCCÈS] Reprise d'activité complète.")


def simulate_step_success():
    time.sleep(0.2)  # Simulation d'une action
    return True

def simulate_step_failure():
    time.sleep(0.1)
    return False  # Échec simulé

if __name__ == "__main__":
    runbook = PRARunbook("INC-2024-0848", "RANSOMWARE — Reprise sur Site DR Azure West Europe")

    runbook.add_step(RunbookStep("PRA-01", "Activation du site DR (failover DNS global vers AZURE-WE)", 5, simulate_step_success))
    runbook.add_step(RunbookStep("PRA-02", "Démarrage des VMs SQL Server en mode réplica lecture-écriture", 10, simulate_step_success))
    runbook.add_step(RunbookStep("PRA-03", "Validation de l'intégrité des données (checksum base J-1)", 15, simulate_step_success))
    runbook.add_step(RunbookStep("PRA-04", "Déploiement des applications via ArgoCD (cluster DR K8s)", 20, simulate_step_success))
    runbook.add_step(RunbookStep("PRA-05", "Tests de fumée API (smoke tests via k6)", 10, simulate_step_failure))  # Étape en échec simulé
    runbook.add_step(RunbookStep("PRA-06", "Notification des utilisateurs et mise à jour de la page de statut", 5, simulate_step_success))

    runbook.execute()
```

---

## Module 3 — HA Architecture & Circuit Breaker Pattern (1h30)

### 🔍 Pattern Circuit Breaker — Résilience Applicative

Le **Circuit Breaker** (Disjoncteur) est un pattern de résilience architecturale. Il empêche les appels répétés à un service en panne (qui ne feraient qu'aggraver la situation), en "ouvrant le circuit" après un certain nombre d'échecs.

```
ÉTATS DU CIRCUIT BREAKER

  CLOSED (Fermé)    → Trafic normal. Comptage des erreurs.
       │  (seuil d'erreurs dépassé)
       ▼
  OPEN (Ouvert)     → Trafic bloqué. Réponse de fallback immédiate.
       │  (après timeout de récupération)
       ▼
  HALF-OPEN (Semi)  → Test avec quelques requêtes. Si succès : retour CLOSED.
                                                    Si échec  : retour OPEN.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **RPO** | Recovery Point Objective — Perte de données maximale tolérée (mesurée en temps) |
| **RTO** | Recovery Time Objective — Durée maximale d'interruption de service tolérée |
| **MTD** | Maximum Tolerable Downtime — Durée absolue maximale d'indisponibilité avant impact irréversible |
| **PCA/PRA** | Plan de Continuité / Plan de Reprise d'Activité — Documents ISO 22301 de gestion de crise |
| **Chaos Engineering** | Pratique consistant à provoquer délibérément des pannes pour tester la résilience d'un système |

---

## Exercices Pratiques

### Exercice 1 — Dimensionnement d'une Architecture DR

Une plateforme de paiement financière a les exigences suivantes :
- RPO maximum = 5 minutes
- RTO maximum = 30 minutes
- Budget DR mensuel limité à 15% du budget infrastructure total

Quelle stratégie DR cloud recommandez-vous et pourquoi ?

**Corrigé guidé :**
Un RPO de 5 minutes impose une réplication des données **en continu** (pas de sauvegarde toutes les heures). Un RTO de 30 minutes signifie que l'infrastructure de reprise doit être **prête et partiellement démarrée** mais pas nécessairement à pleine capacité.

**Stratégie recommandée : WARM STANDBY** — Une infrastructure réduite (20-25% de la capacité) est toujours active en région secondaire avec les données répliquées en temps quasi-réel (streaming replication PostgreSQL). Lors d'un incident, la montée en charge (scale-out) est automatisée via Kubernetes HPA. RTO estimé : 15-20 minutes (bien en dessous de la limite de 30 minutes).

La stratégie Active-Active offrirait RTO≈0/RPO≈0 mais coûterait 100% de budget supplémentaire (dépasse la contrainte de 15%). Backup & Restore ne peut pas satisfaire un RTO de 30 minutes (restauration trop longue).

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la différence entre le **RPO** et le **RTO** ?

- A) Le RPO mesure la durée de l'interruption et le RTO la quantité de données perdues.
- B) Le RPO (Recovery Point Objective) définit la perte de données maximale tolérée (en temps), tandis que le RTO (Recovery Time Objective) définit la durée maximale d'interruption de service tolérée avant reprise. ✅
- C) Le RPO et le RTO sont deux termes désignant la même métrique.
- D) Le RPO s'applique aux serveurs et le RTO aux réseaux.

**Q2.** Dans les stratégies DR cloud, quelle approche offre le **RTO et RPO les plus proches de zéro** ?

- A) Backup & Restore
- B) Pilot Light
- C) Warm Standby
- D) Active-Active Multi-Region ✅

**Q3.** Qu'est-ce que le **Chaos Engineering** ?

- A) Une méthodologie de test qui consiste à documenter les pannes sans les reproduire.
- B) La pratique qui consiste à provoquer délibérément des pannes contrôlées en production pour identifier les faiblesses de résilience d'un système avant qu'une vraie catastrophe ne les révèle. ✅
- C) Un outil de gestion des incidents de sécurité.
- D) Un framework de développement agile.

**Q4.** Le pattern **Circuit Breaker** dans les architectures microservices sert à :

- A) Protéger les câbles électriques du datacenter.
- B) Empêcher un service appelant de continuer à envoyer des requêtes à un service en panne (qui aggraveraient la situation), en renvoyant immédiatement une réponse de fallback jusqu'à la récupération du service. ✅
- C) Chiffrer les communications entre les microservices.
- D) Gérer l'authentification entre les services.

**Q5.** Dans un plan PRA, la différence entre **Pilot Light** et **Warm Standby** est :

- A) Pilot Light utilise uniquement des sauvegardes sur bande magnétique.
- B) Avec Pilot Light, seuls les éléments centraux (base de données, authentification) sont actifs en permanence en région DR. Avec Warm Standby, une version complète mais réduite (20-50% de capacité) de l'environnement de production est toujours active. ✅
- C) Warm Standby est réservé aux PME, Pilot Light aux grandes entreprises.
- D) Il n'y a pas de différence significative entre les deux.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
