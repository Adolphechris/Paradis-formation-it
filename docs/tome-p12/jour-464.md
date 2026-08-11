# TOME P12 — Gouvernance, Compliance & Architecture Finale — Jour 464 (6h) : Security Operations Center (SOC) & Threat Intelligence (SOAR Automation, MITRE D3FEND, CTI & Métriques MTTR/MTTD)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Concevoir et orchestrer un **SOC (Security Operations Center)** moderne de Niveau 1, 2 et 3
> - Automatiser la réponse aux incidents avec des playbooks **SOAR (Security Orchestration, Automation, and Response)**
> - Appliquer le framework **MITRE D3FEND** pour la modélisation des contre-mesures défensives
> - Mesurer et optimiser les métriques clés de performance du SOC : **MTTD** (Mean Time to Detect) et **MTTR** (Mean Time to Respond)
>
> **Compétences visées :** `SEC-05` (A) — SOC Operations & CTI, `SEC-04` (A) — SOAR Automation

---

## Module 1 — Architecture SOC Moderne & Niveaux d'Analyse (2h)

### 📖 Intuition & Narration

Le SIEM accumule des milliards d'événements par jour. Sans une organisation humaine et technique claire, le SOC sombre dans la **fatigue des alertes (Alert Fatigue)** : des milliers de fausses alarmes noyant les quelques signaux d'attaque réels. Un SOC moderne structure ses analystes en niveaux (N1 Triage, N2 Forensique, N3 Threat Hunting) et automatise 80% des tâches répétitives via un **SOAR**.

### 🔍 Anatomie Technique — Niveaux d'Analyse SOC

```
ORGANISATION D'UN SOC MODERNE & NIVEAUX D'ANALYSE

  ┌─────────────────────────────────────────────────────────────┐
  │  NIVEAU 1 (Triage & Alert Validation)                      │
  │  ├── Qualification des alertes SIEM/EDR                      │
  │  └── Fermeture des faux positifs / Escalade vers N2          │
  ├─────────────────────────────────────────────────────────────┤
  │  NIVEAU 2 (Incident Response & Forensics)                   │
  │  ├── Analyse approfondie mémoire, disque, réseau (DFIR)      │
  │  └── Confinement d'urgence et application des Playbooks SOAR│
  ├─────────────────────────────────────────────────────────────┤
  │  NIVEAU 3 (Threat Hunting & CTI)                             │
  │  ├── Recherche proactive d'infiltrations non détectées       │
  │  └── Reverse engineering de malwares, création de règles    │
  └─────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Automation SOAR & Playbook de Confinement (2h)

### 🛠️ Atelier Pratique — Playbook SOAR de Confinement d'Urgence

```python
#!/usr/bin/env python3
"""
PARADIS — Playbook SOAR Automatisé de Confinement d'Host Compromis
Intégration EDR + Firewall + Identity Provider (Reset Session + Isolation VLAN)
"""

import requests
import json

class SOARContainmentPlaybook:
    def __init__(self, target_ip: str, target_hostname: str, username: str):
        self.ip = target_ip
        self.hostname = target_hostname
        self.username = username
        self.log = []

    def execute_containment(self) -> dict:
        print(f"[*] [SOAR PLAYBOOK TRIGGERED] Host: {self.hostname} ({self.ip})")

        # 1. Isolation EDR (Network Containment)
        self.log.append("EDR: Host network isolation enforced via CrowdStrike/SentinelOne API")

        # 2. Révocation des sessions Active Directory / Entra ID
        self.log.append(f"IAM: User session revoked for {self.username}, MFA reset triggered")

        # 3. Blocage IP sur le Pare-feu Périmétrique (NGFW)
        self.log.append(f"NGFW: IP {self.ip} added to Quarantine Object Group")

        # 4. Notification ticket Incident (Jira / ServiceNow)
        self.log.append("TICKET: Incident INC-2024-AUTO-99 created with P1-CRITICAL priority")

        return {
            "status": "CONTAINED",
            "execution_time_seconds": 1.45,  # Réponse automatisée en <2 sec !
            "steps_completed": self.log
        }

playbook = SOARContainmentPlaybook("192.168.10.42", "BANKWKS-042", "jsmith")
result = playbook.execute_containment()
print(json.dumps(result, indent=2))
```

---

## Module 3 — Framework MITRE D3FEND & Métriques SOC (MTTD/MTTR) (1h30)

### 🔍 Anatomie Technique — MITRE ATT&CK vs MITRE D3FEND

```
MITRE ATT&CK (Offensif) vs MITRE D3FEND (Défensif)

  ATT&CK (Technique Attaquant) ───▶ D3FEND (Contre-mesure Défensive)
  Ex: T1055 Process Injection   ───▶ Model: Process Execution Analysis
  Ex: T1071 C2 HTTPS            ───▶ Model: Network Traffic Filtering
  Ex: T1003 Credential Dumping  ───▶ Model: LSA Process Access Restriction
```

#### Métriques SOC Essentielles

$$\text{MTTD (Mean Time to Detect)} = \frac{\sum (\text{Heure Détection} - \text{Heure Intrusion})}{\text{Nombre d'Incidents}}$$

$$\text{MTTR (Mean Time to Respond)} = \frac{\sum (\text{Heure Confinement} - \text{Heure Détection})}{\text{Nombre d'Incidents}}$$

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SOAR** | Security Orchestration, Automation, and Response — Plateforme d'automatisation des réponses aux incidents |
| **MTTD** | Mean Time to Detect — Temps moyen écoulé entre le début d'une intrusion et sa détection par le SOC |
| **MTTR** | Mean Time to Respond — Temps moyen écoulé entre la détection d'une alerte et son confinement effectif |
| **D3FEND** | Matrice de référence MITRE des techniques et contre-mesures de défense cyber |

---

## Exercices Pratiques

### Exercice 1 — Calcul de MTTR et MTTD

Sur un trimestre, le SOC enregistre 3 incidents majeurs :
- Incident 1 : Intrusion à 02:00, Détection à 02:15, Confinement à 02:25.
- Incident 2 : Intrusion à 10:00, Détection à 10:30, Confinement à 10:45.
- Incident 3 : Intrusion à 18:00, Détection à 18:45, Confinement à 19:15.

Calculer le MTTD et le MTTR moyens du SOC.

**Corrigé guidé :**
- Délais de détection : 15 min + 30 min + 45 min = 90 min. **MTTD = 90 / 3 = 30 minutes.**
- Délais de réponse : 10 min + 15 min + 30 min = 55 min. **MTTR = 55 / 3 = 18.33 minutes.**

---

## Banque QCM — 5 Questions

**Q1.** Quel est le rôle principal d'un outil **SOAR** dans un SOC ?

- A) Générer les factures des clients
- B) Orchestrer et automatiser la réponse aux alertes d'incident via des playbooks pré-programmés ✅
- C) Remplacer les disques durs défectueux
- D) Décompiler des binaires C++

**Q2.** La matrice **MITRE D3FEND** se distingue de **MITRE ATT&CK** car :

- A) D3FEND est payante, ATT&CK est gratuite
- B) ATT&CK décrit les techniques d'attaque offensives ; D3FEND décrit les contre-mesures défensives correspondantes ✅
- C) D3FEND ne concerne que les téléphones portables
- D) ATT&CK est réservée au gouvernement américain

**Q3.** La métrique **MTTD** (Mean Time to Detect) mesure :

- A) Le coût financier d'un serveur
- B) Le temps moyen nécessaire au SOC pour détecter une intrusion après son déclenchement ✅
- C) La vitesse de connexion de la fibre optique
- D) Le temps de pause de l'analyste N1

**Q4.** Le phénomène de **Fatigue des Alertes** (Alert Fatigue) dans un SOC survient lorsque :

- A) Les ordinateurs du SOC surchauffent
- B) Le volume massif de fausses alertes noie les analystes, risquant de faire manquer des attaques réelles ✅
- C) Les analystes travaillent sans éclairage
- D) Les serveurs sont éteints le week-end

**Q5.** Dans un SOC, un analyste de **Niveau 3 (N3)** est principalement chargé de :

- A) Répondre au téléphone du support client
- B) Le Threat Hunting proactif, la recherche de vulnérabilités avancées et le reverse engineering de malwares ✅
- C) Changer les cartouches d'imprimante
- D) Saisir les factures dans le logiciel comptable

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
