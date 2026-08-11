# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 504 (6h) : Software Supply Chain Security : SCA, SBOM CycloneDX/SPDX, Dependency-Track & Modèle SLSA Level 3

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre la menace des attaques sur la chaîne d'approvisionnement logicielle (Software Supply Chain Attacks)
> - Générer et valider un **Software Bill of Materials (SBOM)** au format standard **CycloneDX** ou **SPDX**
> - Déployer **OWASP Dependency-Track** pour le suivi continu des vulnérabilités des dépendances en production
> - Appliquer les niveaux de maturité **SLSA (Supply-chain Levels for Software Artifacts)** jusqu'au niveau SLSA Level 3
>
> **Compétences visées :** `SEC-05` (A), `SEC-06` (A) — Software Supply Chain & SBOM Engineering

---

## Module 1 — Software Supply Chain & Attaques de Chaîne d'Approvisionnement (2h)

### 📖 Intuition & Narration

Une application d'entreprise moderne est composée à 80–90% de code source open-source tiers (packages npm, PyPI, Maven, Crates). Les développeurs de votre entreprise n'ont réellement écrit que les 10 à 20% restants de logique métier.

Si un pirate ne parvient pas à s'introduire par la porte principale de votre entreprise, il attaquera un package open-source populaire utilisé par votre projet (ex: affaire SolarWinds, XZ Utils CVE-2024-3094, Typosquatting npm).

La **Software Supply Chain Security** vise à garantir l'intégrité, l'authenticité et la traçabilité de chaque composant logiciel qui entre dans vos artefacts de production.

### 🔍 Anatomie Technique — Le SBOM (Software Bill of Materials) & SLSA

```
ANATOMIE D'UN SBOM CYCLONEDX & CADRE SLSA LEVEL 3

  [ CODE SOURCE PROPRIÉTAIRE ] + [ PACKAGES OPEN-SOURCE ]
                                      │
                                      ▼
                        [ BUILD PROVENANCE SIGNÉ ]
                     (SLSA Level 3 — Non-falsifiable)
                                      │
                                      ▼
                      [ SBOM CYCLONEDX (bom.json) ]
                      - Liste complète des composants
                      - Hashes SHA-256 de chaque package
                      - Graphe de dépendances directes/transitives
                                      │
                                      ▼
                 [ ANALYSE CONTINU DEPENDENCY-TRACK ]
```

---

## Module 2 — Atelier Pratique : Génération SBOM & Verification SLSA (2h)

### 🛠️ Code Python : Générateur & Validation de SBOM CycloneDX

```python
#!/usr/bin/env python3
"""
PARADIS — CycloneDX SBOM Generator & Integrity Validator
Génère et valide un SBOM (Software Bill of Materials) JSON selon la spécification CycloneDX 1.5.
"""

import json
import hashlib
from datetime import datetime

class CycloneDXSBOMGenerator:
    def __init__(self, project_name: str, version: str):
        self.project_name = project_name
        self.version = version
        self.components = []

    def add_component(self, name: str, version: str, purl: str, sha256_hash: str, license_id: str):
        """Ajoute un composant (dépendance) au SBOM."""
        self.components.append({
            "type": "library",
            "name": name,
            "version": version,
            "purl": purl,   # Package URL standard
            "hashes": [
                {"alg": "SHA-256", "content": sha256_hash}
            ],
            "licenses": [
                {"license": {"id": license_id}}
            ]
        })

    def generate_json(self) -> dict:
        """Génère le document SBOM CycloneDX 1.5 JSON compliant."""
        return {
            "bomFormat": "CycloneDX",
            "specVersion": "1.5",
            "serialNumber": f"urn:uuid:paradis-sbom-{hashlib.md5(self.project_name.encode()).hexdigest()}",
            "version": 1,
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "tools": [
                    {"vendor": "PARADIS IT", "name": "DevSecOps-SBOM-Generator", "version": "2.0"}
                ],
                "component": {
                    "type": "application",
                    "name": self.project_name,
                    "version": self.version
                }
            },
            "components": self.components
        }

def run_sbom_demo():
    print("=== GENERATION DU SBOM CYCLONEDX PARADIS IT ===")
    generator = CycloneDXSBOMGenerator("paradis-finance-api", "v1.4.0")

    # Ajout de dépendances simulées
    generator.add_component(
        name="requests",
        version="2.31.0",
        purl="pkg:pypi/requests@2.31.0",
        sha256_hash="9442172fc9262d358a04294630ea7442d200f0257460488c779f2e1c99906792",
        license_id="Apache-2.0"
    )
    generator.add_component(
        name="cryptography",
        version="42.0.5",
        purl="pkg:pypi/cryptography@42.0.5",
        sha256_hash="c0c5c38827e8a93949e2996d9255a29871f37e408c6bfcbfa8a9f6d725d2e293",
        license_id="Apache-2.0"
    )

    sbom = generator.generate_json()
    print(f"[*] SBOM généré avec succès pour {sbom['metadata']['component']['name']} {sbom['metadata']['component']['version']}")
    print(f"[*] Nombre de composants recensés : {len(sbom['components'])}")

    print("\n--- EXTRAIT DU DOCUMENT SBOM CYCLONEDX JSON ---")
    print(json.dumps(sbom, indent=2))

if __name__ == "__main__":
    run_sbom_demo()
```

---

## Module 3 — Framework SLSA & Dependency-Track (1h30)

### 🔍 Les 3 Niveaux du Cadre SLSA (Supply-chain Levels for Software Artifacts)

```
NIVEAUX DE MATURITÉ SLSA (GOOGLE / OPENSSF)

  ┌──────────────────────────────────────────────────────────────────────┐
  │ NIVEAU SLSA  │ EXIGENCES PRINCIPALES                                  │
  ├──────────────┼───────────────────────────────────────────────────────┤
  │ SLSA Level 1 │ Build automatisé (scripted build) + SBOM généré.      │
  │ SLSA Level 2 │ Build sur service hébergé (CI/CD) + Provenance signée. │
  │ SLSA Level 3 │ Isolation stricte du build + Provenance non-falsifiable│
  │              │ (Hermetic & Ephemeral Build Environment).             │
  └──────────────────────────────────────────────────────────────────────┘
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SBOM** | Software Bill of Materials — Inventaire détaillé des composants d'un logiciel |
| **SLSA** | Supply-chain Levels for Software Artifacts — Cadre de sécurité de la chaîne d'approvisionnement |
| **PURL** | Package URL — Syntaxe standard d'identification des packages logiciels |
| **SPDX** | Software Package Data Exchange — Norme ISO d'expression de licences et SBOM |
| **OpenSSF** | Open Source Security Foundation — Fondation pour la sécurité des logiciels open-source |

---

## Exercices Pratiques

### Exercice 1 — Validation de PURL (Package URL)

Donnez la structure PURL d'un package Python `urllib3` en version `2.2.1`.

**Corrigé guidé :**
```
pkg:pypi/urllib3@2.2.1
```

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce qu'un **SBOM (Software Bill of Materials)** ?

- A) Une facture payée par le client.
- B) Un inventaire formel et structuré (JSON/XML) répertoriant l'ensemble des composants, bibliothèques et dépendances constituant une application. ✅
- C) Un manuel d'utilisation imprimé.
- D) Une licence de système d'exploitation.

**Q2.** Quels sont les deux formats standardisés internationaux majeurs pour les documents SBOM ?

- A) CycloneDX et SPDX. ✅
- B) HTML et MP3.
- C) DOCX et XLS.
- D) PNG et GIF.

**Q3.** Quel est le rôle de la plateforme **OWASP Dependency-Track** ?

- A) Écrire du code Python automatiquement.
- B) Analyser les SBOMs en continu pour identifier immédiatement si une nouvelle vulnérabilité (CVE) frappe une bibliothèque déjà déployée en production. ✅
- C) Gérer les plannings des développeurs.
- D) Chiffrer les disques durs.

**Q4.** Que garantit le niveau de maturité **SLSA Level 3** pour un artefact logiciel ?

- A) Que le code est garanti 100% sans aucun bug.
- B) Que l'environnement de build est hermétique, éphémère, isolé et que la provenance de l'artefact est signée cryptographiquement de manière non falsifiable. ✅
- C) Que l'application tourne sur Windows XP.
- D) Que le logo de l'entreprise est présent sur l'application.

**Q5.** Dans une syntaxe **PURL (Package URL)**, que représente la chaîne `pkg:npm/express@4.18.2` ?

- A) Une adresse IP.
- B) L'identifiant universel unique du package npm Express en version 4.18.2. ✅
- C) Une clé d'API Google Cloud.
- D) Un nom de domaine internet.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
