# TOME P4 — Cloud, DevOps & SecOps — Jour 200 (6h) : Grand Examen du Semestre 4 (Évaluation Globale des Compétences Data, DevOps, Cloud & SecOps)

> [!NOTE]
> **Objectif du jour :** Valider l'ensemble des connaissances et compétences acquises au cours du **Semestre 4 (Jours 151 à 199)** à travers un **Grand Examen Synthétique de 50 Questions et Cas Pratiques d'Architecture**. Cet examen couvre les 4 piliers du semestre : Data & SGBDR, Web Frontend/Backend & APIs, Cloud & DevOps/GitOps, et SecOps & SRE.
>
> **Compétences évaluées :** Synthèse globale `BIT-01` à `BIT-07`, `OPS-04` à `OPS-06`, `SEC-04` à `SEC-07`, `GOV-03` à `GOV-04`.

---

## 1) Section 1 — Data, SGBDR & Big Data Engineering (Questions 1 à 12)

**Q1 :** Dans PostgreSQL, quel mécanisme garantit que les lectures ne bloquent pas les écritures et inversement, en permettant à chaque transaction de voir un snapshot cohérent des données ?
- A) MVCC (Multi-Version Concurrency Control)
- B) Table Locks exclusifs
- C) Single-Threaded Event Loop
- D) Automatic Sharding

**Réponse : A**

**Q2 :** Quel type d'index PostgreSQL est spécifiquement optimisé pour l'indexation de colonnes contenant des tableaux ou des documents JSONB ?
- A) GIN (Generalized Inverted Index)
- B) B-Tree
- C) Hash Index
- D) BRIN Index

**Réponse : A**

**Q3 :** Dans une architecture Big Data Hadoop/Spark, pourquoi le stockage des fichiers au format colonne **Parquet** est-il nettement plus performant que le format CSV pour les requêtes analytiques (OLAP) ?
- A) Parquet permet la projection de colonnes (lire uniquement les colonnes nécessaires) et le predicate pushdown (filtrer au niveau du stockage)
- B) Parquet est un fichier texte lisible par un humain
- C) Parquet ne nécessite aucun processeur pour être lu
- D) Parquet est limité à 1 Mo par fichier

**Réponse : A**

**Q4 :** Quel outil d'orchestration de workflows Data permet de définir des pipelines ETL sous forme de DAGs (Directed Acyclic Graphs) en Python ?
- A) Apache Airflow
- B) Apache Kafka
- C) RabbitMQ
- D) Redis

**Réponse : A**

**Q5 :** Dans Kafka, qu'est-ce qu'un **Consumer Group** et quel est son rôle dans la montée en charge du traitement des messages ?
- A) Un groupe de consommateurs partageant la lecture des partitions d'un topic, permettant de paralléliser le traitement des messages tout en garantissant qu'une partition n'est lue que par un seul consommateur du groupe
- B) Un groupe de brokers Kafka
- C) Une liste d'attente d'erreurs
- D) Un composant de chiffrement SSL

**Réponse : A**

**Q6 :** Dans un Data Lakehouse, quelle couche de l'architecture Medallion contient les données nettoyées, dédupliquées et anonymisées (RGPD) servant de source de vérité pour l'entreprise ?
- A) Silver Layer
- B) Bronze Layer
- C) Gold Layer
- D) Platinum Layer

**Réponse : A**

**Q7 :** Dans Apache Spark, quelle opération de jointure copie une petite table de référence sur tous les executors pour éliminer complètement l'étape coûteuse de Shuffle réseau ?
- A) Broadcast Join
- B) Sort Merge Join
- C) Hash Join
- D) Outer Join

**Réponse : A**

**Q8 :** Quel composant de Delta Lake garantit les transactions ACID et permet d'effectuer des requêtes historiques (Time Travel) ?
- A) Le transaction log `_delta_log/`
- B) Le Metastore Hive
- C) L'index B-Tree
- D) Le serveur Redis

**Réponse : A**

**Q9 :** Quel est le principe central du **Data Mesh** concernant la responsabilité des données au sein de l'entreprise ?
- A) La décentralisation de la responsabilité des données confiée aux équipes du domaine métier (Domain Ownership) qui publient leurs données sous forme de Data Products
- B) La centralisation de toutes les données dans un seul fichier Excel
- C) L'externalisation totale des données chez un sous-traitant
- D) L'absence totale de gouvernance

**Réponse : A**

**Q10 :** Dans l'Event Sourcing, qu meut-on dire de l'état actuel d'un système ?
- A) L'état actuel est la projection de la somme de tous les événements immuables passés
- B) L'état actuel est stocké en écrasant les données précédentes
- C) L'état actuel ne peut pas être reconstruit
- D) L'état actuel est indépendant du passé

**Réponse : A**

**Q11 :** Quel pattern résout le problème d'incohérence "Dual Write Failure" en écrivant l'événement dans une table BDD locale au sein de la même transaction ACID que les données métier ?
- A) Transactional Outbox Pattern
- B) Circuit Breaker Pattern
- C) Singleton Pattern
- D) Factory Pattern

**Réponse : A**

**Q12 :** Quelle est la différence majeure d'architecture entre Apache Pulsar et Apache Kafka ?
- A) Pulsar sépare le calcul (Brokers stateless) du stockage (Apache BookKeeper), tandis que Kafka couple le stockage et le calcul sur les mêmes brokers
- B) Kafka est plus récent que Pulsar
- C) Pulsar ne supporte pas le réplication
- D) Kafka est uniquement écrit en Python

**Réponse : A**

---

## 2) Section 2 — Web Development & APIs RESTful (Questions 13 à 24)

**Q13 :** Dans le modèle de boîtes CSS (Box Model), quelle propriété CSS indique au navigateur d'inclure le padding et la bordure dans la largeur totale spécifiée de l'élément ?
- A) `box-sizing: border-box;`
- B) `display: flex;`
- C) `position: absolute;`
- D) `margin: auto;`

**Réponse : A**

**Q14 :** Quel composant de l'architecture JavaScript gère les opérations asynchrones (I/O, timers, réseau) en les déléguant au système d'exploitation avant de placer leurs callbacks dans la Task Queue ?
- A) L'Event Loop (Libuv sous Node.js)
- B) Le Call Stack uniquement
- C) Le moteur V8 uniquement
- D) Le Garbage Collector

**Réponse : A**

**Q15 :** Quelle est la différence entre `Promise.all()` et `Promise.allSettled()` en JavaScript ES6+ ?
- A) `Promise.all()` rejette immédiatement dès qu'une promesse échoue ; `Promise.allSettled()` attend que toutes les promesses soient terminées (succès ou échec) et retourne leur état
- B) `Promise.all()` est plus lent
- C) `Promise.allSettled()` n'accepte qu'une seule promesse
- D) Ce sont deux méthodes identiques

**Réponse : A**

**Q16 :** Dans une architecture Express.js (Node.js), quel est le rôle d'un **middleware** ?
- A) Une fonction qui accède aux objets `req` et `res` pour exécuter du code, modifier la requête, ou interrompre le cycle requête-réponse
- B) Une base de données temporaire
- C) Un compilateur de code CSS
- D) Un protocole de routage réseau

**Réponse : A**

**Q17 :** Quelle vulnérabilité d'API (#1 OWASP API Security) survient lorsqu'un utilisateur authentifié modifie l'ID dans l'URL (ex: `/accounts/101` vers `/accounts/102`) et accède aux données d'un autre client par manque de contrôle au niveau de l'objet ?
- A) BOLA (Broken Object Level Authorization)
- B) SQL Injection
- C) CSRF
- D) Cross-Site Scripting

**Réponse : A**

**Q18 :** Quelle structure compose un JSON Web Token (JWT) ?
- A) Header . Payload . Signature
- B) User . Password . Token
- C) Key . Value . Secret
- D) Data . Checksum . Hash

**Réponse : A**

**Q19 :** Quel drapeau (flag) de cookie HTTP empêche formellement le code JavaScript (ex: script XSS) d'accéder au jeton d'authentification stocké dans le cookie ?
- A) `HttpOnly`
- B) `Secure`
- C) `SameSite`
- D) `Domain`

**Réponse : A**

**Q20 :** Dans React.js, quelle technologie conserve une représentation légère de l'interface en mémoire RAM pour calculer les modifications minimales à appliquer au DOM du navigateur ?
- A) Le Virtual DOM
- B) Le Web Storage
- C) Le Shadow DOM
- D) Le Service Worker

**Réponse : A**

**Q21 :** Quel Hook React permet de déclarer et gérer un état local modifiable dans un composant fonctionnel ?
- A) `useState`
- B) `useEffect`
- C) `useContext`
- D) `useRef`

**Réponse : A**

**Q22 :** Dans React, que se passe-t-il si vous omettez totalement le tableau de dépendances dans un Hook `useEffect(fn)` ?
- A) L'effet s'exécute à CHAQUE rendu du composant, ce qui peut provoquer des boucles de rendu infinies s'il modifie l'état
- B) L'effet ne s'exécute jamais
- C) L'effet s'exécute uniquement au montage
- D) React génère une erreur de compilation

**Réponse : A**

**Q23 :** Quel est le rôle d'un **Circuit Breaker** (ex: Opossum) dans la communication entre microservices web ?
- A) Interrompre immédiatement les appels vers un service défaillant pour lui laisser le temps de récupérer et éviter une cascade de pannes (Cascading Failure)
- B) Réduire la taille des images PNG
- C) Formater le code JSON
- D) Bloquer l'accès aux adresses IP étrangères

**Réponse : A**

**Q24 :** Quel est l'avantage du format **gRPC / Protobuf** par rapport à **REST / JSON** pour les communications internes haute fréquence entre microservices ?
- A) Protobuf est un format binaire compact 5 à 10x plus rapide que JSON avec support natif du streaming
- B) gRPC ne nécessite aucun serveur
- C) gRPC s'exécute directement dans le navigateur HTML sans transpilateur
- D) REST est plus sécurisé que gRPC

**Réponse : A**

---

## 3) Section 3 — Cloud, DevOps & GitOps (Questions 25 à 36)

**Q25 :** Dans un Dockerfile, quel est le principal avantage de la technique du **Multi-Stage Build** ?
- A) Séparer l'étape de build de l'étape de production pour produire une image finale ultra-légère sans outils de compilation, réduisant la surface d'attaque
- B) Permettre de lancer plusieurs conteneurs simultanément
- C) Accélérer la vitesse de téléchargement de l'image
- D) Éviter l'utilisation de Docker Compose

**Réponse : A**

**Q26 :** Quelle directive dans un Dockerfile permet de respecter le principe du moindre privilège en exécutant l'application sous un compte sans droits d'administration ?
- A) `USER appuser`
- B) `RUN chmod 777`
- C) `ENV ROOT=true`
- D) `EXPOSE 80`

**Réponse : A**

**Q27 :** Dans Kubernetes, quelle est la plus petite unité déployable contenant un ou plusieurs conteneurs partageant le même réseau et le même stockage ?
- A) Le Pod
- B) Le Deployment
- C) Le Node
- D) Le Namespace

**Réponse : A**

**Q28 :** Quelle est la différence entre une **Liveness Probe** et une **Readiness Probe** dans Kubernetes ?
- A) La Liveness Probe redémarre le conteneur s'il crashe ; la Readiness Probe retire le Pod du load balancer s'il n'est pas prêt à recevoir du trafic
- B) La Liveness Probe vérifie le disque ; la Readiness vérifie la RAM
- C) Elles font exactement la même chose
- D) La Readiness Probe supprime le Deployment

**Réponse : A**

**Q29 :** Dans un pipeline CI/CD, que signifie l'étape **SAST (Static Application Security Testing)** ?
- A) L'analyse statique du code source pour détecter les vulnérabilités de sécurité avant la compilation
- B) L'exécution d'attaques réseau sur l'application en cours de fonctionnement
- C) Le scan de la base de données
- D) Le test de charge du serveur

**Réponse : A**

**Q30 :** Quel est le principe fondamental de la démarche **GitOps** avec un outil comme ArgoCD ?
- A) Git est la source de vérité unique décrivant l'état désiré de l'infrastructure, et ArgoCD synchronise automatiquement le cluster Kubernetes avec le dépôt Git
- B) Le code est déployé manuellement par SSH sur les serveurs
- C) Les configurations sont modifiées directement en production avec `kubectl edit`
- D) ArgoCD remplace Git pour le versionnement du code

**Réponse : A**

**Q31 :** Dans le modèle de responsabilité partagée AWS pour une instance EC2 (IaaS), de qui relève la gestion des patchs de sécurité du système d'exploitation (OS) ?
- A) Du client
- B) D'AWS
- C) Du fournisseur d'accès Internet
- D) De personne

**Réponse : A**

**Q32 :** Dans Terraform, à quoi sert le fichier de backend distant (ex: S3 + DynamoDB) pour le `terraform.tfstate` ?
- A) Centraliser l'état de l'infrastructure, permettre le travail en équipe et bloquer les exécutions concurrentes via un verouillage DynamoDB
- B) Stocker le code source Python
- C) Générer les mots de passe des utilisateurs
- D) Remplacer les fichiers `.tf`

**Réponse : A**

**Q33 :** Dans AWS IAM, quel principe de sécurité impose de n'accorder à un rôle applicatif que les permissions strictement nécessaires à son fonctionnement ?
- A) Le principe du moindre privilège (Least Privilege)
- B) Le principe de transparence
- C) Le principe d'accès total
- D) Le principe de haute disponibilité

**Réponse : A**

**Q34 :** Quel service Serverless AWS permet d'exécuter du code à la demande sous forme de fonctions (FaaS) sans provisionner ni gérer de serveurs ?
- A) AWS Lambda
- B) AWS EC2
- C) AWS RDS
- D) AWS VPC

**Réponse : A**

**Q35 :** Qu'est-ce que le **Cold Start** d'une fonction AWS Lambda ?
- A) Le délai d'initialisation lors de la première invocation d'une fonction (téléchargement du code + démarrage du runtime)
- B) La panne du serveur AWS
- C) Le refroidissement des datacenters
- D) L'arrêt définitif de la fonction

**Réponse : A**

**Q36 :** Quelle stratégie de déploiement Zero-Downtime consiste à diriger d'abord une infime partie du trafic (ex: 5%) vers la nouvelle version pour valider ses métriques en production ?
- A) Canary Deployment
- B) Recreate Deployment
- C) Cold Deployment
- D) Big Bang Deployment

**Réponse : A**

---

## 4) Section 4 — SecOps, SRE & Gouvernance (Questions 37 à 50)

**Q37 :** Quel outil est utilisé par les pentesteurs web pour intercepter et modifier le trafic HTTP/HTTPS entre le navigateur et le serveur ?
- A) Burp Suite
- B) Docker
- C) Prometheus
- D) Terraform

**Réponse : A**

**Q38 :** Quel en-tête HTTP de sécurité permet d'indiquer au navigateur les sources de scripts autorisées et de bloquer l'exécution de scripts XSS non autorisés ?
- A) `Content-Security-Policy` (CSP)
- B) `X-Frame-Options`
- C) `Server`
- D) `Access-Control-Allow-Origin`

**Réponse : A**

**Q39 :** Quelle est la caractéristique principale d'un pare-feu de nouvelle génération (NGFW) par rapport à un pare-feu stateful classique ?
- A) Le NGFW inspecte le contenu des paquets jusqu'à la couche applicative (L7) et identifie les applications et utilisateurs
- B) Le NGFW ne fonctionne que sur le port 80
- C) Le NGFW est un logiciel uniquement pour smartphone
- D) Le NGFW ne filtre que les adresses IP

**Réponse : A**

**Q40 :** Quelle est la philosophie centrale de l'architecture **Zero Trust** (NIST SP 800-207) ?
- A) "Never Trust, Always Verify" — Ne jamais accorder de confiance implicite, toujours vérifier et authentifier chaque accès
- B) Faire confiance à tout le monde sur le réseau local
- C) Supprimer tous les mots de passe
- D) Bloquer l'accès à Internet pour tous les employés

**Réponse : A**

**Q41 :** Quelle propriété cryptographique de TLS 1.3 garantit que les données passées chiffrées ne pourront pas être déchiffrées même si la clé privée du serveur est volée dans le futur ?
- A) Perfect Forward Secrecy (PFS)
- B) Symmetric Encryption
- C) MD5 Hashing
- D) Base64 Encoding

**Réponse : A**

**Q42 :** Quel rôle joue une Autorité de Certification (CA) au sein d'une infrastructure PKI ?
- A) Signer cryptographiquement des certificats X.509 pour attester de l'identité des serveurs et des clients
- B) Stocker les mots de passe des utilisateurs en clair
- C) Bloquer les attaques DoS
- D) Distribuer le trafic réseau

**Réponse : A**

**Q43 :** Quel outil d'analyse de sécurité centralise et corrèle les événements et logs de sécurité de l'ensemble du SI pour détecter des attaques complexes ?
- A) SIEM (ex: ELK Stack / Splunk)
- B) IDE (ex: VS Code)
- C) Compiler
- D) Package Manager

**Réponse : A**

**Q44 :** Quels sont les **4 Golden Signals** recommandés par Google SRE pour surveiller un système en production ?
- A) Latence, Trafic, Erreurs, Saturation
- B) CPU, RAM, Disque, Réseau
- C) Coût, Temps, Qualité, Périmètre
- D) Code, Build, Test, Deploy

**Réponse : A**

**Q45 :** Comment calcule-t-on l'**Error Budget** d'un service ayant un SLO de disponibilité de 99.9% sur un mois ?
- A) Error Budget = 100% - 99.9% = 0.1% du temps total du mois (soit environ 43 minutes d'indisponibilité autorisées)
- B) Error Budget = 99.9% du budget financier
- C) Error Budget = 100 heures par jour
- D) Error Budget = Nombre de bugs dans le code

**Réponse : A**

**Q46 :** Quel est l'objectif du RGPD concernant les données personnelles des citoyens ?
- A) Protéger la vie privée en imposant des règles de licéité, de minimisation, de sécurité et en garantissant des droits (accès, effacement)
- B) Obliger la vente des données aux entreprises
- C) Interdire l'utilisation d'ordinateurs dans les banques
- D) Rendre toutes les données publiques sur Internet

**Réponse : A**

**Q47 :** Quelle exigence PCI-DSS interdit strictement de conserver le code de sécurité (CVV/CVC) d'une carte bancaire après l'autorisation de la transaction ?
- A) Exigence 3
- B) Exigence 1
- C) Exigence 12
- D) Exigence 8

**Réponse : A**

**Q48 :** Quel outil open-source basé sur eBPF permet de surveiller les appels système du noyau Linux en temps réel et de détecter les anomalies de sécurité dans les conteneurs Kubernetes ?
- A) Falco
- B) Git
- C) Nginx
- D) Postman

**Réponse : A**

**Q49 :** Quelle est la démarche **FinOps** dans la gestion des infrastructures Cloud ?
- A) L'optimisation continue des coûts cloud en apportant de la visibilité, de l'imputation budgétaire (tags) et du dimensionnement au juste besoin (rightsizing)
- B) L'arrêt de tous les serveurs cloud
- C) L'achat de serveurs physiques uniquement
- D) La suppression des équipes financières

**Réponse : A**

**Q50 :** Dans le Chaos Engineering, qu'appelle-t-on l'**État Stable (Steady State)** ?
- A) Le fonctionnement normal et mesurable du système (via ses SLIs) avant l'injection de perturbations
- B) L'état du serveur lorsqu'il est éteint
- C) Le fichier de configuration du pare-feu
- D) La version initiale du code source

**Réponse : A**

---

## 🏅 Bilan du Semestre 4 — Cloud, DevOps, SecOps & Data

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
