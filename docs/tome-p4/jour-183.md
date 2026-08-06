# TOME P4 — Cloud, DevOps & SecOps — Jour 183 (6h) : Cryptographie Appliquée & PKI (TLS 1.3, Chiffrement Symétrique/Asymétrique, HSM, Gestion des Certificats)

> [!NOTE]
> **Objectif du jour :** Maîtriser les fondamentaux de la **cryptographie moderne** appliquée à la sécurité bancaire : chiffrement **symétrique** (AES-256-GCM) vs **asymétrique** (RSA, ECDSA), protocole **TLS 1.3** et ses améliorations de sécurité, architecture d'une **PKI (Public Key Infrastructure)**, gestion du cycle de vie des **certificats X.509**, et utilisation des **HSM (Hardware Security Module)** pour la protection des clés cryptographiques critiques.
>
> **Compétences visées :** `SEC-06` (A) — Cryptographie Appliquée & PKI | `SEC-05` (A) — TLS 1.3 & Gestion des Certificats

---

## 1) Module — Cryptographie Symétrique vs Asymétrique & TLS 1.3 (2h)

### 📖 Narration/Intuition

Lorsqu'un client de la BCC consulte son compte en ligne via `https://portail.bcc.cd`, comment ses données bancaires sont-elles protégées pendant leur transit sur Internet ? Grâce au protocole **TLS 1.3** qui combine deux types de cryptographie complémentaires :

1. **Cryptographie Asymétrique (RSA/ECDH)** : Résout le problème de l'échange de clés. Deux parties qui ne se sont jamais rencontrées peuvent établir un secret partagé sur un canal public sans qu'un espion puisse le déduire (Algorithme de Diffie-Hellman Éphémère — ECDHE).

2. **Cryptographie Symétrique (AES-256-GCM)** : Ultra-rapide pour chiffrer les données en masse. Utilise la clé de session établie via l'échange asymétrique pour chiffrer tout le trafic HTTP.

### 🔍 Anatomie Technique

**TLS 1.3 Handshake (Établissement de la connexion sécurisée) :**

```
CLIENT (Navigateur)                    SERVEUR (portail.bcc.cd)
     │                                         │
     │──── ClientHello ───────────────────────►│
     │   (TLS 1.3, Cipher Suites, Client Key   │
     │    Share ECDHE Curve25519, Nonces)       │
     │                                         │
     │◄─── ServerHello + Certificat X.509 ─────│
     │   (Choix cipher, Server Key Share ECDHE │
     │    + Certificat TLS signé par CA + OCSP) │
     │                                         │
     │ [Les deux parties calculent indépendamment│
     │  la même clé de session symétrique      │
     │  via ECDHE sans jamais la transmettre]   │
     │                                         │
     │◄─── ServerFinished (Chiffré) ───────────│
     │──── ClientFinished (Chiffré) ───────────►│
     │                                         │
     │◄════ TUNNEL TLS AES-256-GCM ÉTABLI ═════│
     │   Toutes les données HTTP sont chiffrées │
     │   avec la clé de session symétrique      │
```

**Avantages de TLS 1.3 vs TLS 1.2 :**
- **1-RTT au lieu de 2-RTT** : Handshake 50% plus rapide
- **Perfect Forward Secrecy (PFS) obligatoire** : Les clés de session passées sont protégées même si la clé privée du serveur est compromise ultérieurement
- **Suppression des algorithmes obsolètes** : RC4, DES, MD5, SHA-1, RSA Key Exchange statique sont bannis
- **Cipher Suites réduites et sûres uniquement** : TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256

---

## 2) Module — PKI & Cycle de Vie des Certificats X.509 (2h)

### 📖 Narration/Intuition

Comment le navigateur d'un client BCC sait-il que le certificat TLS de `portail.bcc.cd` est authentique et non un certificat forgé par un attaquant MITM ? Grâce à la **PKI (Public Key Infrastructure)** — une hiérarchie de confiance cryptographique.

### 🔍 Anatomie Technique

**Hiérarchie PKI de la BCC :**

```
┌──────────────────────────────────────────────────────────────┐
│           ROOT CA (Autorité de Certification Racine)         │
│   CN=BCC Root CA G1                                          │
│   Clé RSA 4096 bits / Validité 20 ans                        │
│   ⚠️ Stockée OFFLINE sur HSM dans le coffre-fort physique BCC│
│   ⚠️ Utilisée UNIQUEMENT pour signer les CA Intermédiaires   │
└─────────────────────┬────────────────────────────────────────┘
                      │ Signature
          ┌───────────┴──────────┐
          │                      │
┌─────────▼────────┐  ┌──────────▼────────┐
│ INTERMEDIATE CA 1│  │ INTERMEDIATE CA 2  │
│ BCC TLS Issuing  │  │ BCC Code Signing   │
│ CA (Serveurs Web)│  │ CA (Pipelines CI)  │
│ RSA 2048 / 5 ans │  │ ECDSA P-384 / 3 ans│
└─────────┬────────┘  └──────────┬─────────┘
          │                      │
  ┌───────┴────────┐   ┌─────────┴──────────┐
  │ portail.bcc.cd │   │  CI/CD Signing Cert │
  │ api.bcc.cd     │   │  (CNAB/Notary)      │
  │ ECDSA P-256    │   │                     │
  │ Validité 90j   │   │                     │
  └────────────────┘   └─────────────────────┘
```

**Gestion des Certificats avec cert-manager (Kubernetes) :**

```yaml
# Installation automatique des certificats TLS via cert-manager + Let's Encrypt
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: bcc-api-tls-cert
  namespace: bcc-production
spec:
  secretName: bcc-api-tls-secret
  issuerRef:
    name: bcc-letsencrypt-issuer
    kind: ClusterIssuer
  duration: 2160h       # 90 jours (Standard Let's Encrypt)
  renewBefore: 360h     # Renouveler 15 jours avant expiration automatiquement
  dnsNames:
    - api.bcc.cd
    - portail.bcc.cd
    - www.bcc.cd
```

**Vérification d'un certificat X.509 en ligne de commande :**

```bash
# Inspecter le certificat TLS d'un serveur BCC
openssl s_client -connect api.bcc.cd:443 -showcerts 2>/dev/null | \
  openssl x509 -noout -text | grep -E "Subject|Issuer|Not Before|Not After|DNS"

# Vérifier la chaîne de certification complète
openssl verify -CAfile bcc_ca_chain.pem portail_bcc_cert.pem

# Tester les configurations TLS (Cipher Suites, Protocoles) avec nmap
nmap --script ssl-enum-ciphers -p 443 api.bcc.cd

# Vérifier le OCSP Stapling (Révocation de certificat en temps réel)
openssl s_client -connect api.bcc.cd:443 -status 2>/dev/null | grep "OCSP Response"
```

---

## 3) Module — HSM & Chiffrement des Données Sensibles (2h)

### 📖 Narration/Intuition

Les **HSM (Hardware Security Modules)** sont des équipements matériels dédiés à la génération, au stockage et à l'utilisation des clés cryptographiques les plus sensibles. Ils offrent une protection contre l'extraction physique des clés (tamper-evident : auto-destruction des clés en cas d'intrusion physique détectée).

Les banques centrales comme la BCC utilisent des HSM pour protéger les clés de chiffrement des données clients, les clés de signature JWT, les clés des cartes bancaires (EMV), et les clés de la Root CA PKI.

### 🛠️ Atelier Pratique

**Chiffrement AES-256-GCM des données sensibles avec Node.js (`crypto_service.js`) :**

```javascript
const crypto = require('crypto');

// ══════════════════════════════════════════════
// SERVICE DE CHIFFREMENT AES-256-GCM POUR LA BCC
// ══════════════════════════════════════════════
// La clé de chiffrement AES est gérée par AWS KMS (HSM Cloud)
// Elle n'est jamais stockée en clair dans le code ou les variables d'environnement

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits

class CryptoService {
    /**
     * Chiffrement AES-256-GCM d'une valeur sensible (ex: IBAN, PIN, données biométriques)
     * @param {string} plaintext - Donnée à chiffrer
     * @param {Buffer} encryptionKey - Clé AES-256 (32 bytes depuis AWS KMS)
     * @returns {string} Résultat chiffré au format JSON : {iv, authTag, ciphertext}
     */
    static encrypt(plaintext, encryptionKey) {
        const iv = crypto.randomBytes(12);       // IV aléatoire de 96 bits (recommandé pour GCM)

        const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

        let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
        ciphertext += cipher.final('hex');

        const authTag = cipher.getAuthTag(); // Tag d'authentification GCM (Intégrité garantie)

        return JSON.stringify({
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
            ciphertext
        });
    }

    /**
     * Déchiffrement AES-256-GCM
     * @param {string} encryptedData - Données chiffrées (format JSON)
     * @param {Buffer} encryptionKey - Clé AES-256 (32 bytes depuis AWS KMS)
     * @returns {string} Donnée déchiffrée
     */
    static decrypt(encryptedData, encryptionKey) {
        const { iv, authTag, ciphertext } = JSON.parse(encryptedData);

        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            encryptionKey,
            Buffer.from(iv, 'hex')
        );

        // Vérification de l'authentification (Intégrité des données) — OBLIGATOIRE
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));

        let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
        plaintext += decipher.final('utf8');

        return plaintext;
    }
}

module.exports = CryptoService;

// ── EXEMPLE D'UTILISATION ──
// const key = await getKeyFromAWSKMS(); // Clé récupérée depuis le HSM AWS KMS
// const encryptedIBAN = CryptoService.encrypt('CD89BCC00000001', key);
// Stocké en BDD: {"iv":"a1b2c3...","authTag":"d4e5f6...","ciphertext":"789abc..."}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PKI** | Public Key Infrastructure — Infrastructure de gestion des clés publiques et certificats |
| **HSM** | Hardware Security Module — Module matériel dédié à la gestion sécurisée des clés cryptographiques |
| **CA** | Certificate Authority — Autorité de Certification, entité qui signe les certificats X.509 |
| **ECDHE** | Elliptic Curve Diffie-Hellman Ephemeral — Échange de clé éphémère par courbes elliptiques |
| **PFS** | Perfect Forward Secrecy — Propriété garantissant que la compromission d'une clé ne compromet pas les sessions passées |
| **OCSP** | Online Certificate Status Protocol — Protocole de vérification de la révocation d'un certificat en temps réel |
| **GCM** | Galois/Counter Mode — Mode de chiffrement AES authentifié garantissant confidentialité ET intégrité |
| **EMV** | Europay Mastercard Visa — Standard de sécurité des cartes bancaires à puce |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer pourquoi TLS 1.3 rend le **Perfect Forward Secrecy (PFS)** obligatoire et quel scénario d'attaque cela rend impossible.

**Corrigé :** Dans TLS 1.3, l'échange de clé utilise **exclusivement ECDHE** (Diffie-Hellman Éphémère), générant une nouvelle paire de clés éphémères pour chaque session. Ces clés éphémères sont détruites à la fin de la session. Le **PFS** est la propriété qui en résulte : même si un attaquant enregistre passivement tout le trafic chiffré aujourd'hui ET parvient à obtenir la **clé privée TLS du serveur** (ex: vol du certificat) dans le futur, il ne peut **pas déchiffrer les sessions passées** car les clés éphémères ECDHE utilisées n'existent plus. Dans TLS 1.2 sans PFS (RSA Key Exchange statique), le scénario inverse était possible : capturer le trafic maintenant, voler la clé privée plus tard, tout déchiffrer a posteriori.

**Exercice 2 :** Qu'est-ce que le **mode GCM (Galois/Counter Mode)** d'AES apporte par rapport au simple mode AES-CBC, et pourquoi est-il préféré pour les APIs bancaires ?

**Corrigé :** Le mode **AES-CBC** fournit uniquement la **confidentialité** (chiffrement des données). Il ne garantit pas l'intégrité : un attaquant peut modifier le ciphertext en transit (Bit Flipping Attack) et le serveur déchiffrera des données corrompues sans détecter l'altération. Le mode **AES-GCM (Galois/Counter Mode)** est un mode de chiffrement **authentifié (AEAD — Authenticated Encryption with Associated Data)** : il fournit simultanément (1) la **confidentialité** (chiffrement AES en mode compteur) ET (2) l'**intégrité + authenticité** via un **Authentication Tag** (MAC cryptographique de 128 bits calculé sur le ciphertext et les données associées). Si le moindre bit du ciphertext est altéré en transit, la vérification du `authTag` échoue et le déchiffrement est refusé. Pour une API bancaire traitant des montants de virements, cette garantie d'intégrité est absolument critique.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle propriété de TLS 1.3, rendue obligatoire par l'utilisation exclusive d'ECDHE, garantit que les sessions passées ne peuvent pas être déchiffrées même si la clé privée TLS du serveur est compromise ultérieurement ?
- A) Le Perfect Forward Secrecy (PFS)
- B) Le chiffrement AES-256
- C) L'utilisation de SHA-256
- D) Le certificat X.509

**Réponse : A**

**Q2 :** Dans une PKI bancaire, pourquoi la **Root CA** doit-elle être stockée **hors ligne (offline)** sur un **HSM** physique sécurisé ?
- A) La Root CA est la racine de toute la chaîne de confiance. Si elle est compromise, toute la PKI doit être reconstruite. Son stockage offline et sur HSM garantit qu'elle ne peut pas être volée via le réseau
- B) Pour économiser les ressources serveur
- C) Parce que les Root CAs n'ont pas besoin d'être utilisées régulièrement
- D) Pour faciliter la sauvegarde des certificats

**Réponse : A**

**Q3 :** Que garantit le **tag d'authentification (AuthTag)** produit par le mode **AES-256-GCM** lors du déchiffrement des données ?
- A) L'intégrité et l'authenticité des données : toute modification du ciphertext depuis le chiffrement sera détectée et le déchiffrement sera refusé
- B) Uniquement la confidentialité des données
- C) La compression des données chiffrées
- D) La signature numérique de l'expéditeur

**Réponse : A**

**Q4 :** Quel protocole permet à un navigateur de vérifier en temps réel si un certificat TLS X.509 présenté par un serveur a été révoqué par l'Autorité de Certification qui l'a émis ?
- A) OCSP (Online Certificate Status Protocol)
- B) CRL uniquement (Certificate Revocation List)
- C) DNSSEC
- D) RADIUS

**Réponse : A**

**Q5 :** Combien de bits contient une clé **AES-256**, et quel est le nombre de combinaisons théoriques possibles rendant une attaque par force brute computationnellement infaisable ?
- A) 256 bits — 2^256 combinaisons (≈ 1,16 × 10^77 — infaisable même avec tous les supercalculateurs actuels pendant la durée de l'Univers)
- B) 128 bits — suffisamment sécurisé pour les usages basiques
- C) 512 bits — standard bancaire uniquement
- D) 64 bits — standard DES obsolète

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
