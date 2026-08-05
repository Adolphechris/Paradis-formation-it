# SEMESTRE 1 — Jour 07 (6h) : Architecture Matérielle & Couches Système

> [!NOTE]
> **Objectif de la journée** : Démystifier le fonctionnement physique d'un serveur et comprendre la chaîne de démarrage depuis le bouton d'alimentation jusqu'au chargement des modules du noyau Linux.
> **Compétences visées** : `BIT-01` (Niveau Cible: A) — Architecture matérielle et couches bas niveau.

---

## 1) CPU, RAM, et Bus Système (2h00)

### 📖 1.1 Narration & Intuition
Imaginez un restaurant ultra-rapide. Le CPU est le Chef Cuisinier. Les cœurs (cores) sont les sous-chefs, et les threads sont leurs bras (Hyper-Threading). La RAM est le plan de travail de la cuisine : très rapide mais de taille limitée. Le stockage (HDD, SSD NVMe) est le grand frigo au sous-sol : énorme, mais il faut du temps pour y aller. Le bus PCIe est le monte-charge ultra-rapide qui relie le sous-sol à la cuisine. Sans un bus rapide, le chef le plus étoilé attendra ses ingrédients.

### 🔍 1.2 Anatomie Technique
- **CPU** : Architecture x86_64, registres, cache L1/L2/L3.
- **RAM** : Volatile, accès direct (Random Access).
- **Stockage** : HDD (mécanique, lent, séquentiel) vs SSD NVMe (NAND flash, connecté directement au bus PCIe).
- **PCIe (Peripheral Component Interconnect Express)** : Lignes de communication série point-à-point, mesurées en *lanes* (x1, x4, x8, x16).

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Explorer le CPU en détail
lscpu

# Vérifier la quantité et l'utilisation de la RAM
free -h

# Lister les périphériques connectés au bus PCI (cartes réseau, contrôleurs NVMe, etc.)
lspci -tv

# Examiner les disques et leur type
lsblk -d -o name,rota,type,size
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
**Problème** : Serveur lent malgré un CPU inoccupé.
**Réflexe** : Vérifier si le système "swap" (utilise le disque comme de la RAM) parce que la RAM est pleine. `free -m` (regarder la ligne Swap).

---

## 2) Firmware : BIOS/UEFI et MBR/GPT (2h00)

### 📖 2.1 Narration & Intuition
Avant même que l'OS ne sache qu'il existe, le matériel doit s'éveiller. L'UEFI est le "chef de gare" moderne qui initialise les composants et cherche le train (le chargeur d'amorçage) sur le bon quai (la partition EFI). Le MBR est l'ancien plan de la gare (limité, vieux), tandis que le GPT est le plan moderne qui permet des milliards de quais et des trains immenses (disques > 2 To).

### 🔍 2.2 Anatomie Technique
- **BIOS/MBR** : Ancien standard, limite de 4 partitions primaires, 2 To max par disque. Le code d'amorçage est dans le premier secteur du disque (Master Boot Record).
- **UEFI/GPT** : Remplaçant moderne. Supporte le Secure Boot. Nécessite une partition ESP (EFI System Partition) formatée en FAT32 pour stocker les exécutables de boot (`.efi`).

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Vérifier si on est démarré en UEFI ou BIOS (Legacy)
# Si le dossier existe, c'est de l'UEFI
ls -l /sys/firmware/efi

# Voir la table de partition d'un disque (GPT ou DOS/MBR)
sudo fdisk -l /dev/sda
# ou pour un NVMe
sudo fdisk -l /dev/nvme0n1
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
**Problème** : "No bootable device found" après un clone de disque.
**Réflexe** : Vérifier que le disque de destination est bien en GPT si le serveur est configuré en UEFI Only, et que la partition EFI (ESP) est bien présente et marquée comme bootable.

---

## 3) Noyau Linux : Kernel, GRUB et Modules (2h00)

### 📖 3.1 Narration & Intuition
L'OS, c'est le noyau (Kernel). Il est le grand chef d'orchestre. Mais il ne sait pas tout faire de base pour ne pas être trop lourd. S'il rencontre une nouvelle carte réseau, il charge son "manuel d'instructions" à la volée : c'est un module (driver). GRUB, quant à lui, est le majordome qui, juste après l'UEFI, vous présente le menu pour choisir quel noyau charger en mémoire.

### 🔍 3.2 Anatomie Technique
- **GRUB (GRand Unified Bootloader)** : Chargeur d'amorçage. Fichier de config principal `/boot/grub/grub.cfg` (généré) et `/etc/default/grub` (à modifier).
- **Kernel** : Fichier `vmlinuz-xxx` dans `/boot`.
- **Modules** : Fichiers `.ko` (Kernel Object) situés dans `/lib/modules/$(uname -r)/`.

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Voir la version exacte du noyau chargé
uname -r

# Lister tous les modules (drivers) actuellement chargés
lsmod | head -n 10

# Obtenir des infos sur un module spécifique (ex: driver réseau e1000e ou clavier usb)
modinfo usbhid

# Charger un module manuellement (s'il n'est pas chargé)
sudo modprobe dummy
lsmod | grep dummy

# Décharger le module
sudo modprobe -r dummy
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
**Problème** : Un périphérique (ex: clé Wi-Fi USB) n'est pas reconnu.
**Réflexe** : Faire un `dmesg -w` puis brancher la clé. Regarder les logs du noyau en direct. Si le module manque, chercher le nom du chipset et installer le paquet firmware correspondant, puis faire un `modprobe`.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Audit Matériel et Boot
- **Consigne** : Rédigez un mini-rapport texte sur votre propre machine (ou VM). Donnez : l'architecture CPU, la taille de la RAM, si vous êtes en BIOS ou UEFI, et le nom du driver de votre carte réseau.
- **Livrables à produire** : Un fichier `audit_hardware.txt`.
- **Corrigé détaillé & Guidé** :
  1. CPU : `lscpu | grep "Architecture"`
  2. RAM : `free -m`
  3. Boot : `[ -d /sys/firmware/efi ] && echo "UEFI" || echo "BIOS"`
  4. Réseau : `lspci -k | grep -iA 2 net` ou `ip link` suivi de `ethtool -i <interface>` (nécessite ethtool).

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. QCM: Quelle est la fonction principale du bus PCIe ?
A) Stocker les données de façon permanente
B) Relier le CPU aux composants à haute vitesse (GPU, NVMe)
C) Refroidir le processeur
D) Remplacer la RAM
*Réponse : B*

2. QCM: Quel format de table de partition permet des disques de plus de 2 To ?
A) FAT32
B) MBR
C) NTFS
D) GPT
*Réponse : D*

3. QCM: Comment vérifier la quantité de mémoire vive (RAM) disponible sous Linux ?
A) `lsram`
B) `free -m`
C) `df -h`
D) `lspci`
*Réponse : B*

4. QCM: Quel est le rôle de la commande `modprobe` ?
A) Formater un disque
B) Recompiler le noyau
C) Charger ou décharger intelligemment un module du noyau
D) Sonder la température du CPU
*Réponse : C*

5. QCM: Quel répertoire contient généralement les fichiers de boot et le noyau Linux ?
A) `/etc`
B) `/sys`
C) `/boot`
D) `/var`
*Réponse : C*
