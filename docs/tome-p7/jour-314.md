# TOME P7 — Certifications d'Élite & Spécialisations — Jour 314 (6h) : CKS Bootcamp — Runtime Security (Falco Custom Rules, Seccomp Profiles, AppArmor & Audit Logs Kubernetes)

> [!NOTE]
> **Objectif du jour :** Maîtriser la **sécurité à l'exécution des workloads Kubernetes** ciblée par la certification **CKS** : rédiger des profils **Seccomp** personnalisés pour restreindre les appels système dangereux, créer des profils **AppArmor** limitant les accès fichiers et réseau d'un container, configurer les **Kubernetes Audit Logs** pour capturer les actions sensibles sur l'API server, et écrire des règles **Falco** avancées avec MITRE ATT&CK tagging.
>
> **Compétences visées :** `CKS-07` (A) — Seccomp & AppArmor Runtime Profiles | `CKS-08` (A) — Kubernetes Audit Policy & Falco Advanced Rules

---

## 1) Module — Profils Seccomp & AppArmor (2h)

### 📖 Narration/Intuition

**Seccomp (Secure Computing Mode)** filtre les appels système (syscalls) qu'un processus peut effectuer. Le profil `RuntimeDefault` du container runtime (containerd/CRI-O) bloque déjà ~300 syscalls dangereux. Un profil `Localhost` personnalisé permet un contrôle ultra-précis.

**AppArmor** est un module de sécurité Linux (LSM) qui confine les programmes via des profils déclaratifs définissant les fichiers accessibles, les capabilities autorisées et les réseaux utilisables.

---

## 2) Module — Seccomp JSON + AppArmor Profile (`runtime_security.sh`) (2h)

### 🛠️ Atelier Pratique

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Profil Seccomp personnalisé (whitelist syscalls)
# ═══════════════════════════════════════════════════════
# Créer le profil sur TOUS les nœuds K8s (chemin attendu par kubelet)
sudo mkdir -p /var/lib/kubelet/seccomp/profiles

cat <<'EOF' | sudo tee /var/lib/kubelet/seccomp/profiles/webapp-strict.json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "architectures": ["SCMP_ARCH_X86_64"],
  "syscalls": [
    {
      "names": [
        "accept4", "bind", "brk", "clone", "close", "connect",
        "epoll_create1", "epoll_ctl", "epoll_pwait", "execve",
        "exit_group", "fstat", "futex", "getdents64", "getpid",
        "getsockname", "listen", "mmap", "munmap", "nanosleep",
        "openat", "read", "recvfrom", "sendto", "setsockopt",
        "socket", "write"
      ],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
EOF

# Appliquer le profil Seccomp Localhost sur un Pod
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: webapp-seccomp
  namespace: production
spec:
  securityContext:
    seccompProfile:
      type: Localhost
      localhostProfile: profiles/webapp-strict.json
  containers:
  - name: webapp
    image: 123456789012.dkr.ecr.eu-west-1.amazonaws.com/webapp:v1.2.3
EOF

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Profil AppArmor (confinement du processus webapp)
# ═══════════════════════════════════════════════════════
cat <<'EOF' | sudo tee /etc/apparmor.d/webapp-profile
#include <tunables/global>

profile webapp-profile flags=(attach_disconnected, mediate_deleted) {
  #include <abstractions/base>

  # Autorisations réseau
  network inet tcp,
  network inet udp,

  # Fichiers en lecture seule
  /etc/hosts r,
  /etc/resolv.conf r,
  /app/** r,

  # Répertoire de logs en écriture
  /var/log/webapp/** w,

  # Interdit : accès aux fichiers système sensibles
  deny /proc/*/mem rw,
  deny /sys/** w,
  deny /etc/shadow r,
}
EOF

# Charger le profil AppArmor sur le nœud
sudo apparmor_parser -r /etc/apparmor.d/webapp-profile

# Appliquer le profil AppArmor sur un Pod via annotation
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: webapp-apparmor
  namespace: production
  annotations:
    container.apparmor.security.beta.kubernetes.io/webapp: localhost/webapp-profile
spec:
  containers:
  - name: webapp
    image: 123456789012.dkr.ecr.eu-west-1.amazonaws.com/webapp:v1.2.3
EOF
```

---

## 3) Module — Kubernetes Audit Policy (`audit-policy.yaml`) (2h)

```yaml
# ═══════════════════════════════════════════════════════
# Kubernetes API Server Audit Policy — CKS Best Practices
# ═══════════════════════════════════════════════════════
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
  # Enregistrer les accès aux Secrets au niveau RequestResponse (contenu complet)
  - level: RequestResponse
    resources:
      - group: ""
        resources: ["secrets"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]

  # Enregistrer toutes les actions sur les RBAC (rôles, bindings)
  - level: Request
    resources:
      - group: "rbac.authorization.k8s.io"
        resources: ["roles", "rolebindings", "clusterroles", "clusterrolebindings"]

  # Enregistrer les actions exec dans les Pods (container escape potential)
  - level: RequestResponse
    resources:
      - group: ""
        resources: ["pods/exec", "pods/attach", "pods/portforward"]

  # Ignorer les appels système read-only répétitifs (réduire le bruit)
  - level: None
    verbs: ["get", "watch", "list"]
    users: ["system:kube-proxy"]

  # Enregistrer tout le reste au niveau Metadata (minimaliste)
  - level: Metadata
```

```bash
# Activer l'audit sur le kube-apiserver (si cluster kubeadm)
sudo vi /etc/kubernetes/manifests/kube-apiserver.yaml
# Ajouter :
# --audit-policy-file=/etc/kubernetes/audit-policy.yaml
# --audit-log-path=/var/log/kubernetes/audit.log
# --audit-log-maxage=30
# --audit-log-maxbackup=10
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Seccomp** | Secure Computing Mode — Mécanisme Linux filtrant les appels système autorisés pour un processus |
| **AppArmor** | Application Armor — Module de sécurité Linux (LSM) confinant les programmes par profils |
| **LSM** | Linux Security Module — Framework du noyau Linux pour les modules de sécurité (AppArmor, SELinux) |
| **Audit Log** | Journal d'audit de l'API Server Kubernetes enregistrant toutes les actions sur le cluster |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans Kubernetes, comment appliquer un profil Seccomp **personnalisé** (localhost) déposé sur les nœuds dans `/var/lib/kubelet/seccomp/profiles/` ?
- A) Via `spec.securityContext.seccompProfile.type: Localhost` et `localhostProfile: profiles/mon-profil.json` dans la spec du Pod
- B) Via une annotation `seccomp.security.alpha.kubernetes.io/pod`
- C) Via une NetworkPolicy
- D) Via un ConfigMap monté dans le container

**Réponse : A**

**Q2 :** Quelle est l'action par défaut (`defaultAction`) recommandée dans un profil Seccomp restrictif pour les syscalls non listés ?
- A) `SCMP_ACT_ERRNO` — Retourne une erreur pour tout syscall non explicitement autorisé
- B) `SCMP_ACT_ALLOW` — Autorise tout
- C) `SCMP_ACT_KILL` — Tue le processus
- D) `SCMP_ACT_LOG` — Log sans bloquer

**Réponse : A**

**Q3 :** Via quel mécanisme Kubernetes un profil AppArmor est-il associé à un container spécifique dans un Pod ?
- A) Via une annotation sur le Pod : `container.apparmor.security.beta.kubernetes.io/<container-name>: localhost/<profile-name>`
- B) Via un label sur le namespace
- C) Via une CiliumNetworkPolicy
- D) Via un SecurityContext field direct

**Réponse : A**

**Q4 :** Dans la politique d'audit Kubernetes, quel niveau enregistre à la fois le **corps de la requête ET celui de la réponse** (utile pour capturer le contenu des Secrets lus) ?
- A) `RequestResponse`
- B) `Request`
- C) `Metadata`
- D) `None`

**Réponse : A**

**Q5 :** Pourquoi est-il critique d'auditer les actions sur `pods/exec` dans la politique d'audit Kubernetes ?
- A) Parce que `kubectl exec` permet l'exécution arbitraire de commandes dans un container, et constitue un vecteur d'escalade de privilèges ou d'exfiltration de données à surveiller impérativement
- B) Parce que `kubectl exec` génère trop de logs normaux
- C) Parce que `kubectl exec` ne fonctionne qu'en root
- D) Parce que `kubectl exec` désactive AppArmor

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
