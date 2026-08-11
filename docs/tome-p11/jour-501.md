# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 501 (6h) : DevSecOps Fondamentaux & Security in CI/CD : Shift-Left, SAST, DAST, SCA & Security Gates Automatisées

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre le paradigme **Shift-Left Security** et la transition de DevOps à DevSecOps
> - Différencier et orchestrer les piliers d'analyse : **SAST** (Code statique), **SCA** (Composants tiers) et **DAST** (Comportement dynamique)
> - Implémenter des **Security Gates** automatisées et bloquantes dans un pipeline CI/CD GitHub Actions / GitLab CI
> - Définir la politique d'acceptabilité des vulnérabilités (Severity threshold, SLA de remédiation, exceptions signées)
>
> **Compétences visées :** `SEC-05` (A), `INF-02` (A) — DevSecOps Pipeline & Security Gates

---

## Module 1 — Principes du DevSecOps & Paradigme Shift-Left (2h)

### 📖 Intuition & Narration

Pendant des décennies, la sécurité informatique a fonctionné comme un péage à la toute fin de l'autoroute de livraison logicielle. L'équipe de développement écrivait du code pendant 6 mois, l'équipe Ops le déployait en pré-production, et l'équipe SSI (Sécurité) effectuait un audit de sécurité ou un test d'intrusion quelques jours avant le lancement commercial ("Go-Live").

Cette approche présentait deux faiblesses majeures :
1. **Coût de correction astronomique** : Corriger une faille de conception en pré-production coûte jusqu'à 30 à 100 fois plus cher que de la corriger lors de la frappe du code par le développeur dans son IDE.
2. **Friction et blocages** : L'équipe de sécurité était perçue comme un frein ("Department of NO"), bloquant les déploiements stratégiques la veille du lancement.

Le **DevSecOps** réintroduit la sécurité comme une responsabilité partagée, intégrée en continu dans le cycle de vie de développement logiciel (SDLC). La sécurité s'invite **à gauche** (Shift-Left) : dès la rédaction des spécifications, la validation du code source et l'intégration continue.

### 🔍 Anatomie Technique — Le Pipeline DevSecOps & ses 4 Piliers

```
CYCLE DE VIE DEVSECOPS (SHIFT-LEFT SECURITY)

   [ CODAGE ] ──► [ COMMIT / PR ] ──► [ BUILD & TEST ] ──► [ DÉPLOIEMENT ] ──► [ RUN & MONITOR ]
       │                │                   │                   │                   │
       ▼                ▼                   ▼                   ▼                   ▼
  IDE Linters      SAST (Semgrep)      SCA (Trivy)         DAST (OWASP ZAP)    RASP / Falco
  Pre-commit key   Secret Scanning     Container Scan      IaC Hardening       WAF & Cloud SIEM
  check            (Gitleaks)          SBOM CycloneDX      Compliance Gate     CSPM Monitoring
```

### 🔍 Comparatif des Techniques d'Analyse Sécurité

| Dimension | SAST (Static Analysis) | SCA (Supply Chain Analysis) | DAST (Dynamic Analysis) |
|:---|:---|:---|:---|
| **Cible** | Code source propriétaire | Dépendances & packages tiers | Application compilée en exécution |
| **Moment** | Phase de commit / PR | Phase de build / packaging | Phase de Staging / Pré-prod |
| **Accès Code** | White-Box (accès complet au code) | White-Box (analyse manifeste `pom.xml`, `requirements.txt`) | Black-Box (aucune connaissance du code) |
| **Forces** | Détecte les erreurs de logique, injections, mauvaises pratiques précoces | Détecte les CVE connues dans les bibliothèques open-source | Détecte les failles de configuration serveur, en-têtes HTTP, authentification |
| **Limites** | Faux positifs fréquents, ne voit pas l'environnement exécuté | Ne voit pas si la fonction vulnérable du package est réellement appelée | Faux négatifs si la couverture des requêtes DAST est incomplète |

---

## Module 2 — Atelier Pratique : Pipeline CI/CD Sécurisé avec Security Gate (2h)

### 🛠️ Code Python : Security Gate Evaluator Automatisé

```python
#!/usr/bin/env python3
"""
PARADIS — Security Gate Evaluator pour Pipeline CI/CD DevSecOps
Parse les résultats SAST, SCA et Secret Scanning et applique la politique d'arrêt du build (Build Break).
"""

import json
import sys
from dataclasses import dataclass, field
from typing import List, Dict

@dataclass
class Vulnerability:
    source: str      # "SAST", "SCA", "SECRETS"
    id: str          # CVE ID ou Rule ID
    severity: str    # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    description: str
    file_location: str

@dataclass
class SecurityPolicy:
    max_critical: int = 0      # Zéro tolérance pour CRITICAL
    max_high: int = 2          # Maximum 2 HIGH autorisées avec dérogation
    max_secrets: int = 0       # Zéro secret ou clé API fugué

class SecurityGateEvaluator:
    def __init__(self, policy: SecurityPolicy):
        self.policy = policy
        self.vulnerabilities: List[Vulnerability] = []

    def load_mock_scan_results(self):
        """Simule la collecte des rapports Semgrep (SAST), Trivy (SCA) et Gitleaks (Secrets)."""
        self.vulnerabilities = [
            Vulnerability("SAST", "python.lang.security.audit.eval-detected", "HIGH", "Utilisation dangereuse de eval()", "src/auth.py:42"),
            Vulnerability("SCA", "CVE-2024-3094", "CRITICAL", "Backdoor dans la bibliothèque liblzma/xz", "requirements.txt:xz==5.6.0"),
            Vulnerability("SECRETS", "GITLEAKS-AWS-KEY", "CRITICAL", "Clé d'accès AWS détectée en clair", "config/settings.py:12"),
            Vulnerability("SAST", "python.lang.security.insecure-hash", "MEDIUM", "Utilisation de MD5 pour le hachage", "src/utils.py:88")
        ]

    def evaluate(self) -> bool:
        print("=== EVALUATION DE LA SECURITY GATE DEVSECOPS PARADIS IT ===")
        critical_count = sum(1 for v in self.vulnerabilities if v.severity == "CRITICAL")
        high_count = sum(1 for v in self.vulnerabilities if v.severity == "HIGH")
        secrets_count = sum(1 for v in self.vulnerabilities if v.source == "SECRETS")

        print(f"[*] Total vulnérabilités détectées : {len(self.vulnerabilities)}")
        print(f"    - CRITICAL : {critical_count} (Max autorisé : {self.policy.max_critical})")
        print(f"    - HIGH     : {high_count} (Max autorisé : {self.policy.max_high})")
        print(f"    - SECRETS  : {secrets_count} (Max autorisé : {self.policy.max_secrets})")

        failed = False
        if critical_count > self.policy.max_critical:
            print("[🚨 VIOLATION] Nombre de vulnérabilités CRITICAL supérieur au seuil !")
            failed = True

        if secrets_count > self.policy.max_secrets:
            print("[🚨 VIOLATION] Secrets détectés dans le dépôt Git !")
            failed = True

        if high_count > self.policy.max_high:
            print("[🚨 VIOLATION] Nombre de vulnérabilités HIGH supérieur au seuil !")
            failed = True

        print("\n--- DÉTAIL DES FAILLES BLOQUANTES ---")
        for v in self.vulnerabilities:
            if v.severity in ("CRITICAL", "HIGH") or v.source == "SECRETS":
                print(f"  ❌ [{v.source}] [{v.severity}] {v.id} dans {v.file_location} : {v.description}")

        if failed:
            print("\n[⛔ RESULTAT] BUILD REJETÉ PAR LA SECURITY GATE — Déploiement Interdit.")
            return False
        else:
            print("\n[✅ RESULTAT] SECURITY GATE PASSED — Pipeline autorisée à continuer.")
            return True

if __name__ == "__main__":
    policy = SecurityPolicy()
    evaluator = SecurityGateEvaluator(policy)
    evaluator.load_mock_scan_results()
    success = evaluator.evaluate()
    if not success:
        sys.exit(1)
```

---

## Module 3 — Governance, SLAs de Remédiation & Exceptions (1h30)

### 🔍 Politique de Remédiation & Gestion des Exceptions

Une Security Gate sans politique formelle de remédiation conduit soit à des blocages permanents non résolus, soit à des contournements anarchiques. Une gouvernance DevSecOps mature définit :

1. **Service Level Agreements (SLAs) de Remédiation** :
   - **CRITICAL** : Correction sous 24 heures (Correctif d'urgence / Hotfix).
   - **HIGH** : Correction sous 7 jours.
   - **MEDIUM** : Correction sous 30 jours (Prochain sprint).
   - **LOW** : Correction sous 90 jours ou enregistrement au backlog.

2. **Processus d'Exception (Dérogation Signée)** :
   Si une vulnérabilité ne peut pas être corrigée immédiatement sans casser la production, une dérogation temporaire (max 14 jours) peut être accordée uniquement si :
   - Un **contrôle compensatoire** est mis en place (ex: règle WAF bloquante).
   - La dérogation est formellement approuvée par le RSSI (CISO) et le Lead Architect.
   - L'exception est tracée dans le fichier `.semgrepignore` ou `.trivyignore` avec un ticket Jira associé et une date d'expiration automatisée.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SAST** | Static Application Security Testing — Analyse de sécurité du code source statique |
| **DAST** | Dynamic Application Security Testing — Analyse de sécurité dynamique sur l'application en cours d'exécution |
| **SCA** | Software Composition Analysis — Analyse de la chaîne d'approvisionnement logicielle et dépendances |
| **SDLC** | Software Development Life Cycle — Cycle de vie du développement logiciel |
| **RASP** | Runtime Application Self-Protection — Protection applicative intégrée au moteur d'exécution |

---

## Exercices Pratiques

### Exercice 1 — Calcul du Coût Relatif de Correction d'une Faille

Une faille d'injection SQL critique est détectée par Semgrep lors de la phase de codage IDE (Shift-Left). Sa correction prend 15 minutes à un développeur (coût estimé : 25 €).
Si cette même faille n'est découverte qu'en production lors d'un pentest post-déploiement, le processus nécessite :
- Investigation de sécurité et réunion de crise : 4 heures (400 €)
- Rdaction du patch, tests de non-régression et redéploiement d'urgence : 12 heures (1 200 €)
- Notification réglementaire RGPD et communication de crise : 3 000 €

1. Calculez le coût total de correction en production.
2. Calculez le facteur d'économie réalisé grâce à la détection précoce DevSecOps (Shift-Left).

**Corrigé guidé :**
1. **Coût en production :**
$$\text{Coût Prod} = 400 + 1\,200 + 3\,000 = \mathbf{4\,600 \text{ €}}$$

2. **Facteur d'économie Shift-Left :**
$$\text{Facteur} = \frac{4\,600}{25} = \mathbf{184\times}$$
La détection précoce via SAST/Shift-Left a permis de réduire le coût de traitement de la faille d'un facteur **184**.

---

## Banque QCM — 5 Questions

**Q1.** Que signifie le concept de **Shift-Left Security** dans un contexte DevSecOps ?

- A) Déplacer tous les serveurs de production sur le côté gauche du data center.
- B) Intégrer les contrôles de sécurité le plus tôt possible dans le cycle de développement (dès la phase de codage et de CI), plutôt qu'à la toute fin avant la production. ✅
- C) Remplacer les ingénieurs sécurité par des développeurs Python.
- D) Supprimer les pare-feux réseau.

**Q2.** Quelle est la caractéristique principale d'une analyse **SAST (Static Application Security Testing)** ?

- A) Elle nécessite que l'application soit déployée sur un serveur Web actif.
- B) Elle analyse le code source brut de manière White-Box sans exécuter le programme. ✅
- C) Elle scanne uniquement les images Docker.
- D) Elle effectue des attaques par déni de service (DDoS).

**Q3.** Quel est le rôle principal d'un outil **SCA (Software Composition Analysis)** comme Trivy ou Dependency-Check ?

- A) Vérifier la syntaxe du code HTML.
- B) Détecter les vulnérabilités connues (CVE) au sein des dépendances et bibliothèques open-source tierces importées par l'application. ✅
- C) Générer des mots de passe aléatoires.
- D) Accélérer la vitesse de compilation C++.

**Q4.** Pourquoi une **Security Gate** en CI/CD doit-elle être automatisée et bloquante (Build Break) ?

- A) Pour empêcher le déploiement automatique d'un artefact contenant des vulnérabilités non autorisées dépassant le seuil de sévérité défini par la politique de sécurité. ✅
- B) Pour effacer automatiquement le code source en cas d'erreur.
- C) Pour réduire le salaire des développeurs.
- D) Pour économiser de l'espace disque sur GitHub.

**Q5.** Dans une politique de gouvernance DevSecOps mature, quel est le SLA de remédiation typique recommandé pour une vulnérabilité de sévérité **CRITICAL** ?

- A) 6 mois.
- B) 24 heures (correctif d'urgence / Hotfix). ✅
- C) 1 an.
- D) Jamais.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
