# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 116 (6h) : Sécurité des Déploiements Kubernetes & Isolation des Runtimes (Kata Containers, gVisor & Security Profiles Operator)

> [!NOTE]
> **Objectif du jour :** Renforcer l'isolation des conteneurs Kubernetes dans des environnements bancaires multi-tenants : sandboxing de conteneurs avec Kata Containers (MicroVMs QEMU/Firecracker) et gVisor (Noyau utilisateur Google), et gestion centralisée des profils Seccomp/AppArmor avec Security Profiles Operator (SPO).
>
> **Compétences visées :** `SEC-03` (A) — Hardening Runtimes Kubernetes | `BIT-08` (A) — Container Sandboxing & Seccomp

---

## 1) Module — Isolation des Runtimes : gVisor vs Kata Containers (2h)

### 📖 Narration/Intuition

Par défaut dans Docker et Kubernetes (runc), tous les conteneurs partagent le **même noyau Linux unique** du serveur hôte. Si un attaquant parvient à exploiter une faille du noyau (Kernel Exploit / 0-day), il sort immédiatement du conteneur et prend le contrôle complet de la machine physique hôte (Container Escape).

Pour isoler les applications non vérifiées ou ultra-sensibles, on utilise des **Runtimes de Sandboxing** :
- **gVisor (Google)** : Intercepte tous les appels système (syscalls) du conteneur et les réimplémente dans un noyau virtuel sandbox écrit en Go (`runsc`), empêchant le conteneur de toucher le vrai noyau de l'hôte.
- **Kata Containers** : Lance chaque Pod Kubernetes à l'intérieur d'une **MicroVM matérielle dédiée** (QEMU/Firecracker) avec son propre noyau Linux léger isolé.

### 🔍 Anatomie Technique

**Comparaison des Runtimes de Conteneurs :**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. RUNC (RUNTIMES TRADITIONNEL - PAR DÉFAUT)                │
│    Conteneur A      Conteneur B                             │
│         │                │                                  │
│         └────────┬───────┘                                  │
│                  ▼                                          │
│       [ NOYAU LINUX HÔTE UNIQUE ] (Risque de Container Escape)│
└─────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. GVISOR (SANDBOX USERSPACE - RUNSC)                       │
│    Conteneur A      Conteneur B                             │
│         │                │                                  │
│   [ Noyau Go Sentry] [ Noyau Go Sentry]                     │
│         └────────┬───────┘ (Syscalls Filtrés)               │
│                  ▼                                          │
│       [ NOYAU LINUX HÔTE ]                                  │
└─────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. KATA CONTAINERS (MICROVM ISOLATION)                      │
│    Conteneur A                Conteneur B                   │
│    [ MicroVM Kernel 1 ]       [ MicroVM Kernel 2 ]          │
│         │                          │                        │
│         └────────────┬─────────────┘                        │
│                      ▼                                      │
│           [ HYPERVISEUR / HÔTE ] (Isolation Matérielle Max) │
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Configuration des RuntimeClasses dans Kubernetes (2h)

### 📖 Narration/Intuition

Dans Kubernetes, on peut mélanger différents runtimes au sein d'un même cluster. La ressource **`RuntimeClass`** permet aux développeurs de choisir le niveau d'isolement requis pour chaque Pod (ex: `runc` pour des microservices internes, `gvisor` pour une API publique, `kata` pour du code tiers non approuvé).

### 🔍 Anatomie Technique

**Manifeste Kubernetes RuntimeClass & Déploiement Sandboxed (`runtime-class-sandboxed.yaml`) :**

```yaml
# 1. Déclaration de la RuntimeClass gVisor
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: gvisor
handler: runsc  # Handler gVisor configuré dans containerd

---
# 2. Déclaration de la RuntimeClass Kata Containers
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: kata-containers
handler: kata   # Handler Kata (QEMU/Firecracker)

---
# 3. Déploiement d'un Pod bancaire ultra-sécurisé avec gVisor
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bcc-untrusted-api
  namespace: bcc-production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: bcc-untrusted-api
  template:
    metadata:
      labels:
        app: bcc-untrusted-api
    spec:
      runtimeClassName: gvisor  # Exécution forcée dans le Sandbox gVisor !
      containers:
        - name: untrusted-processor
          image: ghcr.io/bcc/untrusted-parser:v1.0.0
          resources:
            limits:
              memory: "512Mi"
              cpu: "500m"
```

---

## 3) Module — Security Profiles Operator (SPO) & Seccomp (2h)

### 📖 Narration/Intuition

**Seccomp (Secure Computing Mode)** est un mécanisme du noyau Linux qui restreint les appels système (Syscalls) autorisés pour un processus. Le noyau Linux propose plus de 300 syscalls, mais un conteneur web n'en a besoin que d'environ 40.

**Security Profiles Operator (SPO)** est un opérateur Kubernetes qui automatise l'enregistrement, la distribution et l'application des profils Seccomp et AppArmor sur tous les nœuds du cluster.

### 🔍 Anatomie Technique

**Profil Seccomp géré par SPO (`seccomp-profile-strict.yaml`) :**

```yaml
apiVersion: security-profiles-operator.x-k8s.io/v1beta1
kind: SeccompProfile
metadata:
  name: bcc-strict-seccomp
  namespace: bcc-production
spec:
  defaultAction: SCMP_ACT_ERRNO  # Bloquer tous les appels système non listés
  architectures:
    - SCMP_ARCH_X86_64
  syscalls:
    - action: SCMP_ACT_ALLOW
      names:
        - accept4
        - epoll_wait
        - exit_group
        - futex
        - read
        - write
        - socket
        - connect
        - brk
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **gVisor** | Moteur de sandboxing de conteneurs développé par Google interceptant les syscalls en Userspace |
| **Kata Containers** | Runtime de conteneurisé exécutant chaque Pod dans une MicroVM dédiée |
| **SPO** | Security Profiles Operator — Opérateur Kubernetes de gestion des profils Seccomp/AppArmor |
| **Seccomp** | Secure Computing Mode — Mécanisme Linux de filtrage des appels système (syscalls) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence majeure d'architecture entre **gVisor** et **Kata Containers** pour isoler un conteneur Kubernetes ?

**Corrigé :** **gVisor** réimplémente le noyau Linux en Userspace (langage Go, composant Sentry) : il intercepte les appels système applicatifs et y répond sans transmettre les appels dangereux au vrai noyau Linux hôte. **Kata Containers** utilise la virtualisation matérielle : il lance chaque Pod à l'intérieur d'une **MicroVM dédiée** (QEMU/Firecracker) dotée de son propre noyau Linux isolé. Kata offre une isolation matérielle maximale au prix d'une empreinte mémoire légèrement supérieure à gVisor.

**Exercice 2 :** Quel est le rôle de la directive `defaultAction: SCMP_ACT_ERRNO` dans un profil Seccomp Linux ?

**Corrigé :** La directive `defaultAction: SCMP_ACT_ERRNO` applique une politique de sécurité de type **Deny-All (Liste Blanche)**. Tout appel système (syscall) qui n'est pas explicitement listé dans la section `SCMP_ACT_ALLOW` du profil est immédiatement bloqué par le noyau Linux, et renvoie une erreur système (`EPERM`) au conteneur, empêchant un attaquant d'exécuter des syscalls dangereux (ex: `reboot`, `kexec_load`).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Par défaut dans le runtime conteneurisé standard `runc`, que partagent tous les conteneurs s'exécutant sur le même nœud Kubernetes ?
- A) Le même noyau Linux unique de la machine hôte
- B) Le même mot de passe
- C) La même adresse IP publique
- D) Le même fichier document Word

**Réponse : A**

**Q2 :** Quel runtime de sandboxing développé par Google réimplémente l'interface des appels système du noyau Linux en langage Go (Userspace) pour isoler les conteneurs ?
- A) gVisor (runsc)
- B) MS-DOS
- C) Gzip
- D) Notepad

**Réponse : A**

**Q3 :** Quelle ressource Kubernetes permet aux administrateurs de déclarer plusieurs moteurs de runtime (ex: `runc`, `gvisor`, `kata-containers`) et de sélectionner le niveau d'isolement approprié pour chaque Pod ?
- A) RuntimeClass
- B) ConfigMap
- C) StorageClass
- D) Ingress

**Réponse : A**

**Q4 :** Quel mécanisme du noyau Linux permet d'interdire l'exécution d'appels système dangereux en restreignant les syscalls autorisés pour un conteneur ?
- A) Seccomp (Secure Computing Mode)
- B) USB Passthrough
- C) DHCP
- D) POP3

**Réponse : A**

**Q5 :** Quelle technologie de virtualisation ultra-légère est utilisée par Kata Containers pour exécuter chaque Pod Kubernetes dans une MicroVM dédiée en moins de 100 ms ?
- A) QEMU / Firecracker
- B) VMware ESXi complet
- C) VirtualBox GUI
- D) Hyper-V grand public

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
