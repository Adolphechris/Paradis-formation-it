# TOME P2 — Jour 07 (14h)

## Découpage horaire opérationnel J7
- SQL bases (requêtes fondamentales) — **6h**
- Agrégation et analyse (GROUP BY, HAVING) — **3h**
- Exercices sur base réelle — **3h**
- Banque de questions — **1h30**
- Suivi P1 (recherche d'emploi, CV, veille) — **30 min**

---

## 1) SQL bases (6h)

### Objectifs d'apprentissage
- Écrire des requêtes SQL correctes pour lire et filtrer des données.
- Utiliser `SELECT`, `WHERE`, `ORDER BY`, `LIMIT` avec logique claire.
- Comprendre les opérations d'ajout/modification/suppression en sécurité.
- Expliquer simplement la différence entre structure de table et contenu.

### Contenu pédagogique
SQL sert à interroger et manipuler des bases relationnelles.

1. **Lecture des données**
   - `SELECT ... FROM ...`
   - Choisir uniquement les colonnes utiles.
   - Éviter `SELECT *` dans un contexte pro si non nécessaire.

2. **Filtrage**
   - `WHERE` avec `=`, `>`, `<`, `BETWEEN`, `IN`, `LIKE`.
   - Utiliser `AND` / `OR` avec parenthèses pour éviter ambiguïtés.

3. **Tri et pagination**
   - `ORDER BY` ascendant/descendant.
   - `LIMIT` pour restreindre l'affichage.

4. **Manipulation**
   - `INSERT` (ajouter), `UPDATE` (modifier), `DELETE` (supprimer).
   - Toujours tester la condition `WHERE` avant `UPDATE/DELETE`.

5. **Structure vs données**
   - DDL: création/modification structure (`CREATE`, `ALTER`).
   - DML: manipulation des lignes (`INSERT`, `UPDATE`, `DELETE`).
   - DQL: interrogation (`SELECT`).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Afficher les colonnes `id`, `nom`, `email` d'une table `clients`.
   - **Corrigé détaillé** :
     - Requête: `SELECT id, nom, email FROM clients;`
     - Vérifier noms exacts de colonnes.
     - Contrôler le résultat sur 5 premières lignes.

2. **Exercice 2 (intermédiaire)**  
   Afficher les commandes > 100 avec tri décroissant du montant.
   - **Corrigé détaillé** :
     - `WHERE montant > 100`
     - `ORDER BY montant DESC`
     - Ajouter `LIMIT 20` pour lecture rapide.

3. **Exercice 3 (avancé)**  
   Mettre à jour le statut d'une commande précise sans toucher les autres.
   - **Corrigé détaillé** :
     - Vérifier d'abord avec `SELECT ... WHERE id = ...`
     - Appliquer `UPDATE commandes SET statut='livree' WHERE id=...`
     - Re-vérifier avec un `SELECT` de contrôle.

### Nouvelles abréviations rencontrées
- DDL | Data Definition Language | Commandes SQL de définition de structure | Interagit avec schéma de base, tables, colonnes
- DML | Data Manipulation Language | Commandes SQL de modification des lignes | Interagit avec CRUD, gestion opérationnelle des données
- DQL | Data Query Language | Commandes SQL de lecture/interrogation | Interagit avec analyses, reporting, extraction

### Banque de questions du module (15)
1. QCM : `SELECT` appartient surtout à...  
   A. DML B. DQL C. DDL
2. QCM : `CREATE TABLE` est du...  
   A. DDL B. DQL C. CSS
3. QCM : `UPDATE` sans `WHERE` risque...  
   A. Rien B. Modifier toutes les lignes C. Ajouter une table
4. QCM : `ORDER BY montant DESC` trie...  
   A. Du plus petit au plus grand B. Du plus grand au plus petit C. Aléatoirement
5. Ouverte : Pourquoi éviter `SELECT *` en contexte pro ?
6. Ouverte : Différence DDL vs DML.
7. Mise en situation : Tu dois retrouver un client par email partiel, quel opérateur ?
8. QCM : `LIMIT 10` sert à...  
   A. Créer 10 lignes B. Limiter l'affichage C. Supprimer 10 lignes
9. Ouverte : Pourquoi vérifier avec `SELECT` avant un `UPDATE` ?
10. Mise en situation : Tu dois supprimer une ligne précise sans erreur, ta méthode ?
11. QCM : `WHERE` sert à...  
    A. Filtrer B. Renommer table C. Ajouter index
12. Ouverte : Donne un exemple de condition combinée `AND`/`OR`.
13. Mise en situation : Un stagiaire a lancé `DELETE FROM commandes;` sans filtre. Impact ?
14. QCM : `LIKE '%gmail.com'` sert à...  
    A. Chercher suffixe B. Trier C. Additionner
15. Ouverte : Comment expliquer SQL à un recruteur non technique ?

---

## 2) Agrégation et analyse SQL (3h)

### Objectifs d'apprentissage
- Produire des synthèses fiables avec `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`.
- Regrouper les données avec `GROUP BY`.
- Filtrer les groupes avec `HAVING`.
- Construire des mini-reportings utiles métier.

### Contenu pédagogique
L'agrégation transforme des lignes brutes en indicateurs.

1. **Fonctions d'agrégation**
   - `COUNT(*)`: compter.
   - `SUM(col)`: total.
   - `AVG(col)`: moyenne.
   - `MIN`/`MAX`: bornes.

2. **GROUP BY**
   - Regrouper par catégorie (ex: région, produit, statut).
   - Toute colonne non agrégée doit être dans `GROUP BY`.

3. **HAVING**
   - Filtre après agrégation.
   - Différence clé: `WHERE` filtre lignes avant, `HAVING` filtre groupes après.

4. **Cas métier**
   - Nombre de tickets par statut.
   - Chiffre d'affaires par mois.
   - Clients à forte valeur (> seuil).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Compter le nombre total de commandes.
   - **Corrigé détaillé** :
     - `SELECT COUNT(*) FROM commandes;`
     - Vérifier cohérence avec volume attendu.

2. **Exercice 2 (intermédiaire)**  
   Calculer le CA total par région.
   - **Corrigé détaillé** :
     - `SELECT region, SUM(montant) ... GROUP BY region`
     - Trier par CA décroissant.
     - Vérifier qu'aucune région n'est oubliée.

3. **Exercice 3 (avancé)**  
   Afficher uniquement les régions avec CA > 10 000.
   - **Corrigé détaillé** :
     - Requête agrégée + `HAVING SUM(montant) > 10000`
     - Contrôler seuil exact et cas limite 10 000.
     - Comparer avec sortie sans HAVING.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : `COUNT(*)` sert à...  
   A. Trier B. Compter C. Renommer
2. QCM : `GROUP BY` permet...  
   A. Regrouper B. Supprimer C. Créer
3. QCM : `HAVING` filtre...  
   A. Les tables B. Les groupes agrégés C. Les index
4. Ouverte : Différence `WHERE` vs `HAVING`.
5. Ouverte : Quand utiliser `AVG` plutôt que `SUM` ?
6. Mise en situation : Tu dois trouver les 3 régions les plus performantes.
7. QCM : `SUM(montant)` calcule...  
   A. Une moyenne B. Un total C. Une fréquence
8. Ouverte : Pourquoi vérifier les cas limites de seuil ?
9. Mise en situation : Le reporting affiche une région manquante, que vérifies-tu ?
10. QCM : `ORDER BY SUM(montant) DESC` sert à...  
    A. Trier résultats agrégés B. Filtrer groupes C. Modifier table
11. Ouverte : Donne un exemple de KPI SQL simple.
12. Mise en situation : Tu dois compter tickets "ouverts" par équipe.
13. QCM : `MIN(date)` renvoie...  
    A. La date la plus ancienne B. La plus récente C. Le nombre de dates
14. Ouverte : Pourquoi l'agrégation est centrale en data junior ?
15. QCM : Objectif du module ?  
    A. Faire décoratif B. Produire des synthèses fiables C. Éviter données

---

## 3) Exercices sur base réelle (3h)

### Objectifs d'apprentissage
- Travailler sur un jeu de données proche du terrain.
- Produire des requêtes lisibles et vérifiables.
- Détecter incohérences de données et les signaler.

### Contenu pédagogique
Base réelle simulée: `clients`, `commandes`, `tickets_support`.

Workflow:
1. Comprendre schéma.
2. Écrire requêtes lecture.
3. Écrire requêtes agrégation.
4. Vérifier résultats (cohérence métier).
5. Documenter les anomalies.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Lister les 10 dernières commandes avec nom client.
   - **Corrigé détaillé** :
     - `JOIN` entre `commandes` et `clients`.
     - Tri par date desc + `LIMIT 10`.
     - Vérifier correspondance client/commande.

2. **Exercice 2 (intermédiaire)**  
   Afficher nombre de tickets ouverts par agent support.
   - **Corrigé détaillé** :
     - Filtre `WHERE statut='ouvert'`.
     - `GROUP BY agent`.
     - Trier par volume desc.

3. **Exercice 3 (avancé)**  
   Détecter clients sans commande (analyse commerciale).
   - **Corrigé détaillé** :
     - `LEFT JOIN` clients→commandes.
     - Filtrer `WHERE commandes.id IS NULL`.
     - Vérifier résultats avec un échantillon manuel.

### Nouvelles abréviations rencontrées
- PK | Primary Key | Identifiant unique d'une ligne | Interagit avec intégrité des tables, relations
- FK | Foreign Key | Référence vers clé primaire d'une autre table | Interagit avec JOIN, cohérence relationnelle

### Banque de questions du module (15)
1. QCM : `JOIN` sert à...  
   A. Joindre des tables liées B. Trier C. Supprimer
2. QCM : `LEFT JOIN` conserve...  
   A. Seulement la table droite B. Toutes lignes de gauche C. Lignes communes uniquement
3. QCM : Une `PK` est...  
   A. Unique B. Optionnelle doublonnable C. Un index visuel
4. QCM : Une `FK` sert à...  
   A. Chiffrer B. Relier tables C. Exporter CSV
5. Ouverte : Pourquoi vérifier un résultat SQL sur échantillon manuel ?
6. Ouverte : Différence `INNER JOIN` vs `LEFT JOIN`.
7. Mise en situation : Tu dois trouver clients inactifs, quelle stratégie SQL ?
8. QCM : `IS NULL` aide à...  
   A. Vérifier absence de valeur B. Compter toutes lignes C. Créer table
9. Ouverte : Que risques-tu si les clés sont mal définies ?
10. Mise en situation : Un agent apparaît avec 0 ticket, bug ou information utile ?
11. QCM : Trier "du plus récent" implique...  
    A. `ASC` B. `DESC` C. `LIMIT`
12. Ouverte : Pourquoi documenter anomalies de données ?
13. Mise en situation : Deux tables ont colonne `id`, comment éviter confusion ?
14. QCM : But d'un schéma relationnel propre ?  
    A. Complexifier B. Fiabiliser C. Décorer
15. Ouverte : Comment présenter ce travail SQL en entretien ?

---

## 4) Banque de questions (1h30)

### Objectifs d'apprentissage
- Mesurer la maîtrise réelle de J7.
- Entraîner format QCM + cas d'entretien technique.
- Préparer remédiation ciblée pour J8 (SQL avancé).

### Contenu pédagogique
Séquence:
1. Test mixte 45 min.
2. Correction argumentée 30 min.
3. Plan de correction 15 min.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Construire un test de 20 questions couvrant SQL base + agrégation + jointures.
   - **Corrigé détaillé** :
     - Répartition équilibrée des thèmes.
     - Progression du simple au complexe.
     - Alignement strict avec les acquis J7.

2. **Exercice 2 (intermédiaire)**  
   Classer 10 erreurs SQL (syntaxe, logique, lecture du besoin, vérification).
   - **Corrigé détaillé** :
     - Une cause principale par erreur.
     - Une action mesurable par erreur.
     - Plan de correction réalisable en 24h.

3. **Exercice 3 (avancé)**  
   Simuler oral technique: "Explique ta requête et son impact métier".
   - **Corrigé détaillé** :
     - Contexte métier.
     - Requête choisie + justification.
     - Résultat concret pour décision.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : But banque J7 ?  
   A. Trier élèves B. Mesurer et corriger C. Remplacer pratique
2. QCM : Une correction utile contient...  
   A. Réponse brute B. Raisonnement C. Copie
3. Ouverte : Pourquoi corriger immédiatement ?
4. Mise en situation : Bon QCM, mauvais cas pratiques. Que conclure ?
5. QCM : Une erreur de logique SQL signifie...  
   A. Faute de frappe seule B. Requête valide mais mauvais résultat C. Bug système
6. Ouverte : Quel indicateur suivre avant J8 ?
7. QCM : Remédiation efficace =  
   A. Vague B. Mesurable C. Reportée
8. Mise en situation : Tu oublies souvent `WHERE` sur update/delete, solution ?
9. Ouverte : Pourquoi justifier une requête devant un recruteur ?
10. QCM : Un progrès crédible se voit via...  
    A. Intuition B. Résultats + preuves C. Silence
11. Ouverte : Donne une phrase pro pour expliquer `GROUP BY`.
12. Mise en situation : Trop lent sur question JOIN, que réviser d'abord ?
13. QCM : Plan J8 doit cibler...  
    A. Points forts B. Points bloquants C. Sujets aléatoires
14. Ouverte : Différence entre connaître syntaxe et résoudre un besoin.
15. QCM : Résultat attendu ?  
    A. Théorie seule B. SQL opérationnel C. Pas d'évaluation

---

## 5) Suivi P1 (30 min)

### Objectifs d'apprentissage
- Transformer les requêtes J7 en preuves employables.
- Améliorer le CV/portfolio avec un mini-cas data.
- Aligner préparation J8 sur attentes du marché.

### Contenu pédagogique
Routine P1:
1. Ajouter une preuve SQL au portfolio.
2. Mettre à jour une ligne CV orientée impact.
3. Analyser 3 offres (support/data/dev) et ajuster révision.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Rédiger une ligne CV sur une analyse SQL réalisée.
   - **Corrigé détaillé** :
     - Verbe d'action + requête + résultat.
     - Donnée mesurable si possible.
     - Phrase claire en une ligne.

2. **Exercice 2 (intermédiaire)**  
   Écrire un pitch 60 secondes: "Ce que ton SQL a apporté".
   - **Corrigé détaillé** :
     - Problème métier.
     - Requête/synthèse.
     - Décision facilitée.

3. **Exercice 3 (avancé)**  
   Définir 3 priorités J8 mesurables.
   - **Corrigé détaillé** :
     - Priorité technique 1 (jointures avancées / modélisation).
     - Priorité technique 2 (transactions).
     - Priorité communication entretien.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : Objectif P1 après J7 ?  
   A. Attendre fin P2 B. Valoriser preuves SQL C. Ignorer marché
2. Ouverte : Pourquoi une preuve SQL concrète aide en recrutement junior ?
3. QCM : Une ligne CV crédible contient...  
   A. Promesse vague B. Action + résultat C. Emoji
4. Mise en situation : Tu as une bonne requête, mais pas d'explication métier.
5. Ouverte : Comment relier SQL à un poste support ?
6. QCM : Pitch efficace =  
   A. Long B. Problème→solution→impact C. Technique brute
7. Ouverte : Quelle preuve déposer dans portfolio ce soir ?
8. QCM : Priorités J8 doivent être...  
   A. Mesurables B. Aléatoires C. Facultatives
9. Mise en situation : Offre cible demande SQL + Excel, adaptation immédiate ?
10. Ouverte : Exemple de micro-indicateur de progrès SQL.
11. QCM : Preuve robuste =  
    A. Capture seule B. Requête + résultat + contexte C. Titre seul
12. Ouverte : Pourquoi adapter ton discours au type de poste ?
13. Mise en situation : Tu bloques oralement sur JOIN, routine rapide ?
14. QCM : Résultat P1 réussi =  
    A. CV inchangé B. CV/portfolio mis à jour C. Pas d'action
15. Ouverte : Action exacte à lancer avant J8 matin ?

---

## Validation qualité J7 (anti-superficiel)

### Livrables obligatoires fin de J7
1. 12 requêtes SQL fonctionnelles (lecture, filtres, tri, agrégations, jointures).  
2. 1 mini-rapport (5 à 10 lignes) expliquant 3 indicateurs produits.  
3. 1 requête `UPDATE`/`DELETE` sécurisée et justifiée (avec contrôle préalable).  
4. 1 exercice "clients sans commandes" validé et expliqué.  
5. 1 pitch oral 60 secondes prêt pour entretien SQL junior.

### Grille d'évaluation rapide (100 points)
- Maîtrise SQL base (SELECT/WHERE/ORDER/LIMIT): **25 pts**
- Agrégation (COUNT/SUM/AVG/GROUP BY/HAVING): **25 pts**
- Jointures et intégrité logique (PK/FK, LEFT JOIN): **25 pts**
- Vérification et qualité des résultats: **15 pts**
- Communication technique (écrit/oral): **10 pts**

### Seuil attendu
- **>= 75/100** : J7 validé, passage normal vers J8.  
- **60-74/100** : validé sous remédiation ciblée J8 matin.  
- **< 60/100** : consolidation SQL base obligatoire avant J8 avancé.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (SQL bases)
1. **B**  
2. **A**  
3. **B**  
4. **B**  
5. Pour éviter surconsommation, ambiguïté, et dépendance à des colonnes inutiles.  
6. DDL définit la structure; DML modifie les données.  
7. `LIKE` (ex: `%gmail%`).  
8. **B**  
9. Pour confirmer les lignes ciblées avant modification.  
10. `SELECT` de précontrôle → `DELETE ... WHERE id=...` → `SELECT` de vérification.  
11. **A**  
12. Ex: `WHERE statut='ouvert' AND (priorite='haute' OR priorite='moyenne')`.  
13. Suppression totale des données de la table (impact majeur).  
14. **A**  
15. SQL permet de retrouver, filtrer, résumer et fiabiliser l'information métier.

### B. Corrigé — Module 2 (Agrégation)
1. **B**  
2. **A**  
3. **B**  
4. `WHERE` avant regroupement; `HAVING` après regroupement.  
5. `AVG` pour valeur moyenne, `SUM` pour total cumulé.  
6. `GROUP BY region ORDER BY SUM(montant) DESC LIMIT 3`.  
7. **B**  
8. Pour éviter erreurs de frontière (ex: exactement 10 000).  
9. Vérifier valeurs nulles, jointures, filtres pré-agrégation.  
10. **A**  
11. Ex: "nombre de tickets ouverts par agent".  
12. `SELECT equipe, COUNT(*) FROM tickets WHERE statut='ouvert' GROUP BY equipe;`  
13. **A**  
14. Parce qu'elle produit des indicateurs directement utilisables en décision.  
15. **B**

### C. Corrigé — Module 3 (Base réelle)
1. **A**  
2. **B**  
3. **A**  
4. **B**  
5. Pour s'assurer que le résultat SQL correspond bien au réel métier.  
6. INNER = lignes correspondantes uniquement; LEFT = toutes lignes de gauche.  
7. `LEFT JOIN` + `WHERE commandes.id IS NULL`.  
8. **A**  
9. Incohérences de relations, doublons, requêtes trompeuses.  
10. Peut être utile (charge faible) ou révélateur d'affectation incomplète: vérifier contexte.  
11. **B**  
12. Pour fiabiliser décisions et déclencher actions de nettoyage.  
13. Préfixer colonnes par alias table (`c.id`, `co.id`).  
14. **B**  
15. Montrer besoin, requête, résultat, et impact opérationnel.

### D. Corrigé — Module 4 (Banque J7)
1. **B**  
2. **B**  
3. Pour consolider immédiatement et éviter répétition d'erreurs.  
4. Compréhension théorique correcte, transfert pratique insuffisant.  
5. **B**  
6. Taux de réussite sur cas SQL pratiques chronométrés + justifications orales.  
7. **B**  
8. Check-list obligatoire avant exécution (pré-SELECT + WHERE + recheck).  
9. Parce qu'en poste, on juge la pertinence métier, pas la syntaxe seule.  
10. **B**  
11. "GROUP BY me permet de transformer des lignes en indicateurs par catégorie."  
12. Revoir d'abord types de JOIN et conditions de liaison.  
13. **B**  
14. Syntaxe = outil; résolution = réponse au besoin réel avec validation.  
15. **B**

### E. Corrigé — Module 5 (Suivi P1)
1. **B**  
2. Parce qu'elle démontre immédiatement ta capacité opérationnelle data.  
3. **B**  
4. Ajouter contexte: "pourquoi cette requête aide une décision".  
5. Ex: prioriser incidents via comptage/statut et délais.  
6. **B**  
7. Une requête agrégée + capture résultat + explication en 3 lignes.  
8. **A**  
9. Réviser extraction SQL puis préparer mini synthèse Excel.  
10. Ex: "15 requêtes justes sur 18 en 40 min".  
11. **B**  
12. Pour être compréhensible et pertinent selon mission visée.  
13. Routine: respirer, annoncer plan 3 points, donner un exemple concret.  
14. **B**  
15. Publier preuve SQL J7 + planifier révision J8 priorité n°1.
