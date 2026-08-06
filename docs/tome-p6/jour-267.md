# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 267 (6h) : Advanced Threat Hunting (KQL Queries, Hunting Hypotheses, Beaconing Detection & Statistical Anomalies Analysis)

> [!NOTE]
> **Objectif du jour :** Maîtriser les méthodes de **Threat Hunting proactif** avancées ciblées par les certifications **GCTI** et **BTL2** : élaborer des hypothèses de chasse basées sur MITRE ATT&CK, rédiger des requêtes complexes en **KQL (Kusto Query Language / Kibana)**, et détecter le **Beaconing C2** via l'analyse statistique d'inter-arrival time (Jitter/Periodic Time Delta).
>
> **Compétences visées :** `HUNT-01` (A) — Proactive Threat Hunting & KQL | `HUNT-02` (A) — C2 Beaconing Detection & Statistical Analysis

---

## 1) Module — Démarche de Threat Hunting Proactif (1h30)

### 📖 Narration/Intuition

Contrairement aux alertes réactives du SIEM qui se déclenchent sur des signatures connues, le **Threat Hunting proactif** part de l'hypothèse que **l'attaquant est DEJÀ dans le réseau** sans avoir déclenché d'alerte. Le Threat Hunter formule des hypothèses basées sur des comportements anormaux et cherche les anomalies statistiques dans des milliards de logs de télémétrie.

---

## 2) Module — Détection de C2 Beaconing via Analyse Statistique (2h30)

### 🛠️ Atelier Pratique

**Script Python de détection de Beaconing HTTP par variance d'intervalle (`beaconing_detector.py`) :**

```python
import numpy as np

# Simulation de timestamps de requêtes réseau (en secondes) émanant d'un agent C2 Cobalt Strike
# Jitter configuré à 10% sur un sleep de 60 secondes (Intervalle quasi-périodique)

timestamps = [10.2, 70.1, 130.4, 190.2, 250.5, 310.1, 370.3, 430.2, 490.4]

# 1) Calcul des deltas de temps inter-requêtes (Inter-Arrival Times)
deltas = np.diff(timestamps)

# 2) Calcul de la moyenne et de l'écart-type (Standard Deviation)
mean_delta = np.mean(deltas)
std_delta = np.std(deltas)

# Score de périodicité (Ratio Ecart-Type / Moyenne)
periodicity_score = std_delta / mean_delta

print(f"[*] Deltas d'inter-connexion : {deltas}")
print(f"[*] Intervalle moyen : {mean_delta:.2f} secondes")
print(f"[*] Écart-type (Variance) : {std_delta:.2f} secondes")
print(f"[*] Score de variance : {periodicity_score:.4f}")

if periodicity_score < 0.15:
    print("[!] ALERTE HIGH CONFIDENCE : Détection de C2 Beaconing Périodique (Variance ultra-faible) !")
```

---

## 3) Module — Requêtes KQL pour Threat Hunting Azure Sentinel / Elastic (2h)

```kql
// Requête KQL Azure Sentinel — Détection d'exécution rare de processus avec argument réseau
DeviceProcessEvents
| where TimeGenerated > ago(7d)
| where ProcessCommandLine contains "http://" or ProcessCommandLine contains "https://"
| summarize Count = count() by FileName, ProcessCommandLine
| where Count < 3 // Filtrer les commandes exécutées moins de 3 fois dans la semaine (Anomalie statistique)
| order by Count asc
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **KQL** | Kusto Query Language — Langage de recherche hautement optimisé de Microsoft Azure Sentinel |
| **Beaconing** | Communication réseau périodique envoyée par une implant/malware vers son serveur C2 |
| **Jitter** | Variation aléatoire introduite dans l'intervalle de sleep d'un C2 pour contourner la détection |
| **BTL2** | Blue Team Level 2 — Certification de référence avancée pour SOC Analysts et Threat Hunters |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle est la différence fondamentale entre le **Threat Hunting** et le Monitoring SOC réactif ?
- A) Le Threat Hunting est une recherche proactive d'intrusions non détectées basée sur des hypothèses, tandis que le Monitoring SOC réagit aux alertes générées par des règles prédéfinies
- B) Le Threat Hunting n'utilise pas de données de logs
- C) Le Monitoring SOC est réservé aux serveurs Linux
- D) Le Threat Hunting est entièrement automatique sans humain

**Réponse : A**

**Q2 :** Dans la détection de **C2 Beaconing**, que cherche à masquer le développeur de malware en configurant du **Jitter** ?
- A) La régularité statistique stricte des intervalles de temps entre les requêtes HTTP de l'implant (périodicité)
- B) L'adresse IP de destination
- C) La taille des fichiers
- D) Le nom de domaine DNS

**Réponse : A**

**Q3 :** Dans Azure Sentinel, quel langage de requête est utilisé pour explorer les logs de télémétrie EDR et SIEM ?
- A) KQL (Kusto Query Language)
- B) SQL
- C) Python
- D) Bash

**Réponse : A**

**Q4 :** Si l'écart-type des deltas de temps d'inter-connexion vers une adresse IP externe est très proche de zéro (variance nulle), quelle est la conclusion du Threat Hunter ?
- A) Il s'agit très probablement d'un Beaconing automatisé (Script ou implant C2 sans Jitter)
- B) Il s'agit d'un utilisateur humain naviguant sur le Web
- C) Le serveur est hors ligne
- D) La connexion est chiffrée en AES-256

**Réponse : A**

**Q5 :** Quelle certification de la Security Blue Team valide les compétences avancées en Threat Hunting et Incident Response L2/L3 ?
- A) BTL2 (Blue Team Level 2)
- B) CEH
- C) Network+
- D) Security+

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
