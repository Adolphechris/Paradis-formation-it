# TOME P4 — Cloud, DevOps & SecOps — Jour 189 (6h) : Conformité Réglementaire & Gouvernance IT (RGPD, PCI-DSS, ISO 27001, Audit de Conformité & Risk Management)

> [!NOTE]
> **Objectif du jour :** Comprendre les exigences réglementaires et de gouvernance informatique applicables à une banque centrale africaine : **RGPD** (protection des données personnelles), **PCI-DSS** (sécurité des données de cartes bancaires), **ISO 27001** (système de management de la sécurité de l'information), techniques d'**audit de conformité** et **gestion des risques IT** selon le référentiel **COBIT**.
>
> **Compétences visées :** `GOV-03` (A) — Conformité Réglementaire RGPD & PCI-DSS | `GOV-04` (A) — ISO 27001 & Risk Management COBIT

---

## 1) Module — RGPD & Protection des Données Personnelles (2h)

### 📖 Narration/Intuition

La BCC traite quotidiennement des données personnelles de millions de citoyens congolais : noms, adresses, numéros de compte, transactions bancaires, données biométriques... Ces données sont soumises à des réglementations de protection strictes. En République Démocratique du Congo, la Loi N° 20/017 sur les télécommunications et la protection des données personnelles s'aligne sur les principes du **RGPD européen** (Règlement Général sur la Protection des Données).

**Les 7 Principes RGPD fondamentaux :**

```
1. LICÉITÉ, LOYAUTÉ, TRANSPARENCE
   └── Le traitement doit avoir une base légale (Consentement, Contrat, Intérêt légitime)

2. LIMITATION DES FINALITÉS
   └── Les données collectées pour un objectif A ne peuvent pas être réutilisées pour B
   └── Exemple BCC : Les données de transaction ne peuvent pas servir à du ciblage marketing

3. MINIMISATION DES DONNÉES
   └── Collecter uniquement les données strictement nécessaires
   └── Anti-pattern : Collecter la date de naissance complète quand seul l'âge suffit

4. EXACTITUDE
   └── Maintenir les données à jour et permettre leur correction

5. LIMITATION DE LA CONSERVATION
   └── Supprimer les données après la durée légale de conservation
   └── BCC : Données de transactions conservées 10 ans (obligation comptable)

6. INTÉGRITÉ ET CONFIDENTIALITÉ
   └── Chiffrement, contrôle d'accès, audit trail

7. RESPONSABILITÉ (Accountability)
   └── Prouver la conformité : DPO, DPIA, Registre des traitements
```

### 🔍 Anatomie Technique

**Implémentation Technique RGPD dans l'API BCC (`gdpr_service.js`) :**

```javascript
// ══════════════════════════════════════════════════════════
// DROIT D'ACCÈS (Article 15 RGPD) — Export de toutes les
// données personnelles d'un client BCC sur sa demande
// ══════════════════════════════════════════════════════════
async function exportPersonalData(clientId) {
    const [clientInfo, transactions, consents, auditLog] = await Promise.all([
        db.query('SELECT nom, prenom, email, telephone, date_naissance, adresse FROM clients WHERE id = $1', [clientId]),
        db.query('SELECT * FROM transactions WHERE client_id = $1 ORDER BY date DESC', [clientId]),
        db.query('SELECT * FROM consentements WHERE client_id = $1', [clientId]),
        db.query('SELECT action, date, ip FROM audit_log WHERE client_id = $1 ORDER BY date DESC LIMIT 100', [clientId])
    ]);

    return {
        exportDate: new Date().toISOString(),
        requestedBy: clientId,
        personalData: {
            identity: clientInfo.rows[0],
            transactions: transactions.rows,
            consents: consents.rows,
            auditHistory: auditLog.rows
        }
    };
}

// ══════════════════════════════════════════════════════════
// DROIT À L'EFFACEMENT (Article 17 RGPD — "Droit à l'oubli")
// ══════════════════════════════════════════════════════════
async function deletePersonalData(clientId) {
    // VÉRIFICATION : Certaines données ne peuvent PAS être effacées
    // (Obligation légale de conservation des données bancaires : 10 ans)
    const hasActiveAccount = await db.query(
        'SELECT 1 FROM comptes WHERE client_id = $1 AND statut = $2',
        [clientId, 'ACTIF']
    );

    if (hasActiveAccount.rows.length > 0) {
        throw new Error('RGPD_EFFACEMENT_IMPOSSIBLE: Obligation légale de conservation — Compte actif');
    }

    await db.transaction(async (trx) => {
        // Pseudonymisation des données non-effaçables (conservées pour audit)
        await trx.query(
            `UPDATE transactions SET 
                client_nom = 'ANONYMISÉ', 
                client_email = 'anon_${clientId}@bcc.cd'
             WHERE client_id = $1`,
            [clientId]
        );
        
        // Suppression des données directement identifiantes
        await trx.query('DELETE FROM consentements WHERE client_id = $1', [clientId]);
        await trx.query('DELETE FROM clients WHERE id = $1', [clientId]);
        
        // Journalisation RGPD de l'effacement (traçabilité)
        await trx.query(
            'INSERT INTO rgpd_log (action, client_id, date, operateur) VALUES ($1, $2, NOW(), $3)',
            ['EFFACEMENT_DONNEES', clientId, 'SYSTEME_RGPD']
        );
    });
}
```

---

## 2) Module — PCI-DSS & ISO 27001 (2h)

### 📖 Narration/Intuition

**PCI-DSS (Payment Card Industry Data Security Standard)** est le standard de sécurité obligatoire pour toute organisation qui traite des données de cartes bancaires. Une non-conformité PCI-DSS expose la BCC à des amendes pouvant atteindre 500 000 USD par mois et à la perte du droit d'émettre des cartes Visa/Mastercard.

**ISO 27001** est le standard international de management de la sécurité de l'information (SMSI). La certification ISO 27001 est un gage de confiance pour les partenaires internationaux de la BCC.

### 🔍 Anatomie Technique

**Les 12 Exigences Principales PCI-DSS v4.0 :**

```
PÉRIMÈTRE : Systèmes stockant, traitant ou transmettant les données de cartes (CHD)

REQ 1 : Installer et maintenir des contrôles de sécurité réseau (Firewall, NGFW)
REQ 2 : Appliquer des configurations sécurisées par défaut (No default passwords)
REQ 3 : Protéger les données de compte stockées
  └── Jamais stocker le CVV/CVC après autorisation
  └── Masquer le PAN affiché (Afficher uniquement les 4 derniers chiffres)
  └── PAN stocké chiffré avec algorithme fort (AES-256 ou RSA)
REQ 4 : Protéger les données en transit (TLS 1.2 minimum, TLS 1.3 recommandé)
REQ 5 : Protéger contre les logiciels malveillants (Antivirus EDR sur tous les endpoints)
REQ 6 : Développer et maintenir des systèmes sécurisés (OWASP, Patch management)
REQ 7 : Restreindre l'accès aux données de compte (Need-to-Know + RBAC)
REQ 8 : Identifier et authentifier les accès (MFA, Comptes individuels, No shared)
REQ 9 : Restreindre l'accès physique aux données de compte (Datacenter sécurisé)
REQ 10 : Journaliser et surveiller les accès (SIEM, Logs 12 mois minimum)
REQ 11 : Tester régulièrement les systèmes (Pentest annuel, Scan vulnérabilités trimestriel)
REQ 12 : Maintenir une politique de sécurité de l'information (PSSI documentée)
```

**Structure d'un SMSI ISO 27001 — Roue PDCA :**

```
         PLAN (Planifier)
    ┌──────────────────────┐
    │ 1. Définir le périmètre│
    │ 2. Analyse des risques │
    │ 3. Déclaration d'Appli-│
    │    cabilité (SOA)     │
    └──────────┬───────────┘
               │
DO (Implémenter)          CHECK (Vérifier)
┌────────────────┐    ┌──────────────────────┐
│ 4. Mise en    │    │ 5. Audits internes   │
│ œuvre des     │    │ 6. Revue de Direction│
│ contrôles     │    │ 7. Indicateurs KPI   │
│ (Annexe A)    │    │    de sécurité       │
└──────┬────────┘    └──────────────────────┘
       │
    ACT (Améliorer)
    ┌──────────────────┐
    │ 8. Actions        │
    │ correctives       │
    │ 9. Amélioration  │
    │ continue          │
    └──────────────────┘
```

---

## 3) Module — Audit de Conformité & Risk Management COBIT (2h)

### 📖 Narration/Intuition

Le **Risk Management IT** selon **COBIT (Control Objectives for Information and Related Technologies)** est le processus d'identification, d'évaluation, de traitement et de surveillance des risques informatiques qui pourraient compromettre les objectifs business de la BCC.

### 🛠️ Atelier Pratique

**Registre des Risques IT BCC (Risk Register) — Extrait :**

```markdown
# REGISTRE DES RISQUES IT — BCC — 2026
## Matricule : BCC-RISK-2026 | Classification : CONFIDENTIEL

| ID | Risque Identifié | Vraisemblance | Impact | Score Brut | Contrôles Existants | Score Net | Traitement |
|---|---|:---:|:---:|:---:|---|:---:|---|
| R-001 | Compromission des identifiants administrateurs (Credential Stuffing) | 4/5 | 5/5 | 20/25 | MFA, PAW, CrowdStrike EDR | 8/25 | ATTÉNUER (MFA FIDO2) |
| R-002 | Ransomware ciblant l'infrastructure de core banking | 3/5 | 5/5 | 15/25 | EDR, Backups S3 Immuables, NGFW | 6/25 | ATTÉNUER + TRANSFÉRER (Cyber-assurance) |
| R-003 | Fuite de données clients via une API mal configurée (BOLA) | 4/5 | 4/5 | 16/25 | Pentest semestriel, CodeQL SAST | 6/25 | ATTÉNUER (Tests DAST automatisés en CI) |
| R-004 | Panne prolongée de l'hébergeur AWS (Région eu-west-1) | 2/5 | 5/5 | 10/25 | Multi-AZ, RDS Multi-AZ | 5/25 | ATTÉNUER (Architecture Multi-Région) |
| R-005 | Non-conformité PCI-DSS (Amende régulateur) | 2/5 | 4/5 | 8/25 | Audit PCI-DSS semestriel, ASV Scans | 3/25 | ACCEPTER (Risque résiduel faible) |

### Légende :
- Score Brut = Vraisemblance × Impact (avant contrôles)
- Score Net = Score estimé APRÈS application des contrôles existants
- TRAITEMENT : ATTÉNUER | TRANSFÉRER | ÉVITER | ACCEPTER
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **RGPD** | Règlement Général sur la Protection des Données — Régulation européenne sur la vie privée |
| **PCI-DSS** | Payment Card Industry Data Security Standard — Standard sécurité données cartes bancaires |
| **DPO** | Data Protection Officer — Délégué à la Protection des Données (obligatoire RGPD) |
| **DPIA** | Data Protection Impact Assessment — Analyse d'Impact relative à la Protection des Données |
| **SMSI** | Système de Management de la Sécurité de l'Information (ISO 27001) |
| **COBIT** | Control Objectives for Information and Related Technologies — Référentiel de gouvernance IT |
| **SOA** | Statement of Applicability — Déclaration d'Applicabilité (Liste des contrôles ISO 27001 appliqués) |
| **PSSI** | Politique de Sécurité du Système d'Information — Document définissant les règles de sécurité |
| **ASV** | Approved Scanning Vendor — Prestataire agréé PCI-DSS pour les scans de vulnérabilités |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Selon le RGPD, quelle est la différence entre la **pseudonymisation** et l'**anonymisation** des données personnelles, et laquelle maintient encore l'application du RGPD ?

**Corrigé :** La **pseudonymisation** remplace les identifiants directs (nom, email) par des pseudonymes ou codes (ex: `hash(clientId)`), mais il reste possible de ré-identifier la personne avec une table de correspondance. Les données pseudonymisées **restent des données personnelles** et sont toujours soumises au RGPD. L'**anonymisation** irréversible rend toute ré-identification **techniquement impossible** (ex: suppression définitive de toute information de liaison). Les données véritablement anonymisées **ne sont plus soumises au RGPD**. En pratique, l'anonymisation parfaite est très difficile à atteindre (risque de ré-identification par recoupement de plusieurs champs apparemment non-identifiants).

**Exercice 2 :** Quels sont les 4 traitements possibles d'un risque IT selon COBIT et le Risk Management, et donner un exemple concret de chaque pour la BCC ?

**Corrigé :** (1) **ATTÉNUER** : Réduire la probabilité ou l'impact via des contrôles. Ex BCC : Déployer le MFA FIDO2 pour atténuer le risque de compromission de comptes administrateurs. (2) **TRANSFÉRER** : Partager ou externaliser le risque financier. Ex BCC : Souscrire une cyber-assurance couvrant les coûts d'un incident ransomware. (3) **ÉVITER** : Éliminer l'activité qui génère le risque. Ex BCC : Décider de ne pas traiter les paiements en cryptomonnaies pour éviter les risques de compliance associés. (4) **ACCEPTER** : Tolérer le risque résiduel jugé acceptable. Ex BCC : Accepter le risque résiduel très faible de non-conformité PCI-DSS après implémentation de tous les contrôles requis, car le coût de réduction supplémentaire serait disproportionné.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Selon le RGPD, qu'est-ce que le **Droit à l'Oubli (Article 17)** et dans quels cas une banque comme la BCC peut-elle légitimement le REFUSER ?
- A) Le droit à l'oubli permet à un client de demander la suppression de ses données. La BCC peut légitimement refuser si une obligation légale de conservation s'applique (ex: conservation des données de transactions bancaires pendant 10 ans pour les autorités fiscales)
- B) Le droit à l'oubli est absolu et la banque doit toujours effacer
- C) Le droit à l'oubli ne s'applique qu'aux données en ligne publiques
- D) Le droit à l'oubli concerne uniquement les données de navigation web

**Réponse : A**

**Q2 :** Quelle exigence PCI-DSS interdit formellement le stockage du **CVV/CVC** (code de sécurité à 3 chiffres de la carte) après l'autorisation d'une transaction ?
- A) Exigence 3 — Protéger les données de compte stockées (No post-authorization CVV storage)
- B) Exigence 6 — Développer des applications sécurisées
- C) Exigence 10 — Journaliser les accès
- D) Exigence 12 — Maintenir une politique de sécurité

**Réponse : A**

**Q3 :** Quel est le référentiel de gouvernance IT utilisé pour la gestion des risques et la définition des objectifs de contrôle de la sécurité informatique dans les grandes organisations ?
- A) COBIT (Control Objectives for Information and Related Technologies)
- B) ITIL uniquement
- C) OWASP
- D) NIST SP 800-53

**Réponse : A**

**Q4 :** Dans l'ISO 27001, qu'est-ce que la **Déclaration d'Applicabilité (SOA — Statement of Applicability)** ?
- A) Un document listant tous les contrôles de l'Annexe A d'ISO 27001, indiquant pour chacun s'il est applicable à l'organisation, et la justification de l'inclusion ou exclusion
- B) Un formulaire de demande de certification ISO
- C) La liste des incidents de sécurité de l'année
- D) Le contrat commercial avec l'auditeur ISO

**Réponse : A**

**Q5 :** Selon le principe de **minimisation des données (RGPD)**, quelle approche est correcte pour la BCC lors de la collecte de données à l'ouverture d'un compte bancaire ?
- A) Collecter uniquement les données strictement nécessaires à la finalité définie (ex: nom, prénom, nationalité, numéro d'identité) — pas de collecte préventive de données qui pourraient être utiles un jour
- B) Collecter le maximum de données pour anticiper les usages futurs
- C) Collecter des données biométriques complètes pour tous les clients
- D) Collecter les données de navigation web des clients pour personnaliser les offres

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
