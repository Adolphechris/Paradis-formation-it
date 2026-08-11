# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 515 (6h) : Règlement DORA & Résilience Opérationnelle Numérique : TLPT, Gestion des Risques TIC & Notification d'Incidents Majeurs

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le règlement européen **DORA (Digital Operational Resilience Act)** applicable à partir de janvier 2025
> - Structurer les 5 piliers DORA : Cadre de gestion des risques TIC, Notification d'incidents, Tests de résilience, Risques tiers TIC, Partage d'informations
> - Planifier des tests de pénétration poussés menés par la menace (**TLPT — Threat-Led Penetration Testing**)
> - Gérer le registre des contrats et le risque lié aux prestataires de services TIC critiques (Cloud, SaaS)
>
> **Compétences visées :** `POL-02` (A), `SEC-06` (A) — Financial Digital Operational Resilience & DORA Compliance

---

## Module 1 — Le Règlement DORA & les 5 Piliers de Résilience (2h)

### 📖 Intuition & Narration

Le secteur financier mondial dépend désormais quasi-exclusivement de services informatiques et cloud. Si un fournisseur cloud majeur subit une panne de plusieurs jours ou une cyberattaque par ransomware, c'est l'ensemble du système bancaire et financier qui menace de s'effondrer.

Le règlement européen **DORA (Digital Operational Resilience Act)** a été conçu pour garantir que les entités financières (banques, assurances, fonds d'investissement) et leurs **prestataires tiers informatiques critiques** puissent résister, réagir et se rétablir après tout type de perturbation numérique.

DORA transforme la résilience informatique d'une option technique en une **obligation légale de niveau exécutif**.

### 🔍 Anatomie Technique — Les 5 Piliers du Règlement DORA

```
LES 5 PILIERS DU RÈGLEMENT DORA (EU 2022/2554)

  PILIER 1 : CADRE DE GESTION DES RISQUES TIC (Art. 5–16)
  • Gouvernance exécutive, identification des fonctions critiques, BCP/DRP.

  PILIER 2 : GESTION & NOTIFICATION DES INCIDENTS MAJEURS (Art. 17–23)
  • Classification des incidents, alerte initiale et rapport final automatisé.

  PILIER 3 : TESTS DE RÉSILIENCE OPÉRATIONNELLE NUMÉRIQUE (Art. 24–27)
  • Tests de vulnérabilités réguliers + TLPT (Threat-Led Penetration Testing) tous les 3 ans.

  PILIER 4 : GESTION DU RISQUE LIÉ AUX PRESTATAIRES TIERS TIC (Art. 28–44)
  • Registre d'information des contrats, surveillance continue des fournisseurs cloud.

  PILIER 5 : ÉCHANGE D'INFORMATIONS SUR LES MENACES (Art. 45)
  • Partage sécurisé d'indicateurs de compromission (IoCs) entre entités.
```

---

## Module 2 — Atelier Pratique : Automate de Notification d'Incident Majeur DORA (2h)

### 🛠️ Code Python : DORA Major Incident Reporting & Classification Engine

```python
#!/usr/bin/env python3
"""
PARADIS — DORA Major Incident Classification & Automated Reporter
Classifie les incidents informatiques selon les critères DORA (Art. 18) et génère la notification réglementaire.
"""

import json
import sys
from datetime import datetime

class DORAIncidentClassifier:
    def __init__(self, incident_id: str):
        self.incident_id = incident_id
        self.impacted_clients_pct = 0.0
        self.downtime_hours = 0.0
        self.data_loss = False
        self.economic_impact_eur = 0.0

    def set_incident_metrics(self, clients_pct: float, downtime_h: float, data_loss: bool, economic_eur: float):
        self.impacted_clients_pct = clients_pct
        self.downtime_hours = downtime_h
        self.data_loss = data_loss
        self.economic_impact_eur = economic_eur

    def is_major_incident(self) -> tuple[bool, str]:
        """Classifie l'incident selon les seuils DORA (Art. 18)."""
        reasons = []

        if self.impacted_clients_pct >= 10.0:
            reasons.append(f">10% des clients impactés ({self.impacted_clients_pct:.1f}%)")

        if self.downtime_hours >= 2.0:
            reasons.append(f"Indisponibilité des services critiques > 2 heures ({self.downtime_hours}h)")

        if self.data_loss:
            reasons.append("Perte ou altération de données financières critiques")

        if self.economic_impact_eur >= 500000.0:
            reasons.append(f"Impact économique direct >= 500 000 € ({self.economic_impact_eur:,.0f} €)")

        is_major = len(reasons) > 0
        return is_major, " | ".join(reasons) if is_major else "Incident mineur (sous les seuils DORA)"

    def generate_dora_notification(self) -> dict:
        is_major, explanation = self.is_major_incident()
        return {
            "incident_id": self.incident_id,
            "timestamp": datetime.now().isoformat(),
            "is_major_incident_dora": is_major,
            "classification_reason": explanation,
            "regulatory_reporting_required": is_major,
            "reporting_deadlines": {
                "initial_notification": "Sous 4 heures (Alerte précoce)",
                "intermediate_report": "Sous 72 heures",
                "final_report": "Sous 1 mois"
            } if is_major else "Aucun (Gestion interne)"
        }

if __name__ == "__main__":
    print("=== CLASSIFICATION D'INCIDENT DE SÉCURITÉ DORA ===")
    classifier = DORAIncidentClassifier("INC-2025-8841")
    # Simulation d'une panne majeure suite à un ransomware
    classifier.set_incident_metrics(clients_pct=15.5, downtime_h=4.5, data_loss=True, economic_eur=750000.0)

    report = classifier.generate_dora_notification()

    print("\n" + "═"*70)
    print("  RAPPORT DE NOTIFICATION RÉGLEMENTAIRE DORA")
    print("═"*70)
    print(json.dumps(report, indent=2))
    print("═"*70)

    if report["is_major_incident_dora"]:
        print("\n[🚨 ALERTE MAJEURE DORA] Notification obligatoire à l'autorité bancaire (ACPR/EBA) sous 4h !")
```

---

## Module 3 — TLPT (Threat-Led Penetration Testing) & Risque Tiers (1h30)

### 🔍 Threat-Led Penetration Testing (TLPT) & Registre Tiers

1. **TLPT (Threat-Led Penetration Testing)** : DORA impose aux entités financières de réaliser au moins tous les 3 ans un test d'intrusion guidé par la menace (Red Teaming basé sur le framework TIBER-EU). Ce test simule une attaque d'un état-nation sur les systèmes de production réels.
2. **Registre des Prestataires Tiers TIC** : Les entreprises doivent maintenir un registre complet de tous les contrats informatiques (SaaS, Cloud) et s'assurer que des clauses de résilience et de droit d'audit sont présentes dans chaque contrat.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DORA** | Digital Operational Resilience Act (Règlement UE 2022/2554) |
| **TLPT** | Threat-Led Penetration Testing — Test d'intrusion guidé par la menace |
| **TIBER-EU** | Threat Intelligence-based Ethical Red Teaming — Cadre de Red Teaming de la Banque Centrale Européenne |
| **TIC / ICT** | Technologies de l'Information et de la Communication |

---

## Exercices Pratiques

### Exercice 1 — Calcul des Délais de Notification DORA

Un incident informatique majeur frappe une banque le lundi à 08h00. Selon le règlement DORA :
1. Quel est le délai d'envoi de la notification initiale (Alerte précoce) ?
2. Quel est le délai d'envoi du rapport final d'incident ?

**Corrigé guidé :**
1. **Notification initiale (Alerte précoce)** : Sous **4 heures** (Lundi à 12h00 au plus tard).
2. **Rapport final** : Sous **1 mois** (Au plus tard 30 jours après l'incident).

---

## Banque QCM — 5 Questions

**Q1.** À quelle date le règlement européen **DORA (Digital Operational Resilience Act)** devient-il d'application directe et obligatoire pour le secteur financier ?

- A) En 2000.
- B) Le 17 janvier 2025. ✅
- C) En 2035.
- D) Jamais.

**Q2.** Combien de piliers fondamentaux composent le règlement DORA ?

- A) 2 piliers.
- B) 5 piliers (Gestion des risques TIC, Incidents, Tests/TLPT, Risques Tiers, Partage d'informations). ✅
- C) 100 piliers.
- D) Aucun pilier.

**Q3.** Qu'est-ce qu'un test **TLPT (Threat-Led Penetration Testing)** exigé par DORA tous les 3 ans ?

- A) Un quiz à choix multiples.
- B) Un exercice de Red Teaming avancé simulant une attaque réelle basée sur la Threat Intelligence (TIBER-EU) sur l'environnement de production. ✅
- C) Un scan antivirus rapide.
- D) Une réunion de travail.

**Q4.** Quel est le délai maximal pour envoyer la notification initiale d'un incident majeur TIC au régulateur financier selon DORA ?

- A) 1 an.
- B) 4 heures (Alerte précoce). ✅
- C) 3 mois.
- D) 10 secondes.

**Q5.** Dans le cadre de la gestion du risque lié aux prestataires tiers TIC (Pilier 4), que doivent impérativement inclure les contrats avec les fournisseurs Cloud ?

- A) Des réductions de prix.
- B) Des clauses garantissant le droit d'audit, des niveaux de service (SLA) de résilience et des plans d'urgence en cas de défaillance du fournisseur. ✅
- C) Des photos des serveurs.
- D) Une assurance vie.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
