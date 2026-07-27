# TOME P3-C — Jour 25 (14h)

## Découpage horaire opérationnel J25
- Backend Node.js/Express (architecture, middlewares, structure projet) — **4h**
- API REST (méthodes, statuts HTTP, validation, documentation) — **3h**
- Connexion base de données (PostgreSQL, pool, requêtes paramétrées, sécurité) — **3h**
- Mini-projet API REST CRUD complète — **2h**
- Banque de questions + suivi P1 — **2h**

---

## 1) Backend Node.js/Express — architecture, middlewares (4h)

### Objectifs d'apprentissage
- Initialiser un projet Node.js avec Express.
- Structurer un backend en couches (routes, controllers, services, models).
- Comprendre et utiliser les middlewares (logging, CORS, parsing, erreurs).
- Gérer les variables d'environnement avec dotenv.
- Lire et écrire dans des fichiers, servir des ressources statiques.

### Contenu pédagogique
Express est le framework backend le plus utilisé dans l'écosystème Node.js. Minimaliste, il délègue les fonctionnalités aux middlewares.

Points clés:
1. **Initialisation** : `npm init -y && npm install express dotenv cors morgan`. `const express = require('express'); const app = express(); app.listen(3000);`. Structure : `src/server.js` (point d'entrée), `src/routes/`, `src/controllers/`, `src/middlewares/`.
2. **Routes** : `app.get('/api/users', userController.getAll); app.post('/api/users', userController.create); app.get('/api/users/:id', userController.getById);`. Router Express : `const router = express.Router(); router.get('/', ...); module.exports = router;`. Séparation par ressource : `/routes/users.js`, `/routes/products.js`.
3. **Controllers** : reçoivent `(req, res, next)`, extraient les données de `req.params`, `req.query`, `req.body`, appellent le service métier, renvoient la réponse HTTP avec `res.status(200).json(data)`. Le controller ne contient pas de logique métier — il orchestre.
4. **Middlewares** : fonctions `(req, res, next)`. `app.use(express.json())` — parse le body JSON. `app.use(cors())` — autorise les requêtes cross-origin. `app.use(morgan('dev'))` — logging HTTP. Middleware d'erreur : `app.use((err, req, res, next) => { res.status(500).json({ error: err.message }); });` — 4 paramètres = Express le reconnaît comme middleware d'erreur.
5. **Variables d'environnement** : `require('dotenv').config();` → fichier `.env` avec `PORT=3000`, `DATABASE_URL=...`. Ne jamais commiter `.env` (`.gitignore`). `process.env.PORT`. Le fichier `.env.example` (sans valeurs secrètes) est commité pour documenter les variables attendues.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : créer un serveur Express avec une route `GET /api/health` qui retourne `{ status: 'ok', timestamp: Date.now() }`. Ajouter les middlewares `cors`, `morgan`, `express.json`. Tester avec `curl` ou Postman.
   - **Corrigé détaillé** : `const express = require('express'); const cors = require('cors'); const morgan = require('morgan'); const app = express(); app.use(cors()); app.use(morgan('dev')); app.use(express.json()); app.get('/api/health', (req, res) => { res.json({ status: 'ok', timestamp: Date.now() }); }); const PORT = process.env.PORT || 3000; app.listen(PORT, () => console.log(Serveur démarré sur le port ${PORT}));`. Tester : `curl http://localhost:3000/api/health` → `{"status":"ok","timestamp":...}`.
2. **Exercice 2 (intermédiaire)** : structurer une API "Utilisateurs" avec Router + Controller + Service (fichier séparé). Routes : GET / (tous), GET /:id (un), POST / (créer). Le service utilise un tableau en mémoire. Valider que l'email est unique en création.
   - **Corrigé détaillé** : `routes/users.js` → `router.get('/', ctrl.getAll); router.get('/:id', ctrl.getById); router.post('/', ctrl.create);`. `controllers/users.js` → appelle `userService.findAll()`, gère les erreurs. `services/users.js` → `let users = [];` + fonctions CRUD sur le tableau. Validation dans le service : `if (users.find(u => u.email === newUser.email)) throw new Error('Email déjà utilisé');`. Le contrôleur catch l'erreur → `res.status(409).json({ error: err.message })`.
3. **Exercice 3 (avancé)** : implémenter un middleware d'authentification simplifié (API key dans le header). Appliquer le middleware aux routes `/api/admin/*` via `router.use(authMiddleware)`. Logger toutes les requêtes avec durée dans un middleware custom.
   - **Corrigé détaillé** : `function authMiddleware(req, res, next) { const apiKey = req.headers['x-api-key']; if (apiKey !== process.env.ADMIN_API_KEY) return res.status(401).json({ error: 'Unauthorized' }); next(); }`. Application : `const adminRouter = express.Router(); adminRouter.use(authMiddleware); adminRouter.get('/stats', ...); app.use('/api/admin', adminRouter);`. Middleware log durée : `app.use((req, res, next) => { const start = Date.now(); res.on('finish', () => { const duration = Date.now() - start; console.log(${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms); }); next(); });`.

### Nouvelles abréviations rencontrées
- CORS | Cross-Origin Resource Sharing | Mécanisme autorisant les requêtes cross-origin dans les navigateurs | Interagit avec les APIs, la sécurité web, les middlewares Express
- CRUD | *(déjà existant)* | Create, Read, Update, Delete — opérations de base d'une API REST | Interagit avec les routes Express, les bases de données

### Banque de questions du module (15)
1. QCM: Express est... A) un framework web Node.js B) une base de données C) un langage
2. QCM: un middleware Express a la signature... A) `(req, res, next)` B) `(req, res)` C) `(data)`
3. QCM: `app.use(express.json())` parse... A) le body JSON des requêtes B) les URLs C) les cookies
4. Ouverte: différence entre un router et un controller.
5. Ouverte: pourquoi séparer le code en routes, controllers, services ?
6. Cas: `req.body` est `undefined` malgré un POST avec JSON. Problème ?
7. QCM: les variables d'environnement se stockent dans... A) `.env` B) `index.js` C) `package.json`
8. Ouverte: pourquoi ne pas commiter le fichier `.env` ?
9. Cas: middleware d'erreur avec 4 paramètres — pourquoi 4 ?
10. QCM: `res.status(201).json(data)` envoie... A) statut 201 Created + JSON B) statut 200 C) une erreur
11. Ouverte: différence entre `res.json()` et `res.send()`.
12. Cas: CORS bloque une requête depuis le frontend React. Solution ?
13. QCM: objectif du module 1 = A) créer un backend Express structuré B) écrire tout dans un fichier C) éviter Node.js
14. Ouverte: comment tester manuellement une API sans frontend ?
15. QCM: résultat attendu = A) serveur Express fonctionnel avec middlewares B) erreur 500 constante C) pas de routes

---

## 2) API REST — méthodes, statuts HTTP, validation (3h)

### Objectifs d'apprentissage
- Concevoir une API RESTful respectant les conventions (ressources, méthodes, statuts).
- Utiliser les bons codes HTTP (200, 201, 204, 400, 401, 404, 409, 422, 500).
- Valider les données entrantes côté serveur (Joi, express-validator, Zod).
- Documenter une API (OpenAPI/Swagger, README).
- Paginer, filtrer et trier les résultats.

### Contenu pédagogique
Une API REST bien conçue est prévisible et agréable à consommer. Les conventions REST sont un contrat entre le backend et le frontend.

Points clés:
1. **Conventions REST** :
   - `GET /api/users` → liste (200). `GET /api/users/:id` → détail (200 ou 404).
   - `POST /api/users` → créer (201 + body créé ou Location header). Body : les données.
   - `PUT /api/users/:id` → remplacer (200). `PATCH /api/users/:id` → modifier partiellement (200).
   - `DELETE /api/users/:id` → supprimer (204, pas de body).
   - Utiliser des noms de ressources au pluriel (`/users`, pas `/getUsers`). Pas de verbes dans l'URL.
2. **Codes HTTP** : 2xx = succès (200 OK, 201 Created, 204 No Content). 4xx = erreur client (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable Entity). 5xx = erreur serveur (500 Internal Server Error). Toujours retourner le bon code — c'est la première chose que le client regarde.
3. **Validation des données** : utiliser Zod (moderne, TypeScript-friendly) ou Joi. `const schema = z.object({ name: z.string().min(2), email: z.string().email(), age: z.number().int().min(0).max(150).optional() });`. Valider dans le middleware ou le controller : `const result = schema.safeParse(req.body); if (!result.success) return res.status(422).json({ errors: result.error.format() });`.
4. **Pagination** : `GET /api/users?page=2&limit=20`. Retourner les métadonnées dans la réponse : `{ data: [...], pagination: { page: 2, limit: 20, total: 150, pages: 8 } }`. Éviter le `SELECT *` sans LIMIT qui peut écraser la base.
5. **Documentation** : Swagger/OpenAPI avec `swagger-jsdoc` et `swagger-ui-express`. Décrire chaque route avec des commentaires JSDoc. Alternative simple : un fichier README.md avec un tableau des endpoints, paramètres, et exemples curl.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : créer un validateur Zod pour un formulaire d'inscription (name required 2-50, email required + valid, password required min 8, confirmPassword must match password). Utiliser `.refine()` pour confirmer le mot de passe.
   - **Corrigé détaillé** : `const signupSchema = z.object({ name: z.string().min(2).max(50), email: z.string().email(), password: z.string().min(8), confirmPassword: z.string() }).refine(data => data.password === data.confirmPassword, { message: 'Les mots de passe ne correspondent pas', path: ['confirmPassword'] });`. Utiliser `safeParse` pour avoir un résultat structuré, `parse` si on veut throw.
2. **Exercice 2 (intermédiaire)** : implémenter la pagination pour `GET /api/posts`. Lire `page` et `limit` depuis `req.query`, avec des valeurs par défaut (page=1, limit=10, max=100). Calculer l'offset (`(page-1)*limit`). Retourner les métadonnées pagination.
   - **Corrigé détaillé** : `const page = Math.max(1, parseInt(req.query.page) || 1); const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10)); const offset = (page - 1) * limit; const { rows, rowCount } = await db.query('SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]); const { rows: [{ total }] } = await db.query('SELECT COUNT(*) as total FROM posts'); res.json({ data: rows, pagination: { page, limit, total: parseInt(total), pages: Math.ceil(total / limit) } });`. Deux requêtes : une pour les données, une pour le total.
3. **Exercice 3 (avancé)** : documenter l'API avec Swagger. Installer `swagger-jsdoc` et `swagger-ui-express`. Écrire les annotations JSDoc pour chaque route. Afficher la doc sur `/api-docs`.
   - **Corrigé détaillé** : Configuration Swagger : `const swaggerSpec = swaggerJsDoc({ definition: { openapi: '3.0.0', info: { title: 'API Users', version: '1.0.0' }, servers: [{ url: 'http://localhost:3000' }] }, apis: ['./src/routes/*.js'] });`. Annotations JSDoc : `/** * @swagger * /api/users: *   get: *     summary: Liste tous les utilisateurs *     parameters: ... *     responses: *       200: *         description: Liste paginée */`. `app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));`.

### Nouvelles abréviations rencontrées
- OpenAPI | Spécification ouverte pour les APIs REST | Standard pour documenter les APIs (ex-Swagger) | Interagit avec Swagger UI, les générateurs de code, les tests
- REST | *(déjà existant, section D)* | Representational State Transfer — style d'architecture API | Interagit avec HTTP, les verbes, les statuts, le routing

### Banque de questions du module (15)
1. QCM: `POST /api/users` doit retourner... A) 201 Created B) 200 OK C) 500
2. QCM: `DELETE /api/users/42` (succès) retourne... A) 204 No Content B) 200 avec body C) 404
3. QCM: Zod/Joi servent à... A) valider les données entrantes B) router les requêtes C) logger
4. Ouverte: pourquoi utiliser les bons codes HTTP ?
5. Ouverte: différence entre PUT et PATCH.
6. Cas: `GET /api/users` retourne 10 000 utilisateurs. Problème et solution ?
7. QCM: les noms de ressources REST sont au... A) pluriel B) singulier C) verbe
8. Ouverte: pourquoi ne pas mettre de verbes dans les URLs REST ?
9. Cas: `POST /api/users` avec un email déjà existant. Code HTTP ?
10. QCM: Swagger/OpenAPI sert à... A) documenter l'API B) remplacer Express C) gérer la DB
11. Ouverte: intérêt d'une API documentée pour une équipe.
12. Cas: validation Zod échoue — comment renvoyer les erreurs au client ?
13. QCM: objectif du module 2 = A) concevoir une API REST propre et documentée B) ignorer les conventions C) mettre des verbes dans les URLs
14. Ouverte: comment versionner une API ?
15. QCM: résultat attendu = A) API REST paginée et validée B) routes sans validation C) pas de pagination

---

## 3) Connexion base de données — PostgreSQL (3h)

### Objectifs d'apprentissage
- Connecter Express à PostgreSQL avec le package `pg` (pool de connexions).
- Écrire des requêtes paramétrées pour éviter les injections SQL.
- Gérer les migrations de schéma (création de tables, index).
- Implémenter un pattern repository pour isoler les requêtes SQL.
- Gérer les transactions pour les opérations multi-requêtes.

### Contenu pédagogique
La base de données est le cœur de l'application. Une connexion mal gérée peut planter le serveur.

Points clés:
1. **Pool de connexions** : `const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL });`. Le pool maintient N connexions ouvertes et les réutilise — évite d'ouvrir/fermer une connexion à chaque requête. `pool.query('SELECT ...')` prend une connexion dans le pool, exécute, la rend.
2. **Requêtes paramétrées** : `await pool.query('SELECT * FROM users WHERE email = $1', [email])`. JAMAIS de concaténation : `` `SELECT * FROM users WHERE email = '${email}'` `` → injection SQL. PostgreSQL utilise `$1, $2` pour les paramètres. Pour `IN` : utiliser `ANY($1::int[])`.
3. **Migrations** : utiliser `node-pg-migrate` ou Knex. Créer les tables en versionnant les changements : `exports.up = (pgm) => { pgm.createTable('users', { id: 'id', name: { type: 'varchar(100)', notNull: true }, email: { type: 'varchar(255)', notNull: true, unique: true }, created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') } }); };`. Les migrations sont commitées dans Git.
4. **Pattern Repository** : `class UserRepository { async findAll(limit, offset) { const { rows } = await pool.query('SELECT * FROM users ORDER BY id LIMIT $1 OFFSET $2', [limit, offset]); return rows; } async findById(id) { ... } async create(data) { ... } }`. Le service métier appelle le repository — séparation SQL / logique métier.
5. **Transactions** : `const client = await pool.connect(); try { await client.query('BEGIN'); await client.query('INSERT INTO orders ...', [...]) ; await client.query('UPDATE inventory ...', [...]) ; await client.query('COMMIT'); } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }`. Garantit l'atomicité : soit tout réussit, soit rien.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : créer la table `users` avec une migration, insérer 3 utilisateurs de test, et écrire le repository `findAll` et `findById`.
   - **Corrigé détaillé** : Migration créant `users(id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, created_at TIMESTAMP DEFAULT NOW())`. `UserRepository.findAll()` → `pool.query('SELECT * FROM users ORDER BY id')`. `findById(id)` → `pool.query('SELECT * FROM users WHERE id = $1', [id])` — retourne `rows[0]` ou `null` si non trouvé.
2. **Exercice 2 (intermédiaire)** : implémenter `create` dans le repository avec gestion du conflit d'email (contrainte UNIQUE). Catch l'erreur PostgreSQL `23505` (unique_violation) et la transformer en erreur métier 409 Conflict.
   - **Corrigé détaillé** : `async create({ name, email }) { try { const { rows } = await pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email]); return rows[0]; } catch (err) { if (err.code === '23505') { throw new ConflictError('Un utilisateur avec cet email existe déjà'); } throw err; } }`. `ConflictError` est une classe custom qui étend Error. Le contrôleur catch cette erreur → `res.status(409).json(...)`.
3. **Exercice 3 (avancé)** : implémenter la création d'une commande avec transaction : insérer dans `orders`, insérer chaque ligne dans `order_items`, décrémenter le stock dans `products`. Utiliser `BEGIN/COMMIT/ROLLBACK`. Si le stock est insuffisant, rollback et erreur 422.
   - **Corrigé détaillé** : `const client = await pool.connect(); try { await client.query('BEGIN'); const order = await client.query('INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *', [userId, total]); for (const item of items) { const { rows: [{ stock: currentStock }] } = await client.query('SELECT stock FROM products WHERE id = $1 FOR UPDATE', [item.productId]); if (currentStock < item.quantity) throw new InsufficientStockError(Stock insuffisant pour le produit ${item.productId}); await client.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)', [order.rows[0].id, item.productId, item.quantity, item.price]); await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.productId]); } await client.query('COMMIT'); return order.rows[0]; } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }`. `FOR UPDATE` verrouille la ligne produit pour éviter les race conditions.

### Nouvelles abréviations rencontrées
- SQL | *(déjà existant, section E)* | Structured Query Language — utilisé ici avec PostgreSQL | Interagit avec pg, les migrations, les transactions
- ACID | *(déjà existant)* | Atomicité, Cohérence, Isolation, Durabilité — propriétés des transactions | Interagit avec BEGIN/COMMIT/ROLLBACK

### Banque de questions du module (15)
1. QCM: un pool de connexions... A) réutilise les connexions B) ouvre une connexion par requête C) est inutile
2. QCM: `$1` dans `pool.query('... WHERE id = $1', [42])` est... A) un paramètre (évite l'injection SQL) B) une variable JavaScript C) un commentaire
3. QCM: une transaction garantit... A) l'atomicité (tout ou rien) B) la vitesse C) rien
4. Ouverte: pourquoi ne jamais concaténer des valeurs utilisateur dans une requête SQL ?
5. Ouverte: intérêt du pattern Repository.
6. Cas: `INSERT` échoue avec "duplicate key value violates unique constraint". Code erreur PG ?
7. QCM: les migrations servent à... A) versionner le schéma de base de données B) migrer vers un autre langage C) sauvegarder
8. Ouverte: pourquoi utiliser `FOR UPDATE` dans une transaction ?
9. Cas: `pool.query` sans `await` — que se passe-t-il ?
10. QCM: `RETURNING *` dans un INSERT/POSTGRESQL retourne... A) la ligne insérée B) rien C) une erreur
11. Ouverte: comment gérer la perte de connexion à la base de données ?
12. Cas: deadlock détecté dans une transaction. Que faire ?
13. QCM: objectif du module 3 = A) connecter Express à PostgreSQL proprement B) éviter les bases de données C) utiliser MongoDB
14. Ouverte: comment tester les requêtes SQL sans lancer tout le serveur ?
15. QCM: résultat attendu = A) CRUD fonctionnel avec transactions B) injection SQL possible C) pas de gestion d'erreurs

---

## 4) Mini-projet API REST CRUD complète (2h)

### Objectifs d'apprentissage
- Intégrer les compétences J25 dans une API REST complète.
- Implémenter un CRUD complet (PostgreSQL + Express + validation).
- Structurer proprement le code (routes, controllers, services, repositories, middlewares).
- Tester l'API avec Postman/Thunder Client/cURL.

### Contenu pédagogique
Mini-projet "API de gestion de produits" : une API REST CRUD pour gérer un catalogue de produits.

Structure :
- `src/db.js` — pool de connexions PostgreSQL
- `src/repositories/productRepository.js` — requêtes SQL
- `src/services/productService.js` — logique métier
- `src/controllers/productController.js` — orchestration HTTP
- `src/routes/productRoutes.js` — définition des routes
- `src/middlewares/validate.js` — validation Zod
- `src/middlewares/errorHandler.js` — gestion globale des erreurs
- `src/server.js` — point d'entrée

Endpoints : `GET /api/products`, `GET /api/products/:id`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : implémenter `GET /api/products` avec pagination et `GET /api/products/:id`.
2. **Exercice 2 (intermédiaire)** : implémenter `POST /api/products` avec validation Zod (name, price>0, category) et gestion conflit.
3. **Exercice 3 (avancé)** : implémenter `PUT` et `DELETE`, ajouter un middleware de logging, et un fichier `.env.example`.

### Banque de questions du module (15)
1. QCM: le mini-projet J25 est... A) une API REST CRUD B) un frontend React C) un script Python
2. QCM: la validation Zod se fait dans... A) un middleware B) le frontend C) la base de données
3. QCM: le repository contient... A) les requêtes SQL B) les routes Express C) la validation
4. Ouverte: pourquoi structurer le backend en couches ?
5. QCM: résultat attendu = A) API CRUD testable avec Postman B) code non structuré C) pas de DB
6. QCM: `app.use('/api', productRoutes)` — préfixe ? A) toutes les routes de productRoutes commencent par /api B) rien C) erreur
7. Ouverte: comment tester le DELETE sans vraiment supprimer ?
8. QCM: objectif du module 4 = A) intégrer Express + PostgreSQL + validation B) faire un seul fichier C) éviter les APIs

---

## 5) Banque de questions + suivi P1 (2h)

### Objectifs d'apprentissage
- Valider les acquis J25. Préparer J26 (ORM + authentification + sécurité).

### Contenu pédagogique
- 60 min test mixte. 30 min correction + plan J26. 30 min portfolio.

### Banque de questions du module (15)
1. QCM: objectif final J25 = A) backend Express + PostgreSQL opérationnel B) théorie seule C) rien
2. QCM: plan J26 = A) mesurable B) flou C) optionnel
3. Ouverte: meilleure preuve J25 à montrer ?
4. QCM: preuve solide = A) repo GitHub avec API CRUD B) promesse C) un fichier
5. QCM: résultat P1 réussi = A) portfolio enrichi B) rien C) théorie
6. Ouverte: comment relier J25 au poste de développeur full-stack junior ?
7. QCM: remédiation utile = A) corriger la lacune B) recommencer C) abandonner
8. QCM: résultat attendu = A) API CRUD fonctionnelle B) code non testé C) pas de routes
9. QCM: J25 Express → J26 ORM+Auth = A) montée en puissance B) rupture C) fin
10. Ouverte: indicateur de progression J25 pertinent ?
11. QCM: un portfolio backend efficace montre... A) une API versionnée et documentée B) un seul fichier C) du CSS
12. Ouverte: comment déboguer une erreur 500 Express ?
13. QCM: objectif module 5 = A) valider et ouvrir J26 B) éviter les tests C) ignorer le portfolio
14. Ouverte: comment continuer à progresser en backend après J25 ?
15. QCM: J25 → J26 = A) GO B) STOP C) retour à P0

---

## Validation qualité J25 (anti-superficiel)

### Livrables obligatoires fin de J25
1. 1 projet Express structuré (routes, controllers, services, repositories, middlewares).
2. 1 API REST CRUD "Produits" fonctionnelle (PostgreSQL, pagination, validation).
3. 1 schéma de migration PostgreSQL (users OU products).
4. 1 exercice transaction (commande avec stock).
5. 1 preuve portfolio (lien repo GitHub) + mise à jour CV ligne Node.js/Express/SQL.

### Grille d'évaluation rapide (100 points)
- Maîtrise Express (middlewares, routes, structure) : **25 pts**
- Conception API REST (méthodes, statuts, pagination, validation) : **25 pts**
- Connexion PostgreSQL (pool, requêtes paramétrées, transactions, repository) : **30 pts**
- Qualité du mini-projet (structure, gestion d'erreurs, documentation) : **10 pts**
- Communication technique employabilité : **10 pts**

### Seuil attendu
- **>= 80/100** : J25 validé, passage normal J26.
- **65-79/100** : validé sous remédiation ciblée 24h.
- **< 65/100** : consolidation backend requise avant J26.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Express)
1. **A**
2. **A**
3. **A**
4. Router = définit les chemins (URLs) et les verbes HTTP. Controller = contient la logique de traitement de la requête (extraire les params, appeler le service, renvoyer la réponse). Le router délègue au controller.
5. Séparation des responsabilités : routes = URLs, controllers = HTTP (req/res), services = logique métier, repositories = accès données. Chaque couche est testable indépendamment, maintenable, et réutilisable.
6. Le middleware `express.json()` n'est pas utilisé. Solution : `app.use(express.json())` AVANT les routes. Sinon `req.body` reste undefined.
7. **A**
8. `.env` contient des secrets (mots de passe, clés API, tokens). S'il est commité, toute personne ayant accès au repo a ces secrets. Ajouter `.env` au `.gitignore` et fournir un `.env.example` avec des valeurs factices.
9. Express détecte qu'un middleware a 4 paramètres et le traite comme un middleware d'erreur. Il n'est appelé que quand `next(err)` est invoqué. Les middlewares à 3 paramètres `(req, res, next)` sont des middlewares normaux.
10. **A**
11. `res.json()` sérialise l'objet en JSON et définit `Content-Type: application/json`. `res.send()` infère le type selon la donnée. Toujours utiliser `res.json()` pour les APIs, c'est plus explicite.
12. Ajouter le middleware `cors()` : `app.use(cors({ origin: 'http://localhost:5173' }))` (origine du frontend). En production, restreindre à l'URL du frontend.
13. **A**
14. Postman (interface graphique), Thunder Client (extension VS Code), `curl` (ligne de commande), `httpie`. Tester chaque route avec différentes méthodes, headers, et body.
15. **A**

### B. Corrigé — Module 2 (API REST)
1. **A**
2. **A**
3. **A**
4. Les codes HTTP sont le contrat entre le client et le serveur. Un client peut réagir différemment selon le code (201 → succès création, 401 → rediriger vers login, 422 → afficher les erreurs de validation). Sans les bons codes, le client ne peut pas prendre de décision.
5. PUT = remplacement complet (tous les champs requis). PATCH = modification partielle (seuls les champs fournis sont modifiés). PUT pour le remplacement, PATCH pour les mises à jour.
6. Performance (temps de réponse, mémoire), le client reçoit trop de données. Solution : pagination (`?page=1&limit=20`). Ne jamais retourner toute la table.
7. **A**
8. Les verbes HTTP (GET, POST, PUT, DELETE) indiquent déjà l'action. `/getUsers` est redondant — `GET /users` suffit. Les URLs REST représentent des ressources (noms), pas des actions (verbes).
9. 409 Conflict — une ressource avec cet identifiant unique existe déjà. Le body doit contenir un message explicite : `{ error: 'Un utilisateur avec cet email existe déjà' }`.
10. **A**
11. Le frontend sait exactement quels endpoints appeler, les paramètres attendus, et les réponses possibles. L'onboarding de nouveaux développeurs est plus rapide. Les tests peuvent être générés automatiquement.
12. `const result = schema.safeParse(req.body); if (!result.success) { return res.status(422).json({ errors: result.error.format() }); }`. Zod retourne un objet structuré avec le chemin, le message, et le code d'erreur pour chaque champ.
13. **A**
14. Dans l'URL : `/api/v1/users`, `/api/v2/users`. Ou via le header `Accept: application/vnd.api.v2+json`. La v1 continue de fonctionner pendant que la v2 est développée.
15. **A**

### C. Corrigé — Module 3 (PostgreSQL)
1. **A**
2. **A**
3. **A**
4. Injection SQL : `SELECT * FROM users WHERE email = '${email}'`. Si `email = "'; DROP TABLE users; --"`, la requête devient `SELECT * FROM users WHERE email = ''; DROP TABLE users; --'` → la table est supprimée. Les requêtes paramétrées empêchent ça.
5. Le repository isole le code SQL du reste de l'application. Si on change de base de données (PostgreSQL → MySQL), seul le repository change. Facilite les tests (mocker le repository). Évite la dispersion de SQL dans les services.
6. `23505` (unique_violation). C'est le code PostgreSQL standard pour une violation de contrainte UNIQUE. Le catcher et le transformer en erreur métier 409.
7. **A**
8. `FOR UPDATE` verrouille la ligne sélectionnée jusqu'à la fin de la transaction. Empêche une autre transaction concurrente de modifier cette ligne entre le SELECT et l'UPDATE → évite les race conditions.
9. La fonction retourne une Promise. Sans `await`, le code continue sans attendre le résultat → la variable sera `undefined` ou une Promise non résolue. Toujours `await` les requêtes de base de données.
10. **A**
11. Le pool `pg` émet un événement `error` sur les connexions inactives. Écouter `pool.on('error', ...)` pour logger. Implémenter une retry logic (réessayer la requête après un délai). Utiliser un health check endpoint qui teste la connexion DB.
12. Le deadlock est détecté par PostgreSQL qui tue une des transactions. Attraper l'erreur (`code: '40P01'`), rollback, et réessayer la transaction (retry). Les deadlocks sont souvent dus à un ordre d'accès aux tables différent entre transactions.
13. **A**
14. Écrire des tests unitaires avec `pg-mem` (base PostgreSQL in-memory) ou une base de test dédiée. Exécuter les migrations, insérer des données de test, exécuter les requêtes, vérifier les résultats.
15. **A**

### D-E. Corrigés — Modules 4 & 5 (Mini-projet & Banque)
(Modules synthétiques — les corrigés sont intégrés dans les exercices et la banque de questions.)