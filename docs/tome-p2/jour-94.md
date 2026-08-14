# TOME P2 — Réseaux & Télécoms — Jour 94 (6h) : Architectures Serverless & Edge Computing (FaaS, API Gateways & WAF)

> [!NOTE]
> **Objectif du jour :** Comprendre les concepts du Serverless (FaaS) et de l'Edge Computing, concevoir des APIs sans serveur et mettre en place du filtrage de sécurité aux frontières du réseau.
>
> **Compétences visées :** `BIT-06` (A) — Architectures Cloud Modernes | `SEC-04` (A) — Filtrage aux Frontières

---

## 1) Module — Concepts Serverless & Edge Computing (2h)

### 📖 Narration/Intuition

L'architecture traditionnelle impose d'administrer des serveurs 24h/24. Le **Serverless (FaaS - Function as a Service)** change ce modèle : le code s'exécute uniquement à la demande lors d'un événement. Le provider gère le scaling automatique de 0 à N requêtes par seconde.

L'**Edge Computing** pousse ce concept plus loin : le code s'exécute sur des serveurs de bordure (Edge Nodes) au plus près des utilisateurs, réduisant la latence et absorbant les attaques DDoS avant qu'elles n'atteignent le Datacenter.

### 🔍 Anatomie Technique

**Comparaison des Architectures d'Exécution :**

```
1. VM / Serveur dédié  →  Toujours allumé, coût fixe, latence variable
2. Serverless FaaS     →  Exécution à la demande, scaling automatique, facturation à l'usage
3. Edge Computing       →  Exécution sur 300+ nœuds de bordure, latence < 10ms, filtrage distribué
```

**Concepts clés :**
- **Cold Start** : Délai initial lors de la première exécution d'une fonction (instanciation de la MicroVM).
- **MicroVM** : Machine virtuelle ultra-légère (ex: Firecracker) démarrant en < 5ms.
- **WAF** : Web Application Firewall — filtre les attaques applicatives aux frontières.

---

## 2) Module — Déploiement d'APIs Serverless (2h)

### 🔍 Anatomie Technique

**Fonction Serverless Python (`fonction_api.py`) :**

```python
def handler(event, context):
    """
    Point d'entrée standard d'une fonction Serverless.
    'event' contient la requête HTTP transmise par l'API Gateway.
    """
    try:
        body = event.get('body', {})
        if isinstance(body, str):
            body = __import__('json').loads(body)
        
        montant = body.get('montant')
        if not montant or montant <= 0:
            return {"statusCode": 400, "body": "Paramètres invalides"}
        
        return {
            "statusCode": 200,
            "body": f"Transaction de {montant} approuvée."
        }
    except Exception as e:
        return {"statusCode": 500, "body": "Erreur de traitement"}
```

**Rôle de l'API Gateway :**
- Point d'entrée HTTP/HTTPS unique
- Validation des jetons JWT
- Rate-limiting (protection anti-DDoS)
- Routage vers la fonction appropriée

---

## 3) Module — Filtrage aux Frontières (WAF & Edge Workers) (2h)

### 🔍 Anatomie Technique

**Règles de filtrage essentielles :**

```
1. Géolocalisation (Geo-blocking) : Bloquer les pays non autorisés
2. Vérification d'authentification : Exiger un token Bearer sur les endpoints sensibles
3. Injection d'en-têtes de sécurité : CSP, HSTS, X-Frame-Options
4. Rate-limiting : Limiter le nombre de requêtes par IP (ex: 100 req/min)
```

**Exemple de politique WAF :**

| Règle | Action | Condition |
|:---|:---|:---|
| Règle 1 | BLOQUER | Pays ∈ {Pays sous sanctions} |
| Règle 2 | BLOQUER | Requête POST sans header Authorization |
| Règle 3 | SURVEILLER | Taux de requêtes > 100/min depuis une IP |

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **FaaS** | Function as a Service — Exécution de code Serverless à la demande |
| **WAF** | Web Application Firewall — Filtre les attaques applicatives (SQLi, XSS) |
| **Cold Start** | Délai d'instanciation initial d'une fonction Serverless |
| **MicroVM** | Machine virtuelle ultra-légère pour isolation Serverless |
| **Rate Limiting** | Limitation du nombre de requêtes pour protéger contre les attaques |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Qu'est-ce que le Cold Start et comment le réduire pour les APIs critiques ?

**Corrigé :** Le Cold Start survient lorsqu'aucune instance de la fonction n'est pré-chauffée. Pour les APIs critiques, on utilise la **Provisioned Concurrency** qui maintient un nombre minimum d'instances prêtes à répondre instantanément.

---

**Exercice 2 :** Pourquoi l'Edge Computing offre-t-il une meilleure protection anti-DDoS ?

**Corrigé :** L'Edge s'appuie sur des réseaux Anycast mondiaux. Le trafic d'attaque est capté et dispersé sur les serveurs de bordure avant d'atteindre le Datacenter central. Seul le trafic légitime est transmis à l'origine.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans un modèle FaaS, comment les ressources sont-elles facturées ?
- A) À l'année pour une capacité fixe
- B) Au nombre d'exécutions et à la durée de traitement
- C) Au nombre de lignes de code
- D) Selon la taille du disque

**Réponse : B**

---

**Q2 :** Qu'est-ce que le Cold Start en Serverless ?
- A) Une panne de climatisation du datacenter
- B) Le délai d'instanciation initial d'une fonction avant sa première exécution
- C) Un type de sauvegarde à froid
- D) Un protocole de chiffrement

**Réponse : B**

---

**Q3 :** Quel est le rôle principal d'un WAF (Web Application Firewall) ?
- A) Remplacer le pare-feu réseau
- B) Filtrer les attaques applicatives (SQLi, XSS, LFI) au niveau HTTP/HTTPS
- C) Gérer les licences logicielles
- D) Compiler le code source

**Réponse : B**

---

**Q4 :** Quelle technique permet de maintenir des fonctions Serverless pré-chauffées pour une réponse instantanée ?
- A) Cold Start
- B) Provisioned Concurrency
- C) Rate Limiting
- D) Geo-blocking

**Réponse : B**

---

**Q5 :** Où s'exécute le code sur une plateforme d'Edge Computing ?
- A) Sur un serveur unique centralisé
- B) Sur des nœuds de bordure mondiaux au plus près des utilisateurs
- C) Uniquement sur le téléphone de l'utilisateur
- D) Dans la base de données principale

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
