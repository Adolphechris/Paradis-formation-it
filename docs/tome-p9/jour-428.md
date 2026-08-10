# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 428 (6h) : Cryptographie des Flux d'Événements & Messaging — Apache Kafka Security (TLS/SASL), Payload End-to-End Encryption & Stream Key Rotation Architecture

> [!NOTE]
> **Objectif du jour :** Maîtriser la sécurisation cryptographique des architectures orientées événements (Event-Driven Architectures — Apache Kafka, RabbitMQ, NATS) : configurer l'authentification mutuelle **mTLS** et **SASL/SCRAM-SHA-512**, mettre en œuvre le chiffrement de bout en bout du charge utile (**Payload End-to-End Encryption**) au niveau Producteur/Consommateur, et orchestrer la **rotation automatique des clés de flux (Stream Key Rotation)** sans interruption de service.
>
> **Compétences visées :** `STREAM-CRYPTO-01` (A) — Event Streaming Security Architecture (Kafka mTLS & SASL/SCRAM-SHA-512) | `STREAM-CRYPTO-02` (A) — Payload Field-Level Encryption & Stream Key Rotation Protocol

---

## 1) Module — Kafka mTLS / SCRAM & Payload E2EE Architecture (2h)

### 📖 Narration/Intuition

Dans les architectures microservices modernes, les bus d'événements comme Apache Kafka véhiculent des millions de messages par seconde contenant des données financières, personnelles et stratégiques. Sécuriser uniquement la couche transport (TLS) ne suffit pas : si le broker Kafka est compromis ou si des consommateurs non autorisés écoutent les topics, les données sont lisibles en clair. Le **Payload E2EE** garantit que seuls le producteur autorisé et le consommateur légitime possèdent la clé de déchiffrement du message.

```
  ═══════════════════════════════════════════════════════════════════
    SÉCURISATION COUCHE TRANSPORT VS PAYLOAD E2EE KAFKA
  ═══════════════════════════════════════════════════════════════════

  PRODUCER                   KAFKA BROKER                   CONSUMER
  ────────                   ────────────                   ────────
     │                            │                            │
     │── (1) mTLS / SASL-SCRAM ──►│                            │
     │    (Canal transport TLS)   │                            │
     │                            │── (2) mTLS / SASL-SCRAM ──►│
     │                            │    (Canal transport TLS)   │

  ⚠️ Sans Payload E2EE: Le Broker Kafka stocke les messages EN CLAIR sur son disque !

  ✅ Avec Payload E2EE:
  PRODUCER (Chiffre Payload avec Key_v2) ──► KAFKA BROKER (Stocke Ciphertext Opaque)
                                                      │
                                                      ▼
  CONSUMER (Déchiffre avec Key_v2) ◄──────────────────┘
```

---

## 2) Module — Outillage Stream Encryption Engine (`stream_crypto_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import os
import json
import hashlib
from datetime import datetime, timezone, timedelta
from typing import List, Dict
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class StreamCryptoEngine:
    """
    Moteur de chiffrement de flux d'événements applicatifs (Kafka/NATS Payload Encryption) :
    - Chiffrement du Payload applicatif avec versionnement de clés (Key Version Header)
    - Déchiffrement multi-versions pour supporter la rotation de clés transparente
    - Simulation SASL/SCRAM-SHA-512 authentication credentials
    """

    def __init__(self):
        # Keystore du flux : version_id -> 32-byte key
        self.stream_keys: Dict[int, bytes] = {}
        self.current_key_version = 1
        self._rotate_stream_key()  # Initialise Key v1

    def _rotate_stream_key(self) -> int:
        """Génère une nouvelle version de clé de flux pour la rotation."""
        new_key = os.urandom(32)
        if self.stream_keys:
            self.current_key_version += 1
        self.stream_keys[self.current_key_version] = new_key
        print(f"  [KEY ROTATION] Nouvelle clé de flux générée — Version active: v{self.current_key_version}")
        return self.current_key_version

    def produce_encrypted_event(self, topic: str, event_data: dict) -> dict:
        """
        [PRODUCER] Chiffre le payload d'un événement avec la clé de flux active (AES-256-GCM).
        Incruste la version de clé dans l'en-tête du message Kafka.
        """
        payload_bytes = json.dumps(event_data).encode()
        active_key = self.stream_keys[self.current_key_version]
        
        aesgcm = AESGCM(active_key)
        nonce = os.urandom(12)
        ciphertext = aesgcm.encrypt(nonce, payload_bytes, None)

        kafka_message = {
            "topic": topic,
            "headers": {
                "key_version": self.current_key_version,
                "encrypted_by": "ParadisProducerService",
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            "payload_nonce_hex": nonce.hex(),
            "payload_ciphertext_hex": ciphertext.hex()
        }
        print(f"  [PRODUCER] Événement chiffré émis sur '{topic}' (Key v{self.current_key_version})")
        return kafka_message

    def consume_encrypted_event(self, kafka_message: dict) -> dict:
        """
        [CONSUMER] Déchiffre le payload d'un événement en utilisant la version de clé appropriée.
        Supporte les anciennes versions de clés pour les messages en retard dans le buffer.
        """
        key_ver = kafka_message["headers"]["key_version"]
        if key_ver not in self.stream_keys:
            raise ValueError(f"CRITICAL: Version de clé v{key_ver} inconnue ou révoquée !")

        key_to_use = self.stream_keys[key_ver]
        nonce = bytes.fromhex(kafka_message["payload_nonce_hex"])
        ciphertext = bytes.fromhex(kafka_message["payload_ciphertext_hex"])

        aesgcm = AESGCM(key_to_use)
        decrypted_bytes = aesgcm.decrypt(nonce, ciphertext, None)
        event_data = json.loads(decrypted_bytes.decode())

        print(f"  [CONSUMER] Événement déchiffré avec succès (Key v{key_ver}) ✅")
        return event_data

# Démonstration Stream Crypto Engine
engine = StreamCryptoEngine()
print("=== EVENT STREAM ENCRYPTION & KEY ROTATION ENGINE ===")

# 1. Émission d'un événement avec Key v1
msg_v1 = engine.produce_encrypted_event("payment-events", {"account": "FR7612345", "amount": 1500.0})
engine.consume_encrypted_event(msg_v1)

# 2. Rotation de la clé de flux (v1 -> v2)
engine._rotate_stream_key()

# 3. Émission d'un événement avec Key v2
msg_v2 = engine.produce_encrypted_event("payment-events", {"account": "FR7699999", "amount": 8500.0})

# 4. Consommation mixte (Le consommateur déchiffre v1 ET v2 sans interruption!)
print("\n--- Validation de la consommation rétrocompatible ---")
engine.consume_encrypted_event(msg_v1)  # Déchiffre avec v1
engine.consume_encrypted_event(msg_v2)  # Déchiffre avec v2
```

---

## 3) Module — Fiche de Configuration Kafka Security (2h)

```properties
# KAFKA BROKER SECURITY CONFIGURATION — /etc/kafka/server.properties

# 1. Écouteurs Sécurisés mTLS (SSL) et SASL
listeners=SSL://0.0.0.0:9093,SASL_SSL://0.0.0.0:9094
advertised.listeners=SSL://kafka-node1.paradis.internal:9093,SASL_SSL://kafka-node1.paradis.internal:9094

# 2. Configuration SSL/mTLS (Certificats PKI Entreprise)
ssl.keystore.location=/var/private/ssl/kafka.server.keystore.jks
ssl.keystore.password=KeystoreSecretPass2026
ssl.truststore.location=/var/private/ssl/kafka.server.truststore.jks
ssl.truststore.password=TruststoreSecretPass2026
ssl.client.auth=required                      # mTLS Strict (Client Cert Required)

# 3. Authentification SASL/SCRAM-SHA-512
sasl.enabled.mechanisms=SCRAM-SHA-512
sasl.mechanism.inter.broker.protocol=SCRAM-SHA-512
security.inter.broker.protocol=SSL
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SASL** | Simple Authentication and Security Layer — Framework d'authentification pour protocoles réseau |
| **SCRAM** | Salted Challenge Response Authentication Mechanism — Protocole d'authentification par mot de passe robuste (SCRAM-SHA-512) |
| **E2EE Payload** | End-to-End Payload Encryption — Chiffrement du contenu des messages applicatifs avant soumission au bus |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Pourquoi la configuration du chiffrement transport **TLS** sur un cluster Apache Kafka ne suffit-elle PAS à garantir la confidentialité absolue des événements ?
- A) Parce que TLS ne chiffre que la donnée en transit — sur le disque du Broker Kafka, les messages sont enregistrés en clair si le Payload n'est pas chiffré applicativement (Payload E2EE)
- B) Parce que TLS ne fonctionne pas avec le protocole Java
- C) Parce que Kafka n'accepte pas les certificats RSA
- D) Parce que TLS ralentit le réseau de 80%

**Réponse : A**

**Q2 :** Quel est l'avantage du mécanisme d'authentification **SASL/SCRAM-SHA-512** sur Apache Kafka par rapport au simple mot de passe en clair ?
- A) SCRAM-SHA-512 utilise un échange de défi/réponse salé évitant la transmission du mot de passe sur le réseau et protégeant la base de données d'authentification contre les attaques par dictionnaire
- B) SCRAM-SHA-512 supprime le besoin de clés privées
- C) SCRAM-SHA-512 est obligatoire par le standard WPA3
- D) SCRAM-SHA-512 chiffre les fichiers de log du système

**Réponse : A**

**Q3 :** Dans un schéma de **Payload E2EE** pour flux Kafka, comment le consommateur sait-il quelle clé utiliser si une rotation de clé a eu lieu ?
- A) Le producteur inclut l'identifiant de la version de la clé (`key_version`) dans les en-têtes (Headers) du message Kafka, permettant au consommateur de sélectionner la bonne clé dans son Keystore
- B) Le consommateur teste toutes les clés possibles par force brute
- C) Le Broker Kafka modifie la clé automatiquement
- D) Le consommateur demande la clé par SMS

**Réponse : A**

**Q4 :** Que signifie la directive `ssl.client.auth=required` dans le fichier `server.properties` d'un broker Apache Kafka ?
- A) Le broker exige une authentification mutuelle TLS (mTLS) — chaque client (producteur ou consommateur) doit impérativement présenter un certificat X.509 valide signé par la CA de confiance
- B) Le broker désactive les connexions SSL
- C) Le broker génère des mots de passe aléatoires
- D) Le broker accepte toutes les connexions anonymes

**Réponse : A**

**Q5 :** Pourquoi est-il recommandé d'utiliser des algorithmes **AEAD (ex: AES-256-GCM)** pour le chiffrement des payloads de flux d'événements ?
- A) Parce qu'AEAD garantit simultanément la confidentialité des données et leur intégrité/authentification (détectant toute altération ou corruption de message lors du transit ou du stockage)
- B) Parce qu'AEAD permet de compresser les fichiers de 50%
- C) Parce qu'AEAD n'utilise pas de nonce
- D) Parce qu'AEAD remplace le protocole IPsec

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
