# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 287 (6h) : Cryptographic Agility & Migration PQC (Hybrid TLS 1.3, OpenSSL 3.3 avec liboqs & Dual-Key Exchange)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'**Agilité Cryptographique (Crypto Agility)** et l'implémentation de la **migration hybride vers TLS 1.3 Post-Quantique** : déployer des suites de chiffrement hybrides combinant ECDH traditionnel et ML-KEM (ex: X25519_Kyber768) avec **OpenSSL 3.3 / OQS Provider**, et concevoir une politique d'inventaire d'actifs cryptographiques.
>
> **Compétences visées :** `PQC-03` (A) — Cryptographic Agility & Asset Inventory | `PQC-04` (A) — Hybrid TLS 1.3 Deployment (X25519 + ML-KEM)

---

## 1) Module — Concepts de Crypto Agility & Hybrid Key Exchange (2h)

### 📖 Narration/Intuition

La transition vers la cryptographie post-quantique prendra plus d'une décennie. Pendant cette phase transitoire, les standards d'entreprise (IETF / ANSSI / NCSC) imposent une approche **Hybride (Dual Key Exchange)** : chaque session TLS dérive son secret partagé à la fois d'un algorithme classique (ex: X25519) ET d'un algorithme PQC (ex: ML-KEM 768). Si l'un des deux algorithmes est cassé, l'autre maintient la sécurité !

---

## 2) Module — Déploiement d'un Serveur Hybrid TLS 1.3 avec OpenSSL + oqs-provider (`hybrid_tls_server.sh`) (2h)

### 🛠️ Atelier Pratique

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Compilation OpenSSL 3.x avec le provider oqs-provider
# ═══════════════════════════════════════════════════════
# oqs-provider ajoute le support PQC (ML-KEM, ML-DSA) à OpenSSL
# https://github.com/open-quantum-safe/oqs-provider

openssl list -kem-algorithms -provider oqsprovider
# Sortie : kyber512, kyber768, kyber1024, p256_kyber512, x25519_kyber768

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Génération de certificats hybrides (ML-DSA / Dilithium)
# ═══════════════════════════════════════════════════════
openssl req -new -newkey mldsa65 -nodes -keyout server_pqc.key \
    -out server_pqc.csr -subj "/CN=pqc.company.local" -provider oqsprovider

openssl x509 -req -in server_pqc.csr -signkey server_pqc.key \
    -out server_pqc.crt -days 365 -provider oqsprovider

# ═══════════════════════════════════════════════════════
# ÉTAPE 3 — Démarrage du Serveur Nginx / OpenSSL s_server Hybride
# ═══════════════════════════════════════════════════════
# Lancer un serveur de test avec l'échange de clé hybride x25519_kyber768
openssl s_server -cert server_pqc.crt -key server_pqc.key \
    -accept 4433 -tls1_3 -groups x25519_kyber768 -provider oqsprovider -provider default

# ═══════════════════════════════════════════════════════
# ÉTAPE 4 — Connexion Client TLS 1.3 Hybride
# ═══════════════════════════════════════════════════════
openssl s_client -connect localhost:4433 -groups x25519_kyber768 -provider oqsprovider -provider default
# Résultat : Connection established using TLS_AES_256_GCM_SHA384
# Temp Key: x25519_kyber768 (Hybrid ECDH + ML-KEM)
```

---

## 3) Module — Inventaire d'Actifs Cryptographiques (`crypto_inventory.py`) (2h)

```python
import ssl
import socket

# Script d'inventaire automatisé d'agilité cryptographique (Crypto Inventory)

def scan_tls_crypto_agility(hostname: str, port: int = 443):
    print(f"[*] Audit d'Agilité Cryptographique sur {hostname}:{port}...")
    context = ssl.create_default_context()

    with socket.create_connection((hostname, port)) as sock:
        with context.wrap_socket(sock, server_hostname=hostname) as ssock:
            cipher = ssock.cipher()
            version = ssock.version()

            print(f"[+] Protocole négocié : {version}")
            print(f"[+] Suite de chiffrement : {cipher[0]}")
            print(f"[+] Clé d'échange : {cipher[2]} bits")

            if version == "TLSv1.3":
                print("[+] PQC Ready : Support TLS 1.3 validé !")
            else:
                print("[!] ALERTE : Le serveur n'utilise pas TLS 1.3 (Obsolet pour la migration PQC)")

scan_tls_crypto_agility("google.com")
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Crypto Agility** | Capacité d'un système à basculer rapidement d'un algorithme cryptographique à un autre sans refonte |
| **oqs-provider** | Extension OpenSSL 3.x permettant d'intégrer nativement les algorithmes PQC de liboqs |
| **X25519_Kyber768** | Combinaison d'échange de clés hybride recommandée (ECDH Curve25519 + ML-KEM 768) |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Pourquoi la phase de transition vers la cryptographie post-quantique impose-t-elle l'utilisation d'**Échanges de Clés Hybrides (Hybrid Key Exchange)** ?
- A) Pour combiner la sécurité d'un algorithme classique éprouvé (ex: X25519) avec celle d'un algorithme PQC (ex: ML-KEM), garantissant que la session reste chiffrée si l'un des deux s'avère vulnérable
- B) Pour doubler la vitesse d'Internet
- C) Pour réduire l'utilisation mémoire
- D) Parce qu'OpenSSL est payant

**Réponse : A**

**Q2 :** Quel composant open-source s'interface avec **OpenSSL 3.x** pour ajouter la prise en charge des algorithmes PQC ML-KEM et ML-DSA ?
- A) `oqs-provider`
- B) Apache
- C) Nginx
- D) Docker

**Réponse : A**

**Q3 :** Qu'est-ce que l'**Agilité Cryptographique (Cryptographic Agility)** ?
- A) La capacité architecturale d'un système d'information à mettre à jour ou remplacer ses algorithmes et longueurs de clés sans interrompre les services
- B) La vitesse de frappe au clavier
- C) La capacité d'un serveur à redémarrer rapidement
- D) L'utilisation de mots de passe aléatoires

**Réponse : A**

**Q4 :** Quelle version du protocole TLS est la **seule** capable d'intégrer les extensions d'échange de clés hybrides post-quantiques ?
- A) TLS 1.3
- B) TLS 1.0
- C) SSL v2
- D) HTTP/1.1

**Réponse : A**

**Q5 :** Quelle est la première étape indispensable recommandée par l'ANSSI et le NIST dans une feuille de route de migration PQC d'entreprise ?
- A) Réaliser un inventaire complet des actifs cryptographiques (Crypto Asset Inventory) pour identifier où les algorithmes asymétriques (RSA/ECC) sont utilisés
- B) Racheter de nouveaux serveurs
- C) Désactiver le réseau
- D) Supprimer les certificats

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
