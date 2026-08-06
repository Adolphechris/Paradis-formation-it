# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 108 (6h) : Chaos Engineering & Tests de Résilience (LitmusChaos, Chaos Mesh & Resilience Testing)

> [!NOTE]
> **Objectif du jour :** Injecter des pannes et perturbations contrôlées dans des environnements de production et de staging pour vérifier la résilience réelle des systèmes (Chaos Engineering) : latence réseau, coupures de Pods, pannes de disques et partitionnement réseau avec LitmusChaos et Chaos Mesh.
>
> **Compétences visées :** `BIT-08` (A) — Chaos Engineering & Resilience | `SEC-04` (A) — Validation de la Haute Disponibilité Systèmes

---

## 1) Module — Principes du Chaos Engineering & Méthodologie (2h)

### 📖 Narration/Intuition

En production informatique, la question n'est pas *"Si un composant va tomber"*, mais **"Quand et comment il va tomber"**. Si une panne sur un commutateur ou un Pod survient à 3 heures du matin un dimanche, le système de basculement automatique (HA) fonctionnera-t-il vraiment sans coupure de service pour les clients de la BCC ?

Le **Chaos Engineering** (popularisé par le Chaos Monkey de Netflix) est la discipline qui consiste à **expérimenter volontairement des pannes contrôlées** sur un système pour identifier ses faiblesses *avant* qu'une vraie panne ne survienne en production.

### 🔍 Anatomie Technique

**Les 4 Étapes d'une Expérience de Chaos Engineering :**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DÉFINIR L'ÉTAT STABLE (STEADY STATE)                      │
│    - Mesurer les métriques normales de référence (ex: RPS > 200,│
│      latence p95 < 50ms, taux d'erreur < 0.01%).            │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ÉMETTRE UNE HYPOTHÈSE                                    │
│    - "Si un Pod API sur 3 est détruit, le trafic basculera  │
│      sur les 2 Pods restants sans hausse de latence."       │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. INJECTER LE CHAOS (EXPÉRIENCE PERTURBATION)              │
│    - Détruire un Pod, ajouter 500ms de latence, couper le disq│
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. VÉRIFIER L'ÉTAT STABLE & APPRENDRE                       │
│    - Si le steady-state est maintenu -> Hypothèse VALIDÉE ✅ │
│    - Si le système s'effondre -> Faiblesse trouvée & corrigée│
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Injection de Pannes Kubernetes avec Chaos Mesh (2h)

### 📖 Narration/Intuition

**Chaos Mesh** (projet CNCF) est une plateforme d'ingénierie du chaos native pour Kubernetes. Elle s'appuie sur des Custom Resource Definitions (CRDs) pour injecter divers types de perturbations (Chaos réseau, Pod Chaos, Stress CPU/Mémoire, Chaos I/O disque) sans modifier les applications.

### 🔍 Anatomie Technique

**Manifeste Chaos Mesh — Injection de Latence Réseau (`network-delay-chaos.yaml`) :**

```yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: api-network-delay-test
  namespace: bcc-production
spec:
  action: delay
  mode: one                 # Infecter 1 Pod au hasard parmi les cibles
  selector:
    namespaces:
      - bcc-production
    labelSelectors:
      app: bcc-virement-api
  delay:
    latency: '400ms'        # Ajouter 400ms de latence artificielle
    jitter: '50ms'
  direction: to             # Sur le trafic sortant vers la BDD
  target:
    selector:
      namespaces:
        - bcc-production
      labelSelectors:
        app: postgres
    mode: all
  duration: '5m'            # Durée de l'expérience : 5 minutes
  scheduler:
    cron: '5m'
```

**Manifeste Chaos Mesh — Suppression Aléatoire de Pod (`pod-kill-chaos.yaml`) :**

```yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: random-pod-kill
  namespace: bcc-production
spec:
  action: pod-kill
  mode: fixed-percent
  value: '30%'              # Détruire 30% des Pods simultanément
  selector:
    namespaces:
      - bcc-production
    labelSelectors:
      app: bcc-virement-api
  scheduler:
    cron: '@every 10m'
```

---

## 3) Module — LitmusChaos & Automatisation des Scénarios de Résilience (2h)

### 📖 Narration/Intuition

**LitmusChaos** permet de structurer les expériences de chaos dans des pipelines d'intégration continue (CI/CD) pour vérifier la régression de résilience à chaque nouveau déploiement.

### 🔍 Anatomie Technique

**Workflow d'automatisation d'une expérience LitmusChaos :**

```bash
# 1. Installer le CLI Litmus (litmusctl)
curl -fsSL https://litmusctl-production-bucket.s3.amazonaws.com/litmusctl-linux-amd64-v0.12.0.tar.gz | tar -xz

# 2. Lancer un scénario de Chaos automatisé
litmusctl launch experiment --file pod-delete-experiment.yaml

# 3. Vérifier le score de résilience (Resilience Score) de l'application
litmusctl get chaos-results -n bcc-production
# Résultat attendu : Score = 100% (Le basculement HA a fonctionné sans perte de requêtes)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Chaos Engineering** | Discipline d'expérimentation de pannes contrôlées pour valider la résilience |
| **Steady State** | État de référence stable indiquant que le système fonctionne normalement |
| **Circuit Breaker** | Pattern de conception arrêtant les appels vers un service défaillant pour éviter l'effet domino |
| **Jitter** | Variation aléatoire de la latence réseau |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est l'utilité de définir le **Blast Radius** (rayon d'impact) au début d'une expérience de Chaos Engineering ?

**Corrigé :** Le **Blast Radius** détermine la portée maximale des perturbations injectées (ex: impacter seulement 1 Pod sur 10 dans un environnement de staging au lieu de tout le cluster de production). Définir et restreindre le Blast Radius garantit que l'expérience de chaos permet d'apprendre sur les faiblesses du système sans risquer d'entraîner une interruption globale cataclysmique non maîtrisée pour les utilisateurs finaux.

**Exercice 2 :** Comment le pattern applicatif **Circuit Breaker** (ex: via Resilience4j ou Envoy Proxy) réagit-il lorsqu'une expérience Chaos Mesh injecte de la latence réseau forte sur une base de données ?

**Corrigé :** Lorsque la latence ou le taux d'erreur de la BDD dépasse le seuil configuré, le **Circuit Breaker** "ouvre le circuit" (Open State) : au lieu de laisser les requêtes s'accumuler et bloquer tous les threads applicatifs, il rejette immédiatement les demandes ou renvoie une réponse dégradée en cache (Fallback). Cela protège l'application globale contre l'effondrement par saturation de ressources.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le premier principe fondamental de la méthodologie de Chaos Engineering avant d'injecter la moindre panne ?
- A) Formater les serveurs
- B) Définir et mesurer l'état stable de référence (Steady State) des métriques du système
- C) Éteindre les pare-feux
- D) Déconnecter Internet

**Réponse : B**

**Q2 :** Quel outil cloud-native certifié par la CNCF permet d'injecter des pannes Kubernetes (Pod Kill, Network Chaos, CPU Stress) via des manifestes déclaratifs YAML ?
- A) Chaos Mesh (ou LitmusChaos)
- B) Excel
- C) Gzip
- D) Notepad

**Réponse : A**

**Q3 :** En Chaos Engineering, que désigne la notion de "Blast Radius" ?
- A) Le rayon d'explosion d'un câble réseau
- B) Le périmètre et l'ampleur maximale contrôlée des perturbations injectées lors d'une expérience
- C) Le nombre de lignes de code Python
- D) La vitesse des ventilateurs CPU

**Réponse : B**

**Q4 :** Si lors de l'injection d'une latence réseau de 500 ms sur la base de données, le taux d'erreur HTTP de l'API passe de 0.01% à 80%, que peut-on en conclure ?
- A) Que l'expérience est un succès total
- B) Que l'application présente une faiblesse de résilience (manque de timeout / circuit breaker) qu'il faut corriger
- C) Que l'ordinateur est cassé
- D) Que le pare-feu fonctionne bien

**Réponse : B**

**Q5 :** Quel pattern d'architecture logicielle permet d'isoler un microservice en panne et de renvoyer une réponse dégradée (Fallback) pour éviter de bloquer toute la chaîne d'appel ?
- A) Circuit Breaker
- B) Memory Leak
- C) Hard Reset
- D) Unseal Key

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
