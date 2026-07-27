# TOME P3-B — Jour 22 (14h)

## Découpage horaire opérationnel J22
- Définition du cas business et cadrage de l'analyse — **2h**
- Analyse exploratoire complète (stats, SQL, nettoyage, features) — **5h**
- Visualisation et dashboard de synthèse — **3h**
- Rédaction du rapport et présentation — **2h**
- Portfolio P3-B + pitch data analyst + suivi P1 — **2h**

---

> **🎯 PROJET DE SYNTHÈSE P3-B — Analyse de données de bout en bout**
>
> Tu es data analyst junior dans une banque. La direction te confie une mission : analyser les transactions des agences bancaires pour identifier des leviers d'optimisation et des signaux de risque.
>
> **Données fournies** : un jeu de données simulé contenant transactions, agences, clients, incidents sur 12 mois (~500K lignes).
>
> **Livrable final** : un rapport d'analyse complet (nettoyage → analyse → visualisation → recommandations) prêt à être présenté au comité de direction.

---

## 1) Définition du cas business et cadrage (2h)

### Objectifs d'apprentissage
- Formuler des questions business précises à partir d'un besoin vague.
- Cadrer le périmètre d'analyse (données disponibles, limites, hypothèses).
- Définir les KPI et métriques qui répondent aux questions posées.
- Structurer le plan d'analyse avant de toucher aux données.

### Contenu pédagogique
"La direction veut optimiser les agences" — c'est trop vague. Le data analyst doit traduire un besoin flou en questions précises auxquelles les données peuvent répondre.

Points clés:
1. **Des questions business aux questions data** :
   - Business : "Optimiser les agences" → Data : "Quelles agences ont le ratio transactions/employé le plus bas ?", "Y a-t-il des agences où les incidents sont en hausse ?", "Quels clients génèrent le plus de valeur et sont-ils bien servis ?"
   - Business : "Réduire les risques" → Data : "Quel est le taux d'incidents par type ?", "Y a-t-il des patterns temporels dans les incidents ?", "Quelle corrélation entre volume de transactions et incidents ?"
2. **Cadrage du périmètre** : quelles données sont disponibles ? (transactions, agences, clients, incidents). Quelle période ? (12 mois). Quelles limites ? (données simulées, pas de données RH individuelles, pas de données concurrentes). Quelles hypothèses ? (les données sont représentatives, les incidents sont bien déclarés).
3. **Définition des KPI** : Volume de transactions par agence/mois, taux d'incidents (nb_incidents / nb_transactions), panier moyen par type de client, évolution mensuelle du CA, satisfaction client (si disponible), taux de résolution des incidents en < 24h.
4. **Plan d'analyse** : (1) Chargement et diagnostic qualité. (2) Nettoyage. (3) Analyse descriptive (KPI par agence, tendances temporelles). (4) Analyse diagnostique (corrélations, segments à risque). (5) Visualisation (dashboard). (6) Recommandations (3 actions prioritaires chiffrées).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : transformer 3 questions business vagues en questions data précises avec les KPI associés : (a) "Améliorer le service client", (b) "Réduire les coûts", (c) "Augmenter les ventes".
   - **Corrigé détaillé** : (a) Data : "Quel est le temps moyen de résolution par type d'incident ? Quel % d'incidents résolus en < 24h ?" KPI : temps_moyen_résolution, pct_résolu_24h. (b) Data : "Quelles agences ont le coût par transaction le plus élevé ? Y a-t-il des doublons ou processus redondants ?" KPI : coût_par_transaction, nb_doublons. (c) Data : "Quels produits ont la plus forte croissance ? Quels clients sont sous-équipés par rapport à leur profil ?" KPI : croissance_CA_par_produit, taux_équipement.
2. **Exercice 2 (intermédiaire)** : rédiger le cahier des charges de l'analyse P3-B : contexte, questions business, questions data, KPI, périmètre, limites, livrables attendus, planning (4 phases sur la journée).
   - **Corrigé détaillé** : Document structuré d'une page : Contexte (banque, 50 agences, 500K transactions, optimisation et risques). Questions business (3). Questions data (6). KPI (8). Périmètre (12 mois, données internes). Limites (données simulées, pas de concurrence). Livrables (rapport, dashboard, présentation). Planning : matin (cadrage + exploration), après-midi (analyse + visualisation), soir (rapport + présentation).
3. **Exercice 3 (avancé)** : anticiper les biais et limites de l'analyse. Qu'est-ce qui pourrait fausser les conclusions ? Comment les mitiger ?
   - **Corrigé détaillé** : Biais possibles : données simulées non représentatives, saisonnalité non captée sur 12 mois, corrélations fortuites (multi testing), variables confondantes (une agence performante peut avoir des clients plus riches, pas un meilleur management). Mitigations : le mentionner dans les limites, tester la robustesse (refaire l'analyse sur 6 mois vs 12 mois), ne pas sur-interpréter les corrélations, proposer des A/B tests pour valider les recommandations avant déploiement.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: la première étape d'une analyse de données est... A) cadrer la question business B) faire des graphiques C) nettoyer les données
2. QCM: un KPI doit être... A) mesurable et lié à l'objectif B) vague C) subjectif
3. QCM: transformer "réduire les coûts" en question data = A) "Quel est le coût par transaction par agence ?" B) "Pourquoi tout coûte cher ?" C) "Supprimons des budgets"
4. Ouverte: pourquoi est-il crucial de cadrer avant d'analyser ?
5. Ouverte: différence entre une question business et une question data.
6. Cas: le directeur demande "un rapport sur les agences". Tu fais quoi avant de commencer ?
7. QCM: le périmètre d'une analyse inclut... A) les données disponibles, la période, les limites B) uniquement le budget C) rien
8. Ouverte: pourquoi documenter les limites de l'analyse ?
9. Cas: les données ne contiennent pas la satisfaction client, mais le directeur la veut dans le rapport.
10. QCM: un bon KPI est... A) SMART (Spécifique, Mesurable, Atteignable, Réaliste, Temporel) B) flou C) inatteignable
11. Ouverte: comment prioriser les questions business quand tout semble important ?
12. Cas: l'analyse montre une corrélation parfaite entre deux variables. Réaction ?
13. QCM: objectif du module 1 = A) cadrer une analyse de données de façon professionnelle B) se lancer sans plan C) éviter les questions
14. Ouverte: comment présenter le cadrage à un directeur en 2 minutes ?
15. QCM: résultat attendu = A) cahier des charges clair et structuré B) idées vagues C) pas de plan

---

## 2) Analyse exploratoire complète (5h)

### Objectifs d'apprentissage
- Appliquer l'ensemble des compétences P3-B sur un cas réel.
- Enchaîner diagnostic qualité → nettoyage → stats descriptives → SQL analytique → feature engineering.
- Documenter chaque étape et justifier les choix méthodologiques.
- Produire des insights actionnables, pas juste des chiffres.

### Contenu pédagogique
C'est le cœur du projet. Toutes les compétences acquises en P3-B sont mobilisées sur un fil conducteur unique.

Étapes:
1. **Chargement et diagnostic (30 min)** : charger les CSVs, `.info()`, `.describe()`, identifier les problèmes (NaN, doublons, outliers, types incorrects). Produire un rapport de qualité initial.
2. **Nettoyage (1h)** : appliquer les corrections documentées. Imputation des NaN (médiane par groupe), suppression des doublons, standardisation des formats, correction des outliers justifiés. Journal de nettoyage.
3. **Statistiques descriptives (1h)** : par agence et par mois : moyenne, médiane, écart-type du CA, quartiles, IQR. Détection des agences aberrantes. Analyse de distribution (normale ? asymétrique ?).
4. **SQL/analytique (1h30)** : top 5 agences par CA avec RANK(), évolution mensuelle avec LAG(), anti-join (clients inactifs depuis 6 mois), ROLLUP (CA par région et total), CTE pour les hiérarchies si applicable.
5. **Feature engineering (1h)** : créer des colonnes dérivées — CA_par_employé, taux_incidents, évolution_CA_mensuelle, saisonnalité (mois), agence_à_risque (booléen si taux_incidents > seuil).

### Exercices pratiques (avec corrigés)
Les exercices sont intégrés au flux de travail. Pour chaque étape, l'apprenant produit le code et le rapport associé.

1. **Livrable intermédiaire 1** : rapport de qualité des données (problèmes identifiés, actions de nettoyage, impact).
   - **Corrigé attendu** : Document listant 5 problèmes (12 NaN dans CA, 3 doublons, 2 outliers agence, dates au format string, catégories incohérentes) et les actions (imputation médiane par agence, suppression doublons, correction outliers après vérification, conversion datetime, mapping catégories). Impact : CA total passe de 12.5M à 12.3M (-1.6% dû aux doublons).
2. **Livrable intermédiaire 2** : tableau des KPI par agence (top 5, bottom 5) avec interprétation.
   - **Corrigé attendu** : Top agence : Kinshasa (CA 2.1M, 18% du total, croissance +12%). Bottom agence : Goma (CA 0.3M, 2.5%, croissance -5%). Interprétation : Kinshasa = moteur mais risque de saturation. Goma = sous-performance à investiguer (marché trop petit ? management ?). Recommandation : auditer Goma, ne pas sur-investir sur Kinshasa sans plan de dilution du risque.
3. **Livrable intermédiaire 3** : rapport d'analyse complet (5-8 pages) structuré : résumé exécutif, méthodologie, analyse descriptive, analyse diagnostique, insights clés (5), recommandations (3), limites, annexes techniques.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: l'analyse exploratoire commence par... A) le diagnostic qualité B) les graphiques C) les recommandations
2. QCM: un insight est... A) une découverte actionnable B) un chiffre brut C) une opinion
3. QCM: le nettoyage doit être... A) documenté et justifié B) caché C) aléatoire
4. Ouverte: différence entre analyse descriptive et analyse diagnostique.
5. Ouverte: comment choisir entre supprimer ou imputer une valeur aberrante ?
6. Cas: le CA total a baissé de 2% après nettoyage. Le directeur s'inquiète. Réponse ?
7. QCM: RANK() vs ROW_NUMBER() pour le top agences — différence ?
8. Ouverte: pourquoi croiser les analyses (stats + SQL + features) plutôt qu'une seule méthode ?
9. Cas: une agence a un CA élevé mais un taux d'incidents très haut. Insight ?
10. QCM: un rapport d'analyse doit inclure... A) la méthodologie B) uniquement les graphiques C) rien
11. Ouverte: comment transformer un chiffre en insight ?
12. Cas: les données ne montrent aucun pattern clair. Conclusion ?
13. QCM: objectif du module 2 = A) produire une analyse complète et actionnable B) faire un seul graphique C) ignorer le nettoyage
14. Ouverte: comment présenter 5 insights en 3 minutes à un directeur ?
15. QCM: résultat attendu = A) rapport d'analyse structuré avec insights B) données brutes C) pas de conclusions

---

## 3) Visualisation et dashboard de synthèse (3h)

### Objectifs d'apprentissage
- Créer un dashboard exécutif qui répond aux questions business en un coup d'œil.
- Choisir les visuels adaptés à chaque insight (pas de "tout en camembert").
- Utiliser au moins 2 outils (Excel + Power BI, ou Excel + Python).
- Annoter et contextualiser chaque visualisation.
- Préparer une version "présentable" pour un comité de direction.

### Contenu pédagogique
Le dashboard est ce que le directeur verra. Il doit être impeccable, parlant, et actionnable.

Points clés:
1. **Structure du dashboard exécutif** : page unique avec (a) 4 KPI cards en haut (CA total, taux d'incidents, nb agences, évolution vs N-1), (b) carte ou barres des agences (top/bottom), (c) courbe d'évolution mensuelle, (d) tableau des alertes (agences à risque). Un directeur doit comprendre la situation en 30 secondes.
2. **Visuels par question** :
   - "Quelles agences performent ?" → barres horizontales top 10 CA.
   - "Comment évolue l'activité ?" → courbes CA par mois.
   - "Où sont les risques ?" → scatter plot (CA vs taux d'incidents), les agences en haut à gauche (haut CA, haut risque) sont prioritaires.
   - "Quelle est la répartition ?" → treemap CA par région.
3. **Deux versions** : Version Excel (TCD + segments + graphiques croisés) — pour l'équipe qui veut explorer. Version Power BI (rapport publié) — pour le partage et les mises à jour automatiques.
4. **Annotations** : chaque visuel a un titre parlant (pas "CA par agence" mais "Kinshasa = 18% du CA — risque de concentration"). Les points importants sont annotés (flèche, texte). Les seuils critiques sont matérialisés (ligne rouge).
5. **Présentation comité de direction** : 5 slides maximum. Slide 1 : résumé exécutif (3 chiffres clés + 1 phrase). Slide 2 : performance (où va l'argent ?). Slide 3 : risques (où sont les problèmes ?). Slide 4 : zoom sur 1 insight majeur. Slide 5 : recommandations (3 actions, chiffrées, priorisées).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : créer le dashboard Excel exécutif avec KPI cards, top 10 agences, courbe d'évolution, et segment région. Titre : "Tableau de bord des agences — Décembre 2024".
   - **Corrigé détaillé** : KPI cards = cellules avec formules (SOMME, MOYENNE, NB.SI), police 24pt, fond coloré. Top 10 = TCD + graphique barres. Courbe = TCD + graphique courbes (CA par mois, filtre région via segment). Segment Région connecté aux 2 TCD. Mise en forme : thème sobre, palette bleu professionnel, titres parlants.
2. **Exercice 2 (intermédiaire)** : créer le scatter plot "CA vs Taux d'incidents" avec Power BI ou Python (plotly). Chaque point = une agence, taille = volume de transactions, couleur = région. Identifier le quadrant "haut risque, haut CA" et l'annoter.
   - **Corrigé détaillé** : Power BI : nuage de points, Axe X = [Taux Incidents], Axe Y = [Total CA], Taille = [Nb Transactions], Légende = Région. Ajouter une ligne de référence horizontale (CA moyen) et verticale (taux d'incidents moyen). Les agences dans le quadrant supérieur droit sont critiques (haut CA, haut risque). Python : `px.scatter(df, x='taux_incidents', y='ca', size='nb_tx', color='région', hover_name='agence')`. Annoter manuellement les 3 agences critiques.
3. **Exercice 3 (avancé)** : préparer la présentation de 5 minutes pour le comité de direction. S'entraîner à l'oral (s'enregistrer ou présenter à un pair). Critères : clarté, concision, impact, confiance.
   - **Corrigé détaillé** : Structure : (1) "Voici les 3 chiffres à retenir ce mois-ci" (30s). (2) "La performance : Kinshasa représente 18% du CA mais sa croissance ralentit" (1min). (3) "Les risques : 3 agences ont un taux d'incidents > 5%, en hausse depuis 3 mois" (1min). (4) "Zoom sur Goma : CA en baisse de 5%, taux d'incidents en hausse — nous recommandons un audit" (1min). (5) "Nos 3 recommandations : auditer Goma, renforcer l'IT à Kinshasa, lancer un plan de réduction des incidents (objectif -20% en 6 mois)" (1min). S'entraîner jusqu'à ce que ça passe en 5 minutes sans notes.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: un dashboard exécutif doit être compréhensible en... A) 30 secondes B) 30 minutes C) 3 jours
2. QCM: un scatter plot montre... A) la relation entre 2 variables B) une seule variable C) du texte
3. QCM: un KPI card affiche... A) un chiffre clé en grand B) un graphique complexe C) un tableau
4. Ouverte: pourquoi annoter les points importants sur un dashboard ?
5. Ouverte: comment choisir entre Excel, Power BI et Python pour un dashboard exécutif ?
6. Cas: le directeur regarde le dashboard et dit "OK, et alors ?". Problème ?
7. QCM: un bon titre de dashboard... A) raconte l'info clé B) est technique C) est absent
8. Ouverte: pourquoi préparer 2 versions du dashboard (exploration + exécutif) ?
9. Cas: le dashboard est prêt mais la présentation au comité est dans 10 minutes. Priorité ?
10. QCM: une présentation exécutive doit durer... A) 5 minutes max B) 1 heure C) 30 minutes
11. Ouverte: comment gérer le stress d'une présentation devant la direction ?
12. Cas: un directeur conteste un chiffre du dashboard. Réaction ?
13. QCM: objectif du module 3 = A) créer un dashboard exécutif percutant B) faire de beaux graphiques sans sens C) éviter de présenter
14. Ouverte: comment mesurer l'impact d'un dashboard sur les décisions ?
15. QCM: résultat attendu = A) dashboard + présentation prêts pour le comité B) graphiques sans commentaire C) pas de présentation

---

## 4) Rapport final, portfolio P3-B et pitch data analyst (2h)

### Objectifs d'apprentissage
- Rédiger un rapport d'analyse professionnel et structuré.
- Synthétiser les acquis P3-B en un portfolio cohérent.
- Préparer un pitch "data analyst junior prêt à l'emploi".
- Obtenir la validation P3-B et planifier la transition vers P3-C.

### Contenu pédagogique
La documentation transforme l'effort technique en preuve de compétence durable.

Points clés:
1. **Rapport d'analyse P3-B** : document final de 5-8 pages incluant : résumé exécutif, contexte et questions business, méthodologie (données, nettoyage, outils), analyse descriptive (KPI, tendances), analyse diagnostique (corrélations, segments), insights clés (5), recommandations (3 actions chiffrées), limites et prochaines étapes, annexes techniques (code, requêtes SQL).
2. **Portfolio P3-B** : 3 meilleures preuves à publier — le rapport d'analyse (anonymisé), un dashboard interactif (lien Power BI ou HTML), et un extrait de code commenté (ex: la requête SQL avec LAG() ou le pipeline pandas avec pipe). Ajouter un fichier README.md dans le dossier portfolio avec le contexte.
3. **Pitch data analyst junior** (90 secondes) : "En 5 jours de projet intensif, j'ai mené une analyse de données complète pour une banque : des statistiques descriptives au dashboard exécutif, en passant par le SQL analytique, le nettoyage de données, et le feature engineering. J'ai produit un rapport avec 5 insights actionnables et 3 recommandations chiffrées. Je maîtrise Excel, Power BI, Python/pandas, et SQL — et je suis prêt à transformer des données brutes en décisions business."
4. **Validation P3-B** : vérifier les 7 livrables obligatoires, la grille /100, et le seuil >= 80. Si validé, célébrer la fin de P3-B et préparer la transition vers P3-C (Développement web).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : compiler les 5 meilleures preuves P3-B dans un dossier structuré `preuves-p3b/`.
   - **Corrigé détaillé** : Dossier contenant : 01-rapport-analyse.pdf, 02-dashboard-powerbi.pbix (ou lien), 03-script-analyse.py (commenté), 04-presentation-comite.pptx, 05-cahier-des-charges.pdf. Ajouter un README.md listant les fichiers avec contexte. Prêt à être poussé sur GitHub et intégré au portfolio.
2. **Exercice 2 (intermédiaire)** : relire le rapport d'analyse avec un regard "directeur" : est-ce que chaque page répond à "et alors ?" Si une page ne contient pas d'insight actionnable, la reformuler.
   - **Corrigé détaillé** : Checklist : chaque graphique a-t-il un titre parlant ? Chaque chiffre est-il contextualisé (comparaison, seuil) ? Y a-t-il une recommandation après chaque insight ? Le résumé exécutif permet-il de comprendre sans lire le rapport ? Si non, itérer.
3. **Exercice 3 (avancé)** : préparer l'argumentaire de transition P3-B → P3-C. Quelles compétences data seront utiles pour le développement web ? Comment le portfolio P3-A (admin sys) et P3-B (data) se complètent-ils pour le poste de "Professionnel du numérique" ?
   - **Corrigé détaillé** : Synergie P3-A + P3-B = admin sys qui sait analyser ses logs, data analyst qui comprend l'infrastructure, professionnel complet capable de déployer ET d'analyser. P3-C (développement web) ajoutera la couche applicative : créer les applications qui génèrent les données que P3-B analyse. Plan J23 : démarrer JavaScript approfondi, en réutilisant la rigueur méthodologique acquise en P3-A et P3-B.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: un rapport d'analyse professionnel doit inclure... A) méthodologie, insights, recommandations B) uniquement des graphiques C) rien
2. QCM: le portfolio P3-B doit montrer... A) des preuves concrètes de compétences B) uniquement du texte C) rien
3. QCM: un pitch data analyst efficace dure... A) 90 secondes B) 10 minutes C) 1 heure
4. Ouverte: pourquoi inclure la méthodologie dans le rapport ?
5. Ouverte: comment choisir les 3 meilleures preuves pour le portfolio ?
6. Cas: un recruteur te demande "Prouvez-moi que vous savez analyser des données". Que montres-tu ?
7. QCM: la validation P3-B nécessite un score >=... A) 80/100 B) 50/100 C) 100/100
8. Ouverte: pourquoi la transition P3-A → P3-B → P3-C est-elle cohérente pour le poste visé ?
9. Cas: le rapport fait 25 pages. Le directeur dit "trop long". Que faire ?
10. QCM: un bon pitch commence par... A) l'impact B) la technique C) les excuses
11. Ouverte: comment expliquer la valeur de l'analyse de données à un non-technique ?
12. Cas: tu as 1 minute pour convaincre un directeur de te recruter comme data analyst junior.
13. QCM: objectif du module 4 = A) transformer P3-B en preuves employables B) cacher son travail C) éviter de documenter
14. Ouverte: indicateur de succès P3-B ?
15. QCM: résultat P3-B réussi = A) rapport + portfolio + pitch prêts B) rien documenté C) données brutes sans analyse

---

## 5) Banque de questions finale + validation P3-B (2h)

### Objectifs d'apprentissage
- Valider l'ensemble des acquis P3-B en test cumulatif.
- Obtenir la validation formelle du Tome P3-B.
- Célébrer la fin de P3-B et ouvrir P3-C.

### Contenu pédagogique
- 40 min : test cumulatif P3-B (J18 à J22).
- 20 min : correction, bilan, célébration.
- 30 min : planification P3-C (J23-J28, Développement web).
- 30 min : sauvegarde GitHub et mise à jour du portfolio.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : lister les 5 compétences principales acquises en P3-B.
   - **Corrigé détaillé** : 1) Statistiques descriptives et inférentielles. 2) SQL analytique avancé (fenêtres, CTE, agrégations). 3) Data cleaning et ETL. 4) Visualisation (Excel, Power BI, Python). 5) Feature engineering et optimisation pandas.
2. **Exercice 2 (intermédiaire)** : plan J23 en 3 priorités.
   - **Corrigé détaillé** : 1) Maîtriser JavaScript approfondi (closures, async/await, ES6+). 2) Structurer un projet frontend moderne (modules, bundling). 3) Créer une première application interactive (DOM, événements, API calls).
3. **Exercice 3 (avancé)** : commit final P3-B et mise à jour du portfolio en ligne.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: P3-B couvre principalement... A) l'analyse de données B) l'administration système C) le développement web
2. QCM: la validation P3-B est acquise si... A) score >= 80/100 et livrables complets B) présence aux cours C) avis personnel
3. QCM: P3-C portera sur... A) le développement web B) le cloud C) la sécurité
4. Ouverte: quelle compétence P3-B te semble la plus utile pour ton futur poste ?
5. Ouverte: quel a été le plus grand défi de P3-B ?
6. Cas: score = 78/100. Prochaine étape ?
7. QCM: un portfolio en ligne doit être... A) accessible et à jour B) caché C) vide
8. Ouverte: pourquoi versionner tout le travail dans Git ?
9. QCM: la célébration est importante car... A) elle marque la progression et motive B) c'est une perte de temps C) personne ne le fait
10. QCM: résultat P3-B réussi = A) compétences data analyst junior prouvées B) rien C) stress inchangé
11. Ouverte: quel conseil donnerais-tu à quelqu'un qui commence P3-B ?
12. QCM: la prochaine étape après P3-B est... A) P3-C Développement web B) P4 Cloud C) retour à P0
13. QCM: objectif final P3-B = A) data analyst junior opérationnel B) expert en tout C) débutant éternel
14. Ouverte: comment continuer à progresser en analyse de données après P3-B ?
15. QCM: 🏆 P3-B = A) MISSION ACCOMPLIE B) à refaire C) abandonné

---

## Validation qualité J22 — Projet de synthèse P3-B (anti-superficiel)

### Livrables obligatoires fin de J22 (ET FIN DE P3-B)
1. **Cahier des charges** (questions business → questions data → KPI → périmètre).
2. **Rapport de qualité des données** (problèmes, actions, impact).
3. **Rapport d'analyse complet** (5-8 pages, méthodologie, insights, recommandations).
4. **Dashboard exécutif** (Excel + Power BI ou Python, KPI cards, visuels annotés).
5. **Présentation comité de direction** (5 slides, 5 minutes).
6. **Portfolio P3-B** mis à jour (3 meilleures preuves + pitch data analyst).
7. **Code source** (SQL, Python) versionné dans Git.

### Grille d'évaluation rapide (100 points)
- Qualité du cadrage (questions, KPI, périmètre, limites) : **15 pts**
- Qualité de l'analyse (nettoyage, stats, SQL, features, insights) : **30 pts**
- Qualité du dashboard et de la présentation (clarté, impact, storytelling) : **25 pts**
- Qualité du rapport et du portfolio (structure, preuves, employabilité) : **20 pts**
- Communication et pitch : **10 pts**

### Seuil attendu
- **>= 80/100** : P3-B validé avec succès, passage en P3-C.
- **65-79/100** : validé sous remédiation ciblée 48h avant P3-C.
- **< 65/100** : consolidation P3-B requise avant passage en P3-C.

### 🏆 FÉLICITATIONS — Fin du Tome P3-B !

Si tu as atteint le seuil de 80/100, tu as complété avec succès la spécialisation **Analyse de données**. Tu disposes maintenant :
- D'une analyse de données complète de bout en bout
- De compétences vérifiables en statistiques, SQL, Python/pandas, et visualisation
- D'un portfolio data analyst professionnel
- D'un argumentaire solide pour les entretiens de data analyst junior

**Prochaine étape : Tome P3-C — Développement web (J23-J28).**

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Cadrage)
1. **A**
2. **A**
3. **A**
4. Pour éviter de passer des heures à analyser des données sans répondre à la bonne question. Un bon cadrage garantit que l'analyse sera utile et actionnable.
5. Question business = "Comment améliorer X ?" (vague, stratégique). Question data = "Quel est le taux de Y par Z sur les 12 derniers mois ?" (précise, mesurable, répondable avec les données).
6. Demander : quel objectif ? quel périmètre ? quel délai ? quel format ? quelles données disponibles ? Reformuler le besoin en questions précises et valider avant de commencer.
7. **A**
8. Pour la transparence et la crédibilité. Si quelqu'un conteste les conclusions, on peut expliquer ce que l'analyse peut et ne peut pas dire.
9. Le mentionner dans les limites : "La satisfaction client n'est pas disponible dans les données actuelles. Nous recommandons de mettre en place une collecte (enquête, NPS) pour les prochaines analyses."
10. **A**
11. Prioriser avec le directeur : matrice impact × faisabilité. Quelles questions, si on y répond, auront le plus d'impact business ? Commencer par celles-là.
12. Vérifier que ce n'est pas un artefact (ex: une colonne calculée à partir de l'autre, ou un doublon). Corrélation parfaite = suspect, sauf relation mathématique évidente.
13. **A**
14. "Voici les 3 questions auxquelles l'analyse va répondre, les KPI qu'on va suivre, et le livrable que vous recevrez en fin de journée. Est-ce que ça correspond à votre besoin ?"
15. **A**

### B. Corrigé — Module 2 (Analyse exploratoire)
1. **A**
2. **A**
3. **A**
4. Descriptive = "Quoi ?" (KPI, tendances, distributions). Diagnostique = "Pourquoi ?" (corrélations, causes, segments). On commence par décrire, puis on diagnostique.
5. Si la valeur aberrante est une erreur de saisie (ex: âge=250), corriger ou supprimer. Si c'est une valeur réelle mais extrême (ex: une transaction exceptionnelle), la garder mais la traiter séparément (analyse avec et sans).
6. Expliquer : "La baisse de 2% vient de la suppression de X doublons et de la correction de Y erreurs. Le CA réel est 12.3M, pas 12.5M. Nous sommes maintenant plus précis."
7. RANK() donne le même rang aux ex-aequo et crée un trou (1,2,2,4). ROW_NUMBER() donne un numéro unique à chaque ligne, même ex-aequo (1,2,3,4). Pour un top N, RANK() est plus juste si des agences ont le même CA.
8. Chaque méthode éclaire un aspect différent. Les stats donnent les chiffres clés. SQL permet de croiser et d'agréger. Les features capturent la logique métier. Croiser les 3 donne une vue complète et robuste.
9. L'agence génère du chiffre mais au prix d'une qualité de service dégradée (incidents). Risque : les clients vont partir, le CA va chuter. Recommandation : investiguer les causes des incidents avant que le CA ne baisse.
10. **A**
11. Ajouter le contexte : comparaison (vs période précédente, vs moyenne), impact business (ce que ça coûte ou rapporte), et recommandation (ce qu'il faut faire).
12. "L'absence de pattern est un résultat en soi : les données ne montrent pas de tendance ou de problème structurel. Cela peut indiquer une situation stable. Nous recommandons de surveiller avec ces KPI et de ré-analyser dans 3 mois."
13. **A**
14. "Sur les 15 analyses réalisées, voici les 5 découvertes les plus impactantes pour le business. Pour chacune : le chiffre clé, pourquoi c'est important, et ce que je recommande."
15. **A**

### C. Corrigé — Module 3 (Visualisation)
1. **A**
2. **A**
3. **A**
4. Pour guider le regard, expliquer ce qui est normal ou anormal, et transformer un visuel en histoire. Sans annotation, le lecteur peut passer à côté de l'information clé.
5. Excel = rapidité, tout le monde l'a, idéal pour l'exploration et les dashboards simples. Power BI = interactivité native, mise à jour automatique, partage. Python = contrôle total, dashboards web sur mesure. Pour un comité de direction, Power BI (lien interactif) + PDF de secours.
6. Le dashboard montre des chiffres mais pas d'insights. Il manque l'interprétation : "et alors ?" Ajouter des titres parlants, des annotations, et une conclusion en une phrase.
7. **A**
8. Version exploration = interactive, tous les filtres, pour l'analyste qui veut creuser. Version exécutif = épurée, KPI cards, 3-4 visuels clés, pour le directeur qui veut comprendre en 30 secondes.
9. Préparer 3 messages clés, vérifier que chaque visuel soutient un de ces messages, répéter l'enchaînement. Ne pas ajouter de nouveaux graphiques à la dernière minute.
10. **A**
11. Préparer une structure simple (3 messages clés), s'entraîner à voix haute, anticiper les questions (préparer des slides de backup), respirer, et se rappeler que tu es celui qui connaît le mieux les données.
12. Rester calme, expliquer d'où vient le chiffre (source, calcul), proposer de vérifier après la réunion si nécessaire. Ne jamais improviser une réponse — dire "je vérifie et je vous reviens" est professionnel.
13. **A**
14. Suivre si les recommandations sont appliquées, mesurer les KPI avant/après, demander du feedback aux utilisateurs du dashboard, itérer.
15. **A**

### D. Corrigé — Module 4 (Portfolio & pitch)
1. **A**
2. **A**
3. **A**
4. Pour que le lecteur puisse reproduire l'analyse, comprendre les choix faits, et évaluer la rigueur du travail. La méthodologie, c'est la crédibilité de l'analyse.
5. Celles qui montrent la plus grande variété de compétences (analyse + visualisation + code), qui sont les plus proches du poste visé, et qui ont un résultat concret (insight, recommandation).
6. Le rapport P3-B : "Voici une analyse complète que j'ai menée sur des données bancaires. 5 insights, 3 recommandations chiffrées. Le code source est disponible sur mon GitHub."
7. **A**
8. P3-A (admin sys) = l'infrastructure qui génère les logs et les données. P3-B (data) = l'analyse de ces données pour piloter l'infrastructure et le business. P3-C (web) = les applications qui produisent et consomment ces données. Le professionnel du numérique maîtrise les 3 couches.
9. Créer un résumé exécutif d'une page en tête du rapport. Le lecteur pressé lit le résumé ; le lecteur intéressé lit le rapport complet. Proposer les deux.
10. **A**
11. "L'analyse de données, c'est comme une lampe torche dans une pièce noire. Les données brutes, c'est la pièce éteinte. L'analyse, c'est allumer la lampe pour voir où sont les problèmes et les opportunités."
12. Pitch 60s : "J'ai mené une analyse de données complète pour une banque, de la donnée brute au dashboard exécutif. J'ai identifié 5 insights qui ont conduit à 3 recommandations chiffrées. Je maîtrise Excel, Power BI, Python et SQL. Je suis prêt à faire la même chose pour vous."
13. **A**
14. Score >= 80/100 + rapport publié + dashboard accessible + pitch maîtrisé en 90 secondes.
15. **A**

### E. Corrigé — Module 5 (Validation & célébration)
1. **A**
2. **A**
3. **A**
4. Réponse personnelle — exemples attendus : SQL analytique pour interroger les bases, pandas pour les analyses, visualisation pour communiquer.
5. Réponse personnelle — exemples : le SQL analytique (fonctions fenêtres), le nettoyage de données (rigueur), la visualisation (choisir le bon graphique).
6. Remédiation ciblée 48h : identifier les points faibles (grille de validation), les travailler spécifiquement, re-soumettre.
7. **A**
8. Pour la traçabilité, la collaboration, la sécurité (pas de perte), et la preuve de travail pour les recruteurs.
9. **A**
10. **A**
11. Réponse personnelle — exemples : "Ne néglige pas le nettoyage", "Pratique SQL tous les jours", "Apprends à raconter une histoire avec les données".
12. **A**
13. **A**
14. Projets personnels (Kaggle, données ouvertes), certifications (Microsoft PL-300 Power BI, Google Data Analytics), veille (blogs, podcasts data), pratique continue.
15. **A**