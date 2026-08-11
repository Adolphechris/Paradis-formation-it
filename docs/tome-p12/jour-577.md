# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 577 (6h) : Space Technology & Satellite Computing — CubeSat, LoRa & Orbital AI

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre l'architecture d'un **CubeSat** (satellite format 1U–6U) : OBC (On-Board Computer), ADCS, EPS, Communication UHF/S-Band
> - Maîtriser le protocole **LoRaWAN** (Long Range Wide Area Network) pour les communications IoT longue portée bas débit (> 10 km)
> - Appréhender les enjeux de l'**Orbital AI** : traitement IA embarqué (Edge AI on Satellite), réduction du downlink, détection d'anomalies en orbite
> - Concevoir une architecture **Ground Station Network** pour la réception et le traitement des données satellitaires
>
> **Compétences visées :** `ARCH-01` (A), `AI-01` (A) — Space Technology, CubeSat, LoRaWAN, Orbital AI

---

## Module 1 — Architecture CubeSat & Communications Spatiales (2h)

### 📖 Intuition & Narration

En 1999, les professeurs Jordi Puig-Suari (Cal Poly) et Bob Twiggs (Stanford) proposèrent un format de satellite standardisé de **10 cm × 10 cm × 10 cm** pesant moins de 1,33 kg — le **CubeSat 1U**. Cette standardisation révolutionna l'accès à l'espace en permettant à des universités, startups et pays en développement de lancer leurs propres satellites pour quelques centaines de milliers de dollars contre plusieurs centaines de millions pour un satellite conventionnel.

```
ARCHITECTURE D'UN CUBESAT 1U (10 × 10 × 10 cm)

  ┌────────────────────────────────────────────────────┐
  │  OBC — On-Board Computer                          │
  │  (Raspberry Pi Compute Module / ARM Cortex-M7)   │
  ├────────────────────────────────────────────────────┤
  │  ADCS — Attitude Determination & Control System   │
  │  (IMU 9-DOF + Magnetorquers + Reaction Wheels)   │
  ├────────────────────────────────────────────────────┤
  │  EPS — Electrical Power System                    │
  │  (Panneaux Solaires + Batterie LiPo + MPPT)      │
  ├────────────────────────────────────────────────────┤
  │  COM — Communication Subsystem                    │
  │  (UHF 437 MHz downlink 9.6kbps + S-Band 2.4GHz)  │
  ├────────────────────────────────────────────────────┤
  │  PAYLOAD — Charge Utile                           │
  │  (Caméra Multispectrale / Dosimètre / ADS-B)     │
  └────────────────────────────────────────────────────┘

  ORBITES TYPIQUES CUBESAT :
  LEO (Low Earth Orbit) : 400 – 2000 km d'altitude
  - Période orbitale : ~90 minutes
  - Vitesse : ~7.8 km/s
  - Latence communication : 1 – 15 ms
  - Durée de passage au-dessus d'une station sol : 5 – 15 minutes
```

### 🔍 Budget de Liaison (Link Budget) — UHF CubeSat

Le **Link Budget** détermine si la communication entre le satellite et la station sol est viable :

```
LINK BUDGET SIMPLIFIÉ — UHF 437 MHz (downlink CubeSat → Sol)

  Puissance émetteur (TX)          : +30 dBm  (1 W)
  Gain antenne satellite (TX)      : +2 dBi   (dipôle)
  Pertes espace libre (FSPL, LEO)  : -147 dB  (à 600 km, 437 MHz)
  Gain antenne sol (RX)            : +15 dBi  (Yagi 9 éléments)
  Pertes câbles & connecteurs      : -2 dB
  ─────────────────────────────────────────────────────────
  PUISSANCE REÇUE (C/N)            : 30+2-147+15-2 = -102 dBm

  Sensibilité récepteur AFSK 9.6k  : -118 dBm
  MARGE DE LIAISON (Link Margin)   : -102 - (-118) = +16 dB  ✅
  (Marge > 10 dB : liaison viable)
```

---

## Module 2 — LoRaWAN & Orbital AI (2h)

### 🔍 LoRaWAN — Long Range Wide Area Network

**LoRa (Long Range)** est une modulation radio chirp spread spectrum permettant des communications très longue portée (2–15 km en zone urbaine, > 50 km en LOS) avec une consommation électrique ultra-faible (< 100 mW), idéale pour les capteurs IoT à batterie.

```
ARCHITECTURE LORAWAN

  ┌───────────┐      LoRa RF       ┌───────────────┐    MQTT/HTTP   ┌──────────────┐
  │End Device │ ─────────────────► │  LoRa Gateway │ ─────────────► │LoRaWAN Server│
  │(Capteur)  │    (SF7-SF12)      │(Concentrateur)│               │ (ChirpStack) │
  └───────────┘   868 MHz (EU)     └───────────────┘               └──────┬───────┘
                                                                           │ MQTT
                                                                    ┌──────┴───────┐
                                                                    │  Application │
                                                                    │  (Dashboard) │
                                                                    └──────────────┘

  PARAMÈTRES CLÉS LORAWAN :
  SF (Spreading Factor) SF7 – SF12 : Plus SF est élevé, plus la portée est grande
                                     mais plus le débit est faible et la durée de transmission longue
  DR (Data Rate) DR0 – DR5 (EU868): De 250 bps (SF12) à 5470 bps (SF7)
  Duty Cycle EU : Max 1% sur 868 MHz → Limite les transmissions à 36 sec/heure
  OTAA vs ABP  : Over-The-Air Activation (sécurisé) vs Activation-By-Personalization
```

### 🔍 Orbital AI — Intelligence Artificielle Embarquée sur Satellite

Transmettre des images satellites brutes vers le sol coûte cher en bande passante radio et en temps (15 min de passage / orbite). L'**Orbital AI** déplace le traitement IA directement sur le satellite (On-Board Processing) :

```
ORBITAL AI — SATELLITE PROCESSING PIPELINE

  CAPTEUR IMAGE (12 MP Multispectral)
       ↓  5 MB/image brute
  OBC ON-BOARD AI (TensorRT/ONNX — ARM Cortex-A72)
  → Détection de nuages (discard 70% des images inutiles)
  → Détection d'incendies de forêt (NDVI + Thermal)
  → Compression résultat
       ↓  50 KB/résultat (réduction 99x)
  DOWNLINK UHF (9.6 kbps — 15 min passage)
  → Transmission en ~42 secondes au lieu de ~70 minutes
```

---

## Module 3 — Atelier Pratique : Satellite Telemetry Beacon & LoRa Budget Calculator (1h30)

### 🛠️ Script Python : CubeSat Telemetry Beacon & Link Budget Calculator

```python
#!/usr/bin/env python3
"""
PARADIS — CubeSat Telemetry Beacon & Link Budget Calculator
Simule le beacon télémetrique d'un CubeSat et calcule le budget de liaison radio.
"""
import struct
import hashlib
import math
from dataclasses import dataclass
from enum import Enum
from typing import Tuple

# ─── PARTIE 1 : CubeSat Telemetry Beacon (AX.25 / KISS Frame simulé) ────────

@dataclass
class CubeSatTelemetry:
    satellite_id: str    # Ex: "PARADIS-1"
    timestamp_s : int    # Unix timestamp
    bat_voltage_mv: int  # Tension batterie en millivolts
    solar_current_ma: int# Courant panneaux solaires en mA
    obc_temp_cdeg: int   # Température OBC en centidegrés Celsius
    rssi_dbm    : int    # RSSI antenne sol
    orbit_number: int    # Numéro d'orbite depuis le lancement

    def to_beacon_frame(self) -> bytes:
        """
        Encode la télémétrie en trame binaire AX.25-like (simulation).
        Format: [CALLSIGN 9B][TIMESTAMP 4B][BAT 2B][SOL 2B][TEMP 2B][RSSI 1B][ORBIT 2B][CRC 4B]
        """
        callsign = self.satellite_id[:9].ljust(9).encode("ascii")
        payload  = struct.pack(
            ">IHHhbH",
            self.timestamp_s,
            self.bat_voltage_mv,
            self.solar_current_ma,
            self.obc_temp_cdeg,
            self.rssi_dbm,
            self.orbit_number
        )
        frame  = callsign + payload
        crc32  = struct.pack(">I", int(hashlib.md5(frame).hexdigest()[:8], 16))
        return frame + crc32

    def print_telemetry(self):
        print("=" * 60)
        print(f"  🛸 SATELLITE   : {self.satellite_id}")
        print(f"  🔋 Batterie    : {self.bat_voltage_mv / 1000:.3f} V")
        print(f"  ☀️  Solaire     : {self.solar_current_ma} mA")
        print(f"  🌡️  Temp OBC    : {self.obc_temp_cdeg / 100:.1f} °C")
        print(f"  📡 RSSI Sol    : {self.rssi_dbm} dBm")
        print(f"  🌍 Orbite #    : {self.orbit_number}")
        frame = self.to_beacon_frame()
        print(f"  📦 Trame ({len(frame)} octets) : {frame.hex().upper()}")
        print("=" * 60)


# ─── PARTIE 2 : Link Budget Calculator ──────────────────────────────────────

class LinkBudgetCalculator:
    """Calculateur de Budget de Liaison Radio (Friis Free Space Path Loss)"""

    @staticmethod
    def free_space_path_loss_db(distance_km: float, freq_mhz: float) -> float:
        """FSPL = 20*log10(d) + 20*log10(f) + 20*log10(4π/c)"""
        return 20 * math.log10(distance_km * 1000) + 20 * math.log10(freq_mhz * 1e6) \
               + 20 * math.log10(4 * math.pi / 3e8)

    @staticmethod
    def compute_link_budget(
        tx_power_dbm   : float,  # Puissance émetteur en dBm
        tx_gain_dbi    : float,  # Gain antenne TX en dBi
        rx_gain_dbi    : float,  # Gain antenne RX en dBi
        cable_loss_db  : float,  # Pertes câbles en dB
        distance_km    : float,  # Distance TX → RX en km
        freq_mhz       : float,  # Fréquence en MHz
        rx_sensitivity_dbm: float  # Sensibilité récepteur en dBm
    ) -> dict:
        fspl = LinkBudgetCalculator.free_space_path_loss_db(distance_km, freq_mhz)
        rx_power_dbm   = tx_power_dbm + tx_gain_dbi - fspl + rx_gain_dbi - cable_loss_db
        link_margin_db = rx_power_dbm - rx_sensitivity_dbm

        return {
            "fspl_db"          : round(fspl, 2),
            "rx_power_dbm"     : round(rx_power_dbm, 2),
            "rx_sensitivity_dbm": rx_sensitivity_dbm,
            "link_margin_db"   : round(link_margin_db, 2),
            "link_viable"      : link_margin_db >= 10.0  # Convention : marge min 10 dB
        }

# ─── DÉMONSTRATION ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=== PARADIS — CUBESAT TELEMETRY & LINK BUDGET CALCULATOR ===\n")

    # Télémétrie CubeSat
    import time
    beacon = CubeSatTelemetry(
        satellite_id      = "PARADIS-1",
        timestamp_s       = int(time.time()),
        bat_voltage_mv    = 7420,  # 7.42V (2S LiPo)
        solar_current_ma  = 320,
        obc_temp_cdeg     = 2350,  # 23.50°C
        rssi_dbm          = -98,
        orbit_number      = 1247
    )
    beacon.print_telemetry()

    # Budget de liaison UHF 437 MHz (CubeSat → Station Sol)
    print("\n📡 BUDGET DE LIAISON — UHF 437 MHz (CubeSat PARADIS-1 → Sol)")
    lbc = LinkBudgetCalculator()
    result = lbc.compute_link_budget(
        tx_power_dbm       = 30.0,   # 1W TX
        tx_gain_dbi        = 2.0,    # dipôle
        rx_gain_dbi        = 15.0,   # Yagi 9 éléments
        cable_loss_db      = 2.0,
        distance_km        = 600.0,  # LEO 600 km
        freq_mhz           = 437.0,
        rx_sensitivity_dbm = -118.0  # récepteur AFSK 9.6kbps
    )
    print(f"  FSPL (600km, 437MHz)  : {result['fspl_db']} dB")
    print(f"  Puissance reçue       : {result['rx_power_dbm']} dBm")
    print(f"  Sensibilité RX        : {result['rx_sensitivity_dbm']} dBm")
    print(f"  Marge de liaison      : {result['link_margin_db']} dB")
    print(f"  Liaison viable        : {'✅ OUI' if result['link_viable'] else '❌ NON'}")
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CubeSat** | Format standardisé de nano-satellite 10×10×10 cm (1U) — Max 12 kg en 12U |
| **OBC** | On-Board Computer — Ordinateur de bord du satellite |
| **ADCS** | Attitude Determination and Control System — Gestion de l'orientation satellite |
| **EPS** | Electrical Power System — Système de gestion d'énergie embarquée |
| **LEO** | Low Earth Orbit — Orbite terrestre basse (400–2000 km) |
| **FSPL** | Free Space Path Loss — Affaiblissement de propagation en espace libre |
| **LoRa** | Long Range — Modulation radio chirp spread spectrum longue portée |
| **SF** | Spreading Factor — Facteur d'étalement LoRa (SF7–SF12) |
| **OTAA** | Over-The-Air Activation — Activation sécurisée des devices LoRaWAN |
| **Link Budget** | Budget de liaison — Bilan de puissance radio d'un lien de communication |

---

## Exercices Pratiques

### Exercice 1 — Calcul du Temps de Transmission CubeSat

Un CubeSat en LEO à 550 km prend une image de 8 MB (avant compression IA). Après traitement Orbital AI, la carte des anomalies détectées pèse **12 KB**. Le downlink UHF opère à **9600 bps**.

1. Sans Orbital AI, combien de temps faudrait-il pour transmettre l'image brute (en secondes) ?
2. Avec Orbital AI, combien de temps pour transmettre les 12 KB ?
3. Le passage au-dessus de la station sol dure **10 minutes**. Combien d'images brutes pourraient être transmises sans AI ? Combien avec AI ?

**Corrigé :**
1. $t_{brut} = \frac{8 \times 10^6 \times 8 \text{ bits}}{9600 \text{ bps}} = \frac{64 \times 10^6}{9600} \approx \mathbf{6667 \text{ s}} \approx 111 \text{ min}$. Impossible en un seul passage !
2. $t_{AI} = \frac{12 \times 10^3 \times 8}{9600} = \frac{96000}{9600} = \mathbf{10 \text{ s}}$.
3. Sans AI : $\frac{600}{6667} \approx 0.09$ image par passage → **0 image complète** transmissible. Avec AI : $\frac{600}{10} = \mathbf{60 \text{ résultats IA}}$ transmissibles par passage. La réduction est **667x**.

---

## Banque QCM — 5 Questions

**Q1.** Quel est le format standardisé d'un **CubeSat 1U** ?

- A) 20 cm × 20 cm × 20 cm, 5 kg
- B) 10 cm × 10 cm × 10 cm, max 1.33 kg ✅
- C) 30 cm × 30 cm × 30 cm, 15 kg
- D) 5 cm × 5 cm × 5 cm, 0.5 kg

**Q2.** Pourquoi le **facteur d'étalement SF** élevé (ex: SF12) en LoRa permet-il une plus grande portée ?

- A) Parce que SF12 utilise plus de puissance d'émission.
- B) Un SF élevé étale le signal sur une plus longue durée de symbole, augmentant le rapport signal/bruit (gain de traitement), ce qui permet de décoder des signaux très faibles à longue distance. ✅
- C) Parce que SF12 utilise une fréquence plus haute.
- D) SF élevé réduit la consommation électrique.

**Q3.** Qu'est-ce que l'**Orbital AI** (ou On-Board Processing) ?

- A) Envoyer toutes les données brutes au sol pour traitement.
- B) Exécuter des algorithmes d'intelligence artificielle directement sur l'ordinateur de bord du satellite (OBC) pour réduire drastiquement le volume de données à transmettre vers le sol. ✅
- C) Utiliser le GPS pour la navigation satellite.
- D) Une technique de chiffrement des communications spatiales.

**Q4.** Qu'est-ce que la **marge de liaison (Link Margin)** dans un budget de liaison radio ?

- A) La distance maximale de communication.
- B) La différence en dB entre la puissance de signal reçue et la sensibilité minimale du récepteur. Une marge > 10 dB garantit une communication fiable. ✅
- C) Le coût du satellite.
- D) La fréquence de communication.

**Q5.** Quelle orbite est la plus utilisée pour les CubeSats en raison de sa faible altitude et de son coût de lancement réduit ?

- A) GEO (Geostationary Orbit) à 35 786 km
- B) MEO (Medium Earth Orbit) à 20 200 km
- C) LEO (Low Earth Orbit) à 400–2000 km ✅
- D) HEO (Highly Elliptical Orbit)

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
