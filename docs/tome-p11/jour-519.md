# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 519 (6h) : Résilience Opérationnelle & Gestion de Crise : Plan de Continuité (PCA/PRA), RTO/RPO, Exercices Tabletop & GameDays

> [!NOTE]
> **Objectifs pédagogiques :**
> - Concevoir un **Plan de Continuité d'Activité (PCA / BCP)** et un **Plan de Reprise d'Activité (PRA / DRP)**
> - Définir et mesurer les deux métriques fondamentales de résilience : **RTO** (Recovery Time Objective) et **RPO** (Recovery Point Objective)
> - Organiser et animer des exercices de crise simulée **Tabletop Exercises** et des **GameDays (Chaos Engineering)**
> - Structurer la cellule de crise cyber (War Room) et la stratégie de communication de crise interne et externe
>
> **Compétences visées :** `INF-02` (A), `SEC-06` (A) — Resilience, BCP/DRP & Chaos Engineering

---

## Module 1 — Fondements des Plans PCA/PRA & Métriques RTO/RPO (2h)

### 📖 Intuition & Narration

Que se passe-t-il si le Data Center principal d'une banque est détruit par un incendie, ou si l'ensemble de ses serveurs Active Directory est chiffré par un ransomware un vendredi soir à 23h00 ?

Sans préparation formelle, c'est la panique, le chaos opérationnel et la faillite potentielle de l'entreprise.

- Le **PCA (Plan de Continuité d'Activité / BCP)** définit l'ensemble des mesures permettant à l'entreprise de continuer à fonctionner à un niveau dégradé *pendant* la crise.
- Le **PRA (Plan de Reprise d'Activité / DRP)** définit l'ensemble des procédures techniques pour reconstruire l'infrastructure et restaurer les services informatiques *après* le sinistre.

### 🔍 Anatomie Technique — RTO & RPO

```
DÉFINITION DES MÉTRIQUES DE RÉSILIENCE (RTO vs RPO)

  [ DERNIÈRE SAUVEGARDE ] ◄────────── RPO ──────────► [ CRASH / CYBERATTAQUE ] ◄────────── RTO ──────────► [ SERVICE RESTAURÉ ]
  (Données valides)        Perte de données maximale          (Panne du système)         Durée d'interruption maximale
                           acceptable (ex: RPO = 1h)                                     acceptable (ex: RTO = 4h)

EXEMPLES SELON LA CRITICITÉ DES SYSTÈMES :
  ┌────────────────────────────────────────────────────────────────────────┐
  │ SYSTÈME              │ RPO CIBLE             │ RTO CIBLE               │
  ├──────────────────────┼───────────────────────┼─────────────────────────┤
  │ Paiement Bancaire    │ RPO = 0 (Synchro)     │ RTO < 15 minutes        │
  │ ERP / CRM Enterprise │ RPO < 1 heure         │ RTO < 4 heures          │
  │ Messagerie interne   │ RPO < 24 heures       │ RTO < 24 heures         │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Atelier Pratique : Simulator de Basculement PRA & Evaluation RTO/RPO (2h)

### 🛠️ Code Python : Failover Orchestrator & Disaster Recovery Evaluator

```python
#!/usr/bin/env python3
"""
PARADIS — Disaster Recovery Failover & RTO/RPO Evaluator
Simule le basculement automatique (Failover) vers le site PRA secondaire et mesure la conformité RTO/RPO.
"""

import time
import json
import sys
from datetime import datetime, timedelta

class DisasterRecoveryOrchestrator:
    def __init__(self, target_rto_min: float, target_rpo_min: float):
        self.target_rto_min = target_rto_min
        self.target_rpo_min = target_rpo_min
        self.last_backup_timestamp = datetime.now() - timedelta(minutes=12) # Sauvegarde il y a 12 min

    def trigger_disaster_event(self) -> dict:
        crash_timestamp = datetime.now()
        print("=== INCIDENT MAJEUR : PANNESITE PRINCIPAL DÉTECTÉE ===")
        print(f"[*] Heure du sinistre : {crash_timestamp.isoformat()}")

        # 1. Calcul du RPO réel (Perte de données subie)
        data_loss_minutes = (crash_timestamp - self.last_backup_timestamp).total_seconds() / 60.0
        rpo_compliant = data_loss_minutes <= self.target_rpo_min

        print(f"[*] Calcul RPO : Dernière sauvegarde effectuée il y a {data_loss_minutes:.1f} min (Cible RPO : {self.target_rpo_min} min)")
        print(f"    Status RPO : {'✅ CONFORME' if rpo_compliant else '❌ DÉPASSÉ'}")

        # 2. Simulation de l'exécution du basculement PRA (Failover)
        print("\n[*] Lancement du basculement automatisé vers le site PRA secondaire...")
        start_failover = time.time()

        # Étape A : Basculement DNS / Traffic Manager
        time.sleep(0.5)
        print("  → [1/3] Reconfiguration des enregistrements DNS (Active-Passive failover)")

        # Étape B : Promotion des bases de données répliquées en Read-Write
        time.sleep(0.5)
        print("  → [2/3] Promotion du cluster PostgreSQL secondaire en Nœud Primary")

        # Étape C : Démarrage des conteneurs applicatifs sur le cluster K8s secondaire
        time.sleep(0.5)
        print("  → [3/3] Scaling des déploiements Kubernetes sur le site de secours")

        elapsed_rto_min = ((time.time() - start_failover) * 10) + 18.5 # Simulation 18.5 min de basculement réel
        rto_compliant = elapsed_rto_min <= self.target_rto_min

        print(f"\n[*] Calcul RTO : Durée totale de restauration du service : {elapsed_rto_min:.1f} min (Cible RTO : {self.target_rto_min} min)")
        print(f"    Status RTO : {'✅ CONFORME' if rto_compliant else '❌ DÉPASSÉ'}")

        return {
            "rpo_actual_min": round(data_loss_minutes, 1),
            "rpo_compliant": rpo_compliant,
            "rto_actual_min": round(elapsed_rto_min, 1),
            "rto_compliant": rto_compliant,
            "dr_status": "SUCCESS" if (rpo_compliant and rto_compliant) else "DEGRADED"
        }

if __name__ == "__main__":
    orchestrator = DisasterRecoveryOrchestrator(target_rto_min=30.0, target_rpo_min=15.0)
    result = orchestrator.trigger_disaster_event()

    print("\n" + "═"*70)
    print("  RAPPORT DE TEST DE CONTINUITÉ D'ACTIVITÉ (PRA / DRP)")
    print("═"*70)
    print(json.dumps(result, indent=2))
    print("═"*70)
```

---

## Module 3 — Tabletop Exercises & GameDays (Chaos Engineering) (1h30)

### 🔍 Exercices Tabletop & GameDays (Chaos Engineering)

Un Plan de Reprise d'Activité qui n'a jamais été testé est un plan qui ne fonctionnera pas le jour du sinistre.

Deux méthodes complémentaires sont utilisées :
1. **Exercice Tabletop (Jeu de Rôle de Crise)** : Une simulation basée sur un scénario fictif (ex: "Il est 2h du matin, un ransomware a chiffré les bases de données") où la cellule de crise déroule verbalement les procédures et valide les rôles.
2. **GameDays (Chaos Engineering avec Gremlin / Chaos Mesh)** : Injection contrôlée et volontaire de pannes réelles en pré-production ou production (coupure de nœud K8s, injection de latence réseau) pour vérifier l'auto-réparation du système.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PCA / BCP** | Plan de Continuité d'Activité / Business Continuity Plan |
| **PRA / DRP** | Plan de Reprise d'Activité / Disaster Recovery Plan |
| **RTO** | Recovery Time Objective — Durée maximale d'interruption admissible |
| **RPO** | Recovery Point Objective — Perte de données maximale admissible |

---

## Exercices Pratiques

### Exercice 1 — Choix d'Architecture selon RTO/RPO

Quelle architecture de base de données devez-vous déployer si la direction exige un **RPO = 0** (aucune perte de donnée tolérée) et un **RTO < 1 minute** ?

**Corrigé guidé :**
Vous devez déployer un cluster de base de données multi-région avec **réplication synchrone** et **basculement automatique (Active-Active ou Multi-Region Multi-Master)**. La réplication asynchrone est exclue car elle induirait un RPO > 0 en cas de crash du nœud primaire.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la différence fondamentale entre le **PCA (BCP)** et le **PRA (DRP)** ?

- A) Le PCA concerne le matériel, le PRA concerne le réseau.
- B) Le PCA maintient le fonctionnement de l'entreprise pendant la crise, tandis que le PRA reconstruit et restaure les systèmes informatiques après le sinistre. ✅
- C) Le PCA est payant, le PRA est gratuit.
- D) Il n'y a aucune différence.

**Q2.** Que mesure le **RPO (Recovery Point Objective)** ?

- A) La durée maximale d'interruption du service.
- B) La quantité maximale de perte de données mesurée en temps (ex: 1 heure de données) qu'une entreprise peut tolérer suite à un sinistre. ✅
- C) Le salaire du directeur informatique.
- D) Le nombre de serveurs dans le data center.

**Q3.** Si un système tombe en panne à 14h00 et que la dernière sauvegarde disponible date de 13h00, quelle est la perte de données réelle subie ?

- A) 1 heure de données. ✅
- B) 24 heures de données.
- C) 0 minute.
- D) 10 jours.

**Q4.** Qu'est-ce qu'un **GameDay (Chaos Engineering)** ?

- A) Une journée de jeu vidéo au bureau.
- B) Un exercice pratique où des pannes réelles sont injectées de manière contrôlée dans les systèmes pour vérifier la résilience et l'auto-réparation. ✅
- C) Une réunion de présentation commerciale.
- D) La fête annuelle de l'entreprise.

**Q5.** Dans un exercice de crise **Tabletop**, que font les participants ?

- A) Ils réparent des câbles électriques avec un fer à souder.
- B) Ils simulent verbalement et méthodiquement leur réaction face à un scénario de crise cyber fictif pour tester la coordination de la War Room. ✅
- C) Ils écrivent du code C++.
- D) Ils dorment dans la salle de réunion.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
