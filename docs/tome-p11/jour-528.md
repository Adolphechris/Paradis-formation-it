# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 528 (6h) : Red Team vs Blue Team & Exercices Purple Team : Simulation MITRE ATT&CK & Tests Atomiques (Atomic Red Team)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre la complémentarité des rôles : **Red Team** (Attaque/Offensif), **Blue Team** (Défense/SOC) et **Purple Team** (Collaboration)
> - Simuler des techniques d'attaques réelles basées sur la matrice **MITRE ATT&CK** (Adversary Emulation)
> - Exécuter des tests atomiques de sécurité avec l'outil **Atomic Red Team** pour valider l'efficacité des règles SIEM/EDR
> - Mesurer la couverture de détection (Detection Coverage) et combler les angles morts (Blind Spots)
>
> **Compétences visées :** `SEC-04` (A), `SEC-05` (A) — Purple Teaming & Adversarial Emulation

---

## Module 1 — Du Choc Red vs Blue à la Synergie Purple Team (2h)

### 📖 Intuition & Narration

Dans beaucoup d'entreprises, l'exercice de Red Team annuel vire à la compétition malsaine : l'équipe Red Team attaque le réseau, trouve une faille, rédige un rapport de 150 pages 3 semaines plus tard, et l'équipe Blue Team (SOC) se sent piégée et discréditée.

Le **Purple Teaming** brise ce silo. L'équipe d'attaque (Red) et l'équipe de défense (Blue) travaillent côte à côte, en temps réel. La Red Team exécute une technique d'attaque spécifique (ex: technique T1059.001 - PowerShell Execution), et la Blue Team vérifie immédiatement si le SIEM ou l'EDR a capturé et alerté sur cette action. Si la détection a échoué, les deux équipes ajustent la règle de détection ensemble.

### 🔍 Anatomie Technique — La Boucle d'Amélioration Continuous Purple Team

```
LE CYCLE PURPLE TEAMING & ADVERSARY EMULATION

  ┌────────────────────────────────────────────────────────┐
  │ 1. SÉLECTION TECHNIQUE MITRE ATT&CK                    │
  │ Ex: T1003.001 (LSASS Memory Dump - Vol d'identifiants) │
  └────────────────────────┬───────────────────────────────┘
                           │
                           ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. EXECUTION ATOMIQUE RED TEAM                         │
  │ Exécution de la commande Atomic Red Team contrôlée     │
  └────────────────────────┬───────────────────────────────┘
                           │
                           ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. VERIFICATION DE DÉTECTION BLUE TEAM                 │
  │ Alerte EDR déclenchée ? Log SIEM présent ?             │
  └────────────────────────┬───────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            │ NO                          │ YES
            ▼                             ▼
   [ REGLAGE REGLE SIEM / EDR ]   [ TECHNIQUE VALIDE ✅ ]
   (Combler le Blind Spot)        Coverage MITRE +1
```

---

## Module 2 — Atelier Pratique : Automated Atomic Test Executor & Coverage Reporter (2h)

### 🛠️ Code Python : Atomic Red Team Test Runner & Detection Verifier

```python
#!/usr/bin/env python3
"""
PARADIS — Purple Team Atomic Red Team Test Runner & Detection Verifier
Simule l'exécution de tests atomiques MITRE ATT&CK et vérifie la couverture de détection du SOC.
"""

import json
import sys
from dataclasses import dataclass
from typing import List

@dataclass
class AtomicTest:
    technique_id: str   # ex: "T1059.001"
    technique_name: str
    tactic: str         # ex: "Execution", "Credential Access"
    atomic_command: str
    expected_log_event: str

class PurpleTeamOrchestrator:
    def __init__(self, tests: List[AtomicTest]):
        self.tests = tests
        self.detection_coverage = {}

    def run_purple_team_session(self) -> dict:
        print("=== DEBUT DE LA SESSION PURPLE TEAMING (ATOMIC TESTING) PARADIS IT ===")
        total_tests = len(self.tests)
        detected_count = 0

        # Simulation de la base de logs du SIEM après attaque
        captured_siem_logs = [
            "EventID:4688 ProcessName:powershell.exe Command:Invoke-Mimikatz",
            "EventID:10 ProcessName:lsass.exe Access:0x1010",
            "EventID:7045 ServiceName:MalwareService File:malware.exe"
        ]

        results = []

        for test in self.tests:
            print(f"\n[*] Execution Red Team : [{test.technique_id}] {test.technique_name} ({test.tactic})")
            print(f"    Commande exécutée : {test.atomic_command}")

            # Vérification Blue Team (Est-ce que le log est dans le SIEM ?)
            detected = any(test.expected_log_event in log for log in captured_siem_logs)

            if detected:
                detected_count += 1
                status = "DETECTED ✅"
                print(f"    Blue Team Verdict : {status} (Log trouvé dans SIEM)")
            else:
                status = "BLIND SPOT 🚨"
                print(f"    Blue Team Verdict : {status} (Aucune alerte SIEM !)")

            results.append({
                "technique_id": test.technique_id,
                "name": test.technique_name,
                "tactic": test.tactic,
                "status": status,
                "detected": detected
            })

        coverage_pct = (detected_count / total_tests * 100) if total_tests > 0 else 0.0

        return {
            "total_techniques_tested": total_tests,
            "techniques_detected": detected_count,
            "blind_spots_count": total_tests - detected_count,
            "detection_coverage_pct": round(coverage_pct, 1),
            "test_details": results
        }

if __name__ == "__main__":
    tests_suite = [
        AtomicTest(
            technique_id="T1059.001",
            technique_name="PowerShell Execution",
            tactic="Execution",
            atomic_command="powershell.exe -nop -w hidden -c Invoke-Mimikatz",
            expected_log_event="Invoke-Mimikatz"
        ),
        AtomicTest(
            technique_id="T1003.001",
            technique_name="LSASS Memory Dumping",
            tactic="Credential Access",
            atomic_command="rundll32.exe C:\\windows\\system32\\comsvcs.dll, MiniDump 672",
            expected_log_event="lsass.exe"
        ),
        AtomicTest(
            technique_id="T1053.005",
            technique_name="Scheduled Task Creation",
            tactic="Persistence",
            atomic_command="schtasks /create /tn MaliciousTask /tr calc.exe /sc daily",
            expected_log_event="schtasks /create"  # N'est pas dans le mock log -> Blind Spot
        )
    ]

    orchestrator = PurpleTeamOrchestrator(tests_suite)
    report = orchestrator.run_purple_team_session()

    print("\n" + "═"*75)
    print("  RAPPORT DE COUVERTURE DE DÉTECTION PURPLE TEAM")
    print("═"*75)
    print(f"  Techniques testées         : {report['total_techniques_tested']}")
    print(f"  Techniques détectées       : {report['techniques_detected']} ✅")
    print(f"  Angles morts (Blind Spots) : {report['blind_spots_count']} 🚨")
    print(f"  Score de Couverture SIEM   : {report['detection_coverage_pct']}%")
    print("═"*75)
```

---

## Module 3 — Matrice MITRE ATT&CK & Metricating Coverage (1h30)

### 🔍 Couverture de la Matrice MITRE ATT&CK

La matrice **MITRE ATT&CK** répertorie des centaines de techniques réparties en 14 tactiques (de l’accès initial à l'impact).

Le Purple Teaming permet de générer une carte de chaleur (**Heatmap ATT&CK Navigator**) indiquant :
- En vert : Les techniques détectées et bloquées par le SOC/EDR.
- En jaune : Les techniques enregistrées dans les logs mais sans alerte automatique.
- En rouge : Les angles morts complets (ni logs, ni alerte).

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Purple Team** | Exercice collaboratif réunissant les équipes Red Team (Offensif) et Blue Team (Défensif) |
| **MITRE ATT&CK** | Adversarial Tactics, Techniques, and Common Knowledge — Matrice standard des menaces |
| **LSASS** | Local Security Authority Subsystem Service — Processus Windows gérant les mots de passe en mémoire |
| **Blind Spot** | Angle mort dans la détection (technique d'attaque non capturée par les logs ou le SIEM) |

---

## Exercices Pratiques

### Exercice 1 — Identification d'un Angle Mort

Lors d'un exercice Purple Team, l'équipe Red Team exécute la technique **T1070.001 (Clear Windows Event Logs)** via la commande `wevtutil cl System`. Aucune alerte ne remonte dans le SIEM.
1. Quel est le terme qui qualifie cette situation ?
2. Quelle règle de détection la Blue Team doit-elle créer immédiatement ?

**Corrigé guidé :**
1. **Terme** : Il s'agit d'un **Angle Mort (Blind Spot)** dans la surveillance de la Blue Team.
2. **Règle de détection** : Créer une règle SIEM / Sysmon qui alerte immédiatement en sévérité CRITICAL dès qu'un processus `wevtutil.exe` est exécuté avec l'argument `cl` (Clear Log) ou que l'Event ID 1102 (Event log cleared) est généré.

---

## Banque QCM — 5 Questions

**Q1.** Quel est l'objectif principal d'un exercice de **Purple Teaming** ?

- A) Faire la course entre les développeurs.
- B) Faire collaborer directement la Red Team (Attaque) et la Blue Team (Défense) pour exécuter des attaques contrôlées et vérifier/améliorer immédiatement la couverture de détection du SOC. ✅
- C) Remplacer les ordinateurs par des téléphones.
- D) Imprimer des rapports couleur violette.

**Q2.** À quoi sert l'outil open-source **Atomic Red Team** ?

- A) À fabriquer des processeurs.
- B) À exécuter des tests de sécurité atomiques simples, contrôlés et reproductibles cartographiés directement sur les techniques de la matrice MITRE ATT&CK. ✅
- C) À envoyer des e-mails.
- D) À nettoyer la base de données SQL.

**Q3.** Que représente un **Blind Spot (Angle Mort)** dans un rapport de Purple Teaming ?

- A) Un pixel mort sur un écran.
- B) Une technique d'attaque exécutée par la Red Team qui n'a généré aucune alerte ni aucun log dans le SIEM de la Blue Team. ✅
- C) Un serveur éteint.
- D) Un mot de passe oublié.

**Q4.** Quelle est la technique d'attaque identifiée par le code MITRE ATT&CK **T1003.001** ?

- A) Envoi d'un e-mail de phishing.
- B) Dumpe de la mémoire du processus LSASS pour voler des mots de passe en mémoire. ✅
- C) Impression d'un fichier PDF.
- D) Changement de fond d'écran.

**Q5.** Dans l'outil ATT&CK Navigator, que représente une **Heatmap (Carte de Chaleur)** de sécurité ?

- A) La température du data center.
- B) Une représentation visuelle de la matrice MITRE ATT&CK colorant le niveau de couverture de détection du SOC (détecté, non détecté, partiellement vu). ✅
- C) La consommation électrique des serveurs.
- D) Le plan d'étage du bâtiment.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
