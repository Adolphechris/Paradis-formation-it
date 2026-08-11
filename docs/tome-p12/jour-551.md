# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 551 (6h) : Architecture d'Entreprise Numérique : TOGAF ADM, Zachman Framework & EA Governance

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser les fondements de l'**Architecture d'Entreprise (Enterprise Architecture - EA)** et son rôle dans l'alignement des systèmes d'information sur la stratégie business
> - Appliquer la méthode **TOGAF ADM (Architecture Development Method)** à travers ses 8 phases itératives (Phase A à H)
> - Structurer les artefacts d'architecture selon le **Zachman Framework** (6 perspectives × 6 questions)
> - Établir une **Gouvernance d'Architecture (EA Governance)** pérenne avec un Conseil d'Architecture (Architecture Review Board - ARB) et des principes d'architecture immuables
>
> **Compétences visées :** `ARCH-01` (A), `POL-01` (A) — Enterprise Architecture, TOGAF ADM, EA Governance

---

## Module 1 — Principes de l'Architecture d'Entreprise & TOGAF ADM (2h)

### 📖 Intuition & Narration

Une grande entreprise sans Architecture d'Entreprise ressemble à une ville construite sans plan d'urbanisme : chaque quartier (département) construit ses propres routes et bâtiments selon ses besoins immédiats, créant un enchevêtrement ingérable de réseaux incompatibles, de doublons coûteux et de zones vulnérables.

L'**Architecture d'Entreprise (EA)** est le plan d'urbanisme de l'organisation numérique. Elle établit une vision globale reliant la **Stratégie Métier (Business)**, les **Données (Data)**, les **Applications (Applications)** et l'**Infrastructure (Technology)** — les 4 domaines d'architecture BDAT.

### 🔍 Le Cycle TOGAF ADM (Architecture Development Method)

```
LE CYCLE DE DÉVELOPPEMENT TOGAF ADM (8 PHASES)

                    ┌─────────────────────────┐
                    │ PRELIMINAIRE : Cadre,   │
                    │ Principes & Outils EA   │
                    └────────────┬────────────┘
                                 │
                     ┌───────────▼───────────┐
                     │ PHASE A : Vision      │
                     │ d'Architecture        │
                     └───────────┬───────────┘
                                 │
    ┌────────────────────────────┼────────────────────────────┐
    │                            │                            │
┌───▼──────────────────┐ ┌───────▼──────────────┐ ┌────────────▼─────────┐
│ PHASE B :            │ │ PHASE C :            │ │ PHASE D :            │
│ Architecture Métier  │ │ Arch. Systèmes d'Info│ │ Architecture         │
│ (Business Arch.)     │ │ (Data & Application) │ │ Technique (Tech)     │
└───┬──────────────────┘ └───────┬──────────────┘ └────────────┬─────────┘
    │                            │                            │
    └────────────────────────────┼────────────────────────────┘
                                 │
                     ┌───────────▼───────────┐
                     │ PHASE E : Opportunités│
                     │ & Solutions           │
                     └───────────┬───────────┘
                                 │
                     ┌───────────▼───────────┐
                     │ PHASE F : Plan de     │
                     │ Migration             │
                     └───────────┬───────────┘
                                 │
                     ┌───────────▼───────────┐
                     │ PHASE G : Gouvernance │
                     │ de la Mise en Œuvre   │
                     └───────────┬───────────┘
                                 │
                     ┌───────────▼───────────┐
                     │ PHASE H : Gestion du  │
                     │ Changement            │
                     └───────────────────────┘
```

---

## Module 2 — Zachman Framework & Modélisation Archi (2h)

### 🔍 Le Framework Zachman

Le **Zachman Framework** est une grille d'interrogation à 36 cases (6 lignes × 6 colonnes) qui garantit la complétude de la description de l'entreprise :

| Perspective / Question | WHAT (Données) | HOW (Fonctions) | WHERE (Réseau) | WHO (Personnes) | WHEN (Temps) | WHY (Motivation) |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Planner (Scope)** | Liste des actifs | Liste des processus | Liste des sites | Org chart | Calendrier | Objectifs biz |
| **Owner (Business)** | Modèle sémantique | Diagramme BPMN | Réseau d'entreprise | Rôles & RACI | Planning projets | Business Plan |
| **Architect (System)** | Modèle Conceptuel | Diagramme Composants | Arch. Applicative | Groupes d'accès | Diagrammes d'états | Règles de gestion |
| **Designer (Tech)** | Modèle Logique DB | Diagramme de classes | Topologie réseau | Comptes & Rôles | Séquences UML | Exigences Sec/Perf |
| **Builder (Detail)** | Schema SQL / DDL | Code source | Subnets IP | Identités IAM | Triggers & Crons | SLA / SLO |
| **Functioning (Ops)** | Données réelles | Services actifs | Trafic réseau | Utilisateurs | Logs d'exécution | KPIs métier |

---

## Module 3 — Conseil d'Architecture (ARB) & Code (1h30)

### 🛠️ Script Python : Enterprise Architecture Compliance & Tech Radar Evaluator

```python
#!/usr/bin/env python3
"""
PARADIS — Enterprise Architecture Compliance Evaluator (ARB Tool)
Évalue la conformité des propositions d'architecture par rapport au Tech Radar
et aux principes d'architecture de l'entreprise.
"""
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class ArchitecturePrinciple:
    id: str
    name: str
    statement: str
    rationale: str
    implications: str

@dataclass
class TechRadarEntry:
    technology: str
    ring: str           # ADOPT | TRIAL | ASSESS | HOLD
    category: str       # LANGUAGES | INFRASTRUCTURE | DATABASES | SECURITY

class EnterpriseArchitectureBoard:
    def __init__(self, company_name: str):
        self.company_name = company_name
        self.principles: List[ArchitecturePrinciple] = [
            ArchitecturePrinciple(
                "AP-01", "Cloud-First & API-First",
                "Toute nouvelle solution doit être conçue nativement pour le Cloud et exposer des APIs REST/gRPC documentées.",
                "Maximise la scalabilité, réduit le TCO et facilite l'intégration entre systèmes.",
                "Interdiction des architectures monolithiques couplées en base de données directe."
            ),
            ArchitecturePrinciple(
                "AP-02", "Donnée Unique & Single Source of Truth",
                "Chaque domaine de données métier doit posséder un unique système maître responsable de son intégrité.",
                "Évite la duplication et l'incohérence des données client/financières.",
                "Les autres applications doivent consommer la donnée via API ou Data Mesh, pas de réplication SQL manuelle."
            ),
            ArchitecturePrinciple(
                "AP-03", "Security by Design & Zero Trust",
                "Le chiffrement (TLS/AES), l'authentification forte (OAuth2/OIDC) et la moindre isolation sont obligatoires par défaut.",
                "Protège les actifs critiques contre les intrusions internes et externes.",
                "Aucun flux en clair autorisé, validation automatique SAST/SCA dans les pipelines CI/CD."
            ),
        ]

        self.tech_radar: Dict[str, str] = {
            "Python": "ADOPT",
            "Go": "ADOPT",
            "PostgreSQL": "ADOPT",
            "Kubernetes": "ADOPT",
            "Kafka": "ADOPT",
            "PHP": "HOLD",
            "Oracle DB": "HOLD",
            "MongoDB": "ASSESS",
            "Rust": "TRIAL",
        }

    def evaluate_proposal(self, project_name: str, tech_stack: List[str], respects_principles: List[str]) -> bool:
        print("=" * 70)
        print(f"  CONSEIL D'ARCHITECTURE (ARB) — ÉVALUATION : {project_name}")
        print("=" * 70)
        print()

        violations = []
        for tech in tech_stack:
            ring = self.tech_radar.get(tech, "UNKNOWN")
            if ring == "HOLD":
                violations.append(f"Technologie rejetée (HOLD) : '{tech}' — Migration requise vers une alternative 'ADOPT'.")
            elif ring == "UNKNOWN":
                violations.append(f"Technologie non référencée : '{tech}' — Requiert un dossier de dérogation ARB.")

        print("  📋 VÉRIFICATION DE LA STACK TECHNIQUE :")
        for tech in tech_stack:
            ring = self.tech_radar.get(tech, "UNKNOWN")
            icon = "✅" if ring in ["ADOPT", "TRIAL"] else ("⚠️" if ring == "ASSESS" else "❌")
            print(f"    {icon} {tech:<15} → Statut Radar : {ring}")
        print()

        print("  📜 PRINCIPLES D'ARCHITECTURE :")
        for p in self.principles:
            status = "✅ RESPECTÉ" if p.id in respects_principles else "❌ NON RESPECTÉ"
            print(f"    • [{p.id}] {p.name:<30} → {status}")
            if p.id not in respects_principles:
                violations.append(f"Principe violé [{p.id}] : {p.name}")
        print()

        print("─" * 70)
        if not violations:
            print(f"  [✅ APPROUVÉ] Le projet '{project_name}' est conforme aux standards EA.")
            return True
        else:
            print(f"  [❌ REFUSÉ / RÉVISION REQUISE] {len(violations)} non-conformité(s) détectée(s) :")
            for v in violations:
                print(f"    • {v}")
            return False


if __name__ == "__main__":
    arb = EnterpriseArchitectureBoard("PARADIS GLOBAL S.A.")

    # Proposition 1 : Conforme
    arb.evaluate_proposal(
        project_name="Nouveau Service de Paiement Core",
        tech_stack=["Go", "PostgreSQL", "Kafka", "Kubernetes"],
        respects_principles=["AP-01", "AP-02", "AP-03"]
    )

    print("\n" + "═"*70 + "\n")

    # Proposition 2 : Non conforme (Utilise PHP/Oracle DB et ne respecte pas AP-02)
    arb.evaluate_proposal(
        project_name="Système CRM Legacy Migré",
        tech_stack=["PHP", "Oracle DB", "Python"],
        respects_principles=["AP-01", "AP-03"]
    )
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **TOGAF** | The Open Group Architecture Framework — Référentiel mondial d'architecture d'entreprise |
| **ADM** | Architecture Development Method — Méthode itérative en 8 phases au cœur de TOGAF |
| **ARB** | Architecture Review Board — Conseil d'architecture d'entreprise validant la conformité des projets |
| **EA** | Enterprise Architecture — Architecture d'entreprise alignant SI et business |
| **BDAT** | Business, Data, Application, Technology — Les 4 domaines d'architecture de TOGAF |

---

## Exercices Pratiques

### Exercice 1 — Mapping des Phases TOGAF ADM

Pour chacun des livrables suivants, identifiez la phase TOGAF ADM correspondante (Phase A à H) :
1. Rédaction de la Charte d'Architecture et validation du sponsor exécutif.
2. Élaboration du Modèle Logique de Données et du catalogue d'APIs applicatives.
3. Définition du plan de migration par vagues de déploiement et calcul de la valeur métier.
4. Mise en place de l'instance d'audit de conformité pendant la phase de développement.

**Corrigé guidé :**
1. **Phase A (Architecture Vision)** — Définition de la vision et approbation du sponsor.
2. **Phase C (Information Systems Architectures)** — Inclut Data Architecture et Application Architecture.
3. **Phase F (Migration Planning)** — Priorisation des projets et plan de transition.
4. **Phase G (Implementation Governance)** — Surveillance de la conformité du build avec l'architecture cible.

---

## Banque QCM — 5 Questions

**Q1.** Les 4 domaines d'architecture couverts par **TOGAF ADM** sont désignés par l'acronyme **BDAT**. Que signifie cet acronyme ?

- A) Build, Deploy, Automate, Test
- B) Business, Data, Application, Technology ✅
- C) Backup, Disaster, Audit, Telemetry
- D) Bandwidth, Database, API, Topology

**Q2.** Quelle est la fonction principale du **Conseil d'Architecture (Architecture Review Board - ARB)** dans une entreprise ?

- A) Écrire le code source de toutes les applications.
- B) Évaluer la conformité des projets informatiques par rapport aux principes d'architecture et au Tech Radar de l'entreprise, et accorder les dérogations. ✅
- C) Acheter les serveurs physiques.
- D) Réparer les pannes réseau.

**Q3.** Dans le **Zachman Framework**, la perspective du **Designer (System Architect)** correspond à la ligne :

- A) Planner (Scope)
- B) Owner (Business)
- C) Architect / Designer (System Architecture) ✅
- D) Builder (Technology)

**Q4.** Dans le Tech Radar d'entreprise, que signifie le statut **HOLD** attribué à une technologie ?

- A) La technologie est hautement recommandée pour tous les nouveaux projets.
- B) La technologie ne doit plus être utilisée pour les nouveaux projets ; une trajectoire d'extinction/remplacement doit être planifiée. ✅
- C) La technologie est en cours d'évaluation par l'équipe R&D.
- D) La technologie est réservée aux projets personnels.

**Q5.** Dans le cycle **TOGAF ADM**, quelle phase est responsable de la définition de la feuille de route de transition (Transition Architectures) et du plan de migration ?

- A) Phase A (Architecture Vision)
- B) Phase B (Business Architecture)
- C) Phase F (Migration Planning) ✅
- D) Phase H (Architecture Change Management)

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
