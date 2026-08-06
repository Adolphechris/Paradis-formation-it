# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 106 (6h) : Sécurité des Infrastructures Cloud-Native & Posture Management (CSPM, CWPP & KSPM)

> [!NOTE]
> **Objectif du jour :** Maîtriser la gestion de la posture de sécurité du Cloud (CSPM) et la protection des charges de travail (CWPP / KSPM) : audit de conformité cloud automatisé (Prowler, Checkov), détection des dérives de configuration IaC, et protection en temps réel des clusters Kubernetes avec Falco.
>
> **Compétences visées :** `SEC-05` (A) — Posture Management Cloud (CSPM/CWPP) | `BIT-08` (A) — Détection des Menaces Kubernetes (KSPM)

---

## 1) Module — Cloud Security Posture Management (CSPM) & Audit AWS/Azure (2h)

### 📖 Narration/Intuition

Dans les environnements multi-cloud complexes (AWS, Azure, GCP), les erreurs de configuration humaine (Buckets S3 rendus publics par inadvertance, Security Groups autorisant SSH depuis `0.0.0.0/0`, absence de chiffrement KMS) constituent la cause n°1 des fuites de données d'entreprise.

Un outil **CSPM (Cloud Security Posture Management)** inspecte en continu l'ensemble des APIs cloud pour détecter ces dérives par rapport aux standards de conformité (CIS AWS Benchmarks, PCI-DSS, GDPR).

### 🔍 Anatomie Technique

**Architecture CSPM avec Prowler :**

```
┌─────────────────────────────────────────────────────────────┐
│                    OUTIL CSPM (PROWLER)                     │
│  - Inspecte les configurations via les APIs Cloud (Read-Only)│
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
    ┌──────────▼──────────┐        ┌──────────▼──────────┐
    │     AWS ACCOUNT     │        │    AZURE TENANT     │
    │  - Check S3 Public  │        │  - Check KeyVault   │
    │  - Check IAM Policy │        │  - Check NSG Rules  │
    │  - Check CloudTrail │        │  - Check ActivityLog│
    └─────────────────────┘        └─────────────────────┘
```

**Exécution d'un audit CSPM avec Prowler :**

```bash
# Installation de Prowler (Scanner CSPM multi-cloud)
pip install prowler

# Lancer un audit de conformité AWS basé sur le CIS Benchmark v3.0
prowler aws --profile bcc-auditor --compliance cis_3.0_aws

# Filtrer uniquement les découvertes CRITIQUES et HAUTES
prowler aws --severity critical high

# Générer un rapport de conformité HTML et JSON pour le SIEM
prowler aws -M html json-asff -output-directory /var/log/prowler/
```

---

## 2) Module — Cloud Workload Protection (CWPP) & Détection en Temps Réel avec Falco (2h)

### 📖 Narration/Intuition

Le CSPM vérifie la configuration *statique* du cloud. Le **CWPP (Cloud Workload Protection Platform)** et le **KSPM (Kubernetes Security Posture Management)** surveillent la sécurité *dynamique* et en temps réel des conteneurs en cours d'exécution.

**Falco** (projet CNCF) est le standard open-source de détection des menaces au niveau du noyau pour Kubernetes. Il s'appuie sur eBPF pour analyser les appels système et déclencher des alertes immédiates en cas de comportement suspect (ex: ouverture d'un shell interactif dans un conteneur de production, modification de `/etc/pam.d`).

### 🔍 Anatomie Technique

**Structure d'une règle de détection Falco (`falco_rules.local.yaml`) :**

```yaml
# Règle Falco : Détecter l'ouverture d'un terminal shell (bash/sh) dans un conteneur de Prod
- rule: Terminal Shell in Production Container
  desc: Détecte le lancement d'un shell interactif dans un pod Kubernetes
  condition: >
    spawned_process and container and
    k8s.ns.name = "bcc-production" and
    proc.name in (bash, sh, zsh, ksh) and
    not proc.pname in (systemd, entrypoint.sh)
  output: >
    🚨 ALERTE SECURITE K8S: Shell interactif ouvert dans le Pod (user=%user.name
    pod=%k8s.pod.name ns=%k8s.ns.name container=%container.name cmd=%proc.cmdline)
  priority: WARNING
  tags: [container, k8s, mitre_execution]
```

**Commandes d'administration et surveillance Falco :**

```bash
# Déployer Falco avec support eBPF dans Kubernetes via Helm
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update

helm install falco falcosecurity/falco \
  --namespace falco --create-namespace \
  --set driver.kind=ebpf \
  --set tty=true

# Observer les alertes de sécurité en temps réel
kubectl logs -f -l app.kubernetes.io/name=falco -n falco
```

---

## 3) Module — Audit Statique d'Infrastructure as Code (Checkov & TFSec) (2h)

### 📖 Narration/Intuition

Le moyen le plus efficace de corriger les erreurs de configuration cloud est de les intercepter **avant** qu'elles ne soient déployées en production, directement dans le code Terraform ou les manifestes Kubernetes au cours du pipeline CI/CD (Shift-Left Cloud Security).

### 🔍 Anatomie Technique

**Audit d'un fichier Terraform avec Checkov :**

```bash
# Installation de Checkov
pip install checkov

# Scanner un répertoire contenant du code Terraform / CloudFormation
checkov -d ./terraform/

# Exécuter Checkov dans le pipeline CI/CD avec blocage sur échec
checkov -d ./terraform/ --framework terraform --compact --quiet
```

**Exemple de correction d'une alerte Checkov (`CKV_AWS_20`) :**

```hcl
# ❌ CODE INVALIDE (Rejeté par Checkov - Bucket S3 ouvert au public)
resource "aws_s3_bucket" "bad_bucket" {
  bucket = "bcc-bank-data"
}

# ✅ CODE CONFORME (Validé par Checkov)
resource "aws_s3_bucket" "good_bucket" {
  bucket = "bcc-bank-data-secure"
}

resource "aws_s3_bucket_public_access_block" "good_bucket_privacy" {
  bucket                  = aws_s3_bucket.good_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CSPM** | Cloud Security Posture Management — Gestion de la posture de sécurité multi-cloud |
| **CWPP** | Cloud Workload Protection Platform — Plateforme de protection des charges de travail cloud/conteneurs |
| **KSPM** | Kubernetes Security Posture Management — Audit et sécurité de la posture Kubernetes |
| **ASFF** | AWS Security Finding Format — Format JSON d'échange d'alertes de sécurité AWS |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence de positionnement entre un outil **CSPM** (ex: Prowler) et un outil **CWPP** (ex: Falco) ?

**Corrigé :** Un outil **CSPM** effectue une analyse de configuration *statique et déclarative* au niveau de l'infrastructure Cloud (via des appels APIs aux services AWS/Azure). Il vérifie si les règles de pare-feu, les buckets S3 ou les politiques IAM respectent les bonnes pratiques. Un outil **CWPP** effectue une analyse *dynamique en temps réel* au niveau du système d'exploitation et des conteneurs en cours d'exécution. Il intercepte les processus malveillants, les ouvertures de shells non autorisées et les tentatives d'évasion de conteneurs.

**Exercice 2 :** Pourquoi est-il indispensable d'intégrer un scanner d'IaC comme **Checkov** directement dans les hooks Git ou dans le pipeline CI/CD ?

**Corrigé :** Intégrer Checkov en amont (Shift-Left) permet de détecter et de corriger les failles de sécurité de l'infrastructure (ex: Buckets S3 publics, ports SSH ouverts) pendant la phase d'écriture du code Terraform, **avant même que l'infrastructure ne soit provisionnée sur AWS**. Cela évite d'exposer des failles de sécurité en production et réduit considérablement les coûts de remédiation par rapport à une correction post-déploiement.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel type de solution de sécurité cloud est spécialement conçu pour analyser la configuration statique des comptes AWS, Azure et GCP afin de repérer les erreurs de paramétrage (ex: Buckets S3 publics) ?
- A) CSPM (Cloud Security Posture Management)
- B) Anti-spam e-mail
- C) Câble Ethernet
- D) Lecteur de cartes à puce

**Réponse : A**

**Q2 :** Quel outil open-source basé sur eBPF permet de surveiller en temps réel les appels système des conteneurs Kubernetes et de générer des alertes en cas de comportement anormal ?
- A) Falco
- B) Ping
- C) Gzip
- D) Telnet

**Réponse : A**

**Q3 :** Quel scanner d'Infrastructure as Code (IaC) analyse le code Terraform, Helm ou CloudFormation dans le pipeline CI/CD pour bloquer les configurations non conformes avant leur déploiement ?
- A) Checkov
- B) Wireshark
- C) Metasploit
- D) Traceroute

**Réponse : A**

**Q4 :** Si Falco génère une alerte avec la priorité `WARNING` indiquant qu'un binaire `bash` a été exécuté dans un conteneur de production, quelle action d'investigation immédiate doit mener le SOC ?
- A) Supprimer l'ensemble du cluster Kubernetes
- B) Inspecter quel utilisateur/processus a ouvert le terminal interactif et vérifier si cette session correspond à une maintenance légitime ou à un début de compromission
- C) Ignorer l'alerte
- D) Éteindre l'électricité du bâtiment

**Réponse : B**

**Q5 :** Quel est l'avantage majeur du moteur eBPF lorsqu'il est utilisé par Falco pour la surveillance des conteneurs par rapport à un module noyau traditionnel ?
- A) Il exige de recompiler le noyau Linux chaque jour
- B) Il s'exécute de manière ultra-rapide et sécurisée dans le noyau sans risquer de faire planter le système hôte
- C) Il ne fonctionne que sur les ordinateurs portables
- D) Il désactive la sécurité de Kubernetes

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
