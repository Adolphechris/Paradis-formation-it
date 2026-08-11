# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 503 (6h) : Analyse Dynamique de Sécurité (DAST) : OWASP ZAP, Nuclei & Scanning API Dynamique en Pipeline

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre le fonctionnement de l'analyse dynamique **DAST** (Black-Box Testing) sur des applications Web et APIs en cours d'exécution
> - Automatiser des scans d'applications Web avec **OWASP ZAP** (Zed Attack Proxy) et **Nuclei** (Templates de vulnérabilités)
> - Effectuer le scanning dynamique d'APIs REST / OpenAPI (Swagger) dans un environnement de staging
> - Intégrer DAST dans un pipeline CI/CD sans impacter les temps de build (Scans asynchrones & Nightly Scans)
>
> **Compétences visées :** `SEC-05` (A) — DAST & Dynamic Vulnerability Scanning

---

## Module 1 — Principes du DAST & Comparaison avec le SAST (2h)

### 📖 Intuition & Narration

Si le SAST est comme l'examen d'un plan d'architecte pour trouver des erreurs de dessin, le **DAST (Dynamic Application Security Testing)** est comme tester la résistance de la porte d'entrée en essayant physiquement de la crocheter une fois la maison construite.

Le DAST agit de manière **Black-Box** : il n'a aucune connaissance du code source. Il interagit avec l'application via HTTP/HTTPS, envoie des requêtes malicieuses spécialement formulées (injections SQL, XSS, traversées de répertoires), et analyse la réponse HTTP du serveur pour déterminer si l'attaque a fonctionné.

### 🔍 Anatomie Technique — Fases d'un Scan DAST

```
PHASES D'UN SCAN DAST (OWASP ZAP / NUCLEI)

  1. SPIDER / CRAWLING (Exploration) :
     Découverte de l'arborescence du site web, formulaires, endpoints d'API.

  2. API IMPORT (Optionnel pour REST) :
     Chargement de la spécification OpenAPI / Swagger (swagger.json) pour cibler toutes les routes.

  3. ACTIVE SCANNING (Attaque) :
     Fuzzing des paramètres HTTP (GET, POST, Headers, Cookies) avec des payloads d'attaque.

  4. RESPONSE ANALYSIS (Vérification) :
     Analyse du code HTTP (200 vs 500), du temps de réponse et du contenu pour confirmer la faille.
```

---

## Module 2 — Atelier Pratique : Automates DAST avec Nuclei (2h)

### 🛠️ Code Python : Automation de Scan Nuclei & Parsing JSON

```python
#!/usr/bin/env python3
"""
PARADIS — Automate DAST Nuclei avec Parsing de Rapports & Quality Gate
Simule l'exécution de Nuclei sur un environnement de Staging.
"""

import json
import sys
from dataclasses import dataclass
from typing import List

@dataclass
class NucleiFinding:
    template_id: str
    name: str
    severity: str    # "critical", "high", "medium", "low", "info"
    matched_at: str
    description: str

class NucleiDASTRunner:
    def __init__(self, target_url: str):
        self.target_url = target_url
        self.findings: List[NucleiFinding] = []

    def simulate_scan(self):
        """Simule l'exécution de Nuclei sur le serveur cible."""
        print(f"=== DÉMARRAGE DU SCAN DAST NUCLEI ===")
        print(f"[*] Cible : {self.target_url}")
        print("[*] Chargement des templates de sécurité (CVEs, Exposures, Misconfigurations)...")

        # Rapport simulé Nuclei JSON
        self.findings = [
            NucleiFinding(
                template_id="cors-misconfiguration",
                name="CORS Wildcard Origin Detected",
                severity="medium",
                matched_at=f"{self.target_url}/api/v1/user",
                description="L'en-tête Access-Control-Allow-Origin contient '*'"
            ),
            NucleiFinding(
                template_id="sqli-error-based",
                name="SQL Injection Error-Based",
                severity="critical",
                matched_at=f"{self.target_url}/api/v1/products?id=1'",
                description="Erreur SQL retournée dans le corps HTTP : Syntax error in SQL statement"
            ),
            NucleiFinding(
                template_id="missing-security-headers",
                name="Missing Strict-Transport-Security Header",
                severity="low",
                matched_at=self.target_url,
                description="L'en-tête HSTS n'est pas présent dans la réponse HTTP"
            )
        ]

    def evaluate_gate(self) -> bool:
        print("\n--- RÉSULTATS DU SCAN DAST ---")
        critical_high = [f for f in self.findings if f.severity in ("critical", "high")]

        for f in self.findings:
            icon = "🚨" if f.severity in ("critical", "high") else "⚠️"
            print(f"  {icon} [{f.severity.upper()}] {f.name} ({f.template_id})")
            print(f"     URL Cible : {f.matched_at}")
            print(f"     Détails   : {f.description}")

        if critical_high:
            print(f"\n[⛔ DAST QUALITY GATE] ÉCHEC — {len(critical_high)} faille(s) CRITICAL/HIGH détectée(s) !")
            return False
        else:
            print("\n[✅ DAST QUALITY GATE] SUCCÈS — Aucune faille critique détectée.")
            return True

if __name__ == "__main__":
    runner = NucleiDASTRunner("https://staging.paradis-finance.fr")
    runner.simulate_scan()
    success = runner.evaluate_gate()
    if not success:
        sys.exit(1)
```

---

## Module 3 — Intégration DAST Asynchrone & Stratégie CI/CD (1h30)

### 🔍 Stratégies d'Intégration DAST sans Ralentir le Pipeline

Un scan DAST complet peut durer de 30 minutes à plusieurs heures. Bloquer chaque Pull Request pendant un scan DAST est inacceptable pour l'expérience développeur.

```
STRATÉGIE DEVSECOPS POUR LE DAST

  ┌─────────────────────────────────────────────────────────────────────────┐
  │ TYPE DE SCAN   │ DÉCLENCHEUR             │ SCOPE DE TEST                │
  ├────────────────┼─────────────────────────┼──────────────────────────────┤
  │ Baseline Scan  │ Pull Request / Commit   │ Fast Scan (5 min, Top 10 OWASP)│
  │ Full DAST Scan │ Nightly (Chaque nuit)   │ Crawling complet + Fuzzing   │
  │ API DAST Scan  │ Post-Deployment Staging │ Scan OpenAPI / Swagger REST  │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DAST** | Dynamic Application Security Testing — Test de sécurité applicatif dynamique |
| **ZAP** | Zed Attack Proxy — Outil d'analyse DAST open-source développé par l'OWASP |
| **OpenAPI** | Spécification standard de description des APIs REST (anciennement Swagger) |
| **HSTS** | HTTP Strict Transport Security — En-tête HTTP forçant l'utilisation de HTTPS |
| **Fuzzing** | Technique d'injection massive de données aléatoires ou malicieuses pour trouver des failles |

---

## Exercices Pratiques

### Exercice 1 — Configuration d'un Scan API Nuclei

Écrivez la commande CLI Nuclei pour scanner une API REST en utilisant la spécification OpenAPI disponible à l'URL `https://api.paradis.fr/swagger.json` avec uniquement les templates de sévérité `critical` et `high`.

**Corrigé guidé :**
```bash
nuclei -list https://api.paradis.fr/swagger.json \
       -severity critical,high \
       -json-export report_dast.json
```

---

## Banque QCM — 5 Questions

**Q1.** Quelle est la principale différence entre **SAST** et **DAST** ?

- A) SAST analyse le code source sans l'exécuter, tandis que DAST teste l'application en cours d'exécution de manière Black-Box. ✅
- B) SAST est plus rapide que le Wi-Fi.
- C) DAST s'exécute uniquement sur Windows.
- D) Il n'y a aucune différence.

**Q2.** Quel outil open-source très populaire développé par l'OWASP est utilisé pour l'analyse DAST ?

- A) OWASP ZAP (Zed Attack Proxy). ✅
- B) Photoshop.
- C) Git.
- D) Docker.

**Q3.** Pourquoi recommande-t-on d'exécuter les scans DAST complets de nuit (**Nightly Scans**) plutôt qu'à chaque Pull Request ?

- A) Parce que les serveurs dorment la nuit.
- B) Parce que les scans DAST complets sont longs (plusieurs dizaines de minutes) et ralentiraient inutilement le pipeline de livraison des développeurs. ✅
- C) Parce que les pirates ne travaillent que le jour.
- D) Pour économiser de l'électricité.

**Q4.** Comment DAST parvient-il à tester efficacement une API REST sans interface graphique ?

- A) En devinant les requêtes au hasard.
- B) En important la spécification OpenAPI / Swagger (`swagger.json`) décrivant toutes les routes et paramètres de l'API. ✅
- C) En utilisant la caméra du serveur.
- D) En envoyant des SMS.

**Q5.** Dans l'outil Nuclei, que sont les **Templates** ?

- A) Des modèles de documents PDF.
- B) Des fichiers YAML décrivant précisément les motifs de requêtes et de réponses pour détecter des vulnérabilités spécifiques. ✅
- C) Des thèmes de couleurs pour le terminal.
- D) Des images Docker.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
