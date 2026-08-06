# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 268 (6h) : SOAR & Incident Response Automation (Shuffle, Cortex XSOAR, Automated Playbooks & Incident Containment)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **SOAR (Security Orchestration, Automation, and Response)** et l'automatisation de la réponse aux incidents de sécurité : concevoir des **Playbooks d'orchestration** sur la plateforme open-source **Shuffle** ou **Cortex XSOAR**, automatiser l'isolation réseau des endpoints compromis (EDR Isolation API), et orchestrer le blocage des IoC sur les pare-feux et WAF.
>
> **Compétences visées :** `SOAR-01` (A) — SOAR Playbook Design (Shuffle/XSOAR) | `IR-01` (A) — Automated Endpoint Isolation & IoC Blocking

---

## 1) Module — Architecture SOAR & Concepts d'Orchestration (1h30)

### 📖 Narration/Intuition

Un **SOAR (Security Orchestration, Automation, and Response)** est le moteur qui relie le SIEM, les EDRs, les pare-feux et la billetterie (Jira/ServiceNow). Lorsqu'une alerte CRITICAL survient dans le SIEM, le SOAR exécute un **Playbook automatique** en quelques secondes (ex: isoler la machine du réseau via EDR + réinitialiser le mot de passe utilisateur + bloquer l'IP sur le WAF + ouvrir un ticket Jira), réduisant le **MTTR (Mean Time To Respond)** de plusieurs heures à quelques secondes.

---

## 2) Module — Conception d'un Playbook sur Shuffle SOAR (2h30)

### 🛠️ Atelier Pratique

**Configuration d'un Playbook d'Isolation EDR automatisé (`shuffle_playbook.json`) :**

```json
{
  "name": "Automated Incident Containment - Ransomware Detection",
  "description": "Isole automatiquement le host compromis et bloque l'IP C2 sur le pare-feu lors d'une alerte EDR Critical",
  "triggers": [
    {
      "name": "Elastic SIEM Webhook Trigger",
      "type": "webhook",
      "event": "alert.critical"
    }
  ],
  "actions": [
    {
      "step": 1,
      "name": "Extract Hostname and C2 IP",
      "module": "json_parser",
      "input": "$trigger.body"
    },
    {
      "step": 2,
      "name": "Isolate Endpoint via Defender EDR API",
      "module": "microsoft_defender",
      "action": "isolate_machine",
      "params": {
        "deviceId": "$step1.hostname",
        "comment": "Isolation automatique SOAR suite alerte Ransomware"
      }
    },
    {
      "step": 3,
      "name": "Block C2 IP on Palo Alto Firewall",
      "module": "palo_alto_panos",
      "action": "add_to_blocklist",
      "params": {
        "ip": "$step1.c2_ip"
      }
    },
    {
      "step": 4,
      "name": "Send Slack Notification to Incident Team",
      "module": "slack",
      "action": "send_message",
      "params": {
        "channel": "#cyber-incidents",
        "message": ":warning: *CONTAINTMENT SOAR EFFECTUÉ* : Host $step1.hostname isolé du réseau. IP C2 $step1.c2_ip bloquée."
      }
    }
  ]
}
```

---

## 3) Module — Script Python d'Isolation API EDR (`edr_isolate_api.py`) (2h)

```python
import requests

# API Microsoft Defender for Endpoint - Isolation réseau d'une machine compromise

DEFENDER_API_URL = "https://api.securitycenter.microsoft.com/api/machines"
TENANT_ID = "YOUR_TENANT_ID"
CLIENT_ID = "YOUR_CLIENT_ID"
CLIENT_SECRET = "YOUR_CLIENT_SECRET"

# 1) Obtenir le token OAuth2
auth_url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"
auth_data = {
    "client_id": CLIENT_ID,
    "scope": "https://api.securitycenter.microsoft.com/.default",
    "client_secret": CLIENT_SECRET,
    "grant_type": "client_credentials"
}
token = requests.post(auth_url, data=auth_data).json()["access_token"]

# 2) Isoler la machine via l'API REST
def isolate_machine(device_id: str):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "Comment": "Isolation réseau automatique initiée par le SOAR PARADIS IT",
        "IsolationType": "Full"
    }
    response = requests.post(f"{DEFENDER_API_URL}/{device_id}/isolate", json=payload, headers=headers)
    if response.status_code == 201:
        print(f"[+] MACHINE {device_id} ISOLÉE DU RÉSEAU AVEC SUCCÈS VIA API EDR !")

isolate_machine("1e2f3a4b5c6d")
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SOAR** | Security Orchestration, Automation, and Response — Plateforme d'automatisation des réponses aux incidents |
| **MTTR** | Mean Time To Respond — Temps moyen nécessaire pour répondre et contenir un incident de sécurité |
| **Shuffle** | Plateforme SOAR open-source et flexible basée sur les flux de travail (workflows) |
| **Cortex XSOAR** | Plateforme SOAR commerciale de Palo Alto Networks (anciennement Demisto) |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la fonction principale d'une plateforme **SOAR** au sein d'un SOC ?
- A) Orchestrer et automatiser les actions de réponse aux incidents (isolation de host, blocage d'IP, désactivation de compte) via des playbooks
- B) Stocker des mots de passe en clair
- C) Scanner des vulnérabilités C++
- D) Compiler le code source

**Réponse : A**

**Q2 :** Quel est l'impact direct du SOAR sur la métrique du SOC appelée **MTTR (Mean Time To Respond)** ?
- A) Il réduit le temps de réponse aux incidents de plusieurs heures à quelques secondes grâce aux automatisations
- B) Il augmente le MTTR
- C) Il n'a aucun impact sur le MTTR
- D) Il supprime les journaux SIEM

**Réponse : A**

**Q3 :** Quelle plateforme SOAR open-source basée sur les workflows graphiques est l'alternative principale à Cortex XSOAR ?
- A) Shuffle
- B) Wireshark
- C) Nmap
- D) Metasploit

**Réponse : A**

**Q4 :** Lorsqu'une machine est soumise à une **Isolation EDR (Full Isolation)** via API, quelle communication réseau reste généralement autorisée ?
- A) Uniquement la communication sécurisée entre l'agent EDR et la console Cloud EDR pour permettre le contrôle à distance
- B) Tout le trafic HTTP
- C) Le trafic SSH
- D) Les flux BitTorrent

**Réponse : A**

**Q5 :** Quel protocole d'authentification est universellement utilisé pour interagir avec les APIs REST des plateformes Cloud EDR (Microsoft Defender, CrowdStrike) ?
- A) OAuth 2.0 (Client Credentials Flow)
- B) Basic Auth HTTP
- C) Telnet
- D) FTP

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
