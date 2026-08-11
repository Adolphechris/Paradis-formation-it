# TOME P11 — DevSecOps & Cloud Security — Jour 458 (6h) : Container Security & Runtime Isolation (Docker Hardening, Seccomp, AppArmor, gVisor/Kata Containers & Falco Runtime Detection)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre les risques d'**évasion de conteneur (Container Escape)** et d'accès au noyau hôte partagé
> - Configurer des profils de sécurité **Seccomp** (filtrage des syscalls) et **AppArmor/SELinux** pour conteneurs
> - Déployer des moteurs d'isolation renforcée en bac à sable : **gVisor** (Kernel in Userspace) et **Kata Containers** (MicroVMs)
> - Implémenter la détection de menaces Runtime avec **Falco** (eBPF / Syscall Inspection en temps réel)
>
> **Compétences visées :** `SEC-07` (A) — Container Isolation & Hardening, `SEC-04` (A) — Runtime Threat Detection

---

## Module 1 — Kernel Isolation & Profils Seccomp/AppArmor (2h)

### 📖 Intuition & Narration

Les conteneurs Docker/OCI ne sont pas des machines virtuelles : ils partagent tous le **même noyau Linux** (`kernel`) que l'hôte. Si un processus conteneurisé parvient à exploiter une vulnérabilité dans un appel système noyau (syscall) non restreint, il peut s'échapper du conteneur (**Container Escape**) et devenir `root` sur la machine hôte.

Pour empêcher cela, on réduit la surface d'attaque noyau en filtrant les syscalls autorisés via **Seccomp** et les accès fichiers via **AppArmor**.

### 🔍 Anatomie Technique — Seccomp Profile

```json
// /etc/seccomp/custom-restricted.json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "architectures": [
    "SCMP_ARCH_X86_64"
  ],
  "syscalls": [
    {
      "names": [
        "read", "write", "exit", "execve", "futex",
        "epoll_wait", "clock_gettime", "fstat"
      ],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
```

---

## Module 2 — MicroVMs & Isolation bac à sable (gVisor & Kata) (2h)

### 🔍 Anatomie Technique — Technologies d'Isolation Conteneurs

```
SOLUTIONS D'ISOLATION CONTENEURS

  1. CONTENEURS STANDARD (runc)
     └── Partage direct du noyau Linux hôte (Rapide, mais surface d'attaque noyau partagée)

  2. gVISOR (runsc — Google)
     └── Intercepte tous les syscalls et les réimplémente dans un noyau virtuel en User-space (Go)
     └── Aucune exécution directe de syscall dangereux sur le noyau hôte !

  3. KATA CONTAINERS (kata-runtime)
     └── Lance chaque pod/conteneur dans sa propre MicroVM hyper-visée (QEMU/Cloud-Hypervisor)
     └── Noyau Linux dédié par conteneur — Isolation matérielle (VT-x/AMD-v)
```

---

## Module 3 — Falco : Détection de Menaces Runtime via eBPF (1h30)

### 🛠️ Atelier Pratique — Règle de Détection Falco

```yaml
# /etc/falco/falco_rules.local.yaml
- rule: Terminal Shell Executed in Container
  desc: Detection de l'ouverture d'un shell interactif dans un conteneur de production
  condition: >
    spawned_process and
    container and
    shell_procs and
    not user_expected_shell_execution
  output: >
    ALERT Shell interactif ouvert dans le conteneur !
    (user=%user.name user_loginuid=%user.loginuid process=%proc.name parent=%proc.pname
     cmdline=%proc.cmdline container_id=%container.id container_name=%container.name
     image=%container.image.repository)
  priority: WARNING
  tags: [container, shell, mitre_execution]
```

```bash
# Lancement de Falco avec eBPF probe
falco -c /etc/falco/falco.yaml -o "engine.kind=ebpf"
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **eBPF** | Extended Berkeley Packet Filter — Technologie noyau Linux permettant d'exécuter des programmes sécurisés dans le noyau sans recompiler |
| **Seccomp** | Secure Computing Mode — Fonctionnalité noyau Linux filtrant les appels système autorisés pour un processus |
| **runc** | Runtime de conteneur OCI bas niveau par défaut utilisé par Docker et containerd |

---

## Exercices Pratiques

### Exercice 1 — Privileged Container Risks

Pourquoi l'option `docker run --privileged` est-elle considérée comme extrêmement dangereuse en production ?

**Corrigé guidé :** L'option `--privileged` désactive toutes les protections Seccomp, AppArmor et Linux Capabilities du conteneur. Elle donne au conteneur l'accès direct à tous les périphériques matériels de l'hôte (`/dev/*`) et permet au processus conteneurisé de monter des systèmes de fichiers hôtes ou de charger des modules noyau, rendant l'**évasion de conteneur (Container Escape) équivalente à un accès root immédiat sur l'hôte**.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la différence fondamentale d'architecture entre **gVisor** et un conteneur Docker standard ?

- A) gVisor ne fonctionne que sur Windows
- B) gVisor intercepte les syscalls et s'exécute dans un noyau utilisateur virtuel (User-space), évitant l'accès direct au noyau hôte ✅
- C) gVisor est écrit en langage assembleur pur
- D) gVisor désactive le réseau

**Q2.** Les **Kata Containers** utilisent quelle technologie pour isoler les conteneurs ?

- A) Des chroot basiques
- B) Des MicroVMs dédiées hébergées par un hyperviseur (isolation matérielle) ✅
- C) Des cartes SIM virtuelles
- D) Des fichiers ZIP chiffrés

**Q3.** La technologie **eBPF** utilisée par Falco permet de :

- A) Recompiler le noyau Linux à chaque minute
- B) Inspecter les appels système et les événements réseau en temps réel dans le noyau de manière ultra-performante et sécurisée ✅
- C) Supprimer les images Docker non utilisées
- D) Générer des certificats SSL

**Q4.** Le rôle d'un profil **Seccomp** est de :

- A) Limiter l'utilisation de la mémoire RAM
- B) Définir la liste blanche des appels système (syscalls) qu'un processus est autorisé à exécuter sur le noyau Linux ✅
- C) Modifier l'adresse IP du conteneur
- D) Télécharger les dépendances Python

**Q5.** Une alerte **Falco** déclenchée pour "Terminal Shell Executed in Container" signale :

- A) Un arrêt normal du conteneur
- B) Qu'un utilisateur ou un attaquant a ouvert un shell (ex: `/bin/bash`) à l'intérieur d'un conteneur en cours d'exécution ✅
- C) Une panne du disque dur
- D) Une mise à jour du système d'exploitation

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
