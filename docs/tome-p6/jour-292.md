# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 292 (6h) : IoT Firmware Reverse Engineering (Binwalk, QEMU Emulation, Firmware Extraction, Root Shell Extraction & Memory Analysis)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **Reverse Engineering de Firmwares IoT (Internet of Things)** : extraire les systèmes de fichiers (SquashFS, CramFS) avec **Binwalk**, émuler des binaires d'architectures exotiques (MIPS, ARM) avec **QEMU**, découvrir les portes dérobées hardcodées, et réaliser des audits de sécurité de caméras, routeurs et objets connectés.
>
> **Compétences visées :** `IoT-02` (A) — Firmware Extraction & Analysis (Binwalk) | `IoT-03` (A) — Cross-Architecture Emulation (QEMU MIPS/ARM)

---

## 1) Module — Méthodologie d'Extraction de Firmware avec Binwalk (2h)

### 📖 Narration/Intuition

Les objets connectés (IoT) stockent leur système d'exploitation sous forme de fichier d'image binaire de firmware (`.bin`, `.img`). L'outil **Binwalk** scanne l'image à la recherche de signatures de systèmes de fichiers (SquashFS, JFFS2, YAFFS2) et d'en-têtes de noyaux Linux (uImage) pour décompresser l'arborescence complète du firmware sur disque.

---

## 2) Module — Extraction et Emulation QEMU (`firmware_reverse.sh`) (2h)

### 🛠️ Atelier Pratique

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Analyse des signatures et extraction avec Binwalk
# ═══════════════════════════════════════════════════════
binwalk router_firmware.bin

# Extraction automatique des systèmes de fichiers inclus
binwalk -e --matryoshka router_firmware.bin
cd _router_firmware.bin.extracted/squashfs-root/

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Recherche de secrets et de portes dérobées (Backdoors)
# ═══════════════════════════════════════════════════════
# Rechercher les hashs de mots de passe de shadow
cat etc/shadow

# Rechercher des identifiants hardcodés dans les scripts CGI/C
grep -rn "admin" etc/ usr/sbin/ www/ -i

# ═══════════════════════════════════════════════════════
# ÉTAPE 3 — Émulation dynamique d'un binaire MIPS avec QEMU
# ═══════════════════════════════════════════════════════
# Copier le binaire qemu-mips-static dans la racine du firmware
cp $(which qemu-mips-static) .

# Executer le serveur HTTP du routeur (MIPS) en émulation chroot local !
sudo chroot . ./qemu-mips-static ./usr/sbin/httpd
# Résultat : Le serveur Web du routeur s'exécute sur votre machine Linux x64 !
```

---

## 3) Module — Script Python d'Analyse Statique d'Image Firmware (`firmware_analyzer.py`) (2h)

```python
import os
import subprocess

# Script Python d'analyse de sécurité automatique de système de fichiers IoT (SquashFS)

def audit_iot_filesystem(root_dir: str):
    print(f"=== AUDIT DU SYSTÈME DE FICHIERS IOT : {root_dir} ===")

    # 1) Vérifier les bannières SSH/Telnet actives par défaut
    services = ["telnetd", "dropbear", "sshd"]
    for s in services:
        path = os.path.join(root_dir, f"usr/sbin/{s}")
        if os.path.exists(path):
            print(f"[!] DÉTECTION : Service d'accès distant présent : {s}")

    # 2) Vérifier la présence de clés SSH privées hardcodées
    for root, _, files in os.walk(root_dir):
        for f in files:
            if "id_rsa" in f or "id_dropbear" in f:
                print(f"[!] VULNÉRABILITÉ CRITIQUE : Clé SSH privée trouvée : {os.path.join(root, f)}")

audit_iot_filesystem("_router_firmware.bin.extracted/squashfs-root")
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Binwalk** | Outil d'analyse et d'extraction de systèmes de fichiers dans les images de firmwares |
| **SquashFS** | Système de fichiers compressé en lecture seule très utilisé dans les dispositifs IoT Linux |
| **QEMU** | Émulatuer processeur multi-architecture (MIPS, ARM, PPC, x86) |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel outil open-source est la référence incontournable pour scanner et extraire les systèmes de fichiers (SquashFS) intégrés dans une image binaire de firmware IoT ?
- A) Binwalk
- B) Wireshark
- C) Nmap
- D) Metasploit

**Réponse : A**

**Q2 :** Quel émulateur permet d'exécuter un binaire compilé pour une architecture **MIPS** ou **ARM** (ex: le binaire `httpd` d'un routeur) sur un PC de test x86_64 ?
- A) QEMU (`qemu-mips-static` / `qemu-arm-static`)
- B) VirtualBox
- C) VMware
- D) Docker

**Réponse : A**

**Q3 :** Quel est le système de fichiers compressé en lecture seule le plus fréquemment rencontré lors de la décompaction de firmwares d'équipements réseau grand public ?
- A) SquashFS
- B) NTFS
- C) EXT4
- D) FAT32

**Réponse : A**

**Q4 :** Pourquoi la présence de clés SSH privées (ex: `id_rsa`) dans l'image de firmware distribuée par un constructeur constitue-t-elle une vulnérabilité majeure ?
- A) Parce que tous les équipements de ce modèle partagent la même clé privée hardcodée, permettant à quiconque extrait le firmware de s'authentifier sur tous les dispositifs déployés
- B) Parce que cela ralentit le Wi-Fi
- C) Parce que la clé prend trop de place
- D) Parce qu'elle efface les données

**Réponse : A**

**Q5 :** Dans la structure d'un binaire de firmware Linux, quel composant gère l'initialisation du système et le chargement du binaire du noyau ?
- A) Le bootloader (ex: u-boot / uImage)
- B) Le navigateur web
- C) Le fichier `/etc/hosts`
- D) Le serveur DNS

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
