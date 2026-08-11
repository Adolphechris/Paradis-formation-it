# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 560 (6h) : Projet Intégrateur Semestre 13 — Partie 1 : Enterprise Architecture & SRE Platform Capstone

> [!NOTE]
> **Objectifs pédagogiques :**
> - Assembler en une architecture de référence cohérente les concepts de la première partie du Semestre 13 : TOGAF ADM, DORA Metrics, SRE SLI/SLO, Platform Engineering (IDP), FinOps, Data Mesh, CQRS/Saga, OpenTelemetry et k6 Performance
> - Déployer une **Internal Developer Platform (IDP)** instrumentée avec OpenTelemetry, surveillée par SLO/Burn Rate et validée sous tests de charge k6
> - Rédiger le **Dossier d'Architecture de Référence (Architecture Decision Record - ADR & TOGAF BDAT)** pour la plateforme d'entreprise PARADIS 2026
> - Valider la résilience et les performances du système complet lors d'un exercice d'homologation technique
>
> **Compétences visées :** `ARCH-01` (A), `INFRA-03` (A), `DEV-03` (A), `PRO-01` (A) — Enterprise Architecture & SRE Platform Capstone

---

## Module 1 — Architecture de Référence BDAT (PARADIS 2026) (2h)

### 📖 Narration — La Synthèse des Piliers de l'Ingénierie Ultime

Cette première partie du Semestre 13 a posé les fondations de la maturité technologique d'excellence :
- **J551** : Architecture d'Entreprise TOGAF ADM & Zachman
- **J552** : IT Strategy, OKRs & DORA Metrics
- **J553** : SRE, SLO/SLI & Error Budget Burn Rate
- **J554** : Platform Engineering & Spotify Backstage IDP
- **J555** : FinOps, Cost Allocation & GreenOps Carbon
- **J556** : Data Mesh, Data Contracts & Data Quality
- **J557** : Microservices Patterns (Saga Orchestration, CQRS, CDC Outbox)
- **J558** : Observability Engineering (OpenTelemetry & W3C Tracing)
- **J559** : Performance Engineering (k6 Load Testing & Flamegraphs)

Le présent Projet Intégrateur consiste à **concevoir, valider et formaliser la Plateforme d'Ingénierie Ultime (PARADIS Enterprise 2026)**.

### 🔍 Architecture BDAT Globale

```
ARCHITECTURE BDAT — PARADIS ENTERPRISE 2026

 ┌─────────────────────────────────────────────────────────────────────────┐
 │ 1. BUSINESS ARCHITECTURE                                                │
 │  • Modèle Produit (Product-Led), OKRs d'ingénierie alignés              │
 │  • SLA contractuel client : 99.9% de disponibilité globale               │
 ├─────────────────────────────────────────────────────────────────────────┤
 │ 2. DATA ARCHITECTURE (Data Mesh & CQRS)                                 │
 │  • Data Products décentralisés par Domaine (Finance, Payment, Analytics)│
 │  • Data Contracts validés par OpenDataContract & Great Expectations    │
 │  • Pattern CQRS avec Transactional Outbox + Debezium CDC + Kafka        │
 ├─────────────────────────────────────────────────────────────────────────┤
 │ 3. APPLICATION ARCHITECTURE (Platform & Microservices)                 │
 │  • Internal Developer Platform (IDP) basée sur Spotify Backstage       │
 │  • Golden Paths d'auto-service (Templates Python/Go/Spring)            │
 │  • Saga Orchestration pour les transactions financières distribuées     │
 ├─────────────────────────────────────────────────────────────────────────┤
 │ 4. TECHNOLOGY & SRE ARCHITECTURE (Observabilité & Résilience)           │
 │  • Kubernetes Multi-Zone + Istio Service Mesh (mTLS & Circuit Breakers) │
 │  • OpenTelemetry Collector + Jaeger (Distributed Tracing W3C)           │
 │  • Alerting basé sur le Burn Rate de l'Error Budget (SLO: 99.95%)      │
 │  • Validation de charge continue en CI/CD via Grafana k6                │
 └─────────────────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Déploiement & Validation de la Plateforme (2h)

### 🛠️ Atelier Pratique — Fichier ADR (Architecture Decision Record)

```markdown
# ADR-2026-001 : Adoption du Platform Engineering avec Backstage et OpenTelemetry

## STATUT
Approuvé par le Conseil d'Architecture (ARB) le 2026-08-11

## CONTEXTE
Les équipes de développement produit PARADIS font face à une surcharge cognitive importante due à la complexité de l'écosystème Cloud Native (Kubernetes, Helm, Terraform, OPA, Prometheus, Istio). Le temps d'onboarding moyen est de 14 jours, et le Lead Time for Changes moyen est de 12 jours (Statut DORA Medium Performer).

## DÉCISION
1. **Adoption de Spotify Backstage** comme Internal Developer Platform (IDP) centralisée pour fournir des Golden Paths d'auto-service.
2. **Standardisation d'OpenTelemetry (OTEL)** pour la collecte unifiée des traces (OTLP), métriques et logs.
3. **Mise en place de l'alerting SRE basé sur le Burn Rate** du budget d'erreur (SLO 99.95%).
4. **Déploiement du Data Mesh** avec validation obligatoire des Data Contracts en CI/CD.

## CONSÉQUENCES
- **Positives** :
  - Réduction du temps d'onboarding à < 1 jour.
  - Réduction du Lead Time for Changes de 12 jours à < 2 heures (Cible DORA Elite Performer).
  - Élimination des alertes intempestives grâce à l'alerting Burn Rate.
- **Négatives / Risques** :
  - Charge initiale d'ingénierie pour la Platform Team (3 ingénieurs dédiés).
  - Nécessité d'acculturation des équipes à la démarche Data Product et aux Data Contracts.
```

---

## Module 3 — Script d'Homologation & Score de Maturité S13-P1 (1h30)

### 🛠️ Script Python : S13-P1 Capstone Platform Assessor

```python
#!/usr/bin/env python3
"""
PARADIS — S13-P1 Capstone Platform Assessor
Valide l'intégration globale de l'architecture d'entreprise et de la plateforme SRE.
"""
from dataclasses import dataclass
from typing import List
from datetime import datetime

@dataclass
class ArchitectureValidationCheck:
    domain: str            # EA | SRE | PLATFORM | FINOPS | DATA | PERFORMANCE
    title: str
    status: str            # PASS | FAIL
    metric_value: str
    target_value: str

class S13CapstoneAssessor:
    def __init__(self, org_name: str):
        self.org_name = org_name
        self.checks: List[ArchitectureValidationCheck] = [
            ArchitectureValidationCheck("EA", "TOGAF BDAT Documenté & Validé ARB", "PASS", "ADR-2026-001 Approuvé", "ADR Signé"),
            ArchitectureValidationCheck("SRE", "SLO & Error Budget Burn Rate Alerting", "PASS", "SLO 99.95% | Burn Rate 14.4x alert", "SLO >= 99.9%"),
            ArchitectureValidationCheck("PLATFORM", "IDP Backstage Golden Path Auto-Service", "PASS", "Onboarding < 1 jour", "< 2 jours"),
            ArchitectureValidationCheck("FINOPS", "Cost Allocation Tagging & Rightsizing", "PASS", "32% d'économie cloud", ">= 25%"),
            ArchitectureValidationCheck("DATA", "Data Mesh & Data Contracts Validation", "PASS", "100% Data Products contractés", "100%"),
            ArchitectureValidationCheck("OBSERVABILITY", "OpenTelemetry W3C Distributed Tracing", "PASS", "OTLP Collector + Jaeger actif", "OTel OTLP"),
            ArchitectureValidationCheck("PERFORMANCE", "k6 Load Testing dans pipeline CI/CD", "PASS", "p(95) < 180ms sous 500 VUs", "p(95) < 200ms"),
        ]

    def evaluate(self):
        print("=" * 70)
        print(f"  HOMOLOGATION CAPSTONE S13-PARTIE 1 — {self.org_name}")
        print(f"  Date d'Évaluation : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 70)
        print()

        passed_count = sum(1 for c in self.checks if c.status == "PASS")
        total_count = len(self.checks)

        for c in self.checks:
            icon = "✅ PASS" if c.status == "PASS" else "❌ FAIL"
            print(f"  {icon} [{c.domain:<12}] {c.title}")
            print(f"       Valeur Mesurée : {c.metric_value} (Cible: {c.target_value})")
            print()

        score_pct = (passed_count / total_count) * 100.0
        print("─" * 70)
        print(f"  SCORE D'HOMOLOGATION FINALE : {passed_count}/{total_count} ({score_pct:.0f}%)")

        if score_pct == 100.0:
            print("  🏆 DÉCISION : PLATEFORME ARCHITECTURALE HOMOLOGUÉE AVEC MENTION D'EXCELLENCE !")
        elif score_pct >= 80.0:
            print("  🟢 DÉCISION : PLATEFORME VALIDÉE POUR DÉPLOIEMENT EN PRODUCTION.")
        else:
            print("  ⚠️ DÉCISION : RÉVISION D'ARCHITECTURE REQUISE AVANT GO-LIVE.")

        print("=" * 70)


if __name__ == "__main__":
    assessor = S13CapstoneAssessor("PARADIS ENTERPRISE 2026")
    assessor.evaluate()
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **ADR** | Architecture Decision Record — Document formalisant une décision d'architecture majeure et son contexte |
| **BDAT** | Business, Data, Application, Technology — Les 4 piliers d'architecture TOGAF |
| **Go-Live** | Mise en service officielle d'un système en environnement de production réelle |
| **CNCF** | Cloud Native Computing Foundation — Fondation hébergeant Kubernetes, OpenTelemetry, Jaeger, Backstage... |

---

## Exercices Pratiques

### Exercice 1 — Rédaction d'un ADR d'Architecture

Rédigez le squelette d'un **ADR (Architecture Decision Record)** pour la décision de migrer d'une architecture de données centralisée Data Lake vers un **Data Mesh décentralisé**.

**Corrigé guidé :**
```markdown
# ADR-2026-002 : Migration vers une Architecture Data Mesh Décentralisée

## STATUT
Approuvé

## CONTEXTE
Le Data Lake centralisé souffre de problèmes de qualité de données récurrents. L'équipe Data centrale de 5 personnes ne peut plus traiter les demandes des 12 domaines métier de l'entreprise.

## DÉCISION
Adopter l'architecture Data Mesh en transférant la propriété des données aux équipes produit (Domain Ownership) et en instaurant des Data Contracts obligatoires validés en CI/CD.

## CONSÉQUENCES
- **Positives** : Décentralisation, responsabilité des équipes produit à la source, meilleure qualité des données.
- **Négatives** : Nécessité d'élever les compétences Data des équipes produit.
```

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce qu'un **ADR (Architecture Decision Record)** ?

- A) Un relevé bancaire de l'entreprise.
- B) Un document concis et formalisé enregistrant une décision d'architecture logicielle majeure, sa justification, son statut et ses conséquences. ✅
- C) Un rapport de bug soumis par les utilisateurs.
- D) Une facture de consommables cloud.

**Q2.** Dans l'architecture BDAT de TOGAF, que couvre le domaine **Application Architecture** ?

- A) L'achat des ordinateurs portables des salariés.
- B) La structure des applications individuelles, leurs interactions et leurs relations avec les processus métier de l'organisation. ✅
- C) Les câbles de fibre optique du datacenter.
- D) Les contrats d'assurance responsabilité civile.

**Q3.** Quel est l'avantage clé de l'intégration d'OpenTelemetry et de k6 dans une même plateforme d'ingénierie ?

- A) k6 génère la charge et OpenTelemetry permet de tracer précisément où se trouvent les goulots d'étranglement de latence sous cette charge. ✅
- B) k6 remplace le besoin de bases de données.
- C) OpenTelemetry supprime le besoin de tests de charge.
- D) Cela réduit le coût d'électricité des serveurs.

**Q4.** Lors d'une homologation technique de plateforme, quel score d'homologation minimal est exigé dans les standards PARADIS pour autoriser le Go-Live en production ?

- A) 50%
- B) 80% ✅
- C) 100% uniquement avec dérogation
- D) 30%

**Q5.** Quelle fondation internationale héberge les projets d'infrastructure et d'observabilité clés étudiés dans ce module (Kubernetes, OpenTelemetry, Jaeger, Backstage) ?

- A) Apache Software Foundation
- B) Linux Foundation / CNCF (Cloud Native Computing Foundation) ✅
- C) Eclipse Foundation
- D) W3C

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
