# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 395 (6h) : SOC Final Assessment & Certification Preparation — Grand Examen de Synthèse Semestre 8, Practical Labs Review, Certification Path (SANS GSEC, CISSP, CCSP) & BCC SOC Employment Portfolio

> [!NOTE]
> **Objectif du jour :** Évaluer la maîtrise complète du Semestre 8 Blue Team/SOC/SIEM à travers un **examen de synthèse** final, réviser les ateliers pratiques, préparer les certifications professionnelles (GSEC, CISSP, CCSP) et constituer le portfolio d'employabilité pour un poste SOC Blue Team de niveau bancaire.
>
> **Compétences visées :** `S8-FINAL-01` (A) — Mastery Assessment SOC Blue Team | `S8-FINAL-02` (A) — Certification Preparation & Employment Portfolio

---

## 1) Module — Grand Examen de Synthèse Semestre 8 (2h)

### 📖 Structure de l'Examen

```
EXAMEN DE SYNTHÈSE S8 — DURÉE : 3h30
┌─────────────────────────────────────────┐
│ PARTIE A : 60 QCM (40 points)          │
│ - SOC Operations & Triage               │
│ - SIEM/EDR/NDR/CTI                      │
│ - Detection Engineering                 │
│ - Threat Hunting                        │
│ - SOAR & Automation                     │
│ - DFIR & Malware Analysis               │
│ - Vulnerability Management              │
│ - Case Management & Compliance          │
│ - SOC Metrics & Strategy                │
│ - Innovation & Future Trends            │
│ - Purple Teaming & Continuous Improv.   │
│ - ML/AI for SOC                         │
│ - Cloud SOC Security                    │
├─────────────────────────────────────────┤
│ PARTIE B : Cas Pratique (30 points)    │
│ - Incident response complet             │
│ - Timeline construction                 │
│ - IoCs extraction                       │
│ - Playbook execution                    │
│ - Rapport professionnel                 │
└─────────────────────────────────────────┘

SEUIL DE RÉUSSITE : 75% (45/60 QCM + 22/30 cas pratique)
```

---

## 2) Module — Practical Labs Review & Score Calculator (2h)

### 📖 Revue des Ateliers Pratiques

```
ATELIERS PRATIQUES S8 — REVUE
├── J351 : SOC Triage Engine (Python)
├── J352 : ELK Stack Configuration
├── J353 : Splunk SPL Queries
├── J354 : Sigma Rule Writing
├── J355 : SOAR Playbook Engine
├── J356 : CTI Operations Engine
├── J357 : EDR Detection Engine
├── J358 : NDR & Deception Engine
├── J359 : Zero Trust Policy Engine
├── J360 : SOC Integration Project
├── J361 : Threat Hunting Engine
├── J362 : Detection Engineering CI/CD
├── J363 : DFIR Memory Forensics
├── J364 : SOC Compliance Engine
├── J365 : SOC Metrics Dashboard
├── J366 : SOC Strategy Engine
├── J367 : SOC Culture & Burnout Prevention
├── J368 : SOC Innovation Engine
├── J369 : Global Threat Intel Engine
├── J370 : SOC Maturity Assessment
├── J371 : SOC Capstone Review Part 1
├── J372 : SOC Capstone Review Part 2
├── J373 : SOC Purple Teaming
├── J374 : SOC Cloud Security
├── J375 : Advanced Threat Hunting
├── J376 : SOC AI/ML Detection
└── J377 : SOC Final Defense
```

### Checklist de Maîtrise

| Compétence | Niveau Requis | Auto-évaluation |
|:---|:---:|:---:|
| SOC Operations & Triage | Expert | ☐ ☐ ☐ |
| SIEM Configuration | Expert | ☐ ☐ ☐ |
| EDR/XDR Management | Expert | ☐ ☐ ☐ |
| NDR & Network Security | Avancé | ☐ ☐ ☐ |
| Threat Intelligence | Avancé | ☐ ☐ ☐ |
| Detection Engineering | Expert | ☐ ☐ ☐ |
| Threat Hunting | Avancé | ☐ ☐ ☐ |
| SOAR & Automation | Avancé | ☐ ☐ ☐ |
| DFIR & Forensics | Avancé | ☐ ☐ ☐ |
| Vulnerability Management | Avancé | ☐ ☐ ☐ |
| SOC Metrics & Reporting | Avancé | ☐ ☐ ☐ |
| Compliance & Governance | Avancé | ☐ ☐ ☐ |
| Purple Teaming | Avancé | ☐ ☐ ☐ |
| ML/AI for SOC | Intermédiaire | ☐ ☐ ☐ |
| Cloud SOC Security | Avancé | ☐ ☐ ☐ |

### 🛠️ Atelier Pratique — Calculateur de Score d'Examen

```python
import json
from datetime import datetime, timezone
from typing import List, Dict, Optional
from enum import Enum

class ExamStatus(Enum):
    PASSED = "PASSED"
    FAILED = "FAILED"

class SOCFinalExamEngine:
    """
    Moteur d'évaluation finale pour le Semestre 8.
    Calcule les scores QCM et cas pratique, détermine la réussite.
    """

    def __init__(self, pass_threshold: float = 75.0):
        self.pass_threshold = pass_threshold
        self.qcm_score: float = 0.0
        self.practical_score: float = 0.0
        self.qcm_total: int = 60
        self.practical_total: int = 30

    def set_qcm_score(self, correct_answers: int) -> dict:
        """Définit le score QCM."""
        self.qcm_score = (correct_answers / self.qcm_total) * 40.0
        return {
            "correct_answers": correct_answers,
            "total_questions": self.qcm_total,
            "score": round(self.qcm_score, 1),
            "percentage": round((correct_answers / self.qcm_total) * 100, 1)
        }

    def set_practical_score(self, points: int) -> dict:
        """Définit le score cas pratique."""
        self.practical_score = (points / self.practical_total) * 30.0
        return {
            "points": points,
            "total_points": self.practical_total,
            "score": round(self.practical_score, 1),
            "percentage": round((points / self.practical_total) * 100, 1)
        }

    def calculate_final_result(self) -> dict:
        """Calcule le résultat final."""
        total_score = self.qcm_score + self.practical_score
        max_score = self.qcm_total + self.practical_total
        percentage = (total_score / max_score) * 100

        passed = percentage >= self.pass_threshold

        return {
            "qcm_score": round(self.qcm_score, 1),
            "practical_score": round(self.practical_score, 1),
            "total_score": round(total_score, 1),
            "max_score": max_score,
            "percentage": round(percentage, 1),
            "threshold": self.pass_threshold,
            "status": ExamStatus.PASSED.value if passed else ExamStatus.FAILED.value,
            "certification_eligible": passed
        }

    def generate_certificate(self, student_name: str) -> str:
        """Génère un certificat de completion."""
        result = self.calculate_final_result()
        if result["status"] != ExamStatus.PASSED.value:
            return f"Échec — Score: {result['percentage']}% (seuil: {self.pass_threshold}%)"

        return f"""
╔══════════════════════════════════════════════════════════════╗
║   PARADIS — Master Cybersécurité, Semestre 8                ║
║   CERTIFICAT DE COMPLETION                                  ║
║   Ce certificat atteste que {student_name:<35} ║
║   a complété avec succès le Semestre 8 :                     ║
║   Blue Team, SOC & SIEM Advanced                            ║
║   Score: {result['total_score']}/{result['max_score']} ({result['percentage']}%)                  ║
╚══════════════════════════════════════════════════════════════╝
"""

# --- Démonstration ---
print("=== SOC FINAL EXAM ENGINE DEMONSTRATION ===")

exam = SOCFinalExamEngine(pass_threshold=75.0)

# Score QCM
qcm_result = exam.set_qcm_score(52)
print(f"\n[+] QCM Result: {qcm_result['correct_answers']}/{qcm_result['total_questions']} = {qcm_result['percentage']}% ({qcm_result['score']}/40 pts)")

# Score Cas Pratique
practical_result = exam.set_practical_score(24)
print(f"\n[+] Practical Result: {practical_result['points']}/{practical_result['total_points']} = {practical_result['percentage']}% ({practical_result['score']}/30 pts)")

# Résultat final
final = exam.calculate_final_result()
print(f"\n[+] Final Result: {final['total_score']}/{final['max_score']} = {final['percentage']}% — {final['status']}")
print(f"    Certification eligible: {final['certification_eligible']}")

# Certificat
certificate = exam.generate_certificate("Jean Dupont")
print(f"\n{certificate}")
```

---

## 3) Module — Certification Path & Portfolio (2h)

### 📖 Certifications Professionnelles

```yaml
# Certification Path — SOC Blue Team
immediate_certifications:
  - "GSEC (GIAC Security Essentials) — Fondamentaux sécurité"
  - "CySA+ (CompTIA Cybersecurity Analyst) — Détection et analyse"
  - "GCIH (GIAC Certified Incident Handler) — Gestion d'incidents"
  - "SANS FOR508 (Advanced Incident Response) — DFIR avancé"

mid_term_certifications:
  - "CISSP (Certified Information Systems Security Professional) — Gouvernance et architecture"
  - "CCSP (Certified Cloud Security Professional) — Sécurité cloud"
  - "OSCP (Offensive Security Certified Professional) — Pentest/Red Team perspective"
  - "CRTO (Certified Red Team Operator) — Red Team / Threat Emulation"

advanced_certifications:
  - "CISM (Certified Information Security Manager) — Management sécurité"
  - "CASP+ (CompTIA Advanced Security Practitioner) — Architecture avancée"
  - "SANS MICE (Maturity Indicator) — Maturité SOC"
  - "ISO 27001 Lead Auditor — Audit SMSI"

bcc_portfolio:
  projects:
    - "SOC Architecture Design for BCC"
    - "Detection Rules Portfolio (50+ rules)"
    - "SOAR Playbooks Collection (5+ playbooks)"
    - "Threat Intelligence Reports (CTI program)"
    - "SOC Metrics Dashboard & Board Reports"
    - "Purple Team Exercise Report"

  github:
    - "Detection rules in Sigma/KQL"
    - "SOAR playbooks in YAML/JSON"
    - "Python scripts for SOC automation"
    - "Documentation and architecture diagrams"

  linkedin:
    - "SOC Blue Team Specialist profile"
    - "Project showcases with metrics"
    - "Certifications and continuous learning"
    - "Network with SOC professionals"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **GSEC** | GIAC Security Essentials Certification |
| **CISSP** | Certified Information Systems Security Professional |
| **GCIH** | GIAC Certified Incident Handler |
| **DFIR** | Digital Forensics & Incident Response |
| **SIEM** | Security Information & Event Management |
| **EDR/XDR** | Endpoint/Extended Detection and Response |
| **SOAR** | Security Orchestration, Automation and Response |
| **CTI** | Cyber Threat Intelligence |
| **MITRE ATT&CK** | Framework de connaissances sur les tactiques/techniques des attaquants |
| **TTP** | Tactics, Techniques, and Procedures |
| **IoC** | Indicator of Compromise |
| **NIS2** | Directive européenne sur la sécurité des réseaux |
| **DORA** | Digital Operational Resilience Act |
| **RGPD** | Règlement Général sur la Protection des Données |
| **COBAC** | Commission Bancaire de la RDC |
| **ISO 27001** | Norme SMSI |
| **ROI** | Return on Investment |
| **MTTD** | Mean Time to Detect |
| **MTTR** | Mean Time to Respond/Remediate |
| **F3EAD** | Cycle de renseignement Find/Fix/Finish/Exploit/Analyze/Disseminate |
| **KYPO** | Know Your Processes/Products — Cybersecurity maturity assessment |
| **SOC** | Security Operations Center |
| **BCC** | Banque Centrale du Congo |
| **COMEX** | Comité Exécutif |
| **SOC Manager** | Responsable du Security Operations Center |
| **CISO** | Chief Information Security Officer |
| **Detection Engineer** | Ingénieur en détection de menaces |
| **Threat Hunter** | Chasseur de menaces |
| **Incident Responder** | Répondant aux incidents |
| **SOC Analyst** | Analyste SOC |
| **GRC** | Governance, Risk & Compliance |
| **NIST CSF** | NIST Cybersecurity Framework |
| **SANS** | SysAdmin, Audit, Networking, Security |
| **GIAC** | Global Information Assurance Certification |
| **STIX/TAXII** | Standards d'échange de renseignement |
| **MISP** | Malware Information Sharing Platform |
| **OpenCTI** | Open Cyber Threat Intelligence |
| **YARA** | Yet Another Recursive Acronym — Outil de détection |
| **Sigma** | Standard generic signature format for SIEM systems |
| **KQL** | Kusto Query Language |
| **SPL** | Splunk Processing Language |
| **Volatility** | Framework de forensique mémoire |
| **Autopsy** | Outil de forensique disque |
| **Zeek** | Framework de détection réseau |
| **Suricata** | IDS/IPS open source |
| **Wireshark** | Analyseur de protocoles réseau |
| **OSQuery** | Outil d'interrogation des endpoints |
| **Velociraptor** | Outil de visibilité endpoints |
| **Ansible** | Outil d'automatisation |
| **Terraform** | Infrastructure as Code |
| **Docker** | Plateforme de conteneurs |
| **Kubernetes** | Orchestration de conteneurs |
| **Python** | Langage de programmation |
| **Git** | Contrôle de version |
| **CI/CD** | Continuous Integration/Continuous Deployment |
| **API** | Application Programming Interface |
| **REST** | Representational State Transfer |
| **JSON** | JavaScript Object Notation |
| **YAML** | YAML Ain't Markup Language |
| **MFA** | Multi-Factor Authentication |
| **PAM** | Privileged Access Management |
| **IAM** | Identity and Access Management |
| **FIDO2** | Fast Identity Online — Authentification passwordless |
| **JIT** | Just-In-Time — Accès temporaire |
| **ABAC** | Attribute-Based Access Control |
| **RBAC** | Role-Based Access Control |
| **SASE** | Secure Access Service Edge |
| **SD-WAN** | Software-Defined WAN |
| **VPN** | Virtual Private Network |
| **NGFW** | Next-Generation Firewall |
| **IDS/IPS** | Intrusion Detection/Prevention System |
| **Honeypot** | Pot de miel — Appât pour attaquants |
| **Canary Token** | Jeton leurre pour détection d'intrusion |
| **DNS Tunneling** | Exfiltration via DNS |
| **DGA** | Domain Generation Algorithm |
| **Ransomware** | Rançongiciel |
| **Phishing** | Hameçonnage |
| **BEC** | Business Email Compromise |
| **APT** | Advanced Persistent Threat |
| **IAB** | Initial Access Broker |
| **RaaS** | Ransomware as a Service |
| **DDoS** | Distributed Denial of Service |
| **LOLBins** | Living Off the Land Binaries |
| **WMI** | Windows Management Instrumentation |
| **PowerShell** | Shell et langage de script Microsoft |
| **WMI** | Windows Management Instrumentation |
| **SMB** | Server Message Block — Protocole de partage Windows |
| **RDP** | Remote Desktop Protocol |
| **LDAP** | Lightweight Directory Access Protocol |
| **Kerberos** | Protocole d'authentification réseau |
| **NTLM** | NT LAN Manager — Protocole d'authentification Microsoft |
| **OAuth** | Open Authorization — Protocole d'autorisation |
| **SAML** | Security Assertion Markup Language |
| **JWT** | JSON Web Token |
| **TLS** | Transport Layer Security |
| **SSL** | Secure Sockets Layer |
| **HTTPS** | Hypertext Transfer Protocol Secure |
| **VPN** | Virtual Private Network |
| **IPsec** | Internet Protocol Security |
| **SHA** | Secure Hash Algorithm |
| **RSA** | Rivest-Shamir-Adleman — Chiffrement asymétrique |
| **ECC** | Elliptic Curve Cryptography |
| **AES** | Advanced Encryption Standard |
| **DES** | Data Encryption Standard |
| **3DES** | Triple Data Encryption Standard |
| **Blowfish** | Algorithme de chiffrement |
| **PGP** | Pretty Good Privacy |
| **PKI** | Public Key Infrastructure |
| **HSM** | Hardware Security Module |
| **CA** | Certificate Authority |
| **CRL** | Certificate Revocation List |
| **OCSP** | Online Certificate Status Protocol |
| **TLS 1.3** | Dernière version de TLS |
| **Cipher** | Algorithme de chiffrement |
| **Key Exchange** | Échange de clés |
| **Perfect Forward Secrecy** | Confidentialité persistante |
| **Certificate Pinning** | Épinglage de certificat |
| **HSTS** | HTTP Strict Transport Security |
| **CORS** | Cross-Origin Resource Sharing |
| **CSRF** | Cross-Site Request Forgery |
| **XSS** | Cross-Site Scripting |
| **SQLi** | SQL Injection |
| **RCE** | Remote Code Execution |
| **LFI/RFI** | Local/Remote File Inclusion |
| **SSRF** | Server-Side Request Forgery |
| **XXE** | XML External Entity |
| **IDOR** | Insecure Direct Object Reference |
| **Command Injection** | Injection de commandes |
| **Path Traversal** | Traversée de répertoires |
| **Buffer Overflow** | Débordement de tampon |
| **Stack Canary** | Garde de pile |
| **ASLR** | Address Space Layout Randomization |
| **DEP/NX** | Data Execution Prevention / No-Execute |
| **ROP** | Return-Oriented Programming |
| **JOP** | Jump-Oriented Programming |
| **ROP Chain** | Chaîne ROP |
| **Shellcode** | Code de shell |
| **Payload** | Charge utile |
| **Exploit** | Exploit — Code exploitant une vulnérabilité |
| **0-day** | Vulnérabilité non corrigée et inconnue |
| **N-day** | Vulnérabilité corrigée mais pas patchée |
| **CVE** | Common Vulnerabilities and Exposures |
| **CVSS** | Common Vulnerability Scoring System |
| **CISA KEV** | Known Exploited Vulnerabilities |
| **EPSS** | Exploit Prediction Scoring System |
| **SBOM** | Software Bill of Materials |
| **SAST** | Static Application Security Testing |
| **DAST** | Dynamic Application Security Testing |
| **SCA** | Software Composition Analysis |
| **IAST** | Interactive Application Security Testing |
| **RASP** | Runtime Application Self-Protection |
| **WAF** | Web Application Firewall |
| **WAAP** | Web Application and API Protection |
| **API Gateway** | Passerelle API |
| **Rate Limiting** | Limitation de débit |
| **Input Validation** | Validation des entrées |
| **Output Encoding** | Encodage des sorties |
| **Sanitization** | Assainissement des données |
| **Parameterized Query** | Requête paramétrée |
| **ORM** | Object-Relational Mapping |
| **Secrets Management** | Gestion des secrets |
| **Vault** | Coffre-fort de secrets |
| **KMS** | Key Management Service |
| **HSM** | Hardware Security Module |
| **Key Rotation** | Rotation des clés |
| **Secret Sprawl** | Dissémination des secrets |
| **GitLeaks** | Détection de secrets dans Git |
| **SOPS** | Secrets OPerationS — Chiffrement de secrets |
| **HashiCorp Vault** | Gestion de secrets |
| **AWS Secrets Manager** | Gestion de secrets AWS |
| **Azure Key Vault** | Gestion de secrets Azure |
| **Google Secret Manager** | Gestion de secrets GCP |
| **Kubernetes Secrets** | Secrets Kubernetes |
| **Docker Secrets** | Secrets Docker |
| **Environment Variables** | Variables d'environnement |
| **Hardcoded Credentials** | Identifiants en dur |
| **Privilege Escalation** | Élévation de privilèges |
| **Privileged Container** | Conteneur privilégié |
| **Docker Socket** | Socket Docker |
| **cgroups** | Control Groups — Limitation de ressources |
| **Namespace** | Espace de noms Linux |
| **Capabilities** | Capacités Linux |
| **Seccomp** | Filtrage d'appels système |
| **AppArmor** | Profils de sécurité Linux |
| **SELinux** | Security-Enhanced Linux |
| **OPA** | Open Policy Agent |
| **Gatekeeper** | OPA Gatekeeper pour Kubernetes |
| **Pod Security Standards** | Normes de sécurité des pods |
| **RBAC** | Role-Based Access Control |
| **ABAC** | Attribute-Based Access Control |
| **Service Account** | Compte de service Kubernetes |
| **Kubelet** | Agent Kubernetes |
| **etcd** | Store de clés-valeurs Kubernetes |
| **API Server** | Serveur API Kubernetes |
| **Kubeconfig** | Fichier de configuration Kubernetes |
| **Helm** | Gestionnaire de charts Kubernetes |
| **Helm Chart** | Chart Helm |
| **Helm Repository** | Dépôt Helm |
| **Helm Values** | Valeurs Helm |
| **Helm Template** | Template Helm |
| **Helm Hook** | Hook Helm |
| **Helm Test** | Test Helm |
| **Helm Rollback** | Rollback Helm |
| **Helm Upgrade** | Mise à jour Helm |
| **Helm Install** | Installation Helm |
| **Helm Uninstall** | Désinstallation Helm |
| **Helm List** | Liste Helm |
| **Helm History** | Historique Helm |
| **Helm Status** | Statut Helm |
| **Helm Get** | Récupération Helm |
| **Helm Dependency** | Dépendances Helm |
| **Helm Lint** | Lint Helm |
| **Helm Package** | Package Helm |
| **Helm Push** | Push Helm |
| **Helm Pull** | Pull Helm |
| **Helm Search** | Recherche Helm |
| **Helm Repo** | Dépôt Helm |
| **Helm Plugin** | Plugin Helm |
| **Helm Completion** | Autocomplétion Helm |
| **Helm Version** | Version Helm |
| **Helm Help** | Aide Helm |
| **Helm Docs** | Documentation Helm |
| **Helm Env** | Environnement Helm |
| **Helm Debug** | Debug Helm |
| **Helm Sh** | Shell Helm |
| **Helm Template** | Template Helm |
| **Helm Test** | Test Helm |
| **Helm Upgrade** | Upgrade Helm |
| **Helm Rollback** | Rollback Helm |
| **Helm Install** | Install Helm |
| **Helm Uninstall** | Uninstall Helm |
| **Helm List** | List Helm |
| **Helm History** | History Helm |
| **Helm Status** | Status Helm |
| **Helm Get** | Get Helm |
| **Helm Dependency** | Dependency Helm |
| **Helm Lint** | Lint Helm |
| **Helm Package** | Package Helm |
| **Helm Push** | Push Helm |
| **Helm Pull** | Pull Helm |
| **Helm Search** | Search Helm |
| **Helm Repo** | Repo Helm |
| **Helm Plugin** | Plugin Helm |
| **Helm Completion** | Completion Helm |
| **Helm Version** | Version Helm |
| **Helm Help** | Help Helm |
| **Helm Docs** | Docs Helm |
| **Helm Env** | Env Helm |
| **Helm Debug** | Debug Helm |
| **Helm Sh** | Sh Helm |

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **GSEC** | GIAC Security Essentials Certification |
| **CISSP** | Certified Information Systems Security Professional |
| **CCSP** | Certified Cloud Security Professional |
| **GCIH** | GIAC Certified Incident Handler |
| **OSCP** | Offensive Security Certified Professional |
| **CRTO** | Certified Red Team Operator |
| **CISM** | Certified Information Security Manager |
| **DFIR** | Digital Forensics & Incident Response |
| **SIEM** | Security Information & Event Management |
| **EDR/XDR** | Endpoint/Extended Detection and Response |
| **NDR** | Network Detection & Response |
| **SOAR** | Security Orchestration, Automation & Response |
| **CTI** | Cyber Threat Intelligence |
| **MITRE ATT&CK** | Framework de connaissances sur les tactiques et techniques des attaquants |
| **TTP** | Tactics, Techniques, and Procedures — Tactiques, techniques et procédures |
| **IoC** | Indicator of Compromise — Indicateur de compromission |
| **KQL** | Kusto Query Language — Langage de requête pour Azure Sentinel |
| **SPL** | Splunk Processing Language — Langage de requête pour Splunk |
| **Sigma** | Langage de règles de détection agnostique plateforme |
| **YARA** | Outil de détection de motifs pour fichiers malveillants |
| **NIS2** | Directive européenne sur la sécurité des réseaux et systèmes d'information |
| **DORA** | Digital Operational Resilience Act |
| **RGPD** | Règlement Général sur la Protection des Données |
| **COBAC** | Commission Bancaire de la RDC |
| **ISO 27001** | Norme internationale pour les Systèmes de Management de la Sécurité de l'Information |
| **ROI** | Return on Investment — Retour sur investissement |
| **MTTD** | Mean Time to Detect — Temps moyen de détection |
| **MTTR** | Mean Time to Respond/Remediate — Temps moyen de réponse/remédiation |
| **FP/TP** | False Positive / True Positive — Faux positif / Vrai positif |
| **C2** | Command and Control — Canal de commandement et contrôle |
| **APT** | Advanced Persistent Threat — Menace persistante avancée |
| **ML/AI** | Machine Learning / Artificial Intelligence |
| **SSPM** | SaaS Security Posture Management |
| **CASB** | Cloud Access Security Broker |
| **CWPP** | Cloud Workload Protection Platform |
| **CSPM** | Cloud Security Posture Management |
| **DLP** | Data Loss Prevention |
| **SaaS** | Software as a Service |
| **IAM** | Identity and Access Management |
| **ZTA** | Zero Trust Architecture |
| **ICS** | Incident Command System |
| **F3EAD** | Find, Fix, Finish, Exploit, Analyze, Disseminate |
| **PIR** | Priority Intelligence Requirement |
---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Pourquoi un examen de synthèse final est-il nécessaire à la fin du Semestre 8 ?
- A) Parce qu'il valide l'acquisition de l'ensemble des compétences Blue Team/SOC/SIEM sur 45 jours de formation intensive — sans cet examen, l'étudiant ne peut pas certifier sa maîtrise opérationnelle du SOC avant de poursuivre vers les certifications professionnelles (GSEC, CISSP, GCIH)
- B) Parce que c'est la seule façon d'obtenir un diplôme
- C) Parce que les examens sont obligatoires
- D) Parce que les QCM sont plus faciles que les TP

**Réponse : A**

**Q2 :** Quelle est la valeur d'un **portfolio d'employabilité SOC** pour un candidat à un poste de SOC Analyst/Engineer ?
- A) Le portfolio démontre les compétences pratiques (règles de détection, playbooks SOAR, rapports CTI, architectures SOC) de manière concrète et vérifiable — il différencie le candidat des autres et prouve sa capacité à opérer un SOC en environnement bancaire
- B) Parce que c'est obligatoire pour l'obtention du diplôme
- C) Parce que les recruteurs ne regardent que les certifications
- D) Parce que le portfolio améliore la sécurité technique

**Réponse : A**

**Q3 :** Pourquoi les **certifications professionnelles** (GSEC, CISSP, GCIH) sont-elles importantes pour un professionnel SOC ?
- A) Parce qu'elles valident les compétences auprès des employeurs (banques, SOC MSSP, Big 4), démontrent une maîtrise opérationnelle reconnue, et structurent le plan de carrière — dans le secteur bancaire, elles sont souvent un prérequis pour les postes senior
- B) Parce que c'est moins cher que la formation universitaire
- C) Parce que les certifications remplacent l'expérience
- D) Parce que c'est obligatoire par la loi

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
