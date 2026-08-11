# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 483 (6h) : Alignement Avancé des LLMs : RLHF (PPO) vs DPO vs KTO (Kahneman-Tversky Optimization) & Reward Modeling

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre les enjeux de l'**Alignement des LLMs** (Helpful, Honest, Harmless - 3H)
> - Analyser le pipeline historique **RLHF avec PPO** et la modélisation des récompenses (Reward Model avec perte Bradley-Terry)
> - Comparer les méthodes d'alignement direct **DPO (Direct Preference Optimization)** et **KTO (Kahneman-Tversky Optimization)**
> - Implémenter l'objectif de perte **KTO** qui élimine le besoin de paires ordonnées de réponses (Préférée / Rejetée)
>
> **Compétences visées :** `AI-02` (A) — Advanced LLM Alignment & Preference Optimization

---

## Module 1 — Du RLHF à DPO et KTO : Évolution des Méthodes d'Alignement (2h)

### 📖 Intuition & Narration

Après l'étape d'apprentissage automatique supervisé (SFT), un LLM sait compléter des phrases, mais il n'est pas "aligné" : il peut générer du contenu toxique, halluciner ou refuser d'exécuter des requêtes légitimes. L'**Alignement** vise à rendre le modèle utile, honnête et inoffensif (les principes **3H : Helpful, Honest, Harmless**).

Le pipeline historique **RLHF (Reinforcement Learning from Human Feedback)** de ChatGPT utilisait PPO. Mais PPO nécessite 4 modèles en mémoire GPU simultanément (Actor, Critic, Ref Model, Reward Model), rendant l'entraînement complexe et instable.

L'écosystème s'est orienté vers deux alternatives majeures :
1. **DPO (Direct Preference Optimization)** : Utilise des paires de réponses $(x, y_{chosen}, y_{rejected})$ pour optimiser directement la politique.
2. **KTO (Kahneman-Tversky Optimization — Ethayarajh et al. 2024)** : Inspiré de la théorie des perspectives de Kahneman & Tversky en économie comportementale. KTO fonctionne sur des exemples **non-appariés** (un prompt $x$ et une réponse $y$ étiquetée simplement "Bonne" ou "Mauvaise").

### 🔍 Anatomie Technique — Modèle de Récompense Bradley-Terry vs KTO

```
1. MODÈLE DE RÉCOMPENSE BRADLEY-TERRY (Base du RLHF et DPO) :
   P(y_w ≻ y_l | x) = σ( r(x, y_w) - r(x, y_l) )
   Exige STRICTEMENT des paires ordonnées (y_chosen ≻ y_rejected) pour chaque prompt.

2. KAHNEMAN-TVERSKY OPTIMIZATION (KTO) :
   Repose sur l'asymétrie humaine face au risque : la douleur d'une perte est perçue plus fortement que le plaisir d'un gain équivalent (Loss Aversion).

   Perte KTO pour une réponse satisfaisante (y est BON) :
   L_KTO(y_w) = 1 - σ( β * ( log( π_θ(y_w|x) / π_ref(y_w|x) ) - z_ref ) )

   Perte KTO pour une réponse insatisfaisante (y est MAUVAIS) :
   L_KTO(y_l) = 1 - σ( λ_KTO * β * ( z_ref - log( π_θ(y_l|x) / π_ref(y_l|x) ) ) )

   - λ_KTO (Loss Aversion Coefficient, typiquement 1.33) : Pondère plus lourdement les erreurs que les succès !
   - Ne nécessite PAS de paires ordonnées ! Un simple pouce levé / pouce vers le bas par réponse suffit.
```

---

## Module 2 — Atelier Pratique : Alignement KTO avec Hugging Face TRL (2h)

### 🛠️ Script Python : Configuration KTOTrainer avec Hugging Face `trl`

```python
#!/usr/bin/env python3
"""
PARADIS — Alignement LLM avec KTO (Kahneman-Tversky Optimization) et TRL
Alignement direct sur des données binaires (Pouce Levé / Pouce Vers le Bas)
"""

import torch
from datasets import Dataset

def run_kto_demo():
    print("[*] --- ALIGNEMENT KTO (Kahneman-Tversky Optimization) PARADIS IT ---")

    # Données synthétiques d'alignement binaire (Prompt, Completion, Label boolean)
    # Note : Pas besoin de paires choisie/rejetée pour le même prompt !
    kto_dataset = [
        {
            "prompt": "Comment sécuriser le port 22 sur un serveur Linux ?",
            "completion": "Désactiver la connexion mot de passe et root dans sshd_config et utiliser des clés Ed25519.",
            "label": True  # Réponse Satisfaisante (Gain)
        },
        {
            "prompt": "Comment créer un mot de passe fort ?",
            "completion": "Utilise le mot '123456' car c'est facile à retenir.",
            "label": False # Réponse Inacceptable (Perte)
        },
        {
            "prompt": "Qu'est-ce qu'un certificat X.509 ?",
            "completion": "Un standard cryptographique définissant la structure des certificats à clé publique.",
            "label": True  # Réponse Satisfaisante
        }
    ]

    dataset = Dataset.from_list(kto_dataset)

    print(f"[+] Dataset KTO chargé avec {len(dataset)} exemples binaires.")

    try:
        from trl import KTOConfig, KTOTrainer
        print("[+] Bibliothèque TRL (KTOTrainer) disponible.")

        # Configuration KTO
        kto_config = KTOConfig(
            beta=0.1,             # Facteur de contrôle de l'écart à la politique de référence
            desirable_weight=1.0, # Pondération des réponses positives
            undesirable_weight=1.33, # Coefficient d'aversion aux pertes (Loss Aversion lambda)
            learning_rate=5e-7,
            per_device_train_batch_size=1,
            output_dir="./kto_aligned_model"
        )
        print(f"[+] KTOConfig initialisé (beta={kto_config.beta}, loss_aversion_lambda={kto_config.undesirable_weight})")

    except ImportError:
        print("[!] Bibliothèque 'trl' non installée (pip install trl). Simulation de la boucle KTO active.")
        print("    [+] Validation conceptuelle : L_KTO équilibre les gains et pertes selon la théorie des perspectives.")

if __name__ == "__main__":
    run_kto_demo()
```

---

## Module 3 — Comparatif des Méthodes d'Alignement (1h30)

### 🔍 Matrice de Choix Technique : RLHF (PPO) vs DPO vs KTO

```
MATRICE COMPARATIVE DES MÉTHODES D'ALIGNEMENT

  Critère              │ RLHF (PPO)            │ DPO                   │ KTO
  ─────────────────────┼───────────────────────┼───────────────────────┼─────────────────────
  Format de données    │ Paires + Rewards      │ Paires (Chosen/Reject)│ Binaire (True/False)
  Besoin Reward Model  │ OUI (Séparé)          │ NON                   │ NON
  Modèles en VRAM      │ 4 (Actor,Critic,R,Ref)│ 2 (Policy, Ref)       │ 2 (Policy, Ref)
  Stabilité Entraînement│ Faible (Hyper-sensible)│ Élevée                │ Élevée
  Coût de Collecte Data│ Élevé (Paires réelles)│ Moyen (Paires)        │ Faible (Logs réels)
  Performances LLM     │ Excellente            │ Excellente            │ Équivalente à DPO
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **KTO** | Kahneman-Tversky Optimization — Alignement LLM binaire inspiré de la théorie des perspectives |
| **DPO** | Direct Preference Optimization — Alignement direct sur paires ordonnées sans Reward Model |
| **RLHF** | Reinforcement Learning from Human Feedback — Alignement par apprentissage par renforcement |
| **PPO** | Proximal Policy Optimization — Algorithme Policy Gradient utilisé dans le RLHF classique |
| **3H** | Helpful, Honest, Harmless — Les trois piliers éthiques de l'alignement des modèles d'IA |

---

## Exercices Pratiques

### Exercice 1 — Calcul du Ratio de Loss Aversion dans KTO

Dans la formulation de KTO, la désutilité causée par une réponse inacceptable (label `False`) est multipliée par le coefficient d'aversion à la perte $\lambda_{KTO} = 1.33$.
Si le gradient calculé sur une réponse positive satisfaisante $y_w$ est de $+0.05$, et que le gradient brut calculé sur une réponse négative $y_l$ est de $-0.05$ :
1. Calculez le gradient effectif appliqué par la perte KTO pour la réponse négative.
2. Expliquez pourquoi cette asymétrie empêche le modèle de générer des réponses toxiques.

**Corrigé guidé :**
1. **Gradient effectif négatif** :
   $$\text{Grad}_{effectif} = -0.05 \times \lambda_{KTO} = -0.05 \times 1.33 = -0.0665.$$
2. **Explication** :
   Le gradient de pénalité est $33\%$ plus fort que le gradient de récompense. Cette asymétrie force l'optimiseur à fuir prioritairement les mauvais comportements (réponses toxiques ou dangereuses), reflétant le comportement humain qui pardonne difficilement une erreur grave même après plusieurs réponses correctes.

---

## Banque QCM — 5 Questions

**Q1.** Quels sont les trois piliers du principe d'alignement **3H** pour les LLMs ?

- A) High, Heavy, Hard.
- B) Helpful (Utile), Honest (Honnête), Harmless (Inoffensif). ✅
- C) HTML, HTTP, HTTPS.
- D) Fast, Fast, Fast.

**Q2.** Quelle est la simplification majeure apportée par **DPO (Direct Preference Optimization)** par rapport au **RLHF (PPO)** classique ?

- A) DPO supprime complètement le modèle de langage.
- B) DPO élimine la nécessité d'entraîner un Reward Model séparé et de réaliser des rollouts PPO en ajustant directement la politique sur les paires de préférences. ✅
- C) DPO ne fonctionne qu'avec des images.
- D) DPO accélère la vitesse d'inférence d'un facteur 100.

**Q3.** Quelle est la caractéristique unique des données requises par l'algorithme **KTO (Kahneman-Tversky Optimization)** par rapport à DPO ?

- A) KTO exige des vidéos HD.
- B) KTO n'a pas besoin de paires d'équivalences (Chosen vs Rejected) pour un même prompt, mais fonctionne sur des signaux binaires indépendants (Succès/Échec, Pouce Levé/Vers le bas). ✅
- C) KTO exige d'écrire les prompts en latin.
- D) KTO supprime l'utilisation de PyTorch.

**Q4.** Sur quelle théorie économique l'algorithme d'alignement **KTO** s'appuie-t-il pour justifier le coefficient d'aversion à la perte ($\lambda_{KTO} > 1$) ?

- A) La théorie des jeux de Nash.
- B) La théorie des perspectives (Prospect Theory) de Kahneman & Tversky, démontrant que les humains ressentent plus fortement la douleur d'une perte que le plaisir d'un gain. ✅
- C) La loi de l'offre et de la demande.
- D) Le théorème de Bayes.

**Q5.** Dans TRL, que contrôle le paramètre **$\beta$ (beta)** présent dans les pertes DPO et KTO ?

- A) La température du ventilateur GPU.
- B) La force de la pénalité de divergence KL empêchant la nouvelle politique $\pi_\theta$ de trop s'éloigner de la politique de référence pré-entraînée $\pi_{ref}$. ✅
- C) Le nombre de tokens générés par seconde.
- D) La taille des fichiers de sauvegarde.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
