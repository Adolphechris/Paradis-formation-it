# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 256 (6h) : Sécurité Kubernetes Avancée (etcd Encryption at Rest, RBAC Hardening, Audit Policy Logging & Admission Controllers OPA/Gatekeeper)

> [!NOTE]
> **Objectif du jour :** Maîtriser le durcissement avancé d'un cluster Kubernetes selon les exigences du **Certified Kubernetes Security Specialist (CKS)** : chiffrer les données sensibles stockées dans `etcd`, auditer et restreindre les privilèges **RBAC**, configurer la journalisation fine des requêtes de l'API Server (**Audit Policy Logging**), et appliquer des règles de gouvernance strictes avec **OPA Gatekeeper**.
>
> **Compétences visées :** `SEC-04` (A) — Kubernetes Security Hardening | `CKS-01` (A) — etcd Encryption, RBAC & Policy Enforcement

---

## 1) Module — etcd Encryption at Rest (1h30)

### 📖 Narration/Intuition

Par défaut, Kubernetes stocke l'ensemble des objets du cluster (y compris les **Secrets** contenant des mots de passe, tokens et clés TLS) en clair dans la base clé-valeur `etcd`. Si un attaquant parvient à lire le disque d'un master node ou à accéder au port etcd (2379), il peut extraire tous les secrets du cluster.

### 🛠️ Atelier Pratique

**Configuration de l'EncryptionConfiguration pour etcd (`etcd_encryption.sh`) :**

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Génération d'une clé AES-CBC 32 octets (Base64)
# ═══════════════════════════════════════════════════════
SECRET_KEY=$(head -c 32 /dev/urandom | base64)
echo "[+] Clé de chiffrement etcd générée : $SECRET_KEY"

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Création du fichier EncryptionConfiguration
# ═══════════════════════════════════════════════════════
cat <<EOF | sudo tee /etc/kubernetes/enc/encryption-config.yaml
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources:
      - secrets
    providers:
      - aescbc:
          keys:
            - name: key1
              secret: ${SECRET_KEY}
      - identity: {}
EOF

# ═══════════════════════════════════════════════════════
# ÉTAPE 3 — Mise à jour du Manifest kube-apiserver
# ═══════════════════════════════════════════════════════
# Ajouter le flag --encryption-provider-config=/etc/kubernetes/enc/encryption-config.yaml
# et le volumeMount correspondant dans /etc/kubernetes/manifests/kube-apiserver.yaml

# ═══════════════════════════════════════════════════════
# ÉTAPE 4 — Chiffrement des secrets existants
# ═══════════════════════════════════════════════════════
kubectl get secrets --all-namespaces -o json | kubectl replace -f -
echo "[+] Tous les secrets Kubernetes existants sont désormais chiffrés dans etcd !"
```

---

## 2) Module — RBAC Hardening & Audit des Privilèges (1h30)

### 📖 Narration/Intuition

Le **Role-Based Access Control (RBAC)** contrôle l'accès aux ressources du cluster. Les erreurs de configuration RBAC courantes (ex: accorder `verbs: ["*"]` ou l'accès aux `secrets` ou `pods/exec` à des ServiceAccounts non-admins) créent des voies d'escalade de privilèges directes vers l'accès root au cluster.

### 🛠️ Atelier Pratique

**Règle RBAC minimale et audit des rôles dangereux (`rbac_hardening.yaml`) :**

```yaml
# Exemple de Role RBAC ultra-restreint (Principe du moindre privilège)
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: pod-reader-restricted
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list"] # Interdit "create", "delete", "exec"
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: bind-pod-reader
  namespace: production
subjects:
  - kind: ServiceAccount
    name: app-service-account
    namespace: production
roleRef:
  kind: Role
  name: pod-reader-restricted
  apiGroup: rbac.authorization.k8s.io
```

```bash
# Audit automatique des permissions RBAC risquées avec rbak / kubectl-who-can
kubectl get clusterrolebindings -o json | jq '.items[] | select(.roleRef.name=="cluster-admin") | .subjects'

# Vérifier qui peut exécuter des commandes dans les pods (exec)
kubectl get clusterroles -o json | jq '.items[] | select(.rules[]?.resources[]?=="pods/exec") | .metadata.name'
```

---

## 3) Module — Kubernetes Audit Policy Logging (1h30)

### 📖 Narration/Intuition

L'**Audit Logging** Kubernetes enregistre chronologiquement toutes les requêtes adressées au `kube-apiserver` (qui, quoi, quand, quel namespace). C'est le composant fondamental de détection d'intrusions pour la Blue Team.

### 🛠️ Atelier Pratique

**Fichier de politique d'audit Kubernetes (`audit-policy.yaml`) :**

```yaml
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
  # Ne pas enregistrer les requêtes de santé verbeuses (readiness/liveness)
  - level: None
    users: ["system:kube-proxy"]
    verbs: ["watch"]
    resources:
      - group: ""
        resources: ["endpoints", "services"]

  # Enregistrer les modifications de secrets en RequestResponse (corps complet)
  - level: RequestResponse
    resources:
      - group: ""
        resources: ["secrets", "configmaps"]

  # Enregistrer les exécutions de pods (pod/exec) avec métadonnées
  - level: Request
    resources:
      - group: ""
        resources: ["pods/exec", "pods/portforward"]

  # Règle par défaut pour le reste du cluster
  - level: Metadata
```

---

## 4) Module — Admission Control avec OPA Gatekeeper (1h30)

### 📖 Narration/Intuition

Les **Admission Controllers** interceptent les requêtes après authentification et autorisation mais avant la persistance de l'objet. **OPA Gatekeeper** utilise le langage de politique **Rego** pour imposer des règles de sécurité (ex: interdire les images `latest`, interdire les pods `privileged`, imposer des limites mémoire).

### 🛠️ Atelier Pratique

**ConstraintTemplate & Constraint OPA Gatekeeper (`gatekeeper_policy.yaml`) :**

```yaml
# ConstraintTemplate : Bloquer les pods qui s'exécutent en mode privileged
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8spspprivilegedcontainer
spec:
  crd:
    spec:
      names:
        kind: K8sPSPPrivilegedContainer
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8spspprivilegedcontainer
        violation[{"msg": msg}] {
          c := input.review.object.spec.containers[_]
          c.securityContext.privileged == true
          msg := sprintf("Le conteneur '%v' est en mode privileged, ce qui est strictement interdit !", [c.name])
        }
---
# Appliquer la contrainte sur tous les namespaces sauf kube-system
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sPSPPrivilegedContainer
metadata:
  name: psp-no-privileged-containers
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
    excludedNamespaces: ["kube-system"]
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CKS** | Certified Kubernetes Security Specialist — Certification de sécurité Kubernetes par la Linux Foundation / CNCF |
| **etcd** | Base de données clé-valeur distribuée de Kubernetes |
| **RBAC** | Role-Based Access Control — Contrôle d'accès basé sur les rôles |
| **OPA** | Open Policy Agent — Moteur de politique généraliste open-source |
| **Rego** | Langage déclaratif de politique utilisé par Open Policy Agent |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans quel composant Kubernetes les Secrets sont-ils stockés par défaut en clair avant d'activer l'EncryptionConfiguration ?
- A) etcd
- B) kube-apiserver
- C) kubelet
- D) CoreDNS

**Réponse : A**

**Q2 :** Quel niveau d'audit Kubernetes enregistre le corps complet de la requête et de la réponse pour un événement donné ?
- A) `RequestResponse`
- B) `Metadata`
- C) `Request`
- D) `None`

**Réponse : A**

**Q3 :** Dans OPA Gatekeeper, quel langage est utilisé pour rédiger les règles de validation et de violation d'admission ?
- A) Rego
- B) Python
- C) Go
- D) YAML

**Réponse : A**

**Q4 :** Quelle commande permet d'identifier si un ServiceAccount a les privilèges d'exécuter des commandes dans un pod (`pods/exec`) ?
- A) `kubectl auth can-i create pods/exec --as=system:serviceaccount:default:my-sa`
- B) `kubectl get pods --all`
- C) `kubectl logs kube-apiserver`
- D) `kubectl describe node`

**Réponse : A**

**Q5 :** Quel algorithme de chiffrement symétrique standard est recommandé dans le fichier `EncryptionConfiguration` de Kubernetes pour etcd ?
- A) `aescbc` ou `secretbox`
- B) `DES`
- C) `MD5`
- D) `RC4`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
