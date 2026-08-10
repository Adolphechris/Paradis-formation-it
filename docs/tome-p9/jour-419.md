# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 419 (6h) : Zero-Knowledge Proofs (ZKP) & Privacy Engineering — zk-SNARKs, zk-STARKs, Pedersen Commitments & Homomorphic Encryption (FHE)

> [!NOTE]
> **Objectif du jour :** Maîtriser les fondements théoriques et appliqués des **Preuves à Divulgation Nulle de Connaissance (Zero-Knowledge Proofs — ZKP)** et de la cryptographie préservant la vie privée (Privacy Engineering) : comprendre les trois propriétés fondamentales (Completeness, Soundness, Zero-Knowledge), comparer les constructions **zk-SNARKs** (Groth16/Plonk avec Trusted Setup) vs **zk-STARKs** (Post-Quantum sans Trusted Setup), implémenter les **Pedersen Commitments** (Homomorphic Commitments) et explorer les principes du **Fully Homomorphic Encryption (FHE — CKKS/BGV)**.
>
> **Compétences visées :** `ZKP-ADV-01` (A) — Zero-Knowledge Theory (Completeness, Soundness, Zero-Knowledge) & zk-SNARKs vs zk-STARKs Architecture | `ZKP-ADV-02` (A) — Pedersen Commitment Implementation, Homomorphic Additive Properties & FHE Privacy Engineering

---

## 1) Module — Théorie ZKP & Architecture zk-SNARKs vs zk-STARKs (2h)

### 📖 Narration/Intuition

Une Preuve à Divulgation Nulle de Connaissance (ZKP) permet à une partie (le **Prouveur — Prover**) de prouver cryptographiquement à une autre (le **Vérificateur — Verifier**) qu'une affirmation est vraie (ex: "je possède le mot de passe" ou "mon solde est supérieur à 1000 €"), **sans révéler la moindre information supplémentaire**.

```
  ═══════════════════════════════════════════════════════════════════
    LES 3 PROPRIÉTÉS FONDAMENTALES D'UNE PREUVE ZERO-KNOWLEDGE
  ═══════════════════════════════════════════════════════════════════

  1. COMPLETENESS (Complétude) :
     Si l’affirmation est vraie et que le Prouveur suit le protocole,
     le Vérificateur sera TOUJOURS convaincu.

  2. SOUNDNESS (Correction) :
     Si l’affirmation est fausse, aucun Prouveur malhonnête ne peut
     convaincre le Vérificateur (sauf probabilité négligeable).

  3. ZERO-KNOWLEDGE (Divulgation Nulle) :
     Le Vérificateur n’apprend STRICTEMENT RIEN d’autre que le fait
     que l’affirmation est vraie.

  ═══════════════════════════════════════════════════════════════════
    COMPARAISON ARCHITECTURALE : zk-SNARKs vs zk-STARKs
  ═══════════════════════════════════════════════════════════════════

  Critère               zk-SNARKs (ex: Groth16 / Plonk)  zk-STARKs (ex: STARKWARE)
  ───────               ───────────────────────────────  ─────────────────────────
  Taille de la Preuve   🚀 Ultra-courte (~288 octets)    🟡 Plus grande (~10-100 KB)
  Temps de Vérification 🚀 Ultra-rapide (~ms)            🚀 Très rapide
  Trusted Setup         ⚠️ Requis (Cérémonie CRS)       ✅ AUCUN (Transparent)
  Sécurité Quantique    ❌ Non (Basé sur ECC)            ✅ OUI (Post-Quantique Hash-based)
```

---

## 2) Module — Outillage Pedersen Commitments & ZKP Engine (`zkp_pedersen_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import secrets
import hashlib
import json
from datetime import datetime, timezone

class ZKPPedersenEngine:
    """
    Moteur de simulation cryptographique ZKP & Pedersen Commitments :
    - Engagement homomorphe de Pedersen : C = g^v * h^r mod p
    - Propriété d'addition homomorphe : C(v1 + v2) = C(v1) * C(v2) mod p
    - Démonstration Zero-Knowledge de possession de valeur secrète
    """

    # Paramètres de groupe modulaire simplifiés pour la démonstration (en prod: courbes Secp256k1 / Jubjub)
    # p est un grand premier, g et h sont deux générateurs du groupe dont le log discret est inconnu
    P = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F  # Secp256k1 P
    G = 2
    H = 3

    def __init__(self):
        self.commitments_registry = []

    def pedersen_commit(self, value: int) -> Tuple[int, int]:
        """
        Génère un Pedersen Commitment pour une valeur v secrète.
        C = (g^v * h^r) mod p  (où r est un blinding factor aléatoire).
        Retourne (Commitment C, Blinding Factor r).
        """
        r = secrets.randbelow(self.P - 2) + 2  # Facteur d'aveuglement aléatoire secret
        
        g_v = pow(self.G, value, self.P)
        h_r = pow(self.H, r, self.P)
        
        commitment = (g_v * h_r) % self.P
        
        print(f"  [PEDERSEN COMMIT] Valeur secrète: {value} → Commitment C: {hex(commitment)[:20]}...")
        return commitment, r

    def pedersen_verify(self, commitment: int, value: int, blinding_factor: int) -> bool:
        """Vérifie l'ouverture d'un Pedersen Commitment."""
        g_v = pow(self.G, value, self.P)
        h_r = pow(self.H, blinding_factor, self.P)
        expected_c = (g_v * h_r) % self.P
        
        valid = (commitment == expected_c)
        status = "VALIDE ✅" if valid else "INVALIDE ❌"
        print(f"  [PEDERSEN VERIFY] Ouverture du commitment: {status}")
        return valid

    def homomorphic_addition_demo(self, val1: int, val2: int) -> bool:
        """
        Démontre la propriété d'addition homomorphe des Pedersen Commitments :
        C(v1) * C(v2) mod p = C(v1 + v2) mod p
        Permet la vérification de soldes bancaires sans révéler les montants individuels !
        """
        print("\n[*] DÉMONSTRATION ADDITION HOMOMORPHE PEDERSEN")
        c1, r1 = self.pedersen_commit(val1)
        c2, r2 = self.pedersen_commit(val2)

        # Produit des commitments
        c_product = (c1 * c2) % self.P

        # Commitment direct de la somme avec la somme des r
        c_sum_direct, r_sum_direct = (pow(self.G, val1 + val2, self.P) * pow(self.H, r1 + r2, self.P)) % self.P, r1 + r2

        is_equal = (c_product == c_sum_direct)
        print(f"  [+] C(v1) * C(v2) ≡ C(v1 + v2): {is_equal} ✅ (Calculé sur valeurs cachées!)")
        return is_equal

# Démonstration ZKP Pedersen Engine
engine = ZKPPedersenEngine()
print("=== ZERO-KNOWLEDGE PROOFS & PEDERSEN ENGINE ===")

# 1. Engager un solde bancaire sans le révéler
solde_secret = 50000  # 50 000 €
c, r = engine.pedersen_commit(solde_secret)

# 2. Vérification d'ouverture
engine.pedersen_verify(c, solde_secret, r)

# 3. Addition homomorphe (ex: Virement confidentiel v1 + v2)
engine.homomorphic_addition_demo(15000, 35000)
```

---

## 3) Module — Fiche Confidentiality & Privacy Engineering (2h)

```markdown
# PRIVACY ENGINEERING : COMPARATIF ZKP VS FHE VS MPC

| Technologie | Principe Cryptographique | Cas d'Usage Majeur | Limitations |
|:---|:---|:---|:---|
| **ZKP (Zero-Knowledge Proofs)** | Prouver la validité d'un calcul sans données | Identité souveraine (SSI), Blockchains confidentielles | Complexité du Prover |
| **FHE (Fully Homomorphic Enc.)** | Calculer directement sur des données chiffrées | Calcul Cloud confidentiel (Santé, Finance) | Surcharges de calcul ($\times 10^3$) |
| **sMPC (Secure Multi-Party Computation)** | Calcul partagé entre N serveurs sans quorum | Enchères aveugles, Analyse de risque interbancaire | Bande passante réseau |
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ZKP** | Zero-Knowledge Proof — Preuve cryptographique permettant de prouver une affirmation sans révéler d'information |
| **zk-SNARK** | Zero-Knowledge Succinct Non-Interactive Argument of Knowledge — Preuve ZKP ultra-courte avec Trusted Setup |
| **zk-STARK** | Zero-Knowledge Scalable Transparent ARgument of Knowledge — Preuve ZKP post-quantique sans Trusted Setup |
| **FHE** | Fully Homomorphic Encryption — Chiffrement permettant d'effectuer des additions et multiplications sur texte chiffré |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelles sont les trois propriétés fondamentales qui définissent mathématiquement une **Preuve à Divulgation Nulle de Connaissance (ZKP)** ?
- A) Completeness (Complétude), Soundness (Correction) et Zero-Knowledge (Divulgation Nulle)
- B) Chiffrement, Hachage et Signature
- C) Confidentialité, Disponibilité et Intégrité
- D) Anonymat, Pseudonymat et Traçabilité

**Réponse : A**

**Q2 :** Quel est l'avantage principal des **zk-STARKs** par rapport aux **zk-SNARKs** classiques ?
- A) Les zk-STARKs ne nécessitent AUCUNE cérémonie de Trusted Setup (ils sont transparents) et sont intrinsèquement résistants aux ordinateurs quantiques
- B) Les zk-STARKs produisent des preuves plus petites que les zk-SNARKs
- C) Les zk-STARKs utilisent des mots de passe en clair
- D) Les zk-STARKs ne fonctionnent que sur des processeurs 32 bits

**Réponse : A**

**Q3 :** Quelle est la propriété clé d'un **Pedersen Commitment** ($C = g^v \cdot h^r \pmod p$) ?
- A) Il est à la fois **Perfectly Hiding** (il est impossible de deviner la valeur $v$ à partir de $C$) et **Computationally Binding** (il est impossible d'ouvrir $C$ avec une autre valeur $v' \neq v$)
- B) Il permet d'inverser les fonctions de hachage SHA-256
- C) Il supprime le besoin de clés privées
- D) Il est lisible par n'importe quel navigateur sans clé

**Réponse : A**

**Q4 :** Quelle propriété homomorphe des Pedersen Commitments permet de vérifier la conservation des montants dans une transaction confidentielle ($C(v_1) \cdot C(v_2) \equiv C(v_1 + v_2)$) ?
- A) L'addition homomorphe : le produit des commitments de deux valeurs équivaut au commitment de la somme de ces deux valeurs
- B) La division homomorphe
- C) La soustraction sans retenue
- D) Le produit cartésien

**Réponse : A**

**Q5 :** Quelle est la promesse fondamentale du **Fully Homomorphic Encryption (FHE)** pour la sécurité du Cloud Computing ?
- A) Permettre à un serveur Cloud d'exécuter des traitements complexes (additions, multiplications, modèles IA) directement sur des données chiffrées, sans JAMAIS avoir besoin de les déchiffrer en mémoire RAM
- B) Accélérer les téléchargements web de 50%
- C) Remplacer les pare-feux applicatifs
- D) Automatiser les sauvegardes système

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
