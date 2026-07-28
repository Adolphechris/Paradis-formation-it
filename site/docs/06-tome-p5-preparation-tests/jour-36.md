# TOME P5 — Jour 36 (14h)

## Découpage horaire opérationnel J36
- Révision P0 — Socle professionnel (bureautique, web, Git, Linux) — **4h**
- Révision P2 — Fondations techniques (Python, SQL, réseaux, Bash) — **6h**
- Banque de questions chronométrée P0-P2 (100 questions, 2h30) — **2h30**
- Correction + analyse des lacunes + suivi P1 — **1h30**

---

## 1) Révision P0 — Socle professionnel (4h)

### Objectifs d'apprentissage
- Consolider les acquis fondamentaux du Tome P0 (J1-J3).
- Identifier et combler les lacunes résiduelles.
- Atteindre un score cible de 90% aux banques P0.

### Synthèse des points clés P0

**Bureautique & Windows :**
- Windows : UAC (contrôle de compte), NTFS (permissions), MMC (console d'administration), Event Viewer (logs système), Gestionnaire des tâches (processus, performance).
- Excel : formules absolues/relatives ($A$1), RECHERCHEV, SOMME.SI, TCD (création, segments, chronologie), graphiques croisés dynamiques, Power Query (import et transformation).
- Word : styles hiérarchiques, table des matières automatique, publipostage (fusion avec Excel), révision (suivi des modifications).
- PowerPoint : masque des diapositives, transitions, animations, mode présentateur.
- Outlook : règles de boîte de réception, signature, calendriers partagés, archives PST, catégories.
- Outils collaboratifs : Teams (canaux, réunions, partage), SharePoint/OneDrive, Google Workspace.
- Gestion de tickets : ITSM, cycle de vie, priorisation P1-P4.

**Web Front-End :**
- HTML5 : structure sémantique (`header`, `nav`, `main`, `article`, `section`, `footer`), formulaires (validation HTML5), attributs `data-*`.
- CSS3 : sélecteurs (classe, ID, attribut, pseudo-classes), spécificité, box model, flexbox (`display: flex`, `justify-content`, `align-items`), grid, media queries (responsive design `@media`).
- JavaScript notions : variables (`let`/`const`), fonctions, objets, tableaux, DOM (`querySelector`, `addEventListener`), événements, fetch/AJAX.

**Git/GitHub :**
- Commandes : `clone`, `add`, `commit` (`-m`), `push`, `pull`, `fetch`, `branch`, `checkout`, `merge`, `log`, `status`, `diff`.
- Workflow : feature branch → PR → review → merge → delete branch.
- Fichiers : `.gitignore`, `README.md`, `LICENSE`.
- Concepts : staging area, HEAD, remote (origin), upstream, fork vs clone.

**Linux :**
- Navigation : `cd`, `ls` (`-la`), `pwd`, `find`, `locate`.
- Fichiers : `cat`, `less`, `head`, `tail`, `touch`, `mkdir`, `cp`, `mv`, `rm`, `chmod` (rwx, 755, 644), `chown`, `ln`.
- Pipes/Redirections : `|`, `>`, `>>`, `<`, `2>`, `&>`, `/dev/null`.
- Processus : `ps aux`, `top`/`htop`, `kill` (signaux), `jobs`, `bg`, `fg`, `nohup`.
- Réseau : `ip a`, `ss -tlnp`, `ping`, `traceroute`, `nslookup`/`dig`, `curl`, `wget`.
- SSH : `ssh user@host`, `scp`, `sftp`, clés SSH (`ssh-keygen`, `~/.ssh/authorized_keys`).
- Gestion paquets : `apt update && apt install`, `yum`, `dpkg`.

### Questions ciblées P0 (40 questions — échantillon test)

**Windows/Bureautique (12 questions)**
1. QCM: UAC sous Windows sert à... A) contrôler l'élévation de privilèges B) accélérer le système C) supprimer des fichiers
2. QCM: NTFS permet... A) les permissions avancées sur les fichiers B) uniquement FAT32 C) rien
3. QCM: un TCD Excel croise... A) lignes et colonnes pour synthétiser des données B) des formules uniquement C) rien
4. Ouverte: différence entre `$A$1` et `A1` dans une formule Excel.
5. Ouverte: à quoi sert le publipostage dans Word ?
6. QCM: MMC est... A) une console d'administration Windows B) un tableur C) un navigateur
7. Ouverte: comment prioriser un ticket P1 vs P4 en ITSM ?
8. QCM: Event Viewer affiche... A) les logs système Windows B) les emails C) les formules Excel
9. Cas: un utilisateur ne peut pas modifier un fichier sur un partage réseau. Diagnostic ?
10. QCM: Outlook permet de créer des... A) règles de boîte de réception B) bases de données C) scripts Python
11. Ouverte: intérêt des segments dans un TCD Excel.
12. QCM: `=RECHERCHEV(A1; B:C; 2; FAUX)` — que fait le paramètre FAUX ?

**Web/Git (14 questions)**
13. QCM: la balise `<nav>` est... A) sémantique pour la navigation B) pour les images C) obsolète
14. QCM: `display: flex` active... A) le modèle flexbox B) le grid C) le float
15. QCM: `git merge` combine... A) deux branches B) deux fichiers C) deux repositories
16. Ouverte: différence entre `git pull` et `git fetch`.
17. Cas: un fichier `.env` a été commité par erreur. Procédure ?
18. QCM: `.gitignore` contient... A) les fichiers à ne pas versionner B) le code source C) les branches
19. Ouverte: à quoi sert une media query CSS ?
20. QCM: `git log --oneline` affiche... A) l'historique condensé B) le code C) les branches
21. Cas: conflit lors d'un `git merge`. Approche ?
22. QCM: une Pull Request sert à... A) proposer des modifications avant merge B) supprimer le repo C) cloner
23. Ouverte: différence entre `class` et `id` en CSS.
24. QCM: `addEventListener('click', fn)` attache... A) un gestionnaire d'événement B) du CSS C) du HTML
25. Ouverte: expliquer le modèle de boîte CSS (content, padding, border, margin).
26. QCM: `fetch('/api/data')` retourne... A) une Promise B) du HTML C) rien

**Linux (14 questions)**
27. QCM: `chmod 755 fichier` donne... A) rwxr-xr-x B) rw-r--r-- C) ---------
28. QCM: `grep "erreur" log.txt` sert à... A) rechercher du texte B) supprimer C) créer
29. QCM: `>` en bash... A) redirige la sortie vers un fichier (écrase) B) ajoute à la fin C) compare
30. Ouverte: différence entre `>` et `>>`.
31. Cas: un service ne démarre pas. Commandes pour diagnostiquer ?
32. QCM: `ps aux` affiche... A) tous les processus B) uniquement root C) rien
33. Ouverte: comment tuer un processus bloqué ?
34. QCM: `ssh user@192.168.1.10` établit... A) une connexion sécurisée B) un transfert de fichier C) rien
35. Cas: espace disque plein. Commandes pour identifier les gros fichiers ?
36. QCM: `apt update` fait... A) la mise à jour de la liste des paquets B) l'installation C) la suppression
37. Ouverte: différence entre `apt update` et `apt upgrade`.
38. QCM: `tail -f /var/log/syslog` affiche... A) les dernières lignes en temps réel B) le début du fichier C) rien
39. Ouverte: comment rechercher tous les fichiers modifiés il y a moins de 7 jours ?
40. QCM: `scp fichier.txt user@host:/chemin/` fait... A) une copie sécurisée vers un serveur distant B) un backup local C) rien

---

## 2) Révision P2 — Fondations techniques (6h)

### Objectifs d'apprentissage
- Consolider Python, SQL, réseaux, et Bash.
- Résoudre des exercices pratiques en temps limité.
- Atteindre un score cible de 85% aux banques P2.

### Synthèse des points clés P2

**Logique & Python (J4-J6) :**
- Algorithmique : modèle IPO (Input-Process-Output), pseudo-code, organigrammes.
- Python base : types (`int`, `float`, `str`, `bool`, `None`), structures (`list`, `dict`, `set`, `tuple`), conditions (`if/elif/else`), boucles (`for`, `while`), compréhensions de liste.
- Fonctions : `def`, paramètres (positionnels, nommés, par défaut, `*args`, `**kwargs`), `return`, portée des variables, lambda.
- Fichiers : `with open() as f`, modes `r`/`w`/`a`, `read()`/`readlines()`/`write()`, CSV (`csv.reader`), JSON (`json.load`/`dump`).
- POO : classes, `__init__`, méthodes, attributs, héritage, `super()`.
- Modules : `import`, `from ... import`, `pip install`, `venv`, `requirements.txt`.
- Qualité : PEP 8, docstrings, `try/except/finally`, `raise`, exceptions personnalisées.
- Structures de données : liste (dynamique, accès O(1)), dict (hashmap, O(1)), set (unicité), tuple (immuable). Complexité Big-O : O(1), O(log n), O(n), O(n²).

**SQL & Bases de données (J7-J8) :**
- DDL : `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`, contraintes (PK, FK, UNIQUE, NOT NULL, CHECK).
- DML : `INSERT`, `UPDATE`, `DELETE`, `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`, `DISTINCT`.
- Agrégation : `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `GROUP BY`, `HAVING`.
- Jointures : `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `FULL OUTER JOIN`, `CROSS JOIN`.
- Fonctions fenêtres : `ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)`, `RANK()`, `DENSE_RANK()`, `LAG()`, `LEAD()`, `SUM() OVER`.
- CTE : `WITH nom AS (SELECT ...) SELECT ... FROM nom`.
- Sous-requêtes : dans `WHERE` (`IN`, `EXISTS`), dans `FROM`, dans `SELECT` (corrélées vs non corrélées).
- Transactions : `BEGIN`, `COMMIT`, `ROLLBACK`, ACID.
- Modélisation : 1NF (atomicité), 2NF (dépendance complète à la clé), 3NF (pas de dépendance transitive), diagrammes ERD.

**Réseaux TCP/IP (J9) :**
- Modèle OSI (7 couches) : Physique, Liaison, Réseau, Transport, Session, Présentation, Application.
- Modèle TCP/IP (4 couches) : Accès réseau, Internet, Transport, Application.
- Protocoles : IP (adressage, routage), TCP (fiable, connexion, 3-way handshake), UDP (non fiable, rapide), ICMP (ping).
- Adressage : IPv4 (32 bits, notation décimale pointée), CIDR (`/24` = 256 adresses), sous-réseaux, masque.
- Services : DNS (port 53, UDP), DHCP (port 67/68), HTTP (80), HTTPS (443), SSH (22), SMTP (25), FTP (21).
- Diagnostic : `ping` (connectivité), `traceroute` (chemin), `nslookup`/`dig` (DNS), `ss` (ports), `tcpdump` (capture).

**Bash & Automatisation (J10) :**
- Scripts : `#!/bin/bash`, variables (`$var`, `${var}`), quotes (simples vs doubles), conditions (`if [ condition ]; then ... fi`), boucles (`for`, `while`), fonctions.
- Paramètres : `$0` (nom script), `$1`-`$9`, `$@` (tous), `$#` (nombre), `$?` (code retour).
- Pipes/Redirections : `|` (chaînage), `>` (écrase), `>>` (ajoute), `2>` (erreur), `&>` (tout), `/dev/null` (poubelle).
- Commandes : `grep`, `awk`, `sed`, `sort`, `uniq`, `wc`, `xargs`, `find`, `cut`, `tr`.
- Planification : `crontab -e` (5 champs : min, heure, jour, mois, jour_semaine), `@reboot`, `*/5 * * * *`.
- Bonnes pratiques : `set -euo pipefail`, variables entre guillemets, vérifier le code retour.

### Questions ciblées P2 (60 questions — échantillon test)

**Python (18 questions)**
1. QCM: `[x*2 for x in range(5)]` retourne... A) [0,2,4,6,8] B) [0,1,2,3,4] C) erreur
2. QCM: une exception se gère avec... A) try/except B) if/else C) for/while
3. Ouverte: différence entre une liste et un tuple.
4. Cas: écrire une fonction qui trouve les doublons dans une liste.
5. QCM: `__init__` est... A) le constructeur B) une variable C) un module
6. QCM: `with open('f.txt', 'r') as f:` — que garantit `with` ? A) la fermeture automatique B) la vitesse C) rien
7. Ouverte: différence entre `*args` et `**kwargs`.
8. Cas: `import json` — écrire le code pour lire un fichier JSON et le transformer en dict.
9. QCM: `lambda x: x*2` est... A) une fonction anonyme B) une classe C) une boucle
10. Ouverte: pourquoi utiliser un environnement virtuel (venv) ?
11. QCM: `pip install` installe... A) un package Python B) un logiciel système C) rien
12. Cas: une fonction recursive cause une RecursionError. Pourquoi et solution ?
13. QCM: `O(1)` signifie... A) temps constant B) temps linéaire C) temps quadratique
14. Ouverte: PEP 8 recommande quelle longueur de ligne max ?
15. Cas: `try: open('fichier.txt') except FileNotFoundError: print('Absent')` — que se passe-t-il si le fichier existe ?
16. QCM: `if __name__ == '__main__':` permet de... A) distinguer import vs exécution directe B) commenter C) boucler
17. Ouverte: différence entre `is` et `==` en Python.
18. QCM: `sorted([3, 1, 2])` vs `[3, 1, 2].sort()` — différence ?

**SQL (16 questions)**
19. QCM: `HAVING` filtre... A) après agrégation (GROUP BY) B) avant agrégation C) comme WHERE
20. QCM: une CTE commence par... A) WITH B) SELECT C) FROM
21. Ouverte: différence entre WHERE et HAVING.
22. Cas: écrire une requête pour trouver les clients sans commande.
23. QCM: `LEFT JOIN` garde... A) toutes les lignes de la table gauche B) uniquement les correspondances C) rien
24. Ouverte: expliquer les 3 formes normales (1NF, 2NF, 3NF).
25. QCM: `ROW_NUMBER() OVER (PARTITION BY cat ORDER BY prix DESC)` numérote... A) par catégorie B) globalement C) aléatoirement
26. Cas: écrire une requête qui donne le top 3 des ventes par vendeur.
27. QCM: `BEGIN; ... COMMIT;` garantit... A) l'atomicité B) la vitesse C) rien
28. Ouverte: différence entre `RANK()` et `DENSE_RANK()`.
29. QCM: une clé étrangère référence... A) une clé primaire d'une autre table B) un index C) rien
30. Cas: `INSERT INTO users (email) VALUES ('dupont@mail.com')` échoue. Cause probable ?
31. QCM: `SELECT DISTINCT` élimine... A) les doublons B) les NULL C) rien
32. Ouverte: à quoi sert un index dans une base de données ?
33. QCM: `TRUNCATE` vs `DELETE` — différence ?
34. Cas: une table `commandes` avec `client_id` nullable. Signification ?

**Réseaux (14 questions)**
35. QCM: le port standard HTTPS est... A) 443 B) 80 C) 22
36. QCM: DNS traduit... A) un nom de domaine en IP B) une IP en nom C) rien
37. Ouverte: différence entre TCP et UDP.
38. Cas: `ping google.com` fonctionne mais pas le navigateur. Diagnostic ?
39. QCM: un sous-réseau /24 contient... A) 256 adresses B) 128 C) 512
40. Ouverte: décrire le modèle OSI en 7 couches avec un exemple par couche.
41. QCM: `traceroute` montre... A) le chemin des paquets B) la vitesse C) le DNS
42. Cas: une adresse IP 169.254.x.x indique... A) APIPA (pas de DHCP) B) une IP publique C) une erreur
43. QCM: le 3-way handshake TCP est... A) SYN, SYN-ACK, ACK B) ACK, SYN, FIN C) GET, POST, PUT
44. Ouverte: différence entre HTTP et HTTPS.
45. QCM: DHCP attribue... A) une IP dynamiquement B) un DNS C) un firewall
46. Cas: `nslookup monsite.com` retourne NXDOMAIN. Signification ?
47. QCM: `tcpdump` capture... A) les paquets réseau B) les logs système C) les processus
48. Ouverte: comment fonctionne un VPN ?

**Bash (12 questions)**
49. QCM: `$?` contient... A) le code de retour de la dernière commande B) le PID C) rien
50. QCM: `crontab -e`... A) édite les tâches planifiées B) supprime cron C) liste
51. Ouverte: différence entre `>` et `|`.
52. Cas: écrire un script qui vérifie l'espace disque et alerte si > 80%.
53. QCM: `chmod +x script.sh` rend le script... A) exécutable B) lisible C) modifiable
54. Ouverte: à quoi sert `set -e` dans un script Bash ?
55. QCM: `grep -c "erreur" log.txt` retourne... A) le nombre de lignes contenant "erreur" B) le contenu C) rien
56. Cas: `find /var/log -name "*.log" -mtime -7` — que fait cette commande ?
57. QCM: `awk '{print $1}'` extrait... A) la première colonne B) la dernière ligne C) tout
58. Ouverte: différence entre `''` et `""` en Bash.
59. QCM: `sed 's/foo/bar/g'` remplace... A) toutes les occurrences de foo par bar B) la première C) rien
60. Cas: un cron ne s'exécute pas. Quelles vérifications ?

---

## 3) Banque chronométrée P0-P2 (2h30)

### Objectifs
- Simuler les conditions réelles d'un test technique.
- 100 questions en 2h30 (moyenne 1 min 30/question).
- Format : 60% QCM, 25% questions ouvertes courtes, 15% cas pratiques.

### Consignes
- Chronomètre lancé. Pas de documentation externe (simule un vrai test).
- Noter les questions non répondues ou devinées pour analyse post-test.
- Objectif : score >= 80% (80/100).

### Déroulement
1. **0h-1h15** : Bloc 1 — P0 (40 questions QCM/ouvertes/cas).
2. **1h15-2h30** : Bloc 2 — P2 (60 questions QCM/ouvertes/cas).
3. Pause 5 minutes entre les blocs.

### Méthode de réponse
- QCM : éliminer les options impossibles, choisir la meilleure.
- Questions ouvertes : réponse concise (2-5 lignes max).
- Cas pratiques : identifier le problème → proposer une solution → vérifier.

---

## 4) Correction + analyse des lacunes + suivi P1 (1h30)

### Objectifs
- Corriger les 100 questions avec le corrigé détaillé.
- Identifier les domaines faibles (score < 70% sur un module).
- Planifier la remédiation ciblée avant J37.

### Méthode d'analyse
1. Calculer le score par module : Bureautique (/12), Web/Git (/14), Linux (/14), Python (/18), SQL (/16), Réseaux (/14), Bash (/12).
2. Identifier les 2 modules les plus faibles.
3. Revoir les fiches de révision correspondantes dans les tomes P0/P2.
4. Ref aire 10 questions ciblées sur ces modules faibles.

### Correction rapide (extrait — corrigés complets des 100 questions)

**Bureautique :** 1A, 2A, 3A, 4-relative change quand on copie, absolue reste fixe, 5-fusion documents type + source données, 6A, 7-impact × urgence, 8A, 9-vérifier permissions NTFS + partage, 10A, 11-filtrage interactif multi-graphiques, 12-cherche la valeur exacte (FAUX).

**Web/Git :** 13A, 14A, 15A, 16-fetch télécharge sans merger, pull = fetch + merge, 17-git rm --cached + .gitignore + commit + push, 18A, 19-adapter le style selon la taille d'écran, 20A, 21-résoudre les conflits manuellement puis git add + git commit, 22A, 23-class réutilisable, id unique, 24A, 25-content (contenu), padding (marge interne), border (bordure), margin (marge externe), 26A.

**Linux :** 27A, 28A, 29A, 30-> écrase, >> ajoute, 31-systemctl status, journalctl -u, 32A, 33-kill -9 PID, 34A, 35-du -sh /* | sort -rh | head, 36A, 37-update = liste, upgrade = installation, 38A, 39-find / -mtime -7, 40A.

**Python :** 1A, 2A, 3-liste mutable, tuple immuable, 4-`[x for x in set(l) if l.count(x)>1]`, 5A, 6A, 7-*args tuple, **kwargs dict, 8-`with open() as f: data = json.load(f)`, 9A, 10-isoler les dépendances, 11A, 12-pas de condition d'arrêt → boucle infinie → ajouter condition, 13A, 14-79 caractères, 15-le fichier s'ouvre normalement (le except n'est pas déclenché), 16A, 17-is = identité, == = égalité, 18-sorted retourne une nouvelle liste, .sort() modifie en place.

**SQL :** 19A, 20A, 21-WHERE avant GROUP BY, HAVING après, 22-`SELECT * FROM clients LEFT JOIN commandes ON ... WHERE commandes.id IS NULL`, 23A, 24-1NF atomique, 2NF dépendance complète à la PK, 3NF pas de dépendance transitive, 25A, 26-`SELECT * FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY vendeur ORDER BY ca DESC) r FROM ventes) WHERE r <= 3`, 27A, 28-RANK crée des trous (1,2,2,4), DENSE_RANK sans trou (1,2,2,3), 29A, 30-contrainte UNIQUE ou NOT NULL violée, 31A, 32-accélérer les recherches, 33-TRUNCATE supprime tout sans journalisation, DELETE peut avoir WHERE, 34-le client est optionnel (ex: prospect).

**Réseaux :** 35A, 36A, 37-TCP fiable orienté connexion, UDP rapide non fiable, 38-DNS fonctionne (ping) mais le port 80/443 est bloqué par un pare-feu, 39A, 40-Physique (Ethernet), Liaison (MAC), Réseau (IP), Transport (TCP), Session (NetBIOS), Présentation (TLS), Application (HTTP), 41A, 42A, 43A, 44-TLS chiffre la communication, 45A, 46-domaine inexistant, 47A, 48-tunnel chiffré entre 2 points via un réseau public.

**Bash :** 49A, 50A, 51-> redirige vers fichier, | chaîne vers commande, 52-`#!/bin/bash; usage=$(df / | awk 'NR==2{print $5}' | sed 's/%//'); if [ $usage -gt 80 ]; then echo "Alerte disque"; fi`, 53A, 54-stopper le script si une commande échoue, 55A, 56-trouve les fichiers .log modifiés dans les 7 derniers jours, 57A, 58-simples = pas d'interprétation, doubles = interprétation des variables, 59A, 60-vérifier `crontab -l`, les logs cron, le PATH.

---

## Validation qualité J36 (anti-superficiel)

### Livrables obligatoires fin de J36
1. 100 questions P0-P2 corrigées et scorées.
2. 1 rapport d'analyse des lacunes (modules faibles identifiés).
3. 1 plan de remédiation ciblée pour les 2 modules les plus faibles.
4. Score global >= 80%.

### Grille d'évaluation rapide (100 points)
- Score bloc P0 (40 questions) : **40 pts** (1 pt/question)
- Score bloc P2 (60 questions) : **60 pts** (1 pt/question)

### Seuil attendu
- **>= 80/100** : J36 validé, passage normal J37.
- **65-79/100** : remédiation ciblée sur les modules < 70%.
- **< 65/100** : révision approfondie P0-P2 avant de continuer.

### 🎯 Prochaine étape : J37 — Révision P3-A/P3-B (admin sys, sécurité, data).

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

