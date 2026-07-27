# TOME P4 — Jour 33 (14h)

## Découpage horaire opérationnel J33
- Anglais technique — lecture et compréhension (documentation, articles, specs) — **5h**
- Vocabulaire technique essentiel par domaine (cloud, réseau, sécurité, dev, data) — **3h**
- Rédaction technique (emails professionnels, rapports, documentation) — **3h**
- Pratique orale (présentation technique simple, discussion d'architecture) — **1h**
- Labs + simulation entretien technique en anglais — **1h**
- Banque de questions + suivi P1 — **1h**

---

## 1) Anglais technique — Lecture et compréhension (5h)

### Objectifs d'apprentissage
- Lire et comprendre une documentation technique en anglais (AWS docs, RFC).
- Extraire les informations essentielles d'un article technique.
- Comprendre le vocabulaire des spécifications techniques.
- Interpréter un post-mortem ou un rapport d'incident en anglais.
- Pratiquer la lecture active (skim, scan, deep read).

### Contenu pédagogique
L'anglais est la langue de l'informatique. 90% de la documentation technique, des RFCs, des articles de blog, et des conférences sont en anglais. La maîtrise de l'anglais technique est un prérequis pour progresser.

Points clés:
1. **Types de documents techniques en anglais** :
   - **Documentation officielle** (AWS, Azure, React, Node.js) : structurée, vocabulaire technique précis.
   - **RFC (Request for Comments)** : spécifications techniques de l'IETF, format standardisé.
   - **Blogs techniques** (Medium, Dev.to, entreprise) : style plus accessible, souvent avec exemples.
   - **Post-mortems** : rapports d'incident, ton factuel, pas de blâme.
   - **Papers académiques** : très formels, abstract, méthodologie, résultats.
2. **Stratégies de lecture** :
   - **Skimming** (survol) : parcourir rapidement titres, sous-titres, premiers paragraphes pour décider si le document est pertinent.
   - **Scanning** (recherche) : chercher un mot-clé spécifique (ex: "security group", "IAM role").
   - **Deep reading** (lecture approfondie) : comprendre en détail un paragraphe technique, souligner, prendre des notes.
3. **Vocabulaire technique récurrent** : `deploy` (déployer), `provision` (provisionner), `scale` (mettre à l'échelle), `trigger` (déclencher), `enforce` (appliquer/imposer), `comply with` (se conformer à), `mitigate` (atténuer), `leverage` (exploiter/tirer parti de), `streamline` (optimiser/simplifier), `orchestrate` (orchestrer).
4. **Structures grammaticales fréquentes** : voix passive ("The database IS ENCRYPTED at rest"), conditionnel ("If the health check fails, the instance WILL BE restarted"), impératif (documentation : "Run the following command..."), modal verbs (must, should, may, can).
5. **Faux-amis** : `actually` (en fait, pas actuellement), `eventually` (finalement, pas éventuellement), `sensible` (raisonnable, pas sensible), `comprehensive` (complet/exhaustif, pas compréhensif), `achieve` (atteindre/réaliser, pas achever au sens de terminer).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : lire un extrait de documentation AWS sur EC2 Security Groups (1 page). Skimmer pour identifier le sujet principal, scanner pour trouver les ports par défaut, deep read pour expliquer "stateful vs stateless".
   - **Corrigé** : Sujet : Security Groups agissent comme un pare-feu virtuel pour les instances EC2, contrôlant le trafic entrant et sortant. Ports par défaut : aucun — tout est bloqué par défaut. "Stateful" signifie que si une requête entrante est autorisée, la réponse sortante l'est automatiquement (et vice-versa). NACL est stateless — les règles entrantes et sortantes doivent être définies séparément.
2. **Exercice 2 (intermédiaire)** : lire un post-mortem AWS (ex: résumé de l'incident S3 de 2017). Identifier : (a) ce qui s'est passé, (b) la cause racine, (c) les actions de remédiation, (d) le ton du document (blameless).
   - **Corrigé** : (a) Une interruption du service S3 dans la région us-east-1 pendant plusieurs heures. (b) Un ingénieur a exécuté une commande qui a retiré plus de serveurs que prévu. (c) Ajout de garde-fous pour empêcher la suppression de capacité au-delà d'un seuil. (d) Ton blameless — l'accent est mis sur l'amélioration du processus, pas sur la faute individuelle.
3. **Exercice 3 (avancé)** : lire un extrait de la RFC 7231 (HTTP/1.1 Semantics and Content). Identifier le format standard d'une RFC, expliquer les statuts HTTP 201, 301, 401, 403, 500 en anglais.
   - **Corrigé** : Format RFC : sections numérotées, langage normatif (MUST, SHOULD, MAY en majuscules), exemples, references. 201 Created : "The request has been fulfilled and has resulted in one or more new resources being created." 301 Moved Permanently : "The target resource has been assigned a new permanent URI." 401 Unauthorized : "The request has not been applied because it lacks valid authentication credentials." 403 Forbidden : "The server understood the request but refuses to authorize it." 500 Internal Server Error : "The server encountered an unexpected condition that prevented it from fulfilling the request."

### Nouvelles abréviations rencontrées
- RFC | Request for Comments | Document de spécification technique de l'IETF (standards internet) | Interagit avec HTTP, TCP/IP, DNS, tous les protocoles internet
- IETF | Internet Engineering Task Force | Organisation qui produit les RFC et standards internet | Interagit avec les protocoles, les standards, la gouvernance d'internet

### Banque de questions du module (15)
1. QCM: "stateful" pour un Security Group signifie... A) les réponses sortantes sont automatiquement autorisées B) tout est bloqué C) rien
2. QCM: dans une RFC, "MUST" signifie... A) obligatoire B) optionnel C) recommandé
3. QCM: "blameless" dans un post-mortem signifie... A) on ne cherche pas de coupable B) on ignore les erreurs C) on blâme l'équipe
4. Ouverte: traduire en français : "The instance will be terminated if the health check fails three consecutive times."
5. Ouverte: différence entre "skim", "scan", et "deep read".
6. Cas: un article technique mentionne "ephemeral storage". Signification ?
7. QCM: "deploy" signifie... A) déployer B) supprimer C) arrêter
8. Ouverte: pourquoi la documentation AWS utilise-t-elle beaucoup la voix passive ?
9. Cas: "You must comply with the acceptable use policy." Que signifie "comply with" ?
10. QCM: un RFC est publié par... A) l'IETF B) AWS C) Microsoft
11. Ouverte: comment aborder un document technique de 50 pages efficacement ?
12. Cas: "This feature is deprecated and will be removed in v3." Signification ?
13. QCM: objectif du module 1 = A) lire et comprendre la documentation technique en anglais B) éviter l'anglais C) tout traduire
14. Ouverte: comment améliorer sa compréhension de l'anglais technique au quotidien ?
15. QCM: résultat attendu = A) capable de lire des docs AWS/RFC en anglais B) dépendance à la traduction C) évitement

---

## 2) Vocabulaire technique par domaine (3h)

### Objectifs d'apprentissage
- Maîtriser le vocabulaire technique par domaine (cloud, réseau, sécurité, dev, data).
- Comprendre les expressions idiomatiques techniques (boilerplate, scaffolding, bike-shedding).
- Utiliser le vocabulaire approprié dans un contexte professionnel.
- Éviter les faux-amis et les erreurs de traduction.
- Enrichir son lexique actif (mots qu'on utilise) au-delà du lexique passif (mots qu'on comprend).

### Contenu pédagogique
Le vocabulaire technique est la base de la communication professionnelle. Un terme mal utilisé peut créer des malentendus.

Points clés:
1. **Cloud & Infrastructure** : `scalability` (capacité à monter en charge), `elasticity` (capacité à s'adapter automatiquement), `fault tolerance` (tolérance aux pannes), `high availability` (haute disponibilité), `disaster recovery` (reprise après sinistre), `provisioning` (allocation de ressources), `orchestration` (coordination automatisée).
2. **Réseau** : `latency` (délai de transmission), `bandwidth` (capacité de débit), `throughput` (débit réel), `packet loss` (perte de paquets), `hop` (saut entre routeurs), `edge` (périphérie du réseau).
3. **Sécurité** : `vulnerability` (faille exploitable), `threat` (menace), `exploit` (code malveillant exploitant une faille), `breach` (violation de données), `hardening` (durcissement), `remediation` (correction), `penetration testing` (test d'intrusion).
4. **Développement** : `refactoring` (restructuration du code sans changer le comportement), `boilerplate` (code répétitif standard), `scaffolding` (génération de structure de projet), `build` (compilation + packaging), `ship` (livrer/déployer), `rollback` (revenir à la version précédente), `commit` (enregistrer une modification).
5. **Expressions idiomatiques IT** :
   - `Bike-shedding` (Parkinson's law of triviality) : passer trop de temps sur des détails mineurs.
   - `Dogfooding` (eating your own dog food) : utiliser ses propres produits.
   - `Rubber duck debugging` : expliquer un problème à un canard en plastique pour trouver la solution.
   - `Silver bullet` : solution miracle (souvent ironique — "there is no silver bullet").

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : associer 10 termes techniques à leur définition en anglais. (Liste : scalability, latency, vulnerability, refactoring, rollback, provision, orchestrate, breach, boilerplate, dogfooding.)
   - **Corrigé** : Scalability → ability to handle growing amounts of work. Latency → time delay between cause and effect. Vulnerability → weakness that can be exploited. Refactoring → restructuring code without changing behavior. Rollback → reverting to a previous version. Provision → to supply or make available. Orchestrate → to coordinate automated tasks. Breach → unauthorized access to data. Boilerplate → repetitive standard code. Dogfooding → using your own product.
2. **Exercice 2 (intermédiaire)** : écrire 5 phrases en anglais décrivant des situations techniques. Utiliser au moins 3 termes du vocabulaire par phrase.
   - **Corrigé** : (1) "We need to provision additional EC2 instances to handle the increased load and improve scalability." (2) "The penetration test revealed a critical vulnerability that must be remediated before deployment." (3) "After the database breach, we performed a rollback to the last known good snapshot." (4) "This boilerplate code can be replaced with a scaffolding tool to streamline development." (5) "We're dogfooding our own API to identify usability issues before the public launch."
3. **Exercice 3 (avancé)** : rédiger un paragraphe technique de 100-150 mots expliquant l'architecture de TaskFlow en anglais. Utiliser : frontend, backend, database, authentication, deployment, scalability, REST API.
   - **Corrigé** : "TaskFlow is a full-stack task management application. The frontend is built with React and deployed on Vercel for optimal scalability and global CDN delivery. The backend consists of a Node.js REST API with Express, using Prisma as an ORM to interact with a PostgreSQL database hosted on Render. Authentication is handled through JWT tokens with refresh token rotation for enhanced security. The entire infrastructure follows a three-tier architecture: the presentation layer (React), the application layer (Express API), and the data layer (PostgreSQL). This separation of concerns allows each layer to scale independently and improves maintainability."

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: "scalability" signifie... A) capacité à monter en charge B) réduction des coûts C) chiffrement
2. QCM: "breach" en sécurité signifie... A) violation de données B) pare-feu C) sauvegarde
3. QCM: "boilerplate code" est... A) du code répétitif standard B) du code optimisé C) du code supprimé
4. Ouverte: expliquer "rubber duck debugging" en anglais simple.
5. Ouverte: différence entre "bandwidth" et "throughput".
6. Cas: un collègue dit "This is bike-shedding". Que veut-il dire ?
7. QCM: "rollback" signifie... A) revenir à la version précédente B) avancer C) supprimer
8. Ouverte: pourquoi "dogfooding" est-il important pour une entreprise tech ?
9. Cas: "We need to harden the server before production." Action à faire ?
10. QCM: "refactoring" ne change pas... A) le comportement externe B) le code source C) la structure
11. Ouverte: comment enrichir son vocabulaire technique anglais ?
12. Cas: "The build failed due to a missing dependency." Traduire.
13. QCM: objectif du module 2 = A) maîtriser le vocabulaire technique anglais B) éviter les termes anglais C) utiliser uniquement le français
14. Ouverte: pourquoi utiliser le terme anglais plutôt qu'une traduction française approximative ?
15. QCM: résultat attendu = A) vocabulaire technique anglais opérationnel B) vocabulaire passif uniquement C) dépendance au traducteur

---

## 3) Rédaction technique en anglais (3h)

### Objectifs d'apprentissage
- Rédiger un email professionnel en anglais (demande, réponse, escalade).
- Écrire une documentation technique simple (README, runbook).
- Produire un rapport d'incident (post-mortem) synthétique.
- Adapter le ton selon le destinataire (collègue, manager, client).
- Éviter les erreurs courantes de rédaction technique.

### Contenu pédagogique
Savoir écrire en anglais technique est aussi important que savoir coder. Une documentation bien écrite fait gagner des heures à l'équipe.

Points clés:
1. **Emails professionnels** : structure formelle (Subject, Salutation, Body, Closing, Signature). Ton : poli, concis, orienté action. Formules utiles : "I am writing to..." (Je vous écris pour...), "Could you please..." (Pourriez-vous s'il vous plaît...), "I would appreciate it if you could..." (Je vous serais reconnaissant de...), "Please let me know if you need any further information." (N'hésitez pas à me contacter pour plus d'informations.)
2. **Documentation technique (README)** : sections standard — Description (what), Installation (how to set up), Usage (how to use), API Reference, Contributing, License. Ton : informatif, précis, tutoriel. Utiliser des blocs de code (triple backticks), des listes à puces, des titres hiérarchiques.
3. **Rapport d'incident (post-mortem)** : structure — Summary, Timeline (UTC), Root Cause, Impact, Resolution, Prevention, Lessons Learned. Ton : factuel, blameless, orienté amélioration. Exprimer les actions au passé : "The database was restored from the latest snapshot." Éviter : "John made a mistake." Préférer : "The deployment process did not include a rollback validation step."
4. **Erreurs courantes** :
   - Faux-amis : "Actually, the server is down" ≠ "Actuellement, le serveur est down" mais "En fait, le serveur est down".
   - Temps : utiliser le present perfect pour les actions passées avec impact présent : "The issue HAS BEEN RESOLVED." (Le problème a été résolu → et c'est toujours le cas.)
   - Articles (a/an/the) : "Create AN instance" (une instance, indéfinie), "Start THE instance" (l'instance dont on parle, définie).
   - Prépositions : "deploy TO production" (déployer vers la production), "comply WITH regulations" (se conformer aux réglementations), "rely ON backups" (compter sur les sauvegardes).
5. **Adapter le ton** : Collègue technique = vocabulaire technique, détails, blagues possibles. Manager = synthèse, impact business, pas de jargon excessif. Client = formel, rassurant, orienté solution.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : rédiger un email à un collègue pour lui demander de vérifier la configuration du Security Group de l'instance EC2 "app-prod-01". Poli, concis, avec un deadline.
   - **Corrigé** : Subject : "Review Security Group for app-prod-01" — "Hi [Name], Could you please review the Security Group configuration for the EC2 instance 'app-prod-01'? We noticed some unexpected connection timeouts and would like to rule out network issues. I would appreciate it if you could check by tomorrow EOD. Thanks!" — "Best regards, [Your name]."
2. **Exercice 2 (intermédiaire)** : écrire le README.md d'un projet en anglais (TaskFlow). Inclure : Description, Tech Stack, Getting Started (3 étapes), and API Endpoints (2 exemples).
   - **Corrigé** : "# TaskFlow — Task Management Application. A full-stack task management app built with React, Express, and PostgreSQL. ## Tech Stack: React, Node.js/Express, Prisma ORM, PostgreSQL, JWT Auth. ## Getting Started: 1. Clone the repo: `git clone ...` 2. Install dependencies: `npm install` 3. Start the dev server: `npm run dev` ## API Endpoints: `POST /api/auth/login` — Authenticate user and return JWT. `GET /api/tasks` — Retrieve tasks (supports ?status, ?priority, ?search)."
3. **Exercice 3 (avancé)** : rédiger un post-mortem d'une page pour un incident fictif "Database unavailable for 45 minutes". Inclure : Summary, Timeline, Root Cause, Impact, Resolution, Prevention. Ton blameless.
   - **Corrigé** : "## Summary: The production database became unavailable for 45 minutes on July 15, 2024, from 14:30 to 15:15 UTC, affecting all API endpoints. ## Timeline (UTC): 14:30 — Monitoring alert triggered (database connection failures). 14:32 — On-call engineer acknowledged the alert. 14:35 — Initial investigation: database process crashed. 14:40 — Restart attempted, failed due to disk full. 14:45 — Old log files identified and cleaned up (12 GB). 14:50 — Database restarted successfully. 14:55 — API health checks passing. 15:15 — Monitoring confirmed stable. ## Root Cause: The database server ran out of disk space because log rotation was not configured after the recent migration. ## Resolution: Old logs were archived and log rotation was set up. ## Prevention: Add disk usage alert at 80%. Configure automated log rotation on all database instances."

### Nouvelles abréviations rencontrées
- UTC | Coordinated Universal Time | Fuseau horaire de référence pour les systèmes informatiques | Interagit avec les logs, les timelines d'incident, la synchronisation

### Banque de questions du module (15)
1. QCM: l'email professionnel commence par... A) une salutation (Hi/Hello) B) le message direct C) rien
2. QCM: dans un post-mortem, le ton doit être... A) blameless et factuel B) accusateur C) émotionnel
3. QCM: "I would appreciate it if you could..." exprime... A) une demande polie B) un ordre C) une critique
4. Ouverte: traduire "Le problème a été résolu par un redémarrage du service."
5. Ouverte: pourquoi utiliser UTC dans les timelines d'incident ?
6. Cas: rédiger le sujet d'un email pour signaler un incident de production critique.
7. QCM: dans un README, "## Getting Started" décrit... A) comment installer et lancer le projet B) l'historique C) les bugs
8. Ouverte: différence de ton entre un email à un collègue et un email à un client.
9. Cas: "The server crashed due to insufficient memory." Reformuler en post-mortem "prevention".
10. QCM: "EOD" signifie... A) End Of Day B) End Of Deployment C) Error On Disk
11. Ouverte: pourquoi les listes à puces sont-elles préférées aux longs paragraphes dans la doc technique ?
12. Cas: "Deploy TO production" vs "Deploy IN production". Lequel est correct ?
13. QCM: objectif du module 3 = A) rédiger des documents techniques en anglais B) écrire en français C) éviter d'écrire
14. Ouverte: comment s'entraîner à rédiger en anglais technique ?
15. QCM: résultat attendu = A) email + README + post-mortem rédigés en anglais B) pas de rédaction C) erreurs de grammaire

---

## 4) Pratique orale + Simulation entretien technique (2h)

### Objectifs d'apprentissage
- Présenter un projet technique en anglais (2-3 minutes).
- Répondre à des questions techniques en anglais.
- Discuter d'architecture et justifier des choix en anglais.
- Participer à une simulation d'entretien technique en anglais.
- Gérer le stress de l'oral en langue étrangère.

### Contenu pédagogique
L'oral est souvent le plus stressant. La clé est la préparation et la pratique.

Points clés:
1. **Présenter un projet en 2 minutes** : Structure — (1) What is it? (2) What problem does it solve? (3) What tech stack did you use? (4) What was the most challenging part? (5) What would you improve? Exemple : "TaskFlow is a task management app that helps teams track their work. I built it as a full-stack project using React for the frontend, Node.js for the backend, and PostgreSQL for the database. The most challenging part was implementing the JWT refresh token rotation securely. If I had more time, I would add real-time collaboration with WebSockets."
2. **Répondre à des questions techniques** : phrases de transition — "That's a great question." (pour gagner 2 secondes de réflexion). "In my experience..." (basé sur l'expérience). "Let me think about this..." (si on ne sait pas, c'est honnête). "I'm not 100% sure, but I believe..." (si on a une idée mais pas certain). Exemples de questions : "How would you secure an API?" → "I would use JWT for authentication, Helmet for HTTP headers, rate limiting to prevent brute force, and always validate inputs with Zod."
3. **Vocabulaire de discussion** : "In my opinion...", "I agree/disagree because...", "Could you clarify...", "From a security standpoint...", "One trade-off is...", "The advantage/disadvantage is..."
4. **Simulation d'entretien** : format de 15 minutes. 5 min : présentation du candidat (background, projet phare). 8 min : questions techniques (API REST, sécurité, scaling, debugging). 2 min : questions du candidat ("What tech stack does your team use?", "How do you handle on-call rotations?").
5. **Gestion du stress** : respirer avant de répondre, ne pas avoir peur des silences, reformuler si on n'est pas sûr d'avoir compris, accepter de ne pas tout savoir.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : préparer et prononcer à l'oral sa présentation de 2 minutes de TaskFlow. S'enregistrer et s'écouter.
2. **Exercice 2 (intermédiaire)** : répondre à 3 questions techniques en anglais (s'enregistrer) : (a) Explain the difference between SQL and NoSQL. (b) How does JWT authentication work? (c) What is the difference between scale-up and scale-out?
   - **Corrigé (a)** : "SQL databases are relational — they use structured schemas with tables and relationships. They're good for complex queries and transactions. NoSQL databases are non-relational — they can be document-based, key-value, or graph. They're better for large-scale, flexible data models where the schema changes often."
3. **Exercice 3 (avancé)** : simulation d'entretien technique complète de 15 minutes en anglais. Questions : architecture, sécurité, debugging, déploiement, et questions sur TaskFlow.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: présenter un projet commence par... A) décrire ce que fait le projet B) lister le code C) rien
2. QCM: "That's a great question" est utilisé pour... A) gagner du temps pour réfléchir B) éviter de répondre C) insulter
3. QCM: en entretien, si on ne connaît pas la réponse... A) "I'm not sure, but I would approach it by..." B) inventer C) rester silencieux
4. Ouverte: comment structurer une présentation de projet en 2 minutes ?
5. Ouverte: comment s'entraîner à l'oral technique en solo ?
6. QCM: "In my experience..." exprime... A) une opinion basée sur l'expérience B) un fait scientifique C) une hypothèse
7. QCM: objectif du module 4 = A) communiquer oralement en anglais technique B) éviter de parler C) parler français
8. QCM: résultat attendu = A) capable de tenir une conversation technique simple en anglais B) blocage total C) silence

---

## 5) Banque de questions + suivi P1 (1h)

### Objectifs d'apprentissage
- Valider les acquis J33. Planifier J34 (Anglais technique II).

### Banque de questions du module (15)
1. QCM: objectif J33 = A) anglais technique opérationnel B) théorie C) rien
2. QCM: plan J34 = A) anglais technique II (entretien avancé, rédaction avancée) B) retour C) fin
3. Ouverte: meilleure preuve J33 à montrer ?
4. QCM: preuve solide = A) vidéo de présentation + documents en anglais B) promesse C) rien
5. QCM: résultat P1 réussi = A) portfolio enrichi B) rien C) théorie

---

## Validation qualité J33 (anti-superficiel)

### Livrables obligatoires fin de J33
1. 1 présentation de projet enregistrée (2 minutes, anglais).
2. 1 README.md rédigé en anglais.
3. 1 email professionnel technique rédigé en anglais.
4. 1 post-mortem d'une page rédigé en anglais.
5. 1 liste de 50 mots de vocabulaire technique maîtrisés.

### Grille d'évaluation rapide (100 points)
- Compréhension écrite (documentation, RFC, post-mortem) : **30 pts**
- Vocabulaire technique (termes par domaine, idiomes) : **25 pts**
- Rédaction technique (email, README, post-mortem) : **25 pts**
- Expression orale (présentation, questions/réponses) : **10 pts**
- Communication technique employabilité : **10 pts**

### Seuil attendu
- **>= 80/100** : J33 validé, passage normal J34.
- **65-79/100** : validé sous remédiation ciblée 24h.
- **< 65/100** : consolidation anglais requise avant J34.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Lecture)
1. **A**
2. **A**
3. **A**
4. "L'instance sera terminée si le health check échoue trois fois consécutives." Cette phrase illustre le conditionnel ("if..., will be...") et la voix passive ("will be terminated").
5. Skim = survoler pour l'idée générale. Scan = chercher un mot-clé spécifique. Deep read = lire en détail pour comprendre et retenir.
6. "Ephemeral storage" = stockage temporaire/éphémère (ex: le stockage d'instance EC2 qui disparaît quand l'instance est stoppée).
7. **A**
8. La voix passive met l'accent sur l'action/le résultat plutôt que sur l'acteur. "The instance IS terminated" (le résultat est ce qui importe) plutôt que "AWS terminates the instance". Plus objectif, plus formel.
9. "Se conformer à" — respecter la politique d'utilisation acceptable. Verbe à particule très courant dans les documents légaux/techniques.
10. **A**
11. Skimmer le sommaire et l'introduction, scanner les sections pertinentes, deep read les parties critiques. Ne pas tout lire linéairement. Prendre des notes.
12. "Cette fonctionnalité est dépréciée et sera supprimée dans la version 3." — Ne pas l'utiliser pour de nouveaux développements, prévoir la migration.
13. **A**
14. Lire la documentation en anglais (pas de traduction), suivre des blogs techniques anglais, regarder des conférences en VO, configurer ses outils en anglais.
15. **A**

### B. Corrigé — Module 2 (Vocabulaire)
1. **A**
2. **A**
3. **A**
4. "Rubber duck debugging is a method where you explain your code problem to a rubber duck (or any inanimate object). By verbalizing the issue step by step, you often find the solution yourself without any external help."
5. Bandwidth = capacité maximale théorique du lien (ex: 1 Gbps). Throughput = débit réel mesuré (ex: 800 Mbps, inférieur à cause de l'overhead TCP, de la congestion, etc.)
6. L'équipe passe trop de temps à discuter d'un détail mineur (la couleur du bouton) au lieu de se concentrer sur l'essentiel (la fonctionnalité). Perte de temps.
7. **A**
8. Utiliser son propre produit permet de découvrir les bugs et les problèmes d'UX avant les clients. Ça force l'empathie avec l'utilisateur et améliore la qualité.
9. Appliquer les mesures de durcissement (hardening) : désactiver les services inutiles, configurer le pare-feu, appliquer les mises à jour de sécurité, changer les mots de passe par défaut.
10. **A**
11. Lire des articles techniques en anglais, noter les mots inconnus, les réutiliser dans ses propres écrits, configurer ses outils en anglais, pratiquer régulièrement.
12. "Le build a échoué à cause d'une dépendance manquante." — Il manque un package dans package.json ou node_modules.
13. **A**
14. Le terme anglais est le standard de l'industrie — tout le monde le comprend. La traduction crée de l'ambiguïté (ex: "déploiement" peut signifier deploy, release, rollout selon le contexte).
15. **A**

### C. Corrigé — Module 3 (Rédaction)
1. **A**
2. **A**
3. **A**
4. "The issue was resolved by restarting the service." — Voix passive, past tense pour l'action terminée.
5. Pour éviter les ambiguïtés de fuseau horaire. "14:30 UTC" est le même instant partout dans le monde. Les équipes distribuées travaillent en UTC.
6. "[URGENT] Production database outage — on-call team investigating" — Sujet clair, mot-clé URGENT, action en cours.
7. **A**
8. Collègue = informel, technique, direct. Client = formel, rassurant, orienté solution, pas de jargon technique excessif, empathie ("We understand this is impacting your work...").
9. "Add memory monitoring alert at 80%. Configure auto-scaling based on memory usage. Right-size the instance based on actual workload analysis."
10. **A**
11. Plus faciles à scanner, plus rapides à lire, structurent l'information, idéales pour les étapes et les listes de vérification.
12. "Deploy TO production" est correct. "Deploy in production" est compréhensible mais "deploy to" est l'expression standard.
13. **A**
14. Écrire sa documentation en anglais, contribuer à des projets open-source, rédiger des post-mortems fictifs, écrire des articles techniques, faire relire par des anglophones.
15. **A**

### D-E. Corrigés — Modules 4 & 5
1. **A**
2. **A**
3. **A**
4. What (30s) → Problem (30s) → Stack (30s) → Challenge (30s). 4 blocs de 30 secondes = 2 minutes. S'entraîner avec un chronomètre.
5. S'enregistrer avec son téléphone et se réécouter (douloureux mais efficace). Parler à voix haute en codant (expliquer ce qu'on fait). Participer à des meetups techniques en ligne.
6. **A**
7. **A**
8. **A**
1. **A**
2. **A**
3. Vidéo de présentation de projet en anglais + README en anglais + post-mortem en anglais.
4. **A**
5. **A**