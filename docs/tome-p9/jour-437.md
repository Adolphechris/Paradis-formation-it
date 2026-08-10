# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 437 (6h) : Production Post-Quantum TLS 1.3 & PKI — OpenSSL 3.2 PQC Provider, Certificats Hybrides X.509 (ML-DSA / Dilithium) & Benchmarks de Performance

> [!NOTE]
> **Objectif du jour :** Maîtriser le déploiement opérationnel en production du **TLS 1.3 Post-Quantique** et de la **PKI Hybride PQC** : intégrer les providers PQC dans **OpenSSL 3.2+ (liboqs / OQS Provider)**, émettre des **Certificats Hybrides X.509** combinant clés classiques (RSA/Ed25519) et PQC (**ML-DSA / Dilithium**), mesurer l'impact de la taille des clés et des signatures sur les performances du Handshake TLS, et optimiser le MTU et la fragmentation paquets.
>
> **Compétences visées :** `PQC-PROD-01` (A) — Production Post-Quantum TLS 1.3 Deployment (OpenSSL 3.2 OQS Provider & Hybrid KEM X25519_MLKEM768) | `PQC-PROD-02` (A) — Hybrid X.509 PKI Engineering & TLS Handshake Performance Optimization

---

## 1) Module — Production PQC Architecture & OpenSSL 3.2 OQS (2h)

### 📖 Narration/Intuition

Passer de la théorie de la cryptographie post-quantique à sa mise en production dans des environnements haute performance (ex: banques, e-commerce, datacenters) soulevé des défis d'ingénierie réels : les signatures ML-DSA (3309 octets) et les ciphertexts ML-KEM (1088 octets) sont nettement plus volumineux que leurs équivalents classiques (Ed25519 = 64 octets, X25519 = 32 octets). Le déploiement exige donc une configuration optimale d'**OpenSSL 3.2+** et l'utilisation de **Certificats Hybrides X.509**.

```
  ═══════════════════════════════════════════════════════════════════
    ARCHITECTURE OPENSSL 3.2 OQS PROVIDER (POST-QUANTUM TLS 1.3)
  ═══════════════════════════════════════════════════════════════════

  ┌─────────────────────────────────────────────────────────────────┐
  │ SERVEUR APPLICATION (Nginx / Envoy / Python API)               │
  ├─────────────────────────────────────────────────────────────────┤
  │ OpenSSL 3.2+ Engine                                             │
  │  ├── Default Provider : RSA, ECDSA, AES-GCM, TLS 1.3 Core       │
  │  └── OQS Provider     : ML-KEM-768, ML-DSA-65, Falcon, SPHINCS+  │
  └─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼ (Handshake TLS 1.3 Hybride)
  ┌─────────────────────────────────────────────────────────────────┐
  │ CLIENT COMPATIBLE (Chrome / Edge / OpenSSL Client PQC)          │
  │ Negotiates: KeyShare=x25519_mlkem768 | Cert=ML-DSA-65           │
  └─────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Outillage PQC Performance & PKI Engine (`pqc_production_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import os
import time
import json
import hashlib
from datetime import datetime, timezone
from typing import List, Dict

class PQCProductionEngine:
    """
    Moteur de simulation et de benchmark de performance TLS 1.3 Post-Quantique :
    - Génération de certificats hybrides X.509 (RSA-3072 + ML-DSA-65)
    - Benchmarking de latence et de surcoût de taille du Handshake TLS 1.3
    - Calcul de l'impact de la fragmentation TCP (MTU 1500 octets)
    """

    def __init__(self):
        self.benchmark_results: List[dict] = []

    def generate_hybrid_x509_certificate(self, domain: str) -> dict:
        """
        Simule la structure d'un certificat Hybride X.509 v3.
        Contient la clé publique classique (RSA-3072) + l'extension PQC SubjectAltPublicKey (ML-DSA-65).
        """
        rsa_pubkey = os.urandom(384)   # RSA 3072 bits
        mldsa_pubkey = os.urandom(1952) # ML-DSA-65 public key size

        rsa_sig = os.urandom(384)     # Signature classique RSA
        mldsa_sig = os.urandom(3309)   # Signature PQC ML-DSA-65

        total_cert_size = len(rsa_pubkey) + len(mldsa_pubkey) + len(rsa_sig) + len(mldsa_sig) + 500  # Overhead ASN.1

        cert_info = {
            "domain": domain,
            "classical_algorithm": "RSA-3072",
            "pqc_algorithm": "ML-DSA-65 (FIPS 204)",
            "total_cert_size_bytes": total_cert_size,
            "compatibility": "Hybride (Les anciens clients lisent RSA, les clients PQC lisent ML-DSA)",
            "issued_at": datetime.now(timezone.utc).isoformat()
        }
        print(f"  [HYBRID PKI] Certificat émis pour '{domain}' — Taille totale: {total_cert_size} octets")
        return cert_info

    def benchmark_tls13_handshake_payload(self, mode: str) -> dict:
        """
        Calcule le volume d'octets échangé lors d'un Handshake TLS 1.3 selon le mode.
        - Mode 1: Classique (X25519 + ECDSA)
        - Mode 2: Hybride KEM (X25519 + ML-KEM-768 + Cert ECDSA)
        - Mode 3: 100% PQC (ML-KEM-768 + Cert ML-DSA-65)
        """
        print(f"\n[*] BENCHMARK HANDSHAKE TLS 1.3 — Mode: '{mode}'")
        
        if mode == "CLASSICAL":
            client_hello_keyshare = 32   # X25519
            server_cert_size = 800      # ECDSA P-256
            cert_verify_sig = 64
        elif mode == "HYBRID_KEM":
            client_hello_keyshare = 32 + 1088  # X25519 + ML-KEM-768
            server_cert_size = 800             # ECDSA P-256
            cert_verify_sig = 64
        elif mode == "FULL_PQC":
            client_hello_keyshare = 1088       # ML-KEM-768
            server_cert_size = 5145            # Certificat ML-DSA-65
            cert_verify_sig = 3309             # Signature ML-DSA-65

        total_handshake_bytes = client_hello_keyshare + server_cert_size + cert_verify_sig + 300
        tcp_packets_required = (total_handshake_bytes // 1460) + 1  # Standard TCP MSS = 1460 octets

        result = {
            "mode": mode,
            "client_hello_keyshare_bytes": client_hello_keyshare,
            "cert_and_sig_bytes": server_cert_size + cert_verify_sig,
            "total_handshake_bytes": total_handshake_bytes,
            "tcp_packets_required": tcp_packets_required,
            "latency_impact": "1 extra TCP Round-Trip" if tcp_packets_required > 2 else "Optimal (1-RTT)"
        }
        self.benchmark_results.append(result)
        print(f"  [+] Taille totale du Handshake: {total_handshake_bytes} octets ({tcp_packets_required} paquet(s) TCP)")
        return result

# Démonstration PQC Production Engine
engine = PQCProductionEngine()
print("=== PRODUCTION POST-QUANTUM TLS 1.3 & PKI ENGINE ===")

# 1. Émission Certificat Hybride
engine.generate_hybrid_x509_certificate("api.paradis-bank.com")

# 2. Benchmarks comparatifs des modes TLS 1.3
engine.benchmark_tls13_handshake_payload("CLASSICAL")
engine.benchmark_tls13_handshake_payload("HYBRID_KEM")
engine.benchmark_tls13_handshake_payload("FULL_PQC")
```

---

## 3) Module — Fiche de Configuration OpenSSL 3.2 OQS (2h)

```ini
# CONFIGURATION OPENSSL 3.2 WITH OQS PROVIDER — /etc/ssl/openssl.cnf

openssl_conf = openssl_init

[openssl_init]
providers = provider_sect

[provider_sect]
default = default_sect
oqsprovider = oqsprovider_sect   # Dynamic Provider Post-Quantique

[default_sect]
activate = 1

[oqsprovider_sect]
activate = 1
module = /usr/lib64/ossl-modules/oqsprovider.so

# UTILISATION AVEC OPENSSL S_SERVER (TLS 1.3 PQC)
# openssl s_server -accept 4433 \
#                  -cert /etc/ssl/certs/hybrid_cert.pem \
#                  -key /etc/ssl/private/hybrid_key.pem \
#                  -groups x25519_mlkem768
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OQS Provider** | Open Quantum Safe Provider — Plugin OpenSSL 3.x intégrant les algorithmes PQC normés |
| **MSS** | Maximum Segment Size — Taille maximale du payload utile dans un paquet TCP (typ. 1460 octets) |
| **Certificat Hybride** | Certificat X.509 contenant deux paires de clés (une classique RSA/ECC et une PQC ML-DSA) |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quel est le rôle principal d'un **Certificat Hybride X.509** pendant la période de transition post-quantique ?
- A) Permettre la compatibilité ascendante : les anciens navigateurs ne connaissant que RSA/ECDSA valident la signature classique, tandis que les clients modernes PQC lisent l'extension PQC (ML-DSA) et la valident
- B) Doubler la vitesse du serveur web
- C) Remplacer le protocole DNS
- D) Annuler les frais de certificat

**Réponse : A**

**Q2 :** Pourquoi le passage au mode **100% PQC (ML-KEM + ML-DSA)** peut-il entraîner un Round-Trip TCP supplémentaire lors du Handshake TLS 1.3 ?
- A) Parce que la taille cumulée du certificat ML-DSA (~5145 octets) et de la signature (~3309 octets) dépasse le MSS TCP standard (1460 octets), nécessitant plusieurs paquets TCP fragmentés
- B) Parce que le serveur s'arrête de répondre
- C) Parce que TLS 1.3 est incompatible avec PQC
- D) Parce qu'OpenSSL exige 5 mots de passe

**Réponse : A**

**Q3 :** Quelle est la combinaison de groupes recommandés pour un échange de clés TLS 1.3 hybride en production ?
- A) `x25519_mlkem768` (combinaison de la courbe elliptique X25519 et de ML-KEM-768 FIPS 203)
- B) `rsa1024_md5`
- C) `des_sha1`
- D) `ecdh_p256_only`

**Réponse : A**

**Q4 :** Comment **OpenSSL 3.2+** intègre-t-il les algorithmes Post-Quantiques sans modifier le code cœur de la bibliothèque ?
- A) Via son architecture de **Providers dynamiques** (OQS Provider — `oqsprovider.so`), permettant d'ajouter des modules cryptographiques externes sans recompilation
- B) En modifiant le noyau Linux
- C) En utilisant un script Python externe
- D) En convertissant les clés en texte clair

**Réponse : A**

**Q5 :** Quel est l'impact de la taille du groupe `x25519_mlkem768` dans le message `ClientHello` par rapport à un `ClientHello` X25519 classique ?
- A) Le `ClientHello` passe d'environ 300 octets à environ 1400 octets en raison des 1088 octets du ciphertext/public key ML-KEM-768, restant tout juste sous la limite d'un paquet IP standard
- B) Il diminue la taille du message de 50%
- C) Aucun impact de taille
- D) Le message est envoyé par UDP

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
