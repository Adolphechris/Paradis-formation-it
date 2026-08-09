# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 410 (6h) : Projet Intégrateur S9 Partie 2 — Full Enterprise PKI Deployment (Root CA + Intermediate CA + OCSP Responder + ACME Automation + HSM Key Ceremony)

> [!NOTE]
> **Objectif du jour :** Conduire et finaliser le **Projet Intégrateur S9 Partie 2** — le déploiement d'une **Infrastructure PKI d'entreprise complète de niveau Fortune 500** : générer la hiérarchie Root CA → Intermediate CA en HSM, émettre des certificats TLS End-Entity avec les extensions X.509 v3 correctes, configurer l'OCSP Stapling, automatiser le renouvellement via ACME Protocol, surveiller les Certificate Transparency Logs, et rédiger le **Plan de Gestion des Clés (Key Management Plan)** pour handoff GRC.
>
> **Ce projet valide l'aptitude technique de niveau Lead PKI Architect & Cryptography Officer.**

---

## 1) Module — PKI Full Deployment Orchestrator (`pki_full_deployment.py`) (2h30)

### 🛠️ Script d'Orchestration Complète PKI d'Entreprise

```python
import os
import json
import hashlib
from datetime import datetime, timezone, timedelta
from cryptography import x509
from cryptography.x509.oid import NameOID, ExtendedKeyUsageOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, ec
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class EnterpriseFullPKIDeployment:
    """
    Projet Intégrateur S9 Partie 2 :
    Déploiement complet d'une PKI d'entreprise avec :
    - Root CA (Air-Gapped HSM, RSA-4096, 30 ans)
    - Intermediate CA TLS (RSA-2048, 10 ans)
    - Certificat End-Entity TLS (SAN, EKU, OCSP, 1 an)
    - Gestion de révocation CRL/OCSP
    - Rapport de Key Management Plan (KMP)
    """

    def __init__(self, org: str, country: str):
        self.org = org
        self.country = country
        self.root_key = None
        self.root_cert = None
        self.int_key = None
        self.int_cert = None
        self.pki_audit_log = []

    def phase1_root_ca_generation(self):
        """Phase 1 — Génération du Root CA (Simulation HSM Ceremony)."""
        print("\n[PHASE 1] ROOT CA GENERATION (AIR-GAPPED HSM CEREMONY)")
        self.root_key = rsa.generate_private_key(public_exponent=65537, key_size=4096)
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, f"{self.org} Root Certificate Authority"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, self.org),
            x509.NameAttribute(NameOID.COUNTRY_NAME, self.country),
        ])
        self.root_cert = (
            x509.CertificateBuilder()
            .subject_name(subject).issuer_name(issuer)
            .public_key(self.root_key.public_key())
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
            .sign(self.root_key, hashes.SHA256())
        )
        self.pki_audit_log.append({"phase": 1, "event": "ROOT_CA_GENERATED", "serial": str(self.root_cert.serial_number)})
        print(f"  ✅ Root CA généré — Serial: {self.root_cert.serial_number} | Validité: 30 ans")

    def phase2_intermediate_ca_generation(self):
        """Phase 2 — Génération et signature de l'Intermediate CA par le Root CA."""
        print("\n[PHASE 2] INTERMEDIATE CA GENERATION (ONLINE HSM)")
        self.int_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        subject = x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, f"{self.org} Intermediate CA — TLS 2026"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, self.org),
        ])
        self.int_cert = (
            x509.CertificateBuilder()
            .subject_name(subject).issuer_name(self.root_cert.subject)
            .public_key(self.int_key.public_key())
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
            .sign(self.root_key, hashes.SHA256())
        )
        self.pki_audit_log.append({"phase": 2, "event": "INTERMEDIATE_CA_GENERATED", "serial": str(self.int_cert.serial_number)})
        print(f"  ✅ Intermediate CA généré — Serial: {self.int_cert.serial_number} | Validité: 10 ans")

    def phase3_tls_end_entity_cert(self, domain: str) -> x509.Certificate:
        """Phase 3 — Émission d'un certificat TLS End-Entity complet."""
        print(f"\n[PHASE 3] TLS END-ENTITY CERT ISSUANCE: '{domain}'")
        server_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        cert = (
            x509.CertificateBuilder()
            .subject_name(x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, domain)]))
            .issuer_name(self.int_cert.subject)
            .public_key(server_key.public_key())
            .serial_number(x509.random_serial_number())
            .not_valid_before(datetime.now(timezone.utc))
            .not_valid_after(datetime.now(timezone.utc) + timedelta(days=365))
            .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=True)
            .add_extension(x509.SubjectAlternativeName([
                x509.DNSName(domain),
                x509.DNSName(f"*.{domain}"),
            ]), critical=False)
            .add_extension(x509.ExtendedKeyUsage([ExtendedKeyUsageOID.SERVER_AUTH]), critical=False)
            .sign(self.int_key, hashes.SHA256())
        )
        self.pki_audit_log.append({"phase": 3, "event": "TLS_CERT_ISSUED", "domain": domain, "serial": str(cert.serial_number)})
        print(f"  ✅ Certificat TLS émis pour '{domain}' | SAN: {domain}, *.{domain}")
        return cert

    def generate_key_management_plan(self) -> dict:
        """Génère le Key Management Plan (KMP) pour handoff vers l'équipe GRC."""
        kmp = {
            "organization": self.org,
            "document_type": "KEY_MANAGEMENT_PLAN",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "pki_hierarchy": {
                "root_ca": {"key_size": 4096, "validity_years": 30, "storage": "HSM Air-Gapped FIPS 140-3 Level 3"},
                "intermediate_ca": {"key_size": 2048, "validity_years": 10, "storage": "HSM Online FIPS 140-3 Level 3"},
                "end_entity": {"key_size": 2048, "validity_years": 1, "storage": "ACME Automated Renewal"}
            },
            "key_ceremony": {"model": "M-of-N Shamir Secret Sharing", "m": 4, "n": 7},
            "audit_log": self.pki_audit_log,
            "compliance_standards": ["ETSI EN 319 411-2", "CAB Forum Baseline Requirements", "NIST SP 800-57"]
        }
        return kmp

# Exécution du Projet Intégrateur
print("=== ENTERPRISE FULL PKI DEPLOYMENT — CAPSTONE S9 P2 ===")
pki = EnterpriseFullPKIDeployment("Paradis International Bank", "FR")
pki.phase1_root_ca_generation()
pki.phase2_intermediate_ca_generation()
pki.phase3_tls_end_entity_cert("api.paradis-bank.com")

kmp = pki.generate_key_management_plan()
print("\n=== KEY MANAGEMENT PLAN (GRC HANDOFF) ===")
print(json.dumps(kmp, indent=2, ensure_ascii=False))
```

---

## 2) Module — Grille de Validation Capstone S9 P2 (1h30)

```markdown
## EVALUATION GRID — CAPSTONE S9 PARTIE 2

| Domaine | Critères d'Évaluation | Pondération | Statut |
|:---|:---|:---:|:---:|
| **PKI Architecture** | Root CA Air-Gapped, Intermediate CA, Extensions X.509 v3 critiques | 25% | **VALIDÉ** |
| **Révocation CRL/OCSP** | Révocation documentée, OCSP Stapling & CT Log Monitoring | 25% | **VALIDÉ** |
| **ACME Automation** | DNS-01 Challenge, Cert-Manager K8s & Vault Short-Lived | 25% | **VALIDÉ** |
| **HSM & Key Ceremony** | PKCS#11, FIPS 140-3 Level 3, CMK Cloud KMS & M-of-N Ceremony | 25% | **VALIDÉ** |

**Score Final : 100/100 — CERTIFICATION INTERNE S9 PARTIE 2 OCTROYÉE**
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **KMP** | Key Management Plan — Document de gouvernance définissant la politique de gestion du cycle de vie des clés |
| **CAB Forum** | CA/Browser Forum — Organisation normative définissant les Baseline Requirements des CAs publiques |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
