# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 382 (6h) : Active Directory Red Team — BloodHound Attack Path Analysis, Lateral Movement (WMI/PSExec/SMB), Pass-the-Hash & Domain Privilege Escalation

> [!NOTE]
> **Objectif du jour :** Maîtriser les techniques d'attaque Red Team ciblant **Active Directory** dans une mission de compromission de domaine complète : cartographier les chemins d'attaque avec **BloodHound / SharpHound**, exploiter les relations de confiance AD (ACLs, GPO Abuse, AdminTo), effectuer des mouvements latéraux avancés (**WMI Remote Execution, PSExec, SMB Admin Shares**), utiliser **Pass-the-Hash (PtH)** et **Pass-the-Ticket (PtT)** pour pivoter sans connaître les mots de passe en clair.
>
> **Compétences visées :** `RED-AD-01` (A) — BloodHound Attack Path Analysis & ACL Abuse | `RED-AD-02` (A) — WMI/PSExec Lateral Movement, Pass-the-Hash & Domain Admin Escalation

---

## 1) Module — Cartographie BloodHound & Chemins d'Attaque AD (2h)

### 📖 Narration/Intuition

Active Directory est un graphe de relations de confiance. **BloodHound** modélise ce graphe et identifie les chemins de moindre résistance menant d'un compte standard à **Domain Admin** — souvent en 3 à 5 pivots seulement.

```
  [ COMPTE COMPROMIS INITIAL : j.dupont (Helpdesk) ]
                    │
                    │ AdminTo (Droits Admin Local sur WKSTN-MGMT-01)
                    ▼
  [ WKSTN-MGMT-01 ] ─────────────────────────────────────────────────┐
                    │                                                 │
                    │ Session Active de "svc_backup" (Service Account)│
                    │ → Extraction NTLM via Mimikatz (Token/Memory)   │
                    ▼                                                 │
  [ HASH NTLM svc_backup ] ──────────────────────────────────────────┤
                    │                                                 │
                    │ Pass-the-Hash → SRV-BACKUP-01                  │
                    │ → svc_backup a "WriteDACL" sur DOMAIN ADMINS    │
                    ▼                                                 │
  [ DOMAINE COMPROMIS : Domain Admin obtenu ] ◄────────────────────────┘
```

#### Requêtes BloodHound Cypher pour l'Analyse de Chemins d'Attaque

```cypher
-- Chemin le plus court de tout compte non-privilégié vers Domain Admins
MATCH p=shortestPath((u:User {admincount: false})-[*1..]->(g:Group {name:"DOMAIN ADMINS@PARADIS.INTERNAL"}))
RETURN p

-- Comptes avec le droit WriteDACL ou GenericAll sur des OU critiques
MATCH (u:User)-[r:WriteDACL|GenericAll|Owns]->(t:OU)
RETURN u.name, type(r), t.name ORDER BY t.name

-- Comptes avec sessions actives sur des serveurs à haut privilège
MATCH (u:User)-[r:HasSession]->(c:Computer) WHERE c.name =~ ".*DC.*|.*SRV.*"
RETURN u.name, c.name
```

---

## 2) Module — Outillage AD Attack Simulation Engine (`ad_attack_simulation.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Optional

class ADAttackSimulationEngine:
    """
    Simulateur d'attaque Active Directory Red Team.
    Modélise les chemins d'attaque BloodHound, le Pass-the-Hash et les mouvements latéraux.
    """

    def __init__(self, domain: str, operator: str):
        self.domain = domain
        self.operator = operator
        self.compromised_accounts: Dict[str, dict] = {}
        self.attack_path: List[dict] = []

    def compromise_account(self, username: str, method: str, source_host: str, ntlm_hash: str = None) -> dict:
        """Enregistre la compromission d'un compte AD."""
        account = {
            "username": f"{self.domain}\\{username}",
            "compromise_method": method,
            "source_host": source_host,
            "ntlm_hash": ntlm_hash or hashlib.md5(f"mock_{username}".encode()).hexdigest().upper(),
            "compromised_at": datetime.now(timezone.utc).isoformat()
        }
        self.compromised_accounts[username] = account
        step = {
            "step": len(self.attack_path) + 1,
            "action": f"ACCOUNT_COMPROMISED: {self.domain}\\{username}",
            "method": method,
            "details": account
        }
        self.attack_path.append(step)
        print(f"  [STEP {step['step']}] 💀 Compte compromis: {account['username']} via {method}")
        return account

    def perform_pass_the_hash(self, stolen_account: str, target_host: str, target_service: str) -> dict:
        """
        Simule un Pass-the-Hash (PtH) en utilisant le hash NTLM d'un compte compromis
        pour s'authentifier sur un hôte distant sans connaître le mot de passe en clair.
        Protocoles : SMB / DCOM / WMI (tous supportent NTLMv2)
        """
        if stolen_account not in self.compromised_accounts:
            return {"status": "ERROR", "message": "Compte non compromis"}

        account = self.compromised_accounts[stolen_account]
        step = {
            "step": len(self.attack_path) + 1,
            "action": "PASS_THE_HASH",
            "attacker_account": account["username"],
            "ntlm_hash_used": account["ntlm_hash"][:16] + "...",
            "target_host": target_host,
            "target_service": target_service,
            "status": "SUCCESS_LATERAL_MOVEMENT"
        }
        self.attack_path.append(step)
        print(f"  [STEP {step['step']}] 🔑 Pass-the-Hash: {account['username']} → {target_host}/{target_service}")
        return step

    def execute_wmi_remote(self, executing_account: str, target_host: str, command: str) -> dict:
        """
        Simule l'exécution d'une commande distante via WMI (Windows Management Instrumentation).
        WMI est natif Windows et souvent autorisé par les règles de firewall internes.
        """
        step = {
            "step": len(self.attack_path) + 1,
            "action": "WMI_REMOTE_EXECUTION",
            "account": f"{self.domain}\\{executing_account}",
            "target": target_host,
            "command_executed": command,
            "detection_risk": "MEDIUM (Event ID 4688 + WMI Subscriptions)"
        }
        self.attack_path.append(step)
        print(f"  [STEP {step['step']}] ⚡ WMI Exec sur {target_host}: {command[:50]}...")
        return step

    def generate_attack_path_report(self) -> dict:
        """Génère le rapport complet du chemin d'attaque AD (pour handoff Blue Team)."""
        return {
            "operator": self.operator,
            "target_domain": self.domain,
            "report_date": datetime.now(timezone.utc).isoformat(),
            "total_steps": len(self.attack_path),
            "compromised_accounts": list(self.compromised_accounts.keys()),
            "attack_path_chain": self.attack_path
        }

# Démonstration Simulation Red Team AD
rt = ADAttackSimulationEngine("PARADIS", "RT_OPERATOR_ALPHA")

print("=== ACTIVE DIRECTORY RED TEAM ATTACK SIMULATION ===")

# Étape 1 : Compromission initiale via Phishing
rt.compromise_account("j.dupont", method="PHISHING_EMAIL_CREDENTIAL_HARVEST", source_host="WKSTN-FINANCE-01")

# Étape 2 : Extraction du hash du compte Service via Mimikatz (LSASS)
rt.compromise_account("svc_backup", method="MIMIKATZ_LSASS_DUMP_FROM_WKSTN-MGMT-01", source_host="WKSTN-MGMT-01")

# Étape 3 : Pass-the-Hash vers le serveur backup
rt.perform_pass_the_hash("svc_backup", target_host="SRV-BACKUP-01", target_service="CIFS/SMB")

# Étape 4 : WMI Remote Execution pour déployer le Beacon sur le serveur
rt.execute_wmi_remote("svc_backup", "SRV-BACKUP-01", "powershell -Enc SQBFAFgA... # Deploy Beacon")

# Étape 5 : DCSync (svc_backup a WriteDACL → Auto-Grant réplication)
rt.compromise_account("Administrator", method="DCSYNC_VIA_DRSUAPI_REPLICATION_RIGHTS", source_host="SRV-BACKUP-01", ntlm_hash="KRBTGT_HASH_DOMAIN_ADMIN")

print("\n=== ATTACK PATH REPORT (BLUE TEAM HANDOFF) ===")
print(json.dumps(rt.generate_attack_path_report(), indent=2, ensure_ascii=False))
```

---

## 3) Module — Fiche des Techniques de Mouvement Latéral (2h)

```markdown
# MATRICE DES TECHNIQUES DE MOUVEMENT LATÉRAL ACTIVE DIRECTORY

| Technique | Protocole / Mécanisme | Prérequis | Détection Blue Team |
|:---|:---|:---|:---|
| **Pass-the-Hash (PtH)** | NTLMv2 (SMB/DCOM/WMI) | Hash NTLM d'un compte admin local | Event ID 4624 (Logon Type 3) + Source IP anormale |
| **Pass-the-Ticket (PtT)** | Kerberos TGT/TGS | Ticket Kerberos volé (en mémoire) | Event ID 4768/4769 depuis IP non-DC |
| **WMI Remote Execution** | DCOM/WMI (port 135/49152+) | Admin local sur la cible | Event ID 4688 + WMI Subscription creation |
| **PSExec / SMBExec** | SMB (port 445) | Admin local + pipe ADMIN$ accessible | Event ID 7045 (New Service Created) |
| **DCOM Lateral Movement** | DCOM (MMC20.Application, etc.) | Admin local | Event ID 4688 + DCOM AppID dans le registre |
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **BloodHound** | Outil d'analyse des chemins d'attaque Active Directory basé sur un graphe Neo4j |
| **PtH** | Pass-the-Hash — Technique d'authentification utilisant le hash NTLM sans connaître le mot de passe |
| **WriteDACL** | Droit AD permettant de modifier la liste des contrôles d'accès d'un objet AD |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quel est l'avantage stratégique de **BloodHound** pour un Red Team ciblant Active Directory ?
- A) Il modélise l'ensemble du graphe de relations de confiance AD et identifie automatiquement le chemin de moindre résistance menant d'un compte standard à Domain Admin
- B) Il chiffre les communications réseau
- C) Il génère automatiquement des rapports Word
- D) Il remplace le contrôleur de domaine

**Réponse : A**

**Q2 :** Comment fonctionne l'attaque **Pass-the-Hash (PtH)** ?
- A) En réutilisant le hash NTLM d'un compte pour s'authentifier sur un service Windows distant via NTLMv2, sans jamais avoir besoin de connaître le mot de passe en clair
- B) En cassant le mot de passe par force brute
- C) En interceptant un certificat TLS
- D) En modifiant le fichier hosts de la victime

**Réponse : A**

**Q3 :** Quel **Event ID** Windows Security permet à la Blue Team de détecter un **mouvement latéral réussi** via Pass-the-Hash (Logon réseau de type NTLM) ?
- A) Event ID 4624 (An account was successfully logged on) avec Logon Type 3 (Network) et Authentication Package NtLmSsp depuis une source IP anormale
- B) Event ID 7045 (New service installed)
- C) Event ID 4688 (A new process has been created)
- D) Event ID 4648 (Logon using explicit credentials)

**Réponse : A**

**Q4 :** Pourquoi le **WMI Remote Execution** est-il particulièrement furtif comparé à PSExec pour le mouvement latéral ?
- A) Parce que WMI est un protocole natif Windows omniprésent dans les environnements d'entreprise, souvent autorisé par les règles de firewall internes et ne crée pas de service visible (contrairement à PSExec)
- B) Parce qu'il ne génère aucun log
- C) Parce qu'il utilise le port 80 uniquement
- D) Parce qu'il nécessite Java

**Réponse : A**

**Q5 :** Quelle relation d'objet AD BloodHound (ACL Edge) permet à un compte de s'auto-attribuer des droits de réplication (**DCSync**) ?
- A) **WriteDACL** ou **GenericAll** — ces droits permettent de modifier les ACLs de l'objet domaine racine pour s'y ajouter les GUIDs de réplication
- B) La relation `HasSession`
- C) La relation `AdminTo`
- D) La clé de registre `HKCU\Run`

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
