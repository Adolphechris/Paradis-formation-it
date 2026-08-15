# Jour J0L — La Boîte à Outils de l'Ingénieur IT : Maîtriser les Outils du Quotidien

> [!NOTE]
> **SEMESTRE 0 — PARCOURS D'INITIATION ET SOCLE DE PRÉ-REQUIS ABSOLUS (J0a–J0o)**
> Cette leçon présente l'arsenal d'outils qu'utilise tout ingénieur IT professionnel : éditeurs de texte, outils réseau, outils système, gestionnaire de version Git, et environnement de développement.

---

## 🎯 Objectifs de la Leçon

- 🛠️ Maîtriser 25+ outils CLI essentiels utilisés quotidiennement en production.
- 📝 Comprendre la différence entre vim, nano et les IDE modernes.
- 🔗 Faire ses premiers pas avec Git (contrôle de version).
- 🐋 Comprendre la virtualisation et les conteneurs (Docker intro).
- 📡 Maîtriser les outils réseau de diagnostic (ping, traceroute, dig, curl, nmap).
- 📊 Monitorer un système Linux en temps réel (top, htop, iostat, df, free).

---

## 🖼️ L'Atelier de l'Ingénieur IT

![Outils IT](https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800)

---

## 📖 1. Les Éditeurs de Texte — La Guerre Sainte

### 1.1 Narration & Intuition — Votre Premier Outil de Travail

Si le terminal est le cockpit de l'ingénieur IT, l'éditeur de texte est le manche de pilotage. Chaque fichier de configuration Linux, chaque script Bash, chaque règle de pare-feu est un fichier texte. Savoir le modifier rapidement, précisément et sans erreur est une compétence non-négociable.

La communauté IT se divise depuis des décennies sur une question fondamentale : **vim ou emacs ?** Mais en 2024, la réalité terrain est plus nuancée.

### 1.2 Comparatif des Éditeurs

| Éditeur | Courbe d'apprentissage | Usage principal | Disponibilité |
|:---|:---:|:---|:---:|
| **nano** | ⭐ Très facile | Modifications rapides sur serveur | Partout |
| **vim** | ⭐⭐⭐⭐ Difficile | Édition puissante en terminal | Partout |
| **neovim** | ⭐⭐⭐⭐ Difficile | vim modernisé + LSP + plugins | À installer |
| **VS Code** | ⭐⭐ Facile | Développement complet avec GUI | Desktop |
| **JetBrains IDEs** | ⭐⭐⭐ Moyen | Développement professionnel | Desktop |

> [!IMPORTANT]
> **Recommandation PARADIS IT** : Apprenez **nano** pour les urgences serveur, puis investissez dans **vim/neovim** pour l'efficacité long-terme. Utilisez **VS Code** pour le développement local.

### 1.3 Survie dans Vim — Les Commandes Indispensables

```bash
# Ouvrir/créer un fichier avec vim
vim mon_fichier.txt

# ---- MODE NORMAL (par défaut au démarrage) ----
# Navigation
h j k l      # ← ↓ ↑ → (déplacer le curseur)
gg           # Aller à la première ligne
G            # Aller à la dernière ligne
:42          # Aller à la ligne 42
/motif       # Chercher "motif" dans le fichier (n = suivant, N = précédent)

# Édition
i            # Passer en mode INSERT (écriture)
a            # Passer en mode INSERT après le curseur
o            # Nouvelle ligne en dessous + mode INSERT
dd           # Supprimer la ligne entière
yy           # Copier (yank) la ligne
p            # Coller après le curseur
u            # Annuler (Undo)
Ctrl+r       # Refaire (Redo)

# ---- MODE INSERT ----
Échap        # Revenir en mode NORMAL

# ---- MODE COMMANDE (:) ----
:w           # Sauvegarder
:q           # Quitter (si pas de changements)
:wq          # Sauvegarder et quitter
:q!          # Quitter sans sauvegarder (FORCE)
:%s/ancien/nouveau/g  # Remplacer tous les "ancien" par "nouveau"
```

```bash
# Nano — beaucoup plus simple
nano mon_fichier.txt
# Ctrl+O = Sauvegarder | Ctrl+X = Quitter | Ctrl+W = Chercher
```

---

## 📖 2. Les Outils Système — Monitorer et Gérer une Machine

### 2.1 Supervision des Ressources en Temps Réel

```bash
# top — Vue classique des processus (CPU, RAM, Load Average)
top
# Commandes dans top: q=quitter, k=kill process, M=trier par RAM, P=trier par CPU

# htop — Version améliorée et colorée de top
htop
# Si non installé: sudo apt install htop -y

# Afficher l'utilisation CPU en temps réel avec intervalles
vmstat 2 5
# Output: stats toutes les 2 secondes, 5 fois (CPU, mémoire, swap, I/O)

# Statistiques I/O disque en temps réel
iostat -x 1 3
# Output: % utilisation disque, lecture/écriture en Mo/s toutes les secondes

# Utilisation mémoire détaillée
free -h
# Output attendu: total used free shared buff/cache available

# Espace disque par partition
df -h
# Output attendu: Filesystem, Size, Used, Avail, Use%, Mounted on

# Espace disque utilisé par un répertoire
du -sh /var/log/
# Output attendu: taille totale des logs (ex: 254M /var/log/)

# Les 10 répertoires les plus lourds
du -sh /* 2>/dev/null | sort -rh | head -10
```

### 2.2 Gestion des Processus

```bash
# Lister tous les processus avec détails
ps aux
# USER PID %CPU %MEM VSZ RSS TTY STAT START TIME COMMAND

# Chercher un processus par nom
ps aux | grep nginx

# Arbre des processus (qui a lancé quoi)
pstree -p

# Tuer un processus par PID
kill -9 1234
# -9 = SIGKILL (force) | -15 = SIGTERM (graceful)

# Tuer tous les processus d'un nom
pkill -f "python3 script.py"

# Voir les fichiers ouverts par un processus
lsof -p 1234 | head -20

# Voir quel processus utilise un port
sudo lsof -i :80
# Ou alternativement:
sudo ss -tlnp | grep ":80"
```

### 2.3 Gestion des Logs Système

```bash
# Voir les logs système en temps réel (systemd)
sudo journalctl -f
# -f = follow (comme tail -f)

# Logs d'un service spécifique
sudo journalctl -u nginx -n 50
# -u = unit name | -n 50 = 50 dernières lignes

# Logs depuis le dernier boot
sudo journalctl -b 0

# Logs des erreurs uniquement (niveau ERROR et CRITICAL)
sudo journalctl -p err -b 0

# Fichiers de logs traditionnels
tail -f /var/log/syslog
tail -f /var/log/auth.log    # Tentatives de connexion SSH
tail -f /var/log/kern.log    # Messages du noyau
```

---

## 📖 3. Les Outils Réseau — Diagnostiquer et Analyser

### 3.1 Connectivité et Routage

```bash
# Ping — Tester la connectivité de base (ICMP)
ping -c 4 8.8.8.8
# Output attendu: 4 packets transmitted, 4 received, 0% packet loss

# Traceroute — Tracer le chemin vers une destination
traceroute 8.8.8.8
# Output attendu: Liste des routeurs traversés avec latences

# Sur certains systèmes, mtr (combinaison ping + traceroute)
mtr 8.8.8.8
# Si non installé: sudo apt install mtr -y

# Interfaces réseau et adresses IP
ip addr show
ip -brief addr show    # Version condensée

# Table de routage
ip route show
# Default route: "default via 192.168.1.1 dev eth0"

# Statistiques réseau détaillées
ip -s link show eth0
```

### 3.2 DNS — Résolution de Noms

```bash
# dig — Outil DNS professionnel (remplace nslookup)
dig google.com
# Output: QUESTION SECTION + ANSWER SECTION + Query time

# Résoudre uniquement l'adresse IP (short mode)
dig +short google.com
# Output attendu: 142.250.x.x

# Interroger un serveur DNS spécifique (Google DNS)
dig @8.8.8.8 google.com

# Requête MX (serveurs de mail)
dig google.com MX +short

# Résolution inverse (IP → Hostname)
dig -x 8.8.8.8 +short
# Output attendu: dns.google.

# nslookup — version simplifiée
nslookup google.com
```

### 3.3 Transfert HTTP et Analyse

```bash
# curl — Le couteau suisse des transferts HTTP
# GET simple
curl https://api.github.com/users/torvalds

# Voir les headers HTTP de réponse
curl -I https://google.com

# POST avec corps JSON
curl -X POST https://httpbin.org/post \
  -H "Content-Type: application/json" \
  -d '{"user": "paradis", "action": "test"}'

# Télécharger un fichier
curl -o linux.iso https://example.com/linux.iso -L

# wget — Téléchargement de fichiers (recursive possible)
wget https://example.com/fichier.tar.gz

# Tester la connectivité sur un port spécifique
nc -vz google.com 443
# Output: Connection to google.com 443 port [tcp/https] succeeded!
```

### 3.4 Sécurité Réseau (Intro)

```bash
# nmap — Scanner de ports (outil fondamental de sécurité)
# Scan basique d'une machine locale
nmap -sV 127.0.0.1
# -sV = détection de version des services

# Scan du réseau local
nmap -sn 192.168.1.0/24
# -sn = ping scan (liste les hôtes actifs sans scanner les ports)

# Ports ouverts sur votre propre machine
sudo nmap -sS -O localhost

# whois — Information sur un domaine/IP
whois google.com | head -20
```

---

## 📖 4. Git — Le Contrôle de Version (Fondamental Absolu)

### 4.1 Narration & Intuition

Git est à l'ingénieur IT ce que le GPS est au navigateur : indispensable. Créé par Linus Torvalds en 2005 pour gérer le développement du noyau Linux, Git est aujourd'hui utilisé par **96% des développeurs** et ingénieurs IT du monde.

Git vous permet de :
- **Sauvegarder** chaque modification de votre code/config
- **Revenir en arrière** à n'importe quel état précédent
- **Collaborer** avec des milliers de développeurs simultanément
- **Tracer** qui a fait quoi, quand et pourquoi
- **Brancher** pour expérimenter sans casser la version principale

### 4.2 Les Commandes Git Fondamentales

```bash
# Configurer son identité (fait une seule fois)
git config --global user.name "Votre Nom"
git config --global user.email "votre@email.com"

# Initialiser un nouveau dépôt Git dans le répertoire courant
git init mon-projet
cd mon-projet

# Vérifier l'état des fichiers (fichiers modifiés, staged, etc.)
git status

# Ajouter des fichiers à l'index (staging area)
git add fichier.txt         # Un fichier spécifique
git add .                   # Tous les fichiers modifiés

# Créer un commit (snapshot permanent de l'état actuel)
git commit -m "feat: ajout de la configuration nginx initiale"

# Voir l'historique des commits
git log --oneline           # Version concise
git log --oneline --graph   # Avec visualisation des branches

# Comparer les changements
git diff                    # Changements non-staged
git diff --staged           # Changements staged vs dernier commit

# Créer et basculer sur une nouvelle branche
git checkout -b feature/nouvelle-fonctionnalite

# Revenir en arrière (annuler le dernier commit)
git revert HEAD             # Crée un commit d'annulation (safe)
git reset --soft HEAD~1     # Annule le commit mais garde les changes staged
```

```bash
# Workflow complet : GitHub / GitLab
# 1. Cloner un dépôt distant
git clone https://github.com/utilisateur/depot.git

# 2. Récupérer les changements distants
git pull origin main

# 3. Pousser ses commits vers le dépôt distant
git push origin main

# 4. Voir les dépôts distants configurés
git remote -v
```

---

## 📖 5. Virtualisation & Conteneurs — Lab Personnel

### 5.1 Virtualisation Classique

La **virtualisation** permet de faire tourner plusieurs systèmes d'exploitation complets sur une seule machine physique. Un **hyperviseur** partage les ressources CPU/RAM/Stockage entre les machines virtuelles (VM).

```bash
# Vérifier si la virtualisation CPU est supportée
egrep -c '(vmx|svm)' /proc/cpuinfo
# Output: > 0 = virtualisation supportée par le CPU

# VirtualBox — Hyperviseur de type 2 (open source, desktop)
# À installer depuis: https://www.virtualbox.org

# Outils CLI VirtualBox
VBoxManage list vms              # Lister les VMs
VBoxManage startvm "Ubuntu" --type headless  # Démarrer une VM sans GUI
```

### 5.2 Docker — Introduction aux Conteneurs

Un **conteneur** n'est pas une VM. Il partage le noyau Linux de la machine hôte mais isole l'application dans son propre espace. Résultat : démarrage en millisecondes (vs minutes pour une VM), taille de quelques Mo (vs plusieurs Go).

```bash
# Vérifier l'installation Docker
docker --version
# Output: Docker version 24.x.x

# Lancer votre premier conteneur
docker run hello-world
# Output: Hello from Docker! This confirms your installation is working.

# Lancer Ubuntu dans un conteneur interactif
docker run -it ubuntu:22.04 bash
# Vous êtes maintenant DANS le conteneur Ubuntu (root@container_id:/#)
# exit pour quitter

# Lister les conteneurs actifs
docker ps

# Lister TOUS les conteneurs (actifs + arrêtés)
docker ps -a

# Lancer nginx dans un conteneur (serveur web)
docker run -d -p 8080:80 --name mon-nginx nginx
# -d = detached (background) | -p 8080:80 = port mapping
# Accéder à http://localhost:8080 dans votre navigateur

# Arrêter et supprimer un conteneur
docker stop mon-nginx && docker rm mon-nginx
```

---

## 🧪 Atelier Pratique — Construire Votre Boîte à Outils

```bash
# Installation complète de votre arsenal en une commande
sudo apt update && sudo apt install -y \
  vim htop tmux curl wget git nmap netcat \
  dnsutils net-tools mtr whois jq tree \
  iotop iftop lsof strace

echo "✅ Boîte à outils installée avec succès!"

# Vérifier que tout est installé
for tool in vim htop tmux curl git nmap dig jq tree; do
  if command -v $tool &>/dev/null; then
    echo "✅ $tool : $(which $tool)"
  else
    echo "❌ $tool : non trouvé"
  fi
done

# Tester jq — processeur JSON en ligne de commande
echo '{"nom": "PARADIS IT", "version": "2025"}' | jq '.nom'
# Output: "PARADIS IT"

# Tester tree — visualisation arborescente
tree /etc/apt/ -L 2
# Output: Arborescence du répertoire apt

# Configurer Git avec vos informations
git config --global user.name "Votre Nom PARADIS IT"
git config --global user.email "votre@email.com"
git config --global init.defaultBranch main
git config --list | grep user
```

---

## ⚠️ Erreurs Fréquentes & Debugging

> [!WARNING]
> **Erreur #1 : Fermer vim sans pouvoir sortir**
> Solution : Appuyez sur `Échap` puis tapez `:q!` et `Entrée`. Le `!` force la sortie sans sauvegarder.

> [!WARNING]
> **Erreur #2 : Confondre `kill` et `pkill`**
> `kill 1234` envoie un signal au PID 1234. `pkill nginx` envoie le signal à TOUS les processus nommés "nginx". Utiliser `pkill` avec précaution en production.

> [!WARNING]
> **Erreur #3 : `git commit` sans message descriptif**
> Un commit avec `git commit -m "fix"` est inutile dans 6 mois. Utilisez le format : `type(scope): description` — ex: `fix(nginx): correction du vhost port 443`.

> [!TIP]
> **tmux — Ne perdez jamais votre session SSH**
> ```bash
> tmux new -s travail     # Créer une session nommée "travail"
> # Ctrl+B puis D         # Détacher (la session continue en arrière-plan)
> tmux attach -t travail  # Se réattacher plus tard
> ```
> Indispensable sur les serveurs distants pour les opérations longues.

---

## ❓ Banque de QCM — Test du Jour (8 Questions)

**Q1 : Quelle commande permet de quitter vim sans sauvegarder les modifications ?**
- A) `:exit`
- B) `:quit`
- C) `:q!`
- D) `Ctrl+Q`

*Réponse : C — En mode commande vim (après avoir appuyé sur Échap), `:q!` force la sortie sans sauvegarder.*

**Q2 : Quelle commande affiche en temps réel les processus consommant le plus de CPU avec une interface colorée ?**
- A) `ps aux`
- B) `top`
- C) `htop`
- D) `vmstat`

*Réponse : C — `htop` est une version enrichie et interactive de `top` avec un affichage coloré et une navigation au clavier.*

**Q3 : Quelle commande `dig` permet d'obtenir uniquement l'adresse IP d'un domaine sans les détails DNS ?**
- A) `dig google.com --brief`
- B) `dig +short google.com`
- C) `dig -ip google.com`
- D) `nslookup -short google.com`

*Réponse : B — L'option `+short` de dig retourne uniquement la réponse DNS sans les sections de détail.*

**Q4 : Quelle est la différence fondamentale entre un conteneur Docker et une machine virtuelle (VM) ?**
- A) Un conteneur est plus lent qu'une VM
- B) Un conteneur partage le noyau de la machine hôte, une VM a son propre noyau complet
- C) Une VM n'a pas de système d'exploitation
- D) Docker ne fonctionne que sur Windows

*Réponse : B — Les conteneurs Docker partagent le kernel Linux de l'hôte, les rendant beaucoup plus légers et rapides que les VMs.*

**Q5 : Quelle commande `git` permet de sauvegarder des modifications avec un message descriptif ?**
- A) `git save -m "message"`
- B) `git add -m "message"`
- C) `git commit -m "message"`
- D) `git push -m "message"`

*Réponse : C — `git commit -m "message"` crée un snapshot permanent de l'état actuel avec un message descriptif.*

**Q6 : Quelle commande permet de voir quel processus utilise le port 80 sur votre machine ?**
- A) `netstat -p 80`
- B) `ps aux | grep 80`
- C) `sudo lsof -i :80` ou `sudo ss -tlnp | grep :80`
- D) `ping localhost:80`

*Réponse : C — `lsof -i :80` liste les fichiers/sockets ouverts sur le port 80, incluant le nom du processus.*

**Q7 : Quelle est la syntaxe correcte pour scanner les ports d'une machine avec nmap et détecter les versions des services ?**
- A) `nmap -scan 192.168.1.1`
- B) `nmap -sV 192.168.1.1`
- C) `nmap --version 192.168.1.1`
- D) `nmap -ports 192.168.1.1`

*Réponse : B — `nmap -sV` effectue une détection de version des services sur les ports ouverts trouvés.*

**Q8 : Quelle commande permet de voir les logs d'un service spécifique (ex: nginx) via systemd ?**
- A) `cat /var/log/nginx.log`
- B) `sudo journalctl -u nginx`
- C) `systemctl logs nginx`
- D) `dmesg nginx`

*Réponse : B — `journalctl -u <service>` affiche les logs d'une unité systemd spécifique. `-f` pour les suivre en temps réel.*

---

## 📚 Ressources & Références

- **tldr pages** (exemples pratiques de commandes) : https://tldr.sh ou `tldr ls`
- **cheat.sh** (aide en ligne de commande) : `curl cheat.sh/vim`
- **Git Book officiel (gratuit)** : https://git-scm.com/book/fr/v2
- **Docker Getting Started** : https://docs.docker.com/get-started/
- **Vim Adventures** (apprendre vim en jouant) : https://vim-adventures.com
- **Explainshell** (décompose les commandes bash) : https://explainshell.com

---

*Semestre 0 — Module d'Initiation & Pré-requis Absolus PARADIS IT Masterclass*
