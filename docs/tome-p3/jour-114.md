# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 114 (6h) : Gestion des Incidents & Chaos Engineering Avancé (Kube-Monkey, Steady-State Automation & Post-Mortem Blameless)

> [!NOTE]
> **Objectif du jour :** Structurer la réponse aux incidents complexes en production et automatiser la validation continue de la résilience : injection de pannes aléatoires en continu avec Kube-Monkey, rédaction de rapports d'incidents non culpabilisants (Blameless Post-Mortem) et calcul des SLO/SLA selon les principes SRE (Site Reliability Engineering).
>
> **Compétences visées :** `POL-03` (A) — Processus SRE & Blameless Post-Mortem | `BIT-08` (A) — Chaos Automation Kube-Monkey

---

## 1) Module — Principes SRE : SLO, SLA & Error Budgets (2h)

### 📖 Narration/Intuition

Dans la culture **Site Reliability Engineering (SRE)** (popularisée par Google), la fiabilité à 100% n'est ni réalisable ni souhaitable (elle bloquerait toute innovation et toute vitesse de déploiement).

Les équipes SRE définissent un **SLA (Service Level Agreement)** (engagement contractuel envers les clients), un **SLO (Service Level Objective)** (objectif interne plus strict) et un **Error Budget (Budget d'Erreur)**. Le budget d'erreur représente le pourcentage toléré d'indisponibilité. Tant qu'il reste du budget d'erreur, les équipes de développement peuvent continuer à déployer rapidement des fonctionnalités ; si le budget est épuisé, les déploiements de fonctionnalités sont gelés au profit exclusif du renforcement de la fiabilité.

### 🔍 Anatomie Technique

**Relation entre SLA, SLO et Error Budget :**

```
┌─────────────────────────────────────────────────────────────┐
│ DISPONIBILITÉ NÉCESSAIRE (SLO) : 99.9% d'Uptime             │
│  -> Indisponibilité maximale tolérée par mois : 43 minutes   │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ ERROR BUDGET (BUDGET D'ERREUR) = 100% - 99.9% = 0.1%        │
│                                                             │
│  - Situation A : Budget d'erreur à 70% -> Déploiements OK  │
│  - Situation B : Budget d'erreur à 0%  -> GEL DES DEPLOY   │
│    (Toutes les équipes travaillent sur les bugs & la HA)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Chaos Automation Continu avec Kube-Monkey (2h)

### 📖 Narration/Intuition

Tester la résilience une fois par an lors d'un exercice planifié ne garantit pas que les nouveaux déploiements du vendredi soir n'ont pas brisé la haute disponibilité.

**Kube-Monkey** est l'implémentation Kubernetes du célèbre Chaos Monkey de Netflix. Il s'exécute en tâche de fond sur le cluster et détruit aléatoirement des Pods Kubernetes pendant les heures de bureau (ex: entre 9h et 17h du lundi au jeudi). Cela force les développeurs à concevoir leurs applications pour qu'elles soient résilientes dès le premier jour.

### 🔍 Anatomie Technique

**Configuration d'un Deployment Kubernetes testé par Kube-Monkey (`deployment-resilient.yaml`) :**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bcc-virement-api
  namespace: bcc-production
  # Annotations d'opt-in indispensables pour autoriser Kube-Monkey à cibler ce composant
  labels:
    kube-monkey/enabled: "enabled"
    kube-monkey/identifier: "bcc-virement-api"
  annotations:
    kube-monkey/mtbf: "3"           # Mean Time Between Failures : 3 jours en moyenne
    kube-monkey/kill-mode: "fixed"  # Modes: fixed, random, percent
    kube-monkey/kill-value: "1"     # Détruire 1 Pod lors de l'attaque
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bcc-virement-api
  template:
    metadata:
      labels:
        app: bcc-virement-api
        kube-monkey/enabled: "enabled"
        kube-monkey/identifier: "bcc-virement-api"
    spec:
      containers:
        - name: api
          image: ghcr.io/bcc/virement-api:v2.1.0
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
```

---

## 3) Module — La Culture du Post-Mortem Non Culpabilisant (Blameless) (2h)

### 📖 Narration/Intuition

Lorsqu'un incident grave survient en production (ex: coupure du réseau de virement pendant 20 minutes), la réaction humaine naturelle est de chercher un coupable (*"C'est la faute de l'ingénieur X qui a exécuté la mauvaise commande"*).

Cette attitude est destructrice : elle incite les ingénieurs à masquer leurs erreurs et empêche l'organisation d'apprendre. La culture SRE impose le **Blameless Post-Mortem (Analyse d'incident non culpabilisante)** : les erreurs humaines sont considérées comme le **symptôme** d'un manque de gardes-fous dans l'architecture ou les outils, et non comme la cause fondamentale.

### 🔍 Anatomie Technique

**Structure d'un Rapport Blameless Post-Mortem d'Incident :**

```markdown
# POST-MORTEM INCIDENT #INC-2026-0806 — Coupure API Virement

**Date :** 06 Août 2026 | **Durée :** 18 minutes | **Impact :** 142 transactions échouées (500 Server Error)
**Auteurs :** Équipe SRE / Core Banking

## 1) Résumé de l'Incident
À 14h12 UTC, le service de virement API a cessé de répondre suite à une saturation mémoire de la base PostgreSQL secondaire lors d'un basculement de secours.

## 2) Chronologie (Timeline UTC)
- 14:10 — Lancement de la mise à jour automatique d'un sous-réseau.
- 14:12 — Le pod PostgreSQL primaire perd sa connexion réseau.
- 14:13 — Basculement automatique Patroni initié vers le nœud secondaire.
- 14:14 — Le nœud secondaire rejette les connexions (Pool de connexion saturé).
- 14:28 — Augmentation manuelle de la limite de connexions et rétablissement du service.
- 14:30 — Rétablissement à 100% du steady state.

## 3) Causes Fondamentales (Root Causes - Les 5 Pourquoi)
1. Pourquoi l'API a-t-elle échoué ? La BDD secondaire a rejeté les connexions.
2. Pourquoi la BDD secondaire a-t-elle rejeté les connexions ? La limite `max_connections` était réglée à 100 au lieu de 500 sur le replica.
3. Pourquoi la configuration était-elle différente ? Le template Ansible de réplique n'utilisait pas les mêmes variables que le master.
4. Pourquoi le décalage n'a-t-il pas été vu ? Il n'y avait pas de règle de vérification d'IaC (Checkov) sur les variables PostgreSQL.

## 4) Actions Correctives (Action Items - Prévenir la récidive)
- [ ] Alignement des templates Ansible PostgreSQL via Kustomize (Propriétaire: DevSecOps | Priorité: Haute).
- [ ] Ajout d'une règle Conftest bloquant les décalages de variables BDD (Propriétaire: Security | Priorité: Moyenne).
- [ ] Automatisation d'une expérience Kube-Monkey hebdomadaire de failover BDD.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SRE** | Site Reliability Engineering — Discipline d'ingénierie appliquée à l'exploitation et la fiabilité |
| **SLO** | Service Level Objective — Objectif interne de niveau de service (ex: 99.9%) |
| **SLA** | Service Level Agreement — Engagement contractuel de niveau de service avec pénalités |
| **Error Budget** | Marge d'erreur tolérée calculée (100% - SLO) arbitrant vitesse et fiabilité |
| **MTBF** | Mean Time Between Failures — Temps moyen s'écoulant entre deux pannes |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Si un service bancaire possède un SLO de disponibilité de **99.9%** calculé sur un mois de 30 jours (43 200 minutes), quel est son **Error Budget** en minutes pour le mois ?

**Corrigé :**
- Disponibilité exigée : 99.9% = 0.999
- Error Budget en pourcentage : $100\% - 99.9\% = 0.1\% = 0.001$
- Error Budget en minutes : $43\,200 \times 0.001 = \mathbf{43.2\text{ minutes}}$.
Si le service cumule plus de 43.2 minutes d'indisponibilité totale au cours du mois, son Error Budget est épuisé (0%), entraînant le gel immédiat des nouveaux déploiements de fonctionnalités.

**Exercice 2 :** Pourquoi la pratique du **Blameless Post-Mortem** améliore-t-elle la sécurité globale d'une organisation bancaire ?

**Corrigé :** Si l'organisation blâme ou punit l'individu qui a commis l'erreur lors d'un incident, les employés chercheront à masquer les pannes, déformer la réalité ou rejeter la faute sur les autres. Dans une culture **Blameless**, on admet que l'être humain commet inévitablement des erreurs. L'analyse se concentre sur les **faiblesses du système** (ex: absence de confirmation interactive, manque de tests automatisés, scripts non sécurisés) qui ont permis à cette erreur humaine de produire un impact en production. Corriger le système empêche définitivement la récidive, quel que soit l'opérateur.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle discipline inventée par Google applique les principes du génie logiciel à la gestion de l'infrastructure et de la fiabilité des systèmes ?
- A) SRE (Site Reliability Engineering)
- B) MS-DOS
- C) HTML
- D) COBOL

**Réponse : A**

**Q2 :** Comment calcule-t-on l'Error Budget (Budget d'Erreur) d'une application ?
- A) Error Budget = 100% - SLO
- B) Error Budget = Prix du serveur x 2
- C) Error Budget = Nombre de lignes de code
- D) Error Budget = Nombre de développeurs

**Réponse : A**

**Q3 :** Quel outil d'ingénierie du chaos s'exécute en continu sur Kubernetes et supprime aléatoirement des Pods pendant les heures de bureau pour vérifier l'auto-correction des applications ?
- A) Kube-Monkey
- B) Word
- C) Calculator
- D) Paint

**Réponse : A**

**Q4 :** Que signifie le principe d'un rapport d'incident "Blameless Post-Mortem" ?
- A) Que l'on cherche à désigner un responsable individuel à licencier
- B) Que l'on analyse l'incident de manière factuelle sans blâmer les individus, afin de comprendre les faiblesses du système et d'implémenter des gardes-fous techniques évitant toute récidive
- C) Que l'on supprime tous les logs de l'incident
- D) Que l'on annule les vacances de l'équipe

**Réponse : B**

**Q5 :** Que se passe-t-il selon les règles SRE lorsque l'Error Budget d'une application est totalement consommé (épuisé à 0%) au cours du mois ?
- A) Les déploiements de nouvelles fonctionnalités sont gelés et les équipes se consacrent exclusivement à la correction des bugs et à l'amélioration de la fiabilité
- B) On supprime le service
- C) On augmente les tarifs bancaires
- D) On éteint les ordinateurs

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
