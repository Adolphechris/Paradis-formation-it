# TOME P3-A — Jour 14 (14h)

## Découpage horaire opérationnel J14
- Virtualisation (concepts, hyperviseurs, VMs) — **4h**
- Conteneurisation (concepts, différences VM vs conteneur) — **3h**
- Docker (images, conteneurs, Dockerfile, volumes, réseaux) — **4h**
- Labs intégrés (déploiement app simple conteneurisée) — **2h**
- Banque de questions + suivi P1 — **1h**

---

## 1) Virtualisation — concepts, hyperviseurs, VMs (4h)

### Objectifs d'apprentissage
- Définir la virtualisation et ses bénéfices métier (consolidation, isolation, reproductibilité).
- Distinguer hyperviseur de type 1 (bare-metal) et type 2 (hosted).
- Créer, configurer et gérer une machine virtuelle simple.
- Expliquer l'impact de la virtualisation sur les ressources (CPU, RAM, stockage, réseau).

### Contenu pédagogique
La virtualisation permet d'exécuter plusieurs systèmes d'exploitation isolés sur une même machine physique.

Points clés:
1. **Hyperviseur** = couche logicielle qui gère les VMs et alloue les ressources physiques.
2. **Type 1 (bare-metal)** : s'exécute directement sur le matériel (ex: VMware ESXi, Hyper-V, KVM). Performance élevée, utilisé en datacenter.
3. **Type 2 (hosted)** : s'exécute sur un OS hôte (ex: VirtualBox, VMware Workstation). Idéal pour le développement et les labs.
4. Une **VM** contient son propre OS invité, ses pilotes, ses binaires — totalement isolée.
5. **Overhead** : chaque VM consomme de la RAM et du CPU pour son OS invité, même au repos.
6. **Snapshots** : permettre de sauvegarder l'état d'une VM et de revenir en arrière — outil clé pour les tests et la formation.
7. **Bénéfices métier** : consolidation de serveurs (moins de machines physiques), isolation des environnements (dev/test/prod), reproductibilité, reprise après sinistre.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : lister les hyperviseurs installables sur ton poste et indiquer leur type (1 ou 2).
   - **Corrigé détaillé** : VirtualBox = type 2 ; KVM = type 1 ; VMware Workstation = type 2 ; Hyper-V = type 1. Justifier par la présence ou non d'un OS hôte entre l'hyperviseur et le matériel.
2. **Exercice 2 (intermédiaire)** : créer une VM Linux minimale (Ubuntu Server), allouer 2 CPU, 2 Go RAM, 20 Go disque, et documenter les étapes.
   - **Corrigé détaillé** : choix ISO, configuration ressources, démarrage, vérification que l'OS invité voit bien les ressources allouées (`lscpu`, `free -h`, `df -h`), documenter chaque écran de configuration.
3. **Exercice 3 (avancé)** : comparer le coût en RAM de 3 VMs identiques au repos vs 3 conteneurs au repos, et expliquer l'écart.
   - **Corrigé détaillé** : chaque VM a son propre noyau OS invité → ~500 Mo-1 Go de RAM par VM juste pour l'OS. Les conteneurs partagent le noyau hôte → quelques Mo par conteneur. L'écart vient de l'absence d'OS invité dans les conteneurs.

### Nouvelles abréviations rencontrées
- VM | Virtual Machine | Machine virtuelle isolée exécutée sur un hyperviseur | Interagit avec l'hyperviseur, les ressources physiques, le stockage, le réseau virtuel
- KVM | Kernel-based Virtual Machine | Hyperviseur de type 1 intégré au noyau Linux | Interagit avec QEMU, libvirt, le matériel physique

### Banque de questions du module (15)
1. QCM: un hyperviseur de type 1 s'exécute... A) sur un OS hôte B) directement sur le matériel C) dans un navigateur
2. QCM: VirtualBox est un hyperviseur de type... A) 1 B) 2 C) 3
3. QCM: une VM contient... A) uniquement l'application B) un OS complet C) seulement un processus
4. Ouverte: pourquoi la virtualisation réduit-elle le nombre de serveurs physiques ?
5. Ouverte: différence entre hyperviseur type 1 et type 2.
6. Cas: 3 VMs sur un serveur 16 Go RAM. Chaque VM allouée 6 Go. Que se passe-t-il au démarrage de la 3e ?
7. QCM: un snapshot sert à... A) sauvegarder l'état d'une VM B) accélérer le CPU C) remplacer le réseau
8. Ouverte: quel est l'intérêt des snapshots en formation/lab ?
9. Cas: une VM Windows Server est lente. Quels indicateurs vérifier en premier ?
10. QCM: l'overhead d'une VM vient principalement de... A) l'OS invité B) l'application C) l'écran
11. Ouverte: pourquoi ne pas tout virtualiser sans limite ?
12. Cas: besoin de tester une mise à jour critique sans risque. Approche ?
13. QCM: KVM est... A) un hyperviseur Linux B) un navigateur C) un langage
14. Ouverte: comment expliquer la virtualisation à un responsable métier ?
15. QCM: résultat attendu du module 1 = A) maîtriser les concepts et la pratique B) mémoriser des définitions C) éviter la pratique

---

## 2) Conteneurisation — concepts, différences VM vs conteneur (3h)

### Objectifs d'apprentissage
- Définir la conteneurisation et la distinguer clairement de la virtualisation.
- Expliquer le partage du noyau hôte et ses implications (performance, isolation, sécurité).
- Identifier les cas d'usage où les conteneurs sont préférables aux VMs, et inversement.
- Comprendre le rôle du moteur de conteneur (Docker, containerd, Podman).

### Contenu pédagogique
La conteneurisation isole des applications et leurs dépendances sans virtualiser un OS entier.

Points clés:
1. **Conteneur** = processus isolé qui partage le noyau de l'OS hôte, mais possède son propre espace utilisateur (binaires, librairies, fichiers).
2. **Différence fondamentale VM vs conteneur** : la VM inclut un OS invité complet → lourde, lente à démarrer, forte isolation. Le conteneur partage le noyau hôte → léger, rapide (secondes), isolation plus faible.
3. **Avantages conteneurs** : démarrage rapide, faible empreinte mémoire, densité élevée (dizaines de conteneurs par hôte), reproductibilité parfaite (image immuable), idéal pour microservices et CI/CD.
4. **Limites conteneurs** : isolation moins forte qu'une VM (partage du noyau), dépendance au noyau Linux (les conteneurs Windows existent mais sont moins matures), pas idéal pour exécuter plusieurs OS différents sur le même hôte.
5. **Quand utiliser une VM** : besoin d'isolation forte, exécution de plusieurs OS, applications monolithiques legacy, environnement de bureau complet.
6. **Quand utiliser un conteneur** : microservices, CI/CD, développement reproductible, scaling horizontal rapide, environnements jetables.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : schématiser sur papier la différence d'architecture entre une VM et un conteneur (couches : matériel, OS hôte, hyperviseur, OS invité, application vs matériel, OS hôte, moteur de conteneur, conteneur).
   - **Corrigé détaillé** : VM = Matériel → Hyperviseur → OS invité → Binaires/Libs → App. Conteneur = Matériel → OS hôte → Moteur conteneur → Conteneur (Binaires/Libs + App). Le conteneur n'a pas d'OS invité, c'est la différence clé.
2. **Exercice 2 (intermédiaire)** : pour chaque scénario ci-dessous, recommander VM ou conteneur et justifier : (a) base de données de production critique, (b) environnement de développement jetable, (c) exécution de Windows sur un serveur Linux, (d) microservice API REST.
   - **Corrigé détaillé** : (a) VM — isolation forte et stabilité ; (b) conteneur — rapide, jetable, reproductible ; (c) VM — besoin d'un OS Windows complet ; (d) conteneur — léger, scalable, idéal pour microservices.
3. **Exercice 3 (avancé)** : expliquer pourquoi un conteneur Linux ne peut pas exécuter un binaire Windows, alors qu'une VM le peut. En déduire une règle de choix VM vs conteneur pour les environnements multi-OS.
   - **Corrigé détaillé** : le conteneur utilise le noyau de l'hôte — si l'hôte est Linux, il ne peut pas exécuter un binaire Windows car le noyau Linux ne comprend pas les appels système Windows. La VM a son propre OS invité, donc elle peut exécuter n'importe quel OS. Règle : si plusieurs OS sont nécessaires sur le même matériel → VM.

### Nouvelles abréviations rencontrées
- LXC | Linux Containers | Technologie de conteneurisation bas niveau Linux | Interagit avec le noyau Linux, les namespaces, les cgroups
- OCI | Open Container Initiative | Standard ouvert pour les conteneurs et images | Interagit avec Docker, Podman, containerd, Kubernetes

### Banque de questions du module (15)
1. QCM: un conteneur partage... A) le noyau hôte B) l'OS invité C) le BIOS
2. QCM: une VM inclut... A) uniquement l'app B) un OS complet C) seulement des librairies
3. QCM: le démarrage d'un conteneur prend typiquement... A) plusieurs minutes B) quelques secondes C) plusieurs heures
4. Ouverte: pourquoi les conteneurs sont-ils plus légers que les VMs ?
5. Ouverte: dans quel cas choisir une VM plutôt qu'un conteneur ?
6. Cas: une application nécessite un accès direct au matériel GPU. VM ou conteneur ?
7. QCM: OCI est... A) un standard de conteneurs B) un hyperviseur C) un langage
8. Ouverte: pourquoi les conteneurs sont-ils idéaux pour le CI/CD ?
9. Cas: 50 conteneurs sur un serveur vs 50 VMs. Différence de consommation RAM ?
10. QCM: un conteneur Linux sur un hôte Windows utilise... A) le noyau Windows B) une VM Linux cachée (WSL2) C) rien
11. Ouverte: expliquer l'isolation d'un conteneur en termes simples.
12. Cas: besoin de faire tourner Ubuntu et Windows Server sur le même serveur. Solution ?
13. QCM: le moteur de conteneur sert à... A) exécuter et gérer des conteneurs B) virtualiser le matériel C) compiler du code
14. Ouverte: comment convaincre une équipe IT de passer aux conteneurs ?
15. QCM: résultat attendu du module 2 = A) distinguer VM et conteneur avec des critères clairs B) mémoriser sans comprendre C) confondre les deux

---

## 3) Docker — images, conteneurs, Dockerfile, volumes, réseaux (4h)

### Objectifs d'apprentissage
- Installer Docker et exécuter un premier conteneur.
- Comprendre le cycle de vie d'un conteneur (pull → create → start → stop → rm).
- Construire une image avec un Dockerfile et comprendre le système de layers.
- Gérer la persistance des données avec les volumes.
- Connecter des conteneurs entre eux via un réseau Docker.
- Lire et interpréter les logs d'un conteneur.

### Contenu pédagogique
Docker est la plateforme de conteneurisation la plus utilisée en entreprise.

Points clés:
1. **Image** = modèle immuable contenant l'application et ses dépendances. Construite à partir d'un Dockerfile.
2. **Conteneur** = instance en cours d'exécution d'une image.
3. **Dockerfile** = fichier texte décrivant les étapes de construction d'une image (`FROM`, `RUN`, `COPY`, `CMD`, `EXPOSE`, etc.).
4. **Layers** = chaque instruction du Dockerfile crée une couche. Les couches bénéficient du cache (caching) pour accélérer les builds : si une couche n'a pas changé, Docker la réutilise sans la reconstruire.
5. **Volumes** = stockage persistant indépendant du cycle de vie du conteneur. Sans volume, les données sont perdues à la suppression du conteneur.
6. **Réseaux Docker** : bridge (par défaut, isolation), host (partage réseau hôte), overlay (multi-hôte). Les conteneurs d'un même réseau bridge communiquent par nom de conteneur.
7. **Commandes essentielles** : `docker pull`, `docker run`, `docker ps`, `docker stop`, `docker rm`, `docker logs`, `docker exec`, `docker build`, `docker volume`, `docker network`.
8. **docker-compose** (notion) : outil en ligne de commande pour définir et exécuter des applications multi-conteneurs via un fichier `docker-compose.yml`. **Note** : `docker compose` (espace, sans tiret) est la commande moderne intégrée à la CLI Docker depuis 2023 ; `docker-compose` (tiret) était l'outil séparé Python. Les deux syntaxes fonctionnent, mais `docker compose` est recommandé pour les nouveaux projets sur Ubuntu 24.04.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : exécuter un conteneur nginx, vérifier qu'il tourne avec `docker ps`, accéder à la page d'accueil via navigateur, puis l'arrêter et le supprimer proprement.
   - **Corrigé détaillé** : `docker run -d -p 8080:80 nginx` → `docker ps` (vérifier statut Up et port mapping) → `curl localhost:8080` (voir HTML nginx) → `docker stop <id>` → `docker rm <id>` → `docker ps -a` (vérifier suppression). Expliquer `-d` (detached), `-p` (port mapping hôte:conteneur).
2. **Exercice 2 (intermédiaire)** : écrire un Dockerfile pour une application Python Flask simple, builder l'image, lancer le conteneur, et tester l'API.
   - **Corrigé détaillé** : Dockerfile avec `FROM python:3.11-slim`, `WORKDIR /app`, `COPY requirements.txt .`, `RUN pip install -r requirements.txt`, `COPY . .`, `EXPOSE 5000`, `CMD ["python", "app.py"]`. Build avec `docker build -t flask-app .`. Run avec `docker run -d -p 5000:5000 flask-app`. Tester avec `curl localhost:5000`. Expliquer chaque instruction et l'ordre (optimisation du cache).
3. **Exercice 3 (avancé)** : créer une application 2 services (API + base de données PostgreSQL) avec un réseau Docker dédié et un volume pour les données. Utiliser `docker compose` (syntaxe moderne, espace) pour orchestrer le tout.
   - **Corrigé détaillé** : `docker compose.yml` définissant `services: api (build: ., ports: 5000:5000, depends_on: db, networks: app-net)` et `db (image: postgres:15, volumes: pgdata:/var/lib/postgresql/data, networks: app-net)`. `networks: app-net`, `volumes: pgdata`. `docker compose up -d` → tester API → vérifier persistance avec `docker compose down && docker compose up -d` (données conservées grâce au volume nommé).

### Nouvelles abréviations rencontrées
- YAML | YAML Ain't Markup Language | Format de configuration lisible par humain | Interagit avec docker-compose, Kubernetes, Ansible, CI/CD
- PID | *(voir annexe existante)* | Identifiant processus — Docker mappe les PIDs conteneur↔hôte | Interagit avec `docker top`, isolation processus, supervision

### Banque de questions du module (15)
1. QCM: une image Docker est... A) un conteneur en cours B) un modèle immuable C) un fichier texte
2. QCM: `docker run -d` signifie... A) mode debug B) mode détaché (background) C) mode delete
3. QCM: un Dockerfile commence généralement par... A) `CMD` B) `FROM` C) `DELETE`
4. Ouverte: à quoi sert un volume Docker ?
5. Ouverte: pourquoi l'ordre des instructions dans un Dockerfile est-il important ?
6. Cas: un conteneur planté ne laisse aucun log visible. Que faire ?
7. QCM: `docker ps` affiche... A) les conteneurs actifs B) les images C) les volumes
8. Ouverte: différence entre `docker stop` et `docker rm`.
9. Cas: deux conteneurs doivent communiquer. Par quel mécanisme ?
10. QCM: un layer Docker est... A) une couche d'image B) un fichier .txt C) un processus
11. Ouverte: pourquoi le caching des layers accélère-t-il les builds ?
12. Cas: données perdues après redémarrage du conteneur. Cause probable ?
13. QCM: docker-compose sert à... A) orchestrer plusieurs conteneurs B) remplacer Git C) compiler
14. Ouverte: comment expliquer Docker à un collègue développeur ?
15. QCM: résultat attendu du module 3 = A) construire et gérer des conteneurs Docker B) seulement lire la doc C) éviter Docker

---

## 4) Labs intégrés — déploiement app simple conteneurisée (2h)

### Objectifs d'apprentissage
- Intégrer les compétences J14 (VM + conteneur + Docker) sur un cas réaliste.
- Déployer une application web conteneurisée de bout en bout avec persistance.
- Diagnostiquer et corriger un incident Docker (conteneur qui ne démarre pas, port déjà utilisé, volume manquant).
- Produire une SOP courte de déploiement conteneurisé.

### Contenu pédagogique
Scénario : tu dois déployer une application de gestion de tickets (backend Flask + PostgreSQL) pour une équipe support de 5 personnes.

Scénarios de lab :
1. **Build + déploiement initial** : construire l'image, lancer les conteneurs, valider le fonctionnement.
2. **Incident 1 — conteneur ne démarre pas** : port déjà occupé. Diagnostiquer (`docker logs`, `docker ps`, `netstat`), libérer le port, relancer.
3. **Incident 2 — perte de données simulée** : supprimer le conteneur sans volume → constater la perte. Recréer avec volume → valider la persistance.
4. **Incident 3 — réseau** : conteneur API et DB sur des réseaux différents → échec de connexion. Diagnostiquer (`docker network inspect`), reconnecter, valider.

Méthode : chaque incident suit le cycle **constat → hypothèse → test → correction → validation**.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : reproduire le scénario de perte de données et documenter la correction.
   - **Corrigé détaillé** : lancer DB sans volume → insérer données → `docker rm -f` DB → relancer → données perdues. Correction : ajouter `-v pgdata:/var/lib/postgresql/data` au `docker run` ou dans le docker-compose. Re-tester : données conservées après suppression/recréation.
2. **Exercice 2 (intermédiaire)** : incident port occupé — conteneur API refuse de démarrer. Diagnostic complet + correction + validation.
   - **Corrigé détaillé** : `docker logs` montre "address already in use". `docker ps` + `netstat -tlnp` identifient le processus occupant le port 5000. Solution : soit `docker stop` l'ancien conteneur, soit mapper sur un autre port (`-p 5001:5000`). Valider avec `curl localhost:5001`.
3. **Exercice 3 (avancé)** : rédiger une SOP "Déploiement application conteneurisée" en 1 page, couvrant prérequis, déploiement, vérification, rollback, et résolution des 3 pannes courantes (port, volume, réseau).
   - **Corrigé détaillé** : SOP structurée avec sections : Prérequis (Docker installé, docker-compose, ports disponibles), Déploiement (`docker-compose up -d`), Vérification (`docker ps`, `curl`, logs), Rollback (`docker-compose down -v`), Pannes : port occupé (voir correctif), volume manquant (ajouter volume), réseau isolé (vérifier `docker network ls` + rattacher).

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: un lab intégré J14 simule... A) un cas réel multi-composants B) un exercice théorique isolé C) un cours magistral
2. QCM: première action face à un conteneur qui ne démarre pas = A) `docker logs` B) reboot serveur C) désinstaller Docker
3. QCM: un volume Docker garantit... A) la persistance des données B) la vitesse réseau C) la compression
4. Ouverte: pourquoi documenter les pannes courantes dans une SOP ?
5. Ouverte: quel est l'intérêt de tester le rollback ?
6. Cas: `docker-compose up` échoue, aucune info utile. Où chercher ?
7. QCM: `docker network inspect` sert à... A) voir la config réseau B) supprimer un conteneur C) builder une image
8. Ouverte: différence entre un bug applicatif et un bug d'infrastructure conteneur.
9. Cas: l'API répond mais la DB est inaccessible. Vérifications ?
10. QCM: une SOP de déploiement doit inclure... A) la procédure de rollback B) des opinions personnelles C) des slogans
11. Ouverte: comment prouver que le correctif est durable ?
12. Cas: même erreur revient après 3 jours. Prochaine étape ?
13. QCM: objectif du module 4 = A) réflexes de diagnostic conteneur B) mémorisation Dockerfile C) théorie sans pratique
14. Ouverte: comment présenter ce lab en entretien ?
15. QCM: résultat attendu = A) déploiement maîtrisé + diagnostic efficace B) essais aléatoires C) abandon

---

## 5) Banque de questions + suivi P1 (1h)

### Objectifs d'apprentissage
- Valider les acquis J14 en format test.
- Transformer J14 en preuve employable immédiate.

### Contenu pédagogique
- 40 min test mixte J14.
- 20 min correction + plan J15.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : rédiger une ligne CV intégrant une compétence J14 (virtualisation ou Docker).
   - **Corrigé détaillé** : exemple — "Déploiement d'applications conteneurisées avec Docker et docker-compose" ou "Gestion de machines virtuelles Linux pour environnements de test".
2. **Exercice 2 (intermédiaire)** : pitch 60s "Pourquoi la conteneurisation est utile en entreprise".
   - **Corrigé détaillé** : rapidité de déploiement → reproductibilité → réduction des bugs "chez moi ça marche" → scaling facile → économies infrastructure.
3. **Exercice 3 (avancé)** : plan J15 en 3 priorités mesurables.
   - **Corrigé détaillé** : 1 priorité technique (comprendre les principes de durcissement), 1 priorité pratique (appliquer une politique de sécurité sur un service), 1 priorité communication (expliquer un choix de sécurité en termes simples).

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: objectif final J14 = A) compétences virtualisation + conteneurisation opérationnelles B) théorie uniquement C) aucun livrable
2. Ouverte: meilleure preuve d'une compétence Docker à montrer à un recruteur ?
3. QCM: ligne CV efficace = A) verbe d'action + technologie + impact B) liste vague C) phrases longues
4. Cas: tu maîtrises Docker mais pas Kubernetes. Comment le présenter en entretien ?
5. Ouverte: comment relier J14 au poste d'admin système junior ?
6. QCM: plan J15 doit être... A) mesurable B) flou C) optionnel
7. Ouverte: quelle preuve publier sur le portfolio ce soir ?
8. QCM: correction immédiate sert à... A) consolider les acquis B) repousser le travail C) copier sans comprendre
9. Cas: stress en entretien, on te demande d'expliquer la différence VM/conteneur. Routine ?
10. QCM: preuve solide = A) code + logs + résultat documenté B) promesse orale C) une seule capture d'écran
11. Ouverte: pourquoi montrer un docker-compose.yml sur ton portfolio ?
12. Cas: le recruteur te demande "Pourquoi Docker plutôt que VM pour ce projet ?"
13. QCM: remédiation utile = A) identifier la lacune précise B) recommencer tout le module C) abandonner
14. Ouverte: indicateur de progression J14 pertinent ?
15. QCM: résultat P1 réussi = A) portfolio et CV enrichis B) rien de changé C) nouvelles notes seules

---

## Validation qualité J14 (anti-superficiel)

### Livrables obligatoires fin de J14
1. 1 VM Linux fonctionnelle documentée (configuration, ressources, usage prévu).
2. 1 application conteneurisée 2 services (API + DB) fonctionnelle avec docker-compose.
3. 3 incidents Docker résolus et documentés (port, volume, réseau) + 1 RCA par incident.
4. 1 SOP "Déploiement conteneurisé" (1 page, incluant pannes courantes et rollback).
5. 1 preuve portfolio (capture + explication) + mise à jour CV ligne virtualisation/Docker.

### Grille d'évaluation rapide (100 points)
- Maîtrise concepts virtualisation (VM, hyperviseur, types) : **20 pts**
- Compréhension conteneurisation (VM vs conteneur, choix d'architecture) : **20 pts**
- Maîtrise Docker (images, conteneurs, Dockerfile, volumes, réseaux, docker-compose) : **30 pts**
- Diagnostic incidents et qualité SOP : **20 pts**
- Communication technique employabilité : **10 pts**

### Seuil attendu
- **>= 80/100** : J14 validé, passage normal J15.
- **65-79/100** : validé sous remédiation ciblée 24h.
- **< 65/100** : consolidation virtualisation/Docker requise avant J15.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Virtualisation)
1. **B**
2. **B**
3. **B**
4. Un seul serveur physique exécute plusieurs OS simultanément → moins de machines à acheter, alimenter, refroidir.
5. Type 1 sur matériel nu (performance, datacenter) ; type 2 sur OS hôte (lab, dev).
6. La 3e VM ne démarrera pas ou sera très lente : 3 × 6 = 18 Go > 16 Go. L'overcommitment CPU/RA M existe mais dégrade les performances.
7. **A**
8. Permet de tester des configurations à risque et de revenir instantanément à un état stable.
9. CPU Ready, RAM active, I/O disque (via hyperviseur ou Task Manager dans la VM).
10. **A**
11. Chaque VM consomme des ressources même au repos ; il faut dimensionner selon la charge réelle.
12. Snapshot de la VM avant mise à jour → appliquer màj → si échec, revenir au snapshot.
13. **A**
14. "Plusieurs serveurs virtuels sur une seule machine physique = économies, flexibilité, reprise rapide."
15. **A**

### B. Corrigé — Module 2 (Conteneurisation)
1. **A**
2. **B**
3. **B**
4. Pas d'OS invité → pas de noyau séparé → partage du noyau hôte → Mo au lieu de Go.
5. Besoin d'isolation forte, exécution d'un OS différent, application monolithique legacy.
6. VM — les conteneurs n'ont pas d'accès direct au matériel sans configuration spécifique.
7. **A**
8. Environnements jetables, reproductibles, démarrage rapide, parfaits pour les pipelines de test.
9. 50 conteneurs : quelques centaines de Mo ; 50 VMs : 25-50 Go minimum. Ratio ~1:100.
10. **B**
11. "Comme des appartements dans un immeuble : chacun a sa cuisine et ses meubles, mais tous partagent la structure du bâtiment (le noyau). Une VM serait une maison individuelle avec ses propres fondations."
12. VM — les deux OS sont différents, ils nécessitent chacun leur noyau.
13. **A**
14. Démo : même app, déploiement VM 5 min vs conteneur 5 secondes. Coût infra divisé. "Chez moi ça marche" éliminé.
15. **A**

### C. Corrigé — Module 3 (Docker)
1. **B**
2. **B**
3. **B**
4. Stocker des données de façon persistante, indépendamment du cycle de vie du conteneur.
5. Les layers bénéficient du cache : les instructions qui changent peu (FROM, RUN apt) doivent être en haut pour maximiser le cache ; COPY doit être en bas car le code change souvent.
6. `docker logs <id>` même après crash (logs conservés tant que le conteneur n'est pas supprimé). Si supprimé, vérifier les logs du daemon Docker.
7. **A**
8. `stop` arrête le conteneur (il existe toujours, redémarrable). `rm` le supprime définitivement.
9. Les placer sur le même réseau Docker bridge et communiquer par nom de conteneur.
10. **A**
11. Si un layer n'a pas changé, Docker le réutilise au lieu de le reconstruire → gain de temps.
12. Pas de volume monté — les données étaient dans le conteneur, détruites avec lui.
13. **A**
14. "Comme un exécutable portable qui contient tout ce dont l'app a besoin, fonctionne partout pareil."
15. **A**

### D. Corrigé — Module 4 (Labs intégrés)
1. **A**
2. **A**
3. **A**
4. Pour accélérer la résolution, standardiser les actions, et permettre à un collègue de résoudre sans toi.
5. Pour s'assurer qu'on peut revenir en arrière rapidement si le correctif aggrave la situation.
6. `docker logs <service>`, `docker-compose config` (validation YAML), `docker ps -a` (vérifier état).
7. **A**
8. Bug applicatif = erreur dans le code. Bug infra conteneur = erreur de config Docker (port, volume, réseau, image).
9. Vérifier réseau Docker, nom d'hôte dans la config API (nom du service docker-compose), credentials, logs DB.
10. **A**
11. Supprimer et recréer les conteneurs → le correctif tient toujours.
12. RCA approfondie : chercher la cause racine (cron, script externe, ressource hôte fluctuante).
13. **A**
14. "J'ai déployé une app 2 services avec Docker, géré 3 pannes courantes, et documenté la procédure."
15. **A**

### E. Corrigé — Module 5 (Banque + P1)
1. **A**
2. Un dépôt Git avec Dockerfile, docker-compose.yml, et une capture ou un lien vers l'app running.
3. **A**
4. "Je maîtrise Docker pour le déploiement d'applications, et j'ai les bases pour monter en compétence sur Kubernetes."
5. La virtualisation et la conteneurisation sont au cœur de l'administration moderne : gestion des serveurs, déploiement, isolation.
6. **A**
7. Le docker-compose.yml annoté + capture de l'app en fonctionnement.
8. **A**
9. "Une VM, c'est un ordinateur entier virtualisé avec son propre OS. Un conteneur, c'est plus léger : il partage l'OS de la machine hôte, comme des applications isolées dans des boîtes."
10. **A**
11. Ça prouve que tu sais orchestrer plusieurs services, pas seulement lancer un conteneur seul.
12. "Docker est plus léger, plus rapide à déployer, et garantit que l'environnement de dev est identique à la production — pas de surprise."
13. **A**
14. Temps moyen de diagnostic incident conteneur + taux de résolution en moins de 10 minutes.
15. **A**