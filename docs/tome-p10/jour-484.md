# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 484 (6h) : Prompt Engineering Avancé & Structuration d'Output : Chain-of-Thought (CoT), Tree-of-Thought (ToT), Outlines, Instructor & Validation Pydantic

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser les paradigmes de raisonnement avancé : **Chain-of-Thought (CoT)**, **Self-Consistency** et **Tree-of-Thought (ToT)**
> - Garantir la conformité stricte des réponses LLM au format JSON via **Instructor** et les modèles **Pydantic**
> - Implémenter le guidage d'échantillonnage au niveau du tokenizer avec **Outlines** (Grammaires FSM et expressions régulières)
> - Éliminer les erreurs de parsing en production grâce au contrôle de schéma (JSON Schema Enforcement)
>
> **Compétences visées :** `AI-02` (A) — Advanced Prompt Engineering & Output Enforcement

---

## Module 1 — Techniques de Raisonnement : CoT, Self-Consistency & ToT (2h)

### 📖 Intuition & Narration

Les modèles de langage auto-régressifs calculent chaque token de manière séquentielle. Lorsqu'on leur pose une question complexe exigeant un raisonnement logique ou mathématique multi-étapes, tenter de produire la réponse finale directement conduit souvent à l'échec.

Le **Prompt Engineering Avancé** fournit des structures de pensée au modèle :
1. **Chain-of-Thought (CoT — Wei et al. 2022)** : Forcer le modèle à décomposer son raisonnement intermédiaire avant d'émettre sa conclusion (*"Pensons étape par étape..."*).
2. **Self-Consistency (Wang et al. 2022)** : Échantillonner plusieurs chaînes de raisonnement CoT avec une température $T > 0$ et retenir la réponse finale majoritaire (Vote à la majorité).
3. **Tree-of-Thought (ToT — Yao et al. 2023)** : Explorer un arbre de pensées avec des algorithmes de recherche (BFS/DFS) et une évaluation heuristique de chaque branche.

### 🔍 Anatomie Technique — Structure Tree-of-Thought (ToT)

```
SCHÉMA DE RECHERCHE TREE-OF-THOUGHT (ToT)

                          [ Prompt d'Entrée ]
                                   │
                ┌──────────────────┼──────────────────┐
                ▼                  ▼                  ▼
           [ Pensée 1A ]      [ Pensée 1B ]      [ Pensée 1C ]
           Score: 0.85        Score: 0.20        Score: 0.90  (BFS / Evaluation)
                │                 │ (Abandonné)       │
          ┌─────┴─────┐                         ┌─────┴─────┐
          ▼           ▼                         ▼           ▼
     [ Pensée 2A ] [ Pensée 2B ]           [ Pensée 2C ] [ Pensée 2D ]
     Score: 0.95   Score: 0.40             Score: 0.10   Score: 0.88
          │                                                  │
          ▼                                                  ▼
     [ Solution A (Gagnante) ]                        [ Solution D ]
```

---

## Module 2 — Atelier Pratique : Structuration d'Output avec Instructor & Pydantic (2h)

### 🛠️ Code Python : Inférence Structurée Garantie avec Instructor & Pydantic

```python
#!/usr/bin/env python3
"""
PARADIS — Extraction de Données et Inférence LLM avec Garanti de Schéma Pydantic (Instructor)
"""

import json
from typing import List
from pydantic import BaseModel, Field

# 1. Définition du Schéma Pydantic Strict pour la réponse de sécurité
class SecurityThreat(BaseModel):
    cve_id: str = Field(..., example="CVE-2026-1234", description="Identifiant unique de la CVE")
    severity: str = Field(..., example="CRITICAL", description="Niveau de sévérité: LOW, MEDIUM, HIGH, CRITICAL")
    affected_component: str = Field(..., description="Composant ou service vulnérable")
    remediation_steps: List[str] = Field(..., description="Liste d'actions pour corriger la faille")
    is_zero_day: bool = Field(..., description="Vrai s'il s'agit d'une vulnérabilité Zero-Day")

class SecurityReport(BaseModel):
    threats: List[SecurityThreat]
    overall_risk_score: float = Field(..., ge=0.0, le=10.0, description="Score de risque global de 0.0 à 10.0")

def run_instructor_demo():
    print("[*] --- DÉMONSTRATION ENFORCEMENT DE SCHÉMA PYDANTIC (Instructor) PARADIS IT ---")

    raw_text = """
    Rapport d'Audit:
    Nous avons détecté une faille critique CVE-2026-8888 sur le composant OpenSSL v3.0.2 (Sévérité CRITICAL).
    Actions requises: Mettre à jour OpenSSL vers v3.0.3 et redémarrer les services web Nginx.
    Cette faille n'est pas un Zero-Day.
    Un deuxième problème moyen concerne le port 21 FTP ouvert sur l'interface publique (Sévérité MEDIUM).
    """

    try:
        import instructor
        from openai import OpenAI

        # Initialisation du client Instructor
        client = instructor.from_openai(OpenAI(api_key="sk-simulation-key"))
        print("[+] Client Instructor configuré.")

    except Exception:
        print("[!] Bibliothèque 'instructor' / 'openai' en mode simulation. Parsing du schéma Pydantic...")

    # Validation et construction directe via Pydantic
    mock_parsed_data = SecurityReport(
        threats=[
            SecurityThreat(
                cve_id="CVE-2026-8888",
                severity="CRITICAL",
                affected_component="OpenSSL v3.0.2",
                remediation_steps=["Mettre à jour OpenSSL vers v3.0.3", "Redémarrer Nginx"],
                is_zero_day=False
            ),
            SecurityThreat(
                cve_id="N/A-FTP",
                severity="MEDIUM",
                affected_component="FTP Port 21",
                remediation_steps=["Fermer le port 21", "Utiliser SFTP/SSH"],
                is_zero_day=False
            )
        ],
        overall_risk_score=8.5
    )

    print("\n--- OBJET PYDANTIC VALIDÉ EN SORTIE LLM ---")
    print(json.dumps(mock_parsed_data.model_dump(), indent=2, ensure_ascii=False))
    print(f"\n[+] Validation de type réussie : overall_risk_score = {mock_parsed_data.overall_risk_score} (Type: {type(mock_parsed_data.overall_risk_score)})")

if __name__ == "__main__":
    run_instructor_demo()
```

---

## Module 3 — Outlines & Guidage d'Échantillonnage par Automates FSM (1h30)

### 🔍 Guidage d'Échantillonnage au Niveau Tokenizer (Outlines)

```
GUIDAGE PAR AUTOMATE FINI (Outlines / llama.cpp Grammar)

  Texte Généré par le LLM (Token par Token) :
  Token 1: '{"' ──► Tokenizer
                        │
                        ▼
             ┌─────────────────────────────┐
             │ AUTOMATE D'ÉTATS FINIS (FSM)│
             │ Filtre les logits autorisés │
             └──────────┬──────────────────┘
                        │
                        ▼
  Logits valides uniquement : Ne permet QUE les tokens respectant la Grammaire Regex / JSON !
  ──► Impossible pour le modèle de générer une syntaxe JSON invalide ou un guillemet manquant !
  ──► Zéro ré-essai (0 Retries) ! Latence minimale et garantie syntaxique à 100%.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CoT** | Chain-of-Thought — Technique de prompt encourageant la décomposition du raisonnement |
| **ToT** | Tree-of-Thought — Framework d'exploration arborescente des pensées d'un LLM |
| **FSM** | Finite State Machine — Automate à états finis guidant le masque de logits du tokenizer |
| **Pydantic** | Bibliothèque Python de validation de données et de définition de schémas par annotations |
| **Outlines** | Bibliothèque de guidage d'échantillonnage de LLMs imposant des contraintes de regex/JSON |

---

## Exercices Pratiques

### Exercice 1 — Concevoir un Prompt Chain-of-Thought (CoT) Structuré

Vous devez concevoir un prompt système pour un LLM chargé de vérifier si une adresse IP donnée appartient à un sous-réseau CIDR d'entreprise `192.168.10.0/24`.
1. Rédigez le Prompt Système en imposant une décomposition Chain-of-Thought.
2. Définissez le Schéma Pydantic de la réponse finale attendue.

**Corrigé guidé :**
1. **Prompt Système CoT** :
   ```
   Tu es un ingénieur réseau certifié. Avant de donner le résultat final, tu DOIS analyser la requête étape par étape :
   Étape 1 : Convertir l'adresse IP et le masque CIDR en leur représentation binaire 32-bit.
   Étape 2 : Appliquer le masque de sous-réseau et comparer le préfixe réseau.
   Étape 3 : Conclure si l'IP appartient ou non au sous-réseau.
   ```
2. **Schéma Pydantic** :
   ```python
   class IPValidationResponse(BaseModel):
       ip_address: str
       subnet_cidr: str
       reasoning_steps: List[str]
       is_member: bool
   ```

---

## Banque QCM — 5 Questions

**Q1.** Quelle phrase magique populaire illustre le principe de base de la méthode **Chain-of-Thought (CoT)** ?

- A) "Génère la réponse en format JSON."
- B) "Refléchissons étape par étape..." (Let's think step by step...). ✅
- C) "Traduis ce texte en espagnol."
- D) "Efface la mémoire VRAM."

**Q2.** Comment la méthode **Self-Consistency** améliore-t-elle la précision des réponses d'un LLM par rapport à une seule chaîne CoT ?

- A) En réduisant le taux d'apprentissage.
- B) En générant plusieurs chaînes de raisonnement indépendantes à température $T > 0$ et en effectuant un vote à la majorité sur la réponse finale. ✅
- C) En utilisant deux cartes graphiques.
- D) En supprimant les espaces dans le prompt.

**Q3.** Quel est l'avantage principal de l'utilisation de la bibliothèque **Instructor** combinée à **Pydantic** lors des appels d'APIs LLM ?

- A) Elle rend les requêtes HTTP gratuites.
- B) Elle garantit que la réponse du LLM est automatiquement validée, typée et parsée sous forme d'un objet Python Pydantic conforme au schéma défini, gérant les ré-essais en cas d'erreur de format. ✅
- C) Elle accélère la vitesse de téléchargement.
- D) Elle supprime les clés API.

**Q4.** Comment la bibliothèque **Outlines** garantit-elle qu'un LLM génère un JSON valide sans le moindre échec de syntaxe ?

- A) En entraînant un nouveau modèle depuis zéro.
- B) En convertissant le schéma JSON en un Automate à États Finis (FSM) qui masque au niveau du tokenizer les logits des tokens invalides avant chaque génération. ✅
- C) En traduisant le JSON en XML.
- D) En bloquant l'accès Internet.

**Q5.** Dans l'architecture **Tree-of-Thought (ToT)**, quel algorithme est couramment utilisé pour explorer les différentes branches de pensées générées par le modèle ?

- A) La recherche en largeur (BFS) ou en profondeur (DFS) associée à une évaluation heuristique du score de chaque branche. ✅
- B) Le tri par bulles.
- C) La transformation de Fourier.
- D) L'algorithme de Dijkstra sur carte géographique.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
