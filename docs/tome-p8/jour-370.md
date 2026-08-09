# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 370 (6h) : Projet Intégrateur S8 Partie 3 — Full DFIR Investigation & Forensic Evidence Report (End-to-End Case Triage, Memory, Registry, Disk & Network Analysis)

> [!NOTE]
> **Objectif du jour :** Conduire et valider une **investigation forensique numérique intégrale (DFIR Capstone)** : analyser un cas d'incident réel combinant la capture mémoire RAM (Volatility 3), la dissection du système de fichiers NTFS ($MFT / Timestomping), l'inspection du Registre (UserAssist / Amcache), la reconstruction de captures PCAP (TShark) et la rédaction du **Rapport de Preuve Judiciaire / Expert DFIR**.
>
> **Ce projet valide l'aptitude technique et la rigueur d'investigation de niveau Lead Digital Forensics Analyst & Incident Commander.**

---

## 1) Module — Plateforme d'Investigation Forensique Intégrée (`dfir_full_case_capstone.py`) (2h30)

### 🛠️ Script d'Orchestration et d'Analyse Multi-Artefacts

```python
import json
import hashlib
from datetime import datetime, timezone

class DFIRFullCaseCapstone:
    """
    Projet Intégrateur S8 Partie 3 :
    Orchestration d'une investigation DFIR complète : Mémoire + Registre + NTFS $MFT + Trafic PCAP.
    """

    def __init__(self, case_id: str, suspect_host: str):
        self.case_id = case_id
        self.host = suspect_host
        self.timeline: list = []
        self.confirmed_evidence: list = []

    def process_case_investigation(self, memory_data: dict, mft_data: dict, registry_data: dict, pcap_data: dict) -> dict:
        """
        Corrélation complète des artefacts découverts lors de l'enquête DFIR.
        """
        print(f"=== [DFIR CASE INVESTIGATION] {self.case_id} sur {self.host} ===")

        # 1. Analyse Mémoire (Détection d'injection RWX)
        if memory_data.get("injection_detected"):
            self.confirmed_evidence.append({
                "source": "MEMORY_RAM",
                "finding": f"Injection de code {memory_data.get('type')} sur PID {memory_data.get('pid')}.",
                "severity": "CRITICAL"
            })
            self._add_to_timeline(memory_data.get("timestamp"), "MEMORY", f"Code injecté dans PID {memory_data.get('pid')}")

        # 2. Analyse NTFS $MFT (Détection de Timestomping)
        if mft_data.get("timestomp_detected"):
            self.confirmed_evidence.append({
                "source": "NTFS_MFT",
                "finding": f"Timestomping confirmé sur {mft_data.get('file_path')} (Date $SI fustigée).",
                "severity": "HIGH"
            })
            self._add_to_timeline(mft_data.get("timestamp"), "NTFS", f"Modification frauduleuse d'horodatage sur {mft_data.get('file_path')}")

        # 3. Analyse Registre (UserAssist & Persistance)
        if registry_data.get("persistence_found"):
            self.confirmed_evidence.append({
                "source": "WINDOWS_REGISTRY",
                "finding": f"Persistance dans la clé Run : {registry_data.get('run_key_val')}.",
                "severity": "HIGH"
            })
            self._add_to_timeline(registry_data.get("timestamp"), "REGISTRY", f"Clé Run ajoutée : {registry_data.get('run_key_val')}")

        # 4. Analyse Réseau PCAP (Extraction Exfiltration HTTP/HTTPS)
        if pcap_data.get("exfiltration_detected"):
            self.confirmed_evidence.append({
                "source": "NETWORK_PCAP",
                "finding": f"Exfiltration de données vers {pcap_data.get('c2_ip')} via HTTP POST ({pcap_data.get('bytes')} octets).",
                "severity": "CRITICAL"
            })
            self._add_to_timeline(pcap_data.get("timestamp"), "NETWORK", f"Connexion C2 Exfiltration vers {pcap_data.get('c2_ip')}")

        return {
            "case_id": self.case_id,
            "investigation_timestamp": datetime.now(timezone.utc).isoformat(),
            "target_host": self.host,
            "total_evidence_count": len(self.confirmed_evidence),
            "evidence_details": self.confirmed_evidence,
            "chronological_super_timeline": sorted(self.timeline, key=lambda x: x["timestamp"])
        }

    def _add_to_timeline(self, timestamp: str, artifact_type: str, description: str):
        self.timeline.append({
            "timestamp": timestamp,
            "type": artifact_type,
            "description": description
        })

# Simulation du cas d'incident DFIR
case_engine = DFIRFullCaseCapstone("CASE-2026-APT99", "WKSTN-DIRECTOR-01")

mem_evidence = {"injection_detected": True, "type": "Reflective DLL", "pid": 1420, "timestamp": "2026-08-08T04:15:00Z"}
mft_evidence = {"timestomp_detected": True, "file_path": "C:\\Users\\Public\\dropper.exe", "timestamp": "2026-08-08T04:10:00Z"}
reg_evidence = {"persistence_found": True, "run_key_val": "powershell.exe -Enc SQBFA...", "timestamp": "2026-08-08T04:12:00Z"}
net_evidence = {"exfiltration_detected": True, "c2_ip": "185.220.101.5", "bytes": 45000, "timestamp": "2026-08-08T04:20:00Z"}

final_case_report = case_engine.process_case_investigation(mem_evidence, mft_evidence, reg_evidence, net_evidence)

print("=== FINAL EXPERT DFIR REPORT ===")
print(json.dumps(final_case_report, indent=2, ensure_ascii=False))
```

---

## 2) Module — Structure du Rapport de Preuve Judiciaire / Expert DFIR (1h30)

```markdown
# EXECUTIVE FORENSIC EVIDENCE REPORT

**Cas N° :** CASE-2026-APT99  
**Investigateur Principale :** Expert DFIR Lead  
**Cible :** `WKSTN-DIRECTOR-01` (Poste de travail Direction Financière)  
**Empreinte Master Manifest SHA-256 :** `a8f912b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1`  

---

### Executive Summary

Le 08 Août 2026, l'équipe DFIR a mené une investigation numérique complète sur le poste `WKSTN-DIRECTOR-01` suite à une alerte d'exfiltration réseau.

L'analyse corrélée des artefacts volatiles (RAM), du Registre Windows, de la Master File Table ($MFT) et du trafic réseau (PCAP) confirme une intrusion réussie menée par un attaquant sophistiqué :
1. **Accès Initial & Persistance (04:10 - 04:12 UTC) :** Dépôt d'un dropper avec timestomping dans `C:\Users\Public\` et création d'une clé de persistance dans `HKCU\...\Run`.
2. **Injection Mémoire (04:15 UTC) :** Injection d'une Reflective DLL (DLL sans fichier) dans le processus légitime `explorer.exe` (PID 1420).
3. **Exfiltration Réseau (04:20 UTC) :** Transmet de 45 Ko de données financières vers le C2 `185.220.101.5` via HTTPS déchiffré.

---

### Chaîne de Traçabilité des Preuves (Chain of Custody)

| Artefact | Source | Empreinte SHA-256 | Statut Intégrité |
|:---|:---|:---|:---:|
| `RAM_Dump.raw` | Mémoire RAM | `b9f8...1012` | **VERIFIÉ (Intact)** |
| `MFT_Dump.raw` | Disque NTFS | `c3d4...9981` | **VERIFIÉ (Intact)** |
| `NTUSER.DAT` | Registre | `e5f6...4432` | **VERIFIÉ (Intact)** |
| `capture.pcap` | TAP Réseau | `a1b2...7765` | **VERIFIÉ (Intact)** |
```

---

## 3) Module — Grille de Validation du Projet S8 P3 (2h)

```markdown
## EVALUATION GRID — CAPSTONE S8 PARTIE 3

| Domaine | Critères d'Évaluation | Pondération | Statut |
|:---|:---|:---:|:---:|
| **Live Response & Triage** | Ordre de volatilité RFC 3227 & Hash SHA-256 | 25% | **VALIDÉ** |
| **NTFS & Registry Forensics** | Détection de Timestomping & UserAssist ROT13 | 25% | **VALIDÉ** |
| **Memory & Network DFIR** | Volatility 3 VAD Tree injection & PCAP dissection | 25% | **VALIDÉ** |
| **Evidence Documentation** | Super-Timeline & Rapport de preuve judiciaire | 25% | **VALIDÉ** |

**Score Final : 100/100 — CERTIFICATION INTERNE S8 PARTIE 3 OCTROYÉE**
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Incident Commander** | Responsable opérationnel pilotant la gestion globale d'un incident de sécurité majeur |
| **Super-Timeline** | Chronologie unifiée combinant tous les horodatages système, réseaux et applicatifs de l'incident |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
