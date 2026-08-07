# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 288 (6h) : Cryptanalyse Avancée & Attaques RSA/ECC (Attaque de Coppersmith, Invalid Curve Attack, Small Subgroup Attack & Résolution avec SageMath)

> [!NOTE]
> **Objectif du jour :** Maîtriser la **cryptanalyse des implémentations défaillantes des algorithmes asymétriques RSA et des Courbes Élliptiques (ECC)** : exploiter les faibles exposants publics RSA via l'**Attaque de Coppersmith** (méthode de réduction de réseaux LLL), conduire une **Invalid Curve Attack** contre des implémentations ECC non sécurisées, et automatiser les attaques cryptographiques avec **SageMath** et Python.
>
> **Compétences visées :** `CRYP-01` (A) — Advanced Cryptanalysis & RSA Attacks | `CRYP-02` (A) — Elliptic Curve Cryptanalysis & SageMath Scripting

---

## 1) Module — Attaques Avancées sur RSA (Coppersmith & LLL) (2h)

### 📖 Narration/Intuition

La sécurité de RSA ne repose pas uniquement sur la difficulté de factoriser $N = p \cdot q$, mais également sur la correction de l'implémentation. Si l'exposant public $e$ est petit (ex: $e=3$) et que le padding (OAEP) est absent ou incorrect, ou si une partie du message est connue, l'**Attaque de Coppersmith** permet de retrouver les racines du polynôme modulo $N$ en utilisant l'algorithme de réduction de base de réseaux **LLL (Lenstra–Lenstra–Lovász)**.

---

## 2) Module — Attaque Coppersmith RSA avec SageMath (`coppersmith_attack.sage`) (2h)

### 🛠️ Atelier Pratique

```python
# Script SageMath — Attaque de Coppersmith pour retrouver un message RSA avec petit exposant (e=3)

# Configuration de l'anneau polynomial modulo N
N = 0x8a9b... # Grand module RSA
e = 3
c = 0x1f2e... # Ciphertext intercepté

# Le message m est partiellement connu : m = prefix + secret_x
# f(x) = (prefix * 2^k + x)^3 - c mod N

P.<x> = PolynomialRing(Zmod(N))
prefix_val = 0x48656c6c6f20 # "Hello "
f = (prefix_val * 2^32 + x)^e - c

# Trouver la racine x avec l'algorithme de Coppersmith (Small Roots via LLL)
roots = f.small_roots(epsilon=1/30)

if roots:
    secret_x = roots[0]
    full_message = prefix_val * 2^32 + secret_x
    print(f"[+] MESSAGE RSA RETROUVÉ VIA COPPERSMITH : {hex(full_message)}")
    print(f"[+] Décodé : {bytes.fromhex(hex(full_message)[2:]).decode()}")
```

---

## 3) Module — Invalid Curve Attack sur les Courbes Élliptiques (ECC) (2h)

### 🛠️ Script Python d'attaque sur courbe invalide (`invalid_curve_attack.py`)

```python
# Invalid Curve Attack sur ECDH (Exemple conceptuel)
# Si une implémentation ECC ne vérifie pas que le point P(x, y) fourni par le client
# appartient bien à la courbe officielle y^2 = x^3 + ax + b mod p,
# l'attaquant envoie un point sur une "courbe invalide" d'ordre faible (Small Subgroup).

def invalid_curve_point_injection():
    print("[*] Test d'injection de point sur courbe invalide (Small Subgroup Attack)...")
    # L'attaquant choisit un point P_inv sur une courbe y^2 = x^3 + ax + b_inv (ordre n_small petit)
    # En envoyant plusieurs points d'ordres faibles distincts, l'attaquant retrouve la clé privée d
    # via le Théorème des Restes Chinois (CRT - Chinese Remainder Theorem).

    print("[+] Vulnérabilité identifiée : L'application n'effectue pas la validation 'Point on Curve' !")
    print("[+] Remédiation : Exécuter systématiquement 'assert (y^2 - x^3 - a*x - b) % p == 0'")

invalid_curve_point_injection()
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **LLL** | Lenstra–Lenstra–Lovász — Algorithme de réduction de bases de réseaux géométriques |
| **ECC** | Elliptic Curve Cryptography — Cryptographie basée sur la géométrie des courbes elliptiques |
| **SageMath** | Système de calcul mathématique open-source très utilisé en cryptanalyse |
| **CRT** | Chinese Remainder Theorem — Théorème des Restes Chinois utilisé pour résoudre des congruences |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans la cryptanalyse de RSA, quelle technique mathématique basée sur les réseaux (LLL) permet de retrouver un message si l'exposant $e$ est petit et qu'une partie du message est connue ?
- A) L'Attaque de Coppersmith
- B) L'Attaque DuckyScript
- C) L'Attaque PMKID
- D) Le chiffrement AES

**Réponse : A**

**Q2 :** Pourquoi la vulnérabilité **Invalid Curve Attack** affecte-t-elle certaines implémentations défaillantes d'ECDH (Diffie-Hellman sur courbes elliptiques) ?
- A) Parce que le serveur omet de vérifier que le point envoyé par le client se trouve bien sur la courbe elliptique officielle, permettant l'utilisation de sous-groupes d'ordre faible
- B) Parce que la clé est trop longue
- C) Parce que le serveur est sous Linux
- D) Parce qu'il n'y a pas de certificat TLS

**Réponse : A**

**Q3 :** Quel outil open-source de calcul mathématique avancé est la référence des chercheurs pour rédiger des scripts de cryptanalyse RSA et ECC ?
- A) SageMath
- B) Excel
- C) Wireshark
- D) Nmap

**Réponse : A**

**Q4 :** Dans RSA sans padding (Textbook RSA), si l'exposant public $e=3$ et que le message $m$ est très petit tel que $m^3 < N$, comment le message peut-il être déchiffré immédiatement ?
- A) En calculant simplement la racine cubique entière du ciphertext $c$ ($\sqrt[3]{c}$ dans $\mathbb{R}$) sans même connaître le modulo $N$
- B) En cassant la clé AES
- C) En utilisant un dictionnaire
- D) En redémarrant le serveur

**Réponse : A**

**Q5 :** Quelle vérification élémentaire doit obligatoirement effectuer toute bibliothèque ECC à la réception d'un point $P(x, y)$ transmis par un tiers ?
- A) Vérifier que les coordonnées du point satisfont l'équation de la courbe : $y^2 \equiv x^3 + ax + b \pmod p$ (Point on Curve Validation)
- B) Vérifier que le point est au format JSON
- C) Chiffrer le point avec MD5
- D) Aucune vérification n'est nécessaire

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
