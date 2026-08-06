# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 235 (6h) : Projet Intégrateur Partie 7 — Pipeline DevSecOps & Audit de Sécurité Automatisé CI/CD (BCC — Intégration SAST, DAST, SCA, Secrets Scanning & Cosign)

> [!NOTE]
> **Objectif du jour :** Construire et auditer une **pipeline CI/CD DevSecOps complète et automatisée** pour la plateforme MNBC de la Banque Centrale du Congo (BCC) : intégration de l'analyse statique (**SAST — Semgrep / SonarQube**), du scannage de secrets (**Gitleaks / Trufflehog**), de l'analyse de dépendances et vulnérabilités (**SCA / Trivy / pip-audit**), du scannage dynamique (**DAST — OWASP ZAP**), de la signature d'artefacts avec **Cosign**, et du blocage de déploiement en cas de non-conformité aux exigences de sécurité.
>
> **Compétences visées :** `SEC-04` (A) — Pipeline DevSecOps Automated Security Scanning | `PRO-01` (A) — Projet Intégrateur CI/CD Hardening & Automated Gatekeeper Enforcement BCC

---

## 1) Module — Architecture de la Pipeline DevSecOps BCC (1h30)

### 📖 Narration/Intuition

Pour éviter la récurrence des failles découvertes lors des projets précédents (BOLA sur l'API REST J224, secrets hardcodés dans le code Lambda J227, images Docker vulnérables J231, dépendances vulnérables J234), la BCC doit automatiser le contrôle de sécurité à chaque commit.

L'objectif n'est pas de ralentir les déploiements, mais d'ériger des **barrières de sécurité automatisées (Security Quality Gates)** qui valident le code avant tout déploiement en production.

### 🔍 Anatomie Technique

**Flux de la Pipeline DevSecOps BCC (GitHub Actions) :**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    PIPELINE DEVSECOPS UNIFIÉE — BCC MNBC                     │
├──────────────────────────────────────────────────────────────────────────────┤
│ 1. STAGE LINT & SECRETS SCANNING                                             │
│    ├── Gitleaks / Trufflehog → Détection des clés AWS/JWT hardcodées         │
│    └── Checkov / tfsec       → Scan IaC Terraform (configurations Cloud)   │
├──────────────────────────────────────────────────────────────────────────────┤
│ 2. STAGE SAST (Static Application Security Testing)                          │
│    ├── Semgrep / Bandit     → Scan du code Python/Solidity/Go (CWEs/OWASP)  │
│    └── Slither / Mythril    → Audit des Smart Contracts Solidity (J219)    │
├──────────────────────────────────────────────────────────────────────────────┤
│ 3. STAGE SCA & CONTAINER SCANNING (Software Composition Analysis)            │
│    ├── pip-audit            → Scan des dépendances PyPI (requirements.txt)  │
│    ├── Syft                 → Génération du SBOM CycloneDX (J234)          │
│    └── Trivy                → Scan des vulnérabilités de l'image Docker     │
├──────────────────────────────────────────────────────────────────────────────┤
│ 4. STAGE BUILD & SIGNATURE                                                   │
│    ├── Docker Build         → Compilation sécurisée (Non-root user)         │
│    └── Cosign               → Signature cryptographique de l'image OCI      │
├──────────────────────────────────────────────────────────────────────────────┤
│ 5. STAGE DAST (Dynamic Application Security Testing) & DEPLOYMENT            │
│    ├── OWASP ZAP Baseline   → Scan de l'API REST/GraphQL en staging        │
│    └── OPA Gatekeeper Check → Validation des politiques K8s avant deploy    │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Implémentation du Workflow GitHub Actions (`devsecops-pipeline.yml`) (2h30)

### 🛠️ Atelier Pratique

**Workflow DevSecOps Complet pour l'Infrastructure BCC (`devsecops-pipeline.yml`) :**

```yaml
name: BCC MNBC DevSecOps CI/CD Pipeline

on:
  push:
    branches: [ main, release/* ]
  pull_request:
    branches: [ main ]

jobs:
  secrets-scan:
    name: 1. Secrets Scanning (Gitleaks)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  sast-scan:
    name: 2. SAST Scan (Semgrep)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Semgrep Security Scan
        uses: returntocorp/semgrep-action@v1
        with:
          config: p/owasp-top-10 p/ci p/python p/solidity
          generateSarif: "1"
      - name: Upload SARIF report
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: semgrep.sarif

  sca-and-sbom:
    name: 3. SCA & SBOM Generation (pip-audit & Syft)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install pip-audit syft
      - name: Run pip-audit
        run: pip-audit -r requirements.txt --desc
      - name: Generate SBOM (CycloneDX)
        run: syft dir:. -o cyclonedx-json > bcc-app-sbom.json
      - name: Upload SBOM Artifact
        uses: actions/upload-artifact@v4
        with:
          name: bcc-sbom
          path: bcc-app-sbom.json

  container-scan-and-sign:
    name: 4. Container Scanning & Signing (Trivy & Cosign)
    needs: [secrets-scan, sast-scan, sca-and-sbom]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker Image
        run: |
          docker build -t bcc-registry.ecr.af-south-1.amazonaws.com/bcc-settlement:${{ github.sha }} .
      - name: Run Trivy Scanner (Block on CRITICAL)
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'bcc-registry.ecr.af-south-1.amazonaws.com/bcc-settlement:${{ github.sha }}'
          format: 'table'
          exit-code: '1'
          ignore-unfixed: true
          vuln-type: 'os,library'
          severity: 'CRITICAL,HIGH'
      - name: Install Cosign
        uses: sigstore/cosign-installer@v3.5.0
      - name: Sign Container Image
        env:
          COSIGN_PRIVATE_KEY: ${{ secrets.COSIGN_PRIVATE_KEY }}
          COSIGN_PASSWORD: ${{ secrets.COSIGN_PASSWORD }}
        run: |
          echo "$COSIGN_PRIVATE_KEY" > cosign.key
          cosign sign --key cosign.key --yes bcc-registry.ecr.af-south-1.amazonaws.com/bcc-settlement:${{ github.sha }}

  dast-scan:
    name: 5. DAST Scan (OWASP ZAP)
    needs: [container-scan-and-sign]
    runs-on: ubuntu-latest
    steps:
      - name: ZAP Scan Staging API
        uses: zaproxy/action-api-scan@v0.7.0
        with:
          target: 'https://staging-api.bcc-mnbc.cd/v1/openapi.json'
          format: openapi
          fail_action: true
```

---

## 3) Module — Rapport d'Audit & Quality Gate Policy (2h)

### 🔍 Anatomie Technique — Rapport d'Audit DevSecOps BCC

```markdown
# RAPPORT D'AUDIT DEVSECOPS & QUALITY GATES — BCC MNBC
# Classification : INTERNE — BCC IT SECURITY TEAM

## SYNTHÈSE DES CONTROLES DE LA PIPELINE CI/CD

| Stage               | Outil Intégré   | Seuil de Blocage (Quality Gate)   | Résultat Audit |
|:-------------------:|:---------------:|:----------------------------------|:--------------:|
| Secrets Scanning    | Gitleaks        | 1 secret détecté                  | ✅ PASSED      |
| SAST                | Semgrep         | OWASP High/Critical > 0           | ✅ PASSED      |
| SCA                 | pip-audit       | CVE High/Critical > 0             | ✅ PASSED      |
| SBOM                | Syft            | Fichier CycloneDX valide généré   | ✅ PASSED      |
| Container Scan      | Trivy           | Vulnérabilités CRITICAL > 0       | ✅ PASSED      |
| Signature Artefact  | Cosign          | Signature valide réclamée par OPA | ✅ PASSED      |
| DAST                | OWASP ZAP       | Alertes High Risk > 0             | ✅ PASSED      |

---

## PLAN D'AMÉLIORATION CONTINUE DEVSECOPS

1. **Intégration d'Admission Controller (OPA Gatekeeper)** :
   Vérifier que les images déployées dans le cluster Kubernetes BCC contiennent obligatoirement la signature Cosign valide avant d'autoriser la création des Pods.

2. **Scannage Continu de Registre (ECR Scan on Push + Weekly)** :
   Programmer un scan hebdomadaire automatisé de l'ensemble des images stockées dans AWS ECR pour identifier les nouvelles CVEs découvertes après le build.

3. **Déploiement de SARIF dans GitHub Security Dashboard** :
   Centraliser l'ensemble des rapports d'audit (Semgrep, Trivy, Gitleaks) dans le dashboard de sécurité GitHub de la BCC pour un suivi unifié des vulnérabilités.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SAST** | Static Application Security Testing — Analyse statique du code source sans exécution |
| **DAST** | Dynamic Application Security Testing — Analyse dynamique des applications en cours d'exécution |
| **SCA** | Software Composition Analysis — Analyse des composants et bibliothèques tierces |
| **SARIF** | Static Analysis Results Interchange Format — Format standard JSON pour les résultats de sécurité |
| **Quality Gate** | Barrière de sécurité — Critères stricts devant être validés pour passer à l'étape suivante |
| **ZAP** | Zed Attack Proxy — Outil d'analyse dynamique de sécurité web maintenu par l'OWASP |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer la différence fondamentale entre les approches **SAST (Static Application Security Testing)** et **DAST (Dynamic Application Security Testing)**, et pourquoi une pipeline DevSecOps moderne doit combiner les deux.

**Corrigé :** 
- **SAST (Analyse Statique)** : Examine directement le code source, les fichiers de configuration ou le bytecode **sans exécuter l'application** (ex: Semgrep, SonarQube). Il intervient très tôt dans le cycle (Shift-Left), identifie la ligne exacte de code vulnérable (ex: injection SQL à la ligne 42), mais peut générer des faux-positifs et ne voit pas les problèmes liés à l'environnement d'exécution.
- **DAST (Analyse Dynamique)** : Teste l'application **en cours d'exécution** depuis l'extérieur (ex: OWASP ZAP), en envoyant des requêtes HTTP/API réelles pour observer les réponses. Il valide les vulnérabilités réellement exploitables dans l'environnement configuré (ex: mauvaises en-têtes HTTP, failles BOLA), mais intervient plus tard (en environnement de staging) et n'indique pas directement la ligne de code à corriger.
- **Combinaison** : SAST offre une détection rapide et précise au niveau du code, tandis que DAST confirme l'exploitabilité dans l'environnement d'exécution. Les deux approches sont complémentaires et nécessaires pour couvrir l'intégralité du spectre de sécurité.

**Exercice 2 :** Dans la pipeline DevSecOps BCC, l'étape `Trivy` est configurée avec `exit-code: 1` et `severity: CRITICAL,HIGH`. Que se passe-t-il si une vulnérabilité CRITICAL est découverte dans l'image Docker de la Lambda Settlement ?

**Corrigé :** Si Trivy détecte au moins une vulnérabilité de sévérité `CRITICAL` ou `HIGH` dans l'image Docker :
1. Trivy affiche le rapport détaillé de la vulnérabilité (nom de la bibliothèque, CVE, version installée, version corrigée).
2. L'action Trivy se termine avec un **code de sortie 1** (exit code 1), indiquant un échec de l'étape.
3. Le moteur GitHub Actions interrompt immédiatement le job en cours.
4. Les jobs dépendants (`container-scan-and-sign` étape de signature, puis `dast-scan` et déploiement) sont **annulés / bloqués** (`needs:` condition non satisfaite).
5. La Pull Request ou le Commit est marqué avec une croix rouge ❌, empêchant tout merge ou déploiement en production tant que l'image contient cette vulnérabilité.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle technologie de test de sécurité analyse le **code source** d'une application sans l'exécuter pour trouver des failles comme des injections SQL ou des contrôles d'accès manquants ?
- A) SAST (Static Application Security Testing)
- B) DAST (Dynamic Application Security Testing)
- C) RASP (Runtime Application Self-Protection)
- D) Penetration Testing manuel

**Réponse : A**

**Q2 :** Quel outil open-source est utilisé dans la pipeline DevSecOps BCC pour détecter spécifiquement les **clés d'API, mots de passe ou tokens** hardcodés dans le dépôt Git ?
- A) Gitleaks
- B) OWASP ZAP
- C) Cosign
- D) Syft

**Réponse : A**

**Q3 :** Quel est le rôle d'un **Quality Gate** (barrière de sécurité) dans une pipeline DevSecOps CI/CD ?
- A) Bloquer automatiquement le déploiement ou l'intégration si des critères de sécurité ne sont pas respectés (ex: présence d'une CVE CRITICAL ou d'un secret)
- B) Ralentir artificiellement les builds pour économiser les ressources serveur
- C) Nettoyer les caches des serveurs de déploiement
- D) Générer de la documentation technique automatiquement

**Réponse : A**

**Q4 :** Quel format standardisé (basé sur JSON) est utilisé par des outils comme Semgrep pour transmettre leurs résultats de sécurité au dashboard de sécurité GitHub (Code Scanning) ?
- A) SARIF (Static Analysis Results Interchange Format)
- B) CycloneDX
- C) SPDX
- D) CSV

**Réponse : A**

**Q5 :** Quelle est l'étape de la pipeline DevSecOps BCC qui utilise l'outil **OWASP ZAP** pour envoyer des requêtes malveillantes réelles contre l'API en environnement de staging ?
- A) DAST (Dynamic Application Security Testing)
- B) SAST
- C) SCA
- D) Secrets Scanning

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
