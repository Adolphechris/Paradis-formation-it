# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 228 (6h) : Threat Modeling & STRIDE (Analyse de Risques Architecturaux, DFD, Microsoft Threat Modeling Tool & PASTA Methodology)

> [!NOTE]
> **Objectif du jour :** Maîtriser les techniques de **modélisation des menaces (Threat Modeling)** appliquées à l'architecture de la plateforme MNBC de la BCC : construction de **Diagrammes de Flux de Données (DFD)**, application de la méthodologie **STRIDE** (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) pour identifier systématiquement les menaces architecturales, scoring des risques avec **DREAD** et intégration du Threat Modeling dans la pipeline **DevSecOps (Shift-Left Security)**.
>
> **Compétences visées :** `SEC-04` (A) — Threat Modeling STRIDE & DREAD Architectural Risk Analysis | `SEC-05` (A) — DFD Construction, Threat Library & DevSecOps Shift-Left Integration

---

## 1) Module — Méthodologie STRIDE & Diagrammes de Flux de Données (2h)

### 📖 Narration/Intuition

Avant de construire une tour, un architecte réalise des plans détaillés pour identifier les points de faiblesse structurels. De même, avant de déployer une nouvelle fonctionnalité de l'API MNBC, l'équipe de sécurité de la BCC doit réaliser un **Threat Model** : une représentation formelle du système qui permet d'identifier **systématiquement** toutes les menaces potentielles sur chaque composant et flux de données.

Le **Threat Modeling** est l'activité de sécurité qui offre le meilleur **ROI (Return on Investment)** : une heure de modélisation en phase de conception identifie et évite des vulnérabilités qui coûteraient 60× plus cher à corriger en production.

### 🔍 Anatomie Technique

**La Méthodologie STRIDE (Microsoft, 1999 — Adam Shostack) :**

```
┌─────────┬──────────────────────────────────┬────────────────────────────────┐
│ Lettre  │ Menace (Threat)                  │ Propriété Compromise           │
├─────────┼──────────────────────────────────┼────────────────────────────────┤
│ S       │ Spoofing (Usurpation)            │ Authenticité (Authentication)  │
│ T       │ Tampering (Altération)           │ Intégrité (Integrity)          │
│ R       │ Repudiation (Répudiation)        │ Non-répudiation                │
│ I       │ Information Disclosure (Fuite)   │ Confidentialité                │
│ D       │ Denial of Service (Déni)         │ Disponibilité                  │
│ E       │ Elevation of Privilege (PrivEsc) │ Autorisation                   │
└─────────┴──────────────────────────────────┴────────────────────────────────┘
```

**Diagramme de Flux de Données (DFD Niveau 0) — Plateforme MNBC BCC :**

```
                    ┌─────────────────┐
  [Banque           │                 │   [Blockchain
  Commerciale]──────►   API Gateway   │    MNBC]
  Partenaire        │   BCC MNBC      │◄──────────────
       │            │   (HTTPS/TLS)   │
       │            └────────┬────────┘
       │                     │
       │              ┌──────▼──────────┐
       │              │  Lambda         │         ┌──────────────┐
       │              │  Settlement     │─────────►  DynamoDB    │
       │              │  Service        │         │  MNBC Ledger │
       │              └──────┬──────────┘         └──────────────┘
       │                     │
       │              ┌──────▼──────────┐
       └──────────────►  SQS Queue      │
                      │  MNBC Events    │
                      └─────────────────┘

Frontières de Confiance (Trust Boundaries) :
══ Internet ══ | ══ DMZ BCC ══ | ══ Réseau Privé BCC ══ | ══ Blockchain ══
```

---

## 2) Module — Application STRIDE sur l'Architecture MNBC BCC (2h)

### 🛠️ Atelier Pratique

**Threat Modeling STRIDE — Tableau Complet des Menaces BCC MNBC (`threat_model_bcc.md`) :**

```markdown
# THREAT MODEL — PLATEFORME MNBC BCC
## Composant : API Gateway BCC MNBC

| ID     | STRIDE | Menace Identifiée                                      | Contrôle Existant  | Statut    |
|:------:|:------:|:-------------------------------------------------------|:------------------:|:---------:|
| TM-001 | S      | Spoofing JWT — Attaquant forge un JWT avec "alg:none"  | JWT HS256          | ⚠️ RISQUE |
| TM-002 | T      | Tampering Payload — Altération du montant de virement  | TLS 1.3 en transit | ✅ MITIGÉ |
| TM-003 | R      | Répudiation — Banque nie avoir initié un virement      | Logs API Gateway   | ⚠️ RISQUE |
| TM-004 | I      | Fuite de données — BOLA/IDOR exposant d'autres comptes | Aucun              | 🔴 CRITIQUE|
| TM-005 | D      | DoS — Flood de requêtes API saturant Lambda            | Aucun Rate Limit   | 🔴 CRITIQUE|
| TM-006 | E      | PrivEsc — SSRF → Vol credentials IAM → Admin AWS       | IMDSv1 (vulnérable)| 🔴 CRITIQUE|

## Composant : Lambda Settlement Service

| ID     | STRIDE | Menace Identifiée                                      | Contrôle Existant  | Statut    |
|:------:|:------:|:-------------------------------------------------------|:------------------:|:---------:|
| TM-007 | T      | Event Injection — Message SQS malveillant              | Pas de validation  | 🔴 CRITIQUE|
| TM-008 | I      | Secrets exposés — API Key en variable d'env Lambda     | Aucun              | 🔴 CRITIQUE|
| TM-009 | E      | IAM PrivEsc — Rôle Lambda trop permissif (AdministratorAccess) | IAM* | 🔴 CRITIQUE|

## Scoring DREAD des menaces critiques :

DREAD = Damage + Reproducibility + Exploitability + Affected Users + Discoverability
(Chaque dimension : 0-10 — Score total /50 → Divisé par 5 = Score /10)

TM-004 (BOLA/IDOR) : D=9 + R=10 + E=9 + A=10 + D=8 = 46/50 = 9.2 — CRITIQUE
TM-005 (DoS API)   : D=8 + R=10 + E=10 + A=10 + D=9 = 47/50 = 9.4 — CRITIQUE
TM-006 (SSRF→IAM)  : D=10 + R=7 + E=8 + A=10 + D=7 = 42/50 = 8.4 — HAUTE
```

---

## 3) Module — Intégration Threat Modeling en DevSecOps (Shift-Left) (2h)

### 📖 Narration/Intuition

Le **Shift-Left Security** consiste à intégrer les activités de sécurité **le plus tôt possible** dans le cycle de développement logiciel. Plutôt que d'auditer la sécurité après le déploiement, le Threat Modeling est réalisé lors de la **phase de conception** (Design Review), bien avant l'écriture du code.

### 🛠️ Atelier Pratique

**Processus de Threat Modeling DevSecOps BCC — Pipeline GitHub Actions (`threat_model_pipeline.sh`) :**

```bash
# Outils d'automatisation du Threat Modeling en CI/CD

# 1. ThreatSpec — Commentaires Threat Model dans le code Python
# (Annotations de menaces directement dans les fonctions Lambda)
cat << 'EOF' > bcc_settlement_annotated.py
# @threat spoofing on bcc-mnbc-api with jwt_forgery mitigated by jwt_rs256_validation
# @threat dos on bcc-api-gateway with flood mitigated by aws_waf_rate_limiting
# @threat information_disclosure on bcc-lambda with ssrf mitigated by imdsv2
def lambda_handler(event, context):
    """Traitement du virement MNBC."""
    # Validation stricte de l'événement SQS (contre TM-007 Event Injection)
    if not validate_sqs_event_schema(event):
        raise ValueError("Event SQS invalide — rejeté")
    # ...
EOF

# 2. OWASP Threat Dragon — Générer le rapport du DFD en JSON
# (Outil web open-source pour dessiner et annoter des DFDs STRIDE)
# Exporter le modèle de menace en rapport PDF/JSON
threat-dragon export --model bcc_mnbc_threat_model.json --format pdf

# 3. Microsoft Threat Modeling Tool — Mode CLI
# Analyser automatiquement les templates Azure/AWS ARM/CloudFormation
# pour détecter les configurations à risque

# 4. Intégration dans la Pull Request Review
cat << 'EOF' >> .github/PULL_REQUEST_TEMPLATE.md

## Checklist Sécurité (Threat Modeling)
- [ ] Le composant modifié a-t-il un Threat Model à jour dans /docs/security/threat-models/ ?
- [ ] Les nouvelles menaces STRIDE ont-elles été évaluées et mitigées ?
- [ ] Les contrôles de sécurité requis par le Threat Model sont-ils implémentés ?
- [ ] Les tests de sécurité automatisés couvrent-ils les menaces identifiées ?
EOF
echo "✅ Threat Modeling intégré dans le processus de Pull Request Review BCC"
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **STRIDE** | Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege — Méthodologie de classification des menaces |
| **DFD** | Data Flow Diagram — Diagramme de Flux de Données représentant les flux d'information d'un système |
| **DREAD** | Damage, Reproducibility, Exploitability, Affected Users, Discoverability — Modèle de scoring de risques |
| **PASTA** | Process for Attack Simulation and Threat Analysis — Méthodologie avancée de threat modeling orientée risques métier |
| **Shift-Left** | Approche DevSecOps déplaçant les contrôles de sécurité vers les phases amont du cycle de développement |
| **ROI** | Return on Investment — Retour sur investissement (bénéfices d'une activité rapportés à son coût) |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pour le composant **SQS Queue MNBC Events** de la plateforme BCC, identifier une menace pour chacune des 6 catégories **STRIDE** et proposer le contrôle de sécurité approprié pour chaque menace.

**Corrigé :**
- **S (Spoofing)** : Un attaquant usurpe l'identité d'une banque partenaire autorisée pour envoyer de faux messages SQS de virement. **Contrôle** : Authentification des producteurs de messages SQS via des politiques IAM strictes (seuls les services autorisés peuvent `sqs:SendMessage`).
- **T (Tampering)** : Un acteur interne malveillant modifie le montant d'un virement MNBC dans un message SQS avant son traitement par Lambda. **Contrôle** : Signature cryptographique (HMAC-SHA256) des messages SQS par le producteur, vérifiée par le consommateur Lambda.
- **R (Repudiation)** : Une banque nie avoir initié un ordre de virement après son exécution. **Contrôle** : Journalisation immuable (CloudTrail + S3 avec Object Lock WORM) de tous les messages SQS avec horodatage certifié.
- **I (Information Disclosure)** : Le contenu des messages SQS (montants, numéros de comptes MNBC) est exposé en clair dans les logs CloudWatch. **Contrôle** : Chiffrement côté serveur SQS avec AWS KMS (SSE-KMS), et masquage des données sensibles dans les logs.
- **D (Denial of Service)** : Un attaquant inonde la queue SQS de millions de faux messages, saturant Lambda et retardant tous les règlements légitimes. **Contrôle** : Dead Letter Queue (DLQ) + Rate limiting sur `sqs:SendMessage` via IAM conditions + AWS WAF.
- **E (Elevation of Privilege)** : Un message SQS contient un payload d'injection (Event Injection TM-007) exploitant une vulnérabilité de la Lambda pour exécuter du code avec les permissions IAM de la Lambda. **Contrôle** : Validation stricte du schéma des messages SQS (JSON Schema Validation) avant tout traitement, IAM Least Privilege.

**Exercice 2 :** Expliquer pourquoi le **Threat Modeling** réalisé lors de la **phase de conception** (Shift-Left) est économiquement beaucoup plus avantageux que l'audit de sécurité réalisé **après le déploiement en production**.

**Corrigé :** Selon le principe économique de **"Rules of Ten" du coût de correction des défauts logiciels** (IBM Systems Sciences Institute) : corriger une faille de sécurité coûte en moyenne **1× en phase de conception**, **10× en développement**, **100× en test**, et **1 000× en production**. Un Threat Modeling d'une heure en phase de conception permet d'identifier et de concevoir la mitigation d'une vulnérabilité architecturale (ex: BOLA/IDOR absent sur l'API). Résoudre cette même faille après déploiement en production nécessiterait : une découverte par audit ou incident (coût + risque réputationnel), une analyse de root cause, la modification de l'architecture API (refactoring), des tests de régression complets, une validation sécurité, un déploiement d'urgence (rolling update sans downtime), et potentiellement la notification aux clients si des données ont été exposées (obligations RGPD). Le rapport coût/bénéfice du Threat Modeling est donc extrêmement favorable, particulièrement pour les systèmes bancaires critiques comme la plateforme MNBC de la BCC.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quelle lettre de l'acronyme **STRIDE** correspond à la menace où un attaquant **forge un JWT** pour usurper l'identité d'un administrateur de l'API BCC ?
- A) **S** — Spoofing (Usurpation d'identité)
- B) **T** — Tampering (Altération)
- C) **E** — Elevation of Privilege
- D) **R** — Repudiation

**Réponse : A**

**Q2 :** Dans un Diagramme de Flux de Données (DFD) utilisé pour le Threat Modeling STRIDE, que représente une **frontière de confiance (Trust Boundary)** ?
- A) La limite entre deux zones de sécurité différentes où les données traversent (ex: Internet vers DMZ), nécessitant une validation et une authentification strictes
- B) La limite physique d'un datacenter
- C) Le périmètre d'une base de données chiffrée
- D) La délimitation d'un réseau VLAN

**Réponse : A**

**Q3 :** Quel modèle de scoring de risques de menaces utilise les dimensions **Damage, Reproducibility, Exploitability, Affected Users et Discoverability** pour calculer un score numérique de sévérité ?
- A) DREAD
- B) CVSS v3
- C) STRIDE
- D) MITRE ATT&CK

**Réponse : A**

**Q4 :** Quel est l'objectif principal du principe **Shift-Left Security** dans un contexte DevSecOps ?
- A) Intégrer les activités de sécurité le plus tôt possible dans le cycle de développement (dès la phase de conception) pour réduire drastiquement le coût de correction des vulnérabilités
- B) Déplacer les serveurs de production vers une région Cloud plus à l'ouest
- C) Augmenter la cadence de déploiement en continu
- D) Externaliser les audits de sécurité à un prestataire tiers

**Réponse : A**

**Q5 :** Lors d'un Threat Modeling STRIDE de la Lambda Settlement Service BCC, la menace **TM-007 (Event Injection via SQS)** est catégorisée sous quelle lettre STRIDE ?
- A) **T** — Tampering (Altération des données/comportement via injection de messages SQS malveillants)
- B) **S** — Spoofing
- C) **D** — Denial of Service
- D) **R** — Repudiation

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
