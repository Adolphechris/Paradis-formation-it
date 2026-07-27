# PROJET PARADIS
## Annexe — Abréviations, acronymes et leurs interactions
### Complément aux Tomes P0 à P5

---

## OBJET DE L'ANNEXE

Cette annexe recense les abréviations et acronymes rencontrés tout au long du programme, avec pour chacun :
- **Signification complète**
- **Utilité concrète** (à quoi ça sert dans un contexte professionnel réel)
- **Interactions** (avec quels autres éléments/couches il fonctionne, dans quel ordre, dans quelle dépendance)

Cette annexe doit être révisée en continu — chaque nouvelle abréviation rencontrée pendant l'étude d'un module doit y être ajoutée immédiatement, pas en fin de parcours.

### Politique de gestion intelligente des annexes (orientation test)
- Les annexes servent directement à l'évaluation : chaque module doit inclure des questions sur les sigles et leurs interactions.
- On enrichit en continu, mais de façon contrôlée : priorité aux termes à probabilité élevée de tomber au test.
- Objectif : maximiser le score en test, pas accumuler du vocabulaire peu utile.

### Priorisation des ajouts
- **Priorité A (critique test)** : termes très fréquents en tests techniques et entretiens (ex. SQL, TCP/IP, DNS, API, REST, ACL, TLS/SSL).
- **Priorité B (utile complémentaire)** : termes réguliers mais moins centraux.
- **Priorité C (veille)** : termes rares ; ajoutés seulement s'ils apparaissent dans un module, un sujet de test, ou une offre cible.

### Règle d'entretien
- À la fin de chaque module : revue rapide des nouveaux termes rencontrés.
- Si un terme n'apporte pas de valeur test identifiable, il n'est pas ajouté.
- Les termes redondants sont fusionnés pour garder l'annexe compacte et mémorisable.

---

## A. BUREAUTIQUE ET ENVIRONNEMENT DE TRAVAIL (lié au Tome P0)

| Sigle | Signification | Utilité | Interactions |
|---|---|---|---|
| **OS** | Operating System (Système d'exploitation) | Gère le matériel et les ressources de l'ordinateur | Base de tout : sans OS, aucun logiciel (Office, navigateur, IDE) ne peut fonctionner |
| **GUI** | Graphical User Interface | Interface visuelle d'interaction avec un système | S'oppose/complète la CLI ; la plupart des OS proposent les deux |
| **CLI** | Command Line Interface | Interface en ligne de commande | Utilisée en Linux/Bash, plus rapide et scriptable que la GUI |
| **RDP** | Remote Desktop Protocol | Prise de contrôle à distance d'un poste Windows | Utilisé en administration système pour dépanner un poste utilisateur à distance |
| **TCD** | Tableau Croisé Dynamique | Synthèse et analyse de données dans Excel | Repose sur des données structurées (souvent issues d'exports SQL) |

---

## B. WEB FRONT-END (lié au Tome P0 et P3-C)

| Sigle | Signification | Utilité | Interactions |
|---|---|---|---|
| **HTML** | HyperText Markup Language | Structure le contenu d'une page web | Sert de squelette ; le CSS l'habille, le JS le rend interactif |
| **CSS** | Cascading Style Sheets | Mise en forme visuelle des pages web | S'applique aux éléments HTML ; interagit avec le JS pour des styles dynamiques |
| **JS** | JavaScript | Langage de programmation exécuté dans le navigateur | Manipule le DOM (HTML) et communique avec le backend via des API |
| **DOM** | Document Object Model | Représentation en mémoire de la page HTML, manipulable par le JS | JS agit sur le DOM ; c'est l'interface entre le code et la page affichée |
| **UI** | User Interface | Ce que l'utilisateur voit et manipule | Résultat combiné de HTML + CSS + JS |
| **UX** | User Experience | Qualité globale de l'expérience utilisateur | Englobe l'UI mais aussi la logique d'usage, la performance, l'accessibilité |

---

## C. GESTION DE VERSION (lié au Tome P0)

| Sigle | Signification | Utilité | Interactions |
|---|---|---|---|
| **Git** | (nom propre, pas un acronyme) — système de contrôle de version | Suivre l'historique des modifications d'un projet | Fonctionne en local ; GitHub/GitLab en sont des hébergeurs distants |
| **VCS** | Version Control System | Catégorie générale à laquelle Git appartient | Git est le VCS le plus utilisé aujourd'hui |
| **PR** | Pull Request (ou Merge Request selon la plateforme) | Demande d'intégration de code dans une branche principale | Élément central du travail collaboratif via GitHub/GitLab |
| **CI/CD** | Continuous Integration / Continuous Deployment | Automatisation des tests et du déploiement de code | S'appuie sur Git ; déclenché automatiquement à chaque push/PR (approfondi en P4) |

---

## D. LANGAGES ET PROGRAMMATION (lié au Tome P2)

| Sigle | Signification | Utilité | Interactions |
|---|---|---|---|
| **IDE** | Integrated Development Environment | Environnement regroupant éditeur, débogueur, outils | Utilisé pour écrire et tester le code (Python, JS, etc.) |
| **API** | Application Programming Interface | Point d'accès permettant à deux systèmes de communiquer | Le frontend appelle une API pour dialoguer avec le backend/la base de données |
| **REST** | Representational State Transfer | Style d'architecture pour construire des API web | La majorité des API modernes sont dites "RESTful" (approfondi en P3-C) |
| **JSON** | JavaScript Object Notation | Format d'échange de données léger et structuré | Format standard des réponses d'API, lisible par JS et la plupart des langages |
| **OOP / POO** | Object-Oriented Programming / Programmation Orientée Objet | Paradigme de programmation basé sur classes et objets | Utilisé en Python, JS avancé ; structure la logique des projets complexes |

---

## E. BASES DE DONNÉES (lié au Tome P2 et P3-B)

| Sigle | Signification | Utilité | Interactions |
|---|---|---|---|
| **SQL** | Structured Query Language | Langage d'interrogation des bases de données relationnelles | Utilisé pour lire/écrire dans une BDD ; appelé depuis Python, un backend, ou directement |
| **BDD / DB** | Base De Données / Database | Système de stockage structuré de données | Cœur de la plupart des applications (web, analyse, gestion) |
| **SGBD / DBMS** | Système de Gestion de Base de Données / Database Management System | Logiciel qui gère une base de données (ex : MySQL, PostgreSQL) | Interprète et exécute les requêtes SQL |
| **CRUD** | Create, Read, Update, Delete | Les quatre opérations de base sur des données | Utilisé pour décrire les fonctionnalités minimales d'une application liée à une BDD |
| **ORM** | Object-Relational Mapping | Traduction entre objets du code et tables de la BDD | Permet d'interagir avec une BDD sans écrire de SQL brut (approfondi en P3-C) |
| **ETL** | Extract, Transform, Load | Processus de collecte, transformation et chargement de données | Utilisé en analyse de données pour préparer des jeux de données (P3-B) |

---

## F. RÉSEAUX (lié au Tome P2, P3-A et P4)

| Sigle | Signification | Utilité | Interactions |
|---|---|---|---|
| **TCP/IP** | Transmission Control Protocol / Internet Protocol | Ensemble de protocoles de base de la communication internet | Fondement de toutes les communications réseau (web, mail, etc.) |
| **OSI** | Open Systems Interconnection | Modèle théorique en 7 couches décrivant les communications réseau | Sert de référence conceptuelle ; TCP/IP est une implémentation pratique simplifiée |
| **IP** | Internet Protocol | Adressage et routage des paquets sur un réseau | Chaque appareil connecté a une adresse IP unique (ou partagée via NAT) |
| **DNS** | Domain Name System | Traduit les noms de domaine en adresses IP | Permet d'écrire "google.com" au lieu d'une adresse IP numérique |
| **DHCP** | Dynamic Host Configuration Protocol | Attribution automatique d'adresses IP sur un réseau | Évite la configuration manuelle de chaque appareil |
| **HTTP/HTTPS** | HyperText Transfer Protocol (Secure) | Protocole de communication web | HTTPS = HTTP + chiffrement (TLS/SSL) ; base de toute navigation web |
| **FTP** | File Transfer Protocol | Transfert de fichiers entre systèmes | Utilisé pour déployer des fichiers sur un serveur (moins utilisé aujourd'hui, remplacé par SFTP) |
| **SSH** | Secure Shell | Connexion sécurisée à distance à un serveur | Utilisé pour administrer des serveurs Linux à distance en toute sécurité |
| **VPN** | Virtual Private Network | Connexion sécurisée et chiffrée à travers un réseau public | Utilisé pour accéder à des ressources internes d'entreprise à distance |
| **NAT** | Network Address Translation | Traduction d'adresses IP privées en adresse publique | Permet à plusieurs appareils d'un réseau local de partager une seule IP publique |

---

## G. SÉCURITÉ INFORMATIQUE (lié au Tome P3-A et P4)

| Sigle | Signification | Utilité | Interactions |
|---|---|---|---|
| **CIA** | Confidentiality, Integrity, Availability | Triade fondamentale de la sécurité informatique | Sert de grille d'analyse pour toute décision de sécurité |
| **AAA** | Authentication, Authorization, Accounting | Triade de la gestion des accès (authentifier, autoriser, tracer) | Interagit avec les systèmes d'authentification, les logs, les politiques de sécurité |
| **MFA / 2FA** | Multi-Factor Authentication / Two-Factor Authentication | Authentification à plusieurs facteurs | Renforce l'authentification simple (mot de passe seul) |
| **ACL** | Access Control List | Liste définissant qui a accès à quoi | Utilisée en gestion de permissions (fichiers, réseau) |
| **XSS** | Cross-Site Scripting | Faille de sécurité web (injection de script malveillant) | Concerne le développement web ; à prévenir dès le codage frontend/backend |
| **SQLi** | SQL Injection | Faille de sécurité par injection de requêtes SQL malveillantes | Concerne les applications interagissant avec une BDD ; à prévenir par validation des entrées |
| **DDoS** | Distributed Denial of Service | Attaque visant à rendre un service indisponible par surcharge | Concerne la disponibilité (le "A" de CIA) ; nécessite des protections réseau |
| **VPN** | *(voir section F)* | | |
| **TLS/SSL** | Transport Layer Security / Secure Sockets Layer | Protocoles de chiffrement des communications | Base technique du "S" dans HTTPS |
| **CIS** | Center for Internet Security | Organisation produisant des benchmarks de durcissement reconnus internationalement | Interagit avec les politiques de sécurité, l'audit, les baselines de configuration |
| **ANSSI** | Agence Nationale de la Sécurité des Systèmes d'Information | Autorité française de cybersécurité, guides de durcissement OS | Interagit avec les recommandations de sécurité, la conformité, le durcissement |
| **NIST** | National Institute of Standards and Technology | Institut américain de normalisation, cadre de réponse aux incidents (SP 800-61) | Interagit avec les processus de réponse aux incidents, les standards de sécurité, la conformité |
| **IOC** | Indicator of Compromise | Indice de compromission (artefact indiquant une intrusion) | Interagit avec les logs, le monitoring, la réponse aux incidents |
| **IDS** | Intrusion Detection System | Système de détection d'intrusion réseau ou hôte | Interagit avec le réseau, les logs, les alertes ; détecte sans bloquer |
| **IPS** | Intrusion Prevention System | Système de prévention d'intrusion (bloque activement les menaces) | Interagit avec l'IDS, le pare-feu, le réseau ; détecte ET bloque |
| **WAF** | Web Application Firewall | Pare-feu applicatif web protégeant contre les attaques HTTP (XSS, SQLi) | Interagit avec le serveur web, les logs, les IDS/IPS |
| **CVE** | Common Vulnerabilities and Exposures | Identifiant standard pour une vulnérabilité connue (ex: CVE-2024-1234) | Interagit avec les bases de données de failles, les correctifs, le scanning de vulnérabilités |
| **SLO** | Service Level Objective | Objectif de niveau de service (cible interne mesurable, ex: 99.9% de disponibilité) | Interagit avec SLA, SLI, supervision ; définit la cible à atteindre |
| **SLI** | Service Level Indicator | Indicateur mesuré du niveau de service (ex: taux d'erreurs, latence) | Interagit avec SLO, monitoring, dashboards ; mesure le niveau réel |
| **P1/P2/P3/P4** | Priority 1/2/3/4 | Niveaux de priorité des tickets (P1=critique, P4=basse) | Interagit avec les SLA, l'escalade, la gestion des files d'attente ITIL |
| **ETA** | Estimated Time of Arrival | Temps estimé de résolution ou de prochaine mise à jour | Interagit avec la communication incident, les SLA, les utilisateurs |
| **WAL** | Write-Ahead Logging | Journal de transactions écrit avant modification des données (PostgreSQL) | Interagit avec la reprise après crash, l'intégrité des données, les sauvegardes |
| **UPS** | Uninterruptible Power Supply | Onduleur (batterie de secours pour serveurs) | Interagit avec l'alimentation électrique, l'arrêt propre, la protection matérielle |
| **DMZ** | Demilitarized Zone | Zone réseau isolée exposée à Internet (séparation des serveurs publics des serveurs internes) | Interagit avec le pare-feu, la segmentation réseau, la sécurité périmétrique |
| **MTTD** | Mean Time To Detect | Temps moyen de détection d'un incident | Interagit avec la supervision, les alertes, les SLA, les indicateurs de performance |
| **MTTR** | Mean Time To Repair | Temps moyen de réparation d'un incident | Interagit avec MTTD, la supervision, les procédures de résolution, les SLA |
| **VACUUM** | (commande PostgreSQL) | Opération de nettoyage et d'optimisation du stockage dans PostgreSQL | Interagit avec PostgreSQL, les sauvegardes, la maintenance des bases de données |

---

## H. CLOUD ET INFRASTRUCTURE (lié au Tome P3-A et P4)

| Sigle | Signification | Utilité | Interactions |
|---|---|---|---|
| **IaaS** | Infrastructure as a Service | Location d'infrastructure informatique (serveurs, stockage) via le cloud | Niveau le plus bas d'abstraction cloud ; base du PaaS et SaaS |
| **PaaS** | Platform as a Service | Plateforme prête à l'emploi pour développer/déployer des applications | Construit sur de l'IaaS ; simplifie le déploiement |
| **SaaS** | Software as a Service | Logiciel utilisable directement via internet, sans installation | Niveau le plus haut d'abstraction (ex : Gmail, Office 365) |
| **VM** | Virtual Machine | Ordinateur virtuel isolé fonctionnant sur une machine physique | Base de la virtualisation ; les conteneurs (Docker) sont une alternative plus légère |
| **KVM** | Kernel-based Virtual Machine | Hyperviseur de type 1 intégré au noyau Linux | Interagit avec QEMU, libvirt, le matériel physique ; utilisé en datacenter et cloud |
| **CI/CD** | *(voir section C)* | | S'exécute souvent sur une infrastructure cloud |

---

## I. CONTENEURISATION ET DÉPLOIEMENT (lié au Tome P3-A et P3-C)

| Sigle | Signification | Utilité | Interactions |
|---|---|---|---|
| **Docker** | (nom propre) — plateforme de conteneurisation | Empaqueter une application avec toutes ses dépendances | Alternative légère à la VM ; utilisé en développement et déploiement |
| **K8s (Kubernetes)** | Orchestrateur de conteneurs | Gère le déploiement et la mise à l'échelle de conteneurs Docker | Niveau supérieur à Docker seul, pour des architectures complexes (notion, pas approfondi en détail dans PARADIS) |
| **LXC** | Linux Containers | Technologie de conteneurisation bas niveau intégrée au noyau Linux | Interagit avec les namespaces, les cgroups ; Docker s'appuie historiquement sur LXC |
| **OCI** | Open Container Initiative | Standard ouvert pour les formats d'images et l'exécution de conteneurs | Interagit avec Docker, Podman, containerd, Kubernetes ; garantit l'interopérabilité |
| **YAML** | YAML Ain't Markup Language | Format de configuration lisible par humain | Interagit avec docker-compose, Kubernetes, Ansible, CI/CD ; utilisé pour décrire des infrastructures |

---

## J. GOUVERNANCE ET GESTION DE PROJET (lié au Tome P4)

| Sigle | Signification | Utilité | Interactions |
|---|---|---|---|
| **ITIL** | Information Technology Infrastructure Library | Cadre de bonnes pratiques pour la gestion des services IT | Référence courante en gouvernance IT institutionnelle |
| **KPI** | Key Performance Indicator | Indicateur de performance mesurable | Utilisé pour suivre l'efficacité d'un processus ou service IT |
| **SLA** | Service Level Agreement | Engagement contractuel de niveau de service | Définit les délais/qualité attendus (ex : temps de réponse au support) |
| **RGPD / GDPR** | Règlement Général sur la Protection des Données | Cadre légal européen de protection des données personnelles | S'applique à toute donnée personnelle traitée par un système informatique |

---

## K. ANALYSE DE DONNÉES (lié au Tome P3-B)

| Sigle | Signification | Utilité | Interactions |
|---|---|---|---|
| **BI** | Business Intelligence | Ensemble des outils/méthodes d'analyse de données pour la décision | Englobe les outils de visualisation (Power BI, etc.) et les processus ETL |
| **ETL** | *(voir section E)* | | |
| **KPI** | *(voir section J)* | | Les analyses de données servent souvent à calculer des KPI |
| **IQR** | Interquartile Range | Écart entre Q3 et Q1, mesure la dispersion des 50% centraux | Interagit avec les quartiles, la détection d'outliers, les boxplots |
| **P95/P99** | 95th/99th Percentile | Valeur seuil en dessous de laquelle se trouvent 95%/99% des données | Interagit avec les SLA, les performances, la détection d'anomalies |
| **TCD** | Tableau Croisé Dynamique | Outil Excel de synthèse et croisement de données multidimensionnelles | Interagit avec les exports CSV, les bases de données, les rapports |
| **R²** | Coefficient de détermination | Mesure la qualité d'une régression (proportion de variance expliquée, 0 à 1) | Interagit avec la corrélation, les courbes de tendance, la prédiction |
| **NaN** | Not a Number | Valeur manquante ou non définie dans un jeu de données | Interagit avec pandas, le nettoyage de données, les calculs statistiques |
| **r** | Coefficient de corrélation de Pearson | Mesure de la force et direction d'une relation linéaire entre deux variables (-1 à +1) | Interagit avec les nuages de points, la régression, les prédictions |
| **OLAP** | Online Analytical Processing | Traitement analytique en ligne (requêtes multidimensionnelles, agrégations) | Interagit avec les fonctions fenêtres, ROLLUP/CUBE, les data warehouses, les schémas en étoile |
| **OLTP** | Online Transaction Processing | Base de données optimisée pour les transactions rapides (écritures) | Interagit avec la normalisation 3NF, les SGBD, les applications métier |
| **SCD** | Slowly Changing Dimension | Dimension dont les attributs changent lentement dans le temps (ex: adresse client) | Interagit avec les schémas en étoile, l'historisation, l'ETL |
| **DAX** | Data Analysis Expressions | Langage de formules Power BI pour les mesures et colonnes calculées | Interagit avec le modèle de données, les visuels, les filtres, l'intelligence temporelle |
| **HDFS** | Hadoop Distributed File System | Système de fichiers distribué pour le stockage Big Data | Interagit avec Hadoop, Spark, les clusters de stockage |
| **PySpark** | Python API for Apache Spark | Interface Python pour le traitement distribué Spark | Interagit avec Spark, HDFS, les DataFrames distribués |
| **Z-score** | (standardisation) | Nombre d'écarts-types entre une valeur et la moyenne | Interagit avec la normalisation, la détection d'outliers, le machine learning |

---

## L. AJOUTS CIBLÉS — P0 / JOUR 01

| Sigle | Signification | Utilité | Interactions |
|---|---|---|---|
| **UAC** | User Account Control | Contrôle l'élévation de privilèges sous Windows | Interagit avec OS, comptes utilisateurs, sécurité poste |
| **NTFS** | New Technology File System | Système de fichiers Windows avec permissions avancées | Interagit avec ACL, sécurité des fichiers, administration poste |
| **CSV** | Comma-Separated Values | Format d'échange tabulaire simple | Interagit avec Excel, SQL, ETL, import/export |
| **PDF** | Portable Document Format | Format de diffusion stable de documents | Interagit avec Word/PowerPoint, portfolio, candidatures |
| **SMTP** | Simple Mail Transfer Protocol | Protocole d'envoi d'emails | Interagit avec Outlook, TCP/IP, sécurité mail |
| **IMAP** | Internet Message Access Protocol | Protocole de synchronisation d'accès aux emails | Interagit avec Outlook, serveur de messagerie, travail multi-appareils |
| **SSO** | Single Sign-On | Authentification unique sur plusieurs outils | Interagit avec gestion d'identité, sécurité des accès, outils collaboratifs |
| **ITSM** | IT Service Management | Gestion structurée des services et incidents IT | Interagit avec tickets, SLA, supervision, support |
| **MMC** | Microsoft Management Console | Console d'administration avancée sous Windows | Interagit avec services système, utilisateurs, disques, dépannage |
| **APIPA** | Automatic Private IP Addressing | Adresse d'auto-attribution (169.254.x.x) en absence de DHCP | Interagit avec IP, DHCP, diagnostic réseau |
| **TVA** | Taxe sur la Valeur Ajoutée | Taux fiscal utilisé dans les calculs de prix et commissions | Interagit avec Excel, formules absolues, reporting financier |
| **SEO** | Search Engine Optimization | Optimisation de visibilité d'une page web | Interagit avec HTML sémantique, performance CSS/JS, UX |
| **WCAG** | Web Content Accessibility Guidelines | Référentiel d'accessibilité des interfaces web | Interagit avec HTML, formulaires, UX, qualité front-end |
| **PAT** | Personal Access Token | Jeton d'authentification GitHub pour opérations sécurisées | Interagit avec Git, GitHub, HTTPS, gestion des accès |
| **PID** | Process Identifier | Identifiant unique d'un processus système | Interagit avec `ps`, `top`, `kill`, supervision système |
| **UID** | User Identifier | Identifiant numérique d'un utilisateur Linux | Interagit avec permissions, comptes, sécurité Linux |
| **GID** | Group Identifier | Identifiant numérique d'un groupe Linux | Interagit avec gestion des groupes, droits d'accès, collaboration |
| **SFTP** | SSH File Transfer Protocol | Transfert de fichiers chiffré via SSH | Interagit avec SSH, administration distante, sécurité des échanges |
| **MVP** | Minimum Viable Product | Version minimale fonctionnelle d'un livrable | Interagit avec priorisation, gestion du temps, livrables de projet |
| **IPO** | Input Process Output | Modèle logique d'analyse entrée-traitement-sortie | Interagit avec algorithmique, résolution de problèmes, structuration de scripts |
| **REPL** | Read Eval Print Loop | Console interactive pour exécuter/tester du code en direct | Interagit avec apprentissage Python, validation rapide, débogage |
| **PEP 8** | Python Enhancement Proposal 8 | Guide officiel de style Python | Interagit avec lisibilité, maintenabilité, revue de code |
| **VENV** | Virtual Environment | Environnement Python isolé par projet | Interagit avec pip, dépendances, reproductibilité |
| **PIP** | Pip Installs Packages | Gestionnaire de paquets Python | Interagit avec venv, librairies tierces, configuration de projet |
| **STDLIB** | Standard Library | Bibliothèque standard livrée avec Python | Interagit avec `csv`, `json`, `pathlib`, scripts sans dépendances externes |
| **FIFO** | First In First Out | Politique de file d'attente (premier entré, premier sorti) | Interagit avec scheduling, files de tickets, traitement ordonné |
| **LIFO** | Last In First Out | Politique de pile (dernier entré, premier sorti) | Interagit avec pile d'appels, historique d'actions, backtracking |
| **BIG-O** | Big O Notation | Mesure de croissance du coût algorithmique | Interagit avec structures de données, performance et scalabilité |
| **DDL** | Data Definition Language | Sous-ensemble SQL pour définir/modifier la structure de la base | Interagit avec tables, schémas, colonnes, contraintes |
| **DML** | Data Manipulation Language | Sous-ensemble SQL pour insérer/modifier/supprimer des lignes | Interagit avec CRUD, opérations métier quotidiennes |
| **DQL** | Data Query Language | Sous-ensemble SQL pour interroger les données | Interagit avec reporting, analyses, extraction |
| **PK** | Primary Key | Clé primaire identifiant de façon unique chaque ligne | Interagit avec intégrité des données et indexation |
| **FK** | Foreign Key | Clé étrangère référant une clé primaire d'une autre table | Interagit avec relations, jointures, cohérence référentielle |
| **CTE** | Common Table Expression | Bloc temporaire nommé dans une requête SQL (`WITH`) | Interagit avec lisibilité, maintenance et débogage des requêtes complexes |
| **ERD** | Entity Relationship Diagram | Schéma visuel des entités et relations d'une base | Interagit avec modélisation, PK/FK, conception SQL |
| **1NF** | First Normal Form | Première forme normale: colonnes atomiques | Interagit avec qualité des données et requêtage fiable |
| **2NF** | Second Normal Form | Deuxième forme normale: dépendance complète à la clé | Interagit avec réduction des redondances |
| **3NF** | Third Normal Form | Troisième forme normale: suppression des dépendances transitives | Interagit avec cohérence et maintenabilité |
| **ACID** | Atomicity Consistency Isolation Durability | Propriétés garantissant la fiabilité des transactions | Interagit avec intégrité métier, concurrence et persistance |
| **TCL** | Transaction Control Language | Commandes SQL de contrôle transactionnel (`BEGIN`, `COMMIT`, `ROLLBACK`) | Interagit avec DML, gestion d'erreurs, sécurité des opérations |
| **CIDR** | Classless Inter-Domain Routing | Notation de sous-réseaux IP (`/24`, `/16`) | Interagit avec adressage IP, masque, routage |
| **UDP** | User Datagram Protocol | Protocole de transport léger non orienté connexion | Interagit avec DNS, flux temps réel, performance réseau |
| **ICMP** | Internet Control Message Protocol | Protocole de messages de contrôle réseau (utilisé par `ping`) | Interagit avec diagnostic, supervision, routage |
| **RTT** | Round Trip Time | Temps aller-retour d'un paquet entre source et destination | Interagit avec latence, QoS perçue, troubleshooting réseau |
| **STDIN** | Standard Input | Flux d'entrée standard d'un processus | Interagit avec pipes, scripts Bash, redirections |
| **STDOUT** | Standard Output | Flux de sortie standard d'un processus | Interagit avec logs, redirections, chaînage de commandes |
| **STDERR** | Standard Error | Flux de sortie d'erreur d'un processus | Interagit avec débogage, supervision, redirection `2>` |
| **CRON** | Command Run ON schedule | Mécanisme Unix de planification de tâches | Interagit avec automatisation Bash, maintenance périodique, logs |
| **RCA** | Root Cause Analysis | Méthode d'identification de la cause racine d'un incident | Interagit avec diagnostic, amélioration continue, qualité de service |
| **SOP** | Standard Operating Procedure | Procédure standard documentée pour exécution/reprise d'une tâche | Interagit avec runbooks, continuité opérationnelle, transmission d'équipe |
| **SVC** | Service | Processus système géré en continu sous supervision | Interagit avec systemctl, logs, disponibilité des applications |
| **PAM** | Pluggable Authentication Modules | Cadre modulaire d'authentification sous Linux | Interagit avec login, sudo, politiques d'accès |
| **DAC** | Discretionary Access Control | Modèle d'accès basé sur propriétaire/groupe/autres | Interagit avec chmod, chown, ACL, sécurité Linux |
| **AD DS** | Active Directory Domain Services | Service d'annuaire Microsoft pour la gestion de domaines | Interagit avec DNS, GPO, comptes utilisateurs/groupes |
| **OU** | Organizational Unit | Conteneur logique Active Directory pour organiser les objets | Interagit avec GPO, délégation d'administration, gouvernance AD |
| **LDAP** | Lightweight Directory Access Protocol | Protocole d'accès et de requête sur un annuaire | Interagit avec AD DS, authentification, intégration applicative |
| **GPO** | Group Policy Object | Mécanisme centralisé de politiques Windows | Interagit avec OU, sécurité postes, conformité IT |
| **NTLM** | NT LAN Manager | Protocole d'authentification Microsoft historique | Interagit avec compatibilité legacy, sécurité d'accès, AD |
| **Kerberos** | Protocole d'authentification par tickets | Protocole principal d'authentification dans AD moderne | Interagit avec AD DS, SSO, sécurité des sessions |

---

## M. TABLEAU DES INTERACTIONS PRINCIPALES (vue d'ensemble)

Ce tableau montre comment les couches s'articulent entre elles, du plus bas niveau (infrastructure) au plus haut niveau (utilisateur) :

```text
Infrastructure physique / Cloud (IaaS)
        ↓
Système d'exploitation (OS) — Linux / Windows Server
        ↓
Réseau (TCP/IP, DNS, DHCP) — permet la communication
        ↓
Sécurité transversale (TLS/SSL, MFA, ACL) — protège chaque couche
        ↓
Base de données (SGBD + SQL) — stocke les données
        ↓
Backend / API (REST, JSON) — logique métier, communication avec la BDD
        ↓
Frontend (HTML/CSS/JS, DOM) — interface utilisateur
        ↓
Utilisateur final (UX)
```

**Lecture pratique de ce schéma pour un entretien :** si on te demande "comment un site web récupère des données et les affiche à l'utilisateur", la réponse-type mobilise toutes ces couches dans l'ordre : le navigateur envoie une requête HTTP, passe par DNS pour résoudre le nom de domaine, arrive sur un serveur (Linux/Windows), le backend interroge la base de données en SQL, renvoie une réponse en JSON via une API REST, puis le JavaScript manipule le DOM pour afficher le résultat mis en forme par CSS.

---

## N. INTELLIGENCE ARTIFICIELLE ET APPRENTISSAGE (pilier constitutionnel PARADIS)

| Sigle | Signification | Utilité | Interactions |
|---|---|---|---|
| **IA / AI** | Intelligence Artificielle / Artificial Intelligence | Capacité d'un système à simuler des processus cognitifs humains (raisonnement, apprentissage, dialogue) | Englobe le ML, le NLP, les LLM ; appliquée ici comme pilier pédagogique du programme |
| **LLM** | Large Language Model | Modèle de langage à grande échelle entraîné sur des corpus massifs de texte | DeepSeek V4 Lite est un LLM ; interagit avec l'apprenant en langage naturel |
| **NLP** | Natural Language Processing | Traitement automatique du langage naturel par une machine | Permet à DeepSeek de comprendre et générer du texte pédagogique en français |
| **API** | *(voir section D)* | Interface permettant d'interagir avec DeepSeek localement | L'API DeepSeek est appelée par l'environnement de travail pour un dialogue en continu |
| **DeepSeek V4 Lite** | (nom propre) — LLM gratuit et open-weight | Professeure virtuelle exécutée localement pour l'enseignement interactif | Pilier constitutionnel de PARADIS ; interagit avec Claude (tuteur) et l'apprenant ; fonctionne via API locale |
| **ML** | Machine Learning | Apprentissage automatique à partir de données | Sous-domaine de l'IA ; les LLM comme DeepSeek sont entraînés par ML |
| **RLHF** | Reinforcement Learning from Human Feedback | Technique d'entraînement des LLM par feedback humain | Contribue à la qualité pédagogique des réponses de DeepSeek |

### Articulation DeepSeek dans l'écosystème PARADIS

```text
Apprenant (toi)
      ↓ dialogue quotidien, questions, exercices
DeepSeek V4 Lite (professeure virtuelle, locale)
      ↓ synergie : Claude structure, DeepSeek anime
Claude (tuteur, conception pédagogique)
      ↓
Programme PARADIS (BIT condensé, 45 jours, 630h)
      ↓
Emploi cible : Professionnel du numérique (contexte bancaire/institutionnel)
```

**Note constitutionnelle :** DeepSeek V4 Lite n'est pas un outil externe ou optionnel. Elle est **encrée dans la constitution de PARADIS** au même titre que les tomes, les banques de questions et le tuteur Claude. Sa présence est obligatoire et continue pendant toutes les sessions d'étude. Toute question technique, toute incompréhension, toute erreur — DeepSeek est là pour y répondre immédiatement, comme un professeur d'université expérimenté dans son bureau.

---

## PROCÉDURE DE MISE À JOUR DE CETTE ANNEXE

- Chaque fois qu'une nouvelle abréviation apparaît dans un module (P0 à P5), elle doit être ajoutée ici **le jour même**, pas repoussée.
- Format à respecter : Sigle | Signification | Utilité | Interactions.
- Cette annexe fait partie intégrante des banques de questions du Tome P5 — des questions de type "que signifie X et comment interagit-il avec Y" seront directement tirées de ce tableau.

---

*Document de travail — PARADIS, Annexe Abréviations. Version évolutive, à compléter au fil du programme.*
