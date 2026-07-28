# TOME P2 — Jour 10 (14h)

## Découpage horaire opérationnel J10
- Bash avancé (filtres, pipes, scripts robustes) — **6h**
- Automatisation (tâches planifiées, logs, contrôles) — **3h**
- Bash + SQL (intégration pratique) — **3h**
- Banque de questions — **1h30**
- Suivi P1 (recherche d'emploi, CV, veille) — **30 min**

---

## 1) Bash avancé (6h)

### Objectifs d'apprentissage
- Utiliser efficacement pipes, redirections et commandes de filtrage.
- Écrire des scripts Bash lisibles avec variables, conditions et boucles.
- Gérer les codes de sortie pour fiabiliser l'exécution.
- Produire un script de diagnostic simple réutilisable.

### Contenu pédagogique
Bash sert à automatiser vite des tâches système répétitives.

1. **Pipes et filtres**
   - `|` enchaîne des commandes.
   - `grep`, `cut`, `sort`, `uniq`, `wc` pour extraire l'information utile.

2. **Redirections**
   - `>` écrase un fichier.
   - `>>` ajoute.
   - `2>` redirige les erreurs.

3. **Variables et paramètres**
   - `VAR="valeur"`, `"$VAR"`.
   - Paramètres script: `$1`, `$2`, etc.

4. **Conditions et boucles**
   - `if`, `case`, `for`, `while`.
   - Toujours contrôler les entrées utilisateur.

5. **Codes de sortie**
   - `0` = succès, non zéro = erreur.
   - Vérifier avec `$?` ou structures `if command; then ...`.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Afficher le nombre de lignes contenant "ERROR" dans un fichier log.
   - **Corrigé détaillé** :
     - `grep "ERROR" app.log | wc -l`
     - Tester avec fichier sans erreur puis avec erreurs.
     - Vérifier que la casse est traitée selon besoin.

2. **Exercice 2 (intermédiaire)**  
   Écrire un script qui prend un nom de fichier en argument et vérifie son existence.
   - **Corrigé détaillé** :
     - Tester argument vide.
     - `if [ -f "$1" ]; then ... else ... fi`
     - Retourner code de sortie explicite.

3. **Exercice 3 (avancé)**  
   Créer un script `diag_reseau.sh` qui teste ping passerelle + DNS + internet.
   - **Corrigé détaillé** :
     - Étapes ordonnées.
     - Messages clairs.
     - Code retour non zéro si échec critique.

### Nouvelles abréviations rencontrées
- STDIN | Standard Input | Flux d'entrée standard d'une commande | Interagit avec pipes, scripts, redirections
- STDOUT | Standard Output | Flux de sortie standard d'une commande | Interagit avec logs, redirections, chaînage de commandes
- STDERR | Standard Error | Flux de sortie d'erreur d'une commande | Interagit avec debug, supervision, redirection `2>`

### Banque de questions du module (15)
1. QCM : Le pipe `|` sert à...  
   A. Compresser B. Chaîner sorties/entrées C. Chiffrer
2. QCM : `>>` fait...  
   A. Écrase B. Ajoute C. Supprime
3. QCM : Code retour `0` signifie...  
   A. Erreur B. Succès C. Inconnu
4. Ouverte : Différence STDOUT vs STDERR.
5. Ouverte : Pourquoi vérifier les arguments d'un script ?
6. Mise en situation : Ton script échoue sans message clair.
7. QCM : `grep "ERROR" log | wc -l` donne...  
   A. Taille fichier B. Nombre de lignes matchées C. Nombre de colonnes
8. Ouverte : Quand utiliser `case` plutôt que plusieurs `if` ?
9. Mise en situation : Tu veux garder erreurs dans `errors.log` uniquement.
10. QCM : `$1` représente...  
    A. Premier argument B. Variable globale C. Code retour
11. Ouverte : Pourquoi afficher des messages explicites dans un script ?
12. Mise en situation : Script correct localement mais pas sur autre machine.
13. QCM : `2>` redirige...  
    A. STDIN B. STDERR C. STDOUT
14. Ouverte : Donne une checklist mini de robustesse Bash.
15. QCM : Objectif du bloc ?  
    A. Copier commandes B. Script fiable et lisible C. Éviter terminal

---

## 2) Automatisation (3h)

### Objectifs d'apprentissage
- Planifier une tâche automatique simple.
- Générer et lire des logs d'exécution.
- Sécuriser une automatisation avec vérifications minimales.

### Contenu pédagogique
Automatiser = exécuter sans intervention humaine tout en gardant traçabilité.

1. **Planification**
   - `cron` pour tâches récurrentes.
   - Horaires maîtrisés (éviter collisions).

2. **Logs**
   - Toujours journaliser résultat et erreurs.
   - Conserver horodatage.

3. **Sécurisation**
   - Vérifier prérequis (fichier présent, commande disponible).
   - Arrêter proprement en cas d'échec critique.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Écrire une ligne cron qui lance un script chaque jour à 08:00.
   - **Corrigé détaillé** :
     - Expression: `0 8 * * * /chemin/script.sh`
     - Vérifier chemin absolu.
     - Rediriger sorties vers log.

2. **Exercice 2 (intermédiaire)**  
   Ajouter journalisation date + statut dans un fichier log.
   - **Corrigé détaillé** :
     - `echo "$(date) - démarrage" >> run.log`
     - Capturer succès/erreur.
     - Vérifier lisibilité du log.

3. **Exercice 3 (avancé)**  
   Script d'automatisation avec contrôle de prérequis + arrêt propre.
   - **Corrigé détaillé** :
     - Vérifier dépendances.
     - Exécuter tâches.
     - Sortir avec code non zéro sur échec.

### Nouvelles abréviations rencontrées
- CRON | Command Run ON schedule | Mécanisme Unix de planification de tâches | Interagit avec scripts Bash, logs, maintenance récurrente

### Banque de questions du module (15)
1. QCM : `cron` sert à...  
   A. Requêter SQL B. Planifier C. Compiler
2. QCM : Une automatisation sans log est...  
   A. Acceptable B. Risquée C. Optimale
3. QCM : `0 8 * * *` signifie...  
   A. 8 fois par heure B. Tous les jours à 08:00 C. Chaque minute
4. Ouverte : Pourquoi utiliser chemin absolu dans cron ?
5. Ouverte : Que doit contenir un bon log d'automatisation ?
6. Mise en situation : Tâche cron "ne fait rien", premier contrôle ?
7. QCM : En cas d'échec critique, un script doit...  
   A. Continuer B. S'arrêter proprement C. Se taire
8. Ouverte : Pourquoi horodater les logs ?
9. Mise en situation : Deux jobs se lancent en même temps et se gênent.
10. QCM : L'automatisation fiable exige...  
    A. Vérifications B. Chance C. Redémarrages constants
11. Ouverte : Différence script manuel vs automatisé.
12. Mise en situation : Le log grossit trop, que faire ?
13. QCM : Objectif principal du bloc 2 ?  
    A. Supprimer supervision B. Exécution traçable C. Éviter Bash
14. Ouverte : Exemple de tâche support automatisable.
15. QCM : Un bon script cron doit être...  
    A. Interactif B. Non interactif C. Graphique

---

## 3) Bash + SQL (3h)

### Objectifs d'apprentissage
- Lancer des requêtes SQL depuis un script Bash.
- Exporter des résultats en CSV pour reporting rapide.
- Enchaîner extraction SQL et contrôle qualité minimal.

### Contenu pédagogique
Pont clé J10: Bash orchestre, SQL fournit la donnée.

1. **Exécution SQL en script**
   - Appeler client SQL en mode non interactif.
   - Stocker sortie dans fichier.

2. **Export**
   - Générer CSV daté.
   - Vérifier taille et cohérence du fichier.

3. **Contrôles**
   - Vérifier code de sortie requête.
   - Vérifier présence d'en-têtes et nombre de lignes.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Lancer une requête SQL de comptage depuis Bash et afficher le résultat.
   - **Corrigé détaillé** :
     - Commande SQL non interactive.
     - Capturer sortie dans variable.
     - Afficher format clair.

2. **Exercice 2 (intermédiaire)**  
   Exporter "tickets ouverts par agent" en CSV daté.
   - **Corrigé détaillé** :
     - Nom fichier avec date.
     - Vérifier création fichier.
     - Contrôler lignes > 1 (en-tête + données).

3. **Exercice 3 (avancé)**  
   Script complet extraction SQL + contrôle + log + code retour.
   - **Corrigé détaillé** :
     - Étapes séquencées.
     - Gestion erreurs explicite.
     - Résumé final exploitable support/data.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : But de Bash+SQL ?  
   A. Découpler totalement B. Orchestrer extraction de données C. Remplacer SQL
2. QCM : Un export CSV doit être...  
   A. Non vérifié B. Vérifié C. Aléatoire
3. Ouverte : Pourquoi vérifier code retour après requête SQL ?
4. Mise en situation : Fichier CSV créé mais vide, que testes-tu ?
5. QCM : Nom de fichier daté sert à...  
   A. Esthétique B. Traçabilité C. Compression
6. Ouverte : Quel risque d'un script sans contrôle de sortie ?
7. QCM : Pipeline Bash+SQL utile pour...  
   A. Reporting quotidien B. UI design C. Firewall
8. Mise en situation : La requête devient lente, quelle première action ?
9. Ouverte : Comment valider rapidement un export ?
10. QCM : Un script robuste doit...  
    A. Ignorer erreurs B. Journaliser + retourner statut C. Éviter logs
11. Ouverte : Quel lien entre ce bloc et poste data/support junior ?
12. Mise en situation : Le CSV a des colonnes décalées.
13. QCM : Contrôle minimal avant livraison =  
    A. Existe + non vide + format cohérent B. Nom joli C. Permissions root
14. Ouverte : Pourquoi documenter commande SQL dans le script ?
15. QCM : Résultat attendu du bloc ?  
    A. Script démontrable B. Notes théoriques C. Aucun livrable

---

## 4) Banque de questions (1h30)

### Objectifs d'apprentissage
- Évaluer maîtrise réelle de J10.
- Préparer le projet de synthèse J11.
- Identifier remédiation immédiate.

### Contenu pédagogique
Format:
1. 45 min test mixte.
2. 30 min correction argumentée.
3. 15 min plan J11.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Construire une épreuve de 20 questions Bash/automatisation/SQL.
   - **Corrigé détaillé** :
     - Couverture équilibrée.
     - Niveau progressif.
     - Correction immédiate.

2. **Exercice 2 (intermédiaire)**  
   Classer 10 erreurs scripts (syntaxe, logique, environnement, validation).
   - **Corrigé détaillé** :
     - Cause dominante par erreur.
     - Action corrective mesurable.
     - Délai de correction <24h.

3. **Exercice 3 (avancé)**  
   Simuler oral: "Présente ton pipeline Bash+SQL".
   - **Corrigé détaillé** :
     - Besoin.
     - Étapes techniques.
     - Résultat métier.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : But banque J10 ?  
   A. Sanctionner B. Mesurer et corriger C. Remplacer pratique
2. QCM : Une bonne correction inclut...  
   A. Réponse brute B. Raisonnement C. Copie
3. Ouverte : Pourquoi corriger juste après ?
4. Mise en situation : Bon QCM, mauvais script réel.
5. QCM : Remédiation utile =  
   A. vague B. mesurable C. reportée
6. Ouverte : Quel indicateur suivre avant J11 ?
7. QCM : Explication orale pro doit être...  
   A. floue B. structurée C. improvisée
8. Mise en situation : Tu oublies de vérifier code retour.
9. Ouverte : Différence connaître commande / livrer solution.
10. QCM : Plan J11 cible...  
    A. points forts B. points bloquants C. hasard
11. Ouverte : Exemple d'action corrective Bash en 30 min.
12. Mise en situation : Pipeline fonctionne mais sans logs.
13. QCM : Preuve crédible =  
    A. intuition B. script + logs + export C. promesse
14. Ouverte : Pourquoi standardiser la structure de script ?
15. QCM : Résultat attendu ?  
    A. autonomie opérationnelle B. théorie seule C. pas de preuve

---

## 5) Suivi P1 (30 min)

### Objectifs d'apprentissage
- Valoriser J10 en preuve employable immédiate.
- Ajouter au CV/portfolio un cas d'automatisation concret.
- Préparer argumentaire pour postes support/admin/data junior.

### Contenu pédagogique
Routine P1:
1. Publier un script Bash utile + exemple de sortie.
2. Ajouter ligne CV orientée impact.
3. Cibler 3 attentes offres pour ajuster J11.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Rédiger une ligne CV sur un script Bash+SQL automatisé.
   - **Corrigé détaillé** :
     - Action + techno + résultat.
     - Ton factuel.

2. **Exercice 2 (intermédiaire)**  
   Pitch 60 secondes: "Ce que mon script apporte".
   - **Corrigé détaillé** :
     - Problème.
     - Solution automatisée.
     - Gain observé.

3. **Exercice 3 (avancé)**  
   Définir 3 priorités J11 mesurables.
   - **Corrigé détaillé** :
     - Priorité technique n°1.
     - Priorité qualité/preuve.
     - Priorité communication entretien.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : But P1 après J10 ?  
   A. Attendre B. Valoriser preuves C. Ignorer marché
2. Ouverte : Pourquoi l'automatisation est attractive pour recruteur junior ?
3. QCM : Une ligne CV forte =  
   A. vague B. action + impact C. buzzword
4. Mise en situation : Script utile mais mal expliqué au recruteur.
5. Ouverte : Comment relier Bash à support/admin ?
6. QCM : Pitch efficace suit...  
   A. problème→solution→résultat B. histoire longue C. jargon pur
7. Ouverte : Quelle preuve publier ce soir ?
8. QCM : Priorités J11 doivent être...  
   A. mesurables B. floues C. copiées
9. Mise en situation : Offre cible demande Linux+SQL, action immédiate ?
10. Ouverte : Micro-indicateur de progression J10.
11. QCM : Preuve solide =  
    A. titre B. script + logs + résultat C. capture seule
12. Ouverte : Pourquoi adapter ton vocabulaire au niveau interlocuteur ?
13. Mise en situation : Stress oral technique, routine courte ?
14. QCM : Résultat P1 réussi =  
    A. CV inchangé B. CV+portfolio à jour C. aucune action
15. Ouverte : Action exacte avant J11 matin ?

---

## Validation qualité J10 (anti-superficiel)

### Livrables obligatoires fin de J10
1. 3 scripts Bash fonctionnels (filtrage, diagnostic, automatisation).  
2. 1 tâche planifiée documentée (cron + log).  
3. 1 pipeline Bash+SQL produisant un CSV vérifié.  
4. 1 rapport court de validation (tests + erreurs rencontrées + corrections).  
5. 1 pitch oral 60 secondes sur l'automatisation livrée.

### Grille d'évaluation rapide (100 points)
- Maîtrise Bash (pipes, redirections, conditions): **30 pts**
- Automatisation fiable (cron, logs, contrôles): **25 pts**
- Intégration Bash+SQL (extraction, vérification): **20 pts**
- Qualité des preuves/tests: **15 pts**
- Communication technique (écrit/oral): **10 pts**

### Seuil attendu
- **>= 80/100** : J10 validé, prêt pour synthèse J11.  
- **65-79/100** : validé sous remédiation ciblée.  
- **< 65/100** : consolidation Bash/automatisation requise.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Bash avancé)
1. **B**  
2. **B**  
3. **B**  
4. STDOUT = sortie normale; STDERR = sortie d'erreurs.  
5. Pour éviter crash/erreurs silencieuses et guider l'usage.  
6. Ajouter logs/messages explicites et code retour clair.  
7. **B**  
8. Quand on gère plusieurs cas fixes (menu/type d'action).  
9. `commande 2> errors.log`  
10. **A**  
11. Pour faciliter diagnostic et maintenance.  
12. Vérifier dépendances, chemins absolus, permissions, shell cible.  
13. **B**  
14. Entrées validées, erreurs gérées, logs, codes retour, test nominal + limites.  
15. **B**

### B. Corrigé — Module 2 (Automatisation)
1. **B**  
2. **B**  
3. **B**  
4. Environnement cron minimal: chemins relatifs cassent souvent.  
5. Date/heure, étape, statut, message d'erreur si besoin.  
6. Vérifier crontab active, chemin script, permissions, logs.  
7. **B**  
8. Pour corréler incidents et exécutions exactes.  
9. Décaler horaires/ajouter verrou simple pour éviter chevauchement.  
10. **A**  
11. Manuel = lancé par humain; automatisé = planifié et non interactif.  
12. Rotation/archivage des logs.  
13. **B**  
14. Exemple: extraction quotidienne incidents ouverts.  
15. **B**

### C. Corrigé — Module 3 (Bash + SQL)
1. **B**  
2. **B**  
3. Pour détecter échec et éviter livrer des données fausses.  
4. Vérifier requête, droits, destination fichier, format d'export.  
5. **B**  
6. Export invalide non détecté, décisions erronées possibles.  
7. **A**  
8. Mesurer requête SQL, ajouter index côté DB si pertinent, limiter colonnes.  
9. Ouvrir CSV, vérifier en-tête, nombre lignes, cohérence valeurs.  
10. **B**  
11. Automatiser reporting support/data rapidement.  
12. Contrôler séparateur, quoting, et colonnes issues de la requête.  
13. **A**  
14. Pour maintenance et audit ultérieur.  
15. **A**

### D. Corrigé — Module 4 (Banque J10)
1. **B**  
2. **B**  
3. Consolidation immédiate tant que contexte est frais.  
4. Compréhension théorique présente, transfert pratique insuffisant.  
5. **B**  
6. Taux de scripts réussis sans aide + qualité des logs/retours.  
7. **B**  
8. Ajouter règle: aucune étape critique sans check `if` code retour.  
9. Commande = brique; solution = chaîne complète fiable et vérifiée.  
10. **B**  
11. Refaire 2 mini-scripts avec validation entrées + logs + exit code.  
12. Ajouter journalisation standard avant livraison.  
13. **B**  
14. Pour maintenance, relecture, et transmission d'équipe.  
15. **A**

### E. Corrigé — Module 5 (Suivi P1)
1. **B**  
2. Parce qu'elle montre autonomie, rigueur et gain opérationnel.  
3. **B**  
4. Priorité: entraîner explication orientée impact utilisateur/métier.  
5. En montrant diagnostic, script, automatisation et résultat concret.  
6. **A**  
7. Script + extrait log + CSV exemple + mini-explication.  
8. **A**  
9. Mettre en avant pipeline Linux→SQL avec preuve exécutable.  
10. Ex: "2 pipelines livrés, 100% exports valides sur 3 runs".  
11. **B**  
12. Pour être compris et convaincant selon le rôle visé.  
13. Respiration 1 min + plan 3 points + exemple réel court.  
14. **B**  
15. Publier preuve J10 et préparer check-list projet J11.
