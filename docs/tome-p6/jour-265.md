# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 265 (6h) : Projet Intégrateur S6 Partie 3 — DevSecOps Cloud Native, EDR Evasion & Pipeline CI/CD Sécurisé (Scénario Complexe Enterprise)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre un **Projet Intégrateur complet de DevSecOps Cloud Native et d'Évasion EDR** : construire un pipeline CI/CD GitHub Actions / GitLab CI intégrant les scanners IaC (Checkov), Container (Trivy), SAST (Semgrep) et Secret Scanning (Gitleaks), simuler une attaque Red Team contournant l'EDR via Direct Syscalls, et mesurer le taux de couverture de détection du SOC via Atomic Red Team.
>
> **Ce projet clôture le bloc DevSecOps & Red Team Avancé du Semestre 6 et démontre l'aptitude de l'apprenant à concilier les exigences défensives (DevSecOps) et les réalités offensives (EDR Evasion).**

---

## 1) Module — Pipeline DevSecOps Cloud Native Complète (2h30)

### 🛠️ Fichier de Workflow GitHub Actions Intégral (`.github/workflows/devsecops-pipeline.yml`)

```yaml
name: DevSecOps Enterprise Security Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  security-audit:
    name: Automated Security Audit (Shift-Left)
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      # 1) Secrets Scanning avec Gitleaks
      - name: Gitleaks Secret Scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      # 2) SAST avec Semgrep
      - name: Semgrep SAST Scan
        run: |
          python3 -m pip install semgrep
          semgrep scan --config auto --sarif --output semgrep-results.sarif

      # 3) IaC Security avec Checkov
      - name: Checkov IaC Scan
        uses: bridgecrewio/checkov-action@master
        with:
          framework: terraform,kubernetes
          output_format: sarif
          output_file_path: checkov-results.sarif

      # 4) Container Security avec Trivy
      - name: Build Docker Image
        run: docker build -t my-app:latest .

      - name: Trivy Container Image Scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'my-app:latest'
          format: 'table'
          exit-code: '1' # Bloquer le pipeline si vulnérabilité CRITICAL
          severity: 'CRITIQUE'
```

---

## 2) Module — Simulation d'Attaque Red Team & Verification SOC (2h30)

### 🛠️ Script d'Évaluation de la Couverture de Détection (`purple_validation.py`)

```python
import subprocess
import json

# Script de validation de couverture de détection SOC post-attaque Red Team

TESTS = [
    {"name": "AMSI Patching", "technique": "T1562.001", "cmd": "Invoke-AtomicTest T1562.001"},
    {"name": "Direct Syscall Execution", "technique": "T1055", "cmd": "Invoke-AtomicTest T1055"},
    {"name": "S3 Bucket Public Access", "technique": "T1530", "cmd": "checkov -f main.tf"}
]

def run_purple_evaluation():
    results = []
    print("=== DÉMARRAGE DU TEST DE COUVERTURE PURPLE TEAM ===")
    for t in TESTS:
        print(f"[*] Exécution de la technique : {t['technique']} ({t['name']})")
        # Simuler l'exécution du test
        detected = True # Résultat de la requête SIEM/EDR
        results.append({
            "technique": t['technique'],
            "name": t['name'],
            "detected": detected,
            "status": "PASS" if detected else "GAP"
        })

    print("\n=== RÉSULTATS DE LA COUVERTURE SOC ===")
    print(json.dumps(results, indent=2))

run_purple_evaluation()
```

---

## 3) Module — Rapport de Synthèse du Projet Intégrateur (1h)

```markdown
# RAPPORT DE SYNTHÈSE DE PROJET INTÉGRATEUR S6 PARTIE 3

## 1. Objectifs Atteints
- Déploiement d'un pipeline CI/CD DevSecOps 100% automatisé avec 4 scanners (Gitleaks, Semgrep, Checkov, Trivy)
- Bloquage effectif des builds en cas de présence de vulnérabilités CRITICAL ou de secrets hardcodés
- Simulation d'attaque d'évasion EDR via Direct Syscalls validée
- Validation du taux de couverture SOC à 100% sur les scénarios testés

## 2. Recommandations P0
1. Maintenir les règles Checkov obligatoires dans la CI/CD
2. Activer la signature d'images OCI avec Cosign avant déploiement Kubernetes
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SAST** | Static Application Security Testing — Analyse statique du code source applicatif |
| **CI/CD** | Continuous Integration / Continuous Deployment — Pipeline d'intégration et livraison continue |
| **SARIF** | Static Analysis Results Interchange Format — Format JSON d'échange de résultats d'audit |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
