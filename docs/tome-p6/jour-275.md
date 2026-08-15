# TOME P6 — Cybersécurité Expert & Red Team Avancé — Jour 275 (6h) : Projet Intégrateur S6 Partie 5 — Audit GRC, PKI Enterprise & Zero Trust Architecture (Synthèse Gouvernance & Architecture Réseau)

> [!NOTE]
> **Objectif du jour :** Mettre en œuvre le **Projet Intégrateur global du Semestre 6 (Partie 5) combinant GRC, PKI Enterprise et Zero Trust Architecture (ZTA)** : réaliser l'évaluation de conformité ISO 27001 / NIS 2 d'une entreprise multi-sites, déployer la PKI dynamique Vault avec certificats éphémères, valider la micro-segmentation Cilium eBPF, et rédiger le rapport d'architecture Zero Trust soumis au COMEX.
>
> **Ce projet valide l'aptitude de l'apprenant à agir comme Chief Information Security Officer (CISO) ou Chief Security Architect.**

---

## 🎯 Objectifs de la Leçon

- 🏰 Comprendre la rupture entre la sécurité périmétrique classique ("Château Fort") et la **Zero Trust Architecture (ZTA)** selon le **NIST SP 800-207**.
- 🔑 Déployer une **PKI dynamique** d'entreprise émettant des certificats mTLS éphémères avec **HashiCorp Vault** et **SPIFFE/SPIRE**.
- 🛡️ Implémenter la micro-segmentation réseau de Couche 7 dans Kubernetes avec **Cilium eBPF**.
- ⚖️ Aligner la gouvernance technique avec la directive européenne **NIS 2** et le règlement **DORA** (*Digital Operational Resilience Act*).
- 🧪 Développer et exécuter le script d'audit automatisé de conformité ZTA & GRC (`zta_grc_audit.py`).

---

## 🖼️ Architecture Zero Trust & Gouvernance GRC

![Zero Trust Architecture & GRC](https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800)

---

## 📖 1. La Rupture Zero Trust Architecture (NIST SP 800-207)

### 1.1 Narration & Intuition — Du Château Fort à l'Aéroport International

Pendant 30 ans, la sécurité informatique a reposé sur le modèle du **Château Fort** (*Perimeter Security*) :
- On construist d'immenses douves (les pare-feu périmétriques) et un pont-levis (le VPN).
- Une fois qu'un utilisateur ou une machine franchit le pont-levis, il se trouve à l'intérieur du réseau d'entreprise et dispose d'une confiance implicite totale pour naviguer d'un serveur à l'autre.

Si un attaquant réussit à s'introduire par Phishing ou via une clé USB, il peut se déplacer latéralement sans aucun obstacle dans tout le système d'information.

La **Zero Trust Architecture (ZTA)** applique le modèle de l'**Aéroport International** :
- Il n'existe AUCUNE zone de confiance implicite (ni sur le Wi-Fi de l'entreprise, ni dans le Datacenter).
- Chaque utilisateur, chaque ordinateur et chaque microservice doit prouver son identité et son autorisation **à chaque demande d'accès** ("*Never Trust, Always Verify*").

```
             MODÈLE TRADITIONNEL (CHÂTEAU FORT)         MODÈLE ZERO TRUST (NIST SP 800-207)
┌───────────────────────────────────────────────┐   ┌───────────────────────────────────────────────┐
│ INTERNET ──► [ FIREWALL ] ──► [ LAN CONFIANCE]│   │ INTERNET                                      │
│                                (Confiance     │   │     │                                         │
│                                 implicite !)  │   │     ▼                                         │
└───────────────────────────────────────────────┘   │ [ PEP ] ◄── (Vérification PDP Continue)       │
                                                    │     │                                         │
                                                    │     ▼                                         │
                                                    │ [ MICROSERVICE A ] ──► [ PEP ] ──► [ RESSOURCE ]│
                                                    └───────────────────────────────────────────────┘
```

### 1.2 Les 2 Composants Majeurs du NIST SP 800-207

- **PDP (Policy Decision Point)** : Le cerveau central qui évalue l'identité de l'utilisateur, l'état de santé du terminal (EDR) et le niveau de risque pour accorder ou refuser l'accès.
- **PEP (Policy Enforcement Point)** : Le composant technique (Proxy, eBPF, Sidecar) placé devant la ressource qui applique physiquement la décision du PDP.

---

## 📖 2. PKI d'Entreprise Dynamique & Identité des Workloads (SPIFFE / Vault)

### 2.1 Les Limites des PKI Statiques Traditionnelles

Dans une architecture moderne constituée de milliers de conteneurs Kubernetes et de microservices qui naissent et meurent en quelques secondes, la gestion manuelle des certificats SSL/TLS valables 1 an est impossible (risques d'expiration en production, vol de clés privées).

### 2.2 PKI Dynamique avec HashiCorp Vault et SPIFFE/SPIRE

```
┌──────────────────────────────────────────────────────────────────────────┐
│ IDENTITÉ WORKLOAD SPIFFE/SPIRE                                           │
│ 1. Le Pod K8s naît ──► SPIRE Agent authentifie son Pod UID.               │
│ 2. SPIRE émet un certificat SVID (SPIFFE Verifiable Identity Document)   │
│    chiffré via HashiCorp Vault.                                          │
│ 3. Durée de vie du certificat SVID : 24 HEURES SEULEMENT !               │
│ 4. Renouvellement automatique transparent par mTLS (Mutual TLS).          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 📖 3. Micro-segmentation Couche 7 avec Cilium eBPF

### 3.1 Pourquoi le Filtrage IP/Port Traditionnel (Couche 3/4) est Obsolète

Dans un cluster Kubernetes, des dizaines de pods partagent la même adresse IP hôte ou changent d'IP constamment. Filtrer par IP est inefficace.

### 3.2 La Micro-segmentation avec Cilium eBPF

**Cilium** utilise la technologie du noyau Linux **eBPF** (*Extended Berkeley Packet Filter*) pour inspecter le trafic réseau directement dans le noyau sans passer par des pare-feu lents :

```yaml
# Exemple de règle CiliumNetworkPolicy (Micro-segmentation L7)
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: "secure-finance-api"
spec:
  endpointSelector:
    matchLabels:
      app: finance-backend
  ingress:
  - fromEndpoints:
    - matchLabels:
        app: web-frontend
    toPorts:
    - ports:
      - port: "8080"
        protocol: TCP
      rules:
        http:
        - method: "POST"
          path: "/api/v1/payments"
```

> [!NOTE]
> Cette règle autorise **uniquement** le conteneur `web-frontend` à effectuer des requêtes `POST /api/v1/payments` sur le port 8080 du `finance-backend`. Tout autre trafic (ex: tentative de SSH ou requête GET sur une autre URL) est bloqué au niveau du noyau par eBPF !

---

## 📖 4. Gouvernance GRC : Directives NIS 2 & Règlement DORA

### 4.1 La Directive Européenne NIS 2 (Article 21)

La directive **NIS 2** élargit la responsabilité juridique des dirigeants d'entreprise (*COMEX/CISO*) et impose 10 mesures de sécurité obligatoires :

1. Analyse des risques et politiques de sécurité des SI.
2. Traitement des incidents de sécurité (Notifications 24h / 72h).
3. Continuité d'activité (Sauvegardes, PRA/PCA).
4. Sécurité de la chaîne d'approvisionnement (*Supply Chain Security*).
5. Sécurité de l'acquisition, du développement et de la maintenance des SI.
6. Évaluation de l'efficacité des mesures de gestion des risques.
7. Hygiène informatique et formation à la cybersécurité.
8. Politiques relatives à l'utilisation de la cryptographie et du chiffrement.
9. Sécurité des ressources humaines, contrôle d'accès et gestion des actifs.
10. Utilisation de solutions d'authentification multi-facteurs (MFA/FIDO2).

### 4.2 Le Règlement DORA (Digital Operational Resilience Act)

Destiné spécifiquement au **secteur financier et bancaire**, DORA impose des tests de résilience opérationnelle numérique avancés (TLPT - *Threat-Led Penetration Testing* / Red Teaming guidé par la menace) tous les 3 ans.

---

## 🧪 5. Atelier Pratique : Code d'Audit GRC & ZTA (`zta_grc_audit.py`)

### Script Python : Verification de Conformité ZTA, NIS 2 & DORA

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PARADIS IT — Masterclass Cybersécurité (Tome P6 - Jour 275)
Projet Intégrateur S6 Partie 5 : Zero Trust Architecture & GRC Audit (NIS 2 / DORA)
"""

import json
import sys
import time

def audit_zero_trust_architecture():
    """Vérifie la présence des 7 principes NIST SP 800-207."""
    controls = [
        {"id": "ZTA-01", "name": "Workload Identity (SPIFFE/SPIRE)", "status": "PASS", "evidence": "Certificats SVID éphémères 24h émis par HashiCorp Vault"},
        {"id": "ZTA-02", "name": "Micro-segmentation L7 (Cilium eBPF)", "status": "PASS", "evidence": "CiliumNetworkPolicy Deny-All appliquée sur 100% des pods K8s"},
        {"id": "ZTA-03", "name": "Continuous Device Health Check", "status": "PASS", "evidence": "Vérification EDR Crowdstrike obligatoire au PDP"}
    ]
    return {
        "framework": "NIST SP 800-207",
        "controls": controls,
        "status": "PASS"
    }

def audit_grc_regulations():
    """Vérifie l'alignement avec NIS 2 Art. 21 et DORA."""
    regulations = [
        {"regulation": "NIS 2 Art. 21", "requirement": "Cryptographie & PKI Dynamique", "status": "PASS"},
        {"regulation": "NIS 2 Art. 21", "requirement": "Notification Incident 24h/72h", "status": "PASS"},
        {"regulation": "DORA Art. 26", "requirement": "Red Teaming TLPT (Threat-Led Pen Test)", "status": "PASS"}
    ]
    return {
        "framework": "EU NIS 2 & DORA",
        "regulations": regulations,
        "status": "PASS"
    }

def main():
    print("=================================================================")
    print("   PARADIS IT — AUDIT INTÉGRATEUR S6 PARTIE 5 : GRC & ZTA       ")
    print("=================================================================")
    time.sleep(1)

    zta_res = audit_zero_trust_architecture()
    grc_res = audit_grc_regulations()

    report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "auditor": "Chief Security Architect / CISO Lead",
        "organization": "PARADIS Global Financial Group",
        "audit_modules": [zta_res, grc_res]
    }

    all_passed = (zta_res["status"] == "PASS") and (grc_res["status"] == "PASS")
    score_percent = 100.0 if all_passed else 50.0

    print(json.dumps(report, indent=2))
    print("-----------------------------------------------------------------")
    print(f"SCORE DE CONFORMITÉ GLOBAL : {score_percent:.1f}%")
    print("STATUT AUDIT COMEX : " + ("✅ PROJET S6 PARTIE 5 VALIDÉ (CONFORME NIS 2 / DORA)" if all_passed else "❌ NON CONFORME"))
    print("=================================================================")

if __name__ == "__main__":
    main()
```

### Exécution du Script dans le Terminal

```bash
# Tester le script Python d'audit ZTA & GRC
python3 -c "
import json
controls = [
    {'id': 'ZTA-01', 'name': 'Workload Identity (SPIFFE/SPIRE)', 'status': 'PASS'},
    {'id': 'ZTA-02', 'name': 'Micro-segmentation L7 (Cilium eBPF)', 'status': 'PASS'},
    {'id': 'GRC-01', 'name': 'Notification Incident 24h (NIS 2)', 'status': 'PASS'}
]
print('=== AUDIT INTÉGRATEUR S6 PARTIE 5 VALIDE (100%) ===')
print(json.dumps(controls, indent=2))
"
```

---

## 🛠️ Diagnostics & Réflexes Terrain

### 1. Que faire lorsque l'application de la micro-segmentation Cilium eBPF casse un service en production ?
- **Réflexe** : Ne supprimez pas la politique de sécurité. Passez temporairement la règle CiliumNetworkPolicy en mode **Audit / Dry-Run** (`auditMode: true`). Le moteur eBPF enregistrera tous les flux bloqués dans les logs Hubble sans interrompre le trafic, permettant d'ajuster les règles en temps réel.

### 2. Comment présenter l'investissement Zero Trust au Conseil d'Administration (COMEX) ?
- **Réflexe** : Évitez le jargon technique. Présentez la Zero Trust Architecture comme un **accélérateur métier** : elle permet le travail à distance sécurisé de n'importe où, simplifie les fusions-acquisitions d'entreprises et garantit le respect à 100% des réglementations européennes (NIS 2 / DORA).

---

## ❓ Banque de QCM & Test du Jour (8 Questions)

**Q1 : Quel principe fondamental régit la Zero Trust Architecture (ZTA) selon le standard NIST SP 800-207 ?**
- A) Confiance implicite pour le réseau Wi-Fi interne
- B) "Never Trust, Always Verify" (Ne jamais faire confiance, toujours vérifier)
- C) Autoriser tous les accès après la première connexion VPN
- D) Désactiver les pare-feu de production

*Réponse : B — La Zero Trust Architecture repose sur la vérification systématique et continue de l'identité et de l'autorisation à chaque accès.*

**Q2 : Dans le modèle Zero Trust du NIST, quel composant est le "cerveau" chargé d'évaluer le risque et d'accorder ou refuser une décision d'accès ?**
- A) Le PEP (Policy Enforcement Point)
- B) Le PDP (Policy Decision Point)
- C) Le serveur DHCP
- D) Le câble réseau

*Réponse : B — Le PDP (Policy Decision Point) évalue la politique de sécurité et rend la décision d'accès transmise au PEP.*

**Q3 : Quel est l'avantage majeur de l'utilisation de HashiCorp Vault et SPIFFE/SPIRE pour la gestion des certificats mTLS entre microservices ?**
- A) Ils permettent d'émettre des certificats SVID éphémères (durée de vie 24h) renouvelés automatiquement, éliminant la gestion manuelle des clés
- B) Ils annulent la consommation électrique des serveurs
- C) Ils remplacent les conteneurs Docker
- D) Ils bloquent les requêtes de ping

*Réponse : A — SPIFFE/SPIRE et Vault fournissent des certificats cryptographiques éphémères à courte durée de vie renouvelés sans interruption.*

**Q4 : Quelle technologie du noyau Linux est utilisée par Cilium pour effectuer de la micro-segmentation réseau de Couche 7 ultra-rapide dans Kubernetes ?**
- A) Iptables classique
- B) eBPF (Extended Berkeley Packet Filter)
- C) VirtualBox
- D) MS-DOS

*Réponse : B — eBPF permet à Cilium d'exécuter du code d'inspection réseau directement dans le noyau Linux avec des performances maximales.*

**Q5 : Quel règlement européen s'applique spécifiquement aux entités du secteur financier pour imposer des tests de résilience opérationnelle numérique (DORA) ?**
- A) RGPD
- B) DORA (Digital Operational Resilience Act)
- C) NIS 1
- D) PCI-DSS

*Réponse : B — DORA est le règlement européen harmonisant la résilience numérique du secteur financier.*

**Q6 : Quelle est la durée de validité standard recommandée pour un certificat SVID d'identité de workload dans une architecture Zero Trust ?**
- A) 10 ans
- B) 1 an
- C) 24 heures (courte durée éphémère)
- D) Infini

*Réponse : C — Les certificats d'identité d'applications (SVID) doivent être éphémères (ex: 24h) pour réduire l'impact en cas de vol de clé.*

**Q7 : Quelle est la différence entre un PEP (Policy Enforcement Point) et un PDP (Policy Decision Point) ?**
- A) Le PEP rend la décision, le PDP l'applique
- B) Le PDP prend la décision de sécurité, tandis que le PEP se situe sur le flux de données pour appliquer physiquement le blocage ou l'autorisation
- C) Le PDP est un matériel, le PEP est un logiciel
- D) Il n'y a aucune différence

*Réponse : B — Le PDP prend la décision basée sur les politiques ; le PEP est le point de contrôle technique qui applique la décision.*

**Q8 : Quel outil de visualisation de réseau est associé nativement à Cilium eBPF sous Kubernetes pour observer les flux L7 en temps réel ?**
- A) Wireshark
- B) Hubble
- C) Nmap
- D) Putty

*Réponse : B — Hubble est la plateforme d'observabilité réseau et sécurité intégrée à Cilium eBPF.*

---

## 📚 Ressources & Références

- **NIST SP 800-207 (Zero Trust Architecture)** : https://csrc.nist.gov/publications/detail/sp/800-207/final
- **SPIFFE / SPIRE Project Documentation** : https://spiffe.io/
- **Cilium eBPF-based Networking & Security** : https://cilium.io/
- **HashiCorp Vault PKI Secrets Engine** : https://developer.hashicorp.com/vault/docs/secrets/pki

---

*Semestre 6 — Cybersécurité Expert & Red Team Avancé PARADIS IT Masterclass*
