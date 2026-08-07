# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 294 (6h) : Satellite & Space Systems Cybersecurity (Space C2 Security, Protocole CCSDS, Telemetry Encryption, Ground Segment & RF Jamming Mitigation)

> [!NOTE]
> **Objectif du jour :** Maîtriser les enjeux et les techniques de **cybersécurité des systèmes spatiaux et satellitaires** : analyser le protocole standard **CCSDS (Consultative Committee for Space Data Systems)**, sécuriser la télécommande et la télémétrie (**TC/TM Encryption**), auditer le segment sol (**Ground Segment**), et contrer le brouillage radio (**RF Jamming**) et le Spoofing GPS/GNSS.
>
> **Compétences visées :** `SPACE-01` (A) — Space Systems Architecture & CCSDS Protocol | `SPACE-02` (A) — Satellite Telemetry Encryption & Ground Segment Security

---

## 1) Module — Architecture des Systèmes Spatiaux & Protocole CCSDS (2h)

### 📖 Narration/Intuition

Un système spatial comporte 3 segments fondamentaux : le **Space Segment** (le satellite en orbite LEO/GEO), le **Ground Segment** (les stations sol et centres de contrôle), et le **User Segment** (les terminaux utilisateurs). Les communications entre le sol et l'espace utilisent les standards du **CCSDS**, historiquement conçus sans authentification ni chiffrement.

```
[ Ground Segment / Station Sol ] ──(Telecommand TC / CCSDS)──► [ Space Segment / Satellite LEO ]
                                ◄──(Telemetry TM / CCSDS)───┘
                                                │
                                       [ User Segment / Terminal ]
```

---

## 2) Module — Inspection de Tramage CCSDS & Chiffrement (`ccsds_telemetry.py`) (2h)

### 🛠️ Atelier Pratique

**Chiffrement et vérification d'authenticité d'une télécommande spatiale CCSDS (`ccsds_sec.py`) :**

```python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

# Sécurisation des paquets de Télécommande CCSDS (TC Space Data Link Protocol - SDLP)
# Utilisation d'AES-256-GCM pour garantir à la fois la confidentialité et l'authenticité

class SpaceCommandLink:
    def __init__(self, master_key: bytes):
        self.aesgcm = AESGCM(master_key)

    def secure_telecommand(self, space_command: bytes, satellite_id: int) -> dict:
        print(f"[*] Préparation de la télécommande spatiale pour Satellite ID {satellite_id}...")
        nonce = os.urandom(12)
        # Header CCSDS additionnel utilisé comme Associated Data (AAD)
        aad_header = satellite_id.to_bytes(4, byteorder='big')

        # Chiffrement + Signature HMAC intégrée (Authenticated Encryption)
        ciphertext = self.aesgcm.encrypt(nonce, space_command, aad_header)

        return {
            "satellite_id": satellite_id,
            "nonce": nonce.hex(),
            "secured_frame": ciphertext.hex()
        }

key = AESGCM.generate_key(bit_length=256)
cmd_link = SpaceCommandLink(key)

# Commande critique : Modifier l'orientation des panneaux solaires
payload = b"SET_ATTITUDE_PANEL_ANGLE=45_DEG"
frame = cmd_link.secure_telecommand(payload, 9801)
print(f"[+] Trame spatiale CCSDS sécurisée envoyée vers la station sol :\n{frame}")
```

---

## 3) Module — Risques GNSS Spoofing & Ground Segment Hardening (2h)

### 🛠️ Attaque et Détection de Spoofing GPS/GNSS

```python
# Le Spoofing GNSS consiste à émettre de faux signaux satellite GPS avec une puissance supérieure
# pour leurrer le récepteur et dévier sa position ou fausser sa synchronisation temporelle (NTP/PTP).

def detect_gnss_spoofing(signal_power_dbm: float, clock_drift_ms: float):
    print(f"[*] Analyse du signal GNSS : Puissance = {signal_power_dbm} dBm | Dérive Horloge = {clock_drift_ms} ms")
    if signal_power_dbm > -110.0: # Signal anormalement fort pour un satellite en orbite LEO/GEO
        print("[!] ALERTE CRITIQUE : Détection de GNSS Spoofing ! (Signal RF local trop puissant)")
    if abs(clock_drift_ms) > 5.0:
        print("[!] ALERTE : Anomalie de synchronisation horloge spatiale !")

detect_gnss_spoofing(-85.0, 12.4)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CCSDS** | Consultative Committee for Space Data Systems — Organisme international de normalisation spatiale |
| **GNSS** | Global Navigation Satellite System — Systèmes de positionnement par satellite (GPS, Galileo, GLONASS) |
| **TC / TM** | Telecommand / Telemetry — Ordres envoyés au satellite / Données d'état renvoyées au sol |
| **LEO / GEO** | Low Earth Orbit / Geostationary Earth Orbit — Orbites terrestres basse / géostationnaire |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est l'organisme international responsable de la normalisation des protocoles de communication et de tramage de données spatiales (**CCSDS**) ?
- A) Consultative Committee for Space Data Systems (CCSDS)
- B) IEEE
- C) W3C
- D) IETF

**Réponse : A**

**Q2 :** Pourquoi la sécurisation de la **télécommande (Telecommand - TC)** spatiale est-elle la priorité absolue de la cybersécurité satellitaire ?
- A) Parce qu'une télécommande non authentifiée injectée par un pirate peut permettre d'altérer l'orbite du satellite, de couper les panneaux solaires ou de détruire physiquement l'équipement
- B) Parce que le satellite est trop lourd
- C) Parce que la Terre tourne
- D) Pour réduire les coûts de lancement

**Réponse : A**

**Q3 :** En quoi consiste une attaque de **Spoofing GNSS / GPS** ciblée contre le Ground Segment ou des récepteurs navals/aériens ?
- A) Émettre de faux signaux radioélectriques imitant les satellites GPS avec une puissance supérieure pour forcer le récepteur à calculer une fausse position ou une fausse heure
- B) Chiffrer le disque dur de la station sol
- C) Peindre l'antenne en noir
- D) Intercepter les emails

**Réponse : A**

**Q4 :** Quels sont les 3 segments fondamentaux composant une architecture système spatiale globale ?
- A) Space Segment (Satellites), Ground Segment (Stations sol), User Segment (Terminaux)
- B) Frontend, Backend, Database
- C) Ring 0, Ring 1, Ring 3
- D) CPU, RAM, Disk

**Réponse : A**

**Q5 :** Quel mode de chiffrement cryptographique moderne est préconisé par les standards CCSDS actuels pour assurer simultanément la confidentialité et l'authentification des trames de télémétrie ?
- A) AES-GCM (Authenticated Encryption)
- B) Chiffrement XOR
- C) DES
- D) Base64

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
