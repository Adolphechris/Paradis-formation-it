# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 465 (6h) : Responsible AI & Explicabilité (XAI) : Métriques d'Équité (Demographic Parity), SHAP, LIME, Grad-CAM & Audit d'Éthique Algorithmique

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre la théorie des **Métriques d'Équité (Fairness)** : Demographic Parity, Equalized Odds et Disparate Impact
> - Détecter et mitiger le **biais algorithmique** dans les jeux de données d'apprentissage et les modèles de décision
> - Implémenter l'explicabilité locale et globale avec **SHAP** et **LIME (Local Interpretable Model-agnostic Explanations)**
> - Visualiser l'attention spatiale des réseaux convolutifs avec **Grad-CAM (Gradient-weighted Class Activation Mapping)**
>
> **Compétences visées :** `AI-04` (A) — Responsible AI & Model Explainability

---

## Module 1 — Équité Algorithmique & Métriques de Biais (2h)

### 📖 Intuition & Narration

Les modèles de Machine Learning n'inventent pas leurs règles : ils reflètent et amplifient les biais historiques présents dans les données d'apprentissage. Un algorithme d'octroi de crédit ou d'évaluation de CV peut décider de manière discriminatoire sur la base d'attributs protégés (genre, âge, origine géographique), même si ces colonnes ont été formellement retirées du jeu de données (par le jeu des variables corrélées ou "proxies").

L'**IA Responsable (Responsible AI)** vise à fournir des garanties mathématiques et éthiques d'équité, de transparence et d'explicabilité pour chaque décision automatisée.

### 🔍 Anatomie Technique — Métriques d'Équité (Fairness)

```
MÉTRIQUES D'ÉQUITÉ ALGORITHMIQUE

  Considérons un groupe protégé (A = 0) et un groupe privilégié (A = 1),
  et une prédiction binaire Y_hat ∈ {0, 1} (ex: 1 = Crédit Accordé).

  1. PARITÉ DÉMOGRAPHIQUE (Demographic Parity) :
     - Exigence : Le taux d'acceptation doit être identique quel que soit le groupe.
     - Formule  : P( Y_hat = 1 | A = 0 ) = P( Y_hat = 1 | A = 1 )
     - Limite   : Ne tient pas compte de la valeur réelle Y (Ground Truth).

  2. ÉGALITÉ DES CHANCES (Equalized Odds) :
     - Exigence : Le taux de vrais positifs (TPR) ET le taux de faux positifs (FPR) doivent être égaux.
     - Formule  : P( Y_hat = 1 | Y = 1, A = 0 ) = P( Y_hat = 1 | Y = 1, A = 1 )  [Même TPR]
       ET       : P( Y_hat = 1 | Y = 0, A = 0 ) = P( Y_hat = 1 | Y = 0, A = 1 )  [Même FPR]

  3. IMPACT DISPARATE (Disparate Impact Ratio) :
     - Règle légale des 80% (EEOC US / Normes Européennes) :
     - Ratio = P( Y_hat = 1 | A = 0 ) / P( Y_hat = 1 | A = 1 )
     - Si Ratio < 0.80 ──▶ Discrimination / Disparate Impact avéré !
```

---

## Module 2 — Atelier Pratique : LIME & Grad-CAM (2h)

### 🛠️ Script Python : Explication d'une Prédiction avec LIME et Visualisation Grad-CAM

```python
#!/usr/bin/env python3
"""
PARADIS — Explicabilité des Modèles ML avec LIME (Données Tabulaires) et Grad-CAM (Images)
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from lime import lime_tabular

def run_lime_explanation_demo():
    print("[*] --- DÉMONSTRATION LIME (Local Interpretable Model-agnostic Explanations) ---")
    np.random.seed(42)

    # Données synthétiques d'évaluation de crédit bancaire
    n = 1000
    df = pd.DataFrame({
        "revenu_k€": np.random.normal(45, 15, n),
        "ratio_endettement": np.random.uniform(0.1, 0.6, n),
        "anciennete_emploi_ans": np.random.poisson(5, n),
        "incidents_paiement": np.random.poisson(0.3, n)
    })

    # Cible : Accord du crédit (1 = Oui, 0 = Non)
    y = ((df["revenu_k€"] > 35) & (df["ratio_endettement"] < 0.4) & (df["incidents_paiement"] == 0)).astype(int)

    feature_names = df.columns.tolist()

    # Entraînement d'un modèle "Boîte Noire" (Random Forest)
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(df, y)

    # Initialisation de l'Explainer LIME Tabulaire
    explainer = lime_tabular.LimeTabularExplainer(
        training_data=df.values,
        feature_names=feature_names,
        class_names=["Refusé", "Accordé"],
        mode="classification",
        random_state=42
    )

    # Sélection d'une instance spécifique à expliquer (ex: Un profil refusé)
    idx = 10
    instance = df.iloc[idx]
    pred_prob = model.predict_proba([instance])[0]
    print(f"\n[+] Instance #{idx} à expliquer :")
    print(instance.to_dict())
    print(f"[+] Prédiction du Modèle : Refusé={pred_prob[0]:.2f}, Accordé={pred_prob[1]:.2f}")

    # Génération de l'explication locale LIME
    exp = explainer.explain_instance(
        data_row=instance,
        predict_fn=model.predict_proba,
        num_features=3
    )

    print("\n--- CONTRIBUTIONS LOCALES LIME POUR CETTE DÉCISION ---")
    for feature, weight in exp.as_list():
        direction = "FAVORISE L'ACCORD" if weight > 0 else "DEFAVORISE (FAVORISE LE REFUS)"
        print(f"  • Feature: {feature:35s} | Impact: {weight:+.4f} ({direction})")

def run_gradcam_concept():
    """
    Illustration conceptuelle de Grad-CAM (Gradient-weighted Class Activation Mapping)
    """
    print("\n[*] --- CONCEPT GRAD-CAM (Visualisation pour Réseaux Convolutifs CNN) ---")
    print("""
    ÉTAPES DE CALCUL GRAD-CAM :
    1. Sélectionner la dernière couche de convolution du CNN (ex: resnet.layer4).
    2. Calculer le gradient de la classe cible y_c par rapport aux feature maps A^k de cette couche :
       α_k = (1/Z) * ∑_i ∑_j ( ∂y_c / ∂A^k_{i,j} )
    3. Combiner les feature maps pondérées par α_k :
       L_Grad-CAM = ReLU( ∑_k α_k * A^k )
    4. Appliquer ReLU pour ne conserver que les caractéristiques contribuant POSITIVEMENT à la classe.
    5. Redimensionner la carte d'activation (heatmap) sur l'image d'origine.
    """)
    print("  ✅ Grad-CAM produit une heatmap indiquant exactement les zones de l'image observées par le CNN.")

if __name__ == "__main__":
    run_lime_explanation_demo()
    run_gradcam_concept()
```

---

## Module 3 — Audit & Framework d'IA Responsable (1h30)

### 🔍 Framework d'Audit d'Éthique et Transparence PARADIS

```
CHECKLIST D'AUDIT D'IA RESPONSABLE (PARADIS IT)

  ┌────────────────────────────────────────────────────────┐
  │ 1. BIAS & FAIRNESS AUDIT                               │
  │    - Mesurer l'Impact Disparate sur les attributs.    │
  │    - Tester le ratio des 80% (EEOC).                   │
  │    - Appliquer un re-pondérage (Reweighing) si besoin. │
  └──────────────────────────┬─────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. EXPLICABILITY & TRANSPARENCY                        │
  │    - Générer les explications SHAP globales.           │
  │    - Intégrer LIME/SHAP local dans l'API de réponse.   │
  │    - Fournir la raison principale du refus d'un crédit.│
  └──────────────────────────┬─────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. ROBUSTNESS & SAFETY                                 │
  │    - Tester l'immunité aux exemples adversariaux.      │
  │    - Assurer le fallback vers un opérateur humain.    │
  └────────────────────────────────────────────────────────┘
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **XAI** | Explainable Artificial Intelligence — Ensemble de méthodes rendant les décisions de l'IA compréhensibles |
| **LIME** | Local Interpretable Model-agnostic Explanations — Explication locale par approximation linéaire locale |
| **Grad-CAM** | Gradient-weighted Class Activation Mapping — Visualisation d'attention pour CNN par gradients |
| **TPR** | True Positive Rate — Taux de vrais positifs (Sensibilité / Rappel) |
| **FPR** | False Positive Rate — Taux de faux positifs |

---

## Exercices Pratiques

### Exercice 1 — Calcul d'Impact Disparate

Un algorithme de filtrage automatique de CV est testé sur 1000 candidats :
- Groupe A (Hommes) : 500 candidats, 200 sélectionnés.
- Groupe B (Femmes) : 500 candidates, 100 sélectionnées.
1. Calculez le taux de sélection pour chaque groupe.
2. Calculez l'Impact Disparate Ratio.
3. L'algorithme respecte-t-il la règle des 80% ? Que concluez-vous ?

**Corrigé guidé :**
1. **Taux de sélection** :
   - Groupe A ($P(\hat{Y}=1 | A=1)$) = $200 / 500 = 0.40$ ($40\%$).
   - Groupe B ($P(\hat{Y}=1 | A=0)$) = $100 / 500 = 0.20$ ($20\%$).
2. **Impact Disparate Ratio** :
   $\text{Ratio} = 0.20 / 0.40 = 0.50$ ($50\%$).
3. **Conclusion** :
   Le ratio de $0.50$ est strictement inférieur au seuil légal de $0.80$ ($80\%$). L'algorithme présente un **Impact Disparate discriminatoire avéré** au détriment du Groupe B. Une correction du biais (re-weighting ou suppression des proxies) est obligatoire.

---

## Banque QCM — 5 Questions

**Q1.** Selon la métrique de **Parité Démographique (Demographic Parity)**, un modèle est considéré comme équitable si :

- A) Il utilise un processeur GPU NVIDIA.
- B) Le taux de décisions positives $P(\hat{Y}=1)$ est identique pour tous les groupes protégés et non protégés, indépendamment de la réalité du terrain. ✅
- C) Sa précision (Accuracy) est égale à 100%.
- D) Il s'exécute en moins de 1 ms.

**Q2.** La règle légale des **80% (Disparate Impact Ratio)** stipule qu'il y a présomption de discrimination si le ratio de sélection du groupe désavantagé par rapport au groupe favorisé est :

- A) Supérieur à 1.5.
- B) Inférieur à 0.80 (80%). ✅
- C) Égal à 0.0.
- D) Égal à 1.0.

**Q3.** Comment fonctionne l'explication locale proposée par **LIME** pour expliquer une prédiction individuelle ?

- A) LIME ré-entraîne le réseau de neurones complet pendant 10 heures.
- B) LIME perturbe légèrement l'instance d'entrée, observe les variations de réponse de la boîte noire, et ajuste un modèle linéaire simple et interprétable au voisinage de cette instance. ✅
- C) LIME convertit le modèle au format GGUF.
- D) LIME supprime les colonnes de la base de données.

**Q4.** Que visualise la méthode **Grad-CAM** lorsqu'elle est appliquée à un réseau de neurones convolutif (CNN) ?

- A) La vitesse du ventilateur du processeur.
- B) Une carte de chaleur (heatmap) superposée à l'image montrant les régions spatiales exactes qui ont le plus contribué à l'activation de la classe prédite. ✅
- C) Le code source Python du modèle.
- D) Les logs d'erreurs du serveur HTTP.

**Q5.** Dans l'explicabilité par **SHAP (SHapley Additive exPlanations)**, la somme des valeurs SHAP de toutes les variables pour une instance donnée est égale à :

- A) Zéro.
- B) La différence entre la prédiction du modèle pour cette instance et la prédiction moyenne globale du jeu de données (Base Value). ✅
- C) La valeur de la constante d'apprentissage $\eta$.
- D) La taille de l'image en pixels.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
