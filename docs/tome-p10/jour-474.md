# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 474 (6h) : Data Engineering pour le ML : Versioning de Données (DVC), Traitement du Déséquilibre (SMOTE), Données Synthétiques (SDV) & Validation (Great Expectations)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le versioning de volumineux jeux de données et d'artefacts avec **DVC (Data Version Control)**
> - Traiter le déséquilibre extrême des classes via le sur-échantillonnage synthétique **SMOTE** et le pondérage de perte (**Class Weighting**)
> - Générer des jeux de données synthétiques réalistes et préservant la confidentialité avec **SDV (Synthetic Data Vault)**
> - Implémenter des contrôles automatiques de qualité des données avec des suites de validation **Great Expectations**
>
> **Compétences visées :** `DATA-01` (A) — Data Engineering for Machine Learning & Quality Control

---

## Module 1 — Versioning de Données avec DVC & Traitement du Déséquilibre (2h)

### 📖 Intuition & Narration

Git est l'outil universel de versioning du code source, mais il s'effondre lorsque l'on tente d'y commiter des fichiers de données de plusieurs Gigaoctets ou Teraoctets. **DVC (Data Version Control)** résout ce problème en agissant comme un "Git pour les données" : il remplace les gros fichiers par de petits fichiers pointeurs `.dvc` (contenant des hashes MD5) commités dans Git, tandis que les données réelles sont poussées vers un stockage distant (AWS S3, MinIO, Google Cloud Storage).

Par ailleurs, les jeux de données du monde réel (détection de fraudes, diagnostic de pannes, intrusions réseau) souffrent quasi-systématiquement d'un **déséquilibre extrême des classes** (ex: $99.9\%$ de trafic normal pour $0.1\%$ d'attaques). Un modèle entraîné naïvement obtiendra $99.9\%$ de précision en prédisant toujours la classe majoritaire, tout en manquant $100\%$ des menaces réelles.

### 🔍 Anatomie Technique — Algorithme SMOTE (Synthetic Minority Over-sampling Technique)

```
ALGORITHME SMOTE (Chawla et al. 2002)

  Plutôt que d'effectuer un simple sur-échantillonnage par duplication (qui cause du sur-apprentissage),
  SMOTE génère de NOUVELLES instances synthétiques dans l'espace des caractéristiques :

  1. Pour chaque échantillon x_i de la classe minoritaire :
  2. Obtenir ses k plus proches voisins dans la classe minoritaire (k-NN).
  3. Choisir aléatoirement un voisin x_nn.
  4. Créer un nouvel échantillon synthétique x_new sur le segment reliant x_i et x_nn :

     x_new = x_i + λ * (x_nn - x_i)     où λ ~ Uniforme(0, 1)

  RESULTAT : Extension continue de la frontière de la classe minoritaire sans duplication exacte !
```

---

## Module 2 — Atelier Pratique : SMOTE & Validation avec Great Expectations (2h)

### 🛠️ Script Python : Équilibrage par SMOTE et Validation des Données

```python
#!/usr/bin/env python3
"""
PARADIS — Traitement du Déséquilibre de Classes par SMOTE et Validation Great Expectations
"""

import numpy as np
import pandas as pd
from collections import Counter

def run_data_engineering_demo():
    print("[*] --- DÉMONSTRATION DATA ENGINEERING ML PARADIS IT ---")

    # 1. Génération d'un jeu de données très déséquilibré (1% de fraudes)
    np.random.seed(42)
    n_samples = 1000
    n_fraud = 20

    X_normal = np.random.normal(loc=0.0, scale=1.0, size=(n_samples - n_fraud, 4))
    X_fraud = np.random.normal(loc=3.0, scale=1.5, size=(n_fraud, 4))

    X = np.vstack([X_normal, X_fraud])
    y = np.array([0] * (n_samples - n_fraud) + [1] * n_fraud)

    print(f"\n[1] Distribution Initiale des Classes : {dict(Counter(y))}")
    print(f"    Ratio de la classe minoritaire : {n_fraud / n_samples * 100:.1f}%")

    # 2. Application de SMOTE (Synthetic Minority Over-sampling Technique)
    try:
        from imblearn.over_sampling import SMOTE
        smote = SMOTE(random_state=42)
        X_resampled, y_resampled = smote.fit_resample(X, y)
        print(f"\n[+] Distribution APRÈS Équilibrage SMOTE : {dict(Counter(y_resampled))}")
        print(f"    Nombre total d'échantillons générés : {len(y_resampled)}")
    except ImportError:
        print("\n[!] Bibliothèque 'imblearn' non installée (pip install imbalanced-learn). Mode démo.")
        print("    [+] Simulation SMOTE : 980 instances classe 0 et 980 instances classe 1 générées.")

    # 3. Validation de la Qualité des Données (Great Expectations / Pydantic Checks)
    print("\n[3] Validation de la Qualité des Données (Great Expectations / Checks)...")
    df = pd.DataFrame(X, columns=["feat_1", "feat_2", "feat_3", "feat_4"])

    # Vérification des règles d'intégrité
    checks = {
        "Pas de valeurs manquantes (Null)": df.isnull().sum().sum() == 0,
        "Nombre de colonnes égal à 4": df.shape[1] == 4,
        "Valeurs extrêmes dans les bornes [-10, 10]": (df.min().min() >= -10.0) and (df.max().max() <= 10.0)
    }

    for check_name, passed in checks.items():
        print(f"    • Check '{check_name:42s}' : {'✅ VALIDÉ' if passed else '❌ ÉCHEC'}")

if __name__ == "__main__":
    run_data_engineering_demo()
```

---

## Module 3 — Workflow DVC (Data Version Control) (1h30)

### 🔍 Commandes et Architecture DVC

```bash
# WORKFLOW DVC (Data Version Control) INTEGRÉ À GIT

# 1. Initialiser DVC dans un dépôt Git existant
dvc init

# 2. Configurer le stockage distant (Remote Storage S3 / MinIO)
dvc remote add -d myremote s3://paradis-ml-data-bucket/dvc-store
dvc remote modify myremote endpointurl https://minio.paradis.internal:9000

# 3. Ajouter un jeu de données volumineux au suivi DVC
dvc add data/raw_logs_2026.csv

# Résultat : DVC crée data/raw_logs_2026.csv.dvc et ajoute data/raw_logs_2026.csv dans .gitignore !

# 4. Commiter les pointeurs .dvc dans Git
git add data/raw_logs_2026.csv.dvc .gitignore
git commit -m "feat(data): track raw_logs_2026.csv (v1.0 - 15GB)"

# 5. Pousser les données volumineuses vers le stockage distant S3/MinIO
dvc push

# 6. Récupérer les données exactes sur une autre machine de développeur
git checkout main
dvc pull
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DVC** | Data Version Control — Outil de versioning de fichiers de données et modèles volumineux |
| **SMOTE** | Synthetic Minority Over-sampling Technique — Génération d'échantillons synthétiques par k-NN |
| **SDV** | Synthetic Data Vault — Écosystème de génération de tables synthétiques multi-tables |
| **CVAT** | Computer Vision Annotation Tool — Outil open-source d'annotation d'images et de vidéos |
| **MD5** | Message Digest Algorithm 5 — Algorithme de hachage utilisé par DVC pour identifier les artefacts |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Pondération des Pertes (Class Weighting)

Un problème de classification binaire contient $N_{total} = 10\,000$ échantillons, dont $N_0 = 9\,500$ exemples de la classe 0 (normale) et $N_1 = 500$ exemples de la classe 1 (anomalie).
Pour compenser ce déséquilibre dans la fonction de perte Cross-Entropy sans modifier le dataset, on utilise la formule de pondération inverse des fréquences :

$$w_c = \frac{N_{total}}{2 \times N_c}$$

1. Calculez la valeur du poids $w_0$ pour la classe majoritaire.
2. Calculez la valeur du poids $w_1$ pour la classe minoritaire.
3. Quel est l'effet de ces poids lors de l'apprentissage par descente de gradient ?

**Corrigé guidé :**
1. **Poids $w_0$** :
   $$w_0 = \frac{10\,000}{2 \times 9\,500} = \frac{10\,000}{19\,000} \approx 0.5263$$
2. **Poids $w_1$** :
   $$w_1 = \frac{10\,000}{2 \times 500} = \frac{10\,000}{1\,000} = 10.0$$
3. **Effet sur l'apprentissage** :
   Une erreur de classification sur un exemple de la classe minoritaire (anomalie) produit une perte **19 fois plus élevée** ($10.0 / 0.5263 = 19$) qu'une erreur sur la classe majoritaire, forçant l'optimiseur à accorder autant d'importance aux erreurs sur la classe minoritaire.

---

## Banque QCM — 5 Questions

**Q1.** Comment l'outil **DVC (Data Version Control)** parvient-il à versionner des jeux de données de plusieurs Gigaoctets sans alourdir le dépôt Git ?

- A) En compressant les données en format ZIP dans Git.
- B) En remplaçant les fichiers de données réels par de petits fichiers pointeurs texte `.dvc` (contenant le hash MD5) commités dans Git, tandis que les données réelles sont stockées dans un DVC Remote (S3/MinIO). ✅
- C) En supprimant les anciennes versions.
- D) En convertissant les données en code Python.

**Q2.** Quelle est la différence majeure entre le sur-échantillonnage aléatoire classique (Random Over-sampling) et la technique **SMOTE** ?

- A) SMOTE supprime des données de la classe majoritaire.
- B) Le sur-échantillonnage classique duplique à l'identique des échantillons existants (risquant le sur-apprentissage), tandis que SMOTE crée de nouveaux échantillons synthétiques uniques par interpolation linéaire entre k plus proches voisins. ✅
- C) SMOTE ne fonctionne que sur Windows.
- D) SMOTE modifie les labels des données.

**Q3.** La commande `dvc push` permet de :

- A) Commiter le code sur GitHub.
- B) Envoyer les fichiers lourds de données et de modèles suivis par DVC vers le stockage distant configuré (S3, MinIO, GCS). ✅
- C) Exécuter les tests unitaires PyTest.
- D) Redémarrer le cluster Kubernetes.

**Q4.** Dans quel cas l'utilisation de la technique du **Class Weighting (Pondération des pertes)** est-elle préférable à SMOTE ?

- A) Lorsque le jeu de données est extrêmement volumineux et que l'on souhaite éviter d'augmenter artificiellement la taille de la mémoire RAM en créant de nouveaux échantillons. ✅
- B) Lorsque l'on ne dispose d'aucun GPU.
- C) Lorsque toutes les classes sont parfaitement équilibrées.
- D) Lorsque le modèle est un arbre de décision à 1 seule couche.

**Q5.** À quoi sert la bibliothèque **Great Expectations** dans un pipeline de Data Engineering ML ?

- A) À générer des images synthétiques avec Stable Diffusion.
- B) À définir et exécuter des suites de tests automatisés (assertions) garantissant la qualité, la conformité et l'intégrité des jeux de données avant l'entraînement. ✅
- C) À remplacer la base de données PostgreSQL.
- D) À accélérer le temps de compilation C++.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
