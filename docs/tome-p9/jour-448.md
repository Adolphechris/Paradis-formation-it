# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 448 (6h) : Sécurité Cryptographique des Conteneurs Docker & Kubernetes (Image Signing, SBOM, Sigstore/Cosign, Admission Controllers & Pod Security Standards)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Implémenter la **chaîne de confiance cryptographique des images Docker** de A à Z : Build → Sign → Verify → Admit
> - Maîtriser **Sigstore/Cosign** pour la signature d'images OCI sans gestion de clés privées (keyless signing avec OIDC)
> - Déployer un **Admission Controller Webhook** Kubernetes rejetant toute image non signée
> - Générer et valider une **Software Bill of Materials (SBOM)** avec Syft + Grype
>
> **Compétences visées :** `SEC-04` (A) — Supply Chain Security, `CLD-01` (A) — Container & Kubernetes Security

---

## Module 1 — Sigstore & Cosign : Signature Keyless d'Images OCI (2h)

### 📖 Intuition & Narration

Une image Docker pull depuis un registre public : comment savez-vous qu'elle n'a pas été modifiée par un attaquant entre le build du CI/CD et votre `docker pull` ? La **signature cryptographique d'images** répond à ce problème de Supply Chain Security.

**Sigstore** (Linux Foundation) révolutionne la signature en rendant les clés privées éphémères et en ancrant les signatures dans le **Rekor transparency log** (append-only, auditable par tous). **Cosign** est l'outil CLI de Sigstore pour signer et vérifier les images OCI.

### 🛠️ Atelier Pratique — Pipeline CI/CD avec Cosign Keyless Signing

```yaml
# .github/workflows/secure-build.yml — Pipeline GitHub Actions avec Cosign Keyless
name: Build, Sign & Verify Docker Image (Sigstore/Cosign)

on:
  push:
    branches: [main]

permissions:
  id-token: write    # Requis pour Cosign OIDC Keyless
  contents: read
  packages: write

jobs:
  build-sign-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install Cosign
        uses: sigstore/cosign-installer@v3
        with:
          cosign-release: 'v2.4.0'

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build & Push Docker Image
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}/app:${{ github.sha }}

      # SIGNATURE KEYLESS SIGSTORE — Aucune clé privée à stocker !
      # L'identité provient du token OIDC GitHub Actions
      - name: Sign Docker Image (Cosign Keyless)
        env:
          DIGEST: ${{ steps.build.outputs.digest }}
        run: |
          cosign sign --yes \
            ghcr.io/${{ github.repository }}/app@${DIGEST}
          echo "[+] Image signée et ancrage dans Rekor transparency log effectué"
```

```bash
# Vérification de la signature (côté production / Admission Controller)
# Vérifie que l'image a été signée par le CI/CD officiel GitHub Actions du dépôt PARADIS

cosign verify \
  --certificate-identity "https://github.com/adolphe-corp/paradis//.github/workflows/secure-build.yml@refs/heads/main" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  ghcr.io/adolphe-corp/paradis/app:sha256-abcdef1234567890

# Résultat attendu :
# Verification for ghcr.io/adolphe-corp/paradis/app:sha256-abcdef... --
# The following checks were performed on each of these signatures:
#   - The cosign claims were validated
#   - Existence of the claims in the transparency log was verified offline
#   - The code-signing certificate claims were validated
# [{"critical":{"identity":{"docker-reference":"..."},...}}]
```

---

## Module 2 — SBOM & Admission Controller Kubernetes (2h)

### 🔍 Anatomie Technique — SBOM (Software Bill of Materials)

```
SBOM (SPDX / CycloneDX) — Inventaire Cryptographiquement Attesté

  [Image Docker]
       │
       ▼
  [Syft scan]  ──▶  SBOM SPDX/CycloneDX (JSON/XML)
       │              Liste exhaustive de tous les packages :
       │              ├── OS packages (dpkg/rpm)
       │              ├── Langages (pip, npm, maven, cargo)
       │              └── Licences & CVE references
       ▼
  [Grype scan] ──▶  Rapport de vulnérabilités CVE
       │              ├── CVE-2024-xxxx CRITICAL : OpenSSL 3.0.2 (LibC)
       │              └── CVE-2024-yyyy HIGH : Python requests 2.28.0
       ▼
  [cosign attest --predicate sbom.json] ──▶ SBOM signé et poussé dans le registre
```

```bash
# Génération du SBOM avec Syft
syft ghcr.io/adolphe-corp/paradis/app:latest \
  --output spdx-json=sbom.spdx.json

# Scan de vulnérabilités sur le SBOM
grype sbom:sbom.spdx.json --fail-on critical

# Attester le SBOM comme prédicate de l'image (attestation Sigstore)
cosign attest --yes \
  --predicate sbom.spdx.json \
  --type spdxjson \
  ghcr.io/adolphe-corp/paradis/app@sha256-abcdef...

echo "[+] SBOM ancré cryptographiquement à l'image Docker dans le registre OCI"
```

### 🛠️ Admission Controller Kubernetes — Policy OPA/Gatekeeper

```rego
# PARADIS — OPA Gatekeeper Policy : Bloquer les images non signées par Cosign
# Fichier : constraints/require-cosign-signature.rego

package kubernetes.admission

deny[msg] {
    input.request.kind.kind == "Pod"
    container := input.request.object.spec.containers[_]
    not is_signed_image(container.image)
    msg := sprintf(
        "[PARADIS-SEC] Image NON SIGNÉE refusée : '%v' — La signature Cosign est obligatoire.",
        [container.image]
    )
}

is_signed_image(image) {
    # Vérifie la présence de l'annotation de signature Sigstore dans le registre
    # Implémenté via kyverno-notation-aws ou Policy Controller Sigstore
    image_has_cosign_signature(image)
}
```

---

## Module 3 — Cryptographie PKI pour les Clusters Kubernetes (1h30)

### 🔍 Anatomie Technique — PKI interne Kubernetes

```
PKI INTERNE D'UN CLUSTER KUBERNETES

  [/etc/kubernetes/pki/]  (généré par kubeadm)
  ├── ca.crt / ca.key              ──▶ CA Racine Cluster (10 ans)
  ├── apiserver.crt/key            ──▶ Cert TLS API Server (1 an)
  ├── apiserver-kubelet-client.crt ──▶ Cert client API→Kubelet
  ├── etcd/
  │   ├── ca.crt                   ──▶ CA dédiée etcd (data plane)
  │   ├── server.crt/key           ──▶ Cert TLS des membres etcd
  │   └── peer.crt/key             ──▶ Cert mTLS etcd peer-to-peer
  └── front-proxy-ca.crt           ──▶ CA pour l'extension aggregation layer

  ROTATION AUTOMATIQUE DES CERTS KUBELET (v1.30+) :
  ─────────────────────────────────────────────────
  kubelet --rotate-server-certificates=true
  ──▶ Kubelet génère un CSR automatique 15j avant l'expiration
  ──▶ API Server signe via CertificateSigningRequest (CSR) Kubernetes
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SBOM** | Software Bill of Materials — Inventaire des composants d'un logiciel (packages, versions, licences) |
| **Sigstore** | Cadre open-source (Linux Foundation) de signature transparente et vérifiable d'artefacts logiciels |
| **Cosign** | CLI Sigstore pour signer et vérifier les images OCI de conteneurs |
| **Rekor** | Log de transparence append-only de Sigstore, similaire au Certificate Transparency log |
| **OPA** | Open Policy Agent — Moteur de politiques de sécurité déclaratives pour Kubernetes et APIs |

---

## Exercices Pratiques

### Exercice 1 — Analyse d'un Incident Supply Chain

Un attaquant a compromis un package NPM populaire (`left-pad-evil`) et l'a publié sous un nom proche (`leftpad`). Cette version malveillante est incluse dans une image Docker d'une application de production, buildée et pushée par le pipeline CI/CD sans vérification SBOM ni signature.

**Question :** Quels mécanismes aurait permis de détecter et bloquer cet incident à chaque étape du pipeline PARADIS ?

**Corrigé guidé :**
1. **Build** : `Syft` génère le SBOM complet de l'image → inventaire de TOUS les packages NPM.
2. **Scan** : `Grype` scanne le SBOM et détecte le package `leftpad` comme malveillant ou non référencé.
3. **Gate CI/CD** : `--fail-on critical` ou `--fail-on high` bloque le push si Grype détecte une anomalie.
4. **Registry** : L'image non pushée n'est pas disponible dans le registre → aucune signature Cosign.
5. **Kubernetes** : L'Admission Controller OPA Gatekeeper bloque tout `kubectl apply` d'un Pod référençant une image sans signature Cosign valide.
6. **Résultat** : L'attaque est neutralisée à l'étape 2 ou 3, AVANT que l'image n'atteigne la production.

---

## Banque QCM — 5 Questions

**Q1.** La **Keyless Signing** de Cosign/Sigstore est possible car :

- A) L'image est signée avec la clé publique de Docker Hub
- B) L'identité est prouvée via un token OIDC éphémère (GitHub Actions, GitLab CI), et la signature est ancrée dans Rekor (log de transparence), éliminant le besoin de stocker une clé privée ✅
- C) Cosign utilise RSA-512 sans clé privée
- D) Le registre OCI génère automatiquement la clé

**Q2.** Un **SBOM** au format **SPDX** contient principalement :

- A) La liste des logs d'accès réseau de l'application
- B) L'inventaire de tous les composants logiciels (OS packages, bibliothèques, langages), leurs versions et licences ✅
- C) Les règles de pare-feu applicables à l'image
- D) Les variables d'environnement sensibles du Pod Kubernetes

**Q3.** Dans la PKI Kubernetes, le certificat `etcd/peer.crt` est utilisé pour :

- A) Authentifier les utilisateurs kubectl
- B) Chiffrer les communications mTLS entre les nœuds membres du cluster etcd (peer-to-peer) ✅
- C) Signer les tokens JWT ServiceAccount
- D) Authentifier les images Docker dans le kubelet

**Q4.** L'outil **Grype** sert à :

- A) Surveiller les métriques CPU des conteneurs Kubernetes
- B) Scanner un SBOM ou une image Docker pour identifier les vulnérabilités CVE connues dans les dépendances ✅
- C) Générer des certificats TLS auto-signés
- D) Déployer des Helm Charts

**Q5.** Un **Admission Controller Webhook** dans Kubernetes est déclenché :

- A) Après que le Pod est démarré sur le nœud worker
- B) Avant la persistance de la ressource dans etcd, permettant de valider ou muter la requête API (kubectl apply/create/patch) ✅
- C) Lors du redémarrage du kube-scheduler
- D) Uniquement lors d'une opération kubectl delete

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
