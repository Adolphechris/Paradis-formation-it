# TOME P11 — DevSecOps & Cloud Security — Jour 457 (6h) : Sécurité et Hardening Kubernetes (K8s RBAC, NetworkPolicies, Pod Security Standards PSS & Admission Controllers Kyverno/OPA Gatekeeper)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser l'architecture de sécurité du Control Plane et des Worker Nodes **Kubernetes**
> - Implémenter le **RBAC (Role-Based Access Control)** au moindre privilège et restreindre l'accès à l'API Server
> - Appliquer les **Pod Security Standards (PSS)** au niveau Restricted avec les Admission Controllers (Kyverno / OPA Gatekeeper)
> - Segmenter le trafic Pod-to-Pod via des **NetworkPolicies** applicatives (Default Deny All)
>
> **Compétences visées :** `SEC-07` (A) — Kubernetes Security Hardening, `SEC-04` (A) — Container Orchestration Security

---

## Module 1 — Kubernetes RBAC & Isolation Control Plane (2h)

### 📖 Intuition & Narration

Kubernetes est le système d'exploitation du Cloud-Native. Tout passe par son API Server (`kube-apiserver`). Si un attaquant parvient à compromettre un ServiceAccount dans un pod avec des privilèges trop larges (ex: droit d'exécuter `kubectl exec` ou de créer des pods privilégiés), il prend instantanément le contrôle de tout le cluster et des nœuds sous-jacents.

### 🔍 Anatomie Technique — Modèle RBAC Kubernetes

```
MODÈLE KUBERNETES RBAC (Role / ClusterRole & Bindings)

  ┌─────────────────────────────────────────────────────────────┐
  │  SUBJECT (User, Group, ServiceAccount)                      │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                   ┌─────────────▼─────────────┐
                   │  RoleBinding /            │ (Association)
                   │  ClusterRoleBinding       │
                   └─────────────┬─────────────┘
                                 │
                   ┌─────────────▼─────────────┐
                   │  Role / ClusterRole       │ (Définition des droits)
                   │  rules:                   │
                   │  - apiGroups: [""]        │
                   │    resources: ["pods"]    │
                   │    verbs: ["get", "list"] │ (Pas de create/delete/exec!)
                   └───────────────────────────┘
```

---

## Module 2 — Pod Security Standards (PSS) & Kyverno (2h)

### 🛠️ Atelier Pratique — Politique de Sécurité Kyverno (Restricted)

```yaml
# k8s/kyverno-disallow-privileged-pods.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: disallow-privileged-containers
  annotations:
    policies.kyverno.io/title: Disallow Privileged Containers
    policies.kyverno.io/category: Pod Security Standards (Restricted)
    policies.kyverno.io/severity: medium
spec:
  validationFailureAction: Enforce  # Bloque immédiatement les pods non conformes
  background: true
  rules:
    - name: validate-privileged
      match:
        any:
        - resources:
            kinds:
              - Pod
      validate:
        message: "Les conteneurs privilégiés (privileged: true) sont strictement INTERDITS !"
        pattern:
          spec:
            containers:
              - securityContext:
                  privileged: false
                  allowPrivilegeEscalation: false
                  readOnlyRootFilesystem: true
                  runAsNonRoot: true
```

```bash
# Application de la politique Kyverno sur le cluster
kubectl apply -f k8s/kyverno-disallow-privileged-pods.yaml
```

---

## Module 3 — Segmentation Réseau avec NetworkPolicies (1h30)

### 🛠️ Atelier Pratique — NetworkPolicy Default Deny All

```yaml
# k8s/network-policy-default-deny.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
---
# Autoriser uniquement le trafic du Frontend vers le Backend
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: backend
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
```

```bash
# Application des NetworkPolicies
kubectl apply -f k8s/network-policy-default-deny.yaml
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PSS** | Pod Security Standards — Spécifications de sécurité Kubernetes remplaçant les PDB (Privileged, Baseline, Restricted) |
| **RBAC** | Role-Based Access Control — Contrôle d'accès basé sur des rôles définissant les verbes applicables sur les ressources |
| **OPA** | Open Policy Agent — Moteur de politique open-source utilisé par OPA Gatekeeper pour le contrôle d'admission K8s |

---

## Exercices Pratiques

### Exercice 1 — ServiceAccount Token Security

Dans un pod Kubernetes non privilégié, la variable d'environnement ou le fichier `/var/run/secrets/kubernetes.io/serviceaccount/token` est présent par défaut. Quel paramètre dans la spec du Pod permet d'empêcher l'injection automatique de ce token lorsqu'il n'est pas nécessaire ?

**Corrigé guidé :** Il faut définir `automountServiceAccountToken: false` dans la spec du ServiceAccount ou du Pod. Cela évite qu'un pod compromis ne puisse réutiliser son jeton pour interroger l'API Server Kubernetes.

---

## Banque QCM — 5 Questions

**Q1.** Lequel des trois niveaux de **Pod Security Standards (PSS)** Kubernetes est le plus strict ?

- A) Privileged
- B) Baseline
- C) Restricted ✅
- D) Developer

**Q2.** La directive `readOnlyRootFilesystem: true` dans le `securityContext` d'un pod vise à :

- A) Empêcher le pod de démarrer
- B) Bloquer toute écriture d'un malware sur le système de fichiers du conteneur en rendant la racine en lecture seule ✅
- C) Chiffrer la mémoire RAM du conteneur
- D) Désactiver les logs stdout

**Q3.** En Kubernetes, une **NetworkPolicy** sans règle d'Ingress autorisée en mode "Default Deny All" a pour effet de :

- A) Supprimer le Namespace
- B) Bloquer tout le trafic réseau entrant vers les pods du Namespace concerné ✅
- C) Rendre tous les pods publics sur Internet
- D) Désactiver la résolution DNS

**Q4.** Le rôle d'un **Admission Controller** comme Kyverno ou OPA Gatekeeper est de :

- A) Générer les images Docker
- B) Intercepter et valider/muter les requêtes HTTP envoyées à l'API Server avant que les ressources ne soient créées ✅
- C) Remplacer les routeurs virtuels BGP
- D) Supprimer les nœuds obsolètes

**Q5.** Le verbe RBAC Kubernetes `exec` sur la ressource `pods/exec` permet à un utilisateur de :

- A) Lire les logs d'un pod
- B) Ouvrir un terminal interactif ou exécuter n'importe quelle commande à l'intérieur du conteneur (Très dangereux!) ✅
- C) Changer l'adresse IP du nœud
- D) Redémarrer l'hyperviseur

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
