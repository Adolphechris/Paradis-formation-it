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
