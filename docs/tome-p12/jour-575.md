# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 575 (6h) : Autonomous Systems & Robotics — ROS 2, Nav2, Digital Twin & Safety-Critical AI

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre l'architecture de **ROS 2 (Robot Operating System 2)** : Nodes, Topics, Services, Actions et le middleware DDS (Data Distribution Service)
> - Maîtriser la stack de navigation autonome **Nav2** : SLAM (Simultaneous Localization and Mapping), Costmaps, Path Planning (A*, DWB)
> - Concevoir des architectures **Safety-Critical AI** pour systèmes robotiques (Niveaux d'intégrité de sécurité SIL 1-4, watchdogs, fail-safe)
> - Architecturer un **Jumeau Numérique Robotique** pour la simulation (Gazebo, Isaac Sim) et le déploiement zéro-risque
>
> **Compétences visées :** `AI-01` (A), `ARCH-01` (A) — Robotics, ROS 2, Autonomous Systems, Safety-Critical Systems

---

## Module 1 — Architecture ROS 2 & le Middleware DDS (2h)

### 📖 Intuition & Narration

Un **robot autonome** est, fondamentalement, un système embarqué distribué temps réel : il perçoit son environnement via des capteurs (LiDAR, caméra RGB-D, IMU), traite ces données pour construire une carte (SLAM), planifie un chemin et actionne ses moteurs — le tout en boucle fermée à **10–100 Hz**.

**ROS 2** (Robot Operating System 2) est le système d'exploitation robotique de référence mondial. ROS 2 n'est pas un OS au sens traditionnel, mais un **middleware de communication distribué** qui permet aux composants logiciels d'un robot (appelés **Nodes**) de s'échanger des messages structurés.

```
ARCHITECTURE ROS 2 — GRAPH DE COMMUNICATION

  ┌─────────────┐       Topic: /scan        ┌─────────────────┐
  │  Lidar Node │──────(msgs LaserScan)────►│  SLAM Node      │
  └─────────────┘                           │  (Cartographer) │
                                            └────────┬────────┘
  ┌─────────────┐       Topic: /odom               │ Topic: /map
  │  IMU Node   │──────(msgs Odometry)──────────────►│
  └─────────────┘                           ┌────────┴────────┐
                                            │  Nav2 Planner   │
  ┌─────────────┐       Topic: /cmd_vel     │  (Path Planning)│
  │  Motor Ctrl │◄─────(msgs Twist)─────────└────────┬────────┘
  └─────────────┘                                    │ Action: /navigate_to_pose
                                            ┌────────┴────────┐
                                            │  Nav2 Controller│
                                            │  (DWB)          │
                                            └─────────────────┘
```

### 🔍 DDS — Data Distribution Service : le Bus de Communication Temps Réel

ROS 2 repose sur le standard **DDS (Data Distribution Service)** de l'OMG pour ses communications :

| Concept DDS | Équivalent ROS 2 | Description |
|:---|:---|:---|
| **Topic** | `/scan`, `/cmd_vel` | Canal de données publish/subscribe |
| **Publisher** | `node.create_publisher()` | Publie des messages sur un topic |
| **Subscriber** | `node.create_subscription()` | S'abonne à un topic |
| **Service** | `rclpy.Service` | Requête/Réponse synchrone |
| **Action** | `rclpy.Action` | Tâches longues avec feedback |
| **QoS Profile** | `ReliabilityPolicy.RELIABLE` | Fiabilité temps réel configurable |

---

## Module 2 — Nav2 & Safety-Critical AI (2h)

### 🔍 Stack de Navigation Nav2

**Nav2** est la stack de navigation autonome de référence pour ROS 2. Elle transforme un robot en **agent capable de naviguer de manière autonome et sûre** dans un environnement donné.

```
PIPELINE NAV2 — DE L'OBJECTIF À L'ACTION MOTRICE

  1. GOAL POSE
     (coordonnées x,y,θ dans la carte)
     ↓
  2. GLOBAL PLANNER (A* / NavFn / Smac Planner)
     → Calcul du chemin global optimal (évite obstacles statiques)
     ↓
  3. LOCAL PLANNER / CONTROLLER (DWB — Dynamic Window Approach B)
     → Ajustement en temps réel (obstacles dynamiques)
     ↓
  4. COSTMAP 2D (Global + Local)
     → Grille 2D probabiliste des obstacles (inflation_radius)
     ↓
  5. /cmd_vel (Twist message : vitesse linéaire + angulaire)
     → Commandes moteurs (roues différentielles / omni)
```

### 🔍 Safety-Critical AI — Niveaux SIL (Safety Integrity Levels)

Les systèmes robotiques autonomes (véhicules, robots chirurgicaux, drones) sont soumis à des normes de **sécurité fonctionnelle** strictes :

```
NIVEAUX SIL — IEC 61508 (Safety Integrity Levels)

  SIL 1 : Probabilité de panne dangereuse 10⁻⁵ à 10⁻⁶ /heure → Robot industriel
  SIL 2 : Probabilité de panne dangereuse 10⁻⁶ à 10⁻⁷ /heure → Ascenseur
  SIL 3 : Probabilité de panne dangereuse 10⁻⁷ à 10⁻⁸ /heure → Train automatique
  SIL 4 : Probabilité de panne dangereuse 10⁻⁸ à 10⁻⁹ /heure → Avion / Réacteur
```

---

## Module 3 — Atelier Pratique : Robot Safety Monitor (1h30)

### 🛠️ Script Python : ROS 2 Safety-Critical Watchdog Simulator

```python
#!/usr/bin/env python3
"""
PARADIS — Safety-Critical Robot Watchdog Simulator
Simule un watchdog de sécurité fonctionnelle pour un robot mobile autonome.
Implémente les patterns : Heartbeat Monitor, Velocity Limiter, Emergency Stop.
"""
import time
import random
from dataclasses import dataclass
from typing import Callable, Optional
from enum import Enum

class RobotSafetyState(Enum):
    NOMINAL     = "NOMINAL"
    WARNING     = "WARNING"
    SAFE_STOP   = "SAFE_STOP"
    EMERGENCY   = "EMERGENCY"

@dataclass
class RobotTelemetry:
    timestamp_s: float
    linear_vel_ms: float    # vitesse linéaire en m/s
    angular_vel_rads: float # vitesse angulaire en rad/s
    obstacle_dist_m: float  # distance à l'obstacle le plus proche en mètres
    battery_pct: float      # niveau de batterie en %
    heartbeat_ok: bool      # signal de vie du nœud de navigation

class SafetyCriticalWatchdog:
    """
    Watchdog de sécurité fonctionnelle — SIL 2 selon IEC 61508
    Surveille en continu la télémétrie robot et déclenche les arrêts d'urgence.
    """
    # Limites de sécurité (paramètres SIL 2)
    MAX_LINEAR_VEL_MS     = 1.5    # m/s — limite vitesse maximum
    MIN_OBSTACLE_DIST_M   = 0.4    # m — distance d'arrêt d'urgence
    MIN_BATTERY_PCT       = 15.0   # % — seuil batterie critique
    HEARTBEAT_TIMEOUT_S   = 0.5    # s — délai max sans signal de vie

    def __init__(self):
        self.state                 = RobotSafetyState.NOMINAL
        self.last_heartbeat_time_s = time.monotonic()
        self.estop_active          = False

    def _check_heartbeat(self, telemetry: RobotTelemetry) -> Optional[str]:
        if telemetry.heartbeat_ok:
            self.last_heartbeat_time_s = time.monotonic()
            return None
        elapsed = time.monotonic() - self.last_heartbeat_time_s
        if elapsed > self.HEARTBEAT_TIMEOUT_S:
            return f"HEARTBEAT TIMEOUT ({elapsed:.2f}s > {self.HEARTBEAT_TIMEOUT_S}s) — Nav2 Node perdu !"
        return None

    def evaluate(self, telemetry: RobotTelemetry) -> dict:
        """Évalue la sécurité de l'état robot et détermine l'action de sécurité requise."""
        violations = []

        # Règle 1 : Vitesse excessive
        if abs(telemetry.linear_vel_ms) > self.MAX_LINEAR_VEL_MS:
            violations.append(f"VITESSE EXCESSIVE: {telemetry.linear_vel_ms:.2f}m/s > {self.MAX_LINEAR_VEL_MS}m/s")

        # Règle 2 : Obstacle trop proche → Emergency Stop immédiat
        if telemetry.obstacle_dist_m < self.MIN_OBSTACLE_DIST_M:
            violations.append(f"OBSTACLE PROCHE: {telemetry.obstacle_dist_m:.2f}m < {self.MIN_OBSTACLE_DIST_M}m")
            self.estop_active = True

        # Règle 3 : Batterie critique
        if telemetry.battery_pct < self.MIN_BATTERY_PCT:
            violations.append(f"BATTERIE CRITIQUE: {telemetry.battery_pct:.1f}% < {self.MIN_BATTERY_PCT}%")

        # Règle 4 : Heartbeat
        hb_err = self._check_heartbeat(telemetry)
        if hb_err:
            violations.append(hb_err)
            self.estop_active = True

        # Détermination de l'état de sécurité
        if self.estop_active:
            self.state = RobotSafetyState.EMERGENCY
        elif violations:
            self.state = RobotSafetyState.WARNING
        else:
            self.state = RobotSafetyState.NOMINAL

        return {
            "state"         : self.state.value,
            "estop_active"  : self.estop_active,
            "violations"    : violations,
            "cmd_vel_allowed": not self.estop_active
        }

    def print_report(self, result: dict, telemetry: RobotTelemetry):
        state_icon = {"NOMINAL": "🟢", "WARNING": "🟡", "SAFE_STOP": "🟠", "EMERGENCY": "🔴"}.get(result["state"], "❓")
        print("=" * 65)
        print(f"  WATCHDOG SIL-2 — ÉTAT: {state_icon} {result['state']}")
        print(f"  Vitesse: {telemetry.linear_vel_ms:.2f}m/s  |  Obstacle: {telemetry.obstacle_dist_m:.2f}m"
              f"  |  Batterie: {telemetry.battery_pct:.1f}%")
        print(f"  ESTOP: {'🚨 ACTIF' if result['estop_active'] else '✅ INACTIF'}"
              f"  |  cmd_vel autorisé: {'✅' if result['cmd_vel_allowed'] else '❌'}")
        if result["violations"]:
            print("  ─── VIOLATIONS DÉTECTÉES ───")
            for v in result["violations"]:
                print(f"    ⚠️  {v}")
        print("=" * 65)


if __name__ == "__main__":
    watchdog = SafetyCriticalWatchdog()

    print("=== PARADIS ROBOT SAFETY WATCHDOG — DÉMONSTRATION SIL-2 ===\n")

    # Scénario 1 : Fonctionnement nominal
    t1 = RobotTelemetry(time.monotonic(), 0.8, 0.3, 2.5, 85.0, True)
    r1 = watchdog.evaluate(t1)
    watchdog.print_report(r1, t1)

    print()

    # Scénario 2 : Obstacle détecté à 0.2m → Emergency Stop
    t2 = RobotTelemetry(time.monotonic(), 1.2, 0.0, 0.2, 72.0, True)
    r2 = watchdog.evaluate(t2)
    watchdog.print_report(r2, t2)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ROS 2** | Robot Operating System 2 — Middleware open source pour la robotique |
| **DDS** | Data Distribution Service — Standard de communication temps réel de l'OMG |
| **Nav2** | Navigation 2 — Stack de navigation autonome pour ROS 2 |
| **SLAM** | Simultaneous Localization and Mapping — Construction de carte et localisation simultanées |
| **SIL** | Safety Integrity Level — Niveau d'intégrité de sécurité (IEC 61508) |
| **ESTOP** | Emergency Stop — Arrêt d'urgence immédiat du système |
| **DWB** | Dynamic Window B — Algorithme de contrôle local de Nav2 |

---

## Exercices Pratiques

### Exercice 1 — Analyse de Réactivité Safety-Critical

Un robot navigue à **1.0 m/s**. Son watchdog de sécurité tourne à **20 Hz** (une vérification toutes les 50 ms). Un obstacle apparaît soudainement à **0.8 m** devant le robot.

1. Combien de temps le watchdog met-il au maximum pour détecter l'obstacle ?
2. Quelle distance supplémentaire le robot aura-t-il parcouru avant l'arrêt (distance de réaction) ?
3. Si la distance d'arrêt mécanique est de **0.3 m**, le robot évite-t-il la collision ?

**Corrigé :**
1. Délai watchdog max = $\frac{1}{20} = 0.05 \text{ s} = 50 \text{ ms}$.
2. Distance de réaction = $1.0 \text{ m/s} \times 0.05 \text{ s} = \mathbf{0.05 \text{ m}} = 5 \text{ cm}$.
3. Distance restante lors de la détection = $0.8 - 0.05 = 0.75 \text{ m}$. Distance d'arrêt mécanique = $0.3 \text{ m}$. La collision est **évitée** ($0.75 > 0.3$). ✅ Mais avec le watchdog à 10 Hz (100 ms), la réaction serait de 0.1 m, distance restante = 0.7 m > 0.3 m : encore OK. À 4 Hz (250 ms), réaction = 0.25 m, distance restante = 0.55 m > 0.3 m. Encore OK — mais la marge se réduit dangereusement.

---

## Banque QCM — 5 Questions

**Q1.** Dans ROS 2, quel mécanisme de communication est utilisé pour des **échanges asynchrones publish/subscribe** entre Nodes ?

- A) Service ROS (requête/réponse synchrone)
- B) Topic (publish/subscribe via DDS) ✅
- C) Action (tâche longue avec feedback)
- D) Parameter Server

**Q2.** Qu'est-ce que le **SLAM** en robotique ?

- A) Un protocole de cybersécurité pour robots.
- B) La construction simultanée d'une carte de l'environnement et la localisation du robot dans cette carte, sans infrastructure externe (GPS). ✅
- C) Un système de gestion de la batterie.
- D) Un algorithme de vision par ordinateur.

**Q3.** Quel niveau **SIL** (Safety Integrity Level) selon IEC 61508 est requis pour les **systèmes de contrôle d'avions commerciaux** ?

- A) SIL 1
- B) SIL 2
- C) SIL 3
- D) SIL 4 ✅

**Q4.** Dans la stack Nav2, quel composant est responsable de l'**évitement des obstacles dynamiques** en temps réel ?

- A) Global Planner (A*)
- B) Local Planner / Controller (DWB — Dynamic Window Approach B) ✅
- C) SLAM Cartographer
- D) AMCL (Monte Carlo Localization)

**Q5.** Pourquoi utilise-t-on un **Jumeau Numérique (Digital Twin)** avant de déployer un nouveau comportement sur un robot physique ?

- A) Pour économiser l'électricité du robot.
- B) Pour tester et valider le comportement du robot dans un environnement virtuel simulé (Gazebo/Isaac Sim), éliminant le risque de casse matérielle coûteuse et les incidents de sécurité. ✅
- C) Parce que les robots ne peuvent pas fonctionner sans simulation.
- D) Pour créer une copie de sauvegarde du robot.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
