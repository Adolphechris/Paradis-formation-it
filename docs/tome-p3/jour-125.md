# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 125 (6h) : Sécurité du Stockage Objet & Data Lakes Cloud (AWS S3 Security, MinIO & Encryption-in-Transit)

> [!NOTE]
> **Objectif du jour :** Sécuriser les infrastructures de stockage Objet (Object Storage) et les Data Lakes cloud (AWS S3, MinIO On-Premises) : politiques d'accès IAM & Bucket Policies, chiffrement SSE-KMS / SSE-C, immuabilité S3 Object Lock (WORM), audits de politiques avec AWS IAM Access Analyzer et détection des fuites de données.
>
> **Compétences visées :** `SEC-03` (A) — Sécurité du Stockage Cloud & MinIO | `BIT-06` (A) — Architectures Stockage Objet S3

---

## 1) Module — Modèle de Sécurité Stockage Objet (S3 & MinIO) (2h)

### 📖 Narration/Intuition

Le stockage Objet (AWS S3, MinIO) est le réceptacle de toutes les données massives de l'entreprise : sauvegardes immuables, relevés bancaires, données d’entraînement IA et journaux d'audit.

Par défaut, la sécurité du stockage Objet repose sur deux mécanismes de filtrage complémentaires :
1. **IAM Policies** : Définissent quels utilisateurs ou rôles ont le droit d'effectuer des actions (ex: `s3:GetObject`).
2. **Bucket Policies** : Définissent des règles de filtrage directement rattachées au conteneur (Bucket), permettant par exemple de restreindre l'accès à certaines adresses IP ou d'imposer le chiffrement HTTPS TLS.

### 🔍 Anatomie Technique

**Architecture de Sécurité d'un Bucket S3 / MinIO :**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. LAYER ACCÈS : IAM Policies + Bucket Policies             │
│    - Block Public Access : Enforced (Interdiction totale)   │
│    - Restriction IP source : Datacenter Kinshasa            │
│    - Exigence de transport chiffré : TLS 1.3                │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────┐┌──────────────────────────────┐
│ 2. LAYER IMMUABILITÉ (WORM) ││ 3. LAYER CHIFFREMENT (SSE)   │
│ - S3 Object Lock (Compliance││ - Server-Side Encryption     │
│   Mode 90 jours)            ││   SSE-KMS avec clé dédiée    │
└─────────────────────────────┘└──────────────────────────────┘
```

---

## 2) Module — Bucket Policies Sécurisées & S3 Object Lock (2h)

### 📖 Narration/Intuition

Pour empêcher la suppression ou la modification des sauvegardes bancaires par un ransomware ou un administrateur malveillant, on active **S3 Object Lock** en mode **Compliance**. En mode Compliance, personne (pas même le compte root AWS) ne peut supprimer les objets stockés pendant la durée de rétention programmée.

### 🔍 Anatomie Technique

**Bucket Policy de Sécurité AWS S3 / MinIO (`s3-secure-bucket-policy.json`) :**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyUnEncryptedTransport",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::bcc-bank-backups",
        "arn:aws:s3:::bcc-bank-backups/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    },
    {
      "Sid": "EnforceKMSChiffrement",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::bcc-bank-backups/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "aws:kms"
        }
      }
    }
  ]
}
```

---

## 3) Module — Audit de Sécurité & MinIO Client (mc) (2h)

### 📖 Narration/Intuition

Dans une infrastructure privée ou Cloud Hybride, la BCC utilise **MinIO**, un serveur de stockage Objet Open-Source compatible à 100% avec l'API AWS S3. L'outil en ligne de commande **`mc` (MinIO Client)** permet de gérer et d'auditer les règles de sécurité.

### 🔍 Anatomie Technique

**Commandes d'administration et d'audit MinIO Client (`mc`) :**

```bash
# 1. Configurer un alias de connexion MinIO sécurisé
mc alias set bcc-minio https://s3.bcc.internal:9000 minioadmin BCC_MinIO_Secret_Key_2024!

# 2. Vérifier que l'accès public est strictement désactivé
mc anonymous get bcc-minio/bcc-bank-backups
# Résultat attendu : AccessDenied

# 3. Activer le verrouillage immuable (Object Lock) sur un bucket
mc lock retention set bcc-minio/bcc-bank-backups compliance 90d

# 4. Activer le chiffrement automatique au repos (SSE-KMS)
mc encrypt set kms bcc-minio-key bcc-minio/bcc-bank-backups

# 5. Auditer les événements et accès au bucket en temps réel
mc admin trace bcc-minio --path bcc-bank-backups
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **S3** | Simple Storage Service — Standard de stockage objet cloud pionnier développé par AWS |
| **SSE** | Server-Side Encryption — Chiffrement automatique des objets exécuté côté serveur |
| **WORM** | Write Once, Read Many — Stockage immuable empêchant toute modification/suppression |
| **MinIO** | Serveur de stockage objet open-source haute performance compatible API S3 |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence de niveau de protection entre le mode **Governance** et le mode **Compliance** de la fonctionnalité **S3 Object Lock** ?

**Corrigé :** En mode **Governance**, les objets stockés sont protégés contre la suppression ou la modification par les utilisateurs normaux. Cependant, les utilisateurs disposant de permissions IAM spécifiques (`s3:BypassGovernanceRetention`) peuvent passer outre le verrou et supprimer les objets si nécessaire. En mode **Compliance**, **ABSOLUMENT PERSONNE** (pas même l'utilisateur Root AWS ou l'administrateur système) ne peut supprimer ni modifier les objets pendant la durée de rétention définie. C'est le niveau d'immuabilité maximal exigé par les réglementations bancaires.

**Exercice 2 :** Dans une Bucket Policy S3, que réalise la condition `"aws:SecureTransport": "false"` associée à un effet `"Deny"` ?

**Corrigé :** Cette condition applique un **refus strict d'accès (Deny)** à toute requête HTTP reçue en clair (non chiffrée). Seules les connexions chiffrées en HTTPS (`aws:SecureTransport: true`) sont autorisées à interagir avec le bucket. Cela garantit le **chiffrement en transit (Encryption-in-Transit)** de toutes les données envoyées ou lues dans le stockage Objet.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel mode de verrouillage S3 Object Lock garantit qu'absolument aucun utilisateur (pas même le compte root) ne peut supprimer ou modifier un objet pendant sa période de rétention ?
- A) Compliance Mode
- B) Governance Mode
- C) Simple Mode
- D) Public Mode

**Réponse : A**

**Q2 :** Quel serveur de stockage Objet Open-Source hautement disponible compatible avec l'API AWS S3 permet de déployer du stockage Objet privé sur site (On-Premises) ?
- A) MinIO
- B) MS Paint
- C) Disquette
- D) Notepad

**Réponse : A**

**Q3 :** Que signifie l'abréviation SSE (Server-Side Encryption) pour un stockage Objet S3 ?
- A) Que les données envoyées au bucket sont automatiquement chiffrées par le serveur avant d'être écrites sur le disque
- B) Que le serveur s'éteint
- C) Que les fichiers sont publics
- D) Que le disque dur est effacé

**Réponse : A**

**Q4 :** Quel est le rôle de l'outil CLI `mc` (MinIO Client) ?
- A) Administrer, configurer et auditer les serveurs de stockage Objet compatibles S3 (AWS S3, MinIO)
- B) Écrire des documents Word
- C) Formater des clés USB
- D) Jouer à des jeux vidéo

**Réponse : A**

**Q5 :** Dans une politique de Bucket S3, quelle option d'administration fondamentale ("Block Public Access") doit être activée pour prévenir les fuites de données accidentelles ?
- A) Enforce Block Public Access (Blocage total des accès publics)
- B) Allow All Public
- C) Open Storage
- D) Disable Firewall

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
