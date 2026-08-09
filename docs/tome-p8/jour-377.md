# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 377 (6h) : GDPR & NIS2 Compliance Engineering — Data Flow Mapping, DPIA, Incident Notification Timelines & DPO Obligations

> [!NOTE]
> **Objectif du jour :** Maîtriser la mise en conformité opérationnelle au **RGPD (GDPR)** et à la **Directive NIS2** pour les organisations traitant des données personnelles et opérant des infrastructures critiques : cartographier les flux de données (**Data Flow Mapping / Record of Processing Activities — RoPA**), conduire une **Analyse d'Impact sur la Protection des Données (AIPD / DPIA)**, structurer les processus de **notification d'incident** aux autorités (CNIL/ANSSI — 72h RGPD / 24h NIS2), et définir les obligations légales du **Délégué à la Protection des Données (DPO)**.
>
> **Compétences visées :** `GRC-REG-01` (A) — GDPR RoPA, DPIA Engineering & DPO Obligations | `GRC-REG-02` (A) — NIS2 Compliance, Incident Notification Timelines & Cyber Governance Obligations

---

## 1) Module — RGPD & NIS2 : Périmètres, Obligations & Timelines (2h)

### 📖 Narration/Intuition

Le RGPD et NIS2 ne sont pas de simples cases à cocher juridiques : leur non-respect expose l'entreprise à des amendes massives (**jusqu'à 4% du CA mondial pour le RGPD**, jusqu'à **10 M€ ou 2% du CA mondial pour NIS2**) et à des responsabilités pénales personnelles pour les dirigeants.

```
 ┌─────────────────────────────────────────────────────────────────┐
 │           TIMELINE DE NOTIFICATION D'INCIDENT DE SÉCURITÉ       │
 │                                                                 │
 │ J+0  [Détection Incident] ──────────────────────────────────►   │
 │                                                                 │
 │ J+1  [NIS2 — Early Warning] ────────────────────────────────►   │
 │      Notification initiale à l'ANSSI (< 24h)                   │
 │                                                                 │
 │ J+3  [RGPD — Notification CNIL] ────────────────────────────►   │
 │      Notification à l'autorité de contrôle (< 72h)             │
 │      (Si violation de données personnelles confirmée)           │
 │                                                                 │
 │ J+30 [NIS2 — Rapport Final] ────────────────────────────────►   │
 │      Rapport d'incident complet + Plan de remédiation           │
 │                                                                 │
 │ J+30 [RGPD — Information des Personnes] ────────────────────►   │
 │      Notification des personnes affectées si risque élevé       │
 └─────────────────────────────────────────────────────────────────┘
```

#### Comparatif des Obligations RGPD vs NIS2

| Dimension | RGPD (Règlement UE 2016/679) | NIS2 (Directive UE 2022/2555) |
|:---:|:---|:---|
| **Périmètre** | Traitement de données personnelles (Personnes physiques EU) | Entités essentielles & importantes (CI, Numérique, Santé, Finance) |
| **Autorité** | CNIL (France) / DPA nationale | ANSSI (France) / ENISA au niveau EU |
| **Amende Max** | 4% CA mondial ou 20 M€ | 10 M€ ou 2% CA mondial (Entités Essentielles) |
| **Délai Notif.** | 72h post-découverte | 24h (Early Warning) + 72h (Notification Formelle) |
| **Responsabilité** | DPO (Délégué Protection Données) | Dirigeants personnellement responsables |

---

## 2) Module — Outillage GDPR Compliance Engine (`gdpr_compliance_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone, timedelta
from typing import List, Dict

class GDPRComplianceEngine:
    """
    Moteur de conformité RGPD / NIS2.
    Gère le RoPA (Record of Processing Activities), la DPIA et les timelines de notification.
    """

    def __init__(self, organization: str, dpo_name: str, dpo_email: str):
        self.org = organization
        self.dpo = {"name": dpo_name, "email": dpo_email}
        self.ropa_records: List[dict] = []
        self.dpia_assessments: List[dict] = []
        self.incident_notifications: List[dict] = []

    def register_processing_activity(self, activity_name: str, purpose: str,
                                      legal_basis: str, data_categories: List[str],
                                      recipients: List[str], retention_years: int,
                                      is_high_risk: bool) -> dict:
        """
        Enregistre une activité de traitement dans le RoPA (Registre des Traitements — Art. 30 RGPD).
        Déclenche automatiquement une DPIA si le traitement est à risque élevé (Art. 35 RGPD).
        """
        record = {
            "id": f"ROPA-{len(self.ropa_records)+1:03d}",
            "activity_name": activity_name,
            "purpose": purpose,
            "legal_basis": legal_basis,
            "personal_data_categories": data_categories,
            "data_recipients": recipients,
            "retention_period_years": retention_years,
            "requires_dpia": is_high_risk,
            "dpo_validated_by": self.dpo["name"]
        }
        self.ropa_records.append(record)
        print(f"  [RoPA] Activité enregistrée: {activity_name} | Base Légale: {legal_basis} | DPIA Requise: {is_high_risk}")

        if is_high_risk:
            self._trigger_dpia(record)

        return record

    def _trigger_dpia(self, ropa_record: dict):
        """Génère une DPIA (Data Protection Impact Assessment — Art. 35 RGPD)."""
        dpia = {
            "dpia_id": f"DPIA-{len(self.dpia_assessments)+1:02d}",
            "linked_ropa": ropa_record["id"],
            "activity": ropa_record["activity_name"],
            "risk_description": "Traitement à grande échelle de données sensibles",
            "measures_proposed": [
                "Chiffrement AES-256 des données au repos et en transit",
                "Accès limité au Besoin d'En Connaître (Need-to-Know)",
                "Journalisation des accès et audit trimestriel"
            ],
            "dpo_opinion": "FAVORABLE AVEC RÉSERVES",
            "dpia_date": datetime.now(timezone.utc).isoformat()
        }
        self.dpia_assessments.append(dpia)
        print(f"  [DPIA] Analyse d'impact générée: {dpia['dpia_id']} pour {ropa_record['activity_name']}")

    def trigger_breach_notification(self, detection_datetime: datetime,
                                    affected_records: int, data_sensitivity: str) -> dict:
        """
        Calcule et génère les timelines de notification obligatoires RGPD/NIS2.
        """
        rgpd_deadline = detection_datetime + timedelta(hours=72)
        nis2_early_warn = detection_datetime + timedelta(hours=24)
        nis2_final_report = detection_datetime + timedelta(days=30)

        notification = {
            "detection_at": detection_datetime.isoformat(),
            "affected_records_count": affected_records,
            "data_sensitivity": data_sensitivity,
            "rgpd_notification_cnil_deadline": rgpd_deadline.isoformat(),
            "nis2_early_warning_deadline_anssi": nis2_early_warn.isoformat(),
            "nis2_final_report_deadline": nis2_final_report.isoformat(),
            "notify_affected_persons": data_sensitivity in ["HIGH", "CRITICAL"],
            "dpo_responsible": self.dpo
        }
        self.incident_notifications.append(notification)
        print(f"\n  [BREACH NOTIFICATION]")
        print(f"  ⚠️  NIS2 Early Warning ANSSI deadline : {nis2_early_warn.strftime('%Y-%m-%d %H:%M UTC')}")
        print(f"  ⚠️  RGPD Notification CNIL deadline   : {rgpd_deadline.strftime('%Y-%m-%d %H:%M UTC')}")
        return notification

# Démonstration
engine = GDPRComplianceEngine("PARADIS GLOBAL BANK", "Marie Dupont", "dpo@paradis-bank.eu")

print("=== GDPR / NIS2 COMPLIANCE ENGINE ===")

engine.register_processing_activity(
    activity_name="Profilage Comportemental Clients (Anti-Fraude ML)",
    purpose="Détection de fraude par analyse comportementale automatisée",
    legal_basis="Art. 6(1)(f) RGPD - Intérêt Légitime",
    data_categories=["Transactions Bancaires", "Données Biométriques", "Localisation GPS"],
    recipients=["Équipe Fraude Interne", "ACPR (Autorité Prudentielle)"],
    retention_years=5,
    is_high_risk=True
)

# Simulation d'un incident de violation de données
engine.trigger_breach_notification(
    detection_datetime=datetime.now(timezone.utc),
    affected_records=45000,
    data_sensitivity="HIGH"
)
```

---

## 3) Module — Fiche DPO & Bases Légales du RGPD (2h)

```markdown
# BASES LÉGALES DE TRAITEMENT (ART. 6 RGPD)

| Base Légale | Description | Exemples Bancaires |
|:---:|:---|:---|
| **Art. 6(1)(a) - Consentement** | Accord explicite et libre de la personne | Newsletter, Marketing personnalisé |
| **Art. 6(1)(b) - Contrat** | Nécessaire à l'exécution du contrat | Ouverture de compte, Gestion du crédit |
| **Art. 6(1)(c) - Obligation Légale** | Exigé par la loi | LCB/FT (KYC/AML), FATCA, CRS |
| **Art. 6(1)(f) - Intérêt Légitime** | Intérêt légitime prépondérant sur les droits personnes | Détection de fraude, Sécurité IT |

# TRAITEMENT DE DONNÉES SENSIBLES (ART. 9 RGPD)
Les données biométriques, de santé, d'origine ethnique sont des **données sensibles**.
Leur traitement est interdit sauf exceptions spécifiques (Art. 9(2)), notamment :
- Le consentement **explicite**
- Les obligations légales en matière d'emploi
- La protection des intérêts vitaux
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **RoPA** | Record of Processing Activities — Registre des activités de traitement (Art. 30 RGPD) |
| **DPIA** | Data Protection Impact Assessment — Analyse d'Impact relative à la Protection des Données (Art. 35 RGPD) |
| **NIS2** | Network and Information Security Directive 2 — Directive européenne sur la cybersécurité des entités essentielles |
| **DPO** | Data Protection Officer — Délégué à la Protection des Données, obligatoire pour certaines organisations |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Dans quel délai maximum une organisation doit-elle notifier la **CNIL** d'une violation de données personnelles selon le RGPD ?
- A) 72 heures à compter de la prise de connaissance de la violation
- B) 7 jours ouvrés
- C) 30 jours calendaires
- D) 6 mois après l'audit annuel

**Réponse : A**

**Q2 :** Quel article du RGPD impose de réaliser une **DPIA (Analyse d'Impact)** avant tout traitement susceptible d'engendrer un risque élevé pour les droits et libertés des personnes ?
- A) Article 35 du RGPD
- B) Article 6 du RGPD
- C) Article 17 du RGPD
- D) Article 83 du RGPD

**Réponse : A**

**Q3 :** Quelle est la différence de délai de notification entre le **RGPD** et la **Directive NIS2** en cas d'incident de sécurité ?
- A) NIS2 impose un Early Warning à l'ANSSI en **24h**, puis une notification formelle en **72h** et un rapport final en **30 jours** ; le RGPD impose une notification à la CNIL en **72h** si des données personnelles sont impliquées
- B) Le RGPD n'impose aucun délai
- C) NIS2 impose 7 jours, RGPD impose 48h
- D) Les deux réglementations imposent le même délai de 48h

**Réponse : A**

**Q4 :** Quelle base légale du RGPD (Art. 6) est généralement invoquée par les banques pour le traitement des données dans le cadre de la **lutte contre le blanchiment (LCB-FT)** ?
- A) Art. 6(1)(c) — Obligation Légale (le KYC/AML est imposé par la loi)
- B) Art. 6(1)(a) — Consentement
- C) Art. 6(1)(d) — Protection des intérêts vitaux
- D) Art. 6(1)(f) — Intérêt Légitime

**Réponse : A**

**Q5 :** Quelles sont les deux conditions principales rendant la désignation d'un **DPO (Délégué à la Protection des Données)** obligatoire pour une organisation ?
- A) Être une autorité publique, OU effectuer un suivi systématique à grande échelle de personnes, OU traiter à grande échelle des données sensibles (Art. 9/10 RGPD)
- B) Avoir plus de 10 employés
- C) Être immatriculée en France
- D) Vendre des produits en ligne

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
