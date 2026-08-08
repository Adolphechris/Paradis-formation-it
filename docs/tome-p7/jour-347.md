# TOME P7 — Certifications d'Élite & Spécialisations — Jour 347 (6h) : Entretiens Techniques Cybersécurité (Big Four, FAANG, Banques, ANSSI, ENISA — Whiteboard Architecture & Live Coding)

> [!NOTE]
> **Objectif du jour :** Préparer et réussir les **entretiens techniques de recrutement les plus exigeants du marché mondial** (Big Four Deloitte/PwC/EY/KPMG, FAANG Google/Meta/AWS, Banques d'Investissement, ANSSI, ENISA, cabinet Red Team d'Élite) : maîtriser les épreuves de **Whiteboard System Architecture**, le **Live Coding de Sécurité**, la résolution de cas d'incidents complexes en temps réel, et la défense orale de choix d'architecture devant un comité d'experts (Bar Raisers).
>
> **Compétences visées :** `CAREER-03` (A) — Executive Technical Interview Mastery & Whiteboard System Security Design | `CAREER-04` (A) — Live Coding & Incident Defense Simulation

---

## 1) Module — Méthodologie Whiteboard System Security Design (2h)

### 📖 Narration/Intuition

Lors d'un entretien technique de niveau Principal / Lead, l'épreuve reine est le **Whiteboard System Security Design** (ex. "Concevez l'architecture sécurisée d'un système bancaire de paiement instantané tolérant aux pannes et conforme DORA/RGPD"). 

Pour obtenir la note maximale, il faut dérouler une démarche structurée en **4 étapes clés** :

```
┌────────────────────────────────────────────────────────┐
│ 1. Clarification & Scoping (NFRs, SLA, Menaces Clés)  │
├────────────────────────────────────────────────────────┤
│ 2. High-Level Architecture (Composants, Trust Bounds) │
├────────────────────────────────────────────────────────┤
│ 3. Deep-Dive Sécurité (IAM, Chiffrement, Zero Trust)  │
├────────────────────────────────────────────────────────┤
│ 4. Failure Modes & Edge Cases (DDoS, Compromission)   │
└────────────────────────────────────────────────────────┘
```

---

## 2) Module — Simulator d'Entretien Technique & Live Coding (`interview_simulator.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json

class TechnicalInterviewSimulator:
    """
    Simulateur d'épreuves d'entretiens techniques pour postes de Lead/Principal Cyber Expert.
    """

    @staticmethod
    def solve_whiteboard_challenge(scenario_title: str) -> dict:
        """
        Déroule la résolution type d'un exercice d'architecture Whiteboard (FAANG / Big Four).
        Scénario : Système de Paiement Temps Réel (ISO 20022 / Swift API Gateway).
        """
        solution = {
            "scenario": scenario_title,
            "step_1_clarification": {
                "nfr": "Disponibilité 99.999% (RTO < 1m, RPO = 0), Latence < 100ms",
                "compliance": "DORA, PCI-DSS v4.0, RGPD Art. 32",
                "threat_actors": ["APT28/FIN7", "Malicious Insider", "DDoS Volumétrique"]
            },
            "step_2_architecture_components": [
                "Edge: AWS CloudFront + Shield Advanced + WAF v2",
                "Ingress: Kong API Gateway (mTLS + JWT Validation RS256)",
                "Compute: EKS Cluster (PSS Restricted, Pod Identities, GuardDuty)",
                "Secrets: HashiCorp Vault (Dynamic Secrets PostgreSQL)",
                "Data: Aurora PostgreSQL (Chiffrement KMS, Multi-AZ Active-Active)"
            ],
            "step_3_security_controls": {
                "authentication": "OAuth2 / OIDC avec MFA FIDO2 obligatoire",
                "authorization": "OPA Gatekeeper (RBAC/ABAC)",
                "data_protection": "Chiffrement AES-256-GCM en transit (TLS 1.3) et au repos (KMS KEK/DEK)",
                "monitoring": "SIEM Splunk + Falco eBPF Runtime + Security Hub"
            },
            "step_4_failure_modes": [
                "Si la Région AWS Principale tombe -> Failover Route53 DNS vers DR Region en < 30s",
                "Si un Pod EKS est compromis -> Isolation automatique via Security Group vide par Lambda"
            ]
        }
        return solution

    @staticmethod
    def live_coding_security_fix(vulnerable_code: str) -> str:
        """
        Épreuve de Live Coding : Corriger du code vulnérable en temps réel sous pression.
        """
        print("[*] Code Vulnérable reçu (SQL Injection + Hardcoded Secret) :")
        # Application du correctif de sécurité
        fixed_code = """
import os
import psycopg2
from psycopg2.extras import RealDictCursor

# Correction 1 : Extraction du secret depuis les variables d'environnement / Vault
DB_PASSWORD = os.environ.get("DB_PASSWORD")

def get_user_balance(user_id: str):
    conn = psycopg2.connect(dbname="bank", user="app_user", password=DB_PASSWORD, host="localhost")
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Correction 2 : Remplacement de l'interpolation de chaîne par une requête paramétrée sécurisée
    query = "SELECT balance, currency FROM accounts WHERE user_id = %s"
    cursor.execute(query, (user_id,))
    return cursor.fetchone()
"""
        return fixed_code

# Exécution du simulateur
print("=== SIMULATEUR D'ENTRETIEN TECHNIQUE PRINCIPAL CYBER ===")
whiteboard_res = TechnicalInterviewSimulator.solve_whiteboard_challenge("Instant Payment API Architecture")
print(json.dumps(whiteboard_res, indent=2, ensure_ascii=False))

print("\n=== ÉPREUVE DE LIVE CODING (SOLUTION HARDENED) ===")
print(TechnicalInterviewSimulator.live_coding_security_fix(""))
```

---

## 3) Module — Banques de Questions de Recrutement d'Élite (2h)

```markdown
# BANQUE DE QUESTIONS TECHNIQUES (FAANG, BIG FOUR, ANSSI)

## 1. Questions Architecture & Cloud (FAANG / Big Four)
- **Q1 :** *Comment concevez-vous l'isolation mémoire et réseau d'un cluster Kubernetes multi-tenant hébergeant des microservices bancaires sensibles ?*
  - **Réponse attendue :** PSS restricted, NetworkPolicies default-deny-all, CNI Cilium eBPF L7, Istio mTLS strict, OPA Gatekeeper, Seccomp/AppArmor, et Pod Identities pour l'accès IAM sans rôle partagé sur le nœud.

## 2. Questions Offensives & Low-Level (Red Team / ANSSI)
- **Q2 :** *Expliquez comment vous contournez la protection DEP/NX sous Windows x64 lors d'un buffer overflow sans pouvoir exécuter de shellcode directement sur la pile.*
  - **Réponse attendue :** Utilisation d'une ROP Chain (Return-Oriented Programming). Alignement de la stack sur 16 octets, chargement des arguments FastCall (`RCX`, `RDX`, `R8`, `R9`), et appel à `VirtualProtect()` pour passer la page en `PAGE_EXECUTE_READWRITE` avant de sauter sur le shellcode (`JMP RSP`).

## 3. Questions Gouvernance & Réglementation (CISO / ENISA)
- **Q3 :** *Comment conciliez-vous les exigences d'audit RGPD (droit à l'effacement Art. 17) avec les obligations légales de conservation des journaux de transactions financières ?*
  - **Réponse attendue :** Anonymisation irréversible des données nominatives (remplacement par un hash salé irréversible) tout en conservant les enregistrements de transactions purs et les métadonnées requises par les directives LCB-FT dans un archivage intermédiaire sécurisé.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **NFR** | Non-Functional Requirements — Exigences non fonctionnelles (Performance, Sécurité, Disponibilité) |
| **Bar Raiser** | Évaluateur indépendant dans les processus de recrutement FAANG garantissant le niveau d'excellence |
| **FIDO2** | Standard d'authentification forte sans mot de passe basé sur la cryptographie asymétrique (WebAuthn/CTAP2) |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Lors d'une épreuve de **Whiteboard System Security Design**, quelle est la première étape indispensable avant d'esquisser la moindre architecture ?
- A) Poser des questions de clarification pour cadrer le périmètre, les exigences non fonctionnelles (NFRs), le modèle de menace (Threat Model) et les contraintes de conformité
- B) Dessiner immédiatement une base de données
- C) Écrire du code Python
- D) Choisir la marque des pare-feu

**Réponse : A**

**Q2 :** Dans un entretien FAANG, quelle est la meilleure réponse face à une question sur la gestion d'une faille de sécurité critique en production ?
- A) Dérouler une méthode de réponse aux incidents structurée (NIST SP 800-61 : Détection → Confinement → Éradication → Rétablissement → RETEX/Lessons Learned) avec déconfliction et communication aux parties prenantes
- B) Éteindre immédiatement tous les serveurs sans analyser
- C) Blâmer le développeur junior
- D) Attendre le lendemain

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
