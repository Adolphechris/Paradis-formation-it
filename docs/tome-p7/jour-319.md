# TOME P7 — Certifications d'Élite & Spécialisations — Jour 319 (6h) : CISSP Intensive — Cryptography & PKI (Common Criteria EAL, FIPS 140-3, PKI Trust Models & Quantum-Safe Cryptography Roadmap)

> [!NOTE]
> **Objectif du jour :** Maîtriser le **domaine 3 CISSP (Cryptographie et PKI)** : comprendre les niveaux d'assurance **Common Criteria (EAL1-EAL7)** et **FIPS 140-3** (niveaux 1-4), concevoir une hiérarchie **PKI d'entreprise** (Root CA offline, Intermediate CA, Issuing CA), comparer les modèles de confiance PKI (Web of Trust vs Hiérarchique vs Bridge CA), et planifier la transition vers la **cryptographie post-quantique** dans un contexte CISSP.
>
> **Compétences visées :** `CISSP-03` (A) — Common Criteria, FIPS 140-3 & PKI Trust Models | `CISSP-04` (A) — Enterprise PKI Design & Post-Quantum Transition Roadmap

---

## 1) Module — Common Criteria & FIPS 140-3 (2h)

### 📖 Narration/Intuition

| Standard | Portée | Niveaux |
|:--------:|:------:|:--------|
| **Common Criteria (ISO 15408)** | Évaluation de la sécurité des produits IT (EAL) | EAL1 (fonctionnel) → EAL7 (formellement vérifié) |
| **FIPS 140-3** | Validation des modules cryptographiques (HSM, logiciels) | Level 1 (logiciel) → Level 4 (protection physique totale) |

**Niveaux FIPS 140-3** :
- **Level 1** : Algorithmes corrects, aucune exigence physique (ex: OpenSSL pur logiciel)
- **Level 2** : Preuves d'inviolabilité physique (tamper-evident) + rôles
- **Level 3** : Résistance physique (tamper-resistant) + authentification robuste
- **Level 4** : Protection physique complète — destruction des clés si intrusion (HSMs haut-de-gamme)

---

## 2) Module — Conception PKI d'Entreprise (`enterprise_pki_design.py`) (2h)

### 🛠️ Atelier Pratique

```python
# Modélisation d'une PKI d'entreprise 3 niveaux — CISSP PKI Design

enterprise_pki = {
    "pki_name": "PARADIS BANK Enterprise PKI",
    "trust_model": "Hierarchical (Single Root)",
    "levels": [
        {
            "level": 1,
            "name": "Root CA (Offline)",
            "key_algorithm": "RSA-4096 (transition vers ML-DSA prévu 2027)",
            "validity_years": 20,
            "storage": "Offline HSM (Luna Network HSM 7 — FIPS 140-3 Level 3)",
            "air_gapped": True,
            "usage": "Signer uniquement les certificats des Intermediate CAs",
            "ceremony": "Root CA Key Ceremony avec témoins, caméras et m-of-n (3/5 key custodians)",
            "security_note": "Ne signe JAMAIS de certificats finaux — La compromission de la Root CA est catastrophique"
        },
        {
            "level": 2,
            "name": "Intermediate CA — Interne",
            "key_algorithm": "RSA-4096",
            "validity_years": 10,
            "storage": "Online HSM (AWS CloudHSM — FIPS 140-3 Level 3)",
            "usage": "Signe les Issuing CAs internes (Employee, Server, Device CAs)"
        },
        {
            "level": 3,
            "name": "Issuing CA — TLS Serveurs",
            "key_algorithm": "ECDSA P-384",
            "validity_years": 5,
            "storage": "HashiCorp Vault PKI Engine",
            "usage": "Émet les certificats TLS finaux pour les serveurs internes (validity: 90 jours)",
            "auto_renewal": "Cert-Manager Kubernetes + Vault PKI",
            "max_cert_validity_days": 90
        }
    ],
    "crl_distribution_points": ["http://crl.paradis-bank.com/root.crl"],
    "ocsp_responder": "http://ocsp.paradis-bank.com",
    "post_quantum_roadmap": {
        "2026": "Inventaire de toutes les clés RSA/ECC — Crypto Agility Assessment",
        "2027": "Déploiement Hybrid TLS 1.3 (X25519 + ML-KEM768) sur les accès externes",
        "2028": "Migration complète Root/Intermediate CA vers ML-DSA (FIPS 204)",
        "2030": "Retrait complet des algorithmes RSA et ECC"
    }
}

import json
print(json.dumps(enterprise_pki, indent=2, ensure_ascii=False))
```

---

## 3) Module — Les 3 Modèles de Confiance PKI (2h)

```markdown
# MODÈLES DE CONFIANCE PKI — CISSP Domain 3

## 1. Hiérarchique (Single Root)
- Structure arborescente avec une Root CA unique
- Simple à gérer, audit aisé
- Point de défaillance unique si la Root CA est compromise
- Usage : PKI interne d'entreprise, PKI gouvernementale nationale

## 2. Web of Trust (Toile de Confiance)
- Chaque entité certifie la clé publique d'autres entités (PGP/GPG)
- Décentralisé — pas d'autorité centrale
- Complexe à l'échelle, vulnérable aux réseaux de confiance biaisés
- Usage : Communauté open-source (clés de signature de commits)

## 3. Bridge CA (Pont de Certification)
- Permet l'interopérabilité entre plusieurs PKI indépendantes
- Chaque PKI locale connecte sa Root CA à la Bridge CA centrale
- Usage : PKI inter-gouvernementale (ex: FBCA — Federal Bridge CA US DoD)

## Cross-Certification vs Bridge CA
- **Cross-Certification** : Accord bilatéral entre 2 CAs (PKI-A fait confiance à PKI-B)
- **Bridge CA** : Accord multilatéral via un hub central (plus scalable)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **EAL** | Evaluation Assurance Level — Niveau d'assurance d'évaluation Common Criteria (EAL1-EAL7) |
| **FIPS 140-3** | Federal Information Processing Standard validant la sécurité des modules cryptographiques |
| **Root CA** | Certification Authority racine — Sommet de la hiérarchie PKI, doit être offline |
| **CRL** | Certificate Revocation List — Liste des certificats révoqués par une CA |
| **OCSP** | Online Certificate Status Protocol — Vérification en temps réel du statut d'un certificat |
| **Bridge CA** | Autorité de certification centrale permettant l'interopérabilité entre PKI indépendantes |

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans le standard **FIPS 140-3**, quel niveau exige une protection physique complète du module cryptographique avec destruction automatique des clés en cas d'attaque physique détectée ?
- A) Level 4 — Protection physique totale avec détection/réponse à l'intrusion
- B) Level 1
- C) Level 2
- D) Level 3

**Réponse : A**

**Q2 :** Pourquoi la **Root CA** d'une PKI d'entreprise doit-elle être maintenue **hors ligne (air-gapped)** ?
- A) Parce que la compromission de la Root CA compromet l'intégralité de la hiérarchie PKI — tous les certificats émis par les CAs subordonnées doivent être révoqués et réémis
- B) Pour économiser de l'électricité
- C) Pour se conformer au RGPD
- D) Parce que la Root CA n'a pas besoin d'émettre de certificats régulièrement

**Réponse : A**

**Q3 :** Qu'est-ce qu'une **Key Ceremony** dans le contexte de la Root CA d'une PKI d'entreprise ?
- A) Une procédure formelle documentée, en présence de témoins et sous vidéosurveillance, pour générer et protéger la clé privée de la Root CA, avec un schéma de partage de secret m-of-n entre plusieurs gardiens
- B) Une réunion mensuelle du COMEX
- C) La cérémonie de renouvellement annuel des certificats serveurs
- D) L'audit annuel du SOC

**Réponse : A**

**Q4 :** Dans un modèle de confiance PKI **Hiérarchique (Single Root)**, quelle est la différence de rôle entre une **Intermediate CA** et une **Issuing CA** ?
- A) L'Intermediate CA signe les certificats des Issuing CAs (mais pas les certificats finaux), tandis que l'Issuing CA émet directement les certificats finaux (TLS, Employee, Device)
- B) L'Intermediate CA est offline, l'Issuing CA est online
- C) Les deux rôles sont identiques
- D) L'Issuing CA signe la Root CA

**Réponse : A**

**Q5 :** Quelle est l'utilité du protocole **OCSP (Online Certificate Status Protocol)** par rapport aux **CRL (Certificate Revocation Lists)** ?
- A) OCSP permet la vérification en temps réel du statut d'un certificat spécifique sans télécharger toute la CRL, réduisant la bande passante et améliorant la fraîcheur de l'information de révocation
- B) OCSP est plus lent que les CRL
- C) OCSP chiffre le certificat
- D) OCSP remplace totalement TLS

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
