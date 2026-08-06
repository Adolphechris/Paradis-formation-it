# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 233 (6h) : Gouvernance de la Cybersécurité (NIST CSF 2.0, ISO 27005 Risk Management, Tableau de Bord CISO & Indicateurs de Performance KPI/KRI)

> [!NOTE]
> **Objectif du jour :** Maîtriser les cadres de **gouvernance de la cybersécurité** au niveau direction : compréhension et application du **NIST Cybersecurity Framework 2.0 (GOVERN, IDENTIFY, PROTECT, DETECT, RESPOND, RECOVER)**, gestion des risques cyber selon **ISO/IEC 27005**, conception d'un **tableau de bord CISO** avec indicateurs de performance (**KPI — Key Performance Indicators**) et indicateurs de risques (**KRI — Key Risk Indicators**) pour le Comité de Direction de la BCC.
>
> **Compétences visées :** `SEC-06` (A) — Gouvernance Cybersécurité NIST CSF 2.0 & ISO 27005 | `POL-03` (A) — Tableau de Bord CISO KPI/KRI & Reporting Comité de Direction

---

## 1) Module — NIST Cybersecurity Framework 2.0 & Maturité (2h)

### 📖 Narration/Intuition

La BCC doit rendre compte de sa posture de cybersécurité au **Gouverneur de la Banque Centrale**, au **Ministère des Finances** et aux **auditeurs internationaux (FMI, Banque Mondiale)**. Ces parties prenantes n'ont pas de formation technique : elles ont besoin d'une **vision structurée, mesurable et compréhensible** de la cybersécurité. C'est le rôle du **CISO (Chief Information Security Officer)** et des cadres de gouvernance.

### 🔍 Anatomie Technique

**NIST CSF 2.0 — Les 6 Fonctions Core (Mise à jour 2024) :**

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    NIST CYBERSECURITY FRAMEWORK 2.0 (2024)                │
│                    BCC — Banque Centrale du Congo                          │
├──────────┬─────────────────────────────────────────────────────────────────┤
│ GOVERN   │ 🏛️ Nouvelle fonction 2024 — Gouvernance & Risques               │
│ (GV)     │ GV.OC : Contexte organisationnel | GV.RM : Risk Management     │
│          │ GV.RR : Rôles & Responsabilités | GV.PO : Politiques           │
├──────────┼─────────────────────────────────────────────────────────────────┤
│ IDENTIFY │ 🔍 Inventaire des actifs & cartographie des risques             │
│ (ID)     │ ID.AM : Gestion des actifs | ID.RA : Évaluation des risques     │
│          │ ID.IM : Amélioration continue (nouveau en 2.0)                  │
├──────────┼─────────────────────────────────────────────────────────────────┤
│ PROTECT  │ 🛡️ Contrôles de protection des actifs critiques                │
│ (PR)     │ PR.AA : Gestion des accès & Identités (Zero Trust)             │
│          │ PR.DS : Sécurité des données (Chiffrement KMS/PQC)             │
├──────────┼─────────────────────────────────────────────────────────────────┤
│ DETECT   │ 🔔 Détection des événements de cybersécurité                   │
│ (DE)     │ DE.CM : Surveillance continue (SIEM ELK + Falco)               │
│          │ DE.AE : Analyse des événements anormaux (ATT&CK)               │
├──────────┼─────────────────────────────────────────────────────────────────┤
│ RESPOND  │ 🚨 Réponse aux incidents de cybersécurité                      │
│ (RS)     │ RS.RP : Exécution du plan de réponse (CSIRT + Playbooks)       │
│          │ RS.CO : Communication (NIST SP 800-61 Post-Mortem)             │
├──────────┼─────────────────────────────────────────────────────────────────┤
│ RECOVER  │ 🔄 Reprise d'activité après incident                           │
│ (RC)     │ RC.RP : Plan de reprise | RC.CO : Communication post-incident  │
└──────────┴─────────────────────────────────────────────────────────────────┘
```

**Évaluation de la Maturité NIST CSF BCC (Profil Actuel → Profil Cible) :**

```
Fonction  │ Niveau Actuel │ Niveau Cible │ Écart  │ Priorité
──────────┼───────────────┼──────────────┼────────┼──────────
GOVERN    │ Tier 1 (Partiel) │ Tier 3    │ -2     │ 🔴 CRITIQUE
IDENTIFY  │ Tier 2 (Risque)  │ Tier 3    │ -1     │ 🟠 HAUTE
PROTECT   │ Tier 2           │ Tier 4    │ -2     │ 🔴 CRITIQUE
DETECT    │ Tier 1 (25% cvg) │ Tier 3    │ -2     │ 🔴 CRITIQUE
RESPOND   │ Tier 2           │ Tier 3    │ -1     │ 🟠 HAUTE
RECOVER   │ Tier 2           │ Tier 3    │ -1     │ 🟠 HAUTE

Tier 1 = Partiel | Tier 2 = Risque informé | Tier 3 = Répétable | Tier 4 = Adaptatif
```

---

## 2) Module — ISO/IEC 27005 & Gestion des Risques Cyber (2h)

### 📖 Narration/Intuition

La norme **ISO/IEC 27005** définit le processus de gestion des risques de sécurité de l'information dans le cadre du **SMSI (Système de Management de la Sécurité de l'Information)** ISO 27001. C'est le référentiel utilisé par les auditeurs FMI pour évaluer la maturité de la gestion des risques de la BCC.

### 🛠️ Atelier Pratique

**Registre des Risques Cyber BCC — Format ISO 27005 (`risk_register_bcc.md`) :**

```markdown
# REGISTRE DES RISQUES CYBERSÉCURITÉ — BCC
# Norme : ISO/IEC 27005:2022 | Propriétaire : CISO BCC

## Méthodologie d'Évaluation :
Risque Inhérent = Probabilité × Impact (Échelle 1-5)
Risque Résiduel = Risque Inhérent × (1 - Efficacité des Contrôles)
Seuil d'Acceptation : Risque ≤ 6/25

| ID     | Menace                             | Actif Menacé         | P  | I  | Risque | Contrôles Existants         | R. Résiduel | Action       |
|:------:|:-----------------------------------|:---------------------|:--:|:--:|:------:|:---------------------------:|:-----------:|:------------:|
| R-001  | Ransomware / Cryptolocker          | Serveurs MNBC        | 4  | 5  | 20     | EDR + Backup                | 8           | RÉDUIRE      |
| R-002  | Compromission compte privilégié    | Active Directory BCC | 4  | 5  | 20     | MFA FIDO2 + PAM JIT         | 4           | ACCEPTER     |
| R-003  | Attaque SCADA / Modbus TCP         | PLC Réseau OT        | 3  | 5  | 15     | ACL + IDS Nozomi            | 6           | ACCEPTER     |
| R-004  | Fuite Smart Contract MNBC          | Réserves MNBC        | 3  | 5  | 15     | Audit Slither + ReentrancyGuard | 4       | ACCEPTER     |
| R-005  | Supply Chain Attack (bibliothèque) | Pipeline CI/CD BCC   | 3  | 4  | 12     | Trivy + SBOM + Dependabot   | 5           | ACCEPTER     |
| R-006  | SSRF → Vol credentials IAM         | Infrastructure AWS   | 2  | 5  | 10     | IMDSv2 + Least Privilege    | 3           | ACCEPTER     |
| R-007  | Ordinateur Quantique (HNDL)        | Communications TLS   | 1  | 5  | 5      | Migration PQC Kyber (J226)  | 2           | SURVEILLER   |

Légende P (Probabilité) : 1=Rare, 2=Improbable, 3=Possible, 4=Probable, 5=Quasi-certain
Légende I (Impact) :      1=Négligeable, 2=Faible, 3=Modéré, 4=Majeur, 5=Catastrophique
```

---

## 3) Module — Tableau de Bord CISO & KPI/KRI (2h)

### 🛠️ Atelier Pratique

**Tableau de Bord CISO BCC — Reporting Comité de Direction (`ciso_dashboard.md`) :**

```markdown
# TABLEAU DE BORD CYBERSÉCURITÉ BCC — COMITÉ DE DIRECTION
# Période : Août 2026 | Préparé par : CISO BCC

## 🔴 INDICATEURS DE RISQUE CLÉS (KRI — Key Risk Indicators)

| KRI                                      | Valeur Actuelle | Seuil Alerte | Tendance | Statut    |
|:-----------------------------------------|:---------------:|:------------:|:--------:|:---------:|
| Nb de vulnérabilités CRITICAL non patchées| 7              | ≤ 3         | ↑        | 🔴 ALERTE |
| Score de couverture détection SOC (ATT&CK)| 25%            | ≥ 80%       | →        | 🔴 ALERTE |
| MTTD — Délai moyen de détection          | 23 min          | ≤ 5 min     | →        | 🔴 ALERTE |
| MTTR — Délai moyen de résolution         | 2h 15min        | ≤ 1h        | ↓        | 🟠 RISQUE |
| % comptes MFA activé (utilisateurs BCC)  | 67%             | ≥ 95%       | ↑        | 🟠 RISQUE |
| % patches critiques appliqués (<30j)     | 71%             | ≥ 95%       | ↑        | 🟠 RISQUE |

## 🟢 INDICATEURS DE PERFORMANCE CLÉS (KPI — Key Performance Indicators)

| KPI                                       | Valeur Actuelle | Objectif | Tendance | Statut    |
|:------------------------------------------|:---------------:|:--------:|:--------:|:---------:|
| Disponibilité Infrastructure MNBC         | 99.7%           | ≥ 99.9%  | ↑        | 🟠 OK     |
| Incidents de sécurité résolus dans les SLA| 78%             | ≥ 95%    | ↑        | 🟠 RISQUE |
| % tests Atomic Red Team avec détection   | 25%             | ≥ 80%    | →        | 🔴 ALERTE |
| Score Trivy images Docker (0 CRITICAL)    | 73%             | 100%     | ↑        | 🟠 RISQUE |
| Employés sensibilisés phishing/sécurité   | 82%             | 100%     | ↑        | 🟢 BON    |

## 📌 DÉCISIONS REQUISES DU COMITÉ DE DIRECTION

1. **APPROBATION BUDGET URGENCE P0** : Programme Purple Team (Caldera + Atomic Red Team)
   Investissement requis : 150 000 USD | ROI estimé : Réduction MTTD de 23min → 5min

2. **APPROBATION POLITIQUE MFA OBLIGATOIRE** : Forcer FIDO2 sur 100% des comptes BCC
   Délai de mise en œuvre : 60 jours | Contrôle : Rapport mensuel CISO

3. **AUTORISATION DÉPLOIEMENT ZTNA** : Migration de 500 utilisateurs du VPN vers Cloudflare ZT
   Investissement : 80 000 USD/an | Réduction de surface d'attaque estimée : 60%
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **NIST CSF** | NIST Cybersecurity Framework — Cadre de cybersécurité du NIST utilisé mondialement |
| **CISO** | Chief Information Security Officer — Directeur de la Sécurité des Systèmes d'Information |
| **KPI** | Key Performance Indicator — Indicateur Clé de Performance mesurant l'efficacité opérationnelle |
| **KRI** | Key Risk Indicator — Indicateur Clé de Risque signalant une détérioration du niveau de risque |
| **SMSI** | Système de Management de la Sécurité de l'Information (équivalent de ISMS en anglais) |
| **MTTD** | Mean Time To Detect — Délai moyen de détection d'un incident de sécurité |
| **MTTR** | Mean Time To Respond/Recover — Délai moyen de réponse ou de remise en service après incident |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** La nouvelle fonction **GOVERN** introduite dans le **NIST CSF 2.0 (2024)** est absente du NIST CSF 1.1. Expliquer pourquoi cette fonction a été ajoutée et ce qu'elle apporte de nouveau par rapport aux 5 fonctions existantes (IDENTIFY, PROTECT, DETECT, RESPOND, RECOVER).

**Corrigé :** Dans le NIST CSF 1.1, la gouvernance et la gestion des risques étaient partiellement couvertes par la fonction **IDENTIFY** (ID.GV — Governance, ID.RM — Risk Management). Cependant, la pratique a montré que de nombreuses organisations maîtrisaient techniquement les fonctions PROTECT, DETECT, etc., mais sans **vision stratégique cohérente** ni **responsabilités clairement définies** au niveau direction. La fonction **GOVERN (GV)** du CSF 2.0 élève la gouvernance au rang de fonction centrale qui **surplombe et oriente toutes les autres fonctions**. Elle couvre : **GV.OC** (Organizational Context) — Compréhension du contexte et des priorités métier de l'organisation. **GV.RM** (Risk Management Strategy) — Définition d'une stratégie de gestion des risques alignée sur les objectifs business. **GV.RR** (Roles, Responsibilities & Authorities) — Clarification des responsabilités (CISO, Conseil d'Administration, opérationnels). **GV.PO** (Policy) — Politiques de cybersécurité formalisées et approuvées par la direction. **GV.OV** (Oversight) — Supervision continue par la direction et le conseil. En résumé, GOVERN assure que la cybersécurité est un **enjeu de gouvernance d'entreprise** et pas seulement une préoccupation technique — ce qui est essentiel pour des institutions comme la BCC devant rendre compte au Gouverneur et aux auditeurs internationaux.

**Exercice 2 :** Le KRI "MTTD (Délai Moyen de Détection)" de la BCC est de **23 minutes** contre un objectif de **5 minutes**. Proposer **3 actions concrètes** permettant de réduire ce délai, en vous appuyant sur les technologies étudiées au Semestre 5.

**Corrigé :** (1) **Programme Purple Team + Règles Sigma ciblées (J223)** : Les 23 minutes de MTTD dans l'incident BCC sont dues à des lacunes de couverture SOC (25%). En déployant un programme Purple Team bimensuel avec Caldera/Atomic Red Team, l'équipe peut identifier et combler en priorité les règles Sigma manquantes pour les techniques ATT&CK les plus utilisées (T1078 Valid Accounts, T1041 Exfiltration). Objectif : Couverture SOC à 80% en 6 mois → MTTD estimé à 3-5 min pour les techniques couvertes. (2) **Déploiement de Canary Tokens (J232)** : Placer des Canary Tokens sur les serveurs critiques, dans l'Active Directory (honey credentials) et dans les buckets S3. Ces tokens déclenchent des alertes en quelques **secondes** (résolution DNS) dès l'accès initial d'un attaquant, bien avant qu'une règle SIEM classique ne se déclenche. (3) **Falco Runtime Security (J231)** : Déployer Falco sur tous les nœuds Kubernetes avec les règles personnalisées BCC (shell interactif en production, accès Docker socket, outils de scan réseau). Falco analyse les syscalls en temps réel et peut alerter en **moins d'une seconde** après un comportement anormal, contre plusieurs minutes pour les règles SIEM qui analysent des logs après leur ingestion.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle **nouvelle fonction** a été ajoutée dans le **NIST Cybersecurity Framework 2.0 (2024)** par rapport à la version 1.1, pour couvrir la gouvernance stratégique, la gestion des risques et les responsabilités au niveau direction ?
- A) La fonction GOVERN (GV) — Gouvernance de la cybersécurité au niveau direction
- B) La fonction MONITOR
- C) La fonction AUDIT
- D) La fonction COMPLY

**Réponse : A**

**Q2 :** Dans le registre des risques cyber BCC selon **ISO 27005**, quelle formule calcule le **Risque Inhérent** d'une menace avant application des contrôles de sécurité ?
- A) Risque Inhérent = Probabilité × Impact (ex: P=4, I=5 → Risque=20/25)
- B) Risque Inhérent = Impact ÷ Probabilité
- C) Risque Inhérent = (Menace + Vulnérabilité) × Actif
- D) Risque Inhérent = CVSS Score × Nombre d'Actifs exposés

**Réponse : A**

**Q3 :** Quelle est la différence fondamentale entre un **KPI (Key Performance Indicator)** et un **KRI (Key Risk Indicator)** dans le tableau de bord CISO ?
- A) Un KPI mesure l'**efficacité opérationnelle** des contrôles de sécurité (ex: % incidents résolus dans les SLA), tandis qu'un KRI signale une **dégradation du niveau de risque** avant qu'un incident ne survienne (ex: % de vulnérabilités CRITICAL non patchées)
- B) Les KPI sont utilisés uniquement par le SOC, les KRI uniquement par le CISO
- C) Les KPI mesurent les risques et les KRI mesurent les performances
- D) KPI et KRI sont deux termes synonymes pour les indicateurs de tableau de bord

**Réponse : A**

**Q4 :** Quel indicateur de risque clé (KRI) dans le tableau de bord CISO BCC — **25% de couverture de détection SOC** — correspond à quelle lacune critique identifiée lors de la simulation Purple Team (J223) ?
- A) Seulement 2 techniques ATT&CK sur 8 testées lors de la simulation Caldera BCC ont été détectées par le SIEM, révélant que 75% des TTPs d'attaquants réels passeraient inaperçus dans le SOC actuel
- B) 25% des employés ont passé la simulation de phishing
- C) 25% des serveurs sont patchés dans les délais
- D) 25% des incidents sont résolus dans les SLA

**Réponse : A**

**Q5 :** Dans les **4 niveaux de maturité (Tiers)** du NIST CSF 2.0, que signifie un niveau **Tier 3 "Répétable" (Repeatable)** pour une fonction comme DETECT ?
- A) Les pratiques de cybersécurité (ex: règles SIEM, processus de détection) sont **formalisées, documentées, approuvées par la direction et appliquées de manière cohérente** à l'ensemble de l'organisation, permettant une réponse prévisible aux incidents
- B) La détection est entièrement automatisée sans intervention humaine
- C) L'organisation détecte 100% des incidents en temps réel
- D) La fonction DETECT est exécutée de manière partielle et informelle selon les ressources disponibles

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
