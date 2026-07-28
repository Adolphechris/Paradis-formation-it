# TOME P3-A — Jour 16 (14h)

## Découpage horaire opérationnel J16
- Supervision (outils, métriques, alertes) — **4h**
- Gestion des incidents et tickets (ITSM, cycle de vie, priorisation) — **4h**
- Résolution avancée d'incidents (RCA, escalade, communication) — **3h**
- Labs supervision + incidents (scénarios réalistes) — **2h**
- Banque de questions + suivi P1 — **1h**

---

## 1) Supervision — outils, métriques, alertes (4h)

### Objectifs d'apprentissage
- Expliquer la différence entre supervision, monitoring et observabilité.
- Identifier les métriques essentielles à superviser (CPU, RAM, disque, réseau, services).
- Configurer une sonde de supervision basique et interpréter une alerte.
- Distinguer les alertes actionnables du bruit.
- Comprendre l'architecture d'un outil de supervision (agent, collecteur, interface).

### Contenu pédagogique
La supervision permet de savoir ce qui se passe sur l'infrastructure avant que les utilisateurs ne le signalent.

Points clés:
1. **Supervision** = vérifier que les systèmes fonctionnent (up/down, seuils). **Monitoring** = collecter des métriques dans la durée pour analyser les tendances. **Observabilité** = comprendre l'état interne d'un système via ses sorties (logs, métriques, traces).
2. **Métriques essentielles** : CPU (usage, iowait), RAM (utilisée, swap), disque (espace, I/O, inodes), réseau (bande passante, paquets perdus, connexions), services (état, temps de réponse), applicatives (erreurs 5xx, latence, requêtes/sec).
3. **Seuils et alertes** : définir des seuils d'avertissement (warning) et critiques (critical). Une alerte doit être **actionnable** — si personne ne sait quoi faire quand elle sonne, c'est du bruit qu'il faut supprimer ou documenter.
4. **Outils courants** : Nagios (supervision traditionnelle, seuils), Zabbix (supervision + monitoring, templates), Prometheus + Grafana (monitoring moderne, métriques, dashboards), Datadog/New Relic (SaaS, observabilité).
5. **Architecture type** : agent installé sur chaque serveur → collecte les métriques → envoie au serveur central → stockage en base de données time-series → interface web (dashboards, alertes).
6. **Bonnes pratiques** : superviser ce qui a un impact métier, pas tout ; configurer des maintenances planifiées pour éviter les fausses alertes ; avoir un dashboard qui montre l'état global en un coup d'œil ; documenter chaque alerte avec la procédure de réponse associée (runbook).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : lister les commandes Linux qui permettent de vérifier manuellement les métriques essentielles (CPU, RAM, disque, réseau). Expliquer quoi regarder dans chaque sortie.
   - **Corrigé détaillé** : CPU → `top` ou `htop` (load average, %CPU, iowait). RAM → `free -h` (used, available — available est plus fiable que free). Disque → `df -h` (espace utilisé, attention aux inodes avec `df -i`), `iostat -x` (I/O disque). Réseau → `ss -tlnp` (ports en écoute), `ip -s link` (paquets, erreurs), `ping` (latence, pertes). Services → `systemctl status <service>`.
2. **Exercice 2 (intermédiaire)** : installer et configurer un agent de supervision simple (Zabbix agent, node_exporter Prometheus, ou check_nrpe Nagios). Vérifier que le collecteur reçoit bien les métriques et configurer une alerte simple (ex: disque > 80%).
   - **Corrigé détaillé** : Installation de l'agent selon l'outil choisi. Vérification de la connectivité agent→collecteur. Configuration d'un item (ex: `vfs.fs.size[/,pused]` dans Zabbix, ou `node_filesystem_avail_bytes` dans Prometheus). Configuration d'un trigger avec seuil warning à 80% et critical à 90%. Test : remplir temporairement le disque avec `dd if=/dev/zero of=/tmp/test bs=1M count=500` → vérifier que l'alerte se déclenche → supprimer le fichier → vérifier que l'alerte se résout (auto-résolution).
3. **Exercice 3 (avancé)** : auditer un ensemble d'alertes existantes (proposées dans l'énoncé : 15 alertes). Identifier les alertes actionnables, le bruit, et celles qui manquent. Proposer un plan de nettoyage et justifier.
   - **Corrigé détaillé** : Exemples d'alertes : "CPU > 70%" (actionnable si prolongé, bruit si pic ponctuel → ajouter une durée minimale de 5 min). "Service X down" (actionnable — critique). "Température salle serveur 28°C" (actionnable si proche du seuil max, sinon warning). "Nombre de connexions DB > 100" (à recaler selon la charge normale). Alertes manquantes : certificat TLS expirant dans < 7 jours, sauvegarde non effectuée depuis 24h, espace disque > 90%. Plan : supprimer 3 alertes jamais déclenchées en 6 mois, ajouter une durée minimale à 4 alertes trop sensibles, ajouter 2 alertes critiques manquantes.

### Nouvelles abréviations rencontrées
- SLA | *(déjà existant, section J)* | Service Level Agreement — la supervision mesure le respect des SLA | Interagit avec les alertes, les rapports de disponibilité, la gouvernance
- SLO | Service Level Objective | Objectif de niveau de service (cible interne mesurable, ex: 99.9% de disponibilité) | Interagit avec SLA, SLI, supervision
- SLI | Service Level Indicator | Indicateur mesuré du niveau de service (ex: taux d'erreurs, latence) | Interagit avec SLO, monitoring, dashboards

### Banque de questions du module (15)
1. QCM: la supervision sert à... A) savoir si les systèmes fonctionnent B) écrire du code C) gérer les mots de passe
2. QCM: un agent de supervision est installé... A) sur chaque serveur supervisé B) uniquement sur le poste admin C) dans le cloud
3. QCM: un seuil "critical" signifie... A) tout va bien B) action urgente requise C) information sans importance
4. Ouverte: différence entre supervision et monitoring.
5. Ouverte: pourquoi une alerte doit-elle être actionnable ?
6. Cas: une alerte "CPU > 80%" se déclenche toutes les nuits à 3h pendant 2 minutes. Action ?
7. QCM: Prometheus est un outil de... A) monitoring et alerting B) traitement de texte C) visioconférence
8. Ouverte: quelles métriques surveiller en priorité sur un serveur de base de données ?
9. Cas: le disque est à 85%. L'alerte warning est déclenchée mais personne n'a reçu de notification. Pourquoi ?
10. QCM: une maintenance planifiée permet de... A) supprimer le serveur B) éviter les fausses alertes C) désactiver la supervision définitivement
11. Ouverte: comment choisir entre Nagios, Zabbix et Prometheus ?
12. Cas: 200 alertes par jour, l'équipe ne les lit plus. Problème et solution ?
13. QCM: un dashboard de supervision doit montrer... A) l'état global en un coup d'œil B) 500 graphiques C) des vidéos
14. Ouverte: comment expliquer la valeur de la supervision à un manager ?
15. QCM: résultat attendu du module 1 = A) mettre en place et interpréter une supervision de base B) installer sans configurer C) ignorer les métriques

---

## 2) Gestion des incidents et tickets — ITSM (4h)

### Objectifs d'apprentissage
- Définir le cycle de vie d'un ticket (ouverture, qualification, traitement, résolution, clôture).
- Prioriser les incidents selon leur impact et leur urgence (matrice impact × urgence).
- Distinguer incident, problème, demande de service et changement (ITIL).
- Utiliser les outils de ticketing (Jira Service Management, ServiceNow, GLPI, Zammad).
- Communiquer efficacement avec les utilisateurs pendant un incident.

### Contenu pédagogique
L'ITSM (IT Service Management) structure la façon dont une équipe IT gère les incidents et les demandes.

Points clés:
1. **Cycle de vie d'un ticket** : Ouverture (par l'utilisateur ou détection automatique) → Qualification (catégorie, priorité, assignation) → Traitement (diagnostic, résolution) → Résolution (solution appliquée) → Clôture (confirmation utilisateur). Une réouverture est possible si la solution n'a pas tenu.
2. **Matrice de priorité** : Priorité = Impact × Urgence. Impact = combien de personnes/services sont touchés (individu, équipe, département, toute l'entreprise). Urgence = à quelle vitesse la situation se dégrade (immédiat, heures, jours). Exemple : un serveur de production down pour tout le monde = impact entreprise × urgence immédiate = priorité critique (P1).
3. **ITIL — les 4 types de tickets** : (a) **Incident** = interruption non planifiée d'un service (ex: serveur down, erreur 500). (b) **Problème** = cause racine inconnue d'un ou plusieurs incidents (ex: fuite mémoire qui cause des crashs récurrents). (c) **Demande de service** = requête standard pré-approuvée (ex: création de compte, accès VPN). (d) **Changement** = modification planifiée de l'infrastructure (ex: mise à jour OS, migration serveur).
4. **Communication utilisateur** : accuser réception rapidement, donner un délai estimé, prévenir si le délai n'est pas tenu, confirmer la résolution et demander validation avant clôture. Un utilisateur informé est un utilisateur patient.
5. **Outils de ticketing** : Jira Service Management, ServiceNow (grandes entreprises), GLPI, Zammad, OTRS (open source). Fonctionnalités communes : création de tickets, assignation, statuts, notifications, SLA, base de connaissances.
6. **Bonnes pratiques** : toujours qualifier avant d'agir, ne pas modifier la priorité sans justification, documenter chaque action dans le ticket (qui a fait quoi et quand), utiliser des modèles de tickets pour les demandes fréquentes, lier les incidents à un problème si un pattern se dégage.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : qualifier et prioriser 3 tickets proposés : (a) "Je n'arrive plus à me connecter à ma session" (1 utilisateur), (b) "Le site web de l'entreprise est down" (tous les clients), (c) "Je voudrais installer le logiciel X" (1 utilisateur). Pour chaque ticket : type ITIL, impact, urgence, priorité.
   - **Corrigé détaillé** : (a) Incident, impact=individu, urgence=élevée (bloquant), priorité=P3 (moyenne). (b) Incident, impact=entreprise/clients, urgence=immédiate, priorité=P1 (critique). (c) Demande de service, impact=individu, urgence=faible (planifiable), priorité=P4 (basse). Expliquer la nuance : un utilisateur bloqué peut sembler urgent pour lui, mais l'impact entreprise est faible → priorité relative.
2. **Exercice 2 (intermédiaire)** : rédiger un ticket d'incident complet pour le scénario "serveur de messagerie lent depuis 30 minutes, 50 utilisateurs impactés". Inclure : titre, description, impact, diagnostic initial, actions entreprises, prochaine étape.
   - **Corrigé détaillé** : Titre : "Serveur SMTP lent — 50 utilisateurs impactés". Description : "Depuis 10h00, les envois d'emails prennent plus de 30 secondes. 50 utilisateurs du service commercial signalés. Aucune erreur visible dans les logs applicatifs." Impact : "Département commercial ralenti, SLA messagerie en risque." Diagnostic initial : "Vérifié CPU (78%), RAM (45%), disque (32%), file d'attente postfix (1200 emails en attente, anormal)." Actions : "Redémarré service postfix, file d'attente descendue à 200. Temps de traitement revenu à 2s." Prochaine étape : "Surveiller la file d'attente pendant 1h. Si la lenteur revient, investiguer la source du pic d'emails (campagne marketing ?)."
3. **Exercice 3 (avancé)** : 5 incidents similaires (lenteur base de données) se sont produits en 2 semaines, tous résolus par redémarrage. Rédiger un ticket "Problème" (ITIL) qui lie ces 5 incidents, proposer une RCA hypothétique, un plan d'investigation, et une solution permanente.
   - **Corrigé détaillé** : Ticket Problème liant les 5 incidents (IDs associés). Description : "Lenteur DB récurrente toutes les 2-3 nuits, résolue temporairement par restart. Pattern : toujours entre 2h et 4h du matin." RCA hypothétique : "Job de sauvegarde nocturne ou tâche cron lourde (VACUUM, rapport batch) qui sature les ressources." Plan d'investigation : vérifier les crons actifs entre 2h et 4h, analyser les slow queries pendant ces périodes (`pg_stat_statements`), vérifier les logs de sauvegarde. Solution proposée : décaler les tâches lourdes hors heures critiques ou les optimiser (VACUUM incrémental, index manquant). Justification : un redémarrage n'est pas une solution — c'est un cache-misère qui repousse le problème.

### Nouvelles abréviations rencontrées
- P1/P2/P3/P4 | Priority 1/2/3/4 | Niveaux de priorité des tickets (P1=critique, P4=basse) | Interagit avec les SLA, l'escalade, la gestion des files d'attente
- ITIL | *(déjà existant, section J)* | Cadre de gestion des services IT | Interagit avec les processus incident/problème/changement, la gouvernance

### Banque de questions du module (15)
1. QCM: un incident ITIL est... A) une interruption non planifiée B) une demande standard C) un changement planifié
2. QCM: la priorité d'un ticket dépend de... A) l'humeur du support B) l'impact × l'urgence C) l'ancienneté du ticket
3. QCM: un ticket "Problème" sert à... A) traiter la cause racine B) remplacer un incident C) ignorer les bugs
4. Ouverte: différence entre incident et problème (ITIL).
5. Ouverte: pourquoi ne pas modifier la priorité d'un ticket sans justification ?
6. Cas: un utilisateur furieux appelle pour un ticket P4. Comment gérer ?
7. QCM: la première étape du cycle de vie d'un ticket est... A) clôture B) ouverture/qualification C) suppression
8. Ouverte: pourquoi documenter chaque action dans le ticket ?
9. Cas: 3 incidents "serveur web down" en une journée. Les traiter en incidents séparés ou en problème ?
10. QCM: un SLA définit... A) le niveau de service attendu B) le prix du matériel C) la couleur des câbles
11. Ouverte: intérêt de lier des incidents à un problème parent.
12. Cas: un ticket P1 est ouvert depuis 4h sans mise à jour. Problème ?
13. QCM: la communication utilisateur pendant un incident doit être... A) régulière et factuelle B) technique et détaillée C) absente
14. Ouverte: comment améliorer la satisfaction utilisateur via l'ITSM ?
15. QCM: résultat attendu du module 2 = A) gérer des tickets de façon structurée et professionnelle B) improviser C) fermer les tickets sans les lire

---

## 3) Résolution avancée d'incidents — RCA, escalade, communication (3h)

### Objectifs d'apprentissage
- Appliquer une méthode structurée de résolution d'incidents (de la détection à la RCA).
- Rédiger une Root Cause Analysis (RCA) complète et actionnable.
- Savoir quand et comment escalader un incident au N2/N3.
- Communiquer efficacement pendant un incident critique (interne et externe).
- Animer un post-mortem court et constructif (blameless).

### Contenu pédagogique
Un incident n'est vraiment terminé que quand la RCA est documentée et que les actions préventives sont planifiées.

Points clés:
1. **Méthode de résolution structurée** : Détection → Qualification (impact, priorité) → Diagnostic (hypothèses, tests) → Résolution (correction) → Validation (test de bon fonctionnement) → RCA (cause racine) → Actions préventives (pour éviter la répétition). Ne jamais s'arrêter à la correction — toujours remonter à la cause racine.
2. **RCA — Root Cause Analysis** : document qui répond à 5 questions : Quoi (description de l'incident), Quand (timeline précise), Comment (cause technique), Pourquoi (cause racine — souvent humaine ou processus, pas seulement technique), Que faire (actions correctives et préventives). Utiliser la méthode des **5 Pourquoi** : poser "pourquoi" 5 fois pour passer du symptôme à la cause racine. Exemple : "Le serveur est down" → Pourquoi ? "Plus d'espace disque" → Pourquoi ? "Les logs n'étaient pas rotés" → Pourquoi ? "Le logrotate était mal configuré" → Pourquoi ? "Pas de procédure de vérification post-déploiement" → Cause racine = absence de procédure.
3. **Escalade** : escalader quand on est bloqué (manque de compétence, de droits, ou d'information). Une escalade doit être **fonctionnelle** (au manager, pour débloquer une ressource) ou **hiérarchique** (à un niveau technique supérieur). Toujours fournir le contexte, les tests déjà effectués, et une demande claire. Ne pas escalader sans avoir tenté un diagnostic minimal.
4. **Communication incident critique** : rôles définis (incident commander, communication lead, technical lead). Messages types : "Incident détecté, équipe mobilisée" (T+5min), "Cause identifiée, correction en cours, ETA 30min" (T+20min), "Service rétabli, surveillance active" (T+45min), "Post-mortem programmé" (T+1h après résolution).
5. **Post-mortem blameless** : réunion post-incident qui se concentre sur les processus et les systèmes, pas sur les personnes. On ne cherche pas un coupable, on cherche ce qui a permis l'erreur. Questions clés : Qu'est-ce qui s'est passé ? Qu'avons-nous appris ? Que changeons-nous pour que ça ne se reproduise pas ?

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : appliquer la méthode des 5 Pourquoi à l'incident "un déploiement a cassé la production un vendredi à 17h".
   - **Corrigé détaillé** : 1) Pourquoi la prod est cassée ? → Le déploiement a introduit une erreur de config. 2) Pourquoi l'erreur n'a pas été détectée ? → Pas de tests en pré-production. 3) Pourquoi pas de tests ? → La procédure de déploiement ne les exige pas. 4) Pourquoi la procédure ne les exige pas ? → Pas de procédure formalisée. 5) Pourquoi pas de procédure ? → L'équipe a grandi vite, les process n'ont pas suivi. Cause racine = absence de procédure de déploiement formalisée avec tests obligatoires.
2. **Exercice 2 (intermédiaire)** : rédiger une RCA pour l'incident "base de données corrompue après une coupure électrique". Inclure timeline, cause technique, cause racine, impact, actions correctives et préventives.
   - **Corrigé détaillé** : RCA structurée : Incident = corruption DB après coupure électrique. Timeline : 14h00 coupure, 14h05 redémarrage serveur, 14h10 DB refuse de démarrer (erreur corruption), 14h15 début restauration backup, 15h30 service rétabli. Cause technique = écritures en cours non flushées sur disque lors de la coupure → corruption WAL PostgreSQL. Cause racine = absence d'onduleur (UPS) sur le serveur DB. Impact = 1h30 d'indisponibilité, aucune perte de données grâce au backup. Correctif immédiat = restore backup + replay WAL. Préventif = installer un UPS avec arrêt propre automatique, activer `full_page_writes=on` si ce n'était pas le cas.
3. **Exercice 3 (avancé)** : rédiger un message d'escalade au N3 pour un incident que tu n'arrives pas à résoudre après 30 minutes de diagnostic. Inclure le contexte, les tests effectués, l'hypothèse, et la demande claire.
   - **Corrigé détaillé** : "Escalade N3 — Incident #1247 — Serveur app-srv-03 inaccessible. Contexte : serveur ne répond plus au ping ni SSH depuis 14h00. Tests effectués : console IPMI accessible (serveur allumé), pas d'erreur hardware, tentatives de redémarrage via IPMI sans effet, le serveur reboot mais ne termine pas le POST. Hypothèse : corruption du bootloader ou panne disque système. Demande : intervention physique en datacenter pour diagnostic console local et éventuel remplacement disque. Logs IPMI joints."

### Nouvelles abréviations rencontrées
- ETA | Estimated Time of Arrival | Temps estimé de résolution (ou de prochaine mise à jour) | Interagit avec la communication incident, les SLA, les utilisateurs
- WAL | Write-Ahead Logging | Journal de transactions écrit avant modification des données | Interagit avec PostgreSQL, la reprise après crash, l'intégrité des données
- UPS | Uninterruptible Power Supply | Onduleur (batterie de secours pour serveurs) | Interagit avec l'alimentation électrique, l'arrêt propre, la protection matérielle

### Banque de questions du module (15)
1. QCM: RCA signifie... A) Root Cause Analysis B) Rapid Connection Access C) Random Code Audit
2. QCM: la méthode des 5 Pourquoi sert à... A) trouver la cause racine B) harceler l'équipe C) accélérer le CPU
3. QCM: escalader un incident signifie... A) le transmettre à un niveau supérieur B) le supprimer C) l'ignorer
4. Ouverte: pourquoi ne jamais s'arrêter à la correction d'un incident ?
5. Ouverte: que doit contenir une escalade efficace ?
6. Cas: un incident critique dure 2h. Aucune communication n'a été envoyée aux utilisateurs. Conséquences ?
7. QCM: un post-mortem blameless se concentre sur... A) les processus, pas les personnes B) trouver un coupable C) supprimer les logs
8. Ouverte: différence entre cause technique et cause racine.
9. Cas: même incident pour la 4e fois. La RCA précédente disait "redémarré le service". Problème ?
10. QCM: un message de communication incident doit être envoyé à... A) T+ jamais B) intervalles réguliers C) seulement à la fin
11. Ouverte: intérêt de définir des rôles (incident commander, communication lead) ?
12. Cas: tu es bloqué depuis 20 min sur un incident, le N2 ne répond pas. Action ?
13. QCM: une RCA complète doit inclure... A) la timeline, la cause, l'impact, les actions B) uniquement la correction C) des excuses
14. Ouverte: comment présenter une RCA en entretien d'embauche ?
15. QCM: résultat attendu du module 3 = A) résoudre des incidents jusqu'à la cause racine B) corriger sans comprendre C) escalader systématiquement sans diagnostiquer

---

## 4) Labs supervision + incidents — scénarios réalistes (2h)

### Objectifs d'apprentissage
- Appliquer une résolution d'incident complète avec supervision et ticketing.
- Corréler une alerte de supervision avec un ticket d'incident.
- Produire une RCA et animer un post-mortem simulé.
- Renforcer les réflexes de communication en situation d'incident.

### Contenu pédagogique
Scénarios de lab :

1. **Scénario A — Alerte disque plein** : la supervision déclenche une alerte "Disque / à 92%". Tâche : diagnostiquer ce qui remplit le disque, libérer de l'espace, résoudre la cause racine (logrotate cassé), documenter dans un ticket.
2. **Scénario B — Service web down + escalade** : l'alerte "Service nginx down" est déclenchée. Tâche : diagnostiquer pourquoi nginx ne démarre pas (port 80 occupé par un processus inconnu), identifier le processus, corriger, documenter, escalader si nécessaire.
3. **Scénario C — Incident critique complet** : un serveur applicatif ne répond plus. Tâche : cycle complet de détection (alerte) → diagnostic → résolution → RCA → communication → post-mortem.

Méthode pour chaque scénario : **alerte → diagnostic → résolution → ticket → RCA → communication**.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : scénario A — résoudre l'incident disque plein, documenter dans un ticket, et identifier pourquoi logrotate n'a pas fonctionné.
   - **Corrigé détaillé** : Diagnostic : `df -h` montre / à 95%, `du -sh /var/log/*` montre /var/log/syslog à 8 Go. Résolution : `logrotate -f /etc/logrotate.conf` pour forcer la rotation, puis vérifier la config logrotate (fichier de config absent ou erreur de syntaxe). Ticket : titre "Disque / saturé — logs non rotés", description avec diagnostic et actions, cause racine = `logrotate` désactivé lors d'une mise à jour. Prévention : ajouter une alerte supervision "logrotate last run > 24h".
2. **Exercice 2 (intermédiaire)** : scénario B — nginx ne démarre pas. Diagnostiquer, résoudre, et rédiger le message d'escalade si le processus qui occupe le port est un service inconnu.
   - **Corrigé détaillé** : `systemctl status nginx` → failed. `journalctl -u nginx` → "bind() to 0.0.0.0:80 failed (98: Address already in use)". `ss -tlnp | grep :80` → processus `python3 /tmp/bot.py` sur le port 80 (suspect). Diagnostic : un processus non autorisé écoute sur le port 80 → potentiel incident de sécurité. Escalade N2 sécurité : stopper le processus, analyser le script, vérifier comment il a été installé, remettre nginx en route. Ticket : incident de sécurité + ticket problème pour l'enquête sur l'intrusion.
3. **Exercice 3 (avancé)** : scénario C — rédiger le rapport post-mortem complet pour un incident "serveur applicatif down 45 minutes". Inclure : timeline, RCA, impact, actions immédiates, actions préventives, leçons apprises.
   - **Corrigé détaillé** : Post-mortem structuré : Résumé (serveur app down 45 min, 200 utilisateurs impactés). Timeline : 09h00 alerte, 09h05 diagnostic début, 09h20 cause identifiée (fuite mémoire suite déploiement), 09h30 rollback, 09h45 service rétabli. RCA : déploiement v2.3 introduisait une fuite mémoire non détectée en pré-prod (pas de test de charge). Impact : 45 min downtime, 0 donnée perdue. Actions : rollback immédiat, ajout de tests de charge dans la CI, alerte supervision "mémoire > 80% pendant 10 min". Leçons : tout déploiement doit inclure un test de charge avant la production.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: un lab intégré J16 simule... A) un incident complet avec supervision et tickets B) un exercice théorique C) un cours sans pratique
2. QCM: face à une alerte disque plein, la première commande est... A) `df -h` B) reboot C) `rm -rf /`
3. QCM: un post-mortem doit être... A) blameless (centré processus) B) centré sur les coupables C) supprimé après lecture
4. Ouverte: pourquoi lier une alerte supervision à un ticket incident ?
5. Ouverte: que faire si une alerte se déclenche mais ne semble pas critique ?
6. Cas: l'alerte dit "Service down" mais le service répond. Fausse alerte ?
7. QCM: une alerte doit inclure... A) un runbook ou une procédure associée B) uniquement un message C) rien
8. Ouverte: différence entre un ticket incident et un ticket problème.
9. Cas: le post-mortem révèle que personne n'était désigné pour communiquer. Correction ?
10. QCM: le but d'un lab incident est de... A) pratiquer la résolution complète B) ignorer les procédures C) cacher les erreurs
11. Ouverte: pourquoi chronométrer chaque étape du diagnostic ?
12. Cas: l'incident est résolu mais la RCA n'est pas faite. Risque ?
13. QCM: objectif du module 4 = A) maîtriser la chaîne complète supervision→ticket→RCA B) seulement lire des docs C) éviter la pratique
14. Ouverte: comment valoriser ces labs en entretien ?
15. QCM: résultat attendu = A) incident tracé de l'alerte au post-mortem B) résolution sans documentation C) ticket vide

---

## 5) Banque de questions + suivi P1 (1h)

### Objectifs d'apprentissage
- Valider les acquis J16 en format test.
- Transformer J16 en preuve employable immédiate.

### Contenu pédagogique
- 40 min test mixte J16.
- 20 min correction + plan J17.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : rédiger une ligne CV intégrant une compétence J16 (supervision ou ITSM).
   - **Corrigé détaillé** : "Mise en place de la supervision serveurs et gestion des incidents via ticketing (détection → RCA → résolution)". Ou "Administration proactive : supervision, alerting, et cycle de vie des tickets ITIL".
2. **Exercice 2 (intermédiaire)** : pitch 60s "Pourquoi la supervision est un investissement, pas un coût".
   - **Corrigé détaillé** : La supervision détecte les problèmes avant les utilisateurs → réduction du downtime → utilisateurs plus productifs → ROI direct. Sans supervision, on découvre les pannes par les utilisateurs → perte de crédibilité, stress, résolution plus lente. Une alerte à 3h du matin évite un incident critique à 9h.
3. **Exercice 3 (avancé)** : plan J17 en 3 priorités mesurables.
   - **Corrigé détaillé** : 1) Synthétiser les acquis P3-A (J12 à J16) en un portfolio cohérent (schéma d'infra, incidents résolus). 2) Réaliser le projet de synthèse (infrastructure documentée sécurisée). 3) Préparer un argumentaire "admin système junior prêt à l'emploi" pour les entretiens.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: objectif final J16 = A) supervision + ITSM opérationnels B) théorie uniquement C) aucun livrable
2. Ouverte: meilleure preuve de compétence supervision à montrer à un recruteur ?
3. QCM: ligne CV ITSM forte = A) action + outil + impact B) "je gère des tickets" C) rien
4. Cas: tu as mis en place une supervision de zéro. Comment le valoriser ?
5. Ouverte: comment relier J16 au poste d'admin système junior ?
6. QCM: plan J17 doit être... A) mesurable B) flou C) optionnel
7. Ouverte: quelle preuve supervision/ITSM publier sur le portfolio ce soir ?
8. QCM: la correction immédiate en supervision sert à... A) ancrer les réflexes de réponse B) repousser C) copier
9. Cas: le recruteur te demande "Comment gérez-vous un incident critique ?"
10. QCM: preuve solide = A) dashboard + RCA + ticket documenté B) promesse C) écran vide
11. Ouverte: pourquoi montrer un dashboard de supervision sur ton portfolio ?
12. Cas: "Vous n'avez jamais utilisé ServiceNow, vous êtes sûr de pouvoir vous adapter ?"
13. QCM: remédiation utile = A) corriger la lacune précise B) recommencer C) abandonner
14. Ouverte: indicateur de progression J16 pertinent ?
15. QCM: résultat P1 réussi = A) portfolio enrichi + CV supervision/ITSM B) rien C) théorie sans preuve

---

## Validation qualité J16 (anti-superficiel)

### Livrables obligatoires fin de J16
1. 1 dashboard de supervision fonctionnel (même minimal) avec au moins 4 métriques et 2 alertes configurées.
2. 3 tickets documentés (1 incident P1, 1 incident P3, 1 problème) avec cycle de vie complet.
3. 1 RCA complète (méthode des 5 Pourquoi) pour un incident critique.
4. 1 post-mortem blameless documenté (1 page).
5. 1 preuve portfolio (dashboard ou RCA anonymisée) + mise à jour CV ligne supervision/ITSM.

### Grille d'évaluation rapide (100 points)
- Maîtrise de la supervision (métriques, alertes, dashboard) : **25 pts**
- Gestion des tickets ITSM (cycle de vie, priorisation, typologie ITIL) : **25 pts**
- Résolution avancée (RCA, escalade, post-mortem, communication) : **25 pts**
- Qualité des labs et de la documentation : **15 pts**
- Communication technique employabilité : **10 pts**

### Seuil attendu
- **>= 80/100** : J16 validé, passage normal J17.
- **65-79/100** : validé sous remédiation ciblée 24h.
- **< 65/100** : consolidation supervision/ITSM requise avant J17.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Supervision)
1. **A**
2. **A**
3. **B**
4. Supervision = vérifier l'état (up/down, seuils). Monitoring = collecter les métriques dans la durée pour analyser les tendances et les patterns.
5. Une alerte non actionnable génère du bruit, habitue l'équipe à ignorer les alertes, et masque les vraies urgences (syndrome du "cri au loup").
6. Identifier la cause (tâche cron nocturne, backup). Si c'est normal et attendu, ajuster le seuil ou la plage horaire de l'alerte, ou créer une maintenance planifiée pour cette plage.
7. **A**
8. Connexions actives, temps de requête moyen, espace disque, réplication (lag), verrous (deadlocks), cache hit ratio.
9. Vérifier que les notifications sont configurées (canal email/Slack/PagerDuty lié à l'alerte) et que l'alerte a bien le bon niveau de sévérité (seules les alertes critical notifient peut-être).
10. **B**
11. Nagios = traditionnel, simple, alertes par seuils. Zabbix = plus complet, templates, auto-découverte. Prometheus = monitoring moderne, métriques, dashboards Grafana, idéal pour environnements cloud-native.
12. Problème = "alert fatigue". Solution : nettoyer les alertes non actionnables, ajuster les seuils, regrouper les alertes liées, documenter chaque alerte avec un runbook.
13. **A**
14. "La supervision permet de détecter les problèmes avant les utilisateurs → moins d'interruptions de service → productivité préservée. C'est comme un détecteur de fumée : on préfère l'entendre tôt que découvrir le feu par les flammes."
15. **A**

### B. Corrigé — Module 2 (ITSM)
1. **A**
2. **B**
3. **A**
4. Incident = interruption non planifiée qu'on corrige. Problème = cause racine inconnue qu'on investigue pour éviter de futurs incidents.
5. Pour maintenir l'intégrité du processus. Une priorité modifiée sans justification fausse les métriques SLA et peut cacher un vrai problème de sous-dimensionnement.
6. Expliquer calmement la priorisation (impact × urgence), assurer que son ticket est pris en charge dans le délai SLA prévu, proposer une solution de contournement si possible.
7. **B**
8. Pour la traçabilité (qui a fait quoi et quand), la reprise par un collègue, l'audit, et la RCA si l'incident se reproduit.
9. Les traiter en incidents (correction immédiate) + ouvrir un ticket problème pour investiguer la cause racine commune aux 3 incidents.
10. **A**
11. Pour avoir une vue d'ensemble, identifier un pattern, justifier l'investissement dans la résolution du problème, et mesurer l'impact cumulé.
12. Problème de communication et de suivi SLA. Un ticket P1 doit avoir des mises à jour régulières (toutes les 15-30 min) et une escalade si pas de progression.
13. **A**
14. Temps de réponse court, communication régulière, résolution dans les délais SLA, demander confirmation avant clôture, base de connaissances pour les problèmes récurrents.
15. **A**

### C. Corrigé — Module 3 (Résolution avancée)
1. **A**
2. **A**
3. **A**
4. Parce qu'une correction sans RCA est un pansement : l'incident va se reproduire. La RCA permet de traiter définitivement le problème.
5. Contexte (serveur, incident), tests déjà effectués, résultats, hypothèse, demande claire (quoi, qui, quand).
6. Perte de confiance des utilisateurs, tickets en doublon, rumeurs, escalade hiérarchique depuis la direction, pression accrue sur l'équipe.
7. **A**
8. Cause technique = ce qui a techniquement causé la panne (ex: disque plein). Cause racine = pourquoi la cause technique a pu se produire (ex: pas de monitoring disque).
9. La RCA précédente n'est pas une vraie RCA — elle documente le symptôme (redémarrage), pas la cause racine. L'incident va continuer à se reproduire.
10. **B**
11. Pour éviter la confusion (qui fait quoi ?), assurer que la communication est faite (sinon personne ne la fait), et permettre au technical lead de se concentrer sur la résolution.
12. Escalader au manager avec le contexte et l'urgence. Si vraiment bloqué, demander un rollback ou une solution de contournement en attendant le N2.
13. **A**
14. "J'ai résolu un incident critique, documenté la cause racine avec la méthode des 5 Pourquoi, et mis en place des actions préventives pour éviter la répétition."
15. **A**

### D. Corrigé — Module 4 (Labs)
1. **A**
2. **A**
3. **A**
4. Pour tracer l'incident de bout en bout, mesurer le temps de résolution, et justifier les actions auprès de l'utilisateur et de l'audit.
5. Vérifier quand même (vérification rapide), qualifier en warning, et si c'est une fausse alerte récurrente, ajuster le seuil ou documenter pourquoi elle peut être ignorée.
6. Vérifier la méthode de test de la sonde (port, processus, requête HTTP) — la sonde teste peut-être la mauvaise chose. Ajuster la sonde pour un test plus réaliste (ex: vérifier le contenu de la réponse HTTP, pas juste le port).
7. **A**
8. Ticket incident = correction immédiate, clôture rapide. Ticket problème = investigation de la cause racine, peut rester ouvert plusieurs jours.
9. Désigner explicitement un "communication lead" dans la procédure incident. Ajouter un champ "Communication envoyée ?" dans le template de ticket incident critique.
10. **A**
11. Pour mesurer le temps de diagnostic, identifier les étapes qui prennent le plus de temps, et optimiser la procédure (runbook, automatisation).
12. L'incident va se reproduire. La connaissance de la correction est perdue si la personne qui l'a résolue quitte l'équipe. Pas de traçabilité pour l'audit.
13. **A**
14. "J'ai traité des incidents complets : de l'alerte de supervision jusqu'au post-mortem, en passant par le diagnostic, la résolution, et la documentation ITIL."
15. **A**

### E. Corrigé — Module 5 (Banque + P1)
1. **A**
2. Un dashboard de supervision configuré + une RCA documentée + un exemple de ticket bien structuré.
3. **A**
4. "J'ai déployé la supervision de zéro : choix de l'outil, configuration des sondes, définition des seuils, mise en place des alertes. Résultat : détection des incidents avant impact utilisateur."
5. L'admin système junior doit superviser ses serveurs, réagir aux alertes, documenter ses interventions dans des tickets, et comprendre le cycle ITIL.
6. **A**
7. Le dashboard de supervision (capture) + la RCA anonymisée d'un incident critique.
8. **A**
9. "Je qualifie l'impact et l'urgence, je diagnostique en parallèle du confinement, je communique régulièrement, je résous, je documente la RCA, et je propose des actions préventives."
10. **A**
11. Ça prouve que tu sais mettre en place une supervision concrète, pas seulement en parler en théorie.
12. "Les principes ITIL et les outils de ticketing partagent les mêmes fondamentaux. Je maîtrise le cycle de vie des tickets, la priorisation, et les SLA. L'outil change, la méthode reste."
13. **A**
14. Temps moyen de résolution (MTTR) + nombre de RCA documentées avec actions préventives implémentées.
15. **A**