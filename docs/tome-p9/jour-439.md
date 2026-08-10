# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 439 (6h) : Identité Cryptographique Zero-Trust & Service Mesh — SPIFFE/SPIRE, Identity-Based Encryption (IBE) & Mutual TLS (mTLS) Mesh (Istio / Linkerd)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'établissement d'une **Identité Cryptographique Zero-Trust** pour les microservices et conteneurs Cloud-Native : déployer les standards **SPIFFE (Secure Production Identity Framework for Everyone)** et **SPIRE**, orchestrer la distribution automatique de certificats X.509 SVID (SPIFFE Verifiable Identity Document) avec rotation à très courte durée de vie (ex: 1 heure), comprendre le fonctionnement de l'**Identity-Based Encryption (IBE — Boneh-Franklin)**, et auditer le chiffrement mTLS strict sur un Service Mesh **Istio / Linkerd**.
>
> **Compétences visées :** `ZEROTRUST-CRYPTO-01` (A) — SPIFFE/SPIRE Workload Identity Architecture (SVID Issuance & Short-Lived X.509 Rotation) | `ZEROTRUST-CRYPTO-02` (A) — Service Mesh mTLS Enforcement (Istio/Linkerd) & Identity-Based Encryption (IBE)

---

## 1) Module — SPIFFE/SPIRE & Service Mesh mTLS Architecture (2h)

### 📖 Narration/Intuition

Dans les architectures Cloud-Native (Kubernetes, Serverless), les adresses IP ne peuvent plus servir de preuve d'identité : les conteneurs sont éphémères et changent d'IP constamment. Le modèle Zero-Trust remplace l'identité réseau par l'**Identité Cryptographique de Charge de Travail (Workload Identity)**. Chaque microservice reçoit un certificat X.509 éphémère (SVID) signé par **SPIRE** qui prouve son identité de manière transparente.

```
  ═══════════════════════════════════════════════════════════════════
    ARCHITECTURE DE GESTION D'IDENTITÉ WORKLOAD SPIFFE / SPIRE
  ═══════════════════════════════════════════════════════════════════

  ┌─────────────────────────────────────────────────────────────────┐
  │ SPIRE SERVER (CA d'Identité Zero-Trust)                         │
  │ Détermine les règles d'attribution de SPIFFE ID (Namespace, Pod)│
  └─────────────────────────────────────────────────────────────────┘
                                 │ Attestation de Workload
                                 ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │ SPIRE AGENT (Nœud Kubernetes) ──► Délivre SVID X.509 (1h TTL)    │
  └─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼ (mTLS automatique via Envoy Proxy)
  [SERVICE PAYMENT] ═══════════════════════════► [SERVICE DATABASE]
  spiffe://paradis.bank/ns/prod/sa/payment       spiffe://paradis.bank/ns/prod/sa/db
```

---

## 2) Module — Outillage Zero-Trust Workload Identity Engine (`spiffe_identity_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import hashlib
import os
from datetime import datetime, timezone, timedelta
from typing import List, Dict

class SPIFFEIdentityEngine:
    """
    Moteur de simulation et d'audit d'Identité Cryptographique Zero-Trust SPIFFE/SPIRE :
    - Génération et validation de SPIFFE IDs (ex: spiffe://paradis.bank/ns/prod/sa/payment-service)
    - Émission et rotation automatique de certificats X.509 SVID (Short-Lived 1h)
    - Validation des règles mTLS Strict Service Mesh Istio
    """

    def __init__(self, trust_domain: str):
        self.trust_domain = trust_domain
        self.issued_svids: List[dict] = []

    def issue_spiffe_svid(self, namespace: str, service_account: str, ttl_seconds: int = 3600) -> dict:
        """
        [SPIRE SERVER] Délivre un document d'identité SVID (SPIFFE Verifiable Identity Document).
        Le SPIFFE ID est encodé dans l'extension SAN (Subject Alternative Name) du certificat.
        """
        spiffe_id = f"spiffe://{self.trust_domain}/ns/{namespace}/sa/{service_account}"
        print(f"[*] ÉMISSION SVID ZERO-TRUST — SPIFFE ID: '{spiffe_id}'")

        now = datetime.now(timezone.utc)
        expires = now + timedelta(seconds=ttl_seconds)

        svid_document = {
            "spiffe_id": spiffe_id,
            "trust_domain": self.trust_domain,
            "san_uri": spiffe_id,
            "serial_number": hashlib.md5(spiffe_id.encode() + str(now).encode()).hexdigest()[:16].upper(),
            "issued_at": now.isoformat(),
            "expires_at": expires.isoformat(),
            "ttl_seconds": ttl_seconds,
            "status": "ACTIVE_VALID"
        }

        self.issued_svids.append(svid_document)
        print(f"  [+] SVID X.509 émis avec succès (TTL: {ttl_seconds}s — Expire à {expires.strftime('%H:%M:%S')}) ✅")
        return svid_document

    def validate_service_mesh_mtls_policy(self, client_spiffe_id: str, server_spiffe_id: str, is_mtls_strict: bool) -> dict:
        """
        [ISTIO / ENVOY PROXY] Valide la connexion mTLS Zero-Trust entre deux microservices.
        """
        print(f"\n[*] VALIDATION MTLSS SERVICE MESH : '{client_spiffe_id}' ──► '{server_spiffe_id}'")
        
        if not is_mtls_strict:
            result = {
                "status": "SECURITY_POLICY_VIOLATION",
                "severity": "HIGH",
                "issue": "mTLS Permissive mode active — Le trafic non chiffré est toléré !",
                "remediation": "Activer 'PeerAuthentication' mode: STRICT dans Istio."
            }
            print("  [!] HIGH VIOLATION: Mode mTLS Permissive actif ! Basculer en STRICT !")
            return result

        result = {
            "status": "MTLS_STRICT_VERIFIED",
            "client_identity": client_spiffe_id,
            "server_identity": server_spiffe_id,
            "encryption": "TLS 1.3 ECDHE + SPIFFE SVID Certificate",
            "access_granted": True
        }
        print(f"  [+] Connexion mTLS Strict validée entre les deux identités Zero-Trust ✅")
        return result

# Démonstration SPIFFE Identity Engine
engine = SPIFFEIdentityEngine("paradis.bank")
print("=== ZERO-TRUST WORKLOAD IDENTITY & SPIFFE ENGINE ===")

# 1. Émission SVID Microservice Payment
svid_payment = engine.issue_spiffe_svid(namespace="production", service_account="payment-service", ttl_seconds=3600)

# 2. Émission SVID Microservice Database
svid_db = engine.issue_spiffe_svid(namespace="production", service_account="postgres-db", ttl_seconds=3600)

# 3. Validation mTLS Service Mesh Istio
engine.validate_service_mesh_mtls_policy(
    client_spiffe_id=svid_payment["spiffe_id"],
    server_spiffe_id=svid_db["spiffe_id"],
    is_mtls_strict=True
)
```

---

## 3) Module — Fiche de Configuration Istio PeerAuthentication (2h)

```yaml
# CONFIGURATION ISTIO ZERO-TRUST — MTLS STRICT ENFORCEMENT

apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default-strict-mtls
  namespace: production
spec:
  mtls:
    mode: STRICT  # Rejette 100% des connexions non-mTLS (Zero-Trust Enforcement)

---
# REGLE DE SÉCURITÉ OPA / ISTIO AUTHORIZATION POLICY
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: payment-to-db-only
  namespace: production
spec:
  selector:
    matchLabels:
      app: postgres-db
  action: ALLOW
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/production/sa/payment-service"]  # SPIFFE ID
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SPIFFE** | Secure Production Identity Framework for Everyone — Standard d'identité cryptographique des workloads |
| **SPIRE** | SPIFFE Runtime Environment — Implémentation de référence de SPIFFE pour la délivrance des SVID |
| **SVID** | SPIFFE Verifiable Identity Document — Certificat X.509 ou JWT représentant l'identité d'un workload |
| **IBE** | Identity-Based Encryption — Schéma cryptographique où la clé publique est une chaîne arbitraire (ex: adresse email) |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Dans une architecture Cloud-Native Zero-Trust, pourquoi l'identité basée sur l'adresse IP est-elle rejetée au profit du standard **SPIFFE** ?
- A) Parce que dans Kubernetes, les conteneurs sont éphémères et leurs adresses IP changent constamment ; SPIFFE fournit une identité cryptographique immuable (SPIFFE ID) basée sur un certificat X.509 (SVID)
- B) Parce que les adresses IP ne fonctionnent pas en IPv6
- C) Parce que SPIFFE supprime le besoin de routeurs
- D) Parce qu'IPsec est interdit dans le Cloud

**Réponse : A**

**Q2 :** Où est encodé l'identifiant **SPIFFE ID** (`spiffe://domaine/ns/prod/sa/service`) dans un certificat X.509 SVID ?
- A) Dans l'extension X.509 v3 **Subject Alternative Name (SAN)** sous la forme d'un nom URI
- B) Dans le champ Issuer Common Name
- C) Dans la signature RSA
- D) Dans la date d'expiration

**Réponse : A**

**Q3 :** Pourquoi la durée de vie (TTL) des certificats **SVID** délivrés par **SPIRE** est-elle extrêmement courte (ex: 1 heure) ?
- A) Pour éliminer le besoin de listes de révocation (CRL) — si un conteneur est compromis, son certificat expire si vite que l'attaquant ne peut pas l'exploiter durablement
- B) Parce que le serveur n'a pas assez d'espace disque
- C) Parce que les certificats payants sont trop chers
- D) Pour forcer le redémarrage des serveurs

**Réponse : A**

**Q4 :** Que garantit le mode `STRICT` dans la ressource Istio `PeerAuthentication` ?
- A) Que 100% des communications entrantes vers les Pods du namespace doivent obligatoirement utiliser l'authentification mutuelle mTLS chiffrée, rejetant tout trafic en clair
- B) Que les développeurs ne peuvent pas déployer le vendredi
- C) Que la base de données est sauvegardée
- D) Que le port 80 est ouvert

**Réponse : A**

**Q5 :** Quel est le principe fondamental de l'**Identity-Based Encryption (IBE — Boneh-Franklin)** ?
- A) Permettre à un émetteur de chiffrer un message en utilisant une chaîne de caractères lisible représentant l'identité du destinataire (ex: `alice@paradis-bank.com`) directement comme clé publique, sans avoir à chercher son certificat X.509 au préalable
- B) Chiffrer la carte d'identité nationale
- C) Remplacer la fonction de hachage SHA-256
- D) Bloquer les attaques par force brute

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
