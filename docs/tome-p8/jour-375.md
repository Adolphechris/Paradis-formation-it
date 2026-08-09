# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 375 (6h) : Projet Intégrateur S8 Partie 4 — Malware Analysis & Purple Team Full Simulation (Static PE Analysis + Dynamic Sandbox + Ransomware IRP + Purple Team ATT&CK Scoring)

> [!NOTE]
> **Objectif du jour :** Conduire le **Projet Intégrateur S8 Partie 4** — une simulation de bout en bout combinant l'analyse de malware (statique + dynamique) d'un sample Ransomware réel, la déclenchement et la qualification de l'incident (IRP Ransomware Runbook), et la mesure de la couverture défensive via un mini-exercice Purple Team ciblé. Générer le rapport de synthèse exécutif (Executive Board Report).
>
> **Ce projet valide l'aptitude Malware Analyst + Incident Commander + Purple Team Lead de niveau Expert Sécurité Offensive / Défensive.**

---

## 1) Module — Plateforme d'Analyse & de Réponse Intégrée (`malware_purple_capstone.py`) (2h30)

### 🛠️ Script d'Orchestration Multi-Domaine

```python
import json
import math
import hashlib
from datetime import datetime, timezone
from typing import List, Dict

class MalwarePurpleCapstone:
    """
    Projet Intégrateur S8 Partie 4 :
    Pipeline complet : Analyse Statique PE -> Sandbox Comportementale -> IRP Ransomware -> Purple Team Scoring.
    """

    def __init__(self, case_id: str):
        self.case_id = case_id
        self.analysis_phases: Dict[str, dict] = {}

    def phase1_static_analysis(self, sample_bytes: bytes, imports: List[str]) -> dict:
        """Phase 1 : Analyse Statique du binaire PE."""
        # Calcul de l'Entropie de Shannon
        freq = {}
        for b in sample_bytes:
            freq[b] = freq.get(b, 0) + 1
        entropy = sum(-( c/len(sample_bytes)) * math.log2(c/len(sample_bytes)) for c in freq.values())

        # Détection d'imports critiques
        critical_imports = {"CryptEncrypt", "VirtualAllocEx", "IsDebuggerPresent"}
        found_suspicious = [i for i in imports if i in critical_imports]

        result = {
            "sha256": hashlib.sha256(sample_bytes).hexdigest(),
            "entropy": round(entropy, 2),
            "is_packed": entropy > 7.0,
            "suspicious_imports": found_suspicious,
            "verdict": "MALICIOUS" if found_suspicious else "SUSPICIOUS"
        }
        self.analysis_phases["static_analysis"] = result
        print(f"[PHASE 1 - STATIC] SHA256: {result['sha256'][:16]}... | Entropy: {result['entropy']} | Verdict: {result['verdict']}")
        return result

    def phase2_dynamic_sandbox(self, api_calls: List[str], c2_ip: str) -> dict:
        """Phase 2 : Simulation des Résultats d'Analyse Dynamique en Sandbox."""
        mitre_mapping = {
            "VirtualAllocEx": "T1055 - Process Injection",
            "CryptEncrypt": "T1486 - Data Encrypted for Impact",
            "RegSetValueExA": "T1547.001 - Registry Run Key Persistence",
            "IsDebuggerPresent": "T1497 - Sandbox Evasion"
        }
        detected_techniques = {mitre_mapping[a] for a in api_calls if a in mitre_mapping}

        result = {
            "api_calls_traced": len(api_calls),
            "c2_connection_detected": c2_ip,
            "mitre_techniques": list(detected_techniques),
            "behavioral_score": len(detected_techniques) * 25,
            "verdict": "RANSOMWARE_CONFIRMED"
        }
        self.analysis_phases["dynamic_sandbox"] = result
        print(f"[PHASE 2 - SANDBOX] C2: {c2_ip} | Techniques MITRE: {len(detected_techniques)} | Score: {result['behavioral_score']}")
        return result

    def phase3_ransomware_irp(self, encrypted_file_count: int, affected_hosts: int) -> dict:
        """Phase 3 : Exécution du Runbook IRP Ransomware."""
        result = {
            "blast_radius": {"encrypted_files": encrypted_file_count, "affected_hosts": affected_hosts},
            "containment_actions": [
                "NETWORK_ISOLATE_SEGMENT",
                "DISABLE_COMPROMISED_ACCOUNTS",
                "REVOKE_VPN_SESSIONS",
                "BLOCK_C2_IPS_FIREWALL",
                "PRESERVE_EVIDENCE_MEMORY"
            ],
            "recovery_eta_hours": 4
        }
        self.analysis_phases["ransomware_irp"] = result
        print(f"[PHASE 3 - IRP] {encrypted_file_count} fichiers chiffrés | {affected_hosts} hôtes | RTO: 4h")
        return result

    def phase4_purple_team_scoring(self, detection_results: Dict[str, bool]) -> dict:
        """Phase 4 : Scoring Purple Team — Taux de couverture ATT&CK."""
        total = len(detection_results)
        detected = sum(1 for v in detection_results.values() if v)
        coverage_pct = round(detected / total * 100, 1)

        result = {
            "ttps_tested": total,
            "detected": detected,
            "missed": total - detected,
            "coverage_pct": coverage_pct,
            "verdict": "ACCEPTABLE (>70%)" if coverage_pct >= 70 else "INSUFFICIENT (<70%) — IMMEDIATE REMEDIATION REQUIRED"
        }
        self.analysis_phases["purple_team_scoring"] = result
        print(f"[PHASE 4 - PURPLE] Couverture ATT&CK: {coverage_pct}% ({detected}/{total} TTPs détectés)")
        return result

    def generate_board_report(self) -> dict:
        return {
            "case_id": self.case_id,
            "report_date": datetime.now(timezone.utc).isoformat(),
            "executive_summary": "Attaque Ransomware confirmée (LockBit 3.0 variant). Confinement exécuté. Reprise en 4h. Couverture SOC insuffisante sur la phase Evasion — remédiations priorisées.",
            "phases": self.analysis_phases
        }

# Exécution de la Simulation Intégrée
capstone = MalwarePurpleCapstone("CASE-CAPSTONE-S8-P4")

print("=== MALWARE ANALYSIS + PURPLE TEAM CAPSTONE S8 PARTIE 4 ===")

capstone.phase1_static_analysis(b"MZ\x90\x00" + b"\xef" * 512, ["CryptEncrypt", "VirtualAllocEx", "IsDebuggerPresent"])
capstone.phase2_dynamic_sandbox(["VirtualAllocEx", "CryptEncrypt", "RegSetValueExA"], "185.220.101.5")
capstone.phase3_ransomware_irp(encrypted_file_count=4780, affected_hosts=32)
capstone.phase4_purple_team_scoring({
    "T1059.001 - Obfuscated PowerShell": True,
    "T1003.006 - DCSync": True,
    "T1218.011 - Rundll32 LOLBin": False,
    "T1486 - Data Encrypted for Impact": True,
    "T1497 - Sandbox Evasion": False
})

print("\n=== EXECUTIVE BOARD REPORT ===")
board_report = capstone.generate_board_report()
print(json.dumps(board_report, indent=2, ensure_ascii=False))
```

---

## 2) Module — Grille de Validation Capstone S8 P4 (1h30)

```markdown
## EVALUATION GRID — CAPSTONE S8 PARTIE 4

| Domaine | Critères d'Évaluation | Pondération | Statut |
|:---|:---|:---:|:---:|
| **Analyse Statique PE** | Entropie Shannon, IAT analysis, YARA rule | 25% | **VALIDÉ** |
| **Analyse Dynamique Sandbox** | API Call tracing, MITRE mapping, behavioral score | 25% | **VALIDÉ** |
| **IRP Ransomware** | Blast Radius, Runbook IRP, Recovery RTO/RPO | 25% | **VALIDÉ** |
| **Purple Team Scoring** | Taux de couverture ATT&CK & Gap Analysis | 25% | **VALIDÉ** |

**Score Final : 100/100 — CERTIFICATION INTERNE S8 PARTIE 4 OCTROYÉE**
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Executive Board Report** | Rapport de niveau Direction résumant l'impact business, les décisions prises et le plan de remédiation |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
