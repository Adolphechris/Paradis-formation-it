# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 544 (6h) : Conformité & Réglementation : ISO 27001, SOC 2 Type II, PCI DSS & DORA

> [!NOTE]
> **Objectifs pédagogiques :**
> - Distinguer les périmètres et les exigences des principaux référentiels de conformité : **ISO/IEC 27001:2022**, **SOC 2 Type II**, **PCI DSS v4.0** et **DORA (Digital Operational Resilience Act)**
> - Comprendre le processus de **certification ISO 27001** : déclaration d'applicabilité (SoA), traitement des risques, audits de certification
> - Maîtriser les 12 exigences **PCI DSS** pour la protection des données de titulaires de cartes bancaires
> - Identifier les obligations de la réglementation européenne **DORA** pour les entités financières
>
> **Compétences visées :** `POL-01` (A), `POL-02` (A) — Compliance, Security Governance, Regulatory Frameworks

---

## Module 1 — ISO/IEC 27001:2022 : Système de Management de la Sécurité de l'Information (2h)

### 📖 Intuition & Narration

**ISO/IEC 27001** est la norme internationale de référence pour les **Systèmes de Management de la Sécurité de l'Information (SMSI)**. Elle ne prescrit pas de solutions techniques précises mais impose un **cadre de gouvernance** : définir le périmètre, identifier les risques, les traiter, et améliorer continuellement.

Obtenir la certification ISO 27001, c'est démontrer à ses clients, partenaires et régulateurs que l'organisation a mis en place un **processus rigoureux et auditable** de gestion de la sécurité — pas seulement des outils.

La version 2022 a réorganisé les **Annexe A** en 4 thèmes (Organisationnels, Personnel, Physiques, Technologiques) et ajouté 11 nouveaux contrôles dont : Threat Intelligence, Cloud Security, Data Masking, Web Filtering, Secure Coding.

### 🔍 Structure de la Norme ISO 27001:2022

```
STRUCTURE CLAUSE ISO 27001:2022 (MODÈLE PDCA)

  PLAN (Planifier)
  ├── Clause 4 : Contexte de l'organisation (parties prenantes, périmètre SMSI)
  ├── Clause 5 : Leadership (engagement de la direction, politique de sécurité)
  ├── Clause 6 : Planification (évaluation des risques, déclaration d'applicabilité SoA)
  └── Clause 7 : Support (ressources, compétences, communication)

  DO (Faire)
  └── Clause 8 : Fonctionnement (mise en œuvre du traitement des risques, Annexe A)

  CHECK (Vérifier)
  ├── Clause 9 : Évaluation des performances (audits internes, revue de direction)

  ACT (Améliorer)
  └── Clause 10 : Amélioration (non-conformités, actions correctives)
```

### 🔍 La Déclaration d'Applicabilité (SoA — Statement of Applicability)

La **SoA** est le document central de l'ISO 27001. Elle liste les **93 contrôles de l'Annexe A** et indique pour chacun :
- S'il est **applicable** au périmètre SMSI
- S'il est **mis en œuvre** (avec justification)
- La **raison d'exclusion** si non applicable

---

## Module 2 — PCI DSS v4.0 & SOC 2 Type II (2h)

### 🔍 PCI DSS v4.0 — Protection des Données de Cartes Bancaires

**PCI DSS (Payment Card Industry Data Security Standard)** est la norme de sécurité applicable à toute organisation traitant, stockant ou transmettant des données de titulaires de cartes bancaires. Non-conformité = amendes (jusqu'à 100 000 USD/mois) et retrait du droit d'accepter les paiements par carte.

```
PCI DSS v4.0 — 12 EXIGENCES

  RÉSEAU SÉCURISÉ
  01. Installer et maintenir des contrôles de sécurité réseau
  02. Appliquer des configurations sécurisées à tous les composants système

  PROTECTION DES DONNÉES DU TITULAIRE DE CARTE
  03. Protéger les données stockées du titulaire de carte (chiffrement, masquage PAN)
  04. Protéger les données du titulaire de carte transmises sur les réseaux ouverts (TLS 1.2+)

  GESTION DES VULNÉRABILITÉS
  05. Protéger tous les systèmes contre les logiciels malveillants (AV/EDR)
  06. Développer et maintenir des systèmes et des logiciels sécurisés (SAST, patching)

  CONTRÔLE D'ACCÈS STRICT
  07. Restreindre l'accès aux composants système et aux données du titulaire selon le besoin
  08. Identifier les utilisateurs et authentifier les accès aux composants système (MFA)
  09. Restreindre l'accès physique aux données du titulaire de carte

  SURVEILLANCE & TESTS
  10. Journaliser et surveiller tous les accès aux ressources système (SIEM, logs 12 mois)
  11. Tester régulièrement la sécurité des systèmes et réseaux (pentest, ASV scan trimestriel)

  POLITIQUE DE SÉCURITÉ
  12. Maintenir une politique de sécurité de l'information pour tout le personnel
```

### 🔍 SOC 2 Type II — Trust Service Criteria

Le **SOC 2 (System and Organization Controls 2)** est une norme de l'AICPA (American Institute of CPAs) spécifique aux prestataires de services cloud et SaaS. Elle évalue les **5 Trust Service Criteria** :
- **Security** (obligatoire) : Protection contre les accès non autorisés
- **Availability** : Disponibilité du service
- **Processing Integrity** : Intégrité des traitements
- **Confidentiality** : Protection des informations confidentielles
- **Privacy** : Traitement des données personnelles

La différence entre **Type I** (à un instant T) et **Type II** (sur une période de 6 à 12 mois) est fondamentale : le Type II prouve que les contrôles fonctionnent de manière **continue et efficace** dans la durée.

---

## Module 3 — DORA : Digital Operational Resilience Act (1h30)

### 🛠️ Atelier Pratique — Mapping de Conformité Multi-Référentiels

```python
#!/usr/bin/env python3
"""
PARADIS — Compliance Mapping Tool
Évalue la couverture d'un contrôle technique par rapport aux référentiels
ISO 27001, PCI DSS et DORA.
"""
from dataclasses import dataclass
from typing import List

@dataclass
class ComplianceControl:
    control_id: str
    description: str
    iso27001_refs: List[str]
    pci_dss_refs: List[str]
    dora_refs: List[str]
    status: str  # "IMPLÉMENTÉ" | "PARTIEL" | "MANQUANT"
    evidence: str

class ComplianceMappingEngine:
    def __init__(self, org: str):
        self.org = org
        self.controls: List[ComplianceControl] = []

    def add_control(self, control: ComplianceControl):
        self.controls.append(control)

    def generate_report(self):
        print(f"\n{'='*65}")
        print(f"  RAPPORT DE CONFORMITÉ MULTI-RÉFÉRENTIELS — {self.org}")
        print(f"{'='*65}\n")

        implemented = [c for c in self.controls if c.status == "IMPLÉMENTÉ"]
        partial = [c for c in self.controls if c.status == "PARTIEL"]
        missing = [c for c in self.controls if c.status == "MANQUANT"]

        for control in self.controls:
            icon = "✅" if control.status == "IMPLÉMENTÉ" else ("⚠️" if control.status == "PARTIEL" else "❌")
            print(f"  {icon} [{control.status}] {control.control_id} — {control.description}")
            if control.iso27001_refs:
                print(f"      ISO 27001 : {', '.join(control.iso27001_refs)}")
            if control.pci_dss_refs:
                print(f"      PCI DSS   : {', '.join(control.pci_dss_refs)}")
            if control.dora_refs:
                print(f"      DORA      : {', '.join(control.dora_refs)}")
            if control.evidence:
                print(f"      Preuve    : {control.evidence}")
            print()

        total = len(self.controls)
        print(f"  {'─'*55}")
        print(f"  SCORE : Implémenté={len(implemented)}/{total} | Partiel={len(partial)}/{total} | Manquant={len(missing)}/{total}")
        score = (len(implemented) + len(partial) * 0.5) / total * 100
        print(f"  SCORE PONDÉRÉ : {score:.0f}%")
        print(f"{'='*65}\n")


if __name__ == "__main__":
    engine = ComplianceMappingEngine("PARADIS FINANCE")

    engine.add_control(ComplianceControl(
        "CTRL-001", "Chiffrement des données au repos (AES-256)",
        ["A.8.24 - Use of cryptography"],
        ["Req. 3.5 - Protection des PAN"],
        ["Art. 9 - ICT Security Policies"],
        "IMPLÉMENTÉ",
        "Transparent Data Encryption activé sur SQL Server & PostgreSQL production"
    ))
    engine.add_control(ComplianceControl(
        "CTRL-002", "Authentification Multi-Facteurs (MFA)",
        ["A.8.5 - Secure authentication"],
        ["Req. 8.4 - MFA pour accès distant"],
        ["Art. 9 - IAM Controls"],
        "IMPLÉMENTÉ",
        "Azure AD MFA enforced pour tous les comptes + PAM CyberArk pour comptes admin"
    ))
    engine.add_control(ComplianceControl(
        "CTRL-003", "Tests de pénétration annuels",
        ["A.8.8 - Management of technical vulnerabilities"],
        ["Req. 11.4 - Tests de pénétration"],
        ["Art. 26 - TLPT (Threat-Led Penetration Testing)"],
        "PARTIEL",
        "Pentest externe effectué en 2023 — DORA TLPT non encore compliant (deadline: Jan 2025)"
    ))
    engine.add_control(ComplianceControl(
        "CTRL-004", "Plan de continuité et tests de reprise (BCDR)",
        ["A.5.30 - ICT readiness for business continuity"],
        ["Req. 12.10 - Plan de réponse aux incidents"],
        ["Art. 11 - Business Continuity Management"],
        "PARTIEL",
        "PCA validé, mais test de reprise DRP non effectué depuis 18 mois"
    ))
    engine.add_control(ComplianceControl(
        "CTRL-005", "Journalisation centralisée (SIEM) 12 mois",
        ["A.8.15 - Logging"],
        ["Req. 10.5 - Rétention des logs 12 mois"],
        ["Art. 10 - ICT Incident Management"],
        "IMPLÉMENTÉ",
        "Microsoft Sentinel avec rétention 13 mois (Log Analytics Workspace)"
    ))

    engine.generate_report()
```

### 🔍 DORA — Obligations Clés pour les Entités Financières

**DORA** (Digital Operational Resilience Act, Règlement EU 2022/2554) est applicable depuis **janvier 2025** à toutes les entités financières de l'UE (banques, assurances, sociétés d'investissement, prestataires de services cloud critiques pour la finance).

Ses 5 piliers principaux :
1. **Gestion des risques ICT** (Articles 6-16) : Framework de gestion des risques IT documenté
2. **Gestion des incidents** (Articles 17-23) : Classification et notification des incidents ICT
3. **Tests de résilience** (Articles 24-27) : Tests avancés TLPT (Threat-Led Penetration Testing) pour les entités majeures
4. **Risques tiers ICT** (Articles 28-44) : Due diligence sur les fournisseurs cloud critiques
5. **Partage d'informations** (Article 45) : Participation aux échanges de CTI entre entités financières

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SMSI** | Système de Management de la Sécurité de l'Information — Cadre ISO 27001 |
| **SoA** | Statement of Applicability (Déclaration d'Applicabilité) — Document central ISO 27001 listant l'applicabilité des 93 contrôles |
| **PCI DSS** | Payment Card Industry Data Security Standard — Norme de sécurité pour les données bancaires |
| **DORA** | Digital Operational Resilience Act — Règlement européen 2022/2554 sur la résilience numérique financière |
| **TLPT** | Threat-Led Penetration Testing — Tests de pénétration avancés basés sur des scénarios de menace réels (DORA Article 26) |

---

## Exercices Pratiques

### Exercice 1 — Sélection du Référentiel Adapté

Pour chacune des organisations suivantes, identifiez le(s) référentiel(s) de conformité prioritaire(s) et justifiez votre choix :

1. Une startup fintech française proposant des paiements par carte en ligne.
2. Un cabinet d'audit informatique proposant des services cloud managés à 200 clients entreprises.
3. Une banque d'investissement opérant dans l'UE avec un chiffre d'affaires de 500M€.

**Corrigé guidé :**
1. **PCI DSS v4.0** (obligatoire pour tout traitement de PAN) + **ISO 27001** (exigé par les acquéreurs bancaires) + RGPD (données personnelles).
2. **SOC 2 Type II** (preuve de sécurité continue pour les clients SaaS/cloud) + **ISO 27001** (reconnaissance internationale) + **ISO 27017/27018** (sécurité cloud).
3. **DORA** (obligatoire depuis janvier 2025 pour les entités financières UE) + **ISO 27001** + **DORA TLPT** (entité systémique) + règlement BCBS 239 (reporting risques).

---

## Banque QCM — 5 Questions

**Q1.** Dans la norme **ISO 27001:2022**, qu'est-ce que la **Déclaration d'Applicabilité (SoA)** ?

- A) Un document listant tous les risques identifiés dans l'organisation.
- B) Le document central du SMSI listant les 93 contrôles de l'Annexe A, indiquant pour chacun s'il est applicable, mis en œuvre, et justifiant les exclusions éventuelles. ✅
- C) Un rapport d'audit annuel rédigé par l'auditeur externe.
- D) Un plan de continuité d'activité.

**Q2.** La différence fondamentale entre un rapport **SOC 2 Type I** et un **SOC 2 Type II** est :

- A) Le Type I couvre plus de critères de confiance que le Type II.
- B) Le Type I évalue la conception des contrôles à un instant T, tandis que le Type II évalue l'efficacité opérationnelle des contrôles sur une période de 6 à 12 mois. ✅
- C) Le Type II est réservé aux entreprises américaines uniquement.
- D) Il n'y a aucune différence significative entre les deux types.

**Q3.** L'exigence **PCI DSS Req. 3.5** impose de :

- A) Chiffrer les transmissions de données entre les datacenters.
- B) Protéger les données stockées du titulaire de carte en ne conservant que les données strictement nécessaires et en masquant le PAN lors de son affichage (ex: 4111 11** **** 1111). ✅
- C) Effectuer des tests de pénétration trimestriels.
- D) Implémenter le MFA pour tous les utilisateurs.

**Q4.** Le règlement **DORA** (Digital Operational Resilience Act) est applicable à partir de :

- A) Janvier 2023
- B) Juin 2024
- C) Janvier 2025 ✅
- D) Décembre 2026

**Q5.** Les **TLPT (Threat-Led Penetration Testing)** imposés par DORA aux entités financières majeures se distinguent des pentests classiques par :

- A) Leur coût plus faible.
- B) Le fait qu'ils sont basés sur des scénarios de menace réels tirés de la Threat Intelligence (CTI), réalisés par des red teams agréées, et supervisés par l'autorité de régulation nationale. ✅
- C) Ils ne testent que les applications web.
- D) Ils sont effectués automatiquement par des scanners de vulnérabilités.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
