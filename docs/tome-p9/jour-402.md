# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 402 (6h) : Cryptographie Asymétrique & Factorisation — RSA-4096, OAEP Padding, Vulnerabilities (Bleichenbacher, Coppersmith & Low Public Exponent)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'ingénierie et la sécurité de la **Cryptographie Asymétrique RSA** de niveau entreprise : comprendre le problème mathématique de la factorisation des grands nombres premiers ($n = p \cdot q$), analyser le rôle du rembourrage **OAEP (Optimal Asymmetric Encryption Padding)** pour contrer les attaques par oracle de déchiffrement, disséquer les attaques cryptanalytiques historiques et modernes (**Bleichenbacher's PKCS#1 v1.5 Padding Oracle**, **Coppersmith's Low Public Exponent Attack**), et implémenter la génération et la signature RSA-4096 sécurisées.
>
> **Compétences visées :** `CRYPTO-ASYM-01` (A) — RSA-4096 Architecture, Key Generation & OAEP Padding Mechanics | `CRYPTO-ASYM-02` (A) — Cryptanalytic Attack Vector Analysis (Bleichenbacher, Coppersmith, Wiener, IV/e=3 Abuse)

---

## 1) Module — Fondements Mathématiques de RSA & Rembourrage OAEP (2h)

### 📖 Narration/Intuition

Le chiffrement RSA repose sur la difficulté d'effectuer la factorisation de grands nombres entiers. Cependant, la formule RSA brute ("Textbook RSA" : $c = m^e \pmod n$) est **totalement insécurisée** car elle est déterministe et vulnérable à de multiples attaques algébriques. L'introduction du schéma de rembourrage **OAEP (Optimal Asymmetric Encryption Padding)** est obligatoire pour rendre le chiffrement indifférenciable sous attaque à texte clair choisi (IND-CCA2).

```
                  ┌──────────────────────────────────────────────────┐
                  │          OAEP PADDING MECHANISM (RSA)            │
                  └────────────────────────┬─────────────────────────┘
                                           │
       ┌───────────────────────────────────┴───────────────────────────────────┐
       ▼                                                                       ▼
 [ Message m (Padding 0s) ]                                            [ Random Seed (r) ]
       │                                                                       │
       │ XOR                                                                   │ XOR
       ▼                                                                       ▼
 ┌───────────┐                                                           ┌───────────┐
 │ Mask M    │ ◄──────────────────────── MGF(r) ──────────────────────── │  Mask R   │
 └─────┬─────┘                                                           └─────┬─────┘
       │                                                                       │
       └───────────────────────────────────┬───────────────────────────────────┘
                                           ▼
                       [ EMBEDDED OAEP BLOCK (XOR Combined) ]
                                           │
                                           ▼
                            [ RSA EXPONENTIATION: c = M^e mod n ]
```

#### Mathématiques de la Génération de Clés RSA

1. Sélectionner deux grands nombres premiers distincts $p$ et $q$ (ex: 2048 bits chacun pour RSA-4096).
2. Calculer le module RSA : $n = p \cdot q$.
3. Calculer l'indicatrice d'Euler : $\phi(n) = (p - 1)(q - 1)$.
4. Choisir un exposant public $e$ tel que $\gcd(e, \phi(n)) = 1$ (Standard NIST : $e = 65537 = 2^{16} + 1$).
5. Calculer l'exposant privé $d$ tel que :

$$d \cdot e \equiv 1 \pmod{\phi(n)} \iff d = e^{-1} \pmod{\phi(n)}$$

6. Chiffrement : $c = m^e \pmod n$ | Déchiffrement : $m = c^d \pmod n$.

---

## 2) Module — Outillage RSA Cryptographic Engine (`rsa_crypto_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization

class RSACryptoEngine:
    """
    Moteur cryptographique asymétrique RSA-4096 d'entreprise.
    Implémente le chiffrement/déchiffrement RSA-OAEP et la signature numérique RSA-PSS.
    """

    def __init__(self):
        self.private_key = None
        self.public_key = None

    def generate_rsa4096_keypair(self) -> dict:
        """
        Génère une paire de clés RSA-4096 avec un exposant public standard e=65537.
        """
        print("[*] Génération de la paire de clés RSA-4096 bits en cours (Opération coûteuse)...")
        self.private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=4096
        )
        self.public_key = self.private_key.public_key()

        # Exportation des clés au format PEM
        pub_pem = self.public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )

        return {
            "key_size_bits": 4096,
            "public_exponent": 65537,
            "public_key_pem": pub_pem.decode('utf-8')
        }

    def encrypt_rsa_oaep(self, message: bytes) -> bytes:
        """
        Chiffre un message en utilisant RSA-4096-OAEP avec masque MGF1 (SHA-256).
        """
        if not self.public_key:
            raise ValueError("La clé publique n'est pas initialisée.")

        ciphertext = self.public_key.encrypt(
            message,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        print(f"  [RSA-OAEP ENCRYPT] Ciphertext généré ({len(ciphertext)} octets).")
        return ciphertext

    def decrypt_rsa_oaep(self, ciphertext: bytes) -> bytes:
        """
        Déchiffre un ciphertext RSA-OAEP avec la clé privée RSA-4096.
        """
        if not self.private_key:
            raise ValueError("La clé privée n'est pas disponible.")

        plaintext = self.private_key.decrypt(
            ciphertext,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        print(f"  [RSA-OAEP DECRYPT] Déchiffrement réussi ({len(plaintext)} octets).")
        return plaintext

    def sign_rsa_pss(self, data: bytes) -> bytes:
        """
        Signe cryptographiquement une donnée avec le schéma de signature RSA-PSS (SHA-256).
        """
        signature = self.private_key.sign(
            data,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        print(f"  [RSA-PSS SIGN] Signature numérique générée ({len(signature)} octets).")
        return signature

    def verify_rsa_pss_signature(self, data: bytes, signature: bytes) -> bool:
        """
        Vérifie la validité d'une signature RSA-PSS avec la clé publique.
        """
        try:
            self.public_key.verify(
                signature,
                data,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            print("  [RSA-PSS VERIFY] Signature VALIDE et authentifiée ✅")
            return True
        except Exception as e:
            print(f"  [!] SIGNATURE INVALID ❌ : {str(e)}")
            return False

# Démonstration Moteur RSA
rsa_engine = RSACryptoEngine()

print("=== RSA-4096 CRYPTOGRAPHIC ENGINE DEMO ===")
key_info = rsa_engine.generate_rsa4096_keypair()
print(f"[+] Clé RSA-4096 générée avec succès (Exposant: {key_info['public_exponent']})")

# Chiffrement / Déchiffrement RSA-OAEP
msg = b"SECRET_SESSION_KEY_FOR_HYBRID_ENCRYPTION_99812"
encrypted_msg = rsa_engine.encrypt_rsa_oaep(msg)
decrypted_msg = rsa_engine.decrypt_rsa_oaep(encrypted_msg)
assert decrypted_msg == msg

# Signature / Vérification RSA-PSS
data_to_sign = b"BANK_TRANSFER_ORDER_AMOUNT_EUR_10000000"
sig = rsa_engine.sign_rsa_pss(data_to_sign)
rsa_engine.verify_rsa_pss_signature(data_to_sign, sig)
```

---

## 3) Module — Fiche d'Analyse des Attaques Cryptanalytiques RSA (2h)

```markdown
# VULNÉRABILITÉS & ATTAQUES CRYPTANALYTIQUES SUR RSA

| Attaque | Cause de la Vulnérabilité | Impact / Exploitation | Remédiation Obligatoire |
|:---|:---|:---|:---|
| **Bleichenbacher's Oracle** | Utilisation du rembourrage obsolète **PKCS#1 v1.5** | Déchiffrement de messages TLS via les codes d'erreur du serveur | **Forcer RSA-OAEP** / TLS 1.3 |
| **Coppersmith Low Exponent** | Petit exposant public ($e = 3$) sans rembourrage adéquat ($m^3 < n$) | Déduction directe du message $m = \sqrt[3]{c}$ sans modulo | **Utiliser $e = 65537$** |
| **Wiener's Attack** | Exposant privé $d$ trop petit ($d < \frac{1}{3} n^{1/4}$) | Factorisation directe de $n$ en temps polynomial | Générer $d$ de taille complète |
| **Common Modulus Attack** | Mouvement d'un même $n$ partagé entre plusieurs utilisateurs | Déduction du texte clair si $e_1, e_2$ sont premiers entre eux | Unique $n$ par paire de clés |
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **RSA** | Rivest-Shamir-Adleman — Premier algorithme de cryptographie asymétrique à clé publique |
| **OAEP** | Optimal Asymmetric Encryption Padding — Schéma de rembourrage cryptographique probabiliste |
| **PSS** | Probabilistic Signature Scheme — Schéma de signature numérique RSA sécurisé |
| **MGF** | Mask Generation Function — Fonction de génération de masque utilisée dans OAEP/PSS |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Pourquoi la version brute de RSA ("Textbook RSA" : $c = m^e \pmod n$) sans schéma de rembourrage est-elle **totalement interdite** en production ?
- A) Parce qu'elle est déterministe (un même message donne toujours le même ciphertext) et vulnérable à des attaques algébriques directes comme l'extraction de racine $e$-ième si $m^e < n$
- B) Parce qu'elle s'exécute uniquement sur Linux
- C) Parce qu'elle ne fonctionne qu'avec des nombres impairs
- D) Parce qu'elle exige un réseau Wi-Fi

**Réponse : A**

**Q2 :** Quel est le rôle principal du schéma de rembourrage **OAEP (Optimal Asymmetric Encryption Padding)** dans le chiffrement RSA ?
- A) Transformer un message de taille variable en un bloc probabiliste indifférenciable d'un bruit aléatoire, immunisant RSA contre les attaques IND-CCA2 et les oracles de déchiffrement
- B) Réduire la taille du binaire
- C) Remplacer la clé privée
- D) Accélérer la vitesse de connexion Internet

**Réponse : A**

**Q3 :** Quelle vulnérabilité historique célèbre exploitait les messages d'erreur différenciés générés par le vérificateur de rembourrage **PKCS#1 v1.5** sous TLS ?
- A) L'attaque de Bleichenbacher (Padding Oracle Attack)
- B) L'attaque par injection SQL
- C) La faille Spectre/Meltdown
- D) L'attaque Man-in-the-Middle Wi-Fi

**Réponse : A**

**Q4 :** Quelle valeur d'exposant public $e$ est officiellement recommandée par le NIST et utilisée par défaut dans toutes les bibliothèques cryptographiques modernes ?
- A) $e = 65537$ ($2^{16} + 1$)
- B) $e = 3$
- C) $e = 2$
- D) $e = 100000$

**Réponse : A**

**Q5 :** Quel schéma de signature numérique RSA doit être utilisé en remplacement du vieux PKCS#1 v1.5 pour garantir la sécurité contre les attaques par forge de signature ?
- A) **RSA-PSS (Probabilistic Signature Scheme)**
- B) RSA-MD5
- C) RSA-DES
- D) RSA-Base64

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
