# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 244 (6h) : Audits de Sécurité & Conformité Réglementaire Avancée (SWIFT CSP CSCF v2024, ISO 27001:2022, Directive NIS 2 & Règlement DORA)

> [!NOTE]
> **Objectif du jour :** Maîtriser les cadres de **conformité réglementaire bancaire et d'infrastructures critiques** : mise en conformité avec le programme de sécurité des clients SWIFT (**SWIFT CSP / CSCF v2024**), exigences de l'**ISO/IEC 27001:2022**, mise en œuvre des obligations de la directive **NIS 2** (Network and Information Security) et du règlement européen **DORA** (Digital Operational Resilience Act) pour la résilience opérationnelle numérique de la BCC.
>
> **Compétences visées :** `SEC-06` (A) — Regulatory Compliance SWIFT CSP & ISO 27001:2022 | `POL-03` (A) — European NIS 2 Directive & DORA Operational Resilience Implementation

---

## 1) Module — SWIFT Customer Security Controls Framework (CSCF v2024) (2h)

### 📖 Narration/Intuition

La BCC fait partie du réseau interbancaire international **SWIFT** pour effectuer des transferts de fonds internationaux. Suite aux cyber-attaques historiques contre les banques centrales (comme le vol de 81 millions de dollars de la Banque du Bangladesh en 2016), SWIFT impose le **Customer Security Controls Framework (CSCF)**.

Le CSCF comprend des contrôles obligatoires (Mandatory) et recommandés (Advisory) que chaque banque participante doit faire auditer et certifier annuellement par un auditeur indépendant.

### 🔍 Anatomie Technique

**Les 3 Objectifs et 8 Principes du SWIFT CSCF v2024 :**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 SWIFT CSCF v2024 — ARCHITECTURE DE SÉCURITÉ                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ OBJECTIF 1 : SÉCURISER VOTRE ENVIRONNEMENT (Secure your Environment)        │
│   ├── Principe 1 : Restreindre les accès réseau (Isolation SWIFT Zone)     │
│   └── Principe 2 : Proteger les comptes et les accès privilégiés (PAM/MFA)  │
├─────────────────────────────────────────────────────────────────────────────┤
│ OBJECTIF 2 : CONNAÎTRE ET LIMITER LES ACCÈS (Know and Limit Access)         │
│   ├── Principe 3 : Empêcher la compromission des identifiants (FIDO2)       │
│   └── Principe 4 : Gérer les identités et limiter les privilèges (RBAC)    │
├─────────────────────────────────────────────────────────────────────────────┤
│ OBJECTIF 3 : DÉTECTER ET RÉPONDRE (Detect and Respond)                      │
│   ├── Principe 5 : Détecter les anomalies sur le système (SIEM / EDR)      │
│   ├── Principe 6 : Préparer le plan de réponse aux incidents (CSIRT)       │
│   ├── Principe 7 : Partager les données de menaces (CTI / STIX/TAXII)      │
│   └── Principe 8 : Évaluer la sécurité des composants (Vulnerability Scan) │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Module — ISO 27001:2022 & Annexe A (2h)

### 📖 Narration/Intuition

La révision **ISO/IEC 27001:2022** a réorganisé les contrôles de sécurité de l'Annexe A en **4 thèmes** (au lieu de 14 domaines dans la version 2013) et a introduit 11 nouveaux contrôles essentiels pour les architectures modernes (Threat Intelligence, Cloud Security, Web Filtering, Secure Coding).

### 🛠️ Atelier Pratique

**Matrice de Correspondance ISO 27001:2022 — Mesures BCC (`iso27001_mapping.md`) :**

```markdown
# MATRICE DE CONFORMITÉ ISO 27001:2022 — BCC

## Thème 1 : Contrôles Organisationnels (Organizational Controls - 37 contrôles)
- A.5.7 Threat Intelligence : Mis en œuvre via CTI STIX/TAXII (J243)
- A.5.23 Information Security for Use of Cloud Services : Mis en œuvre via Hardening AWS (J227/J229)

## Thème 2 : Contrôles Personnes (People Controls - 8 contrôles)
- A.6.3 Information Security Awareness : Formations anti-phishing menées

## Thème 3 : Contrôles Physiques (Physical Controls - 14 contrôles)
- A.7.4 Physical Security Monitoring : Vidéosurveillance + Honey PLC SCADA (J218/J232)

## Thème 4 : Contrôles Techniques (Technological Controls - 34 contrôles)
- A.8.9 Configuration Management : Infra-as-Code Terraform + Checkov (J235)
- A.8.12 Data Leakage Prevention : Chiffrement KMS + DLP S3 (J229/J230)
- A.8.28 Secure Coding : Pipeline DevSecOps SAST/DAST (J235)
```

---

## 3) Module — Directives NIS 2 & Règlement DORA (2h)

### 🛠️ Atelier Pratique

**Checklist d'Audit de Résilience Numérique DORA pour la BCC (`dora_compliance.py`) :**

```python
# Script d'auto-évaluation des 5 piliers du règlement européen DORA

dora_pillars = {
    "Pilliers DORA": [
        {"name": "1. ICT Risk Management", "status": "CONFORME", "ref": "ISO 27005 (J233)"},
        {"name": "2. ICT Incident Reporting", "status": "CONFORME", "ref": "NIST SP 800-61 (J225)"},
        {"name": "3. Digital Operational Resilience Testing", "status": "CONFORME", "ref": "Purple Team / TLPT (J223)"},
        {"name": "4. Managing ICT Third-Party Risk", "status": "CONFORME", "ref": "Supply Chain SLSA (J234)"},
        {"name": "5. Information Sharing", "status": "CONFORME", "ref": "STIX 2.1 / TAXII 2.1 (J243)"}
    ]
}

def generate_compliance_report():
    print("==================================================")
    print("  RAPPORT D'AUDIT CONFORMITÉ DORA / NIS 2 — BCC   ")
    print("==================================================")
    for item in dora_pillars["Pilliers DORA"]:
        print(f"[{item['status']}] {item['name']} (Couvert par {item['ref']})")

if __name__ == "__main__":
    generate_compliance_report()
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SWIFT CSP** | Customer Security Program — Programme de sécurité imposé par SWIFT |
| **CSCF** | Customer Security Controls Framework — Référentiel de contrôles SWIFT |
| **DORA** | Digital Operational Resilience Act — Règlement européen sur la résilience numérique financière |
| **NIS 2** | Network and Information Security Directive 2 — Directive européenne renforcée |
| **TLPT** | Threat-Led Penetration Testing — Tests d'intrusion guidés par le renseignement sur les menaces |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Quels sont les 3 objectifs principaux du cadre de contrôles **SWIFT CSCF v2024** ?

**Corrigé :**
1. **Sécuriser votre environnement (Secure your Environment)** : Isoler la zone SWIFT locale du reste du réseau d'entreprise et protéger les accès d'administration.
2. **Connaître et limiter les accès (Know and Limit Access)** : Réduire l'exposition des identifiants et appliquer le principe du moindre privilège avec authentification forte (MFA).
3. **Détecter et répondre (Detect and Respond)** : Déployer une surveillance continue des anomalies (SIEM/EDR), maintenir un plan de réponse aux incidents et partager les données de menaces.

**Exercice 2 :** En quoi le règlement **DORA** modifie-t-il les exigences de gestion des risques liés aux prestataires tiers (Third-Party Risk Management) par rapport aux réglementations bancaires classiques ?

**Corrigé :** Le règlement **DORA (Pilier 4)** exige que les institutions financières évaluent et surveillent de manière continue les risques associés à leurs fournisseurs de services TIC (Cloud, SaaS, éditeurs logiciels). Il impose : (1) La tenue d'un registre complet de tous les contrats TIC tiers. (2) L'obligation d'inclure des clauses contractuelles strictes (droit d'audit, SLA de sécurité, plans de continuité). (3) La surveillance directe par les autorités européennes des "fournisseurs TIC critiques" (ex: AWS, Azure, Google Cloud) pour éviter les dépendances systémiques incontrôlées.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel cadre de sécurité obligatoire est imposé annuellement par l'organisation SWIFT à toutes les banques participantes pour sécuriser leurs terminaux de paiement ?
- A) SWIFT CSCF (Customer Security Controls Framework)
- B) PCI-DSS
- C) HIPAA
- D) SOX

**Réponse : A**

**Q2 :** Combien de contrôles sont regroupés dans les **4 thèmes** de la nouvelle version de la norme **ISO/IEC 27001:2022** (Annexe A) ?
- A) 93 contrôles
- B) 114 contrôles
- C) 50 contrôles
- D) 200 contrôles

**Réponse : A**

**Q3 :** Quel règlement européen majeur (DORA) impose aux entités du secteur financier de garantir leur résilience opérationnelle numérique à travers 5 piliers clés ?
- A) Digital Operational Resilience Act (DORA)
- B) RGPD
- C) MiCA
- D) Solvabilité II

**Réponse : A**

**Q4 :** Quelle est l'obligation principale introduite par la directive européenne **NIS 2** pour les entités essentielles et importantes ?
- A) La mise en œuvre de mesures de gestion des risques de cybersécurité et l'obligation de notifier les incidents majeurs dans les 24 heures
- B) L'abandon des infrastructures Cloud
- C) L'utilisation exclusive de logiciels propriétaires
- D) La suppression des sauvegardes sur disque

**Réponse : A**

**Q5 :** Dans le cadre du test de résilience DORA, comment appelle-t-on les tests d'intrusion avancés guidés par le renseignement sur les menaces (**TLPT**) ?
- A) Threat-Led Penetration Testing
- B) Total Loss Prevention Testing
- C) Technical Level Protection Test
- D) Team Lead Performance Test

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
