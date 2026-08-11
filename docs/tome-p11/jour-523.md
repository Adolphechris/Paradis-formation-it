# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 523 (6h) : Revues d'Architecture de Sécurité & Threat Modeling : Modèles STRIDE, PASTA, Arbres d'Attaque & LINDDUN

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser les méthodologies formelles de **Threat Modeling (Modélisation des Menaces)** lors de la phase de conception applicative
> - Appliquer le modèle de menaces **STRIDE** (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)
> - Construire des **Arbres d'Attaque (Attack Trees)** et mener une analyse selon la méthodologie **PASTA**
> - Modéliser les atteintes à la vie privée avec le modèle **LINDDUN** (Linkability, Identifiability, Non-repudiation, Detectability, Disclosure, Unawareness, Non-compliance)
>
> **Compétences visées :** `SEC-04` (A), `SEC-05` (A) — Threat Modeling & Security Architecture

---

## Module 1 — Principes du Threat Modeling & Modèle STRIDE (2h)

### 📖 Intuition & Narration

Le Threat Modeling est l'équivalent, pour l'ingénieur sécurité, de l'analyse des contraintes de charge pour un ingénieur en génie civil. Avant d'écrire la moindre ligne de code ou d'ouvrir un port réseau, l'équipe s'assoit devant un schéma d'architecture et se pose 4 questions fondamentales :

1. **Sur quoi travaillons-nous ?** (Diagramme de flux de données — DFD).
2. **Qu'est-ce qui peut mal tourner ?** (Modélisation des menaces via STRIDE).
3. **Que allons-nous faire pour y remédier ?** (Mesures de mitigation / Hardening).
4. **Avons-nous fait un bon travail ?** (Revue et validation).

Détecter une erreur de conception par le Threat Modeling avant le codage permet d'éviter des vulnérabilités architecturales qu'aucun scanner SAST ou DAST ne pourra corriger automatiquement par la suite.

### 🔍 Anatomie Technique — Le Modèle STRIDE (Microsoft)

```
LE MODÈLE DE MENACES STRIDE (MICROSOFT)

  ┌────────────────────────────────────────────────────────────────────────┐
  │ MENACE STRIDE              │ PROPRIÉTÉ DE SÉCURITÉ VIOLÉE             │
  ├────────────────────────────┼──────────────────────────────────────────┤
  │ S — Spoofing (Usurpation)  │ Authentification (Usurpation d'identité)│
  │ T — Tampering (Altération) │ Intégrité (Modification non autorisée)   │
  │ R — Repudiation            │ Non-répudiation (Absence de preuves/logs)│
  │ I — Information Disclosure │ Confidentialité (Fuite de données)       │
  │ D — Denial of Service      │ Disponibilité (Surcharge / Panne)        │
  │ E — Elevation of Privilege │ Autorisation (Accès admin non autorisé)  │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Atelier Pratique : Moteur de Threat Modeling Python (STRIDE Engine) (2h)

### 🛠️ Code Python : Automated STRIDE Threat Modeling Engine

```python
#!/usr/bin/env python3
"""
PARADIS — STRIDE Threat Modeling & Risk Analyzer Engine
Analyse un diagramme de flux de données (DFD) sous forme d'objets et génère automatiquement les menaces STRIDE.
"""

import json
import sys
from dataclasses import dataclass
from typing import List

@dataclass
class DFDElement:
    element_id: str
    name: str
    element_type: str   # "Process", "DataStore", "DataFlow", "ExternalEntity"
    is_authenticated: bool
    is_encrypted: bool
    crosses_trust_boundary: bool

class STRIDEEngine:
    def __init__(self, elements: List[DFDElement]):
        self.elements = elements

    def analyze_threats(self) -> List[dict]:
        print("=== ANALYSE AUTOMATISÉE DES MENACES STRIDE PARADIS IT ===")
        threats = []

        for elem in self.elements:
            # 1. Verification Spoofing (S)
            if not elem.is_authenticated and elem.element_type in ("ExternalEntity", "Process"):
                threats.append({
                    "element": elem.name,
                    "stride_category": "Spoofing (Usurpation)",
                    "severity": "HIGH",
                    "description": f"L'élément '{elem.name}' n'exige pas d'authentification forte. Risque d'usurpation.",
                    "mitigation": "Implémenter mTLS / OAuth 2.1 avec authentification forte."
                })

            # 2. Verification Tampering (T) & Information Disclosure (I)
            if elem.element_type == "DataFlow" and not elem.is_encrypted:
                threats.append({
                    "element": elem.name,
                    "stride_category": "Tampering & Information Disclosure",
                    "severity": "CRITICAL",
                    "description": f"Le flux de données '{elem.name}' circule en clair sans chiffrement.",
                    "mitigation": "Forcer le chiffrement TLS 1.3 de bout en bout."
                })

            # 3. Verification Elevation of Privilege (E)
            if elem.crosses_trust_boundary and not elem.is_authenticated:
                threats.append({
                    "element": elem.name,
                    "stride_category": "Elevation of Privilege",
                    "severity": "CRITICAL",
                    "description": f"L'élément '{elem.name}' franchit une frontière de confiance sans validation.",
                    "mitigation": "Ajouter un Policy Enforcement Point (PEP) et validation des entrées."
                })

        return threats

if __name__ == "__main__":
    dfd = [
        DFDElement("E1", "Navigateur Client", "ExternalEntity", is_authenticated=False, is_encrypted=True, crosses_trust_boundary=True),
        DFDElement("F1", "Flux HTTP API", "DataFlow", is_authenticated=False, is_encrypted=False, crosses_trust_boundary=True),
        DFDElement("P1", "API Payment Gateway", "Process", is_authenticated=True, is_encrypted=True, crosses_trust_boundary=False),
        DFDElement("D1", "Base de Données SQL", "DataStore", is_authenticated=True, is_encrypted=True, crosses_trust_boundary=False)
    ]

    engine = STRIDEEngine(dfd)
    detected_threats = engine.analyze_threats()

    print(f"\n[!] Nombre de menaces STRIDE identifiées : {len(detected_threats)}")
    print("\n" + "═"*75)
    print("  RAPPORT DE Threat Modeling STRIDE")
    print("═"*75)
    for t in detected_threats:
        print(f"  📌 [{t['stride_category']}] sur '{t['element']}' (Sévérité : {t['severity']})")
        print(f"     Description : {t['description']}")
        print(f"     Mitigation  : {t['mitigation']}\n")
    print("═"*75)
```

---

## Module 3 — LINDDUN & Arbres d'Attaque (1h30)

### 🔍 Le Modèle LINDDUN pour la Confidentialité & Vie Privée

Complémentaire à STRIDE (axé sur la sécurité), le modèle **LINDDUN** se concentre sur les risques liés à la **vie privée et aux données personnelles (RGPD)** :

- **L**inkability (Lien entre données)
- **I**dentifiability (Identifiabilité de l'utilisateur)
- **N**on-repudiation (Non-répudiation des actions)
- **D**etectability (Détectabilité des échanges)
- **D**isclosure of information (Divulgation d'informations)
- **U**nawareness (Inconscience de l'utilisateur)
- **N**on-compliance (Non-conformité légale)

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **STRIDE** | Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation of Privilege |
| **DFD** | Data Flow Diagram — Diagramme de flux de données |
| **PASTA** | Process for Attack Simulation and Threat Analysis — Méthodologie d'analyse des menaces centrée risque |
| **LINDDUN** | Cadre de modélisation des menaces sur la vie privée et les données personnelles |

---

## Exercices Pratiques

### Exercice 1 — Association STRIDE

Pour chacun des cas suivants, associez la lettre correspondante du modèle STRIDE :
1. Un attaquant modifie le montant d'un virement dans le paquet réseau en transit.
2. Un utilisateur anonyme parvient à exécuter des commandes en tant qu'administrateur système `root`.
3. Un serveur Web tombe en panne suite à un envoi massif de requêtes illégitimes.

**Corrigé guidé :**
1. **Tampering (Altération)** — Atteinte à l'intégrité des données.
2. **Elevation of Privilege (Élévation de privilèges)** — Atteinte à l'autorisation.
3. **Denial of Service (Déni de service)** — Atteinte à la disponibilité.

---

## Banque QCM — 5 Questions

**Q1.** Que signifie la lettre **S** dans le modèle de menaces **STRIDE** ?

- A) Software.
- B) Spoofing (Usurpation d'identité). ✅
- C) System.
- D) Storage.

**Q2.** À quel moment du cycle de vie logiciel (SDLC) la modélisation des menaces (Threat Modeling) doit-elle idéalement être effectuée ?

- A) Après 5 ans de production.
- B) Le plus tôt possible, dès la phase de conception et d'architecture applicative. ✅
- C) Pendant l'audit comptable.
- D) Jamais.

**Q3.** Quelle menace STRIDE correspond à la fuite ou à la lecture non autorisée de données confidentielles ?

- A) Denial of Service.
- B) Information Disclosure (Divulgation d'informations). ✅
- C) Spoofing.
- D) Repudiation.

**Q4.** Quel est l'objectif principal du modèle **LINDDUN** par rapport à STRIDE ?

- A) Tester la vitesse du processeur.
- B) Modéliser spécifiquement les menaces pesant sur la vie privée (Privacy) et la protection des données personnelles. ✅
- C) Chiffrer les disques durs.
- D) Traduire du texte en espagnol.

**Q5.** Qu'est-ce qu'une **Trust Boundary (Frontière de Confiance)** dans un diagramme DFD ?

- A) Une ligne physique dessinée sur le sol du data center.
- B) Une limite virtuelle marquant un changement de niveau de confiance ou de privilèges entre deux composants (ex: entre Internet public et le réseau interne). ✅
- C) Un câble Ethernet de couleur rouge.
- D) Une règle de pare-feu DNS.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
