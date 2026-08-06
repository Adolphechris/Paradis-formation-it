# TOME P4 — Cloud, DevOps & SecOps — Jour 178 (6h) : CI/CD Pipelines & DevOps (GitHub Actions, Tests Automatisés, SAST/DAST & GitOps ArgoCD)

> [!NOTE]
> **Objectif du jour :** Implémenter un pipeline **CI/CD (Continuous Integration / Continuous Delivery)** complet avec **GitHub Actions** : automatisation des tests unitaires/intégration, analyse statique du code (SAST), scan de vulnérabilités, build d'images Docker et déploiement automatique en production via **GitOps avec ArgoCD**.
>
> **Compétences visées :** `OPS-05` (A) — CI/CD Pipelines & DevOps | `SEC-05` (A) — DevSecOps, SAST/DAST

---

## 1) Module — Concepts CI/CD & GitHub Actions (2h)

### 📖 Narration/Intuition

Comment la BCC peut-elle livrer de nouvelles fonctionnalités à son application bancaire en ligne **plusieurs fois par jour** avec zéro risque de régression ? Grâce au pipeline **CI/CD**.

- **CI (Continuous Integration)** : Chaque fois qu'un développeur pousse du code sur GitHub, un pipeline automatique s'exécute pour : vérifier le style du code, exécuter tous les tests automatisés, et confirmer que rien n'est cassé.
- **CD (Continuous Delivery/Deployment)** : Après une CI réussie, le code validé est automatiquement livré (CD Delivery) ou déployé (CD Deployment) en production sans intervention humaine.

**GitHub Actions** est la plateforme CI/CD native de GitHub, définie par des fichiers YAML dans `.github/workflows/`.

### 🔍 Anatomie Technique

**Pipeline CI/CD complet BCC API (`.github/workflows/ci-cd.yml`) :**

```yaml
name: BCC API — CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}/bcc-api

jobs:
  # ════════════════════════════════════════
  # JOB 1 : INTÉGRATION CONTINUE (CI)
  # ════════════════════════════════════════
  ci:
    name: 🧪 Intégration Continue
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write  # Nécessaire pour publier les résultats SAST

    steps:
      - name: 📥 Checkout du code source
        uses: actions/checkout@v4

      - name: ⚙️ Configuration Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 📦 Installation des dépendances
        run: npm ci

      - name: 🎨 Vérification du style de code (ESLint)
        run: npm run lint

      - name: 🧪 Exécution des tests unitaires & de couverture
        run: npm run test:coverage
        env:
          NODE_ENV: test

      - name: 📊 Publication du rapport de couverture
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

      # SAST — Analyse Statique de Sécurité du Code
      - name: 🔒 Analyse SAST (CodeQL Security Analysis)
        uses: github/codeql-action/init@v3
        with:
          languages: javascript

      - name: 🔒 CodeQL — Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: 🔒 CodeQL — Analyse & Publication SARIF
        uses: github/codeql-action/analyze@v3

  # ════════════════════════════════════════
  # JOB 2 : BUILD & SCAN DE L'IMAGE DOCKER
  # ════════════════════════════════════════
  build-and-scan:
    name: 🐳 Build Docker & Scan Trivy
    needs: ci                   # N'exécuter que si la CI réussit
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write           # Pour pousser vers GHCR
      security-events: write

    steps:
      - uses: actions/checkout@v4

      - name: 🔐 Connexion au Registry GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: 🏷️ Extraction des métadonnées (Tag de l'image)
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=,format=short
            type=ref,event=branch

      - name: 🐳 Build Multi-Platform Docker (arm64 + amd64)
        uses: docker/build-push-action@v5
        with:
          context: .
          target: production
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          platforms: linux/amd64,linux/arm64
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: 🛡️ Scan de Vulnérabilités Trivy (CRITICAL/HIGH)
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.meta.outputs.version }}
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'       # Échouer le pipeline si CRITICAL trouvé

      - name: 📋 Publication des résultats Trivy (GitHub Security)
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

  # ════════════════════════════════════════
  # JOB 3 : DÉPLOIEMENT CONTINU (GitOps ArgoCD)
  # ════════════════════════════════════════
  deploy:
    name: 🚀 Déploiement Production (GitOps)
    needs: build-and-scan
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest

    steps:
      - name: 📝 Mise à jour du tag d'image dans le dépôt GitOps
        uses: actions/checkout@v4
        with:
          repository: bcc-cd/bcc-k8s-manifests  # Dépôt GitOps dédié
          token: ${{ secrets.GITOPS_PAT }}

      - name: 🏷️ Mise à jour du tag de l'image Kubernetes
        run: |
          NEW_TAG="${{ github.sha }}"
          sed -i "s|image: .*bcc-api:.*|image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${NEW_TAG:0:7}|" \
            k8s/production/deployment-bcc-api.yaml
          
          git config user.email "ci-bot@bcc.cd"
          git config user.name "BCC CI Bot"
          git add k8s/production/deployment-bcc-api.yaml
          git commit -m "chore(deploy): auto-update bcc-api image to ${NEW_TAG:0:7}"
          git push
```

---

## 2) Module — GitOps avec ArgoCD (2h)

### 📖 Narration/Intuition

**GitOps** est une pratique où l'état **désiré** de l'infrastructure de production est entièrement défini dans des fichiers Git. **ArgoCD** surveille en continu ce dépôt Git et synchronise automatiquement le cluster Kubernetes pour que l'état réel corresponde toujours à l'état défini dans Git.

### 🔍 Anatomie Technique

**Application ArgoCD (`argocd-app-bcc.yaml`) :**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: bcc-api-production
  namespace: argocd
spec:
  project: default

  # Source : Dépôt Git contenant les manifestes Kubernetes
  source:
    repoURL: https://github.com/bcc-cd/bcc-k8s-manifests.git
    targetRevision: HEAD
    path: k8s/production

  # Destination : Cluster K8s cible
  destination:
    server: https://kubernetes.default.svc
    namespace: bcc-production

  # Politique de Synchronisation (Auto-sync avec auto-prune)
  syncPolicy:
    automated:
      prune: true        # Supprimer les ressources K8s absentes du dépôt Git
      selfHeal: true     # Restaurer l'état Git si quelqu'un modifie K8s manuellement
    syncOptions:
      - CreateNamespace=true
```

---

## 3) Module — Laboratoire : Tests Automatisés & Rapport de Couverture (2h)

### 📖 Narration/Intuition

Un pipeline CI sans tests automatisés est inutile. Découvrons la pyramide des tests et leur implémentation avec **Jest** (framework de test Node.js).

### 🛠️ Atelier Pratique

**Tests unitaires de l'API BCC avec Jest (`tests/accounts.test.js`) :**

```javascript
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

// Mock de la base de données (Isolation des tests unitaires)
jest.mock('../src/db');

describe('API Comptes BCC — Tests d\'Intégration', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test 1 : Récupération du solde (Cas de succès)
    it('GET /api/v1/accounts/:id/solde — doit retourner le solde du compte', async () => {
        const mockSolde = { iban: 'CD89BCC00000001', solde: 150000, devise: 'CDF' };
        db.getAccountBalance.mockResolvedValue(mockSolde);

        const res = await request(app)
            .get('/api/v1/accounts/CD89BCC00000001/solde')
            .set('Authorization', 'Bearer valid_test_jwt_token');

        expect(res.statusCode).toBe(200);
        expect(res.body.solde).toBe(150000);
        expect(db.getAccountBalance).toHaveBeenCalledWith('CD89BCC00000001');
    });

    // Test 2 : Authentification manquante (Erreur 401)
    it('GET /api/v1/accounts/:id/solde — doit retourner 401 sans token JWT', async () => {
        const res = await request(app)
            .get('/api/v1/accounts/CD89BCC00000001/solde');

        expect(res.statusCode).toBe(401);
    });

    // Test 3 : Prévention BOLA — Accès à un compte d'un autre utilisateur
    it('GET /api/v1/accounts/:id/solde — doit retourner 403 si non propriétaire', async () => {
        db.checkOwnership.mockResolvedValue(false);

        const res = await request(app)
            .get('/api/v1/accounts/CD89BCC99999999/solde')
            .set('Authorization', 'Bearer valid_test_jwt_token');

        expect(res.statusCode).toBe(403);
    });
});
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CI** | Continuous Integration — Intégration continue du code par tests automatisés |
| **CD** | Continuous Delivery/Deployment — Livraison ou déploiement automatique du code validé |
| **SAST** | Static Application Security Testing — Analyse statique du code source pour détecter des failles |
| **DAST** | Dynamic Application Security Testing — Test de sécurité de l'application en cours d'exécution |
| **GitOps** | Pratique utilisant Git comme source de vérité unique pour l'état de l'infrastructure |
| **ArgoCD** | Outil GitOps de déploiement continu pour Kubernetes (CNCF Graduated) |
| **SARIF** | Static Analysis Results Interchange Format — Format standard pour partager les résultats d'analyse de sécurité |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer la distinction fondamentale entre **SAST (Static Application Security Testing)** et **DAST (Dynamic Application Security Testing)** dans un pipeline DevSecOps.

**Corrigé :** Le **SAST** analyse le **code source statique** de l'application sans l'exécuter. Il intervient tôt dans le cycle CI (avant le build) et détecte des vulnérabilités comme les injections SQL, les secrets codés en dur, ou les appels de fonctions dangereuses (`eval()`, `exec()`). Outils : CodeQL, SonarQube, Semgrep. Le **DAST** teste l'application **pendant son exécution** (runtime) en simulant des attaques réelles contre un environnement de staging. Il découvre des vulnérabilités invisibles au code source comme les XSS reflétées, les IDOR (BOLA), ou les mauvaises configurations CORS. Outils : OWASP ZAP, Burp Suite, Nuclei. Un pipeline DevSecOps complet intègre les deux.

**Exercice 2 :** Qu'est-ce que le principe **GitOps** et pourquoi l'utilisation d'un dépôt Git séparé (GitOps Repository) pour les manifestes Kubernetes est-elle une bonne pratique ?

**Corrigé :** **GitOps** est le principe selon lequel l'état désiré de toute l'infrastructure et des déploiements est entièrement décrit dans des fichiers versionés dans Git, Git devenant la source de vérité unique. Un opérateur comme ArgoCD surveille ce dépôt et synchronise continuellement le cluster K8s. L'utilisation d'un **dépôt GitOps séparé** (distinct du dépôt applicatif) offre plusieurs avantages : (1) **Audit clair** : l'historique Git du dépôt K8s retrace toutes les modifications d'infrastructure indépendamment du code applicatif, (2) **Permissions distinctes** : l'équipe Ops contrôle les manifestes K8s sans accès au code source applicatif, (3) **Rollback simplifié** : un `git revert` sur le dépôt GitOps suffit pour annuler un déploiement défaillant.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la différence entre **CI (Continuous Integration)** et **CD (Continuous Deployment)** dans un pipeline DevOps ?
- A) La CI automatise les tests à chaque commit ; le CD automatise le déploiement du code validé en production
- B) La CI déploie le code ; le CD exécute les tests
- C) Ce sont deux noms pour la même chose
- D) La CI gère les conteneurs ; le CD gère les bases de données

**Réponse : A**

**Q2 :** Quel outil d'analyse de sécurité open-source de GitHub est intégré nativement dans GitHub Actions pour effectuer une analyse statique de code (SAST) et détecter des vulnérabilités ?
- A) CodeQL
- B) SonarQube
- C) Snyk uniquement
- D) Pylint

**Réponse : A**

**Q3 :** Dans le contexte GitOps avec ArgoCD, que signifie la directive `selfHeal: true` dans la politique de synchronisation ?
- A) ArgoCD restaure automatiquement l'état défini dans Git si quelqu'un modifie manuellement les ressources K8s en dehors du pipeline
- B) ArgoCD répare automatiquement le code source
- C) ArgoCD met à jour automatiquement la version de K8s
- D) ArgoCD redémarre les Pods en erreur

**Réponse : A**

**Q4 :** Pourquoi la directive `exit-code: '1'` dans l'étape Trivy du pipeline GitHub Actions est-elle critique pour la sécurité ?
- A) Elle fait échouer automatiquement le pipeline CI/CD si une vulnérabilité CRITICAL est détectée, empêchant le déploiement d'une image vulnérable en production
- B) Elle génère un rapport PDF
- C) Elle publie les résultats sur Docker Hub
- D) Elle scanne uniquement les ports réseau

**Réponse : A**

**Q5 :** Quelle commande npm est conventionnellement utilisée dans un pipeline CI pour installer les dépendances de manière strictement reproductible (identique au `package-lock.json`) ?
- A) `npm ci`
- B) `npm install`
- C) `npm update`
- D) `npm start`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
