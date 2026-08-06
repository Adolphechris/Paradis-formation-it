# TOME P4 — Cloud, DevOps & SecOps — Jour 172 (6h) : JavaScript ES6+ & Programmmation Asynchrone (DOM, Async/Await, Promises & Event Loop)

> [!NOTE]
> **Objectif du jour :** Maîtriser le langage JavaScript moderne (ES6+) pour le développement d'applications web dynamiques : manipulation avancée du DOM, fonctionnalités ES6+ (Destructuring, Spread/Rest, Modules ES6), programmation asynchrone (**Promises**, **Async/Await**), modèle d'exécution événementiel (**Event Loop**, Event Queue) et gestion des requêtes HTTP réseau (`fetch` API).
>
> **Compétences visées :** `BIT-06` (A) — JavaScript ES6+ & Asynchronous Programming | `BIT-04` (A) — Web APIs & Event Loop Mechanics

---

## 1) Module — JavaScript ES6+ : Modernité & Modèle d'Événements (2h)

### 📖 Narration/Intuition

JavaScript est le langage de programmation incontournable du navigateur web. Depuis l'avènement de la norme **ES6 (ECMAScript 2015)** et ses évolutions récentes, JavaScript est devenu un langage puissant, expressif et typé optionnellement (via TypeScript).

Pour interagir avec la page web, JavaScript manipule le **DOM (Document Object Model)**, l'arbre de représentation en mémoire de la structure HTML.

### 🔍 Anatomie Technique

**Fonctionnalités Clés ES6+ :**

```javascript
// 1. Déclaration de variables portées par bloc (let, const)
const AGENCE_CODE = "KIN-01";
let soldeCompte = 150000.00;

// 2. Destructuring & Arrow Functions
const client = { id: 99, nom: "Kabila", email: "kabila@bcc.cd" };
const { nom, email } = client; // Extraction propre

const calculerTaxe = (montant, taux = 0.16) => montant * taux;

// 3. Template Literals (Interpolation de chaînes)
const message = `Le solde du client ${nom} (${email}) est de ${soldeCompte} CDF.`;

// 4. Spread Operator (...)
const comptesCheque = ["CC-01", "CC-02"];
const comptesEpargne = ["CE-01", "CE-02"];
const tousLesComptes = [...comptesCheque, ...comptesEpargne];
```

---

## 2) Module — L'Event Loop & la Programmation Asynchrone (Promises & Async/Await) (2h)

### 📖 Narration/Intuition

JavaScript est un langage **mono-threadé** (Single-threaded). Comment peut-il effectuer une requête réseau vers l'API de la BCC qui dure 2 secondes sans figer complètement l'interface graphique du navigateur ?

Grâce à l'**Event Loop (Boucle d'Événements)**. Lorsqu'une tâche asynchrone (comme un appel API ou un timer) est déclenchée, le moteur JavaScript la délègue aux Web APIs du navigateur et continue d'exécuter le code. Une fois la réponse réseau reçue, le callback est placé dans la **Microtask Queue** et exécuté par l'Event Loop dès que la Call Stack est libre.

### 🔍 Anatomie Technique

**Évolution de l'Asynchronisme : Callbacks ──► Promises ──► Async/Await :**

```javascript
// 1. Approche moderne avec Async/Await et try/catch
async function chargerComptesBancaires(clientId) {
    try {
        console.log("1. Début de la requête réseau API...");
        
        // La fonction s'interrompt (sans bloquer le navigateur) jusqu'à la résolution de la Promise
        const response = await fetch(`https://api.bcc.cd/v1/clients/${clientId}/comptes`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + sessionStorage.getItem('token_jwt'),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("2. Données reçues avec succès :", data);
        return data;

    } catch (error) {
        console.error("❌ Échec du chargement des comptes :", error.message);
        afficherAlerteErreur("Impossible de contacter le serveur bancaire.");
    }
}
```

---

## 3) Module — Laboratoire Pratique : Application Web Dynamique & Manipulation du DOM (2h)

### 📖 Narration/Intuition

Construisons un module d'application web dynamique interagissant avec le DOM pour afficher la liste des transactions bancaires avec filtrage en temps réel.

### 🔍 Anatomie Technique

**Script de manipulation dynamique du DOM (`transactions_app.js`) :**

```javascript
// Module JavaScript de gestion dynamique de l'interface des transactions

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-tx');
    const txContainer = document.getElementById('tx-list');

    // Données de simulation
    const transactions = [
        { id: "TX1001", titulaire: "Banque Commerciale A", montant: 500000, type: "CREDIT" },
        { id: "TX1002", titulaire: "Société Minière B", montant: 1200000, type: "DEBIT" },
        { id: "TX1003", titulaire: "Direction Impôts", montant: 450000, type: "CREDIT" }
    ];

    // Fonction de rendu dynamique dans le DOM
    function afficherTransactions(liste) {
        txContainer.innerHTML = ''; // Vider le conteneur

        liste.forEach(tx => {
            const card = document.createElement('div');
            card.className = `tx-card ${tx.type.toLowerCase()}`;
            card.innerHTML = `
                <div class="tx-info">
                    <strong>${tx.titulaire}</strong> (${tx.id})
                </div>
                <div class="tx-amount ${tx.type === 'CREDIT' ? 'text-success' : 'text-danger'}">
                    ${tx.type === 'CREDIT' ? '+' : '-'} ${tx.montant.toLocaleString('fr-CD')} CDF
                </div>
            `;
            txContainer.appendChild(card);
        });
    }

    // Écouteur d'événement de recherche en temps réel (Input Event)
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtre = transactions.filter(tx => 
            tx.titulaire.toLowerCase().includes(query) || tx.id.toLowerCase().includes(query)
        );
        afficherTransactions(filtre);
    });

    // Rendu initial
    afficherTransactions(transactions);
});
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DOM** | Document Object Model — Représentation orientée objet en mémoire de la page HTML |
| **ES6** | ECMAScript 2015 — Version majeure de standardisation du langage JavaScript |
| **Event Loop** | Boucle d'événements gérant l'exécution asynchrone monothreadée en JS |
| **API Fetch** | Interface native moderne des navigateurs pour effectuer des requêtes HTTP asynchrones |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquez la différence de fonctionnement entre la pile d'exécution (**Call Stack**) et la file de micro-tâches (**Microtask Queue**) dans le modèle de l'Event Loop JavaScript.

**Corrigé :** La **Call Stack** est la pile d'exécution synchrone où le moteur JS empile et exécute immédiatement les instructions de code ligne par ligne. Lorsqu'une tâche asynchrone basée sur les Promises (`fetch`, `Promise.then()`, `async/await`) est résolue, son callback est placé dans la **Microtask Queue**. L'**Event Loop** surveille en continu la Call Stack. Dès que la Call Stack devient complètement vide, l'Event Loop dépile et exécute **toutes** les tâches en attente dans la Microtask Queue avant de passer au rendu graphique ou aux timers (`setTimeout`).

**Exercice 2 :** Pourquoi l'utilisation de `const` doit-elle être privilégiée par défaut par rapport à `let` et `var` dans du code JavaScript moderne ?

**Corrigé :** **`const`** déclare une variable portée par le bloc d'instructions dont la référence ne peut pas être réaffectée. Cela garantit l'immutabilité des références, évitant les réaffectations accidentelles et rendant le code plus prévisible et lisible. **`let`** est utilisé uniquement pour les variables dont la valeur doit réellement varier (ex: compteurs de boucles). **`var`** est obsolète car sa portée est liée à la fonction entière (Function Scope) et elle est sujette au phénomène d'ancrage (**Hoisting**), source de nombreux bugs logiques.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle nouveauté d'ES6 permet d'extraire facilement des propriétés d'un objet JavaScript dans des variables distictes (ex: `const { nom, email } = user;`) ?
- A) Le Destructuring (Déstructuration)
- B) Le Hoisting
- C) La Concaténation
- D) L'Heritabilité

**Réponse : A**

**Q2 :** Comment s'appelle le mécanisme interne du moteur JavaScript qui permet de gérer l'exécution asynchrone non-bloquante malgré une exécution monothreadée ?
- A) L'Event Loop (Boucle d'événements)
- B) Le Thread Pool C++
- C) Le compilateur JIT
- D) Le Garbage Collector

**Réponse : A**

**Q3 :** En JavaScript moderne, quelle syntaxe basée sur les mot-clés `async` et `await` permet d'écrire du code asynchrone avec une lisibilité similaire à du code synchrone ?
- A) Async / Await
- B) Callbacks imbriqués
- C) GOTO
- D) Try / Catch

**Réponse : A**

**Q4 :** Quelle API native moderne des navigateurs web remplace l'ancien `XMLHttpRequest` pour effectuer des requêtes HTTP réseau asynchrones retournant des Promises ?
- A) API `fetch()`
- B) `document.write()`
- C) `alert()`
- D) `console.log()`

**Réponse : A**

**Q5 :** Dans la file d'attente d'événements JavaScript, où sont placées les callbacks de résolution des `Promises` et des fonctions `async/await` ?
- A) Dans la Microtask Queue
- B) Sur le disque dur
- C) Dans la corbeille
- D) Dans les cookies

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
