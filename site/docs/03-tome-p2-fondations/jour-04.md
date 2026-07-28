# TOME P2 — Jour 04 (14h)

## Découpage horaire officiel (à respecter)
- Logique de programmation — **3h**
- Python (syntaxe et bases) — **6h**
- Exercices pratiques progressifs — **3h**
- Banque de questions — **1h30**
- Suivi P1 (recherche d'emploi, CV, veille) — **30 min**

---

## 1) Logique de programmation (3h)

### Objectifs d'apprentissage
- Décomposer un problème en étapes logiques exécutables.
- Utiliser conditions, boucles et fonctions dans un raisonnement algorithmique.
- Traduire un besoin métier simple en pseudo-code clair.
- Identifier les erreurs de logique avant l'écriture de code.

### Contenu pédagogique
La logique de programmation précède le langage.  
Tu dois apprendre à penser: **entrée → traitement → sortie**.

1. **Modèle IPO (Input / Process / Output)**
   - Entrée: données reçues.
   - Traitement: règles appliquées.
   - Sortie: résultat exploitable.

2. **Conditions**
   - `si / sinon` pour choisir une branche.
   - Cas multi-conditions: prioriser les règles pour éviter contradictions.

3. **Boucles**
   - Répéter une action jusqu'à condition d'arrêt.
   - Risque classique: boucle infinie.

4. **Fonctions**
   - Regrouper une logique réutilisable.
   - Une fonction = responsabilité claire + résultat prévisible.

5. **Pseudo-code**
   - Écrire lisible en français technique avant Python.
   - But: valider la logique, pas la syntaxe.

Exemple (métier support): classer un ticket selon délai
- Si délai > 48h: priorité haute.
- Sinon si délai > 24h: priorité moyenne.
- Sinon: priorité normale.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Écrire en pseudo-code un programme qui lit 2 nombres et affiche le plus grand.
   - **Corrigé détaillé** :
     - Entrées: `a`, `b`.
     - Si `a > b`, afficher `a`, sinon afficher `b`.
     - Validation: tester avec 3 jeux de données (a>b, a<b, a=b).

2. **Exercice 2 (intermédiaire)**  
   Écrire la logique d’un calcul de remise: 0% <100, 5% >=100, 10% >=500.
   - **Corrigé détaillé** :
     - Condition la plus haute testée en premier (`>=500`) pour éviter conflit.
     - Calcul final = montant - (montant * taux).
     - Validation: vérifier 99, 100, 500.

3. **Exercice 3 (avancé)**  
   Décrire l’algorithme de contrôle d’un mot de passe (longueur + chiffre + lettre).
   - **Corrigé détaillé** :
     - Vérifier longueur minimale.
     - Parcourir chaque caractère pour détecter chiffre/lettre.
     - Retourner "valide" seulement si tous critères respectés.
     - Validation: cas invalide et cas valide.

### Nouvelles abréviations rencontrées
- IPO | Input Process Output | Modèle logique entrée-traitement-sortie | Interagit avec algorithmes, fonctions, résolution de problèmes

### Banque de questions du module (15)
1. QCM : IPO signifie...  
   A. Internal Program Object B. Input Process Output C. Internet Process Option
2. QCM : Une condition sert à...  
   A. Décorer le code B. Choisir une branche logique C. Installer un paquet
3. QCM : Une boucle infinie vient souvent de...  
   A. Une condition d'arrêt absente B. Trop de commentaires C. Un nom de variable court
4. Ouverte : Pourquoi tester les cas limites d’une règle métier ?
5. Ouverte : Différence entre pseudo-code et code exécutable.
6. Mise en situation : Ton algorithme donne des résultats incohérents. Que vérifies-tu d’abord ?
7. QCM : Une fonction bien conçue a...  
   A. Plusieurs responsabilités B. Une responsabilité claire C. Aucune entrée
8. Ouverte : Donne un exemple de condition prioritaire mal ordonnée.
9. QCM : Le modèle IPO aide surtout à...  
   A. Structurer le raisonnement B. Accélérer internet C. Générer UI
10. Mise en situation : Comment expliquer un algorithme à un recruteur non développeur ?
11. Ouverte : Pourquoi séparer logique et syntaxe au début ?
12. QCM : Une sortie exploitable doit être...  
    A. Ambiguë B. Claire et vérifiable C. Cachée
13. Mise en situation : Tu dois classer 200 tickets automatiquement, quelle logique de base poses-tu ?
14. Ouverte : Donne une mini-checklist de validation logique avant coder.
15. QCM : Objectif principal de ce bloc ?  
    A. Mémoriser Python B. Penser en algorithmes C. Installer Linux

---

## 2) Python — syntaxe et bases (6h)

### Objectifs d'apprentissage
- Écrire un script Python correct avec variables, types, conditions et boucles.
- Manipuler les structures de base (`list`, `dict`, `tuple`, `set`).
- Créer des fonctions simples réutilisables.
- Gérer des erreurs simples d'exécution avec une approche propre.

### Contenu pédagogique
Python est le langage de départ P2 car lisible et productif.

1. **Base syntaxique**
   - Indentation obligatoire.
   - Variables dynamiques mais nommage explicite.
   - Types: `int`, `float`, `str`, `bool`.

2. **Entrées/sorties**
   - `input()`, `print()`, conversion (`int()`, `float()`).
   - Attention aux types lors des comparaisons.

3. **Contrôle du flux**
   - `if / elif / else`.
   - `for` et `while`.
   - `break` / `continue` avec parcimonie.

4. **Structures de données**
   - `list`: ordonnée, mutable.
   - `dict`: clé-valeur.
   - `tuple`: immuable.
   - `set`: valeurs uniques.

5. **Fonctions**
   - `def`, paramètres, `return`.
   - Documentation minimale (docstring courte).

6. **Erreurs et robustesse**
   - `try/except` ciblé sur erreurs attendues.
   - Ne pas masquer une erreur sans diagnostic.

7. **Pratiques de qualité**
   - Style cohérent (PEP 8).
   - Test manuel rapide après chaque bloc logique.
   - Exécution interactive via REPL pour vérifier vite un comportement.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Écrire un script qui lit un prénom et affiche "Bonjour, <prénom>".
   - **Corrigé détaillé** :
     - Utiliser `input()` pour lire.
     - Construire message via f-string.
     - Validation: tester entrée vide et normale.

2. **Exercice 2 (intermédiaire)**  
   Écrire un script qui calcule la moyenne de 5 notes et affiche mention.
   - **Corrigé détaillé** :
     - Stocker notes dans une liste.
     - Calculer moyenne puis appliquer conditions mention.
     - Validation: jeux de tests (échec, passable, bien).

3. **Exercice 3 (avancé)**  
   Créer une fonction `classer_ticket(delai_heures)` qui retourne priorité.
   - **Corrigé détaillé** :
     - `def classer_ticket(delai_heures): ...`
     - Règles cohérentes et ordonnées.
     - Ajouter boucle de test sur plusieurs valeurs.
     - Validation: résultats attendus pour 12h, 30h, 60h.

### Nouvelles abréviations rencontrées
- REPL | Read Eval Print Loop | Console interactive d'exécution immédiate | Interagit avec apprentissage Python, tests rapides, debug
- PEP 8 | Python Enhancement Proposal 8 | Convention officielle de style Python | Interagit avec lisibilité, maintenabilité, revue de code

### Banque de questions du module (15)
1. QCM : En Python, l'indentation est...  
   A. Optionnelle B. Obligatoire C. Décorative
2. QCM : `dict` stocke...  
   A. Index fixes B. Clés/valeurs C. Processus
3. QCM : REPL sert à...  
   A. Déployer cloud B. Tester rapidement du code C. Gérer tickets
4. QCM : PEP 8 concerne...  
   A. Réseau B. Style du code C. Sécurité OS
5. Ouverte : Différence `list` vs `tuple`.
6. Ouverte : Pourquoi convertir `input()` en nombre dans certains cas ?
7. Mise en situation : Un script compare "10" et 10. Problème ?
8. QCM : `return` dans une fonction sert à...  
   A. Stopper PC B. Renvoyer un résultat C. Créer une boucle
9. Ouverte : Quand utiliser `try/except` ?
10. Mise en situation : Tu dois traiter 100 lignes, `for` ou `if` seul ?
11. QCM : Un `set` est utile pour...  
    A. Garder doublons B. Unicité C. Ordre strict
12. Ouverte : Donne une bonne règle de nommage variable.
13. Mise en situation : Le code marche mais est illisible. Qu’améliorer d’abord ?
14. QCM : Objectif principal d'une docstring ?  
    A. Décorer B. Expliquer usage C. Accélérer CPU
15. Ouverte : Pourquoi Python est un bon choix de départ pour P2 ?

---

## 3) Exercices pratiques progressifs (3h)

### Objectifs d'apprentissage
- Consolider la logique + Python sur des cas proches du terrain.
- Produire de petits scripts complets et testables.
- Documenter rapidement les hypothèses et limites.

### Contenu pédagogique
Ce bloc convertit théorie en exécution.

Méthode de séance:
1. Lire l'énoncé et reformuler.
2. Écrire pseudo-code.
3. Coder une version minimale.
4. Tester cas normaux + cas limites.
5. Corriger et documenter.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Script "convertisseur de températures" (Celsius ↔ Fahrenheit).
   - **Corrigé détaillé** :
     - Demander mode conversion.
     - Appliquer formule correcte.
     - Validation: tester 0°C, 100°C, 32°F.

2. **Exercice 2 (intermédiaire)**  
   Script "gestion mini tickets" (ajouter ticket, lister tickets, compter tickets ouverts).
   - **Corrigé détaillé** :
     - Stockage en liste de dictionnaires.
     - Menu simple en boucle.
     - Validation: ajout + affichage + comptage cohérents.

3. **Exercice 3 (avancé)**  
   Script "contrôle d’accès" (3 tentatives mot de passe max + verrouillage logique).
   - **Corrigé détaillé** :
     - Boucle avec compteur tentatives.
     - Condition succès/échec claire.
     - Message de verrouillage après 3 échecs.
     - Validation: tester succès avant 3, succès à 3, échec total.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : Première étape avant coder un exercice ?  
   A. Push Git B. Reformuler + pseudo-code C. Changer langage
2. QCM : Un test de cas limite sert à...  
   A. Perdre du temps B. Trouver erreurs cachées C. Décorer le script
3. Ouverte : Pourquoi construire d’abord une version minimale ?
4. QCM : Une boucle de menu est utile pour...  
   A. Répéter interactions utilisateur B. Styliser HTML C. Gérer DNS
5. Mise en situation : Ton script fonctionne sur un cas mais casse sur un autre. Action ?
6. Ouverte : Différence entre erreur de logique et erreur de syntaxe.
7. QCM : Un script testable doit avoir...  
   A. Cas de validation B. Seulement du code C. Aucun message
8. Ouverte : Comment documenter rapidement les limites d’un script ?
9. Mise en situation : Quel exercice est plus proche d’un poste support ?
10. QCM : Dans "mini tickets", structure adaptée ?  
    A. Liste de dicts B. Image PNG C. Tuple unique
11. Ouverte : Pourquoi limiter les tentatives de mot de passe ?
12. QCM : Le feedback utilisateur doit être...  
    A. Ambigu B. Clair C. Absent
13. Mise en situation : Tu manques de temps, que livre-tu d’abord ?
14. Ouverte : Comment transformer exercice en preuve portfolio ?
15. QCM : Critère d’un bon script débutant ?  
    A. Complexe B. Fonctionnel, lisible, testé C. Très long

---

## 4) Banque de questions (1h30)

### Objectifs d'apprentissage
- Vérifier la compréhension logique et Python de J4.
- S’entraîner au format test technique chronométré.
- Établir un plan de remédiation J5.

### Contenu pédagogique
Format conseillé:
1. 45 min test mixte (QCM + ouvertes + cas).
2. 30 min correction argumentée.
3. 15 min plan de correction.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Composer un test de 15 questions réparties logique/Python.
   - **Corrigé détaillé** :
     - 7 questions logique, 8 Python.
     - Difficulté progressive.
     - Validation: couverture cohérente avec J4.

2. **Exercice 2 (intermédiaire)**  
   Corriger et classer erreurs (concept, méthode, attention, pression).
   - **Corrigé détaillé** :
     - Chaque erreur classée une seule fois.
     - Action corrective associée.
     - Validation: plan actionnable sous 24h.

3. **Exercice 3 (avancé)**  
   Simuler réponse orale de 2 min sur une erreur importante.
   - **Corrigé détaillé** :
     - Expliquer cause, correction, prévention.
     - Ton clair et factuel.
     - Validation: réponse crédible en contexte entretien.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : Objectif principal de la banque J4 ?  
   A. Noter seulement B. Mesurer et corriger C. Remplacer pratique
2. Ouverte : Pourquoi chronométrer les évaluations ?
3. QCM : Une erreur "concept" demande...  
   A. Relecture seule B. Revoir base théorique + exercice C. Ignorer
4. Mise en situation : Score faible Python, score bon logique. Priorité ?
5. Ouverte : Comment suivre progrès entre deux sessions ?
6. QCM : Une correction utile contient...  
   A. Réponse brute B. Raisonnement C. Aucune explication
7. Ouverte : Donne un exemple de plan remédiation 24h.
8. QCM : En entretien technique, le recruteur attend...  
   A. Bluff B. Explication structurée C. Silence
9. Mise en situation : Tu bloques sur boucles, que fais-tu ce soir ?
10. Ouverte : Différence entre mémoriser et comprendre.
11. QCM : Test progressif signifie...  
    A. Niveau aléatoire B. Du simple vers complexe C. Que du difficile
12. Ouverte : Pourquoi corriger le jour même ?
13. Mise en situation : Tu refais la même erreur 3 fois. Réaction ?
14. QCM : Une preuve de progression est...  
    A. Impression B. Score + script corrigé C. Promesse
15. Ouverte : Quel lien entre banque questions et réussite test poste cible ?

---

## 5) Suivi P1 (30 min) — recherche d'emploi, CV, veille

### Objectifs d'apprentissage
- Ajouter les preuves J4 (logique + Python) au profil candidature.
- Extraire les attentes "Python débutant/junior" des offres ciblées.
- Définir 1 axe d'amélioration prioritaire avant J5.

### Contenu pédagogique
Routine P1 J4:
1. 10 min: mise à jour CV/profil avec 1 preuve script.
2. 10 min: analyse 3 offres ciblées (support/data/dev junior).
3. 10 min: adaptation du plan J5 aux écarts identifiés.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Ajouter une puce CV: script Python fonctionnel lié à besoin concret.
   - **Corrigé détaillé** :
     - Formulation action + outil + résultat.
     - Exemple factuel, pas d’exagération.
     - Validation: lisible en moins de 10 secondes.

2. **Exercice 2 (intermédiaire)**  
   Lister 5 attentes récurrentes vues dans 3 offres junior Python.
   - **Corrigé détaillé** :
     - Fusionner doublons.
     - Classer par fréquence.
     - Validation: top 3 priorités clair.

3. **Exercice 3 (avancé)**  
   Rédiger réponse courte: "Pourquoi Python dans votre progression ?"
   - **Corrigé détaillé** :
     - Lier Python à problèmes concrets et productivité.
     - Citer une preuve J4.
     - Validation: réponse crédible, structurée.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : But du suivi P1 après J4 ?  
   A. Attendre fin P2 B. Aligner preuves et marché C. Supprimer CV
2. Ouverte : Quelle preuve Python est convaincante pour un recruteur junior ?
3. QCM : Une puce CV efficace contient...  
   A. Vague B. Action + outil + résultat C. Emoji
4. Mise en situation : Offre exige Python + Git. Tu n’as qu’un script local, que faire ?
5. Ouverte : Pourquoi relier chaque compétence à un livrable ?
6. QCM : Analyse d'offres sert à...  
   A. Copier B. Prioriser apprentissage C. Ignorer écarts
7. Ouverte : Comment éviter de survendre ton niveau ?
8. QCM : La priorité J5 doit suivre...  
   A. Ton humeur B. Les lacunes critiques C. Le hasard
9. Mise en situation : Tu as 0 retour candidature, 1er ajustement ?
10. Ouverte : Exemple de micro-pitch après J4.
11. QCM : Un profil crédible montre...  
    A. Titres seuls B. Preuves techniques C. Promesses
12. Ouverte : Quel lien entre veille et confiance en entretien ?
13. Mise en situation : Comment présenter une faiblesse sans te disqualifier ?
14. QCM : L’objectif P1 quotidien est...  
    A. Théorique B. Conversion progressive vers emploi C. Administratif
15. Ouverte : Quelle action P1 lancer avant J5 matin ?

---

## Validation qualité J4 (anti-superficiel)

### Livrables obligatoires fin de J4
1. Un script Python exécutable avec conditions + boucle + fonction.  
2. Une version pseudo-code du script (logique lisible).  
3. Un mini journal de tests (au moins 6 cas: 3 nominaux + 3 limites).  
4. Un correctif appliqué sur un bug rencontré + explication cause/résolution.

### Grille d'évaluation rapide (100 points)
- Logique correcte (conditions, ordre des règles, cas limites): **30 pts**
- Qualité Python (lisibilité, fonctions, types, structure): **30 pts**
- Qualité des tests (variété, preuves, cohérence): **25 pts**
- Communication technique (explication claire à l'oral/écrit): **15 pts**

### Seuil attendu
- **>= 70/100** : acquis opérationnel J4 (passage J5 normal).  
- **50-69/100** : passage J5 avec remédiation ciblée.  
- **< 50/100** : renforcement J4 obligatoire avant montée de charge.

---

## Corrigés guidés — mode tuteur (réponses attendues)

> Tu as raison: ici tu es l'étudiant, donc chaque question doit avoir une réponse attendue.
> Utilise cette section pour t'auto-corriger immédiatement.

### A. Corrigé — Module 1 (Logique de programmation)
1. **B**  
2. **B**  
3. **A**  
4. Vérifier les seuils (ex: 99/100/500) évite bugs de frontière.  
5. Pseudo-code = logique lisible; code exécutable = syntaxe d'un langage précis.  
6. Vérifier d'abord entrées, ordre des conditions, cas limites.  
7. **B**  
8. Exemple mauvais ordre: tester `>=100` avant `>=500` bloque la règle 10%.  
9. **A**  
10. Expliquer entrée, règles, sortie, puis donner un exemple concret métier.  
11. Pour corriger la logique avant de perdre du temps sur la syntaxe.  
12. **B**  
13. Règles de priorité explicites + seuils + tri des cas urgents d'abord.  
14. Checklist: entrées valides, conditions ordonnées, arrêt des boucles, cas limites testés.  
15. **B**

### B. Corrigé — Module 2 (Python bases)
1. **B**  
2. **B**  
3. **B**  
4. **B**  
5. `list` modifiable; `tuple` non modifiable.  
6. `input()` renvoie du texte, il faut convertir pour calculer/comparer des nombres.  
7. `"10"` (texte) et `10` (nombre) n'ont pas le même type: conversion nécessaire.  
8. **B**  
9. Quand une erreur est prévisible (ex: conversion `int` invalide).  
10. `for`, car il faut répéter le traitement ligne par ligne.  
11. **B**  
12. Nom explicite: `delai_heures` plutôt que `x`.  
13. Améliorer noms, découpage en fonctions, et clarté des conditions.  
14. **B**  
15. Python est lisible, rapide à apprendre et utile dans plusieurs métiers.

### C. Corrigé — Module 3 (Exercices progressifs)
1. **B**  
2. **B**  
3. Pour livrer vite une base fonctionnelle puis itérer sans blocage.  
4. **A**  
5. Reproduire bug, isoler la condition fautive, tester cas limite, corriger.  
6. Logique = raisonnement faux; syntaxe = règle d'écriture du langage violée.  
7. **A**  
8. Écrire hypothèses, limites connues, cas non gérés, prochain correctif prévu.  
9. Le mini système de tickets (proche support/helpdesk).  
10. **A**  
11. Sécurité: réduire brute-force et contrôler accès.  
12. **B**  
13. Livrer version minimale stable + message clair sur limites.  
14. Ajouter code propre + captures test + courte explication résultat.  
15. **B**

### D. Corrigé — Module 4 (Banque de questions)
1. **B**  
2. Simuler contraintes réelles d'entretien/test et améliorer vitesse + précision.  
3. **B**  
4. Priorité: renforcer Python (exercices ciblés), maintenir logique en révision légère.  
5. Suivre score, type d'erreur, temps par question, et taux de correction.  
6. **B**  
7. Exemple: 2h théorie boucles + 2 scripts + mini test 20 min + correction.  
8. **B**  
9. Refaire 3 exercices guidés sur boucles + 1 exercice chronométré court.  
10. Mémoriser = réciter; comprendre = expliquer et réappliquer en contexte nouveau.  
11. **B**  
12. Pour ancrer l'erreur tant que le contexte mental est frais.  
13. Changer méthode: revoir base + varier exercices + demander feedback ciblé.  
14. **B**  
15. La banque entraîne exactement les formats attendus en test d'embauche.

### E. Corrigé — Module 5 (Suivi P1)
1. **B**  
2. Une preuve concrète: script utile + résultat mesurable + contexte d'usage.  
3. **B**  
4. Mettre le script sur Git, documenter en 5 lignes, lier au CV/portfolio.  
5. Parce qu'un recruteur évalue des preuves, pas des déclarations.  
6. **B**  
7. Décrire ton niveau réel + ce que tu as déjà fait + ton plan d'amélioration.  
8. **B**  
9. Revoir CV ciblage, adapter candidatures, ajouter 1 preuve projet mieux expliquée.  
10. "Je développe des scripts Python simples pour automatiser des tâches support."  
11. **B**  
12. La veille améliore vocabulaire, confiance et pertinence des réponses.  
13. Formuler la faiblesse + action en cours + progrès observable.  
14. **B**  
15. Finaliser un script propre, le publier, et préparer 3 phrases de présentation.
