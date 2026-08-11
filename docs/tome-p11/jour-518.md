# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 518 (6h) : Gestion des Vulnérabilités & Patch Management : Scoring CVSS v4.0, Score d'Exploitabilité EPSS & Automatisation des Correctifs

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre le cycle de vie de la gestion des vulnérabilités (Découverte, Évaluation, Priorisation, Remédiation, Vérification)
> - Appliquer les métriques du standard **CVSS v4.0** (Common Vulnerability Scoring System)
> - Utiliser l'indicateur **EPSS (Exploit Prediction Scoring System)** pour prioriser les correctifs réellement exploités par les pirates
> - Orchestrer le déploiement automatisé des patchs de sécurité (Patch Management) sur flottes de serveurs et conteneurs
>
> **Compétences visées :** `SEC-04` (A), `SEC-06` (A) — Vulnerability Management & Risk Prioritization

---

## Module 1 — Du CVSS v4.0 à l'EPSS : La Révolution de la Priorisation (2h)

### 📖 Intuition & Narration

Chaque année, plus de 25 000 nouvelles vulnérabilités (CVE) sont découvertes et publiées dans la base NVD (National Vulnerability Database). Si une équipe de sécurité essaie de corriger immédiatement toutes les vulnérabilités de sévérité "High" ou "Critical" selon la seule note CVSS, elle est submergée et échoue.

La réalité du terrain : **moins de 5% de l'ensemble des CVE publiées sont réellement exploitées par des pirates dans la nature (in the wild)**.

Le score **CVSS v4.0** mesure la *gravité théorique* d'une faille, tandis que le score **EPSS (Exploit Prediction Scoring System)** calcule la *probabilité statistique qu'une faille soit exploitée dans les 30 prochains jours*.

Combiner CVSS v4.0 et EPSS permet aux équipes MLOps/DevSecOps de concentrer leurs efforts sur les **failles critiques et réellement dangereuses**.

### 🔍 Anatomie Technique — CVSS v4.0 vs EPSS

```
PRIORISATION INTELLIGENTE DES CORRECTIFS (CVSS v4.0 + EPSS)

  ┌────────────────────────────────────────────────────────────────────────┐
  │ SCORE CVSS v4.0 (Gravité Théorique : 0.0 à 10.0)                      │
  │ Mesure : Attack Vector, Attack Complexity, Privileges, Impact (C/I/A)  │
  └──────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ┼ ──► MATRICE DE PRIORISATION
                                     │
  ┌──────────────────────────────────┴─────────────────────────────────────┐
  │ SCORE EPSS (Probabilité d'Exploitation : 0.0% à 100%)                  │
  │ Basé sur la Threat Intelligence, présence d'exploits publics (POC/Metasploit)│
  └────────────────────────────────────────────────────────────────────────┘

DECISION :
  • CVSS >= 8.0 AND EPSS >= 10% ──► PRIORITÉ 1 (Patch sous 24h / Urgence absolue)
  • CVSS >= 8.0 AND EPSS <  2%  ──► PRIORITÉ 3 (Patch lors de la maintenance mensuelle)
```

---

## Module 2 — Atelier Pratique : Priorisateur de Vulnérabilités CVSS + EPSS (2h)

### 🛠️ Code Python : Priorisateur de Patching Automatisé

```python
#!/usr/bin/env python3
"""
PARADIS — Risk-Based Vulnerability Prioritizer (CVSS v4.0 + EPSS Engine)
Priorise le déploiement des patchs de sécurité en combinant la sévérité CVSS et la probabilité d'exploitation EPSS.
"""

import json
import sys
from dataclasses import dataclass
from typing import List

@dataclass
class VulnerabilityItem:
    cve_id: str
    component: str
    cvss_v4_score: float
    epss_score: float         # Probabilité 0.0 à 1.0 (ex: 0.85 = 85%)
    has_public_exploit: bool

class VulnerabilityPrioritizer:
    def __init__(self, vulnerabilities: List[VulnerabilityItem]):
        self.vulnerabilities = vulnerabilities

    def calculate_priority_score(self, item: VulnerabilityItem) -> float:
        """
        Formule de Priorité Réelle (Risk-Based Score) :
        Score = (CVSS * 0.4) + (EPSS * 10 * 0.4) + (Exploit_Bonus * 2.0)
        """
        exploit_bonus = 2.0 if item.has_public_exploit else 0.0
        risk_score = (item.cvss_v4_score * 0.4) + (item.epss_score * 10 * 0.4) + exploit_bonus
        return round(risk_score, 2)

    def generate_remediation_plan(self) -> List[dict]:
        print("=== EVALUATION & PRIORISATION DES VULNÉRABILITÉS PARADIS IT ===")
        plan = []

        for item in self.vulnerabilities:
            score = self.calculate_priority_score(item)

            if score >= 8.0:
                action = "EMERGENCY_HOTFIX_24H"
            elif score >= 5.0:
                action = "SCHEDULED_PATCH_7D"
            else:
                action = "ROUTINE_PATCH_30D"

            plan.append({
                "cve_id": item.cve_id,
                "component": item.component,
                "cvss_v4": item.cvss_v4_score,
                "epss_pct": f"{item.epss_score * 100:.1f}%",
                "has_exploit": item.has_public_exploit,
                "risk_priority_score": score,
                "recommended_action": action
            })

        # Tri par score de risque décroissant
        plan.sort(key=lambda x: x["risk_priority_score"], reverse=True)
        return plan

if __name__ == "__main__":
    vulnerabilities = [
        VulnerabilityItem("CVE-2024-3094", "liblzma (xz)", 10.0, 0.95, True),   # Backdoor XZ : urgence absolue
        VulnerabilityItem("CVE-2023-4863", "libwebp", 8.8, 0.78, True),       # Heap buffer overflow
        VulnerabilityItem("CVE-2024-1234", "internal-lib", 9.1, 0.001, False),  # CVSS élevé mais EPSS très faible (pas d'exploit)
        VulnerabilityItem("CVE-2024-9999", "web-server", 5.3, 0.45, True)     # CVSS moyen mais fréquemment exploité
    ]

    prioritizer = VulnerabilityPrioritizer(vulnerabilities)
    plan = prioritizer.generate_remediation_plan()

    print("\n" + "═"*75)
    print("  PLAN DE REMÉDIATION PRIORISÉ DES VULNÉRABILITÉS")
    print("═"*75)
    for p in plan:
        print(f"  📌 [{p['cve_id']}] {p['component']:<20s} │ Risk Score: {p['risk_priority_score']:>5.2f} │ EPSS: {p['epss_pct']:>6s} │ Action: {p['recommended_action']}")
    print("═"*75)
```

---

## Module 3 — Automation du Patch Management & Scanner Scans (1h30)

### 🔍 Scanners Enterprise & Patching Automatisé

Les outils leaders du marché (**Tenable.io / Nessus**, **Rapid7 InsightVM**, **Qualys**) s'intègrent aux pipelines de Patch Management (Ansible, WSUS, AWS Patch Manager).

Le patching moderne suit le principe de l'**Infrastructure Immuable** :
Dans un environnement conteneurisé ou cloud, on ne "patche" pas un serveur en production. On reconstruit l'image de base (Docker Image / AMI) avec les derniers patchs via le pipeline CI/CD, puis on redéploie les conteneurs/instances de manière transparente (Rolling Update).

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CVSS** | Common Vulnerability Scoring System — Système de notation standard des vulnérabilités |
| **EPSS** | Exploit Prediction Scoring System — Score prédictif d'exploitation d'une faille |
| **NVD** | National Vulnerability Database — Base de données nationale des vulnérabilités (NIST) |
| **CVE** | Common Vulnerabilities and Exposures — Dictionnaire standard d'identifiants de vulnérabilités |

---

## Exercices Pratiques

### Exercice 1 — Comparaison de Deux CVEs

Deux vulnérabilités sont détectées sur vos serveurs :
- **CVE-A** : CVSS = 9.8 / EPSS = 0.01% (Pas d'exploit public connu).
- **CVE-B** : CVSS = 7.5 / EPSS = 88.5% (Kit d'exploitation actif dans Metasploit).

Quelle vulnérabilité devez-vous corriger en priorité absolue ? Justifiez.

**Corrigé guidé :**
Vous devez corriger **CVE-B en priorité absolue**. Bien que son score CVSS théorique (7.5) soit inférieur à celui de CVE-A (9.8), CVE-B possède un score EPSS de 88.5% et un exploit public actif. Les pirates attaquent massivement CVE-B aujourd'hui, alors que CVE-A a une probabilité quasi nulle d'être exploitée immédiatement.

---

## Banque QCM — 5 Questions

**Q1.** Que mesure le score **CVSS v4.0** d'une vulnérabilité ?

- A) Le prix du serveur informatique.
- B) La gravité technique théorique d'une vulnérabilité basée sur ses caractéristiques intrinsèques. ✅
- C) La couleur du logo du logiciel.
- D) La vitesse de connexion Wi-Fi.

**Q2.** Quelle est l'utilité du score **EPSS (Exploit Prediction Scoring System)** par rapport au CVSS ?

- A) EPSS remplace la carte mémoire.
- B) EPSS calcule la probabilité statistique (0 à 100%) qu'une vulnérabilité soit réellement exploitée par des pirates dans les 30 prochains jours. ✅
- C) EPSS calcule le salaire de l'administrateur.
- D) EPSS efface les disques durs.

**Q3.** Environ quel pourcentage de l'ensemble des vulnérabilités (CVE) publiées chaque année est réellement exploité dans la nature par des attaquants ?

- A) 100%.
- B) Moins de 5%. ✅
- C) 50%.
- D) 90%.

**Q4.** Dans une architecture cloud et conteneurisée moderne (Infrastructure Immuable), comment applique-t-on un patch de sécurité sur une application ?

- A) En se connectant manuellement en SSH sur chaque serveur pour taper des commandes.
- B) En reconstruisant l'image de conteneur de base patchée via la CI/CD et en effectuant un redéploiement progressif (Rolling Update). ✅
- C) En éteignant tous les serveurs pendant une semaine.
- D) En envoyant une lettre au support.

**Q5.** Quel organisme gouvernemental américain gère la base de données **NVD (National Vulnerability Database)** ?

- A) La NASA.
- B) Le NIST (National Institute of Standards and Technology). ✅
- C) La CIA.
- D) Le FBI.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
