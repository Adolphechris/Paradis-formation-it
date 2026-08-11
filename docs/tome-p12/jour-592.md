# TOME P12 — Architecture Ultime, Leadership Technique & Capstone Final — Jour 592 (6h) : Technical Writing & Documentation Excellence — ADRs, Runbooks, RFC & Blog

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser l'art de la **rédaction technique senior** : concision, clarté, structure, absence d'ambiguïté
> - Rédiger des **RFC (Request for Comments)** et des **ADR (Architecture Decision Records)** d'excellence industrielle
> - Écrire des **Runbooks & Playbooks d'incident** exploitables sans hésitation à 3h du matin par un ingénieur d'astreinte (On-Call)
> - Adopter la philosophie **Docs-as-Code** (MkDocs, Markdown, Mermaid.js, validation CI/CD)
>
> **Compétences visées :** `POL-03` (A), `PRO-01` (A) — Technical Writing, Engineering Documentation, Knowledge Management

---

## Module 1 — Le Paradigme Docs-as-Code & La Philosophie de Rédaction (2h)

### 📖 Principes du Technical Writing Senior

La documentation n'est pas un sous-produit facultatif du développement — c'est un **composant de premier ordre de l'architecture**. Un système parfait sans documentation est un système inutilisable dès le départ de son concepteur.

```
LES 4 PILIERS DU TECHNICAL WRITING SENIOR

  1. CONCISION EXTRÊME & CLARTÉ
     - Phrases courtes (< 25 mots).
     - Éliminer le jargon inutile, les verbiages et les adverbes flous ("très", "facilement").
     - Préférer la voix active : "L'agent effectue le scan" plutôt que "Le scan est effectué par l'agent".

  2. STRUCTURE DIAGRAMMATIQUE & VISUELLE
     - Préférer les diagrammes Mermaid.js aux longs paragraphes explicatifs.
     - Utiliser des tableaux comparatifs pour présenter les options.

  3. SÉPARATEUR DE CONTEXTE — QUI EST LE LECTEUR ?
     - Architecture (ADR / RFC) → Destiné aux pairs et C-Level
     - Exploitation (Runbook) → Destiné à l'ingénieur d'astreinte sous stress (instructions pas-à-pas)
     - Onboarding → Destiné aux nouveaux arrivants

  4. CI/CD DOCUMENTATION BUILD
     - Linting Markdown (markdownlint), vérification automatique des liens cassés (lychee),
       compilation MkDocs Material avec option `--strict`.
```

---

## Module 2 — Anatomie des Documents Incontournables (2h)

### 🔍 Structure d'un RFC & Runbook d'Incident

```markdown
<!-- ANATOMIE D'UN RUNBOOK D'INCIDENT EXPLOITABLE À 3H DU MATIN -->

# RUNBOOK-042 : Dépassement de Seuil Mémoire Redis Cluster

## 🚨 Symptômes & Alertes Déclenchées
- Alerte Prometheus : `RedisMemoryUsageHigh (> 85%)`
- Impact utilisateur : Latence d'authentification > 500ms, erreurs HTTP 504.

## 🔍 Étape 1 : Diagnostic Rapide (2 min)
Exécuter la commande suivante pour identifier le nœud saturé :
```bash
redis-cli -h redis-cluster.prod -p 6379 info memory | grep used_memory_human
```

## 🛠️ Étape 2 : Actions Palliatives d'Urgence (5 min)
1. Augmenter la politique de maxmemory-policy si acceptable :
```bash
redis-cli -h redis-cluster.prod CONFIG SET maxmemory-policy volatile-lru
```
2. Si le cluster est au bord du CrashLoopBackOff, vider le cache de session non critique :
```bash
redis-cli -h redis-cluster.prod EVAL "return redis.call('del', unpack(redis.call('keys', 'session:tmp:*')))" 0
```

## 🚑 Étape 3 : Escalade
Si le problème persiste > 15 min → Appeler le Tech Lead Infra au +336XXXXXXXX.
```

---

## Module 3 — Atelier Pratique : Documentation Linter & Generator (1h30)

### 🛠️ Script Python : Documentation Quality Auditor & Markdown Linter

```python
#!/usr/bin/env python3
"""
PARADIS — Documentation Quality Auditor & Markdown Linter (Docs-as-Code)
Vérifie la qualité des fichiers Markdown (liens, titres, présence de callouts et codeblocks).
"""
import re
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class DocAuditReport:
    filename         : str
    has_title        : bool
    has_summary_note : bool
    headings_count   : int
    codeblocks_count : int
    tables_count     : int
    broken_links     : List[str]
    word_count       : int
    quality_score    : int  # 0–100

class DocumentationAuditor:
    """Auditeur de qualité de documentation Markdown"""

    def audit_content(self, filename: str, content: str) -> DocAuditReport:
        lines = content.splitlines()

        has_title        = any(re.match(r'^#\s+.+', line) for line in lines)
        has_summary_note = "[!NOTE]" in content or "[!IMPORTANT]" in content or "> [" in content
        headings_count   = sum(1 for line in lines if re.match(r'^#{1,6}\s+.+', line))
        codeblocks_count = content.count("```") // 2
        tables_count     = sum(1 for line in lines if "|" in line and "---" in line)
        word_count       = len(content.split())

        # Détection basique de liens potentiellement cassés (syntaxe vide ou mal formée)
        broken_links = re.findall(r'\[.*?\]\(\s*\)', content)

        # Calcul du score
        score = 0
        if has_title: score += 20
        if has_summary_note: score += 20
        if headings_count >= 3: score += 20
        if codeblocks_count >= 1: score += 20
        if word_count >= 200: score += 20
        if broken_links: score -= len(broken_links) * 10

        return DocAuditReport(
            filename=filename, has_title=has_title, has_summary_note=has_summary_note,
            headings_count=headings_count, codeblocks_count=codeblocks_count,
            tables_count=tables_count, broken_links=broken_links,
            word_count=word_count, quality_score=max(0, min(100, score))
        )

    def print_report(self, report: DocAuditReport):
        icon = "🟢" if report.quality_score >= 80 else "🟡" if report.quality_score >= 60 else "🔴"
        print(f"📄 Fichier : {report.filename}")
        print(f"  Score Qualité  : {report.quality_score}/100 {icon}")
        print(f"  Mots           : {report.word_count}")
        print(f"  Titre H1       : {'✅ Present' if report.has_title else '❌ Manquant'}")
        print(f"  Callout Note   : {'✅ Present' if report.has_summary_note else '⚪ Recommandé'}")
        print(f"  Sections (H2+) : {report.headings_count}")
        print(f"  Blocs de code  : {report.codeblocks_count}")
        print(f"  Tableaux       : {report.tables_count}")
        if report.broken_links:
            print(f"  ❌ Liens cassés : {len(report.broken_links)} trouvés")


if __name__ == "__main__":
    print("=== PARADIS — DOCS-AS-CODE QUALITY AUDITOR ===\n")

    sample_doc = """# RUNBOOK-01 : Redémarrage d'Urgence du Cluster Kafka

> [!IMPORTANT]
> Ce runbook doit être exécuté uniquement si les courtiers Kafka arrêtent de répondre aux Health Checks.

## 1. Diagnostics
Vérifier l'état du cluster via la commande suivante :
```bash
kubectl get pods -n kafka -l app=kafka
```

## 2. Procédure de Redémarrage Redondant
| Étape | Action | Commande |
|:---|:---|:---|
| 1 | Safe drain node | `kubectl drain node-01` |
| 2 | Restart pod | `kubectl delete pod kafka-0` |

## 3. Escalade
Si le quorum Zookeeper est perdu, contacter l'équipe Infra.
"""

    auditor = DocumentationAuditor()
    report  = auditor.audit_content("docs/runbooks/kafka_restart.md", sample_doc)
    auditor.print_report(report)
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **Docs-as-Code** | Philosophie consistant à traiter la documentation avec les mêmes outils et exigences que le code source |
| **Runbook** | Document contenant la liste précise d'instructions pour exécuter une tâche d'exploitation |
| **Playbook** | Guide décrivant la stratégie et la réponse globale face à un type d'incident |

---

## Exercices Pratiques

### Exercice 1 — Rédaction d'un Runbook sous Contrainte de Stress

Rédigez la section **Étape d'Urgence** d'un Runbook pour le scénario : *"La base de données PostgreSQL principale est saturée en connexions (max_connections reached - Error 53300)."*

**Corrigé :**
```bash
# 🛠️ ACTION D'URGENCE — Tuer les connexions inactives (Idle)
# 1. Se connecter à la base :
psql -h postgres-master.internal -U admin -d maindb

# 2. Exécuter la requête de résiliation des sessions inactives depuis > 5 minutes :
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle' AND state_change < NOW() - INTERVAL '5 minutes';
```

---

## Banque QCM — 5 Questions

**Q1.** Quel est l'objectif numéro 1 d'un **Runbook d'Incident** ?

- A) Expliquer l'histoire de la création du logiciel.
- B) Fournir des instructions pas-à-pas claires, concises et directement exécutables pour résoudre rapidement un incident, même par un ingénieur d'astreinte réveillé à 3h du matin. ✅
- C) Lister toutes les fonctions du code.
- D) Définir le budget annuel de l'équipe.

**Q2.** Dans la philosophie **Docs-as-Code**, comment la documentation est-elle gérée ?

- A) Dans un fichier Word stocké sur un bureau local.
- B) Directement dans le dépôt Git au format Markdown, relue par Pull Request et compilée/validée automatiquement par des pipelines CI/CD. ✅
- C) Sur un wiki papier.
- D) Par une équipe d'écrivains externes non techniques.

**Q3.** Pourquoi recommande-t-on d'utiliser la **voix active** dans la rédaction technique ("L'agent effectue le scan" plutôt que "Le scan est effectué") ?

- A) Parce que c'est plus long.
- B) Cela élimine toute ambiguïté sur qui ou quel composant exécute l'action, rendant la lecture plus rapide et directe. ✅
- C) C'est obligatoire pour MkDocs.
- D) La voix passive est interdite en informatique.

**Q4.** Quel outil permet de valider automatiquement l'absence de **liens cassés** dans des documents Markdown dans un pipeline CI/CD ?

- A) Docker
- B) Lychee / markdown-link-check ✅
- C) Nginx
- D) Git

**Q5.** Dans un document **ADR (Architecture Decision Record)**, quelle section récapitule les compromis et désavantages acceptés lors du choix d'une technologie ?

- A) Status
- B) Title
- C) Consequences (Conséquences & Trade-offs) ✅
- D) Author

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
