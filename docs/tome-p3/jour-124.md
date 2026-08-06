# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 124 (6h) : Sécurité des APIs Modernes & Architecture Mesh (GraphQL, gRPC, mTLS & OWASP API Top 10)

> [!NOTE]
> **Objectif du jour :** Sécuriser les architectures d'APIs modernes à haute performance (gRPC / HTTP/2, GraphQL) : authentification gRPC par certificats mTLS et tokens OAuth2, protection des endpoints GraphQL contre les attaques de déni de service par requêtes récursives (Query Depth Limiting), et audit selon l'OWASP API Security Top 10 (2023).
>
> **Compétences visées :** `BIT-06` (A) — Architectures APIs gRPC & GraphQL | `SEC-05` (A) — Sécurité & Audit des APIs Modernes

---

## 1) Module — Sécurité des APIs gRPC (HTTP/2, Protobuf & mTLS) (2h)

### 📖 Narration/Intuition

Les microservices modernes délaissent le format REST/JSON (lourd et verbeux) au profit de **gRPC**, un framework d'appel de procédure distante à ultra-haute performance développé par Google. gRPC utilise **Protocol Buffers (Protobuf)** pour sérialiser les données en binaire et s'appuie sur le protocole **HTTP/2** pour le multiplexage des requêtes.

Sur le plan de la sécurité, gRPC exige une authentification stricte : le transport doit être chiffré en **mTLS (Mutual TLS)** et chaque appel gRPC doit transmettre des métadonnées de sécurité (Metadata Interceptors / Bearer Tokens).

### 🔍 Anatomie Technique

**Définition d'un service gRPC Protobuf (`virement.proto`) :**

```protobuf
syntax = "proto3";

package bcc.virement;

option go_package = "bcc/virement/v1;virementv1";

// Définition du Service gRPC bancaire
service VirementService {
  rpc EffectuerVirement (VirementRequest) returns (VirementResponse);
}

message VirementRequest {
  string compte_source = 1;
  string compte_destination = 2;
  double montant = 3;
  string devise = 4;
}

message VirementResponse {
  string transaction_id = 1;
  string statut = 2;
  int64 timestamp = 3;
}
```

**Middleware Python gRPC Interceptor d'Authentification JWT (`grpc_server.py`) :**

```python
#!/usr/bin/env python3
"""
grpc_server.py — Serveur gRPC sécurisé avec Intercepteur d'Authentification Token
"""
import grpc
from concurrent import futures
import time

class AuthInterceptor(grpc.ServerInterceptor):
    """Intercepteur gRPC qui vérifie la présence d'un jeton Bearer valide dans les métadonnées"""
    def __init__(self, key):
        self._key = key

    def intercept_service(self, continuation, handler_call_details):
        # Extraire les métadonnées gRPC (en-têtes HTTP/2)
        metadata = dict(handler_call_details.invocation_metadata)
        auth_header = metadata.get('authorization', '')

        if not auth_header.startswith("Bearer BCC_SECRET_TOKEN_2024"):
            # Interrompre l'appel avec le code de statut gRPC UNAUTHENTICATED
            def deny(request, context):
                context.abort(grpc.StatusCode.UNAUTHENTICATED, "Jeton gRPC invalide ou absent")
            return grpc.unary_unary_rpc_method_handler(deny)

        return continuation(handler_call_details)

def serve():
    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=10),
        interceptors=(AuthInterceptor("BCC_SECRET_KEY"),)
    )
    # Écoute sécurisée sur le port 50051
    server.add_insecure_port('[::]:50051')
    server.start()
    print("[+] Serveur gRPC bancaire démarré avec Intercepteur de sécurité.")
    server.wait_for_termination()

if __name__ == "__main__":
    serve()
```

---

## 2) Module — Sécurité des APIs GraphQL & Protection contre le DoS (2h)

### 📖 Narration/Intuition

**GraphQL** permet aux clients de demander exactement les champs de données dont ils ont besoin via une requête unique. Cependant, cette flexibilité crée une vulnérabilité critique : un attaquant peut soumettre une **requête récursive profondément imbriquée** (Query Depth Attack) qui force le serveur à exécuter des millions de jointures en boucle, provoquant le plantage immédiat du serveur par déni de service (DoS).

### 🔍 Anatomie Technique

**Attaque et Protection de Profondeur GraphQL (Query Depth Limiting) :**

```graphql
# ❌ REQUÊTE RÉCURSIVE MALVEILLANTE (Query Depth Attack)
query MaliciousDeepQuery {
  client(id: "101") {
    comptes {
      proprietaire {
        comptes {
          proprietaire {
            comptes {
              solde # Profondeur infinie -> Crash du serveur !
            }
          }
        }
      }
    }
  }
}
```

**Protection avec GraphQL Depth Limiter en Python (Strawberry/GraphQL) :**

```python
from graphql import parse, validate
from graphql.validation import DepthLimitRule # Limiteur de profondeur

# Limiter la profondeur maximale autorisée des requêtes GraphQL à 3 niveaux
validation_rules = [DepthLimitRule(max_depth=3)]

# Toute requête dépassant la profondeur de 3 est immédiatement rejetée avec HTTP 400 Bad Request
```

---

## 3) Module — OWASP API Security Top 10 (2h)

### 📖 Narration/Intuition

L'**OWASP API Security Top 10 (2023)** recense les vulnérabilités les plus courantes et les plus dévastatrices sur les APIs modernes.

### 🔍 Anatomie Technique

**Les Failles Majeures de l'OWASP API Security Top 10 (2023) :**

```
API1:2023 - Broken Object Level Authorization (BOLA / IDOR) :
  L'API ne vérifie pas si l'utilisateur connecté possède les droits sur l'ID de l'objet demandé.
  (Ex: GET /api/v1/account/1002 alors que l'utilisateur possède le compte 1001).

API2:2023 - Broken Authentication :
  Authentification faible (tokens prévisibles, absence de validation de signature JWT).

API3:2023 - Broken Object Property Level Authorization (Mass Assignment) :
  L'utilisateur modifie des propriétés internes non autorisées (ex: injecter "is_admin": true).

API4:2023 - Unrestricted Resource Consumption :
  Absence de Rate Limiting ou de restriction de taille de requête (DoS).
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **gRPC** | gRPC Remote Procedure Calls — Framework RPC ultra-rapide basé sur HTTP/2 et Protobuf |
| **Protobuf** | Protocol Buffers — Format binaire de sérialisation de données structurées développé par Google |
| **BOLA** | Broken Object Level Authorization — Faille d'autorisation sur les objets de l'API (OWASP API1) |
| **Query Depth** | Profondeur d'imbrication d'une requête GraphQL |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence majeure d'exécution et de performance entre une API **REST (JSON sur HTTP/1.1)** et une API **gRPC (Protobuf sur HTTP/2)** ?

**Corrigé :** Une API **REST** utilise le format texte **JSON** (verbeux et nécessitant un parsing coûteux en CPU) et s'appuie généralement sur HTTP/1.1 (ouverture d'une connexion TCP par requête). Une API **gRPC** sérialise les données en binaire avec **Protocol Buffers (Protobuf)** (payload jusqu'à 10 fois plus petit et parsing ultra-rapide) et s'appuie sur **HTTP/2** pour le multiplexage (plusieurs requêtes simultanées sur une seule connexion TCP permanente), réduisant la latence d'un facteur 5 à 10.

**Exercice 2 :** Comment la vulnérabilité **API1:2023 - Broken Object Level Authorization (BOLA)** se manifeste-t-elle sur une API bancaire et quelle est sa remédiation ?

**Corrigé :** La vulnérabilité **BOLA** se produit lorsque l'API vérifie que l'utilisateur est connecté (authentifié), mais **omet de vérifier s'il est le propriétaire légitime de la ressource demandée**. Par exemple, un client connecté avec l'ID `101` appelle `GET /api/v1/solde?compte_id=202` et l'API lui renvoie le solde du client `202`. La remédiation consiste à implémenter un **contrôle d'accès explicite (RBAC/ABAC)** au niveau du code de l'API : l'API doit systématiquement valider que l'ID extrait du token JWT de la session correspond exactement au `compte_id` demandé.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel framework RPC open-source développé par Google utilise le format binaire Protocol Buffers (Protobuf) et le protocole HTTP/2 pour offrir des performances maximales inter-microservices ?
- A) gRPC
- B) MS Paint
- C) FTP
- D) Telnet

**Réponse : A**

**Q2 :** Quelle vulnérabilité majeure du classement OWASP API Security Top 10 (2023) survient lorsqu'une API ne contrôle pas si l'utilisateur connecté a le droit d'accéder à l'identifiant d'objet (ID) spécifié dans la requête ?
- A) API1:2023 - Broken Object Level Authorization (BOLA)
- B) Ecran bleu
- C) Formatage de disque
- D) Câble débranché

**Réponse : A**

**Q3 :** Quelle attaque spécifique aux APIs GraphQL consiste à soumettre des requêtes récursives profondément imbriquées pour forcer le serveur à consommer toute sa mémoire et son processeur ?
- A) Query Depth Attack (Attaque par profondeur de requête)
- B) Ping of Death
- C) Phishing
- D) Disquette

**Réponse : A**

**Q4 :** Dans gRPC, quel composant logiciel permet d'intercepter les appels de procédure entrants pour vérifier la présence et la validité des jetons d'authentification (Tokens JWT / Bearer) ?
- A) gRPC Interceptor (Intercepteur)
- B) Scanner d'imprimante
- C) Clavier USB
- D) Antenne radio

**Réponse : A**

**Q5 :** Quel est le rôle de la limitation de profondeur de requête (Query Depth Limiting) sur un serveur GraphQL ?
- A) Bloquer automatiquement les requêtes GraphQL dont le niveau d'imbrication dépasse un seuil de sécurité configuré (ex: max 3 niveaux) pour prévenir les attaques de déni de service
- B) Éteindre l'ordinateur
- C) Effacer la base de données
- D) Modifier l'adresse IP

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
