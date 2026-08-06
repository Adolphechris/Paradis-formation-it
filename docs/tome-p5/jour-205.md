# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 205 (6h) : Projet Intégrateur Semestre 5 — Partie 1 : Simulation d'Infiltration Red Team Complète (Du Phishing/OSINT à la Domination Active Directory BCC)

> [!NOTE]
> **Objectif du jour :** Synthetiser les acquis des Jours 201 à 204 dans un **projet intégrateur Red Team complet** : simulation d'un scénario d'attaque réaliste contre l'infrastructure d'entreprise de la BCC, documentant chaque étape du **Cyber Kill Chain** (Reconnaissance OSINT → Accès Initial → Exploitation → Escalade de Privilèges Linux/Windows → Pivoting → Compromission de l'Active Directory).
>
> **Compétences visées :** `SEC-06` (A) — Red Team Cyber Kill Chain & Post-Exploitation | `SEC-04` (A) — Active Directory Compromise & Reporting

---

## 1) Module — Déroulé du Scénario d'Attaque Red Team BCC (2h)

### 📖 Narration/Intuition

L'équipe Red Team de la BCC est mandatée pour tester la résilience globale de la banque centrale face à un groupe d'attaque sophistiqué (APT). La mission est de simuler une intrusion complète sans informer l'équipe SOC (Test boîte noire), en partant d'Internet pour atteindre le rôle **Domain Admin** sur le contrôleur de domaine principal de la BCC.

### 🔍 Anatomie Technique

**Les 6 Phased du Cyber Kill Chain Red Team BCC :**

```
PHASE 1 : RECONNAISSANCE OSINT (Jour 201)
  ├── Identification du domaine `bcc.cd` et sous-domaines via Amass
  ├── Découverte d'un serveur VPN SSL Fortinet sur `vpn.bcc.cd:8443`
  └── Gathering de 50 emails collaborateurs sur LinkedIn via theHarvester

PHASE 2 : ACCÈS INITIAL (Initial Access — Jour 202)
  ├── Phishing ciblé (Spear-Phishing) avec document Office malveillant
  └── Un collaborateur clique ──► Session Reverse Shell Meterpreter établie !

PHASE 3 : ESCALADE DE PRIVILÈGES LOCALE (Jour 203)
  ├── Post-exploitation sur le poste compromis (Windows 11)
  ├── Exécution de LinPeas / WinPeas ──► Détection de SeImpersonatePrivilege
  └── Exécution de PrintSpoofer.exe ──► Obtention de `NT AUTHORITY\SYSTEM` !

PHASE 4 : PILLAGE & CREDENTIAL DUMPING (Jour 204)
  ├── Injection de Mimikatz dans la mémoire LSASS (`sekurlsa::logonpasswords`)
  └── Extraction du hash NTLM du compte de service `svc_sql_admin`

PHASE 5 : PIVOTING & EXTENSION ACTIVE DIRECTORY (Jour 204)
  ├── Execution de SharpHound.exe ──► Cartographie du domaine Active Directory
  ├── Import dans BloodHound ──► Détection du chemin vers le Domain Admin
  └── Attaque Kerberoasting sur le SPN `MSSQLSvc/db-prod.bcc.cd:1433`
  └── Cassage du hash TGS avec Hashcat ──► Mot de passe `P@ssword2024!`

PHASE 6 : DOMINATION TOTALE & AD DOMAIN ADMIN (Jour 204)
  └── Connexion avec Impacket `psexec.py` sur le contrôleur de domaine `DC01`
  └── Prise de contrôle totale du Domaine BCC (`bcc.cd\Administrator`)
```

---

## 2) Module — Matrice de Synthèse d'Attaque (2h)

### 📖 Narration/Intuition

Chaque étape de la simulation Red Team est consignée avec précision dans une matrice d'attaque détaillée incluant les preuves de concept (PoCs), les indicateurs de compromission (IoCs) générés, et les contrôles de sécurité Blue Team qui auraient dû bloquer l'attaque.

### 🔍 Anatomie Technique

**Matrice de Synthèse d'Infiltration Red Team BCC :**

| Phase | Technique MITRE ATT&CK | Outil Utilisé | Résultat Obtenu | Détection SOC Attendue |
|---|---|---|---|---|
| 1. Recon | T1596 (Search Open Databases) | Amass, Shodan | IPs et VPN exposés identifiés | Aucune (Passif) |
| 2. Initial Access | T1566.001 (Spearphishing Attachment) | MSFvenom, Macro C# | Shell Meterpreter sur PC-042 | EDR Alert (Macro execution) |
| 3. PrivEsc | T1134.001 (Token Impersonation) | PrintSpoofer.exe | Access SYSTEM local | EDR Alert (Privilege escalation) |
| 4. Credential | T1003.001 (LSASS Memory) | Mimikatz sekurlsa | Hash NTLM `svc_sql` extrait | EDR Alert (LSASS memory dump) |
| 5. Lateral | T1558.003 (Kerberoasting) | GetUserSPNs.py | Hash TGS extrait & cassé | SIEM Alert (TGS Request spike) |
| 6. Domain Admin | T1021.002 (SMB/Windows Admin Shares) | Impacket psexec.py | Shell `SYSTEM` sur DC01 | SIEM Alert (Psexec service creation) |

---

## 3) Module — Recommandations de Remédiation Blue Team (2h)

### 📖 Narration/Intuition

La valeur d'un exercice Red Team ne réside pas dans la démonstration d'une intrusion réussie, mais dans les **recommandations concrètes** fournies à la Blue Team pour élever la posture de sécurité globale de l'organisation.

### 🛠️ Atelier Pratique

**Plan d'Action de Remédiation Globale Red Team BCC :**

```markdown
# PLAN D'ACTION DE REMÉDIATION POST-RED TEAM — BCC
## Priorité : IMMÉDIATE | Rapport Réf : BCC-REDTEAM-2026-01

### 1. RENFORCEMENT ACTIVE DIRECTORY (Priorité 1)
- 🔒 **R-01 : Mot de passe des Comptes de Service (Kerberoasting)**
  - Modifier le mot de passe de `svc_sql_admin` pour une chaîne aléatoire de 32+ caractères.
  - Implémenter les **Group Managed Service Accounts (gMSA)** : gestion et rotation automatique des mots de passe des comptes de service par Active Directory (mots de passe de 128 caractères incassables).

### 2. SÉCURISATION DES ENDPOINTS & EDR (Priorité 1)
- 🔒 **R-02 : Protection du Processus LSASS**
  - Activer **LSASS Protected Process Light (PPL)** dans le Registre Windows pour empêcher Mimikatz d'accéder à la mémoire LSASS même en étant Admin local.
  - Registre : `HKLM\SYSTEM\CurrentControlSet\Control\Lsa\RunAsPPL = 1`

### 3. RESTRICTION DES PRIVILÈGES SYSTEM (Priorité 2)
- 🔒 **R-03 : Mitigation des Attaques Token Impersonation**
  - Supprimer le privilège `SeImpersonatePrivilege` pour tous les comptes non-administrateurs système.
  - Déployer Microsoft LAPS (Local Administrator Password Solution) pour garantir des mots de passe administrateurs locaux uniques par machine.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **gMSA** | Group Managed Service Accounts — Comptes de service AD avec gestion automatique des mots de passe |
| **PPL** | Protected Process Light — Protection matérielle/OS empêchant l'inspection de la mémoire LSASS |
| **LAPS** | Local Administrator Password Solution — Solution Microsoft de mots de passe locaux aléatoires |
| **IoC** | Indicator of Compromise — Trace technique laissée par une attaque (IP, Hash, binaire) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi la mise en place de **gMSA (Group Managed Service Accounts)** dans Active Directory éradique-t-elle le risque lié aux attaques de type **Kerberoasting** ?

**Corrigé :** L'attaque **Kerberoasting** repose sur le fait de demander un ticket TGS pour un compte de service puis de tenter de casser par force brute hors-ligne son mot de passe avec Hashcat. Les comptes de service traditionnels ont souvent des mots de passe simples ou définis par des humains (ex: `SQLAdmin2024!`). Avec les **gMSA (Group Managed Service Accounts)**, Active Directory prend en charge la génération et la rotation automatique (tous les 30 jours) du mot de passe du compte de service. Ce mot de passe est une chaîne aléatoire complexe de **128 caractères**. Même si un attaquant parvient à capturer le ticket TGS Kerberos d'un gMSA, il est **computationnellement impossible** de casser un mot de passe aléatoire de 128 caractères par force brute avec les capacités de calcul actuelles, annulant ainsi l'efficacité du Kerberoasting.

**Exercice 2 :** Quel est le rôle du composant **LSASS PPL (Protected Process Light)** dans la protection contre les outils comme Mimikatz ?

**Corrigé :** Pour lire les mots de passe et hashes NTLM en mémoire avec `sekurlsa::logonpasswords`, Mimikatz doit ouvrir un handle d'accès en lecture sur le processus système `lsass.exe` via l'API Win32 `OpenProcess`. Lorsque **LSASS PPL (Protected Process Light)** est activé dans le registre Windows (`RunAsPPL = 1`), le noyau Windows protège le processus `lsass.exe` en empêchant tout processus non signé numériquement par une signature spéciale Microsoft de lire ou d'injecter du code dans sa mémoire. Même si l'attaquant dispose des privilèges `NT AUTHORITY\SYSTEM` ou d'un privilège `privilege::debug` dans Mimikatz, l'accès à la mémoire LSASS est bloqué au niveau du noyau Windows.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la première étape du Cyber Kill Chain exécutée par une équipe Red Team pour récolter des informations publiques sur la cible sans interagir directement avec ses serveurs ?
- A) La Reconnaissance OSINT
- B) L'Escalade de privilèges
- C) La Persistance
- D) L'Exfiltration

**Réponse : A**

**Q2 :** Quelle fonctionnalité Microsoft Active Directory permet de gérer automatiquement la rotation de mots de passe complexes de 128 caractères pour les comptes de service, immunisant l'AD contre le Kerberoasting ?
- A) gMSA (Group Managed Service Accounts)
- B) LAPS
- C) Active Directory Users & Computers
- D) Group Policy Objects (GPO)

**Réponse : A**

**Q3 :** Quel paramètre de registre Windows permet d'activer la protection **PPL (Protected Process Light)** sur le processus LSASS afin de bloquer les attaques de dump mémoire par Mimikatz ?
- A) `RunAsPPL = 1`
- B) `EnableLsass = 0`
- C) `SecurityMode = High`
- D) `DisableMimikatz = 1`

**Réponse : A**

**Q4 :** Dans un rapport Red Team, que désignent les **IoCs (Indicators of Compromise)** ?
- A) Les traces techniques (IPs, hashes de fichiers, clés de registre, logs) laissées par l'attaque et permettant à la Blue Team de détecter et vérifier l'intrusion
- B) La liste des employés de l'entreprise
- C) La facture de la mission Red Team
- D) Les diagrammes de réseau

**Réponse : A**

**Q5 :** Quel outil Microsoft permet de générer automatiquement des mots de passe administrateurs locaux uniques et aléatoires sur chaque poste de travail d'un domaine Windows ?
- A) LAPS (Local Administrator Password Solution)
- B) Mimikatz
- C) BitLocker
- D) Windows Defender

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
