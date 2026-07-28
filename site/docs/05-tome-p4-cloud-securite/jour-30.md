# TOME P4 — Jour 30 (14h)

## Découpage horaire opérationnel J30
- Réseau cloud avancé (VPC, sous-réseaux, VPN, peering, sécurité réseau) — **4h**
- Sécurité cloud (chiffrement, KMS, IAM avancé, WAF, Shield, monitoring) — **4h**
- Bases de données managées (RDS/Aurora, DynamoDB, ElastiCache, choix SGBD) — **3h**
- Optimisation des coûts cloud (FinOps, tagging, reserved instances, right-sizing) — **2h**
- Banque de questions + suivi P1 — **1h**

---

## 1) Réseau cloud avancé — VPC, VPN, peering (4h)

### Objectifs d'apprentissage
- Concevoir un VPC avec sous-réseaux publics et privés.
- Configurer une connexion VPN site-à-site entre on-premise et cloud.
- Mettre en place le VPC Peering entre deux VPC.
- Comprendre le routage (route tables, Internet Gateway, NAT Gateway).
- Sécuriser le réseau avec Security Groups, NACLs, et VPC Flow Logs.

### Contenu pédagogique
Le réseau cloud est la colonne vertébrale de toute architecture. Une erreur de conception réseau expose l'infrastructure.

Points clés:
1. **VPC (Virtual Private Cloud)** : réseau privé virtuel isolé. CIDR block : `10.0.0.0/16` (65 536 IPs). Sous-réseaux publics (accessibles depuis internet) et privés (isolés). Chaque sous-réseau est dans UNE zone de disponibilité.
2. **Passerelles** :
   - **Internet Gateway (IGW)** : permet la communication bidirectionnelle avec internet pour les ressources en sous-réseau public.
   - **NAT Gateway** : permet aux ressources en sous-réseau privé d'initier des connexions sortantes vers internet (pas l'inverse).
   - **VPC Peering** : connecte deux VPC via le backbone AWS. Non transitif (A→B et B→C ne permet pas A→C).
   - **VPN** : connecte le réseau on-premise au VPC via un tunnel IPSec chiffré.
3. **Sécurité réseau en couches** : Security Group (niveau instance, stateful), Network ACL (niveau sous-réseau, stateless), VPC Flow Logs (capture le trafic pour diagnostic).
4. **Architecture typique 3-tiers** : couche web (sous-réseau public, ALB), couche applicative (sous-réseau privé, EC2 auto-scaling), couche données (sous-réseau privé isolé, RDS multi-AZ).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : dessiner l'architecture réseau d'un VPC avec 2 sous-réseaux publics et 2 sous-réseaux privés (chacun dans une AZ différente). Indiquer les route tables, IGW, NAT Gateway.
   - **Corrigé** : VPC `10.0.0.0/16`. AZ1 + AZ2 chacune avec un subnet public et un subnet privé. Route table public : `0.0.0.0/0` → IGW. Route table private : `0.0.0.0/0` → NAT Gateway. Les EC2 ne sont jamais exposées directement — seul l'ALB en sous-réseau public reçoit le trafic internet.
2. **Exercice 2 (intermédiaire)** : configurer un Security Group pour une architecture web : ALB (port 443 depuis 0.0.0.0/0), EC2 (port 80 depuis le SG de l'ALB), RDS (port 5432 depuis le SG des EC2). Justifier.
   - **Corrigé** : Les règles par référence de SG sont plus robustes : si on ajoute/retire des EC2, on ne change rien, il suffit d'associer le bon SG. L'EC2 n'est jamais accessible directement depuis internet.
3. **Exercice 3 (avancé)** : configurer un VPC Flow Log avec publication CloudWatch. Créer une alarme si plus de 50 paquets rejetés par minute (potentiel scan/attaque).
   - **Corrigé** : VPC → Flow Logs → Create → Filter REJECT → CloudWatch Logs. CloudWatch Alarm sur la métrique `RejectedPackets > 50/minute` → notification SNS (email).

### Nouvelles abréviations rencontrées
- IGW | Internet Gateway | Passerelle entre VPC et Internet | Interagit avec les sous-réseaux publics, les route tables
- NAT | Network Address Translation | Permet aux ressources privées d'accéder à Internet sans être exposées | Interagit avec les sous-réseaux privés
- ALB | Application Load Balancer | Répartiteur de charge couche 7 (HTTP/HTTPS) | Interagit avec EC2, Security Groups, scaling

### Banque de questions du module (15)
1. QCM: un sous-réseau public a... A) une route vers un Internet Gateway B) pas d'accès internet C) uniquement du stockage
2. QCM: un NAT Gateway permet... A) au sous-réseau privé d'accéder à internet B) aux utilisateurs d'accéder au sous-réseau privé C) de stocker des fichiers
3. QCM: VPC Peering connecte... A) deux VPC via le backbone AWS B) un VPC à internet C) un VPC à une base de données
4. Ouverte: pourquoi placer les bases de données en sous-réseau privé ?
5. Ouverte: différence entre Security Group et Network ACL.
6. Cas: les EC2 en sous-réseau privé n'arrivent pas à télécharger des mises à jour. Diagnostic ?
7. QCM: un ALB opère au niveau de la couche... A) 7 (HTTP/HTTPS) B) 4 (TCP) C) 3 (IP)
8. Ouverte: avantage de référencer un Security Group plutôt qu'une IP dans les règles inbound.
9. Cas: VPC Flow Logs activés mais aucun log n'apparaît. Causes possibles ?
10. QCM: un VPN site-à-site connecte... A) le réseau on-premise au VPC B) deux EC2 C) un utilisateur à un site web
11. Ouverte: pourquoi le VPC Peering n'est-il pas transitif ?
12. Cas: besoin de haute disponibilité pour une app web. Comment répartir sur 2 AZ ?
13. QCM: objectif du module 1 = A) concevoir un réseau cloud sécurisé B) ouvrir tous les ports C) éviter les VPC
14. Ouverte: comment déboguer un problème de connectivité dans un VPC ?
15. QCM: résultat attendu = A) VPC fonctionnel avec sous-réseaux publics/privés B) tout en public C) pas de réseau

---

## 2) Sécurité cloud — chiffrement, KMS, IAM avancé, WAF (4h)

### Objectifs d'apprentissage
- Maîtriser le chiffrement au repos et en transit.
- Utiliser AWS KMS pour gérer les clés de chiffrement.
- Appliquer le moindre privilège avec des politiques IAM granulaires.
- Protéger les applications web avec AWS WAF.
- Mettre en place la détection d'intrusion avec GuardDuty et le monitoring avec CloudTrail.

### Contenu pédagogique
La sécurité cloud est une responsabilité partagée. Le client doit activer et configurer les protections.

Points clés:
1. **Chiffrement** : au repos (S3 SSE-KMS, RDS, EBS) et en transit (TLS partout avec ACM). KMS gère les clés avec rotation automatique.
2. **IAM avancé** : conditions dans les politiques (IP, MFA), rôles IAM préférés aux utilisateurs (credentials temporaires), moindre privilège systématique.
3. **AWS WAF** : protège contre SQL injection, XSS. Règles rate-based (bloquer IP > 2000 req/5min). Associé à CloudFront ou ALB.
4. **AWS Shield** : protection DDoS. Standard (gratuit, automatique). Advanced (payant, équipe dédiée).
5. **Monitoring sécurité** : CloudTrail (tous les appels API), GuardDuty (détection menaces), Config (conformité règles).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : activer le chiffrement SSE-KMS sur un bucket S3. Vérifier que les nouveaux objets sont chiffrés.
2. **Exercice 2 (intermédiaire)** : policy IAM : `s3:GetObject` sur un bucket UNIQUEMENT si MFA activé, UNIQUEMENT depuis l'IP du bureau.
3. **Exercice 3 (avancé)** : configurer WAF avec rate-limiting (1000 req/5min) + règle gérée OWASP SQL Injection. Simuler une attaque.

### Nouvelles abréviations rencontrées
- KMS | Key Management Service | Gestion des clés de chiffrement AWS | Interagit avec S3, EBS, RDS, le chiffrement
- WAF | Web Application Firewall | Protection contre les attaques web (SQLi, XSS) | Interagit avec CloudFront, ALB

### Banque de questions du module (15)
1. QCM: KMS gère... A) les clés de chiffrement B) les utilisateurs C) le réseau
2. QCM: CloudTrail enregistre... A) tous les appels API AWS B) le trafic réseau C) les performances
3. QCM: WAF protège contre... A) SQL injection et XSS B) les pannes disque C) la latence
4. Ouverte: différence entre chiffrement au repos et en transit.
5. Ouverte: pourquoi utiliser des rôles IAM plutôt que des utilisateurs pour les services ?
6. Cas: un bucket S3 sensible est accidentellement rendu public. Quel service détecte cela ?
7. QCM: Shield Standard est... A) gratuit et automatique B) payant C) manuel
8. Ouverte: pourquoi activer CloudTrail dans toutes les régions ?
9. Cas: GuardDuty détecte "Instance communicating with known malicious IP". Action ?
10. QCM: une IAM Role fournit... A) des credentials temporaires B) un mot de passe permanent C) rien
11. Ouverte: comment réagir à une alerte GuardDuty ?
12. Cas: besoin de chiffrer les données avec une clé que le client contrôle. Service ?
13. QCM: objectif du module 2 = A) sécuriser une infrastructure cloud B) désactiver les protections C) ouvrir S3 en public
14. Ouverte: comment auditer la sécurité d'un compte AWS ?
15. QCM: résultat attendu = A) chiffrement + IAM + WAF + monitoring activés B) aucune sécurité C) S3 public

---

## 3) Bases de données managées cloud (3h)

### Objectifs d'apprentissage
- Choisir entre RDS, Aurora, DynamoDB, ElastiCache selon le cas d'usage.
- Configurer la haute disponibilité (Multi-AZ) et les lectures scalables (Read Replicas).
- Comprendre les sauvegardes automatiques, snapshots, et point-in-time recovery.
- Utiliser ElastiCache (Redis/Memcached) pour le caching.
- Dimensionner une base de données cloud (instance type, stockage, IOPS).

### Contenu pédagogique
Les bases de données sont le composant le plus critique. Un mauvais choix de SGBD coûte cher en performance.

Points clés:
1. **RDS** : PostgreSQL, MySQL, etc. Multi-AZ (haute disponibilité), Read Replicas (scalabilité lecture), sauvegardes automatiques.
2. **Aurora** : compatible MySQL/PostgreSQL, 5× plus rapide, stockage distribué sur 3 AZ (6 copies), auto-scaling.
3. **DynamoDB** : NoSQL serverless, clé-valeur, latence <10ms. Idéal pour sessions, catalogues, IoT. TTL pour expiration automatique.
4. **ElastiCache** : cache in-memory (Redis ou Memcached). Redis = structures de données riches, pub/sub, persistance. Memcached = simple, multi-thread.
5. **Choix** : Relationnel (RDS/Aurora) pour ACID/reporting. NoSQL (DynamoDB) pour scale/flexibilité. Cache (ElastiCache) pour réduire la charge DB.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : lancer RDS PostgreSQL free tier. Configurer backups 7 jours. Se connecter avec psql.
2. **Exercice 2 (intermédiaire)** : créer une table DynamoDB `sessions` avec TTL 24h. Script SDK pour CRUD session.
3. **Exercice 3 (avancé)** : configurer ElastiCache Redis comme cache de requêtes. Mesurer latence avant/après. Stratégie d'invalidation (TTL + invalidation explicite).

### Nouvelles abréviations rencontrées
- DAX | DynamoDB Accelerator | Cache in-memory pour DynamoDB (microsecondes) | Interagit avec DynamoDB, applications serverless
- TTL | Time To Live | Expiration automatique d'un enregistrement | Interagit avec DynamoDB, ElastiCache

### Banque de questions du module (15)
1. QCM: RDS Multi-AZ fournit... A) la haute disponibilité B) plus de CPU C) le chiffrement
2. QCM: DynamoDB est une base... A) NoSQL serverless B) relationnelle C) de graphe
3. QCM: ElastiCache Redis est utilisé pour... A) le caching B) le stockage permanent C) le calcul
4. Ouverte: différence entre Read Replica et Multi-AZ.
5. Ouverte: quand choisir DynamoDB plutôt que RDS ?
6. Cas: l'application a des pics de trafic imprévisibles. RDS ou Aurora Serverless ?
7. QCM: Aurora stocke les données sur... A) 3 AZ (6 copies) B) 1 AZ C) un disque local
8. Ouverte: avantage du TTL DynamoDB pour les sessions.
9. Cas: le cache Redis est vide après un redémarrage. Cause ?
10. QCM: DAX réduit la latence DynamoDB à... A) microsecondes B) secondes C) minutes
11. Ouverte: comment choisir entre Redis et Memcached ?
12. Cas: RDS 100% CPU, 200 connexions simultanées. Solutions ?
13. QCM: objectif du module 3 = A) choisir la bonne base cloud B) tout dans RDS C) éviter les DB
14. Ouverte: comment estimer le coût d'une base de données cloud ?
15. QCM: résultat attendu = A) RDS + DynamoDB + ElastiCache opérationnels B) une seule DB C) pas de persistance

---

## 4) Optimisation des coûts cloud — FinOps (2h)

### Objectifs d'apprentissage
- Comprendre le modèle FinOps.
- Appliquer le tagging pour le suivi des coûts.
- Utiliser les Reserved Instances et Savings Plans.
- Identifier le gaspillage (instances idle, volumes orphelins, snapshots obsolètes).
- Mettre en place des budgets et des alertes.

### Contenu pédagogique
La facture cloud est la première surprise. Le FinOps maîtrise les coûts.

Points clés:
1. **FinOps** : collaboration Finance/Engineering/Operations. Chaque équipe responsable de ses coûts.
2. **Tagging** : taguer TOUT avec `Environment`, `Project`, `Owner`. Sans tags, impossible d'attribuer les coûts.
3. **Reserved Instances & Savings Plans** : engagement 1-3 ans, réduction jusqu'à 72%. Spot Instances pour charges non critiques (jusqu'à 90%).
4. **Gaspillage** : instances idle (CPU < 1%), volumes orphelins, snapshots obsolètes, Elastic IPs non attachées.
5. **Budgets et alertes** : AWS Budgets avec alertes à 50%, 80%, 100%. Cost Explorer pour analyser les tendances.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : taguer toutes les ressources (`Environment=dev`, `Project=PARADIS`). Activer les tags de facturation.
2. **Exercice 2 (intermédiaire)** : créer un budget AWS 10€/mois avec alertes. Proposer 3 actions de réduction des coûts.
3. **Exercice 3 (avancé)** : comparer coût sur 3 ans : 2 EC2 t3.medium (on-demand vs Reserved vs Savings Plan). Calculer le ROI.

### Nouvelles abréviations rencontrées
- RI | Reserved Instance | Instance réservée avec engagement (réduction jusqu'à 72%) | Interagit avec EC2, RDS, le billing
- FinOps | Financial Operations | Gestion et optimisation des coûts cloud | Interagit avec budgets, tagging, Reserved Instances

### Banque de questions du module (15)
1. QCM: FinOps combine... A) Finance, Engineering, Operations B) uniquement Finance C) uniquement Engineering
2. QCM: le tagging permet de... A) suivre les coûts par projet/équipe B) accélérer le réseau C) chiffrer
3. QCM: une Spot Instance peut être... A) interrompue avec préavis 2 min B) utilisée en prod critique C) réservée 3 ans
4. Ouverte: pourquoi taguer TOUTES les ressources ?
5. Ouverte: différence entre Reserved Instance et Savings Plan.
6. Cas: facture AWS 500€/mois, 30% d'instances avec CPU < 5%. Action ?
7. QCM: AWS Budgets peut... A) alerter quand les coûts dépassent un seuil B) réduire automatiquement C) supprimer des ressources
8. Ouverte: qu'est-ce qu'une Elastic IP non attachée et pourquoi la supprimer ?
9. Cas: "Nous avons économisé 70% sur EC2 mais le data transfer explose". Diagnostic ?
10. QCM: Cost Explorer permet... A) d'analyser les tendances de coûts B) de lancer des instances C) de coder
11. Ouverte: comment convaincre une équipe de passer du On-demand au Reserved ?
12. Cas: une instance EC2 arrêtée coûte encore de l'argent. Pourquoi ?
13. QCM: objectif du module 4 = A) maîtriser et optimiser les coûts cloud B) dépenser sans compter C) ignorer la facture
14. Ouverte: quel est le coût du "not tagging" ?
15. QCM: résultat attendu = A) budget + tagging + optimisation activés B) facture incontrôlée C) pas de suivi

---

## 5) Banque de questions + suivi P1 (1h)

### Objectifs d'apprentissage
- Valider les acquis J30. Planifier J31 (sécurité transversale).

### Banque de questions du module (15)
1. QCM: objectif final J30 = A) réseau cloud + sécurité + coûts opérationnels B) théorie seule C) rien
2. QCM: plan J31 = A) sécurité transversale B) retour au PHP C) fin
3. Ouverte: meilleure preuve J30 à montrer ?
4. QCM: preuve solide = A) diagramme VPC + captures console + rapport coûts B) promesse C) rien
5. QCM: résultat P1 réussi = A) portfolio enrichi B) rien C) théorie
6. Ouverte: comment relier J30 au poste de professionnel du numérique ?
7. QCM: remédiation = A) corriger la lacune B) recommencer C) abandonner
8. QCM: résultat attendu = A) cloud sécurisé et optimisé B) pas de pratique C) gaspillage

---

## Validation qualité J30 (anti-superficiel)

### Livrables obligatoires fin de J30
1. 1 diagramme VPC avec sous-réseaux, IGW, NAT, route tables.
2. 1 politique IAM granulaire avec conditions (MFA, IP).
3. 1 bucket S3 chiffré avec KMS.
4. 1 rapport d'optimisation des coûts (tagging, gaspillage, économies potentielles).
5. 1 preuve portfolio (diagramme ou captures) + mise à jour CV ligne cloud/sécurité.

### Grille d'évaluation rapide (100 points)
- Réseau cloud (VPC, sous-réseaux, IGW/NAT, sécurité réseau) : **30 pts**
- Sécurité cloud (chiffrement, KMS, IAM, WAF, monitoring) : **30 pts**
- Bases de données managées (RDS, DynamoDB, ElastiCache) : **20 pts**
- Optimisation des coûts (FinOps, tagging, budgets) : **10 pts**
- Communication technique employabilité : **10 pts**

### Seuil attendu
- **>= 80/100** : J30 validé, passage normal J31.
- **65-79/100** : validé sous remédiation ciblée 24h.
- **< 65/100** : consolidation cloud requise avant J31.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Réseau cloud)
1. **A**
2. **A**
3. **A**
4. Pour l'isolation et la sécurité : la base de données ne devrait jamais être accessible directement depuis internet. Seul le backend applicatif doit pouvoir y accéder. Moins de surface d'attaque.
5. Security Group = stateful, règles permissives, au niveau instance. NACL = stateless, règles allow + deny, au niveau sous-réseau. Les SG sont plus granulaires.
6. Vérifier que le sous-réseau privé a une route vers le NAT Gateway. Vérifier que le NAT Gateway est dans un sous-réseau public avec une IP publique. Vérifier les SG/NACL.
7. **A**
8. Si on ajoute/retire des EC2, on ne change rien — il suffit d'associer le bon SG. Plus robuste que des plages IP qui changent.
9. Vérifier le rôle IAM (permissions CloudWatch Logs), vérifier que le Flow Log est sur le bon VPC/sous-réseau, vérifier le délai de livraison.
10. **A**
11. Pour la sécurité : la non-transitivité oblige à configurer chaque relation explicitement. Si A→B et B→C permettait A→C automatiquement, ce serait une faille.
12. EC2 dans 2 sous-réseaux publics (2 AZ différentes) derrière un ALB. L'ALB répartit le trafic et bascule si une AZ tombe.
13. **A**
14. VPC Reachability Analyzer, VPC Flow Logs (ACCEPT/REJECT), vérifier route tables, SG, et NACL étape par étape.
15. **A**

### B. Corrigé — Module 2 (Sécurité cloud)
1. **A**
2. **A**
3. **A**
4. Au repos = données stockées sur disque (S3, EBS, RDS). En transit = données sur le réseau (TLS). Les deux sont nécessaires.
5. Les rôles fournissent des credentials temporaires (rotation auto). Les utilisateurs ont des Access Keys permanentes → plus risqué. Toujours préférer les rôles.
6. AWS Config avec la règle `s3-bucket-public-read-prohibited`. GuardDuty peut aussi détecter les accès suspects.
7. **A**
8. Un attaquant peut opérer dans n'importe quelle région. Sans CloudTrail global, ses activités sont invisibles.
9. Confinement immédiat (isoler l'instance), investigation (CloudTrail, VPC Flow Logs), éradication, documentation.
10. **A**
11. Identifier l'instance, confiner, enquêter (cause), éradiquer, récupérer, documenter (RCA). Suivre le cycle NIST.
12. KMS avec CMK (Customer Master Key) gérée par le client. Pour exigences strictes : CloudHSM (module matériel dédié).
13. **A**
14. Trusted Advisor, AWS Config, GuardDuty, Security Hub. Vérifier manuellement : pas de S3 public, pas de SG 0.0.0.0/0, MFA root.
15. **A**

### C. Corrigé — Module 3 (Bases de données)
1. **A**
2. **A**
3. **A**
4. Read Replica = copie asynchrone pour LIRE (scalabilité). Multi-AZ = copie synchrone pour HAUTE DISPO (failover auto).
5. Grande échelle, schéma flexible, latence prévisible, modèle clé-valeur, pas de jointures complexes.
6. Aurora Serverless — scale auto avec la charge, s'arrête quand inutilisé. Idéal pour charges imprévisibles.
7. **A**
8. Pas de nettoyage manuel, pas de coût de stockage pour données mortes, pas de job cron. Suppression auto et gratuite.
9. Si pas de persistance configurée (RDB snapshot + AOF), Redis est un cache pur → vidé au redémarrage. C'est voulu.
10. **A**
11. Redis : structures riches, persistance, pub/sub. Memcached : simple, multi-thread, pas de persistance.
12. Optimiser les requêtes (index), ajouter ElastiCache Redis, Read Replicas, passer à une instance plus grosse, migrer vers Aurora.
13. **A**
14. AWS Pricing Calculator : instance × heures, stockage Go + IOPS, backups, data transfer. Multi-AZ double le coût instance.
15. **A**

### D-E. Corrigés — Modules 4 & 5
1. **A**
2. **A**
3. **A**
4. Sans tagging, impossible d'attribuer les coûts aux équipes/projets. Gaspillage invisible. Transparence et responsabilisation.
5. RI = engagement sur instance spécifique. SP = engagement sur dépense horaire ($/h), plus flexible. SP plus simple à gérer.
6. Downsizer ou arrêter ces instances la nuit. Passer en Reserved si stables. Utiliser Spot Instances si possible.
7. **A**
8. Facturée si non attachée à une instance running. La supprimer = économie immédiate (quelques dollars/mois/ip).
9. Data transfer egress coûte cher. Solutions : CDN (CloudFront), compression, cache, analyser les flux.
10. **A**
11. Montrer le ROI : "500€/mois on-demand → 300€/mois avec RI 1 an. Économie de 2 400€/an. Investissement nul."
12. Le volume EBS attaché continue d'être facturé même si l'instance est arrêtée. Solution : snapshot + supprimer le volume.
13. **A**
14. Facture opaque, pas de responsabilisation des équipes, gaspillage invisible, pas d'optimisation possible.
15. **A**
1. **A**
2. **A**
3. Diagramme VPC + captures console (WAF, KMS, IAM) + rapport d'optimisation des coûts.
4. **A**
5. **A**
6. Le cloud est la plateforme d'exécution de tous les autres domaines (admin sys, data, dev). Maîtriser le cloud = maîtriser l'infrastructure de demain.
7. **A**
8. **A**