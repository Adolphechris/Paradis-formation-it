# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 101 (6h) : Linux Advanced Kernel Internals & eBPF (Extended Berkeley Packet Filter)

> [!NOTE]
> **Objectif du jour :** Comprendre le fonctionnement interne du noyau Linux moderne (Kernel Internals) et maîtriser eBPF (Extended Berkeley Packet Filter) : architecture, vérificateur de bytecode, maps eBPF, traçage de système d'appels (syscalls), observabilité réseau et sécurité kernel-space sans recompiler le noyau.
>
> **Compétences visées :** `BIT-09` (A) — Linux Kernel Internals | `SEC-04` (A) — Observabilité & Sécurité eBPF

---

## 1) Module — Linux Kernel Internals & Architecture eBPF (2h)

### 📖 Narration/Intuition

Pour observer ou sécuriser un système Linux classique, on devait traditionnellement écrire des **modules noyau (Loadable Kernel Modules - LKM)** en C. C'était complexe et extrêmement risqué : un bug dans un LKM provoque un crash immédiat du serveur (Kernel Panic / Blue Screen).

**eBPF (Extended Berkeley Packet Filter)** est la révolution la plus importante du noyau Linux des 10 dernières années. Il permet d'exécuter du bytecode de manière dynamique et sécurisée à l'intérieur du noyau Linux, sans modifier le code source du noyau ni charger de modules risqués.

Grâce à un **vérificateur (Verifier)** intégré au noyau, eBPF garantit que le code injecté ne plantera jamais le système, ne bouclera pas indéfiniment et n'accédera pas à des zones mémoire interdites.

### 🔍 Anatomie Technique

**Architecture eBPF dans le Noyau Linux :**

```
┌─────────────────────────────────────────────────────────────┐
│                     USER SPACE (Espace Utilisateur)         │
│                                                             │
│  ┌────────────────────────┐   ┌──────────────────────────┐  │
│  │ Programme de Contrôle  │   │ Visualisation / Dashboard│  │
│  │ (Python/Go/bpftrace)   │   │ (Grafana / Cilium / Tetr)│  │
│  └───────────┬────────────┘   └────────────▲─────────────┘  │
└──────────────┼─────────────────────────────┼────────────────┘
               │ Syscall bpf()               │ Lecture
               │ (Chargement du bytecode)    │ eBPF Maps
┌──────────────▼─────────────────────────────┴────────────────┐
│                     KERNEL SPACE (Espace Noyau)             │
│                                                             │
│  ┌────────────────────────┐   ┌──────────────────────────┐  │
│  │ eBPF Verifier          │   │ eBPF Maps                │  │
│  │ (Sécurité & Intégrité) │   │ (Stockage Clé-Valeur    │  │
│  └───────────┬────────────┘   │  partagé Kernel/User)    │  │
│              │ JIT Compiler   └────────────▲─────────────┘  │
│              ▼                             │                │
│  ┌────────────────────────┐                │                │
│  │ Bytecode JIT (Native)  │────────────────┘                │
│  └───────────┬────────────┘                                 │
│              │                                              │
│  ┌───────────┴───────────────────────────────────────────┐  │
│  │ Points d'attache (Hooks) :                            │  │
│  │ - kprobes / kretprobes (Fonctions du noyau)           │  │
│  │ - tracepoints (Points d'audit statiques)              │  │
│  │ - XDP (Express Data Path - Traitement réseau ultra-fast)│
│  │ - socket filters / cgroup hooks                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Traçage Système avec bpftrace (2h)

### 📖 Narration/Intuition

`bpftrace` est un langage de script de haut niveau pour Linux eBPF, inspiré de DTrace (Solaris) et AWK. Il permet d'écrire en quelques lignes de commande des sondes de traçage du noyau pour surveiller les appels système (sys_enter_openat, sys_enter_execve), mesurer la latence disque ou intercepter la création de processus en temps réel.

### 🔍 Anatomie Technique

**Exemples de One-Liners et Scripts bpftrace pour l'Audit de Sécurité :**

```bash
# Installation de bpftrace et des en-têtes noyau sous Linux
sudo apt update && sudo apt install -y bpftrace linux-headers-$(uname -r)

# ─── 1. Intercepter l'exécution de tout nouveau processus (Détection d'intrusion) ──
# Écoute les appels système execve et affiche le PID, la commande et l'utilisateur
sudo bpftrace -e 'tracepoint:syscalls:sys_enter_execve { printf("PID %d (%s) a exécuté : %s\n", pid, comm, str(args->filename)); }'

# ─── 2. Mesurer la latence d'accès aux disques I/O (Histogramme) ───────────────
sudo bpftrace -e 'kprobe:vfs_read { @start[tid] = nsecs; } kretprobe:vfs_read /@start[tid]/ { @us = hist((nsecs - @start[tid]) / 1000); delete(@start[tid]); }'

# ─── 3. Détecter les ouvertures de fichiers sensibles (/etc/shadow, /etc/passwd) ─
sudo bpftrace -e 'tracepoint:syscalls:sys_enter_openat /str(args->filename) == "/etc/shadow"/ { printf("🚨 ALERTE SECURITE: PID %d (%s) tente de lire /etc/shadow !\n", pid, comm); }'
```

---

## 3) Module — Traitement Réseau Ultra-Rapide avec XDP (Express Data Path) (2h)

### 📖 Narration/Intuition

En cas d'attaque par déni de service (DDoS) volumétrique à plusieurs millions de paquets par seconde, le noyau Linux classique consomme énormément de CPU uniquement pour allouer de la mémoire (`sk_buff`) et faire monter les paquets le long de la pile réseau TCP/IP avant que le pare-feu (iptables/nftables) ne puisse les filtrer.

**XDP (Express Data Path)** est une technologie eBPF qui permet d'exécuter un programme eBPF directement au niveau du **pilote de la carte réseau (NIC Driver)**, *avant* que le noyau Linux n'alloue la moindre structure de données. Il permet de rejeter (DROP) des millions de paquets malveillants par seconde avec une consommation CPU quasi-nulle.

### 🔍 Anatomie Technique

**Script eBPF/XDP de filtrage anti-DDoS en C (`xdp_drop_filter.c`) :**

```c
#include <linux/bpf.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <bpf/bpf_helpers.h>

// Code eBPF XDP exécuté directement dans la carte réseau (Driver level)
SEC("xdp")
int xdp_firewall_filter(struct xdp_md *ctx) {
    void *data_end = (void *)(long)ctx->data_end;
    void *data     = (void *)(long)ctx->data;

    struct ethhdr *eth = data;
    if ((void *)(eth + 1) > data_end)
        return XDP_PASS;

    // Vérifier si le paquet est de type IPv4
    if (eth->h_proto != __constant_htons(ETH_P_IP))
        return XDP_PASS;

    struct iphdr *iph = (void *)(eth + 1);
    if ((void *)(iph + 1) > data_end)
        return XDP_PASS;

    // Bloquer les paquets venant d'une IP d'attaque connue (ex: 196.200.15.99)
    // 0x990FC8C4 correspond à l'adresse IP en binaire (Network Byte Order)
    if (iph->saddr == __constant_htonl(0xC4C80F99)) {
        // XDP_DROP rejette le paquet instantanément sans traitement kernel
        return XDP_DROP;
    }

    return XDP_PASS;
}

char _license[] SEC("license") = "GPL";
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **eBPF** | Extended Berkeley Packet Filter — Moteur d'exécution dynamique sécurisé au cœur du noyau Linux |
| **XDP** | Express Data Path — Point d'attache eBPF réseau ultra-rapide au niveau de la carte réseau |
| **JIT** | Just-In-Time Compiler — Compilateur à la volée du bytecode eBPF en instructions machine natives |
| **LKM** | Loadable Kernel Module — Module noyau chargeable traditionnel |
| **kprobe / kretprobe** | Sonde dynamique d'entrée/sortie sur n'importe quelle fonction du noyau Linux |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi la technologie eBPF/XDP est-elle infiniment plus performante que les pare-feux traditionnels (iptables/nftables) pour contrer des attaques DDoS volumétriques ?

**Corrigé :** Un pare-feu traditionnel (iptables/nftables) intervient dans la pile réseau du noyau Linux **après** que la carte réseau a généré une interruption matérielle et que le noyau a alloué de la mémoire pour la structure de paquet `sk_buff`. Lors d'une attaque à des millions de paquets/sec, l'allocation mémoire et les interruptions saturent la CPU de l'hôte. **XDP** s'exécute directement dans le pilote de la carte réseau **avant** l'allocation mémoire `sk_buff`. Les paquets malveillants sont rejetés (`XDP_DROP`) en quelques cycles CPU, permettant d'absorber des attaques massives sans ralentir le serveur.

**Exercice 2 :** Quel est le rôle du **Vérificateur (Verifier)** eBPF lors du chargement d'un programme dans le noyau Linux ?

**Corrigé :** Le vérificateur eBPF effectue une analyse statique approfondie du bytecode eBPF avant d'autoriser son exécution dans le noyau. Il garantit que : 1) Le programme ne contient pas de boucles infinies qui bloqueraient le processeur, 2) Toutes les instructions et accès mémoire restent dans des bornes autorisées (pas de Null Pointer Dereference ou hors-limites), 3) Le programme possède une taille limitée et se termine obligatoirement. Si une violation est détectée, le chargement est rejeté.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle technologie du noyau Linux moderne permet d'exécuter du bytecode personnalisé directement dans le noyau de façon sécurisée sans avoir à recompiler le noyau ni charger de modules LKM risqués ?
- A) eBPF
- B) MS-DOS
- C) GRUB
- D) NTFS

**Réponse : A**

**Q2 :** Quel hook (point d'attache) eBPF offre les performances de traitement réseau les plus rapides en s'exécutant directement au niveau du pilote de la carte réseau (NIC Driver) ?
- A) kretprobe
- B) XDP (Express Data Path)
- C) tracepoint
- D) sys_exit

**Réponse : B**

**Q3 :** Comment les programmes eBPF et les applications de l'espace utilisateur (User Space) partagent-ils des données, des compteurs et des états en temps réel ?
- A) Par envoi de fichiers texte par e-mail
- B) En utilisant des structures de clés-valeurs partagées appelées eBPF Maps
- C) Via des disquettes 3.5 pouces
- D) En redémarrant le serveur

**Réponse : B**

**Q4 :** Quel outil en ligne de commande utilise un langage de script concis (inspiré d'AWK et DTrace) pour créer rapidement des sondes de traçage eBPF sur le noyau Linux ?
- A) bpftrace
- B) ping
- C) nano
- D) fdisk

**Réponse : A**

**Q5 :** Quelle action de retour d'un programme eBPF XDP indique à la carte réseau de rejeter immédiatement le paquet sans lui laisser intégrer la pile TCP/IP du noyau ?
- A) XDP_PASS
- B) XDP_DROP
- C) XDP_TX
- D) XDP_REDIRECT

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
