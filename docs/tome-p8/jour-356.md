# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 356 (6h) : Threat Intelligence Platforms (MISP, OpenCTI, STIX/TAXII) — Ingestion, Normalisation & Opérationnalisation des IoCs en SOC Multi-Environnements

> [!NOTE]
> **Objectif du jour :** Maîtriser l'intégration opérationnelle des plateformes de **Threat Intelligence (CTI)** au sein du SOC : déployer et interconnecter **MISP** (Malware Information Sharing Platform) et **OpenCTI**, manipuler les standards de modélisation **STIX 2.1** et de transport **TAXII 2.1**, et créer des pipelines d'automatisation poussant les Indicateurs de Compromission (IoCs) enrichis vers les SIEM, EDR et Pare-Feux de bordure.
>
> **Compétences visées :** `CTI-01` (A) — MISP/OpenCTI Enterprise Architecture & IoC Management | `CTI-02` (A) — STIX/TAXII 2.1 Parsing, Threat Modeling & SIEM/EDR Ingestion Pipelines

---

## 1) Module — Standards CTI STIX 2.1 / TAXII 2.1 & Architectures TIP (2h)

### 📖 Narration/Intuition

Sans Threat Intelligence (CTI), un SOC est réactif et aveugle aux campagnes d'attaque émergentes. Une **Threat Intelligence Platform (TIP)** centralise les flux de renseignement (OSINT, ISACs, CERTs, feeds commerciaux), les déduplique, calcule un score de confiance (Confidence Score) et extrait les IoCs structurés en objets **STIX 2.1**.

```
[ Flux CTI Externe : FS-ISAC, CERTs, MISP Feeds, DarkWeb ]
                         │
                         ▼ (TAXII 2.1 / REST API)
┌─────────────────────────────────────────────────────────────┐
│ THREAT INTELLIGENCE PLATFORM (MISP / OpenCTI)               │
│  - Déduplication & Calcul du Score de Confiance (0-100)      │
│  - Normalisation STIX 2.1 (Domain-Object / Relationship)    │
└────────────────────────┬────────────────────────────────────┘
                         │ (Push IoCs Enrichis & Validés)
       ┌─────────────────┼─────────────────┐
       ▼                 ▼                 ▼
[ SIEM Splunk/ELK ]  [ EDR CrowdStrike ]  [ WAF / Firewalls ]
(Règles de Corrélation) (Blocage Hashs)    (Blocage IPs/Domaines)
```

#### Objets Cœur STIX 2.1 (Domain Objects)

| Objet STIX 2.1 | Rôle | Exemple Concret |
|:---:|:---|:---|
| **Indicator** | Pattern de détection technique d'une menace | `[ipv4-addr:value = '185.220.101.5']` |
| **Observed-Data** | Donnée brute constatée sur le réseau/système | Connexion réseau observée à 04h00 |
| **Threat-Actor** | Profil de l'attaquant ou du groupe sponsorisé | APT28 / LockBit 3.0 Group |
| **Attack-Pattern** | Description d'une technique d'attaque (TTP) | `T1055.012 - Process Hollowing` |
| **Malware** | Identification d'une famille de code malveillant | Ransomware LockBit v3 |

---

## 2) Module — Outillage CTI STIX 2.1 & Moteur MISP (`misp_stix_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, List

class MISPSTIXEngine:
    """
    Moteur de parsing, normalisation et génération d'objets STIX 2.1
    et d'exportation d'IoCs pour l'ingestion SIEM/EDR.
    """

    def __init__(self, org_name: str = "PARADIS-BANK-CTI"):
        self.org_name = org_name
        self.stix_bundle: Dict[str, list] = {"type": "bundle", "id": f"bundle--{uuid.uuid4()}", "objects": []}

    def create_stix_indicator(self, pattern: str, pattern_type: str, valid_days: int = 30) -> dict:
        """Génère un objet STIX 2.1 Indicator conforme au standard OASIS."""
        indicator_id = f"indicator--{uuid.uuid4()}"
        now = datetime.now(timezone.utc).isoformat()
        
        indicator = {
            "type": "indicator",
            "spec_version": "2.1",
            "id": indicator_id,
            "created": now,
            "modified": now,
            "name": f"IoC Detection Pattern: {pattern}",
            "pattern": pattern,
            "pattern_type": pattern_type,
            "valid_from": now,
            "confidence": 85,
            "created_by_ref": f"identity--{uuid.uuid5(uuid.NAMESPACE_DNS, self.org_name)}"
        }
        self.stix_bundle["objects"].append(indicator)
        return indicator

    def export_iocs_for_firewall(self, min_confidence: int = 70) -> List[str]:
        """Extrait la liste brute des adresses IP d'attaque pour injection Firewall."""
        ip_list = []
        for obj in self.stix_bundle["objects"]:
            if obj.get("type") == "indicator" and obj.get("confidence", 0) >= min_confidence:
                pattern = obj.get("pattern", "")
                # Extraction de l'IP du pattern STIX [ipv4-addr:value = 'X.X.X.X']
                if "ipv4-addr:value" in pattern:
                    ip = pattern.split("'")[1]
                    ip_list.append(ip)
        return ip_list

# Démonstration du Moteur CTI
cti_engine = MISPSTIXEngine()

# Création d'objets STIX 2.1 pour une campagne de Ransomware
ind1 = cti_engine.create_stix_indicator("[ipv4-addr:value = '185.220.101.5']", "stix")
ind2 = cti_engine.create_stix_indicator("[file:hashes.'SHA-256' = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855']", "stix")

print("=== CTI STIX 2.1 BUNDLE GENERATED ===")
print(json.dumps(cti_engine.stix_bundle, indent=2))

print("\n=== EXTRACTED IOCS FOR FIREWALL AUTO-BLOCK ===")
fw_ips = cti_engine.export_iocs_for_firewall()
print("IPs à bloquer :", fw_ips)
```

---

## 3) Module — Fiche Technique TAXII 2.1 Client API (2h)

```python
# EXEMPLE DE CLIENT TAXII 2.1 (POUR INGESTION AUTOMATIQUE SOC)
import requests

def fetch_taxii21_collection(discovery_url: str, api_key: str, collection_id: str):
    """
    Interroge un serveur TAXII 2.1 distant pour télécharger les derniers bundles STIX 2.1.
    """
    headers = {
        "Accept": "application/taxii+json;version=2.1",
        "Authorization": f"Bearer {api_key}"
    }
    
    endpoint = f"{discovery_url}/collections/{collection_id}/objects/"
    print(f"[*] Interrogation du Serveur TAXII 2.1 : {endpoint}")
    
    # Simulation d'appel API TAXII
    response_data = {
        "more": False,
        "objects": [
            {
                "type": "indicator",
                "spec_version": "2.1",
                "pattern": "[domain-name:value = 'c2-malicious-finance.net']",
                "confidence": 90
            }
        ]
    }
    return response_data

# Exec
taxii_res = fetch_taxii21_collection("https://cti-hub.paradis-bank.com/taxii2", "taxii_token_991", "collec_financial_threats")
print("[+] Objets STIX reçus via TAXII 2.1 :", taxii_res["objects"][0]["pattern"])
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **STIX** | Structured Threat Information Expression — Standard ouvert JSON de représentation des menaces (OASIS) |
| **TAXII** | Trusted Automated Exchange of Intelligence Information — Protocole applicatif Web (HTTPS/REST) de transport STIX |
| **MISP** | Malware Information Sharing Platform — Plateforme open-source majeure de partage d'IoCs |
| **OpenCTI** | Plateforme moderne de Threat Intelligence basée sur un graphe de connaissances STIX 2.1 |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle est la différence fondamentale entre les standards **STIX 2.1** et **TAXII 2.1** dans l'écosystème CTI ?
- A) STIX 2.1 est le langage/format de données (JSON) qui modélise la menace et ses relations, tandis que TAXII 2.1 est le protocole de transport (API REST/HTTPS) qui permet d'échanger les données STIX
- B) STIX sert à créer des machines virtuelles, TAXII à gérer les bases SQL
- C) STIX est réservé à Windows, TAXII à Linux
- D) Il n'y a aucune différence

**Réponse : A**

**Q2 :** Dans la spécification STIX 2.1, quel est le rôle d'un objet de type **Indicator** ?
- A) Définir un motif de détection technique (Pattern) permettant aux systèmes défensifs (SIEM, EDR) de repérer une présence malveillante
- B) Stocker le mot de passe root du serveur
- C) Rédiger un contrat de travail
- D) Récompenser les analystes SOC

**Réponse : A**

**Q3 :** Pourquoi est-il critique de filtrer les IoCs par un **Score de Confiance (Confidence Score)** avant de les injecter automatiquement sur les Pare-Feux de bordure ?
- A) Pour éviter d'injecter des adresses IP légitimes ou mal qualifiées qui provoqueraient des dénis de service applicatifs (Faux Positifs) sur des services critiques
- B) Pour accélérer la vitesse du processeur
- C) Pour réduire la taille du fichier PDF
- D) C'est une contrainte matérielle uniquement

**Réponse : A**

**Q4 :** Quelle plateforme open-source moderne s'appuie sur un modèle de données sous forme de **Graphe de Connaissances** STIX 2.1 pour visualiser les relations entre attaquants, malwares et infrastructures ?
- A) OpenCTI
- B) MS Paint
- C) Microsoft Word
- D) FileZilla

**Réponse : A**

**Q5 :** Qu'est-ce qu'un **ISAC (Information Sharing and Analysis Center)** ?
- A) Une organisation à but non lucratif permettant aux entreprises d'un même secteur critique (ex: FS-ISAC pour la finance) de partager des renseignements de cybermenaces en temps réel
- B) Un logiciel de nettoyage de disque
- C) Un type de câble réseau
- D) Une norme de câblage électrique

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
