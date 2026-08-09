# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 365 (6h) : Projet Intégrateur S8 Partie 2 — Full Threat Hunting & Incident Response Campaign (End-to-End Hunt, AD Attack Containment, Memory Dump Triage & Detection Rule Deployment)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre une campagne complète de **Threat Hunting et Réponse aux Incidents (Tier-3 SOC Capstone)** : partir d'une hypothèse de chasse CTI, investiguer la télémétrie système/réseau, extraire les artéfacts mémoire (Volatility 3), intercepter une chaîne d'attaque Active Directory (Kerberoasting + DCSync), procéder au confinement automatisé (SOAR) et déployer la règle de détection permanente (SIGMA).
>
> **Ce projet valide l'aptitude opérationnelle de niveau Senior Threat Hunter & Lead Incident Response Engineer.**

---

## 1) Module — Plateforme de Campaign Automation (`threat_hunting_capstone_s8.py`) (2h30)

### 🛠️ Script d'Orchestration et de Simulation de Chasse Intégrée

```python
import json
import math
from datetime import datetime, timezone

class ThreatHuntingCapstoneS8:
    """
    Projet Intégrateur S8 Partie 2 :
    Pipeline complet de Threat Hunting : Hypothèse -> Investigation Télémétrie -> Confinement SOAR -> Regle SIGMA.
    """

    def __init__(self, campaign_name: str):
        self.campaign = campaign_name
        self.timeline_events = []
        self.hunt_findings = []
        self.soar_actions = []

    def execute_end_to_end_hunt_scenario(self, raw_telemetry: list) -> dict:
        """
        Exécute la campagne de chasse guidée par l'hypothèse :
        "Attaque AD avec élévation de privilèges (DCSync) et obfuscation PowerShell."
        """
        print(f"=== [START CAMPAIGN] {self.campaign} ===")

        # 1. Phase Execution : Analyse de la Télémétrie et Filtrage des Anomalies
        for evt in raw_telemetry:
            event_id = evt.get("event_id")
            host = evt.get("host")
            user = evt.get("user")
            cmdline = evt.get("cmdline", "")

            # Check 1 : Attaque Active Directory DCSync (Event ID 4662 sur non-DC IP)
            if event_id == 4662 and evt.get("is_dc") is False:
                finding = {
                    "type": "CRITICAL_AD_ATTACK",
                    "technique": "T1003.006 - DCSync",
                    "host": host,
                    "user": user,
                    "details": "Tentative d'extraction des secrets AD via réplication non autorisée."
                }
                self.hunt_findings.append(finding)
                # Confinement SOAR L1 Immédiat
                self._trigger_soar_containment(host, user, "ISOLATE_HOST_AND_REVOKE_KERBEROS")

            # Check 2 : Exécution PowerShell Obfusquée
            if "powershell.exe" in cmdline.lower() and ("-enc" in cmdline.lower() or "amsiutils" in cmdline.lower()):
                finding = {
                    "type": "OBFUSCATED_POWERSHELL_EXECUTION",
                    "technique": "T1059.001 - PowerShell",
                    "host": host,
                    "user": user,
                    "details": f"PowerShell obfusqué détecté : {cmdline[:60]}..."
                }
                self.hunt_findings.append(finding)

        # 2. Phase Knowledge Elaboration : Génération de la Règle SIGMA
        sigma_rule = self._generate_permanent_sigma_rule()

        return {
            "campaign_name": self.campaign,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "telemetry_analyzed_count": len(raw_telemetry),
            "threats_discovered": self.hunt_findings,
            "actions_executed": self.soar_actions,
            "generated_sigma_rule": sigma_rule
        }

    def _trigger_soar_containment(self, host: str, user: str, action: str):
        action_record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "host": host,
            "user": user,
            "action": action,
            "status": "SUCCESSFULLY_CONTAINED"
        }
        self.soar_actions.append(action_record)
        print(f"[!] SOAR AUTO-CONTAINMENT -> Hôte {host} isolé | Session {user} révoquée.")

    def _generate_permanent_sigma_rule(self) -> dict:
        return {
            "title": "DCSync and Obfuscated PowerShell Hunt Detection",
            "id": "a9f82c11-9988-4a22-paradis365",
            "status": "production",
            "logsource": {"product": "windows", "category": "process_creation"},
            "detection": {
                "selection": {"Image|endswith": "\\powershell.exe", "CommandLine|contains": "AmsiUtils"},
                "condition": "selection"
            },
            "level": "critical"
        }

# Simulation de la Campagne Intégrée
telemetry_data = [
    {"event_id": 1, "host": "WKSTN-01", "user": "alice", "cmdline": "dir C:\\Users", "is_dc": False},
    {"event_id": 4662, "host": "WKSTN-TRADING-09", "user": "paradis\\attacker", "cmdline": "", "is_dc": False},
    {"event_id": 1, "host": "WKSTN-TRADING-09", "user": "paradis\\attacker", "cmdline": "powershell.exe -Enc SQBFAFgA...", "is_dc": False}
]

capstone = ThreatHuntingCapstoneS8("CAMPAIGN-HUNT-S8-P2")
report = capstone.execute_end_to_end_hunt_scenario(telemetry_data)

print("\n=== THREAT HUNTING CAPSTONE FINAL REPORT ===")
print(json.dumps(report, indent=2, ensure_ascii=False))
```

---

## 2) Module — Matrice de Clôture d'Incident & RETEX (1h30)

```markdown
# INCIDENT RETEX & LESSONS LEARNED REPORT (CAPSTONE S8 P2)

## 1. Timeline de la Menace Traquée
- **04:15:00 UTC :** Formulation de l'hypothèse de chasse sur la persistence PowerShell et les abus Kerberos.
- **04:18:20 UTC :** Identification d'un événement DCSync (Event ID 4662) émis par `WKSTN-TRADING-09`.
- **04:18:25 UTC :** Déclenchement automatique du playbook SOAR : Isolement réseau de `WKSTN-TRADING-09` et révocation de session.
- **04:25:00 UTC :** Conversion de l'hypothèse valider en règle de détection permanente SIGMA `a9f82c11`.

## 2. Plan d'Amélioration des Contrôles Défensifs
1. Restreindre les privilèges de réplication AD (DCSync) via une revue stricte des ACLs des contrôleurs de domaine.
2. Déployer la signature SIGMA générée sur l'ensemble des clusters Elastic Security et Splunk.
```

---

## 3) Module — Grille de Validation du Projet S8 P2 (2h)

```markdown
## EVALUATION GRID — CAPSTONE S8 PARTIE 2

| Domaine | Critères d'Évaluation | Pondération | Statut |
|:---|:---|:---:|:---:|
| **PEAK Threat Hunting** | Formulation de l'hypothèse & analyse de télémétrie | 25% | **VALIDÉ** |
| **AD Threat Detection** | Identification de la chaîne d'attaque (DCSync/Kerberos) | 25% | **VALIDÉ** |
| **SOAR Containment** | Orchestration automatique du confinement d'hôte et de session | 25% | **VALIDÉ** |
| **Detection Engineering** | Publication de la règle SIGMA permanente issue du Hunting | 25% | **VALIDÉ** |

**Score Final : 100/100 — CERTIFICATION INTERNE S8 PARTIE 2 OCTROYÉE**
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **RETEX** | Retour d'Expérience — Analyse post-incident visant à améliorer les processus et les défenses |
| **Detection Pipeline** | Chaîne d'intégration continue permettant de transformer les découvertes de chasse en règles SIEM permanentes |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
