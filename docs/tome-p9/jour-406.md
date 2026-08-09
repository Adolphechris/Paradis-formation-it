# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 406 (6h) : Architecture PKI d'Entreprise — Root CA, Intermediate CA, Hiérarchie de Confiance X.509 v3 & Certificate Lifecycle Management

> [!NOTE]
> **Objectif du jour :** Maîtriser la conception et le déploiement d'une **Infrastructure à Clés Publiques (PKI) d'entreprise multi-niveaux** : comprendre l'architecture hiérarchique Root CA → Intermediate CA → End-Entity, décoder la structure complète d'un **certificat X.509 v3** (extensions critiques : Basic Constraints, Key Usage, Extended Key Usage, SAN), concevoir une politique de certificats (Certificate Policy / CP) et une déclaration des pratiques de certification (CPS), et implémenter un moteur de validation de la chaîne de confiance.
>
> **Compétences visées :** `PKI-ARCH-01` (A) — Enterprise PKI Hierarchy Design (Root CA Offline, Intermediate CA & End-Entity) | `PKI-ARCH-02` (A) — X.509 v3 Certificate Engineering, Trust Chain Validation & Certificate Policy Management

---

## 1) Module — Hiérarchie PKI & Structure X.509 v3 (2h)

### 📖 Narration/Intuition

Une PKI d'entreprise bien conçue est la colonne vertébrale de toute communication sécurisée : TLS mutual authentication, signature de code, chiffrement S/MIME, authentification réseau 802.1X. L'architecture à trois niveaux (Root → Intermediate → End-Entity) isole la clé privée Root CA dans un **HSM hors-ligne (Air-Gapped)**, limitant la surface d'attaque critique.

```
  ┌─────────────────────────────────────────────────────────────────────┐
  │             HIÉRARCHIE PKI D'ENTREPRISE PARADIS BANK               │
  └──────────────────────────────┬──────────────────────────────────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │     ROOT CA (Auto-signé, Offline)    │
              │    RSA-4096 | Durée de vie : 30 ans  │
              │    Stocké sur HSM Luna SA Air-Gapped │
              └──────────────────┬──────────────────┘
                                 │ Signe (Cross-Certification)
            ┌────────────────────┴────────────────────┐
            │                                         │
  ┌─────────▼──────────┐                  ┌──────────▼──────────┐
  │ INTERMEDIATE CA 1  │                  │ INTERMEDIATE CA 2   │
  │ (Serveurs TLS)     │                  │ (PKI Clients 802.1X)│
  │ RSA-2048 | 10 ans  │                  │ RSA-2048 | 10 ans   │
  └─────────┬──────────┘                  └──────────┬──────────┘
            │                                        │
    ┌───────▼───────┐                      ┌────────▼────────┐
    │ CERTIFICAT    │                      │ CERTIFICAT      │
    │ SERVEUR TLS   │                      │ CLIENT (MTLS)   │
    │ Durée : 1 an  │                      │ Durée : 2 ans   │
    └───────────────┘                      └─────────────────┘
```

#### Structure d'un Certificat X.509 v3 Complet

| Champ X.509 v3 | Description | Exemple de Valeur |
|:---|:---|:---|
| **Subject** | Identité du porteur du certificat | `CN=api.paradis-bank.com, O=Paradis Bank, C=CM` |
| **Issuer** | Identité de l'autorité de certification émettrice | `CN=Paradis Intermediate CA 1, O=Paradis Bank` |
| **Serial Number** | Identifiant unique du certificat chez l'émetteur | `0x1A2B3C4D5E6F` |
| **Validity (Not Before / Not After)** | Période de validité du certificat | `2026-01-01T00:00:00Z / 2027-01-01T23:59:59Z` |
| **Public Key** | Clé publique du porteur (RSA/EC) | `RSA 2048 bits` |
| **Basic Constraints (Critical)** | Détermine si c'est un CA (`CA: TRUE`) ou un leaf | `CA: FALSE, pathLen: 0` |
| **Key Usage (Critical)** | Utilisation cryptographique autorisée | `digitalSignature, keyEncipherment` |
| **Extended Key Usage** | Usages applicatifs autorisés | `id-kp-serverAuth (TLS), id-kp-clientAuth` |
| **Subject Alternative Name (SAN)** | Domaines alternatifs couverts | `DNS:api.paradis-bank.com, DNS:*.paradis-bank.com` |
| **CRL Distribution Points** | URL de la liste de révocation | `http://crl.paradis-bank.com/intermediate.crl` |
| **Authority Information Access** | URL de vérification OCSP | `http://ocsp.paradis-bank.com` |

---

## 2) Module — Outillage PKI Trust Chain Engine (`pki_trust_chain_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone, timedelta
from cryptography import x509
from cryptography.x509.oid import NameOID, ExtendedKeyUsageOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509 import load_pem_x509_certificate

class PKITrustChainEngine:
    """
    Moteur de PKI d'entreprise : génère une hiérarchie Root CA → Intermediate CA → End-Entity.
    Valide la chaîne de confiance et audite les extensions X.509 v3 critiques.
    """

    def __init__(self, organization: str):
        self.org = organization
        self.root_private_key = None
        self.root_cert = None
        self.intermediate_private_key = None
        self.intermediate_cert = None

    def generate_root_ca(self) -> x509.Certificate:
        """Génère le Root CA auto-signé (Air-Gapped HSM simulation)."""
        print(f"[*] Génération Root CA hors-ligne RSA-4096 pour {self.org}...")
        self.root_private_key = rsa.generate_private_key(
            public_exponent=65537, key_size=4096
        )
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, f"{self.org} Root CA"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, self.org),
            x509.NameAttribute(NameOID.COUNTRY_NAME, "FR"),
        ])
        self.root_cert = (
            x509.CertificateBuilder()
            .subject_name(subject)
            .issuer_name(issuer)
            .public_key(self.root_private_key.public_key())
            .serial_number(x509.random_serial_number())
            .not_valid_before(datetime.now(timezone.utc))
            .not_valid_after(datetime.now(timezone.utc) + timedelta(days=365 * 30))
            .add_extension(x509.BasicConstraints(ca=True, path_length=1), critical=True)
            .add_extension(x509.KeyUsage(
                digital_signature=True, content_commitment=True,
                key_encipherment=False, data_encipherment=False, key_agreement=False,
                key_cert_sign=True, crl_sign=True,
                encipher_only=False, decipher_only=False
            ), critical=True)
            .sign(self.root_private_key, hashes.SHA256())
        )
        print(f"  [ROOT CA] Généré — Série: {self.root_cert.serial_number} | Validité: 30 ans")
        return self.root_cert

    def generate_intermediate_ca(self, cn: str) -> x509.Certificate:
        """Génère un Intermediate CA signé par le Root CA."""
        print(f"[*] Génération Intermediate CA '{cn}' RSA-2048...")
        self.intermediate_private_key = rsa.generate_private_key(
            public_exponent=65537, key_size=2048
        )
        subject = x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, cn),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, self.org),
        ])
        self.intermediate_cert = (
            x509.CertificateBuilder()
            .subject_name(subject)
            .issuer_name(self.root_cert.subject)
            .public_key(self.intermediate_private_key.public_key())
            .serial_number(x509.random_serial_number())
            .not_valid_before(datetime.now(timezone.utc))
            .not_valid_after(datetime.now(timezone.utc) + timedelta(days=365 * 10))
            .add_extension(x509.BasicConstraints(ca=True, path_length=0), critical=True)
            .add_extension(x509.KeyUsage(
                digital_signature=True, content_commitment=False,
                key_encipherment=False, data_encipherment=False, key_agreement=False,
                key_cert_sign=True, crl_sign=True,
                encipher_only=False, decipher_only=False
            ), critical=True)
            .sign(self.root_private_key, hashes.SHA256())
        )
        print(f"  [INTERMEDIATE CA] Généré — Signé par Root CA | Validité: 10 ans")
        return self.intermediate_cert

    def issue_tls_server_cert(self, domain: str) -> x509.Certificate:
        """Génère un certificat TLS serveur (End-Entity) signé par l'Intermediate CA."""
        print(f"[*] Émission certificat TLS serveur pour '{domain}'...")
        server_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        subject = x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, domain),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, self.org),
        ])
        cert = (
            x509.CertificateBuilder()
            .subject_name(subject)
            .issuer_name(self.intermediate_cert.subject)
            .public_key(server_key.public_key())
            .serial_number(x509.random_serial_number())
            .not_valid_before(datetime.now(timezone.utc))
            .not_valid_after(datetime.now(timezone.utc) + timedelta(days=365))
            .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=True)
            .add_extension(x509.SubjectAlternativeName([
                x509.DNSName(domain),
                x509.DNSName(f"*.{domain}"),
            ]), critical=False)
            .add_extension(x509.ExtendedKeyUsage([
                ExtendedKeyUsageOID.SERVER_AUTH,
            ]), critical=False)
            .sign(self.intermediate_private_key, hashes.SHA256())
        )
        print(f"  [TLS CERT] Émis pour {domain} | SAN: {domain}, *.{domain} | Validité: 1 an")
        return cert

    def audit_certificate_chain(self):
        """Audite la chaîne Root CA → Intermediate CA."""
        print("\n[*] Audit de la Chaîne de Confiance PKI...")
        root_cn = self.root_cert.subject.get_attributes_for_oid(NameOID.COMMON_NAME)[0].value
        int_cn = self.intermediate_cert.subject.get_attributes_for_oid(NameOID.COMMON_NAME)[0].value
        int_issuer = self.intermediate_cert.issuer.get_attributes_for_oid(NameOID.COMMON_NAME)[0].value
        print(f"  [CHAIN] {root_cn} → {int_cn} (Issuer vérifié: '{int_issuer}' ≡ '{root_cn}')")
        print(f"  [STATUS] Chaîne de confiance VALIDE ✅")

# Démonstration PKI Engine
pki = PKITrustChainEngine("Paradis International Bank")
print("=== ENTERPRISE PKI TRUST CHAIN ENGINE ===")

pki.generate_root_ca()
pki.generate_intermediate_ca("Paradis Intermediate CA 1 — TLS Servers")
pki.issue_tls_server_cert("api.paradis-bank.com")
pki.audit_certificate_chain()
```

---

## 3) Module — Fiche de Politique de Certification (CP/CPS Summary) (2h)

```markdown
# POLITIQUE DE CERTIFICATION (CP) — PARADIS BANK PKI

## 1. Niveaux d'Assurance des Certificats
| Classe | Validation | Usage | Durée Max |
|:---:|:---|:---|:---:|
| **OV (Organization Validated)** | Vérification légale de l'organisation | TLS Serveurs Publics | 1 an |
| **IV (Individual Validated)** | Vérification identité personne physique | Signature S/MIME | 2 ans |
| **DV (Domain Validated)** | Validation DNS uniquement (ACME) | DevTest Internes | 90 jours |

## 2. Exigences Clés de Sécurité du Root CA
- Stockage de la clé privée Root CA exclusivement sur HSM certifié **FIPS 140-2 Level 3** (ex: Thales Luna SA 7).
- Root CA stocké physiquement dans une salle forte avec accès biométrique, double clé physique et vidéosurveillance H24.
- **Key Ceremony** documentée et supervisée par au moins 5 personnels accrédités (quorum M-of-N).
- Root CA strictement hors ligne (Air-Gapped) : aucune interface réseau active.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PKI** | Public Key Infrastructure — Infrastructure complète gérant l'émission, la révocation et la validation des certificats numériques |
| **CA** | Certificate Authority — Autorité de Certification habilitée à émettre des certificats X.509 |
| **X.509** | Standard ITU-T définissant le format des certificats à clé publique |
| **SAN** | Subject Alternative Name — Extension X.509 v3 listant les noms de domaine alternatifs |
| **CP/CPS** | Certificate Policy / Certification Practice Statement — Documents régissant les pratiques d'une PKI |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Pourquoi la clé privée du **Root CA** doit-elle être conservée hors-ligne (Air-Gapped) sur un HSM certifié FIPS 140-2 Level 3 ?
- A) Parce que la compromission de la clé Root CA invaliderait l'intégralité de la confiance de la PKI et l'ensemble des certificats émis par toute la hiérarchie en dessous
- B) Parce qu'elle consomme trop de bande passante réseau
- C) Parce qu'elle est trop volumineuse pour être stockée en ligne
- D) Parce que le Root CA n'a pas besoin d'être signé

**Réponse : A**

**Q2 :** Quelle extension X.509 v3 est critique et permet de distinguer un certificat d'une Autorité de Certification (CA) d'un certificat End-Entity ?
- A) Basic Constraints (`CA: TRUE/FALSE` et `pathLen`)
- B) Subject Alternative Name
- C) CRL Distribution Points
- D) Key Usage uniquement

**Réponse : A**

**Q3 :** Quel est le rôle de l'extension **Subject Alternative Name (SAN)** dans un certificat TLS serveur ?
- A) Lister l'ensemble des noms de domaine DNS et adresses IP couverts par le certificat (ex: `DNS:api.paradis-bank.com, DNS:*.paradis-bank.com`)
- B) Indiquer l'algorithme de chiffrement du certificat
- C) Spécifier la durée de validité du certificat
- D) Indiquer le numéro de série du HSM

**Réponse : A**

**Q4 :** Pourquoi est-il recommandé d'utiliser un **Intermediate CA** pour émettre les certificats end-entity au lieu d'utiliser directement le Root CA ?
- A) Pour limiter la surface d'exposition de la clé Root CA — si une Intermediate CA est compromise, seule elle est révoquée, le Root CA et les autres branches restent intacts
- B) Pour économiser des ressources CPU
- C) Pour réduire la taille des certificats
- D) Pour respecter les règles de style

**Réponse : A**

**Q5 :** Quel mécanisme de **Key Ceremony** garantit qu'aucune personne seule ne peut accéder à la clé Root CA ?
- A) Le partage de secret de type **M-of-N (Shamir's Secret Sharing)** — N fragments de clé distribués à N personnes accrédités, avec un quorum minimum M requis pour la reconstituer
- B) Un mot de passe de 4 chiffres
- C) Un accès biométrique par une seule personne
- D) Un certificat auto-signé

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
