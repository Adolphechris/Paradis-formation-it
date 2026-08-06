# TOME P4 — Cloud, DevOps & SecOps — Jour 166 (6h) : Business Intelligence & Modélisation OLAP Avancée (Cube OLAP, DAX / MDX & Métriques Financières)

> [!NOTE]
> **Objectif du jour :** Maîtriser la modélisation analytique avancée pour la Business Intelligence (BI) bancaire : conception de Cubes OLAP multidimensionnels (MOLAP, ROLAP, HOLAP), langage de requêtes et de calcul **DAX (Data Analysis Expressions)**, hiérarchies temporelles et métriques de performance financière (KPIs, Solde Moyen, Ratios de Liquidité).
>
> **Compétences visées :** `BIT-05` (A) — Business Intelligence & OLAP Modeling | `BIT-04` (A) — DAX Calculations & Financial Analytics

---

## 1) Module — Cubes OLAP Multidimensionnels : MOLAP vs ROLAP vs HOLAP (2h)

### 📖 Narration/Intuition

Dans une banque centrale comme la BCC, les directeurs ne veulent pas seulement voir le total des transactions par agence. Ils veulent pouvoir naviguer instantanément dans les données à travers plusieurs dimensions : **Par Année -> Par Mois -> Par Agence -> Par Type de Transaction -> Par Devise**.

Un **Cube OLAP Multidimensionnel** pré-calcule et pré-agrège les croisements de données le long de ces axes de dimensions, permettant des opérations de **Drill-Down** (zoom sur le détail), **Roll-Up** (agrégation de haut niveau) et **Slice & Dice** (découpage par sous-ensembles) en quelques millisecondes.

### 🔍 Anatomie Technique

**Opérations Fondamentales sur un Cube OLAP :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          OPÉRATIONS CUBE OLAP MULTIDIMENSIONNEL             │
├──────────────┬──────────────────────────────────────────────────────────────┤
│ Drill-Down   │ Passer d'un niveau d'agrégation haut vers le détail.        │
│              │ (Ex: Passer du volume annuel 2026 au volume du mois d'Août). │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Roll-Up      │ Opération inverse. Remonter du détail vers l'agrégation.     │
│              │ (Ex: Agréger toutes les agences de Kinshasa au niveau National)│
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Slice        │ Filtrer sur une seule valeur d'une dimension (une tranche).  │
│              │ (Ex: Filtrer uniquement la dimension Devise = 'CDF').        │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Dice         │ Extraire un sous-cube en filtrant sur plusieurs dimensions.  │
│              │ (Ex: Devise = 'USD' AND Région = 'Katanga' AND Année = 2026).│
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Langage DAX (Data Analysis Expressions) & Calculs Financiers (2h)

### 📖 Narration/Intuition

Dans les outils BI modernes (Power BI, SSAS), le langage **DAX (Data Analysis Expressions)** permet de calculer des métriques dynamiques en fonction du contexte de filtre sélectionné par l'utilisateur sur son tableau de bord.

Contrairement aux formules Excel basées sur des coordonnées de cellules (`A1 + B1`), DAX travaille sur des **Colonnes et des Tables** entières avec la notion de **Context Transition** (Contexte de Ligne vs Contexte de Filtre).

### 🔍 Anatomie Technique

**Formules DAX Financières Clés pour la BCC :**

```dax
// 1. Mesure de base : Total du volume de transactions en CDF
Volume_Total_CDF = 
SUMX(
    FILTER(Fact_Transactions, Fact_Transactions[Devise] = "CDF"),
    Fact_Transactions[Montant]
)

// 2. Mesure Time Intelligence : Comparaison avec le même mois de l'année précédente (YoY)
Volume_Meme_Mois_Annee_Precedente = 
CALCULATE(
    [Volume_Total_CDF],
    SAMEPERIODLASTYEAR(Dim_Temps[Date])
)

// 3. Calcul de la croissance en pourcentage (Year-over-Year Growth %)
Croissance_Volume_YoY_% = 
DIVIDE(
    [Volume_Total_CDF] - [Volume_Meme_Mois_Annee_Precedente],
    [Volume_Meme_Mois_Annee_Precedente],
    0
)

// 4. Cumul Annuel à Date (Year-To-Date - YTD)
Volume_Cumule_YTD = 
TOTALYTD(
    [Volume_Total_CDF],
    Dim_Temps[Date]
)
```

---

## 3) Module — Laboratoire Pratique : Construction d'un Modèle Étoile BI (2h)

### 📖 Narration/Intuition

Construisons un modèle de données décisionnel en étoile optimisé pour la Business Intelligence financière, reliant la table de faits `Fact_Transactions` aux dimensions `Dim_Temps`, `Dim_Agence` et `Dim_Client`.

### 🔍 Anatomie Technique

**Schéma SQL du Modèle Étoile BI (`star_schema_bi.sql`) :**

```sql
-- Modèle Décisionnel en Étoile pour Power BI / Metabase

-- 1. Dimension Temps (Table de hiérarchie temporelle)
CREATE TABLE Dim_Temps (
    date_key INT PRIMARY KEY, -- Format YYYYMMDD (ex: 20260806)
    date_complete DATE NOT NULL,
    annee INT NOT NULL,
    trimestre VARCHAR(2) NOT NULL,
    mois INT NOT NULL,
    nom_mois VARCHAR(20) NOT NULL,
    jour INT NOT NULL,
    est_jour_ouvrable BOOLEAN DEFAULT TRUE
);

-- 2. Dimension Agences
CREATE TABLE Dim_Agence (
    agence_key INT PRIMARY KEY,
    code_agence VARCHAR(10) NOT NULL,
    nom_agence VARCHAR(100) NOT NULL,
    province VARCHAR(50) NOT NULL,
    zone_geographique VARCHAR(50) NOT NULL
);

-- 3. Table de Faits des Transactions Financières (OLAP)
CREATE TABLE Fact_Transactions (
    transaction_id BIGINT PRIMARY KEY,
    date_key INT REFERENCES Dim_Temps(date_key),
    agence_key INT REFERENCES Dim_Agence(agence_key),
    montant NUMERIC(15,2) NOT NULL,
    frais_transaction NUMERIC(10,2) NOT NULL,
    devise VARCHAR(3) NOT NULL,
    temps_traitement_ms INT NOT NULL
);
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DAX** | Data Analysis Expressions — Langage de requêtes et de calcul analytique (Power BI / SSAS) |
| **KPI** | Key Performance Indicator — Indicateur clé de performance métier |
| **MOLAP** | Multidimensional OLAP — Stockage OLAP sous forme de cube binaire pré-calculé |
| **ROLAP** | Relational OLAP — Stockage OLAP directement sous forme de schéma en étoile dans un SGBDR |
| **YTD** | Year-To-Date — Cumul d'une métrique depuis le début de l'année civile en cours |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est la différence majeure entre le langage **DAX** et le langage **SQL** dans le cadre d'un projet de Business Intelligence ?

**Corrigé :** **SQL** est un langage déclaratif conçu pour interroger et manipuler des ensembles de données relationnelles stockés en base. Les jointures et agrégations doivent être explicitement écrites dans la requête (`GROUP BY`, `JOIN`). **DAX** est un langage de formules basé sur des modèles multidimensionnels (Power BI). La puissance de DAX réside dans la gestion automatique et dynamique des **Contextes de Filtre** : une même mesure DAX (ex: `[Volume_Total]`) recalculera automatiquement sa valeur selon les filtres sélectionnés visuellement par l'utilisateur sur le tableau de bord (par année, par agence ou par produit), sans avoir à réécrire la requête.

**Exercice 2 :** Dans la modélisation d'un cube OLAP, pourquoi est-il indispensable de créer une **Dimension Temps (`Dim_Temps`)** dédiée au lieu d'utiliser simplement la colonne date standard de la table de faits ?

**Corrigé :** Une colonne date standard dans la table de faits ne contient que les dates auxquelles une transaction a eu lieu (s'il n'y a pas eu de transaction le dimanche 3 août, la date est absente). La **Dimension Temps** dédiée contient **l'intégralité continue des jours du calendrier**, avec tous les attributs hiérarchiques utiles (Trimestre, Nom du mois, Numéro de semaine, Indicateur de jour férié/ouvrable). Elle est indispensable pour exécuter les fonctions de **Time Intelligence** (comparaison avec l'année précédente `SAMEPERIODLASTYEAR`, cumul annuel `TOTALYTD`) et pour éviter les trous dans les graphiques temporels.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle opération sur un Cube OLAP multidimensionnel permet de passer d'un niveau d'agrégation élevé vers un niveau de détail plus fin (ex: passer de l'échelle Annuelle à l'échelle Mensuelle) ?
- A) Drill-Down
- B) Roll-Up
- C) Delete
- D) Format

**Réponse : A**

**Q2 :** Quel langage de calcul analytique est utilisé dans Power BI et Microsoft SSAS pour créer des mesures dynamiques et des indicateurs de performance financiers ?
- A) DAX (Data Analysis Expressions)
- B) HTML5
- C) Bash
- D) Assembly

**Réponse : A**

**Q3 :** En Time Intelligence DAX, quelle fonction permet de calculer le cumul d'une métrique depuis le 1er janvier de l'année en cours jusqu'à la date sélectionnée (YTD) ?
- A) `TOTALYTD()`
- B) `SUM()`
- C) `COUNT()`
- D) `NOW()`

**Réponse : A**

**Q4 :** Quel type d'architecture OLAP stocke le cube de données sous forme de schéma en étoile directement dans une base de données relationnelle ?
- A) ROLAP (Relational OLAP)
- B) MOLAP
- C) FLOP
- D) SWAP

**Réponse : A**

**Q5 :** Dans la modélisation décisionnelle en étoile, quel est le rôle de la table `Dim_Temps` ?
- A) Fournir une référence calendaire continue et structurée (Année, Mois, Jour, Trimestre) indispensable aux calculs de Time Intelligence
- B) Stocker les numéros de téléphone des clients
- C) Formater le disque dur
- D) Héberger les images du site web

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
