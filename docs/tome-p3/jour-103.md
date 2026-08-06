# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 103 (6h) : GitOps & Déploiement Continu Automatisé (ArgoCD, FluxCD & Kustomize)

> [!NOTE]
> **Objectif du jour :** Maîtriser le modèle opérationnel **GitOps** pour la gestion de l'infrastructure et le déploiement applicatif automatisé dans Kubernetes : principes de la source unique de vérité Git, synchronisation continue avec ArgoCD / FluxCD, templating avec Kustomize / Helm, et gestion des déploiements déclaratifs auto-correcteurs.
>
> **Compétences visées :** `BIT-08` (A) — GitOps & Continuous Delivery | `SEC-05` (A) — Traçabilité & Conformité des Déploiements

---

## 1) Module — Le Modèle Opérationnel GitOps & Principes (2h)

### 📖 Narration/Intuition

Traditionnellement, pour déployer une mise à jour sur Kubernetes, un ingénieur DevOps exécutait des commandes `kubectl apply -f manifest.yaml` ou `helm upgrade` directement depuis sa machine locale ou un pipeline CI/CD poussant des configurations vers le cluster.

Cette méthode pose de graves problèmes de sécurité et d'auditabilité : qui a modifié la configuration du cluster ? Quelle était la version précédente ? Si le cluster crash, comment reconstruire à l'identique ?

**GitOps** résout cela en inversant le modèle : **Git devient la Source Unique de Vérité (Single Source of Truth)**. Un agent (comme ArgoCD) s'exécute *à l'intérieur* du cluster, surveille le dépôt Git et réplique automatiquement l'état décrit dans Git sur le cluster. Si quelqu'un modifie manuellement le cluster en secret, ArgoCD détecte le décalage (Drift) et réaligne immédiatement le cluster sur Git.

### 🔍 Anatomie Technique

**Comparaison du Modèle Push (Traditionnel) vs Modèle Pull (GitOps) :**

```
MODÈLE PUSH (TRADITIONNEL - RISQUÉ) :
Dev / CI Pipeline ─── kubectl apply (Clés d'accès K8s dans CI) ───→ Cluster K8s

MODÈLE PULL (GITOPS - SÉCURISÉ) :
Dev ─── git push ───→ Dépôt Git (Source de Vérité)
                          ▲
                          │ Surveillance continue (Pull)
                     ┌────┴───────────────────────────┐
                     │ AGENT GITOPS (ArgoCD / Flux)   │ (Tourne DANS K8s)
                     │ Reconciles Drift Automatically │
                     └────┬───────────────────────────┘
                          │ Applique sur le cluster
                          ▼
                     State du Cluster K8s
```

---

## 2) Module — Déploiement & Configuration d'ArgoCD (2h)

### 📖 Narration/Intuition

**ArgoCD** est l'outil de déploiement continu déclaratif GitOps de référence pour Kubernetes. Il offre une interface web riche et une CLI permettant de visualiser l'état de synchronisation (Synced / OutOfSync) et de santé (Healthy / Degraded) des applications.

### 🔍 Anatomie Technique

**Déploiement et déclaration d'une Application ArgoCD (`argocd-app-virement.yaml`) :**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: bcc-virement-app
  namespace: argocd
  # Protection contre les suppressions accidentelles
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default

  # 1. Source de Vérité (Dépôt Git contenant les manifestes Kubernetes)
  source:
    repoURL: 'https://github.com/bcc-bank/bcc-k8s-infrastructure.git'
    targetRevision: HEAD
    path: 'environments/production/virement-api'

  # 2. Destination (Cluster K8s et Namespace cible)
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: bcc-production

  # 3. Politique de Synchronisation Automatique & Auto-Correction
  syncPolicy:
    automated:
      prune: true      # Supprime automatiquement les ressources K8s supprimées dans Git
      selfHeal: true   # Réaligne automatiquement si quelqu'un modifie le cluster à la main !
    syncOptions:
      - CreateNamespace=true
      - Validate=true
```

---

## 3) Module — Structuration Multi-Environnements avec Kustomize (2h)

### 📖 Narration/Intuition

En entreprise, on ne souhaite pas dupliquer l'intégralité des manifestes Kubernetes pour chaque environnement (Dev, Staging, Production). **Kustomize** (intégré nativement à `kubectl` et ArgoCD) permet de définir un **Base** (manifestes communs) et des **Overlays** (modifications spécifiques par environnement : nombre de répliques, ressources CPU, URLs de bases de données).

### 🔍 Anatomie Technique

**Structure d'un dépôt GitOps Kustomize :**

```
apps/
├── base/                         # Manifestes communs à tous les envs
│   ├── deployment.yaml
│   ├── service.yaml
│   └── kustomization.yaml
└── overlays/
    ├── staging/
    │   ├── kustomization.yaml    # Replicas = 1, DB = staging-db
    │   └── patch-replicas.yaml
    └── production/
        ├── kustomization.yaml    # Replicas = 5, DB = prod-db
        └── patch-resources.yaml
```

**Fichier Overlay Production (`overlays/production/kustomization.yaml`) :**

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

# Hériter des manifestes de base
resources:
  - ../../base

# Modifier le namespace pour la prod
namespace: bcc-production

# Appliquer des tags d'images spécifiques
images:
  - name: ghcr.io/bcc/virement-api
    newTag: v2.1.0

# Patchs de configuration spécifiques à la production (ex: scaling à 5 répliques)
patches:
  - target:
      kind: Deployment
      name: bcc-virement-api
    patch: |-
      - op: replace
        path: /spec/replicas
        value: 5
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **GitOps** | Modèle opérationnel utilisant Git comme source unique de vérité pour le déploiement |
| **Drift** | Écart constaté entre la configuration décrite dans Git et l'état réel du cluster |
| **Self-Healing** | Capacité du moteur GitOps à corriger automatiquement les décalages du cluster |
| **Kustomize** | Outil de personnalisation déclarative de configurations Kubernetes sans templates |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi le modèle GitOps **Pull** (ex: ArgoCD s'exécutant dans le cluster) est-il considérablement plus sécurisé que le modèle **Push** (ex: script CI/CD qui exécute `kubectl apply`) ?

**Corrigé :** Dans le modèle Push traditionnel, le serveur CI/CD (ex: GitHub Actions) doit posséder des identifiants et certificats à très hauts privilèges (cluster-admin) pour se connecter à distance à l'API Server de Kubernetes. Si le serveur CI/CD est compromis, l'attaquant récupère les accès complets au cluster. Dans le modèle **GitOps Pull**, **aucune clé d'accès au cluster n'est exposée à l'extérieur**. L'agent ArgoCD tourne à l'intérieur du cluster et lit uniquement le dépôt Git en lecture seule.

**Exercice 2 :** Que se passe-t-il dans ArgoCD lorsque l'option `selfHeal: true` est activée et qu'un administrateur tente de modifier manuellement la taille d'un Deployment via la commande `kubectl scale` ?

**Corrigé :** Dès que l'administrateur exécute la commande manuelle sur le cluster, l'agent ArgoCD détecte un **Drift** (décalage entre Git qui spécifie 3 répliques et le cluster qui passe à 10 répliques). En raison du `selfHeal: true`, ArgoCD annule immédiatement la modification manuelle et rétablit le cluster sur l'état exact défini dans Git (3 répliques). Toute modification durable doit **obligatoirement passer par un commit/pull-request dans Git**.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans une démarche GitOps, quelle est la source unique de vérité (Single Source of Truth) de l'état de l'infrastructure et des applications ?
- A) La mémoire RAM du développeur
- B) Le dépôt Git
- C) Le tableau de bord du routeur
- D) Un fichier Excel local

**Réponse : B**

**Q2 :** Quel outil open-source basé sur Kubernetes permet d'implémenter la livraison continue déclarative GitOps en surveillant les dépôts Git et en synchronisant l'état du cluster ?
- A) ArgoCD (ou FluxCD)
- B) Wireshark
- C) Metasploit
- D) Gzip

**Réponse : A**

**Q3 :** Comment appelle-t-on le phénomène où la configuration réelle d'un cluster Kubernetes s'éloigne de la configuration déclarée dans le dépôt Git ?
- A) Drift (Décalage de configuration)
- B) Compilation
- C) Encryption
- D) Backup

**Réponse : A**

**Q4 :** Quel outil natif à l'écosystème Kubernetes permet de gérer des déclinaisons multi-environnements (Dev, Staging, Prod) en appliquant des overlays sur une base commune sans utiliser d'ingénierie de templates complexe ?
- A) Kustomize
- B) BGP
- C) Telnet
- D) Systemd

**Réponse : A**

**Q5 :** Quel est le comportement d'ArgoCD avec l'option `prune: true` activée lors de la synchronisation ?
- A) Il supprime automatiquement dans Kubernetes les ressources dont les manifestes ont été supprimés du dépôt Git
- B) Il formate les disques durs du serveur
- C) Il efface l'historique Git
- D) Il désactive la sécurité du cluster

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
