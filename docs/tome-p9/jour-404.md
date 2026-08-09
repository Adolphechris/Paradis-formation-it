# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 404 (6h) : Fonctions de Hachage Cryptographique & MACs — SHA-3/Keccak, HMAC-SHA256, HKDF, BLAKE3 & Length Extension Attacks Analysis

> [!NOTE]
> **Objectif du jour :** Maîtriser l'ingénierie des **fonctions de hachage cryptographique et des codes d'authentification de message (MAC)** : comparer l'construction Merkle-Damgård (SHA-256) et la construction Éponge (SHA-3 / Keccak), implémenter **HMAC-SHA256** et la fonction de dérivation de clé **HKDF (RFC 5869)**, analyser la vulnérabilité d'extension de longueur (**Length Extension Attacks** sur MD5/SHA-1/SHA-256), et découvrir l'algorithme hautement parallélisable **BLAKE3**.
>
> **Compétences visées :** `CRYPTO-HASH-01` (A) — Cryptographic Hash Construction (Sponge vs Merkle-Damgård) & HKDF Key Derivation | `CRYPTO-HASH-02` (A) — HMAC Engineering & Length Extension Attack Cryptanalysis

---

## 1) Module — Merkle-Damgård vs Construction Éponge (Sponge Construction) (2h)

### 📖 Narration/Intuition

Toutes les fonctions de hachage ne sont pas conçues de la même manière. Les anciennes fonctions (MD5, SHA-1, SHA-256) s'appuient sur la **construction de Merkle-Damgård**, qui souffre d'une faiblesse structurelle appelée **Length Extension Attack**. La nouvelle norme **SHA-3 (Keccak)** utilise la **construction Éponge (Sponge Construction)** qui élimine cette vulnérabilité.

```
       ┌─────────────────────────────────────────────────────────────┐
       │             CONSTRUCTION ÉPONGE (SHA-3 / KECCAK)            │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
           PHASE D'ABSORPTION (Absorbing)     PHASE DE PRESSAGE (Squeezing)
           ┌─────────────────────────┐        ┌─────────────────────────┐
 Message ─►│ Bitwise XOR avec State  │── f ──►│ Extraction de la sortie │──► Digest
           └─────────────────────────┘        └─────────────────────────┘
```

#### Comparatif des Algorithmes de Hachage & MACs

| Algorithme | Construction | Résistance Length Extension | Débit / Performance | Recommandation Production |
|:---:|:---:|:---:|:---:|:---|
| **SHA-256** | Merkle-Damgård | ❌ Vulnérable si utilisé comme $H(K \parallel M)$ | 🟡 Moyen | Utiliser uniquement via **HMAC-SHA256** |
| **SHA-3 (Keccak)** | Éponge (Sponge) | ✅ Résistant | 🟢 Bon | Standard NIST FIPS 202 |
| **BLAKE3** | Tree Hashing (Bao/BLAKE2) | ✅ Résistant | 🚀 Ultra-Rapide (Parallélisable SIMD) | Recommandé pour gros volumes / Fichiers |
| **HMAC-SHA256** | Double Hash RFC 2104 | ✅ Résistant | 🟢 Bon | Standard d'Authentification de Message |

---

## 2) Module — Outillage Hash & Key Derivation Engine (`hash_hkdf_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import hmac
import hashlib
from datetime import datetime, timezone
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes

class HashHKDFEngine:
    """
    Moteur de hachage cryptographique, calcul HMAC et dérivation de clés HKDF.
    """

    def __init__(self):
        self.operations_log = []

    def compute_sha3_256(self, data: bytes) -> str:
        """Calcule l'empreinte SHA-3 (Keccak) de 256 bits."""
        digest = hashlib.sha3_256(data).hexdigest()
        print(f"  [SHA-3] Digest: {digest[:16]}...")
        return digest

    def compute_hmac_sha256(self, secret_key: bytes, message: bytes) -> str:
        """
        Calcule le Tag HMAC-SHA256 (RFC 2104).
        HMAC = H((K' ⊕ opad) ∥ H((K' ⊕ ipad) ∥ M))
        """
        mac = hmac.new(secret_key, message, hashlib.sha256).hexdigest()
        print(f"  [HMAC-SHA256] MAC: {mac[:16]}...")
        return mac

    def derive_keys_hkdf(self, ikm: bytes, salt: bytes, info: bytes, key_length: int = 32) -> bytes:
        """
        Derive une clé cryptographique via HKDF (HMAC-based Key Derivation Function - RFC 5869).
        Étape 1: HKDF-Extract(salt, IKM) -> PRK
        Étape 2: HKDF-Expand(PRK, info, L) -> OKM
        """
        hkdf = HKDF(
            algorithm=hashes.SHA256(),
            length=key_length,
            salt=salt,
            info=info,
        )
        okm = hkdf.derive(ikm)
        print(f"  [HKDF DERIVE] Clé dérivée de {key_length} octets : {okm.hex()[:16]}...")
        return okm

    def simulate_length_extension_attack_vulnerability(self, secret_key: bytes, original_message: bytes):
        """
        Démontre pourquoi H(Key || Message) est VULNÉRABLE sous SHA-256 (Merkle-Damgård),
        alors que HMAC-SHA256 protège contre cette attaque.
        """
        # Construction vulnérable: H(Key || Message)
        vulnerable_hash = hashlib.sha256(secret_key + original_message).hexdigest()
        
        # Construction sécurisée: HMAC-SHA256
        secure_hmac = self.compute_hmac_sha256(secret_key, original_message)

        print(f"  [VULN CHECK] Naive H(K||M) : {vulnerable_hash[:16]}... (VULNÉRABLE À LENGTH EXTENSION)")
        print(f"  [SECURE CHECK] HMAC-SHA256  : {secure_hmac[:16]}... (PROTÉGÉ)")

# Démonstration Hash Engine
engine = HashHKDFEngine()

print("=== CRYPTOGRAPHIC HASH & HKDF DERIVATION ENGINE ===")

# Test SHA-3
data = b"CONFIDENTIAL_TRANSACTION_PAYLOAD"
engine.compute_sha3_256(data)

# Test HMAC-SHA256
key = b"SUPER_SECRET_HMAC_KEY_2026"
engine.compute_hmac_sha256(key, data)

# Test HKDF Key Derivation
ikm = b"INPUT_KEY_MATERIAL_FROM_ECDHE_EXCHANGE"
salt = b"UNIQUE_RANDOM_SALT_99812"
derived_key = engine.derive_keys_hkdf(ikm, salt, info=b"TLS 1.3 AES-GCM Key")

# Test de vulnérabilité Length Extension
engine.simulate_length_extension_attack_vulnerability(key, data)
```

---

## 3) Module — Fiche de l'Attaque Length Extension Attack (2h)

```markdown
# VULNÉRABILITÉ : LENGTH EXTENSION ATTACK (MERKLE-DAMGÅRD)

## 1. Origine de la Vulnérabilité
Dans la construction Merkle-Damgård (MD5, SHA-1, SHA-256), l'état final du hachage est l'état interne du dernier bloc après padding.

Si une signature naïve est générée via :

$$\text{Sig} = H(\text{SecretKey} \parallel \text{OriginalMessage})$$

Un attaquant qui connaît $\text{Sig}$ et la longueur de $\text{OriginalMessage}$ peut calculer :

$$\text{NewSig} = H(\text{SecretKey} \parallel \text{OriginalMessage} \parallel \text{Padding} \parallel \text{ExtraData})$$

**Sans connaître la $\text{SecretKey}$ !**

## 2. Remédiation Cryptographique
1. **Utiliser HMAC :** La double itération HMAC $H(K_o \parallel H(K_i \parallel M))$ bloque totalement l'extension.
2. **Utiliser SHA-3 ou BLAKE3 :** La construction Éponge (Sponge) n'expose pas son état interne complet.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **HMAC** | Hash-based Message Authentication Code — Algorithme de MAC basé sur une fonction de hachage |
| **HKDF** | HMAC-based Extract-and-Expand Key Derivation Function — Standard RFC 5869 de dérivation de clés |
| **Sponge Construction** | Mode de hachage cryptographique utilisé par SHA-3 (Keccak) résistant à l'extension de longueur |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Pourquoi la construction naïve $H(\text{Clé} \parallel \text{Message})$ avec SHA-256 est-elle **vulnérable** et interdite en production ?
- A) Parce qu'elle souffre de l'attaque d'extension de longueur (Length Extension Attack), permettant à un attaquant d'ajouter des données à la fin du message et de calculer le nouveau hash sans connaître la clé
- B) Parce qu'elle est trop lente
- C) Parce qu'elle ne fonctionne que sur Windows
- D) Parce qu'elle génère un hash de 16 bits

**Réponse : A**

**Q2 :** Quelle construction cryptographique est utilisée par la norme **SHA-3 (Keccak)** pour éliminer la vulnérabilité d'extension de longueur ?
- A) La construction Éponge (Sponge Construction — Phase d'absorption et de pressage)
- B) La construction Merkle-Damgård
- C) L'arbre de Merkle simple
- D) Le chiffrement en bloc AES

**Réponse : A**

**Q3 :** À quoi sert l'algorithme **HKDF (RFC 5869)** lors de l'établissement d'une session TLS 1.3 ?
- A) À dériver une ou plusieurs clés symétriques de haute entropie à partir d'un matériau de clé initial (ex. secret partagé ECDHE) via une étape Extract puis Expand
- B) À formater la carte réseau
- C) À compresser les fichiers HTML
- D) À vérifier les signatures DNS

**Réponse : A**

**Q4 :** Quel algorithme de hachage moderne basé sur une structure en arbre (Tree Hashing) offre des performances exceptionnelles grâce à la parallélisation SIMD ?
- A) **BLAKE3**
- B) MD5
- C) SHA-1
- D) DES

**Réponse : A**

**Q5 :** Comment l'algorithme **HMAC (RFC 2104)** neutralise-t-il l'attaque d'extension de longueur ?
- A) En utilisant une structure à double hachage avec des clés masquées par des valeurs de remplissage internes et externes ($K_i$ et $K_o$)
- B) En supprimant le message
- C) En utilisant RSA
- D) En chiffrant les données en AES-CBC

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
