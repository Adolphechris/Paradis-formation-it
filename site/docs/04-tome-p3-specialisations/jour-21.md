# TOME P3-B — Jour 21 (14h)

## Découpage horaire opérationnel J21
- Concepts Big Data (3V, écosystème Hadoop/Spark, architectures distribuées) — **3h**
- pandas avancé (groupby multi-niveaux, pivot/melt, merge, apply, pipe) — **4h**
- Transformation de données (feature engineering, normalisation, encodage) — **3h**
- Optimisation pandas (chunking, dtypes, vectorisation, mémoire) — **2h**
- Labs intégrés (traitement d'un gros fichier + transformation) — **1h**
- Banque de questions + suivi P1 — **1h**

---

## 1) Concepts Big Data — 3V, écosystème, architectures (3h)

### Objectifs d'apprentissage
- Définir les 3V du Big Data (Volume, Vélocité, Variété) et le 4e V (Véracité).
- Distinguer le scaling vertical (scale-up) du scaling horizontal (scale-out).
- Comprendre l'architecture MapReduce et le rôle de Hadoop/Spark.
- Identifier les cas d'usage du Big Data en contexte entreprise.
- Expliquer les limites de pandas et quand passer à un framework distribué.

### Contenu pédagogique
Le Big Data n'est pas qu'un buzzword — c'est un changement de paradigme quand les données dépassent la capacité d'une seule machine.

Points clés:
1. **Les 3V (et le 4e)** :
   - **Volume** : téraoctets, pétaoctets — trop gros pour tenir en RAM ou sur un seul disque.
   - **Vélocité** : données en temps réel (streaming) — logs, capteurs, transactions financières.
   - **Variété** : données structurées (SQL), semi-structurées (JSON, XML), non structurées (texte, images, vidéos).
   - **Véracité** (4e V) : qualité et fiabilité des données — les big data sont souvent "sales".
2. **Scale-up vs Scale-out** : Scale-up = acheter une machine plus grosse (limite physique et financière). Scale-out = ajouter des machines (clusters) — c'est le modèle Big Data. Le traitement est distribué sur N machines.
3. **Hadoop** : framework open-source pour le stockage distribué (HDFS) et le traitement distribué (MapReduce). HDFS découpe les fichiers en blocs répartis sur le cluster. MapReduce : Map (transformation parallèle) → Shuffle (regroupement) → Reduce (agrégation). Hadoop est aujourd'hui moins utilisé pour le traitement (remplacé par Spark).
4. **Spark** : moteur de traitement distribué en mémoire (100× plus rapide que MapReduce sur disque). APIs en Python (PySpark), SQL, Scala, R. Idéal pour les traitements itératifs (machine learning). Architecture : Driver (coordination) + Executors (traitement parallèle). PySpark DataFrame API est similaire à pandas — passage facilité.
5. **Quand passer de pandas à Spark ?** pandas est limité par la RAM de la machine (un DataFrame doit tenir en mémoire). Règle empirique : si le fichier > 5-10 Go ou > 50% de la RAM, envisager Spark ou Dask. Dask est une alternative plus légère à Spark, qui étend pandas/numpy au parallélisme local.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : classifier 5 scénarios selon qu'ils relèvent de pandas, Dask ou Spark : (a) fichier CSV de 500 Mo, (b) logs de 50 Go/jour, (c) jointure de 2 DataFrames de 2 Go chacun, (d) streaming de capteurs IoT en temps réel, (e) analyse exploratoire sur un extrait de 100 000 lignes.
   - **Corrigé détaillé** : (a) pandas — tient en RAM. (b) Spark ou Dask — volume quotidien trop gros pour une machine, nécessite un stockage distribué. (c) pandas — 4 Go tiennent sur une machine avec 16 Go de RAM. (d) Spark Streaming ou Kafka — temps réel. (e) pandas — petit extrait, exploration interactive. Critères : taille, temps réel, infrastructure existante.
2. **Exercice 2 (intermédiaire)** : on a un fichier CSV de 10 Go. La machine a 8 Go de RAM. Expliquer pourquoi pandas échouera et proposer 3 solutions techniques.
   - **Corrigé détaillé** : pandas charge tout en mémoire → 10 Go > 8 Go → MemoryError. Solutions : (1) `chunksize` — lire par morceaux de 1M lignes, traiter séquentiellement. (2) Dask DataFrame — API similaire à pandas, lazy evaluation, gère des datasets plus gros que la RAM. (3) PySpark — stockage distribué, exécution parallèle sur cluster. Chaque solution a un compromis complexité vs capacité.
3. **Exercice 3 (avancé)** : concevoir l'architecture de traitement des logs d'une application bancaire : 500 Go de logs par jour, besoin d'analyses quotidiennes et de détection de fraude en temps réel. Proposer une stack technique et justifier.
   - **Corrigé détaillé** : Stack proposée : ingestion → Kafka (streaming, tampon), stockage → HDFS ou S3 (persistance), traitement batch quotidien → Spark (agrégations, rapports), traitement temps réel → Spark Streaming ou Flink (détection de fraude), stockage résultats → PostgreSQL ou Parquet (requêtage), visualisation → Power BI ou Grafana. Justification : Kafka pour le tampon (ne pas perdre de données), Spark pour la puissance de traitement, séparation batch/temps réel pour répondre aux deux besoins.

### Nouvelles abréviations rencontrées
- HDFS | Hadoop Distributed File System | Système de fichiers distribué pour le stockage Big Data | Interagit avec Hadoop, Spark, les clusters de stockage
- PySpark | Python API for Apache Spark | Interface Python pour le traitement distribué Spark | Interagit avec Spark, HDFS, les DataFrames distribués

### Banque de questions du module (15)
1. QCM: les 3V du Big Data sont... A) Volume, Vélocité, Variété B) Valeur, Visibilité, Virtualisation C) Vitesse, Volume, Vente
2. QCM: le scale-out consiste à... A) ajouter des machines B) acheter un plus gros serveur C) supprimer des données
3. QCM: Spark est plus rapide que MapReduce car il travaille... A) en mémoire B) sur disque C) sans données
4. Ouverte: à partir de quelle taille de données faut-il envisager Spark au lieu de pandas ?
5. Ouverte: différence entre batch processing et stream processing.
6. Cas: un fichier de 3 Go. pandas charge tout mais rame. Optimisations avant de passer à Spark ?
7. QCM: HDFS est un... A) système de fichiers distribué B) langage de requête C) outil de visualisation
8. Ouverte: pourquoi le 4e V (Véracité) est-il important en Big Data ?
9. Cas: besoin d'analyser 100 Go de données, mais pas de cluster disponible. Solutions ?
10. QCM: PySpark permet d'écrire du code... A) Python pour Spark B) Java pour Hadoop C) SQL uniquement
11. Ouverte: avantages et inconvénients de Spark par rapport à pandas.
12. Cas: les données arrivent en continu (streaming), besoin d'alerte en moins d'une seconde. Outil ?
13. QCM: objectif du module 1 = A) comprendre les concepts Big Data et l'écosystème B) maîtriser Spark en profondeur C) ignorer les gros volumes
14. Ouverte: comment expliquer le Big Data à un manager non technique ?
15. QCM: résultat attendu = A) savoir quand et pourquoi utiliser des outils distribués B) tout faire avec pandas C) éviter les données volumineuses

---

## 2) pandas avancé — groupby, pivot/melt, merge, apply (4h)

### Objectifs d'apprentissage
- Maîtriser les agrégations multi-niveaux avec groupby et agg.
- Transformer la structure des données avec pivot, melt, stack/unstack.
- Réaliser des jointures complexes avec merge (inner, left, right, outer).
- Utiliser apply, map, transform pour des opérations personnalisées.
- Composer des transformations complexes avec pipe.

### Contenu pédagogique
Ces fonctions sont le couteau suisse de l'analyse de données. Sans elles, on passe des heures à faire ce que pandas fait en une ligne.

Points clés:
1. **groupby + agg multi-colonnes** : `df.groupby('catégorie').agg({'montant': ['sum', 'mean', 'std'], 'quantité': 'sum'})`. `agg` accepte un dictionnaire : quelle fonction appliquer à quelle colonne. Résultat : un DataFrame multi-index avec les statistiques par catégorie.
2. **groupby + transform** : `df['pct_catégorie'] = df.groupby('catégorie')['montant'].transform(lambda x: x / x.sum() * 100)`. `transform` retourne une Series de même longueur que l'original (contrairement à `agg` qui réduit). Idéal pour normaliser au sein d'un groupe.
3. **pivot / pivot_table / melt** :
   - `df.pivot(index='date', columns='produit', values='ca')` → transformation large (wide format). Attention : `pivot` exige des couples (index, columns) uniques.
   - `df.pivot_table(index='date', columns='produit', values='ca', aggfunc='sum')` → comme pivot mais gère les doublons avec une fonction d'agrégation.
   - `pd.melt(df, id_vars=['date', 'région'], var_name='produit', value_name='ca')` → transformation longue (long format), inverse de pivot. Indispensable pour préparer les données pour seaborn/plotly.
4. **merge (jointures)** : `pd.merge(df1, df2, on='clé', how='inner')`. `how='left'` (garder toutes les lignes de df1), `how='right'`, `how='outer'` (union). `merge` est l'équivalent pandas du JOIN SQL. Astuce : valider le nombre de lignes avant/après (`len(df1)`, `len(result)`) pour détecter les duplications involontaires.
5. **apply / map / pipe** :
   - `df['colonne'].map(dictionnaire)` → remplacer des valeurs (ex: codes → labels).
   - `df.apply(fonction, axis=1)` → appliquer une fonction à chaque ligne (lent sur les gros DataFrames, préférer la vectorisation).
   - `df.pipe(fonction)` → enchaîner des transformations de façon lisible (`df.pipe(nettoyer).pipe(enrichir).pipe(agréger)`).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : calculer le chiffre d'affaires total, moyen, et l'écart-type par région et par catégorie de produit. Utiliser groupby + agg multi-colonnes.
   - **Corrigé détaillé** : `df.groupby(['région', 'catégorie']).agg({'ca': ['sum', 'mean', 'std'], 'quantité': 'sum'}).round(2)`. Le résultat est un DataFrame hiérarchique. Pour aplatir les colonnes : `result.columns = ['_'.join(col).strip() for col in result.columns.values]` → `ca_sum`, `ca_mean`, etc.
2. **Exercice 2 (intermédiaire)** : transformer un DataFrame au format large (une colonne par mois : janvier, février...) en format long (colonnes date et ca). Utiliser melt.
   - **Corrigé détaillé** : `df_long = pd.melt(df, id_vars=['région', 'produit'], var_name='mois', value_name='ca')`. Ensuite : `df_long['mois'] = pd.to_datetime(df_long['mois'], format='%B')` (convertir les noms de mois en dates). Maintenant on peut faire `df_long.groupby('mois')['ca'].sum().plot()` — merci melt d'avoir rendu ça possible.
3. **Exercice 3 (avancé)** : pipeline d'analyse complet avec pipe : charger → nettoyer → enrichir (ajouter colonne "marge" = ca - coût) → agréger par région et mois → calculer l'évolution vs mois précédent (pct_change) → filtrer les régions en croissance négative. Tout en utilisant pipe.
   - **Corrigé détaillé** : `(df_raw.pipe(charger_et_nettoyer).pipe(lambda d: d.assign(marge=d['ca'] - d['cout'])).pipe(lambda d: d.groupby(['région', 'mois']).agg({'ca': 'sum', 'marge': 'sum'}).reset_index()).pipe(lambda d: d.assign(evolution=d.groupby('région')['ca'].pct_change() * 100)).pipe(lambda d: d[d['evolution'] < 0]))`. Chaque étape est une fonction pure, lisible, testable indépendamment. Le résultat final montre les régions en baisse avec leur évolution.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: `df.groupby('catégorie').agg({'ca': 'sum'})` retourne... A) un DataFrame agrégé B) le DataFrame original C) une Series
2. QCM: `transform` vs `agg` — différence clé ? A) transform garde la même longueur B) transform supprime des lignes C) identiques
3. QCM: `pd.melt()` transforme des données du format... A) large vers long B) long vers large C) CSV vers JSON
4. Ouverte: quand utiliser pivot vs pivot_table ?
5. Ouverte: différence entre merge et concat.
6. Cas: après un merge left, le nombre de lignes a doublé. Problème probable ?
7. QCM: `df.apply(fonction, axis=1)` applique la fonction... A) à chaque ligne B) à chaque colonne C) au DataFrame entier
8. Ouverte: pourquoi éviter apply sur de gros DataFrames quand c'est possible ?
9. Cas: besoin de normaliser le CA de chaque région par rapport au CA total de sa région. Fonction pandas ?
10. QCM: `df.pipe(fonction)` permet de... A) enchaîner des transformations B) supprimer des colonnes C) exporter en CSV
11. Ouverte: avantage de pipe par rapport à une série d'assignations directes.
12. Cas: `pivot()` lève une erreur "duplicate entries". Solution ?
13. QCM: objectif du module 2 = A) maîtriser les transformations pandas complexes B) utiliser uniquement Excel C) éviter les groupby
14. Ouverte: comment déboguer un pipeline pandas complexe ?
15. QCM: résultat attendu = A) DataFrames transformés efficacement B) code spaghetti C) données non traitées

---

## 3) Transformation de données — feature engineering (3h)

### Objectifs d'apprentissage
- Créer des features (colonnes dérivées) pertinentes pour l'analyse.
- Appliquer la normalisation et la standardisation des données numériques.
- Encoder les variables catégorielles (one-hot, label, ordinal).
- Gérer les variables temporelles (extraction jour/mois/année, lag features).
- Discrétiser les variables continues (binning).

### Contenu pédagogique
La transformation de données (feature engineering) crée de nouvelles colonnes à partir des existantes pour faciliter l'analyse ou améliorer les modèles.

Points clés:
1. **Feature engineering** : créer des colonnes qui capturent la connaissance métier. Exemples : `df['ancienneté_jours'] = (today - df['date_inscription']).dt.days`, `df['panier_moyen'] = df['ca'] / df['nb_commandes']`, `df['taux_conversion'] = df['achats'] / df['visites']`. Une bonne feature vaut mieux qu'un algorithme complexe.
2. **Normalisation et standardisation** :
   - **Min-Max scaling** : `(x - min) / (max - min)` → valeurs entre 0 et 1. Sensible aux outliers. `from sklearn.preprocessing import MinMaxScaler`.
   - **Standardisation (Z-score)** : `(x - mean) / std` → moyenne 0, écart-type 1. Robuste aux outliers modérés. `from sklearn.preprocessing import StandardScaler`.
   - **Quand normaliser ?** Pour les algorithmes sensibles aux échelles (k-means, SVM, réseaux de neurones). Pas nécessaire pour les arbres de décision ou les stats descriptives.
3. **Encodage des variables catégorielles** :
   - **One-Hot Encoding** : chaque catégorie devient une colonne binaire (0/1). `pd.get_dummies(df, columns=['pays'])`. Attention : si beaucoup de catégories, explosion du nombre de colonnes.
   - **Label Encoding** : chaque catégorie → un entier. `df['pays_code'] = df['pays'].astype('category').cat.codes`. Attention : crée un ordre artificiel (1 < 2 < 3) qui peut biaiser les algorithmes.
   - **Ordinal Encoding** : comme Label Encoding mais pour des catégories ayant un ordre naturel (faible < moyen < élevé).
4. **Features temporelles** : à partir d'une colonne datetime, extraire : `df['jour'] = df['date'].dt.day`, `df['jour_semaine'] = df['date'].dt.dayofweek`, `df['mois'] = df['date'].dt.month`, `df['trimestre'] = df['date'].dt.quarter`, `df['weekend'] = df['jour_semaine'].isin([5, 6])`. Les features temporelles révèlent souvent des patterns (saisonnalité, effet week-end).
5. **Binning (discrétisation)** : transformer une variable continue en catégories. `pd.cut(df['age'], bins=[0, 18, 30, 50, 100], labels=['mineur', 'jeune', 'adulte', 'senior'])`. Utile pour l'analyse par tranches (CA par tranche d'âge) ou pour simplifier un modèle.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : créer 3 features à partir d'un DataFrame "clients" : ancienneté en jours, tranche d'âge (cut), et pays encodé en one-hot. Expliquer chaque choix.
   - **Corrigé détaillé** : `df['ancienneté'] = (pd.Timestamp.now() - df['date_inscription']).dt.days`. `df['tranche_âge'] = pd.cut(df['âge'], bins=[0, 25, 40, 60, 100], labels=['18-25', '26-40', '41-60', '60+'])`. `df = pd.get_dummies(df, columns=['pays'], prefix='pays')`. Ancienneté → utile pour analyser la fidélité. Tranche d'âge → segmentation marketing. One-hot pays → utilisable par des algorithmes de ML.
2. **Exercice 2 (intermédiaire)** : standardiser les colonnes numériques (age, revenu, ancienneté) d'un DataFrame avec StandardScaler. Comparer les statistiques avant/après (mean, std). Expliquer pourquoi la standardisation est utile.
   - **Corrigé détaillé** : Avant : age mean=45, std=15 ; revenu mean=50000, std=20000. Après StandardScaler : les deux colonnes ont mean≈0, std≈1. La standardisation met toutes les variables sur la même échelle — indispensable si on veut utiliser un algorithme basé sur les distances (k-means) ou comparer l'importance des features dans une régression. Sans standardisation, le revenu (en milliers) dominerait l'âge (en dizaines).
3. **Exercice 3 (avancé)** : transformer un jeu de données de transactions bancaires pour la détection de fraude. Créer au moins 5 features pertinentes : montant normalisé par rapport à la moyenne du client, heure de la transaction (nuit = risky), jour de la semaine, nombre de transactions du client dans les 24h, écart par rapport au montant médian du client. Justifier chaque feature.
   - **Corrigé détaillé** : (1) `df['montant_zscore'] = df.groupby('client_id')['montant'].transform(lambda x: (x - x.mean()) / x.std())` → une transaction loin de la moyenne du client est suspecte. (2) `df['heure_nuit'] = df['heure'].between(0, 5).astype(int)` → les transactions nocturnes sont plus risquées. (3) `df['jour_semaine'] = df['date'].dt.dayofweek` → les patterns d'achat varient. (4) `df['tx_24h'] = df.groupby('client_id')['date'].transform(lambda x: x.rolling('24h').count())` → fréquence anormale. (5) `df['ecart_median'] = abs(df['montant'] - df.groupby('client_id')['montant'].transform('median'))` → gros écart suspect. Ces 5 features peuvent alimenter un modèle de détection de fraude.

### Nouvelles abréviations rencontrées
- Z-score | (standardisation) | Nombre d'écarts-types entre une valeur et la moyenne | Interagit avec la normalisation, la détection d'outliers, le machine learning

### Banque de questions du module (15)
1. QCM: le feature engineering consiste à... A) créer de nouvelles colonnes à partir des existantes B) supprimer des données C) copier le DataFrame
2. QCM: la standardisation (Z-score) transforme les données pour avoir... A) moyenne 0, écart-type 1 B) valeurs entre 0 et 1 C) moyenne 1, écart-type 0
3. QCM: `pd.get_dummies()` réalise un encodage... A) one-hot B) label C) ordinal
4. Ouverte: pourquoi créer des features plutôt que d'utiliser les données brutes ?
5. Ouverte: quand utiliser la normalisation Min-Max vs la standardisation Z-score ?
6. Cas: one-hot encoding crée 500 nouvelles colonnes. Problème et solution ?
7. QCM: `pd.cut()` sert à... A) discrétiser une variable continue B) supprimer des colonnes C) fusionner des DataFrames
8. Ouverte: quel est le risque du Label Encoding pour un algorithme comme la régression linéaire ?
9. Cas: la colonne "date" contient des timestamps. Quelles features temporelles extraire ?
10. QCM: extraire le jour de la semaine d'une date se fait avec... A) `df['date'].dt.dayofweek` B) `df['date'].apply` C) `df['date'] + 7`
11. Ouverte: pourquoi le feature engineering est-il spécifique au domaine métier ?
12. Cas: `df['montant_zscore'] > 3`. Qu'est-ce que ça signifie pour une transaction ?
13. QCM: objectif du module 3 = A) enrichir les données avec des features pertinentes B) garder les données brutes C) supprimer toutes les colonnes
14. Ouverte: comment valider qu'une feature créée est utile ?
15. QCM: résultat attendu = A) DataFrame enrichi avec des features métier B) données inchangées C) features aléatoires

---

## 4) Optimisation pandas — chunking, dtypes, vectorisation, mémoire (2h)

### Objectifs d'apprentissage
- Diagnostiquer la consommation mémoire d'un DataFrame.
- Optimiser les types de données (dtypes) pour réduire l'empreinte mémoire.
- Traiter des fichiers volumineux par morceaux (chunking).
- Remplacer les boucles par des opérations vectorisées.
- Utiliser `eval` et `query` pour des performances accrues.

### Contenu pédagogique
Quand les données grossissent, pandas peut devenir lent ou planter. L'optimisation permet de repousser ces limites sans changer d'outil.

Points clés:
1. **Diagnostic mémoire** : `df.info(memory_usage='deep')` → taille réelle du DataFrame. `df.memory_usage(deep=True).sum() / 1024**2` → taille en Mo. Une colonne `object` (texte) peut consommer 10× plus qu'une colonne `category`.
2. **Optimisation des dtypes** :
   - `int64` → `int32`, `int16`, `int8` si les valeurs le permettent (ex: âge de 0 à 120 tient dans `int8`).
   - `float64` → `float32` (précision suffisante pour la plupart des analyses).
   - `object` → `category` pour les colonnes avec peu de valeurs uniques (ex: pays, type_produit). Économie de mémoire massive (5-10×).
   - `pd.to_numeric(df['col'], downcast='integer')` → conversion automatique au plus petit type.
3. **Chunking** : `for chunk in pd.read_csv('fichier.csv', chunksize=100000): traiter(chunk)`. Chaque chunk est un DataFrame indépendant. Permet de traiter un fichier de 50 Go sur une machine de 8 Go. Limite : les opérations qui nécessitent de voir toutes les données (groupby, merge, tri) sont plus complexes en chunking.
4. **Vectorisation** : remplacer les boucles `for` par des opérations numpy/pandas. `df['a'] + df['b']` (vectorisé) est 100× plus rapide que `df.apply(lambda row: row['a'] + row['b'], axis=1)`. Toujours penser "opération sur toute la colonne" avant "itération ligne par ligne".
5. **eval et query** : `df.query('âge > 30 and revenu < 50000')` — plus rapide et plus lisible que `df[(df['âge'] > 30) & (df['revenu'] < 50000)]`. `df.eval('ratio = ca / quantité')` — crée une colonne via un moteur d'expression optimisé.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : charger un DataFrame "clients" (1M lignes). Afficher sa taille mémoire. Optimiser les dtypes (int64→int32, object→category). Mesurer le gain en Mo et en %.
   - **Corrigé détaillé** : Avant : 1M lignes, `df.info(memory_usage='deep')` → 85.2 MB. Optimisations : `df['âge'] = df['âge'].astype('int8')` (max 120 < 256), `df['pays'] = df['pays'].astype('category')` (5 pays uniques), `df['type_client'] = df['type_client'].astype('category')`. Après : 18.5 MB. Gain : 66.7 MB (78%). Sur 1M lignes, c'est significatif. Sur 10M lignes, ça fait la différence entre "ça passe en RAM" et "MemoryError".
2. **Exercice 2 (intermédiaire)** : traiter un CSV de 2 Go par chunks de 200 000 lignes. Pour chaque chunk, filtrer les transactions > 1000€, agréger par catégorie (sum), et écrire dans un fichier de sortie. À la fin, recharger le fichier de sortie et produire le classement final.
   - **Corrigé détaillé** : `with open('resultat.csv', 'w') as f: header_written = False`. Boucle : `for chunk in pd.read_csv('transactions.csv', chunksize=200000): filtered = chunk[chunk['montant'] > 1000] ; agg = filtered.groupby('catégorie')['montant'].sum().reset_index() ; agg.to_csv(f, header=not header_written, index=False) ; header_written = True`. Recharger `resultat.csv` → groupby 'catégorie' sum → top catégories. Résultat correct malgré le traitement par morceaux.
3. **Exercice 3 (avancé)** : comparer les performances de 4 méthodes pour créer une colonne "catégorie_age" (jeune <30, adulte 30-60, senior >60) sur 1M lignes : (a) apply + axis=1, (b) np.select vectorisé, (c) pd.cut, (d) itertuples. Mesurer le temps de chaque méthode et conclure.
   - **Corrigé détaillé** : Résultats typiques : (a) apply axis=1 → 4.2s (très lent, à éviter). (b) np.select([df['âge']<30, df['âge']<=60], ['jeune', 'adulte'], default='senior') → 0.02s (vectorisé, ultra-rapide). (c) pd.cut → 0.04s (aussi rapide, plus lisible). (d) itertuples → 0.8s (mieux que apply mais pas vectorisé). Conclusion : toujours utiliser np.select, pd.cut, ou les opérations vectorisées. Éviter apply et les boucles for sur les DataFrames sauf pour des opérations vraiment complexes.

### Nouvelles abréviations rencontrées
- RAM | Random Access Memory | Mémoire vive — limite principale de pandas | Interagit avec le chunking, l'optimisation dtypes, le choix entre pandas et Spark

### Banque de questions du module (15)
1. QCM: `df.info(memory_usage='deep')` affiche... A) la consommation mémoire B) le nombre de lignes C) les types
2. QCM: le type `category` économise de la mémoire quand... A) il y a peu de valeurs uniques B) la colonne est numérique C) le fichier est petit
3. QCM: le chunking consiste à... A) lire le fichier par morceaux B) supprimer des lignes C) fusionner des fichiers
4. Ouverte: pourquoi `object` consomme-t-il plus que `category` ?
5. Ouverte: différence entre `apply` et une opération vectorisée.
6. Cas: un DataFrame de 500 Mo en RAM. Après optimisation, 150 Mo. Qu'as-tu probablement fait ?
7. QCM: `np.where(condition, valeur_si_vrai, valeur_si_faux)` est... A) vectorisé B) ligne par ligne C) récursif
8. Ouverte: limite du chunking pour un groupby global ?
9. Cas: `df['col'].astype('int8')` lève une erreur. Cause probable ?
10. QCM: `df.eval('c = a + b')` est... A) plus rapide que la syntaxe classique B) identique C) plus lent
11. Ouverte: comment réduire l'empreinte mémoire d'un DataFrame avant de le sauvegarder ?
12. Cas: traitement de 100 Mo par chunk, 10 chunks = le résultat final est faux. Pourquoi ?
13. QCM: objectif du module 4 = A) optimiser pandas pour les gros volumes B) tout garder en float64 C) éviter d'optimiser
14. Ouverte: pourquoi mesurer la consommation mémoire d'un DataFrame ?
15. QCM: résultat attendu = A) DataFrame optimisé + code vectorisé B) boucles for partout C) MemoryError non résolue

---

## 5) Labs intégrés + Banque de questions + suivi P1 (2h)

### Objectifs d'apprentissage
- Traiter un fichier volumineux de bout en bout (chunking, optimisation, transformation).
- Appliquer les compétences J21 sur un cas réaliste.
- Préparer la transition vers J22 (projet de synthèse P3-B).

### Contenu pédagogique
- 1h : lab intégré — traitement d'un fichier de transactions de 5M lignes.
- 30 min : test mixte J21.
- 30 min : correction + plan J22.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : charger le fichier par chunks, optimiser les dtypes, créer 3 features, agréger par catégorie et mois, sauvegarder proprement.
   - **Corrigé détaillé** : Chargement par chunks de 500K, optimisation dtypes (int32, category), création features (mois, jour_semaine, montant_normalisé), agrégation par chunk (`groupby(['catégorie','mois']).agg({'montant':'sum', 'quantité':'sum'})`), cumul des résultats dans un DataFrame final. Le résultat tient en < 50 Mo, prêt pour l'analyse.
2. **Exercice 2 (intermédiaire)** : plan J22 en 3 priorités mesurables.
   - **Corrigé détaillé** : 1) Synthétiser tous les acquis P3-B (J18-J21) en un projet d'analyse complet. 2) Réaliser le projet de synthèse : question business → données → nettoyage → analyse SQL/Python → visualisation → recommandations. 3) Préparer un argumentaire "data analyst junior prêt à l'emploi".
3. **Exercice 3 (avancé)** : rédiger une ligne CV qui synthétise la valeur de P3-B, et un pitch 60s.
   - **Corrigé détaillé** : CV : "Analyse de données de bout en bout : statistiques descriptives, SQL analytique avancé, data cleaning, visualisation (Power BI, Python), et traitement de volumes significatifs (pandas optimisé, concepts Big Data)." Pitch : "En 5 jours intensifs, j'ai acquis les compétences fondamentales du data analyst : des statistiques à la visualisation, en passant par le SQL avancé et le nettoyage de données. J'ai traité des jeux de données réels, créé des dashboards, et je suis prêt à transformer des données brutes en décisions business."

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: objectif final J21 = A) Big Data + pandas avancé opérationnels B) théorie uniquement C) aucun livrable
2. QCM: plan J22 doit être... A) mesurable B) flou C) optionnel
3. Ouverte: meilleure preuve de compétence Big Data/pandas à montrer ?
4. QCM: ligne CV data forte = A) compétences + outils + résultats B) liste vague C) vide
5. QCM: preuve solide = A) script optimisé + rapport d'analyse B) promesse C) une ligne de code
6. Ouverte: comment relier J21 au poste de data analyst junior ?
7. QCM: remédiation utile = A) corriger la lacune précise B) recommencer C) abandonner
8. Ouverte: indicateur de progression J21 pertinent ?
9. QCM: résultat P1 réussi = A) portfolio enrichi B) rien C) théorie sans application
10. QCM: le lab intégré J21 simule... A) un cas réel de traitement de données B) un exercice théorique C) rien
11. Ouverte: pourquoi optimiser les dtypes avant de sauvegarder un DataFrame ?
12. Cas: "Pourquoi ne pas tout faire avec Excel ?" — Réponse ?
13. QCM: objectif du module 5 = A) intégrer et valider les compétences J21 B) ignorer les labs C) éviter les tests
14. Ouverte: comment présenter un rapport d'analyse basé sur un gros volume en entretien ?
15. QCM: résultat attendu = A) traitement complet + features + optimisation B) données brutes C) script non testé

---

## Validation qualité J21 (anti-superficiel)

### Livrables obligatoires fin de J21
1. 1 diagnostic mémoire + optimisation dtypes d'un DataFrame (avant/après, gain en %).
2. 1 traitement par chunking d'un fichier volumineux (script documenté).
3. 3 features créées et justifiées sur un jeu de données métier.
4. 1 script pandas avancé (groupby multi-niveaux + pivot/melt + merge + pipe).
5. 1 preuve portfolio (script optimisé ou features documentées) + mise à jour CV.

### Grille d'évaluation rapide (100 points)
- Compréhension Big Data (3V, écosystème, scale-out vs scale-up) : **15 pts**
- Maîtrise pandas avancé (groupby, pivot/melt, merge, apply, pipe) : **30 pts**
- Feature engineering (création, normalisation, encodage, features temporelles) : **25 pts**
- Optimisation pandas (dtypes, chunking, vectorisation) : **20 pts**
- Communication technique employabilité : **10 pts**

### Seuil attendu
- **>= 80/100** : J21 validé, passage normal J22.
- **65-79/100** : validé sous remédiation ciblée 24h.
- **< 65/100** : consolidation pandas/Big Data requise avant J22.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Big Data)
1. **A**
2. **A**
3. **A**
4. Quand le fichier > 5-10 Go ou > 50% de la RAM disponible, ou quand le temps de traitement devient rédhibitoire. La décision dépend aussi de l'infrastructure disponible et de la fréquence du traitement.
5. Batch = traitement périodique de données accumulées (ex: rapport quotidien à minuit). Stream = traitement continu en temps réel (ex: alerte fraude immédiate). Le batch privilégie l'exhaustivité, le stream la rapidité.
6. Optimiser les dtypes (int64→int32, object→category), ne charger que les colonnes nécessaires (`usecols`), utiliser `chunksize`, filtrer les lignes dès le chargement si possible. Si après optimisation ça reste lent, passer à Dask.
7. **A**
8. En Big Data, les données sont souvent issues de sources multiples avec des formats et qualités variables. La véracité rappelle qu'un gros volume de données non fiables produit des analyses non fiables. Le nettoyage reste crucial même à grande échelle.
9. Dask (étend pandas avec lazy evaluation et parallélisme local), Google Colab (GPU/TPU gratuit avec limites), ou échantillonnage intelligent (travailler sur un sous-ensemble représentatif puis valider sur l'ensemble).
10. **A**
11. Avantages Spark : distribué (cluster), gère des pétaoctets, SQL + ML intégrés. Inconvénients : complexité de mise en place, latence de démarrage, overkill pour les petits volumes. pandas : simple, interactif, idéal pour l'exploration, limité par la RAM.
12. Spark Streaming ou Apache Flink. Ces frameworks traitent les événements un par un ou par micro-batch, avec une latence de l'ordre de la milliseconde.
13. **A**
14. "Le Big Data, c'est quand les données sont trop volumineuses pour tenir dans un seul ordinateur. On les répartit sur plusieurs machines qui travaillent ensemble. Ça permet d'analyser des millions de transactions là où un Excel s'arrête à 1 million de lignes."
15. **A**

### B. Corrigé — Module 2 (pandas avancé)
1. **A**
2. **A**
3. **A**
4. `pivot` → quand les couples (index, columns) sont uniques (pas de doublons). `pivot_table` → quand il y a des doublons — on spécifie une fonction d'agrégation (sum, mean) pour les résoudre.
5. `merge` → jointure SQL-like sur une colonne (inner, left, right). `concat` → empiler des DataFrames verticalement ou horizontalement, sans logique de jointure.
6. La clé de jointure n'est pas unique dans la table de droite → plusieurs correspondances pour une même ligne de gauche. Vérifier avec `df['clé'].value_counts()` dans la table de droite.
7. **A**
8. `apply` est une boucle Python déguisée — lent sur les gros DataFrames. Les opérations vectorisées (numpy) sont 100-1000× plus rapides car elles exécutent le calcul en C.
9. `df['ca_pct'] = df.groupby('région')['ca'].transform(lambda x: x / x.sum() * 100)`. Transform retourne une Series de même longueur que df, ce qui permet d'ajouter directement la colonne normalisée.
10. **A**
11. Pipe rend le code lisible (chaque étape a un nom), testable (chaque fonction est indépendante), et réutilisable. `df.pipe(nettoyer).pipe(enrichir)` est plus clair qu'une série de 15 assignations.
12. Utiliser `pivot_table` avec `aggfunc='first'` ou `aggfunc='sum'` selon le cas, ou dédoublonner avant le pivot avec `drop_duplicates`.
13. **A**
14. Exécuter étape par étape, vérifier la forme et les valeurs après chaque étape (`.head()`, `.shape`, `.describe()`), utiliser `pipe` avec des fonctions qui logguent leurs résultats intermédiaires.
15. **A**

### C. Corrigé — Module 3 (Feature engineering)
1. **A**
2. **A**
3. **A**
4. Les données brutes ne capturent pas toujours la logique métier. Une feature comme "ancienneté" ou "taux de conversion" n'existe pas dans les données mais est cruciale pour l'analyse. Le feature engineering injecte la connaissance du domaine dans les données.
5. Min-Max : valeurs garanties entre 0 et 1, sensible aux outliers. Utile quand on a besoin de bornes fixes (réseaux de neurones avec sigmoid). Z-score : pas de bornes, robuste aux outliers. Préféré en pratique pour l'analyse exploratoire.
6. Problème : explosion dimensionnelle (curse of dimensionality), les algorithmes deviennent lents et moins performants. Solutions : regrouper les catégories rares en "Autre", utiliser l'encodage par fréquence (frequency encoding), ou utiliser un embedding pour les très grandes cardinalités.
7. **A**
8. Le Label Encoding crée un ordre artificiel : si pays=1, pays=2, pays=3, le modèle interprète 1<2<3 comme une relation d'ordre. Pour une régression linéaire, ça peut créer des patterns inexistants. One-hot est plus sûr pour les variables nominales.
9. Année, mois, jour, jour de la semaine (0-6), weekend (booléen), trimestre, semaine de l'année, jour férié (via une table de référence), heure (si le timestamp a l'heure). Le choix dépend de la question métier.
10. **A**
11. Parce que la pertinence d'une feature dépend du domaine : "montant/anomalie_moyenne_client" est pertinent pour la détection de fraude mais pas pour l'analyse des ventes. Un bon feature engineering nécessite de comprendre le métier.
12. La transaction est à plus de 3 écarts-types de la moyenne du client — statistiquement très inhabituelle. C'est un signal fort de fraude potentielle ou d'erreur. En loi normale, seules 0.3% des valeurs dépassent ±3σ.
13. **A**
14. Vérifier sa corrélation avec la variable cible, analyser sa distribution (pas de valeurs aberrantes excessives), tester si elle améliore le modèle (ajouter la feature et mesurer la performance), et surtout : est-ce qu'elle a du sens métier ?
15. **A**

### D. Corrigé — Module 4 (Optimisation)
1. **A**
2. **A**
3. **A**
4. `object` stocke un pointeur vers chaque chaîne de caractères (allocation dynamique). `category` stocke les valeurs uniques une seule fois et utilise des codes entiers pour les référencer → économie massive quand il y a peu de valeurs uniques.
5. `apply` itère sur chaque ligne en Python (lent). Une opération vectorisée (`df['a'] + df['b']`) délègue le calcul à numpy/C qui travaille sur des tableaux entiers (rapide). Ratio typique : 100-500× plus rapide.
6. Changé les `object` en `category` pour les colonnes texte à faible cardinalité, réduit les `int64` en `int32/int16`, `float64` en `float32`. Gain typique : 60-80%.
7. **A**
8. Un groupby global a besoin de voir toutes les lignes pour calculer l'agrégation finale. En chunking, il faut agréger partiellement par chunk puis fusionner les résultats (chunk1 sum + chunk2 sum = somme totale). Pour `mean`, il faut aussi compter le nombre d'éléments.
9. La colonne contient des valeurs qui dépassent la capacité de `int8` (max 127). Par exemple des âges < 0 ou > 127, ou des NaN. Vérifier avec `df['col'].describe()` et `df['col'].isnull().sum()`.
10. **A**
11. Downcaster les types numériques, convertir les `object` en `category`, supprimer les colonnes inutiles, utiliser `to_parquet` (format compressé colonne) plutôt que `to_csv`. Parquet avec compression snappy peut diviser la taille par 10.
12. L'agrégation n'est pas "cumulable" simplement. Pour une somme, cumuler les résultats de chaque chunk fonctionne. Pour une moyenne, il faut la somme ET le compte. Pour un tri ou un classement, le chunking naïf ne marche pas — il faut un algorithme de merge externe.
13. **A**
14. Pour anticiper les MemoryError, choisir la bonne stratégie (chunking, Dask, Spark), optimiser avant de sauvegarder, et surveiller que les transformations n'explosent pas la mémoire (un merge peut multiplier la taille).
15. **A**

### E. Corrigé — Module 5 (Labs + Banque + P1)
1. **A**
2. **A**
3. Un script pandas optimisé (chunking + dtypes + vectorisation) + un rapport montrant le gain de performance (avant/après).
4. **A**
5. **A**
6. Le data analyst doit pouvoir traiter des volumes qui dépassent Excel : pandas optimisé pour les millions de lignes, concepts Big Data pour les volumes encore plus grands, feature engineering pour enrichir l'analyse.
7. **A**
8. Capacité à traiter un fichier > 1 Go sur une machine standard sans MemoryError, en produisant un résultat correct.
9. **A**
10. **A**
11. Pour réduire l'espace disque (stockage), accélérer le rechargement, et permettre le partage par email ou sur GitHub (limites de taille).
12. "Excel est limité à ~1M de lignes et devient lent bien avant. Pour les analyses reproductibles sur des volumes importants, pandas est plus rapide, plus puissant (groupby, merge, pivot), et versionnable dans Git."
13. **A**
14. "J'ai traité 5 millions de transactions sur une machine standard. Voici comment j'ai optimisé le traitement (chunking, vectorisation), les features que j'ai créées, et les insights que j'en ai tirés."
15. **A**