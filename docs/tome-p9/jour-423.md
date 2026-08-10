# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 423 (6h) : Consensus & Sécurité des Blockchains — Proof-of-Work vs Proof-of-Stake, Attaques 51%, Slashing, Long-Range Attacks & BFT Consensus

> [!NOTE]
> **Objectif du jour :** Maîtriser l'analyse cryptographique et les modèles d'attaques sur les mécanismes de **consensus décentralisés** : disséquer la sécurité de **Proof-of-Work (PoW)** et l'attaque des **51% (Majority Hashrate Attack)**, analyser les protocoles **Proof-of-Stake (PoS — Casper/Tendermint)**, modéliser le risque du **Nothing-at-Stake Problem**, les **Long-Range Attacks** et le mécanisme d'éviction cryptographique **Slashing**, et implémenter un simulateur de consensus BFT (Byzantine Fault Tolerant).
>
> **Compétences visées :** `WEB3-CRYPTO-05` (A) — Blockchain Consensus Cryptographic Analysis (PoW vs PoS & BFT Protocols) | `WEB3-CRYPTO-06` (A) — 51% Attack Simulation, Slashing Mechanics & Long-Range Attack Prevention

---

## 1) Module — Proof-of-Work vs Proof-of-Stake & Modèles d'Attaque (2h)

### 📖 Narration/Intuition

Un mécanisme de consensus décentralisé garantit que des nœuds mutuellement méfiants s'accordent sur un état unique de registre (State Machine Replication) malgré la présence de nœuds Byzantins (malveillants).

```
  ═══════════════════════════════════════════════════════════════════
    1. PROOF-OF-WORK (PoW) VS PROOF-OF-STAKE (PoS)
  ═══════════════════════════════════════════════════════════════════

  MÉCANISME             RESURCE ANCRE           DISCIPLINE ANCIENNE
  ─────────             ──────────────          ───────────────────
  Proof-of-Work         Énergie physique + ASIC  Consommation d'électricité
                        (Hashrate H/s)           (Incurable physiquement)

  Proof-of-Stake        Actif financier (Token)  Verrouillage de Capital
                        (Stake séquestré)        (Pénalité par Slashing)

  ═══════════════════════════════════════════════════════════════════
    2. VULNÉRABILITÉS & ANOMALIES CRYPTOGRAPHIQUES POS
  ═══════════════════════════════════════════════════════════════════

  - Nothing-at-Stake Problem :
    Un validateur PoS peut miner sur toutes les bifurcations (forks) simultanément
    sans coût d'énergie marginal → Bloque la finalité du consensus.

  - Slashing Countermeasure :
    Destruction cryptographique automatique du stake d'un validateur qui signe
    deux blocs conflictuels à la même hauteur (Double Signing).

  - Long-Range Attack :
    Un attaquant rachetant d'anciennes clés privées de validateurs historiques
    peut créer une chaîne alternative complète depuis le bloc Genesis.
```

---

## 2) Module — Outillage Consensus Security Simulator (`consensus_security_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import hashlib
import json
import secrets
from datetime import datetime, timezone
from typing import List, Dict

class ConsensusSecurityEngine:
    """
    Simulateur de sécurité des algorithmes de consensus :
    - Détection de l'attaque des 51% (PoW Hashrate Monopoly)
    - Simulation du Slashing PoS (Double Signing Detection)
    - Validation de finalité BFT (Byzantine Fault Tolerance - 2/3 Quorum)
    """

    def __init__(self):
        self.consensus_log = []

    def simulate_pow_51_percent_attack(self, total_hashrate_ths: float, attacker_hashrate_ths: float) -> dict:
        """
        Simule le risque d'une attaque des 51% sur un réseau Proof-of-Work.
        """
        print("\n[*] SIMULATION ATTAQUE 51% PROOF-OF-WORK")
        attacker_ratio = (attacker_hashrate_ths / total_hashrate_ths) * 100
        
        if attacker_ratio >= 50.0:
            status = "CRITICAL_NETWORK_TAKEOVER_POSSIBLE"
            risk = "L'attaquant peut réorganiser la chaîne (Reorg), annuler des transactions et effectuer des Double-Spends !"
            print(f"  [!] CRITICAL: L'attaquant contrôle {attacker_ratio:.1f}% du Hashrate total !")
        else:
            status = "NETWORK_SECURE"
            risk = f"Réseau sécurisé. Attaquant à {attacker_ratio:.1f}% (Seuil: 50%)"
            print(f"  [+] Hashrate attaquant: {attacker_ratio:.1f}% — Réseau PoW sécurisé ✅")

        result = {
            "consensus": "Proof-of-Work",
            "attacker_ratio_percent": round(attacker_ratio, 2),
            "status": status,
            "impact": risk
        }
        self.consensus_log.append(result)
        return result

    def simulate_pos_double_signing_slashing(self, validator_id: str, block_height: int, block_hash_1: str, block_hash_2: str, staked_amount_eth: float) -> dict:
        """
        Simule la détection d'une double signature PoS à la même hauteur
        et l'exécution automatique de la pénalité de Slashing.
        """
        print(f"\n[*] AUDIT SLASHING PROOF-OF-STAKE — Validateur: {validator_id}")
        
        if block_hash_1 != block_hash_2:
            # DOUBLE SIGNING DÉTECTÉ !
            slashed_amount = staked_amount_eth * 1.0  # Slashing total (100%)
            slashing_event = {
                "validator": validator_id,
                "violation": "DOUBLE_SIGNING_SAME_HEIGHT",
                "block_height": block_height,
                "original_stake": staked_amount_eth,
                "slashed_amount": slashed_amount,
                "action": "EVICTED_FROM_VALIDATOR_SET_AND_BURNED",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            print(f"  [!] ALERTE SLASHING: Double signature détectée au bloc {block_height} !")
            print(f"  [!] Pénalité exécutée: {slashed_amount} ETH confisqués & brûlés. Validateur banni ! 🔥")
            return slashing_event
        else:
            print("  [+] Validateur conforme (Signature unique) ✅")
            return {"status": "VALIDATOR_HONEST"}

# Démonstration Consensus Security Engine
engine = ConsensusSecurityEngine()
print("=== CONSENSUS SECURITY ENGINE (PoW / PoS) ===")

# 1. Attaque 51% PoW
engine.simulate_pow_51_percent_attack(total_hashrate_ths=1000.0, attacker_hashrate_ths=550.0)

# 2. Slashing PoS Double Signing
engine.simulate_pos_double_signing_slashing(
    validator_id="0xVAL_PARADIS_NODE_01",
    block_height=1254300,
    block_hash_1="0xHASH_BLOCK_A_1234",
    block_hash_2="0xHASH_BLOCK_B_9999",  # Hash différent au même bloc = Double Signing!
    staked_amount_eth=32.0
)
```

---

## 3) Module — Fiche de Comparaison des Consensus (2h)

```markdown
# COMPARAISON CRYPTOGRAPHIQUE DES ALGORITHMES DE CONSENSUS

| Propriété | Proof-of-Work (Bitcoin) | Proof-of-Stake (Ethereum Casper) | Tendermint / CometBFT |
|:---|:---:|:---:|:---:|
| **Modèle de Sécurité** | Hashrate physique | Stake financier | Quorum 2/3 des votants |
| **Finalité** | Probabiliste (6 blocs) | Économique (2 Epochs ~12 min) | **Immédiate (1 bloc)** |
| **Pénalité d'Attaque** | Perte d'électricité | **Slashing du Capital** | Slashing + Halt |
| **Tolérance aux Pannes** | < 50% du Hashrate | < 33% du Stake (Slashing) | < 33% des Nœuds Byzantins |
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PoW** | Proof-of-Work — Consensus basé sur la preuve de travail par dépense d'énergie computationnelle |
| **PoS** | Proof-of-Stake — Consensus basé sur le séquestre de capital financier (Stake) |
| **Slashing** | Mécanisme cryptographique confisquant et brûlant le capital d'un validateur PoS malveillant |
| **BFT** | Byzantine Fault Tolerance — Capacité d'un système à atteindre un consensus malgré des nœuds corrompus |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Dans une blockchain Proof-of-Work (ex: Bitcoin), quel est le risque représenté par l'**Attaque des 51%** ?
- A) Un attaquant contrôlant plus de 50% du Hashrate total peut réorganiser unilatéralement l'historique des blocs récents, annuler ses propres transactions et exécuter des Double-Spends
- B) L'attaquant peut voler les clés privées de tous les utilisateurs
- C) L'attaquant peut augmenter le nombre total de Bitcoins au-delà de 21 millions
- D) L'attaquant désactive le chiffrement TLS des nœuds

**Réponse : A**

**Q2 :** Quel est le principe du problème **Nothing-at-Stake** spécifique au Proof-of-Stake non pénalisé ?
- A) Puisque la création d'un bloc en PoS ne coûte pas d'énergie physique, un validateur a un intérêt financier à valider TOUTES les bifurcations (forks) en même temps, empêchant le réseau de converger vers une chaîne unique
- B) Les validateurs n'ont pas d'argent pour acheter des tokens
- C) La blockchain s'arrête si personne ne mise de tokens
- D) Le matériel informatique est volé

**Réponse : A**

**Q3 :** Comment le mécanisme de **Slashing** résout-il le problème Nothing-at-Stake dans Ethereum PoS ?
- A) En détectant cryptographiquement les signatures contradictoires (Double Signing) d'un validateur à la même hauteur de bloc et en confisquant/brûlant automatiquement tout ou partie de ses 32 ETH séquestrés
- B) En envoyant une amende par courrier postal
- C) En augmentant la vitesse de minage
- D) En exigeant un changement de mot de passe

**Réponse : A**

**Q4 :** Qu'est-ce qu'une **Long-Range Attack** sur un réseau Proof-of-Stake ?
- A) Une attaque où un adversaire achète d'anciennes clés privées de validateurs historiques (qui n'ont plus de stake en jeu) pour recréer une chaîne alternative complète depuis le bloc Genesis
- B) Un scan de port à longue distance
- C) Un déni de service distribué (DDoS)
- D) Une attaque par force brute sur WPA2

**Réponse : A**

**Q5 :** Dans un protocole de consensus **Byzantine Fault Tolerant (BFT)** comme Tendermint, quelle fraction maximale de nœuds Byzantins (malveillants) le réseau peut-il tolérer tout en garantissant la finalité immédiate ?
- A) Moins d'un tiers des nœuds ($\le 33\%$)
- B) Plus de 90% des nœuds
- C) Exactement 50% des nœuds
- D) Aucun nœud Byzantin n'est toléré

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
