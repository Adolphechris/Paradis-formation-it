# TOME P0 — Socle Universel — Jour 40 (6h) : Projet Synthétique Semestre 1 (Partie 4) — Audit de Sécurité CIS & Automatisation de Remédiation

> [!NOTE]
> **Objectif du jour :** Consolider l'ensemble des compétences acquises pendant le Semestre 1 (Linux CLI, Scripting Bash, Python, SQL, Git et Sécurité) en concevant et déployant un **Framework d'Audit de Sécurité Automatisé** basé sur les CIS Benchmarks pour l'environnement Linux de la Banque Centrale du Congo (BCC).
>
> **Compétences visées :** `SEC-01` (A) | `SEC-03` (A) | `BIT-05` (A) | `PRO-01` (A) — Audit et remédiation de sécurité système

---

## 1) Module — Spécification & Architecture du Framework d'Audit (2h)

### 📖 Narration/Intuition

Dans une institution financière comme la BCC, les audits de sécurité ne peuvent pas reposer sur des vérifications manuelles occasionnelles. Il faut des scripts d'audit automatisés capables d'évaluer la conformité de dizaines de serveurs en quelques minutes, de détecter les dérives (configuration drift), de générer des rapports structurés et de proposer des scripts de remédiation sûrs.

Ce projet intégrateur simule la mission d'un ingénieur DevSecOps/Audit Système au sein du SOC de la BCC.

### 🔍 Anatomie Technique

```
┌────────────────────────────────────────────────────────┐
│             FRAMEWORK D'AUDIT SÉCURITÉ BCC             │
└───────────────────────────┬────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ MODULE SSH   │    │ MODULE COMPTES│   │MODULE PERMS  │
│ (CIS 5.2)    │    │ (CIS 5.3/6.2)│   │ (CIS 6.1)    │
└───────┬──────┘    └───────┬──────┘    └───────┬──────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                ┌──────────────────────┐
                │ MOTEUR D'AUDIT PYTHON │
                │ (Analyse & Scoring)  │
                └───────────┬──────────┘
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
┌──────────────┐                        ┌──────────────┐
│ RAPPORT JSON │                        │ SCRIPT DE    │
│  & SCORE (%) │                        │ REMÉDIATION  │
└──────────────┘                        └──────────────┘
```

---

## 2) Module — Implémentation du Moteur d'Audit Python (2h)

### 🛠️ Atelier Pratique — Code du Moteur d'Audit

Création de `/opt/bcc-audit/audit_engine.py` :

```python
#!/usr/bin/env python3
"""
Framework d'Audit de Sécurité CIS — Banque Centrale du Congo
Version : 1.0.0
Auteur : Équipe Cybersécurité BCC
"""
import os
import sys
import json
import subprocess
import platform
from datetime import datetime

class AuditEngine:
    def __init__(self):
        self.results = []
        self.score_total = 0
        self.score_max = 0

    def add_check(self, check_id, category, description, status, weight=10, remediation=None):
        self.score_max += weight
        if status == "PASS":
            self.score_total += weight
        
        self.results.append({
            "id": check_id,
            "category": category,
            "description": description,
            "status": status,  # PASS, FAIL, WARNING
            "weight": weight,
            "remediation": remediation
        })

    def audit_ssh(self):
        config_path = "/etc/ssh/sshd_config"
        if not os.path.exists(config_path):
            self.add_check("CIS-5.2.1", "SSH", "Présence service SSH", "FAIL", 20, "apt install openssh-server")
            return

        with open(config_path, "r") as f:
            content = f.read()

        # Check Root Login
        if "PermitRootLogin no" in content:
            self.add_check("CIS-5.2.2", "SSH", "Désactivation connexion Root SSH", "PASS", 15)
        else:
            self.add_check("CIS-5.2.2", "SSH", "Désactivation connexion Root SSH", "FAIL", 15, "sed -i 's/PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config")

        # Check Auth Password
        if "PasswordAuthentication no" in content:
            self.add_check("CIS-5.2.3", "SSH", "Authentification par clé SSH uniquement", "PASS", 15)
        else:
            self.add_check("CIS-5.2.3", "SSH", "Authentification par clé SSH uniquement", "FAIL", 15, "sed -i 's/PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config")

    def audit_filesystems(self):
        # Perms /etc/shadow
        shadow_stat = os.stat("/etc/shadow")
        mode = oct(shadow_stat.st_mode)[-3:]
        if mode in ["640", "600", "000"]:
            self.add_check("CIS-6.1.2", "Permissions", "Permissions restreintes sur /etc/shadow", "PASS", 10)
        else:
            self.add_check("CIS-6.1.2", "Permissions", "Permissions restreintes sur /etc/shadow", "FAIL", 10, "chmod 640 /etc/shadow")

    def run_all(self):
        self.audit_ssh()
        self.audit_filesystems()
        
        conformity = round((self.score_total / self.score_max) * 100, 2) if self.score_max > 0 else 0
        
        report = {
            "metadata": {
                "organization": "Banque Centrale du Congo",
                "hostname": platform.node(),
                "timestamp": datetime.now().isoformat(),
                "conformity_score": f"{conformity}%"
            },
            "summary": {
                "score_total": self.score_total,
                "score_max": self.score_max,
                "checks_passed": sum(1 for r in self.results if r['status'] == 'PASS'),
                "checks_failed": sum(1 for r in self.results if r['status'] == 'FAIL')
            },
            "checks": self.results
        }
        return report

if __name__ == "__main__":
    engine = AuditEngine()
    report = engine.run_all()
    print(json.dumps(report, indent=2, ensure_ascii=False))
```

---

## 3) Module — Génération du Script de Remédiation & Restitution (2h)

### 🛠️ Atelier Pratique — Automation Shell de Remédiation

Ce script lit le rapport JSON de l'AuditEngine et génère automatiquement un script Bash de remédiation :

```bash
#!/bin/bash
# Script de remédiation automatique dérivé de l'audit
# Usage : python3 audit_engine.py > report.json && bash generate_remediation.sh report.json

REPORT_FILE="${1:-report.json}"

if [ ! -f "$REPORT_FILE" ]; then
    echo "Erreur : fichier de rapport introuvable."
    exit 1
fi

echo "#!/bin/bash" > fix_system.sh
echo "# Script d'auto-remédiation généré le $(date)" >> fix_system.sh
echo "set -e" >> fix_system.sh

jq -r '.checks[] | select(.status=="FAIL") | .remediation' "$REPORT_FILE" >> fix_system.sh

chmod +x fix_system.sh
echo "[+] Script 'fix_system.sh' généré avec succès !"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CIS** | Center for Internet Security |
| **SOC** | Security Operations Center |
| **JSON** | JavaScript Object Notation |
| **JQ** | JSON Query — processeur JSON en ligne de commande |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Ajoutez au moteur d'audit la vérification de l'activation du pare-feu `ufw`.
**Corrigé :**
```python
def audit_firewall(self):
    r = subprocess.run(["ufw", "status"], capture_output=True, text=True)
    if "Status: active" in r.stdout:
        self.add_check("CIS-3.5.1", "Firewall", "Pare-feu UFW actif", "PASS", 15)
    else:
        self.add_check("CIS-3.5.1", "Firewall", "Pare-feu UFW actif", "FAIL", 15, "ufw --force enable")
```

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** À quoi sert l'indicateur de conformité global (Conformity Score) dans un rapport d'audit ?
- A) À mesurer objectivement l'alignement du système sur les standards de sécurité
- B) À remplacer les pare-feux
- C) À désactiver les comptes utilisateurs
- D) À accélérer les performances processeur

**Réponse : A**

**Q2 :** Pourquoi la remédiation automatique doit-elle être précédée d'une validation d'impact ?
- A) Pour éviter d'interrompre des services critiques en production
- B) Parce que Linux ne supporte pas Bash
- C) Pour économiser de la bande passante
- D) C'est inutile, la remédiation est toujours sans risque

**Réponse : A**

**Q3 :** Que fait la commande `jq -r '.checks[] | select(.status=="FAIL") | .remediation'` ?
- A) Elle filtre les requêtes SQL
- B) Elle extrait uniquement les commandes de remédiation des contrôles en échec du fichier JSON
- C) Elle supprime le fichier JSON
- D) Elle redémarre le serveur

**Réponse : B**

**Q4 :** Dans un cadre bancaire (BCC), quelle est la fréquence idéale des audits de conformité automatisés ?
- A) Une fois tous les 5 ans
- B) En continu / Quotidienne
- C) Jamais
- D) Seulement lors des pannes

**Réponse : B**

**Q5 :** Quel module Python est utilisé pour convertir les structures de données en format lisible et échangeable ?
- A) `json`
- B) `math`
- C) `random`
- D) `turtle`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
