# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 441 (6h) : Cryptanalyse Symétrique Avancée & Attaques par Canaux Auxiliaires (Differential/Linear Cryptanalysis, Side-Channel DPA/CPA & Fault Injection)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre et formaliser la **cryptanalyse différentielle et linéaire** appliquées aux chiffrements par bloc (AES, DES)
> - Analyser les attaques par **canaux auxiliaires (Side-Channel Attacks)** : Differential Power Analysis (DPA) et Correlation Power Analysis (CPA)
> - Étudier les attaques par **injection de fautes (Differential Fault Analysis — DFA)** sur les puces et cartes à puce
> - Implémenter les contre-mesures matérielles et logicielles : masquage (Masking), désynchronisation d'horloge et code à temps constant (Constant-Time Execution)
>
> **Compétences visées :** `SEC-04` (A) — Cryptanalysis & Side-Channel Security, `SEC-06` (A) — Hardware Security Assessment

---

## Module 1 — Cryptanalyse Différentielle & Linéaire de Chiffrements par Bloc (2h)

### 📖 Intuition & Narration

La cryptanalyse classique traite un chiffrement comme une "boîte noire" mathématique : l'attaquant cherche des faiblesses dans les équations algébriques du chiffrement (S-Boxes, permutations, key schedule). Dans la **cryptanalyse différentielle** (découverte par Eli Biham et Adi Shamir), l'attaquant injecte deux clair-textes présentant une différence connue ($\Delta X$) et observe la distribution de probabilité de la différence du texte chiffré ($\Delta Y$).

Si une S-Box n'est pas parfaitement équilibrée, certaines différences de sortie $\Delta Y$ apparaissent avec une probabilité anormalement élevée pour une différence d'entrée $\Delta X$. C'est cette "biais de probabilité" qui permet de déduire la clé secrète avec beaucoup moins d'opérations qu'une recherche exhaustive par force brute.

### 🔍 Anatomie Technique — Cryptanalyse Différentielle & Table DDT

```
PRINCIPE DE LA CRYPTANALYSE DIFFÉRENTIELLE

  Clair-texte X1 ─────────┐
                         ├─── (X1 ⊕ X2 = ΔX connu)
  Clair-texte X2 ─────────┘
        │
        ▼
   ┌─────────┐
   │ S-Box   │  S-Box non linéaire S(X)
   └────┬────┘
        │
        ▼
  Chiffré Y1 ────────────┐
                         ├─── (Y1 ⊕ Y2 = ΔY observé)
  Chiffré Y2 ────────────┘

  Table de Distribution des Différences (DDT — Difference Distribution Table) :
  Matrice N x N comptant combien de fois S(x) ⊕ S(x ⊕ ΔX) = ΔY pour tout x.
  Le maximum non-nul de la DDT (hors ΔX=0) révèle le biais différentiel !
```

---

## Module 2 — Attaques par Canaux Auxiliaires (DPA & CPA) (2h)

### 📖 Intuition & Narration

Même si un algorithme comme AES-256 est mathématiquement incassable, sa **réalisation physique** sur un processeur ou un microcontrôleur consomme du courant électrique, émet un rayonnement électromagnétique (EM) et prend un temps d'exécution variable.

En mesurant les variations de courant électrique consommées par une puce pendant un chiffrement (via un oscilloscope connecté à une résistance de mesure), un attaquant peut reconstituer la clé secrète octet par octet. C'est le principe de la **Differential Power Analysis (DPA)** et de la **Correlation Power Analysis (CPA)**.

### 🔍 Anatomie Technique — Modèle de Poids de Hamming & CPA

```
MODÈLE DE CONSOMMATION ÉLECTRIQUE — POIDS DE HAMMING

  Lorsqu'un bus de données 8-bit passe de 0x00 à une valeur V,
  le nombre de transistors CMOS qui commutent est proportionnel au
  POIDS DE HAMMING (nombre de bits à 1) de la valeur V :

    HW(0x00) = 0 bits commutés ──▶ Consommation minimale
    HW(0x0F) = 4 bits commutés ──▶ Consommation moyenne
    HW(0xFF) = 8 bits commutés ──▶ Consommation maximale

  Formule du Coefficient de Corrélation de Pearson (CPA) :
  r(k) = Σ (P - P_mean) * (H(k) - H_mean) / (σ_P * σ_H)

  où P = courbe de consommation mesurée, H(k) = Poids de Hamming théorique avec clé k.
  La clé k qui produit le coefficient de corrélation r proche de 1.0 est la vraie clé !
```

### 🛠️ Atelier Pratique — Correlation Power Analysis (CPA) en Python

```python
#!/usr/bin/env python3
"""
PARADIS — Attaque CPA (Correlation Power Analysis) sur le 1er octet AES
Simulation d'attaque par canaux auxiliaires avec coefficient de Pearson
"""

import numpy as np

# S-Box AES-128 officielle
SBOX = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0xde, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
]

def hamming_weight(n: int) -> int:
    """Calcule le Poids de Hamming (nombre de bits à 1) d'un entier 8-bit."""
    return bin(n).count('1')

def simulate_cpa_attack(num_traces: int = 500, secret_key_byte: int = 0x2B):
    """
    Simule une attaque CPA sur le premier octet de la clé AES-128.
    """
    print(f"[*] Clé secrète réelle ciblée : {hex(secret_key_byte)}")
    
    # 1. Générer des clair-textes aléatoires
    pt = np.random.randint(0, 256, size=num_traces, dtype=np.uint8)
    
    # 2. Simuler les mesures de consommation électrique avec du bruit gaussien
    traces = np.zeros(num_traces)
    for i in range(num_traces):
        # Modèle de fuite : Poids de Hamming de la sortie S-Box + Bruit
        sbox_out = SBOX[pt[i] ^ secret_key_byte]
        noise = np.random.normal(0, 0.5)
        traces[i] = hamming_weight(sbox_out) + noise

    # 3. Attaque CPA : tester les 256 clés candidates
    max_correlation = -1.0
    best_key_guess = -1

    for k_guess in range(256):
        # Hypothetical Hamming Weight pour la clé k_guess
        h_hyp = np.array([hamming_weight(SBOX[pt[i] ^ k_guess]) for i in range(num_traces)])
        
        # Pearson correlation coefficient
        corr = np.corrcoef(traces, h_hyp)[0, 1]
        
        if corr > max_correlation:
            max_correlation = corr
            best_key_guess = k_guess

    print(f"[+] Clé candidate devinée avec succès : {hex(best_key_guess)} (Corrélation: {max_correlation:.4f})")
    assert best_key_guess == secret_key_byte, "Échec de l'attaque CPA !"
    print("  ✅ Attaque CPA réussie — Clé extraite via canaux auxiliaires")

simulate_cpa_attack()
```

---

## Module 3 — Contre-mesures & Code à Temps Constant (1h30)

### 🛠️ Code à Temps Constant (Constant-Time Execution)

```c
/*
 * Exemple C — Comparaison de hash en temps constant
 * Empêche les attaques par canal auxiliaire de type Timing Attack
 */
#include <stdio.h>
#include <string.h>

int constant_time_memcmp(const unsigned char *a, const unsigned char *b, size_t len) {
    unsigned char result = 0;
    for (size_t i = 0; i < len; i++) {
        result |= a[i] ^ b[i];  // OR bit-à-bit : ne s'arrête pas au 1er octet différent !
    }
    return result;  // Retourne 0 si strictement identiques, non-zéro sinon
}

int main() {
    unsigned char token1[32] = "secret_token_value_paradis_1234";
    unsigned char token2[32] = "secret_token_value_paradis_1234";
    unsigned char token3[32] = "Xecret_token_value_paradis_1234";

    printf("Test 1 (Identiques) : %d (0 = OK)\n", constant_time_memcmp(token1, token2, 32));
    printf("Test 2 (Différents) : %d (non-zéro = échec)\n", constant_time_memcmp(token1, token3, 32));
    return 0;
}
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DPA** | Differential Power Analysis — Analyse différentielle de consommation électrique pour extraire des clés cryptographiques |
| **CPA** | Correlation Power Analysis — Attaque par canal auxiliaire basée sur le coefficient de corrélation de Pearson |
| **DFA** | Differential Fault Analysis — Attaque par injection de fautes physiques (laser, glitched voltage) lors du calcul |
| **HW** | Hamming Weight (Poids de Hamming) — Nombre de bits positionnés à 1 dans un mot binaire |
| **DDT** | Difference Distribution Table — Matrice de probabilité des différences d'entrée/sortie d'une S-Box |

---

## Exercices Pratiques

### Exercice 1 — Attaque par Chronométrage (Timing Attack)

Un serveur web valide un jeton d'authentification API de 32 caractères avec la fonction C standard `memcmp(token_user, token_real, 32)`. Expliquez comment un attaquant peut deviner le jeton octet par octet sans connaître la clé.

**Corrigé guidé :**
La fonction `memcmp` s'arrête dès qu'elle rencontre le premier octet différent.
1. L'attaquant envoie un jeton avec le premier octet `0x00` et mesure le temps de réponse HTTP avec une précision en nanosecondes.
2. Il teste les 256 valeurs d'octet possibles (0x00 à 0xFF) pour la première position.
3. L'octet correct prendra un temps légèrement plus long ($\Delta t$) car la boucle `memcmp` avancera au 2e octet avant de s'arrêter.
4. L'attaquant valide ainsi le 1er octet, puis procède au 2e octet, devinant le jeton complet en $256 \times 32 = 8192$ requêtes au lieu de $256^{32}$ (force brute).
5. **Solution :** Remplacer `memcmp` par `constant_time_memcmp()` qui parcourt systématiquement les 32 octets indépendamment des valeurs.

---

## Banque QCM — 5 Questions

**Q1.** Dans une attaque par canaux auxiliaires de type **Correlation Power Analysis (CPA)**, la variable physique mesurée est généralement :

- A) L'adresse IP du serveur
- B) La consommation électrique (ou le rayonnement électromagnétique) de la puce pendant l'exécution d'un chiffrement ✅
- C) La température ambiante de la pièce
- D) La vitesse de connexion Wi-Fi

**Q2.** Le **Poids de Hamming (Hamming Weight)** d'un octet binaire `0b10110100` est :

- A) 8
- B) 4 ✅ (car il y a quatre '1')
- C) 180
- D) 2

**Q3.** Pourquoi la fonction C standard `memcmp()` est-elle vulnérable aux **Timing Attacks** lorsqu'elle vérifie des secrets cryptographiques ?

- A) Elle est trop lente
- B) Elle s'arrête dès le premier octet différent, révélant la position de l'erreur via le temps d'exécution ✅
- C) Elle ne fonctionne pas en 64-bit
- D) Elle efface la mémoire RAM

**Q4.** Une contre-mesure logicielle efficace contre les attaques **DPA/CPA** sur un microcontrôleur est :

- A) La technique du masquage (Masking) combinée avec des exécutions à temps constant (Constant-Time) ✅
- B) Augmenter la fréquence d'horloge du processeur
- C) Désactiver le Pare-feu Windows
- D) Utiliser des câbles réseau blindés

**Q5.** Dans la cryptanalyse différentielle, la **DDT (Difference Distribution Table)** mesure :

- A) Le temps moyen de réponse d'une base de données
- B) La probabilité d'obtenir une différence de sortie $\Delta Y$ donnée pour une différence d'entrée $\Delta X$ au travers d'une S-Box ✅
- C) La distance physique entre le serveur et le client
- D) La taille des fichiers ZIP compressés

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
