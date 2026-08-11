# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 513 (6h) : Réglementations & Conformité Internationale : RGPD, Directive NIS2, Règlement DORA, PCI-DSS v4.0 & SOC 2 Type II

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le cadre réglementaire européen et international de la cybersécurité (**RGPD**, **NIS2**, **DORA**)
> - Appliquer les exigences techniques et organisationnelles de **PCI-DSS v4.0** pour la protection des données de cartes bancaires
> - Comprendre la structure des rapports d'audit **SOC 2 Type II** (Trust Services Criteria)
> - Établir une matrice de correspondance (Mapping) des contrôles de conformité multi-réglementaires
>
> **Compétences visées :** `POL-02` (A), `SEC-06` (A) — Regulatory Compliance & International Standards

---

## Module 1 — Le Paysage Réglementaire Européen : RGPD, NIS2 & DORA (2h)

### 📖 Intuition & Narration

L'Union Européenne a instauré le cadre réglementaire de cybersécurité le plus strict et le plus exigeant au monde. Une entreprise opérant en Europe ne peut plus ignorer la conformité légale :
- **RGPD (GDPR)** : Protège les données à caractère personnel sous peine de sanctions financières pouvant atteindre 20 millions d'euros ou 4% du chiffre d'affaires mondial.
- **Directive NIS2 (2024)** : Étend les obligations de cybersécurité à des milliers d'entités essentielles et importantes (énergie, transports, santé, administration, services numériques) avec responsabilité personnelle des dirigeants.
- **Règlement DORA (Digital Operational Resilience Act - 2025)** : Impose une résilience opérationnelle numérique stricte au secteur financier (banques, assurances, prestataires de services informatiques critiques).

### 🔍 Anatomie Technique — Cartographie des Réglementations & Sanctions

```
CARTOGRAPHIE DE LA CONFORMITÉ CYBER EUROPÉENNE & INTERNATIONALE

  ┌────────────────────────────────────────────────────────────────────────┐
  │ REGLEMENTATION │ PÉRIMÈTRE & OBJECTIFS       │ SANCTION MAXIMALE       │
  ├────────────────┼─────────────────────────────┼─────────────────────────┤
  │ RGPD           │ Données Personnelles (PII)  │ 20M€ ou 4% du CA        │
  │ NIS2           │ Infrastructures Critiques   │ 10M€ ou 2% du CA        │
  │ DORA           │ Secteur Financier & IT      │ Interdiction d'exercice │
  │ PCI-DSS v4.0   │ Données de Cartes Bancaires │ Retrait d'agrément banc.│
  │ SOC 2 Type II  │ Prestataires SaaS / Cloud   │ Perte de confiance/cli. │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Atelier Pratique : Compliance Mapping Engine & Data Privacy Impact Assessment (DPIA) (2h)

### 🛠️ Code Python : Multi-Regulatory Compliance Mapping Matrix

```python
#!/usr/bin/env python3
"""
PARADIS — Multi-Regulatory Cross-Compliance Mapping Matrix
Mappe un contrôle technique DevSecOps / Cloud sur plusieurs normes (RGPD, NIS2, DORA, PCI-DSS, SOC 2).
"""

import json
import sys
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class TechnicalControl:
    control_id: str
    name: str
    description: str
    rgpd_ref: str
    nis2_ref: str
    dora_ref: str
    pci_dss_ref: str
    soc2_ref: str

class ComplianceMappingEngine:
    def __init__(self):
        self.controls_catalog: List[TechnicalControl] = []

    def load_catalog(self):
        self.controls_catalog = [
            TechnicalControl(
                control_id="CTRL-CRYPTO-01",
                name="Chiffrement des données en transit (TLS 1.3)",
                description="Obligation de chiffrer l'ensemble des flux réseau externes et internes.",
                rgpd_ref="Art. 32 (Sécurité du traitement)",
                nis2_ref="Art. 21.2.h (Chiffrement)",
                dora_ref="Art. 9 (Protection & Prévention)",
                pci_dss_ref="Req 4.2 (Chiffrement des données de cartes en transit)",
                soc2_ref="CC6.7 (Transmission Data Protection)"
            ),
            TechnicalControl(
                control_id="CTRL-IAM-02",
                name="Authentification Multifacteur (MFA)",
                description="MFA obligatoire pour tous les accès d'administration et accès distants.",
                rgpd_ref="Art. 32 (Confidentialité)",
                nis2_ref="Art. 21.2.j (MFA & Auth sécurisée)",
                dora_ref="Art. 9.4 (Gestion des accès)",
                pci_dss_ref="Req 8.4 (MFA pour accès au CDE)",
                soc2_ref="CC6.1 (Logical Access Security)"
            ),
            TechnicalControl(
                control_id="CTRL-INCIDENT-03",
                name="Notification d'incident en 24h/72h",
                description="Procédure automatisée de notification d'incident majeur de sécurité aux autorités.",
                rgpd_ref="Art. 33 (Notification à la CNIL sous 72h)",
                nis2_ref="Art. 23 (Alerte précoce sous 24h au CSIRT)",
                dora_ref="Art. 19 (Notification d'incident majeur)",
                pci_dss_ref="Req 12.10.5 (Incident Response)",
                soc2_ref="CC7.3 (Incident Detection & Response)"
            )
        ]

    def search_compliance_by_regulation(self, regulation_key: str) -> List[dict]:
        print(f"=== RECHERCHE DE CONFORMITÉ POUR LA RÉGLEMENTATION : {regulation_key.upper()} ===")
        results = []

        for ctrl in self.controls_catalog:
            ref_val = getattr(ctrl, f"{regulation_key.lower()}_ref", "N/A")
            results.append({
                "control_id": ctrl.control_id,
                "name": ctrl.name,
                "regulatory_reference": ref_val
            })
            print(f"  📌 [{ctrl.control_id}] {ctrl.name}")
            print(f"     Référence réglementaire : {ref_val}")

        return results

if __name__ == "__main__":
    engine = ComplianceMappingEngine()
    engine.load_catalog()
    print("\n--- MATRICE DE CORRESPONDANCE DORA (SECTEUR FINANCIER) ---")
    engine.search_compliance_by_regulation("dora")
    print("\n--- MATRICE DE CORRESPONDANCE NIS2 (DIRECTIVE EUROPÉENNE) ---")
    engine.search_compliance_by_regulation("nis2")
```

---

## Module 3 — SOC 2 Type II & PCI-DSS v4.0 (1h30)

### 🔍 SOC 2 Type II vs Type I & PCI-DSS v4.0

1. **SOC 2 Type I vs Type II** :
   - **Type I** : Évalue la *conception* des contrôles à un instant $T$.
   - **Type II** : Évalue l'*efficacité opérationnelle réelle* des contrôles sur une période d'observation d'au moins 6 mois. C'est le standard exigé par les clients Enterprise pour choisir un fournisseur SaaS.
2. **PCI-DSS v4.0** : Norme du conseil PCI (Visa, Mastercard) structurée en 12 exigences fondamentales pour sécuriser le CDE (Cardholder Data Environment).

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **RGPD / GDPR** | Règlement Général sur la Protection des Données |
| **NIS2** | Network and Information Security Directive v2 |
| **DORA** | Digital Operational Resilience Act |
| **PCI-DSS** | Payment Card Industry Data Security Standard |
| **CDE** | Cardholder Data Environment — Périmètre réseau contenant les données de cartes |
| **SOC 2** | Service Organization Control 2 (AICPA) |

---

## Exercices Pratiques

### Exercice 1 — Calcul du Délai de Notification d'Incident NIS2 vs RGPD

Une cyberattaque majeure par ransomware touche une entreprise de santé le lundi à 10h00, entraînant une fuite de données personnelles de patients.
1. Quel est le délai d'alerte précoce imposé par la directive **NIS2** au CSIRT national ?
2. Quel est le délai maximal imposé par le **RGPD** pour notifier l'autorité de protection des données (CNIL) ?

**Corrigé guidé :**
1. **Délai NIS2** : Alerte précoce sous **24 heures** (Mardi 10h00 au plus tard).
2. **Délai RGPD** : Notification formelle à la CNIL sous **72 heures** (Jeudi 10h00 au plus tard).

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la sanction financière maximale encourue par une entreprise en cas de violation grave des règles du **RGPD** ?

- A) 500 euros.
- B) 20 millions d'euros ou 4% du chiffre d'affaires annuel mondial (le montant le plus élevé étant retenu). ✅
- C) 10 000 dollars.
- D) Aucune amende n'est prévue.

**Q2.** La directive européenne **NIS2** introduit une nouveauté majeure en matière de gouvernance. Laquelle ?

- A) L'interdiction d'utiliser Linux.
- B) La responsabilité personnelle juridique et financière directe des dirigeants d'entreprise (C-Level) en cas de manquement grave aux obligations de cybersécurité. ✅
- C) L'obligation de payer les rançons en Bitcoin.
- D) L'interdiction des mots de passe.

**Q3.** Quel secteur d'activité est spécifiquement visé par le règlement européen **DORA (Digital Operational Resilience Act)** ?

- A) Le secteur de la restauration rapide.
- B) Le secteur financier (banques, assurances, marchés) et leurs prestataires informatiques critiques. ✅
- C) L'industrie du cinéma.
- D) Le secteur agricole.

**Q4.** Quelle est la différence majeure entre un rapport d'audit **SOC 2 Type I** et **SOC 2 Type II** ?

- A) Le Type I est gratuit, le Type II est payant.
- B) Le Type I évalue la conception des contrôles à une date fixe, tandis que le Type II teste l'efficacité opérationnelle continue des contrôles sur une période de 6 à 12 mois. ✅
- C) Le Type I s'applique uniquement à Windows.
- D) Il n'y a aucune différence.

**Q5.** Que désigne l'acronyme **CDE** dans le cadre de la norme **PCI-DSS v4.0** ?

- A) Cardholder Data Environment — le périmètre réseau et applicatif où les données de cartes bancaires sont stockées, traitées ou transmises. ✅
- B) Central Desktop Equipment.
- C) Certified Data Engineer.
- D) Code Development Engine.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
