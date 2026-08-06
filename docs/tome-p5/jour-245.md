# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 245 (6h) : Projet Intégrateur Partie 9 — Certification & Audit Conformité Globale BCC (Rapport d'Audit SWIFT CSP v2024, Assessment ISO 27001:2022, NIS 2 / DORA Compliance & Plan d'Action Directeur)

> [!NOTE]
> **Objectif du jour :** Réaliser le **rapport d'audit global de conformité et de certification** de la Banque Centrale du Congo (BCC) : évaluation finale multi-référentiels (**SWIFT CSP CSCF v2024**, **ISO/IEC 27001:2022**, **DORA / NIS 2**), consolidation des preuves techniques accumulées lors des projets intégrateurs (J205, J210, J215, J220, J225, J230, J235, J240), et formalisation du **Plan d'Action Directeur de Sécurité (PADS 2026-2028)** soumis au Comité de Direction.
>
> **Compétences visées :** `SEC-06` (A) — Global Security Compliance & Audit Certification | `PRO-01` (A) — Projet Intégrateur Finalisation Audit Réglementaire Globale BCC — Masterplan 2026-2028

---

## 1) Module — Synthèse d'Audit Multi-Référentiels BCC (1h30)

### 📖 Narration/Intuition

Au terme du Semestre 5, l'infrastructure de la Banque Centrale du Congo (BCC) a fait l'objet de tests offensifs (Red Team), de déploiements défensifs (Blue Team), d'investigations forensiques (DFIR) et de projets de durcissement (Zero Trust, DevSecOps, PQC).

Il convient maintenant de consolider ces résultats dans un **Rapport d'Audit Global de Conformité** officiel requis par les régulateurs nationaux et internationaux.

### 🔍 Anatomie Technique

**Tableau de Conformité Multi-Référentiels BCC :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 ÉVALUATION FINALE DE CONFORMITÉ GLOBALE BCC                 │
├──────────────────────────┬──────────────────┬────────────────┬──────────────┤
│ Référentiel              │ Statut Initial   │ Statut Post-J245│ Conformité   │
├──────────────────────────┼──────────────────┼────────────────┼──────────────┤
│ SWIFT CSCF v2024         │ Non-conforme     │ 32/32 Validés  │ 🟢 100%      │
│ ISO/IEC 27001:2022       │ Tier 1 (Partiel) │ Tier 3 (Audité)│ 🟢 96%       │
│ DORA (Règlement UE)      │ Non évalué       │ 5/5 Piliers OK │ 🟢 94%       │
│ NIS 2 Directive          │ Non conforme     │ Conforme       │ 🟢 98%       │
│ NIST SP 800-207 (ZTA)    │ Périmétrique     │ Zero Trust Full│ 🟢 95%       │
└──────────────────────────┴──────────────────┴────────────────┴──────────────┘
```

---

## 2) Module — Consolidation des Preuves Techniques (2h30)

### 🛠️ Atelier Pratique

**Compilation des Preuves Techniques d'Audit (`audit_proofs_compilation.py`) :**

```python
# Compilation automatisée des artefacts d'audit pour les auditeurs extérieurs

audit_evidence = {
    "SWIFT_CSCF_Principle_1": "Cilium eBPF Microsegmentation (J230) - Deny-All Network Policy",
    "SWIFT_CSCF_Principle_2": "Teleport PAM JIT Access (J230) + FIDO2 Passkeys (J237)",
    "ISO27001_A_8_28_SecureCoding": "GitHub Actions Pipeline avec Semgrep/Trivy/Cosign (J235)",
    "ISO27001_A_5_7_ThreatIntel": "Plateforme CTI STIX 2.1 / TAXII 2.1 (J243)",
    "DORA_Pillar_1_RiskManagement": "Registre des risques ISO 27005 (J233)",
    "DORA_Pillar_3_ResilienceTesting": "Rapport Purple Team / Caldera (J223) + Incident J240",
    "DORA_Pillar_4_ThirdParty": "SLSA Level 3 + SBOM CycloneDX (J234)",
    "NIST_CSF_GOVERN": "Tableau de bord CISO avec KRI/KPI (J233)"
}

def print_audit_pack():
    print("==========================================================")
    print("   DOSSIER OFFICIEL DE PREUVES DE CONFORMITÉ BCC (J245)   ")
    print("==========================================================")
    for ref, proof in audit_evidence.items():
        print(f"✔️ {ref:<30} ➔ {proof}")

if __name__ == "__main__":
    print_audit_pack()
```

---

## 3) Module — Plan d'Action Directeur de Sécurité (PADS 2026-2028) (2h)

### 🔍 Anatomie Technique — Plan Stratégique PADS BCC

```markdown
# PLAN D'ACTION DIRECTEUR DE SÉCURITÉ (PADS 2026-2028) — BCC
# Présenté au Comité de Direction & Conseil d'Administration

## 1. AXES STRATÉGIQUES
- AXE 1 : Maintien et Automatisation de la Conformité (Continuous Compliance)
- AXE 2 : Généralisation du Zero Trust & Chiffrement Post-Quantique (PQC)
- AXE 3 : Autonomisation des Équipes SOC / CSIRT / Purple Team

## 2. FEUILLE DE ROUTE OPÉRATIONNELLE & BUDGET

| Année | Projet Majeur | Objectif | Budget (USD) |
|:---:|:---|:---|:---:|
| 2026 | Déploiement complet PQC (Kyber/Dilithium) | Anti-HNDL (J226) | $ 250,000 |
| 2027 | Automatisation SOAR & Threat Hunting KQL | MTTD < 3 min (J243) | $ 180,000 |
| 2028 | Certification ISO 27001:2022 Renouvellement | SMSI Mûr | $ 100,000 |

## 3. CONCLUSION ETAVIS DU CISO
Grâce à la réalisation des 45 leçons du Semestre 5, l'infrastructure numérique et MNBC de la BCC
présente aujourd'hui un niveau de résilience et de conformité de classe internationale.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PADS** | Plan d'Action Directeur de Sécurité — Feuille de route stratégique de cybersécurité |
| **SMSI** | Système de Management de la Sécurité de l'Information (ISMS) |
| **PQC** | Post-Quantum Cryptography |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quelle est l'utilité de la compilation automatique des preuves de conformité (Audit Proof Pack) lors d'un audit externe SWIFT CSP ou ISO 27001 ?

**Corrigé :** La compilation automatique des preuves permet de fournir instantanément aux auditeurs externes des traces techniques inaltérables (logs, configurations As-Code, rapports de scan SAST/SCA signés) démontrant que les contrôles de sécurité ne sont pas seulement écrits dans des politiques, mais **effectivement appliqués en continu en production**. Cela réduit la durée de l'audit et élimine les risques de non-conformité liés à des oublis ou des preuves obsolètes.

**Exercice 2 :** Citer 3 projets clés intégrés dans le PADS 2026-2028 de la BCC à l'issue du Semestre 5.

**Corrigé :**
1. La généralisation du chiffrement post-quantique (**PQC Kyber/Dilithium**) pour contrer la menace HNDL.
2. L'automatisation du **Threat Hunting** et du SOAR pour réduire le MTTD à moins de 3 minutes.
3. La certification et le maintien continu du SMSI selon la norme **ISO/IEC 27001:2022**.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel document stratégique récapitule les projets, objectifs et budgets de cybersécurité soumis au Conseil d'Administration de la BCC pour les 3 prochaines années ?
- A) Le PADS (Plan d'Action Directeur de Sécurité)
- B) Le registre des logs
- C) La politique de mot de passe
- D) Le manuel d'utilisation

**Réponse : A**

**Q2 :** Quel taux de conformité a été atteint par la BCC sur le référentiel SWIFT CSCF v2024 au terme du projet intégrateur J245 ?
- A) 100% (32/32 contrôles validés)
- B) 50%
- C) 75%
- D) 20%

**Réponse : A**

**Q3 :** Quelle preuve technique est associée au contrôle ISO 27001:2022 A.8.28 (Secure Coding) dans le dossier d'audit BCC ?
- A) La pipeline DevSecOps GitHub Actions avec Semgrep, Trivy et Cosign
- B) La caméra de vidéosurveillance
- C) Le groupe électrogène
- D) L'antivirus individuel

**Réponse : A**

**Q4 :** Dans la feuille de route PADS 2026, quel est l'objectif principal du projet PQC ?
- A) Protéger les échanges contre le déchiffrement futur par ordinateur quantique (HNDL)
- B) Augmenter la vitesse de navigation Internet
- C) Supprimer les pare-feux
- D) Remplacer les serveurs virtuels

**Réponse : A**

**Q5 :** Quelle norme révisée en 2022 sert de socle au Système de Management de la Sécurité de l'Information (SMSI) de la BCC ?
- A) ISO/IEC 27001:2022
- B) ISO 9001
- C) PCI-DSS v3.2
- D) RFC 8693

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
