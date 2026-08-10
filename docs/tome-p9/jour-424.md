# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 424 (6h) : Confidentialité Web3 & Cryptographie Anonyme — Ring Signatures (Monero RingCT), Stealth Addresses, Key Images & Privacy Mixers Architecture (Tornado Cash)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'ingénierie de la confidentialité et la cryptographie anonyme dans les architectures décentralisées : comprendre le fonctionnement des **Ring Signatures (LSAG / CLSAG)** de Monero dissimulant l'émetteur au sein d'un groupe, générer des **Stealth Addresses** (adresses à usage unique dissimulant le destinataire), utiliser les **Key Images** pour prévenir le double-dépense anonyme, et disséquer l'architecture des **Privacy Mixers basés sur zk-SNARKs (Tornado Cash)**.
>
> **Compétences visées :** `WEB3-CRYPTO-07` (A) — Anonymity Protocols Architecture (Ring Signatures, Stealth Addresses & Key Images) | `WEB3-CRYPTO-08` (A) — ZK Privacy Mixers Engineering (Commitment Trees & Nullifiers)

---

## 1) Module — Ring Signatures, Stealth Addresses & Mixers Architecture (2h)

### 📖 Narration/Intuition

Par défaut, les blockchains publiques comme Bitcoin et Ethereum sont **pseudonymes et non anonymes** : l'intégralité des flux financiers et des soldes est publiquement traçable via l'analyse de graphes (Chainalysis). La cryptographie anonyme restaure la confidentialité financière fondamentale grâce à trois primitives complémentaires.

```
  ═══════════════════════════════════════════════════════════════════
    LES 3 PILIERS DE LA CONFIDENTIALITÉ MONERO (RingCT)
  ═══════════════════════════════════════════════════════════════════

  Primitive             Problème Résolu             Mécanisme Cryptographique
  ─────────             ───────────────             ─────────────────────────
  Ring Signatures       Qui est l'émetteur ?        Mélange de la vraie clé avec
                                                    N-1 clés leurres (Decoys)

  Stealth Addresses     Qui est le destinataire ?   Génération d'adresse jetable
                                                    unique via Diffie-Hellman EC

  Pedersen Commitment   Quel est le montant ?       Confidential Transactions (CT)
                        (Masquage du montant)       C = g^v * h^r mod p

  ═══════════════════════════════════════════════════════════════════
    ARCHITECTURE DES PRIVACY MIXERS ZK (TORNADO CASH)
  ═══════════════════════════════════════════════════════════════════

  [DEPOSITOR] ──► Dépôt 1 ETH + Commitment = H(Nullifier || Secret) dans Merkle Tree
                        │
                        ▼ (Rupture du lien on-chain via ZK-Proof)
  [WITHDRAWER] ◄─ Retrait 1 ETH avec zk-SNARK Proof + Nullifier (anti-double retrait)
```

---

## 2) Module — Outillage Web3 Privacy Engine (`web3_privacy_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import os
import hashlib
import secrets
import json
from datetime import datetime, timezone
from typing import List, Tuple

class Web3PrivacyEngine:
    """
    Moteur de simulation cryptographique pour les technologies de confidentialité Web3 :
    - Génération de Stealth Addresses (Diffie-Hellman Elliptic Curve)
    - Simulation des Ring Signatures avec Key Image (anti-double dépense)
    - Simulation du protocole de Mixer zk-SNARK (Nullifier Hash)
    """

    def __init__(self):
        self.spent_nullifiers = set()
        self.privacy_logs = []

    def generate_stealth_address(self, recipient_scan_pubkey: bytes, recipient_spend_pubkey: bytes) -> dict:
        """
        Génère une Stealth Address à usage unique pour un destinataire.
        1. Émetteur génère r (éphémère secret) et R = r*G (clé éphémère publique)
        2. Clé partagée S = r * ScanPubKey
        3. Stealth Address P = SpendPubKey + Hash(S)*G
        """
        r_ephemeral = secrets.token_bytes(32)
        R_ephemeral_pub = hashlib.sha256(r_ephemeral + b"EPHEMERAL_PUB").digest()
        
        # Calcul du secret partagé et de l'adresse jetable
        shared_secret = hashlib.sha256(r_ephemeral + recipient_scan_pubkey).digest()
        stealth_pubkey = hashlib.sha256(recipient_spend_pubkey + shared_secret).digest()
        stealth_address = "0x" + stealth_pubkey.hex()[-40:]

        result = {
            "ephemeral_public_key_R": R_ephemeral_pub.hex()[:16],
            "stealth_address_one_time": stealth_address,
            "anonymity": "Le destinataire réel est mathématiquement indécelable sur la blockchain"
        }
        print(f"  [STEALTH ADDR] Adresse jetable générée: {stealth_address}")
        return result

    def simulate_ring_signature_with_key_image(self, real_signer_index: int, ring_pubkeys: List[str]) -> dict:
        """
        Simule une Ring Signature (CLSAG Monero).
        Le vrai signataire produit une preuve parmi N clés leurres (decoys).
        Une Key Image unique I = x * Hash(P) est générée pour interdire la double-dépense.
        """
        print(f"\n[*] GENERATION RING SIGNATURE ({len(ring_pubkeys)} LEURRES DECOYS)")
        
        # Génération de la Key Image unique dérivée du secret du vrai signataire
        real_pubkey = ring_pubkeys[real_signer_index]
        key_image = hashlib.sha256(real_pubkey.encode() + b"KEY_IMAGE_SECRET").hexdigest()[:32]

        ring_summary = {
            "ring_size": len(ring_pubkeys),
            "real_signer_index_hidden": f"Masqué parmi {len(ring_pubkeys)} clés",
            "key_image": key_image,
            "anonymity_set": ring_pubkeys
        }
        print(f"  [+] Ring Signature valide sur {len(ring_pubkeys)} clés ! KeyImage: {key_image[:16]}...")
        return ring_summary

    def zk_mixer_deposit_and_withdraw(self, deposit_amount_eth: float) -> Tuple[dict, dict]:
        """
        Simule le fonctionnement d'un Mixer anonyme ZK (ex: Tornado Cash).
        Dépôt: Génère (Nullifier, Secret) → Commitment = Hash(Nullifier || Secret).
        Retrait: Fournit ZK-Proof + NullifierHash (le contrat vérifie le ZK-Proof et marque le Nullifier).
        """
        print(f"\n[*] PROTOCOLE ZK-MIXER (DÉPÔT & RETRAIT ANONYME — {deposit_amount_eth} ETH)")
        
        # 1. Étape de Dépôt
        nullifier = secrets.token_bytes(32)
        secret = secrets.token_bytes(32)
        commitment = hashlib.sha256(nullifier + secret).hexdigest()
        
        deposit_record = {
            "step": "DEPOSIT",
            "commitment": commitment[:24] + "...",
            "action": f"Dépôt de {deposit_amount_eth} ETH effectué sur le contrat Mixer"
        }
        print(f"  [1] DÉPÔT: Commitment inséré dans l'arbre de Merkle: {commitment[:16]}...")

        # 2. Étape de Retrait (depuis une adresse totalement neuve et non liée)
        nullifier_hash = hashlib.sha256(nullifier).hexdigest()
        
        if nullifier_hash in self.spent_nullifiers:
            raise ValueError("DOUBLE SPEND ATTEMPT DETECTED: Nullifier déjà dépensé !")
            
        self.spent_nullifiers.add(nullifier_hash)
        
        withdraw_record = {
            "step": "WITHDRAWAL",
            "nullifier_hash": nullifier_hash[:24] + "...",
            "zk_proof": "ZK-SNARK Proof Validated (Groth16)",
            "action": f"Retrait de {deposit_amount_eth} ETH vers une adresse vierge sans lien on-chain !"
        }
        print(f"  [2] RETRAIT: NullifierHash enregistré ({nullifier_hash[:16]}...) — Lien on-chain totalement rompu ✅")
        return deposit_record, withdraw_record

# Démonstration Web3 Privacy Engine
privacy = Web3PrivacyEngine()
print("=== WEB3 PRIVACY & ANONYMITY CRYPTO ENGINE ===")

# 1. Stealth Address Generation
privacy.generate_stealth_address(
    recipient_scan_pubkey=b"PUBKEY_SCAN_ALICE",
    recipient_spend_pubkey=b"PUBKEY_SPEND_ALICE"
)

# 2. Ring Signature (Monero style - Ring size 11)
decoys = [f"0xDECOY_ADDRESS_{i:02d}" for i in range(11)]
privacy.simulate_ring_signature_with_key_image(real_signer_index=3, ring_pubkeys=decoys)

# 3. ZK Mixer Deposit & Withdraw
privacy.zk_mixer_deposit_and_withdraw(deposit_amount_eth=1.0)
```

---

## 3) Module — Fiche des Cadres Réglementaires & Privacy Engineering (2h)

```markdown
# PRIVACY ENGINEERING VS CONFORMITÉ RÉGLEMENTAIRE (AML/CFT)

| Technologie | Degré d'Anonymat | Conformité Réglementaire | Mécanisme d'Auditabilité |
|:---|:---:|:---:|:---|
| **Monero (XMR)** | 🔒 Anonymat par défaut | ⚠️ Delisting des exchanges | **View Keys** (divulgation volontaire à l'auditeur) |
| **Zcash (ZEC)** | 🟡 Anonymat optionnel | ✅ Conforme (Shielded/Transparent) | **Viewing Keys** intégrées aux transactions |
| **Mixers (Tornado)** | 🔒 Anonymat total | ⚠️ Sanctions OFAC (USA) | **Proof of Innocence** (preuves ZK de non-sanction) |
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Ring Signature** | Signature numérique combinant plusieurs clés publiques leurres pour masquer le signataire réel |
| **Stealth Address** | Adresse publique jetable à usage unique empêchant la corrélation d'adresses |
| **Key Image** | Empreinte cryptographique dérivée d'une clé privée empêchant la double-dépense dans les Ring Signatures |
| **Nullifier** | Secret utilisé dans les mixers ZK pour invalider un dépôt après son retrait sans révéler son origine |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Dans la crypto-monnaie **Monero**, quel est le rôle d'une **Ring Signature (CLSAG)** ?
- A) Mélanger la clé publique du véritable émetteur avec $N-1$ clés publiques leurres (decoys) prélevées sur la blockchain, rendant mathématiquement impossible d'identifier quel membre de l'anneau est le véritable signataire
- B) Doubler la vitesse de validation des blocs
- C) Remplacer le consensus Proof-of-Work
- D) Augmenter la taille du bloc à 10 Mo

**Réponse : A**

**Q2 :** Pourquoi la création d'une **Key Image** unique est-elle obligatoire lors de l'émission d'une transaction anonyme avec Ring Signature ?
- A) Parce qu'elle empêche la double-dépense (Double-Spending) — si l'émetteur tente de réutiliser la même pièce anonyme, la même Key Image sera générée et immédiatement rejetée par le réseau
- B) Pour chiffrer l'adresse IP de l'utilisateur
- C) Pour payer les frais de minage
- D) Pour sauvegarder le portefeuille sur un HSM

**Réponse : A**

**Q3 :** Comment une **Stealth Address** protège-t-elle la vie privée du destinataire d'un paiement décentralisé ?
- A) En générant une adresse à usage unique calculée cryptographiquement via un échange Diffie-Hellman éphémère, empêchant un observateur externe de lier le paiement au profil public du destinataire
- B) En envoyant les fonds par virement bancaire SWIFT
- C) En utilisant un mot de passe temporaire
- D) En supprimant la transaction de la blockchain

**Réponse : A**

**Q4 :** Dans l'architecture d'un **Mixer ZK (ex: Tornado Cash)**, quel est le rôle du **Nullifier Hash** lors de l'étape de retrait ?
- A) Il est enregistré dans le contrat intelligent pour marquer la note comme dépensée et interdire tout second retrait, tout en étant mathématiquement uncorréllé au dépôt initial
- B) Il révèle le nom de l'utilisateur
- C) Il annule les frais de Gas
- D) Il ré-initialise la blockchain

**Réponse : A**

**Q5 :** Qu'est-ce qu'une **View Key** dans Monero Zcash ?
- A) Une clé cryptographique permettant à son détenteur (ou à un auditeur fiscal) de déchiffrer et visualiser l'ensemble des transactions d'un compte sans lui donner le pouvoir de dépenser les fonds
- B) La clé privée principale
- C) Un mot de passe pour le nœud complet
- D) Le certificat TLS du serveur

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
