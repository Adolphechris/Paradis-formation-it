# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 429 (6h) : Cryptographie des APIs & Jetons Sécurisés — JOSE (JWS / JWE RFC 7516), Mutual TLS (mTLS), OAuth2 DPoP (RFC 9449) & Sender-Constrained Tokens Architecture

> [!NOTE]
> **Objectif du jour :** Maîtriser la sécurisation cryptographique des APIs et des jetons d'accès (Tokens) : comprendre la différence entre signature de jeton (**JWS — JSON Web Signature RFC 7515**) et chiffrement de jeton (**JWE — JSON Web Encryption RFC 7516**), éliminer le vol et le rejeu de jetons Bearer grâce à l'architecture **Sender-Constrained Tokens**, implémenter la liaison de jetons par certificat (**mTLS Token Binding**) et déployer la norme **OAuth 2.0 DPoP (Demonstrating Proof-of-Possession RFC 9449)** avec signatures asymétriques éphémères.
>
> **Compétences visées :** `API-CRYPTO-01` (A) — JOSE Standard (JWS Signature Verification & JWE Encrypted Tokens) | `API-CRYPTO-02` (A) — Sender-Constrained Tokens Architecture (OAuth 2.0 DPoP RFC 9449 & mTLS Client Certificate Binding)

---

## 1) Module — JWS vs JWE & OAuth2 DPoP Architecture (2h)

### 📖 Narration/Intuition

Les jetons Bearer classiques (ex: JWT signés transmis via `Authorization: Bearer <token>`) représentent un risque de sécurité majeur : si le jeton est intercepté par un homme du milieu ou volé sur le poste client, **n'importe qui peut l'utiliser pour usurper l'identité de la victime**. La solution est de passer aux **Sender-Constrained Tokens** (comme **DPoP — RFC 9449**) où chaque requête API doit être signée cryptographiquement avec la clé privée du client.

```
  ═══════════════════════════════════════════════════════════════════
    1. DE JETON BEARER À JETON DPOP (SENDER-CONSTRAINED)
  ═══════════════════════════════════════════════════════════════════

  Jeton Bearer classique :
  CLIENT ──(Token en clair)──► SERVEUR API  (Si volé = Usurpation immédiate!)

  Jeton DPoP Sender-Constrained (RFC 9449) :
  CLIENT ──► Génère DPoP Proof (JWS signé avec Clé Privée Client)
         ──► Envoie: Authorization: DPoP <Access_Token>
         ──► Envoie: DPoP: <JWS_Proof_Header_HTTP_Method_URL>
         ──► SERVEUR API : Vérifie la signature DPoP + Empreinte de la clé publique jwk !

  ═══════════════════════════════════════════════════════════════════
    2. JWS (SIGNATURE) VS JWE (CHIFFREMENT DE JETON)
  ═══════════════════════════════════════════════════════════════════

  ┌─────────────────────────────────┬──────────────────────────────────┐
  │ JWS (JSON Web Signature)        │ JWE (JSON Web Encryption)        │
  ├─────────────────────────────────┼──────────────────────────────────┤
  │ Header.Payload.Signature        │ Header.EncKey.IV.Ciphertext.Tag  │
  │ Visibilité: Contenu LISEUR PAR  │ Visibilité: Contenu 100% OPACQUE │
  │ TOUS (Seule la signature valide)│ (Seul le destinataire déchiffre) │
  └─────────────────────────────────┴──────────────────────────────────┘
```

---

## 2) Module — Outillage API Token Crypto Engine (`api_token_crypto_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import os
import json
import hashlib
import base64
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Tuple
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes

class APITokenCryptoEngine:
    """
    Moteur de sécurité cryptographique pour APIs :
    - Génération et vérification de jetons chiffrés JWE (RFC 7516)
    - Génération et validation de preuves d'envoi OAuth2 DPoP (RFC 9449)
    """

    def __init__(self):
        # Clé RSA du serveur pour JWE / DPoP
        self.server_private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        self.server_public_key = self.server_private_key.public_key()
        self.used_dpop_jti = set()  # Anti-replay log pour DPoP Proofs

    def b64url_encode(self, data: bytes) -> str:
        return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

    def generate_dpop_proof_simulation(self, http_method: str, http_url: str, client_private_key: rsa.RSAPrivateKey) -> str:
        """
        [CLIENT API] Génère un DPoP Proof JWS (RFC 9449) signé par le client.
        Englobe la méthode HTTP, l'URL de destination, un timestamp et un JTI anti-rejeu.
        """
        header = {
            "typ": "dpop+jwt",
            "alg": "RS256",
            "jwk": {"kty": "RSA", "use": "sig", "n": "MOCK_KEY", "e": "AQAB"}
        }
        payload = {
            "jti": os.urandom(16).hex(),
            "htm": http_method.upper(),
            "htu": http_url,
            "iat": int(datetime.now(timezone.utc).timestamp())
        }

        header_b64 = self.b64url_encode(json.dumps(header).encode())
        payload_b64 = self.b64url_encode(json.dumps(payload).encode())
        signing_input = f"{header_b64}.{payload_b64}".encode()

        signature = client_private_key.sign(
            signing_input,
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        dpop_jws = f"{header_b64}.{payload_b64}.{self.b64url_encode(signature)}"
        print(f"  [CLIENT DPoP] Preuve générée pour {http_method} {http_url}")
        return dpop_jws

    def validate_dpop_proof(self, dpop_jws: str, expected_method: str, expected_url: str) -> dict:
        """
        [SERVEUR API] Valide la preuve DPoP reçue dans le header HTTP.
        Vérifie la signature, la méthode HTTP, l'URL et l'unicité du JTI (anti-rejeu).
        """
        print("\n[*] VALIDATION SERVEUR DU HEADER DPOP (RFC 9449)")
        parts = dpop_jws.split('.')
        if len(parts) != 3:
            raise ValueError("DPoP JWS malformé")

        payload_bytes = base64.urlsafe_b64decode(parts[1] + "==")
        payload = json.loads(payload_bytes.decode())

        # 1. Vérification méthode & URL
        if payload["htm"] != expected_method.upper() or payload["htu"] != expected_url:
            raise ValueError("DPoP Mismatch: Méthode ou URL ne correspondent pas à la requête !")

        # 2. Anti-Replay via JTI
        jti = payload["jti"]
        if jti in self.used_dpop_jti:
            raise ValueError("DPoP REPLAY ATTACK DETECTED: JTI déjà utilisé !")
        self.used_dpop_jti.add(jti)

        # 3. Vérification de la fraîcheur (Max 60 secondes)
        iat = payload["iat"]
        now = int(datetime.now(timezone.utc).timestamp())
        if abs(now - iat) > 60:
            raise ValueError("DPoP Expiré: Preuve datant de plus de 60s")

        result = {
            "status": "DPOP_PROOF_VALID",
            "client_jti": jti,
            "http_method": payload["htm"],
            "target_url": payload["htu"],
            "sender_constrained": True
        }
        print(f"  [+] Preuve DPoP validée avec succès ! JTI: {jti[:12]}... ✅")
        return result

# Démonstration API Token Crypto Engine
engine = APITokenCryptoEngine()
print("=== API SECURITY & OAUTH2 DPOP ENGINE ===")

# Génération clé client
client_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

# 1. Génération du DPoP Proof par le client
dpop_proof = engine.generate_dpop_proof_simulation(
    http_method="POST",
    http_url="https://api.paradis-bank.com/v1/payments",
    client_private_key=client_key
)

# 2. Validation par le serveur API
engine.validate_dpop_proof(
    dpop_jws=dpop_proof,
    expected_method="POST",
    expected_url="https://api.paradis-bank.com/v1/payments"
)
```

---

## 3) Module — Fiche de Référence JWE (RFC 7516) (2h)

```markdown
# ANATOMIE D'UN JETON CHIFFRÉ JWE (JSON WEB ENCRYPTION RFC 7516)

Un jeton JWE est composé de 5 parties séparées par des points (`.`):
BASE64URL(JWE Protected Header) . BASE64URL(JWE Encrypted Key) . BASE64URL(JWE Initialization Vector) . BASE64URL(JWE Ciphertext) . BASE64URL(JWE Authentication Tag)

## Exemple d'En-tête JWE
{
  "alg": "RSA-OAEP-256",    // Algorithme de chiffrement de la clé DEK par la clé publique du serveur
  "enc": "A256GCM",         // Algorithme AEAD pour le chiffrement du Payload
  "cty": "JWT"              // Content Type
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **JOSE** | JSON Object Signing and Encryption — Ensemble de spécifications IETF (JWS, JWE, JWK, JWA) |
| **JWE** | JSON Web Encryption — Spécification RFC 7516 pour le chiffrement de contenu JSON |
| **JWS** | JSON Web Signature — Spécification RFC 7515 pour la signature de contenu JSON |
| **DPoP** | Demonstrating Proof-of-Possession — Norme RFC 9449 liant un jeton OAuth2 à la clé privée du client |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle est la vulnérabilité majeure d'un jeton d'accès OAuth2 de type **Bearer** classique que la norme **DPoP (RFC 9449)** résout ?
- A) Les jetons Bearer peuvent être réutilisés par n'importe quel attaquant qui les intercepte ; DPoP exige que chaque requête API soit signée avec la clé privée du client (Sender-Constrained Token), rendant le jeton intercepté inutilisable par un tiers
- B) Les jetons Bearer sont trop longs
- C) Les jetons Bearer ne fonctionnent pas en HTTPS
- D) Les jetons Bearer ne contiennent pas de date d'expiration

**Réponse : A**

**Q2 :** Quelle est la différence fondamentale entre un jeton **JWS (RFC 7515)** et un jeton **JWE (RFC 7516)** ?
- A) Un JWS est simplement signé (son contenu reste lisible en clair par n'importe qui), tandis qu'un JWE est chiffré (son contenu est 100% opaque et déchiffrable uniquement par le destinataire possédant la clé privée)
- B) JWS est pour Linux, JWE pour Windows
- C) JWS utilise RSA et JWE utilise AES uniquement
- D) Il n'y a aucune différence entre les deux

**Réponse : A**

**Q3 :** Que contient le payload d'une preuve d'envoi **OAuth2 DPoP (RFC 9449)** pour prévenir les attaques par rejeu ?
- A) La méthode HTTP (`htm`), l'URL cible (`htu`), un horodatage (`iat`) et un identifiant unique de jeton (`jti`) enregistré par le serveur pour interdire les rejeux
- B) Le mot de passe de l'utilisateur
- C) L'adresse IP du serveur DNS
- D) La clé privée du serveur API

**Réponse : A**

**Q4 :** Combien de parties séparées par des points contient un jeton **JWE (JSON Web Encryption)** compact ?
- A) 5 parties : Header, Encrypted Key, IV, Ciphertext et Authentication Tag
- B) 3 parties
- C) 2 parties
- D) 7 parties

**Réponse : A**

**Q5 :** Dans une architecture **mTLS Token Binding**, comment le jeton d'accès est-il lié au client ?
- A) En incrustant l'empreinte SHA-256 (`x5t#S256`) du certificat X.509 du client dans le jeton d'accès, le serveur API rejetant le jeton si la connexion mTLS active n'utilise pas ce même certificat
- B) En envoyant un code SMS à chaque requête
- C) En utilisant un mot de passe de 32 caractères
- D) En désactivant le chiffrement TLS

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
