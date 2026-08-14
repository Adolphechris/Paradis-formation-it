# TOME P2 — Réseaux & Télécoms — Jour 80 (6h) : Projet Intégrateur Semestre 2 (Partie 3) — Architecture SecDevOps Complète

> [!NOTE]
> **Objectif du jour :** Projet de clôture du Semestre 2 (J71-J80) : concevoir une architecture DevSecOps complète pour une application bancaire critique, intégrant toutes les couches de sécurité (applicative, API, conteneurs, CI/CD, base de données, cryptographie). Portfolio complet à défendre en revue technique.
>
> **Compétences visées :** `SEC-05` (A) — SecDevOps | `BIT-08` (A) — Architecture DevOps | `PRO-01` (A) — Conduite de Projet Technique

---

## 1) Module — Architecture de Référence SecDevOps (2h)

### 📖 Narration/Intuition

Ce projet intégrateur synthétise tout le Semestre 2 (J71-J80). Vous êtes Architecte SecDevOps d'une grande institution financière. La Direction Générale demande de déployer un nouveau portail de transactions critique en ligne. Votre mission : concevoir l'architecture complète de sécurité — du code source jusqu'à la production.

### 🔍 Anatomie Technique

**Vue d'ensemble de l'architecture SecDevOps :**

```
PHASE DÉVELOPPEMENT                        PHASE PRODUCTION
──────────────────                         ────────────────
Code Source                                 K8s Cluster
(Git + Branching strategy)                  ┌────────────────────────┐
    │                                        │  Namespace: production │
    ▼                                        │  ┌──────────────────┐  │
Pipeline CI/CD (GitHub Actions)             │  │ Pod: app-api (3) │  │
  ├── SAST (Semgrep + Bandit)               │  │ Pod: app-worker  │  │
  ├── Secret Scan (GitLeaks)                │  └──────────────────┘  │
  ├── SCA (Safety)                          │  NetworkPolicy: deny-all│
  ├── Tests (pytest + 80% couv.)            └──────────┬─────────────┘
  ├── Docker Build (multi-stage)                       │
  ├── Trivy Scan (CVE)                     Ingress + WAF (ModSecurity)
  └── Deploy Staging → Prod                            │
                                            DMZ → Pare-feu NGFW
                                                       │
                                            Internet ← DDOS Protection
```

**Architecture de sécurité applicative — couche par couche :**

```
┌────────────────────────────────────────────────────────────────┐
│ COUCHE 7 : APPLICATION                                         │
│ • OWASP Top 10 mitigé (SQLi→PreparedStmt, XSS→escape, IDOR→ACL│
│ • JWT avec exp/iat, HTTPS uniquement, CSP headers             │
│ • Rate limiting (Flask-Limiter + Redis)                        │
├────────────────────────────────────────────────────────────────┤
│ COUCHE 6 : API                                                  │
│ • OWASP API Security Top 10                                    │
│ • Authentification JWT + RBAC                                  │
│ • CORS strict (whitelist), Versioning (/api/v1/)               │
├────────────────────────────────────────────────────────────────┤
│ COUCHE 5 : CONTENEUR / ORCHESTRATION                           │
│ • Docker multi-stage, utilisateur non-root, readOnlyRootFS     │
│ • K8s RBAC, NetworkPolicy, Secrets encodés (Sealed Secrets)    │
│ • Trivy scan en CI/CD                                          │
├────────────────────────────────────────────────────────────────┤
│ COUCHE 4 : BASE DE DONNÉES                                     │
│ • PostgreSQL : moindre privilège (rôles), pgcrypto (données    │
│   sensibles chiffrées), ACID + index + backup chiffré GPG      │
├────────────────────────────────────────────────────────────────┤
│ COUCHE 3 : CRYPTOGRAPHIE                                       │
│ • TLS 1.3 uniquement (ECDHE-RSA/ECDSA), PFS                   │
│ • PKI interne (CA Racine + CA Inter + certs serveurs)      │
│ • bcrypt pour les mots de passe, AES-256-GCM pour les données  │
├────────────────────────────────────────────────────────────────┤
│ COUCHE 2 : CI/CD & SUPPLY CHAIN                                │
│ • GitHub Actions + SAST/SCA/Secrets scan à chaque PR           │
│ • SBOM généré à chaque build                                   │
│ • Signage des images Docker (cosign)                           │
├────────────────────────────────────────────────────────────────┤
│ COUCHE 1 : INFRASTRUCTURE & RÉSEAU                             │
│ • DMZ multi-niveaux, NGFW (Suricata inline), WAF (ModSecurity) │
│ • Bastion SSH + PAM MFA, SIEM (ELK), NetFlow monitoring        │
│ • IaC : Terraform (provisionnement) + Ansible (hardening)      │
└────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Implémentation & Validation (2h)

### 📖 Narration/Intuition

L'architecture reste sur le papier si elle n'est pas validée techniquement. Ce module implémente les tests automatisés de sécurité qui vérifient que chaque couche de sécurité est bien en place en production.

### 🔍 Anatomie Technique

**Script de validation de sécurité globale :**

```python
#!/usr/bin/env python3
"""
security-audit.py — Audit automatisé de l'architecture SecDevOps
Valide que toutes les couches de sécurité sont correctement configurées.
"""
import subprocess
import requests
import socket
import ssl
import json
import sys
from datetime import datetime, timedelta

class AuditResult:
    def __init__(self):
        self.checks = []
        self.passed = 0
        self.failed = 0
    
    def add(self, category, name, ok, detail=""):
        status = "✅ PASS" if ok else "❌ FAIL"
        self.checks.append({"cat": category, "name": name, "ok": ok, "detail": detail})
        if ok: self.passed += 1
        else: self.failed += 1
        print(f"  [{status}] [{category}] {name} {('— ' + detail) if detail else ''}")

def audit_tls(hostname, port=443):
    """Vérifie la configuration TLS d'un endpoint."""
    results = AuditResult()
    
    try:
        context = ssl.create_default_context()
        context.minimum_version = ssl.TLSVersion.TLSv1_2
        
        with socket.create_connection((hostname, port), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                version = ssock.version()
                cipher = ssock.cipher()
                cert = ssock.getpeercert()
                
                # TLS 1.3 ou minimum 1.2 ?
                results.add("TLS", "Version TLS ≥ 1.2", 
                    version in ["TLSv1.2", "TLSv1.3"], 
                    f"Version actuelle: {version}")
                
                # TLS 1.3 préféré
                results.add("TLS", "TLS 1.3 utilisé",
                    version == "TLSv1.3",
                    f"Cipher: {cipher[0]}")
                
                # Certificat non expiré dans moins de 30 jours
                not_after = ssl.cert_time_to_seconds(cert['notAfter'])
                expire_date = datetime.fromtimestamp(not_after)
                jours_restants = (expire_date - datetime.now()).days
                results.add("TLS", "Certificat valide (>30 jours)",
                    jours_restants > 30,
                    f"Expire dans {jours_restants} jours ({expire_date.strftime('%Y-%m-%d')})")
                
    except Exception as e:
        results.add("TLS", "Connexion TLS", False, str(e))
    
    return results

def audit_http_headers(url):
    """Vérifie les en-têtes de sécurité HTTP."""
    results = AuditResult()
    
    try:
        resp = requests.get(url, timeout=10, verify=True, allow_redirects=True)
        headers = resp.headers
        
        headers_requis = {
            "Strict-Transport-Security": "HSTS absent",
            "X-Content-Type-Options": "X-Content-Type-Options absent",
            "X-Frame-Options": "X-Frame-Options absent",
            "Content-Security-Policy": "CSP absent",
            "Referrer-Policy": "Referrer-Policy absent",
        }
        
        for header, message in headers_requis.items():
            present = header in headers
            results.add("HTTP-Headers", header, present,
                headers.get(header, message)[:60] if present else message)
        
        # X-Powered-By ne doit PAS être présent (divulgation de technologie)
        results.add("HTTP-Headers", "X-Powered-By absent",
            "X-Powered-By" not in headers,
            "Divulgation de technologie !" if "X-Powered-By" in headers else "OK")
        
        # Server header ne doit pas révéler la version
        server = headers.get("Server", "")
        results.add("HTTP-Headers", "Server header non verbeux",
            "/" not in server,  # Pas de version type "nginx/1.24.0"
            f"Server: {server}")
        
    except Exception as e:
        results.add("HTTP-Headers", "Connexion HTTP", False, str(e))
    
    return results

def audit_api_authentication(api_url):
    """Vérifie que les endpoints API nécessitent une authentification."""
    results = AuditResult()
    
    endpoints_protégés = [
        ("/api/v1/comptes", "GET"),
        ("/api/v1/comptes/1", "GET"),
        ("/api/v1/virements", "POST"),
        ("/api/v1/admin/users", "GET"),
    ]
    
    for path, method in endpoints_protégés:
        try:
            resp = requests.request(method, f"{api_url}{path}", timeout=5)
            protégé = resp.status_code in [401, 403]
            results.add("API-Auth", f"{method} {path}",
                protégé,
                f"Status: {resp.status_code} {'(OK — protégé)' if protégé else '(DANGER — accès sans auth !)'}")
        except Exception as e:
            results.add("API-Auth", f"{method} {path}", False, str(e))
    
    return results

def audit_rate_limiting(api_url):
    """Vérifie que le rate limiting est actif sur le login."""
    results = AuditResult()
    
    statuts = []
    for i in range(8):
        try:
            resp = requests.post(
                f"{api_url}/api/v1/auth/login",
                json={"login": "test", "mdp": "wrong"},
                timeout=5
            )
            statuts.append(resp.status_code)
        except:
            statuts.append(0)
    
    a_rate_limit = 429 in statuts
    results.add("Rate-Limiting", "Rate limiting sur /login (429 après 5+ req)",
        a_rate_limit,
        f"Codes reçus: {statuts}")
    
    return results

def run_audit(hostname, api_url):
    """Exécute l'audit complet et génère un rapport."""
    print(f"\n{'='*60}")
        print(f"AUDIT SecDevOps — {hostname}")
    print(f"Date : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")
    
    all_results = AuditResult()
    
    print("📌 Audit TLS...")
    tls = audit_tls(hostname)
    all_results.passed += tls.passed
    all_results.failed += tls.failed
    
    print("\n📌 Audit En-têtes HTTP...")
    http = audit_http_headers(f"https://{hostname}")
    all_results.passed += http.passed
    all_results.failed += http.failed
    
    print("\n📌 Audit Authentification API...")
    auth = audit_api_authentication(api_url)
    all_results.passed += auth.passed
    all_results.failed += auth.failed
    
    print("\n📌 Audit Rate Limiting...")
    rl = audit_rate_limiting(api_url)
    all_results.passed += rl.passed
    all_results.failed += rl.failed
    
    total = all_results.passed + all_results.failed
    score = (all_results.passed / total * 100) if total > 0 else 0
    
    print(f"\n{'='*60}")
    print(f"RÉSULTAT GLOBAL : {all_results.passed}/{total} checks passés ({score:.0f}%)")
    print(f"{'✅ CONFORME' if score >= 80 else '❌ NON CONFORME'} — Seuil requis : 80%")
    print(f"{'='*60}\n")
    
    return score >= 80

if __name__ == "__main__":
    hostname = sys.argv[1] if len(sys.argv) > 1 else "api.entreprise.cd"
    api_url = f"https://{hostname}"
    succès = run_audit(hostname, api_url)
    sys.exit(0 if succès else 1)
```

---

## 3) Module — Livrables Portfolio & Revue Technique (2h)

### 📖 Narration/Intuition

Un architecte SecDevOps ne livre pas seulement du code — il livre une **politique de sécurité documentée**, un **plan de réponse aux incidents**, et une **matrice de conformité** qui permet à la Direction et aux auditeurs de vérifier que chaque exigence réglementaire est adressée.

### 🔍 Anatomie Technique

**Matrice de conformité SecDevOps :**

```markdown
## Matrice de Conformité — Architecture SecDevOps

| Exigence | Contrôle Technique | Outil / Implémentation | Statut |
|:---|:---|:---|:---:|
| OWASP A03 — Injection | Requêtes paramétrées | SQLAlchemy ORM | ✅ |
| OWASP A01 — Access Control | RBAC + vérification propriété | JWT + middleware | ✅ |
| OWASP A07 — Auth Failures | Rate limiting + JWT | Flask-Limiter + Redis | ✅ |
| OWASP API2 — Auth | JWT HS256 + exp 8h | Python-jwt | ✅ |
| XSS Protection | Échappement + CSP | markupsafe + headers | ✅ |
| Secrets Git | Pre-commit hooks | GitLeaks | ✅ |
| CVE Dépendances | Scan SCA en CI | Safety | ✅ |
| CVE Images Docker | Scan en CI/CD | Trivy (exit-code 1 si CRITICAL) | ✅ |
| Conteneur non-root | USER 1001 Dockerfile | Docker best practices | ✅ |
| K8s RBAC | Role/RoleBinding | Kubernetes manifests | ✅ |
| K8s Network | NetworkPolicy deny-all | Kubernetes NetworkPolicy | ✅ |
| TLS 1.3 | nginx + cert-manager | Let's Encrypt / PKI interne | ✅ |
| PFS | ECDHE cipher suites | nginx ssl_ciphers | ✅ |
| Chiffrement données | pgcrypto (AES) | PostgreSQL extension | ✅ |
| Backup chiffré | GPG + sha256sum | Script backup prod | ✅ |
| Moindre privilège DB | Rôles PostgreSQL | pg_hba.conf + GRANT | ✅ |
| IaC reproductible | Terraform + Ansible | Infrastructure code | ✅ |
| Audit logs | auditd + rsyslog | SIEM ELK | ✅ |
| Détection intrusion | SIEM + IDS | Suricata + Kibana | ✅ |
| Bastion SSH | MFA + journalisation | tlog + PAM TOTP | ✅ |
```

**Livrables Portfolio Semestre 2 complets :**

```
PORTFOLIO SEMESTRE 2 — PARADIS IT
Architecte SecDevOps Junior

□ LIVRABLE 1 : Architecture de référence SecDevOps (diagrams.net)
  ✓ Diagramme 7 couches de sécurité
  ✓ Flux de données annotés par classification
  ✓ Points de contrôle de sécurité identifiés

□ LIVRABLE 2 : Pipeline CI/CD opérationnel
  ✓ .github/workflows/devsecops-pipeline.yml (J74)
  ✓ Rapport de scan Trivy + Semgrep
  ✓ Rapport de couverture de tests (>80%)

□ LIVRABLE 3 : Application sécurisée (API REST)
  ✓ Mitigations OWASP Top 10 (J71-J72)
  ✓ JWT + RBAC + Rate Limiting
  ✓ Tests de sécurité automatisés

□ LIVRABLE 4 : Infrastructure IaC
  ✓ Terraform (provisionnement K8s/VMs) (J78)
  ✓ Ansible (hardening Linux) (J78)
  ✓ K8s manifestes sécurisés (J76)

□ LIVRABLE 5 : Rapport d'audit de sécurité
  ✓ Résultats de l'audit automatisé
  ✓ Matrice de conformité OWASP/ISO27001
  ✓ Plan de remédiation (priorités P1/P2/P3)

□ LIVRABLE 6 : Documentation opérationnelle
  ✓ Runbook incidents de sécurité
  ✓ Procédure de révocation de certificat
  ✓ Plan de rotation des secrets (clés JWT, DB passwords)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SecDevOps** | Security + Development + Operations — intégration complète de la sécurité dans DevOps |
| **SBOM** | Software Bill of Materials — inventaire complet des composants d'une application |
| **cosign** | Outil de signature cryptographique des images Docker (Sigstore) |
| **Blast Radius** | Étendue des dommages en cas de compromission d'un composant |
| **SDLC** | Software Development Lifecycle — cycle de vie du développement logiciel |
| **DPDP** | Data Protection and Data Privacy — protection des données personnelles |
| **ACL** | Access Control List — liste de contrôle d'accès |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Le script `security-audit.py` teste si `X-Powered-By` est **absent**. Pourquoi sa présence est-elle un problème de sécurité ?

**Corrigé :** `X-Powered-By: Flask/3.0` ou `X-Powered-By: PHP/8.1.2` révèle à l'attaquant le framework et sa version exacte. Il peut alors chercher dans les CVE les vulnérabilités connues de cette version précise et adapter ses exploits en conséquence (information disclosure → facilitation de l'exploitation).

**Exercice 2 :** Dans la matrice de conformité, "moindre privilège DB" est implémenté via "Rôles PostgreSQL". Citez un exemple concret de violation de ce principe.

**Corrigé :** Utiliser le compte `postgres` (superadmin) comme compte d'application dans le code source : `DATABASE_URL=postgresql://postgres:password@db:5432/bcc`. Si l'application est compromise (via une SQLi ou RCE), l'attaquant dispose d'un accès superadmin à la base de données — il peut lire toutes les tables, supprimer des données, créer des backdoors. Le principe du moindre privilège impose un compte `api_user` avec seulement `SELECT, INSERT, UPDATE` sur les tables nécessaires.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** La propriété "PFS" (Perfect Forward Secrecy) dans TLS est assurée par :
- A) L'utilisation d'un certificat RSA 4096 bits
- B) Des échanges de clés éphémères (ECDHE) générant une clé de session unique par connexion
- C) Le renouvellement du certificat tous les 90 jours
- D) L'activation de TLS 1.3 automatiquement

**Réponse : B**

**Q2 :** Dans une architecture K8s avec NetworkPolicy deny-all, un Pod API ne peut contacter que la DB et Redis. Si une CVE RCE est exploitée sur le Pod API, l'attaquant peut :
- A) Accéder à tous les services du cluster sans restriction
- B) Scanner tout le réseau interne de l'entreprise
- C) Seulement contacter la DB et Redis — les NetworkPolicies limitent le déplacement latéral
- D) Modifier les manifestes K8s directement

**Réponse : C** — Les NetworkPolicies réduisent le blast radius d'une compromission.

**Q3 :** Le scan Trivy avec `exit-code: '1'` dans GitHub Actions garantit que :
- A) Trivy affiche les résultats en couleur
- B) Le pipeline CI/CD s'arrête et empêche le déploiement si des CVE CRITICAL sont détectées dans l'image
- C) Seules les images avec 0 vulnérabilité peuvent être déployées
- D) Trivy scanne aussi le code source Python

**Réponse : B**

**Q4 :** Un SBOM (Software Bill of Materials) est utile pour :
- A) Documenter les fonctionnalités de l'application
- B) Identifier rapidement les composants affectés lors de la publication d'une nouvelle CVE critique (ex: Log4Shell)
- C) Remplacer les tests unitaires
- D) Accélérer les déploiements en production

**Réponse : B**

**Q5 :** La défense en profondeur (Defense in Depth) illustrée par l'architecture à 7 couches signifie :
- A) Utiliser 7 pare-feux différents en série
- B) Si une couche de sécurité est contournée, les autres couches continuent de protéger le système (pas de Single Point of Failure de sécurité)
- C) Avoir 7 copies de chaque composant pour la haute disponibilité
- D) Chiffrer les données 7 fois avec des algorithmes différents

**Réponse : B**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
