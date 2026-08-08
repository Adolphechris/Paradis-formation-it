# TOME P7 — Certifications d'Élite & Spécialisations — Jour 341 (6h) : Threat Modeling Avancé — Méthodologies Industrielles (STRIDE-per-Element, PASTA 7-Steps, LINDDUN Privacy & Attack Trees)

> [!NOTE]
> **Objectif du jour :** Maîtriser la modélisation des menaces au niveau architecture d'entreprise avec une rigueur absolue : appliquer le **STRIDE-per-Element** sur des Data Flow Diagrams (DFD) de niveau 2, dérouler la méthodologie axée sur le risque **PASTA (Process for Attack Simulation and Threat Analysis)** en 7 étapes, conduire un modèle de menace axé sur la vie privée **LINDDUN**, et construire des **Attack Trees (Arbres d'Attaque)** quantifiés avec coûts et probabilités.
>
> **Compétences visées :** `SEC-TM-01` (A) — STRIDE-per-Element & DFD Decomposition | `SEC-TM-02` (A) — PASTA 7-Step Risk-Centric Threat Modeling & LINDDUN Privacy Framework

---

## 1) Module — Méthodologie PASTA & STRIDE-per-Element (2h)

### 📖 Narration/Intuition

La modélisation des menaces n'est pas un exercice abstrait : c'est l'analyse systématique de la surface d'attaque d'une architecture avant l'écriture de la première ligne de code.

Le cadre **PASTA (Process for Attack Simulation and Threat Analysis)** est une méthodologie en **7 étapes centrée sur le risque métier** qui aligne les objectifs de sécurité sur les impacts financiers et opérationnels :

```
┌────────────────────────────────────────────────────────────────────────┐
│ Stage 1 : Define Objectives (Business Impact, Compliance, Crown Jewels)│
├────────────────────────────────────────────────────────────────────────┤
│ Stage 2 : Define Technical Scope (Boundaries, Infrastructure, Services)│
├────────────────────────────────────────────────────────────────────────┤
│ Stage 3 : Application Decomposition (DFD Level 0/1/2, Trust Boundaries)│
├────────────────────────────────────────────────────────────────────────┤
│ Stage 4 : Threat Analysis (CTI Feeds, Threat Intel, Actor Profiling)  │
├────────────────────────────────────────────────────────────────────────┤
│ Stage 5 : Vulnerability & Weakness Analysis (CWE Mapping, SAST/DAST)  │
├────────────────────────────────────────────────────────────────────────┤
│ Stage 6 : Attack Modeling (Attack Trees, Exploitation Scenarios)     │
├────────────────────────────────────────────────────────────────────────┤
│ Stage 7 : Risk & Impact Analysis (Residual Risk, Countermeasures Cost) │
└────────────────────────────────────────────────────────────────────────┘
```

#### STRIDE-per-Element (Matrice d'Application DFD)

Chaque élément d'un Data Flow Diagram (DFD) est sujet à des catégories de menaces spécifiques :

| Éléments DFD | S (Spoofing) | T (Tampering) | R (Repudiation) | I (Info Disc.) | D (DoS) | E (Elev. Priv.) |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Process (Code/Service)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Data Store (DB/S3)** | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Data Flow (HTTP/gRPC)** | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ |
| **External Entity (User/API)**| ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |

---

## 2) Module — Moteur de Modélisation PASTA & Attack Trees (`threat_model_pasta.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from dataclasses import dataclass, asdict
from typing import List, Dict

@dataclass
class ThreatNode:
    id: str
    name: str
    stride_category: str
    cwe_id: str
    likelihood: float  # 0.0 à 1.0
    impact_score: float # 1.0 à 10.0
    mitigation: str

class PASTAEngine:
    """
    Moteur de modélisation des menaces fondé sur la méthodologie PASTA (7-Step Framework).
    Calcule le score de risque inhérent et génère l'arbre d'attaque quantifié.
    """

    def __init__(self, application_name: str, business_criticality: str):
        self.app_name = application_name
        self.criticality = business_criticality
        self.dfd_elements: Dict[str, str] = {}
        self.threat_tree: List[ThreatNode] = []

    def add_dfd_element(self, element_id: str, element_type: str, name: str):
        """Ajoute un élément DFD (Process, DataStore, DataFlow, ExternalEntity)."""
        valid_types = {"Process", "DataStore", "DataFlow", "ExternalEntity"}
        if element_type not in valid_types:
            raise ValueError(f"Type DFD invalide: {element_type}. Choix: {valid_types}")
        self.dfd_elements[element_id] = f"{element_type}: {name}"

    def register_threat(self, threat: ThreatNode):
        """Enregistre une menace modélisée dans l'arbre d'attaque."""
        self.threat_tree.append(threat)

    def calculate_risk_matrix() -> List[Dict]:
        """Calcule le risque calculé R = Likelihood x Impact x Business Criticality Multiplier."""
        crit_multiplier = {"CRITICAL": 1.5, "HIGH": 1.2, "MEDIUM": 1.0, "LOW": 0.8}.get(self.criticality, 1.0)
        risk_report = []

        for threat in self.threat_tree:
            risk_score = round(threat.likelihood * threat.impact_score * crit_multiplier * 10, 2)
            severity = "CRITICAL" if risk_score >= 80 else "HIGH" if risk_score >= 50 else "MEDIUM"
            
            risk_report.append({
                "threat_id": threat.id,
                "name": threat.name,
                "stride": threat.stride_category,
                "cwe": threat.cwe_id,
                "risk_score": risk_score,
                "severity": severity,
                "mitigation": threat.mitigation
            })
        return sorted(risk_report, key=lambda x: x["risk_score"], reverse=True)

# Initialisation du modèle PASTA pour une API Core Banking
engine = PASTAEngine("OpenBanking Core Gateway", "CRITICAL")

# Phase 3 : Décomposition DFD
engine.add_dfd_element("E1", "ExternalEntity", "Mobile App Client")
engine.add_dfd_element("P1", "Process", "API Gateway (Kong)")
engine.add_dfd_element("F1", "DataFlow", "mTLS gRPC Stream")
engine.add_dfd_element("D1", "DataStore", "PostgreSQL Ledger DB")

# Phase 4/5/6 : Identification des menaces STRIDE & Arbre d'Attaque
engine.register_threat(ThreatNode(
    id="T-01",
    name="Usurpation de jeton JWT d'administration",
    stride_category="Spoofing",
    cwe_id="CWE-287",
    likelihood=0.4,
    impact_score=9.5,
    mitigation="HSM-backed RS256 signing + short-lived tokens (15m) + JTI Revocation List"
))

engine.register_threat(ThreatNode(
    id="T-02",
    name="Attaque Man-in-the-Middle sur le flux gRPC interne",
    stride_category="Tampering",
    cwe_id="CWE-319",
    likelihood=0.2,
    impact_score=8.0,
    mitigation="Istio Strict mTLS avec rotation SPIFFE/SPIRE 24h"
))

engine.register_threat(ThreatNode(
    id="T-03",
    name="Exfiltration directe de la base de données via SQLi",
    stride_category="Information Disclosure",
    cwe_id="CWE-89",
    likelihood=0.3,
    impact_score=10.0,
    mitigation="Prepared Statements stricts + AWS GuardDuty RDS Protection + SAST CodeQL"
))

# Génération du rapport de risque PASTA Stage 7
risk_matrix = engine.calculate_risk_matrix()
print("=== PASTA STAGE 7: RISK & IMPACT ANALYSIS REPORT ===")
print(json.dumps(risk_matrix, indent=2, ensure_ascii=False))
```

---

## 3) Module — Framework LINDDUN Privacy Threat Modeling (2h)

```markdown
# LINDDUN PRIVACY THREAT MODELING FRAMEWORK

Le framework **LINDDUN** est le pendant de STRIDE dédié exclusivement à la **protection de la vie privée et des données personnelles (RGPD/CIPP/E)** :

| Catégorie LINDDUN | Threat Description | Risque RGPD Associé | Mitigation Technique |
|:---|:---|:---|:---|
| **L**inkability | Capacité à relier deux paquets de données concernant la même personne. | Profilage non consenti (Art. 22) | Pseudonymisation, k-Anonymity (k>=5). |
| **I**dentifiability | Possibilité de ré-identifier la personne derrière une donnée. | Violation de confidentialité (Art. 32) | Differential Privacy (ε-differential), Hashing avec sel. |
| **N**on-repudiation | Incapacité pour le sujet d'infirmer une action enregistrée. | Risque de fichage abusif | Données éphémères, purge automatique. |
| **D**etectability | Découverte de l'existence d'une donnée d'un sujet (ex: présence dans un registre médical). | Fuite d'informations sensibles (Art. 9) | Bruit statistique, Blind signatures. |
| **D**isclosure of Info| Divulgation directe de données à caractère personnel. | Violation de données (Art. 33/34) | Chiffrement au repos (AES-256-GCM) & en transit. |
| **U**nawareness | L'utilisateur n'est pas informé des traitements subis par ses données. | Manquement au devoir d'information (Art. 13/14) | Notices d'information claires, portail DSAR. |
| **N**on-compliance | Non-conformité aux exigences réglementaires et légale. | Sanctions administratives (Art. 83) | Registre des traitements (Art. 30), DPIA/AIPD. |
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PASTA** | Process for Attack Simulation and Threat Analysis — Méthodologie en 7 étapes axée sur le risque |
| **LINDDUN** | Framework de Threat Modeling axé sur la vie privée (Linkability, Identifiability, Non-repudiation, Detectability, Disclosure, Unawareness, Non-compliance) |
| **DFD** | Data Flow Diagram — Diagramme de flux de données (Niveaux 0, 1, 2) servant de base au Threat Modeling |
| **SPIFFE/SPIRE** | Standards open-source CNCF fournissant des identités cryptographiques sécurisées aux microservices |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans la méthodologie **PASTA**, quelle est la spécificité de l'Étape 1 (Stage 1) par rapport à STRIDE classique ?
- A) Elle commence par définir les objectifs métiers et les impacts financiers/légaux (Business Objectives) afin d'aligner l'effort de sécurité sur la valeur réelle des actifs
- B) Elle installe un pare-feu réseau
- C) Elle génère le code Python
- D) Elle remplace les tests d'intrusion

**Réponse : A**

**Q2 :** Selon le modèle **STRIDE-per-Element**, quels types de menaces s'appliquent spécifiquement à un **Data Store (base de données / S3)** ?
- A) Tampering (T), Repudiation (R), Information Disclosure (I), et Denial of Service (D)
- B) Spoofing (S) et Elevation of Privilege (E) uniquement
- C) Toutes les 6 sans exception
- D) Aucune menace ne touche les Data Stores

**Réponse : A**

**Q3 :** Dans le framework de vie privée **LINDDUN**, que désigne le concept de **Linkability** ?
- A) La capacité pour un attaquant d'associer deux jeux de données ou deux transactions distinctes à une même personne concernée, permettant la création d'un profil non consenti
- B) La vitesse de connexion réseau
- C) La création de liens hypertexte
- D) La signature des certificats SSL

**Réponse : A**

**Q4 :** Qu'est-ce qu'un **Attack Tree (Arbre d'Attaque)** dans la modélisation des menaces ?
- A) Une structure arborescente représentant l'objectif final d'un attaquant au sommet (Root Node) et les différentes combinaisons de sous-étapes et techniques (Child Nodes) nécessaires pour l'atteindre
- B) Un schéma des serveurs DNS
- C) Un algorithme d'apprentissage automatique
- D) Un rapport de scan de vulnérabilités

**Réponse : A**

**Q5 :** Quel composant d'un Data Flow Diagram (DFD) représente la limite de confiance (**Trust Boundary**) ?
- A) La frontière (ligne pointillée) séparant deux zones réseau ou deux niveaux de privilèges différents (ex: entre le navigateur client et l'API Gateway)
- B) Le serveur de base de données
- C) Le fichier de log
- D) L'utilisateur physique

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
