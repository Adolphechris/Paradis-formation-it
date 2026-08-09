# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 355 (6h) : SOC Automation & SOAR — Orchestration de la Réponse aux Incidents (Security Orchestration, Automation & Response — Cortex XSOAR, Shuffle.io & Open-Source SOAR Engineering)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'ingénierie et l'architecture **SOAR (Security Orchestration, Automation and Response)** de classe entreprise : concevoir des **Playbooks d'orchestration multi-outils** (SIEM, EDR, Firewall, IAM, Threat Intel), implémenter un **moteur SOAR en Python/Shuffle** gérant les niveaux d'automatisation (L1 Fully-Automated, L2 Human-in-the-Loop avec approbation interactive, L3 Human-Led), mesurer la réduction du **MTTR (Mean Time to Respond)** et éliminer la fatigue décisionnelle des analystes SOC.
>
> **Compétences visées :** `SOAR-01` (A) — Enterprise SOAR Architecture & Playbook Engineering | `SOAR-02` (A) — Incident Orchestration, Multi-API Integration & Human-in-the-Loop Workflows

---

## 1) Module — Architecture SOAR & Niveaux d'Orchestration (2h)

### 📖 Narration/Intuition

Un SOC sans SOAR est submergé par les alertes répétitives (des milliers par jour). Le SOAR ne se contente pas de scripts isolés : il orchestre les API de **l'intégralité du stack de sécurité** pour exécuter des actions coordonnées en quelques secondes.

```
       ┌─────────────────────────────────────────────────────────────┐
       │             ALERTE SIEM / EDR / EMAIL PHISHING              │
       └──────────────────────────────┬──────────────────────────────┘
                                      │ (Webhook Event)
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                  SOAR ORCHESTRATION ENGINE                  │
       │  (Enrichissement IoC -> Décision Heuristique -> Exec Playbook)│
       └──────┬───────────────────────┬───────────────────────┬──────┘
              │                       │                       │
              ▼                       ▼                       ▼
    [ API EDR (CrowdStrike) ] [ API Firewall (PaloAlto) ] [ API IAM (Okta/Vault) ]
    Isolement du Poste        Blocage de l'IP C2          Révocation de Session
```

#### Modèle d'Autonomie des Playbooks (Automation Taxonomy)

| Niveau | Désignation | Mode d'Exécution | Cas d'Usage SOC | MTTR Cible |
|:---:|:---|:---|:---|:---:|
| **L1** | **Fully Automated** | 100% Automatique sans validation | Isolation hôte si Ransomware avéré, Blocage IP C2 | **< 30s** |
| **L2** | **Human-in-the-Loop** | Action pré-calculée, clic d'approbation analyste | Révocation de compte VIP, Quarantaine email interne | **< 5 min** |
| **L3** | **Human-Led** | Collecte automatique, décision 100% humaine | Investigation APT, Réponse légale / Notification CNIL | **< 2h** |

---

## 2) Module — Moteur SOAR & Orchestrateur de Playbooks (`soar_orchestrator.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import requests
import hashlib
from datetime import datetime, timezone
from typing import Dict, List, Optional, Callable

class SOAROrchestrator:
    """
    Moteur SOAR d'entreprise (Security Orchestration, Automation and Response).
    Orchestre l'enrichissement CTI, le confinement EDR/Firewall et les approbations L2.
    """

    def __init__(self, edr_api_url: str, firewall_api_url: str, cti_api_key: str):
        self.edr_url = edr_api_url
        self.fw_url = firewall_api_url
        self.cti_key = cti_api_key
        self.pending_approvals: Dict[str, dict] = {}
        self.audit_log: List[dict] = []

    def _log_action(self, playbook: str, step: str, status: str, details: dict):
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "playbook": playbook,
            "step": step,
            "status": status,
            "details": details
        }
        self.audit_log.append(entry)
        print(f"[{entry['timestamp']}] [SOAR:{playbook}] [{step}] {status} -> {details}")

    def enrich_ioc_virustotal(self, ioc: str, ioc_type: str) -> dict:
        """Enrichissement CTI simulé pour valider le score de réputation d'un IoC."""
        # Simulation d'appel API Threat Intel
        ioc_hash = hashlib.sha256(ioc.encode()).hexdigest()
        is_malicious = ioc.startswith("185.") or ioc.endswith(".exe") or "malware" in ioc
        score = 85 if is_malicious else 0
        return {"ioc": ioc, "type": ioc_type, "malicious_score": score, "verdict": "MALICIOUS" if is_malicious else "CLEAN"}

    def execute_edr_host_isolation(self, agent_id: str) -> bool:
        """API Action: Isoler une machine du réseau via l'agent EDR."""
        self._log_action("CONTAINMENT_PLAYBOOK", "EDR_ISOLATE", "SUCCESS", {"agent_id": agent_id, "action": "NETWORK_ISOLATION_APPLIED"})
        return True

    def execute_firewall_block_ip(self, ip_address: str) -> bool:
        """API Action: Injecter une règle de blocage IP sur le Pare-Feu de bordure."""
        self._log_action("CONTAINMENT_PLAYBOOK", "FIREWALL_BLOCK", "SUCCESS", {"blocked_ip": ip_address, "duration": "30_DAYS"})
        return True

    def run_phishing_response_playbook(self, alert_data: dict) -> dict:
        """
        Playbook L1/L2 : Réponse automatisée aux attaques de Phishing / Ransomware.
        - L1 : Enrichissement + Blocage IP C2 immédiat.
        - L2 : Isolation poste soumise à validation si l'hôte est un serveur critique.
        """
        alert_id = alert_data["alert_id"]
        source_ip = alert_data.get("source_ip")
        host_id = alert_data.get("host_id")
        is_critical_host = alert_data.get("is_critical_host", False)

        print(f"\n=== Lancement Playbook SOAR: PHISHING_RANSOMWARE_RESPONSE [{alert_id}] ===")

        # Étape 1 : Enrichissement CTI
        cti_res = self.enrich_ioc_virustotal(source_ip, "IP")
        self._log_action("PHISHING_PLAYBOOK", "CTI_ENRICHMENT", "COMPLETED", cti_res)

        # Étape 2 : Blocage IP C2 (L1 - 100% Automatique)
        if cti_res["verdict"] == "MALICIOUS":
            self.execute_firewall_block_ip(source_ip)

        # Étape 3 : Confinement Hôte (L1 si poste standard, L2 si Serveur Critique)
        if is_critical_host:
            # Workflow L2 Human-in-the-Loop : Création d'une demande d'approbation
            self.pending_approvals[alert_id] = {
                "alert_id": alert_id,
                "host_id": host_id,
                "action": "ISOLATE_CRITICAL_SERVER",
                "requested_at": datetime.now(timezone.utc).isoformat()
            }
            self._log_action("PHISHING_PLAYBOOK", "HUMAN_APPROVAL_REQUESTED", "WAITING", {"alert_id": alert_id, "host": host_id})
            return {"status": "WAITING_HUMAN_APPROVAL", "alert_id": alert_id}
        else:
            # Workflow L1 : Isolation directe
            self.execute_edr_host_isolation(host_id)
            return {"status": "PLAYBOOK_EXECUTED_FULLY_L1", "alert_id": alert_id}

    def approve_l2_action(self, alert_id: str, analyst_id: str, approved: bool) -> dict:
        """Valide ou rejette une demande d'action L2 par un analyste SOC."""
        if alert_id not in self.pending_approvals:
            return {"status": "ERROR", "message": "Aucune approbation en attente."}

        req = self.pending_approvals.pop(alert_id)
        if approved:
            self.execute_edr_host_isolation(req["host_id"])
            self._log_action("PHISHING_PLAYBOOK", "L2_APPROVAL_GRANTED", "APPROVED", {"analyst": analyst_id, "host": req["host_id"]})
            return {"status": "APPROVED_AND_EXECUTED", "alert_id": alert_id}
        else:
            self._log_action("PHISHING_PLAYBOOK", "L2_APPROVAL_REJECTED", "REJECTED", {"analyst": analyst_id})
            return {"status": "REJECTED_BY_ANALYST", "alert_id": alert_id}

# Démonstration Opérationnelle SOAR
soar = SOAROrchestrator("https://edr.paradis.internal/api", "https://fw.paradis.internal/api", "cti_key_sec_9912")

# Alerte 1 : Poste de travail standard infecté (L1 -> Fully Automated)
alert_workstation = {
    "alert_id": "ALT-SOAR-101",
    "source_ip": "185.220.101.50",
    "host_id": "WKSTN-FINANCE-88",
    "is_critical_host": False
}
res1 = soar.run_phishing_response_playbook(alert_workstation)

# Alerte 2 : Serveur de Base de Données Core Banking infecté (L2 -> Human-in-the-Loop)
alert_db_server = {
    "alert_id": "ALT-SOAR-102",
    "source_ip": "185.220.101.99",
    "host_id": "DB-CORE-BANKING-01",
    "is_critical_host": True
}
res2 = soar.run_phishing_response_playbook(alert_db_server)

# Approbation manuelle L2 par l'Analyste SOC Senior
print("\n--- Validation Interactive Analyste SOC (L2 Approval) ---")
approval_res = soar.approve_l2_action("ALT-SOAR-102", analyst_id="analyst_sec_lead", approved=True)
```

---

## 3) Module — Fiche d'Architecture Playbook Shuffle.io / XSOAR (2h)

```yaml
# SHUFFLE.IO / XSOAR PLAYBOOK SPECIFICATION (OPEN-SOURCE SOAR)
name: Incident_Response_Ransomware_Containment
description: Playbook d'isolation automatique et d'enrichissement lors d'une alerte EDR Ransomware.
trigger:
  type: Webhook
  source: CrowdStrike_Falcon_Event
nodes:
  - name: Parse_Event
    type: Code
    params:
      language: python
      code: "output = {'agent_id': input['event']['SensorId'], 'ip': input['event']['LocalIP']}"
  
  - name: Enrich_IP_ThreatIntel
    type: HTTP_Request
    params:
      url: "https://virustotal.com/api/v3/ip_addresses/{Parse_Event.ip}"
      headers:
        x-apikey: "$ENV_VT_API_KEY"
  
  - name: Condition_Check_Severity
    type: Router
    conditions:
      - if: "Enrich_IP_ThreatIntel.data.attributes.last_analysis_stats.malicious > 5"
        next: Isolate_Host_EDR
      - else: Escalate_Tier2_Analyst

  - name: Isolate_Host_EDR
    type: App_Crowdstrike
    action: contain_host
    params:
      device_id: "{Parse_Event.agent_id}"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SOAR** | Security Orchestration, Automation and Response — Plateforme centralisée d'exécution de playbooks de réponse |
| **MTTR** | Mean Time to Respond — Temps moyen écoulé entre le déclenchement d'une alerte et sa neutralisation |
| **Human-in-the-Loop** | Mode de fonctionnement où l'automatisation prépare les actions mais exige la validation d'un analyste |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle est la différence fondamentale entre un simple script Bash/Python de réponse et une plateforme **SOAR** d'entreprise ?
- A) Le SOAR orchestre graphiquement des flux complexes multi-outils (SIEM, EDR, FW, IAM), gère l'état des incidents, conserve la piste d'audit centralisée et supporte des validations interactives humaines (Human-in-the-Loop)
- B) Le SOAR ne fonctionne qu'en mode texte
- C) Les scripts sont réservés à Linux, le SOAR à Windows
- D) Il n'y a aucune différence

**Réponse : A**

**Q2 :** Dans la taxonomie d'automatisation SOAR, quel est le mode recommandé pour l'isolement d'un **serveur de base de données de production critique** ?
- A) Mode L2 (Human-in-the-Loop) : Le SOAR enrichit les données et prépare l'ordre d'isolement, mais exige la validation en un clic d'un analyste/CISO pour éviter un arrêt d'activité accidentel
- B) Mode L1 (Fully Automated) sans vérification
- C) Pas d'action possible
- D) Redémarrage physique de la machine

**Réponse : A**

**Q3 :** Comment le SOAR contribue-t-il directement à réduire la **fatigue des analystes (Alert Fatigue)** dans le SOC ?
- A) En prenant en charge 100% des tâches répétitives de qualification et de fermeture des faux positifs évidents (L1), permettant aux analystes de concentrer leur attention sur les menaces réelles
- B) En supprimant les logs
- C) En éteignant les écrans du SOC la nuit
- D) En remplaçant l'équipe de direction

**Réponse : A**

**Q4 :** Quel est le standard ouvert populaire de plateforme SOAR permettant de concevoir des workflows sous forme de graphes nodaux d'APIs ?
- A) Shuffle.io
- B) Notepad++
- C) Wireshark
- D) Nmap

**Réponse : A**

**Q5 :** Quelle métrique clé du SOC est directement améliorée par l'implémentation de playbooks de confinement automatique SOAR ?
- A) Le MTTR (Mean Time to Respond), qui passe de plusieurs heures à quelques secondes
- B) Le coût du matériel serveur
- C) Le nombre de lignes de code
- D) La vitesse de connexion Internet du bureau

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
