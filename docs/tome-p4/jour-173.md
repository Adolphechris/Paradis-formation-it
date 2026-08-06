# TOME P4 — Cloud, DevOps & SecOps — Jour 173 (6h) : Architectures Node.js, Express & APIs RESTful (Node.js Core, Express Routing, Middleware & Structuration MVC)

> [!NOTE]
> **Objectif du jour :** Concevoir et construire des services web backend performants avec Node.js et Express.js : architecture événementielle non-bloquante de Node.js (Event-Driven I/O, Libuv), routage Express.js, création de middlewares personnalisés (authentification, logging, gestion centralisée des erreurs), structuration d'une API RESTful selon les principes MVC (Modèle-Vue-Contrôleur) et validation des données d'entrée (`Joi` / `Zod`).
>
> **Compétences visées :** `BIT-06` (A) — Backend Node.js & Express.js | `BIT-04` (A) — Architecture d'APIs RESTful & Middlewares

---

## 1) Module — Architecture Node.js & Moteur Libuv (2h)

### 📖 Narration/Intuition

Historiquement, les serveurs web comme Apache HTTPD créaient un nouveau thread système pour chaque utilisateur connecté. Si 10 000 utilisateurs se connectent en même temps, le serveur consomme des gigaoctets de RAM uniquement pour gérer les threads et s'effondre sous la charge (**C10K Problem**).

**Node.js** révolutionne le backend en exécutant le moteur JavaScript V8 au-dessus d'une bibliothèque d'I/O asynchrones appelée **Libuv**. Node.js utilise un **seul thread principal** pour gérer des dizaines de milliers de connexions simultanées sans bloquer grâce aux **I/O non-bloquantes (Non-blocking I/O)**.

### 🔍 Anatomie Technique

**Architecture de la Boucle d'Événements Libuv dans Node.js :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NODE.JS RUNTIME ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ [ Application Express.js ] ──► [ V8 JavaScript Engine ]                     │
│                                           │                                 │
│                                           ▼ (Délégation d'I/O Asynchrones) │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ LIBUV C++ LIBRARY                                                       │ │
│ │ - Event Loop (Phases: Timers, I/O Poll, Check, Close)                   │ │
│ │ - Thread Pool Libuv (4 threads par défaut pour I/O disque / Crypto)     │ │
│ └────────────────────────────────────┬────────────────────────────────────┘ │
│                                      │                                      │
│                                      ▼                                      │
│                        [ Noyau OS (epoll / kqueue / IOCP) ]                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Framework Express.js & Chaîne de Middlewares (2h)

### 📖 Narration/Intuition

**Express.js** est le framework web minimaliste et flexible de référence pour Node.js. Le cœur de la philosophie d'Express repose sur le concept de **Middleware**.

Un **Middleware** est une fonction qui a accès à l'objet requête (`req`), à l'objet réponse (`res`) et à la fonction suivante (`next`). Les middlewares s'enchaînent en cascade (Pipeline Pattern) pour exécuter le logging, le parsing du JSON, l'authentification et la validation avant d'atteindre le contrôleur final.

### 🔍 Anatomie Technique

**Cascade de Middlewares dans Express.js :**

```
 [ Requête Client HTTP ]
            │
            ▼
 ┌─────────────────────┐
 │ 1. Logger Middleware│ ──► Enregistre la méthode et l'IP dans les logs
 └──────────┬──────────┘
            │ next()
            ▼
 ┌─────────────────────┐
 │ 2. Auth Middleware  │ ──► Vérifie la validité du Token JWT (Si invalide -> 401)
 └──────────┬──────────┘
            │ next()
            ▼
 ┌─────────────────────┐
 │ 3. Validator (Zod)  │ ──► Vérifie que le schéma du body JSON est valide
 └──────────┬──────────┘
            │ next()
            ▼
 ┌─────────────────────┐
 │ 4. Controller (MVC) │ ──► Exécute la logique métier et retourne la Réponse JSON
 └─────────────────────┘
```

---

## 3) Module — Laboratoire Pratique : API RESTful Bancaire MVC avec Express (2h)

### 📖 Narration/Intuition

Construisons une API RESTful bancaire complète pour la BCC structurée selon l'architecture **MVC (Modèle-Vue-Contrôleur)** avec gestion centralisée des erreurs.

### 🔍 Anatomie Technique

**1. Contrôleur de Gestion des Comptes Bancaires (`accountController.js`) :**

```javascript
// accountController.js — Contrôleur de l'API RESTful BCC
const accountService = require('../services/accountService');
const { z } = require('zod');

// Schéma de validation de saisie avec Zod
const transferSchema = z.object({
    sourceIban: z.string().length(34),
    destinationIban: z.string().length(34),
    amount: z.number().positive()
});

exports.executeTransfer = async (req, res, next) => {
    try {
        // 1. Validation du body de la requête
        const validatedData = transferSchema.parse(req.body);

        // 2. Appel du service métier
        const result = await accountService.transferMoney(
            validatedData.sourceIban,
            validatedData.destinationIban,
            validatedData.amount
        );

        // 3. Réponse HTTP 200 OK
        return res.status(200).json({
            status: "SUCCESS",
            message: "Virement bancaire effectué avec succès.",
            data: result
        });

    } catch (error) {
        // Transmettre l'erreur au middleware de gestion d'erreurs global
        next(error);
    }
};
```

**2. Serveur Express & Middleware Global d'Erreur (`server.js`) :**

```javascript
// server.js — Point d'entrée du serveur Express Node.js
const express = require('express');
const app = express();
const accountRoutes = require('./routes/accountRoutes');

// Parseur JSON natif
app.use(express.json());

// Routes de l'API REST
app.use('/api/v1/accounts', accountRoutes);

// Middleware Global de Gestion des Erreurs (4 arguments obligatoires)
app.use((err, req, res, next) => {
    console.error("❌ ERREUR API :", err.stack);

    if (err.name === 'ZodError') {
        return res.status(400).json({
            status: "VALIDATION_ERROR",
            errors: err.errors
        });
    }

    return res.status(err.statusCode || 500).json({
        status: "ERROR",
        message: err.message || "Erreur interne du serveur bancaire."
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur API REST BCC actif sur le port ${PORT}`);
});
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Libuv** | Bibliothèque C++ d'I/O asynchrones au cœur de Node.js |
| **REST** | Representational State Transfer — Style d'architecture pour les APIs Web |
| **MVC** | Modèle-Vue-Contrôleur — Pattern d'architecture logicielle séparant les données et l'affichage |
| **Middleware** | Composant logiciel intermédiaire interceptant et traitant les requêtes HTTP |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi l'exécution d'une opération de calcul mathématique lourde (ex: chiffrement de mot de passe synchrone `bcrypt.hashSync`) directement sur le thread principal de Node.js est-elle une faute grave d'architecture ?

**Corrigé :** Node.js exécute le code JavaScript applicatif sur un **seul et unique thread principal**. Si vous lancez une opération synchrone gourmande en CPU (comme un hash de mot de passe lourd), ce calcul monopolise le thread principal pendant plusieurs centaines de millisecondes. Pendant toute cette durée, **l'Event Loop est complètement bloquée (Event Loop Blocking)** : le serveur Node.js devient incapable de répondre aux requêtes HTTP de tous les autres utilisateurs connectés. Pour les opérations lourdes, il faut obligatoirement utiliser les versions asynchrones (`bcrypt.hash` basé sur le Thread Pool Libuv) ou utiliser des **Worker Threads**.

**Exercice 2 :** Dans une API RESTful Express.js, quelle est la règle syntaxique impérative pour qu'Express reconnaisse une fonction comme un **Middleware d'Erreur Global** ?

**Corrigé :** Express.js distingue les middlewares classiques des middlewares d'erreur uniquement par le **nombre exact d'arguments** déclarés dans la fonction. Un middleware d'erreur global **doit obligatoirement déclarer exactement 4 arguments** : `(err, req, res, next)`. Même si vous n'utilisez pas l'un des arguments (comme `next`), la fonction doit comporter ces 4 paramètres, sinon Express la traitera comme un middleware classique et ne lui transmettra pas les erreurs capturées par `next(error)`.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle bibliothèque C++ sous-jacente fournit à Node.js sa boucle d'événements (Event Loop) et son pool de threads pour gérer les I/O asynchrones non-bloquantes ?
- A) Libuv
- B) React
- C) jQuery
- D) Bootstrap

**Réponse : A**

**Q2 :** Dans le framework Express.js, comment appelle-t-on une fonction qui intercepte la chaîne de traitement HTTP et possède l'accès aux objets `req`, `res` et à la fonction `next()` ?
- A) Un Middleware
- B) Un Socket
- C) Un Cookie
- D) Un Template

**Réponse : A**

**Q3 :** Quel code de statut HTTP standard doit être retourné par une API RESTful lorsque les données fournies dans le body JSON échouent à la validation de schéma (ex: Zod/Joi) ?
- A) 400 Bad Request
- B) 200 OK
- C) 500 Internal Server Error
- D) 404 Not Found

**Réponse : A**

**Q4 :** Quel pattern d'architecture logicielle réorganise le code backend en séparant la définition des données, la logique de contrôle et les réponses d'affichage ?
- A) MVC (Modèle-Vue-Contrôleur)
- B) Monolithe spaghetti
- C) Single Page Application
- D) Peer-to-Peer

**Réponse : A**

**Q5 :** Pourquoi la méthode asynchrone `fs.readFile()` doit-elle toujours être préférée à la méthode synchrone `fs.readFileSync()` dans un serveur web Node.js en production ?
- A) Parce que `fs.readFileSync()` bloque le thread unique de Node.js pendant la lecture sur disque, empêchant le serveur de traiter d'autres requêtes concurrentes
- B) Parce que `readFileSync` supprime le fichier
- C) Parce que `readFile` coûte moins cher
- D) Parce que `readFileSync` ne fonctionne que le mardi

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
