# SEMESTRE 1 — Jour 05 (6h) : Flux d'Entrée/Sortie, Redirections & Pipelines

> [!NOTE]
> **Objectif de la journée** : Comprendre et manipuler la philosophie fondamentale de Linux : "Tout est fichier" et "Les programmes font une seule chose mais la font bien, et communiquent entre eux".
> **Compétences visées** : `BIT-02` (A), `BIT-05` (A) — Redirections shell et traitement de texte Linux.

---

## 1) Les Canaux Standards et Redirections (1h30)

### 📖 1.1 Narration & Intuition
Chaque commande Linux naît avec trois "tuyaux" invisibles branchés sur elle. Le tuyau d'arrivée (stdin) par lequel elle lit les données (par défaut votre clavier), le tuyau de sortie (stdout) où elle crache le résultat (par défaut l'écran), et le tuyau d'erreur (stderr) où elle crie si quelque chose se passe mal. Le pouvoir du Shell, c'est de débrancher ces tuyaux de l'écran pour les brancher sur des fichiers.

### 🔍 1.2 Anatomie Technique
- **0 - stdin (Standard Input)** : L'entrée standard.
- **1 - stdout (Standard Output)** : La sortie standard (les résultats normaux).
- **2 - stderr (Standard Error)** : La sortie d'erreur (les messages d'erreur).
- **`>`** : Redirige stdout vers un fichier (écrase le fichier s'il existe).
- **`>>`** : Redirige stdout vers un fichier (ajoute à la fin du fichier, "append").
- **`2>`** : Redirige spécifiquement les erreurs (stderr).
- **`&>` ou `> fichier 2>&1`** : Redirige à la fois stdout et stderr dans le même fichier.
- **`/dev/null`** : Le trou noir de Linux. Tout ce qui y est envoyé disparaît à jamais.

### 🛠️ 1.3 Atelier Pratique Hands-on
```bash
# Rediriger un affichage dans un fichier
echo "Bonjour" > message.txt

# Ajouter au fichier sans écraser
echo "Le Monde" >> message.txt

# Générer une erreur (fichier qui n'existe pas) et rediriger l'erreur
ls /dossier_inexistant 2> erreurs.log

# Cacher les erreurs dans le trou noir
ls /dossier_inexistant 2> /dev/null
```

### 🚑 1.4 Diagnostic & Réflexes Terrain
- **Piège classique** : Oublier le `>>` et utiliser `>` détruit le fichier de configuration original. **Attention** !
- **Réflexe** : Testez toujours votre commande à l'écran avant d'ajouter `> fichier`. 

---

## 2) Les Pipelines : Le Lego du Shell (2h00)

### 📖 2.1 Narration & Intuition
Si les redirections branchent la sortie d'un programme dans un fichier, le "pipe" (le caractère `|`) permet de brancher la sortie d'un programme *directement dans l'entrée d'un autre programme*. C'est comme une chaîne de montage d'usine : le programme A extrait la matière première, le programme B la nettoie, le programme C l'emballe.

### 🔍 2.2 Anatomie Technique
Le symbole `|` (tube ou pipe) connecte le `stdout` de la commande de gauche au `stdin` de la commande de droite.
Les filtres de base :
- **`cat`** : Affiche tout le contenu.
- **`less`** : Permet de paginer l'affichage (naviguer avec flèches, `q` pour quitter).
- **`head` / `tail`** : Affiche les 10 premières / dernières lignes. `tail -f` suit un fichier en temps réel (logs).
- **`wc` (word count)** : Compte les lignes (`-l`), mots (`-w`), caractères (`-c`).

### 🛠️ 2.3 Atelier Pratique Hands-on
```bash
# Afficher le contenu de /etc/passwd en paginant
cat /etc/passwd | less

# Compter le nombre de processus en cours
ps aux | wc -l

# Surveiller les nouveaux messages système en direct
tail -f /var/log/syslog
# (sur certaines distributions modernes : tail -f /var/log/messages)
```

### 🚑 2.4 Diagnostic & Réflexes Terrain
- **Symptôme** : `cat fichier.log` affiche des millions de lignes et bloque le terminal.
- **Réflexe** : Appuyez frénétiquement sur `Ctrl+C`. La prochaine fois, utilisez `less fichier.log` ou `head fichier.log`.

---

## 3) Filtrage Avancé : grep, sort, uniq (1h30)

### 📖 3.1 Narration & Intuition
Pour trouver une aiguille dans une botte de foin, on ne lit pas toute la botte. On utilise un aimant. `grep` est cet aimant. Une fois les données filtrées, on a souvent besoin de les trier (`sort`) et de supprimer les doublons (`uniq`). Ce trio forme l'outil d'analyse de données le plus puissant du monde Linux.

### 🔍 3.2 Anatomie Technique
- **`grep "motif"`** : Filtre les lignes contenant le motif.
  - `-i` : Ignore la casse (majuscule/minuscule).
  - `-v` : Inverse la recherche (exclut les lignes).
- **`sort`** : Trie alphabétiquement.
  - `-n` : Tri numérique.
  - `-r` : Tri inversé (descendant).
- **`uniq`** : Supprime les lignes répétées *consécutives*.
  - `-c` : Compte le nombre de répétitions.
  - *Note : `uniq` ne fonctionne que si la liste est d'abord triée avec `sort` !*

### 🛠️ 3.3 Atelier Pratique Hands-on
```bash
# Trouver l'utilisateur 'root' dans /etc/passwd
grep "root" /etc/passwd

# Exclure les lignes vides ou commentées d'un fichier de config
grep -v "^#" /etc/ssh/sshd_config | grep -v "^$"

# Créer un fichier avec des doublons, le trier et compter les occurrences
echo -e "pomme\nbanane\npomme\npoire\nbanane\nbanane" > fruits.txt
cat fruits.txt | sort | uniq -c
```

### 🚑 3.4 Diagnostic & Réflexes Terrain
- **Symptôme** : `uniq` laisse des doublons dans le résultat.
- **Réflexe** : Vous avez oublié de faire un `sort` avant ! Toujours faire `... | sort | uniq`.

---

## 🏧️ Exercices Pratiques (Preuves de Portfolio)

### Exercice 1 : Analyse Logique de Sécurité
- **Consigne** : Dans le répertoire courant, comptez combien de processus uniques sont exécutés par l'utilisateur 'root'.
- **Livrables à produire** : La commande pipeline (une ligne) exacte qui produit le chiffre.
- **Corrigé détaillé & Guidé** :
```bash
# 1. Lister les processus
# 2. Filtrer par root au début de la ligne
# 3. Extraire le nom de la commande (on utilise souvent awk, mais ici restons simples ou trions tout le rendu)
ps aux | grep "^root" | wc -l

# Pour vraiment voir les processus *uniques* (noms de commande) :
ps -U root -u root -o comm= | sort | uniq | wc -l
```

---

## ❓ Banque de Questions QCM (Évaluation 75% minimum)

1. QCM: Quel descripteur de fichier correspond à la sortie d'erreur standard (stderr) ?
   A) 0
   B) 1
   C) 2
   D) 3
   **Réponse : C**

2. QCM: Quelle commande écrase le contenu de `fichier.txt` avec le mot "Test" ?
   A) echo "Test" >> fichier.txt
   B) echo "Test" > fichier.txt
   C) echo "Test" | fichier.txt
   D) cat "Test" > fichier.txt
   **Réponse : B**

3. QCM: À quoi sert le symbole `|` (pipe) ?
   A) À lancer deux commandes en parallèle.
   B) À connecter la sortie standard d'une commande à l'entrée d'une autre.
   C) À rediriger l'erreur standard vers le trou noir.
   D) À mettre un processus en arrière-plan.
   **Réponse : B**

4. QCM: Quelle option de `grep` permet de rechercher sans tenir compte de la casse ?
   A) -v
   B) -r
   C) -c
   D) -i
   **Réponse : D**

5. QCM: Pourquoi faut-il utiliser `sort` avant `uniq` ?
   A) Parce que `uniq` est trop lent sinon.
   B) Parce que `uniq` ne détecte que les doublons consécutifs (côte à côte).
   C) C'est faux, on peut utiliser `uniq` seul.
   D) Pour éviter les erreurs de casse.
   **Réponse : B**
