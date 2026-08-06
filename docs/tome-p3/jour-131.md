# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 131 (6h) : Sécurité du Firmware, Hardware Root of Trust & Attaques Physiques (SPI Flash, JTAG/SWD, Fault Injection & Side-Channel)

> [!NOTE]
> **Objectif du jour :** Comprendre l'audit de sécurité matérielle et du firmware des équipements critiques (serveurs bare-metal, HSM, terminaux de paiement) : extraction de firmware SPI Flash (binwalk), interfaces de débogage physique (JTAG/SWD), attaques par injection de fautes (Voltage/Clock Glitching) et canaux auxiliaires.
>
> **Compétences visées :** `SEC-06` (A) — Hardware Hacking & Firmware Security | `BIT-09` (A) — Architecture Processeurs & Root of Trust

---

## 1) Module — Inspection & Extraction de Firmware SPI Flash (2h)

### 📖 Narration/Intuition

Sur les cartes mères de serveurs bancaires ou de commutateurs réseau, le code de démarrage (BIOS/UEFI, U-Boot) est stocké physiquement dans une puce mémoire mémoire **SPI Flash** (Serial Peripheral Interface).

Un auditeur de sécurité matérielle (Hardware Security Auditor) ou un attaquant physique peut utiliser une pince de test (SOIC-8 Clip) et un programmateur matériel (ex: Bus Pirate / CH341A) pour lire directement les octets du firmware sur la puce sans même allumer le processeur.

### 🔍 Anatomie Technique

**Architecture de Lecture Physique d'une Puce SPI Flash :**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ÉQUIPEMENT DE LECTURE MATÉRIELLE (BUS PIRATE / CH341A)   │
│  - Connecté en USB sur le poste de l'auditeur               │
│  - Pince SOIC-8 fixée sur les broches de la puce SPI Flash   │
└──────────────┬──────────────────────────────┬───────────────┘
               │ Signal SPI (CS, CLK, MISO, MOSI)
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PUCE MÉMOIRE SPI FLASH SUR LA CARTE MÈRE                 │
│  - Stocke le binaire du Firmware (ROM Bootloader)           │
└─────────────────────────────────────────────────────────────┘
```

**Commandes d'extraction et d'analyse de firmware (`flashrom` & `binwalk`) :**

```bash
# 1. Lire le contenu binaire complet de la puce SPI Flash via flashrom
sudo flashrom -p ch341a_spi -r /tmp/firmware_dump.bin

# 2. Inspecter la structure interne du firmware avec Binwalk
binwalk /tmp/firmware_dump.bin

# 3. Extraire automatiquement le système de fichiers embarqué (Squashfs/Cramfs)
binwalk -e --matryoshka /tmp/firmware_dump.bin

# 4. Rechercher les clés privées SSH ou mots de passe en clair dans le système de fichiers extrait
grep -r "BEGIN RSA PRIVATE KEY" /tmp/_firmware_dump.bin.extracted/
```

---

## 2) Module — Interfaces de Débogage Matériel (JTAG / SWD) & Fault Injection (2h)

### 📖 Narration/Intuition

**JTAG (Joint Test Action Group)** et **SWD (Serial Wire Debug)** sont des interfaces matérielles intégrées aux processeurs pour permettre aux ingénieurs de déboguer le code au niveau des registres processeur.

Si l'interface JTAG n'est pas verrouillée par fusible (Fuse Lock), un attaquant connecté via une sonde (OpenOCD + FT2232H) peut suspendre l'exécution du processeur, modifier la mémoire RAM et contourner les vérifications de mot de passe.

Les attaques par **Injection de Fautes (Voltage Glitching)** consistent à créer une micro-baisse de tension sur l'alimentation du CPU au moment précis où le processeur évalue l'instruction `if (password_correct)` pour lui faire sauter le test de sécurité !

### 🔍 Anatomie Technique

**Connexion à un processeur via OpenOCD et JTAG :**

```bash
# Lancer OpenOCD avec la sonde FT2232H et la cible ARM Cortex-M4
openocd -f interface/ft2232h.cfg -f target/stm32f4x.cfg

# Connexion via Telnet sur le port 4444 pour contrôler le processeur
telnet localhost 4444

# Commandes OpenOCD :
# > halt                  # Interrompt immédiatement le processeur
# > reg                   # Affiche le contenu des registres CPU (PC, SP, R0-R12)
# > mdw 0x08000000 32     # Lit 32 mots de mémoire vive à l'adresse spécifiée
# > resume                # Reprend l'exécution
```

---

## 3) Module — Durcissement Hardware & Secure Element / HSM (2h)

### 📖 Narration/Intuition

Pour contrer ces attaques matérielles avancées, les serveurs d'entreprise et HSM utilisent des **Secure Elements (SE)** ou **TPM 2.0** scellés avec de la résine époxy et équipés de capteurs de détection d'intrusion physique (capteurs de lumière, de température, de tension). Dès qu'une effraction physique est détectée, le Secure Element détruit immédiatement les clés maîtresse en mémoire.

### 🔍 Anatomie Technique

**Contre-mesures de durcissement matériel :**

```
- Verrouillage des fusibles JTAG/SWD (Disable Debug Interface).
- Chiffrement du bus mémoire RAM (AMD SEV / Intel SGX / Total Memory Encryption).
- Protections de cartes : Résine époxy, pistes de tampons d'auto-destruction, boîtier Faraday.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SPI** | Serial Peripheral Interface — Bus de communication série synchrone pour puces mémoires |
| **JTAG** | Joint Test Action Group — Interface standard de test et débogage processeur |
| **SWD** | Serial Wire Debug — Protocole de débogage à 2 broches pour processeurs ARM |
| **Glitching** | Attaque physique perturbant l'horloge ou la tension du CPU pour provoquer un bogue |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Qu'est-ce qu'une attaque par **Voltage Glitching (Injection de Fautes de Tension)** sur un microcontrôleur sécurisé ?

**Corrigé :** Une attaque par **Voltage Glitching** consiste à appliquer une impulsion négative ultra-courte (quelques nanosecondes) sur la broche d'alimentation VCC du processeur au moment précis où celui-ci s'apprête à exécuter une instruction de contrôle de sécurité (ex: la vérification d'une signature numérique ou d'un mot de passe). La baisse de tension brutale perturbe le décodage d'instructions du processeur sans le faire crasher, lui faisant sauter l'instruction de comparaison (`CMP` / `BEQ`) ou exécuter un NOP (`No Operation`), contournant ainsi le contrôle d'accès.

**Exercice 2 :** Quel est le rôle de l'outil open-source **Binwalk** lors de l'analyse d'un firmware binaire extrait d'une puce mémoire SPI Flash ?

**Corrigé :** **Binwalk** est un outil d'analyse et d'extraction de fichiers binaires. Il scanne le fichier dump du firmware à la recherche de signatures magiques connues (Magic Bytes) correspondant à des en-têtes de systèmes de fichiers (Squashfs, ext4, Cramfs), d'archives (zip, tar, gzip) ou de noyaux Linux (vmlinuz). Binwalk permet d'extraire automatiquement l'arborescence complète du système de fichiers du firmware pour inspecter le code source, les scripts de configuration et les identifiants masqués.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel outil d'analyse en ligne de commande est le standard pour scanner un dump de firmware binaire et en extraire les systèmes de fichiers embarqués ?
- A) Binwalk
- B) MS Paint
- C) Disquette
- D) Word

**Réponse : A**

**Q2 :** Quelle interface matérielle intégrée aux processeurs permet de déboguer le code directement au niveau des registres CPU mais doit être désactivée en production par fusible pour empêcher le piratage ?
- A) JTAG (ou SWD)
- B) Prise Jack Audio
- C) Port HDMI
- D) Antenne radio

**Réponse : A**

**Q3 :** Quel outil open-source s'interface avec des sondes matérielles (ex: FT2232H) pour contrôler et déboguer des processeurs ARM/MIPS via JTAG ?
- A) OpenOCD
- B) Gzip
- C) Telnet
- D) Systemd

**Réponse : A**

**Q4 :** Comment appelle-t-on la technique d'attaque physique consistant à envoyer des micro-variations de tension ou d'horloge au processeur pour lui faire sauter des instructions de sécurité ?
- A) Fault Injection / Voltage Glitching
- B) Formatage de disque
- C) Copie de fichier
- D) Impression

**Réponse : A**

**Q5 :** Quel composant matériel hautement sécurisé est conçu pour s'auto-détruire ou effacer ses clés cryptographiques en mémoire en cas de détection d'une effraction physique ?
- A) HSM (Hardware Security Module) / Secure Element
- B) Clé USB
- C) Lecteur DVD
- D) Écran LCD

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
