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
| **MFA / 2FA** | Multi-Factor Authentication / Two-Factor Authentication | Authentification à plusieurs facteurs | Renforce l'authentification simple (mot de passe seul) |
| **ACL** | Access Control List | Liste définissant qui a accès à quoi | Utilisée en gestion de permissions (fichiers, réseau) |
| **XSS** | Cross-Site Scripting | Faille de sécurité web (injection de script malveillant) | Concerne le développement web ; à prévenir dès le codage frontend/backend |
| **SQLi** | SQL Injection | Faille de sécurité par injection de requêtes SQL malveillantes | Concerne les applications interagissant avec une BDD ; à prévenir par validation des entrées |
| **DDoS** | Distributed Denial of Service | Attaque visant à rendre un service indisponible par surcharge | Concerne la disponibilité (le "A" de CIA) ; nécessite des protections réseau |
| **VPN** | *(voir section F)* | | |
| **TLS/SSL** | Transport Layer Security / Secure Sockets Layer | Protocoles de chiffrement des communications | Base technique du "S" dans HTTPS |

---

## H. CLOUD ET INFRASTRUCTURE (lié au Tome P3-A et P4)

| Sigle | Signification | Utilité | Interactions |
|---|---|---|---|
| **IaaS** | Infrastructure as a Service | Location d'infrastructure informatique (serveurs, stockage) via le cloud | Niveau le plus bas d'abstraction cloud ; base du PaaS et SaaS |
| **PaaS** | Platform as a Service | Plateforme prête à l'emploi pour développer/déployer des applications | Construit sur de l'IaaS ; simplifie le déploiement |
| **SaaS** | Software as a Service | Logiciel utilisable directement via internet, sans installation | Niveau le plus haut d'abstraction (ex : Gmail, Office 365) |
| **VM** | Virtual Machine | Ordinateur virtuel isolé fonctionnant sur une machine physique | Base de la virtualisation ; les conteneurs (Docker) sont une alternative plus légère |
| **CI/CD** | *(voir section C)* | | S'exécute souvent sur une infrastructure cloud |

---

## I. CONTENEURISATION ET DÉPLOIEMENT (lié au Tome P3-A et P3-C)

| Sigle | Signification | Utilité | Interactions |
|---|---|---|---|
| **Docker** | (nom propre) — plateforme de conteneurisation | Empaqueter une application avec toutes ses dépendances | Alternative légère à la VM ; utilisé en développement et déploiement |
| **K8s (Kubernetes)** | Orchestrateur de conteneurs | Gère le déploiement et la mise à l'échelle de conteneurs Docker | Niveau supérieur à Docker seul, pour des architectures complexes (notion, pas approfondi en détail dans PARADIS) |

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

---

## L. TABLEAU DES INTERACTIONS PRINCIPALES (vue d'ensemble)

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

## PROCÉDURE DE MISE À JOUR DE CETTE ANNEXE

- Chaque fois qu'une nouvelle abréviation apparaît dans un module (P0 à P5), elle doit être ajoutée ici **le jour même**, pas repoussée.
- Format à respecter : Sigle | Signification | Utilité | Interactions.
- Cette annexe fait partie intégrante des banques de questions du Tome P5 — des questions de type "que signifie X et comment interagit-il avec Y" seront directement tirées de ce tableau.

---

*Document de travail — PARADIS, Annexe Abréviations. Version évolutive, à compléter au fil du programme.*
