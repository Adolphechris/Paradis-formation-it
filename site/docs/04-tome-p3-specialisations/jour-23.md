# TOME P3-C — Jour 23 (14h)

## Découpage horaire opérationnel J23
- JavaScript ES6+ (let/const, arrow functions, destructuring, spread/rest, template literals, classes) — **4h**
- Asynchrone (callbacks, Promises, async/await, fetch API, gestion d'erreurs) — **3h**
- DOM avancé + événements (event delegation, bubbling, custom events, manipulation) — **3h**
- Modules & bundling (ES modules, npm, package.json, Vite, import/export) — **2h**
- Labs intégrés (refactoring ES6+ + appel API + rendu DOM) — **1h**
- Banque de questions + suivi P1 — **1h**

---

## 1) JavaScript ES6+ (4h)

### Objectifs d'apprentissage
- Maîtriser les déclarations modernes (`let`, `const`) et leur portée (block scope vs function scope).
- Utiliser les arrow functions et comprendre leur comportement avec `this`.
- Appliquer le destructuring (objets, tableaux) et les opérateurs spread/rest.
- Manipuler les template literals pour des chaînes complexes.
- Comprendre les classes ES6, l'héritage, et les modules.

### Contenu pédagogique
ES6 (ECMAScript 2015) a transformé JavaScript. Tout développeur moderne doit maîtriser ces fondamentaux.

Points clés:
1. **`let` vs `const` vs `var`** : `let` et `const` ont une portée de bloc (`{}`), `var` a une portée de fonction (hoisting). `const` empêche la réassignation mais pas la mutation d'objets/tableaux. Règle : toujours utiliser `const` par défaut, `let` si la variable doit être réassignée, jamais `var`.
2. **Arrow functions** : `const add = (a, b) => a + b`. Syntaxe concise, pas de `this` propre (elles capturent le `this` du contexte englobant — lexical this). Pas adaptées comme méthodes d'objet ou constructeurs.
3. **Destructuring** : `const { nom, age } = personne` (objet), `const [premier, ...reste] = tableau` (tableau). Permet d'extraire des valeurs en une ligne, avec valeurs par défaut (`{ nom = 'Inconnu' }`).
4. **Spread (`...`) / Rest (`...`)** : Spread étale un itérable — `const merged = [...arr1, ...arr2]`, `const clone = {...obj}`. Rest capture le reste — `const [first, ...others] = arr`, `function f(a, ...args) {}`.
5. **Template literals** : `` `Bonjour ${nom}, vous avez ${age} ans` ``. Supporte le multi-lignes, l'interpolation d'expressions (`${a + b}`), et les tagged templates.
6. **Classes ES6** : sucre syntaxique au-dessus du prototypage. `class Person { constructor(nom) { this.nom = nom } saluer() { return `Salut ${this.nom}` } }`. `class Dev extends Person { ... }` avec `super()`.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : refactorer une fonction ES5 en ES6+ utilisant arrow function, destructuring, template literal, et const/let.
   - **Corrigé détaillé** : Avant : `function afficher(user) { var nom = user.nom; var age = user.age; return 'Nom: ' + nom + ', Age: ' + age; }`. Après : `const afficher = ({ nom, age }) => `Nom: ${nom}, Age: ${age}`;`. Passage de 4 lignes verbeuses à 1 ligne lisible.
2. **Exercice 2 (intermédiaire)** : écrire une fonction `fusionnerConfigs` qui prend N objets de configuration et retourne un objet fusionné. Les clés des derniers objets écrasent les premières. Utiliser spread et rest.
   - **Corrigé détaillé** : `const fusionnerConfigs = (defaut, ...overrides) => Object.assign({}, defaut, ...overrides);` ou avec spread uniquement : `const fusionnerConfigs = (defaut, ...overrides) => overrides.reduce((acc, obj) => ({ ...acc, ...obj }), { ...defaut });`. Exemple : `fusionnerConfigs({host: 'localhost', port: 3000}, {port: 8080}, {debug: true})` → `{host: 'localhost', port: 8080, debug: true}`.
3. **Exercice 3 (avancé)** : implémenter une classe `EventEmitter` qui permet d'enregistrer des listeners (`on`), de les déclencher (`emit`), et de les supprimer (`off`). Utiliser des classes ES6, pas de bibliothèque externe.
   - **Corrigé détaillé** : `class EventEmitter { constructor() { this.events = {} } on(event, listener) { if (!this.events[event]) this.events[event] = []; this.events[event].push(listener); return this; } emit(event, ...args) { (this.events[event] || []).forEach(fn => fn(...args)); return this; } off(event, listener) { if (!this.events[event]) return this; this.events[event] = this.events[event].filter(fn => fn !== listener); return this; } }`. Pattern Observable minimal, très utilisé en architecture frontend.

### Nouvelles abréviations rencontrées
- ES6/ES2015 | ECMAScript 6 / ECMAScript 2015 | Version majeure de JavaScript introduisant classes, modules, arrow functions | Interagit avec tous les frameworks modernes, Node.js, les navigateurs
- DOM | *(déjà existant, section B)* | Document Object Model — interface de manipulation des pages web | Interagit avec JavaScript, les événements, le rendu navigateur

### Banque de questions du module (15)
1. QCM: `const x = 5; x = 10;` produit... A) une erreur (reassignation interdite) B) x = 10 C) x = 5
2. QCM: une arrow function `() => this` capture... A) le `this` du contexte englobant B) un nouveau `this` C) `window`
3. QCM: `const { a, b = 2 } = { a: 1 }` → b vaut... A) 2 B) undefined C) 1
4. Ouverte: différence de portée entre `let` et `var`.
5. Ouverte: quand utiliser `const` plutôt que `let` ?
6. Cas: `const arr = [1, 2, 3]; arr.push(4);` — est-ce autorisé ? Pourquoi ?
7. QCM: `[...arr1, ...arr2]` crée... A) un nouveau tableau fusionné B) modifie arr1 C) rien
8. Ouverte: pourquoi éviter les arrow functions comme méthodes d'objet ?
9. Cas: `function f(a, ...args) { console.log(args) }; f(1, 2, 3, 4)` — affiche ?
10. QCM: une classe ES6 est... A) du sucre syntaxique sur le prototypage B) un nouveau type C) inexistante
11. Ouverte: avantage des template literals sur la concaténation classique.
12. Cas: `const { nom, age } = user` où `user = { nom: 'Alice' }`. age vaut ?
13. QCM: `super()` dans une classe enfant appelle... A) le constructeur parent B) une méthode statique C) rien
14. Ouverte: pourquoi toujours déclarer les variables avec `const` ou `let` (pas `var`) ?
15. QCM: résultat attendu du module 1 = A) maîtriser la syntaxe ES6+ moderne B) rester en ES5 C) éviter les nouveautés

---

## 2) Asynchrone — callbacks, Promises, async/await (3h)

### Objectifs d'apprentissage
- Comprendre la boucle d'événements (event loop) et le modèle asynchrone de JavaScript.
- Passer des callbacks aux Promises, puis à async/await.
- Gérer les erreurs asynchrones avec `.catch()` et `try/catch`.
- Utiliser `fetch` pour les appels API et traiter les réponses.
- Maîtriser `Promise.all`, `Promise.race`, `Promise.allSettled`.

### Contenu pédagogique
JavaScript est monothread mais asynchrone. Comprendre l'event loop est fondamental pour éviter les bugs subtils.

Points clés:
1. **Event loop** : JavaScript exécute le code synchrone d'abord, puis traite la file d'attente (microtasks : Promises, puis macrotasks : setTimeout). `console.log('A'); setTimeout(() => console.log('B'), 0); Promise.resolve().then(() => console.log('C')); console.log('D')` → A, D, C, B.
2. **Promises** : objet représentant une valeur future. États : pending → fulfilled (`.then()`) ou rejected (`.catch()`). `.then()` retourne une nouvelle Promise → chaînage. `Promise.all([p1, p2, p3])` attend que toutes soient résolues (rejette si une seule échoue). `Promise.allSettled()` attend toutes mais ne rejette jamais (récupère les statuts).
3. **Async/await** : sucre syntaxique sur les Promises. `async function getUsers() { const response = await fetch('/api/users'); const data = await response.json(); return data; }`. Le code asynchrone ressemble à du code synchrone. `try/catch` pour la gestion d'erreurs.
4. **Fetch API** : `fetch(url)` retourne une Promise. `response.ok` pour vérifier le statut (200-299). `response.json()` pour parser le JSON. `response.text()`, `.blob()`, `.formData()`. Toujours vérifier `response.ok` avant de parser — `fetch` ne rejette pas sur les erreurs HTTP (4xx, 5xx).
5. **Gestion d'erreurs asynchrones** : avec Promises : `.catch(err => console.error(err))`. Avec async/await : `try { ... } catch (err) { ... }`. Toujours gérer les erreurs — une Promise non catchée crash l'application en Node.js.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : transformer un code basé sur les callbacks (`fs.readFile`) en Promise, puis en async/await.
   - **Corrigé détaillé** : Callback : `fs.readFile('data.json', (err, data) => { if (err) throw err; console.log(JSON.parse(data)); });`. Promise : `const readFile = (path) => new Promise((resolve, reject) => fs.readFile(path, (err, data) => err ? reject(err) : resolve(data))); readFile('data.json').then(d => JSON.parse(d)).then(console.log).catch(console.error);`. Async/await : `const data = await readFile('data.json'); console.log(JSON.parse(data));`. La promisification est un pattern clé pour moderniser les APIs legacy.
2. **Exercice 2 (intermédiaire)** : écrire une fonction `fetchWithRetry(url, maxRetries = 3)` qui réessaie un appel API en cas d'échec, avec un délai exponentiel (1s, 2s, 4s). Utiliser async/await.
   - **Corrigé détaillé** : `async function fetchWithRetry(url, maxRetries = 3) { for (let i = 0; i <= maxRetries; i++) { try { const res = await fetch(url); if (!res.ok) throw new Error(HTTP ${res.status}); return await res.json(); } catch (err) { if (i === maxRetries) throw err; await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i))); } } }`. Le délai exponentiel évite de surcharger le serveur. Pattern utilisé en production pour les appels réseau instables.
3. **Exercice 3 (avancé)** : paralléliser 3 appels API indépendants (`/users`, `/posts`, `/comments`) avec `Promise.all`, puis enrichir les posts avec les noms d'utilisateurs et le nombre de commentaires. Gérer le cas où un appel échoue.
   - **Corrigé détaillé** : `const [users, posts, comments] = await Promise.all([ fetch('/users').then(r => r.json()), fetch('/posts').then(r => r.json()), fetch('/comments').then(r => r.json()) ]); const enriched = posts.map(post => ({ ...post, author: users.find(u => u.id === post.userId)?.name, commentCount: comments.filter(c => c.postId === post.id).length }));`. Les 3 appels partent en parallèle (gain de temps). Si un échoue, tout échoue → wrapper dans try/catch. Alternative : `Promise.allSettled` pour récupérer ce qui a marché.

### Nouvelles abréviations rencontrées
- API | *(déjà existant, section D)* | Application Programming Interface — ici les APIs web REST | Interagit avec fetch, les Promises, le backend
- JSON | *(déjà existant)* | Format d'échange de données — utilisé par fetch pour parser les réponses | Interagit avec les APIs REST, les bases de données, le frontend

### Banque de questions du module (15)
1. QCM: JavaScript est... A) monothread asynchrone B) multithread C) synchrone uniquement
2. QCM: une Promise représente... A) une valeur future B) une valeur immédiate C) une erreur
3. QCM: `async` devant une fonction la transforme en... A) fonction retournant une Promise B) fonction synchrone C) générateur
4. Ouverte: pourquoi `fetch` ne rejette-t-il pas sur une erreur 404 ?
5. Ouverte: différence entre `Promise.all` et `Promise.allSettled`.
6. Cas: `setTimeout(() => console.log('A'), 0); console.log('B');` — ordre d'affichage ?
7. QCM: `.then()` retourne... A) une nouvelle Promise B) la même Promise C) undefined
8. Ouverte: pourquoi utiliser async/await plutôt que `.then()` en chaîne ?
9. Cas: 3 appels API indépendants. Combien de temps avec await séquentiel vs Promise.all ?
10. QCM: `try/catch` avec async/await capture... A) les erreurs synchrones ET les rejets de Promise B) uniquement les erreurs synchrones C) rien
11. Ouverte: quel est le risque d'une Promise non catchée ?
12. Cas: `const data = await fetch(url).then(r => r.json());` — que manque-t-il ?
13. QCM: objectif du module 2 = A) maîtriser l'asynchrone JavaScript B) ignorer les Promises C) tout faire en callbacks
14. Ouverte: comment déboguer du code asynchrone ?
15. QCM: résultat attendu = A) code asynchrone propre et robuste B) callback hell C) Promises non gérées

---

## 3) DOM avancé + événements (3h)

### Objectifs d'apprentissage
- Manipuler le DOM efficacement (création, insertion, suppression, clonage).
- Utiliser l'event delegation pour gérer les événements sur des éléments dynamiques.
- Créer et dispatcher des custom events pour la communication inter-composants.
- Comprendre le bubbling, le capturing, et `stopPropagation`.
- Maîtriser `dataset`, `classList`, et `IntersectionObserver`.

### Contenu pédagogique
Le DOM est l'interface entre JavaScript et la page web. Une manipulation efficace évite les performances médiocres.

Points clés:
1. **Manipulation DOM** : `document.createElement()`, `element.appendChild()`, `element.remove()`, `element.cloneNode(true)`. `insertAdjacentHTML('beforeend', html)` est plus rapide que `innerHTML +=`. `DocumentFragment` pour les insertions groupées (évite les reflows multiples).
2. **Event delegation** : au lieu d'attacher un écouteur à chaque élément d'une liste, on l'attache au parent : `parent.addEventListener('click', e => { if (e.target.matches('.item')) { /* agir */ } })`. Fonctionne pour les éléments ajoutés dynamiquement. Indispensable pour les listes, tableaux, grilles.
3. **Custom events** : `const event = new CustomEvent('userUpdated', { detail: { id: 42, name: 'Alice' }, bubbles: true }); element.dispatchEvent(event);`. Permet de découpler les composants : le composant A émet un événement, le composant B l'écoute.
4. **Bubbling vs Capturing** : par défaut, un événement remonte du plus profond élément vers le document (bubbling). `addEventListener('click', fn, { capture: true })` l'écoute en phase de capture (du document vers l'élément). `e.stopPropagation()` arrête la propagation — à utiliser avec parcimonie.
5. **APIs DOM modernes** : `element.dataset.userId` (accéder aux `data-*`), `element.classList.toggle('active')`, `IntersectionObserver` (détecter quand un élément entre dans le viewport — lazy loading, infinite scroll).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : créer une liste `<ul>` dynamiquement à partir d'un tableau d'objets `[{nom: 'Alice', age: 30}, ...]`. Chaque `<li>` affiche le nom et un bouton "Supprimer". Utiliser l'event delegation pour gérer la suppression.
   - **Corrigé détaillé** : `const ul = document.getElementById('liste'); ul.innerHTML = users.map(u => `<li data-id="${u.id}">${u.nom} <button class="delete">X</button></li>`).join(''); ul.addEventListener('click', e => { if (e.target.classList.contains('delete')) { e.target.closest('li').remove(); } });`. Event delegation sur le `<ul>` → fonctionne même si on ajoute des `<li>` après l'initialisation.
2. **Exercice 2 (intermédiaire)** : implémenter un système de tabs (onglets) avec custom events. Quand on clique sur un onglet, un custom event `tabChanged` est émis avec l'ID du panneau à afficher. Un autre composant écoute cet événement.
   - **Corrigé détaillé** : `tabs.addEventListener('click', e => { const tab = e.target.closest('[data-tab]'); if (!tab) return; tabs.dispatchEvent(new CustomEvent('tabChanged', { detail: { tabId: tab.dataset.tab }, bubbles: true })); }); document.addEventListener('tabChanged', e => { document.querySelectorAll('.panel').forEach(p => p.hidden = p.id !== e.detail.tabId); });`. Découplage : le composant tabs ne connaît pas le composant panels.
3. **Exercice 3 (avancé)** : implémenter un infinite scroll : quand l'utilisateur arrive en bas de la page, charger 20 éléments supplémentaires via une API. Utiliser `IntersectionObserver`. Gérer l'état "loading" et "fin des données".
   - **Corrigé détaillé** : `const sentinel = document.getElementById('sentinel'); const observer = new IntersectionObserver(async (entries) => { if (entries[0].isIntersecting && !loading) { loading = true; const newItems = await fetch(`/api/items?page=${++page}&limit=20`).then(r => r.json()); if (newItems.length === 0) { observer.unobserve(sentinel); sentinel.textContent = 'Fin des données'; return; } renderItems(newItems); loading = false; } }); observer.observe(sentinel);`. IntersectionObserver est plus performant que `scroll` event (pas de calcul à chaque pixel).

### Nouvelles abréviations rencontrées
- SPA | Single Page Application | Application web monopage (navigation sans rechargement) | Interagit avec le DOM, le routing, les APIs, React/Vue/Angular

### Banque de questions du module (15)
1. QCM: l'event delegation consiste à... A) écouter sur un parent et filtrer par cible B) attacher un listener à chaque élément C) supprimer les événements
2. QCM: `e.stopPropagation()`... A) arrête la remontée de l'événement B) supprime l'élément C) empêche le comportement par défaut
3. QCM: `IntersectionObserver` sert à... A) détecter l'entrée d'un élément dans le viewport B) écouter les clics C) gérer le DOM
4. Ouverte: pourquoi utiliser un DocumentFragment pour des insertions groupées ?
5. Ouverte: différence entre bubbling et capturing.
6. Cas: une liste est générée dynamiquement après le chargement. Les clics sur les boutons ne fonctionnent pas. Pourquoi et solution ?
7. QCM: `element.dataset.userId` accède à l'attribut... A) `data-user-id` B) `userId` C) `data`
8. Ouverte: avantage des custom events pour la communication inter-composants.
9. Cas: `innerHTML += '<li>nouveau</li>'` sur une grande liste. Problème ?
10. QCM: `e.preventDefault()` empêche... A) le comportement par défaut (ex: lien) B) le bubbling C) le clic
11. Ouverte: quand utiliser `stopPropagation` est-il justifié ?
12. Cas: infinite scroll déclenche 50 appels API en 2 secondes. Pourquoi et solution ?
13. QCM: objectif du module 3 = A) manipuler le DOM efficacement et gérer les événements B) ignorer le DOM C) tout faire en jQuery
14. Ouverte: comment déboguer un problème de performance DOM ?
15. QCM: résultat attendu = A) DOM dynamique réactif B) innerHTML partout C) listeners sur chaque élément

---

## 4) Modules & bundling — ES modules, npm, Vite (2h)

### Objectifs d'apprentissage
- Organiser un projet JavaScript en modules ES (import/export).
- Utiliser npm pour gérer les dépendances (package.json, node_modules, scripts).
- Configurer un bundler moderne (Vite) pour le développement et la production.
- Comprendre le rôle de `node_modules`, `.gitignore`, et `package-lock.json`.
- Distinguer `dependencies` vs `devDependencies`.

### Contenu pédagogique
Un projet JavaScript professionnel est modulaire, versionné, et buildé. Fini le fichier unique de 5000 lignes.

Points clés:
1. **ES Modules** : `export const add = (a, b) => a + b` (named export), `export default class User {}` (default export, un seul par fichier). `import { add } from './math.js'`, `import User from './user.js'`. Les modules sont chargés en différé (`defer`), en mode strict par défaut.
2. **npm** : `npm init -y` crée `package.json`. `npm install package` ajoute dans `dependencies`. `npm install -D package` ajoute dans `devDependencies` (outils de build, tests). `node_modules/` ne doit jamais être commité (`.gitignore`). `package-lock.json` garantit des installations reproductibles.
3. **Vite** : bundler moderne, rapide (ESM natif en dev, Rollup en prod). `npm create vite@latest mon-projet -- --template vanilla` (ou react, vue). `npm run dev` (serveur de dev avec HMR), `npm run build` (production optimisée), `npm run preview` (prévisualiser la build).
4. **Structure de projet** : `src/` (code source), `public/` (assets statiques), `index.html` (point d'entrée), `vite.config.js` (configuration). Les imports utilisent des chemins relatifs : `import { helper } from '../utils/helper.js'`.
5. **Bonnes pratiques** : un module = une responsabilité. Pas d'imports circulaires (A importe B qui importe A). Utiliser des alias de chemins (`@/components/`) pour éviter `../../../`.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : créer un projet Vite vanilla, structurer en modules (un fichier `api.js` pour les appels fetch, un fichier `ui.js` pour le rendu DOM, un `main.js` point d'entrée).
   - **Corrigé détaillé** : `npm create vite@latest mon-projet -- --template vanilla`, `cd mon-projet`, `npm install`. `src/api.js` : `export async function getUsers() { const res = await fetch('https://jsonplaceholder.typicode.com/users'); return res.json(); }`. `src/ui.js` : `export function renderUsers(users) { document.getElementById('app').innerHTML = users.map(u => `<div>${u.name}</div>`).join(''); }`. `src/main.js` : `import { getUsers } from './api.js'; import { renderUsers } from './ui.js'; getUsers().then(renderUsers);`. `npm run dev` → ouvre le navigateur, l'appli est fonctionnelle.
2. **Exercice 2 (intermédiaire)** : ajouter une dépendance npm (`axios`), remplacer `fetch` par `axios`, configurer un script `npm run lint` (ESLint), et vérifier que `node_modules` est bien dans `.gitignore`.
   - **Corrigé détaillé** : `npm install axios`, puis dans `api.js` : `import axios from 'axios'; export async function getUsers() { const { data } = await axios.get('...'); return data; }`. `npm install -D eslint`, `npx eslint --init`. Ajouter `"lint": "eslint src/"` dans `package.json` → `npm run lint`. Vérifier `.gitignore` contient `node_modules/`. Commit sans `node_modules`.
3. **Exercice 3 (avancé)** : configurer Vite avec un alias `@` pointant vers `src/`, et créer un baril d'export (barrel export) dans `src/components/index.js` qui réexporte tous les composants. Vérifier que le build de production fonctionne.
   - **Corrigé détaillé** : `vite.config.js` : `export default defineConfig({ resolve: { alias: { '@': path.resolve(__dirname, 'src') } } })`. Barrel : `src/components/index.js` → `export { default as Button } from './Button.js'; export { default as Card } from './Card.js';`. Maintenant : `import { Button, Card } from '@/components';`. `npm run build` → dossier `dist/` avec fichiers optimisés. `npm run preview` → vérifier que tout fonctionne.

### Nouvelles abréviations rencontrées
- HMR | Hot Module Replacement | Remplacement de modules à chaud (rafraîchit l'appli sans recharger la page) | Interagit avec Vite, Webpack, le développement frontend
- npm | Node Package Manager | Gestionnaire de paquets JavaScript | Interagit avec Node.js, les dépendances, les scripts, le build

### Banque de questions du module (15)
1. QCM: `export default` dans un module permet... A) un seul export par défaut par fichier B) plusieurs exports C) aucun export
2. QCM: `npm install -D` installe dans... A) devDependencies B) dependencies C) global
3. QCM: Vite est un... A) bundler moderne B) framework CSS C) base de données
4. Ouverte: pourquoi ne pas commiter `node_modules` ?
5. Ouverte: différence entre `dependencies` et `devDependencies`.
6. Cas: `import { add } from './math'` ne fonctionne pas. Corriger.
7. QCM: `package-lock.json` garantit... A) des installations reproductibles B) la suppression de packages C) rien
8. Ouverte: avantage des ES modules par rapport aux scripts globaux.
9. Cas: `npm run build` échoue avec "module not found". Diagnostic ?
10. QCM: `npm run dev` dans un projet Vite lance... A) le serveur de développement B) la production C) les tests
11. Ouverte: pourquoi organiser le code en modules ?
12. Cas: import circulaire (A importe B, B importe A). Symptôme ?
13. QCM: objectif du module 4 = A) structurer un projet JS moderne B) tout dans un seul fichier C) éviter npm
14. Ouverte: comment choisir entre Vite, Webpack et autres bundlers ?
15. QCM: résultat attendu = A) projet modulaire avec build fonctionnel B) script global de 5000 lignes C) pas de package.json

---

## 5) Labs intégrés + Banque de questions + suivi P1 (2h)

### Objectifs d'apprentissage
- Intégrer les compétences J23 dans un mini-projet complet.
- Refactorer un code legacy ES5 en ES6+ modulaire avec appels API.
- Valider les acquis en format test.

### Contenu pédagogique
Mini-projet : construire un "Dashboard utilisateurs" qui :
1. Charge une liste d'utilisateurs depuis une API publique (JSONPlaceholder).
2. Affiche les utilisateurs sous forme de cards avec nom, email, ville.
3. Permet de filtrer par nom (input + event delegation).
4. Permet de supprimer un utilisateur (bouton + custom event).
5. Est structuré en modules ES (api.js, ui.js, app.js) et bundlé avec Vite.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : implémenter le chargement et l'affichage. Modules api.js et ui.js séparés.
   - **Corrigé attendu** : api.js exporte `fetchUsers()`, ui.js exporte `renderUsers(users)`, app.js importe les deux et orchestre le flux.
2. **Exercice 2 (intermédiaire)** : ajouter le filtre par nom avec event delegation et la suppression avec custom event.
   - **Corrigé attendu** : input.addEventListener('input', filterUsers). Le filtre cache/montre les cards. Bouton delete émet un custom event 'userDeleted' avec l'ID, app.js l'écoute et met à jour.
3. **Exercice 3 (avancé)** : ajouter un état loading/error, un bouton "Recharger", et déployer la build sur Vercel ou Netlify.
   - **Corrigé attendu** : try/catch dans fetchUsers, affichage d'un message d'erreur ou spinner. `npm run build` → dossier dist → déploiement.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: objectif final J23 = A) JavaScript ES6+ modulaire asynchrone B) ES5 spaghetti C) aucun livrable
2. QCM: plan J24 doit être... A) mesurable B) flou C) optionnel
3. Ouverte: meilleure preuve J23 à montrer à un recruteur ?
4. QCM: preuve solide = A) mini-projet fonctionnel + code modulaire B) promesse C) un fichier HTML
5. QCM: résultat P1 réussi = A) portfolio enrichi B) rien C) théorie seule
6. Ouverte: comment relier J23 au poste de développeur junior ?
7. QCM: remédiation utile = A) corriger la lacune précise B) recommencer C) abandonner
8. Ouverte: indicateur de progression J23 pertinent ?
9. QCM: le lab intégré J23 simule... A) un cas réel de développement frontend B) rien C) de la théorie
10. QCM: résultat attendu = A) mini-projet fonctionnel + build B) code non testé C) pas de modules
11. Ouverte: pourquoi structurer le code avant de passer à React (J24) ?
12. QCM: objectif du module 5 = A) intégrer et valider les compétences J23 B) éviter la pratique C) ignorer les labs
13. Ouverte: comment présenter ce mini-projet en entretien ?
14. QCM: résultat P1 réussi = A) mini-projet pushé sur GitHub B) rien C) code local
15. QCM: J23 → J24 = A) transition naturelle vers React B) rupture C) retour à P0

---

## Validation qualité J23 (anti-superficiel)

### Livrables obligatoires fin de J23
1. 1 projet Vite structuré en modules ES (api.js, ui.js, app.js).
2. 1 mini-projet "Dashboard utilisateurs" fonctionnel (API + affichage + filtre + suppression).
3. 1 refactoring documenté (ES5 → ES6+) d'au moins 3 patterns.
4. 1 exercice asynchrone (fetchWithRetry ou Promise.all avec enrichissement).
5. 1 preuve portfolio (lien vers le repo GitHub du mini-projet) + mise à jour CV ligne JavaScript.

### Grille d'évaluation rapide (100 points)
- Maîtrise ES6+ (let/const, arrow, destructuring, spread, classes) : **25 pts**
- Maîtrise de l'asynchrone (Promises, async/await, fetch, gestion d'erreurs) : **25 pts**
- Manipulation DOM et événements (delegation, custom events) : **20 pts**
- Modules et bundling (ES modules, npm, Vite, structure projet) : **20 pts**
- Communication technique employabilité : **10 pts**

### Seuil attendu
- **>= 80/100** : J23 validé, passage normal J24.
- **65-79/100** : validé sous remédiation ciblée 24h.
- **< 65/100** : consolidation JavaScript requise avant J24.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (ES6+)
1. **A**
2. **A**
3. **A**
4. `let` et `const` ont une portée de bloc (`{}`), `var` a une portée de fonction et est hoisté. `let`/`const` évitent les bugs de réutilisation involontaire de variables.
5. Toujours utiliser `const` par défaut. Utiliser `let` uniquement quand la variable DOIT être réassignée (ex: compteur de boucle, accumulateur). Ne jamais utiliser `var`.
6. Oui, `const` empêche la réassignation (`arr = [4,5,6]` serait interdit) mais pas la mutation (`arr.push(4)` modifie le tableau existant, c'est autorisé).
7. **A**
8. Les arrow functions n'ont pas de `this` propre — elles capturent le `this` du contexte englobant. Une méthode d'objet a besoin de son propre `this` pour accéder aux propriétés de l'objet.
9. `[2, 3, 4]` — le paramètre rest `...args` capture tous les arguments après `a` (qui vaut 1).
10. **A**
11. Multi-lignes natif, interpolation lisible (`${variable}`), pas de concaténation fastidieuse avec `+`, support des expressions (`${a + b}`).
12. `undefined` — `age` n'existe pas dans l'objet, et il n'y a pas de valeur par défaut spécifiée dans le destructuring.
13. **A**
14. `var` a un comportement de hoisting contre-intuitif et une portée de fonction qui cause des bugs (variable accessible hors du bloc prévu). `let`/`const` sont plus prévisibles et sécurisés.
15. **A**

### B. Corrigé — Module 2 (Asynchrone)
1. **A**
2. **A**
3. **A**
4. `fetch` ne rejette que sur les erreurs réseau (DNS, connexion refusée). Les erreurs HTTP (404, 500) sont des réponses valides du point de vue réseau. Il faut vérifier `response.ok` manuellement.
5. `Promise.all` rejette dès qu'une Promise échoue → tout est annulé. `Promise.allSettled` attend TOUTES les Promises, quel que soit leur résultat, et retourne un tableau avec le statut de chacune (`fulfilled` ou `rejected`).
6. `B` puis `A`. Le `setTimeout` (macrotask) est mis en file d'attente, le code synchrone (`console.log('B')`) s'exécute immédiatement. Puis la macrotask est dépilée.
7. **A**
8. async/await rend le code asynchrone lisible comme du code synchrone. Les blocs try/catch sont plus naturels que `.catch()`. Le débogage est plus simple (breakpoints fonctionnent). Évite le "Pyramid of Doom" des `.then()` imbriqués.
9. Séquentiel : t1 + t2 + t3 (ex: 3s). Promise.all : max(t1, t2, t3) (ex: 1s si toutes prennent 1s). Gain de temps proportionnel au nombre d'appels indépendants.
10. **A**
11. En Node.js, une Promise rejetée non catchée fait crasher le processus avec `UnhandledPromiseRejectionWarning`. Dans le navigateur, l'erreur est silencieuse mais l'état est incohérent.
12. La vérification de `response.ok` — si l'API retourne 404, `r.json()` échouera avec une erreur obscure. Ajouter `if (!response.ok) throw new Error(...)` avant de parser.
13. **A**
14. Utiliser `console.log` avec des labels, les DevTools (onglet Network pour voir les appels, Sources pour les breakpoints async), `async`/`await` rend le débogage plus simple que les Promises en chaîne.
15. **A**

### C. Corrigé — Module 3 (DOM)
1. **A**
2. **A**
3. **A**
4. Les modifications DOM déclenchent des reflows (recalcul de la mise en page). Un DocumentFragment est un conteneur hors-DOM : on y insère tous les éléments, puis on l'attache au DOM en une seule opération → un seul reflow au lieu de N.
5. Capturing : l'événement descend du `document` vers l'élément cible (top-down). Bubbling : l'événement remonte de l'élément cible vers le `document` (bottom-up). Par défaut, les listeners écoutent en phase bubbling.
6. Les listeners ont été attachés avant que les éléments existent. Solution : event delegation (attacher le listener au parent qui existe déjà, filtrer avec `e.target.matches()`). Ou attacher les listeners après la création.
7. **A**
8. Découplage total : l'émetteur ne connaît pas l'écouteur. Un composant peut émettre un événement, plusieurs composants peuvent l'écouter. Facilite la maintenance et les tests.
9. `innerHTML +=` reconstruit TOUT le HTML de la liste → détruit et recrée tous les éléments existants → perte des listeners, mauvaises performances. Préférer `insertAdjacentHTML` ou créer des éléments DOM.
10. **A**
11. Quand on a un handler spécifique qui doit absolument empêcher un parent de réagir (ex: un clic sur un bouton dans un élément cliquable). Mais à utiliser avec parcimonie car ça peut casser l'event delegation.
12. L'IntersectionObserver n'est pas throttlé et le callback s'exécute trop vite. Solutions : `observer.unobserve(sentinel)` pendant le chargement, puis `observer.observe(sentinel)` une fois terminé ; ou utiliser un flag `isLoading`.
13. **A**
14. Chrome DevTools → Performance tab → enregistrer une interaction → analyser les "Recalculate Style" et "Layout" (reflows). Utiliser `DocumentFragment`, éviter `innerHTML` dans les boucles, utiliser `requestAnimationFrame` pour les animations.
15. **A**

### D. Corrigé — Module 4 (Modules & bundling)
1. **A**
2. **A**
3. **A**
4. `node_modules` peut contenir des milliers de fichiers (plusieurs centaines de Mo). Il peut être régénéré exactement avec `npm install` à partir du `package.json` et `package-lock.json`. Le commiter pollue le repo Git.
5. `dependencies` = packages nécessaires en production (ex: React, axios). `devDependencies` = packages nécessaires seulement en développement (ex: Vite, ESLint, Prettier).
6. Il manque l'extension `.js` — les ES modules dans le navigateur et Vite nécessitent le chemin complet : `import { add } from './math.js'`. (Contrairement à Node.js qui résout sans extension.)
7. **A**
8. Portée isolée (pas de variables globales), dépendances explicites (on voit ce qui est importé), chargement asynchrone, tree-shaking (le bundler supprime le code non utilisé en production).
9. Vérifier le chemin d'import (extension `.js`, casse, répertoire correct), vérifier que le module existe, vérifier qu'il exporte bien ce qu'on importe.
10. **A**
11. Maintenabilité (code organisé par responsabilité), réutilisabilité (un module peut être importé partout), testabilité (tester un module isolément), collaboration (moins de conflits Git).
12. Le module se charge partiellement → `undefined` pour l'export circulaire. Symptôme : `Cannot access 'X' before initialization`. Solution : extraire la dépendance commune dans un troisième module.
13. **A**
14. Vite = moderne, rapide, idéal pour les nouveaux projets (React, Vue, vanilla). Webpack = mature, très configurable, souvent déjà en place dans les projets existants. Parcel = zero-config. Le choix dépend du projet et de l'écosystème.
15. **A**

### E. Corrigé — Module 5 (Labs + Banque + P1)
1. **A**
2. **A**
3. Le repo GitHub du mini-projet "Dashboard utilisateurs" avec README, modules ES, et build Vite.
4. **A**
5. **A**
6. JavaScript ES6+ et la structuration modulaire sont les prérequis pour tout framework (React). Un développeur junior doit pouvoir écrire du JS vanilla avant d'utiliser des frameworks.
7. **A**
8. Capacité à structurer un mini-projet en modules ES et à consommer une API REST avec async/await.
9. **A**
10. **A**
11. React est construit sur JavaScript. Comprendre ES6+, les modules, l'asynchrone, et le DOM AVANT React permet de comprendre ce que React fait sous le capot, et de déboguer efficacement.
12. **A**
13. "J'ai construit un dashboard modulaire en JavaScript vanilla qui consomme une API REST. Le code est structuré en modules ES, bundlé avec Vite, et déployé. Voici le repo."
14. **A**
15. **A**