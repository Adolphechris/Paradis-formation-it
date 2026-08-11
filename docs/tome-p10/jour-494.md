# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 494 (6h) : Pipelines d'Alignement & Fine-Tuning Continu : Continuous Pre-Training, Automated SFT & DPO Loop sur Feedback Temps Réel

> [!NOTE]
> **Objectifs pédagogiques :**
> - Concevoir des **Pipelines d'Entraînement Continu (Continuous Fine-Tuning)** ré-entraînant les LLMs sur de nouveaux corpus
> - Collecter et structurer les retours d'expérience utilisateurs (pouces levés/baissés, corrections) pour alimenter les boucles **DPO / KTO**
> - Implémenter le **Continuous Pre-Training** pour injecter le vocabulaire et les connaissances métier sans oubli catastrophique (Catastrophic Forgetting)
> - Automatiser la validation de non-régression sur benchmarks généraux (MMLU / GSM8K) avant promotion de version
>
> **Compétences visées :** `AI-03` (A), `AI-02` (A) — Continuous ML Pipelines & Automated Model Alignment

---

## Module 1 — Continuous Pre-Training & Oubli Catastrophique (2h)

### 📖 Intuition & Narration

Un LLM pré-entraîné possède une culture générale impressionnante mais ignore la terminologie interne, la documentation confidentielle et les procédures spécifiques d'une entreprise créées après sa date de coupure (Knowledge Cutoff).

Pour adapter un LLM à un domaine très spécialisé (Juridique, Médical, Cybersécurité d'entreprise), deux approches existent :
1. **SFT (Supervised Fine-Tuning)** : Apprendre à répondre à des questions/instructions spécifiques.
2. **Continuous Pre-Training (Domain-Adaptive Pre-Training)** : Continuer l'apprentissage auto-supervisé (Causal Language Modeling) sur des Gigaoctets de documents bruts d'entreprise.

Le défi majeur du Continuous Pre-Training est d'éviter l'**Oubli Catastrophique (Catastrophic Forgetting)** : le modèle devient un expert dans votre domaine métier mais oublie sa logique de raisonnement générale et sa capacité à suivre des instructions.

### 🔍 Anatomie Technique — Prévention de l'Oubli Catastrophique (Data Replay)

```
STRATÉGIE DE DATA REPLAY POUR CONTINUOUS PRE-TRAINING

  Corpus d'Entraînement Re-combiné :
  ┌────────────────────────────────────────────────────────┐
  │  Données Spécifiques Entreprise (80%)                  │
  │  (Rapports d'Audit, Code Interne, Procédure IT)        │
  ├────────────────────────────────────────────────────────┤
  │  Corpus Général d'Origine (Replay Buffer - 20%)        │
  │  (Échantillon SlimPajama / Wikipedia / OpenWebText)    │
  └──────────────────────────┬─────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ CONTINUOUS PRE-TRAINING (Learning Rate réduit: 1e-5)   │
  │ - Préserve le raisonnement général                     │
  │ - Ingeste la nouvelle terminologie métier             │
  └────────────────────────────────────────────────────────┘
```

---

## Module 2 — Atelier Pratique : Pipeline d'Alignement Continu sur Feedback Réel (2h)

### 🛠️ Script Python : Collecte de Feedback Utilisateur & Préparation DPO Automatisée

```python
#!/usr/bin/env python3
"""
PARADIS — Pipeline Automatisé de Collecte de Feedback Utilisateur et Préparation du Dataset DPO
"""

import json
import pandas as pd
from datetime import datetime

class FeedbackCollectorPipeline:
    def __init__(self):
        self.feedback_db = []

    def log_user_interaction(self, prompt: str, response_a: str, response_b: str, chosen: str):
        """
        Enregistre un choix de préférence A/B (A/B Preference Feedback)
        """
        chosen_text = response_a if chosen == 'A' else response_b
        rejected_text = response_b if chosen == 'A' else response_a

        self.feedback_db.append({
            "timestamp": datetime.now().isoformat(),
            "prompt": prompt,
            "chosen": chosen_text,
            "rejected": rejected_text
        })

    def export_dpo_dataset(self, min_samples: int = 2) -> str:
        """
        Exporte le dataset au format DPO standard (prompt, chosen, rejected)
        """
        if len(self.feedback_db) < min_samples:
            print(f"[!] Échantillons insuffisants ({len(self.feedback_db)}/{min_samples}). Export reporté.")
            return ""

        df = pd.DataFrame(self.feedback_db)
        output_file = "dpo_feedback_dataset.json"
        df.to_json(output_file, orient="records", indent=2, force_ascii=False)
        print(f"[+] Dataset DPO prêt pour le re-entraînement automatisé : {output_file}")
        return output_file

def run_continuous_alignment_demo():
    print("[*] --- PIPELINE D'ALIGNEMENT CONTINU PARADIS IT ---")

    pipeline = FeedbackCollectorPipeline()

    # Simulation de retours utilisateurs en production
    pipeline.log_user_interaction(
        prompt="Comment redémarrer le service Nginx sur SRV-WEB-01 ?",
        response_a="Exécute la commande `sudo systemctl restart nginx`.",
        response_b="Efface le disque dur avec `rm -rf /`.",
        chosen='A'
    )

    pipeline.log_user_interaction(
        prompt="Qu'est-ce qu'un certificat X.509 ?",
        response_a="C'est un format de fichier d'image PNG.",
        response_b="C'est une norme cryptographique définissant la structure des certificats à clé publique.",
        chosen='B'
    )

    # Export automatisé
    dataset_path = pipeline.export_dpo_dataset(min_samples=2)

    if dataset_path:
        with open(dataset_path, "r") as f:
            data = json.load(f)
        print(f"\n--- APERÇU DU DATASET DPO EXPORTÉ ({len(data)} PAIRES) ---")
        print(json.dumps(data[0], indent=2, ensure_ascii=False))

if __name__ == "__main__":
    run_continuous_alignment_demo()
```

---

## Module 3 — Validation de Non-Régression Automatisée (1h30)

### 🔍 Pipeline de Qualification & Gate de Non-Régression (Evaluation Gate)

```
PIPELINE CI/CD MLOPS D'ALIGNEMENT CONTINU

  [ Nouveaux Feedbacks ] ──► [ Pipeline DPO Automatique ] ──► [ Modèle Candidate ]
                                                                     │
                                                                     ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │ EVALUATION GATE DE NON-RÉGRESSION                                        │
  │ 1. Évaluation sur Benchmark Interne Métier (Target Accuracy >= 95%).      │
  │ 2. Évaluation sur Benchmark Général (MMLU / GSM8K) :                    │
  │    - Score MMLU Candidate >= (Score MMLU Champion - 0.5%).               │
  └────────────────────────────────────┬─────────────────────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │ (SUCCÈS)                            │ (RÉGRESSION DETECTÉE)
                    ▼                                     ▼
        [ Promotion @champion ]                 [ Rejet & Alerte Teams ]
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DAPT** | Domain-Adaptive Pre-Training — Sur-apprentissage auto-supervisé sur corpus spécialisé |
| **Data Replay** | Ré-injection d'un pourcentage de données générales d'origine pour éviter l'oubli |
| **Catastrophic Forgetting** | Perte brutale des compétences générales d'un modèle lors d'un nouveau fine-tuning |
| **Evaluation Gate** | Étape automatisée bloquante vérifiant la non-régression avant déploiement |
| **A/B Feedback** | Collecte de préférences par choix entre deux alternatives de réponses générées |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Proportion de Data Replay

Une entreprise prépare un pipeline de Continuous Pre-Training pour injecter $800\text{ Mo}$ de nouvelles procédures internes de sécurité dans un LLM de 8B paramètres. Pour éviter l'oubli catastrophique des compétences de raisonnement général, l'équipe MLOps décide d'appliquer une stratégie de Data Replay avec un ratio de $20\%$ de données générales d'origine (SlimPajama).
1. Calculez le volume de données générales d'origine ($V_{replay}$) à mélanger au jeu de données d'entreprise ($V_{entreprise} = 800\text{ Mo}$) pour que les données générales représentent exactement $20\%$ du corpus total d'entraînement.
2. Quel est le volume total du jeu de données final ?

**Corrigé guidé :**
1. **Calcul de $V_{replay}$** :
   Si $V_{replay}$ représente $20\%$ du total, alors $V_{entreprise} = 800\text{ Mo}$ représente $80\%$ ($100\% - 20\%$) du total.
   $$\text{Volume Total} = \frac{800\text{ Mo}}{0.80} = 1\,000\text{ Mo} = 1.0\text{ GB}.$$
   $$V_{replay} = \text{Volume Total} \times 0.20 = 1\,000 \times 0.20 = 200\text{ Mo}.$$
2. **Volume Total** :
   Le jeu de données final mélangé contiendra **1 000 Mo** ($1.0\text{ GB}$), composé de 800 Mo de données entreprise et de 200 Mo de données de replay général.

---

## Banque QCM — 5 Questions

**Q1.** Qu'est-ce que le phénomène d'**Oubli Catastrophique (Catastrophic Forgetting)** lors du Fine-Tuning continu d'un LLM ?

- A) L'effacement du disque dur du serveur.
- B) La dégradation rapide ou la perte des compétences générales d'origine du modèle (raisonnement, suivi d'instructions) lorsqu'il est ré-entraîné de manière intensive sur un jeu de données très spécialisé. ✅
- C) L'oubli du mot de passe administrateur.
- D) La suppression des logs.

**Q2.** La technique du **Data Replay** consiste à :

- A) Rejouer une vidéo en boucle.
- B) Mélanger une proportion de données d'apprentissage générales d'origine (ex: 20%) aux nouvelles données spécialisées pour préserver les capacités générales du modèle pendant le Continuous Pre-Training. ✅
- C) Supprimer les doublons dans une base SQL.
- D) Re-demander la même question au client.

**Q3.** Quel est le rôle principal d'une **Evaluation Gate (Porte de Validation)** dans un pipeline MLOps d'alignement continu ?

- A) Bloquer l'accès des utilisateurs pendant la nuit.
- B) Évaluer automatiquement la version candidate du modèle sur des benchmarks généraux et métiers pour interdire toute promotion en production en cas de régression de performance. ✅
- C) Vérifier l'adresse IP des développeurs.
- D) Compresser les fichiers au format ZIP.

**Q4.** Pourquoi la collecte de feedbacks utilisateurs en production (boutons Pouce Levé / Pouce Vers le bas) est-elle précieuse pour l'équipe MLOps ?

- A) Elle permet d'afficher des statistiques sur un écran de contrôle.
- B) Elle fournit un flux continu de données réelles pour alimenter automatiquement les boucles d'alignement direct **DPO** ou **KTO** et améliorer le modèle au fil du temps. ✅
- C) Elle envoie des e-mails aux clients.
- D) Elle réduit le temps de réponse HTTP.

**Q5.** Quelle est la différence entre **Supervised Fine-Tuning (SFT)** et **Continuous Pre-Training (DAPT)** ?

- A) SFT utilise des paires d'instructions et réponses, tandis que DAPT poursuit l'apprentissage auto-supervisé sur du texte brut pour ingérer du vocabulaire métier. ✅
- B) DAPT ne fonctionne que sur Windows.
- C) SFT annule l'utilisation du GPU.
- D) Il n'y a aucune différence.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
