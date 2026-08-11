# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 543 (6h) : Threat Intelligence & Cyber Kill Chain : CTI, MITRE ATT&CK & Attribution des Menaces

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre les **niveaux de Threat Intelligence (Stratégique, Opérationnel, Tactique)** et leurs cas d'usage dans une organisation
> - Maîtriser le framework **MITRE ATT&CK** (Techniques, Tactiques, Groupes d'attaquants) pour la détection et la réponse
> - Appliquer la **Cyber Kill Chain** (Lockheed Martin) pour analyser et détecter une attaque à chaque étape
> - Utiliser des flux **CTI (Cyber Threat Intelligence)** : MISP, OpenCTI, STIX/TAXII pour l'échange d'indicateurs de compromission (IOC)
>
> **Compétences visées :** `SEC-08` (A), `SEC-09` (A) — Threat Intelligence, CTI, MITRE ATT&CK

---

## Module 1 — Threat Intelligence : Niveaux & Cycle de Vie (2h)

### 📖 Intuition & Narration

La **Threat Intelligence (Renseignement sur les Menaces)** est le processus de collecte, d'analyse et de diffusion d'informations sur les cybermenaces dans le but d'améliorer la prise de décision sécuritaire. Elle transforme des **données brutes** (adresses IP, hashs de malware) en **connaissances exploitables** (profil d'un groupe APT, ses TTP, ses cibles préférées).

Trois niveaux d'intelligence coexistent et s'adressent à des audiences différentes :

```
NIVEAUX DE THREAT INTELLIGENCE

  ┌─────────────────────────────────────────────────────────────────┐
  │  STRATÉGIQUE                                                     │
  │  Audience : Direction (COMEX, Conseil d'Administration)          │
  │  Contenu  : Tendances, acteurs géopolitiques, risques sectoriels │
  │  Exemple  : "Les groupes APT nord-coréens ciblent les banques   │
  │             européennes depuis Q1 2024 pour financer l'État."    │
  ├─────────────────────────────────────────────────────────────────┤
  │  OPÉRATIONNEL                                                    │
  │  Audience : RSSI, équipes SOC/IR                                 │
  │  Contenu  : Campagnes en cours, TTP (Tactics/Techniques/Procs)  │
  │  Exemple  : "Campagne phishing ciblant CFO banques EU via PDF    │
  │             piégé : LNK → PowerShell → Cobalt Strike"           │
  ├─────────────────────────────────────────────────────────────────┤
  │  TACTIQUE (IOC)                                                  │
  │  Audience : Équipes SOC, SIEM, Threat Hunters                    │
  │  Contenu  : IOC : IP, domaines, hashs, URLs malveillantes       │
  │  Exemple  : IP: 185.220.101.47, Hash: 3a4b5c..., Domain: evil.ru│
  └─────────────────────────────────────────────────────────────────┘
```

### 🔍 Cycle de Vie de la Threat Intelligence

```
CYCLE F3EAD (FIND → FIX → FINISH → EXPLOIT → ANALYZE → DISSEMINATE)

  1. COLLECT    → Sources : OSINT, SIGINT, HUMINT, CYBINT, FS-ISAC, CERT
  2. PROCESS    → Normalisation des données (STIX 2.1, CSV, JSON)
  3. ANALYZE    → Contextualisaton, attribution, corrélation
  4. PRODUCE    → Rapport CTI, tableau de bord, alertes SIEM
  5. DISSEMINATE→ Diffusion (MISP, OpenCTI, TAXII Server)
  6. FEEDBACK   → Retours des équipes opérationnelles → amélioration
```

---

## Module 2 — MITRE ATT&CK & Cyber Kill Chain (2h)

### 🔍 Framework MITRE ATT&CK — Structure & Navigation

**MITRE ATT&CK** (Adversarial Tactics, Techniques & Common Knowledge) est une base de données mondiale des tactiques et techniques d'attaque observées dans des intrusions réelles. Il est organisé en :

- **14 Tactiques** (colonnes de la matrice) : Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, Command & Control, Exfiltration, Impact...
- **Techniques et Sous-techniques** : plus de 600 techniques documentées avec des exemples concrets et des groupes d'attaquants associés.

```
EXEMPLE D'ANALYSE MITRE ATT&CK — ATTAQUE RANSOMWARE TYPE

  TACTIQUE               TECHNIQUE              EXEMPLE
  ─────────────────────────────────────────────────────────────────
  Initial Access     →   T1566.001 Phishing     Spearphishing avec PDF malveillant
                         (Spearphishing Attach.)
  Execution          →   T1059.001 PowerShell   Script PS encodé Base64
  Persistence        →   T1053.005 Sched. Task  Tâche planifiée "WindowsUpdate.exe"
  Privilege Escalation→  T1078 Valid Accounts   Utilisation de credentials volés
  Lateral Movement   →   T1021.001 Remote Serv. RDP depuis WKSTN compromis
  Collection         →   T1005 Local Data       7-Zip sur \\SRV-FS-01\Finance
  C2                 →   T1071.001 Web Protocol HTTP vers 185.220.101.47:443
  Impact             →   T1486 Data Encrypted   Chiffrement LockBit 3.0 + note README
```

### 🛠️ Script Python : MITRE ATT&CK IOC Correlator

```python
#!/usr/bin/env python3
"""
PARADIS — CTI IOC Correlator
Reçoit des logs SIEM et corrèle les IOC avec une base de Threat Intelligence locale.
En production, cette base serait alimentée depuis MISP via l'API PyMISP.
"""
import json
from dataclasses import dataclass, field
from typing import List, Set
from datetime import datetime

@dataclass
class ThreatIndicator:
    ioc_type: str   # "IP", "DOMAIN", "HASH_SHA256", "URL"
    value: str
    threat_actor: str
    campaign: str
    mitre_technique: str
    severity: str   # "CRITIQUE", "HAUTE", "MOYENNE"

class CTICorrelator:
    def __init__(self):
        # Base de Threat Intelligence (en production : chargée depuis MISP via API)
        self.ioc_database: List[ThreatIndicator] = [
            ThreatIndicator("IP", "185.220.101.47", "APT28 (Fancy Bear)", "IRONGATE-2024", "T1071.001", "CRITIQUE"),
            ThreatIndicator("DOMAIN", "update-service-microsoft.ru", "Sandworm", "NOTPETYA-2.0", "T1566.002", "CRITIQUE"),
            ThreatIndicator("HASH_SHA256", "3a4b5c6d7e8f9012345678901234567890abcdef1234567890abcdef12345678", "LockBit 3.0", "RANSOMWARE-2024", "T1486", "CRITIQUE"),
            ThreatIndicator("IP", "203.0.113.42", "Lazarus Group", "HIDDEN_COBRA", "T1078", "HAUTE"),
            ThreatIndicator("URL", "http://cdn-images.evil.ru/payload.exe", "APT29", "COZY_BEAR_DROP", "T1105", "CRITIQUE"),
        ]

        # Index pour recherche rapide O(1)
        self._ip_index: dict = {i.value: i for i in self.ioc_database if i.ioc_type == "IP"}
        self._domain_index: dict = {i.value: i for i in self.ioc_database if i.ioc_type == "DOMAIN"}
        self._hash_index: dict = {i.value: i for i in self.ioc_database if i.ioc_type == "HASH_SHA256"}

    def correlate_log(self, log_entry: dict) -> List[ThreatIndicator]:
        hits = []
        # Vérifier les IPs
        for field_name in ["src_ip", "dst_ip", "proxy_dst"]:
            ip = log_entry.get(field_name, "")
            if ip in self._ip_index:
                hits.append(self._ip_index[ip])

        # Vérifier les domaines
        domain = log_entry.get("dns_query", "")
        if domain in self._domain_index:
            hits.append(self._domain_index[domain])

        # Vérifier les hashs
        file_hash = log_entry.get("file_hash_sha256", "")
        if file_hash in self._hash_index:
            hits.append(self._hash_index[file_hash])

        return hits

    def analyze_log_stream(self, logs: List[dict]):
        print("=" * 65)
        print("  PARADIS CTI CORRELATOR — ANALYSE DU FLUX DE LOGS")
        print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 65)
        total_hits = 0

        for i, log in enumerate(logs, 1):
            hits = self.correlate_log(log)
            if hits:
                total_hits += len(hits)
                for hit in hits:
                    print(f"\n  [🚨 {hit.severity}] CORRESPONDANCE CTI DÉTECTÉE")
                    print(f"    Log #{i}        : {json.dumps(log, ensure_ascii=False)}")
                    print(f"    IOC           : [{hit.ioc_type}] {hit.value}")
                    print(f"    Acteur        : {hit.threat_actor}")
                    print(f"    Campagne      : {hit.campaign}")
                    print(f"    MITRE ATT&CK  : {hit.mitre_technique}")

        print(f"\n[RÉSUMÉ] Logs analysés : {len(logs)} | Correspondances CTI : {total_hits}")
        if total_hits > 0:
            print("[ACTION REQUISE] Escalade immédiate vers le SOC Tier 2 et le RSSI.")
        else:
            print("[✅ PROPRE] Aucune correspondance avec la base CTI.")

if __name__ == "__main__":
    sample_logs = [
        {"timestamp": "2024-03-15T02:14:33Z", "src_ip": "192.168.1.105", "dst_ip": "185.220.101.47", "proto": "HTTPS", "dst_port": 443},
        {"timestamp": "2024-03-15T02:15:01Z", "src_ip": "192.168.1.105", "dns_query": "update-service-microsoft.ru"},
        {"timestamp": "2024-03-15T02:16:44Z", "src_ip": "192.168.1.105", "file_hash_sha256": "3a4b5c6d7e8f9012345678901234567890abcdef1234567890abcdef12345678"},
        {"timestamp": "2024-03-15T02:17:00Z", "src_ip": "10.10.0.5", "dst_ip": "8.8.8.8", "proto": "DNS"},  # Trafic normal
    ]

    correlator = CTICorrelator()
    correlator.analyze_log_stream(sample_logs)
```

---

## Module 3 — MISP & OpenCTI : Partage d'IOC (1h30)

### 🔍 MISP — Malware Information Sharing Platform

**MISP** est la plateforme open-source de référence pour le partage de Threat Intelligence au sein d'une communauté (ISAC, CERTs nationaux). Les données sont structurées au format **STIX 2.1** et distribuées via le protocole **TAXII 2.1**.

```bash
#!/bin/bash
# Déploiement de MISP avec Docker Compose (production-lite)
cat > docker-compose-misp.yml << 'EOF'
version: "3.8"
services:
  misp:
    image: coolacid/misp-docker:latest
    ports:
      - "443:443"
    environment:
      - MISP_BASEURL=https://misp.paradis.internal
      - MISP_ADMIN_EMAIL=soc@paradis.fr
      - MISP_ADMIN_PASSPHRASE=P4r4d1s!S3cur3d
    volumes:
      - misp_data:/var/www/MISP/app/files
volumes:
  misp_data:
EOF

docker compose -f docker-compose-misp.yml up -d
echo "[✅] MISP déployé sur https://localhost:443"
echo "[*] Configurer un Sync Server avec le CERT-FR pour recevoir les IOC nationaux."
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CTI** | Cyber Threat Intelligence — Renseignement sur les cybermenaces |
| **IOC** | Indicator of Compromise — Indicateur de compromission (IP, hash, domaine malveillant) |
| **TTP** | Tactics, Techniques and Procedures — Méthodes opérationnelles d'un groupe d'attaquants |
| **STIX** | Structured Threat Information Expression — Format standard de représentation des IOC |
| **TAXII** | Trusted Automated eXchange of Intelligence Information — Protocole de transport des IOC STIX |
| **APT** | Advanced Persistent Threat — Groupe d'attaquants sophistiqués, souvent étatiques |

---

## Exercices Pratiques

### Exercice 1 — Cartographie MITRE ATT&CK

Un analyste SOC observe les événements suivants dans le SIEM :
1. À T+0 : E-mail avec pièce jointe `.lnk` reçu par 3 employés du service Finance.
2. À T+5min : Processus PowerShell encodé (Base64) lancé depuis `outlook.exe`.
3. À T+12min : Connexion RDP depuis le poste WKSTN-FIN-05 vers SRV-SQL-PROD.
4. À T+25min : Volume de chiffrement massif sur `\\SRV-SQL-PROD\Données_Finance`.

Identifiez la technique MITRE ATT&CK correspondant à chaque étape.

**Corrigé guidé :**
1. **T1566.001** — Phishing: Spearphishing Attachment (Initial Access)
2. **T1059.001** — Command and Scripting Interpreter: PowerShell (Execution)
3. **T1021.001** — Remote Services: Remote Desktop Protocol (Lateral Movement)
4. **T1486** — Data Encrypted for Impact (Impact → Ransomware)

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la principale différence entre la **Threat Intelligence Stratégique** et la **Threat Intelligence Tactique** ?

- A) Elles sont identiques mais présentées à des audiences différentes.
- B) La Threat Intelligence Stratégique s'adresse à la direction avec des tendances et des risques sectoriels globaux, tandis que la Tactique fournit des IOC concrets (IP, hashs) aux équipes SOC pour la détection immédiate. ✅
- C) La Tactique est plus fiable que la Stratégique.
- D) La Stratégique est fournie par les outils automatiques, la Tactique par des experts humains.

**Q2.** Dans le framework **MITRE ATT&CK**, que représente une **Tactique** ?

- A) Une étape technique précise (ex: injection SQL).
- B) L'objectif immédiat qu'un attaquant cherche à atteindre (ex: Persistence, Lateral Movement, Exfiltration) — le "pourquoi" d'une action. ✅
- C) Un outil spécifique utilisé par l'attaquant.
- D) Le nom du groupe d'attaquants.

**Q3.** Qu'est-ce que **MISP (Malware Information Sharing Platform)** ?

- A) Un antivirus managé pour les endpoints.
- B) Une plateforme open-source permettant aux organisations de partager des IOC, des événements de threat intelligence et des rapports en temps réel avec d'autres membres d'une communauté de confiance. ✅
- C) Un scanner de vulnérabilités web.
- D) Un gestionnaire de patchs Windows.

**Q4.** Le format **STIX 2.1** est utilisé pour :

- A) Configurer des firewalls de nouvelle génération.
- B) Standardiser la représentation et l'échange de Cyber Threat Intelligence (IOC, acteurs, campagnes, TTP) entre différents outils et organisations. ✅
- C) Compresser les données réseau.
- D) Générer des certificats TLS.

**Q5.** Selon la **Cyber Kill Chain** de Lockheed Martin, à quelle étape correspond le fait que l'attaquant chiffre et exfiltre des données vers son serveur C2 ?

- A) Weaponization (armement)
- B) Delivery (livraison)
- C) Actions on Objectives (actions sur les objectifs) ✅
- D) Installation (installation)

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
