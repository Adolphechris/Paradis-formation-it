# TOME P3C — Jour 26 (12h) : APIs REST & Authentification JWT — Le Cœur des Applications Web

> [!NOTE]
> **Objectif de la journée** : Concevoir, développer et sécuriser des APIs REST (Representational State Transfer) avec Node.js/Express ou Python/FastAPI, et implémenter l'authentification par tokens JWT (JSON Web Token).

---

## 1) Architecture REST : Les Principes Universels (2h)

### 📖 1.1 Les Verbes HTTP et la Sémantique REST

Une API REST permet à des applications (React, Mobile, Python) de communiquer avec le serveur de manière standardisée.

| Méthode | Action | Exemple d'URL | Description |
|---------|--------|---------------|-------------|
| **GET** | Lire | `/api/tickets` | Récupère la liste des tickets |
| **GET** | Lire un | `/api/tickets/42` | Récupère le ticket #42 |
| **POST** | Créer | `/api/tickets` | Crée un nouveau ticket |
| **PUT/PATCH** | Modifier | `/api/tickets/42` | Mettre à jour le ticket #42 |
| **DELETE** | Supprimer | `/api/tickets/42` | Supprime le ticket #42 |

---

## 2) Développer une API REST avec Node.js & Express (4h)

### 🛠️ 2.1 Serveur Express Complet

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = "BCC_SECRET_KEY_2026!";

// Base de données simulée
let tickets = [
    { id: 1, agent: "Marie Bongo", type: "Réseau", statut: "Ouvert" },
    { id: 2, agent: "Paul Kimba", type: "Compte", statut: "Fermé" }
];

// Route GET : Tous les tickets
app.get('/api/tickets', (req, res) => {
    res.json(tickets);
});

// Route POST : Créer un ticket
app.post('/api/tickets', (req, res) => {
    const newTicket = {
        id: tickets.length + 1,
        agent: req.body.agent,
        type: req.body.type,
        statut: "Ouvert"
    };
    tickets.push(newTicket);
    res.status(201).json(newTicket);
});

// Route POST : Connexion JWT
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "BCC2026!") {
        const token = jwt.sign({ username, role: "IT_ADMIN" }, SECRET_KEY, { expiresIn: '8h' });
        return res.json({ token });
    }
    res.status(401).json({ message: "Identifiants invalides" });
});

app.listen(3000, () => console.log("🚀 API REST BCC lancée sur http://localhost:3000"));
```

---

## 🏋️ Exercices Pratiques & Corrigés

### Exercice : Middleware de Sécurité JWT
Écrivez un middleware Express `verifierToken` qui bloque l'accès aux routes protégées si le token JWT est absent ou invalide.
- **Corrigé** :
```javascript
function verifierToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: "Token requis" });
    
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Token invalide" });
        req.user = decoded;
        next();
    });
}
```

---

## ❓ Banque de Questions & Test du Jour 26

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*