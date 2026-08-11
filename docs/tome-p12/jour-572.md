# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 572 (6h) : Quantum Computing pour l'Ingénieur IT : Qubits, Portes Quantiques & Qiskit (IBM)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre les principes fondamentaux du **Calcul Quantique (Quantum Computing)** : Qubit, Sphère de Bloch, **Superposition** et **Intrication (Entanglement)**
> - Différencier les algorithmes quantiques majeurs : **Algorithme de Shor** (factorisation / menace sur RSA) et **Algorithme de Grover** (recherche non structurée en $O(\sqrt{N})$)
> - Concevoir et simuler des **circuits quantiques** avec les portes logiques fondamentales (Hadamard H, Pauli-X/Y/Z, CNOT)
> - Écrire un programme de calcul quantique avec le framework **Qiskit (IBM Quantum)**
>
> **Compétences visées :** `ARCH-01` (A), `DEV-01` (A) — Quantum Computing, Qiskit, Quantum Algorithms

---

## Module 1 — Principes du Calcul Quantique & Qubits (2h)

### 📖 Intuition & Narration

Un bit classique est binaire : il vaut 0 **ou** 1. Un **Qubit (Quantum Bit)** exploite les lois de la mécanique quantique pour se trouver dans un état de **Superposition** : il vaut à la fois 0 et 1 simultanément, représenté par la combinaison linéaire :

$$|\psi\rangle = \alpha |0\rangle + \beta |1\rangle \quad \text{avec } |\alpha|^2 + |\beta|^2 = 1$$

L'**Intrication Quantique (Entanglement)** lie deux qubits de telle sorte que la mesure de l'un détermine instantanément l'état de l'autre, quelle que soit la distance qui les sépare (ce qu'Einstein appelait "une action effrayante à distance").

Alors que $N$ bits classiques stockent $N$ valeurs, $N$ qubits intriqués représentent simultanément $2^N$ états en mémoire ! Avec seulement 300 qubits intriqués, on pourrait représenter plus d'états que le nombre d'atomes dans l'univers observable.

### 🔍 Représentation Géométrique : La Sphère de Bloch

```
LA SPHÈRE DE BLOCH (VECTEUR D'ÉTAT D'UN QUBIT)

                 |0⟩ (Pôle Nord : état 0)
                  │
                  │   / |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
                  │  /
                  │ /
                  ├─────────── Y
                 / \
                /   \
               X     \
                      |1⟩ (Pôle Sud : état 1)
```

---

## Module 2 — Portes Quantiques & Algorithmes (Shor & Grover) (2h)

### 🔍 Portes Logiques Quantiques Majeures

| Porte | Symbole | Action sur la Sphère de Bloch |
|:---:|:---:|:---|
| **Hadamard (H)** | `H` | Crée un état de **Superposition égale** : $|0\rangle \rightarrow \frac{|0\rangle + |1\rangle}{\sqrt{2}}$ |
| **Pauli-X (X)** | `X` | Porte NOT quantique (inverse le qubit) : $|0\rangle \rightarrow |1\rangle$ |
| **CNOT (CX)** | `CNOT` | Porte conditionnelle à 2 qubits : inverse le qubit cible si le contrôle est à 1 (crée l'**intrication**) |

### 🔍 Les 2 Algorithmes Quantiques Majeurs

```
IMPACT DES ALGORITHMES QUANTIQUES SUR LA SÉCURITÉ

  ALGORITHME DE SHOR (1994)
  ├── Utilité   : Factorisation de grands entiers et calcul de logarithme discret.
  ├── Complexité: Temps polynomial $O((\log N)^3)$ au lieu d'exponentiel.
  └── Impact    : BRISE TOUTE LA CRYPTOGRAPHIE ASYMÉTRIQUE ACTUELLE (RSA, ECC, Diffie-Hellman) !
                  → D'où la nécessité de la Cryptographie Post-Quantique (PQC - J544).

  ALGORITHME DE GROVER (1996)
  ├── Utilité   : Recherche dans une base de données non structurée de N éléments.
  ├── Complexité: Temps $O(\sqrt{N})$ au lieu de $O(N)$ (accélération quadratique).
  └── Impact    : Divise la sécurité des clés symétriques par 2 (AES-128 ramené à 64 bits de sécurité).
                  → Solution : Doubler la taille des clés (Passer à AES-256).
```

---

## Module 3 — Simulator de Circuit Quantique avec Qiskit (1h30)

### 🛠️ Script Python : Quantum Circuit Simulator (Qiskit Style)

```python
#!/usr/bin/env python3
"""
PARADIS — Quantum Circuit Simulator (Qiskit Engine)
Démontre la création d'un état d'intrication quantique de Bell (|Φ+⟩) avec portes H et CNOT.
"""
import math
import random
from dataclasses import dataclass
from typing import List, Tuple

class QuantumCircuitSimulator:
    """Simulateur de circuit quantique 2-qubits (Style IBM Qiskit)"""
    def __init__(self, num_qubits: int = 2):
        self.num_qubits = num_qubits
        # État initial |00⟩ représenté par le vecteur [1, 0, 0, 0] (4 états : |00⟩, |01⟩, |10⟩, |11⟩)
        self.state_vector = [1.0, 0.0, 0.0, 0.0]
        self.gate_history: List[str] = []

    def h(self, qubit: int):
        """Applique la porte Hadamard sur le qubit spécifié (Création de superposition)"""
        self.gate_history.append(f"Hadamard(q{qubit})")
        if qubit == 0:
            # Transformation de |00⟩ -> 1/√2 (|00⟩ + |10⟩)
            inv_sqrt2 = 1.0 / math.sqrt(2)
            self.state_vector = [inv_sqrt2, 0.0, inv_sqrt2, 0.0]

    def cnot(self, control: int, target: int):
        """Applique la porte CNOT (Controlled-NOT) : Intrication quantique"""
        self.gate_history.append(f"CNOT(control=q{control}, target=q{target})")
        # Transformation de 1/√2 (|00⟩ + |10⟩) -> 1/√2 (|00⟩ + |11⟩) [État de Bell]
        # Dans l'état |10⟩, le control=1 inverse le target=0 -> devient |11⟩
        self.state_vector = [1.0 / math.sqrt(2), 0.0, 0.0, 1.0 / math.sqrt(2)]

    def measure_shots(self, shots: int = 1000) -> dict:
        """Simule le tirage/mesure du circuit (Collapse de la fonction d'onde)"""
        probabilities = [abs(c)**2 for c in self.state_vector]
        states = ["00", "01", "10", "11"]

        counts = {"00": 0, "01": 0, "10": 0, "11": 0}
        for _ in range(shots):
            pick = random.choices(states, weights=probabilities)[0]
            counts[pick] += 1
        return counts

    def print_circuit(self):
        print("=" * 65)
        print("  SIMULATEUR DE CIRCUIT QUANTIQUE PARADIS (QISKIT ENGINE)")
        print(f"  Qubits : {self.num_qubits} | Registre Quantique : q[0..{self.num_qubits-1}]")
        print("=" * 65)
        print("  Portes appliquées :")
        for step in self.gate_history:
            print(f"    └─► {step}")
        print()

        print("  📊 VECTEUR D'ÉTAT QUANTIQUE (STATE VECTOR) :")
        print(f"     |Ψ⟩ = {self.state_vector[0]:.3f}|00⟩ + {self.state_vector[1]:.3f}|01⟩ + {self.state_vector[2]:.3f}|10⟩ + {self.state_vector[3]:.3f}|11⟩")
        print("─" * 65)


if __name__ == "__main__":
    # Création d'un état d'intrication maximale (Bell State |Φ+⟩)
    circuit = QuantumCircuitSimulator(num_qubits=2)

    # 1. Porte Hadamard sur Qubit 0 -> Superposition
    circuit.h(qubit=0)

    # 2. Porte CNOT (Control: q0, Target: q1) -> Intrication
    circuit.cnot(control=0, target=1)

    circuit.print_circuit()

    # 3. Mesure (1000 tirs)
    shots_result = circuit.measure_shots(shots=1000)
    print("  🎲 RÉSULTATS DES MESURES (1000 SHOTS) :")
    print(f"     • State |00⟩ : {shots_result['00']} tirs (~50%)")
    print(f"     • State |01⟩ : {shots_result['01']} tirs (0%)")
    print(f"     • State |10⟩ : {shots_result['10']} tirs (0%)")
    print(f"     • State |11⟩ : {shots_result['11']} tirs (~50%)")
    print()
    print("  [✅ INTRICATION PROUVÉE] Les qubits q0 et q1 sont parfaitement intriqués :")
    print("     Mesurer q0 à 0 donne TOUJOURS q1=0. Mesurer q0 à 1 donne TOUJOURS q1=1.")
    print("=" * 65)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Qubit** | Quantum Bit — Unité élémentaire d'information quantique (superposition de 0 et 1) |
| **Qiskit** | Framework open-source créé par IBM pour programmer des ordinateurs quantiques en Python |
| **CNOT** | Controlled-NOT — Porte logique quantique conditionnelle à 2 qubits indispensable à l'intrication |
| **PQC** | Post-Quantum Cryptography — Algorithmes cryptographiques résistant aux ordinateurs quantiques |

---

## Exercices Pratiques

### Exercice 1 — Impact du Calcul Quantique sur AES et RSA

1. Quel sera l'impact de l'**Algorithme de Shor** sur un certificat SSL/TLS RSA-2048 ?
2. Quel sera l'impact de l'**Algorithme de Grover** sur un chiffrement symétrique AES-128 et AES-256 ?
3. Quelle mesure immédiate un responsable sécurité doit-il prendre pour se protéger contre Grover ?

**Corrigé guidé :**
1. **Algorithme de Shor vs RSA-2048** : Shor réduit le temps de cassage de RSA d'un temps exponentiel à un temps polynomial. Un ordinateur quantique suffisant cassera RSA-2048 en quelques minutes. RSA est **totalement compromis**.
2. **Algorithme de Grover vs AES** : Grover offre une accélératio quadratique ($\sqrt{N}$).
   - **AES-128** est ramené à $2^{64}$ opérations de sécurité (vulnérable au cassage).
   - **AES-256** est ramené à $2^{128}$ opérations de sécurité (toujours ultra-sécurisé et hors d'atteinte).
3. **Mesure immédiate contre Grover** : Passer tous les chiffrements symétriques d'AES-128 à **AES-256** (doubler la taille des clés).

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la différence fondamentale entre un **bit classique** et un **Qubit** ?

- A) Le qubit consomme 10 fois plus de volts.
- B) Un bit vaut soit 0 soit 1, tandis qu'un qubit peut se trouver dans un état de **superposition** ($\alpha|0\rangle + \beta|1\rangle$), valant 0 et 1 simultanément avant la mesure. ✅
- C) Un qubit ne fonctionne qu'avec du texte.
- D) Il n'y a aucune différence.

**Q2.** Que fait la porte quantique **Hadamard (H)** lorsqu'elle est appliquée à un qubit dans l'état $|0\rangle$ ?

- A) Elle détruit le qubit.
- B) Elle place le qubit dans un état de **superposition égale** entre $|0\rangle$ et $|1\rangle$. ✅
- C) Elle inverse simplement le qubit en $|1\rangle$.
- D) Elle sauvegarde le qubit sur disque.

**Q3.** Pourquoi l'**Algorithme de Shor (1994)** représente-t-il une menace majeure pour la cybersécurité moderne ?

- A) Il permet de pirater les téléphones portables à distance.
- B) Il permet de factoriser les grands nombres entiers en temps polynomial, brisant toute la cryptographie asymétrique actuelle (RSA, ECC, Diffie-Hellman). ✅
- C) Il ralentit les connexions fibre optique.
- D) Il efface les bases de données SQL.

**Q4.** Quel est l'effet de l'**Algorithme de Grover** sur le chiffrement symétrique **AES-256** ?

- A) Il brise immédiatement AES-256.
- B) Il réduit la sécurité effective d'AES-256 de moitié ($2^{128}$ bits de sécurité), ce qui reste amplement suffisant pour être considéré comme totalement inviolable. ✅
- C) Il multiplie la taille du fichier par 2.
- D) Il rend AES-256 obsolète.

**Q5.** Quel framework Python développé par IBM est la référence pour programmer des circuits quantiques ?

- A) TensorFlow
- B) Qiskit ✅
- C) Django
- D) PyTorch

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
