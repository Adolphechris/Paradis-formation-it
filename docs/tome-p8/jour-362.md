# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 362 (6h) : Active Directory Attack Detection — Advanced Analytics (DCSync, Golden/Silver Ticket, Kerberoasting, AS-REP Roasting & Shadow Credentials)

> [!NOTE]
> **Objectif du jour :** Maîtriser la détection et la chasse aux attaques avancées ciblant l'infrastructure **Active Directory (AD)** : corréler les journaux d'événements critiques Windows Security (Event IDs 4662, 4768, 4769, 4738, 5136) et Sysmon pour intercepter le **DCSync (Replication Abuse)**, les **Golden/Silver Tickets (Kerberos Forgery)**, le **Kerberoasting**, l'**AS-REP Roasting** et les **Shadow Credentials (msDS-KeyCredentialLink Injection)**.
>
> **Compétences visées :** `AD-SEC-01` (A) — Windows Security Event Log Correlation & Kerberos Attack Detection | `AD-SEC-02` (A) — DCSync, Shadow Credentials & Ticket Forgery Detection Engineering

---

## 1) Module — Matrice de Détection des Attaques Active Directory (2h)

### 📖 Narration/Intuition

Active Directory est la cible prioritaire de 90% des attaques d'entreprise. Les attaquants exploitent les faiblesses du protocole **Kerberos** et des autorisations d'objets Active Directory (ACLs) pour pivoter et obtenir le contrôle du domaine (`Domain Admin`).

```
 [ ATTAQUANT (Compte Compromis) ]
                │
                ├── 1. Kerberoasting / AS-REP Roasting ────► Event ID 4769 / 4768 (Encryption: RC4/0x17)
                ├── 2. Shadow Credentials Injection ───────► Event ID 5136 (msDS-KeyCredentialLink)
                ├── 3. DCSync Replication Abuse ──────────► Event ID 4662 (DS-Replication-Get-Changes-All)
                └── 4. Golden Ticket Forgery ──────────────► Event ID 4768 (TGT sans Event ID 4768 préalable!)
```

#### Event IDs Windows Critiques pour la Surveillance AD

| Event ID | Event Name | Signal d'Attaque / Anomale |
|:---:|:---|:---|
| **4662** | An operation was performed on an object | Exécution d'un **DCSync** (Accès aux GUIDs de réplication `1131f6aa-...`) |
| **4768** | Kerberos TGT Requested (AS-REQ) | **AS-REP Roasting** (Comptes sans pré-authentification Kerberos `DONT_REQ_PREAUTH`) |
| **4769** | Kerberos TGS Requested | **Kerberoasting** (Demande TGS avec chiffrement faible `RC4-HMAC / 0x17`) |
| **5136** | Directory Service Object Modified | **Shadow Credentials** (Modifications de l'attribut `msDS-KeyCredentialLink`) |
| **4738** | A user account was changed | Modification de compte (activation de pré-auth Kerberos ou SPN) |

---

## 2) Module — Outillage AD Threat Detection Engine (`ad_attack_detector.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import List, Dict

class ADAttackDetector:
    """
    Moteur de corrélation de journaux d'événements Windows Security/Sysmon
    spécialisé dans la détection des attaques Active Directory avancées.
    """

    # GUIDs de réplication Active Directory associés à l'attaque DCSync
    DCSYNC_RIGHTS_GUIDS = {
        "1131f6aa-9c0e-11d1-b79e-00a0c909c37b", # DS-Replication-Get-Changes
        "1131f6ad-9c0e-11d1-b79e-00a0c909c37b"  # DS-Replication-Get-Changes-All
    }

    def __init__(self, domain_controllers_ips: set):
        self.dc_ips = domain_controllers_ips
        self.alerts: List[dict] = []

    def analyze_event_log(self, event: dict) -> float:
        """Analyse un événement Windows Security et retourne un score de menace."""
        event_id = event.get("event_id")
        src_ip = event.get("src_ip", "")
        user = event.get("user", "")
        event_data = event.get("event_data", {})

        # 1. Détection DCSync (Event ID 4662)
        if event_id == 4662:
            properties = event_data.get("properties", "").lower()
            if any(guid.lower() in properties for guid in self.DCSYNC_RIGHTS_GUIDS):
                # Si la source n'est pas un contrôleur de domaine légitime -> DCSYNC ATTACK !
                if src_ip not in self.dc_ips:
                    self._raise_ad_alert(
                        rule_id="AD-ALT-001",
                        name="DCSync Replication Abuse Detected",
                        severity="CRITICAL",
                        mitre_id="T1003.006",
                        details=f"Le compte {user} depuis l'IP non-DC {src_ip} a demandé les droits de réplication Active Directory !"
                    )

        # 2. Détection Kerberoasting (Event ID 4769 avec chiffrement RC4 / 0x17)
        elif event_id == 4769:
            ticket_options = event_data.get("ticket_options", "")
            enc_type = event_data.get("ticket_encryption_type", "")
            service_name = event_data.get("service_name", "")

            # EncType 0x17 = RC4-HMAC (Méthode de chiffrement vulnérable recherchée par Kerberoasting)
            if enc_type in ["0x17", "23"] and not service_name.endswith("$"):
                self._raise_ad_alert(
                    rule_id="AD-ALT-002",
                    name="Kerberoasting Ticket Request (RC4)",
                    severity="HIGH",
                    mitre_id="T1558.003",
                    details=f"Demande de ticket TGS Kerberos vulnérable (RC4) par {user} pour le service {service_name}."
                )

        # 3. Détection Shadow Credentials (Event ID 5136 sur msDS-KeyCredentialLink)
        elif event_id == 5136:
            attribute_name = event_data.get("attribute_syntax_name", "")
            if "msDS-KeyCredentialLink" in attribute_name:
                self._raise_ad_alert(
                    rule_id="AD-ALT-003",
                    name="Shadow Credentials Injection (Whispersmith)",
                    severity="CRITICAL",
                    mitre_id="T1556",
                    details=f"Modification de l'attribut msDS-KeyCredentialLink sur l'objet {event_data.get('object_dn')} par {user} !"
                )

    def _raise_ad_alert(self, rule_id: str, name: str, severity: str, mitre_id: str, details: str):
        alert = {
            "alert_id": f"AD-ALERT-{len(self.alerts)+1:03d}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "rule_id": rule_id,
            "rule_name": name,
            "severity": severity,
            "mitre_technique": mitre_id,
            "details": details
        }
        self.alerts.append(alert)
        print(f"[!] ALERTE AD [{severity}] {name} ({mitre_id}) -> {details}")

# Simulation d'Investigation AD SOC
domain_controllers = {"10.0.0.1", "10.0.0.2"} # IPs légitimes des DCs
detector = ADAttackDetector(domain_controllers)

print("=== AD THREAT DETECTION ENGINE DEMO ===")

# Test 1 : DCSync depuis un poste de travail (10.0.4.55) -> Vrai Positif
detector.analyze_event_log({
    "event_id": 4662,
    "src_ip": "10.0.4.55",
    "user": "paradis\\attacker_user",
    "event_data": {"properties": "{1131f6aa-9c0e-11d1-b79e-00a0c909c37b}"}
})

# Test 2 : Kerberoasting avec chiffrement RC4 (0x17)
detector.analyze_event_log({
    "event_id": 4769,
    "src_ip": "10.0.4.55",
    "user": "paradis\\attacker_user",
    "event_data": {"ticket_encryption_type": "0x17", "service_name": "MSSQLSvc/db01.paradis.internal:1433"}
})

# Test 3 : Shadow Credentials Injection sur le contrôleur de domaine
detector.analyze_event_log({
    "event_id": 5136,
    "src_ip": "10.0.4.55",
    "user": "paradis\\attacker_user",
    "event_data": {"attribute_syntax_name": "msDS-KeyCredentialLink", "object_dn": "CN=DC01,OU=Domain Controllers,DC=paradis,DC=internal"}
})

print("\n=== SUMMARY OF AD SECURITY ALERTS ===")
print(json.dumps(detector.alerts, indent=2, ensure_ascii=False))
```

---

## 3) Module — Directives de Sécurisation & Hardening AD (2h)

```markdown
# ACTIVE DIRECTORY HARDENING & DEFENSIVE CONTROLS

## 1. Protection contre DCSync
- **Audit des ACLs :** Restreindre strictement les droits `Replication-Get-Changes` et `Replication-Get-Changes-All` aux seuls comptes de contrôleurs de domaine (`Domain Controllers` et `Enterprise Read-Only Domain Controllers`).
- **Alerte SIEM :** Règle de corrélation bloquante sur tout Event ID 4662 émis par un hôte non répertorié comme DC.

## 2. Hardening Kerberos (Anti-Kerberoasting & AS-REP Roasting)
- **Désactiver RC4-HMAC :** Forcer l'utilisation d'AES-128 et AES-256 pour Kerberos via GPO (`Network security: Configure encryption types allowed for Kerberos`).
- **Mots de passe SPN complexes :** Définir des mots de passe d'au moins 25 caractères aléatoires pour tous les comptes de service associés à un SPN.
- **Activer la Pré-authentification :** S'assurer qu'aucun compte n'a l'option `DONT_REQ_PREAUTH` cochée dans Active Directory.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **DCSync** | Technique d'attaque simulant un contrôleur de domaine via le protocole MS-DRSR pour extraire les hashes NTLM |
| **SPN** | Service Principal Name — Identifiant unique associant une instance de service à un compte utilisateur Active Directory |
| **AS-REP Roasting** | Attaque ciblant les comptes utilisateurs AD configurés sans pré-authentification Kerberos requise |
| **Shadow Credentials** | Technique d'injection d'une clé RSA dans l'attribut `msDS-KeyCredentialLink` pour obtenir des TGTs Kerberos sans changer le mot de passe |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Quel événement Windows Security (`Event ID`) et quel type de droits sont caractéristiques d'une attaque par **DCSync** ?
- A) Event ID 4662 avec la présence des GUIDs de réplication `DS-Replication-Get-Changes` depuis une IP qui n'est pas un contrôleur de domaine
- B) Event ID 4624 (Logon réussi)
- C) Event ID 1102 (Journal effacé)
- D) Event ID 7045 (Nouveau service installé)

**Réponse : A**

**Q2 :** Pourquoi la présence du type de chiffrement **0x17 (RC4-HMAC)** lors d'une demande de ticket TGS (Event ID 4769) est-elle un signal fort de **Kerberoasting** ?
- A) Parce que les attaquants sollicitent sciemment des billets Kerberos chiffrés en RC4 (plus facile et rapide à craquer hors-ligne par force brute que l'AES-256)
- B) Parce que le RC4 est le seul protocole supporté par Windows 11
- C) Parce que cela indique une connexion SSL
- D) C'est une erreur de carte réseau

**Réponse : A**

**Q3 :** Comment fonctionne l'attaque par **Shadow Credentials (msDS-KeyCredentialLink)** ?
- A) L'attaquant injecte une clé publique RSA dans l'attribut `msDS-KeyCredentialLink` d'un compte cible, lui permettant ensuite de s'authentifier via PKINIT et d'obtenir un TGT Kerberos sous l'identité de la cible sans modifier son mot de passe
- B) Il supprime le compte utilisateur
- C) Il modifie le registre local du poste client
- D) Il envoie un mail de phishing au support

**Réponse : A**

**Q4 :** Quelle est la mesure de remédiation la plus efficace pour neutraliser totalement le risque de crack de mots de passe par **Kerberoasting** ?
- A) Forcer des mots de passe très longs et complexes (> 25 caractères) pour les comptes de service associés aux SPNs, ou migrer vers des gMSA (Group Managed Service Accounts) dont les mots de passe sont gérés automatiquement par AD
- B) Supprimer le pare-feu
- C) Désactiver le protocole IPV6
- D) Réduire la taille de la mémoire RAM

**Réponse : A**

**Q5 :** Quel attribut Active Directory doit être surveillé via l'Event ID 4768 pour repérer les vulnérabilités à l'**AS-REP Roasting** ?
- A) L'option `DONT_REQ_PREAUTH` (UF_DONT_REQUIRE_PREAUTH) qui permet de demander un TGT Kerberos sans connaître le mot de passe initial
- B) La photo de profil de l'utilisateur
- C) Le numéro de téléphone de l'utilisateur
- D) L'adresse physique du bureau

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
