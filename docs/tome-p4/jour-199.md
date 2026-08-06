# TOME P4 — Cloud, DevOps & SecOps — Jour 199 (6h) : Chaos Engineering & Résilience Système (Principles of Chaos, Chaos Mesh / Gremlin, GameDays & Injection de Panne en Production)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **Chaos Engineering** pour renforcer la résilience des systèmes bancaires critiques : principes fondamentaux du Chaos selon Netflix (Principles of Chaos Engineering), injection de pannes contrôlées avec **Chaos Mesh** / **Gremlin** dans Kubernetes, organisation de **GameDays**, et vérification de la résilience du système face aux pannes réseau, de pods, et de datacenters.
>
> **Compétences visées :** `OPS-05` (A) — Chaos Engineering & Injection de Pannes K8s | `OPS-06` (A) — Résilience Système & GameDays

---

## 1) Module — Principes du Chaos Engineering & Hypothesis-Driven Testing (2h)

### 📖 Narration/Intuition

Comment la BCC peut-elle être certaine que son basculement automatique de base de données (PostgreSQL Failover avec Patroni) fonctionnera sans perte de données le jour où la Zone de Disponibilité principale d'AWS subira un incendie à 2h du matin ?

La seule façon d'en être sûr est d'**injecter délibérément la panne en journée** dans un cadre contrôlé. C'est l'essence du **Chaos Engineering** : l'expérimentation disciplinée sur un système afin de renforcer la confiance dans sa capacité à résister à des conditions turbulentes en production.

### 🔍 Anatomie Technique

**Les 4 Étapes de l'Expérience de Chaos :**

```
┌──────────────────────────────────────────────────────────────┐
│  1. DÉFINIR L'ÉTAT STABLE (Steady State)                     │
│  - SLI/SLO : Latence P99 < 500ms, Taux d'erreur 5xx < 0.1%    │
│  - Le système fonctionne normalement                         │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│  2. FORMULER UNE HYPOTHÈSE                                   │
│  - "Si nous tuons 50% des Pods Account-Service, le trafic     │
│     basculera sur les Pods restants et le SLO sera maintenu" │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│  3. INJECTER UNE PERTURBATION (Chaos Experiment)             │
│  - Simuler : Latence réseau + 2000ms, Crash de Pod,         │
│    Perte de connexion BDD, Interruption de nœud K8s          │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│  4. COMPARER & RÉPARER (Disprove Hypothesis)                 │
│  - Si l'hypothèse est infirmée (ex: Taux d'erreur à 15%)     │
│    ──► Faille de résilience découverte et corrigée !         │
└──────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Chaos Mesh & Injection de Pannes Kubernetes (2h)

### 📖 Narration/Intuition

**Chaos Mesh** est une plateforme open-source d'ingénierie du chaos cloud-native pour Kubernetes. Elle permet d'injecter des pannes variées de manière déclarative via des ressources personnalisées (CRD) Kubernetes : pannes réseau, pannes de Pods, stress CPU/RAM, et pannes d'I/O disque.

### 🔍 Anatomie Technique

**Manifeste Chaos Mesh — Simulation de Latence Réseau & Crash de Pod (`chaos_experiment.yaml`) :**

```yaml
# EXPÉRIENCE 1 : Injection de Latence Réseau (NetworkChaos)
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: bcc-network-delay-experiment
  namespace: bcc-production
spec:
  action: delay
  mode: fixed-percent
  value: '50' # 50% des paquets réseau affectés
  selector:
    namespaces:
      - bcc-production
    labelSelectors:
      app: bcc-api
  delay:
    latency: '1500ms' # Ajout de 1.5 seconde de latence
    jitter: '200ms'
  direction: to
  target:
    selector:
      namespaces:
        - bcc-production
      labelSelectors:
        app: postgres
  duration: '5m' # Expérience limitée à 5 minutes
  scheduler:
    cron: '0 14 * * 2' # S'exécute automatiquement chaque mardi à 14h

---
# EXPÉRIENCE 2 : Simulation de Crash Aléatoire de Pod (PodChaos)
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: bcc-pod-kill-experiment
  namespace: bcc-production
spec:
  action: pod-kill
  mode: one # Tuer 1 Pod aléatoire
  selector:
    namespaces:
      - bcc-production
    labelSelectors:
      app: account-service
  duration: '2m'
```

---

## 3) Module — Organisation d'un GameDay SRE (2h)

### 📖 Narration/Intuition

Un **GameDay** est une journée d'exercice pratique durant laquelle l'équipe SRE et les développeurs se réunissent pour tester la résilience du système et la réaction des équipes face à des pannes réelles simulées.

### 🛠️ Atelier Pratique

**Déroulé Type d'un GameDay BCC :**

```markdown
# GAMEDAY BCC — FÉVRIER 2026
## Thème : Résilience aux Pannes de Base de Données et Réseau

### RÔLES
- **Chaos Master** : Déclenche les pannes secrètes (N'informe pas l'équipe)
- **Incident Commander** : Dirige la réponse à l'incident
- **SRE Observers** : Surveillent les dashboards Grafana et mesurent le MTTD/MTTR

### SCÉNARIOS TESTÉS

#### SCÉNARIO 1 : Crash du Nœud PostgreSQL Primaire
- **Action Chaos Master** : Kill process PostgreSQL sur le nœud primaire
- **Attendu** : Patroni bascule le rôle Primaire sur le Standby en < 30s
- **Résultat Observé** : Failover réussi en 18s. 0 transaction perdue.

#### SCÉNARIO 2 : Latence de 3 secondes sur l'API externe SWIFT
- **Action Chaos Master** : NetworkChaos delay 3000ms vers api.swift.com
- **Attendu** : Le Circuit Breaker Opossum s'ouvre, les virements basculent sur SQS
- **Résultat Observé** : Circuit Breaker ouvert au bout de 12s. 100% des messages sauvegardés en SQS.

### BILAN & ACTIONS CORRECTIVES
- ✅ MTTD moyen : 45 secondes
- ✅ MTTR moyen : 2 minutes 15 secondes
- ⚠️ Action corrective : Ajouter une alerte Slack spécifique sur le statut Patroni
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **GameDay** | Journée d'entraînement pratique de simulation de pannes système |
| **CRD** | Custom Resource Definition — Extension du langage d'objets Kubernetes |
| **Steady State** | État stable et normal du système mesuré par ses SLIs |
| **Chaos Mesh** | Plateforme CNCF d'injection de pannes pour Kubernetes |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence fondamentale entre les **Tests Unitaires / d'Intégration** et le **Chaos Engineering** ?

**Corrigé :** Les **Tests Unitaires et d'Intégration** vérifient la validité fonctionnelle du code dans un environnement idéal et déterministe (les entrées A produisent les sorties B). Le **Chaos Engineering** teste la **résilience comportementale du système distribué global en production** face à l'imprédictibilité du monde réel (pannes matérielles, latences réseau intermittentes, pertes de paquets, épuisement mémoire). Les tests d'intégration valident la logique du code ; le Chaos Engineering valide que l'architecture et les mécanismes d'auto-guérison (Circuit Breakers, Kubernetes Auto-healing, Failover BDD) fonctionnent correctement en situation de crise.

**Exercice 2 :** Pourquoi la mesure initiale de l'**État Stable (Steady State)** est-elle la toute première étape indispensable avant d'injecter du chaos ?

**Corrigé :** Sans mesure précise de l'**État Stable** (défini par des métriques clés comme le taux d'erreur HTTP 5xx < 0.1% et la latence P99 < 500ms), il est impossible de savoir si une dégradation observée est causée par l'expérience de chaos ou par un problème préexistant sur le cluster. L'État Stable sert de **groupe de contrôle scientifique** : on injecte la perturbation, on observe si les métriques de l'État Stable restent dans des limites acceptables (hypothèse confirmée), et si le système revient automatiquement à son État Stable une fois la perturbation arrêtée.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la définition centrale du **Chaos Engineering** selon Netflix ?
- A) L'expérimentation disciplinée sur un système afin de renforcer la confiance dans sa capacité à résister à des conditions turbulentes en production
- B) Détruire la base de données sans prévenir personne
- C) Écrire du code sans tests unitaires
- D) Supprimer les sauvegardes de production

**Réponse : A**

**Q2 :** Quel outil open-source CNCF permet d'injecter des pannes déclaratives (latence réseau, pod kill, stress CPU) dans un cluster Kubernetes via des objets YAML ?
- A) Chaos Mesh
- B) Prometheus
- C) Terraform
- D) Nginx

**Réponse : A**

**Q3 :** Quelle est la première étape obligatoire de toute expérience de Chaos Engineering ?
- A) Définir et mesurer l'État Stable (Steady State) du système via des SLIs
- B) Couper l'électricité du datacenter
- C) Supprimer le cluster Kubernetes
- D) Modifier le code source

**Réponse : A**

**Q4 :** Qu'est-ce qu'un **GameDay** dans la pratique SRE ?
- A) Un exercice pratique planifié où les équipes injectent des pannes pour tester la résilience des systèmes et la réactivité des ingénieurs On-Call
- B) Un tournoi de jeux vidéo entre développeurs
- C) Le jour du lancement d'un nouveau produit
- D) Une réunion de révision budgétaire

**Réponse : A**

**Q5 :** Dans Chaos Mesh, quel objet CRD est utilisé pour simuler une latence ou une perte de paquets entre deux microservices Kubernetes ?
- A) NetworkChaos
- B) PodChaos
- C) StressChaos
- D) IOChaos

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
