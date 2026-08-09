# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 401 (6h) : Cryptographie Symétrique Avancée — Chiffrement Authentifié AEAD (AES-256-GCM, ChaCha20-Poly1305, IV Reuse Vulnerabilities & Galois Counter Mode Mechanics)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'ingénierie et la mise en œuvre de la **Cryptographie Symétrique Avancée** de niveau industriel : comprendre le fonctionnement interne des modes **AEAD (Authenticated Encryption with Associated Data)**, disséquer le fonctionnement mathématique du mode **AES-GCM (Galois/Counter Mode)** et de **ChaCha20-Poly1305**, analyser les attaques dévastatrices liées à la réutilisation de vecteur d'initialisation (**IV / Nonce Reuse Attacks**), et implémenter un moteur de chiffrement symétrique sécurisé en Python.
>
> **Compétences visées :** `CRYPTO-SYM-01` (A) — AEAD Encryption Architecture (AES-GCM / ChaCha20-Poly1305) | `CRYPTO-SYM-02` (A) — Nonce/IV Reuse Attack Analysis & Associated Data (AAD) Protection

---

## 1) Module — Principes AEAD & Galois Counter Mode (AES-GCM) (2h)

### 📖 Narration/Intuition

En cryptographie moderne, **chiffrer sans authentifier est une vulnérabilité majeure** (ex. attaques Padding Oracle sur le mode CBC). Les modes **AEAD (Authenticated Encryption with Associated Data)** garantissent simultanément deux propriétés cryptographiques fondamentales :
1. **Confidentialité :** Le texte clair ne peut pas être lu par un tiers.
2. **Intégrité et Authenticité :** Toute altération du texte chiffré ou des données associées (AAD) provoque un échec immédiat du déchiffrement via le tag d'authentification GHASH / Poly1305.

```
                  ┌──────────────────────────────────────────────────┐
                  │           AES-256-GCM ENCRYPTION FLOW            │
                  └────────────────────────┬─────────────────────────┘
                                           │
       ┌───────────────────────────────────┼───────────────────────────────────┐
       ▼                                   ▼                                   ▼
 [ Clef Symétrique (256 bits) ]     [ IV / Nonce (96 bits) ]           [ Associated Data (AAD) ]
       │                                   │                                   │
       ▼                                   ▼                                   ▼
 ┌───────────┐                       ┌───────────┐                       ┌───────────┐
 │ AES Engine│                       │ CTR Mode  │                       │  GHASH    │
 └─────┬─────┘                       └─────┬─────┘                       └─────┬─────┘
       │                                   │                                   │
       ▼                                   ▼                                   ▼
 [ Texcle Clair (Plaintext) ] ──► XOR ──► [ Texte Chiffré (Ciphertext) ] ──► [ Auth Tag (128 bits) ]
```

#### Mathématiques de la multiplication dans le corps de Galois $GF(2^{128})$

Le mode GCM s'appuie sur la multiplication dans le corps de Galois $GF(2^{128})$ défini par le polynôme irréductible :

$$f(x) = x^{128} + x^7 + x^2 + x + 1$$

Le calcul du tag GHASH sur $H = E_K(0^{128})$ pour les blocs $X_1, X_2, \dots, X_m$ s'exprime par :

$$GHASH_H(X_1, \dots, X_m) = \sum_{i=1}^{m} X_i \cdot H^{m-i+1} \pmod{f(x)}$$

#### La Catastrophe de la réutilisation de Nonce (IV Reuse Attack)

Si un même Nonce (IV) est réutilisé deux fois avec la même clé sous AES-GCM :

$$C_1 = P_1 \oplus \text{Stream}, \quad C_2 = P_2 \oplus \text{Stream}$$
$$C_1 \oplus C_2 = P_1 \oplus P_2$$

Un attaquant peut obtenir directement la différence XOR des textes clairs et déduire la clé GHASH $H$, compromettant **l'intégrité de toutes les communications futures** sous cette clé.

---

## 2) Module — Outillage AEAD Cryptographic Engine (`aead_crypto_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import os
import json
import secrets
from datetime import datetime, timezone
from cryptography.hazmat.primitives.ciphers.aead import AESGCM, ChaCha20Poly1305

class AEADCryptoEngine:
    """
    Moteur de chiffrement symétrique AEAD d'entreprise (AES-256-GCM et ChaCha20-Poly1305).
    Gère la génération de Nonce unique de 96 bits et l'authentification des données AAD.
    """

    def __init__(self):
        self.audit_log = []

    def generate_aes256_key(self) -> bytes:
        """Génère une clé AES-256 cryptographiquement sécurisée (32 octets)."""
        return AESGCM.generate_key(bit_length=256)

    def generate_chacha20_key(self) -> bytes:
        """Génère une clé ChaCha20-Poly1305 cryptographiquement sécurisée (32 octets)."""
        return ChaCha20Poly1305.generate_key()

    def encrypt_aes_gcm(self, key: bytes, plaintext: bytes, associated_data: bytes = b"") -> dict:
        """
        Chiffre des données avec AES-256-GCM.
        Génère un Nonce unique de 96 bits (12 octets) à chaque appel.
        """
        if len(key) != 32:
            raise ValueError("La clé AES-256 doit mesurer exactement 32 octets.")

        # Recommandation NIST SP 800-38D : Nonce de 96 bits (12 octets) généré aléatoirement
        nonce = os.urandom(12)
        aesgcm = AESGCM(key)
        
        # Le ciphertext retourné par cryptography inclut le Tag GHASH de 16 octets à la fin
        ciphertext_with_tag = aesgcm.encrypt(nonce, plaintext, associated_data)

        result = {
            "algorithm": "AES-256-GCM",
            "nonce_hex": nonce.hex(),
            "ciphertext_hex": ciphertext_with_tag[:-16].hex(),
            "tag_hex": ciphertext_with_tag[-16:].hex(),
            "aad_hex": associated_data.hex(),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.audit_log.append(result)
        print(f"  [AES-GCM ENCRYPT] Nonce: {result['nonce_hex'][:8]}... | Tag: {result['tag_hex'][:8]}... | AAD: {len(associated_data)}B")
        return result, ciphertext_with_tag, nonce

    def decrypt_aes_gcm(self, key: bytes, nonce: bytes, ciphertext_with_tag: bytes, associated_data: bytes = b"") -> bytes:
        """
        Déchiffre et vérifie l'authenticité d'un message AES-256-GCM.
        Lève une exception InvalidTag en cas d'altération du ciphertext ou des AAD.
        """
        aesgcm = AESGCM(key)
        plaintext = aesgcm.decrypt(nonce, ciphertext_with_tag, associated_data)
        print(f"  [AES-GCM DECRYPT] Message authentifié et déchiffré avec succès ({len(plaintext)} bytes).")
        return plaintext

    def simulate_iv_reuse_vulnerability_check(self, nonce_list: list) -> bool:
        """Détecte toute réutilisation de Nonce (IV Reuse) qui détruirait la sécurité GCM."""
        seen_nonces = set()
        for n in nonce_list:
            if n in seen_nonces:
                print(f"  [!] CRITICAL CRYPTO VULNERABILITY : IV REUSE DETECTED ({n.hex()})")
                return True
            seen_nonces.add(n)
        print("  [+] AUCUNE RÉUTILISATION DE NONCE DÉTECTÉE (Intégrité IV conforme).")
        return False

# Démonstration du Moteur Cryptographique
crypto = AEADCryptoEngine()

print("=== AEAD CRYPTOGRAPHIC ENGINE DEMO (AES-256-GCM) ===")

key = crypto.generate_aes256_key()
secret_message = b"CONFIDENTIAL_BANK_TRANSACTION_PAYLOAD_EUR_5000000"
metadata_aad = b"Header: v1.0 | Sender: Bank_Node_Alpha | Recipient: Bank_Node_Beta"

# Chiffrement
result_meta, raw_cipher, used_nonce = crypto.encrypt_aes_gcm(key, secret_message, metadata_aad)

# Déchiffrement Légitime
decrypted_payload = crypto.decrypt_aes_gcm(key, used_nonce, raw_cipher, metadata_aad)
assert decrypted_payload == secret_message

# Test de vérification d'intégrité Nonce
crypto.simulate_iv_reuse_vulnerability_check([used_nonce, os.urandom(12), os.urandom(12)])
```

---

## 3) Module — Fiche de Comparaison des Algorithmes AEAD (2h)

```markdown
# COMPARAISON DES PROTOCOLES DE CHIFFREMENT AEAD

| Algorithme AEAD | Taille Clé | Taille Nonce | Performance Matérielle | Recommandation SOC / Cloud |
|:---:|:---:|:---:|:---:|:---|
| **AES-256-GCM** | 256 bits | 96 bits | 🚀 Très Rapide (avec instructions matérielles `AES-NI`) | Standard TLS 1.3 / IPsec par défaut |
| **ChaCha20-Poly1305** | 256 bits | 96 bits | ⚡ Ultra Rapide sur processeurs ARM / Mobiles sans AES-NI | Privilégié sur Mobile / WireGuard |
| **AES-256-CCM** | 256 bits | 56-104 bits | 🐢 Plus lent (2 passes AES) | Appareils IoT / Normes IEEE 802.11i |

---

## CONSIGNES SP-800-38D NIST POUR AES-GCM
1. **Unicité du Nonce :** Ne JAMAIS réutiliser un même Nonce avec la même clé symétrique.
2. **Taille du Nonce :** Utiliser préférentiellement un Nonce de 96 bits (12 octets).
3. **Limite de messages :** Sous une même clé AES-GCM, ne pas chiffrer plus de $2^{32}$ messages pour éviter les collisions aléatoires de Nonce (Birthday Paradox).
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **AEAD** | Authenticated Encryption with Associated Data — Mode de chiffrement garantissant à la fois confidentialité et authenticité |
| **GCM** | Galois/Counter Mode — Mode d'opération symétrique basé sur le chiffrement en compteur et la multiplication de Galois |
| **AAD** | Associated Data — Données claires transmises en parallèle du texte chiffré dont l'intégrité est authentifiée par le tag |
| **IV / Nonce** | Initialization Vector / Number Used Once — Valeur d'initialisation unique qui ne doit jamais être répétée sous la même clé |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle est la propriété fondamentale apportée par les modes de chiffrement **AEAD (ex: AES-256-GCM)** par rapport aux anciens modes comme AES-CBC ?
- A) Ils garantissent simultanément la confidentialité du message ET l'authenticité/intégrité des données via un tag cryptographique (GHASH / Poly1305)
- B) Ils n'utilisent pas de clés symétriques
- C) Ils sont plus faciles à casser
- D) Ils suppriment le besoin d'un vecteur d'initialisation

**Réponse : A**

**Q2 :** Quelle est la conséquence cryptographique désastreuse d'une **réutilisation de Nonce (IV Reuse)** sous le mode **AES-GCM** avec la même clé ?
- A) Un attaquant peut effectuer le XOR des textes chiffrés pour déduire le texte clair et dériver la clé GHASH, compromettant l'intégrité globale du canal
- B) Le binaire s'arrête de fonctionner
- C) Le fichier chiffré devient 10 fois plus gros
- D) La clé est automatiquement effacée du serveur

**Réponse : A**

**Q3 :** Quelle est la taille de Nonce (IV) officiellement recommandée par le **NIST SP 800-38D** pour le mode AES-GCM afin d'éviter les calculs de pré-hachage supplémentaires ?
- A) 96 bits (12 octets)
- B) 256 bits (32 octets)
- C) 64 bits (8 octets)
- D) 512 bits (64 octets)

**Réponse : A**

**Q4 :** Pourquoi l'algorithme **ChaCha20-Poly1305** est-il souvent préféré à AES-256-GCM sur les appareils mobiles ou les processeurs IoT ?
- A) Parce qu'il offre d'excellentes performances en logiciel pur sur les architectures dépourvues d'accélération matérielle AES dédiée (AES-NI)
- B) Parce qu'il n'utilise pas de clés
- C) Parce qu'il est réservé à Windows
- D) Parce qu'il ne nécessite pas d'authentification

**Réponse : A**

**Q5 :** À quoi servent les données associées **AAD (Associated Data)** dans un chiffrement AEAD ?
- A) Ce sont des données transmises en clair (ex: en-têtes IP, métadonnées de protocole) dont l'intégrité est protégée par le tag d'authentification sans qu'elles soient chiffrées
- B) À stocker le mot de passe utilisateur
- C) À remplacer la clé de chiffrement
- D) À compresser les fichiers vidéo

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
