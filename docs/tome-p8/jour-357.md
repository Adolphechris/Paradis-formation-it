# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 357 (6h) : EDR/XDR Advanced & Endpoint Detection (CrowdStrike, SentinelOne, Microsoft Defender for Endpoint) — Behavioral Detection, Process Tree Analysis, Host Isolation & Post-Incident Recovery

> [!NOTE]
> **Objectif du jour :** Maîtriser l'exploitation avancée des agents **EDR / XDR (Endpoint Detection and Response / Extended Detection and Response)** en environnement d'entreprise : analyser les arbres de processus (**Process Tree Execution**), intercepter les comportements malveillants complexes (Process Injection, Parent PID Spoofing, Token Manipulation), orchestrer l'isolement d'hôte à chaud, et exécuter des procédures de **Post-Incident Remediation** sans impacter les opérations métiers.
>
> **Compétences visées :** `EDR-01` (A) — Process Tree Forensics & Behavioral Anomaly Detection | `EDR-02` (A) — Live Host Isolation, API Automation & Post-Incident Remediation

---

## 1) Module — Architecture EDR/XDR & Process Tree Forensics (2h)

### 📖 Narration/Intuition

Les antivirus traditionnels basés sur les signatures de fichiers sont inopérants contre les attaques sans fichier (**Fileless Attacks**) et l'abus d'outils légitimes Windows (**LOLBins / Living Off the Land**). L'EDR enregistre en continu l'ensemble de la télémétrie du système d'exploitation et reconstitue l'**Arbre des Processus (Process Tree)** pour détecter les anomalies de comportement.

```
 [ cmd.exe (Parent PID: 1042) ]
               │
               ▼ (Exécution anormale de PowerShell avec -EncodedCommand)
 [ powershell.exe (Child PID: 2150) ]
               │
               ▼ (Process Hollowing / Injection de code)
 [ svchost.exe (Injected PID: 4096) ]
               │
               ├── (Lecture mémoire LSASS) ──► ALERTE EDR : Credential Dumping (T1003.001)
               └── (Connexion Réseau C2) ────► ALERTE EDR : Beaconing HTTPS vers IP Inconnue
```

#### Indicateurs d'Anomalies de Processus (Process Tree Anomalies)

| Anomalie | Comportement Observé | Risque d'Attaque |
|:---:|:---|:---|
| **Parent PID Spoofing** | `cmd.exe` a pour parent `lsass.exe` au lieu de `explorer.exe` | Évasion de détection / PrivEsc |
| **Unusual Subprocess** | `excel.exe` ou `winword.exe` lance `cmd.exe` ou `powershell.exe` | Exploitation Macro / Document Malveillant |
| **Process Hollowing** | `svchost.exe` s'exécute depuis un répertoire non système (ex: `C:\Users\Public\`) | Injection de code malveillant |
| **Masquerading** | Fichier exécutable nommé `svchost.exe` mais non signé par Microsoft | Malware camouflé |

---

## 2) Module — Outillage EDR Telemetry & Process Tree Engine (`edr_telemetry_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import Dict, List, Optional

class EDRTelemetryEngine:
    """
    Moteur de traitement de télémétrie EDR d'entreprise.
    Reconstitue l'arbre de processus et détecte les anomalies de comportement.
    """

    def __init__(self, agent_id: str, hostname: str):
        self.agent_id = agent_id
        self.hostname = hostname
        self.process_table: Dict[int, dict] = {}
        self.detected_alerts: List[dict] = []

    def log_process_start(self, pid: int, ppid: int, process_name: str, path: str, cmdline: str, username: str) -> dict:
        """Enregistre le démarrage d'un nouveau processus (Event Type: ProcessCreation)."""
        proc = {
            "pid": pid,
            "ppid": ppid,
            "name": process_name,
            "path": path,
            "cmdline": cmdline,
            "username": username,
            "start_time": datetime.now(timezone.utc).isoformat(),
            "children": []
        }
        self.process_table[pid] = proc

        # Mise à jour du lien parent-enfant
        if ppid in self.process_table:
            self.process_table[ppid]["children"].append(pid)

        # Analyse comportementale immédiate
        self._analyze_behavioral_rules(proc)
        return proc

    def _analyze_behavioral_rules(self, proc: dict):
        """Moteur de détection comportemental EDR."""
        pid = proc["pid"]
        ppid = proc["ppid"]
        name = proc["name"].lower()
        cmdline = proc["cmdline"].lower()
        path = proc["path"].lower()
        parent = self.process_table.get(ppid, {})
        parent_name = parent.get("name", "").lower()

        # Règle 1 : Document Office lançant un Shell Command (Spawning Suspect)
        if parent_name in ["winword.exe", "excel.exe", "powerpnt.exe"] and name in ["cmd.exe", "powershell.exe", "wscript.exe"]:
            self._raise_edr_alert(
                rule_id="EDR-RULE-001",
                severity="CRITICAL",
                technique="T1059.003 - Command and Scripting Interpreter",
                description=f"Le document Office {parent_name} a généré un shell de commande {name}.",
                impacted_pid=pid
            )

        # Règle 2 : Process Hollowing / Chemins Anormaux pour processus système
        if name == "svchost.exe" and "c:\\windows\\system32\\" not in path:
            self._raise_edr_alert(
                rule_id="EDR-RULE-002",
                severity="CRITICAL",
                technique="T1055.012 - Process Hollowing / Masquerading",
                description=f"Le processus système svchost.exe s'exécute depuis un dossier anormal: {path}",
                impacted_pid=pid
            )

        # Règle 3 : Execution PowerShell Encodée
        if name == "powershell.exe" and ("-encodedcommand" in cmdline or "-enc" in cmdline):
            self._raise_edr_alert(
                rule_id="EDR-RULE-003",
                severity="HIGH",
                technique="T1059.001 - PowerShell Obfuscation",
                description=f"Exécution PowerShell obfusquée détectée: {cmdline[:60]}...",
                impacted_pid=pid
            )

    def _raise_edr_alert(self, rule_id: str, severity: str, technique: str, description: str, impacted_pid: int):
        alert = {
            "alert_id": f"EDR-ALT-{len(self.detected_alerts) + 1:04d}",
            "hostname": self.hostname,
            "agent_id": self.agent_id,
            "rule_id": rule_id,
            "severity": severity,
            "mitre_technique": technique,
            "description": description,
            "impacted_pid": impacted_pid,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.detected_alerts.append(alert)
        print(f"[!] ALERTE EDR [{severity}] {rule_id} -> {description}")

# Démonstration du Moteur EDR
edr = EDRTelemetryEngine("AGENT-SEC-9901", "WKSTN-DIRECTOR-01")

# Simulation de l'ouverture d'un document Word légitime
edr.log_process_start(1042, 800, "winword.exe", "C:\\Program Files\\Microsoft Office\\winword.exe", "winword.exe C:\\Users\\user\\Document.docx", "dir_user")

# Simulation de l'exécution d'une macro malveillante qui lance PowerShell encodé
edr.log_process_start(2150, 1042, "powershell.exe", "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe", "powershell.exe -Enc SQBFAFgA...", "dir_user")

# Simulation d'un binaire malveillant hébergé dans Users\Public
edr.log_process_start(4096, 2150, "svchost.exe", "C:\\Users\\Public\\Downloads\\svchost.exe", "svchost.exe", "dir_user")

print("\n=== EDR DETECTED ALERTS SUMMARY ===")
print(json.dumps(edr.detected_alerts, indent=2, ensure_ascii=False))
```

---

## 3) Module — Fiche de Confinement et Remédiation EDR (2h)

```markdown
# PROCEDURE OPÉRATIONNELLE EDR — CONFINEMENT & POST-INCIDENT RECOVERY

## 1. Isolement Réseau (Network Containment)
L'isolement EDR applique une politique de filtrage au niveau du driver réseau de l'agent :
- **Trafic Bloqué :** Tout le trafic IP entrant et sortant.
- **Trafic Autorisé (Exception) :** Uniquement les communications chiffrées entre l'agent EDR et la console Cloud EDR (CrowdStrike / SentinelOne).

## 2. Remédiation Post-Incident (Post-Incident Remediation)
Plutôt que d'effectuer une réinstallation complète du système hôte, l'EDR permet une remédiation ciblée :
1. **Kill Process Tree :** Arrêt simultané du processus malveillant et de tous ses processus enfants.
2. **File Quarantine / Deletion :** Suppression sécurisée du binaire malveillant et mise en quarantaine chiffrée.
3. **Registry Remediation :** Suppression des clés de registre de persistance (`HKCU\...\Run`).
4. **Restoration des Fichiers :** Restauration des fichiers modifiés depuis la sauvegarde shadow copy ou le cloud.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **EDR** | Endpoint Detection and Response — Agent de surveillance et de réponse comportementale sur les hôtes |
| **XDR** | Extended Detection and Response — Évolution de l'EDR intégrant la télémétrie réseau, cloud et identité |
| **LOLBins** | Living Off the Land Binaries — Binaires légitimes du système d'exploitation détournés par les attaquants |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle est la différence majeure entre un Antivirus traditionnel et un agent **EDR (Endpoint Detection and Response)** ?
- A) L'antivirus s'appuie principalement sur des signatures de fichiers connues, tandis que l'EDR enregistre la télémétrie complète et analyse l'arbre de comportement des processus en temps réel
- B) L'antivirus ne fonctionne que sur Linux
- C) L'EDR est uniquement matériel
- D) Il n'y a aucune différence

**Réponse : A**

**Q2 :** Que signifie le terme **LOLBins (Living Off the Land Binaries)** dans une analyse d'attaque EDR ?
- A) L'utilisation par un attaquant d'utilitaires légitimes intégrés au système (ex: `powershell.exe`, `certutil.exe`, `wmic.exe`) pour exécuter des actions malveillantes sans déposer de fichiers exécutables tiers
- B) Des fichiers supprimés dans la corbeille
- C) Un type de câble réseau
- D) Un jeu vidéo pour analystes

**Réponse : A**

**Q3 :** Lors d'un isolement réseau d'un hôte par un EDR, quel flux réseau reste obligatoirement ouvert ?
- A) Le canal de communication chiffré sécurisé entre l'agent EDR local et la console de management Cloud EDR
- B) Le trafic Web HTTP général
- C) Les flux de streaming vidéo
- D) Les connexions SSH de tous les utilisateurs

**Réponse : A**

**Q4 :** Quel comportement de processus doit être immédiatement classé comme **CRITIQUE** par un moteur EDR ?
- A) Un processus de la suite Microsoft Office (ex: `winword.exe`) qui lance un interpréteur de commandes (`cmd.exe` ou `powershell.exe`)
- B) L'ouverture du Bloc-notes par un utilisateur
- C) La mise à jour automatique de Windows
- D) L'affichage d'une image JPEG

**Réponse : A**

**Q5 :** Qu'est-ce que le **Parent PID Spoofing** ?
- A) Une technique d'évasion où un attaquant modifie les métadonnées de son processus malveillant pour déclarer un processus parent légitime (ex. `explorer.exe`) et tromper l'analyse naïve de la Blue Team
- B) Un changement d'adresse IP
- C) Une panne d'imprimante
- D) Une suppression de compte utilisateur

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
