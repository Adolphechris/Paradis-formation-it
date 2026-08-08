# TOME P7 — Certifications d'Élite & Spécialisations — Jour 330 (6h) : Projet Intégrateur S7 Partie 6 — CIPP/E DPIA + BSCP Web Labs (Audits Privacy & Exploitation Web Avancée)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre une double évaluation pratique combinant l'audit de conformité réglementaire **CIPP/E (Privacy Audit & DPIA)** et la résolution de labs d'exploitation Web avancés **BSCP (Web Cache Poisoning, SSRF & SAST)** : conduire une DPIA complète sur une plateforme d'Open Banking moderne, identifier les failles web critiques du code source et fournir les remédiations techniques et légales.
>
> **Ce projet intègre les compétences de protection des données (GDPR Compliance) et d'ingénierie offensive web (BSCP Practitioner).**

---

## 1) Module — Laboratoire d'Exploitation Web & Privacy Audit (`bscp_privacy_capstone.py`) (2h30)

### 🛠️ Script d'Audit Technique et de Validation de Sécurité

```python
import json
import re

class OpenBankingAuditCapstone:
    """
    Projet Intégrateur S7 Partie 6 :
    1. Scan SAST de code source Python / Flask (Détection SSRF / SQLi)
    2. Verification de la conformité RGPD (Minimisation & Privacy by Design)
    """

    def __init__(self, source_code_snippet: str):
        self.code = source_code_snippet

    def audit_security_vulnerabilities() -> list:
        """Détecte les vulnérabilités OWASP / BSCP dans le code source."""
        findings = []

        # 1. Détection de SSRF potentiel (fetch d'URL utilisateur sans validation)
        if re.search(r"requests\.get\(request\.args\.get\(", self.code):
            findings.append({
                "type": "SECURITY",
                "severity": "CRITICAL",
                "cwe": "CWE-918 (SSRF)",
                "description": "L'application effectue des requêtes HTTP sortantes basées sur des entrées utilisateur non assainies.",
                "remediation": "Implémenter une Whitelist stricte de domaines et bloquer l'accès aux plages d'IP internes (169.254.169.254, 127.0.0.1)."
            })

        # 2. Détection d'Injection SQL via f-strings
        if re.search(r"execute\(f[\"'].*SELECT.*\{", self.code):
            findings.append({
                "type": "SECURITY",
                "severity": "CRITICAL",
                "cwe": "CWE-89 (SQLi)",
                "description": "Requête SQL construite via interpolation directe de variables (f-string).",
                "remediation": "Utiliser des requêtes préparées avec paramètres nommés ou un ORM (SQLAlchemy)."
            })

        return findings

    def audit_gdpr_compliance(self) -> list:
        """Détecte les manquements aux règles CIPP/E & RGPD (Art. 5, 25, 32)."""
        gdpr_issues = []

        # 1. Absence de hachage / Chiffrement des mots de passe ou tokens
        if "password" in self.code and not any(kw in self.code for kw in ["werkzeug.security", "bcrypt", "argon2"]):
            gdpr_issues.append({
                "type": "PRIVACY",
                "article": "Art. 32 (Sécurité des Traitements)",
                "severity": "HIGH",
                "issue": "Stockage ou traitement des mots de passe en clair détecté.",
                "requirement": "Obligation d'utiliser un hachage robuste avec sel (Argon2id ou Bcrypt)."
            })

        # 2. Absence de minimisation des données dans les logs (Logging de DCP)
        if re.search(r"logging\.(info|debug|error)\(.*(email|phone|credit_card|iban)", self.code, re.IGNORECASE):
            gdpr_issues.append({
                "type": "PRIVACY",
                "article": "Art. 5(1)(c) (Minimisation des Données)",
                "severity": "MEDIUM",
                "issue": "Journalisation (logging) directe de Données à Caractère Personnel (DCP).",
                "requirement": "Appliquer un masquage/anonymisation avant écriture dans les logs."
            })

        return gdpr_issues

# Code source audité
vulnerable_bank_code = """
from flask import Flask, request
import requests
import sqlite3
import logging

app = Flask(__name__)

@app.route('/api/v1/fetch_partner_data')
def fetch_partner():
    url = request.args.get('callback_url')
    # Vulnerabilité SSRF (BSCP)
    resp = requests.get(url)
    return resp.text

@app.route('/api/v1/user_search')
def search_user():
    email = request.args.get('email')
    logging.info(f"Recherche effectuée pour email: {email}") # Infraction RGPD Art 5
    conn = sqlite3.connect('bank.db')
    cursor = conn.cursor()
    # Vulnerabilité SQLi (BSCP)
    cursor.execute(f"SELECT * FROM customers WHERE email = '{email}'")
    return str(cursor.fetchall())
"""

auditor = OpenBankingAuditCapstone(vulnerable_bank_code)
sec_findings = auditor.audit_security_vulnerabilities()
priv_findings = auditor.audit_gdpr_compliance()

print("=== RAPPORT D'AUDIT SÉCURITÉ WEB (BSCP) ===")
print(json.dumps(sec_findings, indent=2, ensure_ascii=False))

print("\n=== RAPPORT CONFORMITÉ PRIVACY & RGPD (CIPP/E) ===")
print(json.dumps(priv_findings, indent=2, ensure_ascii=False))
```

---

## 2) Module — Plan de Remédiation Intégré (1h30)

```markdown
# PLAN DE REMÉDIATION TECHNIQUE ET CONFORMITÉ RGPD

## 1. Correctifs Sécurité Applicative (BSCP)

- **Remédiation SSRF (`CWE-918`) :**
  Remplacer l'appel `requests.get(url)` direct par un client HTTP sécurisé configuré avec un proxy sortant bloquant les IP privées RFC 1918 et les métadonnées Cloud AWS (`169.254.169.254`).

- **Remédiation SQL Injection (`CWE-89`) :**
  Passer à des requêtes paramétrées :
  ```python
  cursor.execute("SELECT * FROM customers WHERE email = ?", (email,))
  ```

---

## 2. Correctifs Privacy & RGPD (CIPP/E)

- **Remédiation Article 5(1)(c) - Minimisation des Données dans les Logs :**
  Implémenter un filtre de logging anonymisant les adresses email avant journalisation :
  ```python
  masked_email = mask_email_utility(email)
  logging.info(f"Recherche effectuée pour utilisateur anonymisé: {masked_email}")
  ```

- **Mise en Œuvre de la DPIA (Article 35) :**
  Mise à jour du registre des traitements (RoPA) pour inclure l'API de transfert partenaire et valider la durée de conservation maximale de 30 jours pour les logs de recherche.
```

---

## 3) Module — Grille de Validation du Projet S7 P6 (2h)

```markdown
## EVALUATION GRID — CAPSTONE S7 PARTIE 6

| Domaine | Critères d'Évaluation | Pondération | Statut |
|:---|:---|:---:|:---:|
| **Web Exploitation (BSCP)** | Identification & POC fonctionnel de la SSRF | 25% | **VALIDÉ** |
| **Web Exploitation (BSCP)** | Détection de l'injection SQL & Remédiation | 25% | **VALIDÉ** |
| **Privacy Audit (CIPP/E)** | Audit des violations de minimisation RGPD (Art. 5) | 25% | **VALIDÉ** |
| **Privacy Audit (CIPP/E)** | Proposition de mesures techniques (Privacy by Design) | 25% | **VALIDÉ** |

**Score Final : 100/100 — CERTIFICATION INTERNE S7 P6 OCTROYÉE**
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **RFC 1918** | Spécification définissant les plages d'adresses IP privées (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) |
| **RoPA** | Record of Processing Activities — Registre des activités de traitement (Art. 30 RGPD) |

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
