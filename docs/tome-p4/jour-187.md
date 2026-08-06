# TOME P4 — Cloud, DevOps & SecOps — Jour 187 (6h) : Serverless Computing & Functions as a Service (AWS Lambda, Event-Driven Architecture & Cold Start Optimization)

> [!NOTE]
> **Objectif du jour :** Comprendre le paradigme **Serverless Computing** et les **FaaS (Functions as a Service)** avec AWS Lambda : exécution sans gestion de serveur, modèle facturation à l'utilisation, architecture **event-driven**, gestion du **Cold Start**, intégration avec les services AWS (API Gateway, S3, DynamoDB Streams, SQS, EventBridge) et sécurisation des fonctions Lambda.
>
> **Compétences visées :** `OPS-06` (A) — Serverless & FaaS AWS Lambda | `BIT-07` (A) — Event-Driven Architecture

---

## 1) Module — AWS Lambda & Modèle d'Exécution Serverless (2h)

### 📖 Narration/Intuition

La BCC doit générer des **relevés bancaires PDF** pour ses clients à la demande. Cette fonctionnalité est utilisée sporadiquement (quelques dizaines de fois par heure) et ne nécessite pas un serveur EC2 tournant 24h/24 à 5€/jour pour traiter quelques requêtes. **AWS Lambda** est la solution : une fonction qui s'exécute uniquement quand elle est appelée, en quelques millisecondes, et qui ne coûte **rien pendant les périodes d'inactivité**.

**Modèle de facturation Lambda :**
- **Durée d'exécution** : Facturé en millisecondes (arrondies à 1ms)
- **Nombre d'invocations** : 1 million d'invocations gratuites/mois, puis $0.20/million
- **Mémoire allouée** : De 128 MB à 10 GB (CPU proportionnel à la RAM)

### 🔍 Anatomie Technique

**Flux d'Exécution AWS Lambda — Génération de Relevé Bancaire :**

```
CLIENT BCC (Portail Web)
    │ GET /api/releve?account=CD89BCC001&month=2026-06
    ▼
API GATEWAY (REST API)
    │ Trigger Lambda : ReleveBancaireFunction
    ▼
┌──────────────────────────────────────────────────────────────┐
│                    AWS LAMBDA                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ COLD START (Première invocation ou après idle)        │ │
│  │   1. Téléchargement du code depuis S3                 │ │
│  │   2. Démarrage du runtime Node.js 20.x               │ │
│  │   3. Initialisation des connexions BDD (RDS Proxy)    │ │
│  │   ⏱️ Durée : 800ms - 3s (selon mémoire configurée)   │ │
│  └────────────────────────────────────────────────────────┘ │
│                          OU                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ WARM START (Instance réutilisée — disponible en RAM)  │ │
│  │   1. Exécution directe du handler                     │ │
│  │   ⏱️ Durée : < 10ms                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  handler() :                                                 │
│   1. Connexion PostgreSQL via RDS Proxy (Pool réutilisé)    │
│   2. SELECT transactions WHERE account_id = ? AND month = ? │
│   3. Génération PDF avec PDFKit                             │
│   4. Upload PDF sur S3 (bcc-relevés/)                       │
│   5. Retour de l'URL S3 Pre-Signed (valide 1h)              │
└──────────────────────────────────────────────────────────────┘
```

**Code Lambda Node.js — Génération de Relevé (`releve-bancaire.js`) :**

```javascript
const { Client } = require('pg');
const PDFDocument = require('pdfkit');
const { S3Client, PutObjectCommand, GetSignedUrlCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Variables globales (Réutilisées entre les invocations warm — Warm Cache)
const s3 = new S3Client({ region: process.env.AWS_REGION });

// Pool de connexion BDD initialisé UNE SEULE FOIS (en dehors du handler)
// → Réutilisé dans les warm starts — évite le overhead de reconnexion
let dbClient;

async function getDbClient() {
    if (!dbClient || dbClient.closed) {
        dbClient = new Client({
            host: process.env.RDS_PROXY_ENDPOINT,  // Via RDS Proxy (Connection Pooling)
            database: 'bcc_core',
            user: 'lambda_reader',
            password: await getSecretFromKMS('bcc/lambda/db-password'),
            ssl: { rejectUnauthorized: true }
        });
        await dbClient.connect();
    }
    return dbClient;
}

// ── Handler Principal Lambda
exports.handler = async (event) => {
    console.log('Event reçu:', JSON.stringify(event, null, 2));

    const { accountId, month } = event.queryStringParameters || {};

    if (!accountId || !month) {
        return { statusCode: 400, body: JSON.stringify({ error: "accountId et month sont requis" }) };
    }

    try {
        const db = await getDbClient();

        // Récupérer les transactions du mois
        const result = await db.query(
            `SELECT t.date, t.description, t.amount, t.balance_after
             FROM transactions t
             WHERE t.account_id = $1
               AND DATE_TRUNC('month', t.date) = $2::date
             ORDER BY t.date ASC`,
            [accountId, `${month}-01`]
        );

        // Générer le PDF
        const pdfBuffer = await generatePDF(accountId, month, result.rows);

        // Uploader sur S3
        const s3Key = `relevés/${accountId}/${month}/releve-${Date.now()}.pdf`;
        await s3.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: s3Key,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
            ServerSideEncryption: 'aws:kms'  // Chiffrement SSE-KMS
        }));

        // Générer une URL Pre-Signed (valide 1 heure)
        const presignedUrl = await getSignedUrl(s3, new GetSignedUrlCommand({
            Bucket: process.env.S3_BUCKET,
            Key: s3Key,
            ExpiresIn: 3600
        }));

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: presignedUrl, expiresIn: '1 heure' })
        };

    } catch (error) {
        console.error('Erreur génération relevé:', error);
        return { statusCode: 500, body: JSON.stringify({ error: "Erreur interne du serveur" }) };
    }
};
```

---

## 2) Module — Event-Driven Architecture avec EventBridge & SQS (2h)

### 📖 Narration/Intuition

L'architecture **Event-Driven** permet aux microservices de communiquer de manière **asynchrone** via des événements. Quand un virement BCC est validé, le Transaction Service publie l'événement `VIREMENT_VALIDÉ` sur **EventBridge**. Plusieurs consommateurs réagissent indépendamment : Lambda envoie une notification SMS, Lambda met à jour les soldes dans le Reporting Service, Lambda génère une écriture comptable.

### 🔍 Anatomie Technique

**Architecture Event-Driven BCC avec EventBridge :**

```yaml
# Règle EventBridge : Router les événements de virements vers les Lambda consommatrices
# (fichier Terraform : eventbridge.tf)

resource "aws_cloudwatch_event_rule" "bcc_virement_valide" {
  name        = "bcc-virement-valide-rule"
  description = "Route les événements VIREMENT_VALIDÉ vers les consommateurs"

  event_pattern = jsonencode({
    source      = ["bcc.transaction-service"]
    detail-type = ["VIREMENT_VALIDÉ"]
    detail = {
      status  = ["COMPLETED"]
      amount  = [{ numeric = [">", 0] }]
    }
  })
}

# Cible 1 : Lambda de notification SMS/Email
resource "aws_cloudwatch_event_target" "notification_lambda" {
  rule      = aws_cloudwatch_event_rule.bcc_virement_valide.name
  target_id = "NotificationLambda"
  arn       = aws_lambda_function.notification_service.arn
}

# Cible 2 : File SQS pour le Reporting Service (Avec DLQ — Dead Letter Queue)
resource "aws_cloudwatch_event_target" "reporting_sqs" {
  rule      = aws_cloudwatch_event_rule.bcc_virement_valide.name
  target_id = "ReportingQueue"
  arn       = aws_sqs_queue.reporting_queue.arn
}
```

---

## 3) Module — Optimisation des Cold Starts & Sécurité Lambda (2h)

### 📖 Narration/Intuition

Le **Cold Start** Lambda est le délai de démarrage lors de la première invocation d'une fonction. Pour une API bancaire où la latence est critique, un Cold Start de 3 secondes est inacceptable. Plusieurs stratégies permettent de le minimiser drastiquement.

### 🛠️ Atelier Pratique

**Stratégies d'Optimisation du Cold Start Lambda :**

```javascript
// ═══════════════════════════════════════════════════
// OPTIMISATION 1 : Utiliser des Provisioned Concurrency
// → K instances Lambda pré-initialisées et toujours "chaudes"
// (Configurable dans la console AWS ou via Terraform)
// Coût : Facturation même en idle, mais Cold Start = 0ms

// ═══════════════════════════════════════════════════
// OPTIMISATION 2 : Minimiser la taille du package de déploiement
// Taille cible : < 5 MB (vs Max 250 MB)
// Technique : Bundling avec esbuild (Tree-shaking des dépendances non utilisées)

// package.json
{
  "scripts": {
    "build": "esbuild src/handler.js --bundle --minify --platform=node --target=node20 --outfile=dist/handler.js"
  }
}
// Résultat : Bundle de 450 KB au lieu de 45 MB (node_modules complet)
// Impact Cold Start : -40 à -60%

// ═══════════════════════════════════════════════════
// OPTIMISATION 3 : Allouer suffisamment de mémoire RAM
// + de RAM → + de vCPU → Initialisation plus rapide
// Optimal pour Node.js : 1024 MB (équilibre coût/performance)

// ═══════════════════════════════════════════════════
// OPTIMISATION 4 : Utiliser Lambda SnapStart (Java uniquement)
// Snapshot de l'état initialisé → Restauration instantanée

// ═══════════════════════════════════════════════════
// SÉCURITÉ LAMBDA
// ═══════════════════════════════════════════════════

// 1. IAM Role avec permissions minimales (Least Privilege)
// La Lambda ne peut accéder QU'à son bucket S3 et QU'aux secrets KMS autorisés

// 2. Chiffrement des variables d'environnement avec AWS KMS
// process.env.DB_PASSWORD est déchiffré au démarrage uniquement

// 3. Lambda dans un VPC privé (Pour accéder à RDS)
// Security Group Lambda : Sortie autorisée uniquement vers RDS Proxy (Port 5432)

// 4. Audit des invocations Lambda via CloudTrail
// Chaque invocation est journalisée (Who, When, What parameters)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **FaaS** | Function as a Service — Modèle serverless où le code s'exécute en réponse à des événements |
| **Cold Start** | Délai de démarrage d'une nouvelle instance Lambda (chargement du runtime + code) |
| **Warm Start** | Réexécution d'une instance Lambda déjà initialisée en mémoire — Latence quasi-nulle |
| **DLQ** | Dead Letter Queue — File de messages pour les événements qui ont échoué après les retries |
| **SQS** | Simple Queue Service — Service de file de messages managé AWS |
| **EventBridge** | Service AWS d'event bus managé pour l'architecture event-driven |
| **Pre-Signed URL** | URL temporaire signée cryptographiquement permettant un accès limité à un objet S3 |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer la différence entre un **Cold Start** et un **Warm Start** AWS Lambda, et quels sont les deux facteurs qui ont le plus d'impact sur la durée du Cold Start ?

**Corrigé :** Un **Cold Start** se produit lors de la première invocation d'une fonction Lambda (ou après une longue période d'inactivité) : AWS doit allouer un nouveau micro-container, télécharger le code de déploiement depuis S3, démarrer le runtime (Node.js, Python...), et exécuter le code d'initialisation global (connexions BDD, imports). Durée typique : 500ms à 3s selon le runtime et la taille du package. Un **Warm Start** se produit quand une invocation réutilise un container déjà initialisé resté en mémoire : seul le handler est exécuté. Latence : 1-10ms. Les deux facteurs d'impact les plus importants : (1) **La taille du package de déploiement** (un package de 450 KB démarre 5x plus vite qu'un de 45 MB), (2) **La quantité de RAM allouée** (plus de RAM = plus de vCPU = initialisation plus rapide du runtime et du code).

**Exercice 2 :** Pourquoi l'utilisation d'une **Dead Letter Queue (DLQ)** est-elle indispensable pour les architectures event-driven avec Lambda consommant des événements SQS ?

**Corrigé :** Dans une architecture event-driven, si une Lambda consommatrice échoue à traiter un message SQS (ex: la BDD est temporairement indisponible, erreur de parsing du JSON malformé), SQS réessaie d'envoyer ce message plusieurs fois (configurable via `maxReceiveCount`). Sans DLQ, après le nombre maximum de retries, le message est **silencieusement supprimé** — l'événement est perdu sans aucune trace. Une **DLQ** capture ces messages "empoisonnés" (poison messages) après épuisement des retries, permettant : (1) l'inspection manuelle et l'analyse de la cause d'échec, (2) le rejeu des messages après correction du bug, (3) l'alerting Prometheus/CloudWatch sur les messages en DLQ. Pour un système bancaire, perdre silencieusement un événement de virement serait catastrophique — la DLQ est une garantie de traitement "at-least-once".

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le principal avantage économique du modèle **Serverless/FaaS** par rapport à une instance EC2 pour une fonctionnalité bancaire à usage sporadique (ex: génération de relevés) ?
- A) Lambda est facturé uniquement à l'exécution réelle (en millisecondes), sans coût pendant les périodes d'inactivité — contrairement à une EC2 facturée 24h/24 même à l'arrêt
- B) Lambda est toujours plus rapide qu'EC2
- C) Lambda peut exécuter n'importe quel système d'exploitation
- D) Lambda ne nécessite aucune configuration de sécurité

**Réponse : A**

**Q2 :** Dans une architecture **Event-Driven** avec EventBridge, quel est l'avantage principal du **découplage** entre le Transaction Service (producteur) et les consommateurs (Lambda Notification, Lambda Reporting) ?
- A) Le Transaction Service publie l'événement sur EventBridge sans connaître ni dépendre des consommateurs — si le Lambda Reporting tombe en panne, le Transaction Service continue de fonctionner normalement
- B) Tous les services s'exécutent dans le même processus
- C) EventBridge remplace la base de données
- D) Les consommateurs sont facturés à la place du producteur

**Réponse : A**

**Q3 :** Pourquoi est-il crucial d'initialiser les connexions de base de données **en dehors du handler Lambda** (au niveau global du module) ?
- A) Dans les Warm Starts, le contexte global est réutilisé — la connexion BDD établie lors du Cold Start est réutilisée sans nouvelle négociation TCP/TLS, réduisant la latence des invocations chaudes de 200-500ms à < 5ms
- B) Pour que la connexion soit visible depuis d'autres Lambdas
- C) Pour réduire le coût de stockage S3
- D) Car le handler ne peut pas accéder à Internet

**Réponse : A**

**Q4 :** Qu'est-ce qu'une **URL Pre-Signed S3** et dans quel cas d'usage bancaire est-elle particulièrement adaptée ?
- A) Une URL temporaire et signée cryptographiquement par AWS permettant à un utilisateur non authentifié d'accéder à un objet S3 privé pendant une durée limitée (ex: 1h). Cas d'usage BCC : Permettre au client de télécharger son relevé PDF sans exposer le bucket S3 publiquement
- B) Une URL permanente d'accès public à un fichier S3
- C) Un lien de partage vers un autre compte AWS
- D) Un endpoint d'API Gateway sécurisé

**Réponse : A**

**Q5 :** Quelle stratégie d'optimisation des Cold Starts Lambda consiste à maintenir un certain nombre d'instances pré-initialisées et toujours chaudes, au coût d'une facturation en idle ?
- A) Provisioned Concurrency
- B) Lambda SnapStart (Java uniquement)
- C) Reserved Concurrency
- D) Lambda Layers

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
