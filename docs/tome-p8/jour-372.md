# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 372 (6h) : Malware Dynamic Analysis & Sandbox Engineering (Behavioral Monitoring, API Call Tracing, Network Artifacts & Automated Sandbox Triage)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'**analyse dynamique des malwares** (exécution contrôlée en environnement isolé) : déployer et exploiter un pipeline de **sandbox automatisé (Cuckoo / Cape / Any.Run)**, capturer et analyser les appels systèmes (API Call Tracing via DLL hooking), surveiller les modifications du système de fichiers, du registre et les connexions réseau induites par le malware, et corréler les comportements observés avec les techniques **MITRE ATT&CK**.
>
> **Compétences visées :** `MAL-DYN-01` (A) — Sandbox Architecture, API Call Interception & Behavioral Artifact Collection | `MAL-DYN-02` (A) — Dynamic IoC Extraction & MITRE ATT&CK Behavioral Mapping

---

## 1) Module — Architecture Sandbox & DLL Hooking (2h)

### 📖 Narration/Intuition

L'analyse statique s'arrête face aux malwares packers ou polymorphiques. L'analyse **dynamique** consiste à laisser le malware s'exécuter dans un environnement totalement surveillé et remis à neuf après chaque test. Le cœur d'une sandbox moderne repose sur l'**interception des appels API Windows (API Hooking / DLL Injection)**.

```
   [ Malware.exe ] ─────► API Windows (CreateFile, RegSetValue, WSAConnect...)
                                            │
                                            │ DLL Hook injecté par la Sandbox
                                            ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │                 SANDBOX MONITORING ENGINE                       │
   │  ┌──────────────┐ ┌──────────────┐ ┌───────────────────────┐   │
   │  │ File Monitor │ │ Reg Monitor  │ │ Network Monitor       │   │
   │  │ (Sysmon E11) │ │ (Sysmon E13) │ │ (TCPdump / Zeek)     │   │
   │  └──────────────┘ └──────────────┘ └───────────────────────┘   │
   │  ┌──────────────────────────────────────────────────────────┐   │
   │  │ API Call Logger (procmon / API Monitor)                  │   │
   │  │ CreateRemoteThread + VirtualAlloc ──► Injection Détectée │   │
   │  └──────────────────────────────────────────────────────────┘   │
   └─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
           [ RAPPORT COMPORTEMENTAL MITRE ATT&CK MAPPED ]
```

---

## 2) Module — Moteur de Simulation d'Analyse Comportementale (`dynamic_sandbox_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict

class DynamicSandboxEngine:
    """
    Moteur de simulation et d'analyse comportementale de malware en sandbox.
    Capture les API calls, les événements Sysmon et les connexions réseau.
    Mappe automatiquement les comportements observés vers MITRE ATT&CK.
    """

    MITRE_API_MAPPING = {
        "CreateRemoteThread":     ("T1055",    "Process Injection"),
        "RegSetValueExA":         ("T1547.001","Boot or Logon Autostart Execution: Registry Run Keys"),
        "CryptEncrypt":           ("T1486",    "Data Encrypted for Impact"),
        "DeleteFileA":            ("T1070.004","Indicator Removal: File Deletion"),
        "WSAConnect":             ("T1071",    "Application Layer Protocol: C2 Beacon"),
        "VirtualProtect":         ("T1055",    "Process Injection: Memory Permission Change"),
        "ShellExecuteA":          ("T1059",    "Command and Scripting Interpreter"),
        "IsDebuggerPresent":      ("T1497",    "Virtualization/Sandbox Evasion")
    }

    def __init__(self, sample_sha256: str):
        self.sha256 = sample_sha256
        self.api_call_log: List[dict] = []
        self.file_events: List[dict] = []
        self.network_events: List[dict] = []
        self.mitre_techniques: Dict[str, str] = {}
        self.score: int = 0

    def simulate_api_call(self, function_name: str, args: dict):
        """Enregistre un appel API capturé par le hook de la sandbox."""
        timestamp = datetime.now(timezone.utc).isoformat()

        entry = {
            "timestamp": timestamp,
            "function": function_name,
            "arguments": args
        }
        self.api_call_log.append(entry)

        # Mapping MITRE ATT&CK automatique
        if function_name in self.MITRE_API_MAPPING:
            mitre_id, mitre_name = self.MITRE_API_MAPPING[function_name]
            if mitre_id not in self.mitre_techniques:
                self.mitre_techniques[mitre_id] = mitre_name
                self.score += 25 if "T1486" in mitre_id or "T1055" in mitre_id else 15
            print(f"  [API] {function_name}({args}) -> MITRE {mitre_id}: {mitre_name}")

    def simulate_network_connection(self, dest_ip: str, dest_port: int, protocol: str):
        """Enregistre une connexion réseau générée par le malware pendant l'exécution."""
        event = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "destination_ip": dest_ip,
            "destination_port": dest_port,
            "protocol": protocol
        }
        self.network_events.append(event)
        self.score += 30
        print(f"  [NETWORK] Connexion C2 vers {dest_ip}:{dest_port}/{protocol}")

    def generate_sandbox_report(self) -> dict:
        """Génère le rapport d'analyse comportementale de la sandbox."""
        verdict = "MALICIOUS" if self.score >= 50 else "SUSPICIOUS" if self.score >= 20 else "CLEAN"
        return {
            "sample_sha256": self.sha256,
            "analysis_timestamp": datetime.now(timezone.utc).isoformat(),
            "behavioral_score": self.score,
            "verdict": verdict,
            "mitre_techniques_observed": self.mitre_techniques,
            "api_calls_captured": len(self.api_call_log),
            "network_connections": self.network_events
        }

# Simulation d'une Session d'Analyse Dynamique en Sandbox
sandbox = DynamicSandboxEngine("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")

print("=== DYNAMIC MALWARE SANDBOX ANALYSIS (CAPE/CUCKOO ENGINE) ===")
print("[*] Démarrage de l'analyse dynamique du sample...")

# Simulation des API Calls générés par le malware pendant son exécution
sandbox.simulate_api_call("IsDebuggerPresent", {})
sandbox.simulate_api_call("VirtualProtect", {"lpAddress": "0x007FF000", "flNewProtect": "PAGE_EXECUTE_READWRITE"})
sandbox.simulate_api_call("CreateRemoteThread", {"hProcess": "0x1F0", "lpStartAddress": "0x007FF100"})
sandbox.simulate_api_call("RegSetValueExA", {"hKey": "HKCU\\Run", "lpValueName": "SecurityHelper", "lpData": "C:\\Temp\\svch0st.exe"})
sandbox.simulate_api_call("CryptEncrypt", {"hKey": "0xC001", "bFinal": True})

# Simulation de la connexion au serveur C2
sandbox.simulate_network_connection("185.220.101.5", 443, "TCP/TLS")

# Rapport Final
print("\n=== SANDBOX BEHAVIORAL REPORT ===")
report = sandbox.generate_sandbox_report()
print(json.dumps(report, indent=2, ensure_ascii=False))
```

---

## 3) Module — Fiche Pratique Cuckoo Sandbox / CAPE (2h)

```bash
# COMMANDES D'UTILISATION CAPE / CUCKOO SANDBOX

# Soumettre un échantillon à l'analyse dynamique automatisée
curl -F "file=@malware.exe" http://cuckoo.local:8090/tasks/create/file

# Récupérer le rapport JSON d'analyse comportementale
curl http://cuckoo.local:8090/tasks/report/1

# Triage via CAPE avec règle YARA intégrée
python3 utils/submit.py --package exe --timeout 120 --yara rules/paradis_ransomware.yar malware.exe
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DLL Hooking** | Technique d'interposition dans les appels aux fonctions d'une DLL pour intercepter et enregistrer les appels API |
| **Cuckoo / CAPE** | Plateformes open-source de sandbox automatisée pour l'analyse comportementale de malwares |
| **Behavioral Score** | Score de risque calculé dynamiquement basé sur les comportements suspects observés en sandbox |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quel est l'avantage essentiel de l'**analyse dynamique** par rapport à l'analyse statique pour les malwares packés ?
- A) Le malware est forcé de se décompresser et d'exécuter son code réel en mémoire, révélant son comportement véritable malgré l'obfuscation
- B) Elle est plus rapide que l'analyse statique
- C) Elle ne nécessite aucun équipement
- D) Elle fonctionne uniquement sur macOS

**Réponse : A**

**Q2 :** Quel mécanisme technique permet à une sandbox (Cuckoo/CAPE) d'intercepter et enregistrer tous les appels API Windows effectués par un malware pendant son exécution ?
- A) L'injection d'une DLL de surveillance (DLL Hooking / IAT Patching) dans l'espace mémoire du processus malveillant avant son démarrage
- B) La lecture du code source du malware
- C) Une analyse réseau passive
- D) Un scan antivirus standard

**Réponse : A**

**Q3 :** Quelle technique de malware est détectée quand une sandbox observe la séquence API : `VirtualAllocEx` → `WriteProcessMemory` → `CreateRemoteThread` ?
- A) Une injection de code dans un processus externe (Process Injection — MITRE T1055)
- B) Une mise à jour automatique de Windows
- C) Un téléchargement de fichier légitime
- D) L'installation d'un antivirus

**Réponse : A**

**Q4 :** Comment un malware sophistiqué peut-il détecter qu'il est en cours d'analyse dans une sandbox ?
- A) En interrogeant des APIs anti-debug (`IsDebuggerPresent`, `NtQueryInformationProcess`), en vérifiant le nombre de processus, l'activité souris/clavier, la résolution d'écran, ou en testant la durée d'exécution (Timing-based evasion)
- B) En lisant le manuel d'utilisation
- C) En scannant les ports USB
- D) En consultant les logs IIS

**Réponse : A**

**Q5 :** Quelle technique MITRE ATT&CK (T1486) est directement mappée à l'appel API `CryptEncrypt` observé en sandbox ?
- A) Data Encrypted for Impact — Chiffrement des fichiers victimes dans le cadre d'une attaque de Ransomware
- B) Credential Dumping
- C) Lateral Movement via Pass-the-Hash
- D) Collection de données par keylogger

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
