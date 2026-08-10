# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 433 (6h) : Cryptographic Threat Intelligence & Attack Surface Management — Suivi d'Obsolescence (NIST/ANSSI), Quantum Horizon Monitoring & Weak Crypto Discovery

> [!NOTE]
> **Objectif du jour :** Maîtriser la **Cryptographic Threat Intelligence (CTI)** et la gestion dynamique de la surface d'attaque cryptographique : surveiller le calendrier officiel d'obsolescence des algorithmes (**NIST SP 800-131A Rev 2 & ANSSI SAMS**), automatiser la découverte des algorithmes faibles ou obsolètes (**DES, 3DES, RC4, MD5, SHA-1, RSA-1024/2048**) sur l'ensemble de l'infrastructure, et modéliser le **Quantum Horizon Index (QHI)** pour anticiper la rupture par ordinateur quantique.
>
> **Compétences visées :** `CTI-CRYPTO-01` (A) — Cryptographic Attack Surface Discovery & Algorithm Deprecation Tracking (NIST SP 800-131A / ANSSI) | `CTI-CRYPTO-02` (A) — Quantum Horizon Index (QHI) Threat Modeling & Weak Crypto Remediation Automation

---

## 1) Module — Deprecation Tracking & Quantum Horizon (2h)

### 📖 Narration/Intuition

La cryptographie s'use avec le temps : les avancées en cryptanalyse, l'augmentation de la puissance de calcul classique et l'émergence des ordinateurs quantiques transforment d'anciens standards autrefois solides (ex: RSA-1024, SHA-1, 3DES) en vulnérabilités critiques. La **Cryptographic Threat Intelligence (CTI)** consiste à auditer en continu la surface d'attaque et à planifier la dépréciation des algorithmes **AVANT** qu'ils ne soient publiquement cassés.

```
  ═══════════════════════════════════════════════════════════════════
    CALENDRIER OFFICIEL D'OBSOLESCENCE DES ALGORITHMES (NIST / ANSSI)
  ═══════════════════════════════════════════════════════════════════

  Algorithme / Clé       Statut Officiel        Deadline de Retrait Recommandée
  ────────────────       ───────────────        ───────────────────────────────
  DES / 3DES             💥 INTERDIT            Retrait immédiat (Obsolète)
  MD5 / SHA-1            💥 INTERDIT            Retrait immédiat (Collisions)
  RSA-1024               💥 INTERDIT            Retrait immédiat (Factorisation)
  RSA-2048 / ECC P-256   ⚠️ DÉPRÉCIÉ (NIST)     Remplacer par RSA-3072 / P-384
  RSA-4096 / Ed25519     🟢 AUTORISÉ (Classique)Migrer vers ML-KEM/ML-DSA (PQC)

  ═══════════════════════════════════════════════════════════════════
    QUANTUM HORIZON INDEX (QHI) — ESTIMATION DE RUPTURE
  ═══════════════════════════════════════════════════════════════════

  QHI Score = (Durée de Sensibilité des Données + Temps de Migration) / Horizon CRQC
  - Si QHI ≥ 1.0 : URGENCE CRITIQUE — Vos données seront exposées avant la fin de migration !
```

---

## 2) Module — Outillage Cryptographic Threat Scanner (`crypto_threat_scanner.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict

class CryptographicThreatScanner:
    """
    Scanner de vulnérabilités et de surface d'attaque cryptographique d'entreprise :
    - Découverte des algorithmes et longueurs de clés obsolètes (NIST SP 800-131A)
    - Calcul du Quantum Horizon Index (QHI)
    - Génération de la matrice de risque CTI
    """

    DEPRECATED_RULES = {
        "MD5": ("CRITICAL", "Collisions triviales — Remplacer par SHA-256 / SHA-3"),
        "SHA1": ("HIGH", "Collisions démontrées (SHAttered) — Remplacer par SHA-256"),
        "DES": ("CRITICAL", "Clé 56-bit cassée en quelques heures — Interdit"),
        "3DES": ("CRITICAL", "Sweet32 Attack (64-bit block) — Interdit"),
        "RC4": ("CRITICAL", "Biais de flux RFC 7465 — Interdit"),
        "RSA-1024": ("CRITICAL", "Factorisable par calcul distribué — Interdit"),
        "RSA-2048": ("MEDIUM", "Déprécié par le NIST pour nouvelles installations (Préférer RSA-3072+)"),
    }

    def __init__(self, target_network: str):
        self.target = target_network
        self.discovered_vulnerabilities: List[dict] = []

    def scan_asset_crypto_suite(self, asset_name: str, algo: str, key_size: int = 0) -> dict:
        """Scan et évalue le niveau de menace d'un actif cryptographique."""
        key_label = f"{algo}-{key_size}" if key_size > 0 else algo
        print(f"[*] Scan CTI Actif: '{asset_name}' — Algorithme: {key_label}")

        if key_label in self.DEPRECATED_RULES:
            severity, desc = self.DEPRECATED_RULES[key_label]
        elif algo in self.DEPRECATED_RULES:
            severity, desc = self.DEPRECATED_RULES[algo]
        else:
            severity, desc = "CLEAN", "Algorithme conforme aux standards actuels"

        vuln = {
            "asset": asset_name,
            "algorithm": key_label,
            "severity": severity,
            "description": desc,
            "scanned_at": datetime.now(timezone.utc).isoformat()
        }

        if severity != "CLEAN":
            self.discovered_vulnerabilities.append(vuln)
            print(f"  [!] [{severity}] Menace détectée sur {asset_name}: {desc}")
        else:
            print(f"  [+] {asset_name} : Conforme ✅")

        return vuln

    def calculate_quantum_horizon_index(self, data_sensitivity_years: int, migration_time_years: int, crqc_horizon_years: int = 8) -> float:
        """
        Calcule le Quantum Horizon Index (QHI).
        QHI = (Données + Migration) / Horizon Quantique (estimé à 8-10 ans pour 2026).
        Si QHI >= 1.0, la migration Post-Quantique doit démarrer IMMÉDIATEMENT !
        """
        qhi = (data_sensitivity_years + migration_time_years) / crqc_horizon_years
        print(f"\n[*] CALCUL QUANTUM HORIZON INDEX (QHI)")
        print(f"    Sensibilité: {data_sensitivity_years}j | Migration: {migration_time_years}j | Horizon CRQC: {crqc_horizon_years}j")
        print(f"    → QHI = {qhi:.2f}")

        if qhi >= 1.0:
            print("  [!] URGENCE CRITIQUE HNDL: QHI >= 1.0 ! Vos données seront déchiffrées par ordinateur quantique avant la fin de votre migration !")
        else:
            print("  [+] Fenêtre de migration acceptable (QHI < 1.0) ✅")

        return round(qhi, 2)

# Démonstration Cryptographic Threat Scanner
scanner = CryptographicThreatScanner("Réseau Interne Paradis Enterprise")
print("=== CRYPTOGRAPHIC THREAT INTELLIGENCE SCANNER ===")

# 1. Scan des actifs
scanner.scan_asset_crypto_suite("Serveur Web Legacy", "3DES")
scanner.scan_asset_crypto_suite("Certificat VPN SSL", "RSA", 1024)
scanner.scan_asset_crypto_suite("API Gateway", "SHA1")
scanner.scan_asset_crypto_suite("Nouveau Root CA", "RSA", 4096)

# 2. Calcul Quantum Horizon Index
scanner.calculate_quantum_horizon_index(data_sensitivity_years=10, migration_time_years=3, crqc_horizon_years=8)
```

---

## 3) Module — Fiche de Référence de Remplacement des Algorithmes (2h)

```markdown
# TABLEAU DE REMPLACEMENT OBLIGATOIRE DES ALGORITHMES DÉPRÉCIÉS

| Algorithme Obsolète | Cause de la Dépréciation | Algorithme de Remplacement Impératif |
|:---|:---|:---|
| **MD5 / SHA-1** | Collisions cryptographiques | **SHA-256 / SHA-384 / SHA-3** |
| **DES / 3DES** | Clé courte & Attaque Sweet32 | **AES-256-GCM / ChaCha20-Poly1305** |
| **RC4** | Biais statistiques de flux | **AES-256-GCM / ChaCha20-Poly1305** |
| **RSA-1024** | Factorisable | **RSA-3072 / RSA-4096 / Ed25519** |
| **RSA / ECDH (PQC)** | Menace Ordinateur Quantique (Shor) | **ML-KEM (FIPS 203) / ML-DSA (FIPS 204)** |
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CTI** | Cryptographic Threat Intelligence — Renseignement sur les menaces et vulnérabilités cryptographiques |
| **QHI** | Quantum Horizon Index — Métrique d'évaluation de l'urgence de migration post-quantique |
| **CRQC** | Cryptographically Relevant Quantum Computer — Ordinateur quantique capable de casser RSA/ECC |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Selon le standard **NIST SP 800-131A Rev 2**, quel est le statut officiel des algorithmes **DES et 3DES** ?
- A) Strictement INTERDITS pour tout chiffrement d'entreprise en raison de la brièveté des clés et des vulnérabilités de bloc (attaque Sweet32)
- B) Autorités jusqu'en 2050
- C) Recommandés pour les connexions TLS 1.3
- D) Obligatoires sur les terminaux Android

**Réponse : A**

**Q2 :** Pourquoi l'algorithme de hachage **SHA-1** est-il interdit pour toute signature numérique depuis l'attaque SHAttered ?
- A) Parce que des chercheurs ont réussi à générer deux fichiers PDF différents ayant exactement le même hash SHA-1 (collision cryptographique démontrée)
- B) Parce que SHA-1 est trop lent
- C) Parce que SHA-1 utilise des clés RSA
- D) Parce que SHA-1 est un chiffrement symétrique

**Réponse : A**

**Q3 :** Que signifie un résultat de **Quantum Horizon Index (QHI) $\ge 1.0$** pour une organisation ?
- A) Que le temps nécessaire pour migrer l'infrastructure additionné à la durée de sensibilité des données dépasse l'horizon estimé d'arrivée de l'ordinateur quantique — l'organisation est en situation d'urgence HNDL immédiate
- B) Que l'organisation est protégée à 100%
- C) Que la vitesse Internet va diminuer
- D) Que les processeurs Intel sont obsolètes

**Réponse : A**

**Q4 :** Quelle attaque cryptanalytique majeure a définitivement condamné l'utilisation de **3DES** sur le réseau (ex: HTTPS / TLS) ?
- A) L'attaque **Sweet32** exploitant la taille de bloc courte de 64 bits de 3DES pour récupérer des cookies de session après la capture de $2^{32}$ blocs
- B) L'attaque Bleichenbacher
- C) L'attaque par force brute sur 56 bits
- D) L'attaque Heartbleed

**Réponse : A**

**Q5 :** Quel algorithme de signature moderne recommandé par l'ANSSI remplace avantageusement **RSA-2048** avec des clés ultra-courtes de 32 octets et une sécurité supérieure ?
- A) **Ed25519** (basé sur la courbe Edwards25519)
- B) MD5-HMAC
- C) DES-EDE3
- D) SHA-1-DSA

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
