# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 416 (6h) : Cryptographie Post-Quantique (PQC) — Normes NIST PQC (ML-KEM/Kyber, ML-DSA/Dilithium, Falcon, SPHINCS+), Lattices & Plan de Migration Hybride

> [!NOTE]
> **Objectif du jour :** Maîtriser l'état de l'art de la **Cryptographie Post-Quantique (PQC)** et les normes officielles du **NIST (FIPS 203, 204, 205)** : comprendre l'impact de l'algorithme de Shor sur RSA/ECC et de l'algorithme de Grover sur AES/SHA-2, analyser les constructions basées sur les réseaux euclidiens (**Lattice-based Cryptography — LWE/RLWE**), implémenter l'échange de clés hybride (**X25519 + ML-KEM**) et la signature post-quantique (**ML-DSA**), et concevoir un plan de migration hybride anti-**Harvest-Now-Decrypt-Later (HNDL)**.
>
> **Compétences visées :** `PQC-ADV-01` (A) — Quantum Threat Modeling (Shor & Grover Algorithms) & NIST PQC Standards (ML-KEM FIPS 203, ML-DSA FIPS 204, SPHINCS+ FIPS 205) | `PQC-ADV-02` (A) — Hybrid Key Exchange Implementation (ECDH + ML-KEM) & Enterprise PQC Migration Framework

---

## 1) Module — Menace Quantique & Standards NIST PQC (2h)

### 📖 Narration/Intuition

L'avènement des ordinateurs quantiques tolérants aux pannes (CRQC — Cryptographically Relevant Quantum Computers) représente une menace existentielle pour la sécurité mondiale. L'**Algorithme de Shor** résout en temps polynomial le problème du logarithme discret et de la factorisation des grands entiers, rendant l'ensemble de RSA, Diffie-Hellman et ECC (ECDSA/Ed25519) instantanément vulnérables.

```
  ═══════════════════════════════════════════════════════════════════
    IMPACT DES ALGORITHMES QUANTIKES SUR LA CRYPTOGRAPHIE CLASSIQUE
  ═══════════════════════════════════════════════════════════════════

  Algorithme Quantique   Cryptosystème Cible     Impact de la Menace
  ────────────────────   ───────────────────     ───────────────────
  SHOR                   RSA (4096-bit)          💥 CASSÉ (Temps polynomial)
                         ECDH / ECDSA            💥 CASSÉ (Temps polynomial)
                         Diffie-Hellman          💥 CASSÉ (Temps polynomial)

  GROVER                 AES-128                 ⚠️ SÉCURITÉ DIVISÉE PAR 2 (64-bit)
                         AES-256                 ✅ SÉCURITÉ REDUITE À 128-bit (SÉCURISÉ)
                         SHA-256 / SHA-3         ✅ SÉCURITÉ REDUITE À 128-bit (SÉCURISÉ)

  ═══════════════════════════════════════════════════════════════════
    LES 4 STANDARDS NORMÉS NIST PQC (2024)
  ═══════════════════════════════════════════════════════════════════

  ┌────────────────────┬────────────────────┬────────────────────────┐
  │ Norme NIST         │ Nom de l'Algorithme│ Type Cryptographique   │
  ├────────────────────┼────────────────────┼────────────────────────┤
  │ FIPS 203           │ ML-KEM (Kyber)     │ Encapsulation de Clé   │
  │ FIPS 204           │ ML-DSA (Dilithium) │ Signature Numérique    │
  │ FIPS 205           │ SLH-DSA (SPHINCS+) │ Signature Hash-based   │
  │ Draft              │ FN-DSA (Falcon)    │ Signature Fast Lattice │
  └────────────────────┴────────────────────┴────────────────────────┘
```

#### Modèle d'Attaque Harvest-Now-Decrypt-Later (HNDL)

- **Le Risque Immédiat :** Les adversaires étatiques enregistrent et stockent dès aujourd'hui le trafic chiffré TLS/IPsec traversant Internet.
- **La Décroissance de la Clé :** Dès qu'un ordinateur quantique à 10 000 qubits logiques sera disponible, l'attaquant déchiffrera rétroactivement l'ensemble des données passées capturées.
- **La Solution :** Le **chiffrement hybride (ECDHE + ML-KEM)** dès aujourd'hui — exige d'être cassé à la fois par un ordinateur classique ET un ordinateur quantique.

---

## 2) Module — Outillage Post-Quantum Hybrid Engine (`pqc_hybrid_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import os
import hashlib
import json
from datetime import datetime, timezone
from typing import Tuple, Dict

class PQCHybridCryptoEngine:
    """
    Moteur de simulation cryptographique hybride Post-Quantique (PQC) :
    - Échange de clés hybride X25519 + ML-KEM-768 (FIPS 203)
    - Signature post-quantique ML-DSA-65 (FIPS 204)
    - Évaluation de la résistance aux attaques HNDL (Harvest-Now-Decrypt-Later)
    """

    def __init__(self, organization: str):
        self.org = organization
        self.pqc_log = []

    def simulate_ml_kem_768_keypair() -> Tuple[bytes, bytes]:
        """
        Simule la génération d'une paire de clés ML-KEM-768 (FIPS 203 Module-Lattice Key Encapsulation).
        ML-KEM-768 équivaut au niveau de sécurité NIST Category 3 (192-bit quantum security).
        """
        public_key = os.urandom(1184)   # Taille officielle de la clé publique ML-KEM-768
        private_key = os.urandom(2400)  # Taille officielle de la clé privée ML-KEM-768
        return private_key, public_key

    def simulate_ml_kem_encapsulate(self, public_key: bytes) -> Tuple[bytes, bytes]:
        """
        Simule l'encapsulation de clé ML-KEM-768.
        Retourne (ciphertext_encapsulé 1088 octets, secret_partagé 32 octets).
        """
        shared_secret = hashlib.sha3_256(public_key + os.urandom(32)).digest()
        ciphertext = hashlib.sha3_512(shared_secret).digest() + os.urandom(1024)
        ciphertext = ciphertext[:1088]  # Taille exacte du ciphertext ML-KEM-768
        return ciphertext, shared_secret

    def hybrid_key_exchange_x25519_mlkem(self) -> dict:
        """
        Réalise un échange de clés hybride classique + post-quantique :
        MasterSecret = HKDF-SHA256(ECDH_X25519_Secret || ML_KEM_768_Secret)
        """
        print("\n[*] ÉCHANGE DE CLÉS HYBRIDE: X25519 + ML-KEM-768 (FIPS 203)")
        
        # 1. Échange classique ECDH X25519
        x25519_secret = os.urandom(32)
        print(f"  [1] ECDH X25519 Secret partagé: {x25519_secret.hex()[:16]}...")

        # 2. Encapsulation Post-Quantique ML-KEM-768
        priv_kem, pub_kem = self.simulate_ml_kem_768_keypair()
        ct_kem, mlkem_secret = self.simulate_ml_kem_encapsulate(pub_kem)
        print(f"  [2] ML-KEM-768 Secret partagé: {mlkem_secret.hex()[:16]}...")
        print(f"      Ciphertext ML-KEM-768: {len(ct_kem)} octets")

        # 3. Dérivation hybride du secret combiné
        combined_input = x25519_secret + mlkem_secret
        hybrid_master_secret = hashlib.sha3_256(combined_input).digest()

        result = {
            "mode": "HYBRID_ECDH_X25519_MLKEM768",
            "x25519_secret_len": len(x25519_secret),
            "mlkem768_ct_len": len(ct_kem),
            "hybrid_master_secret": hybrid_master_secret.hex(),
            "hndl_protected": True,
            "quantum_security_level": "NIST Category 3 (192-bit post-quantum)"
        }
        self.pqc_log.append(result)
        print(f"  [+] Master Secret Hybride dérivé: {hybrid_master_secret.hex()[:24]}...")
        print(f"  [+] Protection anti-HNDL : ACTIVÉE ✅")
        return result

    def simulate_ml_dsa_65_signature(self, message: bytes) -> dict:
        """
        Simule la signature post-quantique ML-DSA-65 (FIPS 204 Module-Lattice Digital Signature).
        ML-DSA-65 produit une signature de 3309 octets.
        """
        sig_bytes = hashlib.sha3_512(message).digest() + os.urandom(3245)
        signature = sig_bytes[:3309]

        sig_info = {
            "algorithm": "ML-DSA-65 (FIPS 204)",
            "message_hash": hashlib.sha256(message).hexdigest()[:16],
            "signature_size_bytes": len(signature),
            "signature_hex_preview": signature.hex()[:32] + "...",
            "valid": True
        }
        print(f"  [ML-DSA-65] Signature générée: {len(signature)} octets (vs ~64 octets Ed25519)")
        return sig_info

# Démonstration Post-Quantum Hybrid Engine
pqc = PQCHybridCryptoEngine("Paradis International Bank")
print("=== POST-QUANTUM CRYPTO HYBRID ENGINE ===")

# 1. Échange hybride X25519 + ML-KEM-768
hybrid_res = pqc.hybrid_key_exchange_x25519_mlkem()

# 2. Signature PQC ML-DSA-65
sig_res = pqc.simulate_ml_dsa_65_signature(b"Transaction virement interbancaire SWIFT #2026-08-10")
```

---

## 3) Module — Fiche Plan de Migration PQC d'Entreprise (2h)

```markdown
# FRAMEWORK DE MIGRATION D'ENTREPRISE VERS LA CRYPTOGRAPHIE POST-QUANTIQUE (NIST PQC)

## Phase 1 — Inventaire Cryptographique (CBOM — Cryptographic Bill of Materials)
- Cartographier 100% des certificats X.509, clés SSH, clés API et algorithmes utilisés dans l'entreprise.
- Classifier les données par durée de sensibilité : données de santé/défense (sensibilité > 10 ans) = **URGENCE HNDL CRITIQUE**.

## Phase 2 — Déploiement Hybride (Phase de Transition 2024-2028)
- Activer **X25519 + ML-KEM-768** sur l'ensemble des reverse proxies TLS 1.3 et VPN IPsec/WireGuard.
- Conserver la signature classique RSA/Ed25519 en double signature avec ML-DSA pour la comptabilité ascendante.

## Phase 3 — Bascule Post-Quantique Pure (2028-2030)
- Remplacer les Root CAs par des paires de clés **ML-DSA-87** ou **SPHINCS+**.
- Déprécier définitivement RSA-2048/4096 et ECC P-256/Ed25519.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PQC** | Post-Quantum Cryptography — Algorithmes cryptographiques résistant aux attaques par ordinateurs quantiques |
| **ML-KEM** | Module-Lattice-Based Key-Encapsulation Mechanism — Standard FIPS 203 (ex-Kyber) |
| **ML-DSA** | Module-Lattice-Based Digital Signature Algorithm — Standard FIPS 204 (ex-Dilithium) |
| **HNDL** | Harvest-Now-Decrypt-Later — Stratégie d'attaque consistant à enregistrer du trafic aujourd'hui pour le déchiffrer plus tard |
| **CBOM** | Cryptographic Bill of Materials — Inventaire exhaustif des composants cryptographiques d'un système |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Pourquoi l'**Algorithme de Grover** ne détruit-il pas le chiffrement symétrique AES-256 comme l'Algorithme de Shor détruit RSA-4096 ?
- A) L'algorithme de Grover apporte une accélération quadratique ($\mathcal{O}(\sqrt{N})$) et non exponentielle — il divise la sécurité d'AES par 2, rendant AES-256 encore parfaitement sécurisé avec 128 bits de sécurité résiduelle
- B) Parce que Grover ne fonctionne que sur les processeurs Intel
- C) Parce qu'AES est un algorithme asymétrique
- D) Parce qu'AES-256 utilise des courbes elliptiques

**Réponse : A**

**Q2 :** Quel est l'objectif d'un **Échange de Clés Hybride (ex: X25519 + ML-KEM-768)** pendant la période de transition PQC ?
- A) Garantir que la session reste sécurisée tant qu'AU MOINS UN des deux algorithmes (soit la courbe elliptique classique, soit le réseau euclidien PQC) reste non cassé, se prémunissant contre les attaques HNDL
- B) Réduire la taille des paquets TLS 1.3
- C) Supprimer le besoin de certificats X.509
- D) Remplacer la fonction de hachage SHA-256

**Réponse : A**

**Q3 :** Quel est le standard officiel **NIST FIPS 203** publié en 2024 pour l'encapsulation de clés post-quantique ?
- A) ML-KEM (précédemment connu sous le nom de CRYSTALS-Kyber)
- B) ML-DSA (Dilithium)
- C) AES-GCM-256
- D) SPHINCS+

**Réponse : A**

**Q4 :** Quelle est l'une des contraintes majeures de la signature post-quantique **ML-DSA-65 (FIPS 204)** par rapport à la signature Ed25519 classique ?
- A) La taille de la signature est considérablement plus volumineuse (~3309 octets pour ML-DSA-65 contre seulement 64 octets pour Ed25519), augmentant la taille de la bande passante et des certificats
- B) Elle est impossible à exécuter sur des serveurs Linux
- C) Elle ne fonctionne qu'avec des nombres pairs
- D) Elle nécessite un accès Internet obligatoire pour signer

**Réponse : A**

**Q5 :** Qu'est-ce qu'un **CBOM (Cryptographic Bill of Materials)** dans un plan de migration vers la PQC ?
- A) Un inventaire complet et structuré de l'ensemble des algorithmes, clés, certificats et protocoles cryptographiques déployés dans une infrastructure d'entreprise
- B) Une facture envoyée par l'autorité de certification
- C) Un composant matériel pour HSM
- D) Une sauvegarde des clés privées sur le Cloud

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
