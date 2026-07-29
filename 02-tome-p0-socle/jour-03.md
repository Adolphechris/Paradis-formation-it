# TOME P0 — Jour 03 (14h) : Linux Ubuntu, Ligne de Commande & Mini-Projet P0

> [!NOTE]
> **Objectif de la journée** : Maîtriser l'environnement Linux en ligne de commande — le système d'exploitation des serveurs du monde entier — et finaliser votre premier projet professionnel de la formation. À la fin de ce cours, vous naviguerez avec assurance dans un terminal Linux, gérerez des fichiers et des permissions, et livrerez un mini-projet complet.

---

## 1) Introduction à Linux : L'OS des Serveurs (1h)

### 📖 1.1 Pourquoi Linux ? L'OS Invisible qui Fait Tourner le Monde

Vous ne l'avez peut-être jamais vu, mais Linux est partout. Les serveurs de Google, Facebook, Amazon, les supercalculateurs de la NASA, les serveurs de la Banque Centrale du Congo et 96% des serveurs web dans le monde tournent sous Linux.

Pourquoi ? Parce que Linux est :
- **Gratuit et open-source** : Pas de licence à payer pour chaque serveur.
- **Stable et fiable** : Les serveurs Linux peuvent tourner pendant des années sans redémarrage.
- **Sécurisé** : Son architecture de permissions stricte le rend très résistant aux virus.
- **Puissant en ligne de commande** : Vous pouvez gérer entièrement un serveur distant sans interface graphique, uniquement via du texte.

> [!TIP]
> **Analogie** : Si Windows est une voiture automatique confortable, Linux est un véhicule de course avec boîte manuelle. Plus complexe à prendre en main, mais infiniment plus performant et contrôlable une fois maîtrisé.

---

## 2) La Ligne de Commande Linux : Naviguer dans le Système (3h)

### 📖 2.1 Le Terminal : Votre Cockpit de Pilotage

Le **Terminal** (aussi appelé Shell, Bash, Invite de commandes Linux) est l'interface texte pure de Linux. Vous tapez une commande, appuyez sur `Entrée`, et Linux l'exécute immédiatement.

Pour ouvrir un terminal sous Ubuntu : `Ctrl + Alt + T`

Le curseur qui s'affiche ressemble à ceci :
```
adolphe@ubuntu-server:~$
```
- `adolphe` = votre nom d'utilisateur
- `ubuntu-server` = le nom de la machine
- `~` = vous êtes dans votre dossier personnel (`/home/adolphe`)
- `$` = vous êtes un utilisateur standard (pas root/admin)

### 🔍 2.2 L'Architecture du Système de Fichiers Linux

Linux organise ses fichiers dans une arborescence unique à partir d'une racine `/` :

```
/                    ← Racine absolue de tout le système
├── home/            ← Dossiers personnels des utilisateurs
│   └── adolphe/     ← Votre espace personnel (~ dans le terminal)
├── etc/             ← Fichiers de configuration système
├── var/             ← Logs et données variables (logs serveur ici)
├── tmp/             ← Fichiers temporaires (effacés au redémarrage)
├── usr/             ← Logiciels installés par l'utilisateur
└── bin/             ← Commandes système essentielles (ls, cp, mv...)
```

> [!IMPORTANT]
> Contrairement à Windows (`C:\Users\`), Linux utilise des `/` (slash) et non des `\` (antislash). La casse est également sensible : `Fichier.txt` ≠ `fichier.txt`.

---

### 🛠️ 2.3 Les Commandes de Navigation Essentielles

#### Savoir où vous êtes — `pwd`
```bash
pwd
# Résultat : /home/adolphe
```
`pwd` signifie **P**rint **W**orking **D**irectory. Il affiche votre position exacte dans l'arborescence.

#### Lister le contenu d'un dossier — `ls`
```bash
ls                    # Liste simple des fichiers
ls -l                 # Liste détaillée avec permissions, taille, date
ls -la                # Inclut les fichiers cachés (commencent par un .)
ls -lh                # Tailles en format lisible (Ko, Mo, Go)
```

#### Se déplacer — `cd`
```bash
cd /etc               # Aller dans le dossier /etc (chemin absolu)
cd Documents          # Aller dans le sous-dossier Documents (chemin relatif)
cd ..                 # Remonter d'un niveau
cd ~                  # Revenir directement à votre dossier personnel
cd -                  # Retourner au dossier précédent (pratique !)
```

---

## 3) Gestion de Fichiers et Permissions (3h)

### 🛠️ 3.1 Créer, Copier, Déplacer, Supprimer

```bash
# Créer un dossier
mkdir rapport-it
mkdir -p projets/2026/rapport-it   # Crée toute la hiérarchie d'un coup

# Créer un fichier vide
touch notes.txt

# Copier un fichier
cp notes.txt copie-notes.txt

# Déplacer ou renommer un fichier
mv notes.txt documents/notes-bcc.txt

# Supprimer — ATTENTION : IRRÉVERSIBLE sous Linux !
rm fichier.txt
rm -rf dossier/    # Supprime récursivement tout un dossier et son contenu
```

> [!WARNING]
> La commande `rm -rf /` effacerait **TOUT le système**. Ne jamais taper cela. Linux ne vous demandera pas de confirmation.

### 🔍 3.2 Le Système de Permissions Linux

Chaque fichier sous Linux a 3 niveaux de permissions pour 3 types d'acteurs :

```bash
ls -l rapport.txt
# -rw-r--r-- 1 adolphe staff 4096 2026-07-30 rapport.txt
#  │││││││││
#  │││╰╴╴╴╴╴ Permissions des autres utilisateurs (r--)
#  │││
#  │╰╴╴╴╴╴╴╴ Permissions du groupe (r--)
#  │
#  ╰╴╴╴╴╴╴╴╴ Permissions du propriétaire (rw-)
```

- `r` = read (lire)
- `w` = write (écrire/modifier)
- `x` = execute (exécuter comme programme)
- `-` = permission non accordée

```bash
# Donner le droit d'exécution au propriétaire
chmod u+x mon-script.sh

# Notation numérique (très courante) : r=4, w=2, x=1
chmod 755 mon-script.sh   # rwxr-xr-x
chmod 644 rapport.txt     # rw-r--r--
```

---

## 4) Processus, Paquets & Maintenance Système (2h)

### 🛠️ 4.1 Surveiller et Gérer les Processus

```bash
# Voir tous les processus actifs
ps aux

# Moniteur interactif en temps réel (comme le Gestionnaire des tâches Windows)
top
# Appuyer sur 'q' pour quitter

# Tuer un processus bloqué par son PID (numéro d'identification)
kill 1234

# Forcer la fermeture
kill -9 1234
```

### 🛠️ 4.2 Gestionnaire de Paquets APT (Installation de Logiciels)

Sous Linux, on n'installe pas de logiciels en téléchargeant des `.exe`. On utilise un **gestionnaire de paquets** qui télécharge et installe depuis des dépôts officiels sécurisés.

```bash
# Toujours commencer par mettre à jour la liste des paquets disponibles
sudo apt update

# Puis installer un logiciel (ex: l'éditeur de texte nano)
sudo apt install nano

# Mettre à jour tous les logiciels installés
sudo apt upgrade

# Supprimer un logiciel
sudo apt remove nano
```

> [!TIP]
> **`sudo`** signifie **S**uper **U**ser **DO**. Il vous permet d'exécuter une commande avec les droits d'administrateur (root) de manière temporaire et contrôlée, sans rester connecté en tant que root.

---

## 5) Mini-Projet de Fin de Tome P0 (3h)

### 🎯 Objectif : Créer un Portail d'Assistance IT Banque Centrale

Vous allez créer un site web statique professionnel (HTML5 + CSS3 + JS) représentant un portail d'assistance informatique pour la Banque Centrale.

#### Livrable Attendu :
```
portail-bcc/
├── index.html          ← Page d'accueil avec formulaire de ticket
├── css/
│   └── style.css       ← Styles professionnels (dark mode, responsive)
├── js/
│   └── app.js          ← Validation de formulaire + compteur tickets
└── README.md           ← Documentation Git du projet
```

#### Structure de base de `index.html` :
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Portail IT — Banque Centrale du Congo</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header>
        <h1>🏛️ Banque Centrale du Congo — Support IT</h1>
        <p>Système de gestion des incidents informatiques</p>
    </header>
    <main>
        <form id="ticket-form">
            <label for="nom">Nom complet :</label>
            <input type="text" id="nom" name="nom" required>

            <label for="email">Email professionnel :</label>
            <input type="email" id="email" name="email" required>

            <label for="type">Type d'incident :</label>
            <select id="type" name="type">
                <option>Problème réseau</option>
                <option>Imprimante défectueuse</option>
                <option>Compte bloqué</option>
            </select>

            <label for="description">Description :</label>
            <textarea id="description" rows="4" required></textarea>

            <button type="submit">Ouvrir le Ticket</button>
        </form>
    </main>
    <script src="js/app.js"></script>
</body>
</html>
```

#### Versioning Git du projet :
```bash
cd portail-bcc
git init
git add .
git commit -m "feat: initialisation portail IT BCC - Version 1.0"
```

---

## 🏋️ Exercices Pratiques & Corrigés

### Exercice 1 : Navigation et Structure
Créez l'arborescence suivante en une seule commande :
```
formation-bcc/j3/{docs,scripts,logs}
```
- **Corrigé** :
  ```bash
  mkdir -p formation-bcc/j3/{docs,scripts,logs}
  touch formation-bcc/j3/docs/notes.txt formation-bcc/j3/scripts/backup.sh formation-bcc/j3/logs/journal.log
  ls -R formation-bcc/j3
  ```

### Exercice 2 : Permissions
Créez un fichier `rapport-confidentiel.txt` et configurez-le pour que seul son propriétaire puisse le lire et l'écrire (aucun accès pour le groupe et les autres).
- **Corrigé** :
  ```bash
  touch rapport-confidentiel.txt
  chmod 600 rapport-confidentiel.txt
  ls -l rapport-confidentiel.txt
  # Résultat attendu : -rw------- 1 adolphe adolphe ...
  ```

---

## ❓ Banque de Questions & Test du Jour 03

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
