# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 354 (6h) : SIGMA Rule Engineering — Cross-Platform Detection (Rule Writing, Conversion to Elastic/Splunk & False Positive Tuning)

> [!NOTE]
> **Objectif du jour :** Maîtriser le standard universel de détection de menaces **SIGMA (Generic Signature Format for Log Events)** : écrire des règles SIGMA avancées pour intercepter les TTPs du framework MITRE ATT&CK, utiliser **sigmac / uncoder.io / pySigma** pour convertir automatiquement les règles SIGMA en requêtes cibles (Elastic KQL, Splunk SPL, QRadar AQL, Microsoft Sentinel KQL), et appliquer une méthodologie rigoureuse de **False Positive Tuning**.
>
> **Compétences visées :** `SIGMA-01` (A) — Generic SIGMA Rule Writing & MITRE ATT&CK Mapping | `SIGMA-02` (A) — Transpilation to SIEM Targets (KQL/SPL) & False Positive Reduction

---

## 1) Module — Le Standard SIGMA & Transpilation Multi-SIEM (2h)

### 📖 Narration/Intuition

Écrire des règles de détection directement dans la syntaxe propriétaire d'un SIEM (SPL pour Splunk, KQL pour Elastic) crée un problème de dépendance. **SIGMA** est le format YAML ouvert ("YARA pour les logs") permettant de rédiger des règles indépendantes de la plateforme et de les transpiler automatiquement vers n'importe quel SIEM.

```
┌────────────────────────────────────────────────────────┐
│ RÈGLE SIGMA GENERIQUE (YAML / MITRE ATT&CK)            │
│  - Titre, Description, Logsource, Detection Logic      │
└───────────────────────────┬────────────────────────────┘
                            │ (Transpilation pySigma)
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
[ Splunk SPL ]       [ Elastic KQL ]     [ Sentinel KQL ]
```

---

## 2) Module — Outillage SIGMA Engine & Transpiler (`sigma_rule_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import yaml
import json

class SigmaRuleEngine:
    """
    Moteur de parsing de règles SIGMA et transpiler simplifié vers Elastic KQL et Splunk SPL.
    """

    def __init__(self, yaml_rule_str: str):
        self.rule = yaml.safe_load(yaml_rule_str)

    def get_metadata(self) -> dict:
        return {
            "title": self.rule.get("title"),
            "id": self.rule.get("id"),
            "status": self.rule.get("status"),
            "level": self.rule.get("level"),
            "tags": self.rule.get("tags", [])
        }

    def transpile_to_elastic_kql(self) -> str:
        """Transpile la logique de détection SIGMA vers Elastic KQL."""
        detection = self.rule.get("detection", {})
        selection = detection.get("selection", {})
        
        kql_parts = []
        for field, value in selection.items():
            clean_field = field.split("|")[0] # Simplification du modifier
            if isinstance(value, list):
                val_str = " OR ".join([f'"{v}"' for v in value])
                kql_parts.append(f"{clean_field}: ({val_str})")
            else:
                kql_parts.append(f'{clean_field}: "{value}"')

        return " AND ".join(kql_parts)

    def transpile_to_splunk_spl(self) -> str:
        """Transpile la logique de détection SIGMA vers Splunk SPL."""
        detection = self.rule.get("detection", {})
        selection = detection.get("selection", {})
        
        spl_parts = []
        for field, value in selection.items():
            clean_field = field.split("|")[0]
            if isinstance(value, list):
                val_str = " OR ".join([f'{clean_field}="{v}"' for v in value])
                spl_parts.append(f"({val_str})")
            else:
                spl_parts.append(f'{clean_field}="{value}"')

        return "index=* " + " ".join(spl_parts)

# Exemple de règle SIGMA : Détection d'accès au fichier LSASS (Credential Dumping)
sample_sigma_yaml = """
title: LSASS Memory Access via Process Open
id: 5f7a12bc-8910-4a31-paradis354
status: test
description: Detects process access to LSASS memory space indicating credential dumping (Mimikatz/LSASS dump)
references:
    - https://attack.mitre.org/techniques/T1003/001/
author: PARADIS IT SOC Team
date: 2026-08-08
tags:
    - attack.credential_access
    - attack.t1003.001
logsource:
    category: process_access
    product: windows
detection:
    selection:
        TargetImage|endswith: '\\lsass.exe'
        GrantedAccess:
            - '0x1010'
            - '0x1f0fff'
    filter_sysmon:
        SourceImage|endswith: '\\svchost.exe'
    condition: selection and not filter_sysmon
falsepositives:
    - Antivirus software performing legitimate memory checks
level: high
"""

engine = SigmaRuleEngine(sample_sigma_yaml)
print("=== SIGMA RULE TRANSPILER ENGINE ===")
print("[+] Règle :", engine.get_metadata()["title"])
print("[+] Transpilation Elastic KQL :", engine.transpile_to_elastic_kql())
print("[+] Transpilation Splunk SPL  :", engine.transpile_to_splunk_spl())
```

---

## 3) Module — Fiche Pratique de Rédaction SIGMA (2h)

```yaml
# STRUCTURE UNIVERSELLE D'UNE RÈGLES SIGMA VALIDÉE
title: Suspicious Add Member to Local Administrators Group
id: 8d901a5e-3321-4122-a982-paradis001
status: stable
description: Détecte l'ajout d'un utilisateur au groupe Administrateurs local via net.exe
logsource:
    category: process_creation
    product: windows
detection:
    selection_cmd:
        Image|endswith:
            - '\net.exe'
            - '\net1.exe'
        CommandLine|contains|all:
            - 'localgroup'
            - 'administrators'
            - '/add'
    condition: selection_cmd
falsepositives:
    - Legitimate IT admin scripts during onboarding
level: high
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SIGMA** | Format générique YAML ouvert de description de règles de détection dans les événements de logs |
| **pySigma** | Moteur Python moderne de parsing et transpilation des règles SIGMA |
| **Transpilation** | Processus de conversion automatique d'un code source ou d'une règle d'un langage vers un autre |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est l'avantage fondamental d'écrire des règles de détection au format **SIGMA** plutôt que directement en SPL ou KQL ?
- A) SIGMA est un standard ouvert générique et indépendant des vendeurs, permettant de partager des règles de détection (ex: communauté CTI/SOC) et de les convertir automatiquement vers n'importe quel SIEM cible (Splunk, Elastic, Sentinel)
- B) SIGMA est écrit en C++
- C) SIGMA chiffre les logs
- D) SIGMA remplace les antivirus

**Réponse : A**

**Q2 :** Dans une règle SIGMA, à quoi sert la section **`falsepositives`** ?
- A) À documenter explicitement les comportements administratifs légitimes connus susceptibles de déclencher la règle, facilitant le travail de tuning de l'analyste SOC
- B) À désactiver la règle
- C) À effacer les événements de logs
- D) À envoyer un SMS aux utilisateurs

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
