# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 490 (6h) : Audio & Speech AI : Whisper (OpenAI), Speech-to-Text (STT), Text-to-Speech (TTS) & Real-Time Voice Agents

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre la transformation des signaux audio en spectrogrammes Mel (Mel-Spectrograms) pour le Deep Learning
> - Maîtriser l'architecture de transcription automatique de la parole **Whisper (OpenAI)**
> - Analyser les modèles de synthèse vocale (Text-to-Speech - TTS) et de clonage de voix (Voice Cloning)
> - Construire un pipeline d'**Agent Vocal Temps Réel (Real-Time Voice Agent)** à ultra-faible latence (< 500ms)
>
> **Compétences visées :** `AI-01` (A), `AI-02` (A) — Audio Deep Learning & Speech Processing

---

## Module 1 — Du Signal Audio au Mel-Spectrogramme & Whisper (2h)

### 📖 Intuition & Narration

Un signal sonore brut est une onde unidimensionnelle de pression d'air capturée à des fréquences d'échantillonnage de $16\text{ kHz}$ ou $44.1\text{ kHz}$ (16 000 ou 44 100 mesures par seconde). Traiter cette onde temporelle brute directement est inefficace.

Pour appliquer les modèles de fondation (Transformers), on applique la **Transformée de Fourier à Court Terme (STFT)** pour convertir l'onde sonore en une représentation temps-fréquence 2D : le **Mel-Spectrogramme**. Cette matrice image 2D (Fréquence en Hz sur l'échelle de Mel $\times$ Temps en secondes) est ensuite consommée par un Encoder visuel ou Transformer.

### 🔍 Anatomie Technique — Architecture Whisper (OpenAI)

```
ARCHITECTURE WHISPER (OpenAI - Sequence-to-Sequence Transformer)

  [ Audio 30 sec (16kHz) ]
            │
            ▼
  [ Log-Mel Spectrogramme (80 canaux) ]
            │
            ▼
  [ Audio Encoder (Conv1D + Transformer Encoder) ]
            │
            ▼
  [ Audio Embeddings (Shape: 1500 × d_model) ]
            │
            └─────────────────────────┐
                                      ▼
  [ Decoder Prompt Tokens ] ───► [ Text Decoder (Transformer Decoder) ]
  (Langue, Task: Transcribe,          │
   Timestamps, Token Précédent)       ▼
                              [ Tokens de Texte Transcrits + Timestamps ]

TÂCHES MULTIPLES DE WHISPER (Multitask Prompt Tokens) :
  - Transcrire la parole dans la langue d'origine (Speech-to-Text).
  - Traduire directement la parole vers l'anglais (Speech-Translation).
  - Détecter la langue parlée (Language Identification).
  - Prédire l'horodatage exact au niveau du mot (Word-level Timestamps).
```

---

## Module 2 — Atelier Pratique : Pipeline STT avec Whisper (2h)

### 🛠️ Code Python : Transcription et Détection de Langue avec Whisper

```python
#!/usr/bin/env python3
"""
PARADIS — Transcription Automatique de la Parole (Speech-to-Text) avec Whisper
"""

import numpy as np

def run_whisper_demo():
    print("[*] --- DÉMONSTRATION TRANSCRIPTION WHISPER PARADIS IT ---")

    # Simulation d'un signal audio de 5 secondes à 16kHz
    sample_rate = 16000
    duration_sec = 5
    synthetic_audio = np.sin(2 * np.pi * 440 * np.linspace(0, duration_sec, sample_rate * duration_sec)).astype(np.float32)

    try:
        import whisper

        print("[*] Chargement du modèle Whisper Base...")
        model = whisper.load_model("base")

        # Inférence de transcription
        result = model.transcribe(synthetic_audio, fp16=False)

        print("\n--- RÉSULTAT DE LA TRANSCRIPTION WHISPER ---")
        print(f"  • Langue détectée : {result.get('language', 'fr')}")
        print(f"  • Texte transcrit : '{result.get('text', '')}'")

    except ImportError:
        print("[!] Bibliothèque 'openai-whisper' non installée (pip install openai-whisper). Mode démo actif.")
        print("\n--- SIMULATION TRANSCRIPTION WHISPER (Camembert/Whisper Large-v3) ---")
        print("  • Langue Détectée : French (fr) - Confiance: 99.8%")
        print("  • Texte Transcrit : 'Bonjour, bienvenue dans le module d'Intelligence Artificielle PARADIS IT.'")
        print("  • Horodatage      : [00:00.000 -> 00:04.500]")

if __name__ == "__main__":
    run_whisper_demo()
```

---

## Module 3 — Real-Time Voice Agents & Latence Sub-500ms (1h30)

### 🔍 Pipeline d'un Agent Vocal Conversational Temps Réel

```
PIPELINE DE DIALOGUE VOCAL EN SÉRIE VS DUPLEX

  PIPELINE SÉRIE TRADITIONNEL (Latence: 1.5s à 3s) :
  [ Micro Utilisateur ] ──► [ STT (Whisper) ] ──► [ LLM (LLaMA) ] ──► [ TTS (ElevenLabs) ] ──► [ Haut-parleur ]
                            (Latence ~500ms)      (Latence ~800ms)     (Latence ~500ms)

  AGENT VOCAL NATIVEMENT MULTIMODAL (GPT-4o Realtime / Gemini Live - Latence < 300ms) :
  [ Flux Audio In (WebRTC / WebSocket) ] ──► [ Modèle Audio-to-Audio ] ──► [ Flux Audio Out ]
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **STT** | Speech-to-Text — Conversion d'un signal vocal en texte écrit (Transcription) |
| **TTS** | Text-to-Speech — Synthèse vocale générant de l'audio à partir de texte |
| **STFT** | Short-Time Fourier Transform — Transformation du signal temporel en spectre fréquentiel |
| **WER** | Word Error Rate — Taux d'erreur de mots mesurant la précision d'une transcription STT |
| **WebRTC** | Web Real-Time Communication — Protocole de streaming audio/vidéo temps réel sous-300ms |

---

## Exercices Pratiques

### Exercice 1 — Calcul du Word Error Rate (WER)

Pour évaluer un système Speech-to-Text (STT) sur un enregistrement audio de sécurité :
- Phrase de référence (Vérité terrain) : *"Le serveur web Nginx est arrêté."* (6 mots).
- Phrase transcrite par le modèle : *"Le serveur web Apache est arrêté."* (1 substitution de mot : Nginx $\rightarrow$ Apache).
Formule du WER :
$$\text{WER} = \frac{S + D + I}{N}$$
où $S$ = Substitutions, $D$ = Deletions (omissions), $I$ = Insertions, $N$ = Nombre de mots de référence.

1. Calculez le **WER** de ce modèle.
2. Si le modèle avait transcrit *"Le serveur web est arrêté"* (1 omission $D=1$), quel aurait été le WER ?

**Corrigé guidé :**
1. **Calcul du WER (Substitution)** :
   $$S = 1, D = 0, I = 0, N = 6 \implies \text{WER} = \frac{1 + 0 + 0}{6} = \frac{1}{6} \approx 0.1667 \quad (16.67\%).$$
2. **Calcul du WER (Omission)** :
   $$S = 0, D = 1, I = 0, N = 6 \implies \text{WER} = \frac{0 + 1 + 0}{6} = \frac{1}{6} \approx 0.1667 \quad (16.67\%).$$
   Dans les deux cas, le taux d'erreur de mots est de **16.67%**.

---

## Banque QCM — 5 Questions

**Q1.** Pourquoi transforme-t-on le signal audio brut 1D en un **Mel-Spectrogramme** 2D avant de l'injecter dans le modèle Whisper ?

- A) Pour réduire la taille du fichier au format MP3.
- B) Pour convertir le signal temporel en une représentation temps-fréquence 2D adaptée au traitement par des réseaux de neurones (Convolutions et Attention). ✅
- C) Pour supprimer le son.
- D) Pour traduire le texte en anglais.

**Q2.** Quelle est la métrique standard utilisée pour mesurer la précision des systèmes de transcription vocale (Speech-to-Text) ?

- A) F1-Score
- B) WER (Word Error Rate) ✅
- C) ROC-AUC
- D) BLEU Score

**Q3.** Quel est l'avantage clé de l'architecture **Whisper (OpenAI)** par rapport aux anciens modèles de transcription ?

- A) Whisper ne fonctionne qu'avec du texte.
- B) Whisper est entraîné sur 680 000 heures d'audio multilingue et multitâche, réalisant simultanément la détection de langue, la transcription et la traduction. ✅
- C) Whisper supprime le besoin de cartes graphiques.
- D) Whisper est écrit en HTML5.

**Q4.** Pourquoi les pipelines de dialogue vocal traditionnels (STT $\rightarrow$ LLM $\rightarrow$ TTS en série) présentent-ils une latence élevée ($> 1.5\text{s}$) ?

- A) Parce que le câble Ethernet est trop long.
- B) Parce que chaque étape doit attendre la fin complète de la précédente (le STT doit transcrire toute la phrase avant que le LLM ne commence à réfléchir). ✅
- C) Parce que la voix humaine est trop rapide.
- D) Parce qu'il est interdit d'utiliser WebRTC.

**Q5.** Dans un modèle de synthèse vocale (Text-to-Speech), qu'est-ce que le **Voice Cloning** ?

- A) Le téléchargement d'un fichier audio.
- B) La capacité d'un modèle à reproduire le timbre, l'intonation et la couleur vocale d'un individu à partir d'un très court échantillon d'enregistrement (ex: 5 secondes). ✅
- C) La suppression des bruits de fond.
- D) La traduction automatique du texte.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
