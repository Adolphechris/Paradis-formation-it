# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 502 (6h) : Analyse Statique de Code (SAST) : SonarQube, Semgrep, AST & Écriture de Règles de Sécurité Sur Mesure

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le fonctionnement interne des moteurs d'analyse statique de code (**SAST**) s'appuyant sur les arbres de syntaxe abstraite (**AST**)
> - Déployer et configurer **SonarQube** et **Semgrep** dans un pipeline de développement d'entreprise
> - Rédiger des **règles Semgrep personnalisées** (YAML) pour interdire les anti-patterns et fonctions dangereuses propres à l'entreprise
> - Automatiser le filtrage des faux positifs et le calcul de la dette technique de sécurité (Security Debt)
>
> **Compétences visées :** `SEC-05` (A) — SAST & Custom Rule Engineering

---

## Module 1 — Mécanique Interne d'un Moteur SAST & AST (2h)

### 📖 Intuition & Narration

Comment un outil SAST parvient-il à détecter une vulnérabilité d'injection SQL dans un projet de 500 000 lignes de code sans jamais exécuter l'application ?

La réponse réside dans le parsing syntaxique. Un analyseur statique ne lit pas le code comme un simple fichier texte avec des expressions régulières (Regex). Il transforme le code source en un **Arbre de Syntaxe Abstraite (AST — Abstract Syntax Tree)**, une structure de données hiérarchique représentant la grammaire du langage.

Le moteur effectue ensuite deux analyses avancées :
1. **Control Flow Graph (CFG)** : Cartographie de tous les chemins d'exécution possibles à travers les boucles et les conditions.
2. **Taint Analysis (Analyse de Souillure)** : Traçage des données non fiables saisies par l'utilisateur (**Source**) jusqu'aux fonctions d'exécution sensibles (**Sink**). Si une donnée "souillée" atteint une Sink sans passer par une fonction d'assainissement (**Sanitizer**), une faille est levée.

### 🔍 Anatomie Technique — Taint Analysis (Source ──► Sanitizer ──► Sink)

```
ANATOMIE DE LA TAINT ANALYSIS SAST

  [ USER INPUT ] ──► (Data Source) : username = request.args.get('user')
                            │
                            │ [ Donnée "Souillée" / Tainted Data ]
                            ▼
              ┌──────────────────────────┐
              │ Passée par Sanitizer ?   │
              └─────────────┬────────────┘
                            │
            ┌───────────────┴───────────────┐
            │ NO                            │ YES
            ▼                               ▼
    db.execute(f"SELECT... {user}")   db.execute("SELECT...", (sanitize(user),))
            │                               │
            ▼                               ▼
    [ SINK NON SECURISEE ]           [ SINK PROTÉGÉE ]
    🚨 LEVÉE D'ALERTE SAST           ✅ PASSE SANS ERREUR
```

---

## Module 2 — Atelier Pratique : Écriture de Règles Semgrep Sur Mesure (2h)

### 🛠️ Code YAML & Python : Règle Semgrep Personnalisée & Script de Validation

```yaml
# /rules/paradis-no-exec-eval.yaml — Règle Semgrep Personnalisée PARADIS IT
rules:
  - id: paradis-python-no-eval-exec
    pattern-either:
      - pattern: eval(...)
      - pattern: exec(...)
    message: |
      [SÉCURITÉ CRITIQUE] L'utilisation de eval() ou exec() est strictement interdite par la charte DevSecOps PARADIS IT.
      Risque : Remote Code Execution (RCE).
    languages: [python]
    severity: ERROR
    metadata:
      cwe: "CWE-95: Improper Neutralization of Directives in Dynamically Evaluated Code ('Eval Injection')"
      owasp: "A03:2021 - Injection"
```

```python
#!/usr/bin/env python3
"""
PARADIS — Semgrep Custom Rule Executor & Parser
Exécute Semgrep avec des règles personnalisées YAML et parse les résultats JSON.
"""

import json
import subprocess
import sys

def create_sample_code():
    sample_code = """
def process_user_input(user_command: str):
    # Code vulnérable pour la démonstration SAST
    print("Exécution de la commande...")
    result = eval(user_command)  # Faille RCE !
    return result

def safe_function(a: int, b: int):
    return a + b
"""
    with open("/tmp/vulnerable_sample.py", "w") as f:
        f.write(sample_code)

def run_semgrep_analysis():
    print("=== DÉMARRAGE DE L'ANALYSE SAST SEMGREP PARADIS IT ===")
    create_sample_code()

    # Simulation d'exécution de Semgrep (Rapport structuré JSON)
    mock_semgrep_output = {
        "results": [
            {
                "check_id": "rules.paradis-python-no-eval-exec",
                "path": "/tmp/vulnerable_sample.py",
                "start": {"line": 5, "col": 14},
                "end": {"line": 5, "col": 31},
                "extra": {
                    "message": "[SÉCURITÉ CRITIQUE] L'utilisation de eval() est interdite. Risque RCE.",
                    "severity": "ERROR",
                    "metadata": {"cwe": "CWE-95"}
                }
            }
        ]
    }

    print("[*] Analyse statique en cours...")
    print(f"[*] Fichier analysé : /tmp/vulnerable_sample.py")

    findings = mock_semgrep_output["results"]
    print(f"\n[!] Nombre de vulnérabilités détectées : {len(findings)}")

    for f in findings:
        print(f"\n  🚨 ALERTE RÈGLE : {f['check_id']}")
        print(f"     Fichier      : {f['path']}:{f['start']['line']}")
        print(f"     Sévérité     : {f['extra']['severity']}")
        print(f"     Message      : {f['extra']['message'].strip()}")
        print(f"     CWE          : {f['extra']['metadata']['cwe']}")

    if findings:
        print("\n[⛔ RESULTAT] ÉCHEC DU SCAN SAST — Code non conforme.")
        return False
    return True

if __name__ == "__main__":
    success = run_semgrep_analysis()
    if not success:
        sys.exit(1)
```

---

## Module 3 — SonarQube, Quality Gates & Gestion de la Dette Technique (1h30)

### 🔍 SonarQube & Calcul de la Dette Technique

SonarQube calcule la **Security Debt** (Dette Technique de Sécurité), c'est-à-dire le temps estimé nécessaire pour corriger toutes les vulnérabilités et *Security Hotspots* présentes dans le code.

```
MÉTRIQUES DE QUALITÉ & SÉCURITÉ SONARQUBE

  ┌────────────────────────────────────────────────────────────────────────┐
  │ METRIQUE SONAR     │ DÉFINITION & SEUIL D'ACCEPTATION                  │
  ├────────────────────┼───────────────────────────────────────────────────┤
  │ Security Rating    │ Note de A (0 vulnérabilité) à E (>= 1 Critical)   │
  │ Security Hotspots  │ Code nécessitant une revue humaine de sécurité    │
  │ Coverage           │ % de lignes couvertes par les tests (Cible >= 80%)│
  │ Duplications       │ % de code dupliqué (Cible <= 3%)                  │
  │ Security Debt      │ Temps estimé de remédiation (ex: 2h 45min)        │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **AST** | Abstract Syntax Tree — Arbre de syntaxe abstraite représentant la structure d'un code |
| **CFG** | Control Flow Graph — Graphe de flux de contrôle représentant les chemins d'exécution |
| **Taint Analysis** | Technique d'analyse statique traçant la propagation des données non fiables (Source → Sink) |
| **CWE** | Common Weakness Enumeration — Dictionnaire standard des types de failles de sécurité logicielles |
| **RCE** | Remote Code Execution — Exécution de code à distance |

---

## Exercices Pratiques

### Exercice 1 — Rédaction de Pattern Semgrep

Vous devez rédiger la section `pattern` d'une règle Semgrep visant à interdire l'utilisation du module de hachage obsolète `md5` dans Python (`hashlib.md5(...)`).

**Corrigé guidé :**
```yaml
rules:
  - id: paradis-python-no-md5
    pattern: hashlib.md5(...)
    message: "Le hachage MD5 est cryptographiquement vulnérable aux collisions. Utilisez SHA-256 (hashlib.sha256)."
    languages: [python]
    severity: WARNING
```

---

## Banque QCM — 5 Questions

**Q1.** Comment un moteur d'analyse statique (**SAST**) représente-t-il le code source pour analyser sa structure sans l'exécuter ?

- A) En convertissant le code en fichier audio.
- B) En générant un Arbre de Syntaxe Abstraite (AST — Abstract Syntax Tree). ✅
- C) En utilisant un fichier ZIP.
- D) En capturant des paquets réseau.

**Q2.** Dans l'**Analyse de Souillure (Taint Analysis)**, qu'appelle-t-on la **Sink** ?

- A) L'endroit où l'utilisateur saisit sa donnée.
- B) Une fonction sensible ou critique (ex: `db.execute()`, `system()`, `eval()`) qui ne doit pas recevoir de données non assainies. ✅
- C) La mémoire cache du processeur.
- D) Un serveur DNS.

**Q3.** Quel est le rôle d'un **Sanitizer** dans une analyse de Taint Analysis ?

- A) Nettoyer l'écran de l'ordinateur.
- B) Valider, filtrer ou échapper la donnée non fiable (Source) pour la rendre sûre avant qu'elle n'atteigne la Sink. ✅
- C) Supprimer les commentaires de code.
- D) Redémarrer le serveur Web.

**Q4.** Quel est le format de fichier utilisé par l'outil **Semgrep** pour définir des règles de sécurité personnalisées ?

- A) Fichiers XML.
- B) Fichiers YAML. ✅
- C) Fichiers HTML.
- D) Fichiers CSV.

**Q5.** Dans SonarQube, que mesure la **Security Debt** ?

- A) Le montant des factures non payées.
- B) L'estimation du temps nécessaire pour corriger l'ensemble des vulnérabilités de sécurité détectées dans le code. ✅
- C) Le nombre de lignes de code écrites par jour.
- D) La vitesse de connexion Internet.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
