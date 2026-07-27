# TOME P3-C — Jour 27 (14h)

## Découpage horaire opérationnel J27
- Déploiement frontend (Vercel/Netlify, build, variables d'environnement, CI/CD) — **4h**
- Déploiement backend (Render, Dockerfile, environment vars, health checks) — **3h**
- HTTPS, Domaines et DNS (certificats TLS, Let's Encrypt, DNS configuration) — **3h**
- Labs déploiement complet (frontend + backend + DB en production) — **2h**
- Banque de questions + suivi P1 — **2h**

---

## 1) Déploiement frontend — Vercel, build, CI/CD (4h)

### Objectifs d'apprentissage
- Déployer une application React/Vite sur Vercel ou Netlify.
- Configurer les variables d'environnement de production.
- Mettre en place un déploiement continu (CI/CD) depuis GitHub.
- Comprendre le build de production (minification, tree-shaking, code splitting).
- Gérer les redirections SPA (client-side routing vs server-side).

### Contenu pédagogique
Le déploiement transforme un projet local en application accessible par tous. Un développeur doit savoir mettre en production son code.

Points clés:
1. **Vercel** (recommandé pour React/Vite) :
   - `npm install -g vercel` puis `vercel` dans le projet → déploiement interactif.
   - Ou connecter le repo GitHub → Vercel détecte automatiquement le framework (Vite) et configure le build (`npm run build`, dossier `dist`).
   - Chaque push sur la branche principale déclenche un déploiement automatique.
   - Preview deployments : chaque Pull Request a son URL de preview.
2. **Variables d'environnement** : dans Vercel Dashboard → Settings → Environment Variables → ajouter `VITE_API_URL=https://mon-api.onrender.com`. Les variables préfixées `VITE_` sont exposées au frontend (`import.meta.env.VITE_API_URL`). Ne jamais mettre de secrets dans `VITE_*`.
3. **Build de production** : `npm run build` exécute Vite en mode production → minification (réduction de la taille des fichiers), tree-shaking (suppression du code mort), code splitting (découpage en chunks chargés à la demande). Le dossier `dist/` contient les fichiers statiques optimisés.
4. **Redirections SPA** : les applications React utilisent le routage côté client. Si l'utilisateur rafraîchit `/about`, le serveur doit servir `index.html` (pas une erreur 404 car `/about` n'existe pas côté serveur). Vercel gère ça automatiquement avec un fichier `vercel.json` : `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`.
5. **Preview vs Production** : chaque PR a son URL de preview (ex: `mon-app-git-feat-42.vercel.app`). La branche `main` est déployée en production (`mon-app.vercel.app`). Possibilité d'ajouter un domaine personnalisé.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : déployer le mini-projet React "Dashboard utilisateurs" (J23) sur Vercel. Configurer la variable d'environnement `VITE_API_URL`. Vérifier que l'application fonctionne en production.
   - **Corrigé détaillé** : `cd dashboard-users && npm run build` → vérifier que le build réussit. `vercel --prod` → suivre les instructions. Dans Vercel Dashboard, ajouter `VITE_API_URL=https://jsonplaceholder.typicode.com`. Redéployer. Ouvrir l'URL de production → vérifier que les utilisateurs sont chargés depuis l'API.
2. **Exercice 2 (intermédiaire)** : connecter le repo GitHub à Vercel. Activer le déploiement automatique sur la branche `main`. Créer une Pull Request avec un changement mineur → vérifier que Vercel crée un preview deployment avec une URL unique. Commenter le preview dans la PR.
   - **Corrigé détaillé** : Vercel Dashboard → Add New Project → sélectionner le repo GitHub. Configuration automatique détectée. Dans GitHub, créer une branche `feat/new-feature`, modifier un composant, créer une PR. Vercel commente automatiquement la PR avec l'URL de preview. Le reviewer peut tester la feature avant de merger.
3. **Exercice 3 (avancé)** : configurer un domaine personnalisé (`mon-app.com`) sur Vercel avec un sous-domaine (`app.mon-app.com`). Configurer le DNS (CNAME vers `cname.vercel-dns.com`). Ajouter le fichier `vercel.json` avec les rewrites SPA et les headers de sécurité (CSP, HSTS).
   - **Corrigé détaillé** : `vercel.json` : `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }], "headers": [{ "source": "/(.*)", "headers": [{ "key": "Strict-Transport-Security", "value": "max-age=63072000" }] }] }`. Domaine → Vercel Dashboard → Domains → Add → suivre les instructions DNS. Vérifier avec `curl -I https://app.mon-app.com` → headers de sécurité présents.

### Nouvelles abréviations rencontrées
- CI/CD | *(déjà existant, section C)* | Continuous Integration / Continuous Deployment — chaque push déclenche un build et déploiement | Interagit avec Git, Vercel, GitHub Actions
- DNS | *(déjà existant, section F)* | Domain Name System — configuration nécessaire pour les domaines personnalisés | Interagit avec Vercel, les registrars, HTTPS

### Banque de questions du module (15)
1. QCM: Vercel détecte automatiquement... A) le framework et la commande de build B) les bugs C) les utilisateurs
2. QCM: les variables `VITE_*` sont... A) exposées au frontend B) secrètes C) inaccessibles
3. QCM: un preview deployment est créé pour... A) chaque Pull Request B) chaque commit local C) rien
4. Ouverte: pourquoi utiliser un preview deployment plutôt que de tester en local ?
5. Ouverte: différence entre `VITE_API_URL` et une variable d'environnement backend.
6. Cas: l'utilisateur rafraîchit `/about` et voit une erreur 404. Problème et solution ?
7. QCM: le build de production inclut... A) minification et tree-shaking B) le code source non modifié C) les node_modules
8. Ouverte: pourquoi ne pas mettre de secrets (API keys) dans `VITE_*` ?
9. Cas: le build Vite échoue en production mais fonctionne en local. Diagnostic ?
10. QCM: Vercel + GitHub = A) déploiement automatique à chaque push B) déploiement manuel C) aucun lien
11. Ouverte: comment rollback un déploiement Vercel ?
12. Cas: `import.meta.env.VITE_API_URL` est `undefined` en production. Solution ?
13. QCM: objectif du module 1 = A) déployer un frontend React en production B) garder le code en local C) éviter Vercel
14. Ouverte: comment gérer plusieurs environnements (dev, staging, prod) ?
15. QCM: résultat attendu = A) application frontend déployée et accessible en ligne B) code uniquement local C) erreur 500

---

## 2) Déploiement backend — Render, Docker, health checks (3h)

### Objectifs d'apprentissage
- Déployer une API Node.js/Express sur Render (PaaS gratuit).
- Créer un Dockerfile pour conteneuriser l'application.
- Configurer les variables d'environnement de production.
- Mettre en place un health check endpoint.
- Gérer les logs et la supervision en production.

### Contenu pédagogique
Le backend doit être accessible 24/7, sécurisé, et supervisé. Le déploiement backend est plus complexe que le frontend car il a un état (base de données).

Points clés:
1. **Render** (PaaS gratuit avec limites) :
   - Créer un "Web Service" connecté au repo GitHub.
   - Configurer : Build Command = `npm install && npx prisma generate && npx prisma migrate deploy`, Start Command = `node src/server.js`.
   - Ajouter les variables d'environnement : `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL`.
   - Render fournit une URL gratuite (`mon-api.onrender.com`) avec HTTPS automatique.
2. **Dockerfile** : conteneuriser l'application pour la rendre portable. `FROM node:20-alpine`, `WORKDIR /app`, `COPY package*.json ./`, `RUN npm ci --only=production`, `COPY . .`, `RUN npx prisma generate`, `EXPOSE 3000`, `CMD ["node", "src/server.js"]`. L'image peut être déployée sur n'importe quelle plateforme supportant Docker (Render, Fly.io, Railway, AWS).
3. **Health check** : `GET /api/health` doit retourner 200 si l'application est fonctionnelle. Vérifier la connexion DB : `await prisma.$queryRaw`SELECT 1`` → si OK, l'API est saine. Render utilise ce endpoint pour savoir si le service est up et le redémarrer automatiquement en cas d'échec.
4. **Variables d'environnement production** : `NODE_ENV=production` (désactive les logs verbeux, active les optimisations Express). `JWT_SECRET` = chaîne aléatoire forte (générer avec `openssl rand -base64 64`). `DATABASE_URL` = URL de la base de production (Render PostgreSQL, Neon, Supabase).
5. **Logs et supervision** : `morgan('combined')` en production (logs Apache standard). Centraliser les logs (Render Logs, ou Papertrail, Logtail). Configurer une alerte si le service est down (Render envoie un email si le health check échoue).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : déployer l'API "Produits" (J25) sur Render. Configurer les variables d'environnement. Vérifier que `GET /api/health` retourne 200.
   - **Corrigé détaillé** : Render Dashboard → New Web Service → connecter le repo GitHub. Build Command : `npm install && npx prisma generate && npx prisma migrate deploy`. Start Command : `node src/server.js`. Ajouter `DATABASE_URL` (Render PostgreSQL gratuit), `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL`. Déployer. Tester : `curl https://mon-api.onrender.com/api/health` → 200. Tester les endpoints CRUD.
2. **Exercice 2 (intermédiaire)** : écrire un Dockerfile pour l'API. Builder l'image localement, la tester, puis déployer sur Render en mode Docker (au lieu du build natif).
   - **Corrigé détaillé** : Dockerfile multi-stage (build + run). `docker build -t mon-api .`, `docker run -p 3000:3000 --env-file .env mon-api`. Tester localement. Render → changer le type en "Docker" → le Dockerfile est détecté automatiquement. Avantage Docker : environnement identique partout, pas de "works on my machine".
3. **Exercice 3 (avancé)** : configurer un health check avancé qui vérifie la DB ET l'espace disque. Configurer Render pour redémarrer automatiquement si le health check échoue 3 fois consécutives. Simuler une panne DB et observer le redémarrage automatique.
   - **Corrigé détaillé** : `app.get('/api/health', async (req, res) => { try { await prisma.$queryRaw`SELECT 1`; const disk = await checkDiskSpace(); res.json({ status: 'ok', db: 'connected', disk: `${disk.free}% free` }); } catch (err) { res.status(503).json({ status: 'error', message: err.message }); } });`. Render → Settings → Health Check Path = `/api/health`, interval = 30s. Tester : couper temporairement la DB → après 3 échecs (90s), Render redémarre le service.

### Nouvelles abréviations rencontrées
- PaaS | *(déjà existant, section H)* | Platform as a Service — Render fournit une plateforme d'hébergement | Interagit avec le déploiement, les bases de données managées, les logs
- Docker | *(déjà existant, section I)* | Plateforme de conteneurisation — utilisé pour packager l'application | Interagit avec le déploiement, les environnements, la reproductibilité

### Banque de questions du module (15)
1. QCM: Render est... A) un PaaS pour déployer des applications B) une base de données C) un framework
2. QCM: un health check endpoint sert à... A) vérifier que l'API est fonctionnelle B) tester le frontend C) nettoyer la DB
3. QCM: `NODE_ENV=production` active... A) les optimisations Express B) le mode debug C) rien
4. Ouverte: pourquoi utiliser un Dockerfile même si Render supporte le build natif ?
5. Ouverte: différence entre Build Command et Start Command sur Render.
6. Cas: le déploiement Render échoue avec "Cannot find module 'prisma'". Solution ?
7. QCM: `FROM node:20-alpine` dans un Dockerfile... A) utilise une image Node.js légère B) utilise une image lourde C) est invalide
8. Ouverte: pourquoi `npm ci --only=production` plutôt que `npm install` dans le Dockerfile ?
9. Cas: le health check retourne 200 mais l'API ne répond pas aux requêtes. Problème ?
10. QCM: Render redémarre le service si... A) le health check échoue plusieurs fois B) le service est trop rapide C) rien
11. Ouverte: comment générer un `JWT_SECRET` sécurisé pour la production ?
12. Cas: déploiement réussi mais `CORS` bloque les requêtes du frontend. Solution ?
13. QCM: objectif du module 2 = A) déployer un backend en production B) garder tout en local C) éviter Docker
14. Ouverte: comment mettre à jour une application déployée sans downtime ?
15. QCM: résultat attendu = A) API backend déployée et fonctionnelle B) erreur 503 C) pas de health check

---

## 3) HTTPS, Domaines et DNS (3h)

### Objectifs d'apprentissage
- Comprendre le fonctionnement de TLS/HTTPS et des certificats.
- Configurer un certificat TLS avec Let's Encrypt.
- Gérer les DNS pour un domaine personnalisé.
- Forcer HTTPS (redirection HTTP → HTTPS) et HSTS.
- Tester la configuration TLS (SSL Labs, security headers).

### Contenu pédagogique
HTTPS n'est plus optionnel — c'est un prérequis pour toute application web. Les navigateurs marquent les sites HTTP comme "Non sécurisé".

Points clés:
1. **TLS/HTTPS** : chiffre la communication entre le navigateur et le serveur. Empêche l'interception (man-in-the-middle), la modification, et l'usurpation. Basé sur des certificats X.509 émis par une Autorité de Certification (CA). Le cadenas vert dans la barre d'adresse.
2. **Let's Encrypt** : CA gratuite qui émet des certificats TLS automatisés. Utilise le protocole ACME pour prouver la propriété du domaine. Renouvellement automatique tous les 90 jours. Intégré nativement dans Vercel, Render, Netlify — aucune configuration manuelle nécessaire.
3. **DNS** : traduit un nom de domaine (`mon-app.com`) en adresse IP. Types d'enregistrements : `A` (IPv4), `AAAA` (IPv6), `CNAME` (alias vers un autre nom), `TXT` (texte, vérification), `MX` (email). Pour Vercel : ajouter un `CNAME` pointant vers `cname.vercel-dns.com`. Propagation DNS : 24-48h (mais souvent quelques minutes).
4. **HSTS (HTTP Strict Transport Security)** : header qui force le navigateur à utiliser HTTPS pour toutes les futures requêtes vers ce domaine. `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`. Une fois reçu, le navigateur refuse HTTP pour ce domaine pendant 1 an.
5. **Redirection HTTP → HTTPS** : Vercel et Render le font automatiquement. Si on gère son propre serveur : middleware Express qui redirige `if (req.headers['x-forwarded-proto'] !== 'https') return res.redirect('https://' + req.headers.host + req.url);`.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : tester la configuration TLS de l'application déployée avec SSL Labs (ssllabs.com/ssltest/). Vérifier la note (doit être A ou A+). Identifier les points d'amélioration.
   - **Corrigé détaillé** : Ouvrir SSL Labs, entrer l'URL. Vérifier : note globale, protocoles supportés (TLS 1.2, 1.3), cipher suites, HSTS activé. Si note < A : vérifier que les anciens protocoles (TLS 1.0, 1.1) sont désactivés, que HSTS est configuré. Vercel/Render gèrent ça automatiquement → note A+.
2. **Exercice 2 (intermédiaire)** : configurer un domaine personnalisé sur Vercel. Acheter un domaine (ou utiliser un sous-domaine gratuit). Configurer le DNS (CNAME). Vérifier que HTTPS fonctionne automatiquement.
   - **Corrigé détaillé** : Vercel Dashboard → Project → Settings → Domains → Add. Entrer le domaine. Vercel fournit les enregistrements DNS à configurer. Aller chez le registrar (Namecheap, OVH) → ajouter le CNAME. Attendre la propagation. Vérifier avec `dig mon-app.com CNAME`. Une fois propagé, Vercel émet automatiquement un certificat Let's Encrypt. HTTPS est actif.
3. **Exercice 3 (avancé)** : configurer HSTS manuellement (si non géré par la plateforme). Ajouter le header dans l'application Express. Vérifier avec `curl -I` et le test SSL Labs. S'assurer que `includeSubDomains` est cohérent avec la structure des sous-domaines.
   - **Corrigé détaillé** : `app.use((req, res, next) => { if (req.secure) { res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload'); } next(); });`. Vérifier : `curl -I https://mon-app.com` → header présent. SSL Labs → vérifier HSTS activé. Attention : une fois HSTS activé, impossible de revenir à HTTP. Tester en staging d'abord.

### Nouvelles abréviations rencontrées
- TLS | *(déjà existant, section G)* | Transport Layer Security — protocole de chiffrement HTTPS | Interagit avec Let's Encrypt, les navigateurs, les certificats
- HSTS | HTTP Strict Transport Security | Header forçant HTTPS pour toutes les requêtes futures | Interagit avec les navigateurs, TLS, la sécurité
- CA | Certificate Authority | Autorité de certification émettant les certificats TLS (ex: Let's Encrypt) | Interagit avec TLS, les navigateurs, la validation de domaine

### Banque de questions du module (15)
1. QCM: HTTPS chiffre... A) la communication navigateur-serveur B) la base de données C) le code source
2. QCM: Let's Encrypt est... A) une autorité de certification gratuite B) un framework C) un outil de build
3. QCM: un enregistrement DNS CNAME... A) crée un alias vers un autre nom de domaine B) pointe vers une IP C) envoie des emails
4. Ouverte: pourquoi HTTPS est-il indispensable même pour un site sans données sensibles ?
5. Ouverte: différence entre un certificat TLS et le protocole TLS.
6. Cas: le navigateur affiche "Votre connexion n'est pas privée". Problème ?
7. QCM: HSTS force le navigateur à... A) utiliser HTTPS pour toutes les futures requêtes B) bloquer le site C) accepter HTTP
8. Ouverte: pourquoi le renouvellement automatique des certificats est-il important ?
9. Cas: propagation DNS — le site est accessible depuis un réseau mais pas un autre. Cause ?
10. QCM: `includeSubDomains` dans HSTS... A) applique HSTS à tous les sous-domaines B) bloque les sous-domaines C) rien
11. Ouverte: comment tester la configuration TLS d'un site ?
12. Cas: certificat expiré = site inaccessible. Comment éviter ?
13. QCM: objectif du module 3 = A) configurer HTTPS et DNS en production B) rester en HTTP C) ignorer les certificats
14. Ouverte: pourquoi utiliser `preload` dans HSTS ?
15. QCM: résultat attendu = A) site en HTTPS avec certificat valide B) HTTP uniquement C) certificat expiré

---

## 4) Labs déploiement complet — frontend + backend + DB (2h)

### Objectifs d'apprentissage
- Déployer une application full-stack (React + Express + PostgreSQL) en production.
- Connecter le frontend et le backend via les variables d'environnement.
- Vérifier le flux complet : utilisateur → frontend → API → base de données.
- Mettre en place les health checks et la supervision de base.
- Documenter l'architecture de déploiement.

### Contenu pédagogique
Scénario : déployer l'application "Gestion de contacts" (frontend React J24 + backend Express J25 + PostgreSQL) sur Vercel (frontend) + Render (backend + DB).

Étapes :
1. Déployer la base de données PostgreSQL sur Render (gratuit, 1 Go).
2. Déployer le backend sur Render, connecté à la DB.
3. Déployer le frontend sur Vercel, configuré avec l'URL du backend.
4. Tester le flux complet CRUD en production.
5. Documenter l'architecture (schéma avec URLs, services, flux).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : déployer la DB, le backend, et le frontend. Tester que le flux complet fonctionne.
   - **Corrigé attendu** : Render PostgreSQL → copier `DATABASE_URL`. Backend → déployer avec cette URL + `JWT_SECRET` + `FRONTEND_URL`. Frontend → déployer avec `VITE_API_URL=https://backend.onrender.com`. Tester : créer un contact via le frontend → vérifier qu'il apparaît → vérifier dans la DB (Prisma Studio).
2. **Exercice 2 (intermédiaire)** : schématiser l'architecture de déploiement (ASCII art ou diagramme). Montrer le flux d'une requête utilisateur : navigateur → DNS → Vercel (frontend) → Render (backend) → Render PostgreSQL. Indiquer les protocoles (HTTPS) et les ports.
3. **Exercice 3 (avancé)** : configurer un pipeline CI/CD complet : push sur `main` → Vercel déploie le frontend ET Render déploie le backend (via deploy hook ou GitHub Actions). Tester avec un changement mineur.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: le lab J27 simule... A) un déploiement full-stack complet B) un exercice local C) rien
2. QCM: `VITE_API_URL` dans le frontend pointe vers... A) l'URL du backend B) la base de données C) rien
3. QCM: un déploiement full-stack implique... A) frontend + backend + base de données B) un seul service C) rien
4. Ouverte: pourquoi séparer le frontend et le backend sur deux plateformes différentes ?
5. QCM: résultat attendu = A) application full-stack accessible en ligne B) services non connectés C) erreurs CORS

---

## 5) Banque de questions + suivi P1 (2h)

### Objectifs d'apprentissage
- Valider les acquis J27. Planifier J28 (Architecture + synthèse P3-C).

### Contenu pédagogique
- 60 min test mixte. 30 min correction. 30 min portfolio + plan J28.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : rédiger une ligne CV intégrant le déploiement.
   - **Corrigé** : "Déploiement d'applications full-stack (React + Node.js + PostgreSQL) sur Vercel et Render avec CI/CD et HTTPS."
2. **Exercice 2 (intermédiaire)** : pitch 60s "Pourquoi le déploiement n'est pas la dernière étape".
   - **Corrigé** : Le déploiement continu réduit les risques : chaque petit changement est testé en production immédiatement. Le preview deployment permet de valider avant de merger. Le health check garantit la disponibilité. Déployer tôt et souvent.
3. **Exercice 3 (avancé)** : plan J28 — "Architecture logicielle et projet de synthèse : concevoir et implémenter une application full-stack complète avec les bonnes pratiques d'architecture."

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: objectif final J27 = A) déploiement full-stack opérationnel B) théorie seule C) rien
2. QCM: plan J28 = A) architecture + synthèse P3-C B) retour au JS C) fin
3. Ouverte: meilleure preuve J27 à montrer ?
4. QCM: preuve solide = A) application déployée accessible en ligne B) promesse C) code local
5. QCM: résultat P1 réussi = A) portfolio enrichi B) rien C) théorie
6. Ouverte: comment relier J27 au poste de développeur full-stack ?
7. QCM: remédiation = A) corriger la lacune B) recommencer C) abandonner
8. QCM: résultat attendu = A) app full-stack en production B) services locaux C) pas de HTTPS

---

## Validation qualité J27 (anti-superficiel)

### Livrables obligatoires fin de J27
1. 1 frontend React déployé sur Vercel avec HTTPS et CI/CD.
2. 1 backend Express déployé sur Render avec health check et Dockerfile.
3. 1 base de données PostgreSQL en production connectée au backend.
4. 1 schéma d'architecture de déploiement (ASCII ou diagramme).
5. 1 preuve portfolio (URLs de production) + mise à jour CV ligne déploiement.

### Grille d'évaluation rapide (100 points)
- Déploiement frontend (Vercel, env vars, SPA rewrites, CI/CD) : **25 pts**
- Déploiement backend (Render, Dockerfile, health check, env vars) : **30 pts**
- HTTPS, DNS et sécurité (TLS, HSTS, CORS production) : **20 pts**
- Intégration full-stack (frontend ↔ backend ↔ DB) : **15 pts**
- Communication technique employabilité : **10 pts**

### Seuil attendu
- **>= 80/100** : J27 validé, passage normal J28.
- **65-79/100** : validé sous remédiation ciblée 24h.
- **< 65/100** : consolidation déploiement requise avant J28.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Frontend)
1. **A**
2. **A**
3. **A**
4. Permet de partager un lien avec un collègue/reviewer sans qu'il ait à cloner le repo et installer les dépendances. Le preview est identique à la production. Accélère le cycle de review.
5. `VITE_API_URL` est injectée au build et exposée dans le bundle JavaScript → visible par tous. Une variable backend (`JWT_SECRET`, `DATABASE_URL`) n'est jamais exposée au navigateur. Ne pas confondre les deux.
6. Le serveur cherche un fichier `/about.html` qui n'existe pas dans une SPA. Solution : configurer les rewrites pour servir `index.html` pour toutes les routes (`vercel.json` avec rewrite `/(.*)` → `/index.html`).
7. **A**
8. Les variables `VITE_*` sont incluses dans le code JavaScript téléchargé par le navigateur → n'importe qui peut les lire dans les DevTools. Les secrets (API keys, tokens) doivent rester côté serveur.
9. Problème d'environnement : variable d'environnement manquante, version Node.js différente, dépendances non installées (vérifier `npm ci`), casse de fichier (Linux est case-sensitive, pas macOS/Windows).
10. **A**
11. Vercel Dashboard → Deployments → choisir un déploiement précédent → "Promote to Production". Instantané, sans rebuild. Idéal en cas d'urgence.
12. La variable n'est pas configurée dans Vercel Dashboard. Aller dans Settings → Environment Variables → ajouter `VITE_API_URL` → redéployer. Les variables sont injectées au moment du build.
13. **A**
14. Dev = localhost, variables locales (`.env`). Staging = preview deployments Vercel, variables de staging. Production = déploiement principal, variables de production. Utiliser des fichiers `.env.development`, `.env.production` ou les configurer dans Vercel par environnement.
15. **A**

### B. Corrigé — Module 2 (Backend)
1. **A**
2. **A**
3. **A**
4. Docker garantit la reproductibilité : même environnement en local, en CI, et en production. Si le build natif de Render change de version, l'appli peut casser. Docker fige l'environnement. De plus, Docker facilite le changement de plateforme.
5. Build Command = exécutée UNE fois au déploiement (installer les dépendances, compiler, générer Prisma). Start Command = exécutée pour LANCER l'application (et relancée si le processus crashe). Build = setup, Start = run.
6. `prisma generate` n'a pas été exécuté. Ajouter `npx prisma generate` dans le Build Command. Le client Prisma est généré à partir du schéma — il n'est pas commité.
7. **A**
8. `npm ci` est plus rapide et déterministe (se base sur le `package-lock.json` exact). `--only=production` ignore les `devDependencies` → image plus petite, surface d'attaque réduite.
9. Le health check vérifie juste que le serveur HTTP répond, mais les routes métier peuvent être cassées (erreur 500). Améliorer le health check pour tester une requête DB et une route métier critique.
10. **A**
11. `openssl rand -base64 64` → chaîne aléatoire de 64 octets encodée en base64. Ne jamais utiliser une chaîne simple ou un mot. Idéalement, générer un secret unique par environnement.
12. Mettre à jour `FRONTEND_URL` dans les variables d'environnement de Render avec l'URL Vercel de production (`https://mon-app.vercel.app`). Vérifier que le middleware CORS utilise bien cette variable.
13. **A**
14. Render supporte le "zero-downtime deployment" : il démarre la nouvelle version AVANT d'arrêter l'ancienne. Les requêtes sont basculées progressivement. S'assurer que les migrations DB sont rétrocompatibles.
15. **A**

### C. Corrigé — Module 3 (HTTPS, DNS)
1. **A**
2. **A**
3. **A**
4. Sans HTTPS, un attaquant sur le même réseau WiFi peut injecter des publicités, voler des cookies, ou modifier le contenu. Même un site "simple" peut être utilisé pour du phishing si son intégrité n'est pas garantie. De plus, les navigateurs marquent HTTP comme non sécurisé → perte de confiance.
5. Le protocole TLS définit COMMENT chiffrer (algorithme, handshake). Le certificat TLS prouve QUI est le serveur (identité vérifiée par une CA). On a besoin des deux : le certificat pour l'identité, le protocole pour le chiffrement.
6. Le certificat SSL/TLS est expiré ou invalide (auto-signé, domaine ne correspond pas, CA non reconnue). Vérifier la date d'expiration du certificat, s'assurer qu'il couvre bien le domaine (www vs non-www).
7. **A**
8. Les certificats Let's Encrypt expirent après 90 jours. Sans renouvellement automatique, le site devient inaccessible brutalement. Les plateformes modernes (Vercel, Render) gèrent ça automatiquement.
9. Les DNS n'ont pas encore propagé partout. Chaque FAI a son propre cache DNS avec des TTL différents. Attendre 24-48h maximum. Vérifier avec `dig` en spécifiant différents serveurs DNS (`@8.8.8.8`, `@1.1.1.1`).
10. **A**
11. SSL Labs (ssllabs.com/ssltest), testssl.sh (ligne de commande), Security Headers (securityheaders.com). Vérifier la note TLS, les cipher suites, HSTS, CSP, et les autres headers de sécurité.
12. Activer le renouvellement automatique (Let's Encrypt + plateforme moderne). Mettre en place une alerte avant expiration (monitoring certificat). Utiliser un certificat wildcard pour couvrir tous les sous-domaines.
13. **A**
14. `preload` soumet le domaine à la liste HSTS préchargée dans les navigateurs (Chrome, Firefox). Même la toute première connexion se fait en HTTPS — pas de fenêtre de vulnérabilité. Irréversible sans procédure de retrait.
15. **A**

### D-E. Corrigés — Modules 4 & 5 (Labs & Banque)
1. **A**
2. **A**
3. **A**
4. Séparation des responsabilités : le frontend (statique) est optimisé pour Vercel (CDN global). Le backend (stateful) a besoin d'un environnement persistant (Render). Chaque plateforme est spécialisée. Scaling indépendant.
5. **A**
1. **A**
2. **A**
3. Les URLs de production (frontend + backend) + le schéma d'architecture + la preuve que le flux CRUD fonctionne.
4. **A**
5. **A**
6. Le déploiement est la compétence qui transforme un projet en produit. Un développeur full-stack qui sait déployer est autonome de A à Z. C'est un différenciateur fort pour un junior.
7. **A**
8. **A**