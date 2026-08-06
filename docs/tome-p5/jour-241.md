# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 241 (6h) : Security Engineering & Durcissement du Kernel Linux (eBPF LSM, Seccomp-BPF, Profiles AppArmor/SELinux & Kernel Self Protection Project KSPP)

> [!NOTE]
> **Objectif du jour :** Maîtriser le durcissement de sécurité du noyau Linux (**Kernel Hardening**) pour protéger les nœuds de calcul de la BCC : implémentation de politiques d'accès au niveau noyau avec **eBPF LSM (Linux Security Modules)**, restriction des appels système (**Syscalls**) avec **Seccomp-BPF**, confinement applicatif avec **AppArmor**, et application des recommandations du **Kernel Self Protection Project (KSPP)**.
>
> **Compétences visées :** `SEC-04` (A) — Linux Kernel Security Hardening & Seccomp-BPF | `SEC-05` (A) — eBPF LSM Policy Enforcement & AppArmor Profile Design

---

## 1) Module — KSPP & Hardening des Paramètres Kernel (2h)

### 📖 Narration/Intuition

Le noyau Linux est le composant central qui contrôle l'accès à la mémoire, au processeur, aux périphériques et au réseau. Si le noyau d'un serveur de la BCC est compromis via un exploit local (ex: Use-After-Free ou Buffer Overflow dans le kernel), tous les mécanismes de sécurité utilisateurs (conteneurs, namespaces, permissions de fichiers) deviennent inefficaces.

Le **Kernel Self Protection Project (KSPP)** préconise de durcir la configuration du noyau pour rendre l'exploitation de failles du kernel extrêmement difficile, voire impossible.

### 🔍 Anatomie Technique

**Paramètres Sysctl de Durcissement du Kernel (`/etc/sysctl.d/99-kernel-hardening.conf`) :**

```ini
# 1. Empêcher la révélation des adresses mémoire du kernel (Anti-KASLR Bypass)
kernel.kptr_restrict = 2

# 2. Restreindre dmesg aux seuls utilisateurs disposant de CAP_SYS_ADMIN
kernel.dmesg_restrict = 1

# 3. Restreindre l'utilisation de eBPF non-privilégié (Empêche l'injection eBPF par un user simple)
kernel.unprivileged_bpf_disabled = 1

# 4. Activer JIT Hardening pour eBPF (Empêche JIT Spraying attacks)
net.core.bpf_jit_harden = 2

# 5. Désactiver les fonctionnalités d'exécution du kernel vulnérables
kernel.sysrq = 0
kernel.core_uses_pid = 1
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
fs.protected_fifos = 2
fs.protected_regular = 2

# 6. Mitigations contre les attaques d'exécution spéculative (Spectre / Meltdown)
spec_store_bypass_disable = on
```

---

## 2) Module — Restriction des Syscalls avec Seccomp-BPF (2h)

### 📖 Narration/Intuition

Le noyau Linux propose environ 350 **appels système (syscalls)**. Une application bancaire standard n'en a besoin que d'une trentaine (ex: `read`, `write`, `socket`).

**Seccomp-BPF (Secure Computing Mode)** permet de définir un filtre au niveau du noyau pour chaque conteneur ou processus, bloquant immédiatement tous les syscalls inutiles (ex: `ptrace`, `reboot`, `kexec_load`). Si un attaquant essaie d'exécuter un exploit exigeant un syscall interdit, le noyau tue sur-le-champ le processus (`SIGSYS`).

### 🛠️ Atelier Pratique

**Profil Seccomp-BPF Restreint pour Microservices BCC (`bcc-seccomp-profile.json`) :**

```json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "architectures": [
    "SCMP_ARCH_X86_64",
    "SCMP_ARCH_AARCH64"
  ],
  "syscalls": [
    {
      "names": [
        "accept4",
        "bind",
        "clone",
        "close",
        "epoll_create1",
        "epoll_ctl",
        "epoll_wait",
        "exit_group",
        "futex",
        "getpid",
        "getsockname",
        "listen",
        "read",
        "recvfrom",
        "sendto",
        "write"
      ],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
```

---

## 3) Module — Confinement AppArmor & Politiques eBPF LSM (2h)

### 🛠️ Atelier Pratique

**Profil AppArmor pour le Microservice Settlement (`/etc/apparmor.d/usr.bin.bcc-settlement`) :**

```apparmor
#include <tunables/global>

profile bcc-settlement /usr/bin/bcc-settlement flags=(attach_disconnected,enforce) {
  #include <abstractions/base>
  #include <abstractions/nameservice>

  # Autoriser la lecture des bibliothèques système uniquement
  /usr/bin/bcc-settlement mr,
  /lib/x86_64-linux-gnu/*.so* mr,
  /usr/lib/x86_64-linux-gnu/*.so* mr,

  # Autoriser l'accès aux configurations de l'application
  /etc/bcc/settlement.conf r,

  # Bloquer l'écriture dans tout répertoire sauf les logs applicatifs
  deny /etc/** w,
  deny /boot/** rw,
  deny /root/** rw,
  /var/log/bcc/settlement.log w,

  # Bloquer les syscalls de débogage et de ptrace (anti-reverse/injection)
  deny ptrace,
  deny capability sys_ptrace,
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **KSPP** | Kernel Self Protection Project — Initiative de durcissement natif du noyau Linux |
| **Seccomp-BPF** | Secure Computing Mode avec BPF — Filtrage des appels système Linux |
| **LSM** | Linux Security Module — Framework d'extension des politiques de sécurité du noyau |
| **Syscall** | System Call — Appel système exécuté par un processus vers le noyau Linux |
| **KASLR** | Kernel Address Space Layout Randomization — Randomisation de la mémoire noyau |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer le rôle du paramètre `kernel.unprivileged_bpf_disabled = 1` dans le durcissement du noyau Linux.

**Corrigé :** Par défaut sur certains systèmes Linux, des utilisateurs non-privilégiés peuvent charger des programmes eBPF dans le noyau. Cela crée un vecteur d'attaque permettant à un attaquant local d'exploiter des failles dans le vérificateur eBPF (eBPF Verifier) pour obtenir les droits root ou lire la mémoire du noyau (KASLR bypass). En définissant `kernel.unprivileged_bpf_disabled = 1`, seul l'utilisateur root ou les processus avec `CAP_BPF` / `CAP_SYS_ADMIN` peuvent charger des filtres et programmes eBPF, éliminant cette surface d'attaque pour les utilisateurs simples et les conteneurs non-privilégiés.

**Exercice 2 :** Quelle est la différence entre l'action par défaut `SCMP_ACT_KILL_PROCESS` et `SCMP_ACT_ERRNO` dans un profil Seccomp ?

**Corrigé :**
- `SCMP_ACT_KILL_PROCESS` : Tue immédiatement l'intégralité du processus s'il tente d'exécuter un appel système non autorisé. C'est le niveau de sécurité le plus strict (utilisé en production).
- `SCMP_ACT_ERRNO` : Bloque l'appel système et retourne un code d'erreur (`EPERM` / `EACCES`) à l'application sans la tuer. Utile lors des phases de test ou pour les applications capables de gérer élégamment le refus d'un syscall non critique.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel mécanisme du noyau Linux permet de restreindre la liste des appels système (syscalls) exécutables par un processus ou un conteneur ?
- A) Seccomp-BPF
- B) KASLR
- C) PAM
- D) Cron

**Réponse : A**

**Q2 :** Quel projet (KSPP) réunit la communauté Linux pour intégrer des défenses proactives directement au sein du code source du noyau ?
- A) Kernel Self Protection Project
- B) Linux Foundation Security
- C) OpenSSL Security Initiative
- D) Red Hat Hardening

**Réponse : A**

**Q3 :** Quelle fonctionnalité des modules de sécurité Linux (LSM) combinée à eBPF permet d'appliquer des politiques de sécurité dynamique directement dans le noyau sans recompiler le kernel ?
- A) eBPF LSM
- B) AppArmor classique
- C) IPTables
- D) SELinux statique

**Réponse : A**

**Q4 :** Que permet d'éviter la valeur `kernel.kptr_restrict = 2` ?
- A) La fuite des adresses mémoire des pointeurs du noyau vers des utilisateurs non privilégiés (protection anti-KASLR bypass)
- B) Le redémarrage du serveur
- C) La saturation de la swap
- D) Les attaques par déni de service SYN flood

**Réponse : A**

**Q5 :** Dans un profil AppArmor, quelle directive permet de refuser explicitement l'utilisation du mécanisme de traçage de processus (ptrace) ?
- A) `deny ptrace,`
- B) `allow ptrace,`
- C) `block trace,`
- D) `disable sys_ptrace,`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
