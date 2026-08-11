# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 561 (6h) : API Design Excellence : REST Richardson Maturity Model, GraphQL Federation & AsyncAPI

> [!NOTE]
> **Objectifs pédagogiques :**
> - Atteindre le Niveau 3 du **Richardson Maturity Model (HATEOAS)** pour concevoir des APIs REST réellement hypermédia et auto-découvrables
> - Architecturer une **GraphQL Federation (Apollo Federation v2)** pour unifier des graphes de données distribués multi-équipes sans monolithe GraphQL
> - Spécifier et documenter les APIs événementielles orientées messages avec **AsyncAPI v3.0** (Kafka, WebSockets, RabbitMQ)
> - Appliquer le **Contract-First API Design** et l'API Governance automatisée (Spectral Linter)
>
> **Compétences visées :** `ARCH-01` (A), `DEV-01` (A) — API Design Excellence, GraphQL Federation, AsyncAPI

---

## Module 1 — REST Richardson Maturity Model & HATEOAS (2h)

### 📖 Intuition & Narration

La majorité des APIs présentées comme "RESTful" ne sont en réalité que des APIs RPC déguisées qui utilisent des URLs HTTP. L'inventeur du style d'architecture REST, Roy Fielding, a insisté sur un point fondamental : **une API qui n'utilise pas HATEOAS (Hypermedia As The Engine Of Application State) n'est pas une API REST**.

Le **Richardson Maturity Model** classe les APIs web en 4 niveaux de maturité progressive :

```
RICHARDSON MATURITY MODEL (NIVEAUX 0 À 3)

  NIVEAU 3 : HATEOAS (Hypermedia Controls)
  ├── La réponse contient les liens (HAL/JSON-LD) des actions suivantes possibles.
  │   Ex: Un compte bancaire affiche le lien vers /withdraw si le solde est positif.

  NIVEAU 2 : Verbes HTTP & Codes de Statut (GET, POST, PUT, DELETE + 200, 201, 404, 500)
  ├── Utilisation correcte des verbes HTTP pour chaque opération.

  NIVEAU 1 : Ressources (URLs orientées noms : /users, /orders/42)
  ├── Chaque concept métier a son URI propre (au lieu d'une URL unique /api).

  NIVEAU 0 : Swamp of POX (Plain Old XML / RPC sur HTTP)
  └── Une seule URL (ex: /service.php), verbe POST uniquement, action dans le body.
```

### 🔍 Exemple HATEOAS (Format HAL - Hypertext Application Language)

```json
{
  "order_id": "ORD-2026-8812",
  "status": "PAYMENT_CONFIRMED",
  "total_amount_eur": 129.90,
  "_links": {
    "self": { "href": "/api/v1/orders/ORD-2026-8812" },
    "cancel": { "href": "/api/v1/orders/ORD-2026-8812/cancel", "method": "POST" },
    "track_shipment": { "href": "/api/v1/shipments/SHP-9901" }
  }
}
```

---

## Module 2 — GraphQL Federation & AsyncAPI (2h)

### 🔍 GraphQL Federation v2 (Apollo Federation)

**GraphQL Federation** permet de combiner plusieurs schémas GraphQL indépendants (gérés par des équipes différentes) en un **Supergraph unique** accessible via un Gateway, sans créer de monolithe de code.

```
GRAPHQL FEDERATION ARCHITECTURE

                         ┌─────────────────────────────────┐
                         │ GRAPHQL ROUTER / GATEWAY        │
                         │ (Supergraph Schema Unique)      │
                         └────────────────┬────────────────┘
                                          │
       ┌──────────────────────────────────┼──────────────────────────────────┐
       │                                  │                                  │
┌──────▼──────────────┐        ┌──────────▼───────────┐        ┌─────────────▼──────┐
│ Subgraph Users      │        │ Subgraph Orders      │        │ Subgraph Payments  │
│ (Team User)         │        │ (Team Checkout)      │        │ (Team Finance)     │
└─────────────────────┘        └──────────────────────┘        └────────────────────┘
```

### 🔍 AsyncAPI v3.0 — Spécification d'APIs Événementielles

De même qu'OpenAPI (Swagger) documente les APIs HTTP synchrone, **AsyncAPI** est le standard mondial pour documenter les APIs asynchrones orientées événements (Kafka topics, WebSockets, MQTT).

```yaml
# asyncapi.yaml — Spécification AsyncAPI v3.0
asyncapi: '3.0.0'
info:
  title: Order Events API (Kafka)
  version: '1.0.0'
  description: "Événements de commande publiés sur le cluster Apache Kafka PARADIS"

channels:
  orderCreated:
    address: 'paradis.orders.created.v1'
    messages:
      orderCreatedMessage:
        $ref: '#/components/messages/OrderCreated'

components:
  messages:
    OrderCreated:
      name: OrderCreated
      title: Événement Commande Créée
      contentType: application/json
      payload:
        type: object
        properties:
          order_id:
            type: string
          user_id:
            type: string
          total_cents:
            type: integer
```

---

## Module 3 — Python HATEOAS API Engine & Spectral Linter (1h30)

### 🛠️ Script Python : HATEOAS REST Engine (FastAPI Style)

```python
#!/usr/bin/env python3
"""
PARADIS — HATEOAS Level 3 REST API Engine
Génère des réponses API REST de niveau 3 du Richardson Maturity Model (format HAL).
"""
import json
from dataclasses import dataclass, asdict
from typing import Dict, Any, List

@dataclass
class HALLink:
    href: str
    method: str = "GET"
    title: str = ""

class HATEOASOrderResponse:
    def __init__(self, order_id: str, status: str, amount_eur: float):
        self.order_id = order_id
        self.status = status
        self.amount_eur = amount_eur
        self._links: Dict[str, Dict[str, str]] = {}

        # Génération dynamique des liens hypermédias selon l'état (State Machine)
        self._build_links()

    def _build_links(self):
        base_uri = f"/api/v1/orders/{self.order_id}"
        self._links["self"] = {"href": base_uri, "method": "GET"}

        if self.status == "CREATED":
            self._links["pay"] = {"href": f"{base_uri}/pay", "method": "POST", "title": "Payer la commande"}
            self._links["cancel"] = {"href": f"{base_uri}/cancel", "method": "POST", "title": "Annuler la commande"}
        elif self.status == "PAID":
            self._links["invoice"] = {"href": f"{base_uri}/invoice", "method": "GET", "title": "Télécharger la facture"}
            self._links["ship"] = {"href": f"{base_uri}/ship", "method": "POST", "title": "Expédier la commande"}
        elif self.status == "SHIPPED":
            self._links["tracking"] = {"href": f"/api/v1/tracking/{self.order_id}", "method": "GET", "title": "Suivi colis"}

    def to_json(self) -> str:
        data = {
          "order_id": self.order_id,
          "status": self.status,
          "amount_eur": self.amount_eur,
          "_links": self._links
        }
        return json.dumps(data, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    print("=== DÉMONSTRATION API REST HATEOAS (RICHARDSON NIVEAU 3) ===\n")

    # État 1 : Commande Créée -> Liens disponibles : pay, cancel
    order_created = HATEOASOrderResponse("ORD-9901", "CREATED", 89.90)
    print("  [ÉTAT 1 : CREATED]")
    print(order_created.to_json())
    print("\n" + "─"*50 + "\n")

    # État 2 : Commande Payée -> Liens disponibles : invoice, ship
    order_paid = HATEOASOrderResponse("ORD-9901", "PAID", 89.90)
    print("  [ÉTAT 2 : PAID]")
    print(order_paid.to_json())
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **HATEOAS** | Hypermedia As The Engine Of Application State — Principe REST de niveau 3 intégrant les contrôles hypermédias |
| **HAL** | Hypertext Application Language — Convention standardisée JSON/XML d'expression des liens dans les APIs REST |
| **AsyncAPI** | Standard open-source de spécification et documentation des APIs asynchrones et événementielles |
| **GraphQL Federation** | Architecture unifiant plusieurs subgraphs GraphQL indépendants sous un Supergraph centralisé |
| **Spectral** | Linter open-source d'APIs permettant d'appliquer la gouvernance de style OpenAPI / AsyncAPI en CI/CD |

---

## Exercices Pratiques

### Exercice 1 — Évaluation du Richardson Maturity Model

Pour chacune des APIs web suivantes, déterminez son niveau dans le Richardson Maturity Model (Niveau 0 à 3) :

1. `POST /api/service` avec body `{"action": "getUser", "id": 42}` renvoyant HTTP 200.
2. `GET /users/42` renvoyant HTTP 200 avec le JSON utilisateur sans aucun champ `_links`.
3. `POST /api/v1/orders/42/cancel` renvoyant HTTP 200 avec un objet `_links` contenant la réinitialisation de commande.

**Corrigé guidé :**
1. **Niveau 0 (Swamp of POX / RPC)** — Une seule URL générique, verbe POST unique pour des lectures, action spécifiée dans le body.
2. **Niveau 2 (HTTP Verbs & Resources)** — Utilise des URIs de ressources (`/users/42`) et le verbe HTTP `GET`, mais n'a pas de liens HATEOAS (pas de niveau 3).
3. **Niveau 3 (HATEOAS)** — Utilise des URIs de ressources, des verbes HTTP appropriés et renvoie les contrôles hypermédias dynamiques (`_links`).

---

## Banque QCM — 5 Questions

**Q1.** Quel niveau du **Richardson Maturity Model** définit une API comme véritablement **HATEOAS** ?

- A) Niveau 0
- B) Niveau 1
- C) Niveau 2
- D) Niveau 3 ✅

**Q2.** Quel est le rôle principal de **GraphQL Federation** (Apollo Federation) ?

- A) Remplacer les bases de données relationnelles par du JSON.
- B) Combiner plusieurs subgraphs GraphQL indépendants gérés par des équipes différentes en un Supergraph unifié sans créer un monolithique de code central. ✅
- C) Chiffrer les requêtes HTTP.
- D) Générer des fichiers PDF.

**Q3.** Le standard **AsyncAPI** a été conçu spécifiquement pour :

- A) Documenter les sites web statiques HTML.
- B) Spécifier, documenter et valider les APIs asynchrones orientées messages (Kafka, WebSockets, RabbitMQ, MQTT). ✅
- C) Configurer les routeurs Wi-Fi.
- D) Accélérer la vitesse d'exécution de Python.

**Q4.** Dans le format HAL (Hypertext Application Language), sous quel objet spécial sont regroupés les liens d'action futurs ?

- A) `_metadata`
- B) `_links` ✅
- C) `_actions`
- D) `_attributes`

**Q5.** Quel outil open-source est utilisé pour exécuter un **linting automatique de gouvernance d'API** (style guide OpenAPI/AsyncAPI) dans les pipelines CI/CD ?

- A) Spectral ✅
- B) Wireshark
- C) Docker
- D) Kubernetes

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
