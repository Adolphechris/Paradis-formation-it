# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 299 (6h) : Master 1 Capstone Project (Full Red/Blue Team Hybrid Infrastructure Attack & Grand Scénario d'Élimination des Angles Morts de Détection)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre le **Projet Intégrateur Final du Master 1 (Capstone Project)** : réaliser une simulation d'attaque Red Team de bout en bout sur une infrastructure hybride complexe (Web, Active Directory, AWS/Azure Cloud, Kubernetes, IoT, AI), valider la réponse de la Blue Team (SIEM EQL, EDR Isolation, SOAR Playbooks), éliminer les angles morts de détection et produire le **Rapport Global de Synthèse du Master 1**.
>
> **Ce projet constitue le point d'orgue et la validation officielle de l'année de Master 1 Cybersécurité.**

---

## 🎯 Objectifs de la Leçon

- ⚔️ Orchestrer une chaîne d'attaque hybride Red Team complète à travers 5 domaines (Web, Cloud, Active Directory, EDR Evasion, Persistance).
- 🛡️ Éliminer les angles morts de détection de la Blue Team via le traçage noyau **ETW-Ti** (*Event Tracing for Windows Threat Intelligence*).
- 🔐 Forcer l'utilisation d'**IMDSv2** sur AWS et neutraliser les attaques par rebond SSRF.
- ⚡ Valider la vitesse de réaction SOAR avec un **MTTR inférieur à 3 minutes**.
- 🧪 Développer et exécuter le script d'évaluation globale du Master 1 (`m1_capstone_audit.py`).
- 🎓 Valider le projet intégrateur et débloquer l'admission au **Cycle Master 2**.

---

## 🖼️ Grand Simulation Hybride Red/Blue Team

![Red Blue Team Capstone](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800)

---

## 📖 1. La Matrice de l'Attaque Hybride Multi-Domaines (299 Days Matrix)

Dans un environnement d'entreprise moderne, les attaquants ne s'arrêtent pas à la frontière d'un seul serveur. Ils naviguent en permanence entre les applications Web, les clusters Kubernetes, l'Active Directory local et les infrastructures Cloud AWS/Azure.

```
                                  CHAÎNE D'ATTAQUE HYBRIDE MASTER 1
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1 : WEB & CLOUD INITIAL ACCESS                                                     │
│ - Faille SSRF sur l'application Web ──► Interrogation de l'IMDSv1 AWS (169.254.169.254)  │
│ - Vol des identifiants temporaires IAM de l'instance EC2.                               │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2 : PIVOT CLOUD VERS ON-PREMISES                                                   │
│ - Exploration du Bucket AWS S3 ──► Téléchargement d'une sauvegarde de base AD ntds.dit. │
│ - Extraction hors-ligne des hashes NTLM du domaine d'entreprise.                         │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 3 : COMPROMISSION ACTIVE DIRECTORY                                                 │
│ - Exploitation des templates ADCS vulnérables (ESC1 / Shadow Credentials via Certipy).   │
│ - Obtention d'un certificat d'administrateur du domaine (Domain Admin).                   │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 4 : ÉVASION EDR & EXECUTION KERNEL                                                 │
│ - Patching mémoire d'AMSI + Appel direct aux Syscalls du Noyau (SysWhispers3).           │
│ - Évasion complète de l'inspection de l'agent EDR en User Space.                          │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 5 : PERSISTANCE HYBRIDE                                                            │
│ - Installation d'une persistance WMI Event Subscription en local.                        │
│ - Vol de jetons Azure Primary Refresh Tokens (PRT) pour la persistance Cloud Entra ID.   │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📖 2. Réponse Blue Team & Élimination des Angles Morts

Pour contrer cette attaque sophistiquée, la Blue Team déploie 4 contremesures architecturales avancées :

### 2.1 Neutralisation de la Faille SSRF par l'Activation d'IMDSv2

Sur AWS, les attaques SSRF visent le service d'inspection de métadonnées **IMDSv1** à l'adresse `http://169.254.169.254/latest/meta-data/iam/security-credentials/`.

La contremesure consiste à imposer obligatoirement **IMDSv2**, qui exige la création préalable d'un jeton de session `PUT` avec un en-tête d'autorisation (`X-aws-ec2-metadata-token`) et un TTL de saut réseau restreint ($Hops = 1$), rendant la faille SSRF inexploitable !

```bash
# Forcer IMDSv2 et interdire IMDSv1 sur une instance AWS EC2 via AWS CLI
aws ec2 modify-instance-metadata-options \
    --instance-id i-0123456789abcdef0 \
    --http-tokens required \
    --http-put-response-hop-limit 1 \
    --http-endpoint enabled
```

### 2.2 Détection des Direct Syscalls via ETW-Ti (Event Tracing for Windows)

Pour contrer l'évasion d'EDR par des appels direct au noyau (SysWhispers3), les EDRs d'élite s'appuient sur le composant noyau **ETW-Ti** (*Event Tracing for Windows Threat Intelligence*). 

Même si le malware contourne les hooks de la DLL `ntdll.dll` en Ring 3, l'instruction assembleur `syscall` bascule obligatoirement le processeur en Ring 0. Le noyau émet un événement ETW-Ti irréfutable qui alerte le SIEM immédiatement.

```
                               DÉTECTION KERNEL ETW-TI
┌───────────────────────────┐      Direct Syscall      ┌───────────────────────────┐
│ Malware (SysWhispers3)    │ ────────────────────────►│ NOYAU WINDOWS (Ring 0)    │
│  User Space (Ring 3)      │                          └─────────────┬─────────────┘
└───────────────────────────┘                                        │
                                                             Émission Événement
                                                                 ETW-Ti
                                                                     │
                                                                     ▼
[ Notification SIEM EQL ]   ◄── [ Agent EDR Kernel Driver ] ◄────────┘
```

---

## 📖 3. Bilan des Compétences du Cycle Master 1 (J201 à J300)

Au terme de ce projet Capstone, vous avez validé 600 heures de formation pratique réparties sur les 5 grands axes de l'ingénierie cyber :

```
1. Offensive Cyber Operations (Red Team)  ──► ADCS, DCSync, EDR Evasion, Pwn ROP, Mobile RE.
2. Defensive Cyber Operations (Blue Team) ──► SIEM EQL, Threat Hunting C2, DFIR Volatility, SOAR.
3. Cloud & Container Security             ──► AWS/Azure Security, Kubernetes Cilium eBPF.
4. Cryptography & Privacy                 ──► NIST PQC 2024 (ML-KEM/ML-DSA), TenSEAL FHE, PKI Vault.
5. Governance, Risk & Compliance (GRC)    ──► ISO 27001:2022, NIS 2, DORA, Modèle FAIR.
```

---

## 🧪 4. Atelier Pratique : Script d'Évaluation Globale Master 1 (`m1_capstone_audit.py`)

### Script Python : Simulation & Évaluation de Fin de Cycle Master 1

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PARADIS IT — Masterclass Cybersécurité (Tome P6 - Jour 299)
Master 1 Capstone Project : Hybrid Attack Simulation & Complete Master 1 Graduation
"""

import json
import sys
import time

def evaluate_phase_1_web_cloud():
    """Phase 1 : SSRF IMDSv1 -> Vol IAM Credentials."""
    return {
        "phase": "1. Web & Cloud Initial Access",
        "attack_vector": "SSRF sur IMDSv1 (169.254.169.254)",
        "red_team_status": "EXPLOITED",
        "blue_team_mitigation": "IMDSv2 Enforced (Http-Tokens Required)",
        "status": "PASS"
    }

def evaluate_phase_2_cloud_ad_pivot():
    """Phase 2 : Extraction ntds.dit depuis S3."""
    return {
        "phase": "2. Cloud to On-Premises Pivot",
        "attack_vector": "S3 Bucket Data Exfiltration (ntds.dit)",
        "red_team_status": "EXPLOITED",
        "blue_team_mitigation": "Macie Sensitive Data Detection + AWS KMS SSE",
        "status": "PASS"
    }

def evaluate_phase_3_active_directory():
    """Phase 3 : ADCS ESC1 Domain Admin Takeover."""
    return {
        "phase": "3. Active Directory Exploitation",
        "attack_vector": "ADCS ESC1 Vulnerable Certificate Template",
        "red_team_status": "EXPLOITED",
        "blue_team_mitigation": "Certipy Audit & Removal of ManagerApproval Bypass",
        "status": "PASS"
    }

def evaluate_phase_4_edr_evasion():
    """Phase 4 : Direct Syscalls & Memory Patching."""
    return {
        "phase": "4. EDR Evasion & Kernel Execution",
        "attack_vector": "SysWhispers3 Direct Syscalls + AMSI Patching",
        "red_team_status": "EVADED_RING3",
        "blue_team_mitigation": "Kernel ETW-Ti Sensor Active (Ring 0 Telemetry)",
        "status": "PASS"
    }

def evaluate_phase_5_soar_containment():
    """Phase 5 : Response & Confinement SOAR."""
    return {
        "phase": "5. Blue Team SOAR Containment",
        "attack_vector": "Ransomware & C2 Exfiltration Attempt",
        "red_team_status": "BLOCKED",
        "blue_team_mitigation": "Shuffle SOAR Isolation Playbook (MTTR < 3 minutes)",
        "status": "PASS"
    }

def main():
    print("=================================================================")
    print("   PARADIS IT — GRAND CAPSTONE PROJECT MASTER 1 (JOUR 299)       ")
    print("=================================================================")
    time.sleep(1)

    p1 = evaluate_phase_1_web_cloud()
    p2 = evaluate_phase_2_cloud_ad_pivot()
    p3 = evaluate_phase_3_active_directory()
    p4 = evaluate_phase_4_edr_evasion()
    p5 = evaluate_phase_5_soar_containment()

    phases = [p1, p2, p3, p4, p5]
    total_phases = len(phases)
    passed_phases = sum(1 for p in phases if p["status"] == "PASS")
    completion_rate = (passed_phases / total_phases) * 100

    report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "candidate": "Candidate Master 1 Cybersecurity Specialist",
        "program": "PARADIS IT Masterclass — Cycle Master 1 (Bac+4)",
        "completion_rate": f"{completion_rate:.1f}%",
        "graduation_status": "ADMIS EN MASTER 2 (BAC+5)",
        "phases_evaluation": phases
    }

    print(json.dumps(report, indent=2))
    print("-----------------------------------------------------------------")
    print(f"SCORE GLOBAL DU CAPSTONE M1 : {completion_rate:.1f}% ({passed_phases}/{total_phases} Phases Validées)")
    print("DÉCISION DU JURY ACADÉMIQUE : ✅ DIPLÔME MASTER 1 CYBERSÉCURITÉ ACCORDÉ")
    print("=================================================================")

if __name__ == "__main__":
    main()
```

### Exécution du Script dans le Terminal

```bash
# Tester le script de validation du Capstone Master 1
python3 -c "
import json
results = [
    {'phase': '1. Web & Cloud Access', 'technique': 'SSRF IMDSv1', 'status': 'PASS'},
    {'phase': '2. Cloud to AD Pivot', 'technique': 'ntds.dit S3 Extraction', 'status': 'PASS'},
    {'phase': '3. Active Directory', 'technique': 'ADCS ESC1', 'status': 'PASS'},
    {'phase': '4. EDR Evasion', 'technique': 'Direct Syscalls ETW-Ti', 'status': 'PASS'},
    {'phase': '5. SOAR Containment', 'technique': 'Playbook Shuffle (MTTR < 3m)', 'status': 'PASS'}
]
print('=== MASTER 1 CYBER CAPSTONE PROJECT VALIDE (100%) ===')
print(json.dumps(results, indent=2))
"
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Comment se protéger contre la compromission d'une instance EC2 via SSRF ?
- **Réflexe** : Exigez l'activation d'IMDSv2 (`--http-tokens required`) sur l'ensemble de vos comptes AWS via des règles de conformité AWS Config ou Service Control Policies (SCP).

### 2. Comment un analyste SOC peut-il détecter les Direct Syscalls si l'EDR en User Space est aveuglé ?
- **Réflexe** : Activez les journaux de télémétrie du noyau **ETW-Ti** (Event Provider `Microsoft-Windows-Threat-Intelligence`) et ingérez les événements dans votre SIEM pour détecter toute exécution de `syscall` provenant d'une mémoire non adossée à un fichier DLL sur disque.

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Quel service AWS de métadonnées d'instance exige un jeton d'authentification `PUT` préalable avec un en-tête `X-aws-ec2-metadata-token` pour contrer les attaques SSRF ?**
- A) IMDSv1
- B) IMDSv2
- C) AWS S3
- D) AWS CloudTrail

*Réponse : B — IMDSv2 exige la création préalable d'un jeton de session via une requête PUT, neutralisant les attaques SSRF simples.*

**Q2 : Quel composant du noyau Windows permet aux EDRs avancés de capturer les appels système (Syscalls) même si l'attaquant a contourné les crochets `ntdll.dll` en User Space ?**
- A) ETW-Ti (Event Tracing for Windows Threat Intelligence)
- B) Le registre REGEDIT
- C) Le fichier HOSTS
- D) Le gestionnaire de tâches

*Réponse : A — ETW-Ti fournit une télémétrie de niveau noyau (Ring 0) irréfutable sur les appels système exécutés par les processus.*

**Q3 : Lors d'une attaque Active Directory par ADCS ESC1, quelle mauvaise configuration du modèle de certificat permet à l'attaquant d'obtenir les droits Domain Admin ?**
- A) La présence de mots de passe trop simples
- B) L'autorisation accordée aux utilisateurs d'inclure un nom alternatif de sujet (*SAN - Subject Alternative Name*) arbitraire dans la demande de certificat
- C) L'utilisation du protocole DNS
- D) L'absence de pare-feu Wi-Fi

*Réponse : B — La vulnérabilité ESC1 permet à un simple utilisateur de demander un certificat en précisant le SAN d'un compte Administrateur du domaine.*

**Q4 : Quelle est l'utilité du jeton Azure PRT (*Primary Refresh Token*) volé par un attaquant lors d'une attaque hybride ?**
- A) Redémarrer l'ordinateur local
- B) Maintenir une persistance d'authentification SSO sur l'ensemble des services Cloud Microsoft 365 et Entra ID du collaborateur
- C) Imprimer des documents
- D) Augmenter la mémoire RAM

*Réponse : B — Le jeton PRT permet de s'authentifier de manière transparente sur tous les services Azure/M365 associés à l'équipement.*

**Q5 : Quel indicateur de performance SOC mesure le temps moyen s'écoulant entre le début d'un incident et son confinement complet par la Blue Team ?**
- A) MTTD
- B) MTTR (Mean Time To Respond)
- C) CPU Usage
- D) Ping Latency

*Réponse : B — Le MTTR (Mean Time To Respond) mesure le temps nécessaire pour contenir et éradiquer l'incident.*

**Q6 : Quelle technique de persistance sous Windows utilise le système WMI pour exécuter automatiquement un script malveillant sans créer de fichier exécutable sur le disque ?**
- A) WMI Event Subscriptions (*Filter & Consumer*)
- B) Raccourci de bureau
- C) Fichier .bat dans le dossier Démarrage
- D) Modification de la résolution d'écran

*Réponse : A — Les souscriptions d'événements WMI permettent une persistance furtive sans binaire sur disque (*Fileless Persistence*).*

**Q7 : Dans le cadre d'un test Red Team d'infrastructure hybride, que contient le fichier `ntds.dit` exfiltré de l'Active Directory ?**
- A) Les images de fond d'écran des utilisateurs
- B) La base de données complète de l'Active Directory contenant tous les comptes et les hashes de mots de passe NTLM du domaine
- C) Le code source du site web
- D) Les pilotes de la carte réseau

*Réponse : B — `ntds.dit` est le fichier de base de données centralisé d'Active Directory contenant l'intégralité des identifiants du domaine.*

**Q8 : Quelle décision académique sanctionne la réussite intégrale du projet Capstone du Jour 299 ?**
- A) L'exclusion du cursus
- B) L'admission officielle en Cycle Master 2 Cybersécurité & Architecture (Bac+5)
- C) Le retour au Semestre 0
- D) La réinitialisation des serveurs

*Réponse : B — La validation du Capstone M1 confirme la maîtrise des 600 heures de formation et débloque le passage en Master 2.*

---

## 🏆 RAPPORT GLOBAL DE FIN DE CYCLE MASTER 1 (BAC+4 CYBERSÉCURITÉ)

```
================================================================================
                    PARADIS IT MASTERCLASS CERTIFICATION
================================================================================

Le présent document atteste que le candidat a validé avec succès l'ensemble
des exigences théoriques, pratiques et d'architecture du :

            CYCLE MASTER 1 CYBERSÉCURITÉ & RED TEAM (JOURS 201 À 300)

SCORE DU CAPSTONE HYBRIDE : 100 / 100 (5/5 PHASES VALIDÉES)
MENTION : EXCELLENCE OPÉRATIONNELLE & INGENIERIE DE SÉCURITÉ

DÉCISION DU JURY ACADÉMIQUE : ADMIS EN CYCLE MASTER 2 (BAC+5)
Délivré le : 15 Août 2026 — Direction Académique PARADIS IT Security Academy
================================================================================
```

---

## 📚 Ressources & Références

- **AWS EC2 IMDSv2 Documentation** : https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html
- **Microsoft ETW-Ti Security Telemetry** : https://learn.microsoft.com/en-us/windows/win32/etw/about-event-tracing
- **Certipy (ADCS Assessment Tool)** : https://github.com/ly4k/Certipy
- **SysWhispers3 (Direct Syscalls Generator)** : https://github.com/klezVirus/SysWhispers3

---

*Semestre 6 — Cybersécurité Expert & Red Team Avancé PARADIS IT Masterclass*
