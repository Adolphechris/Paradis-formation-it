# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 257 (6h) : Threat Intelligence Opérationnelle & CTI Platform (MISP, OpenCTI, Diamond Model & STIX 2.1 Standard)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'ingénierie et l'automatisation de la **Cyber Threat Intelligence (CTI)** de niveau opérationnel : déployer et intégrer la plateforme **OpenCTI** et **MISP**, appliquer la méthodologie du **Diamond Model of Intrusion Analysis**, modéliser des menaces complexes avec le standard **STIX 2.1**, et ingérer des indicateurs de compromission (IoC) directement dans un SIEM.
>
> **Compétences visées :** `CTI-01` (A) — Threat Intelligence Platforms (OpenCTI/MISP) | `CTI-02` (A) — Diamond Model & STIX 2.1 Modeling

---

## 1) Module — Plateformes CTI (MISP & OpenCTI) (1h30)

### 📖 Narration/Intuition

La **Threat Intelligence (CTI)** opérationnelle consiste à collecter, analyser et structurer les données sur les cybermenaces pour appuyer la prise de décision stratégique et alimenter les défenses techniques (SIEM, EDR, WAF). **MISP (Malware Information Sharing Platform)** et **OpenCTI** sont les deux standards incontournables du marché open-source pour le stockage et la corrélation d'IoC et de rapports de menaces.

### 🛠️ Atelier Pratique

**Interaction Python avec l'API OpenCTI via `pycti` (`opencti_ingest.py`) :**

```python
from pycti import OpenCTIApiClient

# Configuration de la connexion OpenCTI
OPENCTI_URL = "http://localhost:8080"
OPENCTI_TOKEN = "YOUR_API_TOKEN_HERE"

client = OpenCTIApiClient(OPENCTI_URL, OPENCTI_TOKEN)

# 1) Création d'une entité Threat Actor (APT Group)
threat_actor = client.threat_actor.create(
    name="APT29 (Cozy Bear)",
    description="Groupe d'espionnage parrainé par un État ciblant les gouvernements et le secteur financier.",
    threat_actor_types=["espionage"],
    confidence=90
)
print(f"[+] Threat Actor créé ID: {threat_actor['id']}")

# 2) Ajout d'un Indicator (Adresse IP malveillante)
indicator = client.indicator.create(
    name="C2 Server IP - APT29 Campaign",
    description="Adresse IP utilisée pour le C2 Cobalt Strike dans la campagne récente.",
    pattern_type="stix",
    pattern="[ipv4-addr:value = '198.51.100.45']",
    x_opencti_main_observable_type="IPv4-Addr",
    confidence=85
)
print(f"[+] Indicateur CTI créé ID: {indicator['id']}")
```

---

## 2) Module — Diamond Model of Intrusion Analysis (1h30)

### 📖 Narration/Intuition

Le **Diamond Model** est un cadre d'analyse formel qui modélise chaque événement d'intrusion selon 4 nœuds fondamentaux interconnectés : **Adversary** (L'attaquant), **Capability** (Les outils/malwares), **Infrastructure** (Serveurs C2, domaines) et **Victim** (La cible).

```
                 [ Adversary ]
                  /         \
                 /           \
     [ Capability ] <-----> [ Infrastructure ]
                 \           /
                  \         /
                   [ Victim ]
```

### 🛠️ Atelier Pratique

**Modélisation d'une intrusion selon le Diamond Model (`diamond_model_analysis.json`) :**

```json
{
  "event_id": "INC-2026-8901",
  "diamond_model": {
    "adversary": {
      "operator": "APT41",
      "motivation": "Cyber-espionnage et gain financier",
      "origin": "Chine"
    },
    "capability": {
      "malware": "COBALT STRIKE BEACON",
      "tools": ["Mimikatz", "Chisel", "Certipy"],
      "exploits": ["CVE-2024-3094", "ADCS ESC1"]
    },
    "infrastructure": {
      "c2_ips": ["203.0.113.88", "198.51.100.12"],
      "domains": ["update-microsoft-service.com"],
      "protocol": "HTTPS (TLS 1.3 Malleable C2)"
    },
    "victim": {
      "organization": "Banque Centrale BCC",
      "assets": ["DC01.company.local", "SWIFT-Gateway-01"],
      "industry": "Finance / Banque"
    }
  }
}
```

---

## 3) Module — Standard STIX 2.1 & Automatisation TAXII (3h)

### 📖 Narration/Intuition

**STIX 2.1 (Structured Threat Information Expression)** est le langage JSON standardisé au niveau mondial pour exprimer les informations de menaces. Il définit des objets (SDO - STIX Domain Objects) comme `attack-pattern`, `campaign`, `indicator`, `malware`, `threat-actor`, et leurs relations (SRO - STIX Relationship Objects).

### 🛠️ Atelier Pratique

**Génération d'un bundle STIX 2.1 en Python avec `stix2` (`stix2_bundle_builder.py`) :**

```python
from stix2 import Indicator, ThreatActor, Relationship, Bundle

# 1) Définir l'attaquant (ThreatActor)
ta = ThreatActor(
    name="APT-FIN-99",
    threat_actor_types=["cybercrime"],
    description="Groupe spécialisé dans le vol de fonds interbancaires."
)

# 2) Définir l'indicateur (Indicator)
ind = Indicator(
    indicator_types=["malicious-activity"],
    pattern="[file:hashes.'SHA-256' = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855']",
    pattern_type="stix",
    description="Hash SHA-256 du dropper de ransomware bank_loader.exe"
)

# 3) Relier l'indicateur à l'attaquant (Relationship)
rel = Relationship(
    source_ref=ta.id,
    target_ref=ind.id,
    relationship_type="uses"
)

# 4) Créer le Bundle STIX 2.1 prêt pour le partage TAXII 2.1
stix_bundle = Bundle(objects=[ta, ind, rel])
print(stix_bundle.serialize(pretty=True))
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OpenCTI** | Plateforme open-source de gestion et de visualisation de Threat Intelligence |
| **MISP** | Malware Information Sharing Platform — Plateforme d'échange d'IoC open-source |
| **STIX** | Structured Threat Information Expression — Format JSON de modélisation de menaces |
| **TAXII** | Trusted Automated Exchange of Intelligence Information — Protocole REST de transport STIX |
| **SDO / SRO** | STIX Domain Object / STIX Relationship Object — Briques fondamentales de STIX 2.1 |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quels sont les 4 piliers du Diamond Model of Intrusion Analysis ?
- A) Adversary, Capability, Infrastructure, Victim
- B) Threat, Vulnerability, Asset, Impact
- C) Confidentiality, Integrity, Availability, Authenticity
- D) Identify, Protect, Detect, Respond

**Réponse : A**

**Q2 :** Quel standard de format de données JSON est utilisé par TAXII 2.1 pour la transmission d'informations CTI ?
- A) STIX 2.1
- B) OpenIOC
- C) CEF
- D) Syslog

**Réponse : A**

**Q3 :** Quelle est la différence principale entre OpenCTI et MISP ?
- A) OpenCTI se concentre sur la modélisation sous forme de graphes de connaissances (knowledge graph STIX 2.1), tandis que MISP est historiquement axé sur le partage d'IoC (IP, hashs, domaines)
- B) MISP est payant, OpenCTI est gratuit
- C) OpenCTI ne supporte pas Python
- D) MISP ne fonctionne que sous Windows

**Réponse : A**

**Q4 :** Dans STIX 2.1, quel objet représente une technique ou tactique d'attaque spécifique (généralement liée à MITRE ATT&CK) ?
- A) `attack-pattern`
- B) `indicator`
- C) `malware`
- D) `vulnerability`

**Réponse : A**

**Q5 :** Quel protocole est utilisé pour acheminer de manière automatisée les bundles STIX 2.1 entre organisations de confiance ?
- A) TAXII 2.1
- B) HTTPS POST simple
- C) FTP
- D) MQTT

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
