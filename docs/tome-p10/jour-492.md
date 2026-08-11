# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 492 (6h) : Génération de Code & LLMs pour l'Ingénierie Logicielle : StarCoder, Qwen-Coder, Fill-In-the-Middle (FIM) & Code-RAG avec AST

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre l'architecture et les objectifs de pré-entraînement des LLMs spécialisés en code (StarCoder2, Qwen-2.5-Coder)
> - Maîtriser le mécanisme **Fill-In-the-Middle (FIM)** pour l'auto-complétion au milieu de fichier
> - Construire un pipeline **Code-RAG (Retrieval-Augmented Generation)** s'appuyant sur les arbres de syntaxe abstraite (**AST — Abstract Syntax Tree**)
> - Évaluer la qualité du code généré avec des linters et des exécutions isolées en bac à sable
>
> **Compétences visées :** `AI-02` (A) — Code Generation & Software Engineering LLMs

---

## Module 1 — Architectures Code-LLM & le Mécanisme Fill-In-The-Middle (FIM) (2h)

### 📖 Intuition & Narration

Les modèles de langage généralistes génèrent du texte de manière strictement gauche-à-droite. Cependant, dans un environnement de développement (IDE), un développeur ne demande pas seulement de continuer un fichier après la dernière ligne : il insère son curseur **au milieu d'un fichier existant**, entre la définition d'une fonction et son appel.

Pour résoudre ce besoin d'autocomplétion contextuelle, les modèles de code spécialisés (StarCoder, Qwen-Coder, CodeLlama) intègrent l'objectif de pré-entraînement **Fill-In-the-Middle (FIM)**.

### 🔍 Anatomie Technique — Transformation de Prompt FIM

```
PRÉ-ENTRAÎNEMENT FILL-IN-THE-MIDDLE (FIM)

  Fichier d'Origine :
  [ PREFIX : Début du fichier ] [ TARGET : Code à insérer ] [ SUFFIX : Fin du fichier ]

  Format de Ré-arrangement FIM (SPM - Suffix-Prefix-Middle) :
  <|fim_prefix|> [ PREFIX ] <|fim_suffix|> [ SUFFIX ] <|fim_middle|> [ TARGET ]

EXEMPLE CONCRET D'AUTO-COMPLÉTION DANS UN IDE :

  Prefix : "def calculate_area(radius):\n    import math\n    "
  Suffix : "\n\nprint(calculate_area(5))"

  Prompt FIM envoyé au modèle :
  <|fim_prefix|>def calculate_area(radius):\n    import math\n    <|fim_suffix|>\n\nprint(calculate_area(5))<|fim_middle|>

  Le modèle génère :
  return math.pi * (radius ** 2) <|file_separator|>
```

---

## Module 2 — Atelier Pratique : Code-RAG basés sur AST (Abstract Syntax Trees) (2h)

### 🛠️ Code Python : Parser AST et Code-RAG avec `tree-sitter` / `ast`

```python
#!/usr/bin/env python3
"""
PARADIS — Extraction de Dépendances de Code par AST (Abstract Syntax Tree) pour Code-RAG
"""

import ast

def extract_python_ast_functions(code_snippet: str) -> list:
    """
    Analyse le code Python et extrait les définitions de fonctions et leurs signatures via l'AST
    """
    tree = ast.parse(code_snippet)
    extracted_structures = []

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            args = [arg.arg for arg in node.args.args]
            extracted_structures.append({
                "function_name": node.name,
                "arguments": args,
                "docstring": ast.get_docstring(node),
                "line_number": node.lineno
            })

    return extracted_structures

def run_code_rag_demo():
    print("[*] --- DÉMONSTRATION CODE-RAG AVEC AST PARADIS IT ---")

    python_code = """
def authenticate_user(username: str, password_hash: str) -> bool:
    \"\"\"Vérifie les identifiants de l'utilisateur dans la base LDAP.\"\"\"
    if not username or not password_hash:
        return False
    return ldap_verify(username, password_hash)

def generate_jwt_token(user_id: int) -> str:
    \"\"\"Génère un token JWT signé pour la session utilisateur.\"\"\"
    return jwt_encode({"user_id": user_id})
    """

    print("\n[1] Parsing du Fichier Python via l'AST...")
    structures = extract_python_ast_functions(python_code)

    print("\n--- STRUCTURES EXTRAITES DE L'AST POUR INDEXATION VECTORIELLE CODE ---")
    for struct in structures:
        print(f"  • Fonction : {struct['function_name']:25s} | Args: {struct['arguments']} | Ligne: {struct['line_number']}")
        print(f"    Docstring: {struct['docstring']}")

    print("\n[+] Les signatures AST sont indexées dans la base vectorielle pour un Code-RAG ultra-précis.")

if __name__ == "__main__":
    run_code_rag_demo()
```

---

## Module 3 — Évaluation & Sandboxing pour la Génération de Code (1h30)

### 🔍 Pipeline de Validation de Code Généré

```
PIPELINE DE SÉCURITÉ DE CODE GÉNÉRÉ PAR IA

  [ Génération LLM ] ──► [ AST Syntax Validation (ast.parse) ]
                                      │
                                      ▼
                         [ Linter & Static Analysis (Flake8 / Bandit / Semgrep) ]
                                      │
                                      ▼
                         [ Sandboxed Execution (Docker / WASM) ]
                         ──► Exécution des tests unitaires (pytest).
                         ──► Mesure du score Pass@1.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **FIM** | Fill-In-the-Middle — Technique de pré-entraînement permettant l'auto-complétion au milieu de fichier |
| **AST** | Abstract Syntax Tree — Arbre de syntaxe abstraite représentant la structure d'un code source |
| **SPM** | Suffix-Prefix-Middle — Format de ré-arrangement de prompt pour le découpage FIM |
| **Pass@1** | Pourcentage de problèmes de code où l'unique essai généré passe tous les tests unitaires |
| **Semgrep** | Outil d'analyse statique de code basé sur des motifs de recherche syntaxiques |

---

## Exercices Pratiques

### Exercice 1 — Construction d'un Prompt FIM

Vous souhaitez compléter la ligne manquante dans le script Python suivant :
```python
def hash_password(password: str) -> str:
    import hashlib
    # <CURSEUR_ICI>
    return hasher.hexdigest()
```
Formatez le prompt FIM au format SPM (Suffix-Prefix-Middle) en utilisant les balises `<|fim_prefix|>`, `<|fim_suffix|>` et `<|fim_middle|>`.

**Corrigé guidé :**
```
<|fim_prefix|>def hash_password(password: str) -> str:
    import hashlib
    <|fim_suffix|>
    return hasher.hexdigest()<|fim_middle|>
```
Le modèle générera la ligne intermédiaire :
```python
hasher = hashlib.sha256(password.encode())
```

---

## Banque QCM — 5 Questions

**Q1.** Quelle est l'utilité du mécanisme **Fill-In-the-Middle (FIM)** pour les modèles de code comme StarCoder ou Qwen-Coder ?

- A) Il permet de traduire du code Python en Java.
- B) Il permet au modèle d'effectuer de l'auto-complétion contextuelle au milieu d'un fichier existant en prenant en compte à la fois le Prefix (début) et le Suffix (fin du fichier). ✅
- C) Il supprime les commentaires de code.
- D) Il accélère la vitesse de la carte réseau.

**Q2.** Pourquoi utilise-t-on les **AST (Abstract Syntax Trees)** plutôt qu'un simple découpage par lignes pour le Code-RAG ?

- A) Parce que l'AST ne fonctionne que sur Windows.
- B) Parce que l'AST respecte les frontières syntaxiques réelles du code (fonctions, classes, méthodes) évitant de couper une fonction ou un bloc d'instructions en deux au milieu d'un chunk. ✅
- C) Parce que l'AST convertit le code en fichier image.
- D) Pour compresser le code source au format ZIP.

**Q3.** Quel outil d'analyse statique de sécurité Python est fréquemment intégré dans les pipelines MLOps pour vérifier qu'un code généré par un LLM n'introduit pas de failles (ex: `exec()`, `eval()`) ?

- A) Bandit / Semgrep ✅
- B) MS Paint
- C) Gzip
- D) Ping

**Q4.** Dans le format FIM SPM, dans quel ordre les sections du fichier d'origine sont-elles présentées dans le prompt envoyé au modèle ?

- A) Suffix ──► Prefix ──► Middle ✅
- B) Middle ──► Prefix ──► Suffix
- C) Prefix ──► Middle ──► Suffix
- D) Random

**Q5.** Pourquoi est-il indispensable d'exécuter les tests unitaires du code généré par IA dans une **Sandbox (Docker/WASM)** ?

- A) Pour empêcher que du code malveillant ou une boucle infinie générée par le LLM n'endommage le système hôte. ✅
- B) Parce que Python ne tourne pas sur Linux.
- C) Pour réduire la taille du fichier.
- D) Pour accélérer le téléchargement des packages.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
