# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 456 (6h) : Fine-tuning LLMs & LoRA/QLoRA : PEFT, Quantisation 4-bit (NF4), SFT & DPO (Direct Preference Optimization)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre le paradigme **PEFT (Parameter-Efficient Fine-Tuning)** et les mathématiques de **LoRA (Low-Rank Adaptation)**
> - Maîtriser l'architecture de **QLoRA** : NormalFloat 4 (NF4), Double Quantization et Paged Optimizers
> - Implémenter un pipeline complet de **SFT (Supervised Fine-Tuning)** avec Hugging Face `trl`, `peft` et `bitsandbytes`
> - Structurer l'alignement par préférences humaines avec **DPO (Direct Preference Optimization)** sans entraînement de Reward Model séparé
>
> **Compétences visées :** `AI-02` (A) — LLM Fine-tuning, `AI-03` (A) — Advanced Model Alignment

---

## Module 1 — Fondements de LoRA & QLoRA (2h)

### 📖 Intuition & Narration

Le Fine-Tuning intégral (Full Fine-Tuning) d'un LLM de 8 ou 70 milliards de paramètres réclame la mise à jour de l'ensemble des poids $W$. Cela exige une quantité astronomique de VRAM (souvent 16 octets par paramètre en incluant les états de l'optimiseur AdamW, les gradients et les activations).

**LoRA (Low-Rank Adaptation)** repose sur un constat clé : lors de l'adaptation à une nouvelle tâche, les modifications apportées à la matrice de poids $\Delta W$ possèdent un **rang intrinsèque très faible** ($r \ll d$). Plutôt que de mettre à jour la grande matrice $W_0 \in \mathbb{R}^{d \times k}$, LoRA la gèle et lui adjoint un produit de deux petites matrices de rang bas $A \in \mathbb{R}^{r \times k}$ et $B \in \mathbb{R}^{d \times r}$.

**QLoRA (Quantized LoRA)** pousse la sobriété matérielle encore plus loin : la matrice de base $W_0$ est quantisée en 4-bit dans un format statistique optimisé (**NF4 — NormalFloat 4**), réduisant la mémoire du modèle de base à moins de 5 Go pour un modèle de 8B paramètres.

### 🔍 Anatomie Technique — Mathématiques de LoRA & QLoRA

```
ARCHITECTURE LORA (Low-Rank Adaptation)

        Entrée h
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
  [ W₀ ]      [ A ]  (Shape: r × k, initialisé en Gaussienne N(0, σ²))
 (GELÉ)          │
     │           ▼
     │        [ B ]  (Shape: d × r, initialisé à 0)
     │           │
     └─────┬─────┴─── (Multiplication par α / r)
           │
           ▼
        Sortie y = W₀h + (α / r) * BAh

FORMULE DU CALCUL :
  W_effective = W₀ + ΔW = W₀ + (α / r) * (B @ A)

PARAMÈTRES CLES :
  - r (Rank)       : Dimension interne des matrices (ex: r=8, 16, 64).
  - α (Alpha)      : Facteur d'échelle constant (souvent α = 2 * r).
  - Target Modules : Couches injectées (q_proj, v_proj, k_proj, o_proj, gate_proj).

INNOVATIONS QLORA :
  1. NF4 (NormalFloat 4) : Type de données d'information théoriquement optimal pour poids distribués selon N(0, σ²).
  2. Double Quantization : Quantise les constantes de quantification elles-mêmes (gain ~0.37 bit/paramètre).
  3. Paged Optimizers     : Utilise la mémoire unifiée CUDA/CPU pour éviter les erreurs Out-Of-Memory (OOM) lors des pics de gradients.
```

---

## Module 2 — Atelier Pratique SFT (Supervised Fine-Tuning) avec QLoRA (2h)

### 🛠️ Script d'Entraînement SFT Complet avec PyTorch, PEFT et TRL

```python
#!/usr/bin/env python3
"""
PARADIS — Script de Fine-Tuning QLoRA (SFT) pour LLaMA-3-8B
Adaptation d'un LLM aux consignes techniques de sécurité réseau et système.
"""

import torch
from datasets import Dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer

def run_qlora_sft():
    model_id = "meta-llama/Meta-Llama-3-8B-Instruct"

    # 1. Configuration de la quantisation 4-bit NF4 (QLoRA)
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
        bnb_4bit_use_double_quant=True
    )

    # 2. Chargement du Tokenizer et du Modèle
    tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        quantization_config=bnb_config,
        device_map="auto"
    )

    # Préparation pour entraînement 4-bit (gel des couches, cast en float32 des norm layers)
    model = prepare_model_for_kbit_training(model)

    # 3. Configuration LoRA
    peft_config = LoraConfig(
        r=16,
        lora_alpha=32,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM"
    )

    model = get_peft_model(model, peft_config)
    model.print_trainable_parameters()

    # 4. Données de démonstration au format Instruction
    data = [
        {
            "instruction": "Explique la différence entre HSRP et VRRP en infrastructure réseau.",
            "output": "HSRP (Cisco propriétaire) et VRRP (Standard ouvert RFC 5798) sont deux protocoles FHRP. HSRP utilise l'adresse IP virtuelle active dédiée, tandis que VRRP permet au Master d'utiliser l'adresse IP réelle de son interface."
        },
        {
            "instruction": "Comment sécuriser un serveur SSH contre les attaques par force brute ?",
            "output": "1. Désactiver PasswordAuthentication (authentification par clé ed25519 uniquement).\n2. Changer le port par défaut.\n3. Restreindre l'accès avec PermitRootLogin no.\n4. Configurer Fail2ban ou Nftables rate-limiting."
        }
    ]

    dataset = Dataset.from_list(data)

    def format_prompts(example):
        return f"<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n{example['instruction']}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n{example['output']}<|eot_id|>"

    # 5. Arguments d'Entraînement SFT
    training_args = TrainingArguments(
        output_dir="./paradis-llama3-qlora",
        per_device_train_batch_size=1,
        gradient_accumulation_steps=4,
        warmup_ratio=0.03,
        max_steps=50,
        learning_rate=2e-4,
        fp16=False,
        bf16=True,
        logging_steps=10,
        optim="paged_adamw_8bit",
        save_strategy="steps",
        save_steps=25
    )

    # 6. SFTTrainer
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        peft_config=peft_config,
        formatting_func=format_prompts,
        max_seq_length=512,
        tokenizer=tokenizer,
        args=training_args
    )

    print("[*] Démarrage du Fine-Tuning QLoRA...")
    trainer.train()
    print("[+] Entraînement terminé. Sauvegarde des adaptateurs LoRA...")
    trainer.model.save_pretrained("./paradis-llama3-adapter")

if __name__ == "__main__":
    print("Demo SFT QLoRA PARADIS IT (HuggingFace / PEFT / TRL)")
```

---

## Module 3 — Alignement avec DPO (Direct Preference Optimization) (1h30)

### 📖 Intuition & Narration

Une fois le modèle adapté aux instructions (SFT), il peut produire des réponses parfois verbeuses, imprécises ou non conformes aux politiques d'entreprise. Traditionnellement, l'alignement utilisait **RLHF (PPO)** qui exigeait l'entraînement d'un **Reward Model** intermédiaire complexe et instable.

**DPO (Direct Preference Optimization — Rafailov et al. 2023)** simplifie radicalement ce processus. DPO démontre mathématiquement qu'on peut directement optimiser la politique du LLM sur un jeu de données de préférences $(prompt, y_{chosen}, y_{rejected})$ en utilisant une simple perte de régression logistique binaire appliquée à la politique courante par rapport à une politique de référence gélée.

### 🔍 Anatomie Technique — Perte DPO (Direct Preference Optimization)

```
OBJECTIF ET FORMULE DE LA PERTE DPO

  Données : Triplet (Prompt x, Réponse Préférée y_w, Réponse Rejetée y_l)

  Formule de Perte :
  L_DPO(π_θ; π_ref) = -E_{(x, y_w, y_l)} [ log σ ( β * log( π_θ(y_w|x) / π_ref(y_w|x) ) - β * log( π_θ(y_l|x) / π_ref(y_l|x) ) ) ]

  AVANTAGES PAR RAPPORT À RLHF (PPO) :
  1. Pas de Reward Model séparé à entraîner.
  2. Pas d'échantillonnage dynamique (rollouts) durant l'entraînement.
  3. Stabilité d'optimisation égale à un entraînement supervisé classique.
  4. Hyperparamètre β (généralement entre 0.1 et 0.5) régulant l'écart à la politique de référence.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PEFT** | Parameter-Efficient Fine-Tuning — Ensemble de méthodes pour adapter des LLMs avec peu de paramètres |
| **LoRA** | Low-Rank Adaptation — Ingestion de matrices de rang faible $A$ et $B$ sur les projections d'attention |
| **QLoRA** | Quantized Low-Rank Adaptation — Fine-tuning avec modèle de base en 4-bit NF4 |
| **SFT** | Supervised Fine-Tuning — Entraînement supervisé par paires (Instruction, Réponse) |
| **DPO** | Direct Preference Optimization — Alignement direct sur préférences sans Reward Model séparé |
| **NF4** | NormalFloat 4 — Type de données quantisé 4-bit optimisé pour les poids gaussiens |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Paramètres Entraînables avec LoRA

Considérez un modèle avec une dimension cachée $d_{model} = 4096$. Les matrices de projection Query ($W_q$) et Value ($W_v$) ont une dimension de $4096 \times 4096$.
1. Calculez le nombre de paramètres de $W_q$ et $W_v$ combinés dans le modèle original.
2. Si l'on applique LoRA avec un rang $r = 16$ sur $W_q$ et $W_v$, quel est le nombre de paramètres entraînables apportés par les adaptateurs LoRA pour ces deux matrices ?
3. Calculez le pourcentage de réduction des paramètres pour ces deux matrices.

**Corrigé guidé :**
1. Taille originale : $W_q + W_v = (4096 \times 4096) + (4096 \times 4096) = 16\,777\,216 + 16\,777\,216 = 33\,554\,432$ paramètres (soit ~33.5M de paramètres).
2. Pour chaque matrice, LoRA ajoute $A \in \mathbb{R}^{16 \times 4096}$ et $B \in \mathbb{R}^{4096 \times 16}$.
   Paramètres LoRA pour une matrice = $(16 \times 4096) + (4096 \times 16) = 65\,536 + 65\,536 = 131\,072$.
   Pour $W_q$ et $W_v$ combinés : $2 \times 131\,072 = 262\,144$ paramètres.
3. Pourcentage de paramètres entraînables : $(262\,144 / 33\,554\,432) \times 100 \approx 0.781\%$.
   LoRA permet d'entraîner moins de **0.8%** des paramètres d'origine pour ces couches, divisant le volume de paramètres par plus de 128.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la raison principale de l'initialisation de la matrice $B$ de LoRA à zéro au début du fine-tuning ?

- A) Prévenir la division par zéro lors du calcul du gradient.
- B) Garantir qu'au début de l'entraînement $h + \Delta h = h$, conservant exactement le comportement du modèle pré-entraîné original. ✅
- C) Réduire l'empreinte mémoire RAM de l'hôte.
- D) Accélérer le temps de compilation CUDA.

**Q2.** Dans QLoRA, qu'apporte le format de quantisation **NF4 (NormalFloat 4)** par rapport à un INT4 standard ?

- A) Il permet de stocker des chaînes de caractères directement dans les poids.
- B) Il distribue les 16 niveaux de quantisation selon les quantiles d'une distribution normale $\mathcal{N}(0, 1)$, réduisant l'erreur de quantisation sur les poids d'un LLM. ✅
- C) Il élimine complètement la nécessité d'utiliser un GPU.
- D) Il double le nombre de paramètres du modèle.

**Q3.** La technique **Double Quantization** dans QLoRA consiste à :

- A) Quantiser les entrées et les sorties du réseau simultanément.
- B) Quantiser les constantes d'échelle (quantization constants) elles-mêmes, économisant environ 0.37 bit par paramètre. ✅
- C) Utiliser deux GPUs en parallèle pour la quantification.
- D) Quantiser les poids deux fois de suite en INT8 puis en INT4.

**Q4.** Par rapport au RLHF classique basé sur PPO, **DPO (Direct Preference Optimization)** offre l'avantage principal :

- A) De supprimer la nécessité de disposer de données de préférences humaines.
- B) D'éliminer le besoin d'entraîner un modèle de récompense (Reward Model) séparé et de procéder à un échantillonnage dynamique d'actions durant l'entraînement. ✅
- C) D'augmenter la vitesse d'inférence du modèle final de 10x.
- D) De rendre le modèle totalement insensible au prompt.

**Q5.** Si le paramètre $r$ (rank) de LoRA est fixé à 8 et que $\alpha$ (alpha) est fixé à 16, quel est le facteur multiplicatif appliqué à la branche LoRA $(B \cdot A)$ lors de l'addition aux poids originaux ?

- A) $16 / 8 = 2.0$ ✅
- B) $8 / 16 = 0.5$
- C) $16 \times 8 = 128$
- D) $1.0$

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
