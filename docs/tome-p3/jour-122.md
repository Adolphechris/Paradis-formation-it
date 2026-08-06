# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 122 (6h) : Sécurité des Systèmes d'Exploitation embarqués & IoT / OT (Linux Yocto, Embedded Hardening & Secure Boot)

> [!NOTE]
> **Objectif du jour :** Concevoir et durcir des systèmes Linux embarqués et terminaux de paiement/IoT (TPE, Distributeurs automatiques ATM) avec Yocto Project : démarrages sécurisés (Hardware Root of Trust / Secure Boot / TPM 2.0), signatures des images de firmware (RAUC / Mender), et verrouillage des bus de communication (UART, JTAG, CAN bus).
>
> **Compétences visées :** `BIT-09` (A) — Linux Embarqué & Yocto | `SEC-03` (A) — Sécurité IoT / Hardware Root of Trust

---

## 1) Module — Hardware Root of Trust, Secure Boot & TPM 2.0 (2h)

### 📖 Narration/Intuition

Les terminaux de paiement bancaires (TPE) et les distributeurs de billets (ATM) sont installés dans des lieux publics sans surveillance constante. Si un attaquant vole un TPE ou ouvre le boîtier d'un ATM, il peut tenter de modifier la mémoire flash du firmware pour y injecter un cheval de Troie qui enregistrera les puces et codes PIN des cartes bancaires.

Le **Secure Boot (Démarrage Sécurisé)** appuyé par une racine de confiance matérielle (**Hardware Root of Trust / TPM 2.0**) garantit que chaque étape du démarrage (ROM de boot -> Bootloader U-Boot -> Noyau Linux -> Système de fichiers) vérifie la signature cryptographique de l'étape suivante avant de lui passer la main. Si le firmware a été altéré, le processeur refuse de démarrer.

### 🔍 Anatomie Technique

**La Chaîne de Confiance Cryptographique au Démarrage (Secure Boot Chain) :**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. HARDWARE ROOT OF TRUST (ROM CPU non modifiable)          │
│    - Clé publique de signature gravée en usine (Fused Key)   │
└─────────────────────────────┬───────────────────────────────┘
                              │ Vérifie la signature de U-Boot
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. SECURE BOOTLOADER (U-Boot Verified Boot)                 │
│    - Vérifie la signature RSA/ECC du Noyau et du Device Tree│
└─────────────────────────────┬───────────────────────────────┘
                              │ Vérifie la signature de l'OS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. NOYAU LINUX & DM-VERITY (System Root FS)                 │
│    - Vérification d'intégrité en temps réel des blocs disque │
└─────────────────────────────┬───────────────────────────────┘
                              │ Mesure d'intégrité
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. TPM 2.0 (Trusted Platform Module)                        │
│    - Déverrouille la clé de chiffrement si l'état est sain   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Durcissement d'un Linux Embarqué avec Yocto Project (2h)

### 📖 Narration/Intuition

**Yocto Project** est le framework industriel standard pour créer des distributions Linux sur-mesure et ultra-légères pour l'embarqué. Pour sécuriser un terminal bancaire, la recette Yocto permet de supprimer la console série (UART), de désactiver les ports USB non autorisés et de compiler le noyau avec les options de durcissement maximales.

### 🔍 Anatomie Technique

**Recette de Durcissement Yocto Layer (`meta-bcc-security/conf/layer.conf`) :**

```bitbake
# Recette Yocto de durcissement pour Terminal de Paiement BCC
SUMMARY = "Durcissement Sécurité Linux Embarqué BCC"
LICENSE = "MIT"

# 1. Supprimer les packages inutiles et dangereux
IMAGE_FEATURES:remove = "debug-tweaks"
IMAGE_FEATURES:remove = "tools-debug"
IMAGE_FEATURES:remove = "ssh-server-dropbear"

# 2. Forcer le système de fichiers racine en Lecture Seule
IMAGE_FEATURES += "read-only-rootfs"

# 3. Supprimer l'interpréteur de commandes shell en production
EXTRA_USERS_PARAMS = " \
    userdel root; \
    usermod -s /bin/false defaultuser; \
"

# 4. Compiler avec protection contre l'exploitation mémoire (PIE, Stack Protector)
SECURITY_CFLAGS = "-fstack-protector-strong -D_FORTIFY_SOURCE=2 -Wformat -Wformat-security -fPIE"
SECURITY_LDFLAGS = "-Wl,-z,relro -Wl,-z,now -pie"
```

---

## 3) Module — Mises à Jour A/B et Attaques Matérielles (UART/JTAG) (2h)

### 📖 Narration/Intuition

Mettre à jour un parc de 10 000 TPE bancaires sur le terrain exige un système de **Mise à jour Failsafe A/B** (ex: avec RAUC ou Mender). Le système possède deux partitions d'OS (`Slot A` et `Slot B`). La mise à jour est écrite sur le `Slot B` inactif pendant que le `Slot A` continue de fonctionner. En cas de coupure de courant pendant l'écriture ou si le nouveau firmware échoue aux tests d'intégrité, le bootloader repasse instantanément sur le `Slot A`.

### 🔍 Anatomie Technique

**Attaques physiques et protections électroniques :**

```
- UART (Universal Asynchronous Receiver-Transmitter) : Connecteur série sur la carte électronique donnant souvent un accès console shell root.
  -> Mitigation : Désactiver l'UART dans le Device Tree Linux ou détruire physiquement les pistes sur la carte.
- JTAG : Interface de débogage processeur permettant de lire la mémoire RAM à chaud.
  -> Mitigation : Verrouiller définitivement le fusible JTAG (JTAG Fuse Lock).
- Bus CAN / I2C : Bus de communication entre composants électroniques.
  -> Mitigation : Utiliser SecOC (Secure On-Board Communication) avec MACs.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **TPM** | Trusted Platform Module — Puce cryptographique matérielle de mesure d'intégrité et stockage de clés |
| **Yocto** | Framework open-source industriel pour la création de distributions Linux embarquées sur-mesure |
| **UART** | Port de communication série sur les cartes électroniques |
| **JTAG** | Interface matérielle de débogage et de test de processeurs |
| **dm-verity** | Module noyau Linux vérifiant l'intégrité bloc par bloc du système de fichiers en lecture seule |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est l'utilité du module noyau Linux **`dm-verity`** sur un terminal bancaire embarqué ?

**Corrigé :** **`dm-verity`** (Device Mapper Verity) assure la vérification d'intégrité cryptographique en temps réel du système de fichiers racine en lecture seule. À chaque fois qu'un bloc de disque est lu, `dm-verity` calcule son hash SHA-256 et le vérifie par rapport à une arborescence de Merkle signée cryptographiquement. Si un attaquant a modifié ne serait-ce qu'un seul octet sur la mémoire flash du terminal, `dm-verity` le détecte instantanément et bloque immédiatement la lecture du bloc altéré.

**Exercice 2 :** Pourquoi la stratégie de mise à jour système **Dual-Bank (A/B Partitioning)** est-elle obligatoire pour les équipements IoT/OT critiques ?

**Corrigé :** La stratégie **A/B Partitioning** garantit l'inviolabilité et la disponibilité du terminal lors des mises à jour réseau (OTA). Le système s'exécute sur la partition active (Slot A) pendant que la mise à jour est téléchargée et écrite sur la partition inactive (Slot B). Si une coupure d'électricité survient pendant la mise à jour, ou si le nouveau firmware sur Slot B ne passe pas les tests de démarrage sécurisé, le bootloader bascule automatiquement sur le Slot A. Le terminal ne risque jamais d'être "briké" (hors d'usage).

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel mécanisme garantit que chaque étape du démarrage d'un terminal embarqué (Bootloader, Noyau, OS) vérifie la signature cryptographique de l'étape suivante avant de l'exécuter ?
- A) Secure Boot (Chain of Trust)
- B) Bluetooth
- C) Disquette 3.5 pouces
- D) Câble HDMI

**Réponse : A**

**Q2 :** Quel framework industriel open-source est le standard mondial pour compiler des distributions Linux embarquées sur-mesure et ultra-sécurisées ?
- A) Yocto Project
- B) MS Word
- C) Paint
- D) Excel

**Réponse : A**

**Q3 :** Quelle puce cryptographique matérielle intégrée à la carte mère permet de mesurer l'intégrité du démarrage et de stocker des clés de chiffrement de manière inviolable ?
- A) TPM 2.0 (Trusted Platform Module)
- B) Clé USB
- C) Carte SD
- D) Haut-parleur

**Réponse : A**

**Q4 :** Quelle interface de communication série souvent présente sous forme de broches sur les cartes électroniques doit être désactivée en production car elle donne un accès console root direct ?
- A) UART (ou JTAG)
- B) Port DisplayPort
- C) Prise Jack audio
- D) Antenne TV

**Réponse : A**

**Q5 :** Quel est le fonctionnement d'un système de mise à jour A/B (Dual-Slot) ?
- A) L'application de la mise à jour s'effectue sur la partition inactive (Slot B) sans interrompre la partition active (Slot A), avec rollback automatique vers Slot A en cas d'échec
- B) La mise à jour supprime toutes les données
- C) La mise à jour s'effectue par e-mail
- D) Il faut racheter un nouvel appareil

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
