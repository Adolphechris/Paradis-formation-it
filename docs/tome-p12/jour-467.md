# TOME P12 — Gouvernance, Compliance & Architecture Finale — Jour 467 (6h) : Security Leadership, Business Alignment & Communication Executive CISO (Board Reporting, Cyber Insurance & ROI de la Sécurité)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Développer la posture de **Security Leadership** et traduire les risques techniques en enjeux stratégiques pour le Comité Executif (COMEX / Board)
> - Calculer le **ROI de la Sécurité** (Return on Security Investment) et le ROSI pour justifier les investissements cyber
> - Négocier et optimiser la souscription aux contrats de **Cyber-Assurance** (Questionnaire de risque, garanties ransomwares, exclusions)
> - Construire le Dashboard Executive du CISO (KRI/KPI de sécurité)
>
> **Compétences visées :** `POL-01` (A) — Executive CISO Leadership, `POL-02` (A) — Cyber Insurance & ROSI

---

## Module 1 — Communication Executive & Board Reporting (2h)

### 📖 Intuition & Narration

Un CISO/RSSI qui présente un rapport de 50 pages truffé de termes techniques ("Buffer overflow dans la heap", "Règles YARA", "XSS réfléchi") au Comité d'Administration perd l'attention de son auditoire en 3 minutes. Le Board ne parle pas le langage des vulnérabilités : il parle le langage de la **continuité d'activité**, de la **réputation**, des **pertes financières** et de la **conformité légale**.

Le Security Leader sachant traduire "Vulnérabilité CVE Critical" en "Risque de perte d'exploitation de 2M€ et suspension de licence bancaire" obtient le budget nécessaire et la confiance de la Direction.

### 🔍 Anatomie Technique — Executive CISO Dashboard

```
EXECUTIVE CISO DASHBOARD — LES 4 PIERS DE REPORTING

  ┌─────────────────────────────────────────────────────────────┐
  │  1. EXPOSURE & RISK (Exposition au risque)                  │
  │     ├── Score de maturité global (ex: CIS IG3 92%)          │
  │     └── Risques résiduels majeurs vs Seuil d'appétence      │
  ├─────────────────────────────────────────────────────────────┤
  │  2. OPERATIONAL RESILIENCE (Résilience opérationnelle)      │
  │     ├── MTTD (Mean Time to Detect) : 8.5 min                │
  │     └── MTTR (Mean Time to Respond) : 4.2 min               │
  ├─────────────────────────────────────────────────────────────┤
  │  3. COMPLIANCE & AUDIT (Conformité & Réglementations)       │
  │     ├── ISO 27001 / RGPD / NIS2 / DORA status : 100%        │
  │     └── Audits tiers & pentests réalisés                    │
  ├─────────────────────────────────────────────────────────────┤
  │  4. FINANCIAL & ROSI (Retour sur Investissement)           │
  │     ├── Budget Cyber vs Pertes Évitées (ROSI = +240%)        │
  │     └── Couverture Cyber-Assurance : 10M€                   │
  └─────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Calcul du ROSI (Return on Security Investment) (2h)

### 🛠️ Atelier Pratique — Calculateur du ROSI en Python

```python
#!/usr/bin/env python3
"""
PARADIS — Calculateur du Return on Security Investment (ROSI)
Formule ROSI : ROSI = [(ALE_sans_solution - ALE_avec_solution) - Cost_solution] / Cost_solution
"""

def calculate_rosi(ale_before: float, mitigation_rate: float, solution_cost: float) -> dict:
    """
    Exemple d'investissement : Déploiement d'un EDR eBPF + SOAR
    - ALE initial (Risque de Ransomware) : 500,000 € / an
    - Taux de réduction du risque (Mitigation Rate) : 80% (0.80)
    - Coût annuel de la solution (Licences + Ops) : 80,000 €
    """
    risk_mitigated = ale_before * mitigation_rate
    ale_after = ale_before - risk_mitigated
    net_savings = risk_mitigated - solution_cost
    rosi_percentage = (net_savings / solution_cost) * 100

    return {
        "ale_initial_eur": ale_before,
        "ale_post_mitigation_eur": ale_after,
        "annual_solution_cost_eur": solution_cost,
        "net_annual_savings_eur": net_savings,
        "rosi_percentage": round(rosi_percentage, 2)
    }

rosi = calculate_rosi(500000.0, 0.80, 80000.0)
print("[ROSI FINANCIAL JUSTIFICATION FOR BOARD]")
print(f"  Pertes d'Exploitation Évitées (Net) : {rosi['net_annual_savings_eur']} € / an")
print(f"  Retour sur Investissement (ROSI)   : +{rosi['rosi_percentage']} %")
```

---

## Module 3 — Cyber-Assurance & Négociation de Contrats (1h30)

### 🛠️ Préréquis Obligatoires des Tableaux d'Assurance Cyber 2024

```markdown
PRÉREQUIS INDISPENSABLES POUR SOUSCRIRE UNE CYBER-ASSURANCE (2024)

1. MULTI-FACTOR AUTHENTICATION (MFA)
   - MFA obligatoire sur TOUS les accès distants (VPN, SSH, RDP) et emails.
2. IMMUTABLE BACKUPS
   - Sauvegardes déconnectées (Air-gapped) ou immuables (S3 Object Lock).
3. EDR DEPLOYMENT
   - EDR avec supervision 24/7 sur 100% des serveurs et postes de travail.
4. EOL MANAGEMENT
   - Aucun système obsolète (End-of-Life) exposé sur Internet sans compensations.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ROSI** | Return on Security Investment — Ratio financier mesurant la rentabilité nette d'un investissement en sécurité |
| **KRI** | Key Risk Indicator — Indicateur clé mesurant l'évolution d'un risque spécifique |
| **KPI** | Key Performance Indicator — Indicateur mesurant l'efficacité d'une mesure ou d'un processus de sécurité |

---

## Exercices Pratiques

### Exercice 1 — Calcul de ROSI

Une entreprise subit un risque de fuite de données évalué à un ALE de **1 000 000 € / an**. Elle envisage d'acquérir une plateforme SAST + SCA + Security Training coûtant **150 000 € / an**. L'outil réduit l'exposition au risque de **70%**. Calculer le ROSI net et exprimer la justification pour le Board.

**Corrigé guidé :**
- Pertes évitées : $1\ 000\ 000 \times 0.70 = 700\ 000\ €$.
- Économie nette : $700\ 000 - 150\ 000 = 550\ 000\ € / an$.
- **ROSI** : $\frac{550\ 000}{150\ 000} \times 100 = \mathbf{+366.67\%}$.
- *Discours Executive :* "Pour chaque euro investi dans la plateforme (150k€), nous évitons 3,66 € de pertes réelles (550k€ de gain net)."

---

## Banque QCM — 5 Questions

**Q1.** Lors d'une présentation au Conseil d'Administration (Board), le CISO / RSSI doit prioriser :

- A) La liste détaillée des 4 000 failles détectées par le scanner SAST
- B) L'alignement stratégique, les impacts financiers (ALE/ROSI), la résilience et la conformité légale ✅
- C) La démonstration d'un exploit en assembleur x86-64
- D) La marque des cartes réseau des serveurs

**Q2.** La formule du **ROSI** (Return on Security Investment) permet de :

- A) Calculer la vitesse de téléchargement des fichiers
- B) Justifier financièrement un investissement cyber en comparant les pertes évitées au coût de la solution ✅
- C) Remplacer la taxe sur la valeur ajoutée
- D) Mesurer la température des datacenters

**Q3.** Quel composant technique est désormais **exigé sans exception** par la majorité des assureurs cyber pour accorder une couverture ?

- A) Un écran 4K pour chaque analyste
- B) L'authentification multifacteur (MFA) sur tous les accès distants et privilégiés ✅
- C) Un compte Twitter officiel
- D) L'utilisation de compilateurs C++ vintage

**Q4.** Un **KRI** (Key Risk Indicator) se différencie d'un **KPI** car :

- A) Le KRI mesure l'exposition ou la dégradation par rapport au seuil de risque, tandis que le KPI mesure l'efficacité d'un service ✅
- B) Le KRI est uniquement écrit en allemand
- C) Le KPI ne contient jamais de chiffres
- D) Ils sont strictement identiques

**Q5.** Les **sauvegardes immuables (Immutable Backups)** sont cruciales pour l'assurabilité cyber car :

- A) Elles permettent de ne jamais faire de sauvegardes
- B) Elles empêchent les ransomwares d'effacer ou de chiffrer les sauvegardes, garantissant la restauration ✅
- C) Elles réduisent la taille de la base de données
- D) Elles sont gratuites sur tous les serveurs

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
