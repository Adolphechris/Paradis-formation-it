# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 414 (6h) : Signal Protocol & Double Ratchet Algorithm — End-to-End Encryption (E2EE), Forward Secrecy & Break-in Recovery

> [!NOTE]
> **Objectif du jour :** Comprendre et implémenter les fondements cryptographiques du **Signal Protocol** — le protocole de messagerie E2EE le plus sécurisé au monde, utilisé par Signal, WhatsApp et Google Messages. Maîtriser le **Double Ratchet Algorithm** (combinaison de la Symmetric Ratchet et du Diffie-Hellman Ratchet), l'échange de clés initial **X3DH (Extended Triple Diffie-Hellman)**, les garanties de **Perfect Forward Secrecy** (les clés passées restent sécurisées même si la clé courante est compromise) et de **Break-in Recovery** (Future Secrecy).
>
> **Compétences visées :** `E2EE-ADV-01` (A) — Signal Protocol Internals : X3DH Key Agreement & Double Ratchet Algorithm (DH Ratchet + Symmetric Ratchet) | `E2EE-ADV-02` (A) — Forward Secrecy, Break-in Recovery & Post-Quantum Signal Protocol Adaptations

---

## 1) Module — X3DH Key Agreement & Double Ratchet Anatomy (2h)

### 📖 Narration/Intuition

Le Signal Protocol résout le problème le plus difficile de la cryptographie appliquée : comment deux personnes sans connexion simultanée peuvent établir une session chiffrée parfaitement sécurisée, avec des garanties que même la compromission future de leur dispositif ne permettra pas de déchiffrer les messages passés ?

```
  ═══════════════════════════════════════════════════════════════
  X3DH — EXTENDED TRIPLE DIFFIE-HELLMAN (Établissement Initial)
  ═══════════════════════════════════════════════════════════════

  ALICE (Initiateur)                  BOB (Préchargé sur Serveur Signal)
  ──────────────────                  ────────────────────────────────────
  IK_A (Identity Key)                 IK_B (Identity Key)
  EK_A (Ephemeral Key)                SPK_B (Signed PreKey — rotation hebdo)
                                      OPK_B (One-Time PreKey — usage unique)

  DH1 = DH(IK_A, SPK_B)   ←── Authentification réciproque
  DH2 = DH(EK_A, IK_B)    ←── Authentification réciproque
  DH3 = DH(EK_A, SPK_B)   ←── Forward Secrecy
  DH4 = DH(EK_A, OPK_B)   ←── One-Time PreKey (usage unique anti-replay)

  SK = KDF(DH1 || DH2 || DH3 || DH4) ← Clé de session maître

  ═══════════════════════════════════════════════════════════════
  DOUBLE RATCHET — CHAQUE MESSAGE A UNE CLÉ UNIQUE
  ═══════════════════════════════════════════════════════════════

  [RK] Root Key ─────┐
                     ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ DH RATCHET (avance à chaque échange de nouvelle clé DH)     │
  │ RK, CK_send = KDF_RK(RK, DH(DHratchet_A, DHratchet_B))     │
  └───────────────────────┬─────────────────────────────────────┘
                          │
                          ▼ CK_send (Chain Key)
  ┌─────────────────────────────────────────────────────────────┐
  │ SYMMETRIC RATCHET (avance pour chaque message envoyé)        │
  │ MK_1 = KDF(CK, "message_key")  → Chiffre MSG #1             │
  │ MK_2 = KDF(MK_1, "ratchet")    → Chiffre MSG #2             │
  │ MK_n → Chiffre MSG #n           (chaque message: clé unique)│
  └─────────────────────────────────────────────────────────────┘
```

#### Propriétés de Sécurité du Double Ratchet

| Propriété | Mécanisme | Garantie |
|:---|:---|:---|
| **Perfect Forward Secrecy** | DH Ratchet + Symmetric Ratchet | Compromission de la clé actuelle → messages passés inviolés |
| **Break-in Recovery** | Nouveau DH Ratchet à chaque réponse | Compromission temporaire → clés futures sécurisées automatiquement |
| **Message Key Uniqueness** | KDF symétrique par message | Chaque message a une clé de 32 octets unique et jetable |

---

## 2) Module — Outillage Double Ratchet Simulator (`signal_protocol_simulator.py`) (2h)

### 🛠️ Atelier Pratique

```python
import os
import hashlib
import hmac
import json
from dataclasses import dataclass, field
from typing import Optional, Tuple, List
from cryptography.hazmat.primitives.asymmetric.x25519 import X25519PrivateKey, X25519PublicKey
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# ─── Primitives Cryptographiques ───────────────────────────────────────────────

def generate_x25519_keypair():
    """Génère une paire de clés Curve25519 (X25519) — le standard Signal Protocol."""
    private_key = X25519PrivateKey.generate()
    public_key = private_key.public_key()
    return private_key, public_key

def x25519_dh(private_key: X25519PrivateKey, public_key: X25519PublicKey) -> bytes:
    """Calcul DH(priv, pub) sur Curve25519 → 32 octets partagés."""
    return private_key.exchange(public_key)

def kdf_rk(root_key: bytes, dh_output: bytes) -> Tuple[bytes, bytes]:
    """
    KDF de dérivation du Root Key (DH Ratchet).
    Retourne (nouveau Root Key, nouvelle Chain Key).
    """
    info_rk = b"WhisperRatchet"
    hkdf = HKDF(algorithm=hashes.SHA256(), length=64, salt=root_key, info=info_rk)
    output = hkdf.derive(dh_output)
    return output[:32], output[32:]   # (RK, CK)

def kdf_ck(chain_key: bytes) -> Tuple[bytes, bytes]:
    """
    KDF de dérivation de la Chain Key (Symmetric Ratchet).
    Retourne (nouvelle Chain Key, Message Key).
    """
    message_key = hmac.new(chain_key, b"\x01", "sha256").digest()
    next_chain_key = hmac.new(chain_key, b"\x02", "sha256").digest()
    return next_chain_key, message_key

def encrypt_message(message_key: bytes, plaintext: str, associated_data: bytes = b"") -> bytes:
    """Chiffrement AES-256-GCM avec la Message Key du Double Ratchet."""
    aes_key = message_key[:32]
    nonce = os.urandom(12)
    aesgcm = AESGCM(aes_key)
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode(), associated_data)
    return nonce + ciphertext

def decrypt_message(message_key: bytes, ciphertext: bytes, associated_data: bytes = b"") -> str:
    """Déchiffrement AES-256-GCM avec la Message Key du Double Ratchet."""
    aes_key = message_key[:32]
    nonce, ct = ciphertext[:12], ciphertext[12:]
    aesgcm = AESGCM(aes_key)
    return aesgcm.decrypt(nonce, ct, associated_data).decode()

# ─── Double Ratchet State ───────────────────────────────────────────────────────

@dataclass
class DoubleRatchetSession:
    """
    Session Double Ratchet — implémentation pédagogique complète.
    Chaque pair maintient son propre état de ratchet.
    """
    name: str
    root_key: bytes
    # DH Ratchet state
    dh_sending_private: Optional[X25519PrivateKey] = None
    dh_sending_public: Optional[X25519PublicKey] = None
    dh_receiving_public: Optional[X25519PublicKey] = None
    # Symmetric Ratchet state
    chain_key_send: Optional[bytes] = None
    chain_key_recv: Optional[bytes] = None
    messages_sent: int = 0
    messages_received: int = 0
    session_log: List[dict] = field(default_factory=list)

    def advance_dh_ratchet(self, their_new_public_key: X25519PublicKey):
        """
        Avance le DH Ratchet : génère une nouvelle paire de clés DH,
        calcule le nouveau Root Key et les nouvelles Chain Keys.
        """
        # Nouveau DH avec la clé publique reçue
        if self.dh_sending_private:
            dh_out = x25519_dh(self.dh_sending_private, their_new_public_key)
            self.root_key, self.chain_key_recv = kdf_rk(self.root_key, dh_out)

        # Génération d'une nouvelle paire DH pour la direction d'envoi
        self.dh_sending_private, self.dh_sending_public = generate_x25519_keypair()
        dh_out2 = x25519_dh(self.dh_sending_private, their_new_public_key)
        self.root_key, self.chain_key_send = kdf_rk(self.root_key, dh_out2)
        self.dh_receiving_public = their_new_public_key

        print(f"  [{self.name}] 🔄 DH Ratchet avancé — Nouveau Root Key dérivé")

    def send_message(self, plaintext: str) -> Tuple[bytes, bytes]:
        """Envoie un message chiffré, avançant la Symmetric Ratchet."""
        self.chain_key_send, message_key = kdf_ck(self.chain_key_send)
        ciphertext = encrypt_message(message_key, plaintext)
        self.messages_sent += 1
        header = self.dh_sending_public.public_bytes(
            serialization.Encoding.Raw, serialization.PublicFormat.Raw
        )
        self.session_log.append({"direction": "SEND", "msg_n": self.messages_sent, "mk_hash": hashlib.sha256(message_key).hexdigest()[:8]})
        print(f"  [{self.name}] ✉ MSG #{self.messages_sent} chiffré — MK: {hashlib.sha256(message_key).hexdigest()[:16]}...")
        return header, ciphertext

    def receive_message(self, header: bytes, ciphertext: bytes) -> str:
        """Reçoit et déchiffre un message, avançant la Symmetric Ratchet de réception."""
        # Lecture de la clé publique DH de l'expéditeur depuis le header
        their_dh_pub = X25519PublicKey.from_public_bytes(header)
        self.chain_key_recv, message_key = kdf_ck(self.chain_key_recv)
        plaintext = decrypt_message(message_key, ciphertext)
        self.messages_received += 1
        print(f"  [{self.name}] 📨 MSG #{self.messages_received} déchiffré — MK: {hashlib.sha256(message_key).hexdigest()[:16]}...")
        return plaintext

# Démonstration Double Ratchet
print("=== SIGNAL PROTOCOL — DOUBLE RATCHET SIMULATOR ===")

# 1. Établissement de la session partagée (X3DH simulé → Clé partagée initiale)
shared_secret = os.urandom(32)
alice = DoubleRatchetSession("Alice", shared_secret)
bob = DoubleRatchetSession("Bob", shared_secret)

# 2. Initialisation : Alice génère sa première paire DH
alice.dh_sending_private, alice.dh_sending_public = generate_x25519_keypair()
alice.chain_key_send = shared_secret

# Bob initialise avec la clé publique d'Alice et sa propre chain key
bob.chain_key_recv = shared_secret
bob.dh_receiving_public = alice.dh_sending_public
bob.dh_sending_private, bob.dh_sending_public = generate_x25519_keypair()
bob.chain_key_send = shared_secret

# 3. Échange de messages sécurisés
print("\n--- Alice envoie 3 messages à Bob ---")
header1, ct1 = alice.send_message("Salut Bob ! Comment vas-tu ?")
header2, ct2 = alice.send_message("Notre réunion de sécurité est confirmée pour demain.")
header3, ct3 = alice.send_message("J'ai les résultats du pen-test.")

print("\n--- Bob déchiffre les messages d'Alice ---")
msg1 = bob.receive_message(header1, ct1)
msg2 = bob.receive_message(header2, ct2)
msg3 = bob.receive_message(header3, ct3)
print(f"  [Bob] Reçu: '{msg1}'")
print(f"  [Bob] Reçu: '{msg2}'")
print(f"  [Bob] Reçu: '{msg3}'")
```

---

## 3) Module — Fiche Break-in Recovery & Adaptations Post-Quantique (2h)

```markdown
# SIGNAL PROTOCOL — PROPRIÉTÉS AVANCÉES

## 1. Break-in Recovery (Future Secrecy)
Si un attaquant compromise le dispositif d'Alice et obtient son état de ratchet courant :
- Il peut déchiffrer les messages **futurs** jusqu'au prochain DH Ratchet.
- Dès que Bob répond avec un nouveau message (nouveau DH public key dans le header),
  Alice avance le DH Ratchet → Les nouvelles clés sont **cryptographiquement indépendantes** de l'état compromis.

## 2. Différence Forward Secrecy vs Break-in Recovery
| Propriété | Signal Protocol | TLS 1.3 PFS |
|:---|:---:|:---:|
| **Forward Secrecy** | ✅ (Symmetric Ratchet par message) | ✅ (ECDHE par session) |
| **Break-in Recovery** | ✅ (DH Ratchet à chaque échange) | ❌ (Non — si clé de session compromise, toute la session est compromise) |

## 3. Adaptation Post-Quantique (PQXDH)
Signal a publié **PQXDH (Post-Quantum Extended Diffie-Hellman)** qui remplace X3DH
par une combinaison **Curve25519 + CRYSTALS-Kyber (FIPS 203 — ML-KEM)** pour résister
aux attaques des ordinateurs quantiques via Harvest-Now-Decrypt-Later.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **X3DH** | Extended Triple Diffie-Hellman — Protocole d'établissement de session du Signal Protocol |
| **Double Ratchet** | Algorithme combinant DH Ratchet et Symmetric Ratchet pour E2EE avec Forward Secrecy et Break-in Recovery |
| **E2EE** | End-to-End Encryption — Chiffrement de bout en bout où seuls les participants peuvent lire les messages |
| **PQXDH** | Post-Quantum Extended Diffie-Hellman — Adaptation du X3DH résistante aux ordinateurs quantiques |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle est la principale différence entre le **DH Ratchet** et la **Symmetric Ratchet** dans le Double Ratchet Algorithm ?
- A) Le DH Ratchet avance lors de chaque échange de nouvelle clé DH entre les pairs (apportant du matériel aléatoire frais via Curve25519), tandis que la Symmetric Ratchet avance pour chaque message individuellement en dérivant une nouvelle clé unique
- B) Le DH Ratchet chiffre le message et la Symmetric Ratchet le déchiffre
- C) Ce sont deux noms pour le même mécanisme
- D) La Symmetric Ratchet est utilisée pour les fichiers joints et le DH Ratchet pour les textes

**Réponse : A**

**Q2 :** Pourquoi le protocole **X3DH** utilise-t-il des **One-Time PreKeys (OPK)** qui ne sont utilisées qu'une seule fois ?
- A) Pour garantir que même si la Signed PreKey de Bob est compromise, les sessions précédemment initiées avec une OPK différente restent sécurisées (chaque OPK crée un secret DH indépendant)
- B) Pour des raisons de compatibilité avec les anciens téléphones
- C) Pour accélérer le handshake initial
- D) Pour réduire la taille des clés

**Réponse : A**

**Q3 :** En quoi le **Break-in Recovery** du Signal Protocol surpasse-t-il la Perfect Forward Secrecy de TLS 1.3 ?
- A) Si l'état d'une session Signal est compromis, dès le prochain échange de message, le DH Ratchet génère de nouvelles clés cryptographiquement indépendantes — TLS 1.3 n'offre pas cette propriété au niveau intra-session
- B) Signal est plus rapide que TLS 1.3
- C) TLS 1.3 n'offre aucune forme de Forward Secrecy
- D) Le Break-in Recovery est uniquement une propriété marketing de Signal

**Réponse : A**

**Q4 :** Quel algorithme post-quantique est utilisé dans **PQXDH** pour remplacer l'échange de clés Diffie-Hellman classique ?
- A) **CRYSTALS-Kyber (ML-KEM — FIPS 203)** combiné à Curve25519 pour une approche hybride classique + post-quantique
- B) RSA-8192
- C) SHA-3-512
- D) Diffie-Hellman Group 20

**Réponse : A**

**Q5 :** Pourquoi chaque message du Double Ratchet dispose-t-il d'une **Message Key unique** dérivée de la Chain Key ?
- A) Parce que si une Message Key individuelle est compromise (ex: side-channel), seul ce message unique est exposé — les autres messages de la conversation restent protégés par leurs propres Message Keys indépendantes
- B) Pour être compatible avec les versions mobiles de Signal
- C) Pour réduire la latence de chiffrement
- D) Parce que le serveur Signal conserve les Message Keys

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
