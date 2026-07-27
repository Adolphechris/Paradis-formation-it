# TOME P2 — Jour 06 (14h)

## Découpage horaire opérationnel J6
- Structures de données en Python — **6h**
- Complexité pratique (coût temps/mémoire) — **3h**
- Exercices Python progressifs — **3h**
- Banque de questions — **1h30**
- Suivi P1 (recherche d'emploi, CV, veille) — **30 min**

---

## 1) Structures de données en Python (6h)

### Objectifs d'apprentissage
- Choisir la structure adaptée selon le besoin (liste, dictionnaire, set, tuple, file, pile).
- Manipuler efficacement ces structures en Python.
- Éviter les erreurs fréquentes (doublons, recherche lente, mutation non voulue).
- Justifier ton choix de structure à l'oral en contexte entretien.

### Contenu pédagogique
Une structure de données est un moyen d'organiser l'information pour la traiter vite et proprement.

1. **List (`list`)**
   - Ordonnée, modifiable.
   - Bonne pour parcours séquentiel.
   - Plus lente pour recherches fréquentes sur grands volumes.

2. **Dictionnaire (`dict`)**
   - Clé → valeur.
   - Très efficace pour accès direct par clé.
   - Idéal pour indexer des tickets par identifiant.

3. **Ensemble (`set`)**
   - Éléments uniques.
   - Excellent pour supprimer doublons et tester appartenance.

4. **Tuple (`tuple`)**
   - Ordonné, non modifiable.
   - Utile pour données stables (ex: coordonnées, constantes).

5. **Pile et file**
   - Pile (LIFO): dernier entré, premier sorti.
   - File (FIFO): premier entré, premier sorti.
   - Cas métier: file d'attente support, historique actions.

6. **Règles de choix rapide**
   - Accès par clé: `dict`.
   - Unicité: `set`.
   - Ordre + modifications: `list`.
   - Immuable: `tuple`.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   À partir d'une liste de 20 emails (avec doublons), produire la liste unique.
   - **Corrigé détaillé** :
     - Convertir en `set` pour unicité.
     - Reconvertir en `list` si besoin d'affichage.
     - Tester avec liste déjà unique.

2. **Exercice 2 (intermédiaire)**  
   Construire un `dict` de tickets (`id` → `statut`) et afficher le statut d'un `id` donné.
   - **Corrigé détaillé** :
     - Créer le dictionnaire.
     - Lire l'id demandé.
     - Utiliser `dict.get()` avec message si absent.

3. **Exercice 3 (avancé)**  
   Simuler une file FIFO de tickets urgents et traiter les 5 premiers.
   - **Corrigé détaillé** :
     - Utiliser `collections.deque`.
     - Ajouter tickets avec `append`.
     - Traiter avec `popleft`.
     - Vérifier ordre de sortie.

### Nouvelles abréviations rencontrées
- FIFO | First In First Out | Modèle file d'attente (premier entré, premier sorti) | Interagit avec scheduling, support, traitement de tickets
- LIFO | Last In First Out | Modèle pile (dernier entré, premier sorti) | Interagit avec historique, backtracking, pile d'appels

### Banque de questions du module (15)
1. QCM : Structure la plus adaptée pour clé→valeur ?  
   A. list B. dict C. tuple
2. QCM : Un `set` garantit...  
   A. Ordre stable B. Unicité C. Paires clé-valeur
3. QCM : FIFO signifie...  
   A. Dernier sorti d'abord B. Premier sorti d'abord C. Tri alphabétique
4. QCM : LIFO correspond à...  
   A. File B. Pile C. Tableau SQL
5. Ouverte : Quand choisir `tuple` plutôt que `list` ?
6. Ouverte : Pourquoi `dict.get()` est plus sûr qu'un accès direct parfois ?
7. Mise en situation : Tu dois retrouver vite un ticket par `id`. Quel choix ?
8. QCM : Pour retirer doublons d'une liste:  
   A. tuple B. set C. dict seulement
9. Ouverte : Donne un exemple métier de FIFO.
10. Mise en situation : Une recherche devient lente sur 10 000 éléments, que modifies-tu ?
11. QCM : `deque.popleft()` retire...  
    A. À droite B. À gauche C. Au hasard
12. Ouverte : Risque principal d'une mauvaise structure choisie.
13. Mise en situation : Tu dois vérifier appartenance d'un élément très souvent.
14. QCM : Quelle structure est immuable ?  
    A. dict B. list C. tuple
15. Ouverte : Comment expliquer ton choix de structure à un recruteur ?

---

## 2) Complexité pratique (3h)

### Objectifs d'apprentissage
- Comprendre la notation Big-O de manière opérationnelle.
- Comparer deux solutions et choisir la plus scalable.
- Identifier les opérations coûteuses dans un script Python.

### Contenu pédagogique
La complexité mesure le coût d'un algorithme quand la taille des données augmente.

1. **Notations de base**
   - O(1): temps constant.
   - O(n): proportionnel à la taille.
   - O(n²): double boucle typique.
   - O(log n): recherche dichotomique.

2. **Exemples concrets**
   - Recherche dans `list`: souvent O(n).
   - Recherche par clé dans `dict`: souvent proche O(1).
   - Boucles imbriquées: risque O(n²).

3. **Complexité mémoire**
   - Copier des structures augmente le coût mémoire.
   - Éviter les duplications inutiles.

4. **Réflexe terrain**
   - D'abord code correct.
   - Ensuite identifier le goulot d'étranglement.
   - Optimiser ce point, pas tout le script.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Classer ces opérations: accès `dict`, parcours `list`, double boucle.
   - **Corrigé détaillé** :
     - `dict` clé: O(1) (cas moyen).
     - Parcours liste: O(n).
     - Double boucle: O(n²).

2. **Exercice 2 (intermédiaire)**  
   Remplacer une recherche répétée en liste par un index dictionnaire.
   - **Corrigé détaillé** :
     - Créer `dict_index[id] = ticket`.
     - Remplacer boucle par accès direct.
     - Vérifier gain sur dataset plus grand.

3. **Exercice 3 (avancé)**  
   Expliquer pourquoi une solution O(n²) devient critique à grande échelle.
   - **Corrigé détaillé** :
     - Quantifier l'explosion du nombre d'opérations.
     - Comparer avec O(n) sur 1k, 10k, 100k.
     - Conclure impact performance/coût.

### Nouvelles abréviations rencontrées
- BIG-O | Big O Notation | Mesure de croissance du coût algorithmique | Interagit avec structures de données, performance, scalabilité

### Banque de questions du module (15)
1. QCM : O(1) signifie...  
   A. Constant B. Linéaire C. Quadratique
2. QCM : Double boucle simple implique souvent...  
   A. O(log n) B. O(n²) C. O(1)
3. QCM : Recherche par clé dans `dict` est généralement...  
   A. O(1) B. O(n²) C. O(n!)
4. Ouverte : Pourquoi Big-O est utile en entretien ?
5. Ouverte : Différence coût temps vs coût mémoire.
6. Mise en situation : Ton script passe de 100 à 100 000 lignes et ralentit fortement. Première analyse ?
7. QCM : O(n) signifie...  
   A. Croissance proportionnelle B. Constante C. Aléatoire
8. Ouverte : Pourquoi on optimise après avoir une version correcte ?
9. Mise en situation : Deux scripts donnent le même résultat, lequel choisir ?
10. QCM : O(log n) est typique de...  
    A. Recherche dichotomique B. Triple boucle C. Impression console
11. Ouverte : Quel risque d'optimiser trop tôt ?
12. Mise en situation : Tu as un O(n²), comment le réduire souvent ?
13. QCM : L'algorithme le plus scalable est en général...  
    A. Croissance la plus faible B. Plus long C. Plus compliqué
14. Ouverte : Donne un exemple de compromis lisibilité/performance.
15. QCM : But principal de ce bloc ?  
    A. Complexifier le code B. Choisir mieux C. Éviter Python

---

## 3) Exercices Python progressifs (3h)

### Objectifs d'apprentissage
- Appliquer structures + complexité sur des cas réels.
- Produire du code plus rapide sans perdre la lisibilité.
- Documenter les choix techniques.

### Contenu pédagogique
Méthode:
1. Énoncé.
2. Choix structure.
3. Implémentation.
4. Test.
5. Explication du choix.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Compter la fréquence de mots dans un texte court.
   - **Corrigé détaillé** :
     - Utiliser `dict` compteur.
     - Normaliser casse (`lower()`).
     - Vérifier mot absent et mot répété.

2. **Exercice 2 (intermédiaire)**  
   Détecter les IDs en doublon dans une liste de tickets.
   - **Corrigé détaillé** :
     - Utiliser deux `set` (vus / doublons).
     - Ajouter aux doublons quand déjà vu.
     - Retourner liste finale des doublons.

3. **Exercice 3 (avancé)**  
   Comparer deux méthodes de recherche d'un ticket (`list` vs `dict`) et conclure.
   - **Corrigé détaillé** :
     - Implémenter les deux approches.
     - Tester sur petit puis grand volume.
     - Conclure quand l'index `dict` devient nécessaire.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : Pour compter fréquences, structure idéale ?  
   A. dict B. tuple C. float
2. QCM : Pour détecter doublons rapidement:  
   A. set B. list triée C. print
3. Ouverte : Pourquoi normaliser `lower()` avant comptage ?
4. Mise en situation : Tu dois expliquer un choix `dict` vs `list` en entretien.
5. QCM : Deux `set` (vus/doublons) servent à...  
   A. Styliser sortie B. Détection efficace C. Réseau
6. Ouverte : Quel test minimum pour valider un compteur de mots ?
7. QCM : Une comparaison utile de méthodes exige...  
   A. Même données B. Données différentes aléatoires C. Aucun test
8. Mise en situation : Résultat correct mais code illisible, priorité ?
9. Ouverte : Comment documenter un choix de structure dans ton portfolio ?
10. QCM : Accès par clé sur `dict` est souvent...  
    A. Plus direct B. Plus long C. Impossible
11. Ouverte : Quand une `list` reste un bon choix malgré tout ?
12. Mise en situation : Tu dois traiter flux en ordre d'arrivée, quelle structure ?
13. QCM : Détection doublons naïve en double boucle coûte souvent...  
    A. O(1) B. O(n²) C. O(log n)
14. Ouverte : Pourquoi garder le code lisible même quand on optimise ?
15. QCM : Objectif final du bloc ?  
    A. Faire compliqué B. Faire juste + efficace C. Réduire les tests

---

## 4) Banque de questions (1h30)

### Objectifs d'apprentissage
- Vérifier la maîtrise réelle de J6.
- Préparer les formats test d'embauche.
- Identifier plan de remédiation J7.

### Contenu pédagogique
Format:
1. 45 min questions mixtes.
2. 30 min correction argumentée.
3. 15 min plan d'amélioration.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Composer un test de 20 questions couvrant structures + complexité.
   - **Corrigé détaillé** :
     - Répartition équilibrée.
     - Niveaux progressifs.
     - Alignement strict avec J6.

2. **Exercice 2 (intermédiaire)**  
   Analyser 10 erreurs et les classer (concept, méthode, attention, temps).
   - **Corrigé détaillé** :
     - Une cause principale par erreur.
     - Une action corrective mesurable.
     - Plan réaliste sous 24h.

3. **Exercice 3 (avancé)**  
   Simuler oral: "Pourquoi votre solution est plus scalable ?"
   - **Corrigé détaillé** :
     - Expliquer structure choisie.
     - Expliquer coût attendu.
     - Donner un exemple chiffré simple.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : But banque J6 ?  
   A. Noter seulement B. Mesurer et corriger C. Remplacer pratique
2. QCM : Une erreur "méthode" demande surtout...  
   A. Plus de théorie seule B. Changer process de résolution C. Ignorer
3. Ouverte : Pourquoi corriger immédiatement après épreuve ?
4. Mise en situation : Bon QCM, faible mise en situation. Lecture ?
5. QCM : "Scalable" signifie...  
   A. Plus lent quand données montent B. Tient la montée en charge C. Style visuel
6. Ouverte : Quel indicateur suivre jusqu'à J7 ?
7. QCM : Une correction utile contient...  
   A. Réponse seule B. Raisonnement + action C. Copie brute
8. Mise en situation : Tu expliques mal Big-O à l'oral, quoi faire ce soir ?
9. Ouverte : Différence entre savoir répondre et savoir justifier.
10. QCM : Plan remédiation efficace =  
    A. Vague B. Mesurable C. Repoussé
11. Ouverte : Exemple de phrase pro pour défendre un `dict`.
12. Mise en situation : Tu bloques toujours sur complexité, prochain exercice ?
13. QCM : Un progrès crédible est...  
    A. Intuition B. Score + script + explication C. Silence
14. Ouverte : Pourquoi limiter les priorités à 2-3 axes ?
15. QCM : Résultat attendu fin bloc ?  
    A. Stress B. Capacité démontrable C. Théorie passive

---

## 5) Suivi P1 (30 min)

### Objectifs d'apprentissage
- Transformer les acquis J6 en preuve marché.
- Adapter CV/portfolio avec argument "performance + structure".
- Cibler les attentes des offres junior Python/Data/Support.

### Contenu pédagogique
Routine:
1. Mettre à jour portfolio avec un exercice J6 commenté.
2. Ajouter une ligne CV orientée impact.
3. Vérifier 3 offres et aligner le plan J7.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Rédiger une phrase CV sur optimisation d'une recherche en Python.
   - **Corrigé détaillé** :
     - Action + contexte + résultat.
     - Formulation factuelle.
     - Vérification lisibilité rapide.

2. **Exercice 2 (intermédiaire)**  
   Écrire un pitch 60 secondes: "Pourquoi votre solution est robuste ?"
   - **Corrigé détaillé** :
     - Problème, structure choisie, bénéfice.
     - Mention d'un test limite.
     - Chronométrage 60 secondes.

3. **Exercice 3 (avancé)**  
   Définir 3 priorités J7 mesurables.
   - **Corrigé détaillé** :
     - Priorité technique principale.
     - Priorité performance/scalabilité.
     - Priorité communication entretien.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : But P1 ici ?  
   A. Reporter plus tard B. Rendre acquis visibles C. Ignorer marché
2. Ouverte : Pourquoi un recruteur valorise une optimisation justifiée ?
3. QCM : Une ligne CV crédible contient...  
   A. Vagues promesses B. Faits vérifiables C. Buzzwords
4. Mise en situation : Tu as amélioré performance mais pas de preuve. Que faire ?
5. Ouverte : Comment parler de scalabilité sans jargon excessif ?
6. QCM : Pitch efficace en 60s =  
   A. Détails infinis B. Problème→solution→résultat C. Historique personnel
7. Ouverte : Quelle preuve joindre dans le portfolio ?
8. QCM : Priorités J7 doivent être...  
   A. Mesurables B. Floues C. Copiées
9. Mise en situation : Offre insiste sur SQL demain, comment ajuster ce soir ?
10. Ouverte : Exemple de micro-indicateur de progression.
11. QCM : Preuve technique convaincante =  
    A. Capture seule B. Code + test + explication C. Titre projet
12. Ouverte : Pourquoi aligner ton discours au poste ciblé ?
13. Mise en situation : Tu paniques en entretien, routine anti-blocage ?
14. QCM : Résultat P1 réussi =  
    A. CV inchangé B. CV/portfolio mis à jour C. Rien publié
15. Ouverte : Quelle action exacte lancer avant J7 matin ?

---

## Validation qualité J6 (anti-superficiel)

### Livrables obligatoires fin de J6
1. Un script Python montrant au moins 3 structures (`list`, `dict`, `set` ou `deque`).  
2. Une comparaison explicite de deux approches (au moins `list` vs `dict`).  
3. Un journal de tests (8 cas minimum dont 3 limites).  
4. Une explication écrite (10 lignes max) du choix de structure et de complexité.  
5. Un pitch oral 60 secondes prêt à l'emploi.

### Grille d'évaluation rapide (100 points)
- Choix des structures (pertinence métier): **30 pts**
- Qualité implémentation Python (lisibilité, modularité): **25 pts**
- Analyse complexité (justesse + explication): **20 pts**
- Qualité des tests (variété + cohérence): **15 pts**
- Communication technique (écrit/oral): **10 pts**

### Seuil attendu
- **>= 75/100** : J6 validé (progression normale vers J7 SQL).  
- **60-74/100** : validé sous remédiation ciblée.  
- **< 60/100** : consolidation J6 requise avant montée en charge.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Structures de données)
1. **B**  
2. **B**  
3. **B**  
4. **B**  
5. Quand la donnée ne doit pas être modifiée (stabilité).  
6. `get()` évite exception si clé absente et permet valeur par défaut.  
7. `dict` indexé par `id`.  
8. **B**  
9. File d'attente des tickets entrants au support.  
10. Remplacer recherche séquentielle par index `dict` ou `set` selon besoin.  
11. **B**  
12. Temps de traitement trop élevé et code moins scalable.  
13. Utiliser `set` pour tests d'appartenance fréquents.  
14. **C**  
15. En liant besoin métier, structure choisie, et coût attendu.

### B. Corrigé — Module 2 (Complexité pratique)
1. **A**  
2. **B**  
3. **A**  
4. Pour justifier des choix techniques avec impact performance.  
5. Temps = durée d'exécution; mémoire = espace consommé.  
6. Mesurer où ça ralentit (recherche, boucles imbriquées, copies).  
7. **A**  
8. Pour éviter d'optimiser une logique encore fausse.  
9. Choisir la plus scalable et maintenable à résultat égal.  
10. **A**  
11. Complexité inutile, bugs, perte de temps.  
12. Remplacer double boucles par indexation (`dict`, `set`) quand possible.  
13. **A**  
14. Ex: solution légèrement moins rapide mais beaucoup plus lisible et testable.  
15. **B**

### C. Corrigé — Module 3 (Exercices Python)
1. **A**  
2. **A**  
3. Pour éviter "Python" et "python" comptés différemment.  
4. Expliquer besoin, alternatives, coût, puis décision finale.  
5. **B**  
6. Cas texte vide, ponctuation, mots répétés, casse mixte.  
7. **A**  
8. Refactoriser noms/fonctions, puis retester sans changer résultat.  
9. Ajouter une note "Choix technique" avec justification simple.  
10. **A**  
11. Quand parcours simple, ordre important et faible volume.  
12. FIFO (file), par ex. `deque`.  
13. **B**  
14. Maintenabilité et transmission à l'équipe.  
15. **B**

### D. Corrigé — Module 4 (Banque J6)
1. **B**  
2. **B**  
3. Parce que la mémoire de l'erreur est fraîche et actionnable.  
4. Théorie OK, transfert opérationnel encore insuffisant.  
5. **B**  
6. Taux de réussite sur cas pratiques chronométrés + qualité d'explication orale.  
7. **B**  
8. Préparer une explication simple avec 3 exemples concrets.  
9. Répondre = résultat; justifier = raisonnement défendable en contexte pro.  
10. **B**  
11. "J'utilise un `dict` pour accéder à un ticket en temps quasi constant."  
12. Refaire 2 comparaisons list/dict sur volumes différents.  
13. **B**  
14. Pour concentrer l'effort sur l'impact maximal.  
15. **B**

### E. Corrigé — Module 5 (Suivi P1)
1. **B**  
2. Parce qu'il peut relier ton choix à un gain concret.  
3. **B**  
4. Ajouter benchmark simple + test + explication dans portfolio.  
5. Expliquer "ça tient mieux quand le volume augmente" avec un exemple.  
6. **B**  
7. Un script comparatif + résultats + court commentaire d'interprétation.  
8. **A**  
9. Réserver un créneau SQL de préchauffe (bases requêtes) avant J7.  
10. Ex: "temps de résolution d'exercice -20% avec précision stable".  
11. **B**  
12. Pour montrer ta pertinence sur le poste visé.  
13. Respiration courte + plan 3 points + exemple concret.  
14. **B**  
15. Publier preuve J6 et préparer le starter SQL de J7.
