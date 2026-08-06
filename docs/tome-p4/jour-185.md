# TOME P4 — Cloud, DevOps & SecOps — Jour 185 (6h) : Projet Intégrateur Semestre 4 — Partie 4 : Architecture SecOps Complète BCC (SOC, SIEM, NGFW, Zero Trust & Forensique)

> [!NOTE]
> **Objectif du jour :** Synthétiser les acquis des Jours 181 à 184 dans un **projet intégrateur complet** centré sur la sécurité opérationnelle : conception de l'architecture **SecOps complète** de la BCC, intégration du **SOC** avec le SIEM ELK, définition des flux de sécurité Zero Trust, élaboration des procédures de gestion des incidents majeurs (ransomware, exfiltration) et documentation de la posture de sécurité globale.
>
> **Compétences visées :** `SEC-04` à `SEC-07` (A) — Architecture SecOps Complète BCC | `OPS-05` (A) — Résilience & Continuité

---

## 1) Module — Architecture SecOps Complète BCC (2h)

### 📖 Narration/Intuition

Après avoir étudié séparément le Pentest Web, le NGFW/Zero Trust, la Cryptographie et le SOC/SIEM, nous assemblons ces composants dans une **architecture SecOps** unifiée et cohérente pour la Banque Centrale du Congo. Cette architecture matérialise le concept de **Défense en Profondeur** : plusieurs couches de sécurité indépendantes, de sorte qu'un attaquant devant franchir chaque couche successive soit arrêté avant d'atteindre les données critiques.

### 🔍 Anatomie Technique

**Architecture Défense en Profondeur BCC — 7 Couches :**

```
INTERNET (Attaquants, Clients)
    │
    ▼ COUCHE 1 — PÉRIMÈTRE CLOUD
┌────────────────────────────────────────────────────────────┐
│ AWS CloudFront + WAF                                       │
│ ├── Protection DDoS volumétrique (AWS Shield Advanced)     │
│ ├── WAF Rules : SQLi, XSS, OWASP Top 10                   │
│ └── Géo-restriction : Blocage des pays à risque           │
└─────────────────────┬──────────────────────────────────────┘
    │
    ▼ COUCHE 2 — RÉSEAU DMZ
┌────────────────────────────────────────────────────────────┐
│ NGFW Palo Alto (Mode Inspection L7)                        │
│ ├── Identification des applications et utilisateurs       │
│ ├── IPS intégré (Signatures Palo Alto + règles BCC)       │
│ ├── Déchiffrement SSL/TLS sortant (Anti-Exfiltration)     │
│ └── URL Filtering + Threat Intelligence Feeds             │
└─────────────────────┬──────────────────────────────────────┘
    │
    ▼ COUCHE 3 — RÉSEAU INTERNE (Zero Trust)
┌────────────────────────────────────────────────────────────┐
│ Microsegmentation K8s (NetworkPolicies)                   │
│ ├── Service Mesh Istio avec mTLS inter-services           │
│ ├── Suricata IDS/IPS (East-West Traffic)                  │
│ └── Zero Trust : Chaque service s'authentifie mutuellement│
└─────────────────────┬──────────────────────────────────────┘
    │
    ▼ COUCHE 4 — IDENTITÉS & ACCÈS
┌────────────────────────────────────────────────────────────┐
│ IAM & Authentification                                     │
│ ├── MFA Obligatoire : FIDO2/TOTP pour tous les comptes   │
│ ├── JWT RS256 avec rotation des clés (AWS KMS)            │
│ ├── OAuth2/OIDC avec scopes minimaux                      │
│ └── Privileged Access Management (PAW) pour admins        │
└─────────────────────┬──────────────────────────────────────┘
    │
    ▼ COUCHE 5 — APPLICATIONS
┌────────────────────────────────────────────────────────────┐
│ Sécurité Applicative                                       │
│ ├── SAST/DAST dans pipeline CI/CD (CodeQL + OWASP ZAP)   │
│ ├── Dependency Scanning (Trivy, Snyk)                     │
│ ├── OWASP Anti-BOLA, Anti-SQLi, Anti-XSS                 │
│ └── Rate Limiting + CORS Strict + CSP Headers             │
└─────────────────────┬──────────────────────────────────────┘
    │
    ▼ COUCHE 6 — DONNÉES
┌────────────────────────────────────────────────────────────┐
│ Protection des Données                                     │
│ ├── Chiffrement AES-256-GCM au repos (AWS KMS/HSM)        │
│ ├── TLS 1.3 en transit (PFS obligatoire)                  │
│ ├── Tokenisation des PAN/PIN (PCI-DSS)                    │
│ └── DLP : Prévention de l'Exfiltration                    │
└─────────────────────┬──────────────────────────────────────┘
    │
    ▼ COUCHE 7 — DÉTECTION & RÉPONSE (SOC)
┌────────────────────────────────────────────────────────────┐
│ SOC 24/7 BCC                                               │
│ ├── SIEM ELK Stack (Corrélation multi-sources)            │
│ ├── Alerting Prometheus/Grafana (Métriques Applicatives)  │
│ ├── SOAR : Playbooks automatisés (PagerDuty)              │
│ └── Threat Hunting mensuel (Framework ATT&CK)             │
└────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Gestion des Incidents Majeurs : Playbook Ransomware (2h)

### 📖 Narration/Intuition

Le **Ransomware** est la menace #1 pour les institutions bancaires africaines. Un groupe APT (Advanced Persistent Threat) peut infiltrer l'infrastructure BCC via un email de phishing, se déplacer latéralement (Lateral Movement) pendant des semaines sans être détecté, chiffrer les données critiques et exiger une rançon.

### 🔍 Anatomie Technique

**Playbook d'Urgence — Incident Ransomware BCC :**

```markdown
# PLAYBOOK BCC-PLAY-007 — INCIDENT RANSOMWARE
# Sévérité : P0 CRITIQUE | Délai de Réponse : 5 MINUTES

## INDICATEURS DE DÉTECTION
- SIEM : Chiffrement massif de fichiers (extensions .bcc_encrypted, .locked)
- EDR CrowdStrike : Process VSSadmin delete shadows (suppression des sauvegardes VSS)
- Suricata : Communication C2 vers IP malveillante connue
- Prometheus : CPU 100% sur multiple VMs simultanément (chiffrement en cours)

## PHASE 1 — CONTAINMENT IMMÉDIAT (< 5 MINUTES) — AUTOMATISÉ SOAR
□ Isoler les VMs / Pods infectés du réseau (Network Policy + NGFW BLOCK)
□ Couper les connexions VPN de tous les utilisateurs actifs
□ Révoquer tous les tokens d'authentification actifs (JWT + Session Cookies)
□ Activer le mode "Lockdown" NGFW (Bloquer TOUT le trafic sortant non approuvé)
□ Déclencher l'alerte P0 PagerDuty → CISO, DG BCC, Équipe IR

## PHASE 2 — ÉVALUATION (5-30 MINUTES)
□ Identifier le "Patient Zéro" (Premier système chiffré — source de l'infection)
□ Cartographier les systèmes affectés via EDR CrowdStrike Dashboard
□ Évaluer si les backups sont intacts (pgBackRest PITR S3 — Immuable ?)
□ Identifier le vecteur d'entrée initial (Email phishing? Exploitation CVE? Credential?)

## PHASE 3 — ÉRADICATION
□ Snapshot forensique de chaque VM compromise AVANT nettoyage
□ Réimager les systèmes compromis depuis des images dorées (Golden Images)
□ Restaurer les données depuis les backups S3 immuables (PITR PostgreSQL)
□ Patcher la vulnérabilité exploitée (CVE identifiée)
□ Scanner TOUS les systèmes avec CrowdStrike (Recherche de persistance)

## PHASE 4 — COMMUNICATION (Pendant tout l'incident)
□ Notifier la BNR (Banque Nationale Régulatrice) dans les 72h (RGPD/PCI-DSS)
□ Communication interne contrôlée (Éviter la panique)
□ Coordination avec les équipes juridiques (Non-divulgation vs transparence)

## PHASE 5 — POST-INCIDENT (72h après résolution)
□ Rapport d'incident complet (Root Cause Analysis)
□ Mise à jour des règles SIEM, NGFW, EDR
□ Formation de sensibilisation obligatoire pour tout le personnel BCC
□ Révision du BCP (Business Continuity Plan)
```

---

## 3) Module — Métriques de Sécurité & Reporting CISO (2h)

### 📖 Narration/Intuition

Le CISO (Chief Information Security Officer) de la BCC doit rendre compte de la posture de sécurité au Conseil d'Administration. Il a besoin de **métriques de sécurité** claires, actionnables et orientées risque business, pas de données techniques pures.

### 🛠️ Atelier Pratique

**Dashboard KPI Sécurité BCC — Rapport Mensuel CISO :**

```markdown
# RAPPORT SÉCURITÉ MENSUEL — BCC — Juillet 2026
## Classificiation : CONFIDENTIEL — CISO & DG UNIQUEMENT

### 1. POSTURE GLOBALE : 🟡 RISQUE MODÉRÉ

### 2. MÉTRIQUES OPÉRATIONNELLES SOC

| Métrique | Ce Mois | Mois Préc. | Objectif | Statut |
|---|---|---|---|---|
| MTTD (Mean Time To Detect) | 8 min | 15 min | < 10 min | ✅ |
| MTTR (Mean Time To Recover) | 45 min | 72 min | < 60 min | ✅ |
| Incidents P0 | 0 | 1 | 0 / mois | ✅ |
| Incidents P1 | 2 | 3 | < 3 / mois | ✅ |
| Alertes SIEM traitées | 1,247 | 1,089 | N/A | ℹ️ |
| Faux Positifs SIEM | 23% | 31% | < 20% | ⚠️ |

### 3. SÉCURITÉ APPLICATIVE

| Métrique | Valeur | Cible | Statut |
|---|---|---|---|
| Vulns CRITIQUES open > 30j | 0 | 0 | ✅ |
| Vulns ÉLEVÉES open > 30j | 2 | < 5 | ✅ |
| Couverture tests SAST (CodeQL) | 98% | 100% | ⚠️ |
| Couverture tests automatisés | 87% | > 80% | ✅ |
| Certificats TLS expirant < 30j | 0 | 0 | ✅ |

### 4. GESTION DES ACCÈS IAM

| Métrique | Valeur | Statut |
|---|---|---|
| Comptes avec MFA activé | 99.2% | ✅ |
| Comptes avec privilèges excessifs | 3 | ⚠️ Correction planifiée |
| Comptes inactifs > 90j (non désactivés) | 0 | ✅ |

### 5. RISQUES IDENTIFIÉS CE MOIS

1. **[RISQUE ÉLEVÉ]** : 2 vulnérabilités HIGH dans image Docker node:20-alpine
   → Mise à jour planifiée J+7

2. **[RISQUE MODÉRÉ]** : 3 comptes avec droits admin non nécessaires
   → Revue d'accès planifiée J+3 avec les managers concernés

### 6. PLAN D'ACTION MOIS PROCHAIN
- Réduire le taux de Faux Positifs SIEM de 23% à < 20% (Tuning des règles)
- Déployer FIDO2 Passkeys pour les administrateurs système
- Exercice de simulation Ransomware (Tabletop Exercise)
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **CISO** | Chief Information Security Officer — Directeur de la Sécurité des Systèmes d'Information |
| **APT** | Advanced Persistent Threat — Menace persistante avancée, acteur de menace sophistiqué et motivé |
| **BCP** | Business Continuity Plan — Plan de Continuité des Activités en cas d'incident majeur |
| **PAW** | Privileged Access Workstation — Poste de travail dédié et durci pour les accès administrateurs |
| **VSS** | Volume Shadow Copy Service — Service Windows de snapshots de volumes (souvent ciblé par les ransomwares) |
| **Tabletop** | Exercice de simulation d'incident sur table — Simulation théorique sans impact système réel |
| **Golden Image** | Image système de référence validée, utilisée pour réimager les systèmes compromis |
| **PCI-DSS** | Payment Card Industry Data Security Standard — Standard de sécurité pour les données de cartes bancaires |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer le concept de **Défense en Profondeur** et illustrer pourquoi une architecture à 7 couches de sécurité est plus résiliente qu'une architecture reposant uniquement sur un firewall périmétrique unique.

**Corrigé :** La **Défense en Profondeur** est une stratégie de sécurité héritée du domaine militaire : disposer de **multiples couches de protection indépendantes** autour des actifs critiques. Si une couche est compromise, les autres continuent de protéger le système. Exemple concret BCC : Un attaquant qui parvient à bypasser le WAF CloudFront (Couche 1) est arrêté par le NGFW (Couche 2). S'il compromet un Pod K8s via une vulnérabilité applicative (Couche 5), la microsegmentation Zero Trust (Couche 3) l'empêche d'atteindre la base de données PostgreSQL (les NetworkPolicies bloquent le trafic East-West non autorisé). S'il exfiltre des données (Couche 6), celles-ci sont chiffrées AES-256-GCM (illisibles sans la clé KMS). S'il persiste dans le système, le SOC/SIEM (Couche 7) le détecte via les anomalies comportementales. Un firewall périmétrique unique est un point de défaillance unique (SPOF de sécurité) : une fois franchi, l'attaquant a accès libre à l'ensemble du réseau.

**Exercice 2 :** Dans un incident de type Ransomware, pourquoi la commande `VSSadmin delete shadows` exécutée par le malware est-elle un **indicateur critique** à détecter immédiatement dans les logs EDR/SIEM ?

**Corrigé :** `VSSadmin delete shadows` est la commande Windows qui supprime les **Volume Shadow Copies (VSS)** — les sauvegardes locales de snapshots créées automatiquement par Windows. Les ransomwares exécutent systématiquement cette commande au début de leur phase de chiffrement pour **empêcher la récupération des données sans payer la rançon**. Si les VSS sont supprimées avant que le chiffrement des fichiers soit terminé ET que les backups distants (S3, pgBackRest) sont aussi compromis ou hors ligne, la victime peut se retrouver sans aucune option de restauration. La détection EDR/SIEM de cette commande (même exécutée par un processus légitime, c'est une anomalie comportementale rare) doit déclencher une **alerte P0 immédiate** et activer le playbook de containment pour stopper le chiffrement avant qu'il ne soit complété. C'est l'une des signatures comportementales (TTP) les plus fiables d'un ransomware en cours d'exécution.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Qu'est-ce que la **Défense en Profondeur (Defense in Depth)** en cybersécurité ?
- A) Une stratégie de sécurité disposant de multiples couches de protection indépendantes, de sorte qu'un attaquant devant franchir chaque couche successive soit stoppé avant d'atteindre les actifs critiques
- B) Un seul firewall très performant en périphérie du réseau
- C) L'utilisation exclusive du chiffrement pour protéger les données
- D) Un plan de sauvegarde des données

**Réponse : A**

**Q2 :** Dans le contexte PCI-DSS (standard de sécurité des cartes bancaires), qu'est-ce que la **tokenisation** des données de carte (PAN/PIN) ?
- A) Le remplacement de la donnée sensible réelle (numéro de carte) par un token non-sensible (identifiant aléatoire) qui n'a aucune valeur pour un attaquant s'il est volé
- B) Le chiffrement du numéro de carte avec AES-256
- C) Le hachage du numéro de carte avec SHA-256
- D) La compression des données de carte avant stockage

**Réponse : A**

**Q3 :** Qu'est-ce qu'un **APT (Advanced Persistent Threat)** et en quoi se distingue-t-il des attaques cybercriminelles opportunistes ?
- A) Un APT est un acteur de menace sophistiqué (souvent étatique ou criminel organisé) qui s'infiltre discrètement dans une organisation et maintient un accès persistant non détecté pendant des mois, avec des objectifs d'espionnage ou de sabotage ciblés
- B) Un APT est une attaque DDoS volumétrique
- C) Un APT est un malware distribué aléatoirement par email
- D) APT signifie Automated Phishing Tool

**Réponse : A**

**Q4 :** Dans les métriques SOC, qu'est-ce que le **MTTD (Mean Time To Detect)** et pourquoi est-il aussi important que le MTTR ?
- A) Le MTTD mesure le temps moyen entre le début d'une attaque et sa détection par le SOC. Plus il est court, moins l'attaquant a eu le temps de progresser dans le réseau (Lateral Movement, Data Access). Un MTTD court limite drastiquement le rayon d'impact de l'incident
- B) Le MTTD mesure la vitesse du réseau
- C) Le MTTD est le nombre d'incidents par mois
- D) Le MTTD mesure le temps de déploiement d'un patch de sécurité

**Réponse : A**

**Q5 :** Pourquoi les backups S3 **immuables (S3 Object Lock — WORM)** sont-ils une protection essentielle contre les ransomwares dans l'architecture BCC ?
- A) Les backups S3 immuables ne peuvent pas être modifiés ou supprimés pendant la période de rétention configurée, même par un administrateur ayant les droits AWS — un ransomware qui compromet l'infrastructure ne peut donc pas chiffrer ou supprimer ces sauvegardes, garantissant la restauration des données sans payer de rançon
- B) Les backups S3 sont automatiquement chiffrés avec AES-512
- C) Les backups S3 sont répliqués en temps réel sur 100 régions
- D) Les backups S3 immuables sont plus rapides à restaurer

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
