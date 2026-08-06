# TOME P0 — Socle Universel — Jour 38 (6h) : Cryptographie Appliquée

> [!NOTE]
> **Objectif du jour :** Comprendre les mécanismes fondamentaux de la cryptographie : chiffrement symétrique (AES), asymétrique (RSA), fonctions de hachage, signatures numériques, PKI et SSL/TLS. Savoir utiliser `openssl` pour les opérations cryptographiques courantes en administration système.
>
> **Compétences visées :** `SEC-02` (A) — Cryptographie appliquée et PKI

---

## 1) Module — Chiffrement Symétrique & Asymétrique (2h)

### 📖 Narration/Intuition

La cryptographie est l'art de rendre un message incompréhensible pour quiconque n'a pas la clé. Elle est à la base de toute la sécurité informatique moderne : connexions HTTPS, VPN, messageries chiffrées, signatures de code.

Il existe deux grandes familles de chiffrement : **symétrique** (une seule clé partagée) et **asymétrique** (une paire de clés publique/privée). Chacune a ses forces, ses faiblesses, et ses cas d'usage. En pratique, les systèmes modernes combinent les deux.

### 🔍 Anatomie Technique

**Chiffrement Symétrique — AES (Advanced Encryption Standard) :**

```
Principe : la MÊME clé chiffre ET déchiffre

Expéditeur                          Destinataire
   |  Clé secrète K ─────────────────→  |
   |                                    |
   |  Message clair M                   |
   |  ↓ AES_chiffre(M, K)              |
   |  Texte chiffré C ────────────────→ |
   |                                    |  AES_déchiffre(C, K) → M

Caractéristiques d'AES :
- Standard mondial (NIST, 2001)
- Tailles de clé : 128, 192 ou 256 bits (AES-256 le plus courant)
- Modes opératoires :
  • ECB (Electronic Codebook)  — DÉCONSEILLÉ (patterns visibles)
  • CBC (Cipher Block Chaining) — Courant (IV aléatoire requis)
  • GCM (Galois/Counter Mode)  — RECOMMANDÉ (authentification intégrée)
  • CTR (Counter Mode)          — Performances élevées

Avantages : rapide, efficace, adapté aux gros volumes
Inconvénient : comment partager la clé secrète en toute sécurité ?
              → Le problème du "Key Exchange"
```

```bash
# Chiffrement AES-256-CBC avec openssl
# Chiffrer un fichier
openssl enc -aes-256-cbc -pbkdf2 -in rapport_confidentiel.pdf \
    -out rapport_confidentiel.pdf.enc

# Déchiffrer
openssl enc -aes-256-cbc -pbkdf2 -d \
    -in rapport_confidentiel.pdf.enc \
    -out rapport_dechiffre.pdf

# Chiffrement AES-256-GCM (plus sécurisé, avec authentification)
openssl enc -aes-256-gcm -pbkdf2 -in fichier.txt -out fichier.enc
```

**Chiffrement Asymétrique — RSA :**

```
Principe : DEUX clés mathématiquement liées
• Clé PUBLIQUE  : peut être partagée librement
• Clé PRIVÉE    : JAMAIS partagée, gardée secrète

Usage 1 — Chiffrement :
  Expéditeur chiffre avec la CLEF PUBLIQUE du destinataire
  → Seule la CLEF PRIVÉE du destinataire peut déchiffrer

Usage 2 — Signature :
  Émetteur signe avec sa CLEF PRIVÉE
  → N'importe qui vérifie avec la CLEF PUBLIQUE correspondante

Caractéristiques RSA :
- Tailles de clé : 2048, 3072 ou 4096 bits (2048 minimum aujourd'hui)
- Basé sur la difficulté de factorisation de grands nombres premiers
- Très lent → utilisé pour chiffrer des clés AES, pas des fichiers entiers

Algorithme moderne recommandé : Ed25519 (Elliptic Curve — plus rapide, clés plus courtes)
```

```bash
# Générer une paire de clés RSA 4096 bits
openssl genrsa -out cle_privee.pem 4096
# La clé privée inclut mathématiquement la clé publique

# Extraire la clé publique depuis la clé privée
openssl rsa -in cle_privee.pem -pubout -out cle_publique.pem

# Inspecter une clé RSA
openssl rsa -in cle_privee.pem -text -noout | head -20

# Chiffrer un petit fichier avec la clé publique (pratique pour les clés AES)
openssl pkeyutl -encrypt -inkey cle_publique.pem -pubin \
    -in cle_aes.bin -out cle_aes_chiffree.bin

# Déchiffrer avec la clé privée
openssl pkeyutl -decrypt -inkey cle_privee.pem \
    -in cle_aes_chiffree.bin -out cle_aes_dechiffree.bin

# Génération de clé Ed25519 (moderne, recommandée pour SSH)
ssh-keygen -t ed25519 -C "jean.mbeki@bcc.cd" -f ~/.ssh/id_bcc
```

**Chiffrement Hybride — Comment TLS le fait en pratique :**

```
1. Protocole RSA/ECDH pour l'échange de clé (Key Exchange)
   → Résout le problème du partage sécurisé de la clé symétrique

2. AES-256-GCM pour chiffrer les données réelles
   → Rapide pour les gros volumes

Client                              Serveur
  |── ClientHello (TLS versions, ciphers) ──────────────→|
  |←── ServerHello + Certificat (clé publique) ──────────|
  |── Vérification certificat (CA) ─────────────────────→|
  |── Échange de clé (Key Exchange via ECDH) ────────────|
  |═══════ Communication chiffrée AES-256-GCM ═══════════|
```

---

## 2) Module — Hachage, Signatures Numériques & PKI (2h)

### 📖 Narration/Intuition

Une **fonction de hachage** est une fonction mathématique à sens unique : elle transforme des données de taille quelconque en une empreinte (hash) de taille fixe. Impossible d'inverser le processus (ou très difficile). C'est la base de l'intégrité des données et du stockage sécurisé des mots de passe.

Une **signature numérique** combine chiffrement asymétrique et hachage pour garantir l'authenticité ET l'intégrité d'un document — l'équivalent numérique d'une signature manuscrite notariée.

### 🔍 Anatomie Technique

**Fonctions de hachage :**

```bash
# Propriétés d'une bonne fonction de hachage :
# 1. Déterministe : même entrée → même hash
# 2. Rapide à calculer
# 3. Résistance aux collisions : deux entrées différentes → hashes différents
# 4. Effet avalanche : un bit modifié → hash totalement différent
# 5. Non-réversible (one-way)

# MD5 (Message Digest 5) — 128 bits — OBSOLÈTE pour la sécurité
echo "BCC" | md5sum
# → 9e2c4d5a... (128 bits = 32 caractères hex)
# ❌ Collisions trouvées — NE PAS utiliser pour la sécurité

# SHA-1 (Secure Hash Algorithm 1) — 160 bits — OBSOLÈTE
echo "BCC" | sha1sum
# ❌ Collisions pratiques démontrées (SHAttered, 2017)

# SHA-256 — 256 bits — COURANT ET SÉCURISÉ
echo "BCC" | sha256sum
# → a1b2c3d4... (256 bits = 64 caractères hex) ✅

# SHA-512 — 512 bits — TRÈS SÉCURISÉ
sha512sum fichier.iso

# Vérification d'intégrité d'un téléchargement
sha256sum -c ubuntu-24.04.sha256sums

# Hachage sécurisé de mots de passe (bcrypt via Python)
python3 -c "
import bcrypt
mot_de_passe = b'MonMotDePasse123!'
salt = bcrypt.gensalt(rounds=12)     # Plus le rounds est élevé, plus c'est lent
hash = bcrypt.hashpw(mot_de_passe, salt)
print(hash.decode())
# Vérification
print(bcrypt.checkpw(mot_de_passe, hash))  # True
"
```

**Signatures numériques :**

```bash
# Signature = hash du document chiffré avec la clé PRIVÉE de l'auteur
# Vérification = déchiffrer la signature avec la clé PUBLIQUE → comparer le hash

# 1. Signer un fichier
openssl dgst -sha256 -sign cle_privee.pem \
    -out rapport.pdf.sig rapport.pdf

# 2. Vérifier la signature
openssl dgst -sha256 -verify cle_publique.pem \
    -signature rapport.pdf.sig rapport.pdf
# → Verified OK (ou "Verification Failure")

# Signature de commits Git avec GPG (garantit l'authenticité du code)
gpg --gen-key
git config --global user.signingkey YOUR_KEY_ID
git commit -S -m "feat: code vérifié et signé"
git log --show-signature  # Affiche la vérification de signature
```

**Infrastructure PKI (Public Key Infrastructure) :**

```
                    ┌─────────────────────────────┐
                    │   Root CA (Autorité Racine)  │
                    │   (auto-signé, très protégé) │
                    └──────────────┬──────────────┘
                                   │ Signe
                    ┌──────────────▼──────────────┐
                    │ Intermediate CA (CA Interméd.)│
                    │ (DigiCert, Let's Encrypt...)  │
                    └──────────────┬──────────────┘
                                   │ Émet
                    ┌──────────────▼──────────────┐
                    │  Certificat Final (End-Entity)│
                    │  (server.bcc.cd - X.509)     │
                    │  ├── Clé publique du serveur  │
                    │  ├── Identité (CN, SAN)       │
                    │  ├── Dates de validité         │
                    │  └── Signature de l'Intermed. │
                    └─────────────────────────────┘

Format X.509 : standard international pour les certificats numériques
Extensions de fichiers :
  .pem = Base64 encodé (avec -----BEGIN CERTIFICATE-----)
  .der = Format binaire
  .crt / .cer = Certificat (souvent .pem)
  .key = Clé privée
  .p12 / .pfx = Conteneur PKCS#12 (certificat + clé privée)
  .csr = Certificate Signing Request (demande de signature)
```

```bash
# Workflow complet : créer et signer un certificat SSL pour un serveur interne

# Étape 1 : Créer une CA racine locale (Internal CA)
openssl req -x509 -nodes -newkey rsa:4096 \
    -keyout ca.key -out ca.crt -days 3650 \
    -subj "/C=CD/ST=Kinshasa/O=BCC/CN=BCC-Internal-CA"

# Étape 2 : Générer la clé privée du serveur et un CSR
openssl req -nodes -newkey rsa:2048 \
    -keyout serveur.key -out serveur.csr \
    -subj "/C=CD/ST=Kinshasa/O=BCC/CN=intranet.bcc.cd"

# Étape 3 : Signer le CSR avec notre CA interne
openssl x509 -req -days 365 \
    -in serveur.csr \
    -CA ca.crt -CAkey ca.key -CAcreateserial \
    -out serveur.crt

# Étape 4 : Vérifier le certificat
openssl x509 -in serveur.crt -text -noout
openssl verify -CAfile ca.crt serveur.crt

# Inspecter un certificat SSL d'un serveur distant
openssl s_client -connect google.com:443 -showcerts </dev/null 2>/dev/null \
    | openssl x509 -noout -text | grep -E "(Subject|Issuer|Not|SAN)"
```

---

## 3) Module — SSL/TLS & HTTPS (2h)

### 📖 Narration/Intuition

**TLS** (Transport Layer Security) est le protocole qui sécurise presque toutes les communications sur Internet. HTTPS = HTTP + TLS. Comprendre TLS est fondamental : c'est le mécanisme qui protège les connexions bancaires, les emails, les APIs d'entreprise.

### 🔍 Anatomie Technique

**Versions et sécurité :**

```
TLS 1.0 (1999) — ❌ OBSOLÈTE — Vulnérabilités POODLE, BEAST
TLS 1.1 (2006) — ❌ OBSOLÈTE — Déprecated RFC 8996
TLS 1.2 (2008) — ⚠  ENCORE UTILISÉ — OK si bien configuré
TLS 1.3 (2018) — ✅ RECOMMANDÉ — Plus rapide et sécurisé

Ciphersuites modernes (TLS 1.3) :
• TLS_AES_256_GCM_SHA384      → AES-256-GCM + SHA-384
• TLS_CHACHA20_POLY1305_SHA256 → ChaCha20-Poly1305 + SHA-256

Configuration nginx sécurisée :
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers on;
ssl_session_timeout 1d;
ssl_stapling on;  # OCSP Stapling
add_header Strict-Transport-Security "max-age=63072000" always;  # HSTS
```

```bash
# Let's Encrypt — Certificat SSL gratuit et automatique
apt install certbot python3-certbot-nginx
certbot --nginx -d intranet.bcc.cd -d www.bcc.cd
certbot renew --dry-run  # Teste le renouvellement automatique

# Tester la configuration SSL d'un serveur
openssl s_client -connect bcc.cd:443 -tls1_3  # Teste TLS 1.3
curl -v https://bcc.cd 2>&1 | grep "SSL"       # Via curl

# Outil en ligne (externe) : ssllabs.com/ssltest
# Note : A+ est le grade maximum
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **AES** | Advanced Encryption Standard — standard de chiffrement symétrique |
| **RSA** | Rivest–Shamir–Adleman — algorithme de chiffrement asymétrique |
| **TLS** | Transport Layer Security — protocole de sécurité réseau (successeur de SSL) |
| **SSL** | Secure Sockets Layer — ancien protocole (remplacé par TLS) |
| **PKI** | Public Key Infrastructure — infrastructure à clé publique |
| **CA** | Certificate Authority — autorité de certification |
| **CSR** | Certificate Signing Request — demande de signature de certificat |
| **HSTS** | HTTP Strict Transport Security — force HTTPS |
| **PKCS** | Public Key Cryptography Standards — standards de cryptographie |
| **OCSP** | Online Certificate Status Protocol — vérification de révocation de certificat |
| **SHA** | Secure Hash Algorithm — famille d'algorithmes de hachage |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre `sha256sum fichier.txt` et `openssl dgst -sha256 fichier.txt` ?

**Corrigé :** Les deux calculent le hash SHA-256 du fichier. `sha256sum` est l'outil système Linux standard. `openssl dgst` est l'outil d'OpenSSL qui supporte en plus la signature/vérification. Le résultat du hash est identique.

**Exercice 2 :** Un serveur utilise TLS 1.0 et MD5. Identifiez les problèmes de sécurité et proposez des corrections.

**Corrigé :**
- **TLS 1.0** : protocole obsolète avec des vulnérabilités connues (POODLE, BEAST) → Migrer vers TLS 1.2 minimum, TLS 1.3 préféré
- **MD5** : algorithme cassé, collisions possibles → Remplacer par SHA-256 minimum
- Corrections : `ssl_protocols TLSv1.2 TLSv1.3;` dans nginx/apache

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la principale différence entre chiffrement symétrique et asymétrique ?
- A) Le symétrique est plus sécurisé que l'asymétrique
- B) Le symétrique utilise une clé unique partagée, l'asymétrique utilise une paire clé publique/privée
- C) L'asymétrique est plus rapide que le symétrique
- D) Il n'y a aucune différence pratique

**Réponse : B**

**Q2 :** Pourquoi stocke-t-on des hashes (bcrypt) plutôt que les mots de passe en clair en base de données ?
- A) Les hashes prennent moins de place
- B) En cas de fuite de la base de données, les attaquants ne peuvent pas récupérer les mots de passe en clair
- C) Les hashes se connectent plus rapidement
- D) C'est une exigence légale uniquement

**Réponse : B**

**Q3 :** Dans SSL/TLS, à quoi sert le certificat du serveur ?
- A) À chiffrer toutes les données échangées
- B) À authentifier l'identité du serveur et fournir sa clé publique
- C) À stocker les mots de passe des utilisateurs
- D) À accélérer la connexion réseau

**Réponse : B**

**Q4 :** Quelle version de TLS est recommandée aujourd'hui ?
- A) SSL 3.0
- B) TLS 1.0
- C) TLS 1.2 (minimum) ou TLS 1.3 (préféré)
- D) TLS 2.0

**Réponse : C**

**Q5 :** Une fonction de hachage SHA-256 produit toujours :
- A) Une sortie de longueur variable selon l'entrée
- B) Une sortie de 256 bits (64 caractères hexadécimaux) quelle que soit la taille de l'entrée
- C) Une sortie identique si l'entrée est identique, mais de longueur variable
- D) Une sortie chiffrée qu'on peut inverser avec la clé

**Réponse : B** — Propriété fondamentale : taille fixe, sens unique.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
