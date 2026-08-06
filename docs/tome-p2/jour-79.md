# TOME P2 — Réseaux & Télécoms — Jour 79 (6h) : Cryptographie Appliquée & PKI

> [!NOTE]
> **Objectif du jour :** Comprendre et appliquer les fondamentaux de la cryptographie : chiffrement symétrique (AES), asymétrique (RSA/ECC), signatures numériques, hachage cryptographique (SHA-256), et PKI (Public Key Infrastructure) avec gestion des certificats X.509. Contexte BCC : sécurisation des communications et authentification forte.
>
> **Compétences visées :** `SEC-02` (A) — Cryptographie | `SEC-04` (A) — Sécurité des Communications

---

## 1) Module — Fondamentaux Cryptographiques (2h)

### 📖 Narration/Intuition

La cryptographie est le fondement de toute sécurité informatique moderne. HTTPS, les signatures numériques des virements SWIFT, l'authentification par certificat, le chiffrement des disques — tout repose sur quelques primitives mathématiques fondamentales. Comprendre ces primitives permet de choisir les bons algorithmes et d'éviter les pièges (MD5 pour les mots de passe, RSA-512 pour les certificats, ECB comme mode de chiffrement...).

### 🔍 Anatomie Technique

**Chiffrement symétrique (AES) :**

```
Même clé pour chiffrer ET déchiffrer.
Avantage : très rapide (utilisé pour les données volumineuses).
Inconvénient : comment partager la clé de manière sécurisée ?

AES (Advanced Encryption Standard) :
  - Taille de clé : 128, 192 ou 256 bits
  - Taille de bloc : 128 bits (fixe)
  - Modes d'opération :
    ❌ ECB (Electronic Codebook) : identique blocks → identique ciphertext (JAMAIS utiliser)
    ✅ CBC (Cipher Block Chaining) : chaque bloc dépend du précédent + IV
    ✅ CTR (Counter) : transforme en chiffrement de flux, parallélisable
    ✅ GCM (Galois/Counter Mode) : chiffrement + authentification intégrée (RECOMMANDÉ)
```

**Chiffrement asymétrique (RSA & ECC) :**

```
Deux clés : clé publique (partageable) + clé privée (secrète).
Ce qui est chiffré avec la clé publique ne peut être déchiffré qu'avec la clé privée.

RSA (Rivest-Shamir-Adleman) :
  - Basé sur la difficulté de factoriser de grands entiers
  - Tailles recommandées : 2048 bits minimum, 4096 bits pour usage bancaire
  - Lent pour les grandes données → en pratique, RSA chiffre seulement la clé symétrique

ECC (Elliptic Curve Cryptography) :
  - Basé sur les courbes elliptiques
  - Beaucoup plus court pour une sécurité équivalente :
    ECC 256 bits ≈ RSA 3072 bits
  - Courbes recommandées : P-256 (secp256r1), P-384, Ed25519
  - Utilisé dans : TLS 1.3, SSH moderne (Ed25519), Bitcoin

ECDH (Elliptic Curve Diffie-Hellman) :
  - Protocole d'échange de clés sans jamais transmettre la clé
  - Permet le Perfect Forward Secrecy (PFS) :
    chaque session a sa propre clé éphémère → compromission future ne révèle pas le passé
```

**Hachage cryptographique :**

```python
#!/usr/bin/env python3
"""Démonstration des algorithmes de hachage cryptographique."""
import hashlib
import hmac
import secrets

# ─── Hachage (fingerprint) ────────────────────────────────────────────────────
texte = "Virement BCC 500000 CDF vers compte BCC-12345"

# SHA-256 (standard actuel)
hash_sha256 = hashlib.sha256(texte.encode()).hexdigest()
print(f"SHA-256  : {hash_sha256}")
# → 256 bits = 64 caractères hexadécimaux

# SHA-3-256 (successeur résistant aux attaques sur SHA-2)
hash_sha3 = hashlib.sha3_256(texte.encode()).hexdigest()
print(f"SHA3-256 : {hash_sha3}")

# ❌ Algorithmes OBSOLÈTES — NE PAS UTILISER
hash_md5 = hashlib.md5(texte.encode()).hexdigest()
hash_sha1 = hashlib.sha1(texte.encode()).hexdigest()
print(f"MD5 (obsolète !) : {hash_md5}")
print(f"SHA-1 (obsolète !) : {hash_sha1}")

# ─── HMAC (Hash-based Message Authentication Code) ───────────────────────────
# HMAC garantit à la fois l'intégrité ET l'authenticité du message
cle_secrete = b"cle-hmac-bcc-2024-très-longue-et-aléatoire"
mac = hmac.new(cle_secrete, texte.encode(), hashlib.sha256).hexdigest()
print(f"HMAC-SHA256 : {mac}")

# Vérification HMAC (comparaison à temps constant pour éviter les timing attacks)
mac_recu = "valeur-du-mac-reçu"
# hmac.compare_digest() évite les timing attacks contrairement à mac_recu == mac
est_valide = hmac.compare_digest(mac, mac_recu)

# ─── Hachage des mots de passe (bcrypt, argon2) ──────────────────────────────
# JAMAIS utiliser SHA-256 pour les mots de passe !
# Utiliser bcrypt, scrypt ou argon2 (password-hashing functions avec salt)
import bcrypt   # pip install bcrypt

mdp = b"MonMotDePasseUtilisateur!"
# Générer un hash avec salt (bcrypt intègre le sel dans le hash)
hash_bcrypt = bcrypt.hashpw(mdp, bcrypt.gensalt(rounds=12))
print(f"Bcrypt : {hash_bcrypt.decode()}")

# Vérification
est_correct = bcrypt.checkpw(mdp, hash_bcrypt)
print(f"Mot de passe correct : {est_correct}")
```

---

## 2) Module — Cryptographie avec OpenSSL & Python (2h)

### 📖 Narration/Intuition

**OpenSSL** est la bibliothèque cryptographique de référence — elle alimente HTTPS pour la majorité d'Internet, implémente TLS, gère les certificats X.509. Sa maîtrise en ligne de commande est indispensable pour tout ingénieur sécurité.

### 🔍 Anatomie Technique

**Opérations cryptographiques avec OpenSSL :**

```bash
# ─── 1. Génération de clés ─────────────────────────────────────────────────────

# RSA 4096 bits (pour les serveurs critiques BCC)
openssl genrsa -out bcc-server.key 4096
openssl rsa -in bcc-server.key -pubout -out bcc-server-pub.key

# Ed25519 (courbe moderne, 256 bits équivalent RSA-7000)
openssl genpkey -algorithm Ed25519 -out bcc-ed25519.key

# ECDSA sur courbe P-384 (recommandé pour usage bancaire)
openssl ecparam -name secp384r1 -genkey -noout -out bcc-ecdsa.key

# ─── 2. Chiffrement/Déchiffrement ─────────────────────────────────────────────

# Chiffrement AES-256-GCM d'un fichier
openssl enc -aes-256-gcm \
    -pbkdf2 -iter 600000 \      # PBKDF2 avec 600 000 itérations (anti brute-force)
    -in rapport-confidentiel.pdf \
    -out rapport-chiffré.bin \
    -pass pass:"MotDePasseChiffrement2024!"

# Déchiffrement
openssl enc -aes-256-gcm -d \
    -pbkdf2 -iter 600000 \
    -in rapport-chiffré.bin \
    -out rapport-déchiffré.pdf \
    -pass pass:"MotDePasseChiffrement2024!"

# ─── 3. Signatures numériques ─────────────────────────────────────────────────

# Signer un document (preuve d'authenticité et d'intégrité)
openssl dgst -sha256 -sign bcc-server.key \
    -out rapport.sig \
    rapport-confidentiel.pdf

# Vérifier la signature
openssl dgst -sha256 -verify bcc-server-pub.key \
    -signature rapport.sig \
    rapport-confidentiel.pdf
# "Verified OK" = document authentique et non modifié

# ─── 4. Inspection des certificats existants ────────────────────────────────────

# Voir le certificat d'un serveur en direct
openssl s_client -connect bcc.cd:443 2>/dev/null | openssl x509 -noout -text

# Vérifier la date d'expiration
echo | openssl s_client -connect bcc.cd:443 2>/dev/null | \
    openssl x509 -noout -dates

# Extraire l'empreinte du certificat (fingerprint)
echo | openssl s_client -connect bcc.cd:443 2>/dev/null | \
    openssl x509 -noout -fingerprint -sha256

# Tester les suites cryptographiques supportées par un serveur TLS
nmap --script ssl-enum-ciphers -p 443 bcc.cd
# ou
testssl.sh bcc.cd    # Outil de test TLS complet (apt install testssl.sh)
```

**Chiffrement asym. avec Python (cryptography) :**

```python
#!/usr/bin/env python3
"""Chiffrement hybride RSA+AES (comme TLS) en Python."""
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

# ─── Générer une paire de clés RSA ────────────────────────────────────────────
cle_privee = rsa.generate_private_key(
    public_exponent=65537,
    key_size=4096,
)
cle_publique = cle_privee.public_key()

# Sérialiser la clé privée (avec chiffrement)
cle_privee_pem = cle_privee.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.BestAvailableEncryption(b"passphrase-cle")
)

# ─── Chiffrement hybride (comme TLS) ─────────────────────────────────────────
message = b"Transaction SWIFT: BCC → BNP 5M EUR"

# 1. Générer une clé AES symétrique aléatoire (256 bits)
cle_aes = os.urandom(32)

# 2. Chiffrer le message avec AES-256-GCM (rapide pour les données)
nonce = os.urandom(12)
aesgcm = AESGCM(cle_aes)
message_chiffré = aesgcm.encrypt(nonce, message, None)

# 3. Chiffrer la clé AES avec RSA (clé publique du destinataire)
cle_aes_chiffrée = cle_publique.encrypt(
    cle_aes,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)

# ─── Déchiffrement ────────────────────────────────────────────────────────────
# 1. Déchiffrer la clé AES avec RSA (clé privée du destinataire)
cle_aes_récupérée = cle_privee.decrypt(
    cle_aes_chiffrée,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)

# 2. Déchiffrer le message avec la clé AES récupérée
aesgcm_decrypt = AESGCM(cle_aes_récupérée)
message_déchiffré = aesgcm_decrypt.decrypt(nonce, message_chiffré, None)

print(f"Message original  : {message.decode()}")
print(f"Message déchiffré : {message_déchiffré.decode()}")
assert message == message_déchiffré, "ERREUR : les messages ne correspondent pas !"
print("✅ Chiffrement hybride RSA+AES vérifié avec succès")
```

---

## 3) Module — PKI (Public Key Infrastructure) & Certificats X.509 (2h)

### 📖 Narration/Intuition

Un **certificat X.509** prouve l'identité d'un serveur ou d'un utilisateur : il lie une clé publique à une identité (nom de domaine, nom d'organisation) en apposant la signature d'une **Autorité de Certification (CA)** de confiance. Sans CA, n'importe qui pourrait créer un certificat pour `bcc.cd` — le navigateur n'aurait aucun moyen de faire confiance au certificat.

### 🔍 Anatomie Technique

**Créer une PKI interne avec OpenSSL :**

```bash
#!/bin/bash
# Créer une PKI interne BCC (CA Racine → CA Intermédiaire → Certificats)
# Cette architecture à 3 niveaux est la norme pour les organisations de taille moyenne

set -euo pipefail
PKI_DIR="/opt/bcc-pki"
mkdir -p $PKI_DIR/{certs,crl,newcerts,private} $PKI_DIR/intermediate/{certs,crl,csr,newcerts,private}

# ─── 1. CA RACINE (Root CA) ──────────────────────────────────────────────────
echo "=== Création du CA Racine BCC ==="
# La clé racine doit être stockée HORS LIGNE (HSM ou coffre-fort physique)
openssl genrsa -aes256 -out $PKI_DIR/private/ca-racine.key.pem 4096
chmod 400 $PKI_DIR/private/ca-racine.key.pem

openssl req -config openssl-root.cnf \
    -key $PKI_DIR/private/ca-racine.key.pem \
    -new -x509 \
    -days 7300 \           # 20 ans pour le CA Racine
    -sha384 \
    -extensions v3_ca \
    -out $PKI_DIR/certs/ca-racine.crt.pem \
    -subj "/C=CD/ST=Kinshasa/O=Banque Centrale du Congo/CN=BCC Root CA"

echo "CA Racine créé : valide 20 ans"

# ─── 2. CA INTERMÉDIAIRE ─────────────────────────────────────────────────────
echo "=== Création du CA Intermédiaire BCC ==="
# Le CA intermédiaire signe les certificats finaux
# Si compromis, on peut le révoquer sans révoquer le CA Racine
openssl genrsa -aes256 -out $PKI_DIR/intermediate/private/ca-inter.key.pem 4096

openssl req -config openssl-intermediate.cnf \
    -new -sha256 \
    -key $PKI_DIR/intermediate/private/ca-inter.key.pem \
    -out $PKI_DIR/intermediate/csr/ca-inter.csr.pem \
    -subj "/C=CD/ST=Kinshasa/O=Banque Centrale du Congo/CN=BCC Intermediate CA"

# Signer avec le CA Racine
openssl ca -config openssl-root.cnf \
    -extensions v3_intermediate_ca \
    -days 3650 \           # 10 ans pour le CA Intermédiaire
    -notext -md sha256 \
    -in $PKI_DIR/intermediate/csr/ca-inter.csr.pem \
    -out $PKI_DIR/intermediate/certs/ca-inter.crt.pem

# ─── 3. CERTIFICAT SERVEUR ───────────────────────────────────────────────────
echo "=== Émission du certificat pour api.bcc.cd ==="
openssl genrsa -out $PKI_DIR/intermediate/private/api.bcc.cd.key.pem 4096

openssl req -config openssl-intermediate.cnf \
    -key $PKI_DIR/intermediate/private/api.bcc.cd.key.pem \
    -new -sha256 \
    -out $PKI_DIR/intermediate/csr/api.bcc.cd.csr.pem \
    -subj "/C=CD/ST=Kinshasa/O=Banque Centrale du Congo/CN=api.bcc.cd"

# Signer avec le CA Intermédiaire
openssl ca -config openssl-intermediate.cnf \
    -extensions server_cert \
    -days 365 \            # 1 an maximum pour les certificats serveur
    -notext -md sha256 \
    -in $PKI_DIR/intermediate/csr/api.bcc.cd.csr.pem \
    -out $PKI_DIR/intermediate/certs/api.bcc.cd.crt.pem

echo "=== ✅ PKI BCC opérationnelle ==="
echo "Certificat serveur : $PKI_DIR/intermediate/certs/api.bcc.cd.crt.pem"
echo "Clé privée         : $PKI_DIR/intermediate/private/api.bcc.cd.key.pem"
echo "Chaîne de confiance : CA Inter → CA Racine"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PKI** | Public Key Infrastructure — infrastructure de gestion des clés publiques |
| **CA** | Certificate Authority — Autorité de Certification |
| **CRL** | Certificate Revocation List — liste des certificats révoqués |
| **OCSP** | Online Certificate Status Protocol — vérification en temps réel de l'état d'un certificat |
| **CSR** | Certificate Signing Request — demande de signature de certificat |
| **PFS** | Perfect Forward Secrecy — confidentialité persistante (chaque session a sa propre clé) |
| **PBKDF2** | Password-Based Key Derivation Function 2 — dérivation de clé à partir d'un mot de passe |
| **HMAC** | Hash-based Message Authentication Code — code d'authentification de message basé sur le hachage |
| **HSM** | Hardware Security Module — module matériel de sécurité pour le stockage des clés |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi ne faut-il JAMAIS utiliser SHA-256 pour hacher les mots de passe utilisateur dans une base de données ?

**Corrigé :** SHA-256 est rapide (milliards de calculs/seconde avec un GPU) et ne supporte pas de sel natif. Un attaquant avec une table arc-en-ciel ou un GPU peut tester des milliards de mots de passe par seconde contre les hashes. **bcrypt, scrypt, ou argon2** sont conçus pour être lents et résistants aux attaques par force brute.

**Exercice 2 :** Expliquez le rôle du CA intermédiaire dans une PKI à 3 niveaux.

**Corrigé :** La clé du CA Racine est stockée hors ligne. Si un CA intermédiaire est compromis, sa CRL (liste de révocation) permet de révoquer tous ses certificats sans compromettre ni révoquer le CA Racine (qui continuerait d'émettre de nouveaux CA intermédiaires sains). Cela limite le rayon de blast d'une compromission.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la différence entre le chiffrement symétrique (AES) et asymétrique (RSA) ?
- A) AES chiffre les clés, RSA chiffre les données
- B) AES utilise la même clé pour chiffrer et déchiffrer (rapide) ; RSA utilise une paire clé publique/privée (plus lent, utilisé pour l'échange de clés)
- C) RSA est toujours plus sécurisé qu'AES
- D) AES est obsolète et ne doit plus être utilisé

**Réponse : B**

**Q2 :** Le mode AES-GCM est recommandé car :
- A) Il est le plus rapide de tous les modes AES
- B) Il fournit chiffrement ET authentification intégrée (AEAD) — protège contre la modification des données chiffrées
- C) Il ne nécessite pas d'IV (nonce)
- D) Il supporte des clés de taille illimitée

**Réponse : B**

**Q3 :** `HMAC-SHA256` est différent de `SHA256` car :
- A) HMAC est plus lent donc plus sécurisé
- B) HMAC nécessite une clé secrète et garantit l'authenticité du message (authentification) en plus de l'intégrité
- C) SHA256 seul est suffisant pour garantir l'authenticité d'un message
- D) HMAC utilise un algorithme différent de SHA256

**Réponse : B**

**Q4 :** Un certificat X.509 permet de :
- A) Chiffrer les données sans échange de clé préalable
- B) Lier une clé publique à une identité vérifiée (domaine, organisation) grâce à la signature d'un CA de confiance
- C) Stocker des clés privées de manière sécurisée
- D) Remplacer l'authentification par mot de passe dans SSH

**Réponse : B**

**Q5 :** "Perfect Forward Secrecy" (PFS) dans TLS signifie :
- A) Le certificat du serveur est parfaitement sécurisé
- B) Même si la clé privée du serveur est compromise dans le futur, les sessions passées ne peuvent pas être déchiffrées (clés de session éphémères)
- C) TLS n'a pas besoin de certificat avec PFS
- D) PFS empêche les attaques man-in-the-middle

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
