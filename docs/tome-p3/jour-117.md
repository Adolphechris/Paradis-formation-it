# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 117 (6h) : Gestion des Identités Cloud & Accès à Moindre Privilège (AWS IAM Roles for Service Accounts - IRSA, Azure Workload Identity & GCP Workload Identity Federation)

> [!NOTE]
> **Objectif du jour :** Éliminer le stockage des clés d'accès Cloud statiques (AWS Access Keys, Azure Secrets) dans les applications conteneurisées : intégration fine de l'identité Kubernetes avec l'identité Cloud via IRSA (AWS IAM Roles for Service Accounts), Azure Workload Identity et GCP Workload Identity Federation.
>
> **Compétences visées :** `SEC-01` (A) — IAM Cloud & Workload Identity | `BIT-08` (A) — Intégration Sécurisée Kubernetes & Cloud IAM

---

## 1) Module — Le Problème des Clés d'Accès Statiques & le Concept d'Identity Federation (2h)

### 📖 Narration/Intuition

Pour qu'un pod Kubernetes puisse lire un fichier dans un bucket AWS S3 ou interroger une base de données cloud, les développeurs avaient historiquement tendance à créer des clés d'accès statiques (`AWS_ACCESS_KEY_ID` et `AWS_SECRET_ACCESS_KEY`) et à les injecter dans des Secrets Kubernetes.

Cette pratique est extrêmement dangereuse : si le pod est compromis ou si le secret fuit sur GitHub, l'attaquant récupère des clés permanentes d'accès à l'infrastructure cloud.

La **Fédération d'Identité de Charge de Travail (Workload Identity Federation)** résout ce problème : Kubernetes agit comme un Fournisseur d'Identité OIDC (OpenID Connect). Le cloud provider (AWS/Azure/GCP) fait confiance au jeton ServiceAccount de Kubernetes et émet dynamiquement des jetons temporaires à très courte durée de vie (ex: 15 minutes) sans aucune clé d'accès statique.

### 🔍 Anatomie Technique

**Architecture de Fonctionnement d'AWS IRSA (IAM Roles for Service Accounts) :**

```
Pod Kubernetes (ServiceAccount Annoté)        AWS IAM (Provider OIDC Trust)          Service Cloud (AWS S3)
          │                                                │                                     │
          │── 1. Demande de Jeton OIDC K8s (JWT) ─────────→│                                     │
          │       (Signé par la clé RSA du cluster K8s)    │                                     │
          │                                                │ 2. Valide le JWT K8s via OIDC        │
          │                                                │    et échange contre un rôle IAM   │
          │←── 3. Retourne Credentials Temporaires STS ────┤                                     │
          │       (AccessKey, SecretKey, SessionToken)     │                                     │
          │                                                                                      │
          │── 4. Accès sécurisé au Bucket S3 (Credentials temporaires limités 15 min)───────────→│
```

---

## 2) Module — Implémentation d'AWS IRSA dans Kubernetes (2h)

### 📖 Narration/Intuition

**AWS IRSA** associe directement un **Rôle AWS IAM** à un **ServiceAccount Kubernetes** spécifique dans un namespace donné. Les autres Pods du cluster n'ont aucun accès à ce rôle IAM.

### 🔍 Anatomie Technique

**Manifeste Kubernetes ServiceAccount annoté pour IRSA (`service-account-irsa.yaml`) :**

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: bcc-s3-reader-sa
  namespace: bcc-production
  annotations:
    # Association directe avec l'ARN du Rôle IAM AWS disposant du moindre privilège
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/bcc-production-s3-reader-role

---
# Pod utilisant le ServiceAccount IRSA (Aucune clé AWS dans la configuration !)
apiVersion: v1
kind: Pod
metadata:
  name: bcc-document-processor
  namespace: bcc-production
spec:
  serviceAccountName: bcc-s3-reader-sa
  containers:
    - name: processor
      image: ghcr.io/bcc/doc-processor:v1.0.0
      env:
        - name: BUCKET_NAME
          value: "bcc-bank-archived-documents"
```

**Politique de Confiance IAM AWS (Trust Policy) (`aws_iam_trust_policy.json`) :**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/oidc.eks.eu-west-3.amazonaws.com/id/EXAMPLENODEID"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.eu-west-3.amazonaws.com/id/EXAMPLENODEID:sub": "system:serviceaccount:bcc-production:bcc-s3-reader-sa",
          "oidc.eks.eu-west-3.amazonaws.com/id/EXAMPLENODEID:aud": "sts.amazonaws.com"
        }
      }
    }
  ]
}
```

---

## 3) Module — Azure Workload Identity & GCP Identity Federation (2h)

### 📖 Narration/Intuition

Le principe d'échange d'identité OIDC est standardisé chez tous les grands fournisseurs cloud : **Azure Workload Identity** et **GCP Workload Identity Federation** fonctionnent de manière identique à IRSA.

### 🔍 Anatomie Technique

**Manifeste Azure Workload Identity (`azure-workload-identity.yaml`) :**

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: bcc-azure-kv-sa
  namespace: bcc-production
  annotations:
    azure.workload.identity/client-id: "99999999-8888-7777-6666-555555555555" # Application Client ID Azure
  labels:
    azure.workload.identity/use: "true"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **IRSA** | IAM Roles for Service Accounts — Association fine de rôles AWS IAM à des ServiceAccounts K8s |
| **STS** | Security Token Service — Service AWS émettant des identifiants temporaires de sécurité |
| **Workload Identity** | Fédération d'identité permettant à des applications conteneurisées d'accéder aux API Cloud sans clés statiques |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi la suppression des clés d'accès Cloud statiques (`AWS_ACCESS_KEY_ID`) au profit de Workload Identity (IRSA) renforce-t-elle considérablement la sécurité du Cloud ?

**Corrigé :** Les clés statiques ont une durée de vie indéfinie et sont souvent copiées ou fuitées par inadvertance dans des dépôts Git ou des fichiers de log. Si un attaquant vole une clé statique, il conserve un accès permanent jusqu'à sa révocation manuelle. Avec **Workload Identity (IRSA)**, **aucune clé statique n'existe**. Les identifiants réseau émis par AWS STS sont temporaires (ex: 15 minutes), régénérés automatiquement en mémoire et strictement restreints au ServiceAccount du Pod concerné.

**Exercice 2 :** Dans la politique de confiance (Trust Policy) d'un rôle AWS IRSA, à quoi sert la condition `"system:serviceaccount:bcc-production:bcc-s3-reader-sa"` ?

**Corrigé :** Cette condition applique le principe du **moindre privilège et du cloisonnement strict (Namespace Isolation)**. Elle spécifie que **SEUL** le ServiceAccount nommé `bcc-s3-reader-sa` et s'exécutant exclusivement dans le namespace `bcc-production` a le droit d'assumer ce rôle IAM AWS. Un autre Pod situé dans un autre namespace (ex: `default` ou `dev`) sera immédiatement rejeté par AWS STS s'il tente d'assumer le rôle.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle technologie permet d'associer directement un Rôle IAM Cloud (AWS/Azure/GCP) à un ServiceAccount Kubernetes sans stocker de clés d'accès statiques dans le cluster ?
- A) Workload Identity (ou IRSA)
- B) MS-DOS
- C) FTP
- D) Telnet

**Réponse : A**

**Q2 :** Quel service AWS est sollicité en arrière-plan pour échanger le jeton OIDC d'un Pod Kubernetes contre des identifiants temporaires de sécurité (Access Key / Session Token à durée limitée) ?
- A) AWS STS (Security Token Service)
- B) AWS Glacier
- C) AWS Route 53
- D) AWS EC2

**Réponse : A**

**Q3 :** Pourquoi est-il dangereux de stocker des clés d'accès AWS statiques (`AWS_ACCESS_KEY_ID`) dans un Secret Kubernetes ?
- A) Parce que les clés statiques n'expirent jamais automatiquement et risquent de fuiter ou d'être volées par un conteneur compromis
- B) Parce que cela consomme trop de disque dur
- C) Parce que Kubernetes ne supporte pas les chaînes de caractères
- D) Parce que cela ralentit la fibre optique

**Réponse : A**

**Q4 :** Quel standard d'authentification ouvert est utilisé par Kubernetes pour signer et prouver l'identité des ServiceAccounts auprès d'AWS IAM ou Azure AD ?
- A) OpenID Connect (OIDC) / JWT
- B) Telnet
- C) HTTP non sécurisé
- D) POP3

**Réponse : A**

**Q5 :** Dans Azure, quel composant équivalent à AWS IRSA permet à des pods AKS d'accéder à Azure Key Vault sans utiliser de secret statique ?
- A) Azure Workload Identity
- B) Paint
- C) Gzip
- D) Systemd

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
