# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 267 (6h) : Advanced Threat Hunting (KQL Queries, Hunting Hypotheses, Beaconing Detection & Statistical Anomalies Analysis)

> [!NOTE]
> **Objectif du jour :** Maîtriser les méthodes de **Threat Hunting proactif** avancées ciblées par les certifications **GCTI** et **BTL2** : élaborer des hypothèses de chasse basées sur la matrice MITRE ATT&CK, rédiger des requêtes complexes en **KQL (Kusto Query Language)** pour Azure Sentinel / Defender XDR, et détecter le **Beaconing C2** via l'analyse statistique d'inter-arrival time (Jitter / Time Delta Variance).
>
> **Compétences visées :** `HUNT-01` (A) — Proactive Threat Hunting & KQL | `HUNT-02` (A) — C2 Beaconing Detection & Statistical Analysis

---

## 🎯 Objectifs de la Leçon

- 🕵️ Comprendre la rupture entre le monitoring SOC réactif basique et le **Threat Hunting proactif** basé sur des hypothèses.
- 📐 Modéliser le niveau de maturité en Threat Hunting via l'échelle **HMM (Hunting Maturity Model)** de HMM 0 à HMM 4.
- 📊 Analyser mathématiquement le trafic réseau pour détecter les agents C2 cachés (*Beaconing & Jitter*) via la variance statistique ($CV = \frac{\sigma}{\mu}$).
- 📜 Rédiger des requêtes d'élite en **KQL** (*Kusto Query Language*) pour traquer les anomalies de persistance et de mouvement latéral dans Azure Sentinel.
- 🧪 Exécuter le script de détection statistique d'anomalies de trafic (`beaconing_detector.py`).

---

## 🖼️ Advanced Threat Hunting & KQL Analytics

![Advanced Threat Hunting & KQL](https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800)

---

## 📖 1. La Démarche de Threat Hunting Proactif

### 1.1 Narration & Intuition — Le Détective vs l'Alarme Incendie

Dans un SOC traditionnel, les analystes fonctionnent comme des pompiers réactifs : ils attendent qu'une alarme incendie (une règle de signature du SIEM) se déclenche pour intervenir. Si un attaquant utilise un exploit *Zero-Day* ou un binaire légitime du système (*Living off the Land*), l'alarme ne sonnera jamais !

Le **Threat Hunter** agit comme un détective privé proactif. Il part du principe fondamental que **l'adversaire a DÉJÀ pénétré le réseau sans déclencher la moindre alerte**. Il formule des hypothèses scientifiques basées sur la matrice **MITRE ATT&CK** et fouille dans des milliards de logs pour identifier l'anomalie comportementale.

### 1.2 L'Échelle de Maturité du Threat Hunting (HMM Model)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ HMM 0 — INITIAL (Réactif)                                                │
│ - Se fie uniquement aux alertes automatisées des antivirus/SIEM.         │
├──────────────────────────────────────────────────────────────────────────┤
│ HMM 1 — MINIMAL (Basé sur les IoCs)                                      │
│ - Recherche ponctuelle d'adresses IP ou de hashes de malwares connus.     │
├──────────────────────────────────────────────────────────────────────────┤
│ HMM 2 — PROCEDURAL (Basé sur les TTPs)                                   │
│ - Recherche de procédures d'attaque connues (ex: execution de vssadmin). │
├──────────────────────────────────────────────────────────────────────────┤
│ HMM 3 — INNOVATING (Basé sur l'Analyse Comportementale)                  │
│ - Création de nouvelles méthodes de détection par analyse d'anomalies.   │
├──────────────────────────────────────────────────────────────────────────┤
│ HMM 4 — LEADING (Automatisé)                                             │
│ - Les chasses réussies sont immédiatement transformées en règles SIEM.   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 📖 2. Détection de C2 Beaconing par Analyse Statistique

### 2.1 Le Défi du Jitter dans les Implants Red Team

Lorsqu'un implant C2 (ex: Cobalt Strike, Sliver) est installé sur un poste compromis, il envoie des requêtes réseau périodiques (*Beacons*) vers son serveur de contrôle pour récupérer des ordres.

Pour éviter d'être repéré par des requêtes envoyées à intervalle fixe (ex: exactement toutes les 60 secondes), les Red Teams ajoutent du **Jitter** (un pourcentage de délai aléatoire, ex: $60 \text{s} \pm 20\%$).

```
                COMMUNICATION C2 AVEC JITTER (60s ± 20%)
┌──────────────────────────────────────────────────────────────────────────┐
│ Paquet 1 ──► [ 58.2s ] ──► Paquet 2 ──► [ 64.1s ] ──► Paquet 3           │
│                                                                          │
│ Même avec du Jitter, la VARIANCE STATISTIQUE de l'intervalle d'arrivée   │
│ reste infiniment plus faible que la navigation d'un utilisateur humain ! │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Formule de Calcul du Coefficient de Variation ($CV$)

Pour chaque couple d'adresses IP (Source / Destination), le Threat Hunter extrait la liste des deltas de temps entre connexions successives ($\Delta t_1, \Delta t_2, \dots, \Delta t_n$).

$$\text{Moyenne } \mu = \frac{1}{N} \sum_{i=1}^{N} \Delta t_i \quad \text{et} \quad \text{Écart-type } \sigma = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (\Delta t_i - \mu)^2}$$

$$\text{Coefficient de Variation } CV = \frac{\sigma}{\mu}$$

- Si $CV < 0.20$ : **Présence quasi-certaine d'un Beaconing C2 automatisé** (Seuil d'alerte critique).
- Si $CV > 0.80$ : Trafic web généré par une activité humaine normale (navigation erratique).

---

## 📖 3. Rédiger des Requêtes d'Élite en KQL (Kusto Query Language)

**KQL** est le langage de recherche ultra-performant de Microsoft Azure Sentinel et Microsoft Defender XDR.

### Requête KQL 1 : Détection d'exécutions rares de processus avec arguments réseau

```kql
// Recherche des processus qui s'exécutent moins de 3 fois sur tout le parc (Anomalie de Fréquence)
DeviceProcessEvents
| where TimeGenerated > ago(7d)
| where ProcessCommandLine has_any ("http://", "https://", "powershell -e", "cmd /c echo")
| summarize Count = count(), Hosts = makeset(DeviceName) by FileName, ProcessCommandLine
| where Count <= 3
| order by Count asc
```

### Requête KQL 2 : Chasse au Mouvement Latéral via WMI et WinRM

```kql
// Détection des créations de processus distants via WMI (MITRE T1047)
DeviceProcessEvents
| where TimeGenerated > ago(24h)
| where ParentFileName =~ "wmiprvse.exe"
| where FileName in~ ("cmd.exe", "powershell.exe", "rundll32.exe", "certutil.exe")
| project TimeGenerated, DeviceName, AccountName, FileName, ProcessCommandLine, ParentFileName
```

### Requête KQL 3 : Détection d'anomalies de volume d'exfiltration réseau avec `make-series`

```kql
// Analyse de séries temporelles du trafic sortant par hôte (Détection Exfiltration)
DeviceNetworkEvents
| where TimeGenerated > ago(14d)
| where RemoteIPType == "Public"
| make-series TotalBytesSent = sum(BytesSent) on TimeGenerated step 1h by DeviceName
| extend (Anomalies, Score, Baseline) = series_decompose_anomalies(TotalBytesSent, 2.5)
| mv-expand TimeGenerated to scalar, TotalBytesSent to scalar, Anomalies to scalar
| where Anomalies > 0
| project TimeGenerated, DeviceName, TotalBytesSent, Anomalies
```

---

## 🧪 4. Atelier Pratique : Script de Détection Statistique C2 (`beaconing_detector.py`)

### Script Python : Analyse des Timestamps et Détection du Jitter C2

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PARADIS IT — Masterclass Cybersécurité (Tome P6 - Jour 267)
Threat Hunting : Détection Statistique du C2 Beaconing (Jitter & Variance)
"""

import json
import math
import sys

def analyze_beaconing_statistics(timestamps):
    """
    Calcule le coefficient de variation (CV) des deltas d'inter-arrivée.
    CV = std_dev / mean
    """
    if len(timestamps) < 3:
        return {"status": "INSUFFICIENT_DATA", "score": 1.0}
    
    # 1. Calcul des deltas de temps entre connexions successives
    deltas = [timestamps[i+1] - timestamps[i] for i in range(len(timestamps) - 1)]
    
    # 2. Calcul de la moyenne (mu)
    mean_delta = sum(deltas) / len(deltas)
    if mean_delta == 0:
        return {"status": "ZERO_DELTA", "score": 0.0}
    
    # 3. Calcul de l'écart-type (sigma)
    variance = sum((x - mean_delta) ** 2 for x in deltas) / len(deltas)
    std_dev = math.sqrt(variance)
    
    # 4. Coefficient de variation (CV)
    cv = std_dev / mean_delta
    
    is_beacon = cv < 0.20
    
    return {
        "total_connections": len(timestamps),
        "mean_interval_seconds": round(mean_delta, 2),
        "std_dev_seconds": round(std_dev, 2),
        "coefficient_of_variation": round(cv, 4),
        "is_c2_beaconing_detected": is_beacon,
        "threat_severity": "CRITICAL_HIGH" if is_beacon else "LOW_NORMAL"
    }

def main():
    print("=================================================================")
    print("   PARADIS IT — ADVANCED THREAT HUNTING : C2 BEACONING ANALYZER  ")
    print("=================================================================")

    # Jeux de données de test :
    # Scénario A : Implant C2 Cobalt Strike (Sleep 60s, Jitter 15%)
    c2_timestamps = [10.2, 70.1, 130.4, 190.2, 250.5, 310.1, 370.3, 430.2, 490.4]

    # Scénario B : Utilisateur Humain (Navigation web erratique)
    human_timestamps = [10.2, 14.5, 89.1, 92.0, 450.3, 452.1, 1200.0, 1205.4]

    print("\n[*] ANALYSE DU SCÉNARIO A (Trafic Réseau Suspect 198.51.100.45)...")
    res_a = analyze_beaconing_statistics(c2_timestamps)
    print(json.dumps(res_a, indent=2))

    if res_a["is_c2_beaconing_detected"]:
        print(f"\n[!] ALERTE THREAT HUNTING : Agent C2 Périodique Détecté ! (CV = {res_a['coefficient_of_variation']})")

    print("\n[*] ANALYSE DU SCÉNARIO B (Trafic Réseau Utilisateur)...")
    res_b = analyze_beaconing_statistics(human_timestamps)
    print(json.dumps(res_b, indent=2))
    print("=================================================================")

if __name__ == "__main__":
    main()
```

### Exécution du Script dans le Terminal

```bash
# Exécuter le script d'analyse statistique de Threat Hunting
python3 -c "
import math
deltas = [59.8, 61.2, 60.1, 58.9, 60.5]
mu = sum(deltas)/len(deltas)
sigma = math.sqrt(sum((x-mu)**2 for x in deltas)/len(deltas))
cv = sigma / mu
print('=== SIMULATION THREAT HUNTING STATISTIQUE ===')
print(f'Intervalle Moyen : {mu:.2f}s | Écart-Type : {sigma:.2f}s | CV : {cv:.4f}')
print('Résultat : ' + ('[!] ALERTE C2 BEACONING' if cv < 0.20 else 'Trafic Humain Normal'))
"
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Faux Positifs de Beaconing : Les agents de mise à jour et la télémétrie légitime
- **Cause** : Certains services légitimes (ex: agents antivirus, NTP, vérification de mises à jour Windows) envoient des requêtes à des intervalles réguliers très faibles ($CV < 0.10$).
- **Réflexe** : Filtrez les requêtes réseau vers des domaines réputés et certifiés (ex: `*.microsoft.com`, `*.windowsupdate.com`) avant d'appliquer l'analyse statistique de variance sur les adresses IP externes inconnues.

### 2. Optimiser les performances des requêtes KQL sur Azure Sentinel
- **Réflexe** : Placez toujours le filtre temporel (`| where TimeGenerated > ago(24h)`) et les filtres d'égalité stricts (`where EventID == 4624`) tout en haut de votre requête KQL avant les opérations de `summarize` ou `join`.

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Quelle est la différence fondamentale entre le Threat Hunting proactif et le monitoring SOC réactif ?**
- A) Le Threat Hunting utilise uniquement des câbles réseau en fibre optique
- B) Le Threat Hunting est une recherche proactive d'intrusions non détectées basée sur l'hypothèse que l'adversaire est déjà dans le SI, tandis que le SOC réagit aux alertes générées
- C) Le SOC réactif n'utilise aucun log
- D) Il n'y a aucune différence

*Réponse : B — Le Threat Hunting cherche proactivement les menaces masquées sans attendre le déclenchement d'une alerte.*

**Q2 : Que tente de masquer un développeur de malware Red Team en configurant du "Jitter" sur son implant C2 ?**
- A) La régularité statistique stricte des intervalles de temps de connexion (*Beaconing*)
- B) L'adresse IP de destination
- C) La taille de la mémoire RAM
- D) La marque du processeur

*Réponse : A — Le Jitter injecte une variation aléatoire dans les intervalles de temps pour contourner les règles de périodicité fixe.*

**Q3 : Quel indicateur statistique (ratio entre l'écart-type et la moyenne) est utilisé par les Threat Hunters pour identifier le C2 Beaconing ?**
- A) Le masque de sous-réseau
- B) Le Coefficient de Variation ($CV = \frac{\sigma}{\mu}$)
- C) Le nombre de fichiers supprimés
- D) L'adresse MAC

*Réponse : B — Un faible Coefficient de Variation ($CV < 0.20$) confirme la périodicité artificielle des connexions d'un implant C2.*

**Q4 : Quel langage de requête hautement optimisé est utilisé par Microsoft Azure Sentinel et Microsoft Defender XDR pour explorer la télémétrie ?**
- A) SQL
- B) KQL (Kusto Query Language)
- C) HTML
- D) Bash

*Réponse : B — KQL (Kusto Query Language) est le langage de recherche spécialisé des solutions de sécurité Microsoft.*

**Q5 : Dans le modèle de maturité du Threat Hunting (HMM), quel niveau caractérise une organisation qui automatise ses chasses réussies en nouvelles règles de détection permanentes ?**
- A) HMM 0 (Initial)
- B) HMM 4 (Leading)
- C) HMM 1 (Minimal)
- D) HMM 2 (Procedural)

*Réponse : B — Le niveau HMM 4 (Leading) intègre l'automatisation continue des découvertes de chasse dans le SIEM.*

**Q6 : Quelle fonction KQL est utilisée pour créer des agrégations temporelles et analyser les anomalies de trafic sur plusieurs jours ?**
- A) `make-series`
- B) `print`
- C) `clear`
- D) `delete`

*Réponse : A — `make-series` permet de construire des séries temporelles exploitées par les fonctions d'analyse d'anomalies comme `series_decompose_anomalies`.*

**Q7 : Quelle certification de la Security Blue Team valide les compétences avancées en Threat Hunting, analyse de logs et Incident Response L2/L3 ?**
- A) BTL2 (Blue Team Level 2)
- B) CEH
- C) CompTIA A+
- D) ITIL v4

*Réponse : A — BTL2 (Blue Team Level 2) est la certification pratique de référence pour le Threat Hunting et la défense avancée.*

**Q8 : Quel événement de processus Windows (MITRE T1047) doit attirer l'attention d'un Threat Hunter s'il est exécuté par le processus parent `wmiprvse.exe` ?**
- A) `explorer.exe`
- B) L'exécution de shells de commande distants comme `cmd.exe` ou `powershell.exe`
- C) `notepad.exe`
- D) `calc.exe`

*Réponse : B — `wmiprvse.exe` exécutant des shells de commande indique fréquemment un mouvement latéral malveillant via WMI.*

---

## 📚 Ressources & Références

- **MITRE ATT&CK Framework for Enterprise** : https://attack.mitre.org/
- **Microsoft Kusto Query Language (KQL) Overview** : https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query/
- **SANS Institute — Threat Hunting Maturity Model (HMM)** : https://www.sans.org/white-papers/37172/
- **Security Blue Team — BTL2 Certification** : https://securityblue.team/

---

*Semestre 6 — Cybersécurité Expert & Red Team Avancé PARADIS IT Masterclass*
