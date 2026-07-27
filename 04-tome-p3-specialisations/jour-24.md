# TOME P3-C — Jour 24 (14h)

## Découpage horaire opérationnel J24
- React fondamentaux (JSX, composants fonctionnels, props, useState) — **4h**
- Hooks avancés (useEffect, useContext, useReducer, custom hooks) — **4h**
- Routing et formulaires (React Router, SPA, formulaires contrôlés, validation) — **2h**
- Mini-projet React (application CRUD monopage avec API) — **2h**
- Banque de questions + suivi P1 — **2h**

---

## 1) React fondamentaux — JSX, composants, props, useState (4h)

### Objectifs d'apprentissage
- Comprendre le DOM virtuel et le modèle de composants React.
- Maîtriser JSX (JavaScript XML) et la différence avec HTML.
- Créer des composants fonctionnels avec props et PropTypes.
- Gérer l'état local avec `useState`.
- Composer des interfaces à partir de composants réutilisables.

### Contenu pédagogique
React est la bibliothèque frontend la plus utilisée au monde. Son modèle de composants et son DOM virtuel ont révolutionné le développement web.

Points clés:
1. **DOM virtuel** : React maintient une copie légère du DOM en mémoire. Quand l'état change, React calcule la différence (diffing) et ne met à jour que les parties modifiées du DOM réel (reconciliation). Cela rend les interfaces réactives sans manipulation DOM manuelle.
2. **JSX** : syntaxe qui ressemble à du HTML mais qui est compilée en appels `React.createElement()`. Règles : un seul élément racine par composant (ou Fragment `<>...</>`), les attributs HTML sont en camelCase (`className`, `onClick`, `htmlFor`), les expressions JavaScript sont dans `{}`, `style` prend un objet (`style={{ color: 'red' }}`), les commentaires sont `{/* ... */}`.
3. **Composants fonctionnels** : `function Welcome({ name }) { return <h1>Bonjour {name}</h1>; }`. Les props sont en lecture seule (immutable). PropTypes pour la validation : `Welcome.propTypes = { name: PropTypes.string.isRequired };`.
4. **useState** : `const [count, setCount] = useState(0);` — `count` est la valeur actuelle, `setCount` est la fonction pour la modifier. `setCount` est asynchrone (React regroupe les mises à jour pour la performance). Pour mettre à jour basé sur l'état précédent : `setCount(prev => prev + 1)`.
5. **Composition** : les composants sont imbriqués comme des poupées russes. `App → Header + Main(Posts) + Footer`. Les données descendent via les props (one-way data flow). Un composant ne modifie jamais les props de son parent — il peut appeler une fonction passée en prop.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : créer un composant `UserCard` qui reçoit `{ name, email, avatar }` en props et affiche une carte Bootstrap/Tailwind. Utiliser PropTypes. Créer un composant `UserList` qui mappe un tableau d'utilisateurs vers `UserCard`.
   - **Corrigé détaillé** : `function UserCard({ name, email, avatar }) { return (<div className="card"><img src={avatar} alt={name} /><h3>{name}</h3><p>{email}</p></div>); } UserCard.propTypes = { name: PropTypes.string.isRequired, email: PropTypes.string.isRequired, avatar: PropTypes.string };`. `function UserList({ users }) { return (<div className="grid">{users.map(u => <UserCard key={u.id} {...u} />)}</div>); }`. La prop `key` est indispensable dans les listes (permet à React d'identifier chaque élément pour le diffing).
2. **Exercice 2 (intermédiaire)** : créer un compteur avec `useState` : boutons +, -, reset. Ajouter une validation (min 0, max 100). Afficher un message "Maximum atteint" quand on est à 100. Utiliser la forme fonctionnelle de setState.
   - **Corrigé détaillé** : `const [count, setCount] = useState(0); const increment = () => setCount(prev => Math.min(100, prev + 1)); const decrement = () => setCount(prev => Math.max(0, prev - 1));`. Affichage conditionnel : `{count === 100 && <p className="warning">Maximum atteint !</p>}`. La forme fonctionnelle garantit qu'on travaille avec l'état le plus récent, même en cas de mises à jour groupées.
3. **Exercice 3 (avancé)** : créer un composant `Accordion` réutilisable qui prend un tableau de `{ title, content }`. Un seul panneau ouvert à la fois. Gérer l'état avec `useState` (index du panneau ouvert). Accessibilité : touches clavier, aria-expanded.
   - **Corrigé détaillé** : `const [openIndex, setOpenIndex] = useState(null); const toggle = (index) => setOpenIndex(prev => prev === index ? null : index);`. Rendu : `items.map((item, i) => (<div key={i}><button aria-expanded={openIndex === i} onClick={() => toggle(i)}>{item.title}</button>{openIndex === i && <div role="region">{item.content}</div>}</div>))`. Un seul panneau ouvert car `openIndex` ne peut avoir qu'une valeur à la fois.

### Nouvelles abréviations rencontrées
- JSX | JavaScript XML | Extension syntaxique de JavaScript pour décrire l'UI React | Interagit avec React.createElement, Babel/TypeScript, le DOM virtuel
- DOM virtuel | Virtual DOM | Représentation légère du DOM en mémoire pour optimiser les mises à jour | Interagit avec React, le diffing, la reconciliation

### Banque de questions du module (15)
1. QCM: React utilise... A) un DOM virtuel pour optimiser les mises à jour B) le DOM réel directement C) jQuery
2. QCM: les props dans React sont... A) en lecture seule (immutable) B) modifiables C) optionnelles
3. QCM: `useState` retourne... A) [valeur, fonctionDeMiseÀJour] B) {valeur, miseÀJour} C) uniquement la valeur
4. Ouverte: pourquoi React a-t-il besoin de la prop `key` dans les listes ?
5. Ouverte: différence entre props et state.
6. Cas: `setCount(count + 1)` appelé 3 fois de suite. Résultat ?
7. QCM: JSX est compilé en... A) appels `React.createElement()` B) HTML pur C) CSS
8. Ouverte: avantage des composants fonctionnels par rapport aux classes.
9. Cas: un composant parent doit transmettre une fonction au composant enfant. Comment ?
10. QCM: `className` en JSX correspond à... A) `class` en HTML B) `id` C) rien
11. Ouverte: pourquoi le state doit-il être traité comme immuable ?
12. Cas: `console.log(count); setCount(count + 1); console.log(count);` — même valeur ?
13. QCM: un composant React commence par... A) une majuscule B) une minuscule C) un chiffre
14. Ouverte: comment choisir entre un composant et une simple fonction ?
15. QCM: résultat attendu du module 1 = A) créer des composants React avec state B) tout faire dans un seul composant C) éviter React

---

## 2) Hooks avancés — useEffect, useContext, useReducer, custom hooks (4h)

### Objectifs d'apprentissage
- Gérer les effets de bord avec `useEffect` (API calls, timers, event listeners).
- Partager l'état global avec `useContext` (sans Redux).
- Gérer l'état complexe avec `useReducer`.
- Créer des custom hooks pour réutiliser la logique.
- Comprendre le cycle de vie d'un composant via les hooks.

### Contenu pédagogique
Les hooks ont transformé React en rendant la logique réutilisable et les composants plus simples.

Points clés:
1. **useEffect** : `useEffect(() => { /* effet */ return () => { /* cleanup */ }; }, [dépendances])`. L'effet s'exécute après le rendu. Le cleanup s'exécute avant la prochaine exécution ou au démontage. Tableau de dépendances : `[]` = une seule fois au montage, `[dep]` = quand `dep` change, absent = à chaque rendu (⚠️ boucle infinie si on setState dedans).
2. **Cas d'usage useEffect** : appel API au montage (`useEffect(() => { fetchData(); }, [])`), abonnement à un event listener avec cleanup (`useEffect(() => { window.addEventListener('resize', handler); return () => window.removeEventListener('resize', handler); }, [])`), synchronisation avec une prop externe.
3. **useContext** : partage des données sans prop drilling. `const ThemeContext = createContext('light');`. Provider : `<ThemeContext.Provider value="dark"><App /></ThemeContext.Provider>`. Consommateur : `const theme = useContext(ThemeContext);`. Idéal pour le thème, l'auth, la langue, les préférences utilisateur.
4. **useReducer** : alternative à useState pour l'état complexe (plusieurs sous-valeurs, transitions). `const [state, dispatch] = useReducer(reducer, initialState);`. Le reducer est une fonction pure `(state, action) => newState`. Dispatch envoie une action : `dispatch({ type: 'INCREMENT', payload: 1 })`. Pattern proche de Redux, intégré nativement.
5. **Custom hooks** : fonctions qui commencent par `use` et utilisent d'autres hooks. `function useFetch(url) { const [data, setData] = useState(null); const [loading, setLoading] = useState(true); useEffect(() => { fetch(url).then(r => r.json()).then(setData).finally(() => setLoading(false)); }, [url]); return { data, loading }; }`. Réutilisable dans n'importe quel composant.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : créer un custom hook `useLocalStorage(key, initialValue)` qui persiste une valeur dans le localStorage. Utiliser useState et useEffect. Puis l'utiliser dans un composant pour stocker les préférences utilisateur (thème, langue).
   - **Corrigé détaillé** : `function useLocalStorage(key, initialValue) { const [value, setValue] = useState(() => { try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; } catch { return initialValue; } }); useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]); return [value, setValue]; }`. Utilisation : `const [theme, setTheme] = useLocalStorage('theme', 'light');`. Fonction d'initialisation lazy (passée à useState) pour ne lire le localStorage qu'une fois.
2. **Exercice 2 (intermédiaire)** : implémenter un panier d'achat avec `useReducer`. Actions : `ADD_ITEM`, `REMOVE_ITEM`, `CLEAR_CART`. Le state contient `items[]` et `total`. Afficher le nombre d'articles dans un badge. Utiliser useContext pour rendre le panier accessible partout.
   - **Corrigé détaillé** : `const cartReducer = (state, action) => { switch(action.type) { case 'ADD_ITEM': const existing = state.items.find(i => i.id === action.payload.id); if (existing) return { ...state, items: state.items.map(i => i.id === action.payload.id ? {...i, qty: i.qty + 1} : i), total: state.total + action.payload.price }; return { ...state, items: [...state.items, {...action.payload, qty: 1}], total: state.total + action.payload.price }; case 'REMOVE_ITEM': /* ... */ case 'CLEAR_CART': return { items: [], total: 0 }; default: return state; } };`. Provider : `<CartContext.Provider value={{ state, dispatch }}>`. Badge : `const { state } = useContext(CartContext); <span>{state.items.length}</span>`.
3. **Exercice 3 (avancé)** : créer un système de notifications avec `useReducer` + `useContext`. Les notifications s'auto-suppriment après 5 secondes (useEffect avec cleanup). Types : success, error, warning. Pas plus de 3 notifications simultanées (FIFO). Exposer un custom hook `useNotify()`.
   - **Corrigé détaillé** : `useNotify()` retourne `notify({ type, message })`. Reducer gère `PUSH_NOTIFICATION` et `REMOVE_NOTIFICATION`. Dans le composant NotificationProvider, `useEffect` avec setTimeout pour auto-remove après 5s. FIFO : si `state.length > 3`, supprimer la plus ancienne avant d'ajouter. `useNotify` utilise `useContext` en interne. Composants : `<NotificationProvider><App /></NotificationProvider>`, `const notify = useNotify(); notify({ type: 'success', message: 'Article ajouté !' });`.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: `useEffect(() => {...}, [])` s'exécute... A) une fois au montage B) à chaque rendu C) jamais
2. QCM: `useContext` résout le problème de... A) prop drilling B) performance C) CSS
3. QCM: `useReducer` est préférable à `useState` quand... A) l'état est complexe B) l'état est simple C) il n'y a pas d'état
4. Ouverte: à quoi sert la fonction de cleanup retournée par useEffect ?
5. Ouverte: différence entre `useState` et `useReducer`.
6. Cas: `useEffect(() => { setCount(count + 1); });` — que se passe-t-il ?
7. QCM: un custom hook doit commencer par... A) `use` B) `handle` C) rien de spécial
8. Ouverte: pourquoi extraire la logique dans un custom hook ?
9. Cas: 2 composants ont besoin du même état utilisateur. Solution ?
10. QCM: le reducer doit être... A) une fonction pure B) asynchrone C) mutable
11. Ouverte: avantage du pattern reducer (action.type) sur des setters multiples.
12. Cas: `useEffect` avec `[dep]` se déclenche au montage. Pourquoi ?
13. QCM: objectif du module 2 = A) maîtriser les hooks React avancés B) éviter les hooks C) revenir aux classes
14. Ouverte: comment déboguer un useEffect qui boucle ?
15. QCM: résultat attendu = A) composants avec logique réutilisable via hooks B) classes React partout C) pas de hooks

---

## 3) Routing et formulaires — React Router, SPA (2h)

### Objectifs d'apprentissage
- Implémenter le routing côté client avec React Router v6.
- Créer une navigation SPA (Single Page Application) avec plusieurs pages.
- Gérer les formulaires contrôlés et leur validation.
- Comprendre les URL params et les query strings.

### Contenu pédagogique
Une SPA ne recharge jamais la page — le routing simule la navigation tout en restant côté client.

Points clés:
1. **React Router v6** : `BrowserRouter` englobe l'app. `<Routes><Route path="/" element={<Home />} /><Route path="/users/:id" element={<UserDetail />} /><Route path="*" element={<NotFound />} /></Routes>`. `<Link to="/users">` pour les liens (pas de `<a href>` qui recharge). `useNavigate()` pour la navigation programmatique : `navigate('/login')`. `useParams()` pour récupérer `:id`. `useSearchParams()` pour les query strings `?page=2`.
2. **Navigation SPA** : pas de requête HTTP au serveur pour chaque page. Le routeur intercepte les changements d'URL, met à jour l'historique du navigateur (History API), et affiche le composant correspondant. Avantages : rapide (pas de rechargement complet), état préservé entre les navigations.
3. **Formulaires contrôlés** : chaque champ a un état React. `const [email, setEmail] = useState(''); <input value={email} onChange={e => setEmail(e.target.value)} />`. Validation : `const [errors, setErrors] = useState({});` puis vérifier avant soumission. Messages d'erreur conditionnels : `{errors.email && <span>{errors.email}</span>}`.
4. **Validation** : règles courantes — required, min/max length, pattern (regex), email valide. Toujours valider côté client (UX) ET côté serveur (sécurité). Bibliothèques : React Hook Form (performant, minimal), Formik (complet). Désactiver le bouton submit si formulaire invalide.
5. **Bonnes pratiques** : layout persistant (`<Header /><Outlet /><Footer />` via `Outlet` de React Router), lazy loading des pages (`React.lazy`), page 404 pour les URLs inconnues, redirection après login.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : créer une app 3 pages (Home, About, Contact) avec React Router. Navigation dans un Header commun. Page 404 custom.
   - **Corrigé détaillé** : `BrowserRouter > Routes > Route path="/" element={<Layout />} > Route index element={<Home />} + Route path="about" + Route path="contact" + Route path="*" element={<NotFound />}`. Layout utilise `<Outlet />` pour afficher la page enfant. Header avec `<NavLink>` (classe `active` automatique).
2. **Exercice 2 (intermédiaire)** : créer un formulaire d'inscription contrôlé (nom, email, mot de passe, confirmation). Validation : tous requis, email valide, mot de passe >= 8 caractères, confirmation identique. Afficher les erreurs sous chaque champ.
   - **Corrigé détaillé** : State : `const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })`. Handler : `const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })`. Validation dans `handleSubmit` → setErrors. Affichage conditionnel des messages d'erreur. Bouton désactivé si `Object.keys(errors).length > 0`.
3. **Exercice 3 (avancé)** : page "Users" avec liste + page détail `/users/:id`. Charger les données depuis une API. Ajouter un formulaire de recherche avec `useSearchParams` (query string `?q=...`). Implémenter le lazy loading de la page UserDetail.
   - **Corrigé détaillé** : `const Users = () => { const [searchParams, setSearchParams] = useSearchParams(); const q = searchParams.get('q') || ''; /* fetch users filtered by q */ }`. URL : `/users?q=john`. `const UserDetail = () => { const { id } = useParams(); /* fetch user by id */ }`. Lazy : `const UserDetail = React.lazy(() => import('./UserDetail'));` + `<Suspense fallback={<Spinner />}><UserDetail /></Suspense>`.

### Nouvelles abréviations rencontrées
- SPA | *(déjà existant)* | Single Page Application — implémentée ici avec React Router | Interagit avec le routing, l'History API, les composants React

### Banque de questions du module (15)
1. QCM: React Router permet... A) la navigation côté client sans rechargement B) les requêtes SQL C) le CSS
2. QCM: `useParams()` retourne... A) les paramètres d'URL (:id) B) les query strings C) le state
3. QCM: un formulaire contrôlé a... A) chaque champ lié à un state React B) des champs sans state C) pas de validation
4. Ouverte: différence entre `<a href>` et `<Link to>` dans React.
5. Ouverte: pourquoi valider côté client ET côté serveur ?
6. Cas: après login, l'utilisateur doit être redirigé vers le dashboard. Comment ?
7. QCM: `<Outlet />` affiche... A) le composant enfant de la route B) rien C) une erreur
8. Ouverte: avantage du lazy loading des pages.
9. Cas: `useEffect` fetch dépendant de `useParams().id`. Que mettre dans le tableau de dépendances ?
10. QCM: `useSearchParams` gère... A) les query strings (?page=2) B) les cookies C) le localStorage
11. Ouverte: comment protéger une route (rediriger si non connecté) ?
12. Cas: `navigate('/users')` après un submit réussi. Pattern ?
13. QCM: objectif du module 3 = A) implémenter routing et formulaires React B) éviter React Router C) ne pas valider
14. Ouverte: comment tester les formulaires et le routing ?
15. QCM: résultat attendu = A) SPA navigable avec formulaires validés B) une seule page C) pas de navigation

---

## 4) Mini-projet React — application CRUD (2h)

### Objectifs d'apprentissage
- Intégrer les compétences J23-J24 dans une application React complète.
- Implémenter un CRUD (Create, Read, Update, Delete) connecté à une API REST.
- Gérer les états loading, error, empty, success.
- Structurer un projet React professionnel (components, hooks, services, pages).

### Contenu pédagogique
Mini-projet "Gestion de contacts" : une application React qui permet de lister, ajouter, modifier et supprimer des contacts via une API REST (JSONPlaceholder ou backend mock).

Structure du projet :
- `src/services/api.js` — fonctions fetch (getContacts, createContact, etc.)
- `src/hooks/useContacts.js` — custom hook (state, loading, error, CRUD)
- `src/components/` — ContactList, ContactForm, ContactCard, Modal
- `src/pages/` — ContactsPage (liste + formulaire)
- Validation formulaire, feedback utilisateur (toast/snackbar), gestion d'erreurs API.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : implémenter la liste des contacts avec loading, error, empty states.
   - **Corrigé attendu** : `useContacts()` retourne `{ contacts, loading, error }`. Loading → `<Spinner />`, Error → `<Alert>Erreur: {error}</Alert>`, Empty (contacts.length === 0) → `<p>Aucun contact</p>`, Sinon → `<ContactList contacts={contacts} />`.
2. **Exercice 2 (intermédiaire)** : ajouter le formulaire de création/édition (réutiliser le même composant). Validation : nom requis, email valide, téléphone optionnel. Feedback après succès.
   - **Corrigé attendu** : `ContactForm` reçoit `initialValues` (vide pour création, pré-rempli pour édition). `onSubmit` → POST ou PUT. Après succès : toast "Contact créé !", reset du formulaire, rafraîchissement de la liste.
3. **Exercice 3 (avancé)** : ajouter la confirmation avant suppression (Modal), le filtrage par nom, et le déploiement sur Vercel.
   - **Corrigé attendu** : Modal : "Êtes-vous sûr de vouloir supprimer {name} ?" avec boutons Annuler/Confirmer. Filtre : `const [filter, setFilter] = useState(''); const filtered = contacts.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));`. Déploiement : `npm run build` → dossier `dist` → Vercel.

### Nouvelles abréviations rencontrées
- CRUD | *(déjà existant, section E)* | Create, Read, Update, Delete — opérations de base applicatives | Interagit avec les APIs REST, les formulaires, les bases de données

### Banque de questions du module (15)
1. QCM: CRUD signifie... A) Create, Read, Update, Delete B) Compile, Run, Upload, Deploy C) rien
2. QCM: un custom hook `useContacts` encapsule... A) la logique métier (API, state) B) le CSS C) le routing
3. QCM: l'état `loading` est utile pour... A) afficher un spinner B) cacher les erreurs C) rien
4. Ouverte: pourquoi séparer `api.js` (services) des composants React ?
5. Ouverte: comment gérer une erreur API dans le composant ?
6. Cas: après un POST réussi, la liste n'est pas mise à jour. Solution ?
7. QCM: un modal de confirmation avant suppression améliore... A) l'UX (évite les suppressions accidentelles) B) la performance C) le SEO
8. Ouverte: pourquoi réutiliser le même composant Formulaire pour création et édition ?
9. Cas: `useEffect` pour charger les contacts au montage. Dépendances ?
10. QCM: objectif du module 4 = A) construire une app CRUD React complète B) faire un seul composant C) éviter les APIs
11. Ouverte: comment structurer un projet React de taille moyenne ?
12. QCM: résultat attendu = A) app CRUD fonctionnelle avec gestion d'états B) code spaghetti C) pas de validation
13. Ouverte: comment présenter ce mini-projet en entretien ?
14. QCM: résultat P1 réussi = A) mini-projet pushé sur GitHub B) rien C) code local
15. QCM: J24 → J25 = A) transition vers le backend Node.js B) retour au JS vanilla C) fin du programme

---

## 5) Banque de questions + suivi P1 (2h)

### Objectifs d'apprentissage
- Valider les acquis J24 en format test.
- Transformer J24 en preuve employable.

### Contenu pédagogique
- 60 min test mixte J24 (React).
- 30 min correction + plan J25 (Backend Node.js/Express).
- 30 min mise à jour portfolio.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : rédiger une ligne CV intégrant React.
   - **Corrigé** : "Développement d'applications React (hooks, context, React Router) avec état global et connexion API REST."
2. **Exercice 2 (intermédiaire)** : pitch 60s "Pourquoi React est le standard du frontend moderne".
   - **Corrigé** : Composants réutilisables, DOM virtuel performant, écosystème riche, unidirectional data flow prévisible, hooks pour la logique.
3. **Exercice 3 (avancé)** : plan J25 — "Installer Node.js/Express, créer un projet backend, écrire une première route GET /api/health."

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: objectif final J24 = A) React opérationnel B) théorie seule C) rien
2. QCM: plan J25 = A) mesurable B) flou C) optionnel
3. Ouverte: meilleure preuve React à montrer ?
4. QCM: preuve solide = A) app CRUD React + repo GitHub B) promesse C) un composant
5. QCM: résultat P1 réussi = A) portfolio enrichi B) rien C) théorie
6. Ouverte: comment relier J24 au poste de développeur junior ?
7. QCM: remédiation utile = A) corriger la lacune B) recommencer C) abandonner
8. QCM: résultat attendu = A) app React fonctionnelle B) code non testé C) pas de composants
9. QCM: React → Express (J25) = A) du frontend vers le backend B) rupture C) fin
10. Ouverte: indicateur de progression J24 pertinent ?
11. QCM: un portfolio React efficace montre... A) des composants réutilisables B) un seul fichier C) du CSS inline
12. Ouverte: comment déboguer un bug de state React ?
13. QCM: objectif du module 5 = A) valider et célébrer J24 B) éviter les tests C) ignorer le portfolio
14. Ouverte: comment continuer à progresser en React après J24 ?
15. QCM: J24 → J25 = A) GO pour le backend B) STOP C) retour à P0

---

## Validation qualité J24 (anti-superficiel)

### Livrables obligatoires fin de J24
1. 1 projet React structuré (components, hooks, services, pages).
2. 1 app CRUD "Gestion de contacts" fonctionnelle (liste, ajout, modification, suppression).
3. 3 custom hooks documentés (useLocalStorage OU useFetch, useContacts, useNotify OU useCart).
4. 1 exercice useReducer (panier ou notifications).
5. 1 preuve portfolio (lien repo GitHub) + mise à jour CV ligne React.

### Grille d'évaluation rapide (100 points)
- Maîtrise des fondamentaux React (JSX, composants, props, useState) : **25 pts**
- Maîtrise des hooks avancés (useEffect, useContext, useReducer, custom hooks) : **30 pts**
- Routing et formulaires (React Router, validation, SPA) : **20 pts**
- Qualité du mini-projet (structure, états, UX, code) : **15 pts**
- Communication technique employabilité : **10 pts**

### Seuil attendu
- **>= 80/100** : J24 validé, passage normal J25.
- **65-79/100** : validé sous remédiation ciblée 24h.
- **< 65/100** : consolidation React requise avant J25.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (React fondamentaux)
1. **A**
2. **A**
3. **A**
4. La prop `key` permet à React d'identifier chaque élément d'une liste de façon stable entre les rendus. Sans `key`, React ne sait pas quel élément a changé et peut tout re-rendre. La `key` doit être unique et stable (pas l'index du tableau si la liste peut être réordonnée).
5. Props = données passées du parent à l'enfant (lecture seule, immutable). State = données internes au composant (modifiables via setState). Les props descendent, le state est local.
6. `count` n'augmente que de 1. `setCount` est asynchrone — les 3 appels utilisent tous la même valeur de `count` (stale closure). Solution : `setCount(prev => prev + 1)` × 3 → augmente de 3.
7. **A**
8. Plus simples (moins de code), hooks vs lifecycle methods, pas de `this`, meilleure performance (pas d'instanciation de classe), tree-shaking plus efficace.
9. Passer la fonction en prop : `<Enfant onAction={maFonction} />`. L'enfant l'appelle : `props.onAction()`.
10. **A**
11. React détecte les changements par référence (`===`). Si on mute un objet/tableau sans créer une nouvelle référence, React ne re-rend pas le composant. Toujours créer une nouvelle copie (`[...arr]`, `{...obj}`).
12. Oui, les deux affichent la même valeur car `setCount` est asynchrone — le state n'est pas mis à jour immédiatement. Pour voir la nouvelle valeur, utiliser `useEffect([count])`.
13. **A**
14. Un composant React si on a besoin de state, d'effets, ou de rendu JSX. Une simple fonction JavaScript si c'est de la logique pure sans rendu (utils, helpers, calculs).
15. **A**

### B. Corrigé — Module 2 (Hooks avancés)
1. **A**
2. **A**
3. **A**
4. La fonction de cleanup est exécutée avant que l'effet ne soit ré-exécuté (si dépendances changent) ou quand le composant est démonté. Elle sert à nettoyer les ressources : annuler un timer (`clearTimeout`), retirer un event listener, annuler une requête fetch (AbortController).
5. `useState` = état simple, setter direct. `useReducer` = état complexe, dispatch d'actions. useReducer est préférable quand l'état a des transitions complexes, dépend de l'état précédent, ou quand plusieurs sous-valeurs changent ensemble.
6. Boucle infinie : l'effet se déclenche à chaque rendu, modifie le state (setCount), ce qui déclenche un nouveau rendu, etc. Il manque le tableau de dépendances `[]`.
7. **A**
8. Réutilisabilité (même logique dans plusieurs composants), testabilité (tester le hook isolément), séparation des responsabilités (le composant gère l'UI, le hook gère la logique).
9. Remonter l'état dans le parent commun (lifting state up) ou utiliser `useContext` pour partager l'état sans prop drilling.
10. **A**
11. Toutes les transitions d'état sont centralisées dans le reducer → facile à déboguer (un seul point d'entrée), facile à tester (fonction pure), actions explicites (on sait exactement ce qui peut arriver à l'état).
12. Au montage, toutes les dépendances passent de "non définies" à leur valeur initiale → le tableau a changé. Pour éviter l'exécution au montage, utiliser un flag (`useRef`) ou vérifier si c'est la première exécution.
13. **A**
14. Vérifier le tableau de dépendances (manquant ?), ajouter un `console.log` dans l'effet et dans le cleanup, utiliser React DevTools pour inspecter les re-renders, vérifier que l'effet ne modifie pas une dépendance listée.
15. **A**

### C. Corrigé — Module 3 (Routing & formulaires)
1. **A**
2. **A**
3. **A**
4. `<a href>` déclenche un rechargement complet de la page (requête HTTP). `<Link to>` utilise l'History API pour changer l'URL sans recharger → navigation instantanée, état préservé.
5. Côté client = UX (feedback immédiat, pas d'aller-retour serveur). Côté serveur = sécurité (le client peut contourner la validation JS, ne jamais faire confiance aux données entrantes).
6. `const navigate = useNavigate();` puis après login réussi : `navigate('/dashboard');`. Ou `<Navigate to="/dashboard" />` si conditionnel dans le JSX.
7. **A**
8. L'utilisateur ne télécharge que le code de la page qu'il visite → chargement initial plus rapide, meilleure performance sur mobile. Idéal pour les grosses applications avec beaucoup de pages.
9. `[id]` — l'effet doit se relancer quand l'ID change. Si on utilise aussi `fetchUrl` qui dépend de l'ID, l'ID seul suffit.
10. **A**
11. Créer un composant `<ProtectedRoute>` qui vérifie si l'utilisateur est connecté (contexte auth). Si oui → `<Outlet />`, si non → `<Navigate to="/login" />`.
12. Pattern "Post/Redirect/Get" (PRG) : après un POST réussi, on redirige vers la page de liste pour éviter la re-soumission si l'utilisateur rafraîchit la page.
13. **A**
14. Tests unitaires : tester la validation du formulaire. Tests d'intégration : tester la navigation avec React Router (MemoryRouter). Tests E2E : Cypress ou Playwright pour tester le flux complet.
15. **A**

### D. Corrigé — Module 4 (Mini-projet CRUD)
1. **A**
2. **A**
3. **A**
4. Séparation des responsabilités : le service API ne sait rien de React, il pourrait être utilisé par Vue, Angular, ou Node.js. Les composants React ne savent pas comment les données sont fetchées. Facilite les tests (mocker le service).
5. Try/catch dans le handler, stocker l'erreur dans le state (`setError(err.message)`), afficher un message utilisateur (pas le stack trace technique). Logger l'erreur complète dans la console pour le debug.
6. Après le POST réussi, soit refetch la liste (`fetchContacts()`), soit ajouter le nouveau contact dans le state local (optimiste). La refetch est plus simple et garantit la cohérence avec le serveur.
7. **A**
8. DRY (Don't Repeat Yourself) : le formulaire de création et d'édition ont la même structure. Leur différencier par `initialValues` (vide pour création, pré-rempli pour édition) et le `onSubmit` (POST vs PUT).
9. `[]` — tableau vide pour ne charger qu'une fois au montage. Mais si le composant est démonté/remonté (navigation), l'effet se relancera.
10. **A**
11. `src/components/` (composants réutilisables), `src/pages/` (pages = composants de route), `src/hooks/` (custom hooks), `src/services/` (appels API), `src/contexts/` (providers React Context), `src/utils/` (fonctions pures). Un fichier = une responsabilité.
12. **A**
13. "J'ai construit une application React CRUD avec hooks, contexte, routing et gestion d'états (loading/error/success). Le code est modulaire et connecté à une API REST. Voici le repo avec un README et la démo en ligne."
14. **A**
15. **A**

### E. Corrigé — Module 5 (Banque + P1)
1. **A**
2. **A**
3. L'app CRUD React avec un README clair, un lien vers la démo, et le code source bien structuré.
4. **A**
5. **A**
6. React est la compétence frontend la plus demandée. Un développeur junior qui sait construire une app CRUD React complète est immédiatement productif en entreprise.
7. **A**
8. **A**
9. **A**
10. Capacité à construire une app CRUD React fonctionnelle de A à Z en une journée.
11. **A**
12. React DevTools (inspecter le state, les props, les re-renders), `console.log` dans le render, vérifier les tableaux de dépendances des hooks, utiliser `useEffect` pour loguer les changements de state.
13. **A**
14. Projets personnels (refaire l'app CRUD avec une vraie API, ajouter l'authentification), documentation React officielle, veille (React conférences, blog), apprentissage de Next.js (framework React).