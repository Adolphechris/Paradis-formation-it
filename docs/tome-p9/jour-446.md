# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 446 (6h) : Chiffrement Homomorphe (FHE), Secure Multi-Party Computation (SMPC) & Privacy-Preserving Machine Learning

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre les propriétés mathématiques du **Chiffrement Homomorphe (FHE)** : Partiellement (PHE), Nivelé (LHE), et Totalement (FHE — Gentry 2009)
> - Analyser les schémas FHE modernes : **BFV/BGV** (arithmétique entière) et **CKKS** (arithmétique à virgule flottante approchée)
> - Implémenter un calcul statistique confidentiel (somme/moyenne) sur données chiffrées avec **Microsoft SEAL / TenSEAL**
> - Déployer des protocoles **Secure Multi-Party Computation (SMPC)** pour des enchères confidentielles, votes anonymes et fédération de données sensibles
>
> **Compétences visées :** `SEC-04` (A) — Homomorphic Encryption, `SEC-06` (A) — Privacy-Preserving Computation

---

## Module 1 — Chiffrement Homomorphe : Propriétés et Schémas (2h)

### 📖 Intuition & Narration

Le **Chiffrement Homomorphe (FHE)** est le Saint Graal de la cryptographie : il permet d'effectuer des calculs sur des données chiffrées sans jamais les déchiffrer. Le serveur de calcul (Cloud, IA) ne voit jamais les données en clair — il manipule uniquement des ciphertexts, et le résultat déchiffré est identique au résultat du même calcul effectué sur les données en clair.

**Application directe :** Une banque confie à un prestataire Cloud le calcul du score de crédit de ses clients sans lui révéler les données personnelles. Le Cloud retourne un score chiffré. La banque déchiffre et obtient le résultat.

### 🔍 Anatomie Technique — Hiérarchie des Chiffrements Homomorphes

```
HIÉRARCHIE DU CHIFFREMENT HOMOMORPHE

  1. PHE (Partiellement Homomorphe)     — UNE seule opération, nombre illimité de fois
     ├── Paillier : Additif (E(a)*E(b) = E(a+b))
     └── RSA non-padded : Multiplicatif (E(a)*E(b) = E(a*b))

  2. SHE (Somewhat Homomorphe)          — Additions ET Multiplications, nombre LIMITÉ
     ├── Croissance du bruit à chaque multiplication
     └── Budget de "bruit" épuisé → déchiffrement impossible

  3. LHE (Nivelé / Leveled Homomorphe) — Profondeur de circuit bornée D au setup
     ├── BGV / BFV (SEAL) : Arithmétique entière modulaire

  4. FHE (Totalement Homomorphe)        — Calcul ARBITRAIRE, grâce au Bootstrapping
     └── TFHE / CKKS + Bootstrapping : Calcul arbitraire sur réels ou booléens
```

---

## Module 2 — CKKS & TenSEAL : Calcul sur Données Médicales Chiffrées (2h)

### 🛠️ Atelier Pratique — Calcul de Moyenne sur Vecteurs Chiffrés (CKKS)

```python
#!/usr/bin/env python3
"""
PARADIS — Calcul Homomorphe Confidentiel avec TenSEAL (Microsoft SEAL / CKKS)
Calculer la moyenne de salaires chiffrés sans jamais voir les salaires individuels
"""

import tenseal as ts
import numpy as np

def demo_homomorphic_mean():
    """
    Scénario : 5 employés souhaitent calculer leur salaire moyen
    sans révéler leur salaire individuel à personne (pas même au serveur).
    """
    # 1. Paramètres CKKS (Context)
    context = ts.context(
        ts.SCHEME_TYPE.CKKS,
        poly_modulus_degree=8192,
        coeff_mod_bit_sizes=[60, 40, 40, 60]  # Bits de précision CKKS
    )
    context.global_scale = 2 ** 40
    context.generate_galois_keys()

    print("[*] CKKS Context généré (poly_modulus_degree=8192)")

    # 2. Données sensibles : salaires individuels (en clair côté clients)
    salaires_clair = [48000.0, 55000.0, 61000.0, 43000.0, 72000.0]
    print(f"[*] Salaires en clair (jamais envoyés au serveur) : {salaires_clair}")
    moyenne_attendue = np.mean(salaires_clair)

    # 3. Chiffrement CKKS : chaque employé chiffre son salaire individuellement
    salaires_chiffres = [ts.ckks_vector(context, [s]) for s in salaires_clair]
    print("[*] Salaires chiffrés (ciphertexts envoyés au serveur Cloud)")

    # 4. CALCUL HOMOMORPHE CÔTÉ SERVEUR (le serveur ne voit que des ciphertexts !)
    # Somme homomorphe des vecteurs chiffrés
    somme_chiffree = salaires_chiffres[0]
    for c in salaires_chiffres[1:]:
        somme_chiffree += c

    # Division par 5 (multiplication par la constante 0.2) — opération homomorphe
    diviseur = ts.ckks_vector(context, [1.0 / len(salaires_clair)])
    moyenne_chiffree = somme_chiffree.mul_plain(1.0 / len(salaires_clair))

    print("[*] Calcul de la moyenne effectué ENTIÈREMENT sur les ciphertexts")

    # 5. Déchiffrement côté client (seul le client possède la clé secrète)
    moyenne_dechiffree = moyenne_chiffree.decrypt()[0]

    print(f"[+] Résultat déchiffré : {moyenne_dechiffree:.2f} €")
    print(f"[+] Résultat attendu   : {moyenne_attendue:.2f} €")
    print(f"[+] Erreur CKKS        : {abs(moyenne_dechiffree - moyenne_attendue):.6f} € (précision virgule flottante approchée)")
    assert abs(moyenne_dechiffree - moyenne_attendue) < 1.0, "Erreur trop importante !"
    print("  ✅ Calcul Homomorphe CKKS réussi — Le serveur n'a jamais vu les salaires !")

try:
    demo_homomorphic_mean()
except ImportError:
    print("[i] Installer tenseal pour exécuter : pip install tenseal")
```

---

## Module 3 — Secure Multi-Party Computation (SMPC) (1h30)

### 📖 Intuition & Narration

Contrairement au FHE (qui confie le calcul à un serveur Cloud unique), le **SMPC** répartit le calcul entre plusieurs parties qui coopèrent sans jamais révéler leurs données privées individuelles. Le résultat est calculé collectivement, et chaque partie apprend uniquement le résultat final, pas les inputs des autres.

### 🔍 Anatomie Technique — SMPC : Secret Sharing (Shamir)

```
PROTOCOLE SMPC AVEC PARTAGE DE SECRET SHAMIR (k-of-n)

  Donnée secrète S = 1500 (résultat d'une enchère confidentielle)

  1. Le secret S est divisé en n=3 parts avec un polynôme aléatoire de degré k-1=1 :
     P(x) = S + a*x  (avec a aléatoire, ex: a = 42)
     Part 1 : P(1) = 1500 + 42*1 = 1542
     Part 2 : P(2) = 1500 + 42*2 = 1584
     Part 3 : P(3) = 1500 + 42*3 = 1626

  2. Chaque participant reçoit une part différente UNIQUEMENT.

  3. Reconstruction avec k=2 parts quelconques (Lagrange Interpolation) :
     P(0) = S récupéré. Avec seulement 1 part ─▶ RIEN n'est révélé !
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **FHE** | Fully Homomorphic Encryption — Chiffrement permettant des calculs arbitraires sur ciphertexts |
| **CKKS** | Cheon-Kim-Kim-Song — Schéma FHE optimisé pour l'arithmétique à virgule flottante approchée |
| **BGV/BFV** | Brakerski-Gentry-Vaikuntanathan / Brakerski-Fan-Vercauteren — Schémas FHE pour entiers |
| **SMPC** | Secure Multi-Party Computation — Protocole de calcul distribué entre parties sans révélation |
| **Bootstrapping** | Technique FHE de "rafraîchissement" du bruit d'un ciphertext, permettant un calcul illimité |

---

## Exercices Pratiques

### Exercice 1 — Propriété Additivement Homomorphe (Paillier)

Le schéma de Paillier est **additif homomorphe** : $\text{Dec}(E(a) \cdot E(b) \mod n^2) = a + b$.

Une élection électronique utilise Paillier pour comptabiliser les votes. Expliquez le protocole de vote confidentiel et prouvez qu'il est correct pour 3 votants : $v_1 = 1, v_2 = 0, v_3 = 1$ (total attendu : 2).

**Corrigé guidé :**
1. Chaque votant chiffre son vote : $E(v_1), E(v_2), E(v_3)$ avec la clé publique électorale.
2. Le serveur d'élection calcule le produit homomorphe : $C_{total} = E(v_1) \cdot E(v_2) \cdot E(v_3) \mod n^2 = E(v_1 + v_2 + v_3) = E(2)$.
3. L'autorité de dépouillement déchiffre : $\text{Dec}(C_{total}) = 2$, le total de votes "Oui".
4. Le serveur n'a jamais vu les votes individuels en clair — seul le total agrégé est révélé.

---

## Banque QCM — 5 Questions

**Q1.** Le chiffrement **Totalement Homomorphe (FHE)** est "total" car il permet :

- A) De chiffrer des fichiers de taille illimitée
- B) D'effectuer un nombre arbitraire d'additions ET de multiplications sur des ciphertexts ✅
- C) D'utiliser n'importe quelle clé de longueur choisie
- D) D'authentifier tous les utilisateurs simultanément

**Q2.** Le schéma CKKS est particulièrement adapté aux calculs de type :

- A) Routage de paquets TCP/IP
- B) Arithmétique approchée à virgule flottante (Machine Learning, Statistiques, Calcul financier) ✅
- C) Déchiffrement de hashes SHA-512
- D) Génération de nombres premiers RSA

**Q3.** Dans le Partage de Secret de Shamir (k-of-n), avec k=3 sur n=5, un attaquant qui obtient 2 des 5 parts apprend :

- A) Exactement la moitié du secret
- B) Strictement aucune information sur le secret (théoriquement sûr) ✅
- C) Le champ d'utilisation de la clé
- D) Le nom du détenteur du secret

**Q4.** Le **Bootstrapping** dans un schéma FHE sert à :

- A) Démarrer le serveur Cloud
- B) Éliminer le bruit accumulé dans un ciphertext après de nombreuses multiplications, permettant de continuer les calculs ✅
- C) Générer des nonces aléatoires
- D) Vérifier les certificats X.509

**Q5.** Le **SMPC (Secure Multi-Party Computation)** se distingue du FHE car :

- A) SMPC est plus lent que le FHE dans tous les cas
- B) SMPC répartit le calcul entre plusieurs parties coopératives sans serveur centralisé, contrairement au FHE qui délègue à un seul serveur ✅
- C) SMPC ne peut pas traiter des nombres entiers
- D) FHE nécessite l'accord de toutes les parties

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
