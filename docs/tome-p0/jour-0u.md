# Jour J0U — Git & GitHub : Ton Premier Dépôt

> [!NOTE]
> **JOUR DE TRANSITION VERS LE SEMESTRE 1 — S0→S1 (J0p–J0v)**  
> Cette leçon introduit le versionning de code avec Git et GitHub. Aucun prérequis technique n'est nécessaire.

---

## 🎯 Objectifs de la Leçon
- 🗂️ Comprendre pourquoi le versionning est indispensable.
- 📚 Maîtriser les commandes Git essentielles (init, add, commit, push).
- 🐙 Créer un dépôt GitHub.
- 📝 Faire son premier commit.
- 🔗 Comprendre le workflow collaboratif.

---

## 📖 1. Pourquoi Git est-il indispensable ?

Imaginez que vous écrivez un script de 200 lignes. Vous faites une modification et ça casse. Sans Git, vous devez tout réécrire à la main. Avec Git, vous revenez à la version précédente en 1 seconde.

**Git = historique immuable de votre travail.**

Dans le Semestre 1, vous allez écrire des centaines de scripts. Git vous permet de :
1. **Sauvegarder** chaque version de votre travail.
2. **Revenir en arrière** si quelque chose casse.
3. **Collaborer** avec d'autres développeurs.
4. **Prouver** votre progression aux recruteurs (GitHub = portfolio public).

---

## 📖 2. Les concepts clés

| Concept | Définition | Analogie |
|---|---|---|
| **Repository (dépôt)** | Dossier contenant votre code + historique Git | Une armoire avec tous vos dossiers |
| **Commit** | Une sauvegarde avec un message | Une photo avec une légende |
| **Branch** | Une ligne de développement parallèle | Une copie de l'armoire pour tester des idées |
| **Remote** | Version du dépôt sur un serveur (GitHub) | L'armoire dans le cloud |
| **Push** | Envoyer vos commits vers le serveur | Déposer la photo dans le cloud |
| **Pull** | Récupérer les modifications du serveur | Récupérer les photos des autres |

---

## 📖 3. Les commandes Git essentielles

### 3.1 Initialiser un dépôt
```bash
# Créer un dossier et entrer dedans
mkdir paradis-s0-transition
cd paradis-s0-transition

# Initialiser Git
git init

# Configurer votre identité (une seule fois)
git config user.name "Adolphe"
git config user.email "adolphe@example.com"
```

### 3.2 Ajouter et sauvegarder (commit)
```bash
# Créer un fichier
echo "# Portfolio PARADIS" > README.md

# Ajouter le fichier à la zone de staging
git add README.md

# Sauvegarder avec un message
git commit -m "premier commit : ajout README"
```

### 3.3 Voir l'historique
```bash
# Voir tous les commits
git log

# Voir le statut actuel
git status
```

### 3.4 Créer un dépôt GitHub et pousser
```bash
# 1. Créer le dépôt sur github.com (interface web)
# 2. Lier le dépôt local au dépôt distant
git remote add origin https://github.com/adolphe/paradis-s0-transition.git

# 3. Pousser le commit vers GitHub
git branch -M main
git push -u origin main
```

---

## 🧪 Atelier Pratique : Premier dépôt GitHub

### Mission
Créez votre premier dépôt GitHub `paradis-s0-transition` avec les livrables de la transition S0→S1.

### Étapes

```bash
# 1. Créer la structure
mkdir -p ~/portfolio-paradis/S0-transition/J0u-git
cd ~/portfolio-paradis/S0-transition/J0u-git
git init

# 2. Configurer Git (si pas déjà fait)
git config user.name "Adolphe"
git config user.email "adolphe@example.com"

# 3. Créer le README
cat > README.md << 'EOF'
# Mon Portfolio PARADIS — Transition S0→S1

## Auteur
Adolphe — Débutant zéro compétence, 34 ans, marché nord-américain.

## Objectif
Bachelor BIT + Master Cybersecurity — Parcours PARADIS IT Masterclass.

## Livrables de la transition
- [x] J0p : Checklist format S1
- [x] J0q : Codes compétences BIT
- [x] J0r : 3 diagnostics résolus
- [x] J0s : Premier script portfolio `mon_script.sh`
- [x] J0t : Cheat sheet 30 commandes Linux
- [ ] J0u : Premier dépôt GitHub (en cours)
- [ ] J0v : Examen de transition
EOF

# 4. Premier commit
git add README.md
git commit -m "premier commit : README portfolio transition S0->S1"

# 5. Créer le dépôt sur GitHub (via navigateur)
# Aller sur github.com → New Repository → nom : paradis-s0-transition → Create

# 6. Lier et pousser
git remote add origin https://github.com/VOTRE_USERNAME/paradis-s0-transition.git
git branch -M main
git push -u origin main
```

### Vérification
- Allez sur `https://github.com/VOTRE_USERNAME/paradis-s0-transition`
- Vous devez voir votre README.md publié.

---

## 📖 4. Le workflow quotidien Git

Voici le workflow que vous utiliserez tous les jours en S1 :

```bash
# 1. Commencer la journée : récupérer les dernières modifications
git pull origin main

# 2. Travailler sur votre journée
nano jour-01-script.sh

# 3. Ajouter les fichiers modifiés
git add .

# 4. Sauvegarder avec un message descriptif
git commit -m "S1 J01 : script navigation Linux + diagnostic"

# 5. Envoyer vers GitHub
git push origin main
```

**Règle d'or** : Committez souvent. Un commit = une idée. Pas de commit de 500 lignes sans message.

---

## ❓ Banque de QCM & Test du Jour (5 Questions)

**Q1 : Que fait la commande `git init` ?**
- A) Initialise un nouveau dépôt Git dans le dossier courant
- B) Supprime tous les fichiers
- C) Installe un nouveau programme
- D) Formate le disque

*Réponse : A — `git init` crée un nouveau dépôt Git dans le dossier courant.*

**Q2 : Que fait la commande `git add` ?**
- A) Supprime un fichier
- B) Ajoute des fichiers à la zone de staging (pré-commit)
- C) Envoie vers GitHub
- D) Crée une branche

*Réponse : B — `git add` prépare les fichiers pour le prochain commit.*

**Q3 : Que fait la commande `git commit -m "message"` ?**
- A) Envoie vers GitHub
- B) Sauvegarde les fichiers avec un message descriptif
- C) Supprime le dépôt
- D) Crée un nouveau dossier

*Réponse : B — `git commit` sauvegarde les modifications avec un message.*

**Q4 : Quelle commande envoie vos commits vers GitHub ?**
- A) `git pull`
- B) `git push`
- C) `git delete`
- D) `git format`

*Réponse : B — `git push` envoie vos commits locaux vers le serveur distant.*

**Q5 : Pourquoi commit souvent ?**
- A) Pour occuper de l'espace disque
- B) Pour pouvoir revenir en arrière facilement et tracer son évolution
- C) Pour ralentir l'ordinateur
- D) Ça n'a aucun intérêt

*Réponse : B — Committer souvent permet de revenir en arrière et de tracer son évolution.*

---

*Jour de Transition S0→S1 — Module J0u*
