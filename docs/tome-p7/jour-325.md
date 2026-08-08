# TOME P7 — Certifications d'Élite & Spécialisations — Jour 325 (6h) : Projet Intégrateur S7 Partie 5 — GREM + GCTI Full Report (Analyse Complète d'Incidents de Malwares & Rapport Threat Intel APT)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre une **investigation forensique et Threat Intel complète** simulant une évaluation pratique combinée **GREM (Reverse Engineering)** et **GCTI (Threat Intelligence)** : procéder à la déobfuscation d'une charge utile malveillante, reconstruire le graphe d'attaque d'une campagne APT (ex. APT28/LockBit 3.0), modéliser l'incident via le Diamond Model et la matrice MITRE ATT&CK, extraire les règles YARA/SIGMA et produire un rapport exécutif pour le CISO.
>
> **Ce projet valide l'aptitude opérationnelle à disséquer des malwares complexes et à produire des rapports de Threat Intelligence de niveau gouvernemental/entreprise.**

---

## 1) Module — Dossier de Reverse Engineering & Extraction d'Artefacts (`grem_gcti_investigation.py`) (2h30)

### 🛠️ Script d'Analyse et de Structuration des Artefacts Malveillants

```python
import json
from datetime import datetime

# ─────────────────────────────────────────────────────────────────────────
# Rapport Technique d'Analyse de Malware (GREM Level)
# Sample: Trojan-Ransom.Win32.LockBit.g (Analysé en sandbox & IDA Pro)
# ─────────────────────────────────────────────────────────────────────────

malware_analysis_data = {
    "sample_metadata": {
        "filename": "invoice_update_2026.exe",
        "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "file_type": "PE32+ executable (GUI) x86-64",
        "entropy": 7.84,  # Elevée -> Packé avec UPX modifié / payload chiffré
        "packer": "Custom UPX variant + XOR Obfuscation",
        "compilation_timestamp": "2026-08-01 03:14:22 UTC"
    },

    "anti_analysis_mechanisms": [
        "CheckRemoteDebuggerPresent via PEB check",
        "RDTSC timing checks (écart > 0xFFFE cycles entraine exit)",
        "Sleep obfuscation via WaitForSingleObject avec déchiffrement à la volée",
        "Masquage de processeur : vérification `GetSystemInfo` (vCPU > 2 exigé)"
    ],

    "behavioral_summary": {
        "process_injection": "Process Hollowing dans `svchost.exe`",
        "persistence_mechanism": "WMI Event Subscription (`__EventFilter` + `CommandLineEventConsumer`)",
        "privilege_escalation": "Bypass UAC via `fodhelper.exe` registry hijack (`HKCU\\Software\\Classes\\ms-settings\\shell\\open\\command`)",
        "shadow_copies_handling": "Execution de `vssadmin delete shadows /all /quiet` via Process Hollowing",
        "network_c2": "Beaconing HTTPS chiffré TLS 1.3 vers `185.220.101.47:443` (Header Host: `c2-gateway-finance.net`)"
    },

    "yara_signature": """
rule Apt_Ransomware_LockBit_Variant {
    meta:
        description = "Détection des artéfacts identifiés lors de l'investigation J325 (GREM/GCTI)"
        author = "PARADIS IT CTI Team"
        date = "2026-08-08"
        hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    strings:
        $s1 = "c2-gateway-finance.net" ascii
        $s2 = "fodhelper.exe" ascii
        $s3 = "__EventFilter" wide
        $s4 = { 48 8B 04 25 60 00 00 00 0F B6 40 02 } // Assembly PEB BeingDebugged check x64
    condition:
        uint16(0) == 0x5A4D and (2 of ($s*) or $s4)
}
""",

    "sigma_rule": """
title: Detection of UAC Bypass via Fodhelper Registry Hijack
id: a7f2139b-0012-4a55-89b1-paradis325
status: experimental
description: Detects registry modification in ms-settings used by malware for UAC Bypass
logsource:
    category: registry_set
    product: windows
detection:
    selection:
        TargetObject|contains: 'Software\\Classes\\ms-settings\\shell\\open\\command'
    condition: selection
falsepositives:
    - Administrative scripts tweaking Windows settings
level: high
"""
}

def generate_grem_report():
    print(f"=== RAPPORT D'ANALYSE GREM/GCTI — SAMPLE {malware_analysis_data['sample_metadata']['sha256'][:16]}... ===")
    print(f"Format: {malware_analysis_data['sample_metadata']['file_type']}")
    print(f"Entropie: {malware_analysis_data['sample_metadata']['entropy']} (Attention: Packé)")
    print("\n--- MÉCANISMES ANTI-ANALYSE DÉCOUVERTS ---")
    for mech in malware_analysis_data['anti_analysis_mechanisms']:
        print(f"  [!] {mech}")
    print("\n--- SYNTHÈSE DU COMPORTEMENT ---")
    for k, v in malware_analysis_data['behavioral_summary'].items():
        print(f"  * {k.upper()}: {v}")

generate_grem_report()
```

---

## 2) Module — Rapport CTI Executif & Matrice ATT&CK (1h30)

```markdown
# RAPPORT EXÉCUTIF THREAT INTELLIGENCE — INCIDENT APT-FIN2026

**Date :** 08 Août 2026  
**Auteur :** Cellule Cyber Threat Intelligence & Forensics (PARADIS IT)  
**Destinataires :** CISO, Risk Committee, SOC Lead  

---

### Executive Summary

Une campagne d'attaque sophistiquée ciblant les infrastructures financières a été interceptée. L'investigation inverse (GREM) et l'analyse de renseignement (GCTI) permettent d'attribuer cette activité avec une confiance **ÉLEVÉE** à un groupe d'affiliés sponsorisé par un État, utilisant des techniques d'extorsion double (Ransomware + Data Exfiltration).

Le binaire `invoice_update_2026.exe` intègre des protections anti-débogage avancées et contourne l'UAC Windows pour établir une persistance via le framework WMI sans laisser de fichiers sur le disque (Fileless Execution via Process Hollowing).

---

### Modélisation Diamond Model

```
               [ ADVERSARY ]
         APT28 / Financial Sub-Group
                    / \
                   /   \
                  /     \
   [ INFRASTRUCTURE ]---[ CAPABILITY ]
185.220.101.47:443       Custom UPX + Process Hollowing
c2-gateway-finance.net   UAC Bypass Fodhelper
                  \     /
                   \   /
                    \ /
                [ VICTIM ]
            Secteur Bancaire /
           PARADIS BANK Assets
```

---

### Cartographie des TTPs MITRE ATT&CK

| Phase (Tactics) | Technique ID | Description |
|:---|:---|:---|
| **Initial Access** | `T1566.001` | Spearphishing Attachment avec fichier binaire camouflé |
| **Execution** | `T1059.003` | Windows Command Shell invoqué en sous-processus |
| **Persistence** | `T1546.003` | WMI Event Subscription (`__EventFilter`) |
| **Privilege Escalation** | `T1548.002` | Bypass User Account Control (`fodhelper.exe`) |
| **Defense Evasion** | `T1055.012` | Process Hollowing dans `svchost.exe` |
| **Defense Evasion** | `T1070.004` | Suppression des Volume Shadow Copies (`vssadmin`) |
| **Credential Access** | `T1003.001` | LSASS Memory Dumping |
| **Command and Control** | `T1071.001` | Traffic HTTPS chiffré vers IP VPS avec rotation DNS |

---

### Recommandations & Plan d'Action SOC/Defensive

1. **Déploiement immédiat des signatures YARA & SIGMA** dans le SIEM/EDR pour bloquer les tentatives de contournement UAC par `fodhelper.exe`.
2. **Blocage au niveau du Firewall/Proxy IP/Domaine** : Bloquer immédiatement l'IP `185.220.101.47` et le domaine `c2-gateway-finance.net`.
3. **Hardening WMI** : Verrouiller les capacités de création de `__EventFilter` aux seuls comptes Administrateurs du Domaine via des GPO / Attack Surface Reduction (ASR) rules.
```

---

## 3) Module — Validation & Checklist d'Évaluation GREM + GCTI (2h)

```markdown
## CHECKLIST D'ÉVALUATION INTÉGRÉE (GREM & GCTI)

### Reverse Engineering (GREM - 50 points)
- [x] Identification correcte du type de packer et de l'entropie (10 pts)
- [x] Contournement / Isolation des mécanismes Anti-Debugging & Anti-VM (15 pts)
- [x] Analyse précise des fonctionnalités du malware (Process Hollowing, VSS, UAC Bypass) (15 pts)
- [x] Rédaction d'une règle YARA fonctionnelle et optimisée (10 pts)

### Cyber Threat Intelligence (GCTI - 50 points)
- [x] Structuration de la menace selon le Diamond Model (10 pts)
- [x] Cartographie exacte sur la matrice MITRE ATT&CK (8 TTPs identifiées) (15 pts)
- [x] Rédaction d'une règle SIGMA pour la détection SIEM (10 pts)
- [x] Rédaction d'un rapport exécutif synthétique pour le CISO avec recommandations (15 pts)

**Score Global : 100/100 — Dossier Validé avec Mention EXCELLENCE**
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Process Hollowing** | Technique d'évasion où un processus légitime est créé à l'état suspendu pour y injecter du code malveillant à la place |
| **Fileless Execution** | Exécution d'un code malveillant directement en mémoire sans stocker le binaire final sur le disque |
| **ASR** | Attack Surface Reduction — Règles Microsoft Defender pour réduire les vecteurs d'attaque courants |
| **SIEM** | Security Information and Event Management — Plateforme de centralisation et corrélation des événements de sécurité |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
