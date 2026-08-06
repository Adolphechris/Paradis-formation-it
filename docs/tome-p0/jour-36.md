# TOME P0 — Socle Universel — Jour 36 (6h) : Git & Contrôle de Version

> [!NOTE]
> **Objectif du jour :** Maîtriser Git pour le suivi de versions, la collaboration en équipe et l'intégration dans les workflows DevSecOps. À la fin de cette journée, vous saurez initialiser un dépôt, gérer des branches, résoudre des conflits et publier sur GitHub.
>
> **Compétences visées :** `BIT-07` (A) — Contrôle de version Git et collaboration

---

## 1) Module — Concepts Fondamentaux & Premiers Pas (2h)

### 📖 Narration/Intuition

Imaginez que vous écrivez un document important et que vous sauvegardez manuellement des copies : `rapport_v1.docx`, `rapport_v2.docx`, `rapport_final.docx`, `rapport_FINAL_VRAIMENT.docx`... C'est du contrôle de version artisanal, fragile et inefficace.

**Git** est le système de contrôle de version distribué utilisé par 95% des développeurs dans le monde. Il résout ce problème en enregistrant chaque modification avec un contexte (auteur, date, message), permettant de naviguer dans l'historique, de collaborer en équipe, et de revenir en arrière si nécessaire.

En cybersécurité, Git est fondamental : tous les outils open-source (Metasploit, OSSEC, Suricata), tous les scripts d'audit, toutes les configurations d'infrastructure sont versionnés avec Git.

### 🔍 Anatomie Technique

**Anatomie d'un dépôt Git :**

```
Répertoire de travail (Working Directory)
    ↕  git add
Zone de staging (Index / Staging Area)
    ↕  git commit
Dépôt local (.git/)
    ↕  git push / git pull
Dépôt distant (GitHub / GitLab / Gitea)
```

**Configuration initiale (à faire une seule fois) :**

```bash
# Configurer l'identité (obligatoire pour les commits)
git config --global user.name "Jean Mbeki"
git config --global user.email "j.mbeki@bcc.cd"

# Configurer l'éditeur par défaut
git config --global core.editor "nano"

# Vérifier la configuration
git config --list

# Configurer la branche par défaut en "main" (moderne)
git config --global init.defaultBranch main
```

**Initialisation et premiers commits :**

```bash
# Créer un nouveau projet
mkdir projet-audit && cd projet-audit
git init          # Initialise le dépôt (.git/ est créé)
git status        # Toujours commencer par voir l'état actuel

# Créer des fichiers
echo "# Projet Audit Sécurité BCC" > README.md
echo "*.log" > .gitignore
echo "*.pyc" >> .gitignore
echo "__pycache__/" >> .gitignore
echo ".env" >> .gitignore  # Ne jamais versionner les secrets !

# Cycle de base : modify → add → commit
git add README.md .gitignore  # Ajouter au staging
git add .                     # Ajouter TOUS les fichiers modifiés (raccourci)

git status                    # Vérifier ce qui va être commité
git diff --cached             # Voir les changements stagés

git commit -m "feat: initialisation du projet audit sécurité"
# Convention de message : type(scope): description courte
# Types : feat, fix, docs, style, refactor, test, chore
```

**Lire l'historique :**

```bash
# Historique complet
git log

# Historique compact (une ligne par commit)
git log --oneline

# Historique graphique (branches visuelles)
git log --oneline --graph --all --decorate

# Détail d'un commit spécifique
git show abc1234

# Qui a modifié chaque ligne d'un fichier (forensique !)
git blame audit.py

# Rechercher dans l'historique
git log --grep="sécurité"           # Recherche dans les messages
git log -S "motdepasse"             # Cherche quand "motdepasse" a été ajouté/supprimé
git log --author="Mbeki"            # Commits d'un auteur spécifique
```

---

## 2) Module — Branches, Merge & Conflits (2h)

### 📖 Narration/Intuition

Les **branches** sont la fonctionnalité la plus puissante de Git. Elles permettent de travailler sur une nouvelle fonctionnalité ou un correctif sans affecter le code stable en production. Imaginez des couloirs parallèles d'un bâtiment : chaque couloir (branche) mène vers le même objectif final, mais on peut avancer indépendamment dans chacun.

### 🔍 Anatomie Technique

**Gestion des branches :**

```bash
# Voir les branches existantes
git branch                    # Branches locales (* = branche courante)
git branch -a                 # Toutes les branches (locales + distantes)

# Créer et basculer sur une nouvelle branche
git branch feature/detection-bruteforce    # Créer
git checkout feature/detection-bruteforce  # Basculer (ancien)
# ou en une seule commande (moderne) :
git switch -c feature/detection-bruteforce

# Renommer la branche courante
git branch -m nouvelle-branche

# Supprimer une branche (après fusion)
git branch -d feature/detection-bruteforce   # Sécurisé : refuse si non fusionnée
git branch -D feature/detection-bruteforce   # Force la suppression

# Flux de travail typique :
git switch main                           # Se placer sur main
git switch -c hotfix/vuln-ssh-config      # Créer une branche de correctif
# ... faire les corrections ...
git add -A && git commit -m "fix: sécurisation config SSH"
git switch main                           # Revenir sur main
git merge hotfix/vuln-ssh-config          # Fusionner le correctif
git branch -d hotfix/vuln-ssh-config      # Nettoyer
```

**Types de Merge :**

```bash
# Fast-Forward Merge (pas de commit de fusion créé — historique linéaire)
# Se produit quand main n'a pas avancé depuis la création de la branche
git merge feature/branche-rapide

# Three-Way Merge (commit de fusion créé — historique non-linéaire)
# Se produit quand les deux branches ont avancé
git merge feature/branche-divergente

# Squash Merge (tous les commits de la branche → un seul commit)
git merge --squash feature/ma-branche
git commit -m "feat: fonctionnalité X (squashed)"

# Rebase (réécrit l'historique pour une base linéaire)
git switch feature/ma-branche
git rebase main    # Rejoue les commits sur la pointe de main
```

**Résolution de conflits :**

```bash
# Un conflit survient quand deux branches modifient la même ligne du même fichier
git merge feature/audit-ssh
# CONFLICT (content): Merge conflict in audit.sh

# Git marque le fichier avec des marqueurs de conflit :
cat audit.sh
# <<<<<< HEAD         ← Début de votre version (branche actuelle)
# SSH_PORT=22
# ====== ←           Séparateur
# SSH_PORT=2222
# >>>>>> feature/audit-ssh  ← Fin de la version à fusionner

# Résolution manuelle : éditer le fichier, choisir la bonne version
nano audit.sh  # Garder "SSH_PORT=2222" et supprimer les marqueurs

# Finaliser la résolution
git add audit.sh           # Marquer comme résolu
git commit -m "merge: résolution conflit SSH_PORT"  # Valider la fusion

# Outil visuel de fusion (alternative)
git mergetool              # Lance vimdiff ou l'outil configuré
```

---

## 3) Module — Dépôts Distants, GitHub & Bonnes Pratiques (2h)

### 📖 Narration/Intuition

Un dépôt local Git est puissant, mais c'est quand on le connecte à un **dépôt distant** (GitHub, GitLab, Gitea) que la collaboration devient possible. Le dépôt distant est aussi une sauvegarde automatique de tout votre historique.

### 🔍 Anatomie Technique

**Connexion à un dépôt distant :**

```bash
# Lier un dépôt local à GitHub (remote = nom, origin = convention)
git remote add origin https://github.com/username/projet-audit.git

# Voir les remotes configurés
git remote -v

# Premier push (crée la branche distante et configure le tracking)
git push -u origin main
# -u = --set-upstream : lie main locale à origin/main

# Push suivants (plus simples)
git push

# Récupérer les changements distants
git pull           # fetch + merge (peut créer des conflits)
git fetch          # Télécharge sans fusionner (sécurisé)
git pull --rebase  # fetch + rebase (historique linéaire)
```

**Cloner un dépôt existant :**

```bash
# Cloner un dépôt (récupère tout l'historique)
git clone https://github.com/username/projet-audit.git
git clone git@github.com:username/projet-audit.git  # Via SSH (authentification par clé)

# Cloner dans un dossier spécifique
git clone https://github.com/username/outils-audit.git mon-audit
```

**Authentification SSH (recommandée pour GitHub) :**

```bash
# Générer une paire de clés SSH dédiée à Git
ssh-keygen -t ed25519 -C "git@bcc.cd" -f ~/.ssh/id_git

# Afficher la clé publique (à copier dans GitHub → Settings → SSH Keys)
cat ~/.ssh/id_git.pub

# Configurer SSH pour utiliser cette clé avec GitHub
cat >> ~/.ssh/config << 'EOF'
Host github.com
  IdentityFile ~/.ssh/id_git
  User git
EOF

# Tester la connexion
ssh -T git@github.com
# Réponse attendue : "Hi username! You've successfully authenticated..."
```

**Fichier `.gitignore` — Ce qu'il ne faut JAMAIS versionner :**

```gitignore
# Secrets et credentials — CRITIQUE EN SÉCURITÉ !
.env
.env.local
*.key
*.pem
config/secrets.yaml
credentials.json

# Données sensibles
*.db
*.sqlite3
logs/
/tmp/

# Artefacts de compilation
__pycache__/
*.pyc
*.pyo
dist/
build/

# Outils locaux
.vscode/
.idea/
*.swp

# Systèmes d'exploitation
.DS_Store        # macOS
Thumbs.db        # Windows
```

**Commandes de récupération d'urgence :**

```bash
# Annuler un fichier modifié (avant staging)
git restore audit.py    # Revient à la version du dernier commit

# Désindexer un fichier (après git add, avant commit)
git restore --staged audit.py

# Annuler le DERNIER commit (garde les modifications)
git reset HEAD~1        # HEAD~1 = un commit en arrière

# Annuler le dernier commit (DÉTRUIT les modifications — irréversible !)
git reset --hard HEAD~1

# Créer un commit qui annule un commit précédent (sécurisé pour l'historique)
git revert abc1234      # Crée un nouveau commit d'annulation

# Stash : mettre de côté des modifications temporairement
git stash               # Met de côté les modifications en cours
git stash pop           # Réapplique les modifications sauvegardées
git stash list          # Liste tous les stash
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **VCS** | Version Control System — système de contrôle de version |
| **DVCS** | Distributed Version Control System — VCS distribué (ex: Git) |
| **PR** | Pull Request — demande de fusion de branche sur GitHub/GitLab |
| **MR** | Merge Request — équivalent GitLab d'un Pull Request |
| **CI/CD** | Continuous Integration / Continuous Deployment — intégration et déploiement continus |
| **SHA** | Secure Hash Algorithm — empreinte unique d'un commit Git |
| **HEAD** | Référence au commit courant (pointeur de position dans l'historique) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Scénario complet — Vous développez un script d'audit. Effectuez les opérations suivantes :
1. Initialisez un dépôt dans `/tmp/audit-bcc`
2. Créez `audit.sh` et `README.md`
3. Faites un premier commit
4. Créez une branche `feature/detection-ssh`
5. Ajoutez une fonction au script, commitez
6. Fusionnez dans main

**Corrigé :**
```bash
mkdir /tmp/audit-bcc && cd /tmp/audit-bcc
git init
echo "#!/bin/bash" > audit.sh && echo "# Audit BCC" > README.md
git add . && git commit -m "feat: initialisation projet audit BCC"
git switch -c feature/detection-ssh
echo 'check_ssh() { ss -tlnp | grep :22; }' >> audit.sh
git add audit.sh && git commit -m "feat: ajout détection port SSH"
git switch main
git merge feature/detection-ssh
git branch -d feature/detection-ssh
```

**Exercice 2 :** Quelle commande permet de voir qui a modifié une ligne spécifique d'un fichier et à quel moment ?

**Corrigé :** `git blame fichier.sh` — affiche chaque ligne avec l'auteur et la date du dernier commit qui l'a modifiée. Très utile en forensique Git.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle commande ajoute tous les fichiers modifiés à la zone de staging ?
- A) `git commit -a`
- B) `git add .`
- C) `git push all`
- D) `git stage --all`

**Réponse : B**

**Q2 :** Que fait `git stash` ?
- A) Supprime les fichiers non versionnés
- B) Sauvegarde temporairement les modifications en cours sans les commiter
- C) Fusionne la branche courante avec main
- D) Configure l'identité de l'utilisateur

**Réponse : B**

**Q3 :** Quelle est la différence entre `git fetch` et `git pull` ?
- A) Aucune différence
- B) `fetch` télécharge sans fusionner, `pull` télécharge ET fusionne
- C) `pull` télécharge sans fusionner, `fetch` télécharge ET fusionne
- D) `fetch` ne fonctionne que sur GitHub

**Réponse : B**

**Q4 :** Un développeur a commité accidentellement un fichier `.env` contenant des mots de passe sur GitHub. Quelle est la première action à faire ?
- A) Faire `git rm .env && git commit`
- B) Supprimer le dépôt et en créer un nouveau
- C) Immédiatement changer/révoquer tous les secrets exposés, puis nettoyer l'historique Git
- D) Rendre le dépôt privé

**Réponse : C** — L'historique Git contient toujours le fichier même après suppression. Les secrets doivent être révoqués EN PREMIER, puis l'historique nettoyé avec `git filter-repo` ou BFG.

**Q5 :** Que signifie HEAD dans Git ?
- A) La branche main uniquement
- B) Le premier commit du dépôt
- C) Un pointeur vers le commit actuellement actif (position courante dans l'historique)
- D) Le dépôt distant origin

**Réponse : C**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
