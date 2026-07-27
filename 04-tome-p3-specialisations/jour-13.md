# TOME P3-A — Jour 13 (14h)

## Découpage horaire opérationnel J13
- Windows Server (rôles, administration de base) — **4h**
- Active Directory (notions cœur: domaine, OU, utilisateurs) — **4h**
- Politiques & sécurité (GPO, authentification, accès) — **3h**
- Labs incidents AD/Windows Server — **2h**
- Banque de questions + suivi P1 — **1h**

---

## 1) Windows Server (4h)

### Objectifs d'apprentissage
- Installer/comprendre les rôles principaux d’un serveur Windows.
- Administrer un serveur via outils standards (GUI + PowerShell de base).
- Vérifier l’état d’un service critique et diagnostiquer une panne simple.
- Produire une documentation d’intervention claire.

### Contenu pédagogique
Windows Server sert d’infrastructure (authentification, fichiers, DNS, DHCP, etc.).

Points clés:
1. Rôles courants: AD DS, DNS, DHCP, File Services.
2. Outils: Server Manager, Event Viewer, Services.
3. Bon réflexe: **constat → test → correction → validation**.
4. Toujours lier l’action à un impact métier (accès utilisateur, partage, login).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : lister les rôles installés et leur fonction.
   - **Corrigé détaillé** : rôle, utilité, dépendance principale.
2. **Exercice 2 (intermédiaire)** : service DNS arrêté, le remettre en état.
   - **Corrigé détaillé** : vérifier service, relancer, valider résolution.
3. **Exercice 3 (avancé)** : documenter un incident "utilisateurs ne se connectent plus".
   - **Corrigé détaillé** : symptômes, tests, correction, validation.

### Nouvelles abréviations rencontrées
- AD DS | Active Directory Domain Services | Service d’annuaire Microsoft pour domaines | Interagit avec authentification, GPO, DNS, gestion des comptes

### Banque de questions du module (15)
1. QCM: Windows Server sert surtout à... A) bureautique perso B) services d’infra C) jeux  
2. QCM: AD DS est un rôle de... A) design B) annuaire C) monitoring vidéo  
3. QCM: un incident DNS impacte souvent... A) résolution noms B) clavier C) disque  
4. Ouverte: pourquoi lier intervention et impact métier ?  
5. Ouverte: quelles preuves noter après correction ?  
6. Cas: login utilisateur échoue partout. premier test ?  
7. QCM: service critique se valide par... A) restart seul B) test fonctionnel C) intuition  
8. Ouverte: différence outil GUI vs ligne de commande.  
9. Cas: serveur répond au ping mais service KO.  
10. QCM: objectif bloc 1 = A) apprendre un outil B) administrer de façon fiable C) faire SQL  
11. Ouverte: comment éviter un diagnostic superficiel ?  
12. Cas: incident revient 2 fois/semaine. suite logique ?  
13. QCM: un bon rapport incident contient... A) opinion B) faits horodatés C) slogans  
14. Ouverte: exemple de validation post-correction.  
15. QCM: résultat attendu = A) infra stable B) manip aléatoire C) redémarrages répétés

---

## 2) Active Directory (4h)

### Objectifs d'apprentissage
- Comprendre domaine, contrôleur de domaine, OU et objets AD.
- Créer/organiser des comptes utilisateurs et groupes proprement.
- Expliquer le cycle d’authentification de base en environnement AD.
- Appliquer une structure simple d’administration scalable.

### Contenu pédagogique
AD organise les identités et ressources dans l’entreprise.

Points clés:
1. Domaine = périmètre d’administration centralisé.
2. OU = conteneur logique pour organiser utilisateurs/postes/serveurs.
3. Groupes = levier principal des droits (éviter droits individuels dispersés).
4. DNS est indispensable au fonctionnement AD.
5. Authentification via protocoles d’annuaire/sécurité.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : dessiner une structure AD minimale (OU Users, OU Computers, OU Servers).
   - **Corrigé détaillé** : hiérarchie claire et justification.
2. **Exercice 2 (intermédiaire)** : créer un utilisateur + groupe métier et rattacher correctement.
   - **Corrigé détaillé** : nommage propre, groupe adapté, test d’appartenance.
3. **Exercice 3 (avancé)** : proposer une organisation AD pour une PME multi-services.
   - **Corrigé détaillé** : OU par service, groupes par rôle, logique maintenable.

### Nouvelles abréviations rencontrées
- OU | Organizational Unit | Unité logique AD pour organiser objets | Interagit avec GPO, délégation, administration
- LDAP | Lightweight Directory Access Protocol | Protocole d’accès à l’annuaire | Interagit avec AD DS, authentification, requêtes annuaire

### Banque de questions du module (15)
1. QCM: une OU sert à... A) stocker backups B) organiser objets AD C) remplacer DNS  
2. QCM: AD dépend fortement de... A) DNS B) GPU C) HDMI  
3. QCM: LDAP sert à... A) accès annuaire B) streaming C) chiffrement disque  
4. Ouverte: pourquoi privilégier gestion par groupes ?  
5. Ouverte: domaine vs OU, différence clé ?  
6. Cas: un user créé mais ne reçoit pas les bons accès.  
7. QCM: structure AD saine = A) plate et confuse B) hiérarchisée C) aléatoire  
8. Ouverte: pourquoi éviter droits individuels massifs ?  
9. Cas: DNS mal configuré sur DC, conséquence probable ?  
10. QCM: objectif bloc 2 = A) créer des comptes sans logique B) structurer l’identité C) installer Linux  
11. Ouverte: exemple de convention de nommage utile.  
12. Cas: fusion de deux équipes, comment adapter l’OU model ?  
13. QCM: groupe métier aide surtout... A) esthétique B) gouvernance d’accès C) vitesse CPU  
14. Ouverte: comment expliquer AD à un non-technique ?  
15. QCM: résultat attendu = A) administration centralisée B) accès anarchique C) tickets en hausse

---

## 3) Politiques & sécurité (3h)

### Objectifs d'apprentissage
- Comprendre le rôle des GPO dans le contrôle des postes/utilisateurs.
- Différencier authentification et autorisation.
- Appliquer le principe du moindre privilège dans AD/Windows.
- Diagnostiquer un incident d’accès lié à une politique.

### Contenu pédagogique
La sécurité en environnement Windows repose sur politiques + identités + droits.

Points clés:
1. GPO applique des règles (mot de passe, scripts, verrouillage, restrictions).
2. Authentification: prouver identité.
3. Autorisation: déterminer ce qu’on peut faire.
4. Kerberos/NTLM: mécanismes d’authentification selon contexte.
5. Toujours tester une politique sur périmètre pilote avant généralisation.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : identifier une GPO de mot de passe et son impact.
   - **Corrigé détaillé** : règle active, population touchée, effet attendu.
2. **Exercice 2 (intermédiaire)** : incident “accès dossier refusé après politique”.
   - **Corrigé détaillé** : vérifier groupe, GPO, ACL, puis retester.
3. **Exercice 3 (avancé)** : proposer une baseline de sécurité junior (3 politiques prioritaires).
   - **Corrigé détaillé** : justification risque/réduction.

### Nouvelles abréviations rencontrées
- GPO | Group Policy Object | Objet de stratégie de groupe Windows | Interagit avec OU, sécurité postes, conformité
- NTLM | NT LAN Manager | Protocole d’authentification Microsoft historique | Interagit avec compatibilité legacy, sécurité AD

### Banque de questions du module (15)
1. QCM: GPO sert à... A) gérer politiques B) créer table SQL C) redémarrer routeur  
2. QCM: authentification = ... A) identité B) droit C) sauvegarde  
3. QCM: autorisation = ... A) identité B) action permise C) DNS  
4. Ouverte: pourquoi tester GPO sur périmètre pilote ?  
5. Ouverte: moindre privilège en pratique AD.  
6. Cas: user authentifié mais accès refusé, où chercher ?  
7. QCM: NTLM est... A) protocole auth Microsoft B) format CSV C) service Linux  
8. Ouverte: risque d’une GPO mal ciblée.  
9. Cas: changement GPO non pris en compte immédiatement.  
10. QCM: objectif bloc 3 = A) durcir proprement B) bloquer tout C) improviser  
11. Ouverte: différence ACL locale vs politique de domaine.  
12. Cas: même groupe, droits différents sur 2 serveurs.  
13. QCM: sécurité robuste = A) règles claires + validation B) hasard C) droits admin partout  
14. Ouverte: comment justifier une baseline sécurité ?  
15. QCM: résultat attendu = A) contrôle d’accès maîtrisé B) dérive C) opacité

---

## 4) Labs incidents AD/Windows Server (2h)

### Objectifs d'apprentissage
- Traiter des incidents réalistes AD/Windows de bout en bout.
- Produire une RCA et une SOP courtes.
- Renforcer la communication technique incident.

### Contenu pédagogique
Scénarios:
1. Compte verrouillé + échec de connexion.
2. GPO non appliquée sur une OU.
3. Résolution nom AD intermittente.

Méthode:
- Symptôme → hypothèse → tests → correction → validation → prévention.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : déverrouiller un compte + analyser cause.
   - **Corrigé détaillé** : action + preuve + mesure préventive.
2. **Exercice 2 (intermédiaire)** : GPO non appliquée, isoler le facteur bloquant.
   - **Corrigé détaillé** : ciblage OU, héritage, groupe de sécurité.
3. **Exercice 3 (avancé)** : rédiger SOP “incident connexion domaine”.
   - **Corrigé détaillé** : étapes, rollback, validation finale.

### Nouvelles abréviations rencontrées
- Kerberos | Protocole d’authentification par tickets | Mécanisme central d’authentification AD moderne | Interagit avec AD DS, sécurité, SSO

### Banque de questions du module (15)
1. QCM: compte verrouillé implique d’abord... A) suppression B) déverrouillage contrôlé C) formatage  
2. QCM: une GPO peut ne pas s’appliquer à cause de... A) ciblage OU B) météo C) RAM RGB  
3. QCM: Kerberos est lié à... A) auth AD B) FTP C) Docker  
4. Ouverte: que contient une RCA utile ?  
5. Ouverte: pourquoi une SOP réduit les erreurs ?  
6. Cas: incident connexion revient chaque lundi.  
7. QCM: validation finale incident = A) action seule B) test réussi C) intuition  
8. Ouverte: quoi transmettre au N2/N3 ?  
9. Cas: symptômes identiques, causes différentes possibles.  
10. QCM: objectif bloc 4 = A) réflexes opérationnels B) théorie seule C) contournement  
11. Ouverte: exemple de prévention post-incident.  
12. Cas: résolution rapide mais non documentée, risque ?  
13. QCM: escalade pro = A) floue B) factuelle C) émotionnelle  
14. Ouverte: comment expliquer Kerberos simplement ?  
15. QCM: résultat attendu = A) résolution durable B) patch fragile C) rechute

---

## 5) Banque de questions + suivi P1 (1h)

### Objectifs d'apprentissage
- Valider J13 avec exigences terrain.
- Convertir J13 en preuve employable immédiate.

### Contenu pédagogique
- 40 min test mixte J13.
- 20 min correction + plan J14.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : ligne CV “incident AD résolu”.
   - **Corrigé détaillé** : action + outil + impact.
2. **Exercice 2 (intermédiaire)** : pitch 60s “GPO/AD en contexte entreprise”.
   - **Corrigé détaillé** : besoin, action, résultat.
3. **Exercice 3 (avancé)** : plan J14 en 3 priorités mesurables.
   - **Corrigé détaillé** : 2 techniques + 1 communication.

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: objectif final J13 = A) accumulation théorie B) administration prouvée C) notes seules  
2. Ouverte: meilleure preuve d’un incident AD résolu ?  
3. QCM: ligne CV forte = A) vague B) action+résultat C) buzzword  
4. Cas: bon technique, mauvaise explication recruteur.  
5. Ouverte: lien J13 et poste admin junior ?  
6. QCM: plan J14 doit être... A) mesurable B) flou C) optionnel  
7. Ouverte: quelle preuve publier ce soir ?  
8. QCM: correction immédiate sert à... A) retarder B) consolider C) ignorer  
9. Cas: stress oral, routine courte ?  
10. QCM: preuve solide = A) capture seule B) logs+actions+impact C) promesse  
11. Ouverte: pourquoi adapter vocabulaire au public ?  
12. Cas: incident non reproductible, prochaine étape ?  
13. QCM: remédiation utile = A) vague B) actionnable C) reportée  
14. Ouverte: indicateur de progression J13 pertinent ?  
15. QCM: résultat P1 réussi = A) CV inchangé B) CV/portfolio à jour C) rien

---

## Validation qualité J13 (anti-superficiel)

### Livrables obligatoires fin de J13
1. 3 incidents Windows/AD documentés (service, politique, accès).  
2. 1 RCA + 1 SOP sur incident critique d’authentification.  
3. 1 preuve portfolio + mise à jour CV orientée impact.  
4. 1 pitch technique 60-90s prêt entretien.

### Grille d'évaluation rapide (100 points)
- Maîtrise Windows Server et services: **25 pts**
- Compréhension AD (domaine, OU, groupes): **25 pts**
- Politiques/sécurité (GPO, auth, accès): **25 pts**
- Qualité de résolution incident (RCA/SOP/validation): **15 pts**
- Communication technique employabilité: **10 pts**

### Seuil attendu
- **>= 80/100** : J13 validé, passage normal J14.  
- **65-79/100** : validé sous remédiation ciblée 24h.  
- **< 65/100** : consolidation AD/Windows requise avant J14.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Windows Server)
1. **B**  
2. **B**  
3. **A**  
4. Pour montrer utilité concrète de la correction.  
5. Symptôme initial, test, résultat, heure, validation.  
6. Vérifier d’abord services AD/DNS et journal d’événements.  
7. **B**  
8. GUI visuel; ligne commande scriptable/rapide/reproductible.  
9. Vérifier dépendances applicatives/ports/config.  
10. **B**  
11. Méthode structurée + preuves, pas intuition.  
12. Ouvrir RCA et chercher cause racine récurrente.  
13. **B**  
14. Exemple: test login + résolution DNS + accès ressource.  
15. **A**

### B. Corrigé — Module 2 (Active Directory)
1. **B**  
2. **A**  
3. **A**  
4. Scalabilité, audit, maintenance simplifiée.  
5. Domaine = périmètre global; OU = organisation interne.  
6. Vérifier groupe, OU, politique appliquée.  
7. **B**  
8. Risque d’erreurs, dérive sécurité, maintenance lourde.  
9. Auth/lookup AD perturbés, connexions impactées.  
10. **B**  
11. Exemple: prenom.nom + suffixe service cohérent.  
12. Revoir arborescence OU et mapping groupes/rôles.  
13. **B**  
14. Annuaire central des identités et accès.  
15. **A**

### C. Corrigé — Module 3 (Politiques & sécurité)
1. **A**  
2. **A**  
3. **B**  
4. Réduire risque de blocage massif en production.  
5. Donner uniquement les droits nécessaires, temporiser les exceptions.  
6. Vérifier appartenance groupe + ACL + GPO ciblée.  
7. **A**  
8. Mauvais ciblage = impacts inattendus et tickets massifs.  
9. Forcer actualisation politique, vérifier périmètre et héritage.  
10. **A**  
11. ACL locale = ressource; politique domaine = règles globales.  
12. Vérifier héritage, ACL locale, groupes effectifs.  
13. **A**  
14. Baseline = réduction du risque avec coût maîtrisé.  
15. **A**

### D. Corrigé — Module 4 (Labs incidents)
1. **B**  
2. **A**  
3. **A**  
4. Contexte, cause, preuves, correction, prévention.  
5. SOP réduit variance et dépendance à une personne.  
6. Vérifier source du lockout (mauvais mot de passe/service).  
7. **B**  
8. Symptômes, logs, tests effectués, point d’échec, demande claire.  
9. Garder hypothèses multiples puis éliminer par tests.  
10. **A**  
11. Contrôle périodique + alerte + checklist préventive.  
12. Risque de rechute et non-transférabilité.  
13. **B**  
14. Auth par tickets évitant mot de passe envoyé en clair à chaque accès.  
15. **A**

### E. Corrigé — Module 5 (Banque + P1)
1. **B**  
2. Incident documenté avec preuve avant/après.  
3. **B**  
4. Travailler pitch structuré: besoin→action→impact.  
5. Résolution incidents, gestion identités, politiques accès.  
6. **A**  
7. Cas AD réel/simulé + RCA + SOP + résultat.  
8. **B**  
9. Respiration + plan 4 points + exemple concret.  
10. **B**  
11. Pour rester clair et convaincant selon interlocuteur.  
12. Collecter plus de traces et définir plan de reproduction contrôlé.  
13. **B**  
14. Temps moyen de résolution + taux de validation du correctif.  
15. **B**
