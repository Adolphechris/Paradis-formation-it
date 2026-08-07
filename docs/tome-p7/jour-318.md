# TOME P7 — Certifications d'Élite & Spécialisations — Jour 318 (6h) : CISSP Intensive — Security Architecture (SABSA, Defense-in-Depth, Threat Modeling STRIDE & Zero Trust Architecture Principles)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **domaine 3 CISSP (Security Architecture and Engineering)** : appliquer le cadre d'architecture de sécurité **SABSA (Sherwood Applied Business Security Architecture)**, concevoir une défense en profondeur (**Defense-in-Depth**) multi-couches, conduire un **Threat Modeling STRIDE** sur un système bancaire, et appliquer les **8 principes du Zero Trust** selon NIST SP 800-207 à une architecture d'entreprise.
>
> **Compétences visées :** `CISSP-01` (A) — SABSA Architecture Framework & Defense-in-Depth | `CISSP-02` (A) — STRIDE Threat Modeling & Zero Trust Principles

---

## 1) Module — SABSA Framework & Defense-in-Depth (2h)

### 📖 Narration/Intuition

**SABSA** (Sherwood Applied Business Security Architecture) est le cadre d'architecture de sécurité d'entreprise de référence. Il structure l'architecture en **6 couches** alignées du business vers la technologie :

| Couche SABSA | Perspective | Question Clé |
|:------------:|:-----------:|:------------|
| **Contextuelle** | Business | Pourquoi ? (Drivers business) |
| **Conceptuelle** | Architecte | Quoi ? (Concepts & principes) |
| **Logique** | Designer | Qui/Où/Quand ? (Services logiques) |
| **Physique** | Ingénieur | Comment ? (Infrastructure) |
| **Composant** | Technicien | Avec quoi ? (Produits/outils) |
| **Opérationnelle** | Opérateur | Quand/Comment utiliser ? |

---

## 2) Module — Threat Modeling STRIDE (`stride_threat_model.py`) (2h)

### 🛠️ Atelier Pratique

```python
# STRIDE Threat Modeling — Application Banking API PARADIS BANK
# STRIDE = Spoofing, Tampering, Repudiation, Info Disclosure, Denial of Service, Elevation

threat_model = {
    "system": "API Gateway de Paiement — PARADIS BANK",
    "components": [
        {
            "name": "Client Mobile App",
            "threats": [
                {
                    "category": "S — Spoofing",
                    "threat": "Un attaquant usurpe l'identité d'un client via un token JWT volé",
                    "mitigation": "JWT à courte durée de vie (15min) + Refresh Token Rotation + JTI Blacklisting",
                    "stride_letter": "S"
                },
                {
                    "category": "T — Tampering",
                    "threat": "Modification des montants de transaction dans la requête HTTP",
                    "mitigation": "Signature HMAC-SHA256 du corps de la requête + Validation serveur",
                    "stride_letter": "T"
                }
            ]
        },
        {
            "name": "API Gateway (Kong / AWS API GW)",
            "threats": [
                {
                    "category": "D — Denial of Service",
                    "threat": "Flood de requêtes API épuisant les resources (HTTP Flood L7)",
                    "mitigation": "Rate Limiting (100 req/min/IP) + AWS Shield Advanced + WAF",
                    "stride_letter": "D"
                },
                {
                    "category": "I — Information Disclosure",
                    "threat": "Réponses d'erreur verbose exposant la stack technique",
                    "mitigation": "Messages d'erreur génériques côté client + Logs détaillés côté serveur uniquement",
                    "stride_letter": "I"
                }
            ]
        },
        {
            "name": "Base de Données PostgreSQL",
            "threats": [
                {
                    "category": "E — Elevation of Privilege",
                    "threat": "Injection SQL escaladant vers le compte DB sa/postgres",
                    "mitigation": "Requêtes préparées (Prepared Statements) + Compte DB least-privilege en lecture seule",
                    "stride_letter": "E"
                },
                {
                    "category": "R — Repudiation",
                    "threat": "Un opérateur nie avoir modifié des enregistrements de transactions",
                    "mitigation": "Audit trail PostgreSQL (pgaudit) + Logs immuables S3 avec CloudTrail",
                    "stride_letter": "R"
                }
            ]
        }
    ]
}

def print_stride_report():
    print(f"=== STRIDE THREAT MODEL — {threat_model['system']} ===\n")
    for comp in threat_model['components']:
        print(f"Composant : [{comp['name']}]")
        for t in comp['threats']:
            print(f"  [{t['stride_letter']}] {t['threat']}")
            print(f"     → Mitigation : {t['mitigation']}\n")

print_stride_report()
```

---

## 3) Module — Les 7 Tenets Zero Trust NIST SP 800-207 (2h)

```markdown
# ZERO TRUST ARCHITECTURE — 7 PRINCIPES NIST SP 800-207 (CISSP Domain 3)

## Tenet 1 : All sources are considered resources
Tous les types d'actifs (devices, données, applications, microservices, IoT) sont
considérés comme des ressources à protéger, quelle que soit leur localisation.

## Tenet 2 : All communication is secured regardless of location
Aucun réseau n'est "de confiance" — tout le trafic (LAN inclus) doit être chiffré
et authentifié (mTLS, TLS 1.3+, HTTPS everywhere).

## Tenet 3 : Access is granted per-session
L'accès à une ressource est accordé pour une session spécifique uniquement,
après vérification systématique de l'identité, du device et du contexte.

## Tenet 4 : Access determined by dynamic policy
La décision d'accès est basée sur une politique dynamique (Behavioral Analytics,
posture du device, heure, localisation) — pas sur un périmètre statique.

## Tenet 5 : All assets are monitored
L'intégrité et la posture de sécurité de tous les actifs (endpoints, workloads)
sont surveillées en continu (EDR, MDM, CSPM).

## Tenet 6 : Authentication and authorization are strictly enforced
MFA obligatoire, identité vérifiée pour chaque accès, principe du moindre privilège.

## Tenet 7 : Data collected to improve security posture
Toutes les données d'accès et de comportement sont collectées pour améliorer
continuellement la posture de sécurité (SIEM, UEBA, ML).
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SABSA** | Sherwood Applied Business Security Architecture — Cadre d'architecture de sécurité d'entreprise |
| **STRIDE** | Threat Modeling framework : Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation |
| **CISSP** | Certified Information Systems Security Professional — Certification (ISC)² de référence mondiale |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans le modèle de menaces **STRIDE**, quelle catégorie représente un attaquant qui **modifie** des données en transit ou au repos de manière non autorisée ?
- A) T — Tampering (Falsification)
- B) S — Spoofing
- C) I — Information Disclosure
- D) E — Elevation of Privilege

**Réponse : A**

**Q2 :** Selon le principe de **Defense-in-Depth**, quelle est la philosophie de base ?
- A) Superposer plusieurs couches de contrôles de sécurité indépendants de sorte qu'une défaillance d'une couche soit compensée par les couches suivantes
- B) Concentrer tous les investissements sécurité sur un seul périmètre réseau très robuste
- C) Utiliser uniquement des outils certifiés CC EAL7
- D) Déléguer toute la sécurité à un fournisseur cloud

**Réponse : A**

**Q3 :** Dans le cadre **SABSA**, quelle couche aligne l'architecture de sécurité sur les **objectifs et drivers business** de l'organisation ?
- A) La couche Contextuelle (Business View)
- B) La couche Physique
- C) La couche Opérationnelle
- D) La couche Composant

**Réponse : A**

**Q4 :** Selon NIST SP 800-207, quel est le 2ème tenet du Zero Trust stipulant qu'aucun réseau (y compris le LAN interne) ne doit être considéré comme de confiance ?
- A) "All communication is secured regardless of network location" (tout le trafic doit être chiffré et authentifié indépendamment de sa localisation réseau)
- B) "Perimeter is the new security boundary"
- C) "Internal traffic is always trusted"
- D) "VPN replaces Zero Trust"

**Réponse : A**

**Q5 :** Dans STRIDE, que représente la catégorie **R — Repudiation** ?
- A) La capacité d'un utilisateur malveillant ou d'un attaquant à nier avoir effectué une action (ex: transaction, suppression de logs) — mitigée par des pistes d'audit immuables et la non-répudiation cryptographique
- B) Le refus de service
- C) La fuite d'informations confidentielles
- D) L'escalade de privilèges

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
