# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 421 (6h) : Cryptographie des Smart Contracts — Malleabilité de Signature ECDSA, Replay Attacks (EIP-712), `ecrecover` Vulnerabilities & Reentrancy Mitigations

> [!NOTE]
> **Objectif du jour :** Maîtriser l'analyse des vulnérabilités cryptographiques dans les **Smart Contracts (Solidity/EVM)** : disséquer la **Malléabilité de Signature ECDSA (secp256k1)** et la restriction de la valeur $s$ ($s \le n/2$), auditer la fonction EVM `ecrecover` (retour de l'adresse zero `0x0` sur échec), prévenir les **Replay Attacks multi-chaînes via EIP-712** (Domain Separator & ChainID), et implémenter la protection anti-réentrance avec des verrous cryptographiques.
>
> **Compétences visées :** `WEB3-CRYPTO-01` (A) — EVM ECDSA Malleability Mitigation ($s$-value validation) & `ecrecover` Zero-Address Protection | `WEB3-CRYPTO-02` (A) — EIP-712 Structured Data Hashing, Cross-Chain Replay Attack Prevention & Reentrancy Guards

---

## 1) Module — ECDSA Malleability & EIP-712 Architecture (2h)

### 📖 Narration/Intuition

En cryptographie Web3 (Ethereum / secp256k1), une signature ECDSA est composée de la paire $(r, s)$. Du fait de la symétrie de la courbe elliptique, pour toute signature valide $(r, s)$, la paire $(r, n - s) \pmod n$ est également une signature **strictement valide pour le même message et la même clé publique** ! Si un Smart Contract ne vérifie pas la borne supérieure de $s$, un attaquant peut créer une deuxième signature valide et contourner les contrôles de rejeu basés sur le hash de la signature.

```
  ═══════════════════════════════════════════════════════════════════
    1. ECDSA SIGNATURE MALLEABILITY (secp256k1)
  ═══════════════════════════════════════════════════════════════════

  Signature Valide 1 :  (r, s)       ──► Valide sur ecrecover(hash, v, r, s)
  Signature Valide 2 :  (r, n - s)   ──► ÉGALEMENT Valide sur ecrecover(hash, v', r, n-s) !

  ⚠️ VULNÉRABILITÉ : Si le contrat enregistre hash(sig1) comme "utilisé",
  l'attaquant soumet sig2 (qui produit un hash(sig2) différent) et rejoue la transaction !

  ✅ REMÉDIATION (EIP-2 / OpenZeppelin ECDSA) :
  Exiger impérativement : s <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0

  ═══════════════════════════════════════════════════════════════════
    2. ARCHITECTURE EIP-712 (PREVENTION DES REPLAY ATTACKS)
  ═══════════════════════════════════════════════════════════════════

  Hash EIP-712 = keccak256(
      "\x19\x01" || DOMAIN_SEPARATOR || structHash
  )

  DOMAIN_SEPARATOR = keccak256(
      typeHash || nameHash || versionHash || chainId || verifyingContract
  )

  Le ChainID et l'adresse du contrat empêchent le rejeu de la signature
  sur une autre blockchain (ex: Ethereum vs Polygon vs Arbitrum) !
```

---

## 2) Module — Outillage Smart Contract Crypto Auditor (`evm_crypto_auditor.py`) (2h)

### 🛠️ Atelier Pratique

```python
import eth_utils
from eth_keys import keys
import secrets
import json
from datetime import datetime, timezone

class EVMCryptoAuditor:
    """
    Auditeur de sécurité cryptographique pour Smart Contracts Ethereum :
    - Détection de la malléabilité des signatures ECDSA secp256k1 ($s > n/2$)
    - Validation du retour ecrecover (Zero-Address Check)
    - Construction et vérification de Hash EIP-712
    """

    # Constante de l'ordre de la courbe secp256k1 (n)
    SECP256K1_N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
    # Borne supérieure autorisée pour s (n/2) selon EIP-2
    SECP256K1_HALF_N = 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0

    def __init__(self):
        self.audit_results = []

    def validate_ecdsa_s_value(self, s: int) -> dict:
        """
        Vérifie la conformité EIP-2 de la valeur 's' d'une signature ECDSA.
        Empêche l'attaque par malléabilité de signature.
        """
        if s > self.SECP256K1_HALF_N:
            malleable_s = self.SECP256K1_N - s
            result = {
                "status": "MALLEABLE_SIGNATURE_VULNERABILITY",
                "severity": "HIGH",
                "s_value": hex(s),
                "malleable_equivalent_s": hex(malleable_s),
                "remediation": "Rejeter la signature si s > secp256k1_n/2 (Utiliser OpenZeppelin ECDSA library)."
            }
            print(f"  [!] VULNÉRABILITÉ ECDSA: Valeur s > n/2 ! (Signature malléable détectée)")
        else:
            result = {
                "status": "SECURE_EIP2_COMPLIANT",
                "s_value": hex(s),
                "remediation": "Conforme — s dans la borne inférieure."
            }
            print(f"  [+] Signature ECDSA conforme EIP-2 (s <= n/2) ✅")

        self.audit_results.append(result)
        return result

    def simulate_ecrecover_zero_address_audit(self, signer_address: str) -> dict:
        """
        Audite la vérification d'adresse retournée par ecrecover.
        ecrecover retourne 0x0000000000000000000000000000000000000000 si la signature est invalide !
        Si le contrat ne vérifie pas `require(signer != address(0))`, n'importe quelle signature invalide passe !
        """
        ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
        
        if signer_address == ZERO_ADDRESS:
            result = {
                "status": "ZERO_ADDRESS_BYPASS_VULNERABILITY",
                "severity": "CRITICAL",
                "remediation": "Ajouter impérativement: require(signer != address(0), 'ECDSA: invalid signature');"
            }
            print(f"  [!] CRITICAL: ecrecover a retourné l'adresse ZERO ! Bypass potentiel de signature !")
        else:
            result = {"status": "VALID_SIGNER", "signer": signer_address}
            print(f"  [+] Signataire authentifié: {signer_address}")

        return result

    def generate_eip712_domain_separator(self, name: str, version: str, chain_id: int, verifying_contract: str) -> str:
        """
        Calcule le DOMAIN_SEPARATOR EIP-712 pour la protection anti-rejeu multi-chaînes.
        """
        type_hash = eth_utils.keccak(b"EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")
        name_hash = eth_utils.keccak(name.encode())
        version_hash = eth_utils.keccak(version.encode())
        contract_bytes = bytes.fromhex(verifying_contract.replace("0x", "").zfill(40))
        chain_bytes = chain_id.to_bytes(32, "big")

        encoded = type_hash + name_hash + version_hash + chain_bytes + b"\x00" * 12 + contract_bytes
        domain_separator = eth_utils.keccak(encoded)

        print(f"  [EIP-712] DomainSeparator (ChainID={chain_id}): {domain_separator.hex()[:24]}...")
        return domain_separator.hex()

# Démonstration EVM Crypto Auditor
auditor = EVMCryptoAuditor()
print("=== EVM SMART CONTRACT CRYPTO AUDITOR ===")

# 1. Audit Malléabilité Signature ECDSA
# Exemple d'une valeur 's' supérieure à n/2 (Malléable)
high_s = 0x8FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0
auditor.validate_ecdsa_s_value(high_s)

# 2. Audit ecrecover Zero-Address Bypass
auditor.simulate_ecrecover_zero_address_audit("0x0000000000000000000000000000000000000000")

# 3. Génération Domain Separator EIP-712
auditor.generate_eip712_domain_separator(
    name="ParadisBankVault",
    version="1",
    chain_id=1,  # Ethereum Mainnet
    verifying_contract="0x1234567890123456789012345678901234567890"
)
```

---

## 3) Module — Fiche de Sécurisation Solidity ECDSA (2h)

```solidity
// SPDX-License-Identifier: MIT
// CONTRAT SOLIDITY SÉCURISÉ — AUTHENTIFICATION PAR SIGNATURE EIP-712

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract SecureVaultEIP712 is EIP712 {
    using ECDSA for bytes32;

    mapping(bytes32 => bool) public executedNonces;

    event WithdrawalExecuted(address indexed user, uint256 amount);

    constructor() EIP712("ParadisVault", "1") {}

    function executeMetaWithdrawal(
        address user,
        uint256 amount,
        bytes32 nonce,
        bytes calldata signature
    ) external {
        // 1. Détection Replay Attack locale via Nonce
        bytes32 txHash = keccak256(abi.encodePacked(user, amount, nonce));
        require(!executedNonces[txHash], "Vault: Signature deja rejouee");
        executedNonces[txHash] = true;

        # 2. Hash EIP-712 sécurisé (englobe ChainID + Adresse du contrat)
        bytes32 digest = _hashTypedDataV4(
            keccak256(abi.encode(
                keccak256("Withdrawal(address user,uint256 amount,bytes32 nonce)"),
                user,
                amount,
                nonce
            ))
        );

        # 3. ECDSA OpenZeppelin : valide s <= n/2 ET rejette l'adresse 0x0
        address signer = digest.recover(signature);
        require(signer == user, "Vault: Signature invalide");

        payable(user).transfer(amount);
        emit WithdrawalExecuted(user, amount);
    }
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **EIP-712** | Ethereum Improvement Proposal 712 — Standard de hachage et de signature de données structurées typées |
| **`ecrecover`** | Opération précompilée EVM retournant l'adresse du signataire d'un hash et d'une signature ECDSA |
| **Malleability** | Propriété d'une signature permettant d'en dériver une autre valide sans connaître la clé privée |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle est la cause mathématique de la **Malléabilité des Signatures ECDSA** sur la courbe secp256k1 ?
- A) La symétrie de la courbe elliptique : si $(r, s)$ est une signature valide pour un message $m$, alors $(r, n - s) \pmod n$ est également une signature valide donnant la même clé publique
- B) Une erreur de compilateur Solidity
- C) La faiblesse du hachage Keccak-256
- D) L'absence de Gas dans la transaction

**Réponse : A**

**Q2 :** Quel comportement critique de la fonction précompilée EVM **`ecrecover`** peut permettre un bypass d'authentification si le code Solidity n'est pas sécurisé ?
- A) `ecrecover` retourne l'adresse zero (`0x0000000000000000000000000000000000000000`) lorsque la signature est invalide ou corrompue — si le contrat compare le signataire à une variable non initialisée (qui vaut `0x0`), la condition est validée !
- B) `ecrecover` consomme tout le Gas restant
- C) `ecrecover` modifie la clé privée du contrat
- D) `ecrecover` ne fonctionne que sur le réseau de test Goerli

**Réponse : A**

**Q3 :** Comment le standard **EIP-712** prévient-il les attaques par rejeu cross-chain (ex: rejouer une signature signée sur Ethereum vers le réseau Polygon) ?
- A) En incluant le `ChainID` du réseau et l'adresse `verifyingContract` du contrat dans le `DOMAIN_SEPARATOR` haché avec la transaction
- B) En chiffrant les transactions avec AES-256
- C) En exigeant un mot de passe utilisateur
- D) En limitant le nombre de blocs par jour

**Réponse : A**

**Q4 :** Quelle vérification sur la valeur $s$ est imposée par la norme **EIP-2** et la bibliothèque OpenZeppelin ECDSA pour contrer la malléabilité ?
- A) Exiger impérativement que $s \le n/2$ (où $n$ est l'ordre de la courbe secp256k1)
- B) Exiger que $s$ soit un nombre pair
- C) Exiger que $s = r$
- D) Supprimer le paramètre $s$

**Réponse : A**

**Q5 :** Quel est le rôle d'un **Nonce** unique dans un schéma de méta-transactions Web3 signed message ?
- A) Garantir qu'une même signature ne peut être exécutée qu'une seule et unique fois par le contrat intelligent, prévenant le rejeu local
- B) Augmenter la vitesse de confirmation des blocs
- C) Déterminer les frais de Gas
- D) Chiffrer l'adresse du destinataire

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
