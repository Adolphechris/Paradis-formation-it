# TOME P4 — Jour 29 (14h)

## Découpage horaire opérationnel J29
- Cloud computing fondamentaux (IaaS, PaaS, SaaS, modèles de déploiement, acteurs) — **4h**
- AWS — services cœur (EC2, S3, RDS, IAM, Lambda, VPC) — **4h**
- Azure — services cœur (VMs, Blob Storage, SQL Database, Entra ID, Functions) — **3h**
- Comparaison AWS vs Azure vs GCP + critères de choix — **1h**
- Labs pratiques (création compte gratuit, première ressource) — **1h**
- Banque de questions + suivi P1 — **1h**

---

## 1) Cloud computing fondamentaux (4h)

### Objectifs d'apprentissage
- Définir le cloud computing et ses 5 caractéristiques essentielles (NIST).
- Distinguer les modèles de service : IaaS, PaaS, SaaS, FaaS (serverless).
- Comparer les modèles de déploiement : public, privé, hybride, multi-cloud.
- Comprendre le modèle de responsabilité partagée.
- Identifier les principaux acteurs du marché (AWS, Azure, GCP) et leurs parts.

### Contenu pédagogique
Le cloud a transformé l'IT aussi profondément que l'électricité a transformé l'industrie. Comprendre ses fondamentaux est indispensable.

Points clés:
1. **Définition NIST du cloud** (5 caractéristiques) :
   - **On-demand self-service** : provisionner des ressources sans interaction humaine.
   - **Broad network access** : accessible via le réseau (internet, VPN).
   - **Resource pooling** : ressources mutualisées entre clients (multi-tenant).
   - **Rapid elasticity** : scaling rapide (auto-scaling, à la demande).
   - **Measured service** : paiement à l'usage (pay-as-you-go), pas de CAPEX.
2. **Modèles de service** :
   - **IaaS** (Infrastructure as a Service) : machines virtuelles, stockage, réseau. Tu gères l'OS et les applications. Ex: AWS EC2, Azure VMs.
   - **PaaS** (Platform as a Service) : plateforme de développement sans gérer l'infrastructure. Ex: Heroku, Vercel, AWS Elastic Beanstalk.
   - **SaaS** (Software as a Service) : logiciel prêt à l'emploi. Ex: Gmail, Office 365, Salesforce.
   - **FaaS/Serverless** : exécuter du code sans provisionner de serveurs. Ex: AWS Lambda, Azure Functions.
   - Analogie : Pizza as a Service. IaaS = tu loues la cuisine et fais tout. PaaS = on te livre les ingrédients, tu cuisines. SaaS = pizza livrée, tu manges.
3. **Modèles de déploiement** :
   - **Public cloud** : AWS, Azure, GCP. Ressources partagées, accessible via internet.
   - **Private cloud** : infrastructure dédiée à une organisation (on-premise ou hébergée). Ex: OpenStack, VMware.
   - **Hybrid cloud** : combine public et privé (ex: données sensibles en privé, frontend en public).
   - **Multi-cloud** : utiliser plusieurs fournisseurs cloud pour éviter le vendor lock-in.
4. **Modèle de responsabilité partagée** : le fournisseur sécurise le cloud (infrastructure physique, réseau, hyperviseur). Le client sécurise dans le cloud (OS, applications, données, accès). La frontière dépend du modèle (IaaS : plus de responsabilité client ; SaaS : plus de responsabilité fournisseur).
5. **Acteurs du marché (2024-2026)** : AWS ~32% (leader historique, le plus de services), Azure ~23% (intégration Microsoft, entreprises), GCP ~11% (Big Data, ML, Kubernetes). Parts cumulées ~66%. Le choix dépend de l'écosystème existant, des compétences, et des services spécifiques.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : classifier 6 services selon leur modèle (IaaS/PaaS/SaaS/FaaS) : EC2, RDS, Lambda, Gmail, Heroku, S3.
   - **Corrigé** : EC2 = IaaS (VM, tu gères l'OS). RDS = PaaS (base de données managée, tu ne gères pas le serveur). Lambda = FaaS (serverless, tu ne gères rien). Gmail = SaaS (logiciel prêt à l'emploi). Heroku = PaaS (plateforme de déploiement). S3 = IaaS/PaaS selon usage (stockage objet, proche PaaS car managé).
2. **Exercice 2 (intermédiaire)** : une banque veut migrer vers le cloud. Elle a des données clients sensibles (conformité RGPD) et une application web publique. Proposer un modèle de déploiement et justifier.
   - **Corrigé** : Hybride. Données sensibles → private cloud ou on-premise (conformité, contrôle). Application web publique → public cloud (scalabilité, coût). Connexion sécurisée entre les deux (VPN/Direct Connect). Alternative : public cloud avec chiffrement et clés gérées par la banque (BYOK — Bring Your Own Key).
3. **Exercice 3 (avancé)** : comparer le TCO (Total Cost of Ownership) sur 3 ans d'un serveur on-premise (10 000€ hardware + 2 000€/an maintenance) vs EC2 t3.medium (0,0416€/h). Calculer le seuil de rentabilité. Quels coûts cachés en on-premise sont souvent oubliés ?
   - **Corrigé** : On-premise 3 ans = 10 000 + 3×2 000 = 16 000€. EC2 3 ans (24h/24) = 0,0416 × 24 × 365 × 3 = 1 093€. Le cloud est 15× moins cher ! Mais... coûts cachés on-premise souvent oubliés : électricité, climatisation, local, salaire admin sys, redondance. Coûts cachés cloud : data egress (transfert sortant), snapshots, IP statiques, support. Le vrai calcul dépend du contexte mais le cloud est quasi toujours gagnant pour les petites/moyennes structures.

### Nouvelles abréviations rencontrées
- FaaS | Function as a Service | Exécution de code sans gestion de serveur (serverless) | Interagit avec AWS Lambda, Azure Functions, l'architecture événementielle
- CAPEX/OPEX | Capital/Operational Expenditure | CAPEX = investissement (achat serveur), OPEX = coût opérationnel (cloud, pay-as-you-go) | Interagit avec le TCO, le modèle économique, les décisions d'achat
- TCO | Total Cost of Ownership | Coût total de possession sur la durée de vie | Interagit avec les comparaisons on-premise vs cloud, les décisions d'architecture

### Banque de questions du module (15)
1. QCM: IaaS signifie... A) Infrastructure as a Service B) Integration as a Service C) Internet as a Service
2. QCM: dans le modèle SaaS, le client gère... A) rien (tout est géré par le fournisseur) B) l'OS C) l'infrastructure
3. QCM: le cloud hybride combine... A) cloud public et privé B) deux clouds publics C) SaaS et IaaS
4. Ouverte: expliquer le modèle de responsabilité partagée avec un exemple IaaS.
5. Ouverte: différence entre CAPEX et OPEX.
6. Cas: une startup a un budget limité et un trafic imprévisible. Quel modèle de service recommander ?
7. QCM: AWS Lambda est un service de type... A) FaaS/Serverless B) IaaS C) PaaS
8. Ouverte: pourquoi le multi-cloud peut-il être une stratégie pertinente ?
9. Cas: après 6 mois, la facture cloud a triplé. Quelles causes possibles ?
10. QCM: "On-demand self-service" signifie... A) provisionner des ressources sans interaction humaine B) payer en espèces C) contacter le support
11. Ouverte: avantages du cloud pour une PME par rapport à l'on-premise.
12. Cas: un client exige que ses données restent en France. Comment le garantir dans le cloud ?
13. QCM: le leader du marché cloud en part de marché est... A) AWS B) Azure C) GCP
14. Ouverte: comment expliquer le cloud à un directeur financier ?
15. QCM: résultat attendu du module 1 = A) comprendre les fondamentaux du cloud B) maîtriser tous les services AWS C) ignorer le cloud

---

## 2) AWS — services cœur (4h)

### Objectifs d'apprentissage
- Naviguer dans la console AWS et comprendre l'organisation (régions, AZ, comptes).
- Maîtriser les services fondamentaux : EC2, S3, RDS, IAM, Lambda, VPC.
- Créer un utilisateur IAM avec le moindre privilège.
- Lancer une instance EC2 et s'y connecter.
- Comprendre le modèle de facturation AWS (free tier, pay-as-you-go, reserved).

### Contenu pédagogique
AWS est le plus grand fournisseur cloud. Connaître ses services fondamentaux est un standard de l'industrie.

Points clés:
1. **Organisation AWS** : Région (zone géographique : eu-west-1 Irlande, eu-west-3 Paris) → Zones de disponibilité (AZ, datacenters isolés) → Edge locations (CloudFront CDN). Toujours choisir la région la plus proche des utilisateurs (latence) et conforme (RGPD).
2. **IAM (Identity and Access Management)** : gestion des utilisateurs, groupes, rôles, et politiques. Principe du moindre privilège. `IAM User` (accès console + API) vs `IAM Role` (accès temporaire pour services). Politique JSON : `{ "Effect": "Allow", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::mon-bucket/*" }`. Ne JAMAIS utiliser le compte root au quotidien.
3. **EC2 (Elastic Compute Cloud)** : machines virtuelles. Types d'instances : t3 (general purpose), c5 (compute), r5 (memory), g4 (GPU). AMI = image (OS). Security Group = pare-feu (règles entrantes/sortantes). Key Pair = clé SSH. User Data = script exécuté au premier démarrage.
4. **S3 (Simple Storage Service)** : stockage objet. Buckets (conteneurs globaux, nom unique). Objets (fichiers + métadonnées). Classes de stockage : Standard (accès fréquent), Intelligent-Tiering (auto), Glacier (archive, moins cher). Versioning, chiffrement, static website hosting.
5. **RDS (Relational Database Service)** : bases de données managées (PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, Aurora). Multi-AZ (haute disponibilité), Read Replicas (lecture scalabilité), backups automatiques, snapshots.
6. **Lambda** : serverless. Exécute du code en réponse à des événements (S3 upload, API Gateway, cron). Payé au nombre d'invocations + durée (ms). Pas de serveur à gérer.
7. **VPC (Virtual Private Cloud)** : réseau privé virtuel. Sous-réseaux publics/privés, Internet Gateway, NAT Gateway, Route Tables, Security Groups, Network ACLs. Chaque service AWS tourne dans un VPC.

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : créer un utilisateur IAM avec accès programmatique + console. Lui attacher la politique `AmazonS3ReadOnlyAccess`. Tester l'accès en listant les buckets S3 avec AWS CLI.
   - **Corrigé** : IAM → Users → Create → Programmatic access + Console access → Attach policy `AmazonS3ReadOnlyAccess`. Télécharger les credentials CSV. `aws configure --profile new-user`, entrer Access Key + Secret. `aws s3 ls --profile new-user` → liste les buckets. Tester `aws s3 mb s3://test-bucket --profile new-user` → Access Denied (normal, read-only).
2. **Exercice 2 (intermédiaire)** : lancer une instance EC2 t2.micro (free tier) avec Amazon Linux 2. Configurer le Security Group pour autoriser SSH (22) depuis ton IP uniquement. Se connecter en SSH, installer nginx, vérifier que la page par défaut est accessible.
   - **Corrigé** : EC2 → Launch Instance → Amazon Linux 2, t2.micro, créer key pair (.pem, `chmod 400`). Security Group : SSH (22) from `My IP`. Lancer. `ssh -i key.pem ec2-user@<public-ip>`. `sudo yum install -y nginx && sudo systemctl start nginx`. Vérifier : `curl localhost` → HTML nginx. Depuis l'extérieur : `http://<public-ip>` → page nginx. Arrêter l'instance après pour éviter les coûts.
3. **Exercice 3 (avancé)** : créer une architecture serverless simple : S3 (upload image) → Lambda (redimensionne) → S3 (output). Configurer le rôle IAM pour Lambda (accès S3). Tester le flux complet.
   - **Corrigé** : Créer 2 buckets S3 : `images-input`, `images-output`. Créer une fonction Lambda (Python, `aws-sdk`, handler). Code : `import boto3; s3 = boto3.client('s3'); ...` → télécharge depuis input, redimensionne, upload dans output. Rôle IAM : `s3:GetObject` sur input, `s3:PutObject` sur output. Test : upload une image dans input → vérifier qu'elle apparaît redimensionnée dans output.

### Nouvelles abréviations rencontrées
- AZ | Availability Zone | Datacenter isolé au sein d'une région AWS | Interagit avec EC2, la haute disponibilité, les VPC
- AMI | Amazon Machine Image | Image de système d'exploitation pour EC2 | Interagit avec EC2, le lancement d'instances, les snapshots
- ARN | Amazon Resource Name | Identifiant unique d'une ressource AWS | Interagit avec IAM, les politiques, S3, tous les services AWS

### Banque de questions du module (15)
1. QCM: EC2 est un service de type... A) IaaS (machines virtuelles) B) PaaS C) SaaS
2. QCM: S3 est un service de... A) stockage objet B) base de données C) calcul
3. QCM: IAM permet de... A) gérer les utilisateurs et leurs permissions B) lancer des VMs C) stocker des fichiers
4. Ouverte: pourquoi ne jamais utiliser le compte root AWS au quotidien ?
5. Ouverte: différence entre un Security Group et une Network ACL.
6. Cas: une instance EC2 est inaccessible en SSH. Quelles vérifications en premier ?
7. QCM: une région AWS contient... A) plusieurs zones de disponibilité (AZ) B) une seule AZ C) aucun datacenter
8. Ouverte: avantage de RDS par rapport à une base auto-gérée sur EC2.
9. Cas: facture S3 élevée. Analyse : beaucoup d'opérations GET sur des objets en Glacier. Problème ?
10. QCM: Lambda est facturé... A) au nombre d'invocations + durée B) à l'heure C) au stockage
11. Ouverte: pourquoi utiliser plusieurs AZ pour une application critique ?
12. Cas: `aws s3 ls` retourne "Access Denied" avec un compte admin. Diagnostic ?
13. QCM: objectif du module 2 = A) maîtriser les services AWS fondamentaux B) connaître tous les 200+ services C) éviter AWS
14. Ouverte: comment estimer le coût AWS d'une architecture ?
15. QCM: résultat attendu = A) EC2 + S3 + IAM + Lambda opérationnels B) uniquement théorie C) pas de pratique

---

## 3) Azure — services cœur (3h)

### Objectifs d'apprentissage
- Naviguer dans le portail Azure et comprendre l'organisation (régions, zones, abonnements).
- Maîtriser les services fondamentaux : Virtual Machines, Blob Storage, SQL Database, Entra ID, Functions.
- Créer un utilisateur Entra ID avec RBAC.
- Lancer une VM et s'y connecter.
- Comprendre le modèle de facturation Azure (free account, pay-as-you-go, reservations).

### Contenu pédagogique
Azure est le cloud de Microsoft, particulièrement pertinent pour les entreprises (intégration Office 365, Active Directory, Windows Server).

Points clés:
1. **Organisation Azure** : Abonnement (limite de facturation, RBAC, politiques) → Resource Group (conteneur logique pour les ressources liées) → Ressources. Régions Azure (paires pour la reprise après sinistre). Resource Groups sont la clé : toutes les ressources d'un projet dans le même groupe pour la gestion, la facturation, et la suppression.
2. **Entra ID (ex-Azure AD)** : annuaire cloud pour l'authentification et l'autorisation. Utilisateurs, groupes, rôles RBAC (Owner, Contributor, Reader). `az role assignment create --assignee user@domain.com --role Contributor --resource-group mon-groupe`. Authentification unique avec Office 365, synchronisation avec AD on-premise.
3. **Virtual Machines** : équivalent de EC2. Types de séries : B (burst, dev/test), D (general purpose), E (memory), F (compute). Disques managés. Network Security Group (NSG) = Security Group Azure. SSH/RDP. Azure Bastion pour accès sécurisé sans IP publique.
4. **Blob Storage** : équivalent de S3. Containers (équivalent buckets), blobs (fichiers). Niveaux d'accès : Hot (fréquent), Cool (rare, 30j minimum), Archive (très rare, 180j minimum). Static website, CDN, cycle de vie automatique.
5. **Azure SQL Database** : équivalent RDS. Database-as-a-Service. Elastic Pool pour partager les ressources entre plusieurs DB. Sauvegardes automatiques, géo-réplication, failover groups.
6. **Azure Functions** : équivalent Lambda. Serverless. Triggers : HTTP, timer, blob, queue. Bindings : entrée/sortie vers d'autres services Azure (Blob, Cosmos DB, Service Bus).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : créer un Resource Group et une VM Linux (B1s, free tier). Configurer le NSG pour SSH. Se connecter via Azure Cloud Shell.
   - **Corrigé** : Portail → Resource Groups → Create (West Europe). → Virtual Machine → Create (B1s, Ubuntu 22.04, SSH public key). NSG : allow SSH (22). Déployer. Cloud Shell : `ssh azureuser@<ip>`. Vérifier que la VM est fonctionnelle. Supprimer le Resource Group pour nettoyer toutes les ressources.
2. **Exercice 2 (intermédiaire)** : créer un Storage Account avec un container Blob. Uploader un fichier via le portail, le télécharger via `az storage blob download` (Azure CLI).
   - **Corrigé** : Storage Account → Create (nom unique, LRS). → Containers → Create `documents`. Upload fichier via portail. CLI : `az storage blob download --account-name $name --container-name documents --name fichier.pdf --file local.pdf`. Vérifier que le fichier est bien téléchargé.
3. **Exercice 3 (avancé)** : comparer AWS et Azure pour un cas concret : entreprise de 500 employés utilisant déjà Office 365 et Windows Server. Faut-il migrer vers AWS ou Azure ? Justifier avec au moins 5 critères.
   - **Corrigé** : Critères : 1) Intégration Office 365/Entra ID → avantage Azure (SSO natif). 2) Migration Windows Server → Azure (Azure Migrate, Hybrid Benefit). 3) Compétences internes → si équipe formée AWS, rester AWS. 4) Coûts → Azure Hybrid Benefit réduit le coût des licences Windows. 5) Conformité → les deux sont RGPD, Azure a plus de régions en France. Verdict : Azure gagnant dans ce scénario grâce à l'intégration Microsoft.

### Nouvelles abréviations rencontrées
- RBAC | Role-Based Access Control | Contrôle d'accès basé sur les rôles (Azure) | Interagit avec Entra ID, les abonnements, les Resource Groups
- NSG | Network Security Group | Pare-feu Azure (équivalent Security Group AWS) | Interagit avec les VMs, les sous-réseaux, la sécurité réseau

### Banque de questions du module (15)
1. QCM: un Resource Group Azure contient... A) des ressources liées logiquement B) des utilisateurs C) des abonnements
2. QCM: Entra ID (ex-Azure AD) est un service... A) d'annuaire et d'authentification B) de stockage C) de calcul
3. QCM: Blob Storage est l'équivalent Azure de... A) AWS S3 B) AWS EC2 C) AWS RDS
4. Ouverte: avantage de l'intégration Azure + Office 365 pour une entreprise.
5. Ouverte: différence entre un Resource Group et un Abonnement Azure.
6. Cas: besoin de déployer une app en Europe. Quelles régions Azure choisir ?
7. QCM: Azure Functions est un service... A) serverless B) IaaS C) base de données
8. Ouverte: pourquoi utiliser Azure Bastion plutôt qu'une IP publique pour SSH ?
9. Cas: une VM Azure est inaccessible en RDP. Checklist de diagnostic ?
10. QCM: `az` est... A) l'outil CLI Azure B) un service cloud C) un langage
11. Ouverte: comment Azure gère-t-il la haute disponibilité des VMs ?
12. Cas: "Nous migrons vers le cloud. AWS ou Azure ?" — Quelles questions poser au client ?
13. QCM: objectif du module 3 = A) maîtriser les services Azure fondamentaux B) uniquement AWS C) éviter Azure
14. Ouverte: comment la connaissance d'AWS aide-t-elle à apprendre Azure ?
15. QCM: résultat attendu = A) VM + Storage + Entra ID Azure opérationnels B) théorie uniquement C) pas de pratique

---

## 4) Comparaison AWS vs Azure vs GCP (1h)

### Objectifs d'apprentissage
- Comparer les services équivalents entre les 3 clouds.
- Choisir un fournisseur selon des critères objectifs.
- Comprendre les forces historiques de chaque plateforme.
- Éviter le vendor lock-in.

### Contenu pédagogique

| Service | AWS | Azure | GCP |
|---|---|---|---|
| Compute | EC2 | Virtual Machines | Compute Engine |
| Serverless | Lambda | Functions | Cloud Functions |
| Stockage objet | S3 | Blob Storage | Cloud Storage |
| DB relationnelle | RDS | SQL Database | Cloud SQL |
| DB NoSQL | DynamoDB | Cosmos DB | Firestore |
| IAM | IAM | Entra ID + RBAC | Cloud IAM |
| Réseau | VPC | VNet | VPC |
| CDN | CloudFront | Azure CDN | Cloud CDN |
| Kubernetes | EKS | AKS | GKE |

**Critères de choix** : intégration écosystème existant (Microsoft → Azure, Google → GCP), maturité du service, localisation des régions, coûts, compétences disponibles, conformité.

### Exercice : choisir un fournisseur pour une banque, une startup, et une administration française. Justifier.

### Nouvelles abréviations rencontrées
- GCP | Google Cloud Platform | Cloud public de Google, leader sur le Big Data, le ML et Kubernetes | Interagit avec BigQuery, GKE, Cloud Storage

### Banque de questions du module (15)
1. QCM: le service serverless de GCP s'appelle... A) Cloud Functions B) Lambda C) Functions
2. QCM: GKE est le service... A) Kubernetes managé de GCP B) de stockage C) de base de données
3. Ouverte: pourquoi GCP est-il leader sur Kubernetes ? (K8s a été créé chez Google)
4. QCM: le stockage objet de GCP est... A) Cloud Storage B) S3 C) Blob Storage
5. QCM: résultat = A) savoir comparer les 3 clouds B) connaître un seul C) ignorer les différences

---

## 5) Labs pratiques + Banque de questions + suivi P1 (2h)

### Objectifs d'apprentissage
- Mettre en pratique sur AWS ET Azure (free tier).
- Valider les acquis J29 en test.
- Planifier J30 (réseau/sécurité cloud).

### Exercices pratiques (avec corrigés)
1. **Exercice 1 (simple)** : créer un compte gratuit AWS et Azure. Installer AWS CLI et Azure CLI.
   - **Corrigé** : AWS Free Tier (carte bancaire requise, pas de frais si dans les limites). Azure Free Account (200€ de crédit + services gratuits 12 mois). `aws configure` + `az login`.
2. **Exercice 2 (intermédiaire)** : pitch 60s "Pourquoi le cloud est l'avenir de l'IT".
   - **Corrigé** : Agilité (provisionner en minutes vs semaines), élasticité (scaling automatique), modèle économique (OPEX vs CAPEX), innovation (accès aux services avancés : IA, Big Data, IoT), sécurité (les hyperscalers investissent des milliards en sécurité).
3. **Exercice 3 (avancé)** : plan J30 — "Réseau cloud (VPC, sous-réseaux, VPN), sécurité cloud (chiffrement, IAM avancé, WAF), bases de données managées, et optimisation des coûts (FinOps)."

### Nouvelles abréviations rencontrées
- FinOps | Financial Operations | Pratique de gestion et d'optimisation des coûts cloud | Interagit avec le cloud, les budgets, le tagging, les rapports de coûts

### Banque de questions du module (15 — mixte J29)
1. QCM: objectif final J29 = A) cloud fondamentaux + AWS/Azure opérationnels B) théorie seule C) rien
2. QCM: plan J30 = A) réseau cloud + sécurité + coûts B) retour au PHP C) fin
3. Ouverte: meilleure preuve J29 à montrer ?
4. QCM: preuve solide = A) captures console AWS/Azure + ressources créées B) promesse C) rien
5. QCM: résultat P1 réussi = A) portfolio enrichi B) rien C) théorie
6. Ouverte: comment relier J29 au poste de professionnel du numérique ?
7. QCM: remédiation = A) corriger la lacune B) recommencer C) abandonner
8. QCM: résultat attendu = A) cloud opérationnel B) pas de pratique C) erreurs

---

## Validation qualité J29 (anti-superficiel)

### Livrables obligatoires fin de J29
1. 1 compte AWS + Azure créés (free tier).
2. 1 instance EC2 + 1 VM Azure fonctionnelles (captures).
3. 1 bucket S3 + 1 Blob Storage avec fichiers uploadés.
4. 1 document comparatif AWS vs Azure vs GCP (5 critères).
5. 1 preuve portfolio (captures console) + mise à jour CV ligne cloud.

### Grille d'évaluation rapide (100 points)
- Fondamentaux cloud (modèles, déploiement, responsabilité partagée) : **25 pts**
- Maîtrise AWS (EC2, S3, IAM, Lambda, VPC) : **30 pts**
- Maîtrise Azure (VMs, Blob, SQL DB, Entra ID, Functions) : **25 pts**
- Comparaison et choix (AWS vs Azure vs GCP) : **10 pts**
- Communication technique employabilité : **10 pts**

### Seuil attendu
- **>= 80/100** : J29 validé, passage normal J30.
- **65-79/100** : validé sous remédiation ciblée 24h.
- **< 65/100** : consolidation cloud requise avant J30.

---

## Corrigés guidés — mode tuteur (réponses attendues)

### A. Corrigé — Module 1 (Cloud fondamentaux)
1. **A**
2. **A**
3. **A**
4. Le fournisseur sécurise l'infrastructure physique (datacenter, réseau, hyperviseur). Le client sécurise tout ce qu'il met dedans : OS (patching), applications (code sécurisé), données (chiffrement), accès (IAM, MFA). Si le client expose une base de données sans mot de passe, c'est sa responsabilité, pas celle d'AWS.
5. CAPEX = investissement lourd une fois (acheter un serveur 10 000€). OPEX = coût récurrent mensuel (payer EC2 100€/mois). Le cloud transforme le CAPEX en OPEX → pas de gros investissement initial, trésorerie préservée.
6. Cloud public, modèle Pay-as-you-go. Pas d'investissement initial, scaling automatique avec le trafic (ne paie que ce qui est consommé). Commencer par des services managés (PaaS/serverless) pour minimiser l'administration.
7. **A**
8. Éviter la dépendance à un seul fournisseur (vendor lock-in), négocier les prix, choisir le meilleur service de chaque cloud (best-of-breed), résilience (si un cloud est down, l'autre prend le relais). Coût : complexité accrue.
9. Instances oubliées allumées 24/7, snapshots non nettoyés, data egress non anticipé, ressources surdimensionnées (over-provisioning), absence de tagging pour le suivi.
10. **A**
11. Pas d'investissement initial, pas de maintenance matérielle, scalabilité, sécurité gérée par le fournisseur (protection physique, certification), innovation accessible (IA, Big Data sans infrastructure).
12. Choisir une région cloud en France (AWS Paris eu-west-3, Azure France Central). Activer le chiffrement au repos. Clause contractuelle de localisation des données. Pour les données très sensibles, chiffrement avec clés gérées par le client (BYOK).
13. **A**
14. "Au lieu d'acheter un serveur 10 000€ qui sera obsolète dans 3 ans, on paie 100€ par mois pour la puissance dont on a besoin, et on peut augmenter ou réduire instantanément. Pas de surprise de trésorerie, pas de maintenance, pas de local à climatiser."
15. **A**

### B. Corrigé — Module 2 (AWS)
1. **A**
2. **A**
3. **A**
4. Le compte root a tous les droits (y compris supprimer le compte, changer les infos de facturation). Un accès root compromis = catastrophe totale. Créer des utilisateurs IAM avec le strict nécessaire. Activer MFA sur le root.
5. Security Group = stateful (si entrée autorisée, sortie automatique), règles permissives uniquement. Network ACL = stateless (entrée et sortie doivent être explicitement autorisées), règles allow ET deny, au niveau du sous-réseau.
6. Vérifier le Security Group (port 22 ouvert ?), la source IP (My IP correct ?), l'instance a-t-elle une IP publique ?, le key pair correspond-elle ?, l'OS est-il démarré (EC2 console → Status Checks).
7. **A**
8. Backups automatiques, patching OS géré, multi-AZ en un clic, scaling facile, monitoring intégré (CloudWatch), pas de serveur à administrer. Coût plus élevé qu'EC2 auto-géré à court terme, mais TCO souvent inférieur.
9. Les objets en Glacier ne sont pas accessibles instantanément (délai de restauration de minutes à heures). Les opérations GET sur Glacier sont très coûteuses. Solution : restaurer les objets (expédié) ou changer la classe de stockage pour les objets fréquemment accédés.
10. **A**
11. Une AZ = un datacenter (ou groupe de datacenters proches). Si une AZ tombe (incendie, panne électrique), les autres continuent de fonctionner. Multi-AZ garantit la haute disponibilité (99.99% SLA pour RDS Multi-AZ).
12. Vérifier que les credentials sont corrects (`aws configure list`), que l'utilisateur IAM a bien les permissions S3, que la région est correcte (S3 est global mais la CLI a besoin d'une région), que la politique IAM n'a pas de condition bloquante (IP, MFA).
13. **A**
14. Utiliser AWS Pricing Calculator. Estimer les heures d'instance, le stockage, le data transfer. Ajouter 20% de marge pour les coûts imprévus (data egress, snapshots, support). Mettre en place des budgets et des alertes (AWS Budgets).
15. **A**

### C. Corrigé — Module 3 (Azure)
1. **A**
2. **A**
3. **A**
4. Single Sign-On (SSO) natif entre Azure et Office 365. Gestion centralisée des identités (Entra ID). Les utilisateurs Windows se connectent avec le même compte. Moins de friction, sécurité unifiée, productivité.
5. Abonnement = périmètre de facturation et de limites (quotas). Resource Group = conteneur logique pour organiser les ressources d'un même projet (une app web, sa DB, son stockage dans le même RG). Un abonnement contient plusieurs Resource Groups.
6. Azure France Central (Paris) ou North Europe (Irlande). Pour la latence minimale vers la France, France Central. Pour la reprise après sinistre, utiliser France South (Marseille) comme région secondaire (paire régionale).
7. **A**
8. Pas d'IP publique exposée sur internet = surface d'attaque réduite. Connexion via le portail Azure (HTTPS) ou client natif. Pas de port SSH ouvert. Idéal pour les environnements de production.
9. Vérifier le NSG (port 3389 autorisé ?), l'IP publique est-elle associée ?, le service RDP est-il activé sur l'OS ?, le diagnostic de connexion Azure (Network Watcher → IP Flow verify).
10. **A**
11. Availability Sets (groupes de VMs dans des domaines de panne et de mise à jour différents), Availability Zones (datacenters séparés dans une région), VM Scale Sets (auto-scaling de VMs identiques). SLA de 99.95% à 99.99% selon la configuration.
12. "Quel est votre écosystème actuel ? (Microsoft, Linux, autres ?) Utilisez-vous Office 365 ? Avez-vous des compétences AWS/Azure en interne ? Quel budget ? Quelles exigences de conformité/région ?"
13. **A**
14. Les concepts sont identiques (compute, storage, database, IAM, network). Apprendre le deuxième cloud est 2× plus rapide que le premier. On transpose les connaissances : "EC2 → Azure VM, S3 → Blob Storage, IAM → Entra ID".
15. **A**

### D-E. Corrigés — Modules 4 & 5 (Comparaison, Labs & Banque)
1. **A**
2. **A**
3. Google a créé Kubernetes (K8s) en 2014 et l'a donné à la CNCF. Leur service managé GKE est le plus mature, avec les dernières fonctionnalités K8s en avant-première.
4. **A**
5. **A**
1. **A**
2. **A**
3. Captures des consoles AWS et Azure avec les ressources créées + document comparatif AWS vs Azure.
4. **A**
5. **A**
6. Le cloud est une compétence transversale : admin sys (infrastructure as code), data analyst (data lakes, big data), développeur (serverless, CI/CD). Tout professionnel du numérique doit connaître le cloud.
7. **A**
8. **A**