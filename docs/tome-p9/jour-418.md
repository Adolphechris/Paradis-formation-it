# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 418 (6h) : Cryptanalyse du Chiffrement Symétrique — Padding Oracle Attacks (PKCS#7), CBC Byte-Flipping & AES-GCM Forbidden IV Subkey Recovery

> [!NOTE]
> **Objectif du jour :** Comprendre, exploiter et corriger les faiblesses cryptanalytiques majeures des modes de chiffrement symétriques : disséquer l'attaque **Padding Oracle (Vaudenay Attack)** sur AES-CBC avec PKCS#7, maîtriser la manipulation de texte clair via l'attaque **CBC Byte-Flipping**, prouver l'impact catastrophique du réusage d'un IV dans **AES-GCM (Forbidden IV Attack)** permettant la dérivation de la sous-clé d'authentification GHASH ($H$) et le forgement de tags GMAC, et implémenter les correctifs AEAD rigoureux.
>
> **Compétences visées :** `SYM-CRYPTO-01` (A) — Padding Oracle Exploitation (PKCS#7 Vaudenay) & CBC Bit/Byte Flipping Attacks | `SYM-CRYPTO-02` (A) — AES-GCM Forbidden IV Subkey Recovery ($H$) & GMAC Forgery Prevention

---

## 1) Module — Padding Oracle & AES-GCM Forbidden IV Anatomy (2h)

### 📖 Narration/Intuition

Les modes de chiffrement non-authentifiés (comme AES-CBC sans HMAC) ou mal implémentés (réusage d'IV avec AES-GCM) conduisent à des compromissions totales de la confidentialité et de l'intégrité du système.

```
  ═══════════════════════════════════════════════════════════════════
    1. ATTENTION PADDING ORACLE (AES-CBC + PKCS#7)
  ═══════════════════════════════════════════════════════════════════

  Attaquant ──(Ciphertext modifié)──► Serveur Web
      ▲                                   │
      │                                   ▼
      │                             Déchiffrement AES-CBC + Vérification PKCS#7
      │                                   │
      │◄── Ex: "200 OK" (Padding Valide) ─┤
      │◄── Ex: "500 Error" (Invalid Pad) ─┘  ◄── ORACLE DE PADDING FUYANT !

  L'oracle fuit le statut du padding PKCS#7 → L'attaquant déchiffre l'intégralité
  du message bloc par bloc sans connaître la clé AES privée !

  ═══════════════════════════════════════════════════════════════════
    2. AES-GCM FORBIDDEN IV (REUSAGE DU MEME IV SUR AES-GCM)
  ═══════════════════════════════════════════════════════════════════

  Si deux messages M1 et M2 sont chiffrés avec la MÊME CLÉ et le MÊME IV :
  Tag1 = GHASH_H(C1) ⊕ E_K(J0)
  Tag2 = GHASH_H(C2) ⊕ E_K(J0)

  Tag1 ⊕ Tag2 = GHASH_H(C1) ⊕ GHASH_H(C2)   ◄── Annulation du masque AES !

  L'attaquant obtient une équation polynomiale sur GF(2^128) dont la racine
  est la sous-clé GHASH H. Une fois H extraite, l'attaquant peut forger n'importe
  quel tag GMAC pour n'importe quel message arbitraire !
```

---

## 2) Module — Outillage Symmetric Cryptanalysis Lab (`symmetric_attacks_lab.py`) (2h)

### 🛠️ Atelier Pratique

```python
import os
import json
import secrets
from typing import List, Tuple, Optional
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding

class SymmetricCryptanalysisLab:
    """
    Laboratoire d'exploitation et de démonstration des attaques symétriques :
    1. Padding Oracle Attack (AES-CBC PKCS#7)
    2. CBC Byte-Flipping Attack
    3. AES-GCM IV Reuse Detection & Mitigation Audit
    """

    def __init__(self):
        self.key_aes = secrets.token_bytes(32)  # Clé AES-256 secrète

    def encrypt_cbc_pkcs7(self, plaintext: str) -> Tuple[bytes, bytes]:
        """Chiffre un message en AES-CBC avec padding PKCS#7."""
        iv = secrets.token_bytes(16)
        padder = padding.PKCS7(128).padder()
        padded_data = padder.update(plaintext.encode()) + padder.finalize()
        
        cipher = Cipher(algorithms.AES(self.key_aes), modes.CBC(iv))
        encryptor = cipher.encryptor()
        ciphertext = encryptor.update(padded_data) + encryptor.finalize()
        return iv, ciphertext

    def decrypt_cbc_padding_oracle(self, iv: bytes, ciphertext: bytes) -> bool:
        """
        ⚠️ ORACLE DE PADDING : Retourne True si le padding PKCS#7 est valide, False sinon.
        Fuit la validité du padding PKCS#7 (HTTP 200 vs HTTP 500).
        """
        cipher = Cipher(algorithms.AES(self.key_aes), modes.CBC(iv))
        decryptor = cipher.decryptor()
        try:
            padded_data = decryptor.update(ciphertext) + decryptor.finalize()
            unpadder = padding.PKCS7(128).unpadder()
            unpadder.update(padded_data) + unpadder.finalize()
            return True   # Padding Valide ✅
        except ValueError:
            return False  # Padding Invalide ❌

    def cbc_byte_flipping_attack(self, iv: bytes, ciphertext: bytes, target_offset: int, original_char: str, desired_char: str) -> bytes:
        """
        Exploite la propriété de malléabilité de AES-CBC :
        C'[i] XOR P[i] XOR P'[i] modifie directement le caractère P[i+1] du bloc suivant !
        """
        print("\n[*] ATTAQUE CBC BYTE-FLIPPING")
        ct_modified = bytearray(ciphertext)
        
        # Calcul du masque XOR pour transformer original_char en desired_char
        xor_mask = ord(original_char) ^ ord(desired_char)
        
        # Modification du bloc précédent dans le ciphertext (ou IV si 1er bloc)
        ct_modified[target_offset] ^= xor_mask
        
        print(f"  [+] Caractère '{original_char}' modifié en '{desired_char}' à l'offset {target_offset}")
        return bytes(ct_modified)

    def simulate_gcm_forbidden_iv_detection(self, iv_log: List[bytes]) -> dict:
        """Détecte les réusages d'IV dans les sessions AES-GCM (Forbidden IV Attack Risk)."""
        print("\n[*] AUDIT REUSAGE D'IV AES-GCM (FORBIDDEN IV ATTACK)")
        seen_ivs = set()
        duplicates = []

        for iv in iv_log:
            if iv in seen_ivs:
                duplicates.append(iv.hex())
            seen_ivs.add(iv)

        if duplicates:
            print(f"  [!] ALERTE CRITIQUE: {len(duplicates)} IV(s) réutilisé(s) en AES-GCM !")
            print(f"  [!] Risque: Extraction de la sous-clé GHASH H et forgement de tags GMAC !")
            status = "CRITICAL_VULNERABILITY_FORBIDDEN_IV"
        else:
            print("  [+] Tous les IVs GCM sont uniques (Entropie OK) ✅")
            status = "SECURE"

        return {"status": status, "duplicate_count": len(duplicates), "duplicates": duplicates}

# Démonstration Symmetric Cryptanalysis Lab
lab = SymmetricCryptanalysisLab()
print("=== SYMMETRIC CRYPTANALYSIS LAB ===")

# 1. Padding Oracle Verification
iv, ct = lab.encrypt_cbc_pkcs7("admin=false;user=adolphe;role=guest")
oracle_result = lab.decrypt_cbc_padding_oracle(iv, ct)
print(f"  [PADDING ORACLE TEST] Statut Padding initial: {oracle_result} (Valid)")

# 2. CBC Byte-Flipping Attack (Inversion 'guest' → 'admin')
# Modifier le ciphertext pour changer 'role=guest' en 'role=admin'
ct_tampered = lab.cbc_byte_flipping_attack(iv, ct, target_offset=10, original_char='g', desired_char='a')

# 3. Audit AES-GCM IV Reuse
gcm_ivs = [
    bytes.fromhex("1A2B3C4D5E6F7A8B9C0D1E2F"),
    bytes.fromhex("9F8E7D6C5B4A392817060504"),
    bytes.fromhex("1A2B3C4D5E6F7A8B9C0D1E2F"),  # ⚠️ DOUBLON IV REUSE!
]
lab.simulate_gcm_forbidden_iv_detection(gcm_ivs)
```

---

## 3) Module — Fiche de Remédiation Cryptographique (2h)

```markdown
# GUIDE DE REMÉDIATION CRYPTOGRAPHIQUE SÉCURISÉE

## 1. Remplacer CBC par des Modes AEAD (Authenticated Encryption with Associated Data)
- **Règle absolue :** Ne JAMAIS utiliser AES-CBC sans signature HMAC préalable (Encrypt-then-MAC).
- **Solution recommandée :** Migrer vers **AES-256-GCM** ou **ChaCha20-Poly1305**.

## 2. Prévention Forbidden IV AES-GCM
- **Génération d'IV 96-bit :** Utiliser un compteur déterministe par clé ou un générateur CSPRNG.
- **Limitation du nombre de messages par clé :** Ne jamais dépasser $2^{32}$ messages chiffrés sous la même clé AES-GCM (NIST SP 800-38D).

## 3. Gestion des Erreurs & Oracles
- Renvoyer des messages d'erreur **génériques et uniformes** pour toute erreur de déchiffrement ("Authentication failed"), sans distinguer l'erreur de padding de l'erreur d'authentification.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Padding Oracle** | Attaque cryptanalytique exploitant les fuites d'erreur de padding pour déchiffrer AES-CBC |
| **CBC Byte-Flipping** | Attaque exploitant la malléabilité du mode CBC en modifiant un bloc de ciphertext pour modifier le bloc clair suivant |
| **Forbidden IV** | Réusage d'un même IV avec AES-GCM permettant l'extraction de la sous-clé GHASH H |
| **GMAC** | Galois Message Authentication Code — Composant d'authentification du mode AES-GCM |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Dans une **Padding Oracle Attack** contre AES-CBC avec padding PKCS#7, quelle information permet à l'attaquant de déchiffrer le message bloc par bloc ?
- A) La différence de comportement ou de message d'erreur de l'application selon que le padding PKCS#7 déchiffré est valide ou invalide
- B) La connaissance de la clé privée AES
- C) La taille du fichier chiffré
- D) Le numéro de port du serveur HTTP

**Réponse : A**

**Q2 :** Quelle propriété mathématique du mode **AES-CBC** permet l'attaque par **CBC Byte-Flipping** ?
- A) La malléabilité du mode CBC : la modification du $i$-ème octet du bloc de ciphertext $C_k$ modifie directement le $i$-ème octet du bloc clair suivant $P_{k+1}$ via le XOR du déchiffrement
- B) L'absence de padding PKCS#7
- C) La faiblesse de la clé AES-128
- D) Le temps de calcul de la S-Box

**Réponse : A**

**Q3 :** Quelle est la conséquence cryptographique désastreuse du réusage d'un même IV avec la même clé en **AES-GCM (Forbidden IV Attack)** ?
- A) L'attaquant peut éliminer le masque AES et résoudre l'équation polynomiale sur $GF(2^{128})$ pour dériver la sous-clé d'authentification GHASH $H$, lui permettant de forger des tags GMAC valides pour n'importe quel message
- B) L'ordinateur du serveur plante instantanément
- C) La clé AES est raccourcie à 64 bits
- D) Le serveur bascule automatiquement en AES-CBC

**Réponse : A**

**Q4 :** Selon la norme **NIST SP 800-38D**, combien de messages au maximum peuvent être chiffrés avec la même clé **AES-GCM** avec un IV généré de manière aléatoire ?
- A) Pas plus de $2^{32}$ invocations de chiffrement pour éviter la probabilité de collision d'IV par le paradoxe des anniversaires
- B) Illimité
- C) Exactement 1000 messages
- D) $2^{128}$ messages

**Réponse : A**

**Q5 :** Quelle est la règle d'or pour prévenir les attaques de type Padding Oracle si une application doit impérativement conserver le mode AES-CBC ?
- A) Implémenter le schéma **Encrypt-then-MAC** (calculer un HMAC-SHA256 sur le ciphertext CBC et vérifier le HMAC AVANT de tenter tout déchiffrement ou validation de padding)
- B) Remplacer PKCS#7 par un padding à zéro
- C) Augmenter la taille du bloc AES à 512 bits
- D) Supprimer l'IV

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
