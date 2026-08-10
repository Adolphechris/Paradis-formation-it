# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 431 (6h) : Gouvernance Cryptographique & Standards de Conformité — FIPS 140-3, PCI-DSS v4.0 (Req 3 & 4), NIST SP 800-57 & Cryptographic Policy Enforcement

> [!NOTE]
> **Objectif du jour :** Maîtriser la **Gouvernance Cryptographique d'Entreprise** et l'alignement sur les cadres réglementaires et normatifs majeurs : disséquer les exigences de **FIPS 140-3 (Security Requirements for Cryptographic Modules)**, appliquer les exigences cryptographiques de **PCI-DSS v4.0 (Exigences 3 et 4)** sur la protection des données de cartes de paiement (PAN), mettre en œuvre le cycle de vie des clés selon le **NIST SP 800-57**, et rédiger une politique de chiffrement entreprise (**Enterprise Encryption Policy**).
>
> **Compétences visées :** `GOV-CRYPTO-01` (A) — Enterprise Cryptographic Compliance (FIPS 140-3 & PCI-DSS v4.0 Requirements 3/4) | `GOV-CRYPTO-02` (A) — Key Lifecycle Governance (NIST SP 800-57) & Cryptographic Policy Drafting

---

## 1) Module — Standards PCI-DSS v4.0 & FIPS 140-3 (2h)

### 📖 Narration/Intuition

La gouvernance cryptographique transforme les exigences théoriques en contrôles opérationnels vérifiables par les auditeurs (QSA, ISO 27001, FedRAMP). PCI-DSS v4.0 renforce considérablement les exigences sur la protection des données de cartes bancaires (PAN - Primary Account Number) et impose le chiffrement fort, la rotation stricte des clés et l'interdiction totale de stocker la valeur CVV/CVC après autorisation.

```
  ═══════════════════════════════════════════════════════════════════
    EXIGENCES CRYPTOGRAPHIQUES PCI-DSS v4.0 (REQS 3 & 4)
  ═══════════════════════════════════════════════════════════════════

  Exigence PCI-DSS v4.0    Contrôle Obligatoire             Solution Cryptographique
  ─────────────────────    ────────────────────             ────────────────────────
  Req 3.4 (Rendu du PAN    Masquage / Hachage /             HMAC-SHA256 ou
  illisible au repos)      Chiffrement fort                 AES-256-GCM + Tokenisation

  Req 3.5 (Protection      Clés de chiffrement              HSM certifié FIPS 140-3
  des clés privées)        séparées des données             Level 3 + Separation of Duties

  Req 3.6 (Gestion du      Procédure documentée du          NIST SP 800-57 Lifecycle
  cycle de vie des clés)   cycle de vie des clés            (Crypto Period < 1 an)

  Req 4.2 (Transits        Chiffrement strict lors          TLS 1.3 / IPsec IKEv2
  sur réseaux publics)     de la transmission               (Suites fortifiées uniquement)
```

---

## 2) Module — Outillage Cryptographic Policy Engine (`crypto_policy_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone, timedelta
from typing import List, Dict

class CryptographicPolicyEngine:
    """
    Moteur d'évaluation de la gouvernance et de la conformité cryptographique :
    - Audit des algorithmes et longueurs de clés vs NIST SP 800-57 & PCI-DSS v4.0
    - Calcul de la Crypto Period (période de validité opérationnelle d'une clé)
    - Génération de rapports de conformité pour auditeurs QSA / ISO 27001
    """

    # Longueurs de clés minimales conformes NIST SP 800-57 / PCI-DSS v4.0 (2026+)
    APPROVED_KEY_SIZES = {
        "RSA": 3072,         # RSA-2048 déprécié pour nouvelles installations
        "AES": 256,          # AES-128 toléré, AES-256 recommandé
        "ECC": 256,          # P-256 / secp256r1 minimum
        "HMAC": 256,         # HMAC-SHA256 minimum
    }

    DEPRECATED_ALGORITHMS = {
        "DES", "3DES", "RC4", "MD5", "SHA1", "RSA-1024"
    }

    def __init__(self, enterprise: str):
        self.enterprise = enterprise
        self.policy_violations: List[dict] = []

    def audit_key_compliance(self, key_label: str, algo: str, key_size_bits: int, crypto_period_days: int) -> dict:
        """
        Audite une clé d'entreprise contre les exigences NIST SP 800-57 & PCI-DSS v4.0.
        """
        print(f"\n[*] AUDIT DE CONFORMITÉ CRYPTO — Clé: '{key_label}'")
        algo_upper = algo.upper()

        # 1. Vérification algorithme déprécié
        if algo_upper in self.DEPRECATED_ALGORITHMS:
            violation = {
                "severity": "CRITICAL",
                "key_label": key_label,
                "issue": f"Algorithme déprécié et interdit: '{algo}'",
                "standard_violated": "PCI-DSS v4.0 Req 3.4 & NIST SP 800-131A"
            }
            self.policy_violations.append(violation)
            print(f"  [!] CRITICAL: Algorithme '{algo}' déprécié !")
            return violation

        # 2. Vérification taille de clé
        min_size = self.APPROVED_KEY_SIZES.get(algo_upper, 256)
        if key_size_bits < min_size:
            violation = {
                "severity": "HIGH",
                "key_label": key_label,
                "issue": f"Taille de clé insuffisante: {key_size_bits} bits (Minimum requis: {min_size} bits)",
                "standard_violated": "NIST SP 800-57 Part 1 Rev 5"
            }
            self.policy_violations.append(violation)
            print(f"  [!] HIGH: Taille de clé {key_size_bits} bits < {min_size} bits requis")
            return violation

        # 3. Vérification de la Crypto Period (Durée max 365 jours pour PCI-DSS)
        if crypto_period_days > 365:
            violation = {
                "severity": "MEDIUM",
                "key_label": key_label,
                "issue": f"Crypto Period trop longue: {crypto_period_days} jours (Max PCI-DSS: 365 jours)",
                "standard_violated": "PCI-DSS v4.0 Req 3.6.1"
            }
            self.policy_violations.append(violation)
            print(f"  [!] MEDIUM: Crypto Period {crypto_period_days}j > 365j max")
            return violation

        print(f"  [+] Clé '{key_label}' ({algo}-{key_size_bits}, {crypto_period_days}j) : 100% CONFORME ✅")
        return {"key_label": key_label, "status": "COMPLIANT"}

    def generate_governance_report(self) -> dict:
        """Génère le rapport de gouvernance cryptographique global."""
        return {
            "enterprise": self.enterprise,
            "audit_date": datetime.now(timezone.utc).isoformat(),
            "total_violations": len(self.policy_violations),
            "critical_violations": len([v for v in self.policy_violations if v["severity"] == "CRITICAL"]),
            "compliance_status": "NON_COMPLIANT" if self.policy_violations else "FULLY_COMPLIANT",
            "violations": self.policy_violations
        }

# Démonstration Cryptographic Policy Engine
policy = CryptographicPolicyEngine("Paradis Bank Global")
print("=== ENTERPRISE CRYPTOGRAPHIC GOVERNANCE ENGINE ===")

# 1. Audit Clé 3DES (Non conforme)
policy.audit_key_compliance("LEGACY_ATM_KEY", "3DES", 168, 730)

# 2. Audit Clé RSA-2048 (Taille insuffisante selon normes 2026)
policy.audit_key_compliance("TLS_WEB_KEY", "RSA", 2048, 90)

# 3. Audit Clé AES-256 (Conforme)
policy.audit_key_compliance("DATA_AT_REST_MASTER", "AES", 256, 180)

report = policy.generate_governance_report()
print(f"\n[REPORT] Violations détectées: {report['total_violations']} | Statut: {report['compliance_status']}")
```

---

## 3) Module — Fiche des Phases du Cycle de Vie des Clés (NIST SP 800-57) (2h)

```markdown
# CYCLE DE VIE D'UNE CLÉ CRYPTOGRAPHIQUE (NIST SP 800-57)

1. **Pre-Operational Phase** : Génération d'entropie (CSPRNG), établissement du quorum M-of-N.
2. **Operational Phase** : Clé active pour chiffrement et signature (Crypto Period < 1 an).
3. **Post-Operational Phase** : Clé utilisée uniquement pour le déchiffrement des données archivées passées.
4. **Destroyed Phase** : Destruction sécurisée de la clé (Zéroisation HSM ou surécriture 35 passes Dod 5220.22-M).
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PCI-DSS** | Payment Card Industry Data Security Standard — Standard de sécurité de l'industrie des cartes de paiement |
| **QSA** | Qualified Security Assessor — Auditeur certifié PCI-DSS habilité à certifier la conformité d'une entreprise |
| **Crypto Period** | Période de temps pendant laquelle une clé cryptographique est autorisée à être utilisée opérationnellement |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle est l'exigence de la norme **PCI-DSS v4.0 (Exigence 3.4)** concernant la protection des numéros de carte de paiement (PAN) au repos ?
- A) Le PAN doit être rendu strictement illisible partout où il est stocké en utilisant du chiffrement fort (ex: AES-256-GCM), des fonctions de hachage cryptographique robustes ou de la tokenisation
- B) Le PAN peut être stocké en clair sur des serveurs internes
- C) Le PAN doit être envoyé par SMS
- D) Seul le nom du titulaire doit être chiffré

**Réponse : A**

**Q2 :** Selon la norme **NIST SP 800-57 Part 1 Rev 5**, quelle est la taille de clé RSA minimale recommandée pour garantir la sécurité à long terme au-delà de 2030 ?
- A) **RSA-3072 bits** (offrant un niveau de sécurité équivalent à 128 bits symétriques)
- B) RSA-1024 bits
- C) RSA-512 bits
- D) RSA-2048 bits

**Réponse : A**

**Q3 :** Qu'est-ce que la **Crypto Period** d'une clé cryptographique selon le NIST ?
- A) La durée maximale pendant laquelle une clé cryptographique peut être utilisée de manière opérationnelle pour chiffrer ou signer des données avant de devoir être obligatoirement renouvelée
- B) Le temps nécessaire pour générer une clé
- C) La durée de validité du système d'exploitation
- D) L'heure de la journée où la clé est active

**Réponse : A**

**Q4 :** Quelle est la différence majeure entre un module cryptographique certifié **FIPS 140-3 Level 3** et un module Level 1 ?
- A) Le Level 3 exige des protections physiques actives contre l'intrusion (Tamper-Response) qui zéroisent (effacent) immédiatement les clés en cas de tentative d'accès physique non autorisé
- B) Le Level 1 est plus cher que le Level 3
- C) Le Level 1 est un matériel, le Level 3 est un logiciel
- D) Il n'y a aucune différence

**Réponse : A**

**Q5 :** Que stipule l'exigence **PCI-DSS v4.0 (Req 3.3)** concernant la valeur de vérification de la carte (CVV/CVC) située au dos de la carte bancaire ?
- A) Il est STRICTEMENT INTERDIT de stocker la valeur CVV/CVC après l'autorisation de la transaction, même sous forme chiffrée
- B) Le CVV peut être stocké si la clé est de 512 bits
- C) Le CVV doit être envoyé à l'auditeur
- D) Le CVV peut être stocké pendant 5 ans

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
