# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 102 (6h) : Service Mesh & Observabilité Microservices (Istio, Envoy Proxy & Mutual TLS)

> [!NOTE]
> **Objectif du jour :** Déployer et configurer un Service Mesh de niveau entreprise avec Istio et Envoy Proxy dans Kubernetes : chiffrement automatique du trafic inter-services avec mTLS, gestion du routage réseau avancé (Canary Deployments, Traffic Splitting), et observabilité centralisée avec Kiali.
>
> **Compétences visées :** `BIT-08` (A) — Architectures Cloud Native & Service Mesh | `SEC-04` (A) — Sécurité du Trafic Inter-Microservices (mTLS)

---

## 1) Module — Pourquoi un Service Mesh ? Architecture Envoy & Sidecar (2h)

### 📖 Narration/Intuition

Lorsque le nombre de microservices au sein du cluster Kubernetes de la BCC augmente (passant de 5 à 50 services), gérer manuellement la sécurité du réseau (chiffrement mTLS), le retry automatique, le circuit breaker et le routage des versions dans le code de chaque application devient ingérable.

Un **Service Mesh (Maillage de Services)** comme **Istio** déporte toute l'intelligence réseau en dehors du code applicatif. Il injecte un proxy léger (**Envoy Proxy**) à côté de chaque conteneur applicatif sous forme de **Sidecar**. Tout le trafic entrant et sortant passe par ce proxy transparent.

### 🔍 Anatomie Technique

**Architecture d'un Cluster Kubernetes avec Istio Service Mesh :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ISTIO CONTROL PLANE (istiod)                             │
│  - Distribution des règles de routage (Pilot)                               │
│  - Émission et rotation automatique des certificats mTLS (Citadel)          │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ Configuration xDS (gRPC)
┌─────────────────────────────────────▼───────────────────────────────────────┐
│                    KUBERNETES DATA PLANE (Pods)                             │
│                                                                             │
│  POD A (Application Virement)            POD B (Service Solde)              │
│  ┌─────────────────────────────┐         ┌─────────────────────────────┐    │
│  │ Conteneur App (Python)      │         │ Conteneur App (Go)          │    │
│  └──────────────┬──────────────┘         └──────────────▲──────────────┘    │
│                 │ Loopback (localhost)                  │ Loopback          │
│  ┌──────────────▼──────────────┐  mTLS   ┌──────────────┴──────────────┐    │
│  │ Envoy Proxy (Sidecar)       │========>│ Envoy Proxy (Sidecar)       │    │
│  │  - Chiffrement mTLS         │ (Port   │  - Déchiffrement mTLS       │    │
│  │  - Retries / Rate Limit     │  15001) │  - Audit des règles d'accès │    │
│  └─────────────────────────────┘         └─────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Chiffrement mTLS & Sécurité Inter-Services avec Istio (2h)

### 📖 Narration/Intuition

Dans une architecture Cloud Native Zero Trust, le réseau interne de Kubernetes n'est pas de confiance. Istio applique le chiffrement **mTLS (Mutual TLS) strict** : Envoy génère automatiquement des certificats X.509 pour chaque Pod, vérifie l'identité cryptographique des services et chiffre tout le trafic en transit sans modifier une seule ligne de code applicatif.

### 🔍 Anatomie Technique

**Configuration Istio — Activation du mTLS Strict (`peer-authentication.yaml`) :**

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: bcc-production
spec:
  # Strict : Rejette immédiatement tout trafic qui n'est pas chiffré en mTLS
  mtls:
    mode: STRICT

---
# Autorisation granulaire : Seul le service 'virement-api' peut contacter le service 'solde-db'
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: solde-db-policy
  namespace: bcc-production
spec:
  selector:
    matchLabels:
      app: solde-db
  action: ALLOW
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/bcc-production/sa/virement-api-serviceaccount"]
    to:
    - operation:
        methods: ["POST", "GET"]
        ports: ["5432"]
```

---

## 3) Module — Routage Réseau Avancé & Canary Deployment (2h)

### 📖 Narration/Intuition

Déployer une nouvelle version critique d'une application bancaire (v2.0) comporte des risques. Avec Istio, on peut réaliser un **Canary Deployment (Déploiement Canari)** : rediriger progressivement 5% du trafic réel vers la version v2.0 et 95% vers la version v1.0 stable. Si les métriques de santé restent parfaites, on augmente progressivement le pourcentage jusqu'à 100%.

### 🔍 Anatomie Technique

**Manifeste VirtualService Istio pour Traffic Splitting 90/10 (`virtual-service-canary.yaml`) :**

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: bcc-virement-vs
  namespace: bcc-production
spec:
  hosts:
  - virement.bcc.internal
  http:
  - route:
    # 90% du trafic dirigé vers la version v1.0 (Stable)
    - destination:
        host: bcc-virement-service
        subset: v1
      weight: 90
    # 10% du trafic dirigé vers la version v2.0 (Canary)
    - destination:
        host: bcc-virement-service
        subset: v2
      weight: 10

---
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: bcc-virement-dr
  namespace: bcc-production
spec:
  host: bcc-virement-service
  subsets:
  - name: v1
    labels:
      version: v1.0.0
  - name: v2
    labels:
      version: v2.0.0
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Service Mesh** | Infrastructure logicielle dédiée au contrôle des communications inter-services |
| **mTLS** | Mutual TLS — Authentification et chiffrement TLS bilatéral entre client et serveur |
| **Sidecar** | Pattern d'architecture consistant à placer un proxy secondaire dans le même Pod K8s |
| **xDS** | Ensembles d'APIs gRPC d'Envoy Proxy pour la découverte dynamique de la configuration |
| **Canary** | Technique de déploiement progressif réduisant les risques de panne globale |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi l'architecture Sidecar Proxy (Envoy) utilisée par Istio permet-elle de renforcer la sécurité réseau sans impacter les développeurs d'applications ?

**Corrigé :** Le proxy Envoy est injecté automatiquement au niveau du Pod Kubernetes par Istio control plane. Il s'intercale de façon transparente entre l'application et le réseau. Toutes les fonctions de sécurité complexes (émission et rotation des certificats X.509, chiffrement mTLS, contrôle d'accès RBAC, traçage des requêtes) sont prises en charge par Envoy. Le développeur n'a **aucune bibliothèque réseau ou de sécurité à intégrer ni à maintenir** dans son code source applicatif (Python, Go, Java).

**Exercice 2 :** Quelle est la différence dans Istio entre une ressource `VirtualService` et une ressource `DestinationRule` ?

**Corrigé :** Un **`VirtualService`** définit **comment les requêtes réseau sont acheminées** vers une destination (règles de routage HTTP, redirection d'URL, filtrage d'en-têtes, répartition en pourcentage pour un Canary Deployment). Une **`DestinationRule`** définit **les politiques réseau appliquées au trafic APRÈS que le routage a eu lieu** (définition des sous-ensembles/subsets de version v1/v2, politique mTLS, règles de circuit breaker et pool de connexions).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans l'architecture d'un Service Mesh comme Istio, quel composant léger est déployé sous forme de conteneur Sidecar à côté de chaque application pour intercepter le trafic ?
- A) Envoy Proxy
- B) Nmap
- C) Apache HTTPD
- D) Docker Daemon

**Réponse : A**

**Q2 :** Que garantit le mode `PeerAuthentication` réglé sur `STRICT` dans Istio ?
- A) Que les conteneurs redémarrent toutes les heures
- B) Que tout le trafic inter-services au sein du namespace doit être OBLIGATOIREMENT chiffré et authentifié par mTLS sous peine d'être immédiatement rejeté
- C) Que les mots de passe sont stockés en clair
- D) Que le pare-feu externe est désactivé

**Réponse : B**

**Q3 :** Quelle ressource Istio permet de diviser le trafic réseau entrant entre deux versions d'un microservice (ex: 90% sur v1 et 10% sur v2) pour réaliser un déploiement Canari (Canary Deployment) ?
- A) VirtualService
- B) StorageClass
- C) ConfigMap
- D) CronJob

**Réponse : A**

**Q4 :** Quel tableau de bord graphique dédié à Istio permet de visualiser sous forme de carte interactive en temps réel le réseau complet des microservices, les flux de trafic et l'état du mTLS ?
- A) Kiali
- B) Excel
- C) Wireshark
- D) PhpMyAdmin

**Réponse : A**

**Q5 :** Quel composant du Control Plane d'Istio (`istiod`) est responsable de la génération et de la rotation automatique des certificats X.509 pour les proxies Envoy ?
- A) Citadel / CA Manager
- B) Redis
- C) BGP Daemon
- D) Etcd Client

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
