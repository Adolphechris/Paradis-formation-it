# CAHIER DES CHARGES MASTER — UNIVERSITÉ VIRTUELLE PARADIS IT (Local‑First, Free‑First)

Version: 1.0
Date: 2026-07-28
Auteur: Copilot CLI (fusion v2.0 + compléments infra)

---

But: Ce document fusionne et complète le cahier des charges v2.0 présent dans le dossier `00-cahier-des-charges` avec des précisions techniques, opérationnelles et des alternatives adaptées au travail collaboratif. Il privilégie une approche hybride orientée collaboration — Firestore (free tier) comme solution cloud préférée pour le travail en équipe avec Antigravity — tout en conservant un fallback local‑first (IndexedDB) pour usage hors‑ligne et sauvegarde personnelle.

Objectifs de ce document
- Proposer une spécification détaillée, exécutable et vérifiable pour construire une plateforme d’apprentissage PARADIS IT centrée sur un usage local et gratuit.
- Conserver les fonctionnalités métiers identifiées (PWA, simulateur BCC, tuteur IA socratique, radar de compétences, export employabilité) tout en adaptant l’architecture aux contraintes budgétaires.
- Fournir une roadmap sprintable, une checklist d’acceptation et des alternatives techniques avec leurs tradeoffs.

Contexte et contraintes
- Usage principal : usage sur ta machine (desktop) mais la plateforme doit permettre une collaboration multi‑utilisateurs via Firestore (free tier) pour synchronisation et backups. L’usage mobile reste optionnel.
- Budget : priorité aux solutions gratuites ou au free tier (Firestore free plan, GitHub). Éviter services payants au lancement.
- Contenu : 45 jours (J1–J45) rédigés dans le dépôt GitHub du projet.
- Collaboration : intégration avec Antigravity nécessite un backend cloud partagé — Firestore est recommandé comme première solution.


1. Synthèse des choix techniques (recommandation)
- Frontend / site de cours : Docusaurus (React + MDX) — recommandé par défaut pour richesse d'intégration et UX. MkDocs documenté comme alternative légère.
- Persistance & synchronisation (préférence) : Cloud Firestore (Firebase) comme stockage principal pour collaboration et synchronisation multi‑utilisateur (utiliser le free tier d'abord). Firestore offre authentification managée, règles de sécurité et sync realtime.
- Fallback local‑first : IndexedDB (via idb library) pour cache, lecture offline et usage hors‑ligne. Une couche d'abstraction 'storage adapter' doit permettre d'échanger Firestore <-> IndexedDB sans changements métier.
- Synchronisation optionnelle : Git (push vers GitHub) pour sauvegarde et versioning complémentaire ; workflow de synchronisation manuelle documenté.
- QCM & évaluations : moteur natif léger (JSON/Markdown) + possibilité d’intégrer H5P pour activités interactives si besoin. Les QCM restent exportables/importables (CSV/JSON).
- Stockage fichiers utilisateur (screenshots projets) : stockage local (.paradis/uploads) et export ZIP ; option push vers GitHub repos privés pour portfolio.
- Tuteur IA : prototype via widget chat connecté à une API (OpenAI/compatible) — fonctionnera en ligne. En mode local‑first, tuteur IA peut être dégradé vers une FAQ locale (search sur Markdown) si pas d’accès API.
- CI/CD minimal : GitHub Actions pour build preview; déploiement GitHub Pages (optionnel) pour partage public.


2. Périmètre fonctionnel consolidé (inclus / exclus)
Inclus (MVP hybride, Firestore preferred)
- Lecture jour par jour (45 J) avec sections Objectifs / Contenu / Exercices / Validation.
- Marquage et suivi de la progression : stockage principal Cloud Firestore (realtime, multi‑device). IndexedDB utilisé comme cache local pour offline et performance.
- QCM et tests auto‑corrigés (moteur natif) : stockage des tentatives dans Firestore quand connecté, sinon en IndexedDB et synchronisation automatique.
- Portfolio (fiches projets + liens GitHub) synchronisé via Firestore; export PDF du rapport d’employabilité disponible localement.
- PWA (installable) pour consultation hors‑ligne ; service worker et IndexedDB pour contenu et scores.
- Interface agréable (design system minimal) : typographie Inter, palette définie, images optimisées.
- Option de synchronisation manuelle via Git/GitHub (gratuit) pour backup et partage complémentaire.

Exclus du MVP
- Vector DB hébergée pour IA (possible ultérieurement).
- Services payants non essentiels — les fonctionnalités cloud doivent rester dans les quotas gratuits initialement.


3. Spécifications détaillées
3.1 Structure du contenu
- Organisation : Tome > Jour > Sections. Chaque leçon est un fichier Markdown (déjà présent dans le repo).
- Frontmatter minimal par fichier : title, tome, jour, duration_estimate, tags, quiz_id (optionnel).
- Rendu : MDX ou Marked.js (si MkDocs) pour mise en page riche (code highlighting, callouts).

3.2 Authentification & comptes
- MVP local : comptes locaux simulés (profil stocké dans IndexedDB avec optional local password). Pour sécurité, mot de passe chiffré (bcryptjs) côté client.
- Option avancée (si usage multi‑machines) : OAuth GitHub simple (gratuit) pour authentication et identification. Synchronisation via Git require user token (manuelle et controlée).
- Réinitialisation compte : export/import du profil JSON pour récupération.

3.3 Progression & badges
- Progression stockée en IndexedDB : structures DayProgress et UserProfile compatibles avec v2.0.
- Badges locaux : règles évaluées client-side. Exportable dans le rapport PDF.

3.4 QCM & examens
- Format question : JSON (fields: id, type [qcm/open/case], choices, correct, weight, tags).
- Engine : évaluer localement, stocker tentatives; chrono strict pour examen blanc (100 Q configurable).
- Export résultats : JSON/CSV + inclusion dans rapport PDF.

3.5 Portfolio & projets
- Fiches projets locales (meta + liens GitHub). Export ZIP pour transfert. Option : automatiser commit vers repo GitHub personnel pour mise en ligne.

3.6 Tuteur IA (dégradé)
- Comportement recommandé (prendre le prompt socratique du v2.0). En production, chat widget appelle API externe.
- Si pas d’accès API, fallback : recherche locale sur Markdown + ensemble d’expressions/FAQ. Le prompt et les règles d’engagement sont documentés.

3.7 PWA / Offline
- Manifest.json et sw.js. Service worker : cache-first pour assets, network-first with fallback to IndexedDB for Markdown content.
- IndexedDB structure : store "lessons", "progress", "quizzes", "notes".

3.8 Synchronisation & backup
- Backup local : export JSON complète (user_profile + progress + submissions) et archive ZIP des uploads.
- Option Git backup : script local qui commit/ push dans un repo GitHub (utilisateur fournit token). Documenter workflows et gestion des conflits.


4. Design System & UX (directives)
- Palette : Bleu profond #0B5FFF (brand), Turquoise #2EC4B6 (accent), Orange #FF7A18 (CTA), surfaces #F7F9FC.
- Typographie : Inter (titres) / Inter Regular (corps) / Fira Code (code blocks).
- Layout : barre de navigation fixe, progress bar, table des matières latérale, dark mode.
- Images : utiliser SVG/vector (undraw) + photos optimisées WebP. Tous les fichiers image doivent avoir attribut alt.


5. Sécurité & conformité (adapté local‑first)
- Chiffrement : mot de passe local haché par bcryptjs côté client (alerte : sécurité limitée en local). Recommander migration OAuth/GitHub pour multi‑machine.
- Sanitization : utiliser DOMPurify pour tout rendu Markdown transformé en HTML.
- CSP : header Content-Security-Policy pour déploiement public (si GitHub pages, config via meta tag). HSTS et Secure cookies si relevant.
- RGPD (local) : interface pour export/suppression de données (export JSON + bouton delete local profile). Document DPO/contact si mise en prod publique.


6. Tradeoffs : Firestore vs Local‑First
- Firestore (avantages) : realtime sync, authentication managée, backups managés, facilité de collaboration multi‑device; le free tier convient pour un usage initial collaboratif avec Antigravity. (Inconvénient) : lock‑in potentiel, facturation si usage important, contraintes de résidence des données — surveiller la consommation et mettre des quotas.
- Local‑First (avantages) : zéro coût immédiat, contrôle total, fonctionne offline. (Inconvénient) : synchronisation multi‑machines manuelle, limites de sécurité côté client.
- Recommandation : démarrer en mode hybride avec Firestore comme stockage principal pour la collaboration (utiliser le free tier et règles de sécurité strictes), tout en implémentant un fallback IndexedDB et une abstraction storage adapter pour une bascule transparente si nécessaire.


7. Tests, QA et pipeline (MVP)
- Linting : ESLint + Prettier (JS), remark-lint pour Markdown.
- Smoke tests : Playwright/puppeteer minimal pour parcours critiques (ouvrir jour, lancer qcm local, exporter rapport).
- CI (optionnel) : GitHub Actions pour build preview. No paid CI required.


8. Plan Sprint & checklist MVP (1–5 semaines)
Sprint 0 (2 jours)
- Initialiser Docusaurus project, design system minimal, manifest & service worker stub.
- Import 45 fichiers Markdown et vérifier rendu.

Sprint 1 (5 jours)
- Implémenter IndexedDB storage, loader de contenu offline, navigation, progress marker.
- Local profile + badge logic.

Sprint 2 (4 jours)
- Engine QCM local + examen blanc (100 Q) + chrono strict.
- Export résultats local.

Sprint 3 (3 jours)
- Portfolio local & export PDF (use puppeteer/lib for PDF generation or jsPDF client-side).
- Backup export/import JSON and Git backup script.

Sprint 4 (3 jours)
- Tuteur IA prototype (widget that calls API) + local fallback search.
- Polish UI (images, typography) and acceptance tests.

Checklist d'acceptation MVP
- [ ] Lecture de chaque jour (45) fonctionne hors‑ligne.
- [ ] Progression enregistrée et exportable.
- [ ] Examen blanc 100Q chrono fonctionne et scores exportés.
- [ ] Portfolio exportable et rapport PDF généré.
- [ ] Backup/restore JSON complète.


9. Annexes techniques (APIs locales & scripts)
- `scripts/export_profile.js` : export JSON profile + progress.
- `scripts/git_backup.sh` : commit + push helper (requires GH token env var).
- API local (service worker routes) : `/api/local/export`, `/api/local/import`.


10. Annexes: Estimations & coût (résumé)
- Coût initial logiciel : 0€ (tout open source). Docusaurus, IndexedDB, service worker, jsPDF.
- Coût éventuel API IA : variable (prévoir 0€/mois à test puis 50–200€/mois selon usage). Tuteur IA peut être désactivé pour rester gratuit.


11. Recommandations opérationnelles finales
- Start hybrid with Docusaurus and Cloud Firestore (use free tier) as primary for sync/collaboration; IndexedDB remains fallback for offline and cache. Use GitHub for versioned backups and PR workflow.
- Maintain a storage adapter layer so swapping or supporting multiple storage backends (Firestore, Supabase, local IndexedDB) is straightforward.
- Implement sanitization and CSP early to avoid XSS issues.
- Prioritize UX polish: typography, spacing and images — user experience is a major motivation factor.


12. Actions proposées (à exécuter maintenant)
- [ ] Commit this file to repo (je peux créer la PR si tu veux).
- [ ] Initialiser Docusaurus skeleton and import J1–J45 (I can run and push a branch `site/docusaurus-init`).
- [ ] Implement IndexedDB skeleton + sample progress storage.


Fichier créé : `/00-cahier-des-charges/cahier-des-charges-merged.md`

---

Si tu veux, j'ouvre une PR qui contient ce fichier et un squelette Docusaurus (branche `site/docusaurus-init`). Veux‑tu que je crée la PR et que je commit les premiers fichiers (README + skeleton) ?