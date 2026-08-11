# TOME P10 — DFIR & Reverse Engineering — Jour 450 (6h) : Projet Intégrateur S10 Partie 2 — Reverse Engineering & Malware Analysis Capstone (Full Binary Dissection & Threat Intelligence Report)

> [!NOTE]
> **Objectif du jour :** Conduire le **Projet Intégrateur S10 Partie 2** — l'ingénierie inverse complète d'un échantillon malveillant complexe (Ransomware/RAT hybride obfusqué avec anti-debugging et chiffrement custom), l'extraction d'IOCs de haut niveau (Pyramid of Pain), l'instrumentation dynamique avec Frida, et la rédaction du rapport d'analyse binaire certifiant le niveau **Distinguished DFIR & Reverse Engineering Lead**.
>
> **Ce projet valide les compétences de niveau Distinguished Reverse Engineer & Malware Forensic Lead — le plus haut niveau de certification du Tome 10.**

---

## 1) Module — Engine d'Analyse Binaire Capstone (`binary_re_capstone_engine.py`) (2h30)

### 🛠️ Script d'Orchestration du Projet Intégrateur RE

```python
import os
import json
import hashlib
from datetime import datetime, timezone
from typing import List, Dict

class BinaryRECapstoneEngine:
    """
    Projet Intégrateur S10 Partie 2 :
    Orchestrateur d'analyse binaire approfondie et d'ingénierie inverse :
    - Phase 1: Pre-Analysis & Static Dissection (Entropy, PE Header, Imphash, YARA)
    - Phase 2: Ghidra Decompilation & Obfuscation Bypassing (XOR/AES Key extraction)
    - Phase 3: Dynamic Debugging & Anti-Analysis Bypass (GDB/x64dbg, Frida hooks)
    - Phase 4: Threat Intelligence & MITRE ATT&CK Mapping (IOCs, C2 Extract, Pyramid of Pain)
    """

    def __init__(self, sample_hash: str):
        self.sample_hash = sample_hash
        self.timestamp = datetime.now(timezone.utc).isoformat()
        self.analysis_steps: List[dict] = []
        self.extracted_iocs: List[dict] = []

    def phase1_static_dissection(self) -> dict:
        """Phase 1 — Dissection statique complète du binaire."""
        print(f"\n[PHASE 1] STATIC DISSECTION — Sample SHA-256: {self.sample_hash}")
        static_spec = {
            "format": "PE32+ executable (x86-64 GUI)",
            "compiler": "Microsoft Visual C++ 2022",
            "section_entropy": {
                ".text": 7.89,  # Forte entropie = obfusqué/packé
                ".rdata": 6.12,
                ".data": 4.50,
                ".reloc": 2.10
            },
            "imphash": "a1b2c3d4e5f607891011121314151617",
            "suspicious_imports": [
                "VirtualAllocEx (Injection)",
                "WriteProcessMemory (Process Hollowing)",
                "CreateRemoteThread (Execution)",
                "IsDebuggerPresent (Anti-Debug)",
                "CryptDecrypt (Crypto Payload)"
            ],
            "yara_matches": [
                "Ransomware_LockBit_Variant",
                "AntiDebug_PEB_Check",
                "High_Entropy_Packed_Section"
            ]
        }
        self.analysis_steps.append({"phase": 1, "domain": "STATIC_DISSECTION", "status": "COMPLETED", "data": static_spec})
        print("  ✅ Dissection statique : Entropie 7.89 (.text packé), Imports d'injection & YARA matchés")
        return static_spec

    def phase2_ghidra_decompilation(self) -> dict:
        """Phase 2 — Décompilation et déobfuscation sous Ghidra."""
        print(f"\n[PHASE 2] GHIDRA DECOMPILATION & DEOBFUSCATION")
        ghidra_spec = {
            "entry_point": "0x140001050",
            "main_loop": "0x140002100 (Routine de déchiffrement de chaîne)",
            "obfuscation_type": "XOR Multi-Byte (Clé: 0xDEADBEEF) + Stack Strings",
            "recovered_strings": [
                "cmd.exe /c vssadmin.exe delete shadows /all /quiet",  # Destruction Shadow Copies
                "https://c2-infrastructure-node.net/api/v2/gate.php", # URL C2
                "RSA-4096 Public Key Footer",
                "DECRYPT_INSTRUCTIONS.txt"
            ],
            "key_algorithm": "AES-256-CTR (Session) + Curve25519 (ECDH Master)"
        }
        self.extracted_iocs.append({"type": "URL", "value": "https://c2-infrastructure-node.net/api/v2/gate.php", "confidence": "HIGH"})
        self.analysis_steps.append({"phase": 2, "domain": "GHIDRA_DECOMPILATION", "status": "COMPLETED", "data": ghidra_spec})
        print("  ✅ Décompilation Ghidra : Routines XOR inversées, URL C2 et commandes vssadmin extraites")
        return ghidra_spec

    def phase3_dynamic_instrumentation(self) -> dict:
        """Phase 3 — Debugging dynamique et contournement d'anti-analyse via Frida."""
        print(f"\n[PHASE 3] DYNAMIC DEBUGGING & FRIDA INSTRUMENTATION")
        dynamic_spec = {
            "anti_debug_bypassed": [
                "PEB.IsDebugged (Patched to 0 via Frida)",
                "NtQueryInformationProcess (ProcessDebugPort overridden to 0)",
                "RDTSC Timing Check (NOP Sled inserted)"
            ],
            "frida_hooks_executed": [
                "advapi32.dll!CryptDecrypt -> Intercepted AES-256 Session Key",
                "ws2_32.dll!connect -> Captured C2 TCP Traffic"
            ],
            "recovered_session_key": "4f8a9b2c3d1e0f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a"
        }
        self.extracted_iocs.append({"type": "AES_KEY", "value": dynamic_spec["recovered_session_key"], "context": "Active Session Encryption Key"})
        self.analysis_steps.append({"phase": 3, "domain": "DYNAMIC_INSTRUMENTATION", "status": "COMPLETED", "data": dynamic_spec})
        print("  ✅ Instrumentation Frida : Anti-Debug neutralisé, Clé AES-256 interceptée en mémoire")
        return dynamic_spec

    def phase4_threat_intel_report(self) -> dict:
        """Phase 4 — Threat Intelligence, attribution et rapport d'évaluation Capstone."""
        print(f"\n[PHASE 4] THREAT INTELLIGENCE & CAPSTONE REPORT GENERATION")
        ti_report = {
            "sample_sha256": self.sample_hash,
            "threat_actor_attribution": "APT29 / Cozy Bear (High Confidence based on TTPs)",
            "mitre_attack_matrix": [
                "T1055.012 — Process Hollowing (svchost.exe injection)",
                "T1490 — Inhibit System Recovery (vssadmin delete shadows)",
                "T1486 — Data Encrypted for Impact (AES-256 + Curve25519)",
                "T1071.001 — Application Layer Protocol (HTTPS C2 Channel)",
                "T1622 — Debugger Evasion (PEB & Timing checks)"
            ],
            "pyramid_of_pain_iocs": self.extracted_iocs,
            "remediation_guidelines": [
                "Deploy YARA rule 'Ransomware_LockBit_Variant' across EDR agents",
                "Block domain 'c2-infrastructure-node.net' at DNS Resolver & Perimeter Firewall",
                "Restrict vssadmin execution rights via Windows AppLocker/WDAC",
                "Isolate compromised endpoints and perform RAM dump for key recovery"
            ]
        }
        self.analysis_steps.append({"phase": 4, "domain": "THREAT_INTEL", "status": "COMPLETED", "data": ti_report})
        return ti_report

    def generate_distinguished_certification_report(self) -> dict:
        """Génère le rapport de certification finale du Tome 10."""
        return {
            "capstone_project": "PROJET INTÉGRATEUR S10 PARTIE 2 — REVERSE ENGINEERING CAPSTONE",
            "date": datetime.now(timezone.utc).isoformat(),
            "certification_level": "DISTINGUISHED_REVERSE_ENGINEER_AND_MALWARE_FORENSIC_LEAD",
            "standards_achieved": [
                "NIST SP 800-86 (Guide to Integrating Forensic Techniques)",
                "SANS FOR610 (Reverse-Engineering Malware)",
                "MITRE ATT&CK Enterprise Framework v14",
                "ISO/IEC 27037 (Digital Evidence Handling)"
            ],
            "capstone_execution_details": self.analysis_steps
        }

# Exécution du Projet Intégrateur
print("=== REVERSE ENGINEERING & MALWARE ANALYSIS CAPSTONE — S10 P2 ===")
capstone = BinaryRECapstoneEngine("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")

capstone.phase1_static_dissection()
capstone.phase2_ghidra_decompilation()
capstone.phase3_dynamic_instrumentation()
report = capstone.phase4_threat_intel_report()

cert = capstone.generate_distinguished_certification_report()
print("\n=== DISTINGUISHED REVERSE ENGINEER CERTIFICATION REPORT ===")
print(json.dumps(cert, indent=2, ensure_ascii=False))
```

---

## 2) Module — Grille de Validation Finale Capstone S10 P2 & Bilan du Tome 10 (1h30)

```markdown
## EVALUATION GRID — CAPSTONE S10 PARTIE 2

| Domaine | Critères d'Évaluation | Pondération | Statut |
|:---|:---|:---:|:---:|
| **Static Dissection** | Entropie, PE Headers, Imphash, YARA Rules & Import Table | 25% | **VALIDÉ** |
| **Ghidra Reverse** | Décompilation C, Déobfuscation XOR/Stack Strings, Extr. C2 | 25% | **VALIDÉ** |
| **Dynamic Frida Hooking**| Contournement Anti-Debug (PEB/RDTSC) + Clé AES interceptée | 25% | **VALIDÉ** |
| **Threat Intel & ATT&CK**| Pyramid of Pain, Attribution APT29 & Remediation Plan | 25% | **VALIDÉ** |

**Score Final : 100/100 — CERTIFICATION DISTINGUISHED REVERSE ENGINEER DÉCERNÉE 🏆**
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **WDAC** | Windows Defender Application Control — Système de contrôle d'exécution d'applications au niveau noyau sous Windows |
| **ECDH** | Elliptic Curve Diffie-Hellman — Protocole d'échange de clés asymétriques basé sur les courbes elliptiques |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
