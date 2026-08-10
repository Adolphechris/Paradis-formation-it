# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 426 (6h) : Cryptographie des Systèmes de Fichiers & Stockage — LUKS2, dm-crypt, Argon2id KDF, ZFS Native Encryption & Key Escrow Architecture

> [!NOTE]
> **Objectif du jour :** Maîtriser la conception et le déploiement du **chiffrement des données au repos (Data-at-Rest Encryption)** sur les systèmes de stockage d'entreprise : disséquer le fonctionnement interne de **LUKS2 (Linux Unified Key Setup)** et du sous-système **dm-crypt (XTS-AES-256)**, optimiser le dérivation de clé avec **Argon2id KDF**, configurer le chiffrement natif **ZFS**, et implémenter une architecture de séquestre de clés (**Key Escrow & Re-encryption**) raccordée à un HSM.
>
> **Compétences visées :** `STORAGE-CRYPTO-01` (A) — LUKS2 / dm-crypt Architecture (XTS-AES-256 & Argon2id KDF Tuning) | `STORAGE-CRYPTO-02` (A) — ZFS Native Encryption & Enterprise Key Escrow Management

---

## 1) Module — LUKS2 Architecture & Mode XTS-AES (2h)

### 📖 Narration/Intuition

Le chiffrement de stockage par bloc exige des modes de chiffrement spécifiques capables d'opérer sur des secteurs de disque fixes (ex: 4096 octets) sans expansion de taille. Le mode **XTS-AES** (IEEE 1619) est le standard mondial pour le chiffrement de disque : il utilise deux clés AES de 256 bits (total 512 bits) et un tweak basé sur l'adresse du secteur pour empêcher les attaques par analyse de fréquence de blocs.

```
  ═══════════════════════════════════════════════════════════════════
    ARCHITECTURE DU MODE DE CHIFFREMENT DE DISQUE XTS-AES-256
  ═══════════════════════════════════════════════════════════════════

  Secteur Disque (Tweak i) ──► AES_K2(Tweak) ⊗ α^j ──► Tweak Modifier (T)
                                                             │
  Plaintext (Bloc P) ───────► (P ⊕ T) ──► AES_K1 ──────► (Cipher ⊕ T) ──► Ciphertext C

  ═══════════════════════════════════════════════════════════════════
    STRUCTURE D'UN EN-TÊTE LUKS2 (SLOTS & KEYS)
  ═══════════════════════════════════════════════════════════════════

  ┌─────────────────────────────────────────────────────────────────┐
  │ LUKS2 Header (Binary + JSON Metadata)                           │
  ├─────────────────────────────────────────────────────────────────┤
  │ Master Key (MK) ── Chiffre la totalité du disque en XTS-AES-256 │
  ├─────────────────────────────────────────────────────────────────┤
  │ Keyslot 0 : Passphrase Admin ──► Argon2id KDF ──► Chiffre MK    │
  │ Keyslot 1 : Master Key HSM   ──► PKCS#11       ──► Chiffre MK    │
  │ Keyslot 2 : Token TPM2       ──► PCR Sealing   ──► Chiffre MK    │
  └─────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Outillage Disk Encryption & Key Escrow Engine (`disk_encryption_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import os
import json
import hashlib
from datetime import datetime, timezone
from cryptography.hazmat.primitives.kdf.argon2 import Argon2id
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

class DiskEncryptionEngine:
    """
    Moteur de simulation et d'audit du chiffrement de stockage d'entreprise :
    - Simulation d'en-tête LUKS2 avec dérivations Argon2id (FIPS 140-3)
    - Mode XTS-AES-256 simulation pour secteurs de disque
    - Gestion du séquestre de clés (Key Escrow Architecture)
    """

    def __init__(self, volume_name: str):
        self.volume = volume_name
        self.master_key = os.urandom(64)  # 512 bits pour XTS-AES-256 (K1=256, K2=256)
        self.keyslots: List[dict] = []

    def add_luks2_passphrase_keyslot(self, slot_id: int, passphrase: str) -> dict:
        """
        Ajoute un Keyslot LUKS2 protégé par passphrase via Argon2id KDF.
        Paramètres Argon2id recommandés : memory_cost=1GB, time_cost=4, parallelism=4.
        """
        salt = os.urandom(32)
        kdf = Argon2id(
            salt=salt,
            length=64,
            time_cost=4,
            memory_cost=1024 * 1024,  # 1 Go de RAM (résistance ASIC/GPU)
            parallelism=4
        )
        derived_key = kdf.derive(passphrase.encode())

        # Chiffrement de la Master Key avec la clé dérivée d'Argon2id
        encrypted_mk = bytes(a ^ b for a, b in zip(self.master_key, derived_key))

        slot_info = {
            "slot_id": slot_id,
            "type": "luks2_passphrase",
            "kdf": "Argon2id",
            "memory_cost_kb": 1048576,
            "time_cost": 4,
            "parallelism": 4,
            "salt_hex": salt.hex(),
            "encrypted_master_key": encrypted_mk.hex()[:32] + "..."
        }
        self.keyslots.append(slot_info)
        print(f"  [LUKS2] Keyslot {slot_id} créé (Argon2id 1GB RAM) — Protection Force-Brute Maximale ✅")
        return slot_info

    def generate_key_escrow_backup(self, escrow_hsm_label: str) -> dict:
        """
        Génère une sauvegarde de la Master Key pour le séquestre d'entreprise (Key Escrow).
        La Master Key est chiffrée avec la clé publique du HSM de secours.
        """
        escrow_key = hashlib.sha256(escrow_hsm_label.encode() + b"HSM_ESCROW_MASTER").digest()
        encrypted_backup = bytes(a ^ b for a, b in zip(self.master_key[:32], escrow_key))

        escrow_record = {
            "volume": self.volume,
            "escrow_hsm": escrow_hsm_label,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "escrow_backup_hash": hashlib.sha256(encrypted_backup).hexdigest()[:24],
            "security_policy": "Restauration soumise à l'accord d'un quorum de 3 administrateurs (M-of-N)"
        }
        print(f"  [KEY ESCROW] Sauvegarde de secours chiffrée créée pour HSM '{escrow_hsm_label}' ✅")
        return escrow_record

# Démonstration Disk Encryption Engine
engine = DiskEncryptionEngine("/dev/nvme0n1p2_paradis_data")
print("=== DISK ENCRYPTION & LUKS2 KEY ESCROW ENGINE ===")

# 1. Ajout Keyslot Passphrase Argon2id
engine.add_luks2_passphrase_keyslot(slot_id=0, passphrase="SuperSecretEnterprisePassphrase2026!")

# 2. Séquestre de clé HSM (Key Escrow)
engine.generate_key_escrow_backup("Thales-Luna-Backup-HSM-01")
```

---

## 3) Module — Fiche de Configuration LUKS2 & ZFS (2h)

```bash
# CONFIGURATION PAS-À-PAS LUKS2 & ZFS NATIVE ENCRYPTION

# 1. Formatage du disque en LUKS2 avec Argon2id & XTS-AES-256 (NIST Recommandé)
cryptsetup luksFormat --type luks2 \
                      --cipher aes-xts-plain64 \
                      --key-size 512 \
                      --pbkdf argon2id \
                      --pbkdf-memory 1048576 \
                      --pbkdf-parallel 4 \
                      /dev/sdb1

# 2. Ouverture du volume chiffré
cryptsetup open /dev/sdb1 data_encrypted

# 3. Chiffrement Natif ZFS (AES-256-GCM au niveau Dataset)
zpool create tank /dev/sdc
zfs create -o encryption=aes-256-gcm \
           -o keyformat=passphrase \
           -o keylocation=prompt \
           tank/paradis_secure_dataset
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **LUKS** | Linux Unified Key Setup — Standard de chiffrement de disque indépendant de la distribution |
| **XTS-AES** | XEX-based Tweaked-codebook mode with Ciphertext Stealing — Standard IEEE 1619 pour chiffrement de secteur |
| **Argon2id** | Algorithme de dérivation de clé gagnant du Password Hashing Competition (résistant GPU/ASIC) |
| **Key Escrow** | Séquestre de clés de chiffrement permettant la récupération de données en cas d'urgence |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Pourquoi le mode de chiffrement **XTS-AES-256** est-il spécifiquement conçu pour le chiffrement de stockage par secteur de disque ?
- A) Parce qu'il utilise deux clés AES de 256 bits et intègre le numéro de secteur (tweak) dans le chiffrement de chaque bloc, empêchant un attaquant d'analyser la fréquence de réapparition des mêmes blocs sur le disque
- B) Parce qu'il est deux fois plus rapide qu'AES-ECB
- C) Parce qu'il supprime le besoin de mots de passe
- D) Parce qu'il fonctionne uniquement sur les disques SSD

**Réponse : A**

**Q2 :** Quel est l'avantage principal de l'algorithme KDF **Argon2id** utilisé par défaut dans **LUKS2** par rapport à PBKDF2 ?
- A) Argon2id est un KDF dur en mémoire (Memory-Hard Function) exigeant typiquement 1 Go de RAM par dérivation, ce qui paralyse les tentatives de force brute sur cartes graphiques (GPU) et puces ASIC
- B) Argon2id produit des mots de passe plus longs
- C) Argon2id fonctionne sans sel (salt)
- D) Argon2id est propriétaire à Microsoft

**Réponse : A**

**Q3 :** Comment **LUKS2** permet-il à plusieurs utilisateurs d'ouvrir le MÊME disque chiffré avec des mots de passe différents ?
- A) LUKS2 utilise une Master Key unique qui chiffre le disque ; cette Master Key est elle-même chiffrée séparément dans différents *Keyslots*, chacun protégé par le mot de passe propre à chaque utilisateur
- B) En dupliquant les données du disque pour chaque utilisateur
- C) En utilisant un mot de passe maître envoyé par email
- D) En modifiant le système de fichiers ZFS

**Réponse : A**

**Q4 :** Qu'est-ce que l'architecture de **Key Escrow (Séquestre de Clés)** dans la gestion du stockage d'entreprise ?
- A) Un mécanisme permettant de sauvegarder de manière chiffrée (souvent sur HSM) une copie de la Master Key d'un serveur pour garantir la récupération des données en cas de perte de la passphrase administrateur
- B) Une technique d'attaque par déni de service
- C) Un type de câble SATA sécurisé
- D) Une sauvegarde publique sur GitHub

**Réponse : A**

**Q5 :** Quel avantage offre le **chiffrement natif ZFS** (Dataset-level Encryption) par rapport au chiffrement de disque bloc `dm-crypt` ?
- A) Il permet de chiffrer sélectivement certains datasets avec des clés différentes, et de réaliser des réplications distantes chiffrées (`zfs send/receive`) sans jamais déchiffrer les données pendant le transfert
- B) Il est obligatoire pour installer Linux
- C) Il supprime les besoins de sauvegarde
- D) Il désactive la compression de données

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
