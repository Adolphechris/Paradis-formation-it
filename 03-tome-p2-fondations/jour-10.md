# TOME P2 — Jour 10 (12h) : Git Avancé & Collaboration — Travailler en Équipe sur du Code

> [!NOTE]
> **Objectif de la journée** : Maîtriser Git dans un contexte professionnel et collaboratif. Vous apprendrez à travailler avec des branches, résoudre des conflits, contribuer à des projets d'équipe via Pull Requests, et configurer des pipelines CI/CD automatiques avec GitHub Actions.

---

## 1) Les Branches Git : Travailler en Parallèle (3h)

### 📖 1.1 Pourquoi les Branches ?

Imaginez 4 développeurs travaillant simultanément sur le portail IT de la BCC : un ajoute un module de tickets, un corrige un bug de connexion, un améliore le dashboard, un prépare la mise à jour v2.0. 

Sans branches, ils écraseraient mutuellement leurs modifications. Avec les **branches Git**, chacun travaille dans son espace isolé, puis fusionne son travail une fois terminé et validé.

### 🛠️ 1.2 Commandes Branches

```bash
# Voir toutes les branches (locale + distantes)
git branch -a

# Créer et basculer sur une nouvelle branche
git checkout -b feature/module-tickets
# OU (syntax moderne Git 2.23+)
git switch -c feature/module-tickets

# Travailler sur la branche...
git add .
git commit -m "feat(tickets): ajouter formulaire de création de ticket"

# Fusionner la branche dans main (Fast-Forward si possible)
git switch main
git merge feature/module-tickets

# Supprimer la branche locale après fusion
git branch -d feature/module-tickets

# Pousser la branche sur GitHub
git push origin feature/module-tickets
```

---

## 2) Gestion des Conflits (2h)

### 📖 2.1 Un Conflit Git : Quand Deux Développeurs Modifient le Même Endroit

```bash
# Situation de conflit après un merge
Auto-merging src/tickets.js
CONFLICT (content): Merge conflict in src/tickets.js
Automatic merge failed; fix conflicts and then commit the result.

# Le fichier conflictuel contient des marqueurs
<<<<<<< HEAD (votre version)
const SEUIL_ALERTE = 80;
=======
const SEUIL_ALERTE = 90;
>>>>>>> feature/refactor-alertes (version distante)
```

```bash
# Résoudre manuellement le conflit (choisir la bonne valeur ou combiner)
# Supprimer les marqueurs <<< === >>> et garder le code correct

const SEUIL_ALERTE = 85;  // Compromis validé par l'équipe

# Marquer comme résolu et finaliser
git add src/tickets.js
git commit -m "fix: résolution conflit seuil d'alerte (consensus équipe)"
```

---

## 3) GitHub Actions : CI/CD Automatique (4h)

### 📖 3.1 CI/CD : Automatiser les Tests et le Déploiement

**CI** (Continuous Integration) = Chaque fois qu'un développeur pousse du code, des tests automatiques vérifient qu'il ne casse rien.
**CD** (Continuous Deployment) = Si les tests passent, le code est déployé automatiquement en production.

### 🛠️ 3.2 Créer un Workflow GitHub Actions

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD — Portail IT BCC

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configuration Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Installation des dépendances
        run: pip install -r requirements.txt
      
      - name: Exécution des tests unitaires
        run: python -m pytest tests/ -v --tb=short
      
      - name: Vérification qualité code (linting)
        run: |
          pip install flake8
          flake8 src/ --max-line-length=120

  deploy:
    needs: tests
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Déploiement sur serveur BCC
        run: echo "Déploiement automatique réussi !"
```

---

## 🏋️ Exercices Pratiques & Corrigés

### Exercice : Workflow de Feature Complet
Simulez un workflow professionnel complet : créer une branche `fix/bug-login`, simuler un commit, créer une Pull Request (description en markdown), et merger.
- **Corrigé** :
  ```bash
  git switch -c fix/bug-login
  echo "# Fix: Correction bug connexion BCC" > CHANGELOG.md
  git add CHANGELOG.md
  git commit -m "fix(auth): corriger la validation du token de session expirée"
  git push origin fix/bug-login
  # Ensuite sur GitHub : New Pull Request → base:main ← compare:fix/bug-login
  ```

---

## ❓ Banque de Questions & Test du Jour 10

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*