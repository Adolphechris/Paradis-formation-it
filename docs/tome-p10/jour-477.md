# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 477 (6h) : Optimisation de l'Inférence LLM : KV-Cache, FlashAttention-2/3, PagedAttention (vLLM), Continuous Batching & Speculative Decoding

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre la gestion de la mémoire lors de la génération autoregressive : **KV-Cache** et sa fragmentation
> - Maîtriser le fonctionnement de **FlashAttention-2/3** (Tiling SRAM/HBM sans écriture intermédiaire)
> - Analyser l'architecture **PagedAttention (vLLM)** et le principe de mémoire virtuelle pagination
> - Implémenter le **Continuous Batching** et le **Speculative Decoding** pour maximiser le débit (Tokens/sec)
>
> **Compétences visées :** `AI-02` (A) — LLM Inference Optimization & High-Throughput Serving

---

## Module 1 — Le KV-Cache & FlashAttention-2 (2h)

### 📖 Intuition & Narration

Lors de la génération autoregressive d'un LLM, chaque nouveau token généré nécessite de re-calculer les vecteurs Query, Key et Value pour tous les tokens précédents. Pour éviter de recalculer les clés ($K$) et valeurs ($V$) des pas passés, l'inférence les conserve en mémoire VRAM : c'est le **KV-Cache**.

Cependant, le KV-Cache grandit de manière linéaire avec la longueur de la séquence et la taille du batch. Pour un grand modèle sous charge, la mémoire VRAM est saturée non pas par les poids du modèle, mais par le KV-Cache !

Par ailleurs, le calcul standard de l'attention $\text{Softmax}(QK^T / \sqrt{d})V$ écrit la grande matrice de scores $N \times N$ dans la mémoire globale (HBM) du GPU, créant un **goulot d'étranglement de bande passante**. **FlashAttention** (Dao et al.) réécrit cet algorithme en utilisant des blocs de mémoire SRAM ultra-rapide et un recalcul de Softmax par pavage (tiling) sans jamais stocker la matrice d'attention complète en HBM.

### 🔍 Anatomie Technique — Goulot d'Étranglement Mémoire & FlashAttention

```
FLASHATTENTION : TILING MEMOIRE HBM ──▶ SRAM

  CALCUL ATTENTION STANDARD (Lent - Bottleneck HBM) :
  Q, K, V (en HBM) ──▶ Q @ K^T (Écrit S en HBM - O(N²)) ──▶ Softmax(S) (Écrit P en HBM) ──▶ P @ V (Sortie O)

  FLASHATTENTION (Rapide - Tiling SRAM) :
  Découpe Q, K, V en petits blocs (SRAM tile) ──▶ Calcul d'Attention par blocs ──▶ Re-scaling Softmax en ligne
  ──▶ AUCUNE écriture de la matrice N×N en mémoire globale HBM !
  ──▶ Accélération de 2x à 4x et réduction de la mémoire de O(N²) à O(N).
```

---

## Module 2 — Atelier Pratique : Inférence vLLM avec PagedAttention & Continuous Batching (2h)

### 🛠️ Architecture vLLM (PagedAttention) & Serving Haute Performance

```python
#!/usr/bin/env python3
"""
PARADIS — Service d'Inférence LLM Haute Performance avec vLLM & PagedAttention
Déploiement à fort débit (High Throughput Tokens/sec) et batching dynamique.
"""

def run_vllm_inference_demo():
    print("[*] --- SERVING LLM HAUTE PERFORMANCE PARADIS IT (vLLM) ---")

    try:
        from vllm import LLM, SamplingParams

        # 1. Chargement du modèle avec PagedAttention et Quantisation AWQ
        model_id = "casperhansen/llama-3-8b-instruct-awq"
        print(f"[*] Chargement du modèle {model_id} via vLLM Engine...")

        llm = LLM(
            model=model_id,
            quantization="awq",
            tensor_parallel_size=1,     # 1 GPU
            gpu_memory_utilization=0.90, # 90% VRAM allouée au KV-Cache pactivé
            max_model_len=4096
        )

        # 2. Configuration des paramètres d'échantillonnage
        sampling_params = SamplingParams(
            temperature=0.7,
            top_p=0.9,
            max_tokens=256
        )

        prompts = [
            "Explique le rôle de PagedAttention dans vLLM :",
            "Rédige une règle Suricata pour détecter une attaque SQL injection :"
        ]

        # 3. Inférence avec Continuous Batching
        print("[*] Inférence en cours avec Continuous Batching...")
        outputs = llm.generate(prompts, sampling_params)

        for output in outputs:
            prompt_text = output.prompt
            generated_text = output.outputs[0].text
            print(f"\n[PROMPT] : {prompt_text}")
            print(f"[RÉPONSE] : {generated_text[:150]}...\n")

    except ImportError:
        print("[!] Bibliothèque 'vllm' non installée (pip install vllm). Mode simulation conceptuelle.")
        print("\n--- SIMULATION PERFORMANCES VLLM (PagedAttention) ---")
        print("  • Mémoire KV-Cache libérée (Fragmentation zéro) : +350% de débit (Tokens/sec).")
        print("  • Débit de génération (Throughput)             : 185 tokens/sec / GPU.")
        print("  • Temps jusqu'au premier token (TTFT)           : 24 ms.")

if __name__ == "__main__":
    run_vllm_inference_demo()
```

---

## Module 3 — Speculative Decoding & Benchmarks de Latence (1h30)

### 🔍 Décodage Spéculatif & Métriques de Performance (TPS / TTFT)

```
ARCHITECTURE DE DECODAGE SPÉCULATIF (Speculative Decoding)

  1. Petit Modèle Draft (ex: LLaMA-68M) :
     - Génère très rapidement K tokens candidats (ex: K = 5 tokens).
     - Temps : Très court (~2 ms par token).

  2. Grand Modèle Cible (ex: LLaMA-70B) :
     - Évalue les K tokens candidats en UN SEUL PAS AVANT en parallèle.
     - Accepte ou rejette les tokens selon un critère d'échantillonnage ajusté.

  RESULTAT :
  - Si 4 des 5 tokens sont acceptés ──▶ Génération de 4 tokens dans le temps d'une seule passe du grand modèle !
  - Accélération de 2x à 3x du temps par token sans AUCUNE perte de qualité exacte !

MÉTRIQUES DE BENCHMARK LLM SERVING :
  - TTFT (Time To First Token) : Latence entre l'envoi de la requête et l'affichage du tout premier mot (SLA < 100ms).
  - TPOT (Time Per Output Token) : Latence moyenne entre chaque token consécutif.
  - TPS (Tokens Per Second) : Débit global de génération du serveur.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **KV-Cache** | Key-Value Cache — Stockage en VRAM des vecteurs Key et Value des tokens passés |
| **vLLM** | Moteur d'inférence LLM à haut débit reposant sur la mémoire virtuelle PagedAttention |
| **TTFT** | Time To First Token — Temps s'écoulant jusqu'à l'émission du premier token généré |
| **TPS** | Tokens Per Second — Nombre total de tokens générés par seconde par une instance |
| **AWQ** | Activation-aware Weight Quantization — Quantisation 4-bit préservant les canaux d'activation importants |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Taille de KV-Cache

Calculez la mémoire VRAM consommée par le **KV-Cache** pour un modèle LLaMA-3-8B dans les conditions suivantes :
- $L = 32$ couches.
- $H_{kv} = 8$ têtes Key-Value (Grouped Query Attention).
- $d_{head} = 128$ dimensions par tête.
- Précision : FP16 ($2$ octets par valeur).
- Longueur de séquence : $N = 4096$ tokens.
- Batch Size : $B = 16$ utilisateurs simultanés.

Formule du KV-Cache par séquence :
$$\text{Mémoire KV} = 2 \times (\text{Key} + \text{Value}) = 2 \times L \times H_{kv} \times d_{head} \times N \times \text{BytesPerElement}$$

**Corrigé guidé :**
1. **Mémoire par token pour une séquence** :
   $$\text{KV}_{token} = 2 \times 32 \times 8 \times 128 \times 2 \text{ octets} = 131\,072 \text{ octets} \approx 131 \text{ KB / token}.$$
2. **Mémoire pour une séquence de 4096 tokens** :
   $$\text{KV}_{seq} = 131\,072 \times 4096 = 536\,870\,912 \text{ octets} = 512 \text{ MB / séquence}.$$
3. **Mémoire totale pour un batch de 16 utilisateurs** :
   $$\text{KV}_{total} = 512 \text{ MB} \times 16 = 8\,192 \text{ MB} = 8.0 \text{ GB de VRAM}.$$
   Le KV-Cache consomme à lui seul **8 Go de VRAM**, autant que les poids du modèle quantisé en 8-bit !

---

## Banque QCM — 5 Questions

**Q1.** Pourquoi le **KV-Cache** est-il indispensable lors de l'inférence autoregressive d'un LLM ?

- A) Pour empêcher le processeur de chauffer.
- B) Pour éviter de re-calculer inutilement les vecteurs Key et Value de tous les tokens passés de la séquence à chaque nouveau token généré. ✅
- C) Pour chiffrer la réponse transmise au client.
- D) Pour traduire le texte en anglais.

**Q2.** Quelle est l'innovation majeure apportée par **FlashAttention-2** ?

- A) L'utilisation de bases de données SQL pour le stockage.
- B) L'exécution du calcul d'attention par pavage (tiling) directement dans la mémoire SRAM rapide du GPU sans écrire la grande matrice d'attention $N \times N$ en mémoire globale HBM. ✅
- C) La suppression des couches d'attention.
- D) L'accélération des connexions Internet.

**Q3.** Comment le système **PagedAttention (vLLM)** résout-il le problème du gaspillage mémoire du KV-Cache ?

- A) En supprimant les tokens d'entrée.
- B) En s'inspirant de la mémoire virtuelle des systèmes d'exploitation : il découpe le KV-Cache en pages de taille fixe (ex: 16 tokens) allouées dynamiquement et non contiguës en VRAM, éliminant la fragmentation interne et externe. ✅
- C) En convertissant les poids en format MP3.
- D) En limitant la taille des réponses à 10 mots.

**Q4.** Le principe du **Decodage Spéculatif (Speculative Decoding)** repose sur :

- A) L'utilisation d'un détective privé.
- B) La génération rapide de plusieurs tokens candidats par un petit modèle "Draft", suivie de leur vérification en un seul pas parallèle par le grand modèle cible. ✅
- C) La prédiction de la météo pendant la génération.
- D) L'arrêt de l'inférence si une erreur survient.

**Q5.** Quelle métrique de serving mesure le délai s'écoulant entre l'envoi d'un prompt par l'utilisateur et l'apparition du premier caractère de réponse ?

- A) TPS (Tokens Per Second)
- B) TTFT (Time To First Token) ✅
- C) CPU Utilization
- D) Bandwidth Rate

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
