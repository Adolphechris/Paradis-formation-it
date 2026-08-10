# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 413 (6h) : IPsec IKEv2 & WireGuard Architecture — VPN Entreprise Multi-Sites, Perfect Forward Secrecy & Road Warrior Secure Access

> [!NOTE]
> **Objectif du jour :** Maîtriser les deux paradigmes dominants du **VPN cryptographique d'entreprise** : analyser l'architecture **IPsec avec IKEv2 (RFC 7296)** — protocoles AH/ESP, SPD/SAD, modes Tunnel vs Transport, négociation IKE_SA et CHILD_SA, Perfect Forward Secrecy par ECDHE — et déployer **WireGuard** comme alternative cryptographiquement moderne (Noise Protocol Framework, ChaCha20-Poly1305 fixe) pour les accès **Road Warrior** et la segmentation réseau zero-trust.
>
> **Compétences visées :** `VPN-ADV-01` (A) — IPsec IKEv2 Architecture (AH/ESP, SPD/SAD, IKE_AUTH) & Perfect Forward Secrecy | `VPN-ADV-02` (A) — WireGuard Cryptography (Noise IK Handshake, ChaCha20-Poly1305 & Road Warrior Deployment)

---

## 1) Module — IPsec IKEv2 vs WireGuard Architecture (2h)

### 📖 Narration/Intuition

IPsec IKEv2 est le standard d'entreprise pour les VPN site-à-site (entre datacenters) et les accès distants sécurisés. WireGuard est la révolution cryptographique moderne — 4000 lignes de code vs 400 000 pour OpenVPN, une crypto-agility intentionnellement absente pour garantir une surface d'attaque minimale.

```
  ═══════════════════════════════════════════════════════════
    IPSEC IKEV2 — NÉGOCIATION DES SECURITY ASSOCIATIONS
  ═══════════════════════════════════════════════════════════

  INITIATOR (Gateway A)              RESPONDER (Gateway B)
  ─────────────────────              ─────────────────────
       │                                      │
       │──── IKE_SA_INIT ────────────────────►│
       │     (SAi1: AES-256-CBC/SHA256/DH14)  │
       │     (Nonce Ni, KEi: DH Public Key)   │
       │                                      │
       │◄─── IKE_SA_INIT ────────────────────│
       │     (SAr1: Suite sélectionnée)        │
       │     (Nonce Nr, KEr: DH Public Key)   │
       │                                      │
       │══[IKE SA Établi: SKEYSEED dérivé]═══│
       │                                      │
       │──── IKE_AUTH (Chiffré) ─────────────►│
       │     (IDi, Auth: RSA-Sig / EAP)        │
       │     (SAi2: ESP AES-256-GCM/SHA384)    │
       │     (TSi, TSr: Traffic Selectors)     │
       │                                      │
       │◄─── IKE_AUTH (Chiffré) ─────────────│
       │     (IDr, Auth: RSA-Sig Vérifié)      │
       │     (CHILD SA: ESP SPI_in/SPI_out)   │
       │                                      │
       │◄══► TRAFIC IPSEC/ESP CHIFFRÉ ◄══════►│


  ═══════════════════════════════════════════════════════════
    WIREGUARD — NOISE PROTOCOL FRAMEWORK IK HANDSHAKE
  ═══════════════════════════════════════════════════════════

  INITIATOR                           RESPONDER
  ─────────                           ─────────
  │──── Handshake Init ───────────────►│
  │     (ephem_pub_i, static_pub_i)    │ (Chiffré avec clé publique du responder)
  │                                    │
  │◄─── Handshake Response ───────────│
  │     (ephem_pub_r, EMPTY)           │ (Chiffré avec les deux clés ephémères)
  │                                    │
  │◄══► DATA PACKETS (ChaCha20-Poly1305) ◄══════►│
```

#### Comparatif Cryptographique IPsec IKEv2 vs WireGuard

| Critère | IPsec IKEv2 | WireGuard |
|:---|:---:|:---:|
| **Protocole Handshake** | IKEv2 (complexe, négociable) | Noise Protocol IK (fixe, simple) |
| **Algorithme de chiffrement** | Négocié (AES-256-GCM recommandé) | ChaCha20-Poly1305 (non-négociable) |
| **Échange de clés** | DH Group 20 (ECDHE P-384) | Curve25519 ECDHE |
| **Taille du code** | ~400 000 lignes | ~4 000 lignes |
| **Perfect Forward Secrecy** | Via ECDHE CHILD_SA Rekey | Via Curve25519 ECDHE |
| **Config Admin** | Complexe (IKE SA + CHILD SA) | Simple (4 paramètres) |

---

## 2) Module — Outillage IPsec/WireGuard Audit Engine (`vpn_crypto_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import os
import json
import hashlib
import ipaddress
from datetime import datetime, timezone, timedelta
from typing import List, Dict

class VPNCryptoAuditEngine:
    """
    Moteur d'audit des configurations VPN IPsec IKEv2 et WireGuard.
    Vérifie la conformité cryptographique et génère des rapports de sécurité.
    """

    # Algorithmes IPsec approuvés (NIST SP 800-77 Rev 1)
    IPSEC_APPROVED = {
        "encryption": ["aes256gcm128", "aes256gcm96", "aes128gcm128"],
        "integrity": ["sha384", "sha256", "sha512"],
        "prf": ["prfsha384", "prfsha256", "prfsha512"],
        "dh_groups": ["ecp384", "ecp521", "modp3072", "curve25519"]
    }

    IPSEC_DEPRECATED = {
        "encryption": ["3des", "des", "aes128cbc", "aes256cbc", "rc4"],
        "integrity": ["md5", "sha1"],
        "dh_groups": ["modp768", "modp1024", "modp1536"]
    }

    def __init__(self):
        self.vpn_peers: List[dict] = []
        self.audit_findings: List[dict] = []

    def audit_ipsec_ikev2_config(self, peer_id: str, config: dict) -> dict:
        """
        Audite une configuration IPsec IKEv2 (strongSwan / Libreswan).
        Vérifie les algorithmes, la durée de vie des SAs et la PFS.
        """
        print(f"\n[*] Audit IPsec IKEv2 — Peer: {peer_id}")
        findings = []

        # Vérification du chiffrement
        ike_enc = config.get("ike_encryption", "").lower()
        if ike_enc in self.IPSEC_DEPRECATED["encryption"]:
            findings.append({
                "severity": "CRITICAL", "directive": "ike_encryption",
                "issue": f"Algorithme déprécié détecté: '{ike_enc}' — Vulnérable aux attaques passives",
                "remediation": f"Remplacer par: {self.IPSEC_APPROVED['encryption'][0]}"
            })
            print(f"  [!] CRITICAL: ike_encryption='{ike_enc}' — Algorithme déprécié!")
        else:
            print(f"  [+] ike_encryption='{ike_enc}' — Conforme NIST SP 800-77")

        # Vérification DH Group (PFS)
        dh_group = config.get("dh_group", "").lower()
        if dh_group in self.IPSEC_DEPRECATED["dh_groups"]:
            findings.append({
                "severity": "CRITICAL", "directive": "dh_group",
                "issue": f"DH Group déprécié: '{dh_group}' — Vulnérable (Logjam Attack)",
                "remediation": "Utiliser ecp384 ou ecp521 (RFC 8247)"
            })
            print(f"  [!] CRITICAL: dh_group='{dh_group}' — Vulnérable Logjam!")
        else:
            print(f"  [+] dh_group='{dh_group}' — Perfect Forward Secrecy assuré")

        # Vérification durée de vie SA
        ike_lifetime = config.get("ike_lifetime_hours", 24)
        if ike_lifetime > 24:
            findings.append({
                "severity": "MEDIUM", "directive": "ike_lifetime",
                "issue": f"IKE SA lifetime trop élevé: {ike_lifetime}h — Augmente la fenêtre de compromission",
                "remediation": "Recommandé: ≤ 24h"
            })

        result = {
            "peer_id": peer_id,
            "total_findings": len(findings),
            "findings": findings,
            "pfs_enabled": dh_group not in self.IPSEC_DEPRECATED["dh_groups"]
        }
        self.audit_findings.append(result)
        return result

    def simulate_wireguard_key_generation(self, interface_name: str) -> dict:
        """
        Simule la génération d'une paire de clés WireGuard (Curve25519).
        En production: wg genkey | tee privatekey | wg pubkey > publickey
        """
        private_key_bytes = os.urandom(32)
        # Clamping Curve25519 (simulation)
        private_key_bytes = bytearray(private_key_bytes)
        private_key_bytes[0] &= 248
        private_key_bytes[31] &= 127
        private_key_bytes[31] |= 64
        private_key_bytes = bytes(private_key_bytes)

        private_key_b64 = __import__('base64').b64encode(private_key_bytes).decode()
        public_key_b64 = __import__('base64').b64encode(
            hashlib.sha256(private_key_bytes + b"curve25519_pubkey_derivation").digest()[:32]
        ).decode()

        wg_config = {
            "interface": interface_name,
            "algorithm": "Curve25519-ECDHE",
            "cipher": "ChaCha20-Poly1305",
            "hash": "BLAKE2s (Noise Protocol)",
            "private_key": private_key_b64[:20] + "...[REDACTED]",
            "public_key": public_key_b64,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        print(f"  [WireGuard] Interface '{interface_name}' — Clé Curve25519 générée")
        print(f"  [WireGuard] PublicKey: {public_key_b64[:20]}...")
        return wg_config

    def generate_vpn_security_report(self) -> dict:
        """Génère le rapport de sécurité consolidé des audits VPN."""
        critical_count = sum(
            len([f for f in peer["findings"] if f["severity"] == "CRITICAL"])
            for peer in self.audit_findings
        )
        return {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "peers_audited": len(self.audit_findings),
            "critical_findings": critical_count,
            "audit_results": self.audit_findings,
            "compliance": ["NIST SP 800-77 Rev 1", "RFC 8247 (IKEv2 Cryptography)"]
        }

# Démonstration VPN Crypto Audit Engine
engine = VPNCryptoAuditEngine()
print("=== VPN CRYPTO AUDIT ENGINE (IPsec IKEv2 + WireGuard) ===")

# 1. Audit IPsec IKEv2 — Configuration non-conforme
engine.audit_ipsec_ikev2_config("VPN-SITE-DAKAR-01", {
    "ike_encryption": "3des",
    "ike_integrity": "sha1",
    "dh_group": "modp1024",
    "ike_lifetime_hours": 48
})

# 2. Audit IPsec IKEv2 — Configuration conforme
engine.audit_ipsec_ikev2_config("VPN-SITE-PARIS-02", {
    "ike_encryption": "aes256gcm128",
    "ike_integrity": "sha384",
    "dh_group": "ecp384",
    "ike_lifetime_hours": 8
})

# 3. WireGuard Key Generation
engine.simulate_wireguard_key_generation("wg0-paradis-vpn")

report = engine.generate_vpn_security_report()
print(f"\n[REPORT] Peers audités: {report['peers_audited']} | Findings Critiques: {report['critical_findings']}")
```

---

## 3) Module — Fiche WireGuard Road Warrior (2h)

```ini
# CONFIGURATION WIREGUARD — SERVEUR VPN ROAD WARRIOR

[Interface]
Address    = 10.100.0.1/24          # Adresse VPN du serveur
PrivateKey = <SERVER_PRIVATE_KEY>   # Jamais partagé
ListenPort = 51820

# Règles de routage post-connexion (iptables/nftables)
PostUp   = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

# Peer 1 — Laptop Développeur
[Peer]
PublicKey  = <DEVELOPER_PUBLIC_KEY>
AllowedIPs = 10.100.0.2/32          # Seule cette IP autorisée pour ce peer
PersistentKeepalive = 25

# CLIENT CONFIGURATION
[Interface]
Address    = 10.100.0.2/24
PrivateKey = <CLIENT_PRIVATE_KEY>
DNS        = 10.100.0.1              # DNS interne via tunnel

[Peer]
PublicKey  = <SERVER_PUBLIC_KEY>
Endpoint   = vpn.paradis-bank.com:51820
AllowedIPs = 0.0.0.0/0              # Split tunnel: 0.0.0.0/0 = tout passe par VPN
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **IKEv2** | Internet Key Exchange version 2 — Protocole de négociation des Security Associations IPsec |
| **ESP** | Encapsulating Security Payload — Protocole IPsec assurant confidentialité, intégrité et anti-rejeu |
| **AH** | Authentication Header — Protocole IPsec assurant intégrité sans confidentialité (peu utilisé) |
| **SPD/SAD** | Security Policy Database / Security Association Database — Tables du moteur IPsec |
| **Noise IK** | Handshake du Noise Protocol Framework utilisé par WireGuard : Initiator → Responder (une seule passe) |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Dans IPsec IKEv2, quelle est la différence entre l'**IKE_SA** et le **CHILD_SA** ?
- A) L'IKE_SA est le canal de contrôle sécurisé servant à négocier et re-kéyer les CHILD_SAs, tandis que le CHILD_SA (ESP) est le tunnel chiffrant le trafic utilisateur réel
- B) L'IKE_SA chiffre le trafic HTTP et le CHILD_SA chiffre le trafic DNS
- C) Ce sont deux noms pour le même objet
- D) L'IKE_SA est plus sécurisé car il utilise AES-512

**Réponse : A**

**Q2 :** Pourquoi WireGuard n'offre-t-il **aucune négociation de suite cryptographique** contrairement à IPsec/IKEv2 ?
- A) C'est un choix délibéré pour éliminer les attaques de déclassement cryptographique (Downgrade Attacks) — la suite unique ChaCha20-Poly1305 + Curve25519 + BLAKE2s est codée en dur, réduisant la surface d'attaque
- B) C'est une limitation de la version 1.0 de WireGuard
- C) Pour des raisons de brevets logiciels
- D) Parce que WireGuard n'est pas open-source

**Réponse : A**

**Q3 :** Quel DH Group IPsec est actuellement considéré comme vulnérable à l'attaque **Logjam** et doit être impérativement remplacé ?
- A) `modp1024` (DH Group 2) — Sa taille de module de 1024 bits permet une attaque de précomputation viable par un acteur étatique
- B) `ecp384` (DH Group 20)
- C) `curve25519`
- D) `modp3072` (DH Group 15)

**Réponse : A**

**Q4 :** Dans la configuration WireGuard, que signifie `AllowedIPs = 0.0.0.0/0` côté client ?
- A) Tout le trafic du client (y compris Internet) est routé via le tunnel WireGuard — c'est le mode **Full Tunnel** par opposition au Split Tunnel
- B) Que le client a accès à tous les serveurs de l'entreprise
- C) Que le client peut configurer lui-même ses règles de routage
- D) Que le tunnel WireGuard accepte toutes les connexions entrantes

**Réponse : A**

**Q5 :** Pourquoi le **Perfect Forward Secrecy (PFS)** est-il crucial dans une configuration IPsec IKEv2 ?
- A) Parce qu'il garantit que la compromission de la clé privée long-terme du serveur ne permet pas de déchiffrer les sessions passées, grâce au renouvellement périodique des clés de session via ECDHE
- B) Parce qu'il accélère les connexions VPN
- C) Parce qu'il remplace l'authentification par certificat
- D) Parce qu'il est obligatoire par la RFC WireGuard

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
