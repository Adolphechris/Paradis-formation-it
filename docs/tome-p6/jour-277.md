# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 277 (6h) : Confidential Computing & Sovereign Cloud (AMD SEV-SNP, Intel SGX/TDX, Chiffrement Homomorphe FHE TenSEAL & Confidential Containers CoCo)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **Confidential Computing et le Cloud Souverain** pour la protection des données en cours de traitement (Data in Use) : utiliser les enclaves matérielles **AMD SEV-SNP** et **Intel SGX/TDX**, exécuter des calculs sur données chiffrées via le **Chiffrement Homomorphe (FHE)** avec la bibliothèque **TenSEAL**, et déployer des conteneurs confidentiels avec **CoCo (Confidential Containers)**.
>
> **Compétences visées :** `CONF-01` (A) — Confidential Computing (AMD SEV / Intel SGX) | `CRYPT-01` (A) — Fully Homomorphic Encryption (FHE) with TenSEAL

---

## 1) Module — Protéger la Donnée en Cours de Traitement (Data in Use) (2h)

### 📖 Narration/Intuition

La cryptographie classique protège la donnée au repos (Data at Rest) et en transit (Data in Transit). Cependant, pour traiter la donnée en RAM, celle-ci doit être déchiffrée — exposant les secrets à un administrateur Cloud malveillant ou à un hyperviseur compromis. Le **Confidential Computing** résout ce problème en isolant l'exécution dans une enclave matérielle chiffrée par le processeur.

---

## 2) Module — Chiffrement Homomorphe (FHE) avec TenSEAL (`fhe_computation.py`) (2h)

### 🛠️ Atelier Pratique

**Calcul de somme vectorielle sur données chiffrées sans déchiffrement (`tenseal_demo.py`) :**

```python
import tenseal as ts

# 1) Création du contexte cryptographique FHE (Schéma CKKS)
context = ts.context(
    ts.SCHEME_TYPE.CKKS,
    poly_modulus_degree=8192,
    coeff_mod_bit_sizes=[60, 40, 40, 60]
)
context.global_scale = 2**40
context.generate_galois_keys()

# 2) Données sensibles (ex: solde de comptes bancaires)
data_client_A = [1000.50, 2500.00, 300.75]
data_client_B = [500.25, 1200.00, 150.00]

# 3) Chiffrement local côté client
enc_A = ts.ckks_vector(context, data_client_A)
enc_B = ts.ckks_vector(context, data_client_B)

# 4) Calcul effectué sur un Cloud NON FRANCHI (sans la clé de déchiffrement)
# Addition directe de deux vecteurs chiffrés !
enc_result = enc_A + enc_B

# 5) Déchiffrement du résultat final uniquement chez le client
decrypted_result = enc_result.decrypt()

print(f"[*] Données réelles A : {data_client_A}")
print(f"[*] Données réelles B : {data_client_B}")
print(f"[+] Résultat déchiffré après calcul Cloud Homomorphe : {decrypted_result}")
```

---

## 3) Module — Confidential Containers (CoCo) & Attestation Matérielle (2h)

### 🛠️ Déploiement d'un conteneur confidentiel dans Kubernetes

```yaml
# Pod Kubernetes utilisant le Runtime Kata-CC (Confidential Containers)
apiVersion: v1
kind: Pod
metadata:
  name: confidential-workload
spec:
  runtimeClassName: kata-remote # Attestation AMD SEV-SNP obligatoire
  containers:
    - name: secure-vault-processor
      image: registry.company.local/secure-app:v1
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **FHE** | Fully Homomorphic Encryption — Chiffrement permettant d'effectuer des calculs sur ciphertexts |
| **AMD SEV** | Secure Encrypted Virtualization — Technologie d'isolation mémoire chiffrée par processeur AMD |
| **Intel SGX** | Software Guard Extensions — Enclaves matérielles sécurisées d'Intel |
| **CoCo** | Confidential Containers — Projet CNCF d'exécution de conteneurs dans des enclaves |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel état de la donnée est spécifiquement protégé par les technologies de **Confidential Computing** ?
- A) Data in Use (Données actives en mémoire vive RAM pendant le traitement)
- B) Data at Rest
- C) Data in Transit
- D) Data in Archive

**Réponse : A**

**Q2 :** Quel type de chiffrement permet d'exécuter des opérations mathématiques (additions, multiplications) sur des données chiffrées sans jamais devoir les déchiffrer au préalable ?
- A) FHE (Fully Homomorphic Encryption)
- B) AES-256-GCM
- C) RSA-2048
- D) SHA-256

**Réponse : A**

**Q3 :** Quelle bibliothèque Python open-source développée par OpenMined est basée sur Microsoft SEAL pour l'implémentation du chiffrement homomorphe ?
- A) TenSEAL
- B) PyCrypto
- C) OpenSSL
- D) Hashlib

**Réponse : A**

**Q4 :** Quelle technologie matérielle d'AMD chiffre l'intégralité de la mémoire RAM d'une machine virtuelle pour la protéger contre l'hyperviseur ?
- A) AMD SEV-SNP (Secure Encrypted Virtualization - Secure Nested Paging)
- B) AMD Radeon
- C) Intel VT-x
- D) ARM TrustZone

**Réponse : A**

**Q5 :** Quel projet CNCF permet d'exécuter des conteneurs Kubernetes natifs dans des enclaves de Confidential Computing avec attestation matérielle ?
- A) Confidential Containers (CoCo)
- B) Docker Desktop
- C) Helm
- D) Prometheus

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
