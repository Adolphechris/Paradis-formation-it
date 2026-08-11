# TOME P10 — DFIR & Reverse Engineering — Jour 445 (6h) : Projet Intégrateur S10 Partie 1 — DFIR End-to-End : Triage, Memory, Disk & Network Forensics (Full Incident Investigation)

> [!NOTE]
> **Objectif du jour :** Conduire une **investigation DFIR complète end-to-end** d'un incident simulé de type APT (Advanced Persistent Threat) : triage initial, acquisition mémoire, analyse forensique disque, investigation réseau, reconstruction de timeline et rédaction du rapport d'incident.
>
> **Ce projet synthétise et valide les compétences J441-J444 : PICERL, Volatility 3, The Sleuth Kit/Autopsy, Zeek/Suricata.**

---

## 1) Module — Framework d'Investigation DFIR End-to-End (`dfir_investigation_framework.py`) (2h30)

### 🛠️ Script d'Orchestration de l'Investigation DFIR

```python
import os
import json
import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Optional

class DFIRInvestigationFramework:
    """
    Projet Intégrateur S10 Partie 1 :
    Framework d'investigation DFIR end-to-end simulant un incident APT :
    - Phase 1: Triage Initial & Chain of Custody
    - Phase 2: Memory Forensics (Volatility 3 — Process Injection, Rootkit)
    - Phase 3: Disk Forensics (TSK/Autopsy — Timestomping, Deleted Files)
    - Phase 4: Network Forensics (Zeek/Suricata — C2 Beacon, DNS Tunneling)
    - Phase 5: Super-Timeline & Rapport d'Incident
    """

    def __init__(self, case_id: str, analyst: str):
        self.case_id = case_id
        self.analyst = analyst
        self.timestamp = datetime.now(timezone.utc).isoformat()
        self.findings: List[dict] = []
        self.iocs: List[dict] = []

    def phase1_triage_chain_of_custody(self) -> dict:
        """Phase 1 — Triage initial et établissement de la chaîne de preuve."""
        print(f"\n[PHASE 1] TRIAGE INITIAL — Cas {self.case_id}")
        triage = {
            "case_id": self.case_id,
            "analyst": self.analyst,
            "timestamp_utc": self.timestamp,
            "compromised_host": "BANKWKS-042 (192.168.10.42)",
            "os": "Windows 10 Pro 22H2",
            "initial_detection": "EDR Alert: Suspicious PowerShell execution + Outbound HTTPS to TOR exit node",
            "priority": "P1-CRITICAL",
            "chain_of_custody": {
                "ram_dump": {"file": "BANKWKS042-ram.mem", "size_gb": 16, "sha256": "a3f7...d91c", "method": "WinPMem v3.3"},
                "disk_image": {"file": "BANKWKS042-disk.dd", "size_gb": 512, "sha256": "f5e2...8a01", "method": "dcfldd + write-blocker"},
                "network_capture": {"file": "BANKWKS042-traffic.pcap", "size_mb": 2400, "sha256": "b7c1...4f22", "method": "Zeek + tcpdump"}
            }
        }
        self.findings.append({"phase": 1, "category": "TRIAGE", "severity": "CRITICAL", "data": triage})
        print("  ✅ Preuves acquises et hashées — Chain of Custody établie")
        return triage

    def phase2_memory_forensics_findings(self) -> dict:
        """Phase 2 — Résultats de l'analyse mémoire Volatility 3."""
        print(f"\n[PHASE 2] MEMORY FORENSICS — Volatility 3")
        mem_findings = {
            "tool": "Volatility 3.2.1",
            "suspicious_processes": [
                {
                    "pid": 3244,
                    "name": "svchost.exe",
                    "ppid": 3112,  # Anormal: devrait être 648 (services.exe)
                    "ppid_name": "svchost.exe",  # ANOMALIE: parent incorrect
                    "finding": "PROCESS HOLLOWING — Header MZ @ 0x1c0000 (RWX)",
                    "c2_connection": "185.220.101.47:443 ESTABLISHED"
                }
            ],
            "rootkit_indicators": {
                "dkom_detected": True,
                "hidden_pid": 722,
                "pslist_vs_psscan": "PID 722 visible in psscan, absent from pslist"
            },
            "extracted_artifacts": [
                "Cobalt Strike Beacon DLL (Reflective Loader confirmed)",
                "Mimikatz in-memory (credential dumping in progress)"
            ]
        }
        ioc_beacon = {"type": "IP", "value": "185.220.101.47", "confidence": "HIGH", "context": "Cobalt Strike C2 via Process Hollow svchost.exe"}
        self.iocs.append(ioc_beacon)
        self.findings.append({"phase": 2, "category": "MEMORY_FORENSICS", "severity": "CRITICAL", "data": mem_findings})
        print("  ✅ Process Hollowing + DKOM Rootkit + Cobalt Strike Beacon confirmés")
        return mem_findings

    def phase3_disk_forensics_findings(self) -> dict:
        """Phase 3 — Résultats de l'analyse disque."""
        print(f"\n[PHASE 3] DISK FORENSICS — TSK / Autopsy")
        disk_findings = {
            "timestomping_detected": True,
            "suspicious_files": [
                {
                    "path": "C:\\Windows\\Temp\\winupdate.exe",
                    "si_born": "2015-06-14 00:00:00 UTC",    # Manipulé
                    "fn_born": "2024-03-15 02:34:17 UTC",    # Réel
                    "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    "verdict": "MALWARE — Timestomping confirmé, hash = Cobalt Strike stager"
                }
            ],
            "deleted_files_recovered": [
                "C:\\Users\\jsmith\\Downloads\\invoice_q1.doc (Macro-embedded phishing document)"
            ],
            "usnjrnl_events": [
                {"timestamp": "2024-03-15 02:30:11 UTC", "reason": "FILE_CREATE", "filename": "winupdate.exe"},
                {"timestamp": "2024-03-15 02:34:17 UTC", "reason": "FILE_WRITE", "filename": "winupdate.exe"},
                {"timestamp": "2024-03-15 02:34:20 UTC", "reason": "FILE_DELETE", "filename": "invoice_q1.doc"}
            ]
        }
        self.findings.append({"phase": 3, "category": "DISK_FORENSICS", "severity": "HIGH", "data": disk_findings})
        print("  ✅ Timestomping + Malware stager + Document phishing récupéré")
        return disk_findings

    def phase4_network_forensics_findings(self) -> dict:
        """Phase 4 — Résultats de l'analyse réseau Zeek/Suricata."""
        print(f"\n[PHASE 4] NETWORK FORENSICS — Zeek + Suricata")
        net_findings = {
            "c2_beacon_detected": {
                "destination": "185.220.101.47:443",
                "interval_seconds": 60,
                "duration_hours": 48,
                "total_connections": 2880,
                "ja3_hash": "a0e9f5d64349fb13191bc781f81f42e1",
                "ja3_verdict": "KNOWN Cobalt Strike Default Profile"
            },
            "dns_tunneling": {
                "detected": False,
                "note": "DNS résolu normalement — exfiltration via HTTPS chiffré"
            },
            "data_exfiltration_estimate": {
                "estimated_mb": 847,
                "destination": "185.220.101.47 (Romania — Bulletproof Hosting)",
                "method": "HTTPS POST — Cobalt Strike HTTP Stager"
            },
            "suricata_alerts": [
                "ET MALWARE Cobalt Strike Beacon Checkin (sid:2019771, severity:1)",
                "ET TOR Known Tor Exit Node Traffic (sid:2520025, severity:2)"
            ]
        }
        self.findings.append({"phase": 4, "category": "NETWORK_FORENSICS", "severity": "CRITICAL", "data": net_findings})
        print("  ✅ C2 Beacon 48h confirmé + 847 MB exfiltrés vers Bulletproof Hosting")
        return net_findings

    def phase5_generate_incident_report(self) -> dict:
        """Phase 5 — Génération du rapport d'incident formel."""
        print(f"\n[PHASE 5] GÉNÉRATION DU RAPPORT D'INCIDENT")
        report = {
            "case_id": self.case_id,
            "analyst": self.analyst,
            "report_date": self.timestamp,
            "incident_summary": {
                "type": "APT — Spear Phishing → Cobalt Strike → Lateral Movement → Data Exfiltration",
                "attack_chain": [
                    "T1566.001 — Spear Phishing (invoice_q1.doc)",
                    "T1059.001 — PowerShell Execution (Macro VBA)",
                    "T1055.012 — Process Hollowing (svchost.exe)",
                    "T1071.001 — C2 HTTPS (Cobalt Strike — 185.220.101.47)",
                    "T1003.001 — Credential Dumping (Mimikatz in-memory)",
                    "T1041 — Exfiltration Over C2 Channel (847 MB)"
                ],
                "dwell_time": "48 heures avant détection EDR",
                "impact": "Données financières confidentielles exfiltrées (niveau PCI-DSS)"
            },
            "mitre_attack_techniques": ["T1566.001", "T1059.001", "T1055.012", "T1071.001", "T1003.001", "T1041"],
            "iocs": self.iocs,
            "remediation": [
                "Isolation immédiate VLAN du poste BANKWKS-042",
                "Reset credentials compromis (jsmith + tous comptes accédés depuis le poste)",
                "Blocage IP 185.220.101.47 + domaine C2 sur NGFW",
                "Déploiement patch anti-macro Office pour tout le domaine AD",
                "Revue des mouvements latéraux (WMI/PsExec) depuis BANKWKS-042"
            ]
        }
        print("\n=== RAPPORT D'INCIDENT COMPLET ===")
        print(json.dumps(report, indent=2, ensure_ascii=False))
        return report

# ─── EXÉCUTION DU PROJET INTÉGRATEUR ───────────────────────────
print("=" * 70)
print("PROJET INTÉGRATEUR S10 PARTIE 1 — DFIR END-TO-END INVESTIGATION")
print("=" * 70)

case = DFIRInvestigationFramework("INC-2024-0315-BANKWKS042", "J. Dupont — PARADIS DFIR")
case.phase1_triage_chain_of_custody()
case.phase2_memory_forensics_findings()
case.phase3_disk_forensics_findings()
case.phase4_network_forensics_findings()
case.phase5_generate_incident_report()
```

---

## 2) Module — MITRE ATT&CK Mapping & Grille de Validation (1h30)

```markdown
## GRILLE D'ÉVALUATION — PROJET INTÉGRATEUR S10 PARTIE 1

| Phase | Critères de Validation | Pondération | Statut |
|:---|:---|:---:|:---:|
| **Phase 1 : Triage** | RFC 3227 respecté, Chain of Custody hashée SHA-256 | 20% | **VALIDÉ** |
| **Phase 2 : Mémoire** | Process Hollowing + DKOM + Beacon identifiés (Volatility 3) | 25% | **VALIDÉ** |
| **Phase 3 : Disque** | Timestomping détecté + fichiers supprimés récupérés (TSK) | 25% | **VALIDÉ** |
| **Phase 4 : Réseau** | C2 Beacon + JA3 fingerprint + Suricata signatures (Zeek) | 20% | **VALIDÉ** |
| **Phase 5 : Rapport** | MITRE ATT&CK mapping complet + plan de remédiation | 10% | **VALIDÉ** |

**Score Final : 100/100 — DFIR LEAD ANALYST CERTIFICATION S10 P1 ✅**
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **APT** | Advanced Persistent Threat — Acteur de menace sophistiqué et persistant (souvent étatique ou cybercriminel organisé) |
| **IOC** | Indicator of Compromise — Hash, IP, domaine ou comportement prouvant une compromission |
| **MITRE ATT&CK** | Framework de référence des techniques et tactiques d'attaque utilisées par les acteurs de menace |
| **Dwell Time** | Temps de présence d'un attaquant dans un réseau avant sa détection (médiane mondiale : ~16 jours en 2024) |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
