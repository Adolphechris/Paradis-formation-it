# TOME P12 — Gouvernance, Compliance & Architecture Finale — Jour 468 (6h) : Résilience Opérationnelle & Gestion de Crise Cyber (PCA/PRA, BCP/DRP, Ransomware Crisis Management & War Room)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Concevoir et tester le **PCA (Plan de Continuité d'Activité / BCP)** et le **PRA (Plan de Reprise d'Activité / DRP)**
> - Définir les objectifs de résilience : **RTO** (Recovery Time Objective) et **RPO** (Recovery Point Objective)
> - Organiser une **Cellule de Crise Cyber (War Room)** et gérer la communication de crise (Com' interne, presse, régulateurs, clients)
> - Mener un exercice de crise cyber simulé (Crisis Simulation Exercise - Ransomware Outbreak)
>
> **Compétences visées :** `POL-01` (A) — Cyber Crisis Management, `POL-03` (A) — Business Continuity & Disaster Recovery

---

## Module 1 — BIA, PCA/PRA & Métriques RTO / RPO (2h)

### 📖 Intuition & Narration

Quand l'attaque ransomware majeure frappe — quand l'Active Directory s'effondre, que les hyperviseurs sont chiffrés et que les sauvegardes en ligne sont détruites — ce ne sont plus des scripts Bash qui sauvent l'entreprise, c'est le **Plan de Reprise d'Activité (PRA / DRP)** préparé et testé des mois à l'avance. 

La résilience opérationnelle consiste à accepter l'éventualité du désastre et à formaliser la procédure exacte pour reconstruire l'infrastructure à partir de zéro (**Bare-Metal Recovery**).

### 🔍 Anatomie Technique — Métriques RTO & RPO

```
MÉTRIQUES DE RÉSILENCE (RTO vs RPO)

  [DERNIÈRE SAUVEGARDE] ───────────────▶ [INCIDENT / CRASH] ───────────────▶ [SERVICE RESTAURÉ]
       │                                       │                                   │
       └─── Loss of Data Window (RPO) ─────────┴─── Downtime Window (RTO) ─────────┘

  RPO (Recovery Point Objective) : Quantité maximale de données perdues tolérable (ex: RPO < 15 min).
  RTO (Recovery Time Objective)  : Durée maximale d'interruption de service tolérable (ex: RTO < 4h).
```

---

## Module 2 — Cellule de Crise Cyber & War Room (2h)

### 🛠️ Structure & Rôles d'une Cellule de Crise Cyber

```markdown
ARCHITECTURE DE LA CELLULE DE CRISE CYBER (WAR ROOM)

  ┌─────────────────────────────────────────────────────────────┐
  │  DIRECTEUR DE CRISE (CEO / COO / CISO)                      │
  │  ├── Décision stratégique, arbitrage budgétaire et légal     │
  ├─────────────────────────────────────────────────────────────┤
  │  CELLULE TECHNIQUE (Lead IR & Forensic Lead)                 │
  │  ├── Confinement, analyse forensique, reconstruction PRA    │
  ├─────────────────────────────────────────────────────────────┤
  │  CELLULE JURIDIQUE & DPO                                    │
  │  ├── Notifications CNIL (72h), ANSSI (24h), dépôts de plainte│
  ├─────────────────────────────────────────────────────────────┤
  │  CELLULE COMMUNICATION                                      │
  │  ├── Communiqués de presse, com' interne, relation clients  │
  └─────────────────────────────────────────────────────────────┘
```

---

## Module 3 — Exercice de Crise Simulé : Attaque Ransomware (1h30)

### 🛠️ Atelier Pratique — Script d'Orchestration d'Exercice de Crise

```python
#!/usr/bin/env python3
"""
PARADIS — Injecteur de Scénarios d'Exercice de Crise Cyber (Tabletop Exercise)
"""

import time
import json

class CyberCrisisExerciseEngine:
    def __init__(self):
        self.timeline = [
            {"t": "08:00", "event": "INJECT 1: Alerte SOC — 15 postes RH affichent une demande de rançon LockBit."},
            {"t": "08:30", "event": "INJECT 2: L'Active Directory principal cesse de répondre. Les DCs secondaires sont chiffrés."},
            {"t": "09:15", "event": "INJECT 3: Le journaliste de L'Usine Digitale appelle le service de presse pour confirmer la fuite."},
            {"t": "10:00", "event": "INJECT 4: L'ANSSI réclame la notification d'alerte précoce NIS2 (Fin du délai 24h approche)."},
            {"t": "11:30", "event": "INJECT 5: L'équipe PRA a restauré l'AD depuis la sauvegarde immuable déconnectée."}
        ]

    def run_tabletop(self):
        print("=== DEBUT DE L'EXERCICE DE CRISE CYBER (WAR ROOM SIMULATION) ===")
        for inject in self.timeline:
            print(f"[{inject['t']}] {inject['event']}")
            time.sleep(0.5)
        print("=== EXERCICE COMPLET — DÉBRIEFING POST-MORTEM EN COURS ===")

engine = CyberCrisisExerciseEngine()
engine.run_tabletop()
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **RTO** | Recovery Time Objective — Durée maximale d'interruption tolérable d'un service |
| **RPO** | Recovery Point Objective — Quantité maximale de données perdues tolérable exprimée en durée |
| **BIA** | Business Impact Analysis — Étude d'impact sur l'activité pour identifier les processus critiques |
| **PRA / DRP** | Plan de Reprise d'Activité / Disaster Recovery Plan — Procédures de reconstruction informatique après désastre |

---

## Exercices Pratiques

### Exercice 1 — Calcul de RTO/RPO

Une banque subit une panne de base de données à **14:00**. La dernière sauvegarde utilisable date de **13:45**. Le service est entièrement restauré et opérationnel à **18:00**. Quels sont le RPO et le RTO réels observés lors de cet incident ?

**Corrigé guidé :**
- **RPO réel :** $14:00 - 13:45 = \mathbf{15\text{ minutes}}$ de transactions perdues.
- **RTO réel :** $18:00 - 14:00 = \mathbf{4\text{ heures}}$ d'interruption de service.

---

## Banque QCM — 5 Questions

**Q1.** Le **RPO** (Recovery Point Objective) mesure :

- A) Le coût du matériel de remplacement
- B) La quantité maximale de données perdues tolérable exprimée en durée (ex: 15 minutes) ✅
- C) La durée de la réunion du comité de crise
- D) Le nombre d'analystes dans le SOC

**Q2.** La première action de la **Cellule de Crise Cyber** lors d'une attaque ransomware confirmée est :

- A) Payer immédiatement la rançon demandée
- B) Activer la War Room, isoler les réseaux compromis et qualifier l'étendue de l'incident ✅
- C) Effacer tous les serveurs sans analyse
- D) Publier les mots de passe des utilisateurs sur Internet

**Q3.** En cas d'attaque informatique majeure, la communication avec les médias doit être gérée par :

- A) N'importe quel développeur disponible
- B) La Cellule de Communication de Crise désignée avec un porte-parole formé ✅
- C) Le stagiaire réseau
- D) Les attaquants eux-mêmes

**Q4.** Qu'est-ce qu'un **Tabletop Exercise** (Exercice de crise sur table) ?

- A) Un jeu d'échecs entre développeurs
- B) Une simulation théorique et scénarisée d'attaque cyber pour tester la prise de décision de la cellule de crise ✅
- C) Un test de résistance des bureaux physiques
- D) Une mise à jour du noyau Linux

**Q5.** Le document **BIA** (Business Impact Analysis) permet de :

- A) Lister les prix des ordinateurs portables
- B) Identifier les processus métiers critiques et définir leurs exigences RTO/RPO ✅
- C) Rédiger les contrats de travail
- D) Choisir les couleurs du logo d'entreprise

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
