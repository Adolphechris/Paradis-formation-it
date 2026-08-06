# TOME P4 — Cloud, DevOps & SecOps — Jour 177 (6h) : Kubernetes Fondamentaux (Pods, Deployments, Services, ConfigMaps, Secrets & RBAC)

> [!NOTE]
> **Objectif du jour :** Comprendre l'architecture et les concepts fondamentaux de **Kubernetes (K8s)**, l'orchestrateur de conteneurs standard de l'industrie : Pods, Deployments (rolling updates, rollbacks), Services (ClusterIP, NodePort, LoadBalancer), ConfigMaps, Secrets, et sécurisation par **RBAC (Role-Based Access Control)**.
>
> **Compétences visées :** `OPS-05` (A) — Orchestration Kubernetes | `SEC-05` (A) — Sécurité K8s RBAC & Secrets

---

## 1) Module — Architecture Kubernetes & Objets Fondamentaux (2h)

### 📖 Narration/Intuition

Docker Compose est parfait pour un seul serveur. Mais que se passe-t-il quand l'API BCC doit tourner sur **50 serveurs** simultanément, gérer les pannes automatiquement, déployer des nouvelles versions sans interruption de service, et équilibrer la charge entre les instances ? C'est précisément le rôle de **Kubernetes** (K8s).

Kubernetes est un **orchestrateur de conteneurs** qui gère automatiquement : le placement des conteneurs sur les serveurs (scheduling), la réplication (au moins N instances actives en permanence), la mise à jour progressive (rolling update), l'auto-guérison (redémarrage automatique des pods en panne), et l'équilibrage de charge.

### 🔍 Anatomie Technique

**Architecture d'un Cluster Kubernetes :**

```
                    ┌─────────────────────────────────────────┐
                    │         CONTROL PLANE (Master Node)      │
                    │                                          │
                    │  ┌──────────┐  ┌────────┐  ┌─────────┐ │
                    │  │  API     │  │  etcd  │  │Scheduler│ │
                    │  │  Server  │  │(Cluster│  │(Placement│ │
                    │  │(kubectl) │  │  State)│  │ des Pods)│ │
                    │  └──────────┘  └────────┘  └─────────┘ │
                    │  ┌──────────────────────────────────┐   │
                    │  │  Controller Manager               │   │
                    │  │ (Reconciliation Loop — Desired    │   │
                    │  │  State vs Current State)          │   │
                    │  └──────────────────────────────────┘   │
                    └──────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼──────────────────────┐
                    ▼                   ▼                       ▼
          ┌───────────────┐  ┌───────────────┐       ┌──────────────┐
          │  Worker Node 1│  │  Worker Node 2│       │ Worker Node 3│
          │  ┌──────────┐ │  │  ┌──────────┐ │       │ ...          │
          │  │ kubelet  │ │  │  │ kubelet  │ │       └──────────────┘
          │  └──────────┘ │  │  └──────────┘ │
          │  ┌──────────┐ │  │  ┌──────────┐ │
          │  │ Pod (API)│ │  │  │ Pod (API)│ │
          │  │ Pod (API)│ │  │  │ Pod (DB) │ │
          │  └──────────┘ │  │  └──────────┘ │
          └───────────────┘  └───────────────┘
```

**Manifeste YAML Deployment BCC API (`deployment-bcc-api.yaml`) :**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bcc-api
  namespace: bcc-production
  labels:
    app: bcc-api
    version: "1.2.0"
spec:
  replicas: 3                      # 3 instances identiques pour la haute disponibilité
  selector:
    matchLabels:
      app: bcc-api
  strategy:
    type: RollingUpdate            # Mise à jour progressive sans interruption
    rollingUpdate:
      maxSurge: 1                  # Max 1 Pod supplémentaire pendant la mise à jour
      maxUnavailable: 0            # Zéro interruption : tous les Pods restent disponibles
  template:
    metadata:
      labels:
        app: bcc-api
    spec:
      securityContext:
        runAsNonRoot: true         # Sécurité : Bloquer l'exécution en tant que root
        runAsUser: 1001
      containers:
      - name: bcc-api
        image: registry.bcc.cd/bcc-api:1.2.0
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: bcc-api-config   # Variables non-sensibles
        env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: bcc-db-secret  # Variable sensible injectée depuis un Secret K8s
              key: password
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 20
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
```

---

## 2) Module — Services, ConfigMaps & Secrets K8s (2h)

### 📖 Narration/Intuition

Les **Pods** Kubernetes sont éphémères : ils peuvent être détruits et recréés à tout moment (leur adresse IP change). Un **Service** K8s fournit une adresse IP et un nom DNS stables pour accéder à un groupe de Pods.

Un **ConfigMap** stocke les configurations non-sensibles (variables d'environnement, fichiers de config). Un **Secret** K8s stocke les données sensibles (mots de passe, clés API, certificats TLS) de manière encodée (Base64 + chiffrement au repos avec etcd encryption).

### 🔍 Anatomie Technique

**Service, ConfigMap et Secret (`k8s-manifests.yaml`) :**

```yaml
# ── Service : Point d'accès stable vers les Pods BCC API
apiVersion: v1
kind: Service
metadata:
  name: bcc-api-service
  namespace: bcc-production
spec:
  selector:
    app: bcc-api             # Cible tous les Pods avec le label app=bcc-api
  ports:
  - protocol: TCP
    port: 80                 # Port exposé par le Service
    targetPort: 3000         # Port du conteneur applicatif
  type: ClusterIP            # Accessible uniquement depuis l'intérieur du cluster

---
# ── ConfigMap : Configuration non-sensible de l'API BCC
apiVersion: v1
kind: ConfigMap
metadata:
  name: bcc-api-config
  namespace: bcc-production
data:
  NODE_ENV: "production"
  PORT: "3000"
  DB_HOST: "postgres-service"
  DB_PORT: "5432"
  DB_NAME: "bcc_core"
  LOG_LEVEL: "warn"

---
# ── Secret : Données sensibles chiffrées
apiVersion: v1
kind: Secret
metadata:
  name: bcc-db-secret
  namespace: bcc-production
type: Opaque
stringData:                  # K8s encode automatiquement en Base64
  password: "S3cr3t_BCC_DB_Prod_2024!"
  jwt-private-key: |
    -----BEGIN RSA PRIVATE KEY-----
    (Clé RSA privée pour la signature JWT)
    -----END RSA PRIVATE KEY-----
```

**Commandes `kubectl` essentielles :**
```bash
# Appliquer les manifestes YAML
kubectl apply -f deployment-bcc-api.yaml
kubectl apply -f k8s-manifests.yaml

# Suivre le déploiement (Rolling Update)
kubectl rollout status deployment/bcc-api -n bcc-production

# Rollback vers la version précédente en cas d'incident
kubectl rollout undo deployment/bcc-api -n bcc-production

# Scaler horizontalement (Ajouter 2 répliques supplémentaires)
kubectl scale deployment bcc-api --replicas=5 -n bcc-production

# Lire les logs d'un Pod
kubectl logs -f deployment/bcc-api -n bcc-production
```

---

## 3) Module — RBAC Kubernetes : Sécurisation des Accès au Cluster (2h)

### 📖 Narration/Intuition

Kubernetes RBAC (Role-Based Access Control) contrôle qui peut faire quoi dans le cluster. Sans RBAC, n'importe quel développeur pourrait supprimer accidentellement les Pods de production ou lire les Secrets contenant les mots de passe de la base de données centrale de la BCC.

### 🔍 Anatomie Technique

**Manifestes RBAC — Rôle Développeur en lecture seule (`rbac-dev.yaml`) :**

```yaml
# ── ServiceAccount : Identité du développeur dans K8s
apiVersion: v1
kind: ServiceAccount
metadata:
  name: dev-readonly
  namespace: bcc-production

---
# ── Role : Définition des permissions (dans un namespace)
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: developer-readonly-role
  namespace: bcc-production
rules:
  # Autoriser la lecture des Pods et leurs logs (nécessaire pour le debug)
  - apiGroups: [""]
    resources: ["pods", "pods/log"]
    verbs: ["get", "list", "watch"]
  # Autoriser la lecture des Deployments et Services
  - apiGroups: ["apps"]
    resources: ["deployments", "replicasets"]
    verbs: ["get", "list", "watch"]
  # INTERDIT : Pas d'accès aux Secrets (mots de passe de BDD)
  # INTERDIT : Pas de verbs "create", "update", "delete", "patch"

---
# ── RoleBinding : Association Role <──► ServiceAccount
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: dev-readonly-binding
  namespace: bcc-production
subjects:
  - kind: ServiceAccount
    name: dev-readonly
    namespace: bcc-production
roleRef:
  kind: Role
  name: developer-readonly-role
  apiGroup: rbac.authorization.k8s.io
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **K8s** | Kubernetes — Abréviation (8 lettres entre K et s) de l'orchestrateur de conteneurs |
| **etcd** | Distributed Key-Value Store — Base de données distribuée stockant l'état du cluster K8s |
| **RBAC** | Role-Based Access Control — Contrôle d'accès basé sur les rôles dans Kubernetes |
| **Pod** | Plus petite unité déployable dans K8s — Contient un ou plusieurs conteneurs partageant le même réseau |
| **HPA** | Horizontal Pod Autoscaler — Mécanisme K8s d'auto-scaling horizontal basé sur les métriques CPU/RAM |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre une **Liveness Probe** et une **Readiness Probe** dans Kubernetes, et que se passe-t-il lorsque chacune échoue ?

**Corrigé :** La **Liveness Probe** vérifie si le conteneur est toujours en vie et fonctionnel. Si elle échoue plusieurs fois consécutives (selon `failureThreshold`), Kubernetes **redémarre le conteneur** (il détecte un deadlock ou un crash silencieux). La **Readiness Probe** vérifie si le conteneur est prêt à recevoir du trafic (ex: l'application a terminé de charger ses configurations, la connexion BDD est établie). Si elle échoue, Kubernetes **retire ce Pod du pool du Service** (il cesse de recevoir des requêtes) sans le redémarrer. Cela est crucial lors des Rolling Updates pour n'envoyer du trafic qu'aux instances opérationnelles.

**Exercice 2 :** Pourquoi un **Secret K8s** est-il plus sécurisé qu'un **ConfigMap** pour stocker des mots de passe, et quelles protections supplémentaires de production sont recommandées ?

**Corrigé :** Les Secrets K8s sont encodés en Base64 (pas chiffrés nativement), mais bénéficient de protections supplémentaires : (1) L'objet `Secret` n'est jamais journalisé en clair dans les logs d'audit K8s, (2) Kubernetes peut chiffrer les Secrets au repos dans etcd via **Encryption at Rest** (`EncryptionConfiguration`), (3) Les Secrets ne sont montés dans un Pod **que si ce Pod en a explicitement besoin** (via `secretKeyRef` ou `volume mount`), (4) L'accès aux Secrets est contrôlé par **RBAC** (un développeur sans la permission `get secrets` ne peut pas les lire). En production, on intègre des solutions comme **HashiCorp Vault** ou **AWS Secrets Manager** pour une gestion centralisée et auditée.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la plus petite unité déployable dans Kubernetes, qui peut contenir un ou plusieurs conteneurs partageant le même espace réseau ?
- A) Le Pod
- B) Le Node
- C) Le Namespace
- D) Le Cluster

**Réponse : A**

**Q2 :** Quelle stratégie de déploiement K8s permet de mettre à jour une application sans aucune interruption de service en remplaçant progressivement les anciens Pods par les nouveaux ?
- A) RollingUpdate
- B) Recreate
- C) Blue/Green uniquement
- D) Manual Update

**Réponse : A**

**Q3 :** Dans Kubernetes RBAC, quel objet associe un `Role` (définissant les permissions) à un `ServiceAccount` ou à un utilisateur ?
- A) Le `RoleBinding`
- B) Le `ClusterRole`
- C) Le `ConfigMap`
- D) Le `Deployment`

**Réponse : A**

**Q4 :** Quel composant du Control Plane Kubernetes est responsable de la décision de planification (scheduling) : sur quel Worker Node un nouveau Pod doit-il être créé en fonction des ressources disponibles ?
- A) Le Scheduler (`kube-scheduler`)
- B) L'API Server
- C) Le kubelet
- D) etcd

**Réponse : A**

**Q5 :** Quelle commande `kubectl` permet d'annuler un déploiement problématique et de revenir à la version précédente du Deployment ?
- A) `kubectl rollout undo deployment/<nom>`
- B) `kubectl delete deployment/<nom>`
- C) `kubectl revert deployment/<nom>`
- D) `kubectl reset deployment/<nom>`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
