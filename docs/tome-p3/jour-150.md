# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 150 (6h) : Projet Intégrateur Final P3 — Architecture Sécurisée End-to-End d'une Banque Centrale Africaine Numérique (BCC Full Stack : Cloud, IA, SecOps & Résilience)

> [!NOTE]
> **Objectif du jour :** Intégrer l'ensemble des compétences acquises durant le Tome P3 (Semestre 3) dans un projet de conception architecturale complet : proposition d'architecture cible sécurisée pour la Banque Centrale du Congo (BCC) à l'horizon 2027, couvrant l'infrastructure Cloud Native, la cyberdéfense (SOC/SIEM/SOAR), la résilience opérationnelle (BCP/DRP), l'IA appliquée et la gouvernance GRC/ISO 27001.
>
> **Compétences visées :** `ALL` — Intégration des compétences P3 | `PRO-01` (A) — Architecture Sécurisée End-to-End

---

## 1) Module — Architecture Cible BCC 2027 (Vue Globale) (2h)

### 📖 Narration/Intuition

Après 5 mois de formation intensive dans les disciplines du Tome P3, vous êtes convoqué comme **Consultant en Architecture Sécurité** par la Direction Générale de la BCC. La mission : concevoir l'architecture IT cible de la BCC pour 2027, une architecture qui sera à la fois **souveraine, résiliente, sécurisée et évolutive** dans un environnement numérique africain aux contraintes spécifiques (latence réseau, connectivité intermittente, risques géopolitiques).

### 🔍 Anatomie Technique

**Architecture BCC 2027 — Vue Logique Complète :**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    BCC ARCHITECTURE CIBLE 2027 — VUE LOGIQUE                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────┐  │
│  │  DATACENTER 1   │    │  DATACENTER 2   │    │  CLOUD HYBRIDE (AWS/    │  │
│  │  KINSHASA       │◄──►│  LUBUMBASHI     │◄──►│  Azure Africa South)    │  │
│  │  (Active)       │    │  (Hot Standby)  │    │  (Burst & DR)           │  │
│  │  RPO=0, RTO<15m │    │  Patroni/PgHA   │    │  SLSA L3, SBOM          │  │
│  └────────┬────────┘    └────────┬────────┘    └──────────┬──────────────┘  │
│           │                     │                          │                  │
│           └─────────────────────┼──────────────────────────┘                 │
│                                 │                                             │
│           ┌─────────────────────▼──────────────────────────────────────┐     │
│           │                   CYBERDÉFENSE (SOC 24/7)                  │     │
│           │   Wazuh SIEM  │  OpenCTI CTI  │  TheHive/Cortex SOAR       │     │
│           │   Falco (K8s) │  Sigma Rules  │  Velociraptor (DFIR)        │     │
│           └────────────────────────────────────────────────────────────┘     │
│                                                                              │
│           ┌─────────────────────────────────────────────────────────────┐    │
│           │            GOUVERNANCE & CONFORMITÉ (GRC)                   │    │
│           │  ISO 27001:2022  │  NIS2 (mapping)  │  COBAC Compliance     │    │
│           │  OpenRMF         │  PDCA Cycle       │  FinOps Dashboard     │    │
│           └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Synthèse des Décisions Architecturales Clés (2h)

### 📖 Narration/Intuition

Chaque décision architecturale dans le contexte bancaire africain doit être justifiée par des critères mesurables : coût, risque résiduel, conformité réglementaire et faisabilité opérationnelle locale.

### 🔍 Anatomie Technique

**Matrice de Décision Architecture BCC 2027 :**

| Domaine | Solution Retenue | Justification | Coût Estimé |
|:---|:---|:---|:---|
| Haute Dispo DB | PostgreSQL + Patroni | RPO=0, RTO<15min, Open Source | 0$ licence + infra |
| Kubernetes | K3s (Lightweight) | Adapté aux contraintes DRC (mémoire limitée) | 0$ + opex |
| SIEM | Wazuh | Open Source, normes ISO/PCI natives | 0$ + formation |
| CTI | OpenCTI | ANSSI, STIX/TAXII, feeds gratuits CIRCL | 0$ |
| Secrets | HashiCorp Vault OSS | FIPS 140-2, audit trail | 0$ |
| PKI Interne | Step-CA | Rotation automatique certificats | 0$ |
| IA Fraudes | XGBoost + MLflow | Explicable SHAP, RGPD-compliant | 0$ |
| IaC | Terraform + Ansible | Multi-cloud, versionné, testé | 0$ |
| SD-WAN | OpenWRT + WireGuard | Coût 0$ licence, LTE backup | Infra uniquement |

---

## 3) Module — Feuille de Route d'Implémentation & Gouvernance du Projet (2h)

### 📖 Narration/Intuition

La livraison d'une architecture de cette envergure en 18 mois exige une gouvernance de projet rigoureuse : un **Comité de Pilotage Cybersécurité** (COPIL-SEC) mensuel, une approche par **sprints Agile de 4 semaines**, des jalons de livraison mesurables et un tableau de bord de suivi des risques.

### 🔍 Anatomie Technique

**Feuille de Route Implémentation BCC 2027 (Gantt simplifié) :**

```
PHASE 0 — FONDATIONS (Q1 2026)         : ✅ RÉALISÉ
  ├── Formation des équipes IT (PARADIS-IT Tome P1-P3)
  ├── Audit AS-IS de l'infrastructure existante
  └── Rédaction de la politique de sécurité SI

PHASE 1 — INFRASTRUCTURE SOCLE (Q2 2026) : 🔄 EN COURS
  ├── Déploiement K3s Cluster Multi-nœuds (Kinshasa)
  ├── PostgreSQL HA Patroni (RPO=0)
  ├── Terraform + Ansible IaC (GitOps)
  └── Wazuh SIEM + Falco

PHASE 2 — SÉCURITÉ AVANCÉE (Q3 2026)    : ⏳ PLANIFIÉ
  ├── SOC 24/7 (TheHive/Cortex SOAR)
  ├── OpenCTI Threat Intelligence
  ├── Pipeline DevSecOps (SBOM + SLSA L3)
  └── Vault PKI + Zero Trust ZTNA

PHASE 3 — CLOUD & IA (Q4 2026)          : ⏳ PLANIFIÉ
  ├── Cloud Hybride AWS Africa + Azure
  ├── IA Fraudes XGBoost Production (MLflow + Seldon)
  ├── FinOps Dashboard + Auto-Stop
  └── ISO 27001:2022 Audit de Certification

PHASE 4 — OPTIMISATION & MESURE (Q1 2027) : ⏳ PLANIFIÉ
  ├── Purple Team Annuel (VECTR)
  ├── DRP Failover Drill bi-annuel
  ├── Renouvellement certification ISO 27001
  └── Audit NIS2-mapping + COBAC Compliance
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **COPIL** | Comité de Pilotage — Organe de gouvernance d'un projet IT |
| **AS-IS** | État actuel de l'architecture / processus (avant transformation) |
| **TO-BE** | État cible de l'architecture / processus (après transformation) |
| **Gantt** | Diagramme de planification des tâches d'un projet dans le temps |

---

## 🏋️ Exercices & Corrigés

**Exercice Final 1 :** Vous êtes architecte sécurité pour la BCC. Le COMEX vous demande de choisir entre deux options pour la haute disponibilité des bases de données critiques RTGS : **(A) PostgreSQL + Patroni (RPO=0, RTO<15min, open-source)** vs **(B) Oracle RAC (RPO≈0, RTO<5min, licence annuelle 250 000$)**. Justifiez votre recommandation en tenant compte du contexte africain.

**Corrigé :** La recommandation est **PostgreSQL + Patroni (Option A)** pour les raisons suivantes :

1. **Coût** : La licence Oracle RAC à 250 000$/an représente 3 fois le budget annuel de formation IT de la BCC. PostgreSQL + Patroni est 100% open-source, les coûts se limitent à l'infrastructure et à l'expertise opérationnelle.

2. **Compétences locales** : PostgreSQL dispose d'une communauté francophone active. Former les équipes BCC à PostgreSQL est plus rapide et moins coûteux (ressources gratuites, cours en ligne) qu'à Oracle.

3. **SLA suffisant** : Un RPO=0 et un RTO<15 minutes satisfait amplement les exigences réglementaires de la COBAC pour un système RTGS. L'écart marginal avec Oracle (RTO 5min vs 15min) ne justifie pas un surcoût de 250 000$/an.

4. **Souveraineté** : PostgreSQL peut être déployé on-premise dans les datacenters locaux de Kinshasa et Lubumbashi sans dépendance à un éditeur tiers américain.

**Exercice Final 2 :** Pourquoi l'intégration de la **Threat Intelligence (OpenCTI + STIX)** avec le **SIEM (Wazuh)** et le **SOAR (TheHive/Cortex)** est-elle considérée comme la pierre angulaire d'un SOC bancaire moderne ?

**Corrigé :** Cette intégration crée une boucle de défense automatisée end-to-end : **OpenCTI** ingère en continu des feeds de Threat Intelligence (CIRCL, AlienVault OTX) et enrichit les IOCs STIX avec des informations contextuelles sur les groupes APT ciblant les banques africaines. Ces IOCs sont automatiquement synchronisés dans **Wazuh** qui déclenche des alertes en temps réel dès qu'une communication vers un IP ou domaine C2 connu est détectée. L'alerte est automatiquement transmise à **TheHive** qui ouvre un incident structuré et lance **Cortex** qui exécute des playbooks d'investigation automatisée (enrichissement VirusTotal, isolation réseau de l'actif suspect). Cette chaîne réduit le **MTTD (Mean Time To Detect)** de jours à minutes et le **MTTR (Mean Time To Respond)** de heures à secondes.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans le contexte d'un SOC bancaire africain, quelle triade d'outils constitue le cœur d'une réponse automatisée aux incidents (MTTD + MTTR minimaux) ?
- A) SIEM (Wazuh) + CTI (OpenCTI) + SOAR (TheHive/Cortex)
- B) Paint + Word + Excel
- C) Disquette + Imprimante + Fax
- D) WiFi + Bluetooth + NFC

**Réponse : A**

**Q2 :** Parmi les solutions suivantes, laquelle offre une haute disponibilité PostgreSQL avec RPO=0 et failover automatique sans coût de licence ?
- A) Patroni (open-source) avec réplication synchrone
- B) Oracle RAC
- C) MS Access
- D) Fichier CSV partagé

**Réponse : A**

**Q3 :** Quelle est la signification du sigle **MTTD** en cybersécurité opérationnelle SOC ?
- A) Mean Time To Detect — Durée moyenne de détection d'un incident depuis son occurrence
- B) Mégaoctets To Download
- C) Machine To Talk Directly
- D) My Timed Technical Device

**Réponse : A**

**Q4 :** Dans la feuille de route BCC 2027, quelle activité est recommandée deux fois par an pour valider l'efficacité des procédures de reprise après sinistre ?
- A) DRP Failover Drill (exercice de basculement documenté)
- B) Achat de nouveaux écrans
- C) Réunion d'équipe sans agenda
- D) Mise à jour de Word

**Réponse : A**

**Q5 :** Quelle norme internationale de sécurité de l'information la BCC vise-t-elle à obtenir à l'horizon 2026, démontrant la maturité de son Système de Management de la Sécurité de l'Information (SMSI) ?
- A) ISO 27001:2022
- B) ISO 9001 (Qualité)
- C) ISO 14001 (Environnement)
- D) ISO 22000 (Alimentaire)

**Réponse : A**

---

## 🎓 Félicitations — Fin du Tome P3 (Semestre 3)

Vous venez de terminer les **50 leçons du Tome P3** couvrant les domaines suivants :

- ☁️ **Cloud Native & Kubernetes** : K3s, Helm, GitOps, ArgoCD, Kustomize
- 🔐 **Cyberdéfense Avancée** : SOC/SIEM/SOAR, Purple Team, Red Team C2
- 🌐 **Réseaux Avancés** : MPLS, SD-WAN, BGP Security, RPKI, 5G
- 🤖 **IA & MLOps** : XGBoost, SHAP, MLflow, Fraud Detection
- 📋 **GRC & Conformité** : ISO 27001, NIS2, COBAC, FinOps
- 🛡️ **Supply Chain Security** : SBOM, SLSA, Backstage IDP
- 💡 **Résilience** : BCP/DRP, RPO/RTO, Patroni PostgreSQL HA

**Prochaine étape : Tome P4 — Spécialisation & Certification Internationale**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
