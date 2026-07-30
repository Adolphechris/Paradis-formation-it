# TOME P3C — Jour 24 (12h) : JavaScript Fondamentaux — Dynamiser l'Interface Web

> [!NOTE]
> **Objectif de la journée** : Donner de la vie et de l'interactivité aux pages web avec JavaScript (DOM, événements, requêtes AJAX/Fetch). À la fin de ce cours, vous saurez dynamiser un tableau de bord, valider un formulaire sans recharger la page et consommer des données réseau.

---

## 1) Le DOM (Document Object Model) (3h)

### 📖 1.1 Qu'est-ce que le DOM ?

Le **DOM** est la représentation sous forme d'arbre d'objets en mémoire de la page HTML. JavaScript utilise le DOM pour lire, modifier, ajouter ou supprimer des éléments HTML dynamiquement.

```javascript
// Sélectionner des éléments
const titre = document.querySelector('h1');
const cartes = document.querySelectorAll('.stat-card');
const formTicket = document.getElementById('form-ticket');

// Modifier le contenu et les styles
titre.textContent = "Tableau de Bord IT — Mis à jour";
titre.style.color = "#d4af37";

// Créer un nouvel élément dynamiquement
const nouveauTicket = document.createElement('div');
nouveauTicket.className = 'ticket-item';
nouveauTicket.innerHTML = `
    <h4>#1045 - Impression bloquée</h4>
    <span class="badge">Ouvert</span>
`;

document.getElementById('liste-tickets').appendChild(nouveauTicket);
```

---

## 2) Événements et Gestionnaires d'Événements (3h)

### 🛠️ 2.1 Rendre la Page Réactive aux Actions Utilisateur

```javascript
const btnCreer = document.getElementById('btn-creer-ticket');

btnCreer.addEventListener('click', (e) => {
    e.preventDefault(); // Empêcher le rechargement de page
    
    const inputAgent = document.getElementById('agent-name').value;
    const inputDesc = document.getElementById('ticket-desc').value;
    
    if (!inputAgent || !inputDesc) {
        alert("Veuillez remplir tous les champs !");
        return;
    }
    
    console.log(`Ticket créé par ${inputAgent} : ${inputDesc}`);
    // Ajouter à l'interface...
});
```

---

## 3) Fetch API & Async/Await : Communiquer avec le Serveur (4h)

### 📖 3.1 Chargement Dynamique sans Rechargement (AJAX moderne)

```javascript
// Récupérer la liste des tickets depuis une API REST
async function chargerTickets() {
    try {
        const response = await fetch('http://192.168.56.20/api/tickets');
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        
        const tickets = await response.json();
        afficherTickets(tickets);
    } catch (error) {
        console.error("Impossible de charger les tickets :", error);
    }
}

function afficherTickets(tickets) {
    const conteneur = document.getElementById('liste-tickets');
    conteneur.innerHTML = '';
    
    tickets.forEach(t => {
        const html = `
            <div class="card-ticket">
                <span>#${t.id}</span>
                <strong>${t.type_incident}</strong>
                <p>${t.description}</p>
                <small>${t.agent}</small>
            </div>
        `;
        conteneur.insertAdjacentHTML('beforeend', html);
    });
}

// Appeler au chargement de la page
document.addEventListener('DOMContentLoaded', chargerTickets);
```

---

## 🏋️ Exercices Pratiques & Corrigés

### Exercice : Compteur Dynamique
Écrivez une fonction JS qui incrémente le nombre de tickets ouverts affiché sur la page chaque fois qu'un utilisateur clique sur "Ajouter".
- **Corrigé** :
```javascript
let count = 14;
document.getElementById('btn-add').addEventListener('click', () => {
    count++;
    document.querySelector('.stat-number').textContent = count;
});
```

---

## ❓ Banque de Questions & Test du Jour 24

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*