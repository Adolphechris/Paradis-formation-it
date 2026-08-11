# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 473 (6h) : AutoML & Neural Architecture Search (NAS) : Optimisation Bayésienne (Optuna), Pruning d'Essais (TPE) & DARTS

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre les principes de l'**AutoML** et les algorithmes d'optimisation d'hyperparamètres (Grid Search, Random Search, Bayesian Optimization)
> - Maîtriser le fonctionnement du samplé **TPE (Tree-structured Parzen Estimator)** et des pruners d'essais (MedianPruner)
> - Implémenter une étude d'optimisation automatisée complexe avec **Optuna** pour modèles PyTorch / XGBoost
> - Explorer la recherche d'architectures de réseaux de neurones (**Neural Architecture Search — NAS**) et la méthode différentiable **DARTS**
>
> **Compétences visées :** `AI-03` (A) — Automated Machine Learning & Hyperparameter Tuning

---

## Module 1 — Principes de l'AutoML & Optimisation Bayésienne (2h)

### 📖 Intuition & Narration

La recherche manuelle d'hyperparamètres (nombre de couches, taux d'apprentissage, weight decay, taille de batch) s'apparente à une quête à l'aveugle dans un espace à haute dimension. La recherche par grille (Grid Search) souffre de la **malédiction de la dimensionnalité**, tandis que la recherche aléatoire (Random Search) manque de mémoire.

L'**Optimisation Bayésienne** traite l'évaluation des hyperparamètres comme l'optimisation d'une fonction boîte noire inconnue $f(\theta)$. Elle construit un modèle probabiliste substitut (**Surrogate Model**, souvent un Processus Gaussien ou un TPE) de la fonction d'objectif et utilise une **Fonction d'Acquisition** (ex: Expected Improvement - EI) pour décider intelligemment du *prochain* jeu d'hyperparamètres à tester.

### 🔍 Anatomie Technique — Algorithme TPE (Tree-structured Parzen Estimator)

```
ALGORITHME TPE DANS OPTUNA

  Plutôt que d'estimer P(y | θ) via un Processus Gaussien,
  TPE modélise P(θ | y) en séparant les essais en deux distributions :

            P(θ | y) = l(θ)   si y < y*  (Les BONS essais dans les meilleurs α%)
            P(θ | y) = g(θ)   si y >= y* (Les MAUVAIS essais)

  Fonction d'Acquisition Expected Improvement (EI) :
  EI(θ) = ∫_{-∞}^{y*} (y* - y) P(y|θ) dy  ∝  l(θ) / g(θ)

  PRINCIPE D'ÉCHANTILLONNAGE :
  Optuna choisit la valeur d'hyperparamètre θ qui maximisera le ratio l(θ) / g(θ),
  c'est-à-dire une valeur très probable chez les bons essais et peu probable chez les mauvais !
```

---

## Module 2 — Atelier Pratique : Optimisation d'Hyperparamètres avec Optuna (2h)

### 🛠️ Code Python : Étude d'Optimisation Optuna avec Pruning d'Essais Inefficaces

```python
#!/usr/bin/env python3
"""
PARADIS — Étude AutoML Complète avec Optuna, Sampler TPE et Pruning Dynamique
Optimisation d'un classificateur de sécurité réseau XGBoost / PyTorch.
"""

import optuna
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split

# Désactiver les logs verbeux d'Optuna
optuna.logging.set_verbosity(optuna.logging.WARNING)

def objective(trial: optuna.Trial) -> float:
    # 1. Espace de recherche des hyperparamètres (Search Space)
    n_estimators = trial.suggest_int("n_estimators", 20, 200, step=20)
    max_depth = trial.suggest_int("max_depth", 3, 12)
    learning_rate = trial.suggest_float("learning_rate", 1e-3, 0.3, log=True)
    subsample = trial.suggest_float("subsample", 0.5, 1.0)
    min_samples_split = trial.suggest_int("min_samples_split", 2, 10)

    # 2. Données synthétiques
    np.random.seed(42)
    X = np.random.randn(800, 15)
    y = np.random.choice([0, 1], size=800, p=[0.8, 0.2])
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.25, random_state=42)

    # 3. Modèle
    model = GradientBoostingClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        learning_rate=learning_rate,
        subsample=subsample,
        min_samples_split=min_samples_split,
        random_state=42
    )

    # Simulation d'entraînement itératif avec Pruning
    model.fit(X_train, y_train)
    preds = model.predict(X_val)
    score = f1_score(y_val, preds)

    # Pruning automatique si l'essai intermédiaire est très décevant
    trial.report(score, step=1)
    if trial.should_prune():
        raise optuna.TrialPruned()

    return float(score)

def run_optuna_study():
    print("[*] Démarrage de l'Étude AutoML Optuna...")

    # Utilisation du Sampler TPE et du Pruner Median
    study = optuna.create_study(
        direction="maximize",
        sampler=optuna.samplers.TPESampler(seed=42),
        pruner=optuna.pruners.MedianPruner(n_warmup_steps=5)
    )

    study.optimize(objective, n_trials=30, timeout=60)

    print("\n--- RÉSULTATS DE L'ÉTUDE AUTOMATISÉE OPTUNA ---")
    print(f"[+] Nombre total d'essais    : {len(study.trials)}")
    print(f"[+] Nombre d'essais prunés  : {len([t for t in study.trials if t.state == optuna.trial.TrialState.PRUNED])}")
    print(f"[+] Meilleur F1-Score       : {study.best_value:.4f}")
    print("[+] Meilleurs Hyperparamètres :")
    for k, v in study.best_params.items():
        print(f"    • {k:20s} : {v}")

if __name__ == "__main__":
    run_optuna_study()
```

---

## Module 3 — Neural Architecture Search (NAS) & DARTS (1h30)

### 🔍 Recherche d'Architectures (NAS) & DARTS (Differentiable ARchitecture Search)

```
ÉVOLUTION DE LA RECHERCHE D'ARCHITECTURES (NAS)

  1. NAS par RL / Algorithmes Génétiques (Zoph & Le 2016) :
     - Évaluer chaque architecture candidate demande un entraînement complet.
     - Coût : > 2 000 heures GPU (impraticable en entreprise).

  2. DARTS (Differentiable ARchitecture Search — Liu et al. 2019) :
     - Transforme l'espace de recherche discret d'architectures en un espace CONTINU.
     - Chaque arête du graphe de cellules applique une combinaison convexe de TOUTES les opérations possibles (Conv 3x3, Conv 5x5, MaxPool, Identity) pondérées par α :
       o^{(i,j)}(x) = ∑_{o ∈ O} ( exp(α_o^{(i,j)}) / ∑_{o'} exp(α_o'^{(i,j)}) ) * o(x)
     - Coût : Réduit la recherche à une simple journée GPU par descente de gradient bivectorielle sur (w, α) !
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **AutoML** | Automated Machine Learning — Automatisation du processus d'ingénierie ML |
| **NAS** | Neural Architecture Search — Recherche automatisée de la meilleure structure de réseau |
| **TPE** | Tree-structured Parzen Estimator — Algorithme d'optimisation bayésienne basé sur la densité |
| **DARTS** | Differentiable ARchitecture Search — NAS continu résolu par descente de gradient |
| **HPO** | Hyperparameter Optimization — Processus de recherche des meilleures valeurs de configuration |

---

## Exercices Pratiques

### Exercice 1 — Calcul d'Espace de Recherche Grid vs Random Search

Un pipeline ML possède 5 hyperparamètres à régler :
- $h_1$ : Taux d'apprentissage ($5$ valeurs possibles).
- $h_2$ : Nombre de couches ($4$ valeurs).
- $h_3$ : Dimension cachée ($6$ valeurs).
- $h_4$ : Weight decay ($5$ valeurs).
- $h_5$ : Batch size ($3$ valeurs).
1. Calculez le nombre total d'essais requis par une Grid Search exhaustive.
2. Si chaque entraînement prend 2 minutes, combien d'heures la Grid Search prendra-t-elle ?
3. Pourquoi une recherche Bayésienne (Optuna) permet-elle d'obtenir un résultat supérieur en seulement 30 essais ?

**Corrigé guidé :**
1. **Nombre d'essais Grid Search** :
   $\text{Total} = 5 \times 4 \times 6 \times 5 \times 3 = 1\,800 \text{ combinaisons}$.
2. **Temps requis** :
   $\text{Temps} = 1\,800 \times 2 \text{ minutes} = 3\,600 \text{ minutes} = 60 \text{ heures}$ ($2.5$ jours d'exécution ininterrompue).
3. **Avantage Optuna** :
   L'optimisation bayésienne TPE ne teste pas au hasard ni n'explore aveuglément toute la grille. Elle apprend des résultats des premiers essais pour échantillonner uniquement dans les zones prometteuses du paramétrage (maximisant le ratio $l(\theta)/g(\theta)$) et arrête prématurément les essais médiocres grâce aux Pruners (MedianPruner).

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la faiblesse majeure de la recherche par grille **(Grid Search)** pour le réglage d'hyperparamètres ?

- A) Elle ne fonctionne qu'avec des nombres négatifs.
- B) Elle souffre de la malédiction de la dimensionnalité : le nombre d'essais requis augmente de manière exponentielle avec le nombre d'hyperparamètres. ✅
- C) Elle efface les données d'apprentissage.
- D) Elle requiert obligatoirement un GPU A100.

**Q2.** Dans la bibliothèque Optuna, comment fonctionne le samplé **TPE (Tree-structured Parzen Estimator)** ?

- A) Il teste les valeurs dans l'ordre alphabétique des noms de variables.
- B) Il modélise séparément la distribution des bons et des mauvais essais passés et échantillonne les nouvelles valeurs là où le ratio de probabilité favorise les bons résultats. ✅
- C) Il réinitialise le modèle à chaque itération.
- D) Il supprime les colonnes inutiles du dataset.

**Q3.** Quel est le rôle d'un **Pruner** (ex: `MedianPruner`) dans une étude d'optimisation Optuna ?

- A) Formater le code Python selon la norme PEP8.
- B) Interrompre prématurément (TrialPruned) les essais dont les performances intermédiaires sont inférieures à la médiane des essais passés, économisant ainsi du temps de calcul. ✅
- C) Supprimer les fichiers temporaires du système d'exploitation.
- D) Réduire la résolution des images.

**Q4.** Quelle est l'innovation majeure apportée par la méthode **DARTS (Differentiable ARchitecture Search)** dans la recherche d'architectures (NAS) ?

- A) Elle élimine l'utilisation de PyTorch.
- B) Elle rend l'espace de recherche d'architectures continu en combinant de manière convexe les opérations possibles, permettant d'optimiser l'architecture par descente de gradient classique. ✅
- C) Elle ne recherche que des réseaux à 1 seule couche.
- D) Elle augmente le temps de calcul d'un facteur 1000.

**Q5.** Dans Optuna, la méthode `trial.suggest_float("learning_rate", 1e-4, 1e-1, log=True)` est préférée à un balayage linéaire car :

- A) Le taux d'apprentissage varie sur plusieurs ordres de grandeur (échelle logarithmique), exigeant une exploration équitable entre $10^{-4}, 10^{-3}, 10^{-2}$ et $10^{-1}$. ✅
- B) Le mode linéaire n'est pas supporté par Python.
- C) `log=True` annule les erreurs de mémoire.
- D) Elle force la valeur à être un nombre entier.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
