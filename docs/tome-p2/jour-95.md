# TOME P2 — Réseaux & Télécoms — Jour 95 (6h) : Intelligence Artificielle & Cybersécurité — Détection d'Anomalies & Sécurité des Modèles

> [!NOTE]
> **Objectif du jour :** Comprendre l'intersection entre l'IA et la cybersécurité : utilisation du Machine Learning pour la détection d'anomalies, sécurisation des applications basées sur les LLM contre les attaques par Prompt Injection et protection des données dans les systèmes RAG.
>
> **Compétences visées :** `SEC-06` (A) — Détection des Menaces par IA | `SEC-05` (A) — Sécurité des Modèles de Machine Learning

---

## 1) Module — Détection d'Anomalies avec le Machine Learning (2h)

### 📖 Narration/Intuition

Les attaques modernes (APT, Zero-Day) ne correspondent plus à des règles fixes. Les algorithmes de **Machine Learning Non Supervisé** apprennent le comportement normal d'une infrastructure et identifient toute déviation comme une anomalie suspecte, sans nécessiter de signature préalable.

### 🔍 Anatomie Technique

**Détection d'anomalies réseau avec Isolation Forest en Python (`ml_anomaly.py`) :**

```python
#!/usr/bin/env python3
"""
ml_anomaly.py — Détection d'anomalies de trafic avec Scikit-Learn (Isolation Forest)
"""
import numpy as np
from sklearn.ensemble import IsolationForest

# Données simulées : trafic normal (1000 échantillons) + anomalies (20)
np.random.seed(42)
normal = np.random.normal(loc=[50000, 200, 1], scale=[10000, 40, 1], size=(1000, 3))
normal = np.clip(normal, 0, None)

anomalies = np.array([
    [5000000, 15000, 50],   # DDoS / Exfiltration massive
    [10000, 5000, 200],     # Scan de ports agressif
    [8000000, 20000, 2],    # Attaque volumétrique
])

X_train = normal
X_test = np.vstack([normal[:50], anomalies])

# Entraînement du modèle
model = IsolationForest(contamination=0.05, random_state=42)
model.fit(X_train)

# Prédiction (-1 = Anomalie, 1 = Normal)
predictions = model.predict(X_test)

print("=== DÉTECTION D'ANOMALIES ===")
for i, pred in enumerate(predictions):
    if pred == -1:
        print(f"🚨 ANOMALIE DÉTECTÉE [Échantillon #{i}]")
```

---

## 2) Module — Sécurité des LLM & Prompt Injection (2h)

### 📖 Narration/Intuition

L'intégration d'agents IA (LLM) dans les applications crée une nouvelle surface d'attaque. Une attaque par **Prompt Injection** consiste à insérer des instructions malveillantes dans les entrées utilisateur pour forcer le modèle à contourner ses consignes de sécurité.

### 🔍 Anatomie Technique

**OWASP Top 10 for LLM Applications (principales vulnérabilités) :**

```
LLM01 - Prompt Injection : Manipulation des instructions du modèle via entrées malveillantes.
LLM02 - Insecure Output Handling : Confiance aveugle dans le texte généré (XSS / SQLi).
LLM06 - Sensitive Information Disclosure : Fuite de données confidentielles.
LLM08 - Excess Agency : Autonomie excessive de l'agent IA sans validation humaine.
```

**Mitigations essentielles :**

```python
# Code sécurisé : Isolation des rôles et validation des entrées/sorties
from langchain.prompts import ChatPromptTemplate

def agent_securise(input_utilisateur):
    # 1. Sanitization de l'entrée
    input_filtre = input_utilisateur.replace("Ignore", "").replace("system", "")
    
    # 2. Structure de messages séparées (System vs User)
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", "Tu es l'assistant. Ne divulgue JAMAIS de données confidentielles."),
        ("user", "{user_input}")
    ])
    
    # 3. Validation humaine obligatoire pour actions critiques (Human-in-the-Loop)
    messages = prompt_template.format_messages(user_input=input_filtre)
    return "Réponse sécurisée du modèle"
```

---

## 3) Module — Protection des Données & RAG Sécurisé (2h)

### 📖 Narration/Intuition

Lorsqu'un système **RAG (Retrieval-Augmented Generation)** interroge une base documentaire, il est impératif de filtrer les résultats selon les droits d'accès de l'utilisateur. Un employé ne doit pas obtenir de documents confidentiels auxquels il n'a pas droit.

### 🔍 Anatomie Technique

**Architecture RAG avec filtrage ACL :**

```
Utilisateur              Vector Database (ChromaDB / Qdrant)           LLM
   │                              │                                    │
   │ 1. Question                                                    │
   ├──────────────────────────────→│                                    │
   │                              │                                    │
   │ 2. Recherche + FILTRE ACL     │                                    │
   │    where: {role_autorise}     │                                    │
   │                              │                                    │
   │ 3. Retourne UNIQUEMENT        │                                    │
   │    documents autorisés        │                                    │
   │←──────────────────────────────┤                                    │
   │                              │                                    │
   │ 4. Contexte filtré + question ──────────────────────────────────→│
   │                                                                 │ 5. Réponse sécurisée
   │←────────────────────────────────────────────────────────────────┤
```

**Règle essentielle :** Le filtrage par métadonnées (ACL) doit s'appliquer **avant** l'envoi au LLM, jamais après.

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **LLM** | Large Language Model — Modèle de langage de grande taille |
| **RAG** | Retrieval-Augmented Generation — Génération augmentée par recherche documentaire |
| **APT** | Advanced Persistent Threat — Menace persistante avancée |
| **Guardrails** | Filtres de sécurité encadrant les entrées/sorties des modèles IA |
| **ACL** | Access Control List — Liste de contrôle d'accès |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Qu'est-ce qu'une attaque par Prompt Injection et comment s'en protéger ?

**Corrigé :** C'est une manipulation des instructions du modèle via des entrées utilisateur malveillantes. La protection repose sur la séparation des rôles (System vs User), la sanitization des entrées, et la validation humaine systématique pour les actions sensibles (Human-in-the-Loop).

---

**Exercice 2 :** Pourquoi les algorithmes non supervisés comme Isolation Forest sont-ils efficaces contre les Zero-Day ?

**Corrigé :** Ils n'ont pas besoin de signatures d'attaque connues. Ils apprennent simplement le comportement normal et signalent toute déviation statistique, détectant ainsi des attaques jamais vues auparavant.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel type d'apprentissage automatique est utilisé par Isolation Forest pour détecter des anomalies sans exemples d'attaques préalables ?
- A) Supervisé
- B) Non Supervisé
- C) Par renforcement
- D) Algorithmes génétiques

**Réponse : B**

---

**Q2 :** Dans l'OWASP Top 10 for LLM, quelle vulnérabilité décrit la manipulation des consignes du modèle via des entrées utilisateur ?
- A) LLM01 - Prompt Injection
- B) LLM05 - Supply Chain
- C) LLM09 - Overreliance
- D) LLM10 - Model Theft

**Réponse : A**

---

**Q3 :** Quelle technique enrichit les réponses d'un LLM avec des documents privés sans réentraîner le modèle ?
- A) Fine-Tuning
- B) RAG (Retrieval-Augmented Generation)
- C) Data Scrubbing
- D) Quantum Computing

**Réponse : B**

---

**Q4 :** Quelle est la meilleure pratique pour empêcher un LLM d'exécuter des actions frauduleuses ?
- A) Donner un accès administrateur au modèle
- B) Limiter l'autonomie de l'agent (Human-in-the-Loop) et valider toutes les sorties avant exécution
- C) Utiliser un mot de passe court
- D) Désactiver les journaux d'audit

**Réponse : B**

---

**Q5 :** Que désignent les "Guardrails" en sécurité des modèles IA ?
- A) Un système d'extinction des serveurs
- B) Des filtres placés en amont et en aval d'un LLM pour bloquer les contenus malveillants
- C) Les câbles réseau de couleur bleue
- D) Les disques durs SSD

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
