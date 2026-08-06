# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 258 (6h) : Sécurité des APIs GraphQL & gRPC (GraphQL Introspection, Depth/Complexity Limits, gRPC Protobuf Reverse Engineering & HTTP/2 Security)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **pentesting et la sécurisation des architectures d'APIs modernes (GraphQL & gRPC)** : exploiter l'introspection GraphQL, conduire des attaques par déni de service (Query Batching / Circular Queries), réaliser l'ingénierie inverse de fichiers `.proto` gRPC à partir du binaire compilé, et appliquer les contrôles de sécurité applicatifs adaptés.
>
> **Compétences visées :** `API-01` (A) — GraphQL Security & Exploitation | `API-02` (A) — gRPC Protobuf Reverse Engineering & Security

---

## 1) Module — Sécurité & Pentesting GraphQL (2h30)

### 📖 Narration/Intuition

Contrairement aux APIs REST classiques qui exposent de multiples endpoints (`/users`, `/products`), **GraphQL** expose un endpoint unique (`/graphql`) acceptant des requêtes de structures complexes. Si l'**introspection** est laissée active en production, un attaquant peut télécharger l'intégralité du schéma de données de l'application en une seule requête.

### 🛠️ Atelier Pratique

**Audit et exploitation d'un endpoint GraphQL (`graphql_pentest.py`) :**

```python
import requests
import json

TARGET_URL = "https://target.com/graphql"

# 1) Requête d'introspection complète pour extraire le schéma
introspection_query = """
query IntrospectionQuery {
  __schema {
    queryType { name }
    mutationType { name }
    types {
      name
      fields {
        name
        type { name kind }
      }
    }
  }
}
"""

response = requests.post(TARGET_URL, json={'query': introspection_query})
if "__schema" in response.text:
    print("[!] VULNÉRABILITÉ : Introspection GraphQL active en production !")
    with open("schema_dump.json", "w") as f:
        f.write(response.text)

# 2) Attaque DoS — Requête circulaire récursive (Circular Query)
# Si aucune limitation de profondeur (Depth Limit) n'est configurée :
dos_query = """
query CircularDoS {
  user(id: "1") {
    friends {
      friends {
        friends {
          friends {
            friends { name }
          }
        }
      }
    }
  }
}
"""
# Remédiation : Configurer graphql-depth-limit (maxDepth = 5) dans l'application Express/Apollo
```

---

## 2) Module — Sécurité gRPC & Protobuf Reverse Engineering (2h30)

### 📖 Narration/Intuition

**gRPC** est un framework RPC haute performance de Google basé sur **HTTP/2** et la sérilation binaire **Protocol Buffers (Protobuf)**. Il est massivement utilisé dans les architectures microservices cloud-native. Comme les schémas `.proto` ne sont pas transmis sur le réseau (seul le binaire sérialisé transite), le pentester doit reconstituer la structure des messages.

### 🛠️ Atelier Pratique

**Décodage et fuzzer gRPC/Protobuf (`grpc_decoder.py`) :**

```python
import subprocess
import requests

# Décodage d'un message Protobuf binaire capturé dans Burp Suite sans fichier .proto
# Utilisation de protoc --decode_raw

def decode_raw_protobuf(binary_data: bytes) -> str:
    process = subprocess.Popen(
        ['protoc', '--decode_raw'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    stdout, stderr = process.communicate(input=binary_data)
    return stdout.decode('utf-8')

# Exemple d'analyse :
# Champ 1 (varint) : ID utilisateur
# Champ 2 (string) : Nom d'utilisateur
# Output brut type :
# 1: 10023
# 2: "admin_user"

# Outil d'interception recommandé : Extension Burp Suite "Protobuf Decoder" / "grpc-wire"
```

---

## 3) Module — Matrice de Durcissement GraphQL & gRPC (1h)

### 🛠️ Résumé des Contrôles de Sécurité Recommandés

| Technologie | Vulnérabilité Courante | Solution de Durcissement |
|:---|:---|:---|
| **GraphQL** | Introspection active en Prod | Désactiver `introspection: false` dans Apollo Server |
| **GraphQL** | DoS par requête récursive | Implémenter `graphql-depth-limit` (ex: maxDepth=5) |
| **GraphQL** | DoS par Batching | Limiter le nombre de requêtes par batch (`batchLimit: 10`) |
| **gRPC** | Unauthenticated RPCs | Exiger **mTLS** (TLS mutuel) + Tokens gRPC Metadata (JWT) |
| **gRPC** | Protobuf Fuzzing crash | Valider les schémas Protobuf avec `protoc-gen-validate` (PGV) |

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **gRPC** | gRPC Remote Procedure Calls — Framework RPC développé par Google sur HTTP/2 |
| **Protobuf** | Protocol Buffers — Format de sérialisation binaire structuré de Google |
| **mTLS** | Mutual TLS — Chiffrement TLS exigeant un certificat client ET serveur |
| **Introspection** | Fonctionnalité GraphQL permettant de requêter le schéma de l'API |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle requête spéciale GraphQL permet d'extraire la liste complète des types, requêtes et mutations exposés par l'API ?
- A) Introspection Query (`__schema`)
- B) `GET /swagger.json`
- C) `OPTIONS /graphql`
- D) `SELECT * FROM schema`

**Réponse : A**

**Q2 :** Quel protocole de transport réseau est obligatoirement utilisé par le framework gRPC ?
- A) HTTP/2
- B) HTTP/1.1
- C) UDP
- D) Websockets

**Réponse : A**

**Q3 :** Comment se nomme l'outil officiel de Google permettant de décoder un message Protobuf binaire sans disposer du fichier `.proto` d'origine ?
- A) `protoc --decode_raw`
- B) `grpc-dump`
- C) `binary2json`
- D) `strings`

**Réponse : A**

**Q4 :** Quelle mesure de sécurité prévient les attaques DoS par requêtes récursives profondes dans un serveur GraphQL ?
- A) La limitation de profondeur des requêtes (GraphQL Depth Limit)
- B) Le chiffrement AES-256
- C) La désactivation de HTTP/2
- D) L'utilisation de JWT

**Réponse : A**

**Q5 :** Quel mécanisme d'authentification réseau est fortement recommandé pour sécuriser les communications gRPC inter-microservices ?
- A) mTLS (TLS Mutuel avec certificats clients)
- B) Basic Auth HTTP
- C) Mots de passe en clair
- D) IP Whitelisting uniquement

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
