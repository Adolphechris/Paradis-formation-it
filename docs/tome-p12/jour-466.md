# TOME P12 — Gouvernance, Compliance & Architecture Finale — Jour 466 (6h) : Architecture de Sécurité d'Entreprise & Standard Zero-Trust (TOGAF, SABSA, NIST SP 800-207 & Enterprise Security Blueprint)

> [!NOTE]
> **Objectifs pédagogiques :**
> - Concevoir des architectures de sécurité d'entreprise avec les cadres **SABSA** (Sherwood Applied Business Security Architecture) et **TOGAF**
> - Implémenter le standard **Zero-Trust Architecture (ZTA)** selon la norme **NIST SP 800-207** (PDP, PEP, Continuous Authentication)
> - Articuler la sécurité à travers toutes les couches d'entreprise : Business, Information, Application, Infrastructure et Cryptographie
> - Rédiger l'**Enterprise Security Architecture Blueprint** pour les infrastructures Cloud et Hybrides
>
> **Compétences visées :** `POL-01` (A) — Enterprise Security Architecture, `POL-03` (A) — Zero-Trust Architecture

---

## Module 1 — Cadres d'Architecture SABSA & TOGAF (2h)

### 📖 Intuition & Narration

L'architecture de sécurité d'entreprise ne s'improvise pas : elle doit faire le pont entre les **objectifs stratégiques de l'entreprise** (business goals) et les **implémentations techniques de bas niveau** (règles de pare-feu, jetons OAuth2, algorithmes cryptographiques). C'est la raison d'être du framework **SABSA** (Sherwood Applied Business Security Architecture), qui structure l'architecture en 6 couches logiques de la vue Contextuelle (Business) jusqu'à la vue Opérationnelle.

### 🔍 Anatomie Technique — Matrice d'Architecture SABSA

```
MATRICE D'ARCHITECTURE DE SÉCURITÉ SABSA (6 COUCHES)

  ┌─────────────────────────────────────────────────────────────┐
  │  1. CONTEXTUELLE (Business Architecture)                    │
  │     ├── Quels sont les objectifs métiers & l'appétence au risque ?│
  ├─────────────────────────────────────────────────────────────┤
  │  2. CONCEPTUELLE (Conceptual Architecture)                  │
  │     ├── Quels principes de sécurité appliquer (ex: Zero-Trust) ?│
  ├─────────────────────────────────────────────────────────────┤
  │  3. LOGIQUE (Logical Security Architecture)                 │
  │     ├── Quels sont les domaines de confiance & flux de données ?│
  ├─────────────────────────────────────────────────────────────┤
  │  4. PHYSIQUE (Physical Security Architecture)               │
  │     ├── Quels composants (HSM, K8s, Vault, WAF, NGFW) ?      │
  ├─────────────────────────────────────────────────────────────┤
  │  5. COMPOSANTS (Component Architecture)                     │
  │     ├── Quels protocoles (TLS 1.3, SPIFFE/SPIRE, OPA, AES) ? │
  ├─────────────────────────────────────────────────────────────┤
  │  6. OPÉRATIONNELLE (Operational Architecture)               │
  │     ├── Comment administrer, surveiller & auditer (SOC/SIEM) ?│
  └─────────────────────────────────────────────────────────────┘
```

---

## Module 2 — Architecture Zero-Trust NIST SP 800-207 (2h)

### 🔍 Anatomie Technique — Composants Zero-Trust NIST SP 800-207

```
ARCHITECTURE ZERO-TRUST (NIST SP 800-207)

  ┌─────────────────────────────────────────────────────────────┐
  │  SUBJECT / WORKLOAD (Demandeur d'accès)                     │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ Requête d'accès mTLS / Identity
                   ┌─────────────▼─────────────┐
                   │  Policy Enforcement Point │ (PEP — Gateway / Mesh)
                   │  (Istio / Envoy / WAF)    │
                   └─────────────┬─────────────┘
                                 │ Evaluation décision
                   ┌─────────────▼─────────────┐
                   │  Policy Decision Point    │ (PDP)
                   │  ┌──────────────────────┐ │
                   │  │ Policy Engine (OPA)  │ │ ◄── Threat Intel
                   │  │ Policy Administrator │ │ ◄── PKI / SPIRE SVID
                   │  └──────────────────────┘ │ ◄── EDR State / Posture
                   └───────────────────────────┘
```

---

## Module 3 — Blueprint d'Architecture Cloud-Native Hybride (1h30)

### 🛠️ Structure de l'Enterprise Security Blueprint

```markdown
# ENTERPRISE SECURITY ARCHITECTURE BLUEPRINT — PARADIS ZTA

1. PRINCIPES DIRECTEURS
   - P1: Ne jamais faire confiance, toujours vérifier (Never Trust, Always Verify).
   - P2: Assumer la compromission (Assume Breach) — Isolation stricte micro-segmentée.
   - P3: Moindre privilège cryptographique & identité éphémère (SPIFFE/SPIRE 1h SVID).

2. DOMAINES DE CONFIANCE & POLICIES
   - Identité Workload : SPIFFE ID `spiffe://paradis.it/ns/prod/sa/banking-api`
   - Chiffrement inter-services : mTLS Strict avec TLS 1.3 Post-Quantique Hybride.
   - Contrôle d'accès applicatif : OPA Rego Policy Engine au niveau Envoy PEP.
```

---

## Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **SABSA** | Sherwood Applied Business Security Architecture — Cadre d'architecture de sécurité d'entreprise aligné sur le business |
| **PDP** | Policy Decision Point — Composant Zero-Trust évaluant les politiques et autorisant ou refusant une requête |
| **PEP** | Policy Enforcement Point — Composant Zero-Trust interceptant le trafic et appliquant la décision du PDP |
| **ZTA** | Zero Trust Architecture — Modèle de sécurité supprimant la notion de zone de confiance implicite |

---

## Exercices Pratiques

### Exercice 1 — Rôles PDP vs PEP

Dans une architecture Zero-Trust basée sur Istio Service Mesh, quel composant joue le rôle de **PEP (Policy Enforcement Point)** et quel composant joue le rôle de **PDP (Policy Decision Point)** ?

**Corrigé guidé :**
- **PEP (Policy Enforcement Point) :** Les proxies sidecar **Envoy** injectés dans chaque pod, qui interceptent physiquement les requêtes HTTP/mTLS entrantes et sortantes.
- **PDP (Policy Decision Point) :** Le plan de contrôle **Istiod / OPA Engine**, qui évalue les règles d'autorisation, vérifie les certificats SPIFFE SVID et transmet la décision au proxy Envoy.

---

## Banque QCM — 5 Questions

**Q1.** Le principe fondamental de l'architecture **Zero-Trust (NIST SP 800-207)** est :

- A) Faire confiance à tout équipement situé à l'intérieur du réseau d'entreprise
- B) Ne jamais accorder de confiance implicite basée sur la localisation réseau ; toujours vérifier et autoriser chaque requête ✅
- C) Utiliser uniquement des mots de passe en majuscules
- D) Supprimer tous les pare-feu de l'entreprise

**Q2.** Dans le modèle SABSA, la couche **Contextuelle** s'intéresse à :

- A) La configuration des registres du processeur x86-64
- B) Les objectifs métiers, le contexte d'entreprise et l'appétence au risque ✅
- C) Les câbles réseau en fibre optique
- D) La syntaxe des requêtes SQL

**Q3.** Le composant **PEP (Policy Enforcement Point)** dans la norme NIST SP 800-207 a pour rôle de :

- A) Stocker les sauvegardes de la base de données
- B) Intercepter la communication et appliquer la décision d'accès transmise par le PDP ✅
- C) Décompiler les malwares
- D) Générer des rapports financiers

**Q4.** Le principe **Assume Breach** (Assumer la compromission) implique de :

- A) Abandonner toute mesure de protection
- B) Concevoir l'architecture en partant du principe qu'un attaquant a déjà pénétré le réseau interne, nécessitant micro-segmentation et chiffrement partout ✅
- C) Payer systématiquement les rançons réclamées
- D) Supprimer les comptes des administrateurs

**Q5.** Quelle est la principale valeur ajoutée du cadre **SABSA** pour un CISO / RSSI ?

- A) Il remplace les ingénieurs réseau
- B) Il garantit que chaque mesure de sécurité technique est directement justifiable par un besoin ou objectif métier (Business Alignment) ✅
- C) Il permet de pirater les concurrents
- D) Il est gratuit et ne nécessite aucun travail

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
