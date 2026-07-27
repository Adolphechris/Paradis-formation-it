# TOME P3-B — Jour 19 (14h)

## Découpage horaire opérationnel J19
- SQL analytique avancé (fonctions fenêtres, CTE récursives, agrégations complexes) — **4h**
- Modélisation de données (normalisation, schémas en étoile, conception analytique) — **4h**
- Data cleaning et préparation (qualité des données, ETL, pipelines) — **3h**
- Labs intégrés (SQL analytique + nettoyage sur données réelles) — **2h**
- Banque de questions + suivi P1 — **1h**

---

## 1) SQL analytique avancé (4h)

### Objectifs d'apprentissage
- Maîtriser les fonctions fenêtres (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, SUM OVER).
- Écrire des CTE récursives pour explorer des hiérarchies.
- Réaliser des agrégations complexes (ROLLUP, CUBE, GROUPING SETS).
- Différencier les jointures analytiques (self-join, anti-join, semi-join).
- Optimiser les requêtes analytiques (index, EXPLAIN, plan d'exécution).

### Contenu pédagogique
Le SQL analytique va au-delà du SELECT-GROUP BY. Il permet de répondre à des questions métier complexes : "Quel est le top 3 par catégorie ?", "Quelle est l'évolution mois par mois ?", "Quels employés n'ont jamais fait de vente ?"

Points clés:
1. **Fonctions fenêtres (WINDOW functions)** : appliquent un calcul sur un sous-ensemble de lignes (fenêtre) sans réduire le nombre de lignes, contrairement à GROUP BY.
   - `ROW_NUMBER() OVER (PARTITION BY catégorie ORDER BY montant DESC)` → numérote les lignes au sein de chaque catégorie.
   - `RANK() OVER (...)` → même rang pour les ex-aequo (trou : 1, 2, 2, 4).
   - `DENSE_RANK() OVER (...)` → même rang sans trou (1, 2, 2, 3).
   - `LAG(colonne, 1) OVER (ORDER BY date)` → valeur de la ligne précédente (évolution).
   - `LEAD(colonne, 1) OVER (...)` → valeur de la ligne suivante.
   - `SUM(colonne) OVER (PARTITION BY catégorie ORDER BY date)` → somme cumulative.
2. **CTE récursives (WITH RECURSIVE)** : parcourent des structures hiérarchiques (organigramme, arborescence de catégories). Structure : `WITH RECURSIVE cte AS (SELECT ... UNION ALL SELECT ... FROM cte JOIN table ON condition)`. Attention à la condition d'arrêt pour éviter les boucles infinies.
3. **Agrégations multi-niveaux** :
   - `ROLLUP(a, b)` → (a,b), (a), () — agrégation hiérarchique (sous-totaux par a, puis total général).
   - `CUBE(a, b)` → toutes les combinaisons : (a,b), (a), (b), () — pour les tableaux croisés.
   - `GROUPING SETS((a), (b), ())` → uniquement les combinaisons spécifiées.
4. **Jointures analytiques** :
   - **Self-join** : joindre une table à elle-même (ex: trouver les employés qui gagnent plus que leur manager).
   - **Anti-join** : `NOT EXISTS` ou `LEFT JOIN ... WHERE ... IS NULL` — trouver les éléments sans correspondance (ex: clients sans commande).
   - **Semi-join** : `EXISTS` — vérifier l'existence sans ramener les données (ex: catégories ayant au moins un produit).
5. **Optimisation** : toujours vérifier le plan d'exécution (`EXPLAIN ANALYZE`) pour les requêtes analytiques. Créer des index sur les colonnes de PARTITION BY et ORDER BY. Éviter les CTE récursives sur de très grands volumes.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : écrire une requête qui affiche pour chaque vendeur ses 3 meilleures ventes (montant), avec le rang. Utiliser ROW_NUMBER().
   - **Corrigé détaillé** : `SELECT * FROM (SELECT vendeur, montant, date_vente, ROW_NUMBER() OVER (PARTITION BY vendeur ORDER BY montant DESC) AS rang FROM ventes) sub WHERE rang <= 3;`. Expliquer : PARTITION BY crée des groupes par vendeur, ORDER BY trie par montant décroissant, ROW_NUMBER attribue 1 au plus gros montant. La sous-requête est nécessaire car on ne peut pas filtrer sur une fonction fenêtre directement dans WHERE.
2. **Exercice 2 (intermédiaire)** : calculer l'évolution mensuelle du chiffre d'affaires (mois en cours vs mois précédent) avec LAG(). Afficher mois, CA, CA_mois_précédent, évolution en %.
   - **Corrigé détaillé** : `WITH ca_mensuel AS (SELECT DATE_TRUNC('month', date_vente) AS mois, SUM(montant) AS ca FROM ventes GROUP BY 1) SELECT mois, ca, LAG(ca, 1) OVER (ORDER BY mois) AS ca_precedent, ROUND((ca - LAG(ca, 1) OVER (ORDER BY mois)) / LAG(ca, 1) OVER (ORDER BY mois) * 100, 1) AS evolution_pct FROM ca_mensuel ORDER BY mois;`. La première ligne aura `ca_precedent = NULL` (pas de mois précédent).
3. **Exercice 3 (avancé)** : analyser un arbre hiérarchique de catégories de produits (colonne `parent_id`). Écrire une CTE récursive qui part d'une catégorie racine et liste toutes ses sous-catégories avec leur profondeur. Ajouter le nombre de produits dans chaque sous-catégorie.
   - **Corrigé détaillé** : `WITH RECURSIVE arbre AS (SELECT id, nom, parent_id, 0 AS profondeur FROM categories WHERE parent_id IS NULL UNION ALL SELECT c.id, c.nom, c.parent_id, a.profondeur + 1 FROM categories c JOIN arbre a ON c.parent_id = a.id) SELECT a.id, a.nom, a.profondeur, COUNT(p.id) AS nb_produits FROM arbre a LEFT JOIN produits p ON p.categorie_id = a.id GROUP BY a.id, a.nom, a.profondeur ORDER BY a.profondeur, a.nom;`. UNION ALL combine la requête de base (racine) avec l'appel récursif. La condition d'arrêt implicite = plus de lignes retournées par la partie récursive.

### Nouvelles abréviations rencontrées
- OLAP | Online Analytical Processing | Traitement analytique en ligne (requêtes multidimensionnelles) | Interagit avec les fonctions fenêtres, ROLLUP/CUBE, les data warehouses

### Banque de questions du module (15)
1. QCM: une fonction fenêtre s'applique sur... A) un sous-ensemble de lignes sans les réduire B) toute la table sans condition C) une seule ligne
2. QCM: `ROW_NUMBER()` vs `RANK()` — différence sur ex-aequo ? A) RANK crée un trou, ROW_NUMBER non B) ROW_NUMBER crée un trou, RANK non C) identiques
3. QCM: une CTE récursive utilise... A) UNION ALL B) UNION uniquement C) INTERSECT
4. Ouverte: différence entre WHERE et PARTITION BY dans une fonction fenêtre.
5. Ouverte: à quoi sert LAG() dans un contexte business ?
6. Cas: `ROW_NUMBER() OVER (PARTITION BY service ORDER BY salaire DESC)` retourne 1 pour chaque service. Interprétation ?
7. QCM: ROLLUP(a, b) produit... A) (a,b), (a), () B) (a,b) uniquement C) toutes les combinaisons
8. Ouverte: quand utiliser un anti-join plutôt qu'un NOT IN ?
9. Cas: requête analytique très lente (10 secondes). Par où commencer l'optimisation ?
10. QCM: `LEAD(colonne)` retourne... A) la valeur de la ligne suivante B) la valeur de la ligne précédente C) la moyenne
11. Ouverte: pourquoi une CTE récursive a besoin d'une condition d'arrêt ?
12. Cas: top 5 clients par région. Quelle fonction fenêtre utiliser ?
13. QCM: `EXPLAIN ANALYZE` sert à... A) voir le plan d'exécution B) exécuter plus vite C) supprimer des données
14. Ouverte: avantage des fonctions fenêtres par rapport aux sous-requêtes corrélées ?
15. QCM: résultat attendu du module 1 = A) écrire des requêtes analytiques complexes B) mémoriser la syntaxe C) éviter le SQL

---

## 2) Modélisation de données (4h)

### Objectifs d'apprentissage
- Comprendre la modélisation relationnelle (normalisation 1NF à 3NF).
- Distinguer les modèles OLTP (transactionnel) et OLAP (analytique).
- Concevoir un schéma en étoile (star schema) avec tables de faits et dimensions.
- Appliquer les bonnes pratiques de naming et de typage.
- Modéliser des cas métier réels en schémas SQL.

### Contenu pédagogique
La modélisation détermine la qualité des données pour les années à venir. Un mauvais schéma coûte cher en maintenance et en performance.

Points clés:
1. **Rappel normalisation (1NF-3NF)** : 1NF = atomicité (une valeur par cellule). 2NF = dépendance complète à la clé primaire (pas de dépendance partielle). 3NF = pas de dépendance transitive (un attribut non-clé ne dépend pas d'un autre attribut non-clé). La 3NF est le standard pour les bases OLTP.
2. **OLTP vs OLAP** : OLTP (Online Transaction Processing) = optimisé pour les écritures rapides, beaucoup de petites transactions, schéma normalisé. OLAP (Online Analytical Processing) = optimisé pour les lectures et agrégations, schéma dénormalisé (étoile/flocon).
3. **Schéma en étoile (star schema)** : une table centrale de **faits** (mesures numériques : montant, quantité, durée) entourée de tables de **dimensions** (attributs descriptifs : temps, produit, client, région). Avantages : requêtes simples (une jointure par dimension), rapides (index efficaces), compréhensibles par les utilisateurs métier.
4. **Table de faits** : contient les clés étrangères vers les dimensions + les mesures. Granularité = niveau de détail (une ligne par transaction ? par jour ? par mois ?). La granularité est la décision la plus importante : trop fine = volume énorme, trop grosse = perte d'information.
5. **Tables de dimensions** : contiennent les attributs descriptifs. Une dimension "temps" avec date, jour_semaine, mois, trimestre, année, jour_ferie. Une dimension "produit" avec nom, catégorie, prix, fournisseur. Les dimensions changent lentement (SCD — Slowly Changing Dimension).
6. **Bonnes pratiques** : noms de tables au singulier ou pluriel (choisir et s'y tenir), clés primaires nommées `id` ou `table_id`, clés étrangères nommées `table_source_id`, pas d'espaces ni de caractères spéciaux, colonnes booléennes préfixées `is_` ou `has_`, dates en `DATE` ou `TIMESTAMP` (pas de VARCHAR).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : normaliser en 3NF un tableau Excel "commandes" contenant : num_commande, date, client_nom, client_adresse, produit_nom, produit_prix, quantité, total. Identifier les entités et leurs relations.
   - **Corrigé détaillé** : Problèmes : client_nom et client_adresse répétés à chaque commande du même client (2NF), produit_prix dépend uniquement de produit_nom (3NF transitive via produit), total est calculable (quantité × produit_prix, redondant). Schéma normalisé : `clients(id, nom, adresse)`, `produits(id, nom, prix)`, `commandes(id, date, client_id)`, `lignes_commande(id, commande_id, produit_id, quantité)`. Le total se calcule, pas de stockage redondant.
2. **Exercice 2 (intermédiaire)** : concevoir un schéma en étoile pour analyser les ventes d'une chaîne de magasins. Identifier la table de faits, au moins 4 dimensions, et leur granularité. Justifier les choix.
   - **Corrigé détaillé** : Table de faits `ventes` : date_id (FK), magasin_id (FK), produit_id (FK), promo_id (FK), montant, quantité, marge. Granularité = une ligne par produit vendu par magasin par jour. Dimensions : `dim_temps` (date, jour, mois, trimestre, annee, jour_semaine), `dim_magasin` (nom, ville, région, surface), `dim_produit` (nom, catégorie, sous_catégorie, prix_unitaire), `dim_promo` (type, taux_reduction, date_debut, date_fin). Justification : chaque jointure répond à une question métier (ventes par mois/par région/par catégorie/avec promo).
3. **Exercice 3 (avancé)** : une table unique "logs_applicatifs" (500 M lignes) contient : timestamp, user_id, action, page, durée_ms, erreur. Proposer une modélisation pour l'analyse (agrégations quotidiennes, analyse par utilisateur, détection d'anomalies). Inclure les compromis (volume vs granularité).
   - **Corrigé détaillé** : Table de faits `faits_logs` : granularité = une ligne par heure par utilisateur par page (pas par log brut — trop volumineux). Mesures : nb_appels, duree_moyenne, duree_p95, nb_erreurs. Dimensions : `dim_temps` (timestamp → heure, jour, mois), `dim_utilisateur` (user_id, type_utilisateur, service), `dim_page` (url, module, version). Compromis : on perd la capacité d'analyser au niveau du log individuel, mais on gagne des performances (table agrégée de 50 M au lieu de 500 M). On garde les logs bruts en archivage pour les enquêtes forensiques.

### Nouvelles abréviations rencontrées
- OLTP | Online Transaction Processing | Base de données optimisée pour les transactions (écritures rapides) | Interagit avec la normalisation, les SGBD, les applications métier
- SCD | Slowly Changing Dimension | Dimension dont les attributs changent lentement (ex: adresse client) | Interagit avec les schémas en étoile, l'historisation, l'ETL

### Banque de questions du module (15)
1. QCM: la 3NF élimine... A) les dépendances transitives B) les clés primaires C) les jointures
2. QCM: un schéma en étoile a... A) une table de faits centrale B) des tables sans relations C) une seule table
3. QCM: OLTP est optimisé pour... A) les transactions rapides B) les agrégations lourdes C) les backups
4. Ouverte: pourquoi dénormaliser pour l'analytique (OLAP) ?
5. Ouverte: qu'est-ce que la granularité d'une table de faits ?
6. Cas: une table "ventes" contient `client_nom` et `client_adresse`. Problème ?
7. QCM: une SCD gère... A) les changements lents d'attributs B) les suppressions C) les index
8. Ouverte: différence entre OLTP et OLAP en une phrase.
9. Cas: la table de faits fait 2 milliards de lignes, les requêtes sont lentes. Solutions ?
10. QCM: dans un schéma en étoile, les dimensions sont reliées à... A) la table de faits B) entre elles C) rien
11. Ouverte: pourquoi choisir une granularité journalière plutôt qu'horaire ?
12. Cas: besoin d'analyser les ventes par catégorie de produit et par région. Quelles dimensions créer ?
13. QCM: `date_id` dans une table de faits est une... A) clé étrangère vers dim_temps B) mesure C) contrainte
14. Ouverte: comment expliquer un schéma en étoile à un responsable métier ?
15. QCM: résultat attendu du module 2 = A) modéliser des schémas adaptés à l'usage B) créer des tables au hasard C) ignorer la normalisation

---

## 3) Data cleaning et préparation (3h)

### Objectifs d'apprentissage
- Identifier les problèmes de qualité de données (valeurs manquantes, doublons, incohérences, formats).
- Appliquer des stratégies de nettoyage adaptées (suppression, imputation, correction).
- Construire un pipeline ETL simple (Extract, Transform, Load).
- Documenter les décisions de nettoyage (traçabilité, reproductibilité).
- Valider la qualité après nettoyage (contrôles, assertions).

### Contenu pédagogique
"Garbage in, garbage out." 80% du temps d'un data analyst est consacré au nettoyage des données. Des données sales mènent à des conclusions fausses.

Points clés:
1. **Problèmes courants** :
   - **Valeurs manquantes (NULL/NaN)** : champs vides, N/A, "null", "—". À traiter selon le contexte : suppression si <5% et aléatoire, imputation (moyenne, médiane, mode) si structuré, flag `is_missing` si l'absence est une information.
   - **Doublons** : lignes identiques ou quasi-identiques. Identifier avec `GROUP BY` + `HAVING COUNT(*) > 1` ou `ROW_NUMBER() OVER (PARTITION BY colonnes_clés)`.
   - **Incohérences** : date de naissance > date de commande, âge négatif, pays et ville incohérents. Définir des règles métier et les vérifier systématiquement.
   - **Formats** : dates (DD/MM/YYYY vs YYYY-MM-DD), nombres (virgule vs point), unités (€, K€, M€). Standardiser en amont.
2. **Imputation** : remplacer les valeurs manquantes par une estimation. Méthodes : moyenne (simple mais biaisée), médiane (robuste aux outliers), mode (catégoriel), forward-fill (séries temporelles), k-NN (basé sur les plus proches voisins). Toujours documenter la méthode et son impact potentiel.
3. **Pipeline ETL** : Extract (lire depuis CSV, API, DB), Transform (nettoyer, normaliser, enrichir), Load (écrire dans la table de destination). Outils : Python/pandas, SQL, Talend, Airflow, dbt. Le pipeline doit être idempotent (le relancer ne crée pas de doublons).
4. **Documentation** : tenir un journal de nettoyage : quelle règle appliquée, combien de lignes affectées, justification. Exemple : "Suppression de 12 doublons (0.1% des données) basés sur (email, date) — conservation du premier enregistrement."
5. **Validation post-nettoyage** : contrôles automatiques — nombre de lignes attendu, pas de NULL dans les colonnes critiques, sommes cohérentes avant/après, plages de valeurs valides (âge entre 0 et 120), unicité des clés.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : nettoyer un CSV "clients.csv" contenant : doublons exacts, emails en majuscule/minuscule, dates au format FR (DD/MM/YYYY), numéros de téléphone avec espaces/tirets. Produire un CSV propre.
   - **Corrigé détaillé** : 1) `df = pd.read_csv('clients.csv')` ; 2) `df.drop_duplicates(inplace=True)` ; 3) `df['email'] = df['email'].str.lower().str.strip()` ; 4) `df['date_naissance'] = pd.to_datetime(df['date_naissance'], format='%d/%m/%Y')` ; 5) `df['tel'] = df['tel'].str.replace(r'[\s-]', '', regex=True)` ; 6) `df.to_csv('clients_clean.csv', index=False)`. Journal : 5 doublons supprimés, 150 emails normalisés, 3 dates corrigées (format invalide → NaN → date manuelle).
2. **Exercice 2 (intermédiaire)** : une colonne "salaire" a 8% de valeurs manquantes. Comparer l'impact de 3 stratégies (suppression, imputation par médiane par service, imputation par moyenne globale) sur la moyenne et la médiane. Recommander.
   - **Corrigé détaillé** : Données initiales : moyenne=45K, médiane=40K. (a) Suppression : moyenne=46K, médiane=41K (les lignes supprimées étaient légèrement sous-payées). (b) Imputation médiane par service : moyenne=45.3K, médiane=40K (proche de l'original, préserve la distribution par service). (c) Imputation moyenne globale : moyenne=45K (inchangée car on remplace par la moyenne), médiane=42K (tirée vers la moyenne). Recommandation : (b) imputation par médiane par service — préserve le mieux la structure des données.
3. **Exercice 3 (avancé)** : construire un mini-pipeline ETL Python qui : lit des logs bruts JSON, parse les timestamps, filtre les erreurs 5xx, agrège par heure, enrichit avec le jour de la semaine, charge dans un CSV propre. Rendre le script idempotent.
   - **Corrigé détaillé** : Script structuré : `extract()` → `pd.read_json('logs.json')` ; `transform()` → `df['timestamp'] = pd.to_datetime(df['timestamp'])`, `df['heure'] = df['timestamp'].dt.floor('H')`, `df['jour_semaine'] = df['timestamp'].dt.day_name()`, `df_5xx = df[df['status'].between(500, 599)]`, `df_agg = df_5xx.groupby(['heure', 'jour_semaine', 'url']).agg(nb_erreurs=('status', 'count'), temps_moyen=('duree_ms', 'mean')).reset_index()` ; `load()` → `df_agg.to_csv('erreurs_agg.csv')`. Idempotence : vider le CSV de sortie avant écriture ou utiliser `mode='w'`.

### Nouvelles abréviations rencontrées
- ETL | *(déjà existant, section E)* | Extract, Transform, Load — pipeline de préparation de données | Interagit avec les sources hétérogènes, le nettoyage, les data warehouses

### Banque de questions du module (15)
1. QCM: le nettoyage de données consiste à... A) détecter et corriger les problèmes B) supprimer toutes les données C) ignorer les erreurs
2. QCM: l'imputation consiste à... A) remplacer les valeurs manquantes B) supprimer les colonnes C) ajouter des lignes
3. QCM: un pipeline ETL fait... A) Extraire, Transformer, Charger B) Effacer, Trier, Lire C) Envoyer, Tester, Logger
4. Ouverte: pourquoi est-il risqué de supprimer toutes les lignes avec des valeurs manquantes ?
5. Ouverte: différence entre imputation par moyenne et par médiane.
6. Cas: `df['age'].describe()` montre un max de 250. Que faire ?
7. QCM: un doublon se détecte avec... A) GROUP BY + HAVING COUNT(*) > 1 B) DELETE C) SELECT *
8. Ouverte: pourquoi documenter les décisions de nettoyage ?
9. Cas: après nettoyage, la somme des ventes a baissé de 5%. Inquiétant ?
10. QCM: idempotent signifie que relancer le pipeline... A) donne le même résultat B) crée des doublons C) supprime tout
11. Ouverte: comment valider qu'un nettoyage n'a pas introduit de biais ?
12. Cas: colonne "pays" contient "France", "FR", "france", "Fr.". Solution ?
13. QCM: objectif du module 3 = A) préparer des données propres et fiables B) masquer les problèmes C) éviter le nettoyage
14. Ouverte: pourquoi normaliser les formats de date avant analyse ?
15. QCM: résultat attendu = A) pipeline de nettoyage reproductible B) données brutes C) aucun contrôle qualité

---

## 4) Labs intégrés — SQL analytique + nettoyage (2h)

### Objectifs d'apprentissage
- Appliquer les compétences J19 sur un cas complet et réaliste.
- Enchaîner nettoyage de données et analyse SQL avancée.
- Produire un rapport d'analyse combinant SQL, Python et interprétation métier.
- Détecter et corriger les problèmes de qualité qui faussent l'analyse.

### Contenu pédagogique
Scénario : tu travailles pour une plateforme e-commerce. On te donne un export de la base de données "commandes" (fichier CSV avec des problèmes de qualité). Ta mission : nettoyer les données, puis produire une analyse des ventes.

Étapes du lab :
1. **Chargement et diagnostic** : charger le CSV, identifier les problèmes (doublons, NULL, formats, incohérences).
2. **Nettoyage** : appliquer les corrections documentées, créer les tables propres dans une base de données temporaire (SQLite ou PostgreSQL).
3. **Modélisation** : structurer en schéma simple (clients, produits, commandes, lignes_commande).
4. **Analyse SQL** : top 5 clients par CA, évolution mensuelle avec LAG(), produits jamais vendus (anti-join), panier moyen par catégorie, rang des vendeurs par CA avec RANK().
5. **Rapport** : synthèse des découvertes avec chiffres clés et recommandations.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : nettoyer le CSV, créer les tables dans SQLite, et répondre : quel est le top 3 des clients par chiffre d'affaires ?
   - **Corrigé détaillé** : Nettoyage pandas → export CSV propres → `sqlite3 ecommerce.db` → `.import clients_clean.csv clients` → `.import commandes_clean.csv commandes`. Requête : `SELECT c.nom, SUM(cmd.montant) AS ca FROM clients c JOIN commandes cmd ON c.id = cmd.client_id GROUP BY c.id ORDER BY ca DESC LIMIT 3;`. Résultat + interprétation métier (ces 3 clients représentent X% du CA).
2. **Exercice 2 (intermédiaire)** : calculer l'évolution du chiffre d'affaires mois par mois (mois en cours vs mois précédent, évolution en %). Identifier les mois en baisse significative (>10%) et émettre une hypothèse.
   - **Corrigé détaillé** : CTE + LAG() comme dans le module 1. Résultat : janvier 120K, février 110K (-8.3%), mars 95K (-13.6% — baisse significative). Hypothèses : effet saisonnier post-fêtes, campagne marketing arrêtée, problème technique sur le site en mars ? À investiguer avec l'équipe métier.
3. **Exercice 3 (avancé)** : identifier les produits qui n'ont jamais été vendus depuis 6 mois (anti-join). Proposer une action business (promotion ? déréférencement ?). Croiser avec le stock disponible pour prioriser.
   - **Corrigé détaillé** : Anti-join : `SELECT p.id, p.nom, p.stock FROM produits p LEFT JOIN lignes_commande lc ON p.id = lc.produit_id AND lc.date_commande >= DATE('now', '-6 months') WHERE lc.produit_id IS NULL;`. Résultat : 15 produits jamais vendus en 6 mois, dont 5 avec stock > 100 unités (coût de stockage). Recommandation : promotion sur ces 5 produits, déréférencement des 10 autres avec stock faible. Impact chiffré : libération de X m² d'entrepôt, réduction des coûts de stockage de Y€.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: un lab intégré J19 simule... A) un cas complet nettoyage + analyse B) un exercice sans données C) un cours théorique
2. QCM: la première étape face à un CSV inconnu est... A) diagnostiquer la qualité B) faire des graphiques C) supprimer des lignes
3. QCM: un anti-join trouve... A) les lignes sans correspondance B) les doublons C) les moyennes
4. Ouverte: pourquoi nettoyer AVANT l'analyse, pas pendant ?
5. Ouverte: quel est le risque d'analyser des données non nettoyées ?
6. Cas: le top client représente 40% du CA. Interprétation et risque ?
7. QCM: LAG() dans une analyse de ventes sert à... A) comparer avec la période précédente B) supprimer des lignes C) calculer la moyenne
8. Ouverte: comment prioriser les problèmes de qualité à corriger ?
9. Cas: les données nettoyées donnent un CA total différent des données brutes. Normal ?
10. QCM: objectif du module 4 = A) intégrer nettoyage et analyse SQL B) faire du nettoyage sans analyser C) ignorer les données
11. Ouverte: pourquoi documenter l'impact du nettoyage sur les chiffres clés ?
12. Cas: l'anti-join retourne 0 produits jamais vendus. Bonne ou mauvaise nouvelle ?
13. QCM: `LEFT JOIN ... WHERE ... IS NULL` est un... A) anti-join B) inner join C) cross join
14. Ouverte: comment présenter cette analyse en entretien ?
15. QCM: résultat attendu = A) rapport d'analyse fiable et actionnable B) données non nettoyées C) requêtes sans interprétation

---

## 5) Banque de questions + suivi P1 (1h)

### Objectifs d'apprentissage
- Valider les acquis J19 en format test.
- Transformer J19 en preuve employable immédiate.

### Contenu pédagogique
- 40 min test mixte J19.
- 20 min correction + plan J20.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : rédiger une ligne CV intégrant une compétence J19 (SQL analytique ou data cleaning).
   - **Corrigé détaillé** : "Analyse de données avec SQL avancé (fonctions fenêtres, CTE, agrégations complexes) et nettoyage de données (ETL, pandas) sur des volumes significatifs."
2. **Exercice 2 (intermédiaire)** : pitch 60s "Pourquoi la qualité des données est un enjeu business".
   - **Corrigé détaillé** : Des données sales = des décisions basées sur des chiffres faux. Une erreur de 5% sur le CA peut faire rater une alerte de baisse des ventes. Le nettoyage n'est pas un luxe — c'est la condition pour avoir confiance dans ses analyses. Un pipeline ETL bien conçu, c'est la certitude que chaque rapport part de données fiables.
3. **Exercice 3 (avancé)** : plan J20 en 3 priorités mesurables.
   - **Corrigé détaillé** : 1) Maîtriser au moins 2 outils de visualisation (Power BI et matplotlib/seaborn). 2) Créer un dashboard interactif avec au moins 3 graphiques liés. 3) Préparer un exemple "voici le dashboard que j'ai créé pour suivre X, il a permis de détecter Y".

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: objectif final J19 = A) SQL analytique + modélisation + data cleaning opérationnels B) théorie uniquement C) aucun livrable
2. Ouverte: meilleure preuve de compétence SQL/data à montrer à un recruteur ?
3. QCM: ligne CV data forte = A) requête complexe + impact métier B) "je sais faire du SQL" C) vide
4. Cas: le recruteur demande "Comment nettoieriez-vous un fichier de 200 000 lignes ?"
5. Ouverte: comment relier J19 au poste de data analyst junior ?
6. QCM: plan J20 doit être... A) mesurable B) flou C) optionnel
7. Ouverte: quelle preuve SQL/data publier sur le portfolio ce soir ?
8. QCM: la correction immédiate en SQL sert à... A) ancrer les patterns de requêtage B) repousser C) copier sans comprendre
9. Cas: on te demande d'analyser les ventes. Par où commencer ?
10. QCM: preuve solide = A) requête + résultat + interprétation métier B) requête seule C) capture floue
11. Ouverte: pourquoi montrer une requête avec LAG() et son interprétation sur ton portfolio ?
12. Cas: "SQL c'est basique, tout le monde sait faire un SELECT". Réponse ?
13. QCM: remédiation utile = A) corriger la lacune précise B) recommencer C) abandonner
14. Ouverte: indicateur de progression J19 pertinent ?
15. QCM: résultat P1 réussi = A) portfolio enrichi + compétence SQL/data cleaning prouvée B) rien C) théorie sans application

---

## Validation qualité J19 (anti-superficiel)

### Livrables obligatoires fin de J19
1. 3 requêtes SQL analytiques documentées (ROW_NUMBER/top N, LAG/évolution, CTE récursive/hiérarchie).
2. 1 schéma en étoile modélisé (au moins 1 table de faits + 4 dimensions) avec justifications.
3. 1 script de data cleaning reproductible (pandas) avec journal des opérations.
4. 1 rapport d'analyse complet (lab intégré) : nettoyage, modélisation, 3 analyses SQL, conclusions.
5. 1 preuve portfolio (requête commentée + résultat) + mise à jour CV ligne SQL/data cleaning.

### Grille d'évaluation rapide (100 points)
- Maîtrise du SQL analytique (fenêtres, CTE, agrégations, jointures) : **30 pts**
- Modélisation de données (normalisation, schéma en étoile, OLTP vs OLAP) : **25 pts**
- Data cleaning et ETL (qualité, nettoyage, pipeline, documentation) : **25 pts**
- Qualité du rapport intégré (rigueur, traçabilité, conclusions) : **10 pts**
- Communication technique employabilité : **10 pts**

### Seuil attendu
- **>= 80/100** : J19 validé, passage normal J20.
- **65-79/100** : validé sous remédiation ciblée 24h.
- **< 65/100** : consolidation SQL/modélisation requise avant J20.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (SQL analytique)
1. **A**
2. **A**
3. **A**
4. WHERE filtre les lignes AVANT l'agrégation/fenêtre. PARTITION BY définit les groupes à l'intérieur desquels la fonction fenêtre opère, sans filtrer de lignes.
5. LAG() permet de comparer une valeur avec la période précédente : évolution du CA mois par mois, variation du temps de réponse entre deux déploiements, etc.
6. Chaque ligne retournée a un rang de 1 dans son service — ROW_NUMBER() partitionne par service et attribue le rang 1 à l'employé le mieux payé de chaque service.
7. **A**
8. NOT IN échoue si la sous-requête contient NULL (tout devient NULL). Anti-join avec NOT EXISTS ou LEFT JOIN est plus robuste face aux NULL.
9. `EXPLAIN ANALYZE` pour voir le plan d'exécution, identifier les INDEX manquants ou les scans séquentiels, vérifier si les PARTITION BY et ORDER BY ont des index adaptés.
10. **A**
11. Sans condition d'arrêt, la récursion boucle indéfiniment. La condition est implicite (quand la partie récursive ne retourne plus de lignes) mais doit être garantie par la structure des données.
12. ROW_NUMBER() OVER (PARTITION BY region ORDER BY ca DESC) puis filtrer WHERE rang <= 5.
13. **A**
14. Les fonctions fenêtres sont plus lisibles, plus performantes (un seul scan de table), et ne réduisent pas le nombre de lignes (on garde le détail + l'agrégation).
15. **A**

### B. Corrigé — Module 2 (Modélisation)
1. **A**
2. **A**
3. **A**
4. Pour accélérer les requêtes analytiques : moins de jointures (schéma en étoile), agrégations plus simples, meilleure lisibilité pour les utilisateurs métier. Le coût de la redondance est compensé par la performance en lecture.
5. Le niveau de détail d'une ligne de la table de faits : une ligne par transaction ? par jour ? par client ? La granularité détermine le volume et la finesse des analyses possibles.
6. Violation de la 2NF/3NF : redondance (nom et adresse répétés), risque d'incohérence (si le client change d'adresse, il faut mettre à jour toutes les lignes). Normaliser en créant une table `clients` séparée.
7. **A**
8. OLTP = optimisé pour écrire vite (transactions). OLAP = optimisé pour lire et agréger vite (analyses).
9. Partitionner la table (par date), agréger à une granularité plus grosse (journalière au lieu d'horaire), utiliser des index columnaires, archiver les données anciennes.
10. **A**
11. Compromis volume/performance : horaire = 24× plus de lignes que journalier. Si l'analyse n'a pas besoin de la granularité horaire (ex: reporting mensuel), la granularité journalière suffit et économise du stockage et du temps de requête.
12. Dimensions : dim_produit (avec catégorie), dim_region (ou dim_magasin avec région). Jointure : faits_ventes → dim_produit, faits_ventes → dim_magasin → région.
13. **A**
14. "Imaginez un tableur Excel avec un onglet central qui contient tous les chiffres (ventes), et des onglets autour qui décrivent le qui, quoi, quand, où. Chaque ligne du tableau central pointe vers les onglets de description."
15. **A**

### C. Corrigé — Module 3 (Data cleaning)
1. **A**
2. **A**
3. **A**
4. Parce qu'on perd de l'information (échantillon biaisé si les valeurs manquantes ne sont pas aléatoires) et de la puissance statistique (échantillon plus petit). Mieux vaut imputer intelligemment.
5. Imputation par moyenne = remplace par la moyenne (sensible aux outliers, tire les valeurs vers la moyenne). Imputation par médiane = remplace par la médiane (robuste aux outliers, préserve mieux la distribution). La médiane est préférable pour les distributions asymétriques.
6. C'est probablement une erreur de saisie (250 ans). Options : remplacer par NaN et imputer, ou corriger manuellement si on a l'info, ou supprimer la ligne. Documenter la décision.
7. **A**
8. Pour la traçabilité, l'audit, la reproductibilité, et pour qu'un collègue comprenne ce qui a été fait et pourquoi. Sans documentation, les décisions de nettoyage sont opaques et peuvent être contestées.
9. Il faut comprendre pourquoi : les lignes supprimées (doublons, outliers, valeurs manquantes) représentaient ce montant. Si c'est dû aux doublons (ventes comptées 2 fois), la baisse est légitime. Si c'est dû à des valeurs supprimées sans justification, c'est un problème. Analyser la composition de la perte.
10. **A**
11. Comparer les statistiques descriptives avant/après (moyenne, médiane, distribution), vérifier que les proportions par catégorie n'ont pas changé, valider sur un échantillon que le nettoyage a bien corrigé les erreurs sans en introduire.
12. Standardiser avec un mapping : `mapping = {'France': 'FR', 'FR': 'FR', 'france': 'FR', 'Fr.': 'FR'}` → `df['pays'] = df['pays'].map(mapping)`. Ou utiliser `str.lower().str.strip()` + mapping si les variations sont trop nombreuses.
13. **A**
14. Pour permettre les tris chronologiques, les calculs de durée, et éviter les erreurs de parsing (01/02/2024 = 1er février ou 2 janvier ?).
15. **A**

### D. Corrigé — Module 4 (Labs intégrés)
1. **A**
2. **A**
3. **A**
4. Nettoyer d'abord garantit que l'analyse porte sur des données fiables. Analyser des données sales peut mener à des conclusions erronées qu'on ne remettra pas en cause ensuite.
5. Conclusions fausses (un doublon double le CA d'un client), moyennes biaisées, rapports inexacts, perte de crédibilité.
6. Risque de dépendance : si ce client part, 40% du CA disparaît. Recommandation : diversifier le portefeuille client, ne pas sur-investir sur ce seul client.
7. **A**
8. Prioriser par impact sur l'analyse : les colonnes critiques (montant, date) d'abord, les doublons et valeurs aberrantes ensuite, les formats et cosmétiques en dernier.
9. Normal si les corrections sont légitimes (doublons supprimés, valeurs aberrantes corrigées). L'important est de pouvoir expliquer l'écart : "Le CA est passé de 1.2M à 1.15M car nous avons supprimé 50K de doublons."
10. **A**
11. Pour justifier les choix auprès des parties prenantes, comprendre l'impact des décisions de nettoyage, et assurer la reproductibilité.
12. Bonne nouvelle pour le chiffre d'affaires (tout se vend), mais à vérifier : les produits sont-ils réellement tous vendus, ou y a-t-il une erreur dans l'anti-join (mauvaise condition, problème de date) ?
13. **A**
14. "J'ai nettoyé et modélisé les données d'une plateforme e-commerce, puis analysé les ventes avec SQL avancé : top clients, évolutions mensuelles, produits dormants. Résultat : identification de 5 produits à promouvoir et d'un risque de dépendance client."
15. **A**

### E. Corrigé — Module 5 (Banque + P1)
1. **A**
2. Une requête SQL complexe commentée (ex: top 3 par catégorie avec RANK, évolution mensuelle avec LAG) + le résultat + l'interprétation business.
3. **A**
4. "Avec pandas : diagnostic (doublons, valeurs manquantes, types), nettoyage (imputation, standardisation), validation (contrôles de cohérence), puis export propre. Le tout en script reproductible."
5. Le data analyst nettoie, modélise et interroge les données pour répondre aux questions business. J19 couvre exactement ces compétences fondamentales.
6. **A**
7. Une requête SQL avec LAG() commentée + le graphique d'évolution qui en découle + l'interprétation métier.
8. **A**
9. Comprendre le schéma (tables, relations), vérifier la qualité des données (doublons, NULL), formuler des questions business, écrire les requêtes pour y répondre.
10. **A**
11. Ça prouve que tu sais faire du SQL avancé (pas juste SELECT * FROM) et que tu comprends l'utilité business des fonctions analytiques.
12. "Le SQL analytique va bien au-delà du SELECT de base : fonctions fenêtres, CTE récursives, agrégations multi-niveaux. Voici un exemple d'analyse d'évolution mensuelle avec LAG() et de classement avec RANK()."
13. **A**
14. Capacité à écrire une requête analytique correcte sur un schéma inconnu en moins de 30 minutes.
15. **A**