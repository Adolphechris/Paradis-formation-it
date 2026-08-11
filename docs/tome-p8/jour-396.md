# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 396 (6h) : SOC Advanced Automation & Orchestration — Cross-Tool Orchestration, Custom Integrations, API Security, Workflow Optimization & BCC SOC Automation Architecture

> [!NOTE]
> **Objectif du jour :** Maîtriser l'automatisation et l'orchestration avancées dans un SOC : concevoir des workflows cross-tools, développer des intégrations API personnalisées, sécuriser les APIs SOC, optimiser les processus, et architecturer une plateforme d'automatisation pour le SOC BCC.
>
> **Compétences visées :** `SOC-AUTO-01` (A) — Cross-Tool Orchestration & Custom Integrations | `SOC-AUTO-02` (A) — API Security, Workflow Optimization & SOC Automation Architecture

---

## 1) Module — Cross-Tool Orchestration & Custom Integrations (2h)

### 📖 Narration/Intuition

Un SOC moderne utilise 10+ outils (SIEM, EDR, SOAR, ITSM, CTI, Email, Firewall, etc.). Sans orchestration, les analystes passent leur temps à basculer entre interfaces et à copier-coller des informations. L'orchestration automatise ces flux de travail entre outils.

```
[ SANS ORCHESTRATION ]               [ AVEC ORCHESTRATION ]

Analyste reçoit alerte
         │
    ┌────┴────┐
    ▼         ▼
Consulter   Copier-coller
SIEM        vers ticket
    │         │
    ▼         ▼
Consulter   Mettre à jour
EDR         ticket manuellement
    │         │
    ▼         ▼
Consulter   Envoyer email
Firewall    manuellement
    │         │
    ▼         ▼
Temps : 45min                    Temps : 30sec
Erreurs : fréquentes             Erreurs : 0
```

### Patterns d'Orchestration

| Pattern | Description | Exemple BCC |
|:---|:---|:---|
| **Fan-Out** | Une alerte déclenche des actions parallèles | EDR + Firewall + Ticket simultanément |
| **Fan-In** | Plusieurs sources alimentent un workflow | SIEM + EDR + NDR → Corrélation |
| **Chain** | Actions séquentielles avec dépendances | Détecter → Enrichir → Répondre → Documenter |
| **Router** | Routage dynamique selon le contexte | Incident critique → CISO, Incident moyen → SOC |
| **Saga** | Workflow distribué avec compensation | Orchestration multi-étapes avec rollback |

---

## 2) Module — SOC Automation Engine (`soc_automation_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict, Optional
from enum import Enum

class ActionType(Enum):
    ISOLATE = "ISOLATE"
    BLOCK = "BLOCK"
    QUARANTINE = "QUARANTINE"
    NOTIFY = "NOTIFY"
    TICKET = "TICKET"
    ENRICH = "ENRICH"

class AutomationEngine:
    """
    Moteur d'automatisation SOC pour orchestration cross-tools.
    Gère les workflows, intégrations et API calls.
    """

    def __init__(self, org_name: str = "BCC"):
        self.org_name = org_name
        self.integrations: Dict[str, dict] = {}
        self.workflows: List[dict] = []
        self.executions: List[dict] = []

    def register_integration(self, integration_id: str, name: str, tool_type: str,
                             endpoint: str, api_key: str, capabilities: List[str]) -> dict:
        """Enregistre une intégration d'outil."""
        integration = {
            "integration_id": integration_id,
            "name": name,
            "tool_type": tool_type,
            "endpoint": endpoint,
            "api_key": api_key[:8] + "****",  # Masqué
            "capabilities": capabilities,
            "status": "ACTIVE",
            "registered_at": datetime.now(timezone.utc).isoformat()
        }
        self.integrations[integration_id] = integration
        return integration

    def create_workflow(self, workflow_id: str, name: str, trigger: str,
                        steps: List[dict], description: str = "") -> dict:
        """Crée un workflow d'automatisation."""
        workflow = {
            "workflow_id": workflow_id,
            "name": name,
            "trigger": trigger,
            "steps": steps,
            "description": description,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.workflows.append(workflow)
        return workflow

    def execute_workflow(self, workflow_id: str, context: dict) -> dict:
        """Exécute un workflow d'automatisation."""
        workflow = next((w for w in self.workflows if w["workflow_id"] == workflow_id), None)
        if not workflow:
            return {"status": "ERROR", "message": "Workflow not found"}

        execution = {
            "workflow_id": workflow_id,
            "context": context,
            "steps_executed": [],
            "status": "SUCCESS",
            "executed_at": datetime.now(timezone.utc).isoformat()
        }

        for step in workflow["steps"]:
            step_result = {
                "step_id": step["id"],
                "action": step["action"],
                "tool": step.get("tool"),
                "status": "SUCCESS",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            execution["steps_executed"].append(step_result)

        self.executions.append(execution)
        return execution

    def get_automation_dashboard(self) -> dict:
        """Dashboard d'automatisation SOC."""
        return {
            "organisation": self.org_name,
            "integrations": len(self.integrations),
            "workflows": len(self.workflows),
            "executions": len(self.executions),
            "success_rate": 100.0  # Simulation
        }


# --- Démonstration ---
print("=== SOC AUTOMATION ENGINE DEMONSTRATION ===")

auto = AutomationEngine(org_name="BCC")

# Enregistrement des intégrations
integrations = [
    ("INT-001", "Splunk SIEM", "SIEM", "https://splunk.bcc.cd:8089", "splunk-key-xxxx", ["search", "alert", "enrich"]),
    ("INT-002", "CrowdStrike EDR", "EDR", "https://api.crowdstrike.com", "crowdstrike-key-xxxx", ["isolate", "quarantine", "collect"]),
    ("INT-003", "Palo Alto NGFW", "FIREWALL", "https://ngfw.bcc.cd", "ngfw-key-xxxx", ["block_ip", "block_port"]),
    ("INT-004", "ServiceNow", "ITSM", "https://bcc.service-now.com", "servicenow-key-xxxx", ["create_ticket", "update_ticket"]),
    ("INT-005", "Microsoft Teams", "COMMUNICATION", "https://graph.microsoft.com", "graph-key-xxxx", ["send_message", "create_alert"]),
]

for iid, name, tool_type, endpoint, key, capabilities in integrations:
    auto.register_integration(iid, name, tool_type, endpoint, key, capabilities)

# Création de workflows
workflows = [
    ("WF-001", "Ransomware Response", "EDR_ALERT: ransomware_*", [
        {"id": 1, "action": "ISOLATE_ENDPOINT", "tool": "INT-002", "params": {"hostname": "{{alert.hostname}}"}},
        {"id": 2, "action": "BLOCK_C2_IP", "tool": "INT-003", "params": {"ip": "{{alert.src_ip}}"}},
        {"id": 3, "action": "CREATE_TICKET", "tool": "INT-004", "params": {"priority": "P1"}},
        {"id": 4, "action": "NOTIFY_CISO", "tool": "INT-005", "params": {"message": "Ransomware detected"}},
    ], "Automated ransomware response workflow"),
    ("WF-002", "Phishing Response", "SIEM_ALERT: phishing_*", [
        {"id": 1, "action": "QUARANTINE_EMAIL", "tool": "INT-001", "params": {"message_id": "{{alert.message_id}}"}},
        {"id": 2, "action": "BLOCK_SENDER", "tool": "INT-003", "params": {"domain": "{{alert.sender_domain}}"}},
        {"id": 3, "action": "CREATE_TICKET", "tool": "INT-004", "params": {"priority": "P2"}},
    ], "Automated phishing response workflow"),
]

for wid, name, trigger, steps, desc in workflows:
    auto.create_workflow(wid, name, trigger, steps, desc)

# Exécution de workflows
executions = [
    ("WF-001", {"alert": {"hostname": "SRV-FINANCE-03", "src_ip": "185.234.72.91"}}),
    ("WF-002", {"alert": {"message_id": "MSG-001", "sender_domain": "malicious.com"}}),
]

for wid, context in executions:
    result = auto.execute_workflow(wid, context)
    print(f"    {wid}: {result['status']} — {len(result['steps_executed'])} steps executed")

# Dashboard
dashboard = auto.get_automation_dashboard()
print(f"\n[+] SOC Automation Dashboard :")
print(f"    Integrations: {dashboard['integrations']}")
print(f"    Workflows: {dashboard['workflows']}")
print(f"    Executions: {dashboard['executions']}")
print(f"    Success rate: {dashboard['success_rate']}%")
```

---

## 3) Module — API Security & BCC SOC Automation Architecture (2h)

### 📖 Sécurité des APIs SOC

```yaml
# API Security for SOC Automation
api_security:
  authentication:
    - "OAuth 2.0 / OIDC for all API calls"
    - "API keys with rotation every 90 days"
    - "Service accounts with least privilege"
    - "mTLS for internal service communication"

  authorization:
    - "RBAC for API access (who can call what)"
    - "Rate limiting per integration"
    - "IP whitelisting for API endpoints"
    - "Scope-based permissions"

  monitoring:
    - "API call logging (who, when, what)"
    - "Anomaly detection on API usage"
    - "Alert on failed authentication"
    - "Audit trail for all API calls"

  hardening:
    - "Input validation and sanitization"
    - "Output encoding"
    - "Error handling (no stack traces)"
    - "Timeout and retry policies"
    - "Circuit breakers for external APIs"

bcc_soc_automation_architecture:
  orchestration_platform:
    primary: "Cortex XSOAR"
    secondary: "Shuffle / n8n"
    deployment: "Kubernetes / Docker"
    high_availability: true

  integration_strategy:
    - "Standardized API contracts (OpenAPI/Swagger)"
    - "Retry and fallback mechanisms"
    - "Dead letter queues for failed tasks"
    - "Event-driven architecture (Kafka/RabbitMQ)"

  workflow_catalog:
    - "Ransomware Response (L1 automated)"
    - "Phishing Response (L1 automated)"
    - "Data Exfiltration Response (L1 automated)"
    - "Account Takeover Response (L1 automated)"
    - "DDoS Mitigation (L1 automated)"
    - "Threat Intelligence Enrichment (L2 automated)"
    - "Vulnerability Patching (L2 automated)"
    - "Compliance Reporting (L3 automated)"

  metrics:
    automation_rate: "L1: 70%, L2: 40%, L3: 15%"
    workflow_success_rate: "> 95%"
    avg_execution_time: "< 2 minutes"
    error_rate: "< 5%"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **API** | Application Programming Interface — Interface de programmation d'application |
| **REST** | Representational State Transfer — Style d'architecture API |
| **JSON** | JavaScript Object Notation — Format d'échange de données |
| **YAML** | YAML Ain't Markup Language — Format de configuration |
| **OpenAPI** | Spécification d'API REST |
| **OAuth** | Protocole d'autorisation |
| **OIDC** | OpenID Connect — Couche d'identité sur OAuth 2.0 |
| **mTLS** | Mutual TLS — Authentification mutuelle par certificat |
| **RBAC** | Role-Based Access Control — Contrôle d'accès basé sur les rôles |
| **Kafka** | Plateforme de streaming d'événements |
| **SOAR** | Security Orchestration, Automation and Response |
| **SIEM** | Security Information & Event Management |
| **EDR** | Endpoint Detection & Response |
| **NDR** | Network Detection & Response |
| **CTI** | Cyber Threat Intelligence |
| **ITSM** | IT Service Management |
| **DLP** | Data Loss Prevention |
| **C2** | Command and Control |
| **IoC** | Indicator of Compromise |
| **TTP** | Tactics, Techniques, and Procedures |
| **MITRE ATT&CK** | Framework de connaissances sur les tactiques et techniques des attaquants |
| **NIS2** | Directive européenne sur la sécurité des réseaux et systèmes d'information |
| **DORA** | Digital Operational Resilience Act |
| **RGPD** | Règlement Général sur la Protection des Données |
| **COBAC** | Commission Bancaire de la RDC |
| **ISO 27001** | Norme internationale pour les Systèmes de Management de la Sécurité de l'Information |
| **ROI** | Return on Investment — Retour sur investissement |
| **MTTD** | Mean Time to Detect — Temps moyen de détection |
| **MTTR** | Mean Time to Respond/Remediate — Temps moyen de réponse/remédiation |
| **FP/TP** | False Positive / True Positive — Faux positif / Vrai positif |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Qu'est-ce que l'**orchestration cross-tools** dans un SOC et pourquoi est-elle critique ?
- A) C'est l'automatisation des flux de travail entre plusieurs outils SOC (SIEM → EDR → Firewall → ITSM) pour réduire le temps de réponse, éliminer les erreurs humaines et standardiser les procédures — sans orchestration, les analystes perdent du temps à basculer entre interfaces et à copier-coller des informations
- B) C'est un outil de monitoring
- C) C'est un type de malware
- D) C'est un framework de sécurité

**Réponse : A**

**Q2 :** Quels sont les principaux **risques de sécurité des APIs** dans un SOC automatisé ?
- A) Les APIs peuvent être compromises par des clés API volées, un manque d'authentification forte (OAuth/mTLS), une autorisation trop permissive (RBAC mal configuré), ou un manque de monitoring — un attaquant qui compromet une API SOAR peut prendre le contrôle de toute la chaîne de réponse
- B) Les APIs ne présentent aucun risque
- C) Les APIs sont moins risquées que les interfaces web
- D) Les risques sont uniquement techniques

**Réponse : A**

**Q3 :** Qu'est-ce qu'un **workflow d'automatisation L1** dans un SOC et quels sont ses avantages ?
- A) C'est un workflow entièrement automatisé pour des incidents de basse complexité (isolation endpoint, blocage IP, création de ticket) — il libère les analystes des tâches répétitives, réduit le MTTR de 80%, et garantit une réponse cohérente et sans erreur
- B) C'est un workflow manuel
- C) C'est un playbook SOAR pour incidents complexes
- D) C'est un outil de détection

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
