# TOME P4 — Jour 34 (14h)

## Découpage horaire opérationnel J34
- Entretien technique en anglais — préparation et simulation (questions/réponses types) — **5h**
- Rédaction technique avancée (RFP, architecture decision, proposal) — **3h**
- Présentation technique avancée (conférence, démo client, architecture review) — **3h**
- Labs — simulation complète d'entretien technique + feedback — **2h**
- Banque de questions + suivi P1 — **1h**

---

## 1) Entretien technique en anglais — préparation intensive (5h)

### Objectifs d'apprentissage
- Maîtriser les questions d'entretien technique classiques en anglais.
- Structurer ses réponses avec la méthode STAR (Situation, Task, Action, Result).
- Répondre aux questions comportementales (soft skills) en anglais.
- Gérer les questions pièges et le stress de l'entretien.
- Poser des questions pertinentes à la fin de l'entretien.

### Contenu pédagogique
L'entretien technique en anglais est souvent le plus redouté. La préparation fait toute la différence entre un candidat stressé et un candidat confiant.

Points clés:
1. **Questions techniques classiques par domaine** :
   - **Cloud/Infra** : "Explain the shared responsibility model." / "What's the difference between vertical and horizontal scaling?" / "How would you design a highly available architecture?"
   - **Sécurité** : "How would you secure an API?" / "Explain the difference between authentication and authorization." / "What is a DDoS attack and how do you mitigate it?"
   - **Développement** : "Explain REST vs GraphQL." / "What's the difference between SQL and NoSQL?" / "How do you handle errors in async code?"
   - **Process/Méthode** : "How do you prioritize tasks when everything is urgent?" / "Describe a time you had to meet a tight deadline." / "How do you handle disagreements with teammates?"
2. **Méthode STAR** :
   - **S**ituation : planter le décor (où, quand, qui).
   - **T**ask : quelle était ta mission ou le problème.
   - **A**ction : ce que TU as fait concrètement (verbes d'action : I designed, I implemented, I coordinated).
   - **R**esult : le résultat, quantifié si possible (réduction de 30%, déploiement réussi, SLA respecté).
   - Exemple : "Tell me about a time you solved a difficult technical problem." → S: "In my previous project, our database was experiencing intermittent timeouts." T: "I was responsible for diagnosing and fixing the issue." A: "I analyzed the slow query logs, identified missing indexes, and implemented connection pooling." R: "The response time improved by 60% and we had zero timeouts in the following month."
3. **Questions comportementales** :
   - "Tell me about yourself." (adapté : 30s background + 30s projet phare + 30s pourquoi ce poste)
   - "What's your greatest weakness?" (honnête mais avec plan d'amélioration : "I tend to be too detail-oriented, but I'm learning to time-box decisions.")
   - "Why do you want to work here?" (montrer qu'on s'est renseigné : mission, stack technique, culture)
   - "Where do you see yourself in 5 years?" (ambitieux mais réaliste : senior dans le domaine, contribution open-source)
4. **Questions à poser au recruteur** (5 questions minimum) : "What does a typical day look like for this role?" / "What's the team's approach to on-call and incident response?" / "How does the team handle technical debt?" / "What are the biggest challenges the team is facing right now?" / "What's the career progression for this role?"
5. **Gestion des questions pièges** : "I don't know, but here's how I would find out..." (honnêteté + méthode). Ne jamais inventer. "That's an interesting question — let me think about it for a moment." (gagner du temps). Reformuler si on n'a pas compris : "Just to clarify, are you asking about...?"

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : répondre à 5 questions techniques classiques en anglais par écrit (300 mots max par réponse). Se relire et corriger.
   - **Corrigé** : Évaluer la clarté, la précision technique, la structure, et l'absence de jargon excessif. Ex: "How would you secure an API?" → "I would implement multiple layers: JWT authentication with short-lived access tokens and httpOnly refresh tokens, rate limiting (100 req/min per IP), input validation with Zod, Helmet for security headers, CORS restricted to our frontend domain, and WAF rules for common attacks like SQL injection. I would also encrypt all data at rest with AES-256 and in transit with TLS 1.3."
2. **Exercice 2 (intermédiaire)** : préparer 3 réponses STAR pour : (a) un problème technique difficile, (b) un conflit d'équipe, (c) un échec et ce qu'on a appris. S'enregistrer à l'oral.
   - **Corrigé** : (a) S: "During the TaskFlow project, JWT tokens expired mid-operation." T: "I needed to make auth seamless." A: "I implemented axios interceptors with automatic refresh token rotation and retry logic." R: "Users no longer experience forced logouts — auth is transparent." (b) S: "My teammate wanted to use MongoDB, I preferred PostgreSQL." T: "We needed to agree on the database." A: "I organized a comparison document with pros/cons for our use case. We discussed it and agreed PostgreSQL was better for our relational data." R: "We shipped on time and the schema has been stable since."
3. **Exercice 3 (avancé)** : simulation complète d'entretien de 30 minutes en anglais. Un pair ou Claude joue le recruteur. Enregistrer. Analyser : clarté, hésitations, structure, vocabulaire technique. Itérer.

### Banque de questions du module (15)
1. QCM: STAR signifie... A) Situation, Task, Action, Result B) Stop, Think, Act, Review C) Start, Test, Analyze, Release
2. QCM: face à une question dont on ne connaît pas la réponse... A) "I don't know, but I would approach it by..." B) inventer C) "Next question"
3. QCM: "Tell me about yourself" doit durer... A) 60-90 secondes B) 5 minutes C) 10 secondes
4. Ouverte: pourquoi quantifier les résultats dans la méthode STAR ?
5. Ouverte: quelles questions poser à la fin d'un entretien ?
6. Cas: le recruteur demande "What's your salary expectation?" — Comment répondre ?
7. QCM: "What's your greatest weakness?" — Bonne réponse = A) honnête + plan d'amélioration B) "je n'ai pas de défaut" C) "je travaille trop"
8. Ouverte: comment structurer "Tell me about yourself" pour un poste IT ?
9. Cas: "Why should we hire you over other candidates?" — Réponse ?
10. QCM: en entretien technique, le silence après une question... A) est normal (réflexion) B) est un problème C) signifie refus
11. Ouverte: comment rebondir après une réponse ratée ?
12. Cas: "Describe a time you failed." — STAR négatif ?
13. QCM: objectif du module 1 = A) réussir un entretien technique en anglais B) éviter les entretiens C) improviser
14. Ouverte: comment se préparer à un entretien technique 24h avant ?
15. QCM: résultat attendu = A) capable de répondre à 20+ questions techniques en anglais B) blocage C) silence

---

## 2) Rédaction technique avancée — RFP, ADR, proposal (3h)

### Objectifs d'apprentissage
- Rédiger une réponse à un appel d'offres simplifié (RFP — Request for Proposal).
- Écrire un Architecture Decision Record (ADR).
- Produire une proposition technique (proposal) pour un client.
- Adapter le niveau de détail selon le public cible.
- Structurer des documents longs de façon professionnelle.

### Contenu pédagogique
La rédaction technique avancée est une compétence qui distingue les seniors des juniors. Savoir convaincre par écrit est un accélérateur de carrière.

Points clés:
1. **RFP (Request for Proposal)** simplifié : document où un client demande des propositions pour un projet. Réponse structurée : (1) Executive Summary (1 page — comprenez-vous le besoin ?). (2) Technical Solution (architecture, stack, justification). (3) Project Plan (phases, livrables, timeline). (4) Team & Experience (qui va travailler, projets similaires). (5) Pricing (estimation, modèle). Ton : confiant mais pas arrogant, précis, orienté solution.
2. **ADR (Architecture Decision Record)** : document justifiant un choix architectural. Structure : Title, Status (proposed, accepted, deprecated), Context (pourquoi cette décision est nécessaire), Decision (ce qu'on a décidé), Alternatives Considered (ce qu'on a rejeté et pourquoi), Consequences (impacts positifs et négatifs). Un ADR par décision majeure. Exemple : "ADR-003: Use PostgreSQL instead of MongoDB for TaskFlow."
3. **Technical Proposal** : document pour convaincre un client/stakeholder. Sections : (1) Understanding of the Problem (montrer qu'on a compris). (2) Proposed Solution (détaillé mais pas trop technique). (3) Benefits & ROI (pourquoi cette solution est le meilleur investissement). (4) Implementation Plan (comment on va faire, combien de temps). (5) Risk Mitigation (on a anticipé les problèmes). (6) Next Steps (call to action).
4. **Adapter au public** : CTO/Lead Dev → détails techniques, code examples, benchmarks. Project Manager → planning, risques, budget. Executive/Director → résumé exécutif, ROI, alignement stratégique. Ne pas noyer un directeur sous les détails techniques.
5. **Style professionnel** : phrases courtes (15-20 mots), voix active ("We implemented..." plutôt que "It was implemented..."), éviter le jargon non défini, utiliser des visuels (diagrammes, tableaux) pour aérer, relire 3 fois.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : écrire un ADR pour le choix de la base de données de TaskFlow (PostgreSQL vs MongoDB). Contexte, décision, alternatives, conséquences.
   - **Corrigé** : Title: "ADR-001: Use PostgreSQL as primary database for TaskFlow." Status: Accepted. Context: "TaskFlow requires a database for relational data (users, tasks, assignments with foreign keys)." Decision: "We will use PostgreSQL with Prisma ORM." Alternatives: "MongoDB was considered but rejected because our data is highly relational (users → tasks, tasks → assignments). MongoDB's document model would require complex application-level joins." Consequences: "Positive: ACID compliance, strong consistency, mature ecosystem. Negative: vertical scaling is more complex than MongoDB sharding, but our scale doesn't require it yet."
2. **Exercice 2 (intermédiaire)** : rédiger une réponse à un mini-RFP. Scénario : "Une PME de 50 personnes cherche une solution de gestion de tâches. Budget 5000€, délai 2 mois." Rédiger : Executive Summary, Technical Solution (1 page), Pricing.
   - **Corrigé** : Executive Summary: "We propose TaskFlow, a custom task management solution built on modern technologies. Unlike off-the-shelf tools, TaskFlow is tailored to your workflow, integrates with your existing tools, and gives you full data ownership." Technical Solution: React frontend + Node.js API + PostgreSQL, hosted on Vercel/Render, JWT auth, responsive design. Project Plan: 8 weeks (2 sprints × 4 weeks). Pricing: Development 4000€ + Hosting 50€/month = 4600€ total. Explication de la valeur par rapport au budget.
3. **Exercice 3 (avancé)** : rédiger une proposition technique complète de 3 pages pour la migration d'une infrastructure on-premise vers AWS. Inclure : Executive Summary, Current State & Pain Points, Proposed Architecture (diagramme), Migration Plan (phases), Risk Assessment, Pricing Estimate (TCO 3 ans), Next Steps.

### Banque de questions du module (15)
1. QCM: ADR signifie... A) Architecture Decision Record B) Application Design Review C) Automated Deployment Report
2. QCM: un RFP est... A) une demande de proposition B) un rapport financier C) un script
3. QCM: dans une proposition technique, l'executive summary doit... A) résumer en 1 page pour les décideurs B) détailler le code C) être ignoré
4. Ouverte: pourquoi documenter les alternatives rejetées dans un ADR ?
5. Ouverte: comment adapter le niveau de détail technique selon le public ?
6. Cas: le client dit "votre proposition est trop technique". Que modifier ?
7. QCM: la voix active en rédaction technique... A) est plus claire que la voix passive B) est à éviter C) est identique
8. Ouverte: pourquoi chiffrer le ROI dans une proposition technique ?
9. Cas: "Your price is too high." Réponse en anglais ?
10. QCM: un bon ADR inclut... A) les conséquences de la décision B) uniquement la décision C) rien
11. Ouverte: comment structurer un document technique de plus de 10 pages ?
12. Cas: l'ADR devient obsolète après 6 mois. Que faire ?
13. QCM: objectif du module 2 = A) rédiger des documents techniques professionnels B) écrire des SMS C) éviter d'écrire
14. Ouverte: comment améliorer la qualité de sa rédaction technique ?
15. QCM: résultat attendu = A) ADR + RFP + proposition technique rédigés B) pas de documents C) brouillons

---

## 3) Présentation technique avancée (3h)

### Objectifs d'apprentissage
- Préparer une présentation de conférence technique (15-20 min).
- Réaliser une démonstration client (live demo).
- Animer une architecture review avec des pairs.
- Utiliser des supports visuels efficaces (slides, diagrammes).
- Gérer les questions difficiles en direct.

### Contenu pédagogique
Présenter en public est une compétence qui s'apprend. Les meilleurs orateurs ne sont pas nés ainsi — ils ont pratiqué.

Points clés:
1. **Présentation de conférence** : structure — (1) Hook (accroche : problème, chiffre choc, question). (2) Problem (pourquoi c'est important). (3) Solution (ce qu'on a fait, comment). (4) Demo/Résultats (preuve que ça marche). (5) Lessons Learned (ce qu'on a appris, éviter les mêmes erreurs). (6) Call to Action (essayez, contribuez, posez des questions). 1 slide par minute max. Jamais lire ses slides.
2. **Live demo** : toujours avoir un plan B si la démo échoue (screenshots, vidéo pré-enregistrée). Tester la démo 3 fois avant (matin, midi, soir — les environnements sont capricieux). Préparer un script étape par étape. Parler en faisant : "I'm going to create a new task... as you can see, it appears instantly in the dashboard."
3. **Architecture review** : présenter une architecture à des pairs pour obtenir du feedback. Structure : (1) Context (quel problème l'architecture résout). (2) High-level diagram. (3) Zoom sur les décisions clés. (4) Trade-offs assumés. (5) Questions ouvertes ("I'm not sure about the caching strategy — what do you think?"). Ton : humble, ouvert au feedback, pas défensif.
4. **Supports visuels** : slides épurées (1 idée par slide, 3-5 bullet points max). Diagrammes clairs (draw.io, Excalidraw, Mermaid). Pas de texte en police < 24pt. Utiliser des images, des schémas, des extraits de code. Le slide est un support, pas un prompteur.
5. **Gestion des questions difficiles** : remercier ("That's a great question"), reformuler pour gagner du temps, répondre honnêtement. Si on ne sait pas : "I don't have the exact answer right now, but I can follow up with you after the talk." Proposer de continuer la discussion après la présentation si la réponse est trop longue.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : créer 5 slides pour une présentation de 5 minutes sur TaskFlow. Chaque slide a un titre, 3 bullet points max, et un visuel.
   - **Corrigé** : Slide 1: "TaskFlow — Full-Stack Task Management" + logo + "Built in 6 days with React, Express, PostgreSQL". Slide 2: "The Problem" — teams waste time tracking tasks across emails, spreadsheets, and chats. Slide 3: "The Solution" — diagramme 3-tiers (React → Express → PostgreSQL). Slide 4: "Key Features" — JWT auth, real-time dashboard, filters, deployed on Vercel+Render. Slide 5: "Lessons Learned & Demo" — lien vers la démo en ligne + "Try it at taskflow.vercel.app".
2. **Exercice 2 (intermédiaire)** : préparer un script de live demo de 3 minutes pour TaskFlow. Étape par étape avec les phrases à dire. Prévoir les scénarios d'échec.
   - **Corrigé** : "Let me show you TaskFlow in action. [ouvre l'app] First, I'll log in with my demo account. [login] As you can see, my dashboard shows 3 tasks — 2 in progress, 1 done. Let me create a new task. [clique 'New Task'] I'll call it 'Review Q4 report' — high priority, due next Friday. [sauvegarde] It appears instantly in the list. Now, let me filter by priority. [filtre 'High'] Only high-priority tasks are shown. Finally, let me mark this one as done. [check] The counter updates immediately." Plan B : "If you can't see the screen, I have screenshots of each step on the next slide."
3. **Exercice 3 (avancé)** : animer une architecture review de 15 minutes sur l'architecture de TaskFlow. Présenter le diagramme, expliquer 2 décisions clés (pourquoi PostgreSQL, pourquoi JWT), et solliciter du feedback sur 1 point ouvert (ex: "Should we add a cache layer with Redis?"). Se filmer et analyser.

### Banque de questions du module (15)
1. QCM: une slide de présentation doit contenir... A) 1 idée, 3-5 bullet points max B) tout le script C) des paragraphes
2. QCM: en cas d'échec de la live demo... A) avoir un plan B (screenshots/vidéo) B) abandonner C) improviser
3. QCM: une architecture review a pour but de... A) obtenir du feedback des pairs B) imposer ses choix C) éviter les discussions
4. Ouverte: pourquoi ne jamais lire ses slides ?
5. Ouverte: comment préparer une live demo fiable ?
6. Cas: un participant pose une question hors sujet pendant la présentation. Réaction ?
7. QCM: le "hook" d'une présentation sert à... A) capter l'attention dès les premières secondes B) endormir C) remplir du temps
8. Ouverte: différence de ton entre une conférence et une architecture review.
9. Cas: "Votre architecture ne passera pas à l'échelle." — Réponse en architecture review ?
10. QCM: objectif du module 3 = A) présenter efficacement en public B) éviter de parler C) lire ses slides
11. Ouverte: comment gérer le trac avant une présentation ?
12. QCM: résultat attendu = A) capable de présenter un projet technique en 5-20 min B) stress paralysant C) pas de présentation

---

## 4) Labs — Simulation complète d'entretien + feedback (2h)

### Objectifs
- Simulation d'un entretien technique complet (45 min). Évaluation : technique (précision, profondeur), communication (clarté, structure, anglais), attitude (confiance, honnêteté). Feedback détaillé + points d'amélioration.

### Structure de la simulation
- 5 min : "Tell me about yourself" + projet phare.
- 15 min : questions techniques (cloud, sécurité, dev, dépannage).
- 10 min : questions comportementales (STAR).
- 5 min : questions du candidat au recruteur.
- 10 min : feedback + plan d'amélioration.

---

## 5) Banque de questions + suivi P1 (1h)

Planifier J35 — Projet de synthèse P4 : "Élaborer un dossier complet de recommandation cloud sécurisé pour une PME bancaire."

---

## Validation qualité J34 (anti-superficiel)

### Livrables obligatoires fin de J34
1. 5 réponses STAR documentées (écrites).
2. 1 ADR rédigé pour un choix technique.
3. 1 présentation de 5 minutes avec slides.
4. 1 simulation d'entretien enregistrée (vidéo ou audio).
5. 1 plan d'amélioration personnel pour l'anglais technique.

### Grille d'évaluation rapide (100 points)
- Préparation entretien (STAR, questions techniques, comportementales) : **40 pts**
- Rédaction technique avancée (ADR, proposal) : **25 pts**
- Présentation technique (slides, demo, architecture review) : **20 pts**
- Communication et confiance : **15 pts**

### Seuil attendu
- **>= 80/100** : J34 validé, passage normal J35.

---

## Corrigés guidés — mode tuteur

### A. Module 1 (Entretien technique)
1. **A** — STAR = Situation, Task, Action, Result.
2. **A** — Honnêteté + méthode. Ne jamais inventer.
3. **A** — 60-90 secondes : 30s background + 30s projet + 30s pourquoi ce poste.
4. "Reduced downtime by 60%" est plus impactant que "improved reliability". Les chiffres rendent l'impact concret et mémorisable pour le recruteur.
5. "What does a typical day look like? How does the team handle on-call? What's the biggest technical challenge right now? How do you approach technical debt? What's the career progression?" — minimum 5 questions.
6. Donner une fourchette basée sur le marché : "Based on my research and the responsibilities, I'd expect between X and Y. I'm open to discussion based on the full package." Ne pas donner un chiffre unique au premier entretien.
7. **A** — Honnête + plan d'amélioration. Exemple parfait : "I tend to over-engineer solutions. I'm learning to ask 'what's the simplest thing that works?' before designing."
8. 30s: "I'm a [rôle] with experience in [technos]. I recently built [projet]." 30s: "What excites me about this role is [mission/stack]." 30s: "I'm looking for [type d'équipe/projet]." Total: 90s.
9. "I combine technical depth in [stack] with practical experience in [domaine]. I've proven I can deliver by building [projets]. But more importantly, I'm eager to learn and I'm genuinely excited about [mission de l'entreprise]."
10. **A** — Le silence est normal. Respirer, réfléchir, structurer sa réponse. Mieux vaut 10 secondes de silence qu'une réponse confuse.
11. "Actually, let me rephrase that..." ou "Let me clarify my previous answer..." On a le droit de se corriger. L'honnêteté est appréciée.
12. S: "I deployed a feature without sufficient testing." T: "It caused a production outage." A: "I immediately rolled back, wrote a post-mortem, and added automated tests to the CI pipeline." R: "We had zero P1 incidents from deployments in the following 6 months." Le STAR négatif montre la capacité à apprendre de ses erreurs.
13. **A**
14. Réviser les questions techniques classiques, préparer 3 réponses STAR, rechercher l'entreprise (produit, stack, actualités), préparer ses questions, dormir 8h. Ne pas apprendre de nouvelles technos la veille.
15. **A**

### B. Module 2 (Rédaction avancée)
1. **A**
2. **A**
3. **A**
4. Pour montrer que la décision est réfléchie, pas arbitraire. Si quelqu'un conteste la décision 6 mois plus tard, l'ADR explique pourquoi les alternatives ont été rejetées. Mémoire du projet.
5. CTO = détails techniques, code, benchmarks. PM = planning, risques. Director = résumé, ROI, alignement stratégique. Adapter le vocabulaire ET la profondeur.
6. Ajouter un executive summary d'une page sans jargon. Déplacer les détails techniques en annexe. Utiliser des analogies métier ("la base de données est comme un classeur — PostgreSQL range les dossiers de façon structurée").
7. **A** — "We deployed the fix" (clair, direct) vs "The fix was deployed" (passif, moins engageant). La voix active est plus dynamique et plus courte.
8. Pour parler le langage des décideurs. Un directeur comprend "This solution will save 50K€/year" mieux que "We'll use Kubernetes with auto-scaling." Le ROI justifie l'investissement.
9. "I understand budget is a concern. Let's look at what we can adjust: we can reduce scope by deprioritizing features X and Y, or extend the timeline to reduce the monthly cost. What would work best for you?" — Négocier sur le scope ou le délai, pas brader le prix.
10. **A**
11. Table of contents au début, executive summary en première page, chaque section est autonome, annexes pour les détails, glossaire pour les acronymes. Le lecteur doit pouvoir lire le doc dans l'ordre qu'il veut.
12. Mettre à jour le status en "deprecated" ou "superseded by ADR-007". Ajouter une note expliquant pourquoi. Ne jamais supprimer un ADR — il fait partie de l'historique du projet.
13. **A**
14. Lire des ADR/proposals réels (open source), faire relire ses écrits par des pairs, utiliser des outils (Grammarly, Hemingway App), écrire régulièrement (blog technique, documentation).
15. **A**

### C-E. Modules 3-5 (Présentation, Labs, Banque)
1. **A**
2. **A**
3. **A**
4. Le public lit plus vite que l'orateur ne parle. Si on lit, le public a fini avant nous et s'ennuie. Les slides sont un support visuel, l'orateur raconte l'histoire. Lire = perte de connexion avec le public.
5. Tester 3 fois (matin, midi, soir — les environnements changent). Avoir un script précis. Préparer un environnement propre (pas d'onglets personnels, pas de notifications). Avoir un backup (screenshots, vidéo, environnement local).
6. "That's an interesting point, but let me address it briefly — and I'm happy to discuss it further after the talk." Courtois, bref, recentrer sur le sujet. Ne pas ignorer, ne pas dérailler.
7. **A**
8. Conférence = one-to-many, storytelling, inspirant, large public. Architecture review = many-to-many, collaboratif, humble, petit groupe de pairs. Le ton est plus décontracté, on sollicite activement du feedback.
9. "That's a valid concern. Can you help me understand which specific bottleneck you see? We've load-tested this architecture at 10K requests/second. If you have experience scaling similar systems, I'd love your input." — Ouvert, pas défensif, basé sur des données.
10. **A**
11. Respirer profondément (4-7-8 breathing). Arriver en avance, tester le matériel. Commencer par un hook engageant (ça brise la glace). Se rappeler que le public veut que ça se passe bien. La pratique réduit le trac.
12. **A**