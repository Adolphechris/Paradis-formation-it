# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 105 (6h) : Sécurité Offensive Avancée & Red Teaming — Post-Exploitation, Active Directory & EDR Evasion

> [!NOTE]
> **Objectif du jour :** Comprendre les tactiques avancées de post-exploitation et de Red Teaming au sein d'une infrastructure d'entreprise (Active Directory / Windows Domain & Linux) : mouvements latéraux, élévation de privilèges, attaque Kerberoasting/Pass-the-Hash, évasion d'EDR/Antivirus et techniques de persistence.
>
> **Compétences visées :** `SEC-06` (A) — Red Teaming & Post-Exploitation | `SEC-03` (A) — Sécurité Active Directory & EDR

---

## 1) Module — Attaques Active Directory & Kerberos (Kerberoasting / Pass-the-Hash) (2h)

### 📖 Narration/Intuition

Dans 90% des entreprises et institutions bancaires, la gestion des identités du réseau interne (postes de travail, serveurs de fichiers, accès VPN) s'appuie sur **Active Directory (AD)** et le protocole **Kerberos**.

Lorsqu'un auditeur Red Team obtient un premier accès sur une machine du domaine (même avec un compte utilisateur simple sans privilèges), il cherche à compromettre l'annuaire Active Directory complet pour devenir **Domain Admin**.

### 🔍 Anatomie Technique

**Attaques emblématiques sur Active Directory :**

```
1. Kerberoasting :
   - Un utilisateur du domaine demande un ticket Kerberos TGS (Ticket Granting Service) pour un Service Principal Name (SPN).
   - La partie chiffrée du TGS est chiffrée avec le hash du mot de passe du compte de service.
   - L'attaquant extrait le ticket et casse le mot de passe du compte de service HORS-LIGNE (Offline Hash Cracking).

2. Pass-the-Hash (PtH) :
   - NTM (NTLM Hash) extrait de la mémoire d'un poste compromis (via Mimikatz/lsass).
   - L'attaquant utilise le hash NTLM directement pour s'authentifier sur d'autres serveurs SANS avoir besoin de connaître le mot de passe en clair.

3. DCSync :
   - Simulation du comportement d'un contrôleur de domaine (DC) pour demander la réplication de tous les hashs de mots de passe de l'annuaire (y compris le hash 'krbtgt').
```

**Exemple d'attaque Kerberoasting avec la suite Impacket :**

```bash
# 1. Lister et extraire les tickets TGS des comptes de service ayant des SPNs
GetUserSPNs.py bcc.cd/jean.mbeki:MotDePasse123! -dc-ip 10.0.10.10 -request -outputfile /tmp/kerberoast_hashes.txt

# 2. Casser les hashs extraits hors-ligne avec Hashcat ou John the Ripper
hashcat -m 13100 /tmp/kerberoast_hashes.txt /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule

# 3. Authentification Pass-the-Hash avec Impacket wmiexec
wmiexec.py -hashes :c82523db5a8740520a0a09e07f66a291 Administrator@10.0.10.20
```

---

## 2) Module — Mouvements Latéraux & Évation d'EDR / Antivirus (2h)

### 📖 Narration/Intuition

Les solutions **EDR (Endpoint Detection and Response)** surveillent en temps réel la mémoire et les appels système (Syscalls) des postes de travail. Pour tester la résistance des défenses Blue Team, l'équipe Red Team doit utiliser des techniques d'**obfuscation**, d'**injection mémoire furtive** (Process Injection) et de contournement d'AMSI (Antimalware Scan Interface).

### 🔍 Anatomie Technique

**Techniques d'Évasion d'EDR et Contournement :**

```
- Unhooking API / Direct Syscalls : Contourner les hooks qu'un EDR place dans ntdll.dll en appelant directement les Syscalls du noyau Windows.
- Obfuscation de Shellcode : Chiffrer le payload (ex: AES-256) et le déchiffrer uniquement en mémoire vive juste avant l'exécution.
- Process Hollowing : Lancer un processus légitime (ex: svchost.exe), vider sa mémoire et y injecter le code du payload.
```

---

## 3) Module — Matrice MITRE ATT&CK & Détection Blue Team (2h)

### 📖 Narration/Intuition

La **matrice MITRE ATT&CK** est le dictionnaire mondial de référence qui répertorie toutes les Tactiques, Techniques et Procédures (TTPs) utilisées par les cyberattaquants réels. Elle sert de langage commun entre le Red Team (qui teste les attaques) et le Blue Team (qui configure les règles de détection).

### 🔍 Anatomie Technique

**Correspondance ATT&CK et Règles de Détection (Sigma / Sysmon) :**

```yaml
# Règle Sigma de détection de l'exécution d'outils type Mimikatz / Lsass Dumping
title: Détection d'Accès Suspect à LSASS (Dumping de Mémoire)
id: 5f986b05-3b10-486f-a6de-7b0840c8f000
status: test
description: Détecte la lecture directe du processus lsass.exe (Technique T1003.001)
logsource:
  category: process_access
  product: windows
detection:
  selection:
    TargetImage|endswith: '\lsass.exe'
    GrantedAccess: '0x1010'  # PROCESS_VM_READ | PROCESS_QUERY_INFORMATION
  condition: selection
falsepositives:
  - Antivirus et agents de sécurité légitimes
level: high
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **EDR** | Endpoint Detection and Response — Agent de détection et réponse aux menaces sur les postes |
| **SPN** | Service Principal Name — Identifiant unique d'un service dans Active Directory |
| **TTP** | Tactics, Techniques, and Procedures — Ensemble des comportements d'un groupe d'attaquants |
| **LSASS** | Local Security Authority Subsystem Service — Processus Windows gérant les identifiants en mémoire |
| **AMSI** | Antimalware Scan Interface — Interface standard de Windows permettant aux antivirus d'inspecter les scripts |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi l'attaque **Kerberoasting** est-elle particulièrement difficile à détecter pour les pare-feux et antivirus traditionnels ?

**Corrigé :** Dans une attaque Kerberoasting, la demande de ticket Kerberos (TGS) effectuée par l'attaquant est une **opération totalement légitime** prise en charge par le protocole Kerberos d'Active Directory. L'attaquant n'envoie aucun code malveillant au contrôleur de domaine (DC). De plus, le cassage du mot de passe du compte de service s'effectue **entièrement hors-ligne (Offline)** sur la machine de l'attaquant, sans générer la moindre requête ou alerte sur le réseau d'entreprise pendant la phase de brute-force.

**Exercice 2 :** Quel est le rôle d'une règle **Sigma** en cybersécurité défensive (Blue Team) ?

**Corrigé :** **Sigma** est un format de règle générique et ouvert (en YAML) qui permet de décrire des signatures de détection d'attaques de manière indépendante des outils. Une règle Sigma peut être automatiquement convertie et exportée vers divers systèmes SIEM ou EDR (Splunk, Elastic KQL, QRadar, Microsoft Sentinel), permettant aux équipes SOC de partager et déployer instantanément des signatures de détection uniformes.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans Active Directory, quelle attaque consiste à demander des tickets Kerberos TGS pour des comptes de service et à tenter de casser leurs mots de passe hors-ligne ?
- A) SQL Injection
- B) Kerberoasting
- C) Cross-Site Scripting
- D) Ping of Death

**Réponse : B**

**Q2 :** Quelle base de connaissances et matrice de référence mondiale développée par MITRE répertorie toutes les tactiques et techniques (TTPs) utilisées par les cyberattaquants ?
- A) MITRE ATT&CK
- B) ISO 9001
- C) IEEE 802.11
- D) W3C

**Réponse : A**

**Q3 :** Quel processus système Windows responsable de la gestion des identités et des sessions est la cible privilégiée des attaquants pour extraire des hashs de mots de passe en mémoire ?
- A) explorer.exe
- B) lsass.exe
- C) notepad.exe
- D) calc.exe

**Réponse : B**

**Q4 :** Quelle technique de post-exploitation permet à un attaquant d'utiliser directement un hash de mot de passe NTLM intercepté pour s'authentifier sur d'autres serveurs du domaine sans connaître le mot de passe en clair ?
- A) Pass-the-Hash (PtH)
- B) Phishing
- C) Formatage de disque
- D) Scan Nmap -sP

**Réponse : A**

**Q5 :** Que surveille principalement une solution de sécurité de type EDR (Endpoint Detection and Response) installée sur un poste de travail ?
- A) La température de la pièce
- B) Les événements système, la mémoire vive, les appels système (syscalls) et les processus en temps réel pour détecter des comportements malveillants
- C) Le niveau d'encre de l'imprimante
- D) La vitesse du ventilateur CPU

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
