# TOME P3-C — Jour 26 (14h)

## Découpage horaire opérationnel J26
- ORM — Prisma (schéma, migrations, relations, querying) — **4h**
- Authentification (JWT, bcrypt, refresh tokens, sessions vs tokens) — **3h**
- Sécurité applicative (OWASP Top 10, CORS, Helmet, rate-limiting, validation) — **3h**
- Labs intégrés (API sécurisée avec auth + ORM + DB) — **2h**
- Banque de questions + suivi P1 — **2h**

---

## 1) ORM — Prisma (4h)

### Objectifs d'apprentissage
- Modéliser une base de données avec le schéma Prisma.
- Générer et exécuter des migrations.
- Utiliser le client Prisma pour les opérations CRUD.
- Maîtriser les relations (1-1, 1-N, N-N) et les requêtes imbriquées.
- Optimiser les requêtes (select, include, transactions interactives).

### Contenu pédagogique
Prisma est l'ORM moderne pour Node.js/TypeScript. Il remplace les requêtes SQL brutes par une API type-safe et génère automatiquement les types.

Points clés:
1. **Schéma Prisma** (`schema.prisma`) : définit les modèles (tables), les colonnes, les relations, et la source de données. `model User { id Int @id @default(autoincrement()) email String @unique name String posts Post[] } model Post { id Int @id @default(autoincrement()) title String content String? author User @relation(fields: [authorId], references: [id]) authorId Int }`. `datasource db { provider = "postgresql" url = env("DATABASE_URL") }`.
2. **Migrations** : `npx prisma migrate dev --name init` crée les tables en base. `npx prisma migrate dev --name add_user_role` pour les changements. `npx prisma migrate status` pour voir l'historique. Les migrations sont dans `prisma/migrations/` et doivent être commitées.
3. **Client Prisma** : `import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient();`. CRUD : `prisma.user.findMany()`, `prisma.user.findUnique({ where: { id } })`, `prisma.user.create({ data: { ... } })`, `prisma.user.update({ where: { id }, data: { ... } })`, `prisma.user.delete({ where: { id } })`. Tout est type-safe — l'IDE autocomplète les champs.
4. **Requêtes imbriquées** : `include` pour charger les relations (JOIN). `prisma.user.findMany({ include: { posts: true } })` → chaque user a son tableau de posts. `select` pour ne prendre que certains champs : `prisma.user.findMany({ select: { id: true, email: true } })`. Filtres : `where: { email: { contains: '@gmail.com' } }`. Pagination : `skip` et `take`.
5. **Transactions interactives** : `prisma.$transaction(async (tx) => { const user = await tx.user.create({ data: { ... } }); await tx.post.create({ data: { ... } }); return user; })`. Tout est exécuté dans une transaction PostgreSQL. Plus simple qu'avec `pg` brut.
6. **Prisma Studio** : `npx prisma studio` → interface web pour visualiser et éditer les données. Idéal en développement. `prisma generate` régénère le client après modification du schéma.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : créer le schéma Prisma pour un blog (User, Post, Comment). Relations : User 1-N Post, Post 1-N Comment. Générer la migration et créer 3 utilisateurs avec des posts via Prisma Studio + client.
   - **Corrigé détaillé** : `model User { id Int @id @default(autoincrement()) email String @unique name String posts Post[] comments Comment[] } model Post { id Int @id @default(autoincrement()) title String content String author User @relation(...) authorId Int comments Comment[] } model Comment { id Int @id @default(autoincrement()) text String post Post @relation(...) postId Int author User @relation(...) authorId Int }`. Migration : `npx prisma migrate dev --name init_blog`. Créer via client : `await prisma.user.create({ data: { name: 'Alice', email: 'alice@test.com', posts: { create: [{ title: 'Mon premier post', content: 'Contenu...' }] } } });`. L'écriture imbriquée crée le user ET son post en une opération.
2. **Exercice 2 (intermédiaire)** : écrire une requête qui liste les 10 derniers posts avec leur auteur (include) et le nombre de commentaires (include + count). Paginer avec `skip`/`take`. Trier par date décroissante.
   - **Corrigé détaillé** : `const posts = await prisma.post.findMany({ include: { author: { select: { id: true, name: true } }, _count: { select: { comments: true } } }, orderBy: { createdAt: 'desc' }, take: 10, skip: (page - 1) * 10 });`. `_count` est une fonctionnalité Prisma qui ajoute le nombre de relations sans charger toutes les données. Résultat : chaque post a `author: { id, name }` et `_count: { comments: 5 }`.
3. **Exercice 3 (avancé)** : implémenter la suppression d'un utilisateur avec toutes ses données (cascade). Utiliser une transaction interactive Prisma. Supprimer ses commentaires, ses posts, puis l'utilisateur. Gérer le cas où l'utilisateur n'existe pas.
   - **Corrigé détaillé** : `await prisma.$transaction(async (tx) => { const user = await tx.user.findUnique({ where: { id } }); if (!user) throw new NotFoundError('Utilisateur introuvable'); await tx.comment.deleteMany({ where: { authorId: id } }); await tx.post.deleteMany({ where: { authorId: id } }); await tx.user.delete({ where: { id } }); return user; });`. Alternative : définir `onDelete: Cascade` dans le schéma Prisma et supprimer directement l'utilisateur. La transaction garantit l'atomicité.

### Nouvelles abréviations rencontrées
- ORM | *(déjà existant, section E)* | Object-Relational Mapping — Prisma est l'ORM utilisé | Interagit avec PostgreSQL, les migrations, le client Prisma

### Banque de questions du module (15)
1. QCM: Prisma est... A) un ORM pour Node.js B) une base de données C) un framework frontend
2. QCM: le schéma Prisma définit... A) les modèles et leurs relations B) les routes Express C) les composants React
3. QCM: `prisma migrate dev` crée... A) les tables en base de données B) le frontend C) les tests
4. Ouverte: avantage de Prisma par rapport aux requêtes SQL brutes.
5. Ouverte: différence entre `include` et `select` dans les requêtes Prisma.
6. Cas: `prisma.user.findUnique({ where: { id: 999 } })` — que retourne cette requête si l'ID n'existe pas ?
7. QCM: `onDelete: Cascade` dans le schéma Prisma... A) supprime les enregistrements liés automatiquement B) ne fait rien C) crée un index
8. Ouverte: pourquoi utiliser `$transaction` plutôt que des appels séparés ?
9. Cas: `npx prisma migrate dev` échoue avec "drift detected". Que faire ?
10. QCM: Prisma Studio est... A) une interface web pour visualiser les données B) un IDE C) un plugin
11. Ouverte: comment optimiser une requête qui charge trop de données avec `include` ?
12. Cas: relation N-N entre `Post` et `Category`. Comment la modéliser dans Prisma ?
13. QCM: objectif du module 1 = A) maîtriser Prisma pour les opérations CRUD B) éviter les ORM C) écrire du SQL brut
14. Ouverte: comment versionner le schéma de base de données avec Prisma ?
15. QCM: résultat attendu = A) modèles Prisma + migrations + CRUD typesafe B) schéma non migré C) pas de relations

---

## 2) Authentification — JWT, bcrypt, refresh tokens (3h)

### Objectifs d'apprentissage
- Hasher les mots de passe avec bcrypt.
- Émettre et vérifier des JSON Web Tokens (JWT).
- Implémenter un flux d'authentification complet (register, login, refresh, logout).
- Distinguer access token (court) et refresh token (long).
- Protéger les routes avec un middleware d'authentification.

### Contenu pédagogique
L'authentification est la fonctionnalité la plus critique d'une API. Une erreur ici compromet toute l'application.

Points clés:
1. **Bcrypt** : ne jamais stocker les mots de passe en clair. `const hash = await bcrypt.hash(password, 10);` (10 = salt rounds). `const match = await bcrypt.compare(password, hash);` → true/false. Bcrypt est lent volontairement pour ralentir les attaques brute force.
2. **JWT (JSON Web Token)** : token signé contenant des claims (userId, role). Structure : `header.payload.signature`. `const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });`. `const decoded = jwt.verify(token, process.env.JWT_SECRET);`. Le secret NE DOIT JAMAIS être commité.
3. **Flux d'authentification** : Register → hash password → store user → return tokens. Login → verify password → generate access token (15 min) + refresh token (7 jours). Access token dans le header `Authorization: Bearer <token>`. Refresh token en cookie httpOnly (sécurisé contre XSS). Logout → supprimer le refresh token côté serveur (blacklist ou DB).
4. **Middleware d'authentification** : `function authMiddleware(req, res, next) { const token = req.headers.authorization?.split(' ')[1]; if (!token) return res.status(401).json({ error: 'Token manquant' }); try { const decoded = jwt.verify(token, process.env.JWT_SECRET); req.user = decoded; next(); } catch (err) { return res.status(401).json({ error: 'Token invalide ou expiré' }); } }`. Protéger les routes : `router.use(authMiddleware);`.
5. **Refresh token** : quand l'access token expire (401), le frontend appelle `POST /api/auth/refresh` avec le refresh token. Le serveur vérifie le refresh, émet un nouvel access token. Si le refresh est expiré ou révoqué → rediriger vers login. Rotation des refresh tokens : à chaque refresh, émettre un nouveau refresh token et invalider l'ancien (protection contre le vol).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : implémenter `POST /api/auth/register` et `POST /api/auth/login`. Register : valider email unique, hasher le mot de passe, créer l'utilisateur, retourner un JWT. Login : vérifier l'email, comparer le mot de passe, retourner un JWT.
   - **Corrigé détaillé** : Register : `const hash = await bcrypt.hash(password, 10); const user = await prisma.user.create({ data: { email, password: hash, name } }); const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' }); res.status(201).json({ user: { id: user.id, email: user.email }, token });`. Login : `const user = await prisma.user.findUnique({ where: { email } }); if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' }); const match = await bcrypt.compare(password, user.password); if (!match) return res.status(401).json(...); // même message pour ne pas indiquer si l'email existe.`.
2. **Exercice 2 (intermédiaire)** : ajouter le refresh token. Stocker le refresh token en base (table `RefreshToken`) avec userId, token, expiresAt. À chaque login, émettre access token (15 min) + refresh token (7 jours, stocké en cookie httpOnly). Implémenter `POST /api/auth/refresh`.
   - **Corrigé détaillé** : `const refreshToken = crypto.randomBytes(40).toString('hex'); await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7*24*60*60*1000) } }); res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7*24*60*60*1000 });`. Refresh endpoint : vérifier le cookie, trouver le token en base, vérifier expiration, émettre un nouvel access token + nouveau refresh token (rotation), supprimer l'ancien refresh token.
3. **Exercice 3 (avancé)** : implémenter la déconnexion (logout) et la protection contre la réutilisation de refresh token (reuse detection). Si un refresh token déjà utilisé est présenté → supprimer TOUS les refresh tokens de l'utilisateur (forcer la reconnexion partout).
   - **Corrigé détaillé** : Logout : supprimer le refresh token de la base, effacer le cookie. Reuse detection : quand un refresh token est présenté, le marquer comme `used`. Si un refresh token déjà `used` est présenté → c'est du vol de token. Supprimer tous les refresh tokens de cet utilisateur → l'attaquant ET l'utilisateur légitime sont déconnectés. L'utilisateur doit se reconnecter.

### Nouvelles abréviations rencontrées
- JWT | JSON Web Token | Token d'authentification signé contenant des claims | Interagit avec bcrypt, les middlewares, les cookies httpOnly
- XSS | *(déjà existant, section G)* | Cross-Site Scripting — les cookies httpOnly protègent contre le vol de token via XSS | Interagit avec les cookies, la sécurité, le frontend

### Banque de questions du module (15)
1. QCM: bcrypt sert à... A) hasher les mots de passe B) chiffrer les données C) générer des tokens
2. QCM: JWT contient... A) header, payload, signature B) uniquement un ID C) le mot de passe
3. QCM: un access token JWT a une durée de vie... A) courte (15 min) B) illimitée C) de plusieurs jours
4. Ouverte: pourquoi ne jamais stocker les mots de passe en clair ?
5. Ouverte: différence entre access token et refresh token.
6. Cas: le frontend reçoit un 401. Que doit-il faire ?
7. QCM: un cookie httpOnly est... A) inaccessible via JavaScript B) visible dans le localStorage C) envoyé uniquement en HTTP
8. Ouverte: pourquoi faire une rotation des refresh tokens ?
9. Cas: `jwt.verify` lève une erreur "jwt expired". Code HTTP à retourner ?
10. QCM: le middleware d'authentification attache les infos utilisateur à... A) `req.user` B) `res.locals` C) `req.body`
11. Ouverte: comment stocker le JWT côté frontend de façon sécurisée ?
12. Cas: même message d'erreur pour "email incorrect" et "mot de passe incorrect". Pourquoi ?
13. QCM: objectif du module 2 = A) implémenter un flux d'authentification complet B) ignorer la sécurité C) stocker les mots de passe en clair
14. Ouverte: comment tester les flux d'authentification ?
15. QCM: résultat attendu = A) auth JWT + refresh tokens + sécurité B) mots de passe en clair C) pas de tokens

---

## 3) Sécurité applicative — OWASP, Helmet, rate-limiting (3h)

### Objectifs d'apprentissage
- Connaître le Top 10 OWASP et les contremesures associées.
- Configurer Helmet pour sécuriser les headers HTTP.
- Mettre en place un rate-limiting pour prévenir le brute force.
- Valider TOUTES les entrées utilisateur côté serveur.
- Comprendre CORS, CSP, et les attaques courantes (XSS, CSRF, injection).

### Contenu pédagogique
La sécurité n'est pas optionnelle. Un développeur backend doit connaître les menaces et les parades.

Points clés:
1. **OWASP Top 10 (résumé)** : (1) Broken Access Control → middleware auth + rôles. (2) Cryptographic Failures → bcrypt, HTTPS, pas de secrets dans le code. (3) Injection → requêtes paramétrées, validation Zod. (4) Insecure Design → threat modeling, security by design. (5) Security Misconfiguration → Helmet, désactiver les headers inutiles. (6) Vulnerable Components → `npm audit`, mettre à jour. (7) Auth Failures → JWT, bcrypt, rate-limiting. (8) Software & Data Integrity → vérifier les signatures. (9) Logging & Monitoring → morgan, Winston, alerts. (10) SSRF → valider les URLs côté serveur.
2. **Helmet** : `const helmet = require('helmet'); app.use(helmet());` → sécurise 11 headers HTTP en un appel. Protège contre : clickjacking (`X-Frame-Options`), sniffing MIME (`X-Content-Type-Options`), XSS réfléchi (`X-XSS-Protection`), et définit une CSP (Content Security Policy). En développement, ajuster la CSP pour autoriser les sources locales.
3. **Rate limiting** : `const rateLimit = require('express-rate-limit'); const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Trop de tentatives, réessayez dans 15 minutes' }); app.use('/api/auth/login', loginLimiter);`. Protège contre le brute force. Stockage en mémoire (développement) ou Redis (production multi-instances).
4. **CORS** : `app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));`. En production, restreindre à l'URL du frontend. Jamais `origin: '*'` avec `credentials: true`.
5. **CSRF (Cross-Site Request Forgery)** : les tokens JWT dans le header `Authorization` sont immunisés contre CSRF (pas de cookie automatique). Si on utilise des cookies pour l'auth, implémenter un token CSRF (double submit cookie pattern).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : ajouter Helmet, CORS (origin spécifique), et un rate limiter sur les routes d'authentification. Vérifier les headers de réponse avec les DevTools.
   - **Corrigé détaillé** : `app.use(helmet()); app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' })); const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 10 }); app.use('/api/auth/', authLimiter);`. Vérifier avec `curl -I http://localhost:3000/api/health` → headers `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, etc.
2. **Exercice 2 (intermédiaire)** : auditer une API existante pour les vulnérabilités OWASP : vérifier que toutes les routes sensibles ont le middleware auth, que toutes les entrées sont validées avec Zod, qu'il n'y a pas de secrets dans le code, que les erreurs ne leakent pas de stack traces.
   - **Corrigé détaillé** : Checklist : ✅ Toutes les routes `/api/admin` protégées par authMiddleware + roleMiddleware. ✅ Zod valide tous les `req.body` et `req.params`. ✅ `.env` dans `.gitignore`, pas de `API_KEY=xxx` dans le code. ✅ Middleware d'erreur renvoie `{ error: message }` en prod, pas le stack trace (`process.env.NODE_ENV === 'production'`). ❌ Route `GET /api/users` non protégée → ajouter auth.
3. **Exercice 3 (avancé)** : configurer une Content Security Policy (CSP) avec Helmet. Autoriser uniquement les scripts et styles du domaine, bloquer les inline scripts. Tester avec un script inline dans le frontend → doit être bloqué. Ajuster pour autoriser React (qui utilise des inline styles en dev).
   - **Corrigé détaillé** : `app.use(helmet.contentSecurityPolicy({ directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'", process.env.NODE_ENV === 'dev' ? "'unsafe-inline'" : ''].filter(Boolean), styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", "data:"], connectSrc: ["'self'", process.env.FRONTEND_URL] } }));`. La CSP est stricte en production, relaxée en dev pour React. Tester : ajouter `<script>alert('XSS')</script>` dans le frontend → bloqué par CSP.

### Nouvelles abréviations rencontrées
- OWASP | Open Web Application Security Project | Organisation de référence pour la sécurité des applications web | Interagit avec le Top 10, les guides de sécurité, les audits
- CSRF | Cross-Site Request Forgery | Attaque forçant un utilisateur à exécuter des actions non désirées | Interagit avec les tokens, les cookies, CORS
- CSP | Content Security Policy | Politique de sécurité du contenu (bloque XSS, scripts non autorisés) | Interagit avec Helmet, les navigateurs, les headers HTTP

### Banque de questions du module (15)
1. QCM: OWASP Top 10 est... A) une liste des risques de sécurité web les plus critiques B) un framework JavaScript C) une base de données
2. QCM: Helmet sécurise... A) les headers HTTP B) les routes C) la base de données
3. QCM: le rate-limiting protège contre... A) le brute force B) les injections SQL C) les pannes réseau
4. Ouverte: pourquoi ne pas renvoyer les stack traces en production ?
5. Ouverte: différence entre XSS et CSRF.
6. Cas: un attaquant tente 1000 combinaisons email/mot de passe en 1 minute. Protection ?
7. QCM: CORS avec `origin: '*'` et `credentials: true` est... A) interdit par la spec B) recommandé C) sans effet
8. Ouverte: pourquoi valider les entrées côté serveur même si le frontend les valide ?
9. Cas: `npm audit` rapporte 3 vulnérabilités "high". Prochaine étape ?
10. QCM: CSP bloque... A) les scripts non autorisés (XSS) B) les requêtes SQL C) les utilisateurs
11. Ouverte: comment gérer les secrets (API keys, JWT secret) en développement ?
12. Cas: middleware d'erreur Express renvoie `err.stack` au client. Risque ?
13. QCM: objectif du module 3 = A) sécuriser une API contre les menaces courantes B) ignorer la sécurité C) désactiver toutes les protections
14. Ouverte: comment auditer la sécurité de son API ?
15. QCM: résultat attendu = A) API protégée (Helmet + rate-limit + validation + CSP) B) headers HTTP par défaut C) pas de rate limiting

---

## 4) Labs intégrés — API sécurisée avec auth + ORM (2h)

### Objectifs d'apprentissage
- Intégrer Prisma + JWT + sécurité dans une API complète.
- Implémenter un flux CRUD sécurisé (seul le propriétaire peut modifier ses données).
- Tester les scénarios de sécurité (accès non autorisé, token expiré, brute force).
- Documenter les choix de sécurité dans un fichier SECURITY.md.

### Contenu pédagogique
Mini-projet : "API de gestion de notes personnelles". Chaque utilisateur peut créer, lire, modifier et supprimer SES notes. Un utilisateur ne peut pas voir les notes des autres.

Structure : Express + Prisma + JWT + Helmet + Rate-limit + Zod.

Modèle : `User (id, email, password)`, `Note (id, title, content, userId FK)`. Les routes `/api/notes` nécessitent un JWT valide. Les requêtes sont filtrées par `userId` (le propriétaire).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : créer la route `GET /api/notes` qui retourne UNIQUEMENT les notes de l'utilisateur connecté (`req.user.userId`). Implémenter la pagination.
   - **Corrigé** : `const notes = await prisma.note.findMany({ where: { userId: req.user.userId }, orderBy: { updatedAt: 'desc' }, take: limit, skip: offset });`. Le `userId` vient du JWT, pas de la requête → l'utilisateur ne peut pas tricher.
2. **Exercice 2 (intermédiaire)** : implémenter `POST /api/notes` (création) et `DELETE /api/notes/:id` avec vérification de propriété. Avant de supprimer, vérifier que la note appartient bien à l'utilisateur connecté.
   - **Corrigé** : `const note = await prisma.note.findUnique({ where: { id } }); if (!note || note.userId !== req.user.userId) return res.status(404).json({ error: 'Note introuvable' });`. Même message pour "pas trouvée" et "pas la vôtre" pour ne pas fuiter l'existence de notes d'autres utilisateurs.
3. **Exercice 3 (avancé)** : rédiger le fichier `SECURITY.md` documentant les mesures de sécurité de l'API (auth, validation, rate-limiting, CSP, gestion des secrets). Expliquer comment signaler une vulnérabilité (responsible disclosure).

### Banque de questions du module (15)
1. QCM: le lab J26 simule... A) une API sécurisée complète B) un exercice théorique C) rien
2. QCM: filtrer par `userId` dans les requêtes garantit que... A) l'utilisateur ne voit que ses données B) tout le monde voit tout C) rien
3. QCM: un `SECURITY.md` documente... A) les mesures de sécurité B) le code C) les recettes de cuisine
4. Ouverte: pourquoi retourner le même message pour "note pas trouvée" et "pas vos droits" ?
5. QCM: résultat attendu = A) API CRUD sécurisée par utilisateur B) données partagées C) pas d'auth

---

## 5) Banque de questions + suivi P1 (2h)

### Objectifs d'apprentissage
- Valider les acquis J26. Planifier J27 (Déploiement cloud).

### Contenu pédagogique
- 60 min test mixte. 30 min correction + plan J27. 30 min portfolio.

### Banque de questions du module (15)
1. QCM: objectif final J26 = A) API sécurisée ORM + JWT + OWASP B) théorie seule C) rien
2. QCM: plan J27 = A) déploiement cloud + HTTPS B) retour au JS C) fin
3. Ouverte: meilleure preuve J26 à montrer ?
4. QCM: preuve solide = A) repo GitHub API sécurisée + SECURITY.md B) promesse C) rien
5. QCM: résultat P1 réussi = A) portfolio enrichi B) rien C) théorie
6. Ouverte: comment relier J26 au poste de développeur full-stack ?
7. QCM: remédiation = A) corriger la lacune B) recommencer C) abandonner
8. QCM: résultat attendu = A) API sécurisée fonctionnelle B) vulnérable C) pas d'auth

---

## Validation qualité J26 (anti-superficiel)

### Livrables obligatoires fin de J26
1. 1 API Express + Prisma + JWT + Helmet fonctionnelle.
2. 1 flux d'authentification complet (register, login, refresh, logout, middleware).
3. 1 implémentation CRUD sécurisée par propriétaire (notes ou posts).
4. 1 fichier `SECURITY.md` documentant les mesures de sécurité.
5. 1 preuve portfolio (repo GitHub) + mise à jour CV ligne sécurité/ORM.

### Grille d'évaluation rapide (100 points)
- Maîtrise Prisma ORM (schéma, migrations, relations, querying) : **25 pts**
- Authentification JWT (hash, tokens, refresh, middleware) : **30 pts**
- Sécurité applicative (Helmet, rate-limit, validation, OWASP) : **25 pts**
- Qualité du lab intégré (CRUD propriétaire, SECURITY.md) : **10 pts**
- Communication technique employabilité : **10 pts**

### Seuil attendu
- **>= 80/100** : J26 validé, passage normal J27.
- **65-79/100** : validé sous remédiation ciblée 24h.
- **< 65/100** : consolidation ORM/sécurité requise avant J27.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Prisma)
1. **A**
2. **A**
3. **A**
4. Type-safe (autocomplétion, vérification à la compilation), migrations automatiques, relations faciles (`include`), transactions simplifiées, Prisma Studio pour visualiser les données. Plus productif que le SQL brut pour les opérations CRUD standard.
5. `include` = charge les relations (JOIN). `select` = choisit les champs à retourner. On peut combiner les deux. `include` ramène toutes les colonnes de la relation, `select` permet de n'en prendre que certaines.
6. `null`. `findUnique` retourne `null` si l'enregistrement n'existe pas (contrairement à `findFirst` qui peut throw). Toujours vérifier `if (!user)` après un `findUnique`.
7. **A**
8. Pour garantir l'atomicité : soit toutes les opérations réussissent, soit rien n'est modifié. Évite les états incohérents (ex: user créé mais son profil non).
9. Le schéma Prisma et la base de données sont désynchronisés. Résoudre avec `npx prisma migrate resolve` ou `npx prisma db push` (en dev uniquement) ou recréer la migration proprement.
10. **A**
11. Utiliser `select` au lieu d'`include` pour ne prendre que les champs nécessaires. Faire des requêtes séparées pour les données lourdes. Utiliser `take` pour limiter le nombre d'éléments dans les relations.
12. `model Post { categories CategoryOnPost[] } model Category { posts CategoryOnPost[] } model CategoryOnPost { post Post @relation(...) postId Int category Category @relation(...) categoryId Int @@id([postId, categoryId]) }`. Table de jointure explicite avec clé composite.
13. **A**
14. Les migrations Prisma sont dans `prisma/migrations/` — chaque migration est un dossier avec un `migration.sql` horodaté. Commiter tout le dossier. `prisma migrate dev` pour créer, `prisma migrate deploy` en production.
15. **A**

### B. Corrigé — Module 2 (Authentification)
1. **A**
2. **A**
3. **A**
4. Si la base de données est compromise, les mots de passe en clair sont directement exploitables. Avec bcrypt, l'attaquant doit casser chaque hash individuellement (lent et coûteux). Ne jamais pouvoir lire le mot de passe d'un utilisateur.
5. Access token = courte durée (15 min), envoyé dans le header pour chaque requête API. Refresh token = longue durée (7 jours), stocké en cookie httpOnly, sert uniquement à obtenir un nouvel access token. Si l'access token est volé, il expire vite. Si le refresh est volé, on peut le détecter et le révoquer.
6. Appeler `POST /api/auth/refresh` avec le refresh token. Si le refresh fonctionne → nouvel access token, réessayer la requête. Si le refresh échoue → rediriger vers la page de login.
7. **A**
8. Si un refresh token est volé, l'attaquant peut l'utiliser pour obtenir des access tokens. Avec la rotation, quand l'utilisateur légitime rafraîchit son token, l'ancien refresh est invalidé. Si l'attaquant essaie d'utiliser le refresh volé, il sera détecté (reuse detection) → tous les refresh tokens sont révoqués.
9. 401 Unauthorized. Le client doit tenter un refresh. Ne pas retourner 500 (erreur serveur) pour un token expiré — c'est une erreur client normale.
10. **A**
11. Stocker l'access token en mémoire (variable JavaScript) — pas dans localStorage (vulnérable XSS) ni cookie non-httpOnly. Refresh token en cookie httpOnly + secure + sameSite strict. Au rechargement de la page, utiliser le refresh pour obtenir un nouvel access token.
12. Pour ne pas indiquer si l'email existe dans la base. "Email incorrect" révèle que l'utilisateur n'existe pas. "Mot de passe incorrect" révèle qu'il existe. Message générique "Email ou mot de passe incorrect" protège contre l'énumération d'utilisateurs.
13. **A**
14. Tests unitaires : bcrypt hash/compare, jwt sign/verify. Tests d'intégration : POST /register → 201 + token, POST /login → 200 + token, GET /protected sans token → 401, GET /protected avec token expiré → 401, POST /refresh → nouveau token. Tests automatisés avec Supertest + Jest.
15. **A**

### C. Corrigé — Module 3 (Sécurité)
1. **A**
2. **A**
3. **A**
4. Les stack traces révèlent la structure du code (chemins de fichiers, noms de fonctions, versions de bibliothèques). Un attaquant peut utiliser ces informations pour trouver des vulnérabilités connues. En production, logger l'erreur complète côté serveur et renvoyer un message générique au client.
5. XSS = injecter du JavaScript malveillant dans une page (vol de cookies, keylogging). CSRF = forcer un utilisateur authentifié à exécuter une action non désirée (changer son mot de passe, transférer de l'argent). XSS exploite la confiance dans le site, CSRF exploite la confiance dans la session utilisateur.
6. Rate-limiter : `rateLimit({ windowMs: 15*60*1000, max: 5 })` sur la route de login → après 5 tentatives en 15 minutes, l'IP est bloquée. Ajouter un délai progressif (1s, 2s, 4s...) entre les tentatives. Logger et alerter en cas de pic suspect.
7. **A**
8. Un attaquant peut contourner la validation frontend (désactiver JavaScript, utiliser curl/Postman, modifier le code dans les DevTools). La validation serveur est la seule fiable. "Never trust the client."
9. `npm audit fix` pour corriger automatiquement si possible. Si non, lire les advisories, comprendre l'impact, mettre à jour manuellement la dépendance. Si la vulnérabilité n'est pas exploitable dans le contexte, documenter la décision. Planifier des audits réguliers.
10. **A**
11. Fichier `.env` jamais commité, `.env.example` avec des valeurs factices. `process.env.JWT_SECRET` — en développement, une chaîne aléatoire locale ; en production, une valeur forte générée et stockée dans les variables d'environnement du serveur ou un service de secrets (Vault, AWS Secrets Manager).
12. Risque de fuite d'information : l'attaquant voit les chemins de fichiers, les versions de bibliothèques, la logique interne. Peut utiliser ces infos pour affiner ses attaques. Toujours `res.status(500).json({ error: 'Erreur interne du serveur' })` en production.
13. **A**
14. Exécuter `npm audit`, vérifier le Top 10 OWASP manuellement, utiliser un outil de scan (Snyk, OWASP ZAP pour du DAST), faire une revue de code par un pair, engager un pentest externe pour les applications critiques.
15. **A**

### D-E. Corrigés — Module 4 (Labs) & Module 5 (Banque)
1. **A**
2. **A**
3. **A**
4. Pour éviter les attaques par énumération (IDOR). Si l'API retourne 403 "pas vos droits", l'attaquant sait que la note existe. S'il retourne 404 "introuvable" dans les deux cas, l'attaquant ne peut pas distinguer les notes qui existent de celles qui n'existent pas.
5. **A**
1. **A**
2. **A**
3. Repo GitHub avec API sécurisée + SECURITY.md + démonstration du flux auth (Postman collection ou tests automatisés).
4. **A**
5. **A**
6. La sécurité est une compétence transversale qui distingue un développeur junior conscient des risques. Un full-stack qui sécurise son API dès le début est plus employable qu'un développeur qui "ajoutera la sécurité plus tard".
7. **A**
8. **A**