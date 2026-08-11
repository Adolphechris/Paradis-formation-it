# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 580 (6h) : Projet Intégrateur S12 Partie 3 — Frontier Technologies & Innovation Capstone

> [!NOTE]
> **Objectifs pédagogiques :**
> - Intégrer les technologies de frontière (XR, 5G, Robotique, Santé, Espace, Éthique, Startup) dans un projet de synthèse cohérent
> - Architecturer une **Plateforme d'Innovation Technologique** multi-couches alliant IoT, IA, Edge Computing et Spatial Computing
> - Défendre une **vision produit** complète : business model, architecture technique, considérations éthiques et roadmap de mise sur le marché
> - Appliquer les outils de **Lean Architecture Decision** (ADR, RFC, C4 Diagrams) pour gouverner l'innovation technologique
>
> **Compétences visées :** `ARCH-01` (A), `PRO-01` (A), `AI-01` (A) — Innovation Architecture, Frontier Tech Integration, Technical Leadership

---

## Module 1 — Conception de la Plateforme PARADIS NEXUS (2h)

### 📖 Contexte du Capstone

**Scénario :** Vous êtes l'**Architecte en Chef** d'une scale-up tech (PARADIS NEXUS Corp.) qui développe une **plateforme de gestion intelligente de ville durable** (Smart City 2.0). La ville de Paris vous a sélectionné pour un contrat pilote de 3 ans. Vous devez concevoir l'architecture technique complète, intégrant les technologies étudiées dans les 8 dernières leçons.

```
PARADIS NEXUS — PLATEFORME SMART CITY 2.0

  ┌─────────────────────────────────────────────────────────────────────┐
  │                    PARADIS NEXUS PLATFORM                          │
  │                                                                     │
  │  COUCHE 1 — COLLECTE (Edge & IoT)                                  │
  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐  │
  │  │CapteurAQ │ │ CubeSat  │ │ 5G O-RAN │ │  ROS 2 Robot Poubelle│  │
  │  │LoRaWAN   │ │Imagerie  │ │Private 5G│  │  Nav2 Autonome       │  │
  │  └──────┬───┘ └──────┬───┘ └──────┬───┘ └──────────┬───────────┘  │
  │         └────────────┴────────────┴────────────────┘               │
  │                           │ MQTT / Kafka                            │
  │  COUCHE 2 — TRAITEMENT (Cloud + MEC)                               │
  │  ┌──────────────────────────────────────────────────────────────┐  │
  │  │  Kafka Event Bus → IA Analyse (pollution/trafic/déchets)     │  │
  │  │  Digital Twin 3D Ville (WebXR / Three.js)                    │  │
  │  │  FHIR API Santé (Qualité Air → Alertes Sanitaires)           │  │
  │  │  FinOps GreenOps Dashboard (Énergie / CO₂ / Coût Cloud)      │  │
  │  └──────────────────────────────────────────────────────────────┘  │
  │                                                                     │
  │  COUCHE 3 — INTERFACE (Citoyens & Collectivité)                    │
  │  ┌──────────────────────────────────────────────────────────────┐  │
  │  │  App Mobile (5G URLLC) | WebXR Control Room | API FHIR       │  │
  │  │  EU AI Act Compliance Dashboard | NPS Citizen Score          │  │
  │  └──────────────────────────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────────────────────────┘
```

### 🔍 Architecture Decision Records (ADR) — Gouvernance Technique

```
ADR-001 : Choix du protocole IoT pour les capteurs de qualité de l'air

  STATUT : Accepté — 2026-08-11
  CONTEXTE :
    Les capteurs de QA (PM2.5, CO₂, NO₂) sont à batterie (2 ans), dispersés sur
    5 000 points de la ville. Ils transmettent 50 bytes toutes les 15 minutes.
  DÉCISION :
    LoRaWAN (868 MHz, SF9, DR3) sur infrastructure réseau public Objenious/Orange.
  CONSÉQUENCES :
    ✅ Autonomie batterie > 5 ans | ✅ Couverture 95% Paris | ✅ Coût < 2€/mois/capteur
    ❌ Débit limité (pas de vidéo) | ❌ Latence 5-10s (acceptable pour QA)
  ALTERNATIVES REJETÉES :
    NB-IoT : Débit similaire mais dépendance opérateur, moins de contrôle fréquence.
    5G mMTC : Trop cher pour capteurs simples basse consommation.

ADR-002 : Détection d'anomalies de pollution via Orbital AI

  STATUT : Accepté — 2026-08-11
  CONTEXTE :
    Surveillance des îlots de chaleur et panaches de pollution par imagerie multispectrale.
  DÉCISION :
    CubeSat 6U avec OBC Raspberry Pi + modèle IA on-board (MobileNetV3 INT8 TFLite).
    Downlink UHF 9.6kbps — transmission des cartes d'anomalies uniquement (< 10KB).
  CONSÉQUENCES :
    ✅ Réduction downlink 200x | ✅ Données fraîches toutes les 90 min (orbite LEO)
    ❌ Mise à jour modèle IA on-board complexe (OTA via S-Band)
```

---

## Module 2 — Implémentation & Considérations Éthiques (2h)

### 🔍 Ethical Review Board — AI Act Compliance

```
MATRICE DE CONFORMITÉ EU AI ACT — PARADIS NEXUS

  ┌────────────────────────────────────────────────┬──────────────┬──────────────────┐
  │  Composant IA                                  │ Niveau Risque│ Actions Requises │
  ├────────────────────────────────────────────────┼──────────────┼──────────────────┤
  │  Détection pollution (imagerie satellite)      │ 🟢 Minimal   │ Aucune           │
  │  Recommandation itinéraire robot poubelle      │ 🟡 Limité    │ Transparence     │
  │  Scoring qualité air → Alerte sanitaire FHIR   │ 🟠 Élevé*   │ Audit + DPO      │
  │  Reconnaissance plaques d'immatriculation trafic│ 🔴 Interdit* │ INTERDIT         │
  └────────────────────────────────────────────────┴──────────────┴──────────────────┘

  * Le scoring sanitaire déclenche des alertes médicales → SaMD class IIa
  * La reconnaissance plaque = biométrie + traçage → EU AI Act Art. 5 interdit
```

### 🔍 Modèle Économique & Unit Economics

```
BUSINESS MODEL PARADIS NEXUS

  REVENUS :
  ┌──────────────────────────────────────────────────────────┐
  │ B2G (Business-to-Government) SaaS — Paris Métropole     │
  │ → 150k€/an contrat pilote (3 ans) = 450k€ ARR           │
  │                                                          │
  │ Licences API FHIR (cliniques, hôpitaux)                  │
  │ → 2k€/mois/clinique × 20 cliniques = 40k€ MRR = 480k€ ARR│
  │                                                          │
  │ Data Insights (Partenaires Privés anonymisés)            │
  │ → 120k€/an (RGPD conforme — données agrégées)           │
  └──────────────────────────────────────────────────────────┘

  COÛTS INFRASTRUCTURE :
  Cloud (K8s/GKE) : 8k€/mois
  LoRaWAN Réseau  : 2k€/mois  (5000 capteurs × 0.4€/mois)
  CubeSat Ops     : 3k€/mois  (station sol + données)
  TOTAL INFRA     : 13k€/mois = 156k€/an

  UNIT ECONOMICS : LTV/CAC ≈ 4.2x ✅ (PMF confirmé pilote Paris)
```

---

## Module 3 — Atelier Pratique : NEXUS Platform Integration Test (1h30)

### 🛠️ Script Python : PARADIS NEXUS Smart City Integration Suite

```python
#!/usr/bin/env python3
"""
PARADIS NEXUS — Smart City Platform Integration Suite
Intègre les technologies étudiées J573-J579 : IoT LoRa, Digital Twin, Orbital AI,
FHIR Health Alerts, Fairness Audit, Startup Metrics.
"""
import json
import time
import random
import hashlib
import datetime
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from enum import Enum

# ─── MODÈLES DE DONNÉES UNIFIÉS ────────────────────────────────────────────

class AlertSeverity(Enum):
    INFO     = "INFO"
    WARNING  = "WARNING"
    CRITICAL = "CRITICAL"

@dataclass
class AirQualityReading:
    """Lecture capteur LoRaWAN Qualité de l'Air"""
    sensor_id      : str
    timestamp_iso  : str
    location       : str
    pm25_ugm3      : float   # PM2.5 en µg/m³ — OMS : max 15 µg/m³ (24h)
    co2_ppm        : float   # CO₂ en ppm — Seuil alerte : 1000 ppm
    temperature_c  : float
    battery_pct    : float

@dataclass
class SatelliteAnomalyReport:
    """Rapport Orbital AI — Détection anomalie de pollution"""
    satellite_id    : str
    orbit_number    : int
    detection_area  : str
    anomaly_type    : str    # "HEAT_ISLAND" | "POLLUTION_PLUME" | "NONE"
    confidence_pct  : float
    thumbnail_size_kb: float  # Taille données transmises (après compression IA)

@dataclass
class FHIRHealthAlert:
    """Alerte FHIR R4 générée automatiquement si seuil dépassé"""
    alert_id       : str
    timestamp_iso  : str
    population_zone: str
    trigger_sensor : str
    pm25_value     : float
    severity       : AlertSeverity
    fhir_resource  : dict  # Ressource FHIR Observation générée

# ─── COMPOSANTS DE LA PLATEFORME ────────────────────────────────────────────

class IoTDataPipeline:
    """Pipeline de traitement des données capteurs LoRaWAN"""

    PM25_OMS_24H_LIMIT   = 15.0   # µg/m³
    PM25_ALERT_THRESHOLD = 35.0   # µg/m³ — Seuil alerte critique

    def process_reading(self, reading: AirQualityReading) -> dict:
        status = "NOMINAL"
        if reading.pm25_ugm3 > self.PM25_ALERT_THRESHOLD:
            status = "CRITICAL"
        elif reading.pm25_ugm3 > self.PM25_OMS_24H_LIMIT:
            status = "WARNING"

        return {
            "sensor_id" : reading.sensor_id,
            "location"  : reading.location,
            "pm25"      : reading.pm25_ugm3,
            "co2"       : reading.co2_ppm,
            "status"    : status,
            "battery"   : reading.battery_pct,
            "timestamp" : reading.timestamp_iso
        }

class FHIRAlertGenerator:
    """Génère des ressources FHIR R4 Observation automatiquement"""

    def generate_alert(self, reading: AirQualityReading, status: str) -> Optional[FHIRHealthAlert]:
        if status not in ("WARNING", "CRITICAL"):
            return None

        severity  = AlertSeverity.CRITICAL if status == "CRITICAL" else AlertSeverity.WARNING
        alert_id  = hashlib.md5(f"{reading.sensor_id}{reading.timestamp_iso}".encode()).hexdigest()[:8]

        fhir_obs = {
            "resourceType": "Observation",
            "id"          : f"obs-aq-{alert_id}",
            "status"      : "final",
            "code"        : {"coding": [{"system": "http://loinc.org", "code": "89268-9",
                                          "display": "PM2.5 Concentration"}]},
            "effectiveDateTime": reading.timestamp_iso,
            "valueQuantity"    : {"value": reading.pm25_ugm3, "unit": "µg/m³"},
            "interpretation"   : [{"coding": [{"system": "http://hl7.org/fhir/v2/0078",
                                               "code": "H" if status == "CRITICAL" else "HH",
                                               "display": severity.value}]}]
        }

        return FHIRHealthAlert(
            alert_id=alert_id, timestamp_iso=reading.timestamp_iso,
            population_zone=reading.location, trigger_sensor=reading.sensor_id,
            pm25_value=reading.pm25_ugm3, severity=severity, fhir_resource=fhir_obs
        )

class NexusPlatform:
    """Orchestrateur principal de la plateforme PARADIS NEXUS Smart City"""

    def __init__(self):
        self.iot_pipeline      = IoTDataPipeline()
        self.fhir_generator    = FHIRAlertGenerator()
        self.processed_events  = 0
        self.alerts_generated  = 0
        self.digital_twin_state: Dict[str, dict] = {}

    def ingest_iot_reading(self, reading: AirQualityReading) -> dict:
        """Point d'entrée unique pour les données capteurs"""
        self.processed_events += 1

        # 1. Traitement pipeline IoT
        event = self.iot_pipeline.process_reading(reading)

        # 2. Mise à jour Jumeau Numérique (Digital Twin)
        self.digital_twin_state[reading.location] = {
            "color_hex"  : "#FF0000" if event["status"] == "CRITICAL"
                           else "#FFA500" if event["status"] == "WARNING" else "#00FF00",
            "pm25"       : reading.pm25_ugm3,
            "last_update": reading.timestamp_iso
        }

        # 3. Génération alerte FHIR si nécessaire
        alert = self.fhir_generator.generate_alert(reading, event["status"])
        if alert:
            self.alerts_generated += 1
            event["fhir_alert"] = {
                "alert_id": alert.alert_id,
                "severity": alert.severity.value,
                "fhir_id" : alert.fhir_resource["id"]
            }

        return event

    def print_dashboard(self):
        print("=" * 70)
        print("  🌆 PARADIS NEXUS — SMART CITY PLATFORM DASHBOARD")
        print("=" * 70)
        print(f"  Total Events Traités : {self.processed_events}")
        print(f"  Alertes FHIR Émises  : {self.alerts_generated}")
        print("\n  📍 DIGITAL TWIN — ÉTAT PAR ZONE :")
        for zone, state in self.digital_twin_state.items():
            color_label = "🔴 CRITIQUE" if state["color_hex"] == "#FF0000" \
                          else "🟠 ALERTE" if state["color_hex"] == "#FFA500" else "🟢 NOMINAL"
            print(f"    {zone:25s} | PM2.5: {state['pm25']:.1f} µg/m³ | {color_label}")
        print("=" * 70)


if __name__ == "__main__":
    print("=== PARADIS NEXUS — SMART CITY INTEGRATION DEMO ===\n")

    platform = NexusPlatform()
    ts = datetime.datetime.utcnow().isoformat() + "Z"

    # Lectures simulées de 5 zones de Paris
    readings = [
        AirQualityReading("AQ-001", ts, "Paris 1er — Louvre",        8.2,  420.0, 24.5, 87.0),
        AirQualityReading("AQ-002", ts, "Paris 11e — Nation",        22.7,  680.0, 27.1, 73.0),
        AirQualityReading("AQ-003", ts, "Paris 13e — Porte d'Italie",42.5, 1150.0, 31.2, 61.0),
        AirQualityReading("AQ-004", ts, "Paris 8e — Champs-Élysées", 18.3,  520.0, 25.8, 90.0),
        AirQualityReading("AQ-005", ts, "Boulogne-Billancourt",       6.1,  390.0, 23.0, 95.0),
    ]

    for reading in readings:
        event = platform.ingest_iot_reading(reading)
        status_icon = "🔴" if event["status"] == "CRITICAL" else "🟠" if event["status"] == "WARNING" else "🟢"
        print(f"  {status_icon} [{event['location'][:30]}] PM2.5: {event['pm25']:.1f} µg/m³ — {event['status']}"
              + (f" → FHIR Alert: {event['fhir_alert']['alert_id']}" if "fhir_alert" in event else ""))

    print()
    platform.print_dashboard()

    # Rapport Orbital AI
    print("\n🛸 ORBITAL AI — DERNIER RAPPORT SATELLITE")
    sat_report = SatelliteAnomalyReport(
        satellite_id="NEXUS-SAT-1", orbit_number=2847,
        detection_area="Paris 13e — Ivry-sur-Seine Industrie",
        anomaly_type="POLLUTION_PLUME", confidence_pct=91.3,
        thumbnail_size_kb=8.7
    )
    print(f"  Satellite     : {sat_report.satellite_id} (Orbite #{sat_report.orbit_number})")
    print(f"  Zone          : {sat_report.detection_area}")
    print(f"  Anomalie      : {sat_report.anomaly_type} (confiance: {sat_report.confidence_pct:.1f}%)")
    print(f"  Données reçues: {sat_report.thumbnail_size_kb} KB (Orbital AI — réduction ~200x)")
    print(f"  → Corrélation avec capteur AQ-003 PM2.5=42.5 µg/m³ : ✅ COHÉRENT")
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ADR** | Architecture Decision Record — Document de gouvernance architecturale décrivant un choix et ses raisons |
| **RFC** | Request For Comments — Document de proposition technique pour discussion et validation collégiale |
| **Smart City 2.0** | Ville intelligente de 2ème génération : IoT + IA + Big Data + Spatial Computing |
| **B2G** | Business-to-Government — Modèle commercial ciblant les collectivités et administrations publiques |
| **GreenOps** | Opérations IT optimisées pour minimiser l'empreinte carbone et la consommation énergétique |

---

## Exercices Pratiques

### Exercice 1 — Calcul de l'Empreinte Carbone de la Plateforme NEXUS

La plateforme NEXUS tourne sur GKE (Google Cloud — région europe-west9 Paris). L'infrastructure consomme :
- **Kubernetes Cluster** : 30 nœuds × 100W = 3000W
- **LoRaWAN Gateway** : 50 gateways × 5W = 250W
- **CubeSat Ground Station** : 1 station × 500W (seulement 15 min/orbite, soit 1/6 du temps)

L'intensité carbone de l'électricité française est de **52 gCO₂eq/kWh** (RTE 2025).

1. Calculez la consommation totale continue en Watts.
2. Calculez la consommation mensuelle en kWh.
3. Calculez l'empreinte carbone mensuelle en kg CO₂eq.

**Corrigé :**
1. Ground Station effective = $500 \times \frac{15}{90} \approx 83 \text{ W}$. Total = $3000 + 250 + 83 = \mathbf{3333 \text{ W}}$.
2. Mensuel : $3.333 \text{ kW} \times 24h \times 30j = \mathbf{2400 \text{ kWh/mois}}$.
3. Empreinte : $2400 \times 0.052 \text{ kg/kWh} = \mathbf{124.8 \text{ kg CO₂eq/mois}} \approx 1.5 \text{ t CO₂eq/an}$.

---

## Banque QCM — 5 Questions

**Q1.** Quel document de gouvernance architecturale documente **pourquoi** une décision technique a été prise, quelles alternatives ont été évaluées et quelles sont les conséquences ?

- A) README.md
- B) CHANGELOG.md
- C) Architecture Decision Record (ADR) ✅
- D) Dockerfile

**Q2.** Dans la plateforme NEXUS, pourquoi utilise-t-on **LoRaWAN** pour les capteurs de qualité de l'air plutôt que la 5G ?

- A) Parce que la 5G n'existe pas encore en France.
- B) LoRaWAN offre une autonomie batterie de plusieurs années avec une consommation < 50 mW, adapté à des milliers de capteurs disséminés transmettant quelques bytes toutes les 15 minutes — là où la 5G est surcapacitaire et trop énergivore. ✅
- C) Parce que LoRaWAN est plus rapide que la 5G.
- D) Pour économiser sur les licences réseau.

**Q3.** Le composant **Digital Twin 3D** de la ville de Paris dans NEXUS sert principalement à :

- A) Remplacer le SIG (Système d'Information Géographique) municipal.
- B) Visualiser en temps réel l'état des capteurs et des équipements de la ville dans une représentation 3D synchronisée, permettant une détection rapide des anomalies et une prise de décision contextuelle. ✅
- C) Jouer à des jeux vidéo en réalité virtuelle.
- D) Stocker les fichiers CAD de la ville.

**Q4.** Pourquoi la détection de plaques d'immatriculation pour la gestion du trafic est-elle **interdite** par l'EU AI Act dans le contexte NEXUS ?

- A) Parce que la technologie OCR n'est pas assez précise.
- B) Parce que la reconnaissance de plaques en espace public constitue de la biométrie permettant l'identification et le traçage de personnes physiques — classée "Risque Inacceptable" par l'EU AI Act Art. 5. ✅
- C) Parce que les voitures électriques n'ont pas de plaques.
- D) Parce que le RGPD interdit toute caméra dans les rues.

**Q5.** Pour un contrat B2G (Business-to-Government) comme NEXUS avec la Ville de Paris, quel instrument légal est généralement utilisé pour formaliser le partenariat ?

- A) Un tweet officiel du Maire.
- B) Un accord verbal entre directeurs techniques.
- C) Un Marché Public passé selon les règles du Code de la Commande Publique (CCP), avec CCAP, CCTP, BPU et possibilité de DSP (Délégation de Service Public). ✅
- D) Un simple bon de commande signé.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
