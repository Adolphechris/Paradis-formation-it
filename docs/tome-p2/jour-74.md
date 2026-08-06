# TOME P2 — Réseaux & Télécoms — Jour 74 (6h) : CI/CD & DevSecOps

> [!NOTE]
> **Objectif du jour :** Comprendre et mettre en œuvre un pipeline CI/CD (Continuous Integration / Continuous Deployment) intégrant la sécurité à chaque étape (DevSecOps) : tests automatisés, analyse de code statique (SAST), scan de dépendances (SCA), scan de conteneurs, et déploiement automatisé sécurisé via GitHub Actions.
>
> **Compétences visées :** `BIT-08` (A) — DevOps & CI/CD | `SEC-05` (A) — DevSecOps

---

## 1) Module — Principes CI/CD & Pipeline Automatisé (2h)

### 📖 Narration/Intuition

**CI/CD** est la pratique d'automatiser le cycle complet de développement logiciel : chaque modification de code déclenche automatiquement une chaîne de tests, d'analyses de sécurité, et de déploiement. Dans un contexte bancaire, un code non testé et non audité ne doit JAMAIS atteindre la production. Le pipeline CI/CD est le gardien automatique de cette règle.

**DevSecOps** va plus loin : la sécurité n'est plus un contrôle ajouté à la fin du cycle de développement (Security as an afterthought) — elle est intégrée à **chaque étape** du pipeline (Shift Left Security).

### 🔍 Anatomie Technique

**Phases d'un pipeline DevSecOps :**

```
Développeur pousse du code
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        PIPELINE CI/CD                               │
│                                                                     │
│  1. SCM TRIGGER (git push → déclenche le pipeline)                  │
│          │                                                          │
│          ▼                                                          │
│  2. BUILD (compilation, Dockerfile build)                           │
│          │                                                          │
│          ▼                                                          │
│  3. SAST — Static Application Security Testing                      │
│     • Analyse de code (Semgrep, Bandit pour Python)                 │
│     • Secrets scanning (GitLeaks, truffleHog)                       │
│          │                                                          │
│          ▼                                                          │
│  4. TESTS UNITAIRES & INTÉGRATION                                   │
│     • pytest, coverage > 80%                                        │
│          │                                                          │
│          ▼                                                          │
│  5. SCA — Software Composition Analysis                             │
│     • Scan des dépendances (Safety, OWASP Dependency-Check)         │
│          │                                                          │
│          ▼                                                          │
│  6. BUILD IMAGE DOCKER + SCAN                                       │
│     • Build de l'image de production                                │
│     • Trivy scan (CVE dans l'image)                                 │
│          │                                                          │
│          ▼                                                          │
│  7. PUSH REGISTRY (si tous les checks passent)                      │
│          │                                                          │
│          ▼                                                          │
│  8. DÉPLOIEMENT (staging → production)                              │
│     • Rollout graduel (blue/green ou canary)                        │
│     • Tests de smoke post-déploiement                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — GitHub Actions — Pipeline DevSecOps Complet (2h)

### 📖 Narration/Intuition

**GitHub Actions** est la plateforme CI/CD native de GitHub. Elle permet de définir des workflows YAML qui s'exécutent automatiquement sur des événements Git (push, pull_request, release). C'est gratuit pour les dépôts publics et l'outil le plus utilisé pour les projets open-source et en entreprise.

### 🔍 Anatomie Technique

**Workflow GitHub Actions — Pipeline DevSecOps BCC :**

```yaml
# .github/workflows/devsecops-pipeline.yml
name: "DevSecOps Pipeline — BCC API"

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  IMAGE_NAME: bcc-api
  REGISTRY: ghcr.io

jobs:
  # ─── Job 1 : Analyse de sécurité du code ──────────────────────────────────
  sast-and-secrets:
    name: "SAST & Secrets Scan"
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      contents: read
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0    # Historique complet pour détection de secrets
      
      # Scan de secrets dans l'historique Git
      - name: Scan secrets with GitLeaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      # Analyse statique Python avec Bandit
      - name: SAST avec Bandit (Python)
        run: |
          pip install bandit
          bandit -r app/ -f json -o bandit-report.json || true
          bandit -r app/ -ll  # Afficher les issues HIGH et MEDIUM minimum
      
      # Analyse avec Semgrep (multi-langages)
      - name: SAST avec Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: >-
            p/python
            p/owasp-top-ten
            p/secrets
      
      - name: Upload SAST results
        uses: actions/upload-artifact@v4
        with:
          name: sast-reports
          path: bandit-report.json

  # ─── Job 2 : Tests & Couverture de code ───────────────────────────────────
  tests:
    name: "Tests Unitaires & Couverture"
    runs-on: ubuntu-latest
    needs: sast-and-secrets
    
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: bcc_test
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'
      
      - name: Installer les dépendances
        run: pip install -r requirements.txt -r requirements-test.txt
      
      # Scan des dépendances (SCA)
      - name: SCA — Scanner les vulnérabilités dans requirements.txt
        run: |
          pip install safety
          safety check --full-report
      
      - name: Exécuter les tests avec couverture
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost/bcc_test
          SECRET_KEY: test-secret-key-not-for-production
        run: |
          pytest tests/ --cov=app --cov-report=xml --cov-report=html -v
      
      - name: Vérifier le seuil de couverture (minimum 80%)
        run: |
          COVERAGE=$(python -c "import xml.etree.ElementTree as ET; \
            t=ET.parse('coverage.xml').getroot(); \
            print(float(t.attrib['line-rate'])*100)")
          echo "Couverture : $COVERAGE%"
          python -c "assert float('$COVERAGE') >= 80, 'Couverture < 80% !!'"
      
      - name: Upload couverture vers Codecov
        uses: codecov/codecov-action@v4

  # ─── Job 3 : Build Docker + Scan de vulnérabilités ────────────────────────
  docker-build-and-scan:
    name: "Build Docker & Scan Trivy"
    runs-on: ubuntu-latest
    needs: tests
    permissions:
      packages: write
      security-events: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Build de l'image Docker
        run: docker build --target production -t $IMAGE_NAME:${{ github.sha }} .
      
      # Scan CVE de l'image avec Trivy
      - name: Scan Trivy — Image Docker
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.IMAGE_NAME }}:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'    # Échouer le pipeline si CRITICAL trouvé
      
      - name: Upload résultats Trivy vers GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'
      
      # Push vers GitHub Container Registry si tous les checks passent
      - name: Login au registre GHCR
        if: github.ref == 'refs/heads/main'
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Push de l'image (branche main uniquement)
        if: github.ref == 'refs/heads/main'
        run: |
          docker tag $IMAGE_NAME:${{ github.sha }} \
            ${{ env.REGISTRY }}/${{ github.repository }}/$IMAGE_NAME:latest
          docker push ${{ env.REGISTRY }}/${{ github.repository }}/$IMAGE_NAME:latest

  # ─── Job 4 : Déploiement (staging) ────────────────────────────────────────
  deploy-staging:
    name: "Déploiement Staging"
    runs-on: ubuntu-latest
    needs: docker-build-and-scan
    if: github.ref == 'refs/heads/main'
    environment:
      name: staging
      url: https://staging.api.bcc.cd
    
    steps:
      - name: Déployer sur le serveur staging
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: deploy
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/bcc-api
            docker compose pull
            docker compose up -d --remove-orphans
            # Tests de smoke post-déploiement
            sleep 10
            curl -f https://staging.api.bcc.cd/health || exit 1
            echo "Déploiement staging réussi !"
```

---

## 3) Module — Gestion des Secrets & Bonnes Pratiques DevSecOps (2h)

### 📖 Narration/Intuition

La gestion des secrets (clés API, mots de passe, certificats) est le point le plus critique du DevSecOps. Un secret exposé dans un dépôt Git peut rester dans l'historique des années après sa suppression, compromettant l'ensemble de l'infrastructure.

### 🔍 Anatomie Technique

**Bonnes pratiques de gestion des secrets :**

```bash
# ❌ JAMAIS dans le code source ou le Dockerfile :
# DATABASE_URL=postgresql://admin:MonMotDePasse@db:5432/bcc
# SECRET_KEY=ma-cle-secrete-hardcodée
# AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE

# ✅ Variables d'environnement depuis des sources sécurisées :

# 1. GitHub Secrets (CI/CD)
#    Settings > Secrets and variables > Actions > New repository secret
#    Usage : ${{ secrets.DATABASE_URL }}

# 2. Docker Compose + fichier .env (JAMAIS versionné)
#    .env.production (dans .gitignore)
cat > .env.production << 'EOF'
DATABASE_URL=postgresql://bccapi:${POSTGRES_PASSWORD}@postgres:5432/bcc
SECRET_KEY=${SECRET_KEY}
REDIS_PASSWORD=${REDIS_PASSWORD}
EOF

# 3. HashiCorp Vault (solution enterprise)
# apt install vault
vault server -dev &
export VAULT_ADDR='http://127.0.0.1:8200'
vault login root

# Stocker un secret
vault kv put secret/bcc-api \
    database_url="postgresql://..." \
    secret_key="..." \
    redis_password="..."

# Lire un secret depuis une application
vault kv get secret/bcc-api
DBURL=$(vault kv get -field=database_url secret/bcc-api)

# 4. .gitignore — exclure les fichiers sensibles
cat >> .gitignore << 'EOF'
.env
.env.*
!.env.example
*.pem
*.key
secrets/
EOF

# Scanner l'historique Git pour des secrets exposés
git log --all --full-history --oneline
trufflehog git file://. --only-verified
gitleaks detect --source . --verbose
```

**Pre-commit hooks — Bloquer les commits avec des secrets :**

```bash
# Installation de pre-commit
pip install pre-commit

cat > .pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
  
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: detect-private-key
      - id: check-merge-conflict
      - id: trailing-whitespace
      - id: end-of-file-fixer
  
  - repo: https://github.com/PyCQA/bandit
    rev: 1.7.5
    hooks:
      - id: bandit
        args: ["-ll", "-r", "app/"]
EOF

pre-commit install          # Installer dans le repo Git
pre-commit run --all-files  # Tester sur tous les fichiers
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CI** | Continuous Integration — intégration continue |
| **CD** | Continuous Deployment/Delivery — déploiement/livraison continue |
| **SAST** | Static Application Security Testing — analyse de sécurité du code source |
| **DAST** | Dynamic Application Security Testing — tests de sécurité dynamiques (en runtime) |
| **SCA** | Software Composition Analysis — analyse de la composition logicielle (dépendances) |
| **SARIF** | Static Analysis Results Interchange Format — format de rapport de sécurité |
| **DevSecOps** | Development + Security + Operations — intégration de la sécurité dans le DevOps |
| **SBOM** | Software Bill of Materials — inventaire complet des composants logiciels |
| **Vault** | Solution HashiCorp de gestion de secrets |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Dans le pipeline CI/CD, pourquoi le job `deploy-staging` a-t-il `if: github.ref == 'refs/heads/main'` ?

**Corrigé :** Pour n'exécuter le déploiement que sur les commits de la branche `main`. Les branches de feature et les pull requests exécutent seulement les tests et analyses — pas le déploiement. Cela évite de déployer du code non finalisé en staging.

**Exercice 2 :** Un développeur a accidentellement commité sa clé AWS dans un fichier de config il y a 3 mois. Supprimer le fichier et faire un nouveau commit suffit-il ?

**Corrigé :** **Non**. La clé est toujours dans l'historique Git et accessible via `git log`. Il faut : 1) **Révoquer immédiatement la clé AWS** (la considérer comme compromise), 2) Réécrire l'historique Git avec `git filter-repo` ou `BFG Repo Cleaner` pour supprimer le fichier de l'historique, 3) Force-pusher le nouveau historique sur le remote, 4) Alerter toute l'équipe de mettre à jour leur copie locale.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** "Shift Left Security" dans le DevSecOps signifie :
- A) Déplacer les équipes de sécurité dans les bureaux à gauche du bâtiment
- B) Intégrer les contrôles de sécurité le plus tôt possible dans le cycle de développement (code, build, test) plutôt qu'à la fin
- C) Sécuriser uniquement la couche réseau en amont de l'application
- D) Utiliser des outils de sécurité sur des serveurs Linux plutôt que Windows

**Réponse : B**

**Q2 :** Quelle est la différence entre SAST et DAST ?
- A) SAST analyse le code source statiquement, DAST teste l'application en cours d'exécution
- B) SAST scanne les images Docker, DAST scanne les dépendances
- C) SAST est automatique, DAST est manuel
- D) SAST nécessite accès à internet, DAST non

**Réponse : A**

**Q3 :** Dans un pipeline GitHub Actions, comment passer un secret de manière sécurisée à une étape ?
- A) En le hardcodant directement dans le fichier YAML
- B) En l'ajoutant dans un commentaire du code
- C) Via `${{ secrets.NOM_DU_SECRET }}` — stocké dans GitHub Secrets et jamais affiché dans les logs
- D) En le stockant dans une variable d'environnement du runner non chiffrée

**Réponse : C**

**Q4 :** Trivy est utilisé dans un pipeline CI/CD pour :
- A) Exécuter les tests unitaires de l'application
- B) Analyser l'image Docker à la recherche de vulnérabilités CVE connues dans les packages
- C) Déployer automatiquement l'application en production
- D) Scanner les secrets dans l'historique Git

**Réponse : B**

**Q5 :** Un pre-commit hook avec GitLeaks bloque un commit. Qu'est-ce que cela indique ?
- A) Le code a des erreurs de syntaxe Python
- B) Les tests unitaires ont échoué
- C) GitLeaks a détecté un potentiel secret (clé API, mot de passe) dans les fichiers modifiés
- D) La couverture de code est inférieure au seuil minimum

**Réponse : C**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
