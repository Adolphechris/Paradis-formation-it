# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 363 (6h) : Cloud SOC & Multi-Cloud Threat Hunting (AWS CloudTrail, Azure Activity Logs & GCP Audit Logs Correlation — Cross-Cloud Attack Graph)

> [!NOTE]
> **Objectif du jour :** Maîtriser la surveillance et la traque des attaques ciblant les environnements **Multi-Cloud (AWS, Azure, GCP)** au sein du SOC : centraliser et corrélér les journaux d'audit natifs (**AWS CloudTrail**, **Azure Activity/SignIn Logs**, **GCP Audit Logs**), détecter les attaques par élévation de privilèges Cloud (IAM Role Assumption, Service Principal Abuse, Cross-Account Pivoting), et modéliser le graphe d'attaque multi-cloud (**Cross-Cloud Attack Graph**).
>
> **Compétences visées :** `CLOUD-SOC-01` (A) — Multi-Cloud Audit Log Aggregation & Event Correlation | `CLOUD-SOC-02` (A) — IAM Escalation Detection, Cross-Account Pivoting & Cloud Attack Graphing

---

## 1) Module — Matrice de Télémétrie & Logs Multi-Cloud (2h)

### 📖 Narration/Intuition

Les infrastructures hybrides et multi-cloud déplacent le périmètre de sécurité vers la couche contrôle (Control Plane / APIs Cloud). Un attaquant qui compromet des identifiants IAM AWS peut pivoter vers Azure via une fédération d'identité mal sécurisée. Le SOC doit être capable de suivre le parcours de l'attaquant à travers plusieurs fournisseurs Cloud.

```
 [ ATTAQUANT (Compte IAM Compromis) ]
                │
                ├── 1. AWS CloudTrail Event ──────► `AssumeRole` (Pivoting Cross-Account)
                ├── 2. Azure SignIn Log Event ─────► `Anomalous Token / Foreign IP`
                └── 3. GCP Audit Log Event ───────► `setIamPolicy` (Élévation de Privilèges)
```

#### Télémétrie Nationale & Signaux d'Attaque par Cloud Provider

| Cloud Provider | Journal Natif | Événement Suspect à Surveiller | Risque d'Attaque |
|:---:|:---|:---|:---|
| **AWS** | CloudTrail | `CreateAccessKey`, `AssumeRole`, `ConsoleLogin` sans MFA | Exfiltration d'identifiants, Persistence |
| **Azure** | Azure Activity / Entra ID | `Update application – Certificates and secrets`, `Add member to role` | Injection de secret Service Principal |
| **GCP** | Cloud Audit Logs | `v1.compute.instances.setMetadata`, `SetIamPolicy` | Dynamic Backdoor / Escalade IAM |

---

## 2) Module — Moteur de Corrélation Multi-Cloud (`cloud_soc_correlator.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict

class CloudSOCCorrelator:
    """
    Moteur de corrélation de sécurité Multi-Cloud (AWS CloudTrail, Azure Entra ID, GCP Audit).
    Construit le graphe d'attaque et détecte le pivoting cross-cloud.
    """

    def __init__(self):
        self.user_session_tracker: Dict[str, list] = {}
        self.cloud_alerts: List[dict] = []

    def ingest_aws_cloudtrail(self, event: dict):
        """Ingère un événement AWS CloudTrail."""
        event_name = event.get("eventName")
        user = event.get("userIdentity", {}).get("arn", "unknown")
        source_ip = event.get("sourceIPAddress")

        self._track_user_activity(user, "AWS", source_ip, event_name)

        # Détection : Création d'Access Key secondaire (Persistence T1098)
        if event_name == "CreateAccessKey":
            self._raise_cloud_alert(
                cloud_type="AWS",
                rule_id="AWS-ALT-001",
                severity="HIGH",
                user=user,
                source_ip=source_ip,
                details=f"Création d'une nouvelle clé d'accès AWS IAM pour {event.get('requestParameters', {}).get('userName')}."
            )

        # Détection : Modification de politique SCP ou S3 Bucket Public
        elif event_name in ["PutBucketPolicy", "DeleteGroupPolicy", "AttachUserPolicy"]:
            self._raise_cloud_alert(
                cloud_type="AWS",
                rule_id="AWS-ALT-002",
                severity="CRITICAL",
                user=user,
                source_ip=source_ip,
                details=f"Modification critique de politique de sécurité AWS IAM/S3: {event_name}."
            )

    def ingest_azure_activity_log(self, event: dict):
        """Ingère un événement Azure Activity / Entra ID Log."""
        operation_name = event.get("operationName", {})
        user = event.get("caller", "unknown")
        source_ip = event.get("httpRequest", {}).get("clientIpAddress")

        self._track_user_activity(user, "AZURE", source_ip, str(operation_name))

        # Détection : Injection de Secret / Certificat sur une Application Registrée (Service Principal)
        if "Update application – Certificates and secrets management" in str(operation_name):
            self._raise_cloud_alert(
                cloud_type="AZURE",
                rule_id="AZU-ALT-001",
                severity="CRITICAL",
                user=user,
                source_ip=source_ip,
                details="Ajout d'un nouveau certificat/secret sur un Service Principal Azure App Registration !"
            )

    def _track_user_activity(self, user: str, cloud_provider: str, ip: str, action: str):
        """Suit le parcours d'une identité à travers plusieurs clouds pour repérer le Cross-Cloud Pivoting."""
        key = user.split("/")[-1].split("@")[0] # Normalisation simplifiée de l'identité
        if key not in self.user_session_tracker:
            self.user_session_tracker[key] = []
            
        self.user_session_tracker[key].append({
            "cloud": cloud_provider,
            "ip": ip,
            "action": action,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        # Test Cross-Cloud Pivoting : La même identité s'active sur AWS ET Azure depuis la même IP en < 5 min
        providers = set(x["cloud"] for x in self.user_session_tracker[key])
        if len(providers) > 1:
            self._raise_cloud_alert(
                cloud_type="MULTI-CLOUD",
                rule_id="MCC-ALT-001",
                severity="CRITICAL",
                user=key,
                source_ip=ip,
                details=f"Pivoting Multi-Cloud détecté ! L'identité '{key}' est active simultanément sur {list(providers)}."
            )

    def _raise_cloud_alert(self, cloud_type: str, rule_id: str, severity: str, user: str, source_ip: str, details: str):
        alert = {
            "alert_id": f"CLOUD-ALT-{len(self.cloud_alerts)+1:03d}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "cloud_provider": cloud_type,
            "rule_id": rule_id,
            "severity": severity,
            "user": user,
            "source_ip": source_ip,
            "details": details
        }
        self.cloud_alerts.append(alert)
        print(f"[!] ALERTE CLOUD [{severity}] [{cloud_type}] {rule_id} -> {details}")

# Démonstration Opérationnelle Cloud SOC
correlator = CloudSOCCorrelator()

print("=== MULTI-CLOUD SOC CORRELATION ENGINE DEMO ===")

# Événement 1 : AWS CloudTrail - Création de clé d'accès depuis une IP malveillante
correlator.ingest_aws_cloudtrail({
    "eventName": "CreateAccessKey",
    "userIdentity": {"arn": "arn:aws:iam::123456789012:user/admin_alice@paradis-bank.com"},
    "sourceIPAddress": "185.220.101.88",
    "requestParameters": {"userName": "admin_alice"}
})

# Événement 2 : Azure Entra ID - Ajout de secret sur App Registration depuis la MÊME IP (Cross-Cloud Pivoting !)
correlator.ingest_azure_activity_log({
    "operationName": "Update application – Certificates and secrets management",
    "caller": "admin_alice@paradis-bank.com",
    "httpRequest": {"clientIpAddress": "185.220.101.88"}
})

print("\n=== MULTI-CLOUD ALERTS SUMMARY ===")
print(json.dumps(correlator.cloud_alerts, indent=2, ensure_ascii=False))
```

---

## 3) Module — Fiche de Règles SIGMA pour Logs Cloud (2h)

```yaml
# RÈGLE SIGMA : DÉTECTION DE CRÉATION DE CLÉ D'ACCÈS AWS SUSPECTE
title: AWS IAM Access Key Creation From External IP
id: c3b91a78-4321-4b90-paradis363
status: production
description: Détecte la création d'une clé d'accès IAM AWS (CreateAccessKey) depuis une IP externe non enregistrée dans la liste blanche de l'entreprise.
references:
    - https://attack.mitre.org/techniques/T1098/
author: PARADIS IT Cloud SOC Team
tags:
    - attack.persistence
    - attack.t1098
logsource:
    product: aws
    service: cloudtrail
detection:
    selection:
        eventName: 'CreateAccessKey'
    filter_internal_ips:
        sourceIPAddress|startswith:
            - '10.'
            - '172.16.'
            - '192.168.'
    condition: selection and not filter_internal_ips
falsepositives:
    - Authorized DevOps engineers working remotely without VPN (to be tuned)
level: high
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CloudTrail** | Service AWS d'audit enregistrant tous les appels API effectués sur le compte |
| **Service Principal** | Identité d'application dans Azure Entra ID utilisée pour l'authentification automatisée |
| **Control Plane** | Couche d'administration et de gestion des API d'un fournisseur Cloud (AWS, Azure, GCP) |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Pourquoi la centralisation des logs du **Control Plane (AWS CloudTrail, Azure Activity, GCP Audit)** est-elle prioritaire dans un Cloud SOC ?
- A) Parce que les attaques modernes ciblent directement la couche d'administration et les API d'identité (IAM) du Cloud pour créer de la persistance et pivoter sans toucher les machines virtuels
- B) Pour réduire la consommation électrique du processeur
- C) Parce que les disques durs virtuels n'existent plus
- D) C'est une obligation réservée aux hébergeurs web

**Réponse : A**

**Q2 :** Dans Azure Entra ID (Active Directory), quel type d'attaque correspond à l'événement `"Update application – Certificates and secrets management"` ?
- A) L'injection d'une clé secrète ou d'un certificat sur un Service Principal (App Registration) pour obtenir une persistance administrative invisible
- B) La suppression d'une imprimante réseau
- C) Le changement de fond d'écran du portail
- D) La mise à jour de l'antivirus Windows

**Réponse : A**

**Q3 :** Qu'est-ce que le **Cross-Cloud Pivoting** ?
- A) La capacité pour un attaquant qui a compromis une identité ou un secret sur un premier Cloud (ex: AWS) de rebondir vers un second Cloud (ex: Azure/GCP) via la fédération d'identité ou des clés réutilisées
- B) Le passage d'un câble Ethernet entre deux ordinateurs
- C) La conversion d'un fichier PDF en Word
- D) L'accélération du débit Wi-Fi

**Réponse : A**

**Q4 :** Dans AWS CloudTrail, quel événement indique qu'un utilisateur ou un service change de rôle pour obtenir temporairement des privilèges différents ?
- A) `AssumeRole`
- B) `CreateBucket`
- C) `RebootInstances`
- D) `GetObject`

**Réponse : A**

**Q5 :** Quelle mesure de sécurité réduit drastiquement le risque de réutilisation de clés d'accès AWS statiques (`AKIA...`) volées ?
- A) Interdire la création de clés IAM statiques et utiliser **AWS IAM Roles Anywhere** ou des rôles temporaires assumés via SSO / OIDC (TTL court)
- B) Imprimer les clés d'accès sur papier
- C) Les envoyer par SMS aux employés
- D) Désactiver le réseau local

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
