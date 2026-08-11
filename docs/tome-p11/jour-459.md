# TOME P11 — DevSecOps & Cloud Security — Jour 459 (6h) : Infrastructure-as-Code & GitOps Security (Terraform Hardening, Checkov/TFSec, ArgoCD Security & HashiCorp Vault Integration)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Auditer et sécuriser du code **Infrastructure-as-Code (IaC)** Terraform, OpenTofu, CloudFormation et Helm
> - Intégrer des scanners IaC automatisés (**Checkov**, **TFSec**) dans les pipelines CI/CD
> - Sécuriser une architecture **GitOps (ArgoCD / FluxCD)** : RBAC, repo credentials, SSO & GPG commit signing
> - Centraliser et automatiser la gestion des secrets dynamiques avec **HashiCorp Vault** et **External Secrets Operator (ESO)** sur Kubernetes
>
> **Compétences visées :** `SEC-07` (A) — IaC & GitOps Security, `SEC-04` (A) — Secrets Management & Vault

---

## Module 1 — IaC Security Scanning (Checkov & TFSec) (2h)

### 📖 Intuition & Narration

L'Infrastructure-as-Code (IaC) a révolutionné le déploiement Cloud en permettant de définir des milliers de serveurs, bases de données et réseaux dans de simples fichiers texte. Mais une seule erreur de configuration dans un fichier Terraform (ex: un Security Group autorisant SSH `0.0.0.0/0` ou un bucket S3 sans chiffrement) sera immédiatement dupliquée sur l'ensemble de votre infrastructure Cloud lors du `terraform apply`.

Le **Static IaC Scanning** inspecte le code Terraform/Helm **avant** son application Cloud pour éliminer les erreurs de posture à la source.

### 🛠️ Atelier Pratique — Scanning Terraform avec Checkov

```bash
# ══════════════════════════════════════════════════════
# CHECKOV — Scanner IaC Multi-Framework (Terraform, K8s, Helm)
# ══════════════════════════════════════════════════════

# Installation Checkov
pip3 install checkov

# Scan d'un répertoire Terraform
checkov -d ./terraform/ --framework terraform --output cli

# Scan avec échec sur sévérité HIGH et CRITICAL
checkov -d ./terraform/ --compact --soft-fail-on LOW,MEDIUM

# Exemple d'échec Checkov :
# Check: CKV_AWS_19: "Ensure all data stored in the S3 bucket is encrypted"
# FAILED for resource: aws_s3_bucket.paradis_data
# File: /main.tf:12-25
```

---

## Module 2 — GitOps Security (ArgoCD & Signed Commits) (2h)

### 🔍 Anatomie Technique — Architecture GitOps Sécurisée

```
ARCHITECTURE GITOPS SÉCURISÉE (ArgoCD + Signed Commits)

  [DEV / GIT REPO] ───────────────▶ [ARGOCD CONTROLLER] ───────────▶ [K8S CLUSTER]
  ├── GPG Signed Commits           ├── Read-Only Git Sync           ├── Automatic Drift Repair
  ├── Code Review Required         ├── Sealed Secrets / ESO         └── Least Privilege RBAC
  └── Branch Protection Rules      └── OIDC / SSO Authentication
```

---

## Module 3 — Secrets Management avec HashiCorp Vault (1h30)

### 🛠️ Atelier Pratique — External Secrets Operator (ESO) + Vault

```yaml
# k8s/external-secret-vault.yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: vault-backend
  namespace: production
spec:
  provider:
    vault:
      server: "https://vault.internal.paradis.it:8200"
      path: "secret"
      version: "v2"
      auth:
        kubernetes:
          mountPath: "kubernetes"
          role: "banking-api-role"
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: database-credentials
  namespace: production
spec:
  refreshInterval: "1h"
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: db-secret-k8s  # Secret K8s généré automatiquement
  data:
  - secretKey: DB_PASSWORD
    remoteRef:
      key: production/database
      property: password
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **IaC** | Infrastructure-as-Code — Gestion et provisionnement des infrastructures via du code lisible par machine |
| **ESO** | External Secrets Operator — Contrôleur Kubernetes synchronisant des secrets depuis Vault, AWS Secrets Manager, etc. |
| **GPG** | GNU Privacy Guard — Outil de chiffrement et signature numérique utilisé pour signer les commits Git |

---

## Exercices Pratiques

### Exercice 1 — Drift Detection

En architecture GitOps (ArgoCD), qu'appelle-t-on la **Drift Detection** et comment réagit un contrôleur GitOps sécurisé lorsqu'un administrateur modifie manuellement un pod avec `kubectl edit` ?

**Corrigé guidé :** La Drift Detection mesure la différence (dérive) entre l'état souhaité décrit dans le dépôt Git et l'état réel dans le cluster Kubernetes. Si la synchronisation automatique (`Self-Heal`) est activée sur ArgoCD, le contrôleur **annule immédiatement la modification manuelle** et réapplique la configuration officielle issue de Git, garantissant la règle "Git est la seule source de vérité".

---

## Banque QCM — 5 Questions

**Q1.** L'outil **Checkov** permet d'auditer la sécurité de quel type de fichiers ?

- A) Uniquement les exécutables binaires Windows (.exe)
- B) Les fichiers Infrastructure-as-Code (Terraform, Helm, Kubernetes, CloudFormation) ✅
- C) Les vidéos MP4
- D) Les bases de données Oracle

**Q2.** Dans une architecture **GitOps** sécurisée avec ArgoCD, la "Source de Vérité" (Source of Truth) de l'infrastructure est :

- A) La mémoire RAM de l'administrateur
- B) Le dépôt Git versionné et audité ✅
- C) Le tableau de bord du fournisseur Cloud
- D) Le fichier d'historique bash

**Q3.** L'outil **External Secrets Operator (ESO)** dans Kubernetes sert à :

- A) Stocker les mots de passe en clair dans Git
- B) Synchroniser automatiquement des secrets depuis des coffres sécurisés (Vault, AWS Secrets Manager) vers des Secrets K8s nativement chiffrés ✅
- C) Supprimer les conteneurs inactifs
- D) Bloquer le trafic réseau entrant

**Q4.** Pourquoi est-il fortement recommandé de former les développeurs à **signer leurs commits Git avec GPG** dans une démarche GitOps ?

- A) Pour accélérer le temps de compilation du code
- B) Pour s'assurer cryptographiquement qu'un commit provient bien du développeur autorisé et n'a pas été falsifié sur le serveur Git ✅
- C) Pour économiser de l'espace disque
- D) Pour désactiver les tests unitaires

**Q5.** Dans HashiCorp Vault, un **Dynamic Secret** (Secret Dynamique) se caractérise par :

- A) Un mot de passe identique conservé pendant 10 ans
- B) Des identifiants générés à la demande avec une durée de vie courte (TTL) et révoqués automatiquement à l'expiration ✅
- C) Une clé imprimée sur papier
- D) Un jeton lisible par tout le monde

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
