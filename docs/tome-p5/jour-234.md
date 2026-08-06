# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 234 (6h) : Supply Chain Security & SBOM (Sécurité de la Chaîne d'Approvisionnement Logicielle, Leçons SolarWinds/XZ Utils, Framework SLSA, Sigstore & Dependabot)

> [!NOTE]
> **Objectif du jour :** Maîtriser la sécurisation de la chaîne d'approvisionnement logicielle (**Software Supply Chain Security**) : retour d'expérience et analyse des attaques majeures (**SolarWinds**, **XZ Utils**), implémentation du framework **SLSA (Supply-chain Levels for Software Artifacts)**, signature et vérification d'artefacts avec **Sigstore (Cosign)**, génération et audit de **SBOM (Software Bill of Materials)**, et automatisation avec **Dependabot** et **pip-audit**.
>
> **Compétences visées :** `SEC-04` (A) — Supply Chain Security & Attaques par Dépendance | `SEC-05` (A) — SLSA Framework, Sigstore Cosign Signing & SBOM Generation CycloneDX

---

## 1) Module — Anatomie des Attaques Supply Chain (SolarWinds & XZ Utils) (2h)

### 📖 Narration/Intuition

Une application bancaire comme la plateforme MNBC de la BCC ne comprend pas seulement le code écrit par ses développeurs : elle intègre des centaines de bibliothèques open-source (**PyPI, npm, Go modules**) et d'images Docker de base. 

Si un attaquant compromet une seule dépendance en amont (comme lors de l'affaire **SolarWinds** en 2020 ou de la porte dérobée **XZ Utils (CVE-2024-3094)** en 2024), il peut introduire un code malveillant qui sera automatiquement compilé et déployé au cœur du réseau de la BCC sans éveiller de soupçons.

### 🔍 Anatomie Technique

**Comparatif des Attaques Majeures de Supply Chain :**

```
┌─────────────────────────┬──────────────────────────┬─────────────────────────────────┐
│ Attaque                 │ Vecteur d'Infiltration   │ Impact                          │
├─────────────────────────┼──────────────────────────┼─────────────────────────────────┤
│ SolarWinds (2020)       │ Compromission du système │ Backdoor SUNBURST injectée dans │
│                         │ de build (Orion)         │ 18 000 entreprises & agences US │
├─────────────────────────┼──────────────────────────┼─────────────────────────────────┤
│ XZ Utils (CVE-2024-3094)│ Social Engineering sur   │ Backdoor SSH (systemd/sshd)     │
│                         │ maintainer open-source   │ bypass d'authentification RSA   │
├─────────────────────────┼──────────────────────────┼─────────────────────────────────┤
│ Dependency Confusion    │ Noms de packages internes│ Exécution de code à l'install   │
│ (Alex Birsan, 2021)     │ republiés sur PyPI/npm   │ (pip install / npm install)     │
├─────────────────────────┼──────────────────────────┼─────────────────────────────────┤
│ Typosquatting           │ Noms similaires (ex:     │ Vol de variables d'env et keys  │
│                         │ `reqeusts` vs `requests`)│ lors du build                   │
└─────────────────────────┴──────────────────────────┴─────────────────────────────────┘
```

---

## 2) Module — Framework SLSA & Signature avec Sigstore / Cosign (2h)

### 📖 Narration/Intuition

Le framework **SLSA (Supply-chain Levels for Software Artifacts)** développé par Google et l'OpenSSF définit 4 niveaux de sécurité pour garantir l'intégrité du code, du commit initial jusqu'à l'artefact compilé final.

Pour garantir qu'une image Docker ou un binaire exécuté par la BCC n'a pas été altéré durant le build, on utilise **Sigstore (Cosign)** pour signer cryptographiquement l'artefact et vérifier sa provenance (**Provenance Attestation**).

### 🛠️ Atelier Pratique

**Signature et Vérification d'Images Docker avec Cosign (`cosign_demo.sh`) :**

```bash
# 1. Installer Cosign (Sigstore CLI)
curl -O -L "https://github.com/sigstore/cosign/releases/latest/download/cosign-linux-amd64"
sudo mv cosign-linux-amd64 /usr/local/bin/cosign && sudo chmod +x /usr/local/bin/cosign

# 2. Générer une paire de clés de signature Cosign pour la BCC
cosign generate-key-pair
# Generates cosign.key (Secret) and cosign.pub (Public)

# 3. Signer l'image Docker de la Lambda Settlement BCC
IMAGE_URI="bcc-registry.ecr.af-south-1.amazonaws.com/bcc-settlement:v1.2.0"
cosign sign --key cosign.key $IMAGE_URI

echo "✅ Image Docker signée cryptographiquement avec Cosign"

# 4. Vérifier la signature avant déploiement dans Kubernetes (Admission Controller / OPA)
cosign verify --key cosign.pub $IMAGE_URI

# RÉSULTAT :
# Verification for bcc-registry.ecr.af-south-1.amazonaws.com/bcc-settlement:v1.2.0 --
# The following checks were performed on each of these signatures:
#   - The cosign claims were validated
#   - The signatures were verified against the specified public key
# [{... "critical": {"identity": {"docker-reference": "..."}, "type": "cosign container image signature"}}]
echo "✅ Signature valide — Image authentique et non altérée !"
```

---

## 3) Module — Audit de Dépendances & Pipeline SBOM (2h)

### 📖 Narration/Intuition

Un **SBOM (Software Bill of Materials)** est la liste des ingrédients d'un logiciel. La BCC impose désormais que chaque composant MNBC soit accompagné de son SBOM au format **CycloneDX** ou **SPDX**, audité automatiquement par des outils comme **pip-audit** et **Dependabot**.

### 🛠️ Atelier Pratique

**Pipeline de Validation Supply Chain CI/CD (`supply_chain_pipeline.sh`) :**

```bash
# 1. Génération de SBOM avec Syft (Anchore)
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin
syft dir:. -o cyclonedx-json > bcc-app-sbom.json

# 2. Audit des dépendances Python avec pip-audit
pip3 install pip-audit
pip-audit -r requirements.txt

# RÉSULTAT DE PIP-AUDIT :
# Found 2 vulnerabilities in 2 packages
# Name       Installed Fixed    ID
# ---------- --------- -------- ----------------
# requests   2.25.1    2.31.0   PYSEC-2023-74
# cryptography 3.4.7   41.0.6   PYSEC-2023-245

# 3. Configuration Dependabot dans le dépôt GitHub BCC (`.github/dependabot.yml`)
cat << 'EOF' > .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "pip"
    directory: "/"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 10
    security-advisories-only: true

  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "daily"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
EOF

echo "✅ Dependabot activé — Mises à jour de sécurité automatisées"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SLSA** | Supply-chain Levels for Software Artifacts — Framework de sécurité de la chaîne d'approvisionnement |
| **SBOM** | Software Bill of Materials — Inventaire détaillé des composants logiciels d'une application |
| **Sigstore** | Projet open-source (Linux Foundation) facilitant la signature et la vérification de code |
| **Cosign** | Outil CLI du projet Sigstore spécialisé dans la signature des conteneurs OCI/Docker |
| **OpenSSF** | Open Source Security Foundation — Fondation pour la sécurisation des logiciels open-source |
| **SPDX** | Software Package Data Exchange — Norme ISO/IEC 5962 pour le formatage de SBOM |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer le concept d'attaque par **Dependency Confusion** découvert par Alex Birsan et comment une organisation comme la BCC peut s'en protéger lors de la gestion de ses packages Python ou Node.js internes.

**Corrigé :** L'attaque par **Dependency Confusion** exploite la manière dont les gestionnaires de paquets (`pip`, `npm`) résolvent les dépendances lorsqu'un projet utilise à la fois des packages internes (privés) et externes (publics). Si un projet BCC importe un package interne nommé `bcc-crypto-utils` depuis un registre privé, mais que la configuration de `pip` n'est pas strictement isolée, un attaquant peut publier sur le registre public PyPI un package nommé exactement `bcc-crypto-utils` avec un numéro de version très élevé (ex: `99.9.9`). Par défaut, le gestionnaire de paquets télécharge la version la plus récente depuis le registre public et exécute le code malveillant lors de l'installation. **Protection** : (1) Réserver les noms de domaines / scopes internes sur les registres publics (ex: `@bcc/package` sur npm). (2) Configurer `pip` et `npm` avec des registres d'entreprise (Artifactory, Nexus) en mode miroir strict (`--index-url` sans fallback public). (3) Utiliser des fichiers de lock (`pipfile.lock`, `package-lock.json`) contenant les hashes SHA-256 exacts de chaque package.

**Exercice 2 :** Dans le framework **SLSA (Supply-chain Levels for Software Artifacts)**, quelle est la différence entre le Niveau 1 et le Niveau 3 en termes de traçabilité du build et de protection du pipeline CI/CD ?

**Corrigé :**
- **SLSA Niveau 1** : Exige simplement que le processus de build soit **automatisé** (ex: via un script ou GitHub Actions) et qu'il génère un document de **provenance basique** indiquant qui a produit l'artefact. Il ne garantit pas la protection contre les manipulations de l'environnement de build.
- **SLSA Niveau 3** : Exige un environnement de build **isolé, éphémère et hermétique** (le serveur de build ne peut pas télécharger de dépendances arbitraires pendant la compilation), où le processus de build est entièrement piloté par du code source sous contrôle de version. La **provenance est signée cryptographiquement** par une identité de build infalsifiable (ex: Sigstore/Fulcio via OIDC GitHub Actions), garantissant que l'artefact provient à 100% du code source audité et qu'aucune injection n'a eu lieu pendant l'étape de compilation (protection contre les attaques de type SolarWinds).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle attaque majeure de la chaîne d'approvisionnement en 2020 a compromis 18 000 organisations en injectant la backdoor SUNBURST directement au sein du système de build de l'éditeur ?
- A) SolarWinds
- B) XZ Utils
- C) Log4Shell
- D) Heartbleed

**Réponse : A**

**Q2 :** Quel outil open-source du projet **Sigstore** permet de signer cryptographiquement des images Docker/OCI et de vérifier leur provenance avant déploiement dans un cluster Kubernetes ?
- A) Cosign
- B) Trivy
- C) Falco
- D) Syft

**Réponse : A**

**Q3 :** Quel framework développé par Google et l'OpenSSF définit 4 niveaux de maturité (Niveaux 1 à 4) pour sécuriser l'ensemble de la chaîne d'approvisionnement logicielle, du commit à l'artefact compilé ?
- A) SLSA (Supply-chain Levels for Software Artifacts)
- B) NIST SP 800-207
- C) ISO 27005
- D) OWASP Top 10

**Réponse : A**

**Q4 :** Quel est l'objectif principal de la génération d'un **SBOM (Software Bill of Materials)** au format CycloneDX ou SPDX dans une pipeline CI/CD ?
- A) Fournir l'inventaire exhaustif de tous les composants, bibliothèques et dépendances d'une application pour identifier instantanément les vulnérabilités CVE émergentes
- B) Compresser la taille des images Docker
- C) Accélérer le temps de compilation du code
- D) Chiffrer le code source de l'application

**Réponse : A**

**Q5 :** Quelle faille majeure de 2024 (CVE-2024-3094) a été introduite via une technique d'ingénierie sociale complexe sur plusieurs années ciblant un maintainer de projet open-source ?
- A) XZ Utils backdoor
- B) SolarWinds
- C) Dependency Confusion
- D) Typosquatting PyPI

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
