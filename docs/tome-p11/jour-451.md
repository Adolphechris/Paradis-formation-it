# TOME P11 — DevSecOps & Cloud Security — Jour 451 (6h) : DevSecOps Fondamentaux & Security in CI/CD Pipeline (Shift-Left, SAST, DAST, SCA & Security Gates)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser les principes du **DevSecOps** et la philosophie **Shift-Left Security** (intégration précoce de la sécurité dans le SDLC)
> - Concevoir et implémenter une **pipeline CI/CD sécurisée** intgrant des barrières de sécurité automatisées (Security Gates)
> - Articuler l'écosystème d'outils : **SAST** (Static Application Security Testing), **DAST** (Dynamic), **SCA** (Software Composition Analysis), et **Secret Scanning**
> - Définir la politique de blocage du build (Fail-on-Severity) selon le modèle de risque et de gouvernance
>
> **Compétences visées :** `SEC-07` (A) — DevSecOps & CI/CD Security, `SEC-04` (A) — Security Automation

---

## Module 1 — Modèle DevSecOps & Culture Shift-Left (2h)

### 📖 Intuition & Narration

Pendant des décennies, la sécurité informatique a fonctionné comme le contrôle technique d'un véhicule : tout le code était développé, assemblé, testé... puis, la veille de la mise en production, l'équipe sécurité intervenait pour auditer l'application. Résultat : des dizaines de vulnérabilités découvertes au dernier moment, des livraisons bloquées pendant des semaines, et une friction permanente entre développeurs et spécialistes de la sécurité.

Le **DevSecOps** casse ce silo en injectant la sécurité **automatisée à chaque étape du cycle de vie logiciel** (Shift-Left) : dès la rédaction du code dans l'IDE, lors de chaque `git push`, pendant la compilation, et jusqu'au déploiement continu.

### 🔍 Anatomie Technique — Pipeline DevSecOps & Security Gates

```
CYCLE DE VIE DEVSECOPS & BARRIÈRES DE SÉCURITÉ (SECURITY GATES)

  [IDE / DEV] ───▶ [COMMIT / GIT] ───▶ [BUILD / CI] ───▶ [STAGING] ───▶ [PROD]
       │                 │                  │               │             │
  ├── Pre-commit    ├── Git Hooks      ├── SAST        ├── DAST      ├── RASP / EDR
  │   Secret scan   │   Secret scan    │   SonarQube   │   OWASP ZAP │   WAF / Policy
  └── IDE Linter    └── Signed commits │   Semgrep     │   Nuclei    └── Drift detect
                                       ├── SCA         └── IaC Scan
                                       │   Trivy/Snyk      Checkov
                                       └── Container
                                           Trivy scan
  ─────────────────────────────────────────────────────────────────────────────
  POLICY FAIL-ON-SEVERITY : CRITICAL/HIGH = BUILD FAIL | MEDIUM = WARNING
```

#### Comparatif des Technologies d'Analyse

| Technologie | Portée | Moment d'Exécution | Exemple d'Outils |
|:---|:---|:---|:---|
| **Secret Scanning** | Code source, historique Git | Pre-commit & CI | Trufflehog, Gitleaks |
| **SAST** (Static) | Code source non exécuté | Build CI | SonarQube, Semgrep |
| **SCA** (Supply Chain) | Dépendances & packages | Build CI | Trivy, Snyk, Dependency-Check |
| **Container Scanning** | Images Docker / OCI | Post-build CI | Trivy, Grype, Clair |
| **IaC Scanning** | Terraform, K8s manifests | Build CI | Checkov, Kubeaudit, TFSec |
| **DAST** (Dynamic) | Application en cours d'exé. | Staging / QA | OWASP ZAP, Nuclei |

---

## Module 2 — Secret Scanning & Pre-commit Hooks (2h)

### 📖 Intuition & Narration

Un seul jeton d'API AWS ou une clé privée RSA commitée par erreur sur un dépôt GitHub public peut coûter des millions de dollars en quelques minutes (cryptomining malveillant, exfiltration de données). Le **Secret Scanning** est la première ligne de défense : empêcher techniquement qu'un secret ne quitte la machine du développeur.

### 🛠️ Atelier Pratique — Configuration Gitleaks & Pre-commit Hooks

```bash
# ══════════════════════════════════════════════════════
# GITLEAKS — Secret Scanning en Pre-commit & CI/CD
# ══════════════════════════════════════════════════════

# 1. Installation de Gitleaks & Pre-commit framework
apt-get install -y gitleaks
pip3 install pre-commit

# 2. Configuration .gitleaks.toml personnalisée dans le dépôt
cat > .gitleaks.toml << 'EOF'
title = "PARADIS Enterprise Gitleaks Rules"

[allowlist]
description = "Global allowlist"
paths = [
    '''gitleaks\.toml''',
    '''tests/fixtures/.*'''
]
regexes = [
    '''EXAMPLE_NOT_A_REAL_SECRET'''
]

[[rules]]
id = "paradis-api-key"
description = "Détection des clés API internes PARADIS"
regex = '''paradis_live_[0-9a-zA-Z]{32}'''
secretGroup = 0
keywords = ["paradis_live_"]

[[rules]]
id = "generic-api-key"
description = "Generic High Entropy API Key"
regex = '''(?i)(api_key|apikey|secret|password|auth_token)\s*[:=]\s*["']([0-9a-zA-Z]{32,64})["']'''
secretGroup = 2
EOF

# 3. Configuration du fichier .pre-commit-config.yaml
cat > .pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.2
    hooks:
      - id: gitleaks
        name: Gitleaks Secret Scanner
        entry: gitleaks detect --verbose --redact --config=.gitleaks.toml
        language: system
        stages: [commit]
EOF

# 4. Activation du pre-commit hook Git
pre-commit install

# TEST : Tentative de commit avec un faux secret
echo 'PARADIS_SECRET="paradis_live_1234567890abcdef1234567890abcdef"' > config.py
git add config.py
git commit -m "add config"
# → GITLEAKS BLOQUE LE COMMIT IMMÉDIATEMENT !
```

---

## Module 3 — Intégration Pipeline CI/CD (GitHub Actions / GitLab CI) (1h30)

### 🛠️ Atelier Pratique — Pipeline GitHub Actions DevSecOps

```yaml
# .github/workflows/devsecops-pipeline.yml
name: DevSecOps Enterprise Security Pipeline

on:
  push:
    branches: [ main, release/* ]
  pull_request:
    branches: [ main ]

jobs:
  secret-scan:
    name: 1. Secret Scanning
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
    needs: secret-scan
    steps:
      - uses: actions/checkout@v4
      - name: Semgrep Security Scan
        run: |
          pip3 install semgrep
          semgrep scan --config auto --error --severity ERROR .

  sca-scan:
    name: 3. SCA & Container Scan (Trivy)
    runs-on: ubuntu-latest
    needs: sast-scan
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker Image
        run: docker build -t myapp:${{ github.sha }} .
      - name: Scan Image with Trivy (Fail on CRITICAL)
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'myapp:${{ github.sha }}'
          format: 'table'
          exit-code: '1'
          ignore-unfixed: true
          severity: 'CRITICAL,HIGH'
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SAST** | Static Application Security Testing — Analyse statique du code source pour identifier les vulnérabilités |
| **DAST** | Dynamic Application Security Testing — Analyse dynamique d'une application en cours d'exécution |
| **SCA** | Software Composition Analysis — Identification des vulnérabilités dans les composants et dépendances tierces |
| **RASP** | Runtime Application Self-Protection — Technologie de sécurité intégrée au runtime applicatif pour bloquer les attaques |

---

## Exercices Pratiques

### Exercice 1 — Politique Fail-on-Severity

Une pipeline CI/CD s'exécute lors d'une Pull Request. Trivy (SCA) identifie 2 vulnérabilités `MEDIUM` et 1 vulnérabilité `CRITICAL` (CVE-2024-1234) sans correctif disponible (`ignore-unfixed: false`).

**Question :** Selon la politique Fail-on-Severity standard, quel doit être le comportement de la pipeline ?

**Corrigé guidé :** Le build doit **échouer (FAIL)** immédiatement à cause de la vulnérabilité `CRITICAL`. Même sans correctif officiel, l'équipe doit appliquer un workaround, isoler le composant ou créer une exception formellement documentée dans le système d'exemption avec validation du RSSI.

---

## Banque QCM — 5 Questions

**Q1.** La philosophie **Shift-Left Security** vise à :

- A) Reporter les tests de sécurité après le déploiement en production
- B) Automatiser et intégrer la sécurité dès les premières étapes du développement (IDE, Git, CI/CD) ✅
- C) Remplacer les équipes de développement par des experts sécurité
- D) Sécuriser uniquement les infrastructures réseau

**Q2.** La différence fondamentale entre **SAST** et **DAST** est :

- A) SAST s'exécute sur le code source non exécuté ; DAST s'exécute sur l'application en cours d'exécution ✅
- B) SAST est pour les conteneurs, DAST pour le code C
- C) DAST est plus rapide que SAST
- D) SAST requiert un environnement de staging complet

**Q3.** Les hooks **Pre-commit** Git sont particulièrement efficaces pour :

- A) Compiler le binaire final
- B) Empêcher le commit local de secrets (clés API, mots de passe) avant qu'ils ne soient poussés sur le serveur Git ✅
- C) Scanner la mémoire RAM des serveurs
- D) Déployer les conteneurs en production

**Q4.** Le **Secret Scanning** avec Gitleaks utilise principalement :

- A) L'apprentissage profond pour prédire les failles
- B) Des expressions régulières et des algorithmes d'entropie de Shannon pour détecter des chaînes suspectes ✅
- C) Des requêtes SQL sur la base de production
- D) La signature numérique X.509

**Q5.** Une **Security Gate** dans une pipeline CI/CD a pour rôle de :

- A) Ralentir le déploiement de 24 heures pour révision manuelle
- B) Évaluer automatiquement les résultats des outils de sécurité et bloquer la livraison si les seuils de risque sont dépassés ✅
- C) Supprimer les images Docker obsolètes
- D) Générer les mots de passe des bases de données

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
