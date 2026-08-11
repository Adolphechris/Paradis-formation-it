# TOME P11 — DevSecOps & Cloud Security — Jour 452 (6h) : Analyse Statique de Code — SAST Avancé (SonarQube, Semgrep, AST & Custom Security Rules)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser le fonctionnement interne des moteurs **SAST** : AST (Abstract Syntax Tree), analyse de flux de données (Taint Analysis) et Graphe de Flux de Contrôle (CFG)
> - Déployer et configurer **SonarQube** et **Semgrep** dans un environnement d'entreprise
> - Écrire des **règles de sécurité personnalisées** (Semgrep YAML rules) pour détecter les vulnérabilités spécifiques aux métiers (business logic flaws, custom crypto)
> - Éliminer les **faux positifs** et gérer le Technical Debt de sécurité (Quality Gates)
>
> **Compétences visées :** `SEC-07` (A) — Static Code Analysis, `SEC-04` (A) — Code Security Auditing

---

## Module 1 — Architecture & Moteurs d'Analyse SAST (2h)

### 📖 Intuition & Narration

Comment un outil SAST parvient-il à détecter une injection SQL dans un projet de 500 000 lignes de code en quelques secondes, sans exécuter la moindre ligne ? Il ne cherche pas simplement des chaînes de caractères avec des expressions régulières (ce qui générerait des milliers de faux positifs). Il transforme le code en un arbre syntaxique abstrait (**AST**) et trace le chemin parcouru par les données non fiables entrées par l'utilisateur (**sources**) jusqu'aux fonctions sensibles (**sinks**). C'est la **Taint Analysis** (analyse de souillure).

### 🔍 Anatomie Technique — Taint Analysis & AST

```
CONCEPTS CLÉS DE LA TAINT ANALYSIS SAST

  [SOURCE UNTRUSTED] ───▶ [PROPAGATION] ───▶ [SANITIZER / CHECK] ───▶ [SINK CRITIQUE]
  Ex: req.params.id       Ex: val = id       Ex: val = int(id)        Ex: db.query(val)
  (Donnée utilisateur)    (Assignation)      (Validation/Nettoyage)   (Vulnérabilité SQLi!)

  ┌─────────────────────────────────────────────────────────────┐
  │  MOTEURS D'ANALYSE SAST                                     │
  ├─────────────────────────────────────────────────────────────┤
  │  1. AST Parsing      : Transforme le code en arbre de tokens│
  │  2. CFG (Control Flow) : Cartographie tous les chemins if/else│
  │  3. Data Flow        : Suit les variables à travers les appel│
  │  4. Taint Tracking   : Détecte Source → Sink sans Sanitizer │
  └─────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Semgrep & Règles de Sécurité Personnalisées (2h)

### 🛠️ Atelier Pratique — Rédaction de Règles Semgrep

```yaml
# rules/paradis-custom-security.yml
rules:
  - id: paradis-python-sqli-taint
    languages: [python]
    severity: ERROR
    message: |
      Vulnérabilité d'injection SQL détectée ! La variable provenant de la requête
      est concaténée directement dans une requête SQL sans paramétrage.
    mode: taint
    pattern-sources:
      - pattern: request.args.get(...)
      - pattern: request.form[...]
      - pattern: request.json[...]
    pattern-sanitizers:
      - pattern: int(...)
      - pattern: psycopg2.sql.Identifier(...)
    pattern-sinks:
      - pattern: cursor.execute(...)
      - pattern: db.engine.execute(...)

  - id: paradis-hardcoded-jwt-secret
    languages: [python, javascript]
    severity: ERROR
    message: "Clé secrète JWT codée en dur détectée !"
    patterns:
      - pattern-either:
          - pattern: jwt.encode(..., "$SECRET", ...)
          - pattern: jwt.verify(..., "$SECRET", ...)
      - pattern-not: jwt.encode(..., os.getenv(...), ...)

  - id: paradis-unsafe-deserialization
    languages: [python]
    severity: CRITICAL
    message: "Désérialisation Pickle non sécurisée !"
    pattern: pickle.loads(...)
```

```bash
# Exécution de Semgrep avec règles personnalisées
semgrep --config rules/paradis-custom-security.yml .
```

---

## Module 3 — Quality Gates & SonarQube Enterprise (1h30)

### 🛠️ Atelier Pratique — Configuration SonarQube Quality Gate

```bash
# ══════════════════════════════════════════════════════
# SONARQUBE — Scan SAST & Enforcement de Quality Gate
# ══════════════════════════════════════════════════════

# 1. Lancement du SonarScanner CLI
sonar-scanner \
  -Dsonar.projectKey=paradis-banking-core \
  -Dsonar.sources=. \
  -Dsonar.host.url=https://sonarqube.internal.paradis.it \
  -Dsonar.token=sqp_1234567890abcdef \
  -Dsonar.qualitygate.wait=true  # Attendre le résultat de la Quality Gate

# 2. Critères d'une Quality Gate Sécurité d'Entreprise
# ┌─────────────────────────────────────────────────────────────┐
# │  QUALITY GATE PARADIS STRICT                                │
# ├─────────────────────────────────────────────────────────────┤
# │  - New Security Vulnerabilities > 0         ──▶ FAIL BUILD  │
# │  - New Security Hotspots Reviewed < 100%    ──▶ FAIL BUILD  │
# │  - Security Rating on New Code < A          ──▶ FAIL BUILD  │
# │  - Duplicated Lines on New Code > 3%        ──▶ WARNING     │
# └─────────────────────────────────────────────────────────────┘
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **AST** | Abstract Syntax Tree — Représentation sous forme d'arbre de la structure syntaxique du code source |
| **CFG** | Control Flow Graph — Graphique représentant tous les chemins d'exécution possibles d'un programme |
| **Sink** | Point final sensible dans le code (ex: fonction d'exécution de requête SQL, d'évaluation système) |
| **Source** | Point d'entrée de données non vérifiées dans une application (ex: paramètre HTTP, header, cookie) |

---

## Exercices Pratiques

### Exercice 1 — Taint Analysis

Dans le code suivant :
```python
user_id = request.args.get('id')
clean_id = int(user_id)
cursor.execute(f"SELECT * FROM users WHERE id = {clean_id}")
```
**Question :** Un outil SAST avec Taint Analysis doit-il lever une alerte d'injection SQL ? Pourquoi ?

**Corrigé guidé :** NON. Bien que la variable `clean_id` soit concaténée dans la requête, elle a été convertie via `int(user_id)`. La fonction `int()` agit comme un **Sanitizer** qui neutralise toute tentative d'injection SQL (une chaîne non numérique lèvera une exception `ValueError`).

---

## Banque QCM — 5 Questions

**Q1.** En SAST, qu'appelle-t-on une **Source** dans une Taint Analysis ?

- A) L'adresse du dépôt Git hébergeant le code
- B) Un point d'entrée par lequel des données non fiables entrent dans l'application ✅
- C) La base de données centrale de l'entreprise
- D) Le serveur d'intégration continue CI/CD

**Q2.** Un **Sink** en SAST représente :

- A) Une fonction de nettoyage des entrées
- B) Une fonction sensible où l'exécution de données non assainies cause une vulnérabilité ✅
- C) Le fichier de configuration du scanner SAST
- D) Un faux positif ignoré par les développeurs

**Q3.** Les règles **Semgrep** permettent principalement de :

- A) Décompiler des binaires C++
- B) Définir des patterns de recherche syntaxiques et sémantiques personnalisés sur le code source ✅
- C) Scanner le réseau à la recherche de ports ouverts
- D) Chiffrer les bases de données SQL

**Q4.** Dans SonarQube, la notion de **Security Hotspot** désigne :

- A) Une vulnérabilité confirmée devant être corrigée immédiatement
- B) Un extrait de code sensible nécessitant une revue humaine pour vérifier s'il est vulnérable ✅
- C) Un serveur de production sous attaque DDoS
- D) Une clé API expirée

**Q5.** Pourquoi l'analyse basée sur l'AST est-elle supérieure aux expressions régulières (grep) pour le SAST ?

- A) Elle est écrite en langage C
- B) Elle comprend la structure syntaxique, la portée des variables et le flux de données, réduisant les faux positifs ✅
- C) Elle ne fonctionne que sur les ordinateurs quantiques
- D) Elle supprime automatiquement le code vulnérable

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
