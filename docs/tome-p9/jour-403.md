# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 403 (6h) : Cryptographie sur Courbes Elliptiques (ECC — ECDSA, Ed25519, Secp256k1, Échange de Clés ECDHE & ECDSA Nonce Reuse Attack Analysis)

> [!NOTE]
> **Objectif du jour :** Maîtriser la **Cryptographie sur Courbes Elliptiques (ECC)** : comprendre la géométrie des courbes elliptiques sur corps finis ($y^2 = x^3 + ax + b \pmod p$), comparer les courbes standards (**secp256k1**, **NIST P-256**, **Curve25519**), implémenter l'échange de clés éphémères **ECDHE (Elliptic Curve Diffie-Hellman Ephemeral)** pour assurer la **Forward Secrecy**, et analyser la vulnérabilité fatale de la réutilisation de nonce dans les signatures **ECDSA**.
>
> **Compétences visées :** `CRYPTO-ECC-01` (A) — Elliptic Curve Mathematics, ECDHE Key Exchange & Ed25519 Signature Engineering | `CRYPTO-ECC-02` (A) — ECDSA Nonce Reuse Cryptanalysis & Perfect Forward Secrecy (PFS) Architecture

---

## 1) Module — Géométrie des Courbes Elliptiques & Échange ECDHE (2h)

### 📖 Narration/Intuition

La cryptographie sur courbes elliptiques (ECC) offre une sécurité équivalente à RSA avec des clés **nettement plus courtes** (une clé ECC de 256 bits offre la même sécurité qu'une clé RSA de 3072 bits). Cela réduit drastiquement la consommation CPU et la bande passante réseau.

```
       ┌─────────────────────────────────────────────────────────────┐
       │             COURBE ELLIPTIQUE OVER GF(p)                    │
       │                   y² = x³ + ax + b                          │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
                   Point Addition: P + Q = R (Ligne sécante)
                   Point Doubling: P + P = 2P (Ligne tangente)
                   Scalar Multiplication: Q = k * P (Problème du Logarithme Discret)
```

#### Échange de Clés ECDHE (Elliptic Curve Diffie-Hellman Ephemeral)

Pour établir une clé de session symétrique sécurisée sur un canal non sécurisé avec **Perfect Forward Secrecy (PFS)** :

1. Alice choisit un scalaire privé aléatoire $a$ et calcule sa clé publique : $A = a \cdot G$.
2. Bob choisit un scalaire privé aléatoire $b$ et calcule sa clé publique : $B = b \cdot G$.
3. Alice et Bob échangent $A$ et $B$.
4. Alice calcule le point secret partagé : $S = a \cdot B = a \cdot (b \cdot G)$.
5. Bob calcule le même point secret partagé : $S = b \cdot A = b \cdot (a \cdot G)$.
6. La clé de session est dérivation de la coordonnée $x$ du point $S$ via HKDF : $K = \text{HKDF}(S_x)$.

---

## 2) Module — Outillage ECC Engine (`ecc_crypto_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from cryptography.hazmat.primitives.asymmetric import ec, ed25519
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

class ECCCryptoEngine:
    """
    Moteur de Cryptographie sur Courbes Elliptiques d'entreprise.
    Gère l'échange de clés ECDHE (SECP256R1 / Curve25519) et la signature Ed25519.
    """

    def __init__(self):
        self.alice_private = None
        self.alice_public = None
        self.bob_private = None
        self.bob_public = None

    def perform_ecdhe_key_exchange(self) -> bytes:
        """
        Simule l'échange de clés ECDHE entre Alice et Bob sur la courbe NIST P-256 (secp256r1).
        Dérive une clé symétrique partagée de 256 bits via HKDF-SHA256.
        """
        print("[*] Établissement de l'échange de clés éphémères ECDHE (NIST P-256)...")

        # 1. Génération des paires de clés éphémères pour Alice et Bob
        self.alice_private = ec.generate_private_key(ec.SECP256R1())
        self.alice_public = self.alice_private.public_key()

        self.bob_private = ec.generate_private_key(ec.SECP256R1())
        self.bob_public = self.bob_private.public_key()

        # 2. Calcul du secret partagé côté Alice (a * B)
        alice_shared_secret = self.alice_private.exchange(ec.ECDH(), self.bob_public)

        # 3. Calcul du secret partagé côté Bob (b * A)
        bob_shared_secret = self.bob_private.exchange(ec.ECDH(), self.alice_public)

        assert alice_shared_secret == bob_shared_secret, "Erreur : Les secrets partagés ne correspondent pas !"

        # 4. Dérivation de la clé symétrique via HKDF (SHA-256)
        derived_session_key = HKDF(
            algorithm=hashes.SHA256(),
            length=32,
            salt=None,
            info=b"ECDHE Session Key Derivation",
        ).derive(alice_shared_secret)

        print(f"  [ECDHE SUCCESS] Clé de session 256 bits dérivée : {derived_session_key.hex()[:16]}...")
        return derived_session_key

    def demonstrate_ed25519_signature(self, data: bytes) -> dict:
        """
        Démontre la signature déterministe Ed25519 (EdDSA sur Curve25519).
        Ed25519 est insensible aux attaques de réutilisation de nonce ECDSA.
        """
        priv_key = ed25519.Ed25519PrivateKey.generate()
        pub_key = priv_key.public_key()

        # Signature déterministe (aucun nonce aléatoire externe requis)
        signature = priv_key.sign(data)

        # Vérification
        pub_key.verify(signature, data)

        return {
            "curve": "Ed25519",
            "signature_hex": signature.hex(),
            "signature_length_bytes": len(signature),
            "status": "VERIFIED_VALID"
        }

# Démonstration Moteur ECC
ecc = ECCCryptoEngine()

print("=== ELLIPTIC CURVE CRYPTOGRAPHY (ECC) ENGINE DEMO ===")

# Échange ECDHE
session_key = ecc.perform_ecdhe_key_exchange()

# Signature Ed25519
sig_info = ecc.demonstrate_ed25519_signature(b"TRANSACTION_PAYLOAD_PROTECTED_BY_ED25519")
print(f"[+] Signature Ed25519 générée et vérifiée ({sig_info['signature_length_bytes']} octets)")
```

---

## 3) Module — Fiche d'Analyse de l'Attaque ECDSA Nonce Reuse (2h)

```markdown
# VULNÉRABILITÉ FATALE : ECDSA NONCE REUSE ATTACK

## 1. La Signature ECDSA
Une signature ECDSA d'un hash $m$ avec la clé privée $d$ utilise un nombre aléatoire éphémère $k$ (nonce) :

$$r = (k \cdot G)_x \pmod n$$
$$s = k^{-1} (m + r \cdot d) \pmod n$$

## 2. L'Attaque de Réutilisation du Nonce $k$
Si un attaquant identifie **deux signatures différentes** ($s_1, s_2$) générées avec le **même nonce $k$** :

$$s_1 - s_2 = k^{-1} (m_1 - m_2) \pmod n$$
$$k = \frac{m_1 - m_2}{s_1 - s_2} \pmod n$$

Une fois le nonce $k$ calculé, la clé privée $d$ de la victime est **immédiatement extraite** :

$$d = \frac{s_1 \cdot k - m_1}{r} \pmod n$$

*Conséquence : Vol complet des fonds / Identité (ex. attaque historique Sony PS3 & Bitcoin).*
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ECC** | Elliptic Curve Cryptography — Cryptographie basée sur la structure des courbes elliptiques |
| **ECDHE** | Elliptic Curve Diffie-Hellman Ephemeral — Protocole d'échange de clés éphémères garantissant la Forward Secrecy |
| **Ed25519** | Schéma de signature numérique déterministe basé sur la courbe Edwards25519 |
| **PFS** | Perfect Forward Secrecy — Propriété garantissant que la compromission d'une clé privée long-terme ne permet pas de déchiffrer les sessions passées |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quel est l'avantage principal des **courbes elliptiques (ECC)** par rapport à RSA en termes de taille de clé ?
- A) ECC offre un niveau de sécurité équivalent à RSA avec des clés considérablement plus courtes (ex: 256 bits ECC $\approx$ 3072 bits RSA), réduisant la charge CPU et réseau
- B) ECC n'utilise pas de mathématiques
- C) ECC ne fonctionne que sur les serveurs Windows
- D) ECC élimine le besoin de certificats

**Réponse : A**

**Q2 :** Quelle propriété majeure est garantie par l'utilisation de clés éphémères dans le protocole **ECDHE** lors d'un handshake TLS 1.3 ?
- A) La Perfect Forward Secrecy (PFS) — si la clé privée du serveur est volée plus tard, les sessions passées enregistrées ne peuvent pas être déchiffrées
- B) L'anonymat total de l'adresse IP
- C) La compression des données vidéo
- D) L'élimination des attaques DDoS

**Réponse : A**

**Q3 :** Quelle est la conséquence d'une **réutilisation du nonce aléatoire $k$** lors de la génération de deux signatures **ECDSA** distinctes sous la même clé privée ?
- A) Un attaquant peut calculer algébriquement la clé privée de la victime et compromettre totalement l'identité ou les fonds
- B) La signature devient invalide
- C) Le serveur redémarre
- D) La taille du fichier augmente

**Réponse : A**

**Q4 :** Pourquoi l'algorithme de signature **Ed25519 (EdDSA)** est-il considéré comme plus sûr que l'ECDSA traditionnel ?
- A) Parce qu'il dérive son nonce de manière déterministe à partir du message et de la clé privée, éliminant totalement le risque de réutilisation de nonce due à un mauvais générateur d'aléatoire
- B) Parce qu'il utilise le protocole FTP
- C) Parce qu'il est payant
- D) Parce qu'il exige un processeur Intel

**Réponse : A**

**Q5 :** Quelle courbe elliptique est universellement utilisée dans le protocole **Bitcoin** et les blockchains basées sur Secp256k1 ?
- A) Koblitz Curve secp256k1
- B) NIST P-384
- C) RSA-2048
- D) Curve448

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
