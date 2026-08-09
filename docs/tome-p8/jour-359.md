# TOME P8 — Blue Team, SOC & SIEM Advanced — Jour 359 (6h) : Zero Trust Architecture & Identity Security (NIST SP 800-207, IAM Hardening, Passwordless FIDO2 MFA, PAM & Identity Analytics)

> [!NOTE]
> **Objectif du jour :** Maîtriser la conception et la surveillance défensive des architectures **Zero Trust (NIST SP 800-207)** et de la **Sécurité des Identités (Identity Threat Detection and Response - ITDR)** : implémenter le modèle **Policy Decision Point (PDP) / Policy Enforcement Point (PEP)**, durcir les infrastructures IAM (Okta, Entra ID, PingFederate), déployer l'authentification **Passwordless FIDO2 / WebAuthn**, gérer les accès à haut privilège avec un **PAM (Privileged Access Management - CyberArk / Teleport)**, et auditer les risques d'usurpation d'identité en temps réel via des moteurs d'Identity Analytics.
>
> **Compétences visées :** `ZT-01` (A) — Zero Trust Architecture Design (NIST SP 800-207 PDP/PEP) | `ZT-02` (A) — ITDR Identity Threat Detection, FIDO2 Passwordless & PAM Engineering

---

## 1) Module — Architecture Zero Trust NIST SP 800-207 & ITDR (2h)

### 📖 Narration/Intuition

Le modèle de sécurité périmétrique traditionnel ("château et douves") est obsolète. Dans une architecture **Zero Trust**, aucun réseau (ni même le LAN d'entreprise) n'est considéré de confiance. Chaque demande d'accès est authentifiée, autorisée et chiffrée de manière continue en fonction du contexte (identité, état de l'appareil, localisation, heure, risque).

```
   [ Utilisateur / Appareil ]  ──► (Demande d'Accès à une Application)
                                           │
                                           ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │ POLICY ENFORCEMENT POINT (PEP - API Gateway / ZTNA Agent)       │
   └───────────────────────────────┬─────────────────────────────────┘
                                   │ (Demande d'Évaluation de Politique)
                                   ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │ POLICY DECISION POINT (PDP - Identity & Access Engine)           │
   │  - Vérification Identité (MFA FIDO2)                            │
   │  - Posture Endpoint (EDR Check)                                 │
   │  - Threat Engine (ITDR Analytics)                               │
   └───────────────────────────────┬─────────────────────────────────┘
                                   │ (Décision: ALLOW / DENY / MFA)
                                   ▼
           [ Accès Accordé pour la Session Spécifique Uniquement ]
```

---

## 2) Module — Outillage Zero Trust PDP & Engine ITDR (`zero_trust_pdp_engine.py`) (2h)

### 🛠️ Atelier Pratique

```python
import json
from datetime import datetime, timezone
from typing import Dict, List, Optional

class ZeroTrustPDPEngine:
    """
    Policy Decision Point (PDP) conforme au standard NIST SP 800-207.
    Évalue les demandes d'accès selon le contexte temps réel (Identité, Device, ITDR Risk).
    """

    def __init__(self, managed_devices: set, revoked_users: set):
        self.managed_devices = managed_devices
        self.revoked_users = revoked_users
        self.access_logs: List[dict] = []

    def evaluate_access_request(self, user_id: str, device_id: str, mfa_type: str, edr_health_status: str, source_ip: str, resource: str) -> dict:
        """
        Évalue une demande d'accès d'un utilisateur vers une ressource sensible.
        MFA Types: FIDO2_WEBAUTHN (Fort), SMS_OTP (Faible / Risqué), NONE.
        """
        now = datetime.now(timezone.utc).isoformat()
        
        # 1. Test Identité Révoquée / Bloquée (ITDR Signal)
        if user_id in self.revoked_users:
            return self._make_decision("DENY", "USER_ACCOUNT_REVOKED_OR_COMPROMISED", user_id, resource, now)

        # 2. Test du niveau d'Authentification MFA (Exigence FIDO2 / Phishing-Resistant)
        if mfa_type != "FIDO2_WEBAUTHN":
            return self._make_decision("DENY", "MFA_NOT_PHISHING_RESISTANT_REQUIRE_FIDO2", user_id, resource, now)

        # 3. Test de la Posture de l'Appareil (Device Compliance & EDR)
        if device_id not in self.managed_devices:
            return self._make_decision("DENY", "UNMANAGED_DEVICE_ACCESS_BLOCKED", user_id, resource, now)

        if edr_health_status != "HEALTHY":
            return self._make_decision("DENY", "ENDPOINT_EDR_HEALTH_CHECK_FAILED", user_id, resource, now)

        # 4. Décision Accordée
        return self._make_decision("ALLOW", "ACCESS_GRANTED_PER_SESSION", user_id, resource, now)

    def _make_decision(self, verdict: str, reason: str, user: str, resource: str, timestamp: str) -> dict:
        decision = {
            "timestamp": timestamp,
            "verdict": verdict,
            "reason": reason,
            "user_id": user,
            "resource": resource
        }
        self.access_logs.append(decision)
        print(f"[{timestamp}] [PDP DECISION] {verdict} -> User:{user} | Resource:{resource} | Reason:{reason}")
        return decision

# Démonstration du PDP Zero Trust
managed_corp_devices = {"DEV-CORP-8801", "DEV-CORP-9902"}
revoked_compromised_users = {"usr_hacker_stolen"}

pdp = ZeroTrustPDPEngine(managed_corp_devices, revoked_compromised_users)

print("=== NIST SP 800-207 ZERO TRUST PDP ENGINE DEMO ===")

# Test 1 : Utilisateur valide avec FIDO2 et appareil conforme (ALLOW)
pdp.evaluate_access_request(
    user_id="user_alice",
    device_id="DEV-CORP-8801",
    mfa_type="FIDO2_WEBAUTHN",
    edr_health_status="HEALTHY",
    source_ip="192.168.1.50",
    resource="CORE_BANKING_SWIFT_API"
)

# Test 2 : Tentative d'accès avec authentification SMS (DENY - Risque Phishing)
pdp.evaluate_access_request(
    user_id="user_bob",
    device_id="DEV-CORP-9902",
    mfa_type="SMS_OTP",
    edr_health_status="HEALTHY",
    source_ip="192.168.1.51",
    resource="CORE_BANKING_SWIFT_API"
)

# Test 3 : Appareil personnel non géré (DENY - Unmanaged Device)
pdp.evaluate_access_request(
    user_id="user_charlie",
    device_id="PERSONAL-LAPTOP-12",
    mfa_type="FIDO2_WEBAUTHN",
    edr_health_status="HEALTHY",
    source_ip="192.168.1.52",
    resource="FINANCE_REPORTS_S3"
)
```

---

## 3) Module — Fiche Comparative des Méthodes MFA & Hardening PAM (2h)

```markdown
# MATRIX COMPARATIVE DES MÉTHODES D'AUTHENTIFICATION MFA

| Méthode MFA | Résistance au Phishing | Vulnérabilité Majeure | Recommandation Zero Trust |
|:---|:---:|:---|:---|
| **SMS OTP** | ❌ Très Faible | SIM Swapping, Interception SS7 | **INTERDIT** pour l'entreprise |
| **Push Mobile** | ⚠️ Faible | MFA Fatigue / Push Prompt Spamming | Utiliser uniquement avec Number Matching |
| **TOTP (Authenticator App)** | 🟡 Moyenne | Phishing via Reverse Proxy (Adversary-in-the-Middle) | Accepté pour les utilisateurs standard |
| **FIDO2 / WebAuthn** | ✅ **100% Résistant** | Aucune vulnérabilité réseau connue | **OBLIGATOIRE** pour les administrateurs et accès sensibles |

---

## HARDENING PRIVILEGED ACCESS MANAGEMENT (PAM)
1. **Zero Standing Privileges (ZSP) :** Aucun compte ne possède de privilèges administrateur permanents. Les accès sont accordés à la demande (Just-In-Time - JIT).
2. **Session Recording & Bastioning (Teleport / CyberArk) :** Enregistrement vidéo et frappes clavier de toutes les sessions de maintenance SSH/RDP.
3. **MFA Enforcement au niveau Bastion :** Obligation FIDO2 lors de chaque ouverture de session d'administration.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PDP / PEP** | Policy Decision Point / Policy Enforcement Point — Composants clés de l'architecture Zero Trust |
| **ITDR** | Identity Threat Detection and Response — Catégorie de sécurité dédiée à la détection des attaques sur l'identité |
| **FIDO2 / WebAuthn** | Standard d'authentification cryptographique sans mot de passe résistant au phishing |
| **PAM** | Privileged Access Management — Solution de sécurisation et de traçabilité des comptes administrateurs |

---

## ❓ Banque de Questions & Test du Jour (5 QCM)

**Q1 :** Dans l'architecture **Zero Trust NIST SP 800-207**, quel est le rôle du **Policy Decision Point (PDP)** ?
- A) Évaluer les politiques d'accès selon l'identité, le contexte et la santé de l'appareil pour décider d'accorder ou refuser l'accès à une ressource
- B) Chiffrer le disque dur du serveur
- C) Gérer les câbles réseau du datacenter
- D) Bloquer les spams de courriels

**Réponse : A**

**Q2 :** Pourquoi la méthode d'authentification **FIDO2 / WebAuthn** est-elle considérée comme la seule véritablement **résistante au phishing (Phishing-Resistant MFA)** ?
- A) Parce qu'elle lie cryptographiquement le défi d'authentification au nom de domaine exact (Origin) du site web, rendant les attaques par faux sites / proxies de phishing (AiTM) inopérantes
- B) Parce qu'elle utilise des codes à 6 chiffres par SMS
- C) Parce qu'elle est gratuite
- D) Parce qu'elle ne nécessite aucun matériel

**Réponse : A**

**Q3 :** Qu'est-ce que l'attaque par **MFA Fatigue (Push Spamming)** ?
- A) Une technique où l'attaquant inonde le téléphone de la victime de notifications Push d'authentification jusqu'à ce que celle-ci finisse par cliquer sur "Approuver" par agacement
- B) Une panne de batterie du smartphone
- C) Un virus qui détruit la carte SIM
- D) Une coupure de réseau Wi-Fi

**Réponse : A**

**Q4 :** Quel est le principe du **Zero Standing Privileges (ZSP)** dans une solution PAM moderne ?
- A) Supprimer tous les accès administrateurs permanents et n'accorder des privilèges d'administration que de manière temporaire (Just-In-Time) après approbation
- B) Donner des droits administrateurs à tous les employés
- C) Ne jamais changer les mots de passe root
- D) Désactiver l'authentification sur les serveurs

**Réponse : A**

**Q5 :** Dans le modèle Zero Trust, une décision d'accès accordée est-elle valable indéfiniment ?
- A) Non, l'accès est accordé uniquement pour la session ou la transaction spécifique, et est réévalué en continu si la posture de l'appareil ou le niveau de risque change
- B) Oui, elle est valable 10 ans
- C) Oui, tant que l'ordinateur ne redémarre pas
- D) Oui, si l'utilisateur est un directeur

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
