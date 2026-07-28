# TOME P4 — Jour 31 (14h)

## Découpage horaire opérationnel J31
- Sécurité transversale approfondie (défense en profondeur, zero trust, principes) — **4h**
- Gestion des sauvegardes et plans de reprise (RPO, RTO, stratégies de backup) — **3h**
- Gestion des identités et des accès (IAM entreprise, SSO, fédération) — **3h**
- Plans de continuité d'activité (PCA/PRA) et tests de reprise — **2h**
- Labs + Banque de questions + suivi P1 — **2h**

---

## 1) Sécurité transversale approfondie (4h)

### Objectifs d'apprentissage
- Appliquer le concept de défense en profondeur (multi-couche).
- Comprendre et appliquer les principes Zero Trust.
- Concevoir une architecture de sécurité transversale.
- Intégrer la sécurité dans le cycle DevOps (DevSecOps).
- Auditer une infrastructure selon les bonnes pratiques de sécurité.

### Contenu pédagogique
La sécurité ne se résume pas à un pare-feu. C'est une approche multicouche, systématique, intégrée à chaque étape du cycle de vie.

Points clés:
1. **Défense en profondeur** : superposer plusieurs couches de sécurité indépendantes. Si une couche cède, la suivante protège. Couches : Périmètre (WAF, DDoS) → Réseau (VPC, SG, NACL) → Compute (patching, hardening) → Application (validation, auth) → Données (chiffrement, sauvegarde). Aucune couche unique n'est suffisante.
2. **Zero Trust** : "Never trust, always verify." Principes : (a) Vérifier explicitement (chaque accès est authentifié et autorisé, pas de confiance implicite). (b) Moindre privilège (Just-In-Time, Just-Enough-Access). (c) Supposer la compromission (segmenter, chiffrer, monitorer). Contrairement au modèle traditionnel "périmètre fort = intérieur sûr", Zero Trust traite chaque requête comme potentiellement hostile.
3. **DevSecOps** : intégrer la sécurité dans le pipeline CI/CD, pas à la fin. (a) SAST (Static Analysis) dans l'IDE et la CI. (b) SCA (Software Composition Analysis) pour les dépendances. (c) DAST (Dynamic Analysis) sur les environnements de test. (d) Scanning des images Docker. (e) Infrastructure as Code scannée (Checkov, tfsec). Le développeur reçoit un feedback immédiat — la sécurité n'est plus un gate bloquant à la fin.
4. **Architecture de sécurité transversale** : une vue unique de la sécurité qui couvre toutes les couches. Centraliser les logs (SIEM), corréler les événements, définir des playbooks de réponse automatisés (SOAR). Outils : AWS Security Hub, Azure Sentinel, Splunk, ELK.
5. **Audit de sécurité** : méthode structurée. Checklist : IAM (pas de root, MFA, moindre privilège, rotation des clés), Réseau (pas de 0.0.0.0/0 sauf pour ALB, VPC Flow Logs activés), Données (chiffrement au repos activé partout, backups configurés), Compute (patching automatique, IMDSv2), Monitoring (CloudTrail, GuardDuty, Config activés dans toutes les régions).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : pour chaque couche de défense en profondeur, lister 2 mesures de sécurité concrètes à appliquer.
   - **Corrigé** : Périmètre : WAF, Shield DDoS. Réseau : VPC + sous-réseaux privés, Security Groups restrictifs. Compute : Patching automatique (SSM), IMDSv2. Application : Validation Zod/Joi, authentification JWT. Données : Chiffrement KMS, backups quotidiens. Monitoring : CloudTrail, GuardDuty.
2. **Exercice 2 (intermédiaire)** : auditer une architecture simple (ALB → EC2 → RDS) et identifier 5 vulnérabilités de sécurité courantes. Proposer une correction pour chacune.
   - **Corrigé** : (1) RDS en sous-réseau public → déplacer en privé. (2) EC2 avec clé SSH .pem partagée → utiliser Session Manager (pas de SSH exposé). (3) S3 bucket sans chiffrement → activer SSE-KMS. (4) IAM user avec AdministratorAccess → restreindre au minimum. (5) CloudTrail non activé → activer dans toutes les régions.
3. **Exercice 3 (avancé)** : concevoir une architecture Zero Trust pour une application bancaire. Identifier les points de contrôle d'accès, les segments réseau, et les flux autorisés.
   - **Corrigé** : (a) Pas de réseau "de confiance" — tous les flux sont authentifiés et chiffrés (mTLS). (b) Micro-segmentation : chaque service a son propre sous-réseau et Security Group. (c) Accès administrateur : bastion avec MFA + Session Manager, pas d'IP publique. (d) Identité : SSO fédéré avec Entra ID, MFA obligatoire, rôles Just-In-Time. (e) Monitoring : chaque accès logué, alertes sur comportements anormaux.

### Nouvelles abréviations rencontrées
- ZTNA | Zero Trust Network Access | Modèle de sécurité "ne jamais faire confiance, toujours vérifier" | Interagit avec l'IAM, la micro-segmentation, le monitoring
- DevSecOps | Development Security Operations | Intégration de la sécurité dans le cycle DevOps | Interagit avec CI/CD, SAST, DAST, les pipelines
- SIEM | Security Information and Event Management | Centralisation et corrélation des logs de sécurité | Interagit avec CloudTrail, GuardDuty, Splunk, ELK
- SOAR | Security Orchestration, Automation and Response | Automatisation des réponses aux incidents | Interagit avec le SIEM, les playbooks, les alertes

### Banque de questions du module (15)
1. QCM: la défense en profondeur consiste à... A) superposer plusieurs couches de sécurité B) utiliser un seul firewall C) tout chiffrer
2. QCM: le principe Zero Trust est... A) "Never trust, always verify" B) "Trust but verify" C) "Trust everything inside"
3. QCM: DevSecOps intègre la sécurité... A) dès le début du cycle DevOps B) à la fin du projet C) uniquement en production
4. Ouverte: différence entre le modèle "périmètre fort" et Zero Trust.
5. Ouverte: pourquoi la défense en profondeur est-elle plus efficace qu'une seule couche ?
6. Cas: un développeur commit une clé API dans le code. Quel outil DevSecOps l'aurait détecté ?
7. QCM: un SIEM centralise... A) les logs de sécurité de toutes les sources B) uniquement les logs réseau C) les backups
8. Ouverte: à quoi sert le "Just-In-Time access" dans Zero Trust ?
9. Cas: RDS en sous-réseau public = vulnérabilité critique. Correction en 3 étapes ?
10. QCM: IMDSv2 sur EC2 protège contre... A) le vol de credentials via SSRF B) les DDoS C) le SQL injection
11. Ouverte: comment prioriser les corrections après un audit de sécurité ?
12. Cas: un client demande "êtes-vous Zero Trust ?" — que répondre ?
13. QCM: objectif du module 1 = A) concevoir une sécurité multicouche B) utiliser un seul outil C) ignorer la sécurité
14. Ouverte: comment expliquer Zero Trust à un directeur non technique ?
15. QCM: résultat attendu = A) architecture de sécurité transversale documentée B) sécurité minimale C) rien

---

## 2) Gestion des sauvegardes et plans de reprise (3h)

### Objectifs d'apprentissage
- Définir et calculer le RPO (Recovery Point Objective) et le RTO (Recovery Time Objective).
- Concevoir une stratégie de sauvegarde (fréquence, rétention, type).
- Mettre en œuvre les sauvegardes automatisées dans le cloud.
- Tester régulièrement les procédures de restauration.
- Distinguer backup, disaster recovery, et haute disponibilité.

### Contenu pédagogique
"Personne ne se soucie des sauvegardes jusqu'au jour où on en a besoin." Une stratégie de sauvegarde non testée est une illusion de sécurité.

Points clés:
1. **RPO et RTO** :
   - **RPO (Recovery Point Objective)** : quantité maximale de données qu'on accepte de perdre (en temps). RPO = 1h → on peut perdre jusqu'à 1h de données. Détermine la fréquence des sauvegardes (toutes les heures si RPO=1h).
   - **RTO (Recovery Time Objective)** : temps maximal pour restaurer le service après un sinistre. RTO = 4h → le service doit être rétabli en 4h. Détermine l'architecture de reprise (standby chaud ou froid).
   - Application bancaire critique : RPO = 0 (pas de perte), RTO = < 1h → réplication synchrone multi-AZ + multi-région.
2. **Stratégie de sauvegarde 3-2-1** : 3 copies des données, sur 2 types de médias différents, dont 1 hors site. Dans le cloud : 3 copies (primaire + backup + réplica cross-région), 2 médias (EBS + S3), 1 hors site (autre région).
3. **Types de sauvegardes** :
   - **Complète** : tout sauvegarder. Lent, cher en stockage. Base de la stratégie.
   - **Incrémentielle** : sauvegarder uniquement ce qui a changé depuis la dernière sauvegarde. Rapide, économique. Dépend de la chaîne complète pour restaurer.
   - **Différentielle** : sauvegarder ce qui a changé depuis la dernière sauvegarde COMPLÈTE. Compromis vitesse/restauration.
   - **Snapshot** (cloud) : sauvegarde instantanée au niveau bloc. RDS (automatiques), EBS (manuels ou Data Lifecycle Manager).
4. **Automatisation** : AWS Backup (planifier les sauvegardes EC2, RDS, EBS, DynamoDB, EFS). Politique de rétention : garder 7 jours de sauvegardes quotidiennes + 12 mois de sauvegardes mensuelles. Règle de transition vers Glacier pour les sauvegardes anciennes (moins cher).
5. **Test de restauration** : une sauvegarde non testée n'existe pas. Planifier des tests trimestriels de restauration. Scénario : "Restaurer la base de données de production dans un environnement isolé en moins de RTO." Documenter le résultat, identifier les problèmes, améliorer la procédure.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : définir RPO et RTO pour 3 scénarios : (a) site e-commerce, (b) dossier médical patient, (c) blog personnel. Justifier.
   - **Corrigé** : (a) E-commerce : RPO = 1h (perte max 1h de commandes = impact financier), RTO = 4h (site down = perte de CA). (b) Médical : RPO = 0 (pas de perte de données patients acceptable), RTO = < 15 min (accès critique). (c) Blog : RPO = 24h (un article perdu n'est pas grave), RTO = 48h (pas de SLA critique).
2. **Exercice 2 (intermédiaire)** : configurer AWS Backup pour une instance RDS. Planifier une sauvegarde quotidienne à 3h, rétention 30 jours. Créer une sauvegarde mensuelle conservée 12 mois. Vérifier le coût estimé.
   - **Corrigé** : AWS Backup → Create Backup Plan → Daily (cron 0 3 * * ? *, retain 30 days) + Monthly (cron 0 3 1 * ? *, retain 12 months, transition to Cold Storage after 90 days). Assigner la ressource RDS. Vérifier AWS Backup → Jobs → Completed. Coût : stockage snapshot incrémental.
3. **Exercice 3 (avancé)** : concevoir un plan de reprise d'activité complet pour l'application TaskFlow (P3-C). Définir RPO, RTO, architecture de reprise, procédure de bascule, et test annuel.
   - **Corrigé** : RPO = 15 min (RDS backups + WAL archiving), RTO = 1h. Architecture : RDS Multi-AZ (bascule auto en < 2 min), EC2 avec AMI pré-configurée et User Data pour le déploiement rapide, frontend Vercel (déjà hautement disponible). Procédure de bascule : (1) Détecter la panne (health check). (2) Si AZ primaire down, RDS bascule automatiquement. (3) Si région entière down → lancer EC2 dans la région secondaire avec la dernière AMI + restaurer RDS depuis le snapshot cross-région. (4) Mettre à jour le DNS. Test annuel : simuler une panne de région et mesurer le RTO réel.

### Nouvelles abréviations rencontrées
- RPO | Recovery Point Objective | Perte de données maximale acceptable (en temps) | Interagit avec les sauvegardes, les snapshots, la réplication
- RTO | Recovery Time Objective | Temps maximal de rétablissement du service | Interagit avec l'architecture de reprise, le DNS, les procédures
- PCA | Plan de Continuité d'Activité | Ensemble des procédures pour maintenir l'activité en cas de sinistre | Interagit avec le PRA, les sauvegardes, la gouvernance
- PRA | Plan de Reprise d'Activité | Procédure de restauration des systèmes après un sinistre | Interagit avec le PCA, les tests, la documentation

### Banque de questions du module (15)
1. QCM: RPO définit... A) la perte de données maximale acceptable B) le temps de redémarrage C) le coût
2. QCM: la règle 3-2-1 signifie... A) 3 copies, 2 médias, 1 hors site B) 3 backups, 2 régions, 1 cloud C) 3 jours, 2 semaines, 1 mois
3. QCM: une sauvegarde incrémentielle sauvegarde... A) ce qui a changé depuis la dernière sauvegarde B) tout C) rien
4. Ouverte: différence entre backup, disaster recovery, et haute disponibilité.
5. Ouverte: pourquoi le RPO et le RTO sont-ils définis par le métier, pas par l'IT ?
6. Cas: RPO = 0. Techniquement possible ? Comment ?
7. QCM: AWS Backup peut planifier... A) des sauvegardes automatiques multi-services B) des déploiements C) du monitoring
8. Ouverte: pourquoi tester les restaurations régulièrement ?
9. Cas: restauration de DB échoue après 2h (RTO = 1h). Quelles améliorations ?
10. QCM: un snapshot EBS est... A) une sauvegarde incrémentielle au niveau bloc B) une copie complète C) un fichier
11. Ouverte: comment réduire le coût des sauvegardes ?
12. Cas: "Nos backups fonctionnent, on n'a jamais eu de problème." — Risque ?
13. QCM: objectif du module 2 = A) concevoir une stratégie de sauvegarde et reprise B) faire un backup par an C) ignorer les sauvegardes
14. Ouverte: comment présenter le RPO/RTO à un directeur métier ?
15. QCM: résultat attendu = A) plan de sauvegarde documenté + RPO/RTO définis B) pas de backup C) backups non testés

---

## 3) Gestion des identités et des accès — IAM entreprise (3h)

### Objectifs d'apprentissage
- Distinguer authentification, autorisation, et fédération.
- Configurer le Single Sign-On (SSO) entre applications.
- Mettre en œuvre le RBAC (Role-Based Access Control).
- Comprendre les protocoles SAML, OAuth 2.0, OpenID Connect.
- Appliquer le principe du moindre privilège à l'échelle de l'entreprise.

### Contenu pédagogique
Dans une entreprise, gérer les identités et les accès devient vite complexe. L'IAM d'entreprise est la colonne vertébrale de la sécurité.

Points clés:
1. **Authentification vs Autorisation vs Fédération** :
   - **Authentification** : prouver son identité (login/mot de passe, MFA, biométrie). "Qui es-tu ?"
   - **Autorisation** : déterminer ce qu'on peut faire (permissions, rôles). "Que peux-tu faire ?"
   - **Fédération** : déléguer l'authentification à un fournisseur tiers (Google, Microsoft, SAML). "Je te fais confiance pour dire qui il est."
2. **SSO (Single Sign-On)** : un seul login pour accéder à plusieurs applications. Ex: connexion Office 365 → accès à Outlook, Teams, SharePoint, Power BI sans re-login. Protocoles : SAML 2.0 (applications web, XML), OpenID Connect (applications modernes, JSON/JWT), OAuth 2.0 (autorisation, pas authentification).
3. **OAuth 2.0 et OpenID Connect** :
   - **OAuth 2.0** : framework d'autorisation. Permet à une application d'accéder à des ressources au nom de l'utilisateur sans connaître son mot de passe. Ex: "Autoriser cette app à lire vos emails". Grant types : Authorization Code (le plus sécurisé), Client Credentials (service-to-service).
   - **OpenID Connect (OIDC)** : couche d'authentification au-dessus d'OAuth 2.0. Ajoute un `id_token` (JWT) qui contient l'identité de l'utilisateur. Utilisé par Google, Microsoft, Auth0.
4. **RBAC (Role-Based Access Control)** : attribuer des permissions aux rôles, puis assigner les rôles aux utilisateurs. Ex: Rôle "Développeur" → peut push sur le repo, lire les logs, lancer des builds. Rôle "Admin" → peut tout. Avantage : quand un développeur devient admin, on change son rôle, pas ses 50 permissions individuelles.
5. **Moindre privilège à l'échelle** : (a) Inventaire des comptes et permissions (qui a accès à quoi ?). (b) Access Review trimestrielle (les permissions sont-elles encore justifiées ?). (c) Privileged Access Management (PAM) : les admins utilisent des comptes dédiés, avec élévation temporaire. (d) Automatiser la révocation : quand un employé part, TOUS ses accès sont coupés en < 1h (idéalement immédiatement).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : modéliser les rôles RBAC pour une équipe de développement (3 rôles : Admin, Lead Dev, Developer). Définir les permissions de chaque rôle (repo, CI/CD, logs, production).
   - **Corrigé** : Admin : tout (y compris gestion IAM). Lead Dev : repo read/write, CI/CD configure, logs read, production read-only. Developer : repo read/write, CI/CD trigger, logs read (dev), production NO ACCESS. Les permissions sont cumulatives vers le haut.
2. **Exercice 2 (intermédiaire)** : expliquer le flux OAuth 2.0 Authorization Code avec PKCE. Pourquoi PKCE est-il nécessaire pour les applications mobiles/natives ?
   - **Corrigé** : Flux : (1) App redirige vers le fournisseur d'auth. (2) Utilisateur s'authentifie + consent. (3) Fournisseur renvoie un authorization code. (4) App échange le code contre un access token + refresh token. PKCE (Proof Key for Code Exchange) ajoute un `code_verifier` et `code_challenge` pour empêcher l'interception du code par une app malveillante sur le même appareil. Obligatoire pour les apps mobiles.
3. **Exercice 3 (avancé)** : configurer le SSO pour 3 applications (GitHub, AWS, Slack) via Entra ID (Azure AD). Les utilisateurs se connectent avec leur compte Office 365. Justifier le choix du protocole pour chaque app.
   - **Corrigé** : GitHub → SAML (GitHub Enterprise supporte SAML nativement). AWS → AWS IAM Identity Center (ex-AWS SSO) fédéré avec Entra ID via SAML. Slack → SAML (Slack supporte SAML pour les plans payants). Justification : SAML est le standard pour les applications SaaS d'entreprise. Résultat : un seul compte, un seul mot de passe, une seule politique MFA pour toutes les apps.

### Nouvelles abréviations rencontrées
- OIDC | OpenID Connect | Couche d'authentification au-dessus d'OAuth 2.0 | Interagit avec JWT, OAuth 2.0, le SSO
- PAM | Privileged Access Management | Gestion des accès privilégiés (comptes admin, sessions temporaires) | Interagit avec l'IAM, les audits, la conformité
- SAML | Security Assertion Markup Language | Protocole XML pour l'échange de données d'authentification | Interagit avec le SSO, les applications SaaS, Entra ID

### Banque de questions du module (15)
1. QCM: OAuth 2.0 est un protocole d'... A) autorisation B) authentification C) chiffrement
2. QCM: OpenID Connect ajoute... A) l'authentification au-dessus d'OAuth 2.0 B) le chiffrement C) rien
3. QCM: RBAC attribue les permissions aux... A) rôles B) utilisateurs directement C) applications
4. Ouverte: différence entre authentification et autorisation.
5. Ouverte: pourquoi le fédération d'identité simplifie-t-elle la gestion ?
6. Cas: un employé quitte l'entreprise. Combien de temps pour révoquer ses 50 accès sans SSO vs avec SSO ?
7. QCM: le SSO permet... A) un seul login pour plusieurs applications B) plusieurs mots de passe C) rien
8. Ouverte: pourquoi PKCE est-il nécessaire pour OAuth sur mobile ?
9. Cas: "J'ai oublié mon mot de passe AWS." Avec SSO, que faire ?
10. QCM: SAML est basé sur... A) XML B) JSON C) YAML
11. Ouverte: comment auditer les permissions d'une équipe de 50 personnes ?
12. Cas: un stagiaire a les mêmes accès que l'admin. Problème et solution ?
13. QCM: objectif du module 3 = A) gérer les identités et accès à l'échelle B) donner admin à tout le monde C) éviter l'IAM
14. Ouverte: comment convaincre la direction d'investir dans le SSO ?
15. QCM: résultat attendu = A) RBAC défini + SSO configuré + moindre privilège B) admin pour tous C) pas d'IAM

---

## 4) Plans de continuité d'activité — PCA/PRA (2h)

### Objectifs d'apprentissage
- Distinguer PCA (Plan de Continuité d'Activité) et PRA (Plan de Reprise d'Activité).
- Rédiger un PCA simplifié pour une application web.
- Identifier les risques et définir des stratégies de mitigation.
- Planifier et exécuter des tests de continuité.
- Comprendre l'impact business d'une interruption (BIA — Business Impact Analysis).

### Contenu pédagogique
Un sinistre arrive toujours au pire moment. Le PCA/PRA est la différence entre un incident maîtrisé et une catastrophe business.

Points clés:
1. **PCA vs PRA** :
   - **PCA (Continuité)** : comment maintenir l'activité PENDANT l'incident (solutions de contournement, communication, procédures manuelles). Ex: "Si l'appli web est down, les commandes sont prises par téléphone."
   - **PRA (Reprise)** : comment restaurer les systèmes APRÈS l'incident (restauration backups, bascule infrastructure, reconstruction). Ex: "Restaurer la DB depuis le snapshot et redéployer l'app en < 2h."
2. **BIA (Business Impact Analysis)** : identifier les processus critiques, estimer l'impact financier et réputationnel d'une interruption, définir le RTO/RPO maximal tolérable. Résultat BIA : "L'application e-commerce perd 10 000€/heure d'indisponibilité. RTO max = 2h, RPO max = 15 min."
3. **Stratégies de reprise** :
   - **Backup & Restore** : le moins cher, le plus lent (RTO = heures/jours). Restaurer depuis les backups.
   - **Pilot Light** : infrastructure minimale toujours active, scalable en cas de sinistre (RTO = dizaines de minutes).
   - **Warm Standby** : version réduite de l'infra en attente (RTO = minutes). Plus cher.
   - **Multi-Site Active-Active** : l'infrastructure tourne dans 2 régions simultanément (RTO = secondes). Très cher.
4. **Structure d'un PCA** : (1) Objet et périmètre. (2) Analyse des risques. (3) Stratégie de continuité. (4) Procédures détaillées (qui fait quoi, quand). (5) Contacts d'urgence. (6) Plan de communication (interne, clients, presse). (7) Plan de tests annuels.
5. **Test du PCA** : scénario catastrophe réaliste. Exemple : "Région AWS Paris entièrement down." Exécuter le plan, mesurer le RTO réel, identifier les écarts, mettre à jour le PCA. Ne jamais supposer que le plan fonctionne sans l'avoir testé.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : rédiger une BIA pour l'application TaskFlow (P3-C). Identifier le processus critique, estimer l'impact d'une interruption, définir RTO et RPO.
   - **Corrigé** : Processus critique : gestion des tâches des utilisateurs. Impact : 50 utilisateurs impactés, perte de productivité estimée à 500€/heure. RTO max acceptable : 4h (une demi-journée de travail). RPO max acceptable : 1h (perte d'une heure de tâches créées/modifiées). Stratégie recommandée : Pilot Light (RDS Multi-AZ en standby + capacité de déploiement rapide).
2. **Exercice 2 (intermédiaire)** : rédiger la procédure de bascule (runbook) pour le scénario "région AWS primaire down". Étapes précises, rôles, et points de vérification.
   - **Corrigé** : (1) Détection : CloudWatch alarm "Health check échoue depuis 2 min" → notification Ops. (2) Décision : Incident Commander déclare le sinistre et active le PRA. (3) DNS failover : Route 53 bascule vers la région secondaire (contrôlé automatiquement ou manuellement). (4) Restauration DB : RDS restored from latest cross-region snapshot dans la région secondaire. (5) Déploiement app : lancer EC2 dans région secondaire avec AMI + User Data. (6) Vérification : tests fonctionnels automatisés. (7) Communication : notification aux utilisateurs "service rétabli". Rôles : Incident Commander, Technical Lead, Communication Lead.
3. **Exercice 3 (avancé)** : organiser un test de PCA "tabletop exercise" (sur papier). Scénario : "Un développeur supprime accidentellement la base de données de production un vendredi à 17h." Simuler la réponse : qui appelle qui, quelles actions, quelle communication.
   - **Corrigé** : Timeline simulée : T+0 min : développeur signale l'erreur. T+5 min : Incident Commander déclare l'incident. T+10 min : Technical Lead vérifie les backups (dernier snapshot = 16h45, RPO = 15 min OK). T+20 min : restauration RDS lancée. T+45 min : DB restaurée, app testée. T+60 min : communication "incident résolu, aucune perte de données". Leçons apprises : le processus a fonctionné, mais la communication initiale a pris 10 minutes (améliorer avec un canal d'alerte dédié).

### Nouvelles abréviations rencontrées
- BIA | Business Impact Analysis | Analyse d'impact sur l'activité (définit les processus critiques et le coût d'une interruption) | Interagit avec le PCA, le RPO/RTO, la gouvernance
- PCA | *(défini en M2)* | Plan de Continuité d'Activité | Interagit avec le PRA, le BIA, les tests
- PRA | *(défini en M2)* | Plan de Reprise d'Activité | Interagit avec le PCA, les backups, le cloud

### Banque de questions du module (15)
1. QCM: le PCA définit... A) comment maintenir l'activité pendant un incident B) uniquement les backups C) le budget IT
2. QCM: le BIA identifie... A) les processus critiques et l'impact d'une interruption B) les bugs C) les performances
3. QCM: la stratégie Pilot Light a un RTO de... A) dizaines de minutes B) secondes C) jours
4. Ouverte: différence entre PCA et PRA.
5. Ouverte: pourquoi tester le PCA régulièrement ?
6. Cas: une application e-commerce perd 50 000€/heure. Quel RTO recommander ?
7. QCM: un runbook est... A) une procédure détaillée étape par étape B) un livre C) un script
8. Ouverte: quels rôles définir dans une équipe de réponse aux incidents ?
9. Cas: le test PCA révèle que la restauration prend 8h au lieu de 2h prévues. Actions ?
10. QCM: en Multi-Site Active-Active, le RTO est... A) quasi nul (secondes) B) heures C) jours
11. Ouverte: comment justifier le coût d'une infrastructure multi-AZ/multi-région ?
12. Cas: "On n'a pas de PCA, on n'a jamais eu de problème." — Risque ?
13. QCM: objectif du module 4 = A) concevoir et tester un PCA/PRA B) ignorer les sinistres C) improviser
14. Ouverte: comment expliquer l'importance du PCA à un manager qui veut réduire les coûts ?
15. QCM: résultat attendu = A) PCA documenté + testé + RTO/RPO validés B) pas de plan C) plan jamais testé

---

## 5) Labs + Banque de questions + suivi P1 (2h)

### Objectifs d'apprentissage
- Appliquer la sécurité transversale sur un cas pratique.
- Configurer un backup automatisé et tester la restauration.
- Valider les acquis J31.

### Contenu pédagogique
- 1h : lab intégré — sécuriser une infrastructure existante + configurer backups + rédiger extrait PCA.
- 40 min : test mixte J31.
- 20 min : correction + plan J32.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : auditer rapidement l'application TaskFlow pour la sécurité (IAM, réseau, chiffrement, backups, logs). Lister 3 vulnérabilités et les corriger.
2. **Exercice 2 (intermédiaire)** : configurer un backup automatique RDS avec AWS Backup. Simuler une suppression accidentelle et restaurer. Mesurer le temps de restauration.
3. **Exercice 3 (avancé)** : rédiger les 3 premières pages d'un PCA pour TaskFlow (objet, BIA, stratégie).

### Nouvelles abréviations rencontrées
- Aucune nouvelle abréviation technique.

### Banque de questions du module (15)
1. QCM: objectif final J31 = A) sécurité transversale + sauvegardes + PCA B) théorie seule C) rien
2. QCM: plan J32 = A) gouvernance IT + conformité B) retour au cloud C) fin
3. Ouverte: meilleure preuve J31 à montrer ?
4. QCM: preuve solide = A) rapport d'audit sécurité + PCA documenté B) promesse C) rien
5. QCM: résultat P1 réussi = A) portfolio enrichi B) rien C) théorie
6. Ouverte: comment relier J31 au poste de RSSI/Responsable sécurité ?
7. QCM: remédiation = A) corriger la lacune B) recommencer C) abandonner
8. QCM: résultat attendu = A) infrastructure sécurisée + PCA testé B) aucune sécurité C) pas de sauvegardes

---

## Validation qualité J31 (anti-superficiel)

### Livrables obligatoires fin de J31
1. 1 rapport d'audit de sécurité (checklist défense en profondeur, 5 vulnérabilités trouvées/corrigées).
2. 1 stratégie de sauvegarde documentée (RPO, RTO, fréquence, rétention, test de restauration).
3. 1 extrait de PCA (BIA + stratégie + runbook) pour TaskFlow.
4. 1 configuration RBAC documentée (3 rôles, permissions).
5. 1 preuve portfolio (extrait PCA ou rapport audit) + mise à jour CV ligne sécurité/gouvernance.

### Grille d'évaluation rapide (100 points)
- Sécurité transversale (défense en profondeur, Zero Trust, DevSecOps) : **30 pts**
- Sauvegardes et reprise (RPO/RTO, stratégie 3-2-1, automatisation, tests) : **25 pts**
- IAM entreprise (RBAC, SSO, fédération, moindre privilège) : **20 pts**
- PCA/PRA (BIA, stratégie, runbook, tests) : **15 pts**
- Communication technique employabilité : **10 pts**

### Seuil attendu
- **>= 80/100** : J31 validé, passage normal J32.
- **65-79/100** : validé sous remédiation ciblée 24h.
- **< 65/100** : consolidation sécurité/gouvernance requise avant J32.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Sécurité transversale)
1. **A**
2. **A**
3. **A**
4. Périmètre fort = "tout ce qui est à l'intérieur du réseau est de confiance". Zero Trust = "rien ni personne n'est de confiance par défaut, chaque accès est vérifié". Le périmètre fort échoue si l'attaquant passe le firewall. Zero Trust continue de protéger.
5. Aucune couche n'est infaillible. Si le WAF rate une attaque, le Security Group la bloque. Si le SG est mal configuré, le chiffrement protège les données. La redondance des protections réduit le risque global.
6. Un outil de détection de secrets (git-secrets, truffleHog, Gitleaks) dans la CI. Ou un scanner SAST. Ou GitHub Advanced Security (secret scanning). L'important est de bloquer le push, pas juste de détecter.
7. **A**
8. Les privilèges élevés ne sont accordés que pour la durée nécessaire à la tâche, puis révoqués automatiquement. Un admin n'a pas les droits admin en permanence — il les élève le temps d'une intervention. Réduit la surface d'attaque.
9. (1) Supprimer la règle SG qui expose le port DB à 0.0.0.0/0. (2) Créer un sous-réseau privé et y déplacer RDS. (3) Autoriser uniquement le SG des EC2 applicatives sur le port DB. Si déjà en sous-réseau public, migration nécessite un snapshot + restauration.
10. **A**
11. Prioriser par criticité : (1) Vulnérabilités exposées sur internet (SG 0.0.0.0/0, S3 public). (2) Vulnérabilités d'accès (IAM trop permissif, pas de MFA). (3) Vulnérabilités de configuration (chiffrement désactivé, logs absents). Matrice impact × probabilité.
12. "Nous appliquons les principes Zero Trust : authentification systématique de chaque requête, moindre privilège, micro-segmentation, et nous supposons toujours qu'une compromission est possible. Nous ne sommes pas encore 100% Zero Trust sur tous les systèmes legacy, mais notre roadmap y tend."
13. **A**
14. "Aujourd'hui, on fait confiance à tous ceux qui sont dans le bâtiment. Zero Trust, c'est vérifier l'identité de chaque personne à chaque porte, même à l'intérieur. Si un badge est volé, l'intrus ne peut ouvrir qu'une porte, pas tout le bâtiment."
15. **A**

### B. Corrigé — Module 2 (Sauvegardes et reprise)
1. **A**
2. **A**
3. **A**
4. Backup = copie des données pour restaurer en cas de perte (accidentelle, corruption). Disaster Recovery = processus complet pour rétablir l'infrastructure après un sinistre majeur. Haute disponibilité = l'infrastructure continue de fonctionner malgré une panne (pas d'interruption).
5. Le RPO/RTO est une décision business : "Combien de données peut-on se permettre de perdre ? Combien de temps peut-on se permettre d'être indisponible ?" L'IT implémente la solution technique pour atteindre ces objectifs. Le métier fixe les objectifs.
6. Oui, avec une réplication synchrone : les écritures sont appliquées simultanément sur la base primaire et la base secondaire (ex: RDS Multi-AZ, Aurora). Si la primaire tombe, la secondaire a exactement les mêmes données. Coût : latence réseau, doublement du coût.
7. **A**
8. Une sauvegarde corrompue, un snapshot incomplet, une procédure obsolète — on ne le sait que le jour où on en a besoin. Tester, c'est garantir que la restauration fonctionnera quand on en aura vraiment besoin.
9. Identifier le goulot d'étranglement (restauration du volume EBS ? replay des logs ?). Solutions : pré-chauffer le volume (restore + warm-up), utiliser un snapshot plus récent, avoir un read replica cross-région déjà chaud, paralléliser les étapes.
10. **A**
11. Utiliser le cycle de vie (transition vers Glacier après 90j), définir une rétention adaptée (pas garder 5 ans de sauvegardes quotidiennes), utiliser des snapshots incrémentiels, supprimer les snapshots orphelins.
12. Ils n'ont jamais testé la RESTAURATION. Avoir des backups qui fonctionnent ne garantit pas que la restauration fonctionne. La première fois qu'ils restaureront sera en situation d'urgence réelle → risque élevé d'échec.
13. **A**
14. "RPO = si on perd les données des 15 dernières minutes, est-ce acceptable ? RTO = si le service est down 4 heures, quel est l'impact business ? Ce sont VOS décisions, pas les miennes. Mon job est de vous donner les options techniques pour chaque objectif."
15. **A**

### C. Corrigé — Module 3 (IAM entreprise)
1. **A**
2. **A**
3. **A**
4. Authentification = prouver QUI on est (login, MFA). Autorisation = déterminer ce qu'on peut FAIRE (lire ce fichier, modifier cette DB). On peut être authentifié sans être autorisé (ex: stagiaire connecté = authentifié, mais ne peut pas accéder aux données RH = pas autorisé).
5. Un seul compte pour toutes les apps. Quand un employé part, on désactive UN compte → plus d'accès nulle part. Sans fédération, il faut désactiver 50 comptes un par un (risque d'en oublier). Productivité + Sécurité.
6. Sans SSO : plusieurs heures/jours (il faut trouver tous les comptes, les désactiver un par un, risque d'oubli). Avec SSO : immédiat (désactiver le compte Entra ID → plus aucun accès).
7. **A**
8. Sur mobile, l'authorization code peut être intercepté par une application malveillante qui s'enregistre pour le même custom URL scheme. PKCE garantit que même si le code est intercepté, il est inutilisable sans le `code_verifier` original.
9. Avec SSO, le mot de passe est celui du compte Office 365. "Réinitialisez votre mot de passe Windows/Office 365." AWS ne stocke pas le mot de passe — il fait confiance à Entra ID.
10. **A**
11. Outil IAM (AWS IAM Access Analyzer, Entra ID Access Reviews). Générer un rapport des permissions par utilisateur, identifier les permissions non utilisées (last accessed), organiser une revue avec les managers.
12. Violation du moindre privilège. Solution : créer un rôle "Stagiaire" avec les permissions minimales (lecture seule, pas de production, pas de suppression). Assigner le stagiaire à ce rôle. Audit trimestriel pour vérifier.
13. **A**
14. "Aujourd'hui, quand un employé part, combien de temps pour couper tous ses accès ? Avec le SSO, c'est instantané. Sans SSO, c'est des heures avec un risque d'oubli. Un ex-employé qui conserve un accès, c'est une fuite de données potentielle. Le SSO, c'est de la sécurité, pas du confort."
15. **A**

### D-E. Corrigés — Modules 4 & 5
1. **A**
2. **A**
3. **A**
4. PCA = maintenir l'activité PENDANT (procédures manuelles, solutions de contournement). PRA = restaurer les systèmes APRÈS (technique). Le PCA inclut le PRA. Le PRA est la partie technique du PCA.
5. Un PCA périmé ou erroné donne une fausse confiance. Les systèmes changent, les équipes changent, les procédures deviennent obsolètes. Seul un test révèle la vérité.
6. RTO < 30 minutes, RPO = 0. Stratégie Multi-AZ + Multi-région Active-Active. Investissement élevé mais justifié par le coût d'interruption (50K€/h → un an d'infra Active-Active remboursé en 1 jour d'incident évité).
7. **A**
8. Incident Commander (décisions), Technical Lead (résolution technique), Communication Lead (info utilisateurs/direction), Scribe (documente la timeline). 4 rôles minimum.
9. Identifier la cause (goulot d'étranglement), optimiser la procédure (paralléliser, pré-chauffer), re-tester. Mettre à jour le PCA avec le RTO réel documenté et un plan d'amélioration. Communiquer l'écart à la direction.
10. **A**
11. "Une heure d'indisponibilité coûte X€. L'infrastructure multi-AZ coûte Y€/mois. En cas de panne AZ (probable 1-2 fois/an), on économise X heures × X€. Le ROI est atteint dès la première panne évitée."
12. Aucun PCA = aucune procédure en cas de sinistre. Panique, improvisation, perte de données potentielle. L'entreprise prend un risque inconsidéré. "On n'a jamais eu de problème" n'est pas une stratégie.
13. **A**
14. "Le PCA, c'est l'assurance de l'entreprise. On paie une assurance incendie sans espérer que le bâtiment brûle. Le PCA, c'est pareil pour l'informatique : on espère ne jamais s'en servir, mais le jour où on en a besoin, il est trop tard pour le créer."
15. **A**
1. **A**
2. **A**
3. Rapport d'audit sécurité + extrait de PCA + configuration RBAC documentée.
4. **A**
5. **A**
6. La sécurité transversale et la gouvernance sont les compétences qui distinguent un technicien d'un responsable. Un RSSI doit comprendre la technique ET la gestion des risques.
7. **A**
8. **A**