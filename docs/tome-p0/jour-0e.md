# Jour J0E — Premiers Pas dans le Terminal & la Ligne de Commande (CLI)

> [!NOTE]
> **SEMESTRE 0 — PARCOURS D'INITIATION ET SOCLE DE PRÉ-REQUIS ABSOLUS (J0a–J0o)**  
> Cette leçon lève définitivement l'appréhension de la ligne de commande. Vous allez comprendre l'architecture du terminal, décoder le Prompt, maîtriser la grammaire Unix, les variables d'environnement, les redirections et les raccourcis clavier des professionnels.

---

## 🎯 Objectifs de la Leçon

- 🖤 Démystifier la différence entre Émulateur de Terminal, Shell et TTY.
- 🔍 Décoder l'invite de commande (**Prompt**) et comprendre les statuts d'utilisateur (`$` vs `#`).
- ✍️ Maîtriser la grammaire universelle d'une commande Unix (`Commande -Options Arguments`).
- 🔄 Découvrir les flux standards (`stdin`, `stdout`, `stderr`) et les redirections (`>`, `>>`, `|`).
- ⚡ Employer les raccourcis clavier de productivité (`Tab`, `Ctrl+R`, `Ctrl+C`, `Ctrl+L`).
- 🧪 Manipuler 15+ commandes de base du système sous Linux.

---

## 🖼️ Le Terminal Linux

![Terminal Linux](https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800)

---

## 📖 1. Distinguer Terminal, Shell et Console (TTY)

Beaucoup de débutants confondent ces trois notions. Voici leur rôle exact :

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. ÉMULATEUR DE TERMINAL (La Fenêtre Graphique)                         │
│    Ex: GNOME Terminal, Alacritty, iTerm2, Windows Terminal              │
│    - Reçoit vos frappes clavier et affiche le texte à l'écran.          │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. SHELL / INTERPRÉTEUR (Le Programme Intelligent)                      │
│    Ex: Bash (/bin/bash), Zsh (/bin/zsh), Fish                           │
│    - Lit la commande tapée, l'analyse, recherche l'exécutable et        │
│      transmet la demande au Noyau (Kernel).                             │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. CONSOLE VIRTUELLE / TTY (Teletypewriter / Devicename)                │
│    Ex: /dev/pts/0, /dev/tty1                                            │
│    - Le canal de communication textuel abstrait entre l'émulateur       │
│      et le shell.                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📖 2. Décoder l'Invite de Commande (The Prompt)

Lorsque vous ouvrez un terminal sous Linux, l'invite de commande (*Prompt*) vous affiche un état des lieux instantané avant même de taper une commande :

```
     adolphe @ paradis-srv : ~ $
     │       │ │           │ │ │
     │       │ │           │ │ └─── Statut Privilège ($ = Utilisateur Standard / # = Root)
     │       │ │           │ └───── Répertoire Courant (~ = /home/adolphe)
     │       │ │           └─────── Séparateur de chemin
     │       │ └─────────── Nom de la machine (Hostname)
     │       └───────────── Séparateur Arobase
     └───────────────────── Nom de l'utilisateur actuellement connecté
```

- **Le Symbole Tilde (`~`)** : C'est le raccourci Unix universel pour désigner votre répertoire personnel (ex: `/home/adolphe`).
- **Le Symbole `$` vs `#`** :
  - **`$`** : Vous êtes connecté en tant qu'utilisateur standard (sécurisé, sans droits d'administration directe).
  - **`#`** : Vous êtes connecté en tant que super-utilisateur **root** (administrateur suprême ayant tous les droits de destruction ou de création sur la machine).

---

## 📖 3. La Grammaire Universelle d'une Commande Unix

Presque toutes les commandes Unix respectent une structure grammaticale stricte à 3 composants :

```
  Nom_de_Commande      -Option_Courte / --option-longue      Arguments (Cibles)
  ───────────────      ────────────────────────────────      ──────────────────
        ls                         -l  -a                            /var/log
       grep                      -i --color                        "ERROR" app.log
```

1. **Le Nom de la Commande** : Le binaire ou la fonction à exécuter (ex: `ls`, `grep`, `cp`).
2. **Les Options / Flags** : Précédées d'un tiret simple `-` (option courte sur 1 lettre) ou d'un double tiret `--` (option longue explicite). Elles modifient le comportement de la commande.
   - Exemple : `ls -l` (format long détaillé), `ls -a` (afficher tous les fichiers cachés), `ls -la` (combinaison des deux).
3. **Les Arguments** : La cible ou les données sur lesquelles la commande doit agir (un fichier, un dossier, une adresse IP, un texte).

---

## 📖 4. La Philosophie Unix : Flux Standards & Le Pipe (`|`)

### 4.1 Les 3 Flux Standards (File Descriptors 0, 1, 2)

Chaque commande Unix ouverte dans le terminal dispose de 3 canaux de communication ouverts par défaut :

```
                  ┌────────────────────────┐
                  │ 0 : stdin (Clavier)    │ ────► Entrée des données
                  └────────────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │  COMMANDE UNIX (ex:  │
                   │    grep / cat / ls)  │
                   └──────────┬───────────┘
                              │
         ┌────────────────────┴────────────────────┐
         ▼                                         ▼
┌────────────────────────┐               ┌────────────────────────┐
│ 1 : stdout (Écran)     │               │ 2 : stderr (Erreurs)   │
│ Sortie normale du texte│               │ Messages de dysfonc.   │
└────────────────────────┘               └────────────────────────┘
```

### 4.2 Les Redirections et le Tube / Pipe (`|`)

Vous pouvez rediriger ces flux avec des opérateurs spéciaux :

- **`>` (Redirection sortante avec écrasement)** : Redirige la sortie normale `stdout` dans un fichier (écrase le contenu existant).
  - Exemple : `date > aujourdhui.txt`
- **`>>` (Redirection sortante avec ajout)** : Ajoute le texte à la fin du fichier sans rien effacer.
  - Exemple : `echo "Nouvelle ligne" >> journal.log`
- **`2>` (Redirection d'erreur)** : Redirige uniquement les messages d'erreur `stderr` vers un fichier.
  - Exemple : `ls /dossier_inexistant 2> erreurs.log`
- **`|` (Le Pipe / Tuyau)** : Connecte directement la sortie `stdout` de la commande A vers l'entrée `stdin` de la commande B.
  - Exemple : `ps aux | grep nginx` (Affiche tous les processus ET filtre uniquement les lignes contenant "nginx").

---

## 📖 5. Raccourcis Clavier Pro pour le Terminal

Gagnez 10x plus de temps en maîtrisant ces raccourcis dans Bash :

| Raccourci | Action |
| :--- | :--- |
| **`Tab`** | **Auto-complétion automatique** du nom de commande ou de fichier. (Tapez 2 fois pour la liste). |
| **`Ctrl + R`** | **Recherche inversée dans l'historique** des commandes tapées précédemment. |
| **`Ctrl + C`** | **Interrompt / Annule** la commande en cours d'exécution (Envoie le signal `SIGINT`). |
| **`Ctrl + L`** | **Nettoie l'écran** du terminal (Équivalent de la commande `clear`). |
| **`Ctrl + A`** | Déplace le curseur au tout **début de la ligne**. |
| **`Ctrl + E`** | Déplace le curseur à la **fin de la ligne**. |
| **`Ctrl + U`** | **Efface tout** le texte situé avant le curseur. |
| **`Ctrl + D`** | Signale la fin de fichier (EOF) ou déconnecte la session terminal en cours (`exit`). |
| **`!!`** | **Répète la toute dernière commande**. Exemple puissant : `sudo !!` pour relancer avec sudo ! |

---

## 🧪 Atelier Pratique : Découvrir et Manipuler le Système

Exécutez cette série de 10 commandes réelles dans votre terminal Linux :

```bash
# 1. Connaître le nom de votre compte utilisateur actuel
whoami
# Output attendu: votre nom d'utilisateur (ex: adolphe)

# 2. Connaître votre identifiant numérique (UID), groupe principal (GID) et groupes secondaires
id
# Output attendu: uid=1000(adolphe) gid=1000(adolphe) groups=1000(adolphe),27(sudo),135(docker)...

# 3. Afficher le répertoire de travail exact où vous vous trouvez (Print Working Directory)
pwd
# Output attendu: /home/adolphe

# 4. Afficher la date et l'heure système au format ISO
date --iso-8601=seconds
# Output attendu: 2024-12-01T14:30:00+02:00

# 5. Afficher un calendrier du mois en cours
cal

# 6. Écrire du texte dans la sortie standard et créer un fichier
echo "Bienvenue dans la Masterclass PARADIS IT" > test.txt

# 7. Lire le contenu d'un fichier texte dans le terminal
cat test.txt
# Output attendu: Bienvenue dans la Masterclass PARADIS IT

# 8. Afficher les 10 dernières commandes exécutées dans votre historique
history | tail -10

# 9. Trouver le chemin d'accès binaire d'une commande
which bash python3 git
# Output attendu: /usr/bin/bash  /usr/bin/python3  /usr/bin/git

# 10. Nettoyer l'affichage du terminal
clear
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Message d'Erreur : `bash: command not found`
- **Cause** : Vous avez mal orthographié le nom de la commande, ou le logiciel n'est pas installé sur la machine, ou le répertoire du binaire n'est pas répertorié dans votre variable d'environnement `$PATH`.
- **Réflexe** : Vérifiez l'orthographe. Tapez `which nom_commande` ou vérifiez si le paquet doit être installé avec `sudo apt install nom_paquet`.

### 2. Le terminal semble "bloqué" sans redonner la main
- **Cause** : Une commande est en train d'exécuter une tâche longue (ex: `ping` sans option `-c`, ou une boucle infinie dans un script).
- **Réflexe** : Appuyez sur **`Ctrl + C`** pour interrompre immédiatement l'exécution et récupérer le contrôle du Prompt.

### 3. Message d'Erreur : `Permission denied`
- **Cause** : Vous essayez de lire, modifier un fichier ou lancer une commande exigeant les droits d'administration alors que vous êtes utilisateur standard (`$`).
- **Réflexe** : Si vous êtes autorisé à administrer la machine, préfixez la commande avec **`sudo`** (ex: `sudo cat /var/log/auth.log`).

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Dans l'invite de commande `user@serveur:~$`, que signifie le symbole `$` tout à la fin ?**
- A) Que l'ordinateur nécessite de payer un abonnement
- B) Que vous êtes connecté en tant qu'utilisateur standard (sans privilèges root)
- C) Que vous êtes l'administrateur suprême root
- D) Que le disque dur est plein

*Réponse : B — Le symbole `$` indique un utilisateur standard. Le symbole `#` indique le super-utilisateur root.*

**Q2 : Que fait l'opérateur de redirection simple `>` dans la commande `echo "Test" > fichier.txt` ?**
- A) Il compare le texte avec le contenu du fichier
- B) Il redirige la sortie du texte dans le fichier en **écrasant** tout contenu précédent
- C) Il supprime le fichier
- D) Il envoie un email

*Réponse : B — `>` redirige la sortie `stdout` vers un fichier et écrase son contenu. Pour ajouter à la fin sans écraser, on utilise `>>`.*

**Q3 : Quel raccourci clavier permet de rechercher instantanément une ancienne commande dans l'historique de votre terminal Bash ?**
- A) `Ctrl + F`
- B) `Ctrl + R`
- C) `Alt + Tab`
- D) `Ctrl + Z`

*Réponse : B — `Ctrl + R` active la recherche incrémentale inversée dans l'historique des commandes.*

**Q4 : Que signifie le symbole tilde `~` dans un chemin de fichier Linux ?**
- A) Le répertoire racine du disque `/`
- B) Le répertoire temporaire `/tmp`
- C) Le répertoire personnel de l'utilisateur connecté (ex: `/home/utilisateur`)
- D) Le dossier système `/var/log`

*Réponse : C — Le tilde `~` est le raccourci universel désignant le dossier personnel de l'utilisateur actif ($HOME).*

**Q5 : À quoi sert l'opérateur de tuyau (Pipe `|`) entre deux commandes (ex: `ps aux | grep nginx`) ?**
- A) À exécuter les deux commandes le jour suivant
- B) À connecter la sortie standard (`stdout`) de la première commande directement vers l'entrée standard (`stdin`) de la seconde
- C) À effacer l'écran du terminal
- D) À redémarrer le serveur

*Réponse : B — Le Pipe `|` enchaîne deux commandes en injectant la sortie de la première comme entrée de la seconde.*

**Q6 : Quelle commande Unix permet d'afficher le chemin d'accès absolu du répertoire exact dans lequel vous vous trouvez ?**
- A) `ls`
- B) `whoami`
- C) `pwd` (Print Working Directory)
- D) `cd`

*Réponse : C — `pwd` récapitule le chemin d'accès absolu du dossier de travail actif.*

**Q7 : Que fait la combinaison de touches `sudo !!` dans un terminal Bash ?**
- A) Elle annule la dernière commande
- B) Elle réexécute la toute dernière commande tapée mais en lui ajoutant les privilèges d'administration `sudo`
- C) Elle ferme le terminal
- D) Elle réinitialise le mot de passe root

*Réponse : B — `!!` représente la dernière commande tapée. Précédé de `sudo`, il permet de la relancer immédiatement avec les privilèges root sans avoir à la retaper.*

**Q8 : Quel flux standard porte le descripteur de fichier `2` dans le système Linux ?**
- A) `stdin` (Entrée standard)
- B) `stdout` (Sortie standard)
- C) `stderr` (Sortie d'erreur standard)
- D) `stdnull` (Poubelle système)

*Réponse : C — Descripteur 0 = stdin, 1 = stdout, 2 = stderr.*

---

## 📚 Ressources & Références

- **GNU Bash Reference Manual** : https://www.gnu.org/software/bash/manual/
- **ss64 Bash Commands Reference** : https://ss64.com/bash/
- **Explainshell** (décortique le rôle de chaque option d'une commande) : https://explainshell.com

---

*Semestre 0 — Module d'Initiation & Pré-requis Absolus PARADIS IT Masterclass*
