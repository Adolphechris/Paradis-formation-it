# TOME P0 — Jour 02 (14h)

## Découpage horaire officiel (à respecter)
- HTML — **2h30**
- CSS — **3h**
- JavaScript (notions) — **3h**
- Git/GitHub — **3h**
- Banque de questions du jour — **1h30**
- Suivi P1 (recherche d'emploi, CV, veille) — **30 min**

---

## 1) HTML (2h30)

### Objectifs d'apprentissage
- Structurer une page web avec une sémantique claire.
- Créer un formulaire simple exploitable en contexte professionnel.
- Produire un HTML lisible, maintenable et cohérent avec l’accessibilité de base.

### Contenu pédagogique
HTML est le squelette de la page. Une bonne page commence par une structure propre:
- `header`, `main`, `section`, `article`, `footer`.
- Titres hiérarchiques (`h1` à `h3`) logiques.
- Listes, tableaux, liens, images avec texte alternatif (`alt`).

Principes essentiels:
1. **Sémantique**
   - Utiliser les balises pour leur sens, pas seulement pour l’apparence.
   - Exemple: un menu doit être dans `nav`, pas dans un `div` générique.

2. **Formulaires**
   - `label` relié aux champs (`for`/`id`).
   - Types adaptés (`email`, `tel`, `date`) pour réduire les erreurs.
   - Attributs `required`, `placeholder` (avec modération).

3. **Qualité pro**
   - Indentation propre, commentaires utiles.
   - Structure stable pour faciliter CSS/JS ensuite.
   - Base alignée accessibilité (navigation clavier, libellés compréhensibles).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Créer une page "Profil professionnel" avec `header`, `main`, `footer`.
   - **Corrigé détaillé** :
     - Le `header` contient le titre principal (`h1`) et une navigation minimale.
     - Le `main` contient au moins 2 `section` (ex: compétences, expérience simulée).
     - Le `footer` contient contact/date de mise à jour.
     - Validation : un seul `h1`, ordre logique des titres (`h2`, `h3`).

2. **Exercice 2 (intermédiaire)**  
   Ajouter un formulaire de contact (nom, email, message) avec `label`.
   - **Corrigé détaillé** :
     - Chaque champ possède un `id` unique et un `label for` correspondant.
     - Le champ email utilise `type="email"` et les 3 champs critiques sont `required`.
     - Le bouton d'envoi est explicite ("Envoyer la demande").
     - Validation : navigation clavier possible et libellés compréhensibles.

3. **Exercice 3 (avancé)**  
   Transformer une page en version sémantique (remplacer les `div` excessifs par `section`, `nav`, `article`).
   - **Corrigé détaillé** :
     - Les blocs de navigation passent en `nav`; contenus indépendants passent en `article`.
     - Les zones thématiques sont regroupées en `section` titrées.
     - Le code devient plus lisible pour le style et les scripts.
     - Validation : structure plus claire au test lecteur de code/inspecteur DOM.

### Nouvelles abréviations rencontrées
- SEO | Search Engine Optimization | Optimisation de visibilité d’une page web | Interagit avec HTML sémantique, performance CSS/JS, UX
- WCAG | Web Content Accessibility Guidelines | Référentiel d’accessibilité web | Interagit avec HTML, UX, formulaires, tests qualité

### Banque de questions du module (15)
1. QCM : Quel rôle principal de HTML ?  
   A. Styliser B. Structurer C. Héberger
2. QCM : `nav` sert à...  
   A. Mettre une image B. Décrire la navigation C. Exécuter un script
3. QCM : Pourquoi lier `label` et `input` ?  
   A. Décoration B. Accessibilité et clarté C. SEO uniquement
4. QCM : Attribut `alt` sur image =  
   A. Taille B. Texte alternatif C. Couleur
5. Ouverte : Différence entre `section` et `article`.
6. Ouverte : Pourquoi éviter une page avec uniquement des `div` ?
7. Mise en situation : Un formulaire n’est pas compréhensible au clavier. Que corriger ?
8. QCM : Un document HTML valide doit avoir...  
   A. Plusieurs `h1` au hasard B. Hiérarchie de titres logique C. Aucune section
9. Ouverte : Citer 3 éléments HTML sémantiques utiles.
10. QCM : `required` sert à...  
   A. Chiffrer B. Rendre un champ obligatoire C. Centrer texte
11. Mise en situation : Un recruteur lit ton code. Que voit-il d’abord ?
12. QCM : SEO profite surtout de...  
   A. Structure claire B. Couleurs flashy C. Code obfusqué
13. Ouverte : Comment préparer un HTML facile à styliser ensuite ?
14. QCM : WCAG concerne surtout...  
   A. Comptabilité B. Accessibilité C. Réseau
15. Ouverte : Donne une checklist HTML de qualité avant livraison.

---

## 2) CSS (3h)

### Objectifs d'apprentissage
- Styliser une page avec une organisation CSS propre.
- Utiliser Flexbox et Grid pour mettre en page.
- Adapter une interface aux tailles d’écran courantes.

### Contenu pédagogique
CSS transforme la structure HTML en interface lisible.

1. **Base**
   - Sélecteurs simples (`.classe`, `#id`, balise).
   - Priorité/cascade.
   - Variables CSS pour uniformité visuelle.

2. **Mise en page**
   - **Flexbox** : alignement horizontal/vertical rapide.
   - **Grid** : disposition plus complexe en lignes/colonnes.

3. **Responsive**
   - Media queries pour desktop/tablette/mobile.
   - Éviter dimensions rigides partout.
   - Vérifier lisibilité (contrastes, espacements, tailles de police).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Styliser une carte profil (titre, texte, bouton).
   - **Corrigé détaillé** :
     - Police lisible (taille min ~16px pour texte courant).
     - Espacements homogènes (`padding`/`margin`) entre titre, texte, bouton.
     - Contraste texte/fond suffisant pour lecture confortable.
     - Validation : rendu propre sans surcharge visuelle.

2. **Exercice 2 (intermédiaire)**  
   Construire une barre de navigation avec Flexbox.
   - **Corrigé détaillé** :
     - Conteneur menu en `display: flex`.
     - Alignement horizontal cohérent (`justify-content`) et vertical (`align-items`).
     - Espacement régulier via `gap` (ou marges contrôlées).
     - Validation : menu reste lisible lors du redimensionnement.

3. **Exercice 3 (avancé)**  
   Créer une grille de 6 cartes responsive (3 colonnes desktop, 2 tablette, 1 mobile).
   - **Corrigé détaillé** :
     - Desktop: `grid-template-columns: repeat(3, 1fr)`.
     - Tablette: media query vers 2 colonnes; mobile: 1 colonne.
     - Les cartes gardent des marges internes stables et ne débordent pas.
     - Validation : test manuel sur largeurs desktop/tablette/mobile.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : CSS sert d’abord à...  
   A. Structurer B. Styliser C. Héberger
2. QCM : Flexbox est idéal pour...  
   A. Alignement simple B. Base SQL C. Authentification
3. QCM : Grid est utile pour...  
   A. Mise en page 2D B. Emails C. Compression
4. Ouverte : Différence Flexbox vs Grid.
5. QCM : Media query sert à...  
   A. Protéger mot de passe B. Adapter écran C. Exporter CSV
6. Mise en situation : Le site déborde sur mobile. Que vérifies-tu ?
7. Ouverte : Pourquoi utiliser des variables CSS ?
8. QCM : Un bon contraste vise...  
   A. Lisibilité B. Décoration uniquement C. Aucun impact
9. Ouverte : Comment organiser ton fichier CSS pour maintenance ?
10. QCM : Le cascade CSS signifie...  
    A. Dernière règle applicable peut l’emporter B. Toutes règles égales C. CSS aléatoire
11. Mise en situation : Deux styles se contredisent, comment trancher ?
12. Ouverte : Donne 3 vérifications responsive avant livraison.
13. QCM : Quel choix est le plus robuste ?  
    A. Largeurs fixes partout B. Mise en page flexible C. Pas de media queries
14. Ouverte : Pourquoi le design influence l’employabilité ?
15. Mise en situation : Recruteur ouvre ton site sur téléphone, objectif minimal ?

---

## 3) JavaScript — notions (3h)

### Objectifs d'apprentissage
- Manipuler le DOM pour ajouter de l’interactivité.
- Gérer des événements utilisateur (clic, saisie).
- Appliquer une logique conditionnelle simple en JS côté client.

### Contenu pédagogique
JavaScript donne vie à la page.

1. **Fondamentaux**
   - Variables (`let`, `const`), conditions, fonctions.
   - Bon nommage et blocs courts.

2. **DOM**
   - Sélection d’éléments (`querySelector`).
   - Modification texte/classe/style.
   - Ajout/suppression d’éléments simples.

3. **Événements**
   - `click`, `input`, `submit`.
   - Validation simple de formulaire avant envoi.
   - Affichage de messages utilisateur explicites.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Bouton "Afficher message" qui écrit "Bienvenue sur PARADIS".
   - **Corrigé détaillé** :
     - Sélection du bouton et de la zone cible avec `querySelector`.
     - Ajout d'un `addEventListener("click", ...)`.
     - Mise à jour du texte de la zone cible à chaque clic.
     - Validation : message visible immédiatement sans rechargement.

2. **Exercice 2 (intermédiaire)**  
   Vérifier qu’un champ email n’est pas vide avant soumission.
   - **Corrigé détaillé** :
     - Écoute de l'événement `submit` sur le formulaire.
     - Si champ vide: `preventDefault()`, message d'erreur affiché.
     - Si champ rempli: autoriser la soumission.
     - Validation : aucun envoi "vide" possible côté interface.

3. **Exercice 3 (avancé)**  
   Construire une mini TODO list locale (ajouter/supprimer tâche visuelle).
   - **Corrigé détaillé** :
     - Ajouter un item dans la liste au clic sur "Ajouter".
     - Créer un bouton "Supprimer" par item.
     - Supprimer uniquement l'item ciblé, pas toute la liste.
     - Validation : cycle add/remove fluide et sans rechargement.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : JS côté client s’exécute principalement...  
   A. Dans la base SQL B. Dans le navigateur C. Dans Word
2. QCM : Le DOM représente...  
   A. Le réseau B. La structure manipulable de la page C. Un serveur
3. QCM : `addEventListener` sert à...  
   A. Mettre en forme B. Réagir à un événement C. Compiler
4. Ouverte : Différence entre `let` et `const`.
5. QCM : Validation formulaire côté client vise...  
   A. Remplacer sécurité serveur B. Améliorer UX C. Ignorer erreurs
6. Mise en situation : Un bouton ne réagit pas, quelles causes probables ?
7. Ouverte : Pourquoi séparer logique JS et structure HTML ?
8. QCM : Quel événement capte une frappe utilisateur ?  
   A. `input` B. `print` C. `export`
9. Ouverte : Donne une stratégie de débogage JS débutant.
10. QCM : Une fonction sert à...  
    A. Dupliquer logique B. Réutiliser logique C. Supprimer CSS
11. Mise en situation : Un formulaire envoie des données vides, que fais-tu ?
12. Ouverte : Expliquer la valeur d’une TODO list pour l’apprentissage.
13. QCM : DOM + JS permettent surtout...  
    A. Gestion disques B. Interactivité UI C. Création IP
14. Ouverte : Pourquoi éviter un gros script monolithique ?
15. Mise en situation : Comment rendre un message d’erreur utile à l’utilisateur ?

---

## 4) Git/GitHub (3h)

### Objectifs d'apprentissage
- Exécuter le workflow Git quotidien (clone, add, commit, push, pull).
- Comprendre la logique des branches et des conflits simples.
- Publier un travail traçable et propre sur GitHub.

### Contenu pédagogique
Git = traçabilité et sécurité du travail.

1. **Cycle de base**
   - `git clone`, `git status`, `git add`, `git commit`, `git push`.
   - Un commit = une intention claire.

2. **Branches**
   - Travailler hors branche principale.
   - Fusionner après validation.
   - Lire un conflit et résoudre avec méthode.

3. **Hygiène pro**
   - Messages de commit explicites.
   - Fichiers inutiles exclus.
   - Synchronisation régulière avec la branche distante.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Initialiser un dépôt local, créer README, faire 1 commit.
   - **Corrigé détaillé** :
     - `git init`, création du fichier README.
     - `git add README.md` puis `git commit -m "Initialize README"`.
     - Vérification par `git log --oneline`.
     - Validation : historique contient le commit attendu.

2. **Exercice 2 (intermédiaire)**  
   Créer une branche `feature/j2-html`, modifier un fichier, fusionner.
   - **Corrigé détaillé** :
     - `git checkout -b feature/j2-html`.
     - Modification + commit sur la branche.
     - Retour branche principale puis `git merge feature/j2-html`.
     - Validation : modifications présentes et historique lisible.

3. **Exercice 3 (avancé)**  
   Simuler un conflit (même ligne modifiée sur deux branches) et le résoudre.
   - **Corrigé détaillé** :
     - Conflit reproduit sur même ligne depuis deux branches.
     - Pendant merge, ouvrir le fichier et résoudre entre marqueurs `<<<<<<<`.
     - `git add` puis commit de résolution.
     - Validation : plus de conflit, code final cohérent.

### Nouvelles abréviations rencontrées
- PAT | Personal Access Token | Jeton d’authentification GitHub pour opérations sécurisées | Interagit avec Git, GitHub, HTTPS, gestion d’accès

### Banque de questions du module (15)
1. QCM : `git status` sert à...  
   A. Déployer B. Voir état des changements C. Chiffrer disque
2. QCM : Un commit doit idéalement...  
   A. Tout mélanger B. Porter une intention claire C. Être vide
3. QCM : Une branche permet de...  
   A. Casser main B. Isoler un travail C. Supprimer historique
4. QCM : PAT signifie...  
   A. Private Admin Tool B. Personal Access Token C. Public API Ticket
5. Ouverte : Pourquoi pousser régulièrement son travail ?
6. Mise en situation : `push` rejeté, premier réflexe ?
7. Ouverte : Différence `git pull` vs `git fetch`.
8. QCM : Un conflit arrive quand...  
   A. Deux changements incompatibles touchent la même zone B. Le Wi-Fi coupe C. Le dépôt est vide
9. Ouverte : Donne une bonne convention de message de commit.
10. Mise en situation : Tu as modifié un mauvais fichier, comment réagir proprement ?
11. QCM : GitHub sert principalement à...  
    A. Éditer Word B. Héberger/collaborer sur code C. Créer IP
12. Ouverte : Pourquoi une branche dédiée augmente la sécurité du projet ?
13. QCM : `git add` fait...  
    A. Ajoute au staging B. Push direct C. Crée une release
14. Ouverte : Quels contrôles faire avant commit ?
15. Mise en situation : Tu dois expliquer ton historique à un recruteur, points clés ?

---

## 5) Banque de questions du jour (1h30)

### Objectifs d'apprentissage
- Évaluer rapidement l’assimilation de HTML/CSS/JS/Git.
- Identifier les faiblesses techniques à corriger avant J3.
- Travailler la vitesse de réponse en conditions test.

### Contenu pédagogique
Format recommandé:
1. 45 min test mixte (QCM + ouvertes + cas).
2. 30 min correction active.
3. 15 min plan correctif ciblé.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Construire un mini-test de 16 questions couvrant les 4 blocs.
   - **Corrigé détaillé** :
     - 4 questions HTML, 4 CSS, 4 JS, 4 Git.
     - Mélange QCM/ouvert/mise en situation.
     - Ordonnancement du plus simple au plus exigeant.
     - Validation : couverture équilibrée des compétences du jour.

2. **Exercice 2 (intermédiaire)**  
   Corriger les erreurs en 3 catégories: concept, méthode, attention.
   - **Corrigé détaillé** :
     - Chaque erreur classée dans une catégorie unique.
     - Une action corrective concrète associée à chaque erreur.
     - Priorité aux erreurs fréquentes et à fort impact.
     - Validation : plan de correction exécutable dès la session suivante.

3. **Exercice 3 (avancé)**  
   Créer un plan de rattrapage 12h avant J3.
   - **Corrigé détaillé** :
     - Plan découpé en blocs (ex: 3h HTML/CSS, 3h JS, 3h Git, 3h tests).
     - Chaque bloc a un livrable mesurable (page, script, historique Git).
     - Inclure un mini test de validation final.
     - Validation : plan réaliste, mesurable et aligné sur les lacunes.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : But d’une banque quotidienne ?  
   A. Occupation B. Mesure + correction C. Décoration
2. Ouverte : Pourquoi corriger immédiatement après test ?
3. QCM : Une faiblesse "méthode" signifie...  
   A. Concept inconnu uniquement B. Procédure de résolution fragile C. Pas d’enjeu
4. Mise en situation : Fort en HTML, faible en Git. Priorité de remédiation ?
5. Ouverte : Comment gagner en vitesse sans perdre précision ?
6. QCM : Quel format de test ressemble le plus à un recrutement ?  
   A. Sans contrainte B. Chronométré C. Aléatoire sans correction
7. Ouverte : Donne une grille simple de suivi des erreurs.
8. QCM : Révision active =  
   A. Relecture passive B. Rappel/exercice C. Pause longue
9. Mise en situation : Tu paniques en chrono, que ajustes-tu ?
10. Ouverte : Que faire des questions ratées récurrentes ?
11. QCM : Une bonne question évalue...  
    A. Mémoire brute seule B. Compétence actionnable C. Chance
12. Ouverte : Comment lier test et amélioration continue ?
13. Mise en situation : Tu obtiens 60%. Plan d’action en 24h ?
14. QCM : Le débriefing sert à...  
    A. Noter seulement B. Comprendre et corriger C. Reporter au lendemain
15. Ouverte : Exemple de preuve objective de progression entre deux tests.

---

## 6) Suivi P1 (30 min) — recherche d'emploi, CV, veille

### Objectifs d'apprentissage
- Mettre à jour le CV/profil avec les preuves J2.
- Extraire les compétences techniques demandées dans 3 offres ciblées.
- Ajuster le plan J3 selon l’écart marché observé.

### Contenu pédagogique
Routine rapide:
1. 10 min : ajouter preuves J2 (HTML/CSS/JS/Git) au CV/profil.
2. 10 min : analyser 3 offres "Professionnel du numérique" et variantes.
3. 10 min : choisir 1 priorité à renforcer en J3.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Ajouter une ligne CV: "Intégration front-end + Git workflow".
   - **Corrigé détaillé** :
     - Formulation factuelle: action réalisée, outils utilisés, résultat produit.
     - Exemple attendu: "Création d'une page responsive HTML/CSS avec workflow Git (branche + commit + merge)".
     - Validation : phrase courte, vérifiable, sans exagération.

2. **Exercice 2 (intermédiaire)**  
   Lister 5 exigences récurrentes vues dans 3 offres.
   - **Corrigé détaillé** :
     - Regrouper les exigences similaires (ex: Git/GitHub).
     - Compter la fréquence d'apparition.
     - Classer de la plus fréquente à la moins fréquente.
     - Validation : priorités de travail clairement justifiées.

3. **Exercice 3 (avancé)**  
   Rédiger un pitch de 6 lignes "ce que je sais faire après J2".
   - **Corrigé détaillé** :
     - Ligne 1-2: compétences techniques concrètes.
     - Ligne 3-4: exemple de livrable réalisé.
     - Ligne 5-6: valeur pour poste "Professionnel du numérique".
     - Validation : discours crédible, orienté impact, sans promesse non prouvée.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : Le suivi P1 sert surtout à...  
   A. Reporter candidature B. Aligner apprentissage et marché C. Ignorer les offres
2. Ouverte : Pourquoi documenter des preuves dès J2 ?
3. QCM : Une ligne CV technique efficace contient...  
   A. Titre vague B. Action + outil + résultat C. Emoji
4. Mise en situation : Offre demande Git/HTML/CSS, pas JS. Que ajustes-tu ?
5. Ouverte : Comment prioriser une faiblesse observée dans les offres ?
6. QCM : Le pitch doit être...  
   A. Général B. Concret C. Hors sujet
7. Ouverte : Différence entre "j’ai étudié" et "je sais faire".
8. QCM : Quelle preuve est la plus forte ?  
   A. Déclaration seule B. Livrable démontrable C. Intention
9. Mise en situation : Tu manques d’expérience pro officielle. Stratégie ?
10. Ouverte : Comment exploiter la veille sans perdre du temps d’étude ?
11. QCM : P1 quotidien évite...  
    A. Progrès technique B. Retard de candidature C. Portfolio
12. Ouverte : Donne 2 exemples de preuves J2 valorisables.
13. Mise en situation : Un recruteur doute de ton niveau. Que montres-tu ?
14. QCM : Objectif final P1 dans PARADIS ?  
    A. CV théorique B. Candidature crédible et alignée C. Score esthétique
15. Ouverte : Quelle action P1 lancer dès demain matin ?

---

## Validation qualité J2 (anti-superficiel)

### Grille d'évaluation rapide (sur 20)
| Module | Note /20 | Seuil |
|---|---|---|
| HTML | ? | >= 14 |
| CSS | ? | >= 14 |
| JavaScript notions | ? | >= 12 |
| Git/GitHub | ? | >= 14 |

### Seuil global J2
- **>= 16/20** : acquis opérationnel, passage J3 normal.
- **12-15/20** : passage J3 avec remédiation ciblée 30 min.
- **< 12/20** : renforcement J3 obligatoire avant montée de charge.

### Check-lists de validation
- [ ] Je peux créer une page HTML valide avec structure sémantique (header, main, section, footer)
- [ ] Je sais appliquer un style CSS cohérent (couleurs, typographie, espacement) avec un fichier externe
- [ ] Je peux rendre une page responsive (media queries ou approche fluide)
- [ ] Je maîtrise les bases JavaScript : variables, conditions, boucles, fonctions
- [ ] Je peux initialiser un dépôt Git, faire un commit avec message clair, et push sur GitHub
- [ ] Je sais créer une branche, y travailler, et fusionner sans conflit simple

---

## Corrigés guidés — mode tuteur (réponses attendues)

> Tu as raison : ici tu es l'étudiant. Utilise cette section pour t'auto-corriger immédiatement après avoir tenté chaque module.

### A. Corrigé — Module 1 (HTML)
1. **A** — `<header>` définit l'en-tête d'une page ou section, `<head>` est la balise de métadonnées du document
2. **B** — La hiérarchie sémantique permet aux moteurs de recherche et lecteurs d'écran de comprendre la structure
3. **B** — `<nav>` est dédié à lanavigation principale
4. **A** — `<main>` contenu exclusif à la page, `<section>` regroupe thématiquement, `<article>` est autonome (publiable seul)
5. **C** — Les attributs `href`, `src`, `alt` permettent d'identifier les ressources liées
6. **A** — `<p>` pour le paragraphe de texte
7. **B** — `<h1>` à `<h6>` (6 niveaux)
8. **C** — `<img alt="description">` est obligatoire pour l'accessibilité et le SEO
9. **B** — Les éléments sémantiques (header, nav, main, article, section, footer) décrivent le rôle du contenu
10. **B** — HTML définit la structure et le sens, CSS définit l'apparence et la mise en page
11. **A** — `<!DOCTYPE html>` déclare le type de document HTML5
12. **A` — Le texte visible est le contenu, invisible pour le navigateur/lecteur d'écran si pas sémantique
13. **B** — Un formulaire contient `<form>`, `<input>`, `<label>`, `<button>`
14. **B** — Pour la cohérence et l'accessibilité
15. **A** — Un site accessible (sémantique, alt, navigation clavier) est un site utilisable par tous

### B. Corrigé — Module 2 (CSS)
1. **B** — `margin` crée de l'espace autour de l'élément (extérieur), `padding` crée de l'espace à l'intérieur
2. **A** — Le fichier CSS externe est le plus approprié pour les styles réutilisables
3. **B** — `display: flex;` avec `justify-content: center; align-items: center;` centré verticalement et horizontalement
4. **B** — `background-color: #ff0000;`
5. **B** — `@media (max-width: 768px) { ... }` cible les écrans de 768px ou moins
6. **B** — `font-size`, `color`, `margin`, `padding`
7. **C** — `.classe { ... }` sélectionne tous les éléments ayant cette classe
8. **B** — Une classe (`.ma-classe`) est réutilisable sur plusieurs éléments, une ID (`#mon-id`) est unique par page
9. **C** — Un fichier CSS externe (approche recommandée)
10. **A** — Le sélecteur `#menu li a` cible les `<a>` qui sont enfants de `<li>` qui sont enfants de `#menu`
11. **B** — `em` et `rem` sont relatifs et s'adaptent, `px` est fixe
12. **A** — `position: relative; top: 10px; left: 20px;` déplace relativement sa position
13. **B** — `:hover` s'active au survol de la souris
14. **A** — Le cascade = règles en conflit → le navigateur choisit selon la spécificité et l'ordre d'apparition
15. **B** — Le box model = marge + bordure + padding + contenu, comprendre ses dimensions est essentiel pour le rendu

### C. Corrigé — Module 3 (JavaScript notions)
1. **B** — `let` et `const` (ES6) ont une portée de bloc, `var` a une portée de fonction et peut être redeclaré
2. **B** — `function monFonction() { ... }` déclare une fonction
3. **B** — Les commentaires `//` (une ligne) et `/* */` (plusieurs lignes) sont ignorés par l'exécution
4. **B** — `typeof` retourne le type d'une variable (string, number, boolean, object, undefined)
5. **A** — `document.getElementById('monId')` sélectionne un élément par son ID
6. **B** — `===` vérifie égalité de valeur ET de type, `==` fait une conversion implicite
7. **B** — `if (condition) { ... } else { ... }` conditionnelle, ternary `? :`, et `switch`
8. **C** — `for (let i = 0; i < 5; i++) { ... }` boucle for, `while`, `do...while`, `forEach`
9. **B** — Une fonction peut retourner une valeur avec `return`, et une fonction peut en appeler une autre
10. **C** — `[]` est un tableau (array), `{}` est un objet, `""` est une chaîne de caractères
11. **B** — Le DOM (Document Object Model) est la représentation en mémoire de la page HTML manipulable par JavaScript
12. **B** — `addEventListener('click', fonctionHandler)` attache un gestionnaire d'événement
13. **B** — `==` convertit les types (1 == '1' est true), `===` ne convertit pas (1 === '1' est false)
14. **B** — `const maListe = [1, 2, 3]; maListe.push(4);` fonctionne (l'objet est modifiable même si la référence est const)
15. **B** — `===` (strict equality) et `!==` (strict inequality) sont les opérateurs recommandés en JavaScript moderne

### D. Corrigé — Module 4 (Git/GitHub)
1. **B** — `git clone <url>` télécharge un dépôt distant
2. **B** — `git status` montre les fichiers modifiés/non suivis
3. **B** — `git add .` puis `git commit -m "message descriptif"` puis `git push`
4. **B** — `git checkout -b nom-branche` puis `git push origin nom-branche`
5. **B** — `main` est la branche protégée, les modifications passent par des branches de travail
6. **A** — `git merge branche-feature` fusionne la branche dans main
7. **B** — `git diff` montre les différences entre le travail en cours et le dernier commit
8. **B** — `git log --oneline` montre l'historique en ligne courte
9. **A** — Un message de commit clair décrit l'intention du changement : le pourquoi et le quoi
10. **B** — Un commit décrit un changement logique unique (une fonctionnalité, un fix, pas les deux en même temps)
11. **A** — `.gitignore` exclut des fichiers du suivi Git (build, node_modules, fichiers d'environnement)
12. **B** — Les conflits se résolvent en éditant le fichier marqué, en choisissant le bon contenu, puis en faisant `git add` + `git commit`
13. **A** — `git pull` récupère et fusionne les changements distants, `git fetch` les récupère sans fusionner
14. **A** — `git remote add origin <url>` et `git push -u origin main`
15. **B** — Le workflow Git standard : travailler sur une branche, commiter régulièrement, fusionner via pull request (ou merge) sur la branche principale

### E. Corrigé — Module 5 (Banque de questions)
1. **B** — `<header>` est un élément sémantique HTML5
2. **B** — `margin: 0 auto;` centre un bloc horizontalement
3. **B** — `display` contrôle l'affichage (block, inline, flex, none, etc.)
4. **A** — `const` empêche la réaffectation de la variable
5. **A** — `addEventListener` relie un événement à une fonction de rappel
6. **B** — `!==` est strict (ni valeur ni type différents)
7. **B** — `background-color: blue;` (en CSS) change la couleur de fond
8. **A** — Un commit est une sauvegarde d'un instantané du projet avec un message décrivant le changement
9. **A** — La cascade CSS résout les conflits de règles par spécificité et ordre
10. **B** — Les éléments sémantiques améliorent l'accessibilité (lecteurs d'écran) et le SEO
11. **B** — `flex-direction: column;` empile verticalement, puis `justify-content: center;` centre
12. **B** — `border-radius` arrondit les coins d'un élément
13. **B** — `hover` applique un style au survol de la souris
14. **A** — Le DOM est l'arbre de représentation du document HTML manipulable par JavaScript
15. **A** — `let` a une portée de bloc (block scope), contrairement à `var` qui a une portée de fonction

### F. Corrigé — Module 6 (Suivi P1)
1. **B** — Rappel actif (relancer régulièrement) plutôt que révision passive
2. Un poste cible est identifié → on extrait les compétences demandées dans l'offre → on cartographie ses preuves (même partielles) → on comble les écarts les plus critiques en priorité
3. **B** — La combinaison des compétences techniques + preuves + résultats est ce qui distingue un profil crédible
4. **B** — Prouver que tu as fait x avec outil → résultat mesurable → contexte d'usage
5. **C** — Le fichier source est la preuve technique (HTML/CSS/JS), le dépôt Git est la preuve de processus
6. **B** — Prouver la maîtrise, pas la connaissance théorique
7. **B** — Prouver la compétence, pas la familiarité
8. **B** — C'est l'action quotidienne la plus concrète qui transforme un portfolio de compétences en un portfolio de preuves
9. **A** — Cibler les offres réelles et extraire les compétences demandées, plutôt que se former dans le vide
10. **B** — "Compétences : développement front-end (HTML/CSS/JS), Git workflow, 3 pages statiques déployées" — précis, vérifiable, orienté résultat
11. **B** — Le pitch doit être concret, basé sur des preuves et orienté vers le résultat métier
12. **B** — Les 3 pages HTML/CSS/JS + Git = le premier livrable concret du programme, démontrable et testable
13. **B** — P1 doit démarrer dès le début (J1) pour être utile tout au long du programme
14. **B** — "J'ai intégré une page responsive avec HTML sémantique et CSS externe, versionnée avec Git et publiée localement" — c'est une preuve technique concrète
15. **A** — Chaque jour de suivi P1 ajoute une preuve, une compétence cartographiée ou une action de candidature — c'est cumulatif

---

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : Le meilleur moyen de centrer un bloc horizontalement en CSS ?  
   A. `margin: auto`  B. `text-align: center`  C. `position: center`  
2. QCM : Quelle balise définit l'en-tête principal d'une page ?  
   A. `<header>`  B. `<head>`  C. `<top>`  
3. QCM : `let` vs `var` — laquelle a la portée de bloc ?  
   A. `var`  B. `let`  C. Aucune  
4. Ouverte : Quelle est la différence entre un commentaire et une instruction en JavaScript ?  
5. Ouverte : Pourquoi utiliser un fichier CSS externe plutôt qu'en ligne ?  
6. QCM : Quel sélecteur cible tous les éléments d'une classe ?  
   A. `#classe`  B. `.classe`  C. `classe`  
7. Ouverte : Que fait l'attribut `alt` d'une image ?  
8. QCM : HTML5 signifie ?  
   A. version 5 du langage  B. HyperText Markup Language 5 (standard actuel)  C. type de fichier  
9. Ouverte : Quand utiliser `id` vs `class` en HTML ?  
10. QCM : Quel est le résultat de `null == undefined` en JavaScript ?  
    A. false  B. true  C. undefined  
11. Ouverte : Explique la différence entre pull et fetch dans Git.  
12. QCM : `@media` en CSS sert à ?  
    A. importer un fichier  B. définir des styles conditionnels selon l'écran  C. ajouter une animation  
13. Ouverte : Qu'est-ce que le DOM en JavaScript ?  
14. QCM : `flexbox` en CSS est utilisé pour ?  
    A. créer des animations  B. disposer les éléments dans un conteneur  C. styliser le texte  
15. Ouverte : Donne un exemple où tu as utilisé Git dans une situation professionnelle ou d'apprentissage.

