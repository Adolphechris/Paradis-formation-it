# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 408 (6h) : Automated Certificate Management — ACME Protocol, Let's Encrypt, Cert-Manager Kubernetes & HashiCorp Vault PKI Engine

> [!NOTE]
> **Objectif du jour :** Maîtriser l'automatisation complète du cycle de vie des certificats TLS (**Automated Certificate Management Environment — ACME Protocol RFC 8555**) : comprendre le déroulement des challenges ACME (HTTP-01, DNS-01, TLS-ALPN-01), déployer **Let's Encrypt** avec renouvellement automatique, orchestrer les certificats sur **Kubernetes via Cert-Manager** (Issuers, Certificates, CertificateRequests), et configurer le **HashiCorp Vault PKI Secrets Engine** pour émettre des certificats internes à durée de vie ultra-courte.
>
> **Compétences visées :** `PKI-AUTO-01` (A) — ACME Protocol Internals & Let's Encrypt Challenges (HTTP-01, DNS-01, TLS-ALPN-01) | `PKI-AUTO-02` (A) — Cert-Manager K8s Orchestration & HashiCorp Vault PKI Short-Lived Certificates

---

## 1) Module — Protocole ACME (RFC 8555) & Challenges de Validation (2h)

### 📖 Narration/Intuition

L'ACME Protocol est la révolution qui a démocratisé le HTTPS : en automatisant cryptographiquement la preuve de contrôle d'un domaine, Let's Encrypt a permis d'émettre des certificats TLS gratuitement et sans intervention humaine. Les grandes entreprises utilisent ACME en interne pour émettre des certificats à durée de vie ultra-courte (24h à 7 jours) depuis leur PKI privée.

```
  [CLIENT ACME (Certbot / Cert-Manager)]
                │
                │ 1. POST /directory ──► Découverte des endpoints ACME
                │
                │ 2. POST /new-account ──► Création du compte ACME (JWS/ECDSA)
                │
                │ 3. POST /new-order ──► Commande d'un certificat pour "api.paradis-bank.com"
                │
                │ 4. GET /challenges ──► Sélection du challenge DNS-01 ou HTTP-01
                │
                ├── Challenge HTTP-01 ──► Fichier token à /.well-known/acme-challenge/TOKEN
                ├── Challenge DNS-01  ──► Enregistrement TXT _acme-challenge.paradis-bank.com
                │
                │ 5. POST /challenges/{id} ──► Signal de complétion du challenge
                │
                │ 6. GET /order/{id} ──► Vérification du statut (valid)
                │
                │ 7. POST /finalize ──► Envoi du CSR (Certificate Signing Request)
                │
                │ 8. GET /certificate ──► Téléchargement du certificat + chaîne CA
                ▼
  [CERTIFICAT TLS ÉMIS & INSTALLÉ AUTOMATIQUEMENT]
```

#### Comparatif des Challenges ACME

| Challenge | Preuve de Contrôle | Idéal Pour | Limitation |
|:---:|:---|:---|:---|
| **HTTP-01** | Fichier token via HTTP sur port 80 | Serveurs web exposés sur Internet | Impossible si port 80 bloqué |
| **DNS-01** | Enregistrement TXT DNS `_acme-challenge` | Wildcards (`*.domaine.com`), serveurs internes | Requiert accès API DNS |
| **TLS-ALPN-01** | Certificat TLS auto-signé avec OID ACME | CDN / Reverse Proxies TLS-terminants | Moins répandu |

---

## 2) Module — Outillage ACME & Vault PKI Engine (`acme_vault_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import hashlib
import base64
import os
from datetime import datetime, timezone, timedelta
from typing import List, Dict

class ACMECertManager:
    """
    Simulateur du protocole ACME (RFC 8555) et du moteur PKI HashiCorp Vault.
    Modélise l'émission automatique de certificats TLS avec renouvellement automatique.
    """

    def __init__(self, ca_url: str, organization: str):
        self.ca_url = ca_url
        self.org = organization
        self.issued_certs: List[dict] = []

    def simulate_acme_dns01_challenge(self, domain: str) -> dict:
        """
        Simule le challenge ACME DNS-01 pour la validation de contrôle de domaine.
        Génère le token et l'enregistrement TXT DNS correspondant.
        """
        # 1. Génération du token ACME
        token = base64.urlsafe_b64encode(os.urandom(32)).rstrip(b'=').decode()
        
        # 2. Calcul de l'empreinte SHA-256 du token + thumbprint de la clé ACME
        key_thumbprint = base64.urlsafe_b64encode(hashlib.sha256(b"account_key_mock").digest()).rstrip(b'=').decode()
        key_authorization = f"{token}.{key_thumbprint}"
        dns_record_value = base64.urlsafe_b64encode(hashlib.sha256(key_authorization.encode()).digest()).rstrip(b'=').decode()

        challenge = {
            "challenge_type": "dns-01",
            "domain": domain,
            "token": token,
            "dns_record": f"_acme-challenge.{domain}",
            "dns_record_type": "TXT",
            "dns_record_value": dns_record_value,
            "status": "pending"
        }
        print(f"  [ACME DNS-01] Challenge pour '{domain}':")
        print(f"    → Créer enregistrement TXT: _acme-challenge.{domain}")
        print(f"    → Valeur: {dns_record_value[:20]}...")
        return challenge

    def complete_acme_challenge(self, challenge: dict) -> dict:
        """Simule la validation et la complétion du challenge ACME."""
        challenge["status"] = "valid"
        print(f"  [ACME] Challenge DNS-01 validé pour '{challenge['domain']}' ✅")
        return challenge

    def issue_certificate(self, domain: str, validity_days: int = 90) -> dict:
        """Simule l'émission finale d'un certificat TLS par la CA ACME."""
        cert = {
            "serial": hashlib.md5(domain.encode()).hexdigest().upper()[:16],
            "domain": domain,
            "san": [domain, f"*.{domain}"],
            "issuer": self.ca_url,
            "issued_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=validity_days)).isoformat(),
            "validity_days": validity_days,
            "renewal_scheduled_at": (datetime.now(timezone.utc) + timedelta(days=int(validity_days * 0.7))).isoformat()
        }
        self.issued_certs.append(cert)
        print(f"  [ACME CERT ISSUED] {domain} | Validité: {validity_days}j | Renouvellement prévu à 70%")
        return cert

    def vault_pki_issue_short_lived(self, role: str, common_name: str, ttl: str = "24h") -> dict:
        """
        Simule l'émission d'un certificat interne ultra-court via HashiCorp Vault PKI Engine.
        Les certificats Vault peuvent être émis avec une TTL de quelques heures pour
        les microservices mTLS (ex: Service Mesh Istio).
        """
        cert = {
            "vault_mount": "pki_int",
            "role": role,
            "common_name": common_name,
            "ttl": ttl,
            "serial_number": hashlib.sha1(common_name.encode()).hexdigest().upper()[:16],
            "issued_at": datetime.now(timezone.utc).isoformat(),
            "private_key": "[VAULT_PKI_PRIVATE_KEY — SECRET BACKEND]",
            "certificate": f"[X.509 CERT FOR {common_name} — TTL {ttl}]",
            "ca_chain": "[INTERMEDIATE_CA_CHAIN_PEM]"
        }
        print(f"  [VAULT PKI] Certificat émis pour '{common_name}' via rôle '{role}' | TTL: {ttl}")
        return cert

# Démonstration ACME & Vault PKI Engine
manager = ACMECertManager("https://acme-v02.api.letsencrypt.org", "Paradis Bank")
print("=== ACME PROTOCOL & VAULT PKI CERTIFICATE MANAGER ===")

# 1. Challenge ACME DNS-01
challenge = manager.simulate_acme_dns01_challenge("api.paradis-bank.com")
manager.complete_acme_challenge(challenge)

# 2. Émission du certificat Let's Encrypt 90 jours
cert = manager.issue_certificate("api.paradis-bank.com", validity_days=90)

# 3. Vault PKI Short-Lived (24h) pour microservices mTLS
vault_cert = manager.vault_pki_issue_short_lived(
    role="microservices-mtls",
    common_name="payment-service.paradis.internal",
    ttl="24h"
)

print(f"\n[+] Certificat LE émis : expires {cert['expires_at'][:10]} | Renouvellement: {cert['renewal_scheduled_at'][:10]}")
```

---

## 3) Module — Fiche Cert-Manager Kubernetes (2h)

```yaml
# CERT-MANAGER KUBERNETES — DÉPLOIEMENT COMPLET

# 1. Issuer Let's Encrypt (ACME DNS-01 via Cloudflare)
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: devops@paradis-bank.com
    privateKeySecretRef:
      name: letsencrypt-prod-private-key
    solvers:
    - dns01:
        cloudflare:
          email: devops@paradis-bank.com
          apiTokenSecretRef:
            name: cloudflare-api-token
            key: api-token

---
# 2. Certificate Resource — Kubernetes CRD
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: api-paradis-bank-tls
  namespace: production
spec:
  secretName: api-tls-secret
  duration: 2160h      # 90 jours
  renewBefore: 720h    # Renouvellement automatique à 30 jours de l'expiration
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - api.paradis-bank.com
  - "*.paradis-bank.com"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ACME** | Automated Certificate Management Environment — Protocole standard (RFC 8555) d'automatisation de la gestion des certificats |
| **Cert-Manager** | Contrôleur Kubernetes natif pour l'automatisation du cycle de vie des certificats TLS |
| **Vault PKI Engine** | Module de HashiCorp Vault permettant d'émettre des certificats X.509 avec TTL ultra-courte |
| **Short-Lived Certificates** | Certificats TLS avec TTL de quelques heures ou jours éliminant le besoin de révocation |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quel est le défi cryptographique qui différencie le challenge **DNS-01** du challenge **HTTP-01** dans le protocole ACME ?
- A) Le challenge DNS-01 prouve le contrôle du domaine via un enregistrement TXT DNS `_acme-challenge` signé cryptographiquement — il est le seul à permettre l'émission de certificats wildcard (`*.domaine.com`)
- B) Le challenge DNS-01 utilise le port 80
- C) Le challenge HTTP-01 nécessite un nom de domaine premium
- D) Il n'y a aucune différence cryptographique entre les deux

**Réponse : A**

**Q2 :** Pourquoi les **certificats à durée de vie ultra-courte (Short-Lived)** émis par HashiCorp Vault éliminent-ils le besoin de révocation ?
- A) Parce qu'un certificat valide seulement 24 heures expire si rapidement qu'un attaquant ne peut pas l'exploiter significativement, rendant la révocation superflue dans la plupart des scénarios
- B) Parce qu'ils sont gratuits
- C) Parce que Vault supprime automatiquement les clés
- D) Parce qu'ils sont émis par le Root CA directement

**Réponse : A**

**Q3 :** Dans **Cert-Manager Kubernetes**, quel objet CRD (Custom Resource Definition) permet de définir les paramètres d'un certificat TLS à gérer automatiquement (domaine, durée, renouvellement) ?
- A) La ressource `Certificate` (qui référence un `Issuer` ou `ClusterIssuer`)
- B) La ressource `ConfigMap`
- C) La ressource `Deployment`
- D) La ressource `ServiceAccount`

**Réponse : A**

**Q4 :** Dans le protocole ACME, à quel moment le client soumet-il la **CSR (Certificate Signing Request)** à la CA ?
- A) Uniquement après que le challenge de validation de domaine a été complété avec succès (statut `valid`)
- B) Avant même de commencer le challenge
- C) Simultanément à la création du compte ACME
- D) À n'importe quel moment de la procédure

**Réponse : A**

**Q5 :** À quel moment **Cert-Manager** déclenche-t-il le renouvellement automatique d'un certificat TLS Kubernetes ?
- A) Lorsqu'il reste moins de temps que la fenêtre `renewBefore` configurée avant l'expiration du certificat
- B) Le 1er janvier de chaque année
- C) Uniquement si l'administrateur le déclenche manuellement
- D) Quand le certificat est révoqué par la CA

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
