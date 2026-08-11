# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 351 (6h) : SOC Operations & Tier-1/2/3 Triage Workflows (Alert Triaging, True/False Positive Analysis, Incident Escalation & SLA Management)

> [!NOTE]
> **Objectif du jour :** Maîtriser le fonctionnement opérationnel d'un **Security Operations Center (SOC)** d'entreprise de niveau bancaire/industriel : dérouler les workflows de traitement des alertes entre les analystes **Tier-1 (Triage initial)**, **Tier-2 (Investigation approfondie)** et **Tier-3 (Threat Hunting & Incident Response)**, distinguer systématiquement les Vrais Positifs (True Positives) des Faux Positifs (False Positives), et piloter la résolution selon des SLAs stricts (MTTD, MTTR).
>
> **Compétences visées :** `SOC-OPS-01` (A) — SOC Tier-1/2/3 Escalation Workflows & SLA Management | `SOC-OPS-02` (A) — True/False Positive Triage & Alert Enriched Analysis

---

## 1) Module — Organisation & Tiered Architecture d'un SOC Moderne (2h)

### 📖 Narration/Intuition

Dans un SOC moderne (interne ou MSSP), le traitement des événements de sécurité est structuré en **niveaux d'escalade (Tiers)** pour absorber des volumes massifs de logs (plusieurs Terabytes/jour) sans saturer les experts.

```
       [ Sources de Logs : SIEM, EDR, Firewall, WAF, CloudTrail, NDR ]
                                    │
                                    ▼ (Alerte SIEM Générée)
┌────────────────────────────────────────────────────────────────────────┐
│ TIER-1 : Analyste Triage (Qualification en < 15 min)                  │
│  - Vérification de l'alerte (Vrai ou Faux Positif)                     │
│  - Enrichissement contextuel (IP Reput, User Role, Asset Criticality)  │
│  - Clôture si Faux Positif OU Escalade vers Tier-2                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Incident Avéré / Complexe)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ TIER-2 : Analyste Incident Response (Investigation < 2h)               │
│  - Analyse des corrélations de logs (EDR Process Tree, Network PCAP)   │
│  - Isolement réseau du poste / Révocation de session OAuth/IAM         │
│  - Rédaction du ticket d'incident & Remédiation tactique               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Attaque Sophistiquée / APT / Zero-Day)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ TIER-3 : Threat Hunter & Forensics Expert (Deep Dive / Containment)    │
│  - Reverse engineering de malwares, recherche d'IoCs dans la mémoire   │
│  - Traque proactive (Threat Hunting SIGMA/YARA)                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Indicateurs de Performance SOC (SLAs & Metrics)

- **MTTD (Mean Time to Detect) :** Durée entre le premier compromis et la détection par l'alerte. *Cible : < 15 min.*
- **MTTA (Mean Time to Acknowledge) :** Durée pour qu'un analyste Tier-1 prenne en charge l'alerte. *Cible : < 5 min.*
- **MTTR (Mean Time to Respond/Remediate) :** Durée entre la détection et l'isolement/résolution de la menace. *Cible : < 1 heure.*

---

## 2) Module — Outillage de Triage Automatisé & Classifier (`soc_triage_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone

class SOCTriageEngine:
    """
    Moteur de qualification et d'escalade automatique des alertes SOC (Tier-1 Automation).
    Enrichit l'alerte brute avec le contexte métier et calcule la sévérité réelle.
    """

    def __init__(self, high_value_assets: set, privileged_users: set):
        self.critical_assets = high_value_assets
        self.critical_users = privileged_users

    def qualify_alert(self, raw_alert: dict) -> dict:
        """
        Qualifie une alerte SIEM brute : détermine si c'est un Vrai ou Faux Positif,
        ajuste le score de sévérité et décide de l'escalade vers le Tier-2.
        """
        source_ip = raw_alert.get("source_ip")
        target_asset = raw_alert.get("target_asset")
        user = raw_alert.get("user")
        rule_name = raw_alert.get("rule_name")
        base_severity = raw_alert.get("base_severity", "MEDIUM")

        # 1. Enrichissement contextuel
        is_critical_asset = target_asset in self.critical_assets
        is_privileged_user = user in self.critical_users
        
        # 2. Analyse Vrai / Faux Positif (Heuristique & whitelist)
        is_false_positive = False
        fp_reason = ""

        # Exemple FP : Script d'inventaire automatisé autorisé de la DSI
        if rule_name == "Multiple Failed SSH Logins" and source_ip == "10.0.0.250":
            is_false_positive = True
            fp_reason = "IP 10.0.0.250 identifiée comme le scanner d'inventaire Qualys approuvé."

        # 3. Calcul du score de sévérité ajusté (Risk Score 1-100)
        risk_score = 30 if base_severity == "LOW" else 60 if base_severity == "MEDIUM" else 85
        
        if is_critical_asset:
            risk_score += 15
        if is_privileged_user:
            risk_score += 15

        risk_score = min(risk_score, 100)

        # 4. Décision de workflow (Tier-1 Close vs Tier-2 Escalation)
        if is_false_positive:
            workflow_action = "CLOSE_AS_FALSE_POSITIVE"
            escalate_to = None
        elif risk_score >= 75:
            workflow_action = "ESCALATE_IMMEDIATELY"
            escalate_to = "SOC_TIER_2_INCIDENT_RESPONSE"
        else:
            workflow_action = "MONITOR_AND_ENRICH"
            escalate_to = "SOC_TIER_1_MONITORING"

        return {
            "alert_id": raw_alert.get("alert_id"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "rule_name": rule_name,
            "original_severity": base_severity,
            "adjusted_risk_score": risk_score,
            "is_false_positive": is_false_positive,
            "fp_reason": fp_reason,
            "workflow_action": workflow_action,
            "escalate_to": escalate_to,
            "context": {
                "critical_asset": is_critical_asset,
                "privileged_user": is_privileged_user
            }
        }

# Simulation de Triage SOC Tier-1
critical_nodes = {"DB-PROD-SWIFT-01", "DC01.paradis-bank.com"}
admin_users = {"adm_jdupont", "root", "krbtgt"}

engine = SOCTriageEngine(critical_nodes, admin_users)

# Alerte 1 : Brute force SSH depuis IP d'inventaire (Faux Positif)
alert_1 = {
    "alert_id": "ALT-2026-001",
    "rule_name": "Multiple Failed SSH Logins",
    "source_ip": "10.0.0.250",
    "target_asset": "SRV-WEB-02",
    "user": "service_account",
    "base_severity": "MEDIUM"
}

# Alerte 2 : Détection Pass-The-Hash sur le Contrôleur de Domaine (Vrai Positif Critique)
alert_2 = {
    "alert_id": "ALT-2026-002",
    "rule_name": "Pass-the-Hash Activity Detected",
    "source_ip": "10.10.4.88",
    "target_asset": "DC01.paradis-bank.com",
    "user": "adm_jdupont",
    "base_severity": "HIGH"
}

print("=== SOC TIER-1 TRIAGE ENGINE RESULTS ===")
print("\n[Alerte 1 - Scan Qualys] :")
print(json.dumps(engine.qualify_alert(alert_1), indent=2, ensure_ascii=False))

print("\n[Alerte 2 - Pass-the-Hash sur DC01] :")
print(json.dumps(engine.qualify_alert(alert_2), indent=2, ensure_ascii=False))
```

---

## 3) Module — Fiche de Procédure d'Escalade d'Incident (SOP) (2h)

```markdown
# STANDARD OPERATING PROCEDURE (SOP) — ESCALADE D'INCIDENT CRITIQUE

## 1. Trigger d'Escalade Tier-1 ──► Tier-2
Une alerte doit être escaladée au Tier-2 sous **moins de 15 minutes** si au moins UN des critères suivants est vérifié :
- Compromission avérée d'un compte privilégié (Domain Admin, Root Cloud).
- Exécution d'un binaire malveillant/Ransomware confirmé par l'EDR sur un serveur de production.
- Mouvement latéral détecté entre le réseau interne et la zone PCI-DSS / SWIFT.

## 2. Procédure de Confinement Immédiat (Tier-2)
1. **Isolement Réseau :** Exécuter la commande d'isolement EDR (CrowdStrike/SentinelOne) sur la machine impactée.
2. **Révoquer les Sessions :** Invalider tous les jetons Refresh Token OAuth2 et réinitialiser le mot de passe Kerberos du compte compromis.
3. **Preservation des Preuves :** Déclencher une capture de mémoire vive (RAM Dump) et un export du journal d'événements Security.evtx.

## 3. Communication & Matrice RACI
- **Responsible :** Analyste Tier-2 en charge du ticket.
- **Accountable :** Incident Response Manager / CISO.
- **Consulted :** Équipe d'Infrastructure Système & Réseau.
- **Informed :** Risk Committee & DPO (si fuite de données personnelles RGPD).
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SOC** | Security Operations Center — Centre de surveillance et de réponse aux incidents de sécurité |
| **MTTD / MTTR** | Mean Time to Detect / Mean Time to Respond — Métriques clés d'efficacité du SOC |
| **SOP** | Standard Operating Procedure — Procédure opérationnelle standardisée |
| **RACI** | Responsible, Accountable, Consulted, Informed — Matrice de répartition des responsabilités |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans un SOC d'entreprise, quel est le rôle principal d'un analyste **Tier-1** ?
- A) Effectuer la qualification initiale des alertes en temps réel, éliminer les faux positifs évidents, enrichir les données et escalader les vrais incidents vers le Tier-2 sous des délais stricts (SLA < 15 min)
- B) Développer des ROP Chains
- C) Gérer les contrats des fournisseurs d'électricité
- D) Réparer les imprimantes de l'entreprise

**Réponse : A**

**Q2 :** Quelle est la différence entre le **MTTD (Mean Time to Detect)** et le **MTTR (Mean Time to Respond)** ?
- A) Le MTTD mesure le temps s'écoulant entre la première intrusion et sa détection par les alertes, tandis que le MTTR mesure le temps écoulé entre la détection et le confinement/résolution complète de l'incident
- B) Le MTTD est uniquement pour les virus, le MTTR pour le réseau
- C) Les deux termes désignent la même métrique
- D) Le MTTR mesure le coût financier de l'incident

**Réponse : A**

**Q3 :** Pourquoi est-il indispensable d'enrichir une alerte SIEM brute lors de la phase de triage ?
- A) Pour ajouter du contexte métier critique (criticité de l'équipement, niveau de privilège de l'utilisateur, réputation de l'IP source) permettant d'évaluer le risque réel et d'éviter de traiter une alerte critique comme bénigne
- B) Pour augmenter la taille du fichier de log
- C) Pour ralentir le processus d'analyse
- D) C'est une obligation légale RGPD uniquement

**Réponse : A**

**Q4 :** Dans une matrice RACI de réponse aux incidents, qui porte la responsabilité finale (**Accountable**) en cas de crise majeure ?
- A) Le CISO / Incident Response Manager (une seule personne porte la responsabilité finale de la décision)
- B) Tous les techniciens de l'entreprise collectivement
- C) Le stagiaire Tier-1
- D) Le fournisseur du pare-feu

**Réponse : A**

**Q5 :** Quelle action de confinement de premier niveau est recommandée lorsqu'un EDR confirme la présence d'un ransomware actif sur un poste de travail ?
- A) Isoler immédiatement la machine du réseau via l'agent EDR tout en maintenant l'alimentation électrique pour préserver la mémoire vive (RAM)
- B) Éteindre brutalement la machine en débranchant la prise
- C) Formater le disque dur sans sauvegarde
- D) Envoyer un email à l'attaquant

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
