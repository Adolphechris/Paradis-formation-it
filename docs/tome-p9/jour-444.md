# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 444 (6h) : Cryptographie Post-Quantique Avancée (NIST FIPS 203 ML-KEM, FIPS 204 ML-DSA, FIPS 205 SLH-DSA & Framework de Migration PQC)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le standard définitif **NIST PQC (Août 2024)** : **FIPS 203** (ML-KEM / Kyber), **FIPS 204** (ML-DSA / Dilithium) et **FIPS 205** (SLH-DSA / Sphincs+)
> - Analyser le problème mathématique du **Module Learning With Errors (M-LWE)** basé sur les réseaux euclidiens
> - Concevoir une politique de migration contre la menace **"Harvest Now, Decrypt Later" (HNDL)**
> - Déployer les certificats hybrides (Classique + PQC) en production et configurer TLS 1.3 avec `x25519_mlkem768`
>
> **Compétences visées :** `SEC-04` (A) — Post-Quantum Cryptography & NIST FIPS PQC, `SEC-06` (A) — Quantum Migration Strategy

---

## Module 1 — La Menace Quantique & Standards NIST FIPS 203/204/205 (2h)

### 📖 Intuition & Narration

L'avènement d'un ordinateur quantique à tolérance de pannes exécutant l'**Algorithme de Shor** brisera instantanément RSA, ECC (ECDSA, Ed25519) et Diffie-Hellman en temps polynomial. Les attaquants étatiques et cybercriminels pratiquent actuellement la stratégie **Harvest Now, Decrypt Later (HNDL)** : intercepter et stocker des pétaoctets de trafic TLS 1.3 chiffré aujourd'hui, pour les déchiffrer dans 5 à 10 ans lorsque l'ordinateur quantique sera opérationnel.

En août 2024, le NIST américain a publié les **trois premières normes cryptographiques post-quantiques définitives (FIPS 203, FIPS 204, FIPS 205)** pour remplacer les standards asymétriques actuels.

### 🔍 Anatomie Technique — Standards NIST PQC 2024

```
NORMES NIST CRYPTOGRAPHIE POST-QUANTIQUE (PUBLIÉES AOÛT 2024)

  1. FIPS 203 — ML-KEM (Module-Lattice-Based Key-Encapsulation Mechanism)
     ├── Basé sur CRYSTALS-Kyber
     ├── Usage : Échange de clés / Établissement de session (TLS, SSH, IPsec)
     └── Sécurité : ML-KEM-512 (Level 1), ML-KEM-768 (Level 3), ML-KEM-1024 (Level 5)

  2. FIPS 204 — ML-DSA (Module-Lattice-Based Digital Signature Algorithm)
     ├── Basé sur CRYSTALS-Dilithium
     ├── Usage : Signature numérique générale (PKI, Certificats X.509, Code Signing)
     └── Sécurité : ML-DSA-44, ML-DSA-65, ML-DSA-87

  3. FIPS 205 — SLH-DSA (Stateless Hash-Based Digital Signature Algorithm)
     ├── Basé sur SPHINCS+ (Secours non-lattice)
     ├── Usage : Signature numérique à très haute sécurité (Backup si les lattices sont cassés)
     └── Repose UNIQUEMENT sur la sécurité des fonctions de hachage (SHA-256/SHAKE)
```

---

## Module 2 — Mathématiques des Lattices (ML-KEM & M-LWE) (2h)

### 📖 Intuition & Narration

Contrairement à RSA qui repose sur la factorisation d'entiers, **ML-KEM** et **ML-DSA** reposent sur la difficulté de résoudre des équations linéaires perturbées par un petit bruit aléatoire dans un réseau d'polynômes : c'est le problème **Module Learning With Errors (M-LWE)**.

Même pour un ordinateur quantique utilisant l'algorithme de Shor ou de Grover, retrouver le vecteur secret à partir des équations perturbées nécessite un temps exponentiel.

### 🔍 Anatomie Technique — Problème M-LWE (Module-LWE)

$$\text{Soit une matrice de polynômes } \mathbf{A} \in R_q^{k \times k} \text{ et un vecteur secret } \mathbf{s} \in R_q^k.$$
$$\text{On calcule : } \mathbf{t} = \mathbf{A} \cdot \mathbf{s} + \mathbf{e} \pmod q$$
$$\text{où } \mathbf{e} \text{ est un petit vecteur d'erreur (bruit).}$$
$$\text{Clé Publique : } (\mathbf{A}, \mathbf{t}) \quad \mid \quad \text{Clé Privée : } \mathbf{s}$$
$$\text{Retrouver } \mathbf{s} \text{ à partir de } (\mathbf{A}, \mathbf{t}) \text{ est le problème M-LWE, réputé intractable.}$$

### 🛠️ Atelier Pratique — Test d'Échange de Clés ML-KEM-768 en Python (`oqs`)

```python
#!/usr/bin/env python3
"""
PARADIS — Échange de clés Post-Quantique ML-KEM-768 (NIST FIPS 203)
Utilisation de la bibliothèque liboqs (Open Quantum Safe)
"""

import oqs

def demo_pqc_mlkem768():
    kem_name = "Kyber768"  # ML-KEM-768 (NIST Level 3)
    
    print(f"[*] Initialisation du mécanisme KEM PQC : {kem_name}")
    with oqs.KeyEncapsulation(kem_name) as client_kem:
        with oqs.KeyEncapsulation(kem_name) as server_kem:
            # 1. Le Serveur génère sa paire de clés Post-Quantique ML-KEM
            public_key_server = server_kem.generate_keypair()
            print(f"[*] Clé Publique ML-KEM-768 générée ({len(public_key_server)} bytes)")

            # 2. Le Client encapsule un secret partagé avec la clé publique du serveur
            ciphertext, shared_secret_client = client_kem.encap_secret(public_key_server)
            print(f"[*] Ciphertext KEM généré ({len(ciphertext)} bytes)")
            print(f"[*] Secret Partagé Client (Hex): {shared_secret_client[:16].hex()}...")

            # 3. Le Serveur décapsule le secret avec sa clé privée
            shared_secret_server = server_kem.decap_secret(ciphertext)
            print(f"[*] Secret Partagé Serveur (Hex): {shared_secret_server[:16].hex()}...")

            # 4. Vérification de l'égalité des secrets partagés
            assert shared_secret_client == shared_secret_server, "Échec KEM Post-Quantique !"
            print("  ✅ Échange de clés ML-KEM-768 (FIPS 203) réussi avec succès !")

try:
    demo_pqc_mlkem768()
except Exception as e:
    print(f"[i] Liboqs note: {e} (Installer liboqs-python pour tester)")
```

---

## Module 3 — Roadmap de Migration PQC & Hybridation TLS 1.3 (1h30)

### 🛠️ Migration PQC en 4 Étapes (CNSA 2.0 Timeline)

```markdown
ROADMAP DE MIGRATION PQC ENTERPRISE (NSA CNSA 2.0 ALIGNED)

  ┌─────────────────────────────────────────────────────────────┐
  │  ÉTAPES DE MIGRATION                                        │
  ├─────────────────────────────────────────────────────────────┤
  │  1. INVENTAIRE CRYPTO (Crypto-Agility Discovery)            │
  │     ├── Scanner tous les certificats X.509, SSH keys, KMS   │
  │  2. ADOPTION HYBRIDE (Hybrid Key Exchange)                  │
  │     ├── Déployer TLS 1.3 avec x25519_mlkem768 (Dual key)    │
  │  3. SIGNATURE HYBRIDE                                       │
  │     ├── Émettre des certificats X.509 Dual (RSA + ML-DSA-65)│
  │  4. PASSAGE 100% PQC (FIPS 203/204 Native)                  │
  │     ├── Obsolever RSA/ECC pour CNSA 2.0 (Horizon 2030-2033) │
  └─────────────────────────────────────────────────────────────┘
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ML-KEM** | Module-Lattice-Based Key-Encapsulation Mechanism (NIST FIPS 203 — anciennement Kyber) |
| **ML-DSA** | Module-Lattice-Based Digital Signature Algorithm (NIST FIPS 204 — anciennement Dilithium) |
| **SLH-DSA** | Stateless Hash-Based Digital Signature Algorithm (NIST FIPS 205 — anciennement SPHINCS+) |
| **HNDL** | Harvest Now, Decrypt Later — Stratégie d'interception massive de données chiffrées en vue d'un déchiffrement quantique futur |
| **M-LWE** | Module Learning With Errors — Problème mathématique difficile sur les réseaux de polynômes |

---

## Exercices Pratiques

### Exercice 1 — Stratégie d'Hybridation TLS 1.3

Pourquoi la NSA et le NIST recommandent-ils d'utiliser des **groupes hybrides** (ex: `x25519_mlkem768`) plutôt que du ML-KEM pur lors de la première phase de migration TLS 1.3 ?

**Corrigé guidé :**
1. L'hybridation combine un algorithme classique éprouvé (ex: ECDH X25519) et un nouvel algorithme PQC (ML-KEM-768).
2. La clé de session finale est dérivée de la combinaison des deux secrets : $K = \text{HKDF}(K_{\text{X25519}} \parallel K_{\text{ML-KEM}})$.
3. **Sécurité double :** 
   - Si une faille mathématique imprévue est découverte demain dans ML-KEM, la sécurité classique X25519 protège la session contre les ordinateurs actuels.
   - Si un ordinateur quantique apparaît, la composante ML-KEM protège la session contre le déchiffrement quantique.
4. L'hybridation élimine le risque d'une régression de sécurité pendant la période de transition.

---

## Banque QCM — 5 Questions

**Q1.** Le standard **NIST FIPS 203 (ML-KEM)** est spécifiquement conçu pour :

- A) Chiffrer des disques durs sous Windows
- B) L'établissement et l'encapsulation de clés de session (KEM) Post-Quantiques ✅
- C) La signature de courriels électroniques
- D) Le filtrage de requêtes SQL

**Q2.** La menace **Harvest Now, Decrypt Later (HNDL)** consiste à :

- A) Voler des moissonneuses-batteuses connectées
- B) Intercepter et stocker du trafic chiffré aujourd'hui pour le déchiffrer plus tard avec un ordinateur quantique ✅
- C) Effacer les sauvegardes de bases de données
- D) Modifier les mots de passe des routeurs

**Q3.** Quel algorithme Post-Quantique de signature repose **uniquement sur les fonctions de hachage (SHA-256/SHAKE)** sans utiliser de lattices ?

- A) RSA-4096
- B) FIPS 205 — SLH-DSA (SPHINCS+) ✅
- C) FIPS 203 — ML-KEM
- D) ECDSA P-384

**Q4.** Le problème mathématique sous-jacent à ML-KEM et ML-DSA est :

- A) La factorisation de grands entiers
- B) Le problème Module Learning With Errors (M-LWE) sur les réseaux de polynômes ✅
- C) Le calcul de la racine carrée de pi
- D) Le logarithme discret sur corps fini

**Q5.** Dans la roadmap de migration **CNSA 2.0**, quelle est la première étape recommandée pour protéger le trafic réseau ?

- A) Remplacer tous les serveurs physiques
- B) Déployer des groupes d'échange de clés hybrides (ex: X25519 + ML-KEM-768) dans TLS 1.3 et SSH ✅
- C) Supprimer les certificats SSL
- D) Passer à IPv6

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
