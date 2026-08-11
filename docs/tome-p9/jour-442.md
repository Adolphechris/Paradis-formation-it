# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 442 (6h) : Cryptanalyse Asymétrique Avancée & Réduction de Réseaux (RSA Weak Keys, Coppersmith Method, Wiener Attack & LLL Lattice Reduction)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser les faiblesses d'implémentation de **RSA** : exposants faibles ($e=3$), exposants de déchiffrement petits ($d < \frac{1}{3}N^{1/4}$), et réutilisation de modules $N$
> - Comprendre la cryptanalyse par **réduction de réseaux euclidiens (Lattice-based Cryptanalysis)** avec l'algorithme LLL (Lenstra-Lenstra-Lovász)
> - Analyser et exécuter la méthode de **Coppersmith** pour trouver des racines de polynômes modulo $N$
> - Étudier les attaques sur **DSA/ECDSA** lors de la réutilisation ou du biais sur le nonce $k$
>
> **Compétences visées :** `SEC-04` (A) — Asymmetric Cryptanalysis, `SEC-06` (A) — Advanced Mathematical Cryptanalysis

---

## Module 1 — Faiblesses et Attaques Classiques sur RSA (2h)

### 📖 Intuition & Narration

RSA repose sur la difficulté présumée de factoriser un grand nombre entier $N = p \times q$. Cependant, si les paramètres $(N, e, d)$ sont mal choisis ou si le générateur de nombres aléatoires utilisé pour générer $p$ et $q$ manque d'entropie, l'algorithme devient vulnérable à des attaques mathématiques dévastatrices sans même nécessiter la factorisation directe de $N$.

Par exemple, si deux puces IoT génèrent des clés RSA indépendamment avec un générateur de nombres aléatoires défectueux, elles peuvent partager un même facteur premier $p$. Un simple calcul de Plus Grand Commun Diviseur ($\gcd(N_1, N_2) = p$) entre leurs modules publics permet de casser les deux clés en une milliseconde !

### 🔍 Anatomie Technique — Attaques RSA Notables

```
VULNÉRABILITÉS RSA PAR PARAMÈTRES INAPPROPRIÉS

  1. GCD ATTACK (Partage de facteur premier p)
     ├── Deux modules N1 = p*q1 et N2 = p*q2
     └── Attaque : p = gcd(N1, N2) ──▶ Factorisation instantanée !

  2. WIENER'S ATTACK (Exposant de déchiffrement d trop petit)
     ├── Si d < (1/3) * N^(1/4)
     └── Attaque : Fractions continues de e/N permettent de trouver d en temps polynomial.

  3. HÅSTAD'S BROADCAST ATTACK (Petit exposant e=3 sans padding)
     ├── Même message M envoyé à 3 destinataires avec e=3 (N1, N2, N3)
     └── Attaque : Théorème des Restes Chinois (CRT) ──▶ M^3 mod (N1*N2*N3) = M^3 dans Z ──▶ Racine cubique réelle !

  4. BLEICHENBACHER PKCS#1 v1.5 PADDING ORACLE (Million Message Attack)
     ├── Attaque par canal auxiliaire sur le padding RSA PKCS#1 v1.5
     └── Attaque : Envoi de ciphertext modifiés m * s^e mod N ──▶ Déchiffrement sans d.
```

---

## Module 2 — Cryptanalyse par Réseaux (Lattices) & Algorithme LLL (2h)

### 📖 Intuition & Narration

Un **réseau (Lattice)** est un ensemble de points régulièrement espacés dans un espace vectoriel de dimension $n$, formés par toutes les combinaisons linéaires à coefficients entiers d'une base de vecteurs.

Le problème du vecteur le plus court (**Shortest Vector Problem — SVP**) consiste à trouver le point du réseau le plus proche de l'origine. L'algorithme **LLL** (Lenstra-Lenstra-Lovász) permet de trouver un vecteur quasi-court en temps polynomial. Don Coppersmith a montré en 1996 comment transformer des problèmes de cryptanalyse (retrouver des morceaux manquants de clé RSA, casser RSA avec padding partiel) en un problème de recherche de vecteur court résolu par LLL.

### 🔍 Anatomie Technique — Théorème de Coppersmith

$$\text{Soit } P(x) \text{ un polynôme unitaire de degré } d. \text{ Coppersmith a prouvé qu'on peut trouver toutes les racines } x_0$$
$$\text{satisfaisant } P(x_0) \equiv 0 \pmod N \text{ avec } |x_0| < N^{1/d} \text{ en temps polynomial via LLL.}$$

### 🛠️ Atelier Pratique — Attaque de Wiener & Coppersmith en Python (SageMath style)

```python
#!/usr/bin/env python3
"""
PARADIS — Cryptanalyse RSA : Attaque de Wiener (d trop petit)
Calcul des fractions continues de e/N pour retrouver d
"""

import math

def continued_fractions(n, d):
    """Génère la expansion en fractions continues de n/d."""
    cf = []
    while d:
        q = n // d
        cf.append(q)
        n, d = d, n - q * d
    return cf

def convergents(cf):
    """Calcule les réduites (convergents) k/d à partir des fractions continues."""
    num, den = 0, 1
    convs = []
    for q in cf:
        num, den = den, num + q * den
        convs.append((num, den))
    return convs

def wieners_attack(e: int, N: int) -> int:
    """
    Attaque de Wiener : retrouve d si d < (1/3) * N^(1/4)
    """
    cf = continued_fractions(e, N)
    convs = convergents(cf)

    for k, d in convs:
        if k == 0 or d % 2 == 0:
            continue
        
        # phi(N) = (e*d - 1) / k
        if (e * d - 1) % k != 0:
            continue
            
        phi = (e * d - 1) // k
        # Equation quadratique : x^2 - (N - phi + 1)x + N = 0
        b = N - phi + 1
        delta = b * b - 4 * N
        
        if delta >= 0:
            root_delta = int(math.isqrt(delta))
            if root_delta * root_delta == delta:
                p = (b + root_delta) // 2
                q = (b - root_delta) // 2
                if p * q == N:
                    print(f"[+] Wiener Attack SUCCESS! d = {d}, p = {p}, q = {q}")
                    return d
                    
    return None

# Démonstration avec paramètres de test (e grand, d petit)
# Exemple de clés factices avec d petit
N_test = 160523313052187687522585239109038234857
e_test = 129280058564287848698188265012543419917

d_recovered = wieners_attack(e_test, N_test)
assert d_recovered is not None, "Échec de l'attaque de Wiener"
print(f"  ✅ Clé privée d extraite en < 1 ms via l'Attaque de Wiener !")
```

---

## Module 3 — Attaques ECDSA : Nonce Reuse & Nonce Leakage (1h30)

### 🔍 Anatomie Technique — ECDSA Nonce Reuse (Attaque Sony PS3)

```
EXPLOITATION DE LA RÉUTILISATION DU NONCE k DANS ECDSA

Dans la signature ECDSA (r, s) d'un message m avec clé privée d :
  r = (k * G).x mod n
  s = k^(-1) * (Hash(m) + d * r) mod n

Si un signataire utilise LE MÊME NONCE k pour deux messages m1 et m2 :
  s1 = k^(-1) * (h1 + d * r) mod n
  s2 = k^(-1) * (h2 + d * r) mod n

Soustraction des deux équations :
  s1 - s2 = k^(-1) * (h1 - h2) mod n  ──▶  k = (h1 - h2) / (s1 - s2) mod n

Une fois k extrait :
  d = (s1 * k - h1) * r^(-1) mod n    ──▶  LA CLÉ PRIVÉE EST EXTRAITE !
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **LLL** | Lenstra-Lenstra-Lovász — Algorithme de réduction de base de réseau en temps polynomial |
| **SVP** | Shortest Vector Problem — ProblèmeNP-difficile de trouver le plus court vecteur non-nul d'un réseau |
| **CRT** | Chinese Remainder Theorem (Théorème des Restes Chinois) — Théorème d'arithmétique modulaire |
| **ECDSA** | Elliptic Curve Digital Signature Algorithm — Algorithme de signature numérique sur courbe elliptique |
| **GCD** | Greatest Common Divisor (Plus Grand Commun Diviseur — PGCD) |

---

## Exercices Pratiques

### Exercice 1 — Attaque GCD sur Modules RSA

Deux serveurs web émettent des certificats SSL RSA-2048 avec les modules :
- $N_1 = 3233$
- $N_2 = 4189$

Un analyste calcule $\gcd(N_1, N_2) = 61$. Retrouver les facteurs premiers $p, q$ des deux modules et expliquer la cause.

**Corrigé guidé :**
1. $\gcd(N_1, N_2) = 61 = p$ (facteur premier commun aux deux modules).
2. Pour $N_1$ : $q_1 = \frac{N_1}{p} = \frac{3233}{61} = \mathbf{53}$. ($N_1 = 61 \times 53$).
3. Pour $N_2$ : $q_2 = \frac{N_2}{p} = \frac{4189}{61} = \mathbf{69}$. ($N_2 = 61 \times 69$).
4. **Cause :** Les deux serveurs ont initialisé leur générateur aléatoire (PRNG) avec le même état ou sans entropie suffisante lors de la génération de $p$, ce qui a produit le même nombre premier $p$.

---

## Banque QCM — 5 Questions

**Q1.** L'attaque de **Wiener** permet de casser une clé RSA lorsque :

- A) L'exposant public $e$ est égal à 65537
- B) L'exposant de déchiffrement $d$ est anormalement petit ($d < \frac{1}{3} N^{1/4}$) ✅
- C) Le module $N$ est un nombre premier
- D) Le serveur utilise TLS 1.3

**Q2.** Si deux signatures ECDSA différentes $(r, s_1)$ et $(r, s_2)$ partagent la même valeur $r$, cela indique :

- A) Une signature parfaitement sécurisée
- B) La réutilisation du même nonce k pour les deux signatures, permettant d'extraire la clé privée $d$ ✅
- C) Une erreur de réseau TCP
- D) L'utilisation d'une courbe de NIST P-256

**Q3.** L'algorithme **LLL** (Lenstra-Lenstra-Lovász) est principalement utilisé en cryptanalyse pour :

- A) Compresser des fichiers images PNG
- B) Résoudre le problème du vecteur quasi-court dans les réseaux (Lattices) et casser des variantes RSA/ECDSA ✅
- C) Générer des certificats SSL
- D) Calculer les clés de hachage SHA-256

**Q4.** L'attaque de **Håstad (Broadcast Attack)** exploite :

- A) L'envoi d'un même message $M$ non-padde chiffré avec un petit exposant $e=3$ vers plusieurs destinataires ✅
- B) La surchauffe des puces électroniques
- C) La mémoire vive RAM incomplète
- D) L'interception de mots de passe Wi-Fi WPA2

**Q5.** Dans l'attaque Bleichenbacher PKCS#1 v1.5, l'attaquant exploite :

- A) Un oracle de padding qui indique si la structure PKCS#1 d'un ciphertext déchiffré est valide ✅
- B) La vitesse du processeur
- C) Les logs Apache du serveur
- D) Les failles du protocole DNS

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
