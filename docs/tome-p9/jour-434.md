# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 434 (6h) : Policy-as-Code Cryptographique & Continuous Compliance — Automated Crypto Linter (OPA / Rego), Static Code Analysis & CI/CD Pipeline Guardrails

> [!NOTE]
> **Objectif du jour :** Automatiser le contrôle de conformité cryptographique au sein des pipelines DevSecOps via le concept de **Policy-as-Code** : écrire des politiques **OPA (Open Policy Agent — Rego)** pour valider les configurations TLS, SSH, et de certificats, développer un **Linter Cryptographique Automatisé (Static Code Analysis)** détectant les ré-utilisations d'IV, les clés codées en dur (Hardcoded Keys) et les algorithmes dépréciés dès la phase de commit Git.
>
> **Compétences visées :** `POLICY-CODE-01` (A) — Cryptographic Policy-as-Code Engineering (OPA Rego Rules for TLS/SSH & Crypto CI/CD Guardrails) | `POLICY-CODE-02` (A) — Static Analysis & Automated Crypto Linter Development for DevSecOps Integration

---

## 1) Module — Policy-as-Code & Rego Rules Architecture (2h)

### 📖 Narration/Intuition

La meilleure gouvernance cryptographique est celle qui est **totalement automatisée et transparente pour les développeurs**. Plutôt que de s'appuyer sur des audits manuels annuels, le modèle **Policy-as-Code** intègre des verrous cryptographiques automatisés directement dans les pipelines CI/CD (GitHub Actions / GitLab CI) : tout code source ou fichier de configuration Nginx/OpenSSH contenant un algorithme déprécié ou une clé trop courte est **rejeté automatiquement à la compilation**.

```
  ═══════════════════════════════════════════════════════════════════
    PIPELINE DEVSECOPS AVEC VERROU CRYPTOGRAPHIQUE AUTOMATISÉ
  ═══════════════════════════════════════════════════════════════════

  DÉVELOPPEUR ──► Git Push (Code / Config)
                       │
                       ▼
  CI/CD PIPELINE (GitHub Actions / GitLab CI)
  ├── 1. Static Code Analysis (Bandit / Semgrep) ──► Détecte Hardcoded Private Keys
  ├── 2. OPA Rego Policy Evaluation             ──► Valide TLS 1.3 & Suites Approved
  └── 3. Automated Crypto Linter                ──► Rejette MD5, SHA-1, RSA-1024
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
       ✅ BUILD PASSED     ❌ BUILD FAILED (Policy Violation Error)
       (Production)        (Notification Développeur avec correctif)
```

---

## 2) Module — Outillage Automated Crypto Linter (`automated_crypto_linter.py`) (2h)

### 🛠️ Atelier Pratique

```python
import re
import json
from datetime import datetime, timezone
from typing import List, Dict

class AutomatedCryptoLinter:
    """
    Linter cryptographique automatisé pour pipelines CI/CD DevSecOps.
    Analyse le code source Python, C, Go et les configurations Nginx/SSH.
    """

    # Règles de détection par expressions régulières
    RULES = [
        {
            "id": "CRYPTO-001",
            "name": "Hardcoded Private Key",
            "pattern": r"-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----",
            "severity": "CRITICAL",
            "message": "Clé privée codée en dur dans le code source ! Utiliser un KMS/Vault."
        },
        {
            "id": "CRYPTO-002",
            "name": "Deprecated Hash Algorithm (MD5/SHA1)",
            "pattern": r"\b(md5|sha1|hashlib\.md5|hashlib\.sha1)\b",
            "severity": "HIGH",
            "message": "Algorithme de hachage vulnérable aux collisions. Migrer vers SHA-256 ou SHA-3."
        },
        {
            "id": "CRYPTO-003",
            "name": "Weak Cipher Mode (ECB / CBC without HMAC)",
            "pattern": r"\b(AES\.MODE_ECB|modes\.ECB|CBC)\b",
            "severity": "HIGH",
            "message": "Mode de chiffrement symétrique non-authentifié. Utiliser AES-GCM ou ChaCha20-Poly1305."
        },
        {
            "id": "CRYPTO-004",
            "name": "Static / Hardcoded IV Reuse",
            "pattern": r"\b(iv|nonce)\s*=\s*b['\"][0-9a-fA-F]{12,32}['\"]",
            "severity": "CRITICAL",
            "message": "IV/Nonce codé en dur ! Risque d'attaque Forbidden IV GCM. Utiliser os.urandom()."
        }
    ]

    def __init__(self):
        self.findings: List[dict] = []

    def scan_file_content(self, filename: str, content: str) -> List[dict]:
        """Analyse le contenu d'un fichier source et signale les violations cryptographiques."""
        print(f"[*] Analysis Linter Crypto: '{filename}'")
        file_findings = []

        lines = content.splitlines()
        for line_num, line in enumerate(lines, 1):
            # Ignorer les commentaires
            if line.strip().startswith('#') or line.strip().startswith('//'):
                continue

            for rule in self.RULES:
                if re.search(rule["pattern"], line, re.IGNORECASE):
                    finding = {
                        "rule_id": rule["id"],
                        "rule_name": rule["name"],
                        "file": filename,
                        "line_number": line_num,
                        "severity": rule["severity"],
                        "code_snippet": line.strip(),
                        "remediation": rule["message"]
                    }
                    file_findings.append(finding)
                    self.findings.append(finding)
                    print(f"  [!] [{rule['severity']}] L{line_num} {rule['id']}: {rule['message']}")

        if not file_findings:
            print(f"  [+] '{filename}' : Aucun problème cryptographique détecté ✅")
        return file_findings

    def generate_ci_report() -> dict:
        """Génère le rapport de sortie pour le pipeline CI/CD."""
        critical_count = len([f for f in self.findings if f["severity"] == "CRITICAL"])
        high_count = len([f for f in self.findings if f["severity"] == "HIGH"])
        
        # Le build échoue si au moins 1 finding CRITICAL ou HIGH est présent
        build_should_fail = (critical_count > 0 or high_count > 0)

        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_violations": len(self.findings),
            "critical": critical_count,
            "high": high_count,
            "build_result": "FAILED ❌" if build_should_fail else "PASSED ✅",
            "violations": self.findings
        }

# Démonstration Automated Crypto Linter
linter = AutomatedCryptoLinter()
print("=== AUTOMATED CRYPTO LINTER (CI/CD GUARDRAILS) ===")

vulnerable_code = """
import hashlib
from cryptography.hazmat.primitives.ciphers import modes

# Code vulnérable pour test linter
HARDCODED_KEY = "-----BEGIN RSA PRIVATE KEY-----\nMIIE..."
user_hash = hashlib.md5(b"password123").hexdigest()
cipher_mode = modes.ECB()
static_iv = iv = b"123456789012"
"""

linter.scan_file_content("app/services/crypto_service.py", vulnerable_code)
ci_report = linter.generate_ci_report()

print(f"\n[CI/CD PIPELINE STATUS] Resultat: {ci_report['build_result']}")
```

---

## 3) Module — Fiche OPA Rego Policy (2h)

```rego
# POLITIQUE OPA REGO — VALIDATION INFRASTRUCTURE CRYPTO (tls_policy.rego)

package crypto.tls

default allow = false

# Liste des ciphers TLS 1.3 approuvés
approved_ciphers := {
    "TLS_AES_256_GCM_SHA384",
    "TLS_CHACHA20_POLY1305_SHA256",
    "TLS_AES_128_GCM_SHA256"
}

# La configuration est autorisée uniquement si TLS 1.3 est configuré
allow {
    input.tls_min_version == "1.3"
    approved_ciphers[input.cipher_suite]
    input.ocsp_stapling == true
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OPA** | Open Policy Agent — Moteur open-source d'évaluation de politique sous forme de code (Rego) |
| **Linter Crypto** | Outil d'analyse statique détectant les mauvaises pratiques cryptographiques dans le code |
| **CI/CD Guardrails** | Contrôles automatiques bloquant la fusion de code non-conforme dans les pipelines |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quel est le principe fondamental du concept de **Policy-as-Code** appliqué à la cryptographie ?
- A) Exprimer les règles de sécurité et de conformité cryptographique sous forme de code exécutable (ex: Rego/OPA) et les évaluer automatiquement dans les pipelines CI/CD pour bloquer tout code non-conforme
- B) Écrire le code de chiffrement à la main
- C) Remplacer les certificats X.509 par du code Python
- D) Publier les mots de passe sur GitHub

**Réponse : A**

**Q2 :** Pourquoi un **Linter Cryptographique** doit-il détecter l'utilisation de `modes.ECB()` dans le code source lors d'une analyse statique ?
- A) Parce que le mode AES-ECB ne masque pas les motifs répétitifs de la donnée d'origine (image du Tux Penguin visible) et n'assure aucune confidentialité réelle
- B) Parce que le mode ECB est trop lent
- C) Parce que le mode ECB ne fonctionne qu'en Python 2
- D) Parce qu'ECB nécessite un serveur KMS

**Réponse : A**

**Q3 :** Quel comportement le pipeline CI/CD DevSecOps doit-il adopter si le Linter Crypto détecte une clé privée codée en dur (`-----BEGIN RSA PRIVATE KEY-----`) dans un commit Git ?
- A) Bloquer immédiatement le build (`BUILD FAILED`) et notifier le développeur avec une consigne de remédiation exigeant le passage par HashiCorp Vault ou KMS
- B) Ignorer l'erreur et déployer en production
- C) Envoyer un mail d'avertissement mais laisser le build réussir
- D) Effacer le dépôt Git

**Réponse : A**

**Q4 :** Dans la politique Open Policy Agent (OPA) `tls_policy.rego`, que garantit la règle `input.tls_min_version == "1.3"` ?
- A) Que les configurations Nginx/HAProxy soumises ne permettront aucune connexion avec une version inférieure à TLS 1.3, éliminant d'office les attaques de rétrogradation (Downgrade Attacks)
- B) Que les clés SSH sont régénérées chaque jour
- C) Que la base de données est chiffrée
- D) Que le port 80 est ouvert

**Réponse : A**

**Q5 :** Pourquoi la détection des nONCE/IV statiques (ex: `iv = b"123456789012"`) est-elle classée en sévérité **CRITICAL** par un Linter Crypto ?
- A) Parce que réutiliser le même IV avec une clé AES-GCM permet l'extraction immédiate de la sous-clé GHASH et le forgement de paquets (Forbidden IV Attack)
- B) Parce que le code ne compilera pas
- C) Parce que cela consomme trop de RAM
- D) Parce que Python l'interdit dans sa syntaxe

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
