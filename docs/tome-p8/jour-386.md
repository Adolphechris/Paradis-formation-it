# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 386 (6h) : Anti-Forensics & Evasion Detection (Log Wiping, Timestomping, Memory Obfuscation & EDR Bypass Analysis)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'analyse des techniques d'**Anti-Forensics** et d'évasion de détection : identifier l'effacement de journaux d'événements (Event ID 1102 / Log Clearing), détecter la manipulation d'horodatage NTFS (Timestomping bas niveau), analyser les techniques d'obfuscation mémoire et de contournement d'EDR (**AMSI Bypass, Direct Syscalls, Unhooking**), et construire des règles de détection robustes.
>
> **Compétences visées :** `DFIR-EVADE-01` (A) — Log Wiping & Anti-Forensics Detection | `DFIR-EVADE-02` (A) — EDR Unhooking Detection, Direct Syscalls & Memory Obfuscation Triage

---

## 1) Module — Techniques d'Anti-Forensics & Signatures de Contournement (2h)

### 📖 Narration/Intuition

Les attaquants expérimentés tentent de nettoyer leurs traces et de rendre les hôtes aveugles avant de procéder aux exfiltrations. L'action même d'effacer des preuves génère des signaux caractéristiques (**Meta-Events**) que le SOC doit intercepter immédiatement.

```
  [ ATTAQUANT EN COURS D'INTRUSION ]
                 │
                 ├── 1. Effacement des Logs Windows (wevtutil cl Security)
                 │    └──► GÉNÈRE EVENT ID 1102 ("The audit log was cleared") !
                 │
                 ├── 2. Altération des Dates MFT (Timestomping NTimestomp)
                 │    └──► CRÉE UNE INCONGRUENCE $STANDARD_INFO vs $FILE_NAME !
                 │
                 ├── 3. Patching en Mémoire de ntdll.dll (EDR Unhooking)
                 │    └──► RESTAURE LES SYSCALLS BRUTS SANS CROCHET EDR !
                 ▼
     [ DÉTECTION METADATA SOC : L'ANTI-FORENSICS EST UN SIGNAL D'INCIDENT CRITIQUE ]
```

#### Repertoire des Événements d'Anti-Forensics

| Événement Anti-Forensics | Event ID / Log | Indicateur de Détection | Niveau de Menace |
|:---:|:---|:---|:---:|
| **Audit Log Cleared** | Event ID 1102 / 104 | `wevtutil` ou `Clear-EventLog` exécuté par un utilisateur non-Système | **CRITIQUE** |
| **Sysmon Driver Unload** | Event ID 255 / 4 | Arrêt du service `Sysmon` ou suppression de son filtre miniport | **CRITIQUE** |
| **USN Journal Deletion** | Event ID 1102 / FS | `fsutil usn deletejournal` pour détruire l'historique NTFS | **ÉLEVÉ** |
| **EDR Unhooking** | RAM Memory Scan | Octets `ntdll.dll` modifiés (remplacement des instructions `jmp` EDR) | **CRITIQUE** |

---

## 2) Module — Outillage Anti-Forensics Detection Engine (`antiforensics_detector.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict

class AntiForensicsDetector:
    """
    Moteur de détection spécialisé dans l'interception des attaques Anti-Forensics
    et des tentatives de contournement EDR / Effacement de journaux.
    """

    def __init__(self, hostname: str):
        self.hostname = hostname
        self.alerts: List[dict] = []

    def analyze_event_log(self, event_id: int, provider_name: str, user: str, event_data: dict) -> dict:
        """Analyse les événements système à la recherche de signatures d'effacement de logs."""

        # Event ID 1102: Journal de Sécurité Windows Effacé
        if event_id == 1102 or (event_id == 104 and provider_name == "Microsoft-Windows-Eventlog"):
            return self._raise_alert(
                rule_id="ANTI-FOR-001",
                name="Security Audit Log Cleared",
                severity="CRITICAL",
                mitre_id="T1070.001",
                details=f"Le journal d'événements de sécurité a été effacé par l'utilisateur {user} !"
            )

        # Event ID 4688 / Sysmon 1: Utilisation de fsutil pour supprimer le USN Journal
        if event_id in [1, 4688]:
            cmdline = event_data.get("command_line", "").lower()
            if "fsutil" in cmdline and "usn" in cmdline and "deletejournal" in cmdline:
                return self._raise_alert(
                    rule_id="ANTI-FOR-002",
                    name="NTFS USN Journal Deletion Attempt",
                    severity="HIGH",
                    mitre_id="T1070.004",
                    details=f"Tentative de suppression du USN Journal NTFS via fsutil par {user}."
                )

        return {"status": "CLEAN"}

    def inspect_edr_unhooking(self, process_name: str, pid: int, ntdll_memory_bytes: bytes) -> dict:
        """
        Détecte l'EDR Unhooking en vérifiant si les stubs Syscall de ntdll.dll
        ont été restaurés avec les octets d'origine (opcodes assembly 'mov r10, rcx; mov eax, syscall_id').
        Si le hook 'jmp edr_driver.dll' a été écrasé, le malware a désactivé l'EDR !
        """
        # Signature d'un syscall Windows 64-bit non crocheté : \x4c\x8b\xd1\xb8
        has_original_syscall_stub = ntdll_memory_bytes.startswith(b"\x4c\x8b\xd1\xb8")
        has_edr_jmp_hook = ntdll_memory_bytes.startswith(b"\xe9") # Opcode JMP

        if has_original_syscall_stub and not has_edr_jmp_hook:
            return self._raise_alert(
                rule_id="ANTI-FOR-003",
                name="EDR Ntdll Unhooking Detected",
                severity="CRITICAL",
                mitre_id="T1562.001",
                details=f"Le processus {process_name} (PID {pid}) a restauré ntdll.dll en mémoire pour contourner l'EDR !"
            )

        return {"status": "HOOK_INTACT_OR_NORMAL"}

    def _raise_alert(self, rule_id: str, name: str, severity: str, mitre_id: str, details: str) -> dict:
        alert = {
            "alert_id": f"ALT-EVADE-{len(self.alerts)+1:03d}",
            "hostname": self.hostname,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "rule_id": rule_id,
            "rule_name": name,
            "severity": severity,
            "mitre_technique": mitre_id,
            "details": details
        }
        self.alerts.append(alert)
        print(f"[!] ALERTE ANTI-FORENSICS [{severity}] {name} ({mitre_id}) -> {details}")
        return alert

# Démonstration du Moteur Anti-Forensics
detector = AntiForensicsDetector("SRV-FINANCE-01")

print("=== ANTI-FORENSICS & EVASION DETECTION ENGINE ===")

# Test 1 : Effacement du journal de sécurité (Event ID 1102)
detector.analyze_event_log(
    event_id=1102,
    provider_name="Microsoft-Windows-Eventlog",
    user="paradis\\attacker_user",
    event_data={}
)

# Test 2 : Suppression du USN Journal via fsutil
detector.analyze_event_log(
    event_id=4688,
    provider_name="Microsoft-Windows-Security-Auditing",
    user="paradis\\attacker_user",
    event_data={"command_line": "fsutil usn deletejournal /d C:"}
)

# Test 3 : Détection d'EDR Unhooking sur un binaire malveillant
detector.inspect_edr_unhooking(
    process_name="malware_loader.exe",
    pid=2480,
    ntdll_memory_bytes=b"\x4c\x8b\xd1\xb8\x18\x00\x00\x00" # Syscall restauré (Hook supprimé !)
)

print("\n=== SUMMARY OF ANTI-FORENSICS ALERTS ===")
print(json.dumps(detector.alerts, indent=2, ensure_ascii=False))
```

---

## 3) Module — Fiche Technique Direct Syscalls & EDR Unhooking (2h)

```markdown
# MECANISME D'EDR UNHOOKING & DIRECT SYSCALLS

## 1. Comment fonctionne l'EDR Hooking ?
Lors du démarrage d'un processus, l'agent EDR injecte sa propre DLL (ex: `edr_agent.dll`) et modifie les premiers octets des fonctions critiques de `ntdll.dll` (ex: `NtOpenProcess`, `NtAllocateVirtualMemory`) par une instruction de saut `JMP edr_agent.dll`.

## 2. Technique d'Évasion : EDR Unhooking
Le malware lit une copie propre de `ntdll.dll` directement depuis le disque (`C:\Windows\System32\ntdll.dll`) ou depuis une section mémoire propre, et écrase la section `.text` de sa propre mémoire pour supprimer les crochets `JMP` insérés par l'EDR.

## 3. Détection par la Blue Team
- **Kernel-level Telemetry (eBPF / ETW Threat Intelligence) :** Utiliser ETW (Event Tracing for Windows - Provider `Microsoft-Windows-Threat-Intelligence`) qui opère en mode noyau et ne peut pas être unhooké par un processus usermode !
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Anti-Forensics** | Ensemble des méthodes visant à manipuler, détruire ou obfusquer les preuves numériques |
| **EDR Unhooking** | Technique d'évasion écrasant les hooks d'un agent EDR en mémoire usermode |
| **ETW Threat Intelligence** | Fournisseur d'événements noyau sous Windows insensible aux contournements usermode |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quel **Event ID** de sécurité Windows est généré de manière inaltérable lorsqu'un utilisateur ou un script efface le journal d'audit de sécurité ?
- A) Event ID 1102 ("The audit log was cleared")
- B) Event ID 4624 (Logon réussi)
- C) Event ID 7045 (Nouveau service)
- D) Event ID 4688 (Nouveau processus)

**Réponse : A**

**Q2 :** Pourquoi la technique d'**EDR Unhooking** en usermode échoue-t-elle à masquer les actions de l'attaquant face à un EDR moderne s'appuyant sur **ETW Threat Intelligence** ?
- A) Parce qu'ETW TI s'exécute directement dans le noyau Windows (Kernelmode), hors d'atteinte de la mémoire usermode du processus malveillant
- B) Parce que le disque dur est chiffré
- C) Parce que la mémoire RAM est supprimée
- D) Parce qu'ETW ne fonctionne qu'en mode texte

**Réponse : A**

**Q3 :** Quelle commande de l'utilitaire Windows `fsutil` est exploitée par les malwares pour effacer les traces de modification de fichiers sur un volume NTFS ?
- A) `fsutil usn deletejournal`
- B) `fsutil volume diskfree`
- C) `fsutil behavior query`
- D) `fsutil file createnew`

**Réponse : A**

**Q4 :** Qu'est-ce que l'attaque par **Direct Syscalls** (ex: SysWhispers) ?
- A) Une technique où l'attaquant inclut directement les instructions d'appel système (Syscall ID + instruction `syscall`) dans son propre binaire sans jamais passer par `ntdll.dll`, contournant ainsi tous les hooks EDR usermode
- B) Un appel téléphonique au support technique
- C) Une commande PowerShell à distance
- D) Un en-tête HTTP spécifique

**Réponse : A**

**Q5 :** Quel comportement d'un processus usermode doit immédiatement déclencher une alerte de niveau **CRITIQUE** dans un SOC ?
- A) La modification ou réécriture des premiers octets exécutables de `ntdll.dll` en mémoire pour restaurer les stubs originaux
- B) La lecture d'un fichier texte dans Mes Documents
- C) Le chargement de la DLL `user32.dll`
- D) L'ouverture d'une fenêtre de navigateur

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*