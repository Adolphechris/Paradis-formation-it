# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 217 (6h) : Sécurité IoT & Systèmes Embarqués (Firmware Reverse Engineering, Binwalk, UART/JTAG Interfacing, MQTT & Embedded Exploitation)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'évaluation de la sécurité des équipements **Internet des Objets (IoT)** et des systèmes embarqués : extraction et reverse engineering de firmwares avec **Binwalk** et **Ghidra**, analyse des bus de communication matériels (**UART / JTAG**), sécurité des protocoles IoT (**MQTT**, CoAP), et exploitation de vulnérabilités embarquées.
>
> **Compétences visées :** `SEC-06` (A) — Security Audit IoT & Firmware Reverse Engineering | `SEC-04` (A) — Hardware Interfacing UART/JTAG & MQTT Hardening

---

## 1) Module — Extraction & Reverse Engineering de Firmware (2h)

### 📖 Narration/Intuition

Dans une infrastructure bancaire ou télécoms, de nombreux équipements physiques (caméras de surveillance, routeurs de secours, terminaux de paiement POS, capteurs d'accès) sont des systèmes embarqués fonctionnant sous un Linux tronqué.

Un attaquant qui récupère le fichier de mise à jour du firmware d'une caméra ou d'un routeur peut l'analyser pour découvrir des mots de passe administrateurs codés en dur, des clés SSH privées ou des portes dérobées (backdoors) cachées.

### 🔍 Anatomie Technique

**Structure d'une Image de Firmware IoT :**

```
┌─────────────────────────────────────────────────────────────┐
│                 HEADER DU FIRMWARE (Vendor)                 │
│  - Magic Bytes (ex: U-Boot Header, Squashfs Header)         │
│  - CRC32 Checksum / Signature                               │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 NOYAU LINUX EMBARQUÉ (vmlinuz)              │
│  - Noyau compressé (gzip/lzma)                              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               SYSTÈME DE FICHIERS (Squashfs / JFFS2)        │
│  - /etc/shadow, /etc/passwd (Hashes de mots de passe)       │
│  - /bin/busybox (Commandes Unix)                            │
│  - /etc/ssl/private/ (Clés privées RSA / Certificats)       │
└─────────────────────────────────────────────────────────────┘
```

**Extraction d'un Firmware avec Binwalk :**

```bash
# 1. Analyser la structure d'un fichier binaire de firmware avec Binwalk
binwalk firmware_camera_bcc.bin

# 2. Extraire automatiquement le système de fichiers embarqué (Squashfs/Linux)
binwalk -e --matryoshka firmware_camera_bcc.bin

# 3. Explorer le système de fichiers extrait (_firmware_camera_bcc.bin.extracted/squashfs-root/)
cd _firmware_camera_bcc.bin.extracted/squashfs-root/
cat etc/shadow
grep -rn "password" etc/
```

---

## 2) Module — Interface Matérielle (UART & JTAG) (2h)

### 📖 Narration/Intuition

Lorsque l'analyse statique du firmware ne suffit pas, le pentesteur IoT ouvre le boîtier physique de l'équipement pour se connecter directement aux bus de communication matériels de la carte électronique : **UART (Universal Asynchronous Receiver-Transmitter)** et **JTAG (Joint Test Action Group)**.

Le port **UART** fournit souvent un **shell root direct** sur la console série de l'équipement sans aucune authentification demandée !

### 🔍 Anatomie Technique

**Identification des Broches UART sur le Circuit Imprimé (PCB) :**

```
        VCC (3.3V) ──► 🔴 (Ne PAS connecter à l'adaptateur USB !)
        GND        ──► ⬛ (Masse commune)
        TX (Trans) ──► 🟦 (Se connecte au RX de l'adaptateur USB-TTL)
        RX (Recv)  ──► 🟩 (Se connecte au TX de l'adaptateur USB-TTL)
```

**Connexion au Shell Série avec Minicom / Screen :**

```bash
# Se connecter à la console série via un adaptateur USB-TTL (ex: FTDI / CP2102)
# Vitesse standard (Baudrate) : 115200 bps
sudo screen /dev/ttyUSB0 115200

# Résultat : Accès direct à la console U-Boot et au Shell Linux Root du routeur !
```

---

## 3) Module — Sécurité des Protocoles IoT & MQTT (2h)

### 📖 Narration/Intuition

**MQTT (Message Queuing Telemetry Transport)** est le protocole de messagerie léger le plus populaire de l'IoT. Il repose sur un modèle Publish/Subscribe via un **Broker MQTT**.

Un Broker MQTT mal sécurisé (sans authentification et sans TLS) permet à n'importe quel attaquant connecté au réseau d'écouter l'ensemble des données des capteurs bancaires ou d'injecter de fausses commandes.

### 🛠️ Atelier Pratique

**Audit et Hardening d'un Broker MQTT (Mosquitto) :**

```bash
# 1. Écouter TOUS les messages transitant sur un broker MQTT non sécurisé
mosquitto_sub -h 192.168.1.100 -t "#" -v

# 2. Publier une fausse commande de désactivation d'alarme
mosquitto_pub -h 192.168.1.100 -t "bcc/securite/alarme" -m "{\"status\": \"OFF\"}"
```

**Configuration Mosquitto Sécurisée (`mosquitto.conf`) :**

```ini
# 1. Désactiver les accès anonymes
allow_anonymous false

# 2. Emplacement du fichier de mots de passe hachés
password_file /etc/mosquitto/passwd

# 3. Exiger TLS 1.3 avec certificat serveur et port 8883
listener 8883
cafile /etc/mosquitto/ca.crt
certfile /etc/mosquitto/server.crt
keyfile /etc/mosquitto/server.key
tls_version tlsv1.3
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **UART** | Universal Asynchronous Receiver-Transmitter — Bus de communication série matériel |
| **JTAG** | Joint Test Action Group — Norme de test et de débogage des puces électroniques |
| **MQTT** | Message Queuing Telemetry Transport — Protocole de messagerie léger Publish/Subscribe |
| **PCB** | Printed Circuit Board — Carte de circuit imprimé électronique |
| **Squashfs** | Système de fichiers compressé en lecture seule utilisé dans la majorité des firmwares Linux |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Qu'est-ce qu'un port **UART** sur une carte électronique IoT et pourquoi constitue-t-il souvent un risque de sécurité critique ?

**Corrigé :** Un port **UART (Universal Asynchronous Receiver-Transmitter)** est une interface série matérielle composée généralement de 4 broches (VCC, GND, TX, RX) imprimées sur le circuit électronique d'un équipement IoT. Il est utilisé par les ingénieurs lors du développement pour afficher les logs de démarrage (bootloader U-Boot) et accéder à la console de commande Linux. Le risque de sécurité critique survient lorsque les fabricants laissent ce port actif et accessible physiquement dans la version commerciale de l'équipement **sans aucune exigence d'authentification** : un attaquant qui ouvre le boîtier et branche un adaptateur USB-TTL à 5€ obtient immédiatement un **shell Linux avec les privilèges Root**, lui donnant le contrôle total du matériel.

**Exercice 2 :** Pourquoi la configuration par défaut de nombreux brokers MQTT (`allow_anonymous true`) est-elle dangereuse dans un réseau d'entreprise ?

**Corrigé :** Par défaut, de nombreux brokers MQTT (comme Mosquitto) autorisent les connexions anonymes sans nom d'utilisateur ni mot de passe (`allow_anonymous true`) et écoutent sur le port TCP 1883 en clair. Dans un réseau d'entreprise, un attaquant ou un équipement compromis connecté au Wi-Fi/Ethernet peut utiliser la souscription au wildcard `#` (`mosquitto_sub -t "#"`) pour intercepter **l'intégralité des messages de tous les capteurs et équipements IoT de l'organisation**, ou utiliser `mosquitto_pub` pour injecter de fausses données (ex: déclencher une fausse alerte incendie ou couper les caméras). Sécuriser MQTT nécessite d'imposer l'authentification nominative (`allow_anonymous false`) et d'obliger le chiffrement **TLS sur le port 8883**.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel outil open-source basé sur Linux permet d'analyser la structure binaire d'un fichier de firmware IoT et d'en extraire automatiquement le système de fichiers compressé (ex: Squashfs) ?
- A) Binwalk
- B) Nmap
- C) Wireshark
- D) Metasploit

**Réponse : A**

**Q2 :** Quel bus de communication série matériel, identifié par 4 broches sur le circuit imprimé (PCB) d'un équipement IoT, fournit souvent un accès console shell Root direct ?
- A) UART
- B) HDMI
- C) SATA
- D) PCI Express

**Réponse : A**

**Q3 :** Quel est le protocole de messagerie léger Publish/Subscribe standard utilisé pour la communication entre capteurs et serveurs IoT ?
- A) MQTT
- B) HTTP/2
- C) SSH
- D) BGP

**Réponse : A**

**Q4 :** Quel port réseau chiffré TLS est la norme recommandée pour la communication MQTT sécurisée (par opposition au port 1883 en clair) ?
- A) Port 8883
- B) Port 80
- C) Port 21
- D) Port 3389

**Réponse : A**

**Q5 :** Quel est le nom du système de fichiers compressé en lecture seule le plus fréquemment extrait des firmwares Linux embarqués ?
- A) Squashfs
- B) NTFS
- C) FAT32
- D) EXT2

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
