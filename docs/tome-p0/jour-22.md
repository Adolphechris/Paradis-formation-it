# SEMESTRE 1 — Jour 22 (6h) : Gestion des Disques & Volume Manager (LVM)

> [!NOTE]
> **Objectif de la journée** : Maîtriser l'intégration de nouveaux disques sous Linux, la création de partitions, le formatage et découvrir l'élasticité révolutionnaire offerte par LVM (Logical Volume Manager).
> **Compétences visées** : `BIT-02` (Niveau Cible: A) — Stockage Linux, systèmes de fichiers et LVM.

---

## 1) Disques Bruts et Partitionnement : MBR vs GPT (1h30)

### 📖 1.1 Narration & Intuition
Un disque dur brut acheté en magasin est comme un vaste terrain vague. Vous ne pouvez rien y construire directement. Il faut d'abord le délimiter (Partitionnement) puis le terrasser et le goudronner (Formatage/Système de fichiers) pour y garer des données.
Historiquement, on utilisait la norme MBR (Master Boot Record) pour délimiter les terrains. Mais le MBR est limité à des disques de 2 To maximum et 4 partitions principales. Aujourd'hui, on utilise GPT (GUID Partition Table), qui gère des disques gigantesques (jusqu'à 9,4 Zettaoctets) et permet 128 partitions.

### 🔍 1.2 Anatomie Technique
Sous Linux, "Tout est un fichier", même les disques. Ils sont représentés dans le dossier `/dev/`.
- Les disques SATA/SAS/USB s'appellent `/dev/sda`, `/dev/sdb`, `/dev/sdc`...
- Les disques NVMe s'appellent `/dev/nvme0n1`, `/dev/nvme0n2`...
- Une partition sur `sdb` sera `/dev/sdb1`.
Pour créer des partitions, on utilise `fdisk` (historique, orienté MBR) ou `parted` (moderne, idéal pour GPT).

### 🛠️ 1.3 Atelier Pratique Hands-on
Imaginons que nous venons de brancher un nouveau disque (qui apparaîtrait en `/dev/sdb`).
*(Note: Dans cet atelier, nous allons utiliser un fichier simulé en boucle (loop device) pour éviter de détruire votre vrai système si vous n'avez pas de 2ème disque).*
```bash
# 1. Simuler l'ajout d'un disque dur de 100 Mo
dd if=/dev/zero of=fake_disk.img bs=1M count=100
sudo losetup -fP fake_disk.img
sudo losetup -a # Permet de voir le nom (ex: /dev/loop0)

# 2. Utiliser parted pour créer une table GPT sur ce "disque"
sudo parted -s /dev/loop0 mklabel gpt

# 3. Créer une partition occupant 100% de l'espace disponible
sudo parted -s /dev/loop0 mkpart primary 0% 100%

# 4. Observer le résultat (la partition créée s'appellera /dev/loop0p1)
lsblk
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **`lsblk` ne montre pas ma nouvelle partition** : Si vous venez de partitionner un vrai disque, le noyau peut ne pas avoir vu le changement. Tapez `sudo partprobe /dev/sdb` pour forcer le noyau à relire la table des partitions.

---

## 2) Le Système de Fichiers : ext4 et xfs (1h30)

### 📖 2.1 Narration & Intuition
Le terrain est délimité, il faut maintenant le préparer pour y ranger nos cartons. C'est le système de fichiers (File System). Il gère l'indexation, les droits et la hiérarchie.
- **ext4** : Le grand classique Linux. Fiable, robuste, rétrocompatible.
- **XFS** : Très performant pour les gros fichiers (souvent par défaut sur Red Hat/CentOS).
Pour installer un système de fichiers, on "fait" un FS : l'outil s'appelle `mkfs` (Make File System).

### 🔍 2.2 Anatomie Technique
Le formatage détruit toutes les données de la partition pour y installer les structures du système de fichiers (Inodes, Superblocks). 
Une fois formatée, la partition doit être "montée" : on accroche cette partition à un dossier vide (le point de montage) de notre système principal pour pouvoir y accéder.

### 🛠️ 2.3 Atelier Pratique Hands-on
Formatons la partition que nous avons créée.
```bash
# 1. Formater en ext4 la partition créée précédemment
sudo mkfs.ext4 /dev/loop0p1

# 2. Créer un point de montage (un simple dossier)
mkdir /tmp/mon_nouveau_disque

# 3. Monter la partition sur ce dossier
sudo mount /dev/loop0p1 /tmp/mon_nouveau_disque

# 4. Vérifier l'espace disponible
df -h | grep loop0p1

# 5. Créer un fichier dedans
sudo touch /tmp/mon_nouveau_disque/fichier_test.txt
ls -l /tmp/mon_nouveau_disque/

# 6. Démonter et nettoyer la simulation
sudo umount /tmp/mon_nouveau_disque
sudo losetup -d /dev/loop0
rm fake_disk.img
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Erreur "target is busy" lors du `umount`** : Cela signifie que vous ou un processus êtes actuellement *dans* le dossier de montage. Changez de dossier avec `cd ~` puis réessayez.

---

## 3) La Révolution LVM : Logical Volume Manager (2h00)

### 📖 3.1 Narration & Intuition
Le partitionnement classique (MBR/GPT) a un problème majeur : il est rigide. Si votre partition `sdb1` est pleine, vous ne pouvez pas facilement l'agrandir en utilisant l'espace d'un disque `sdc`.
LVM est une couche d'abstraction logicielle. Imaginez que LVM fond tous vos disques physiques (Physical Volumes) dans une grande marmite (Volume Group). À partir de cette marmite, vous pouvez puiser des louches pour créer des volumes élastiques (Logical Volumes). Si un volume est plein, vous remettez un disque physique dans la marmite, et vous agrandissez le volume logique à chaud, sans même redémarrer !

### 🔍 3.2 Anatomie Technique
LVM fonctionne en 3 couches :
1. **PV (Physical Volume)** : Les disques ou partitions brutes (`pvcreate`).
2. **VG (Volume Group)** : La mise en commun ("pool") des capacités des PVs (`vgcreate`).
3. **LV (Logical Volume)** : Les disques virtuels découpés dans le VG (`lvcreate`), que l'on formate et que l'on monte.

### 🛠️ 3.3 Atelier Pratique Hands-on
Simulons 2 petits disques pour créer une architecture LVM.
```bash
# 1. Créer deux disques virtuels de 200 Mo
dd if=/dev/zero of=disk1.img bs=1M count=200
dd if=/dev/zero of=disk2.img bs=1M count=200
sudo losetup -fP disk1.img
sudo losetup -fP disk2.img
# Supposons qu'ils soient /dev/loop1 et /dev/loop2

# 2. PV : Initialiser les disques pour LVM
sudo pvcreate /dev/loop1 /dev/loop2
sudo pvs # Affiche les PVs

# 3. VG : Créer un groupe "vg_data" fusionnant les deux (400 Mo au total)
sudo vgcreate vg_data /dev/loop1 /dev/loop2
sudo vgs # Affiche les VGs

# 4. LV : Créer un volume logique de 150 Mo nommé "lv_www"
sudo lvcreate -L 150M -n lv_www vg_data
sudo lvs # Affiche les LVs

# 5. Formater et utiliser le LV
sudo mkfs.ext4 /dev/vg_data/lv_www
mkdir /tmp/www
sudo mount /dev/vg_data/lv_www /tmp/www/

# 6. MAGIE : Agrandir le volume logique de 100 Mo et étendre le système de fichiers (à chaud)
sudo lvextend -L +100M /dev/vg_data/lv_www
sudo resize2fs /dev/vg_data/lv_www
df -h | grep lv_www

# Nettoyage
sudo umount /tmp/www
sudo vgremove vg_data -y
sudo pvremove /dev/loop1 /dev/loop2
sudo losetup -d /dev/loop1 /dev/loop2
rm disk1.img disk2.img
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **`resize2fs` échoue** : `resize2fs` ne fonctionne que pour ext2/ext3/ext4. Si votre volume est en XFS, vous devez utiliser la commande `xfs_growfs /point_de_montage`.
- **Démonter un volume logique** : Avant de supprimer un LV avec `lvremove`, il faut toujours le démonter avec `umount`.

---

## 📚 Nouvelles Abréviations Rencontrées
- **GPT** : GUID Partition Table
- **LVM** : Logical Volume Manager
- **PV / VG / LV** : Physical Volume / Volume Group / Logical Volume
- **FS** : File System

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Opération LVM
- **Consigne** : À l'aide de LVM, vous devez créer une capacité de stockage combinant deux disques virtuels, créer un volume logique de 50 Mo, le formater en ext4, et l'agrandir à 100 Mo.
- **Livrables à produire** : Capture d'écran ou copie texte de la sortie des commandes `lvs` et `df -h` montrant l'agrandissement.
- **Corrigé détaillé & Guidé** :
```bash
# Mise en place (loop devices)
dd if=/dev/zero of=ex_d1.img bs=1M count=100
dd if=/dev/zero of=ex_d2.img bs=1M count=100
LOOPA=$(sudo losetup -f --show ex_d1.img)
LOOPB=$(sudo losetup -f --show ex_d2.img)

# LVM
sudo pvcreate $LOOPA $LOOPB
sudo vgcreate vg_portfolio $LOOPA $LOOPB
sudo lvcreate -L 50M -n lv_exo vg_portfolio

# Formatage
sudo mkfs.ext4 /dev/vg_portfolio/lv_exo
mkdir /tmp/portfolio
sudo mount /dev/vg_portfolio/lv_exo /tmp/portfolio

# Extension
sudo lvextend -L +50M /dev/vg_portfolio/lv_exo
sudo resize2fs /dev/vg_portfolio/lv_exo

# Nettoyage
sudo umount /tmp/portfolio
sudo lvremove -y /dev/vg_portfolio/lv_exo
sudo vgremove -y vg_portfolio
sudo pvremove $LOOPA $LOOPB
sudo losetup -d $LOOPA $LOOPB
rm ex_d*.img
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Quelle commande est utilisée pour créer une partition sur un disque GPT ?**
   A) `mkfs`
   B) `parted`
   C) `lvm`
   D) `mount`
   *Réponse : B*

2. **À quoi sert la commande `mkfs.ext4` ?**
   A) À créer une partition
   B) À monter une partition
   C) À formater une partition avec le système de fichiers ext4
   D) À étendre un volume LVM
   *Réponse : C*

3. **Dans LVM, que regroupe un Volume Group (VG) ?**
   A) Des Logical Volumes
   B) Des Physical Volumes
   C) Des fichiers texte
   D) Des points de montage
   *Réponse : B*

4. **Quelle commande permet d'étendre la taille d'un système de fichiers ext4 après avoir étendu son LV ?**
   A) `xfs_growfs`
   B) `resize2fs`
   C) `lvextend`
   D) `fsck`
   *Réponse : B*

5. **Pourquoi utiliser LVM plutôt que le partitionnement classique MBR/GPT ?**
   A) C'est obligatoire sous Linux
   B) Pour formater en NTFS
   C) Pour redimensionner dynamiquement l'espace de stockage
   D) Pour accélérer le processeur
   *Réponse : C*
