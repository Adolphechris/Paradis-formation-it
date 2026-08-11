# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 472 (6h) : Multimodal AI & Vision-Language Models (VLM) : CLIP, LLaVA, DocVQA, OCR-Free Document Understanding & Multimodal Benchmarks

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre l'architecture d'alignement multimodal **CLIP (Contrastive Language-Image Pre-training)**
> - Analyser les modèles **Vision-Language (VLM)** récents (LLaVA, Gemini Vision) : Vision Encoder + Linear Projector + LLM Backbone
> - Implémenter un pipeline de **Document Understanding (DocVQA)** pour l'analyse automatique d'infrastructures et schémas
> - Évaluer la performance multimodale avec les benchmarks de référence (MMMU, MathVista, VQA-v2)
>
> **Compétences visées :** `AI-02` (A) — Multimodal AI Architectures & Vision-Language Processing

---

## Module 1 — Alignement Multimodal : CLIP & Contrasting Learning (2h)

### 📖 Intuition & Narration

Pendant longtemps, la Vision par Ordinateur et le Traitement du Langage Naturel ont évolué dans des silos séparés. **CLIP (Contrastive Language-Image Pre-training — OpenAI 2021)** a brisé cette frontière en entraînant simultanément un encodeur d'images (ViT) et un encodeur de texte (Transformer) à projeter leurs représentations dans un **espace vectoriel partagé**.

L'objectif de CLIP est simple : pour un batch de $N$ paires $(image, texte)$, l'apprentissage contrastif maximise le produit scalaire entre le vecteur de l'image $i$ et le vecteur du texte correspondant $i$, tout en minimisant la similarité avec les $N-1$ autres textes non correspondants.

### 🔍 Anatomie Technique — Matrix de Loss Contrastive CLIP

```
APPRENTISSAGE CONTRASTIF CLIP (InfoNCE Loss)

  Batch de N Paires (Image_i, Text_i)

  Image Encoder (ViT) ──▶ Embeddings d'Images I_1, I_2, ..., I_N  (Shape: N × d)
  Text Encoder (Transformer) ──▶ Embeddings de Textes T_1, T_2, ..., T_N  (Shape: N × d)

  Matrice des Scores de Similarité Cosinus S (N × N) :
  S_{i,j} = (I_i · T_j) / (||I_i|| * ||T_j||) * exp(t)    (t = température apprise)

  ┌─────────────────────────────────────────────────────────────┐
  │  S_{1,1} (VRAI) │  S_{1,2} (FAUX) │ ... │  S_{1,N} (FAUX)   │
  ├─────────────────┼─────────────────┼─────┼───────────────────┤
  │  S_{2,1} (FAUX) │  S_{2,2} (VRAI) │ ... │  S_{2,N} (FAUX)   │
  ├─────────────────┼─────────────────┼─────┼───────────────────┤
  │  ...            │  ...            │ ... │  ...              │
  └─────────────────────────────────────────────────────────────┘

  PERTE INFONCE (Cross-Entropy sur la Diagonale) :
  L_contrastive = 0.5 * Loss_labels_images + 0.5 * Loss_labels_textes
  ──▶ La diagonale S_{i,i} doit tendre vers 1, tous les autres éléments vers 0.
```

---

## Module 2 — Architecture des VLMs Modernes : LLaVA & Gemini Vision (2h)

### 🔍 Anatomie — Pipeline LLaVA (Large Language and Vision Assistant)

```
ARCHITECTURE LLaVA (Liu et al. 2023)

  [ Image Input ]
         │
         ▼
  [ Vision Tower (CLIP ViT-L/14) ] ──▶ Visual Tokens Z_v  (Shape: 576 × 1024)
         │
         ▼
  [ Linear Projection Layer W ]     ──▶ Visual Embeddings H_v (Shape: 576 × 4096)
         │
         └─────────────────────────┐
                                   ▼
  [ Text Prompt ] ───────────► [ LLM Backbone (LLaMA-3 / Vicuna) ]
                                   │
                                   ▼
                            [ Response Text ]

PRINCIPE DU PROJECTEUR LINÉAIRE W :
  H_v = W * Z_v  (où W est une simple matrice de projection linéaire ou MLP 2 couches).
  Le projecteur adapte les dimensions des visual tokens pour qu'ils soient directement
  consommables par le LLM comme s'il s'agissait de tokens de texte ordinaires !
```

### 🛠️ Atelier Pratique — Pipeline VLM avec Hugging Face `transformers`

```python
#!/usr/bin/env python3
"""
PARADIS — Pipeline d'Inférence Multimodale Vision-Langage (VLM)
Analyse d'un schéma d'architecture réseau ou d'un rapport de sécurité avec LLaVA / IDEFICS
"""

import torch
from PIL import Image
import numpy as np

def run_vlm_demo():
    print("[*] --- DÉMONSTRATION PIPELINE MULTIMODAL VLM PARADIS IT ---")

    # Simulation de création d'une image synthétique d'infrastructure (224x224 RGB)
    synthetic_image = Image.fromarray(np.uint8(np.random.rand(224, 224, 3) * 255))
    synthetic_image.save("network_schema_temp.png")
    print("[+] Image d'infrastructure réseau créée : network_schema_temp.png")

    try:
        from transformers import AutoProcessor, LlavaForConditionalGeneration

        model_id = "llava-hf/llava-1.5-7b-hf"
        print(f"[*] Chargement du VLM {model_id} (Vision Tower + LLaMA)...")

        processor = AutoProcessor.from_pretrained(model_id)
        model = LlavaForConditionalGeneration.from_pretrained(
            model_id,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto"
        )

        prompt = "USER: <image>\nIdentifie les composants réseau présents sur ce schéma et vérifie s'il y a une faille de sécurité.\nASSISTANT:"

        inputs = processor(text=prompt, images=synthetic_image, return_tensors="pt").to(model.device)

        generate_ids = model.generate(**inputs, max_new_tokens=100)
        response = processor.batch_decode(generate_ids, skip_special_tokens=True)[0]

        print("\n--- RÉPONSE DU MODÈLE MULTIMODAL VLM ---")
        print(response)

    except Exception as e:
        print(f"[!] Bibliothèques VLM lourdes non chargées en local ({e}). Mode simulation actif.")
        print("\n--- SIMULATION RÉPONSE VLM (DocVQA) ---")
        print("  • Composants Détectés : 1 Pare-feu Nftables, 2 Serveurs Web Nginx, 1 Base de Données PostgreSQL.")
        print("  • Diagnostic de Sécurité : La base de données PostgreSQL est exposée directement sur le port 5432 sans DMZ. Risque Élevé.")

if __name__ == "__main__":
    run_vlm_demo()
```

---

## Module 3 — Document Understanding (DocVQA) & Benchmarks (1h30)

### 🔍 Benchmarks de Référence pour Modèles Multimodaux

```
BENCHMARKS DE VÉRIFICATION MULTIMODALE

  1. DocVQA (Document Visual Question Answering) :
     - Évalue la capacité à lire et comprendre du texte dans des documents complexes (factures, schémas, formulaires) sans OCR séparé.

  2. MMMU (Massive Multi-discipline Multimodal Understanding) :
     - 11 500 questions de niveau universitaire couvrant 30 disciplines (Ingénierie, Physique, Médecine, Informatique).

  3. MathVista :
     - Évalue le raisonnement mathématique et géométrique visuel (graphiques, diagrammes).

  4. ChartQA :
     - Évalue l'extraction de données et le calcul de tendances à partir de graphiques boursiers et statistiques.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **VLM** | Vision-Language Model — Modèle de fondation capable de traiter et générer du texte et des images |
| **CLIP** | Contrastive Language-Image Pre-training — Modèle d'alignement espace vectoriel joint texte/image |
| **DocVQA** | Document Visual Question Answering — Tâche de réponse à des questions sur documents visuels |
| **InfoNCE** | Information Noise-Contrastive Estimation — Perte contrastive maximisant la mutual information |
| **MMMU** | Massive Multi-discipline Multimodal Understanding — Benchmark multimodal académique de référence |

---

## Exercices Pratiques

### Exercice 1 — Calcul de la Matrice de Loss CLIP

Pour un batch de $N = 4$ paires image-texte, les similarités cosinus calculées (produits scalaires $I_i \cdot T_j$) forment la matrice $4 \times 4$ suivante :

$$S = \begin{pmatrix} 0.95 & 0.10 & 0.05 & 0.02 \\ 0.12 & 0.88 & 0.08 & 0.04 \\ 0.03 & 0.15 & 0.92 & 0.10 \\ 0.01 & 0.02 & 0.05 & 0.97 \end{pmatrix}$$

1. Identifiez les éléments qui représentent les bonnes associations image-texte.
2. Expliquez comment la perte Cross-Entropy s'applique à cette matrice pour forcer l'alignement contrastif.

**Corrigé guidé :**
1. **Bonnes associations** : Les éléments diagonaux $S_{1,1} = 0.95$, $S_{2,2} = 0.88$, $S_{3,3} = 0.92$, $S_{4,4} = 0.97$ représentent les paires réelles correspondantes (ex: Image 1 et Texte 1).
2. **Application de la perte** : Pour chaque ligne $i$ (Image $i$), la fonction Softmax transforme la ligne en une distribution de probabilités. La perte Cross-Entropy force la valeur de la diagonale $S_{i,i}$ à tendre vers 1.0 (probabilité 100%) tout en poussant les éléments hors-diagonale (fausses paires) vers 0.0.

---

## Banque QCM — 5 Questions

**Q1.** Quel est le principe de base de l'apprentissage contrastif utilisé dans **CLIP (OpenAI)** ?

- A) Générer du texte mot à mot en traduisant une image.
- B) Maximiser la similarité Cosinus entre les embeddings d'une image et de son texte descriptif correspondant, tout en minimisant la similarité avec tous les autres textes du batch. ✅
- C) Compresser les images en format GIF.
- D) Détecter les visages humains dans une vidéo.

**Q2.** Dans l'architecture d'un VLM comme **LLaVA**, quel est le rôle du **Projecteur Linéaire (Linear Projection Layer / MLP)** ?

- A) Remplacer l'écran de l'ordinateur.
- B) Projeter et adapter la dimension des visual tokens extraits par le Vision Encoder (ViT) pour qu'ils s'alignent sur la dimension des embeddings de mots du LLM. ✅
- C) Calculer la facture d'électricité du serveur.
- D) Chiffrer la mémoire RAM.

**Q3.** En quoi consiste la tâche de **Document Visual Question Answering (DocVQA)** ?

- A) Prédire la météo de demain.
- B) Poser une question en langage naturel sur un document scanné ou un schéma visuel complexe (facture, architecture), le modèle y répondant directement sans passer par un OCR externe. ✅
- C) Calculer la taille d'un fichier PDF.
- D) Traduire du code Python en Java.

**Q4.** Pourquoi les VLMs récents réutilisent-ils généralement des modèles d'images pré-entraînés (ex: CLIP ViT) et des LLMs pré-entraînés (ex: LLaMA-3) au lieu de tout entraîner depuis zéro ?

- A) Parce qu'il est impossible d'entraîner des images et du texte en même temps.
- B) Pour tirer profit des milliards d'heures d'apprentissage déjà réalisées sur le texte et les images, en entraînant uniquement le projecteur d'alignement (économisant des millions d'heures GPU). ✅
- C) Parce que les fichiers de texte sont plus lourds que les images.
- D) Pour respecter les normes ISO 9001.

**Q5.** Dans le benchmark **MMMU (Massive Multi-discipline Multimodal Understanding)**, les questions portent sur :

- A) Des jeux vidéo uniquement.
- B) Des tâches multimodales de niveau universitaire couvrant 30 disciplines scientifiques et techniques (schémas, calculs géométriques, diagrammes d'ingénierie). ✅
- C) Des requêtes SQL basiques.
- D) La prononciation des mots en espagnol.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
