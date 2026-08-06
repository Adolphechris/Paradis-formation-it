# TOME P4 — Cloud, DevOps & SecOps — Jour 165 (6h) : Observabilité, Lineage de Données & Qualité de Données (Data Mesh, OpenLineage, Great Expectations & Data Security)

> [!NOTE]
> **Objectif du jour :** Mettre en place la gouvernance, l'observabilité et le contrôle de qualité d'une plateforme de données bancaire d'entreprise : principes du **Data Mesh** (Données en tant que produit, propriété décentralisée), traçabilité et provenance des données (**Data Lineage avec OpenLineage / Marquez**), validation automatique de la qualité des données (**Great Expectations**) et conformité RGPD / Protection des données sensibles (Anonymisation, Pseudonymisation, Data Masking).
>
> **Compétences visées :** `BIT-05` (A) — Data Governance & Lineage | `SEC-05` (A) — Data Quality, Privacy & RGPD Compliance

---

## 1) Module — Data Mesh & Gouvernance de Données Moderne (2h)

### 📖 Narration/Intuition

Dans une organisation bancaire géante avec des dizaines de départements (Monétique, Crédit, Risques, Compliance), centraliser la gestion de toutes les données chez une seule équipe "Data" crée un goulot d'étranglement majeur. L'équipe centrale ne comprend pas le métier du Risque ou de la Monétique et met des mois à fournir de nouveaux tableaux de bord.

Le **Data Mesh (Maillage de Données)** est un paradigme d'architecture organisationnelle et technique fondé sur 4 piliers :
1. **Domain Ownership** : La responsabilité des données est décentralisée auprès des équipes métier qui produisent la donnée.
2. **Data as a Product** : Chaque domaine traite ses données comme un produit logiciel de première classe (qualité, documentation, SLA).
3. **Self-Serve Data Infrastructure** : L'équipe Platform fournit l'infrastructure sous forme de service automatisé.
4. **Federated Computational Governance** : Les règles de sécurité et de conformité sont appliquées automatiquement de manière fédérée.

### 🔍 Anatomie Technique

**Architecture des 4 Piliers du Data Mesh :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA MESH ARCHITECTURE                             │
├──────────────────┬──────────────────┬──────────────────┬────────────────────┤
│ DOMAINE MONÉTIQUE│ DOMAINE CRÉDITS  │ DOMAINE RISQUES  │ PLATFORM DATA INFRA│
│ Data Product 1   │ Data Product 2   │ Data Product 3   │ (Self-Serve Infra) │
│ (Transactions)   │ (Dossiers Pret)  │ (Scores Fraud)   │ Storage, IAM, CI/CD│
└────────┬─────────┴────────┬─────────┴────────┬─────────┴─────────▲──────────┘
         │                  │                  │                   │
         └──────────────────┴─────────┬────────┴───────────────────┘
                                      │
                         ┌────────────▼───────────┐
                         │ GOUVERNANCE FÉDÉRÉE    │
                         │ OpenLineage / Security │
                         └────────────────────────┘
```

---

## 2) Module — Traçabilité & Data Lineage (OpenLineage & Marquez) (2h)

### 📖 Narration/Intuition

Lorsqu'un rapport financier soumis à la Banque Centrale comporte une erreur de chiffre de 10 millions USD, comment savoir d'où provient l'erreur ? Est-ce la source PostgreSQL, le script d'extraction Airflow, le modèle Spark ou la vue ClickHouse ?

Le **Data Lineage (Traçabilité de la Donnée)** permet de cartographier et de visualiser en temps réel l'arbre généalogique complet de chaque donnée, de son émission à sa consommation finale.

### 🔍 Anatomie Technique

**Intégration d'OpenLineage dans un Pipeline Airflow/Spark :**

```python
# OpenLineage capture automatiquement les métadonnées de provenance
# (Inputs, Outputs, Schema, Code Version, Execution Time)
# et les envoie au serveur de visualisation Marquez.

# Exemple de métadonnées de Lineage générées automatiquement :
{
  "eventType": "COMPLETE",
  "eventTime": "2026-08-06T22:16:00Z",
  "job": {
    "namespace": "bcc_banking_prod",
    "name": "spark_daily_settlement_job"
  },
  "inputs": [
    {
      "namespace": "s3://bcc-lakehouse-prod",
      "name": "raw/rtgs_transactions"
    }
  ],
  "outputs": [
    {
      "namespace": "s3://bcc-lakehouse-prod",
      "name": "gold/daily_bank_settlement"
    }
  ]
}
```

---

## 3) Module — Laboratoire Pratique : Data Quality & Data Masking (2h)

### 📖 Narration/Intuition

En vertu des lois sur la protection de la vie privée (RGPD / Lois de Protection des Données Personnelles), les développeurs et analystes ne doivent **jamais** voir les véritables numéros de cartes de paiement, mots de passe ou soldes confidentiels dans les environnements de test ou de reporting.

### 🔍 Anatomie Technique

**1. Validation de la Qualité de Données avec `Great Expectations` (Python) :**

```python
#!/usr/bin/env python3
"""
data_quality_validation.py — Validation automatique des règles de qualité avec Great Expectations
"""
import great_expectations as ge

# Charger un batch de données de transactions
df = ge.read_csv("data/transactions_sample.csv")

# Définir des assertions strictes de qualité de données (Suite de test de données)
df.expect_column_values_to_not_be_null(column="transaction_id")
df.expect_column_values_to_be_unique(column="transaction_id")
df.expect_column_values_to_be_between(column="montant", min_value=0.01, max_value=5000000.00)
df.expect_column_values_to_match_regex(column="devise", regex="^(CDF|USD|EUR)$")

# Exécuter la suite de validation
results = df.validate()

if not results["success"]:
    raise ValueError(⚠️ "ALERTE QUALITÉ DE DONNÉES : Les données ingérées contiennent des erreurs de conformité !")
else:
    print("✅ QUALITÉ DE DONNÉES VALIDÉE : 100% conforme aux attentes métier.")
```

**2. Masquage et Anonymisation de Données Sensibles (Data Masking) :**

```sql
-- PostgreSQL Dynamic Data Masking pour la conformité RGPD
CREATE OR REPLACE FUNCTION fn_mask_iban(p_iban VARCHAR) 
RETURNS VARCHAR AS $$
BEGIN
    -- Masquer l'IBAN : Garder uniquement les 4 premiers et 4 derniers caractères
    -- Exemple: "CD5912345678901234567890" -> "CD59****************7890"
    RETURN SUBSTRING(p_iban FROM 1 FOR 4) || REPEAT('*', LENGTH(p_iban) - 8) || RIGHT(p_iban, 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Vue anonymisée pour les analystes BI
CREATE VIEW v_comptes_anonymises AS
SELECT 
    compte_id,
    fn_mask_iban(numero_iban) AS numero_iban_masque,
    solde,
    statut
FROM comptes;
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Data Lineage** | Traçabilité de la provenance et du parcours des données dans le SI |
| **Data Mesh** | Architecture organisationnelle décentralisée traitant la donnée comme un produit |
| **RGPD** | Règlement Général sur la Protection des Données — Cadre légal de confidentialité |
| **PII** | Personally Identifiable Information — Données personnelles identifiables (Nom, IBAN, Email) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence entre **l'Anonymisation** et la **Pseudonymisation** des données personnelles (PII) dans le cadre de la conformité RGPD ?

**Corrigé :** **L'Anonymisation** est un traitement irréversible qui détruit définitivement tout lien entre la donnée et l'individu physique (ex: remplacer l'âge exact par des tranches d'âge "25-34 ans" ou appliquer un masquage destructeur). Une donnée anonymisée n'est plus considérée comme une donnée personnelle. La **Pseudonymisation** remplace un identifiant direct par un pseudonyme (ex: remplacer le nom par un hash SHA-256 ou un UUID unique), mais conserve une table de correspondance secrète séparée. Il est possible de ré-identifier l'individu en possédant la clé de déchiffrement. La pseudonymisation reste soumise au RGPD.

**Exercice 2 :** Pourquoi la mise en place d'un outil de **Data Lineage** (ex: OpenLineage) est-elle devenue obligatoire pour les banques sous la réglementation bancaire BCBS 239 (Risk Data Aggregation) ?

**Corrigé :** La directive **BCBS 239** oblige les institutions bancaires systémiques à être capables de prouver l'exactitude absolue des données de risque présentées dans les rapports réglementaires. En cas de crise financière, la banque doit pouvoir justifier la provenance exacte de chaque chiffre jusqu'à la transaction source d'origine. Un outil de **Data Lineage** capture automatiquement les métadonnées d'exécution de tous les pipelines (ETL, Spark, SQL) et génère le graphe de dépendance complet, permettant de prouver l'intégrité de la chaîne de traitement aux auditeurs et régulateurs bancaires.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le principe fondamental du paradigme d'architecture **Data Mesh** qui responsabilise les équipes métier sur la qualité et la documentation de leurs propres données ?
- A) Data as a Product (La donnée considérée comme un produit logiciel de 1ère classe)
- B) Centralisation de toutes les données dans un seul fichier Excel
- C) Suppression des bases de données
- D) Interdiction du SQL

**Réponse : A**

**Q2 :** Quel terme désigne la cartographie et la visualisation complète de la provenance, de l'origine et des transformations d'une donnée à travers tout le système d'information ?
- A) Data Lineage (Traçabilité des données)
- B) Data Mining
- C) Data Entry
- D) Data Storage

**Réponse : A**

**Q3 :** Quel outil open-source Python permet de définir des suites d'assertions automatisées pour valider la qualité des données (non-nullité, plages de valeurs, formats) avant leur ingestion ?
- A) Great Expectations
- B) MS Paint
- C) Notepad
- D) Word

**Réponse : A**

**Q4 :** Quelle technique de sécurité des données remplace les numéros de compte ou les IBAN par des masques de caractères (ex: `CD59********7890`) pour empêcher la fuite de PII dans les rapports BI ?
- A) Data Masking (Masquage de données)
- B) Supprimer la base de données
- C) Imprimer sur papier
- D) Redémarrer le serveur

**Réponse : A**

**Q5 :** Quel standard open-source permet de capturer automatiquement les métadonnées de provenance (Inputs, Outputs, Code version) à l'exécution de jobs Spark, Airflow ou Flink ?
- A) OpenLineage
- B) HTML5
- C) CSS3
- D) MP3

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
