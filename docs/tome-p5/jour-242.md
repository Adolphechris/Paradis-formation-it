# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 242 (6h) : Cryptographie Appliquée & HSM / KMS Enterprise (PKCS#11, HashiCorp Vault Transit Engine, AWS Nitro Enclaves & Key Lifecycle Management)

> [!NOTE]
> **Objectif du jour :** Maîtriser la gestion de la sécurité cryptographique et des clés d'entreprise : architecture des modules de sécurité matériels (**HSM — Hardware Security Module**), interface standard **PKCS#11**, chiffrement à la volée avec **HashiCorp Vault Transit Engine**, traitement sécurisé en environnement isolé avec **AWS Nitro Enclaves**, et gestion du cycle de vie des clés (**Key Lifecycle Management**).
>
> **Compétences visées :** `SEC-04` (A) — Enterprise Key Management & HSM Integration | `SEC-05` (A) — HashiCorp Vault Transit Engine & AWS Nitro Enclaves Security

---

## 1) Module — HSM, Standards PKCS#11 & Isolation Matérielle (2h)

### 📖 Narration/Intuition

Dans les infrastructures bancaires critiques de la BCC (comme la signature des blocs MNBC ou la gestion du certificat ADFS étudié au J239), les clés privées ne doivent **jamais** exister en clair dans la mémoire RAM du serveur hôte ou sur le disque dur.

Un **HSM (Hardware Security Module)** est un équipement physique renforcé et résistant aux manipulations physiques (FIPS 140-2/140-3 Level 3/4) conçu pour générer, stocker et utiliser des clés cryptographiques à l'intérieur de son propre circuit sécurisé.

### 🔍 Anatomie Technique

**Interface PKCS#11 (Cryptoki) — Norme de Communication HSM :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 ARCHITECTURE PKCS#11 — INTERACTION HSM / APPLICATION        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Application BCC (ex: Service de Signature MNBC)                            │
│    │                                                                        │
│    ├── Appel API : C_Initialize() → Initialisation du module PKCS#11       │
│    ├── Appel API : C_OpenSession() → Ouverture de session sécurisée        │
│    ├── Appel API : C_Login(CKU_USER, "PIN_HSM") → Auth sur le HSM          │
│    │                                                                        │
│    └── Appel API : C_Sign(hKey, pData, ...) → Demande de signature          │
│          │                                                                  │
│          ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ HARDWARE SECURITY MODULE (HSM Thales / Entrust / CloudHSM)           │   │
│  │                                                                      │   │
│  │  1. La clé privée RESTANT À L'INTÉRIEUR du HSM (Non exportable)      │   │
│  │  2. Le HSM calcule la signature RSA/ECDSA/Dilithium                   │   │
│  │  3. Le HSM renvoie UNIQUEMENT le résultat (la signature) à l'App     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — HashiCorp Vault Transit Engine & Encryption-as-a-Service (2h)

### 📖 Narration/Intuition

Pour éviter que chaque microservice de la BCC n'ait à gérer ses propres algorithmes et clés de chiffrement, la BCC déploie le moteur **Transit** de **HashiCorp Vault**.

Vault agit comme un service de **Chiffrement à la volée (Encryption-as-a-Service)** : le microservice envoie des données en clair à Vault, qui les chiffre et retourne un jeton chiffré (`vault:v1:8f...`). Le microservice stocke les données chiffrées sans jamais connaître ni manipuler la clé de chiffrement.

### 🛠️ Atelier Pratique

**Chiffrement/Déchiffrement avec Vault Transit Engine (`vault_transit.py`) :**

```python
import hvac, base64

# Connexion à l'instance Vault BCC
vault_client = hvac.Client(url='https://vault.internal.bcc-mnbc.cd:8200', token='s.bcc_settlement_token')

# Data sensible MNBC à chiffrer
sensitive_data = "COMPTE: RAWBANK-001 | SOLDE: 10000000 MNBC"
encoded_data = base64.b64encode(sensitive_data.encode()).decode()

# 1. CHIFFREMENT À LA VOLÉE (Vault Transit Engine)
encrypt_response = vault_client.secrets.transit.encrypt_data(
    name='bcc-mnbc-key', # Nom de la clé gérée dans Vault (avec rotation auto)
    plaintext=encoded_data
)
ciphertext = encrypt_response['data']['ciphertext']
print(f"🔒 Donnée chiffrée par Vault : {ciphertext}")
# Output: vault:v1:K9aB7xL...

# 2. DÉCHIFFREMENT À LA VOLÉE
decrypt_response = vault_client.secrets.transit.decrypt_data(
    name='bcc-mnbc-key',
    ciphertext=ciphertext
)
decrypted_base64 = decrypt_response['data']['plaintext']
decrypted_data = base64.b64decode(decrypted_base64).decode()
print(f"🔓 Donnée déchiffrée par Vault : {decrypted_data}")
```

---

## 3) Module — AWS Nitro Enclaves & Traitement Isolé (2h)

### 🛠️ Atelier Pratique

**Traitement de Données Ultra-Sensibles dans une Enclave Sécurisée :**

```bash
# Les AWS Nitro Enclaves créent des environnements de calcul isolés,
# sans stockage persistant, sans accès administrateur/SSH, et sans connectivité réseau externe.

# 1. Générer le fichier d'image d'enclave (EIF - Enclave Image File)
nitro-cli build-enclave --docker-uri bcc-crypto-service:latest --output-file bcc-crypto.eif

# 2. Démarrer l'enclave Nitro avec ressources dédiées (CPU / RAM isolés de l'instance hôte)
nitro-cli run-enclave --cpu-count 2 --memory-clock-mb 4096 --eif-path bcc-crypto.eif

# 3. Communication sécurisée avec l'enclave uniquement via socket local VSOCK
# L'administrateur hôte (même root) NE PEUT PAS inspecter la mémoire de l'enclave !
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **HSM** | Hardware Security Module — Équipement matériel dédié à la sécurité cryptographique |
| **PKCS#11** | Public Key Cryptography Standards #11 — API standardisée pour l'accès aux HSM |
| **KMS** | Key Management Service — Service d'entreprise de gestion du cycle de vie des clés |
| **EIF** | Enclave Image File — Format d'image sécurisée pour AWS Nitro Enclaves |
| **VSOCK** | Virtual Socket — Socket de communication bas niveau entre l'hôte et l'enclave |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer pourquoi l'utilisation d'un **HSM** empêche un attaquant ayant obtenu les privilèges `root` sur un serveur ADFS ou un nœud Kubernetes de voler la clé privée du certificat de signature.

**Corrigé :** Dans une configuration logicielle standard, la clé privée réside dans la mémoire RAM du serveur hôte ou dans un fichier de clés. Un attaquant `root` peut lire la mémoire RAM (ex: via un dumper mémoire) ou extraire le fichier de clés sur disque. Avec un **HSM**, la clé privée est générée **à l'intérieur du composant matériel sécurisé** et est marquée comme non-exportable. Lorsque le serveur ADFS a besoin de signer une assertion SAML, il envoie la donnée à signer au HSM via l'interface PKCS#11. Le HSM réalise l'opération cryptographique dans sa puce physique et ne renvoie que la signature au serveur. La clé privée ne quitte **jamais** le HSM. L'attaquant `root` sur le serveur ne trouve aucune clé privée ni dans les fichiers ni dans la mémoire RAM de l'hôte.

**Exercice 2 :** Quel est l'avantage du moteur **Vault Transit** par rapport au stockage classique de clés de chiffrement dans l'application ?

**Corrigé :** Le moteur Vault Transit offre le modèle **Encryption-as-a-Service**. Ses avantages clés sont : (1) **Aucune clé dans l'application** : L'application n'a jamais accès aux clés cryptographiques brutes, éliminant le risque de fuite de clé dans les logs ou la mémoire. (2) **Gestion centralisée de la rotation** : Vault permet la rotation automatique des clés (ex: création de `vault:v2:`, `vault:v3:`) sans interrompre le service ni nécessiter de re-chiffrer immédiatement toutes les anciennes données. (3) **Auditabilité stricte** : Chaque opération de chiffrement/déchiffrement est enregistrée dans les logs d'audit immuables de Vault.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle norme d'interface (Cryptoki) définit l'API standard d'interaction entre une application et un module HSM matériel ?
- A) PKCS#11
- B) X.509
- C) FIPS 140-2
- D) POSIX

**Réponse : A**

**Q2 :** Quel moteur de HashiCorp Vault fournit un service d'**Encryption-as-a-Service** permettant aux microservices de chiffrer/déchiffrer des données à la volée sans manipuler les clés ?
- A) Transit Engine
- B) Key-Value (KV) Engine
- C) PKI Engine
- D) Database Engine

**Réponse : A**

**Q3 :** Pourquoi les **AWS Nitro Enclaves** n'autorisent-elles aucun accès SSH ni stockage persistant ?
- A) Pour garantir une isolation mémoire absolue empêchant même l'administrateur de l'instance hôte d'inspecter les données traitées
- B) Pour réduire la taille de l'image Docker
- C) Parce qu'elles n'ont pas de système d'exploitation
- D) Pour économiser de la bande passante

**Réponse : A**

**Q4 :** Quelle certification de sécurité américaine (NIST) évalue la résistance physique et cryptographique des équipements HSM (Niveaux 1 à 4) ?
- A) FIPS 140-2 / FIPS 140-3
- B) ISO 27001
- C) Common Criteria EAL1
- D) SOC 2 Type II

**Réponse : A**

**Q5 :** Quel canal de communication exclusif est utilisé pour échanger des données entre une instance hôte EC2 et une Nitro Enclave ?
- A) VSOCK (Virtual Socket)
- B) SSH
- C) HTTPS sur Internet
- D) TLS sur le port 443 public

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
