# TOME P4 — Cloud, DevOps & SecOps — Jour 190 (6h) : Projet Intégrateur Semestre 4 — Partie 5 : Architecture Full-Stack Cloud-Native BCC Complète (Synthèse Semestre 4 J176-J189)

> [!NOTE]
> **Objectif du jour :** Synthétiser l'ensemble des acquis du Semestre 4 (J176-J189) dans un **projet intégrateur final** : conception complète de l'architecture **Full-Stack Cloud-Native** de la BCC, intégrant la conteneurisation Docker/K8s, le pipeline CI/CD DevSecOps, l'architecture Cloud AWS, les microservices avec Service Mesh, le Serverless, le monitoring SRE et la conformité réglementaire (RGPD, PCI-DSS, ISO 27001).
>
> **Compétences visées :** `OPS-04` à `OPS-06` (A), `SEC-04` à `SEC-07` (A), `GOV-03` à `GOV-04` (A) — Architecture Cloud-Native Full-Stack BCC

---

## 1) Module — Architecture Full-Stack BCC : Vue d'Ensemble Consolidée (2h)

### 📖 Narration/Intuition

Nous avons étudié 39 jours de contenu technique avancé sur la Data Engineering, le Web Development, le DevOps, la Sécurité et la Gouvernance. Aujourd'hui, nous les assemblons dans une **architecture complète** qui représente l'état de l'art d'un système bancaire core numérique africain de classe mondiale.

### 🔍 Anatomie Technique

**Stack Technologique Complète BCC — Cartographie par Couche :**

```
COUCHE 1 — EXPÉRIENCE UTILISATEUR (Frontend)
════════════════════════════════════════════════
  └── React.js SPA (Portail Web Bancaire) — Jour 175
  └── Progressive Web App (PWA) Mobile — Jour 175
  └── WAI-ARIA WCAG 2.1 (Accessibilité) — Jour 171

COUCHE 2 — APIS & GATEWAY
════════════════════════════════════════════════
  └── AWS API Gateway (REST) — Jour 187
  └── NGFW Palo Alto WAF (DPI L7) — Jour 182
  └── JWT RS256 + OAuth2/OIDC Auth — Jour 174
  └── Rate Limiting + CORS — Jour 174

COUCHE 3 — MICROSERVICES (Kubernetes EKS)
════════════════════════════════════════════════
  └── Account Service (Node.js/Express) — Jour 173, 186
  └── Transaction Service (Node.js) — Jour 186
  └── Auth Service (Redis sessions) — Jour 158, 174
  └── Notification Service (Kafka consumer) — Jour 161
  └── Reporting Service (ClickHouse) — Jour 166
  └── Istio Service Mesh (mTLS, Traffic Mgmt) — Jour 186

COUCHE 4 — ÉVÉNEMENTS & STREAMING
════════════════════════════════════════════════
  └── Apache Kafka (Transaction Events) — Jour 161
  └── AWS EventBridge (Event-Driven Lambda) — Jour 187
  └── Apache Flink (Real-Time Stream Processing) — Jour 169

COUCHE 5 — DONNÉES & STOCKAGE
════════════════════════════════════════════════
  └── PostgreSQL RDS Multi-AZ (OLTP Core) — Jour 151, 155
  └── Redis ElastiCache (Cache + Sessions) — Jour 158
  └── ClickHouse (OLAP Analytics) — Jour 154
  └── MinIO / S3 (Data Lakehouse) — Jour 164
  └── Delta Lake (ACID + Time Travel) — Jour 164

COUCHE 6 — SERVERLESS & AUTOMATION
════════════════════════════════════════════════
  └── AWS Lambda (Relevés PDF, Batch Reports) — Jour 187
  └── Apache Airflow (ETL Orchestration) — Jour 154
  └── GitHub Actions CI/CD Pipeline — Jour 178
  └── ArgoCD GitOps (K8s Deployment) — Jour 178

COUCHE 7 — SÉCURITÉ (Defense in Depth)
════════════════════════════════════════════════
  └── AWS WAF + CloudFront Shield (DDoS) — Jour 179, 182, 185
  └── Suricata IDS/IPS (East-West Traffic) — Jour 182
  └── Zero Trust / Microsegmentation — Jour 182, 185
  └── PKI TLS 1.3 + HSM AWS KMS — Jour 183
  └── AES-256-GCM Data Encryption — Jour 183
  └── SIEM ELK + SOAR Playbooks — Jour 184

COUCHE 8 — OBSERVABILITÉ & SRE
════════════════════════════════════════════════
  └── Prometheus + AlertManager — Jour 180, 188
  └── Grafana (Golden Signals Dashboards) — Jour 188
  └── OpenTelemetry + Jaeger (Tracing) — Jour 186, 188
  └── ELK Stack Logging — Jour 184

COUCHE 9 — INFRASTRUCTURE & CLOUD
════════════════════════════════════════════════
  └── AWS EKS Multi-AZ (Kubernetes) — Jour 177, 180
  └── Terraform IaC (Infrastructure provisioning) — Jour 179
  └── AWS VPC + Subnets (Réseau isolé) — Jour 179
  └── Terraform State Backend (S3 + DynamoDB Lock) — Jour 179

COUCHE 10 — CONFORMITÉ & GOUVERNANCE
════════════════════════════════════════════════
  └── RGPD (Droits clients, Minimisation) — Jour 189
  └── PCI-DSS v4.0 (Sécurité cartes) — Jour 189
  └── ISO 27001 SMSI (Certification) — Jour 189
  └── Risk Register COBIT (Risques IT) — Jour 189
```

---

## 2) Module — Flux Métier Complet : Virement Transfrontalier BCC (2h)

### 📖 Narration/Intuition

Simulons le flux technique complet d'un **virement international** depuis le compte d'un client BCC à Kinshasa vers un compte en France — en identifiant précisément quels composants technologiques du Semestre 4 interviennent à chaque étape.

### 🔍 Anatomie Technique

**Flux Complet d'un Virement International BCC :**

```
ÉTAPE 1 — INITIATION (Frontend React.js)
  └── Client saisit le virement dans FormulaireVirement.jsx (Jour 175)
  └── Validation formulaire côté client (Zod validation — Jour 173)
  └── Requête POST https://api.bcc.cd/virements (HTTPS TLS 1.3 — Jour 183)

ÉTAPE 2 — AUTHENTIFICATION & AUTORISATION (API Gateway + Auth Service)
  └── Nginx/AWS ALB reçoit la requête (Jour 180)
  └── Rate Limiter vérifie : max 5 virements/minute/IP (Jour 174)
  └── JWT RS256 validé + Scope "virement:international" vérifié (Jour 174)
  └── MFA challenge si montant > 10 000 USD (Jour 189 PCI-DSS REQ 8)

ÉTAPE 3 — VALIDATION MÉTIER (Transaction Service — Microservice K8s)
  └── Circuit Breaker vérifie la disponibilité d'Account Service (Jour 186)
  └── Account Service : SELECT solde WHERE account_id = ? FOR UPDATE (Jour 157)
  └── Vérification solde suffisant + limite de virement journalière
  └── Vérification conformité LBC/FT (Anti-Blanchiment — Jour 189)
  └── Chiffrement du montant et du RIB destinataire AES-256-GCM (Jour 183)

ÉTAPE 4 — PERSISTANCE & ÉVÉNEMENTS (PostgreSQL + Kafka)
  └── INSERT INTO transactions (ACID — Jour 151, WAL — Jour 151)
  └── Débit du compte source (PostgreSQL MVCC — Jour 151)
  └── Publication événement "VIREMENT_INTERNATIONAL_INITIÉ" → Kafka (Jour 161)
  └── Audit CDC → Audit Service → ELK SIEM (Jour 157, 184)

ÉTAPE 5 — TRAITEMENT ASYNCHRONE (Event-Driven Lambda + External APIs)
  └── Notification Service consomme l'événement Kafka (Jour 187)
  └── SMS envoyé au client via Twilio API
  └── Lambda "SWIFT Connector" déclenché par EventBridge (Jour 187)
  └── Message SWIFT MT103 transmis vers la banque correspondante

ÉTAPE 6 — OBSERVABILITÉ (Prometheus + Grafana)
  └── Métrique virement_internationaux_total{status="INITIATED"} incrémentée
  └── Histogramme duration_seconds mis à jour (Jour 188)
  └── Si latence P99 > 2s → Alerte Prometheus → Slack SOC (Jour 188)

ÉTAPE 7 — AUDIT & CONFORMITÉ
  └── Piste d'audit complète dans ELK (Qui, Quoi, Quand, Depuis quelle IP)
  └── Log PCI-DSS : Données de carte masquées dans les logs (REQ 3, REQ 10)
  └── Rapport Transaction Suspecte si > seuil LBC (Jour 189)
```

---

## 3) Module — Checklist de Déploiement Production & Go-Live (2h)

### 📖 Narration/Intuition

Avant de mettre en production un système de core banking aussi critique que celui de la BCC, une **checklist exhaustive** de validation doit être effectuée. Cette checklist représente la synthèse de toutes les bonnes pratiques du Semestre 4.

### 🛠️ Atelier Pratique

**Checklist de Go-Live Système Core Banking BCC :**

```markdown
# CHECKLIST GO-LIVE — BCC CORE BANKING v2.0
## Date cible : 2026-09-01 | Responsable : Lead Architect & CISO

### ✅ SÉCURITÉ (Pre-Conditions Absolues)
□ Pentest externe réalisé (< 3 mois) — Toutes vulnérabilités CRITIQUES corrigées
□ Scan Trivy CI/CD : 0 CVE CRITICAL dans les images Docker de production
□ Certificats TLS valides (> 30 jours) — cert-manager configuré avec auto-renouvellement
□ MFA activé pour 100% des comptes opérateurs (FIDO2 pour admins)
□ HSM AWS KMS configuré pour toutes les clés cryptographiques sensibles
□ Network Policies K8s appliquées (Zero Trust Egress — Deny All)
□ NGFW + IDS/IPS Suricata opérationnels avec règles BCC activées
□ Revue RBAC : 0 compte avec permissions excessives

### ✅ INFRASTRUCTURE
□ Multi-AZ activé : EKS (3 AZ) + RDS Multi-AZ + Redis Cluster
□ Terraform IaC : Infrastructure entière codifiée et versionnée
□ HPA configuré : Auto-scaling K8s testé (Charge simulée à 200%)
□ Disaster Recovery testé : RTO < 4h, RPO < 1h (pgBackRest PITR validé)
□ Backups S3 Immuables (Object Lock WORM) configurés et testés
□ Runbooks documentés pour les 10 incidents les plus probables

### ✅ CI/CD & QUALITÉ
□ Pipeline GitHub Actions : SAST CodeQL + Trivy + Jest Coverage > 80%
□ ArgoCD GitOps : Sync automatique avec selfHeal et prune activés
□ Tests de charge (K6) validés : API supporte 1000 RPS avec P99 < 500ms
□ Tests de régression complets passés sur l'environnement Staging

### ✅ OBSERVABILITÉ
□ Dashboards Grafana (4 Golden Signals) validés par l'équipe SRE
□ Alerting Prometheus configuré (P0/P1/P2) avec PagerDuty intégré
□ ELK SIEM opérationnel — Règles de corrélation BCC activées
□ OpenTelemetry traces visibles dans Jaeger pour tous les services

### ✅ CONFORMITÉ
□ DPIA (Data Protection Impact Assessment) validé par le DPO
□ PCI-DSS SAQ (Self-Assessment Questionnaire) complété
□ Registre des traitements RGPD mis à jour
□ Risk Register COBIT révisé et approuvé par le Comité de Direction
□ Formation RGPD et sécurité : 100% du personnel BCC certifié

### ✅ COMMUNICATION & ROLLBACK
□ Plan de communication client prêt (Canal SMS/Email BCC)
□ War Room Teams configuré avec contacts d'urgence
□ Procédure de rollback testée (< 15 minutes via ArgoCD)
□ Go/No-Go meeting planifié J-1 avec toutes les parties prenantes
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PWA** | Progressive Web App — Application web installable sur mobile avec capacités offline |
| **SWIFT** | Society for Worldwide Interbank Financial Telecommunication — Réseau mondial de messagerie financière |
| **MT103** | Message Type 103 — Standard SWIFT pour les virements internationaux de fonds |
| **LBC/FT** | Lutte contre le Blanchiment de Capitaux / Financement du Terrorisme |
| **HPA** | Horizontal Pod Autoscaler — Mécanisme d'auto-scaling Kubernetes basé sur les métriques |
| **RTO** | Recovery Time Objective — Délai maximal acceptable pour rétablir le service après un incident |
| **RPO** | Recovery Point Objective — Perte de données maximale acceptable (Point de restauration maximal) |
| **SAQ** | Self-Assessment Questionnaire — Auto-évaluation de conformité PCI-DSS |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Dans le flux complet du virement international BCC, pourquoi la commande `SELECT ... FOR UPDATE` (PostgreSQL) est-elle critique à l'étape 3 de vérification du solde ?

**Corrigé :** `SELECT ... FOR UPDATE` (Jour 157 — PL/pgSQL) est une instruction de **verrou pessimiste** : elle verrouille la ligne du compte sélectionnée dans PostgreSQL jusqu'à la fin de la transaction en cours. Dans le contexte d'un virement bancaire, cela résout le problème de la **race condition** (condition de course) : si deux virements simultanés depuis le même compte sont initiés (ex: deux devices mobiles simultanément), le premier thread qui exécute `SELECT solde WHERE account_id = X FOR UPDATE` obtient le verrou exclusif et effectue la déduction. Le second thread est mis en attente. Quand le premier commit, le second lit le nouveau solde (déjà débité) et peut correctement vérifier si le solde restant est suffisant. Sans `FOR UPDATE`, les deux threads pourraient lire le même solde initial, valider les deux virements, et débiter deux fois le montant — créant un solde négatif non autorisé (**Problème du Double-Spend**).

**Exercice 2 :** Expliquer la différence entre le **RTO (Recovery Time Objective)** et le **RPO (Recovery Point Objective)** et donner des valeurs cibles réalistes pour le core banking de la BCC en les justifiant.

**Corrigé :** Le **RTO (Recovery Time Objective)** est le **délai maximal** acceptable pour rétablir le service après un incident majeur. Pour le core banking BCC : RTO = 4 heures. Justification : une interruption de 4h est techniquement et réglementairement tolérable (hors heures de pointe), mais au-delà les amendes réglementaires et la perte de confiance client deviennent inacceptables. Le **RPO (Recovery Point Objective)** est la **perte de données maximale** acceptable, exprimée en temps : jusqu'à quel point dans le passé peut-on restaurer sans conséquences catastrophiques ? Pour le core banking BCC : RPO = 1 heure. Justification : La réplication synchrone PostgreSQL Multi-AZ garantit un RPO quasi-nul dans le datacenter principal. La réplication WAL vers S3 via pgBackRest toutes les 5 minutes donne un RPO de 5 minutes pour un sinistre total de datacenter. Le RPO de 1h est donc très conservateur et facilement atteignable. En pratique, avec Patroni + etcd + pgBackRest PITR (Jour 155), le RPO réel de la BCC serait < 5 minutes.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans le flux de virement international BCC, quel composant technique empêche qu'un attaquant puisse effectuer 1000 tentatives de virement par seconde depuis une seule adresse IP ?
- A) Le Rate Limiter (`express-rate-limit`) configuré à l'API Gateway, combiné au blocage IP automatique via le NGFW après détection par le SIEM
- B) Le firewall réseau uniquement
- C) La base de données PostgreSQL
- D) Le DNS Round-Robin

**Réponse : A**

**Q2 :** Selon la checklist de Go-Live BCC, pourquoi les **tests de Disaster Recovery** (validation RTO/RPO) doivent-ils obligatoirement être effectués AVANT la mise en production, et pas simplement planifiés ?
- A) Un plan de DR non testé est un faux sentiment de sécurité. Des surprises techniques (temps de restauration réel 3× supérieur au prévu, scripts de failover défectueux, données corrompues dans les backups) ne se découvrent qu'au test réel — et non pendant un incident de production réel
- B) Car le régulateur bancaire l'exige formellement
- C) Pour optimiser les coûts de stockage S3
- D) Pour valider les certificats TLS avant production

**Réponse : A**

**Q3 :** Dans l'architecture Full-Stack BCC, quel protocole réseau standard garantit l'interopérabilité des virements internationaux entre la BCC et les banques étrangères (banques correspondantes) ?
- A) SWIFT (Society for Worldwide Interbank Financial Telecommunication) via les messages MT103
- B) HTTPS REST API uniquement
- C) gRPC Protobuf
- D) SMTP

**Réponse : A**

**Q4 :** Quels sont le **RTO** et le **RPO** et quelle est leur relation avec la conception de l'architecture haute disponibilité de la BCC (Multi-AZ, pgBackRest PITR) ?
- A) RTO = délai maximal de rétablissement du service ; RPO = perte de données maximale tolérée. L'architecture Multi-AZ (failover automatique en < 60s) détermine le RTO. La fréquence des snapshots WAL pgBackRest (toutes les 5 min) détermine le RPO. Plus le RTO/RPO cible est faible, plus l'architecture doit être redondante et les sauvegardes fréquentes
- B) RTO et RPO sont deux noms du même concept
- C) RTO concerne uniquement la sécurité ; RPO concerne uniquement la performance
- D) RTO et RPO ne sont pertinents que pour les petites organisations

**Réponse : A**

**Q5 :** Dans la checklist de Go-Live BCC, pourquoi la **procédure de rollback** (< 15 minutes via ArgoCD) doit-elle être testée avant la mise en production ?
- A) Lors d'un incident critique en production, la pression est maximale et le temps est compté. Une procédure de rollback non testée peut échouer (configuration manquante, permissions incorrectes), transformant un incident de 15 minutes en une crise de plusieurs heures. ArgoCD rend le rollback trivial (`git revert` + push = retour automatique à la version précédente) mais doit être validé en staging
- B) Pour améliorer la vitesse du pipeline CI/CD
- C) Pour réduire les coûts AWS
- D) Car le rollback est uniquement manuel

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
