# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 450 (6h) : Projet Intégrateur Semestre 9 — Architecture Cryptographique Complète : PKI d'Entreprise, HSM, Zero-Trust Crypto & Post-Quantum Readiness

> [!NOTE]
> **Objectifs pédagogiques :**
> - Concevoir et déployer une **PKI d'Entreprise Multi-Niveaux** complète (Root CA offline, Intermediate CA, Issuing CA) avec CFSSL et vault PKI
> - Intégrer un **HSM (Hardware Security Module)** logiciel SoftHSM2 comme backend de clés pour la CA
> - Architecturer une solution **Zero-Trust Cryptographique** : mTLS inter-services, SPIFFE/SPIRE, certificate workload identity
> - Planifier la **migration Post-Quantum** : inventaire des usages cryptographiques, plan de migration CRYSTALS-Kyber/Dilithium, PQC-readiness assessment
>
> **Compétences visées :** `SEC-04` (A) — PKI d'Entreprise & HSM, `SEC-06` (A) — Zero-Trust & Post-Quantum Readiness

---

## Module 1 — PKI Multi-Niveaux avec Vault PKI & SoftHSM2 (2h)

### 📖 Intuition & Narration

Une PKI d'entreprise de classe industrielle ne consiste PAS en un `openssl req -new -x509 -self-signed`. Elle s'articule en une **hiérarchie de confiance à plusieurs niveaux** dont la sécurité est proportionnelle à la criticité : la clé Root CA n'est JAMAIS en ligne (air-gap), les Issuing CAs délivrent les certificats quotidiens, et les HSMs protègent physiquement les clés maîtres.

```
HIÉRARCHIE PKI D'ENTREPRISE PARADIS

  [Root CA — OFFLINE / AIR-GAPPED]     Durée : 20 ans / RSA-4096 ou ED448
           │  (Stockée sur HSM physique dans un coffre-fort)
           ▼
  [Intermediate CA — RESTRICTED]        Durée : 10 ans / EC P-384
           │  (Serveur dédié, HSM logiciel SoftHSM2 ou Entrust)
           ▼
  [Issuing CA — ONLINE / Vault PKI]     Durée : 5 ans / EC P-256
           │  (HashiCorp Vault cluster HA, intégré au pipeline CI/CD)
           ├── Certificats Serveurs TLS (1 an, rotation auto)
           ├── Certificats Clients mTLS (90 jours, rotation SPIRE)
           └── Certificats Développeurs (180 jours, signature code)
```

### 🛠️ Atelier Pratique — Configuration PKI Vault avec SoftHSM2

```bash
#!/usr/bin/env bash
# PARADIS — Initialisation PKI Vault avec SoftHSM2 comme backend HSM
set -euo pipefail

# 1. Initialisation SoftHSM2 (simulation HSM PKCS#11)
softhsm2-util --init-token --slot 0 \
  --label "PARADIS-ROOT-CA" \
  --pin "SecureVaultPin2024!" \
  --so-pin "SecureSOPin2024!"

echo "[+] Token SoftHSM2 initialisé"

# 2. Démarrage Vault avec backend PKCS#11 (SoftHSM2)
# vault.hcl — Configuration Vault avec HSM seal
cat > /etc/vault.d/vault.hcl << 'EOF'
ui = true
storage "raft" {
  path    = "/opt/vault/data"
  node_id = "vault-paradis-01"
}
listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_cert_file = "/etc/vault.d/tls/vault.crt"
  tls_key_file  = "/etc/vault.d/tls/vault.key"
}
# Seal HSM PKCS#11 — Unseal automatique via HSM (pas de Shamir manual unseal)
seal "pkcs11" {
  lib            = "/usr/lib/softhsm/libsofthsm2.so"
  slot           = "0"
  pin            = "SecureVaultPin2024!"
  key_label      = "vault-unseal-key"
  hmac_key_label = "vault-hmac-key"
  generate_key   = "true"
}
EOF

# 3. Configuration de la PKI Vault — Root CA
vault secrets enable -path=pki_root pki
vault secrets tune -max-lease-ttl=175200h pki_root

# Générer la Root CA (ou importer depuis HSM physique)
vault write -field=certificate pki_root/root/generate/internal \
  common_name="PARADIS Enterprise Root CA" \
  key_type="ec" \
  key_bits="384" \
  ttl="175200h" | tee /etc/ssl/paradis/root-ca.crt

# 4. Configuration de l'Issuing CA
vault secrets enable -path=pki_int pki
vault secrets tune -max-lease-ttl=43800h pki_int

vault write -format=json pki_int/intermediate/generate/internal \
  common_name="PARADIS Issuing CA v1" \
  key_type="ec" key_bits="256" | \
  jq -r '.data.csr' > /tmp/pki_int.csr

vault write -format=json pki_root/root/sign-intermediate \
  csr=@/tmp/pki_int.csr \
  format=pem_bundle ttl="43800h" | \
  jq -r '.data.certificate' > /etc/ssl/paradis/issuing-ca.crt

vault write pki_int/intermediate/set-signed \
  certificate=@/etc/ssl/paradis/issuing-ca.crt

# 5. Rôle d'émission pour les microservices
vault write pki_int/roles/paradis-microservices \
  allowed_domains="paradis.internal,paradis.svc.cluster.local" \
  allow_subdomains=true \
  key_type="ec" key_bits="256" \
  max_ttl="2160h"   # 90 jours max pour certificats workload

echo "[+] PKI Vault opérationnelle — Rôle 'paradis-microservices' configuré"

# 6. Émission d'un certificat mTLS pour un microservice
vault write -format=json pki_int/issue/paradis-microservices \
  common_name="payment-service.paradis.svc.cluster.local" \
  ttl="720h" | \
  jq -r '.data.certificate' > /tmp/payment-service.crt

echo "[+] Certificat mTLS généré pour payment-service (30 jours)"
```

---

## Module 2 — Zero-Trust Cryptographique avec SPIFFE/SPIRE (2h)

### 🔍 Anatomie Technique — Architecture SPIFFE/SPIRE

```
SPIFFE/SPIRE — WORKLOAD IDENTITY CRYPTOGRAPHIQUE (ZERO-TRUST)

  SPIFFE ID (Uniform Resource Name unique par workload) :
  spiffe://paradis.internal/ns/payments/sa/payment-service
  spiffe://paradis.internal/ns/analytics/sa/reporting-worker

  FLUX SPIRE COMPLET :
  ─────────────────────────────────────────────────────────────────
  1. [SPIRE Agent]  s'authentifie auprès du [SPIRE Server] via Node Attestation
     (Attestation via metadata cloud AWS IMDSv2 / Kubernetes kubelet API)

  2. [SPIRE Server] délivre un SVID (SPIFFE Verifiable Identity Document) :
     ├── X.509-SVID : Certificat TLS avec SAN = spiffe://paradis.internal/...
     └── JWT-SVID   : Token JWT signé avec claims SPIFFE

  3. [SPIRE Agent]  expose les SVIDs via la Workload API (Unix socket /tmp/spire-agent.sock)

  4. [Microservice] récupère son SVID automatiquement via le SDK SPIFFE-GO
     ──▶ Rotation automatique du certificat avant expiration (sans redémarrage !)

  5. [mTLS inter-services] : Service A présente son X.509-SVID à Service B
     ──▶ Service B vérifie que le SPIFFE ID est dans sa whitelist d'autorisation
     ──▶ ZERO-TRUST : Chaque service prouve son identité cryptographiquement à chaque appel
```

---

## Module 3 — Post-Quantum Readiness Assessment (1h30)

### 🔍 Plan de Migration Post-Quantum PARADIS

```
POST-QUANTUM READINESS — ÉTAT DES USAGES CRYPTOGRAPHIQUES PARADIS

  INVENTAIRE DES RISQUES (Harvest-Now, Decrypt-Later) :
  ─────────────────────────────────────────────────────
  RISQUE IMMÉDIAT (données à long terme sensibles > 10 ans) :
  ├── [CRITIQUE] Échanges de clés TLS RSA-2048 / ECDH P-256  ──▶ Vulnérables Shor
  ├── [CRITIQUE] Signatures RSA-2048 des certificats Root CA  ──▶ Vulnérables Shor
  └── [CRITIQUE] Chiffrement PGP/S-MIME des emails critiques  ──▶ Vulnérables Shor

  PLAN DE MIGRATION PARADIS (NIST FIPS 203/204/205) :
  ────────────────────────────────────────────────────
  Phase 1 (2024-2025) — Hybride PQC+Classique :
  ├── TLS 1.3 + ECDH X25519 + ML-KEM-768 (Kyber3) en hybrid KEM
  └── Signatures : ECDSA P-384 + ML-DSA-65 (Dilithium3) en hybrid

  Phase 2 (2026-2027) — PQC Natif :
  ├── Remplacer tous les certificats RSA par ML-DSA-65/ML-DSA-87
  └── Remplacer tous les échanges de clés ECDH par ML-KEM-768/1024

  Phase 3 (2028+) — Retrait classique :
  └── Désactiver totalement RSA-2048, ECDH P-256, ECDSA P-256
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SPIFFE** | Secure Production Identity Framework For Everyone — Standard d'identité cryptographique de workloads |
| **SVID** | SPIFFE Verifiable Identity Document — Certificat X.509 ou JWT portant l'identité SPIFFE d'un service |
| **PKCS#11** | Interface standard d'accès aux HSMs (Hardware Security Modules) et tokens cryptographiques |
| **ML-KEM** | Module-Lattice Key Encapsulation Mechanism — Algorithme PQC (CRYSTALS-Kyber standardisé NIST FIPS 203) |
| **ML-DSA** | Module-Lattice Digital Signature Algorithm — Algorithme PQC (CRYSTALS-Dilithium standardisé NIST FIPS 204) |

---

## Exercices Pratiques

### Exercice 1 — Architecture PKI pour une Fusion d'Entreprise

Lors d'une fusion-acquisition, PARADIS doit intégrer la PKI de Société B dans son infrastructure. Société B utilise une Root CA auto-signée avec RSA-2048, 5 ans de validité, stockée directement sur le serveur PKI (pas de HSM). Le certificat Root CA expire dans 8 mois.

**Question :** Proposez un plan d'urgence complet incluant : (1) évaluation des risques immédiats, (2) plan de migration vers la PKI PARADIS, (3) politique de trust pendant la transition.

**Corrigé guidé :**
1. **Risques immédiats** : RSA-2048 insuffisant (minimum RSA-4096 ou EC P-384 exigé), clé Root CA non protégée par HSM (risque vol/extraction), expiration imminente dans 8 mois sans plan de renouvellement.
2. **Plan de migration (12 semaines)** :
   - S1-S2 : Inventaire de TOUS les certificats émis par Société B (CT logs, scan réseau, Venafi/Keyfactor).
   - S3-S4 : Mise en place d'une Cross-Certification : la Intermediate CA PARADIS signe la Root B (bridge de confiance temporaire).
   - S5-S8 : Re-émission progressive de tous les certificats Société B sous la PKI PARADIS (Issuing CA Vault).
   - S9-S12 : Révocation et retrait de confiance de la Root CA Société B.
3. **Trust policy** : Ajout de la Root CA Société B dans le trust store PARADIS temporairement, avec CRL/OCSP monitoring actif, révoquée automatiquement en semaine 12.

---

## Banque QCM — 5 Questions

**Q1.** Dans une PKI d'entreprise, la **Root CA** doit être :

- A) Accessible en ligne 24/7 pour émettre les certificats quotidiens
- B) Conservée strictement hors ligne (air-gapped), protégée par HSM physique, n'émettant que les certificats des Intermediate CAs ✅
- C) Hébergée sur un serveur Windows Server 2022 standard
- D) Renouvelée tous les 6 mois pour maximiser la sécurité

**Q2.** SPIFFE/SPIRE permet de résoudre le problème suivant dans un environnement microservices :

- A) L'accélération des requêtes HTTP avec du cache distribué
- B) L'attribution automatique d'une identité cryptographique vérifiable (SVID) à chaque workload, éliminant les secrets statiques et les mots de passe inter-services ✅
- C) La compression des logs applicatifs
- D) La gestion des secrets applicatifs stockés en clair dans les ConfigMaps Kubernetes

**Q3.** L'interface **PKCS#11** est utilisée pour :

- A) Définir la structure d'un certificat X.509
- B) Standardiser la communication entre les applications logicielles et les HSMs ou tokens cryptographiques matériels ✅
- C) Configurer les règles de pare-feu iptables
- D) Signer les packages RPM

**Q4.** L'algorithme **ML-KEM-768 (CRYSTALS-Kyber)** standardisé dans NIST FIPS 203 est destiné à :

- A) Remplacer les algorithmes de hachage SHA-256
- B) Remplacer les échanges de clés ECDH/RSA dans les protocoles TLS, SSH, Signal, résistant à l'attaque de Shor sur les ordinateurs quantiques ✅
- C) Chiffrer les disques durs avec BitLocker
- D) Générer des tokens JWT

**Q5.** La stratégie **"Harvest Now, Decrypt Later"** représente le risque suivant :

- A) Des attaquants volent des données non structurées sans objectif
- B) Des attaquants adversaires enregistrent aujourd'hui des communications chiffrées avec des algorithmes classiques, pour les déchiffrer dans le futur avec un ordinateur quantique suffisamment puissant ✅
- C) Des attaquants compromettent les HSMs physiques via un accès physique
- D) Des attaquants accèlèrent la dépréciation TLS pour forcer un downgrade

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
