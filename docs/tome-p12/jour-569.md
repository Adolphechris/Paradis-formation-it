# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 569 (6h) : Open Source Strategy & Community Building : InnerSource & Gouvernance des Licences OSS

> [!NOTE]
> **Objectifs pédagogiques :**
> - Définir la **Stratégie Open Source** d'une entreprise (Contribution, Publication, OSPO - Open Source Program Office)
> - Implémenter le modèle **InnerSource** : appliquer les pratiques de collaboration de l'open-source (Fork, PR, Code Review, CI/CD transparent) à l'intérieur du code propriétaire de l'entreprise
> - Maîtriser les **licences logicielles open-source** : Permissives (MIT, Apache 2.0, BSD) vs Copyleft (GPLv3, AGPLv3) vs Licences de Protection Source (BUSL, SSPL)
> - Mettre en place un outil automatisé de **Conformité des Licences (License Compliance)** pour prévenir les risques juridiques
>
> **Compétences visées :** `POL-01` (A), `DEV-02` (A) — Open Source Strategy, InnerSource & OSS Governance

---

## Module 1 — Stratégie Open Source & InnerSource (2h)

### 📖 Intuition & Narration

Aucune entreprise moderne n'écrit 100% de son code à partir de zéro. 80% à 90% des lignes de code d'une application moderne proviennent de dépendances Open-Source (noyau Linux, Kubernetes, PostgreSQL, React, Spring).

Pourtant, dans beaucoup d'organisations, les équipes fonctionnent en silos hermétiques : l'équipe A ne peut pas contribuer au code de l'équipe B sans ouvrir un ticket jira et attendre 3 mois.

Le modèle **InnerSource** consiste à **transposer les meilleures pratiques de la culture open-source au sein des dépôts privés de l'entreprise** : tout le code interne est visible par tous les développeurs de l'entreprise, n'importe qui peut proposer une Pull Request, et les équipes propriétaires jouent le rôle de mainteneurs ("Maintainers").

### 🔍 Modèle d'Organisation InnerSource

```
ORGANISATION INNERSOURCE vs SILOS TRADITIONNELS

  MODÈLE EN SILOS (Bloquant)
  ┌──────────────┐   Ticket Jira (Attente 3 mois)   ┌──────────────┐
  │  Équipe A    │─────────────────────────────────→│  Équipe B    │
  └──────────────┘                                  └──────────────┘

  MODÈLE INNERSOURCE (Fluide & Collaboratif)
  ┌──────────────┐   1. Fork / Clone dépôt B        ┌──────────────┐
  │  Équipe A    │─── 2. Propose Pull Request ────→│  Équipe B    │
  │ (Contributor)│←── 3. Code Review & Merge ──────│ (Maintainer) │
  └──────────────┘                                  └──────────────┘
```

---

## Module 2 — Typologie des Licences Logicielles & Risques Juridiques (2h)

### 🔍 Les 3 Grandes Familles de Licences OSS

```
MATRICE DES LICENCES LOGICIELLES OPEN-SOURCE

  FAMILLE             │ LICENCES             │ CONTRAINTE MAJEURE
  ────────────────────┼──────────────────────┼─────────────────────────────────────────────
  PERMISSIVES         │ MIT, Apache 2.0,     │ Réutilisation libre dans des projets
                      │ BSD-3-Clause         │ commerciaux. Seule la mention du copyright
                      │                      │ original est requise.
  ────────────────────┼──────────────────────┼─────────────────────────────────────────────
  COPYLEFT FAIBLE     │ LGPLv3, MPL 2.0      │ Le composant modifié doit rester open-source,
                      │                      │ mais peut être lié à du code propriétaire.
  ────────────────────┼──────────────────────┼─────────────────────────────────────────────
  COPYLEFT FORT       │ GPLv2, GPLv3         │ "Effet viral" : tout logiciel intégrant du
                      │                      │ code GPL doit être distribué sous GPL !
  ────────────────────┼──────────────────────┼─────────────────────────────────────────────
  COPYLEFT RÉSEAU     │ AGPLv3 (Affero GPL)  │ L'effet viral s'applique même si le logiciel
                      │                      │ est servi uniquement via le réseau (SaaS).
  ────────────────────┼──────────────────────┼─────────────────────────────────────────────
  FAIR-SOURCE / BUSL  │ BUSL 1.1, SSPL       │ Code visible mais utilisation commerciale
                      │                      │ SaaS restreinte (ex: HashiCorp, Redis, MongoDB).
```

---

## Module 3 — Scanner de Conformité des Licences (1h30)

### 🛠️ Script Python : Automated License Compliance Auditor

```python
#!/usr/bin/env python3
"""
PARADIS — Open Source License Compliance Auditor
Scanne les dépendances d'un projet et détecte les risques de licences virales (GPL/AGPL).
"""
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class DependencyLicense:
    name: str
    version: str
    license_type: str  # MIT | Apache-2.0 | BSD-3-Clause | GPL-3.0 | AGPL-3.0 | BUSL-1.1

class LicenseComplianceAuditor:
    # Catégorisation des risques juridiques pour du code propriétaire commercial
    POLICY = {
        "ALLOWED": {"MIT", "Apache-2.0", "BSD-3-Clause", "BSD-2-Clause", "ISC"},
        "NEEDS_REVIEW": {"LGPL-3.0", "MPL-2.0", "BUSL-1.1"},
        "FORBIDDEN": {"GPL-2.0", "GPL-3.0", "AGPL-3.0", "SSPL-1.0"}
    }

    def __init__(self, project_name: str):
        self.project_name = project_name

    def audit(self, dependencies: List[DependencyLicense]):
        print("=" * 70)
        print(f"  PARADIS LICENSE COMPLIANCE AUDITOR — PROJET : {self.project_name}")
        print("=" * 70)
        print()

        violations = []
        reviews = []
        allowed_count = 0

        for dep in dependencies:
            lic = dep.license_type
            if lic in self.POLICY["FORBIDDEN"]:
                violations.append(dep)
                icon = "🚨 FORBIDDEN (VIRAL)"
            elif lic in self.POLICY["NEEDS_REVIEW"]:
                reviews.append(dep)
                icon = "🟠 NEEDS REVIEW"
            else:
                allowed_count += 1
                icon = "✅ ALLOWED"

            print(f"  {icon:<22} | {dep.name:<25} v{dep.version:<8} | Lic: {dep.license_type}")

        print("\n" + "─" * 70)
        print(f"  RÉSUMÉ : Conformes={allowed_count} | À réviser={len(reviews)} | Violations={len(violations)}")

        if violations:
            print(f"\n  [❌ RISQUE JURIDIQUE CRITIQUE] {len(violations)} licence(s) virale(s) interdite(s) détectée(s) !")
            for v in violations:
                print(f"    • {v.name} ({v.license_type}) → Risque de contamination copyleft sur l'application !")
        else:
            print(f"\n  [✅ CONFORME] Aucune licence virale n'a été détectée dans le build.")
        print("=" * 70)


if __name__ == "__main__":
    sample_dependencies = [
        DependencyLicense("requests", "2.31.0", "Apache-2.0"),
        DependencyLicense("flask", "3.0.0", "BSD-3-Clause"),
        DependencyLicense("pytest", "7.4.0", "MIT"),
        DependencyLicense("gpl-library-foo", "1.2.0", "GPL-3.0"),   # Violation interdite !
        DependencyLicense("agpl-database-bar", "4.0.1", "AGPL-3.0"), # Violation interdite !
    ]

    auditor = LicenseComplianceAuditor("PARADIS Core Platform")
    auditor.audit(sample_dependencies)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OSPO** | Open Source Program Office — Département d'entreprise gérant la stratégie et la conformité open-source |
| **InnerSource** | Pratique transposant les méthodes de développement de l'open-source au sein de l'entreprise |
| **Copyleft** | Clause légale imposant que toute œuvre dérivée conserve la même licence open-source |
| **AGPL** | Affero General Public License — Licence copyleft fermant l'échappatoire du SaaS |
| **BUSL** | Business Source License — Licence "Fair-Source" restreignant l'utilisation commerciale SaaS concurente |

---

## Exercices Pratiques

### Exercice 1 — Choix de Licence Open-Source

Une entreprise souhaite publier un composant logiciel en Open-Source. Elle hésite entre la licence **MIT** et la licence **AGPLv3**.

1. Quel sera l'effet si elle choisit la licence **MIT** ?
2. Quel sera l'effet si elle choisit la licence **AGPLv3** ?
3. Quelle licence doit-elle choisir si son objectif est d'empêcher un géant du Cloud de vendre son composant sous forme de service managé sans contribuer en retour ?

**Corrigé guidé :**
1. **Licence MIT** : N'importe qui (y compris un concurrent ou un cloud provider) pourra réutiliser, modifier et vendre le code dans un logiciel propriétaire sans aucune obligation de publier ses modifications.
2. **Licence AGPLv3** : Toute personne ou entreprise qui modifie le code et le sert via un service réseau (SaaS) **doit obligatoirement publier le code source complet de son application sous licence AGPLv3**.
3. **Choix recommandé** : **AGPLv3** (ou licence BUSL 1.1) si le but est d'empêcher la revente SaaS non contributive par des tiers.

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce que le modèle **InnerSource** ?

- A) Vendre des logiciels internes sur internet.
- B) L'application des pratiques de collaboration open-source (transparence du code, Pull Requests, revues de code, rôles de mainteneurs) au sein des dépôts de code privés d'une entreprise. ✅
- C) Interdire l'utilisation d'outils open-source.
- D) Déplacer le code sur des serveurs externes.

**Q2.** Quelle est la caractéristique principale d'une licence open-source **Permissive (ex: MIT, Apache 2.0)** ?

- A) Elle oblige à rendre tout le code du projet open-source.
- B) Elle permet de réutiliser et d'intégrer librement le code dans des projets commerciaux propriétaires sans contamination juridique. ✅
- C) Elle est interdite aux entreprises.
- D) Elle expire au bout de 5 ans.

**Q3.** Quel est l'effet d'une licence **Copyleft fort (ex: GPLv3)** sur un logiciel propriétaire commercial qui intègre ce composant ?

- A) Aucun effet.
- B) "L'effet viral" : l'ensemble du logiciel propriétaire qui intègre ou se lie au composant GPL doit lui-même être distribué sous licence GPLv3 s'il est redistribué. ✅
- C) Le logiciel devient plus rapide.
- D) L'entreprise reçoit une subvention de la Free Software Foundation.

**Q4.** Pourquoi la licence **AGPLv3 (Affero GPL)** a-t-elle été créée par rapport à la licence GPLv3 classique ?

- A) Pour fermer la "faillite SaaS" : AGPLv3 étend l'obligation de publication du code source aux applications fournies uniquement à travers le réseau (SaaS), ce que la GPL classique ne couvrait pas. ✅
- B) Pour interdire l'utilisation de Linux.
- C) Pour autoriser la vente de clés d'activation.
- D) Pour remplacer la licence MIT.

**Q5.** Quel est le rôle d'un **OSPO (Open Source Program Office)** dans une grande entreprise ?

- A) Formater les disques durs des développeurs.
- B) Définir et superviser la stratégie open-source de l'entreprise, gérer la conformité des licences, encourager l'InnerSource et encadrer les contributions externes. ✅
- C) Vendre des ordinateurs.
- D) Gérer les abonnements téléphoniques.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
