# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 214 (6h) : Cloud Security Auditing & Entra ID / Azure AD Hacking (Az PowerShell, Primary Refresh Tokens PRT, Conditional Access Bypass & Cloud Red Teaming)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'évaluation de la sécurité des environnements Cloud hybrides et **Microsoft Entra ID (anciennement Azure AD)** : énumération avec **Az PowerShell / Roadrecon**, compromission des **Primary Refresh Tokens (PRT)** sur les postes Windows 11 joint à Entra ID, contournement des politiques d'**accès conditionnel (Conditional Access Bypass)**, et techniques de **Cloud Red Teaming** sur les abonnements Microsoft 365 / Azure.
>
> **Compétences visées :** `SEC-06` (A) — Entra ID / Azure AD Hacking & PRT Hijacking | `SEC-05` (A) — Cloud Security Auditing & Conditional Access Hardening

---

## 1) Module — Entra ID (Azure AD) vs Active Directory & PRT Hijacking (2h)

### 📖 Narration/Intuition

Avec la transformation numérique, la BCC utilise une architecture d'identité hybride : l'Active Directory classique On-Premise est synchronisé via **Entra Connect (Azure AD Connect)** avec **Microsoft Entra ID** dans le Cloud pour donner accès à Microsoft 365 et aux applications SaaS.

Un composant critique de cette architecture est le **Primary Refresh Token (PRT)** : un jeton OAuth2/OIDC spécial délivré par Entra ID et stocké dans le TPM/LSASS des postes Windows joint à Entra ID (Azure AD Joined). Si un attaquant vole ce PRT, il peut se faire passer pour l'utilisateur sur **toutes les applications cloud de l'entreprise** sans saisir de mot de passe ni valider le MFA !

### 🔍 Anatomie Technique

**Extraction d'un PRT (Primary Refresh Token) avec Mimikatz / RoadRecon :**

```powershell
# 1. Utiliser RoadRecon pour extraire et analyser la configuration Entra ID
python3 -m roadrecon gather

# 2. Utiliser Mimikatz (module sekurlsa::cloudap) pour dump le PRT en mémoire
mimikatz.exe "privilege::debug" "sekurlsa::cloudap" "exit"

# Output Mimikatz :
# PRT Token: eyJhbGciOiJSUzI1NiIs... (Primary Refresh Token capturé !)
# Session Key: a1b2c3d4...

# 3. Réutiliser le PRT capturé avec la plateforme ROADtools / Browser Extension
# Permet de se connecter sur n'importe quel service M365 (SharePoint, Teams, Azure Portal)
```

---

## 2) Module — Contournement d'Accès Conditionnel (Conditional Access Bypass) (2h)

### 📖 Narration/Intuition

Les politiques d'**Accès Conditionnel (Conditional Access)** d'Entra ID définissent des règles strictes d'accès (ex: "Exiger le MFA et un appareil conforme (Hybrid Join) pour accéder au Portail Azure").

Les attaquants recherchent les failles dans ces règles : appareils non gérés (BYOD) exemptés par erreur, applications légitimes exclues des règles MFA (ex: PowerShell Graph API), ou usurpation d'User-Agent.

### 🔍 Anatomie Technique

**Techniques de Contournement d'Accès Conditionnel :**

```
 ┌────────────────────────────────────────────────────────┐
 │ 1. USURPATION D'USER-AGENT / CLIENT APPS               │
 │  - Utiliser des User-Agents d'anciennes applications   │
 │    non soumises au MFA (ex: Exchange ActiveSync)       │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2. EXCLUSION D'APPLICATIONS PAR DÉFAUT                 │
 │  - Exploiter des APIs Microsoft Graph non incluses     │
 │    dans les règles d'Accès Conditionnel (ex: Azure CLI)│
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3. UTILISATION D'UN APPAREIL COMPROMIS CONFORME (PRT)  │
 │  - Le PRT extrait d'une machine conforme intègre      │
 │  déjà la preuve de conformité ("deviceIsCompliant")    │
 └────────────────────────────────────────────────────────┘
```

---

## 3) Module — Entra ID Hardening & Monitoring (2h)

### 📖 Narration/Intuition

Comment l'équipe Blue Team de la BCC peut-elle sécuriser la plateforme Entra ID et bloquer le vol de PRT et le contournement de l'accès conditionnel ?

### 🛠️ Atelier Pratique

**Recommandations de Sécurisation Entra ID (Azure AD) :**

```markdown
# GUIDE DE SÉCURISATION ENTRA ID (AZURE AD) — BCC

1. **SÉCURISATION DES PRIMARY REFRESH TOKENS (PRT)**
   - Activer **TPM 2.0 (Trusted Platform Module)** sur 100% des postes de travail.
   - Lorsque le TPM est actif, la clé de session associée au PRT est liée matériellement au processeur cryptographique TPM et **ne peut pas être extraite par Mimikatz**.

2. **DÉPLOIEMENT DE REQUIS DE CONFORMITÉ ENTRA ID STRICTS**
   - Politique d'Accès Conditionnel : Exiger un appareil marqué comme **Compliant dans Microsoft Intune** OU **Compliant Hybrid Joined** pour TOUTES les applications Cloud (sans exception pour les APIs ou CLI).

3. **BLOQUER LES PROTOCOLES D'AUTHENTIFICATION HÉRITÉS (Legacy Auth)**
   - Bloquer la chaîne d'authentification obsolète : POP3, IMAP4, SMTP Auth, Exchange ActiveSync.
   - Ces protocoles ne supportent pas le MFA et sont la cible #1 des attaques par Password Spraying.

4. **SURVEILLANCE DES CONNEXIONS ANORMALES (Identity Protection)**
   - Configurer des alertes SIEM sur les événements Entra ID :
     - *Impossible Travel* (Connexion depuis Kinshasa puis Paris 10 minutes plus tard).
     - *Unfamiliar Sign-in Properties* (Changement soudain de navigateur/OS/IP).
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **PRT** | Primary Refresh Token — Jeton principal de rafraîchissement d'authentification Entra ID |
| **TPM** | Trusted Platform Module — Puce matérielle cryptographique de sécurité sur la carte mère |
| **BYOD** | Bring Your Own Device — Utilisation d'équipements personnels dans le réseau d'entreprise |
| **OIDC** | OpenID Connect — Couche d'authentification au-dessus d'OAuth 2.0 |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Qu'est-ce qu'un **Primary Refresh Token (PRT)** dans Entra ID (Azure AD) et quel est l'impact de son vol par un attaquant via un binaire comme Mimikatz ?

**Corrigé :** Un **Primary Refresh Token (PRT)** est un jeton SSO (Single Sign-On) émis par Microsoft Entra ID lors de la connexion initiale d'un utilisateur sur un poste joint au domaine Cloud. Ce jeton intègre des preuves d'identité, de MFA valide et de conformité de l'appareil. S'il n'est pas protégé par une puce TPM 2.0 matérielle, un attaquant disposant de privilèges admin sur le poste peut utiliser Mimikatz (`sekurlsa::cloudap`) pour **voler ce PRT et sa clé de session de la mémoire RAM**. L'attaquant importe ensuite ce PRT dans son propre navigateur ou dans des outils comme ROADtools : il obtient un **accès direct et immédiat à tous les services cloud de l'entreprise (M365, Teams, Azure Portal, SharePoint)** en contournant totalement les demandes de mot de passe et de MFA.

**Exercice 2 :** Pourquoi la désactivation de l'**Authentification Héritée (Legacy Authentication)** dans Entra ID est-elle l'une des mesures de sécurité les plus efficaces contre les attaques automatisées ?

**Corrigé :** Les anciens protocoles d'authentification (Legacy Auth) comme POP3, IMAP4, SMTP et Exchange ActiveSync ont été conçus avant l'émergence de l'authentification moderne (OAuth2/OIDC). Ces protocoles transmis en clair **ne supportent pas l'authentification multifacteur (MFA)**. Si l'authentification héritée reste activée dans le tenant Entra ID, un attaquant peut mener des attaques par *Password Spraying* directement via ces anciens protocoles : le serveur Entra ID validera le mot de passe s'il est correct **sans jamais exiger de code MFA**, annulant l'ensemble des règles de sécurité déployées pour les utilisateurs. Bloquer l'authentification héritée ferme définitivement cette porte dérobée.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel est le nouveau nom de la plateforme d'identité Cloud et de gestion des accès de Microsoft (anciennement appelée Azure Active Directory) ?
- A) Microsoft Entra ID
- B) Active Directory Domain Services
- C) Windows Hello
- D) Microsoft Intune

**Réponse : A**

**Q2 :** Quel jeton SSO d'authentification Entra ID stocké en mémoire sur un poste Windows joint au domaine Cloud permet d'accéder à toutes les applications Microsoft 365 sans re-saisir de mot de passe ?
- A) PRT (Primary Refresh Token)
- B) Kerberos TGT
- C) Cookie HTML
- D) Clé SSH

**Réponse : A**

**Q3 :** Quelle puce matérielle cryptographique installée sur la carte mère des ordinateurs portables modernes permet de lier le PRT au processeur, empêchant son extraction par Mimikatz ?
- A) TPM 2.0 (Trusted Platform Module)
- B) Carte graphique GPU
- C) Puce Wi-Fi
- D) Carte son

**Réponse : A**

**Q4 :** Pourquoi les protocoles d'authentification hérités (Legacy Auth comme POP3/IMAP) doivent-ils être impérativement bloqués dans Entra ID ?
- A) Car ils ne supportent pas l'authentification multifacteur (MFA), permettant aux attaquants de contourner le MFA via des attaques par Password Spraying
- B) Car ils ralentissent la vitesse d'Internet
- C) Car ils sont payants
- D) Car ils sont réservés aux smartphones

**Réponse : A**

**Q5 :** Quel outil open-source basé sur Python permet d'explorer et de cartographier la structure d'un annuaire Microsoft Entra ID (Azure AD) via ses APIs Graph ?
- A) ROADtools / Roadrecon
- B) Nmap
- C) Wireshark
- D) Metasploit

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
