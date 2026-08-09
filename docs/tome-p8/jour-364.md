# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 364 (6h) : Memory & Endpoint Live Forensics for SOC Tier-3 (Volatility 3, Memory Injection Detection, Process Hollowing Triage & Volatile Artifact Extraction)

> [!NOTE]
> **Objectif du jour :** Maîtriser les techniques de **forensique mémoire en direct (Live Memory Forensics)** pour les analystes SOC Tier-3 et chercheurs en menaces : capturer et analyser des dumps de mémoire vive RAM sous Windows/Linux avec **Volatility 3**, détecter les anomalies d'injection de code (**Process Hollowing, DLL Injection, Reflective DLL Loading**), extraire les clés de déchiffrement et payloads directement depuis les structures noyau (PEB, VAD Tree), et automatiser le tri des artéfacts volatiles lors d'un incident critique.
>
> **Compétences visées :** `SOC-DFIR-03` (A) — Volatility 3 Memory Forensics & Injection Analysis | `SOC-DFIR-04` (A) — VAD Tree Analysis, PEB Inspection & Volatile Artifact Triage

---

## 1) Module — Mémoire Vive & Injections de Code (VAD Tree) (2h)

### 📖 Narration/Intuition

Lorsque le disque dur est nettoyé par des malwares "fileless", **la mémoire vive (RAM) reste la seule source de vérité absolue**. Les malwares injectent leur code dans des processus légitimes en modifiant les descripteurs de mémoire virtuelle du noyau Windows (**Virtual Address Descriptor - VAD Tree**).

```
   [ PROCESSUS CIBLE (ex: explorer.exe - PID 1420) ]
                          │
                          ▼ (Allocation Mémoire RWX via VirtualAllocEx)
   ┌─────────────────────────────────────────────────────────────┐
   │ VAD TREE (Virtual Address Descriptor)                       │
   │  - Page 0x00400000 : PAGE_READONLY (Code Légitime)          │
   │  - Page 0x007F0000 : PAGE_EXECUTE_READWRITE <--- MALFIND !  │
   │    (Contient des Magic Bytes 'MZ' / Shellcode non cartographié)│
   └────────────────────────┬────────────────────────────────────┘
                            │ (Analyse Volatility malfind)
                            ▼
      [ DUMP MÉMOIRE & EXTRACTION DU MALWARE SANS FICHIER DISQUE ]
```

#### Signature des Injections en Mémoire (Memory Forensics Indicators)

| Technique d'Injection | Signature Volatility 3 | Anomalie VAD / Memory Flag |
|:---:|:---|:---|
| **DLL Injection** | `windows.dlllist` vs `windows.handles` | DLL présente dans la liste sans fichier sous-jacent sur disque |
| **Process Hollowing** | `windows.pslist` vs `windows.psscan` | Processus avec PEB altéré / Unmapped Executable Memory |
| **Reflective DLL** | `windows.malfind` | Page mémoire VAD marquée `PAGE_EXECUTE_READWRITE` (RWX) avec MZ header |
| **DKOM Process Hide** | `windows.psscan` | Processus présent dans le scan RAM mais absent de la chaîne `ActiveProcessLinks` |

---

## 2) Module — Outillage Memory Forensics Engine (`volatile_memory_analyzer.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import struct
from datetime import datetime, timezone
from typing import List, Dict

class VolatileMemoryAnalyzer:
    """
    Moteur de tri et d'analyse forensique de mémoire vive RAM (Spécification Volatility 3).
    Inspecte les structures VAD Tree et PEB pour détecter les injections de code sans fichier.
    """

    def __init__(self, sample_name: str):
        self.sample = sample_name
        self.detected_injections: List[dict] = []

    def inspect_vad_region(self, pid: int, process_name: str, vad_start: str, vad_end: str, protection: str, hex_dump_head: bytes) -> dict:
        """
        Examine une région VAD (Virtual Address Descriptor).
        Une région marquée RWX (PAGE_EXECUTE_READWRITE) contenant l'en-tête 'MZ' (0x4D5A) est une injection avérée.
        """
        is_rwx = "EXECUTE_READWRITE" in protection or protection == "RWX"
        has_mz_header = hex_dump_head.startswith(b"MZ") or hex_dump_head.startswith(b"\x4d\x5a")
        
        # Test de signature malfind (Reflective DLL / Shellcode)
        if is_rwx and (has_mz_header or b"\x90\x90\x90" in hex_dump_head):
            injection_info = {
                "pid": pid,
                "process_name": process_name,
                "vad_range": f"{vad_start}-{vad_end}",
                "protection": protection,
                "has_mz_header": has_mz_header,
                "confidence": 95 if has_mz_header else 80,
                "injection_type": "Reflective DLL Loading" if has_mz_header else "Shellcode Injection (NOP Sled)",
                "recommended_action": f"windows.dumpfiles --pid {pid} --virtaddr {vad_start}"
            }
            self.detected_injections.append(injection_info)
            print(f"[!] INJECTION MÉMOIRE DÉTECTÉE sur PID {pid} ({process_name}) -> Type: {injection_info['injection_type']}")
            return injection_info

        return {"status": "CLEAN"}

    def generate_forensic_triage_report(self) -> dict:
        """Génère le rapport de tri forensique mémoire pour l'équipe Incident Response."""
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "sample_file": self.sample,
            "injections_found_count": len(self.detected_injections),
            "critical_injections": self.detected_injections
        }

# Démonstration Forensique Mémoire Tier-3
analyzer = VolatileMemoryAnalyzer("memory_dump_win11_incident.raw")

print("=== VOLATILE MEMORY FORENSICS ANALYZER (VOLATILITY 3 ENGINE) ===")

# Inspection VAD 1 : Processus explorer.exe avec allocation RWX contenant un binaire MZ (Reflective DLL)
analyzer.inspect_vad_region(
    pid=1420,
    process_name="explorer.exe",
    vad_start="0x00000000021f0000",
    vad_end="0x0000000002230000",
    protection="PAGE_EXECUTE_READWRITE",
    hex_dump_head=b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff"
)

# Inspection VAD 2 : Processus svchost.exe légitime (PAGE_READONLY)
analyzer.inspect_vad_region(
    pid=804,
    process_name="svchost.exe",
    vad_start="0x00007ff710000000",
    vad_end="0x00007ff710050000",
    protection="PAGE_EXECUTE_READ",
    hex_dump_head=b"MZ\x90\x00\x03\x00\x00\x00"
)

print("\n=== RAPPORT DE TRI FORENSIQUE MÉMOIRE ===")
print(json.dumps(analyzer.generate_forensic_triage_report(), indent=2, ensure_ascii=False))
```

---

## 3) Module — Commandes Volatility 3 pour l'Investigation SOC Tier-3 (2h)

```bash
# GUIDE DE COMMANDES VOLATILITY 3 EN INCIDENT RESPONSE

# 1. Lister les processus et détecter les processus cachés (DKOM)
python3 vol.py -f memory.raw windows.pslist
python3 vol.py -f memory.raw windows.psscan

# 2. Rechercher les injections de code (Pages RWX & MZ Headers)
python3 vol.py -f memory.raw windows.malfind

# 3. Analyser les connexions réseau résidantes en mémoire
python3 vol.py -f memory.raw windows.netscan

# 4. Extraire le binaire injecté depuis la mémoire pour analyse YARA/IDA
python3 vol.py -f memory.raw windows.dumpfiles --pid 1420 --virtaddr 0x00000000021f0000

# 5. Extraire les ruches du registre Windows depuis la RAM
python3 vol.py -f memory.raw windows.registry.hivelist
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **VAD Tree** | Virtual Address Descriptor Tree — Structure noyau Windows gérant les allocations de mémoire virtuelle par processus |
| **PEB** | Process Environment Block — Structure sous Windows contenant les métadonnées et DLLs chargées d'un processus |
| **RWX** | Read, Write, Execute — Permission mémoire critique permettant d'écrire et d'exécuter du code au même endroit |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Dans Volatility 3, quel plugin est l'outil principal pour détecter les injections de code sans fichier (**Reflective DLL / Shellcode**) dans la mémoire d'un processus ?
- A) `windows.malfind`
- B) `windows.info`
- C) `windows.keyboard`
- D) `windows.format`

**Réponse : A**

**Q2 :** Pourquoi la présence d'une plage mémoire VAD configurée avec la permission **`PAGE_EXECUTE_READWRITE` (RWX)** est-elle hautement suspecte ?
- A) Parce que les programmes légitimes n'ont pas besoin d'écrire et d'exécuter du code au même emplacement mémoire (principe W^X) ; cette combinaison est la marque d'un shellcode injecté
- B) Parce qu'elle accélère l'ordinateur
- C) Parce qu'elle efface le disque dur
- D) C'est la configuration par défaut de Windows

**Réponse : A**

**Q3 :** Comment extraire le binaire d'un malware hébergé uniquement en mémoire RAM pour effectuer son analyse statique sous IDA Pro ou YARA ?
- A) En utilisant le plugin `windows.dumpfiles` de Volatility 3 en spécifiant le PID et l'adresse virtuelle (`--virtaddr`) de la page infectée
- B) En prenant une photo de l'écran
- C) En redémarrant le serveur
- D) En envoyant un mail au support

**Réponse : A**

**Q4 :** Qu'est-ce que la structure noyau **PEB (Process Environment Block)** sous Windows ?
- A) Une structure de données propre à chaque processus contenant des informations système telles que les paramètres de ligne de commande, les variables d'environnement et la liste des DLLs chargées
- B) Une carte réseau virtuelle
- C) Un antivirus natif
- D) Un composant du BIOS

**Réponse : A**

**Q5 :** Quelle est la différence de résultat entre `windows.pslist` et `windows.psscan` lors d'une investigation mémoire ?
- A) `pslist` parcourt la liste chaînée officielle des processus (qui peut être manipulée par un rootkit DKOM), tandis que `psscan` balaye physiquement la mémoire RAM à la recherche des structures `EPROCESS` réelles
- B) `pslist` est réservé à Linux
- C) `psscan` ne fonctionne que sur les serveurs 32 bits
- D) Il n'y a aucune différence

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
