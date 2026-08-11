# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 463 (6h) : Sécurité des Systèmes ML : Attaques Adversariales (FGSM/PGD), Data Poisoning, Model Inversion, Défenses & Conformité EU AI Act

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre la théorie et la pratique des **Attaques Adversariales** : FGSM (Fast Gradient Sign Method) et PGD (Projected Gradient Descent)
> - Analyser les menaces d'empoisonnement de données (**Data Poisoning**) et de vol de modèle (**Model Stealing / Model Inversion**)
> - Implémenter les contre-mesures offensives et défensives : **Adversarial Training**, **Differential Privacy (DP-SGD)** et **Randomized Smoothing**
> - Structurer la conformité réglementaire selon les exigences du **EU AI Act 2024** (Systèmes IA à Haut Risque)
>
> **Compétences visées :** `SEC-06` (A) — AI Security & Adversarial Robustness

---

## Module 1 — Attaques Adversariales : FGSM & PGD (2h)

### 📖 Intuition & Narration

Les réseaux de neurones profonds sont d'une sensibilité déconcertante : une modification imperceptible pour l'œil humain appliquée aux pixels d'une image ou aux valeurs d'un vecteur réseau peut amener un modèle confiant à 99% à se tromper complètement. Ce phénomène constitue une **Attaque Adversariale**.

Dans un système de détection d'intrusions (NIDS) ou un véhicule autonome, un attaquant injecte une pertubation minimale $\delta$ dans l'entrée $x$ telle que $x_{adv} = x + \delta$, poussant le modèle à classifier un paquet malveillant en trafic légitime.

### 🔍 Anatomie Technique — Mathématiques de FGSM & PGD

```
1. FAST GRADIENT SIGN METHOD (FGSM — Goodfellow et al. 2014) :
   Attaque en une seule étape (One-step attack) dans la direction du gradient de la perte.

   Formule :
   x_adv = x + ε * sign( ∇_x L(θ, x, y_true) )

   Paramètres :
   - ε (Epsilon) : Amplitude maximale du bruit (contrainte L_infinity : ||x_adv - x||_∞ ≤ ε).
   - ∇_x L       : Gradient de la perte par rapport à l'ENTRÉE x (et NON aux poids θ !).

2. PROJECTED GRADIENT DESCENT (PGD — Madry et al. 2017) :
   Attaque itérative (Multi-step attack), considérée comme l'attaque de premier ordre la plus puissante.

   Formule itérative :
   x^(t+1) = Clip_{x, ε} [ x^(t) + α * sign( ∇_x L(θ, x^(t), y_true) ) ]

   - Projection (Clip) à chaque étape pour rester dans la boule L_infinity B_ε(x).
```

---

## Module 2 — Atelier Pratique : Attaque FGSM & Adversarial Training en PyTorch (2h)

### 🛠️ Code PyTorch : Génération d'Exemples Adversariaux & Entraînement Robustifié

```python
#!/usr/bin/env python3
"""
PARADIS — Implémentation d'une Attaque Adversariale FGSM et Défense par Adversarial Training
Attaque et robustification d'un classificateur de sécurité réseau PyTorch.
"""

import torch
import torch.nn as nn
import torch.optim as optim

# 1. Modèle cible simple (Classificateur NIDS)
class NIDSClassifier(nn.Module):
    def __init__(self, input_dim=10):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 32),
            nn.ReLU(),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 2)
        )

    def forward(self, x):
        return self.net(x)

# 2. Algorithme de Génération FGSM (Fast Gradient Sign Method)
def fgsm_attack(model: nn.Module, loss_fn: nn.Module, x: torch.Tensor, y: torch.Tensor, epsilon: float) -> torch.Tensor:
    """
    Génère un exemple adversarial x_adv = x + epsilon * sign(grad_x)
    """
    # Activer le calcul du gradient par rapport à l'ENTRÉE x
    x_adv = x.clone().detach().requires_grad_(True)

    # Propagation avant
    outputs = model(x_adv)
    loss = loss_fn(outputs, y)

    # Réinitialisation des gradients et rétropropagation
    model.zero_grad()
    loss.backward()

    # Extraction du signe du gradient de l'entrée
    data_grad = x_adv.grad.data
    sign_data_grad = data_grad.sign()

    # Perturbation adversariale
    perturbed_x = x_adv + epsilon * sign_data_grad

    # Conservation des bornes de données (ex: [0, 1] ou [-5, 5])
    perturbed_x = torch.clamp(perturbed_x, -3.0, 3.0)
    return perturbed_x.detach()

def run_adversarial_demo():
    torch.manual_seed(42)
    model = NIDSClassifier(input_dim=10)
    loss_fn = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.01)

    # Entrée légitime (Batch size 1, Feature vector)
    x_clean = torch.randn(1, 10)
    y_true = torch.tensor([1])  # Classe 1 : Trafic Malveillant

    # Évaluation initiale
    output_clean = model(x_clean)
    pred_clean = output_clean.argmax(dim=1).item()
    print(f"[*] Prédiction sur données Propres (Clean) : Classe {pred_clean} (Réel: {y_true.item()})")

    # 3. Attaque FGSM avec epsilon = 0.2
    epsilon = 0.3
    x_adv = fgsm_attack(model, loss_fn, x_clean, y_true, epsilon)

    output_adv = model(x_adv)
    pred_adv = output_adv.argmax(dim=1).item()
    print(f"[🚨] Prédiction sur Exemple ADVERSARIAL (FGSM eps={epsilon}) : Classe {pred_adv}")
    print(f"    Le modèle a été trompé : {pred_clean} ──▶ {pred_adv} avec perturbation de norme L_inf <= {epsilon}")

    # 4. Défense : Adversarial Training (Entraînement sur exemples propres ET adversariaux)
    print("\n[*] Entraînement de Défense (Adversarial Training en cours)...")
    model.train()
    for epoch in range(50):
        # Générer l'exemple adversarial pour la passe courante
        x_adv_batch = fgsm_attack(model, loss_fn, x_clean, y_true, epsilon)

        # Pertes combinées (Clean + Adversarial)
        loss_clean = loss_fn(model(x_clean), y_true)
        loss_adv = loss_fn(model(x_adv_batch), y_true)
        total_loss = 0.5 * loss_clean + 0.5 * loss_adv

        optimizer.zero_grad()
        total_loss.backward()
        optimizer.step()

    # Évaluation après défense
    model.eval()
    x_adv_after = fgsm_attack(model, loss_fn, x_clean, y_true, epsilon)
    pred_defended = model(x_adv_after).argmax(dim=1).item()
    print(f"[+] Prédiction APRÈS Adversarial Training (FGSM eps={epsilon}) : Classe {pred_defended}")
    print(f"    Résultat : {'✅ ROBUSTE (Attaque Neutralisée)' if pred_defended == y_true.item() else '❌ VULNÉRABLE'}")

if __name__ == "__main__":
    run_adversarial_demo()
```

---

## Module 3 — Conformité Réglementaire : EU AI Act (2024) (1h30)

### 🔍 Niveaux de Risque & Exigences du EU AI Act

```
CLASSIFICATION DES RISQUES SELON L'EU AI ACT (2024)

  1. RISQUE INACCEPTABLE (Interdiction Stricte) :
     - Scoring social par les gouvernements.
     - Identification biométrique à distance en temps réel dans l'espace public (sauf exceptions pénales).
     - Manipulation comportementale subliminale causant un préjudice.

  2. HAUT RISQUE (High-Risk AI Systems — Soumis à Conformité Strictes) :
     - Infrastructure critique (Énergie, Eau, Réseaux IT/Télécoms).
     - Recrutement, évaluation des employés.
     - Gestion des crédits bancaires et scores d'assurance.
     - Maintien de l'ordre, contrôle des frontières et justice.

  EXIGENCES OBLIGATOIRES POUR IA À HAUT RISQUE :
  ─────────────────────────────────────────────────────────────────
  - Système de Gestion des Risques (Risk Management System continu).
  - Gouvernance des Données (Atténuation des biais, représentativité).
  - Documentation Technique (Traçabilité, logs d'audit automatiques).
  - Transparence et Information des Utilisateurs.
  - Contrôle Humain (Human Oversight — possibilité d'interrompre l'IA).
  - Robustesse, Cybersécurité et Précision (Résistance aux attaques FGSM/PGD).
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **FGSM** | Fast Gradient Sign Method — Attaque adversariale rapide basée sur le signe du gradient |
| **PGD** | Projected Gradient Descent — Attaque adversariale itérative projetée sur une norme bornée |
| **DP-SGD** | Differentially Private SGD — Descente de gradient préservant la confidentialité des exemples |
| **EU AI Act** | Règlement européen sur l'Intelligence Artificielle établissant un cadre juridique basé sur les risques |
| **Model Inversion** | Attaque visant à reconstruire les données d'entraînement d'origine à partir des sorties du modèle |

---

## Exercices Pratiques

### Exercice 1 — Détection d'Attaque par Data Poisoning

Une entreprise d'analyse de sécurité bancaire entraîne son modèle de détection de fraudes en ingérant automatiquement les données signalées par les utilisateurs via un formulaire web public. Au bout de 2 mois, la précision du modèle chute drastiquement et certaines fraudes évidentes passent inaperçues.
1. Quel type d'attaque a eu lieu ? Expliquez le vecteur d'attaque.
2. Proposez deux contre-mesures d'ingénierie et de sécurité pour protéger le pipeline d'entraînement.

**Corrigé guidé :**
1. **Type d'attaque** : **Data Poisoning (Empoisonnement de données)**. Un attaquant (ou un groupe de fraudeurs) a soumis intentionnellement des milliers de faux exemples étiquetés à l'envers (fraudous transactions marquées comme "légitimes") via le formulaire public. En ré-entraînant le modèle sur ces données corrompues, la frontière de décision a été altérée.
2. **Contre-mesures** :
   - **Data Sanitation / Outlier Detection** : Filtrer les nouvelles données soumises via des algorithmes de détection d'anomalies (Isolation Forest) avant ingestion dans le jeu d'entraînement.
   - **Validation Humaine & Sanitization Rate-Limiting** : Ne jamais ré-entraîner directement sur des données publiques non vérifiées ; exiger une validation par échantillonnage par des experts métier (Human-in-the-Loop) et maintenir un dataset d'évaluation "Golden Test Set" immuable et propre.

---

## Banque QCM — 5 Questions

**Q1.** Dans l'attaque adversariale **FGSM (Fast Gradient Sign Method)**, le gradient est calculé par rapport à :

- A) La matrice des poids du réseau $\theta$.
- B) Le vecteur des données d'entrée $x$. ✅
- C) La constante du taux d'apprentissage $\eta$.
- D) La taille du batch.

**Q2.** La différence majeure entre l'attaque **FGSM** et l'attaque **PGD** est que :

- A) FGSM est itérative, alors que PGD s'exécute en une seule étape.
- B) PGD est une attaque itérative (multi-step) avec projection, considérée comme plus puissante et systématique que FGSM. ✅
- C) FGSM ne fonctionne que sur les processeurs AMD.
- D) PGD ne nécessite pas d'accès au modèle.

**Q3.** Qu'est-ce qu'une attaque de type **Model Inversion** ?

- A) L'inversion des matrices de poids pour accélérer l'inférence.
- B) Une attaque où l'adversaire extrait ou reconstruit les données d'entraînement sensibles d'origine en interrogeant répétitivement l'API du modèle. ✅
- C) La suppression des logs de production.
- D) La modification de la licence du logiciel.

**Q4.** Selon le **EU AI Act (2024)**, un système d'IA utilisé pour l'évaluation des crédits bancaires ou le recrutement est classé comme :

- A) Risque Minimal (Aucune obligation).
- B) Système à Haut Risque (High-Risk AI System) soumis à des exigences strictes de gouvernance, traçabilité et contrôle humain. ✅
- C) Risque Inacceptable (Interdit strictement).
- D) Open Source exonéré de toute responsabilité.

**Q5.** La technique de défense par **Adversarial Training** consiste à :

- A) Augmenter la taille du GPU.
- B) Générer dynamiquement des exemples adversariaux pendant la boucle d'apprentissage et les inclure dans le jeu d'entraînement pour forcer le réseau à apprendre une frontière de décision robuste. ✅
- C) Utiliser un antivirus sur le serveur web.
- D) Chiffrer le code Python avec Cython.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
