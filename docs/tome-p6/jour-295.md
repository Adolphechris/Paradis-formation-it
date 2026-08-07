# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 295 (6h) : Projet Intégrateur S6 Partie 9 — Critical Infrastructure, OT & 5G Security (Synthèse Infrastructures Critiques & Telecoms)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre le **Projet Intégrateur global de Sécurité des Infrastructures Critiques (OT, Télécoms 5G & Spatial)** : auditer la sécurité d'un réseau industriel SCADA Modbus, évaluer la résilience d'un cœur de réseau 5G SA contre l'usurpation de GTP/SUPI, vérifier la conformité des télécommandes spatiales CCSDS, et produire un plan de résilience d'infrastructure critique.
>
> **Ce projet valide l'aptitude opérationnelle de l'apprenant à protéger les infrastructures vitales d'une nation (OIV / OSE).**

---

## 1) Module — Synthèse du Projet Intégrateur Infrastructures Critiques (2h)

### 📖 Présentation du Scénario d'Entreprise

L'opérateur d'infrastructure vitale **PARADIS Infrastructure & Telecom** gère un réseau électrique Smart Grid connecté en 5G SA et piloté par satellite. Le projet exige d'auditer et de durcir la chaîne complète.

---

## 2) Module — Audit de Sécurité Multi-Domaines (`critical_infra_audit.py`) (2h30)

```python
import json

# Script d'audit de sécurité des Infrastructures Critiques (OT, 5G, Spatial)

def audit_critical_infrastructure():
    results = [
        {"domain": "SCADA / OT", "protocol": "Modbus TCP", "status": "PASS", "measure": "Isolation Purdue Level 1 + Malcolm IDS"},
        {"domain": "5G Core SBA", "protocol": "HTTP/2 REST", "status": "PASS", "measure": "Chiffrement SUPI -> SUCI activé"},
        {"domain": "Space Segment", "protocol": "CCSDS TC", "status": "PASS", "measure": "Trame sécurisée AES-256-GCM"},
        {"domain": "IoT Firmware", "analysis": "Binwalk Extract", "status": "PASS", "measure": "Zéro clé SSH privée hardcodée"}
    ]

    print("=== AUDIT GLOBAL DE RÉSILIENCE DES INFRASTRUCTURES CRITIQUES ===")
    print(json.dumps(results, indent=2))

audit_critical_infrastructure()
```

---

## 3) Module — Plan de Sécurisation OIV / OSE (1h30)

```markdown
# EXECUTIVE REPORT — RÉSILIENCE DES INFRASTRUCTURES CRITIQUES (OIV)

## 1. Périmètres Audités
- **Réseau OT Industrial :** Confinement Purdue Level 0-2 validé.
- **Cœur 5G SA :** Protections anti-IMSI Catchers (SUCI) certifiées.
- **Segment Spatiale :** Télécommandes CCSDS chiffrées en AES-256-GCM.

## 2. Recommandations P0
1. Généraliser la surveillance Zeek / Malcolm sur tous les switchs OT.
2. Imposer l'authentification mTLS sur l'ensemble des APIs 5G Core NRF.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OIV** | Opérateur d'Importance Vitale — Entité stratégique désignée par l'État |
| **OSE** | Opérateur de Services Essentiels — Dénomination européenne au sens de la directive NIS |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
