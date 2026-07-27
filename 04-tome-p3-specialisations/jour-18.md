# TOME P3-B — Jour 18 (14h)

## Découpage horaire opérationnel J18
- Statistiques descriptives fondamentales (moyenne, médiane, écart-type, variance, quartiles) — **4h**
- Probabilités et distributions (loi normale, corrélation vs causalité) — **3h**
- Pratique Excel (formules statistiques, TCD, graphiques) — **3h**
- Pratique Python (pandas, numpy, statistiques descriptives) — **3h**
- Banque de questions + suivi P1 — **1h**

---

## 1) Statistiques descriptives fondamentales (4h)

### Objectifs d'apprentissage
- Calculer et interpréter la moyenne, la médiane, le mode, l'écart-type et la variance.
- Comprendre la différence entre moyenne et médiane, et savoir quand utiliser l'une plutôt que l'autre.
- Interpréter les quartiles, l'intervalle interquartile et détecter les valeurs aberrantes.
- Expliquer ce que mesure l'écart-type en termes métier (dispersion des données).
- Reconnaître les pièges courants : moyenne trompeuse, données asymétriques, valeurs extrêmes.

### Contenu pédagogique
Les statistiques descriptives permettent de résumer un jeu de données en quelques chiffres clés. C'est la première étape de toute analyse de données.

Points clés:
1. **Moyenne (mean)** : somme des valeurs divisée par le nombre de valeurs. Sensible aux valeurs extrêmes (un salaire de DG peut doubler la moyenne des salaires).
2. **Médiane (median)** : valeur qui partage les données en deux moitiés égales (50% au-dessus, 50% en-dessous). Robuste aux valeurs extrêmes. Si la moyenne est très différente de la médiane, les données sont asymétriques.
3. **Mode** : valeur la plus fréquente. Utile pour les données catégorielles (ex: le système d'exploitation le plus utilisé).
4. **Écart-type (std)** : mesure de la dispersion des données autour de la moyenne. Un petit écart-type = données regroupées (ex: les salaires d'une équipe homogène). Un grand écart-type = données dispersées (ex: salaires dans une entreprise avec des écarts hiérarchiques importants).
5. **Variance** : carré de l'écart-type. Moins intuitive mais utile pour les calculs statistiques avancés.
6. **Quartiles** : Q1 (25% des données en dessous), Q2 (médiane, 50%), Q3 (75% en dessous). L'intervalle interquartile (IQR = Q3 - Q1) mesure la dispersion des 50% centraux.
7. **Valeurs aberrantes (outliers)** : valeurs extrêmes qui s'écartent significativement du reste. Méthode de détection : valeur < Q1 - 1.5×IQR ou > Q3 + 1.5×IQR. Ne pas les supprimer aveuglément — elles peuvent cacher une information importante (fraude, bug, opportunité).
8. **Piège de la moyenne** : "Si je mets un pied dans l'eau bouillante et l'autre dans la glace, en moyenne je suis bien." → toujours regarder la médiane et l'écart-type en complément de la moyenne.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : calculer manuellement la moyenne, la médiane et l'écart-type de la série : [12, 15, 18, 22, 25, 25, 28, 30, 100]. Interpréter la différence entre moyenne et médiane.
   - **Corrigé détaillé** : Moyenne = (12+15+18+22+25+25+28+30+100)/9 = 275/9 = 30,56. Médiane (9 valeurs) = 5e valeur = 25. Écart-type ≈ 26,5. La moyenne (30,56) est nettement supérieure à la médiane (25) → la valeur 100 tire la moyenne vers le haut. La médiane est plus représentative de "l'employé type". Sans le 100, la moyenne serait 21,9.
2. **Exercice 2 (intermédiaire)** : analyser un jeu de données de salaires (20 salariés + 1 DG). Calculer moyenne, médiane, Q1, Q3, IQR, écarts-types avec et sans le DG. Conclure sur la distribution.
   - **Corrigé détaillé** : Salaires : 25K, 28K, 30K, 30K, 32K, 33K, 35K, 35K, 36K, 37K, 38K, 40K, 40K, 42K, 43K, 45K, 45K, 48K, 50K, 55K + DG : 250K. Avec DG : moyenne=45,7K (trompeuse), médiane=37,5K (représentative), Q1=32,5K, Q3=45K, IQR=12,5K. Sans DG : moyenne=38,4K, médiane=37,5K (proches → distribution symétrique sans le DG). Le DG est un outlier (250K > 45K + 1,5×12,5K = 63,75K). Conclusion : toujours analyser les outliers avant de calculer les statistiques.
3. **Exercice 3 (avancé)** : on te donne les statistiques d'un service client : temps moyen de réponse = 4 minutes. Tu regardes les données brutes et découvres que 80% des réponses prennent moins de 2 minutes, mais 5% prennent plus de 2 heures. Explique le phénomène et propose une meilleure métrique.
   - **Corrigé détaillé** : La moyenne est tirée vers le haut par les 5% de réponses très longues (probablement des cas complexes ou escaladés). La médiane serait autour de 1-2 minutes, bien plus représentative de l'expérience client typique. Meilleures métriques : médiane (temps typique), percentile 95 (temps max pour 95% des clients), et analyser séparément les cas longs (pourquoi ? Comment les réduire ?). C'est un exemple classique de distribution asymétrique (longue traîne à droite).

### Nouvelles abréviations rencontrées
- IQR | Interquartile Range | Écart entre Q3 et Q1, mesure la dispersion des 50% centraux | Interagit avec les quartiles, la détection d'outliers, les boxplots

### Banque de questions du module (15)
1. QCM: la moyenne est sensible... A) aux valeurs extrêmes B) uniquement à la médiane C) à rien
2. QCM: la médiane partage les données en... A) deux moitiés égales B) quatre parties C) dix parties
3. QCM: l'écart-type mesure... A) la dispersion des données B) la valeur maximale C) la somme
4. Ouverte: pourquoi la moyenne peut-elle être trompeuse ?
5. Ouverte: différence entre moyenne et médiane, quand utiliser l'une ou l'autre ?
6. Cas: salaire moyen = 50K, salaire médian = 35K. Qu'en déduis-tu ?
7. QCM: Q1 représente... A) 25% des données en dessous B) 50% C) 75%
8. Ouverte: comment détecter une valeur aberrante avec les quartiles ?
9. Cas: un écart-type de 2 sur des notes sur 20 vs un écart-type de 2 sur des salaires en milliers. Même interprétation ?
10. QCM: l'IQR est... A) Q3 - Q1 B) Q3 + Q1 C) Q3 / Q1
11. Ouverte: pourquoi ne pas supprimer automatiquement les outliers ?
12. Cas: tu analyses les temps de chargement d'un site web. Moyenne = 1,2s. 10% des mesures > 8s. Problème ?
13. QCM: la variance est... A) le carré de l'écart-type B) la racine carrée de l'écart-type C) égale à la médiane
14. Ouverte: comment expliquer la notion d'écart-type à un manager ?
15. QCM: résultat attendu du module 1 = A) calculer et interpréter les statistiques descriptives B) mémoriser les formules C) éviter les données

---

## 2) Probabilités et distributions (3h)

### Objectifs d'apprentissage
- Comprendre la notion de distribution et de loi normale.
- Interpréter un histogramme et reconnaître une distribution asymétrique, bimodale, ou uniforme.
- Distinguer corrélation et causalité avec des exemples concrets.
- Calculer et interpréter un coefficient de corrélation.
- Appliquer la règle empirique 68-95-99.7 (loi normale).

### Contenu pédagogique
Les probabilités et distributions permettent de modéliser l'incertitude et de faire des prédictions.

Points clés:
1. **Distribution** = comment les valeurs d'une variable se répartissent. Représentée par un histogramme.
2. **Loi normale (courbe en cloche)** : distribution symétrique où la plupart des valeurs se concentrent autour de la moyenne. Très courante dans la nature et les processus industriels (tailles, poids, erreurs de mesure, notes à un examen).
3. **Règle 68-95-99.7** : dans une loi normale, 68% des valeurs sont à ±1 écart-type de la moyenne, 95% à ±2, 99.7% à ±3. Exemple métier : si le temps moyen de réponse est 100ms avec un écart-type de 15ms, 95% des réponses sont entre 70ms et 130ms.
4. **Distributions asymétriques** : asymétrie droite (queue à droite) — salaires, temps de réponse, montants d'achat. Asymétrie gauche — notes faciles, âge de décès. L'asymétrie impacte le choix entre moyenne et médiane.
5. **Distribution bimodale** : deux pics = deux populations distinctes dans les données. Exemple : temps de connexion des utilisateurs (un pic à 9h, un pic à 18h). Indique qu'il faut segmenter l'analyse.
6. **Corrélation** : mesure la force et la direction d'une relation linéaire entre deux variables. Coefficient de corrélation r ∈ [-1, +1]. r=1 : corrélation positive parfaite. r=0 : aucune corrélation linéaire. r=-1 : corrélation négative parfaite.
7. **⚠️ Corrélation ≠ Causalité** : "Les ventes de glaces sont corrélées aux noyades" → les deux augmentent en été (chaleur), mais les glaces ne causent pas les noyades. Variable cachée : la température. Toujours se demander : y a-t-il une troisième variable qui explique les deux ?
8. **Exemples de corrélations utiles en IT** : charge CPU et temps de réponse (positive), espace disque libre et risque de panne (négative), nombre d'utilisateurs connectés et consommation RAM (positive).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : tracer et interpréter un histogramme simple à partir d'une série de 30 temps de réponse (données fournies : majoritairement entre 50-150ms, quelques valeurs > 500ms). Identifier le type de distribution.
   - **Corrigé détaillé** : Histogramme montrant une concentration entre 50-150ms (pic) et une traîne à droite (>500ms). Distribution asymétrique droite (longue traîne). Implications : la moyenne sera supérieure à la médiane, les SLA doivent être définis avec un percentile (P95), pas avec la moyenne.
2. **Exercice 2 (intermédiaire)** : calculer le coefficient de corrélation entre le nombre d'utilisateurs connectés et la consommation RAM sur un serveur (séries fournies). Interpréter r=0.89.
   - **Corrigé détaillé** : r = 0.89 (forte corrélation positive) : quand le nombre d'utilisateurs augmente, la RAM consommée augmente aussi de façon quasi linéaire. Application métier : on peut prédire la RAM nécessaire pour N utilisateurs, ce qui aide au dimensionnement. Attention : corrélation forte ne signifie pas causalité directe — peut-être qu'une application tierce consomme plus de RAM quand il y a plus d'utilisateurs.
3. **Exercice 3 (avancé)** : on te présente une étude "Les entreprises qui utilisent le cloud ont 30% de croissance en plus". Analyse critique : corrélation ou causalité ? Quelles variables cachées possibles ? Comment tester la causalité ?
   - **Corrigé détaillé** : Corrélation ≠ causalité. Variables cachées possibles : les entreprises qui adoptent le cloud sont probablement plus innovantes, mieux financées, ou en croissance avant même l'adoption du cloud (biais de sélection). La croissance cause peut-être l'adoption du cloud (elles ont les moyens d'investir). Pour tester la causalité : comparer des entreprises similaires avec et sans cloud (groupe témoin), ou analyser la croissance avant/après adoption. Sans groupe témoin, on ne peut pas conclure à un lien causal.

### Nouvelles abréviations rencontrées
- P95/P99 | 95th/99th Percentile | Valeur en dessous de laquelle se trouvent 95%/99% des données | Interagit avec les SLA, les performances, la détection d'anomalies
- r | (coefficient de corrélation de Pearson) | Mesure de la force et direction d'une relation linéaire entre deux variables | Interagit avec les graphiques de dispersion, la régression, les prédictions

### Banque de questions du module (15)
1. QCM: une loi normale est... A) symétrique en forme de cloche B) toujours croissante C) plate
2. QCM: dans une loi normale, 95% des données sont à... A) ±1 écart-type B) ±2 écarts-types C) ±3 écarts-types
3. QCM: un coefficient de corrélation de -0.9 indique... A) une forte corrélation négative B) aucune corrélation C) une erreur
4. Ouverte: pourquoi "corrélation n'implique pas causalité" ?
5. Ouverte: qu'est-ce qu'une distribution bimodale et que suggère-t-elle ?
6. Cas: tu observes que les pics de tickets support sont corrélés aux déploiements du vendredi. Causalité ?
7. QCM: un histogramme sert à... A) visualiser la distribution d'une variable B) calculer la moyenne C) remplacer Excel
8. Ouverte: intérêt du percentile 95 par rapport à la moyenne pour un SLA ?
9. Cas: un RSSI dit "les antivirus réduisent les infections de 80%". Corrélation ou causalité ?
10. QCM: une distribution asymétrique droite a... A) une queue à droite B) une queue à gauche C) deux pics
11. Ouverte: comment expliquer la règle 68-95-99.7 à un collègue ?
12. Cas: r=0.3 entre âge du serveur et pannes. Interprétation ?
13. QCM: un nuage de points (scatter plot) montre... A) la relation entre deux variables B) une seule variable C) du texte
14. Ouverte: exemple de corrélation utile dans ton futur poste ?
15. QCM: résultat attendu du module 2 = A) interpréter des distributions et corrélations B) calculer sans comprendre C) ignorer les graphiques

---

## 3) Pratique Excel — formules statistiques, TCD, graphiques (3h)

### Objectifs d'apprentissage
- Utiliser les fonctions statistiques Excel (MOYENNE, MEDIANE, ECARTYPE, QUARTILE, CORRELATION).
- Créer un Tableau Croisé Dynamique (TCD) pour synthétiser des données.
- Produire des graphiques statistiques pertinents (histogramme, boîte à moustaches, nuage de points).
- Automatiser l'analyse avec des formules et la mise en forme conditionnelle.
- Présenter des résultats statistiques de façon claire pour un public non technique.

### Contenu pédagogique
Excel reste l'outil le plus utilisé en entreprise pour l'analyse de données rapide. Maîtriser ses fonctions statistiques est un prérequis pour tout professionnel du numérique.

Points clés:
1. **Fonctions statistiques essentielles** : `=MOYENNE(plage)`, `=MEDIANE(plage)`, `=MODE(plage)`, `=ECARTYPE.STANDARD(plage)`, `=VAR.STANDARD(plage)`, `=QUARTILE.INCLURE(plage, quart)`, `=CENTILE(plage, k)`, `=COEFFICIENT.CORRELATION(plage1, plage2)`.
2. **Tableau Croisé Dynamique (TCD)** : outil le plus puissant d'Excel pour synthétiser des données. Permet de croiser deux dimensions (ex: ventes par mois et par produit) et d'appliquer des calculs (somme, moyenne, comptage). Étapes : sélectionner les données → Insertion → TCD → choisir lignes, colonnes, valeurs.
3. **Graphiques statistiques** : (a) **Histogramme** : distribution d'une variable (Excel : Insertion → Graphique statistique → Histogramme). (b) **Boîte à moustaches (boxplot)** : montre médiane, quartiles, outliers en un seul graphique. (c) **Nuage de points (scatter)** : relation entre deux variables, avec possibilité d'ajouter une courbe de tendance et le R².
4. **Mise en forme conditionnelle** : surligner automatiquement les valeurs > moyenne + 2 écarts-types (outliers), les top 10%, les valeurs en baisse. Accueil → Mise en forme conditionnelle → Règles de mise en surbrillance.
5. **Présenter des statistiques** : toujours contextualiser (comparaison avant/après, par rapport à un objectif), utiliser des graphiques plutôt que des tableaux de chiffres, expliquer ce que le chiffre signifie concrètement pour le métier.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : importer un jeu de données CSV (ventes mensuelles sur 2 ans, 24 lignes). Calculer la moyenne, la médiane, l'écart-type des ventes. Créer un graphique en courbes avec courbe de tendance.
   - **Corrigé détaillé** : Importer CSV (Données → À partir d'un fichier CSV). Formules : `=MOYENNE(B2:B25)`, `=MEDIANE(B2:B25)`, `=ECARTYPE.STANDARD(B2:B25)`. Graphique : Insérer → Courbes → sélectionner les données → ajouter une courbe de tendance linéaire → afficher l'équation et R². Interpréter : si R² > 0.7, la tendance est fiable ; si R² < 0.3, il n'y a pas de tendance claire.
2. **Exercice 2 (intermédiaire)** : créer un TCD à partir d'un jeu de données "tickets IT" avec colonnes : date, catégorie (réseau, logiciel, matériel), priorité (P1-P4), temps de résolution (heures). Croiser catégorie et priorité, afficher le temps moyen de résolution.
   - **Corrigé détaillé** : TCD : Lignes = Catégorie, Colonnes = Priorité, Valeurs = Moyenne de temps_résolution. Résultat : un tableau croisé montrant le temps moyen par catégorie et priorité. Interprétation : les P1 réseau prennent-ils plus de temps que les P1 logiciel ? Où concentrer les efforts d'amélioration ? Ajouter un filtre par mois pour analyser les tendances.
3. **Exercice 3 (avancé)** : analyser un jeu de données "performances serveurs" (CPU, RAM, disque, latence sur 30 jours). Identifier les outliers avec la mise en forme conditionnelle, créer un dashboard avec 3 graphiques (histogramme latence, nuage de points CPU vs RAM, boîte à moustaches CPU par jour de la semaine).
   - **Corrigé détaillé** : Mise en forme conditionnelle : `=B2>MOYENNE(B:B)+2*ECARTYPE.STANDARD(B:B)` appliqué à toutes les colonnes → outliers en rouge. Dashboard : 1) Histogramme latence → distribution (normale ? asymétrique ?). 2) Nuage CPU vs RAM → corrélation ? Ajouter R². 3) Boxplot CPU par jour → y a-t-il un jour plus chargé (ex: lundi matin) ? Conclusion : si la latence est asymétrique, ne pas utiliser la moyenne pour le SLA mais le P95.

### Nouvelles abréviations rencontrées
- TCD | Tableau Croisé Dynamique | Outil Excel de synthèse et croisement de données | Interagit avec les bases de données, les exports CSV, les rapports
- R² | Coefficient de détermination | Mesure la qualité d'une régression (proportion de variance expliquée, de 0 à 1) | Interagit avec la corrélation, les courbes de tendance, la prédiction

### Banque de questions du module (15)
1. QCM: un TCD permet de... A) croiser et synthétiser des données B) écrire du code C) remplacer un serveur
2. QCM: `=MEDIANE(A1:A100)` retourne... A) la valeur centrale B) la moyenne C) la somme
3. QCM: un boxplot montre... A) la médiane, les quartiles et les outliers B) uniquement la moyenne C) du texte
4. Ouverte: pourquoi utiliser un TCD plutôt que des formules manuelles ?
5. Ouverte: différence entre un histogramme et un nuage de points.
6. Cas: tu dois présenter les performances serveur à un directeur. Quel graphique choisis-tu ?
7. QCM: la mise en forme conditionnelle sert à... A) surligner automatiquement selon des règles B) supprimer des données C) formater le disque
8. Ouverte: intérêt du R² dans une courbe de tendance.
9. Cas: le TCD montre "Erreur : la source de données n'est pas valide". Diagnostic ?
10. QCM: `=ECARTYPE.STANDARD()` vs `=ECARTYPE.POPULATION()` — laquelle pour un échantillon ?
11. Ouverte: comment rendre un graphique compréhensible par un non-technique ?
12. Cas: 100 000 lignes de données. Excel rame. Solutions ?
13. QCM: objectif du module 3 = A) analyser des données avec Excel de façon professionnelle B) taper des chiffres C) éviter Excel
14. Ouverte: comment automatiser une analyse hebdomadaire dans Excel ?
15. QCM: résultat attendu = A) dashboard statistique + TCD + graphiques B) feuille vide C) données brutes sans analyse

---

## 4) Pratique Python — pandas, numpy, statistiques descriptives (3h)

### Objectifs d'apprentissage
- Charger et explorer un jeu de données avec pandas (read_csv, head, info, describe).
- Calculer les statistiques descriptives avec numpy et pandas.
- Nettoyer les données (valeurs manquantes, doublons, types).
- Créer des visualisations statistiques avec matplotlib/seaborn.
- Exporter les résultats d'analyse de façon reproductible (script Python).

### Contenu pédagogique
Python est l'outil de référence pour l'analyse de données à grande échelle. pandas est la librairie centrale.

Points clés:
1. **Chargement des données** : `pd.read_csv('fichier.csv')`, `.head()` (5 premières lignes), `.info()` (types, valeurs manquantes), `.describe()` (statistiques descriptives automatiques : count, mean, std, min, 25%, 50%, 75%, max).
2. **Statistiques avec pandas** : `df['colonne'].mean()`, `.median()`, `.std()`, `.quantile([0.25, 0.5, 0.75])`, `.corr()` (matrice de corrélation entre toutes les colonnes numériques), `.value_counts()` (fréquences).
3. **Nettoyage des données** : `df.isnull().sum()` (compter les valeurs manquantes), `df.dropna()` (supprimer les lignes avec valeurs manquantes), `df.fillna(valeur)` (remplacer les valeurs manquantes), `df.drop_duplicates()` (supprimer les doublons), `df['colonne'].astype('int')` (convertir les types).
4. **Visualisation** : matplotlib (`plt.hist()`, `plt.scatter()`, `plt.boxplot()`) et seaborn (`sns.heatmap(df.corr())` pour visualiser la matrice de corrélation, `sns.pairplot()` pour explorer les relations entre toutes les variables).
5. **Analyse reproductible** : écrire un script Python (`.py`) qui charge les données, les nettoie, produit les statistiques et les graphiques. Avantage : reproductible (un collègue peut le relancer), versionnable (dans Git), scalable (marche sur 1 000 ou 1 000 000 lignes).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : charger un CSV "logs_serveur.csv" (date, cpu, ram, disque, latence). Afficher `.info()`, `.describe()`, calculer la moyenne et l'écart-type de la colonne "latence".
   - **Corrigé détaillé** : `df = pd.read_csv('logs_serveur.csv')` ; `print(df.info())` → vérifier types et valeurs manquantes ; `print(df.describe())` → statistiques automatiques ; `print(f"Moyenne latence: {df['latence'].mean():.2f}ms, Écart-type: {df['latence'].std():.2f}ms")`. Si latence moyenne = 120ms et std = 80ms → forte variabilité, investiguer.
2. **Exercice 2 (intermédiaire)** : nettoyer un jeu de données "tickets_it.csv" contenant des valeurs manquantes (temps_resolution parfois vide) et des doublons. Calculer le temps moyen de résolution par priorité avant et après nettoyage. Expliquer l'impact du nettoyage.
   - **Corrigé détaillé** : Avant nettoyage : 1050 lignes, 30 NaN dans temps_resolution, 5 doublons. `df_clean = df.dropna(subset=['temps_resolution']).drop_duplicates()`. Après : 1015 lignes. Temps moyen P1 avant = 2.3h, après = 2.5h (les NaN étaient des tickets rapides ?). Impact : le nettoyage change les résultats → toujours documenter les choix de nettoyage et leur justification.
3. **Exercice 3 (avancé)** : analyser un jeu de données "ventes.csv" (date, produit, région, montant, quantité). Produire : statistiques descriptives par région, matrice de corrélation, graphique des ventes par mois, export du rapport en PNG. Le tout dans un script Python reproductible.
   - **Corrigé détaillé** : Script structuré : 1) Chargement et nettoyage. 2) `df.groupby('région').agg({'montant': ['mean', 'median', 'std', 'sum']})` → tableau stats par région. 3) `sns.heatmap(df[['montant', 'quantité']].corr(), annot=True)` → corrélation montant/quantité. 4) `df.groupby(df['date'].dt.month)['montant'].sum().plot(kind='bar')` → ventes mensuelles. 5) `plt.savefig('rapport_ventes.png', dpi=150)` → export. Le script est réutilisable chaque mois avec un nouveau CSV.

### Nouvelles abréviations rencontrées
- NaN | Not a Number | Valeur manquante ou non définie dans un jeu de données | Interagit avec pandas, le nettoyage, les statistiques
- CSV | *(déjà existant, section L)* | Format tabulaire pour l'import/export de données | Interagit avec pandas (`read_csv`), Excel, les bases de données

### Banque de questions du module (15)
1. QCM: pandas est une librairie Python pour... A) l'analyse de données B) le développement web C) les jeux vidéo
2. QCM: `df.describe()` retourne... A) les statistiques descriptives B) le contenu du fichier C) une erreur
3. QCM: `.dropna()` sert à... A) supprimer les valeurs manquantes B) supprimer le fichier C) supprimer Python
4. Ouverte: pourquoi est-il important de nettoyer les données avant l'analyse ?
5. Ouverte: différence entre `.mean()` et `.median()` en pandas.
6. Cas: `df.info()` montre qu'une colonne "prix" est de type `object` au lieu de `float`. Problème et correction ?
7. QCM: `.corr()` retourne... A) la matrice de corrélation B) une seule valeur C) rien
8. Ouverte: pourquoi préférer un script Python à une analyse Excel pour des données volumineuses ?
9. Cas: `df['temps'].mean()` retourne `nan`. Cause probable ?
10. QCM: `sns.heatmap()` sert à... A) visualiser une matrice de corrélation B) afficher du texte C) remplacer Excel
11. Ouverte: comment gérer les valeurs aberrantes dans pandas ?
12. Cas: après nettoyage, le jeu de données passe de 10 000 à 3 000 lignes. Problème ?
13. QCM: objectif du module 4 = A) analyser des données avec Python de façon reproductible B) installer des librairies C) éviter le code
14. Ouverte: pourquoi versionner tes scripts d'analyse dans Git ?
15. QCM: résultat attendu = A) script Python d'analyse reproductible B) données non nettoyées C) une seule statistique

---

## 5) Banque de questions + suivi P1 (1h)

### Objectifs d'apprentissage
- Valider les acquis J18 en format test.
- Transformer J18 en preuve employable immédiate.

### Contenu pédagogique
- 40 min test mixte J18.
- 20 min correction + plan J19.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : rédiger une ligne CV intégrant une compétence J18 (analyse de données).
   - **Corrigé détaillé** : "Analyse statistique de données avec Python (pandas, numpy) et Excel (TCD, graphiques) — calcul d'indicateurs (moyenne, médiane, écart-type) et détection d'anomalies."
2. **Exercice 2 (intermédiaire)** : pitch 60s "Pourquoi l'analyse de données est utile même pour un admin système".
   - **Corrigé détaillé** : Un admin système produit et consomme des données en continu : logs, métriques, tickets. Savoir analyser ces données permet de détecter des tendances (dégradation lente avant panne), de justifier des investissements (plus de RAM car corrélation utilisateurs/consommation), et de prouver l'efficacité de son travail (MTTR en baisse de 30% après automatisation).
3. **Exercice 3 (avancé)** : plan J19 en 3 priorités mesurables.
   - **Corrigé détaillé** : 1) Maîtriser les requêtes SQL analytiques (fenêtres, agrégations complexes, sous-requêtes corrélées). 2) Appliquer le nettoyage de données sur un jeu de données réel (doublons, valeurs manquantes, formats). 3) Préparer un exemple "j'ai nettoyé et analysé ce jeu de données, voici ce que j'ai découvert".

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: objectif final J18 = A) statistiques descriptives opérationnelles B) théorie sans pratique C) aucun livrable
2. Ouverte: meilleure preuve de compétence analyse de données à montrer à un recruteur ?
3. QCM: ligne CV data forte = A) outil + action + résultat B) "j'aime les données" C) vide
4. Cas: le recruteur demande "Comment analyseriez-vous les logs de notre serveur ?"
5. Ouverte: comment relier J18 au poste d'admin système/data junior ?
6. QCM: plan J19 doit être... A) mesurable B) flou C) optionnel
7. Ouverte: quelle preuve data publier sur le portfolio ce soir ?
8. QCM: la correction immédiate en data sert à... A) ancrer les concepts B) repousser C) copier
9. Cas: on te donne un CSV de 50 000 lignes. Par où commencer ?
10. QCM: preuve solide = A) script Python + graphiques + interprétation B) données brutes C) une capture floue
11. Ouverte: pourquoi montrer un script d'analyse commenté sur ton portfolio ?
12. Cas: "Vous utilisez Excel ou Python pour vos analyses ?" — Réponse ?
13. QCM: remédiation utile = A) identifier et corriger la lacune B) tout recommencer C) abandonner
14. Ouverte: indicateur de progression J18 pertinent ?
15. QCM: résultat P1 réussi = A) portfolio enrichi + compétence data prouvée B) rien C) théorie sans application

---

## Validation qualité J18 (anti-superficiel)

### Livrables obligatoires fin de J18
1. 1 analyse statistique complète d'un jeu de données (moyenne, médiane, écart-type, quartiles, outliers).
2. 1 TCD Excel croisant deux dimensions avec interprétation métier.
3. 1 script Python reproductible (pandas) produisant des statistiques et graphiques.
4. 1 dashboard de synthèse (Excel ou Python) avec au moins 3 graphiques commentés.
5. 1 preuve portfolio (capture dashboard + script) + mise à jour CV ligne analyse de données.

### Grille d'évaluation rapide (100 points)
- Maîtrise des statistiques descriptives (concepts, calculs, interprétation) : **25 pts**
- Compréhension des distributions et corrélations (loi normale, causalité, pièges) : **20 pts**
- Maîtrise Excel (TCD, fonctions, graphiques) : **20 pts**
- Maîtrise Python/pandas (script reproductible, nettoyage, visualisation) : **25 pts**
- Communication technique employabilité : **10 pts**

### Seuil attendu
- **>= 80/100** : J18 validé, passage normal J19.
- **65-79/100** : validé sous remédiation ciblée 24h.
- **< 65/100** : consolidation statistiques requise avant J19.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Statistiques descriptives)
1. **A**
2. **A**
3. **A**
4. Parce qu'elle est sensible aux valeurs extrêmes. Un milliardaire dans un échantillon de 100 personnes double la moyenne des salaires, rendant la moyenne non représentative de "l'habitant type".
5. Moyenne = sensible aux extrêmes, utile pour les distributions symétriques. Médiane = robuste aux extrêmes, utile pour les distributions asymétriques (salaires, temps de réponse). Regarder les deux et comparer.
6. Distribution asymétrique à droite : quelques hauts salaires tirent la moyenne vers le haut. La majorité des employés gagne autour de 35K. La médiane est plus représentative.
7. **A**
8. Calculer Q1, Q3 et IQR. Une valeur est aberrante si elle est < Q1 - 1.5×IQR ou > Q3 + 1.5×IQR.
9. Non. Écart-type de 2 sur des notes/20 = dispersion modérée (10% de l'échelle). Écart-type de 2 sur des salaires en milliers (ex: moyenne 40K) = 2 000€ d'écart-type, soit 5% de la moyenne — dispersion plus faible relativement. Toujours rapporter l'écart-type à la moyenne (coefficient de variation).
10. **A**
11. Parce qu'un outlier peut cacher une information précieuse : fraude, opportunité, bug, nouveau phénomène. Il faut l'analyser avant de décider de le garder ou de le traiter.
12. La moyenne de 1,2s est trompeuse car tirée vers le bas par la majorité des mesures rapides. Les 10% > 8s indiquent un problème (timeouts ? requêtes lourdes ?). Utiliser le P95 (temps max pour 95% des utilisateurs) plutôt que la moyenne pour définir un SLA.
13. **A**
14. "L'écart-type mesure à quel point les données sont dispersées autour de la moyenne. Petit écart-type = tout le monde est proche de la moyenne (prévisible). Grand écart-type = beaucoup de variabilité (risque)."
15. **A**

### B. Corrigé — Module 2 (Probabilités et distributions)
1. **A**
2. **B**
3. **A**
4. Deux variables peuvent être corrélées sans lien causal direct : une troisième variable cachée peut influencer les deux (ex: ventes de glaces et noyades → variable cachée = chaleur estivale), ou la corrélation peut être fortuite.
5. Deux pics distincts = deux populations différentes dans les données. Suggère qu'il faut segmenter l'analyse plutôt que de traiter l'ensemble comme homogène.
6. Probablement causal : les déploiements du vendredi introduisent des bugs qui génèrent des tickets. Hypothèse testable : comparer les semaines avec et sans déploiement du vendredi.
7. **A**
8. La moyenne peut être trompeuse (valeurs extrêmes). Le P95 garantit que 95% des utilisateurs ont un temps inférieur à ce seuil, ce qui est plus pertinent pour l'expérience utilisateur.
9. Causalité probable (les antivirus bloquent effectivement les malwares), mais le chiffre de 80% peut être exagéré. Vérifier la méthodologie : groupe témoin ? Taille de l'échantillon ? Autres facteurs (pare-feu, formation utilisateurs) ?
10. **A**
11. "Dans beaucoup de phénomènes naturels ou industriels, les données se répartissent en cloche. 68% des valeurs sont proches de la moyenne (à moins d'un écart-type), 95% à moins de deux écarts-types, et presque tout (99.7%) à moins de trois."
12. Faible corrélation positive : l'âge du serveur explique peu la fréquence des pannes (seulement 9% de la variance). D'autres facteurs sont plus déterminants (maintenance, charge, qualité du matériel).
13. **A**
14. Exemples : corrélation entre l'espace disque libre et les incidents (anticiper les pannes), corrélation entre les mises à jour et les performances (évaluer l'impact), corrélation entre le nombre d'utilisateurs et le temps de réponse (dimensionner).
15. **A**

### C. Corrigé — Module 3 (Excel)
1. **A**
2. **A**
3. **A**
4. Le TCD est interactif, rapide (glisser-déposer), sans erreur de formule, et permet d'explorer les données sous différents angles en quelques clics.
5. Histogramme = distribution d'une seule variable (fréquence). Nuage de points = relation entre deux variables (corrélation).
6. Un graphique simple et parlant : courbe de tendance du temps de réponse moyen par semaine + ligne d'objectif SLA. Une boîte à moustaches pour montrer la variabilité. Éviter les tableaux de chiffres bruts.
7. **A**
8. R² indique la fiabilité de la tendance. R²=0.9 → la tendance explique 90% des variations (fiable pour des prévisions). R²=0.2 → la tendance n'explique rien (ne pas l'utiliser pour décider).
9. Vérifier que la plage de données sélectionnée est correcte, qu'il n'y a pas de lignes/colonnes vides, que les en-têtes sont bien présents. Actualiser le TCD (Données → Actualiser tout).
10. `ECARTYPE.STANDARD()` pour un échantillon (divise par n-1). `ECARTYPE.POPULATION()` pour une population complète (divise par n).
11. Titre clair, axes légendés, unités explicites, commentaire en une phrase qui donne la conclusion ("Le temps de réponse a baissé de 15% ce mois-ci"), éviter le jargon statistique.
12. Utiliser Power Query (intégré à Excel) pour charger et transformer sans tout charger en mémoire, ou passer à Python/pandas. Excel a une limite d'environ 1 million de lignes mais devient lent bien avant.
13. **A**
14. Utiliser Power Query pour automatiser l'import et le nettoyage, des formules qui s'étendent automatiquement (tableaux structurés), et éventuellement VBA ou Power Automate pour planifier l'exécution.
15. **A**

### D. Corrigé — Module 4 (Python)
1. **A**
2. **A**
3. **A**
4. Des données non nettoyées faussent les résultats : une valeur manquante peut faire planter un calcul, un doublon peut doubler un total, un type incorrect peut rendre une colonne inutilisable.
5. `.mean()` = moyenne arithmétique (sensible aux extrêmes). `.median()` = médiane (robuste aux extrêmes). Même interprétation que les concepts statistiques.
6. La colonne contient probablement des caractères non numériques (symbole €, virgule au lieu du point, espaces). Corriger avec `df['prix'] = df['prix'].str.replace('€', '').str.replace(',', '.').str.strip().astype(float)`.
7. **A**
8. Python gère des millions de lignes sans ralentir, le script est reproductible et versionnable, et les librairies (pandas, scipy, scikit-learn) offrent des fonctionnalités avancées qu'Excel n'a pas.
9. La colonne contient des valeurs NaN ou non numériques. Vérifier avec `df['temps'].isnull().sum()`. Utiliser `df['temps'].mean(skipna=True)` ou nettoyer avant.
10. **A**
11. Les détecter avec la méthode IQR ou Z-score, les analyser pour comprendre leur cause, décider de les garder (si légitimes), les corriger (si erreur de saisie), ou les supprimer (si non pertinentes). Documenter chaque décision.
12. 70% de perte est énorme — vérifier que le nettoyage n'est pas trop agressif. Problèmes possibles : `dropna()` sans sous-ensemble supprime toute ligne avec au moins un NaN (si beaucoup de colonnes, l'intersection peut être vide). Solution : `dropna(subset=['colonne_critique'])` plutôt que `dropna()` global.
13. **A**
14. Pour tracer l'historique des modifications, collaborer avec d'autres, revenir à une version précédente si une analyse est erronée, et prouver la reproductibilité du travail.
15. **A**

### E. Corrigé — Module 5 (Banque + P1)
1. **A**
2. Un notebook Jupyter ou script Python commenté montrant le chargement, le nettoyage, l'analyse statistique et les graphiques avec interprétation.
3. **A**
4. "Je commencerais par les statistiques descriptives (moyenne, médiane, écart-type, percentiles) pour comprendre la distribution. Ensuite, j'analyserais les tendances (par jour, par heure) et les corrélations entre métriques. Enfin, je chercherais les anomalies (outliers) et les patterns récurrents (pics de charge)."
5. L'analyse de données est essentielle pour superviser (tendances, seuils), diagnostiquer (corrélations, anomalies), et justifier les décisions (rapports, SLA).
6. **A**
7. Le script Python d'analyse + un graphique commenté (ex: "Corrélation entre utilisateurs connectés et RAM : r=0.89").
8. **A**
9. `df.head()`, `df.info()`, `df.describe()` pour une vue d'ensemble. Ensuite, explorer les colonnes clés (distribution, valeurs manquantes), puis formuler des questions métier et y répondre avec les données.
10. **A**
11. Ça prouve que tu sais automatiser une analyse, pas seulement cliquer dans Excel. C'est une compétence recherchée pour les volumes de données importants.
12. "Les deux. Excel pour l'exploration rapide et les TCD, Python/pandas pour les volumes importants, l'automatisation, et les analyses avancées. Le bon outil selon le besoin."
13. **A**
14. Capacité à charger, nettoyer, analyser et visualiser un jeu de données inconnu en moins d'une heure.
15. **A**