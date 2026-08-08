# TOME P7 — Certifications d'Élite & Spécialisations — Jour 339 (6h) : Supply Chain Security — SLSA Framework, Sigstore / Cosign Attestations, Dependency Confusion & SBOM Governance (Software Supply Chain Security)

> [!NOTE]
> **Objectif du jour :** Maîtriser la **sécurisation de la chaîne d'approvisionnement logicielle (Software Supply Chain Security)** : appliquer le framework **SLSA (Supply-chain Levels for Software Artifacts - Niveaux 1 à 4)**, générer et vérifier des **attestations de provenance (Provenance Attestations)** avec **Sigstore / Cosign / Rekor**, détecter et se préserver contre les attaques par **Dependency Confusion** et **Typosquatting** dans les registres publics (npm, PyPI, Cargo), et piloter la gouvernance **SBOM** avec audit continu des vulnérabilités.
>
> **Compétences visées :** `SUPPLY-01` (A) — SLSA Framework & Sigstore Provenance Attestations | `SUPPLY-02` (A) — Dependency Confusion Prevention & SBOM Governance

---

## 1) Module — Le Framework SLSA & Provenance Attestations (2h)

### 📖 Narration/Intuition

Les attaques contre la chaîne d'approvisionnement ciblent les composants entre le code source et le déploiement (ex. SolarWinds, Codecov). Le framework **SLSA (Supply-chain Levels for Software Artifacts)** définit des garanties vérifiables pour s'assurer qu'un binaire déploie exactement ce qui a été écrit dans le code source non altéré.

```
Source Code (GitHub) ──► Build Pipeline (GitHub Actions) ──► Artifact (Container / Package)
       │                         │                                  │
       ▼                         ▼                                  ▼
[ SLSA Level 1 ]        [ SLSA Level 2-3 ]                 [ SLSA Level 4 ]
 Build Automatisé        Provenance Signée                  Isolation du Build
                         par Service Inviolable             Double Validation Humaine
```

---

## 2) Module — Génération & Vérification d'Attestations Sigstore (`slsa_provenance_verifier.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import hashlib

class SLSAProvenanceVerifier:
    """
    Vérificateur d'attestations de provenance SLSA v1.0 et de signatures Sigstore.
    """

    @staticmethod
    def calculate_artifact_sha256(artifact_content: bytes) -> str:
        """Calcule le hash SHA-256 de l'artefact construit."""
        return hashlib.sha256(artifact_content).hexdigest()

    @staticmethod
    def verify_slsa_provenance(artifact_bytes: bytes, provenance_json_str: str) -> dict:
        """
        Vérifie la validité d'une attestation SLSA (in-toto statement).
        """
        computed_hash = SLSAProvenanceVerifier.calculate_artifact_sha256(artifact_bytes)
        
        try:
            provenance = json.loads(provenance_json_str)
        except json.JSONDecodeError:
            return {"status": "INVALID_JSON", "verified": False}

        # 1. Vérification du type In-Toto Statement
        if provenance.get("_type") != "https://in-toto.io/Statement/v0.1":
            return {"status": "INVALID_STATEMENT_TYPE", "verified": False}

        # 2. Vérification du Digest de l'artefact dans le sujet (Subject)
        subjects = provenance.get("subject", [])
        matched = False
        for subj in subjects:
            if subj.get("digest", {}).get("sha256") == computed_hash:
                matched = True
                break

        if not matched:
            return {
                "status": "HASH_MISMATCH",
                "verified": False,
                "expected_hash": computed_hash
            }

        # 3. Extraction du Build Type & Builder ID (SLSA Level 3 Compliance)
        predicate = provenance.get("predicate", {})
        builder_id = predicate.get("builder", {}).get("id")
        
        return {
            "status": "VERIFIED_SUCCESS",
            "verified": True,
            "artifact_sha256": computed_hash,
            "builder_id": builder_id,
            "slsa_level_compliant": "SLSA_LEVEL_3" if builder_id else "SLSA_LEVEL_1"
        }

# Démonstration
sample_artifact = b"PARADIS_SECURE_BINARY_V1.0"
artifact_hash = hashlib.sha256(sample_artifact).hexdigest()

mock_slsa_statement = json.dumps({
    "_type": "https://in-toto.io/Statement/v0.1",
    "subject": [{
        "name": "paradis-service-binary",
        "digest": {"sha256": artifact_hash}
    }],
    "predicateType": "https://slsa.dev/provenance/v0.2",
    "predicate": {
        "builder": {"id": "https://github.com/slsa-framework/slsa-github-generator"}
    }
})

print("=== SLSA PROVENANCE VERIFIER ===")
res = SLSAProvenanceVerifier.verify_slsa_provenance(sample_artifact, mock_slsa_statement)
print(json.dumps(res, indent=2))
```

---

## 3) Module — Prevention de la Dependency Confusion (2h)

```markdown
# PROTECTION CONTRE LA DEPENDENCY CONFUSION (npm / PyPI)

## 1. Définition de l'Attaque
Une attaque par **Dependency Confusion** se produit lorsqu'une application interne télécharge un package malveillant depuis un registre public (ex. PyPI / npm) portant le MÊME NOM qu'un package privé interne, parce que le registre public a une version plus récente (ex. v99.0.0).

## 2. Stratégies de Protection
1. **Scoping des Packages (NPM Scopes) :**
   Utiliser des packages scopés avec le nom de l'organisation : `@paradis-bank/core-auth`.
2. **Virtual Repositories / Package Managers Privés (JFrog Artifactory / AWS CodeArtifact) :**
   Configurer le gestionnaire de paquets pour interroger EXCLUSIVEMENT le registre interne pour les namespaces de l'entreprise.
3. **Fichiers Lock stricts (npm-shrinkwrap.json / poetry.lock) :**
   Figer les hashes SHA-512 de chaque dépendance.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SLSA** | Supply-chain Levels for Software Artifacts — Framework de sécurité de la chaîne d'approvisionnement de la Linux Foundation/Google |
| **Rekor** | Registre d'audit immuable et transparent (Transparency Log) du projet Sigstore |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans le framework **SLSA**, que garantit une **Attestation de Provenance** signée ?
- A) Elle apporte la preuve cryptographique et incertifiable de la source du code, de l'identité du builder et des étapes de construction de l'artefact
- B) Elle garantit l'absence totale de bugs
- C) Elle accélère la vitesse de téléchargement
- D) Elle remplace la licence open-source

**Réponse : A**

**Q2 :** Comment prévenir efficacement une attaque par **Dependency Confusion** dans un projet Node.js/Python ?
- A) Utiliser des namespaces/scopes d'organisation réservés (ex. `@company/pkg`) et configurer le registre privé pour ne jamais chercher les packages internes sur les registres publics
- B) Augmenter la taille du disque dur
- C) Désactiver le fichier package-lock.json
- D) Supprimer Git

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
