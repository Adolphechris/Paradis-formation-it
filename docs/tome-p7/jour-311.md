# TOME P7 — Certifications d'Élite & Spécialisations — Jour 311 (6h) : CKS Bootcamp — Pod Security Standards (PSS), Admission Webhooks & OPA Gatekeeper (Kubernetes Policy Enforcement)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **contrôle d'admission Kubernetes** ciblé par la certification **CKS (Certified Kubernetes Security Specialist)** : appliquer les **Pod Security Standards (PSS)** via les labels de namespace (`restricted`, `baseline`, `privileged`), configurer un **Validating Admission Webhook** pour des politiques customisées, et déployer **OPA Gatekeeper** avec des **ConstraintTemplates Rego** pour interdire les containers root et les images non-signées.
>
> **Compétences visées :** `CKS-01` (A) — Pod Security Standards & Admission Control | `CKS-02` (A) — OPA Gatekeeper ConstraintTemplates & Rego

---

## 1) Module — Pod Security Standards (PSS) : baseline & restricted (2h)

### 📖 Narration/Intuition

Les **Pod Security Standards** remplacent les anciens PodSecurityPolicy (dépréciés en K8s 1.25). Ils définissent 3 profils de sécurité appliqués au niveau du namespace via des labels :

| Profil | Restrictions | Usage |
|:------:|:------------|:-----:|
| `privileged` | Aucune — Accès root total | Infra système (CNI, monitoring) |
| `baseline` | Bloque les containers avec `hostNetwork`, `hostPID`, certains `capabilities` | Applications générales |
| `restricted` | Le plus strict — Bloque root, exige `runAsNonRoot`, `seccompProfile`, `allowPrivilegeEscalation: false` | Applications de production |

---

## 2) Module — Application des PSS & OPA Gatekeeper (`cks_pss_gatekeeper.sh`) (2h)

### 🛠️ Atelier Pratique

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Pod Security Standards : Label de namespace
# ═══════════════════════════════════════════════════════

# Appliquer le profil "restricted" en mode enforce sur le namespace production
kubectl label namespace production \
  pod-security.kubernetes.io/enforce=restricted \
  pod-security.kubernetes.io/enforce-version=latest \
  pod-security.kubernetes.io/warn=restricted \
  pod-security.kubernetes.io/audit=restricted

# Vérifier : Déployer un pod root dans ce namespace -> doit être rejeté !
kubectl run test-root --image=nginx --namespace=production
# Error: Pod "test-root" is invalid: spec.containers[0].securityContext.runAsNonRoot: Required value

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — OPA Gatekeeper : Interdire les images Docker Hub non-approuvées
# ═══════════════════════════════════════════════════════

# Installer OPA Gatekeeper
kubectl apply -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/v3.14.0/deploy/gatekeeper.yaml

# ConstraintTemplate : Interdire les images provenant de registres non-approuvés
cat <<'EOF' | kubectl apply -f -
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8sallowedregistries
spec:
  crd:
    spec:
      names:
        kind: K8sAllowedRegistries
      validation:
        openAPIV3Schema:
          type: object
          properties:
            registries:
              type: array
              items:
                type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8sallowedregistries

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          not starts_with_allowed(container.image)
          msg := sprintf("Image '%v' provient d'un registre non approuvé !", [container.image])
        }

        starts_with_allowed(image) {
          registry := input.parameters.registries[_]
          startswith(image, registry)
        }
EOF

# Instancier la Constraint pour interdire tout sauf notre ECR interne
cat <<'EOF' | kubectl apply -f -
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sAllowedRegistries
metadata:
  name: enforce-internal-registry
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
  parameters:
    registries:
      - "123456789012.dkr.ecr.eu-west-1.amazonaws.com/"
      - "registry.paradis-it.com/"
EOF

echo "[+] OPA Gatekeeper déployé — Seules les images du registre interne sont autorisées"
```

---

## 3) Module — SecurityContext Best Practices (`secure_pod.yaml`) (2h)

```yaml
# Pod Kubernetes avec SecurityContext complet (conforme CKS restricted PSS)
apiVersion: v1
kind: Pod
metadata:
  name: secure-webapp
  namespace: production
spec:
  # Contexte de sécurité au niveau du Pod
  securityContext:
    runAsNonRoot: true          # Interdit l'exécution en tant que root (UID 0)
    runAsUser: 10001            # UID non-privilégié
    runAsGroup: 10001           # GID non-privilégié
    fsGroup: 10001              # Propriétaire du système de fichiers
    seccompProfile:
      type: RuntimeDefault      # Profil seccomp système restreignant les syscalls dangereux

  containers:
  - name: webapp
    image: 123456789012.dkr.ecr.eu-west-1.amazonaws.com/webapp:v1.2.3
    # Contexte de sécurité au niveau du Container
    securityContext:
      allowPrivilegeEscalation: false  # Interdit sudo/setuid
      readOnlyRootFilesystem: true     # Système de fichiers root en lecture seule
      capabilities:
        drop:
          - ALL                        # Supprime TOUTES les Linux Capabilities
        add:
          - NET_BIND_SERVICE           # Réajoute uniquement ce qui est nécessaire
    resources:
      limits:
        cpu: "500m"
        memory: "128Mi"
      requests:
        cpu: "100m"
        memory: "64Mi"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PSS** | Pod Security Standards — Normes de sécurité des Pods K8s (restricted/baseline/privileged) |
| **OPA** | Open Policy Agent — Moteur de politiques déclaratives universel (CNCF) |
| **Gatekeeper** | Intégration OPA native pour Kubernetes via des Admission Webhooks |
| **ConstraintTemplate** | Ressource Gatekeeper définissant une règle Rego réutilisable comme politique Kubernetes |
| **CKS** | Certified Kubernetes Security Specialist — Certification CNCF de sécurité Kubernetes |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans Kubernetes, comment appliquer le profil **PSS `restricted`** (le plus strict) sur un namespace en mode bloquant (`enforce`) ?
- A) En ajoutant le label `pod-security.kubernetes.io/enforce=restricted` sur le namespace
- B) En créant une NetworkPolicy
- C) En modifiant le fichier `/etc/kubernetes/manifests/kube-apiserver.yaml`
- D) En installant Caldera CNI

**Réponse : A**

**Q2 :** Quel est le rôle d'une **ConstraintTemplate** OPA Gatekeeper ?
- A) Définir un nouveau type de politique réutilisable en Rego, qui sera ensuite instanciée par une ressource Constraint pour s'appliquer sur des objets Kubernetes spécifiques
- B) Chiffrer les Secrets Kubernetes
- C) Créer des Pods automatiquement
- D) Configurer le réseau CNI

**Réponse : A**

**Q3 :** Quelle option du `SecurityContext` d'un container Kubernetes empêche un processus d'obtenir des privilèges supplémentaires via `sudo` ou un bit SUID sur un binaire ?
- A) `allowPrivilegeEscalation: false`
- B) `runAsNonRoot: true`
- C) `readOnlyRootFilesystem: true`
- D) `capabilities.drop: [ALL]`

**Réponse : A**

**Q4 :** Pourquoi l'option `readOnlyRootFilesystem: true` est-elle recommandée pour les containers de production CKS ?
- A) Elle empêche un attaquant ayant compromis le container d'écrire des fichiers malveillants (scripts de persistance, outils d'attaque) sur le système de fichiers du container
- B) Elle réduit la consommation CPU
- C) Elle active le chiffrement ETCD
- D) Elle désactive la résolution DNS interne

**Réponse : A**

**Q5 :** Dans le PSS `restricted`, quelle directive de `securityContext` est **obligatoire** pour être conforme ?
- A) `seccompProfile.type: RuntimeDefault` ET `allowPrivilegeEscalation: false` ET `runAsNonRoot: true` ET `capabilities.drop: [ALL]`
- B) Uniquement `runAsUser: 0`
- C) Aucune — le profil restricted n'a pas d'exigences obligatoires
- D) Uniquement `privileged: true`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
