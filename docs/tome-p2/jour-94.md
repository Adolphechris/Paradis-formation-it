# TOME P2 — Réseaux & Télécoms — Jour 94 (6h) : Architectures Réseau Serverless & Edge Computing (AWS Lambda, Cloudflare Workers & API Gateways)

> [!NOTE]
> **Objectif du jour :** Concevoir et sécuriser des architectures d'applications cloud modernes sans serveur (Serverless) et distribuées aux frontières du réseau (Edge Computing) : AWS Lambda, Cloudflare Workers, API Gateways, isolation des exécutions (Firecracker MicroVMs) et filtrage WAF à l'échelle mondiale.
>
> **Compétences visées :** `BIT-06` (A) — Architectures Cloud Avancées | `BIT-04` (A) — Edge Networking & Optimisation Latence

---

## 1) Module — Concepts Serverless & Edge Computing (2h)

### 📖 Narration/Intuition

L'architecture traditionnelle impose d'administrer des serveurs virtuels (EC2, VMs) qui tournent 24h/24, même lorsque personne ne les utilise. 

Le **Serverless Computing (FaaS - Function as a Service)** change ce modèle : le code s'exécute uniquement à la demande lors du déclenchement d'un événement (ex: requête HTTP, dépôt de fichier S3). Le cloud provider gère l'allocation automatique des ressources, le scaling instantané de 0 à 10 000 requêtes/seconde, et la facturation au millième de seconde d'exécution.

Le **Edge Computing** pousse ce concept plus loin : au lieu d'exécuter le code dans un datacenter central à Paris ou Kinshasa, le code s'exécute directement sur des centaines de serveurs de bordure (Edge Nodes) situés au plus près des utilisateurs (ex: PoP Cloudflare à Kinshasa/Luanda/Johannesburg), réduisant la latence à moins de 10 millisecondes.

### 🔍 Anatomie Technique

**Comparaison des Architectures d'Exécution :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. ARCHITECTURE MONOLITHIQUE / VM (EC2)                                     │
│    Serveur toujours allumé (24/7) -> Latence dépend de la localisation du DC │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. SERVERLESS FAAS (AWS Lambda)                                             │
│    Exécution à la demande en MicroVM -> Scalabilité automatique de 0 à N   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. EDGE COMPUTING (Cloudflare Workers / AWS Lambda@Edge)                    │
│    Exécution sur 300+ Points de Présence (PoP) mondiaux                     │
│    -> Latence < 10ms + Filtrage WAF/DDoS distribué aux frontières           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Déploiement d'APIs Serverless (AWS Lambda & API Gateway) (2h)

### 📖 Narration/Intuition

Dans une application bancaire Serverless, l'**API Gateway** agit comme le point d'entrée HTTP. Il reçoit la requête du client, valide les jetons JWT, applique le rate-limiting, puis déclenche l'exécution de la fonction **AWS Lambda** appropriée dans un environnement totalement isolé.

### 🔍 Anatomie Technique

**Fonction AWS Lambda Python pour la validation de transaction (`lambda_virement.py`) :**

```python
import json
import os
import time

def lambda_handler(event, context):
    """
    Point d'entrée standard d'une fonction AWS Lambda.
    'event' contient la requête HTTP transmise par l'API Gateway.
    'context' contient les métadonnées d'exécution de la MicroVM.
    """
    try:
        # 1. Extraire le corps de la requête HTTP
        body = json.loads(event.get('body', '{}'))
        
        compte_source = body.get('compte_source')
        compte_dest = body.get('compte_dest')
        montant = body.get('montant')
        
        # Validation stricte des données d'entrée
        if not compte_source or not compte_dest or not montant or montant <= 0:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Paramètres de virement invalides"})
            }
        
        # 2. Logique métier exécutée en Serverless
        tx_id = f"TX-LAMBDA-{int(time.time() * 1000)}"
        
        # 3. Réponse au format attendu par AWS API Gateway
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Strict-Transport-Security": "max-age=63072000; includeSubDomains"
            },
            "body": json.dumps({
                "status": "APPROVED",
                "transaction_id": tx_id,
                "message": f"Virement de {montant} CDF effectué avec succès."
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Erreur interne de traitement Serverless"})
        }
```

---

## 3) Module — Traitement aux Frontières avec Cloudflare Workers & WAF (2h)

### 📖 Narration/Intuition

Avant même que la requête n'atteigne le Cloud AWS ou les Datacenters de la BCC, elle franchit le réseau **Edge Cloudflare**. Un **Cloudflare Worker** (écrit en JavaScript/WebAssembly) s'exécute sur le nœud de bordure le plus proche du client pour bloquer les attaques DDoS, inspecter les jetons de sécurité et mettre en cache les réponses.

### 🔍 Anatomie Technique

**Cloudflare Worker de Filtrage & Inspection Edge (`edge_security.js`) :**

```javascript
// edge_security.js — Worker Cloudflare d'inspection aux frontières

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const clientIP = request.headers.get('cf-connecting-ip')
  const country = request.headers.get('cf-ipcountry')

  // 1. Filtrage géographique au niveau de l'Edge (Geo-blocking)
  const paysBloques = ['XX', 'YY']  // Exemples de pays sous sanctions
  if (paysBloques.includes(country)) {
    return new Response(JSON.stringify({ error: "Accès non autorisé depuis cette zone géographique." }), {
      status: 403,
      headers: { 'content-type': 'application/json' }
    })
  }

  # 2. Inspection des en-têtes de sécurité
  const authHeader = request.headers.get('Authorization')
  if (url.pathname.startsWith('/api/') && (!authHeader || !authHeader.startsWith('Bearer '))) {
    return new Response(JSON.stringify({ error: "Authentification Bearer requise à l'Edge." }), {
      status: 401,
      headers: { 'content-type': 'application/json' }
    })
  }

  // 3. Transmettre la requête au serveur d'origine (Origin Datacenter BCC)
  const response = await fetch(request)

  // 4. Injecter les en-têtes de sécurité sur la réponse de retour
  const newHeaders = new Headers(response.headers)
  newHeaders.set('X-Edge-Processed-By', 'BCC-Cloudflare-PoP')
  newHeaders.set('Content-Security-Policy', "default-src 'self'")

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  })
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **FaaS** | Function as a Service — Modèle d'exécution de code Serverless à la demande |
| **PoP** | Point of Presence — Nœud réseau physique localisé aux frontières du réseau mondial |
| **Cold Start** | Temps de délai initial lors de l'instanciation de la première MicroVM d'une fonction Serverless |
| **MicroVM** | Technologie de machine virtuelle ultra-léger (ex: AWS Firecracker) démarrant en < 5ms |
| **WASM** | WebAssembly — Format d'instructions binaire permettant d'exécuter du code C++/Rust/Go à l'Edge à vitesse native |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Qu'est-ce que le phénomène de **"Cold Start"** dans les architectures Serverless (FaaS) et comment en réduire l'impact pour les APIs bancaires critiques ?

**Corrigé :** Le **Cold Start** (démarrage à froid) survient lorsqu'une fonction Serverless (ex: AWS Lambda) est appelée alors qu'aucune MicroVM n'est actuellement instanciée en mémoire. Le cloud provider doit télécharger le code, créer la MicroVM et démarrer l'environnement d'exécution (ex: runtime Python), ce qui ajoute un délai de 200 ms à 2 secondes sur la première requête. Pour atténuer ce phénomène sur les APIs critiques, on utilise la **Provisioned Concurrency** (concurrence provisionnée) qui maintient un nombre minimum de MicroVMs pré-chauffées prêtes à répondre instantanément.

**Exercice 2 :** Pourquoi l'exécution de code sur l'**Edge Computing** (Cloudflare Workers) offre-t-elle une meilleure protection anti-DDoS que l'hébergement traditionnel ?

**Corrigé :** L'Edge Computing s'appuie sur des réseaux Anycast mondiaux répartis sur des centaines de Points de Présence (PoP). Lorsqu'une attaque par déni de service volumétrique (DDoS) est lancée, le trafic d'attaque n'atteint jamais le Datacenter d'origine de l'entreprise : il est capté et dispersé sur l'ensemble des serveurs de bordure à l'échelle de la planète. L'Edge absorbe l'attaque à la frontière et n'achemine au Datacenter central que le trafic légitime préalablement filtré.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans un modèle FaaS (Function as a Service) comme AWS Lambda, comment la facturation des ressources est-elle calculée ?
- A) À l'année pour une capacité de serveur fixe
- B) Strictement au nombre d'exécutions et à la durée de traitement au millième de seconde
- C) Au nombre de lignes de code source
- D) Selon la taille du disque dur uniquement

**Réponse : B**

**Q2 :** Quelle technologie open-source de MicroVM développée par AWS est utilisée pour isoler de manière ultra-rapide (< 5ms) et sécurisée les exécutions de fonctions Serverless AWS Lambda ?
- A) VirtualBox
- B) Firecracker
- C) VMware ESXi
- D) QEMU complet

**Réponse : B**

**Q3 :** Où s'exécute le code déployé sur un service d'Edge Computing comme Cloudflare Workers ?
- A) Sur un serveur unique situé dans le bureau de l'administrateur
- B) Directement sur les centaines de nœuds de bordure (PoP) mondiaux au plus près de l'utilisateur
- C) Uniquement sur le téléphone de l'utilisateur
- D) Dans la base de données principale

**Réponse : B**

**Q4 :** Quel est le rôle principal d'une API Gateway dans une architecture Serverless ?
- A) Stocker les données de sauvegarde sur bande
- B) Servir de point d'entrée HTTP/HTTPS, gérer l'authentification, le rate-limiting et la redirection des requêtes vers les fonctions Lambda appropriées
- C) Compiler le code source C++
- D) Remplacer le système d'exploitation Linux

**Réponse : B**

**Q5 :** Quel format de bytecode binaire permet d'exécuter des langages comme Rust, C++ ou Go à une vitesse quasi-native directement sur les serveurs Edge Web ?
- A) WebAssembly (WASM)
- B) HTML4
- C) ZIP
- D) PDF

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
