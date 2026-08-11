# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 556 (6h) : Data Mesh & Data Governance : Domain Ownership, Data Contracts & Data Quality

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre l'évolution des architectures de données : du Data Warehouse monolithique au Data Lake, puis au **Data Mesh décentralisé** (Zhamak Dehghani)
> - Maîtriser les **4 piliers du Data Mesh** : Domain Ownership, Data as a Product, Self-Serve Data Platform et Federated Computational Governance
> - Concevoir et valider des **Data Contracts (Contrats de Données)** en JSON Schema / OpenDataContract pour garantir la qualité des échanges entre domaines
> - Implémenter des contrôles automatiques de **Qualité de Données (Data Quality)** avec Great Expectations / Soda
>
> **Compétences visées :** `DATA-01` (A), `ARCH-01` (A) — Data Mesh, Data Governance, Data Contracts

---

## Module 1 — L'Architecture Data Mesh & Piliers (2h)

### 📖 Intuition & Narration

Les architectures de données centralisées (Data Warehouse puis Data Lake) souffrent d'un goulot d'étranglement majeur : l'équipe Data centrale ne comprend pas le sens métier des données générées par 50 équipes produit différentes, et les équipes produit ne se sentent pas responsables de la qualité des données qu'elles déversent dans le Data Lake.

Le **Data Mesh** applique les principes des microservices et du Domain-Driven Design (DDD) au monde des données analytiques : au lieu de centraliser toutes les données dans un lac unique géré par une équipe isolée, **chaque domaine métier devient propriétaire de ses propres données et les publie sous forme de Produit de Données (Data Product)**.

### 🔍 Les 4 Piliers du Data Mesh

```
LES 4 PILIERS DU DATA MESH (ZHAMAK DEHGHANI)

  1. DOMAIN OWNERSHIP (Propriété par Domaine)
     Les équipes produit qui créent les données opérationnelles en sont propriétaires
     et responsables de leur version analytique.

  2. DATA AS A PRODUCT (La Donnée comme Produit)
     Chaque domaine publie des Data Products consommables, documentés, sécurisés,
     avec des SLO de qualité de données stricts.

  3. SELF-SERVE DATA PLATFORM (Plateforme en Auto-Service)
     L'équipe Data Platform fournit les outils d'auto-service (BigQuery, Snowflake,
     dbt, Kafka) pour que les domaines puissent bâtir leurs Data Products sans friction.

  4. FEDERATED COMPUTATIONAL GOVERNANCE (Gouvernance Fédérée Automatisée)
     Les règles de sécurité, de confidentialité (RGPD), d'audit et de format sont
     interdisciplinaires et appliquées automatiquement par du code (Policy as Code).
```

---

## Module 2 — Data Contracts & Spécification (2h)

### 🔍 Qu'est-ce qu'un Data Contract ?

Un **Data Contract (Contrat de Données)** est un accord formel et vérifiable par machine entre le producteur d'un Data Product et ses consommateurs. Il définit :
- Le **Schéma de données** (champs, types, contraintes de nullité)
- La **Sémantique métier** des champs
- Les **SLO de données** (fraîcheur, complétude, volume)
- Les règles d'**évolution du schéma** (compatibilité ascendante)

```
EXEMPLE DE DATA CONTRACT (OPENDATACONTRACT / JSON SCHEMA)

  PRODUCTEUR (Domaine Paiement)                    CONSOMMATEUR (Domaine Analytics)
  ┌─────────────────────────────┐                  ┌──────────────────────────────┐
  │ Data Product: payment_events│──Data Contract──→│ Dashboard Chiffre d'Affaires │
  │ SLO: Fraîcheur < 5 minutes  │ (Validé en CI)   │ Dépendance garantie          │
  └─────────────────────────────┘                  └──────────────────────────────┘
```

### 🛠️ Spécification YAML : Data Contract Exemple (OpenDataContract Specification)

```yaml
# data-contracts/payment-events-contract.yaml
kind: DataContract
apiVersion: v1.0.0
id: urn:datacontract:finance:payment_events
status: active

dataset:
  name: payment_events
  domain: finance
  owner: team-payment-engineering@paradis.fr

schema:
  type: record
  fields:
    - name: transaction_id
      type: string
      required: true
      description: "Identifiant unique UUID v4 de la transaction bancaire"
    - name: amount_cents
      type: integer
      required: true
      description: "Montant de la transaction en centimes d'Euros (ex: 1000 = 10.00€)"
    - name: currency
      type: string
      required: true
      enum: ["EUR", "USD", "GBP"]
    - name: status
      type: string
      required: true
      enum: ["SUCCESS", "FAILED", "PENDING"]
    - name: created_at
      type: timestamp
      required: true

quality_slos:
  freshness_minutes: 5       # La donnée doit dater de moins de 5 minutes
  completeness_percent: 99.9  # Moins de 0.1% de valeurs manquantes
  uniqueness_fields: ["transaction_id"]
```

---

## Module 3 — Calculateur & Validation de Data Quality (1h30)

### 🛠️ Script Python : Data Contract Validator & Quality Engine

```python
#!/usr/bin/env python3
"""
PARADIS — Data Contract & Data Quality Validation Engine
Valide un lot de données par rapport à la spécification du Data Contract.
"""
import json
from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass
class QualityCheckResult:
    check_name: str
    passed: bool
    details: str

class DataContractValidator:
    def __init__(self, contract_file: str):
        # Simulation du chargement du Data Contract
        self.allowed_currencies = {"EUR", "USD", "GBP"}
        self.allowed_statuses = {"SUCCESS", "FAILED", "PENDING"}

    def validate_dataset(self, records: List[Dict[str, Any]]) -> List[QualityCheckResult]:
        results = []
        total_records = len(records)

        if total_records == 0:
            return [QualityCheckResult("Dataset non vide", False, "Aucun enregistrement fourni.")]

        # Test 1 : Complétude transaction_id (Nullability)
        null_ids = sum(1 for r in records if not r.get("transaction_id"))
        p1 = (null_ids == 0)
        results.append(QualityCheckResult(
            "Complétude transaction_id", p1,
            f"{null_ids} enregistrements sans transaction_id sur {total_records}"
        ))

        # Test 2 : Unicité transaction_id (Uniqueness)
        ids = [r.get("transaction_id") for r in records if r.get("transaction_id")]
        duplicates = len(ids) - len(set(ids))
        p2 = (duplicates == 0)
        results.append(QualityCheckResult(
            "Unicité transaction_id", p2,
            f"{duplicates} doublons détectés sur transaction_id"
        ))

        # Test 3 : Validité des montants (business rule : amount_cents > 0)
        invalid_amounts = sum(1 for r in records if r.get("amount_cents", 0) <= 0)
        p3 = (invalid_amounts == 0)
        results.append(QualityCheckResult(
            "Validité des montants (> 0)", p3,
            f"{invalid_amounts} transactions avec un montant <= 0"
        ))

        # Test 4 : Conformité Enum Currency
        invalid_curr = sum(1 for r in records if r.get("currency") not in self.allowed_currencies)
        p4 = (invalid_curr == 0)
        results.append(QualityCheckResult(
            "Conformité Devise Enum (EUR/USD/GBP)", p4,
            f"{invalid_curr} enregistrements avec devise non autorisée"
        ))

        return results

    def print_report(self, records: List[Dict[str, Any]]):
        results = self.validate_dataset(records)
        all_passed = all(r.passed for r in results)

        print("=" * 65)
        print("  PARADIS DATA QUALITY ENGINE — VALIDATION DU DATA CONTRACT")
        print(f"  Lot de Données : {len(records)} enregistrements analysés")
        print("=" * 65)
        print()

        for r in results:
            icon = "✅ PASS" if r.passed else "❌ FAIL"
            print(f"  {icon} | {r.check_name:<35} → {r.details}")

        print("\n" + "─" * 65)
        if all_passed:
            print("  [✅ DATA CONTRACT RESPECTÉ] Le lot de données est conforme pour publication.")
        else:
            print("  [❌ DATA CONTRACT VIOLÉ] Publication bloquée par le pipeline de qualité.")
        print("=" * 65)


if __name__ == "__main__":
    # Lot de données de test (contenant 1 doublon et 1 montant négatif)
    test_records = [
        {"transaction_id": "UUID-001", "amount_cents": 1500, "currency": "EUR", "status": "SUCCESS"},
        {"transaction_id": "UUID-002", "amount_cents": 4200, "currency": "USD", "status": "SUCCESS"},
        {"transaction_id": "UUID-001", "amount_cents": 1000, "currency": "EUR", "status": "FAILED"},   # Doublon UUID-001
        {"transaction_id": "UUID-004", "amount_cents": -500, "currency": "EUR", "status": "SUCCESS"},   # Montant négatif invalide
    ]

    validator = DataContractValidator("payment-events-contract.yaml")
    validator.print_report(test_records)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Data Mesh** | Architecture de données décentralisée basée sur la propriété par domaine et la donnée comme produit |
| **Data Contract** | Spécification formelle définissant le schéma, la sémantique et les SLO d'un Data Product |
| **Data Product** | Unité autonome et consommable de données publiée par un domaine métier |
| **DDD** | Domain-Driven Design — Conception logicielle guidée par le domaine métier |
| **dbt** | Data Build Tool — Outil de transformation de données SQL dans l'écosystème analytics |

---

## Exercices Pratiques

### Exercice 1 — Architecture Data Mesh vs Data Lake

Comparez une architecture **Data Lake centralisée** et une architecture **Data Mesh** selon 3 critères : Propriétaire des données, Qualité des données et Scalabilité de l'organisation.

**Corrigé guidé :**
1. **Propriétaire des données** :
   - *Data Lake* : L'équipe Data centrale est propriétaire de toutes les tables (sans expertise métier).
   - *Data Mesh* : L'équipe produit du domaine (ex: Domaine Paiement, Domaine Logistique) est propriétaire de ses Data Products.
2. **Qualité des données** :
   - *Data Lake* : Découverte tardive des bugs de données par les Data Analysts en fin de chaîne.
   - *Data Mesh* : Qualité garantie à la source par le producteur via un **Data Contract** validé dans le pipeline CI/CD.
3. **Scalabilité de l'organisation** :
   - *Data Lake* : Goulot d'étranglement central (l'équipe Data sature au-delà de 10-15 domaines).
   - *Data Mesh* : Scalabilité linéaire (chaque nouveau domaine crée et gère ses propres Data Products en auto-service).

---

## Banque QCM — 5 Questions

**Q1.** Quel est le principe fondateur de l'architecture **Data Mesh** introduite par Zhamak Dehghani ?

- A) Centraliser toutes les données de l'entreprise dans une seule base Oracle.
- B) Décentraliser la responsabilité des données en confiant la propriété et la gestion des Data Products aux équipes métier du domaine (Domain Ownership). ✅
- C) Supprimer toutes les bases de données relationnelles.
- D) Remplacer les Data Analysts par des robots.

**Q2.** Dans le Data Mesh, que représente le concept de **Data as a Product (La Donnée comme Produit)** ?

- A) Vendre les données de l'entreprise sur un marché public.
- B) Traiter les ensembles de données analytiques comme des produits d'ingénierie complets, documentés, sécurisés et assortis de contrats de qualité (SLO). ✅
- C) Imprimer les rapports sur papier glacé.
- D) Chiffrer toutes les tables en Base64.

**Q3.** Qu'est-ce qu'un **Data Contract (Contrat de Données)** ?

- A) Le contrat de travail des Data Scientists.
- B) Un accord formel spécifié en code (ex: JSON Schema / YAML) définissant le schéma, la sémantique et les garanties de qualité (SLO) des données échangées entre un producteur et ses consommateurs. ✅
- C) Une licence de logiciel d'analyse.
- D) Un contrat d'assurance contre les fuites de données.

**Q4.** Dans le Data Mesh, quel est le rôle de l'équipe **Self-Serve Data Platform** ?

- A) Rédiger les requêtes SQL à la place des métiers.
- B) Fournir les outils et l'infrastructure d'auto-service (stockage, orchestration, gouvernance) permettant aux domaines de construire facilement leurs Data Products. ✅
- C) Valider chaque ligne de données manuellement.
- D) Gérer les sauvegardes sur bande magnétique.

**Q5.** Le composant **Federated Computational Governance** garantit que :

- A) Chaque domaine peut ignorer la réglementation RGPD.
- B) Les règles globales de sécurité, d'accès (IAM) et de conformité sont définies collectivement mais appliquées automatiquement par du code (Policy as Code) sur tous les Data Products. ✅
- C) Les données sont stockées uniquement en France.
- D) Les prix des produits sont fixes.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
