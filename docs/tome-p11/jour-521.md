# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 521 (6h) : Architecture Zero-Trust Avancée : Cadre SABSA, Norme NIST SP 800-207, ZTNA & Convergence SASE

> [!NOTE]
> **Objectifs pédagogiques :**
> - Comprendre l'intégration du cadre d'architecture d'entreprise **SABSA (Sherwood Applied Business Security Architecture)** avec le Zero-Trust
> - Différencier l'accès réseau traditionnel (VPN) du **ZTNA (Zero Trust Network Access)** centré sur l'application
> - Concrétiser la convergence **SASE (Secure Access Service Edge)** alliant réseau SD-WAN et sécurité SSE (SWG, CASB, ZTNA)
> - Évaluer la posture d'accès en temps réel (Continuous Adaptive Risk and Trust Assessment — CARTA)
>
> **Compétences visées :** `SEC-04` (A), `SEC-05` (A) — Advanced Zero-Trust Architecture & SASE

---

## Module 1 — SABSA & Convergence SASE / ZTNA (2h)

### 📖 Intuition & Narration

Le travail hybride et la mobilité ont définitivement brisé le périmètre réseau de l'entreprise. Un employé se connecte depuis un café à Paris sur un PC portable personnel, pour accéder à un ERP hébergé sur AWS et un CRM SaaS (Salesforce).

Tenter de faire passer l'ensemble de ce trafic par un VPN d'entreprise centralisé crée des goulots d'étranglement majeurs et dégrade l'expérience utilisateur.

La convergence **SASE (Secure Access Service Edge)** déplace la sécurité directement dans le Cloud, au plus près de l'utilisateur. **ZTNA (Zero Trust Network Access)** remplace le VPN en accordant un accès granulaire, non pas à l'ensemble du réseau d'entreprise, mais uniquement à **l'application spécifique** demandée, et ce après authentification forte et contrôle de la posture de l'appareil.

### 🔍 Anatomie Technique — Architecture SASE & ZTNA vs VPN

```
ARCHITECTURE CONVERGENTE SASE (SECURE ACCESS SERVICE EDGE)

  [ UTILISATEUR NOMADE / IOT ]
               │
               ▼ [ Tunnel ZTNA Chiffré ]
  ┌────────────────────────────────────────────────────────────────────────┐
  │ CLOUD SSE / SASE POP (Point of Presence Edge)                          │
  │                                                                        │
  │  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
  │  │  ZTNA ENGINE    │  │  SWG (Secure     │  │  CASB (Cloud Access  │  │
  │  │  App Access Only│  │  Web Gateway)    │  │  Security Broker)    │  │
  │  └────────┬────────┘  └──────────────────┘  └──────────────────────┘  │
  └───────────┼────────────────────────────────────────────────────────────┘
              │
      ┌───────┴───────────────────────┐
      ▼                               ▼
  [ ERP sur AWS / K8s ]       [ Application SaaS Salesforce ]
  (Accès granulaire L7)       (Protection des fuites de données)
```

---

## Module 2 — Atelier Pratique : ZTNA Policy & Posture Evaluator (2h)

### 🛠️ Code Python : ZTNA Contextual Access Policy Engine

```python
#!/usr/bin/env python3
"""
PARADIS — ZTNA Contextual Policy & Device Posture Engine (CARTA Framework)
Évalue en continu l'accès à une application sensible selon l'utilisateur, l'appareil et le contexte réseau.
"""

import json
import sys
from dataclasses import dataclass
from datetime import datetime

@dataclass
class DevicePosture:
    is_corporate_managed: bool
    edr_active: bool
    os_patched: bool
    disk_encrypted: bool

@dataclass
class AccessContext:
    user_id: str
    user_role: str
    location_country: str
    ip_address: str
    target_application: str
    device: DevicePosture

class ZTNAPolicyEngine:
    def __init__(self):
        self.allowed_countries = ["FR", "BE", "DE", "LU"]

    def evaluate_access_request(self, context: AccessContext) -> tuple[bool, str]:
        print("=== EVALUATION DE LA POLITIQUE D'ACCÈS ZTNA (ZERO TRUST NETWORK ACCESS) ===")
        print(f"[*] Demande d'accès : Utilisateur '{context.user_id}' → App '{context.target_application}'")

        # 1. Vérification de la géolocalisation et du contexte
        if context.location_country not in self.allowed_countries:
            return False, f"[🚨 ZTNA DENIED] Connexion depuis un pays non autorisé ({context.location_country})"

        # 2. Vérification de la posture de l'appareil (Device Health)
        posture = context.device
        if not posture.edr_active:
            return False, "[🚨 ZTNA DENIED] L'agent EDR/Antivirus n'est pas actif sur le poste !"

        if not posture.disk_encrypted:
            return False, "[🚨 ZTNA DENIED] Le disque dur du poste n'est pas chiffré (BitLocker/FileVault) !"

        # 3. Vérification granulaire du rôle applicatif (Principe du moindre privilège L7)
        if context.target_application == "ERP-FINANCE-CORE" and context.user_role != "FINANCE_ADMIN":
            return False, f"[🚨 ZTNA DENIED] Rôle '{context.user_role}' insuffisant pour accéder à l'ERP Finance."

        return True, "[✅ ZTNA GRANTED] Accès granulaire L7 autorisé à l'application."

if __name__ == "__main__":
    policy = ZTNAPolicyEngine()

    # Scénario : Utilisateur légitime mais poste non conforme (EDR inactif)
    device_bad = DevicePosture(is_corporate_managed=True, edr_active=False, os_patched=True, disk_encrypted=True)
    ctx_bad = AccessContext("user-042", "FINANCE_ADMIN", "FR", "195.154.10.2", "ERP-FINANCE-CORE", device_bad)

    granted, msg = policy.evaluate_access_request(ctx_bad)
    print(f"  Resultat : {msg}")
    if not granted:
        print("\n[⛔ ZTNA ENFORCEMENT] Accès réseau bloqué par la passerelle SASE.")
```

---

## Module 3 — Cadre d'Architecture SABSA & Matrice d'Alignement Business (1h30)

### 🔍 Le Cadre d'Architecture SABSA (Sherwood Applied Business Security Architecture)

SABSA est le standard mondial d'architecture de sécurité d'entreprise aligné sur les besoins métier. Il s'articule en 6 couches de perspectives :

1. **Contextual Architecture** : Les objectifs et contraintes du business.
2. **Conceptual Architecture** : Les concepts de sécurité et la gestion des risques.
3. **Logical Architecture** : Les politiques et règles d'accès.
4. **Physical Architecture** : La conception des composants (SASE, ZTNA, Firewalls).
5. **Component Architecture** : Les outils et protocoles spécifiques (mTLS, SPIFFE).
6. **Operational Architecture** : La gestion au quotidien et les opérations SOC.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SASE** | Secure Access Service Edge — Convergence réseau (SD-WAN) et sécurité cloud (SSE) |
| **ZTNA** | Zero Trust Network Access — Accès sécurisé granulaire par application sans VPN |
| **SWG** | Secure Web Gateway — Passerelle web filtrante et chiffrée |
| **CASB** | Cloud Access Security Broker — Contrôleur de sécurité des applications SaaS |
| **SABSA** | Sherwood Applied Business Security Architecture — Cadre d'architecture de sécurité |

---

## Exercices Pratiques

### Exercice 1 — Différence VPN vs ZTNA

Expliquez la différence majeure en termes d'exposition réseau entre un accès VPN IPsec classique et un accès ZTNA.

**Corrigé guidé :**
Un VPN IPsec classique connecte l'appareil distant au **réseau physique interne complet** (niveau L3). Si le poste distant est infecté, le pirate peut scanner et attaquer l'ensemble des serveurs du réseau.
À l'inverse, le ZTNA établit un tunnel granulaire **niveau applicatif (L7)** vers la seule application autorisée. L'appareil n'a aucune visibilité ni aucun accès au reste du réseau interne.

---

## Banque QCM — 5 Questions

**Q1.** Que désigne l'architecture **SASE (Secure Access Service Edge)** conceptualisée par Gartner ?

- A) Un nouveau type de câble sous-marin.
- B) La convergence dans le Cloud des services réseau (SD-WAN) et des services de sécurité (ZTNA, SWG, CASB). ✅
- C) Une distribution Linux.
- D) Un antivirus gratuit.

**Q2.** Quelle est la différence majeure entre un **VPN d'entreprise traditionnel** et un accès **ZTNA** ?

- A) Le VPN est plus rapide que le Wi-Fi.
- B) Le VPN donne accès à tout le réseau local (L3), tandis que le ZTNA n'accorde l'accès qu'à l'application spécifique demandée (L7) après contrôle de posture. ✅
- C) ZTNA ne fonctionne que sur téléphone portable.
- D) Il n'y a aucune différence.

**Q3.** Quel est le rôle d'un **CASB (Cloud Access Security Broker)** au sein d'une architecture SASE ?

- A) Réparer les serveurs physiques.
- B) Surveiller, sécuriser et appliquer des politiques de sécurité et de prévention des fuites de données (DLP) sur l'utilisation des applications SaaS (Office 365, Salesforce). ✅
- C) Envoyer des SMS aux employés.
- D) Formater les disques durs.

**Q4.** Dans le modèle **CARTA (Continuous Adaptive Risk and Trust Assessment)**, quand l'accès à une application est-il évalué ?

- A) Une seule fois lors de la connexion initiale le matin.
- B) En continu tout au long de la session, en réévaluant constamment la posture de l'appareil et le niveau de risque. ✅
- C) Une fois par an lors de l'anniversaire de l'entreprise.
- D) Jamais.

**Q5.** Combien de couches de perspectives constituent le cadre d'architecture de sécurité d'entreprise **SABSA** ?

- A) 2 couches.
- B) 6 couches de perspectives (Contexte, Conceptuel, Logique, Physique, Composant, Opérationnel). ✅
- C) 100 couches.
- D) 1 seule couche.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
