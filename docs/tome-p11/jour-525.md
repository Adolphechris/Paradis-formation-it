# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 525 (6h) : Cryptographie Avancée en Production : HSM, PKI d'Entreprise, Chiffrement Enveloppe & TLS 1.3 Post-Quantique

> [!NOTE]
> **Objectifs pédagogiques :**
> - Concevoir l'architecture d'une **Infrastructures à Clés Publiques (PKI / ICP)** d'entreprise multi-niveaux (Root CA, Issuing CA)
> - Utiliser des modules matériels de sécurité **HSM (Hardware Security Module)** pour la protection des clés racines
> - Implémenter le motif de chiffrement enveloppe (**Envelope Encryption**) avec KMS (Key Management Service)
> - Préparer la transition vers la **Cryptographie Post-Quantique (PQC)** avec les algorithmes certifiés par le NIST (ML-KEM / Kyber, ML-DSA / Dilithium) et le provider OQS pour TLS 1.3
>
> **Compétences visées :** `SEC-04` (A), `SEC-05` (A) — Enterprise PKI & Applied Cryptography

---

## Module 1 — Architectures PKI d'Entreprise & HSM (2h)

### 📖 Intuition & Narration

La cryptographie est le fondement numérique de la confiance. Tout l'édifice de la sécurité (mTLS, signatures de code, HTTPS, VPN) s'effondre si la clé privée de l'Autorité de Certification Racine (Root CA) est compromise.

Une **PKI (Public Key Infrastructure)** d'entreprise ne stocke jamais ses clés les plus critiques dans des fichiers sur un serveur ordinaire. Elle utilise un **HSM (Hardware Security Module)** : un composant matériel physique inviolable, certifié FIPS 140-3 Level 3, conçu pour générer, stocker et effectuer les opérations cryptographiques sans que la clé privée ne quitte jamais la mémoire chiffrée de la puce.

### 🔍 Anatomie Technique — Chiffrement Enveloppe (Envelope Encryption)

```
CHIFFREMENT ENVELOPPE (ENVELOPE ENCRYPTION WITH KMS/HSM)

  1. CHIFFREMENT DE LA DONNÉE :
     Donnée volumineuse (100 MB) ──► Chiffrée avec DEK (Data Encryption Key - AES-256 local)
                                        │
                                        ▼
                               [ Donnée Chiffrée ]

  2. CHIFFREMENT DE LA CLÉ DEK :
     DEK (32 octets) ──► Envoyer au HSM / KMS ──► Chiffrée avec KEK (Key Encryption Key)
                                                       │
                                                       ▼
                                              [ Encrypted DEK ]

  3. STOCKAGE FINAL :
     Stocké ensemble : [ Encrypted Data ] + [ Encrypted DEK ]
     La clé KEK ne quitte JAMAIS le HSM !
```

---

## Module 2 — Atelier Pratique : Moteur de Chiffrement Enveloppe AES-256-GCM (2h)

### 🛠️ Code Python : Envelope Encryption Engine (Simulatif KMS)

```python
#!/usr/bin/env python3
"""
PARADIS — Envelope Encryption Engine (Simulatif KMS / HSM)
Implémente le chiffrement enveloppe avec AES-GCM-256 pour les données volumineuses.
"""

import os
import base64
import json
import hashlib
from datetime import datetime

class SimulatedKMSHSM:
    """Simule un HSM / KMS gérant la Master Key (KEK - Key Encryption Key)."""
    def __init__(self):
        # Clé Maître KEK stockée dans le HSM (simulée)
        self._kek_master = os.urandom(32)

    def generate_data_key() -> tuple[bytes, bytes]:
        """
        Génère une clé DEK (Data Encryption Key) en clair et sa version chiffrée par la KEK.
        """
        raw_dek = os.urandom(32) # AES-256 Key
        # Simulation du chiffrement de la DEK par la KEK du HSM
        encrypted_dek = hashlib.sha256(raw_dek + self._kek_master).digest()
        return raw_dek, encrypted_dek

    def decrypt_data_key(self, encrypted_dek: bytes, raw_dek_proof: bytes) -> bytes:
        """Déchiffre la DEK au sein du HSM."""
        # En simulation, retourne la preuve
        return raw_dek_proof

class EnvelopeEncryptor:
    def __init__(self, kms: SimulatedKMSHSM):
        self.kms = kms

    def encrypt_data(self, plaintext: str) -> dict:
        """Chiffre une donnée avec une DEK à usage unique."""
        print("=== EXÉCUTION DU CHIFFREMENT ENVELOPPE (ENVELOPE ENCRYPTION) ===")
        raw_dek, encrypted_dek = self.kms.generate_data_key()

        # Chiffrement AES-GCM (simulé avec XOR/HMAC pour démonstration sans dépendances externes)
        iv = os.urandom(12) # IV 96 bits pour AES-GCM
        ciphertext = bytes([b ^ raw_dek[i % len(raw_dek)] for i, b in enumerate(plaintext.encode())])
        auth_tag = hashlib.sha256(ciphertext + raw_dek + iv).digest()[:16]

        print(f"[*] Donnée originale : {len(plaintext)} caractères")
        print(f"[*] Clé DEK générée   : {base64.b64encode(raw_dek)[:16].decode()}... (32 octets)")
        print(f"[*] DEK Chiffrée par KEK/HSM : {base64.b64encode(encrypted_dek)[:16].decode()}...")

        return {
            "algorithm": "AES-256-GCM-ENVELOPE",
            "iv_b64": base64.b64encode(iv).decode(),
            "ciphertext_b64": base64.b64encode(ciphertext).decode(),
            "auth_tag_b64": base64.b64encode(auth_tag).decode(),
            "encrypted_dek_b64": base64.b64encode(encrypted_dek).decode(),
            "raw_dek_proof_b64": base64.b64encode(raw_dek).decode() # Pour démonstration
        }

    def decrypt_data(self, envelope: dict) -> str:
        """Déchiffre l'enveloppe."""
        raw_dek = base64.b64decode(envelope["raw_dek_proof_b64"])
        ciphertext = base64.b64decode(envelope["ciphertext_b64"])
        iv = base64.b64decode(envelope["iv_b64"])

        # Déchiffrement
        plaintext_bytes = bytes([b ^ raw_dek[i % len(raw_dek)] for i, b in enumerate(ciphertext)])
        return plaintext_bytes.decode()

if __name__ == "__main__":
    kms = SimulatedKMSHSM()
    encryptor = EnvelopeEncryptor(kms)

    secret_payload = "DONNÉE CONFIDENTIELLE BANCAIRE - RAPPORT AUDIT PARADIS FINANCE 2024"
    envelope = encryptor.encrypt_data(secret_payload)

    print("\n--- ENVELOPPE CRYPTOGRAPHIQUE PRODUITE (READY FOR STORAGE) ---")
    print(json.dumps({k: v for k, v in envelope.items() if k != "raw_dek_proof_b64"}, indent=2))

    decrypted = encryptor.decrypt_data(envelope)
    print(f"\n[✅ DÉCHIFFREMENT SUCCÈS] Donnée restaurée : '{decrypted}'")
```

---

## Module 3 — Cryptographie Post-Quantique (PQC) & TLS 1.3 Hybrid (1h30)

### 🔍 La Menace de l'Ordinateur Quantique & les Standards NIST PQC

Les algorithmes d'assymétrie actuels (RSA-2048, ECC P-256) seront brisés par l'**algorithme de Shor** lorsqu'un ordinateur quantique à tolérance de pannes (QCCD) de quelques milliers de qubits logiques verra le jour.

Les attaquants pratiquent dès aujourd'hui l'attaque **"Harvest Now, Decrypt Later"** : intercepter et stocker les flux chiffrés d'aujourd'hui pour les déchiffrer dans 10 ans.

Le **NIST** a standardisé en 2024 les premiers algorithmes Post-Quantiques :
- **ML-KEM (Kyber)** : Échange de clés asymétrique résistant aux attaques quantiques.
- **ML-DSA (Dilithium)** : Signature numérique post-quantique.

Le passage en production utilise des **combinaisons hybrides** dans TLS 1.3 (ex: `X25519_MLKEM768`) pour conserver la sécurité classique tout en ajoutant la protection quantique.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **HSM** | Hardware Security Module — Module matériel de sécurité pour la gestion des clés |
| **PKI / ICP** | Public Key Infrastructure / Infrastructure à Clés Publiques |
| **PQC** | Post-Quantum Cryptography — Cryptographie résistant aux ordinateurs quantiques |
| **KMS** | Key Management Service — Service cloud de gestion des clés cryptographiques |
| **DEK / KEK** | Data Encryption Key / Key Encryption Key — Clés de chiffrement des données / des clés |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Taille de Clé Post-Quantique

Pourquoi la migration vers la cryptographie post-quantique (ML-KEM / Kyber) impacte-t-elle la bande passante réseau des poignées de main (Handshakes) TLS 1.3 ?

**Corrigé guidé :**
Les clés publiques et les cyphertexts des algorithmes post-quantiques basés sur les réseaux euclidiens (Lattices) sont nettement plus volumineux que ceux de la cryptographie classique. Par exemple, une clé publique ECDH (X25519) mesure seulement **32 octets**, tandis qu'une clé publique ML-KEM-768 (Kyber) mesure **1 184 octets** (~37 fois plus volumineuse). Le paquet de Handshake TLS est donc plus grand.

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce qu'un module **HSM (Hardware Security Module)** ?

- A) Un processeur graphique pour le jeu vidéo.
- B) Un composant matériel physique dédié et inviolable (certifié FIPS) assurant la génération, le stockage sécurisé et le calcul cryptographique sans que la clé privée ne quitte la puce. ✅
- C) Un écran tactile.
- D) Un câble réseau.

**Q2.** Dans la technique du **Chiffrement Enveloppe (Envelope Encryption)**, quelle clé est utilisée pour chiffrer directement le fichier ou la donnée volumineuse ?

- A) La Master Key (KEK).
- B) La Data Encryption Key (DEK). ✅
- C) Le mot de passe de l'utilisateur.
- D) La clé Wi-Fi.

**Q3.** Quelle menace cyber majeure justifie la transition actuelle vers la **Cryptographie Post-Quantique (PQC)** ?

- A) L'augmentation du prix de l'électricité.
- B) La menace "Harvest Now, Decrypt Later", où les attaquants enregistrent le trafic chiffré actuel pour le déchiffrer plus tard grâce à l'algorithme de Shor sur un ordinateur quantique. ✅
- C) La panne des serveurs DNS.
- D) Le manque d'espace disque.

**Q4.** Quel algorithme sélectionné par le NIST est le standard mondial pour l'échange de clés post-quantique (**ML-KEM**) ?

- A) RSA-1024.
- B) Kyber (ML-KEM). ✅
- C) DES.
- D) MD5.

**Q5.** Dans une infrastructure PKI d'entreprise, pourquoi l'Autorité de Certification Racine (**Root CA**) est-elle conservée **hors-ligne (Offline Root CA)** ?

- A) Pour économiser de l'énergie.
- B) Pour la protéger de toute attaque réseau, la Root CA n'étant démarrée que très rarement pour signer les certificats des autorités d'émission (Issuing CAs). ✅
- C) Parce qu'elle n'a pas de carte réseau.
- D) Parce que Windows ne supporte pas Internet.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
