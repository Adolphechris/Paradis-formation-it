# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 417 (6h) : Attaques par Canaux Auxiliaires (Side-Channel Attacks) — Timing Attacks, SPA/DPA (Power Analysis), Cache-Bleed (Spectre/Flush+Reload) & Constant-Time Programming Engineering

> [!NOTE]
> **Objectif du jour :** Maîtriser l'analyse et la prévention des **Attaques par Canaux Auxiliaires (Side-Channel Attacks — SCA)** sur les algorithmes cryptographiques : comprendre les fuites d'informations via les variations d'exécution temporelles (**Timing Attacks**), la consommation de puissance électrique (**Simple & Differential Power Analysis — SPA/DPA**), les micro-architectures de cache CPU (**Flush+Reload, Prime+Probe, Spectre/Meltdown**), et implémenter la programmation en temps constant (**Constant-Time Code**) et le masquage cryptographique (**Blinding & Masking**).
>
> **Compétences visées :** `SCA-ADV-01` (A) — Side-Channel Vulnerability Identification (Timing Leakage, Power Analysis, Cache Attacks) | `SCA-ADV-02` (A) — Constant-Time Programming Practices, RSA Blinding & Countermeasure Implementation

---

## 1) Module — Typologie des Canaux Auxiliaires & Mécanismes de Fuite (2h)

### 📖 Narration/Intuition

Un algorithme cryptographique peut être mathématiquement incassable tout en étant totalement vulnérable au niveau de son implémentation physique ou logicielle. Lorsqu'un processeur exécute une opération cryptographique (ex: exponentiation modulaire RSA ou S-Box AES), les fuites physiques (temps d'exécution, courant électrique, émission électromagnétique, hits/misses de cache L1/L3) révèlent la clé privée bit par bit.

```
  ═══════════════════════════════════════════════════════════════════
    TYPOLOGIE DES CANAUX AUXILIAIRES (SIDE-CHANNEL ATTACKS)
  ═══════════════════════════════════════════════════════════════════

  Canal Auxiliaire      Principe de la Fuite            Exemple d'Attaque
  ────────────────      ────────────────────            ─────────────────
  Temps d'exécution     Branchement conditionnel        Bleichenbacher Oracle,
                        dépendant de la clé             Timing Attack RSA

  Consommation Élect.   Variations de courant selon     SPA (Simple Power Analysis),
                        les bits 0/1 de la clé privée   DPA (Differential Power)

  Cache Micro-CPU       Partage du cache L1/L3 entre     Flush+Reload, Prime+Probe,
                        processus (Hit vs Miss time)    Spectre / Cache-Bleed

  Injection de Fautes   Glitch de tension / horloge     Differential Fault Analysis
                        pendant le calcul RSA/AES       (DFA RSA-CRT Break)

  ═══════════════════════════════════════════════════════════════════
  EXEMPLE D'IMPLÉMENTATION VULNÉRABLE (EXPONENTIATION RSA NON-CONSTANTE)
  ═══════════════════════════════════════════════════════════════════

  def rsa_square_and_multiply_VULNERABLE(base, exp_bits, mod):
      res = 1
      for bit in exp_bits:
          res = (res * res) % mod         # Toujours exécuté (Square)
          if bit == 1:                     # ⚠️ BRANCHEMENT CONDITIONNEL SUR LA CLÉ !
              res = (res * base) % mod     # Exécuté SEULEMENT si bit == 1 (Multiply)
      return res
      # ──► Un attaquant mesurant le temps ou le courant détecte chaque '1' !
```

---

## 2) Module — Outillage Side-Channel Analysis Engine (`side_channel_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import time
import secrets
import json
from datetime import datetime, timezone
from typing import List, Tuple

class SideChannelAnalysisEngine:
    """
    Moteur de simulation et de détection des vulnérabilités par canaux auxiliaires :
    - Comparaison de chaînes vulnérable (Timing Leakage) vs Temps Constant
    - RSA Exponentiation Blinding (Masquage contre SPA/DPA)
    - Statistiques de détection de fuite temporelle
    """

    def __init__(self):
        self.audit_log = []

    def insecure_string_equals_VULNERABLE(val1: bytes, val2: bytes) -> bool:
        """
        ⚠️ IMPLÉMENTATION VULNÉRABLE : s'arrête au premier octet différent.
        Un attaquant mesurant la durée de comparaison peut deviner le secret octet par octet !
        """
        if len(val1) != len(val2):
            return False
        for a, b in zip(val1, val2):
            if a != b:
                return False  # ⚠️ Early return = Fuite temporelle critique !
            time.sleep(0.0001)  # Amplification de la fuite pour la démo
        return True

    def constant_time_equals_SECURE(val1: bytes, val2: bytes) -> bool:
        """
        ✅ IMPLÉMENTATION SÉCURISÉE EN TEMPS CONSTANT :
        Parcourt TOUJOURS l'intégralité de la chaîne et accumule les différences avec OR binaire.
        """
        if len(val1) != len(val2):
            return False
        result = 0
        for a, b in zip(val1, val2):
            result |= (a ^ b)  # Accumulation binaire sans branchement conditionnel
            time.sleep(0.0001)  # Maintien de la constante temporelle
        return result == 0

    def rsa_blinding_countermeasure(self, message: int, d: int, n: int, e: int) -> int:
        """
        ✅ RSA BLINDING (Masquage Cryptographique) :
        Protège l'exponentiation modulaire RSA contre SPA/DPA/Timing Attacks.
        Message Masqué: m' = (m * r^e) mod n  (où r est un nombre aléatoire secret)
        Calcul Masqué:   s' = (m')^d mod n
        Dé-masquage:     s  = (s' * r^-1) mod n
        L'attaquant ne manipule jamais la valeur réelle 'm', éliminant les fuites.
        """
        # 1. Génération du facteur de masquage r aléatoire copremier avec n
        r = secrets.randbelow(n - 2) + 2
        
        # 2. Masquage du message : m' = (m * r^e) mod n
        r_e = pow(r, e, n)
        message_blinded = (message * r_e) % n

        # 3. Exponentiation privée sur la valeur masquée : s' = (m')^d mod n
        signature_blinded = pow(message_blinded, d, n)

        # 4. Dé-masquage : s = (s' * r^-1) mod n
        r_inv = pow(r, -1, n)
        signature = (signature_blinded * r_inv) % n

        print(f"  [RSA BLINDING] Facteur aléatoire r généré — Signature dé-masquée valide ✅")
        return signature

    def benchmark_timing_vulnerability(self, secret: bytes, guesses: List[bytes]) -> dict:
        """Mesure et compare le temps d'exécution entre la méthode vulnérable et constante."""
        print("\n[*] BENCHMARK FUITE TEMPORELLE (TIMING ATTACK SIMULATION)")
        
        timing_vulnerable = []
        timing_secure = []

        for guess in guesses:
            # Mesure méthode vulnérable
            start = time.perf_counter_ns()
            SideChannelAnalysisEngine.insecure_string_equals_VULNERABLE(secret, guess)
            elapsed_vuln = time.perf_counter_ns() - start
            timing_vulnerable.append((guess.hex()[:8], elapsed_vuln))

            # Mesure méthode sécurisée
            start = time.perf_counter_ns()
            SideChannelAnalysisEngine.constant_time_equals_SECURE(secret, guess)
            elapsed_sec = time.perf_counter_ns() - start
            timing_secure.append((guess.hex()[:8], elapsed_sec))

        print("  [VULNÉRABLE] Variance des temps selon le nombre d'octets corrects:")
        for g, t in timing_vulnerable:
            print(f"    Guess '{g}': {t} ns")

        print("  [SÉCURISÉ TEMPS CONSTANT] Temps quasi-identique indépendant du guess:")
        for g, t in timing_secure:
            print(f"    Guess '{g}': {t} ns")

        return {
            "status": "TIMING_BENCHMARK_COMPLETED",
            "vulnerable_variance_ns": max(t for _, t in timing_vulnerable) - min(t for _, t in timing_vulnerable),
            "secure_variance_ns": max(t for _, t in timing_secure) - min(t for _, t in timing_secure)
        }

# Démonstration Side-Channel Engine
engine = SideChannelAnalysisEngine()
print("=== SIDE-CHANNEL ANALYSIS & COUNTERMEASURES ENGINE ===")

# 1. Benchmark Fuite Temporelle
secret_key = b"PARADIS_SECRET_TOKEN_2026"
guesses = [
    b"XARADIS_SECRET_TOKEN_2026",  # 0 octets corrects (échec au 1er octet)
    b"PARADIS_XECRET_TOKEN_2026",  # 8 octets corrects (échec au 9e octet)
    b"PARADIS_SECRET_TOKEN_2026",  # 100% correct
]
engine.benchmark_timing_vulnerability(secret_key, guesses)

# 2. RSA Blinding Countermeasure
engine.rsa_blinding_countermeasure(
    message=0x123456789,
    d=65537, n=119048849, e=17
)
```

---

## 3) Module — Fiche des Bonnes Pratiques Constant-Time Programming (2h)

```c
// REGLES D'OR DE PROGRAMMATION EN TEMPS CONSTANT (C / RUST)

// 1. PAS DE BRANCHEMENT CONDITIONNEL SUR DES DONNÉES SECRÈTES
// MAUVAIS: if (secret_bit == 1) { compute_a(); } else { compute_b(); }
// BON:     select_constant_time(secret_bit, value_a, value_b);

// 2. PAS D'INDEXATION DE TABLEAU VIA DES DONNÉES SECRÈTES (Cache Collisions)
// MAUVAIS: uint8_t val = sbox[secret_byte];  // Fuite dans le cache L1 !
// BON:     Bitsliced implementation ou AES-NI matériel (instructions CPU dédiées)

// 3. PAS DE DIVISIONS OU MULTIPLICATIONS SUR DES Processors à Temps Variable
// Préférer les opérations logiques (AND, OR, XOR, SHIFT)

// 4. UTILISER LES COMPILATEURS ET BIBLIOTHÈQUES SÉCURISÉES
// OpenSSL: CRYPTO_memcmp(), libsodium: sodium_memcmp()
// Rust: subtile crate (Choice, ConstantTimeEq)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SCA** | Side-Channel Attack — Attaque exploitant l'implémentation physique d'un algorithme (temps, courant, cache) |
| **SPA** | Simple Power Analysis — Analyse directe de la courbe de consommation électrique pendant un calcul crypto |
| **DPA** | Differential Power Analysis — Analyse statistique de milliers de courbes de courant pour isoler la clé |
| **RSA Blinding** | Technique de masquage mathématique du message RSA évitant les attaques SPA/DPA/Timing |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Pourquoi la fonction de comparaison de chaînes classique `if (str1 == str2)` est-elle une vulnérabilité critique lorsqu'elle compare des jetons secrets ou des MACs HMAC ?
- A) Parce qu'elle s'interrompt dès le premier octet différent (`early return`), permettant à un attaquant de deviner le secret octet par octet en mesurant précisément le temps de réponse
- B) Parce qu'elle ne fonctionne qu'avec les chaînes ASCII
- C) Parce qu'elle consomme trop de mémoire RAM
- D) Parce qu'elle inverse les octets du secret

**Réponse : A**

**Q2 :** Quel est le principe du **RSA Blinding** pour contrer les attaques par canaux auxiliaires ?
- A) Multiplier le message par un facteur aléatoire $r^e \pmod n$ avant l'exponentiation privée, puis diviser le résultat par $r \pmod n$, empêchant l'attaquant de corréler le calcul physique avec le message réel
- B) Doubler la longueur de la clé RSA
- C) Re-générer les clés RSA à chaque signature
- D) Chiffrer la clé privée avec AES-256

**Réponse : A**

**Q3 :** En quoi consiste une attaque de type **Flush+Reload** sur le cache micro-architectural d'un processeur CPU ?
- A) L'attaquant vide une ligne de cache partagée (Flush), attend que la cible s'exécute, puis mesure le temps d'accès à cette ligne (Reload) : un accès rapide (Hit) prouve que la cible a accédé à cette donnée mémoire
- B) L'attaquant formate le disque dur du serveur
- C) L'attaquant envoie des paquets UDP massifs
- D) L'attaquant modifie le code source du noyau Linux

**Réponse : A**

**Q4 :** Pourquoi l'utilisation des instructions matérielles **AES-NI** intégrées aux processeurs est-elle recommandée pour éliminer les fuites par canaux auxiliaires ?
- A) Parce qu'AES-NI exécute l'intégralité du chiffrement AES en temps constant au niveau du silicium, éliminant les accès aux tables S-Box en mémoire qui fuient dans le cache CPU
- B) Parce qu'AES-NI est gratuit
- C) Parce qu'AES-NI utilise moins de tension électrique
- D) Parce qu'AES-NI fonctionne sans clé

**Réponse : A**

**Q5 :** Dans la crate Rust `subtle` ou la fonction OpenSSL `CRYPTO_memcmp`, comment la comparaison en temps constant est-elle garantie ?
- A) En parcourant systématiquement l'intégralité de la chaîne d'octets sans aucun branchement conditionnel (`if`) et en accumulant les différences via un opérateur `OR` binaire (`result |= a ^ b`)
- B) En ajoutant un délai `sleep()` aléatoire
- C) En convertissant les chaînes en nombres flottants
- D) En envoyant les chaînes à un serveur HSM

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
