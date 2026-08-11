# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 573 (6h) : Extended Reality (XR) & Spatial Computing : AR/VR/MR, WebXR & Jumeaux Numériques (Digital Twins)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre le continuum **Extended Reality (XR)** : Réalité Augmentée (AR), Réalité Virtuelle (VR) et Réalité Mixte (MR)
> - Maîtriser le standard W3C **WebXR Device API** pour délivrer des expériences immersives directement dans le navigateur web (Three.js / WebGL)
> - Architecturer un **Jumeau Numérique (Digital Twin)** synchronisé en temps réel avec une infrastructure physique (Capteurs IoT, WebSockets, 3D Rendering)
> - Relever les défis d'ingénierie du Spatial Computing : latence Motion-to-Photon (< 20 ms), rendu 3D temps réel, occlusion et ancres spatiales
>
> **Compétences visées :** `DEV-01` (A), `ARCH-01` (A) — Spatial Computing, WebXR, Digital Twins

---

## Module 1 — Le Continuum XR & Spatial Computing (2h)

### 📖 Intuition & Narration

Pendant des décennies, l'interface homme-machine s'est limitée à des fenêtres 2D sur des écrans plats (moniteurs, smartphones). Le **Spatial Computing (Informatique Spatiale)** affranchit l'informatique des écrans physiques en intégrant les interfaces directement dans l'espace 3D de notre environnement.

L'**Extended Reality (XR)** englobe trois réalités :

```
LE CONTINUUM EXTENDED REALITY (XR)

  1. RÉALITÉ VIRTUELLE (VR - Virtual Reality)
     Immersion 100% artificielle. L'utilisateur est coupé du monde réel (ex: Meta Quest 3, HTC Vive).

  2. RÉALITÉ AUGMENTÉE (AR - Augmented Reality)
     Superposition d'éléments virtuels 2D/3D sur le monde réel (ex: HoloLens, Google Glass, ARKit).

  3. RÉALITÉ MIXTE (MR - Mixed Reality / Spatial Computing)
     Intégration où objets réels et virtuels coexistent et interagissent en temps réel (ex: Apple Vision Pro).
```

### 🔍 Exigence Critique : Latence Motion-to-Photon (< 20 ms)

La latence **Motion-to-Photon** est le temps s'écoulant entre le mouvement de la tête de l'utilisateur et la mise à jour correspondante des photons émis par l'écran immersif.
- Si cette latence dépasse **20 millisecondes**, le cerveau humain perçoit le décalage, entraînant le mal des transports virtuel (**Cyber-sickness / Motion Sickness**).

---

## Module 2 — WebXR API & Jumeaux Numériques (Digital Twins) (2h)

### 🔍 Standard WebXR Device API

L'API **WebXR** (standard W3C) permet aux navigateurs web d'accéder directement aux casques VR/AR et aux capteurs de positionnement spatial sans installer de plugin ou d'application native.

```
ARCHITECTURE D'UNE APPLICATION WEBXR / DIGITAL TWIN

  CAPTEURS IOT PHYSIQUES ────► MQTT / WEBSOCKETS ────► BACKEND KAFKA/PYTHON
                                                              │
                                                        (Data 3D Realtime)
                                                              ▼
  CASQUE XR / NAVIGATEUR ◄──── THREE.JS / WEBGL ◄──── WEBXR SESSION (XRSession)
```

### 🔍 Jumeaux Numériques (Digital Twins) dans l'Industrie 4.0

Un **Jumeau Numérique (Digital Twin)** est une réplique virtuelle 3D dynamique d'un objet, d'un équipement (ex: turbine, serveur datacenter) ou d'une usine complète, alimentée en continu par des données IoT en temps réel.

---

## Module 3 — Atelier Pratique : Digital Twin 3D Engine (1h30)

### 🛠️ Script Python : Digital Twin IoT State Synchronization Engine

```python
#!/usr/bin/env python3
"""
PARADIS — Digital Twin IoT State Synchronization Engine
Simule la synchronisation d'état en temps réel entre un équipement physique (Serveur Datacenter)
et son Jumeau Numérique 3D via WebSockets / WebXR.
"""
import time
import json
import random
from dataclasses import dataclass, asdict
from typing import Dict, Any

@dataclass
class PhysicsServerTelemetry:
    server_id: str
    temperature_celsius: float
    fan_speed_rpm: int
    power_watts: float
    cpu_usage_pct: float
    status: str  # NORMAL | WARNING | CRITICAL

class DigitalTwinEngine:
    def __init__(self, server_id: str):
        self.server_id = server_id
        # État virtuel du Jumeau Numérique (3D Mesh Properties)
        self.twin_state: Dict[str, Any] = {
            "mesh_id": f"mesh_{server_id}",
            "color_hex": "#00FF00",  # Vert = Normal
            "rotation_speed": 1.0,
            "alarm_active": False,
            "last_telemetry": {}
        }

    def process_telemetry(self, telemetry: PhysicsServerTelemetry) -> dict:
        """Met à jour les propriétés visuelles 3D du Jumeau Numérique en fonction des données IoT"""
        self.twin_state["last_telemetry"] = asdict(telemetry)

        # Règle de rendu 3D basée sur la température physique réel
        if telemetry.temperature_celsius >= 80.0 or telemetry.status == "CRITICAL":
            self.twin_state["color_hex"] = "#FF0000"  # Rouge = Critique
            self.twin_state["alarm_active"] = True
            self.twin_state["rotation_speed"] = 5.0    # Clignotement rapide
        elif telemetry.temperature_celsius >= 65.0 or telemetry.status == "WARNING":
            self.twin_state["color_hex"] = "#FFA500"  # Orange = Avertissement
            self.twin_state["alarm_active"] = False
            self.twin_state["rotation_speed"] = 2.0
        else:
            self.twin_state["color_hex"] = "#00FF00"  # Vert = Sain
            self.twin_state["alarm_active"] = False
            self.twin_state["rotation_speed"] = 1.0

        return self.twin_state

    def print_twin_status(self):
        st = self.twin_state["last_telemetry"]
        print("=" * 65)
        print(f"  JUMEAU NUMÉRIQUE (DIGITAL TWIN 3D) — {self.server_id}")
        print("=" * 65)
        print(f"  🌡️ Température Physique : {st.get('temperature_celsius', 0):.1f} °C")
        print(f"  ⚡ Puissance Consommée   : {st.get('power_watts', 0):.1f} W")
        print(f"  📊 Usage CPU            : {st.get('cpu_usage_pct', 0):.1f} %")
        print("─" * 65)
        print(f"  🎨 COULEUR RENDU MESH 3D: {self.twin_state['color_hex']}")
        print(f"  🚨 ALARME VISUELLE XR  : {'ACTIVÉE 🔴' if self.twin_state['alarm_active'] else 'DÉSACTIVÉE 🟢'}")
        print("=" * 65)


if __name__ == "__main__":
    twin = DigitalTwinEngine("SRV-RACK-042")

    print("=== DÉMONSTRATION SYNCHRONISATION JUMEAU NUMÉRIQUE PARADIS ===\n")

    # Simulation T1 : Fonctionnement normal
    t1 = PhysicsServerTelemetry("SRV-RACK-042", 42.5, 2400, 220.0, 35.0, "NORMAL")
    twin.process_telemetry(t1)
    twin.print_twin_status()

    print("\n" + "─"*65 + "\n")

    # Simulation T2 : Surchauffe physique critique (Panne du ventilateur)
    t2 = PhysicsServerTelemetry("SRV-RACK-042", 84.2, 0, 450.0, 98.0, "CRITICAL")
    twin.process_telemetry(t2)
    twin.print_twin_status()
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **XR** | Extended Reality — Terme parapluie englobant AR, VR et MR |
| **WebXR** | Standard W3C d'accès aux équipements d'informatique spatiale depuis le navigateur web |
| **Motion-to-Photon** | Temps s'écoulant entre le mouvement de la tête et l'affichage de l'image (cible < 20 ms) |
| **Digital Twin** | Jumeau Numérique — Réplique virtuelle 3D synchronisée en temps réel avec un objet physique |

---

## Exercices Pratiques

### Exercice 1 — Calcul du Budget de Latence Spatial Computing

Une application de Récurité Virtuelle (VR) s'exécute à un taux de rafraîchissement de **90 Hz** (90 images par seconde).

1. Quel est le temps d'affichage maximal autorisé par image (en millisecondes) ?
2. Si le rendu 3D Three.js consomme **8 ms** et que le réseau consomme **7 ms**, combien de temps reste-t-il pour la logique applicative et le suivi de position (Tracking) ?
3. L'exigence de latence Motion-to-Photon (< 20 ms) est-elle respectée ?

**Corrigé guidé :**
1. **Temps par image à 90 Hz** : $\text{Budget Frame} = \frac{1000 \text{ ms}}{90} = \mathbf{11.11 \text{ ms par image}}$.
2. **Temps restant** : $11.11 \text{ ms} - (8 \text{ ms} + 7 \text{ ms}) = -3.89 \text{ ms}$. Le budget est dépassé ! L'application va saccader (frame drop).
3. **Latence globale** : $8 + 7 = 15 \text{ ms} < 20 \text{ ms}$. La latence Motion-to-Photon théorique est sous la barre des 20 ms, mais la fréquence de rafraîchissement (11.11 ms) impose d'optimiser le rendu 3D (passer de 8 ms à < 4 ms).

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la différence entre la **Récurité Virtuelle (VR)** et la **Récurité Augmentée (AR)** ?

- A) La VR est plus chère que l'AR.
- B) La VR coupe l'utilisateur du monde réel dans un environnement 100% virtuel, tandis que l'AR superpose des éléments virtuels 3D par-dessus la vue du monde réel. ✅
- C) L'AR ne fonctionne qu'avec des lunettes de soleil.
- D) La VR est réservée au texte.

**Q2.** Pourquoi la latence **Motion-to-Photon** doit-elle obligatoirement rester **inférieure à 20 millisecondes** dans les casques XR ?

- A) Pour économiser la batterie du casque.
- B) Pour éviter le décalage perçu par le cerveau humain, qui provoque la cinétose / le mal des transports virtuel (Motion Sickness). ✅
- C) Parce que la loi l'impose.
- D) Pour accélérer le téléchargement des fichiers.

**Q3.** Quel standard du W3C permet de créer des applications immersives AR/VR directement accessibles dans un navigateur web sans plugin ?

- A) WebGL 1.0
- B) WebXR Device API ✅
- C) HTML4
- D) Flash Player

**Q4.** Qu'est-ce qu'un **Jumeau Numérique (Digital Twin)** ?

- A) Deux ordinateurs identiques placés côte à côte.
- B) Une réplique virtuelle 3D dynamique d'un équipement ou d'un système physique, synchronisée en temps réel par des données IoT. ✅
- C) Une sauvegarde de fichier sur clé USB.
- D) Un compte utilisateur double.

**Q5.** Dans l'architecture d'un Jumeau Numérique industriel, par quel canal les données de télémétrie des capteurs physiques sont-elles préférentiellement transmises au modèle 3D ?

- A) Courrier postal
- B) Flux temps réel WebSockets, MQTT ou Apache Kafka ✅
- C) Fichiers Excel envoyés par e-mail une fois par mois
- D) Imprimante papier

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
