# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 223 (6h) : Purple Team & Adversary Simulation (MITRE ATT&CK, Atomic Red Team, Breach & Attack Simulation BAS & Mesure du Niveau de Détection SOC)

> [!NOTE]
> **Objectif du jour :** Maîtriser la méthodologie **Purple Team** : une approche collaborative entre les équipes Red Team (offensif) et Blue Team (défensif) utilisant le framework **MITRE ATT&CK** pour simuler des tactiques, techniques et procédures d'attaquants réels (**TTP**), tester la capacité de détection du **SOC** avec **Atomic Red Team**, et mesurer les lacunes de couverture de détection via des outils de **Breach & Attack Simulation (BAS)** comme **Caldera** ou **AttackIQ**.
>
> **Compétences visées :** `SEC-04` (A) — Purple Team & Adversary Simulation MITRE ATT&CK | `SEC-05` (A) — Atomic Red Team SOC Detection Coverage & BAS

---

## 1) Module — Framework MITRE ATT&CK & Méthodologie Purple Team (2h)

### 📖 Narration/Intuition

La BCC a déployé un SOC (Security Operations Center) avec une solution SIEM (ELK Stack) et des règles de détection Sigma. Mais comment savoir si ces règles **fonctionnent vraiment** ? Comment savoir si le SOC aurait détecté l'intrusion du Jour 221 avant l'exfiltration des MNBC ?

C'est exactement la question à laquelle répond la méthodologie **Purple Team** : au lieu d'opposer Red Team et Blue Team, on les fait **collaborer** pour tester et améliorer les capacités de détection en simulant de vraies TTPs (Tactics, Techniques & Procedures) d'attaquants APT référencés dans le framework **MITRE ATT&CK**.

### 🔍 Anatomie Technique

**Les 14 Tactiques MITRE ATT&CK Enterprise (Matrix) :**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      MITRE ATT&CK MATRIX — ENTERPRISE                        │
├──────────┬──────────┬───────────┬─────────┬─────────┬─────────┬─────────────┤
│Reconnais.│Resrc Dev │Initial    │Execution│Persista.│Privilège│Défense       │
│          │          │Access     │         │         │Escalat. │Evasion       │
├──────────┼──────────┼───────────┼─────────┼─────────┼─────────┼─────────────┤
│Credential│Discovery │Lateral    │Collectio.│Command &│Exfiltr. │Impact        │
│Access    │          │Movement   │         │Control  │         │              │
└──────────┴──────────┴───────────┴─────────┴─────────┴─────────┴─────────────┘

Exemple de TTP mappé sur l'attaque BCC (J221) :
TA0001 (Initial Access) → T1078 (Valid Accounts — compte "mnbc-worker" compromis)
TA0004 (Privilege Escalation) → T1068 (Exploitation CVE-2023-27997)
TA0003 (Persistence) → T1547.001 (Registry Run Keys)
TA0006 (Credential Access) → T1003.001 (LSASS Memory — Mimikatz/Process Injection)
TA0010 (Exfiltration) → T1041 (Exfiltration Over C2 Channel)
```

---

## 2) Module — Simulation d'Attaques avec Atomic Red Team (2h)

### 📖 Narration/Intuition

**Atomic Red Team** (développé par Red Canary) est une bibliothèque open-source de **tests atomiques** : de petits scripts reproductibles testant une technique MITRE ATT&CK spécifique de façon isolée et contrôlée, directement sur le système à auditer, pour vérifier si le SOC/SIEM la détecte.

### 🛠️ Atelier Pratique

**Déploiement & Tests Atomiques Red Team (`atomic_tests_bcc.ps1`) :**

```powershell
# Installation d'Atomic Red Team sur le poste de test BCC (Windows PowerShell)
Install-Module -Name invoke-atomicredteam -Scope CurrentUser -Force
Import-Module invoke-atomicredteam

# 1. TESTER T1003.001 — LSASS Memory Dump (Credential Access)
# Cette technique simule un dump des credentials depuis lsass.exe
Invoke-AtomicTest T1003.001 -TestNumbers 1 -GetPrereqs
Invoke-AtomicTest T1003.001 -TestNumbers 1

# → Le SOC/SIEM devrait alerter sur :
#   * Accès à lsass.exe par un processus non-système (OpenProcess)
#   * Écriture du fichier lsass.dmp dans C:\Windows\Temp\

# 2. TESTER T1547.001 — Registry Run Keys (Persistence)
Invoke-AtomicTest T1547.001 -TestNumbers 1

# → Le SOC/SIEM devrait alerter sur :
#   * Modification HKCU\Software\Microsoft\Windows\CurrentVersion\Run

# 3. TESTER T1071.001 — Application Layer Protocol HTTP (C2)
Invoke-AtomicTest T1071.001 -TestNumbers 1

# 4. Cleanup après les tests (Suppression des artefacts créés)
Invoke-AtomicTest T1003.001 -TestNumbers 1 -Cleanup
Invoke-AtomicTest T1547.001 -TestNumbers 1 -Cleanup
```

---

## 3) Module — Breach & Attack Simulation (BAS) avec MITRE Caldera (2h)

### 📖 Narration/Intuition

Si **Atomic Red Team** teste une technique à la fois, **MITRE Caldera** permet d'orchestrer des **campagnes d'attaques multi-étapes automatisées** (APT Simulation) sur des agents déployés dans l'infrastructure cible, simulant le comportement complet d'un groupe APT référencé.

### 🛠️ Atelier Pratique

**Orchestration d'une Campagne APT avec Caldera (`caldera_ops.sh`) :**

```bash
# 1. Démarrer le serveur Caldera
cd /opt/caldera && python3 server.py --insecure &

# 2. Déployer un agent Caldera sur le poste cible BCC (Windows)
# (À exécuter sur le poste Windows de test, pas en production !)
# L'agent se connecte au C2 Caldera et attend les instructions

# 3. Via l'interface web Caldera (localhost:8888)
# Créer une opération "APT-BCC-Simulation" avec le profil adversaire "Sandworm"
# Les abilities (actions atomiques) sont automatiquement sélectionnées et exécutées

# 4. Tableau de Couverture de Détection SOC (Généré après la campagne)
cat << 'EOF'
┌───────────────────────────────┬──────────┬────────────────────────────────┐
│ Technique MITRE ATT&CK        │ Détecté? │ Règle SIEM Déclenchée?         │
├───────────────────────────────┼──────────┼────────────────────────────────┤
│ T1078 — Valid Accounts        │ ✅ OUI   │ Sigma: Connexion heure suspecte │
│ T1068 — Exploitation (PrivEsc)│ ❌ NON   │ Aucune règle → GAP CRITIQUE    │
│ T1547.001 — Registry Run Key  │ ✅ OUI   │ Sysmon EventID 13 (Reg.Write)  │
│ T1003.001 — LSASS Dump        │ ⚠️ PART. │ Alerte 15 min après l'incident │
│ T1041 — Exfil via C2          │ ❌ NON   │ Aucune règle → GAP CRITIQUE    │
└───────────────────────────────┴──────────┴────────────────────────────────┘
EOF

echo "RÉSULTAT : Couverture de détection SOC = 2/5 = 40% — INSUFFISANT (Objectif: >80%)"
echo "ACTIONS CORRECTIVES : Créer règles Sigma pour T1068 & T1041 en priorité P0"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MITRE ATT&CK** | Adversarial Tactics, Techniques & Common Knowledge — Framework de référence mondial des TTPs d'attaquants |
| **TTP** | Tactics, Techniques and Procedures — Tactiques, Techniques et Procédures d'un attaquant |
| **BAS** | Breach and Attack Simulation — Simulation automatisée d'attaques pour tester la détection |
| **APT** | Advanced Persistent Threat — Menace Persistante Avancée (groupe d'attaquants étatiques ou criminels organisés) |
| **Caldera** | Framework open-source MITRE de simulation d'adversaires pour les opérations Purple Team |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer la différence fondamentale entre un engagement **Red Team** classique et une session **Purple Team**, et dans quel contexte organisationnel chacun apporte le plus de valeur.

**Corrigé :** Un engagement **Red Team** classique est un exercice d'évaluation de la sécurité où une équipe d'attaquants professionnels (Red Team) tente de compromettre l'infrastructure de l'organisation **en secret** et **sans informer** les défenseurs (Blue Team/SOC), dans un délai imparti. L'objectif est de mesurer la capacité réelle de l'organisation à détecter et contenir une attaque réaliste. Les résultats sont révélés lors d'un "debrief" final. Une session **Purple Team**, en revanche, est un exercice **collaboratif et transparent** où Red Team et Blue Team travaillent **ensemble, en temps réel** : la Red Team exécute une technique d'attaque, et immédiatement la Blue Team observe si ses règles de détection SIEM/EDR l'ont capturée. Si la détection a échoué, les deux équipes collaborent **immédiatement** pour créer la règle manquante, puis testent de nouveau. La valeur du **Red Team** est maximale pour les organisations matures souhaitant un "test de réalité" complet. La valeur du **Purple Team** est maximale pour les organisations voulant **améliorer continument leur couverture de détection** et former les analystes SOC en temps réel.

**Exercice 2 :** Dans le tableau de couverture de détection obtenu lors de la simulation Caldera BCC, la technique **T1041 (Exfiltration Over C2 Channel)** n'a pas été détectée par le SIEM. Proposer une règle de détection **Sigma** permettant de capturer ce type d'exfiltration vers une IP C2 inconnue.

**Corrigé :**

```yaml
title: Exfiltration de données via connexion HTTP/HTTPS vers IP externe non catégorisée
id: bcc-sigma-T1041-exfil-c2
status: experimental
description: Détecte des connexions réseau sortantes inhabituelles vers des IP non classifiées
  pouvant indiquer une exfiltration de données via un canal C2 (T1041)
references:
  - https://attack.mitre.org/techniques/T1041/
author: PARADIS IT Blue Team
date: 2026/08/06
tags:
  - attack.exfiltration
  - attack.t1041
logsource:
  category: network_connection
  product: windows
detection:
  selection:
    Initiated: 'true'
    Protocol: 'tcp'
    DestinationPort:
      - 4444
      - 8080
      - 1337
  filter_legit:
    DestinationIp|startswith:
      - '192.168.'
      - '10.'
      - '172.16.'
  condition: selection and not filter_legit
falsepositives:
  - Outils de développement légitimes utilisant des ports non standard
level: high
```

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est l'objectif principal de la méthodologie **Purple Team** par rapport aux approches classiques Red Team et Blue Team ?
- A) Faire collaborer Red Team et Blue Team en temps réel pour améliorer continûment la couverture de détection du SOC en testant des TTPs réelles et en comblant immédiatement les lacunes détectées
- B) Remplacer entièrement le Red Team par une automatisation complète des tests
- C) Former uniquement les développeurs à la sécurité des applications
- D) Gérer les accès privilégiés dans Active Directory

**Réponse : A**

**Q2 :** Quel framework de référence mondial, maintenu par la fondation **MITRE**, catalogue les Tactiques, Techniques et Procédures (TTPs) utilisées par les attaquants réels dans leurs campagnes, et est utilisé comme référentiel commun en Purple Team ?
- A) MITRE ATT&CK
- B) OWASP Top 10
- C) NIST SP 800-53
- D) ISO 27001

**Réponse : A**

**Q3 :** Quel outil open-source de **Breach & Attack Simulation (BAS)**, développé par la fondation MITRE, permet d'orchestrer des campagnes d'attaques multi-étapes automatisées pour simuler le comportement d'un groupe APT et mesurer la couverture de détection du SOC ?
- A) MITRE Caldera
- B) Nessus
- C) Burp Suite Professional
- D) Shodan

**Réponse : A**

**Q4 :** Dans le framework MITRE ATT&CK, quelle Tactique (TA) et Technique (T) correspondent à l'accès initial via un **compte valide compromis** (ex: le compte "mnbc-worker" de la BCC) ?
- A) TA0001 (Initial Access) → T1078 (Valid Accounts)
- B) TA0006 (Credential Access) → T1003.001 (LSASS Memory)
- C) TA0004 (Privilege Escalation) → T1068 (Exploitation)
- D) TA0010 (Exfiltration) → T1041

**Réponse : A**

**Q5 :** Qu'est-ce qu'un **test atomique** dans le contexte de la bibliothèque **Atomic Red Team** de Red Canary ?
- A) Un script reproductible testant une unique technique MITRE ATT&CK de façon isolée pour vérifier si le SOC/SIEM la détecte
- B) Un scan de vulnérabilités automatique de toute l'infrastructure
- C) Un test unitaire de code d'application
- D) Une simulation de phishing pour les utilisateurs finaux

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
