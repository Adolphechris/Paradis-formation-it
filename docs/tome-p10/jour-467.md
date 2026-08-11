# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 467 (6h) : Modèles de Diffusion & Stable Diffusion : Processus Forward/Reverse (DDPM), Latent Diffusion, U-Net, CLIP & ControlNet

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre les fondements mathématiques des **Modèles de Diffusion (DDPM/DDIM)** : processus d'ajout de bruit (Forward) et de débruitage (Reverse)
> - Analyser l'architecture **Latent Diffusion (Stable Diffusion)** : VAE, U-Net avec Cross-Attention et CLIP Text Encoder
> - Implémenter un pipeline de débruitage itératif et de génération d'images guidée par le texte avec PyTorch et `diffusers`
> - Déployer des modules de contrôle de structure spatiale avec **ControlNet** et des adaptateurs **LoRA pour Stable Diffusion**
>
> **Compétences visées :** `AI-01` (A) — Diffusion Models & Latent Diffusion Architecture

---

## Module 1 — Fondements Mathématiques : DDPM (Denoising Diffusion Probabilistic Models) (2h)

### 📖 Intuition & Narration

Pendant des années, les GANs ont dominé la génération d'images. Cependant, leur entraînement instable et le risque constant de mode collapse ont poussé la recherche vers une nouvelle classe de modèles génératifs : les **Modèles de Diffusion (DDPM — Ho et al. 2020)**.

L'idée fondamentale d'un modèle de diffusion est de décomposer la génération en une longue séquence de petites étapes simples :
1. **Processus Forward ($q$)** : On détruit progressivement une image réelle $x_0$ en y ajoutant du bruit gaussien à chaque pas $t \in [1, T]$ jusqu'à obtenir un bruit pur $x_T \sim \mathcal{N}(0, I)$.
2. **Processus Reverse ($p_\theta$)** : Un réseau de neurones (U-Net) apprend à inverser ce processus étape par étape : il prédit le bruit $\epsilon_\theta(x_t, t)$ ajouté au pas $t$ afin d'extraire l'image propre $x_{t-1}$.

### 🔍 Anatomie Technique — Équations de Diffusion Forward et Reverse

```
PROCESSUS FORWARD (Ajout de bruit deterministe) :
  q(x_t | x_0) = N( x_t ; √(α_bar_t) * x_0 , (1 - α_bar_t) * I )

  Astuce de Reparamétrisation (Direct Sampling à n'importe quel pas t) :
  x_t = √(α_bar_t) * x_0 + √(1 - α_bar_t) * ε     où ε ~ N(0, I)

PROCESSUS REVERSE (Débruitage appris par le U-Net) :
  Le U-Net apprend à prédire le bruit ε qui a été ajouté :
  Loss = E_{t, x_0, ε} [ || ε - ε_θ(x_t, t) ||² ]

  À chaque pas de l'inférence, on soustrait une fraction du bruit prédit :
  x_{t-1} = (1 / √α_t) * ( x_t - ((1 - α_t) / √(1 - α_bar_t)) * ε_θ(x_t, t) ) + σ_t * z
```

---

## Module 2 — Architecture Latent Diffusion & Stable Diffusion (2h)

### 🔍 Anatomie — Composants de Stable Diffusion

```
ARCHITECTURE LATENT DIFFUSION (SD 1.5 / SDXL / SD3)

  [ Text Prompt ] ──▶ [ CLIP Text Encoder ] ──────────┐ (Embeddings de Texte K, V)
                                                      │
  [ Random Noise z_T ] (dans l'espace latent)         │
            │                                         ▼
            ▼                              ┌─────────────────────┐
     ┌──────────────┐                      │     U-NET DENOISER  │
     │  U-Net Loop  │ ◄───────────────────┤ - ResNet Blocks     │
     │  (T steps)   │  Cross-Attention     │ - Self-Attention    │
     └──────┬───────┘                      │ - Cross-Attention   │
            │                              └─────────────────────┘
            ▼
  [ Latent Débruité z_0 ]
            │
            ▼
     ┌──────────────┐
     │  VAE Decoder │ ──▶ [ Image RGB 512x512 ou 1024x1024 ]
     └──────────────┘

AVANTAGE CLÉ DU LATENT DIFFUSION :
  Travailler dans l'espace latent du VAE (ex: 64x64x4 pour une image 512x512)
  réduit la complexité mémoire d'un facteur 64x par rapport à la diffusion directe en espace pixel.
```

### 🛠️ Atelier Pratique — Pipeline Stable Diffusion avec `diffusers` & ControlNet

```python
#!/usr/bin/env python3
"""
PARADIS — Script de Génération et Débruitage Guidé par le Texte (Stable Diffusion + ControlNet)
"""

import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler

def run_stable_diffusion_demo():
    model_id = "runwayml/stable-diffusion-v1-5"

    print("[*] Chargement du Pipeline Stable Diffusion...")

    # Utilisation du Scheduler DPM-Solver++ (permet une génération de haute qualité en 20-25 steps au lieu de 50)
    pipe = StableDiffusionPipeline.from_pretrained(
        model_id,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
    )

    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    pipe = pipe.to(device)

    # Activer l'optimisation mémoire xFormers / Sliced Attention
    if device == "cuda":
        pipe.enable_attention_slicing()
        print("[+] Optimization mémoire 'attention_slicing' activée.")

    prompt = "A futuristic secure data center, glowing neon cyber security cables, highly detailed, 8k"
    negative_prompt = "blurry, low quality, distorted, artifacts, noise"

    print(f"\n[QUERY] Prompt: '{prompt}'")
    print("[*] Génération de l'image (20 Denoising Steps)...")

    # Génération
    generator = torch.Generator(device=device).manual_seed(42)

    image = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt,
        num_inference_steps=20,
        guidance_scale=7.5,  # Classifier-Free Guidance (CFG Scale)
        generator=generator
    ).images[0]

    image.save("paradis_datacenter_sd.png")
    print("[+] Image sauvegardée avec succès : paradis_datacenter_sd.png")

if __name__ == "__main__":
    run_stable_diffusion_demo()
```

---

## Module 3 — ControlNet & Adaptateurs LoRA pour Diffusion (1h30)

### 🔍 Contrôle Spatial avec ControlNet

```
CONTROLNET — CONDITIONNEMENT SPATIAL AVANCÉ

  [ Prompt Texte ] ──────────────┐
                                 ▼
  [ Image Condition ] ──▶ [ ControlNet ] ──▶ [ U-Net Denoiser ] ──▶ [ Image Finale ]
  (ex: Edge Canny,          (Copie des          (Injection de
   Pose OpenPose,            couches U-Net       features de structure)
   Carte de Profondeur)      avec Zero-Convs)

AVANTAGES DE CONTROLNET :
  - Permet de verrouiller la composition exacte, les poses humaines ou les lignes d'architecture.
  - Les Zero-Convolutions (initialisées à 0) garantissent qu'au début de l'entraînement, ControlNet n'altère pas le modèle de base.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DDPM** | Denoising Diffusion Probabilistic Models — Modèles génératifs par diffusion probabiliste de bruit |
| **DDIM** | Denoising Diffusion Implicit Models — Variante d'échantillonnage accéléré sans processus stochastique |
| **VAE** | Variational Autoencoder — Encodeur/Décodeur compressant l'image en espace latent |
| **CFG** | Classifier-Free Guidance — Technique d'amplification de l'adhérence au prompt texte |
| **ControlNet** | Réseau auxiliaire ajoutant des conditions de structure spatiale aux modèles de diffusion |

---

## Exercices Pratiques

### Exercice 1 — Calcul d'Espace Latent VAE

Une image couleur RGB possède une résolution de $1024 \times 1024 \times 3$ pixels (soit $3\,145\,728$ valeurs). Le VAE de Stable Diffusion applique un facteur de compression spatiale de $f = 8$ et produit un tenseur latent de 4 canaux.
1. Calculez les dimensions du tenseur latent $(H_{lat}, W_{lat}, C_{lat})$.
2. Calculez le facteur de réduction du nombre de valeurs à traiter par le U-Net.

**Corrigé guidé :**
1. **Dimensions du Latent** :
   - $H_{lat} = 1024 / 8 = 128$
   - $W_{lat} = 1024 / 8 = 128$
   - $C_{lat} = 4$
   - Tenseur latent : $128 \times 128 \times 4$.
2. **Facteur de réduction** :
   - Valeurs dans le latent : $128 \times 128 \times 4 = 65\,536$ valeurs.
   - Facteur de réduction : $3\,145\,728 / 65\,536 = 48\times$ moins de données à traiter dans la boucle d'attention du U-Net.

---

## Banque QCM — 5 Questions

**Q1.** Dans un modèle de diffusion probabiliste (DDPM), que fait le processus **Forward ($q$)** ?

- A) Il nettoie l'image de tout son bruit.
- B) Il ajoute progressivement du bruit gaussien à l'image d'origine $x_0$ jusqu'à obtenir un bruit pur $\mathcal{N}(0, I)$. ✅
- C) Il génère le texte de description.
- D) Il compresse l'image au format PNG.

**Q2.** Quel est le rôle principal du **U-Net** lors du processus de génération dans Stable Diffusion ?

- A) Prédire la classe de l'image (chat ou chien).
- B) Prédire le bruit $\epsilon_\theta(x_t, t)$ présent dans le latent à l'étape $t$ pour pouvoir le soustraire. ✅
- C) Convertir l'image en code HTML.
- D) Calculer la vitesse d'apprentissage.

**Q3.** Pourquoi **Latent Diffusion** est-elle considérablement plus efficace que la diffusion standard en espace pixel ?

- A) Parce qu'elle n'utilise pas de GPU.
- B) Parce que le processus de débruitage itératif s'exécute dans l'espace latent compressé d'un VAE (ex: 64x64) au lieu de l'espace pixel haute résolution (ex: 512x512). ✅
- C) Parce qu'elle supprime le prompt texte.
- D) Parce qu'elle ne nécessite que 1 seul pas de calcul.

**Q4.** À quoi sert le paramètre **Classifier-Free Guidance (CFG Scale)** lors de l'inférence Stable Diffusion ?

- A) À régler la température du processeur.
- B) À contrôler la force avec laquelle le modèle doit se conformer au prompt texte par rapport au bruit inconditionnel (généralement réglé entre 7.0 et 12.0). ✅
- C) À choisir le format de fichier d'exportation (JPEG ou PNG).
- D) À définir la résolution de la caméra.

**Q5.** Quelle est la spécificité des **Zero-Convolutions** utilisées dans l'architecture **ControlNet** ?

- A) Elles ont des poids et biais initialisés à 0, garantissant qu'au début du fine-tuning, ControlNet ne détruit pas les capacités du modèle pré-entraîné de base. ✅
- B) Elles effectuent une division par zéro.
- C) Elles suppriment tous les canaux de couleur.
- D) Elles ne fonctionnent qu'avec des images en noir et blanc.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
