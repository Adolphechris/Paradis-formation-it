# TOME P2 — Réseaux & Télécoms — Jour 76 (6h) : Kubernetes & Orchestration de Conteneurs

> [!NOTE]
> **Objectif du jour :** Comprendre l'architecture de Kubernetes (K8s) et ses composants fondamentaux : Pods, Deployments, Services, ConfigMaps, Secrets, Namespaces, et RBAC. Savoir déployer une application conteneurisée sur un cluster K8s local (Minikube/Kind) avec les bonnes pratiques de sécurité.
>
> **Compétences visées :** `BIT-08` (A) — Kubernetes & Orchestration | `SEC-03` (A) — Sécurité K8s

---

## 1) Module — Architecture Kubernetes & Composants (2h)

### 📖 Narration/Intuition

**Docker** permet de lancer un conteneur sur un serveur. **Kubernetes** permet de lancer, gérer, scaler et faire survivre des centaines de conteneurs sur des dizaines de serveurs automatiquement. Si un serveur tombe, K8s redémarre automatiquement les conteneurs sur un autre serveur. Si le trafic explose, K8s ajoute des répliques automatiquement. C'est l'orchestrateur de conteneurs standard de l'industrie.

### 🔍 Anatomie Technique

**Architecture Kubernetes :**

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTROL PLANE (Master)                    │
│                                                              │
│  ┌──────────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ API Server   │  │ etcd     │  │ Controller Manager   │  │
│  │ (port 6443)  │  │(base de  │  │ (Deployment, RS,     │  │
│  │              │  │ données  │  │  Node, Job...)       │  │
│  └──────────────┘  │ K8s)     │  └──────────────────────┘  │
│                    └──────────┘                              │
│  ┌────────────────────────────────────┐                      │
│  │ Scheduler (planification des Pods) │                      │
│  └────────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
              │  kubectl / API calls
┌─────────────▼──────────────────────────────────────────────┐
│                      WORKER NODES                           │
│                                                             │
│  Node 1               Node 2               Node 3          │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐ │
│  │ kubelet     │      │ kubelet     │      │ kubelet     │ │
│  │ kube-proxy  │      │ kube-proxy  │      │ kube-proxy  │ │
│  │ container   │      │ container   │      │ container   │ │
│  │  runtime    │      │  runtime    │      │  runtime    │ │
│  ├─────────────┤      ├─────────────┤      ├─────────────┤ │
│  │ Pod: api-1  │      │ Pod: api-2  │      │ Pod: db-1   │ │
│  │ Pod: api-3  │      │ Pod: cache-1│      │             │ │
│  └─────────────┘      └─────────────┘      └─────────────┘ │
└─────────────────────────────────────────────────────────────┘

Composants clés :
- Pod        : Unité de base K8s (1+ conteneurs partageant un réseau et des volumes)
- Deployment : Gère le cycle de vie d'un ensemble de Pods identiques (rolling update)
- ReplicaSet : Garantit un nombre de répliques de Pods actif à tout moment
- Service    : Expose un ensemble de Pods via une IP/DNS stable (load balancing interne)
- Ingress    : Routage HTTP/HTTPS externe vers les Services internes
- ConfigMap  : Données de configuration non sensibles (env vars, fichiers de config)
- Secret     : Données sensibles (mots de passe, tokens) — encodées en Base64
- Namespace  : Isolation logique de ressources (dev, staging, prod)
- PersistentVolume : Stockage persistant indépendant du cycle de vie des Pods
```

**Installation de l'environnement local (Minikube) :**

```bash
# Installer kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl && mv kubectl /usr/local/bin/

# Installer Minikube (cluster K8s local)
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
mv minikube-linux-amd64 /usr/local/bin/minikube && chmod +x /usr/local/bin/minikube

# Démarrer le cluster
minikube start --driver=docker --cpus=4 --memory=8192

# Vérifier l'état
kubectl cluster-info
kubectl get nodes
kubectl get pods --all-namespaces
```

---

## 2) Module — Déploiement d'Application sur Kubernetes (2h)

### 📖 Narration/Intuition

Tout dans Kubernetes est déclaratif — on décrit l'état désiré (3 répliques de l'API, connectées à un service exposé sur le port 443) et K8s s'assure en permanence que la réalité correspond à cette description. Si un Pod tombe, K8s en recréé un nouveau automatiquement.

### 🔍 Anatomie Technique

**Manifestes Kubernetes — Stack BCC API :**

```yaml
# ─── 1. Namespace ─────────────────────────────────────────────────────────────
apiVersion: v1
kind: Namespace
metadata:
  name: bcc-production
  labels:
    env: production
    team: infrastructure

---
# ─── 2. ConfigMap (configuration non sensible) ─────────────────────────────
apiVersion: v1
kind: ConfigMap
metadata:
  name: bcc-api-config
  namespace: bcc-production
data:
  DB_HOST: "postgres-service"
  DB_NAME: "bcc_db"
  LOG_LEVEL: "INFO"
  MAX_CONNECTIONS: "20"

---
# ─── 3. Secret (configuration sensible) ─────────────────────────────────────
apiVersion: v1
kind: Secret
metadata:
  name: bcc-api-secrets
  namespace: bcc-production
type: Opaque
# Valeurs encodées en Base64 (echo -n "valeur" | base64)
data:
  SECRET_KEY: YmNjLXNlY3JldC1rZXktMjAyNC10csOocy1sb25n
  DB_PASSWORD: TW90RGVQYXNzZUJDQzIwMjQh

---
# ─── 4. Deployment de l'API ────────────────────────────────────────────────
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bcc-api
  namespace: bcc-production
  labels:
    app: bcc-api
    version: v1.0.0
spec:
  replicas: 3                       # Haute disponibilité : 3 répliques
  selector:
    matchLabels:
      app: bcc-api
  strategy:
    type: RollingUpdate             # Mise à jour sans downtime
    rollingUpdate:
      maxSurge: 1                   # Max 1 Pod de plus pendant la mise à jour
      maxUnavailable: 0             # Aucun Pod indisponible pendant la mise à jour
  template:
    metadata:
      labels:
        app: bcc-api
    spec:
      # Sécurité au niveau du Pod
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      
      containers:
      - name: api
        image: ghcr.io/bcc/api:v1.0.0
        ports:
        - containerPort: 8080
        
        # Variables depuis ConfigMap et Secret
        envFrom:
        - configMapRef:
            name: bcc-api-config
        env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: bcc-api-secrets
              key: DB_PASSWORD
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: bcc-api-secrets
              key: SECRET_KEY
        
        # Limites de ressources (obligatoires en prod)
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"           # 0.1 vCPU
          limits:
            memory: "512Mi"
            cpu: "500m"           # 0.5 vCPU
        
        # Health checks
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 10
        
        # Sécurité au niveau du conteneur
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop: ["ALL"]

---
# ─── 5. Service (load balancer interne) ─────────────────────────────────────
apiVersion: v1
kind: Service
metadata:
  name: bcc-api-service
  namespace: bcc-production
spec:
  selector:
    app: bcc-api
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
  type: ClusterIP   # Uniquement accessible en interne

---
# ─── 6. Ingress (exposition externe HTTPS) ─────────────────────────────────
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: bcc-api-ingress
  namespace: bcc-production
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.bcc.cd
    secretName: bcc-api-tls
  rules:
  - host: api.bcc.cd
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: bcc-api-service
            port:
              number: 80
```

**Commandes kubectl essentielles :**

```bash
# Appliquer les manifestes
kubectl apply -f deployment.yaml
kubectl apply -f ./k8s/   # Appliquer tous les manifestes d'un dossier

# Observer l'état
kubectl get pods -n bcc-production -w    # -w = watch (temps réel)
kubectl get deployments -n bcc-production
kubectl describe pod bcc-api-xxx -n bcc-production

# Logs
kubectl logs bcc-api-xxx -n bcc-production
kubectl logs -f -l app=bcc-api -n bcc-production  # Logs agrégés de tous les pods

# Debugging
kubectl exec -it bcc-api-xxx -n bcc-production -- bash
kubectl port-forward service/bcc-api-service 8080:80 -n bcc-production

# Scaling manuel
kubectl scale deployment bcc-api --replicas=5 -n bcc-production

# Rolling update
kubectl set image deployment/bcc-api api=ghcr.io/bcc/api:v1.0.1 -n bcc-production
kubectl rollout status deployment/bcc-api -n bcc-production
kubectl rollout undo deployment/bcc-api -n bcc-production  # Rollback
```

---

## 3) Module — RBAC Kubernetes & Sécurité du Cluster (2h)

### 📖 Narration/Intuition

RBAC (Role-Based Access Control) dans Kubernetes contrôle qui peut faire quoi sur le cluster. Un développeur peut déployer dans le namespace `dev` mais pas dans `production`. Un opérateur de monitoring peut lire les logs mais pas modifier les déploiements. Sans RBAC, tout compte qui a accès au cluster a accès à tout.

### 🔍 Anatomie Technique

**Configuration RBAC Kubernetes :**

```yaml
# ─── Role : permissions dans un namespace spécifique ─────────────────────────
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: developer-role
  namespace: bcc-staging
rules:
  # Peut voir les pods et leurs logs
  - apiGroups: [""]
    resources: ["pods", "pods/log"]
    verbs: ["get", "list", "watch"]
  # Peut déployer de nouvelles versions
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch", "update", "patch"]
  # Ne peut PAS créer/supprimer des deployments ni toucher les secrets

---
# ─── RoleBinding : associer le Role à un utilisateur ─────────────────────────
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: developer-binding
  namespace: bcc-staging
subjects:
  - kind: User
    name: jean.mbeki         # Nom du certificat client Kubernetes
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: developer-role
  apiGroup: rbac.authorization.k8s.io

---
# ─── NetworkPolicy : isolation réseau entre Pods ─────────────────────────────
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-network-policy
  namespace: bcc-production
spec:
  podSelector:
    matchLabels:
      app: bcc-api
  policyTypes:
    - Ingress
    - Egress
  ingress:
    # Autoriser seulement le trafic depuis l'ingress controller
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 8080
  egress:
    # Autoriser seulement les connexions vers la BDD et Redis
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - podSelector:
            matchLabels:
              app: redis
      ports:
        - protocol: TCP
          port: 6379
    # DNS
    - to:
        - namespaceSelector: {}
      ports:
        - protocol: UDP
          port: 53
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **K8s** | Kubernetes (K + 8 lettres + s) — orchestrateur de conteneurs |
| **HPA** | Horizontal Pod Autoscaler — autoscaling horizontal des Pods |
| **CRD** | Custom Resource Definition — ressource personnalisée K8s |
| **etcd** | Base de données clé-valeur distribuée — stocke l'état du cluster K8s |
| **kubelet** | Agent K8s qui tourne sur chaque Node et gère les Pods |
| **kube-proxy** | Composant réseau K8s qui gère les règles de routage entre Pods |
| **OPA** | Open Policy Agent — moteur de politique pour K8s |
| **PVC** | PersistentVolumeClaim — demande de stockage persistant K8s |
| **CNI** | Container Network Interface — plugin réseau pour K8s |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle commande K8s permet de voir pourquoi un Pod est en état `CrashLoopBackOff` ?

**Corrigé :**
```bash
kubectl describe pod <nom-du-pod> -n <namespace>   # État et événements du Pod
kubectl logs <nom-du-pod> -n <namespace> --previous # Logs du dernier crash
```
Les événements Kubernetes dans `describe` et les logs du conteneur crashé révèlent généralement la cause.

**Exercice 2 :** Un Deployment K8s a 3 répliques. Un Node tombe. Que se passe-t-il ?

**Corrigé :** K8s détecte que le Node est `NotReady` (via les healthchecks kubelet). Le Controller Manager identifie que les Pods sur ce Node ne sont plus disponibles et crée de nouveaux Pods sur les Nodes restants pour rétablir le nombre de répliques souhaité (3). Ce processus prend généralement 5-60 secondes selon la configuration des timeouts.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Un `Service` Kubernetes de type `ClusterIP` est accessible :
- A) Depuis Internet directement
- B) Uniquement depuis les autres Pods/Services à l'intérieur du cluster
- C) Depuis n'importe quel réseau local de l'entreprise
- D) Uniquement depuis le namespace du Service

**Réponse : B**

**Q2 :** `livenessProbe` et `readinessProbe` dans K8s ont des rôles différents :
- A) Les deux servent à la même chose — détecter si le Pod est opérationnel
- B) livenessProbe redémarre le conteneur s'il échoue ; readinessProbe retire le Pod du load balancer le temps qu'il soit prêt
- C) livenessProbe est pour les services HTTP, readinessProbe pour les services TCP
- D) readinessProbe redémarre le Pod, livenessProbe l'isole du trafic

**Réponse : B**

**Q3 :** Pourquoi `resources.limits` est-il obligatoire en production K8s ?
- A) Pour accélérer le démarrage des Pods
- B) Pour permettre à K8s de placer les Pods sur les bons Nodes
- C) Pour protéger le cluster : sans limits, un Pod peut consommer toute la RAM/CPU d'un Node et impacter les autres Pods
- D) C'est une exigence de sécurité RBAC

**Réponse : C**

**Q4 :** Un `Secret` Kubernetes est encodé en Base64. Cela signifie :
- A) Le Secret est chiffré de manière sécurisée
- B) Le Secret est simplement encodé (pas chiffré) — accessible à quiconque a les droits RBAC sur ce Secret
- C) Le Secret est accessible uniquement par le Deployment auquel il est attaché
- D) Base64 est équivalent à un chiffrement AES-256

**Réponse : B** — Pour un vrai chiffrement, utiliser Sealed Secrets ou intégrer un Vault externe.

**Q5 :** Une `NetworkPolicy` K8s avec `policyTypes: [Ingress, Egress]` et aucune règle définie signifie :
- A) Tout le trafic est autorisé par défaut
- B) Seulement le trafic DNS est autorisé
- C) Tout le trafic entrant et sortant vers ce Pod est bloqué (deny-all)
- D) La politique s'applique uniquement au namespace courant

**Réponse : C** — Une NetworkPolicy vide avec les deux types déclarés = deny-all pour le Pod sélectionné.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
