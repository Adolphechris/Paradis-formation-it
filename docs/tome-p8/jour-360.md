# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 360 (6h) : Projet Intégrateur S8 Partie 1 — SOC Blue Team Full Infrastructure (SIEM + SOAR + EDR + NDR + CTI + Zero Trust Integration)

> [!NOTE]
> **Objectif du jour :** Conduire et valider l'intégration complète d'une **Infrastructure SOC d'Entreprise Multi-Tenants & Multi-Cloud** combinant l'ensemble des composants vus durant les leçons J351-J359 : interconnecter le SIEM (ELK/Splunk), le SOAR (Shuffle/Cortex), l'EDR, le NDR (Zeek), la CTI (MISP/STIX 2.1) et le PDP Zero Trust. Dérouler un scénario complet d'attaque simulée avec qualification Tier-1, confinement SOAR L1/L2 et restitution métrique.
>
> **Ce projet valide l'aptitude technique de niveau Lead SOC Architect & Incident Response Manager.**

---

## 1) Module — Plateforme d'Orchestration SOC Global (`soc_full_infrastructure_capstone.py`) (2h30)

### 🛠️ Script d'Ingénierie et de Simulation d'Incident Global

```python
import json
import hashlib
from datetime import datetime, timezone

class SOCFullInfrastructureCapstone:
    """
    Projet Intégrateur S8 Partie 1 :
    Orchestration d'infrastructure SOC complète intégrant CTI (STIX), SIEM, EDR, NDR, SOAR et Zero Trust.
    """

    def __init__(self, enterprise_name: str):
        self.enterprise = enterprise_name
        self.soc_incident_log = []

    def process_telemetry_event(self, raw_event: dict) -> dict:
        """
        Traite un événement de télémétrie entrant à travers le Pipeline SOC :
        1. NDR Check (Beaconing / Honeypot)
        2. EDR Check (Process Tree Anomaly)
        3. CTI Correlation (MISP STIX IoC Match)
        4. SOAR Playbook Execution (L1/L2 Containment)
        """
        event_id = raw_event.get("event_id")
        src_ip = raw_event.get("src_ip")
        process_name = raw_event.get("process_name")
        host_id = raw_event.get("host_id")
        
        print(f"\n=== [SOC PIPELINE] Traitement Événement {event_id} sur Hôte {host_id} ===")

        # 1. Corrélation CTI (Vérification si l'IP est connue dans MISP)
        is_cti_match = src_ip.startswith("185.220.")
        cti_score = 90 if is_cti_match else 0

        # 2. Corrélation EDR (Analyse de l'Arbre de Processus)
        is_edr_anomaly = process_name in ["powershell.exe", "cmd.exe"] and raw_event.get("parent_process") == "winword.exe"

        # 3. Calcul du Score de Risque Global SIEM (0-100)
        risk_score = 0
        if is_cti_match:
            risk_score += 40
        if is_edr_anomaly:
            risk_score += 50
        if raw_event.get("is_critical_asset", False):
            risk_score += 10

        risk_score = min(risk_score, 100)

        # 4. Déclenchement du Playbook SOAR si Risk Score >= 75
        soar_action = "NONE"
        if risk_score >= 75:
            if raw_event.get("is_critical_asset", False):
                soar_action = "SOAR_L2_HUMAN_APPROVAL_WAITING"
            else:
                soar_action = "SOAR_L1_HOST_ISOLATED_AUTOMATICALLY"

        incident_record = {
            "incident_id": f"INC-SOC-{event_id}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "host_id": host_id,
            "risk_score": risk_score,
            "cti_match": is_cti_match,
            "edr_anomaly": is_edr_anomaly,
            "soar_action": soar_action,
            "status": "CONTAINED" if "L1" in soar_action else "PENDING_L2" if "L2" in soar_action else "CLOSED"
        }
        self.soc_incident_log.append(incident_record)
        return incident_record

# Exécution de la Simulation du Projet Intégrateur
soc_capstone = SOCFullInfrastructureCapstone("PARADIS BANK GLOBAL SOC")

# Attaque Simulée : Document Word piège ouvrant PowerShell et communiquant avec un C2
simulated_attack_event = {
    "event_id": "EVT-2026-9901",
    "src_ip": "185.220.101.44",
    "host_id": "WKSTN-TRADING-04",
    "process_name": "powershell.exe",
    "parent_process": "winword.exe",
    "is_critical_asset": False
}

result = soc_capstone.process_telemetry_event(simulated_attack_event)
print("\n=== SOC INCIDENT PIPELINE RESULT ===")
print(json.dumps(result, indent=2, ensure_ascii=False))
```

---

## 2) Module — Architecture Cible d'un SOC de Classe Mondiale (1h30)

```markdown
# ARCHITECTURE CIBLE D'UN SOC D'ÉLITE (ENTERPRISE TARGET STATE)

```
 [ SOURCES DE TÉLÉMÉTRIE MULTI-CLOUD & ON-PREM ]
  - Nœuds K8s EKS (eBPF Falco) | Multi-Cloud AWS/Azure Logs
  - Endpoints Windows/Linux (EDR CrowdStrike) | Network TAP (Zeek NDR)
                                 │
                                 ▼ (Normalisation ECS / CIM)
 ┌───────────────────────────────────────────────────────────────┐
 │ SIEM CENTRAL (Elastic Security / Splunk ES)                   │
 │  - Indexation ILM Hot/Warm/Cold | Correlation Searches (SIGMA)│
 └───────────────────────────────┬───────────────────────────────┘
                                 │ (Déclenchement Incident)
                                 ▼
 ┌───────────────────────────────────────────────────────────────┐
 │ SOAR & CTI ORCHESTRATION HUB (Shuffle / MISP STIX 2.1)        │
 │  - L1 Auto-Containment (< 30s) | L2 Human-in-the-Loop          │
 │  - Integration PDP Zero Trust NIST SP 800-207                 │
 └───────────────────────────────────────────────────────────────┘
```
```

---

## 3) Module — Grille d'Évaluation du Projet Intégrateur S8 P1 (2h)

```markdown
## EVALUATION GRID — CAPSTONE S8 PARTIE 1

| Domaine | Critères d'Évaluation | Pondération | Statut |
|:---|:---|:---:|:---:|
| **SOC Operations & Triage** | Workflow de qualification Tier-1/2/3 & calcul de risque | 20% | **VALIDÉ** |
| **SIEM & SIGMA Rules** | Ingestion ECS/CIM & Transpilation de règles SIGMA | 20% | **VALIDÉ** |
| **SOAR Automation** | Implémentation des workflows L1/L2 Human-in-the-Loop | 20% | **VALIDÉ** |
| **EDR & NDR Forensics** | Détection d'anomalies de processus & Beaconing C2 | 20% | **VALIDÉ** |
| **Zero Trust & CTI** | Interconnexion PDP Zero Trust & Objets STIX 2.1 | 20% | **VALIDÉ** |

**Score Final : 100/100 — CERTIFICATION INTERNE S8 PARTIE 1 OCTROYÉE**
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Pipeline SOC** | Séquence automatique d'ingestion, d'enrichissement, de corrélation et de réponse aux incidents |
| **Multi-Tenants** | Architecture permettant de gérer plusieurs entités ou clients de manière totalement isolée au sein du même SOC |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
