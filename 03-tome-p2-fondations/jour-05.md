# TOME P2 — Jour 05 (14h)

## Découpage horaire opérationnel J5
- Python appliqué (fichiers, modules, POO, librairies) — **6h**
- Mini-projet Python appliqué — **3h**
- Exercices pratiques progressifs — **3h**
- Banque de questions — **1h30**
- Suivi P1 (recherche d'emploi, CV, veille) — **30 min**

---

## 1) Python appliqué — fichiers, modules, POO, librairies (6h)

### Objectifs d'apprentissage
- Lire et écrire des fichiers texte/CSV/JSON en Python proprement.
- Structurer un script en modules réutilisables.
- Appliquer les bases POO (classe, objet, méthode, attribut).
- Installer et utiliser une librairie utile via `pip` dans un environnement `venv`.

### Contenu pédagogique
Ce bloc te fait passer de "petit script" à "mini-outil structuré".

1. **Fichiers**
   - `with open(...)` garantit la fermeture propre.
   - Modes: `r`, `w`, `a`.
   - Encodage: toujours préciser `encoding="utf-8"` sur les fichiers texte.

2. **Formats courants**
   - `csv` (tableaux).
   - `json` (données structurées API/configuration).
   - Toujours valider le format avant traitement.

3. **Modules**
   - Découper le code par responsabilités:
     - `main.py` (orchestration),
     - `io_utils.py` (lecture/écriture),
     - `logic.py` (règles métier).
   - Import clair: `from logic import classer_ticket`.

4. **POO essentielle**
   - Classe = plan.
   - Objet = instance concrète.
   - Méthode = action de l'objet.
   - Exemple: classe `Ticket` avec statut, priorité, délai.

5. **Librairies & environnement**
   - `venv` pour isoler dépendances.
   - `pip install ...` pour ajouter package.
   - Vérifier version avec `pip list`.

6. **Robustesse**
   - Capturer erreurs attendues seulement (`FileNotFoundError`, `JSONDecodeError`).
   - Retourner un message explicite, sans masquer le problème.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Lire un fichier `tickets.txt` et afficher le nombre de lignes non vides.
   - **Corrigé détaillé** :
     - Ouvrir avec `with open("tickets.txt", "r", encoding="utf-8")`.
     - Compter lignes après `strip()`.
     - Tester fichier vide et fichier normal.

2. **Exercice 2 (intermédiaire)**  
   Créer un module `logic.py` contenant `classer_ticket(delai_heures)` puis l'appeler depuis `main.py`.
   - **Corrigé détaillé** :
     - Définir la fonction dans `logic.py`.
     - Importer dans `main.py`.
     - Tester plusieurs délais et comparer sorties attendues.

3. **Exercice 3 (avancé)**  
   Créer une classe `Ticket` avec méthode `calculer_priorite()`.
   - **Corrigé détaillé** :
     - Attributs minimaux: `id`, `titre`, `delai_heures`.
     - Méthode retourne `"normale"`, `"moyenne"`, `"haute"` selon règle.
     - Créer 3 objets tests et valider résultat.

### Nouvelles abréviations rencontrées
- VENV | Virtual Environment | Environnement Python isolé par projet | Interagit avec pip, dépendances, reproductibilité
- PIP | Pip Installs Packages | Gestionnaire de paquets Python | Interagit avec venv, librairies tierces, setup projet
- STDLIB | Standard Library | Bibliothèque standard incluse avec Python | Interagit avec modules `csv`, `json`, `pathlib`

### Banque de questions du module (15)
1. QCM : Pourquoi utiliser `with open(...)` ?  
   A. Plus joli B. Fermeture propre automatique C. Plus rapide internet
2. QCM : `json` est surtout utile pour...  
   A. Styles CSS B. Données structurées C. Imprimer PDF
3. QCM : `venv` sert à...  
   A. Isoler dépendances B. Compiler C++ C. Héberger API
4. QCM : `pip` sert à...  
   A. Installer des paquets Python B. Créer SQL C. Gérer DNS
5. Ouverte : Pourquoi découper en modules ?
6. Ouverte : Différence classe vs objet.
7. Mise en situation : Le fichier n'existe pas, que faire proprement ?
8. QCM : Encodage recommandé texte ?  
   A. latin-1 B. utf-8 C. binaire
9. Ouverte : Donne un exemple concret d'attribut et méthode d'un Ticket.
10. Mise en situation : Tu as 300 lignes de script unique, première amélioration ?
11. QCM : La `stdlib` est...  
    A. Externe payante B. Incluse avec Python C. Outil Git
12. Ouverte : Pourquoi éviter un `except` trop large ?
13. QCM : `a` (append) en ouverture de fichier signifie...  
    A. Lire B. Écraser C. Ajouter
14. Mise en situation : Tu dois partager ton projet à un recruteur, quoi fournir avec le code ?
15. Ouverte : Pourquoi `venv + requirements` améliore l'employabilité technique ?

---

## 2) Mini-projet Python appliqué (3h)

### Objectifs d'apprentissage
- Construire un mini-outil complet orienté besoin métier.
- Organiser code + données + exécution dans une arborescence claire.
- Produire un livrable démontrable en entretien technique.

### Contenu pédagogique
**Mini-projet J5 proposé:** *Gestionnaire local de tickets support*.

Fonctionnalités minimales (MVP):
1. Ajouter un ticket (titre, délai en heures).
2. Calculer automatiquement la priorité.
3. Sauvegarder en JSON.
4. Lister tous les tickets.
5. Afficher le nombre de tickets par priorité.

Structure recommandée:
- `main.py`
- `models.py` (classe Ticket)
- `logic.py` (règles de priorité)
- `storage.py` (lecture/écriture JSON)
- `data/tickets.json`

Critères qualité:
- Aucune exception silencieuse.
- Sorties terminal claires.
- Jeu de tests manuels documenté.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Créer l'ossature de projet (fichiers + dossiers) et un `main.py` exécutable.
   - **Corrigé détaillé** :
     - Arborescence conforme.
     - `main.py` affiche menu minimal.
     - Vérifier exécution sans erreur.

2. **Exercice 2 (intermédiaire)**  
   Ajouter création de ticket + sauvegarde JSON.
   - **Corrigé détaillé** :
     - Conversion délai en entier avec contrôle.
     - Écriture JSON formatée (`indent=2`).
     - Vérifier contenu du fichier après ajout.

3. **Exercice 3 (avancé)**  
   Ajouter rapport "tickets par priorité" et afficher synthèse.
   - **Corrigé détaillé** :
     - Parcourir liste tickets.
     - Compter par catégories (`normale`, `moyenne`, `haute`).
     - Valider avec jeu de données mixte.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : MVP signifie...  
   A. Most Valuable Program B. Minimum Viable Product C. Main Version Package
2. QCM : But d'un mini-projet J5 ?  
   A. Théorie seule B. Preuve pratique C. Réduire volume
3. Ouverte : Pourquoi séparer `storage.py` et `logic.py` ?
4. Mise en situation : Le JSON est corrompu. Réaction correcte ?
5. QCM : Une arborescence claire aide surtout...  
   A. Le CPU B. La maintenance et la lecture C. Le design logo
6. Ouverte : Quelles 3 preuves montrer en entretien avec ce mini-projet ?
7. QCM : Priorité automatique dépend de...  
   A. Couleur terminal B. Règles métier C. Taille du fichier
8. Mise en situation : Tu dois expliquer ton mini-projet en 60 secondes, structure ?
9. Ouverte : Pourquoi commencer par MVP avant options avancées ?
10. QCM : Une sortie terminal utile est...  
    A. Ambiguë B. Actionnable C. Très longue
11. Ouverte : Quel risque d'un projet sans tests manuels ?
12. Mise en situation : Tu n'as que 20 minutes, que finaliser d'abord ?
13. QCM : Un recruteur junior regarde d'abord...  
    A. Lisibilité + logique B. Animations C. Nom du PC
14. Ouverte : Comment prouver que ton code gère erreurs d'entrée ?
15. QCM : Livrable J5 réussi =  
    A. Script partiel B. Outil exécutable + preuve C. Notes seulement

---

## 3) Exercices pratiques progressifs (3h)

### Objectifs d'apprentissage
- Renforcer maîtrise des fichiers, modules et POO.
- Écrire des scripts testables avec cas limites.
- Gagner vitesse d'exécution sans sacrifier qualité.

### Contenu pédagogique
Méthode:
1. Lire besoin.
2. Définir cas nominal + cas limites.
3. Coder par étapes.
4. Tester.
5. Corriger.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Lire un CSV de ventes et calculer le total.
   - **Corrigé détaillé** :
     - Utiliser module `csv`.
     - Convertir montants en `float`.
     - Tester ligne invalide et fichier valide.

2. **Exercice 2 (intermédiaire)**  
   Créer une classe `Etudiant` avec méthode `est_admis()`.
   - **Corrigé détaillé** :
     - Attributs: nom, moyenne.
     - `est_admis()` retourne booléen.
     - Tester moyenne 9.9 / 10 / 14.

3. **Exercice 3 (avancé)**  
   Fusionner données JSON + CSV dans un rapport texte.
   - **Corrigé détaillé** :
     - Charger les deux sources.
     - Appliquer correspondance par clé.
     - Générer fichier rapport lisible.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : Cas limite sert à...  
   A. Éviter tests B. Valider robustesse C. Styliser code
2. QCM : `csv` Python vient de...  
   A. stdlib B. API web C. SQL engine
3. Ouverte : Pourquoi tester 9.9, 10, 14 pour admission ?
4. Mise en situation : Une ligne CSV contient texte au lieu de nombre, action ?
5. QCM : Une méthode de classe doit...  
   A. Être décorative B. Porter un comportement C. Être vide
6. Ouverte : Différence attribut d'instance vs variable locale.
7. QCM : Un rapport texte généré automatiquement apporte...  
   A. Traçabilité B. Latence réseau C. Couleurs terminal
8. Mise en situation : Le script est juste mais lent, première piste ?
9. Ouverte : Pourquoi isoler parsing et logique métier ?
10. QCM : Un booléen représente...  
    A. Un texte B. Vrai/Faux C. Un tableau
11. Ouverte : Comment rendre un exercice portfolio-ready ?
12. Mise en situation : Tu bloques sur fusion JSON/CSV, que simplifier ?
13. QCM : Qualité minimale attendue J5 ?  
    A. Code obscur B. Lisible + fonctionnel + testé C. Très long
14. Ouverte : À quoi sert une validation d'entrée utilisateur ?
15. QCM : Bonne séquence de travail ?  
    A. Coder puis réfléchir B. Besoin→cas→code→tests C. Tests facultatifs

---

## 4) Banque de questions (1h30)

### Objectifs d'apprentissage
- Mesurer compréhension réelle du jour.
- Entraîner le format test d'embauche.
- Identifier 3 priorités de remédiation pour J6.

### Contenu pédagogique
Séquence:
1. 45 min épreuve.
2. 30 min correction argumentée.
3. 15 min plan d'action.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Construire un mini-test de 20 questions (fichiers/modules/POO).
   - **Corrigé détaillé** :
     - Répartition équilibrée.
     - Questions progressives.
     - Vérifier alignement avec J5.

2. **Exercice 2 (intermédiaire)**  
   Classer erreurs en 4 catégories et associer action corrective.
   - **Corrigé détaillé** :
     - 1 cause principale par erreur.
     - 1 action mesurable par cause.
     - Délais de correction sous 24h.

3. **Exercice 3 (avancé)**  
   Simuler un oral: "Explique ton mini-projet et un bug corrigé".
   - **Corrigé détaillé** :
     - Contexte, bug, correction, leçon apprise.
     - Durée 2 min, vocabulaire technique simple.
     - Cohérence avec le code réel.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : But de la banque J5 ?  
   A. Tri administratif B. Évaluer + corriger C. Remplacer projet
2. QCM : Une bonne correction inclut...  
   A. Résultat seul B. Raisonnement C. Aucun détail
3. Ouverte : Pourquoi limiter la remédiation à 3 priorités ?
4. Mise en situation : Bon score QCM, faible score cas pratiques. Conclusion ?
5. QCM : En entretien, expliquer un bug corrigé montre...  
   A. Faiblesse B. Capacité d'analyse C. Hors sujet
6. Ouverte : Quel indicateur simple suivre entre J5 et J6 ?
7. QCM : Une action corrective mesurable est...  
   A. "m'améliorer" B. "faire 3 exercices POO chronométrés" C. "voir plus tard"
8. Mise en situation : Tu refais la même erreur d'import module. Solution ?
9. Ouverte : Pourquoi argumenter les réponses ouvertes ?
10. QCM : Priorité remédiation doit cibler...  
    A. Force déjà solide B. Point bloquant C. Sujet au hasard
11. Ouverte : Exemple de phrase d'oral professionnelle technique.
12. Mise en situation : Temps insuffisant en test, quel ajustement ?
13. QCM : Progression crédible =  
    A. Impression B. Scores + corrections + scripts C. Promesse
14. Ouverte : Pourquoi corriger immédiatement après test ?
15. QCM : Résultat attendu fin J5 ?  
    A. Théorie seule B. Compétence démontrable C. Aucune preuve

---

## 5) Suivi P1 (30 min)

### Objectifs d'apprentissage
- Transformer le mini-projet J5 en preuve employable.
- Mettre à jour CV/profil avec formulation impactante et honnête.
- Aligner les révisions J6 sur les attentes marché observées.

### Contenu pédagogique
Routine rapide:
1. Mettre le projet dans le portfolio (nom, objectif, stack, résultat).
2. Ajouter une ligne CV orientée impact.
3. Comparer 3 offres et extraire les manques.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Rédiger une puce CV sur le mini-projet J5.
   - **Corrigé détaillé** :
     - Verbe d'action + techno + résultat.
     - Phrase courte et factuelle.
     - Vérifier lisibilité immédiate.

2. **Exercice 2 (intermédiaire)**  
   Rédiger un pitch 45 secondes du mini-projet.
   - **Corrigé détaillé** :
     - Problème, solution, résultat.
     - Un vocabulaire pro, pas de jargon inutile.
     - Chronométrer à 45 secondes.

3. **Exercice 3 (avancé)**  
   Définir plan J6 personnel en 3 priorités mesurables.
   - **Corrigé détaillé** :
     - Priorité technique 1 (bloquant majeur).
     - Priorité technique 2 (fréquence en offres).
     - Priorité communication technique (entretien).

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : But P1 quotidien ?  
   A. Administratif B. Employabilité progressive C. Pause
2. Ouverte : Pourquoi une preuve de projet vaut plus qu'une déclaration ?
3. QCM : Une puce CV forte contient...  
   A. Flou B. Action + techno + résultat C. Adjectifs
4. Mise en situation : Projet fonctionnel mais mal expliqué, risque ?
5. Ouverte : Comment rester honnête sur ton niveau junior ?
6. QCM : Un bon pitch commence par...  
   A. Nom de fichier B. Problème résolu C. Historique complet
7. Ouverte : Quel lien entre veille offres et plan de révision ?
8. QCM : Priorité J6 doit être...  
   A. Mesurable B. Vague C. Optionnelle
9. Mise en situation : Recruteur demande "preuve de robustesse", que montrer ?
10. Ouverte : Exemple d'indicateur concret de progression.
11. QCM : Portfolio utile =  
    A. Captures seules B. Code + contexte + résultat C. Liens cassés
12. Ouverte : Pourquoi adapter le discours au poste cible ?
13. Mise en situation : Tu paniques en oral technique, 1 routine courte ?
14. QCM : Résultat P1 réussi ce soir =  
    A. CV inchangé B. CV + preuve + plan J6 C. Lecture passive
15. Ouverte : Quelle action exacte lancer avant J6 matin ?

---

## Validation qualité J5 (anti-superficiel)

### Livrables obligatoires fin de J5
1. Mini-projet Python exécutable (gestion tickets) avec persistance JSON.  
2. Code structuré en modules (`main`, logique, stockage, modèle).  
3. Au moins 8 tests manuels documentés (dont 3 cas limites).  
4. Pitch technique 45-60 secondes prêt pour entretien.  
5. Une preuve intégrée CV/portfolio (phrase d'impact + lien dépôt).

### Grille d'évaluation rapide (100 points)
- Fonctionnalité métier du mini-projet (MVP complet): **30 pts**
- Architecture du code (modules, clarté, responsabilité): **25 pts**
- Robustesse (erreurs d'entrée/fichier gérées proprement): **20 pts**
- Tests et preuves (journal de tests + cohérence): **15 pts**
- Communication employabilité (pitch + CV): **10 pts**

### Seuil attendu
- **>= 75/100** : J5 validé au standard employabilité junior.  
- **60-74/100** : validé sous réserve de renforcement ciblé J6 matin.  
- **< 60/100** : correction obligatoire du mini-projet avant progression.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Python appliqué)
1. **B**  
2. **B**  
3. **A**  
4. **A**  
5. Pour séparer responsabilités, faciliter test, maintenance et réutilisation.  
6. Classe = modèle; objet = instance concrète.  
7. Gérer explicitement `FileNotFoundError` et informer clairement l'utilisateur.  
8. **B**  
9. Attribut: `delai_heures`; méthode: `calculer_priorite()`.  
10. Extraire en modules (`io`, logique, modèles) avant toute optimisation.  
11. **B**  
12. Un `except` large masque les vrais bugs et ralentit le diagnostic.  
13. **C**  
14. Code exécutable + instructions + exemples d'entrée/sortie + limites.  
15. Parce que ça prouve un travail reproductible et professionnel.

### B. Corrigé — Module 2 (Mini-projet)
1. **B**  
2. **B**  
3. Séparer persistance (storage) et règles métier (logic) améliore clarté/testabilité.  
4. Sauvegarder backup, valider JSON, corriger structure, relancer test.  
5. **B**  
6. Démo exécutable, structure claire, gestion d'erreurs explicite.  
7. **B**  
8. Problème → solution → démonstration rapide → résultat.  
9. Livrer valeur minimale fiable avant extensions secondaires.  
10. **B**  
11. Risque: faux sentiment de réussite, bugs cachés non détectés.  
12. Finaliser flux principal: ajouter/lister/sauvegarder tickets.  
13. **A**  
14. Montrer test d'entrée invalide + message d'erreur contrôlé.  
15. **B**

### C. Corrigé — Module 3 (Pratique progressive)
1. **B**  
2. **A**  
3. Car 10 est le seuil, il faut tester juste avant/au seuil/au-dessus.  
4. Valider la ligne, ignorer/consigner l'erreur, continuer traitement proprement.  
5. **B**  
6. Attribut d'instance appartient à l'objet; variable locale vit dans la fonction.  
7. **A**  
8. Mesurer où ça ralentit (I/O, boucles), puis optimiser ce point réel.  
9. Pour modifier règles sans casser le parsing (et inversement).  
10. **B**  
11. Ajouter README court + exemples + résultat observé.  
12. Réduire: charger une source d'abord, puis fusion incrémentale.  
13. **B**  
14. Éviter crash et données incohérentes.  
15. **B**

### D. Corrigé — Module 4 (Banque J5)
1. **B**  
2. **B**  
3. Pour rester focalisé sur les leviers à plus fort impact.  
4. Compréhension théorique correcte, transfert pratique insuffisant.  
5. **B**  
6. Taux de réussite en cas pratiques chronométrés (ex: 70%→85%).  
7. **B**  
8. Revoir imports relatifs/absolus + refaire 3 mini-exos ciblés.  
9. Parce que le recruteur évalue ton raisonnement, pas juste la réponse.  
10. **B**  
11. "J'ai corrigé une erreur JSON en ajoutant validation et tests limites."  
12. Timeboxing par question + passer puis revenir aux blocages.  
13. **B**  
14. Consolidation immédiate et réduction de répétition d'erreurs.  
15. **B**

### E. Corrigé — Module 5 (Suivi P1)
1. **B**  
2. Parce qu'elle prouve une compétence réelle observée.  
3. **B**  
4. Risque: sous-valorisation de ton travail malgré code correct.  
5. Dire niveau actuel + ce que tu sais faire + ce que tu renforces.  
6. **B**  
7. La veille montre les compétences demandées, donc guide tes priorités.  
8. **A**  
9. Montrer logs de tests, cas invalides gérés, sortie stable.  
10. Ex: "3 scripts terminés + 80% réponses justes sur module POO".  
11. **B**  
12. Pour parler la langue du poste (support/data/dev).  
13. Routine: respiration 1 min + plan oral en 3 points + exemple concret.  
14. **B**  
15. Publier preuve J5 + répéter pitch 2 fois + planifier priorité J6 n°1.
