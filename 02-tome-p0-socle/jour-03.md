# SEMESTRE 1 — Jour 03 (6h) : Permissions Linux & Gestion des Utilisateurs

> [!NOTE]
> **Objectif de la journée** : Comprendre le modèle d'identités locales de Linux, attribuer des droits stricts sur les fichiers (modèle POSIX), et exécuter des tâches administratives en appliquant le principe du moindre privilège (sudo).
> **Compétences visées** : `BIT-02` (Niveau Cible: A), `SEC-03` (Niveau Cible: A) — Contrôle d'accès et permissions Linux.

---

## 1) Gestionnaires d'identités locaux (1h30)

### 📖 1.1 Narration & Intuition
Sous Linux, un ordinateur est comme un immeuble sécurisé. Chaque résident a un badge (UID - User ID) et appartient à une ou plusieurs familles (GID - Group ID). Le gardien de l'immeuble est le système, qui vérifie trois gros registres :
1. Qui habite ici ? (`/etc/passwd`)
2. Quels sont leurs mots de passe secrets ? (`/etc/shadow`)
3. Quelles sont les familles/équipes ? (`/etc/group`)
L'utilisateur suprême (le promoteur de l'immeuble) est `root` (UID 0), qui a tous les droits, partout.

### 🔍 1.2 Anatomie Technique
- `useradd` / `usermod` / `userdel` : Créer, modifier, supprimer un utilisateur.
- `passwd` : Définir ou changer un mot de passe.
- `id` : Afficher son UID, son GID primaire et ses groupes secondaires.
- `su` (Substitute User) : Permet de changer d'identité dans le shell. `su - utilisateur` lance un environnement propre (login shell).

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Voir sa propre identité
id

# Lire le registre des utilisateurs (remarquez les utilisateurs systèmes)
cat /etc/passwd

# Tenter de lire le fichier des mots de passe (Doit renvoyer Permission Denied sans sudo)
cat /etc/shadow

# Créer un utilisateur 'stagiaire' (nécessite les privilèges root)
sudo useradd -m -s /bin/bash stagiaire

# Lui attribuer un mot de passe
sudo passwd stagiaire

# Changer d'identité pour devenir 'stagiaire'
su - stagiaire
whoami
exit
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Symptôme** : On lance un script ou on édite un fichier et on obtient "Permission denied".
- **Diagnostic** : Votre utilisateur actuel (vérifié avec `whoami`) n'a pas les droits, ou le processus n'est pas lancé par le bon UID.
- **Réflexe** : Toujours utiliser `id` et `ls -l` pour comparer qui on est et à qui appartient le fichier.

---

## 2) Le Modèle de Permissions POSIX & Calcul Octal (1h30)

### 📖 2.1 Narration & Intuition
Chaque fichier et dossier sur Linux possède un cadenas à trois chiffres (Octal).
Les trois parties du cadenas correspondent à :
1. Le propriétaire (`u` - user)
2. Le groupe (`g` - group)
3. Tous les autres (`o` - others / le reste du monde)
Chaque partie autorise 3 actions : Lire (`r` = Read = 4), Écrire (`w` = Write = 2), et Exécuter (`x` = eXecute = 1).
On additionne ces valeurs ! Par exemple, Lire(4) + Écrire(2) = 6.

### 🔍 2.2 Anatomie Technique
- Format texte (ex: `rwxr-xr--`) vs Format Octal (ex: `754`).
- `chmod` (Change Mode) : Modifie les permissions.
- `chown` (Change Owner) : Modifie le propriétaire et le groupe (`chown user:group fichier`).
- **Pour un fichier** : `r` = voir le contenu, `w` = modifier/supprimer le contenu, `x` = exécuter comme un programme.
- **Pour un dossier** : `r` = lister le contenu (`ls`), `w` = créer/supprimer des fichiers dedans, `x` = traverser le dossier (`cd`).

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# Créer un fichier de script
touch script.sh

# Voir les permissions par défaut
ls -l script.sh

# Donner tous les droits au propriétaire (7), lecture+exécution au groupe (5), et rien aux autres (0)
chmod 750 script.sh
ls -l script.sh

# Syntaxe symbolique équivalente : ajouter l'exécution pour l'utilisateur
chmod u+x script.sh

# Changer le propriétaire (nécessite sudo)
sudo chown root:root script.sh
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Symptôme** : "Permission denied" en essayant de faire `cd` dans un dossier où l'on a pourtant les droits de lecture (`r`).
- **Diagnostic** : Sur un répertoire, la lecture ne suffit pas. L'exécution (`x`) est indispensable pour "entrer" ou "traverser" un dossier.
- **Réflexe** : Faire un `chmod +x` sur le répertoire.

---

## 3) Sécurité et Moindre Privilège avec sudo (2h00)

### 📖 3.1 Narration & Intuition
Le compte `root` est dangereux : il peut détruire tout le serveur en une commande (`rm -rf /`). La bonne pratique (le "Moindre Privilège") consiste à se connecter avec un utilisateur standard et de demander exceptionnellement les pouvoirs de `root` uniquement pour la commande qui le nécessite. C'est le rôle de `sudo` (SuperUser DO). C'est comme le passe-partout du gardien, prêté temporairement, et tracé dans les logs.

### 🔍 3.2 Anatomie Technique
- `/etc/sudoers` : Fichier de configuration définissant qui peut utiliser `sudo`. **Ne jamais éditer avec vim/nano directement !** Toujours utiliser la commande `visudo` qui vérifie la syntaxe avant d'enregistrer pour éviter de verrouiller le système.
- Syntaxe type : `utilisateur ALL=(ALL:ALL) ALL`.
- `sudo -i` ou `sudo su -` : Permet d'ouvrir un shell interactif root (à éviter si possible).

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Exécuter une commande en tant que root
sudo apt update

# Ajouter un utilisateur au groupe sudo (sous Ubuntu/Debian, le groupe est 'sudo', sous CentOS/RHEL c'est 'wheel')
sudo usermod -aG sudo stagiaire

# Vérifier que l'utilisateur appartient au groupe
id stagiaire

# Regarder les tentatives d'utilisation de sudo (Logs de sécurité)
sudo tail /var/log/auth.log | grep sudo
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Symptôme** : "stagiaire is not in the sudoers file. This incident will be reported."
- **Diagnostic** : L'utilisateur essaie de taper `sudo` mais n'a pas été autorisé par l'administrateur (il n'est pas dans le groupe sudo ou dans `/etc/sudoers`).
- **Réflexe** : Se connecter avec un compte administrateur légitime et l'ajouter au groupe sudo via `usermod -aG sudo <user>`.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Auditer et Sécuriser un dossier
- **Consigne** :
  1. En tant que votre utilisateur standard, créez un dossier `/tmp/top_secret`.
  2. Modifiez les droits pour que vous seul puissiez lister, lire et écrire dedans, et que personne d'autre (groupe ou autres) n'ait aucun accès.
  3. Créez un fichier `rapport.txt` à l'intérieur.
  4. Donnez la propriété de ce fichier à `root` (en utilisant `sudo`).
- **Livrables à produire** : Capture d'écran montrant l'exécution des commandes, suivie d'un `ls -ld /tmp/top_secret` et d'un `ls -l /tmp/top_secret/rapport.txt`.
- **Corrigé détaillé & Guidé** :
```bash
mkdir /tmp/top_secret
chmod 700 /tmp/top_secret
ls -ld /tmp/top_secret
touch /tmp/top_secret/rapport.txt
sudo chown root:root /tmp/top_secret/rapport.txt
ls -l /tmp/top_secret/rapport.txt
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)
1. **Dans quel fichier sont stockés de manière sécurisée les hachages des mots de passe ?**
   A) `/etc/passwd`
   B) `/etc/shadow`
   C) `/etc/security`
   D) `/var/log/auth.log`
   *Réponse : B*

2. **Quelle est la valeur octale correspondante aux droits symboliques `rwxr-xr--` ?**
   A) 754
   B) 774
   C) 755
   D) 644
   *Réponse : A*

3. **Quelle autorisation est absolument requise pour pouvoir faire `cd` dans un répertoire ?**
   A) Lecture (r)
   B) Écriture (w)
   C) Exécution (x)
   D) setuid (s)
   *Réponse : C*

4. **Quelle commande doit-on TOUJOURS utiliser pour modifier le fichier sudoers ?**
   A) `nano /etc/sudoers`
   B) `chmod 777 /etc/sudoers`
   C) `visudo`
   D) `sudo edit`
   *Réponse : C*

5. **Comment changer le propriétaire d'un fichier "document.txt" pour qu'il appartienne à l'utilisateur "alice" et au groupe "rh" ?**
   A) `chmod alice:rh document.txt`
   B) `chown alice:rh document.txt`
   C) `usermod alice rh document.txt`
   D) `chgrp alice document.txt`
   *Réponse : B*
