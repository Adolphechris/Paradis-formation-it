# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 583 (6h) : Révision Intensive Semestres 9–10 — Cryptographie, PKI, Zero-Trust & MLOps/LLM

> [!NOTE]
> **Objectifs pédagogiques :**
> - Consolider les fondamentaux de la **Cryptographie moderne** : AES-GCM, RSA-OAEP, ECDSA, courbes elliptiques, protocole TLS 1.3
> - Réviser l'architecture **PKI (Public Key Infrastructure)** : CA hiérarchique, certificats X.509, révocation OCSP/CRL, CT Logs
> - Maîtriser les architectures **Zero-Trust** : SPIFFE/SPIRE, mTLS, BeyondCorp, microsegmentation
> - Revoir le cycle **MLOps complet** : Feature Engineering → Training → Serving → Monitoring (Drift, Retraining)
>
> **Compétences visées :** `SEC-02` (A), `SEC-03` (A), `AI-03` (A) — Cryptographie, PKI, Zero-Trust, MLOps

---

## Module 1 — Cryptographie & PKI (2h)

### 📖 Récapitulatif Cryptographie S9

```
CRYPTOGRAPHIE SYMÉTRIQUE vs ASYMÉTRIQUE

  SYMÉTRIQUE — UNE CLÉ PARTAGÉE
  ┌─────────────────────────────────────────────────────────────┐
  │  AES-256-GCM (Galois/Counter Mode)                         │
  │  → Chiffrement + Authentification (AEAD) en un seul algo  │
  │  → IV/Nonce 96 bits OBLIGATOIRE aléatoire (ne jamais réutiliser!) │
  │  → Tag d'authentification 128 bits → garantit l'intégrité  │
  │  → Vitesse : ~10 Gbps sur CPU moderne (AES-NI)            │
  │                                                             │
  │  ChaCha20-Poly1305                                          │
  │  → Alternative AES pour devices sans AES-NI (ARM IoT)     │
  └─────────────────────────────────────────────────────────────┘

  ASYMÉTRIQUE — PAIRE CLÉS PUBLIQUE/PRIVÉE
  ┌─────────────────────────────────────────────────────────────┐
  │  RSA-4096 + OAEP (chiffrement) / PSS (signature)          │
  │  → Slow (~1 ms/opération) — Utilisé uniquement pour       │
  │    l'échange de clés ou la signature, JAMAIS le bulk data  │
  │                                                             │
  │  ECDSA P-256 / Ed25519 (signature)                         │
  │  → Équivalent RSA-3072 en sécurité, 10x plus rapide       │
  │  → Ed25519 : résistant aux attaques de timing (constant-time) │
  │                                                             │
  │  ECDH / X25519 (échange de clés)                           │
  │  → TLS 1.3 utilise X25519 par défaut pour le Key Exchange  │
  └─────────────────────────────────────────────────────────────┘

  TLS 1.3 HANDSHAKE (Optimisé — 1 Round-Trip)
  Client ────► ClientHello (Key Share X25519, Cipher Suites)
  Server ◄──── ServerHello + Certificate + CertificateVerify + Finished
  Client ────► Finished + [Application Data]
  (UNIQUEMENT 1 RTT contre 2 RTT pour TLS 1.2)
```

### 🔍 PKI — Infrastructure à Clés Publiques

```
HIÉRARCHIE PKI ENTREPRISE

  ┌─────────────────────────────────────────────────────────────┐
  │  ROOT CA (hors ligne — HSM — coffre-fort physique)         │
  │  Durée de vie : 20 ans | Clé RSA-4096 ou ECDSA P-384      │
  └────────────────────┬────────────────────────────────────────┘
                       │ signe (Offline — 1×/an max)
  ┌────────────────────▼────────────────────────────────────────┐
  │  Intermediate CA (en ligne — HSM connecté)                  │
  │  Durée de vie : 5 ans | Émet les certificats feuilles       │
  └────────────────────┬────────────────────────────────────────┘
                       │ signe (Quotidien)
  ┌────────────────────▼────────────────────────────────────────┐
  │  Leaf Certificates (serveurs, clients, code signing)        │
  │  Durée de vie : max 398 jours (Chrome policy depuis 2020)   │
  │  SAN (Subject Alternative Names) : multi-domaines          │
  └─────────────────────────────────────────────────────────────┘

  RÉVOCATION :
  CRL (Certificate Revocation List) : Fichier téléchargeable — polling > 24h
  OCSP (Online Certificate Status Protocol) : Requête temps réel (latence ~5ms)
  OCSP Stapling : Le serveur cache et présente la réponse OCSP → 0 latence client

  CERTIFICATE TRANSPARENCY (CT Logs) :
  Obligation légale (Chrome) que tout certificat TLS public soit enregistré
  dans un CT Log (Merkle Tree append-only) — Permet détection de misissuance.
```

---

## Module 2 — Zero-Trust & MLOps (2h)

### 🔍 Architecture Zero-Trust — BeyondCorp & SPIFFE/SPIRE

```
ZERO-TRUST ARCHITECTURE — PRINCIPES FONDAMENTAUX

  "Never Trust, Always Verify"
  "Assume Breach"
  "Verify Explicitly, Use Least Privilege Access, Assume Breach"
  (Microsoft Zero Trust Pillars)

  SPIFFE / SPIRE — Identité de Charge de Travail (Workload Identity)
  ┌──────────────────────────────────────────────────────────────────┐
  │  SPIFFE = Secure Production Identity Framework for Everyone      │
  │  SPIRE  = SPIFFE Runtime Environment — Implémentation de référence│
  │                                                                  │
  │  Chaque microservice reçoit un SVID (SPIFFE Verifiable Identity  │
  │  Document) sous forme de certificat X.509 à durée de vie courte │
  │  (1h – 24h), renouvelé automatiquement par l'agent SPIRE.       │
  │                                                                  │
  │  Exemple SPIFFE ID : spiffe://cluster.local/ns/payment/sa/api   │
  │                                                                  │
  │  mTLS (Mutual TLS) : Les deux parties (client ET serveur)       │
  │  présentent et valident leurs certificats SVID → authentification│
  │  bidirectionnelle sans passwords ni API keys statiques.         │
  └──────────────────────────────────────────────────────────────────┘

  MICROSEGMENTATION :
  Réseau traditionnel : périmètre = firewall à la frontière
  Zero-Trust         : firewall par pod / workload / service
  → Istio Service Mesh : AuthorizationPolicy (Allow/Deny par service)
```

### 🔍 MLOps — Cycle de Vie Complet du Modèle ML

```
CYCLE DE VIE MLOPS — PARADIS PLATFORM

  1. DATA INGESTION → Feature Store (Feast) → Feature Pipeline
     └── Prévention Data Leakage : Point-in-time lookup
  2. EXPERIMENT TRACKING → MLflow Tracking (runs, metrics, params)
  3. MODEL TRAINING → GPU Cluster (K8s + NVIDIA Device Plugin)
  4. MODEL REGISTRY → MLflow Registry (Staging → Production)
  5. MODEL SERVING → BentoML / TorchServe (REST API, gRPC)
     └── SLA : P99 < 100ms
  6. MONITORING → Evidently AI (Data Drift + Model Drift)
     └── PSI (Population Stability Index) > 0.2 → alerte
     └── KS Test (Kolmogorov-Smirnov) p-value < 0.05 → alerte
  7. RETRAINING TRIGGER → Automatique si drift > seuil

  MÉTRIQUES CLÉS MLOps :
  ┌────────────────────────────────────────────────────────────┐
  │ Model Accuracy (Validation) : seuil > 92%                 │
  │ Data Drift (PSI)            : seuil < 0.1 (stable)        │
  │ Serving Latency P99         : < 100 ms                    │
  │ Throughput                  : > 1000 req/s par réplica    │
  │ Retraining Frequency        : Mensuel (ou sur drift alert) │
  └────────────────────────────────────────────────────────────┘
```

---

## Module 3 — Atelier Pratique : Crypto Primitives & MLOps Monitor (1h30)

### 🛠️ Script Python : TLS Certificate Inspector & Model Drift Detector

```python
#!/usr/bin/env python3
"""
PARADIS — TLS Certificate Inspector & ML Model Drift Detector (Révision S9-S10)
"""
import ssl
import socket
import datetime
import hashlib
import os
import statistics
from typing import Dict, Any, List, Tuple

# ─── PARTIE 1 : TLS Certificate Inspector ────────────────────────────────────

class TLSCertInspector:
    """Inspecte le certificat TLS d'un serveur — Révision PKI S9"""

    def inspect(self, hostname: str, port: int = 443, timeout: float = 5.0) -> Dict[str, Any]:
        ctx = ssl.create_default_context()
        try:
            with socket.create_connection((hostname, port), timeout=timeout) as sock:
                with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert      = ssock.getpeercert()
                    cipher    = ssock.cipher()
                    tls_version = ssock.version()
        except Exception as e:
            return {"error": str(e), "hostname": hostname}

        # Calcul des jours avant expiration
        not_after_str = cert.get("notAfter", "")
        try:
            not_after = datetime.datetime.strptime(not_after_str, "%b %d %H:%M:%S %Y %Z")
            days_remaining = (not_after - datetime.datetime.utcnow()).days
        except ValueError:
            days_remaining = -1

        # Extraction SAN
        san_list = [v for t, v in cert.get("subjectAltName", []) if t == "DNS"]

        # Extraction Subject
        subject = {k: v for rdns in cert.get("subject", []) for k, v in rdns}

        return {
            "hostname"         : hostname,
            "common_name"      : subject.get("commonName", "N/A"),
            "sans"             : san_list[:5],  # Premiers 5 SANs
            "issuer"           : {k: v for rdns in cert.get("issuer", []) for k, v in rdns}.get("organizationName", "N/A"),
            "not_after"        : not_after_str,
            "days_remaining"   : days_remaining,
            "tls_version"      : tls_version,
            "cipher_suite"     : cipher[0] if cipher else "N/A",
            "key_bits"         : cipher[2] if cipher else "N/A",
            "cert_ok"          : days_remaining > 30,
            "tls_modern"       : tls_version in ("TLSv1.3", "TLSv1.2")
        }

    def print_report(self, info: dict):
        if "error" in info:
            print(f"  ❌ Erreur inspection {info['hostname']} : {info['error']}")
            return
        days_icon = "🟢" if info["days_remaining"] > 60 else "🟡" if info["days_remaining"] > 30 else "🔴"
        tls_icon  = "🟢" if info["tls_modern"] else "🔴"
        print(f"  🔒 {info['hostname']}")
        print(f"     CN          : {info['common_name']}")
        print(f"     SANs        : {', '.join(info['sans'])}")
        print(f"     Émetteur    : {info['issuer']}")
        print(f"     Expiration  : {info['not_after']}  {days_icon} {info['days_remaining']}j restants")
        print(f"     TLS Version : {info['tls_version']}  {tls_icon}")
        print(f"     Cipher      : {info['cipher_suite']} ({info['key_bits']} bits)")


# ─── PARTIE 2 : Model Drift Detector ─────────────────────────────────────────

class ModelDriftDetector:
    """
    Détecteur de Data Drift pour MLOps — Révision S10
    Implémente PSI (Population Stability Index) simplifié.
    """

    @staticmethod
    def compute_psi(reference: List[float], current: List[float], bins: int = 10) -> float:
        """
        PSI = Σ (Actual% − Expected%) × ln(Actual% / Expected%)
        PSI < 0.1  : Pas de drift (stable)
        PSI 0.1–0.2 : Drift modéré (surveillance)
        PSI > 0.2   : Drift significatif (retraining requis)
        """
        min_val  = min(min(reference), min(current))
        max_val  = max(max(reference), max(current))
        edges    = [min_val + i * (max_val - min_val) / bins for i in range(bins + 1)]

        def hist(data):
            counts = [0] * bins
            for val in data:
                for i in range(bins):
                    if edges[i] <= val < edges[i + 1]:
                        counts[i] += 1
                        break
                else:
                    counts[-1] += 1
            total = sum(counts)
            return [max(c / total, 1e-4) for c in counts]  # Éviter division par 0

        ref_pct = hist(reference)
        cur_pct = hist(current)

        import math
        psi = sum((cur_pct[i] - ref_pct[i]) * math.log(cur_pct[i] / ref_pct[i])
                  for i in range(bins))
        return round(psi, 4)

    @staticmethod
    def interpret_psi(psi: float) -> str:
        if psi < 0.1:
            return "🟢 STABLE — Pas d'action requise"
        elif psi < 0.2:
            return "🟡 DRIFT MODÉRÉ — Surveiller de près"
        else:
            return "🔴 DRIFT SIGNIFICATIF — Retraining requis"


if __name__ == "__main__":
    import random
    random.seed(0)

    print("=== PARADIS — TLS INSPECTOR & MLOps DRIFT DETECTOR ===\n")

    # 1. Inspection TLS (simulée car peut échouer en sandbox)
    inspector = TLSCertInspector()
    print("📋 INSPECTION TLS :")
    try:
        info = inspector.inspect("google.com", 443, timeout=3.0)
        inspector.print_report(info)
    except Exception as e:
        print(f"  (Simulation — pas d'accès réseau dans sandbox): {e}")

    # 2. Détection Drift
    print("\n📊 ML MODEL DRIFT DETECTION :")
    detector = ModelDriftDetector()

    # Distribution de référence (entraînement)
    reference_scores = [random.gauss(0.7, 0.1) for _ in range(1000)]

    # Distribution actuelle — légèrement driftée
    current_stable  = [random.gauss(0.71, 0.11) for _ in range(1000)]
    current_drifted = [random.gauss(0.45, 0.18) for _ in range(1000)]

    psi_stable  = detector.compute_psi(reference_scores, current_stable)
    psi_drifted = detector.compute_psi(reference_scores, current_drifted)

    print(f"  Feature 'score_confiance' :")
    print(f"    Baseline → Production stable  : PSI={psi_stable:.4f}  {detector.interpret_psi(psi_stable)}")
    print(f"    Baseline → Production driftée : PSI={psi_drifted:.4f}  {detector.interpret_psi(psi_drifted)}")
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SVID** | SPIFFE Verifiable Identity Document — Certificat X.509 ou JWT d'identité de workload |
| **PSI** | Population Stability Index — Métrique de détection de data drift en MLOps |
| **CT Log** | Certificate Transparency Log — Journal public Merkle Tree des certificats TLS |
| **OCSP Stapling** | Mécanisme par lequel le serveur inclut une réponse OCSP signée dans le handshake TLS |
| **mTLS** | Mutual TLS — Authentification TLS bidirectionnelle (client + serveur présentent un certificat) |

---

## Exercices Pratiques

### Exercice 1 — Analyse de Handshake TLS 1.3

Un client se connecte à un serveur HTTPS. Voici les échanges capturés :

1. `ClientHello` : propose X25519 pour le Key Exchange, TLS_AES_256_GCM_SHA384 comme cipher suite.
2. `ServerHello` : accepte X25519 et TLS_AES_256_GCM_SHA384.
3. `Certificate` + `CertificateVerify` (ECDSA P-256) + `Finished`.
4. Client envoie `Finished` puis des données chiffrées.

**Questions :**
1. Combien de round-trips ce handshake TLS 1.3 nécessite-t-il (vs TLS 1.2) ?
2. Quel algorithme protège la confidentialité des données échangées après le handshake ?
3. Comment la clé de session AES est-elle négociée de manière confidentielle (PFS) ?

**Corrigé :**
1. **1 Round-Trip (1-RTT)** contre 2 RTT pour TLS 1.2. En TLS 1.3 0-RTT (session resumption), c'est même 0 RTT.
2. **AES-256-GCM** : chiffrement symétrique AEAD avec confidentialité + intégrité.
3. Via **ECDH X25519** : le client et le serveur échangent leurs clés publiques éphémères X25519 dès le ClientHello/ServerHello. Le secret partagé est dérivé sans jamais être transmis → **Perfect Forward Secrecy (PFS)** : même si la clé privée du serveur est compromise plus tard, les sessions passées restent confidentielles.

---

## Banque QCM — 5 Questions

**Q1.** Pourquoi le **nonce/IV** dans AES-GCM ne doit-il **jamais être réutilisé** avec la même clé ?

- A) Parce que cela ralentit le chiffrement.
- B) La réutilisation d'un nonce avec la même clé en GCM permet à un attaquant de récupérer la clé d'authentification et de forger des messages — catastrophe de sécurité complète. ✅
- C) Parce que le RGPD l'interdit.
- D) Cela provoque des erreurs de déchiffrement.

**Q2.** Quelle est la durée de vie maximale d'un certificat TLS public depuis la politique Chrome 2020 ?

- A) 5 ans
- B) 2 ans
- C) 398 jours ✅
- D) 30 jours

**Q3.** Dans l'architecture **SPIFFE/SPIRE**, qu'est-ce qu'un **SVID** ?

- A) Un algorithme de chiffrement.
- B) Un document d'identité cryptographique (certificat X.509 ou JWT) émis automatiquement à chaque workload (pod/service) pour s'authentifier mutuellement via mTLS. ✅
- C) Un outil de scanning de vulnérabilités.
- D) Un protocole de communication réseau.

**Q4.** Un **PSI (Population Stability Index) de 0.25** pour une feature de prédiction de crédit indique :

- A) Que le modèle est très stable.
- B) Que la distribution de la feature en production a significativement divergé par rapport à la baseline d'entraînement — un retraining du modèle est requis. ✅
- C) Que l'accuracy du modèle est de 25%.
- D) Que 25% des prédictions sont incorrectes.

**Q5.** Quelle propriété cryptographique garantit que la **compromission future de la clé privée d'un serveur** ne permet pas de déchiffrer les sessions passées ?

- A) AES-256-GCM
- B) RSA-4096
- C) Perfect Forward Secrecy (PFS) — via échange de clés éphémères ECDH/X25519 ✅
- D) SHA-256

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
