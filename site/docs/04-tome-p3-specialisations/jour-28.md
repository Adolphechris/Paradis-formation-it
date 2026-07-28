# TOME P3-C — Jour 28 (14h)

## Découpage horaire opérationnel J28
- Architecture logicielle (MVC, clean architecture, SOLID, séparation des responsabilités) — **3h**
- Projet de synthèse — conception (cahier des charges, schéma BDD, maquette API) — **3h**
- Projet de synthèse — implémentation (frontend React + backend Express + DB) — **4h**
- Projet de synthèse — déploiement + tests + portfolio P3-C — **2h**
- Validation P3-C + pitch développeur junior + suivi P1 — **2h**

---

> **🎯 PROJET DE SYNTHÈSE P3-C — Application full-stack "TaskFlow"**
>
> Tu es développeur full-stack junior. Tu dois concevoir et réaliser une application de gestion de tâches collaborative :
> - **Frontend** : React avec authentification, dashboard, CRUD tâches, filtres
> - **Backend** : API REST Express + Prisma + PostgreSQL, JWT auth, validation
> - **Déploiement** : Vercel (frontend) + Render (backend + DB)
> - **Architecture** : Clean architecture, SOLID, séparation des responsabilités
>
> **Livrable final** : une application full-stack complète, déployée et documentée, prête pour ton portfolio.

---

## 1) Architecture logicielle — MVC, clean architecture, SOLID (3h)

### Objectifs d'apprentissage
- Comprendre les patterns d'architecture logicielle (MVC, clean/hexagonal, layered).
- Appliquer les principes SOLID dans un projet full-stack.
- Structurer un projet pour la maintenabilité et la scalabilité.
- Distinguer logique métier, infrastructure, et présentation.
- Documenter les décisions d'architecture (ADR — Architecture Decision Records).

### Contenu pédagogique
Un bon code ne suffit pas — il doit être organisé pour durer. L'architecture logicielle détermine la capacité à faire évoluer l'application sans tout casser.

Points clés:
1. **MVC (Model-View-Controller)** :
   - **Model** = données + logique métier (Prisma models, services).
   - **View** = présentation (composants React).
   - **Controller** = orchestration HTTP (routes Express, handlers).
   - Avantage : séparation claire, chaque couche évolue indépendamment.
   - Limite : le controller peut devenir un "fat controller" si on n'extrait pas la logique dans des services.
2. **Clean Architecture (hexagonale)** :
   - **Domain** (cœur) = entités métier, use cases, interfaces (ports). Indépendant de toute technologie.
   - **Application** = implémentation des use cases, orchestration.
   - **Infrastructure** = base de données, API externes, frameworks (Prisma, Express, React).
   - **Presentation** = UI, controllers HTTP.
   - Règle d'or : les dépendances pointent vers l'intérieur. Le domaine ne connaît pas Prisma ; Prisma implémente une interface du domaine.
3. **Principes SOLID** :
   - **S** — Single Responsibility : une classe/module = une raison de changer. Ex: `UserService` gère la logique utilisateur, `EmailService` gère l'envoi d'emails.
   - **O** — Open/Closed : ouvert à l'extension, fermé à la modification. Ex: ajouter un nouveau type de notification sans modifier le code existant.
   - **L** — Liskov Substitution : une classe enfant doit pouvoir remplacer sa classe parent.
   - **I** — Interface Segregation : plusieurs interfaces spécifiques plutôt qu'une seule générale.
   - **D** — Dependency Inversion : dépendre d'abstractions (interfaces), pas d'implémentations concrètes. Ex: `UserRepository` (interface) implémentée par `PrismaUserRepository`.
4. **Structure de projet recommandée** :
   ```
   backend/
   ├── src/
   │   ├── domain/          # Entités, use cases, interfaces
   │   │   ├── entities/
   │   │   ├── usecases/
   │   │   └── ports/
   │   ├── application/     # Implémentation des use cases
   │   ├── infrastructure/  # Prisma, Express, JWT
   │   │   ├── database/
   │   │   ├── auth/
   │   │   └── web/
   │   └── presentation/    # Controllers, routes, middlewares
   frontend/
   ├── src/
   │   ├── components/      # Composants réutilisables
   │   ├── pages/           # Pages (routes)
   │   ├── hooks/           # Custom hooks
   │   ├── services/        # Appels API
   │   ├── contexts/        # React Context
   │   └── utils/           # Fonctions utilitaires
   ```
5. **ADR (Architecture Decision Records)** : documenter les décisions d'architecture dans des fichiers markdown. Format : Titre, Contexte, Décision, Conséquences. Ex: "ADR-001 : Utiliser Prisma plutôt que SQL brut pour la productivité et le type-safety."

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : refactorer une route Express "fat controller" (tout dans le handler) en séparant Controller → Service → Repository. Identifier les responsabilités de chaque couche.
   - **Corrigé détaillé** : Avant : `router.get('/users', async (req, res) => { const users = await prisma.user.findMany(...); res.json(users); });`. Après : `userController.getAll` → appelle `userService.findAll()` → appelle `userRepository.findAll()`. Le controller gère HTTP (req/res), le service gère la logique métier (validation, règles), le repository gère l'accès aux données (SQL/Prisma).
2. **Exercice 2 (intermédiaire)** : appliquer le principe Dependency Inversion. Créer une interface `IUserRepository` avec les méthodes `findAll`, `findById`, `create`. Implémenter avec `PrismaUserRepository`. Faire en sorte que `UserService` dépende de l'interface, pas de l'implémentation.
   - **Corrigé détaillé** : `class UserService { constructor(private userRepo: IUserRepository) {} async findAll() { return this.userRepo.findAll(); } }`. Injection de dépendance : `const userRepo = new PrismaUserRepository(); const userService = new UserService(userRepo);`. Avantage : on peut changer l'implémentation (Prisma → SQL brut, ou mock pour les tests) sans toucher au service.
3. **Exercice 3 (avancé)** : écrire un ADR pour le projet TaskFlow justifiant les choix : Express vs Fastify, Prisma vs Sequelize, JWT vs sessions, React vs Vue. Chaque décision inclut le contexte, les alternatives considérées, et les conséquences.
   - **Corrigé détaillé** : ADR-001 : Express (écosystème mature, middlewares, documentation) plutôt que Fastify (plus rapide mais moins de ressources). ADR-002 : Prisma (type-safe, migrations, DX) plutôt que Sequelize (moins moderne). ADR-003 : JWT (stateless, scaling) plutôt que sessions (stateful, complexe en cluster). ADR-004 : React (demandé sur le marché, écosystème) plutôt que Vue/Svelte. Chaque ADR explique le pourquoi, pas juste le quoi.

### Nouvelles abréviations rencontrées
- SOLID | 5 principes de conception orientée objet (Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion) | Interagit avec l'architecture, la maintenabilité, les tests
- MVC | Model-View-Controller | Pattern architectural séparant données (Model), interface (View), et logique (Controller) | Interagit avec Express (C), React (V), Prisma (M)

### Banque de questions du module (15)
1. QCM: SOLID est un acronyme pour... A) 5 principes de conception logicielle B) un framework JavaScript C) une base de données
2. QCM: dans MVC, le Controller... A) orchestre la requête HTTP B) stocke les données C) affiche l'interface
3. QCM: Dependency Inversion signifie... A) dépendre d'interfaces, pas d'implémentations B) inverser le code C) supprimer les dépendances
4. Ouverte: pourquoi séparer le code en couches (domain, application, infrastructure) ?
5. Ouverte: expliquer le principe Single Responsibility avec un exemple.
6. Cas: le `UserService` importe directement `PrismaClient`. Quel principe SOLID est violé ?
7. QCM: un ADR (Architecture Decision Record) documente... A) les décisions d'architecture et leur justification B) le code C) les bugs
8. Ouverte: différence entre MVC et Clean Architecture.
9. Cas: besoin d'ajouter un nouveau type de paiement sans modifier le code existant. Quel principe SOLID ?
10. QCM: le domaine (domain) dans Clean Architecture... A) ne dépend d'aucune technologie externe B) dépend de Prisma C) dépend d'Express
11. Ouverte: pourquoi injecter les dépendances plutôt que de les instancier directement ?
12. Cas: `class UserService extends PrismaService` — problème architectural ?
13. QCM: objectif du module 1 = A) concevoir une architecture maintenable B) tout mettre dans un fichier C) ignorer l'architecture
14. Ouverte: comment expliquer l'importance de l'architecture à un développeur junior ?
15. QCM: résultat attendu = A) projet structuré selon les principes SOLID B) code spaghetti C) pas de séparation

---

## 2) Projet de synthèse — conception (3h)

### Objectifs d'apprentissage
- Rédiger un cahier des charges fonctionnel et technique.
- Concevoir le schéma de base de données (entités, relations).
- Définir les endpoints de l'API REST (contrat d'interface).
- Maquetter les écrans principaux du frontend (wireframes).
- Estimer les efforts et planifier les itérations.

### Contenu pédagogique
La conception est l'étape qui transforme "je vais coder une app" en "voici exactement ce que je vais construire".

Points clés:
1. **Cahier des charges TaskFlow** :
   - **Fonctionnalités** : inscription/connexion, création/édition/suppression de tâches, assignation à un utilisateur, filtres (statut, priorité, assigné), dashboard avec compteurs.
   - **Rôles** : utilisateur standard (gère ses tâches), admin (voit toutes les tâches).
   - **Contraintes** : responsive, temps de réponse < 500ms, 99% uptime (SLA).
2. **Schéma de base de données** (Prisma) :
   - `User` : id, email (unique), password (hash), name, role (USER/ADMIN), createdAt.
   - `Task` : id, title, description?, status (TODO/IN_PROGRESS/DONE), priority (LOW/MEDIUM/HIGH), dueDate?, authorId FK, assigneeId? FK, createdAt, updatedAt.
   - Relations : User 1-N Task (author), User 1-N Task (assignee, nullable).
3. **API REST — Endpoints** :
   - `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`.
   - `GET /api/tasks` (filtrées par userId, avec query params : status, priority, search), `GET /api/tasks/:id`, `POST /api/tasks`, `PUT /api/tasks/:id`, `PATCH /api/tasks/:id/status`, `DELETE /api/tasks/:id`.
   - Pagination, validation Zod, codes HTTP standard.
4. **Wireframes frontend** (description textuelle) :
   - **Login/Register** : formulaire centré, champs email + password, lien "Créer un compte".
   - **Dashboard** : barre de navigation (logo, tâches, profil, logout), 3 KPI cards (total, en cours, terminées), liste des tâches avec filtres (statut, priorité), bouton "Nouvelle tâche".
   - **Page tâche** : formulaire titre/description/priorité/statut/assigné, dates, boutons Enregistrer/Supprimer.
   - **Modal de création rapide** : titre + priorité + date échéance.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : écrire le schéma Prisma complet pour TaskFlow (User, Task). Générer la migration et vérifier dans Prisma Studio.
   - **Corrigé** : `model User { id Int @id @default(autoincrement()) email String @unique password String name String role String @default("USER") tasksAuthored Task[] @relation("author") tasksAssigned Task[] @relation("assignee") refreshTokens RefreshToken[] } model Task { id Int @id @default(autoincrement()) title String description String? status String @default("TODO") priority String @default("MEDIUM") dueDate DateTime? author User @relation("author", fields: [authorId], references: [id]) authorId Int assignee User? @relation("assignee", fields: [assigneeId], references: [id]) assigneeId Int? createdAt DateTime @default(now()) updatedAt DateTime @updatedAt }`.
2. **Exercice 2 (intermédiaire)** : définir le contrat d'interface complet de l'API (tous les endpoints avec méthode, URL, body, réponse). Format OpenAPI simplifié.
   - **Corrigé** : Document markdown avec tableau : Endpoint | Méthode | Body | Réponse Succès | Erreurs. Ex: `/api/tasks` | GET | - (query: status, priority, page, limit) | `{ data: Task[], pagination }` | 401. `/api/tasks/:id` | DELETE | - | 204 No Content | 404, 403.
3. **Exercice 3 (avancé)** : planifier le développement en 3 itérations (phases). Phase 1 : auth + CRUD tâches basique. Phase 2 : filtres, assignation, dashboard. Phase 3 : rôles admin, déploiement, tests. Estimer le temps par phase.
   - **Corrigé** : Phase 1 (3h) : backend auth + CRUD task, frontend auth + liste/création. Phase 2 (3h) : filtres, assignation, dashboard KPI. Phase 3 (1h) : rôles admin, déploiement, tests E2E. Total 7h de développement sur les 14h du jour (le reste = conception + architecture).

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: un cahier des charges contient... A) les fonctionnalités, contraintes, rôles B) uniquement le code C) rien
2. QCM: le schéma de base de données définit... A) les entités et leurs relations B) les composants React C) les couleurs
3. QCM: un endpoint API est défini par... A) méthode HTTP + URL + body + réponse B) uniquement l'URL C) rien
4. Ouverte: pourquoi définir le contrat d'API avant de coder ?
5. Ouverte: différence entre `author` et `assignee` dans le modèle Task.
6. Cas: besoin d'ajouter des commentaires sur les tâches. Comment modifier le schéma ?
7. QCM: un wireframe est... A) une maquette basse fidélité B) le code final C) une base de données
8. Ouverte: pourquoi planifier en itérations plutôt que tout d'un coup ?
9. Cas: le client demande un champ "tags" après le début du développement. Approche ?
10. QCM: Prisma génère le schéma de DB via... A) `prisma migrate dev` B) `npm start` C) `git push`
11. Ouverte: intérêt du champ `updatedAt` avec `@updatedAt` ?
12. Cas: `assigneeId` est nullable. Pourquoi ?
13. QCM: objectif du module 2 = A) concevoir complètement l'application avant de coder B) coder sans plan C) éviter la conception
14. Ouverte: comment présenter la conception en entretien ?
15. QCM: résultat attendu = A) schéma DB + contrat API + wireframes B) idées vagues C) pas de conception

---

## 3) Projet de synthèse — implémentation (4h)

### Objectifs d'apprentissage
- Implémenter le backend complet (auth + CRUD tasks + filtres + rôles).
- Implémenter le frontend complet (auth + dashboard + CRUD + filtres).
- Connecter les deux avec les variables d'environnement.
- Appliquer les principes d'architecture vus en module 1.
- Gérer les états (loading, empty, error, success) sur tous les composants.

### Contenu pédagogique
C'est le cœur du projet. L'implémentation suit la conception et applique toutes les compétences acquises en P3-C.

Étapes guidées (backlog ordonné) :

**Backend (2h)** :
1. Initialiser le projet Express + Prisma + JWT + Helmet.
2. Implémenter l'authentification (register, login, refresh, logout, middleware).
3. Implémenter le CRUD tasks (avec filtrage par userId).
4. Ajouter les filtres (query params : status, priority, search par titre).
5. Ajouter le rôle admin (GET /api/admin/tasks — toutes les tâches).
6. Écrire les tests d'intégration (auth + CRUD) avec Supertest + Jest.

**Frontend (2h)** :
1. Initialiser React + Vite + React Router.
2. Implémenter l'authentification (Login, Register, AuthContext, ProtectedRoute).
3. Créer le Dashboard (KPI cards, TaskList, TaskForm, TaskModal).
4. Ajouter les filtres (status, priority, recherche textuelle).
5. Gérer tous les états : loading (spinner), empty ("Aucune tâche"), error (message + retry), success (liste).
6. Protéger les routes, gérer l'expiration du token (refresh automatique).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : implémenter `POST /api/tasks` avec validation Zod et `GET /api/tasks` avec filtres. Tester avec Postman/curl.
   - **Corrigé** : `POST /api/tasks` → valider `title required, status enum, priority enum` → `prisma.task.create({ data: { ...body, authorId: req.user.userId } })` → 201. `GET /api/tasks` → `const where = { authorId: req.user.userId }; if (req.query.status) where.status = req.query.status; if (req.query.priority) where.priority = req.query.priority; if (req.query.search) where.title = { contains: req.query.search, mode: 'insensitive' };` → `prisma.task.findMany({ where, orderBy: { updatedAt: 'desc' }, take, skip })`.
2. **Exercice 2 (intermédiaire)** : implémenter le Dashboard React avec les KPI cards (total, en cours, terminées). Utiliser `useMemo` pour calculer les compteurs côté client. Ajouter le filtrage par statut (boutons TODO/IN_PROGRESS/DONE).
   - **Corrigé** : `const stats = useMemo(() => ({ total: tasks.length, todo: tasks.filter(t => t.status === 'TODO').length, done: tasks.filter(t => t.status === 'DONE').length }), [tasks]);`. Filtres : `const [statusFilter, setStatusFilter] = useState('ALL'); const filtered = statusFilter === 'ALL' ? tasks : tasks.filter(t => t.status === statusFilter);`. Boutons de filtre avec `className={statusFilter === s ? 'active' : ''}`.
3. **Exercice 3 (avancé)** : implémenter le refresh token automatique côté frontend. Intercepter les réponses 401, appeler `/api/auth/refresh`, réessayer la requête originale. Utiliser un axios interceptor ou un wrapper fetch.
   - **Corrigé** : `api.interceptors.response.use(response => response, async error => { if (error.response?.status === 401 && !error.config._retry) { error.config._retry = true; await axios.post('/api/auth/refresh', {}, { withCredentials: true }); return api(error.config); } return Promise.reject(error); });`. Silencieux pour l'utilisateur — l'access token est rafraîchi automatiquement.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: le backend TaskFlow utilise... A) Express + Prisma + JWT B) Django C) Ruby on Rails
2. QCM: le frontend TaskFlow utilise... A) React + Vite + React Router B) Angular C) Vue
3. QCM: les filtres de tâches côté serveur utilisent... A) les query params B) le body C) les headers
4. Ouverte: pourquoi filtrer côté serveur plutôt que côté client uniquement ?
5. Ouverte: comment gérer l'état "empty" (aucune tâche) ?
6. Cas: l'utilisateur modifie une tâche mais le token expire pendant l'opération. Solution ?
7. QCM: `useMemo` est utilisé pour... A) mémoriser un calcul coûteux B) faire des appels API C) router
8. Ouverte: avantage de `axios interceptors` par rapport à gérer les 401 manuellement.
9. Cas: `prisma.task.findMany` avec `where` vide → que retourne-t-il ?
10. QCM: la route admin `GET /api/admin/tasks` doit vérifier... A) `req.user.role === 'ADMIN'` B) rien C) l'email
11. Ouverte: pourquoi séparer le formulaire de création et le formulaire d'édition ?
12. Cas: `PATCH /api/tasks/:id/status` → pourquoi PATCH et pas PUT ?
13. QCM: objectif du module 3 = A) implémenter l'application full-stack TaskFlow B) rester en conception C) coder sans tester
14. Ouverte: comment tester l'application manuellement avant le déploiement ?
15. QCM: résultat attendu = A) app TaskFlow fonctionnelle en local B) backend seul C) frontend seul

---

## 4) Projet de synthèse — déploiement + portfolio (2h)

### Objectifs d'apprentissage
- Déployer TaskFlow en production (Vercel + Render + PostgreSQL).
- Exécuter les tests de bout en bout (E2E) en production.
- Préparer le README.md du projet (description, stack, installation, captures).
- Ajouter TaskFlow au portfolio P3-C.
- Préparer un pitch "développeur full-stack junior prêt à l'emploi".

### Contenu pédagogique
Un projet non déployé est un projet invisible. Le déploiement et la documentation transforment le code en preuve de compétence.

Étapes :
1. Déployer le backend (Render) + DB (Render PostgreSQL).
2. Déployer le frontend (Vercel), configurer `VITE_API_URL`.
3. Tester le flux complet en production (inscription → connexion → création tâche → filtres).
4. Rédiger le README.md : description, stack, installation locale, démo en ligne, captures d'écran.
5. Mettre à jour le portfolio avec TaskFlow comme projet phare P3-C.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : déployer TaskFlow en production et tester le flux complet.
   - **Corrigé** : Backend → Render (Web Service, env vars : DATABASE_URL, JWT_SECRET, FRONTEND_URL). Frontend → Vercel (env var : VITE_API_URL). Tester : créer un compte → se connecter → créer 3 tâches → filtrer → marquer une comme DONE → vérifier les KPI.
2. **Exercice 2 (intermédiaire)** : rédiger le README.md complet avec badges, captures d'écran, et instructions d'installation locale.
   - **Corrigé** : Structure README : Titre + badge (license, deploy status). Description (1 phrase). Démo (lien). Stack (logos React, Express, Prisma, PostgreSQL). Fonctionnalités (checklist). Captures (dashboard, création tâche). Installation locale (git clone, npm install, .env, prisma migrate, npm run dev). Architecture (schéma simplifié). Licence.
3. **Exercice 3 (avancé)** : rédiger un article de blog technique (ou post LinkedIn) décrivant le projet TaskFlow : problématique, choix techniques, défis, et apprentissages. Le publier avec le lien vers la démo.
   - **Corrigé** : Structure article : Accroche ("J'ai construit une app full-stack en 1 jour"). Contexte (projet de formation PARADIS). Stack & justifications. Défis (auth JWT, refresh tokens, clean architecture). Résultat (démo + repo). Leçons apprises. Call to action (feedback bienvenu).

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: le déploiement de TaskFlow utilise... A) Vercel + Render B) AWS C) Heroku
2. QCM: le README.md contient... A) description, stack, installation, démo B) uniquement le code C) rien
3. QCM: une démo en ligne permet au recruteur de... A) tester l'application sans installer B) modifier le code C) rien
4. Ouverte: pourquoi inclure des captures d'écran dans le README ?
5. Ouverte: qu'est-ce qui fait un bon README ?
6. Cas: le recruteur clique sur le lien de démo et voit une erreur 500. Réaction ?
7. QCM: le portfolio P3-C inclut... A) TaskFlow + les projets J23-J27 B) uniquement TaskFlow C) rien
8. Ouverte: pourquoi écrire un article sur son projet ?
9. Cas: le déploiement Render est lent au premier chargement (cold start). Solution ?
10. QCM: objectif du module 4 = A) rendre le projet visible et professionnel B) garder le code caché C) éviter de documenter
11. Ouverte: comment présenter TaskFlow en 2 minutes à un recruteur ?
12. QCM: résultat attendu = A) application déployée + README + article B) code local non documenté C) pas de déploiement

---

## 5) Validation P3-C + pitch développeur junior + suivi P1 (2h)

### Objectifs d'apprentissage
- Valider l'ensemble des acquis P3-C en test cumulatif.
- Préparer le pitch "développeur full-stack junior".
- Obtenir la validation formelle du Tome P3-C.
- Planifier la transition vers P4 (Cloud, sécurité transversale).

### Contenu pédagogique
- 40 min : test cumulatif P3-C (J23 à J28).
- 20 min : correction, bilan, célébration.
- 30 min : portfolio final P3-C et mise à jour CV.
- 30 min : planification P4 (J29-J35), sauvegarde GitHub.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : lister les 5 compétences principales acquises en P3-C.
   - **Corrigé** : 1) JavaScript/ES6+ et DOM moderne. 2) React (hooks, context, routing). 3) Backend Node.js/Express + API REST. 4) Bases de données (Prisma ORM, PostgreSQL, migrations). 5) Déploiement full-stack (Vercel, Render, CI/CD, HTTPS).
2. **Exercice 2 (intermédiaire)** : pitch développeur full-stack junior (90 secondes).
   - **Corrigé** : "En 6 jours intensifs, j'ai conçu et réalisé une application full-stack complète : frontend React, backend Express, base de données PostgreSQL, authentification JWT, et déploiement en production. TaskFlow est la preuve que je peux prendre un besoin, le concevoir, le développer, et le mettre en ligne de A à Z. Je maîtrise JavaScript, React, Node.js, et les bases de données — je suis prêt à être productif dès le premier jour."
3. **Exercice 3 (avancé)** : plan J29 — "Cloud computing fondamentaux + plateforme principale (AWS/Azure)".

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: P3-C couvre principalement... A) le développement web full-stack B) l'administration système C) l'analyse de données
2. QCM: la validation P3-C est acquise si... A) score >= 80/100 et livrables complets B) présence C) avis personnel
3. QCM: P4 portera sur... A) le cloud, la sécurité transversale, la professionnalisation B) le frontend C) le SQL
4. Ouverte: quelle compétence P3-C te semble la plus utile ?
5. Ouverte: quel a été le plus grand défi de P3-C ?
6. Cas: score = 78/100. Prochaine étape ?
7. QCM: un portfolio full-stack efficace montre... A) des projets complets avec démo en ligne B) du code uniquement C) rien
8. Ouverte: pourquoi la transition P3-A → P3-B → P3-C → P4 est-elle cohérente ?
9. QCM: la célébration est importante car... A) elle marque la progression et motive B) inutile C) personne ne le fait
10. QCM: résultat P3-C réussi = A) compétences développeur full-stack junior prouvées B) rien C) stress inchangé
11. Ouverte: quel conseil donnerais-tu à quelqu'un qui commence P3-C ?
12. QCM: la prochaine étape après P3-C est... A) P4 Cloud, sécurité transversale B) retour à P0 C) fin du programme
13. QCM: objectif final P3-C = A) développeur full-stack junior opérationnel B) expert React C) débutant éternel
14. Ouverte: comment continuer à progresser en développement web après P3-C ?
15. QCM: 🏆 P3-C = A) MISSION ACCOMPLIE B) à refaire C) abandonné

---

## Validation qualité J28 — Projet de synthèse P3-C (anti-superficiel)

### Livrables obligatoires fin de J28 (ET FIN DE P3-C)
1. **Cahier des charges** TaskFlow (fonctionnalités, rôles, contraintes).
2. **Schéma de base de données** (Prisma, migré et testé).
3. **API REST documentée** (tous les endpoints avec exemples).
4. **Application full-stack fonctionnelle** (frontend + backend + DB).
5. **Déploiement production** (Vercel + Render, URLs accessibles).
6. **README.md** complet (description, stack, démo, installation, captures).
7. **Portfolio P3-C** mis à jour (TaskFlow + projets J23-J27 + pitch développeur).
8. **Code source** versionné dans Git avec structure propre.

### Grille d'évaluation rapide (100 points)
- Qualité de l'architecture (SOLID, séparation des responsabilités, ADR) : **15 pts**
- Qualité de la conception (cahier des charges, schéma DB, contrat API) : **15 pts**
- Qualité de l'implémentation (backend + frontend, auth, CRUD, filtres, états) : **30 pts**
- Qualité du déploiement et documentation (production, README, portfolio) : **20 pts**
- Communication et pitch : **10 pts**
- Qualité transversale (propreté du code, gestion d'erreurs, sécurité) : **10 pts**

### Seuil attendu
- **>= 80/100** : P3-C validé avec succès, passage en P4.
- **65-79/100** : validé sous remédiation ciblée 48h avant P4.
- **< 65/100** : consolidation P3-C requise avant passage en P4.

### 🏆 FÉLICITATIONS — Fin du Tome P3-C !

Si tu as atteint le seuil de 80/100, tu as complété avec succès la spécialisation **Développement web**. Tu disposes maintenant :
- D'une application full-stack complète (TaskFlow) déployée et documentée
- De compétences vérifiables en JavaScript, React, Node.js/Express, Prisma/PostgreSQL
- D'un portfolio développeur full-stack professionnel
- D'un argumentaire solide pour les entretiens de développeur junior

**🎉 Tu as complété les 3 axes de spécialisation P3 (A, B, C) !**
- P3-A : Administration systèmes & réseau
- P3-B : Analyse de données
- P3-C : Développement web

**Prochaine étape : Tome P4 — Cloud, sécurité transversale et professionnalisation (J29-J35).**

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Architecture)
1. **A**
2. **A**
3. **A**
4. Pour que chaque couche évolue indépendamment. Si on change de base de données, seul le repository change. Si on change de framework HTTP, seuls les controllers changent. La logique métier (le cœur) reste intacte.
5. Une classe/module ne devrait avoir qu'une seule raison de changer. Ex: un `UserService` ne devrait pas envoyer d'emails — c'est la responsabilité d'un `EmailService`. Si les règles d'envoi d'email changent, seul `EmailService` est modifié.
6. Dependency Inversion — le service dépend d'une implémentation concrète (Prisma) au lieu d'une abstraction (interface). Impossible de tester le service sans base de données, impossible de changer d'ORM sans modifier le service.
7. **A**
8. MVC est un pattern de présentation (comment organiser l'UI et les contrôleurs). Clean Architecture est un pattern全局 (comment organiser TOUT le projet en couches concentriques avec dépendances vers l'intérieur). MVC peut être utilisé DANS la couche présentation de Clean Architecture.
9. Open/Closed — le code est fermé à la modification (on ne touche pas au code existant) mais ouvert à l'extension (on ajoute une nouvelle classe implémentant une interface de paiement).
10. **A**
11. Pour pouvoir remplacer l'implémentation sans modifier la classe qui l'utilise. Pour les tests (injecter un mock). Pour la flexibilité (changer de DB, d'ORM, d'API externe). Pour respecter Dependency Inversion.
12. Violation de Single Responsibility et de Liskov — le `UserService` est couplé à Prisma via l'héritage. Il hérite de méthodes qui n'ont rien à voir avec la logique utilisateur. Préférer la composition (injecter un repository) à l'héritage.
13. **A**
14. "Imagine construire une maison. L'architecture, c'est les plans. Sans plans, tu peux construire une cabane qui tient debout, mais pas un immeuble qui dure 50 ans. Le code sans architecture, c'est la cabane : ça marche au début, mais dès qu'il faut modifier, tout s'écroule."
15. **A**

### B. Corrigé — Module 2 (Conception)
1. **A**
2. **A**
3. **A**
4. Pour que le frontend et le backend puissent être développés en parallèle. Le contrat d'API est l'interface entre les deux équipes. Chacun sait exactement ce que l'autre attend. Évite les allers-retours "ce champ s'appelle comment ?".
5. `author` = celui qui a créé la tâche (toujours rempli). `assignee` = celui qui doit la réaliser (peut être différent de l'auteur, ou vide si non assigné). Un manager peut créer une tâche et l'assigner à un membre de son équipe.
6. Ajouter un modèle `Comment` avec `id, text, taskId FK, authorId FK, createdAt`. Ajouter la relation `Task 1-N Comment`. Mettre à jour le schéma Prisma et créer une migration. Ajouter les endpoints `GET /api/tasks/:id/comments` et `POST /api/tasks/:id/comments`.
7. **A**
8. Permet de livrer de la valeur rapidement (MVP), d'avoir du feedback tôt, et de corriger le tir. Si on attend d'avoir tout fini, on découvre les problèmes trop tard. Itération 1 = valeur minimale, itération 2 = améliorations, itération 3 = polish.
9. Ajouter à la prochaine itération. Ne pas modifier le scope de l'itération en cours (scope creep). Si c'est critique, échanger avec le client pour reprioriser : "Si on ajoute les tags, on reporte la feature X. Qu'est-ce qui est le plus important ?"
10. **A**
11. Permet de savoir quand la tâche a été modifiée pour la dernière fois, sans avoir à le gérer manuellement. Utile pour le tri ("trier par date de modification"), les audits, et la synchronisation.
12. Une tâche peut ne pas encore être assignée à quelqu'un (créée mais en attente d'assignation). `assigneeId` nullable permet cet état. Si on veut forcer l'assignation, on met `assigneeId Int` (non nullable) et on assigne l'auteur par défaut.
13. **A**
14. "Voici le cahier des charges et le schéma de base de données que j'ai conçus AVANT de coder. Chaque décision est justifiée. Cette phase de conception m'a permis d'identifier les problèmes tôt et de coder plus efficacement ensuite."
15. **A**

### C. Corrigé — Module 3 (Implémentation)
1. **A**
2. **A**
3. **A**
4. Performance (ne pas charger 1000 tâches pour en afficher 10), sécurité (ne pas exposer les tâches d'autres utilisateurs dans le frontend), cohérence (les filtres serveur reflètent l'état réel de la DB). Les filtres client sont un complément UX, pas une sécurité.
5. Afficher un message et une illustration : "Aucune tâche pour le moment. Créez votre première tâche !" avec un bouton CTA "Nouvelle tâche". Ne pas afficher un tableau vide sans explication.
6. L'interceptor axios détecte le 401 → appelle automatiquement `/api/auth/refresh` → réessaie la requête originale. L'utilisateur ne voit rien, l'opération réussit. Si le refresh échoue aussi → rediriger vers login.
7. **A**
8. Centralisé (un seul endroit), automatique (toutes les requêtes sont protégées), transparent pour les composants (ils ne gèrent pas l'auth), évite les bugs (oubli de gérer le 401 dans un composant).
9. Toutes les tâches (pas de filtre = pas de restriction). Pour un utilisateur standard, c'est une faille de sécurité si on oublie le `where: { authorId }`. Toujours filtrer par userId dans les routes non-admin.
10. **A**
11. Réutiliser le même composant `TaskForm` avec `initialValues` vide (création) ou pré-rempli (édition). Le `onSubmit` appelle POST ou PUT selon le mode. DRY, et l'expérience utilisateur est cohérente (même formulaire).
12. PATCH = modification partielle. On ne modifie QUE le statut, pas le reste de la tâche. PUT remplacerait toute la tâche (il faudrait renvoyer tous les champs). PATCH est sémantiquement correct pour un changement de statut.
13. **A**
14. Tester chaque fonctionnalité du cahier des charges : inscription → connexion → créer tâche → modifier → filtrer → supprimer. Utiliser les DevTools (Network) pour vérifier les requêtes. Tester les cas d'erreur (champ vide, token expiré, tâche inexistante).
15. **A**

### D. Corrigé — Module 4 (Déploiement & portfolio)
1. **A**
2. **A**
3. **A**
4. Une image vaut 1000 mots. Les captures permettent au recruteur de voir l'application en 10 secondes sans avoir à se connecter. Elles donnent confiance ("c'est du vrai, pas juste du texte").
5. Description claire (ce que fait le projet), démo en ligne (lien cliquable), badges (build, license), stack visuelle (logos), captures/GIF, installation rapide (3 commandes max). Le recruteur passe 30 secondes sur un README — il doit comprendre immédiatement.
6. Vérifier les logs Render, corriger le bug, redéployer. Répondre au recruteur : "Je viens de corriger un bug de déploiement, c'est réglé. Voici le lien." La transparence et la réactivité sont appréciées.
7. **A**
8. Montre ta capacité à communiquer, à expliquer des choix techniques, et à partager tes connaissances. Un recruteur qui voit ton article sait que tu es capable de documenter et de former les autres. C'est un signal fort pour un junior.
9. Render met en veille les services gratuits après 15 minutes d'inactivité (cold start, 30-50s de réveil). Solutions : passer au plan payant (Hobby $7/mois), utiliser un pinger (UptimeRobot, cron-job.org) pour maintenir le service actif, ou migrer vers Fly.io (pas de cold start sur le plan gratuit).
10. **A**
11. "TaskFlow, c'est ma démonstration de compétence full-stack : authentification JWT, CRUD temps réel, dashboard avec filtres, le tout déployé en production. Voici la démo en ligne. Le code source est sur GitHub. Je l'ai conçu et réalisé en une journée."
12. **A**

### E. Corrigé — Module 5 (Validation & célébration)
1. **A**
2. **A**
3. **A**
4. Réponse personnelle — exemples attendus : React (écosystème riche, demande forte), déploiement (autonomie complète), architecture (code qui dure).
5. Réponse personnelle — exemples : gérer l'asynchrone (event loop, Promises), sécuriser l'API (OWASP, JWT), déployer en production (configuration cross-service).
6. Remédiation ciblée 48h : identifier les points faibles (grille J28), les travailler, re-soumettre. Les 2 points manquants sont probablement sur un livrable spécifique.
7. **A**
8. P3-A (admin sys) = l'infrastructure qui héberge les applications. P3-B (data) = l'analyse qui pilote les décisions. P3-C (web) = les applications qui servent les utilisateurs. P4 (cloud) = passer de l'infrastructure locale au cloud. Chaque tome ajoute une couche de compétence complémentaire.
9. **A**
10. **A**
11. Réponse personnelle — exemples : "Ne saute pas les fondamentaux JS avant React", "Déploie le plus tôt possible", "Écris des tests même simples", "Documente tout — ton moi du futur te remerciera."
12. **A**
13. **A**
14. Projets personnels (améliorer TaskFlow : notifications, collaboration temps réel, tests automatisés), open source (contribuer à des projets React/Express), certifications (AWS, Azure), veille (blogs, podcasts, conférences), pratique continue.
15. **A**