# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 531 (6h) : Secure Software Development Lifecycle (S-SDLC) : Exigences de Sécurité, Threat Modeling & Évaluation BSIMM

> [!NOTE]
> **Objectifs pédagogiques :**
> - Structurer un cadre complet de **Secure SDLC (S-SDLC)** intégrant la sécurité à chaque étape de développement
> - Définir les exigences de sécurité dès la phase de spécification (User Stories Sécurité, Abuser Stories)
> - Évaluer la maturité de l'organisation avec le modèle **BSIMM (Building Security In Maturity Model)** et **OWASP SAMM**
> - Automatiser les contrôles d'assurance sécurité tout au long de la chaîne de valeur logicielle
>
> **Compétences visées :** `SEC-05` (A), `POL-01` (A) — Secure Software Development Lifecycle

---

## Module 1 — Le Cadre S-SDLC & le Modèle BSIMM (2h)

### 📖 Intuition & Narration

Traiter la sécurité informatique comme une option que l'on ajoute après la livraison d'un produit logiciel est l'une des erreurs les plus coûteuses de l'ingénierie moderne. Le **Secure SDLC (S-SDLC)** garantit que chaque étape du cycle de vie du logiciel intègre des activités de sécurité obligatoires.

Le cadre **BSIMM (Building Security In Maturity Model)** étudie les programmes de sécurité de centaines de grandes entreprises et fournit un référentiel empirique structuré en 12 pratiques regroupées en 4 domaines : Gouvernance, Intelligence, S-SDLC Touchpoints, et Déploiement.

### 🔍 Anatomie Technique — Les Étape du S-SDLC & Modèle BSIMM

```
LE CYCLE DE VIE DU S-SDLC (SECURE SDLC)

  1. REQUIREMENTS (Spécifications) ──► Security User Stories / Abuser Stories
  2. DESIGN (Architecture)         ──► Threat Modeling (STRIDE) & Architecture Review
  3. IMPLEMENTATION (Codage)      ──► IDE Linter, SAST (Semgrep), Secret Scanning
  4. VERIFICATION (Tests)         ──► DAST (Nuclei), SCA (Trivy), Penetration Testing
  5. DEPLOYMENT (Mise en Prod)    ──► Image Signing (Cosign), Hardened Containers
  6. MAINTENANCE (Opérations)     ──► Vulnerability Management (EPSS) & Incident Response
```

---

## Module 2 — Atelier Pratique : Automated S-SDLC Gate Checker (2h)

### 🛠️ Code Python : S-SDLC Requirements & Abuser Story Evaluator

```python
#!/usr/bin/env python3
"""
PARADIS — Secure SDLC (S-SDLC) Requirements & Compliance Auditor
Vérifie la présence d'Abuser Stories et de contrôles de sécurité associés à chaque User Story.
"""

import json
import sys
from dataclasses import dataclass
from typing import List

@dataclass
class UserStory:
    story_id: str
    feature_name: str
    has_security_requirements: bool
    has_abuser_story: bool
    threat_model_completed: bool

class SSDLCComplianceAuditor:
    def __init__(self, stories: List[UserStory]):
        self.stories = stories

    def audit_s_sdlc_compliance(self) -> dict:
        print("=== AUDIT DE CONFORMITÉ SECURE SDLC (S-SDLC) PARADIS IT ===")
        non_compliant = []

        for s in self.stories:
            if not s.has_security_requirements or not s.has_abuser_story or not s.threat_model_completed:
                non_compliant.append({
                    "story_id": s.story_id,
                    "feature": s.feature_name,
                    "missing_sec_req": not s.has_security_requirements,
                    "missing_abuser_story": not s.has_abuser_story,
                    "missing_threat_model": not s.threat_model_completed
                })

        total = len(self.stories)
        passed = total - len(non_compliant)
        compliance_pct = (passed / total * 100) if total > 0 else 0.0

        print(f"[*] Total User Stories évaluées   : {total}")
        print(f"[*] User Stories S-SDLC Conformes : {passed}")
        print(f"[*] Taux de conformité S-SDLC    : {compliance_pct:.1f}%")

        if non_compliant:
            print("\n[🚨 ERREURS DE SÉCURITÉ CONCEPTION] Fonctionnalités non prêtes pour le sprint :")
            for nc in non_compliant:
                print(f"  ❌ [{nc['story_id']}] {nc['feature']} (Manque: Threat Model={nc['missing_threat_model']}, Abuser Story={nc['missing_abuser_story']})")

        return {
            "compliance_rate": compliance_pct,
            "sprint_approved": compliance_pct >= 90.0
        }

if __name__ == "__main__":
    stories_list = [
        UserStory("US-101", "Authentification Client", True, True, True),
        UserStory("US-102", "Paiement par Carte", True, True, True),
        UserStory("US-103", "Téléchargement Facture PDF", False, False, False) # Non conforme
    ]

    auditor = SSDLCComplianceAuditor(stories_list)
    res = auditor.audit_s_sdlc_compliance()
    if not res["sprint_approved"]:
        print("\n[⛔ SPRINT GATE REJECTED] Sprint bloqué tant que les User Stories ne contiennent pas leur volet sécurité.")
        sys.exit(1)
```

---

## Module 3 — OWASP SAMM vs BSIMM (1h30)

### 🔍 Comparatif BSIMM & OWASP SAMM

1. **BSIMM (Building Security In Maturity Model)** : Modèle descriptif basé sur l'observation réelle de ce que font les entreprises leaders (12 pratiques).
2. **OWASP SAMM (Software Assurance Maturity Model)** : Modèle prescriptif open-source guidant pas à pas l'amélioration de la maturité logicielle de 0 à 3.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **S-SDLC** | Secure Software Development Life Cycle — Cycle de vie du développement logiciel sécurisé |
| **BSIMM** | Building Security In Maturity Model — Modèle de maturité de sécurité logicielle |
| **SAMM** | Software Assurance Maturity Model — Modèle d'assurance logicielle OWASP |

---

## Exercices Pratiques

### Exercice 1 — Rédaction d'une Abuser Story

Rédigez une **Abuser Story** associée à la fonctionnalité d'upload de photo de profil utilisateur.

**Corrigé guidé :**
*"En tant qu'attaquant malveillant, je veux uploader un script PHP/Webshell déguisé en fichier image JPG afin d'exécuter du code à distance (RCE) sur le serveur web de l'entreprise."*

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce que le **Secure SDLC (S-SDLC)** ?

- A) Un nouveau langage de programmation.
- B) L'intégration formelle et obligatoire d'activités et de contrôles de sécurité à chaque étape du cycle de vie du développement logiciel. ✅
- C) Une licence commerciale.
- D) Un câble réseau.

**Q2.** Qu'est-ce qu'une **Abuser Story** par rapport à une User Story classique ?

- A) Une histoire drôle.
- B) La description d'un scénario d'attaque du point de vue d'un attaquant cherchant à détourner une fonctionnalité logicielle. ✅
- C) Un rapport de bug de production.
- D) Un contrat de travail.

**Q3.** Quelle est la caractéristique principale du modèle de maturité **BSIMM** ?

- A) Il est descriptif et basé sur l'observation empirique des pratiques réelles des entreprises leaders. ✅
- B) Il est obligatoire par la loi.
- C) Il ne s'applique qu'aux banques allemandes.
- D) Il est écrit en C++.

**Q4.** Dans le S-SDLC, quelle activité de sécurité doit être réalisée pendant la phase de **Design (Conception)** ?

- A) L'installation du serveur dans la baie.
- B) La modélisation des menaces (Threat Modeling avec STRIDE). ✅
- C) Le tirage de câbles réseau.
- D) L'impression des badges.

**Q5.** Quel est le rôle d'un **S-SDLC Gate** dans un pipeline de gestion de projet Agile/Scrum ?

- A) Interdire les réunions le vendredi.
- B) Bloquer le passage d'une User Story en développement si ses exigences de sécurité et son Threat Model n'ont pas été rédigés. ✅
- C) Réduire le temps de pause café.
- D) Augmenter la taille de l'écran.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
