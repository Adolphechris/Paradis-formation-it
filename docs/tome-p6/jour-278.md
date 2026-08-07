# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 278 (6h) : Enterprise HSM & Key Management (API Standard PKCS#11, HashiCorp Vault Transit Engine & AWS KMS Lifecycle)

> [!NOTE]
> **Objectif du jour :** Maîtriser la gestion centralisée des clés de chiffrement et l'intégration des **HSM (Hardware Security Modules)** d'entreprise : interagir avec des HSMs via l'API standard **PKCS#11**, déployer un service **Encryption-as-a-Service** avec le moteur **Vault Transit Engine**, et gérer le cycle de vie des clés (Rotation, Destruction, Key Custody) dans **AWS KMS**.
>
> **Compétences visées :** `HSM-01` (A) — Enterprise HSM Integration (PKCS#11) | `KMS-01` (A) — Vault Transit Engine & AWS KMS Key Lifecycle

---

## 1) Module — Architecture HSM & Standard PKCS#11 (2h)

### 📖 Narration/Intuition

Un **Hardware Security Module (HSM)** est un équipement physique (ou enclave PCI-e / Cloud dédié) certifié FIPS 140-2/3 Level 3/4. Sa fonction est d'assurer la génération et le stockage inviolable de clés cryptographiques : la clé ne quitte JAMAIS le HSM. Les applications envoient les données à chiffrer via l'API standard **PKCS#11 (Cryptoki)**.

---

## 2) Module — Encryption-as-a-Service avec Vault Transit Engine (`vault_transit.sh`) (2h)

### 🛠️ Atelier Pratique

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Activation du Moteur Transit dans Vault
# ═══════════════════════════════════════════════════════
vault secrets enable transit

# Créer une clé de chiffrement nommée "customer-pii-key"
vault write -f transit/keys/customer-pii-key type=aes256-gcm96

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Chiffrement d'une donnée sensible sans manipulation de clé
# ═══════════════════════════════════════════════════════
DATA_BASE64=$(echo -n "4111-2222-3333-4444" | base64)

# Chiffrer via l'API Vault Transit
CIPHERTEXT=$(vault write -field=ciphertext transit/encrypt/customer-pii-key plaintext=$DATA_BASE64)
echo "[+] Donnée chiffrée (Ciphertext) : $CIPHERTEXT"
# Format : vault:v1:8f4bae9c...

# ═══════════════════════════════════════════════════════
# ÉTAPE 3 — Rotation automatique de la clé
# ═══════════════════════════════════════════════════════
# Effectuer la rotation de clé (génère la version v2)
vault write -f transit/keys/customer-pii-key/rotate

# Déchiffrer les anciennes données (Vault gère le déchiffrement rétro-compatible v1)
vault write -field=plaintext transit/decrypt/customer-pii-key ciphertext=$CIPHERTEXT | base64 --decode
```

---

## 3) Module — AWS KMS Lifecycle & Python Boto3 (`aws_kms_demo.py`) (2h)

### 🛠️ Script Python de chiffrement d'enveloppe (Envelope Encryption) avec AWS KMS

```python
import boto3
from base64 import b64encode

kms = boto3.client('kms', region_name='us-east-1')

KEY_ALIAS = "alias/master-bank-key"

def envelope_encryption(data: str):
    """Générer une Data Key unique chiffrée par la KMS Master Key (Envelope Encryption)"""
    print("[*] Demande d'une Data Key à AWS KMS...")
    response = kms.generate_data_key(KeyId=KEY_ALIAS, KeySpec='AES_256')

    plaintext_data_key = response['Plaintext']
    encrypted_data_key = response['CiphertextBlob']

    print(f"[+] Data Key en clair reçue ({len(plaintext_data_key)} octets)")
    print(f"[+] Data Key chiffrée par KMS : {b64encode(encrypted_data_key).decode()}")

    # La donnée est chiffrée localement avec plaintext_data_key
    # Puis plaintext_data_key est IMMÉDIATEMENT effacée de la mémoire RAM !
    del plaintext_data_key
    print("[+] Securité : Data Key en clair supprimée de la RAM !")

envelope_encryption("Donnée Financière Confidentielle")
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **HSM** | Hardware Security Module — Équipement physique dédié à la sécurité cryptographique |
| **PKCS#11** | Public Key Cryptography Standards #11 — API standardisée (Cryptoki) d'accès aux HSMs |
| **KMS** | Key Management Service — Service de gestion centralisée des clés de chiffrement |
| **Envelope Encryption** | Technique chiffrant la donnée avec une Data Key, elle-même chiffrée par une Master Key |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la caractéristique fondamentale d'un HSM (Hardware Security Module) certifié FIPS 140-3 Level 3 ?
- A) Les clés privées générées à l'intérieur ne quittent jamais le processeur sécurisé du HSM
- B) Il est hébergé en Wi-Fi
- C) Il stocke les mots de passe en clair
- D) Il est gratuit et open-source

**Réponse : A**

**Q2 :** Quelle est l'API standard C/C++ universellement utilisée par les applications d'entreprise pour communiquer avec un HSM ?
- A) PKCS#11 (Cryptoki)
- B) REST API JSON
- C) POSIX
- D) ODBC

**Réponse : A**

**Q3 :** Dans le moteur **Vault Transit Engine**, quel est le rôle du concept de **Encryption-as-a-Service** ?
- A) Permettre aux microservices de chiffrer et déchiffrer des données à la volée via des appels API REST sans jamais stocker ni manipuler les clés de chiffrement dans leur propre code
- B) Supprimer le chiffrement TLS
- C) Vendre des certificats
- D) Sauvegarder des fichiers HTML

**Réponse : A**

**Q4 :** Qu'est-ce que la technique de **Chiffrement d'Enveloppe (Envelope Encryption)** utilisée par AWS KMS ?
- A) Chiffrer la donnée avec une Data Key symétrique rapide, puis chiffrer cette Data Key avec la KMS Master Key (KMK)
- B) Mettre le binaire dans un fichier ZIP chiffré
- C) Envoyer la donnée par la poste
- D) Utiliser du chiffrement XOR

**Réponse : A**

**Q5 :** Quelle action cryptographique est recommandée d'exécuter périodiquement sur une clé maître pour limiter la quantité de données chiffrées par une même version de clé ?
- A) La rotation de clé (Key Rotation)
- B) La suppression de clé
- C) La copie de clé
- D) La désactivation du chiffrement

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
