# TOME P4 — Jour 32 (14h)

## Découpage horaire opérationnel J32
- Gouvernance IT (ITIL, COBIT, gestion des services, SLA, KPI) — **4h**
- Conformité et réglementation (RGPD, NIS2, ISO 27001, SOC2) — **4h**
- Gestion de projet IT appliquée (méthodologies, cycle de vie, cahier des charges) — **3h**
- Gestion des risques IT (analyse, mitigation, registre des risques) — **2h**
- Banque de questions + suivi P1 — **1h**

---

## 1) Gouvernance IT — ITIL, COBIT, gestion des services (4h)

### Objectifs d'apprentissage
- Comprendre les frameworks de gouvernance IT (ITIL 4, COBIT 2019).
- Maîtriser le cycle de vie des services IT (stratégie, conception, transition, exploitation, amélioration).
- Définir et suivre des SLA (Service Level Agreement), OLA, et KPI.
- Différencier gestion des incidents, problèmes, changements, et demandes.
- Appliquer l'amélioration continue (PDCA : Plan, Do, Check, Act).

### Contenu pédagogique
La gouvernance IT aligne l'informatique avec les objectifs business. Sans gouvernance, l'IT est un centre de coûts ; avec, c'est un levier stratégique.

Points clés:
1. **ITIL 4 (Information Technology Infrastructure Library)** : le framework le plus adopté pour la gestion des services IT. Basé sur le concept de "Service Value System" (SVS) : Opportunity/Demand → Service Value Chain → Value. 7 principes directeurs : focus on value, start where you are, progress iteratively, collaborate, think holistically, keep it simple, optimize & automate.
2. **COBIT 2019 (Control Objectives for Information Technologies)** : framework de gouvernance et de gestion de l'IT d'entreprise. 40 objectifs de gouvernance et de gestion organisés en 5 domaines : EDM (Evaluate, Direct, Monitor) + APO (Align, Plan, Organize) + BAI (Build, Acquire, Implement) + DSS (Deliver, Service, Support) + MEA (Monitor, Evaluate, Assess). COBIT est plus orienté "contrôle et conformité", ITIL est plus orienté "service et valeur".
3. **SLA, OLA, KPI** :
   - **SLA (Service Level Agreement)** : contrat entre le fournisseur IT et le client. Ex: "Disponibilité du service 99.9%, temps de réponse < 1h pour les incidents P1."
   - **OLA (Operational Level Agreement)** : accord interne entre équipes IT. Ex: "L'équipe réseau s'engage à résoudre les tickets escaladés en < 4h."
   - **KPI (Key Performance Indicator)** : indicateur mesurable. Ex: "Taux de résolution en < SLA = 95%", "MTTR moyen = 2h".
4. **Cycle de vie des incidents ITIL** : Incident (interruption non planifiée) → résolution immédiate. Problème (cause racine inconnue) → RCA + solution permanente. Changement (modification planifiée) → évaluation, approbation, déploiement. Demande de service (requête standard) → exécution pré-approuvée.
5. **Amélioration continue (PDCA)** : Plan (identifier l'opportunité, définir les objectifs) → Do (implémenter la solution à petite échelle) → Check (mesurer les résultats par rapport aux objectifs) → Act (généraliser si succès, ajuster si échec). Itérer en continu.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : classifier 6 situations selon le processus ITIL approprié : (a) serveur down, (b) 5 incidents similaires en 2 semaines, (c) mise à jour OS planifiée, (d) demande de création de compte, (e) temps de réponse dégradé depuis 3 mois, (f) demande d'accès VPN.
   - **Corrigé** : (a) Incident — résolution immédiate. (b) Problème — RCA sur les 5 incidents. (c) Changement — évaluation + approbation + fenêtre de maintenance. (d) Demande de service — exécution standard. (e) Problème — investigation de la dégradation progressive. (f) Demande de service — exécution standard.
2. **Exercice 2 (intermédiaire)** : rédiger un SLA pour l'application TaskFlow (P3-C). Définir la disponibilité, le temps de réponse, le temps de résolution, les plages de support, et les pénalités.
   - **Corrigé** : Disponibilité : 99.5% (hors maintenance planifiée). Temps de réponse : P1 < 30 min, P2 < 2h, P3 < 8h, P4 < 24h. Temps de résolution : P1 < 4h, P2 < 8h, P3 < 48h, P4 < 5 jours. Plages de support : lun-ven 8h-18h. Pénalités : 5% de réduction par tranche de 0.1% de disponibilité perdue. Maintenance planifiée : dimanche 2h-6h, notifiée 48h à l'avance.
3. **Exercice 3 (avancé)** : appliquer le cycle PDCA à un problème concret : "Le temps moyen de résolution des incidents a augmenté de 40% en 6 mois." Plan → Do → Check → Act avec des actions mesurables.
   - **Corrigé** : Plan : Objectif = réduire le MTTR de 40% en 3 mois. Analyse : les incidents P2 et P3 prennent le plus de temps, souvent en attente d'escalade. Do : Créer un runbook pour les 10 incidents les plus fréquents. Former l'équipe N1 à les résoudre sans escalade. Check : Mesurer le MTTR après 1 mois. Act : Si MTTR en baisse > 20% → déployer la formation à toute l'équipe. Si < 20% → analyser pourquoi les runbooks ne fonctionnent pas, itérer.

### Nouvelles abréviations rencontrées
- ITIL | *(déjà existant, section J)* | Information Technology Infrastructure Library | Interagit avec COBIT, les SLA, la gestion des services
- COBIT | Control Objectives for Information Technologies | Framework de gouvernance IT | Interagit avec ITIL, les audits, la conformité
- OLA | Operational Level Agreement | Accord interne entre équipes IT | Interagit avec les SLA, les KPI, la gestion des services
- PDCA | Plan-Do-Check-Act | Cycle d'amélioration continue (roue de Deming) | Interagit avec ITIL, la qualité, les processus

### Banque de questions du module (15)
1. QCM: ITIL est un framework de... A) gestion des services IT B) développement logiciel C) sécurité
2. QCM: un SLA définit... A) le niveau de service entre fournisseur et client B) le budget C) les technologies
3. QCM: dans ITIL, un problème est... A) la cause racine inconnue d'incidents B) un incident critique C) une demande utilisateur
4. Ouverte: différence entre ITIL et COBIT.
5. Ouverte: pourquoi différencier incident, problème, et changement ?
6. Cas: un SLA promet 99.9% mais le service est down 2h par mois. Respecté ?
7. QCM: PDCA signifie... A) Plan, Do, Check, Act B) Plan, Deploy, Configure, Audit C) rien
8. Ouverte: comment définir des KPI pertinents pour une équipe support ?
9. Cas: le client demande un SLA 100%. Réponse ?
10. QCM: une OLA est un accord entre... A) équipes internes B) fournisseur et client C) concurrents
11. Ouverte: pourquoi l'amélioration continue est-elle un principe clé d'ITIL ?
12. Cas: 200 tickets en attente depuis 2 semaines. Actions prioritaires ?
13. QCM: objectif du module 1 = A) appliquer les principes de gouvernance IT B) ignorer les processus C) tout faire en urgence
14. Ouverte: comment convaincre la direction d'adopter ITIL ?
15. QCM: résultat attendu = A) SLA + KPI + processus documentés B) chaos C) pas de gouvernance

---

## 2) Conformité et réglementation — RGPD, NIS2, ISO 27001 (4h)

### Objectifs d'apprentissage
- Comprendre les exigences clés du RGPD (données personnelles, droits, obligations).
- Identifier les impacts de NIS2 (sécurité des réseaux et systèmes d'information).
- Connaître les principes de l'ISO 27001 (SMSI — Système de Management de la Sécurité de l'Information).
- Distinguer conformité, certification, et attestation (SOC2).
- Appliquer les principes de privacy by design et data minimization.

### Contenu pédagogique
La conformité n'est pas une option — c'est une obligation légale et contractuelle. Dans le contexte bancaire, c'est encore plus critique.

Points clés:
1. **RGPD (Règlement Général sur la Protection des Données)** : applicable à toute organisation traitant des données de résidents européens. Principes clés : licéité, loyauté, transparence ; limitation des finalités ; minimisation des données ; exactitude ; limitation de la conservation ; intégrité et confidentialité. Droits des personnes : accès, rectification, effacement ("droit à l'oubli"), portabilité, opposition. Obligations : DPO (Data Protection Officer), registre des traitements, notification des violations sous 72h, AIPD (Analyse d'Impact) pour les traitements à risque.
2. **NIS2 (Network and Information Security Directive 2)** : directive européenne sur la cybersécurité. Élargit le périmètre de NIS1 : s'applique aux secteurs critiques (énergie, transport, santé, infrastructures numériques, banque). Obligations : mesures de sécurité techniques et organisationnelles, notification des incidents significatifs sous 24h, responsabilité des dirigeants.
3. **ISO 27001** : norme internationale pour le SMSI (Système de Management de la Sécurité de l'Information). Basée sur l'amélioration continue (PDCA). 114 contrôles dans l'Annexe A (ISO 27002) couvrant : politiques de sécurité, organisation, ressources humaines, gestion des actifs, contrôle d'accès, chiffrement, sécurité physique, sécurité opérationnelle, communications, acquisition, relations fournisseurs, gestion des incidents, continuité, conformité. La certification ISO 27001 est un argument commercial fort.
4. **SOC2 (Service Organization Control 2)** : norme d'audit américaine pour les fournisseurs de services (SaaS, cloud). 5 critères : Sécurité, Disponibilité, Intégrité du traitement, Confidentialité, Privacy. Rapport SOC2 Type I (à un instant T) vs Type II (sur une période, généralement 6-12 mois).
5. **Privacy by design** : intégrer la protection des données dès la conception du système, pas après coup. Principes : minimisation des données (ne collecter que le nécessaire), pseudonymisation, transparence, contrôle utilisateur. Exemple : dans TaskFlow, ne pas collecter la date de naissance si ce n'est pas nécessaire.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : pour l'application TaskFlow, identifier 3 données personnelles collectées, leur finalité, leur base légale, et leur durée de conservation.
   - **Corrigé** : (1) Email → finalité : authentification et notifications → base légale : exécution du contrat → durée : jusqu'à suppression du compte. (2) Nom → finalité : personnalisation → base légale : intérêt légitime → durée : jusqu'à suppression du compte. (3) Tâches créées → finalité : service principal → base légale : exécution du contrat → durée : jusqu'à suppression par l'utilisateur.
2. **Exercice 2 (intermédiaire)** : rédiger une procédure de notification de violation de données conforme au RGPD (72h). Scénario : une base de données exposée publiquement pendant 4h, contenant des emails et des tâches.
   - **Corrigé** : T+0 : Détection → confinement immédiat. T+1h : Analyse de l'impact (quelles données, combien de personnes, quel risque). T+24h : Notification à l'autorité de contrôle (CNIL) via le formulaire dédié : nature de la violation, catégories de données, nombre de personnes, conséquences probables, mesures prises. T+48h : Notification aux personnes concernées SI risque élevé (email, nom + tâches = risque modéré, pas de notification obligatoire si chiffré). Documenter toutes les actions (accountability).
3. **Exercice 3 (avancé)** : réaliser une mini-AIPD (Analyse d'Impact sur la Protection des Données) pour une fonctionnalité hypothétique "TaskFlow Analytics" qui analyserait les patterns de productivité des utilisateurs.
   - **Corrigé** : (1) Description du traitement : analyse des heures de travail, temps par tâche, patterns de productivité. (2) Nécessité/proportionnalité : utile pour les recommandations mais pas strictement nécessaire au service. (3) Risques : surveillance excessive, profilage, décision automatisée. (4) Mesures : opt-in explicite, possibilité de désactiver, anonymisation des données agrégées, pas de partage avec des tiers. Conclusion : risque modéré → mesures acceptables → traitement autorisé avec consentement explicite.

### Nouvelles abréviations rencontrées
- RGPD/GDPR | *(déjà existant, section J)* | Règlement Général sur la Protection des Données | Interagit avec la conformité, les droits des personnes, la sécurité
- NIS2 | Network and Information Security Directive 2 | Directive européenne sur la cybersécurité | Interagit avec les secteurs critiques, la notification d'incidents
- SMSI/ISMS | Système de Management de la Sécurité de l'Information | Cadre de gestion de la sécurité selon ISO 27001 | Interagit avec les politiques, les contrôles, les audits
- DPO | Data Protection Officer | Délégué à la protection des données (obligatoire dans certains cas) | Interagit avec le RGPD, la CNIL, les traitements de données

### Banque de questions du module (15)
1. QCM: le RGPD protège... A) les données personnelles des résidents européens B) toutes les données C) les données bancaires uniquement
2. QCM: une violation de données doit être notifiée sous... A) 72h B) 24h C) 1 mois
3. QCM: ISO 27001 certifie... A) un Système de Management de la Sécurité de l'Information B) un produit C) un logiciel
4. Ouverte: différence entre RGPD et NIS2.
5. Ouverte: qu'est-ce que le "droit à l'oubli" (effacement) ?
6. Cas: un client demande la suppression de toutes ses données. Délai légal ?
7. QCM: "Privacy by design" signifie... A) intégrer la protection des données dès la conception B) ajouter la sécurité après C) ignorer la vie privée
8. Ouverte: pourquoi la minimisation des données est-elle un principe clé ?
9. Cas: l'application collecte la date de naissance sans raison. Problème RGPD ?
10. QCM: SOC2 est une norme d'audit... A) américaine pour les fournisseurs de services B) européenne C) française
11. Ouverte: comment préparer une entreprise à la certification ISO 27001 ?
12. Cas: un prestataire cloud héberge des données personnelles. Quel contrat signer ?
13. QCM: objectif du module 2 = A) comprendre les obligations de conformité B) ignorer la réglementation C) collecter toutes les données
14. Ouverte: comment expliquer le RGPD à un développeur ?
15. QCM: résultat attendu = A) conformité RGPD + ISO 27001 comprise B) aucune conformité C) données non protégées

---

## 3) Gestion de projet IT appliquée (3h)

### Objectifs d'apprentissage
- Distinguer les méthodologies de gestion de projet (Waterfall, Agile, Scrum).
- Rédiger un cahier des charges fonctionnel et technique.
- Estimer les charges et planifier un projet.
- Gérer les risques projet (matrice impact × probabilité).
- Communiquer avec les parties prenantes (reporting, comité de pilotage).

### Contenu pédagogique
Un projet IT sans méthode est un échec annoncé. La gestion de projet structurée fait la différence.

Points clés:
1. **Méthodologies** :
   - **Waterfall** : phases séquentielles (besoins → conception → implémentation → test → déploiement → maintenance). Avantage : prévisible, documenté. Inconvénient : rigide, le client voit le produit à la fin.
   - **Agile/Scrum** : itérations courtes (sprints 2-4 semaines), livraisons incrémentales, feedback continu. Scrum : Product Owner (quoi), Scrum Master (comment), Developers (réalisation). Sprint Planning → Daily Scrum → Sprint Review → Sprint Retrospective.
   - **Quand choisir l'un ou l'autre ?** Waterfall : besoin clair, stable, projet réglementaire. Agile : besoin évolutif, innovation, feedback utilisateur nécessaire.
2. **Cahier des charges** : document structuré. Sections : Contexte et objectifs, Périmètre (fonctionnel et technique), Contraintes (budget, délai, qualité), Livrables attendus, Critères d'acceptation, Planning prévisionnel, Hypothèses et risques. Un bon cahier des charges évite les "mais je croyais que c'était inclus".
3. **Estimation des charges** : méthode du planning poker (Scrum, consensus d'équipe), méthode des 3 points (optimiste, probable, pessimiste → moyenne pondérée), analogie (projet similaire passé). Toujours ajouter 20-30% de marge pour les imprévus.
4. **Gestion des risques** : identifier les risques → analyser (probabilité × impact) → prioriser → définir des réponses (éviter, réduire, transférer, accepter) → monitorer. Registre des risques : tableau vivant mis à jour à chaque sprint/comité.
5. **Communication parties prenantes** : comité de pilotage (mensuel, décisionnel), rapport d'avancement (hebdomadaire, informatif), démo (fin de sprint, feedback). Toujours adapter le message au public : direction = synthèse, risques, budget ; technique = détails, architecture, blocages.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : pour le projet TaskFlow, choisir la méthodologie (Waterfall ou Agile) et justifier. Rédiger le cahier des charges en 1 page.
   - **Corrigé** : Agile — le besoin peut évoluer (feedback utilisateur), livraisons itératives, équipe de 1 personne (auto-organisée). Cahier des charges : Contexte (app de gestion de tâches), Périmètre (auth, CRUD tâches, dashboard, déploiement), Contraintes (6 jours, gratuit), Critères d'acceptation (tests fonctionnels, déploiement réussi).
2. **Exercice 2 (intermédiaire)** : estimer la charge de développement de TaskFlow avec la méthode des 3 points. 6 modules : auth (2-3-5j), CRUD tasks (3-5-8j), dashboard (1-2-4j), déploiement (1-2-3j), tests (1-2-3j), documentation (0.5-1-2j). Calculer l'estimation PERT et la marge.
   - **Corrigé** : PERT = (Optimiste + 4×Probable + Pessimiste) / 6. Auth = (2+12+5)/6 = 3.2j. CRUD = (3+20+8)/6 = 5.2j. Dashboard = (1+8+4)/6 = 2.2j. Déploiement = (1+8+3)/6 = 2.0j. Tests = (1+8+3)/6 = 2.0j. Doc = (0.5+4+2)/6 = 1.1j. Total = 15.7j. Avec 20% marge = 18.8j → arrondi à 19 jours. (Pour un projet intensif en 6 jours, ça se tient car 14h/jour.)
3. **Exercice 3 (avancé)** : identifier 5 risques pour le projet TaskFlow, analyser leur probabilité et impact, et définir des réponses. Remplir le registre des risques.
   - **Corrigé** : (1) API externe non disponible → probabilité=haute, impact=moyen → Réponse : mock API en local. (2) Problème de CORS en déploiement → P=moyenne, I=haute → Réponse : tester le déploiement tôt (J27). (3) Perte de données DB → P=basse, I=critique → Réponse : backups automatiques. (4) Token JWT expiré → P=moyenne, I=moyen → Réponse : refresh token automatique. (5) Dépassement du temps → P=haute, I=moyen → Réponse : prioriser les features (MoSCoW : Must, Should, Could, Won't).

### Nouvelles abréviations rencontrées
- MoSCoW | Must, Should, Could, Won't | Méthode de priorisation des fonctionnalités | Interagit avec Agile, le backlog, le cahier des charges
- PERT | Program Evaluation and Review Technique | Méthode d'estimation à 3 points | Interagit avec la planification, la gestion des risques
- MVP | *(déjà existant)* | Minimum Viable Product — utilisé en Agile | Interagit avec les sprints, le backlog, le feedback

### Banque de questions du module (15)
1. QCM: en Scrum, un sprint dure... A) 2-4 semaines B) 1 jour C) 6 mois
2. QCM: le Product Owner est responsable de... A) définir les priorités (quoi) B) coder C) animer les cérémonies
3. QCM: la méthode PERT utilise... A) 3 estimations B) 1 estimation C) 10 estimations
4. Ouverte: quand choisir Waterfall plutôt qu'Agile ?
5. Ouverte: à quoi sert un cahier des charges ?
6. Cas: le client demande une nouvelle feature en milieu de sprint. Que faire ?
7. QCM: MoSCoW aide à... A) prioriser les fonctionnalités B) estimer le budget C) coder
8. Ouverte: pourquoi identifier les risques dès le début du projet ?
9. Cas: le projet a 2 semaines de retard. Communication au comité de pilotage ?
10. QCM: un registre des risques est... A) un document vivant B) un fichier figé C) optionnel
11. Ouverte: comment estimer la durée d'un projet sans expérience préalable ?
12. Cas: "Tout est prioritaire." — Que répondre ?
13. QCM: objectif du module 3 = A) gérer un projet IT de façon professionnelle B) improviser C) éviter la planification
14. Ouverte: comment gérer un projet IT en solo (comme PARADIS) ?
15. QCM: résultat attendu = A) cahier des charges + planification + risques B) pas de plan C) chaos

---

## 4) Gestion des risques IT — analyse, mitigation (2h)

### Objectifs d'apprentissage
- Identifier les risques IT (cybersécurité, opérationnels, stratégiques, conformité).
- Évaluer les risques avec une matrice probabilité × impact.
- Définir des stratégies de traitement (éviter, réduire, transférer, accepter).
- Maintenir un registre des risques.
- Communiquer les risques à la direction.

### Contenu pédagogique
Le risque zéro n'existe pas. La gestion des risques est l'art de prendre des décisions éclairées face à l'incertitude.

Points clés:
1. **Typologie des risques IT** : Cybersécurité (attaque, fuite de données), Opérationnels (panne, erreur humaine), Stratégiques (mauvais choix technologique, obsolescence), Conformité (non-respect RGPD, amende), Financiers (dépassement budget), Réputation (incident médiatisé).
2. **Matrice probabilité × impact** : Probabilité (1-5) × Impact (1-5) = Score (1-25). Score ≥ 15 = Critique (action immédiate). Score 8-14 = Majeur (plan d'action). Score 4-7 = Modéré (surveiller). Score 1-3 = Mineur (accepter).
3. **Stratégies de traitement** : Éviter (ne pas faire l'action risquée), Réduire (mettre en place des contrôles), Transférer (assurance, sous-traitance), Accepter (risque faible, coût de mitigation > coût du risque). Exemple : risque de panne serveur → Réduire (Multi-AZ) + Accepter le risque résiduel.
4. **Registre des risques** : tableau structuré : ID, Description, Catégorie, Probabilité (1-5), Impact (1-5), Score, Stratégie, Actions, Responsable, Échéance, Statut. Révisé trimestriellement.
5. **Communication à la direction** : parler en termes business. Pas "il y a un risque de SQL injection" mais "il y a un risque que des données clients soient volées, impact estimé à 500K€ d'amende + perte de clients". Toujours quantifier l'impact en euros, jours d'indisponibilité, ou nombre de clients impactés.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : identifier 5 risques IT pour une PME utilisant TaskFlow. Remplir le registre des risques (probabilité, impact, stratégie).
2. **Exercice 2 (intermédiaire)** : pour le risque "panne de la base de données", calculer le coût annuel attendu (ALE = Annual Loss Expectancy). Probabilité annuelle = 5%, Impact = 4h × 500€/h = 2 000€. ALE = 0.05 × 2000 = 100€/an. Comparer au coût de mitigation (RDS Multi-AZ = 50€/mois = 600€/an). Conclusion : la mitigation coûte plus cher que le risque → Accepter ? Non, car l'impact réputationnel n'est pas inclus.
   - **Corrigé** : ALE = 100€/an (impact financier seul). Coût mitigation = 600€/an. Si on inclut l'impact réputationnel (perte de confiance = 5 000€), ALE = 0.05 × 7000 = 350€/an. Toujours inférieur à 600€. Mais si la probabilité est sous-estimée (ex: 20% en réalité), ALE = 0.20 × 7000 = 1400€/an → mitigation rentable. La décision dépend de la confiance dans l'estimation.
3. **Exercice 3 (avancé)** : présenter le risque "cyberattaque" à un comité de direction en 3 slides. Slide 1 : le risque. Slide 2 : l'impact business. Slide 3 : le plan d'action et le budget.

### Banque de questions du module (15)
1. QCM: un risque avec probabilité 5 et impact 5 a un score de... A) 25 (critique) B) 10 C) 5
2. QCM: transférer un risque signifie... A) prendre une assurance B) supprimer le risque C) l'ignorer
3. QCM: ALE signifie... A) Annual Loss Expectancy B) Average Loss Estimate C) rien
4. Ouverte: différence entre réduire et éviter un risque.
5. Ouverte: pourquoi quantifier l'impact des risques en euros ?
6. Cas: un risque de score 16 est identifié mais le plan d'action coûte 100 000€. Arbitrage ?
7. QCM: le registre des risques doit être révisé... A) régulièrement (trimestriel) B) une fois C) jamais
8. QCM: objectif du module 4 = A) gérer les risques de façon structurée B) ignorer les risques C) tout accepter
9. QCM: résultat attendu = A) registre des risques documenté B) aucun risque identifié C) panique

---

## 5) Banque de questions + suivi P1 (1h)

### Objectifs d'apprentissage
- Valider les acquis J32. Planifier J33 (Anglais technique I).

### Banque de questions du module (15)
1. QCM: objectif final J32 = A) gouvernance + conformité + gestion de projet B) théorie C) rien
2. QCM: plan J33 = A) anglais technique I B) retour C) fin
3. Ouverte: meilleure preuve J32 à montrer ?
4. QCM: preuve solide = A) SLA + registre des risques + cahier des charges B) promesse C) rien
5. QCM: résultat P1 réussi = A) portfolio enrichi B) rien C) théorie
6. Ouverte: comment relier J32 au poste de professionnel du numérique ?
7. QCM: remédiation = A) corriger la lacune B) recommencer C) abandonner
8. QCM: résultat attendu = A) gouvernance et conformité comprises B) aucun processus C) risques ignorés

---

## Validation qualité J32 (anti-superficiel)

### Livrables obligatoires fin de J32
1. 1 SLA documenté pour TaskFlow (disponibilité, temps de réponse/résolution, pénalités).
2. 1 registre des risques IT (5 risques identifiés, évalués, avec plan d'action).
3. 1 cahier des charges simplifié pour un projet IT.
4. 1 document de conformité RGPD simplifié (données collectées, finalité, base légale).
5. 1 preuve portfolio (extrait SLA ou registre des risques) + mise à jour CV ligne gouvernance/conformité.

### Grille d'évaluation rapide (100 points)
- Gouvernance IT (ITIL, SLA, KPI, processus) : **30 pts**
- Conformité et réglementation (RGPD, NIS2, ISO 27001, privacy) : **30 pts**
- Gestion de projet IT (méthodologies, cahier des charges, estimation) : **20 pts**
- Gestion des risques (matrice, stratégies, registre) : **10 pts**
- Communication technique employabilité : **10 pts**

### Seuil attendu
- **>= 80/100** : J32 validé, passage normal J33.
- **65-79/100** : validé sous remédiation ciblée 24h.
- **< 65/100** : consolidation gouvernance requise avant J33.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Gouvernance IT)
1. **A**
2. **A**
3. **A**
4. ITIL = gestion des SERVICES IT (comment délivrer de la valeur). COBIT = GOUVERNANCE (comment contrôler et auditer). ITIL pour le "comment faire", COBIT pour le "comment prouver qu'on fait bien".
5. Incident = interruption → résoudre vite. Problème = cause racine → empêcher la répétition. Changement = modification → évaluer avant. Les traiter de la même façon mène à des correctifs temporaires sans solution durable.
6. 99.9% de temps de disponibilité = 8.76h d'indisponibilité autorisée par an (0.1% × 8760h). 2h par mois = 24h/an → SLA non respecté. Le client peut demander des pénalités.
7. **A**
8. SMART : Spécifique (quoi mesurer), Mesurable (comment), Atteignable (réaliste), Réaliste (pertinent), Temporel (quand). Ex: "Taux de résolution en < SLA = 90% ce trimestre." Éviter les KPI vanity (ex: nombre de tickets fermés, qui incite à fermer vite sans résoudre).
9. "100% est techniquement impossible — tout système a un risque résiduel. Nous pouvons atteindre 99.99% (52 min/an) avec une architecture multi-AZ + multi-région. Le coût est X. Quel est votre vrai besoin ?"
10. **A**
11. La technologie et les besoins business évoluent constamment. Sans amélioration continue, les processus deviennent obsolètes et le service se dégrade progressivement. PDCA garantit l'adaptation.
12. Tri urgent : analyser les tickets par priorité, identifier les blocages (manque de ressources ? dépendance externe ?), communiquer avec les clients ("nous avons un retard, voici le plan"), et mettre en place une task force pour résorber le backlog.
13. **A**
14. "Aujourd'hui, chaque incident est géré différemment selon la personne. Avec ITIL, tout le monde suit les mêmes processus, les clients savent à quoi s'attendre (SLA), et on mesure la performance (KPI). Résultat : moins de stress, plus de qualité."
15. **A**

### B. Corrigé — Module 2 (Conformité)
1. **A**
2. **A**
3. **A**
4. RGPD = protection des DONNÉES PERSONNELLES (droits des personnes). NIS2 = CYBERSÉCURITÉ des infrastructures critiques (sécurité des réseaux). Complémentaires mais distincts.
5. Droit pour une personne de demander la suppression de ses données personnelles. Conditions : données plus nécessaires, consentement retiré, opposition légitime. Pas absolu : ne s'applique pas si une obligation légale impose la conservation.
6. 30 jours maximum (article 17 RGPD), avec possibilité de prolongation de 2 mois en cas de complexité. L'organisation doit répondre même si elle refuse (avec justification).
7. **A**
8. Moins de données = moins de risques en cas de fuite, moins de coûts de stockage, moins de complexité, et respect du principe de proportionnalité. "Si tu n'en as pas besoin, ne le collecte pas."
9. Oui, violation de la minimisation des données (article 5). La date de naissance n'est pas nécessaire pour un service de gestion de tâches. À supprimer. Si vraiment nécessaire, justifier la finalité et la base légale.
10. **A**
11. Gap analysis (état actuel vs exigences ISO 27001), définir le périmètre du SMSI, rédiger les politiques et procédures, implémenter les 114 contrôles, former le personnel, audit interne, audit de certification externe.
12. Un DPA (Data Processing Agreement) — contrat de sous-traitance conforme à l'article 28 du RGPD. Il définit les obligations du prestataire (instructions, sécurité, notification, sous-traitants ultérieurs).
13. **A**
14. "Ne collecte que les données dont tu as VRAIMENT besoin. Permets à l'utilisateur de voir, modifier, et supprimer ses données. Si tu stockes des données perso, protège-les (chiffrement). Si tu as une fuite, préviens immédiatement. Pense à la vie privée comme une feature, pas une contrainte."
15. **A**

### C. Corrigé — Module 3 (Gestion de projet)
1. **A**
2. **A**
3. **A**
4. Quand le besoin est clair, stable, et ne changera pas (ex: projet réglementaire, migration planifiée). Quand le client veut un prix fixe et une date fixe. Quand la documentation exhaustive est exigée (domaine médical, aéronautique).
5. Aligner les attentes entre le client et l'équipe. Définir clairement ce qui est dans le périmètre (et ce qui n'y est pas). Éviter les malentendus et le "scope creep".
6. L'ajouter au backlog (pas au sprint en cours). Le Product Owner décide si c'est prioritaire. Si c'est critique, on peut exceptionnellement remplacer une tâche du sprint de même taille, mais c'est un signal que le sprint a mal été préparé.
7. **A**
8. Pour ne pas être surpris. Un risque identifié tôt peut être mitigé à moindre coût. Un risque ignoré devient une crise. "Mieux vaut prévenir que guérir."
9. Transparence : "Nous avons 2 semaines de retard. Cause : sous-estimation du module X. Plan de rattrapage : priorisation MoSCoW, livraison du MVP dans les temps, features secondaires en V2. Impact : fonctionnalité Y reportée."
10. **A**
11. Analogie (projet similaire), estimation 3 points (PERT), planning poker si en équipe, ou simplement doubler son intuition (la plupart des développeurs sous-estiment). Marge de 20-50% selon l'incertitude.
12. "Si tout est prioritaire, rien n'est prioritaire. La priorisation, c'est choisir ce qu'on NE fait PAS maintenant. Qu'est-ce qui apporte le plus de valeur ? Qu'est-ce qui bloque les autres ?"
13. **A**
14. Discipline personnelle : définir un cahier des charges clair (même pour soi-même), découper en tâches de 2-4h, suivre un planning quotidien, faire des revues régulières, célébrer les étapes. PARADIS est un exemple de gestion de projet solo.
15. **A**

### D-E. Corrigés — Modules 4 & 5
1. **A**
2. **A**
3. **A**
4. Réduire = mettre en place des contrôles pour diminuer la probabilité ou l'impact. Éviter = ne pas faire l'action risquée du tout. Ex: risque de faille de sécurité d'un plugin → Réduire (mettre à jour, auditer) ou Éviter (ne pas utiliser ce plugin).
5. Pour parler le langage de la direction. "Risque de perte de données" = vague. "Risque de 200K€ d'amende RGPD + perte de 500 clients" = concret. On peut arbitrer : mitigation à 50K€ vs risque à 200K€.
6. Comparer le coût de la mitigation au coût du risque (ALE). Si mitigation = 100K€ et ALE = 80K€/an, la mitigation n'est pas rentable financièrement. Mais inclure l'impact réputationnel et réglementaire. Décision de la direction.
7. **A**
8. **A**
9. **A**
1. **A**
2. **A**
3. SLA documenté + registre des risques + cahier des charges simplifié.
4. **A**
5. **A**
6. La gouvernance et la conformité sont les compétences qui permettent de parler à la direction et de comprendre les enjeux business de l'IT. Un professionnel du numérique qui maîtrise l'ITIL et le RGPD est plus stratégique.
7. **A**
8. **A**