# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 407 (6h) : Révocation de Certificats & Validation en Temps Réel — CRL, OCSP Stapling, Certificate Transparency Logs & Must-Staple

> [!NOTE]
> **Objectif du jour :** Maîtriser l'ensemble des mécanismes de **révocation et de validation des certificats numériques** : comprendre les limites des **Certificate Revocation Lists (CRL)** par rapport au protocole **OCSP (Online Certificate Status Protocol)**, implémenter l'optimisation **OCSP Stapling** pour éviter les fuites de vie privée et réduire la latence, analyser les **Certificate Transparency (CT) Logs** (RFC 9162) pour détecter les émissions frauduleuses, et configurer l'extension **TLS Must-Staple**.
>
> **Compétences visées :** `PKI-REVOKE-01` (A) — CRL & OCSP Architecture, OCSP Stapling Implementation & Must-Staple | `PKI-REVOKE-02` (A) — Certificate Transparency Log Monitoring & Rogue Certificate Detection

---

## 1) Module — CRL vs OCSP vs OCSP Stapling (2h)

### 📖 Narration/Intuition

La révocation est le problème le plus difficile de la PKI. Si un certificat est compromis, le client doit pouvoir vérifier sa révocation en temps réel. Les trois mécanismes ont chacun leurs compromis critiques en matière de **latence, vie privée et fiabilité**.

```
  ┌────────────────────────────────────────────────────────────────────┐
  │              COMPARAISON DES MÉCANISMES DE RÉVOCATION PKI          │
  └───────────────────────────┬────────────────────────────────────────┘
                              │
  ┌───────────────────────────▼─────────────────────────────────────────┐
  │ Mécanisme   │ Mode        │ Problème Majeur │ Solution             │
  ├─────────────┼─────────────┼─────────────────┼──────────────────────┤
  │ CRL         │ Pull (lot)  │ Taille en MB    │ CRL Partitionnées    │
  │ OCSP        │ Pull (live) │ Privacy Leak    │ OCSP Stapling        │
  │ OCSP Staple │ Push (TLS)  │ Staleness Risk  │ Must-Staple + Nonce  │
  └─────────────────────────────────────────────────────────────────────┘

  [NAVIGATEUR] ──(1)──► [SERVEUR TLS]
        ▲                    │
        │                    │ (2) Récupère réponse OCSP signée du CA
        │                    ▼
        │              [OCSP RESPONDER (CA)]
        │                    │
        └──(3) Reçoit Réponse OCSP Stapled dans le Handshake TLS ◄────┘
```

#### Délais de Révocation : L'Équation Impossible Sans OCSP Stapling

- **CRL sans cache :** L'attaquant peut utiliser un certificat compromis jusqu'à la prochaine mise à jour de la CRL (souvent 24h à 7 jours).
- **OCSP Sans Stapling :** Le navigateur contacte directement le Responder OCSP du CA pour chaque connexion → **Fuite de vie privée** (le CA connaît chaque site visité).
- **OCSP Stapling :** Le serveur récupère et met en cache la réponse OCSP signée, l'inclut dans le Handshake TLS → Aucune fuite de vie privée, performances optimales.

---

## 2) Module — Outillage Certificate Revocation Engine (`cert_revocation_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone, timedelta
from cryptography import x509
from cryptography.x509.oid import NameOID, ExtensionOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509 import ocsp
from typing import List, Dict

class CertRevocationEngine:
    """
    Moteur de gestion de la révocation PKI :
    CRL Builder, OCSP Response Simulator & CT Log Monitor.
    """

    def __init__(self, ca_name: str):
        self.ca = ca_name
        self.revoked_serials: Dict[int, dict] = {}
        self.ct_log_monitor_results: List[dict] = []

    def revoke_certificate(self, serial_number: int, reason: str) -> dict:
        """Enregistre la révocation d'un certificat dans la base CRL/OCSP."""
        entry = {
            "serial_number": serial_number,
            "revocation_reason": reason,
            "revocation_time": datetime.now(timezone.utc).isoformat()
        }
        self.revoked_serials[serial_number] = entry
        print(f"  [REVOKE] Certificat {serial_number} révoqué — Raison: {reason}")
        return entry

    def simulate_crl_generation(self) -> dict:
        """
        Simule la génération d'une CRL (Certificate Revocation List) au format RFC 5280.
        Une CRL est signée par la CA et distribué aux clients pour vérification hors-ligne.
        """
        crl_info = {
            "issuer": self.ca,
            "this_update": datetime.now(timezone.utc).isoformat(),
            "next_update": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "revoked_certificates_count": len(self.revoked_serials),
            "revoked_entries": list(self.revoked_serials.values()),
            "signature_algorithm": "SHA256WithRSAEncryption"
        }
        print(f"  [CRL] CRL générée : {len(self.revoked_serials)} certificat(s) révoqué(s).")
        return crl_info

    def simulate_ocsp_response(self, serial_number: int) -> dict:
        """
        Simule une réponse OCSP (Online Certificate Status Protocol — RFC 6960).
        La réponse est signée par le OCSP Responder de la CA.
        """
        if serial_number in self.revoked_serials:
            status = "REVOKED"
            revocation_detail = self.revoked_serials[serial_number]
        else:
            status = "GOOD"
            revocation_detail = None

        response = {
            "ocsp_responder": f"ocsp.{self.ca.lower().replace(' ', '-')}.com",
            "queried_serial": serial_number,
            "response_status": "successful",
            "certificate_status": status,
            "this_update": datetime.now(timezone.utc).isoformat(),
            "next_update": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat(),
            "revocation_detail": revocation_detail
        }
        status_icon = "❌ RÉVOQUÉ" if status == "REVOKED" else "✅ VALIDE"
        print(f"  [OCSP] Série {serial_number}: {status_icon}")
        return response

    def monitor_ct_log_for_rogue_certs(self, domain: str, authorized_issuers: List[str], ct_entries: List[dict]) -> List[dict]:
        """
        Monitore les Certificate Transparency (CT) Logs pour détecter les certificats frauduleux
        émis pour un domaine sans autorisation.
        """
        rogue_certs_found = []
        for entry in ct_entries:
            if entry["domain"] == domain and entry["issuer"] not in authorized_issuers:
                alert = {
                    "alert_type": "ROGUE_CERTIFICATE_DETECTED",
                    "severity": "CRITICAL",
                    "domain": domain,
                    "unauthorized_issuer": entry["issuer"],
                    "cert_serial": entry.get("serial"),
                    "ct_log_timestamp": entry.get("timestamp")
                }
                rogue_certs_found.append(alert)
                print(f"  [!] CT ALERT CRITIQUE: Certificat frauduleux pour '{domain}' émis par '{entry['issuer']}'")
        
        if not rogue_certs_found:
            print(f"  [+] CT Monitor: Aucun certificat frauduleux détecté pour '{domain}'. ✅")
        return rogue_certs_found

# Démonstration Certificate Revocation Engine
engine = CertRevocationEngine("Paradis International Bank CA")
print("=== CERTIFICATE REVOCATION & CT MONITORING ENGINE ===")

# 1. Révocations
engine.revoke_certificate(1234567890, "KEY_COMPROMISE")
engine.revoke_certificate(9876543210, "AFFILIATION_CHANGED")

# 2. Génération CRL
crl = engine.simulate_crl_generation()

# 3. Vérification OCSP
engine.simulate_ocsp_response(1234567890)  # Révoqué
engine.simulate_ocsp_response(1111111111)  # Valide

# 4. Monitoring CT Logs (Simulation de détection de certificat frauduleux)
ct_log_entries = [
    {"domain": "api.paradis-bank.com", "issuer": "Paradis International Bank CA", "serial": "A1B2", "timestamp": "2026-08-09T18:00:00Z"},
    {"domain": "api.paradis-bank.com", "issuer": "ROGUE-CA-ATTACKER-LTD", "serial": "X9Y8", "timestamp": "2026-08-09T22:00:00Z"},
]
alerts = engine.monitor_ct_log_for_rogue_certs(
    domain="api.paradis-bank.com",
    authorized_issuers=["Paradis International Bank CA"],
    ct_entries=ct_log_entries
)
```

---

## 3) Module — Fiche Technique OCSP Stapling & Must-Staple (2h)

```nginx
# CONFIGURATION NGINX — OCSP STAPLING OPTIMAL (TLS 1.3)

server {
    listen 443 ssl http2;
    server_name api.paradis-bank.com;

    ssl_certificate      /etc/ssl/certs/api.paradis-bank.com.fullchain.pem;
    ssl_certificate_key  /etc/ssl/private/api.paradis-bank.com.key;

    # OCSP Stapling : Nginx récupère & met en cache la réponse OCSP (NIST recommandé)
    ssl_stapling         on;
    ssl_stapling_verify  on;

    # Chaîne complète de confiance pour validation OCSP
    ssl_trusted_certificate /etc/ssl/certs/paradis-bank-chain.pem;

    # Cache OCSP Staple côté serveur (durée: 1 heure)
    ssl_stapling_file   /var/cache/nginx/ocsp-cache.der;

    # Activer Must-Staple dans le certificat TLS (via openssl.cnf extension)
    # Extension X.509 TLS Feature: status_request = 5 (TLS Feature Must-Staple RFC 7633)
}
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CRL** | Certificate Revocation List — Liste signée par la CA des certificats révoqués |
| **OCSP** | Online Certificate Status Protocol — Protocole de vérification en temps réel du statut d'un certificat |
| **OCSP Stapling** | Optimisation TLS permettant au serveur de pré-inclure la réponse OCSP dans le Handshake |
| **CT Logs** | Certificate Transparency Logs — Journaux publics et immuables des certificats X.509 émis |
| **Must-Staple** | Extension X.509 (RFC 7633) obligeant le serveur à fournir une réponse OCSP dans chaque Handshake TLS |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle est la principale limitation des **Certificate Revocation Lists (CRL)** par rapport au protocole **OCSP** ?
- A) Les CRL peuvent atteindre des tailles de plusieurs mégaoctets et ne sont mises à jour qu'à intervalles fixés (souvent 24h à 7 jours), créant une fenêtre de vulnérabilité pendant laquelle un certificat révoqué peut encore être accepté
- B) Les CRL ne peuvent contenir qu'un seul certificat
- C) Les CRL utilisent uniquement le protocole UDP
- D) Les CRL ne fonctionnent qu'avec les certificats RSA-512

**Réponse : A**

**Q2 :** Comment l'**OCSP Stapling** résout-il le problème de vie privée de l'OCSP standard ?
- A) Le serveur TLS récupère et signe en cache la réponse OCSP de la CA, puis l'inclut directement dans le Handshake TLS — le client n'a plus besoin de contacter le OCSP Responder, évitant la divulgation des sites visités
- B) En supprimant l'étape de vérification OCSP
- C) En chiffrant les requêtes OCSP
- D) En envoyant la réponse OCSP par email

**Réponse : A**

**Q3 :** Quel est l'objectif des journaux de **Certificate Transparency (CT Logs)** dans l'écosystème PKI Web ?
- A) Fournir un registre public, immuable et auditable de tous les certificats X.509 émis, permettant la détection rapide de certificats frauduleux ou non autorisés (ex: émission par une CA compromise)
- B) Stocker les clés privées des serveurs
- C) Remplacer le protocole OCSP
- D) Générer les certificats automatiquement

**Réponse : A**

**Q4 :** Que garantit l'extension **TLS Must-Staple (RFC 7633)** dans un certificat TLS serveur ?
- A) Que le serveur TLS est obligé de fournir une réponse OCSP valide agrafée (Stapled) lors de chaque Handshake TLS, sous peine de rejet par le navigateur
- B) Que le certificat est valide indéfiniment
- C) Que le site est disponible 24h/24
- D) Que le certificat est gratuit

**Réponse : A**

**Q5 :** Quelle configuration Nginx est requise pour activer l'OCSP Stapling sur un serveur TLS ?
- A) `ssl_stapling on; ssl_stapling_verify on;` avec la chaîne de confiance complète spécifiée via `ssl_trusted_certificate`
- B) `ssl_ocsp_cache on;`
- C) `ssl_revocation on;`
- D) `ssl_crl /etc/ssl/crl.pem;`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
