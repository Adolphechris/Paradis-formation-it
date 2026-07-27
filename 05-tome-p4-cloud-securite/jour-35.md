# TOME P4 — Jour 35 (14h)

## Découpage horaire opérationnel J35
- Analyse du besoin et cadrage du projet (contexte, exigences, contraintes) — **3h**
- Conception de l'architecture cloud sécurisée (AWS, VPC, IAM, KMS, WAF) — **4h**
- Rédaction du dossier de recommandation (architecture, sécurité, PCA, conformité, budget) — **4h**
- Préparation de la présentation de soutenance (slides, pitch, démo) — **2h**
- Validation P4 + pitch professionnel du numérique + suivi P1 — **1h**

---

> **🎯 PROJET DE SYNTHÈSE P4 — Dossier de recommandation cloud sécurisé**
>
> Tu es consultant en transformation numérique. Une PME bancaire de 200 employés souhaite migrer son infrastructure on-premise vers le cloud. Elle traite des données clients sensibles et doit respecter les réglementations bancaires et le RGPD.
>
> **Mission :** produire un dossier complet de recommandation incluant l'architecture cible, les mesures de sécurité, le plan de continuité, le cadre de conformité, et l'estimation budgétaire.
>
> **Livrable final :** un dossier professionnel de 10-15 pages + une présentation de soutenance de 10 minutes, prêts pour le portfolio.

---

## 1) Analyse du besoin et cadrage (3h)

### Objectifs d'apprentissage
- Analyser un besoin client réel et le traduire en exigences techniques.
- Identifier les contraintes métier, réglementaires, et budgétaires.
- Définir le périmètre du projet et les critères de succès.
- Structurer une démarche de consulting IT professionnelle.

### Contenu pédagogique
Le consulting IT commence par l'écoute et le cadrage. Avant de proposer une solution, il faut comprendre le problème.

**Contexte du client :**
- PME bancaire, 200 employés, 2 agences.
- Infrastructure actuelle : 5 serveurs physiques on-premise (AD, fichiers, messagerie, DB, applicatif métier).
- Problèmes : pannes matérielles récurrentes, pas de redondance, pas de PCA, difficulté à scaler, coûts de maintenance élevés.
- Objectifs : migrer vers le cloud (AWS ou Azure), moderniser l'infrastructure, garantir la sécurité et la conformité, réduire les coûts à moyen terme, avoir un PCA.

**Points clés du cadrage :**
1. **Exigences fonctionnelles** : authentification centralisée (SSO), stockage fichiers sécurisé, messagerie, base de données métier, application web métier.
2. **Exigences non fonctionnelles** : disponibilité 99.9%, RTO < 4h, RPO < 1h, chiffrement de toutes les données, conformité RGPD + réglementation bancaire, budget migration < 50 000€, budget opérationnel < 3 000€/mois.
3. **Contraintes** : les données DOIVENT rester en Europe, la solution doit être simple à administrer (équipe IT de 2 personnes), la migration doit se faire avec un minimum d'interruption de service.
4. **Critères de succès** : infrastructure 100% cloud migrée en 3 mois, tous les SLA respectés, audit de sécurité réussi, PCA testé et validé.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : reformuler les besoins du client en 5 exigences techniques précises et mesurables.
   - **Corrigé** : (1) La solution doit offrir une disponibilité de 99.9% (8.76h d'indisponibilité max/an). (2) Toutes les données au repos doivent être chiffrées avec AES-256, clés gérées par KMS. (3) L'authentification des utilisateurs doit passer par un SSO fédéré (Entra ID ou AWS SSO). (4) Le RTO en cas de sinistre majeur ne doit pas dépasser 4h. (5) Le coût opérationnel mensuel ne doit pas dépasser 3 000€.
2. **Exercice 2 (intermédiaire)** : identifier les risques et contraintes du projet de migration. Classer par criticité.
3. **Exercice 3 (avancé)** : rédiger la lettre de mission (Statement of Work) d'une page résumant le contexte, les objectifs, le périmètre, les livrables, le planning et le budget.

### Banque de questions du module (15)
1. QCM: la première étape d'un projet de consulting IT est... A) l'analyse du besoin B) la solution technique C) le déploiement
2. QCM: un critère de succès doit être... A) mesurable B) vague C) optionnel
3. QCM: le RTO définit... A) le temps max de rétablissement B) le budget C) l'équipe
4. Ouverte: pourquoi identifier les contraintes avant de concevoir la solution ?
5. QCM: objectif du module 1 = A) cadrer le projet de façon professionnelle B) improviser C) éviter l'analyse

---

## 2) Conception de l'architecture cloud sécurisée (4h)

### Objectifs d'apprentissage
- Concevoir une architecture AWS complète pour une PME bancaire.
- Appliquer tous les principes de sécurité vus en P4.
- Dimensionner les ressources et estimer les coûts.
- Justifier chaque choix architectural.

### Architecture proposée (AWS — justifiée car services managés, conformité, marketplace)

**Schéma global :**
- **Réseau** : VPC `10.0.0.0/16`, 2 AZ (eu-west-3 Paris), sous-réseaux publics (bastion, ALB) et privés (EC2, RDS).
- **Compute** : EC2 t3.medium × 2 (auto-scaling) pour l'applicatif métier. Bastion pour admin.
- **Stockage** : S3 (fichiers, chiffré SSE-KMS, versioning), EBS gp3 pour les volumes EC2.
- **Base de données** : RDS PostgreSQL Multi-AZ (t3.medium, 100 Go, chiffré, backups 30 jours).
- **Authentification** : AWS IAM Identity Center fédéré avec Entra ID (SSO pour les employés Office 365).
- **Sécurité** : WAF sur ALB, Security Groups restrictifs, KMS pour le chiffrement, CloudTrail + GuardDuty + Config.
- **PCA/PRA** : RDS Multi-AZ (bascule auto), AMI de l'applicatif, snapshots cross-région, DNS failover Route 53.
- **Messagerie** : migration vers Microsoft 365 (SaaS, plus de serveur mail on-premise).
- **Active Directory** : AWS Managed Microsoft AD ou maintien on-premise avec VPN site-à-site.

**Justification des choix :**
- AWS (plutôt qu'Azure) : plus mature, plus de services, documentation abondante, région Paris.
- RDS (plutôt qu'EC2 auto-géré) : backups automatiques, Multi-AZ simplifié, patching géré.
- S3 (plutôt que EFS) : moins cher pour les fichiers, versioning, chiffrement natif.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : dessiner le diagramme d'architecture AWS (ASCII ou outil). Identifier tous les composants et leurs interactions.
2. **Exercice 2 (intermédiaire)** : dimensionner les ressources (EC2, RDS, S3) selon les besoins du client (200 employés, 500 Go de fichiers, 50 Go DB). Justifier les choix de taille.
3. **Exercice 3 (avancé)** : estimer le coût mensuel AWS avec AWS Pricing Calculator (EC2, RDS, S3, NAT Gateway, WAF, data transfer). Comparer au budget de 3 000€/mois.

### Banque de questions du module (15)
1. QCM: Multi-AZ pour RDS fournit... A) la haute disponibilité B) plus de CPU C) le chiffrement
2. QCM: S3 SSE-KMS utilise... A) AWS KMS pour le chiffrement B) un chiffrement simple C) rien
3. QCM: le bastion est placé en sous-réseau... A) public B) privé C) isolé
4. Ouverte: pourquoi choisir AWS plutôt qu'Azure pour ce client ?
5. QCM: objectif du module 2 = A) concevoir une architecture cloud complète et justifiée B) improviser C) éviter le cloud

---

## 3) Dossier de recommandation (4h)

### Objectifs d'apprentissage
- Rédiger un dossier professionnel structuré.
- Intégrer toutes les dimensions : technique, sécurité, conformité, financière.
- Produire un document prêt à être présenté à une direction.

### Structure du dossier (10-15 pages)

1. **Résumé exécutif** (1 page) — les 5 points clés pour un décideur pressé.
2. **Situation actuelle et enjeux** (1 page) — l'existant, les problèmes, les risques.
3. **Architecture cible** (3 pages) — diagramme, description des composants, justification des choix.
4. **Plan de sécurité** (2 pages) — défense en profondeur, IAM, chiffrement, WAF, monitoring.
5. **Plan de continuité d'activité** (2 pages) — BIA, RPO/RTO, stratégie, procédure de bascule, tests.
6. **Conformité** (1 page) — RGPD, réglementation bancaire, localisation des données.
7. **Plan de migration** (1 page) — phases, planning, risques, rollback.
8. **Budget** (1 page) — coûts setup, coûts opérationnels, TCO 3 ans, ROI vs on-premise.

### Banque de questions du module (15)
1. QCM: un dossier de recommandation contient... A) architecture, sécurité, budget B) uniquement du code C) rien
2. QCM: le résumé exécutif s'adresse... A) aux décideurs pressés B) aux développeurs C) aux concurrents
3. QCM: objectif du module 3 = A) produire un dossier professionnel complet B) bâcler C) éviter d'écrire

---

## 4) Présentation de soutenance (2h)

### Objectifs d'apprentissage
- Préparer une présentation exécutive de 10 minutes.
- Défendre ses choix face à un comité.
- Utiliser des slides professionnels.

### Structure de la présentation (10 slides, 1 min/slide)
1. Titre + contexte
2. Problèmes actuels
3. Architecture cible (diagramme)
4. Sécurité (zoom)
5. PCA (zoom)
6. Conformité
7. Budget et ROI
8. Plan de migration
9. Risques et mitigations
10. Conclusion et prochaines étapes

### Banque de questions du module (15)
1. QCM: une slide efficace contient... A) 1 idée + 3 bullet points B) tout le script C) rien
2. QCM: objectif du module 4 = A) présenter et défendre ses recommandations B) lire ses slides C) éviter de parler

---

## 5) Validation P4 + pitch + suivi P1 (1h)

### Livrables obligatoires
1. Dossier de recommandation (10-15 pages)
2. Diagramme d'architecture cloud
3. Estimation budgétaire détaillée
4. Présentation de soutenance (10 slides)
5. Pitch "Professionnel du numérique" (90 secondes)

### Grille d'évaluation P4 (100 points)
- Qualité du cadrage et analyse du besoin : **15 pts**
- Qualité de l'architecture cloud (justesse, sécurité, justification) : **30 pts**
- Qualité du dossier (structure, clarté, exhaustivité) : **25 pts**
- Qualité de la présentation (slides, pitch, défense) : **20 pts**
- Communication professionnelle : **10 pts**

### 🏆 FÉLICITATIONS — Fin du Tome P4 !

**Prochaine étape : Tome P5 — Préparation intensive tests et entretiens (J36-J41).**

---

## Corrigés guidés — mode tuteur

### A. Module 1 (Cadrage)
1. **A**
2. **A**
3. **A**
4. Les contraintes limitent le champ des possibles. Proposer une solution qui viole une contrainte (budget, localisation données) = proposition rejetée. Les identifier tôt évite de travailler sur une solution impossible.
5. **A**

### B. Module 2 (Architecture)
1. **A**
2. **A**
3. **A**
4. AWS a la région Paris (eu-west-3), les services sont plus matures, la documentation est plus riche. Pour une PME avec une petite équipe IT, la simplicité d'administration et la fiabilité priment. Si le client utilisait déjà massivement Office 365, Azure serait plus pertinent.
5. **A**

### C. Module 3 (Dossier)
1. **A**
2. **A**
3. **A**

### D-E. Modules 4 & 5
1. **A**
2. **A**


---

## Validation qualité J35 — Projet de synthèse P4 (anti-superficiel)

### Grille d'évaluation (sur 100 points)
- Analyse du besoin et cadrage : **20 pts**
- Architecture cloud sécurisée (VPC, IAM, KMS, WAF) : **25 pts**
- Dossier de recommandation (10-15 pages, structuré) : **25 pts**
- Présentation de soutenance (clarté, pertinence, réponses aux questions) : **20 pts**
- Cohérence avec le poste cible (Professionnel du numérique, contexte bancaire) : **10 pts**

### Seuil attendu
- **>= 80/100** : P4 validé, passage à P5 (préparation tests) normal.
- **65-79/100** : remédiation ciblée sur les points faibles avant P5.
- **< 65/100** : révision approfondie P4 avant de poursuivre.

### Check-lists de validation — Dossier de recommandation
- [ ] L'architecture cible est dessinée et documentée (schéma clair, IP, sous-réseaux)
- [ ] Chaque service cloud est justifié (pourquoi AWS ? pourquoi ce service ?)
- [ ] Les mesures de sécurité couvrent : chiffrement, IAM, pare-feu, monitoring, sauvegarde
- [ ] Le PCA/PRA est documenté avec RTO et RPO chiffrés
- [ ] Le cadre de conformité (RGPD, réglementation bancaire) est explicitement adressé
- [ ] L'estimation budgétaire est réaliste et justifiée par des références de prix
- [ ] Le pitch de 10 minutes est structuré : contexte → solution → sécurité → coût → bénéfice

### Prérequis avant validation J35
- Avoir relu au moins P0, P2 et P3-A intégralement
- Avoir en mémoire la checklist de durcissement J15 (7 points minimum)
- Être capable d'expliquer la différence PCA vs PRA oralement en 30 secondes
- Avoir un portfolio contenant au minimum 3 preuves de projets P2/P3

