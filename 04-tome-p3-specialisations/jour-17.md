# TOME P3-A — Jour 17 (14h)

## Découpage horaire opérationnel J17
- Conception de l'infrastructure cible (schéma, services, sécurité) — **3h**
- Implémentation et configuration (VMs, conteneurs, supervision, sécurité) — **5h**
- Tests de validation (fonctionnels, sécurité, incidents simulés) — **3h**
- Documentation et portfolio (schéma, SOP, rapport de synthèse) — **2h**
- Banque de questions + suivi P1 — **1h**

---

> **🎯 PROJET DE SYNTHÈSE P3-A — Infrastructure documentée sécurisée**
>
> Tu es administrateur système junior dans une PME de 50 employés. Tu dois concevoir, déployer et documenter une infrastructure complète comprenant :
> - 2 serveurs Linux (un serveur web, un serveur de base de données)
> - 1 contrôleur de domaine Windows Server (AD, DNS, GPO)
> - Un environnement de supervision
> - Une politique de sécurité documentée (durcissement, accès, réponse aux incidents)
>
> **Livrable final** : un dossier technique complet démontrant ta capacité à administrer une infrastructure de bout en bout, prêt pour ton portfolio.

---

## 1) Conception de l'infrastructure cible (3h)

### Objectifs d'apprentissage
- Concevoir un schéma d'infrastructure complet et cohérent.
- Dimensionner les ressources (CPU, RAM, disque) selon les besoins métier.
- Définir le plan d'adressage réseau et les flux autorisés.
- Sélectionner les services à installer sur chaque serveur et justifier.
- Anticiper les besoins de sécurité dès la conception (security by design).

### Contenu pédagogique
Une infrastructure ne s'improvise pas. La conception est l'étape qui détermine la qualité de tout le reste.

Points clés:
1. **Schéma d'infrastructure** : représentation visuelle de tous les composants (serveurs, rôles, réseau, flux). Utiliser un outil simple (draw.io, Lucidchart, ou même papier + photo). Le schéma doit montrer : les machines (nom, IP, OS), les services installés sur chacune, les flux réseau autorisés entre elles, et les points d'accès externes.
2. **Dimensionnement** : pour chaque serveur, estimer les ressources nécessaires. Serveur web (nginx) : 2 CPU, 2 Go RAM, 20 Go disque. Serveur DB (PostgreSQL) : 2 CPU, 4 Go RAM, 40 Go disque. Contrôleur de domaine Windows Server : 2 CPU, 4 Go RAM, 40 Go disque. Supervision : 1 CPU, 2 Go RAM, 20 Go disque. Justifier chaque choix par la charge prévue (50 utilisateurs, trafic modéré).
3. **Plan d'adressage réseau** : définir un sous-réseau privé (ex: 192.168.10.0/24). Attribuer des IP statiques aux serveurs : web=.10, db=.20, ad=.30, supervision=.40. Les postes clients sont en DHCP sur la plage .100-.200. Documenter le plan dans un tableau.
4. **Flux réseau autorisés** : définir une matrice de flux. Web → DB : PostgreSQL (5432) autorisé. Supervision → tous : agent supervision autorisé. Admin → tous : SSH (22) / RDP (3389) autorisé. Utilisateurs → Web : HTTP/HTTPS (80/443) autorisé. Tout le reste : bloqué par défaut. Cette matrice est la base de la configuration des pare-feux.
5. **Services par serveur** : Web (nginx, SSH, agent supervision, fail2ban). DB (PostgreSQL, SSH, agent supervision, fail2ban). AD (AD DS, DNS, DHCP — services Windows). Supervision (Prometheus + Grafana ou Zabbix). Justifier chaque service : pourquoi est-il installé ? Quel risque s'il est absent ?
6. **Sécurité dès la conception** : moindre privilège (chaque service a son compte dédié), surface d'attaque minimale (pas de services inutiles), chiffrement (TLS pour le web, SSH pour l'administration), supervision et alertes dès le déploiement, sauvegardes planifiées.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : dessiner le schéma d'infrastructure complet (4 serveurs, réseau, flux). Inclure les noms, IP, OS, services. Justifier le choix de chaque composant.
   - **Corrigé détaillé** : Schéma incluant : [Internet] → [Pare-feu/routeur] → [Switch] → 4 serveurs. Serveur web-srv (192.168.10.10, Ubuntu Server, nginx + SSH + fail2ban + agent supervision). Serveur db-srv (192.168.10.20, Ubuntu Server, PostgreSQL + SSH + fail2ban + agent). Serveur ad-srv (192.168.10.30, Windows Server 2022, AD DS + DNS + DHCP). Serveur mon-srv (192.168.10.40, Ubuntu Server, Prometheus + Grafana). Flèches de flux étiquetées avec protocoles et ports. Justification : séparation web/DB pour la sécurité et la scalabilité, AD pour la gestion centralisée des identités, supervision pour la proactivité.
2. **Exercice 2 (intermédiaire)** : rédiger la matrice de flux réseau complète (tableau sources × destinations avec ports et justifications).
   - **Corrigé détaillé** : Tableau 5 colonnes (source, destination, protocole/port, justification, règle pare-feu). Exemples : Admin → web-srv, TCP/22 (SSH), administration, ACCEPT. Web-srv → db-srv, TCP/5432 (PostgreSQL), requêtes applicatives, ACCEPT. mon-srv → tous, TCP/9100 (node_exporter), collecte métriques, ACCEPT. Tous → Admin, TCP/22 (SSH), non applicable (initié par admin), RELATED/ESTABLISHED. Tout autre flux → DROP par défaut. Expliquer le principe de "default deny" : tout ce qui n'est pas explicitement autorisé est interdit.
3. **Exercice 3 (avancé)** : rédiger un document de conception d'infrastructure (1-2 pages) couvrant : schéma, dimensionnement, plan d'adressage, matrice de flux, services, sécurité. C'est le "design document" que tu présenterais à ton responsable avant de déployer.
   - **Corrigé détaillé** : Document structuré : 1) Résumé exécutif (quoi, pourquoi, pour qui). 2) Schéma d'infrastructure (image + légende). 3) Dimensionnement (tableau serveurs avec CPU/RAM/disque/OS). 4) Plan d'adressage (tableau IP avec nom, rôle, statique/DHCP). 5) Matrice de flux (tableau sources/destinations). 6) Services installés par serveur (tableau avec justifications). 7) Mesures de sécurité (durcissement, supervision, sauvegardes). 8) Prochaines étapes (déploiement, tests, validation). Ce document est une preuve portfolio majeure.

### Nouvelles abréviations rencontrées
- DMZ | Demilitarized Zone | Zone réseau isolée exposée à Internet (séparation des serveurs publics des serveurs internes) | Interagit avec le pare-feu, la segmentation réseau, la sécurité
- MTTR | Mean Time To Repair | Temps moyen de réparation d'un incident | Interagit avec la supervision, les SLA, les RCA

### Banque de questions du module (15)
1. QCM: un schéma d'infrastructure sert à... A) décorer le bureau B) visualiser les composants et leurs interactions C) remplacer les serveurs
2. QCM: le dimensionnement d'un serveur dépend de... A) la couleur du boîtier B) la charge prévue C) la météo
3. QCM: la règle "default deny" signifie... A) tout autoriser B) bloquer par défaut, n'autoriser que le nécessaire C) tout supprimer
4. Ouverte: pourquoi séparer le serveur web du serveur de base de données ?
5. Ouverte: qu'est-ce que le "security by design" ?
6. Cas: le serveur web est dimensionné à 1 Go RAM mais l'application en consomme 3. Conséquences et correction ?
7. QCM: une matrice de flux sert à... A) documenter les flux réseau autorisés B) calculer des impôts C) remplacer le câblage
8. Ouverte: pourquoi utiliser des IP statiques pour les serveurs ?
9. Cas: un nouveau service doit être ajouté sur le serveur web. Processus de décision ?
10. QCM: la DMZ est une zone... A) isolée pour les serveurs exposés à Internet B) de stockage C) de réunion
11. Ouverte: comment convaincre un manager d'investir dans la supervision dès le déploiement ?
12. Cas: le schéma montre 4 serveurs mais le budget n'en permet que 3. Quelle consolidation proposer ?
13. QCM: un design document doit être... A) clair et justifié B) illisible C) vide
14. Ouverte: comment présenter ton schéma d'infrastructure en entretien ?
15. QCM: résultat attendu du module 1 = A) concevoir une infrastructure cohérente et justifiée B) improviser C) copier un schéma sans comprendre

---

## 2) Implémentation et configuration (5h)

### Objectifs d'apprentissage
- Déployer les VMs ou conteneurs selon le schéma de conception.
- Installer et configurer les services sur chaque serveur (web, DB, AD, supervision).
- Appliquer les règles de pare-feu conformément à la matrice de flux.
- Configurer la supervision avec les métriques et alertes définies.
- Appliquer les politiques de durcissement et de sécurité.

### Contenu pédagogique
C'est le cœur pratique du projet. Chaque serveur est déployé, configuré, sécurisé, et supervisé.

Points clés:
1. **Déploiement des machines** : créer les VMs ou conteneurs selon le dimensionnement. Appliquer les configurations réseau (IP statiques, hostname, DNS). Vérifier la connectivité entre toutes les machines.
2. **Serveur web (Linux)** : installer nginx, configurer un site web simple (page d'accueil), configurer TLS avec un certificat auto-signé (pour le lab), configurer le pare-feu (iptables selon la matrice de flux), installer et configurer fail2ban, installer l'agent de supervision.
3. **Serveur DB (Linux)** : installer PostgreSQL, créer une base de données et un utilisateur applicatif avec le minimum de droits, configurer l'écoute sur l'interface réseau (pas localhost), configurer le pare-feu, configurer les sauvegardes automatiques (pg_dump + cron), installer fail2ban et l'agent de supervision.
4. **Contrôleur de domaine (Windows Server)** : installer le rôle AD DS, promouvoir en contrôleur de domaine, créer la structure OU (Users, Computers, Servers, Groups), créer des utilisateurs et groupes de test, configurer une GPO de mot de passe, vérifier le fonctionnement DNS.
5. **Serveur de supervision (Linux)** : installer Prometheus + Grafana (ou Zabbix), configurer les cibles (les 3 autres serveurs), créer un dashboard avec les métriques essentielles (CPU, RAM, disque, service status), configurer 3 alertes (disque > 80%, service down, CPU > 90% pendant 5 min).
6. **Vérifications** : tester chaque flux autorisé (connexion web→DB, admin→SSH, utilisateur→HTTPS). Tester que les flux non autorisés sont bien bloqués. Vérifier que la supervision remonte bien les métriques. Vérifier que les alertes se déclenchent (simuler un arrêt de service).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : déployer le serveur web et vérifier qu'il répond sur le port 443 avec TLS.
   - **Corrigé détaillé** : Créer la VM, installer nginx, générer un certificat auto-signé (`openssl req -x509 -nodes -days 365 -newkey rsa:2048`), configurer le vhost nginx avec SSL, redémarrer nginx, tester `curl -k https://192.168.10.10` → doit retourner la page. Vérifier que HTTP (80) redirige vers HTTPS.
2. **Exercice 2 (intermédiaire)** : configurer le pare-feu du serveur DB pour n'autoriser que PostgreSQL depuis le serveur web et SSH depuis le poste admin. Tester les flux autorisés et bloqués.
   - **Corrigé détaillé** : `iptables -P INPUT DROP` ; `iptables -A INPUT -s 192.168.10.10 -p tcp --dport 5432 -j ACCEPT` ; `iptables -A INPUT -s 192.168.10.1 -p tcp --dport 22 -j ACCEPT` (admin) ; `iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT`. Test : depuis web-srv, `psql -h 192.168.10.20` → OK. Depuis une autre machine non autorisée → connexion refusée (timeout).
3. **Exercice 3 (avancé)** : déployer l'ensemble de l'infrastructure (4 serveurs) et produire un script d'automatisation (bash ou docker-compose) qui recrée l'environnement complet. Documenter chaque étape.
   - **Corrigé détaillé** : Script `deploy-infra.sh` qui : 1) Crée les VMs (Vagrantfile ou docker-compose). 2) Configure le réseau. 3) Installe les services. 4) Applique les pare-feux. 5) Configure la supervision. Bonus : utiliser Ansible pour automatiser la configuration. Documenter le script avec des commentaires expliquant chaque section. Tester que `./deploy-infra.sh` recrée l'infra complète en moins de 10 minutes.

### Nouvelles abréviations rencontrées
- TLS | *(déjà existant, section G)* | Transport Layer Security — chiffrement des communications web et autres | Interagit avec HTTPS, SSH, certificats
- VACUUM | (commande PostgreSQL) | Nettoie et optimise le stockage des données | Interagit avec PostgreSQL, les sauvegardes, la maintenance

### Banque de questions du module (15)
1. QCM: un certificat TLS auto-signé est acceptable pour... A) la production B) un environnement de lab/test C) une banque
2. QCM: fail2ban protège contre... A) les attaques par brute force B) les pannes disque C) la latence réseau
3. QCM: un script de déploiement automatisé permet de... A) reproduire l'infra rapidement B) remplacer les backups C) supprimer les logs
4. Ouverte: pourquoi séparer l'installation (étape par étape) de l'automatisation (script) ?
5. Ouverte: quel est l'intérêt d'un certificat TLS même en interne ?
6. Cas: le serveur DB refuse les connexions depuis le web. Diagnostic ?
7. QCM: un agent de supervision est... A) un logiciel qui collecte les métriques B) un antivirus C) un firewall
8. Ouverte: pourquoi configurer les sauvegardes automatiques dès le déploiement ?
9. Cas: après déploiement, le dashboard de supervision est vide. Causes possibles ?
10. QCM: Prometheus collecte les métriques via... A) un pull HTTP B) des emails C) des SMS
11. Ouverte: différence entre un script bash et un playbook Ansible pour le déploiement.
12. Cas: le déploiement automatisé échoue à l'étape 3. Comment déboguer ?
13. QCM: objectif du module 2 = A) déployer une infra complète et fonctionnelle B) installer un seul service C) lire sans pratiquer
14. Ouverte: comment documenter un déploiement pour qu'un collègue puisse le reproduire ?
15. QCM: résultat attendu = A) 4 serveurs opérationnels, sécurisés et supervisés B) 1 serveur à moitié configuré C) aucune vérification

---

## 3) Tests de validation — fonctionnels, sécurité, incidents (3h)

### Objectifs d'apprentissage
- Valider que l'infrastructure répond aux exigences fonctionnelles.
- Tester la sécurité (pare-feu, accès, durcissement) par des tests négatifs.
- Simuler des incidents et vérifier que la supervision les détecte.
- Mesurer le temps de détection et de résolution (MTTD/MTTR).
- Produire un rapport de validation synthétique.

### Contenu pédagogique
Une infrastructure non testée est une infrastructure non fiable. Les tests de validation sont la preuve que tout fonctionne comme prévu.

Points clés:
1. **Tests fonctionnels** : lister tous les scénarios d'usage et les tester un par un. Utilisateur accède au site web en HTTPS → OK. L'application web interroge la base de données → OK. L'admin se connecte en SSH → OK. Les utilisateurs s'authentifient via AD → OK. La supervision affiche les métriques → OK.
2. **Tests de sécurité** : tester les scénarios de blocage. Connexion SSH depuis une IP non autorisée → bloquée. Connexion directe à la DB depuis l'extérieur → bloquée. Scan de ports depuis l'extérieur → seuls 80/443 visibles. Brute force SSH → bloqué par fail2ban après N tentatives. Ces tests négatifs sont aussi importants que les tests positifs.
3. **Simulation d'incidents** : scénario 1 — arrêter le serveur web et vérifier que la supervision déclenche une alerte en moins de 2 minutes. Scénario 2 — remplir le disque du serveur DB à 85% et vérifier l'alerte. Scénario 3 — couper la connectivité réseau entre web et DB et vérifier l'impact utilisateur (l'appli renvoie une erreur propre, pas un crash).
4. **Mesures MTTD/MTTR** : Mean Time To Detect (temps entre le début de l'incident et la détection par supervision). Mean Time To Repair (temps entre la détection et la résolution). Noter ces temps pour chaque incident simulé. Objectif : MTTD < 5 min, MTTR < 15 min pour les incidents simples.
5. **Rapport de validation** : document qui liste tous les tests effectués, leur résultat (OK/KO), et les anomalies corrigées. C'est la preuve que l'infrastructure est prête pour la production.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : exécuter les 5 tests fonctionnels principaux et documenter les résultats dans un tableau (test, résultat, commentaire).
   - **Corrigé détaillé** : Tableau : 1) Accès HTTPS → OK (code 200, page chargée). 2) Connexion web→DB → OK (requête SQL exécutée, données retournées). 3) SSH admin → OK (connexion établie). 4) Dashboard supervision → OK (4 serveurs visibles, métriques à jour). 5) Authentification AD → OK (utilisateur test peut se connecter). Tout résultat KO doit être suivi d'une action corrective et d'un re-test.
2. **Exercice 2 (intermédiaire)** : simuler l'incident "serveur web down" et mesurer le MTTD et le MTTR. Documenter la timeline et les actions.
   - **Corrigé détaillé** : `systemctl stop nginx` à T=0. Vérifier l'heure de déclenchement de l'alerte supervision → T=1min30. MTTD = 1min30 ✅ (< 5min). Actions : `systemctl start nginx`, vérifier que le service répond → T=3min. MTTR = 1min30 ✅ (< 15min). Documenter : "Incident simulé : arrêt nginx. Détection : alerte Prometheus 'Nginx down' à T+1min30. Résolution : redémarrage service, vérification fonctionnelle à T+3min. Conclusion : MTTD et MTTR dans les objectifs."
3. **Exercice 3 (avancé)** : rédiger le rapport de validation complet incluant : introduction, tests fonctionnels (tableau), tests de sécurité (tableau), simulations d'incidents (timeline + MTTD/MTTR), anomalies et corrections, conclusion.
   - **Corrigé détaillé** : Rapport structuré : 1) Introduction (objet du rapport, périmètre testé). 2) Tests fonctionnels (5 tests, tous OK après correction de l'erreur de config TLS initiale). 3) Tests de sécurité (4 tests, tous OK — brute force bloqué après 5 tentatives). 4) Simulations d'incidents (3 scénarios avec MTTD/MTTR : 1min30/1min30, 2min/5min, 3min/10min). 5) Anomalies corrigées (TLS mal configuré au premier déploiement → corrigé). 6) Conclusion (infrastructure validée, prête pour la mise en production simulée). Ce rapport est une preuve portfolio de niveau professionnel.

### Nouvelles abréviations rencontrées
- MTTD | Mean Time To Detect | Temps moyen de détection d'un incident | Interagit avec la supervision, les alertes, les SLA
- MTTR | *(déjà défini)* | Temps moyen de réparation | Interagit avec MTTD, la supervision, les procédures de résolution

### Banque de questions du module (15)
1. QCM: un test de validation sert à... A) prouver que tout fonctionne B) faire joli C) perdre du temps
2. QCM: un test négatif vérifie que... A) les actions interdites sont bien bloquées B) tout est autorisé C) rien ne marche
3. QCM: MTTD signifie... A) Mean Time To Detect B) Maximum Time To Delete C) Minimum Test Time Duration
4. Ouverte: pourquoi les tests de sécurité sont-ils aussi importants que les tests fonctionnels ?
5. Ouverte: différence entre MTTD et MTTR.
6. Cas: l'alerte "service down" ne se déclenche pas alors que le service est arrêté. Diagnostic ?
7. QCM: un rapport de validation doit inclure... A) tous les tests, leurs résultats, et les anomalies B) uniquement les succès C) rien
8. Ouverte: que faire si un test échoue pendant la validation ?
9. Cas: MTTR mesuré à 25 minutes pour un incident simple. Problème ?
10. QCM: simuler un incident permet de... A) valider les procédures avant un vrai incident B) casser volontairement la prod C) ignorer les risques
11. Ouverte: comment améliorer le MTTD ?
12. Cas: un test de sécurité montre que le port 22 est ouvert depuis l'extérieur. Action ?
13. QCM: objectif du module 3 = A) valider que l'infrastructure est fiable et sécurisée B) déployer sans tester C) faire confiance au hasard
14. Ouverte: comment présenter un rapport de validation en entretien ?
15. QCM: résultat attendu = A) infrastructure validée avec preuves B) tests non faits C) anomalies ignorées

---

## 4) Documentation et portfolio (2h)

### Objectifs d'apprentissage
- Produire un dossier technique complet et professionnel.
- Rédiger des SOP pour les procédures clés (déploiement, sauvegarde, incident).
- Synthétiser les acquis P3-A en un récit de compétences pour le portfolio.
- Préparer un argumentaire "admin système junior prêt à l'emploi".

### Contenu pédagogique
La documentation est ce qui transforme un projet technique en preuve de compétence professionnelle. Sans documentation, ton travail est invisible.

Points clés:
1. **Dossier technique P3-A** : document unique (5-10 pages) rassemblant : schéma d'infrastructure, design document, matrice de flux, procédures de déploiement, SOPs clés (sauvegarde, incident disque plein, restart service), rapport de validation, leçons apprises. Ce dossier est la pièce maîtresse de ton portfolio P3-A.
2. **SOPs à produire** : 3 procédures opérationnelles standards — (a) Déploiement complet de l'infrastructure (prérequis, étapes, vérification, rollback), (b) Restauration d'une sauvegarde base de données (quand, comment, validation), (c) Réponse à l'incident "disque saturé" (détection, diagnostic, résolution, prévention).
3. **Synthèse des compétences** : lister tout ce que tu as appris et pratiqué pendant P3-A (J12 à J17). Linux avancé, Windows Server/AD, virtualisation/Docker, sécurité (durcissement, accès, incidents), supervision/ITSM, conception d'infrastructure. Pour chaque compétence, une preuve concrète (schéma, capture, script, rapport).
4. **Portfolio** : sélectionner les 3 meilleures preuves P3-A à publier — le design document, le dashboard de supervision, le rapport de validation. Ajouter un texte d'accompagnement expliquant le contexte, les décisions techniques, et l'impact.
5. **Argumentaire employabilité** : préparer un pitch de 2 minutes qui résume P3-A. "J'ai conçu et déployé une infrastructure complète pour une PME de 50 personnes : 4 serveurs (Linux et Windows), services web, base de données, Active Directory, supervision. J'ai appliqué les principes de sécurité (durcissement, moindre privilège, réponse aux incidents) et documenté l'ensemble. Résultat : une infrastructure reproductible en 10 minutes, supervisée, et validée par des tests fonctionnels et de sécurité."

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : compiler les 5 meilleures preuves P3-A (captures, schémas, scripts) dans un dossier structuré.
   - **Corrigé détaillé** : Créer un dossier `preuves-p3a/` contenant : 01-schema-infra.png, 02-design-document.pdf, 03-dashboard-supervision.png, 04-rapport-validation.pdf, 05-deploy-infra.sh. Chaque fichier est nommé clairement et prêt à être intégré dans le portfolio. Ajouter un README.md listant les fichiers avec une phrase de contexte pour chacun.
2. **Exercice 2 (intermédiaire)** : rédiger la SOP "Réponse à l'incident disque saturé" en 1 page. Inclure : déclencheur (alerte supervision), diagnostic (commandes, interprétation), résolution (action, vérification), prévention (mesure durable).
   - **Corrigé détaillé** : SOP structurée : Titre "INC-SOP-001 — Disque saturé". Déclencheur : alerte "Disque > 85%". Diagnostic : `df -h` (identifier la partition), `du -sh /* 2>/dev/null | sort -rh | head -10` (trouver les gros répertoires), `lsof | grep deleted` (fichiers supprimés mais encore ouverts). Résolution : nettoyer les logs (`journalctl --vacuum-size=500M`), supprimer les fichiers temporaires, redémarrer le service qui maintient des fichiers deleted ouverts. Validation : `df -h` montre < 80%, l'alerte se résout. Prévention : configurer logrotate, ajouter une alerte à 80%, planifier un audit disque mensuel.
3. **Exercice 3 (avancé)** : rédiger le dossier technique complet P3-A (5-10 pages). Inclure toutes les sections : conception, déploiement, sécurité, supervision, validation, SOPs, leçons apprises.
   - **Corrigé détaillé** : Dossier structuré avec table des matières. Sections : 1) Résumé exécutif. 2) Conception (schéma, dimensionnement, adressage, matrice de flux). 3) Déploiement (services installés, configurations clés, script d'automatisation). 4) Sécurité (durcissement, pare-feu, accès, fail2ban). 5) Supervision (dashboard, métriques, alertes). 6) Validation (tests fonctionnels, sécurité, incidents simulés, MTTD/MTTR). 7) SOPs (déploiement, sauvegarde, incident disque). 8) Leçons apprises (ce qui a bien marché, ce qui a été difficile, ce qu'on ferait différemment). Ce dossier est ta preuve portfolio ultime pour P3-A.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: la documentation sert à... A) prouver et transmettre les compétences B) remplir du papier C) cacher les erreurs
2. QCM: une SOP doit être... A) actionnable et testable B) vague et générale C) secrète
3. QCM: le portfolio P3-A doit montrer... A) des preuves concrètes B) uniquement du texte C) rien
4. Ouverte: pourquoi documenter même un petit projet personnel ?
5. Ouverte: que doit contenir une SOP minimale ?
6. Cas: un recruteur te demande "Montrez-moi une preuve de ce que vous savez faire". Que montres-tu ?
7. QCM: le dossier technique P3-A est... A) la synthèse de toutes les compétences P3-A B) un brouillon C) optionnel
8. Ouverte: pourquoi inclure des "leçons apprises" dans le dossier technique ?
9. Cas: tu as 2 minutes pour convaincre un recruteur que tu es prêt pour un poste d'admin junior. Que dis-tu ?
10. QCM: une preuve de compétence solide = A) un livrable concret commenté B) une promesse C) un CV vide
11. Ouverte: comment organiser ton portfolio pour qu'un recruteur trouve l'info en 30 secondes ?
12. Cas: le script de déploiement est fonctionnel mais pas commenté. Amélioration ?
13. QCM: objectif du module 4 = A) transformer le travail technique en preuves employables B) cacher son travail C) improviser en entretien
14. Ouverte: indicateur de succès P3-A pertinent ?
15. QCM: résultat P3-A réussi = A) dossier technique complet + portfolio enrichi B) rien documenté C) quelques notes éparses

---

## 5) Banque de questions + suivi P1 (1h)

### Objectifs d'apprentissage
- Valider l'ensemble des acquis P3-A en format test cumulatif.
- Finaliser le portfolio P3-A et la stratégie candidature.
- Planifier la transition vers P3-B (analyse de données).

### Contenu pédagogique
- 30 min test cumulatif P3-A (J12 à J17).
- 15 min correction et bilan P3-A.
- 15 min plan J18 (premier jour P3-B).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : lister les 5 compétences principales acquises en P3-A et la preuve associée pour chacune.
   - **Corrigé détaillé** : 1) Admin Linux avancé → script de durcissement. 2) Windows Server/AD → capture AD avec OUs et GPO. 3) Virtualisation/Docker → docker-compose.yml + SOP déploiement. 4) Sécurité → rapport d'incident + RCA. 5) Supervision/ITSM → dashboard + ticket documenté.
2. **Exercice 2 (intermédiaire)** : rédiger le pitch "admin système junior prêt à l'emploi" en 90 secondes.
   - **Corrigé détaillé** : "En 6 jours de projet intensif, j'ai conçu, déployé et sécurisé une infrastructure complète pour 50 utilisateurs : serveurs Linux et Windows, Active Directory, base de données, supervision. J'ai appliqué les bonnes pratiques de sécurité, géré des incidents simulés, et documenté l'ensemble. Je suis opérationnel pour administrer des serveurs, diagnostiquer des pannes, et appliquer les procédures ITIL dès le premier jour."
3. **Exercice 3 (avancé)** : plan J18 en 3 priorités mesurables pour démarrer P3-B (statistiques appliquées).
   - **Corrigé détaillé** : 1) Comprendre les statistiques descriptives de base (moyenne, médiane, écart-type, corrélation) et les calculer en Python/Excel. 2) Appliquer ces concepts sur un jeu de données réel (ex: données de vente, logs serveur). 3) Préparer un exemple "j'ai analysé X et découvert Y" pour les entretiens.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: objectif final P3-A = A) compétences admin système junior prouvées B) théorie sans pratique C) aucun livrable
2. Ouverte: quelle est ta plus grande fierté technique après P3-A ?
3. QCM: un portfolio efficace montre... A) des preuves concrètes et contextualisées B) une liste de technologies C) du texte seul
4. Cas: un recruteur te dit "Vous n'avez pas d'expérience en entreprise". Réponse ?
5. Ouverte: quelle compétence P3-A veux-tu approfondir en priorité ?
6. QCM: le passage en P3-B nécessite... A) P3-A validé B) rien C) l'autorisation d'un manager
7. Ouverte: quel livrable P3-A es-tu le plus fier de montrer ?
8. QCM: la remédiation P3-A sert à... A) combler les lacunes avant P3-B B) recommencer tout P3-A C) abandonner
9. Cas: tu te sens faible sur Active Directory. Plan d'action ?
10. QCM: preuve ultime P3-A = A) dossier technique complet B) une seule commande C) un post-it
11. Ouverte: comment expliquer P3-A en une phrase à un non-technique ?
12. Cas: le portfolio est prêt mais tu hésites à le publier. Pourquoi le publier quand même ?
13. QCM: la transition P3-A → P3-B doit être... A) fluide et planifiée B) brutale C) ignorée
14. Ouverte: indicateur global de succès P3-A ?
15. QCM: résultat P3-A atteint = A) portfolio + compétences + confiance en entretien B) rien C) stress inchangé

---

## Validation qualité J17 — Projet de synthèse P3-A (anti-superficiel)

### Livrables obligatoires fin de J17 (ET FIN DE P3-A)
1. **Schéma d'infrastructure** complet (4 serveurs, réseau, flux, sécurité).
2. **Design document** (dimensionnement, adressage, matrice de flux).
3. **Infrastructure déployée et fonctionnelle** (captures + script d'automatisation).
4. **Rapport de validation** (tests fonctionnels, sécurité, incidents, MTTD/MTTR).
5. **Dossier technique P3-A** (5-10 pages, synthèse de tout P3-A).
6. **Portfolio P3-A** mis à jour avec les 3 meilleures preuves.
7. **Pitch admin junior** prêt pour les entretiens (90 secondes).

### Grille d'évaluation rapide (100 points)
- Qualité de la conception (schéma, dimensionnement, flux, justification) : **20 pts**
- Qualité du déploiement (services, configuration, sécurité, automatisation) : **25 pts**
- Qualité de la validation (tests, incidents simulés, MTTD/MTTR) : **20 pts**
- Qualité de la documentation (dossier technique, SOPs, portfolio) : **20 pts**
- Communication et employabilité (pitch, preuves, argumentaire) : **15 pts**

### Seuil attendu
- **>= 80/100** : P3-A validé avec succès, passage en P3-B.
- **65-79/100** : validé sous remédiation ciblée 48h avant P3-B.
- **< 65/100** : consolidation P3-A requise avant passage en P3-B.

### 🏆 FÉLICITATIONS — Fin du Tome P3-A !

Si tu as atteint le seuil de 80/100, tu as complété avec succès la spécialisation **Administration Systèmes et Réseau**. Tu disposes maintenant :
- D'une infrastructure complète documentée et déployable
- De compétences vérifiables en Linux, Windows Server, AD, Docker, sécurité et supervision
- D'un portfolio technique professionnel
- D'un argumentaire solide pour les entretiens d'admin système junior

**Prochaine étape : Tome P3-B — Analyse de données (J18-J22).**

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Conception)
1. **B**
2. **B**
3. **B**
4. Pour la sécurité (un attaquant qui compromet le serveur web n'a pas directement accès aux données), la scalabilité (on peut faire évoluer chaque serveur indépendamment), et la maintenabilité (chaque service a un périmètre clair).
5. Intégrer les considérations de sécurité dès la conception, pas après coup. Exemples : moindre privilège, pare-feu restrictif, chiffrement, supervision dès le jour 1.
6. Conséquences : lenteurs, crashs (OOM killer), swap excessif. Correction : augmenter la RAM ou optimiser l'application (cache, index, code). La supervision aurait dû détecter le problème avant le crash.
7. **A**
8. Pour garantir que les services sont toujours joignables à la même adresse, faciliter la configuration (DNS, pare-feu, supervision), et éviter les problèmes de changement d'IP au redémarrage.
9. Évaluer l'impact (ressources, sécurité, complexité), vérifier si le service est nécessaire, mettre à jour le design document, déployer en test d'abord, mettre à jour la matrice de flux et le pare-feu.
10. **A**
11. "La supervision, c'est comme un détecteur de fumée. On l'installe avant l'incendie, pas après. Le coût est dérisoire comparé au coût d'une panne non détectée."
12. Consolider le serveur de supervision avec le serveur web (ils sont tous deux Linux, charge modérée) — mais documenter le risque (la supervision est moins fiable si le serveur web est la cause de la panne). Alternative : utiliser un SaaS de supervision gratuit (UptimeRobot, Grafana Cloud free tier).
13. **A**
14. "Voici l'infrastructure que j'ai conçue pour 50 utilisateurs. Chaque choix est justifié : séparation web/DB pour la sécurité, AD pour la gestion centralisée, supervision pour la proactivité."
15. **A**

### B. Corrigé — Module 2 (Implémentation)
1. **B**
2. **A**
3. **A**
4. L'installation manuelle permet de comprendre chaque étape. L'automatisation permet de reproduire rapidement et sans erreur. Les deux sont nécessaires : comprendre avant d'automatiser.
5. Même en interne, le chiffrement protège contre l'écoute du trafic réseau (un attaquant qui a compromis une machine du réseau peut capturer les paquets).
6. Vérifier le pare-feu DB (port 5432 autorisé depuis l'IP du web ?), vérifier que PostgreSQL écoute sur l'interface réseau (`listen_addresses = '*'` ou l'IP), vérifier le fichier `pg_hba.conf`.
7. **A**
8. Parce que les données sont le bien le plus précieux. Une sauvegarde configurée tardivement, c'est une sauvegarde qui n'existe pas quand on en a besoin.
9. Vérifier que les agents de supervision sont installés et en cours d'exécution sur les cibles, vérifier la connectivité réseau agent→collecteur, vérifier la configuration des cibles dans Prometheus/Zabbix, vérifier les logs du collecteur.
10. **A**
11. Bash = procédural (étapes séquentielles), non idempotent (relancer le script peut causer des erreurs). Ansible = déclaratif (décrit l'état souhaité), idempotent (relancer le playbook ne change rien si l'état est déjà correct).
12. Lire les logs d'erreur, identifier l'étape qui échoue, corriger la cause, relancer le script (idéalement le script est idempotent et reprend là où il a échoué).
13. **A**
14. Documenter les prérequis, les étapes avec les commandes exactes, les vérifications après chaque étape, et les erreurs courantes avec leurs solutions. L'idéal : un script automatisé bien commenté.
15. **A**

### C. Corrigé — Module 3 (Validation)
1. **A**
2. **A**
3. **A**
4. Parce qu'une infrastructure qui fonctionne mais qui n'est pas sécurisée est une infrastructure compromise. Les tests de sécurité prouvent que les protections (pare-feu, fail2ban, moindre privilège) sont efficaces.
5. MTTD = temps pour détecter l'incident (alerte). MTTR = temps pour le réparer une fois détecté.
6. Vérifier que la sonde de supervision teste le bon critère (port TCP, processus, endpoint HTTP), vérifier que l'alerte est bien configurée avec le bon seuil et la bonne sévérité, vérifier que l'intervalle de vérification est assez court.
7. **A**
8. Diagnostiquer la cause de l'échec, corriger, re-tester. Documenter l'échec et la correction dans le rapport de validation. Un échec documenté et corrigé est une preuve de rigueur.
9. Le MTTR est trop élevé (> 15 min). Investiguer : la procédure de résolution est-elle documentée ? L'outillage est-il adapté ? La personne savait-elle quoi faire ? Améliorer la SOP ou l'automatisation.
10. **A**
11. Améliorer la couverture de supervision (plus de métriques, plus de points de contrôle), réduire l'intervalle de vérification, configurer des alertes plus sensibles (sans créer de bruit), utiliser des notifications push (PagerDuty, Slack).
12. Fermer le port 22 depuis l'extérieur immédiatement. SSH ne doit jamais être exposé sur Internet sans protection (VPN, bastion, IP whitelist). Vérifier si des connexions non autorisées ont eu lieu.
13. **A**
14. "J'ai validé mon infrastructure par 9 tests (fonctionnels, sécurité, incidents). MTTD moyen de 2 minutes, MTTR moyen de 5 minutes. Voici le rapport."
15. **A**

### D. Corrigé — Module 4 (Documentation)
1. **A**
2. **A**
3. **A**
4. Pour transformer l'effort en preuve durable, pour pouvoir reproduire le travail, pour démontrer tes compétences à un recruteur qui n'était pas là.
5. Titre, déclencheur, prérequis, étapes avec commandes, validation, rollback.
6. Le dossier technique P3-A : schéma, design document, dashboard, rapport de validation. "Voici ce que j'ai conçu et réalisé."
7. **A**
8. Pour montrer ta capacité à prendre du recul, à apprendre de tes erreurs, et à t'améliorer — une qualité très recherchée chez un admin système.
9. Le pitch préparé : conception, déploiement, sécurité, supervision. Accroche : infrastructure complète, preuves concrètes, prêt à l'emploi.
10. **A**
11. Page d'accueil avec 3 sections : "Ce que j'ai fait" (schéma), "Comment je l'ai fait" (capture déploiement), "Preuve que ça marche" (rapport validation). Liens cliquables vers les détails.
12. Ajouter des commentaires expliquant chaque section, un en-tête décrivant l'objectif du script, et des messages de log pendant l'exécution pour suivre la progression.
13. **A**
14. Infrastructure déployée et validée + dossier technique complet + pitch prêt pour entretien.
15. **A**

### E. Corrigé — Module 5 (Banque + P1)
1. **A**
2. Réponse personnelle — exemples attendus : "Avoir conçu et déployé une infra de A à Z", "Avoir résolu des incidents de sécurité avec une vraie RCA", "Avoir un dashboard de supervision fonctionnel".
3. **A**
4. "Voici mon portfolio : j'ai conçu et déployé une infrastructure complète pour 50 utilisateurs, avec les mêmes outils utilisés en entreprise. Je suis opérationnel dès le premier jour."
5. Réponse personnelle — exemples : Active Directory (peu pratiqué avant), Docker (approfondir l'orchestration), sécurité (préparer une certification).
6. **A**
7. Réponse personnelle — exemples : dossier technique complet, schéma d'infrastructure, rapport de validation.
8. **A**
9. Refaire les labs AD du J13, déployer un petit domaine de test, pratiquer les GPO et la gestion des utilisateurs, viser la compréhension des concepts plus que la mémorisation.
10. **A**
11. "J'ai construit et protégé l'infrastructure informatique complète d'une PME — des serveurs jusqu'à la supervision."
12. Un portfolio publié, même imparfait, est une preuve concrète pour un recruteur. Il peut être amélioré en continu. Un portfolio non publié est invisible.
13. **A**
14. Score >= 80/100 à la grille de validation + portfolio publié + pitch maîtrisé en 90 secondes.
15. **A**