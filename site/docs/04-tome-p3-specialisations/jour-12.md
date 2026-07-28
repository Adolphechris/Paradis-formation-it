# TOME P3-A — Jour 12 (14h)

## Découpage horaire opérationnel J12
- Services Linux (systemctl, démarrage, santé service) — **4h**
- Logs Linux (journalctl, syslog, analyse incident) — **3h**
- Permissions & comptes (users/groups/sudo/ACL) — **3h**
- Labs incidents intégrés (services + logs + permissions) — **3h**
- Banque de questions + suivi P1 — **1h**

---

## 1) Services Linux (4h)

### Objectifs d'apprentissage
- Démarrer, arrêter, redémarrer et diagnostiquer un service.
- Lire l’état d’un service et identifier un échec de démarrage.
- Activer/désactiver un service au boot.
- Documenter une action de remédiation reproductible.

### Contenu pédagogique
Un service Linux est un processus géré (web, base de données, supervision).

Points clés:
1. `systemctl status/start/stop/restart`.
2. `enable/disable` pour le démarrage automatique.
3. Différence **incident ponctuel** vs **service qui rechute**.
4. Vérifier après action: état + logs + test fonctionnel.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : vérifier l’état d’un service et interpréter la sortie.  
   - **Corrigé détaillé** : lire statut (`active`, `failed`, `inactive`) et l’horodatage.
2. **Exercice 2 (intermédiaire)** : redémarrer un service en échec puis valider son retour en `active`.  
   - **Corrigé détaillé** : `restart` + `status` + test applicatif.
3. **Exercice 3 (avancé)** : rendre un service persistant au boot et expliquer le choix.  
   - **Corrigé détaillé** : `enable`, vérification, justification métier.

### Nouvelles abréviations rencontrées
- SVC | Service | Processus système géré en continu | Interagit avec supervision, logs, disponibilité applicative

### Banque de questions du module (15)
1. QCM: `systemctl status` sert à... A) supprimer B) observer l’état C) installer  
2. QCM: `enable` signifie... A) démarrage auto B) redémarrage immédiat C) suppression  
3. QCM: service `failed` implique... A) sain B) en échec C) désactivé  
4. Ouverte: pourquoi tester après un restart ?  
5. Ouverte: différence incident ponctuel vs rechute.  
6. Cas: service revient `active` puis retombe. 1re piste ?  
7. QCM: action au boot = ... A) disable B) enable C) reload  
8. Ouverte: quels éléments noter dans le rapport d’intervention ?  
9. Cas: restart OK mais application KO.  
10. QCM: disponibilité service concerne... A) uptime B) couleur terminal C) clavier  
11. Ouverte: pourquoi éviter les actions “au hasard” ?  
12. Cas: deux services liés, lequel vérifier d’abord ?  
13. QCM: validation minimale = A) status seul B) status + test fonctionnel C) ping  
14. Ouverte: comment expliquer une relance à un recruteur ?  
15. QCM: objectif bloc 1 = A) mémoriser commandes B) administrer fiable C) faire du SQL

---

## 2) Logs Linux (3h)

### Objectifs d'apprentissage
- Lire et filtrer les logs pour isoler une cause probable.
- Utiliser `journalctl` avec un périmètre clair (service, temps, niveau).
- Différencier symptôme et cause racine.
- Préparer une escalade technique factuelle.

### Contenu pédagogique
Les logs sont la preuve principale en administration.

Points clés:
1. `journalctl -u <service>` pour un service précis.
2. Fenêtre temporelle (`--since`, `--until`) pour éviter le bruit.
3. Repérer messages critiques/récurrents.
4. Construire une hypothèse **à partir des preuves**.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : afficher les logs d’un service sur 10 minutes.  
   - **Corrigé détaillé** : cibler service + fenêtre temporelle.
2. **Exercice 2 (intermédiaire)** : identifier une erreur répétée et proposer correction.  
   - **Corrigé détaillé** : motif d’erreur, fréquence, action testée.
3. **Exercice 3 (avancé)** : rédiger une escalade N2 basée sur logs.  
   - **Corrigé détaillé** : contexte, preuves, impact, action demandée.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: `journalctl -u` filtre par... A) utilisateur B) service C) port  
2. QCM: `--since` sert à... A) filtrer temps B) redémarrer C) supprimer logs  
3. QCM: un log utile doit être... A) ignoré B) contextualisé C) recopié sans lecture  
4. Ouverte: symptôme vs cause racine ?  
5. Ouverte: pourquoi réduire la fenêtre temporelle ?  
6. Cas: trop de logs, aucune conclusion.  
7. QCM: RCA vise... A) masquer erreur B) cause réelle C) redémarrage systématique  
8. Ouverte: quelles preuves minimales pour escalader ?  
9. Cas: erreur intermittente, que collecter ?  
10. QCM: bonne pratique logs = A) intuition B) preuve C) hasard  
11. Ouverte: pourquoi horodater l’incident ?  
12. Cas: logs propres mais service KO. prochaine vérif ?  
13. QCM: objectif bloc 2 = A) lire vite B) diagnostiquer factuellement C) changer OS  
14. Ouverte: exemple de message d’escalade pro.  
15. QCM: résultat attendu = A) hypothèse prouvée B) opinion C) silence

---

## 3) Permissions & comptes (3h)

### Objectifs d'apprentissage
- Gérer utilisateurs, groupes et droits de fichiers.
- Expliquer les principes de moindre privilège.
- Utiliser permissions standards et ACL sans confusion.
- Corriger un incident d’accès refusé proprement.

### Contenu pédagogique
La sécurité Linux démarre par les permissions.

Points clés:
1. `chmod`, `chown`, `chgrp`.
2. `id`, `groups`, notion UID/GID.
3. `sudo` pour élévation contrôlée.
4. ACL pour droits fins quand le modèle standard ne suffit pas.
5. Principe: donner le **minimum nécessaire**.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : lire les droits d’un fichier et interpréter propriétaire/groupe.  
   - **Corrigé détaillé** : identifier rwx et niveau d’accès.
2. **Exercice 2 (intermédiaire)** : corriger un “Permission denied” sur un dossier partagé.  
   - **Corrigé détaillé** : vérifier ownership + droits + groupe.
3. **Exercice 3 (avancé)** : appliquer ACL ciblée à un utilisateur sans ouvrir le dossier à tous.  
   - **Corrigé détaillé** : droit précis, contrôle d’accès, test utilisateur.

### Nouvelles abréviations rencontrées
- PAM | Pluggable Authentication Modules | Cadre d’authentification Linux modulaire | Interagit avec login, sudo, politiques d’accès
- DAC | Discretionary Access Control | Contrôle d’accès discrétionnaire propriétaire/groupe/autres | Interagit avec chmod/chown/ACL

### Banque de questions du module (15)
1. QCM: `chmod` agit sur... A) propriétaire B) permissions C) processus  
2. QCM: `chown` agit sur... A) ownership B) logs C) réseau  
3. QCM: moindre privilège veut dire... A) tout admin B) strict nécessaire C) accès total  
4. Ouverte: DAC vs ACL en pratique.  
5. Ouverte: pourquoi éviter `777` par défaut ?  
6. Cas: user lit mais ne peut pas écrire, quoi vérifier ?  
7. QCM: `sudo` sert à... A) élévation contrôlée B) désactiver sécurité C) lancer SQL  
8. Ouverte: rôle de PAM.  
9. Cas: groupe correct mais accès encore refusé.  
10. QCM: incident d’accès se traite par... A) hypothèse B) vérifications séquentielles C) reboot  
11. Ouverte: comment prouver que la correction est bonne ?  
12. Cas: accès temporaire requis 24h, approche ?  
13. QCM: objectif bloc 3 = A) ouvrir tout B) sécuriser proprement C) ignorer logs  
14. Ouverte: exemple de politique de droits saine.  
15. QCM: résultat attendu = A) accès maîtrisé B) accès anarchique C) absence de trace

---

## 4) Labs incidents intégrés (3h)

### Objectifs d'apprentissage
- Résoudre des incidents combinant service + logs + permissions.
- Produire un runbook court de résolution.
- Renforcer les réflexes de diagnostic sous contrainte temps.

### Contenu pédagogique
Scénarios de lab:
1. Service web KO après changement permission.
2. Service actif mais inaccessible (mauvais fichier config/rights).
3. Erreur intermittente avec logs bruités.

Méthode:
- Contexte → Hypothèse → Test → Correction → Validation → Note RCA.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : incident permission bloque démarrage service.  
   - **Corrigé détaillé** : lire log, corriger droit ciblé, redémarrer, revalider.
2. **Exercice 2 (intermédiaire)** : incident récurrent toutes les 30 minutes.  
   - **Corrigé détaillé** : corréler horodatage et événement système.
3. **Exercice 3 (avancé)** : produire runbook 1 page de résolution.  
   - **Corrigé détaillé** : étapes, prérequis, rollback, critères succès.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: un lab intégré sert à... A) isoler théorie B) simuler réalité C) éviter pratique  
2. QCM: première étape incident = A) reboot B) cadrer contexte C) modifier hasard  
3. QCM: runbook doit contenir... A) opinions B) étapes testables C) slogans  
4. Ouverte: pourquoi noter rollback ?  
5. Ouverte: intérêt d’une SOP en équipe.  
6. Cas: service KO après changement chmod, action ?  
7. QCM: corrélation temporelle sert à... A) décor B) lier cause/effet C) compresser logs  
8. Ouverte: différence correction locale vs correction durable.  
9. Cas: même bug revient après 2 jours.  
10. QCM: validation finale = A) “ça a l’air bon” B) test prouvé C) silence  
11. Ouverte: quel format minimum pour un runbook ?  
12. Cas: incident critique sans doc existante, que produire ?  
13. QCM: objectif bloc 4 = A) réflexes opérationnels B) mémorisation brute C) théorie pure  
14. Ouverte: comment expliquer ton RCA en entretien ?  
15. QCM: résultat attendu = A) résolution traçable B) patch opaque C) action non vérifiée

---

## 5) Banque de questions + suivi P1 (1h)

### Objectifs d'apprentissage
- Valider les acquis J12 en format test.
- Transformer J12 en preuve employable immédiate.

### Contenu pédagogique
- 40 min test mixte.
- 20 min correction + plan J13.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : écrire une ligne CV “incident Linux résolu”.  
   - **Corrigé détaillé** : action + outil + impact mesurable.
2. **Exercice 2 (intermédiaire)** : pitch 60s “service KO → rétabli”.  
   - **Corrigé détaillé** : symptôme, diagnostic, correction, validation.
3. **Exercice 3 (avancé)** : plan J13 en 3 priorités mesurables.  
   - **Corrigé détaillé** : 2 priorités techniques + 1 communication.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: objectif final J12 = A) théorie B) opérationnel prouvé C) notes seules  
2. Ouverte: meilleure preuve d’un incident résolu ?  
3. QCM: ligne CV forte = A) vague B) action+impact C) buzzword  
4. Cas: bon diagnostic, mauvaise communication recruteur.  
5. Ouverte: comment relier J12 à poste admin junior ?  
6. QCM: plan J13 doit être... A) flou B) mesurable C) optionnel  
7. Ouverte: quelle preuve publier ce soir ?  
8. QCM: correction immédiate sert à... A) oublier B) consolider C) retarder  
9. Cas: stress oral, routine courte ?  
10. QCM: preuve solide = A) capture seule B) logs+actions+résultat C) promesse  
11. Ouverte: pourquoi adapter le vocabulaire au public ?  
12. Cas: incident non reproduit, que faire ?  
13. QCM: remédiation utile = A) vague B) actionnable C) reportée  
14. Ouverte: indicateur de progression J12 pertinent ?  
15. QCM: résultat P1 réussi = A) CV inchangé B) CV/portfolio à jour C) rien

---

## Validation qualité J12 (anti-superficiel)

### Livrables obligatoires fin de J12
1. 3 incidents Linux traités et documentés (service/logs/permissions).  
2. 1 SOP de résolution réutilisable.  
3. 1 note RCA claire pour un incident critique.  
4. 1 preuve portfolio + mise à jour CV.  
5. 1 pitch oral 60-90s prêt entretien.

### Grille d'évaluation rapide (100 points)
- Maîtrise services Linux: **25 pts**
- Analyse logs et diagnostic: **25 pts**
- Gestion permissions et sécurité d’accès: **20 pts**
- Qualité de résolution et traçabilité (SOP/RCA): **20 pts**
- Communication technique employabilité: **10 pts**

### Seuil attendu
- **>= 80/100** : J12 validé, passage normal J13.  
- **65-79/100** : validé sous remédiation ciblée 24h.  
- **< 65/100** : consolidation Linux J12 requise avant J13.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Services)
1. **B**  
2. **A**  
3. **B**  
4. Pour confirmer la disponibilité réelle, pas seulement l’état système.  
5. Ponctuel: se corrige une fois; rechute: cause profonde non traitée.  
6. Vérifier dépendances et logs d’erreur immédiats.  
7. **B**  
8. Contexte, commande, résultat, heure, décision.  
9. Vérifier port, config, permission et dépendances.  
10. **A**  
11. Parce que ça augmente le risque d’aggraver l’incident.  
12. Le service amont dépendant en premier.  
13. **B**  
14. Besoin, action, preuve, impact.  
15. **B**

### B. Corrigé — Module 2 (Logs)
1. **B**  
2. **A**  
3. **B**  
4. Symptôme = ce qu’on voit; cause = origine réelle.  
5. Pour réduire le bruit et isoler l’événement utile.  
6. Cibler service+temps puis rechercher répétitions d’erreurs.  
7. **B**  
8. Horodatage, extrait log, impact, action tentée, demande claire.  
9. Fréquence, plage horaire, corrélation charge/événement.  
10. **B**  
11. Pour corréler avec autres événements système/applicatifs.  
12. Tester config, permissions, connectivité service dépendant.  
13. **B**  
14. Message court structuré avec preuves.  
15. **A**

### C. Corrigé — Module 3 (Permissions)
1. **B**  
2. **A**  
3. **B**  
4. DAC = modèle standard propriétaire/groupe/autres; ACL = droits fins supplémentaires.  
5. Risque sécurité majeur et non conforme au moindre privilège.  
6. Vérifier droits dossier parent + ownership + groupe effectif.  
7. **A**  
8. PAM gère la logique d’authentification et d’autorisation liée à la session.  
9. Vérifier ACL effective et umask/parents.  
10. **B**  
11. Test avec compte cible + preuve d’accès attendu.  
12. ACL ciblée avec échéance et retrait prévu.  
13. **B**  
14. Exemple: groupe projet + droits ciblés + audit régulier.  
15. **A**

### D. Corrigé — Module 4 (Labs intégrés)
1. **B**  
2. **B**  
3. **B**  
4. Pour sécuriser la reprise en cas d’échec de correction.  
5. SOP standardise et accélère la résolution collective.  
6. Restaurer droit minimal correct puis redémarrer et valider.  
7. **B**  
8. Locale: patch ponctuel; durable: cause racine traitée + prévention.  
9. Lancer RCA et ajouter contrôle préventif dans SOP.  
10. **B**  
11. Contexte, prérequis, étapes, validation, rollback.  
12. Produire SOP minimale immédiatement après résolution.  
13. **A**  
14. Cause, preuve, correction, prévention.  
15. **A**

### E. Corrigé — Module 5 (Banque + P1)
1. **B**  
2. Logs + commandes + résultat avant/après.  
3. **B**  
4. Travailler pitch structuré en 4 étapes.  
5. En montrant disponibilité service + résolution incidents + traçabilité.  
6. **B**  
7. Un cas incident documenté complet.  
8. **B**  
9. Respiration 1 min + plan fixe + exemple concret.  
10. **B**  
11. Pour être compris et perçu utile.  
12. Collecter plus de preuves et plan de reproduction.  
13. **B**  
14. Temps moyen de diagnostic + taux de résolution validée.  
15. **B**
