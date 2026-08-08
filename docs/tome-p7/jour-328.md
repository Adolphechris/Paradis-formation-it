# TOME P7 — Certifications d'Élite & Spécialisations — Jour 328 (6h) : Secure Code Review — SAST Automation (Semgrep Custom Rules, CodeQL Taint Analysis, SARIF Integration & DevSecOps Pipelines)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'**analyse statique de code source (SAST)** et la revue de code de sécurité : rédiger des règles **Semgrep** personnalisées pour intercepter des failles d'injection (SQLi, Command Injection, XSS), réaliser des requêtes d'analyse de flux de données (**Taint Analysis**) avec **CodeQL**, et intégrer les rapports standardisés **SARIF (Static Analysis Results Interchange Format)** dans un pipeline CI/CD DevSecOps.
>
> **Compétences visées :** `SAST-01` (A) — Semgrep Custom Rules Development | `SAST-02` (A) — CodeQL Taint Tracking & SARIF CI/CD Integration

---

## 1) Module — Analyse Statique & Taint Tracking (2h)

### 📖 Narration/Intuition

L'analyse de flux de données (**Taint Analysis**) trace le parcours des entrées utilisateur non sûres (**Sources**) jusqu'aux fonctions d'exécution critiques (**Sinks**). Si la donnée ne passe pas par une fonction d'assainissement ou de validation (**Sanitizer**), une vulnérabilité est confirmée.

```
       [ USER INPUT (Source) ]  ---> (ex. req.args.get('id'))
                  │
                  ▼
       [ UNTAINTED DATA STREAM ]
                  │
                  ├── (Sans Sanitizer) ──► [ DANGEROUS EXEC (Sink) ]  ==> VULNÉRABILITÉ (SQLi)
                  │
                  └── (Passage par Sanitizer) ──► (int(id) / Prepared Statement) ==> SAFE
```

---

## 2) Module — Semgrep & CodeQL Rules (`sast_rule_engine.py`) (2h)

### 🛠️ Atelier Pratique

```yaml
# Règle Semgrep Personnalisée : Détection d'Injection SQL dans des requêtes Python (Flask/Django)
rules:
  - id: python-sqli-formatted-string
    patterns:
      - pattern-either:
          - pattern: $DB.execute(f"...{$VAR}...")
          - pattern: $DB.execute("..." % $VAR)
          - pattern: $DB.execute("...".format(..., $VAR, ...))
      - pattern-not: $DB.execute("...", (...)) # Exclut les requêtes préparées avec tuples
    message: |
      [CRITIQUE] Injection SQL potentielle détectée ! 
      La variable '$VAR' est directement formatée dans la requête SQL sans être paramétrée.
      Utilisez des requêtes préparées (Prepared Statements) : cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    languages: [python]
    severity: ERROR
    metadata:
      cwe: "CWE-89: Improper Neutralization of Special Elements used in an SQL Command"
      owasp: "A03:2021 - Injection"
```

```python
import json

def parse_sarif_report(sarif_file_path: str):
    """
    Parse un rapport SARIF (Static Analysis Results Interchange Format) 
    généré par CodeQL ou Semgrep pour automatiser les blocages CI/CD.
    """
    print(f"=== PARSING RAPPORT SARIF SAST : {sarif_file_path} ===")
    
    with open(sarif_file_path, "r", encoding="utf-8") as f:
        sarif_data = json.load(f)
        
    runs = sarif_data.get("runs", [])
    critical_count = 0
    
    for run in runs:
        tool_name = run.get("tool", {}).get("driver", {}).get("name", "Unknown SAST Tool")
        results = run.get("results", [])
        
        print(f"[*] Outil : {tool_name} | Vulnerabilités trouvées : {len(results)}")
        
        for res in results:
            rule_id = res.get("ruleId", "N/A")
            level = res.get("level", "warning")
            message = res.get("message", {}).get("text", "")
            
            locations = res.get("locations", [])
            file_loc = "N/A"
            line_loc = 0
            if locations:
                phys = locations[0].get("physicalLocation", {})
                file_loc = phys.get("artifactLocation", {}).get("uri", "N/A")
                line_loc = phys.get("region", {}).get("startLine", 0)
                
            if level in ["error", "high"]:
                critical_count += 1
                print(f"  [!] {level.upper()} [{rule_id}] à {file_loc}:{line_loc}")
                print(f"      Description: {message[:100]}...\n")
                
    return critical_count

# Simulation d'un rapport SARIF
mock_sarif = {
    "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
    "version": "2.1.0",
    "runs": [{
        "tool": {"driver": {"name": "Semgrep Enterprise"}},
        "results": [{
            "ruleId": "python-sqli-formatted-string",
            "level": "error",
            "message": {"text": "Formatted SQL Query with raw user input in cursor.execute()"},
            "locations": [{
                "physicalLocation": {
                    "artifactLocation": {"uri": "src/api/auth.py"},
                    "region": {"startLine": 42}
                }
            }]
        }]
    }]
}

with open("sample_report.sarif", "w") as f:
    json.dump(mock_sarif, f)

crit_found = parse_sarif_report("sample_report.sarif")
print(f"Bilan CI/CD : {crit_found} vulnérabilité(s) critique(s).")
```

---

## 3) Module — Requête CodeQL Taint Analysis (QL Language) (2h)

```ql
/**
 * @name Unsanitized Command Injection Taint Tracking
 * @description Détecte la propagation de données utilisateur vers os.system()
 * @kind path-problem
 * @problem.severity error
 * @security-severity 9.8
 * @precision high
 * @id py/command-injection-taint
 */

import python
import semmle.python.security.dataflow.CommandInjectionCustomizes
import DataFlow::PathGraph

class CommandInjectionConfiguration extends TaintTracking::Configuration {
  CommandInjectionConfiguration() { this = "CommandInjectionConfiguration" }

  override predicate isSource(DataFlow::Node source) {
    // La source est une entrée HTTP Flask (request.args ou request.form)
    exists(HttpInputAttribute input | source = input.getAHttpInputNode())
  }

  override predicate isSink(DataFlow::Node sink) {
    // Le sink est un appel à os.system ou subprocess.Popen
    exists(FunctionCall call |
      call.getFunc().(Name).getId() in ["system", "popen"] and
      sink.asExpr() = call.getAnArg()
    )
  }
}

from CommandInjectionConfiguration config, DataFlow::PathNode source, DataFlow::PathNode sink
where config.hasFlowPath(source, sink)
select sink.getNode(), source, sink, "Command Injection via untrusted input from $@.", source.getNode(), "user input"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SAST** | Static Application Security Testing — Analyse automatique du code source sans exécution |
| **SARIF** | Static Analysis Results Interchange Format — Format JSON standardisé par l'OASIS pour les résultats d'outils SAST |
| **CodeQL** | Moteur d'analyse sémantique de code (GitHub) permettant de requêter le code comme une base de données |
| **Semgrep** | Outil SAST ultra-rapide basé sur la correspondance de motifs syntaxiques |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans une analyse de flux de données (Taint Analysis), qu'appelle-t-on la **Source** et le **Sink** ?
- A) La Source est le point d'entrée non sécurisé de données externes (ex: paramètre HTTP), et le Sink est la fonction d'exécution sensible (ex: `eval()`, `cursor.execute()`)
- B) La Source est la base de données et le Sink l'écran de l'utilisateur
- C) La Source est la règle YARA et le Sink le fichier binaire
- D) Ce sont des termes utilisés uniquement en cryptographie

**Réponse : A**

**Q2 :** Quel est l'avantage principal du format **SARIF (Static Analysis Results Interchange Format)** ?
- A) Il s'agit d'un standard JSON universel permettant d'uniformiser et de centraliser les résultats de multiples outils SAST (CodeQL, Semgrep, SonarQube) dans les pipelines CI/CD
- B) Il accélère l'exécution du code en production
- C) Il remplace le compilateur C++
- D) Il chiffre le code source

**Réponse : A**

**Q3 :** Pourquoi les analyses basées sur la syntaxe abstraite (AST / Taint Tracking) sont-elles supérieures au simple `grep` pour trouver des failles de sécurité ?
- A) Parce qu'elles comprennent la structure sémantique du code et suivent la propagation des variables à travers les fonctions, réduisant drastiquement les faux positifs et évitant les oublis
- B) Parce que grep est payant
- C) Parce que les AST fonctionnent sans code source
- D) Elles ne sont pas supérieures, grep est meilleur

**Réponse : A**

**Q4 :** Dans une règle Semgrep, quelle directive permet d'exclure explicitement un motif sécurisé (ex. requête SQL paramétrée) pour éviter un faux positif ?
- A) `pattern-not`
- B) `pattern-either`
- C) `severity: ignore`
- D) `languages: none`

**Réponse : A**

**Q5 :** Quel est le rôle d'un **Sanitizer** dans une chaîne de Taint Tracking ?
- A) Une fonction ou opération qui valide, nettoie ou échappe la donnée d'entrée, la rendant sûre avant qu'elle n'atteigne le Sink (coupant ainsi la propagation du Taint)
- B) Un script de nettoyage des logs CI/CD
- C) Un antivirus côté serveur
- D) Un plugin de formatage du code

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
