# SEMESTRE 1 — Jour 21 (6h) : Virtualisation KVM & Hyperviseurs Bas Niveau

> [!NOTE]
> **Objectif de la journée** : Comprendre et manipuler la virtualisation native sous Linux avec KVM, provisionner des machines virtuelles en ligne de commande et gérer l'allocation des ressources matérielles.
> **Compétences visées** : `BIT-01` (Niveau Cible: A), `BIT-02` (Niveau Cible: A) — Virtualisation matérielle, KVM et gestion d'hyperviseur.

---

## 1) Les Fondations : Hyperviseurs et KVM (1h30)

### 📖 1.1 Narration & Intuition
Imaginez un immeuble (le serveur physique). Sans virtualisation, l'immeuble entier est occupé par une seule entreprise (l'OS hôte), qui n'utilise souvent que 10% de l'espace. La virtualisation permet de diviser cet immeuble en plusieurs appartements distincts (les Machines Virtuelles - VM), chacun avec son propre locataire (OS invité). L'hyperviseur est le gestionnaire de l'immeuble, veillant à ce que chaque locataire ait de l'électricité, de l'eau (CPU, RAM) et que personne ne s'introduise chez l'autre.
- **Type 1 (Bare-Metal)** : Le gestionnaire possède l'immeuble directement (VMware ESXi, Proxmox).
- **Type 2 (Hosted)** : Le gestionnaire loue l'immeuble à un OS existant (VirtualBox, VMware Workstation).
KVM (Kernel-based Virtual Machine) transforme le noyau Linux en un hyperviseur de Type 1 redoutablement efficace.

### 🔍 1.2 Anatomie Technique
KVM est un module intégré au kernel Linux. Il s'appuie sur les instructions matérielles des processeurs (Intel VT-x ou AMD-V) pour isoler les VM avec une perte de performance quasi-nulle.
- **KVM** gère la virtualisation du CPU et de la mémoire (module noyau).
- **QEMU** simule les périphériques matériels (disques, cartes réseau, USB) pour la VM.
- **libvirt** est la couche d'orchestration de haut niveau (le chef d'orchestre) qui fournit les API et l'outil CLI `virsh`.

### 🛠️ 1.3 Atelier Pratique Hands-on
Vérifions d'abord la compatibilité de notre processeur et installons les outils.
```bash
# 1. Vérifier si la virtualisation matérielle est supportée (doit retourner > 0)
egrep -c '(vmx|svm)' /proc/cpuinfo

# 2. Vérifier si les modules KVM sont chargés
lsmod | grep kvm

# 3. Installer l'environnement de virtualisation (Debian/Ubuntu)
sudo apt update
sudo apt install qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils virtinst -y

# 4. Vérifier l'état du démon libvirtd
sudo systemctl status libvirtd

# 5. Ajouter l'utilisateur courant au groupe libvirt pour éviter sudo à chaque commande
sudo usermod -aG libvirt $(whoami)
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Erreur `virsh list` affiche "failed to connect to the hypervisor"** : Vous n'êtes pas dans le groupe `libvirt` ou le service `libvirtd` est arrêté. Vérifiez avec `sudo systemctl status libvirtd` et redémarrez votre session.
- **Processeur non compatible** : Si `egrep` renvoie 0, la virtualisation est désactivée dans le BIOS/UEFI de la machine hôte. Il faut redémarrer la machine physique et l'activer.

---

## 2) Déploiement CLI avec virt-install (1h30)

### 📖 2.1 Narration & Intuition
Créer une machine virtuelle avec une interface graphique (comme virt-manager) est rassurant, mais sur un serveur de production (souvent sans écran, dit "headless"), vous n'aurez qu'un terminal. `virt-install` est votre couteau suisse : en une seule commande de plusieurs lignes, vous pouvez définir le nombre de processeurs, la mémoire, le disque dur virtuel, et lancer l'installation d'un OS via une image ISO ou le réseau.

### 🔍 2.2 Anatomie Technique
La commande `virt-install` communique avec `libvirt`. Elle prend de nombreux arguments:
- `--name` : Le nom de la VM.
- `--ram` et `--vcpus` : Allocation des ressources.
- `--disk` : Emplacement et taille du disque virtuel (généralement format `.qcow2`).
- `--location` ou `--cdrom` : Source du système d'exploitation.
- `--network` : Configuration réseau (par défaut le pont `virbr0` géré par libvirt).

### 🛠️ 1.3 Atelier Pratique Hands-on
Déployons une petite VM en mode texte.
```bash
# 1. Télécharger une image ISO (exemple Alpine Linux, très légère)
wget https://dl-cdn.alpinelinux.org/alpine/v3.18/releases/x86_64/alpine-virt-3.18.4-x86_64.iso

# 2. Créer un disque virtuel de 2 Go
qemu-img create -f qcow2 alpine-disk.qcow2 2G

# 3. Lancer la création de la VM
virt-install \
  --name vm-alpine-test \
  --ram 512 \
  --vcpus 1 \
  --disk path=$(pwd)/alpine-disk.qcow2,format=qcow2 \
  --cdrom $(pwd)/alpine-virt-3.18.4-x86_64.iso \
  --os-variant albinelinux3.18 \
  --network default \
  --graphics vnc \
  --noautoconsole

# 4. Lister les VM actives
virsh list --all
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **La commande bloque sur "Starting install..."** : Si vous n'utilisez pas `--noautoconsole`, la commande attend que l'installation soit terminée, mais sans interface graphique, vous ne voyez rien. Utilisez `--noautoconsole` pour rendre la main au terminal.

---

## 3) Opérations Courantes et Gestion du Swap (2h00)

### 📖 3.1 Narration & Intuition
Une fois vos locataires (VMs) installés, vous devez gérer le bâtiment. Parfois, un locataire a besoin de plus de ressources. `virsh` est votre panneau de contrôle. De plus, que se passe-t-il si toutes vos VMs consomment plus de RAM que le serveur n'en possède physiquement ? Le serveur s'effondre (Out of Memory). Pour éviter cela, on utilise le **Swap** : un espace sur le disque dur qui sert de mémoire "de secours" quand la RAM est pleine. C'est plus lent, mais ça sauve la vie.

### 🔍 3.2 Anatomie Technique
`virsh` permet de tout contrôler : `start`, `shutdown` (envoi gracieux d'un signal ACPI), `destroy` (coupure électrique brute). 
Le fichier de définition d'une VM est en XML, stocké dans `/etc/libvirt/qemu/`.
Le Swap, quant à lui, peut être une partition dédiée ou un simple fichier. Linux déplace les pages mémoire inactives de la RAM vers le Swap.

### 🛠️ 3.3 Atelier Pratique Hands-on
Gérons notre VM et ajoutons du Swap à l'hôte.
```bash
# --- Gestion KVM avec virsh ---
# 1. Arrêter gracieusement la VM (si l'OS invité gère l'ACPI)
virsh shutdown vm-alpine-test

# 2. Forcer l'arrêt (équivalent de débrancher la prise)
virsh destroy vm-alpine-test

# 3. Modifier la configuration XML de la VM (ex: pour augmenter la RAM)
# (Ceci ouvrira l'éditeur par défaut, changez la balise <memory>)
# virsh edit vm-alpine-test

# 4. Supprimer complètement la VM
virsh undefine vm-alpine-test --remove-all-storage

# --- Création de mémoire virtuelle (Swap) sur l'hôte ---
# 1. Créer un fichier de 1 Go rempli de zéros
sudo dd if=/dev/zero of=/swapfile bs=1M count=1024

# 2. Sécuriser le fichier (seul root peut le lire)
sudo chmod 600 /swapfile

# 3. Formater le fichier en Swap
sudo mkswap /swapfile

# 4. Activer le Swap
sudo swapon /swapfile

# 5. Vérifier la RAM et le Swap disponibles
free -h
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **`virsh shutdown` ne fonctionne pas** : L'OS invité n'a pas les démons ACPI installés. Utilisez `virsh destroy` pour forcer l'arrêt.
- **Le swap disparait au redémarrage** : Le `swapon` est temporaire. Pour le rendre persistant, il faut l'ajouter au fichier `/etc/fstab` (nous verrons fstab en détail au Jour 23).

---

## 📚 Nouvelles Abréviations Rencontrées
- **KVM** : Kernel-based Virtual Machine
- **VM** : Virtual Machine
- **VT-x / AMD-V** : Virtualization Technology (Intel / AMD)
- **QCOW2** : QEMU Copy On Write v2 (Format de disque virtuel)

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Master of Puppets (virsh)
- **Consigne** : Vérifiez le support de virtualisation, créez une VM nommée `web-server` de 1Go de RAM, démarrez-la, puis détruisez-la et supprimez-la proprement. Créez ensuite un fichier swap de 512 Mo.
- **Livrables à produire** : Fichier texte contenant l'historique de vos commandes (`history`).
- **Corrigé détaillé & Guidé** :
```bash
# Vérification
egrep -c '(vmx|svm)' /proc/cpuinfo
# Création d'un disque bidon (pour la forme)
qemu-img create -f qcow2 web.qcow2 1G
# Création VM (sans installation)
virt-install --name web-server --ram 1024 --vcpus 1 --disk path=$(pwd)/web.qcow2 --os-variant generic --network default --graphics none --import --noautoconsole
# Arrêt forcé (car on a pas installé d'OS qui répond à ACPI)
virsh destroy web-server
# Nettoyage
virsh undefine web-server --remove-all-storage
# Création swap
sudo dd if=/dev/zero of=/swapfile2 bs=1M count=512
sudo chmod 600 /swapfile2
sudo mkswap /swapfile2
sudo swapon /swapfile2
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Que signifie KVM ?**
   A) Kernel Virtual Management
   B) Kernel-based Virtual Machine
   C) Key Value Memory
   D) Kinetic Virtual Machine
   *Réponse : B*

2. **À quoi sert la commande `virsh destroy <vm>` ?**
   A) À supprimer les fichiers de la VM du disque dur
   B) À éteindre proprement la VM via un signal logiciel
   C) À couper brutalement l'alimentation électrique virtuelle de la VM
   D) À corrompre l'OS invité
   *Réponse : C*

3. **Lequel de ces outils simule les périphériques matériels (réseau, USB) pour KVM ?**
   A) libvirt
   B) virt-install
   C) QEMU
   D) bash
   *Réponse : C*

4. **Quelle commande crée la structure Swap dans un fichier existant ?**
   A) mkswap
   B) swapon
   C) dd
   D) virt-install
   *Réponse : A*

5. **Quel paramètre de `virt-install` évite de rester bloqué sur la console pendant la création ?**
   A) --background
   B) --noautoconsole
   C) --daemon
   D) --detach
   *Réponse : B*
