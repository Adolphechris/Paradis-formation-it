# Jour J0F — Fichiers, Dossiers & Arborescence Linux : Le Standard FHS

> [!NOTE]
> **SEMESTRE 0 — PARCOURS D'INITIATION ET SOCLE DE PRÉ-REQUIS ABSOLUS (J0a–J0o)**  
> Cette leçon détaille la philosophie Unix du système de fichiers en arbre, le standard FHS, la notion d'Inode, la gestion des permissions (`rwx`), les liens symboliques et la navigation efficace.

---

## 🎯 Objectifs de la Leçon

- 📁 Intégrer la philosophie universelle : *"Tout est fichier sous Linux"*.
- 🌳 Explorer l'arborescence standard **FHS** (*Filesystem Hierarchy Standard*) répertoire par répertoire.
- 🏷️ Comprendre la structure d'un **Inode** et identifier les 7 types de fichiers Linux.
- 🔗 Distinguer un **Lien Symbolique** (*Symlink*) d'un **Lien Physique** (*Hard link*).
- 🔒 Maîtriser le modèle de permissions Unix (`rwx`) en notation octale (`755`, `644`, `600`).
- 🧪 Pratiquer les commandes de manipulation de fichiers (`ls`, `cd`, `mkdir`, `cp`, `mv`, `rm`, `chmod`, `chown`).

---

## 🖼️ L'Arborescence Inversée Linux

![Arborescence Linux](https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800)

---

## 📖 1. La Philosophie : "Tout est Fichier" & Le Standard FHS

### 1.1 Unix vs Windows : L'Arbre Inversé

Sous Windows, le stockage est découpé en lecteurs indépendants associés à des lettres (`C:\`, `D:\`, `E:\`). 

Sous Linux, l'intégralité du système, qu'il s'agisse d'un disque SSD interne, d'une clé USB, d'une carte réseau ou d'un écran, s'articule dans un **arbre unique inversé**. Le sommet de cet arbre est représenté par une simple barre oblique appelée la **Racine** (**`/`**).

Mieux encore : **Tout est fichier sous Linux**.
- Un dossier ? Un fichier spécial contenant une liste de noms et d'Inodes.
- Votre disque SSD ? Un fichier périphérique (`/dev/nvme0n1` ou `/dev/sda`).
- Votre carte réseau ou vos processus ? Des fichiers virtuels dans `/proc` et `/sys`.

### 1.2 Cartographie de l'Arborescence FHS (Filesystem Hierarchy Standard)

```
/ (La Racine / Root Directory)
├── bin  ──► Exécutables binaires essentiels pour tous les utilisateurs (ls, cat, cp)
├── boot ──► Noyau Linux (vmlinuz), Initrd et fichiers de démarrage du Bootloader GRUB
├── dev  ──► Fichiers de périphériques matériels (disques /dev/sda, zéro /dev/zero, null)
├── etc  ──► Fichiers de configuration texte du système et des serveurs (nginx, ssh, etc.)
├── home ──► Dossiers personnels des utilisateurs standard (/home/adolphe, /home/alice)
├── lib  ──► Bibliothèques partagées indispensables (.so) pour les binaires du système
├── media──► Point de montage automatique des médias amovibles (Clés USB, CD-ROM)
├── mnt  ──► Point de montage temporaire pour les systèmes de fichiers externes
├── opt  ──► Logiciels tiers propriétaires non fournis par le gestionnaire de paquets
├── proc ──► Pseudo-système de fichiers virtuel en RAM décrivant l'état des processus
├── root ──► Répertoire personnel réservé au super-utilisateur root (distinct de /)
├── run  ──► Données d'exécution volatiles depuis le dernier démarrage (PID, sockets)
├── sbin ──► Binaires système réservés à l'administration (fdisk, iptables, reboot)
├── sys  ──► Pseudo-système de fichiers virtuel exposant les pilotes du Noyau Linux
├── tmp  ──► Fichiers temporaires accessibles à tous, nettoyés automatiquement au reboot
├── usr  ──► Binaires et données utilisateur secondaires (/usr/bin, /usr/lib, /usr/share)
└── var  ──► Données variables de production (Logs /var/log, Mail, Bases DB /var/lib)
```

---

## 📖 2. Chemins Absolus vs Chemins Relatifs

Pour désigner l'emplacement d'un fichier ou dossier dans cet arbre, on utilise deux grammaires :

```
             ┌────────────────────────────────────────────────────────────┐
             │  CHEMIN ABSOLU                                             │
             │  - Démarre TOUJOURS par la racine `/`                      │
             │  - Valide quel que soit l'endroit où vous vous trouvez.    │
             │  Exemple : /var/log/nginx/access.log                       │
             └────────────────────────────────────────────────────────────┘
             ┌────────────────────────────────────────────────────────────┐
             │  CHEMIN RELATIF                                            │
             │  - Démarre depuis votre répertoire courant actuel (`pwd`)  │
             │  - N'utilise PAS de `/` initial.                           │
             │  Exemple (si vous êtes dans /var) : log/nginx/access.log   │
             └────────────────────────────────────────────────────────────┘
```

### Les Symboles Spéciaux de Navigation :
- **`.` (Un seul point)** : Représente le répertoire courant actuel.
- **`..` (Deux points)** : Représente le répertoire parent (remonter d'un niveau).
- **`~` (Tilde)** : Raccourci vers votre dossier personnel (`/home/nom_utilisateur`).
- **`-` (Tiret)** : Raccourci vers le répertoire où vous étiez juste avant (`cd -`).

---

## 📖 3. Qu'est-ce qu'un Inode ? Les 7 Types de Fichiers Linux

### 3.1 Anatomie d'un Inode (Index Node)

Dans le système de fichiers Linux (ext4, XFS), le nom d'un fichier n'est qu'une étiquette textuelle. Le fichier physique lui-même est défini par une structure de métadonnées appelée **Inode** (*Index Node*).

Un Inode contient toutes les informations d'un fichier **SAUF son nom** et ses données réelles :

```
┌─────────────────────────────────────────────────────────────────────────┐
│ STRUCTURE D'UN INODE                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ - Numéro d'Inode unique (ex: Inode #145209)                             │
│ - Type de fichier (Fichier ordinaire, Répertoire, Symlink...)           │
│ - Permissions d'accès (rwxr-xr-x)                                       │
│ - Identifiant du Propriétaire (UID) et du Groupe (GID)                  │
│ - Taille exacte du fichier en octets                                    │
│ - Timestamps : Date de création (btime), modification (mtime), accès   │
│ - Pointeurs vers les blocs logiques sur le SSD/HDD                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Les 7 Types de Fichiers Linux (Vérifiables avec `ls -l`)

La toute première lettre affichée par la commande `ls -l` indique le type de fichier :

| Symbole | Type de Fichier | Description |
| :---: | :--- | :--- |
| **`-`** | Fichier ordinaire | Fichier texte, image, binaire exécutable, document |
| **`d`** | Répertoire (*Directory*) | Dossier contenant des liens vers d'autres Inodes |
| **`l`** | Lien symbolique (*Symlink*) | Raccourci pointant vers le chemin d'un autre fichier |
| **`b`** | Périphérique bloc (*Block*) | Disque dur, SSD, clé USB (transfert par blocs de données) |
| **`c`** | Périphérique caractère (*Char*) | Clavier, souris, terminal (transfert caractère par caractère) |
| **`s`** | Socket réseau local | Canal de communication IPC entre deux processus |
| **`p`** | Tube nommé (*Named Pipe*) | Canal FIFO de communication entre programmes |

---

## 📖 4. Le Modèle de Permissions Unix (`rwx`)

### 4.1 Décoder la Chaine de Permissions

Considérons le résultat d'une commande `ls -l` :

```
      - rwx r-x r--  1  adolphe  devops  4096  Dec  1 14:00  script.sh
      │ ─── ─── ───
      │  │   │   └─── Droits des AUTRES / OTHERS (o) : r-- (Lecture seule)
      │  │   └─────── Droits du GROUPE / GROUP (g)   : r-x (Lecture et Exécution)
      │  └─────────── Droits du PROPRIÉTAIRE / USER (u): rwx (Lecture, Écriture, Exécution)
      └────────────── Type : Fichier ordinaire (-)
```

Les 3 droits élémentaires :
- **`r` (Read / Lecture = 4)** : Consulter le contenu du fichier ou lister le dossier.
- **`w` (Write / Écriture = 2)** : Modifier/effacer le fichier ou créer/supprimer dans le dossier.
- **`x` (eXecute / Exécution = 1)** : Exécuter le binaire/script ou traverser le dossier avec `cd`.

### 4.2 La Notation Octale (Le Calcul des Permissions)

En additionnant la valeur binaire des droits (`r=4, w=2, x=1`), on obtient un chiffre octal de 0 à 7 pour chaque catégorie (Propriétaire, Groupe, Autres) :

```
r w x  = 4 + 2 + 1 = 7 (Droits Totaux : Lecture, Écriture, Exécution)
r - x  = 4 + 0 + 1 = 5 (Lecture et Exécution — Standard pour dossiers et scripts)
r - -  = 4 + 0 + 0 = 4 (Lecture Seule)
- - -  = 0 + 0 + 0 = 0 (Aucun Droit)

Combinaisons Courantes en Production :
- 755 (rwxr-xr-x) : Dossiers standards et scripts exécutables publics.
- 644 (rw-r--r--) : Fichiers textes ou HTML standards.
- 600 (rw-------) : Fichiers ultra-confidentiels (Clés privées SSH, mots de passe).
- 700 (rwx------) : Dossier personnel strictement privé.
```

---

## 🧪 Atelier Pratique : Exercices de Navigation et Manipulations

Exécutez cette série de 10 commandes réelles dans votre terminal Linux :

```bash
# 1. Lister la racine / avec le format long et les types de fichiers
ls -la /

# 2. Créer une arborescence de dossiers imbriqués en une seule commande (-p)
mkdir -p ~/paradis/labs/module1/cours

# 3. Se déplacer dans le dossier créé avec un chemin relatif
cd ~/paradis/labs/module1/cours

# 4. Vérifier où vous êtes
pwd
# Output attendu: /home/adolphe/paradis/labs/module1/cours

# 5. Créer un fichier texte vide et y ajouter du texte
echo "# Script de test PARADIS IT" > test.sh

# 6. Rendre le script exécutable (Rendre x au propriétaire et au groupe)
chmod 755 test.sh

# 7. Vérifier les nouvelles permissions du fichier
ls -l test.sh
# Output attendu: -rwxr-xr-x 1 adolphe adolphe ... test.sh

# 8. Créer un Lien Symbolique (Raccourci) vers le script dans votre Home
ln -s ~/paradis/labs/module1/cours/test.sh ~/mon_raccourci.sh

# 9. Vérifier l'inode du fichier et du lien symbolique (-i)
ls -li test.sh ~/mon_raccourci.sh
# Output attendu: Deux numéros d'inodes différents, le lien pointe avec ->

# 10. Revenir instantanément au répertoire où vous étiez précédemment
cd -
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Message d'Erreur : `No space left on device` (Alors que `df -h` montre de la place disponible)
- **Cause** : Le nombre d'**Inodes** disponibles sur le système de fichiers est totalement épuisé ! Cela arrive lorsqu'une application crée des millions de minuscules fichiers vides (ex: fichiers de sessions ou logs non purgés).
- **Réflexe** : Vérifiez la saturation des Inodes avec la commande **`df -i`**. Si la colonne `IUse%` est à 100%, supprimez les fichiers temporaires.

### 2. Message d'Erreur : `Permission denied` lors de l'exécution d'un script `.sh`
- **Cause** : Le fichier possède les droits de lecture (`r`), mais n'a pas le bit d'exécution (`x`).
- **Réflexe** : Ajoutez le droit d'exécution avec **`chmod +x mon_script.sh`** ou **`chmod 755 mon_script.sh`**.

### 3. Danger Absolu en Production : `rm -rf /` ou `rm -rf ./*`
- **Mise en garde** : La commande `rm -rf` supprime récursivement (`-r`) et sans demander de confirmation (`-f`). Sous Linux, il n'y a **PAS de Corbeille** en ligne de commande. Tout fichier supprimé par `rm` est définitivement détruit.

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Quel répertoire standard du FHS Linux est spécialement réservé au stockage des fichiers de configuration texte du système et des serveurs ?**
- A) `/tmp`
- B) `/var`
- C) `/etc`
- D) `/bin`

*Réponse : C — `/etc` est le répertoire officiel réservé aux fichiers de configuration de Linux et de ses applications.*

**Q2 : Quelle est la valeur octale exacte des permissions `rwxr-xr-x` ?**
- A) 644
- B) 755
- C) 700
- D) 777

*Réponse : B — rwx (4+2+1=7), r-x (4+0+1=5), r-x (4+0+1=5) = 755.*

**Q3 : Dans un système de fichiers Linux, qu'est-ce qu'un Inode ?**
- A) Le nom du fichier lisible par l'utilisateur
- B) La structure de métadonnées qui stocke la taille, les permissions, l'UID et l'emplacement des blocs du fichier
- C) La corbeille du système
- D) Une clé de chiffrement Wi-Fi

*Réponse : B — L'Inode contient toutes les métadonnées techniques du fichier à l'exception de son nom textuel.*

**Q4 : Que signifie la lettre `d` au tout début d'une ligne de résultat de la commande `ls -l d-rwxr-xr-x` ?**
- A) Fichier de données (*Data*)
- B) Répertoire (*Directory*)
- C) Fichier supprimé (*Deleted*)
- D) Disque dur (*Disk*)

*Réponse : B — La lettre `d` indique que l'élément est un répertoire (dossier).*

**Q5 : Quelle est la différence fondamentale entre un lien symbolique (*Symlink*) et un lien physique (*Hard link*) ?**
- A) Le lien symbolique est un raccourci pointant vers un nom de fichier, tandis que le lien physique pointe directement vers le même numéro d'Inode
- B) Le lien physique ne fonctionne que sur Internet
- C) Le lien symbolique est payant
- D) Il n'y a aucune différence

*Réponse : A — Un Symlink (`ln -s`) pointe vers un chemin. Si le fichier source est supprimé, le lien est brisé. Un Hard link (`ln`) partage le même Inode physique.*

**Q6 : Quelle commande permet de modifier le propriétaire et le groupe d'un fichier sous Linux ?**
- A) `chmod`
- B) `chown`
- C) `touch`
- D) `cat`

*Réponse : B — `chown` (*Change Owner*) modifie le propriétaire et/ou le groupe d'un fichier (ex: `chown user:group fichier`). `chmod` modifie les permissions.*

**Q7 : Quel répertoire virtuel sous Linux est généré directement en mémoire RAM par le Noyau pour exposer les métadonnées des processus actifs ?**
- A) `/home`
- B) `/proc`
- C) `/opt`
- D) `/media`

*Réponse : B — `/proc` est un pseudo-système de fichiers virtuel en RAM où chaque dossier numérique correspond au PID d'un processus actif.*

**Q8 : Quelle commande permet de vérifier si un disque dur est saturé en nombre d'Inodes plutôt qu'en espace disque ?**
- A) `ls -la`
- B) `df -h`
- C) `df -i`
- D) `du -sh`

*Réponse : C — L'option `-i` de la commande `df` affiche le nombre d'Inodes utilisés et disponibles par partition.*

---

## 📚 Ressources & Références

- **Filesystem Hierarchy Standard (FHS 3.0 Official)** : https://refspecs.linuxfoundation.org/FHS_3.0/fhs-3.0.html
- **GNU Coreutils — File Permissions** : https://www.gnu.org/software/coreutils/manual/html_node/File-permissions.html
- **Linux Inodes Explanation** : https://wiki.archlinux.org/title/File_systems

---

*Semestre 0 — Module d'Initiation & Pré-requis Absolus PARADIS IT Masterclass*
