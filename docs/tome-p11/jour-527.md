# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 527 (6h) : SIEM Avancé & Log Management : Elastic SIEM, Splunk Enterprise Security, Detection Engineering & UEBA

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre l'architecture de collecte, d'indexation et d'analyse de logs à l'échelle terabyter (**SIEM**)
> - Déployer et configurer **Elastic SIEM (Security)** et **Splunk Enterprise Security**
> - Appliquer la discipline du **Detection Engineering** : conception, test et cycle de vie des règles de détection (Detections-as-Code)
> - Analyser le comportement des utilisateurs et des entités avec **UEBA (User and Entity Behavior Analytics)** pour détecter les menaces internes (Insider Threats)
>
> **Compétences visées :** `SEC-04` (A), `SEC-06` (A) — SIEM & Detection Engineering

---

## Module 1 — Architecture SIEM & Detection Engineering (2h)

### 📖 Intuition & Narration

Une grande entreprise génère des dizaines de Gigaoctets de logs chaque heure : connexions pare-feu, authentifications Active Directory, événements Sysmon Windows, audit Kubernetes, requêtes DNS.

Stocker ces logs dans des fichiers texte bruts les rend inexploitables en cas de crise. Le **SIEM (Security Information and Event Management)** centralise, normalise (format ECS / CIM), indexe et analyse en temps réel ce flux massif d'événements pour y déceler les signaux faibles d'une attaque.

Le **Detection Engineering** est l'approche moderne qui traite les règles de détection SIEM comme du code source (**Detections-as-Code**) : versionnées dans Git, publiées via CI/CD et validées par des tests unitaires de simulation d'attaque.

### 🔍 Anatomie Technique — Pipeline d'Ingestion & Inférence UEBA

```
PIPELINE SIEM & DETECTION ENGINEERING AS CODE

  [ SOURCES DE LOGS ] ──► [ LOG COLLECTORS ] ──► [ SIEM INDEXER (Elastic / Splunk) ]
  (Sysmon, K8s, Cloud)    (Logstash, Vector)     Format Normalisé ECS (Elastic Common Schema)
                                                        │
                                                        ▼
  ┌────────────────────────────────────────────────────────┐
  │ DETECTION ENGINE (Detections-as-Code via Git)          │
  │ • Règles Correlation (Si A puis B dans les 5 min)      │
  │ • UEBA Anomalies (Comportement déviant de l'utilisateur)│
  └────────────────────────┬───────────────────────────────┘
                           │ (Déclenchement alerte)
                           ▼
  [ ALERTE QUALIFIÉE VERS SOC / SOAR ]
```

---

## Module 2 — Atelier Pratique : Détecteur d'Anomalies UEBA & Correlation Engine (2h)

### 🛠️ Code Python : SIEM Correlation & UEBA Anomaly Detection Engine

```python
#!/usr/bin/env python3
"""
PARADIS — SIEM Correlation & UEBA Anomaly Detection Engine
Simule l'ingestion d'événements normalisés ECS et détecte les attaques complexes (Brute-force + Privilege Escalation).
"""

import json
import time
import sys
from datetime import datetime, timedelta
from collections import defaultdict

class SIEMCorrelationEngine:
    def __init__(self):
        # Base d'historique comportemental pour UEBA (User Profile)
        self.user_normal_working_hours = {"alice": (8, 19), "bob": (9, 18)}
        self.failed_logins_window = defaultdict(list)

    def process_ecs_event(self, event: dict) -> dict:
        """Process un événement au format Elastic Common Schema (ECS)."""
        event_category = event.get("event", {}).get("category", "")
        user_name      = event.get("user", {}).get("name", "unknown")
        src_ip         = event.get("source", {}).get("ip", "unknown")
        timestamp_str  = event.get("@timestamp", datetime.now().isoformat())
        ts             = datetime.fromisoformat(timestamp_str)

        alerts = []

        # 1. RÈGLE DE CORRÉLATION : Brute-Force Login (5 échecs en 2 minutes)
        if event.get("event", {}).get("outcome") == "failure" and event_category == "authentication":
            self.failed_logins_window[user_name].append(ts)
            # Nettoyage de la fenêtre de 2 minutes
            cutoff = ts - timedelta(minutes=2)
            self.failed_logins_window[user_name] = [t for t in self.failed_logins_window[user_name] if t >= cutoff]

            if len(self.failed_logins_window[user_name]) >= 5:
                alerts.append({
                    "rule_id": "SIEM-RULE-BRUTEFORCE-01",
                    "severity": "HIGH",
                    "title": f"Tentative de Brute-Force sur le compte '{user_name}'",
                    "details": f"{len(self.failed_logins_window[user_name])} échecs d'authentification en 2 min depuis {src_ip}"
                })

        # 2. RÈGLE UEBA : Connexion Hors Heures Habituelles (Impossible Working Hours)
        if event.get("event", {}).get("outcome") == "success" and event_category == "authentication":
            hour = ts.hour
            normal_start, normal_end = self.user_normal_working_hours.get(user_name, (7, 20))
            if hour < normal_start or hour > normal_end:
                alerts.append({
                    "rule_id": "UEBA-ANOMALY-IMPOSSIBLE-HOURS",
                    "severity": "MEDIUM",
                    "title": f"Anomalie Comportementale UEBA : Connexion nocturne de '{user_name}'",
                    "details": f"Connexion réussie à {hour}h00 (Heures habituelles : {normal_start}h-{normal_end}h)"
                })

        return {
            "processed_event_id": event.get("event", {}).get("id"),
            "alerts_generated": alerts
        }

if __name__ == "__main__":
    print("=== DÉMARRAGE DU MOTEUR DE CORRÉLATION SIEM & UEBA ===")
    siem = SIEMCorrelationEngine()

    now_base = datetime.now()

    # Simulation d'une attaque Brute-Force suivie d'une connexion réussie
    events_stream = [
        # 5 échecs de connexion pour Bob en 30 secondes
        {"@timestamp": (now_base + timedelta(seconds=5)).isoformat(), "event": {"id": "ev1", "category": "authentication", "outcome": "failure"}, "user": {"name": "bob"}, "source": {"ip": "198.51.100.22"}},
        {"@timestamp": (now_base + timedelta(seconds=10)).isoformat(), "event": {"id": "ev2", "category": "authentication", "outcome": "failure"}, "user": {"name": "bob"}, "source": {"ip": "198.51.100.22"}},
        {"@timestamp": (now_base + timedelta(seconds=15)).isoformat(), "event": {"id": "ev3", "category": "authentication", "outcome": "failure"}, "user": {"name": "bob"}, "source": {"ip": "198.51.100.22"}},
        {"@timestamp": (now_base + timedelta(seconds=20)).isoformat(), "event": {"id": "ev4", "category": "authentication", "outcome": "failure"}, "user": {"name": "bob"}, "source": {"ip": "198.51.100.22"}},
        {"@timestamp": (now_base + timedelta(seconds=25)).isoformat(), "event": {"id": "ev5", "category": "authentication", "outcome": "failure"}, "user": {"name": "bob"}, "source": {"ip": "198.51.100.22"}},
        # Connexion nocturne réussie d'Alice à 03h00 du matin (Anomalie UEBA)
        {"@timestamp": now_base.replace(hour=3, minute=15).isoformat(), "event": {"id": "ev6", "category": "authentication", "outcome": "success"}, "user": {"name": "alice"}, "source": {"ip": "81.2.3.4"}}
    ]

    for ev in events_stream:
        res = siem.process_ecs_event(ev)
        if res["alerts_generated"]:
            for alert in res["alerts_generated"]:
                print(f"\n🚨 [SIEM ALERT] [{alert['severity']}] {alert['title']}")
                print(f"   Détails : {alert['details']}")

    print("\n[✅ SIEM PROCESSING COMPLETED] Flux de logs analysé avec succès.")
```

---

## Module 3 — Standard Normalisation ECS & Rétention des Logs (1h30)

### 🔍 Elastic Common Schema (ECS) & Politique de Rétention

Pour croiser des logs provenant de pare-feux Palo Alto, de serveurs NGINX et d'agents Sysmon, le SIEM impose une **normalisation** des noms de champs.

Le standard **ECS (Elastic Common Schema)** définit des champs universels :
- `source.ip` : Adresse IP source (quelle que soit la marque de l'équipement).
- `destination.port` : Port de destination.
- `user.name` : Nom d'utilisateur unique.

Politique de rétention type (Chaud / Froid) :
- **Hot Storage** (SSD ultra-rapide) : 30 jours (recherche instantanée pour le SOC).
- **Warm / Cold Storage** (S3 Object Lock immuable) : 1 an à 10 ans (conformité réglementaire RGPD/PCI-DSS/DORA).

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SIEM** | Security Information and Event Management — Gestionnaire d'informations et d'événements de sécurité |
| **UEBA** | User and Entity Behavior Analytics — Analyse comportementale des utilisateurs et entités |
| **ECS** | Elastic Common Schema — Standard de normalisation des champs de logs (Elastic) |
| **CIM** | Common Information Model — Standard de normalisation des logs (Splunk) |

---

## Exercices Pratiques

### Exercice 1 — Normalisation de Champs de Log

Deux équipements génèrent des logs de pare-feu :
- Équipement A : `src_ip="10.0.0.5" dest_port="443"`
- Équipement B : `clientIP="10.0.0.5" port="443"`

Traduisez ces deux logs au format standardisé **Elastic Common Schema (ECS)**.

**Corrigé guidé :**
Les deux logs traduits en ECS utiliseront exactement les mêmes noms de champs normalisés :
```json
{
  "source": {"ip": "10.0.0.5"},
  "destination": {"port": 443}
}
```

---

## Banque QCM — 5 Questions

**Q1.** Quel est le rôle principal d'un système **SIEM (Security Information and Event Management)** ?

- A) Formater les disques durs des serveurs.
- B) Centraliser, normaliser, indexer et analyser en temps réel l'ensemble des événements et logs du SI pour détecter des menaces complexes. ✅
- C) Imprimer les factures de l'entreprise.
- D) Générer des images 3D.

**Q2.** Que signifie l'approche **Detection Engineering / Detections-as-Code** ?

- A) Écrire les règles de détection du SIEM sur du papier.
- B) Traiter les règles de détection comme du code source logiciel (versionnées dans Git, testées automatiquement et déployées via des pipelines CI/CD). ✅
- C) Supprimer toutes les règles de détection.
- D) Utiliser uniquement des mots de passe à 4 chiffres.

**Q3.** Qu'est-ce que l'analyse **UEBA (User and Entity Behavior Analytics)** apporte de plus qu'une simple règle SIEM classique ?

- A) Elle accélère la vitesse de la carte réseau.
- B) Elle établit le profil comportemental habituel d'un utilisateur et détecte les déviations anomales (ex: connexion nocturne inhabituelle, volume de téléchargement anormal) même si l'action est individuellement autorisée. ✅
- C) Elle traduit les logs en allemand.
- D) Elle efface les logs de plus de 2 jours.

**Q4.** Quel est le rôle d'un schéma de normalisation comme **ECS (Elastic Common Schema)** ?

- A) Uniformiser les noms de champs (ex: `source.ip`) à travers toutes les sources de logs hétérogènes pour permettre des règles de corrélation universelles. ✅
- B) Chiffrer le disque dur.
- C) Compresser les fichiers au format ZIP.
- D) Réduire le salaire des analystes SOC.

**Q5.** Dans une politique de rétention de logs SIEM, que conserve-t-on dans le niveau **Hot Storage** ?

- A) Les logs vieux de 10 ans.
- B) Les logs très récents (ex: 30 derniers jours) stockés sur du stockage rapide (SSD) pour permettre des investigations et recherches temps réel par les analystes SOC. ✅
- C) Les logs supprimés.
- D) Les e-mails de la direction.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
