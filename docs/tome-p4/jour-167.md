# TOME P4 — Cloud, DevOps & SecOps — Jour 167 (6h) : Visualisation de Données & Outils BI (Power BI, Metabase, Superset & Tableaux de Bord Sécurisés)

> [!NOTE]
> **Objectif du jour :** Concevoir, déployer et sécuriser des tableaux de bord décisionnels pour le secteur bancaire : comparaison des plateformes BI d'entreprise (**Power BI**, **Metabase**, **Apache Superset**), principes de design de visualisation de données (Data Storytelling, choix des types de graphiques), et mise en place de la sécurité d'accès au niveau des lignes (**Row-Level Security - RLS**).
>
> **Compétences visées :** `BIT-05` (A) — Data Visualization & BI Platforms | `SEC-05` (A) — Row-Level Security (RLS) & Contrôle d'Accès BI

---

## 1) Module — Plateformes BI d'Entreprise : Power BI vs Metabase vs Apache Superset (2h)

### 📖 Narration/Intuition

Pour restituer les données financières aux cadres dirigeants de la Banque Centrale du Congo (BCC), l'équipe IT a le choix entre différentes plateformes de Business Intelligence.

1. **Power BI (Microsoft)** : La suite décisionnelle leader du marché commercial. Idéale pour l'intégration avec l'écosystème Windows/Azure et le langage DAX complexe.
2. **Metabase** : L'outil BI open-source le plus simple et intuitif. Il permet aux utilisateurs non-techniques de poser des questions en langage naturel sans connaître le SQL.
3. **Apache Superset** : La plateforme BI open-source haute performance développée par Airbnb. Conçue pour traiter des milliards de lignes connectées directement à Trino, ClickHouse ou Apache Druid.

### 🔍 Anatomie Technique

**Matrice Comparative des Outils BI :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       POWER BI vs METABASE vs APACHE SUPERSET               │
├──────────────┬───────────────────┬───────────────────┬──────────────────────┤
│ Critère      │ Power BI          │ Metabase          │ Apache Superset      │
├──────────────┼───────────────────┼───────────────────┼──────────────────────┤
│ Licence      │ Propriétaire      │ Open Source / AGPL│ Open Source (Apache) │
│ Déploiement  │ Cloud / On-Prem   │ Docker / K8s      │ Cloud Native (K8s)   │
│ Simplicité   │ Moyenne (DAX)     │ Très élevée (NoSQL│ Moyenne (SQL Studio) │
│ Scalabilité  │ Élevée            │ Moyenne           │ Extrême (Trino/K8s)  │
│ RLS Native   │ Oui (DAX RLS)     │ Oui (Enterprise)  │ Oui (SQL / Jinja)    │
└──────────────┴───────────────────┴───────────────────┴──────────────────────┘
```

---

## 2) Module — Sécurité d'Accès au Niveau des Lignes : Row-Level Security (RLS) (2h)

### 📖 Narration/Intuition

Le Directeur Régional de la BCC à Lubumbashi et le Directeur Régional de Goma ouvrent le **même tableau de bord BI**. Cependant, pour des raisons d'étanchéité et de confidentialité bancaire, le Directeur de Lubumbashi ne doit voir **que les transactions de sa province**, tandis que le Directeur de Goma ne voit que les siennes.

La **Row-Level Security (RLS)** filtre automatiquement les lignes de données retournées par le rapport BI en fonction de l'identité et du rôle de l'utilisateur connecté.

### 🔍 Anatomie Technique

**Mise en œuvre de la RLS dans Power BI (DAX) et PostgreSQL (SQL) :**

```sql
-- 1. Implémentation RLS native au niveau de la base de données PostgreSQL
ALTER TABLE fact_transactions ENABLE ROW LEVEL SECURITY;

-- 2. Création d'une politique RLS : Les directeurs ne voient que leur province
CREATE POLICY p_directeur_region_rls ON fact_transactions
    FOR SELECT
    TO role_directeur_regional
    USING (province_code = current_setting('app.current_user_province'));

-- 3. Implémentation RLS équivalente dans Power BI (Rôle DAX)
-- Nom du Rôle DAX : "DirecteurRegional_RLS"
-- Table filtrée : Dim_Agence
[Province] = USERPRINCIPALNAME()
```

---

## 3) Module — Laboratoire Pratique : Déploiement Metabase Docker & Dashboard (2h)

### 📖 Narration/Intuition

Déployons une instance souveraine de **Metabase** en conteneur Docker connectée à la base de données décisionnelle PostgreSQL de la BCC pour construire un tableau de bord financier exécutif.

### 🔍 Anatomie Technique

**Déploiement Metabase et Configuration Docker (`docker-compose-metabase.yml`) :**

```yaml
version: '3.8'

services:
  metabase_bi:
    image: metabase/metabase:v0.49.0
    container_name: bcc_metabase_bi
    ports:
      - "3000:3000"
    environment:
      MB_DB_TYPE: postgres
      MB_DB_DBNAME: metabase_backend_db
      MB_DB_PORT: 5432
      MB_DB_USER: metabase_admin
      MB_DB_PASS: SuperSecretMetabasePass2026!
      MB_DB_HOST: postgres_db
      MB_ENCRYPTION_SECRET_KEY: "BCC_Secret_Key_For_Database_Credentials"
    restart: always
    networks:
      - bcc_bi_network

networks:
  bcc_bi_network:
    driver: bridge
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **RLS** | Row-Level Security — Contrôle d'accès et filtrage de sécurité au niveau de la ligne |
| **BI** | Business Intelligence — Informatique décisionnelle d'entreprise |
| **AGPL** | Affero General Public License — Licence open-source pour logiciels réseau |
| **UPN** | User Principal Name — Identifiant unique de l'utilisateur connecté (email Active Directory) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi la mise en place de la **Row-Level Security (RLS)** directement au niveau du SGBD (PostgreSQL) est-elle considérée comme plus sûre que de la gérer uniquement au niveau de l'outil de restitution BI (Power BI) ?

**Corrigé :** Si la RLS est configurée uniquement dans l'application BI (Power BI), elle protège les rapports affichés dans cette application. Toutefois, si un développeur ou un utilisateur malveillant se connecte directement à la base de données sous-jacente avec un client SQL (DBeaver, psql) ou via une API REST, les règles de sécurité RLS de Power BI ne s'appliquent pas et l'utilisateur peut lire l'intégralité des données confidentielles. Lorsque la **RLS est implémentée directement dans le SGBD**, le moteur de base de données filtre les lignes à la source pour **tous les canaux d'accès** (BI, API, psql), garantissant une sécurité "Defense-in-Depth".

**Exercice 2 :** Quels sont les 3 principes fondamentaux du **Data Storytelling** lors du design d'un tableau de bord décisionnel destiné à la Haute Direction d'une banque ?

**Corrigé :** 
1. **Hiérarchie Visuelle (Loi des 5 secondes)** : Afficher les KPIs clés synthétiques de haut niveau en haut à gauche (zone de lecture prioritaire), puis les graphiques de tendance au milieu, et les tableaux de détail en bas.
2. **Choix Judicieux des Graphiques** : Utiliser des cartes de métriques pour les chiffres uniques, des graphiques en courbes (Line Charts) pour les évolutions temporelles, et des barres horizontales pour les comparaisons de catégories. Éviter les camemberts (Pie Charts) avec plus de 3 tranches (difficiles à comparer visuellement).
3. **Sobriété et Cohérence des Couleurs** : Utiliser une palette de couleurs restreinte et fonctionnelle (ex: Vert = Conforme/Croissance, Rouge = Alerte/Fraude, Gris = Neutre) pour ne pas surcharger la charge cognitive de l'utilisateur.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle fonctionnalité de sécurité permet d'afficher automatiquement des données différentes sur un même tableau de bord BI selon l'identité et la région de l'utilisateur connecté ?
- A) Row-Level Security (RLS)
- B) Auto-Save
- C) Dark Mode
- D) Export PDF

**Réponse : A**

**Q2 :** Quelle plateforme BI open-source s'illustre par sa très grande simplicité d'utilisation et permet aux utilisateurs métier de poser des questions en langage naturel ?
- A) Metabase
- B) Oracle Exadata
- C) MS Paint
- D) Photoshop

**Réponse : A**

**Q3 :** Dans PostgreSQL, quelle instruction SQL permet d'activer le filtrage de sécurité au niveau des lignes sur une table confidentielle ?
- A) `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- B) `DROP TABLE table_name;`
- C) `DELETE FROM table_name;`
- D) `SELECT * FROM table_name;`

**Réponse : A**

**Q4 :** Quel type de graphique est le plus adapté pour représenter l'évolution du volume de transactions financières au fil du temps (sur 12 mois) ?
- A) Graphique en courbes (Line Chart)
- B) Camembert à 50 tranches
- C) Nuage de points aléatoires
- D) Image GIF animée

**Réponse : A**

**Q5 :** Quelle plateforme BI open-source d'origine Airbnb est conçue pour l'analyse à très grande échelle connectée à des moteurs comme Trino et ClickHouse ?
- A) Apache Superset
- B) Windows Media Player
- C) Calculator
- D) Notepad

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
