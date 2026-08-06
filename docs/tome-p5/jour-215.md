# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 215 (6h) : Projet Intégrateur Semestre 5 — Partie 3 : Simulation d'Infiltration Hybride Active Directory + Entra ID (Azure AD) & Détection SOC (Synthèse J211-J214)

> [!NOTE]
> **Objectif du jour :** Synthetiser les acquis des Jours 211 à 214 dans un **projet intégrateur avancé de sécurité hybride** : simulation d'un scénario d'attaque complexe d'un groupe APT traversant une infrastructure hybride (On-Premise Active Directory ──► Entra ID / Microsoft 365 Cloud), analyse de malware, enrichissement CTI et détection SOC multi-niveaux.
>
> **Compétences visées :** `SEC-06` (A) — Advanced Hybrid Red Team & Cloud Pivot | `SEC-07` (A) — SOC Hybrid Detection & Threat Hunting

---

## 1) Module — Scénario d'Attaque Hybride (On-Premise vers Cloud) (2h)

### 📖 Narration/Intuition

Dans une entreprise moderne avec une identité hybride, la compromission de l'Active Directory local n'est souvent que la première étape. Les attaquants utilisent la synchronisation Entra Connect (Azure AD Connect) pour **pivoter du réseau local (On-Premise) vers l'environnement Cloud (Entra ID / Azure / M365)**.

### 🔍 Anatomie Technique

**Déroulement du Scénario d'Attaque Hybride BCC :**

```
 ┌────────────────────────────────────────────────────────┐
 │ 1. INFILTRATION LOCAL (On-Premise)                     │
 │  - Analyse du malware boursier (Jour 211)              │
 │  - Compromission du serveur local BDD                  │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2. ESCALADE & DOMAIN ADMIN (Jour 213)                  │
 │  - Golden Ticket krbtgt ──► Prise de contrôle DC01     │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3. PIVOT HYBRIDE (On-Premise ──► Entra ID / Cloud)     │
 │  - Extraction des identifiants du serveur Entra Connect│
 │    (Compte MSOL_xxxx / AD Sync Account)                │
 │  - Attaque Seamless SSO / PRT Hijacking (Jour 214)     │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 4. ACCÈS GLOBAL CLOUD (Entra ID Global Admin)          │
 │  - Prise de contrôle de Microsoft 365, Azure Portal    │
 │  - Exfiltration des emails de la Direction Général     │
 └────────────────────────────────────────────────────────┘
```

---

## 2) Module — Matrice de Détection & Corrélation SOC (2h)

### 📖 Narration/Intuition

L'équipe Blue Team / SOC de la BCC doit être capable de corréler les événements de sécurité provenant à la fois des contrôleurs de domaine On-Premise et des logs d'audit Cloud Entra ID.

### 🔍 Anatomie Technique

**Corrélation d'Alertes Multi-Sources dans le SIEM :**

```markdown
# SCÉNARIO DE CORRÉLATION SIEM ELK — ATTAQUE HYBRIDE

1. **ÉVÉNEMENT ON-PREMISE (Event ID 4662)**
   - Source : Agent Winlogbeat sur DC01
   - Action : Demande de réplication DCSync depuis l'IP `10.0.4.15` (Poste `PC-042`)
   - Détection : Alerte SOC P1 "DCSync Attack Detected"

2. **ÉVÉNEMENT CLOUD (Entra ID Audit Log)**
   - Source : Azure AD Diagnostic Settings / Log Analytics
   - Action : Exportation des identifiants de synchronisation Entra Connect
   - Détection : Alerte SOC P0 "Entra Connect Sync Account Compromise"

3. **ÉVÉNEMENT ENDPOINT / EDR (Falco / CrowdStrike)**
   - Source : Agent EDR sur le poste PC-042
   - Action : Execution de Mimikatz `sekurlsa::cloudap` (Dump du PRT)
   - Détection : Alerte SOC P0 "PRT Memory Dump Attempt"
```

---

## 3) Module — Plan de Sécurisation Hybride & Architecture Zero Trust (2h)

### 📖 Narration/Intuition

Le plan de remédiation apporte des solutions concrètes pour couper le pont d'attaque entre l'On-Premise et le Cloud.

### 🛠️ Atelier Pratique

**Recommandations de Sécurisation Hybride (Blue Team Architecture) :**

```markdown
# FEUILLE DE ROUTE DE SÉCURISATION HYBRIDE — BCC

1. **SÉCURISATION DU SERVEUR ENTRA CONNECT (Tier 0)**
   - Placer le serveur de synchronisation **Entra Connect dans le Tier 0** d'Active Directory.
   - Restreindre les accès administrateurs au serveur Entra Connect aux seuls Domain Admins.

2. **ACTIVATION DU PASS-THROUGH AUTHENTICATION OU FIDO2**
   - Remplacer les mécanismes de synchronisation de hash vulnérables par des clés **FIDO2 YubiKey** pour l'accès aux deux mondes.

3. **PROTECTION DES LOGS SIEM CENTRALISÉE**
   - Transmettre les logs d'audit Active Directory (Winlogbeat) ET les logs Entra ID (Diagnostic Settings) dans le même cluster **SIEM ELK / OpenSearch**.
   - Activer les règles de corrélation KQL pour détecter la progression cross-domain.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PRT** | Primary Refresh Token — Jeton SSO Entra ID principal |
| **DCSync** | Technique d'attaque Kerberos simulant un contrôleur de domaine |
| **KQL** | Kibana Query Language — Langage de requête de recherche SIEM |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Pourquoi le serveur de synchronisation **Entra Connect (Azure AD Connect)** doit-il être impérativement classé et protégé au même niveau qu'un **Contrôleur de Domaine (Tier 0)** ?

**Corrigé :** Le serveur Entra Connect fait le pont direct entre l'Active Directory On-Premise et Entra ID dans le Cloud. Il possède des privilèges élevés sur l'annuaire local (droits de lecture/réplication des comptes) ET des privilèges administrateurs sur le tenant Cloud Entra ID pour créer, modifier et synchroniser les identités. Si un attaquant parvient à compromettre le serveur Entra Connect, il peut extraire la clé d'imputation cryptographique du compte de synchronisation (`MSOL_xxxx`) et s'en servir pour **pivoter instantanément de l'On-Premise vers le Cloud**, s'octroyant les privilèges *Global Administrator* sur tout le tenant Microsoft 365 d'entreprise. Pour cette raison, la doctrine Microsoft impose de classer le serveur Entra Connect en **Tier 0** et d'appliquer la même isolation stricte que pour les Contrôleurs de Domaine.

**Exercice 2 :** Dans un SIEM, pourquoi la corrélation d'un Event ID Windows 4662 (On-Premise) et d'un log d'audit Entra ID (Cloud) est-elle essentielle pour détecter une attaque par pivot hybride ?

**Corrigé :** Pris isolément, un log local ou un log cloud peut ne pas déclencher d'alerte critique ou être classé comme un faux positif. Cependant, la séquence temporelle montre un comportement d'attaque : l'Event ID 4662 révèle qu'un compte a exécuté une demande de réplication DCSync (attaque On-Premise), suivie 5 minutes plus tard d'une connexion Entra ID depuis une IP inconnue utilisant le compte administrateur synchronisé. C'est la **corrélation temporelle des deux événements** dans le SIEM qui prouve la progression effective de l'attaquant à travers la frontière réseau (Pivot Hybride), déclenchant l'alerte P0 d'isolement d'urgence.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Dans une architecture d'identité hybride, quel outil Microsoft assure la synchronisation des utilisateurs et des mots de passe entre l'Active Directory local et Microsoft Entra ID dans le Cloud ?
- A) Entra Connect (Azure AD Connect)
- B) Nmap
- C) Docker
- D) IIS Server

**Réponse : A**

**Q2 :** Pourquoi le serveur Entra Connect doit-il être classé en **Tier 0** dans le modèle de sécurité Active Directory ?
- A) Car il possède des privilèges élevés à la fois sur l'Active Directory On-Premise et sur le tenant Cloud Entra ID, constituant une passerelle directe de pivotement
- B) Car il utilise beaucoup de mémoire RAM
- C) Car il est gratuit
- D) Car il est hébergé en dehors de l'entreprise

**Réponse : A**

**Q3 :** Quelle technique permet à un attaquant ayant compromis l'Active Directory local de pivoter vers le Cloud Microsoft 365 de l'entreprise ?
- A) Le vol des identifiants du compte de synchronisation Entra Connect ou le PRT Hijacking
- B) L'envoi d'un email imprimé
- C) Le changement de câble réseau
- D) L'extinction du serveur web

**Réponse : A**

**Q4 :** Dans une architecture SIEM hybride, d'où doivent provenir les logs pour permettre la détection d'une attaque de pivotement cross-domain ?
- A) À la fois des agents locaux On-Premise (ex: Winlogbeat sur les DCs) ET des API/Diagnostic Settings du Cloud (Entra ID / Azure)
- B) Uniquement des postes de travail des clients
- C) Uniquement des imprimantes réseau
- D) Des pare-feu uniquement

**Réponse : A**

**Q5 :** Quel est l'objectif principal du plan de remédiation hybride après une simulation d'attaque Red Team réussie ?
- A) Éliminer les ponts d'attaque non sécurisés entre l'On-Premise et le Cloud et renforcer la corrélation de détection SOC
- B) Interdire l'utilisation d'ordinateurs
- C) Supprimer les comptes des administrateurs
- D) Fermer le portail bancaire en ligne

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
