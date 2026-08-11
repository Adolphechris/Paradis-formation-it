# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 470 (6h) : Traitement du Langage Naturel (NLP) Avancé : Sentence Transformers (SBERT), NER, Cross-Lingual (XLM-R) & Pipeline NLP

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre l'évolution des représentations textuelles : de **Word2Vec / FastText** aux **Sentence Embeddings (SBERT)**
> - Implémenter la **Reconnaissance d'Entités Nommées (NER)** pour l'extraction automatique d'indicateurs de compromission (IoCs)
> - Déployer la classification **Zero-Shot** et les modèles multilingues cross-lingues (**XLM-RoBERTa**)
> - Structurer un pipeline industriel de traitement de texte sécurisé avec Hugging Face `transformers`
>
> **Compétences visées :** `AI-02` (A) — NLP Avancé & Multilingual Embeddings

---

## Module 1 — Évolution des Embeddings & Sentence-BERT (SBERT) (2h)

### 📖 Intuition & Narration

Les premières méthodes de vectorisation des mots (**Word2Vec**, **GloVe**) attribuaient un vecteur statique unique à chaque mot. Mais cette approche souffrait de deux faiblesses majeures : l'incapacité à gérer la polysemie (le mot "vol" a des sens différents dans "vol d'oiseau" et "vol de données") et l'absence de prise en compte du contexte syntaxique.

Les Transformers (BERT) ont apporté les embeddings contextuels. Cependant, l'utilisation de BERT pour calculer la similarité cosinus entre deux phrases exige de passer le couple de phrases dans l'encoder, générant une complexité $O(N^2)$ prohibitive pour la recherche d'information.

**Sentence-BERT (SBERT — Reimers & Gurevych 2019)** résout cela en utilisant une architecture en réseau siamois qui produit un vecteur d'embedding dense de taille fixe (ex: 384 ou 768 dimensions) pour des phrases entières, permettant de comparer des millions de phrases en quelques millisecondes via une simple similarité cosinus.

### 🔍 Anatomie Technique — Architecture Siamese Network de SBERT

```
ARCHITECTURE EN RÉSEAU SIAMOIS DE SENTENCE-BERT (SBERT)

  Phrase A : "Attaque par déni de service"      Phrase B : "Attaque DDoS sur le serveur"
                     │                                         │
                     ▼                                         ▼
            ┌─────────────────┐                       ┌─────────────────┐
            │   BERT Encoder  │                       │   BERT Encoder  │  (Poids Partagés)
            └────────┬────────┘                       └────────┬────────┘
                     │                                         │
                     ▼                                         ▼
            ┌─────────────────┐                       ┌─────────────────┐
            │ Mean Pooling    │                       │ Mean Pooling    │
            └────────┬────────┘                       └────────┬────────┘
                     │                                         │
                     ▼                                         ▼
            Vecteur u (384d)                          Vecteur v (384d)
                     │                                         │
                     └────────────────────┬────────────────────┘
                                          │
                                          ▼
                               Similarité Cosinus
                              sim(u, v) = (u · v) / (||u|| * ||v||)
```

---

## Module 2 — Atelier Pratique : Pipeline NLP avec Hugging Face (NER & Zero-Shot) (2h)

### 🛠️ Code Python : Extraction d'IoCs par NER et Classification Zero-Shot

```python
#!/usr/bin/env python3
"""
PARADIS — Pipeline NLP Avancé : Extraction d'Entités Nommées (NER) et Classification Zero-Shot
Analyse automatique de rapports d'incidents de sécurité en français.
"""

from transformers import pipeline

def run_paradis_nlp_pipeline():
    print("[*] --- DÉMONSTRATION PIPELINE NLP PARADIS IT ---")

    # 1. Extraction d'Entités Nommées (NER)
    print("\n[1] Ingestion et Extraction d'Entités Nommées (NER)...")
    try:
        # Modèle NER multilingue / français
        ner_pipe = pipeline(
            "ner",
            model="Jean-Baptiste/camembert-ner",
            aggregation_strategy="simple"
        )

        log_text = "Le serveur principal situé à Paris a subi une tentative d'intrusion par l'organisation APT28 le 12 mai."
        entities = ner_pipe(log_text)

        print(f"    Texte analysé : '{log_text}'")
        print("    Entités détectées :")
        for ent in entities:
            print(f"      • Entité: {ent['word']:20s} | Type: {ent['entity_group']:5s} | Score: {ent['score']:.4f}")
    except Exception as e:
        print(f"    [!] Utilisation du mode fallback pour le NER: {e}")

    # 2. Classification Zero-Shot (Classification sans entraînement préalable)
    print("\n[2] Classification Zero-Shot d'un Ticket de Sécurité...")
    try:
        classifier = pipeline(
            "zero-shot-classification",
            model="BACALHAU/mDeBERTa-v3-base-mnli-xor-phrase-flan-t5"
        )

        ticket_text = "L'utilisateur ne parvient plus à se connecter après avoir saisi trois fois un mauvais mot de passe."
        candidate_labels = ["Panne Réseau", "Problème d'Authentification", "Attaque Malware", "Demande de Matériel"]

        result = classifier(ticket_text, candidate_labels)

        print(f"    Ticket : '{ticket_text}'")
        print("    Résultats des Probabilités Zero-Shot :")
        for label, score in zip(result['labels'], result['scores']):
            print(f"      • Catégorie: {label:30s} | Score: {score*100:.1f}%")
    except Exception as e:
        print(f"    [!] Utilisation du mode fallback pour Zero-Shot: {e}")
        print("      • Catégorie: Problème d'Authentification    | Score: 96.4% (Fallback)")

if __name__ == "__main__":
    run_paradis_nlp_pipeline()
```

---

## Module 3 — Modèles Cross-Lingues (XLM-RoBERTa) & Alignement (1h30)

### 🔍 Architecture XLM-RoBERTa (Cross-Lingual Language Model)

```
MODÈLES CROSS-LINGUES (XLM-RoBERTa — Conneau et al. 2020)

  [ Texte en Français ] ──┐
  [ Texte en Anglais  ] ──┼──▶ [ XLM-RoBERTa Encoder ] ──▶ Espace Vectoriel Aligné
  [ Texte en Espagnol ] ──┘     (Vocabulaire 250K BPE)     (Même concept dans la même zone)

RÉVOLUTION DES MODÈLES CROSS-LINGUES :
  1. Transfert Zero-Shot Multilingue : On entraîne le classificateur sur du texte anglais uniquement, et il fonctionne IMMÉDIATEMENT sur du texte français, allemand ou japonais sans ré-entraînement !
  2. Entraînement MLM sur 100+ langues simultanément (Common Crawl 2.5TB).
  3. Indispensable pour la cybersécurité globale (analyse de logs et de rapports de menaces internationaux).
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SBERT** | Sentence-BERT — Adaptation de BERT produisant des sentence embeddings denses par réseaux siamois |
| **NER** | Named Entity Recognition — Tâche de détection et catégorisation des entités nommées dans un texte |
| **XLM-R** | Cross-lingual Language Model RoBERTa — Modèle multilingue pré-entraîné sur plus de 100 langues |
| **IoC** | Indicator of Compromise — Artefact observateur sur un système signalant une intrusion informatique |
| **MNLI** | Multi-Genre Natural Language Inference — Benchmark pour les tâches de déduction et zero-shot |

---

## Exercices Pratiques

### Exercice 1 — Calcul de Complexité Recherche SBERT vs BERT Classique

Considérez une base de connaissances contenant $N = 100\,000$ documents de sécurité. Un analyste soumet une requête pour trouver le document le plus similaire.
1. Avec un modèle BERT classique (Cross-Encoder), combien de passes avant complètes doivent être exécutées dans le réseau de neurones pour évaluer la requête par rapport à l'ensemble de la base ?
2. Avec SBERT (Bi-Encoder), où les $N$ documents ont été pré-vectorisés une fois pour toutes sous forme de tenseurs $(100\,000, 384)$, quelle est la seule opération mathématique nécessaire ?

**Corrigé guidé :**
1. **BERT Cross-Encoder** : Il faut concaténer la requête avec chaque document et effectuer $100\,000$ passes avant complètes à travers le Transformer à 12 couches. À raison de 10ms par passe, la recherche prendrait $1000\text{ secondes} \approx 16.6\text{ minutes}$ pour une seule requête !
2. **SBERT Bi-Encoder** : La requête est convertie en un seul vecteur $u \in \mathbb{R}^{384}$ (1 seule passe Transformer). Ensuite, la recherche consiste en une simple multiplication matricielle produit scalaire/cosinus entre $u$ et la matrice de documents $V \in \mathbb{R}^{100\,000 \times 384}$. Cette opération prend moins de **3 millisecondes** sur CPU/GPU.

---

## Banque QCM — 5 Questions

**Q1.** Quelle est l'innovation fondamentale introduite par **Sentence-BERT (SBERT)** par rapport à BERT standard pour la recherche par similarité ?

- A) SBERT ne fonctionne qu'en mode hors-ligne.
- B) SBERT utilise une architecture siamoise pour produire des embeddings de phrases individuels de taille fixe, permettant de calculer les similarités cosinus en temps réel sans ré-exécuter le modèle. ✅
- C) SBERT supprime le mécanisme d'attention.
- D) SBERT ne traite que les mots isolés.

**Q2.** La tâche de **Reconnaissance d'Entités Nommées (NER)** consiste à :

- A) Traduire un texte d'une langue à une autre.
- B) Identifier et catégoriser les éléments d'information clés d'un texte (ex: Noms de personnes, Lieux, Organisations, Adresses IP). ✅
- C) Compresser les fichiers au format ZIP.
- D) Calculer la fréquence de rafraîchissement d'un écran.

**Q3.** La **Classification Zero-Shot** permet de :

- A) Classifier des textes dans des catégories définies à la volée sans avoir besoin d'entraîner ou d'ajuster le modèle sur des données annotées pour ces catégories spécifiques. ✅
- B) Réduire le nombre de cœurs CPU requis à zéro.
- C) Supprimer le tokenizer du pipeline.
- D) Classifier uniquement des images en noir et blanc.

**Q4.** Quel est l'avantage principal d'un modèle multilingue cross-lingue comme **XLM-RoBERTa** ?

- A) Il utilise deux fois moins de mémoire VRAM qu'un modèle monolingue.
- B) Il projette plusieurs langues dans un espace sémantique partagé, permettant le transfert de connaissances "Zero-Shot" d'une langue vers d'autres. ✅
- C) Il génère du code C++ automatique.
- D) Il ne nécessite aucun pré-entraînement.

**Q5.** Dans un pipeline NLP de recherche d'information (Information Retrieval), pourquoi combine-t-on souvent un **Bi-Encoder (SBERT)** et un **Cross-Encoder (BERT)** ?

- A) Le Bi-Encoder est utilisé pour filtrer très rapidement les 100 meilleurs candidats (Retrieval), puis le Cross-Encoder est utilisé pour ré-ordonnancer précisément (Rerank) ces 100 candidats. ✅
- B) Le Cross-Encoder est utilisé en premier pour supprimer les mots vides.
- C) Pour diviser par deux la taille du texte.
- D) Parce qu'il est impossible d'utiliser SBERT seul.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
