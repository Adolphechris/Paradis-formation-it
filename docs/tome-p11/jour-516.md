# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 516 (6h) : Security Operations Center (SOC) & Threat Intelligence : Automates SOAR, Matrice MITRE D3FEND & Optimisation MTTR/MTTD

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre l'architecture fonctionnelle d'un **Security Operations Center (SOC)** moderne (Tiers 1, 2 et 3)
> - Orchestrer la réponse aux incidents avec une plateforme **SOAR (Security Orchestration, Automation and Response)**
> - Appliquer le cadre de contre-mesures défensives **MITRE D3FEND** en complément de MITRE ATT&CK
> - Mesurer et optimiser les métriques clés de performance du SOC : **MTTD** (Mean Time To Detect) et **MTTR** (Mean Time To Respond)
>
> **Compétences visées :** `SEC-04` (A), `SEC-06` (A) — SOC Operations & SOAR Automation

---

## Module 1 — Architecture SOC Moderne & Métriques de Performance (2h)

### 📖 Intuition & Narration

Un Security Operations Center (SOC) est la tour de contrôle de la cybersécurité d'une entreprise. Il surveille en continu (24h/24, 7j/7) le système d'information pour détecter les menaces, analyser les alertes et neutraliser les attaques en cours.

Cependant, un SOC traditionnel fait face à un problème d'échelle dramatique : la **fatigue des alertes (Alert Fatigue)**. Un SIEM génère jusqu'à 50 000 alertes par jour. Traiter chaque alerte manuellement est impossible pour les analystes.

Le SOC moderne s'appuie sur le **SOAR (Security Orchestration, Automation and Response)** pour automatiser l'analyse de premier niveau (Tier 1) et exécuter des **Playbooks d'orchestration** sans intervention humaine.

### 🔍 Anatomie Technique — Niveaux d'Analystes & Métriques SOC

```
ORGANISATION D'UN SOC & PIPELINE SOAR AUTOMATISÉ

  [ SOURCE LOGS (SIEM / EDR / Cloud) ] ──► 50 000 Alertes/Jour
                     │
                     ▼
  ┌────────────────────────────────────────────────────────┐
  │ SOAR AUTOMATION ENGINE (Playbooks d'Enrichissement)     │
  │ - Filtrage des faux positifs (95% traités automatiquement)│
  │ - Isolation réseau du poste infecté via API EDR        │
  └────────────────────────┬───────────────────────────────┘
                           │ (500 Alertes Qualifiées/Jour)
                           ▼
  ┌────────────────────────────────────────────────────────┐
  │ ANALYSTES SOC                                          │
  │ • Tier 1 : Qualification & Triage rapide               │
  │ • Tier 2 : Investigation & Forensique Incident Response│
  │ • Tier 3 : Threat Hunting & Reverse Engineering Malware│
  └────────────────────────────────────────────────────────┘

MÉTRIQUES CLÉS SOC :
  • MTTD (Mean Time To Detect) : Temps moyen entre l'intrusion et la détection (Cible < 15 min).
  • MTTR (Mean Time To Respond): Temps moyen entre la détection et la neutralisation (Cible < 30 min).
```

---

## Module 2 — Atelier Pratique : Playbook d'Orchestration SOAR en Python (2h)

### 🛠️ Code Python : SOAR Incident Response Playbook

```python
#!/usr/bin/env python3
"""
PARADIS — SOAR Automated Incident Response Playbook Engine
Simule l'exécution d'un Playbook SOAR automatique suite à une alerte EDR / SIEM.
"""

import time
import json
import sys
from datetime import datetime

class SOARPlaybookEngine:
    def __init__(self, alert_id: str, ip_address: str, hostname: str):
        self.alert_id = alert_id
        self.ip_address = ip_address
        self.hostname = hostname
        self.execution_log = []

    def log_step(self, step_name: str, status: str, details: str):
        self.execution_log.append({
            "timestamp": datetime.now().isoformat(),
            "step": step_name,
            "status": status,
            "details": details
        })
        print(f"  [SOAR STEP] [{status}] {step_name} : {details}")

    def execute_ransomware_containment_playbook(self) -> bool:
        print(f"=== EXECUTION DU PLAYBOOK SOAR : CONFINEMENT AUTOMATIQUE RANSOMWARE ===")
        print(f"[*] Alerte déclenchée ID : {self.alert_id} sur {self.hostname} ({self.ip_address})")

        start_time = time.time()

        # Étape 1 : Enrichment Threat Intel (Check IP Reputation sur VirusTotal / AlienVault)
        self.log_step("Threat Intel Enrichment", "SUCCESS", f"IP {self.ip_address} identifiée comme C2 Server malveillant (Score 98/100)")

        # Étape 2 : Isolation réseau du poste de travail via API EDR
        self.log_step("EDR Network Isolation", "SUCCESS", f"Hôte {self.hostname} isolé du réseau local via CrowdStrike API")

        # Étape 3 : Révocation de la session Active Directory / IAM de l'utilisateur
        self.log_step("IAM Session Revocation", "SUCCESS", f"Session utilisateur sur {self.hostname} révoquée immédiatement")

        # Étape 4 : Capture d'un snapshot mémoire forensique
        self.log_step("Memory Snapshot Collection", "SUCCESS", f"Dump RAM initié sur {self.hostname} pour analyse Tier 2")

        # Étape 5 : Création automatique de ticket d'incident (Jira / ServiceNow)
        self.log_step("ITSM Ticket Creation", "SUCCESS", f"Ticket d'incident CRITICAL #INC-9942 créé et assigné au Tier 2 SOC")

        execution_time_sec = round(time.time() - start_time, 3)
        self.log_step("Playbook Completion", "FINISHED", f"Temps d'exécution total : {execution_time_sec}s (MTTR automatisé < 5s)")

        return True

if __name__ == "__main__":
    playbook = SOARPlaybookEngine("ALT-2025-0042", "198.51.100.45", "WORKSTATION-FINANCE-04")
    success = playbook.execute_ransomware_containment_playbook()
    if success:
        print("\n[✅ SOAR PLAYBOOK COMPLETED] Menace neutralisée automatiquement en moins de 5 secondes.")
```

---

## Module 3 — MITRE D3FEND & Matrice Défensive (1h30)

### 🔍 MITRE D3FEND vs MITRE ATT&CK

Alors que **MITRE ATT&CK** répertorie les tactiques et techniques des *attaquants* (ex: Pass-the-Hash, Phishing), la matrice **MITRE D3FEND** est le catalogue officiel des *contre-mesures défensives* logicielles et architecturales.

```
CATÉGORIES DE CONTRE-MESURES MITRE D3FEND

  1. Model (Modéliser)     : Cartographie des actifs et identités.
  2. Harden (Hardener)    : Restreindre les privilèges (RBAC, Seccomp).
  3. Detect (Détecter)    : Analyse de logs, détection d'anomalies (SIEM/EDR).
  4. Isolate (Isoler)      : Micro-segmentation, Sandboxing, Isolation réseau.
  5. Deceive (Lurer)      : Pot de miel (Honeypot), leurres réseau.
  6. Evict (Expulser)     : Terminaison de processus, révocation de sessions.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SOC** | Security Operations Center — Centre d'opérations de sécurité |
| **SOAR** | Security Orchestration, Automation and Response — Automation de réponse aux incidents |
| **MTTD** | Mean Time To Detect — Temps moyen de détection d'une menace |
| **MTTR** | Mean Time To Respond — Temps moyen de réaction/neutralisation d'une menace |
| **D3FEND** | Defensive Combination for Cyber-Defense — Graphe de contre-mesures défensives (MITRE) |

---

## Exercices Pratiques

### Exercice 1 — Calcul du MTTR et MTTD d'un SOC

Sur un mois, un SOC a traité 4 cyberattaques réelles :
- Attaque 1 : Détectée en 10 min, neutralisée en 20 min.
- Attaque 2 : Détectée en 30 min, neutralisée en 40 min.
- Attaque 3 : Détectée en 5 min, neutralisée en 15 min.
- Attaque 4 : Détectée en 15 min, neutralisée en 25 min.

1. Calculez le **MTTD (Mean Time To Detect)**.
2. Calculez le **MTTR (Mean Time To Respond)**.

**Corrigé guidé :**
1. **MTTD (Temps moyen de détection) :**
$$\text{MTTD} = \frac{10 + 30 + 5 + 15}{4} = \frac{60}{4} = \mathbf{15 \text{ minutes}}$$

2. **MTTR (Temps moyen de réponse) :**
$$\text{MTTR} = \frac{20 + 40 + 15 + 25}{4} = \frac{100}{4} = \mathbf{25 \text{ minutes}}$$

---

## Banque QCM — 5 Questions

**Q1.** Quel est le rôle principal d'une plateforme **SOAR (Security Orchestration, Automation and Response)** au sein d'un SOC ?

- A) Vendre des licences de systèmes d'exploitation.
- B) Automatiser l'enrichissement des alertes, le filtrage des faux positifs et l'exécution de scénarios de réponse (Playbooks) sans intervention humaine directe. ✅
- C) Imprimer des rapports papier.
- D) Nettoyer les disques durs.

**Q2.** Que mesure la métrique **MTTR (Mean Time To Respond)** ?

- A) La vitesse d'impression de l'imprimante.
- B) Le temps moyen écoulé entre la détection d'un incident de sécurité et sa neutralisation complète par les équipes ou les automates. ✅
- C) Le nombre de lignes de code écrites par heure.
- D) Le prix des serveurs.

**Q3.** Dans la hiérarchie d'un SOC, quel est le rôle principal d'un analyste de **Tier 3** ?

- A) Répondre au téléphone standard.
- B) Réaliser le Threat Hunting avancé, l'ingénierie inverse (Reverse Engineering) de malwares complexes et l'analyse forensique approfondie. ✅
- C) Réinstaller Windows 10.
- D) Changer les cartouches d'encre.

**Q4.** Quelle est la différence entre **MITRE ATT&CK** et **MITRE D3FEND** ?

- A) ATT&CK modélise les techniques des attaquants, tandis que D3FEND répertorie les contre-mesures défensives et techniques de protection. ✅
- B) ATT&CK est payant, D3FEND est gratuit.
- C) ATT&CK ne fonctionne que sur Mac.
- D) Il n'y a aucune différence.

**Q5.** Que se passe-t-il lors de l'exécution d'un Playbook SOAR automatique de type "Ransomware Containment" ?

- A) Le serveur hôte infecté est immédiatement isolé du réseau via l'API EDR et les sessions de l'utilisateur sont révoquées en quelques secondes. ✅
- B) Un SMS de félicitations est envoyé au pirate.
- C) Le disque dur est jeté à la poubelle.
- D) L'application est publiée sur l'App Store.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
