# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 272 (6h) : Enterprise PKI & Certificate Management (HashiCorp Vault PKI Engine, Kubernetes Cert-Manager, TLS 1.3 Hardening & Automated Certificate Renewal)

> [!NOTE]
> **Objectif du jour :** Maîtriser la création, l'automatisation et la gestion d'une **Infrastructure à Clés Publiques (PKI) d'entreprise moderne** : déployer une Autorité de Certification (CA) dynamique avec **HashiCorp Vault**, automatiser le cycle de vie des certificats X.509 dans Kubernetes avec **Cert-Manager**, configurer le durcissement **TLS 1.3** (cipher suites PFS), et prévenir les pannes causées par l'expiration de certificats.
>
> **Compétences visées :** `PKI-01` (A) — Enterprise PKI Architecture & HashiCorp Vault | `PKI-02` (A) — Kubernetes Cert-Manager & TLS 1.3 Hardening

---

## 1) Module — Architecture PKI Moderne & Dynamic CA avec HashiCorp Vault (2h)

### 📖 Narration/Intuition

Dans les architectures Cloud-Native et Microservices (Zero Trust), les certificats TLS à longue durée de vie (1 an ou plus) représentent un risque majeur en cas de compromission de clé privée. L'approche moderne repose sur des **certificats éphémères (Short-lived Certificates)** délivrés dynamiquement à la volée par un moteur PKI automatisé comme **HashiCorp Vault**.

---

## 2) Module — Configuration du Moteur PKI Vault (`vault_pki_setup.sh`) (2h)

### 🛠️ Atelier Pratique

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Activation et Configuration du Moteur PKI Root CA
# ═══════════════════════════════════════════════════════
# Activer le secret engine pki
vault secrets enable pki
vault secrets tune -max-lease-ttl=87600h pki # 10 ans

# Générer l'Autorité de Certification Racine (Root CA)
vault write -field=certificate pki/root/generate/internal \
    common_name="PARADIS IT Enterprise Root CA" \
    ttl=87600h > root_ca.crt

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Configuration du Moteur PKI Intermediate CA (Éphémère)
# ═══════════════════════════════════════════════════════
vault secrets enable -path=pki_int pki
vault secrets tune -max-lease-ttl=43800h pki_int # 5 ans

# Générer le CSR pour la CA Intermédiaire
vault write -field=csr pki_int/intermediate/generate/internal \
    common_name="PARADIS IT Intermediate CA" > pki_int.csr

# Signer le CSR avec la Root CA
vault write -field=certificate pki/root/sign-intermediate \
    csr=@pki_int.csr format=pem_bundle ttl=43800h > intermediate.cert.pem

# Importer le certificat signé dans Vault
vault write pki_int/intermediate/set-signed certificate=@intermediate.cert.pem

# ═══════════════════════════════════════════════════════
# ÉTAPE 3 — Définition d'un Rôle d'Émission de Certificats Éphémères (24h)
# ═══════════════════════════════════════════════════════
vault write pki_int/roles/internal-services \
    allowed_domains="company.local,svc.cluster.local" \
    allow_subdomains=true \
    max_ttl="24h" # Durée de vie maximale : 24 heures !

# Émettre un certificat dynamiquement pour un microservice
vault write pki_int/issue/internal-services \
    common_name="api.company.local" ttl="24h"
```

---

## 3) Module — Kubernetes Cert-Manager & TLS 1.3 Configuration (2h)

### 🛠️ Configuration d'un ClusterIssuer Cert-Manager (`cert_manager_vault.yaml`)

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: vault-issuer
spec:
  vault:
    server: https://vault.company.local:8200
    path: pki_int/sign/internal-services
    auth:
      kubernetes:
        role: cert-manager-role
        mountPath: /v1/auth/kubernetes
        secretRef:
          name: cert-manager-token
          key: token
---
# Demande de certificat TLS automatique pour un Ingress
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: api-tls-cert
  namespace: production
spec:
  secretName: api-tls-secret
  duration: 24h # Renouvellement automatique par Cert-Manager
  renewBefore: 8h
  subject:
    organizations:
      - PARADIS IT
  commonName: api.company.local
  dnsNames:
    - api.company.local
    - api.svc.cluster.local
  issuerRef:
    name: vault-issuer
    kind: ClusterIssuer
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PKI** | Public Key Infrastructure — Infrastructure à Clés Publiques gérant les certificats X.509 |
| **CSR** | Certificate Signing Request — Demande de signature de certificat émise vers une CA |
| **Cert-Manager** | Opérateur Kubernetes dédié à l'automatisation du cycle de vie des certificats TLS |
| **PFS** | Perfect Forward Secrecy — Propriété cryptographique garantissant qu'une clé compromise ne déchiffre pas le passé |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans une architecture Zero Trust moderne, quel est le principal avantage de délivrer des **certificats éphémères (Short-lived Certificates)** d'une durée de 24h plutôt que des certificats valides 1 an ?
- A) Limiter drastiquement la fenêtre d'opportunité d'un attaquant en cas de vol d'une clé privée TLS, sans avoir à gérer des listes de révocation complexes (CRL/OCSP)
- B) Réduire le débit réseau
- C) Éviter l'utilisation du DNS
- D) Supprimer le chiffrement TLS

**Réponse : A**

**Q2 :** Quel composant open-source Kubernetes permet d'automatiser l'émission, le renouvellement et le remplacement des certificats TLS dans un cluster ?
- A) Cert-Manager
- B) Kube-Proxy
- C) CoreDNS
- D) Flannel

**Réponse : A**

**Q3 :** Quel moteur de HashiCorp Vault est dédié à l'émission dynamique de certificats X.509 et au rôle d'Autorité de Certification (CA) ?
- A) Moteur PKI (PKI Secrets Engine)
- B) Moteur KV
- C) Moteur Transit
- D) Moteur AWS

**Réponse : A**

**Q4 :** Quelle version du protocole TLS a définitivement supprimé les suites de chiffrement obsolètes et non-PFS (ex: RSA static key exchange) pour imposer l'échange Diffie-Hellman (ECDHE) ?
- A) TLS 1.3
- B) TLS 1.0
- C) SSL v3
- D) TLS 1.1

**Réponse : A**

**Q5 :** Quel fichier est généré par un système client pour demander à une Autorité de Certification (CA) de signer sa clé publique ?
- A) CSR (Certificate Signing Request)
- B) CRL
- C) API Token
- D) SSH Key

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
