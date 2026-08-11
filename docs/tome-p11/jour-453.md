# TOME P11 — DevSecOps & Cloud Security — Jour 453 (6h) : Analyse Dynamique de Sécurité — DAST & Automation (OWASP ZAP, Nuclei, Dynamic API Scanning & Pipeline Integration)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le fonctionnement des scanners **DAST** (Dynamic Application Security Testing) en environnement Web et API
> - Déployer et automatiser **OWASP ZAP** (Zed Attack Proxy) et **Nuclei** (Template-Based Scanner) dans des pipelines CI/CD
> - Réaliser des scans authentifiés de Web APIs (REST/GraphQL) avec jetons OAuth2/JWT
> - Configurer des stratégies de scan non-destructives et gérer les rapports d'audit DAST
>
> **Compétences visées :** `SEC-07` (A) — Dynamic Application Security Testing, `SEC-04` (A) — Web Vulnerability Scanning

---

## Module 1 — Concepts DAST & Scanners Dynamiques (2h)

### 📖 Intuition & Narration

Le SAST lit la recette de cuisine pour vérifier si un ingrédient dangereux s'y trouve. Le **DAST**, lui, goute le plat une fois préparé. Il s'exécute contre l'application en cours de fonctionnement, envoyant des requêtes HTTP malveillantes (injections, malformations, fuzzing) et analysant les réponses HTTP pour identifier des vulnérabilités réelles (XSS, SQLi, SSRF, CORS misconfigurations).

Le DAST présente l'avantage majeur de tester l'application **dans son environnement réel** (avec ses configurations serveur, son WAF, ses middlewares).

### 🔍 Anatomie Technique — SAST vs DAST

```
COMPARAISON SAST vs DAST

  ┌─────────────────────────────────┬─────────────────────────────────┐
  │  SAST (Static)                  │  DAST (Dynamic)                 │
  ├─────────────────────────────────┼─────────────────────────────────┤
  │  Code source (Whitebox)        │  Application exécutable (Black) │
  │  Exécuté pendant le Build CI   │  Exécuté en Staging / QA        │
  │  Détecte failles de code       │  Détecte failles runtime & conf │
  │  Pas besoin d'environnement    │  Nécessite app fonctionnelle    │
  │  Faux positifs plus élevés     │  Faux positifs très faibles     │
  └─────────────────────────────────┴─────────────────────────────────┘
```

---

## Module 2 — Automation OWASP ZAP & Nuclei dans la CI/CD (2h)

### 🛠️ Atelier Pratique — Scans OWASP ZAP & Nuclei

```bash
# ══════════════════════════════════════════════════════
# 1. OWASP ZAP AUTOMATION FRAMEWORK (Baseline & Full Scan)
# ══════════════════════════════════════════════════════

# Zap Baseline Scan (Rapide, non destructif — idéal pour les Pull Requests)
docker run -v $(pwd):/zap/wrk/:rw -t zaproxy/zap-stable zap-baseline.py \
  -t https://staging.app.paradis.it \
  -c zap-baseline.conf \
  -r zap_report.html \
  -J zap_report.json

# ══════════════════════════════════════════════════════
# 2. NUCLEI — Vulnerability Scanner basé sur des Templates YAML
# ══════════════════════════════════════════════════════

# Installation Nuclei
go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest

# Mise à jour des templates de vulnérabilités
nuclei -update-templates

# Scan ciblé d'une API avec sévérités High & Critical
nuclei -u https://staging.api.paradis.it \
  -severity critical,high \
  -tags cve,exposure,sqli,ssrf \
  -json-export nuclei_results.json \
  -H "Authorization: Bearer eyJhbGciOi..."
```

---

## Module 3 — Integration CI/CD & Scan Authentifié d'APIs (1h30)

### 🛠️ Atelier Pratique — Pipeline GitHub Actions DAST

```yaml
# .github/workflows/dast-stage.yml
name: DAST Dynamic Security Testing Stage

on:
  deployment_status:

jobs:
  dast-scan:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Run Nuclei DAST Scan on Staging
        run: |
          docker run --rm projectdiscovery/nuclei:latest \
            -u ${{ github.event.deployment_status.target_url }} \
            -severity critical,high \
            -json-export nuclei-report.json

      - name: Upload DAST Report
        uses: actions/upload-artifact@v4
        with:
          name: dast-nuclei-report
          path: nuclei-report.json
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DAST** | Dynamic Application Security Testing — Analyse de sécurité sur application en cours d'exécution |
| **ZAP** | Zed Attack Proxy — Scanner de sécurité web open-source maintenu par l'OWASP |
| **SSR** | Server-Side Request Forgery — Vulnérabilité permettant d'exécuter des requêtes réseau non autorisées depuis le serveur |

---

## Exercices Pratiques

### Exercice 1 — Choix d'Outils

Pourquoi n'est-il pas recommandé d'exécuter un scan DAST destructif (ex: SQLi avec drop table, fuzzing agressif) directement sur un environnement de production en journée ?

**Corrigé guidé :** Un scan DAST agressif peut altérer la base de données de production, corrompre les données réelles des utilisateurs, générer des dénis de service (DoS) par inondation de requêtes, et déclencher inutilement les alertes du SOC. Les scans DAST approfondis doivent être réservés aux **environnements de Staging/QA** dédiés.

---

## Banque QCM — 5 Questions

**Q1.** Un avantage majeur du DAST par rapport au SAST est :

- A) Le DAST n'a pas besoin que l'application soit déployée
- B) Le DAST teste l'application avec ses configurations réelles et génère moins de faux positifs ✅
- C) Le DAST affiche directement la ligne de code source exacte concernée
- D) Le DAST est toujours plus rapide que le SAST

**Q2.** **OWASP ZAP** en mode "Baseline Scan" est conçu pour :

- A) Effectuer des attaques par déni de service massives
- B) Réaliser un contrôle rapide et non-intrusif des en-têtes de sécurité et failles de base ✅
- C) Recompiler le code source Java
- D) Décrypter les mots de passe stockés en base

**Q3.** L'outil **Nuclei** fonctionne principalement sur la base de :

- A) Décompilation d'exécutables C#
- B) Templates YAML définissant des requêtes d'attaque et des patterns de détection de réponses ✅
- C) Certificats SSL auto-signés
- D) Conteneurs Kubernetes éphémères

**Q4.** Pour scanner une API protégée par OAuth2 avec un outil DAST, il faut :

- A) Désactiver l'authentification sur le serveur de production
- B) Fournir au scanner un jeton d'authentification valide (Bearer Token) dans les headers de scan ✅
- C) Remplacer HTTP par le protocole FTP
- D) Modifier les DNS de l'entreprise

**Q5.** Dans une pipeline CI/CD, à quel moment le DAST doit-il être exécuté ?

- A) Avant la rédaction du code source
- B) Immédiatement après le commit Git local
- C) Une fois l'application déployée dans un environnement de test ou de Staging fonctionnel ✅
- D) Pendant la phase de design de la base de données

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
