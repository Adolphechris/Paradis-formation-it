# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 385 (6h) : Projet Intégrateur S8 Partie 6 — Full Red Team Campaign & IOC Handoff Report (End-to-End Operation, C2 Chaining, AD Domain Takeover & Blue Team Remediation Handoff)

> [!NOTE]
> **Objectif du jour :** Conduire et finaliser le **Projet Intégrateur S8 Partie 6** — une campagne **Red Team d'entreprise complète** simulant la compromission totale d'une infrastructure d'entreprise : de l'accès initial Web/Phishing au déploiement du C2 (Havoc/Cobalt), en passant par le pivotement Active Directory (BloodHound + Pass-the-Hash) et l'exfiltration Cloud, jusqu'à la rédaction du **Rapport de Handoff IoC & Recommandations Défensives**.
>
> **Ce projet valide l'aptitude technique et la vision stratégique de niveau Red Team Lead / Principal Security Consultant.**

---

## 1) Module — Plateforme d'Orchestration de Campagne Red Team (`redteam_full_campaign_capstone.py`) (2h30)

### 🛠️ Script d'Orchestration de la Campagne Red Team

```python
import json
import secrets
from datetime import datetime, timezone
from typing import List, Dict

class RedTeamFullCampaignCapstone:
    """
    Projet Intégrateur S8 Partie 6 :
    Conduite d'une opération Red Team complète et génération du rapport de Handoff Blue Team.
    """

    def __init__(self, operation_codename: str, target_enterprise: str):
        self.operation = operation_codename
        self.target = target_enterprise
        self.killchain_phases: List[dict] = []
        self.generated_iocs: List[dict] = []

    def execute_phase(self, phase_name: str, mitre_tactic: str, technique_used: str, details: str, iocs: List[dict]) -> dict:
        """Enregistre une phase franchie dans la Cyber Kill Chain de l'opération."""
        phase_record = {
            "phase_number": len(self.killchain_phases) + 1,
            "phase_name": phase_name,
            "mitre_tactic": mitre_tactic,
            "technique_used": technique_used,
            "details": details,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.killchain_phases.append(phase_record)
        self.generated_iocs.extend(iocs)
        print(f"  [KILLCHAIN PHASE {phase_record['phase_number']}] {phase_name} ({mitre_tactic}) -> {technique_used}")
        return phase_record

    def generate_blue_team_handoff_report(property) -> dict:
        """Génère le rapport de restitution complet avec la liste des IoCs et les remédiations."""
        return {
            "operation_codename": property.operation,
            "target_enterprise": property.target,
            "report_generated_at": datetime.now(timezone.utc).isoformat(),
            "overall_result": "OBJECTIFS ATTEINTS — COMPROMISSION TOTALE DU DOMAINE ET DU CLOUD",
            "killchain_summary": property.killchain_phases,
            "artifacts_and_iocs_for_blue_team": property.generated_iocs,
            "top_remediations_recommended": [
                "1. Déployer la validation stricte de l'argument redirect_uri sur le serveur OAuth",
                "2. Bloquer l'accès à l'IMDS AWS (169.254.169.254) depuis les conteneurs web (IMDSv2 obligatoire)",
                "3. Supprimer les droits WriteDACL de l'attribut d'objet AD du compte Service Backup",
                "4. Restreindre l'utilisation de WMI et SMB entre les postes de travail utilisateurs"
            ]
        }

# Exécution de la Simulation de Campagne Red Team
capstone = RedTeamFullCampaignCapstone("OP-RED-PHOENIX-2026", "PARADIS ENTERPRISE BANK")

print("=== FULL RED TEAM CAMPAIGN CAPSTONE S8 PARTIE 6 ===")

# Phase 1 : Initial Access via SSRF
capstone.execute_phase(
    phase_name="Initial Access & Cloud Pivoting",
    mitre_tactic="TA0001 - Initial Access",
    technique_used="T1190 - Exploit Public-Facing Application (SSRF IMDS)",
    details="Exploitation SSRF sur /fetch_avatar -> Extraction des clés IAM DevRole.",
    iocs=[{"type": "IP", "value": "185.220.101.88", "description": "VPS Attaquant Initial"}]
)

# Phase 2 : C2 Infrastructure & Beaconing
capstone.execute_phase(
    phase_name="C2 Deployment & Evasion",
    mitre_tactic="TA0011 - Command and Control",
    technique_used="T1071.001 - Web Protocols (Havoc C2 HTTPS)",
    details="Déploiement du Beacon HTTPS avec profil Malleable C2 Office 365.",
    iocs=[{"type": "DOMAIN", "value": "cdn-assets.paradis-legitime.com", "description": "Redirecteur C2 HTTPS"}]
)

# Phase 3 : Privilege Escalation & Lateral Movement
capstone.execute_phase(
    phase_name="Active Directory Compromise",
    mitre_tactic="TA0008 - Lateral Movement",
    technique_used="T1550.002 - Pass-the-Hash & WMI Remote",
    details="Pass-the-Hash avec le compte svc_backup -> Pivoting WMI sur SRV-BACKUP-01.",
    iocs=[{"type": "HASH", "value": "E52660B051FE90E71234567890ABCDEF", "description": "NTLM Hash svc_backup"}]
)

# Phase 4 : Domain Takeover & Persistence
capstone.execute_phase(
    phase_name="Domain Admin Takeover & Persistence",
    mitre_tactic="TA0004 - Privilege Escalation",
    technique_used="T1003.006 - DCSync (DRSUAPI Replication)",
    details="Extraction de l'ensemble des hashes NTLM du domaine via DCSync.",
    iocs=[{"type": "ACCOUNT", "value": "PARADIS\\Administrator", "description": "Compte Administrateur du Domaine Compromis"}]
)

print("\n=== BLUE TEAM HANDOFF REPORT ===")
report = capstone.generate_blue_team_handoff_report()
print(json.dumps(report, indent=2, ensure_ascii=False))
```

---

## 2) Module — Grille de Validation Capstone S8 P6 (1h30)

```markdown
## EVALUATION GRID — CAPSTONE S8 PARTIE 6

| Domaine | Critères d'Évaluation | Pondération | Statut |
|:---|:---|:---:|:---:|
| **Initial Access & Web** | Exploitation SSRF/SSTI & extraction de métadonnées | 25% | **VALIDÉ** |
| **C2 & OPSEC** | Architecture redirecteurs, C2 Malleable, IP burning | 25% | **VALIDÉ** |
| **AD Takeover** | Chemins BloodHound, Pass-the-Hash & DCSync | 25% | **VALIDÉ** |
| **Blue Team Handoff** | Restitution des IoCs & plan de remédiation priorisé | 25% | **VALIDÉ** |

**Score Final : 100/100 — CERTIFICATION INTERNE S8 PARTIE 6 OCTROYÉE**
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Handoff Report** | Rapport de restitution transmis par l'équipe Red Team à l'équipe Blue Team avec tous les IoCs |
| **Cyber Kill Chain** | Modèle décrivant les 7 phases successives d'une cyberattaque |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
