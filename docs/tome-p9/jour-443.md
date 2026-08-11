# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 443 (6h) : HSM d'Entreprise & Cloud HSM (Hardware Security Modules, PKCS#11 API, Thales PayShield, AWS CloudHSM & KMIP)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser l'architecture matérielle et logique d'un **HSM (Hardware Security Module)** d'entreprise (FIPS 140-3 Level 3/4)
> - Développer des applications cryptographiques avec l'API standard **PKCS#11** (Cryptoki) en C/Python
> - Intégrer les HSM de secteur bancaire (Thales PayShield) et Cloud (AWS CloudHSM, Azure Dedicated HSM, GCP Cloud HSM)
> - Implémenter le protocole d'interopérabilité de gestion de clés **KMIP (Key Management Interoperability Protocol)**
>
> **Compétences visées :** `SEC-04` (A) — Hardware Security Modules & PKCS#11, `SEC-07` (A) — Enterprise Key Management

---

## Module 1 — Architecture HSM & Norme FIPS 140-3 (2h)

### 📖 Intuition & Narration

Dans une banque ou une infrastructure critique, conserver la clé privée racine d'une PKI ou la clé maître de chiffrement des bases de données sur un serveur standard (même chiffrée sur le disque) est une vulnérabilité inacceptable : un administrateur `root` ou un malware noyau peut lire la mémoire RAM du serveur et exfiltrer la clé.

Un **HSM (Hardware Security Module)** est un processeur cryptographique physique inviolable (Tamper-Resistant). Les clés cryptographiques sont **générées, stockées et utilisées STRICTEMENT à l'intérieur du HSM** ; elles ne sortent JAMAIS en clair dans la mémoire de l'ordinateur hôte.

### 🔍 Anatomie Technique — FIPS 140-3 Levels & Tamper Protection

```
FIPS 140-3 NIVEAUX DE SÉCURITÉ HSM

  ┌─────────────────────────────────────────────────────────────┐
  │  LEVEL 1 : Sécurité logicielle de base (pas de matériel)    │
  ├─────────────────────────────────────────────────────────────┤
  │  Level 2 : Protection physique contre accès non autorisé    │
  │            (Sceaux d'inviolabilité / Tamper-evident seals)  │
  ├─────────────────────────────────────────────────────────────┤
  │  Level 3 : Détection d'intrusion physique & Effacement      │
  │            (Zeroization automatique si ouverture du boîtier)│
  ├─────────────────────────────────────────────────────────────┤
  │  Level 4 : Protection contre attaques environnementales     │
  │            (Tension, Température, Rayons X/Laser + Zeroize) │
  └─────────────────────────────────────────────────────────────┘
```

---

## Module 2 — API PKCS#11 (Cryptoki) & HSM Integration (2h)

### 📖 Intuition & Narration

Pour interagir avec un HSM (qu'il s'agisse d'un boîtier Utimaco, Thales, SafeNet ou d'un CloudHSM), les développeurs utilisent la norme **PKCS#11** (Cryptoki). L'API définit une couche d'abstraction orientée objets : Sessions, Slots, Tokens, et Cryptographic Objects (Keys, Certificates).

### 🛠️ Atelier Pratique — Signature et Chiffrement via PKCS#11 en Python (`PyKCS11`)

```python
#!/usr/bin/env python3
"""
PARADIS — Intégration HSM via l'API PKCS#11 (SoftHSM2 / Hardware HSM)
Démonstration de création de session, génération de clé RSA et signature dans le HSM
"""

import PyKCS11
from PyKCS11.LowLevel import CKA_CLASS, CKO_PRIVATE_KEY, CKA_LABEL

def hsm_pkcs11_demo():
    # 1. Charger la bibliothèque PKCS#11 du HSM (SoftHSM2 ou DLL constructeur)
    lib_path = "/usr/lib/softhsm/libsofthsm2.so"
    pkcs11 = PyKCS11.PyKCS11Lib()
    pkcs11.load(lib_path)

    # 2. Lister les slots disponibles dans le HSM
    slots = pkcs11.getSlotList(tokenPresent=True)
    print(f"[*] Slots HSM détectés : {len(slots)} slot(s)")
    if not slots:
        print("  ⚠️ Aucun HSM / SoftHSM détecté sur le slot")
        return

    slot = slots[0]
    token_info = pkcs11.getTokenInfo(slot)
    print(f"[*] HSM Token Label: {token_info.label.strip()}")

    # 3. Ouvrir une session et s'authentifier avec le User PIN
    session = pkcs11.openSession(slot, PyKCS11.CKF_SERIAL_SESSION | PyKCS11.CKF_RW_SESSION)
    user_pin = "1234"  # PIN du token
    session.login(user_pin)
    print("  ✅ Authentification HSM réussie (Session ouverte)")

    # 4. Rechercher la clé privée RSA dans le HSM (sans JAMAIS la faire sortir)
    key_template = [
        (PyKCS11.CKA_CLASS, PyKCS11.CKO_PRIVATE_KEY),
        (PyKCS11.CKA_LABEL, "ParadisRootCA_PrivKey")
    ]
    objects = session.findObjects(key_template)
    
    if objects:
        private_key_handle = objects[0]
        print(f"[*] Clé privée trouvée dans le HSM (Handle: {private_key_handle})")
        
        # 5. Signer un hash de message DANS LE HSM
        data_to_sign = b"MESSAGE_CRITIQUE_BANCAIRE_PARADIS_2024"
        mechanism = PyKCS11.Mechanism(PyKCS11.CKM_SHA256_RSA_PKCS, None)
        signature = session.sign(private_key_handle, data_to_sign, mechanism)
        
        print(f"  ✅ Signature réalisée DANS LE HSM ! Taille: {len(signature)} bytes")
        print(f"  Signature Hex: {bytes(signature)[:16].hex()}...")
    else:
        print("  ℹ️ Clé 'ParadisRootCA_PrivKey' non présente — création requise")

    # 6. Déconnexion et fermeture de session
    session.logout()
    session.closeSession()
    print("[*] Session HSM fermée de manière sécurisée")

# Exécution de la démo (si libsofthsm2 installée)
try:
    hsm_pkcs11_demo()
except Exception as e:
    print(f"[!] HSM Demo (Note): {e}")
```

---

## Module 3 — KMIP (Key Management Interoperability Protocol) (1h30)

### 🔍 Anatomie Technique — Architecture KMIP

```
PROTOCOLE KMIP (OASIS Standard)

  [CLIENT KMIP] ───────────────────────────▶ [SERVEUR KMIP / HSM]
  (vSphere / Storage / DB)  KMIP TTLS 5696  (HashiCorp Vault / Thales)
  
  Opérations KMIP courantes :
  ├── Create (Générer clé symétrique/asymétrique)
  ├── Register (Enregistrer une clé existante)
  ├── Get / Get Attribute (Récupérer clé ou métadonnées)
  ├── Encrypt / Decrypt (Opération déléguée)
  └── Revoke / Destroy (Destruction sécurisée Zeroize)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **HSM** | Hardware Security Module — Équipement matériel dédié et sécurisé à la génération et conservation des clés cryptographiques |
| **PKCS#11** | Public-Key Cryptography Standards #11 (Cryptoki) — API standard C de communication avec les HSM |
| **KMIP** | Key Management Interoperability Protocol — Norme OASIS pour la communication entre serveurs de clés et clients |
| **Zeroization** | Effacement d'urgence immédiat et irréversible des clés en mémoire lors d'une alerte d'intrusion physique |

---

## Exercices Pratiques

### Exercice 1 — Attaque par Tampering sur un HSM Level 3

Que se passe-t-il si un attaquant tente de percer le boîtier d'un HSM certifié **FIPS 140-3 Level 3** avec une perceuse ou un découpeur laser ?

**Corrigé guidé :**
1. Le boîtier du HSM est enveloppé d'un maillage de détection de continuité électrique (Tamper-detection mesh) et de capteurs de pression/lumière/température.
2. La rupture d'un fil du maillage déclenche immédiatement le circuit de **Zeroization**.
3. Une décharge de condensateur efface les clés maîtres stockées dans la mémoire vive volatile (SRAM) du HSM en moins de quelques microsecondes, **avant même que la mèche ou le laser ne pénètre l'enceinte**.
4. Le HSM devient inutilisable et les clés sont définitivement détruites (la restauration nécessite les cartes de secours M-of-N).

---

## Banque QCM — 5 Questions

**Q1.** Le principe fondamental de sécurité d'un **HSM (Hardware Security Module)** est :

- A) Stocker les mots de passe des utilisateurs dans un fichier texte
- B) Les clés privées sont générées et conservées dans un boîtier physique inviolable et ne sortent JAMAIS en clair ✅
- C) Augmenter la vitesse du processeur graphique (GPU)
- D) Bloquer les spams emails

**Q2.** La norme **FIPS 140-3 Level 3** exige qu'un HSM :

- A) Soit peint en bleu
- B) Détecte les tentatives d'ouverture physique du boîtier et déclenche une **Zeroization** automatique des clés ✅
- C) Soit connecté à Internet 24h/24
- D) Ne contienne aucun processeur

**Q3.** L'API standard **PKCS#11** (Cryptoki) sert à :

- A) Configurer les adresses IP des routeurs
- B) Fournir une interface de programmation agnostique pour exécuter des opérations cryptographiques sur un HSM ✅
- C) Compressor des vidéos MP4
- D) Rédiger des documents Word

**Q4.** Le protocole **KMIP (Key Management Interoperability Protocol)** permet de :

- A) Transmettre du courrier électronique chiffré
- B) Normaliser la communication entre des systèmes clients (ex: hyperviseurs, SAN) et un serveur de gestion de clés HSM ✅
- C) Calculer le score de crédit des clients bancaires
- D) Créer des règles de pare-feu Linux

**Q5.** Dans un HSM bancaire (type Thales PayShield), le code **PIN** de la carte bancaire d'un utilisateur est :

- A) Stocké en clair sur le disque du serveur web
- B) Vérifié uniquement DANS le HSM via des clés maîtres (ZMK/LMK) sans jamais apparaître en clair dans l'application ✅
- C) Envoyé par SMS non chiffré
- D) Conservé dans les cookies du navigateur

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
