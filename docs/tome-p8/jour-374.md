# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 374 (6h) : Purple Team Operations & Adversarial Simulation (TIBER-EU, Breach & Attack Simulation — BAS, Detection Gap Analysis & MITRE ATT&CK Navigator)

> [!NOTE]
> **Objectif du jour :** Maîtriser les opérations **Purple Team** : fusionner les capacités Red Team (Attaque) et Blue Team (Défense) dans des exercices structurés pour mesurer objectivement les lacunes de détection, appliquer le cadre **TIBER-EU** (Threat Intelligence-Based Ethical Red-Teaming pour le secteur financier européen), opérer des plateformes de **Breach & Attack Simulation (BAS)** automatisées (Atomic Red Team / Caldera / VECTR), et quantifier le taux de couverture défensive via le **MITRE ATT&CK Navigator**.
>
> **Compétences visées :** `PURPLE-01` (A) — TIBER-EU Framework & Structured Purple Team Exercise Design | `PURPLE-02` (A) — BAS Automation (Atomic Red Team / CALDERA), Detection Gap Scoring & ATT&CK Navigator Mapping

---

## 1) Module — Framework TIBER-EU & Structure des Exercices Purple Team (2h)

### 📖 Narration/Intuition

Le **Purple Team** n'est pas simplement un Red Team avec des observateurs Blue Team. C'est une méthodologie collaborative où chaque TTP testé par l'équipe rouge génère **immédiatement** une boucle de rétroaction avec l'équipe bleue pour corriger les lacunes de détection.

```
┌─────────────────────────────────────────────────────────────────────┐
│                  PURPLE TEAM EXERCISE CYCLE                          │
│                                                                      │
│  1. CTI Phase ──────► Identifier les TTPs d'un acteur de menace     │
│  (Threat Intel)        prioritaire (ex: APT28 vs Finance Sector)    │
│                                                                      │
│  2. Red Execute ────► Simuler chaque TTP dans l'environnement de    │
│  (Atomic Test)         production (ex: Cobalt Strike / Atomic)      │
│                                                                      │
│  3. Blue Detect ────► Vérifier si le SIEM / EDR a généré une alerte │
│  (Detection Check)     (Detect? Alerted? Contained? Missed?)        │
│                                                                      │
│  4. Gap Analysis ───► Analyser le delta : Pourquoi la détection     │
│  (Remediate)           a-t-elle échoué ? Créer la règle SIGMA.      │
│                                                                      │
│  5. Navigator ──────► Mettre à jour le calque ATT&CK Navigator     │
│  (Score Update)        (Vert = Détecté, Jaune = Partiel, Rouge)    │
└─────────────────────────────────────────────────────────────────────┘
```

#### Score de Couverture Défensive par Phase ATT&CK

| Phase MITRE ATT&CK | Nb TTPs Testés | Détectés | Taux de Couverture |
|:---:|:---:|:---:|:---:|
| Initial Access | 12 | 8 | 67% |
| Execution | 18 | 12 | 67% |
| Persistence | 15 | 10 | 67% |
| Privilege Escalation | 14 | 9 | 64% |
| Defense Evasion | 22 | 7 | **32% ← Lacune Critique** |
| Credential Access | 16 | 11 | 69% |
| Lateral Movement | 10 | 5 | 50% |

---

## 2) Module — Outillage Purple Team Engine (`purple_team_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict

class PurpleTeamEngine:
    """
    Moteur d'orchestration des exercices Purple Team.
    Simule l'exécution des TTPs, capture les résultats de détection
    et génère le rapport de Gap Analysis ATT&CK Navigator.
    """

    def __init__(self, exercise_name: str, target_threat_actor: str):
        self.exercise = exercise_name
        self.actor = target_threat_actor
        self.ttp_results: List[dict] = []

    def run_ttp_test(self, mitre_id: str, ttp_name: str, technique_cmd: str, siem_alert_generated: bool, edr_alert_generated: bool) -> dict:
        """
        Exécute un test TTP unique et enregistre les résultats de détection.
        Calcule le niveau de visibilité défensive.
        """
        if siem_alert_generated and edr_alert_generated:
            detection_status = "FULLY_DETECTED"
            coverage_color = "green"
        elif siem_alert_generated or edr_alert_generated:
            detection_status = "PARTIALLY_DETECTED"
            coverage_color = "yellow"
        else:
            detection_status = "MISSED_DETECTION_GAP"
            coverage_color = "red"

        result = {
            "test_timestamp": datetime.now(timezone.utc).isoformat(),
            "mitre_id": mitre_id,
            "ttp_name": ttp_name,
            "technique_command": technique_cmd,
            "siem_alerted": siem_alert_generated,
            "edr_alerted": edr_alert_generated,
            "detection_status": detection_status,
            "navigator_color": coverage_color
        }
        self.ttp_results.append(result)

        status_emoji = "✅" if coverage_color == "green" else "🟡" if coverage_color == "yellow" else "❌"
        print(f"  {status_emoji} [{mitre_id}] {ttp_name} -> {detection_status}")
        return result

    def compute_detection_gap_report(self) -> dict:
        """Génère le rapport complet de Gap Analysis et les priorités de remédiation."""
        total = len(self.ttp_results)
        detected = sum(1 for r in self.ttp_results if r["detection_status"] == "FULLY_DETECTED")
        partial = sum(1 for r in self.ttp_results if r["detection_status"] == "PARTIALLY_DETECTED")
        missed = sum(1 for r in self.ttp_results if r["detection_status"] == "MISSED_DETECTION_GAP")

        gaps = [r for r in self.ttp_results if r["detection_status"] == "MISSED_DETECTION_GAP"]
        remediation_priorities = [{"priority": i+1, "mitre_id": r["mitre_id"], "ttp": r["ttp_name"]} for i, r in enumerate(gaps)]

        return {
            "exercise_name": self.exercise,
            "threat_actor": self.actor,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "ttps_tested": total,
            "fully_detected": detected,
            "partially_detected": partial,
            "missed_gap": missed,
            "overall_coverage_pct": round((detected / total * 100) if total else 0, 1),
            "remediation_priorities": remediation_priorities
        }

# Démonstration Purple Team Exercise
purple = PurpleTeamEngine("TIBER-EU-2026-Q3", "APT28 / Fancy Bear")

print("=== PURPLE TEAM EXERCISE: TIBER-EU APT28 SIMULATION ===")

# Simulation de tests TTP avec résultats de détection SIEM/EDR
purple.run_ttp_test("T1059.001", "PowerShell Encoded Execution",   "powershell.exe -Enc SQBF...", siem_alert_generated=True,  edr_alert_generated=True)
purple.run_ttp_test("T1003.006", "DCSync via Mimikatz lsadump::dcsync", "mimikatz.exe lsadump::dcsync /domain:paradis.internal", siem_alert_generated=True, edr_alert_generated=False)
purple.run_ttp_test("T1218.011", "LOLBin Proxy via Rundll32",     "rundll32.exe shell32.dll,OpenAs_RunDLL payload.dll", siem_alert_generated=False, edr_alert_generated=False)
purple.run_ttp_test("T1486",     "File Encryption via Ransomware", "vssadmin delete shadows /all /quiet", siem_alert_generated=False, edr_alert_generated=True)

print("\n=== PURPLE TEAM DETECTION GAP REPORT ===")
gap_report = purple.compute_detection_gap_report()
print(json.dumps(gap_report, indent=2, ensure_ascii=False))
```

---

## 3) Module — Fiche Atomic Red Team & ATT&CK Navigator (2h)

```bash
# ATOMIC RED TEAM — EXÉCUTION D'UN TEST DE TECHNIQUE MITRE ATT&CK
# Dépôt : github.com/redcanaryco/atomic-red-team

# Installer le module PowerShell Atomic
Install-Module -Name invoke-atomicredteam

# Exécuter le test Atomic pour T1003.001 (Credential Dumping via LSASS)
Invoke-AtomicTest T1003.001 -TestNumbers 1 -GetPrereqs
Invoke-AtomicTest T1003.001 -TestNumbers 1

# Valider si le SIEM a détecté l'activité (Event ID 10 LSASS Access)
# Puis nettoyer l'environnement de test
Invoke-AtomicTest T1003.001 -TestNumbers 1 -Cleanup
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Purple Team** | Exercice collaboratif combinant les équipes Red (attaque) et Blue (défense) pour mesurer et améliorer la couverture de détection |
| **TIBER-EU** | Threat Intelligence-Based Ethical Red-Teaming — Cadre réglementaire européen pour les tests de pénétration avancés du secteur financier |
| **BAS** | Breach and Attack Simulation — Outil automatisant l'exécution de TTPs MITRE ATT&CK sans implication humaine constante |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quelle est la différence fondamentale entre un **Pentest classique** et un exercice **Purple Team** ?
- A) Le Pentest vise à trouver des vulnérabilités et à les documenter, tandis que le Purple Team vise à tester ET améliorer en temps réel les capacités de détection et de réponse du SOC
- B) Le Purple Team est réservé aux startups
- C) Le Pentest est uniquement automatisé
- D) Il n'y a aucune différence

**Réponse : A**

**Q2 :** Dans le cadre **TIBER-EU**, pourquoi le cadre impose-t-il que le scénario d'attaque soit basé sur une **Threat Intelligence ciblée** sur la menace réelle de l'institution ?
- A) Pour s'assurer que l'exercice simule des techniques d'attaque réalistes et directement pertinentes pour le secteur (financier, bancaire, infrastructures critiques) plutôt que des scénarios génériques
- B) Pour réduire le coût du pentest
- C) Pour éviter de tester les systèmes de nuit
- D) Pour respecter le RGPD

**Réponse : A**

**Q3 :** Comment interpréter la couleur **rouge** sur un calque **MITRE ATT&CK Navigator** généré à l'issue d'un exercice Purple Team ?
- A) La technique ATT&CK testée (TTP) n'a pas été détectée par le SIEM ni par l'EDR — c'est une lacune de détection critique nécessitant la création d'une nouvelle règle de détection
- B) La technique a été détectée avec succès
- C) La technique est hors scope du test
- D) La couleur rouge signifie un problème réseau

**Réponse : A**

**Q4 :** Quel outil open-source du projet **Red Canary** permet d'exécuter des tests de techniques MITRE ATT&CK de manière atomique, reproductible et nettoyable sur des postes Windows/Linux/macOS ?
- A) **Atomic Red Team** (`Invoke-AtomicTest`)
- B) Metasploit Framework
- C) Nikto Web Scanner
- D) Nessus Vulnerability Scanner

**Réponse : A**

**Q5 :** Quelle métrique produite par un Purple Team est la plus directement actionnable pour le CISO ?
- A) Le **taux de couverture de détection global** par phase MITRE ATT&CK (ex: 32% de couverture sur la phase Defense Evasion), qui permet de prioriser les investissements en règles SIEM et tuning EDR
- B) Le nombre de ports ouverts sur le réseau
- C) La vitesse du serveur proxy
- D) Le nombre d'employés en arrêt maladie

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
