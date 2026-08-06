# TOME P5 — Cybersécurité Avancée & Red/Blue Team — Jour 208 (6h) : Ingénierie Sociale & Phishing Avancé (GoPhish, Evilginx2 Reverse Proxy, Bypass MFA & Security Awareness)

> [!NOTE]
> **Objectif du jour :** Maîtriser l'évaluation du facteur humain dans la sécurité de l'entreprise : déploiement de campagnes de **Phishing d'entreprise avec GoPhish**, contournement des mécanismes d'authentification multifacteur (MFA) via l'attaque par Reverse Proxy **Evilginx2 (Bypass MFA / Session Hijacking)**, scénarios de **Spear-Phishing**, et élaboration de programmes de sensibilisation (**Security Awareness**).
>
> **Compétences visées :** `SEC-06` (A) — Social Engineering & Phishing Simulations | `SEC-04` (A) — Advanced MFA Bypass Evilginx2 & Defense

---

## 1) Module — Ingénierie Sociale & Framework GoPhish (2h)

### 📖 Narration/Intuition

L'infrastructure technique la plus sécurisée de la BCC (firewalls NGFW, Kubernetes, chiffrement AES-256) peut être contournée en une seconde si un employé clique sur un lien malveillant ou saisit ses identifiants sur une fausse page de connexion. C'est l'**Ingénierie Sociale**.

**GoPhish** est le framework open-source d'ingénierie sociale de référence pour organiser des campagnes de simulation de phishing autorisées, mesurer le taux de vulnérabilité des employés et former le personnel.

### 🔍 Anatomie Technique

**Architecture d'une Campagne de Simulation Phishing avec GoPhish :**

```
┌─────────────────────────────────────────────────────────────┐
│                     GOPHISH SERVER                          │
│  - Template Email : "Mise à jour obligatoire mot de passe"  │
│  - Landing Page : Copie conforme du portail O365 / BCC      │
│  - Tracking Image : pixel transparent (1x1)                 │
│  - URL piège : https://login.bcc.cd.auth-update.net         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼ (Envoi via SMTP configuré)
┌─────────────────────────────────────────────────────────────┐
│                 COLLABORATEURS BCC (Cibles)                 │
│                                                             │
│  1. Email reçu ──► 2. Pixel chargé (Email Ouvert)           │
│  3. Clic sur le lien ──► 4. Formulaire rempli (Pwned!)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 TABLEAU DE BORD GOPHISH                     │
│  - Taux d'ouverture : 45%                                   │
│  - Taux de clic : 22%                                       │
│  - Taux de soumission d'identifiants : 12%                  │
│  ──► Inscription automatique des employés piégés à la       │
│      formation de sensibilisation à la cybersécurité        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2) Module — Bypass MFA avec Evilginx2 (Reverse Proxy Attack) (2h)

### 📖 Narration/Intuition

De nombreuses organisations croient que l'activation du **MFA (TOTP / SMS)** les rend 100% invulnérables au phishing. C'était vrai avec le phishing traditionnel, mais c'est faux face aux attaques modernes de type **Man-In-The-Middle (MITM) Reverse Proxy**.

**Evilginx2** (développé par Kuba Gretzky) s'intercale comme un reverse proxy transparent entre la victime et le vrai serveur d'authentification (ex: Microsoft 365, Keycloak, Okta). Il transmet en temps réel les requêtes et réponses, **y compris le code MFA saisi par la victime**. Une fois l'authentification validée par le vrai serveur, Evilginx2 intercepte et vole le **Cookie de Session (Session Cookie / Auth Token)** qui permet d'accéder au compte **sans avoir besoin de re-saisir le MFA**.

### 🔍 Anatomie Technique

**Schéma d'Attaque Evilginx2 (MFA Bypass via Session Cookie Hijacking) :**

```
VICTIME (Navigateur)              EVILGINX2 (Reverse Proxy)              VRAI SERVEUR (Microsoft 365)
     │                                      │                                       │
     │── 1. GET login.phish-bcc.cd ────────►│                                       │
     │   (Site piégé Evilginx2)             │── 2. GET login.microsoftonline.com ──►│
     │                                      │◄── 3. Affiche vraie page de login ────│
     │◄── 4. Transmet la vraie page ────────│                                       │
     │                                      │                                       │
     │── 5. Saisit User + Password ────────►│                                       │
     │                                      │── 6. Transmet User + Password ───────►│
     │                                      │◄── 7. Demande code MFA (TOTP/SMS) ────│
     │◄── 8. Demande code MFA à la victime ─│                                       │
     │                                      │                                       │
     │── 9. Saisit le code MFA (123456) ───►│                                       │
     │                                      │── 10. Transmet le code MFA ──────────►│
     │                                      │◄══ 11. AUTH VALIDÉE ! ════════════════│
     │                                      │    Envoie le Session Cookie HTTP-Only │
     │                                      │                                       │
     │                                      │ 🚨 EVILGINX2 CAPTURE ET STOCKE        │
     │                                      │    LE SESSION COOKIE EN MÉMOIRE !     │
     │                                      │                                       │
     │◄── 12. Redirige vers le vrai site ───│                                       │
```

**Commande d'inspection des Cookies de Session Capturés par Evilginx2 :**

```bash
# Dans le terminal Evilginx2 :
sessions

# Afficher les détails d'une session capturée (ID: 1)
sessions 1

# Output Evilginx2 :
# [15:30:12] [SUCCESS] Victim (192.168.1.50) successfully authenticated!
# Username: kabilaj@bcc.cd
# Password: Password2024!
# Captured Cookies:
#   - Name: ESTSAUTH
#     Value: 0.AXoA... (Cookie de session capturé — permet l'accès direct sans MFA!)
#   - Name: ESTSAUTHPERSISTENT
#     Value: 1.AXoA...
```

---

## 3) Module — Phishing Defense & FIDO2 / Passkeys (2h)

### 📖 Narration/Intuition

Comment protéger définitivement l'entreprise contre les attaques de Reverse Proxy Evilginx2 et le vol de cookies de session ?

La réponse technique absolue est le passage à l'authentification **Phishing-Resistant MFA : FIDO2 / Passkeys (WebAuthn)**.

### 🛠️ Atelier Pratique

**Pourquoi FIDO2 / Passkeys est 100% Invulnérable au Phishing Evilginx2 :**

```
FONCTIONNEMENT CRYPTOGRAPHIQUE FIDO2 / WEBAUTHN :
  1. Lors de l'authentification FIDO2, le navigateur web transmet au jeton de sécurité
     (YubiKey / Passkey) le domaine exact affiché dans la barre d'adresse (Origin Domain).
  
  2. Si l'utilisateur est sur le vrai site (login.microsoftonline.com) :
     - La YubiKey signe la requête avec la clé privée associée à login.microsoftonline.com.
     - L'authentification réussit.

  3. Si l'utilisateur est piégé sur le site Evilginx2 (login.phish-bcc.cd) :
     - Le navigateur transmet l'Origin Domain "phish-bcc.cd" à la YubiKey.
     - La YubiKey cherche une clé correspondant à "phish-bcc.cd" -> N'EXISTE PAS.
     - Même si elle signe pour "phish-bcc.cd", la signature est envoyée au vrai serveur Microsoft.
     - Le vrai serveur Microsoft rejette la signature car le domaine signé ("phish-bcc.cd")
       ne correspond PAS à son propre domaine ("login.microsoftonline.com") !
  
  Conclusion : L'attaque Evilginx2 échoue SILENCIEUSEMENT et TOTALEMENT.
```

---

## 🏅 Nouvelles Abréviations Rencontrées

| Abréviation | Signification |
|:---:|:---|
| **MFA** | Multi-Factor Authentication — Authentification à facteurs multiples |
| **FIDO2** | Fast Identity Online 2 — Standard mondial d'authentification forte sans mot de passe |
| **WebAuthn** | Web Authentication API — Standard W3C permettant l'authentification FIDO2 dans les navigateurs |
| **TOTP** | Time-based One-Time Password — Code à usage unique basé sur le temps (ex: Google Authenticator) |
| **MITM** | Man-In-The-Middle — Attaque par interception et retransmission transparente entre deux parties |

---

## 🏋️ Exercices & Corrigés

**Exercice 1 :** Expliquer pourquoi les codes à usage unique **TOTP (Google Authenticator)** et les **SMS** ne sont PAS résistants au phishing face à un Reverse Proxy comme **Evilginx2**.

**Corrigé :** Les codes TOTP et SMS sont des facteurs d'authentification basés sur la saisie manuelle de valeurs par l'utilisateur. Lorsqu'un utilisateur est piégé par un Reverse Proxy Evilginx2 (qui relaie les requêtes en temps réel vers le vrai serveur), l'utilisateur saisit son login, son mot de passe ET son code TOTP/SMS sur la fausse page. Evilginx2 transmet **immédiatement** ce code TOTP au vrai serveur d'authentification pendant sa fenêtre de validité (30 secondes). Le vrai serveur valide le code et émet le **Cookie de Session HTTP**. Evilginx2 capture ce cookie de session et le stocke. L'attaquant importe ce cookie dans son propre navigateur et prend le contrôle complet du compte sans avoir besoin de connaître le futur code TOTP. Le TOTP n'a aucun moyen cryptographique de vérifier le domaine web sur lequel il est saisi.

**Exercice 2 :** Pourquoi la norme **FIDO2 / Passkeys (WebAuthn)** est-elle qualifiée de "Phishing-Resistant" (résistante au phishing) par la CISA et la NSI ?

**Corrigé :** FIDO2 / WebAuthn est qualifié de **Phishing-Resistant** car l'authentification est liée cryptographiquement au nom de domaine exact (Origin Domain) de l'application web, vérifié directement par le navigateur. Lors du processus d'authentification, le navigateur lit l'origine HTTPS réelle (ex: `login.microsoftonline.com`) et la transmet à l'authentificateur FIDO2 (YubiKey / Puce TPM). L'authentificateur signe le challenge uniquement pour ce domaine précis. Si l'utilisateur est sur un site de phishing (ex: `login.evil-domain.com`), le navigateur transmet cette fausse origine. La signature générée pour `evil-domain.com` sera rejetée par le vrai serveur d'authentification. Aucune manipulation humaine ne peut forcer la YubiKey à valider un mauvais domaine.

---

## ❓ Banque de Questions & Test du Jour

**Q1 :** Quel framework d'ingénierie sociale open-source est utilisé pour créer et suivre des campagnes de simulation de phishing d'entreprise avec dashboards de statistiques ?
- A) GoPhish
- B) Nmap
- C) Wireshark
- D) Metasploit

**Réponse : A**

**Q2 :** Quel outil développé par Kuba Gretzky utilise la technique du Reverse Proxy MITM pour intercepter les cookies de session et contourner l'authentification MFA (TOTP/SMS) ?
- A) Evilginx2
- B) Burp Suite
- C) John the Ripper
- D) Hashcat

**Réponse : A**

**Q3 :** Quel standard d'authentification forte (sans mot de passe) basé sur la cryptographie asymétrique et lié au domaine web est considéré comme le seul moyen d'authentification 100% Phishing-Resistant ?
- A) FIDO2 / Passkeys (WebAuthn)
- B) Les codes SMS
- C) Les codes TOTP (Google Authenticator)
- D) Les mots de passe complexes de 16 caractères

**Réponse : A**

**Q4 :** Qu'est-ce qu'un **Spear-Phishing** par opposition à un phishing classique ?
- A) Une attaque de phishing hautement ciblée et personnalisée vers une personne ou une entreprise spécifique à partir d'informations OSINT
- B) Un phishing envoyé à 1 million de personnes au hasard
- C) Un virus informatique sur clé USB
- D) Un appel téléphonique automatisé

**Réponse : A**

**Q5 :** Dans une attaque Evilginx2 réussie, que vole l'attaquant pour accéder au compte de la victime sans avoir besoin de connaître son mot de passe ni son code MFA ?
- A) Le Cookie de Session (Session Cookie / Auth Token)
- B) L'adresse MAC du client
- C) Le fichier de configuration du routeur
- D) Le numéro de série du processeur

**Réponse : A**

---

*(Le composant d'évaluation exigeant 75% minimum s'affiche ci-dessous)*
