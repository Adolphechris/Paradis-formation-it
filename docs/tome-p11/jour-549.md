# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 549 (6h) : Veille Technologique & Innovation Sécurité : Threat Feeds, EPSS & Automated CVE Triage

> [!NOTE]
> **Objectifs pédagogiques :**
> - Structurer un **système de veille en cybersécurité (Threat Watch / CTI Triage)** automatisé et ciblé sur son stack technique
> - Maîtriser le score **EPSS (Exploit Prediction Scoring System)** et le catalogue **CISA KEV (Known Exploited Vulnerabilities)** pour prioriser le patching
> - Comprendre les évolutions de **CVSS v4.0** et la distinction entre sévérité théorique et exploitabilité réelle
> - Développer un **script de triage automatisé des CVE** qui croise les flux NVD, CISA KEV et EPSS
>
> **Compétences visées :** `SEC-01` (A), `SEC-09` (A) — Threat Intel Feeds, CVE Triage & Security Innovation

---

## Module 1 — Du Score CVSS à l'Exploitabilité Réelle (EPSS & CISA KEV) (2h)

### 📖 Intuition & Narration

Chaque année, plus de 25 000 nouvelles vulnérabilités (CVE) sont publiées. Tenter de patcher toutes les CVE avec un score CVSS >= 7.0 est **impossible** pour la plupart des organisations — cela représenterait des milliers de patchs par mois, paralysant les équipes IT.

La réalité du terrain : **moins de 5% de toutes les CVE publiées sont réellement exploitées dans la nature** par des attaquants.

La priorité moderne en gestion des vulnérabilités n'est plus "tout patcher", mais **patcher en priorité les vulnérabilités qui ont une probabilité d'exploitation réelle élevée**. Deux outils révolutionnent cette approche :
1. **CISA KEV (Known Exploited Vulnerabilities Catalog)** : La liste officielle des vulnérabilités dont l'exploitation active sur le terrain est confirmée par le gouvernement américain.
2. **EPSS (Exploit Prediction Scoring System)** : Un modèle prédictif (Machine Learning) maintenu par FIRST qui estime la probabilité (0 à 100%) qu'une CVE soit exploitée dans les 30 jours à venir.

### 🔍 Comparaison des Métriques de Vulnérabilité

```
COMPARISON : CVSS vs EPSS vs CISA KEV

  METRIQUE   │ CE QU'ELLE MESURE                       │ EXEMPLE DE VALEUR
  ───────────┼─────────────────────────────────────────┼───────────────────
  CVSS v3/v4 │ Sévérité Théorique (impact potentiel)    │ 9.8 / 10.0 (CRITICAL)
  EPSS       │ Probabilité d'exploitation sous 30 jours│ 87.4% (Très probable)
  CISA KEV   │ Exploitation confirmée dans la nature    │ OUI / NON

STRATÉGIE DE TRIAGE PARADIS (MATRICE DE PRIORISATION) :

  ┌────────────────────────────────────────────────────────────────────────┐
  │ RANG │ CONDITION                                 │ SLA DE PATCHING    │
  ├──────┼───────────────────────────────────────────┼────────────────────┤
  │ P0   │ Dans CISA KEV  OU  EPSS > 50%             │ < 24 heures        │
  │ P1   │ CVSS >= 9.0    ET  EPSS > 10%             │ < 7 jours          │
  │ P2   │ CVSS >= 7.0    ET  EPSS < 10%             │ < 30 jours         │
  │ P3   │ CVSS < 7.0     ET  Pas dans CISA KEV       │ Prochaine release  │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Triage Automatisé des CVE (2h)

### 🛠️ Script Python : Automated CVE Triage Engine (NVD + CISA KEV + EPSS)

```python
#!/usr/bin/env python3
"""
PARADIS — Automated CVE Triage Engine
Croise les données NVD (CVSS), CISA KEV (Exploitation active) et EPSS (Probabilité d'exploitation)
pour déterminer la priorité absolue de patching (P0, P1, P2, P3).
"""
import urllib.request
import json
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class CVEAnalysis:
    cve_id: str
    cvss_score: float
    epss_score: float         # 0.0 à 1.0 (ex: 0.85 = 85%)
    in_cisa_kev: bool
    description: str
    priority: str = "P3"
    sla_hours: int = 720      # SLA par défaut (30 jours)

class CVETriageEngine:
    def __init__(self):
        # Simulation d'une base CISA KEV (en prod : téléchargée depuis https://www.cisa.gov/known-exploited-vulnerabilities-catalog)
        self.cisa_kev_set = {
            "CVE-2021-44228",  # Log4Shell
            "CVE-2023-34362",  # MOVEit Transfer
            "CVE-2024-21887",  # Ivanti Connect Secure
            "CVE-2024-1709",   # ConnectWise ScreenConnect
        }

        # Simulation d'une base EPSS (en prod : API FIRST https://api.first.org/data/v1/epss)
        self.epss_database = {
            "CVE-2021-44228": 0.974,  # 97.4% probabilité
            "CVE-2023-34362": 0.952,  # 95.2% probabilité
            "CVE-2024-21887": 0.889,
            "CVE-2024-1709":  0.941,
            "CVE-2024-9999":  0.012,  # CVSS 9.8 théorique mais EPSS faible 1.2%
        }

    def evaluate_cve(self, cve_id: str, cvss_score: float, description: str) -> CVEAnalysis:
        epss = self.epss_database.get(cve_id, 0.05)  # 5% par défaut
        in_kev = cve_id in self.cisa_kev_set

        # Algorithme de priorisation PARADIS
        if in_kev or epss >= 0.50:
            priority = "P0 - URGENTISSIME"
            sla = 24
        elif cvss_score >= 9.0 and epss >= 0.10:
            priority = "P1 - HAUTE"
            sla = 168  # 7 jours
        elif cvss_score >= 7.0:
            priority = "P2 - MOYENNE"
            sla = 720  # 30 jours
        else:
            priority = "P3 - BASSE"
            sla = 2160 # 90 jours

        return CVEAnalysis(
            cve_id=cve_id,
            cvss_score=cvss_score,
            epss_score=epss,
            in_cisa_kev=in_kev,
            description=description,
            priority=priority,
            sla_hours=sla
        )

    def process_vulnerabilities(self, vulns: List[dict]):
        print("=" * 70)
        print("  PARADIS AUTOMATED CVE TRIAGE ENGINE (EPSS + CISA KEV INTEGRATED)")
        print("=" * 70)
        print()

        for v in vulns:
            analysis = self.evaluate_cve(v["cve"], v["cvss"], v["desc"])
            icon = "🚨" if "P0" in analysis.priority else ("🟠" if "P1" in analysis.priority else "🟡")
            print(f"  {icon} [{analysis.cve_id}] — {analysis.priority}")
            print(f"     Description : {analysis.description}")
            print(f"     CVSS Score  : {analysis.cvss_score}/10.0")
            print(f"     EPSS Score  : {analysis.epss_score * 100:.1f}% (probabilité d'exploitation 30j)")
            print(f"     CISA KEV    : {'OUI (Exploitation active confirmée)' if analysis.in_cisa_kev else 'Non'}")
            print(f"     SLA Patch   : < {analysis.sla_hours} heures")
            print()

if __name__ == "__main__":
    sample_vulns = [
        {"cve": "CVE-2021-44228", "cvss": 10.0, "desc": "Log4j2 Remote Code Execution (Log4Shell)"},
        {"cve": "CVE-2024-21887", "cvss": 9.1,  "desc": "Ivanti Connect Secure Command Injection"},
        {"cve": "CVE-2024-9999",  "cvss": 9.8,  "desc": "Théorie RCE dans bibliothèque inutilisée (pas d'exploit)"},
        {"cve": "CVE-2024-0012",  "cvss": 6.5,  "desc": "Information disclosure mineure dans composant web"},
    ]

    engine = CVETriageEngine()
    engine.process_vulnerabilities(sample_vulns)
```

---

## Module 3 — Organisation d'un Système de Veille en Sécurité (1h30)

### 🔍 Sources de Veille CTI Qualifiées

Un système de veille efficace repose sur des sources diversifiées et filtrées :

```
SOURCES DE VEILLE EN CYBERSÉCURITÉ

  RÉGLEMENTAIRE & OFFICIEL
  ├── CERT-FR (cert.ssi.gouv.fr) — Alertes et avis du gouvernement français
  ├── CISA (cisa.gov/uscert)     — KEV Catalog et avis d'urgence US
  └── ENISA (enisa.europa.eu)   — Informes de vulnérabilités UE

  COMMUNAUTAIRE & OSINT
  ├── OpenCTI / MISP Feeds       — Flux d'IOC partagés
  ├── Twitter / X Security List  — Threat researchers (#databreach, #0day)
  └── GitHub Security Advisories — Vulnérabilités dans l'écosystème open-source

  VENDORS & LOHS
  ├── Microsoft Security Response Center (MSRC) — Patch Tuesday (2ème mardi du mois)
  ├── Red Hat Security Advisories (RHSA)
  └── Cisco Talos Blog
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **EPSS** | Exploit Prediction Scoring System — Modèle estimant la probabilité d'exploitation d'une CVE dans les 30 jours |
| **KEV** | Known Exploited Vulnerabilities — Catalogue CISA des vulnérabilités exploitées de façon avérée sur le terrain |
| **CVSS** | Common Vulnerability Scoring System — Norme d'évaluation de la sévérité technique d'une vulnérabilité (0 à 10) |
| **NVD** | National Vulnerability Database — Base de données nationale américaine des vulnérabilités (NIST) |
| **Patch Tuesday** | Publication mensuelle des correctifs de sécurité Microsoft (chaque 2ème mardi du mois) |

---

## Exercices Pratiques

### Exercice 1 — Arbitrage de Triage de Vulnérabilités

Votre équipe de gestion des vulnérabilités découvre deux CVE lors d'un scan de production :
- **CVE-A** : CVSS 9.8 (Critical), EPSS = 0.8% (0.008), Absente de CISA KEV.
- **CVE-B** : CVSS 7.2 (High), EPSS = 64.2% (0.642), Présente dans CISA KEV.

Quelle vulnérabilité devez-vous patcher en **priorité absolue (P0)** et pourquoi ?

**Corrigé guidé :**
Vous devez patcher **CVE-B en priorité absolue (P0)**.
- **Justification** : Malgré son score CVSS de 7.2 (inférieur à 9.8), CVE-B est dans le catalogue **CISA KEV** (exploitation réelle confirmée sur le terrain) et présente un **EPSS de 64.2%** (très forte probabilité d'attaque imminente).
- CVE-A a un score CVSS théorique élevé de 9.8, mais son EPSS de 0.8% et son absence dans CISA KEV indiquent qu'aucun exploit fonctionnel n'est activement utilisé. Elle sera traitée en P2.

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce que l'**EPSS (Exploit Prediction Scoring System)** ?

- A) Un système de notation de la complexité d'un mot de passe.
- B) Un modèle statistique et prédictif qui estime la probabilité (0 à 100%) qu'une vulnérabilité CVE donnée soit exploitée dans les 30 jours à venir. ✅
- C) Un outil de détection d'antivirus.
- D) Un protocole de communication réseau.

**Q2.** Le catalogue **CISA KEV (Known Exploited Vulnerabilities)** liste :

- A) Toutes les vulnérabilités théoriques découvertes cette année.
- B) Les vulnérabilités pour lesquelles des preuves d'exploitation active sur le terrain ont été confirmées par les autorités. ✅
- C) Les mots de passe les plus fréquents.
- D) Les adresses IP des serveurs DNS racine.

**Q3.** Pourquoi la méthode de priorisation basée uniquement sur le score **CVSS** n'est-elle plus suffisante dans les organisations modernes ?

- A) Le score CVSS n'existe plus.
- B) Parce que moins de 5% de toutes les CVE sont réellement exploitées sur le terrain ; se baser uniquement sur le CVSS conduit à traiter des milliers d'alertes théoriques au détriment des vulnérabilités réellement exploitées. ✅
- C) Le score CVSS est payant.
- D) CVSS ne s'applique qu'à Windows.

**Q4.** Dans le cadre de la veille en sécurité, que désigne le **Patch Tuesday** ?

- A) Le mardi où toutes les entreprises doivent éteindre leurs serveurs.
- B) La publication mensuelle par Microsoft (chaque deuxième mardi du mois) de ses correctifs et bulletins de sécurité. ✅
- C) Un événement de sensibilisation au phishing.
- D) Une compétition de hacking éthique.

**Q5.** Quelle est la source officielle française d'alertes et d'avis de sécurité pour les systèmes d'information ?

- A) CISA
- B) NVD
- C) CERT-FR (ANSSI) ✅
- D) FIRST

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
