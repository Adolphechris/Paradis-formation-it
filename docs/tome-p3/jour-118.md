# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 118 (6h) : Sécurité de la Virtualisation & Hyperviseurs Cloud (KVM, QEMU, Firecracker MicroVMs & Isolation Matérielle)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'architecture et la sécurité des hyperviseurs de virtualisation bare-metal et cloud : KVM (Kernel-based Virtual Machine), QEMU, durcissement libvirt, micro-virtualisation haute performance avec AWS Firecracker et protection contre les attaques par canal auxiliaire (Spectre/Meltdown/L1TF).
>
> **Compétences visées :** `BIT-09` (A) — Virtualisation KVM & Hyperviseurs | `SEC-03` (A) — Sécurité & Isolement des Hyperviseurs

---

## 1) Module — Virtualisation KVM & Hyperviseurs Type 1 (2h)

### 📖 Narration/Intuition

Dans les Datacenters de la Banque Centrale du Congo, la virtualisation est le socle de l'infrastructure. Un **hyperviseur de Type 1 (Bare-Metal)** s'exécute directement au niveau du matériel serveur avec les extensions de virtualisation du processeur (Intel VT-x / AMD-V).

**KVM (Kernel-based Virtual Machine)** transforme le noyau Linux en un hyperviseur de Type 1 ultra-performant où chaque machine virtuelle (VM) est gérée comme un processus Linux standard isolé avec la technologie **QEMU** pour l'émulation des périphériques I/O.

### 🔍 Anatomie Technique

**Architecture de Virtualisation KVM / QEMU :**

```
┌─────────────────────────────────────────────────────────────┐
│                    USERSPACE (QEMU / LIBVIRT)               │
│  - Processus qemu-system-x86_64 (Un processus par VM)       │
│  - Gestionnaire libvirtd / virt-manager                     │
└──────────────┬──────────────────────────────┬───────────────┘
               │ ioctl /dev/kvm               │
┌──────────────▼──────────────────────────────▼───────────────┐
│                    KERNELSPACE (KVM MODULES)                │
│  - kvm.ko + kvm_intel.ko / kvm_amd.ko                       │
│  - Commutation directe des modes d'exécution CPU (VMX)      │
└──────────────┬──────────────────────────────────────────────┘
               │ Hardware Extensions (VT-x / AMD-V)
┌──────────────▼──────────────────────────────────────────────┐
│                    MATÉRIEL SERVEUR (BARE-METAL)            │
│  - CPU Intel Xeon / AMD EPYC + RAM + Disques NVMe          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — MicroVMs & Serverless Isolation avec AWS Firecracker (2h)

### 📖 Narration/Intuition

Les hyperviseurs QEMU traditionnels sont lourds et mettent plusieurs secondes à démarrer une VM avec des milliers de lignes de code d'émulation de vieux périphériques matériels (lecteurs de disquettes, cartes son).

**Firecracker** est un Virtual Machine Monitor (VMM) open-source développé en Rust par AWS pour alimenter AWS Lambda et Fargate. Il permet de créer des **MicroVMs** minimalistes qui démarrent en **moins de 5 millisecondes** avec une consommation mémoire de seulement 5 Mo par VM, tout en garantissant une sécurité d'isolation matérielle stricte.

### 🔍 Anatomie Technique

**Comparaison QEMU vs Firecracker MicroVMs :**

```
QEMU TRADITIONNEL :
- Temps de démarrage : 2 à 10 secondes
- Taille binaire / Périphériques : Émulation matérielle complète (IDE, ACPI, USB, PCI)
- Langage : C (Surface d'attaque importante)

AWS FIRECRACKER MICROVM :
- Temps de démarrage : < 5 millisecondes
- Taille binaire / Périphériques : Strict minimum (virtio-net, virtio-block, vsock, serial)
- Langage : Rust (Sécurité mémoire garantie, zéro Buffer Overflow)
```

**Commande d'administration Firecracker via API REST (`firecracker_api.sh`) :**

```bash
# 1. Démarrer le processus Firecracker sur un socket Unix
firecracker --api-sock /tmp/firecracker.socket &

# 2. Configurer le noyau Linux minimaliste via l'API REST de Firecracker
curl --unix-socket /tmp/firecracker.socket -i \
  -X PUT 'http://localhost/boot-source' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
        "kernel_image_path": "/var/lib/firecracker/vmlinux",
        "boot_args": "console=ttyS0 reboot=k panic=1 pci=off"
      }'

# 3. Démarrer la MicroVM
curl --unix-socket /tmp/firecracker.socket -i \
  -X PUT 'http://localhost/actions' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{ "action_type": "InstanceStart" }'

echo "✅ MicroVM Firecracker démarrée en < 5ms !"
```

---

## 3) Module — Durcissement des Hyperviseurs & Protections CPU (Spectre/Meltdown) (2h)

### 📖 Narration/Intuition

Sur un hyperviseur partagé, des attaques physiques au niveau du processeur (Side-Channel Attacks comme **Spectre, Meltdown, L1TF, MDS**) permettent à une VM malveillante de lire la mémoire vive d'une VM voisine ou du noyau de l'hyperviseur en exploitant l'exécution spéculative des processeurs modernes.

Le durcissement de l'hyperviseur KVM exige d'activer la mitigation du noyau Linux et d'isoler la mémoire des VMs (sVirt / SELinux).

### 🔍 Anatomie Technique

**Durcissement du fichier de configuration KVM Libvirt (`/etc/libvirt/qemu.conf`) :**

```ini
# Durcissement du processus d'exécution QEMU/KVM
user = "root"
group = "root"

# Activer l'isolation de sécurité sVirt / SELinux pour chaque VM
security_driver = "selinux"

# Désactiver le partage de mémoire inter-VMs (KSM - Kernel Samepage Merging)
# Empêche les attaques par canal auxiliaire de fuite de mémoire (Side-Channel)
# /sys/kernel/mm/ksm/run = 0

# Interdire l'utilisation d'éléments de périphérique graphiques inutiles
vnc_listen = "127.0.0.1"
spice_listen = "127.0.0.1"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **VMM** | Virtual Machine Monitor — Moteur de gestion et d'émulation des machines virtuelles |
| **KVM** | Kernel-based Virtual Machine — Module noyau Linux transformant l'OS en hyperviseur Type 1 |
| **MicroVM** | Machine virtuelle ultra-léger et rapide exécutée par un VMM minimaliste (ex: Firecracker) |
| **Side-Channel Attack** | Attaque exploitant des fuites physiques du processeur (ex: Spectre/Meltdown) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi le langage **Rust** utilisé pour développer AWS Firecracker apporte-t-il un niveau de sécurité supérieur par rapport au langage **C** utilisé dans QEMU ?

**Corrigé :** Le langage **C** exige une gestion manuelle de la mémoire (allocations/libérations), ce qui expose le code aux vulnérabilités logicielles les plus graves (Buffer Overflows, Use-After-Free, Double Free). Le langage **Rust** possède un système de gestion de mémoire par **possession et emprunt (Ownership & Borrow Checker)** vérifié à la compilation. Rust empêche physiquement toutes les erreurs d'accès mémoire et de corruption sans nécessiter de Garbage Collector, éliminant d'un coup toute une classe de vulnérabilités critiques dans l'hyperviseur.

**Exercice 2 :** Quel est le rôle de la technologie **sVirt** dans un hyperviseur Linux KVM ?

**Corrigé :** **sVirt** intègre le système de sécurité **SELinux** ou **AppArmor** avec l'hyperviseur KVM/libvirt. sVirt attribue une étiquette de sécurité (Category Label) unique et aléatoire à chaque processus `qemu` de machine virtuelle. Même si un attaquant réussit à sortir d'une VM et à compromettre le processus `qemu` associé, les règles sVirt SELinux bloquent physiquement ce processus s'il tente d'accéder aux fichiers de disque ou à la mémoire des autres VMs s'exécutant sur le même serveur.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel module du noyau Linux transforme l'OS en hyperviseur de Type 1 ultra-performant utilisant les extensions matérielles des processeurs (Intel VT-x / AMD-V) ?
- A) KVM (Kernel-based Virtual Machine)
- B) MS-DOS
- C) Paint
- D) POP3

**Réponse : A**

**Q2 :** Quel Virtual Machine Monitor (VMM) open-source développé en langage Rust par AWS permet de démarrer des MicroVMs isolées en moins de 5 millisecondes pour des architectures Serverless ?
- A) Firecracker
- B) VirtualBox GUI
- C) QEMU complet de 1998
- D) VMware Workstation grand public

**Réponse : A**

**Q3 :** Pourquoi désactive-t-on le partage de mémoire inter-VMs (KSM - Kernel Samepage Merging) sur les hyperviseurs bancaires haute sécurité ?
- A) Pour prévenir les attaques par canal auxiliaire (Side-Channel / Spectre) qui pourraient lire la mémoire d'une VM voisine
- B) Pour ralentir la connexion Wi-Fi
- C) Pour économiser de l'encre d'imprimante
- D) Pour effacer les logs

**Réponse : A**

**Q4 :** Quel outil d'administration et service système sous Linux est le standard pour gérer le cycle de vie des machines virtuelles KVM via `virsh` ou `virt-manager` ?
- A) libvirt (libvirtd)
- B) Docker Daemon
- C) Gzip
- D) Apache HTTPD

**Réponse : A**

**Q5 :** Quelle fonctionnalité matérielle du processeur est indispensable pour exécuter des hyperviseurs de Type 1 KVM avec des performances quasi-natives ?
- A) Extensions de virtualisation matérielle CPU (Intel VT-x / AMD-V)
- B) Carte graphique 4K
- C) Connecteur d'antenne TV
- D) Port parallèle d'imprimante

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
