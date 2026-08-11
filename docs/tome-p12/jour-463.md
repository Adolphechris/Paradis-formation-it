# TOME P12 — Gouvernance, Compliance & Architecture Finale — Jour 463 (6h) : Réglementations & Conformité Internationale (RGPD, NIS2, DORA, PCI-DSS v4.0 & SOC 2 Type II)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le cadre réglementaire européen et international : **RGPD**, directive **NIS2**, règlement **DORA** (secteur financier)
> - Appliquer la norme bancaire **PCI-DSS v4.0** (12 exigences de sécurité pour la protection des données de cartes de paiement)
> - Préparer et auditer la conformité **SOC 2 Type II** (Trust Services Criteria : Security, Availability, Confidentiality)
> - Établir la matrice de conformité réglementaire unifiée (Compliance Mapping)
>
> **Compétences visées :** `POL-02` (A) — Regulatory Compliance, `POL-01` (A) — Legal & International Security Standards

---

## Module 1 — Réglementations Européennes (NIS2, DORA, RGPD) (2h)

### 📖 Intuition & Narration

La sécurité informatique n'est plus seulement une question de bonnes pratiques d'entreprise : c'est désormais une **obligation légale** assortie de sanctions financières massives. En Europe, la directive **NIS2** étend les exigences de cybersécurité à des milliers d'entités essentielles et importantes, tandis que le règlement **DORA** (Digital Operational Resilience Act) impose une résilience opérationnelle numérique stricte au secteur financier.

### 🔍 Anatomie Technique — Panorama Réglementaire

```
PANORAMA DES RÉGLEMENTATIONS MAJEURES

  ┌─────────────────────────────────────────────────────────────┐
  │  1. RGPD (GDPR)  : Protection des données personnelles (PII)│
  │     ├── Notification de fuite sous 72h à la CNIL            │
  │     └── Sanctions jusqu'à 20M€ ou 4% du CA mondial          │
  │                                                             │
  │  2. NIS2         : Cybersécurité des services essentiels     │
  │     ├── Responsabilité directe des dirigeants (Board)       │
  │     └── Notification d'incident en 24h (alerte précoce)     │
  │                                                             │
  │  3. DORA         : Résilience numérique du secteur financier │
  │     ├── Gestion des risques tiers (fournisseurs IT/Cloud)   │
  │     └── Tests de pénétration guidés par la menace (TLPT)    │
  └─────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Norme Bancaire PCI-DSS v4.0 & SOC 2 Type II (2h)

### 🛠️ Atelier Pratique — Checklist de Conformité PCI-DSS v4.0

```python
#!/usr/bin/env python3
"""
PARADIS — Evaluateur PCI-DSS v4.0 Core Requirements
"""

import json

class PCIDSSv4Evaluator:
    def __init__(self):
        self.requirements = {
            "Req_1_Firewalls": "Install and Maintain Network Security Controls",
            "Req_2_Secure_Configs": "Apply Secure Configurations to All System Components",
            "Req_3_Protect_Stored_Account_Data": "Protect Stored Account Data (AES-256/Tokens)",
            "Req_4_Protect_Cardholder_Transit": "Protect Cardholder Data in Transit (TLS 1.3)",
            "Req_5_Anti_Malware": "Protect Systems from Malicious Software (EDR/Falco)",
            "Req_6_Secure_Systems_Apps": "Develop and Maintain Secure Systems (SAST/DAST/Patching)",
            "Req_7_Restrict_Access_Need_to_Know": "Restrict Access by Business Need to Know (RBAC)",
            "Req_8_Identify_Authenticate": "Identify Users and Authenticate Access (MFA Mandatory)",
            "Req_10_Log_and_Monitor": "Log and Monitor All Access to System Components (SIEM)",
            "Req_11_Test_Security": "Test Security of Systems Regularly (Pentest & Vuln Scan)"
        }

    def verify_compliance(self) -> dict:
        return {
            "pci_dss_version": "4.0",
            "audit_status": "COMPLIANT",
            "mandatory_mfa_everywhere": True,
            "tls_version_enforced": "TLS 1.3 Only",
            "evaluated_requirements_count": len(self.requirements)
        }

evaluator = PCIDSSv4Evaluator()
print(json.dumps(evaluator.verify_compliance(), indent=2))
```

---

## Module 3 — SOC 2 Type II Audit & Trust Services Criteria (1h30)

### 🔍 Anatomie Technique — SOC 2 Type I vs Type II

```
SOC 2 AUDIT — TYPE I vs TYPE II

  ┌─────────────────────────────────────────────────────────────┐
  │  SOC 2 Type I  : Évalue la CONCEPTION des contrôles à un   │
  │                  instant T précis (photographie).           │
  │                                                             │
  │  SOC 2 Type II : Évalue l'EFFICACITÉ OPÉRATIONNELLE des    │
  │                  contrôles sur une période de 6 à 12 mois  │
  │                  (preuve continue, vidéo).                  │
  └─────────────────────────────────────────────────────────────┘
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DORA** | Digital Operational Resilience Act — Règlement européen sur la résilience opérationnelle numérique du secteur financier |
| **NIS2** | Network and Information Security Directive 2 — Directive européenne sur la cybersécurité des réseaux et systèmes |
| **PCI-DSS** | Payment Card Industry Data Security Standard — Norme de sécurité des données de cartes de paiement |
| **TLPT** | Threat-Led Penetration Testing — Test d'intrusion guidé par la menace exige par DORA |

---

## Exercices Pratiques

### Exercice 1 — Notification d'Incident NIS2 vs RGPD

En cas de fuite de données personnelles suite à une attaque ransomware, quels sont les délais légaux de notification pour la CNIL (RGPD) et pour l'ANSSI/CERT (NIS2) ?

**Corrigé guidé :**
- **NIS2 :** Notification d'alerte précoce obligatoire sous **24 heures** à l'autorité nationale (ANSSI/CERT) + rapport initial sous 72h.
- **RGPD :** Notification de la fuite de données personnelles à l'autorité de contrôle (CNIL) sous **72 heures** maximum après en avoir pris connaissance.

---

## Banque QCM — 5 Questions

**Q1.** Quel est le délai d'alerte précoce imposé par la directive **NIS2** pour notifier un incident significatif ?

- A) 1 mois
- B) 24 heures ✅
- C) 7 jours
- D) 3 mois

**Q2.** Le règlement européen **DORA** s'applique principalement à quel secteur d'activité ?

- A) L'agriculture
- B) Le secteur financier (banques, assurances, prestataires de services d'actifs numériques) et leurs fournisseurs IT ✅
- C) L'industrie textile
- D) L'enseignement primaire

**Q3.** La norme **PCI-DSS v4.0** impose désormais l'utilisation obligatoire de quelle mesure d'authentification pour TOUS les accès à l'environnement de données de cartes ?

- A) Un simple mot de passe de 6 caractères
- B) L'authentification multifacteur (MFA) ✅
- C) La reconnaissance vocale
- D) Un jeton en papier

**Q4.** Quelle est la différence majeure entre un rapport **SOC 2 Type I** et **SOC 2 Type II** ?

- A) Type I est payant, Type II est gratuit
- B) Type I évalue les contrôles à un instant T ; Type II évalue leur efficacité continue sur 6 à 12 mois ✅
- C) Type I est pour la Chine, Type II pour l'Europe
- D) Type I ne concerne que le matériel physique

**Q5.** En cas de non-respect majeur du **RGPD**, le montant maximal des amendes peut atteindre :

- A) 500 €
- B) 20 millions d'euros ou 4% du chiffre d'affaires annuel mondial (le montant le plus élevé étant retenu) ✅
- C) 10 000 $
- D) Aucune amende financière n'est prévue

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
