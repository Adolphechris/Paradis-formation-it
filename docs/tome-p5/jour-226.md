# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 226 (6h) : Cryptographie Post-Quantique (PQC — CRYSTALS-Kyber, CRYSTALS-Dilithium, NIST PQC Standards & Migration Crypto-Agile)

> [!NOTE]
> **Objectif du jour :** Comprendre les fondements et l'urgence de la **cryptographie post-quantique (PQC — Post-Quantum Cryptography)** : menace des ordinateurs quantiques sur les algorithmes actuels (RSA, ECDSA, AES), présentation des algorithmes standardisés par le **NIST en 2024** (**CRYSTALS-Kyber** pour l'échange de clés / **CRYSTALS-Dilithium** pour les signatures numériques), et conception d'une stratégie de migration **crypto-agile** pour l'infrastructure MNBC de la BCC.
>
> **Compétences visées :** `SEC-06` (A) — Post-Quantum Cryptography NIST PQC Standards | `SEC-04` (A) — Crypto-Agility Migration Strategy & Hybrid TLS 1.3/PQC

---

## 1) Module — La Menace Quantique & Algorithmes Vulnérables (2h)

### 📖 Narration/Intuition

Un **ordinateur quantique** suffisamment puissant (mesuré en **qubits logiques stables**) pourrait, grâce à l'algorithme de **Shor**, factoriser en temps polynomial des entiers de milliers de bits — rendant **RSA**, **ECDSA** (utilisé dans les certificats TLS des APIs BCC) et **Diffie-Hellman** cryptanalysés en quelques heures.

La stratégie **"Harvest Now, Decrypt Later" (HNDL)** : des acteurs étatiques (NSA, FSB…) interceptent et stockent dès aujourd'hui les flux chiffrés TLS des banques centrales. Dès qu'un ordinateur quantique suffisamment puissant sera disponible (estimé entre 2030 et 2040), ils pourront rétroactivement déchiffrer ces communications.

### 🔍 Anatomie Technique

**Algorithmes Cryptographiques & leur Résistance Quantique :**

```
┌──────────────────────────┬──────────────┬───────────────────────────────────┐
│ Algorithme               │ Classique ✅  │ Sécurité Face à Ordinateur Quantique │
├──────────────────────────┼──────────────┼───────────────────────────────────┤
│ RSA-2048                 │ Sécurisé     │ 🔴 BRISÉ — Shor's Algorithm       │
│ ECDSA P-256              │ Sécurisé     │ 🔴 BRISÉ — Shor's Algorithm       │
│ ECDH (DH sur courbe)     │ Sécurisé     │ 🔴 BRISÉ — Shor's Algorithm       │
│ AES-128                  │ Sécurisé     │ 🟡 AFFAIBLI — Grover (→ AES-256)  │
│ AES-256                  │ Sécurisé     │ 🟢 RÉSISTANT — Grover OK à 256b   │
│ SHA-256                  │ Sécurisé     │ 🟢 RÉSISTANT (Grover acceptable)  │
│ CRYSTALS-Kyber-768       │ Nouveau      │ 🟢 PQC RÉSISTANT (NIST FIPS 203)  │
│ CRYSTALS-Dilithium3      │ Nouveau      │ 🟢 PQC RÉSISTANT (NIST FIPS 204)  │
│ SPHINCS+                 │ Nouveau      │ 🟢 PQC RÉSISTANT (NIST FIPS 205)  │
└──────────────────────────┴──────────────┴───────────────────────────────────┘

Algorithme de Shor (1994) : Factorisation en O(log³ N) sur ordinateur quantique
  → Brise RSA-2048 en ~8h avec ~4000 qubits logiques stables
Algorithme de Grover (1996) : Recherche exhaustive en O(√N)
  → Réduit AES-128 à une sécurité effective de 64 bits → Insuffisant !
  → AES-256 réduit à 128 bits → Toujours acceptable
```

---

## 2) Module — Standards NIST PQC 2024 : Kyber & Dilithium (2h)

### 📖 Narration/Intuition

En août 2024, le **NIST (National Institute of Standards and Technology)** a officiellement finalisé et publié les trois premiers standards de cryptographie post-quantique :
- **FIPS 203** : ML-KEM (basé sur CRYSTALS-**Kyber**) — Encapsulation de clés (KEM)
- **FIPS 204** : ML-DSA (basé sur CRYSTALS-**Dilithium**) — Signatures numériques
- **FIPS 205** : SLH-DSA (basé sur **SPHINCS+**) — Signatures à base de hachage

Ces algorithmes reposent sur des problèmes mathématiques résistants aux algorithmes de Shor et de Grover : le **Problème de l'Apprentissage avec Erreurs (LWE — Learning With Errors)** et ses variantes sur réseaux euclidiens (**Lattice-Based Cryptography**).

### 🛠️ Atelier Pratique

**Implémentation PQC avec liboqs (Open Quantum Safe) en Python (`pqc_demo.py`) :**

```python
# Installation : pip3 install pyoqs
import oqs

# ============================================================
# 1. CRYSTALS-Kyber-768 (FIPS 203 — ML-KEM) : Échange de Clés
# ============================================================
print("=== CRYSTALS-Kyber-768 — Key Encapsulation Mechanism (KEM) ===")

# Alice (Serveur API BCC) : Génère la paire de clés KEM
with oqs.KeyEncapsulation("Kyber768") as alice_kem:
    alice_public_key = alice_kem.generate_keypair()
    print(f"Alice Public Key (Kyber768): {alice_public_key.hex()[:64]}...")

    # Bob (Client Banque Commerciale) : Encapsule un secret partagé
    with oqs.KeyEncapsulation("Kyber768") as bob_kem:
        ciphertext, shared_secret_bob = bob_kem.encap_secret(alice_public_key)
        print(f"Bob Ciphertext: {ciphertext.hex()[:64]}...")
        print(f"Bob Shared Secret: {shared_secret_bob.hex()}")

    # Alice : Décapsule pour obtenir le même secret partagé
    shared_secret_alice = alice_kem.decap_secret(ciphertext)
    print(f"Alice Shared Secret: {shared_secret_alice.hex()}")
    assert shared_secret_alice == shared_secret_bob
    print("✅ SUCCÈS : Alice & Bob partagent le même secret post-quantique !")

# ============================================================
# 2. CRYSTALS-Dilithium3 (FIPS 204 — ML-DSA) : Signature Numérique
# ============================================================
print("\n=== CRYSTALS-Dilithium3 — Signature Numérique PQC ===")

with oqs.Signature("Dilithium3") as signer:
    # BCC signe un message de règlement MNBC
    public_key = signer.generate_keypair()
    message = b"VIREMENT MNBC: 500000 du compte BCC-001 vers RAWBANK-042"
    signature = signer.sign(message)
    print(f"Signature Dilithium3: {signature.hex()[:64]}...")

    # Vérification par la banque réceptrice
    with oqs.Signature("Dilithium3") as verifier:
        is_valid = verifier.verify(message, signature, public_key)
        print(f"✅ Signature PQC valide: {is_valid}")
```

---

## 3) Module — Migration Crypto-Agile & TLS Hybride (2h)

### 📖 Narration/Intuition

La migration vers la cryptographie post-quantique ne peut pas se faire du jour au lendemain. La BCC doit adopter une approche **crypto-agile** : concevoir ses systèmes de façon à pouvoir **remplacer les algorithmes cryptographiques** sans refonte complète de l'infrastructure.

La stratégie recommandée à court/moyen terme est le **TLS Hybride** : combiner en parallèle un algorithme classique (ECDH P-256) ET un algorithme PQC (Kyber768) dans le même handshake TLS 1.3. Ainsi, même si l'un des deux algorithmes est brisé dans le futur, la sécurité globale reste garantie.

### 🛠️ Atelier Pratique

**Configuration TLS Hybride Nginx + Kyber (OQS Provider OpenSSL 3.x) :**

```bash
# 1. Compiler OpenSSL 3.x avec le provider Open Quantum Safe (OQS)
git clone https://github.com/open-quantum-safe/oqs-provider.git
cd oqs-provider && cmake . && make && sudo make install

# 2. Configuration Nginx pour TLS Hybride (ECDH + Kyber768)
# /etc/nginx/sites-available/bcc-api.conf

cat << 'EOF' > /etc/nginx/sites-available/bcc-api-pqc.conf
server {
    listen 443 ssl;
    server_name api.bcc-mnbc.cd;

    # Certificat serveur signé avec Dilithium3 (PQC) + ECDSA P-256 (hybride)
    ssl_certificate     /etc/ssl/bcc/bcc_dilithium3_cert.pem;
    ssl_certificate_key /etc/ssl/bcc/bcc_dilithium3_key.pem;

    # Algorithmes d'échange de clés hybrides : X25519Kyber768Draft00 (PQC+Classique)
    ssl_ecdh_curve X25519Kyber768Draft00:X25519:P-256;

    # TLS 1.3 uniquement (désactiver TLS 1.2 et inférieures)
    ssl_protocols TLSv1.3;

    # Suites de chiffrement (AES-256-GCM pour la sécurité quantique)
    ssl_ciphers TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256;

    location /v1/ {
        proxy_pass http://localhost:8080;
    }
}
EOF

nginx -t && systemctl reload nginx
echo "✅ Nginx configuré avec TLS Hybride ECDH+Kyber768 (PQC-Ready)"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PQC** | Post-Quantum Cryptography — Cryptographie résistante aux ordinateurs quantiques |
| **KEM** | Key Encapsulation Mechanism — Mécanisme d'encapsulation de clés (remplacement post-quantique de DH) |
| **LWE** | Learning With Errors — Problème mathématique difficile sur lequel repose Kyber/Dilithium |
| **HNDL** | Harvest Now, Decrypt Later — Stratégie d'adversaires stockant des données chiffrées pour déchiffrement futur |
| **FIPS 203** | Federal Information Processing Standard 203 — Standard NIST pour ML-KEM (Kyber) |
| **FIPS 204** | Federal Information Processing Standard 204 — Standard NIST pour ML-DSA (Dilithium) |
| **OQS** | Open Quantum Safe — Projet open-source implémentant les algorithmes PQC |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer en termes simples pourquoi l'algorithme de **Shor** rend **RSA-2048** vulnérable aux ordinateurs quantiques, et pourquoi **AES-256** reste acceptable même face à l'algorithme de **Grover**.

**Corrigé :** La sécurité de **RSA-2048** repose sur la difficulté computationnelle de **factoriser** un grand nombre en ses facteurs premiers (ex: factoriser N = p × q avec p et q des nombres premiers de ~1000 bits). Sur un ordinateur classique, cette opération prend un temps exponentiel en la taille de N — actuellement infaisable en temps raisonnable. L'algorithme de **Shor (1994)**, exécuté sur un ordinateur quantique avec suffisamment de qubits logiques stables (~4000 pour RSA-2048), réduit cette complexité à **polynomiale (O(log³ N))**, rendant la factorisation de RSA-2048 réalisable en quelques heures. ECDSA et ECDH sont affectés de façon similaire via le problème du logarithme discret sur courbes elliptiques. Pour **AES-256**, l'algorithme de **Grover** accélère la recherche exhaustive d'une clé de 2^256 possibilités en **O(√(2^256)) = O(2^128)** opérations quantiques. Une sécurité effective de 128 bits reste considérée comme suffisante selon les standards actuels (NIST SP 800-57). AES-128 en revanche serait réduit à 64 bits effectifs — insuffisant.

**Exercice 2 :** Qu'est-ce que l'approche **crypto-agile** et pourquoi est-elle indispensable dans la stratégie de migration PQC de la BCC ?

**Corrigé :** La **crypto-agilité (Crypto-Agility)** désigne la capacité d'un système informatique à **remplacer les algorithmes cryptographiques** (chiffrement, signature, échange de clés) de façon modulaire, sans nécessiter une refonte complète de l'architecture. Cela implique de ne jamais "hardcoder" un algorithme spécifique dans le code applicatif, mais de le configurer via des paramètres ou des abstractions. Pour la BCC, c'est indispensable car : (1) Les standards PQC du NIST (FIPS 203/204/205) ont été publiés en 2024, mais d'autres pourraient évoluer (CRYSTALS-Kyber lui-même a subi des analyses continues). (2) La fenêtre de migration est estimée à 5-10 ans — les systèmes bancaires déployés aujourd'hui seront encore en production lors de la standardisation finale. (3) En cas de découverte d'une faiblesse dans un algorithme PQC, une architecture crypto-agile permet de basculer vers un algorithme alternatif en quelques semaines plutôt qu'en plusieurs années.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel algorithme quantique de 1994 (Peter Shor) permet de factoriser en temps polynomial des entiers de milliers de bits, rendant **RSA et ECDSA** vulnérables aux ordinateurs quantiques ?
- A) L'algorithme de Shor
- B) L'algorithme de Grover
- C) L'algorithme de Dijkstra
- D) L'algorithme A*

**Réponse : A**

**Q2 :** En août 2024, le NIST a finalisé le standard **FIPS 203** basé sur CRYSTALS-**Kyber**. À quelle primitive cryptographique cet algorithme PQC correspond-il ?
- A) Un mécanisme d'encapsulation de clés (KEM — Key Encapsulation Mechanism), remplacement post-quantique de l'échange Diffie-Hellman
- B) Un algorithme de chiffrement symétrique (bloc cipher)
- C) Un algorithme de signature numérique
- D) Un algorithme de hachage cryptographique

**Réponse : A**

**Q3 :** Quelle stratégie d'adversaire étatique consiste à **intercepter et stocker maintenant** des communications chiffrées RSA/ECDSA, dans l'attente de disposer d'un ordinateur quantique suffisamment puissant pour les déchiffrer rétroactivement dans le futur ?
- A) Harvest Now, Decrypt Later (HNDL)
- B) Man-in-the-Middle (MitM)
- C) Replay Attack
- D) Credential Stuffing

**Réponse : A**

**Q4 :** Pourquoi **AES-256** est-il considéré comme résistant aux attaques quantiques via l'algorithme de Grover, contrairement à **AES-128** ?
- A) Grover réduit la sécurité de moitié en bits : AES-256 passe à 128 bits effectifs (encore suffisant), tandis qu'AES-128 passe à 64 bits effectifs (insuffisant par les standards actuels)
- B) AES-256 utilise une longueur de bloc plus grande qu'AES-128
- C) AES-256 est basé sur des courbes elliptiques résistantes aux quantiques
- D) L'algorithme de Grover ne peut pas s'attaquer aux algorithmes symétriques

**Réponse : A**

**Q5 :** Quelle approche de déploiement recommandée consiste à combiner **simultanément** un algorithme classique (ECDH P-256) **ET** un algorithme PQC (Kyber768) dans le même handshake TLS 1.3, pour garantir la sécurité même si l'un des deux algorithmes est ultérieurement compromis ?
- A) TLS Hybride (Hybrid Key Exchange)
- B) TLS 1.2 avec extensions QUANTUM
- C) Protocole DTLS (Datagram TLS)
- D) IPSec avec ESP en mode transport

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
