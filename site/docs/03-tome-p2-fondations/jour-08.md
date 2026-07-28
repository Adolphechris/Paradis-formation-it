# TOME P2 — Jour 08 (14h)

## Découpage horaire opérationnel J8
- SQL avancé (jointures, sous-requêtes, CTE, vues) — **6h**
- Modélisation de données (normalisation) — **3h**
- Transactions et fiabilité — **2h**
- Mini-projet base de données — **1h30**
- Banque de questions — **1h**
- Suivi P1 (recherche d'emploi, CV, veille) — **30 min**

---

## 1) SQL avancé (6h)

### Objectifs d'apprentissage
- Utiliser correctement `INNER JOIN`, `LEFT JOIN` et sous-requêtes.
- Construire des requêtes plus lisibles avec `CTE`.
- Créer une vue SQL simple pour réutiliser une logique d'analyse.
- Choisir la bonne technique selon le besoin métier.

### Contenu pédagogique
Après J7, on passe du SQL "lecture simple" au SQL "résolution de cas réels".

1. **Jointures avancées**
   - `INNER JOIN`: uniquement les correspondances.
   - `LEFT JOIN`: toutes les lignes de gauche, même sans correspondance.
   - Bon réflexe: alias (`c`, `co`, `t`) pour éviter ambiguïtés.

2. **Sous-requêtes**
   - Utiles pour filtrer selon un résultat intermédiaire.
   - Exemple: clients dont le total commandes > moyenne globale.

3. **CTE (`WITH`)**
   - Découpe une requête complexe en étapes lisibles.
   - Facilite débogage et explication en entretien.

4. **Vues**
   - `CREATE VIEW` pour encapsuler une requête récurrente.
   - Pratique pour reporting standard.

5. **Qualité**
   - Lisibilité > "requête monolithe".
   - Vérifier logique sur échantillon avant exécution large.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Lister clients et montant total de leurs commandes (y compris 0 commande).
   - **Corrigé détaillé** :
     - `LEFT JOIN` clients→commandes.
     - `COALESCE(SUM(...),0)` pour clients sans commande.
     - `GROUP BY` client.

2. **Exercice 2 (intermédiaire)**  
   Trouver les clients au-dessus du panier moyen global.
   - **Corrigé détaillé** :
     - Sous-requête pour calcul moyenne.
     - Agrégation par client.
     - Filtrer avec `HAVING`.

3. **Exercice 3 (avancé)**  
   Réécrire une requête complexe avec CTE en deux étapes claires.
   - **Corrigé détaillé** :
     - Étape 1: total par client (CTE).
     - Étape 2: filtrage/tri final.
     - Comparer lisibilité avant/après.

### Nouvelles abréviations rencontrées
- CTE | Common Table Expression | Bloc SQL temporaire nommé (`WITH`) | Interagit avec lisibilité, maintenance, debug des requêtes

### Banque de questions du module (15)
1. QCM : `LEFT JOIN` conserve...  
   A. Lignes communes seulement B. Toutes lignes de gauche C. Toutes lignes de droite
2. QCM : Une CTE commence par...  
   A. `SET` B. `WITH` C. `BEGIN`
3. QCM : Une sous-requête sert à...  
   A. Ignorer la logique B. Utiliser un résultat intermédiaire C. Créer index
4. Ouverte : Pourquoi une CTE améliore la maintenabilité ?
5. Ouverte : Différence `INNER JOIN` vs `LEFT JOIN`.
6. Mise en situation : Tu dois inclure clients sans commandes, quelle jointure ?
7. QCM : `COALESCE` sert à...  
   A. Trier B. Remplacer NULL C. Créer table
8. Ouverte : Quand créer une vue SQL ?
9. Mise en situation : Requête correcte mais illisible, première action ?
10. QCM : Alias de table servent à...  
    A. Décorer B. Clarifier et éviter ambiguïtés C. Supprimer colonnes
11. Ouverte : Pourquoi tester une requête complexe sur petit échantillon ?
12. Mise en situation : Deux requêtes donnent même résultat, laquelle garder ?
13. QCM : `WITH totaux AS (...)` est...  
    A. Vue permanente B. CTE C. Trigger
14. Ouverte : Comment expliquer une requête avancée à un manager ?
15. QCM : Objectif principal du bloc ?  
    A. Complexifier B. Mieux résoudre des besoins réels C. Éviter SQL

---

## 2) Modélisation de données (3h)

### Objectifs d'apprentissage
- Concevoir un schéma relationnel simple mais propre.
- Identifier entités, attributs, relations.
- Appliquer les principes 1NF/2NF/3NF de base.
- Prévenir redondances et incohérences de données.

### Contenu pédagogique
Un bon SQL dépend d'un bon modèle.

1. **Entités et relations**
   - Entité: objet métier (`Client`, `Commande`, `Produit`).
   - Relation: lien entre entités (un client passe plusieurs commandes).

2. **Clés**
   - PK: identifie une ligne.
   - FK: relie les tables.

3. **Normalisation**
   - 1NF: colonnes atomiques, pas de listes dans une cellule.
   - 2NF: dépendance complète à la clé.
   - 3NF: éviter dépendances transitives.

4. **ERD**
   - Diagramme entité-relation pour visualiser le schéma.
   - Outil de communication technique très utile en entretien.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Identifier entités et relations pour un mini système e-commerce.
   - **Corrigé détaillé** :
     - Entités minimales: clients, commandes, produits.
     - Relation commande-client (N:1), commande-produit (N:N via table liaison).
     - Vérifier cohérence métier.

2. **Exercice 2 (intermédiaire)**  
   Corriger une table non normalisée contenant `produits` séparés par virgules.
   - **Corrigé détaillé** :
     - Extraire lignes dans table de liaison.
     - Garder champs atomiques.
     - Re-vérifier conformité 1NF.

3. **Exercice 3 (avancé)**  
   Proposer un ERD propre pour tickets support + agents + clients.
   - **Corrigé détaillé** :
     - Définir PK/FK.
     - Définir cardinalités.
     - Contrôler absence de redondance majeure.

### Nouvelles abréviations rencontrées
- ERD | Entity Relationship Diagram | Représentation visuelle des tables et relations | Interagit avec modélisation, PK/FK, conception de base
- 1NF | First Normal Form | Première forme normale (atomicité des colonnes) | Interagit avec qualité des données, requêtage fiable
- 2NF | Second Normal Form | Deuxième forme normale (dépendance complète à la clé) | Interagit avec réduction redondance
- 3NF | Third Normal Form | Troisième forme normale (suppression dépendances transitives) | Interagit avec cohérence et maintenance

### Banque de questions du module (15)
1. QCM : 1NF impose surtout...  
   A. Colonnes atomiques B. Index obligatoires C. Trigger
2. QCM : Une FK sert à...  
   A. Relier tables B. Chiffrer C. Trier
3. QCM : ERD signifie...  
   A. Error Data Report B. Entity Relationship Diagram C. External Runtime Data
4. Ouverte : Pourquoi normaliser une base ?
5. Ouverte : Différence entre entité et attribut.
6. Mise en situation : Une colonne contient "A,B,C" dans une seule cellule. Problème ?
7. QCM : 3NF vise surtout...  
   A. Plus de doublons B. Moins de dépendances transitives C. Plus de tables au hasard
8. Ouverte : Donne un exemple de cardinalité 1-N.
9. Mise en situation : Tu dois modéliser tickets-clients-agents, première étape ?
10. QCM : PK doit être...  
    A. Unique B. Dupliquée C. Vide
11. Ouverte : Pourquoi un mauvais modèle coûte cher plus tard ?
12. Mise en situation : Deux équipes veulent des colonnes dupliquées "ville_client" partout.
13. QCM : 2NF traite...  
    A. Dépendance partielle B. Affichage C. CSS
14. Ouverte : Quel lien entre ERD et entretien technique ?
15. QCM : But du module ?  
    A. Faire joli B. Concevoir fiable C. Éviter SQL

---

## 3) Transactions et fiabilité (2h)

### Objectifs d'apprentissage
- Comprendre `BEGIN`, `COMMIT`, `ROLLBACK`.
- Saisir les propriétés ACID en contexte concret.
- Sécuriser une opération multi-étapes.

### Contenu pédagogique
Une transaction protège la cohérence quand plusieurs opérations doivent réussir ensemble.

1. **Cycle transactionnel**
   - `BEGIN` démarre.
   - `COMMIT` valide.
   - `ROLLBACK` annule.

2. **ACID**
   - Atomicité: tout ou rien.
   - Cohérence: état valide avant/après.
   - Isolation: transactions concurrentes contrôlées.
   - Durabilité: données validées persistent.

3. **Cas métier**
   - Transfert de montant entre comptes.
   - Création commande + lignes commande + log événement.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Écrire un scénario transactionnel de transfert simple.
   - **Corrigé détaillé** :
     - Débiter compte A, créditer compte B.
     - `COMMIT` seulement si les deux réussissent.
     - Sinon `ROLLBACK`.

2. **Exercice 2 (intermédiaire)**  
   Simuler une erreur après la première étape et montrer l'annulation.
   - **Corrigé détaillé** :
     - `BEGIN`.
     - Update 1 OK, update 2 échoue.
     - `ROLLBACK` puis vérification état initial.

3. **Exercice 3 (avancé)**  
   Expliquer pourquoi une opération sans transaction peut corrompre les données.
   - **Corrigé détaillé** :
     - Décrire état intermédiaire incohérent.
     - Montrer impact métier.
     - Proposer correction transactionnelle.

### Nouvelles abréviations rencontrées
- ACID | Atomicity Consistency Isolation Durability | Propriétés de fiabilité d'une transaction | Interagit avec intégrité des données, concurrence, sécurité métier
- TCL | Transaction Control Language | Commandes de contrôle transactionnel (`COMMIT`, `ROLLBACK`) | Interagit avec DML, fiabilité, reprise sur erreur

### Banque de questions du module (15)
1. QCM : `ROLLBACK` sert à...  
   A. Valider B. Annuler transaction C. Créer vue
2. QCM : ACID "A" signifie...  
   A. Access B. Atomicity C. Allocation
3. QCM : `COMMIT` signifie...  
   A. Annuler B. Valider C. Filtrer
4. Ouverte : Pourquoi transaction indispensable en transfert de fonds ?
5. Ouverte : Différence entre échec partiel et transaction ACID.
6. Mise en situation : Une étape sur 3 échoue, que faire ?
7. QCM : TCL concerne...  
   A. Tri B. Contrôle transactionnel C. UI
8. Ouverte : Donne un exemple concret de cohérence.
9. Mise en situation : Deux utilisateurs modifient la même ligne en même temps.
10. QCM : Durabilité signifie...  
    A. Volatile B. Persistant après commit C. Temporaire
11. Ouverte : Que risque-t-on sans `ROLLBACK` ?
12. Mise en situation : Tu vois des soldes incohérents en production.
13. QCM : `BEGIN` fait...  
    A. Lance transaction B. Supprime table C. Compte lignes
14. Ouverte : Comment expliquer ACID à un non-technique ?
15. QCM : Objectif du module ?  
    A. Réduire qualité B. Fiabiliser opérations C. Décorer SQL

---

## 4) Mini-projet base de données (1h30)

### Objectifs d'apprentissage
- Concevoir un mini schéma relationnel propre.
- Implémenter requêtes clés (lecture, agrégation, jointure, transaction simple).
- Produire un livrable défendable en entretien junior.

### Contenu pédagogique
Mini-projet J8: **Base "support commercial"**.

Livrables:
1. Schéma (clients, commandes, tickets).
2. 8 requêtes utiles (dont 2 agrégations, 2 jointures).
3. 1 scénario transactionnel documenté.
4. 1 mini-note d'analyse métier.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Définir les 3 tables principales avec PK/FK.
   - **Corrigé détaillé** :
     - Clés explicites.
     - Types cohérents.
     - Contraintes minimales.

2. **Exercice 2 (intermédiaire)**  
   Écrire requête "top 5 clients par CA" + tickets ouverts associés.
   - **Corrigé détaillé** :
     - Agrégation CA.
     - Jointure tickets.
     - Tri et limite.

3. **Exercice 3 (avancé)**  
   Documenter un scénario ACID lié à annulation commande.
   - **Corrigé détaillé** :
     - Étapes transactionnelles.
     - Cas d'erreur + rollback.
     - Vérification finale cohérence.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : Un mini-projet utile doit livrer...  
   A. Théorie seule B. Schéma + requêtes + preuve C. Slides uniquement
2. QCM : Top clients par CA nécessite...  
   A. SUM + GROUP BY B. DELETE C. ALTER
3. Ouverte : Pourquoi inclure un scénario transactionnel dans le projet ?
4. Mise en situation : Le modèle marche mais contient redondance évidente.
5. QCM : Une preuve forte en entretien est...  
   A. "j'ai compris" B. requête + résultat + justification C. promesse
6. Ouverte : Quelle erreur fréquente éviter dans un mini-projet SQL ?
7. QCM : Le rapport final doit être...  
   A. Flou B. Actionnable C. Hors sujet
8. Mise en situation : Tu n'as pas fini toutes requêtes, que prioriser ?
9. Ouverte : Comment démontrer la qualité de ton schéma ?
10. QCM : Jointure + agrégation servent à...  
    A. Analyse métier B. Style C. Compilation
11. Ouverte : Comment garder projet lisible pour un recruteur ?
12. Mise en situation : Tu détectes données incohérentes pendant démo.
13. QCM : Le MVP du projet J8 doit inclure...  
    A. Transactions optionnelles B. Cas critique fiabilisé C. Pas de tests
14. Ouverte : Quel lien entre mini-projet J8 et employabilité rapide ?
15. QCM : But du bloc ?  
    A. Impressionner visuellement B. Prouver compétence opérationnelle C. Retarder J9

---

## 5) Banque de questions (1h) + suivi P1 (30 min)

### Objectifs d'apprentissage
- Vérifier maîtrise de J8 sous contrainte temps.
- Transformer immédiatement les acquis en preuve de candidature.

### Contenu pédagogique
Séquence recommandée:
1. 40 min épreuve mixte.
2. 20 min correction et plan J9.
3. 30 min mise à jour CV/portfolio + veille offres.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Construire une mini-épreuve de 15 questions ciblées J8.
   - **Corrigé détaillé** :
     - Couvrir SQL avancé + modélisation + transactions.
     - Progression simple→complexe.
     - Correction immédiatement après.

2. **Exercice 2 (intermédiaire)**  
   Rédiger une ligne CV + pitch 45 sec sur ton mini-projet J8.
   - **Corrigé détaillé** :
     - Action + techno + impact.
     - Pitch: problème→solution→résultat.
     - Ton factuel.

3. **Exercice 3 (avancé)**  
   Définir plan J9 en 3 priorités mesurables.
   - **Corrigé détaillé** :
     - Priorité 1: lacune SQL détectée.
     - Priorité 2: consolidation réseau J9.
     - Priorité 3: communication technique.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : Objectif de l'épreuve finale J8 ?  
   A. Retarder progression B. Valider compétences C. Remplacer pratique
2. Ouverte : Pourquoi corriger tout de suite après test ?
3. QCM : Une ligne CV efficace contient...  
   A. Jargon vide B. Fait mesurable C. Phrase vague
4. Mise en situation : Bon SQL, mauvaise explication orale. Priorité ?
5. Ouverte : Comment relier J8 à poste support/data junior ?
6. QCM : Plan J9 doit être...  
   A. Mesurable B. Flou C. Inutile
7. Ouverte : Quelle preuve publier ce soir dans portfolio ?
8. QCM : Un pitch pro suit...  
   A. Problème→solution→impact B. Détails sans fin C. Liste d'outils seule
9. Mise en situation : Tu bloques sur ACID en entretien, réaction rapide ?
10. Ouverte : Micro-indicateur de progression pertinent.
11. QCM : Une remédiation utile est...  
    A. "mieux travailler" B. "2 exercices CTE + 1 cas transaction" C. "plus tard"
12. Ouverte : Pourquoi adapter ton vocabulaire au recruteur ?
13. Mise en situation : Tu as peu de temps, quoi prioriser avant J9 ?
14. QCM : Résultat P1 réussi =  
    A. CV inchangé B. CV + preuve + plan C. rien
15. Ouverte : Action exacte à lancer avant demain.

---

## Validation qualité J8 (anti-superficiel)

### Livrables obligatoires fin de J8
1. Schéma relationnel propre (PK/FK + cardinalités lisibles).  
2. 10 requêtes SQL avancées fonctionnelles (join, agrégation, sous-requête/CTE).  
3. 1 vue SQL utile au reporting.  
4. 1 scénario transactionnel ACID documenté avec rollback.  
5. 1 mini-note métier (5 à 10 lignes) expliquant l'impact des résultats.

### Grille d'évaluation rapide (100 points)
- SQL avancé (join/sous-requête/CTE/vues): **30 pts**
- Modélisation (normalisation, PK/FK, cohérence): **25 pts**
- Transactions (ACID, TCL, robustesse): **20 pts**
- Qualité des preuves (tests, vérifications, résultats): **15 pts**
- Communication technique (écrit/oral candidature): **10 pts**

### Seuil attendu
- **>= 78/100** : J8 validé, prêt pour J9.  
- **65-77/100** : validé sous remédiation ciblée.  
- **< 65/100** : consolidation SQL avancé requise.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (SQL avancé)
1. **B**  
2. **B**  
3. **B**  
4. Parce qu'elle découpe la logique en blocs lisibles et vérifiables.  
5. INNER = correspondances; LEFT = toutes lignes de gauche + correspondances éventuelles.  
6. `LEFT JOIN`.  
7. **B**  
8. Quand une logique de requête est récurrente en reporting.  
9. Refactoriser avec CTE/alias et étapes claires.  
10. **B**  
11. Pour valider logique et éviter impact massif en cas d'erreur.  
12. La plus lisible, maintenable, et validée sur données réelles.  
13. **B**  
14. Expliquer besoin, étapes SQL, résultat métier.  
15. **B**

### B. Corrigé — Module 2 (Modélisation)
1. **A**  
2. **A**  
3. **B**  
4. Réduire redondances, incohérences et faciliter maintenance/requêtes.  
5. Entité = objet métier; attribut = propriété de l'entité.  
6. Oui: non atomique, viole 1NF; il faut table de liaison.  
7. **B**  
8. Ex: un client passe plusieurs commandes (1-N).  
9. Identifier entités puis relations et cardinalités.  
10. **A**  
11. Requêtes plus complexes, anomalies et coûts de maintenance élevés.  
12. Refuser duplication inutile, normaliser et référencer via FK.  
13. **A**  
14. ERD montre ta capacité à concevoir avant coder.  
15. **B**

### C. Corrigé — Module 3 (Transactions)
1. **B**  
2. **B**  
3. **B**  
4. Parce qu'une étape échoue sinon et laisse un état incohérent.  
5. ACID garantit tout-ou-rien + cohérence; échec partiel sans ACID corrompt.  
6. `ROLLBACK`.  
7. **B**  
8. Ex: solde final cohérent après débit/crédit.  
9. Problème d'isolation/concurrence; verrouillage/niveau isolation à gérer.  
10. **B**  
11. Données partielles incohérentes et décisions erronées.  
12. Auditer transactions et imposer séquences BEGIN/COMMIT/ROLLBACK.  
13. **A**  
14. "Soit tout passe, soit rien ne change."  
15. **B**

### D. Corrigé — Module 4 (Mini-projet DB)
1. **B**  
2. **A**  
3. Pour prouver la robustesse sur cas critique métier.  
4. Refactoriser schéma avant d'ajouter fonctionnalités.  
5. **B**  
6. Oublier contraintes PK/FK et vérifications de résultat.  
7. **B**  
8. Prioriser MVP: schéma propre + requêtes cœur + transaction critique.  
9. Montrer normalisation, clés, et absence de duplications majeures.  
10. **A**  
11. Nommer clairement requêtes, commenter brièvement objectif, montrer résultat.  
12. Signaler, isoler cas, corriger données ou règle de jointure.  
13. **B**  
14. Il prouve que tu peux produire une analyse SQL utilisable rapidement.  
15. **B**

### E. Corrigé — Module 5 (Banque + P1)
1. **B**  
2. Pour consolider pendant que les erreurs sont encore fraîches.  
3. **B**  
4. Priorité: entraîner explication structurée avec exemple concret.  
5. En montrant comment SQL aide à prioriser incidents et décisions.  
6. **A**  
7. Requête CTE + résultat + mini interprétation métier.  
8. **A**  
9. Donner définition simple + exemple transfert/commande.  
10. Ex: "80% de cas SQL avancés résolus en moins de 45 min".  
11. **B**  
12. Pour rester compréhensible et pertinent selon rôle ciblé.  
13. Finaliser une preuve publiable et préparer starter J9 réseau.  
14. **B**  
15. Publier livrable J8 + planifier remédiation ciblée 30 min.
