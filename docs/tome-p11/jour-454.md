# TOME P11 — DevSecOps & Cloud Security — Jour 454 (6h) : Software Supply Chain Security — SCA, SBOM & Attestations SLSA (Software Bill of Materials, Dependency-Track, SPDX/CycloneDX & SLSA Level 3)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser les risques liés à la **Software Supply Chain** (Attaques par dépendances, Typosquatting, Dependency Confusion, Malicious Packages)
> - Générer et valider un **SBOM (Software Bill of Materials)** au format **CycloneDX** et **SPDX**
> - Déployer **OWASP Dependency-Track** pour le suivi continu des vulnérabilités des dépendances tierces
> - Implémenter le cadre **SLSA Level 3** (Supply-chain Levels for Software Artifacts) avec signature d'artefacts **Cosign/Sigstore**
>
> **Compétences visées :** `SEC-07` (A) — Software Supply Chain Security, `SEC-04` (A) — SBOM & Provenance Management

---

## Module 1 — Software Supply Chain & Menaces sur les Dépendances (2h)

### 📖 Intuition & Narration

Une application moderne est constituée à **80-90% de code tiers** (bibliothèques open-source, packages npm, gems, modules Go/Python). Lorsqu'un attaquant compromet une seule bibliothèque populaire (comme l'attaque légendaire `event-stream` ou le piratage des comptes npm de SolarWinds/Log4j), il s'infiltre instantanément dans des milliers d'entreprises qui utilisent cette dépendance.

La **Software Supply Chain Security** garantit l'intégrité, l'authenticité et la traçabilité de chaque composant logiciel utilisé dans votre produit.

### 🔍 Anatomie Technique — Attaques Supply Chain

```
MENACES SUR LA CHAÎNE D'APPROVISIONNEMENT LOGICIELLE

  1. TYPOSQUATTING       : Création de packages malveillants avec des noms proches (ex: `reqeusts` vs `requests`)
  2. DEPENDENCY CONFUSION: Publication de packages malveillants sur registres publics avec le même nom qu'un package interne
  3. COMPROMISSION COMPTE: Vol du compte du mainteneur d'un package populaire (ex: pas de 2FA sur npm/PyPI)
  4. VULNÉRABILITÉ TRANSITIVE: Vulnérabilité située dans une sous-dépendance de niveau 3 ou 4
```

---

## Module 2 — SBOM (CycloneDX / SPDX) & Dependency-Track (2h)

### 🛠️ Atelier Pratique — Génération de SBOM & Audit Dependency-Track

```bash
# ══════════════════════════════════════════════════════
# 1. GÉNÉRATION DE SBOM AVEC TRIVY / CYCLONEDX
# ══════════════════════════════════════════════════════

# Génération d'un SBOM au format CycloneDX JSON avec Trivy
trivy fs --format cyclonedx --output sbom.cdx.json .

# Génération au format SPDX JSON avec Syft (Anchore)
syft dir:. -o spdx-json=sbom.spdx.json

# ══════════════════════════════════════════════════════
# 2. ENVOI DU SBOM VERS OWASP DEPENDENCY-TRACK
# ══════════════════════════════════════════════════════

# Envoi via API REST vers Dependency-Track
PROJECT_UUID="a1b2c3d4-e5f6-7890-1234-567890abcdef"
API_KEY="dt_api_1234567890abcdef"

curl -X "POST" "https://dtrack.internal.paradis.it/api/v1/bom" \
     -H "X-Api-Key: ${API_KEY}" \
     -H "Content-Type: multipart/form-data" \
     -F "project=${PROJECT_UUID}" \
     -F "bom=@sbom.cdx.json"
```

---

## Module 3 — Signature d'Artefacts SLSA Level 3 & Cosign (1h30)

### 🛠️ Atelier Pratique — Signature de Conteneurs avec Cosign / Sigstore

```bash
# ══════════════════════════════════════════════════════
# COSIGN — Signature & Vérification de Conteneurs OCI (Keyless / Sigstore)
# ══════════════════════════════════════════════════════

# Installation Cosign
go install github.com/sigstore/cosign/v2/cmd/cosign@latest

# 1. Signature d'une image Docker avec Cosign (Keyless via OIDC / GitHub Actions)
IMAGE_REF="ghcr.io/paradis/banking-api:v1.2.0"
cosign sign --yes ${IMAGE_REF}

# 2. Signature des attestations de provenance SLSA
cosign attest --type slsaprovenance --predicate provenance.json ${IMAGE_REF}

# 3. Vérification de la signature de l'image avant déploiement
cosign verify \
  --certificate-identity "https://github.com/paradis/banking-core/.github/workflows/deploy.yml@refs/heads/main" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  ${IMAGE_REF}
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SBOM** | Software Bill of Materials — Inventaire structuré de tous les composants et dépendances d'un logiciel |
| **SLSA** | Supply-chain Levels for Software Artifacts — Cadre de sécurité définissant les niveaux d'intégrité logicielle |
| **SPDX** | Software Package Data Exchange — Norme ISO/IEC 5962 pour le format de SBOM |
| **CycloneDX** | Spécification SBOM légère promue par l'OWASP pour la sécurité de la chaîne d'approvisionnement |

---

## Exercices Pratiques

### Exercice 1 — Attaque Dependency Confusion

Expliquez le mécanisme d'une attaque par **Dependency Confusion** et quelle règle de configuration dans un gestionnaire de paquets (ex: `pip.conf` ou `.npmrc`) permet de s'en préserver.

**Corrigé guidé :** L'attaque survient lorsqu'une entreprise utilise un package interne non publié (ex: `@paradis/internal-auth`). L'attaquant publie sur le registre public (npm/PyPI) un package du même nom avec une version très élevée (ex: `99.9.9`). Par défaut, le gestionnaire de paquets télécharge la version la plus récente depuis le registre public. Pour s'en préserver, il faut **configurer le registre privé avec exclusivité de scope (scoping)** pour forcer le téléchargement des packages internes uniquement depuis le serveur d'entreprise.

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce qu'un **SBOM** (Software Bill of Materials) ?

- A) Le contrat commercial signé avec l'éditeur de logiciels
- B) L'inventaire structuré et lisible par machine de l'ensemble des composants et dépendances d'un logiciel ✅
- C) La clé d'activation de la licence Windows
- D) Le rapport d'audit financier de l'équipe informatique

**Q2.** Les deux formats standards majeurs de SBOM sont :

- A) HTML et PDF
- B) CycloneDX et SPDX ✅
- C) YAML et TOML
- D) Dockerfile et Vagrantfile

**Q3.** L'outil **OWASP Dependency-Track** permet de :

- A) Générer du code Java automatiquement
- B) Analyser continuellement les SBOMs soumis pour identifier les nouvelles CVEs publiées sur les dépendances ✅
- C) Chiffrer le trafic réseau HTTPS
- D) Bloquer les attaques DDoS

**Q4.** Le framework **SLSA** (Supply-chain Levels for Software Artifacts) vise à :

- A) Augmenter la vitesse de compilation des programmes C++
- B) Garantir l'intégrité, la traçabilité et la non-falsification du processus de build et des artefacts logiciels ✅
- C) Remplacer les frameworks web comme React ou Angular
- D) Sécuriser les mots de passe des utilisateurs finaux

**Q5.** L'outil **Cosign** (Sigstore) sert à :

- A) Valider la syntaxe des fichiers HTML
- B) Signer et vérifier la provenance des images de conteneurs OCI de manière cryptographique ✅
- C) Nettoyer les fichiers temporaires du système
- D) Configurer les routeurs réseau Cisco

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
