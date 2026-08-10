# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 411 (6h) : TLS 1.3 Handshake Interne — Session Tickets (0-RTT), Cipher Suites, Downgrade Attack Prevention & TLS Fingerprinting (JA3/JA3S)

> [!NOTE]
> **Objectif du jour :** Disséquer le mécanisme interne du **protocole TLS 1.3 (RFC 8446)** étape par étape : analyser les différences architecturales fondamentales avec TLS 1.2, comprendre la réduction du nombre de round-trips (1-RTT vs 2-RTT), maîtriser la gestion des **Session Tickets (PSK pour 0-RTT)** et les risques de rejeu, auditer les suites cryptographiques TLS 1.3 obligatoires, détecter les attaques de déclassement de version (**Downgrade Attacks — GREASE & Padding Oracle**), et implémenter la génération de signatures **JA3/JA3S** pour la détection de clients TLS malveillants.
>
> **Compétences visées :** `TLS-ADV-01` (A) — TLS 1.3 Handshake Internals, Session Ticket (0-RTT) & Cipher Suite Engineering | `TLS-ADV-02` (A) — Downgrade Attack Prevention (Sentinel Values, GREASE) & JA3/JA3S TLS Fingerprinting

---

## 1) Module — TLS 1.3 Handshake Anatomy & 0-RTT (2h)

### 📖 Narration/Intuition

TLS 1.3 a été conçu pour corriger les faiblesses structurelles de TLS 1.2 : éliminer les suites cryptographiques dangereuses (RC4, DES, 3DES, export-grade), supprimer la renégociation, et réduire la latence du handshake de 2-RTT à **1-RTT** (voire **0-RTT** avec Session Resumption).

```
  ═══════════════════════════════════════════════════════════════════
     TLS 1.3 FULL HANDSHAKE (1-RTT) vs TLS 1.2 (2-RTT)
  ═══════════════════════════════════════════════════════════════════

  CLIENT                          SERVER (TLS 1.3 — 1-RTT)
  ──────                          ────────────────────────
     │──── ClientHello ──────────────────────────────────►│
     │     (Supported: TLS_AES_256_GCM_SHA384)            │
     │     (KeyShare: ECDHE x25519, secp256r1)            │
     │     (SupportedVersions: 0x0304 = TLS 1.3)          │
     │                                                    │
     │◄─── ServerHello ──────────────────────────────────│
     │     (Selected: TLS_AES_256_GCM_SHA384)             │
     │     (KeyShare: ECDHE Server Public Key)            │
     │                                                    │
     │◄─── EncryptedExtensions ──────────────────────────│
     │◄─── Certificate + CertificateVerify ──────────────│
     │◄─── Finished (HMAC sur tout le Handshake) ────────│
     │                                                    │
     │──── Finished ─────────────────────────────────────►│
     │                                                    │
     │◄══► APPLICATION DATA (Chiffré) ◄══════════════════►│

  ─────────────────────────────────────────────────────────────────
  0-RTT RESUMPTION (Session Ticket PSK) :
  CLIENT envoie les données applicatives dès le premier paquet !
  ─────────────────────────────────────────────────────────────────
```

#### Suites Cryptographiques TLS 1.3 (Seules 5 autorisées, Forward Secret obligatoire)

| Suite TLS 1.3 | AEAD | HKDF PRF | Utilisation |
|:---:|:---:|:---:|:---|
| `TLS_AES_256_GCM_SHA384` | AES-256-GCM | SHA-384 | Standard recommandé |
| `TLS_CHACHA20_POLY1305_SHA256` | ChaCha20-Poly1305 | SHA-256 | Mobile / IoT sans AES-NI |
| `TLS_AES_128_GCM_SHA256` | AES-128-GCM | SHA-256 | Performance optimisée |

---

## 2) Module — Outillage TLS Analysis Engine (`tls_analysis_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import hashlib
import json
import socket
import ssl
from datetime import datetime, timezone
from typing import List, Dict, Optional

class TLSAnalysisEngine:
    """
    Moteur d'analyse des sessions TLS : génération d'empreintes JA3/JA3S,
    détection des anomalies de handshake et audit des suites cryptographiques.
    """

    # Suites cryptographiques TLS 1.3 approuvées (RFC 8446)
    TLS13_APPROVED_CIPHERS = {
        0x1301: "TLS_AES_128_GCM_SHA256",
        0x1302: "TLS_AES_256_GCM_SHA384",
        0x1303: "TLS_CHACHA20_POLY1305_SHA256",
    }

    # Suites dépréciées dangeureuses (à détecter et bloquer)
    DEPRECATED_CIPHERS = {
        0x0005: "TLS_RSA_WITH_RC4_128_SHA",
        0x000A: "TLS_RSA_WITH_3DES_EDE_CBC_SHA",
        0x002F: "TLS_RSA_WITH_AES_128_CBC_SHA",   # Sans PFS
        0x0035: "TLS_RSA_WITH_AES_256_CBC_SHA",   # Sans PFS
    }

    def __init__(self):
        self.sessions_analyzed: List[dict] = []

    def compute_ja3_fingerprint(self, tls_version: int, cipher_suites: List[int],
                                 extensions: List[int], elliptic_curves: List[int],
                                 elliptic_curve_point_formats: List[int]) -> str:
        """
        Calcule l'empreinte JA3 d'un ClientHello TLS.
        JA3 = MD5(SSLVersion,Ciphers,Extensions,EllipticCurves,EllipticCurvePointFormats)
        """
        # Filtrage des GREASE values (RFC 8701) — 0xAAAA pattern
        def filter_grease(values: List[int]) -> List[int]:
            return [v for v in values if (v & 0x0F0F) != 0x0A0A]

        ciphers_str = "-".join(str(c) for c in filter_grease(cipher_suites))
        exts_str = "-".join(str(e) for e in filter_grease(extensions))
        curves_str = "-".join(str(c) for c in filter_grease(elliptic_curves))
        formats_str = "-".join(str(f) for f in elliptic_curve_point_formats)

        ja3_raw = f"{tls_version},{ciphers_str},{exts_str},{curves_str},{formats_str}"
        ja3_hash = hashlib.md5(ja3_raw.encode()).hexdigest()

        return ja3_hash

    def audit_cipher_suite(self, cipher_id: int) -> dict:
        """Audite une suite cryptographique TLS et émet une recommandation de sécurité."""
        if cipher_id in self.TLS13_APPROVED_CIPHERS:
            return {
                "cipher_id": hex(cipher_id),
                "cipher_name": self.TLS13_APPROVED_CIPHERS[cipher_id],
                "status": "APPROVED_TLS13",
                "forward_secrecy": True,
                "recommendation": "Conserver — Suite TLS 1.3 avec Perfect Forward Secrecy."
            }
        elif cipher_id in self.DEPRECATED_CIPHERS:
            return {
                "cipher_id": hex(cipher_id),
                "cipher_name": self.DEPRECATED_CIPHERS[cipher_id],
                "status": "DEPRECATED_DANGEROUS",
                "forward_secrecy": False,
                "recommendation": "SUPPRIMER IMMÉDIATEMENT — Vulnérable aux attaques passives de déchiffrement."
            }
        else:
            return {
                "cipher_id": hex(cipher_id),
                "cipher_name": "UNKNOWN",
                "status": "UNKNOWN",
                "recommendation": "Vérifier manuellement."
            }

    def detect_downgrade_attack(self, client_max_version: int, server_selected_version: int,
                                 server_random_last8: bytes) -> dict:
        """
        Détecte une attaque de déclassement de version TLS (Downgrade Attack).
        TLS 1.3 RFC 8446 §4.1.3 : Le serveur doit inclure une valeur Sentinel dans
        les 8 derniers octets du Server Random si TLS < 1.3 est sélectionné alors
        que le client supporte TLS 1.3.
        """
        # Valeur Sentinel TLS 1.3 DownGrade Protection
        TLS12_SENTINEL = bytes.fromhex("444F574E47524401")  # "DOWNGRD\x01"
        TLS11_SENTINEL = bytes.fromhex("444F574E47524400")  # "DOWNGRD\x00"

        is_downgrade_attempted = (
            client_max_version >= 0x0304 and  # Client supporte TLS 1.3
            server_selected_version < 0x0304   # Serveur retourne TLS 1.2 ou moins
        )

        sentinel_detected = server_random_last8 in [TLS12_SENTINEL, TLS11_SENTINEL]

        result = {
            "client_max_version": hex(client_max_version),
            "server_selected_version": hex(server_selected_version),
            "downgrade_attempt_detected": is_downgrade_attempted,
            "sentinel_value_present": sentinel_detected,
            "status": "DOWNGRADE_ATTACK_BLOCKED" if (is_downgrade_attempted and sentinel_detected) else "CLEAN"
        }

        if is_downgrade_attempted:
            print(f"  [!] DOWNGRADE ATTEMPT DETECTED: Client={hex(client_max_version)} → Server={hex(server_selected_version)}")
            if sentinel_detected:
                print(f"  [+] Protection active: Sentinel RFC 8446 §4.1.3 détectée → Connexion refusée par le client TLS 1.3")
        else:
            print(f"  [+] Version négociée: TLS 1.3 ({hex(server_selected_version)}) — Aucune attaque de déclassement")
        return result

# Démonstration TLS Analysis Engine
engine = TLSAnalysisEngine()
print("=== TLS 1.3 ANALYSIS ENGINE DEMO ===")

# 1. JA3 Fingerprint (ClientHello d'un navigateur Chrome simulé)
ja3 = engine.compute_ja3_fingerprint(
    tls_version=771,  # 0x0303 = TLS 1.2 (Legacy pour compatibilité)
    cipher_suites=[0x1301, 0x1302, 0x1303, 0xC02B, 0xC02F, 0xC02C, 0xC030],
    extensions=[0, 23, 65281, 10, 11, 35, 16, 5, 18, 51, 45, 43, 13, 21],
    elliptic_curves=[29, 23, 24],  # x25519, secp256r1, secp384r1
    elliptic_curve_point_formats=[0]
)
print(f"  [JA3] Empreinte ClientHello Chrome: {ja3}")

# 2. Audit des suites cryptographiques
for cipher in [0x1302, 0x0005, 0x002F]:
    result = engine.audit_cipher_suite(cipher)
    print(f"  [CIPHER AUDIT] {result['cipher_id']}: {result['status']} — {result['recommendation'][:60]}...")

# 3. Détection Downgrade Attack
engine.detect_downgrade_attack(
    client_max_version=0x0304,    # TLS 1.3 supporté
    server_selected_version=0x0303,  # TLS 1.2 retourné (attaque!)
    server_random_last8=bytes.fromhex("444F574E47524401")  # Sentinel présent
)
```

---

## 3) Module — Fiche Technique 0-RTT & Risques de Rejeu (2h)

```markdown
# TLS 1.3 SESSION TICKETS & RISQUES 0-RTT (RFC 8446 §2.3)

## 1. Mécanisme 0-RTT (Zero Round-Trip Time Resumption)
Le serveur émet un **Session Ticket** (PSK — Pre-Shared Key chiffré) lors d'une connexion complète.
Lors de la reconnexion, le client peut envoyer les données applicatives dès le premier paquet
**sans attendre le Finished du serveur** → Latence réduite d'un RTT complet.

## 2. Risque de Rejeu (Replay Attack sur les données 0-RTT)
Les données 0-RTT **ne disposent pas de protection contre le rejeu** (absence de nonce fresh).
Un attaquant ayant capturé le paquet 0-RTT peut le renvoyer et déclencher deux fois
la même opération (ex: deux virements bancaires, deux commandes e-commerce).

## 3. Contre-Mesures Obligatoires
- **Serveur : Anti-Replay Token Store** — Conserver un cache des PSK récemment utilisés
  pour rejeter les tentatives de rejeu dans la fenêtre de validité du ticket.
- **Application : Opérations Idempotentes** — Les endpoints acceptant des données 0-RTT
  **ne doivent jamais déclencher d'opérations non-idempotentes** (paiements, suppressions).
- **Limiter la fenêtre de validité du ticket** à quelques minutes maximum.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **0-RTT** | Zero Round-Trip Time — Mode TLS 1.3 permettant d'envoyer des données applicatives dès le premier paquet de connexion |
| **PSK** | Pre-Shared Key — Clé pré-partagée dérivée d'une session TLS précédente pour la reprise de session |
| **JA3 / JA3S** | Méthode de fingerprinting TLS basée sur le MD5 des paramètres du ClientHello / ServerHello |
| **GREASE** | Generate Random Extensions And Sustain Extensibility — Mécanisme RFC 8701 prévenant les erreurs de compatibilité TLS |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle est la différence en termes de latence entre un handshake TLS 1.2 standard et un handshake TLS 1.3 complet ?
- A) TLS 1.3 ne nécessite qu'un seul Round-Trip (1-RTT) contre deux pour TLS 1.2, grâce au fait que le KeyShare ECDHE est inclus dès le ClientHello
- B) TLS 1.3 est plus lent que TLS 1.2
- C) TLS 1.3 nécessite 4 Round-Trips
- D) Il n'y a aucune différence de latence

**Réponse : A**

**Q2 :** Pourquoi les données applicatives transmises en mode **0-RTT TLS 1.3** ne doivent-elles jamais déclencher des opérations non-idempotentes (ex: un virement bancaire) ?
- A) Parce que les données 0-RTT ne sont pas protégées contre les attaques de rejeu (Replay Attack) — un attaquant ayant capturé le premier paquet peut le renvoyer et déclencher deux fois la même opération
- B) Parce que 0-RTT utilise un chiffrement trop faible
- C) Parce que 0-RTT désactive la vérification du certificat serveur
- D) Parce que 0-RTT est interdit par le RGPD

**Réponse : A**

**Q3 :** Qu'est-ce que l'empreinte **JA3** et quelle est son utilité pour un SOC ?
- A) Un hash MD5 des paramètres du ClientHello TLS (version, suites de chiffrement, extensions, courbes elliptiques) permettant d'identifier et de détecter des clients malveillants (malwares, outils d'attaque) par leur signature TLS unique
- B) Une clé cryptographique de 128 bits
- C) Un type de certificat X.509 v3
- D) Un protocole de routage réseau

**Réponse : A**

**Q4 :** Quel mécanisme de protection RFC 8446 §4.1.3 empêche un attaquant de forcer un client TLS 1.3 à accepter une connexion TLS 1.2 rétrogradée (Downgrade Attack) ?
- A) La valeur Sentinel (DOWNGRD\x01) insérée dans les 8 derniers octets du Server Random par le serveur, que le client TLS 1.3 détecte et utilise pour avorter la connexion dégradée
- B) La vérification du numéro de série du certificat
- C) La longueur du champ SNI (Server Name Indication)
- D) L'entropie du nombre aléatoire client

**Réponse : A**

**Q5 :** Combien de suites de chiffrement sont définies dans la norme **TLS 1.3 (RFC 8446)** et quelle propriété cryptographique partagent-elles toutes ?
- A) Seulement 5 suites, toutes de type AEAD (Authenticated Encryption with Associated Data) et garantissant toutes la Perfect Forward Secrecy via ECDHE
- B) Plus de 100 suites, dont certaines sans authentification
- C) 3 suites, dont une basée sur RSA sans échange de clé
- D) 8 suites, dont certaines en mode ECB

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
