# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 104 (6h) : Sécurité de la Supply Chain Logicielle (SBOM, Cosign, In-Toto & SLSA)

> [!NOTE]
> **Objectif du jour :** Maîtriser la sécurisation de la chaîne d'approvisionnement logicielle (Software Supply Chain Security) : génération et audit du SBOM (Software Bill of Materials / Syft / Grype), signature cryptographique des images Docker avec Cosign (Sigstore), politiques d'admission Kubernetes avec Kyverno / OPA Gatekeeper et conformité SLSA (Supply-chain Levels for Software Artifacts).
>
> **Compétences visées :** `SEC-05` (A) — Sécurité Supply Chain Logicielle | `BIT-08` (A) — Signature & Intégrité des Artefacts

---

## 1) Module — La Menace Supply Chain & le Framework SLSA (2h)

### 📖 Narration/Intuition

Même si votre propre code source est parfaitement sécurisé et audité, votre application bancaire dépend de centaines de bibliothèques tiers (npm, PyPI, conteneurs de base). Une **attaque sur la Supply Chain** (comme les affaires SolarWinds ou XZ Utils / CVE-2024-3094) consiste pour un attaquant à compromettre une dépendance en amont pour injecter une porte dérobée qui sera automatiquement déployée chez tous les utilisateurs.

Le framework **SLSA (Supply-chain Levels for Software Artifacts)** par la Linux Foundation et Google définit les niveaux d'exigence pour garantir qu'un binaire ou une image de conteneur provient bien du code source officiel et n'a pas été altéré pendant le build.

### 🔍 Anatomie Technique

**Les Niveaux d'Exigence du Framework SLSA (SLSA Levels 1 à 3) :**

```
┌─────────────────────────────────────────────────────────────┐
│ SLSA LEVEL 1 : Build Automatisé & SBOM                      │
│ - Le processus de build est entièrement automatisé.          │
│ - Génération d'un inventaire SBOM des composants.            │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SLSA LEVEL 2 : Build Hébergé & Provenance Signée           │
│ - Le build s'exécute sur un service CI/CD dédié (ex: GitHub)│
│ - La provenance de l'artefact est signée cryptographiquement│
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SLSA LEVEL 3 : Isolation de Build & Inviolabilité           │
│ - Environnements de build isolés et éphémères.              │
│ - Prévention des modifications pendant la compilation.      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Inventaire SBOM & Signature avec Cosign (2h)

### 📖 Narration/Intuition

Un **SBOM (Software Bill of Materials)** est la liste d'ingrédients exacte de votre logiciel. En cas de découverte d'une nouvelle faille zero-day dans une bibliothèque (ex: Log4j), le SBOM permet de savoir en quelques secondes quelles applications de la BCC sont touchées.

**Cosign (projet Sigstore)** permet de signer cryptographiquement une image de conteneur Docker après le build et de vérifier sa signature avant tout déploiement dans le cluster Kubernetes.

### 🔍 Anatomie Technique

**Génération de SBOM et Signature d'Image avec Syft et Cosign :**

```bash
# ─── 1. Génération du SBOM avec Syft ───────────────────────────────────────────
# Générer le SBOM d'une image Docker au format standard SPDX / CycloneDX
syft ghcr.io/bcc/virement-api:v2.1.0 -o cyclonedx-json > sbom-virement.json

# Scanner les vulnérabilités du SBOM généré avec Grype
grype sbom:sbom-virement.json

# ─── 2. Signature Cryptographique de l'Image Docker avec Cosign ───────────────
# Générer une paire de clés de signature (ou utiliser le mode Keyless Sigstore OIDC)
cosign generate-key-pair

# Signer l'image Docker stockée dans le registre (GHCR / Docker Hub)
cosign sign --key cosign.key ghcr.io/bcc/virement-api:v2.1.0

# ─── 3. Vérification de la Signature de l'Image ───────────────────────────────
cosign verify --key cosign.pub ghcr.io/bcc/virement-api:v2.1.0
```

---

## 3) Module — Politique d'Admission Kubernetes avec Kyverno (2h)

### 📖 Narration/Intuition

Il ne suffit pas de signer les images en CI/CD : il faut s'assurer que le cluster Kubernetes **interdise formellement le lancement de tout conteneur dont l'image n'est pas signée par la clé officielle de la BCC**.

**Kyverno** est un moteur de politiques de sécurité natif pour Kubernetes qui intercepte les demandes de création de Pods et valide leurs signatures.

### 🔍 Anatomie Technique

**Politique Kyverno d'exigence de signature d'image (`policy-check-signature.yaml`) :**

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: verify-image-signature
spec:
  validationFailureAction: Enforce  # Bloque activement les Pods non signés
  background: false
  rules:
    - name: verify-signature-bcc
      match:
        any:
        - resources:
            kinds:
              - Pod
            namespaces:
              - bcc-production
      verifyImages:
      - imageReferences:
        - "ghcr.io/bcc/*"
        key: |-
          -----BEGIN PUBLIC KEY-----
          MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE... (Clé publique Cosign BCC)
          -----END PUBLIC KEY-----
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SBOM** | Software Bill of Materials — Inventaire détaillé de tous les composants d'un logiciel |
| **SLSA** | Supply-chain Levels for Software Artifacts — Framework de sécurité de la chaîne d'approvisionnement |
| **SPDX** | Software Package Data Exchange — Standard open-source de formatage de SBOM |
| **CycloneDX** | Standard de spécification SBOM orienté sécurité applicative (OWASP) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Qu'est-ce qu'une attaque par injection de dépendances (Dependency Confusion) sur la Supply Chain logicielle ?

**Corrigé :** Une attaque par **Dependency Confusion** se produit lorsqu'une entreprise utilise un package interne privé (ex: `bcc-auth-utils`). Si le nom de ce package n'a pas été réservé sur le gestionnaire de packages public (ex: PyPI ou npm), un attaquant dépose un package public portant **exactement le même nom** mais avec un numéro de version supérieur (ex: `v99.0.0`) contenant un code malveillant. Lors du build automatisé, le gestionnaire de dépendances télécharge la version malveillante la plus récente depuis le registre public au lieu du registre interne.

**Exercice 2 :** Pourquoi la vérification automatique des signatures d'images (Cosign) par un contrôleur d'admission (Kyverno) dans Kubernetes empêche-t-elle les déploiements non autorisés ?

**Corrigé :** Même si un attaquant réussit à pousser une image Docker compromise portant le tag `:latest` sur le registre d'images d'entreprise, il ne possède pas la clé privée de signature Cosign stockée en lieu sûr. Lorsque Kubernetes tente de démarrer le Pod, le contrôleur d'admission Kyverno intercepte la requête, vérifie la signature de l'image via Cosign et rejette immédiatement la création du Pod avec une erreur d'admission, empêchant l'image malveillante de s'exécuter.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Que contient un document SBOM (Software Bill of Materials) ?
- A) L'historique des requêtes SQL
- B) L'inventaire complet et structuré de toutes les dépendances, bibliothèques et composants logiciels utilisés par une application
- C) Les mots de passe des administrateurs
- D) Le plan d'étage du bâtiment

**Réponse : B**

**Q2 :** Quel outil open-source développé dans le cadre du projet Sigstore permet de signer cryptographiquement et de vérifier les images de conteneurs Docker ?
- A) Cosign
- B) Nmap
- C) Ping
- D) Systemd

**Réponse : A**

**Q3 :** Quel est le rôle d'un contrôleur d'admission Kubernetes comme Kyverno ou OPA Gatekeeper dans la sécurité de la Supply Chain ?
- A) Formater les disques durs
- B) Bloquer automatiquement au niveau du cluster la création de tout Pod dont l'image n'est pas signée ou ne respecte pas les politiques de sécurité
- C) Remplacer le DNS
- D) Écrire du code Python

**Réponse : B**

**Q4 :** Quel standard de formatage SBOM est maintenu par la Linux Foundation pour l'échange d'informations sur les composants logiciels ?
- A) SPDX (ou CycloneDX)
- B) MP3
- C) DOCX
- D) EXE

**Réponse : A**

**Q5 :** Quel framework de sécurité développé par la Linux Foundation et Google définit des niveaux d'exigence (Level 1 à 3) pour garantir la provenance et l'inviolabilité des builds d'artefacts logiciels ?
- A) SLSA (Supply-chain Levels for Software Artifacts)
- B) PCI-DSS
- C) BGP
- D) ISO 9001

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
