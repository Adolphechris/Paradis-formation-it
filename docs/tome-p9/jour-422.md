# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 422 (6h) : Cryptographie des Portefeuilles & MPC — HD Wallets (BIP32/39/44), Shamir Secret Sharing (SLIP-0039) & Threshold Signatures (FROST / ECDSA TSS)

> [!NOTE]
> **Objectif du jour :** Maîtriser les architectures cryptographiques de conservation d'actifs numériques (Custody & Wallet Security) : disséquer la dérivation des **Hierarchical Deterministic Wallets (BIP32/BIP39/BIP44)** (Entropy → Mnemonic Seed → Master Key → Derived Paths), mettre en œuvre la sauvegarde de clés secrètes via **Shamir Backup (SLIP-0039)**, et concevoir des architectures de signature de seuil **MPC (Multi-Party Computation — Threshold ECDSA & FROST)** éliminant le point unique de défaillance (Single Point of Failure).
>
> **Compétences visées :** `WEB3-CRYPTO-03` (A) — HD Wallet Key Derivation (BIP32/39/44 Path Engineering) & SLIP-0039 Shamir Backup | `WEB3-CRYPTO-04` (A) — Threshold Cryptography Architecture (MPC-TSS vs Multi-Sig) & FROST Schnorr Threshold Signatures

---

## 1) Module — HD Wallets Architecture (BIP32/39/44) & MPC TSS (2h)

### 📖 Narration/Intuition

La conservation sécurisée des clés privées est le cœur de la finance décentralisée et de la garde d'actifs institutionnels. Une seule seed phrase de 12 ou 24 mots (BIP39) permet de dériver des milliards de clés privées de manière déterministe (BIP32) selon des arborescences normalisées (BIP44). Les institutions remplacent aujourd'hui la clé privée unique par le **Multi-Party Computation (MPC-TSS)**, où $N$ fragments de clés conservés par des entités distinctes collaborent pour signer des transactions sans jamais reconstituer la clé complète en mémoire.

```
  ═══════════════════════════════════════════════════════════════════
    1. ARBORESCENCE DE DÉRIVATION HD WALLET (BIP32 / BIP39 / BIP44)
  ═══════════════════════════════════════════════════════════════════

  Entropie (128 - 256 bits) ──► PBKDF2 (SHA-512) ──► Mnemonic 24 Mots (BIP39)
                                                         │
                                                         ▼
                                                  Master Seed (512 bits)
                                                         │
                                                         ▼
                                             Master Private Key (m)
                                                         │
                                  ┌──────────────────────┴──────────────────────┐
                                  │ Path: m/44'/60'/0'/0 (BIP44 Ethereum)        │
                                  ▼                                             ▼
                        Clé Compte 0 (m/44'/60'/0'/0/0)              Clé Compte 1 (m/44'/60'/0'/0/1)

  ═══════════════════════════════════════════════════════════════════
    2. MPC THRESHOLD SIGNATURES (MPC-TSS) VS MULTI-SIG
  ═══════════════════════════════════════════════════════════════════

  ┌─────────────────────────────────┬──────────────────────────────────┐
  │ Multi-Sig (On-Chain)            │ MPC-TSS (Off-Chain Threshold)    │
  ├─────────────────────────────────┼──────────────────────────────────┤
  │ Visible publiquement sur la     │ Signature unique 100% indistin-  │
  │ blockchain (plusieurs sigs)     │ guable d'une signature standard  │
  │ Frais de Gas élevés (multi-sig) │ Frais de Gas minimaux (1 sig)    │
  │ Spécifique au Smart Contract    │ Agnostique à toute blockchain   │
  └─────────────────────────────────┴──────────────────────────────────┘
```

---

## 2) Module — Outillage HD Wallet & MPC Simulator (`hd_wallet_mpc_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import os
import hashlib
import hmac
import json
from datetime import datetime, timezone
from typing import List, Tuple

class HDWalletMPCEngine:
    """
    Moteur de simulation cryptographique pour la dérivation HD Wallet (BIP32/39)
    et les signatures de seuil MPC (Multi-Party Computation).
    """

    # Dictionnaire simplifié de 8 mots pour la démo BIP39 (en prod: 2048 mots officiels)
    BIP39_WORDLIST_MINI = [
        "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract"
    ]

    def __init__(self):
        self.wallet_log = []

    def generate_bip39_mnemonic_simulation(self, entropy_bytes: int = 16) -> Tuple[str, bytes]:
        """
        Simule la génération d'un Mnemonic BIP39 depuis de l'entropie brute.
        128 bits d'entropie + 4 bits de Checksum (SHA-256) → 12 Mots.
        """
        entropy = os.urandom(entropy_bytes)
        checksum = hashlib.sha256(entropy).digest()[0] >> 4
        
        # Encodage simplifié en mots de la wordlist
        words = []
        for i in range(12):
            idx = (entropy[i % len(entropy)] + checksum + i) % len(self.BIP39_WORDLIST_MINI)
            words.append(self.BIP39_WORDLIST_MINI[idx])

        mnemonic_str = " ".join(words)
        seed = hashlib.pbkdf2_hmac("sha512", mnemonic_str.encode(), b"mnemonic", iterations=2048)

        print(f"  [BIP39] Mnemonic généré (12 mots): '{mnemonic_str}'")
        print(f"  [BIP39] Master Seed 512-bit: {seed.hex()[:32]}...")
        return mnemonic_str, seed

    def derive_bip32_child_key(self, master_seed: bytes, path: str) -> dict:
        """
        Simule la dérivation déterministe d'une clé enfant selon un chemin BIP44 (ex: m/44'/60'/0'/0/0).
        """
        # HMAC-SHA512("Bitcoin seed", MasterSeed) -> (Master Key, Chain Code)
        h = hmac.new(b"Bitcoin seed", master_seed, hashlib.sha512).digest()
        master_private_key = h[:32]
        chain_code = h[32:]

        # Simulation de la dérivation du chemin
        derived_key = hashlib.sha256(master_private_key + path.encode() + chain_code).digest()
        address = "0x" + hashlib.sha256(derived_key).hexdigest()[-40:]

        result = {
            "path": path,
            "derived_private_key": derived_key.hex()[:16] + "...[REDACTED]",
            "derived_address": address
        }
        print(f"  [BIP32/44] Path '{path}' → Adresse dérivée: {address}")
        return result

    def simulate_mpc_threshold_signing(self, t_threshold: int, n_parties: int, transaction_hash: bytes) -> dict:
        """
        Simule une signature de seuil MPC-TSS (Threshold ECDSA / FROST).
        t parties parmi n collaborent pour produire une signature valide unique.
        """
        print(f"\n[*] SIGNATURE DE SEUIL MPC-TSS: Quorum {t_threshold}/{n_parties} parties")
        
        selected_parties = [f"PARTY_{i+1}" for i in range(t_threshold)]
        
        # Chaque partie produit une partial signature share avec sa part de secret
        partial_shares = []
        for party in selected_parties:
            share = hashlib.sha256(transaction_hash + party.encode()).digest()
            partial_shares.append(share)
            print(f"  [MPC] Partial Share générée par {party}")

        # Agrégation des t shares sans reconstituer la clé privée maître
        aggregated_sig = hashlib.sha256(b"".join(partial_shares)).hexdigest()
        
        mpc_result = {
            "status": "MPC_THRESHOLD_SIGNATURE_SUCCESS",
            "threshold": f"{t_threshold}-of-{n_parties}",
            "participating_parties": selected_parties,
            "aggregated_signature": aggregated_sig[:32] + "...",
            "on_chain_gas_cost": "Standard 1-Sig Gas Cost (Minimal)"
        }
        print(f"  [+] Signature MPC agrégée avec succès ! (1-Sig On-Chain) ✅")
        return mpc_result

# Démonstration HD Wallet & MPC Engine
engine = HDWalletMPCEngine()
print("=== HD WALLET & MPC CRYPTO ENGINE ===")

# 1. Génération BIP39 & Dérivation BIP44
mnemonic, seed = engine.generate_bip39_mnemonic_simulation()
engine.derive_bip32_child_key(seed, "m/44'/60'/0'/0/0")  # Compte Ethereum 0
engine.derive_bip32_child_key(seed, "m/44'/60'/0'/0/1")  # Compte Ethereum 1

# 2. Signature MPC Threshold (3-of-5)
tx_hash = hashlib.sha256(b"Transfer 100 ETH to 0x1234...").digest()
engine.simulate_mpc_threshold_signing(t_threshold=3, n_parties=5, transaction_hash=tx_hash)
```

---

## 3) Module — Fiche de Comparaison Guard Solutions (2h)

```markdown
# COMPARAISON DES SOLUTIONS DE GARDE D'ACTIFS NUMÉRIQUES (CUSTODY)

| Critère | Portefeuille Mono-Clé (Hardware Wallet) | Multi-Sig Smart Contract | MPC-TSS Threshold (Fireblocks/DFNS) |
|:---|:---:|:---:|:---:|
| **Point unique de défaillance (SPOF)** | ⚠️ OUI (Si clé perdue/volée) | ✅ NON (N-of-M keys) | ✅ NON (N-of-M key shares) |
| **Gouvernance & Quorum** | Une seule personne | Définie par le contrat | Définie par politique off-chain |
| **Frais de Gas** | Faibles (1-Sig) | ⚠️ Élevés (N signatures) | 🚀 Faibles (1-Sig finale) |
| **Compatibilité Blockchain** | Universelle | ⚠️ Limitée aux blockchains EVM/Wasm | 🚀 Universelle (BTC, ETH, Solana...) |
| **Révocation de Part** | Remplacement complet | Via transaction smart contract | ✅ Instantané (Key Refresh) |
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **BIP39** | Bitcoin Improvement Proposal 39 — Standard de génération des mnemonics de 12 à 24 mots |
| **BIP44** | Bitcoin Improvement Proposal 44 — Structure hiérarchique des chemins de dérivation multi-comptes |
| **MPC-TSS** | Multi-Party Computation Threshold Signature Scheme — Signature de seuil distribuée off-chain |
| **FROST** | Flexible Round-Optimized Schnorr Threshold Signatures — Standard moderne de signature de seuil |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Dans la norme **BIP44**, quelle est la signification du chemin de dérivation standard `m/44'/60'/0'/0/0` pour un portefeuille Ethereum ?
- A) `44'` (Purpose BIP44), `60'` (Coin Type Ethereum), `0'` (Account 0), `0` (External Change chain), `0` (Index du 1er compte)
- B) `44'` (44 mots), `60'` (60 secondes), `0'` (0 frais)
- C) C'est un code secret aléatoire
- D) C'est l'adresse IP du nœud Ethereum

**Réponse : A**

**Q2 :** Quel est le principal avantage d'une signature de seuil **MPC-TSS** par rapport à une signature **Multi-Sig Smart Contract** ?
- A) MPC-TSS produit une signature unique standard off-chain indistinguable d'une signature classique, réduisant drastiquement les frais de Gas et offrant une compatibilité universelle sur toutes les blockchains
- B) MPC-TSS nécessite l'accord de la banque centrale
- C) Multi-Sig n'est plus supporté par Ethereum
- D) MPC-TSS enregistre les mots clés en clair

**Réponse : A**

**Q3 :** Que permet le mécanisme de **Key Refresh** dans une architecture MPC-TSS sans modifier l'adresse publique du portefeuille ?
- A) Redistribuer de nouveaux fragments secrets (shares) cryptographiques à chaque participant de telle sorte que d'anciens fragments volés deviennent instantanément inutilisables
- B) Changer le mot de passe du serveur
- C) Réduire les frais de transaction
- D) Ré-initialiser la blockchain

**Réponse : A**

**Q4 :** Quelle norme permet d'effectuer des sauvegardes de mots mnémotechniques fragmentés en plusieurs parts via Shamir Secret Sharing (**Shamir Backup**) ?
- A) **SLIP-0039** (utilisé par Trezor Model T)
- B) BIP32
- C) ERC-20
- D) FIPS 140-2

**Réponse : A**

**Q5 :** Dans la génération d'un Mnemonic **BIP39**, à quoi sert l'ajout de 4 à 8 bits de **Checksum** issus du SHA-256 de l'entropie initiale ?
- A) Permettre aux portefeuilles de détecter immédiatement une faute d'orthographe ou une erreur dans la saisie des 12 ou 24 mots par l'utilisateur
- B) Rendre le mot de passe plus long
- C) Chiffrer la transaction
- D) Remplacer la clé privée

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
