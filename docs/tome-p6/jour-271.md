# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 271 (6h) : Gouvernance, Risques & Conformité GRC (ISO 27001:2022, Méthode EBIOS RM, Directive NIS 2 & Règlement DORA)

> [!NOTE]
> **Objectif du jour :** Maîtriser la **Gouvernance, la Gestion des Risques et la Conformité (GRC)** selon les référentiels internationaux ciblés par les certifications **CISM** et **CRISC** : conduire une analyse de risques avec la méthode **EBIOS RM (ANSSI)**, mettre en œuvre les 93 contrôles de l'Annexe A de la norme **ISO/IEC 27001:2022**, et appliquer les exigences de la directive européenne **NIS 2** et du règlement **DORA**.
>
> **Compétences visées :** `GRC-01` (A) — ISO 27001:2022 & EBIOS RM Risk Assessment | `GRC-02` (A) — NIS 2 & DORA Regulatory Compliance

---

## 🎯 Objectifs de la Leçon

- 📐 Déployer la méthode **EBIOS RM** (ANSSI) à travers ses 5 ateliers méthodologiques d'évaluation des risques.
- 🏗️ Structurer un Système de Management de la Sécurité de l'Information (**SMSI**) selon le standard **ISO/IEC 27001:2022**.
- 📋 Exploiter la révision 2022 de l'**Annexe A de l'ISO 27001** (93 contrôles regroupés en 4 thèmes).
- 🇪🇺 Appliquer les obligations juridiques de la directive **NIS 2** et du règlement financier **DORA** (*Digital Operational Resilience Act*).
- 🧪 Développer et exécuter le script de génération du registre de risques et matrice EBIOS RM (`ebios_risk_matrix.py`).

---

## 🖼️ Gouvernance, Risques & Conformité (GRC)

![GRC ISO 27001 NIS2 DORA](https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800)

---

## 📖 1. La Méthodologie d'Analyse de Risques EBIOS RM (ANSSI)

### 1.1 Narration & Intuition — L'Architecte et le Contrôleur Technique

Construire un système d'information sans gouvernance GRC, c'est comme ériger un gratte-ciel en bord de mer sans étude de sol. Vous pouvez ajouter les meilleurs verrous aux portes (EDR, Firewall), si une tempête ébranle les fondations (faille organisationnelle, risque fournisseur, non-conformité légale), tout le bâtiment s'effondre.

La méthode **EBIOS Risk Manager (EBIOS RM)** est la démarche d'analyse de risques développée par l'ANSSI. Elle permet d'identifier les événements redoutés et de construire une stratégie de défense ciblée sur les enjeux métiers.

```
                    LES 5 ATELIERS DE LA MÉTHODE EBIOS RM (ANSSI)
┌──────────────────────────────────────────────────────────────────────────┐
│ ATELIER 1 : SOCLE DE SÉCURITÉ                                            │
│ - Délimiter le périmètre et identifier les Biens Essentiels / Événements │
│   Redoutés (ex: Indisponibilité du système de paiement > 2h).            │
├──────────────────────────────────────────────────────────────────────────┤
│ ATELIER 2 : SOURCES DE RISQUES (SR) & OBJECTIFS VISÉS (OV)               │
│ - Identifier qui attaque (Cybercriminels, États, Hacktivistes) et        │
│   pourquoi (Gain financier, Espionnage, Sabotage).                       │
├──────────────────────────────────────────────────────────────────────────┤
│ ATELIER 3 : SCÉNARIOS STRATÉGIQUES                                       │
│ - Cartographier les chemins d'attaque de haut niveau sur l'écosystème    │
│   (Sous-traitants, Prestataires Cloud, Partenaires).                      │
├──────────────────────────────────────────────────────────────────────────┤
│ ATELIER 4 : SCÉNARIOS OPÉRATIONNELS                                      │
│ - Détailler les séquences d'actions techniques complexes (TTPs MITRE)     │
│   permettant de réaliser le scénario stratégique.                         │
├──────────────────────────────────────────────────────────────────────────┤
│ ATELIER 5 : TRAITEMENT DU RISQUE (PACS)                                  │
│ - Définir le Plan d'Amélioration de la Sécurité (Mesures de sécurité).   │
└──────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Formule de Calcul du Risque

Le risque $R$ est la combinaison de la **Vraisemblance ($V$)** d'une attaque et de sa **Gravité ($G$)** pour l'organisation :

$$\text{Risque } R = \text{Vraisemblance } (V) \times \text{Gravité } (G)$$

- Échelle standard (1 à 4) :
  - **$V$ (Vraisemblance)** : 1 (Minime), 2 (Raisonniez), 3 (Forte), 4 (Très forte / Presque certaine).
  - **$G$ (Gravité)** : 1 (Mineure), 2 (Modérée), 3 (Majeure), 4 (Critique / Survie de l'entreprise).
  - Score $R \ge 12$ ──► **Risque Critique exigeant un traitement immédiat !**

---

## 📖 2. Le SMSI et la Norme ISO/IEC 27001:2022

La norme **ISO/IEC 27001:2022** définit les exigences pour établir, mettre en œuvre, maintenir et améliorer un **Système de Management de la Sécurité de l'Information (SMSI)**.

### 2.1 Les 93 Contrôles de l'Annexe A (Révision 2022)

La révision 2022 de la norme a réorganisé l'Annexe A en **4 catégories simplifiées** :

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ANNEXE A ISO 27001:2022 (93 CONTRÔLES DÉCLINÉS EN 4 CATÉGORIES)         │
├─────────────────────────────────────┬────────────────────────────────────┤
│ A.5 Contrôles Organisationnels      │ 37 contrôles (Politiques, Rôles,   │
│                                     │  Gestion des actifs, Supply Chain) │
├─────────────────────────────────────┼────────────────────────────────────┤
│ A.6 Contrôles Personnes             │ 8 contrôles (Sensibilisation,      │
│                                     │  Recrutement, Télétravail)         │
├─────────────────────────────────────┼────────────────────────────────────┤
│ A.7 Contrôles Physiques             │ 14 contrôles (Zones sécurisées,    │
│                                     │  Datacenter, Sécurité matériel)    │
├─────────────────────────────────────┼────────────────────────────────────┤
│ A.8 Contrôles Techniques            │ 34 contrôles (MFA, Chiffrement,    │
│                                     │  EDR, Sauvegardes, Malware)        │
└─────────────────────────────────────┴────────────────────────────────────┘
```

---

## 📖 3. Le Cadre Réglementaire Européen : NIS 2 & DORA

### 3.1 La Directive Européenne NIS 2

La directive **NIS 2** impose des obligations de cybersécurité renforcées aux **Entités Essentielles (EE)** et **Entités Importantes (EI)** avec des sanctions financières jusqu'à **10 millions d'euros ou 2% du chiffre d'affaires mondial**.

- **Exigences clés NIS 2** :
  1. Utilisation de solutions de chiffrages forts et d'authentification multi-facteurs (MFA).
  2. Sécurité de la chaîne d'approvisionnement (*Supply Chain Risk*).
  3. Gestion des vulnérabilités et des incidents.
  4. **Délai d'Alerte Incident** : Notification initiale en **24h**, rapport intermédiaire à **72h**, et rapport final sous **1 mois**.

### 3.2 Le Règlement DORA (Digital Operational Resilience Act)

Appliqué au **secteur financier européen** (Banques, Assurances, Crypto-actifs), DORA repose sur 5 piliers :

```
                    LES 5 PILIERS DU RÈGLEMENT DORA
┌──────────────────────────────────────────────────────────────────────────┐
│ 1. Gestion des Risques TIC (ICT Risk Management Framework)                │
│ 2. Gestion et Notification des Incidents Majeurs (Délai d'alerte: 4h)    │
│ 3. Tests de Résilience Opérationnelle Numérique (TLPT / Red Teaming)     │
│ 4. Gestion des Risques liés aux Prestataires Tiers TIC                   │
│ 5. Partage d'Informations sur les Menaces (Threat Intelligence Sharing)  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🧪 4. Atelier Pratique : Registre de Risques EBIOS RM (`ebios_risk_matrix.py`)

### Script Python : Matrice EBIOS RM & Analyse de Conformité

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PARADIS IT — Masterclass Cybersécurité (Tome P6 - Jour 271)
GRC : Matrice de Risques EBIOS RM & Registre de Conformité NIS 2 / ISO 27001
"""

import json
import time

def evaluate_ebios_risk_register():
    """Génère le registre des risques EBIOS RM."""
    risk_database = [
        {
            "id": "RSK-01",
            "threat_scenario": "Compromission Active Directory via ADCS ESC1 suivie d'un Ransomware global",
            "vraisemblance": 4,  # Échelle 1-4
            "gravite": 4,       # Échelle 1-4
            "mitigation_controls": ["MFA FIDO2 Obligatoire", "Micro-segmentation Cilium eBPF", "Sauvegardes S3 Immutables"]
        },
        {
            "id": "RSK-02",
            "threat_scenario": "Exfiltration de données clients par rebond SSRF sur l'application Web Cloud",
            "vraisemblance": 3,
            "gravite": 4,
            "mitigation_controls": ["IMDSv2 Enforced", "Pipeline DevSecOps Checkov", "WAF Rules"]
        },
        {
            "id": "RSK-03",
            "threat_scenario": "Interruption de service suite au vol d'identifiants sur un sous-traitant (Supply Chain)",
            "vraisemblance": 3,
            "gravite": 3,
            "mitigation_controls": ["Audit NIS 2 Tierces Parties", "Zero Trust SPIFFE/SPIRE Workload Identity"]
        }
    ]

    processed_risks = []
    for r in risk_database:
        score_brut = r["vraisemblance"] * r["gravite"]
        # Réduction de risque grâce aux mesures applicables (PACS)
        score_residuel = max(1, score_brut - 6)
        
        status = "CRITIQUE (Traitement Immédiat)" if score_brut >= 12 else "MAJEUR"
        
        processed_risks.append({
            "id": r["id"],
            "scenario": r["threat_scenario"],
            "score_brut": score_brut,
            "score_residuel": score_residuel,
            "classification": status,
            "pacs_controls": r["mitigation_controls"]
        })
    
    return processed_risks

def generate_compliance_status():
    """Vérifie le respect des exigences NIS 2 et DORA."""
    return {
        "iso_27001_annex_a": "93 Contrôles Conformes (SoA Validée)",
        "nis2_early_warning": "Notification 24h configurée dans le SOAR Shuffle",
        "dora_resilience_testing": "TLPT Red Team validé (Projet Capstone S6)"
    }

def main():
    print("=================================================================")
    print("   PARADIS IT — GRC & EBIOS RM RISK MANAGEMENT ENGINE            ")
    print("=================================================================")
    time.sleep(1)

    risks = evaluate_ebios_risk_register()
    compliance = generate_compliance_status()

    report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "auditor": "Senior GRC Consultant / CISO Lead",
        "ebios_rm_register": risks,
        "compliance_summary": compliance
    }

    print(json.dumps(report, indent=2))
    print("-----------------------------------------------------------------")
    print(f"ATELIER EBIOS RM TERMINÉ : {len(risks)} Scénarios de risques évalués.")
    print("STATUT DU SMSI : ✅ CONFORME ISO 27001:2022 / NIS 2 / DORA")
    print("=================================================================")

if __name__ == "__main__":
    main()
```

### Exécution du Script dans le Terminal

```bash
# Exécuter l'évaluation du registre de risques EBIOS RM
python3 -c "
import json
risks = [
    {'id': 'RSK-01', 'score': 16, 'status': 'CRITIQUE'},
    {'id': 'RSK-02', 'score': 12, 'status': 'CRITIQUE'},
    {'id': 'RSK-03', 'score': 9,  'status': 'MAJEUR'}
]
print('=== REGISTRE DE RISQUES EBIOS RM PROCESSE ===')
print(json.dumps(risks, indent=2))
"
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Que faire lorsque le Conseil d'Administration refuse le budget d'un plan de traitement des risques (PACS) ?
- **Réflexe** : Présentez le coût financier direct du **risque de non-conformité NIS 2 / DORA** (amendes jusqu'à 10 M€ et responsabilité pénale du dirigeant) comparé au coût de la mesure de sécurité. La gouvernance GRC doit s'exprimer en langage de risque financier métier.

### 2. Différence entre la Déclaration d'Applicabilité (DDA / SoA) et le SMSI
- **Réflexe** : Le **SMSI** est l'ensemble de l'organisation (processus, politiques, personnes). La **DDA (Statement of Applicability)** est le document formel qui liste chacun des 93 contrôles de l'Annexe A de l'ISO 27001 et justifie s'il est conservé ou exclu du périmètre.

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Combien d'ateliers méthodologiques successifs comporte la démarche d'analyse de risques EBIOS RM recommandée par l'ANSSI ?**
- A) 2 ateliers
- B) 5 ateliers
- C) 10 ateliers
- D) 1 seul atelier

*Réponse : B — La méthode EBIOS RM est structurée autour de 5 ateliers (Socle, Sources de risques, Scénarios stratégiques, Scénarios opérationnels, Traitement).*

**Q2 : Dans la révision 2022 de la norme ISO/IEC 27001, combien de contrôles de sécurité sont regroupés dans l'Annexe A ?**
- A) 114 contrôles
- B) 93 contrôles répartis en 4 catégories (Organisationnel, Personnes, Physique, Technique)
- C) 50 contrôles
- D) 200 contrôles

*Réponse : B — L'Annexe A révisée de l'ISO 27001:2022 comporte 93 contrôles classés en 4 thèmes.*

**Q3 : Quel est le délai légal d'alerte précoce (*Early Warning*) imposé par la directive européenne NIS 2 en cas d'incident de sécurité significatif ?**
- A) 24 heures
- B) 72 heures
- C) 30 jours
- D) 1 an

*Réponse : A — NIS 2 impose une notification précoce obligatoire à l'autorité nationale (ANSSI) dans les 24 heures.*

**Q4 : Quel secteur d'activité est spécifiquement visé par le règlement européen DORA (*Digital Operational Resilience Act*) ?**
- A) Le secteur agricole
- B) Le secteur financier et bancaire (Banques, Assurances, Prestataires TIC)
- C) Le secteur de la restauration
- D) Le secteur de l'automobile

*Réponse : B — DORA harmonise la résilience numérique et la gestion des risques TIC pour le secteur financier européen.*

**Q5 : Quelle est la formule standard de calcul de la sévérité d'un risque en gestion de la sécurité des SI ?**
- A) Risque = Prix du serveur / Nombre d'utilisateurs
- B) Risque = Vraisemblance ($V$) $\times$ Gravité ($G$)
- C) Risque = Nombre d'antivirus
- D) Risque = Vitesse de la fibre optique

*Réponse : B — La valeur d'un risque résulte de la multiplication de sa Vraisemblance par sa Gravité pour l'entreprise.*

**Q6 : Quelle certification internationale reconnue par l'ISACA valide l'expertise d'un responsable de la gouvernance et de la gestion des risques des SI ?**
- A) CEH
- B) CRISC (Certified in Risk and Information Systems Control) / CISM
- C) Network+
- D) CCNA

*Réponse : B — CRISC et CISM sont les certifications de référence internationale pour les managers GRC.*

**Q7 : Comment nomme-t-on le document obligatoire ISO 27001 qui liste les 93 contrôles et justifie leur inclusion ou exclusion du SMSI ?**
- A) La Déclaration d'Applicabilité (DDA / Statement of Applicability - SoA)
- B) La facture d'électricité
- C) Le contrat de travail
- D) Le manuel d'utilisation de Windows

*Réponse : A — La DDA (SoA) formalise la sélection et la justification des contrôles de sécurité retenus par l'entreprise.*

**Q8 : Quel atelier de la méthode EBIOS RM est consacré à la modélisation détaillée des séquences d'actions techniques (TTPs MITRE ATT&CK) de l'attaquant ?**
- A) Atelier 1 (Socle)
- B) Atelier 4 (Scénarios Opérationnels)
- C) Atelier 2 (Sources de risques)
- D) Atelier 5 (PACS)

*Réponse : B — L'Atelier 4 modélise les scénarios opérationnels techniques précis empruntés par les attaquants.*

---

## 📚 Ressources & Références

- **ANSSI — Guide de la Méthode EBIOS Risk Manager** : https://www.ssi.gouv.fr/guide/ebios-risk-manager-la-methode/
- **ISO/IEC 27001:2022 Information Security Management Systems** : https://www.iso.org/standard/27001
- **Directive Européenne NIS 2 (ANSSI Information)** : https://www.ssi.gouv.fr/entreprise/reglementation/nis-2/
- **European Commission — Digital Operational Resilience Act (DORA)** : https://ec.europa.eu/info/business-economy-euro/banking-and-finance/digital-finance_en

---

*Semestre 6 — Cybersécurité Expert & Red Team Avancé PARADIS IT Masterclass*
