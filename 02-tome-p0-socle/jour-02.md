# SEMESTRE 1 — Jour 02 (6h) : Système de Fichiers Linux FHS & Liens

> [!NOTE]
> **Objectif de la journée** : Comprendre l'architecture standard du système de fichiers Linux (FHS) pour savoir où chercher et ranger les fichiers. Maîtriser le concept critique des liens (raccourcis) physiques et symboliques.
> **Compétences visées** : `BIT-02` (Niveau Cible: A) — Arborescence et Système de fichiers Linux.

---

## 1) Le standard FHS (Filesystem Hierarchy Standard) (1h30)

### 📖 1.1 Narration & Intuition
Si chaque administrateur rangeait les fichiers où il le souhaite, chaque serveur Linux serait un chaos indescriptible. Le FHS est la "loi de l'urbanisme" de Linux. Tout part de la racine (`/`), comme le tronc d'un arbre gigantesque d'où partent des branches. Contrairement à Windows où chaque disque dur a sa propre lettre (`C:`, `D:`), Linux unifie tout sous une seule grande racine globale. Si vous branchez une clé USB, elle sera montée comme un simple dossier dans cet arbre.

### 🔍 1.2 Anatomie Technique
- `/` : La racine absolue.
- Le système Linux gère virtuellement l'arbre de fichiers. La commande `tree` (à installer souvent avec `apt install tree`) permet de visualiser cette arborescence de façon hiérarchique.
- `mount` : Commande permettant d'attacher un système de fichiers (clé USB, partition) à un dossier existant (le point de montage).

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Aller à la racine
cd /

# Lister le contenu de la racine (les grandes branches du système)
ls -lah

# Afficher l'espace disque de l'arborescence montée (human-readable)
df -h
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Plus de place sur le disque (erreur "No space left on device").
- **Diagnostic** : Le système de fichiers est plein, ou les "inodes" sont épuisés.
- **Réflexe** : Utiliser `df -h` pour vérifier l'espace, et `du -sh /*` pour trouver quel dossier prend de la place.

---

## 2) Anatomie des dossiers systèmes (1h30)

### 📖 2.1 Narration & Intuition
Chaque dossier de la racine a un rôle précis, comme les pièces d'une maison.
- `/etc` = Le bureau administratif (fichiers de configuration globaux).
- `/var` = Le grenier ou le journal intime (fichiers variables comme les logs, bases de données).
- `/home` = Les chambres des utilisateurs (vos documents personnels).
- `/root` = La chambre forte du super-utilisateur (le home de root).
- `/bin` & `/usr/bin` = La boîte à outils (les commandes exécutables comme `ls`, `cd`).
- `/tmp` = La poubelle temporaire (vidée à chaque redémarrage).

### 🔍 2.2 Anatomie Technique
- `/etc/` contient du texte brut. Modifier un fichier ici impacte tout le système.
- `/var/log/` contient les journaux systèmes (ex: `/var/log/syslog` ou `/var/log/auth.log`).
- `/dev/` contient les fichiers de périphériques (tout est fichier sous Linux, même le disque dur: `/dev/sda`).

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# Regarder la configuration du réseau local
cat /etc/hosts

# Regarder les derniers événements du système (nécessite sudo souvent, ou /var/log/messages)
tail -n 10 /var/log/syslog || tail -n 10 /var/log/messages

# Trouver le chemin de l'exécutable bash
which bash

# Lister les dossiers personnels existants
ls -l /home
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Vous modifiez la configuration d'un logiciel dans votre `~/.config/` mais l'autre utilisateur n'a pas les changements.
- **Diagnostic** : Les fichiers dans `~` sont locaux à l'utilisateur.
- **Réflexe** : Les configurations globales doivent être modifiées dans `/etc/`.

---

## 3) Les Liens : Symboliques vs Physiques (2h00)

### 📖 3.1 Narration & Intuition
Linux utilise un système d'index appelé "inodes" pour stocker les métadonnées d'un fichier.
- **Lien physique (Hard Link)** : C'est comme donner deux prénoms différents à la même personne. Si un prénom disparaît, la personne existe toujours sous l'autre. Les deux noms pointent vers la même donnée brute sur le disque (même inode).
- **Lien symbolique (Symlink/Soft Link)** : C'est un post-it qui indique "Allez voir à cette adresse". Si le fichier cible est supprimé, le post-it devient un "lien mort" (cassé). C'est l'équivalent des raccourcis Windows.

### 🔍 3.2 Anatomie Technique
- Créer un lien physique : `ln fichier_cible nom_du_lien`
- Créer un lien symbolique : `ln -s fichier_cible nom_du_lien`
- Avec `ls -l`, un lien symbolique est identifié par la lettre `l` au début des permissions et une flèche `->` pointant vers la cible.
- Un lien physique ne peut pas traverser des partitions différentes, contrairement au lien symbolique.

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Créer un dossier de test
mkdir -p ~/test_liens && cd ~/test_liens

# Créer un fichier de base
echo "Données importantes" > fichier_original.txt

# Créer un lien symbolique
ln -s fichier_original.txt lien_symbolique.txt

# Créer un lien physique
ln fichier_original.txt lien_physique.txt

# Vérifier les inodes (option -i)
ls -li

# Détruire l'original
rm fichier_original.txt

# Vérifier l'état (le lien symbolique est cassé, le lien physique fonctionne toujours)
cat lien_physique.txt
cat lien_symbolique.txt # Va renvoyer une erreur
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Symptôme** : Fichier rouge clignotant ou "Too many levels of symbolic links".
- **Diagnostic** : Vous avez créé une boucle infinie de liens symboliques (A pointe vers B, qui pointe vers A).
- **Réflexe** : Supprimer le lien cassé avec `rm` (cela ne supprime pas la cible).

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Manipulation de l'arborescence et liens
- **Consigne** :
  1. Créez un dossier `/tmp/paradis_fhs`.
  2. A l'intérieur, créez un fichier `secret.conf` contenant le mot "Confidential".
  3. Créez un lien symbolique `raccourci.conf` dans votre dossier `~` qui pointe vers `/tmp/paradis_fhs/secret.conf` en utilisant un chemin absolu.
  4. Affichez le contenu de `~/raccourci.conf`.
- **Livrables à produire** : Capture du terminal avec l'affichage de `ls -l ~/raccourci.conf` montrant la flèche `->`.
- **Corrigé détaillé & Guidé** :
```bash
mkdir -p /tmp/paradis_fhs
echo "Confidential" > /tmp/paradis_fhs/secret.conf
ln -s /tmp/paradis_fhs/secret.conf ~/raccourci.conf
cat ~/raccourci.conf
ls -l ~/raccourci.conf
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Où sont stockés les fichiers de configuration globaux du système Linux ?**
   A) `/var`
   B) `/home`
   C) `/etc`
   D) `/bin`
   *Réponse : C*

2. **Quelle est la commande pour créer un lien symbolique ?**
   A) `ln -s cible nom_lien`
   B) `link --soft cible nom_lien`
   C) `mklink cible nom_lien`
   D) `ln cible nom_lien`
   *Réponse : A*

3. **Que se passe-t-il pour un lien physique si le fichier original est supprimé ?**
   A) Le lien physique est cassé et devient inutilisable.
   B) Le lien physique conserve les données, le fichier n'est pas vraiment perdu.
   C) Le système empêche la suppression du fichier original.
   D) Le lien physique se transforme en lien symbolique.
   *Réponse : B*

4. **Dans quel répertoire trouve-t-on généralement les journaux (logs) du système ?**
   A) `/etc/logs`
   B) `/root/logs`
   C) `/var/log`
   D) `/tmp`
   *Réponse : C*

5. **Comment reconnaître un lien symbolique lors d'un `ls -l` ?**
   A) Les permissions commencent par un `s`.
   B) Les permissions commencent par un `l` et il y a une flèche `->`.
   C) Le fichier clignote toujours en vert.
   D) Il n'est pas possible de le distinguer d'un fichier normal.
   *Réponse : B*
