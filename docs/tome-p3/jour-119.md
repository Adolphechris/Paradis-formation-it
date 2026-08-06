# TOME P3 — Cloud Native, DevOps & Cyberdéfense — Jour 119 (6h) : Sécurité des Systèmes d'Intelligence Artificielle & IA Générative (OWASP Top 10 for LLM, Model Poisoning & Differential Privacy)

> [!NOTE]
> **Objectif du jour :** Sécuriser les pipelines et modèles d'Intelligence Artificielle d'entreprise : audit des vulnérabilités OWASP Top 10 for LLM, détection duempoisonnement des modèles (Model Poisoning), attaques par inversion de modèle (Model Inversion), et préservation de la confidentialité avec Differential Privacy.
>
> **Compétences visées :** `SEC-05` (A) — Sécurité des Modèles d'IA | `SEC-01` (A) — Confidentialité des Données d'Entraînement

---

## 1) Module — Menaces sur les Pipelines ML & Empoisonnement de Données (2h)

### 📖 Narration/Intuition

L'entraînement d'un modèle de Machine Learning bancaire (ex: détection de blanchiment d'argent) exige d'ingérer des millions de données.

Une attaque par **Empoisonnement de Données (Data Poisoning)** consiste pour un attaquant à injecter des échantillons de données falsifiées dans l'ensemble d'entraînement. Le modèle apprend cette fausse logique et crée une porte dérobée (Backdoor) : par exemple, le modèle laissera passer les virements de l'attaquant sans jamais les marquer comme frauduleux, tout en fonctionnant normalement pour le reste du trafic.

### 🔍 Anatomie Technique

**Vecteurs d'Attaques sur le Cycle de Vie des Modèles d'IA :**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PHASE D'ENTRAÎNEMENT (DATA POISONING)                    │
│    - Injection d'échantillons malveillants masqués          │
│    - Corruption des poids du modèle (Model Backdooring)     │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PHASE D'EXÉCUTION / INFERENCE (ADVERSARIAL ATTACKS)       │
│    - Attaques Adversarielles (Perturbations imperceptibles) │
│    - Prompt Injection Directe / Indirecte (LLM)             │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. PHASE D'EXFILTRATION (MODEL INVERSION / EXTRACTION)      │
│    - Inversion de modèle : Reconstruire les données privées │
│      d'entraînement à partir des prédictions du modèle      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Protection contre l'Inversion de Modèle & Differential Privacy (2h)

### 📖 Narration/Intuition

Un modèle IA entraîné sur des données médicales ou bancaires peut inconsciemment "mémoriser" des données personnelles (ex: numéros de sécurité sociale ou soldes de comptes). Un attaquant envoyant des milliers de requêtes judicieusement formulées à l'API du modèle peut ré-extraire ces données privées (**Model Inversion Attack**).

La **Confidentialité Différentielle (Differential Privacy)** ajoute du bruit mathématique calibré lors de l'entraînement pour garantir qu'aucune information individuelle ne puisse être extraite, tout en conservant la précision globale du modèle.

### 🔍 Anatomie Technique

**Entraînement avec Confidentialité Différentielle en Python (Opacus / PyTorch) :**

```python
#!/usr/bin/env python3
"""
dp_training.py — Entraînement d'un modèle avec Confidentialité Différentielle (Differential Privacy)
"""
import torch
from opacus import PrivacyEngine

# 1. Définir le modèle et l'optimiseur
model = torch.nn.Linear(10, 2)
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)
data_loader = [...] # Chargement des données bancaires

# 2. Attacher le moteur de confidentialité (Privacy Engine)
privacy_engine = PrivacyEngine()

model, optimizer, data_loader = privacy_engine.make_private(
    module=model,
    optimizer=optimizer,
    data_loader=data_loader,
    noise_multiplier=1.1,      # Quantité de bruit ajouté pour la confidentialité
    max_grad_norm=1.0          # Écrêtage des gradients pour limiter l'impact d'un individu
)

print("✅ Modèle IA configuré avec Confidentialité Différentielle (Differential Privacy).")
# Les requêtes d'inversion ne pourront pas extraire les données individuelles d'un client !
```

---

## 3) Module — Audit de Sécurité des LLMs avec Garak (2h)

### 📖 Narration/Intuition

Comment auditer automatiquement un LLM d'entreprise (ex: Llama-3 déployé à la BCC) avant sa mise en production pour s'assurer qu'il ne succombera pas aux injections de prompts ou aux fuites de données ?

**Garak** est le framework open-source d'audit de sécurité et de red-teaming pour les Modèles de Langage (LLM Vulnerability Scanner).

### 🔍 Anatomie Technique

**Audit automatisé d'un LLM avec Garak :**

```bash
# Installation du scanner de sécurité LLM Garak
pip install garak

# 1. Scanner le modèle contre les attaques de Prompt Injection
python3 -m garak --model_type huggingface --model_name meta-llama/Meta-Llama-3-8B --probes promptinject

# 2. Scanner les fuites de données et d'informations confidentielles (PII / Secrets)
python3 -m garak --model_type openai --model_name gpt-4 --probes leakreplay

# 3. Consulter le rapport de vulnérabilités et de résistances
cat garak_runs/garak.report.json
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Differential Privacy** | Technique mathématique ajoutant du bruit pour protéger la confidentialité des individus |
| **Model Poisoning** | Attaque visant à corrompre les données d'entraînement d'un modèle d'IA |
| **Model Inversion** | Attaque visant à reconstruire les données d'entraînement privées à partir des réponses du modèle |
| **PII** | Personally Identifiable Information — Données d'identification personnelle confidentielles |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Qu'est-ce qu'une attaque par **Attribut / Model Inversion** sur un modèle d'IA bancaire et comment la **Confidentialité Différentielle (Differential Privacy)** s'en protège-t-elle ?

**Corrigé :** Une attaque par **Model Inversion** consiste pour un attaquant à interroger le modèle d'IA de manière répétée avec des paramètres modifiés pour reconstruire les caractéristiques exactes d'un individu présent dans l'ensemble d'entraînement (ex: retrouver le salaire exact d'un client). La **Confidentialité Différentielle** ajoute un bruit mathématique contrôlé aux gradients lors de l'entraînement. Ce bruit garantit statistiquement que la présence ou l'absence d'un individu donné dans la base de données d'entraînement n'impacte pas significativement la réponse du modèle, rendant la reconstruction d'informations individuelles mathématiquement impossible.

**Exercice 2 :** Quel est le rôle d'un scanner de sécurité LLM comme **Garak** ?

**Corrigé :** **Garak** agit comme un scanner de vulnérabilités automatisé (type Nmap/Burp Suite) dédié aux Modèles de Langage (LLMs). Il envoie des milliers de sondes textuelles (Probes) au modèle d'IA pour tester sa résistance contre les attaques par Prompt Injection, les tentatives d'extraction d'instructions système, les fuites de secrets/PII et les comportements toxiques ou non conformes avant que l'IA ne soit mise à la disposition des utilisateurs.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle attaque sur l'Intelligence Artificielle consiste à injecter des données falsifiées dans l'ensemble d'entraînement pour corrompre le comportement du modèle ?
- A) Data Poisoning / Model Poisoning
- B) Formateur de disque
- C) Câble HDMI
- D) Clé USB

**Réponse : A**

**Q2 :** Quelle technique mathématique ajoute du bruit contrôlé lors de l'entraînement d'un modèle d'IA pour garantir que les données individuelles d'un client ne puissent pas être ré-extraites ?
- A) Differential Privacy (Confidentialité Différentielle)
- B) Mot de passe court
- C) Suppression du réseau
- D) Défragmentation de disque

**Réponse : A**

**Q3 :** Quel outil open-source d'audit de sécurité et de red-teaming permet de scanner automatiquement les modèles LLM contre les injections de prompt et les fuites de données ?
- A) Garak
- B) Word
- C) Calculator
- D) Paint

**Réponse : A**

**Q4 :** Que cherche à réaliser un attaquant lorsqu'il mène une attaque de type "Model Inversion" sur un modèle IA ?
- A) Reconstruire ou deviner des données personnelles confidentielles (PII) utilisées lors de l'entraînement de l'IA à partir des prédictions de l'API
- B) Inverser la polarité de la prise électrique
- C) Accélérer le ventilateur CPU
- D) Modifier la couleur de l'écran

**Réponse : A**

**Q5 :** Dans le cadre des Guardrails de sécurité IA, que signifie l'écrêtage des gradients (Gradient Clipping) utilisé en entraînement privé ?
- A) Limiter l'influence maximale qu'un seul échantillon de donnée individuel peut avoir sur les paramètres globaux du modèle d'IA
- B) Couper l'alimentation du serveur
- C) Effacer le code Python
- D) Fermer le port 80

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
