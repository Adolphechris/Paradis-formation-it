# TOME P5 — Jour 37 (14h)

## Découpage horaire opérationnel J37
- Révision P3-A — Administration systèmes & réseau (Linux, Windows/AD, virtualisation, sécurité, supervision) — **5h**
- Révision P3-B — Analyse de données (statistiques, SQL analytique, data cleaning, visualisation) — **5h**
- Banque de questions chronométrée P3-A/P3-B (100 questions, 2h30) — **2h30**
- Correction + analyse des lacunes + suivi P1 — **1h30**

---

## 1) Révision P3-A — Admin systèmes & réseau (5h)

### Synthèse des points clés P3-A

**Linux avancé (J12) :**
- Services : `systemctl start/stop/restart/status/enable/disable`, unit files, runlevels/targets.
- Logs : `journalctl -u <service> --since/--until`, syslog, analyse d'incident via logs.
- Permissions : `chmod` (rwx), `chown`, `chgrp`, UID/GID, ACL (`setfacl`/`getfacl`), PAM, DAC.

**Windows Server & AD (J13) :**
- Windows Server : rôles (AD DS, DNS, DHCP, File Services), Server Manager, Event Viewer.
- Active Directory : domaine, OU, utilisateurs, groupes, LDAP, Kerberos, NTLM.
- GPO : stratégies de groupe, ordre d'application (Local → Site → Domaine → OU), `gpupdate /force`.
- Sécurité Windows : UAC, BitLocker, Windows Defender, pare-feu Windows.

**Virtualisation & Docker (J14) :**
- Hyperviseurs : Type 1 (bare-metal : KVM, ESXi, Hyper-V), Type 2 (hosted : VirtualBox, VMware Workstation).
- VM : snapshots, overhead (OS invité), dimensionnement.
- Conteneurs : différence VM vs conteneur (partage noyau), LXC, OCI.
- Docker : images (Dockerfile, layers, cache), conteneurs (`run`, `ps`, `stop`, `rm`, `logs`, `exec`), volumes, réseaux, docker-compose.

**Sécurité appliquée (J15) :**
- Durcissement : surface d'attaque, services inutiles, pare-feu (iptables), fail2ban, mises à jour.
- Gestion des accès : AAA, moindre privilège, MFA/2FA, comptes de service, matrice de droits.
- Réponse aux incidents : cycle NIST (préparation, détection, confinement, éradication, récupération), IOC, RCA, post-mortem blameless.

**Supervision & ITSM (J16) :**
- Supervision : métriques (CPU, RAM, disque, réseau), alertes (seuils, notifications), Nagios/Zabbix/Prometheus.
- ITSM : cycle de vie ticket, matrice impact × urgence, P1-P4, incident vs problème vs changement.
- RCA : méthode des 5 Pourquoi, post-mortem, escalade, communication incident.

**Projet synthèse P3-A (J17) :**
- Conception infrastructure : schéma, dimensionnement, plan adressage, matrice de flux.
- Déploiement sécurisé : VMs/containers, services, pare-feu, supervision.
- Validation : tests fonctionnels, sécurité, incidents simulés, MTTD/MTTR.

### Banque ciblée P3-A (50 questions)

**Linux/Windows/AD (12 questions)**
1. QCM: `systemctl enable nginx` fait... A) démarrer nginx au boot B) redémarrer nginx C) arrêter nginx
2. QCM: `journalctl -u nginx --since "1 hour ago"` affiche... A) les logs nginx de la dernière heure B) tout le journal C) rien
3. QCM: `chmod 640 fichier` donne... A) rw-r----- B) rwx------ C) r--r--r--
4. Ouverte: différence entre DAC et ACL.
5. QCM: Active Directory utilise le protocole... A) LDAP B) HTTP C) SSH
6. QCM: une OU dans Active Directory... A) organise les objets B) stocke les backups C) remplace DNS
7. Cas: un utilisateur ne peut pas se connecter au domaine. Diagnostic ?
8. QCM: Kerberos est un protocole d'... A) authentification par tickets B) transfert de fichiers C) messagerie
9. Ouverte: différence entre NTLM et Kerberos.
10. QCM: `gpupdate /force` applique... A) les GPO immédiatement B) les mises à jour Windows C) rien
11. Ouverte: à quoi sert PAM sous Linux ?
12. QCM: une GPO peut configurer... A) les politiques de mot de passe B) les disques durs C) la RAM

**Virtualisation/Docker (10 questions)**
13. QCM: KVM est un hyperviseur de type... A) 1 (bare-metal) B) 2 (hosted) C) 3
14. QCM: un conteneur partage... A) le noyau de l'hôte B) l'OS invité complet C) le BIOS
15. Ouverte: pourquoi un conteneur est-il plus léger qu'une VM ?
16. QCM: `docker run -d -p 8080:80 nginx` — `-d` signifie... A) mode détaché B) mode debug C) delete
17. QCM: un Dockerfile commence par... A) FROM B) RUN C) CMD
18. Cas: un conteneur a perdu ses données après redémarrage. Cause et solution ?
19. QCM: `docker-compose up -d` lance... A) les services en arrière-plan B) un seul conteneur C) rien
20. Ouverte: différence entre une image Docker et un conteneur Docker.
21. QCM: un volume Docker permet... A) la persistance des données B) d'accélérer le réseau C) rien
22. Cas: `docker ps` est vide après `docker run -d nginx`. Diagnostic ?

**Sécurité (16 questions)**
23. QCM: le durcissement réduit... A) la surface d'attaque B) les performances C) le stockage
24. QCM: AAA signifie... A) Authentification, Autorisation, Audit B) Accès, Alerte, Action C) rien
25. QCM: MFA combine... A) au moins 2 facteurs différents B) 2 mots de passe C) 2 utilisateurs
26. Ouverte: pourquoi désactiver le login root en SSH ?
27. QCM: fail2ban bloque... A) les IP après échecs répétés B) les virus C) les spams
28. QCM: le cycle NIST commence par... A) la préparation B) le confinement C) la communication
29. Ouverte: différence entre confinement et éradication.
30. Cas: 50 tentatives SSH échouées en 2 minutes dans auth.log. Type d'attaque et réponse ?
31. QCM: un IOC est... A) un indice de compromission B) un pare-feu C) un antivirus
32. QCM: `iptables -P INPUT DROP` définit... A) la politique par défaut (bloquer) B) une règle C) rien
33. Ouverte: expliquer la méthode des 5 Pourquoi pour une RCA.
34. Cas: un compte "backup" inconnu avec UID 0 apparaît dans /etc/passwd. Action ?
35. QCM: WAF protège contre... A) les attaques web (XSS, SQLi) B) les pannes disque C) rien
36. QCM: CVE identifie... A) une vulnérabilité connue B) un certificat C) un service
37. Ouverte: principe du moindre privilège.
38. Cas: un employé quitte l'entreprise. Ses accès étaient centralisés AD. Combien de temps pour révoquer ?

**Supervision/ITSM (12 questions)**
39. QCM: la supervision détecte... A) les problèmes avant les utilisateurs B) les bugs de code C) rien
40. QCM: Prometheus est un outil de... A) monitoring et alerting B) traitement de texte C) visioconférence
41. Ouverte: pourquoi une alerte doit-elle être actionnable ?
42. QCM: un ticket P1 a une priorité... A) critique B) basse C) moyenne
43. QCM: ITIL distingue incident et... A) problème B) projet C) script
44. Ouverte: différence entre incident et problème ITIL.
45. Cas: même incident 4 fois en 2 semaines. Approche ?
46. QCM: un SLA définit... A) le niveau de service attendu B) le prix C) la couleur
47. Cas: alerte "disque > 85%". Action immédiate ?
48. QCM: un post-mortem blameless se concentre sur... A) les processus B) les personnes C) rien
49. Ouverte: que doit contenir une escalade efficace ?
50. QCM: MTTD signifie... A) Mean Time To Detect B) Maximum Time To Delete C) rien

---

## 2) Révision P3-B — Analyse de données (5h)

### Synthèse des points clés P3-B (J18-J22)

**Statistiques (J18) :**
- Descriptives : moyenne (sensible aux extrêmes), médiane (robuste), mode, écart-type (dispersion), variance, quartiles, IQR.
- Distributions : loi normale (68-95-99.7), asymétrique (droite/gauche), bimodale.
- Corrélation : r ∈ [-1, +1], corrélation ≠ causalité, variable confondante.
- Outliers : IQR × 1.5, ne pas supprimer aveuglément.

**SQL analytique (J19) :**
- Fonctions fenêtres : `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `LAG()`, `LEAD()`, `SUM() OVER`.
- CTE récursives : `WITH RECURSIVE`.
- Agrégations multi-niveaux : `ROLLUP`, `CUBE`, `GROUPING SETS`.
- Jointures analytiques : anti-join (`LEFT JOIN ... IS NULL`), semi-join (`EXISTS`).

**Data cleaning (J19) :**
- Problèmes : NaN, doublons, incohérences, formats, outliers.
- Imputation : moyenne (biaisée), médiane (robuste), mode (catégoriel), k-NN.
- Pipeline ETL : Extract → Transform → Load, idempotent.
- Documentation : journal de nettoyage, validation post-nettoyage.

**Visualisation (J20) :**
- Excel : TCD, graphiques croisés dynamiques, segments, sparklines, waterfall.
- Power BI : DAX, relations modèle, rapports interactifs, publication.
- Python : matplotlib (statique), seaborn (statistique), plotly (interactif).
- Storytelling : titre parlant, annotation, recommandation actionnable.

**Big Data & pandas avancé (J21) :**
- 3V : Volume, Vélocité, Variété (+ Véracité).
- Hadoop (HDFS + MapReduce) vs Spark (in-memory, PySpark).
- pandas : groupby multi-niveaux, pivot/melt, merge, apply, pipe.
- Feature engineering : normalisation, standardisation (Z-score), one-hot encoding, features temporelles.
- Optimisation : dtypes, catégories, chunking, vectorisation.

### Banque ciblée P3-B (50 questions)

**Statistiques (12 questions)**
1. QCM: la moyenne est sensible... A) aux valeurs extrêmes B) uniquement à la médiane C) à rien
2. QCM: l'écart-type mesure... A) la dispersion B) la valeur maximale C) la somme
3. QCM: dans une loi normale, 95% des données sont à... A) ±2 écarts-types B) ±1 écart-type C) ±3 écarts-types
4. Ouverte: pourquoi la moyenne peut-elle être trompeuse ?
5. Cas: salaire moyen 50K, salaire médian 35K. Interprétation ?
6. QCM: un coefficient de corrélation r = -0.9 indique... A) une forte corrélation négative B) aucune corrélation C) une erreur
7. Ouverte: pourquoi "corrélation n'implique pas causalité" ?
8. QCM: l'IQR est... A) Q3 - Q1 B) Q3 + Q1 C) Q3 / Q1
9. Cas: détecter un outlier avec la méthode IQR (Q1=10, Q3=30, valeur=55).
10. QCM: R² mesure... A) la qualité d'une régression B) la moyenne C) la médiane
11. Ouverte: différence entre moyenne et médiane.
12. QCM: un histogramme montre... A) la distribution d'une variable B) la corrélation C) le temps

**SQL analytique (14 questions)**
13. QCM: `ROW_NUMBER() OVER (PARTITION BY cat ORDER BY prix DESC)` numérote... A) par catégorie B) globalement C) aléatoirement
14. QCM: `LAG(ca, 1) OVER (ORDER BY mois)` retourne... A) le CA du mois précédent B) le mois suivant C) la moyenne
15. QCM: une CTE récursive utilise... A) UNION ALL B) UNION C) INTERSECT
16. Ouverte: différence entre WHERE et PARTITION BY dans une fonction fenêtre.
17. Cas: top 3 clients par région. Requête avec ROW_NUMBER ?
18. QCM: un anti-join utilise... A) LEFT JOIN + IS NULL B) INNER JOIN C) RIGHT JOIN
19. QCM: `ROLLUP(a, b)` produit... A) (a,b), (a), () B) uniquement (a,b) C) toutes les combinaisons
20. Ouverte: quand utiliser ROLLUP vs CUBE ?
21. Cas: calculer l'évolution mensuelle du CA avec LAG().
22. QCM: OLAP est optimisé pour... A) les lectures et agrégations B) les écritures C) rien
23. Ouverte: différence entre OLTP et OLAP.
24. QCM: un schéma en étoile a... A) une table de faits centrale B) pas de relations C) une seule table
25. Ouverte: à quoi sert la normalisation 3NF ?
26. QCM: `EXISTS` dans une sous-requête vérifie... A) l'existence d'au moins une ligne B) le nombre C) rien

**Data cleaning (10 questions)**
27. QCM: l'imputation remplace... A) les valeurs manquantes B) les doublons C) les types
28. QCM: `.drop_duplicates()` supprime... A) les lignes en double B) les colonnes C) les NaN
29. Ouverte: pourquoi documenter les décisions de nettoyage ?
30. QCM: un pipeline ETL est... A) Extract, Transform, Load B) Error, Test, Log C) rien
31. Cas: après nettoyage, le CA a baissé de 1.6%. Inquiétant ?
32. QCM: `df['col'].astype('category')` optimise... A) la mémoire B) le CPU C) le réseau
33. Ouverte: imputation par moyenne vs médiane — quand choisir l'une ou l'autre ?
34. QCM: NaN signifie... A) Not a Number B) New and Null C) rien
35. Cas: `df.info()` montre une colonne "prix" en `object`. Problème et correction ?
36. QCM: `df.isnull().sum()` compte... A) les valeurs manquantes par colonne B) les lignes C) rien

**Visualisation (8 questions)**
37. QCM: un TCD Excel permet de... A) croiser et synthétiser des données B) écrire du code C) rien
38. QCM: DAX est le langage de... A) Power BI B) Excel C) Python
39. QCM: `plt.savefig('graph.png', dpi=150)` exporte... A) un graphique haute résolution B) du texte C) rien
40. Ouverte: pourquoi éviter les graphiques 3D ?
41. QCM: `sns.heatmap(df.corr())` visualise... A) la matrice de corrélation B) les données brutes C) rien
42. Cas: le dashboard montre une chute du CA en août. Le directeur demande "pourquoi ?". Action ?
43. QCM: un bon titre de graphique... A) raconte l'histoire B) est technique C) est absent
44. Ouverte: différence entre un histogramme et un nuage de points.

**Big Data/pandas avancé (6 questions)**
45. QCM: les 3V du Big Data sont... A) Volume, Vélocité, Variété B) Valeur, Visibilité, Virtualisation C) rien
46. QCM: Spark est plus rapide que MapReduce car... A) il travaille en mémoire B) il utilise le disque C) rien
47. QCM: `df.groupby('cat').agg({'ca': 'sum'})` agrège... A) le CA par catégorie B) toutes les lignes C) rien
48. Ouverte: quand passer de pandas à Spark ?
49. QCM: la standardisation Z-score transforme pour avoir... A) moyenne 0, écart-type 1 B) valeurs 0-1 C) rien
50. Cas: `df['col'].astype('int8')` échoue. Cause probable ?

---

## 3) Banque chronométrée P3-A/P3-B (2h30)

### Objectifs
- 100 questions en 2h30. Score cible >= 80%.
- Bloc P3-A (50 questions, 1h15) + Bloc P3-B (50 questions, 1h15).

---

## 4) Correction + analyse des lacunes + suivi P1 (1h30)

### Correction rapide

**P3-A :** 1A, 2A, 3A, 4-DAC propriétaire/groupe/autres, ACL droits fins supplémentaires, 5A, 6A, 7-vérifier connexion réseau, DNS, contrôleur de domaine disponible, 8A, 9-NTLM = challenge/response legacy, Kerberos = tickets moderne, 10A, 11-gestion modulaire de l'authentification, 12A, 13A, 14A, 15-pas d'OS invité (pas de noyau séparé), 16A, 17A, 18-pas de volume (données éphémères) → `-v` ou docker-compose volume, 19A, 20-image = modèle immuable, conteneur = instance en cours, 21A, 22-vérifier `docker ps -a` (conteneur arrêté ou crashé), 23A, 24A, 25A, 26-empêcher brute force root, forcer sudo, 27A, 28A, 29-confinement = limiter propagation, éradication = supprimer cause, 30-brute force → bloquer IP + vérifier si connexion réussie, 31A, 32A, 33-symptôme → pourquoi → creuser 5 fois → cause racine processus, 34-compromission → isoler → auditer → supprimer → RCA, 35A, 36A, 37-donner le strict nécessaire, 38-immédiatement (désactiver compte AD), 39A, 40A, 41-sinon bruit et ignorance des alertes, 42A, 43A, 44-incident = interruption, problème = cause racine, 45-ouvrir ticket problème + RCA, 46A, 47-diagnostiquer (du -sh), nettoyer, prévenir (logrotate), 48A, 49-contexte + tests + hypothèse + demande claire, 50A.

**P3-B :** 1A, 2A, 3A, 4-sensible aux valeurs extrêmes, 5-distribution asymétrique à droite (quelques hauts salaires tirent la moyenne), 6A, 7-variable cachée ou coïncidence, 8A, 9-IQR=20, seuil=30+1.5×20=60, 55<60 → pas outlier (seuil haut=60), 10A, 11-moyenne sensible extrêmes, médiane robuste, 12A, 13A, 14A, 15A, 16-WHERE filtre lignes, PARTITION BY définit groupes, 17-`SELECT * FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY region ORDER BY ca DESC) r FROM ventes) WHERE r <= 3`, 18A, 19A, 20-ROLLUP pour hiérarchie, CUBE pour toutes combinaisons (croisé), 21-`WITH m AS (SELECT mois, SUM(ca) ca FROM ventes GROUP BY 1) SELECT mois, ca, LAG(ca) OVER (ORDER BY mois) FROM m`, 22A, 23-OLTP optimisé écritures, OLAP optimisé lectures/agrégations, 24A, 25-éliminer redondances et incohérences, 26A, 27A, 28A, 29-reproductibilité, traçabilité, audit, 30A, 31-si légitime (doublons supprimés) → expliquer ; sinon problème, 32A, 33-médiane pour distribution asymétrique, moyenne pour symétrique, 34A, 35-contenir des caractères non numériques → `str.replace` + `astype(float)`, 36A, 37A, 38A, 39A, 40-déforme proportions (trompeur), 41A, 42-filtrer par produit/région, annoter, donner hypothèse, 43A, 44-histogramme = distribution 1 variable, scatter = relation 2 variables, 45A, 46A, 47A, 48-fichier > 5-10 Go ou > 50% RAM, 49A, 50-valeurs dépassent capacité int8 (±127) ou NaN.

---

## Validation qualité J37 (anti-superficiel)

### Grille d'évaluation (100 points)
- Score bloc P3-A (50 questions) : **50 pts**
- Score bloc P3-B (50 questions) : **50 pts**

### Seuil attendu
- **>= 80/100** : J37 validé, passage J38.
- **< 80/100** : remédiation ciblée.

### 🎯 Prochaine étape : J38 — Révision P3-C/P4.

---

## Corrigés guidés — mode tuteur (réponses attendues)

> Tu as raison : ici tu es l'étudiant. Utilise cette section pour t'auto-corriger après avoir tenté les questions.

### Module Révision Globale P2 + Début P3

1. **B** — UAC = User Account Control, contrôle l'élévation de privilèges sous Windows
2. **A** — NTFS = New Technology File System, système de fichiers Windows avancé
3. **B** — MMC = Microsoft Management Console, console d'administration Windows
4. **A** — Event Viewer affiche les journaux système Windows
5. **A** — TCD = Tableau Croisé Dynamique, agrège des données pour analyse
6. **Ouverte** — `$A$1` est une référence absolue qui ne change pas lors de la copie de la formule
7. **B** — Le publipostage fusionne un document Word avec un fichier Excel pour produire des documents personnalisés
8. **Ouverte** — Les règles Outlook filtrent automatiquement les emails entrants selon des critères définis
9. **Ouverte** — Les canaux Teams doivent être nommés explicitement avec un sujet clair, pas de noms génériques
10. **B** — La priorité d'un ticket se calcule Impact × Urgence (matrice ITIL standard)
11. **A** — HTML5 est le standard actuel du langage de balisage web
12. **B** — CSS = Cascading Style Sheets, gère la mise en forme des pages web
13. **B** — `let` et `const` ont une portée de bloc (block scope), contrairement à `var` qui a une portée de fonction
14. **Ouverte** — Le sélecteur `.classe` cible tous les éléments HTML ayant cette classe
15. **Ouverte** — `display: flex` avec `justify-content: center; align-items: center;` centre un conteneur
16. **A** — `git clone <url>` télécharge un dépôt distant vers ton ordinateur
17. **B** — `git status` affiche les fichiers modifiés et non suivis
18. **B** — Un commit est une sauvegarde d'un instantané du projet avec un message décrivant le changement
19. **B** — Le workflow standard est : branche de travail → commit → fusion (merge) sur la branche principale
20. **A** — `.gitignore` exclut des fichiers du suivi Git (node_modules, .env, fichiers de build)
21. **A** — `ssh user@machine` se connecte à une machine distante via le protocole sécurisé SSH
22. **B** — `sudo` exécute une commande avec les droits d'un autre utilisateur (par défaut root) de façon temporaire
23. **B** — `ls -la` affiche tous les fichiers avec leurs détails (droits, propriétaire, taille, date)
24. **A** — `chmod 755 fichier` donne au propriétaire lecture/écriture/exécution (rwx), au groupe et aux autres lecture/exécution (r-x)
25. **B** — `systemctl status <service>` vérifie si un service Linux est actif
26. **B** — `journalctl -u <service>` lit les journaux d'un service spécifique
27. **B** — `ip addr` ou `ifconfig` affiche les interfaces et leurs adresses IP
28. **A** — SSH (Secure Shell) permet la connexion à distance sécurisée et chiffrée
29. **B** — `grep "motif" fichier` filtre et affiche les lignes contenant le motif recherché
30. **Ouverte** — Un pipe `commande1 | commande2` envoie la sortie standard de commande1 comme entrée standard de commande2
31. **B** — `print()` affiche du texte en Python ; `type()` retourne le type d'une variable
32. **B** — `if` / `elif` / `else` structure les décisions conditionnelles en Python
33. **B** — `for element in liste` parcourt chaque élément d'une collection
34. **B** — `def nom_fonction(parametres):` définit une fonction en Python
35. **B** — `try:` / `except:` intercepte et gère les erreurs sans faire planter le programme
36. **B** — `SELECT colonnes FROM table WHERE condition` est la requête SQL de base pour lire des données
37. **B** — `INSERT INTO table (colonnes) VALUES (valeurs)` ajoute une nouvelle ligne
38. **B** — `UPDATE table SET colonne = valeur WHERE condition` modifie des lignes existantes
39. **B** — `DELETE FROM table WHERE condition` supprime des lignes
40. **B** — `JOIN` combine des lignes de deux tables basées sur une colonne commune
41. **B** — `GROUP BY` regroupe les lignes pour faire des agrégations (COUNT, SUM, AVG)
42. **B** — `HAVING` filtre les résultats après un GROUP BY, contrairement à WHERE qui filtre avant
43. **Ouverte** — Une clé étrangère (FOREIGN KEY) est une colonne qui fait référence à la clé primaire d'une autre table, assurant l'intégrité référentielle
44. **Ouverte** — `ERD` = Entity Relationship Diagram, schéma visuel montrant les tables et leurs relations
45. **B** — `1NF` (1ère forme normale) = colonnes atomiques, sans valeurs répétées dans une cellule
46. **B** — `ACID` = Atomicity, Consistency, Isolation, Durability, les 4 propriétés garantissant la fiabilité des transactions
47. **B** — `COMMIT` sauvegarde les modifications de la transaction ; `ROLLBACK` les annule
48. **B** — Un index dans une base de données accélère les requêtes de lecture au prix d'un léger ralentissement en écriture
49. **Ouverte** — `WHERE id IN (SELECT id FROM autres_table WHERE condition)` est une sous-requête SQL
50. **B** — TCP est un protocole fiable avec connexion (handshake 3 volets) ; UDP est rapide sans connexion
51. **B** — DNS = Domain Name System, traduit les noms de domaine en adresses IP
52. **B** — DHCP = Dynamic Host Configuration Protocol, attribue automatiquement des adresses IP sur un réseau
53. **Ouverte** — `ping` teste la connectivité réseau avec envoi de paquets ICMP ; `traceroute` montre le chemin réseau
54. **B** — SSH = Secure Shell pour connexion distante sécurisée ; SCP = Secure Copy pour transfert de fichiers chiffré
55. **B** — Un pare-feu filtre le trafic réseau selon des règles autorisées (ACCEPT) ou bloquées (DROP)
56. **B** — NAT = Network Address Translation traduit les adresses IP privées en adresse publique
57. **B** — Un VPN crée un tunnel chiffré à travers un réseau public pour un accès sécurisé aux ressources internes
58. **B** — `ip a` affiche les adresses IP des interfaces réseau Linux ; `ss -tlnp` montre les ports TCP en écoute
59. **Ouverte** — `#!/bin/bash` est le shebang qui indique au système quel interpréteur utiliser pour exécuter le script
60. **Ouverte** — `$?` retourne le code de sortie de la dernière commande (0 = succès, autre = erreur)
61. **B** — `grep "motif" fichier` filtre les lignes contenant le motif ; `sed 's/ancien/nouveau/g'` remplace du texte
62. **Ouverte** — `cron` est le planificateur de tâches Unix ; `crontab -e` édite le fichier de planification
63. **B** — `set -e` arrête le script à la première erreur ; `set -euo pipefail` active toutes les protections strictes
64. **B** — `import os` permet d'accéder aux fonctions du système d'exploitation en Python
65. **Ouverte** — `venv` (virtual environment) crée un environnement Python isolé par projet pour éviter les conflits de dépendances
66. **B** — `pip install nom_du_paquet` installe un paquet Python depuis le catalogue PyPI
67. **B** — `__init__.py` rend un dossier Python importable comme package
68. **Ouverte** — Les décorateurs (`@decorator`) modifient ou étendent le comportement d'une fonction sans la modifier directement
69. **B** — `lambda x: expression` crée une fonction anonyme d'une ligne
70. **B** — `with open('fichier') as f:` garantit la fermeture automatique du fichier même si une erreur survient
71. **B** — `1` est vrai (true) en Bash tandis qu'en Python `True` est le booléen vrai
72. **Ouverte** — Les expressions régulières (regex) permettent de rechercher des motifs complexes dans du texte
73. **B** — `wc -l` compte le nombre de lignes ; `wc -w` compte les mots ; `wc -c` compte les caractères
74. **B** — `head fichier` affiche les 10 premières lignes ; `tail fichier` affiche les 10 dernières lignes
75. **B** — `diff fichier1 fichier2` compare deux fichiers ligne par ligne
76. **Ouverte** — `find /chemin -name "*.log"` trouve récursivement tous les fichiers dont le nom correspond au motif
77. **Ouverte** — En Python, une liste est ordonnée et modifiable, un dictionnaire stocke des paires clé/valeur, un tuple est ordonné mais immuable
78. **Ouverte** — La complexité algorithmique Big-O décrit comment le coût d'un algorithme croît avec la taille des données

