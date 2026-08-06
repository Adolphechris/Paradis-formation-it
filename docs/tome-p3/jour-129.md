# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 129 (6h) : Sécurité de la Cryptographie Homomorphe & Privacy-Preserving Computation (HElib, SEAL & Secure Multi-Party Computation - SMPC)

> [!NOTE]
> **Objectif du jour :** Comprendre et expérimenter les technologies de calcul sur données chiffrées sans déchiffrement (Privacy-Preserving Computation) : Cryptographie Fully Homomorphic (FHE / Microsoft SEAL / HElib), calcul multi-parties sécurisé (SMPC), et analyse confidentielle des données bancaires dans le Cloud.
>
> **Compétences visées :** `SEC-02` (A) — Cryptographie Homomorphe (FHE) | `SEC-01` (A) — Privacy-Preserving Computation & SMPC

---

## 1) Module — Le Graal de la Cryptographie : Fully Homomorphic Encryption (FHE) (2h)

### 📖 Narration/Intuition

Dans le chiffrement classique (AES, RSA), pour effectuer une opération mathématique sur des données chiffrées (ex: calculer la moyenne des soldes bancaires des clients de la BCC hébergés dans le Cloud), le serveur doit obligatoirement **déchiffrer les données en mémoire RAM**. Si le serveur Cloud est compromis par un attaquant ou un administrateur malveillant à cet instant précis, les données en clair sont volées.

La **Cryptographie Fully Homomorphe (FHE - Fully Homomorphic Encryption)** est le saint graal de la cybersécurité : elle permet à un serveur tiers ou un cloud d'effectuer des additions et des multiplications complexes **directement sur le ciphertext (les données chiffrées)** sans JAMAIS posséder la clé de déchiffrement ni voir la moindre donnée en clair. Le résultat retourné est chiffré, et seul le client détenant la clé privée peut le déchiffrer.

### 🔍 Anatomie Technique

**Principe Mathématique de l'Homomorphisme :**

$$\text{Soit } E(m) \text{ la fonction de chiffrement du message } m :$$

$$E(m_1) \otimes E(m_2) = E(m_1 + m_2)$$

$$E(m_1) \odot E(m_2) = E(m_1 \times m_2)$$

```
Client (BCC Kinshasa)                      Cloud Tiers (Non-Confiance)
┌───────────────────────────┐             ┌───────────────────────────┐
│ Données : A = 10, B = 20  │             │                           │
│ Chiffrement FHE :         │             │                           │
│ Enc(A) = 0x8F9A...        ├────────────→│ Reçoit : Enc(A), Enc(B)   │
│ Enc(B) = 0x3C2B...        │             │ Effectue l'addition FHE:  │
│                           │             │ Enc(A) + Enc(B)           │
│                           │             │ Résultat = 0x7E11...      │
│                           │←────────────┤                           │
│ Déchiffre 0x7E11...       │             └───────────────────────────┘
│ Résultat : 30 ! ✅        │
└───────────────────────────┘
```

---

## 2) Module — Calcul Multi-Parties Sécurisé (SMPC) (2h)

### 📖 Narration/Intuition

Le **Calcul Multi-Parties Sécurisé (SMPC - Secure Multi-Party Computation)** permet à plusieurs institutions financières concurrentes (ex: 5 banques de la région) de calculer conjointement une fonction (ex: détecter si un client est sur-endetté à l'échelle nationale) **sans qu'aucune banque ne révèle ses données clients aux autres banques**.

Chaque banque découpe ses données en "Secret Shares" aléatoires redistribuées entre les participants.

### 🔍 Anatomie Technique

**Exemple de Chiffrement Homomorphe en Python (Bibliothèque TenSEAL / PySEAL) :**

```python
#!/usr/bin/env python3
"""
fhe_banking_demo.py — Démonstration de calcul homomorphe FHE sur données bancaires chiffrées
Nécessite tenseal (Microsoft SEAL wrapper)
"""
import tenseal as ts

# 1. Génération du contexte cryptographique FHE (BFV Scheme pour entiers)
context = ts.context(
    ts.SCHEME_TYPE.BFV,
    poly_modulus_degree=4096,
    plain_modulus=1032193
)
context.generate_relin_keys()

print("=== DEUX BANQUES : CALCUL SUR DONNÉES CHIFFRÉES (FHE) ===")

# 2. Données bancaires en clair côté client
solde_compte_1 = [150000] # 150.000 CDF
solde_compte_2 = [350000] # 350.000 CDF

# 3. Chiffrement Homomorphe des soldes
enc_solde_1 = ts.bfv_vector(context, solde_compte_1)
enc_solde_2 = ts.bfv_vector(context, solde_compte_2)

print(f"[+] Donnée chiffrée 1 (Ciphertext) : {enc_solde_1}")
print(f"[+] Donnée chiffrée 2 (Ciphertext) : {enc_solde_2}")

# ─── 4. OPÉRATION EXÉCUTÉE SUR UN SERVEUR CLOUD SANS DÉCHIFFREMENT ───────────
# Le serveur Cloud additionne les deux ciphertexts sans connaître la clé privée !
enc_somme = enc_solde_1 + enc_solde_2

print(f"[+] Calcul Cloud terminé. Résultat chiffré : {enc_somme}")

# ─── 5. Le client télécharge le résultat chiffré et le déchiffre chez lui ─────
somme_dechiffree = enc_somme.decrypt()
print(f"✅ Déchiffrement Client -> Somme Totale Calculée : {somme_dechiffree[0]} CDF !")
```

---

## 3) Module — Cas d'Usage Bancaires & Limitations de FHE (2h)

### 📖 Narration/Intuition

Bien que révolutionnaire, la Cryptographie Fully Homomorphic présente des défis de calcul : le chiffrement FHE introduit un "bruit cryptographique" qui grandit à chaque multiplication, exigeant des opérations d'assainissement de bruit (**Bootstrapping**). Les temps de calcul sont environ 1 000 fois plus lents que sur des données en clair.

### 🔍 Anatomie Technique

**Champs d'application et limites :**

```
- Cas d'usage bancaires : Scoring de crédit confidentiel dans le Cloud, recherche dans des bases de données chiffrées, détection d'anti-blanchiment interbancaire.
- Schémas FHE majeurs : BGV, BFV (pour les entiers), CKKS (pour les nombres à virgule flottante / IA).
- Librairies de référence : Microsoft SEAL, IBM HElib, PALISADE / OpenFHE, TenSEAL.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **FHE** | Fully Homomorphic Encryption — Chiffrement pleinement homomorphe permettant tout calcul sur ciphertext |
| **SMPC** | Secure Multi-Party Computation — Calcul multi-parties sécurisé sans tiers de confiance |
| **CKKS / BFV** | Schémas mathématiques standards de cryptographie homomorphe |
| **Bootstrapping** | Opération d'assainissement du bruit cryptographique dans les schémas FHE |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence fondamentale entre le chiffrement traditionnel (AES-256) et le chiffrement Homomorphe (FHE) en termes de traitement des données dans le Cloud ?

**Corrigé :** Avec le chiffrement traditionnel (AES-256), les données sont chiffrées en transit et au repos, mais doivent être **obligatoirement déchiffrées en clair en mémoire RAM** du serveur Cloud pour qu'un programme puisse effectuer un calcul (ex: additionner des soldes). Si le serveur est compromis, la mémoire RAM est lisible. Avec le **chiffrement Homomorphe (FHE)**, le serveur Cloud effectue l'opération mathématique **directement sur les données chiffrées (Ciphertext)** sans jamais les déchiffrer. Le Cloud produit un résultat chiffré sans avoir eu accès à la moindre valeur en clair à aucun moment.

**Exercice 2 :** Qu'est-ce que le phénomène de **Bruit Cryptographique (Noise)** dans la Cryptographie Homomorphe et comment le **Bootstrapping** permet-il de le résoudre ?

**Corrigé :** Dans les schémas FHE (comme BFV ou CKKS), chaque opération mathématique (et en particulier la multiplication) injecte une petite quantité de "bruit" cryptographique dans le ciphertext. Si trop de multiplications sont enchaînées, le niveau de bruit dépasse le seuil de tolérance et les données deviennent indéchiffrables. Le **Bootstrapping** est une opération cryptographique lourde qui évalue la fonction de déchiffrement de manière homomorphe pour "nettoyer" et réinitialiser le niveau de bruit du ciphertext sans révéler la clé privée, permettant d'exécuter un nombre illimité de calculs.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle technologie cryptographique révolutionnaire permet d'effectuer des calculs mathématiques directement sur des données chiffrées sans jamais avoir à les déchiffrer ?
- A) FHE (Fully Homomorphic Encryption)
- B) MS-DOS
- C) Disquette
- D) Câble VGA

**Réponse : A**

**Q2 :** Quelle bibliothèque open-source développée par Microsoft est l'une des références mondiales pour l'implémentation de la cryptographie homomorphe ?
- A) Microsoft SEAL (ou TenSEAL)
- B) Paint
- C) Word
- D) Excel

**Réponse : A**

**Q3 :** Quel protocole cryptographique permet à plusieurs banques concurrentes d'évaluer conjointement une fonction statistique sans qu'aucune banque ne doive partager ses données privées avec les autres ?
- A) SMPC (Secure Multi-Party Computation)
- B) POP3
- C) Telnet
- D) FTP

**Réponse : A**

**Q4 :** Dans les schémas de chiffrement homomorphe, quelle opération complexe permet de réduire le "bruit" cryptographique accumulé après plusieurs multiplications pour pouvoir continuer les calculs ?
- A) Bootstrapping
- B) Formatting
- C) Rebooting
- D) Printing

**Réponse : A**

**Q5 :** Quel schéma cryptographique homomorphe est spécialement adapté au traitement des nombres à virgule flottante (réels), très utilisé pour l'évaluation de modèles d'IA sur données chiffrées ?
- A) CKKS
- B) MD5
- C) SHA-1
- D) ASCII

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
