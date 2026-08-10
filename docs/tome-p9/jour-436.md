# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 436 (6h) : Hardware Security & Confidential Computing — Enclaves Intel SGX, AMD SEV-SNP, TPM 2.0 PCR Remote Attestation & ARM TrustZone Architecture

> [!NOTE]
> **Objectif du jour :** Maîtriser le paradigme du **Confidential Computing (Calcul Confidentiel Matériel)** : comprendre l'isolation mémoire par enclaves matérielles (**Intel SGX, AMD SEV-SNP, ARM TrustZone**), mettre en œuvre l'**Attestation Distante (Remote Attestation)** basée sur le composant **TPM 2.0 (Platform Configuration Registers — PCRs)**, protéger les données en mémoire vive (Data-in-Use Encryption) contre un hyperviseur ou un système d'exploitation hôte compromis, et auditer la chaîne de confiance matérielle (Root of Trust).
>
> **Compétences visées :** `HARDWARE-CRYPTO-01` (A) — Confidential Computing Architecture (Intel SGX, AMD SEV-SNP & Data-in-Use Memory Isolation) | `HARDWARE-CRYPTO-02` (A) — TPM 2.0 Remote Attestation (PCR Quotes, AK Keys) & Trusted Execution Environment (TEE) Audit

---

## 1) Module — Confidential Computing & Attestation TPM 2.0 (2h)

### 📖 Narration/Intuition

Le Confidential Computing résout le troisième pilier du chiffrement : après les données au repos (Data-at-Rest) et les données en transit (Data-in-Transit), il protège les **données en cours de traitement en mémoire RAM (Data-in-Use)**. Même si l'administrateur système (root) ou l'hyperviseur Cloud (AWS/GCP/Azure) est compromis ou malveillant, il ne peut pas lire le contenu de la mémoire RAM protégée par une enclave matérielle (**TEE — Trusted Execution Environment**).

```
  ═══════════════════════════════════════════════════════════════════
    ARCHITECTURE CONFIDENTIAL COMPUTING (DATA-IN-USE ISOLATION)
  ═══════════════════════════════════════════════════════════════════

  ┌─────────────────────────────────────────────────────────────────┐
  │ SYSTÈME D'EXPLOITATION HÔTE / HYPERVISEUR COMPROMIS (ROOT/KVM) │
  ├─────────────────────────────────────────────────────────────────┤
  │ ❌ N'A AUCUN ACCÈS À LA MÉMOIRE RAM CHIFFRÉE DE L'ENCLAVE !      │
  └─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼ (Clé AES hardware du CPU)
  ┌─────────────────────────────────────────────────────────────────┐
  │ ENCLAVE MATÉRIELLE CHIFFRÉE (Intel SGX / AMD SEV-SNP TEE)      │
  │ - Chiffrement temps-réel de la RAM par le contrôleur CPU       │
  │ - Code sensible & Clés privées isolés                           │
  └─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼ (Rapport d'attestation signé par la puce)
  ┌─────────────────────────────────────────────────────────────────┐
  │ ATTESTATION DISTANTE TPM 2.0 / SGX QUOTE VERIFICATION           │
  │ Vérifie que le code exécuté dans l'enclave est 100% authentique │
  └─────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Outillage Confidential Computing Simulator (`tee_attestation_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import os
import hashlib
import json
from datetime import datetime, timezone
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes

class TEEAttestationEngine:
    """
    Moteur de simulation de Confidential Computing & Attestation Distante TPM 2.0 / Intel SGX :
    - Calcul des registres PCR (Platform Configuration Registers) TPM 2.0
    - Génération du rapport d'attestation signé par la puce matérielle (Attestation Key AK)
    - Vérification d'intégrité du code enclave par le client distant
    """

    def __init__(self, hardware_chip_id: str):
        self.chip_id = hardware_chip_id
        # Clé d'Attestation (AK - Attestation Key) scellée dans le TPM/CPU
        self.ak_private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        self.ak_public_key = self.ak_private_key.public_key()
        
        # Registres PCR TPM 2.0 (PCR[0] = Firmware, PCR[4] = Bootloader, PCR[10] = Enclave Code)
        self.pcr_registers = {
            0: bytes.fromhex("0" * 64),
            4: bytes.fromhex("0" * 64),
            10: bytes.fromhex("0" * 64)
        }

    def measure_and_extend_pcr(self, pcr_index: int, measurement_data: bytes):
        """
        Simule l'extension cryptographique d'un registre PCR TPM :
        PCR[i] = SHA-256(PCR[i] || Hash(MeasurementData))
        Garantit que la mesure est immuable et accumulative.
        """
        current_pcr = self.pcr_registers[pcr_index]
        data_hash = hashlib.sha256(measurement_data).digest()
        new_pcr = hashlib.sha256(current_pcr + data_hash).digest()
        self.pcr_registers[pcr_index] = new_pcr
        print(f"  [TPM 2.0] PCR[{pcr_index}] étendu → Nouvelle empreinte: {new_pcr.hex()[:16]}...")

    def generate_remote_attestation_quote(self, nonce_client: bytes) -> dict:
        """
        Génère une preuve d'attestation distante (Attestation Quote).
        La puce matérielle signe les registres PCR + le nonce du client.
        """
        print(f"\n[*] GÉNÉRATION DU RAPPORT D'ATTESTATION DISTANTE (TEE {self.chip_id})")
        
        # Construction du corps du rapport d'attestation
        quote_body = {
            "chip_id": self.chip_id,
            "tee_type": "AMD SEV-SNP / Intel SGX",
            "pcr_0_firmware": self.pcr_registers[0].hex(),
            "pcr_10_enclave_code": self.pcr_registers[10].hex(),
            "client_nonce": nonce_client.hex(),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        quote_bytes = json.dumps(quote_body, sort_keys=True).encode()
        
        # Signature par la clé d'attestation matérielle (AK)
        signature = self.ak_private_key.sign(
            quote_bytes,
            padding.PKCS1v15(),
            hashes.SHA256()
        )

        quote_package = {
            "quote_body": quote_body,
            "signature_hex": signature.hex()[:32] + "...",
            "ak_public_key_pem": "PUBLIC_KEY_CERTIFIED_BY_AMD_INTEL_ROOT_CA"
        }
        print(f"  [+] Rapport d'Attestation signé par la puce {self.chip_id} ✅")
        return quote_package

# Démonstration TEE Attestation Engine
engine = TEEAttestationEngine("AMD-EPYC-SEV-SNP-CHIP-9988")
print("=== CONFIDENTIAL COMPUTING & TPM 2.0 ATTESTATION ENGINE ===")

# 1. Mesure cryptographique du code enclave dans PCR 10
enclave_binary = b"PARADIS_ENCLAVE_CODE_v1.0_SIGNED"
engine.measure_and_extend_pcr(10, enclave_binary)

# 2. Demande d'attestation par un client distant avec Nonce anti-rejeu
client_nonce = os.urandom(16)
quote = engine.generate_remote_attestation_quote(client_nonce)
```

---

## 3) Module — Fiche des Technologies TEE (2h)

```markdown
# COMPARAISON DES ENVIRONNEMENTS D'EXÉCUTION DE CONFIANCE (TEE)

| Technologie | Vendeur | Niveau d'Isolation | Protection contre l'Hôte / Root |
|:---|:---:|:---:|:---:|
| **Intel SGX** | Intel | Application / Enclave isolée | ✅ OUI (Enclave mémoire isolée) |
| **AMD SEV-SNP** | AMD | Machine Virtuelle entière (Confidential VM)| ✅ OUI (Mémoire VM chiffrée AES-128/256) |
| **ARM TrustZone** | ARM | Système / Secure World vs Normal World | ✅ OUI (Séparation matérielle) |
| **AWS Nitro Enclaves** | AWS | Enclave EC2 isolée sans stockage ni SSH | ✅ OUI (Aucun accès opérateur AWS) |
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **TEE** | Trusted Execution Environment — Environnement mémoire isolé et chiffré au niveau du processeur |
| **TPM** | Trusted Platform Module — Composant matériel dédié à la cryptographie et aux mesures de boot |
| **PCR** | Platform Configuration Register — Registre TPM accumulant les empreintes cryptographiques du boot |
| **SGX / SEV-SNP** | Intel Software Guard Extensions / AMD Secure Encrypted Virtualization-Secure Nested Paging |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quel est le problème de sécurité majeur que le **Confidential Computing (Data-in-Use Encryption)** résout par rapport au chiffrement de stockage classique ?
- A) Il protège les données et clés privées directement en mémoire RAM pendant leur traitement par le processeur, empêchant un hyperviseur ou un administrateur système hôte compromis d'accéder aux données en clair
- B) Il accélère la vitesse de téléchargement des fichiers
- C) Il remplace les mots de passe par des empreintes digitales
- D) Il supprime le besoin de pare-feu réseau

**Réponse : A**

**Q2 :** Quel est le principe de l'**Attestation Distante (Remote Attestation)** dans un environnement TEE ?
- A) La puce matérielle (CPU/TPM) génère un rapport cryptographique signé contenant l'empreinte exacte (PCR) du code exécuté dans l'enclave, prouvant au client distant que le serveur exécute du code authentique et non modifié
- B) Le serveur envoie sa clé privée en clair au client
- C) Le client se connecte sans mot de passe
- D) L'administrateur confirme par téléphone l'intégrité de la machine

**Réponse : A**

**Q3 :** Comment un registre **PCR (Platform Configuration Register)** TPM 2.0 garantit-il l'immuabilité des mesures accumulées depuis le démarrage de la machine ?
- A) Grâce à l'opération cryptographique d'extension : $PCR_{new} = SHA256(PCR_{old} \parallel Hash(Data))$, rendant impossible la falsification ou la suppression d'une mesure passée
- B) En verrouillant le registre avec un mot de passe utilisateur
- C) En enregistrant les données sur une carte SD externe
- D) En redémarrant la machine à chaque mesure

**Réponse : A**

**Q4 :** Quelle est la différence majeure d'architecture entre **Intel SGX** et **AMD SEV-SNP** ?
- A) Intel SGX isole des morceaux de code applicatif spécifiques (Enclaves), tandis qu'AMD SEV-SNP chiffre et isole des Machines Virtuelles (Confidential VMs) entières sans modifier les applications
- B) Intel SGX est un logiciel et AMD SEV-SNP est un composant réseau
- C) AMD SEV-SNP ne fonctionne qu'avec Windows
- D) Intel SGX est interdit par la norme FIPS

**Réponse : A**

**Q5 :** Quel est le rôle d'un **Nonce** envoyé par le client lors d'une procédure d'attestation distante TEE ?
- A) Empêcher les attaques par rejeu en garantissant que le rapport d'attestation renvoyé par la puce matérielle a été généré à l'instant présent et ne réutilise pas une preuve ancienne
- B) Chiffrer la carte réseau du serveur
- C) Calculer l'adresse IP du client
- D) Augmenter la taille de la mémoire RAM

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
