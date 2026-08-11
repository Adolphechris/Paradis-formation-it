# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 547 (6h) : Certification Roadmap & Career Planning : CISSP, CISM, OSCP, CKS & Executive Branding

> [!NOTE]
> **Objectifs pédagogiques :**
> - Cartographier les **certifications en cybersécurité majeures** (CISSP, CISM, OSCP, CKS, CCSP, CEH) et sélectionner la trajectoire adaptée à ses objectifs de carrière
> - Structurer un **plan d'étude efficace** (domaine par domaine, banques de questions, labos pratiques) pour réussir les examens exigeants du marché
> - Construire un **Portfolio Cybersécurité** à fort impact (writeups CTF, audits open-source, outils de sécurité sur GitHub, rapports GRC)
> - Optimiser son **positionnement professionnel (Executive Branding)** pour viser des rôles de Senior Security Engineer, Lead SecOps ou RSSI/CISO
>
> **Compétences visées :** `POL-01` (A), `SEC-01` (A) — Security Certifications & Career Engineering

---

## Module 1 — Matrice des Certifications en Cybersécurité (2h)

### 📖 Intuition & Narration

Les certifications en cybersécurité ne remplacent pas l'expérience pratique, mais elles constituent des **filtres de recrutement incontournables** et des **accélérateurs de carrière majeurs**. Elles attestent auprès des recruteurs et des clients d'un niveau de compétences standardisé et reconnu à l'échelle internationale.

Il existe deux grandes familles de certifications :
1. **Certifications Stratégiques & Gouvernance (Managerial / GRC)** : Axées sur la politique, la gestion des risques, la conformité et la gouvernance d'entreprise.
2. **Certifications Techniques & Offensives/Défensives (Hands-on / Operations)** : Axées sur la capacité à exécuter des tests d'intrusion, sécuriser des clusters Kubernetes ou analyser des attaques en temps réel.

### 🔍 Matrice Comparative des Certifications Phares

```
MATRICE COMPARATIVE DES CERTIFICATIONS MAJEURES

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ CERTIFICATION │ ORGANISME │ ORIENTATION   │ EXAMEN       │ PRÉREQUIS       │
  ├───────────────┼───────────┼───────────────┼──────────────┼─────────────────┤
  │ CISSP         │ (ISC)²    │ Management &  │ 3h, 125-175Q │ 5 ans d'exp.    │
  │               │           │ Arch. Globale │ Adaptive CAT │ sur 2 domaines  │
  ├───────────────┼───────────┼───────────────┼──────────────┼─────────────────┤
  │ CISM          │ ISACA     │ Management de │ 4h, 150Q     │ 5 ans d'exp.    │
  │               │           │ la Sécurité   │ QCM          │ management sec. │
  ├───────────────┼───────────┼───────────────┼──────────────┼─────────────────┤
  │ OSCP          │ OffSec    │ Pentest & Red │ 24h Lab +    │ Solides bases   │
  │               │           │ Team offensif │ 24h Rapport  │ Linux/réseau/code│
  ├───────────────┼───────────┼───────────────┼──────────────┼─────────────────┤
  │ CKS           │ Linux Fdn │ Sécurité      │ 2h 100%      │ CKA (Certified  │
  │               │           │ Kubernetes    │ pratique CLI │ K8s Admin) validé│
  ├───────────────┼───────────┼───────────────┼──────────────┼─────────────────┤
  │ CCSP          │ (ISC)²    │ Sécurité      │ 4h, 150Q     │ 5 ans d'exp. IT │
  │               │           │ Cloud         │ QCM          │ dont 1 an Cloud │
  └─────────────────────────────────────────────────────────────────────────────┘

TRAJECTOIRES DE CARRIÈRE CONSEILLÉES PAR PROFIL :

  • Profil ARCHITECTE / SECDEV OPS : CKA → CKS → CCSP → CISSP
  • Profil PENTESTER / RED TEAM    : eJPT → PNPT → OSCP → OSEP / OSED
  • Profil SOC / BLUE TEAM / IR    : BTA → CySA+ → GIAC GCIH → GCDA
  • Profil GOVERNANCE / RSSI/CISO  : CRISC → CISM → CISSP → CISO Executive
```

---

## Module 2 — Python Career & Certification Roadmap Planner (2h)

### 🛠️ Script Python : Security Career & Certification Planner

```python
#!/usr/bin/env python3
"""
PARADIS — Security Career & Certification Roadmap Planner
Analyse le profil d'un ingénieur et génère un plan de certification personnalisé.
"""
from dataclasses import dataclass, field
from typing import List

@dataclass
class Certification:
    name: str
    issuer: str
    focus: str           # MANAGEMENT | TECHNICAL_OFFENSIVE | TECHNICAL_DEFENSIVE | CLOUD_K8S
    difficulty: str      # INTERMÉDIAIRE | AVANCÉ | EXPERT
    prep_hours: int
    exam_type: str       # QCM | LAB_PRATIQUE

class CareerPlanner:
    ALL_CERTS = [
        Certification("CKA", "Linux Foundation", "CLOUD_K8S", "INTERMÉDIAIRE", 120, "LAB_PRATIQUE"),
        Certification("CKS", "Linux Foundation", "CLOUD_K8S", "AVANCÉ", 150, "LAB_PRATIQUE"),
        Certification("OSCP", "OffSec", "TECHNICAL_OFFENSIVE", "EXPERT", 300, "LAB_PRATIQUE"),
        Certification("CISSP", "(ISC)²", "MANAGEMENT", "EXPERT", 250, "QCM"),
        Certification("CISM", "ISACA", "MANAGEMENT", "AVANCÉ", 180, "QCM"),
        Certification("CCSP", "(ISC)²", "CLOUD_K8S", "AVANCÉ", 200, "QCM"),
        Certification("CySA+", "CompTIA", "TECHNICAL_DEFENSIVE", "INTERMÉDIAIRE", 100, "QCM"),
    ]

    def __init__(self, name: str, current_role: str, target_role: str, years_exp: int):
        self.name = name
        self.current_role = current_role
        self.target_role = target_role
        self.years_exp = years_exp

    def generate_roadmap(self) -> List[Certification]:
        roadmap = []
        target = self.target_role.upper()

        if "DEVSECOPS" in target or "CLOUD" in target:
            roadmap = [c for c in self.ALL_CERTS if c.name in ["CKA", "CKS", "CCSP", "CISSP"]]
        elif "PENTEST" in target or "RED TEAM" in target:
            roadmap = [c for c in self.ALL_CERTS if c.name in ["OSCP", "CISSP"]]
        elif "RSSI" in target or "CISO" in target or "MANAGER" in target:
            roadmap = [c for c in self.ALL_CERTS if c.name in ["CISM", "CISSP", "CCSP"]]
        else:
            # Profil Défensif / SOC par défaut
            roadmap = [c for c in self.ALL_CERTS if c.name in ["CySA+", "CCSP", "CISSP"]]

        return roadmap

    def print_plan(self):
        roadmap = self.generate_roadmap()
        total_hours = sum(c.prep_hours for c in roadmap)

        print("=" * 65)
        print(f"  PLAN DE CERTIFICATION PERSONNALISÉ — PARADIS CAREER")
        print(f"  Ingénieur     : {self.name}")
        print(f"  Rôle Actuel   : {self.current_role} ({self.years_exp} ans d'expérience)")
        print(f"  Cible Carrière: {self.target_role}")
        print("=" * 65)
        print()

        for i, cert in enumerate(roadmap, 1):
            print(f"  📌 Étape {i} : {cert.name} ({cert.issuer})")
            print(f"     Domaine     : {cert.focus}")
            print(f"     Niveau      : {cert.difficulty}")
            print(f"     Type Examen : {cert.exam_type}")
            print(f"     Temps Prép. : ~{cert.prep_hours} heures d'étude")
            print()

        print("─" * 65)
        print(f"  TEMPS TOTAL D'ÉTUDE ESTIMÉ : ~{total_hours} heures (~{total_hours//10} semaines à 10h/semaine)")
        print("=" * 65)

if __name__ == "__main__":
    planner = CareerPlanner(
        name="Alexandre Dubois",
        current_role="DevOps Engineer",
        target_role="Lead DevSecOps Architect / RSSI Technique",
        years_exp=4
    )
    planner.print_plan()
```

---

## Module 3 — Portfolio Cybersécurité & Executive Branding (1h30)

### 🔍 Construire un Portfolio Techniquement Crédible

Un CV atteste de ce que vous prétendez savoir faire ; un **Portfolio GitHub** démontre ce que vous avez **réellement accompli**.

Structure recommandée d'un d'un portfolio cybersécurité sur GitHub :
1. **Projets Open-Source & Scripts** : Outils de scan, scripts d'automatisation (ex: `DataSensitivityEngine`, `LotLDetectionEngine` développés dans cette formation).
2. **Writeups CTF / Vulnérabilités** : Analyse détaillée de challenges (TryHackMe, HackTheBox, Root-Me) rédigés au format professionnel.
3. **Rapports d'Architecture & GRC** : Modèles de Threat Modeling (STRIDE), analyses de risque (EBIOS RM), guides de hardening.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CISSP** | Certified Information Systems Security Professional — Certification phare (ISC)² en management et architecture |
| **CISM** | Certified Information Security Manager — Certification ISACA orientée gouvernance et management |
| **OSCP** | Offensive Security Certified Professional — Certification pratique 24h de pentest par OffSec |
| **CKS** | Certified Kubernetes Security Specialist — Certification 100% pratique Linux Foundation sur K8s |
| **CAT** | Computer Adaptive Testing — Format d'examen s'adaptant au niveau du candidat au fil des réponses (CISSP) |

---

## Exercices Pratiques

### Exercice 1 — Élaboration d'un Plan de Révision CISSP

Vous préparez l'examen **CISSP** qui couvre 8 domaines. Vous disposez de 16 semaines d'étude à raison de 12 heures par semaine (total : 192 heures).

Répartissez le volume horaire entre les 8 domaines et indiquez le matériel d'étude recommandé.

**Corrigé guidé :**
- Volume total : 192 heures (8 domaines).
- **Domaines à fort coefficient (15%)** :
  - D1 (Security & Risk Management) : 30h
  - D3 (Security Architecture & Engineering) : 30h
  - D8 (Software Development Security) : 26h
- **Domaines intermédiaires (12-13%)** :
  - D4 (Communication & Network Security) : 24h
  - D5 (Identity & Access Management) : 24h
  - D7 (Security Operations) : 24h
- **Domaines de synthèse (10%)** :
  - D2 (Asset Security) : 17h
  - D6 (Security Assessment & Testing) : 17h
- **Matériel d'étude conseillé** : Official Study Guide (OSG 9th Ed), Boson Practice Exams, Destination CISSP.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la particularité principale de l'examen de certification **OSCP (OffSec)** ?

- A) C'est un QCM de 200 questions en 4 heures.
- B) C'est un examen 100% pratique de 24 heures en laboratoire virtuel où le candidat doit compromettre plusieurs machines et rédiger un rapport d'audit professionnel dans les 24 heures suivantes. ✅
- C) Il nécessite un entretien individuel devant un jury d'experts.
- D) C'est un examen à livre ouvert basé sur la norme ISO 27001.

**Q2.** Quel est le prérequis **obligatoire** avant de pouvoir passer la certification **CKS (Certified Kubernetes Security Specialist)** ?

- A) Avoir la certification CISSP.
- B) Être titulaire de la certification **CKA (Certified Kubernetes Administrator)** valide. ✅
- C) Justifier de 5 ans d'expérience sur AWS.
- D) Avoir la certification Docker Associate.

**Q3.** Quel organisme émet la certification **CISSP** ?

- A) ISACA
- B) SANS / GIAC
- C) (ISC)² ✅
- D) CompTIA

**Q4.** Dans le format d'examen **CAT (Computer Adaptive Testing)** utilisé pour le CISSP en anglais, que fait l'algorithme d'examen ?

- A) Il choisit les questions de manière totalement aléatoire.
- B) Il ajuste la difficulté des questions suivantes en fonction des réponses précédentes du candidat pour déterminer plus rapidement s'il atteint le niveau de compétence requis. ✅
- C) Il pose toujours les 175 questions indépendamment des réponses.
- D) Il permet de revenir sur toutes les questions précédentes à la fin.

**Q5.** Quelle certification est la plus adaptée pour un professionnel visant un poste de **RSSI / CISO** axé sur la gouvernance et la gestion des équipes de sécurité ?

- A) CKS (Certified Kubernetes Security Specialist)
- B) CISM (Certified Information Security Manager) ✅
- C) OSCP (Offensive Security Certified Professional)
- D) CEH (Certified Ethical Hacker)

---

*(Le composant d me d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
