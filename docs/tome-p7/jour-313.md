# TOME P7 — Certifications d'Élite & Spécialisations — Jour 313 (6h) : CKS Bootcamp — Network Policies Avancées (Cilium eBPF L7, Istio mTLS Service Mesh, Kubernetes NetworkPolicy Egress/Ingress)

> [!NOTE]
> **Objectif du jour :** Maîtriser la **microsegmentation réseau Kubernetes** ciblée par la certification **CKS** : rédiger des **NetworkPolicies Kubernetes** précises (ingress/egress namespaceSelector + podSelector), déployer le CNI **Cilium** avec des politiques L7 (HTTP path/method) via des **CiliumNetworkPolicies**, et configurer le chiffrement mTLS automatique inter-services avec **Istio Service Mesh**.
>
> **Compétences visées :** `CKS-05` (A) — Kubernetes NetworkPolicy Ingress/Egress | `CKS-06` (A) — Cilium eBPF L7 Policies & Istio mTLS

---

## 1) Module — Kubernetes NetworkPolicy (Deny All + Allow Minimal) (2h)

### 📖 Narration/Intuition

Par défaut, **tous les Pods Kubernetes se parlent librement** — aucun pare-feu interne n'est actif. La bonne pratique CKS est d'appliquer une politique **Deny All** par défaut, puis d'ouvrir **uniquement les flux légitimes** avec des NetworkPolicies précises.

---

## 2) Module — NetworkPolicy + CiliumNetworkPolicy L7 (`k8s_network_policies.sh`) (2h)

### 🛠️ Atelier Pratique

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Deny All Ingress & Egress par défaut (namespace production)
# ═══════════════════════════════════════════════════════
cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}        # Sélectionne TOUS les pods du namespace
  policyTypes:
    - Ingress
    - Egress             # Bloque tout trafic entrant ET sortant par défaut
EOF

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Autoriser le trafic Web vers l'API uniquement depuis le namespace frontend
# ═══════════════════════════════════════════════════════
cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-api
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api-backend      # Cible les pods "api-backend"
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: frontend  # Uniquement depuis le namespace "frontend"
          podSelector:
            matchLabels:
              app: frontend-ui
      ports:
        - protocol: TCP
          port: 8080
EOF

# ═══════════════════════════════════════════════════════
# ÉTAPE 3 — CiliumNetworkPolicy L7 : Bloquer les requêtes non-GET sur /api/public
# ═══════════════════════════════════════════════════════
cat <<'EOF' | kubectl apply -f -
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: l7-api-protection
  namespace: production
spec:
  endpointSelector:
    matchLabels:
      app: api-backend
  ingress:
    - fromEndpoints:
        - matchLabels:
            app: frontend-ui
      toPorts:
        - ports:
            - port: "8080"
              protocol: TCP
          rules:
            http:
              - method: "GET"            # Uniquement les requêtes GET
                path: "/api/public/.*"  # Uniquement sur ce path (regex)
EOF
```

---

## 3) Module — Istio mTLS Strict Mode (`istio_mtls.sh`) (2h)

```bash
# ═══════════════════════════════════════════════════════
# ISTIO Service Mesh — mTLS strict entre tous les microservices
# ═══════════════════════════════════════════════════════

# Installation d'Istio
istioctl install --set profile=default

# Activer l'injection automatique du sidecar Envoy sur le namespace production
kubectl label namespace production istio-injection=enabled

# Appliquer une PeerAuthentication mTLS STRICT sur tout le namespace
cat <<'EOF' | kubectl apply -f -
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default-mtls-strict
  namespace: production
spec:
  mtls:
    mode: STRICT    # Bloque tout trafic non-chiffré mTLS entre les services !
EOF

# Vérifier que le mTLS est actif
istioctl x describe pod $(kubectl get pod -n production -l app=api-backend -o jsonpath='{.items[0].metadata.name}') -n production

# AuthorizationPolicy : Autoriser uniquement le frontend à appeler l'API
cat <<'EOF' | kubectl apply -f -
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: allow-frontend-to-api
  namespace: production
spec:
  selector:
    matchLabels:
      app: api-backend
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/frontend/sa/frontend-service-account"]
      to:
        - operation:
            methods: ["GET"]
            paths: ["/api/*"]
EOF
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CNI** | Container Network Interface — Spécification de plugin réseau Kubernetes (ex: Cilium, Calico, Flannel) |
| **Cilium** | CNI eBPF avancé permettant des politiques réseau jusqu'au niveau L7 (HTTP path/method/headers) |
| **Istio** | Service Mesh Kubernetes fournissant mTLS automatique, contrôle d'accès et observabilité |
| **PeerAuthentication** | Ressource Istio configurant le mode mTLS (STRICT, PERMISSIVE, DISABLE) |
| **AuthorizationPolicy** | Ressource Istio définissant les règles d'autorisation entre services (SPIFFE identity) |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans Kubernetes, que se passe-t-il **par défaut** si aucune NetworkPolicy n'est appliquée dans un namespace ?
- A) Tout le trafic est autorisé entre tous les Pods (aucun pare-feu interne par défaut)
- B) Tout le trafic est bloqué par défaut
- C) Seul le trafic HTTPS est autorisé
- D) Les Pods ne peuvent communiquer qu'avec le même namespace

**Réponse : A**

**Q2 :** Comment bloquer **tout le trafic entrant et sortant** d'un namespace Kubernetes par défaut avec une seule NetworkPolicy ?
- A) Créer une NetworkPolicy avec `podSelector: {}` (tous les pods) et `policyTypes: [Ingress, Egress]` sans règles `ingress`/`egress` — ce qui crée un "deny all"
- B) Supprimer le namespace
- C) Désactiver le CNI
- D) Ajouter un taint sur tous les nœuds

**Réponse : A**

**Q3 :** Quelle fonctionnalité de **Cilium** dépasse les capacités des NetworkPolicies Kubernetes standard ?
- A) La possibilité de filtrer le trafic jusqu'au niveau L7 (HTTP method, path, headers) grâce à eBPF, sans proxy sidecar
- B) La gestion automatique des certificats TLS
- C) Le scan de CVE des images
- D) La génération de SBOM

**Réponse : A**

**Q4 :** Dans Istio, qu'impose le mode `PeerAuthentication` **STRICT** ?
- A) Tout le trafic inter-services doit être chiffré avec mTLS (TLS mutuel avec certificats SVID SPIFFE) — les connexions en clair sont rejetées
- B) Seul le trafic entrant doit être en HTTPS
- C) Les services doivent s'authentifier avec un JWT
- D) Les Pods doivent s'exécuter en tant que root

**Réponse : A**

**Q5 :** Dans l'examen CKS, quelle est la bonne pratique de microsegmentation à appliquer systématiquement dans un namespace de production ?
- A) Appliquer d'abord une NetworkPolicy "default-deny-all", puis n'ouvrir que les flux réseau strictement nécessaires avec des règles namespaceSelector + podSelector précises
- B) N'appliquer aucune NetworkPolicy pour ne pas briser les communications
- C) Utiliser uniquement des Security Groups cloud
- D) Désactiver le kube-proxy

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
