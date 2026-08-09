# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 409 (6h) : Key Management & Hardware Security Modules — HSM Architecture (FIPS 140-3), PKCS#11 API, Cloud KMS (AWS/Azure/GCP) & Key Ceremony Protocols

> [!NOTE]
> **Objectif du jour :** Maîtriser la **Gestion Sécurisée des Clés Cryptographiques (Key Management)** dans les environnements d'entreprise : comprendre l'architecture matérielle et la certification des **Hardware Security Modules (HSM — FIPS 140-3 Level 3)**, interagir avec un HSM via l'interface standard **PKCS#11 (Cryptoki)**, gérer les clés dans les services cloud natifs (**AWS KMS, Azure Key Vault, GCP Cloud KMS**) avec protection par **Customer-Managed Keys (CMK)**, et orchestrer une **Key Ceremony** formelle avec partage de secret M-of-N.
>
> **Compétences visées :** `KMS-01` (A) — HSM Architecture, FIPS 140-3 Certification Levels & PKCS#11 Cryptoki API | `KMS-02` (A) — Cloud KMS CMK Design (AWS/Azure/GCP), Key Ceremony Protocols & Shamir's Secret Sharing

---

## 1) Module — Architecture HSM & Niveaux FIPS 140-3 (2h)

### 📖 Narration/Intuition

Un **Hardware Security Module (HSM)** est un co-processeur cryptographique tamper-resistant qui exécute l'ensemble des opérations cryptographiques dans un environnement physiquement et logiquement protégé. La clé privée du Root CA ou la Master Key d'un gestionnaire de secrets **ne quitte jamais le périmètre sécurisé de l'HSM**.

```
  ┌─────────────────────────────────────────────────────────────────────┐
  │                   HSM ARCHITECTURE (LUNA SA 7)                      │
  └───────────────────────────────┬─────────────────────────────────────┘
                                  │
          ┌───────────────────────┴───────────────────────┐
          ▼                                               ▼
  ┌───────────────┐                             ┌────────────────────┐
  │ Cryptographic │                             │ Physical Tamper     │
  │ Core (ASIC)   │                             │ Detection & Response│
  │  - RSA-4096   │                             │  - Zéroisation auto │
  │  - AES-256    │                             │  - Alerte physique  │
  │  - ECDHE      │                             └────────────────────┘
  └───────┬───────┘
          │ PKCS#11 API (Cryptoki)
          ▼
  ┌───────────────┐
  │ HOST SYSTEM   │ ◄── Applications (CA, TLS, Code Signing)
  └───────────────┘
```

#### Niveaux de Certification FIPS 140-3

| Niveau FIPS 140-3 | Exigences de Sécurité | Cas d'Usage Typique |
|:---:|:---|:---|
| **Level 1** | Algorithmes validés, pas de protection physique | Logiciel / Bibliothèques crypto |
| **Level 2** | Level 1 + Tamper-evidence (étiquettes inviolables) | Cartes à puce, modules USB |
| **Level 3** | Level 2 + Tamper-response active (zéroisation des clés) | HSM réseau (Thales Luna, AWS CloudHSM) |
| **Level 4** | Level 3 + Enveloppe complète de protection environnementale | Top Secret Government / Militaire |

---

## 2) Module — Outillage Key Management Engine (`key_management_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import os
import json
import secrets
import hashlib
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Tuple

class KeyManagementEngine:
    """
    Moteur de gestion de clés cryptographiques entreprise :
    - Simulation PKCS#11 (Cryptoki) pour interaction HSM
    - Simulation Cloud KMS (AWS KMS / Azure Key Vault)
    - Protocole de Key Ceremony avec Shamir's Secret Sharing (M-of-N)
    """

    def __init__(self, hsm_label: str):
        self.hsm = hsm_label
        self.hsm_keystore: Dict[str, dict] = {}
        self.key_events_log: List[dict] = []

    def pkcs11_generate_aes_key(self, label: str, key_bits: int = 256, extractable: bool = False) -> dict:
        """
        Simule la génération d'une clé AES dans un HSM via l'API PKCS#11 (Cryptoki).
        CKM_AES_KEY_GEN — La clé ne quitte jamais le périmètre HSM (extractable=False).
        """
        key_id = hashlib.sha256(f"{label}_{key_bits}".encode()).hexdigest()[:16].upper()
        key_entry = {
            "label": label,
            "key_id": key_id,
            "type": "CKK_AES",
            "key_bits": key_bits,
            "extractable": extractable,
            "token": True,
            "sensitive": True,
            "hsm": self.hsm,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        self.hsm_keystore[label] = key_entry
        self.key_events_log.append({"event": "PKCS11_KEY_GEN", **key_entry})
        print(f"  [PKCS#11] C_GenerateKey(CKM_AES_KEY_GEN) → Label: '{label}' | Key-ID: {key_id} | Extractable: {extractable}")
        return key_entry

    def simulate_cloud_kms_create_key(self, provider: str, key_alias: str, algorithm: str = "SYMMETRIC_DEFAULT") -> dict:
        """
        Simule la création d'une Customer Managed Key (CMK) dans un Cloud KMS.
        AWS KMS: CreateKey | Azure Key Vault: CreateKey | GCP Cloud KMS: CreateCryptoKey
        """
        key_arn_map = {
            "AWS": f"arn:aws:kms:eu-west-1:123456789012:key/{secrets.token_hex(8)}",
            "Azure": f"https://paradis-vault.vault.azure.net/keys/{key_alias}/1",
            "GCP": f"projects/paradis-prod/locations/europe-west1/keyRings/paradis-ring/cryptoKeys/{key_alias}"
        }
        cmk = {
            "provider": provider,
            "key_alias": key_alias,
            "key_arn_or_id": key_arn_map.get(provider, "UNKNOWN"),
            "algorithm": algorithm,
            "key_rotation_enabled": True,
            "key_rotation_period_days": 365,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "key_material_origin": "AWS_KMS" if provider == "AWS" else f"{provider.upper()}_MANAGED"
        }
        self.key_events_log.append({"event": f"CLOUD_KMS_{provider}_CREATE_KEY", **cmk})
        print(f"  [CLOUD KMS {provider}] CMK créée: '{key_alias}' | ARN: {cmk['key_arn_or_id'][:40]}...")
        return cmk

    def shamir_key_ceremony_simulation(self, n_shares: int = 7, m_threshold: int = 4) -> dict:
        """
        Simule un protocole de Key Ceremony formel avec partage de secret M-of-N.
        (Implémentation pédagogique — en production, utiliser shamirs-secret-sharing ou Vault Shamir)
        Le secret maître (Master Key) est divisé en N parts, avec M parts minimales pour le reconstruire.
        """
        print(f"\n[*] DÉMARRAGE CÉRÉMONIE DE CLÉS : {n_shares} parts | Quorum requis: {m_threshold}")
        
        # Génération du secret maître simulé
        master_secret = os.urandom(32)
        master_secret_hex = master_secret.hex()

        # Distribution simulée des N fragments aux N gardiens (Custodians)
        share_holders = []
        for i in range(1, n_shares + 1):
            fragment = hashlib.sha256(f"{master_secret_hex}_FRAGMENT_{i}".encode()).hexdigest()
            holder = {
                "custodian_id": f"CUSTODIAN_{i:02d}",
                "fragment_index": i,
                "fragment_hash": fragment[:16] + "...",  # Valeur réelle remise physiquement
            }
            share_holders.append(holder)
            print(f"  [CEREMONY] Fragment {i}/{n_shares} → {holder['custodian_id']}")

        ceremony_record = {
            "ceremony_date": datetime.now(timezone.utc).isoformat(),
            "total_shares_n": n_shares,
            "quorum_threshold_m": m_threshold,
            "custodians": share_holders,
            "security_policy": f"Au moins {m_threshold} des {n_shares} gardiens sont requis pour accéder au secret maître"
        }
        print(f"\n[+] CÉRÉMONIE TERMINÉE : {n_shares} parts distribuées | Quorum M={m_threshold} requis")
        return ceremony_record

    def generate_key_lifecycle_report(self) -> dict:
        return {
            "hsm_name": self.hsm,
            "total_events": len(self.key_events_log),
            "keystore_size": len(self.hsm_keystore),
            "events": self.key_events_log
        }

# Démonstration Key Management Engine
kms = KeyManagementEngine("Thales Luna Network HSM SA 7 (FIPS 140-3 Level 3)")
print("=== KEY MANAGEMENT & HSM ENGINE ===")

# 1. Génération via PKCS#11
kms.pkcs11_generate_aes_key("PARADIS_ROOT_CA_MASTER_KEY", 256, extractable=False)
kms.pkcs11_generate_aes_key("PARADIS_TLS_DATA_ENCRYPTION_KEY", 256, extractable=False)

# 2. Cloud KMS Multi-Provider
kms.simulate_cloud_kms_create_key("AWS", "paradis-data-key", "SYMMETRIC_DEFAULT")
kms.simulate_cloud_kms_create_key("Azure", "paradis-secrets-key", "RSA-4096")

# 3. Key Ceremony M-of-N
ceremony = kms.shamir_key_ceremony_simulation(n_shares=7, m_threshold=4)
```

---

## 3) Module — Fiche de Comparaison HSM vs Cloud KMS (2h)

```markdown
# CHOIX ARCHITECTURAUX : HSM ON-PREMISES VS CLOUD KMS

| Critère | HSM On-Premises (Thales Luna) | AWS KMS (CMK) | Azure Key Vault Premium | GCP Cloud KMS |
|:---|:---:|:---:|:---:|:---:|
| **Certification FIPS** | FIPS 140-3 Level 3 | FIPS 140-3 Level 3 | FIPS 140-3 Level 3 | FIPS 140-3 Level 3 |
| **Contrôle Matériel** | ✅ Total | ❌ Délégué à AWS | ❌ Délégué à Azure | ❌ Délégué à GCP |
| **Latence** | 🚀 < 1ms | 🟡 ~5ms (réseau) | 🟡 ~5ms (réseau) | 🟡 ~5ms (réseau) |
| **Audit Log** | Logs locaux HSM | CloudTrail | Azure Monitor | Cloud Audit Logs |
| **Compliance RGPD** | ✅ Données EU garanties | 🟡 Région EU possible | 🟡 Région EU possible | 🟡 Région EU possible |
| **Rotation automatique** | Manuelle | ✅ Automatique | ✅ Automatique | ✅ Automatique |
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **HSM** | Hardware Security Module — Co-processeur cryptographique physiquement et logiquement protégé |
| **PKCS#11** | Public Key Cryptography Standard #11 — Interface standard (Cryptoki API) pour les HSMs |
| **KMS** | Key Management Service — Service Cloud de gestion centralisée des clés cryptographiques |
| **CMK** | Customer-Managed Key — Clé symétrique gérée par le client dans un Cloud KMS |
| **Zéroisation** | Processus de destruction immédiate et sécurisée d'une clé cryptographique dans un HSM en cas de détection de sabotage |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle est la différence fondamentale entre un HSM certifié **FIPS 140-3 Level 3** et un HSM de Level 2 ?
- A) Le Level 3 implémente une réponse active à la falsification (Tamper-Response) qui efface automatiquement les clés cryptographiques dès détection d'une tentative d'intrusion physique
- B) Le Level 3 est plus rapide que le Level 2
- C) Le Level 3 ne supporte que RSA
- D) Le Level 3 est un logiciel, le Level 2 est du matériel

**Réponse : A**

**Q2 :** Pourquoi l'interface **PKCS#11 (Cryptoki API)** est-elle fondamentale dans l'écosystème des HSMs ?
- A) Parce qu'elle fournit une interface standardisée et indépendante du fabricant permettant aux applications (CA, TLS, HSM Cloud) d'interagir avec n'importe quel HSM via des fonctions C_GenerateKey, C_Sign, C_Decrypt
- B) Parce qu'elle remplace l'interface HTTPS
- C) Parce qu'elle génère des clés Wi-Fi
- D) Parce qu'elle est propriétaire à Microsoft

**Réponse : A**

**Q3 :** Quelle propriété critique d'une clé PKCS#11 garantit que la clé privée ne quitte jamais le périmètre HSM ?
- A) L'attribut `CKA_SENSITIVE = TRUE` combiné avec `CKA_EXTRACTABLE = FALSE`
- B) L'attribut `CKA_LABEL`
- C) L'attribut `CKA_PUBLIC_KEY`
- D) L'attribut `CKA_MODULUS`

**Réponse : A**

**Q4 :** Dans un protocole de **Key Ceremony M-of-N**, que signifie le paramètre M ?
- A) Le nombre minimum de gardiens (Custodians) qui doivent présenter leur fragment de clé pour permettre la reconstruction du secret maître
- B) Le nombre de bits de la clé
- C) Le nombre d'années de validité du certificat
- D) Le nombre de serveurs dans le datacenter

**Réponse : A**

**Q5 :** Quel avantage majeur offre l'utilisation d'un **Cloud KMS (ex: AWS KMS)** pour la rotation automatique des clés par rapport à un HSM on-premises ?
- A) AWS KMS peut configurer une rotation automatique annuelle des clés CMK sans interruption de service, gérant transparentement plusieurs versions de clés pour le déchiffrement des données anciennes
- B) AWS KMS est toujours gratuit
- C) AWS KMS ne nécessite aucune configuration
- D) AWS KMS exclut les données de l'Europe

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
