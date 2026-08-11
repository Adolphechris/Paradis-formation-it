# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 574 (6h) : 5G/6G & Next-Gen Networks — Network Slicing, Mobile Edge Computing & O-RAN

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser l'architecture **5G Stand-Alone (SA)** : Core 5G (5GC), gNB, AMF/SMF/UPF et l'interface N2/N3
> - Comprendre le **Network Slicing** pour la création de réseaux virtuels dédiés (eMBB, URLLC, mMTC) sur une infrastructure physique partagée
> - Architecturer des solutions **Mobile Edge Computing (MEC)** pour le calcul ultra-faible latence à la périphérie du réseau
> - Appréhender la désagrégation radio **O-RAN** (Open Radio Access Network) et ses implications pour l'opérateur et l'ingénieur IT
>
> **Compétences visées :** `BIT-04` (A), `ARCH-01` (A) — 5G Architecture, Network Slicing, MEC, O-RAN

---

## Module 1 — Architecture 5G Stand-Alone & les 3 Cas d'Usage (2h)

### 📖 Intuition & Narration

La 5G n'est pas simplement la 4G plus rapide. Elle constitue une **rupture architecturale fondamentale** qui transforme les télécommunications en une plateforme de services programmables et virtualisés.

La 5G définit **trois grands cas d'usage** standardisés par l'UIT-R IMT-2020 :

```
LES 3 CAS D'USAGE 5G (UIT-R IMT-2020)

  ┌──────────────────────────────────────────────────────────────────┐
  │  eMBB — enhanced Mobile Broadband                                │
  │  → Très haut débit (> 1 Gbps). Streaming 8K, VR/AR mobile.     │
  ├──────────────────────────────────────────────────────────────────┤
  │  URLLC — Ultra-Reliable Low Latency Communications              │
  │  → Latence < 1 ms. Véhicules autonomes, chirurgie à distance.  │
  ├──────────────────────────────────────────────────────────────────┤
  │  mMTC — massive Machine-Type Communications                      │
  │  → 1 million de devices/km². Smart City, Industrie 4.0, IoT.  │
  └──────────────────────────────────────────────────────────────────┘
```

### 🔍 Anatomie du Core 5G (5GC — 5G Core Network)

Le cœur de réseau 5G adopte une **architecture orientée services (SBA — Service-Based Architecture)** basée sur des microservices communiquant via des API REST/HTTP2 :

```
ARCHITECTURE 5G CORE (5GC) — FONCTIONS RÉSEAU CLÉS

  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
  │   AMF   │  │   SMF   │  │   UPF   │  │   PCF   │
  │ Access &│  │ Session │  │  User   │  │ Policy  │
  │Mobility │  │ Mgmt Fn │  │ Plane Fn│  │Control  │
  │ Function│  │         │  │         │  │Function │
  └────┬────┘  └────┬────┘  └────┬────┘  └─────────┘
       │N2           │N4           │N3
  ┌────┴────────────────────────────────┐
  │             gNB (5G gNodeB)         │
  │    Station de Base Radio 5G NR      │
  └─────────────────────────────────────┘
       │ Air Interface (NR — New Radio)
  ┌────┴────────────────────────────────┐
  │          UE (User Equipment)        │
  │     Smartphone 5G / IoT Device      │
  └─────────────────────────────────────┘

AMF = Access & Mobility Management Function
SMF = Session Management Function
UPF = User Plane Function
PCF = Policy Control Function
gNB = gNodeB (station de base 5G)
```

---

## Module 2 — Network Slicing & O-RAN (2h)

### 🔍 Network Slicing : Un Réseau Physique, Plusieurs Réseaux Virtuels

Le **Network Slicing** permet de créer des **réseaux logiques isolés (slices)** sur une infrastructure physique partagée, chacun avec des garanties de performance dédiées (QoS, latence, bande passante) adaptées à son cas d'usage :

```
NETWORK SLICING — 3 SLICES SUR UNE SEULE INFRASTRUCTURE PHYSIQUE

  INFRASTRUCTURE PHYSIQUE 5G (Radio + Transport + Core)
  ═══════════════════════════════════════════════════════
        │                   │                   │
        ▼                   ▼                   ▼
  ┌───────────┐      ┌───────────┐      ┌───────────┐
  │  SLICE 1  │      │  SLICE 2  │      │  SLICE 3  │
  │   eMBB    │      │  URLLC    │      │   mMTC    │
  │ 1 Gbps DL │      │ Lat < 1ms │      │ 1M dev/km²│
  │  Netflix  │      │ Autonom.  │      │ Smart City│
  └───────────┘      └───────────┘      └───────────┘
```

### 🔍 O-RAN : La Désagrégation du Réseau Radio

**O-RAN (Open Radio Access Network)** est une initiative de désagrégation du RAN (Radio Access Network) qui sépare les composants matériels et logiciels propriétaires en interfaces ouvertes interopérables.

```
ARCHITECTURE O-RAN — DÉSAGRÉGATION DES COMPOSANTS RADIO

  ┌─────────────────────────────────────────────┐
  │    Non-Real-Time RIC (Near-RT RIC)          │
  │    Intelligence & Optimisation Radio (AI)   │
  └─────────────────────────────────────────────┘
                      │ A1 Interface
  ┌─────────────────────────────────────────────┐
  │    Near-Real-Time RIC (Near-RT RIC)         │
  │    xApps (IA/ML embarquées)                 │
  └─────────────────────────────────────────────┘
         │ E2 Interface         │ E2 Interface
  ┌──────┴──────┐        ┌──────┴──────┐
  │    O-CU     │        │    O-DU     │
  │ (Central   │        │(Distributed │
  │  Unit)     │        │   Unit)     │
  └─────────────┘        └──────┬──────┘
                                │ Open Fronthaul (7.2x)
                         ┌──────┴──────┐
                         │    O-RU     │
                         │(Radio Unit) │
                         │  Antenne    │
                         └─────────────┘
```

---

## Module 3 — Atelier Pratique : Simulateur Network Slicing & MEC (1h30)

### 🛠️ Script Python : Network Slice Manager & MEC Latency Simulator

```python
#!/usr/bin/env python3
"""
PARADIS — 5G Network Slice Manager & MEC Latency Simulator
Simule la création de Network Slices avec garanties QoS et le calcul de latence MEC.
"""
from dataclasses import dataclass
from typing import List, Optional
from enum import Enum

class SliceType(Enum):
    EMBB  = "eMBB"   # Enhanced Mobile Broadband
    URLLC = "URLLC"  # Ultra-Reliable Low Latency
    MMTC  = "mMTC"   # Massive Machine-Type Communications

@dataclass
class NetworkSlice:
    slice_id: str
    slice_type: SliceType
    max_bandwidth_gbps: float
    max_latency_ms: float
    max_devices: int
    tenant: str          # Client/Service utilisant ce slice

class MECNode:
    """Mobile Edge Computing Node — Serveur de calcul déployé dans la station de base gNB"""
    def __init__(self, node_id: str, location: str, cpu_cores: int, distance_km: float):
        self.node_id    = node_id
        self.location   = location
        self.cpu_cores  = cpu_cores
        self.distance_km = distance_km

    def compute_latency_ms(self, workload_ms: float) -> float:
        """Calcule la latence totale : propagation (vitesse lumière) + compute"""
        SPEED_OF_LIGHT_KM_MS = 200.0  # Vitesse effective fibre optique ≈ 200 km/ms
        propagation_ms = self.distance_km / SPEED_OF_LIGHT_KM_MS
        total_latency_ms = propagation_ms + workload_ms
        return round(total_latency_ms, 3)

class FiveGSliceManager:
    def __init__(self):
        self.slices: List[NetworkSlice] = []

    def create_slice(self, slice: NetworkSlice) -> str:
        self.slices.append(slice)
        return f"[OK] Slice {slice.slice_id} ({slice.slice_type.value}) créé pour {slice.tenant}"

    def check_sla(self, slice_id: str, measured_latency_ms: float, measured_bw_gbps: float) -> dict:
        """Vérifie si le SLA du slice est respecté"""
        target = next((s for s in self.slices if s.slice_id == slice_id), None)
        if not target:
            return {"error": f"Slice {slice_id} introuvable"}

        latency_ok = measured_latency_ms <= target.max_latency_ms
        bw_ok      = measured_bw_gbps   <= target.max_bandwidth_gbps
        sla_ok     = latency_ok and bw_ok

        return {
            "slice_id"             : slice_id,
            "slice_type"           : target.slice_type.value,
            "latency_ok"           : f"{'✅' if latency_ok else '❌'} {measured_latency_ms}ms / max {target.max_latency_ms}ms",
            "bandwidth_ok"         : f"{'✅' if bw_ok else '❌'} {measured_bw_gbps}Gbps / max {target.max_bandwidth_gbps}Gbps",
            "SLA_STATUS"           : "✅ RESPECTÉ" if sla_ok else "❌ VIOLÉ — ACTION REQUISE"
        }

    def print_slices(self):
        print("=" * 70)
        print("  PARADIS 5G SLICE MANAGER — TABLEAU DE BORD DES SLICES ACTIFS")
        print("=" * 70)
        for s in self.slices:
            print(f"  [{s.slice_type.value:5s}] {s.slice_id:15s} | BW: {s.max_bandwidth_gbps:5.1f} Gbps"
                  f" | Lat: {s.max_latency_ms:5.1f}ms | Devices: {s.max_devices:>10,} | Tenant: {s.tenant}")
        print("=" * 70)


if __name__ == "__main__":
    manager = FiveGSliceManager()

    # Création des 3 slices standardisés
    print(manager.create_slice(NetworkSlice("SLC-001", SliceType.EMBB,  1.0, 50.0,     1_000, "Netflix")))
    print(manager.create_slice(NetworkSlice("SLC-002", SliceType.URLLC, 0.1,  1.0,     5_000, "Véhicules Autonomes")))
    print(manager.create_slice(NetworkSlice("SLC-003", SliceType.MMTC,  0.001,100.0, 1_000_000, "Smart City IoT")))

    print()
    manager.print_slices()

    # --- Simulation MEC ---
    print("\n🌐 SIMULATION MOBILE EDGE COMPUTING (MEC) — CALCUL DE LATENCE")
    mec_edge   = MECNode("MEC-PARIS-001", "Tour Eiffel gNB",  32, distance_km=0.5)
    mec_region = MECNode("MEC-IDF-002",   "Datacenter Croissy", 128, distance_km=30.0)
    cloud      = MECNode("CLOUD-AWS-EU",  "AWS eu-west-3 Paris", 512, distance_km=50.0)

    workload_ms = 2.0  # Traitement IA d'une image de caméra embarquée

    print(f"\n  Workload de traitement : {workload_ms}ms (Analyse IA caméra véhicule autonome)")
    for node in [mec_edge, mec_region, cloud]:
        total = node.compute_latency_ms(workload_ms)
        urllc_ok = total <= 1.0
        print(f"  {node.node_id:20s} [{node.location:30s}] → Latence Totale : {total:.3f}ms "
              f"{'✅ URLLC OK' if urllc_ok else '❌ URLLC KO'}")

    # --- Vérification SLA ---
    print("\n📋 VÉRIFICATION SLA SLICES EN PRODUCTION")
    result = manager.check_sla("SLC-002", measured_latency_ms=0.8, measured_bw_gbps=0.05)
    for k, v in result.items():
        print(f"  {k:25s} : {v}")
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **5GC** | 5G Core Network — Cœur de réseau 5G basé sur microservices |
| **AMF** | Access and Mobility Management Function — Gestion de l'accès et de la mobilité |
| **UPF** | User Plane Function — Routage des paquets utilisateur en 5G |
| **Network Slicing** | Création de réseaux logiques virtualisés sur une infrastructure physique partagée |
| **MEC** | Mobile Edge Computing — Calcul distribué au niveau de la station de base |
| **O-RAN** | Open Radio Access Network — Désagrégation ouverte du réseau radio d'accès |
| **eMBB** | Enhanced Mobile Broadband — Cas d'usage 5G haut débit |
| **URLLC** | Ultra-Reliable Low Latency Communications — Latence < 1 ms |
| **mMTC** | massive Machine-Type Communications — IoT massif |

---

## Exercices Pratiques

### Exercice 1 — Dimensionnement MEC pour un Véhicule Autonome

Un véhicule autonome de niveau 4 (L4) envoie des images de ses caméras embarquées au réseau pour traitement IA. L'IA prend **3 ms** de calcul. La distance au nœud MEC est de **1 km** (vitesse effective fibre = 200 km/ms).

1. Calculez la latence totale (propagation + calcul).
2. Le SLA URLLC (< 1 ms) est-il respecté ? Que proposez-vous ?

**Corrigé :**
1. Latence propagation = $\frac{1 \text{ km}}{200 \text{ km/ms}} = 0.005 \text{ ms}$. Latence totale = $0.005 + 3 = \mathbf{3.005 \text{ ms}}$.
2. **Non respecté**. Solution : embarquer le modèle IA directement sur le véhicule (Inference on-device) via TensorRT/ONNX Runtime sur GPU embarqué (NVIDIA Jetson), ou réduire la taille du modèle à < 1 ms d'inférence.

---

## Banque QCM — 5 Questions

**Q1.** Quel cas d'usage 5G exige une latence **inférieure à 1 milliseconde** ?

- A) eMBB (Enhanced Mobile Broadband)
- B) mMTC (massive Machine-Type Communications)
- C) URLLC (Ultra-Reliable Low Latency Communications) ✅
- D) NR (New Radio)

**Q2.** Qu'est-ce que le **Network Slicing** en 5G ?

- A) La découpe physique des câbles en fibre optique.
- B) La création de réseaux logiques virtuels isolés, avec garanties QoS dédiées, sur une même infrastructure physique partagée. ✅
- C) Une technique de chiffrement des données utilisateur.
- D) Un protocole de routage réseau.

**Q3.** Dans l'architecture 5GC, quelle fonction réseau est responsable du **routage des paquets du plan utilisateur** ?

- A) AMF (Access and Mobility Management Function)
- B) SMF (Session Management Function)
- C) UPF (User Plane Function) ✅
- D) PCF (Policy Control Function)

**Q4.** Qu'est-ce que l'**O-RAN** ?

- A) Un opérateur de télécommunications coréen.
- B) Une architecture de réseau radio d'accès (RAN) désagrégée basée sur des interfaces ouvertes et standardisées, permettant l'interopérabilité entre équipements de différents fournisseurs. ✅
- C) Un protocole de chiffrement radio.
- D) Un standard Wi-Fi 6.

**Q5.** Quel est l'avantage principal du **Mobile Edge Computing (MEC)** par rapport au Cloud centralisé ?

- A) Le MEC est moins cher à déployer.
- B) Le MEC réduit drastiquement la latence en rapprochant les ressources de calcul de l'utilisateur final (au niveau de la station de base), évitant le trajet aller-retour vers un datacenter central. ✅
- C) Le MEC n'a pas besoin de connexion réseau.
- D) Le MEC supporte plus de stockage.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
