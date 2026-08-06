# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 144 (6h) : Sécurité DevSecOps Pipeline & Golden Path Engineering (Platform Engineering, Backstage & SBOM Automatisé)

> [!NOTE]
> **Objectif du jour :** Concevoir et opérationnaliser une plateforme d'ingénierie interne (Internal Developer Platform - IDP) sécurisée pour accélérer les équipes de développement bancaires : Backstage IDP, catalogue de services sécurisé, génération automatique de SBOM (CycloneDX/Syft) à chaque build CI/CD, scoring de sécurité des dépendances (SLSA Levels).
>
> **Compétences visées :** `BIT-08` (A) — Platform Engineering & IDP | `SEC-05` (A) — Supply Chain Security, SBOM & SLSA

---

## 1) Module — Platform Engineering & Backstage IDP (2h)

### 📖 Narration/Intuition

Dans une grande organisation bancaire avec 20 équipes de développeurs, chaque équipe réinvente individuellement la roue : création de pipelines CI/CD, configuration Kubernetes, secrets management, standards de logs. Résultat : des configurations divergentes non sécurisées, des vulnérabilités cachées, et des développeurs qui passent 40% de leur temps sur de la configuration de plateforme au lieu de coder des fonctionnalités métier.

Le **Platform Engineering (Ingénierie de Plateforme)** consiste à créer une équipe dédiée qui construit et maintient un ensemble d'outils, de templates et d'automatisations standardisées (le **Golden Path**) que les développeurs adoptent naturellement car elles facilitent leur travail tout en imposant les bonnes pratiques de sécurité par défaut.

**Backstage** (créé par Spotify, open-source) est la plateforme IDP de référence mondiale.

### 🔍 Anatomie Technique

**Architecture de la Plateforme IDP Backstage BCC :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKSTAGE IDP (Internal Developer Platform BCC)           │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────┤
│  📋 Catalogue   │  🔧 Templates   │  📊 TechDocs    │  🔒 Security Score    │
│  de Services    │  Golden Path    │  Documentation  │  (SBOM / SLSA Grade)  │
│  Microservices  │  Pré-validés    │  Centralisée    │                       │
└─────────────────┴─────────────────┴─────────────────┴───────────────────────┘
                              │ Déclenchement CI/CD
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│               PIPELINE DEVSECOPS AUTOMATISÉ (GitLab / GitHub Actions)       │
│   Build → SBOM (Syft/CycloneDX) → Scan (Grype) → Sign (Cosign) → Deploy   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Génération Automatique de SBOM & Scoring SLSA (2h)

### 📖 Narration/Intuition

Après l'attaque Log4Shell de 2021, les entreprises du monde entier ont réalisé qu'elles ne savaient pas quels logiciels tiers elles utilisaient. La directive de la Maison-Blanche (EO 14028) et le framework **SLSA (Supply chain Levels for Software Artifacts)** ont rendu la génération d'un **SBOM (Software Bill of Materials)** obligatoire pour les logiciels livrés au gouvernement US.

### 🔍 Anatomie Technique

**Pipeline CI/CD GitLab avec génération SBOM et scoring SLSA (`.gitlab-ci.yml`) :**

```yaml
# Pipeline DevSecOps BCC — Golden Path avec SBOM Automatisé
stages:
  - build
  - sbom_generation
  - security_scan
  - sign_artifact
  - deploy

build_image:
  stage: build
  image: docker:24
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

generate_sbom:
  stage: sbom_generation
  image: anchore/syft:latest
  script:
    # Générer le SBOM au format CycloneDX JSON
    - syft $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA -o cyclonedx-json > sbom-$CI_COMMIT_SHA.json
    # Analyser les vulnérabilités connues dans le SBOM
    - grype sbom:sbom-$CI_COMMIT_SHA.json --fail-on critical
  artifacts:
    paths:
      - "sbom-*.json"
    reports:
      dependency_scanning: "sbom-*.json"

sign_image:
  stage: sign_artifact
  image: gcr.io/projectsigstore/cosign:v2
  script:
    # Signer cryptographiquement l'image Docker avec Cosign + Keyless OIDC
    - cosign sign --yes $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - echo "✅ Image Docker signée et SBOM généré — Supply Chain Sécurisée !"
```

---

## 3) Module — Niveaux SLSA & Audit de Supply Chain (2h)

### 📖 Narration/Intuition

Le framework **SLSA (Supply-chain Levels for Software Artifacts)** définit 4 niveaux croissants de maturité de sécurité de la chaîne de production logicielle, permettant d'objectiver et de communiquer le niveau de confiance dans un artefact livré.

### 🔍 Anatomie Technique

**Niveaux SLSA (Supply-chain Levels for Software Artifacts) :**

```
SLSA 0 : Aucune garantie (Build manuel, non documenté)
    │
    ▼
SLSA 1 : Build documenté, SBOM généré automatiquement
    │
    ▼
SLSA 2 : Build sur infrastructure CI/CD versionnée, artefacts signés
    │
    ▼
SLSA 3 : Build hermétique reproductible, source auditée, signature vérifiable
    │
    ▼
SLSA 4 : Build 100% reproductible, revue de code obligatoire, piste d'audit complète
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **IDP** | Internal Developer Platform — Plateforme interne de développement standardisée |
| **Golden Path** | Voie d'or — Chemin sécurisé et recommandé pour déployer une application |
| **SLSA** | Supply-chain Levels for Software Artifacts — Niveaux de maturité sécurité de la chaîne logicielle |
| **Backstage** | Plateforme IDP open-source (Spotify) pour les portails développeurs internes |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Qu'est-ce que le **Golden Path** dans le contexte du Platform Engineering ?

**Corrigé :** Le **Golden Path** est l'ensemble des templates, pipelines CI/CD, configurations Kubernetes et pratiques de sécurité **pré-approuvés, sécurisés par défaut et faciles à utiliser** que l'équipe Platform Engineering met à la disposition des développeurs. L'objectif est de rendre "la bonne chose aussi simple que la mauvaise chose" : un développeur qui utilise le Golden Path respecte automatiquement les standards de sécurité (SBOM, signatures, scans), de conformité et d'observabilité de l'entreprise sans effort supplémentaire.

**Exercice 2 :** Quelle est la distinction entre un **SBOM (Software Bill of Materials)** au format **CycloneDX** et au format **SPDX** ?

**Corrigé :** **SPDX (Software Package Data Exchange)** est le format historique développé par la Linux Foundation (reconnu ISO/IEC 5962:2021), très utilisé pour la conformité aux licences open-source (ex: GPL vs MIT). **CycloneDX** est un format SBOM développé par l'OWASP, optimisé pour la **sécurité opérationnelle** : il décrit les composants avec leurs VulnerabilityID (CVE), les dépendances directes et transitives, et s'intègre directement avec les scanners de vulnérabilités (Grype, Trivy).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle plateforme IDP open-source créée par Spotify permet aux équipes Platform Engineering de centraliser le catalogue de services, les templates et la documentation d'une organisation ?
- A) Backstage
- B) MS Paint
- C) Disquette
- D) Word

**Réponse : A**

**Q2 :** Quel outil open-source génère automatiquement un SBOM (Software Bill of Materials) en analysant une image de conteneur Docker ou un répertoire de code source ?
- A) Syft (Anchore)
- B) Calculator
- C) Notepad
- D) Excel

**Réponse : A**

**Q3 :** Quel framework définit les 4 niveaux de maturité de la sécurité de la chaîne de production logicielle ?
- A) SLSA (Supply-chain Levels for Software Artifacts)
- B) FTP
- C) POP3
- D) Telnet

**Réponse : A**

**Q4 :** Dans un pipeline DevSecOps Golden Path, que se passe-t-il lorsque `grype` détecte une vulnérabilité de niveau CRITICAL dans le SBOM ?
- A) Le pipeline CI/CD est immédiatement bloqué (`--fail-on critical`) et le déploiement est annulé
- B) Le déploiement se poursuit sans alertes
- C) L'image est déployée en production directement
- D) Un e-mail est envoyé en guise d'avertissement mais rien ne bloque

**Réponse : A**

**Q5 :** Quel est l'avantage d'un build hermétique SLSA Niveau 3 par rapport à un build standard ?
- A) Le build est totalement reproductible à l'identique depuis le code source versionné, garantissant qu'aucun composant externe malveillant n'a pu être introduit pendant la compilation
- B) Le build est plus lent
- C) Le build ne produit aucun artefact
- D) Le build supprime le code source

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
