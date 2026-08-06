# TOME P4 — Cloud, DevOps & SecOps — Jour 159 (6h) : Bases de Données Orientées Documents & Distributed NoSQL (MongoDB, Sharding, Replica Sets & Sécurité NoSQL)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'administration et la sécurisation des bases de données NoSQL orientées documents : architecture MongoDB (Documents BSON, Collections), haute disponibilité via les **Replica Sets**, passage à l'échelle horizontal par **Sharding** (Routeurs mongos, Config Servers), requêtes d'agrégation avancées (Aggregation Pipeline) et prévention des vulnérabilités d'injections NoSQL.
>
> **Compétences visées :** `BIT-05` (A) — Distributed NoSQL & MongoDB Administration | `SEC-05` (A) — Sécurité des Stockages NoSQL & Prévention NoSQLi

---

## 1) Module — Fondamentaux de MongoDB & Architecture Orientée Documents (2h)

### 📖 Narration/Intuition

Dans les applications financières modernes, les données ne s'insèrent pas toujours proprement dans des tables rigides avec un nombre fixe de colonnes. Par exemple, le dossier de demande de crédit d'un client peut contenir des pièces jointes, des garants multiples, des historiques d'emplois et des évaluations de risques variables d'un client à l'autre.

**MongoDB** est le SGBD NoSQL orienté documents leader. Il stocke les données sous forme de documents **BSON (Binary JSON)** flexibles et dynamiques regroupés dans des **Collections**.

### 🔍 Anatomie Technique

**Comparaison Vocabulaire SQL vs MongoDB :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SQL vs MONGODB TERMINOLOGIE                       │
├──────────────────────────────┬──────────────────────────────────────────────┤
│ SGBD Relationnel (PostgreSQL)│ SGBD NoSQL Documents (MongoDB)               │
├──────────────────────────────┼──────────────────────────────────────────────┤
│ Base de données (Database)   │ Base de données (Database)                   │
│ Table                        │ Collection                                   │
│ Ligne (Row / Tuple)          │ Document (BSON)                              │
│ Colonne (Column)             │ Champ (Field)                                │
│ Clé Primaire (Primary Key)   │ Champ obligatoire `_id` (ObjectId 12 bytes)  │
│ Jointure (JOIN)              │ Références ou Documents Imbriqués ($lookup)  │
└──────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 2) Module — Haute Disponibilité & Scalabilité : Replica Sets & Sharding (2h)

### 📖 Narration/Intuition

Pour garantir la haute disponibilité et supporter des pétaoctets de données, MongoDB s'appuie sur deux piliers d'architecture distribuée :
1. **Replica Set** : Cluster de nœuds MongoDB répliquant les mêmes données. Un nœud **Primary** reçoit les écritures et réplique vers les nœuds **Secondary**. En cas de panne du Primary, une élection automatique désigne un nouveau maître en moins de 10 secondes.
2. **Sharding (Partitionnement Horizontal)** : Distribue les collections volumineuses sur plusieurs clusters distincts (Shards) grâce à une **Shard Key**. Un routeur (`mongos`) dirige les requêtes vers le bon Shard de manière transparente.

### 🔍 Anatomie Technique

**Architecture d'un Cluster MongoDB Shardé et Sécurisé :**

```
[ Application Client ]
          │
          ▼ (Port 27017 TLS/SCRAM)
   [ Routeur mongos ] ◄──────► [ Config Server Cluster ] (Métadonnées & Mapping)
          │
     ┌────┴─────────────────────────────┐
     ▼                                  ▼
[ SHARD A (Replica Set) ]      [ SHARD B (Replica Set) ]
├── Primary (Node 1)           ├── Primary (Node 4)
├── Secondary (Node 2)         ├── Secondary (Node 5)
└── Secondary (Node 3)         └── Secondary (Node 6)
```

---

## 3) Module — Aggregation Pipeline & Prévention Injections NoSQL (2h)

### 📖 Narration/Intuition

Tout comme les injections SQL existent en SGBDR, les applications utilisant NoSQL sont vulnérables aux **Injections NoSQL (NoSQLi)** si les paramètres de requêtes ne sont pas nettoyés.

Une injection NoSQL se produit lorsqu'un attaquant transmet un objet JSON ou un opérateur MongoDB (ex: `$ne` - Not Equal, `$gt` - Greater Than) dans un formulaire d'authentification.

### 🔍 Anatomie Technique

**Exemple de vulnérabilité NoSQL Injection et correction dans Node.js/MongoDB :**

```javascript
// ❌ CODE VULNÉRABLE À L'INJECTION NoSQL !
// Si l'attaquant envoie la payload JSON : {"username": "admin", "password": {"$ne": ""}}
// La requête MongoDB devient : db.users.find({ username: "admin", password: { $ne: "" } })
// "$ne: ''" signifie "mot de passe NON ÉGAL à vide" -> L'attaquant se connecte en Admin !

app.post('/login', async (req, res) => {
    const user = await db.collection('users').findOne({
        username: req.body.username, // Dangereux si req.body.password est un objet {$ne: ""}
        password: req.body.password
    });
});

// ✅ CORRECTION ABSOLUE (Validation et Sanitization des types)
const mongoSanitize = require('express-mongo-sanitize');

app.use(express.json());
app.use(mongoSanitize()); // Élimine automatiquement les opérateurs commençant par '$' ou '.'

app.post('/login-securise', async (req, res) => {
    // Forcer le type String explicite
    const username = String(req.body.username);
    const password = String(req.body.password);

    const user = await db.collection('users').findOne({ username, password });
});
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **BSON** | Binary JSON — Format de stockage binaire haute performance utilisé par MongoDB |
| **NoSQLi** | NoSQL Injection — Vulnérabilité d'injection d'opérateurs dans les bases NoSQL |
| **mongos** | Processus d'orientation et de routage des requêtes dans un cluster MongoDB Shardé |
| **Replica Set** | Groupe de serveurs MongoDB maintenant le même ensemble de données avec élection automatique |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence essentielle dans la modélisation de données entre le modèle **Document Imbriqué (Embedded Documents)** et le modèle **Par Références (Normalized References)** dans MongoDB ?

**Corrigé :** Le modèle **Document Imbriqué** inclut directement les données associées à l'intérieur du document principal (ex: les 3 adresses d'un client sont stockées dans un tableau d'objets `adresses: [...]` dans le document `Client`). Cela permet de lire toutes les données en une seule opération de lecture très rapide (sans jointure). Le modèle **Par Références** stocke l'ID du document associé (ex: `client_id: ObjectId("...")`) dans une collection séparée (similaire à une clé étrangère SQL). On utilise les Références lorsque les données associées sont très volumineuses ou partagées entre plusieurs entités (ex: catalogue de produits).

**Exercice 2 :** Comment le mécanisme d'**élection automatique** d'un Replica Set MongoDB réagit-il en cas de perte de connectivité avec le nœud Primary ?

**Corrigé :** Les nœuds d'un Replica Set MongoDB s'envoient des signaux de santé (Heartbeats) toutes me 2 secondes. Si le nœud **Primary** ne répond pas pendant plus de 10 secondes, les nœuds **Secondary** restants constatent l'absence du maître. Un processus d'élection par consensus basé sur l'algorithme Raft est déclenché. Le nœud Secondary possédant les données les plus récentes (le plus haut journal d'opérations `oplog`) et ayant la majorité des voix est élu nouveau Primary. L'application client bascule automatiquement ses écritures sur le nouveau Primary sans interruption de service.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel format de stockage binaire dérivé de JSON est utilisé par MongoDB pour enregistrer les documents sur disque avec un typage fort ?
- A) BSON (Binary JSON)
- B) XML
- C) CSV
- D) YAML

**Réponse : A**

**Q2 :** Dans MongoDB, quel composant d'architecture assure la Haute Disponibilité et le basculement automatique via un cluster de serveurs synchronisés ?
- A) Replica Set
- B) Disquette
- C) Apache Web Server
- D) Docker File

**Réponse : A**

**Q3 :** Quel composant réseau sert de routeur de requêtes dans un cluster MongoDB Shardé pour diriger les opérations vers le bon Shard ?
- A) `mongos`
- B) `nginx`
- C) `iptables`
- D) `ssh`

**Réponse : A**

**Q4 :** Quelle est la vulnérabilité de sécurité qui permet à un attaquant de passer un opérateur tel que `{"$ne": ""}` pour contourner un formulaire d'authentification NoSQL ?
- A) Injection NoSQL (NoSQLi)
- B) Buffer Overflow
- C) XSS
- D) Man-in-the-Middle

**Réponse : A**

**Q5 :** Dans MongoDB, quel est le champ obligatoire présent dans chaque document servant de clé primaire unique ?
- A) `_id`
- B) `primary_key`
- C) `index`
- D) `row_id`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
