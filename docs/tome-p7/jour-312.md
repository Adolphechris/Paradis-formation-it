# TOME P7 — Certifications d'Élite & Spécialisations — Jour 312 (6h) : CKS Bootcamp — Supply Chain Security (Trivy Image Scanning, Falco Runtime Detection, SBOM Syft & Cosign Image Signing)

> [!NOTE]
> **Objectif du jour :** Maîtriser la **sécurité de la chaîne d'approvisionnement logicielle Kubernetes (Supply Chain Security)** ciblée par la certification **CKS** : scanner les images Docker avec **Trivy** (CVE + secrets + misconfigs), générer un **SBOM (Software Bill of Materials)** avec **Syft**, signer et vérifier les images avec **Cosign/Sigstore**, et détecter les comportements anomaux à l'exécution avec **Falco**.
>
> **Compétences visées :** `CKS-03` (A) — Trivy Image Scanning & SBOM Syft | `CKS-04` (A) — Cosign Image Signing & Falco Runtime Security

---

## 1) Module — Trivy : Scanner d'Images CVE & Secrets (2h)

### 📖 Narration/Intuition

**Trivy** (Aqua Security) est l'outil de référence CKS pour l'analyse de sécurité des images containers : il détecte les CVE dans les packages OS (Alpine, Ubuntu, Debian) et les dépendances applicatives (npm, pip, go.sum), ainsi que les secrets hardcodés et les misconfigurations Dockerfile/Kubernetes.

---

## 2) Module — Pipeline Trivy + Syft + Cosign (`supply_chain_security.sh`) (2h)

### 🛠️ Atelier Pratique

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Trivy : Scan CVE d'une image Docker
# ═══════════════════════════════════════════════════════
# Scan complet (CVE + secrets + misconfigs) avec sortie JSON
trivy image --severity CRITICAL,HIGH \
            --format json \
            --output trivy_report.json \
            nginx:1.25.0

# Vérification des résultats : CVE critiques
trivy image --severity CRITICAL nginx:1.25.0
# CVE-2023-XXXX   CRITICAL   libssl1.1   1.1.1n   Fix: upgrade to 1.1.1q

# Scan dans un pipeline CI/CD (exit code 1 si des CVE CRITIQUES sont trouvées)
trivy image --exit-code 1 --severity CRITICAL nginx:1.25.0
echo "[INFO] Trivy exit code: $?"

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Syft : Génération du SBOM (Software Bill of Materials)
# ═══════════════════════════════════════════════════════
# Générer un SBOM au format SPDX-JSON pour une image
syft scan nginx:1.25.0 -o spdx-json=sbom_nginx.spdx.json
echo "[+] SBOM généré : sbom_nginx.spdx.json"

# Analyser le SBOM avec Grype pour une analyse de CVE sur le SBOM
grype sbom:sbom_nginx.spdx.json --severity critical

# ═══════════════════════════════════════════════════════
# ÉTAPE 3 — Cosign : Signer et Vérifier une image Docker
# ═══════════════════════════════════════════════════════
# Générer une paire de clés Cosign
cosign generate-key-pair

# Signer l'image avec la clé privée Cosign (après push vers ECR)
IMAGE_DIGEST="123456789012.dkr.ecr.eu-west-1.amazonaws.com/webapp@sha256:abc123..."
cosign sign --key cosign.key $IMAGE_DIGEST

# Vérifier la signature avant déploiement (dans le pipeline CI ou un Admission Webhook)
cosign verify --key cosign.pub $IMAGE_DIGEST
echo "[+] Signature Cosign vérifiée — Image de confiance !"

# ═══════════════════════════════════════════════════════
# Politique OPA Gatekeeper pour n'autoriser que les images signées Cosign
# ═══════════════════════════════════════════════════════
# Utiliser le Cosign Admission Webhook (policy-controller) pour bloquer
# automatiquement les images non-signées au niveau du kube-apiserver
kubectl apply -f https://github.com/sigstore/policy-controller/releases/latest/download/policy-controller.yaml
```

---

## 3) Module — Falco : Détection d'Anomalies Runtime (`falco_rules.yaml`) (2h)

```yaml
# Règle Falco personnalisée : Détection d'un shell spawné dans un container
# (indicateur d'exploitation ou de container escape)
- rule: Shell spawned in container
  desc: Détecte l'exécution d'un shell interactif dans un container en production
  condition: >
    spawned_process and
    container and
    container.name != "debug-container" and
    proc.name in (bash, sh, zsh, dash, fish)
  output: >
    ALERTE SÉCURITÉ — Shell détecté dans un container !
    (user=%user.name container=%container.name image=%container.image.repository
     command=%proc.cmdline pid=%proc.pid parent=%proc.pname)
  priority: CRITICAL
  tags: [container, shell, T1059.004]

# Règle Falco : Détection d'une lecture de fichiers sensibles (secrets K8s)
- rule: Read sensitive file in container
  desc: Détecte la lecture de fichiers de Secrets montés dans le container
  condition: >
    open_read and
    container and
    (fd.name startswith /var/run/secrets or
     fd.name startswith /etc/kubernetes/pki or
     fd.name = /proc/1/environ)
  output: >
    ALERTE — Lecture de fichier sensible détectée !
    (file=%fd.name user=%user.name container=%container.name image=%container.image)
  priority: HIGH
  tags: [container, credentials, T1552.001]
```

```bash
# Déployer Falco via Helm
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm install falco falcosecurity/falco \
  --namespace falco \
  --create-namespace \
  --set falco.grpc.enabled=true \
  --set falco.grpcOutput.enabled=true \
  --set customRules."custom-rules\.yaml"="$(cat falco_rules.yaml)"

echo "[+] Falco déployé — Surveillance runtime active sur tous les nœuds"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SBOM** | Software Bill of Materials — Inventaire exhaustif de tous les composants d'un logiciel |
| **Syft** | Outil Anchore de génération de SBOM pour images Docker et systèmes de fichiers |
| **Cosign** | Outil Sigstore de signature cryptographique d'images Docker OCI |
| **Falco** | Outil CNCF de détection d'anomalies runtime basé sur les syscalls Linux et les audit logs K8s |
| **Sigstore** | Infrastructure de signature et vérification open-source (Cosign + Rekor + Fulcio) |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel outil est la référence CKS pour scanner les **CVE des packages OS et des dépendances applicatives** dans une image Docker ?
- A) Trivy (Aqua Security)
- B) Nmap
- C) Wireshark
- D) Snyk uniquement

**Réponse : A**

**Q2 :** Qu'est-ce qu'un **SBOM (Software Bill of Materials)** dans le contexte de la supply chain security ?
- A) Un inventaire structuré listant tous les composants logiciels, bibliothèques et dépendances inclus dans une image ou un artefact, permettant l'audit de provenance et la détection de CVE
- B) Un fichier de configuration Kubernetes
- C) Une clé de chiffrement symétrique
- D) Un rapport de performance réseau

**Réponse : A**

**Q3 :** Quel projet open-source (CNCF / Sigstore) permet de **signer cryptographiquement** une image Docker par son digest SHA256 et de vérifier cette signature avant déploiement ?
- A) Cosign (Sigstore)
- B) Let's Encrypt
- C) HashiCorp Vault
- D) Trivy

**Réponse : A**

**Q4 :** Dans l'écosystème Kubernetes, quel outil CNCF basé sur les **eBPF syscalls** détecte en temps réel les comportements anormaux des containers à l'exécution (ex: shell spawné, lecture de `/proc/1/environ`) ?
- A) Falco (Sysdig)
- B) OPA Gatekeeper
- C) Kyverno
- D) Trivy

**Réponse : A**

**Q5 :** Dans un pipeline CI/CD sécurisé (shift-left security), à quel stade Trivy doit-il être exécuté pour bloquer les images vulnérables AVANT leur push vers le registre ?
- A) Dans l'étape de build CI/CD, après le `docker build` et avant le `docker push`, avec `--exit-code 1 --severity CRITICAL` pour faire échouer le pipeline automatiquement
- B) Uniquement en production
- C) Après le déploiement Kubernetes
- D) Manuellement par un opérateur humain

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
