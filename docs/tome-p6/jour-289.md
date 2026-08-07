# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 289 (6h) : Blockchain & Smart Contract Auditing (EVM Security, Reentrancy Attacks, Flash Loan Vulnerabilities, Slither & Mythril Static Analysis)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'**audit de sécurité des Smart Contracts et des applications Web3/EVM (Ethereum Virtual Machine)** : identifier les vulnérabilités critiques de la Finance Décentralisée (DeFi) comme les **Attaques par Réentrée (Reentrancy)**, les vulnérabilités aux **Flash Loans**, utiliser les scanners statiques **Slither** et **Mythril**, et rédiger des correctifs de sécurité en Solidity.
>
> **Compétences visées :** `SMART-01` (A) — EVM & Solidity Smart Contract Auditing | `SMART-02` (A) — Reentrancy Exploitation & Slither Static Analysis

---

## 1) Module — Anatomie des Vulnérabilités EVM (Reentrancy & Flash Loans) (2h)

### 📖 Narration/Intuition

Les Smart Contracts déployés sur la blockchain Ethereum (EVM) sont des programmes immutables gérant des millions de dollars de fonds. La vulnérabilité historique **Reentrancy (Réentrée)** (à l'origine du hack "The DAO" en 2016) survient lorsqu'un contrat effectue un appel externe pour envoyer des Ether à un contrat tiers AVANT de mettre à jour son propre solde interne.

```
Contrat Cible (Banque)                            Contrat Attaquant Malveillant
       │                                                      │
       ├────── (1) withdraw() ───────────────────────────────►│
       │                                                      │
       ├────── (2) Envoie Ether ──────────────────────────────►│ (Reçoit l'Ether)
       │                                                      │    │
       │                                                      │    └── (3) Rappelle withdraw()
       │◄───── (4) Re-enter withdraw() ! ─────────────────────┘        AVANT la mise à jour du solde !
       │                                                      
  [Solde non mis à jour !] -> Envoie à nouveau l'Ether jusqu'à vidage complet du contrat !
```

---

## 2) Module — Exploitation & Remédiation d'une Réentrée en Solidity (`reentrancy_audit.sol`) (2h)

### 🛠️ Atelier Pratique — Code Solidity Vulnérable vs Sécurisé

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// CONTRAT VULNÉRABLE À LA RÉENTRÉE
contract VulnerableBank {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint256 balance = balances[msg.sender];
        require(balance > 0, "Solde insuffisant");

        // VULNÉRABILITÉ : Appel externe avant la mise à jour du solde !
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Echec du transfert");

        // ERREUR : La mise à jour du solde est faite trop tard !
        balances[msg.sender] = 0;
    }
}

// CONTRAT SÉCURISÉ (Modèle Checks-Effects-Interactions + ReentrancyGuard)
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SecureBank is ReentrancyGuard {
    mapping(address => uint256) public balances;

    function withdraw() public nonReentrant { // Protection par ReentrancyGuard !
        uint256 balance = balances[msg.sender];
        require(balance > 0, "Solde insuffisant");

        // 1. CHECKS (Vérifications)
        // 2. EFFECTS (Mise à jour de l'état INTERNE d'abord !)
        balances[msg.sender] = 0;

        // 3. INTERACTIONS (Appel externe à la fin !)
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Echec du transfert");
    }
}
```

---

## 3) Module — Audit Statique de Smart Contracts avec Slither (`slither_audit.sh`) (2h)

### 🛠️ Commande d'audit automatique Slither

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Installation du scanner Slither (Python/pip)
# ═══════════════════════════════════════════════════════
pip install slither-analyzer mythril

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Lancement de l'audit automatique du fichier Solidity
# ═══════════════════════════════════════════════════════
slither reentrancy_audit.sol

# Output Slither :
# INFO:Detectors:
# VulnerableBank.withdraw() (reentrancy_audit.sol#11-20) sends eth with control flow to external contract:
# 	- (success) = msg.sender.call{value: balance}() (reentrancy_audit.sol#16)
# State variables written after the call:
# 	- balances[msg.sender] = 0 (reentrancy_audit.sol#19)
# Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#reentrancy-vulnerabilities
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **EVM** | Ethereum Virtual Machine — Environnement d'exécution des Smart Contracts Ethereum |
| **Reentrancy** | Faille permettant à un contrat malveillant de rappeler une fonction avant sa fin |
| **Slither** | Scanner d'analyse statique pour le code Solidity développé par Trail of Bits |
| **OpenZeppelin** | Bibliothèque de référence de contrats intelligents audités et sécurisés |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la cause fondamentale d'une vulnérabilité par **Réentrée (Reentrancy)** dans un Smart Contract Solidity ?
- A) Le contrat effectue un transfert d'Ether ou un appel externe vers une adresse tierce AVANT de mettre à jour son propre état interne (solde), permettant à l'attaquant de rappeler la fonction en boucle
- B) Le réseau est trop lent
- C) La clé privée est publique
- D) Le fichier Solidity est trop grand

**Réponse : A**

**Q2 :** Quel motif de conception (Design Pattern) Solidity prévient par construction les attaques par Réentrée ?
- A) Le modèle Checks-Effects-Interactions (Vérifier, Modifier l'état interne, puis Interagir avec l'extérieur)
- B) Le modèle Singleton
- C) Le modèle MVC
- D) Le modèle Factory

**Réponse : A**

**Q3 :** Quel outil open-source d'analyse statique développé par Trail of Bits est la référence de l'industrie pour scanner les vulnérabilités Solidity ?
- A) Slither
- B) Wireshark
- C) Nmap
- D) Metasploit

**Réponse : A**

**Q4 :** Quel modificateur (modifier) de la bibliothèque **OpenZeppelin** permet d'ajouter un verrou anti-réentrée (Reentrancy Guard) sur une fonction sensible ?
- A) `nonReentrant`
- B) `onlyOwner`
- C) `view`
- D) `pure`

**Réponse : A**

**Q5 :** Qu'est-ce qu'une attaque par **Flash Loan** dans l'écosystème DeFi (Finance Décentralisée) ?
- A) Emprunter des millions de dollars de liquidité sans aucun dépôt de garantie, exécuter une manipulation de cours d'oracle au sein d'une même transaction blockchain, puis rembourser le prêt
- B) Voler le mot de passe du portefeuille MetaMask
- C) Attaquer le réseau Wi-Fi d'un mineur
- D) Miner du Bitcoin plus vite

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
