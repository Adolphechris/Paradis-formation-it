# TOME P2 — Réseaux & Télécoms — Jour 98 (6h) : Cryptographie Post-Quantique (PQC) & Algorithmes de Nouvelle Génération (NIST Standards)

> [!NOTE]
> **Objectif du jour :** Comprendre l'impact de l'avènement des ordinateurs quantiques sur la cryptographie moderne (algorithme de Shor), découvrir les nouveaux standards de Cryptographie Post-Quantique (PQC) publiés par le NIST (ML-KEM / Kyber, ML-DSA / Dilithium) et préparer la migration des algorithmes bancaires.
>
> **Compétences visées :** `SEC-02` (A) — Cryptographie Post-Quantique (PQC) | `SEC-03` (A) — Agilité Cryptographique & Anticipation des Menaces

---

## 1) Module — La Menace Quantique & la Cryptanalyse (2h)

### 📖 Narration/Intuition

Toute la sécurité d'Internet et des réseaux bancaires actuels (HTTPS, RSA, ECC, signatures numériques) repose sur la difficulté mathématique de résoudre deux problèmes : la **factorisation des grands nombres entiers** (RSA) et le **logarithme discret sur les courbes elliptiques** (ECC/ECDSA).

Un ordinateur quantique suffisamment puissant exécutant l'**Algorithme de Shor** pourra casser une clé RSA-4096 ou une clé ECC-256 en quelques minutes.

Bien que ces ordinateurs quantiques ne soient pas encore pleinement opérationnels, la menace **"HNDL" (Harvest Now, Decrypt Later)** est déjà active : des attaquants étatiques interceptent et stockent dès aujourd'hui les communications bancaires chiffrées pour les déchiffrer dans 5 à 10 ans lorsque l'ordinateur quantique sera disponible.

### 🔍 Anatomie Technique

**Impact de l'Informatique Quantique sur la Cryptographie :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. ALGORITHMES ASYMÉTRIQUES (RSA, ECC, ECDSA, Diffie-Hellman)               │
│    Impact : ❌ TOTALEMENT CASSÉS par l'Algorithme de Shor.                   │
│    Action : Remplacement obligatoire par la Cryptographie Post-Quantique (PQC).│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. ALGORITHMES SYMÉTRIQUES & HACHAGE (AES-256, SHA-256, SHA-3)               │
│    Impact : ⚠️ PARTIELLEMENT IMPACTÉS par l'Algorithme de Grover.           │
│    Action : Doubler la taille des clés (Passer de AES-128 à AES-256,         │
│             et de SHA-256 à SHA-384/SHA-512). AES-256 reste SÉCURISÉ.        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Nouveaux Standards PQC du NIST (ML-KEM & ML-DSA) (2h)

### 📖 Narration/Intuition

En août 2024, le **NIST (National Institute of Standards and Technology)** a publié ses premiers standards officiels définitifs de Cryptographie Post-Quantique (PQC), basés sur les mathématiques des réseaux euclidiens (Lattice-Based Cryptography).

### 🔍 Anatomie Technique

**Les Nouveaux Standards de Cryptographie Post-Quantique (NIST 2024) :**

```
1. FIPS 203 — ML-KEM (Module-Lattice-Based Key-Encapsulation Mechanism) :
   - Basé sur l'algorithme Kyber.
   - Utilisé pour l'échange de clés et l'établissement de sessions chiffrées (ex: TLS 1.3 / HTTPS).
   - Variantes : ML-KEM-512, ML-KEM-768, ML-KEM-1024.

2. FIPS 204 — ML-DSA (Module-Lattice-Based Digital Signature Algorithm) :
   - Basé sur l'algorithme Dilithium.
   - Utilisé pour les signatures numériques (authentification, virements bancaires, certificats PKI).

3. FIPS 205 — SLH-DSA (Stateless Hash-Based Digital Signature Algorithm) :
   - Basé sur l'algorithme SPHINCS+.
   - Signature de secours basée exclusivement sur les fonctions de hachage.
```

---

## 3) Module — Implémentation d'Échange de Clés Post-Quantique (Python liboqs) (2h)

### 📖 Narration/Intuition

Les développeurs et architectes doivent dès maintenant tester le chiffrement hybride (combinaison d'un algorithme classique comme ECDH et d'un algorithme post-quantique comme ML-KEM / Kyber) pour garantir la transition progressive des systèmes bancaires.

### 🔍 Anatomie Technique

**Échange de clés Post-Quantique ML-KEM-768 avec Python (`pqc_kem_demo.py`) :**

```python
#!/usr/bin/env python3
"""
pqc_kem_demo.py — Démonstration d'échange de clés Post-Quantique avec ML-KEM (Kyber-768)
Nécessite la bibliothèque Open Quantum Safe (liboqs-python)
"""
import oqs

# Définir le mécanisme d'encapsulation de clé Post-Quantique standardisé par le NIST
KEM_NAME = "Kyber768"  # Equivalent à ML-KEM-768 (FIPS 203)

print(f"=== ÉCHANGE DE CLÉS POST-QUANTIQUE — {KEM_NAME} ===")

# ─── 1. Le Destinataire (ex: Serveur critique) génère sa paire de clés Post-Quantique ──
with oqs.KeyEncapsulation(KEM_NAME) as server_kem:
    # Génération de la clé publique et de la clé privée post-quantique
    public_key_server = server_kem.generate_keypair()
    print(f"[+] Clé publique du serveur générée ({len(public_key_server)} octets).")

    # ─── 2. L'Émetteur (ex: Client Mobile) encapsule une clé secrète partagée ───
    with oqs.KeyEncapsulation(KEM_NAME) as client_kem:
        # Le client utilise la clé publique du serveur pour produire le ciphertext et le secret partagé
        ciphertext, secret_partage_client = client_kem.encap_secret(public_key_server)
        print(f"[+] Ciphertext encapsulé par le client ({len(ciphertext)} octets).")

    # ─── 3. Le Serveur décapsule le ciphertext avec sa clé privée ───────────────
    secret_partage_serveur = server_kem.decap_secret(ciphertext)

    # ─── 4. Vérification de l'égalité des secrets partagés ──────────────────────
    if secret_partage_client == secret_partage_serveur:
        print("✅ SUCCÈS : Les deux parties partagent la MÊME clé secrète Post-Quantique !")
        print(f"   Clé secrète partagée (hex) : {secret_partage_serveur.hex()[:32]}...")
    else:
        print("❌ ÉCHEC : Les clés secrètes ne correspondent pas !")
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PQC** | Post-Quantum Cryptography — Cryptographie conçue pour résister aux ordinateurs quantiques |
| **KEM** | Key Encapsulation Mechanism — Mécanisme d'encapsulation de clés (ex: ML-KEM) |
| **DSA** | Digital Signature Algorithm — Algorithme de signature numérique (ex: ML-DSA) |
| **HNDL** | Harvest Now, Decrypt Later — Stratégie d'interception actuelle pour déchiffrement futur |
| **FIPS** | Federal Information Processing Standards — Normes officielles du gouvernement américain |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence majeure entre l'impact de l'ordinateur quantique sur RSA-4096 et sur AES-256 ?

**Corrigé :** RSA-4096 est un algorithme asymétrique basé sur la factorisation. L'**Algorithme de Shor** exécuté sur un ordinateur quantique casse **totalement** RSA en un temps polynomial. RSA devient inutilisable. AES-256 est un algorithme symétrique. L'**Algorithme de Grover** réduit l'efficacité de recherche de clé de moitié ($\sqrt{N}$), ramenant la sécurité d'AES-256 à un niveau équivalent à 128 bits de sécurité classique. Or, 128 bits de sécurité restent **totalement inattaquables** à l'échelle de l'univers. **AES-256 reste donc sécurisé contre les attaques quantiques**.

**Exercice 2 :** Qu'est-ce que l'**Agilité Cryptographique** et pourquoi est-elle recommandée pour la migration PQC des banques ?

**Corrigé :** L'**Agilité Cryptographique** est la capacité d'une architecture informatique à permuter ou mettre à jour ses algorithmes et longueurs de clés cryptographiques sans nécessiter de réécriture lourde du code applicatif ou de refonte de l'infrastructure. Elle est indispensable pour la migration PQC car les standards post-quantiques (comme ML-KEM et ML-DSA) utilisent des tailles de clés et de signatures nettement plus volumineuses que RSA/ECC, et les algorithmes sont susceptibles d'évoluer au fur et à mesure des recherches.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel algorithme quantique conçu par Peter Shor permet de casser les algorithmes cryptographiques asymétriques classiques comme RSA et ECC en temps polynomial ?
- A) Algorithme de Grover
- B) Algorithme de Shor
- C) Algorithme de Dijkstra
- D) Algorithme de Prim

**Réponse : B**

**Q2 :** Quel nouveau standard officiel d'encapsulation de clé Post-Quantique (FIPS 203) a été publié par le NIST en 2024 (basé sur Kyber) ?
- A) RSA-2048
- B) ML-KEM
- C) MD5
- D) SHA-1

**Réponse : B**

**Q3 :** Quelle menace décrit la pratique d'attaquants qui interceptent et enregistrent aujourd'hui du trafic chiffré TLS pour le déchiffrer dans le futur lorsque les ordinateurs quantiques seront disponibles ?
- A) Man-in-the-Middle
- B) Harvest Now, Decrypt Later (HNDL)
- C) Denial of Service (DoS)
- D) SQL Injection

**Réponse : B**

**Q4 :** Quelle est la recommandation pour maintenir le niveau de sécurité du chiffrement symétrique (AES) face à l'algorithme quantique de Grover ?
- A) Abandonner AES et utiliser du texte clair
- B) Utiliser AES-256 (car l'effort de recherche reste équivalent à 128 bits, ce qui est incassable)
- C) Réduire la clé à 64 bits
- D) Remplacer AES par RSA

**Réponse : B**

**Q5 :** Les algorithmes de Cryptographie Post-Quantique standardisés par le NIST (ML-KEM, ML-DSA) s'appuient principalement sur quelle branche des mathématiques ?
- A) La géométrie euclidienne simple
- B) La théorie des réseaux euclidiens (Lattice-Based Cryptography)
- C) Les tables de multiplication
- D) Les statistiques élémentaires

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
