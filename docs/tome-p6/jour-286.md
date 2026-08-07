# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 286 (6h) : Post-Quantum Cryptography & Quantum Preparedness (Standards NIST FIPS 203/204/205, ML-KEM Kyber, ML-DSA Dilithium & Threat HNDL)

> [!NOTE]
> **Objectif du jour :** Maîtriser les nouveaux standards mondiaux de **Cryptographie Post-Quantique (PQC)** formalisés par le NIST (FIPS 203, 204, 205) : comprendre la menace **HNDL (Harvest Now, Decrypt Later)**, manipuler l'algorithme d'échange de clés basés sur les réseaux (Lattices) **ML-KEM (Kyber)** et la signature numérique **ML-DSA (Dilithium)** avec Python `oqs`.
>
> **Compétences visées :** `PQC-01` (A) — NIST Post-Quantum Standards (FIPS 203/204/205) | `PQC-02` (A) — Python liboqs & ML-KEM Key Exchange

---

## 1) Module — La Menace Quantique & Standards NIST FIPS 203/204/205 (2h)

### 📖 Narration/Intuition

L'avènement des ordinateurs quantiques équipés de l'algorithme de Shor rendra caducs l'ensemble des systèmes cryptographiques à clé publique actuels (RSA, ECC, Diffie-Hellman). Les attaquants pratiquent dès aujourd'hui l'attaque **HNDL (Harvest Now, Decrypt Later)** : ils enregistrent et stockent le trafic chiffré TLS d'entreprise pour le déchiffrer dans 5 à 10 ans.

```
┌───────────────────┬──────────────────────────────────┬─────────────────────────────────┐
│ Standard NIST     │ Algorithme PQC                   │ Usage Cryptographique           │
├───────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ FIPS 203          │ ML-KEM (Module-Lattice KEM)      │ Échange de Clés / Chiffrement   │
│ FIPS 204          │ ML-DSA (Module-Lattice Signature)│ Signatures Numériques General   │
│ FIPS 205          │ SLH-DSA (Stateless Hash Sign)    │ Signatures Numériques de Backup │
└───────────────────┴──────────────────────────────────┴─────────────────────────────────┘
```

---

## 2) Module — Échange de Clés ML-KEM avec Python `liboqs` (`pqc_kem_demo.py`) (2h)

### 🛠️ Atelier Pratique

```python
import oqs

# Démonstration de l'échange de clés Post-Quantique ML-KEM (Kyber-768 / FIPS 203)

kem_alg = "Kyber768"

# 1) Le destinataire (Bob) génère sa paire de clés Post-Quantique ML-KEM
with oqs.KeyEncapsulation(kem_alg) as server:
    public_key_bob = server.generate_keypair()
    print(f"[*] Clé publique ML-KEM Bob générée ({len(public_key_bob)} octets)")

    # 2) L'émetteur (Alice) encapsule un secret partagé avec la clé publique de Bob
    with oqs.KeyEncapsulation(kem_alg) as client:
        ciphertext, shared_secret_alice = client.encap_secret(public_key_bob)
        print(f"[*] Ciphertext encapsulé par Alice ({len(ciphertext)} octets)")

    # 3) Bob décapsule le ciphertext avec sa clé privée pour déduire le MÊME secret
    shared_secret_bob = server.decap_secret(ciphertext)

# 4) Vérification de l'égalité des secrets partagés
assert shared_secret_alice == shared_secret_bob
print("[+] ÉCHANGE DE CLÉS POST-QUANTIQUE ML-KEM (FIPS 203) RÉUSSI !")
print(f"[+] Secret partagé dérivé (Hex) : {shared_secret_bob.hex()[:32]}...")
```

---

## 3) Module — Signature Numérique ML-DSA (Dilithium) (`pqc_dsa_demo.py`) (2h)

```python
import oqs

# Signature Numérique Post-Quantique ML-DSA (Dilithium3 / FIPS 204)

sig_alg = "Dilithium3"
message = b"Transaction Financiere Confidentielle Interbanque PARADIS IT"

with oqs.Signature(sig_alg) as signer:
    public_key = signer.generate_keypair()
    # Signature du message
    signature = signer.sign(message)
    print(f"[*] Signature ML-DSA générée ({len(signature)} octets)")

# Vérification par un tiers
with oqs.Signature(sig_alg) as verifier:
    is_valid = verifier.verify(message, signature, public_key)
    print(f"[+] Validation de la signature Post-Quantique ML-DSA : {is_valid}")
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PQC** | Post-Quantum Cryptography — Cryptographie résistant aux ordinateurs quantiques |
| **ML-KEM** | Module-Lattice-Based Key Encapsulation Mechanism — Standard NIST FIPS 203 (ex-Kyber) |
| **ML-DSA** | Module-Lattice-Based Digital Signature Algorithm — Standard NIST FIPS 204 (ex-Dilithium) |
| **HNDL** | Harvest Now, Decrypt Later — Stratégie d'interception de trafic chiffré avant déchiffrement PQC |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le nom du standard officiel NIST FIPS 203 dédié au mécanisme d'encapsulation de clés (KEM) résistant aux ordinateurs quantiques ?
- A) ML-KEM (ex-Kyber)
- B) RSA-4096
- C) ECDH
- D) AES-256

**Réponse : A**

**Q2 :** Que signifie l'attaque **HNDL (Harvest Now, Decrypt Later)** menée dès aujourd'hui par des gouvernements et cybercriminels ?
- A) Intercepter et stocker massivement les flux TLS chiffrés d'aujourd'hui pour les déchiffrer lorsque des ordinateurs quantiques puissants seront opérationnels
- B) Chiffrer des disques durs
- C) Attaquer les routeurs Wi-Fi
- D) Envoyer du spambot

**Réponse : A**

**Q3 :** Sur quelle famille de problèmes mathématiques reposent principalement les algorithmes PQC FIPS 203 (ML-KEM) et FIPS 204 (ML-DSA) ?
- A) La théorie des réseaux euclidiens (Lattice-based cryptography / Module Lattices)
- B) La factorisation des grands nombres entiers
- C) Le logarithme discret
- D) Le hachage MD5

**Réponse : A**

**Q4 :** Quelle bibliothèque open-source développée par l'Open Quantum Safe project (OQS) fournit les bindings C/Python pour tester les algorithmes PQC ?
- A) `liboqs`
- B) OpenSSL 1.1
- C) PyCrypto
- D) Scapy

**Réponse : A**

**Q5 :** Quel est le standard NIST FIPS 204 dédié à la signature numérique post-quantique généraliste ?
- A) ML-DSA (ex-Dilithium)
- B) SHA-3
- C) AES-GCM
- D) RSA-PSS

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
