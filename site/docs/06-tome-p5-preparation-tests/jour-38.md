# TOME P5 — Jour 38 (14h)

## Découpage horaire opérationnel J38
- Révision P3-C — Développement web (JS, React, Node.js/Express, Prisma, déploiement, sécurité) — **5h**
- Révision P4 — Cloud, sécurité transversale, gouvernance, anglais — **5h**
- Banque de questions chronométrée P3-C/P4 (100 questions, 2h30) — **2h30**
- Correction + analyse des lacunes + suivi P1 — **1h30**

---

## 1) Révision P3-C — Développement web (5h)

### Objectifs d'apprentissage
- Résumer les compétences clés acquises en développement web et en déploiement.
- Réviser les concepts essentiels de JavaScript, React, Node.js/Express, Prisma et architecture web.
- Préparer la réussite du test chronométré P3-C/P4.

### Contenu pédagogique
- Synthèse structurée des connaissances techniques de J23 à J28.
- Rappel des bonnes pratiques de développement, sécurité et déploiement.

### Synthèse des points clés P3-C (J23-J28)

**JavaScript ES6+ (J23) :**
- `let`/`const` (block scope) vs `var` (function scope, hoisting).
- Arrow functions (`() =>`), `this` lexical, pas de `this` propre.
- Destructuring : `const { nom, age } = obj`, `const [a, b] = arr`.
- Spread (`...arr`, `...obj`) / Rest (`...args`).
- Template literals : `` `Bonjour ${nom}` ``.
- Classes : `class`, `constructor`, `extends`, `super`.
- Asynchrone : callbacks, Promises (`.then/.catch`), async/await, event loop.
- Fetch API : `fetch(url).then(r => r.json())`, vérifier `response.ok`.
- DOM avancé : event delegation, custom events, IntersectionObserver.
- Modules : ES modules (`import`/`export`), npm, Vite, HMR, bundling.

**React (J24) :**
- JSX (compilé en `createElement`), composants fonctionnels, props (immutable), PropTypes.
- `useState` : `[state, setState]`, asynchrone, forme fonctionnelle `prev => prev + 1`.
- `useEffect` : effets de bord, tableau de dépendances (`[]` = mount, `[dep]` = update).
- `useContext` : éviter le prop drilling, `createContext`, `Provider`, `useContext`.
- `useReducer` : état complexe, `(state, action) => newState`, `dispatch`.
- Custom hooks : fonctions `use*`, réutiliser la logique.
- React Router v6 : `BrowserRouter`, `Routes`, `Route`, `Link`, `useParams`, `useNavigate`.
- Formulaires contrôlés : `value` + `onChange`, validation.

**Node.js/Express & API REST (J25) :**
- Express : `app.get/post/put/delete`, middlewares (`cors`, `express.json`, `morgan`), `req.params/query/body`, `res.status().json()`.
- API REST : conventions (ressources au pluriel), codes HTTP (200, 201, 204, 400, 401, 404, 409, 422, 500).
- Validation : Zod (`z.object`, `safeParse`).
- PostgreSQL : `pg` Pool, requêtes paramétrées (`$1`), injections SQL (bannir les concaténations).
- Migrations, pattern Repository.
- Transactions : `BEGIN/COMMIT/ROLLBACK`.

**ORM, Auth & Sécurité (J26) :**
- Prisma : `schema.prisma`, migrations, client CRUD, relations (`include`, `select`), `$transaction`.
- JWT : `jwt.sign(payload, secret, { expiresIn })`, `jwt.verify`, middleware auth.
- Bcrypt : `hash(password, 10)`, `compare(password, hash)`.
- Refresh tokens : httpOnly cookie, rotation, reuse detection.
- Sécurité : Helmet (headers), CORS (`origin`), rate-limiting (`express-rate-limit`), OWASP Top 10, CSP.

**Déploiement (J27) :**
- Frontend : Vercel (auto-détection Vite/React, preview deployments, `vercel.json` rewrites SPA).
- Backend : Render (Build/Start commands, env vars, Dockerfile, health check endpoint).
- HTTPS : TLS, Let's Encrypt (auto sur Vercel/Render), HSTS.
- DNS : A, CNAME, propagation.
- CI/CD : GitHub → Vercel/Render auto-deploy.

**Architecture & Synthèse (J28) :**
- SOLID, MVC (Model-View-Controller), Clean Architecture (Domain/Application/Infra/Presentation).
- ADR (Architecture Decision Records).
- Projet TaskFlow : React + Express + Prisma + PostgreSQL, JWT auth, déployé Vercel+Render.

### Exercices
- Répondre à 50 questions ciblées P3-C pour mesurer la maîtrise des concepts de développement web.
- Revoir les corrections et noter les points à approfondir avant P4.

### Banque ciblée P3-C (50 questions)

**JavaScript/Asynchrone (10 questions)**
1. QCM: `const x = [1,2,3]; x.push(4);` est... A) autorisé B) interdit C) erreur
2. QCM: `async function f() { return 1; }` retourne... A) une Promise B) 1 C) undefined
3. QCM: `setTimeout(() => console.log('A'), 0); console.log('B');` affiche... A) B puis A B) A puis B C) erreur
4. Ouverte: différence entre `let` et `var`.
5. Ouverte: pourquoi `fetch` ne rejette pas sur un 404 ?
6. QCM: `Promise.all([p1, p2])` rejette si... A) une seule Promise rejette B) toutes réussissent C) rien
7. Cas: `const { a, b = 2 } = { a: 1 }` — que vaut b ?
8. QCM: `[...arr1, ...arr2]` crée... A) un nouveau tableau B) modifie arr1 C) rien
9. Ouverte: différence entre `is` et `==` en Python (rappel) — piège transposable à JS (`===` vs `==`).
10. QCM: `try/catch` avec async/await capture... A) les rejets de Promise B) uniquement les erreurs sync C) rien

**React (12 questions)**
11. QCM: `useState` retourne... A) [valeur, setter] B) {valeur, setter} C) valeur
12. QCM: `useEffect(() => {...}, [])` s'exécute... A) une fois au montage B) à chaque rendu C) jamais
13. QCM: `useContext` résout... A) le prop drilling B) les performances C) le CSS
14. Ouverte: pourquoi la prop `key` est-elle obligatoire dans les listes React ?
15. QCM: les props sont... A) immuables B) modifiables C) optionnelles
16. Cas: `setCount(count + 1)` appelé 3 fois. Résultat ?
17. QCM: React Router `useParams()` retourne... A) les paramètres d'URL B) les query strings C) le state
18. Ouverte: différence entre state et props.
19. QCM: `useReducer` est préférable à `useState` quand... A) l'état est complexe B) l'état est simple C) pas d'état
20. QCM: un custom hook commence par... A) `use` B) `handle` C) rien
21. Cas: `useEffect(() => { setCount(count + 1); });` — que se passe-t-il ?
22. QCM: JSX est compilé en... A) React.createElement B) HTML pur C) CSS

**Express/API/DB (14 questions)**
23. QCM: `app.use(express.json())` parse... A) le body JSON B) les URLs C) les cookies
24. QCM: `POST /api/users` doit retourner... A) 201 Created B) 200 OK C) 500
25. QCM: `$1` dans `pool.query('... WHERE id = $1', [42])` évite... A) l'injection SQL B) les doublons C) rien
26. Ouverte: pourquoi valider les données côté serveur même si le frontend valide ?
27. QCM: Prisma `include` charge... A) les relations B) uniquement la PK C) rien
28. Cas: `DELETE /api/users/42` (succès) retourne quel code HTTP ?
29. QCM: JWT contient... A) header, payload, signature B) uniquement un ID C) le mot de passe
30. QCM: bcrypt sert à... A) hasher les mots de passe B) chiffrer les données C) générer des tokens
31. Ouverte: différence entre access token et refresh token.
32. Cas: le client reçoit 401. Que faire ?
33. QCM: Helmet sécurise... A) les headers HTTP B) les routes C) la base de données
34. QCM: CORS doit être restreint en production à... A) l'URL du frontend B) `*` C) rien
35. Ouverte: pourquoi `npx prisma migrate dev` plutôt que modifier la DB manuellement ?
36. QCM: un middleware Express a la signature... A) `(req, res, next)` B) `(req, res)` C) `(data)`

**Déploiement (10 questions)**
37. QCM: Vercel détecte automatiquement... A) le framework et la commande de build B) les bugs C) rien
38. QCM: les variables `VITE_*` sont... A) exposées au frontend B) secrètes C) inaccessibles
39. QCM: un health check endpoint vérifie... A) que l'API est fonctionnelle B) le frontend C) rien
40. QCM: Let's Encrypt fournit... A) des certificats TLS gratuits B) des serveurs C) rien
41. Ouverte: pourquoi les rewrites SPA sont-ils nécessaires (vercel.json) ?
42. QCM: `CNAME` dans un DNS... A) crée un alias B) pointe vers une IP C) envoie des emails
43. Ouverte: avantage d'un Dockerfile pour le déploiement.
44. QCM: en production, `NODE_ENV=production`... A) active les optimisations Express B) active le debug C) rien
45. Cas: déploiement réussi mais CORS bloque les requêtes. Solution ?
46. QCM: HSTS force... A) HTTPS pour toutes les requêtes futures B) HTTP C) rien

**Architecture (4 questions)**
47. QCM: SOLID est... A) 5 principes de conception B) un framework C) une base de données
48. QCM: dans MVC, le Controller... A) orchestre la requête HTTP B) stocke les données C) affiche l'UI
49. Ouverte: principe Single Responsibility (S de SOLID).
50. QCM: un ADR documente... A) une décision d'architecture B) le code C) les bugs

---

## 2) Révision P4 — Cloud, sécurité, gouvernance, anglais (5h)

### Synthèse des points clés P4 (J29-J35)

**Cloud computing (J29) :**
- Modèles de service : IaaS (EC2), PaaS (RDS, Heroku), SaaS (Gmail), FaaS (Lambda).
- Modèles de déploiement : public, privé, hybride, multi-cloud.
- Responsabilité partagée, CAPEX vs OPEX.
- AWS : régions/AZ, IAM (moindre privilège, rôles), EC2 (types, SG, AMI), S3 (classes, chiffrement), RDS (Multi-AZ), Lambda, VPC.
- Azure : Resource Groups, Entra ID, VMs, Blob Storage, SQL Database, Functions.

**Réseau & sécurité cloud (J30) :**
- VPC : sous-réseaux publics/privés, IGW, NAT Gateway, route tables, VPC Peering, VPN, SG vs NACL.
- Chiffrement : KMS, SSE-S3, au repos/transit.
- IAM avancé : conditions (IP, MFA), rôles vs utilisateurs.
- WAF, Shield (DDoS), GuardDuty, CloudTrail, Config.
- RDS, Aurora, DynamoDB, ElastiCache.
- FinOps : tagging, Reserved Instances, Savings Plans, Spot Instances, budgets.

**Sécurité transversale & PCA (J31) :**
- Défense en profondeur, Zero Trust, DevSecOps, SIEM/SOAR.
- RPO, RTO, stratégie 3-2-1, types de sauvegardes, AWS Backup, test de restauration.
- IAM entreprise : SSO (SAML, OIDC, OAuth 2.0), RBAC, PAM.
- PCA/PRA : BIA, stratégies (Backup&Restore, Pilot Light, Warm Standby, Active-Active), runbook, tests.

**Gouvernance & conformité (J32) :**
- ITIL 4 (SVS, principes), COBIT 2019, SLA/OLA/KPI, PDCA.
- RGPD (droits, obligations, 72h, DPO, AIPD), NIS2, ISO 27001, SOC2, privacy by design.
- Gestion de projet : Waterfall vs Agile/Scrum, cahier des charges, PERT, MoSCoW, risques.
- Gestion des risques IT : matrice probabilité × impact, ALE, registre, stratégies (éviter/réduire/transférer/accepter).

**Anglais technique (J33-J34) :**
- Lecture : documentation AWS, RFC (IETF), stratégies skim/scan/deep read.
- Vocabulaire : cloud (scalability, elasticity), sécurité (vulnerability, breach), dev (refactoring, boilerplate).
- Rédaction : email pro, README, post-mortem, ADR, RFP.
- Oral : présentation 2 min, méthode STAR, questions entretien, simulation.

### Banque ciblée P4 (50 questions)

**Cloud (12 questions)**
1. QCM: IaaS signifie... A) Infrastructure as a Service B) Internet as a Service C) rien
2. QCM: dans le modèle SaaS, le client gère... A) rien B) l'OS C) l'infrastructure
3. QCM: AWS Lambda est un service... A) serverless/FaaS B) IaaS C) PaaS
4. Ouverte: expliquer le modèle de responsabilité partagée.
5. QCM: S3 est un service de... A) stockage objet B) base de données C) calcul
6. QCM: dans un VPC, un sous-réseau privé n'a pas... A) de route directe vers internet B) d'adresses IP C) de ressources
7. Cas: EC2 en sous-réseau privé ne peut pas télécharger de mises à jour. Solution ?
8. QCM: RDS Multi-AZ fournit... A) la haute disponibilité B) plus de CPU C) le chiffrement
9. Ouverte: différence entre Security Group et NACL.
10. QCM: KMS gère... A) les clés de chiffrement B) les utilisateurs C) le réseau
11. Ouverte: pourquoi taguer toutes les ressources cloud ?
12. QCM: une Reserved Instance réduit le coût en échange d'... A) un engagement 1 ou 3 ans B) une utilisation moindre C) rien

**Sécurité cloud (8 questions)**
13. QCM: CloudTrail enregistre... A) tous les appels API AWS B) le trafic réseau C) rien
14. QCM: WAF protège contre... A) SQL injection et XSS B) les pannes disque C) rien
15. QCM: GuardDuty détecte... A) les menaces de sécurité B) les bugs C) les coûts
16. Ouverte: pourquoi activer CloudTrail dans TOUTES les régions ?
17. QCM: Shield Standard est... A) gratuit et automatique B) payant C) manuel
18. Cas: GuardDuty alerte "Instance communicating with known malicious IP". Action ?
19. QCM: le chiffrement SSE-KMS utilise... A) AWS KMS B) un chiffrement simple C) rien
20. Ouverte: comment auditer la sécurité d'un compte AWS ?

**Sécurité transversale (8 questions)**
21. QCM: la défense en profondeur consiste à... A) superposer des couches de sécurité B) utiliser un seul firewall C) rien
22. QCM: Zero Trust signifie... A) "Never trust, always verify" B) "Trust everything inside" C) rien
23. QCM: RPO définit... A) la perte de données maximale acceptable B) le temps de redémarrage C) le coût
24. QCM: la stratégie de sauvegarde 3-2-1 signifie... A) 3 copies, 2 médias, 1 hors site B) 3 backups, 2 semaines, 1 an C) rien
25. Ouverte: pourquoi tester les restaurations régulièrement ?
26. QCM: SSO signifie... A) Single Sign-On B) Secure Server Operator C) rien
27. QCM: RBAC attribue les permissions aux... A) rôles B) utilisateurs directement C) applications
28. Cas: un employé quitte l'entreprise. Avec SSO, combien de temps pour révoquer ses accès ?

**Gouvernance & conformité (10 questions)**
29. QCM: ITIL est un framework de... A) gestion des services IT B) développement logiciel C) sécurité
30. QCM: un SLA définit... A) le niveau de service B) le budget C) la technologie
31. QCM: le RGPD impose de notifier une violation sous... A) 72h B) 24h C) 1 mois
32. QCM: ISO 27001 certifie... A) un système de management de la sécurité B) un produit C) un logiciel
33. Ouverte: différence entre PCA et PRA.
34. QCM: PDCA signifie... A) Plan, Do, Check, Act B) Produce, Deploy, Configure, Audit C) rien
35. Ouverte: à quoi sert un registre des risques ?
36. QCM: en Scrum, un sprint dure... A) 2-4 semaines B) 1 jour C) 6 mois
37. QCM: MoSCoW aide à... A) prioriser les fonctionnalités B) estimer le budget C) coder
38. Cas: un risque a un score de 20 (probabilité 4, impact 5). Priorité ?

**Anglais technique (12 questions)**
39. QCM: "deploy" signifie... A) déployer B) supprimer C) arrêter
40. QCM: STAR signifie... A) Situation, Task, Action, Result B) Stop, Think, Act, Review C) rien
41. QCM: dans un post-mortem, le ton doit être... A) blameless B) accusateur C) émotionnel
42. Ouverte: "The issue was resolved by restarting the service." Traduire.
43. QCM: "stateful" pour un Security Group signifie... A) les réponses sortantes sont auto-autorisées B) tout est bloqué C) rien
44. Ouverte: différence entre "scalability" et "elasticity".
45. QCM: "rollback" signifie... A) revenir à la version précédente B) avancer C) supprimer
46. Cas: rédiger le sujet d'un email pour un incident de production critique.
47. QCM: "comply with" signifie... A) se conformer à B) ignorer C) supprimer
48. Ouverte: pourquoi utiliser UTC dans une timeline d'incident ?
49. QCM: "I would appreciate it if you could..." exprime... A) une demande polie B) un ordre C) une critique
50. QCM: RFC est publié par... A) l'IETF B) AWS C) Microsoft

---

## 3) Banque chronométrée P3-C/P4 (2h30)

- 100 questions en 2h30. Score cible >= 80%.
- Bloc P3-C (50 questions, 1h15) + Bloc P4 (50 questions, 1h15).

---

## 4) Correction + analyse des lacunes + suivi P1 (1h30)

### Correction rapide P3-C
1A, 2A, 3A, 4-let block scope, var function scope + hoisting, 5-fetch rejette seulement sur erreur réseau, pas HTTP, 6A, 7-2 (valeur par défaut), 8A, 9-en JS `===` strict (type+valeur), `==` avec coercion, 10A, 11A, 12A, 13A, 14-permet à React d'identifier chaque élément pour le diffing, 15A, 16-augmente de 1 seulement (stale closure) → utiliser `prev => prev + 1`, 17A, 18-props = données parent→enfant immuables, state = données internes modifiables, 19A, 20A, 21-boucle infinie (pas de [ ]), 22A, 23A, 24A, 25A, 26-le client peut contourner la validation JS, 27A, 28-204 No Content, 29A, 30A, 31-access = court (15 min), refresh = long (7 jours, httpOnly), 32-appeler /refresh, si échoue → login, 33A, 34A, 35-versionner le schéma, rollback possible, reproductible, 36A, 37A, 38A, 39A, 40A, 41-les SPA utilisent le routing client — si on rafraîchit /about, le serveur doit servir index.html, 42A, 43-reproductibilité, environnement identique, 44A, 45-mettre à jour FRONTEND_URL dans les env vars du backend, 46A, 47A, 48A, 49-une classe/module = une seule raison de changer, 50A.

### Correction rapide P4
1A, 2A, 3A, 4-AWS sécurise l'infra physique, le client sécurise ce qu'il met dedans (OS, app, données, accès), 5A, 6A, 7-ajouter un NAT Gateway dans un sous-réseau public + route dans la table privée, 8A, 9-SG stateful au niveau instance, NACL stateless au niveau sous-réseau, 10A, 11-sans tags impossible d'attribuer les coûts → gaspillage invisible, 12A, 13A, 14A, 15A, 16-un attaquant peut opérer dans n'importe quelle région, 17A, 18-confinement immédiat (isoler), investigation, éradication, RCA, 19A, 20-Trusted Advisor + Config + GuardDuty + Security Hub + vérification manuelle, 21A, 22A, 23A, 24A, 25-backup fonctionnel ≠ restauration fonctionnelle. Seul un test révèle la vérité, 26A, 27A, 28-immédiatement (désactiver le compte SSO), 29A, 30A, 31A, 32A, 33-PCA = maintenir l'activité PENDANT, PRA = restaurer APRÈS, 34A, 35-identifier, évaluer, suivre les risques, 36A, 37A, 38-action immédiate (score ≥ 15 = critique), 39A, 40A, 41A, 42-"Le problème a été résolu par un redémarrage du service.", 43A, 44-scalability = capacité à monter en charge, elasticity = capacité à s'adapter automatiquement, 45A, 46-"[URGENT] Production database outage — investigating", 47A, 48-éviter les ambiguïtés de fuseau horaire, 49A, 50A.

---

## Validation qualité J38

### Grille (100 points)
- Score bloc P3-C : **50 pts**
- Score bloc P4 : **50 pts**

### Seuil : >= 80/100. Prochaine étape : J39 — Banque ciblée poste visé.

---

## Corrigés guidés — mode tuteur (réponses attendues)

> Tu as raison : ici tu es l'étudiant. Utilise cette section pour t'auto-corriger après avoir tenté les questions.

### Module Révision Globale P2 + Début P3

1. **B** — UAC = User Account Control, contrôle l'élévation de privilèges sous Windows
2. **A** — NTFS = New Technology File System, système de fichiers Windows avancé
3. **B** — MMC = Microsoft Management Console, console d'administration Windows
4. **A** — Event Viewer affiche les journaux système Windows
5. **A** — TCD = Tableau Croisé Dynamique, agrège des données pour analyse
6. **Ouverte** — `$A$1` est une référence absolue qui ne change pas lors de la copie de la formule
7. **B** — Le publipostage fusionne un document Word avec un fichier Excel pour produire des documents personnalisés
8. **Ouverte** — Les règles Outlook filtrent automatiquement les emails entrants selon des critères définis
9. **Ouverte** — Les canaux Teams doivent être nommés explicitement avec un sujet clair, pas de noms génériques
10. **B** — La priorité d'un ticket se calcule Impact × Urgence (matrice ITIL standard)
11. **A** — HTML5 est le standard actuel du langage de balisage web
12. **B** — CSS = Cascading Style Sheets, gère la mise en forme des pages web
13. **B** — `let` et `const` ont une portée de bloc (block scope), contrairement à `var` qui a une portée de fonction
14. **Ouverte** — Le sélecteur `.classe` cible tous les éléments HTML ayant cette classe
15. **Ouverte** — `display: flex` avec `justify-content: center; align-items: center;` centre un conteneur
16. **A** — `git clone <url>` télécharge un dépôt distant vers ton ordinateur
17. **B** — `git status` affiche les fichiers modifiés et non suivis
18. **B** — Un commit est une sauvegarde d'un instantané du projet avec un message décrivant le changement
19. **B** — Le workflow standard est : branche de travail → commit → fusion (merge) sur la branche principale
20. **A** — `.gitignore` exclut des fichiers du suivi Git (node_modules, .env, fichiers de build)
21. **A** — `ssh user@machine` se connecte à une machine distante via le protocole sécurisé SSH
22. **B** — `sudo` exécute une commande avec les droits d'un autre utilisateur (par défaut root) de façon temporaire
23. **B** — `ls -la` affiche tous les fichiers avec leurs détails (droits, propriétaire, taille, date)
24. **A** — `chmod 755 fichier` donne au propriétaire lecture/écriture/exécution (rwx), au groupe et aux autres lecture/exécution (r-x)
25. **B** — `systemctl status <service>` vérifie si un service Linux est actif
26. **B** — `journalctl -u <service>` lit les journaux d'un service spécifique
27. **B** — `ip addr` ou `ifconfig` affiche les interfaces et leurs adresses IP
28. **A** — SSH (Secure Shell) permet la connexion à distance sécurisée et chiffrée
29. **B** — `grep "motif" fichier` filtre et affiche les lignes contenant le motif recherché
30. **Ouverte** — Un pipe `commande1 | commande2` envoie la sortie standard de commande1 comme entrée standard de commande2
31. **B** — `print()` affiche du texte en Python ; `type()` retourne le type d'une variable
32. **B** — `if` / `elif` / `else` structure les décisions conditionnelles en Python
33. **B** — `for element in liste` parcourt chaque élément d'une collection
34. **B** — `def nom_fonction(parametres):` définit une fonction en Python
35. **B** — `try:` / `except:` intercepte et gère les erreurs sans faire planter le programme
36. **B** — `SELECT colonnes FROM table WHERE condition` est la requête SQL de base pour lire des données
37. **B** — `INSERT INTO table (colonnes) VALUES (valeurs)` ajoute une nouvelle ligne
38. **B** — `UPDATE table SET colonne = valeur WHERE condition` modifie des lignes existantes
39. **B** — `DELETE FROM table WHERE condition` supprime des lignes
40. **B** — `JOIN` combine des lignes de deux tables basées sur une colonne commune
41. **B** — `GROUP BY` regroupe les lignes pour faire des agrégations (COUNT, SUM, AVG)
42. **B** — `HAVING` filtre les résultats après un GROUP BY, contrairement à WHERE qui filtre avant
43. **Ouverte** — Une clé étrangère (FOREIGN KEY) est une colonne qui fait référence à la clé primaire d'une autre table, assurant l'intégrité référentielle
44. **Ouverte** — `ERD` = Entity Relationship Diagram, schéma visuel montrant les tables et leurs relations
45. **B** — `1NF` (1ère forme normale) = colonnes atomiques, sans valeurs répétées dans une cellule
46. **B** — `ACID` = Atomicity, Consistency, Isolation, Durability, les 4 propriétés garantissant la fiabilité des transactions
47. **B** — `COMMIT` sauvegarde les modifications de la transaction ; `ROLLBACK` les annule
48. **B** — Un index dans une base de données accélère les requêtes de lecture au prix d'un léger ralentissement en écriture
49. **Ouverte** — `WHERE id IN (SELECT id FROM autres_table WHERE condition)` est une sous-requête SQL
50. **B** — TCP est un protocole fiable avec connexion (handshake 3 volets) ; UDP est rapide sans connexion
51. **B** — DNS = Domain Name System, traduit les noms de domaine en adresses IP
52. **B** — DHCP = Dynamic Host Configuration Protocol, attribue automatiquement des adresses IP sur un réseau
53. **Ouverte** — `ping` teste la connectivité réseau avec envoi de paquets ICMP ; `traceroute` montre le chemin réseau
54. **B** — SSH = Secure Shell pour connexion distante sécurisée ; SCP = Secure Copy pour transfert de fichiers chiffré
55. **B** — Un pare-feu filtre le trafic réseau selon des règles autorisées (ACCEPT) ou bloquées (DROP)
56. **B** — NAT = Network Address Translation traduit les adresses IP privées en adresse publique
57. **B** — Un VPN crée un tunnel chiffré à travers un réseau public pour un accès sécurisé aux ressources internes
58. **B** — `ip a` affiche les adresses IP des interfaces réseau Linux ; `ss -tlnp` montre les ports TCP en écoute
59. **Ouverte** — `#!/bin/bash` est le shebang qui indique au système quel interpréteur utiliser pour exécuter le script
60. **Ouverte** — `$?` retourne le code de sortie de la dernière commande (0 = succès, autre = erreur)
61. **B** — `grep "motif" fichier` filtre les lignes contenant le motif ; `sed 's/ancien/nouveau/g'` remplace du texte
62. **Ouverte** — `cron` est le planificateur de tâches Unix ; `crontab -e` édite le fichier de planification
63. **B** — `set -e` arrête le script à la première erreur ; `set -euo pipefail` active toutes les protections strictes
64. **B** — `import os` permet d'accéder aux fonctions du système d'exploitation en Python
65. **Ouverte** — `venv` (virtual environment) crée un environnement Python isolé par projet pour éviter les conflits de dépendances
66. **B** — `pip install nom_du_paquet` installe un paquet Python depuis le catalogue PyPI
67. **B** — `__init__.py` rend un dossier Python importable comme package
68. **Ouverte** — Les décorateurs (`@decorator`) modifient ou étendent le comportement d'une fonction sans la modifier directement
69. **B** — `lambda x: expression` crée une fonction anonyme d'une ligne
70. **B** — `with open('fichier') as f:` garantit la fermeture automatique du fichier même si une erreur survient
71. **B** — `1` est vrai (true) en Bash tandis qu'en Python `True` est le booléen vrai
72. **Ouverte** — Les expressions régulières (regex) permettent de rechercher des motifs complexes dans du texte
73. **B** — `wc -l` compte le nombre de lignes ; `wc -w` compte les mots ; `wc -c` compte les caractères
74. **B** — `head fichier` affiche les 10 premières lignes ; `tail fichier` affiche les 10 dernières lignes
75. **B** — `diff fichier1 fichier2` compare deux fichiers ligne par ligne
76. **Ouverte** — `find /chemin -name "*.log"` trouve récursivement tous les fichiers dont le nom correspond au motif
77. **Ouverte** — En Python, une liste est ordonnée et modifiable, un dictionnaire stocke des paires clé/valeur, un tuple est ordonné mais immuable
78. **Ouverte** — La complexité algorithmique Big-O décrit comment le coût d'un algorithme croît avec la taille des données

