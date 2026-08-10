# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 427 (6h) : Cryptographie des Bases de Données — Transparent Data Encryption (TDE), Column-Level Encryption, Deterministic & Searchable Encryption (SSE)

> [!NOTE]
> **Objectif du jour :** Maîtriser la protection cryptographique des données stockées dans les **systèmes de gestion de bases de données (SGBD SQL/NoSQL)** : comprendre la différence entre **Transparent Data Encryption (TDE)** au niveau page/fichier et le **Column-Level Encryption (CLE / Field-Level)**, implémenter le chiffrement déterministe et la **recherche sur données chiffrées (Searchable Symmetric Encryption — SSE / Blind Indexing)**, et auditer l'intégration avec les HSM/KMS entreprise.
>
> **Compétences visées :** `DB-CRYPTO-01` (A) — Database Encryption Paradigms (TDE vs Column-Level / Field-Level Encryption) | `DB-CRYPTO-02` (A) — Searchable Encryption (SSE), Blind Indexing Implementation & KMS Envelope Encryption Integration

---

## 1) Module — TDE vs Column-Level & Blind Indexing (2h)

### 📖 Narration/Intuition

Protéger les bases de données contre les fuites exige de comprendre où s'arrête la protection de chaque modèle. Le **TDE (Transparent Data Encryption)** protège contre le vol physique des disques ou fichiers `.mdf/.db`, mais si un administrateur SGBD ou une injection SQL s'exécute, **toutes les données sont lues en clair** ! Le **Column-Level Encryption (CLE)** ou **Client-Side Encryption** garantit que la base de données ne voit passer que des cyphertexts opaques.

```
  ═══════════════════════════════════════════════════════════════════
    TDE VS COLUMN-LEVEL ENCRYPTION (FIELD-LEVEL)
  ═══════════════════════════════════════════════════════════════════

  Modèle                Lieu de Chiffrement     Protection contre SQLi / DBA
  ──────                ───────────────────     ────────────────────────────
  TDE (Transparent)     Moteur SGBD (Disque)    ❌ AUCUNE (Données en clair en RAM/SQL)
  Column-Level (CLE)    Application Client      ✅ TOTALE (SGBD stocke du ciphertext)

  ═══════════════════════════════════════════════════════════════════
    BLIND INDEXING — RECHERCHE SUR DONNÉES CHIFFRÉES
  ═══════════════════════════════════════════════════════════════════

  Champ Sensible : "0601020304" (Numéro de téléphone)
         │
         ├── Chiffrement Randomisé (AEAD) ──► Column `phone_encrypted` (Opaque)
         │
         └── HMAC-SHA256(HMAC_Key, "0601020304") ──► Column `b_index_phone` (Blind Index)

  Requête SQL :
  SELECT * FROM users WHERE b_index_phone = HMAC-SHA256(HMAC_Key, "0601020304");
  ──► La DB trouve la ligne SANS JAMAIS connaître le numéro de téléphone !
```

---

## 2) Module — Outillage Database Crypto Engine (`db_crypto_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import os
import hmac
import hashlib
import json
from datetime import datetime, timezone
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class DatabaseCryptoEngine:
    """
    Moteur de chiffrement niveau applicatif pour bases de données (Field-Level Encryption) :
    - Chiffrement d'enveloppe (Envelope Encryption) avec KMS/HSM
    - Chiffrement de colonne AEAD (AES-256-GCM)
    - Indexation aveugle (Blind Indexing) pour recherche SQL exacte
    """

    def __init__(self, kms_master_key_label: str):
        self.kms_label = kms_master_key_label
        # Clés dérivées de l'enveloppe
        self.data_encryption_key = os.urandom(32)  # DEK pour AES-256-GCM
        self.blind_index_key = os.urandom(32)       # Key pour HMAC Blind Index

    def encrypt_field(self, plaintext: str) -> str:
        """Chiffre un champ sensible (ex: IBAN, SSN) en AES-256-GCM."""
        aesgcm = AESGCM(self.data_encryption_key)
        nonce = os.urandom(12)
        ciphertext = aesgcm.encrypt(nonce, plaintext.encode(), None)
        # Format stocké en DB: hex(nonce + ciphertext)
        return (nonce + ciphertext).hex()

    def generate_blind_index(self, plaintext: str) -> str:
        """
        Génère un Blind Index (HMAC-SHA256 tronqué) permettant des requêtes WHERE = val
        sans révéler la donnée en clair au moteur SGBD.
        """
        h = hmac.new(self.blind_index_key, plaintext.encode(), hashlib.sha256).hexdigest()
        return h[:32]  # Blind index de 128 bits pour limiter les risques de corrélation

    def prepare_db_record(self, user_id: int, ssn: str, phone: str) -> dict:
        """Prépare un enregistrement SQL chiffré au niveau applicatif."""
        record = {
            "user_id": user_id,
            "ssn_encrypted": self.encrypt_field(ssn),
            "b_index_ssn": self.generate_blind_index(ssn),
            "phone_encrypted": self.encrypt_field(phone),
            "b_index_phone": self.generate_blind_index(phone),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        print(f"  [DB ENCRYPT] User {user_id} préparé — SSN Encrypted & Blind Index générés")
        return record

    def build_search_query_param(self, ssn_query: str) -> str:
        """Construit le paramètre Blind Index pour la clause SQL WHERE."""
        blind_idx = self.generate_blind_index(ssn_query)
        sql_snippet = f"SELECT * FROM users WHERE b_index_ssn = '{blind_idx}';"
        print(f"  [SQL SEARCH] Requête aveugle générée: {sql_snippet}")
        return sql_snippet

# Démonstration Database Crypto Engine
db_crypto = DatabaseCryptoEngine("AWS-KMS-PARADIS-DB-KEY")
print("=== DATABASE FIELD-LEVEL ENCRYPTION & BLIND INDEXING ENGINE ===")

# 1. Enregistrement d'un utilisateur
db_record = db_crypto.prepare_db_record(
    user_id=1001,
    ssn="1-84-09-75-123-456 78",
    phone="0601020304"
)

# 2. Génération de la requête SQL de recherche aveugle
db_crypto.build_search_query_param("1-84-09-75-123-456 78")
```

---

## 3) Module — Fiche de Comparaison TDE vs Field-Level (2h)

```markdown
# CHOIX ARCHITECTURAUX: TDE VS CLIENT-SIDE FIELD-LEVEL ENCRYPTION

| Critère | PostgreSQL / MySQL TDE | Field-Level Encryption (Client-Side) |
|:---|:---:|:---:|
| **Protection Vol Disque** | ✅ OUI | ✅ OUI |
| **Protection DB Admin / Root** | ❌ NON (L'admin voit tout) | ✅ OUI (L'admin ne voit que de l'hex opaque) |
| **Protection SQL Injection** | ❌ NON (Données déchiffrées) | ✅ OUI (L'attaquant n'extrait que du ciphertext) |
| **Recherche SQL (`LIKE %val%`)**| ✅ Supporté nativement | ⚠️ Recherche exacte uniquement (Blind Index) |
| **Impact CPU SGBD** | Faible | **NUL** (Déporté sur les serveurs d'application) |
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **TDE** | Transparent Data Encryption — Chiffrement automatique des fichiers de base de données par le SGBD |
| **CLE** | Column-Level Encryption — Chiffrement spécifique appliqué à certaines colonnes sensibles |
| **Blind Indexing** | Technique d'indexation par HMAC permettant la recherche exacte sur données chiffrées |
| **Envelope Encryption** | Architecture où les clés de données (DEK) sont chiffrées par une Master Key (KEK) stockée dans un KMS |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Pourquoi le **Transparent Data Encryption (TDE)** d'une base de données PostgreSQL ou SQL Server ne protège-t-il PAS contre une attaque par Injection SQL (SQLi) ?
- A) Parce que le TDE déchiffre les pages de données automatiquement lors de leur chargement en mémoire RAM par le moteur SGBD — toute requête SQLi s'exécutant dans le moteur lit les données déchiffrées en clair
- B) Parce que TDE utilise des clés de 64 bits
- C) Parce que TDE ne fonctionne qu'avec SQLite
- D) Parce que TDE désactive les mots de passe de base de données

**Réponse : A**

**Q2 :** En quoi consiste la technique du **Blind Indexing (Indexation Aveugle)** pour la recherche dans une base de données chiffrée ?
- A) Calculer un HMAC tronqué du champ en clair au niveau applicatif et le stocker dans une colonne dédiée (`b_index`), permettant des requêtes `WHERE b_index = hash` sans que le SGBD ne connaisse la donnée réelle
- B) Chiffrer la base de données deux fois
- C) Désactiver les index SQL
- D) Utiliser un mot de passe aveugle

**Réponse : A**

**Q3 :** Quel est le rôle de la **DEK (Data Encryption Key)** dans un schéma de **Chiffrement d'Enveloppe (Envelope Encryption)** pour base de données ?
- A) La DEK est la clé locale qui chiffre directement les colonnes ou enregistrements de la base de données ; elle est elle-même chiffrée par la KEK (Key Encryption Key) conservée dans le KMS/HSM
- B) La DEK est la clé publique de l'utilisateur
- C) La DEK sert à réinitialiser le mot de passe root du SGBD
- D) La DEK est stockée en clair dans le fichier `.bash_history`

**Réponse : A**

**Q4 :** Quel est l'impact majeur du chiffrement au niveau applicatif (**Client-Side Field-Level Encryption**) sur le serveur de base de données ?
- A) Il décharge 100% des opérations de chiffrement/déchiffrement CPU du SGBD vers les serveurs d'application et empêche tout accès en clair par l'administrateur de base de données (DBA)
- B) Il ralentit le SGBD de 90%
- C) Il nécessite un redémarrage quotidien de la base de données
- D) Il supprime les transactions ACID

**Réponse : A**

**Q5 :** Quelle limitation majeure impose l'utilisation du Blind Indexing sur les requêtes SQL ?
- A) Il ne permet que les recherches d'égalité exacte (`WHERE b_index = X`) et interdit les recherches par plage (`WHERE age > 30`) ou de sous-chaîne (`LIKE %motif%`) sans primitives complexes (FHE/OPE)
- B) Il interdit l'utilisation de la clause `ORDER BY`
- C) Il limite la table à 1000 lignes
- D) Il empêche la création de clés primaires

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
