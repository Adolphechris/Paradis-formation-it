# TOME P10 — Intelligence Artificielle, ML & MLOps — Jour 485 (6h) : Systèmes Multi-Agents & Orchestration : Autogen, CrewAI, Rôles Spécialisés, Consensus & Boucle d'Auto-Correction

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre l'architecture des **Systèmes Multi-Agents** et la répartition de tâches par spécialisation de rôles
> - Orchestrer une équipe d'agents autonomes collaboratifs avec **CrewAI** et **AutoGen (Microsoft)**
> - Structurer les mécanismes de **délégation**, de **hiérarchie** et de **consensus multi-agent**
> - Implémenter des boucles d'**auto-correction (Self-Correction / Critique-Refine)** pour valider les artefacts produits
>
> **Compétences visées :** `AI-02` (A) — Multi-Agent Systems & Collaborative AI

---

## Module 1 — Architectures Multi-Agents & Spécialisation de Rôles (2h)

### 📖 Intuition & Narration

Confier une mission informatique complexe (ex: "Audit complet de sécurité et correction du code d'une application") à un unique agent généraliste s'avère souvent inefficace : le prompt devient surchargé et le modèle s'emmêle dans les consignes.

La philosophie des **Systèmes Multi-Agents (Multi-Agent Systems - MAS)** s'inspire du fonctionnement d'une entreprise ou d'une équipe d'ingénieurs : on découpe le problème entre plusieurs agents d'IA dotés de **rôles**, d'**objectifs (Goals)**, d'**expertises (Backstories)** et d'**outils spécifiques**.

Un agent "Auditeur" scrute le code et identifie les failles. Il délègue les correctifs à un agent "Développeur". Enfin, un agent "SecOps Lead" valide le patch final avant déploiement.

### 🔍 Anatomie Technique — Communication Inter-Agents

```
ARCHITECTURE D'ÉQUIPE MULTI-AGENTS (CrewAI / AutoGen)

  [ User Request ] ──► [ AGENT MANAGER / LEAD ]
                             │ (Délégation de tâches)
             ┌───────────────┴───────────────┐
             ▼                               ▼
    [ AGENT AUDITEUR ]              [ AGENT DÉVELOPPEUR ]
    - Role: Cyber Analyst           - Role: Python Expert
    - Goal: Trouver les CVEs        - Goal: Écrire le correctif
    - Tools: Bandit, Nmap           - Tools: Code Interpreter
             │                               │
             └───────────────┬───────────────┘
                             │ (Propositions)
                             ▼
                    [ AGENT CRITIQUE / QA ]
                    - Role: Security Lead
                    - Goal: Valider et corriger
                    │
                    ├── Si ÉCHEC ──► Boucle de correction vers Développeur
                    └── Si VALIDÉ ──► [ Résultat Final Conforme ]
```

---

## Module 2 — Atelier Pratique : Équipe Multi-Agents avec CrewAI (2h)

### 🛠️ Code Python : Équipe de SecOps Multi-Agents avec CrewAI

```python
#!/usr/bin/env python3
"""
PARADIS — Orchestration d'une Équipe SecOps Multi-Agents avec CrewAI
"""

import json

def run_crewai_simulation_demo():
    print("[*] --- DÉMONSTRATION ÉQUIPE MULTI-AGENTS CREWAI PARADIS IT ---")

    # 1. Définition conceptuelle des Rôles des Agents (CrewAI Pattern)
    agents_config = [
        {
            "role": "Analyste SOC Lead",
            "goal": "Analyser les alertes d'intrusion et identifier la cause racine.",
            "backstory": "Expert certifié CISSP avec 15 ans d'expérience en réponse aux incidents.",
            "verbose": True
        },
        {
            "role": "Ingénieur Nftables / Firewall",
            "goal": "Générer les règles de pare-feu précises pour bloquer les IPs attaquantes.",
            "backstory": "Spécialiste Linux Kernel et sécurité réseau bas niveau.",
            "verbose": True
        },
        {
            "role": "Auditeur de Conformité",
            "goal": "Vérifier que les règles générées respectent la politique de sécurité interne.",
            "backstory": "Responsable de la conformité ISO 27001 et RGPD.",
            "verbose": True
        }
    ]

    print("\n[1] Configuration de l'Équipe d'Agents (Crew) :")
    for a in agents_config:
        print(f"  • Agent: {a['role']:30s} | Goal: {a['goal']}")

    # 2. Simulation de la Chaîne d'Exécution et de Délégation
    print("\n[2] Démarrage du Workflow Collaboratif (Sequential Process)...")

    # Étape 1: Analyste SOC
    soc_output = {
        "incident_id": "INC-2026-88',",
        "threat_type": "Brute Force SSH",
        "attacker_ip": "198.51.100.45",
        "target_service": "SSH Port 22"
    }
    print(f"  --> [Agent Analyste SOC] : Incident identifié -> Attaque Brute Force depuis {soc_output['attacker_ip']}")

    # Étape 2: Ingénieur Firewall (Délégation)
    firewall_rule = f"nft add rule inet filter input ip saddr {soc_output['attacker_ip']} drop comment \"Block INC-2026-88\""
    print(f"  --> [Agent Ingénieur Firewall] : Règle générée -> '{firewall_rule}'")

    # Étape 3: Auditeur QA (Critique & Validation)
    compliance_approved = True
    print(f"  --> [Agent Auditeur Conformité] : Validation -> {'✅ APPROUVÉ (Conforme ISO 27001)' if compliance_approved else '❌ REJETÉ'}")

    print("\n--- LIVRABLE FINAL COMPILÉ PAR LA CREW ---")
    final_result = {
        "status": "RESOLVED",
        "action_taken": firewall_rule,
        "sign_off_by": "Auditeur de Conformité"
    }
    print(json.dumps(final_result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    run_crewai_simulation_demo()
```

---

## Module 3 — Consensus Multi-Agents & Boucles d'Auto-Correction (1h30)

### 🔍 Modèles de Consensus & Self-Correction (Critique-Refine)

```
MOTIFS D'ORCHESTRATION AVANCÉS

  1. PROCESSUS SÉQUENTIEL (Sequential Process) :
     - Agent A ──► Agent B ──► Agent C (Chaîne de transmission classique).

  2. PROCESSUS HIERARCHIQUE (Hierarchical Process) :
     - Un Agent Manager (LLM) reçoit le projet, crée les sous-tâches dynamiquement, les attribue aux agents ouvriers et vérifie le travail produit.

  3. BOUCLE DE CRITIQUE-REFINE (Self-Correction Loop) :
     - Agent Générateur ──► Produit le livrable.
     - Agent Evaluateur ──► Scrutine le livrable et émet des "Critiques".
     - Si le score < 0.90 ──► Renvoyer la critique à l'Agent Générateur qui affine la solution.
     - Prévient les erreurs de syntaxe, les failles et les hallucinations.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MAS** | Multi-Agent Systems — Système composé de plusieurs agents IA autonomes interagissant |
| **CrewAI** | Framework open-source d'orchestration d'équipes d'agents spécialisés par rôles |
| **AutoGen** | Cadre de développement Microsoft pour la création d'agents conversationnels multi-acteurs |
| **Backstory** | Contexte d'expertise et de personnalité fourni dans le prompt d'un agent |
| **Self-Correction** | Boucle itérative où un agent révise son propre travail en fonction des critiques d'un second agent |

---

## Exercices Pratiques

### Exercice 1 — Conception d'une Architecture Multi-Agents pour DevSecOps

Vous devez concevoir une architecture multi-agents pour automatiser la revue de code Pull Request (PR).
1. Définissez 3 rôles d'agents spécialisés avec leurs objectifs respectifs.
2. Décrivez le flux de travail avec une boucle d'auto-correction en cas de détection de faille de sécurité.

**Corrigé guidé :**
1. **Rôles des Agents** :
   - **Agent Code Reviewer** : Analyser la qualité du code Python/Go et la propreté de la PR.
   - **Agent Security Scanner** : Chercher les vulnérabilités de sécurité (Injection SQL, XSS, Clés API en dur).
   - **Agent QA & Release Manager** : Décider de la fusion (Merge/Reject) de la PR.
2. **Workflow avec Auto-Correction** :
   - La PR est soumise au *Code Reviewer* puis au *Security Scanner*.
   - Si le *Security Scanner* trouve une clé API en dur, il **refuse la validation** et transmet le rapport d'erreur à un *Agent Developer Assistant*.
   - L' *Agent Developer Assistant* génère un commit de correctif et ré-invoque le *Security Scanner*.
   - Une fois la sécurité à $100\%$ validée, l' *Agent QA* approuve la fusion de la PR.

---

## Banque QCM — 5 Questions

**Q1.** Quel est l'avantage principal de découper un problème complexe entre plusieurs **Agents Spécialisés (Multi-Agents)** plutôt que d'utiliser un seul gros prompt ?

- A) Cela réduit la facture d'électricité.
- B) Cela permet de spécialiser chaque agent avec un rôle, un contexte et des outils restreints, réduisant la charge cognitive du prompt et améliorant la précision globale. ✅
- C) Les ordinateurs n'aiment pas les longs prompts.
- D) Cela supprime le besoin de LLM.

**Q2.** Dans le framework **CrewAI**, qu'est-ce que la **Backstory** d'un agent ?

- A) L'historique des requêtes HTTP passées.
- B) Le prompt de contexte décrivant la personnalité, l'expérience et le niveau d'expertise de l'agent pour guider son comportement. ✅
- C) La liste des fichiers supprimés.
- D) La version du système d'exploitation.

**Q3.** En quoi consiste un **Processus Hiérarchique (Hierarchical Process)** dans l'orchestration multi-agents ?

- A) À exécuter tous les agents en même temps sans ordre.
- B) Un Agent Manager (Manager LLM) attribue dynamiquement les tâches aux agents ouvriers et valide la qualité de leurs livrables avant de conclure la mission. ✅
- C) À trier les fichiers par ordre alphabétique.
- D) À interdire l'utilisation d'APIs.

**Q4.** Comment la boucle de **Self-Correction (Critique-Refine)** améliore-t-elle la fiabilité des artefacts produits par les agents ?

- A) En réinitialisant le GPU.
- B) En soumettant le travail produit par un agent générateur à un agent critique qui émet des remarques, forçant l'agent générateur à corriger ses erreurs avant la livraison finale. ✅
- C) En convertissant les fichiers texte en PDF.
- D) En supprimant les commentaires du code.

**Q5.** Quel framework développé par Microsoft est spécialisé dans la création de conversations multi-agents personnalisables et d'agents de code ?

- A) AutoGen ✅
- B) React.js
- C) Kubernetes
- D) Ansible

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
