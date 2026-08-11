# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 571 (6h) : Blockchain & Web3 Fondamentaux : Consensus PoS, Smart Contracts Solidity & DeFi

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre les principes fondamentaux de la **Blockchain et des registres distribués (DLT)** : Hachage cryptographique, arbres de Merkle, immutabilité
> - Comparer les mécanismes de consensus : **Proof-of-Work (PoW)** vs **Proof-of-Stake (PoS)** (Ethereum 2.0 / PoS Staking)
> - Développer et auditer un **Smart Contract Solidity** avec les meilleures pratiques de sécurité (reentrancy guard, OpenZeppelin)
> - Comprendre les architectures de la **Finance Décentralisée (DeFi)** et de la tokenisation d'actifs (ERC-20, ERC-721/1155)
>
> **Compétences visées :** `ARCH-01` (A), `SEC-05` (A) — Blockchain, Smart Contracts & Web3 Architecture

---

## Module 1 — Principes Blockchain & Consensus Proof-of-Stake (2h)

### 📖 Intuition & Narration

Une **Blockchain** est une base de données distribuée immuable organisée sous forme d'une chaîne de blocs cryptographiquement liés. Chaque bloc contient un ensemble de transactions, le hash du bloc précédent, et la racine d'un **Arbre de Merkle (Merkle Tree)**.

La révolution majeure du **Proof-of-Stake (PoS)** par rapport au Proof-of-Work (PoW) réside dans l'efficacité énergétique : au lieu de faire consommer des gigawatts d'électricité à des cartes graphiques pour résoudre une énigme arbitraire (PoW), le PoS sélectionne les validateurs en fonction du nombre de jetons qu'ils ont mis en gage (Staking). Résultat : **une réduction de 99.95% de la consommation électrique**.

### 🔍 Structure d'un Bloc & Arbre de Merkle

```
STRUCTURE DE BLOCS APPARIÉS EN BLOCKCHAIN

  BLOC N-1                                  BLOC N
  ┌─────────────────────────────────┐       ┌─────────────────────────────────┐
  │ Block Hash: 0000a4b8...         │       │ Block Hash: 0000f9c2...         │
  │ Prev Hash : 000012e4...         │◄──────│ Prev Hash : 0000a4b8...         │
  │ Merkle Root: 3c4d5e...          │       │ Merkle Root: 7a8b9c...          │
  └─────────────────────────────────┘       └─────────────────────────────────┘
```

---

## Module 2 — Smart Contracts Solidity & Sécurité (2h)

### 🔍 Smart Contract Solidity & Attaque par Réentrance

Un **Smart Contract** est un programme immuable exécuté sur l'EVM (Ethereum Virtual Machine). Sa principale vulnérabilité historique est l'**Attaque par Réentrance (Reentrancy Attack)** (qui a causé le hack de The DAO en 2016).

```solidity
// SPDX-License-Identifier: MIT
// Smart Contract Solidity sécurisé contre la réentrance (OpenZeppelin ReentrancyGuard)
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ParadisVault is ReentrancyGuard {
    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    function deposit() external payable {
        require(msg.value > 0, "Montant invalide");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    // Le modificateur nonReentrant empêche toute réentrance malveillante
    function withdraw(uint256 _amount) external nonReentrant {
        require(balances[msg.sender] >= _amount, "Solde insuffisant");

        // Checks-Effects-Interactions Pattern : Mettre à jour le solde AVANT l'envoi
        balances[msg.sender] -= _amount;

        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        require(success, "Echec du transfert");

        emit Withdraw(msg.sender, _amount);
    }
}
```

---

## Module 3 — Calculateur & Simulateur Blockchain Python (1h30)

### 🛠️ Script Python : Merkle Tree & Proof-of-Stake Validator Simulator

```python
#!/usr/bin/env python3
"""
PARADIS — Blockchain Merkle Tree & Proof-of-Stake Simulator
Démontre le calcul de la racine de Merkle et la sélection aléatoire pondérée d'un validateur PoS.
"""
import hashlib
import random
from dataclasses import dataclass
from typing import List

class MerkleTree:
    @staticmethod
    def _hash(data: str) -> str:
        return hashlib.sha256(data.encode('utf-8')).hexdigest()

    @classmethod
    def compute_root(cls, transactions: List[str]) -> str:
        if not transactions:
            return cls._hash("")

        # 1. Hacher chaque transaction (Feuilles de l'arbre)
        current_level = [cls._hash(tx) for tx in transactions]

        # 2. Remonter l'arbre en combinant les paires de hashs
        while len(current_level) > 1:
            if len(current_level) % 2 != 0:
                current_level.append(current_level[-1]) # Dupliquer le dernier si impair

            next_level = []
            for i in range(0, len(current_level), 2):
                combined = current_level[i] + current_level[i+1]
                next_level.append(cls._hash(combined))
            current_level = next_level

        return current_level[0]

@dataclass
class PoSValidator:
    address: str
    staked_tokens: float # Nombre de jetons stakés

class ProofOfStakeSimulator:
    def __init__(self, validators: List[PoSValidator]):
        self.validators = validators

    def select_block_proposer(self) -> PoSValidator:
        """Sélectionne le validateur du prochain bloc avec une probabilité proportionnelle au stake"""
        total_stake = sum(v.staked_tokens for v in self.validators)
        pick = random.uniform(0, total_stake)
        current = 0.0
        for v in self.validators:
            current += v.staked_tokens
            if current >= pick:
                return v
        return self.validators[-1]


if __name__ == "__main__":
    print("=== DÉMONSTRATION BLOCKCHAIN PARADIS (MERKLE TREE & POS) ===\n")

    # 1. Calcul de la racine de Merkle
    tx_list = [
        "Alice -> Bob : 2.5 ETH",
        "Charlie -> Dave : 10.0 ETH",
        "Eve -> Frank : 0.1 ETH",
        "Grace -> Heidi : 5.0 ETH"
    ]
    merkle_root = MerkleTree.compute_root(tx_list)
    print(f"  📜 Transactions ({len(tx_list)}) :")
    for tx in tx_list:
        print(f"     • {tx}")
    print(f"\n  🌳 RACINE DE MERKLE (SHA-256) : {merkle_root}\n")

    # 2. Simulation de sélection PoS
    validators = [
        PoSValidator("0xValiParis...01", 32000.0), # 32 ETH
        PoSValidator("0xValiTokyo...02", 64000.0), # 64 ETH
        PoSValidator("0xValiStock...03", 16000.0), # 16 ETH
    ]
    pos = ProofOfStakeSimulator(validators)
    proposer = pos.select_block_proposer()

    print("  🪙 SÉLECTION DU VALIDATEUR PROOF-OF-STAKE :")
    print(f"     Validateur Élu : {proposer.address} (Stake: {proposer.staked_tokens} ETH)")
    print("=" * 65)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PoS / PoW** | Proof-of-Stake / Proof-of-Work — Mécanismes de consensus blockchain |
| **EVM** | Ethereum Virtual Machine — Environnement d'exécution des Smart Contracts |
| **DeFi** | Decentralized Finance — Ecosysteme financier peer-to-peer sur blockchain |
| **ERC-20** | Standard d'émission de jetons fongibles sur la blockchain Ethereum |
| **ERC-721** | Standard d'émission de jetons non fongibles (NFT) |

---

## Exercices Pratiques

### Exercice 1 — Audit de Sécurité Solidity

Examinez ce fragment de code Solidity et identifiez la vulnérabilité :

```solidity
function withdrawAll() external {
    uint amount = balances[msg.sender];
    (bool s, ) = msg.sender.call{value: amount}("");
    require(s);
    balances[msg.sender] = 0;
}
```

**Corrigé guidé :**
- **Vulnérabilité** : **Attaque par Réentrance (Reentrancy Vulnerability)**.
- **Explication** : L'appel externe `msg.sender.call{value: amount}("")` transfère le contrôle au contrat appelant *avant* d'avoir mis à jour `balances[msg.sender] = 0`. Un contrat malveillant peut ré-appeler `withdrawAll()` en boucle dans sa fonction `fallback()` et vider le contrat de tous ses fonds.
- **Remédiation** : Appliquer le pattern **Checks-Effects-Interactions** (`balances[msg.sender] = 0;` *avant* l'appel externe) ou ajouter le modificateur `nonReentrant` d'OpenZeppelin.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la différence majeure entre le **Proof-of-Work (PoW)** et le **Proof-of-Stake (PoS)** ?

- A) PoW utilise des mots de passe, PoS des certificats TLS.
- B) PoW consomme une quantité massive d'énergie électrique pour résoudre des calculs, tandis que PoS sélectionne les validaturs en fonction de leur mise en gage financière (Stake), réduisant la consommation de 99.95%. ✅
- C) PoS est réservé aux banques privées.
- D) Il n'y a aucune différence.

**Q2.** À quoi sert un **Arbre de Merkle (Merkle Tree)** dans un bloc de blockchain ?

- A) À afficher un arbre généalogique des utilisateurs.
- B) À agréger cryptographiquement l'ensemble des transactions d'un bloc en une seule racine (Merkle Root) de taille fixe, permettant de vérifier la présence d'une transaction en O(log N). ✅
- C) À compresser les fichiers vidéo.
- D) À accélérer le réseau Wi-Fi.

**Q3.** Quel est le risque principal d'une **Attaque par Réentrance (Reentrancy Attack)** dans un Smart Contract Solidity ?

- A) Voler la clé privée du développeur.
- B) Permettre à un contrat malveillant de rappeler en boucle une fonction de retrait avant que le solde ne soit mis à jour en mémoire, vidant ainsi les fonds du contrat. ✅
- C) Éteindre le réseau Ethereum.
- D) Bloquer l'affichage du site web.

**Q4.** Le standard **ERC-20** sur Ethereum définit la norme pour :

- A) Les images NFT d'art numérique.
- B) Les jetons fongibles (tokens d'utilité ou monnaies) interchangeables. ✅
- C) Les noms de domaine internet.
- D) Les adresses IP de serveurs.

**Q5.** Dans Solidity, quel pattern de conception recommandé permet d'éviter les attaques par réentrance ?

- A) Try-Catch-Finally
- B) Checks-Effects-Interactions ✅
- C) Singleton Pattern
- D) Factory Pattern

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
