# TOME P3-B — Jour 20 (14h)

## Découpage horaire opérationnel J20
- Visualisation avec Excel (graphiques avancés, dashboards, storytelling) — **3h**
- Visualisation avec Power BI (import, modélisation, rapports interactifs) — **4h**
- Visualisation avec Python (matplotlib, seaborn, plotly) — **4h**
- Labs intégrés (création d'un dashboard complet multi-outils) — **2h**
- Banque de questions + suivi P1 — **1h**

---

## 1) Visualisation avec Excel — graphiques avancés, dashboards (3h)

### Objectifs d'apprentissage
- Maîtriser les graphiques Excel avancés (croisé dynamique, waterfall, sparklines, jauge).
- Créer un dashboard Excel interactif avec segments et chronologie.
- Appliquer les principes de data storytelling (titre parlant, annotation, focus).
- Choisir le bon type de graphique selon la question posée.
- Éviter les pièges courants (3D inutile, échelles tronquées, trop de couleurs).

### Contenu pédagogique
Un bon graphique raconte une histoire en 5 secondes. Un mauvais graphique la cache en 5 minutes.

Points clés:
1. **Choisir le bon graphique** :
   - **Comparaison** : barres (verticales ou horizontales). Top 5, évolution entre 2 périodes.
   - **Évolution dans le temps** : courbes (lines). CA mensuel, utilisateurs/jour.
   - **Distribution** : histogramme, boîte à moustaches (boxplot). Temps de réponse, salaires.
   - **Composition** : secteurs (pie) ou barres empilées. Parts de marché, répartition du budget.
   - **Relation** : nuage de points (scatter). CPU vs RAM, âge vs salaire.
   - **Performance vs objectif** : jauge (gauge) ou barre avec cible. Taux d'atteinte SLA.
2. **Graphiques avancés Excel** :
   - **Graphique croisé dynamique** : lié à un TCD, se met à jour automatiquement. Idéal pour l'exploration interactive.
   - **Waterfall (en cascade)** : décompose une variation (ex: évolution du CA : +ventes, -remboursements, =résultat net).
   - **Sparklines** : mini-graphiques dans une cellule (tendance sur 12 mois en un coup d'œil).
   - **Graphique combiné** : 2 types sur le même graphique (ex: barres pour le CA, courbe pour la marge).
3. **Dashboard Excel** : une page unique qui répond à une question business en un coup d'œil. Composants : 3-4 graphiques clés, segments (filtres interactifs), chronologie (filtre temporel), KPI cards (chiffres clés en grand). Les segments lient tous les graphiques : un clic sur "Région Nord" filtre tout le dashboard.
4. **Data storytelling** : chaque graphique doit avoir un **titre parlant** (pas "Ventes par mois" mais "Les ventes ont chuté de 15% en mars"). Annoter les points importants (flèche, commentaire). Guider le regard (couleur contrastée sur l'élément clé, gris pour le contexte).
5. **Pièges à éviter** : 3D (déforme les proportions), échelles tronquées (exagère les différences), trop de couleurs (>5-6), secteurs avec trop de parts (>5), double axe Y sans le préciser, données non triées.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : à partir d'un tableau "ventes mensuelles par région" (12 mois × 4 régions), créer un graphique en courbes comparant les 4 régions. Ajouter un titre parlant et un commentaire sur la tendance.
   - **Corrigé détaillé** : Sélectionner les données → Insertion → Courbes 2D. Titre : "La région Nord dépasse le Sud à partir de juin — écart de +12% en décembre". Commentaire : ajouter une zone de texte pointant le croisement des courbes en juin. Axe Y formaté en K€. Légende en bas. Le graphique raconte l'histoire du rattrapage de la région Nord.
2. **Exercice 2 (intermédiaire)** : créer un dashboard Excel pour le suivi des performances IT (CPU, RAM, disque, latence sur 30 jours). Inclure : 3 graphiques (évolution latence, top 5 serveurs par CPU, distribution temps de réponse), 2 segments (serveur, jour de la semaine), 2 KPI cards (disponibilité moyenne, incidents ce mois).
   - **Corrigé détaillé** : Source = TCD lié aux données. Graphique 1 : courbes latence par jour. Graphique 2 : barres horizontales top 5 CPU. Graphique 3 : histogramme temps de réponse. Insertion → Segments → Serveur, JourSemaine. Connecter les segments aux 3 graphiques (clic droit → Connexions de rapport). KPI cards = cellules avec formules MOYENNE et NB.SI, mise en forme grande police + icône. Résultat : un dashboard qui répond "Quel serveur a le plus de problèmes ?" en 10 secondes.
3. **Exercice 3 (avancé)** : analyser un jeu de données financières (budget vs réel par département sur 12 mois). Créer un waterfall montrant la décomposition de l'écart total, un graphique combiné budget/réel par mois, et des sparklines par département. Synthétiser en une phrase de recommandation pour le CFO.
   - **Corrigé détaillé** : Waterfall : budget initial → + économies achats → - dépassement IT → + recettes supplémentaires → = résultat final. Graphique combiné : barres budget, courbe réel. Sparklines : mini-courbes dans les cellules à côté de chaque département. Recommandation : "Le département IT a dépassé son budget de 12% — principalement dû aux licences logicielles non anticipées. Proposer un budget rectificatif ou une renégociation des contrats."

### Nouvelles abréviations rencontrées
- KPI | *(déjà existant, section J)* | Key Performance Indicator — indicateur clé de performance | Interagit avec les dashboards, les rapports, la prise de décision

### Banque de questions du module (15)
1. QCM: un graphique en courbes est idéal pour... A) montrer une évolution dans le temps B) comparer des parts C) montrer une distribution
2. QCM: un waterfall (cascade) sert à... A) décomposer une variation B) montrer des tendances C) remplacer un tableau
3. QCM: des sparklines sont... A) des mini-graphiques dans une cellule B) un type de carte C) des formules
4. Ouverte: pourquoi éviter les graphiques 3D dans un rapport professionnel ?
5. Ouverte: quel graphique choisir pour comparer les parts de marché de 5 concurrents ?
6. Cas: le dashboard montre une chute du CA en août. Le directeur demande "Pourquoi ?". Que fais-tu ?
7. QCM: un segment dans Excel permet de... A) filtrer interactivement les données B) supprimer des lignes C) protéger la feuille
8. Ouverte: différence entre un graphique et un dashboard.
9. Cas: un collègue te montre un graphique où l'axe Y commence à 80 au lieu de 0. Problème ?
10. QCM: un bon titre de graphique doit... A) raconter l'histoire B) être technique et long C) être absent
11. Ouverte: comment choisir les couleurs d'un dashboard ?
12. Cas: 50 catégories dans un graphique en secteurs. Problème et solution ?
13. QCM: objectif du module 1 = A) créer des visualisations claires et parlantes B) utiliser le plus de couleurs possible C) éviter les graphiques
14. Ouverte: comment présenter un dashboard à un directeur en 2 minutes ?
15. QCM: résultat attendu = A) dashboard Excel interactif et pertinent B) graphique 3D illisible C) données brutes sans visualisation

---

## 2) Visualisation avec Power BI (4h)

### Objectifs d'apprentissage
- Importer des données depuis Excel, CSV, SQL dans Power BI Desktop.
- Modéliser les relations entre tables (schéma en étoile).
- Créer des mesures DAX simples (SUM, AVERAGE, CALCULATE, FILTER).
- Construire un rapport interactif (page de rapport, visuels, interactions).
- Publier et partager un rapport (Power BI Service, notion).

### Contenu pédagogique
Power BI est l'outil de visualisation le plus demandé en entreprise. Il combine la puissance d'un modèle de données avec des visuels interactifs.

Points clés:
1. **Power BI Desktop (gratuit)** : interface en 3 vues — Rapport (visuels), Données (tables), Modèle (relations). Importer : Accueil → Obtenir des données → Excel/CSV/SQL Server. Power Query s'ouvre pour transformer les données avant chargement.
2. **Modélisation** : dans la vue Modèle, créer les relations entre tables (clé étrangère → clé primaire). Power BI détecte automatiquement les relations mais il faut les vérifier. Le schéma en étoile est le plus performant. Cacher les clés étrangères (elles servent aux relations, pas aux visuels).
3. **DAX (Data Analysis Expressions)** : langage de formules Power BI.
   - `Total Ventes = SUM(Faits[Montant])` — mesure simple.
   - `CA N-1 = CALCULATE([Total Ventes], SAMEPERIODLASTYEAR(DimTemps[Date]))` — intelligence temporelle.
   - `% Marge = DIVIDE(SUM(Faits[Marge]), SUM(Faits[Montant]))` — ratio.
   - `Top Produits = CALCULATE([Total Ventes], TOPN(5, Produits, [Total Ventes]))` — top N dynamique.
   - Les mesures DAX sont recalculées à chaque interaction (filtre, segment) → toujours à jour.
4. **Visuels Power BI** : graphiques natifs (barres, courbes, secteurs, scatter, waterfall, jauge, carte, matrice, tableau) + visuels personnalisés importés depuis AppSource. Interactions entre visuels : sélectionner une barre dans un graphique filtre automatiquement les autres visuels. Gérer les interactions : Format → Modifier les interactions.
5. **Bonnes pratiques** : une page = une question business. Pas plus de 6-8 visuels par page. Utiliser des segments pour filtrer. Mettre en forme avec un thème cohérent. Ajouter des infobulles (tooltips) pour le détail. Toujours tester sur un petit écran (les dashboards sont souvent consultés sur portable).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : importer un fichier Excel "ventes.xlsx" (3 feuilles : Produits, Clients, Ventes). Créer les relations dans la vue Modèle. Créer un visuel "CA par catégorie de produit" (barres horizontales).
   - **Corrigé détaillé** : Importer les 3 feuilles → Power Query → vérifier les types → Charger. Vue Modèle : glisser Produits[ID] vers Ventes[ProduitID] (1→*), Clients[ID] vers Ventes[ClientID] (1→*). Créer mesure : `Total CA = SUM(Ventes[Montant])`. Visuel : barres horizontales → Axe = Produits[Catégorie], Valeurs = [Total CA]. Trier par [Total CA] décroissant. Résultat : un graphique propre, interactif, lié au modèle.
2. **Exercice 2 (intermédiaire)** : créer une mesure DAX "CA vs N-1" qui calcule l'évolution du chiffre d'affaires par rapport à l'année précédente. Créer un visuel combiné : barres pour le CA, courbe pour l'évolution en %.
   - **Corrigé détaillé** : Mesures : `CA = SUM(Ventes[Montant])`, `CA N-1 = CALCULATE([CA], SAMEPERIODLASTYEAR(DimTemps[Date]))`, `Évolution = DIVIDE([CA] - [CA N-1], [CA N-1])`. Visuel combiné : Axe partagé = DimTemps[Mois], Valeurs de colonnes = [CA], Valeurs de lignes = [Évolution] (format %). Ajouter un segment "Année" pour sélectionner l'année de référence. Test : sélectionner 2024 → le visuel montre le CA 2024 et l'évolution vs 2023.
3. **Exercice 3 (avancé)** : créer un rapport Power BI complet (3 pages) : page 1 "Vue d'ensemble" (KPI cards + carte + top 10), page 2 "Analyse temporelle" (courbes + waterfall), page 3 "Détail" (matrice + drill-through). Ajouter des signets (bookmarks) pour naviguer entre les pages. Publier sur Power BI Service (compte gratuit).
   - **Corrigé détaillé** : Page 1 : 4 KPI cards (CA, Marge, Panier moyen, Nb commandes), carte géographique (CA par région), top 10 clients (barres horizontales). Page 2 : courbes CA par mois, waterfall CA par catégorie, segment année et région liés aux 2 pages. Page 3 : matrice (produits × mois avec CA), drill-through depuis la page 1 (clic droit sur un client → voir ses commandes). Signets : boutons "Accueil", "Tendances", "Détail". Publier : Fichier → Publier → Power BI Service → créer un lien de partage.

### Nouvelles abréviations rencontrées
- DAX | Data Analysis Expressions | Langage de formules Power BI pour les mesures et colonnes calculées | Interagit avec le modèle de données, les visuels, les filtres
- BI | *(déjà existant, section K)* | Business Intelligence — Power BI est l'outil phare de la BI Microsoft | Interagit avec Excel, SQL Server, Azure

### Banque de questions du module (15)
1. QCM: Power BI Desktop est... A) un outil de visualisation gratuit B) un tableur C) un langage de programmation
2. QCM: DAX est le langage de... A) formules et mesures Power BI B) requêtes SQL C) scripts Python
3. QCM: dans la vue Modèle, on crée... A) les relations entre tables B) les visuels C) les formules Excel
4. Ouverte: différence entre une colonne calculée et une mesure DAX.
5. Ouverte: pourquoi utiliser un schéma en étoile dans Power BI ?
6. Cas: `CALCULATE([Total Ventes], FILTER(...))` ne retourne pas le résultat attendu. Par où commencer le debug ?
7. QCM: `SAMEPERIODLASTYEAR()` est une fonction DAX de... A) intelligence temporelle B) texte C) logique
8. Ouverte: intérêt des signets (bookmarks) dans un rapport Power BI.
9. Cas: le rapport est lent (10 secondes pour charger). Optimisations possibles ?
10. QCM: Power Query sert à... A) transformer les données avant chargement B) créer des visuels C) écrire du DAX
11. Ouverte: quand utiliser Power BI plutôt qu'Excel pour un dashboard ?
12. Cas: besoin de données en temps réel dans un dashboard Power BI. Solution ?
13. QCM: objectif du module 2 = A) créer des rapports Power BI professionnels B) remplacer Excel partout C) éviter la modélisation
14. Ouverte: comment convaincre une équipe d'adopter Power BI ?
15. QCM: résultat attendu = A) rapport Power BI 3 pages avec modèle et DAX B) données importées sans relations C) un seul visuel

---

## 3) Visualisation avec Python — matplotlib, seaborn, plotly (4h)

### Objectifs d'apprentissage
- Maîtriser matplotlib pour des graphiques statiques de qualité publication.
- Utiliser seaborn pour des visualisations statistiques avancées.
- Créer des graphiques interactifs avec plotly.
- Exporter des graphiques en haute résolution (PNG, PDF, HTML).
- Combiner plusieurs graphiques dans une figure (subplots, dashboard Python).

### Contenu pédagogique
Python offre un contrôle total sur la visualisation, de la publication académique au dashboard web interactif.

Points clés:
1. **matplotlib** — la fondation :
   - `plt.figure(figsize=(12, 6))` — taille de la figure.
   - `plt.plot(x, y, label='Courbe 1', color='#2196F3', linewidth=2)` — courbe.
   - `plt.bar(x, y)` / `plt.barh()` — barres verticales/horizontales.
   - `plt.scatter(x, y, s=taille, c=couleur, alpha=0.7)` — nuage de points.
   - `plt.hist(data, bins=30, edgecolor='white')` — histogramme.
   - `plt.title('Titre', fontsize=14, fontweight='bold')` — titre.
   - `plt.xlabel()`, `plt.ylabel()` — légendes d'axes.
   - `plt.legend()` — légende.
   - `plt.savefig('graphique.png', dpi=150, bbox_inches='tight')` — export.
2. **seaborn** — statistique et esthétique :
   - `sns.set_style('whitegrid')` — thème propre.
   - `sns.boxplot(data=df, x='catégorie', y='valeur')` — boîte à moustaches.
   - `sns.heatmap(df.corr(), annot=True, cmap='coolwarm')` — matrice de corrélation.
   - `sns.pairplot(df[['col1', 'col2', 'col3']], hue='catégorie')` — paires de graphiques.
   - `sns.barplot(data=df, x='mois', y='ca', errorbar=None)` — barres avec intervalles de confiance.
   - `sns.kdeplot(data=df, x='temps', hue='serveur', fill=True)` — densité (version lissée de l'histogramme).
3. **plotly** — interactivité web :
   - `import plotly.express as px` — API simple.
   - `px.line(df, x='date', y='valeur', color='catégorie')` — courbe interactive (zoom, survol, légende cliquable).
   - `px.bar(df, x='région', y='ca', color='produit')` — barres interactives.
   - `px.scatter(df, x='cpu', y='ram', size='utilisateurs', hover_name='serveur')` — nuage avec infobulles.
   - `fig.write_html('dashboard.html')` — exporter en page web autonome.
   - Plotly est idéal pour les dashboards exploratoires partagés avec des non-techniciens.
4. **Subplots** : `fig, axes = plt.subplots(2, 2, figsize=(14, 10))` → 4 graphiques dans une grille 2×2. `axes[0, 0].plot(...)`, `axes[1, 0].bar(...)`. `plt.tight_layout()` pour éviter le chevauchement.
5. **Bonnes pratiques Python** : définir un style global (`plt.style.use('seaborn-v0_8-darkgrid')`), utiliser des palettes de couleurs adaptées (colorblind-friendly : 'viridis', 'plasma'), exporter en PNG pour les rapports et en HTML pour les dashboards interactifs, toujours fermer les figures (`plt.close()`) en production.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : charger les logs serveur avec pandas, créer un graphique matplotlib avec 3 courbes (CPU, RAM, Disque) sur 24h. Ajouter titre, légende, labels, et exporter en PNG.
   - **Corrigé détaillé** : `df = pd.read_csv('logs.csv')` ; `fig, ax = plt.subplots(figsize=(14, 6))` ; `ax.plot(df['heure'], df['cpu'], label='CPU %', linewidth=2)` ; `ax.plot(df['heure'], df['ram'], label='RAM %', linewidth=2)` ; `ax.plot(df['heure'], df['disque'], label='Disque %', linewidth=2)` ; `ax.set_title('Utilisation des ressources — 24h', fontsize=14, fontweight='bold')` ; `ax.set_xlabel('Heure')` ; `ax.set_ylabel('Utilisation (%)')` ; `ax.legend()` ; `ax.grid(True, alpha=0.3)` ; `plt.savefig('ressources_24h.png', dpi=150, bbox_inches='tight')`. Bonus : marquer le seuil critique à 80% (`ax.axhline(80, color='red', linestyle='--', alpha=0.7)`).
2. **Exercice 2 (intermédiaire)** : créer un dashboard Python (subplots matplotlib 2×2) pour l'analyse des ventes : top 10 produits (barh), CA mensuel (courbe), distribution des montants (histogramme), CA par région (pie ou bar). Utiliser seaborn pour le style.
   - **Corrigé détaillé** : `sns.set_style('whitegrid')` ; `fig, axes = plt.subplots(2, 2, figsize=(16, 12))`. (1) `axes[0, 0]` → top 10 produits avec `barh`. (2) `axes[0, 1]` → CA par mois avec `plot`. (3) `axes[1, 0]` → histogramme montants avec `sns.histplot(data=df, x='montant', bins=40, ax=axes[1, 0])`. (4) `axes[1, 1]` → barres CA par région. `plt.tight_layout()` ; `plt.savefig('dashboard_ventes.png', dpi=150)`. Le résultat est un dashboard complet en une image, prêt pour un rapport.
3. **Exercice 3 (avancé)** : créer un dashboard interactif avec plotly : nuage de points (CPU vs RAM, taille=utilisateurs, couleur=serveur), courbes multiples (latence par serveur sur 24h), et tableau des alertes. Ajouter un sélecteur de plage de dates. Exporter en HTML autonome.
   - **Corrigé détaillé** : `fig = make_subplots(rows=3, cols=1, subplot_titles=('CPU vs RAM', 'Latence par serveur', 'Alertes'), row_heights=[0.5, 0.3, 0.2])`. (1) `px.scatter(df, x='cpu', y='ram', size='users', color='serveur')`. (2) `px.line(df, x='timestamp', y='latence', color='serveur')`. (3) `go.Table(header=..., cells=...)` pour les alertes. Ajouter `rangeselector` pour la plage de dates. `fig.write_html('dashboard_interactif.html')`. Ouvrir dans un navigateur → zoom, survol, filtrage. Envoyer le fichier HTML à un collègue, il peut explorer sans installer Python.

### Nouvelles abréviations rencontrées
- HTML | *(déjà existant, section B)* | HyperText Markup Language — export des dashboards plotly en pages web autonomes | Interagit avec plotly, les navigateurs, le partage de dashboards

### Banque de questions du module (15)
1. QCM: matplotlib est une librairie Python pour... A) la visualisation de données B) le machine learning C) le développement web
2. QCM: seaborn est construit au-dessus de... A) matplotlib B) Django C) SQLAlchemy
3. QCM: plotly crée des graphiques... A) interactifs (zoom, survol) B) uniquement statiques C) en ligne de commande
4. Ouverte: quand utiliser matplotlib vs seaborn vs plotly ?
5. Ouverte: à quoi sert `plt.tight_layout()` ?
6. Cas: le graphique exporté en PNG est flou. Comment améliorer la qualité ?
7. QCM: `sns.heatmap(df.corr())` montre... A) la matrice de corrélation B) les données brutes C) du texte
8. Ouverte: avantage d'un dashboard plotly exporté en HTML vs une image PNG ?
9. Cas: 10 courbes sur le même graphique, illisible. Solutions ?
10. QCM: `plt.savefig('graph.png', dpi=150)` — dpi signifie... A) dots per inch (résolution) B) data per image C) delete previous image
11. Ouverte: comment choisir la palette de couleurs d'un graphique ?
12. Cas: `plt.show()` ne fait rien dans un script exécuté sur un serveur sans écran. Alternative ?
13. QCM: objectif du module 3 = A) créer des visualisations Python statiques et interactives B) uniquement du matplotlib C) éviter Python
14. Ouverte: pourquoi versionner les scripts de visualisation dans Git plutôt que les images exportées ?
15. QCM: résultat attendu = A) dashboard Python exportable + graphiques statistiques B) un seul plot C) code sans sortie

---

## 4) Labs intégrés — dashboard complet multi-outils (2h)

### Objectifs d'apprentissage
- Intégrer les compétences de visualisation J20 sur un cas complet.
- Créer un même dashboard avec 2 outils différents (Excel + Power BI ou Python).
- Comparer les forces et faiblesses de chaque outil.
- Présenter le dashboard en mode "storytelling" (contexte → données → analyse → recommandation).
- Défendre ses choix de visualisation en situation professionnelle.

### Contenu pédagogique
Scénario : tu es analyste dans une banque. On te demande de créer un dashboard de suivi des performances des agences (transactions, volumes, incidents, satisfaction client). Tu dois le faire avec 2 outils au choix pour montrer ta polyvalence.

Étapes du lab :
1. **Analyse des besoins** : quelles questions le dashboard doit-il répondre ? (Quelles agences sous-performent ? Y a-t-il des tendances ? Quels sont les pics d'activité ?)
2. **Version Excel** : dashboard avec TCD + graphiques croisés + segments.
3. **Version Power BI ou Python** : rapport Power BI 2 pages OU dashboard plotly interactif.
4. **Comparaison** : forces/faiblesses de chaque version (rapidité, interactivité, partage, mise à jour).
5. **Présentation** : 5 minutes de storytelling — contexte bancaire, données, 3 insights clés, 1 recommandation actionnable.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : créer le dashboard Excel "Suivi des agences bancaires" avec : graphique en barres (top 10 agences par volume), courbe d'évolution mensuelle, segment par région. Titre parlant : "L'agence de Kinshasa traite 40% des transactions — risque de saturation".
   - **Corrigé détaillé** : Données : agence, région, mois, nb_transactions, volume_total, nb_incidents, satisfaction. TCD → graphique barres top 10. Graphique courbes volume par mois (toutes agences ou filtré par segment). Segment Région lié aux 2 graphiques. Titre parlant → annotation sur l'agence Kinshasa. Ce dashboard répond "Où concentrer les efforts ?" en 10 secondes.
2. **Exercice 2 (intermédiaire)** : créer le même dashboard en Power BI. Ajouter une mesure DAX "Taux d'incidents = DIVIDE(SUM(Incidents), SUM(Transactions))". Créer un visuel "jauge" pour le taux d'incidents avec un seuil critique à 5%. Comparer les 2 versions.
   - **Corrigé détaillé** : Power BI : import Excel, modèle simple, mesure `Taux Incidents = DIVIDE(SUM(Faits[Incidents]), SUM(Faits[Transactions]))`. Jauge : valeur = [Taux Incidents], max = 0.1, seuils : 0-0.02 vert, 0.02-0.05 jaune, 0.05+ rouge. Comparaison : Excel = rapide, tout le monde sait l'utiliser, limite en volume. Power BI = interactivité native, mise à jour automatique, meilleur pour le partage et les gros volumes. Les 2 ont leur place selon le contexte.
3. **Exercice 3 (avancé)** : préparer une présentation de 5 minutes du dashboard à un "directeur d'agence" (rôle joué ou simulé). Structure : (1) Contexte — "Nous suivons 50 agences, 500K transactions/mois". (2) Données — "Le dashboard combine transactions, incidents et satisfaction". (3) 3 insights — "Kinshasa = 40% du volume mais satisfaction en baisse", "Les incidents augmentent de 15% depuis 3 mois", "3 agences ont un taux d'incidents > 5%". (4) Recommandation — "Renforcer l'équipe IT à Kinshasa, auditer les 3 agences critiques, objectif : réduire le taux d'incidents à 3% en 3 mois".

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: un lab intégré J20 simule... A) la création d'un dashboard professionnel multi-outils B) un exercice sans données C) un cours théorique
2. QCM: un dashboard doit répondre à... A) une question business précise B) toutes les questions possibles C) aucune question
3. QCM: le storytelling de données consiste à... A) raconter une histoire avec les données B) inventer des chiffres C) cacher les graphiques
4. Ouverte: pourquoi créer le même dashboard avec 2 outils différents ?
5. Ouverte: comment choisir entre Excel, Power BI et Python pour un dashboard ?
6. Cas: le directeur veut voir le dashboard sur son téléphone. Quel format ?
7. QCM: une jauge (gauge) dans un dashboard montre... A) une valeur par rapport à un objectif B) une tendance C) une distribution
8. Ouverte: que faire si le dashboard ne montre aucun insight exploitable ?
9. Cas: le dashboard est prêt mais personne ne le consulte. Problème ?
10. QCM: objectif du module 4 = A) produire un dashboard professionnel et savoir le présenter B) créer des graphiques sans but C) éviter la visualisation
11. Ouverte: pourquoi annoter les points clés sur un dashboard ?
12. Cas: "Votre dashboard est joli mais ne répond pas à ma question". Réaction ?
13. QCM: un bon dashboard se juge à... A) sa capacité à répondre à la question business B) son nombre de couleurs C) sa complexité
14. Ouverte: comment intégrer ce lab dans ton portfolio ?
15. QCM: résultat attendu = A) dashboard présenté avec storytelling B) graphiques sans commentaire C) données brutes

---

## 5) Banque de questions + suivi P1 (1h)

### Objectifs d'apprentissage
- Valider les acquis J20 en format test.
- Transformer J20 en preuve employable immédiate.

### Contenu pédagogique
- 40 min test mixte J20.
- 20 min correction + plan J21.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : rédiger une ligne CV intégrant une compétence J20 (visualisation de données).
   - **Corrigé détaillé** : "Création de dashboards interactifs avec Power BI, Excel et Python (matplotlib, seaborn, plotly) pour le suivi des performances et l'aide à la décision."
2. **Exercice 2 (intermédiaire)** : pitch 60s "Pourquoi la visualisation de données est un levier de décision".
   - **Corrigé détaillé** : Un bon graphique remplace 10 pages de tableau. La visualisation transforme des données brutes en insights actionnables : tendances, anomalies, comparaisons. Un directeur n'a pas le temps d'analyser des CSV — il a besoin d'un dashboard clair en 10 secondes. La visualisation, c'est le dernier kilomètre de l'analyse de données : sans elle, les meilleures analyses restent invisibles.
3. **Exercice 3 (avancé)** : plan J21 en 3 priorités mesurables.
   - **Corrigé détaillé** : 1) Comprendre les concepts Big Data (volume, vélocité, variété, les 3V). 2) Appliquer pandas sur un fichier de 1M+ lignes (optimisation, chunking). 3) Réaliser une transformation de données complexe (pivot, melt, merge, groupby multi-niveaux).

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: objectif final J20 = A) visualisation de données opérationnelle B) théorie sans pratique C) aucun livrable
2. Ouverte: meilleure preuve de compétence visualisation à montrer à un recruteur ?
3. QCM: ligne CV visualisation forte = A) outil + livrable + impact B) "je fais des graphiques" C) vide
4. Cas: le recruteur demande "Quel outil de visualisation préférez-vous et pourquoi ?"
5. Ouverte: comment relier J20 au poste de data analyst junior ?
6. QCM: plan J21 doit être... A) mesurable B) flou C) optionnel
7. Ouverte: quelle preuve visualisation publier sur le portfolio ce soir ?
8. QCM: la correction immédiate sert à... A) ancrer les bonnes pratiques de visualisation B) repousser C) copier
9. Cas: on te donne un jeu de données et te demande "Créez un dashboard". Par où commencer ?
10. QCM: preuve solide = A) dashboard + explication des choix + insights B) graphique sans contexte C) capture isolée
11. Ouverte: pourquoi montrer le même dashboard fait avec 2 outils sur ton portfolio ?
12. Cas: "Pourquoi ne pas simplement utiliser Excel ?" — Réponse ?
13. QCM: remédiation utile = A) corriger la lacune précise B) recommencer C) abandonner
14. Ouverte: indicateur de progression J20 pertinent ?
15. QCM: résultat P1 réussi = A) portfolio enrichi + compétence visualisation prouvée B) rien C) théorie sans application

---

## Validation qualité J20 (anti-superficiel)

### Livrables obligatoires fin de J20
1. 1 dashboard Excel interactif (3+ graphiques, segments, KPI cards).
2. 1 rapport Power BI (2+ pages, mesures DAX, modèle relationnel) ou 1 dashboard Python (plotly interactif exporté HTML).
3. 1 dashboard Python (seaborn/matplotlib, 4 graphiques en subplots, export PNG).
4. 1 présentation de 5 minutes (storytelling du dashboard, 3 insights, 1 recommandation).
5. 1 preuve portfolio (capture dashboard + lien vers version interactive) + mise à jour CV.

### Grille d'évaluation rapide (100 points)
- Maîtrise Excel (graphiques avancés, dashboard, segments, storytelling) : **25 pts**
- Maîtrise Power BI ou Python plotly (modèle, DAX ou interactivité) : **30 pts**
- Maîtrise Python statique (matplotlib/seaborn, subplots, export) : **25 pts**
- Qualité du storytelling et de la présentation : **10 pts**
- Communication technique employabilité : **10 pts**

### Seuil attendu
- **>= 80/100** : J20 validé, passage normal J21.
- **65-79/100** : validé sous remédiation ciblée 24h.
- **< 65/100** : consolidation visualisation requise avant J21.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Excel)
1. **A**
2. **A**
3. **A**
4. La 3D déforme les proportions : un secteur en avant paraît plus gros qu'il n'est. C'est trompeur et non professionnel. La 2D est toujours préférable.
5. Barres horizontales triées par part de marché décroissante. Un secteur (pie) si vraiment < 5 parts, sinon les petites parts deviennent illisibles.
6. Ajouter un segment "Produit" ou "Région" pour filtrer, regarder si un produit ou une région spécifique explique la chute. Annoter le graphique. Ne pas laisser le directeur sans réponse — donner une hypothèse et proposer d'investiguer.
7. **A**
8. Un graphique répond à une question. Un dashboard combine plusieurs graphiques et filtres pour répondre à un ensemble de questions liées sur une page unique.
9. L'échelle tronquée exagère la différence. Une variation de 80 à 85 (+6%) paraît énorme si l'axe commence à 80. Toujours commencer à 0 pour les barres, ou l'indiquer explicitement si on ne commence pas à 0.
10. **A**
11. Palette cohérente (2-3 couleurs maximum + gris), couleur vive pour l'élément clé à mettre en avant, éviter le rouge/vert pour les daltoniens (utiliser bleu/orange), rester dans la charte graphique de l'entreprise.
12. Problème : illisible. Solution : regrouper les petites catégories en "Autres" (top 5 + autres), ou utiliser un graphique en barres horizontales, ou un treemap.
13. **A**
14. "Voici les 3 chiffres clés ce mois-ci (montrer les KPI cards). La tendance principale est X (montrer la courbe). Le point d'attention est Y (montrer l'anomalie). Ma recommandation est Z."
15. **A**

### B. Corrigé — Module 2 (Power BI)
1. **A**
2. **A**
3. **A**
4. Colonne calculée = valeur stockée dans la table, calculée ligne par ligne au moment du chargement (statique). Mesure = calcul dynamique évalué au moment de la requête, dépend du contexte de filtre (interactif).
5. Pour les performances (moins de jointures complexes), la simplicité (une table de faits au centre), et la compatibilité avec les fonctions DAX d'intelligence temporelle qui nécessitent une table de dates séparée.
6. Vérifier le contexte de filtre avec une carte affichant la mesure, tester chaque condition du FILTER séparément, utiliser DAX Studio pour déboguer, vérifier que les relations sont actives.
7. **A**
8. Permettre à l'utilisateur de naviguer entre différentes vues (pages ou états filtrés), créer un "mode histoire" pour les présentations, sauvegarder des états d'analyse pertinents.
9. Réduire le nombre de visuels par page, éviter les visuels personnalisés lourds, limiter les lignes importées (agréger avant si possible), utiliser le mode Import plutôt que DirectQuery, optimiser les mesures DAX (éviter les FILTER imbriqués).
10. **A**
11. Power BI pour les rapports partagés, la mise à jour automatique, les gros volumes, la collaboration. Excel pour l'analyse ad-hoc rapide, quand le destinataire veut modifier les données.
12. Utiliser DirectQuery (limité) ou un dataset en streaming (Push Dataset) via l'API Power BI, ou intégrer un visuel temps réel avec un connecteur personnalisé.
13. **A**
14. "Power BI transforme vos exports Excel en dashboards interactifs qui se mettent à jour automatiquement. Plus besoin de recréer le rapport chaque mois. Un gain de temps immédiat."
15. **A**

### C. Corrigé — Module 3 (Python)
1. **A**
2. **A**
3. **A**
4. matplotlib = contrôle total, manuel, idéal pour les figures de publication. seaborn = statistique, esthétique par défaut, idéal pour l'exploration rapide. plotly = interactif, web, idéal pour les dashboards partagés.
5. Ajuste automatiquement les espacements entre les subplots pour éviter le chevauchement des titres, labels et graphiques.
6. Augmenter le `dpi` (150-300), utiliser `bbox_inches='tight'` pour ne pas couper, choisir un format vectoriel (PDF, SVG) pour une qualité parfaite à toute échelle.
7. **A**
8. Interactivité (zoom, survol, filtrage), l'utilisateur explore lui-même, pas besoin d'installer Python, partageable par simple lien ou fichier.
9. Réduire le nombre de courbes (regrouper les moins importantes), utiliser des sous-graphiques (facet grid), ajouter un sélecteur interactif (plotly), utiliser des couleurs distinctes et une légende claire.
10. **A**
11. Palette adaptée au type de données : séquentielle pour les valeurs continues (claires à foncées), divergente pour les écarts autour d'un centre (bleu-blanc-rouge), qualitative pour les catégories. Éviter les palettes non perceptuellement uniformes (jet, rainbow).
12. Utiliser `plt.savefig('graph.png')` au lieu de `plt.show()`. Sur un serveur sans écran, configurer le backend matplotlib : `import matplotlib; matplotlib.use('Agg')`.
13. **A**
14. Le script est reproductible (il suffit de relancer avec de nouvelles données), versionnable (on voit l'historique des modifications), et plus léger (le code fait quelques Ko, l'image fait des Mo).
15. **A**

### D. Corrigé — Module 4 (Labs)
1. **A**
2. **A**
3. **A**
4. Pour comprendre les forces de chaque outil, être capable de choisir le bon outil selon le contexte, et prouver sa polyvalence (un recruteur apprécie de voir que tu n'es pas "enfermé" dans un seul outil).
5. Excel : analyse ad-hoc, petite équipe, besoin de modifier les données. Power BI : rapports récurrents, collaboration, gros volumes, mise à jour automatique. Python : contrôle total, dashboards web personnalisés, intégration dans un pipeline de données.
6. Power BI Mobile (application gratuite) si le rapport est publié sur Power BI Service. Ou un dashboard plotly exporté en HTML responsive. Excel n'est pas idéal sur mobile.
7. **A**
8. Vérifier la qualité des données (erreurs, outliers qui masquent les tendances), changer de granularité (agréger différemment), poser une question différente, ou conclure que "l'absence de tendance est l'information" (stabilité).
9. Problème d'adoption : peut-être pas accessible (pas de lien, pas d'application), pas pertinent (ne répond pas aux vraies questions), ou pas communiqué (personne ne sait qu'il existe). Solution : présenter en réunion, former, recueillir les besoins.
10. **A**
11. Pour guider le regard vers l'information importante, expliquer le contexte (un pic isolé n'est pas évident sans annotation), et raconter une histoire plutôt que de laisser l'utilisateur deviner.
12. Écouter sa question, comprendre ce qui manque, itérer sur le dashboard. Un dashboard est un produit vivant — la première version n'est jamais parfaite. L'important est de montrer qu'on s'adapte au besoin.
13. **A**
14. Captures du dashboard + lien vers la version interactive (Power BI publié ou HTML plotly) + explication du contexte business et des insights découverts.
15. **A**

### E. Corrigé — Module 5 (Banque + P1)
1. **A**
2. Un dashboard interactif (Power BI ou plotly) avec lien accessible + la présentation de 5 minutes qui explique le contexte, les insights et la recommandation.
3. **A**
4. "Je maîtrise Excel, Power BI et Python. Mon choix dépend du besoin : Power BI pour les rapports récurrents et le partage, Python pour le contrôle total et l'automatisation, Excel pour la rapidité. Voici un exemple du même dashboard fait avec les trois."
5. La visualisation de données est une compétence clé du data analyst : transformer des données brutes en insights visuels pour aider la décision.
6. **A**
7. Le dashboard Power BI publié (lien) ou le dashboard plotly en HTML + une capture commentée avec les 3 insights clés.
8. **A**
9. Comprendre la question business d'abord, explorer les données, choisir les visuels adaptés, construire le dashboard, le faire valider par un utilisateur, itérer.
10. **A**
11. Ça prouve ta polyvalence et ta compréhension des avantages de chaque outil — une qualité recherchée pour s'adapter à l'environnement technique de l'entreprise.
12. "Excel est excellent pour l'analyse rapide. Power BI et Python apportent l'interactivité, la mise à jour automatique, et la capacité à gérer des volumes qu'Excel ne peut pas. Chaque outil a sa place selon le besoin."
13. **A**
14. Capacité à créer un dashboard répondant à une question business en moins de 4 heures, et à le présenter clairement en 5 minutes.
15. **A**