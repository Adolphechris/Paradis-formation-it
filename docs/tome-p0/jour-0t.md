# Jour J0T — Bootcamp Linux : 30 Commandes Essentielles

> [!NOTE]
> **JOUR DE TRANSITION VERS LE SEMESTRE 1 — S0→S1 (J0p–J0v)**  
> Cette leçon est un bootcamp intensif des commandes Linux que vous utiliserez tous les jours en S1. Aucun prérequis technique n'est nécessaire.

---

## 🎯 Objectifs de la Leçon
- 🖥️ Maîtriser 30 commandes Linux essentielles.
- 📂 Naviguer dans l'arborescence Linux avec aisance.
- 📁 Manipuler fichiers et dossiers.
- 🔍 Rechercher et inspecter du contenu.
- 👤 Gérer les utilisateurs et les permissions.
- 🛠️ Produire une cheat sheet personnelle.

---

## 📖 1. Les 30 commandes par catégorie

### 1.1 Navigation (5 commandes)

| Commande | Usage | Exemple |
|---|---|---|
| `pwd` | Afficher le répertoire courant | `pwd` → `/home/user` |
| `ls` | Lister le contenu | `ls -lah` (détails + cachés + tailles lisibles) |
| `cd` | Changer de répertoire | `cd /var/log`, `cd ..`, `cd ~` |
| `mkdir` | Créer un dossier | `mkdir -p projet/data/output` |
| `rmdir` | Supprimer un dossier vide | `rmdir ancien_dossier` |

### 1.2 Fichiers (5 commandes)

| Commande | Usage | Exemple |
|---|---|---|
| `touch` | Créer un fichier vide | `touch script.sh` |
| `cp` | Copier un fichier/dossier | `cp fichier.txt /backup/` |
| `mv` | Déplacer/renommer | `mv ancien.txt nouveau.txt` |
| `rm` | Supprimer un fichier | `rm fichier.txt` |
| `cat` | Afficher le contenu d'un fichier | `cat /etc/hostname` |

### 1.3 Dossiers avancés (5 commandes)

| Commande | Usage | Exemple |
|---|---|---|
| `cp -r` | Copier un dossier récursivement | `cp -r projet/ backup/` |
| `rm -r` | Supprimer un dossier et son contenu | `rm -r ancien_projet/` |
| `tree` | Afficher l'arborescence | `tree -L 2` (2 niveaux) |
| `find` | Rechercher des fichiers | `find /home -name "*.log"` |
| `locate` | Recherche rapide (base de données) | `locate nginx.conf` |

### 1.4 Recherche et contenu (5 commandes)

| Commande | Usage | Exemple |
|---|---|---|
| `grep` | Rechercher dans du texte | `grep "error" /var/log/syslog` |
| `wc` | Compter lignes/mots/caractères | `wc -l fichier.txt` |
| `sort` | Trier des lignes | `sort liste.txt` |
| `uniq` | Supprimer les doublons | `sort liste.txt \| uniq` |
| `head` / `tail` | Voir le début/fin d'un fichier | `tail -n 20 /var/log/syslog` |

### 1.5 Système et utilisateurs (5 commandes)

| Commande | Usage | Exemple |
|---|---|---|
| `whoami` | Afficher l'utilisateur courant | `whoami` → `adolphe` |
| `id` | Afficher UID/GID et groupes | `id` |
| `sudo` | Exécuter en tant qu'administrateur | `sudo apt update` |
| `apt` | Gérer les paquets (Debian/Ubuntu) | `apt install htop` |
| `df -h` | Afficher l'espace disque | `df -h /` |

### 1.6 Processus et réseau (5 commandes)

| Commande | Usage | Exemple |
|---|---|---|
| `ps aux` | Lister tous les processus | `ps aux \| grep nginx` |
| `kill` | Terminer un processus | `kill 1234` |
| `ping` | Tester la connectivité | `ping -c 4 google.com` |
| `curl` | Tester une URL/API | `curl https://api.example.com` |
| `ss` | Afficher les connexions réseau | `ss -tlnp` |

---

## 🧪 Atelier Pratique : Maîtriser les 30 commandes

### Mission 1 : Navigation et fichiers
```bash
# Créer une structure de dossiers
mkdir -p ~/portfolio-paradis/S0-transition/J0t-commandes/{scripts,rapports,captures}

# Créer des fichiers
touch ~/portfolio-paradis/S0-transition/J0t-commandes/scripts/{backup.sh,monitor.sh,deploy.sh}

# Copier un fichier
cp ~/portfolio-paradis/S0-transition/J0t-commandes/scripts/backup.sh ~/portfolio-paradis/S0-transition/J0t-commandes/scripts/backup_sauvegarde.sh

# Voir l'arborescence
tree -L 3 ~/portfolio-paradis/S0-transition/J0t-commandes/
```

### Mission 2 : Recherche et contenu
```bash
# Créer un fichier avec des doublons
echo -e "erreur\nerreur\navertissement\nerreur\ninfo" > ~/log_test.txt

# Compter les lignes
wc -l ~/log_test.txt

# Trier et supprimer les doublons
sort ~/log_test.txt | uniq -c

# Rechercher "erreur" dans le fichier
grep "erreur" ~/log_test.txt
```

### Mission 3 : Système et réseau
```bash
# Voir qui vous êtes
whoami
id

# Voir l'espace disque
df -h /

# Tester la connectivité
ping -c 3 google.com

# Voir les connexions actives
ss -tlnp
```

---

## 📖 2. La cheat sheet personnelle

Créez un fichier `cheat-sheet-linux.md` dans votre portfolio avec les 30 commandes que vous venez de maîtriser. Format :

```markdown
# Cheat Sheet Linux — 30 Commandes Essentielles

## Navigation
| Commande | Usage | Exemple |
|---|---|---|
| `pwd` | Répertoire courant | `pwd` |
| `ls -lah` | Lister avec détails | `ls -lah /var/log` |
| `cd ..` | Remonter d'un niveau | `cd ..` |

## Fichiers
| Commande | Usage | Exemple |
|---|---|---|
| `touch fichier.txt` | Créer un fichier | `touch script.sh` |
| `cp src dest` | Copier | `cp fichier.txt /backup/` |

...
```

**Livrable** : Votre cheat sheet complète avec les 30 commandes.

---

## ❓ Banque de QCM & Test du Jour (5 Questions)

**Q1 : Quelle commande affiche le répertoire courant ?**
- A) `ls`
- B) `pwd`
- C) `cd`
- D) `mkdir`

*Réponse : B — `pwd` (Print Working Directory) affiche le chemin absolu du répertoire courant.*

**Q2 : Quelle commande permet de créer un dossier ?**
- A) `touch`
- B) `mkdir`
- C) `rm`
- D) `cp`

*Réponse : B — `mkdir` (Make Directory) crée un nouveau dossier.*

**Q3 : Quelle commande recherche une chaîne de caractères dans un fichier ?**
- A) `sort`
- B) `grep`
- C) `wc`
- D) `find`

*Réponse : B — `grep` recherche et affiche les lignes contenant la chaîne spécifiée.*

**Q4 : Quelle commande affiche les processus en cours ?**
- A) `ping`
- B) `ps aux`
- C) `curl`
- D) `df -h`

*Réponse : B — `ps aux` liste tous les processus actifs sur le système.*

**Q5 : Comment rendre un script Bash exécutable ?**
- A) `rm script.sh`
- B) `chmod +x script.sh`
- C) `cp script.sh /tmp`
- D) `cat script.sh`

*Réponse : B — `chmod +x` ajoute le droit d'exécution au fichier.*

---

*Jour de Transition S0→S1 — Module J0t*
