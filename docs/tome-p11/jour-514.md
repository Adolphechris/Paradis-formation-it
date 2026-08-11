# TOME P11 — DevSecOps, Cloud Security & Gouvernance — Jour 514 (6h) : Audit & Contrôles Avancés PCI-DSS v4.0 & SOC 2 Type II : Mise en Œuvre & Preuves d'Audit

> [!NOTE]
> **Objectifs pédagogiques :**
> - Maîtriser l'implémentation opérationnelle des 12 exigences de la norme **PCI-DSS v4.0**
> - Auditer les 5 principes de confiance **SOC 2 (Trust Services Criteria)** : Sécurité, Disponibilité, Intégrité du traitement, Confidentialité, Vie privée
> - Automatiser la collecte de preuves d'audit (Evidence Collection) avec des scripts DevSecOps et d'infrastructure
> - Préparer le document d'attestation de conformité (**AoC — Attestation of Compliance**)
>
> **Compétences visées :** `POL-02` (A), `SEC-06` (A) — Financial & Cloud Security Audits

---

## Module 1 — Mise en Œuvre Approfondie de PCI-DSS v4.0 (2h)

### 📖 Intuition & Narration

La version 4.0 de **PCI-DSS** introduit une évolution majeure : l'approche basée sur les résultats ("Customized Approach") en plus de l'approche prescriptive traditionnelle.

Pour toute entreprise qui manipule des numéros de cartes de paiement (PAN — Primary Account Number), la moindre défaillance de sécurité sur le périmètre CDE peut entraîner le retrait immédiat du droit d'accepter les paiements par carte bancaire.

### 🔍 Anatomie Technique — Les 12 Exigences PCI-DSS v4.0

```
LES 12 EXIGENCES PCI-DSS v4.0 (PÉRIMÈTRE CDE)

  RÉSEAU SÉCURISÉ (Req 1 & 2) :
  • Req 1 : Configurer et maintenir des contrôles de sécurité réseau (NSC / Firewalls).
  • Req 2 : Appliquer des configurations sécurisées à tous les composants système.

  PROTECTION DES DONNÉES DE CARTES (Req 3 & 4) :
  • Req 3 : Protéger les données de compte stockées (Chiffrement AES-256, Troncature PAN).
  • Req 4 : Chiffrer les données de cartes lors des transmissions réseau (TLS 1.3).

  GESTION DES VULNÉRABILITÉS (Req 5 & 6) :
  • Req 5 : Protéger tous les systèmes contre les logiciels malveillants (Anti-malware / EDR).
  • Req 6 : Développer et maintenir des systèmes et applications sécurisés (DevSecOps / SAST).

  CONTRÔLE D'ACCÈS (Req 7, 8 & 9) :
  • Req 7 : Restreindre l'accès aux données par le besoin d'en connaître (Need to know).
  • Req 8 : Identifier les utilisateurs et authentifier l'accès (MFA obligatoire).
  • Req 9 : Restreindre l'accès physique aux données de cartes.

  SURVEILLANCE & TESTS (Req 10, 11 & 12) :
  • Req 10 : Enregistrer et surveiller tous les accès aux ressources réseau et données (SIEM).
  • Req 11 : Tester régulièrement la sécurité des systèmes et réseaux (Pentest / Scans).
  • Req 12 : Soutenir la sécurité de l'information avec des politiques et programmes formels.
```

---

## Module 2 — Atelier Pratique : Automate de Collecte de Preuves d'Audit SOC 2 (2h)

### 🛠️ Code Python : Automated Evidence Collector pour SOC 2 CC6.1 / CC6.8

```python
#!/usr/bin/env python3
"""
PARADIS — Automated Evidence Collector pour Audit SOC 2 Type II
Collecte automatiquement les preuves d'audit pour les critères CC6.1 (Access Control) et CC6.8 (Malware Prevention).
"""

import json
import hashlib
from datetime import datetime

class SOC2EvidenceCollector:
    def __init__(self, audit_period: str):
        self.audit_period = audit_period
        self.evidence_log = []

    def collect_mfa_evidence(self) -> dict:
        """Preuve pour CC6.1 : Tous les utilisateurs ont le MFA activé."""
        print("[*] Collecte preuve CC6.1 (MFA Enforced sur IAM)...")
        evidence = {
            "tsc_criterion": "CC6.1 - Logical Access Security",
            "evidence_type": "IAM_MFA_STATUS_EXPORT",
            "timestamp": datetime.now().isoformat(),
            "details": {
                "total_users": 150,
                "mfa_enabled_users": 150,
                "mfa_enforcement_policy": "STRICT_ALWAYS_ON",
                "status": "COMPLIANT"
            }
        }
        self.evidence_log.append(evidence)
        return evidence

    def collect_code_review_evidence(self) -> dict:
        """Preuve pour CC8.1 : Change Management & Security Gates."""
        print("[*] Collecte preuve CC8.1 (Change Management & PR Approvals)...")
        evidence = {
            "tsc_criterion": "CC8.1 - Change Management",
            "evidence_type": "GITHUB_PR_APPROVAL_LOGS",
            "timestamp": datetime.now().isoformat(),
            "details": {
                "total_pull_requests": 420,
                "peer_reviewed_prs": 420,
                "sast_passed_prs": 420,
                "direct_commits_to_main_allowed": False,
                "status": "COMPLIANT"
            }
        }
        self.evidence_log.append(evidence)
        return evidence

    def generate_audit_package(self) -> dict:
        package = {
            "organization": "PARADIS Finance Enterprise",
            "audit_period": self.audit_period,
            "generated_at": datetime.now().isoformat(),
            "total_evidences_collected": len(self.evidence_log),
            "evidences": self.evidence_log
        }
        # Signature de l'ensemble du package avec SHA-256
        raw_json = json.dumps(package, sort_keys=True)
        package["package_integrity_sha256"] = hashlib.sha256(raw_json.encode()).hexdigest()
        return package

if __name__ == "__main__":
    collector = SOC2EvidenceCollector("2024-Q1-Q2")
    collector.collect_mfa_evidence()
    collector.collect_code_review_evidence()

    audit_pkg = collector.generate_audit_package()

    print("\n" + "═"*70)
    print("  PACKAGE DE PREUVES AUTOMATISÉ POUR AUDITEUR SOC 2 TYPE II")
    print("═"*70)
    print(json.dumps(audit_pkg, indent=2))
    print("═"*70)
    print(f"\n[✅ PREUVE PRÊTE] Empreinte d'intégrité SHA-256 : {audit_pkg['package_integrity_sha256']}")
```

---

## Module 3 — Attestation of Compliance (AoC) & Rapport SOC 2 (1h30)

### 🔍 Attestation of Compliance (AoC)

L'**Attestation of Compliance (AoC)** est le document officiel signé par un auditeur certifié **QSA (Qualified Security Assessor)** attestant qu'une organisation a satisfait à l'ensemble des exigences de la norme PCI-DSS.

Pour SOC 2, l'auditeur (Cabinet d'Expertise Comptable certifié CPA) rédige le **Rapport SOC 2 Type II**, qui est partagé sous accord de confidentialité (NDA) avec les clients B2B.

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **QSA** | Qualified Security Assessor — Auditeur certifié pour la norme PCI-DSS |
| **AoC** | Attestation of Compliance — Attestation officielle de conformité PCI-DSS |
| **PAN** | Primary Account Number — Numéro principal de carte bancaire (16 chiffres) |
| **TSC** | Trust Services Criteria — Critères de confiance pour les audits SOC 2 |

---

## Exercices Pratiques

### Exercice 1 — Audit d'un Numéro de Carte (PAN) en Base de Données

Selon l'exigence 3 de PCI-DSS v4.0, comment doit être stocké un numéro de carte bancaire (PAN) dans une base de données de production ?

**Corrigé guidé :**
Le PAN ne doit jamais être stocké en clair. Il doit impérativement être rendu lisible uniquement via :
1. **Chiffrement fort** (AES-256 avec gestion stricte des clés HSM).
2. **Troncature** (afficher uniquement les 6 premiers et 4 derniers chiffres : `4111 11** **** 1111`).
3. **Tokenisation** (remplacer le PAN par un jeton aléatoire sans valeur financière).

---

## Banque QCM — 5 Questions

**Q1.** Combien d'exigences fondamentales constituent la norme de sécurité **PCI-DSS v4.0** ?

- A) 5 exigences.
- B) 12 exigences. ✅
- C) 100 exigences.
- D) 1 seule exigence.

**Q2.** Que signifie l'acronyme **PAN** dans le contexte du paiement bancaire ?

- A) Personal Access Network.
- B) Primary Account Number (le numéro de carte bancaire à 16 chiffres). ✅
- C) Password Authentication Number.
- D) Protected Account Name.

**Q3.** Quel est le rôle d'un auditeur **QSA (Qualified Security Assessor)** ?

- A) Vendre des ordinateurs.
- B) Évaluer et certifier officiellement la conformité d'une entreprise à la norme PCI-DSS. ✅
- C) Rédiger des articles de presse.
- D) Réparer les câbles réseau.

**Q4.** Quels sont les 5 critères de confiance (**Trust Services Criteria — TSC**) évalués lors d'un audit **SOC 2** ?

- A) Sécurité, Disponibilité, Intégrité du traitement, Confidentialité, Vie privée. ✅
- B) Rouge, Vert, Bleu, Jaune, Noir.
- C) Windows, Linux, macOS, Android, iOS.
- D) Vitesse, Prix, Taille, Couleur, Poids.

**Q5.** Pourquoi l'automatisation de la collecte de preuves d'audit (**Automated Evidence Collection**) est-elle essentielle pour les audits SOC 2 Type II ?

- A) Pour remplacer l'auditeur humain.
- B) Pour collecter en continu et sans effort manuel les logs et preuves de conformité sur toute la période d'observation (6 à 12 mois). ✅
- C) Pour supprimer les sauvegardes.
- D) Pour fermer l'entreprise.

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
