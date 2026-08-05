# SEMESTRE 1 — Jour 01 (6h) : Prise en main Linux CLI & Navigation de Base

> [!NOTE]
> **Objectif de la journée** : Maîtriser l'environnement en ligne de commande (CLI) sous Linux, comprendre la différence entre un terminal et un shell, et savoir se repérer et manipuler des fichiers et répertoires avec aisance.
> **Compétences visées** : `BIT-02` (Niveau Cible: A) — Administration Linux & Shell.

---

## 1) Le Terminal et le Shell : Bash vs Zsh (1h30)

### 📖 1.1 Narration & Intuition
Imaginez votre ordinateur comme une entreprise géante. L'écran de votre terminal est l'interphone à la porte. Le "Shell" (la coquille) est le réceptionniste derrière cet interphone. Vous parlez dans l'interphone (CLI), et le réceptionniste (Bash, Zsh) interprète vos demandes pour les transmettre au patron (le noyau Linux) afin de faire le travail. Le shell n'est donc pas une simple fenêtre noire, mais un programme qui traduit vos textes en actions système. Bash est le réceptionniste classique, rigoureux et standardisé. Zsh est le réceptionniste moderne, qui anticipe vos mots et possède des gadgets colorés (auto-complétion intelligente).

### 🔍 1.2 Anatomie Technique
- **Terminal (Émulateur)** : Le logiciel graphique qui affiche le texte (ex: GNOME Terminal, iTerm2, Alacritty).
- **Shell** : L'interpréteur de commandes (ex: `/bin/bash`, `/bin/zsh`).
- **L'invite de commande (Prompt)** : Souvent formatée en `utilisateur@machine:~$`. Le `~` symbolise le répertoire personnel, le `$` signifie utilisateur standard (le `#` signifie super-utilisateur ou root).
- **Commande exacte** : `echo $SHELL` (affiche le shell actuel) ou `cat /etc/shells` (liste les shells installés).

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Vérifier le shell actuellement utilisé
echo $SHELL

# Afficher la version du shell bash
bash --version

# Lister tous les shells disponibles sur la machine
cat /etc/shells

# Lancer un sous-shell Zsh (s'il est installé) ou Bash
bash
exit
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : "Commande introuvable" (`command not found`).
- **Diagnostic** : Soit la commande est mal orthographiée, soit elle n'est pas installée, soit elle n'est pas dans la variable `$PATH` (la liste des endroits où le shell cherche les programmes).
- **Réflexe** : Vérifier l'orthographe ou utiliser `which <commande>` pour localiser le binaire.

---

## 2) Navigation de base : pwd, ls, cd (1h30)

### 📖 2.1 Narration & Intuition
Vous êtes téléporté dans un immense bâtiment sans fenêtre. Pour survivre, vous devez vous poser trois questions : 1. "Où suis-je ?" (`pwd` - Print Working Directory). 2. "Qu'y a-t-il autour de moi ?" (`ls` - List). 3. "Comment aller dans la pièce d'à côté ?" (`cd` - Change Directory). C'est le GPS du sysadmin !

### 🔍 2.2 Anatomie Technique
- **`pwd`** : Affiche le chemin absolu depuis la racine `/`.
- **`ls`** : Liste le contenu. Options cruciales : `-l` (format long détaillé), `-a` (affiche les fichiers cachés commençant par un point `.`), `-h` (tailles lisibles pour l'humain).
- **`cd`** : Change de répertoire. Chemins absolus (commençant par `/`) vs relatifs (depuis la position actuelle).
  - `.` : répertoire courant.
  - `..` : répertoire parent.
  - `~` : répertoire personnel (home).
  - `-` : retour au répertoire précédent.

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# Savoir où on est
pwd

# Lister le contenu du dossier avec détails et fichiers cachés
ls -lah

# Aller dans le dossier /var/log (chemin absolu)
cd /var/log
pwd

# Revenir au répertoire précédent de manière relative
cd ..
pwd

# Revenir directement dans son dossier personnel (home)
cd ~
pwd

# Retourner au dernier dossier visité (/var)
cd -
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Symptôme** : `cd: No such file or directory`.
- **Diagnostic** : Le dossier n'existe pas ou vous avez utilisé un chemin relatif au lieu d'un chemin absolu.
- **Réflexe** : Toujours utiliser l'auto-complétion avec la touche `TAB`. Si `TAB` ne complète pas, le chemin est faux !

---

## 3) Manipulation de fichiers et dossiers (2h00)

### 📖 3.1 Narration & Intuition
Maintenant que vous savez vous déplacer, il faut pouvoir créer et modifier votre environnement. Créer des dossiers (`mkdir`), des fichiers vides (`touch`), faire des copies de sauvegarde (`cp`), déplacer ou renommer des éléments (`mv`), et enfin faire le ménage (`rm`). Attention, sous Linux CLI, il n'y a pas de corbeille. Ce qui est supprimé l'est définitivement.

### 🔍 3.2 Anatomie Technique
- **`mkdir`** : Make Directory. Option utile : `-p` (crée les dossiers parents si inexistants).
- **`touch`** : Met à jour la date de modification d'un fichier, ou crée le fichier s'il n'existe pas.
- **`cp`** : Copy. Pour copier un dossier, l'option `-r` (récursif) est obligatoire.
- **`mv`** : Move. Sert à la fois à déplacer et à renommer (déplacer vers le même dossier avec un autre nom).
- **`rm`** : Remove. `-r` pour les dossiers, `-f` pour forcer (attention !).

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Créer une arborescence de dossiers en une commande
mkdir -p ~/formation_paradis/jour01/exercices

# Se déplacer dedans
cd ~/formation_paradis/jour01/exercices

# Créer trois fichiers texte vides
touch fichier1.txt fichier2.txt fichier3.txt

# Copier fichier1.txt vers une sauvegarde
cp fichier1.txt fichier1_backup.txt

# Renommer fichier2.txt en secret.txt
mv fichier2.txt secret.txt

# Déplacer secret.txt dans le dossier parent
mv secret.txt ../

# Supprimer fichier3.txt
rm fichier3.txt

# Supprimer tout le dossier d'exercices d'un coup (récursif)
cd ~
rm -r ~/formation_paradis/jour01/exercices
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Symptôme** : `cp: -r not specified; omitting directory 'dossier'`.
- **Diagnostic** : Vous essayez de copier (ou supprimer avec `rm`) un dossier sans dire à Linux de plonger dedans récursivement.
- **Réflexe** : Ajouter l'option `-r` (ou `-R`) à `cp` ou `rm`.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Arborescence et Sauvegarde
- **Consigne** :
  1. Retournez dans votre répertoire `~`.
  2. Créez un dossier `mission_alpha` contenant un sous-dossier `rapports`.
  3. Créez un fichier `cible.txt` dans le dossier `mission_alpha`.
  4. Copiez `cible.txt` dans le dossier `rapports` en le nommant `cible_sauvegarde.txt`.
  5. Affichez le contenu détaillé et caché du dossier `rapports`.
- **Livrables à produire** : Capture d'écran ou copie texte de votre terminal montrant l'exécution réussie de toutes les commandes.
- **Corrigé détaillé & Guidé** :
```bash
cd ~
mkdir -p mission_alpha/rapports
cd mission_alpha
touch cible.txt
cp cible.txt rapports/cible_sauvegarde.txt
ls -lah rapports/
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Que signifie le tilde `~` dans un chemin d'accès Linux ?**
   A) Le répertoire racine `/`
   B) Le répertoire courant
   C) Le répertoire personnel de l'utilisateur courant
   D) Le dernier répertoire visité
   *Réponse : C*

2. **Quelle commande permet de lister les fichiers cachés ?**
   A) `ls -l`
   B) `ls -a`
   C) `dir --hidden`
   D) `show -h`
   *Réponse : B*

3. **Laquelle de ces commandes crée toute l'arborescence `/tmp/a/b/c` d'un seul coup ?**
   A) `mkdir /tmp/a/b/c`
   B) `mkdir -r /tmp/a/b/c`
   C) `mkdir -p /tmp/a/b/c`
   D) `touch /tmp/a/b/c`
   *Réponse : C*

4. **Quelle option faut-il utiliser pour copier un répertoire complet contenant des fichiers ?**
   A) `cp -f`
   B) `cp -a` ou `cp -r`
   C) `cp -d`
   D) On ne peut pas copier de répertoire avec `cp`
   *Réponse : B*

5. **Comment renommer `ancien.txt` en `nouveau.txt` dans le répertoire courant ?**
   A) `ren ancien.txt nouveau.txt`
   B) `mv ancien.txt nouveau.txt`
   C) `cp ancien.txt nouveau.txt && rm ancien.txt`
   D) B et C sont valides, mais B est la commande standard
   *Réponse : D*
