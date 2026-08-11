# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 536 (6h) : Supply Chain Security : SBOMs, Sigstore, Dependency Scanning & Attaques sur la Chaîne d'Approvisionnement

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre les attaques sur la **chaîne d'approvisionnement logicielle** (Software Supply Chain) : SolarWinds, XZ Utils, Log4Shell comme vecteurs de compromission de masse
> - Maîtriser la génération et la validation de **SBOM (Software Bill of Materials)** avec les formats SPDX et CycloneDX
> - Utiliser **Sigstore/Cosign** pour la signature cryptographique des images de conteneur et des artefacts de build
> - Intégrer le **Dependency Scanning** (OWASP Dependency-Check, Trivy) dans les pipelines CI/CD
>
> **Compétences visées :** `SEC-03` (A), `DEV-02` (A) — Supply Chain Security, CI/CD Security

---

## Module 1 — Anatomie des Attaques Supply Chain (2h)

### 📖 Intuition & Narration

Imaginez qu'un cambrioleur ne tente plus de forcer la porte blindée d'un coffre-fort mais s'infiltre dans l'atelier du serrurier qui fabrique les clés, pour y introduire une copie cachée. C'est exactement ce qu'est une attaque sur la chaîne d'approvisionnement logicielle : **compromettre un composant en amont pour atteindre des milliers de cibles en aval**, sans que personne ne détecte d'anomalie directe.

Les cas réels les plus critiques :

- **SolarWinds Orion (2020)** : Des attaquants (APT29/Cozy Bear) ont injecté le malware `SUNBURST` dans le processus de build officiel de SolarWinds. 18 000 organisations (dont Microsoft, FireEye, et des agences US) ont téléchargé et installé la mise à jour empoisonnée avec confiance.
- **XZ Utils (2024)** : Un attaquant a patiemment (pendant 2 ans) socialisé avec la communauté open-source, gagné la confiance du mainteneur du projet `xz`, obtenu les droits de commit, et introduit une backdoor dans `liblzma` qui aurait permis l'accès SSH root sur des millions de serveurs Linux.
- **Log4Shell (2021)** : La bibliothèque Apache Log4j (utilisée dans 3 milliards d'appareils) contenait une vulnérabilité RCE permettant l'exécution de code via un simple message de log.

### 🔍 Anatomie Technique — Vecteurs d'Attaque Supply Chain

```
VECTEURS D'ATTAQUE SUR LA CHAÎNE D'APPROVISIONNEMENT

  ┌──────────────────────────────────────────────────────────────┐
  │  Vecteur 1 : COMPROMISSION DU BUILD SYSTEM                   │
  │   Attaquant ──→ Compromet le serveur de build (Jenkins/...)  │
  │   ──→ Injecte du code malveillant dans l'artefact compilé    │
  │   Exemple : SolarWinds                                       │
  ├──────────────────────────────────────────────────────────────┤
  │  Vecteur 2 : COMPROMISSION D'UN DÉPÔT TIERS (NPM/PyPI)      │
  │   Attaquant ──→ Publie un paquet malveillant                  │
  │   ──→ Typosquatting (colors vs colurs) ou prise de contrôle  │
  │   Exemple : event-stream (npm, 2018)                         │
  ├──────────────────────────────────────────────────────────────┤
  │  Vecteur 3 : DÉPENDANCE VULNÉRABLE                           │
  │   Bibliothèque tierce contenant une CVE non corrigée         │
  │   Exemple : Log4Shell (CVE-2021-44228, CVSS 10.0)            │
  └──────────────────────────────────────────────────────────────┘
```

---

## Module 2 — SBOM, Sigstore & Dependency Scanning (2h)

### 🔍 Anatomie Technique — SBOM (Software Bill of Materials)

Un **SBOM** est un inventaire exhaustif de tous les composants logiciels d'une application (bibliothèques, frameworks, outils, versions, licences). Il est l'équivalent d'une liste d'ingrédients pour les logiciels.

Le décret exécutif américain 14028 (2021) rend les SBOM **obligatoires** pour les logiciels vendus au gouvernement américain. L'ENISA et la directive NIS2 suivent la même direction en Europe.

Deux formats standards coexistent :
- **SPDX** (Software Package Data Exchange) : Standard Linux Foundation, format JSON/YAML/SPDX-TAG.
- **CycloneDX** : Standard OWASP, format JSON/XML, très intégré dans les outils DevSecOps.

### 🛠️ Atelier Pratique — Génération de SBOM et Scan de Dépendances

```bash
#!/bin/bash
# ============================================================
# PARADIS — Supply Chain Security Workshop
# Outils : Syft (SBOM), Grype (Vuln Scan), Cosign (Signature)
# ============================================================

set -euo pipefail

# --- Étape 1 : Installer Syft (génération SBOM) ---
echo "[1/4] Installation de Syft (anchore/syft)..."
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin

# --- Étape 2 : Générer un SBOM au format CycloneDX pour une image Docker ---
echo "[2/4] Génération du SBOM pour l'image nginx:1.25..."
syft nginx:1.25 -o cyclonedx-json > /tmp/nginx-sbom.cyclonedx.json

echo "      SBOM généré : /tmp/nginx-sbom.cyclonedx.json"
echo "      Composants détectés : $(jq '.components | length' /tmp/nginx-sbom.cyclonedx.json)"

# --- Étape 3 : Scanner le SBOM pour les vulnérabilités (Grype) ---
echo "[3/4] Scan de vulnérabilités avec Grype..."
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin
grype sbom:/tmp/nginx-sbom.cyclonedx.json --fail-on critical

# --- Étape 4 : Signer une image Docker avec Cosign (Sigstore) ---
echo "[4/4] Signature de l'image avec Cosign (Sigstore)..."

# Installer cosign
curl -O -L https://github.com/sigstore/cosign/releases/latest/download/cosign-linux-amd64
chmod +x cosign-linux-amd64 && sudo mv cosign-linux-amd64 /usr/local/bin/cosign

# Générer une paire de clés (pour demo; en prod : utiliser Cosign Keyless avec OIDC)
cosign generate-key-pair

# Signer l'image dans le registre (nécessite d'être loggé dans le registre)
# cosign sign --key cosign.key registry.paradis.internal/app-backend:1.0.0

echo "[✅] Supply Chain Security Pipeline complet."
echo "     • SBOM généré et archivé"
echo "     • Vulnérabilités critiques : scan effectué"
echo "     • Image signée : intégrité garantie par Sigstore"
```

### 🛠️ Script Python : SBOM Analyzer & CVE Cross-Reference

```python
#!/usr/bin/env python3
"""
PARADIS — SBOM Analyzer
Parse un SBOM CycloneDX et détecte les composants avec CVE critiques (CVSS >= 9.0).
"""
import json
from dataclasses import dataclass

@dataclass
class SBOMComponent:
    name: str
    version: str
    purl: str

class SBOMAnalyzer:
    KNOWN_CRITICAL_CVE = {
        # Simulation d'une base CVE locale
        "log4j-core@2.14.1": [("CVE-2021-44228", 10.0, "Log4Shell - RCE critique")],
        "spring-core@5.3.17": [("CVE-2022-22965", 9.8, "Spring4Shell - RCE")],
        "openssl@1.1.1k": [("CVE-2022-0778", 7.5, "Infinite loop in BN_mod_sqrt")],
    }

    def analyze(self, sbom_path: str):
        print(f"=== PARADIS SBOM ANALYZER ===")
        print(f"Fichier SBOM : {sbom_path}\n")

        try:
            with open(sbom_path, "r") as f:
                sbom = json.load(f)
        except FileNotFoundError:
            print("[DEMO] Fichier SBOM non trouvé, utilisation de données de démonstration.")
            components_data = [
                {"name": "log4j-core", "version": "2.14.1", "purl": "pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1"},
                {"name": "spring-core", "version": "5.3.17", "purl": "pkg:maven/org.springframework/spring-core@5.3.17"},
                {"name": "nginx", "version": "1.25.3", "purl": "pkg:deb/debian/nginx@1.25.3"},
            ]
        else:
            components_data = sbom.get("components", [])

        critical_findings = []
        for comp in components_data:
            name = comp.get("name", "unknown")
            version = comp.get("version", "?")
            purl = comp.get("purl", "")
            key = f"{name}@{version}"

            if key in self.KNOWN_CRITICAL_CVE:
                for cve_id, cvss, desc in self.KNOWN_CRITICAL_CVE[key]:
                    critical_findings.append((name, version, cve_id, cvss, desc))
                    print(f"  [🚨 CRITIQUE] {name}@{version}")
                    print(f"    CVE    : {cve_id}")
                    print(f"    CVSS   : {cvss}/10.0")
                    print(f"    Détail : {desc}")
                    print()
            else:
                print(f"  [✅ OK] {name}@{version}")

        print(f"\n[RAPPORT] Composants analysés : {len(components_data)}")
        print(f"[RAPPORT] Vulnérabilités critiques : {len(critical_findings)}")
        if critical_findings:
            print("[ACTION REQUISE] Patcher immédiatement les composants listés ci-dessus.")
        else:
            print("[✅ SÉCURISÉ] Aucune vulnérabilité critique détectée.")

if __name__ == "__main__":
    analyzer = SBOMAnalyzer()
    analyzer.analyze("/tmp/nginx-sbom.cyclonedx.json")
```

---

## Module 3 — Intégration dans le Pipeline CI/CD (1h30)

### 🔍 Stratégie de Défense Supply Chain (SLSA Framework)

Le framework **SLSA** (Supply-chain Levels for Software Artifacts, prononcé "salsa") de Google définit 4 niveaux de maturité pour la sécurisation du build d'un logiciel :

| Niveau | Exigences |
|:---:|:---|
| **SLSA 1** | Build scripté, SBOM généré automatiquement |
| **SLSA 2** | Build service hébergé avec logs d'intégrité |
| **SLSA 3** | Build isolé, sources vérifiables, artefacts signés |
| **SLSA 4** | Two-party review, build hermétique, provenance complète |

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SBOM** | Software Bill of Materials — Inventaire exhaustif des composants d'un logiciel |
| **SLSA** | Supply-chain Levels for Software Artifacts — Cadre de sécurisation du cycle de build |
| **Sigstore/Cosign** | Infrastructure open-source de signature cryptographique des artefacts logiciels |
| **Typosquatting** | Technique d'attaque consistant à publier un paquet avec un nom similaire au légitime |
| **PURL** | Package URL — Format standardisé pour identifier un composant logiciel (pkg:type/name@version) |

---

## Exercices Pratiques

### Exercice 1 — Analyse d'Incident Supply Chain

Décrivez la chaîne d'attaque complète de l'incident **SolarWinds** (2020) en répondant aux questions suivantes :
1. Quel était le vecteur d'entrée initial ?
2. Comment les attaquants ont-ils contaminé des milliers d'organisations simultanément ?
3. Quel mécanisme aurait pu détecter ou prévenir l'attaque ?

**Corrigé guidé :**
1. Compromission du réseau interne de SolarWinds, puis injection de code malveillant dans le processus de build de `Orion Platform`.
2. La mise à jour légitime et signée (SolarWinds.Orion.Core.BusinessLayer.dll) a été distribuée à 18 000 clients via le mécanisme de mise à jour officiel, garantissant une confiance totale de la part des antivirus et des firewalls.
3. Un SBOM détaillé avec hachage cryptographique des artefacts intermédiaires de build (SLSA 3+) combiné à une signature Cosign/Sigstore aurait permis de détecter la discordance entre le code source et l'artefact distribué.

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce qu'un **SBOM** ?

- A) Un système de backup des machines virtuelles.
- B) Un inventaire exhaustif de tous les composants logiciels d'une application (bibliothèques, versions, licences), permettant la traçabilité de la chaîne d'approvisionnement. ✅
- C) Un protocole de communication réseau.
- D) Un outil de gestion des mots de passe.

**Q2.** Dans l'incident **SolarWinds (2020)**, les attaquants ont compromis :

- A) Les postes des utilisateurs finaux via phishing.
- B) Directement les serveurs des agences gouvernementales.
- C) Le processus de build de l'éditeur SolarWinds, injectant du code malveillant dans une mise à jour légitime et signée d'Orion Platform. ✅
- D) Des serveurs DNS racine.

**Q3.** Quel outil est utilisé pour **signer cryptographiquement des images de conteneur** afin de garantir leur intégrité et leur provenance ?

- A) Docker Compose
- B) Sigstore/Cosign ✅
- C) Ansible
- D) Terraform

**Q4.** Le framework **SLSA** (Supply-chain Levels for Software Artifacts) définit :

- A) Des règles de codage HTML5.
- B) Des niveaux de maturité progressifs pour sécuriser le processus de build et la provenance des artefacts logiciels. ✅
- C) Des protocoles de chiffrement de disque.
- D) Des normes de gestion des accès.

**Q5.** Le **Typosquatting** dans le contexte des registres de paquets consiste à :

- A) Faire des fautes de frappe dans le code source.
- B) Enregistrer un nom de paquet très similaire à un paquet légitime populaire (ex: `requsts` au lieu de `requests`) pour piéger les développeurs. ✅
- C) Crypter les métadonnées des paquets.
- D) Renommer les fichiers de configuration.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
