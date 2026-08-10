# TOME P9 — Cryptographie, PKI & Sécurité des Communications — Jour 412 (6h) : SSH Hardening Engineering — Certificats SSH CA, `sshd_config` Durcissement NIST SP 800-190, Jump Hosts Bastion & Audit de Connexions

> [!NOTE]
> **Objectif du jour :** Maîtriser le **Hardening complet du protocole SSH** dans un environnement d'entreprise Fortune 500 : déployer une **SSH Certificate Authority (SSH CA)** pour éliminer la gestion des `authorized_keys` statiques, durcir le fichier `sshd_config` conformément au **NIST SP 800-190** et au benchmark **CIS SSH Level 2**, implémenter l'architecture **Jump Host / Bastion (ProxyJump)** pour les accès aux serveurs de production, et auditer les connexions SSH avec rotation automatique des hostkeys.
>
> **Compétences visées :** `SSH-ADV-01` (A) — SSH Certificate Authority Architecture & `sshd_config` NIST SP 800-190 Hardening | `SSH-ADV-02` (A) — Jump Host / Bastion ProxyJump Architecture & SSH Connection Audit Automation

---

## 1) Module — SSH Certificate Authority & Architecture Bastion (2h)

### 📖 Narration/Intuition

La gestion des clés SSH via `authorized_keys` statiques est un cauchemar opérationnel et une faille de sécurité majeure dans les grandes entreprises : chaque départ d'employé nécessite de purger manuellement des centaines de serveurs. L'**SSH CA** permet d'émettre des **certificats SSH à durée de vie courte** (ex: 8 heures), éliminant ce risque sans configuration par serveur.

```
  ┌─────────────────────────────────────────────────────────────────────┐
  │           ARCHITECTURE SSH CA + BASTION ENTERPRISE                  │
  └───────────────────────────────┬─────────────────────────────────────┘
                                  │
     ┌──────────────────┐         │         ┌──────────────────────┐
     │   DÉVELOPPEUR    │         │         │   SSH CA (Vault SSH   │
     │  Demande un Cert │─────────┼─────────│   Secrets Engine)    │
     │  SSH de 8h       │◄────────┼─────────│   Émet le Cert SSH   │
     └──────────────────┘    Cert │         └──────────────────────┘
             │               SSH 8h│
             │                    │
             ▼                    │
  ┌──────────────────────┐        │
  │   BASTION / JUMP HOST│        │
  │   (ProxyJump)        │        │
  │   Enregistre les     │        │
  │   connexions (SIEM)  │        │
  └──────────────────────┘
             │ Tunnelisé via SSH -J
             ▼
  ┌──────────────────────┐
  │ SERVEUR PRODUCTION   │
  │ (Pas d'accès direct  │
  │  depuis Internet)    │
  └──────────────────────┘
```

#### Configuration `sshd_config` Durcie — NIST SP 800-190

```bash
# /etc/ssh/sshd_config — CONFIGURATION ENTERPRISE PARADIS BANK (NIST SP 800-190 + CIS L2)

# Protocole & Version
Protocol 2                          # SSHv1 strictement interdit (vulnérabilités critiques)
Port 2222                           # Port non-standard pour réduire le bruit des scans
AddressFamily inet                  # IPv4 uniquement (adapter si IPv6 requis)

# Algorithmes cryptographiques approuvés (PFS + AEAD)
KexAlgorithms curve25519-sha256,ecdh-sha2-nistp521
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com
HostKeyAlgorithms ssh-ed25519,ecdsa-sha2-nistp521

# Authentification
PermitRootLogin no                  # Compte root jamais accessible via SSH
AuthenticationMethods publickey     # Clé publique ou Certificat SSH obligatoire
PasswordAuthentication no           # Mots de passe interdits (force brute)
PubkeyAuthentication yes
TrustedUserCAKeys /etc/ssh/ssh_ca.pub  # Certificats SSH CA signés acceptés

# Restrictions d'accès
AllowGroups sshusers               # Seul le groupe 'sshusers' peut se connecter
MaxAuthTries 3                     # 3 tentatives max avant déconnexion
LoginGraceTime 30                  # Timeout de login: 30 secondes
MaxSessions 5                      # 5 sessions max par connexion

# Désactivation des fonctionnalités dangereuses
AllowAgentForwarding no            # Agent Forwarding interdit (lateral movement risk)
AllowTcpForwarding no              # Tunneling TCP interdit (exfiltration risk)
X11Forwarding no                   # Forwarding graphique interdit
PermitTunnel no                    # Tunneling réseau interdit

# Logs & Audit
LogLevel VERBOSE                   # Logs complets pour SIEM
```

---

## 2) Module — Outillage SSH Hardening Audit Engine (`ssh_hardening_auditor.py`) (2h)

### 🛠️ Atelier Pratique

```python
import re
import json
from datetime import datetime, timezone
from typing import List, Dict, Tuple

class SSHHardeningAuditor:
    """
    Auditeur de configuration SSH (sshd_config) contre les benchmarks NIST SP 800-190 et CIS SSH Level 2.
    Identifie les directives non conformes et génère un plan de remédiation priorisé.
    """

    # Directives de sécurité SSH obligatoires (NIST SP 800-190 + CIS SSH Level 2)
    REQUIRED_CONFIGS = {
        "Protocol": ("2", "CRITICAL"),
        "PermitRootLogin": ("no", "CRITICAL"),
        "PasswordAuthentication": ("no", "CRITICAL"),
        "AuthenticationMethods": ("publickey", "CRITICAL"),
        "AllowAgentForwarding": ("no", "HIGH"),
        "AllowTcpForwarding": ("no", "HIGH"),
        "X11Forwarding": ("no", "HIGH"),
        "PermitEmptyPasswords": ("no", "CRITICAL"),
        "MaxAuthTries": (lambda v: int(v) <= 4, "HIGH"),
        "LoginGraceTime": (lambda v: int(v) <= 60, "MEDIUM"),
    }

    APPROVED_KEX = {
        "curve25519-sha256", "diffie-hellman-group-exchange-sha256",
        "ecdh-sha2-nistp521", "ecdh-sha2-nistp384"
    }

    APPROVED_CIPHERS = {
        "chacha20-poly1305@openssh.com",
        "aes256-gcm@openssh.com",
        "aes128-gcm@openssh.com"
    }

    DEPRECATED_CIPHERS = {
        "arcfour", "arcfour128", "arcfour256",
        "3des-cbc", "blowfish-cbc", "aes128-cbc", "aes256-cbc"
    }

    def __init__(self, server_hostname: str):
        self.hostname = server_hostname
        self.findings: List[dict] = []

    def audit_sshd_config(self, config_text: str) -> List[dict]:
        """
        Analyse le contenu de /etc/ssh/sshd_config et identifie les non-conformités.
        """
        print(f"[*] Audit SSH sshd_config — Serveur: {self.hostname}")
        parsed = {}

        for line in config_text.strip().splitlines():
            line = line.strip()
            if line and not line.startswith('#'):
                parts = line.split(None, 1)
                if len(parts) == 2:
                    parsed[parts[0]] = parts[1]

        # Vérification des directives obligatoires
        for directive, (expected, severity) in self.REQUIRED_CONFIGS.items():
            current_value = parsed.get(directive)
            if current_value is None:
                self._add_finding(directive, "MISSING", None, expected, severity, f"Directive '{directive}' absente du sshd_config.")
            elif callable(expected):
                try:
                    if not expected(current_value):
                        self._add_finding(directive, "NON_COMPLIANT", current_value, "Voir recommandation", severity, f"Valeur '{current_value}' ne respecte pas le seuil de sécurité.")
                except (ValueError, TypeError):
                    pass
            elif current_value.lower() != str(expected).lower():
                self._add_finding(directive, "NON_COMPLIANT", current_value, str(expected), severity, f"Attendu: '{expected}', Trouvé: '{current_value}'.")

        # Vérification des algorithmes de chiffrement
        if "Ciphers" in parsed:
            configured_ciphers = {c.strip() for c in parsed["Ciphers"].split(",")}
            deprecated_found = configured_ciphers & self.DEPRECATED_CIPHERS
            if deprecated_found:
                self._add_finding("Ciphers", "DEPRECATED_CIPHER", str(deprecated_found), "Approuvés AEAD uniquement", "CRITICAL", f"Suites de chiffrement dépréciées détectées: {deprecated_found}")

        print(f"  [AUDIT] {len(self.findings)} non-conformité(s) détectée(s).")
        return self.findings

    def _add_finding(self, directive: str, issue_type: str, current: str,
                     expected: str, severity: str, detail: str):
        finding = {
            "directive": directive,
            "issue_type": issue_type,
            "current_value": current,
            "expected_value": expected,
            "severity": severity,
            "detail": detail,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.findings.append(finding)
        print(f"  [!] [{severity}] {directive}: {detail}")

    def generate_remediation_plan(self) -> dict:
        """Génère un plan de remédiation priorisé par sévérité."""
        critical = [f for f in self.findings if f["severity"] == "CRITICAL"]
        high = [f for f in self.findings if f["severity"] == "HIGH"]
        return {
            "server": self.hostname,
            "audit_date": datetime.now(timezone.utc).isoformat(),
            "total_findings": len(self.findings),
            "critical_findings": len(critical),
            "high_findings": len(high),
            "remediation_priority": critical + high,
            "compliance_framework": ["NIST SP 800-190", "CIS SSH Benchmark Level 2"]
        }

# Démonstration SSH Hardening Auditor
auditor = SSHHardeningAuditor("SRV-PROD-PARADIS-01")
print("=== SSH HARDENING AUDIT ENGINE ===")

vulnerable_sshd_config = """
Protocol 2
PermitRootLogin yes
PasswordAuthentication yes
X11Forwarding yes
AllowTcpForwarding yes
MaxAuthTries 10
Ciphers aes128-cbc,3des-cbc,aes256-gcm@openssh.com
"""
auditor.audit_sshd_config(vulnerable_sshd_config)

plan = auditor.generate_remediation_plan()
print("\n=== REMEDIATION PLAN ===")
print(json.dumps(plan, indent=2, ensure_ascii=False))
```

---

## 3) Module — Fiche ProxyJump & SSH Certificate Workflow (2h)

```bash
# WORKFLOW COMPLET SSH CERTIFICATE AUTHORITY + PROXYJUMP BASTION

# 1. CÔTÉ SSH CA — Signer une clé publique utilisateur pour 8 heures
ssh-keygen -s /etc/ssh/ssh_ca_user_key \          # Clé privée de la SSH CA
           -I "adolphe@paradis-bank.com" \         # Identity du certificat
           -n "srvadmin,devops" \                  # Principals autorisés
           -V "+8h" \                               # Validité: 8 heures
           ~/.ssh/id_ed25519.pub                    # Clé publique à signer
# Génère: ~/.ssh/id_ed25519-cert.pub

# 2. CÔTÉ SERVEUR — Accepter les certificats SSH CA (1 ligne dans sshd_config)
# TrustedUserCAKeys /etc/ssh/ssh_ca.pub

# 3. CÔTÉ CLIENT — Connexion via Bastion (ProxyJump)
ssh -J bastion.paradis-bank.com:2222 \            # Jump Host intermédiaire
    -i ~/.ssh/id_ed25519 \                         # Clé privée
    admin@srv-prod-01.internal.paradis-bank.com    # Cible finale
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SSH CA** | Secure Shell Certificate Authority — Infrastructure de signature de clés SSH à durée de vie courte |
| **ProxyJump** | Option SSH permettant de tunneliser une connexion via un ou plusieurs hôtes intermédiaires |
| **Bastion Host** | Serveur SSH durci exposé sur Internet servant de point de passage unique pour accéder aux serveurs internes |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quel est l'avantage majeur d'une **SSH Certificate Authority** par rapport à la gestion traditionnelle des `authorized_keys` ?
- A) Elle permet d'émettre des certificats SSH à durée de vie courte (ex: 8 heures), éliminant le risque des clés statiques et la nécessité de purger manuellement les `authorized_keys` sur chaque serveur lors d'un départ d'employé
- B) Elle rend SSH plus rapide
- C) Elle supprime le besoin d'un mot de passe
- D) Elle remplace le protocole TLS

**Réponse : A**

**Q2 :** Pourquoi la directive `AllowAgentForwarding no` est-elle obligatoire dans un `sshd_config` durci ?
- A) Parce que le forwarding de l'agent SSH permet à un serveur compromis d'utiliser l'agent SSH du client pour pivoter vers d'autres serveurs sans connaître les clés privées
- B) Parce que le forwarding d'agent consomme trop de bande passante
- C) Parce que OpenSSH ne supporte plus cette fonctionnalité depuis la version 8.0
- D) Parce que le RGPD interdit les agents SSH

**Réponse : A**

**Q3 :** Quelle est la meilleure suite d'algorithmes d'échange de clés (**KexAlgorithms**) recommandée pour SSH d'entreprise conforme NIST SP 800-190 ?
- A) `curve25519-sha256` et `ecdh-sha2-nistp521` — Algorithmes ECDHE offrant Perfect Forward Secrecy sans les risques historiques de Diffie-Hellman classique
- B) `diffie-hellman-group1-sha1` — Plus stable
- C) `arcfour256` — Plus rapide
- D) `rsa1` — Compatible avec SSHv1

**Réponse : A**

**Q4 :** Quelle option de la commande client `ssh` permet d'établir une connexion à un serveur de production via un bastion intermédiaire (**ProxyJump**) ?
- A) `ssh -J bastion.entreprise.com serveur-cible.internal`
- B) `ssh --via bastion.entreprise.com serveur-cible.internal`
- C) `ssh --proxy bastion.entreprise.com serveur-cible.internal`
- D) `ssh -B bastion.entreprise.com serveur-cible.internal`

**Réponse : A**

**Q5 :** Quel flag de `ssh-keygen -s` détermine la durée de validité d'un certificat SSH signé par la SSH CA ?
- A) Le flag `-V "+8h"` — qui spécifie la fenêtre de validité du certificat (ex: 8 heures)
- B) Le flag `-b 4096`
- C) Le flag `-t rsa`
- D) Le flag `-C "commentaire"`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
