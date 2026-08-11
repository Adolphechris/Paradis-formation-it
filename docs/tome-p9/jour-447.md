# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 447 (6h) : Sécurité Cryptographique des Event Streams & Messageries (Kafka Message-Level Encryption, Signal Protocol, KMS Envelope Encryption & End-to-End Encryption E2EE)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Concevoir et implémenter le chiffrement au niveau message (Message-Level Encryption) sur **Apache Kafka** avec KMS Envelope Encryption
> - Maîtriser l'architecture cryptographique du **Signal Protocol** (Double Ratchet + X3DH) pour la messagerie E2EE
> - Appliquer le **chiffrement de bout en bout (E2EE)** dans les architectures de microservices et d'API REST
> - Gérer la rotation automatique des clés de chiffrement et le **Key Versioning** dans un pipeline de streaming haute disponibilité
>
> **Compétences visées :** `SEC-04` (A) — Message-Level Encryption, `SEC-06` (A) — End-to-End Encryption & Key Management

---

## Module 1 — Signal Protocol : Double Ratchet & X3DH (2h)

### 📖 Intuition & Narration

**Signal** (WhatsApp, Messages de Google) est considéré comme le standard de référence absolu de la messagerie sécurisée. Son protocole cryptographique combine deux mécanismes brillants :

1. **X3DH (Extended Triple Diffie-Hellman)** : Établit une session chiffrée initiale entre deux parties, même si l'une d'elles est hors ligne au moment de l'envoi du premier message.
2. **Double Ratchet** : Assure la **Forward Secrecy** (compromission future d'une clé n'affecte pas les messages passés) et la **Post-Compromise Security** (récupération automatique après une compromission temporaire).

### 🔍 Anatomie Technique — Double Ratchet Algorithm

```
DOUBLE RATCHET — MÉCANISME DE ROTATION CONTINUE DES CLÉS

  RATCHET 1 (Diffie-Hellman) : Rotation à chaque échange de messages
  ├── Alice génère une nouvelle paire ECDH (pubkey_A_n, privkey_A_n) à chaque message
  ├── Le shared secret DH change à chaque message ──▶ chaque message a une clé racine unique

  RATCHET 2 (KDF Chain) : Dérivation symétrique pour chaque message
  ├── Chain Key (CK) ──▶ KDF ──▶ Message Key (MK_n) + Chain Key suivant (CK_n+1)
  └── MK_n utilisé pour chiffrer le message n avec AES-256-GCM

  PROPRIÉTÉS OBTENUES :
  ├── Forward Secrecy   : Divulgation de MK_5 ne compromet pas MK_1..4
  └── Break-in Recovery : Nouvelle racine DH après compromission ──▶ sécurité restaurée
```

---

## Module 2 — Kafka Message-Level Encryption & KMS Envelope Encryption (2h)

### 📖 Intuition & Narration

Kafka chiffre le transport (TLS entre brokers et clients), mais les messages restent en clair sur le disque du broker. Si un attaquant comprend les serveurs Kafka, il accède à tous les messages historiques. Le **Message-Level Encryption** chiffre chaque message individuellement avec AES-256-GCM avant d'être envoyé dans le topic Kafka.

### 🛠️ Atelier Pratique — Kafka Producer avec KMS Envelope Encryption

```python
#!/usr/bin/env python3
"""
PARADIS — Kafka Message-Level Encryption avec KMS Envelope Encryption (AWS KMS)
Chaque message Kafka est chiffré individuellement avec AES-256-GCM
La clé AES est elle-même chiffrée par la clé maître KMS (Envelope Encryption)
"""

import os
import json
import base64
import boto3
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from kafka import KafkaProducer

class SecureKafkaProducer:
    def __init__(self, bootstrap_servers: str, kms_key_id: str):
        self.kms_client = boto3.client('kms', region_name='eu-west-3')
        self.kms_key_id = kms_key_id
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            security_protocol="SSL",
            ssl_cafile="/etc/kafka/ca.pem",
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )

    def encrypt_and_produce(self, topic: str, message: dict) -> None:
        """
        Envelope Encryption :
        1. Génère une DEK (Data Encryption Key) AES-256 éphémère via KMS
        2. Chiffre le message avec la DEK en AES-256-GCM
        3. Chiffre la DEK avec la CMK KMS (wrapping)
        4. Envoie {encrypted_dek, iv, ciphertext} dans Kafka
        """
        # 1. Générer une DEK fraîche via AWS KMS (GenerateDataKey)
        response = self.kms_client.generate_data_key(
            KeyId=self.kms_key_id,
            KeySpec='AES_256'
        )
        dek_plaintext = response['Plaintext']   # DEK en clair (NE PAS STOCKER !)
        dek_encrypted = response['CiphertextBlob']  # DEK chiffrée par CMK KMS

        # 2. Chiffrer le message avec la DEK (AES-256-GCM)
        iv = os.urandom(12)
        aesgcm = AESGCM(dek_plaintext)
        msg_bytes = json.dumps(message).encode('utf-8')
        ciphertext = aesgcm.encrypt(iv, msg_bytes, None)

        # 3. Effacer la DEK en clair de la mémoire immédiatement
        del dek_plaintext

        # 4. Construire l'enveloppe chiffrée à publier dans Kafka
        kafka_message = {
            "encrypted_dek": base64.b64encode(dek_encrypted).decode(),
            "iv": base64.b64encode(iv).decode(),
            "ciphertext": base64.b64encode(ciphertext).decode()
        }
        self.producer.send(topic, kafka_message)
        self.producer.flush()
        print(f"[*] Message chiffré publié dans '{topic}' — DEK protégée par KMS")

# Utilisation (simulation sans AWS réel)
print("[DEMO] Kafka Secure Producer avec Envelope Encryption KMS")
print("  Topic: paradis.banking.transactions.encrypted")
print("  KMS Key: arn:aws:kms:eu-west-3:123456789:key/mrk-1234...")
print("  Message chiffré en AES-256-GCM, DEK wrappée par CMK KMS")
print("  ✅ Chaque message possède une DEK unique — Rotation automatique à chaque envoi")
```

---

## Module 3 — E2EE dans les API REST & Microservices (1h30)

### 🛠️ Pattern de Chiffrement E2EE dans les APIs REST

```python
#!/usr/bin/env python3
"""
PARADIS — Chiffrement E2EE Application-Level dans une API REST
Les données sensibles sont chiffrées côté client avant d'être envoyées à l'API
"""

import os
import json
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.asymmetric.x25519 import X25519PrivateKey

def demo_e2ee_api():
    # 1. Le client génère une paire de clés éphémères X25519
    client_priv = X25519PrivateKey.generate()
    client_pub = client_priv.public_key()

    # 2. Le serveur a une clé longue terme X25519
    server_priv = X25519PrivateKey.generate()
    server_pub = server_priv.public_key()

    # 3. Échange de clés ECDH X25519 ──▶ Shared Secret
    shared_secret = client_priv.exchange(server_pub)

    # 4. Dériver une clé de chiffrement symétrique via HKDF
    from cryptography.hazmat.primitives.kdf.hkdf import HKDF
    from cryptography.hazmat.primitives import hashes
    hkdf = HKDF(algorithm=hashes.SHA256(), length=32, salt=None, info=b'paradis-api-e2ee-v1')
    aes_key = hkdf.derive(shared_secret)

    # 5. Chiffrement E2EE du payload sensible côté client
    sensitive_payload = {"account_number": "FR76-1234-5678-9012", "amount": 10000.00}
    iv = os.urandom(12)
    aesgcm = AESGCM(aes_key)
    ciphertext = aesgcm.encrypt(iv, json.dumps(sensitive_payload).encode(), b"api-context-header")

    print(f"[+] Payload E2EE chiffré ({len(ciphertext)} bytes) — Seul le serveur peut déchiffrer !")
    print("  ✅ Le proxy, le load balancer et le WAF voient un ciphertext — Pas les données bancaires !")

demo_e2ee_api()
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **E2EE** | End-to-End Encryption — Chiffrement de bout en bout où seuls les extrémités communicantes accèdent aux données en clair |
| **DEK** | Data Encryption Key — Clé de chiffrement de données, éphémère, chiffrée par la clé maître |
| **CMK** | Customer Master Key — Clé maître gérée par le KMS, utilisée pour chiffrer les DEKs |
| **X3DH** | Extended Triple Diffie-Hellman — Protocole d'établissement de session asynchrone du Signal Protocol |
| **Double Ratchet** | Algorithme de rotation continue de clés garantissant la Forward Secrecy et la Break-in Recovery |

---

## Exercices Pratiques

### Exercice 1 — Forward Secrecy dans Kafka

Un attaquant s'empare des serveurs Kafka et exfiltre l'ensemble des messages historiques stockés dans les topics (rétention 7 jours). Le producteur Kafka utilise un Pattern Envelope Encryption KMS avec génération d'une DEK éphémère par message. La CMK KMS n'est PAS compromise.

**Question :** L'attaquant peut-il déchiffrer les messages ? Pourquoi ?

**Corrigé guidé :** NON. Chaque message a été chiffré avec une DEK AES-256-GCM **éphémère unique** wrappée par la CMK KMS. L'attaquant possède uniquement les DEKs chiffrées (`encrypted_dek`) dans les topics Kafka, mais il ne possède PAS la CMK KMS nécessaire pour unwrapper ces DEKs. Seul AWS KMS peut déchiffrer les DEKs (avec contrôle IAM strict et audit CloudTrail). Les messages restent donc indéchiffrables, même après exfiltration complète du cluster Kafka.

---

## Banque QCM — 5 Questions

**Q1.** Dans le **Signal Protocol**, la propriété de **Forward Secrecy** garantit que :

- A) Le serveur Signal stocke les messages en clair pendant 30 jours
- B) La compromission d'une clé de session actuelle ne compromet pas le déchiffrement des messages passés ✅
- C) Les messages sont envoyés en moins de 50 millisecondes
- D) Le protocole est compatible avec SHA-1

**Q2.** L'**Envelope Encryption (KMS)** dans Kafka repose sur :

- A) L'utilisation d'un seul certificat X.509 partagé entre tous les messages
- B) La génération d'une DEK unique par message, chiffrée par une CMK hébergée dans le KMS ✅
- C) Le chiffrement symétrique uniquement côté broker Kafka
- D) La désactivation du chiffrement TLS

**Q3.** Le protocole **X3DH (Extended Triple Diffie-Hellman)** permet de :

- A) Chiffrer des fichiers compressés en ZIP
- B) Établir une session E2EE initiale de manière asynchrone, même si le destinataire est hors ligne ✅
- C) Authentifier les administrateurs Linux avec sudo
- D) Compresser les paquets TCP sur le réseau

**Q4.** Dans le contexte E2EE de l'API REST, pourquoi chiffre-t-on le payload au niveau applicatif en plus du TLS ?

- A) Pour accélérer le débit réseau
- B) Pour que même les éléments intermédiaires (proxy, WAF, CDN, load balancer) qui terminent le TLS ne voient pas les données sensibles ✅
- C) Car TLS 1.3 est interdit dans les APIs REST
- D) Pour respecter la norme RGS de l'ANSSI

**Q5.** Dans le **Double Ratchet**, la propriété **Break-in Recovery** (ou Post-Compromise Security) signifie :

- A) Qu'une clé compromise ne peut jamais être remplacée
- B) Qu'après la compromission d'une clé de session, les prochains échanges DH génèrent une nouvelle racine de clés inaccessible à l'attaquant ✅
- C) Que la session est fermée définitivement après une tentative d'attaque
- D) Que l'algorithme génère une alerte email

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
