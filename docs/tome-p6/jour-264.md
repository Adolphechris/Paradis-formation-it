# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 264 (6h) : Purple Team Automation & Adversary Emulation (Atomic Red Team, MITRE Caldera, Vectoring & SOC Validation)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'**automatisation d'exercices Purple Team et l'émulation d'adversaires (Adversary Emulation)** : exécuter des scénarios d'attaque standardisés avec **Atomic Red Team** et **Caldera**, automatiser la validation des règles de détection SIEM/EDR, et mesurer avec précision le **taux de couverture de détection (Detection Coverage Gap)**.
>
> **Compétences visées :** `PURPLE-01` (A) — Adversary Emulation (Atomic Red Team & Caldera) | `SOC-02` (A) — Detection Validation & Gap Analysis

---

## 1) Module — Concepts Purple Team & Adversary Emulation (1h30)

### 📖 Narration/Intuition

La **Purple Team** associe de façon continue les équipes offensives (Red Team) et défensives (Blue Team/SOC). Plutôt que d'attendre un audit annuel, l'automatisation Purple Team rejoue quotidiennement des techniques d'attaques réelles (TTPs MITRE ATT&CK) sur les endpoints pour valider si les règles SIEM (Sigma/KQL) et les alertes EDR fonctionnent toujours correctement.

---

## 2) Module — Exécution d'Atomics avec Atomic Red Team (2h30)

### 🛠️ Atelier Pratique

**Exécution d'un test Atomic Red Team PowerShell (`atomic_execution.ps1`) :**

```powershell
# ═══════════════════════════════════════════════════════
# ÉTAPE 1 — Installation du module Invoke-AtomicRedTeam
# ═══════════════════════════════════════════════════════
Install-Module -Name Invoke-AtomicRedTeam -Scope CurrentUser -Force
IEX (New-Object Net.WebClient).DownloadString('https://raw.githubusercontent.com/redcanaryco/invoke-atomicredteam/master/install-atomicredteam.ps1')
Install-AtomicRedTeam -Confirm:$false

# ═══════════════════════════════════════════════════════
# ÉTAPE 2 — Inspection et exécution du test T1059.001 (PowerShell Execution)
# ═══════════════════════════════════════════════════════

# Obtenir les détails du test T1059.001
Invoke-AtomicTest T1059.001 -ShowDetails

# Vérifier les prérequis du test
Invoke-AtomicTest T1059.001 -GetPrereqs

# Exécuter le test Atomic sur le système local
Invoke-AtomicTest T1059.001 -TestNumbers 1

# Nettoyer les artefacts après l'exécution
Invoke-AtomicTest T1059.001 -TestNumbers 1 -Cleanup
```

---

## 3) Module — Orchestration avec MITRE Caldera (2h)

### 🛠️ Script Python d'automatisation d'opération Caldera via REST API (`caldera_auto_operation.py`)

```python
import requests
import json

CALDERA_URL = "http://localhost:8888"
API_KEY = "ADMIN123" # Clé API Caldera

headers = {"KEY": API_KEY, "Content-Type": "application/json"}

# 1) Définir une opération d'émulation d'adversaire (ex: Adversary "APT29")
operation_payload = {
    "name": "Automated Purple Team Campaign - APT29",
    "adversary": {"adversary_id": "APT29-id"},
    "planner": {"planner_id": "batch"},
    "source": {"source_id": "basic-source"},
    "state": "running"
}

response = requests.post(f"{CALDERA_URL}/api/v2/operations", json=operation_payload, headers=headers)
if response.status_code == 200:
    op_data = response.json()
    print(f"[+] Opération Caldera lancée avec succès ! Operation ID : {op_data.get('id')}")
else:
    print(f"[-] Erreur lors du lancement de l'opération : {response.text}")
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Atomic Red Team** | Bibliothèque open-source de petits tests d'attaque unitaires cartographiés sur MITRE ATT&CK |
| **Caldera** | Plateforme d'émulation d'adversaire automatisée développée par MITRE |
| **TTP** | Tactics, Techniques, and Procedures — Description du comportement d'un attaquant |
| **Purple Team** | Collaboration active Red Team + Blue Team pour optimiser la détection |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le principal objectif d'un exercice de **Purple Team** par rapport à un Pentest Red Team classique ?
- A) Valider et mesurer en continu l'efficacité des règles de détection Blue Team/SOC face à des TTPs offensives précises
- B) Former les développeurs au code C++
- C) Obtenir un certificat de conformité ISO
- D) Tester le débit réseau

**Réponse : A**

**Q2 :** Quelle organisation maintient la bibliothèque de tests unitaires d'attaque open-source **Atomic Red Team** ?
- A) Red Canary
- B) Microsoft
- C) Google
- D) NSA

**Réponse : A**

**Q3 :** Quel framework développé par le MITRE permet d'orchestrer des agents d'attaque autonomes pour émuler des adversaires réels ?
- A) CALDERA
- B) Volatility
- C) Ghidra
- D) Wireshark

**Réponse : A**

**Q4 :** Quelle commande du module PowerShell `Invoke-AtomicRedTeam` permet d'effacer les traces et artefacts laissés sur le système après un test ?
- A) `Invoke-AtomicTest TXXXX -Cleanup`
- B) `Remove-Item C:\`
- C) `Clear-History`
- D) `Uninstall-AtomicRedTeam`

**Réponse : A**

**Q5 :** Dans la matrice MITRE ATT&CK, que représente l'identifiant **T1059.001** ?
- A) Command and Scripting Interpreter: PowerShell
- B) Phishing
- C) SQL Injection
- D) DCSync

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
