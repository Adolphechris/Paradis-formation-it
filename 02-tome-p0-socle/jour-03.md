# TOME P0 — Jour 03 (14h)

## Découpage horaire officiel (à respecter)
- Linux (Ubuntu) — ligne de commande — **5h**
- Linux — usage courant avancé — **2h**
- Auto-diagnostic — **2h**
- Projet de fin de Tome P0 — **3h**
- Banque de questions du jour — **1h**
- Suivi P1 (recherche d'emploi, CV, veille) — **30 min**

---

## 1) Linux (Ubuntu) — ligne de commande (5h)

### Objectifs d'apprentissage
- Naviguer efficacement dans le système de fichiers Linux.
- Gérer fichiers, dossiers et permissions de base sans interface graphique.
- Surveiller les processus essentiels et exécuter les commandes de diagnostic courant.
- Installer et mettre à jour des paquets avec une procédure sûre.

### Contenu pédagogique
Linux CLI est une compétence centrale support/admin.  
Le principe: **comprendre où tu es, ce que tu modifies, et avec quels droits**.

1. **Navigation et structure**
   - Commandes de base: `pwd`, `ls`, `cd`, `tree` (si disponible).
   - Chemins absolus vs relatifs.
   - Dossiers clés: `/home`, `/etc`, `/var`, `/tmp`.

2. **Gestion de fichiers**
   - Créer: `touch`, `mkdir`.
   - Copier/déplacer: `cp`, `mv`.
   - Supprimer: `rm`, `rmdir` (avec prudence).
   - Lire: `cat`, `less`, `head`, `tail`.
   - Rechercher: `find`, `grep`.

3. **Permissions et privilèges**
   - Affichage permissions: `ls -l`.
   - Modifier permissions: `chmod`.
   - Modifier propriétaire/groupe: `chown`, `chgrp`.
   - Exécuter en élévation contrôlée avec `sudo`.

4. **Processus et ressources**
   - Voir les processus: `ps`, `top`.
   - Arrêter proprement: `kill <PID>`.
   - Vérifier l’espace disque: `df -h`, `du -sh`.

5. **Paquets et maintenance**
   - Mettre à jour l’index: `sudo apt update`.
   - Installer: `sudo apt install <package>`.
   - Mettre à jour système: `sudo apt upgrade`.
   - Principe: tester et documenter après toute action sensible.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Créer une arborescence `paradis-p0/j3/{docs,scripts,logs}` et y placer 3 fichiers.
   - **Corrigé détaillé** :
     - `mkdir -p paradis-p0/j3/{docs,scripts,logs}` puis `touch` sur chaque dossier.
     - Vérification via `ls -R paradis-p0/j3`.
     - Validation : arborescence exacte, nommage propre.

2. **Exercice 2 (intermédiaire)**  
   Créer un fichier script exécutable uniquement par le propriétaire.
   - **Corrigé détaillé** :
     - `touch backup.sh` puis `chmod 700 backup.sh`.
     - Vérifier `ls -l` => `-rwx------`.
     - Validation : utilisateur courant exécute; autres comptes non.

3. **Exercice 3 (avancé)**  
   Diagnostiquer un disque presque plein et proposer 3 actions correctives.
   - **Corrigé détaillé** :
     - `df -h` pour volume global, `du -sh /var/*` pour zones lourdes.
     - Identifier répertoires/logs volumineux.
     - Proposer: rotation logs, nettoyage cache, archivage contrôlé.
     - Validation : recommandation argumentée, sans suppression aveugle.

### Nouvelles abréviations rencontrées
- PID | Process Identifier | Identifiant unique d'un processus | Interagit avec `ps`, `top`, `kill`, supervision
- UID | User Identifier | Identifiant numérique d’un utilisateur Linux | Interagit avec permissions, `sudo`, gestion comptes
- GID | Group Identifier | Identifiant numérique d’un groupe Linux | Interagit avec permissions, collaboration, sécurité

### Banque de questions du module (15)
1. QCM : `pwd` affiche...  
   A. Les processus B. Le dossier courant C. Le réseau
2. QCM : `chmod 700` signifie...  
   A. Tout le monde en lecture B. Propriétaire tout, autres rien C. Groupe admin
3. QCM : `sudo` sert à...  
   A. Chiffrer disque B. Exécuter avec privilèges élevés C. Créer IP
4. QCM : `df -h` sert à...  
   A. Voir l’espace disque B. Voir les emails C. Voir le DNS
5. Ouverte : Différence entre chemin absolu et relatif.
6. Ouverte : Quand utiliser `grep` dans un diagnostic support ?
7. Mise en situation : Un script ne s’exécute pas. Que vérifies-tu d’abord ?
8. QCM : `PID` désigne...  
   A. Un port réseau B. Un processus C. Un utilisateur
9. Ouverte : Pourquoi éviter `rm -rf` sans vérification ?
10. Mise en situation : Un utilisateur n’a pas accès à un fichier. Procédure ?
11. QCM : `apt update` fait...  
    A. Installe tout B. Met à jour index paquets C. Supprime logs
12. Ouverte : Rôle de `UID` et `GID` en sécurité.
13. QCM : `top` sert surtout à...  
    A. Voir charge système/processus B. Éditer document C. Cloner Git
14. Mise en situation : Tu dois libérer 2 Go rapidement sans risque. Que fais-tu ?
15. Ouverte : Checklist minimale après maintenance Linux.

---

## 2) Linux — usage courant avancé (2h)

### Objectifs d'apprentissage
- Gérer utilisateurs/groupes et accès de base en environnement Linux.
- Utiliser SSH de manière sûre pour accès distant.
- Vérifier la connectivité réseau locale avec des commandes simples.

### Contenu pédagogique
Ce bloc prépare les tâches support/admin réelles.

1. **Utilisateurs et groupes**
   - Ajouter utilisateur: `adduser`.
   - Affecter groupes: `usermod -aG`.
   - Vérifier identité: `id`.

2. **Réseau courant**
   - Vérifier interfaces: `ip a`.
   - Vérifier routes: `ip route`.
   - Tester connectivité: `ping`.

3. **Accès distant sécurisé**
   - SSH pour administration distante.
   - Bonnes pratiques: clés, mot de passe robuste, moindre privilège.
   - Transfert sécurisé de fichiers via SFTP.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Créer un utilisateur `stagiaire03` puis vérifier son UID/GID.
   - **Corrigé détaillé** :
     - `sudo adduser stagiaire03`, puis `id stagiaire03`.
     - UID/GID visibles et cohérents.
     - Validation : compte actif et documenté.

2. **Exercice 2 (intermédiaire)**  
   Ajouter `stagiaire03` au groupe d’un dossier projet et tester accès.
   - **Corrigé détaillé** :
     - Créer groupe dédié, affecter dossier et groupe.
     - `usermod -aG` puis reconnexion.
     - Validation : accès autorisé selon règle groupe.

3. **Exercice 3 (avancé)**  
   Simuler un accès SSH et transférer un fichier test en SFTP.
   - **Corrigé détaillé** :
     - Vérifier service SSH actif.
     - Connexion test puis transfert d’un fichier.
     - Validation : fichier reçu, permissions correctes.

### Nouvelles abréviations rencontrées
- SFTP | SSH File Transfer Protocol | Transfert de fichiers sécurisé sur canal SSH | Interagit avec SSH, sécurité réseau, administration distante

### Banque de questions du module (15)
1. QCM : `id utilisateur` affiche...  
   A. Version Linux B. UID/GID/groupes C. DNS
2. QCM : SSH est utilisé pour...  
   A. Présentation PPT B. Accès distant sécurisé C. Tableur
3. QCM : SFTP est basé sur...  
   A. FTP non chiffré B. SSH C. SMTP
4. Ouverte : Pourquoi gérer les accès par groupe plutôt qu’individuellement ?
5. QCM : `ip a` montre...  
   A. Interfaces réseau B. Commits C. Services cloud
6. Mise en situation : Un utilisateur ne voit pas un dossier partagé. Que vérifies-tu ?
7. Ouverte : Bonnes pratiques minimales avant ouverture SSH.
8. QCM : `usermod -aG` sert à...  
   A. Supprimer user B. Ajouter groupe secondaire C. Changer DNS
9. Mise en situation : SSH refuse la connexion, 3 causes probables ?
10. Ouverte : Quand préférer SFTP à FTP ?
11. QCM : Le moindre privilège signifie...  
    A. Donner admin à tous B. Donner droits minimum nécessaires C. Interdire tout
12. Ouverte : Comment vérifier une route réseau de base sous Linux ?
13. QCM : Quel outil pour tester latence de base ?  
    A. ping B. chmod C. git
14. Mise en situation : Tu dois transférer des logs sensibles, méthode ?
15. Ouverte : Résume un protocole de support Linux à distance.

---

## 3) Auto-diagnostic (2h)

### Objectifs d'apprentissage
- Mesurer objectivement les acquis réels P0 (J1-J3).
- Identifier les lacunes prioritaires avant passage au Tome suivant.
- Construire un plan de remédiation court et exécutable.

### Contenu pédagogique
L’auto-diagnostic évite l’illusion de compétence.

Méthode en 4 étapes:
1. **Inventaire compétences** (Windows, Office, web, Git, Linux).
2. **Preuves** (captures, fichiers, commandes, mini-démos).
3. **Notation** (0=non acquis, 1=fragile, 2=opérationnel autonome).
4. **Plan d’action** (priorité haute/moyenne/basse).

Grille minimale recommandée:
- Poste de travail (Windows/Linux)
- Bureautique pro
- Web front-end
- Git workflow
- Communication/traçabilité support

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Remplir une grille 0/1/2 sur 15 compétences P0.
   - **Corrigé détaillé** :
     - Chaque note doit être justifiée par une preuve.
     - Les items sans preuve restent en 0/1.
     - Validation : grille honnête et exploitable.

2. **Exercice 2 (intermédiaire)**  
   Sélectionner 5 faiblesses critiques et définir 1 action corrective par faiblesse.
   - **Corrigé détaillé** :
     - Priorité basée sur impact test/recrutement.
     - Action mesurable, délai court (24-72h).
     - Validation : plan concret, non théorique.

3. **Exercice 3 (avancé)**  
   Faire une simulation orale de 5 minutes: "ce que je sais faire / ce que je dois renforcer".
   - **Corrigé détaillé** :
     - Discours structuré, factuel, appuyé par preuves.
     - Pas d’exagération de niveau.
     - Validation : message crédible et professionnel.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique (KPI est déjà présent dans l'annexe).

### Banque de questions du module (15)
1. QCM : Un bon auto-diagnostic repose sur...  
   A. Impression personnelle B. Preuves C. Optimisme
2. QCM : Une compétence sans preuve doit être notée...  
   A. 2 B. 1 ou 0 C. 3
3. Ouverte : Pourquoi l’honnêteté du diagnostic est stratégique ?
4. QCM : Priorité de remédiation =  
   A. Ce qui plaît B. Ce qui impacte le test C. Ce qui est facile
5. Mise en situation : Tu te notes haut mais échoues aux exercices. Ajustement ?
6. Ouverte : Donne un exemple de preuve forte en P0.
7. QCM : Un KPI doit être...  
   A. Vague B. Mesurable C. Décoratif
8. Ouverte : Différence entre compétence fragile et opérationnelle.
9. Mise en situation : Tu as 3 lacunes majeures, comment séquencer ?
10. QCM : Le plan correctif doit être...  
    A. Sans date B. Daté et mesurable C. Théorique
11. Ouverte : Pourquoi présenter ses faiblesses peut renforcer la crédibilité ?
12. QCM : Un diagnostic utile se fait...  
    A. Une fois B. Régulièrement C. Jamais
13. Mise en situation : Comment transformer une erreur répétée en progrès ?
14. Ouverte : Donne un format de grille auto-évaluation simple.
15. QCM : Objectif final du diagnostic P0 ?  
    A. Noter pour noter B. Préparer progression réelle C. Justifier un ego

---

## 4) Projet de fin de Tome P0 (3h)

### Objectifs d'apprentissage
- Intégrer les acquis P0 dans un livrable unique présentable en candidature.
- Produire un mini-projet techniquement fonctionnel et documenté.
- Défendre oralement les choix réalisés en 5 minutes.

### Cahier des charges précis du livrable attendu
1. **Mini-site web statique**
   - 3 pages minimum: Accueil, Compétences/Services, Contact.
   - HTML sémantique, CSS responsive, JS pour interaction utile (menu, formulaire, message).
   - Navigation fonctionnelle entre pages.

2. **Dossier bureautique**
   - Word: rapport (contexte, objectifs, méthode, résultats, limites, prochaines actions).
   - Excel: tableau de suivi + formules + TCD + mini-conclusion.
   - PowerPoint: 5 à 8 slides de présentation professionnelle.
   - Export PDF des livrables de diffusion.

3. **Preuves portfolio**
   - Fichiers sources + exports PDF + captures d’écran.
   - Note de synthèse sur difficultés et solutions.

### Critères de réussite (validation)
- Site testable sans erreur bloquante.
- Bureautique complète et structurée.
- Cohérence visuelle et clarté du message.
- Capacité à expliquer le projet sous contrainte temps.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Établir checklist de production avant réalisation.
   - **Corrigé détaillé** :
     - Checklist couvre site, Word, Excel, PPT, exports et preuves.
     - Critères mesurables (fait/non fait).
     - Validation : aucune zone critique oubliée.

2. **Exercice 2 (intermédiaire)**  
   Construire le MVP du mini-site (pages + navigation + style de base).
   - **Corrigé détaillé** :
     - Pages reliées, structure claire, style lisible.
     - Un script JS utile en place.
     - Validation : démonstration fonctionnelle en 2 minutes.

3. **Exercice 3 (avancé)**  
   Préparer un pitch oral technique de 5 minutes avec support PPT.
   - **Corrigé détaillé** :
     - Pitch: problème, solution, preuves, limites, suite.
     - Slides alignées avec preuves réelles.
     - Validation : présentation fluide et crédible.

### Nouvelles abréviations rencontrées
- MVP | Minimum Viable Product | Version minimale fonctionnelle d’un livrable | Interagit avec gestion du temps, priorisation, livrables P0

### Banque de questions du module (15)
1. QCM : Un MVP vise...  
   A. Perfection totale B. Fonctionnalité minimale utile C. Design maximal
2. QCM : Le livrable P0 combine...  
   A. Site seul B. Site + dossier bureautique C. CV uniquement
3. Ouverte : Pourquoi exiger des preuves portfolio dès P0 ?
4. Mise en situation : Le site marche mais le rapport est faible. Risque ?
5. QCM : Critère clé d’un projet P0 validé...  
   A. Promesse B. Fonctionnement démontrable C. Volume de pages
6. Ouverte : Que doit contenir la note de synthèse ?
7. QCM : Le pitch 5 minutes doit prioriser...  
   A. Détails mineurs B. Valeur et preuves C. Théorie abstraite
8. Mise en situation : Tu n’as plus 30 min, que sacrifier en dernier ?
9. Ouverte : Comment arbitrer qualité vs temps sur un MVP ?
10. QCM : Une bonne preuve projet est...  
    A. Déclaration orale B. Fichier + capture + résultat C. Intention
11. Ouverte : Pourquoi la cohérence visuelle compte en entretien ?
12. Mise en situation : On te demande "qu’as-tu appris techniquement ?", réponse ?
13. QCM : Le TCD Excel dans le dossier sert à...  
    A. Décorer B. Analyser/synthétiser C. Compiler JS
14. Ouverte : Critères d’acceptation minimaux d’un mini-site P0.
15. QCM : Le projet P0 est surtout...  
    A. Scolaire B. Preuve employabilité C. Accessoire

---

## 5) Banque de questions du jour (1h)

### Objectifs d'apprentissage
- Vérifier les acquis clés Linux + projet P0 en format court.
- Travailler la précision sous contrainte de temps.
- Décider des priorités de correction immédiate.

### Contenu pédagogique
Format court recommandé:
1. 30 min test mixte.
2. 20 min correction raisonnée.
3. 10 min plan d’ajustement.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Générer 10 questions ciblées Linux/projet.
   - **Corrigé détaillé** :
     - 6 Linux, 4 projet P0.
     - Mélange QCM/ouvert/cas.
     - Validation : couverture des risques de test.

2. **Exercice 2 (intermédiaire)**  
   Corriger et classer erreurs en "connaissance / méthode / pression temps".
   - **Corrigé détaillé** :
     - Classement complet sans zone floue.
     - Action de correction par catégorie.
     - Validation : plan actionnable dans la journée.

3. **Exercice 3 (avancé)**  
   Simuler un mini oral technique (3 min) sur une erreur corrigée.
   - **Corrigé détaillé** :
     - Expliquer cause, correction, prévention.
     - Réponse concise et structurée.
     - Validation : oral compréhensible et crédible.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : Objectif test court J3 ?  
   A. Volume B. Précision C. Hasard
2. Ouverte : Pourquoi corriger le jour même est crucial ?
3. QCM : Erreur sous pression temps se traite par...  
   A. Plus de théorie seule B. Simulations chrono C. Ignorer
4. Mise en situation : Tu confonds permissions Linux, action immédiate ?
5. Ouverte : Comment prouver que tu as corrigé une faiblesse ?
6. QCM : Un mini oral efficace dure...  
   A. 20 min B. 2-3 min claires C. 30 sec vague
7. Ouverte : Donne un exemple d’erreur "méthode".
8. QCM : Priorité après test faible sur Linux ?  
   A. Changer de thème B. Remédiation ciblée C. Pause longue
9. Mise en situation : Tu rates la moitié des QCM réseau. Plan ?
10. Ouverte : Différence entre savoir et savoir démontrer.
11. QCM : Une correction de qualité inclut...  
    A. Réponse finale seule B. Raisonnement + prévention C. Note brute
12. Ouverte : Comment éviter la répétition de la même erreur ?
13. Mise en situation : Quelles 3 données garder dans ton journal d’erreurs ?
14. QCM : Le plus important avant fin J3 ?  
    A. Apparence B. Preuves opérationnelles C. Quantité de notes
15. Ouverte : Quelle décision prendre si une faiblesse majeure persiste ?

---

## 6) Suivi P1 (30 min) — recherche d'emploi, CV, veille

### Objectifs d'apprentissage
- Finaliser une version candidature de base après P0.
- Positionner clairement les preuves du projet P0 dans le CV/profil.
- Préparer une réponse crédible à la question "niveau réel actuel ?".

### Contenu pédagogique
Routine P1 fin P0:
1. 10 min: intégrer projet P0 (site + dossier bureautique) dans CV/profil.
2. 10 min: comparer preuves produites vs exigences de 3 offres cibles.
3. 10 min: préparer argumentaire court d’entretien (forces + axes d’amélioration).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)**  
   Ajouter section "Projet P0" au CV (3 puces factuelles).
   - **Corrigé détaillé** :
     - Puce 1: site statique fonctionnel.
     - Puce 2: analyse Excel/TCD.
     - Puce 3: documentation et présentation.
     - Validation : puces mesurables, sans promesse excessive.

2. **Exercice 2 (intermédiaire)**  
   Rédiger réponse 60 secondes: "Que savez-vous faire aujourd’hui ?"
   - **Corrigé détaillé** :
     - Structure: compétences, preuves, limites, progression.
     - Ton professionnel, précis, honnête.
     - Validation : réponse défendable en entretien.

3. **Exercice 3 (avancé)**  
   Construire mini plan de candidature 7 jours post-P0.
   - **Corrigé détaillé** :
     - Cibles (types postes), volume candidatures, preuves à joindre.
     - Suivi quotidien des retours.
     - Validation : plan réaliste, exécutable.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM : Fin P0, priorité P1 =  
   A. Attendre P3 B. Candidater avec preuves P0 C. Ne rien publier
2. Ouverte : Quelles preuves P0 sont les plus convaincantes ?
3. QCM : Une réponse entretien crédible contient...  
   A. Promesses B. Faits vérifiables C. Généralités
4. Mise en situation : Recruteur doute de ton niveau Linux, réponse ?
5. Ouverte : Pourquoi mentionner aussi tes limites actuelles ?
6. QCM : Plan candidature 7 jours doit être...  
   A. Flou B. Quantifié C. Secret
7. Ouverte : Exemple de puce CV orientée preuve.
8. QCM : Erreur fréquente en CV débutant...  
   A. Trop factuel B. Surestimer compétences C. Citer outils
9. Mise en situation : 0 retour candidature en 5 jours, que ajustes-tu ?
10. Ouverte : Comment relier P0 au poste "Professionnel du numérique" ?
11. QCM : Une preuve technique forte est...  
    A. Projet démontrable B. Déclaration vague C. Diplôme non prouvé
12. Ouverte : Quelle stratégie pour rendre ton profil lisible en 30 secondes ?
13. Mise en situation : Quelle pièce joins-tu en priorité à une candidature ?
14. QCM : Le suivi P1 quotidien sert surtout à...  
    A. Reporter B. Accélérer la conversion vers emploi C. Décorer LinkedIn
15. Ouverte : Quelle action P1 lancer immédiatement après J3 ?
