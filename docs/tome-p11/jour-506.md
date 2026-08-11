# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 506 (6h) : Sécurité Kubernetes : RBAC, NetworkPolicies, Pod Security Standards (PSS) & Kyverno

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le modèle d'autorisation **K8s RBAC** (Role, ClusterRole, RoleBinding, ClusterRoleBinding) selon le principe du moindre privilège
> - Isoler le trafic réseau inter-pods avec des **NetworkPolicies** Kubernetes (Zero-Trust Network)
> - Appliquer les **Pod Security Standards (PSS)** (Privileged, Baseline, Restricted)
> - Rédiger et appliquer des politiques de sécurité déclaratives Kubernetes avec **Kyverno** ou OPA Gatekeeper
>
> **Compétences visées :** `SEC-05` (A), `INF-02` (A) — Kubernetes Security & Policy Enforcement

---

## Module 1 — Kubernetes Threat Model & RBAC (2h)

### 📖 Intuition & Narration

Kubernetes est le système d'exploitation du Cloud-Native. Cependant, un cluster Kubernetes par défaut est extrêmement permissif : tous les pods de tous les namespaces peuvent communiquer entre eux, et un ServiceAccount mal configuré peut permettre à un conteneur compromis de prendre le contrôle complet du Control Plane Kubernetes.

La sécurité d'un cluster repose sur trois piliers fondamentaux :
1. **RBAC (Role-Based Access Control)** : Contrôle strict de *qui* (User, Group, ServiceAccount) a le droit de faire *quoi* (Verbes : `get`, `list`, `create`, `delete`) sur *quelle ressource* (`pods`, `secrets`, `services`).
2. **NetworkPolicies** : Pare-feu applicatif niveau L4 interne au cluster (micro-segmentation Zero-Trust).
3. **Pod Security Standards (PSS)** : Règles d'admission restreignant les capacités des pods (interdiction du mode privileged, obligation de tourner en non-root).

### 🔍 Anatomie Technique — Architecture K8s RBAC & Micro-segmentation NetworkPolicy

```
ARCHITECTURE DE SÉCURITÉ KUBERNETES

  [ REQUÊTE KUBECTL / POD SERVICEACCOUNT ]
                     │
                     ▼
  ┌────────────────────────────────────────────────────────┐
  │ KUBE-APISERVER (Authentication & RBAC Authorization)   │
  │ Vérifie les permissions (RoleBinding / ClusterRole)     │
  └────────────────────────┬───────────────────────────────┘
                           │ (Si autorisé)
                           ▼
  ┌────────────────────────────────────────────────────────┐
  │ ADMISSION CONTROLLERS (Kyverno / PSS Enforcement)      │
  │ Valide la conformité du manifest YAML (Restricted PSS) │
  └────────────────────────┬───────────────────────────────┘
                           │ (Si valide)
                           ▼
  ┌────────────────────────────────────────────────────────┐
  │ CONTAINER RUNTIME & NETWORKPOLICY (CNI Cilium/Calico)  │
  │ Applique le pare-feu inter-pod Zero-Trust L4          │
  └────────────────────────────────────────────────────────┘
```

---

## Module 2 — Atelier Pratique : RBAC & Kyverno Policies (2h)

### 🛠️ Manifestes YAML & Script Python d'Audit de Politiques Kyverno

```yaml
# /k8s/kyverno-restricted-policy.yaml — Règle Kyverno d'Admission Restreinte
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: disallow-root-execution
spec:
  validationFailureAction: Enforce   # Interdit la création si non conforme
  background: true
  rules:
    - name: check-runAsNonRoot
      match:
        any:
          - resources:
              kinds:
                - Pod
      validate:
        message: "Les pods doivent obligatoirement être configurés avec runAsNonRoot: true."
        pattern:
          spec:
            securityContext:
              runAsNonRoot: true
```

```python
#!/usr/bin/env python3
"""
PARADIS — Kubernetes Manifest Security Inspector
Vérifie si un manifeste Pod/Deployment respecte les Pod Security Standards (Restricted Profile).
"""

import json
import sys

def audit_k8s_manifest(manifest: dict) -> bool:
    print("=== AUDIT DE MANIFESTE KUBERNETES (PSS RESTRICTED PROFILE) ===")
    violations = []

    spec = manifest.get("spec", {})
    if manifest.get("kind") == "Deployment":
        spec = spec.get("template", {}).get("spec", {})

    pod_security_context = spec.get("securityContext", {})
    containers = spec.get("containers", [])

    # 1. Vérification runAsNonRoot au niveau du Pod ou Container
    run_as_non_root = pod_security_context.get("runAsNonRoot", False)
    if not run_as_non_root:
        violations.append("[🚨 PSS RESTRICTED] 'spec.securityContext.runAsNonRoot' doit être mis à 'true' !")

    # 2. Vérification des conteneurs
    for c in containers:
        c_name = c.get("name", "unknown")
        c_sec = c.get("securityContext", {})

        if c_sec.get("privileged", False):
            violations.append(f"[🚨 CRITICAL] Conteneur '{c_name}' configuré en mode 'privileged: true' !")

        if not c_sec.get("readOnlyRootFilesystem", False):
            violations.append(f"[⚠️ HIGH] Conteneur '{c_name}' : 'readOnlyRootFilesystem' est désactivé !")

        if not c_sec.get("allowPrivilegeEscalation", True) is False:
            violations.append(f"[⚠️ HIGH] Conteneur '{c_name}' : 'allowPrivilegeEscalation' doit être 'false' !")

    print(f"[*] Analyse de la ressource '{manifest.get('metadata', {}).get('name', 'unnamed')}' ({manifest.get('kind')})...")

    if violations:
        print(f"\n[!] Violations des Pod Security Standards ({len(violations)}) :")
        for v in violations:
            print(f"  {v}")
        print("\n[⛔ RESULTAT] REJET PAR LE CONTRÔLEUR D'ADMISSION — Déploiement K8s Bloqué.")
        return False
    else:
        print("\n[✅ RESULTAT] MANIFESTE CONFORME — Prêt pour déploiement dans le cluster.")
        return True

if __name__ == "__main__":
    sample_manifest = {
        "apiVersion": "apps/v1",
        "kind": "Deployment",
        "metadata": {"name": "paradis-auth-api"},
        "spec": {
            "template": {
                "spec": {
                    "securityContext": {"runAsNonRoot": True},
                    "containers": [
                        {
                            "name": "api",
                            "securityContext": {
                                "privileged": False,
                                "readOnlyRootFilesystem": True,
                                "allowPrivilegeEscalation": False
                            }
                        }
                    ]
                }
            }
        }
    }
    success = audit_k8s_manifest(sample_manifest)
    if not success:
        sys.exit(1)
```

---

## Module 3 — NetworkPolicies Zero-Trust Inter-Pods (1h30)

### 🔍 Configuration Zero-Trust avec NetworkPolicy

Par défaut dans Kubernetes, la politique réseau est **Default-Allow** (tout pod parle à tout pod). La bonne pratique DevSecOps consiste à appliquer une NetworkPolicy **Default-Deny-All** sur chaque namespace, puis à autoriser explicitement les flux nécessaires (Ingress et Egress).

```yaml
# /k8s/networkpolicy-default-deny.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {} # S'applique à tous les pods du namespace
  policyTypes:
    - Ingress
    - Egress
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **RBAC** | Role-Based Access Control — Contrôle d'accès basé sur les rôles |
| **PSS** | Pod Security Standards — Normes de sécurité des Pods Kubernetes |
| **OPA** | Open Policy Agent — Moteur de politique généraliste open-source |
| **CNI** | Container Network Interface — Plugin réseau pour Kubernetes (ex: Cilium, Calico) |

---

## Exercices Pratiques

### Exercice 1 — Audit d'un Role RBAC Permissif

Identifiez le problème de sécurité majeur dans ce rôle RBAC Kubernetes :
```yaml
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: dev-role
spec:
  rules:
    - apiGroups: ["*"]
      resources: ["*"]
      verbs: ["*"]
```

**Corrigé guidé :**
Ce rôle accorde des privilèges équivalents à `cluster-admin` au sein du namespace. L'utilisation du joker `*` pour `apiGroups`, `resources` et `verbs` viole directement le principe du moindre privilège. Il doit être restreint aux ressources et verbes strictement nécessaires (ex: `get`, `list` sur `pods`).

---

## Banque QCM — 5 Questions

**Q1.** Quels sont les deux objets Kubernetes nécessaires pour accorder des permissions RBAC à un `ServiceAccount` au niveau d'un namespace spécifique ?

- A) Un `Role` et un `RoleBinding`. ✅
- B) Une `NetworkPolicy` et un `Secret`.
- C) Un `Ingress` et un `Service`.
- D) Un `Node` et un `Pod`.

**Q2.** Quelle est la politique réseau par défaut dans un namespace Kubernetes nouvellement créé ?

- A) Default-Deny-All (tout le trafic est bloqué).
- B) Default-Allow-All (tous les pods de tous les namespaces peuvent communiquer librement entre eux). ✅
- C) Le réseau est désactivé.
- D) Seul le trafic HTTP est autorisé.

**Q3.** Quel est l'actionneur recommandé de l'outil **Kyverno** pour bloquer immédiatement la création d'un Pod non conforme dans le cluster ?

- A) `validationFailureAction: Audit`
- B) `validationFailureAction: Enforce` ✅
- C) `validationFailureAction: Ignore`
- D) `validationFailureAction: Delete`

**Q4.** Dans les **Pod Security Standards (PSS)** Kubernetes, quel profil offre le niveau de sécurité le plus élevé et restrictif ?

- A) Privileged
- B) Baseline
- C) Restricted ✅
- D) Open

**Q5.** Quel est le rôle d'un plugin CNI comme **Cilium** ou **Calico** dans la sécurité d'un cluster Kubernetes ?

- A) Générer les certificats SSL.
- B) Intercepter et appliquer physiquement les règles de filtrage de flux **NetworkPolicies** au niveau du réseau hôte / eBPF. ✅
- C) Réparer les disques durs défectueux.
- D) Remplacer le serveur DNS.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
