# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 352 (6h) : Elasticsearch, Logstash & Kibana (ELK Stack) for SIEM (Index Lifecycle Management, Ingest Pipelines & Lucene/KQL Security Queries)

> [!NOTE]
> **Objectif du jour :** Maîtriser le déploiement et l'administration d'un **SIEM basé sur la suite ELK / Elastic Security** : concevoir des pipelines d'ingestion **Logstash** et **Ingest Node**, optimiser la conservation des données de sécurité via l'**Index Lifecycle Management (ILM)**, et écrire des requêtes de recherche de sécurité complexes en **KQL (Kibana Query Language)** et syntaxe **Lucene**.
>
> **Compétences visées :** `SIEM-ELK-01` (A) — ELK Stack Architecture & Logstash Ingestion Pipelines | `SIEM-ELK-02` (A) — Elastic ILM Policies & KQL Security Query Engineering

---

## 1) Module — Architecture ELK & Index Lifecycle Management (2h)

### 📖 Narration/Intuition

Dans un environnement SIEM de grande échelle, les logs de sécurité (VPC Flow Logs, Syslog, Suricata, Active Directory) doivent être ingérés, normalisés et conservés selon des cycles d'archivage précis pour concilier performance de recherche et coût de stockage.

```
[ Sources de Logs ] ──► [ Logstash / Beats ] ──► [ Ingest Pipeline (Grok / Dissect) ]
                                                               │
                                                               ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ ELASTICSEARCH CLUSTER — INDEX LIFECYCLE MANAGEMENT (ILM)               │
 │                                                                        │
 │  1. HOT Phase (SSDs NVMe)  ──► Ingestion active & Recherches rapides   │
 │                                (Conservation: 1 à 7 jours)            │
 │  2. WARM Phase (HDDs/SSDs) ──► Relecture seule & Shrink des index      │
 │                                (Conservation: 30 jours)               │
 │  3. COLD Phase (Object Store)─► Freeze des index & Recherches lentes  │
 │                                (Conservation: 90 jours)               │
 │  4. FROZEN / DELETE Phase  ──► Suppression finale / Archivage S3      │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Outillage Ingest Pipeline & Kibana Queries (`elk_siem_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import re

class ELKSIEMEngine:
    """
    Simulateur de pipeline d'ingestion Logstash/Ingest Node
    et générateur de requêtes KQL pour la recherche de menaces.
    """

    @staticmethod
    def parse_syslog_grok(raw_log: str) -> dict:
        """
        Simule le traitement d'une règle Grok Logstash pour extraire
        les champs normalisés ECS (Elastic Common Schema).
        """
        # Ex: "Aug 08 04:30:00 srv-web-01 sshd[1042]: Failed password for root from 192.168.1.100 port 4444 ssh2"
        grok_pattern = r"(?P<timestamp>\A\w{3}\s+\d+\s+[\d:]+)\s+(?P<host>[\w-]+)\s+(?P<process>\w+)\[\d+\]:\s+(?P<message>.*)"
        match = re.match(grok_pattern, raw_log)

        if not match:
            return {"event.original": raw_log, "tags": ["_grokparsefailure"]}

        data = match.groupdict()
        msg = data["message"]

        # Extraction fine des détails SSH
        extracted_ip = None
        extracted_user = None
        ip_match = re.search(r"from\s+([\d.]+)", msg)
        user_match = re.search(r"for\s+(invalid user\s+)?(\w+)", msg)

        if ip_match:
            extracted_ip = ip_match.group(1)
        if user_match:
            extracted_user = user_match.group(2)

        return {
            "@timestamp": data["timestamp"],
            "host": {"name": data["host"]},
            "process": {"name": data["process"]},
            "source": {"ip": extracted_ip},
            "user": {"name": extracted_user},
            "message": msg,
            "event": {"category": "authentication", "outcome": "failure" if "Failed" in msg else "success"}
        }

    @staticmethod
    def build_ilm_policy_json() -> str:
        """Génère la politique ILM (Index Lifecycle Management) pour les logs de sécurité SIEM."""
        ilm_policy = {
            "policy": {
                "phases": {
                    "hot": {
                        "min_age": "0ms",
                        "actions": {
                            "rollover": {
                                "max_primary_shard_size": "50gb",
                                "max_age": "7d"
                            }
                        }
                    },
                    "warm": {
                        "min_age": "7d",
                        "actions": {
                            "shrink": {"number_of_shards": 1},
                            "forcemerge": {"max_num_segments": 1}
                        }
                    },
                    "cold": {
                        "min_age": "30d",
                        "actions": {
                            "freeze": {}
                        }
                    },
                    "delete": {
                        "min_age": "365d",
                        "actions": {
                            "delete": {}
                        }
                    }
                }
            }
        }
        return json.dumps(ilm_policy, indent=2)

# Exécution
print("=== ELASTIC SIEM INGESTION & ILM ENGINE ===")

raw_syslog = "Aug 08 04:30:00 srv-web-01 sshd[1042]: Failed password for root from 192.168.1.100 port 4444 ssh2"
parsed_ecs = ELKSIEMEngine.parse_syslog_grok(raw_syslog)

print("\n[+] Log Brut Normalisé au format Elastic Common Schema (ECS) :")
print(json.dumps(parsed_ecs, indent=2))

print("\n[+] Configuration de la Politique ILM (Conservation 1 An) :")
print(ELKSIEMEngine.build_ilm_policy_json())
```

---

## 3) Module — Guide des Requêtes KQL pour la Détection SOC (2h)

```markdown
# GUIDE DES REQUÊTES KQL (KIBANA QUERY LANGUAGE) — THREAT HUNTING

## 1. Détection de Brute Force SSH
```kql
event.category: "authentication" AND event.outcome: "failure" AND process.name: "sshd"
```

## 2. Détection d'Exécution PowerShell Encodée (Base64)
```kql
process.name: "powershell.exe" AND process.args: ("-e" OR "-encodedcommand" OR "-enc")
```

## 3. Recherche de Connexions vers des IPs Suspectes
```kql
destination.port: (4444 OR 8080 OR 1337) AND NOT source.ip: 10.0.0.0/8
```

## 4. Détection de Création d'Utilisateur Administrateur Windows
```kql
event.code: 4720 AND winlog.event_data.TargetUserName: *admin*
```
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ELK** | Elasticsearch, Logstash, Kibana — Suite logicielle open-source/elastic d'analyse de données et SIEM |
| **ILM** | Index Lifecycle Management — Gestion automatisée du cycle de vie des index Elasticsearch |
| **ECS** | Elastic Common Schema — Standard de nommage et de normalisation des champs de logs pour Elastic Security |
| **KQL** | Kibana Query Language — Syntaxe de requête intuitive utilisée dans Kibana |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le rôle du schéma **ECS (Elastic Common Schema)** dans Elastic Security SIEM ?
- A) Normaliser les noms de champs provenant de sources hétérogènes (ex: `source.ip`, `user.name`) pour permettre l'écriture de requêtes KQL et de règles de détection universelles
- B) Chiffrer la base de données
- C) Remplacer les processeurs Intel
- D) Valider les licences logicielles

**Réponse : A**

**Q2 :** Dans une politique ILM Elasticsearch, quelle phase permet de réduire la taille des index et de les fusionner (shrink & forcemerge) après la période d'ingestion active ?
- A) La phase WARM
- B) La phase HOT
- C) La phase DELETE
- D) La phase INITIAL

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
