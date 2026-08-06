# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 248 (6h) : Sovereign Cloud & Confidential Computing (Souveraineté des Données, Chiffrement Homomorphe FHE, Enclaves Sécurisées AMD SEV / Intel SGX & Confidential Containers)

> [!NOTE]
> **Objectif du jour :** Maîtriser les technologies de **Souveraineté des Données et de Confidential Computing** requises par les réglementations européennes, bancaires et gouvernementales : protection des données **en cours de traitement (Data in Use)** via les enclaves matérielles (**AMD SEV-SNP**, **Intel SGX**), déploiement de **Confidential Containers (CoCo / Kata Containers)** dans Kubernetes, et introduction au **Chiffrement Homomorphe (FHE — Fully Homomorphic Encryption)** pour effectuer des calculs sur des données chiffrées sans jamais les déchiffrer.
>
> **Compétences visées :** `SEC-04` (A) — Confidential Computing AMD SEV / Intel SGX & Confidential Containers | `SEC-06` (A) — Fully Homomorphic Encryption (FHE) & Data Sovereignty Architecture

---

## 1) Module — Confidential Computing & Enclaves Matérielles (AMD SEV / Intel SGX) (2h)

### 📖 Narration/Intuition

En sécurité classique, les données sont chiffrées **au repos** (Data at Rest, ex: AES-256 sur disque) et **en transit** (Data in Transit, ex: TLS 1.3 sur le réseau). Cependant, lors de leur traitement par le processeur, les données devaient jusqu'ici être déchiffrées **en mémoire RAM (Data in Use)**.

Si un hyperviseur Cloud (AWS, Azure, GCP) ou le système d'exploitation hôte est compromis, un administrateur malveillant ou un attaquant ayant un accès root sur l'hôte peut lire la mémoire RAM en clair. Le **Confidential Computing** résout ce problème en chiffrant la mémoire RAM au niveau matériel du processeur.

### 🔍 Anatomie Technique

**Les 3 États des Données et leur Chiffrement :**

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                         TROIS ÉTATS DE LA DONNÉE                            │
 ├─────────────────────────┬─────────────────────────┬─────────────────────────┤
 │ Data at Rest (Repos)    │ Data in Transit (Transit│ Data in Use (Traitement)│
 ├─────────────────────────┼─────────────────────────┼─────────────────────────┤
 │ Données sur SSD/Disque  │ Flux réseau TCP/IP      │ Données exécutées en RAM│
 │ ✅ Chiffrement AES-256  │ ✅ Chiffrement TLS 1.3  │ 🛡️ CONFIDENTIAL COMPUTING│
 │    (LUKS / BitLocker)   │    (HTTPS / mTLS)        │ (AMD SEV-SNP / SGX)     │
 └─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

---

## 2) Module — Confidential Containers (CoCo) dans Kubernetes (2h)

### 📖 Narration/Intuition

Le projet **Confidential Containers (CoCo)**, hébergé par la CNCF, permet de faire tourner des pods Kubernetes non modifiés à l'intérieur de machines virtuelles de confidentialité (Confidential VMs basées sur AMD SEV-SNP ou Intel TDX). Cela garantit que le fournisseur Cloud lui-même n'a aucun moyen technique d'accéder au contenu du pod.

### 🛠️ Atelier Pratique

**Déploiement d'un Pod Confidential Container dans Kubernetes (`confidential-pod.yaml`) :**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: secure-data-processor
  namespace: confidential-compute
spec:
  replicas: 1
  selector:
    matchLabels:
      app: secure-processor
  template:
    metadata:
      labels:
        app: secure-processor
    spec:
      # RuntimeClass Kata Containers avec support AMD SEV-SNP / Intel TDX
      runtimeClassName: kata-remote
      containers:
        - name: processor
          image: my-registry.internal/secure-processor:v1.0
          securityContext:
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false
          resources:
            limits:
              memory: "4Gi"
              cpu: "2"
```

---

## 3) Module — Chiffrement Homomorphe (FHE — Fully Homomorphic Encryption) (2h)

### 📖 Narration/Intuition

Le **Chiffrement Homomorphe (FHE)** est une avancée cryptographique majeure qui permet d'effectuer des calculs mathématiques (additions, multiplications, requêtes) directement sur des données chiffrées, produisant un résultat chiffré qui, une fois déchiffré par le propriétaire de la clé, donne le même résultat que si le calcul avait été fait en clair.

### 🛠️ Atelier Pratique

**Calcul Homomorphe avec TenSEAL (PyTorch + FHE) (`fhe_demo.py`) :**

```python
import tenseal as ts

# 1. Créer le contexte cryptographique FHE (BFV Scheme pour calculs sur entiers)
context = ts.context(
    ts.SCHEME_TYPE.BFV,
    poly_modulus_degree=4096,
    plain_modulus=1032193
)

# Données sensibles (ex: Solde bancaire, données de santé)
data = [1000, 2500, 4000]

# 2. Chiffrer le vecteur de données côté client
encrypted_vector = ts.bfv_vector(context, data)
print("🔒 Vecteur chiffré transmis au serveur untrusted (Cloud public)")

# 3. Le serveur Cloud effectue un calcul (ex: Ajouter un bonus de 500 à chaque solde)
# SANS JAMAIS DÉCHIFFRER LES DONNÉES !
encrypted_result = encrypted_vector + 500

# 4. Le client déchiffre le résultat final avec sa clé privée
decrypted_result = encrypted_result.decrypt()
print(f"🔓 Résultat déchiffré par le client : {decrypted_result}")
assert decrypted_result == [1500, 3000, 4500]
print("✅ SUCCÈS : Calcul FHE exécuté sur serveur non-de-confiance sans déchiffrement !")
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **FHE** | Fully Homomorphic Encryption — Chiffrement homomorphe complet |
| **AMD SEV** | AMD Secure Encrypted Virtualization — Isolation matérielle des VMs AMD |
| **Intel SGX** | Intel Software Guard Extensions — Enclaves de mémoire sécurisées Intel |
| **CoCo** | Confidential Containers — Projet CNCF pour le traitement conteneurisé sécurisé |
| **Data in Use** | Troisième état de la donnée, lorsqu'elle est en cours de traitement en RAM |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence majeure entre le chiffrement des données au repos (**Data at Rest**) et le **Confidential Computing (Data in Use)** ?

**Corrigé :** Le chiffrement au repos (Data at Rest, ex: LUKS, AES sur disque) protège les données lorsqu me elles sont stockées sur le disque dur. Dès que l'application s'exécute, les données doivent être déchiffrées en mémoire RAM pour être lues par le processeur. Si un attaquant dispose d'un accès root sur l'hyperviseur Cloud ou l'hôte Linux, il peut lire la mémoire RAM en clair. Le **Confidential Computing** résout ce problème en chiffrant la mémoire RAM elle-même au niveau du processeur (AMD SEV / Intel SGX/TDX) avec une clé gérée par le matériel. Les données restent chiffrées même pendant leur traitement en RAM (**Data in Use**).

**Exercice 2 :** Pourquoi le **Chiffrement Homomorphe (FHE)** est-il considéré comme la solution ultime pour l'outsourcing de calculs sensibles sur des Cloud publics non de confiance ?

**Corrigé :** Le FHE permet à un serveur tiers (ex: un Cloud public untrusted) d'exécuter des opérations algorithmiques complexes directement sur des ciphertexts (données chiffrées) sans jamais posséder la clé de déchiffrement. Le fournisseur Cloud effectue les traitements sans pouvoir lire ni comprendre les données d'entrée ou de sortie. La confidentialité des données est garantie à 100% sur le plan mathématique.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel état de la donnée est protégé spécifiquement par les technologies de **Confidential Computing** (AMD SEV-SNP, Intel SGX) ?
- A) Data in Use (Données en cours de traitement en mémoire RAM)
- B) Data at Rest
- C) Data in Transit
- D) Data in Backup

**Réponse : A**

**Q2 :** Quel projet de la CNCF permet d'exécuter des conteneurs Kubernetes dans des machines virtuelles chiffrées de confidentialité pour les isoler de l'hôte Cloud ?
- A) Confidential Containers (CoCo / Kata Containers)
- B) Docker Desktop
- C) Helm
- D) Prometheus

**Réponse : A**

**Q3 :** Quelle avancée cryptographique permet d'exécuter des additions ou multiplications mathématiques sur des données chiffrées sans les déchiffrer au préalable ?
- A) Fully Homomorphic Encryption (FHE)
- B) AES-GCM
- C) SHA-256
- D) RSA-2048

**Réponse : A**

**Q4 :** Quelle technologie d'isolation processeur d'AMD chiffres intégralement la mémoire RAM des machines virtuelles pour les protéger de l'hyperviseur ?
- A) AMD SEV-SNP (Secure Encrypted Virtualization)
- B) Intel VT-x
- C) ARM TrustZone
- D) NVIDIA CUDA

**Réponse : A**

**Q5 :** Dans la bibliothèque TenSEAL, quel schéma de chiffrement homomorphe est particulièrement adapté aux opérations arithmétiques sur des entiers ?
- A) BFV Scheme
- B) RSA Scheme
- C) Diffie-Hellman
- D) ECDSA

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
